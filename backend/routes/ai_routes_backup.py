from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, AIConversation, User
import datetime
import google.generativeai as genai
import os
import json
import pandas as pd
from textblob import TextBlob

ai_bp = Blueprint("ai", __name__)

# Configuração da API Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-pro")
else:
    print("GEMINI_API_KEY não configurada. A funcionalidade de IA pode estar limitada.")
    model = None

@ai_bp.route("/conversations", methods=["POST"])
@jwt_required()
def create_ai_conversation():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    user_message = data.get("message")

    if not user_message:
        return jsonify({"msg": "Missing message"}), 400

    if not model:
        return jsonify({"msg": "AI service not configured"}), 503

    try:
        # Interagir com a IA Gemini
        response = model.generate_content(f"Como um guia espiritual, responda a seguinte pergunta: {user_message}")
        ai_response = response.text

        # Salvar a conversa no banco de dados
        new_conversation = AIConversation(user_id=current_user_id, conversation=f"User: {user_message}\nAI: {ai_response}")
        db.session.add(new_conversation)
        db.session.commit()

        return jsonify({"msg": "AI conversation created successfully", "id": new_conversation.id, "ai_response": ai_response}), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao interagir com a IA: {str(e)}"}), 500

@ai_bp.route("/conversations", methods=["GET"])
@jwt_required()
def get_ai_conversations():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    conversations = AIConversation.query.filter_by(user_id=current_user_id).order_by(AIConversation.timestamp.desc()).all()
    output = []
    for conv in conversations:
        output.append({
            "id": conv.id,
            "conversation": conv.conversation,
            "timestamp": conv.timestamp.isoformat()
        })
    return jsonify(output), 200

@ai_bp.route("/conversations/<int:conv_id>", methods=["PUT"])
@jwt_required()
def update_ai_conversation(conv_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    conversation = AIConversation.query.filter_by(id=conv_id, user_id=current_user_id).first()
    if not conversation:
        return jsonify({"msg": "Conversation not found or unauthorized"}), 404

    data = request.get_json()
    conversation.conversation = data.get("conversation", conversation.conversation)
    db.session.commit()
    return jsonify({"msg": "AI conversation updated successfully"}), 200

@ai_bp.route("/conversations/<int:conv_id>", methods=["DELETE"])
@jwt_required()
def delete_ai_conversation(conv_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    conversation = AIConversation.query.filter_by(id=conv_id, user_id=current_user_id).first()
    if not conversation:
        return jsonify({"msg": "Conversation not found or unauthorized"}), 404

    db.session.delete(conversation)
    db.session.commit()
    return jsonify({"msg": "AI conversation deleted successfully"}), 200

@ai_bp.route("/conversations/export", methods=["GET"])
@jwt_required()
def export_ai_conversations():
    current_user_id = get_jwt_identity()
    conversations = AIConversation.query.filter_by(user_id=current_user_id).order_by(AIConversation.timestamp.desc()).all()
    
    data = []
    for conv in conversations:
        data.append({
            "id": conv.id,
            "conversation": conv.conversation,
            "timestamp": conv.timestamp.isoformat()
        })
    
    df = pd.DataFrame(data)
    output_path = f"/tmp/ai_conversations_{current_user_id}.csv"
    df.to_csv(output_path, index=False)
    
    return send_file(output_path, as_attachment=True, download_name="ai_conversations.csv", mimetype="text/csv")

@ai_bp.route("/conversations/sentiment", methods=["GET"])
@jwt_required()
def analyze_sentiment_ai_conversations():
    current_user_id = get_jwt_identity()
    conversations = AIConversation.query.filter_by(user_id=current_user_id).all()
    
    sentiments = []
    for conv in conversations:
        analysis = TextBlob(conv.conversation)
        sentiments.append({
            "id": conv.id,
            "polarity": analysis.sentiment.polarity,
            "subjectivity": analysis.sentiment.subjectivity
        })
    
    return jsonify(sentiments), 200

@ai_bp.route("/conversations/index", methods=["POST"])
@jwt_required()
def index_ai_conversations():
    # Placeholder para indexação. Requer uma solução de busca como Elasticsearch ou Whoosh.
    return jsonify({"msg": "Indexação de conversas de IA não implementada. Requer ferramentas externas."}), 501

@ai_bp.route("/conversations/compress", methods=["POST"])
@jwt_required()
def compress_ai_conversations():
    # Placeholder para compressão. Pode envolver arquivamento ou sumarização.
    return jsonify({"msg": "Compressão de conversas de IA não implementada. Requer ferramentas externas."}), 501

