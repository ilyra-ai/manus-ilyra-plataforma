from flask import request, jsonify, g
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
import redis
import time
import hashlib
from datetime import datetime, timedelta
import json

class AdvancedRateLimiter:
    """Sistema avançado de rate limiting com diferentes estratégias"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client or redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    
    def get_client_id(self, request):
        """Obter identificador único do cliente"""
        # Priorizar usuário autenticado
        if hasattr(g, 'current_user') and g.current_user:
            return f"user:{g.current_user.id}"
        
        # Usar IP + User-Agent como fallback
        ip = get_remote_address()
        user_agent = request.headers.get('User-Agent', '')
        client_hash = hashlib.md5(f"{ip}:{user_agent}".encode()).hexdigest()
        return f"client:{client_hash}"
    
    def is_rate_limited(self, key, limit, window, burst_limit=None):
        """Verificar se o cliente excedeu o limite"""
        try:
            current_time = int(time.time())
            window_start = current_time - window
            
            # Limpar entradas antigas
            self.redis_client.zremrangebyscore(key, 0, window_start)
            
            # Contar requisições na janela atual
            current_count = self.redis_client.zcard(key)
            
            # Verificar limite de burst se especificado
            if burst_limit and current_count >= burst_limit:
                return True, current_count, burst_limit
            
            # Verificar limite normal
            if current_count >= limit:
                return True, current_count, limit
            
            # Adicionar requisição atual
            self.redis_client.zadd(key, {str(current_time): current_time})
            self.redis_client.expire(key, window)
            
            return False, current_count + 1, limit
            
        except Exception as e:
            # Em caso de erro no Redis, permitir a requisição
            print(f"Erro no rate limiter: {e}")
            return False, 0, limit
    
    def get_reset_time(self, key, window):
        """Obter tempo até o reset do limite"""
        try:
            oldest_request = self.redis_client.zrange(key, 0, 0, withscores=True)
            if oldest_request:
                oldest_time = oldest_request[0][1]
                reset_time = oldest_time + window
                return max(0, int(reset_time - time.time()))
            return 0
        except:
            return 0

# Configurações de rate limiting por endpoint
RATE_LIMIT_CONFIG = {
    'auth.login': {
        'limit': 5,
        'window': 300,  # 5 minutos
        'burst_limit': 10,
        'message': 'Muitas tentativas de login. Tente novamente em alguns minutos.'
    },
    'auth.register': {
        'limit': 3,
        'window': 3600,  # 1 hora
        'message': 'Limite de registros excedido. Tente novamente em 1 hora.'
    },
    'auth.forgot_password': {
        'limit': 3,
        'window': 3600,  # 1 hora
        'message': 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.'
    },
    'auth.verify_email': {
        'limit': 5,
        'window': 3600,  # 1 hora
        'message': 'Muitas tentativas de verificação. Tente novamente em 1 hora.'
    },
    'ai.chat': {
        'limit': 100,
        'window': 3600,  # 1 hora
        'burst_limit': 20,
        'message': 'Limite de conversas com IA excedido. Upgrade seu plano para mais interações.'
    },
    'api.general': {
        'limit': 1000,
        'window': 3600,  # 1 hora
        'message': 'Limite de requisições da API excedido.'
    }
}

def advanced_rate_limit(endpoint_key, custom_limit=None, custom_window=None):
    """Decorador para rate limiting avançado"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            limiter = AdvancedRateLimiter()
            client_id = limiter.get_client_id(request)
            
            # Obter configuração do endpoint
            config = RATE_LIMIT_CONFIG.get(endpoint_key, RATE_LIMIT_CONFIG['api.general'])
            
            # Usar limites customizados se fornecidos
            limit = custom_limit or config['limit']
            window = custom_window or config['window']
            burst_limit = config.get('burst_limit')
            
            # Criar chave única para o rate limiting
            rate_key = f"rate_limit:{endpoint_key}:{client_id}"
            
            # Verificar rate limiting
            is_limited, current_count, max_limit = limiter.is_rate_limited(
                rate_key, limit, window, burst_limit
            )
            
            if is_limited:
                reset_time = limiter.get_reset_time(rate_key, window)
                
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': config.get('message', 'Muitas requisições. Tente novamente mais tarde.'),
                    'current_count': current_count,
                    'limit': max_limit,
                    'reset_in_seconds': reset_time,
                    'retry_after': reset_time
                }), 429
            
            # Adicionar headers informativos
            response = f(*args, **kwargs)
            
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(max_limit)
                response.headers['X-RateLimit-Remaining'] = str(max_limit - current_count)
                response.headers['X-RateLimit-Reset'] = str(int(time.time()) + limiter.get_reset_time(rate_key, window))
            
            return response
        
        return decorated_function
    return decorator

class LoginAttemptTracker:
    """Rastreador de tentativas de login para bloqueio de contas"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client or redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        self.max_attempts = 5
        self.lockout_duration = 1800  # 30 minutos
        self.attempt_window = 900  # 15 minutos
    
    def record_failed_attempt(self, identifier):
        """Registrar tentativa de login falhada"""
        key = f"login_attempts:{identifier}"
        current_time = int(time.time())
        
        # Adicionar tentativa atual
        self.redis_client.zadd(key, {str(current_time): current_time})
        
        # Limpar tentativas antigas
        window_start = current_time - self.attempt_window
        self.redis_client.zremrangebyscore(key, 0, window_start)
        
        # Definir expiração
        self.redis_client.expire(key, self.attempt_window)
        
        # Verificar se deve bloquear
        attempt_count = self.redis_client.zcard(key)
        if attempt_count >= self.max_attempts:
            self.lock_account(identifier)
        
        return attempt_count
    
    def lock_account(self, identifier):
        """Bloquear conta temporariamente"""
        lock_key = f"account_locked:{identifier}"
        self.redis_client.setex(lock_key, self.lockout_duration, "locked")
    
    def is_account_locked(self, identifier):
        """Verificar se a conta está bloqueada"""
        lock_key = f"account_locked:{identifier}"
        return self.redis_client.exists(lock_key)
    
    def get_lockout_time_remaining(self, identifier):
        """Obter tempo restante do bloqueio"""
        lock_key = f"account_locked:{identifier}"
        return self.redis_client.ttl(lock_key)
    
    def clear_attempts(self, identifier):
        """Limpar tentativas após login bem-sucedido"""
        attempt_key = f"login_attempts:{identifier}"
        lock_key = f"account_locked:{identifier}"
        
        self.redis_client.delete(attempt_key)
        self.redis_client.delete(lock_key)

def check_login_attempts(identifier):
    """Decorador para verificar tentativas de login"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            tracker = LoginAttemptTracker()
            
            # Verificar se a conta está bloqueada
            if tracker.is_account_locked(identifier):
                remaining_time = tracker.get_lockout_time_remaining(identifier)
                return jsonify({
                    'error': 'Account temporarily locked',
                    'message': f'Conta bloqueada devido a muitas tentativas de login. Tente novamente em {remaining_time} segundos.',
                    'locked_until': remaining_time,
                    'retry_after': remaining_time
                }), 423  # HTTP 423 Locked
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

class SecurityAuditor:
    """Auditor de segurança para monitorar atividades suspeitas"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client or redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    
    def log_security_event(self, event_type, details, severity='medium'):
        """Registrar evento de segurança"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'type': event_type,
            'details': details,
            'severity': severity,
            'ip': get_remote_address(),
            'user_agent': request.headers.get('User-Agent', ''),
            'user_id': getattr(g, 'current_user_id', None)
        }
        
        # Armazenar no Redis com TTL de 30 dias
        key = f"security_event:{int(time.time())}"
        self.redis_client.setex(key, 2592000, json.dumps(event))
        
        # Alertar se for evento crítico
        if severity == 'critical':
            self.send_security_alert(event)
    
    def send_security_alert(self, event):
        """Enviar alerta de segurança (implementar integração com sistema de alertas)"""
        print(f"🚨 ALERTA DE SEGURANÇA: {event['type']} - {event['details']}")
    
    def detect_suspicious_activity(self, user_id):
        """Detectar atividade suspeita"""
        # Implementar lógica de detecção de padrões suspeitos
        # Por exemplo: múltiplos IPs, horários incomuns, etc.
        pass

# Middleware para auditoria automática
def security_audit_middleware():
    """Middleware para auditoria de segurança"""
    auditor = SecurityAuditor()
    
    # Registrar tentativas de acesso a endpoints sensíveis
    if request.endpoint in ['auth.login', 'auth.register', 'auth.forgot_password']:
        auditor.log_security_event(
            f'auth_attempt_{request.endpoint}',
            f'Tentativa de acesso ao endpoint {request.endpoint}',
            'low'
        )

# Função para inicializar rate limiting na aplicação
def init_rate_limiting(app):
    """Inicializar sistema de rate limiting na aplicação Flask"""
    
    # Configurar Flask-Limiter básico
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["1000 per hour", "100 per minute"],
        storage_uri="redis://localhost:6379"
    )
    
    # Adicionar middleware de auditoria
    app.before_request(security_audit_middleware)
    
    return limiter
