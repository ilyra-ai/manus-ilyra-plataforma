from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Plan, User, PlanHistory
import datetime

plan_bp = Blueprint("plan", __name__)

@plan_bp.route("/plans", methods=["POST"])
@jwt_required()
def create_plan():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json()
    name = data.get("name")
    price = data.get("price")
    features = data.get("features")

    if not name or price is None or not features:
        return jsonify({"msg": "Missing name, price, or features"}), 400

    new_plan = Plan(name=name, price=price, features=features)
    db.session.add(new_plan)
    db.session.commit()

    # Registrar histórico
    history = PlanHistory(plan_id=new_plan.id, action="created", details=f"Plan {name} created with price {price} and features {features}")
    db.session.add(history)
    db.session.commit()

    return jsonify({"msg": "Plan created successfully", "id": new_plan.id}), 201

@plan_bp.route("/plans", methods=["GET"])
def get_all_plans():
    plans = Plan.query.all()
    output = []
    for plan in plans:
        output.append({
            "id": plan.id,
            "name": plan.name,
            "price": plan.price,
            "features": plan.features
        })
    return jsonify(output), 200

@plan_bp.route("/plans/<int:plan_id>", methods=["GET"])
def get_plan(plan_id):
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"msg": "Plan not found"}), 404
    output = {
        "id": plan.id,
        "name": plan.name,
        "price": plan.price,
        "features": plan.features
    }
    return jsonify(output), 200

@plan_bp.route("/plans/<int:plan_id>", methods=["PUT"])
@jwt_required()
def update_plan(plan_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"msg": "Plan not found"}), 404

    data = request.get_json()
    old_name = plan.name
    old_price = plan.price
    old_features = plan.features

    plan.name = data.get("name", plan.name)
    plan.price = data.get("price", plan.price)
    plan.features = data.get("features", plan.features)
    db.session.commit()

    # Registrar histórico
    details = f"Plan {old_name} updated. Name: {old_name}->{plan.name}, Price: {old_price}->{plan.price}, Features: {old_features}->{plan.features}"
    history = PlanHistory(plan_id=plan.id, action="updated", details=details)
    db.session.add(history)
    db.session.commit()

    return jsonify({"msg": "Plan updated successfully"}), 200

@plan_bp.route("/plans/<int:plan_id>", methods=["DELETE"])
@jwt_required()
def delete_plan(plan_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"msg": "Plan not found"}), 404

    # Registrar histórico antes de deletar
    history = PlanHistory(plan_id=plan.id, action="deleted", details=f"Plan {plan.name} deleted")
    db.session.add(history)
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"msg": "Plan deleted successfully"}), 200

@plan_bp.route("/subscribe", methods=["POST"])
@jwt_required()
def subscribe_to_plan():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    plan_id = data.get("plan_id")

    new_plan = Plan.query.get(plan_id)
    if not new_plan:
        return jsonify({"msg": "Plan not found"}), 404

    # Lógica de upgrade/downgrade
    if user.plan_id == new_plan.id:
        return jsonify({"msg": "Already subscribed to this plan"}), 400

    user.plan_id = new_plan.id
    db.session.commit()
    return jsonify({"msg": f"Successfully subscribed to {new_plan.name} plan"}), 200

@plan_bp.route("/cancel-subscription", methods=["POST"])
@jwt_required()
def cancel_subscription():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Atribuir ao plano Free ou similar
    free_plan = Plan.query.filter_by(name='Free').first()
    if not free_plan:
        return jsonify({"msg": "Free plan not found, cannot cancel subscription"}), 500

    user.plan_id = free_plan.id
    db.session.commit()
    return jsonify({"msg": "Subscription cancelled successfully, reverted to Free plan"}), 200

@plan_bp.route("/history", methods=["GET"])
@jwt_required()
def get_plan_history():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    history_records = PlanHistory.query.order_by(PlanHistory.timestamp.desc()).all()
    output = []
    for record in history_records:
        output.append({
            "id": record.id,
            "plan_id": record.plan_id,
            "action": record.action,
            "details": record.details,
            "timestamp": record.timestamp.isoformat()
        })
    return jsonify(output), 200

@plan_bp.route("/financial-report", methods=["GET"])
@jwt_required()
def get_financial_report():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    total_revenue = db.session.query(db.func.sum(Payment.amount)).scalar()
    if total_revenue is None: total_revenue = 0.0

    payments_by_plan = db.session.query(Plan.name, db.func.sum(Payment.amount)).join(Payment).group_by(Plan.name).all()
    payments_by_plan_dict = {name: float(amount) for name, amount in payments_by_plan}

    return jsonify({
        "total_revenue": float(total_revenue),
        "payments_by_plan": payments_by_plan_dict,
        "report_date": datetime.datetime.now().isoformat()
    }), 200

