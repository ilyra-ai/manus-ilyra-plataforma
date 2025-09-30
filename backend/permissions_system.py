"""
Sistema de Controle de Permissões para iLyra Platform
Implementação completa de controle granular de acesso e permissões
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from models import User, Plan
import json
from datetime import datetime
from security_service import security_service

class Permission:
    """Classe para definir permissões"""
    
    # Permissões básicas
    READ_OWN_DATA = "read_own_data"
    UPDATE_OWN_DATA = "update_own_data"
    DELETE_OWN_DATA = "delete_own_data"
    EXPORT_OWN_DATA = "export_own_data"
    
    # Permissões de métricas espirituais
    CREATE_SPIRITUAL_METRICS = "create_spiritual_metrics"
    READ_SPIRITUAL_METRICS = "read_spiritual_metrics"
    UPDATE_SPIRITUAL_METRICS = "update_spiritual_metrics"
    DELETE_SPIRITUAL_METRICS = "delete_spiritual_metrics"
    EXPORT_SPIRITUAL_METRICS = "export_spiritual_metrics"
    
    # Permissões de IA
    USE_AI_CHAT = "use_ai_chat"
    ACCESS_AI_HISTORY = "access_ai_history"
    EXPORT_AI_CONVERSATIONS = "export_ai_conversations"
    USE_PREMIUM_AI_MODELS = "use_premium_ai_models"
    UNLIMITED_AI_USAGE = "unlimited_ai_usage"
    
    # Permissões administrativas
    ADMIN_READ_USERS = "admin_read_users"
    ADMIN_CREATE_USERS = "admin_create_users"
    ADMIN_UPDATE_USERS = "admin_update_users"
    ADMIN_DELETE_USERS = "admin_delete_users"
    ADMIN_MANAGE_PLANS = "admin_manage_plans"
    ADMIN_VIEW_ANALYTICS = "admin_view_analytics"
    ADMIN_MANAGE_PAYMENTS = "admin_manage_payments"
    ADMIN_SYSTEM_CONFIG = "admin_system_config"
    ADMIN_AUDIT_LOGS = "admin_audit_logs"
    ADMIN_LGPD_MANAGEMENT = "admin_lgpd_management"
    
    # Permissões de planos
    UPGRADE_PLAN = "upgrade_plan"
    MANAGE_PLANS = "manage_plans"
    VIEW_FINANCIAL_REPORTS = "view_financial_reports"
    EXPORT_FINANCIAL_REPORTS = "export_financial_reports"
    MANAGE_SUBSCRIPTIONS = "manage_subscriptions"
    PROCESS_PAYMENTS = "process_payments"
    DOWNGRADE_PLAN = "downgrade_plan"
    CANCEL_SUBSCRIPTION = "cancel_subscription"
    VIEW_SUBSCRIPTION_ANALYTICS = "view_subscription_analytics"
    
    # Permissões de relatórios
    GENERATE_BASIC_REPORTS = "generate_basic_reports"
    GENERATE_ADVANCED_REPORTS = "generate_advanced_reports"
    GENERATE_CUSTOM_REPORTS = "generate_custom_reports"
    
    # Permissões de integração
    API_ACCESS = "api_access"
    WEBHOOK_ACCESS = "webhook_access"
    THIRD_PARTY_INTEGRATIONS = "third_party_integrations"

class PermissionManager:
    """Gerenciador de permissões"""
    
    def __init__(self):
        self.plan_permissions = self._define_plan_permissions()
        self.role_permissions = self._define_role_permissions()
    
    def _define_plan_permissions(self):
        """Definir permissões por plano"""
        return {
            'Free': [
                Permission.READ_OWN_DATA,
                Permission.UPDATE_OWN_DATA,
                Permission.EXPORT_OWN_DATA,
                Permission.CREATE_SPIRITUAL_METRICS,
                Permission.READ_SPIRITUAL_METRICS,
                Permission.UPDATE_SPIRITUAL_METRICS,
                Permission.DELETE_SPIRITUAL_METRICS,
                Permission.USE_AI_CHAT,
                Permission.ACCESS_AI_HISTORY,
                Permission.GENERATE_BASIC_REPORTS,
                Permission.UPGRADE_PLAN
            ],
            'Essential': [
                # Todas as permissões do Free
                Permission.READ_OWN_DATA,
                Permission.UPDATE_OWN_DATA,
                Permission.DELETE_OWN_DATA,
                Permission.EXPORT_OWN_DATA,
                Permission.CREATE_SPIRITUAL_METRICS,
                Permission.READ_SPIRITUAL_METRICS,
                Permission.UPDATE_SPIRITUAL_METRICS,
                Permission.DELETE_SPIRITUAL_METRICS,
                Permission.EXPORT_SPIRITUAL_METRICS,
                Permission.USE_AI_CHAT,
                Permission.ACCESS_AI_HISTORY,
                Permission.EXPORT_AI_CONVERSATIONS,
                Permission.GENERATE_BASIC_REPORTS,
                Permission.GENERATE_ADVANCED_REPORTS,
                Permission.UPGRADE_PLAN,
                Permission.DOWNGRADE_PLAN,
                Permission.CANCEL_SUBSCRIPTION
            ],
            'Premium': [
                # Todas as permissões do Essential
                Permission.READ_OWN_DATA,
                Permission.UPDATE_OWN_DATA,
                Permission.DELETE_OWN_DATA,
                Permission.EXPORT_OWN_DATA,
                Permission.CREATE_SPIRITUAL_METRICS,
                Permission.READ_SPIRITUAL_METRICS,
                Permission.UPDATE_SPIRITUAL_METRICS,
                Permission.DELETE_SPIRITUAL_METRICS,
                Permission.EXPORT_SPIRITUAL_METRICS,
                Permission.USE_AI_CHAT,
                Permission.ACCESS_AI_HISTORY,
                Permission.EXPORT_AI_CONVERSATIONS,
                Permission.USE_PREMIUM_AI_MODELS,
                Permission.GENERATE_BASIC_REPORTS,
                Permission.GENERATE_ADVANCED_REPORTS,
                Permission.GENERATE_CUSTOM_REPORTS,
                Permission.API_ACCESS,
                Permission.UPGRADE_PLAN,
                Permission.DOWNGRADE_PLAN,
                Permission.CANCEL_SUBSCRIPTION
            ],
            'Master': [
                # Todas as permissões do Premium
                Permission.READ_OWN_DATA,
                Permission.UPDATE_OWN_DATA,
                Permission.DELETE_OWN_DATA,
                Permission.EXPORT_OWN_DATA,
                Permission.CREATE_SPIRITUAL_METRICS,
                Permission.READ_SPIRITUAL_METRICS,
                Permission.UPDATE_SPIRITUAL_METRICS,
                Permission.DELETE_SPIRITUAL_METRICS,
                Permission.EXPORT_SPIRITUAL_METRICS,
                Permission.USE_AI_CHAT,
                Permission.ACCESS_AI_HISTORY,
                Permission.EXPORT_AI_CONVERSATIONS,
                Permission.USE_PREMIUM_AI_MODELS,
                Permission.UNLIMITED_AI_USAGE,
                Permission.GENERATE_BASIC_REPORTS,
                Permission.GENERATE_ADVANCED_REPORTS,
                Permission.GENERATE_CUSTOM_REPORTS,
                Permission.API_ACCESS,
                Permission.WEBHOOK_ACCESS,
                Permission.THIRD_PARTY_INTEGRATIONS,
                Permission.UPGRADE_PLAN,
                Permission.DOWNGRADE_PLAN,
                Permission.CANCEL_SUBSCRIPTION
            ]
        }
    
    def _define_role_permissions(self):
        """Definir permissões por role"""
        return {
            'user': [],  # Permissões baseadas apenas no plano
            'admin': [
                # Todas as permissões administrativas
                Permission.ADMIN_READ_USERS,
                Permission.ADMIN_CREATE_USERS,
                Permission.ADMIN_UPDATE_USERS,
                Permission.ADMIN_DELETE_USERS,
                Permission.ADMIN_MANAGE_PLANS,
                Permission.ADMIN_VIEW_ANALYTICS,
                Permission.ADMIN_MANAGE_PAYMENTS,
                Permission.ADMIN_SYSTEM_CONFIG,
                Permission.ADMIN_AUDIT_LOGS,
                Permission.ADMIN_LGPD_MANAGEMENT,
                # Todas as permissões de usuário Master
                Permission.READ_OWN_DATA,
                Permission.UPDATE_OWN_DATA,
                Permission.DELETE_OWN_DATA,
                Permission.EXPORT_OWN_DATA,
                Permission.CREATE_SPIRITUAL_METRICS,
                Permission.READ_SPIRITUAL_METRICS,
                Permission.UPDATE_SPIRITUAL_METRICS,
                Permission.DELETE_SPIRITUAL_METRICS,
                Permission.EXPORT_SPIRITUAL_METRICS,
                Permission.USE_AI_CHAT,
                Permission.ACCESS_AI_HISTORY,
                Permission.EXPORT_AI_CONVERSATIONS,
                Permission.USE_PREMIUM_AI_MODELS,
                Permission.UNLIMITED_AI_USAGE,
                Permission.GENERATE_BASIC_REPORTS,
                Permission.GENERATE_ADVANCED_REPORTS,
                Permission.GENERATE_CUSTOM_REPORTS,
                Permission.API_ACCESS,
                Permission.WEBHOOK_ACCESS,
                Permission.THIRD_PARTY_INTEGRATIONS
            ]
        }
    
    def get_user_permissions(self, user):
        """Obter todas as permissões do usuário"""
        permissions = set()
        
        # Permissões baseadas no role
        role_perms = self.role_permissions.get(user.role, [])
        permissions.update(role_perms)
        
        # Permissões baseadas no plano (apenas para usuários não-admin)
        if user.role != 'admin' and user.plan:
            plan_perms = self.plan_permissions.get(user.plan.name, [])
            permissions.update(plan_perms)
        
        return list(permissions)
    
    def user_has_permission(self, user, permission):
        """Verificar se usuário tem uma permissão específica"""
        user_permissions = self.get_user_permissions(user)
        return permission in user_permissions
    
    def get_plan_limits(self, plan_name):
        """Obter limites do plano"""
        limits = {
            'Free': {
                'spiritual_metrics_count': 5,
                'ai_conversations_per_month': 10,
                'reports_per_month': 3,
                'storage_mb': 100,
                'api_calls_per_day': 0
            },
            'Essential': {
                'spiritual_metrics_count': 25,
                'ai_conversations_per_month': 100,
                'reports_per_month': 10,
                'storage_mb': 500,
                'api_calls_per_day': 0
            },
            'Premium': {
                'spiritual_metrics_count': -1,  # Ilimitado
                'ai_conversations_per_month': 500,
                'reports_per_month': 50,
                'storage_mb': 2000,
                'api_calls_per_day': 1000
            },
            'Master': {
                'spiritual_metrics_count': -1,  # Ilimitado
                'ai_conversations_per_month': -1,  # Ilimitado
                'reports_per_month': -1,  # Ilimitado
                'storage_mb': 10000,
                'api_calls_per_day': 10000
            }
        }
        
        return limits.get(plan_name, limits['Free'])
    
    def check_usage_limit(self, user, resource_type, current_usage):
        """Verificar se usuário excedeu limite de uso"""
        if user.role == 'admin':
            return True, "Admin tem acesso ilimitado"
        
        if not user.plan:
            return False, "Usuário sem plano definido"
        
        limits = self.get_plan_limits(user.plan.name)
        limit = limits.get(resource_type, 0)
        
        if limit == -1:  # Ilimitado
            return True, "Uso ilimitado"
        
        if current_usage >= limit:
            return False, f"Limite excedido: {current_usage}/{limit}"
        
        return True, f"Dentro do limite: {current_usage}/{limit}"

# Instância global
permission_manager = PermissionManager()

# Decoradores para controle de permissões
def require_permission(permission):
    """Decorator para exigir permissão específica"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                
                if not user:
                    return jsonify({"error": "Usuário não encontrado"}), 404
                
                if not permission_manager.user_has_permission(user, permission):
                    # Log da tentativa de acesso negado
                    security_service.log_user_action(
                        user.id,
                        'access_denied',
                        {
                            'permission_required': permission,
                            'user_role': user.role,
                            'user_plan': user.plan.name if user.plan else None,
                            'endpoint': f.__name__
                        }
                    )
                    
                    return jsonify({
                        "error": "Permissão insuficiente",
                        "required_permission": permission,
                        "message": "Você não tem permissão para executar esta ação"
                    }), 403
                
                # Log do acesso autorizado
                security_service.log_user_action(
                    user.id,
                    'access_granted',
                    {
                        'permission_used': permission,
                        'endpoint': f.__name__
                    }
                )
                
                return f(*args, **kwargs)
                
            except Exception as e:
                return jsonify({"error": f"Erro na verificação de permissões: {str(e)}"}), 500
        
        return decorated_function
    return decorator

def require_admin():
    """Decorator para exigir acesso de administrador"""
    return require_permission(Permission.ADMIN_READ_USERS)

def require_plan(min_plan):
    """Decorator para exigir plano mínimo"""
    plan_hierarchy = ['Free', 'Essential', 'Premium', 'Master']
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                
                if not user:
                    return jsonify({"error": "Usuário não encontrado"}), 404
                
                # Admin sempre tem acesso
                if user.role == 'admin':
                    return f(*args, **kwargs)
                
                if not user.plan:
                    return jsonify({
                        "error": "Plano necessário",
                        "message": f"Esta funcionalidade requer o plano {min_plan} ou superior"
                    }), 403
                
                user_plan_level = plan_hierarchy.index(user.plan.name) if user.plan.name in plan_hierarchy else -1
                required_plan_level = plan_hierarchy.index(min_plan) if min_plan in plan_hierarchy else 999
                
                if user_plan_level < required_plan_level:
                    # Log da tentativa de acesso negado
                    security_service.log_user_action(
                        user.id,
                        'plan_access_denied',
                        {
                            'required_plan': min_plan,
                            'user_plan': user.plan.name,
                            'endpoint': f.__name__
                        }
                    )
                    
                    return jsonify({
                        "error": "Plano insuficiente",
                        "required_plan": min_plan,
                        "current_plan": user.plan.name,
                        "message": f"Esta funcionalidade requer o plano {min_plan} ou superior"
                    }), 403
                
                return f(*args, **kwargs)
                
            except Exception as e:
                return jsonify({"error": f"Erro na verificação de plano: {str(e)}"}), 500
        
        return decorated_function
    return decorator

def check_usage_limit(resource_type):
    """Decorator para verificar limites de uso"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                
                if not user:
                    return jsonify({"error": "Usuário não encontrado"}), 404
                
                # Admin não tem limites
                if user.role == 'admin':
                    return f(*args, **kwargs)
                
                # Calcular uso atual (implementar lógica específica por recurso)
                current_usage = 0  # Placeholder - implementar cálculo real
                
                can_use, message = permission_manager.check_usage_limit(user, resource_type, current_usage)
                
                if not can_use:
                    # Log do limite excedido
                    security_service.log_user_action(
                        user.id,
                        'usage_limit_exceeded',
                        {
                            'resource_type': resource_type,
                            'current_usage': current_usage,
                            'message': message,
                            'endpoint': f.__name__
                        }
                    )
                    
                    return jsonify({
                        "error": "Limite de uso excedido",
                        "resource_type": resource_type,
                        "message": message,
                        "upgrade_suggestion": "Considere fazer upgrade do seu plano para ter mais recursos"
                    }), 429
                
                return f(*args, **kwargs)
                
            except Exception as e:
                return jsonify({"error": f"Erro na verificação de limite: {str(e)}"}), 500
        
        return decorated_function
    return decorator
