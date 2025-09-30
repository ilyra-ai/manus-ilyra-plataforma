from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Payment, User, Plan
import os
import stripe
import mercadopago
import datetime

payment_bp = Blueprint("payment", __name__)

# Configuração do Stripe
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

# Configuração do Mercado Pago
mp_sdk = None

def init_mercadopago_sdk(app):
    global mp_sdk
    if app.config.get("MERCADOPAGO_ACCESS_TOKEN"):
        mp_sdk = mercadopago.SDK(app.config["MERCADOPAGO_ACCESS_TOKEN"])
    else:
        app.logger.warning("MERCADOPAGO_ACCESS_TOKEN não configurado. Funcionalidades do Mercado Pago podem estar limitadas.")

@payment_bp.route("/create-checkout-session", methods=["POST"])
@jwt_required()
def create_checkout_session():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    plan_id = data.get("plan_id")
    gateway = data.get("gateway") # 'stripe', 'mercadopago', 'paypal', 'pix', 'boleto', 'card'

    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"msg": "Plan not found"}), 404

    if gateway == "stripe":
        try:
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": plan.name,
                            },
                            "unit_amount": int(plan.price * 100), # Preço em centavos
                        },
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=os.environ.get("FRONTEND_URL") + "/payment-success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=os.environ.get("FRONTEND_URL") + "/payment-cancel",
                client_reference_id=str(user.id),
                metadata={
                    "plan_id": plan.id,
                    "user_id": user.id
                }
            )
            return jsonify({"checkout_url": checkout_session.url}), 200
        except Exception as e:
            current_app.logger.error(f"Stripe checkout error: {e}")
            return jsonify({"error": str(e)}), 500
    elif gateway == "mercadopago":
        try:
            preference_data = {
                "items": [
                    {
                        "title": plan.name,
                        "quantity": 1,
                        "unit_price": float(plan.price),
                        "currency_id": "BRL",
                    }
                ],
                "payer": {
                    "email": user.email,
                },
                "back_urls": {
                    "success": os.environ.get("FRONTEND_URL") + "/payment-success",
                    "pending": os.environ.get("FRONTEND_URL") + "/payment-pending",
                    "failure": os.environ.get("FRONTEND_URL") + "/payment-cancel",
                },
                "auto_return": "approved",
                "external_reference": str(user.id),
                "metadata": {
                    "plan_id": plan.id,
                    "user_id": user.id
                }
            }
            preference = mp_sdk.preference().create(preference_data)
            
            return jsonify({"checkout_url": preference["response"]["init_point"]}), 200
        except Exception as e:
            current_app.logger.error(f"Mercado Pago checkout error: {e}")
            return jsonify({"error": str(e)}), 500
    elif gateway == "paypal":
        # Placeholder para integração PayPal
        return jsonify({"msg": "PayPal integration not implemented yet", "status": "pending"}), 501
    elif gateway == "pix":
        # Placeholder para integração PIX
        return jsonify({"msg": "PIX integration not implemented yet", "status": "pending"}), 501
    elif gateway == "boleto":
        # Placeholder para integração Boleto
        return jsonify({"msg": "Boleto integration not implemented yet", "status": "pending"}), 501
    elif gateway == "card":
        # Placeholder para integração direta de cartão
        return jsonify({"msg": "Direct card integration not implemented yet", "status": "pending"}), 501
    else:
        return jsonify({"msg": "Invalid payment gateway"}), 400

@payment_bp.route("/webhook/stripe", methods=["POST"])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get("stripe-signature")
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError as e:
        # Invalid payload
        current_app.logger.error(f"Stripe Webhook Error: Invalid payload: {e}")
        return str(e), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        current_app.logger.error(f"Stripe Webhook Error: Invalid signature: {e}")
        return str(e), 400

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        plan_id = session["metadata"]["plan_id"]
        amount = session["amount_total"] / 100 # Convert cents to dollars
        currency = session["currency"]
        payment_id = session["id"]

        user = User.query.get(user_id)
        plan = Plan.query.get(plan_id)

        if user and plan:
            # Atualizar plano do usuário
            user.plan_id = plan.id
            # Registrar pagamento
            new_payment = Payment(
                user_id=user.id,
                plan_id=plan.id,
                amount=amount,
                currency=currency,
                transaction_id=payment_id,
                gateway="stripe",
                status="completed"
            )
            db.session.add(new_payment)
            db.session.commit()
            current_app.logger.info(f"Stripe Payment completed for user {user.id}, plan {plan.name}")
        else:
            current_app.logger.warning(f"Stripe Webhook: User or Plan not found for session {payment_id}")

    return jsonify({"status": "success"}), 200

@payment_bp.route("/webhook/mercadopago", methods=["POST"])
def mercadopago_webhook():
    data = request.get_json()
    # Mercado Pago envia notificações de diferentes tipos, o mais comum é 'payment'
    if data.get("type") == "payment":
        payment_id = data.get("data", {}).get("id")
        if payment_id:
            try:
                payment_info = mp_sdk.payment().get(payment_id)

                if payment_info["status"] == 200:
                    payment_data = payment_info["response"]
                    status = payment_data["status"]
                    external_reference = payment_data["external_reference"]
                    amount = payment_data["transaction_amount"]
                    currency = payment_data["currency_id"]
                    
                    user_id = external_reference # Assumindo que external_reference é o user_id
                    # Aqui você precisaria de uma forma de obter o plan_id, talvez do metadata
                    # Por simplicidade, vamos assumir que o plano é o 'Premium' para pagamentos bem-sucedidos
                    plan = Plan.query.filter_by(name='Premium').first() # TODO: Melhorar a lógica de associação de plano

                    user = User.query.get(user_id)

                    if user and plan and status == "approved":
                        user.plan_id = plan.id
                        new_payment = Payment(
                            user_id=user.id,
                            plan_id=plan.id,
                            amount=amount,
                            currency=currency,
                            transaction_id=payment_id,
                            gateway="mercadopago",
                            status="completed"
                        )
                        db.session.add(new_payment)
                        db.session.commit()
                        current_app.logger.info(f"Mercado Pago Payment completed for user {user.id}, plan {plan.name}")
                    else:
                        current_app.logger.warning(f"Mercado Pago Webhook: Payment not approved or User/Plan not found for payment {payment_id}")

            except Exception as e:
                current_app.logger.error(f"Error processing Mercado Pago webhook: {str(e)}")

    return jsonify({"status": "success"}), 200

@payment_bp.route("/payments", methods=["GET"])
@jwt_required()
def get_user_payments():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    payments = Payment.query.filter_by(user_id=current_user_id).order_by(Payment.timestamp_sdk.desc()).all()
    output = []
    for p in payments:
        output.append({
            "id": p.id,
            "plan_name": p.plan.name if p.plan else "N/A",
            "amount": str(p.amount),
            "currency": p.currency,
            "transaction_id": p.transaction_id,
            "gateway": p.gateway,
            "status": p.status,
            "timestamp": p.timestamp_sdk.isoformat()
        })
    return jsonify(output), 200

@payment_bp.route("/admin/payments", methods=["GET"])
@jwt_required()
def get_all_payments_admin():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    payments = Payment.query.all()
    output = []
    for p in payments:
        output.append({
            "id": p.id,
            "user_id": p.user_id,
            "username": p.user.username if p.user else "N/A",
            "plan_name": p.plan.name if p.plan else "N/A",
            "amount": str(p.amount),
            "currency": p.currency,
            "transaction_id": p.transaction_id,
            "gateway": p.gateway,
            "status": p.status,
            "timestamp": p.timestamp_sdk.isoformat()
        })
    return jsonify(output), 200

@payment_bp.route("/admin/recurring-billing", methods=["POST"])
@jwt_required()
def setup_recurring_billing():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Lógica para configurar cobrança recorrente (placeholder)
    return jsonify({"msg": "Configuração de cobrança recorrente não implementada."}), 501

@payment_bp.route("/admin/manage-delinquency", methods=["POST"])
@jwt_required()
def manage_delinquency():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Lógica para gestão de inadimplência (placeholder)
    return jsonify({"msg": "Gestão de inadimplência não implementada."}), 501

@payment_bp.route("/admin/refunds", methods=["POST"])
@jwt_required()
def process_refund():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Lógica para processar reembolsos (placeholder)
    return jsonify({"msg": "Processamento de reembolsos não implementado."}), 501

@payment_bp.route("/admin/financial-reports", methods=["GET"])
@jwt_required()
def get_admin_financial_reports():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Relatórios financeiros mais detalhados (placeholder)
    return jsonify({"msg": "Relatórios financeiros detalhados não implementados."}), 501

@payment_bp.route("/admin/bank-reconciliation", methods=["POST"])
@jwt_required()
def bank_reconciliation():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Lógica para conciliação bancária (placeholder)
    return jsonify({"msg": "Conciliação bancária não implementada."}), 501

@payment_bp.route("/admin/taxes", methods=["POST"])
@jwt_required()
def manage_taxes():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Lógica para impostos e tributação (placeholder)
    return jsonify({"msg": "Gestão de impostos e tributação não implementada."}), 501

@payment_bp.route("/admin/revenue-analysis", methods=["GET"])
@jwt_required()
def revenue_analysis():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Lógica para análise de receita (placeholder)
    return jsonify({"msg": "Análise de receita não implementada."}), 501

@payment_bp.route("/admin/financial-projections", methods=["GET"])
@jwt_required()
def financial_projections():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403
    
    # Lógica para projeções financeiras (placeholder)
    return jsonify({"msg": "Projeções financeiras não implementadas."}), 501

