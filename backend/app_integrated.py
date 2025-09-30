from flask import Flask, jsonify, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
import os
import logging
from datetime import datetime, timedelta
import redis

# Importar modelos e configurações
from models import db, User, SpiritualMetric, AIConversation, Gamification, Plan, Subscription
from middleware import (
    standard_api, 
    api_response, 
    pagination_helper,
    cors_middleware,
    auth_required,
    admin_required,
    rate_limit,
    handle_errors,
    log_request
)

# Importar todas as rotas
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.spiritual_metrics_routes import spiritual_metrics_bp
from routes.ai_routes import ai_bp
from routes.plan_routes import plan_bp
from routes.gamification_routes import gamification_bp
from routes.payment_routes import payment_bp
from routes.admin_routes import admin_bp
from routes.social_auth_routes import social_auth_bp
from routes.analytics_routes import analytics_bp
from routes.deploy_routes import deploy_bp
from routes.payment_routes import init_mercadopago_sdk

# Importar sistemas de IA
from multi_ai_system import multi_ai_system
from ai_cost_monitor import cost_monitor
from ai_training_system import run_daily_training

def create_app(config_name='development'):
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__)
    
    # Configurações
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'ilyra-secret-key-2025')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 
        'mysql+pymysql://ilyra_user:ilyra_password@localhost/ilyra_db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0
    }
    
    # Configurações de cache
    app.config['CACHE_TYPE'] = 'redis'
    app.config['CACHE_REDIS_URL'] = os.environ.get('REDIS_URL', 'redis://localhost:6379/1')
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300
    
    # Configurações de upload
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
    
    # Configurações de IA
    app.config['GOOGLE_API_KEY'] = os.environ.get('GOOGLE_API_KEY')
    app.config['OPENAI_API_KEY'] = os.environ.get('OPENAI_API_KEY')
    app.config['ANTHROPIC_API_KEY'] = os.environ.get('ANTHROPIC_API_KEY')
    
    # Configurações de pagamento
    app.config['STRIPE_SECRET_KEY'] = os.environ.get('STRIPE_SECRET_KEY')
    app.config['STRIPE_PUBLIC_KEY'] = os.environ.get('STRIPE_PUBLIC_KEY')
    app.config['MERCADOPAGO_ACCESS_TOKEN'] = os.environ.get('MERCADOPAGO_ACCESS_TOKEN')
    
    # Configurar logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s %(message)s'
    )
    
    # Inicializar extensões
    db.init_app(app)
    migrate = Migrate(app, db)

    # Inicializar SDK do Mercado Pago
    init_mercadopago_sdk(app)

    
    # Configurar CORS
    CORS(app, 
         origins=['http://localhost:3000', 'https://ilyra.com'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
    
    # Configurar Rate Limiting
    limiter = Limiter(key_func=get_remote_address, default_limits=["1000 per hour"])
    limiter.init_app(app)

    
    # Configurar Cache
    cache = Cache(app)
    
    # Middleware global para todas as requisições
    @app.before_request
    def before_request():
        """Middleware executado antes de cada requisição"""
        g.start_time = datetime.utcnow()
        
        # Log da requisição
        app.logger.info(f"REQUEST: {request.method} {request.path} - IP: {request.remote_addr}")
        
        # Verificar manutenção
        if os.environ.get('MAINTENANCE_MODE') == 'true':
            if request.path not in ['/health', '/status']:
                return jsonify({
                    'message': 'Sistema em manutenção',
                    'maintenance': True
                }), 503
    
    @app.after_request
    def after_request(response):
        """Middleware executado após cada requisição"""
        # Calcular tempo de resposta
        if hasattr(g, 'start_time'):
            duration = (datetime.utcnow() - g.start_time).total_seconds() * 1000
            response.headers['X-Response-Time'] = f"{duration:.2f}ms"
        
        # Headers de segurança
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Log da resposta
        app.logger.info(f"RESPONSE: {request.method} {request.path} - {response.status_code}")
        
        return response
    
    # Tratamento global de erros
    @app.errorhandler(400)
    def bad_request(error):
        return api_response(message="Requisição inválida", status_code=400)
    
    @app.errorhandler(401)
    def unauthorized(error):
        return api_response(message="Não autorizado", status_code=401)
    
    @app.errorhandler(403)
    def forbidden(error):
        return api_response(message="Acesso negado", status_code=403)
    
    @app.errorhandler(404)
    def not_found(error):
        return api_response(message="Recurso não encontrado", status_code=404)
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return api_response(message="Muitas requisições", status_code=429)
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return api_response(message="Erro interno do servidor", status_code=500)
    
    # Rotas de saúde e status
    @app.route('/health')
    @standard_api(require_auth=False, cache_duration=60)
    def health_check():
        """Verificação de saúde da aplicação"""
        try:
            # Verificar banco de dados
            db.session.execute('SELECT 1')
            db_status = 'healthy'
        except Exception as e:
            db_status = f'unhealthy: {str(e)}'
        
        # Verificar Redis
        try:
            redis_client = redis.Redis.from_url(app.config['CACHE_REDIS_URL'])
            redis_client.ping()
            redis_status = 'healthy'
        except Exception as e:
            redis_status = f'unhealthy: {str(e)}'
        
        # Verificar IA
        ai_status = 'healthy' if app.config.get('GOOGLE_API_KEY') else 'no_api_key'
        
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'services': {
                'database': db_status,
                'redis': redis_status,
                'ai': ai_status
            }
        }
        
        overall_status = 200 if all('healthy' in status for status in [db_status, redis_status]) else 503
        
        return api_response(data=health_data, status_code=overall_status)
    
    @app.route('/status')
    @standard_api(require_auth=False)
    def status():
        """Status detalhado da aplicação"""
        return api_response(data={
            'app_name': 'iLyra API',
            'version': '1.0.0',
            'environment': os.environ.get('FLASK_ENV', 'development'),
            'timestamp': datetime.utcnow().isoformat(),
            'uptime': 'N/A',  # Implementar se necessário
            'features': {
                'ai_enabled': bool(app.config.get('GOOGLE_API_KEY')),
                'payments_enabled': bool(app.config.get('STRIPE_SECRET_KEY')),
                'cache_enabled': True,
                'rate_limiting_enabled': True
            }
        })
    
    # Rota para informações da API
    @app.route('/api/info')
    @standard_api(require_auth=False, cache_duration=3600)
    def api_info():
        """Informações sobre a API"""
        return api_response(data={
            'name': 'iLyra API',
            'version': '1.0.0',
            'description': 'API para plataforma de crescimento espiritual com IA',
            'endpoints': {
                'auth': '/api/auth/*',
                'users': '/api/users/*',
                'metrics': '/api/spiritual-metrics/*',
                'ai': '/api/ai/*',
                'plans': '/api/plans/*',
                'payments': '/api/payments/*',
                'gamification': '/api/gamification/*',
                'admin': '/api/admin/*'
            },
            'documentation': 'https://docs.ilyra.com',
            'support': 'https://help.ilyra.com'
        })
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(spiritual_metrics_bp, url_prefix='/api/spiritual-metrics')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(plan_bp, url_prefix='/api/plans')
    app.register_blueprint(gamification_bp, url_prefix='/api/gamification')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(social_auth_bp, url_prefix='/api/social-auth')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(deploy_bp, url_prefix='/api/deploy')
    
    # Comandos CLI personalizados
    @app.cli.command()
    def init_db():
        """Inicializar banco de dados"""
        db.create_all()
        print("Banco de dados inicializado!")
    
    @app.cli.command()
    def seed_db():
        """Popular banco de dados com dados iniciais"""
        # Criar usuário admin padrão
        admin_user = User(
            username='admin',
            email='admin@ilyra.com',
            password_hash='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS',  # admin123
            is_admin=True,
            is_active=True
        )
        
        # Criar planos padrão
        free_plan = Plan(
            name='Gratuito',
            description='Plano básico gratuito',
            price=0.0,
            features=['5 métricas por dia', 'Chat IA básico', 'Relatórios simples']
        )
        
        premium_plan = Plan(
            name='Premium',
            description='Plano premium com recursos avançados',
            price=29.90,
            features=['Métricas ilimitadas', 'Chat IA avançado', 'Relatórios detalhados', 'Insights personalizados']
        )
        
        enterprise_plan = Plan(
            name='Enterprise',
            description='Plano empresarial com todos os recursos',
            price=99.90,
            features=['Todos os recursos Premium', 'API access', 'Suporte prioritário', 'Customizações']
        )
        
        try:
            db.session.add(admin_user)
            db.session.add(free_plan)
            db.session.add(premium_plan)
            db.session.add(enterprise_plan)
            db.session.commit()
            print("Dados iniciais inseridos!")
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao inserir dados: {e}")
    
    @app.cli.command()
    def train_ai():
        """Treinar sistema de IA"""
        result = run_daily_training()
        print(f"Treinamento de IA concluído: {result}")
    
    @app.cli.command()
    def reset_ai_health():
        """Resetar status de saúde dos modelos de IA"""
        multi_ai_system.reset_model_health()
        print("Status de saúde dos modelos de IA resetado!")
    
    # Tarefas agendadas (se usando Celery)
    def setup_scheduled_tasks():
        """Configurar tarefas agendadas"""
        # Implementar com Celery se necessário
        pass
    
    # Inicializar dados se necessário
    with app.app_context():
        try:
            # Criar tabelas se não existirem
            db.create_all()
            
            # Verificar se há dados iniciais
            if User.query.count() == 0:
                print("Banco vazio - execute 'flask seed-db' para popular com dados iniciais")
                
        except Exception as e:
            print(f"Erro na inicialização: {e}")
    
    return app

# Criar aplicação
app = create_app()

# Configurações específicas para desenvolvimento
if __name__ == '__main__':
    # Configurações de desenvolvimento
    app.config['DEBUG'] = True
    app.config['TESTING'] = False
    
    # Executar aplicação
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True,
        threaded=True
    )

# Configurações para produção (Gunicorn)
def create_production_app():
    """Criar aplicação para produção"""
    app = create_app('production')
    
    # Configurações específicas de produção
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
    
    # Configurar logging para produção
    if not app.debug:
        import logging
        from logging.handlers import RotatingFileHandler
        
        file_handler = RotatingFileHandler(
            'logs/ilyra.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('iLyra API startup')
    
    return app

# Para uso com Gunicorn
application = create_production_app()
