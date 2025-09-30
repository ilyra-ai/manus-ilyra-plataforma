"""
Serviço de Email para iLyra Platform
Implementação completa para recuperação de senha e verificação de email
"""

import smtplib
import secrets
import hashlib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from flask import current_app
from models import db, User, EmailVerificationToken, PasswordResetToken
import os

class EmailService:
    """Serviço completo de email para autenticação"""
    
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@ilyra.com')
        self.base_url = os.getenv('BASE_URL', 'http://localhost:3000')
    
    def _send_email(self, to_email, subject, html_content, text_content=None):
        """Enviar email via SMTP"""
        try:
            # Criar mensagem
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Adicionar conteúdo texto
            if text_content:
                part1 = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(part1)
            
            # Adicionar conteúdo HTML
            part2 = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(part2)
            
            # Conectar e enviar
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            
            if self.smtp_username and self.smtp_password:
                server.login(self.smtp_username, self.smtp_password)
            
            server.send_message(msg)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email: {str(e)}")
            return False
    
    def generate_secure_token(self, length=32):
        """Gerar token seguro"""
        return secrets.token_urlsafe(length)
    
    def hash_token(self, token):
        """Hash do token para armazenamento seguro"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    def send_verification_email(self, user):
        """Enviar email de verificação de conta"""
        try:
            # Gerar token
            token = self.generate_secure_token()
            token_hash = self.hash_token(token)
            
            # Salvar token no banco
            verification_token = EmailVerificationToken(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=datetime.utcnow() + timedelta(hours=24),
                created_at=datetime.utcnow()
            )
            
            db.session.add(verification_token)
            db.session.commit()
            
            # Criar link de verificação
            verification_link = f"{self.base_url}/verify-email/{token}"
            
            # Template HTML
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Verificação de Email - iLyra</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌟 Bem-vindo ao iLyra!</h1>
                    </div>
                    <div class="content">
                        <h2>Olá, {user.username}!</h2>
                        <p>Obrigado por se cadastrar na plataforma iLyra. Para ativar sua conta e começar sua jornada espiritual, clique no botão abaixo:</p>
                        
                        <a href="{verification_link}" class="button">✅ Verificar Email</a>
                        
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{verification_link}</p>
                        
                        <p><strong>Este link expira em 24 horas.</strong></p>
                        
                        <p>Se você não se cadastrou no iLyra, pode ignorar este email.</p>
                        
                        <hr>
                        <p>Com amor e luz,<br>Equipe iLyra 🌟</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 iLyra Platform. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Conteúdo texto
            text_content = f"""
            Bem-vindo ao iLyra!
            
            Olá, {user.username}!
            
            Obrigado por se cadastrar na plataforma iLyra. Para ativar sua conta, acesse o link abaixo:
            
            {verification_link}
            
            Este link expira em 24 horas.
            
            Se você não se cadastrou no iLyra, pode ignorar este email.
            
            Com amor e luz,
            Equipe iLyra
            """
            
            # Enviar email
            success = self._send_email(
                user.email,
                "🌟 Verificação de Email - iLyra Platform",
                html_content,
                text_content
            )
            
            return success, token if success else None
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao enviar email de verificação: {str(e)}")
            return False, None
    
    def send_password_reset_email(self, user):
        """Enviar email de recuperação de senha"""
        try:
            # Gerar token
            token = self.generate_secure_token()
            token_hash = self.hash_token(token)
            
            # Salvar token no banco
            reset_token = PasswordResetToken(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=datetime.utcnow() + timedelta(hours=1),  # 1 hora para reset
                created_at=datetime.utcnow()
            )
            
            db.session.add(reset_token)
            db.session.commit()
            
            # Criar link de reset
            reset_link = f"{self.base_url}/reset-password/{token}"
            
            # Template HTML
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Recuperação de Senha - iLyra</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Recuperação de Senha</h1>
                    </div>
                    <div class="content">
                        <h2>Olá, {user.username}!</h2>
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta no iLyra.</p>
                        
                        <a href="{reset_link}" class="button">🔑 Redefinir Senha</a>
                        
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{reset_link}</p>
                        
                        <div class="warning">
                            <strong>⚠️ Importante:</strong>
                            <ul>
                                <li>Este link expira em 1 hora por segurança</li>
                                <li>Se você não solicitou esta recuperação, ignore este email</li>
                                <li>Sua senha atual permanece ativa até que seja alterada</li>
                            </ul>
                        </div>
                        
                        <p>Se você continuar tendo problemas, entre em contato conosco.</p>
                        
                        <hr>
                        <p>Com amor e luz,<br>Equipe iLyra 🌟</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 iLyra Platform. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Conteúdo texto
            text_content = f"""
            Recuperação de Senha - iLyra
            
            Olá, {user.username}!
            
            Recebemos uma solicitação para redefinir a senha da sua conta no iLyra.
            
            Acesse o link abaixo para redefinir sua senha:
            {reset_link}
            
            IMPORTANTE:
            - Este link expira em 1 hora por segurança
            - Se você não solicitou esta recuperação, ignore este email
            - Sua senha atual permanece ativa até que seja alterada
            
            Com amor e luz,
            Equipe iLyra
            """
            
            # Enviar email
            success = self._send_email(
                user.email,
                "🔐 Recuperação de Senha - iLyra Platform",
                html_content,
                text_content
            )
            
            return success, token if success else None
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao enviar email de recuperação: {str(e)}")
            return False, None
    
    def verify_email_token(self, token):
        """Verificar token de email"""
        try:
            token_hash = self.hash_token(token)
            
            # Buscar token válido
            verification_token = EmailVerificationToken.query.filter_by(
                token_hash=token_hash,
                used=False
            ).filter(
                EmailVerificationToken.expires_at > datetime.utcnow()
            ).first()
            
            if not verification_token:
                return False, "Token inválido ou expirado"
            
            # Marcar token como usado
            verification_token.used = True
            verification_token.used_at = datetime.utcnow()
            
            # Ativar usuário
            user = User.query.get(verification_token.user_id)
            if user:
                user.email_verified = True
                user.email_verified_at = datetime.utcnow()
            
            db.session.commit()
            
            return True, "Email verificado com sucesso"
            
        except Exception as e:
            db.session.rollback()
            return False, f"Erro interno: {str(e)}"
    
    def verify_password_reset_token(self, token):
        """Verificar token de reset de senha"""
        try:
            token_hash = self.hash_token(token)
            
            # Buscar token válido
            reset_token = PasswordResetToken.query.filter_by(
                token_hash=token_hash,
                used=False
            ).filter(
                PasswordResetToken.expires_at > datetime.utcnow()
            ).first()
            
            if not reset_token:
                return False, None, "Token inválido ou expirado"
            
            user = User.query.get(reset_token.user_id)
            if not user:
                return False, None, "Usuário não encontrado"
            
            return True, reset_token, "Token válido"
            
        except Exception as e:
            return False, None, f"Erro interno: {str(e)}"
    
    def reset_password_with_token(self, token, new_password):
        """Redefinir senha usando token"""
        try:
            # Verificar token
            valid, reset_token, message = self.verify_password_reset_token(token)
            
            if not valid:
                return False, message
            
            # Validar nova senha
            if not new_password or len(new_password) < 6:
                return False, "Nova senha deve ter pelo menos 6 caracteres"
            
            # Atualizar senha
            user = User.query.get(reset_token.user_id)
            from werkzeug.security import generate_password_hash
            user.password_hash = generate_password_hash(new_password)
            
            # Marcar token como usado
            reset_token.used = True
            reset_token.used_at = datetime.utcnow()
            
            db.session.commit()
            
            return True, "Senha redefinida com sucesso"
            
        except Exception as e:
            db.session.rollback()
            return False, f"Erro interno: {str(e)}"
    
    def cleanup_expired_tokens(self):
        """Limpar tokens expirados (executar periodicamente)"""
        try:
            now = datetime.utcnow()
            
            # Remover tokens de verificação expirados
            EmailVerificationToken.query.filter(
                EmailVerificationToken.expires_at < now
            ).delete()
            
            # Remover tokens de reset expirados
            PasswordResetToken.query.filter(
                PasswordResetToken.expires_at < now
            ).delete()
            
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao limpar tokens: {str(e)}")
            return False

# Instância global do serviço
email_service = EmailService()
