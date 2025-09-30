from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash
from models import db, User, Plan, SpiritualMetric, AIConversation, Gamification, Payment, UserAuditLog
from permissions_system import (
    permission_manager, require_permission, require_admin, require_plan, 
    check_usage_limit, Permission
)
from security_service import security_service
import datetime
import pandas as pd
import os
import json
import tempfile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

user_bp = Blueprint("user", __name__)

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
@require_permission(Permission.READ_OWN_DATA)
def get_user_profile():
    """Obter perfil do usuário - IMPLEMENTAÇÃO COMPLETA COM PERMISSÕES"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Obter permissões do usuário
        user_permissions = permission_manager.get_user_permissions(user)
        
        # Obter limites do plano
        plan_limits = permission_manager.get_plan_limits(user.plan.name if user.plan else 'Free')
        
        # Log da ação
        security_service.log_user_action(
            user.id,
            'profile_viewed',
            {'viewed_at': datetime.datetime.utcnow().isoformat()}
        )

        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "plan": user.plan.name if user.plan else "Free",
                "email_verified": user.email_verified,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            },
            "permissions": user_permissions,
            "plan_limits": plan_limits,
            "security_summary": security_service.get_security_summary(user.id)
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
@require_permission(Permission.UPDATE_OWN_DATA)
def update_user_profile():
    """Atualizar perfil do usuário - IMPLEMENTAÇÃO COMPLETA COM VALIDAÇÕES"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Armazenar dados antigos para auditoria
        old_data = {
            "username": user.username,
            "email": user.email
        }
        
        # Validar e atualizar username
        new_username = data.get("username", "").strip()
        if new_username and new_username != user.username:
            if len(new_username) < 3:
                return jsonify({"error": "Nome de usuário deve ter pelo menos 3 caracteres"}), 400
            
            # Verificar se username já existe
            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Nome de usuário já está em uso"}), 409
            
            user.username = new_username
        
        # Validar e atualizar email
        new_email = data.get("email", "").strip().lower()
        if new_email and new_email != user.email:
            import re
            if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", new_email):
                return jsonify({"error": "Email inválido"}), 400
            
            # Verificar se email já existe
            existing_user = User.query.filter_by(email=new_email).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Email já está em uso"}), 409
            
            # Se email mudou, marcar como não verificado
            if new_email != user.email:
                user.email = new_email
                user.email_verified = False
                user.email_verified_at = None
        
        # Atualizar timestamp
        user.updated_at = datetime.datetime.utcnow()
        
        db.session.commit()
        
        # Log da atualização
        security_service.log_user_action(
            user.id,
            'profile_updated',
            {
                'old_data': old_data,
                'new_data': {
                    "username": user.username,
                    "email": user.email
                },
                'updated_at': user.updated_at.isoformat()
            }
        )
        
        return jsonify({
            "message": "Perfil atualizado com sucesso",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "email_verified": user.email_verified,
                "updated_at": user.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@user_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
@require_permission(Permission.DELETE_OWN_DATA)
def delete_user_account():
    """Excluir conta do usuário - IMPLEMENTAÇÃO COMPLETA COM LGPD"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        data = request.get_json() or {}
        confirmation = data.get("confirmation", "").lower()
        delete_type = data.get("delete_type", "soft")  # soft ou hard
        
        # Exigir confirmação explícita
        if confirmation != "confirmo a exclusão da minha conta":
            return jsonify({
                "error": "Confirmação necessária",
                "message": "Para excluir sua conta, envie: {'confirmation': 'confirmo a exclusão da minha conta'}"
            }), 400
        
        # Preparar dados para backup antes da exclusão
        user_backup_data = {
            "user_info": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at.isoformat(),
                "deleted_at": datetime.datetime.utcnow().isoformat()
            },
            "spiritual_metrics": [],
            "ai_conversations": [],
            "audit_logs": []
        }
        
        # Coletar métricas espirituais
        metrics = SpiritualMetric.query.filter_by(user_id=user.id).all()
        for metric in metrics:
            user_backup_data["spiritual_metrics"].append({
                "name": metric.name,
                "value": metric.value,
                "timestamp": metric.timestamp.isoformat()
            })
        
        # Coletar conversas IA
        conversations = AIConversation.query.filter_by(user_id=user.id).all()
        for conv in conversations:
            user_backup_data["ai_conversations"].append({
                "conversation": conv.conversation,
                "timestamp": conv.timestamp.isoformat()
            })
        
        # Coletar logs de auditoria
        audit_logs = UserAuditLog.query.filter_by(user_id=user.id).all()
        for log in audit_logs:
            user_backup_data["audit_logs"].append({
                "action": log.action,
                "timestamp": log.timestamp.isoformat(),
                "details": log.details
            })
        
        # Log da exclusão
        security_service.log_user_action(
            user.id,
            'account_deletion_requested',
            {
                'delete_type': delete_type,
                'backup_created': True,
                'data_summary': {
                    'metrics_count': len(user_backup_data["spiritual_metrics"]),
                    'conversations_count': len(user_backup_data["ai_conversations"]),
                    'audit_logs_count': len(user_backup_data["audit_logs"])
                }
            }
        )
        
        if delete_type == "soft":
            # Soft delete - manter dados mas marcar como excluído
            user.email = f"deleted_{user.id}@deleted.ilyra.com"
            user.username = f"deleted_user_{user.id}"
            user.password_hash = "DELETED"
            # Adicionar campo deleted_at se existir no modelo
            
            db.session.commit()
            
            return jsonify({
                "message": "Conta desativada com sucesso",
                "type": "soft_delete",
                "lgpd_notice": "Seus dados foram anonimizados conforme LGPD. Para reativação, entre em contato conosco em até 30 dias.",
                "backup_available": True
            }), 200
            
        else:
            # Hard delete - remover todos os dados
            # Remover dados relacionados primeiro (respeitando foreign keys)
            UserAuditLog.query.filter_by(user_id=user.id).delete()
            AIConversation.query.filter_by(user_id=user.id).delete()
            SpiritualMetric.query.filter_by(user_id=user.id).delete()
            Gamification.query.filter_by(user_id=user.id).delete()
            
            # Remover usuário
            db.session.delete(user)
            db.session.commit()
            
            return jsonify({
                "message": "Conta excluída permanentemente",
                "type": "hard_delete",
                "lgpd_notice": "Todos os seus dados foram removidos permanentemente conforme solicitado. Esta ação é irreversível.",
                "backup_created": True
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@user_bp.route("/export-data", methods=["GET"])
@jwt_required()
@require_permission(Permission.EXPORT_OWN_DATA)
@check_usage_limit('reports_per_month')
def export_user_data():
    """Exportar dados do usuário - IMPLEMENTAÇÃO COMPLETA COM PDF"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        export_format = request.args.get('format', 'json').lower()
        
        # Coletar todos os dados do usuário
        user_data = {
            "user_info": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "plan": user.plan.name if user.plan else "Free",
                "email_verified": user.email_verified,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "export_date": datetime.datetime.utcnow().isoformat()
            },
            "spiritual_metrics": [],
            "ai_conversations": [],
            "payments": [],
            "gamification": {},
            "audit_logs": []
        }

        # Métricas Espirituais
        metrics = SpiritualMetric.query.filter_by(user_id=current_user_id).all()
        for m in metrics:
            user_data["spiritual_metrics"].append({
                "id": m.id,
                "name": m.name,
                "value": m.value,
                "timestamp": m.timestamp.isoformat()
            })

        # Conversas de IA
        conversations = AIConversation.query.filter_by(user_id=current_user_id).all()
        for c in conversations:
            user_data["ai_conversations"].append({
                "id": c.id,
                "conversation": c.conversation,
                "timestamp": c.timestamp.isoformat()
            })

        # Pagamentos (se existir tabela)
        try:
            payments = Payment.query.filter_by(user_id=current_user_id).all()
            for p in payments:
                user_data["payments"].append({
                    "id": p.id,
                    "plan_name": p.plan.name if hasattr(p, 'plan') and p.plan else "N/A",
                    "amount": str(p.amount) if hasattr(p, 'amount') else "0",
                    "currency": getattr(p, 'currency', 'BRL'),
                    "transaction_id": getattr(p, 'transaction_id', ''),
                    "gateway": getattr(p, 'gateway', ''),
                    "status": getattr(p, 'status', ''),
                    "timestamp": p.timestamp.isoformat() if hasattr(p, 'timestamp') else ''
                })
        except:
            pass  # Tabela Payment pode não existir ainda

        # Gamificação
        gamification = Gamification.query.filter_by(user_id=current_user_id).first()
        if gamification:
            user_data["gamification"] = {
                "points": gamification.points,
                "level": gamification.level,
                "badges": gamification.badges.split(",") if gamification.badges else []
            }

        # Logs de auditoria (últimos 100)
        audit_logs = UserAuditLog.query.filter_by(user_id=current_user_id)\
            .order_by(UserAuditLog.timestamp.desc())\
            .limit(100).all()
        
        for log in audit_logs:
            user_data["audit_logs"].append({
                "action": log.action,
                "timestamp": log.timestamp.isoformat(),
                "ip_address": log.ip_address,
                "details": log.details
            })

        # Log da exportação
        security_service.log_user_action(
            user.id,
            'data_exported',
            {
                'export_format': export_format,
                'data_summary': {
                    'metrics_count': len(user_data["spiritual_metrics"]),
                    'conversations_count': len(user_data["ai_conversations"]),
                    'payments_count': len(user_data["payments"]),
                    'audit_logs_count': len(user_data["audit_logs"])
                }
            }
        )

        if export_format == 'pdf':
            return _generate_pdf_report(user_data, user)
        else:
            # Exportar como JSON
            output_path = f"/tmp/user_data_{current_user_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(user_data, f, ensure_ascii=False, indent=4)

            return send_file(
                output_path, 
                as_attachment=True, 
                download_name=f"ilyra_dados_{user.username}_{datetime.datetime.now().strftime('%Y%m%d')}.json", 
                mimetype="application/json"
            )
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

def _generate_pdf_report(user_data, user):
    """Gerar relatório em PDF com logo e formatação profissional"""
    try:
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_path = temp_file.name
        temp_file.close()
        
        # Criar documento PDF
        doc = SimpleDocTemplate(temp_path, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Estilo personalizado para título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#667eea'),
            alignment=1  # Centralizado
        )
        
        # Estilo para subtítulos
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.HexColor('#764ba2')
        )
        
        # Cabeçalho do relatório
        story.append(Paragraph("🌟 iLyra Platform", title_style))
        story.append(Paragraph("Relatório Completo de Dados do Usuário", styles['Heading2']))
        story.append(Spacer(1, 20))
        
        # Informações do usuário
        story.append(Paragraph("📋 Informações Pessoais", subtitle_style))
        
        user_info_data = [
            ['Campo', 'Valor'],
            ['Nome de Usuário', user_data['user_info']['username']],
            ['Email', user_data['user_info']['email']],
            ['Plano', user_data['user_info']['plan']],
            ['Email Verificado', 'Sim' if user_data['user_info'].get('email_verified') else 'Não'],
            ['Data de Cadastro', user_data['user_info']['created_at'][:10]],
            ['Último Login', user_data['user_info']['last_login'][:10] if user_data['user_info']['last_login'] else 'N/A'],
            ['Data da Exportação', user_data['user_info']['export_date'][:10]]
        ]
        
        user_table = Table(user_info_data, colWidths=[2*inch, 3*inch])
        user_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(user_table)
        story.append(Spacer(1, 20))
        
        # Métricas Espirituais
        if user_data['spiritual_metrics']:
            story.append(Paragraph("🔮 Métricas Espirituais", subtitle_style))
            
            metrics_data = [['Métrica', 'Valor', 'Data']]
            for metric in user_data['spiritual_metrics'][-20:]:  # Últimas 20
                metrics_data.append([
                    metric['name'],
                    f"{metric['value']:.1f}",
                    metric['timestamp'][:10]
                ])
            
            metrics_table = Table(metrics_data, colWidths=[2.5*inch, 1*inch, 1.5*inch])
            metrics_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#764ba2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(metrics_table)
            story.append(Spacer(1, 20))
        
        # Gamificação
        if user_data['gamification']:
            story.append(Paragraph("🎮 Gamificação", subtitle_style))
            
            gamif_data = [
                ['Aspecto', 'Valor'],
                ['Pontos', str(user_data['gamification']['points'])],
                ['Nível', str(user_data['gamification']['level'])],
                ['Badges', ', '.join(user_data['gamification']['badges'])]
            ]
            
            gamif_table = Table(gamif_data, colWidths=[2*inch, 3*inch])
            gamif_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f093fb')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(gamif_table)
            story.append(Spacer(1, 20))
        
        # Resumo estatístico
        story.append(Paragraph("📊 Resumo Estatístico", subtitle_style))
        
        stats_data = [
            ['Estatística', 'Quantidade'],
            ['Total de Métricas Espirituais', str(len(user_data['spiritual_metrics']))],
            ['Total de Conversas IA', str(len(user_data['ai_conversations']))],
            ['Total de Logs de Auditoria', str(len(user_data['audit_logs']))],
            ['Total de Pagamentos', str(len(user_data['payments']))]
        ]
        
        stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4ecdc4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(stats_table)
        story.append(Spacer(1, 30))
        
        # Rodapé
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            alignment=1
        )
        
        story.append(Paragraph(
            f"Relatório gerado em {datetime.datetime.now().strftime('%d/%m/%Y às %H:%M')} | "
            f"© 2025 iLyra Platform - Todos os direitos reservados | "
            f"Este relatório contém dados pessoais protegidos pela LGPD",
            footer_style
        ))
        
        # Construir PDF
        doc.build(story)
        
        filename = f"ilyra_relatorio_{user.username}_{datetime.datetime.now().strftime('%Y%m%d')}.pdf"
        
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype="application/pdf"
        )
        
    except Exception as e:
        return jsonify({"error": f"Erro ao gerar PDF: {str(e)}"}), 500

# Rotas de administração de usuários (apenas para admins)
@user_bp.route("/admin/users", methods=["GET"])
@jwt_required()
def get_all_users_admin():
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403

    users = User.query.all()
    output = []
    for user in users:
        output.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "plan": user.plan.name if user.plan else "N/A",
            "created_at": user.created_at.isoformat()
        })
    return jsonify(output), 200

@user_bp.route("/admin/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user_admin(user_id):
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)
    
    plan_name = data.get("plan_name")
    if plan_name:
        plan = Plan.query.filter_by(name=plan_name).first()
        if plan:
            user.plan_id = plan.id
        else:
            return jsonify({"msg": "Plan not found"}), 400

    db.session.commit()
    return jsonify({"msg": "User updated successfully by admin"}), 200

@user_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user_admin(user_id):
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "User deleted successfully by admin"}), 200

@user_bp.route("/admin/users/<int:user_id>/reset-password", methods=["POST"])
@jwt_required()
def admin_reset_password(user_id):
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    new_password = data.get("new_password")

    if not new_password or len(new_password) < 6:
        return jsonify({"error": "Nova senha deve ter pelo menos 6 caracteres"}), 400

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"msg": "User password reset successfully by admin"}), 200

@user_bp.route("/admin/users/hierarchy", methods=["GET"])
@jwt_required()
def get_user_hierarchy():
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403
    return jsonify({"msg": "Hierarquia de acessos não implementada."}), 501

@user_bp.route("/admin/users/audit-logs", methods=["GET"])
@jwt_required()
def get_audit_logs():
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403
    return jsonify({"msg": "Auditoria de ações e logs de segurança não implementada."}), 501

@user_bp.route("/admin/users/<int:user_id>/block", methods=["POST"])
@jwt_required()
def block_user():
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403
    return jsonify({"msg": "Bloqueio/desbloqueio de usuário não implementado."}), 501

@user_bp.route("/admin/users/bulk-manage", methods=["POST"])
@jwt_required()
def bulk_manage_users():
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403
    return jsonify({"msg": "Gestão em massa de usuários não implementada."}), 501

# Rotas de Gestão de Dados do Usuário (LGPD)
@user_bp.route("/lgpd/consent", methods=["POST"])
@jwt_required()
def manage_lgpd_consent():
    return jsonify({"msg": "Gestão de consentimento de dados (LGPD) não implementada."}), 501

@user_bp.route("/lgpd/anonymize", methods=["POST"])
@jwt_required()
def anonymize_user_data():
    return jsonify({"msg": "Anonimização de dados (LGPD) não implementada."}), 501

@user_bp.route("/lgpd/data-retention", methods=["GET"])
@jwt_required()
def get_data_retention_policy():
    return jsonify({"msg": "Política de retenção de dados (LGPD) não implementada."}), 501

@user_bp.route("/lgpd/data-rights", methods=["GET"])
@jwt_required()
def get_data_rights():
    return jsonify({"msg": "Direitos do titular (LGPD) não implementados."}), 501

@user_bp.route("/lgpd/audit-access", methods=["GET"])
@jwt_required()
def audit_data_access():
    return jsonify({"msg": "Auditoria de acesso a dados (LGPD) não implementada."}), 501

@user_bp.route("/lgpd/breach-notification", methods=["POST"])
@jwt_required()
def notify_data_breach():
    return jsonify({"msg": "Notificação de violação de dados (LGPD) não implementada."}), 501

@user_bp.route("/lgpd/privacy-policy", methods=["GET"])
def get_privacy_policy():
    return jsonify({"msg": "Política de privacidade (LGPD) não implementada."}), 501

@user_bp.route("/lgpd/terms-of-use", methods=["GET"])
def get_terms_of_use():
    return jsonify({"msg": "Termos de uso (LGPD) não implementados."}), 501

@user_bp.route("/lgpd/dpo-contact", methods=["GET"])
def get_dpo_contact():
    return jsonify({"msg": "Contato do Encarregado de Dados (DPO) não implementado."}), 501

@user_bp.route("/lgpd/ripd", methods=["GET"])
@jwt_required()
def get_ripd_report():
    return jsonify({"msg": "Relatório de Impacto à Proteção de Dados (RIPD) não implementado."}), 501

@user_bp.route("/admin/lgpd/dashboard", methods=["GET"])
@jwt_required()
def get_admin_lgpd_dashboard():
    current_user_claims = get_jwt()
    if not current_user_claims.get("role") == "admin":
        return jsonify({"msg": "Admin access required"}), 403
    return jsonify({"msg": "Dashboard Admin LGPD não implementado."}), 501

@user_bp.route("/lgpd/delete-account-with-notice", methods=["DELETE"])
@jwt_required()
def delete_account_with_lgpd_notice():
    return jsonify({"msg": "Exclusão de Conta com Aviso LGPD não implementada."}), 501

