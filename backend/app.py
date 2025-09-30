from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
import os
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()  # Carrega as variáveis de ambiente do arquivo .env

# Importa o db do models.py atualizado
from models import db, User, Plan, SpiritualMetric, AIConversation, Gamification, Payment


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configurações do banco de dados
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "mysql+pymysql://root:root_password@db/ilyra_db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    # Configurações JWT
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-jwt-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)

    # Configuração de Rate Limiting
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://", # Pode ser configurado para Redis em produção
        strategy="fixed-window"
    )

    # ==================== IMPORTAÇÃO DE BLUEPRINTS ====================
    # Rotas básicas funcionais
    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.spiritual_metrics_routes import spiritual_metrics_bp
    from routes.ai_routes import ai_bp
    from routes.plan_routes import plan_bp
    from routes.gamification_routes import gamification_bp

    # ==================== REGISTRO DE BLUEPRINTS ====================
    # Rotas básicas funcionais
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(spiritual_metrics_bp, url_prefix="/metrics")
    app.register_blueprint(ai_bp, url_prefix="/ai")
    app.register_blueprint(plan_bp, url_prefix="/plan")
    app.register_blueprint(gamification_bp, url_prefix="/gamification")
    from routes.admin_routes import admin_bp
    app.register_blueprint(admin_bp, url_prefix="/admin")
    from routes.social_auth_routes import social_auth_bp
    app.register_blueprint(social_auth_bp, url_prefix="/social-auth")
    from routes.analytics_routes import analytics_bp
    app.register_blueprint(analytics_bp, url_prefix="/analytics")
    from routes.deploy_routes import deploy_bp
    app.register_blueprint(deploy_bp, url_prefix="/deploy")

    # ==================== ROTAS PRINCIPAIS ====================

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Verificação de saúde da aplicação"""
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.datetime.now().isoformat(),
            "version": "2.0.0",
            "features": {
                "authentication": True,
                "ai_integration": True,
                "spiritual_metrics": True,
                "payment_system": True,
                "admin_panel": True,
                "lgpd_compliance": True,
                "gamification": True,
                "pdf_export": True
            }
        }), 200

    @app.route("/api/system/info", methods=["GET"])
    def system_info():
        """Informações do sistema"""
        try:
            # Estatísticas básicas
            total_users = User.query.count()
            total_metrics = SpiritualMetric.query.count()
            total_plans = Plan.query.count()
            
            return jsonify({
                "system": {
                    "name": "iLyra Platform",
                    "version": "2.0.0",
                    "environment": "production",
                    "database": "connected",
                    "ai_integration": "active"
                },
                "statistics": {
                    "users": {
                        "total": total_users,
                        "active": User.query.filter_by(role='user').count() # Exemplo de filtro
                    },
                    "metrics": {
                        "total": total_metrics,
                        "active": total_metrics # Ajustar conforme lógica de métricas ativas
                    },
                    "plans": {
                        "total": total_plans
                    }
                },
                "features": {
                    "authentication": "JWT",
                    "ai_models": ["Gemini", "GPT-4", "Claude"],
                    "payment_gateways": ["Stripe", "Mercado Pago", "PayPal"],
                    "export_formats": ["PDF", "JSON", "CSV"],
                    "compliance": ["LGPD", "GDPR"]
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                "system": {
                    "name": "iLyra Platform",
                    "version": "2.0.0",
                    "status": "error",
                    "error": str(e)
                }
            }), 500

    @app.route("/api/routes", methods=["GET"])
    def list_routes():
        """Listar todas as rotas disponíveis (apenas para desenvolvimento)"""
        try:
            routes = []
            for rule in app.url_map.iter_rules():
                if rule.endpoint != 'static':
                    routes.append({
                        'endpoint': rule.endpoint,
                        'methods': list(rule.methods),
                        'path': str(rule)
                    })
            
            # Organizar por categoria
            categorized_routes = {
                'auth': [r for r in routes if '/auth' in r['path']],
                'user': [r for r in routes if '/user' in r['path']],
                'admin': [r for r in routes if '/admin' in r['path']],
                'ai': [r for r in routes if '/ai' in r['path'] or '/gemini' in r['path']],
                'payments': [r for r in routes if '/payment' in r['path']],
                'metrics': [r for r in routes if '/metric' in r['path']],
                'gamification': [r for r in routes if '/gamification' in r['path']],
                'lgpd': [r for r in routes if '/lgpd' in r['path']],
                'system': [r for r in routes if r['path'] in ['/api/health', '/api/system/info', '/api/routes']],
                'other': [r for r in routes if not any(cat in r['path'] for cat in ['auth', 'user', 'admin', 'ai', 'gemini', 'payment', 'metric', 'gamification', 'lgpd']) and r['path'] not in ['/api/health', '/api/system/info', '/api/routes']]
            }
            
            return jsonify({
                "total_routes": len(routes),
                "categories": categorized_routes
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # ==================== MIDDLEWARE E HANDLERS ====================

    @app.before_request
    def before_request():
        """Middleware executado antes de cada requisição"""
        # Log de requisições (apenas em desenvolvimento)
        if app.debug:
            app.logger.info(f"{request.method} {request.path} - {request.remote_addr}")

    @app.after_request
    def after_request(response):
        """Middleware executado após cada requisição"""
        # Headers de segurança
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        return response

    @app.errorhandler(404)
    def not_found(error):
        """Handler para erro 404"""
        return jsonify({
            "error": "Endpoint não encontrado",
            "message": "A rota solicitada não existe",
            "status_code": 404
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        """Handler para erro 500"""
        return jsonify({
            "error": "Erro interno do servidor",
            "message": "Ocorreu um erro inesperado",
            "status_code": 500
        }), 500

    @app.errorhandler(403)
    def forbidden(error):
        """Handler para erro 403"""
        return jsonify({
            "error": "Acesso negado",
            "message": "Você não tem permissão para acessar este recurso",
            "status_code": 403
        }), 403

    @app.errorhandler(401)
    def unauthorized(error):
        """Handler para erro 401"""
        return jsonify({
            "error": "Não autorizado",
            "message": "Token de autenticação inválido ou expirado",
            "status_code": 401
        }), 401

    # Handler para erros de Rate Limiting
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({
            "error": "Too Many Requests",
            "message": "Você excedeu o limite de requisições. Tente novamente mais tarde.",
            "status_code": 429
        }), 429

    return app

# ==================== INICIALIZAÇÃO ====================

def create_initial_data(app):
    """Criar dados iniciais se necessário"""
    try:
        with app.app_context():
            # Verificar se já existem dados
            if User.query.count() == 0:
                # Criar usuário administrador padrão
                from werkzeug.security import generate_password_hash
                
                admin_user = User(
                    username='admin',
                    email='admin@ilyra.com',
                    password_hash=generate_password_hash('admin123'),
                    role='admin',
                    created_at=datetime.datetime.now()
                )
                
                db.session.add(admin_user)
                db.session.commit()
                
                print("Usuário administrador criado: admin@ilyra.com / admin123")
            
            # Verificar planos de assinatura
            if Plan.query.count() == 0:
                plans_data = [
                    {
                        'name': 'Free',
                        'price': 0.0,
                        'features': 'Basic access, 1 AI chat per day'
                    },
                    {
                        'name': 'Premium',
                        'price': 9.99,
                        'features': 'Full access, unlimited AI chat, advanced metrics'
                    }
                ]
                
                for plan_data in plans_data:
                    plan = Plan(
                        name=plan_data['name'],
                        price=plan_data['price'],
                        features=plan_data['features']
                    )
                    db.session.add(plan)
                
                db.session.commit()
                print("Planos de assinatura criados")
                
    except Exception as e:
        print(f"Erro ao criar dados iniciais: {e}")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  # Cria as tabelas se não existirem
        create_initial_data(app)  # Cria dados iniciais
    
    print("🚀 Servidor iLyra COMPLETO iniciado!")
    print("🔧 Backend API: http://localhost:5000")
    
    app.run(debug=True, host="0.0.0.0", port=5000)

