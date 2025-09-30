from functools import wraps
from flask import request, jsonify
import re
from datetime import datetime
import json

class ValidationError(Exception):
    """Exceção customizada para erros de validação"""
    def __init__(self, message, field=None):
        self.message = message
        self.field = field
        super().__init__(self.message)

class DataValidator:
    """Classe principal para validação de dados"""
    
    @staticmethod
    def validate_email(email):
        """Validar formato de email"""
        if not email:
            raise ValidationError("Email é obrigatório", "email")
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationError("Formato de email inválido", "email")
        
        return email.lower().strip()
    
    @staticmethod
    def validate_password(password):
        """Validar força da senha"""
        if not password:
            raise ValidationError("Senha é obrigatória", "password")
        
        if len(password) < 8:
            raise ValidationError("Senha deve ter pelo menos 8 caracteres", "password")
        
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Senha deve conter pelo menos uma letra maiúscula", "password")
        
        if not re.search(r'[a-z]', password):
            raise ValidationError("Senha deve conter pelo menos uma letra minúscula", "password")
        
        if not re.search(r'\d', password):
            raise ValidationError("Senha deve conter pelo menos um número", "password")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError("Senha deve conter pelo menos um caractere especial", "password")
        
        return password
    
    @staticmethod
    def validate_username(username):
        """Validar nome de usuário"""
        if not username:
            raise ValidationError("Nome de usuário é obrigatório", "username")
        
        if len(username) < 3:
            raise ValidationError("Nome de usuário deve ter pelo menos 3 caracteres", "username")
        
        if len(username) > 30:
            raise ValidationError("Nome de usuário deve ter no máximo 30 caracteres", "username")
        
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            raise ValidationError("Nome de usuário deve conter apenas letras, números e underscore", "username")
        
        return username.lower().strip()
    
    @staticmethod
    def validate_phone(phone):
        """Validar número de telefone brasileiro"""
        if not phone:
            return None  # Telefone é opcional
        
        # Remover caracteres não numéricos
        phone_clean = re.sub(r'[^\d]', '', phone)
        
        # Validar formato brasileiro (11 dígitos com DDD)
        if not re.match(r'^(\+55)?[1-9]{2}9?[0-9]{8}$', phone_clean):
            raise ValidationError("Formato de telefone inválido. Use o formato: (11) 99999-9999", "phone")
        
        return phone.strip()
    
    @staticmethod
    def validate_date(date_str, field_name="data"):
        """Validar formato de data"""
        if not date_str:
            return None
        
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            
            # Verificar se a data não é futura (para data de nascimento)
            if field_name == "birth_date" and date_obj > datetime.now():
                raise ValidationError("Data de nascimento não pode ser futura", field_name)
            
            return date_obj
        except ValueError:
            raise ValidationError(f"Formato de {field_name} inválido. Use YYYY-MM-DD", field_name)
    
    @staticmethod
    def validate_required_fields(data, required_fields):
        """Validar campos obrigatórios"""
        missing_fields = []
        
        for field in required_fields:
            if field not in data or not data[field] or str(data[field]).strip() == '':
                missing_fields.append(field)
        
        if missing_fields:
            raise ValidationError(f"Campos obrigatórios ausentes: {', '.join(missing_fields)}")
    
    @staticmethod
    def validate_string_length(value, field_name, min_length=None, max_length=None):
        """Validar comprimento de string"""
        if not value:
            return value
        
        value = str(value).strip()
        
        if min_length and len(value) < min_length:
            raise ValidationError(f"{field_name} deve ter pelo menos {min_length} caracteres", field_name)
        
        if max_length and len(value) > max_length:
            raise ValidationError(f"{field_name} deve ter no máximo {max_length} caracteres", field_name)
        
        return value
    
    @staticmethod
    def validate_numeric_range(value, field_name, min_value=None, max_value=None):
        """Validar faixa numérica"""
        if value is None:
            return value
        
        try:
            numeric_value = float(value)
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} deve ser um número válido", field_name)
        
        if min_value is not None and numeric_value < min_value:
            raise ValidationError(f"{field_name} deve ser pelo menos {min_value}", field_name)
        
        if max_value is not None and numeric_value > max_value:
            raise ValidationError(f"{field_name} deve ser no máximo {max_value}", field_name)
        
        return numeric_value
    
    @staticmethod
    def sanitize_html(text):
        """Sanitizar HTML básico"""
        if not text:
            return text
        
        # Remover tags HTML básicas
        text = re.sub(r'<[^>]+>', '', str(text))
        
        # Escapar caracteres especiais
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        text = text.replace('"', '&quot;')
        text = text.replace("'", '&#x27;')
        
        return text.strip()

# Decoradores para validação automática
def validate_json(schema):
    """Decorador para validar JSON de entrada"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                if not request.is_json:
                    return jsonify({"error": "Content-Type deve ser application/json"}), 400
                
                data = request.get_json()
                if not data:
                    return jsonify({"error": "Dados JSON são obrigatórios"}), 400
                
                # Validar esquema
                validated_data = validate_schema(data, schema)
                
                # Adicionar dados validados ao request
                request.validated_data = validated_data
                
                return f(*args, **kwargs)
                
            except ValidationError as e:
                return jsonify({
                    "error": "Erro de validação",
                    "message": e.message,
                    "field": e.field
                }), 400
            except Exception as e:
                return jsonify({
                    "error": "Erro interno de validação",
                    "message": str(e)
                }), 500
        
        return decorated_function
    return decorator

def validate_schema(data, schema):
    """Validar dados contra um esquema"""
    validated_data = {}
    validator = DataValidator()
    
    for field, rules in schema.items():
        value = data.get(field)
        
        # Verificar se é obrigatório
        if rules.get('required', False) and (value is None or str(value).strip() == ''):
            raise ValidationError(f"Campo '{field}' é obrigatório", field)
        
        # Se não é obrigatório e está vazio, pular validação
        if not rules.get('required', False) and (value is None or str(value).strip() == ''):
            validated_data[field] = None
            continue
        
        # Aplicar validações específicas
        if rules.get('type') == 'email':
            validated_data[field] = validator.validate_email(value)
        
        elif rules.get('type') == 'password':
            validated_data[field] = validator.validate_password(value)
        
        elif rules.get('type') == 'username':
            validated_data[field] = validator.validate_username(value)
        
        elif rules.get('type') == 'phone':
            validated_data[field] = validator.validate_phone(value)
        
        elif rules.get('type') == 'date':
            validated_data[field] = validator.validate_date(value, field)
        
        elif rules.get('type') == 'string':
            validated_data[field] = validator.validate_string_length(
                value, field, 
                rules.get('min_length'), 
                rules.get('max_length')
            )
            # Sanitizar se necessário
            if rules.get('sanitize', False):
                validated_data[field] = validator.sanitize_html(validated_data[field])
        
        elif rules.get('type') == 'number':
            validated_data[field] = validator.validate_numeric_range(
                value, field,
                rules.get('min_value'),
                rules.get('max_value')
            )
        
        else:
            validated_data[field] = value
    
    return validated_data

# Esquemas de validação comuns
USER_REGISTRATION_SCHEMA = {
    'username': {
        'type': 'username',
        'required': True
    },
    'email': {
        'type': 'email',
        'required': True
    },
    'password': {
        'type': 'password',
        'required': True
    },
    'full_name': {
        'type': 'string',
        'required': True,
        'min_length': 2,
        'max_length': 100,
        'sanitize': True
    }
}

USER_LOGIN_SCHEMA = {
    'email': {
        'type': 'email',
        'required': True
    },
    'password': {
        'type': 'string',
        'required': True
    }
}

USER_PROFILE_UPDATE_SCHEMA = {
    'full_name': {
        'type': 'string',
        'required': False,
        'min_length': 2,
        'max_length': 100,
        'sanitize': True
    },
    'phone': {
        'type': 'phone',
        'required': False
    },
    'birth_date': {
        'type': 'date',
        'required': False
    },
    'bio': {
        'type': 'string',
        'required': False,
        'max_length': 500,
        'sanitize': True
    }
}

SPIRITUAL_METRIC_SCHEMA = {
    'name': {
        'type': 'string',
        'required': True,
        'min_length': 2,
        'max_length': 100,
        'sanitize': True
    },
    'value': {
        'type': 'number',
        'required': True,
        'min_value': 0,
        'max_value': 1000
    },
    'description': {
        'type': 'string',
        'required': False,
        'max_length': 500,
        'sanitize': True
    }
}

AI_CONVERSATION_SCHEMA = {
    'message': {
        'type': 'string',
        'required': True,
        'min_length': 1,
        'max_length': 2000,
        'sanitize': True
    },
    'context': {
        'type': 'string',
        'required': False,
        'max_length': 1000,
        'sanitize': True
    }
}
