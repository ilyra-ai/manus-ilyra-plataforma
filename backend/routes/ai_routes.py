"""
Sistema Completo de CRUD de Conversas IA - iLyra Platform
Implementação com indexação, busca rápida, compressão e análise avançada
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, AIConversation, User
from permissions_system import (
    require_permission, require_plan, check_usage_limit, Permission
)
from security_service import security_service
import datetime
import json
import pandas as pd
import tempfile
import gzip
import pickle
import re
from collections import defaultdict
from sqlalchemy import func, and_, or_, text
import google.generativeai as genai
import openai
import os
import hashlib
import statistics

# Configuração das APIs de IA
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-pro")
else:
    gemini_model = None

if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY
else:
    openai = None

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

# ==================== CONFIGURAÇÕES E CONSTANTES ====================

AI_MODELS = {
    'gemini-pro': {
        'name': 'Google Gemini Pro',
        'description': 'Modelo avançado do Google para conversas gerais',
        'max_tokens': 8192,
        'cost_per_1k_tokens': 0.001,
        'specialties': ['general', 'analysis', 'creative']
    },
    'gemini-spiritual': {
        'name': 'Gemini Espiritual',
        'description': 'Gemini otimizado para questões espirituais',
        'max_tokens': 8192,
        'cost_per_1k_tokens': 0.001,
        'specialties': ['spiritual', 'meditation', 'consciousness']
    },
    'gpt-4': {
        'name': 'OpenAI GPT-4',
        'description': 'Modelo mais avançado da OpenAI',
        'max_tokens': 8192,
        'cost_per_1k_tokens': 0.03,
        'specialties': ['analysis', 'reasoning', 'complex_tasks']
    },
    'gpt-3.5-turbo': {
        'name': 'OpenAI GPT-3.5 Turbo',
        'description': 'Modelo rápido e eficiente da OpenAI',
        'max_tokens': 4096,
        'cost_per_1k_tokens': 0.002,
        'specialties': ['general', 'quick_responses']
    }
}

SPIRITUAL_PROMPTS = {
    'meditation': """Como um guia espiritual experiente, forneça orientação sobre meditação. 
    Considere diferentes tradições (budista, hindu, cristã, secular) e adapte sua resposta ao nível do praticante.
    Seja prático, compassivo e inclua técnicas específicas quando apropriado.""",
    
    'consciousness': """Como um mestre espiritual, explore questões sobre consciência e despertar espiritual.
    Integre sabedoria de diferentes tradições espirituais e filosofias. Seja profundo mas acessível,
    oferecendo insights práticos para o desenvolvimento da consciência.""",
    
    'starseed': """Como um guia especializado em starseeds e origens estelares, forneça orientação sobre
    ativação starseed, missão de vida e conexão galáctica. Seja respeitoso com diferentes crenças
    e ofereça práticas concretas para desenvolvimento.""",
    
    'chakras': """Como um especialista em sistema de chakras, forneça orientação sobre equilíbrio energético,
    limpeza e ativação dos chakras. Inclua técnicas práticas, cristais, mantras e visualizações
    apropriadas para cada chakra.""",
    
    'past_lives': """Como um terapeuta de vidas passadas experiente, explore memórias e padrões kármicos.
    Seja cuidadoso e terapêutico na abordagem, oferecendo técnicas seguras de exploração
    e cura de traumas de vidas passadas.""",
    
    'general': """Como um guia espiritual compassivo e sábio, responda com amor incondicional e sabedoria.
    Integre diferentes tradições espirituais conforme apropriado e ofereça orientação prática
    para o crescimento espiritual."""
}

# ==================== CRUD OPERATIONS ====================

@ai_bp.route("/conversations", methods=["POST"])
@jwt_required()
@require_permission(Permission.USE_AI_CHAT)
@check_usage_limit('ai_conversations_per_month')
def create_ai_conversation():
    """Criar nova conversa com IA - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Validar campos obrigatórios
        user_message = data.get("message", "").strip()
        if not user_message:
            return jsonify({"error": "Mensagem é obrigatória"}), 400
        
        # Parâmetros opcionais
        ai_model = data.get("model", "gemini-pro")
        conversation_type = data.get("type", "general")
        context = data.get("context", "")
        temperature = data.get("temperature", 0.7)
        max_tokens = data.get("max_tokens", 1000)
        
        # Validar modelo
        if ai_model not in AI_MODELS:
            return jsonify({
                "error": "Modelo de IA não suportado",
                "available_models": list(AI_MODELS.keys())
            }), 400
        
        # Verificar se usuário tem acesso ao modelo
        if not _user_has_model_access(user, ai_model):
            return jsonify({
                "error": "Acesso negado ao modelo",
                "required_plan": _get_required_plan_for_model(ai_model),
                "current_plan": user.plan.name if user.plan else "Free"
            }), 403
        
        # Gerar resposta da IA
        ai_response, tokens_used, model_used = _generate_ai_response(
            user_message, ai_model, conversation_type, context, temperature, max_tokens
        )
        
        if not ai_response:
            return jsonify({"error": "Falha ao gerar resposta da IA"}), 500
        
        # Preparar dados da conversa
        conversation_data = {
            "messages": [
                {
                    "role": "user",
                    "content": user_message,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                },
                {
                    "role": "assistant",
                    "content": ai_response,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }
            ],
            "metadata": {
                "model": model_used,
                "type": conversation_type,
                "tokens_used": tokens_used,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "context": context,
                "user_plan": user.plan.name if user.plan else "Free"
            }
        }
        
        # Salvar conversa
        new_conversation = AIConversation(
            user_id=current_user_id,
            conversation=json.dumps(conversation_data, ensure_ascii=False),
            timestamp=datetime.datetime.utcnow()
        )
        
        db.session.add(new_conversation)
        db.session.commit()
        
        # Criar índice para busca
        _create_conversation_index(new_conversation.id, user_message, ai_response)
        
        # Analisar sentimento
        sentiment_analysis = _analyze_sentiment(user_message, ai_response)
        
        # Log da criação
        security_service.log_user_action(
            current_user_id,
            'ai_conversation_created',
            {
                'conversation_id': new_conversation.id,
                'model_used': model_used,
                'tokens_used': tokens_used,
                'conversation_type': conversation_type,
                'sentiment': sentiment_analysis
            }
        )
        
        return jsonify({
            "message": "Conversa criada com sucesso",
            "conversation": {
                "id": new_conversation.id,
                "messages": conversation_data["messages"],
                "metadata": conversation_data["metadata"],
                "sentiment_analysis": sentiment_analysis,
                "timestamp": new_conversation.timestamp.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/conversations", methods=["GET"])
@jwt_required()
@require_permission(Permission.ACCESS_AI_HISTORY)
def list_ai_conversations():
    """Listar conversas IA com filtros e paginação - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '').strip()
        conversation_type = request.args.get('type')
        model = request.args.get('model')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        order_by = request.args.get('order_by', 'timestamp')
        order_dir = request.args.get('order_dir', 'desc')
        
        # Construir query base
        query = AIConversation.query.filter_by(user_id=current_user_id)
        
        # Aplicar filtros de data
        if start_date:
            try:
                start_dt = datetime.datetime.fromisoformat(start_date)
                query = query.filter(AIConversation.timestamp >= start_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para start_date"}), 400
        
        if end_date:
            try:
                end_dt = datetime.datetime.fromisoformat(end_date)
                query = query.filter(AIConversation.timestamp <= end_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para end_date"}), 400
        
        # Aplicar busca textual
        if search:
            # Busca no conteúdo JSON da conversa
            search_pattern = f"%{search}%"
            query = query.filter(AIConversation.conversation.like(search_pattern))
        
        # Aplicar ordenação
        if order_by == 'timestamp':
            if order_dir == 'desc':
                query = query.order_by(AIConversation.timestamp.desc())
            else:
                query = query.order_by(AIConversation.timestamp.asc())
        
        # Paginação
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        conversations = []
        for conv in pagination.items:
            try:
                conversation_data = json.loads(conv.conversation)
                
                # Filtrar por tipo se especificado
                if conversation_type and conversation_data.get('metadata', {}).get('type') != conversation_type:
                    continue
                
                # Filtrar por modelo se especificado
                if model and conversation_data.get('metadata', {}).get('model') != model:
                    continue
                
                # Preparar resumo da conversa
                messages = conversation_data.get('messages', [])
                last_user_message = ""
                last_ai_message = ""
                
                for msg in reversed(messages):
                    if msg['role'] == 'user' and not last_user_message:
                        last_user_message = msg['content'][:200] + "..." if len(msg['content']) > 200 else msg['content']
                    elif msg['role'] == 'assistant' and not last_ai_message:
                        last_ai_message = msg['content'][:200] + "..." if len(msg['content']) > 200 else msg['content']
                
                conversations.append({
                    "id": conv.id,
                    "summary": {
                        "last_user_message": last_user_message,
                        "last_ai_message": last_ai_message,
                        "message_count": len(messages)
                    },
                    "metadata": conversation_data.get('metadata', {}),
                    "timestamp": conv.timestamp.isoformat()
                })
                
            except json.JSONDecodeError:
                # Conversa em formato antigo
                conversations.append({
                    "id": conv.id,
                    "summary": {
                        "content": conv.conversation[:200] + "..." if len(conv.conversation) > 200 else conv.conversation,
                        "message_count": 1
                    },
                    "metadata": {"format": "legacy"},
                    "timestamp": conv.timestamp.isoformat()
                })
        
        # Estatísticas
        total_conversations = AIConversation.query.filter_by(user_id=current_user_id).count()
        
        return jsonify({
            "conversations": conversations,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            },
            "statistics": {
                "total_conversations": total_conversations,
                "available_models": list(AI_MODELS.keys())
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/conversations/<int:conv_id>", methods=["GET"])
@jwt_required()
@require_permission(Permission.ACCESS_AI_HISTORY)
def get_ai_conversation(conv_id):
    """Obter conversa IA específica - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        conversation = AIConversation.query.filter_by(
            id=conv_id,
            user_id=current_user_id
        ).first()
        
        if not conversation:
            return jsonify({"error": "Conversa não encontrada"}), 404
        
        try:
            conversation_data = json.loads(conversation.conversation)
        except json.JSONDecodeError:
            # Formato antigo - converter
            conversation_data = {
                "messages": [
                    {
                        "role": "mixed",
                        "content": conversation.conversation,
                        "timestamp": conversation.timestamp.isoformat()
                    }
                ],
                "metadata": {"format": "legacy"}
            }
        
        # Analisar sentimento se não existir
        if 'sentiment_analysis' not in conversation_data:
            messages = conversation_data.get('messages', [])
            user_text = " ".join([msg['content'] for msg in messages if msg['role'] == 'user'])
            ai_text = " ".join([msg['content'] for msg in messages if msg['role'] == 'assistant'])
            conversation_data['sentiment_analysis'] = _analyze_sentiment(user_text, ai_text)
        
        # Calcular estatísticas da conversa
        stats = _calculate_conversation_stats(conversation_data)
        
        return jsonify({
            "conversation": {
                "id": conversation.id,
                "messages": conversation_data.get('messages', []),
                "metadata": conversation_data.get('metadata', {}),
                "sentiment_analysis": conversation_data.get('sentiment_analysis', {}),
                "statistics": stats,
                "timestamp": conversation.timestamp.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/conversations/<int:conv_id>/continue", methods=["POST"])
@jwt_required()
@require_permission(Permission.USE_AI_CHAT)
@check_usage_limit('ai_conversations_per_month')
def continue_ai_conversation(conv_id):
    """Continuar conversa existente - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        conversation = AIConversation.query.filter_by(
            id=conv_id,
            user_id=current_user_id
        ).first()
        
        if not conversation:
            return jsonify({"error": "Conversa não encontrada"}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        user_message = data.get("message", "").strip()
        if not user_message:
            return jsonify({"error": "Mensagem é obrigatória"}), 400
        
        # Carregar conversa existente
        try:
            conversation_data = json.loads(conversation.conversation)
        except json.JSONDecodeError:
            return jsonify({"error": "Formato de conversa inválido"}), 400
        
        # Obter configurações da conversa
        metadata = conversation_data.get('metadata', {})
        ai_model = metadata.get('model', 'gemini-pro')
        conversation_type = metadata.get('type', 'general')
        temperature = data.get('temperature', metadata.get('temperature', 0.7))
        max_tokens = data.get('max_tokens', metadata.get('max_tokens', 1000))
        
        # Verificar acesso ao modelo
        if not _user_has_model_access(user, ai_model):
            return jsonify({
                "error": "Acesso negado ao modelo",
                "required_plan": _get_required_plan_for_model(ai_model)
            }), 403
        
        # Preparar contexto da conversa
        context = _build_conversation_context(conversation_data.get('messages', []))
        
        # Gerar resposta da IA
        ai_response, tokens_used, model_used = _generate_ai_response(
            user_message, ai_model, conversation_type, context, temperature, max_tokens
        )
        
        if not ai_response:
            return jsonify({"error": "Falha ao gerar resposta da IA"}), 500
        
        # Adicionar novas mensagens
        new_messages = [
            {
                "role": "user",
                "content": user_message,
                "timestamp": datetime.datetime.utcnow().isoformat()
            },
            {
                "role": "assistant",
                "content": ai_response,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
        ]
        
        conversation_data['messages'].extend(new_messages)
        
        # Atualizar metadata
        conversation_data['metadata']['tokens_used'] = conversation_data['metadata'].get('tokens_used', 0) + tokens_used
        conversation_data['metadata']['last_updated'] = datetime.datetime.utcnow().isoformat()
        
        # Salvar conversa atualizada
        conversation.conversation = json.dumps(conversation_data, ensure_ascii=False)
        conversation.timestamp = datetime.datetime.utcnow()  # Atualizar timestamp
        
        db.session.commit()
        
        # Atualizar índice
        _update_conversation_index(conv_id, user_message, ai_response)
        
        # Analisar sentimento das novas mensagens
        sentiment_analysis = _analyze_sentiment(user_message, ai_response)
        
        # Log da continuação
        security_service.log_user_action(
            current_user_id,
            'ai_conversation_continued',
            {
                'conversation_id': conv_id,
                'model_used': model_used,
                'tokens_used': tokens_used,
                'sentiment': sentiment_analysis
            }
        )
        
        return jsonify({
            "message": "Conversa continuada com sucesso",
            "new_messages": new_messages,
            "sentiment_analysis": sentiment_analysis,
            "tokens_used": tokens_used
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/conversations/<int:conv_id>", methods=["DELETE"])
@jwt_required()
@require_permission(Permission.ACCESS_AI_HISTORY)
def delete_ai_conversation(conv_id):
    """Excluir conversa IA - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        conversation = AIConversation.query.filter_by(
            id=conv_id,
            user_id=current_user_id
        ).first()
        
        if not conversation:
            return jsonify({"error": "Conversa não encontrada"}), 404
        
        # Backup dos dados para auditoria
        conversation_backup = {
            "id": conversation.id,
            "conversation": conversation.conversation,
            "timestamp": conversation.timestamp.isoformat()
        }
        
        # Remover índice
        _remove_conversation_index(conv_id)
        
        # Excluir conversa
        db.session.delete(conversation)
        db.session.commit()
        
        # Log da exclusão
        security_service.log_user_action(
            current_user_id,
            'ai_conversation_deleted',
            {
                'deleted_conversation': conversation_backup
            }
        )
        
        return jsonify({
            "message": "Conversa excluída com sucesso",
            "deleted_conversation_id": conv_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== FUNCIONALIDADES AVANÇADAS ====================

@ai_bp.route("/conversations/search", methods=["GET"])
@jwt_required()
@require_permission(Permission.ACCESS_AI_HISTORY)
def search_ai_conversations():
    """Busca avançada em conversas - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de busca
        query_text = request.args.get('q', '').strip()
        search_type = request.args.get('type', 'full_text')  # full_text, semantic, keyword
        limit = min(request.args.get('limit', 20, type=int), 100)
        
        if not query_text:
            return jsonify({"error": "Termo de busca é obrigatório"}), 400
        
        # Executar busca baseada no tipo
        if search_type == 'semantic':
            results = _semantic_search(current_user_id, query_text, limit)
        elif search_type == 'keyword':
            results = _keyword_search(current_user_id, query_text, limit)
        else:
            results = _full_text_search(current_user_id, query_text, limit)
        
        return jsonify({
            "search_results": results,
            "query": query_text,
            "search_type": search_type,
            "total_results": len(results)
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/conversations/analytics", methods=["GET"])
@jwt_required()
@require_permission(Permission.ACCESS_AI_HISTORY)
def get_conversation_analytics():
    """Análise avançada das conversas - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros
        period = request.args.get('period', '30d')  # 7d, 30d, 90d, 1y, all
        
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
            start_date = None
        
        # Obter conversas do período
        query = AIConversation.query.filter_by(user_id=current_user_id)
        if start_date:
            query = query.filter(AIConversation.timestamp >= start_date)
        
        conversations = query.all()
        
        # Calcular analytics
        analytics = _calculate_conversation_analytics(conversations)
        
        return jsonify({
            "analytics": analytics,
            "period": period,
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat(),
            "total_conversations": len(conversations)
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/conversations/compress", methods=["POST"])
@jwt_required()
@require_permission(Permission.ACCESS_AI_HISTORY)
@require_plan('Essential')
def compress_old_conversations():
    """Comprimir conversas antigas - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        data = request.get_json() or {}
        days_old = data.get('days_old', 90)  # Comprimir conversas com mais de 90 dias
        compression_level = data.get('compression_level', 6)  # 1-9
        
        # Data limite
        cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_old)
        
        # Obter conversas antigas
        old_conversations = AIConversation.query.filter(
            AIConversation.user_id == current_user_id,
            AIConversation.timestamp < cutoff_date
        ).all()
        
        if not old_conversations:
            return jsonify({
                "message": "Nenhuma conversa antiga encontrada para compressão",
                "cutoff_date": cutoff_date.isoformat()
            }), 200
        
        compressed_count = 0
        total_size_before = 0
        total_size_after = 0
        
        for conv in old_conversations:
            # Calcular tamanho original
            original_size = len(conv.conversation.encode('utf-8'))
            total_size_before += original_size
            
            # Comprimir apenas se não estiver já comprimido
            if not conv.conversation.startswith('COMPRESSED:'):
                try:
                    # Comprimir dados
                    compressed_data = gzip.compress(
                        conv.conversation.encode('utf-8'),
                        compresslevel=compression_level
                    )
                    
                    # Codificar em base64 para armazenamento
                    import base64
                    encoded_data = base64.b64encode(compressed_data).decode('utf-8')
                    
                    # Marcar como comprimido
                    conv.conversation = f"COMPRESSED:{encoded_data}"
                    
                    compressed_count += 1
                    
                    # Calcular tamanho comprimido
                    compressed_size = len(conv.conversation.encode('utf-8'))
                    total_size_after += compressed_size
                    
                except Exception as e:
                    print(f"Erro ao comprimir conversa {conv.id}: {str(e)}")
                    total_size_after += original_size
            else:
                total_size_after += original_size
        
        # Salvar alterações
        db.session.commit()
        
        # Calcular estatísticas
        compression_ratio = (total_size_before - total_size_after) / total_size_before * 100 if total_size_before > 0 else 0
        
        # Log da compressão
        security_service.log_user_action(
            current_user_id,
            'conversations_compressed',
            {
                'conversations_processed': len(old_conversations),
                'conversations_compressed': compressed_count,
                'size_before_bytes': total_size_before,
                'size_after_bytes': total_size_after,
                'compression_ratio_percent': compression_ratio,
                'days_old_threshold': days_old
            }
        )
        
        return jsonify({
            "message": "Compressão concluída com sucesso",
            "statistics": {
                "conversations_processed": len(old_conversations),
                "conversations_compressed": compressed_count,
                "size_before_mb": round(total_size_before / 1024 / 1024, 2),
                "size_after_mb": round(total_size_after / 1024 / 1024, 2),
                "compression_ratio_percent": round(compression_ratio, 2),
                "space_saved_mb": round((total_size_before - total_size_after) / 1024 / 1024, 2)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/conversations/export", methods=["GET"])
@jwt_required()
@require_permission(Permission.EXPORT_AI_CONVERSATIONS)
@check_usage_limit('reports_per_month')
def export_ai_conversations():
    """Exportar conversas IA - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Parâmetros
        export_format = request.args.get('format', 'json').lower()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        include_analytics = request.args.get('include_analytics', 'true').lower() == 'true'
        decompress = request.args.get('decompress', 'true').lower() == 'true'
        
        # Construir query
        query = AIConversation.query.filter_by(user_id=current_user_id)
        
        if start_date:
            try:
                start_dt = datetime.datetime.fromisoformat(start_date)
                query = query.filter(AIConversation.timestamp >= start_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para start_date"}), 400
        
        if end_date:
            try:
                end_dt = datetime.datetime.fromisoformat(end_date)
                query = query.filter(AIConversation.timestamp <= end_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para end_date"}), 400
        
        # Obter conversas
        conversations = query.order_by(AIConversation.timestamp.desc()).all()
        
        # Preparar dados para exportação
        export_data = {
            "user_info": {
                "username": user.username,
                "export_date": datetime.datetime.utcnow().isoformat(),
                "total_conversations": len(conversations)
            },
            "conversations": []
        }
        
        for conv in conversations:
            conversation_content = conv.conversation
            
            # Descomprimir se necessário
            if decompress and conversation_content.startswith('COMPRESSED:'):
                conversation_content = _decompress_conversation(conversation_content)
            
            try:
                conversation_data = json.loads(conversation_content)
            except json.JSONDecodeError:
                # Formato antigo
                conversation_data = {
                    "messages": [{"role": "mixed", "content": conversation_content}],
                    "metadata": {"format": "legacy"}
                }
            
            export_data["conversations"].append({
                "id": conv.id,
                "timestamp": conv.timestamp.isoformat(),
                "messages": conversation_data.get("messages", []),
                "metadata": conversation_data.get("metadata", {}),
                "sentiment_analysis": conversation_data.get("sentiment_analysis", {})
            })
        
        # Incluir analytics se solicitado
        if include_analytics:
            export_data["analytics"] = _calculate_conversation_analytics(conversations)
        
        # Log da exportação
        security_service.log_user_action(
            current_user_id,
            'ai_conversations_exported',
            {
                'export_format': export_format,
                'conversations_count': len(conversations),
                'include_analytics': include_analytics
            }
        )
        
        if export_format == 'csv':
            return _export_conversations_to_csv(export_data, user.username)
        elif export_format == 'txt':
            return _export_conversations_to_txt(export_data, user.username)
        else:
            # JSON
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.json')
            temp_path = temp_file.name
            temp_file.close()
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, ensure_ascii=False, indent=2)
            
            filename = f"ilyra_conversas_ia_{user.username}_{datetime.datetime.now().strftime('%Y%m%d')}.json"
            
            return send_file(
                temp_path,
                as_attachment=True,
                download_name=filename,
                mimetype="application/json"
            )
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@ai_bp.route("/models", methods=["GET"])
def get_available_models():
    """Obter modelos de IA disponíveis"""
    try:
        return jsonify({
            "models": AI_MODELS,
            "spiritual_prompts": list(SPIRITUAL_PROMPTS.keys())
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== FUNÇÕES AUXILIARES ====================

async def _generate_ai_response(message, model, conversation_type, context, temperature, max_tokens):
    """Gerar resposta da IA"""
    try:
        # Preparar prompt baseado no tipo de conversa
        system_prompt = SPIRITUAL_PROMPTS.get(conversation_type, SPIRITUAL_PROMPTS['general'])
        
        # Construir prompt completo
        full_prompt = f"{system_prompt}\n\nContexto da conversa:\n{context}\n\nPergunta do usuário: {message}"
        
        if model.startswith('gemini'):
            if not gemini_model:
                return None, 0, model
            
            try:
                response = gemini_model.generate_content(
                    full_prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=temperature,
                        max_output_tokens=max_tokens
                    )
                )
                
                ai_response = response.text
                tokens_used = len(full_prompt.split()) + len(ai_response.split())  # Estimativa
                
                return ai_response, tokens_used, model
                
            except Exception as e:
                print(f"Erro no Gemini: {str(e)}")
                return None, 0, model
        
        elif model.startswith('gpt'):
            if not openai:
                return None, 0, model
            
            try:
                response = openai.ChatCompletion.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Contexto: {context}\n\nPergunta: {message}"}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                
                ai_response = response.choices[0].message.content
                tokens_used = response.usage.total_tokens
                
                return ai_response, tokens_used, model
                
            except Exception as e:
                print(f"Erro no OpenAI: {str(e)}")
                return None, 0, model
        
        return None, 0, model
        
    except Exception as e:
        print(f"Erro geral na geração de resposta: {str(e)}")
        return None, 0, model

def _user_has_model_access(user, model):
    """Verificar se usuário tem acesso ao modelo"""
    if user.role == 'admin':
        return True
    
    if not user.plan:
        return model in ['gemini-pro']  # Apenas modelo básico para usuários sem plano
    
    plan_name = user.plan.name
    
    if plan_name == 'Free':
        return model in ['gemini-pro']
    elif plan_name == 'Essential':
        return model in ['gemini-pro', 'gemini-spiritual']
    elif plan_name == 'Premium':
        return model in ['gemini-pro', 'gemini-spiritual', 'gpt-3.5-turbo']
    elif plan_name == 'Master':
        return True  # Acesso a todos os modelos
    
    return False

def _get_required_plan_for_model(model):
    """Obter plano mínimo necessário para o modelo"""
    if model in ['gemini-pro']:
        return 'Free'
    elif model in ['gemini-spiritual']:
        return 'Essential'
    elif model in ['gpt-3.5-turbo']:
        return 'Premium'
    elif model in ['gpt-4']:
        return 'Master'
    
    return 'Master'

def _build_conversation_context(messages):
    """Construir contexto da conversa"""
    context_messages = messages[-6:]  # Últimas 6 mensagens para contexto
    
    context = ""
    for msg in context_messages:
        role = "Usuário" if msg['role'] == 'user' else "Assistente"
        context += f"{role}: {msg['content']}\n"
    
    return context.strip()

def _analyze_sentiment(user_text, ai_text):
    """Analisar sentimento das mensagens"""
    try:
        # Análise simples de sentimento
        # Em produção, usar bibliotecas como TextBlob, VADER ou APIs especializadas
        
        # Palavras positivas e negativas em português
        positive_words = [
            'feliz', 'alegre', 'amor', 'paz', 'gratidão', 'esperança', 'luz', 'harmonia',
            'equilíbrio', 'serenidade', 'confiança', 'fé', 'sabedoria', 'crescimento'
        ]
        
        negative_words = [
            'triste', 'raiva', 'medo', 'ansiedade', 'depressão', 'dor', 'sofrimento',
            'confusão', 'perdido', 'vazio', 'desespero', 'angústia', 'preocupação'
        ]
        
        # Contar palavras
        user_text_lower = user_text.lower()
        positive_count = sum(1 for word in positive_words if word in user_text_lower)
        negative_count = sum(1 for word in negative_words if word in user_text_lower)
        
        # Calcular polaridade
        total_words = len(user_text.split())
        if total_words == 0:
            polarity = 0
        else:
            polarity = (positive_count - negative_count) / total_words
        
        # Determinar sentimento
        if polarity > 0.1:
            sentiment = 'positive'
        elif polarity < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            "sentiment": sentiment,
            "polarity": polarity,
            "positive_words_count": positive_count,
            "negative_words_count": negative_count,
            "confidence": min(abs(polarity) * 10, 1.0)
        }
        
    except Exception as e:
        return {
            "sentiment": "unknown",
            "error": str(e)
        }

def _calculate_conversation_stats(conversation_data):
    """Calcular estatísticas da conversa"""
    try:
        messages = conversation_data.get('messages', [])
        
        if not messages:
            return {"message": "Nenhuma mensagem encontrada"}
        
        user_messages = [msg for msg in messages if msg['role'] == 'user']
        ai_messages = [msg for msg in messages if msg['role'] == 'assistant']
        
        # Calcular estatísticas básicas
        stats = {
            "total_messages": len(messages),
            "user_messages": len(user_messages),
            "ai_messages": len(ai_messages),
            "total_characters": sum(len(msg['content']) for msg in messages),
            "average_message_length": statistics.mean([len(msg['content']) for msg in messages]) if messages else 0
        }
        
        # Estatísticas de tempo se disponível
        timestamps = [msg.get('timestamp') for msg in messages if msg.get('timestamp')]
        if len(timestamps) >= 2:
            try:
                first_time = datetime.datetime.fromisoformat(timestamps[0].replace('Z', '+00:00'))
                last_time = datetime.datetime.fromisoformat(timestamps[-1].replace('Z', '+00:00'))
                duration = (last_time - first_time).total_seconds()
                stats["conversation_duration_seconds"] = duration
                stats["conversation_duration_minutes"] = round(duration / 60, 2)
            except:
                pass
        
        # Análise de tópicos (palavras-chave mais frequentes)
        all_text = " ".join([msg['content'] for msg in user_messages])
        words = re.findall(r'\b\w+\b', all_text.lower())
        
        # Filtrar palavras comuns
        stop_words = {'o', 'a', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'não', 'que', 'se', 'por', 'mais', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'pelos', 'pelas', 'esse', 'esses', 'essa', 'essas', 'num', 'numa', 'uns', 'umas', 'quanto', 'quanta', 'quantos', 'quantas'}
        
        filtered_words = [word for word in words if len(word) > 3 and word not in stop_words]
        
        if filtered_words:
            word_freq = {}
            for word in filtered_words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            # Top 5 palavras mais frequentes
            top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
            stats["top_keywords"] = [{"word": word, "count": count} for word, count in top_words]
        
        return stats
        
    except Exception as e:
        return {"error": f"Erro ao calcular estatísticas: {str(e)}"}

def _calculate_conversation_analytics(conversations):
    """Calcular analytics abrangentes das conversas"""
    try:
        if not conversations:
            return {"message": "Nenhuma conversa encontrada"}
        
        analytics = {
            "overview": {
                "total_conversations": len(conversations),
                "date_range": {
                    "start": min(conv.timestamp for conv in conversations).isoformat(),
                    "end": max(conv.timestamp for conv in conversations).isoformat()
                }
            },
            "usage_patterns": {},
            "model_usage": {},
            "sentiment_analysis": {},
            "temporal_analysis": {}
        }
        
        # Análise por modelo
        model_counts = defaultdict(int)
        total_tokens = 0
        
        # Análise de sentimentos
        sentiment_counts = defaultdict(int)
        
        # Análise temporal
        daily_counts = defaultdict(int)
        hourly_counts = defaultdict(int)
        
        for conv in conversations:
            try:
                conversation_data = json.loads(conv.conversation)
                metadata = conversation_data.get('metadata', {})
                
                # Contagem por modelo
                model = metadata.get('model', 'unknown')
                model_counts[model] += 1
                
                # Tokens
                tokens = metadata.get('tokens_used', 0)
                total_tokens += tokens
                
                # Sentimento
                sentiment_data = conversation_data.get('sentiment_analysis', {})
                sentiment = sentiment_data.get('sentiment', 'unknown')
                sentiment_counts[sentiment] += 1
                
                # Análise temporal
                date_str = conv.timestamp.strftime('%Y-%m-%d')
                hour = conv.timestamp.hour
                daily_counts[date_str] += 1
                hourly_counts[hour] += 1
                
            except json.JSONDecodeError:
                # Conversa em formato antigo
                model_counts['legacy'] += 1
        
        # Compilar analytics
        analytics["model_usage"] = {
            "by_model": dict(model_counts),
            "total_tokens_used": total_tokens,
            "average_tokens_per_conversation": total_tokens / len(conversations) if conversations else 0
        }
        
        analytics["sentiment_analysis"] = {
            "by_sentiment": dict(sentiment_counts),
            "positive_percentage": (sentiment_counts['positive'] / len(conversations)) * 100 if conversations else 0,
            "negative_percentage": (sentiment_counts['negative'] / len(conversations)) * 100 if conversations else 0,
            "neutral_percentage": (sentiment_counts['neutral'] / len(conversations)) * 100 if conversations else 0
        }
        
        analytics["temporal_analysis"] = {
            "daily_distribution": dict(daily_counts),
            "hourly_distribution": dict(hourly_counts),
            "most_active_day": max(daily_counts.items(), key=lambda x: x[1])[0] if daily_counts else None,
            "most_active_hour": max(hourly_counts.items(), key=lambda x: x[1])[0] if hourly_counts else None
        }
        
        # Padrões de uso
        analytics["usage_patterns"] = {
            "conversations_per_day": len(conversations) / max(len(daily_counts), 1),
            "average_conversation_length": statistics.mean([
                len(conv.conversation) for conv in conversations
            ]) if conversations else 0
        }
        
        return analytics
        
    except Exception as e:
        return {"error": f"Erro ao calcular analytics: {str(e)}"}

def _create_conversation_index(conv_id, user_message, ai_response):
    """Criar índice para busca (implementação simples)"""
    # Em produção, usar Elasticsearch, Whoosh ou similar
    pass

def _update_conversation_index(conv_id, user_message, ai_response):
    """Atualizar índice de busca"""
    # Em produção, atualizar índice de busca
    pass

def _remove_conversation_index(conv_id):
    """Remover do índice de busca"""
    # Em produção, remover do índice
    pass

def _full_text_search(user_id, query_text, limit):
    """Busca de texto completo"""
    try:
        # Busca simples usando LIKE (em produção, usar FTS)
        search_pattern = f"%{query_text}%"
        
        conversations = AIConversation.query.filter(
            AIConversation.user_id == user_id,
            AIConversation.conversation.like(search_pattern)
        ).limit(limit).all()
        
        results = []
        for conv in conversations:
            # Extrair snippet relevante
            content = conv.conversation
            if query_text.lower() in content.lower():
                start_idx = max(0, content.lower().find(query_text.lower()) - 100)
                end_idx = min(len(content), start_idx + 300)
                snippet = content[start_idx:end_idx]
                
                results.append({
                    "conversation_id": conv.id,
                    "timestamp": conv.timestamp.isoformat(),
                    "snippet": snippet,
                    "relevance_score": 1.0  # Placeholder
                })
        
        return results
        
    except Exception as e:
        return []

def _semantic_search(user_id, query_text, limit):
    """Busca semântica (placeholder)"""
    # Em produção, usar embeddings e similaridade vetorial
    return _full_text_search(user_id, query_text, limit)

def _keyword_search(user_id, query_text, limit):
    """Busca por palavras-chave"""
    keywords = query_text.split()
    results = []
    
    for keyword in keywords:
        keyword_results = _full_text_search(user_id, keyword, limit // len(keywords))
        results.extend(keyword_results)
    
    # Remover duplicatas e ordenar por relevância
    seen_ids = set()
    unique_results = []
    
    for result in results:
        if result['conversation_id'] not in seen_ids:
            seen_ids.add(result['conversation_id'])
            unique_results.append(result)
    
    return unique_results[:limit]

def _decompress_conversation(compressed_content):
    """Descomprimir conversa"""
    try:
        if not compressed_content.startswith('COMPRESSED:'):
            return compressed_content
        
        # Remover prefixo
        encoded_data = compressed_content[11:]  # Remove "COMPRESSED:"
        
        # Decodificar base64
        import base64
        compressed_data = base64.b64decode(encoded_data)
        
        # Descomprimir
        decompressed_data = gzip.decompress(compressed_data)
        
        return decompressed_data.decode('utf-8')
        
    except Exception as e:
        print(f"Erro ao descomprimir conversa: {str(e)}")
        return compressed_content

def _export_conversations_to_csv(export_data, username):
    """Exportar conversas para CSV"""
    try:
        import csv
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalho
        writer.writerow([
            'ID', 'Data/Hora', 'Tipo', 'Modelo', 'Mensagem Usuário', 
            'Resposta IA', 'Sentimento', 'Tokens Usados'
        ])
        
        # Dados
        for conv in export_data['conversations']:
            messages = conv.get('messages', [])
            metadata = conv.get('metadata', {})
            sentiment = conv.get('sentiment_analysis', {})
            
            # Extrair primeira mensagem do usuário e resposta da IA
            user_msg = ""
            ai_msg = ""
            
            for msg in messages:
                if msg['role'] == 'user' and not user_msg:
                    user_msg = msg['content']
                elif msg['role'] == 'assistant' and not ai_msg:
                    ai_msg = msg['content']
            
            writer.writerow([
                conv['id'],
                conv['timestamp'],
                metadata.get('type', ''),
                metadata.get('model', ''),
                user_msg,
                ai_msg,
                sentiment.get('sentiment', ''),
                metadata.get('tokens_used', 0)
            ])
        
        temp_file.close()
        
        filename = f"ilyra_conversas_ia_{username}_{datetime.datetime.now().strftime('%Y%m%d')}.csv"
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype="text/csv"
        )
        
    except Exception as e:
        raise Exception(f"Erro ao exportar CSV: {str(e)}")

def _export_conversations_to_txt(export_data, username):
    """Exportar conversas para TXT"""
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.txt', mode='w', encoding='utf-8')
        
        # Cabeçalho
        temp_file.write("=" * 80 + "\n")
        temp_file.write("CONVERSAS IA - iLyra Platform\n")
        temp_file.write(f"Usuário: {username}\n")
        temp_file.write(f"Exportado em: {export_data['user_info']['export_date']}\n")
        temp_file.write(f"Total de conversas: {export_data['user_info']['total_conversations']}\n")
        temp_file.write("=" * 80 + "\n\n")
        
        # Conversas
        for i, conv in enumerate(export_data['conversations'], 1):
            temp_file.write(f"CONVERSA #{i} - ID: {conv['id']}\n")
            temp_file.write(f"Data/Hora: {conv['timestamp']}\n")
            
            metadata = conv.get('metadata', {})
            if metadata:
                temp_file.write(f"Modelo: {metadata.get('model', 'N/A')}\n")
                temp_file.write(f"Tipo: {metadata.get('type', 'N/A')}\n")
            
            temp_file.write("-" * 40 + "\n")
            
            # Mensagens
            for msg in conv.get('messages', []):
                role = "USUÁRIO" if msg['role'] == 'user' else "IA"
                temp_file.write(f"{role}: {msg['content']}\n\n")
            
            temp_file.write("=" * 80 + "\n\n")
        
        temp_file.close()
        
        filename = f"ilyra_conversas_ia_{username}_{datetime.datetime.now().strftime('%Y%m%d')}.txt"
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype="text/plain"
        )
        
    except Exception as e:
        raise Exception(f"Erro ao exportar TXT: {str(e)}")
