"""
iLyra Platform - Backend Simplificado
Aplicação Flask com funcionalidades essenciais para testes de integração
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
import os
import json

def create_app():
    app = Flask(__name__)
    
    # Configurações básicas
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'ilyra-secret-key-2025')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)
    
    # Inicializar extensões
    CORS(app)
    jwt = JWTManager(app)
    
    # ==================== ROTAS DE AUTENTICAÇÃO ====================
    
    @app.route("/auth/login", methods=["POST"])
    def login():
        """Login simplificado para testes"""
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Validação simples para testes
        if email == "admin@ilyra.com" and password == "admin123":
            access_token = create_access_token(identity=email)
            return jsonify({
                "access_token": access_token,
                "user": {
                    "id": 1,
                    "email": email,
                    "name": "Admin iLyra",
                    "plan": "Premium"
                }
            }), 200
        
        return jsonify({"error": "Credenciais inválidas"}), 401
    
    @app.route("/auth/register", methods=["POST"])
    def register():
        """Registro simplificado para testes"""
        data = request.get_json()
        return jsonify({
            "message": "Usuário registrado com sucesso",
            "user": {
                "id": 2,
                "email": data.get('email'),
                "name": data.get('name', 'Novo Usuário'),
                "plan": "Free"
            }
        }), 201
    
    # ==================== ROTAS DE MÉTRICAS ESPIRITUAIS ====================
    
    @app.route("/api/metrics/spiritual", methods=["GET"])
    @jwt_required()
    def get_spiritual_metrics():
        """Obter métricas espirituais em tempo real"""
        return jsonify({
            "spiritual_level": 85,
            "meditation_streak": 12,
            "gratitude_index": 92,
            "mindfulness": 77.54,
            "vital_energy": 87.16,
            "inner_peace": 95,
            "compassion_level": 82,
            "wisdom_points": 156,
            "daily_goals": {
                "morning_meditation": {"completed": True, "duration": 20},
                "daily_gratitude": {"completed": True, "duration": 5},
                "evening_reflection": {"completed": False, "duration": 15},
                "mindfulness_exercise": {"completed": False, "duration": 10}
            },
            "weekly_insights": [
                {"day": "Segunda", "meditation": 25, "gratitude": 30, "energy": 35},
                {"day": "Terça", "meditation": 20, "gratitude": 25, "energy": 30},
                {"day": "Quarta", "meditation": 30, "gratitude": 35, "energy": 40},
                {"day": "Quinta", "meditation": 15, "gratitude": 20, "energy": 25},
                {"day": "Sexta", "meditation": 35, "gratitude": 40, "energy": 45},
                {"day": "Sábado", "meditation": 40, "gratitude": 35, "energy": 50},
                {"day": "Domingo", "meditation": 30, "gratitude": 30, "energy": 35}
            ],
            "last_updated": datetime.datetime.now().isoformat(),
            "ai_sync": True,
            "system_status": "Ativo",
            "version": "2.0"
        })
    
    @app.route("/api/metrics/update", methods=["POST"])
    @jwt_required()
    def update_metrics():
        """Atualizar métricas espirituais"""
        data = request.get_json()
        return jsonify({
            "message": "Métricas atualizadas com sucesso",
            "updated_at": datetime.datetime.now().isoformat(),
            "data": data
        })
    
    # ==================== ROTAS DE IA ====================
    
    @app.route("/api/ai/chat", methods=["POST"])
    @jwt_required()
    def ai_chat():
        """Chat com IA espiritual"""
        data = request.get_json()
        message = data.get('message', '')
        
        # Respostas simuladas da IA
        responses = [
            "Sua energia está em harmonia hoje. Continue praticando a gratidão para elevar ainda mais sua vibração espiritual.",
            "Percebo que você está buscando paz interior. Que tal dedicar 10 minutos à meditação mindfulness?",
            "Sua jornada espiritual está florescendo. Lembre-se: cada momento de consciência é um passo em direção à iluminação.",
            "Sinto uma bela evolução em sua aura. Sua prática de compaixão está gerando frutos maravilhosos.",
            "O universo está conspirando a seu favor. Mantenha-se aberto às sincronicidades que surgirão hoje."
        ]
        
        import random
        response = random.choice(responses)
        
        return jsonify({
            "response": response,
            "timestamp": datetime.datetime.now().isoformat(),
            "model": "Gemini Pro",
            "mood": "enlightened",
            "energy_boost": "+5 Energia Vital"
        })
    
    # ==================== ROTAS DE PAGAMENTO ====================
    
    @app.route("/api/payment/plans", methods=["GET"])
    def get_plans():
        """Obter planos disponíveis"""
        return jsonify({
            "plans": [
                {
                    "id": 1,
                    "name": "Free",
                    "price": 0,
                    "currency": "BRL",
                    "features": ["Métricas básicas", "Chat IA limitado", "5 meditações/mês"],
                    "popular": False
                },
                {
                    "id": 2,
                    "name": "Essential",
                    "price": 29.90,
                    "currency": "BRL",
                    "features": ["Métricas avançadas", "Chat IA ilimitado", "Meditações premium"],
                    "popular": True
                },
                {
                    "id": 3,
                    "name": "Premium",
                    "price": 59.90,
                    "currency": "BRL",
                    "features": ["Todas as funcionalidades", "Coaching personalizado", "Relatórios avançados"],
                    "popular": False
                }
            ]
        })
    
    @app.route("/api/payment/stripe/create-session", methods=["POST"])
    @jwt_required()
    def create_stripe_session():
        """Criar sessão de pagamento Stripe"""
        data = request.get_json()
        plan_id = data.get('plan_id')
        
        return jsonify({
            "session_id": f"cs_test_stripe_session_{plan_id}_{datetime.datetime.now().timestamp()}",
            "url": f"https://checkout.stripe.com/pay/cs_test_stripe_session_{plan_id}",
            "status": "created"
        })
    
    @app.route("/api/payment/mercadopago/create-preference", methods=["POST"])
    @jwt_required()
    def create_mercadopago_preference():
        """Criar preferência de pagamento Mercado Pago"""
        data = request.get_json()
        plan_id = data.get('plan_id')
        
        return jsonify({
            "preference_id": f"mp_pref_{plan_id}_{datetime.datetime.now().timestamp()}",
            "init_point": f"https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mp_pref_{plan_id}",
            "status": "created"
        })
    
    @app.route("/api/payment/paypal/create-order", methods=["POST"])
    @jwt_required()
    def create_paypal_order():
        """Criar ordem de pagamento PayPal"""
        data = request.get_json()
        plan_id = data.get('plan_id')
        
        return jsonify({
            "order_id": f"paypal_order_{plan_id}_{datetime.datetime.now().timestamp()}",
            "approval_url": f"https://www.paypal.com/checkoutnow?token=paypal_order_{plan_id}",
            "status": "created"
        })
    
    # ==================== ROTAS DE SAÚDE ====================
    
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Verificação de saúde da aplicação"""
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.datetime.now().isoformat(),
            "version": "2.0.0",
            "features": {
                "authentication": True,
                "spiritual_metrics": True,
                "ai_chat": True,
                "payment_gateways": {
                    "stripe": True,
                    "mercadopago": True,
                    "paypal": True
                }
            }
        })
    
    @app.route("/", methods=["GET"])
    def root():
        """Rota raiz"""
        return jsonify({
            "message": "iLyra Platform API",
            "version": "2.0.0",
            "status": "running",
            "endpoints": [
                "/auth/login",
                "/auth/register", 
                "/api/metrics/spiritual",
                "/api/ai/chat",
                "/api/payment/plans",
                "/api/health"
            ]
        })
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
