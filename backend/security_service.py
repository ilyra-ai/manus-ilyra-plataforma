"""
Serviço de Segurança para iLyra Platform
Implementação completa de auditoria, controle de sessões e segurança
"""

import json
from datetime import datetime, timedelta
from flask import request
from models import db, User, UserAuditLog, BlacklistedToken
from flask_jwt_extended import decode_token

class SecurityService:
    """Serviço completo de segurança e auditoria"""
    
    def __init__(self):
        self.max_login_attempts = 5
        self.lockout_duration = timedelta(minutes=30)
    
    def log_user_action(self, user_id, action, details=None, ip_address=None, user_agent=None):
        """Registrar ação do usuário no log de auditoria"""
        try:
            # Obter IP e User-Agent do request se não fornecidos
            if not ip_address and request:
                ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            
            if not user_agent and request:
                user_agent = request.headers.get('User-Agent', '')
            
            # Criar log de auditoria
            audit_log = UserAuditLog(
                user_id=user_id,
                action=action,
                ip_address=ip_address,
                user_agent=user_agent,
                details=json.dumps(details) if details else None,
                timestamp=datetime.utcnow()
            )
            
            db.session.add(audit_log)
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao registrar log de auditoria: {str(e)}")
            return False
    
    def check_user_lockout(self, user):
        """Verificar se usuário está bloqueado"""
        if user.locked_until and user.locked_until > datetime.utcnow():
            return True, user.locked_until
        return False, None
    
    def handle_failed_login(self, user):
        """Gerenciar tentativas de login falhadas"""
        try:
            user.login_attempts += 1
            
            # Se excedeu o limite, bloquear usuário
            if user.login_attempts >= self.max_login_attempts:
                user.locked_until = datetime.utcnow() + self.lockout_duration
                
                # Log da ação
                self.log_user_action(
                    user.id,
                    'account_locked',
                    {
                        'reason': 'too_many_failed_attempts',
                        'attempts': user.login_attempts,
                        'locked_until': user.locked_until.isoformat()
                    }
                )
            
            db.session.commit()
            
            return user.login_attempts, user.locked_until
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao gerenciar login falhado: {str(e)}")
            return user.login_attempts, None
    
    def handle_successful_login(self, user):
        """Gerenciar login bem-sucedido"""
        try:
            # Resetar tentativas e desbloqueio
            user.login_attempts = 0
            user.locked_until = None
            user.last_login = datetime.utcnow()
            
            # Log da ação
            self.log_user_action(
                user.id,
                'login_success',
                {
                    'login_time': user.last_login.isoformat()
                }
            )
            
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao gerenciar login bem-sucedido: {str(e)}")
            return False
    
    def blacklist_token(self, jti, user_id, expires_at):
        """Adicionar token à blacklist"""
        try:
            blacklisted_token = BlacklistedToken(
                jti=jti,
                user_id=user_id,
                expires_at=expires_at,
                created_at=datetime.utcnow()
            )
            
            db.session.add(blacklisted_token)
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao adicionar token à blacklist: {str(e)}")
            return False
    
    def is_token_blacklisted(self, jti):
        """Verificar se token está na blacklist"""
        try:
            blacklisted = BlacklistedToken.query.filter_by(jti=jti).first()
            return blacklisted is not None
            
        except Exception as e:
            print(f"Erro ao verificar blacklist: {str(e)}")
            return False
    
    def cleanup_expired_blacklisted_tokens(self):
        """Limpar tokens expirados da blacklist"""
        try:
            now = datetime.utcnow()
            
            BlacklistedToken.query.filter(
                BlacklistedToken.expires_at < now
            ).delete()
            
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao limpar tokens expirados: {str(e)}")
            return False
    
    def get_user_audit_logs(self, user_id, limit=50, offset=0):
        """Obter logs de auditoria do usuário"""
        try:
            logs = UserAuditLog.query.filter_by(user_id=user_id)\
                .order_by(UserAuditLog.timestamp.desc())\
                .limit(limit)\
                .offset(offset)\
                .all()
            
            return [{
                'id': log.id,
                'action': log.action,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'details': json.loads(log.details) if log.details else None,
                'timestamp': log.timestamp.isoformat()
            } for log in logs]
            
        except Exception as e:
            print(f"Erro ao obter logs de auditoria: {str(e)}")
            return []
    
    def validate_password_strength(self, password):
        """Validar força da senha"""
        errors = []
        
        if len(password) < 8:
            errors.append("Senha deve ter pelo menos 8 caracteres")
        
        if not any(c.isupper() for c in password):
            errors.append("Senha deve conter pelo menos uma letra maiúscula")
        
        if not any(c.islower() for c in password):
            errors.append("Senha deve conter pelo menos uma letra minúscula")
        
        if not any(c.isdigit() for c in password):
            errors.append("Senha deve conter pelo menos um número")
        
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(c in special_chars for c in password):
            errors.append("Senha deve conter pelo menos um caractere especial")
        
        return len(errors) == 0, errors
    
    def check_suspicious_activity(self, user_id, action, time_window_minutes=5):
        """Verificar atividade suspeita (muitas ações em pouco tempo)"""
        try:
            time_threshold = datetime.utcnow() - timedelta(minutes=time_window_minutes)
            
            recent_actions = UserAuditLog.query.filter(
                UserAuditLog.user_id == user_id,
                UserAuditLog.action == action,
                UserAuditLog.timestamp >= time_threshold
            ).count()
            
            # Definir limites por tipo de ação
            limits = {
                'login_attempt': 10,
                'password_change': 3,
                'profile_update': 5,
                'api_call': 100
            }
            
            limit = limits.get(action, 20)  # Limite padrão
            
            if recent_actions >= limit:
                # Log da atividade suspeita
                self.log_user_action(
                    user_id,
                    'suspicious_activity_detected',
                    {
                        'action': action,
                        'count': recent_actions,
                        'time_window': time_window_minutes,
                        'limit': limit
                    }
                )
                
                return True, recent_actions
            
            return False, recent_actions
            
        except Exception as e:
            print(f"Erro ao verificar atividade suspeita: {str(e)}")
            return False, 0
    
    def get_security_summary(self, user_id):
        """Obter resumo de segurança do usuário"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            # Contar logs por tipo de ação (últimos 30 dias)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            action_counts = db.session.query(
                UserAuditLog.action,
                db.func.count(UserAuditLog.id).label('count')
            ).filter(
                UserAuditLog.user_id == user_id,
                UserAuditLog.timestamp >= thirty_days_ago
            ).group_by(UserAuditLog.action).all()
            
            # Verificar tokens ativos
            active_tokens = BlacklistedToken.query.filter(
                BlacklistedToken.user_id == user_id,
                BlacklistedToken.expires_at > datetime.utcnow()
            ).count()
            
            return {
                'user_id': user_id,
                'email_verified': user.email_verified,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'login_attempts': user.login_attempts,
                'is_locked': user.locked_until and user.locked_until > datetime.utcnow(),
                'locked_until': user.locked_until.isoformat() if user.locked_until else None,
                'action_counts': {action: count for action, count in action_counts},
                'active_blacklisted_tokens': active_tokens,
                'account_age_days': (datetime.utcnow() - user.created_at).days
            }
            
        except Exception as e:
            print(f"Erro ao obter resumo de segurança: {str(e)}")
            return None

# Instância global do serviço
security_service = SecurityService()
