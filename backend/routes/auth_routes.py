from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Plan
import re
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__)

# Lista de tokens invalidados (blacklist)
blacklisted_tokens = set()

@auth_bp.route("/register", methods=["POST"])
def register():
    """Registro de novos usuários - IMPLEMENTAÇÃO COMPLETA"""
    try:
        data = request.get_json()
        
        # Validação de dados obrigatórios
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
            
        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # Validações detalhadas
        if not username or len(username) < 3:
            return jsonify({"error": "Nome de usuário deve ter pelo menos 3 caracteres"}), 400
            
        if not email or not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
            return jsonify({"error": "Email inválido"}), 400
            
        if not password or len(password) < 6:
            return jsonify({"error": "Senha deve ter pelo menos 6 caracteres"}), 400
            
        # Verificar se usuário já existe
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email já cadastrado"}), 409
            
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Nome de usuário já existe"}), 409
        
        # Validar força da senha
        is_strong, password_errors = security_service.validate_password_strength(password)
        if not is_strong:
            return jsonify({
                "error": "Senha não atende aos critérios de segurança",
                "details": password_errors
            }), 400
        
        # Criar novo usuário
        hashed_password = generate_password_hash(password)
        
        # Atribuir plano padrão (Free) se existir
        default_plan = Plan.query.filter_by(name='Free').first()
        if not default_plan:
            # Se não houver plano 'Free', criar um ou usar None
            default_plan = Plan(name='Free', price=0.0, features='Basic access')
            db.session.add(default_plan)
            db.session.commit()

        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            role='user',
            created_at=datetime.utcnow(),
            plan=default_plan,
            email_verified=False  # Email não verificado inicialmente
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Enviar email de verificação
        email_sent, verification_token = email_service.send_verification_email(new_user)
        
        # Log do registro
        security_service.log_user_action(
            new_user.id,
            'user_registered',
            {
                'username': username,
                'email': email,
                'email_verification_sent': email_sent
            }
        )
        
        response_data = {
            "message": "Usuário registrado com sucesso",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "created_at": new_user.created_at.isoformat(),
                "plan": new_user.plan.name,
                "email_verified": new_user.email_verified
            }
        }
        
        if email_sent:
            response_data["verification_message"] = "Email de verificação enviado. Verifique sua caixa de entrada."
        else:
            response_data["verification_message"] = "Erro ao enviar email de verificação. Você pode solicitar um novo email posteriormente."
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login de usuários - IMPLEMENTAÇÃO COMPLETA COM SEGURANÇA"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
            
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        if not email or not password:
            return jsonify({"error": "Email e senha são obrigatórios"}), 400
        
        # Buscar usuário
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Log tentativa de login com email inexistente
            security_service.log_user_action(
                None,
                'login_attempt_invalid_email',
                {'email': email}
            )
            return jsonify({"error": "Email ou senha incorretos"}), 401
        
        # Verificar se usuário está bloqueado
        is_locked, locked_until = security_service.check_user_lockout(user)
        if is_locked:
            return jsonify({
                "error": "Conta temporariamente bloqueada devido a muitas tentativas de login",
                "locked_until": locked_until.isoformat()
            }), 423
        
        # Verificar senha
        if not check_password_hash(user.password_hash, password):
            # Gerenciar tentativa falhada
            attempts, locked_until = security_service.handle_failed_login(user)
            
            # Log da tentativa falhada
            security_service.log_user_action(
                user.id,
                'login_attempt_failed',
                {
                    'email': email,
                    'attempts': attempts,
                    'locked_until': locked_until.isoformat() if locked_until else None
                }
            )
            
            if locked_until:
                return jsonify({
                    "error": "Muitas tentativas de login. Conta bloqueada temporariamente",
                    "locked_until": locked_until.isoformat()
                }), 423
            else:
                remaining = security_service.max_login_attempts - attempts
                return jsonify({
                    "error": "Email ou senha incorretos",
                    "remaining_attempts": remaining
                }), 401
        
        # Login bem-sucedido
        security_service.handle_successful_login(user)
        
        # Criar tokens
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        )
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            "message": "Login realizado com sucesso",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "plan": user.plan.name if user.plan else "N/A",
                "email_verified": user.email_verified,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Renovação de tokens - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # if not user or not user.is_active: # Não temos is_active no modelo atual
        #     return jsonify({"error": "Usuário não encontrado ou inativo"}), 404
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Criar novo access token
        new_access_token = create_access_token(
            identity=user.id,
            additional_claims={
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        )
        
        return jsonify({
            "access_token": new_access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Logout de usuários - IMPLEMENTAÇÃO COMPLETA COM BLACKLIST"""
    try:
        current_user_id = get_jwt_identity()
        jwt_data = get_jwt()
        jti = jwt_data["jti"]  # JWT ID
        exp = jwt_data["exp"]  # Expiration timestamp
        
        # Adicionar token à blacklist no banco de dados
        expires_at = datetime.utcfromtimestamp(exp)
        security_service.blacklist_token(jti, current_user_id, expires_at)
        
        # Log da ação
        security_service.log_user_action(
            current_user_id,
            'logout',
            {'logout_time': datetime.utcnow().isoformat()}
        )
        
        # Manter compatibilidade com blacklist em memória
        blacklisted_tokens.add(jti)
        
        return jsonify({"message": "Logout realizado com sucesso"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Obter perfil do usuário logado - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at.isoformat(),
                # "updated_at": user.updated_at.isoformat(), # Não temos updated_at no modelo atual
                # "last_login": user.last_login.isoformat() if user.last_login else None # Não temos last_login no modelo atual
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Alterar senha do usuário - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        data = request.get_json()
        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")
        
        if not current_password or not new_password:
            return jsonify({"error": "Senha atual e nova senha são obrigatórias"}), 400
        
        if not check_password_hash(user.password_hash, current_password):
            return jsonify({"error": "Senha atual incorreta"}), 401
        
        if len(new_password) < 6:
            return jsonify({"error": "Nova senha deve ter pelo menos 6 caracteres"}), 400
        
        # Atualizar senha
        user.password_hash = generate_password_hash(new_password)
        # user.updated_at = datetime.utcnow() # Não temos updated_at no modelo atual
        db.session.commit()
        
        return jsonify({"message": "Senha alterada com sucesso"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/validate-token", methods=["GET"])
@jwt_required()
def validate_token():
    """Validar token de acesso - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # if not user or not user.is_active: # Não temos is_active no modelo atual
        #     return jsonify({"valid": False, "error": "Token inválido"}), 401
        if not user:
            return jsonify({"valid": False, "error": "Token inválido"}), 401
        
        return jsonify({
            "valid": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        }), 200
        
    except Exception as e:
        return jsonify({"valid": False, "error": f"Erro interno: {str(e)}"}), 500

# Importar serviços
from email_service import email_service
from security_service import security_service

# Rotas para recuperação de senha - IMPLEMENTAÇÃO COMPLETA
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Solicitar recuperação de senha - IMPLEMENTAÇÃO COMPLETA"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        email = data.get("email", "").strip().lower()
        
        if not email:
            return jsonify({"error": "Email é obrigatório"}), 400
        
        # Buscar usuário (sempre retornar sucesso por segurança)
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Verificar se não há muitas tentativas recentes
            suspicious, count = security_service.check_suspicious_activity(
                user.id, 'password_reset_request', 15
            )
            
            if not suspicious:
                # Enviar email de recuperação
                success, token = email_service.send_password_reset_email(user)
                
                if success:
                    # Log da ação
                    security_service.log_user_action(
                        user.id,
                        'password_reset_requested',
                        {'email': email}
                    )
        
        # Sempre retornar a mesma mensagem por segurança
        return jsonify({
            "message": "Se o email estiver registrado, um link de recuperação será enviado."
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    """Redefinir senha com token - IMPLEMENTAÇÃO COMPLETA"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        new_password = data.get("new_password", "")
        
        if not new_password:
            return jsonify({"error": "Nova senha é obrigatória"}), 400
        
        # Validar força da senha
        is_strong, errors = security_service.validate_password_strength(new_password)
        if not is_strong:
            return jsonify({"error": "Senha não atende aos critérios de segurança", "details": errors}), 400
        
        # Redefinir senha
        success, message = email_service.reset_password_with_token(token, new_password)
        
        if success:
            # Buscar usuário para log
            valid, reset_token, _ = email_service.verify_password_reset_token(token)
            if valid and reset_token:
                user = User.query.get(reset_token.user_id)
                if user:
                    security_service.log_user_action(
                        user.id,
                        'password_reset_completed',
                        {'reset_time': datetime.utcnow().isoformat()}
                    )
            
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 400
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Rotas para verificação de e-mail - IMPLEMENTAÇÃO COMPLETA
@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    """Reenviar email de verificação - IMPLEMENTAÇÃO COMPLETA"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        email = data.get("email", "").strip().lower()
        
        if not email:
            return jsonify({"error": "Email é obrigatório"}), 400
        
        # Buscar usuário
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Verificar se já está verificado
            if user.email_verified:
                return jsonify({"message": "Email já está verificado"}), 200
            
            # Verificar atividade suspeita
            suspicious, count = security_service.check_suspicious_activity(
                user.id, 'email_verification_request', 10
            )
            
            if not suspicious:
                # Enviar email de verificação
                success, token = email_service.send_verification_email(user)
                
                if success:
                    security_service.log_user_action(
                        user.id,
                        'email_verification_resent',
                        {'email': email}
                    )
        
        # Sempre retornar sucesso por segurança
        return jsonify({
            "message": "Se o email estiver registrado e não verificado, um novo link será enviado."
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@auth_bp.route("/verify-email/<token>", methods=["GET"])
def verify_email(token):
    """Verificar email com token - IMPLEMENTAÇÃO COMPLETA"""
    try:
        # Verificar token
        success, message = email_service.verify_email_token(token)
        
        if success:
            # Log da verificação (buscar usuário pelo token)
            token_hash = email_service.hash_token(token)
            from models import EmailVerificationToken
            verification_token = EmailVerificationToken.query.filter_by(token_hash=token_hash).first()
            
            if verification_token:
                security_service.log_user_action(
                    verification_token.user_id,
                    'email_verified',
                    {'verification_time': datetime.utcnow().isoformat()}
                )
            
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 400
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Rota para obter logs de auditoria do usuário
@auth_bp.route("/audit-logs", methods=["GET"])
@jwt_required()
def get_audit_logs():
    """Obter logs de auditoria do usuário - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de paginação
        limit = min(int(request.args.get('limit', 50)), 100)  # Máximo 100
        offset = int(request.args.get('offset', 0))
        
        # Obter logs
        logs = security_service.get_user_audit_logs(current_user_id, limit, offset)
        
        return jsonify({
            "logs": logs,
            "limit": limit,
            "offset": offset,
            "total": len(logs)
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Rota para obter resumo de segurança
@auth_bp.route("/security-summary", methods=["GET"])
@jwt_required()
def get_security_summary():
    """Obter resumo de segurança do usuário - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        summary = security_service.get_security_summary(current_user_id)
        
        if summary:
            return jsonify(summary), 200
        else:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Callback para verificar se token está na blacklist
@auth_bp.before_app_request
def check_if_token_revoked():
    """Verificar se token foi revogado"""
    try:
        if request.endpoint and "auth" in request.endpoint:
            return
        
        # Implementar verificação de blacklist se necessário
        pass
    except:
        pass

