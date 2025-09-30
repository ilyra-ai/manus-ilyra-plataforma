from functools import wraps
from flask import request, jsonify, g, current_app
from flask_cors import cross_origin
import jwt
import time
import redis
from datetime import datetime, timedelta
import json
import logging
from models import User, db
from ai_cost_monitor import cost_monitor

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cliente Redis para rate limiting e cache
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
except:
    redis_client = None
    logger.warning("Redis não disponível - rate limiting e cache desabilitados")

def cors_middleware():
    """Middleware para CORS"""
    def decorator(f):
        @wraps(f)
        @cross_origin(
            origins=['http://localhost:3000', 'https://ilyra.com'],
            methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
            supports_credentials=True
        )
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def auth_required(f):
    """Middleware para autenticação obrigatória"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Verificar token no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token inválido'}), 401
        
        if not token:
            return jsonify({'message': 'Token de acesso necessário'}), 401
        
        try:
            # Decodificar token JWT
            data = jwt.decode(
                token, 
                current_app.config['SECRET_KEY'], 
                algorithms=['HS256']
            )
            
            # Buscar usuário
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Usuário não encontrado'}), 401
            
            # Verificar se usuário está ativo
            if not current_user.is_active:
                return jsonify({'message': 'Conta desativada'}), 401
            
            # Adicionar usuário ao contexto global
            g.current_user = current_user
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
        except Exception as e:
            logger.error(f"Erro na autenticação: {e}")
            return jsonify({'message': 'Erro interno de autenticação'}), 500
        
        return f(*args, **kwargs)
    
    return decorated_function

def admin_required(f):
    """Middleware para verificar se usuário é admin"""
    @wraps(f)
    @auth_required
    def decorated_function(*args, **kwargs):
        if not g.current_user.is_admin:
            return jsonify({'message': 'Acesso negado - privilégios de admin necessários'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def rate_limit(max_requests=100, window_seconds=60, per_user=True):
    """Middleware para rate limiting"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not redis_client:
                # Se Redis não estiver disponível, pular rate limiting
                return f(*args, **kwargs)
            
            # Determinar chave para rate limiting
            if per_user and hasattr(g, 'current_user'):
                key = f"rate_limit:user:{g.current_user.id}:{request.endpoint}"
            else:
                key = f"rate_limit:ip:{request.remote_addr}:{request.endpoint}"
            
            current_time = int(time.time())
            window_start = current_time - window_seconds
            
            try:
                # Limpar requests antigos
                redis_client.zremrangebyscore(key, 0, window_start)
                
                # Contar requests na janela atual
                current_requests = redis_client.zcard(key)
                
                if current_requests >= max_requests:
                    return jsonify({
                        'message': 'Rate limit excedido',
                        'retry_after': window_seconds
                    }), 429
                
                # Adicionar request atual
                redis_client.zadd(key, {str(current_time): current_time})
                redis_client.expire(key, window_seconds)
                
            except Exception as e:
                logger.error(f"Erro no rate limiting: {e}")
                # Em caso de erro, permitir a requisição
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def ai_cost_limit(f):
    """Middleware para verificar limites de custo de IA"""
    @wraps(f)
    @auth_required
    def decorated_function(*args, **kwargs):
        user_id = g.current_user.id
        
        # Verificar se usuário pode usar IA
        can_use = cost_monitor.can_user_use_model(user_id, 'gemini-pro')
        
        if not can_use.get('allowed', True):
            return jsonify({
                'message': 'Limite de uso de IA excedido',
                'reason': can_use.get('reason'),
                'upgrade_required': can_use.get('upgrade_required', False)
            }), 429
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_json(required_fields=None):
    """Middleware para validação de JSON"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'message': 'Content-Type deve ser application/json'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'message': 'JSON inválido ou vazio'}), 400
            
            # Verificar campos obrigatórios
            if required_fields:
                missing_fields = []
                for field in required_fields:
                    if field not in data or data[field] is None:
                        missing_fields.append(field)
                
                if missing_fields:
                    return jsonify({
                        'message': 'Campos obrigatórios ausentes',
                        'missing_fields': missing_fields
                    }), 400
            
            # Adicionar dados validados ao contexto
            g.json_data = data
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def log_request(f):
    """Middleware para logging de requisições"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        # Log da requisição
        user_info = "anonymous"
        if hasattr(g, 'current_user'):
            user_info = f"user:{g.current_user.id}"
        
        logger.info(f"REQUEST: {request.method} {request.path} - {user_info} - IP: {request.remote_addr}")
        
        try:
            # Executar função
            response = f(*args, **kwargs)
            
            # Log da resposta
            duration = (time.time() - start_time) * 1000  # em ms
            status_code = response[1] if isinstance(response, tuple) else 200
            
            logger.info(f"RESPONSE: {request.method} {request.path} - {status_code} - {duration:.2f}ms")
            
            return response
            
        except Exception as e:
            # Log de erro
            duration = (time.time() - start_time) * 1000
            logger.error(f"ERROR: {request.method} {request.path} - {str(e)} - {duration:.2f}ms")
            raise
    
    return decorated_function

def cache_response(duration=300):
    """Middleware para cache de respostas"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not redis_client:
                return f(*args, **kwargs)
            
            # Gerar chave de cache
            cache_key = f"cache:{request.path}:{request.query_string.decode()}"
            if hasattr(g, 'current_user'):
                cache_key += f":user:{g.current_user.id}"
            
            try:
                # Verificar cache
                cached_response = redis_client.get(cache_key)
                if cached_response:
                    logger.info(f"CACHE HIT: {cache_key}")
                    return json.loads(cached_response)
                
                # Executar função e cachear resultado
                response = f(*args, **kwargs)
                
                # Cachear apenas respostas de sucesso
                if isinstance(response, tuple):
                    data, status_code = response
                    if status_code == 200:
                        redis_client.setex(cache_key, duration, json.dumps(data))
                        logger.info(f"CACHE SET: {cache_key}")
                else:
                    redis_client.setex(cache_key, duration, json.dumps(response))
                    logger.info(f"CACHE SET: {cache_key}")
                
                return response
                
            except Exception as e:
                logger.error(f"Erro no cache: {e}")
                return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def handle_errors(f):
    """Middleware para tratamento de erros"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        
        except ValueError as e:
            logger.error(f"ValueError: {e}")
            return jsonify({'message': 'Dados inválidos', 'error': str(e)}), 400
        
        except PermissionError as e:
            logger.error(f"PermissionError: {e}")
            return jsonify({'message': 'Permissão negada', 'error': str(e)}), 403
        
        except FileNotFoundError as e:
            logger.error(f"FileNotFoundError: {e}")
            return jsonify({'message': 'Recurso não encontrado', 'error': str(e)}), 404
        
        except ConnectionError as e:
            logger.error(f"ConnectionError: {e}")
            return jsonify({'message': 'Erro de conexão', 'error': str(e)}), 503
        
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return jsonify({'message': 'Erro interno do servidor'}), 500
    
    return decorated_function

def security_headers(f):
    """Middleware para adicionar headers de segurança"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # Se response é uma tupla (data, status_code)
        if isinstance(response, tuple):
            data, status_code = response
            response_obj = jsonify(data)
            response_obj.status_code = status_code
        else:
            response_obj = jsonify(response)
        
        # Adicionar headers de segurança
        response_obj.headers['X-Content-Type-Options'] = 'nosniff'
        response_obj.headers['X-Frame-Options'] = 'DENY'
        response_obj.headers['X-XSS-Protection'] = '1; mode=block'
        response_obj.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response_obj.headers['Content-Security-Policy'] = "default-src 'self'"
        
        return response_obj
    
    return decorated_function

def pagination_helper(query, page=1, per_page=20, max_per_page=100):
    """Helper para paginação"""
    try:
        page = int(request.args.get('page', page))
        per_page = min(int(request.args.get('per_page', per_page)), max_per_page)
    except (ValueError, TypeError):
        page = 1
        per_page = 20
    
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 20
    
    paginated = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return {
        'items': [item.to_dict() if hasattr(item, 'to_dict') else item for item in paginated.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev,
            'next_page': paginated.next_num if paginated.has_next else None,
            'prev_page': paginated.prev_num if paginated.has_prev else None
        }
    }

def api_response(data=None, message=None, status_code=200, pagination=None):
    """Helper para padronizar respostas da API"""
    response = {
        'success': status_code < 400,
        'timestamp': datetime.utcnow().isoformat(),
    }
    
    if message:
        response['message'] = message
    
    if data is not None:
        response['data'] = data
    
    if pagination:
        response['pagination'] = pagination
    
    return response, status_code

def validate_user_access(resource_user_id):
    """Verificar se usuário pode acessar recurso"""
    if not hasattr(g, 'current_user'):
        return False
    
    # Admin pode acessar tudo
    if g.current_user.is_admin:
        return True
    
    # Usuário só pode acessar seus próprios recursos
    return g.current_user.id == resource_user_id

# Decorador combinado para APIs padrão
def standard_api(require_auth=True, require_admin=False, rate_limit_config=None, cache_duration=None):
    """Decorador combinado para APIs padrão"""
    def decorator(f):
        # Aplicar middlewares na ordem correta
        decorated = f
        
        # 1. Tratamento de erros (mais externo)
        decorated = handle_errors(decorated)
        
        # 2. Headers de segurança
        decorated = security_headers(decorated)
        
        # 3. Logging
        decorated = log_request(decorated)
        
        # 4. Cache (se especificado)
        if cache_duration:
            decorated = cache_response(cache_duration)(decorated)
        
        # 5. Rate limiting (se especificado)
        if rate_limit_config:
            decorated = rate_limit(**rate_limit_config)(decorated)
        
        # 6. Autenticação (se necessária)
        if require_admin:
            decorated = admin_required(decorated)
        elif require_auth:
            decorated = auth_required(decorated)
        
        # 7. CORS (mais interno)
        decorated = cors_middleware()(decorated)
        
        return decorated
    
    return decorator

# Middleware para WebSocket (se necessário)
def websocket_auth(f):
    """Middleware para autenticação WebSocket"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Implementar autenticação WebSocket se necessário
        return f(*args, **kwargs)
    return decorated_function

# Middleware para upload de arquivos
def file_upload_validator(allowed_extensions=None, max_size=10*1024*1024):
    """Middleware para validação de upload de arquivos"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'file' not in request.files:
                return jsonify({'message': 'Nenhum arquivo enviado'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'message': 'Nenhum arquivo selecionado'}), 400
            
            # Verificar extensão
            if allowed_extensions:
                if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
                    return jsonify({
                        'message': 'Tipo de arquivo não permitido',
                        'allowed_extensions': allowed_extensions
                    }), 400
            
            # Verificar tamanho
            file.seek(0, 2)  # Ir para o final do arquivo
            file_size = file.tell()
            file.seek(0)  # Voltar para o início
            
            if file_size > max_size:
                return jsonify({
                    'message': 'Arquivo muito grande',
                    'max_size': max_size,
                    'file_size': file_size
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator
