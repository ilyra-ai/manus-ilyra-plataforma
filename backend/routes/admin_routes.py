from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import User, Plan, Payment, SpiritualMetric, AIConversation, Gamification
import datetime

admin_bp = Blueprint("admin", __name__)

def admin_required():
    def wrapper(fn):
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user_claims = get_jwt()
            if not current_user_claims.get("role") == "admin":
                return jsonify({"msg": "Admin access required"}), 403
            return fn(*args, **kwargs)
            return fn(*args, **kwargs)
        decorated_function.__name__ = fn.__name__ # Preserve original function name
        return decorated_function
    return wrapper

@admin_bp.route("/dashboard/kpis/basic", methods=["GET"])
@admin_required()
def get_basic_kpis():
    # Placeholder para KPIs Básicos
    total_users = User.query.count()
    active_users = User.query.filter(User.last_login >= (datetime.datetime.now() - datetime.timedelta(days=30))).count()
    paying_users = User.query.join(Payment).filter(Payment.status == "completed").distinct().count()
    
    # Total Monetizado Geral (placeholder)
    total_monetized_general = db.session.query(db.func.sum(Payment.amount)).filter(Payment.status == "completed").scalar() or 0

    return jsonify({
        "total_users": total_users,
        "active_users": active_users,
        "paying_users": paying_users,
        "total_monetized_general": float(total_monetized_general),
        "msg": "KPIs básicos (parcialmente) implementados como placeholders."
    }), 200

@admin_bp.route("/dashboard/kpis/advanced", methods=["GET"])
@admin_required()
def get_advanced_kpis():
    # Placeholder para KPIs Avançados
    return jsonify({"msg": "KPIs avançados não implementados."}), 501

@admin_bp.route("/dashboard/interactive", methods=["GET"])
@admin_required()
def get_interactive_dashboard():
    # Placeholder para Dashboard interativo
    return jsonify({"msg": "Dashboard interativo não implementado."}), 501

@admin_bp.route("/dashboard/realtime-charts", methods=["GET"])
@admin_required()
def get_realtime_charts():
    # Placeholder para Gráficos em tempo real
    return jsonify({"msg": "Gráficos em tempo real não implementados."}), 501

@admin_bp.route("/dashboard/advanced-filters", methods=["GET"])
@admin_required()
def get_advanced_filters():
    # Placeholder para Filtros avançados
    return jsonify({"msg": "Filtros avançados não implementados."}), 501

@admin_bp.route("/dashboard/export-reports", methods=["GET"])
@admin_required()
def export_dashboard_reports():
    # Placeholder para Exportação de relatórios
    return jsonify({"msg": "Exportação de relatórios não implementada."}), 501

@admin_bp.route("/dashboard/alerts", methods=["GET"])
@admin_required()
def get_dashboard_alerts():
    # Placeholder para Alertas automáticos
    return jsonify({"msg": "Alertas automáticos não implementados."}), 501

