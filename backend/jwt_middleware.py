"""
Middleware JWT para iLyra Platform
Implementação completa de verificação de blacklist e controle de tokens
"""

from flask_jwt_extended import JWTManager
from flask import jsonify
from security_service import security_service
from models import BlacklistedToken
from datetime import datetime

def setup_jwt_callbacks(jwt_manager):
    """Configurar callbacks do JWT Manager"""
    
    @jwt_manager.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        """Verificar se token está na blacklist"""
        jti = jwt_payload['jti']
        
        # Verificar na blacklist em memória (compatibilidade)
        from routes.auth_routes import blacklisted_tokens
        if jti in blacklisted_tokens:
            return True
        
        # Verificar na blacklist do banco de dados
        return security_service.is_token_blacklisted(jti)
    
    @jwt_manager.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """Callback para token expirado"""
        return jsonify({
            'error': 'Token expirado',
            'message': 'O token de acesso expirou. Faça login novamente.'
        }), 401
    
    @jwt_manager.invalid_token_loader
    def invalid_token_callback(error):
        """Callback para token inválido"""
        return jsonify({
            'error': 'Token inválido',
            'message': 'Token de acesso inválido. Faça login novamente.'
        }), 401
    
    @jwt_manager.unauthorized_loader
    def missing_token_callback(error):
        """Callback para token ausente"""
        return jsonify({
            'error': 'Token ausente',
            'message': 'Token de acesso é obrigatório para esta operação.'
        }), 401
    
    @jwt_manager.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        """Callback para token que precisa ser fresh"""
        return jsonify({
            'error': 'Token não é fresh',
            'message': 'Esta operação requer um token fresh. Faça login novamente.'
        }), 401
    
    @jwt_manager.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        """Callback para token revogado"""
        return jsonify({
            'error': 'Token revogado',
            'message': 'Token foi revogado. Faça login novamente.'
        }), 401
    
    @jwt_manager.user_identity_loader
    def user_identity_lookup(user):
        """Definir identidade do usuário no token"""
        return user.id if hasattr(user, 'id') else user
    
    @jwt_manager.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """Carregar usuário a partir do token"""
        from models import User
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()
    
    @jwt_manager.additional_claims_loader
    def add_claims_to_jwt(identity):
        """Adicionar claims adicionais ao token"""
        from models import User
        user = User.query.get(identity)
        
        if user:
            return {
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'email_verified': user.email_verified,
                'plan': user.plan.name if user.plan else None
            }
        
        return {}
    
    return jwt_manager

def cleanup_expired_tokens():
    """Função para limpeza periódica de tokens expirados"""
    try:
        # Limpar tokens blacklistados expirados
        security_service.cleanup_expired_blacklisted_tokens()
        
        # Limpar tokens de email e reset expirados
        from email_service import email_service
        email_service.cleanup_expired_tokens()
        
        print(f"Limpeza de tokens executada em {datetime.utcnow()}")
        return True
        
    except Exception as e:
        print(f"Erro na limpeza de tokens: {str(e)}")
        return False
