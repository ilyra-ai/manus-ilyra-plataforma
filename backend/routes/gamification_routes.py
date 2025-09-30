from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Gamification, User

gamification_bp = Blueprint("gamification", __name__)

@gamification_bp.route("/status", methods=["GET"])
@jwt_required()
def get_gamification_status():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    gamification = Gamification.query.filter_by(user_id=current_user_id).first()
    if not gamification:
        return jsonify({"msg": "Gamification data not found for this user"}), 404

    return jsonify({
        "user_id": gamification.user_id,
        "points": gamification.points,
        "level": gamification.level,
        "badges": gamification.badges.split(",") if gamification.badges else []
    }), 200

@gamification_bp.route("/add-points", methods=["POST"])
@jwt_required()
def add_points():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    points_to_add = data.get("points", 0)

    gamification = Gamification.query.filter_by(user_id=current_user_id).first()
    if not gamification:
        gamification = Gamification(user_id=current_user_id, points=0, level=1)
        db.session.add(gamification)

    gamification.points += points_to_add
    # Lógica simples de nivelamento
    gamification.level = (gamification.points // 100) + 1
    db.session.commit()

    return jsonify({"msg": "Points added successfully", "new_points": gamification.points, "new_level": gamification.level}), 200

@gamification_bp.route("/badges", methods=["GET"])
@jwt_required()
def get_user_badges():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    gamification = Gamification.query.filter_by(user_id=current_user_id).first()
    if not gamification or not gamification.badges:
        return jsonify({"badges": []}), 200

    return jsonify({"badges": gamification.badges.split(",")}), 200

@gamification_bp.route("/admin/award-badge", methods=["POST"])
@jwt_required()
def admin_award_badge():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json()
    target_user_id = data.get("user_id")
    badge_name = data.get("badge_name")

    if not target_user_id or not badge_name:
        return jsonify({"msg": "Missing user_id or badge_name"}), 400

    gamification = Gamification.query.filter_by(user_id=target_user_id).first()
    if not gamification:
        gamification = Gamification(user_id=target_user_id, points=0, level=1, badges="")
        db.session.add(gamification)

    current_badges = gamification.badges.split(",") if gamification.badges else []
    if badge_name not in current_badges:
        current_badges.append(badge_name)
        gamification.badges = ",".join(current_badges)
        db.session.commit()
        return jsonify({"msg": f"Badge {badge_name} awarded to user {target_user_id}"}), 200
    else:
        return jsonify({"msg": f"User {target_user_id} already has badge {badge_name}"}), 400

@gamification_bp.route("/daily-missions", methods=["GET"])
@jwt_required()
def get_daily_missions():
    # Placeholder para missões diárias. Pode envolver um sistema de geração dinâmica ou banco de dados.
    missions = [
        {"id": 1, "name": "Meditar por 10 minutos", "points": 10, "completed": False},
        {"id": 2, "name": "Registrar uma métrica espiritual", "points": 5, "completed": False}
    ]
    return jsonify({"missions": missions}), 200

@gamification_bp.route("/weekly-challenges", methods=["GET"])
@jwt_required()
def get_weekly_challenges():
    # Placeholder para desafios semanais
    challenges = [
        {"id": 1, "name": "Completar 7 meditações diárias", "points": 50, "completed": False},
        {"id": 2, "name": "Atingir nível 5 de Consciência", "points": 100, "completed": False}
    ]
    return jsonify({"challenges": challenges}), 200

@gamification_bp.route("/global-ranking", methods=["GET"])
@jwt_required()
def get_global_ranking():
    # Placeholder para ranking global
    ranking = [
        {"user_id": 1, "username": "UserA", "points": 1500, "level": 15},
        {"user_id": 2, "username": "UserB", "points": 1200, "level": 12}
    ]
    return jsonify({"ranking": ranking}), 200

@gamification_bp.route("/virtual-rewards", methods=["GET"])
@jwt_required()
def get_virtual_rewards():
    # Placeholder para recompensas virtuais
    rewards = [
        {"id": 1, "name": "Aura Brilhante", "cost": 100, "description": "Um efeito visual para seu perfil"}
    ]
    return jsonify({"rewards": rewards}), 200

@gamification_bp.route("/coin-system", methods=["GET"])
@jwt_required()
def get_coin_system_status():
    # Placeholder para sistema de moedas
    return jsonify({"msg": "Sistema de moedas não implementado."}), 501

@gamification_bp.route("/item-shop", methods=["GET"])
@jwt_required()
def get_item_shop():
    # Placeholder para loja de itens
    return jsonify({"msg": "Loja de itens não implementada."}), 501

@gamification_bp.route("/visual-progression", methods=["GET"])
@jwt_required()
def get_visual_progression():
    # Placeholder para progressão visual
    return jsonify({"msg": "Progressão visual não implementada."}), 501

