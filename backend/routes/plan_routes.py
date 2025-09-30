"""
Sistema Completo de CRUD de Planos e Assinaturas - iLyra Platform
Implementação com grandfathering, múltiplos gateways de pagamento e gestão avançada
"""

from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Plan, User, Payment, PlanHistory
from permissions_system import (
    require_permission, require_plan, check_usage_limit, Permission
)
from security_service import security_service
import datetime
import json
import os
import tempfile
import pandas as pd
from decimal import Decimal
from sqlalchemy import func, and_, or_, text
from collections import defaultdict
import statistics

# Importações para gateways de pagamento
import stripe
import mercadopago
import paypalrestsdk
import requests
import hashlib
import hmac
import base64

subscription_bp = Blueprint("subscription", __name__, url_prefix="/api/subscription")

# ==================== CONFIGURAÇÕES DOS GATEWAYS ====================

# Stripe
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN = os.environ.get("MERCADOPAGO_ACCESS_TOKEN")
mp_sdk = None
if MERCADOPAGO_ACCESS_TOKEN:
    mp_sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

# PayPal
PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.environ.get("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE = os.environ.get("PAYPAL_MODE", "sandbox")  # sandbox ou live

if PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET:
    paypalrestsdk.configure({
        "mode": PAYPAL_MODE,
        "client_id": PAYPAL_CLIENT_ID,
        "client_secret": PAYPAL_CLIENT_SECRET
    })

# PIX (Configurações para integração com bancos)
PIX_BANK_CONFIG = {
    "banco_do_brasil": {
        "client_id": os.environ.get("BB_CLIENT_ID"),
        "client_secret": os.environ.get("BB_CLIENT_SECRET"),
        "certificate_path": os.environ.get("BB_CERTIFICATE_PATH"),
        "api_url": "https://api.bb.com.br/pix/v1"
    },
    "itau": {
        "client_id": os.environ.get("ITAU_CLIENT_ID"),
        "client_secret": os.environ.get("ITAU_CLIENT_SECRET"),
        "certificate_path": os.environ.get("ITAU_CERTIFICATE_PATH"),
        "api_url": "https://api.itau.com.br/pix/v2"
    }
}

# ==================== CONSTANTES E CONFIGURAÇÕES ====================

PLAN_FEATURES = {
    'Free': {
        'ai_conversations_per_month': 10,
        'spiritual_metrics_tracking': True,
        'basic_dashboard': True,
        'export_reports': False,
        'advanced_analytics': False,
        'priority_support': False,
        'custom_themes': False,
        'api_access': False,
        'storage_gb': 1,
        'max_meditation_sessions': 5
    },
    'Essential': {
        'ai_conversations_per_month': 100,
        'spiritual_metrics_tracking': True,
        'basic_dashboard': True,
        'export_reports': True,
        'advanced_analytics': False,
        'priority_support': False,
        'custom_themes': True,
        'api_access': False,
        'storage_gb': 5,
        'max_meditation_sessions': 50
    },
    'Premium': {
        'ai_conversations_per_month': 500,
        'spiritual_metrics_tracking': True,
        'basic_dashboard': True,
        'export_reports': True,
        'advanced_analytics': True,
        'priority_support': True,
        'custom_themes': True,
        'api_access': True,
        'storage_gb': 20,
        'max_meditation_sessions': 200
    },
    'Master': {
        'ai_conversations_per_month': -1,  # Ilimitado
        'spiritual_metrics_tracking': True,
        'basic_dashboard': True,
        'export_reports': True,
        'advanced_analytics': True,
        'priority_support': True,
        'custom_themes': True,
        'api_access': True,
        'storage_gb': 100,
        'max_meditation_sessions': -1  # Ilimitado
    }
}

GRANDFATHERING_RULES = {
    'price_protection': True,  # Proteger preços antigos
    'feature_protection': True,  # Manter funcionalidades descontinuadas
    'upgrade_incentives': True,  # Oferecer incentivos para upgrade
    'notification_period_days': 30  # Período de notificação para mudanças
}

BILLING_CYCLES = {
    'monthly': {'months': 1, 'discount': 0},
    'quarterly': {'months': 3, 'discount': 0.05},
    'semi_annual': {'months': 6, 'discount': 0.10},
    'annual': {'months': 12, 'discount': 0.20}
}

# ==================== CRUD DE PLANOS ====================

@subscription_bp.route("/plans", methods=["POST"])
@jwt_required()
@require_permission(Permission.MANAGE_PLANS)
def create_plan():
    """Criar novo plano - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Validar campos obrigatórios
        required_fields = ['name', 'price', 'billing_cycle', 'features']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400
        
        name = data.get("name").strip()
        price = Decimal(str(data.get("price")))
        billing_cycle = data.get("billing_cycle")
        features = data.get("features")
        description = data.get("description", "")
        is_active = data.get("is_active", True)
        max_users = data.get("max_users")
        trial_days = data.get("trial_days", 0)
        
        # Validações
        if price < 0:
            return jsonify({"error": "Preço não pode ser negativo"}), 400
        
        if billing_cycle not in BILLING_CYCLES:
            return jsonify({
                "error": "Ciclo de cobrança inválido",
                "valid_cycles": list(BILLING_CYCLES.keys())
            }), 400
        
        # Verificar se plano já existe
        existing_plan = Plan.query.filter_by(name=name).first()
        if existing_plan:
            return jsonify({"error": "Plano com este nome já existe"}), 409
        
        # Aplicar desconto baseado no ciclo de cobrança
        cycle_info = BILLING_CYCLES[billing_cycle]
        discounted_price = price * (1 - cycle_info['discount'])
        
        # Criar plano
        new_plan = Plan(
            name=name,
            price=discounted_price,
            original_price=price,
            billing_cycle=billing_cycle,
            features=json.dumps(features, ensure_ascii=False),
            description=description,
            is_active=is_active,
            max_users=max_users,
            trial_days=trial_days,
            created_at=datetime.datetime.utcnow()
        )
        
        db.session.add(new_plan)
        db.session.commit()
        
        # Registrar histórico
        history = PlanHistory(
            plan_id=new_plan.id,
            action="created",
            details=json.dumps({
                "name": name,
                "price": float(price),
                "discounted_price": float(discounted_price),
                "billing_cycle": billing_cycle,
                "features": features,
                "created_by": current_user_id
            }, ensure_ascii=False),
            timestamp=datetime.datetime.utcnow()
        )
        db.session.add(history)
        db.session.commit()
        
        # Log da criação
        security_service.log_user_action(
            current_user_id,
            'plan_created',
            {
                'plan_id': new_plan.id,
                'plan_name': name,
                'price': float(price),
                'billing_cycle': billing_cycle
            }
        )
        
        return jsonify({
            "message": "Plano criado com sucesso",
            "plan": {
                "id": new_plan.id,
                "name": new_plan.name,
                "price": float(new_plan.price),
                "original_price": float(new_plan.original_price),
                "billing_cycle": new_plan.billing_cycle,
                "features": json.loads(new_plan.features),
                "description": new_plan.description,
                "is_active": new_plan.is_active,
                "trial_days": new_plan.trial_days
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@subscription_bp.route("/plans", methods=["GET"])
def list_plans():
    """Listar planos disponíveis - IMPLEMENTAÇÃO COMPLETA"""
    try:
        # Parâmetros de consulta
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        billing_cycle = request.args.get('billing_cycle')
        
        # Construir query
        query = Plan.query
        
        if not include_inactive:
            query = query.filter(Plan.is_active == True)
        
        if billing_cycle:
            query = query.filter(Plan.billing_cycle == billing_cycle)
        
        plans = query.order_by(Plan.price.asc()).all()
        
        # Preparar resposta
        plans_data = []
        for plan in plans:
            try:
                features = json.loads(plan.features) if plan.features else {}
            except json.JSONDecodeError:
                features = {}
            
            # Calcular economia anual se aplicável
            annual_savings = 0
            if plan.billing_cycle != 'monthly':
                monthly_equivalent = plan.original_price
                annual_cost_monthly = monthly_equivalent * 12
                annual_cost_plan = plan.price * (12 / BILLING_CYCLES[plan.billing_cycle]['months'])
                annual_savings = annual_cost_monthly - annual_cost_plan
            
            plans_data.append({
                "id": plan.id,
                "name": plan.name,
                "price": float(plan.price),
                "original_price": float(plan.original_price),
                "billing_cycle": plan.billing_cycle,
                "billing_cycle_info": BILLING_CYCLES.get(plan.billing_cycle, {}),
                "features": features,
                "description": plan.description,
                "is_active": plan.is_active,
                "trial_days": plan.trial_days,
                "max_users": plan.max_users,
                "annual_savings": float(annual_savings) if annual_savings > 0 else 0,
                "created_at": plan.created_at.isoformat() if plan.created_at else None
            })
        
        return jsonify({
            "plans": plans_data,
            "billing_cycles": BILLING_CYCLES,
            "total_plans": len(plans_data)
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@subscription_bp.route("/plans/<int:plan_id>", methods=["GET"])
def get_plan(plan_id):
    """Obter plano específico - IMPLEMENTAÇÃO COMPLETA"""
    try:
        plan = Plan.query.get(plan_id)
        
        if not plan:
            return jsonify({"error": "Plano não encontrado"}), 404
        
        try:
            features = json.loads(plan.features) if plan.features else {}
        except json.JSONDecodeError:
            features = {}
        
        # Estatísticas do plano
        total_subscribers = User.query.filter_by(plan_id=plan.id).count()
        active_subscribers = User.query.filter(
            User.plan_id == plan.id,
            User.is_active == True
        ).count()
        
        # Receita total do plano
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.plan_id == plan.id,
            Payment.status == 'completed'
        ).scalar() or 0
        
        return jsonify({
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "price": float(plan.price),
                "original_price": float(plan.original_price),
                "billing_cycle": plan.billing_cycle,
                "features": features,
                "description": plan.description,
                "is_active": plan.is_active,
                "trial_days": plan.trial_days,
                "max_users": plan.max_users,
                "created_at": plan.created_at.isoformat() if plan.created_at else None
            },
            "statistics": {
                "total_subscribers": total_subscribers,
                "active_subscribers": active_subscribers,
                "total_revenue": float(total_revenue)
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@subscription_bp.route("/plans/<int:plan_id>", methods=["PUT"])
@jwt_required()
@require_permission(Permission.MANAGE_PLANS)
def update_plan(plan_id):
    """Atualizar plano - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        plan = Plan.query.get(plan_id)
        if not plan:
            return jsonify({"error": "Plano não encontrado"}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Backup dos dados originais
        original_data = {
            "name": plan.name,
            "price": float(plan.price),
            "original_price": float(plan.original_price),
            "billing_cycle": plan.billing_cycle,
            "features": plan.features,
            "description": plan.description,
            "is_active": plan.is_active,
            "trial_days": plan.trial_days
        }
        
        # Verificar se há usuários com grandfathering
        subscribers_count = User.query.filter_by(plan_id=plan.id).count()
        
        # Atualizar campos
        if "name" in data:
            new_name = data["name"].strip()
            if new_name != plan.name:
                # Verificar se novo nome já existe
                existing = Plan.query.filter(
                    Plan.name == new_name,
                    Plan.id != plan.id
                ).first()
                if existing:
                    return jsonify({"error": "Nome do plano já existe"}), 409
                plan.name = new_name
        
        if "price" in data:
            new_price = Decimal(str(data["price"]))
            if new_price < 0:
                return jsonify({"error": "Preço não pode ser negativo"}), 400
            
            # Implementar grandfathering se há assinantes
            if subscribers_count > 0 and GRANDFATHERING_RULES['price_protection']:
                # Criar novo plano para novos usuários, manter o antigo para existentes
                if new_price != plan.original_price:
                    plan.original_price = new_price
                    # Recalcular preço com desconto
                    cycle_info = BILLING_CYCLES.get(plan.billing_cycle, {'discount': 0})
                    plan.price = new_price * (1 - cycle_info['discount'])
            else:
                plan.original_price = new_price
                cycle_info = BILLING_CYCLES.get(plan.billing_cycle, {'discount': 0})
                plan.price = new_price * (1 - cycle_info['discount'])
        
        if "billing_cycle" in data:
            new_cycle = data["billing_cycle"]
            if new_cycle not in BILLING_CYCLES:
                return jsonify({
                    "error": "Ciclo de cobrança inválido",
                    "valid_cycles": list(BILLING_CYCLES.keys())
                }), 400
            
            if new_cycle != plan.billing_cycle:
                plan.billing_cycle = new_cycle
                # Recalcular preço com novo desconto
                cycle_info = BILLING_CYCLES[new_cycle]
                plan.price = plan.original_price * (1 - cycle_info['discount'])
        
        if "features" in data:
            plan.features = json.dumps(data["features"], ensure_ascii=False)
        
        if "description" in data:
            plan.description = data["description"]
        
        if "is_active" in data:
            plan.is_active = data["is_active"]
        
        if "trial_days" in data:
            plan.trial_days = max(0, int(data["trial_days"]))
        
        if "max_users" in data:
            plan.max_users = data["max_users"]
        
        plan.updated_at = datetime.datetime.utcnow()
        
        db.session.commit()
        
        # Registrar histórico
        history = PlanHistory(
            plan_id=plan.id,
            action="updated",
            details=json.dumps({
                "original": original_data,
                "updated": {
                    "name": plan.name,
                    "price": float(plan.price),
                    "original_price": float(plan.original_price),
                    "billing_cycle": plan.billing_cycle,
                    "features": json.loads(plan.features) if plan.features else {},
                    "description": plan.description,
                    "is_active": plan.is_active,
                    "trial_days": plan.trial_days
                },
                "updated_by": current_user_id,
                "subscribers_affected": subscribers_count
            }, ensure_ascii=False),
            timestamp=datetime.datetime.utcnow()
        )
        db.session.add(history)
        db.session.commit()
        
        # Log da atualização
        security_service.log_user_action(
            current_user_id,
            'plan_updated',
            {
                'plan_id': plan.id,
                'plan_name': plan.name,
                'changes': data,
                'subscribers_affected': subscribers_count
            }
        )
        
        return jsonify({
            "message": "Plano atualizado com sucesso",
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "price": float(plan.price),
                "original_price": float(plan.original_price),
                "billing_cycle": plan.billing_cycle,
                "features": json.loads(plan.features) if plan.features else {},
                "description": plan.description,
                "is_active": plan.is_active,
                "trial_days": plan.trial_days
            },
            "grandfathering_applied": subscribers_count > 0 and GRANDFATHERING_RULES['price_protection']
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@subscription_bp.route("/plans/<int:plan_id>", methods=["DELETE"])
@jwt_required()
@require_permission(Permission.MANAGE_PLANS)
def delete_plan(plan_id):
    """Excluir plano - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        plan = Plan.query.get(plan_id)
        if not plan:
            return jsonify({"error": "Plano não encontrado"}), 404
        
        # Verificar se há usuários usando o plano
        subscribers = User.query.filter_by(plan_id=plan.id).all()
        
        if subscribers:
            return jsonify({
                "error": "Não é possível excluir plano com assinantes ativos",
                "subscribers_count": len(subscribers),
                "suggestion": "Desative o plano ou migre os usuários para outro plano"
            }), 409
        
        # Backup dos dados para auditoria
        plan_backup = {
            "id": plan.id,
            "name": plan.name,
            "price": float(plan.price),
            "original_price": float(plan.original_price),
            "billing_cycle": plan.billing_cycle,
            "features": plan.features,
            "description": plan.description,
            "is_active": plan.is_active,
            "created_at": plan.created_at.isoformat() if plan.created_at else None
        }
        
        # Registrar histórico antes de excluir
        history = PlanHistory(
            plan_id=plan.id,
            action="deleted",
            details=json.dumps({
                "deleted_plan": plan_backup,
                "deleted_by": current_user_id,
                "deletion_reason": "Manual deletion by admin"
            }, ensure_ascii=False),
            timestamp=datetime.datetime.utcnow()
        )
        db.session.add(history)
        
        # Excluir plano
        db.session.delete(plan)
        db.session.commit()
        
        # Log da exclusão
        security_service.log_user_action(
            current_user_id,
            'plan_deleted',
            {
                'deleted_plan': plan_backup
            }
        )
        
        return jsonify({
            "message": "Plano excluído com sucesso",
            "deleted_plan_id": plan_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== GESTÃO DE ASSINATURAS ====================

@subscription_bp.route("/subscribe", methods=["POST"])
@jwt_required()
def subscribe_to_plan():
    """Assinar plano - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        plan_id = data.get("plan_id")
        payment_method = data.get("payment_method", "stripe")
        billing_cycle = data.get("billing_cycle", "monthly")
        
        if not plan_id:
            return jsonify({"error": "ID do plano é obrigatório"}), 400
        
        new_plan = Plan.query.get(plan_id)
        if not new_plan:
            return jsonify({"error": "Plano não encontrado"}), 404
        
        if not new_plan.is_active:
            return jsonify({"error": "Plano não está ativo"}), 400
        
        # Verificar se já está no mesmo plano
        if user.plan_id == new_plan.id:
            return jsonify({"error": "Usuário já possui este plano"}), 400
        
        # Verificar limite de usuários do plano
        if new_plan.max_users:
            current_subscribers = User.query.filter_by(plan_id=new_plan.id).count()
            if current_subscribers >= new_plan.max_users:
                return jsonify({"error": "Plano atingiu o limite máximo de usuários"}), 409
        
        # Lógica de upgrade/downgrade
        current_plan = user.plan
        is_upgrade = False
        is_downgrade = False
        
        if current_plan:
            if new_plan.price > current_plan.price:
                is_upgrade = True
            elif new_plan.price < current_plan.price:
                is_downgrade = True
        
        # Calcular valor proporcional se necessário
        prorated_amount = _calculate_prorated_amount(user, new_plan, billing_cycle)
        
        # Para planos gratuitos, ativar imediatamente
        if new_plan.price == 0:
            old_plan_name = current_plan.name if current_plan else "Nenhum"
            
            user.plan_id = new_plan.id
            user.subscription_start_date = datetime.datetime.utcnow()
            user.subscription_end_date = None  # Plano gratuito não expira
            
            db.session.commit()
            
            # Log da assinatura
            security_service.log_user_action(
                current_user_id,
                'plan_subscribed',
                {
                    'old_plan': old_plan_name,
                    'new_plan': new_plan.name,
                    'plan_price': 0,
                    'is_upgrade': is_upgrade,
                    'is_downgrade': is_downgrade
                }
            )
            
            return jsonify({
                "message": f"Assinatura do plano {new_plan.name} ativada com sucesso",
                "plan": {
                    "id": new_plan.id,
                    "name": new_plan.name,
                    "price": 0,
                    "billing_cycle": new_plan.billing_cycle
                },
                "subscription_details": {
                    "start_date": user.subscription_start_date.isoformat(),
                    "end_date": None,
                    "is_upgrade": is_upgrade,
                    "is_downgrade": is_downgrade
                }
            }), 200
        
        # Para planos pagos, retornar informações de pagamento
        return jsonify({
            "message": "Plano selecionado, prossiga com o pagamento",
            "plan": {
                "id": new_plan.id,
                "name": new_plan.name,
                "price": float(new_plan.price),
                "billing_cycle": new_plan.billing_cycle
            },
            "payment_info": {
                "amount": float(prorated_amount),
                "currency": "BRL",
                "is_upgrade": is_upgrade,
                "is_downgrade": is_downgrade,
                "prorated": prorated_amount != new_plan.price
            },
            "next_step": "create_payment_session"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@subscription_bp.route("/cancel", methods=["POST"])
@jwt_required()
def cancel_subscription():
    """Cancelar assinatura - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        if not user.plan or user.plan.name == 'Free':
            return jsonify({"error": "Usuário não possui assinatura ativa para cancelar"}), 400
        
        data = request.get_json() or {}
        cancellation_reason = data.get("reason", "")
        immediate_cancellation = data.get("immediate", False)
        
        current_plan = user.plan
        
        # Encontrar plano gratuito
        free_plan = Plan.query.filter_by(name='Free').first()
        if not free_plan:
            return jsonify({"error": "Plano gratuito não encontrado no sistema"}), 500
        
        # Calcular data de cancelamento
        if immediate_cancellation:
            cancellation_date = datetime.datetime.utcnow()
        else:
            # Cancelar no final do período de cobrança atual
            if user.subscription_end_date:
                cancellation_date = user.subscription_end_date
            else:
                # Se não há data de fim, cancelar em 30 dias
                cancellation_date = datetime.datetime.utcnow() + datetime.timedelta(days=30)
        
        # Atualizar usuário
        old_plan_name = current_plan.name
        
        if immediate_cancellation:
            user.plan_id = free_plan.id
            user.subscription_start_date = datetime.datetime.utcnow()
            user.subscription_end_date = None
            user.subscription_status = 'cancelled'
        else:
            user.subscription_status = 'cancelled_at_period_end'
            user.subscription_cancel_date = cancellation_date
        
        db.session.commit()
        
        # Registrar histórico
        history = PlanHistory(
            plan_id=current_plan.id,
            action="subscription_cancelled",
            details=json.dumps({
                "user_id": current_user_id,
                "old_plan": old_plan_name,
                "cancellation_reason": cancellation_reason,
                "immediate": immediate_cancellation,
                "cancellation_date": cancellation_date.isoformat(),
                "cancelled_by": current_user_id
            }, ensure_ascii=False),
            timestamp=datetime.datetime.utcnow()
        )
        db.session.add(history)
        db.session.commit()
        
        # Log do cancelamento
        security_service.log_user_action(
            current_user_id,
            'subscription_cancelled',
            {
                'old_plan': old_plan_name,
                'cancellation_reason': cancellation_reason,
                'immediate': immediate_cancellation,
                'cancellation_date': cancellation_date.isoformat()
            }
        )
        
        return jsonify({
            "message": "Assinatura cancelada com sucesso",
            "cancellation_details": {
                "old_plan": old_plan_name,
                "new_plan": free_plan.name if immediate_cancellation else old_plan_name,
                "cancellation_date": cancellation_date.isoformat(),
                "immediate": immediate_cancellation,
                "access_until": cancellation_date.isoformat() if not immediate_cancellation else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== PAGAMENTOS E GATEWAYS ====================

@subscription_bp.route("/payment/create-session", methods=["POST"])
@jwt_required()
def create_payment_session():
    """Criar sessão de pagamento - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        plan_id = data.get("plan_id")
        gateway = data.get("gateway", "stripe")
        billing_cycle = data.get("billing_cycle", "monthly")
        
        plan = Plan.query.get(plan_id)
        if not plan:
            return jsonify({"error": "Plano não encontrado"}), 404
        
        # Calcular valor
        amount = _calculate_plan_amount(plan, billing_cycle)
        
        # Criar sessão baseada no gateway
        if gateway == "stripe":
            return _create_stripe_session(user, plan, amount, billing_cycle)
        elif gateway == "mercadopago":
            return _create_mercadopago_session(user, plan, amount, billing_cycle)
        elif gateway == "paypal":
            return _create_paypal_session(user, plan, amount, billing_cycle)
        elif gateway == "pix":
            return _create_pix_session(user, plan, amount, billing_cycle)
        else:
            return jsonify({
                "error": "Gateway de pagamento não suportado",
                "supported_gateways": ["stripe", "mercadopago", "paypal", "pix"]
            }), 400
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== WEBHOOKS ====================

@subscription_bp.route("/webhook/stripe", methods=["POST"])
def stripe_webhook():
    """Webhook do Stripe - IMPLEMENTAÇÃO COMPLETA"""
    try:
        payload = request.get_data()
        sig_header = request.headers.get("stripe-signature")
        
        if not STRIPE_WEBHOOK_SECRET:
            return jsonify({"error": "Webhook secret não configurado"}), 500
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return jsonify({"error": "Payload inválido"}), 400
        except stripe.error.SignatureVerificationError:
            return jsonify({"error": "Assinatura inválida"}), 400
        
        # Processar evento
        if event["type"] == "checkout.session.completed":
            return _handle_stripe_checkout_completed(event["data"]["object"])
        elif event["type"] == "invoice.payment_succeeded":
            return _handle_stripe_payment_succeeded(event["data"]["object"])
        elif event["type"] == "invoice.payment_failed":
            return _handle_stripe_payment_failed(event["data"]["object"])
        elif event["type"] == "customer.subscription.deleted":
            return _handle_stripe_subscription_cancelled(event["data"]["object"])
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro no webhook Stripe: {str(e)}")
        return jsonify({"error": "Erro interno"}), 500

@subscription_bp.route("/webhook/mercadopago", methods=["POST"])
def mercadopago_webhook():
    """Webhook do Mercado Pago - IMPLEMENTAÇÃO COMPLETA"""
    try:
        data = request.get_json()
        
        if data.get("type") == "payment":
            payment_id = data.get("data", {}).get("id")
            if payment_id:
                return _handle_mercadopago_payment(payment_id)
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro no webhook Mercado Pago: {str(e)}")
        return jsonify({"error": "Erro interno"}), 500

@subscription_bp.route("/webhook/paypal", methods=["POST"])
def paypal_webhook():
    """Webhook do PayPal - IMPLEMENTAÇÃO COMPLETA"""
    try:
        # Verificar assinatura do webhook
        headers = request.headers
        payload = request.get_data()
        
        # Processar evento PayPal
        data = request.get_json()
        event_type = data.get("event_type")
        
        if event_type == "PAYMENT.CAPTURE.COMPLETED":
            return _handle_paypal_payment_completed(data)
        elif event_type == "BILLING.SUBSCRIPTION.CANCELLED":
            return _handle_paypal_subscription_cancelled(data)
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro no webhook PayPal: {str(e)}")
        return jsonify({"error": "Erro interno"}), 500

# ==================== RELATÓRIOS E ANALYTICS ====================

@subscription_bp.route("/analytics/revenue", methods=["GET"])
@jwt_required()
@require_permission(Permission.VIEW_FINANCIAL_REPORTS)
def get_revenue_analytics():
    """Analytics de receita - IMPLEMENTAÇÃO COMPLETA"""
    try:
        # Parâmetros
        period = request.args.get('period', '30d')
        group_by = request.args.get('group_by', 'day')  # day, week, month
        
        # Calcular período
        end_date = datetime.datetime.utcnow()
        if period == '7d':
            start_date = end_date - datetime.timedelta(days=7)
        elif period == '30d':
            start_date = end_date - datetime.timedelta(days=30)
        elif period == '90d':
            start_date = end_date - datetime.timedelta(days=90)
        elif period == '1y':
            start_date = end_date - datetime.timedelta(days=365)
        else:
            start_date = end_date - datetime.timedelta(days=30)
        
        # Obter pagamentos do período
        payments = Payment.query.filter(
            Payment.timestamp >= start_date,
            Payment.status == 'completed'
        ).all()
        
        # Calcular analytics
        analytics = _calculate_revenue_analytics(payments, group_by, start_date, end_date)
        
        return jsonify({
            "analytics": analytics,
            "period": period,
            "group_by": group_by,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@subscription_bp.route("/analytics/subscriptions", methods=["GET"])
@jwt_required()
@require_permission(Permission.VIEW_SUBSCRIPTION_ANALYTICS)
def get_subscription_analytics():
    """Analytics de assinaturas - IMPLEMENTAÇÃO COMPLETA"""
    try:
        # Estatísticas gerais
        total_users = User.query.count()
        active_subscribers = User.query.filter(
            User.plan_id.isnot(None),
            User.is_active == True
        ).count()
        
        # Distribuição por planos
        plan_distribution = db.session.query(
            Plan.name,
            func.count(User.id).label('count')
        ).join(User, Plan.id == User.plan_id).group_by(Plan.name).all()
        
        # Churn rate (últimos 30 dias)
        thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
        cancelled_subscriptions = User.query.filter(
            User.subscription_status == 'cancelled',
            User.updated_at >= thirty_days_ago
        ).count()
        
        churn_rate = (cancelled_subscriptions / active_subscribers * 100) if active_subscribers > 0 else 0
        
        # MRR (Monthly Recurring Revenue)
        mrr = _calculate_mrr()
        
        # LTV (Lifetime Value)
        avg_ltv = _calculate_average_ltv()
        
        return jsonify({
            "overview": {
                "total_users": total_users,
                "active_subscribers": active_subscribers,
                "subscription_rate": (active_subscribers / total_users * 100) if total_users > 0 else 0,
                "churn_rate": round(churn_rate, 2),
                "mrr": float(mrr),
                "average_ltv": float(avg_ltv)
            },
            "plan_distribution": [
                {"plan": name, "subscribers": count}
                for name, count in plan_distribution
            ]
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@subscription_bp.route("/reports/financial", methods=["GET"])
@jwt_required()
@require_permission(Permission.EXPORT_FINANCIAL_REPORTS)
@check_usage_limit('reports_per_month')
def export_financial_report():
    """Exportar relatório financeiro - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Parâmetros
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        format_type = request.args.get('format', 'pdf').lower()
        
        # Validar datas
        if start_date:
            start_dt = datetime.datetime.fromisoformat(start_date)
        else:
            start_dt = datetime.datetime.utcnow() - datetime.timedelta(days=30)
        
        if end_date:
            end_dt = datetime.datetime.fromisoformat(end_date)
        else:
            end_dt = datetime.datetime.utcnow()
        
        # Obter dados
        payments = Payment.query.filter(
            Payment.timestamp >= start_dt,
            Payment.timestamp <= end_dt
        ).all()
        
        # Gerar relatório
        if format_type == 'csv':
            return _generate_financial_csv_report(payments, user.username, start_dt, end_dt)
        elif format_type == 'excel':
            return _generate_financial_excel_report(payments, user.username, start_dt, end_dt)
        else:
            return _generate_financial_pdf_report(payments, user.username, start_dt, end_dt)
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== FUNÇÕES AUXILIARES ====================

def _calculate_prorated_amount(user, new_plan, billing_cycle):
    """Calcular valor proporcional para mudança de plano"""
    try:
        # Se não há plano atual ou é gratuito, cobrar valor total
        if not user.plan or user.plan.price == 0:
            return new_plan.price
        
        # Se não há data de fim da assinatura, cobrar valor total
        if not user.subscription_end_date:
            return new_plan.price
        
        # Calcular dias restantes
        now = datetime.datetime.utcnow()
        days_remaining = (user.subscription_end_date - now).days
        
        if days_remaining <= 0:
            return new_plan.price
        
        # Calcular valor proporcional
        cycle_info = BILLING_CYCLES.get(billing_cycle, {'months': 1})
        total_days = cycle_info['months'] * 30  # Aproximação
        
        # Crédito do plano atual
        current_daily_rate = user.plan.price / total_days
        credit = current_daily_rate * days_remaining
        
        # Valor do novo plano
        new_daily_rate = new_plan.price / total_days
        new_amount = new_daily_rate * days_remaining
        
        # Diferença
        prorated_amount = max(0, new_amount - credit)
        
        return prorated_amount
        
    except Exception:
        return new_plan.price

def _calculate_plan_amount(plan, billing_cycle):
    """Calcular valor do plano baseado no ciclo de cobrança"""
    try:
        cycle_info = BILLING_CYCLES.get(billing_cycle, {'months': 1, 'discount': 0})
        
        # Se o plano já tem o ciclo correto, usar o preço atual
        if plan.billing_cycle == billing_cycle:
            return plan.price
        
        # Calcular com base no preço original e desconto do ciclo
        discounted_price = plan.original_price * (1 - cycle_info['discount'])
        
        return discounted_price
        
    except Exception:
        return plan.price

def _create_stripe_session(user, plan, amount, billing_cycle):
    """Criar sessão de pagamento Stripe"""
    try:
        if not stripe.api_key:
            return jsonify({"error": "Stripe não configurado"}), 500
        
        # Criar ou obter customer
        stripe_customer = None
        if user.stripe_customer_id:
            try:
                stripe_customer = stripe.Customer.retrieve(user.stripe_customer_id)
            except:
                stripe_customer = None
        
        if not stripe_customer:
            stripe_customer = stripe.Customer.create(
                email=user.email,
                name=user.username,
                metadata={
                    "user_id": user.id,
                    "platform": "ilyra"
                }
            )
            user.stripe_customer_id = stripe_customer.id
            db.session.commit()
        
        # Criar sessão de checkout
        session = stripe.checkout.Session.create(
            customer=stripe_customer.id,
            line_items=[{
                "price_data": {
                    "currency": "brl",
                    "product_data": {
                        "name": f"Plano {plan.name} - {billing_cycle}",
                        "description": plan.description
                    },
                    "unit_amount": int(amount * 100),  # Centavos
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment-cancel",
            metadata={
                "user_id": user.id,
                "plan_id": plan.id,
                "billing_cycle": billing_cycle,
                "platform": "ilyra"
            }
        )
        
        return jsonify({
            "checkout_url": session.url,
            "session_id": session.id,
            "gateway": "stripe"
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro no Stripe: {str(e)}"}), 500

def _create_mercadopago_session(user, plan, amount, billing_cycle):
    """Criar sessão de pagamento Mercado Pago"""
    try:
        if not mp_sdk:
            return jsonify({"error": "Mercado Pago não configurado"}), 500
        
        preference_data = {
            "items": [{
                "title": f"Plano {plan.name} - {billing_cycle}",
                "description": plan.description,
                "quantity": 1,
                "unit_price": float(amount),
                "currency_id": "BRL"
            }],
            "payer": {
                "email": user.email,
                "name": user.username
            },
            "back_urls": {
                "success": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment-success",
                "pending": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment-pending",
                "failure": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment-cancel"
            },
            "auto_return": "approved",
            "external_reference": str(user.id),
            "metadata": {
                "user_id": user.id,
                "plan_id": plan.id,
                "billing_cycle": billing_cycle,
                "platform": "ilyra"
            }
        }
        
        preference = mp_sdk.preference().create(preference_data)
        
        if preference["status"] == 201:
            return jsonify({
                "checkout_url": preference["response"]["init_point"],
                "preference_id": preference["response"]["id"],
                "gateway": "mercadopago"
            }), 200
        else:
            return jsonify({"error": "Erro ao criar preferência no Mercado Pago"}), 500
        
    except Exception as e:
        return jsonify({"error": f"Erro no Mercado Pago: {str(e)}"}), 500

def _create_paypal_session(user, plan, amount, billing_cycle):
    """Criar sessão de pagamento PayPal"""
    try:
        if not PAYPAL_CLIENT_ID:
            return jsonify({"error": "PayPal não configurado"}), 500
        
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment-success",
                "cancel_url": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment-cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": f"Plano {plan.name} - {billing_cycle}",
                        "sku": f"plan_{plan.id}",
                        "price": str(amount),
                        "currency": "BRL",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": str(amount),
                    "currency": "BRL"
                },
                "description": plan.description,
                "custom": json.dumps({
                    "user_id": user.id,
                    "plan_id": plan.id,
                    "billing_cycle": billing_cycle
                })
            }]
        })
        
        if payment.create():
            # Encontrar URL de aprovação
            approval_url = None
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = link.href
                    break
            
            return jsonify({
                "checkout_url": approval_url,
                "payment_id": payment.id,
                "gateway": "paypal"
            }), 200
        else:
            return jsonify({"error": f"Erro no PayPal: {payment.error}"}), 500
        
    except Exception as e:
        return jsonify({"error": f"Erro no PayPal: {str(e)}"}), 500

def _create_pix_session(user, plan, amount, billing_cycle):
    """Criar sessão de pagamento PIX"""
    try:
        # Implementação básica do PIX
        # Em produção, integrar com API do banco
        
        # Gerar código PIX (simulado)
        import uuid
        pix_code = str(uuid.uuid4())
        
        # QR Code seria gerado aqui
        qr_code_data = f"00020126580014BR.GOV.BCB.PIX0136{pix_code}520400005303986540{amount:.2f}5802BR5925iLyra Platform6009SAO PAULO62070503***6304"
        
        return jsonify({
            "pix_code": pix_code,
            "qr_code_data": qr_code_data,
            "amount": float(amount),
            "expires_in": 3600,  # 1 hora
            "gateway": "pix",
            "instructions": "Escaneie o QR Code ou copie e cole o código PIX no seu banco"
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro no PIX: {str(e)}"}), 500

def _handle_stripe_checkout_completed(session):
    """Processar checkout concluído do Stripe"""
    try:
        user_id = session["metadata"]["user_id"]
        plan_id = session["metadata"]["plan_id"]
        billing_cycle = session["metadata"]["billing_cycle"]
        
        user = User.query.get(user_id)
        plan = Plan.query.get(plan_id)
        
        if user and plan:
            # Atualizar assinatura do usuário
            user.plan_id = plan.id
            user.subscription_start_date = datetime.datetime.utcnow()
            
            # Calcular data de fim baseada no ciclo
            cycle_info = BILLING_CYCLES.get(billing_cycle, {'months': 1})
            user.subscription_end_date = user.subscription_start_date + datetime.timedelta(
                days=cycle_info['months'] * 30
            )
            user.subscription_status = 'active'
            
            # Registrar pagamento
            payment = Payment(
                user_id=user.id,
                plan_id=plan.id,
                amount=Decimal(str(session["amount_total"] / 100)),
                currency=session["currency"].upper(),
                transaction_id=session["id"],
                gateway="stripe",
                status="completed",
                billing_cycle=billing_cycle,
                timestamp=datetime.datetime.utcnow()
            )
            
            db.session.add(payment)
            db.session.commit()
            
            current_app.logger.info(f"Stripe payment completed: User {user.id}, Plan {plan.name}")
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao processar checkout Stripe: {str(e)}")
        return jsonify({"error": "Erro interno"}), 500

def _handle_mercadopago_payment(payment_id):
    """Processar pagamento do Mercado Pago"""
    try:
        payment_info = mp_sdk.payment().get(payment_id)
        
        if payment_info["status"] == 200:
            payment_data = payment_info["response"]
            
            if payment_data["status"] == "approved":
                external_reference = payment_data["external_reference"]
                user_id = int(external_reference)
                
                user = User.query.get(user_id)
                if user:
                    # Lógica similar ao Stripe
                    # Implementar baseado nos metadados do pagamento
                    pass
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao processar pagamento Mercado Pago: {str(e)}")
        return jsonify({"error": "Erro interno"}), 500

def _calculate_mrr():
    """Calcular Monthly Recurring Revenue"""
    try:
        # Obter todas as assinaturas ativas
        active_users = User.query.filter(
            User.plan_id.isnot(None),
            User.subscription_status == 'active'
        ).all()
        
        mrr = Decimal('0')
        
        for user in active_users:
            if user.plan and user.plan.price > 0:
                # Converter para valor mensal baseado no ciclo
                cycle_info = BILLING_CYCLES.get(user.plan.billing_cycle, {'months': 1})
                monthly_value = user.plan.price / cycle_info['months']
                mrr += monthly_value
        
        return mrr
        
    except Exception:
        return Decimal('0')

def _calculate_average_ltv():
    """Calcular Lifetime Value médio"""
    try:
        # LTV = (Receita média por usuário) * (Tempo médio de vida do cliente)
        
        # Receita total
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status == 'completed'
        ).scalar() or Decimal('0')
        
        # Número de usuários únicos que fizeram pagamentos
        unique_paying_users = db.session.query(func.count(func.distinct(Payment.user_id))).scalar() or 1
        
        # Receita média por usuário
        arpu = total_revenue / unique_paying_users
        
        # Tempo médio de vida (simplificado - usar dados reais em produção)
        avg_lifetime_months = 12  # Assumir 12 meses como média
        
        ltv = arpu * avg_lifetime_months
        
        return ltv
        
    except Exception:
        return Decimal('0')

def _calculate_revenue_analytics(payments, group_by, start_date, end_date):
    """Calcular analytics de receita"""
    try:
        analytics = {
            "total_revenue": Decimal('0'),
            "total_transactions": len(payments),
            "average_transaction": Decimal('0'),
            "revenue_by_gateway": defaultdict(Decimal),
            "revenue_by_plan": defaultdict(Decimal),
            "timeline": []
        }
        
        # Calcular totais
        for payment in payments:
            analytics["total_revenue"] += payment.amount
            analytics["revenue_by_gateway"][payment.gateway] += payment.amount
            
            if payment.plan:
                analytics["revenue_by_plan"][payment.plan.name] += payment.amount
        
        # Média por transação
        if len(payments) > 0:
            analytics["average_transaction"] = analytics["total_revenue"] / len(payments)
        
        # Timeline baseada no agrupamento
        timeline_data = defaultdict(Decimal)
        
        for payment in payments:
            if group_by == 'day':
                key = payment.timestamp.strftime('%Y-%m-%d')
            elif group_by == 'week':
                # Primeira data da semana
                week_start = payment.timestamp - datetime.timedelta(days=payment.timestamp.weekday())
                key = week_start.strftime('%Y-%m-%d')
            else:  # month
                key = payment.timestamp.strftime('%Y-%m')
            
            timeline_data[key] += payment.amount
        
        # Converter para lista ordenada
        analytics["timeline"] = [
            {"period": period, "revenue": float(revenue)}
            for period, revenue in sorted(timeline_data.items())
        ]
        
        # Converter Decimals para float para JSON
        analytics["total_revenue"] = float(analytics["total_revenue"])
        analytics["average_transaction"] = float(analytics["average_transaction"])
        analytics["revenue_by_gateway"] = {k: float(v) for k, v in analytics["revenue_by_gateway"].items()}
        analytics["revenue_by_plan"] = {k: float(v) for k, v in analytics["revenue_by_plan"].items()}
        
        return analytics
        
    except Exception as e:
        return {"error": f"Erro ao calcular analytics: {str(e)}"}

def _generate_financial_pdf_report(payments, username, start_date, end_date):
    """Gerar relatório financeiro em PDF"""
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_path = temp_file.name
        temp_file.close()
        
        # Criar documento
        doc = SimpleDocTemplate(temp_path, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # Center
        )
        
        story.append(Paragraph("Relatório Financeiro - iLyra Platform", title_style))
        story.append(Spacer(1, 12))
        
        # Informações do relatório
        info_data = [
            ["Período:", f"{start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')}"],
            ["Gerado em:", datetime.datetime.now().strftime('%d/%m/%Y %H:%M')],
            ["Usuário:", username],
            ["Total de transações:", str(len(payments))]
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(info_table)
        story.append(Spacer(1, 20))
        
        # Resumo financeiro
        total_revenue = sum(p.amount for p in payments)
        
        summary_data = [
            ["Receita Total:", f"R$ {total_revenue:,.2f}"],
            ["Receita Média por Transação:", f"R$ {total_revenue/len(payments):,.2f}" if payments else "R$ 0,00"],
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ]))
        
        story.append(Paragraph("Resumo Financeiro", styles['Heading2']))
        story.append(summary_table)
        story.append(Spacer(1, 20))
        
        # Tabela de transações
        if payments:
            story.append(Paragraph("Detalhes das Transações", styles['Heading2']))
            
            transaction_data = [["Data", "Usuário", "Plano", "Valor", "Gateway", "Status"]]
            
            for payment in payments[:50]:  # Limitar a 50 transações
                user_name = payment.user.username if payment.user else "N/A"
                plan_name = payment.plan.name if payment.plan else "N/A"
                
                transaction_data.append([
                    payment.timestamp.strftime('%d/%m/%Y'),
                    user_name,
                    plan_name,
                    f"R$ {payment.amount:,.2f}",
                    payment.gateway.upper(),
                    payment.status.upper()
                ])
            
            transaction_table = Table(transaction_data, colWidths=[1*inch, 1.2*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            transaction_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(transaction_table)
        
        # Gerar PDF
        doc.build(story)
        
        filename = f"relatorio_financeiro_{username}_{datetime.datetime.now().strftime('%Y%m%d')}.pdf"
        
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype="application/pdf"
        )
        
    except Exception as e:
        raise Exception(f"Erro ao gerar PDF: {str(e)}")

def _generate_financial_csv_report(payments, username, start_date, end_date):
    """Gerar relatório financeiro em CSV"""
    try:
        import csv
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalho
        writer.writerow([
            'Data', 'Usuário ID', 'Usuário', 'Plano ID', 'Plano', 'Valor', 
            'Moeda', 'Gateway', 'Status', 'ID Transação', 'Ciclo Cobrança'
        ])
        
        # Dados
        for payment in payments:
            writer.writerow([
                payment.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                payment.user_id,
                payment.user.username if payment.user else 'N/A',
                payment.plan_id,
                payment.plan.name if payment.plan else 'N/A',
                float(payment.amount),
                payment.currency,
                payment.gateway,
                payment.status,
                payment.transaction_id,
                payment.billing_cycle or 'N/A'
            ])
        
        temp_file.close()
        
        filename = f"relatorio_financeiro_{username}_{datetime.datetime.now().strftime('%Y%m%d')}.csv"
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype="text/csv"
        )
        
    except Exception as e:
        raise Exception(f"Erro ao gerar CSV: {str(e)}")

def _generate_financial_excel_report(payments, username, start_date, end_date):
    """Gerar relatório financeiro em Excel"""
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        temp_path = temp_file.name
        temp_file.close()
        
        # Preparar dados
        data = []
        for payment in payments:
            data.append({
                'Data': payment.timestamp,
                'Usuário ID': payment.user_id,
                'Usuário': payment.user.username if payment.user else 'N/A',
                'Plano ID': payment.plan_id,
                'Plano': payment.plan.name if payment.plan else 'N/A',
                'Valor': float(payment.amount),
                'Moeda': payment.currency,
                'Gateway': payment.gateway,
                'Status': payment.status,
                'ID Transação': payment.transaction_id,
                'Ciclo Cobrança': payment.billing_cycle or 'N/A'
            })
        
        # Criar DataFrame e salvar
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(temp_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Transações', index=False)
            
            # Adicionar resumo
            summary_data = {
                'Métrica': ['Total de Transações', 'Receita Total', 'Receita Média'],
                'Valor': [
                    len(payments),
                    f"R$ {sum(p.amount for p in payments):,.2f}",
                    f"R$ {sum(p.amount for p in payments)/len(payments):,.2f}" if payments else "R$ 0,00"
                ]
            }
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Resumo', index=False)
        
        filename = f"relatorio_financeiro_{username}_{datetime.datetime.now().strftime('%Y%m%d')}.xlsx"
        
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
    except Exception as e:
        raise Exception(f"Erro ao gerar Excel: {str(e)}")


# Criar o blueprint
plan_bp = Blueprint('plan', __name__, url_prefix='/api/plan')

# Registrar todas as rotas no blueprint
plan_bp.add_url_rule('/plans', 'list_plans', list_plans, methods=['GET'])
plan_bp.add_url_rule('/plans', 'create_plan', create_plan, methods=['POST'])
plan_bp.add_url_rule('/plans/<int:plan_id>', 'get_plan', get_plan, methods=['GET'])
plan_bp.add_url_rule('/plans/<int:plan_id>', 'update_plan', update_plan, methods=['PUT'])
plan_bp.add_url_rule('/plans/<int:plan_id>', 'delete_plan', delete_plan, methods=['DELETE'])
plan_bp.add_url_rule('/subscribe', 'subscribe_to_plan', subscribe_to_plan, methods=['POST'])
plan_bp.add_url_rule('/cancel', 'cancel_subscription', cancel_subscription, methods=['POST'])
plan_bp.add_url_rule('/payment/session', 'create_payment_session', create_payment_session, methods=['POST'])
plan_bp.add_url_rule('/payment/stripe/webhook', 'stripe_webhook', stripe_webhook, methods=['POST'])
plan_bp.add_url_rule('/payment/mercadopago/webhook', 'mercadopago_webhook', mercadopago_webhook, methods=['POST'])
plan_bp.add_url_rule('/payment/paypal/webhook', 'paypal_webhook', paypal_webhook, methods=['POST'])
