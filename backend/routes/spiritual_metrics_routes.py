"""
Sistema Completo de CRUD de Métricas Espirituais - iLyra Platform
Implementação com histórico, cálculos automáticos, agregações e backup
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, SpiritualMetric, User
from permissions_system import (
    require_permission, require_plan, check_usage_limit, Permission
)
from security_service import security_service
import datetime
import json
import pandas as pd
import numpy as np
import tempfile
from sqlalchemy import func, and_, or_
from collections import defaultdict
import statistics
import math

spiritual_metrics_bp = Blueprint("spiritual_metrics", __name__, url_prefix="/api/spiritual-metrics")

# ==================== DEFINIÇÕES DE MÉTRICAS ESPIRITUAIS ====================

SPIRITUAL_METRICS_DEFINITIONS = {
    # Métricas Básicas (12 principais)
    'meditation_daily': {
        'name': 'Meditação Diária',
        'description': 'Tempo diário dedicado à meditação em minutos',
        'unit': 'minutos',
        'min_value': 0,
        'max_value': 480,
        'category': 'basic',
        'calculation_type': 'sum',  # soma diária
        'target_frequency': 'daily'
    },
    'consciousness_level': {
        'name': 'Nível de Consciência',
        'description': 'Nível atual de consciência espiritual (1-100)',
        'unit': 'escala 1-100',
        'min_value': 1,
        'max_value': 100,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'weekly'
    },
    'vital_energy': {
        'name': 'Energia Vital',
        'description': 'Nível de energia vital/chi (1-100)',
        'unit': 'escala 1-100',
        'min_value': 1,
        'max_value': 100,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'daily'
    },
    'soul_age': {
        'name': 'Idade da Alma',
        'description': 'Maturidade espiritual da alma (1-7: Bebê, Criança, Jovem, Madura, Velha, Transcendente, Infinita)',
        'unit': 'escala 1-7',
        'min_value': 1,
        'max_value': 7,
        'category': 'basic',
        'calculation_type': 'latest',
        'target_frequency': 'monthly'
    },
    'starseed_activation': {
        'name': 'Ativação Starseed',
        'description': 'Nível de ativação das características starseed (0-100%)',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'weekly'
    },
    'past_life_memories': {
        'name': 'Memórias de Vidas Passadas',
        'description': 'Clareza das memórias de vidas passadas (1-10)',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic',
        'calculation_type': 'latest',
        'target_frequency': 'monthly'
    },
    'chakra_balance': {
        'name': 'Equilíbrio dos Chakras',
        'description': 'Equilíbrio geral dos 7 chakras principais (0-100%)',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'weekly'
    },
    'energy_protection': {
        'name': 'Proteção Energética',
        'description': 'Nível de proteção contra energias negativas (1-10)',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'daily'
    },
    'intuition_clairvoyance': {
        'name': 'Intuição e Clarividência',
        'description': 'Desenvolvimento da intuição e clarividência (1-10)',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'weekly'
    },
    'spirit_guides_connection': {
        'name': 'Conexão com Guias',
        'description': 'Qualidade da conexão com guias espirituais (1-10)',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'weekly'
    },
    'vibrational_frequency': {
        'name': 'Frequência Vibracional',
        'description': 'Frequência vibracional atual em Hz',
        'unit': 'Hz',
        'min_value': 20,
        'max_value': 1000,
        'category': 'basic',
        'calculation_type': 'average',
        'target_frequency': 'daily'
    },
    'life_purpose': {
        'name': 'Propósito de Vida',
        'description': 'Clareza sobre o propósito de vida (0-100%)',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'basic',
        'calculation_type': 'latest',
        'target_frequency': 'monthly'
    }
}

# ==================== CRUD OPERATIONS ====================

@spiritual_metrics_bp.route("/create", methods=["POST"])
@jwt_required()
@require_permission(Permission.CREATE_SPIRITUAL_METRICS)
@check_usage_limit('spiritual_metrics_count')
def create_spiritual_metric():
    """Criar nova métrica espiritual - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Validar campos obrigatórios
        required_fields = ['name', 'value']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400
        
        metric_name = data['name'].strip()
        metric_value = data['value']
        
        # Validar se a métrica existe nas definições
        if metric_name not in SPIRITUAL_METRICS_DEFINITIONS:
            return jsonify({
                "error": "Métrica não reconhecida",
                "available_metrics": list(SPIRITUAL_METRICS_DEFINITIONS.keys())
            }), 400
        
        metric_def = SPIRITUAL_METRICS_DEFINITIONS[metric_name]
        
        # Validar valor dentro dos limites
        if not isinstance(metric_value, (int, float)):
            return jsonify({"error": "Valor deve ser numérico"}), 400
        
        if metric_value < metric_def['min_value'] or metric_value > metric_def['max_value']:
            return jsonify({
                "error": f"Valor fora dos limites permitidos",
                "min_value": metric_def['min_value'],
                "max_value": metric_def['max_value'],
                "unit": metric_def['unit']
            }), 400
        
        # Criar métrica
        spiritual_metric = SpiritualMetric(
            user_id=current_user_id,
            name=metric_name,
            value=float(metric_value),
            timestamp=datetime.datetime.utcnow(),
            notes=data.get('notes', ''),
            category=metric_def['category']
        )
        
        db.session.add(spiritual_metric)
        db.session.commit()
        
        # Calcular estatísticas automáticas
        stats = _calculate_metric_statistics(current_user_id, metric_name)
        
        # Log da criação
        security_service.log_user_action(
            current_user_id,
            'spiritual_metric_created',
            {
                'metric_name': metric_name,
                'metric_value': metric_value,
                'metric_id': spiritual_metric.id,
                'statistics': stats
            }
        )
        
        return jsonify({
            "message": "Métrica espiritual criada com sucesso",
            "metric": {
                "id": spiritual_metric.id,
                "name": spiritual_metric.name,
                "value": spiritual_metric.value,
                "timestamp": spiritual_metric.timestamp.isoformat(),
                "notes": spiritual_metric.notes,
                "category": spiritual_metric.category
            },
            "definition": metric_def,
            "statistics": stats
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/list", methods=["GET"])
@jwt_required()
@require_permission(Permission.READ_SPIRITUAL_METRICS)
def list_spiritual_metrics():
    """Listar métricas espirituais com filtros e paginação - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros de consulta
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        metric_name = request.args.get('name')
        category = request.args.get('category')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        order_by = request.args.get('order_by', 'timestamp')
        order_dir = request.args.get('order_dir', 'desc')
        
        # Construir query
        query = SpiritualMetric.query.filter_by(user_id=current_user_id)
        
        # Aplicar filtros
        if metric_name:
            query = query.filter(SpiritualMetric.name == metric_name)
        
        if category:
            query = query.filter(SpiritualMetric.category == category)
        
        if start_date:
            try:
                start_dt = datetime.datetime.fromisoformat(start_date)
                query = query.filter(SpiritualMetric.timestamp >= start_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para start_date"}), 400
        
        if end_date:
            try:
                end_dt = datetime.datetime.fromisoformat(end_date)
                query = query.filter(SpiritualMetric.timestamp <= end_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para end_date"}), 400
        
        # Aplicar ordenação
        if order_by == 'timestamp':
            if order_dir == 'desc':
                query = query.order_by(SpiritualMetric.timestamp.desc())
            else:
                query = query.order_by(SpiritualMetric.timestamp.asc())
        elif order_by == 'value':
            if order_dir == 'desc':
                query = query.order_by(SpiritualMetric.value.desc())
            else:
                query = query.order_by(SpiritualMetric.value.asc())
        elif order_by == 'name':
            if order_dir == 'desc':
                query = query.order_by(SpiritualMetric.name.desc())
            else:
                query = query.order_by(SpiritualMetric.name.asc())
        
        # Paginação
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        metrics = []
        for metric in pagination.items:
            metric_def = SPIRITUAL_METRICS_DEFINITIONS.get(metric.name, {})
            metrics.append({
                "id": metric.id,
                "name": metric.name,
                "value": metric.value,
                "timestamp": metric.timestamp.isoformat(),
                "notes": metric.notes,
                "category": metric.category,
                "definition": metric_def
            })
        
        # Calcular estatísticas gerais
        total_metrics = SpiritualMetric.query.filter_by(user_id=current_user_id).count()
        unique_metrics = db.session.query(SpiritualMetric.name)\
            .filter_by(user_id=current_user_id)\
            .distinct().count()
        
        return jsonify({
            "metrics": metrics,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            },
            "statistics": {
                "total_metrics": total_metrics,
                "unique_metrics": unique_metrics,
                "available_definitions": len(SPIRITUAL_METRICS_DEFINITIONS)
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/<int:metric_id>", methods=["GET"])
@jwt_required()
@require_permission(Permission.READ_SPIRITUAL_METRICS)
def get_spiritual_metric(metric_id):
    """Obter métrica espiritual específica - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        metric = SpiritualMetric.query.filter_by(
            id=metric_id, 
            user_id=current_user_id
        ).first()
        
        if not metric:
            return jsonify({"error": "Métrica não encontrada"}), 404
        
        # Obter definição da métrica
        metric_def = SPIRITUAL_METRICS_DEFINITIONS.get(metric.name, {})
        
        # Calcular estatísticas para esta métrica
        stats = _calculate_metric_statistics(current_user_id, metric.name)
        
        # Obter histórico recente (últimas 10 medições)
        recent_history = SpiritualMetric.query.filter_by(
            user_id=current_user_id,
            name=metric.name
        ).order_by(SpiritualMetric.timestamp.desc()).limit(10).all()
        
        history = []
        for h in recent_history:
            history.append({
                "id": h.id,
                "value": h.value,
                "timestamp": h.timestamp.isoformat(),
                "notes": h.notes
            })
        
        return jsonify({
            "metric": {
                "id": metric.id,
                "name": metric.name,
                "value": metric.value,
                "timestamp": metric.timestamp.isoformat(),
                "notes": metric.notes,
                "category": metric.category
            },
            "definition": metric_def,
            "statistics": stats,
            "recent_history": history
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/<int:metric_id>", methods=["PUT"])
@jwt_required()
@require_permission(Permission.UPDATE_SPIRITUAL_METRICS)
def update_spiritual_metric(metric_id):
    """Atualizar métrica espiritual - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        metric = SpiritualMetric.query.filter_by(
            id=metric_id, 
            user_id=current_user_id
        ).first()
        
        if not metric:
            return jsonify({"error": "Métrica não encontrada"}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Armazenar dados antigos para auditoria
        old_data = {
            "value": metric.value,
            "notes": metric.notes
        }
        
        # Atualizar valor se fornecido
        if 'value' in data:
            new_value = data['value']
            
            if not isinstance(new_value, (int, float)):
                return jsonify({"error": "Valor deve ser numérico"}), 400
            
            # Validar limites se métrica está nas definições
            if metric.name in SPIRITUAL_METRICS_DEFINITIONS:
                metric_def = SPIRITUAL_METRICS_DEFINITIONS[metric.name]
                if new_value < metric_def['min_value'] or new_value > metric_def['max_value']:
                    return jsonify({
                        "error": f"Valor fora dos limites permitidos",
                        "min_value": metric_def['min_value'],
                        "max_value": metric_def['max_value']
                    }), 400
            
            metric.value = float(new_value)
        
        # Atualizar notas se fornecido
        if 'notes' in data:
            metric.notes = data['notes']
        
        # Atualizar timestamp de modificação
        metric.updated_at = datetime.datetime.utcnow()
        
        db.session.commit()
        
        # Log da atualização
        security_service.log_user_action(
            current_user_id,
            'spiritual_metric_updated',
            {
                'metric_id': metric_id,
                'metric_name': metric.name,
                'old_data': old_data,
                'new_data': {
                    "value": metric.value,
                    "notes": metric.notes
                }
            }
        )
        
        return jsonify({
            "message": "Métrica atualizada com sucesso",
            "metric": {
                "id": metric.id,
                "name": metric.name,
                "value": metric.value,
                "timestamp": metric.timestamp.isoformat(),
                "updated_at": metric.updated_at.isoformat() if metric.updated_at else None,
                "notes": metric.notes,
                "category": metric.category
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/<int:metric_id>", methods=["DELETE"])
@jwt_required()
@require_permission(Permission.DELETE_SPIRITUAL_METRICS)
def delete_spiritual_metric(metric_id):
    """Excluir métrica espiritual - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        metric = SpiritualMetric.query.filter_by(
            id=metric_id, 
            user_id=current_user_id
        ).first()
        
        if not metric:
            return jsonify({"error": "Métrica não encontrada"}), 404
        
        # Armazenar dados para auditoria
        metric_data = {
            "id": metric.id,
            "name": metric.name,
            "value": metric.value,
            "timestamp": metric.timestamp.isoformat(),
            "notes": metric.notes,
            "category": metric.category
        }
        
        db.session.delete(metric)
        db.session.commit()
        
        # Log da exclusão
        security_service.log_user_action(
            current_user_id,
            'spiritual_metric_deleted',
            {
                'deleted_metric': metric_data
            }
        )
        
        return jsonify({
            "message": "Métrica excluída com sucesso",
            "deleted_metric": metric_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== FUNCIONALIDADES AVANÇADAS ====================

@spiritual_metrics_bp.route("/statistics", methods=["GET"])
@jwt_required()
@require_permission(Permission.READ_SPIRITUAL_METRICS)
def get_comprehensive_statistics():
    """Obter estatísticas abrangentes - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros
        metric_name = request.args.get('name')
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
        else:  # all
            start_date = None
        
        if metric_name:
            # Estatísticas para métrica específica
            stats = _calculate_detailed_statistics(current_user_id, metric_name, start_date, end_date)
        else:
            # Estatísticas gerais
            stats = _calculate_general_statistics(current_user_id, start_date, end_date)
        
        return jsonify({
            "statistics": stats,
            "period": period,
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/aggregations", methods=["GET"])
@jwt_required()
@require_permission(Permission.READ_SPIRITUAL_METRICS)
def get_metric_aggregations():
    """Obter agregações por período - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros
        metric_name = request.args.get('name')
        group_by = request.args.get('group_by', 'day')  # day, week, month, year
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not metric_name:
            return jsonify({"error": "Nome da métrica é obrigatório"}), 400
        
        # Construir query base
        query = SpiritualMetric.query.filter_by(
            user_id=current_user_id,
            name=metric_name
        )
        
        # Aplicar filtros de data
        if start_date:
            try:
                start_dt = datetime.datetime.fromisoformat(start_date)
                query = query.filter(SpiritualMetric.timestamp >= start_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para start_date"}), 400
        
        if end_date:
            try:
                end_dt = datetime.datetime.fromisoformat(end_date)
                query = query.filter(SpiritualMetric.timestamp <= end_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para end_date"}), 400
        
        # Obter dados
        metrics = query.order_by(SpiritualMetric.timestamp.asc()).all()
        
        if not metrics:
            return jsonify({
                "aggregations": [],
                "message": "Nenhuma métrica encontrada para o período especificado"
            }), 200
        
        # Agrupar dados
        aggregations = _group_metrics_by_period(metrics, group_by)
        
        return jsonify({
            "metric_name": metric_name,
            "group_by": group_by,
            "aggregations": aggregations,
            "total_records": len(metrics)
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/trends", methods=["GET"])
@jwt_required()
@require_permission(Permission.READ_SPIRITUAL_METRICS)
def get_metric_trends():
    """Analisar tendências das métricas - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        
        # Parâmetros
        metric_name = request.args.get('name')
        period = request.args.get('period', '30d')
        
        if not metric_name:
            return jsonify({"error": "Nome da métrica é obrigatório"}), 400
        
        # Calcular período
        end_date = datetime.datetime.utcnow()
        if period == '7d':
            start_date = end_date - datetime.timedelta(days=7)
        elif period == '30d':
            start_date = end_date - datetime.timedelta(days=30)
        elif period == '90d':
            start_date = end_date - datetime.timedelta(days=90)
        else:
            start_date = end_date - datetime.timedelta(days=365)
        
        # Obter dados
        metrics = SpiritualMetric.query.filter(
            SpiritualMetric.user_id == current_user_id,
            SpiritualMetric.name == metric_name,
            SpiritualMetric.timestamp >= start_date
        ).order_by(SpiritualMetric.timestamp.asc()).all()
        
        if len(metrics) < 2:
            return jsonify({
                "trend_analysis": {
                    "trend": "insufficient_data",
                    "message": "Dados insuficientes para análise de tendência"
                }
            }), 200
        
        # Analisar tendência
        trend_analysis = _analyze_trend(metrics)
        
        return jsonify({
            "metric_name": metric_name,
            "period": period,
            "trend_analysis": trend_analysis,
            "data_points": len(metrics)
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/export", methods=["GET"])
@jwt_required()
@require_permission(Permission.EXPORT_SPIRITUAL_METRICS)
@check_usage_limit('reports_per_month')
def export_spiritual_metrics():
    """Exportar métricas espirituais - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Parâmetros
        export_format = request.args.get('format', 'json').lower()
        metric_name = request.args.get('name')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        include_statistics = request.args.get('include_statistics', 'true').lower() == 'true'
        
        # Construir query
        query = SpiritualMetric.query.filter_by(user_id=current_user_id)
        
        if metric_name:
            query = query.filter(SpiritualMetric.name == metric_name)
        
        if start_date:
            try:
                start_dt = datetime.datetime.fromisoformat(start_date)
                query = query.filter(SpiritualMetric.timestamp >= start_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para start_date"}), 400
        
        if end_date:
            try:
                end_dt = datetime.datetime.fromisoformat(end_date)
                query = query.filter(SpiritualMetric.timestamp <= end_dt)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para end_date"}), 400
        
        # Obter dados
        metrics = query.order_by(SpiritualMetric.timestamp.desc()).all()
        
        # Preparar dados para exportação
        export_data = {
            "user_info": {
                "username": user.username,
                "export_date": datetime.datetime.utcnow().isoformat(),
                "total_metrics": len(metrics)
            },
            "metrics": []
        }
        
        for metric in metrics:
            metric_def = SPIRITUAL_METRICS_DEFINITIONS.get(metric.name, {})
            export_data["metrics"].append({
                "id": metric.id,
                "name": metric.name,
                "display_name": metric_def.get('name', metric.name),
                "value": metric.value,
                "unit": metric_def.get('unit', ''),
                "category": metric.category,
                "timestamp": metric.timestamp.isoformat(),
                "notes": metric.notes,
                "definition": metric_def
            })
        
        # Incluir estatísticas se solicitado
        if include_statistics:
            export_data["statistics"] = _calculate_general_statistics(current_user_id)
        
        # Log da exportação
        security_service.log_user_action(
            current_user_id,
            'spiritual_metrics_exported',
            {
                'export_format': export_format,
                'metrics_count': len(metrics),
                'include_statistics': include_statistics
            }
        )
        
        if export_format == 'csv':
            return _export_to_csv(export_data, user.username)
        elif export_format == 'excel':
            return _export_to_excel(export_data, user.username)
        else:
            # JSON
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.json')
            temp_path = temp_file.name
            temp_file.close()
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, ensure_ascii=False, indent=2)
            
            filename = f"ilyra_metricas_{user.username}_{datetime.datetime.now().strftime('%Y%m%d')}.json"
            
            return send_file(
                temp_path,
                as_attachment=True,
                download_name=filename,
                mimetype="application/json"
            )
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/backup", methods=["POST"])
@jwt_required()
@require_permission(Permission.EXPORT_SPIRITUAL_METRICS)
@require_plan('Essential')
def create_backup():
    """Criar backup completo das métricas - IMPLEMENTAÇÃO COMPLETA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Obter todas as métricas
        metrics = SpiritualMetric.query.filter_by(user_id=current_user_id)\
            .order_by(SpiritualMetric.timestamp.desc()).all()
        
        # Preparar dados do backup
        backup_data = {
            "backup_info": {
                "user_id": current_user_id,
                "username": user.username,
                "created_at": datetime.datetime.utcnow().isoformat(),
                "total_metrics": len(metrics),
                "backup_version": "1.0"
            },
            "metrics": [],
            "definitions": SPIRITUAL_METRICS_DEFINITIONS,
            "statistics": _calculate_general_statistics(current_user_id)
        }
        
        for metric in metrics:
            backup_data["metrics"].append({
                "id": metric.id,
                "name": metric.name,
                "value": metric.value,
                "timestamp": metric.timestamp.isoformat(),
                "notes": metric.notes,
                "category": metric.category,
                "created_at": metric.timestamp.isoformat(),
                "updated_at": metric.updated_at.isoformat() if metric.updated_at else None
            })
        
        # Salvar backup
        backup_filename = f"backup_metricas_{user.username}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.json')
        temp_path = temp_file.name
        temp_file.close()
        
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        # Log do backup
        security_service.log_user_action(
            current_user_id,
            'spiritual_metrics_backup_created',
            {
                'backup_filename': backup_filename,
                'metrics_count': len(metrics),
                'backup_size_bytes': len(json.dumps(backup_data))
            }
        )
        
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=backup_filename,
            mimetype="application/json"
        )
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@spiritual_metrics_bp.route("/definitions", methods=["GET"])
def get_metric_definitions():
    """Obter definições de todas as métricas disponíveis"""
    try:
        category = request.args.get('category')
        
        definitions = SPIRITUAL_METRICS_DEFINITIONS
        
        if category:
            definitions = {
                k: v for k, v in definitions.items() 
                if v.get('category') == category
            }
        
        # Agrupar por categoria
        by_category = defaultdict(list)
        for key, definition in definitions.items():
            by_category[definition.get('category', 'other')].append({
                "key": key,
                **definition
            })
        
        return jsonify({
            "definitions": definitions,
            "by_category": dict(by_category),
            "total_metrics": len(definitions),
            "categories": list(set(d.get('category', 'other') for d in definitions.values()))
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# ==================== FUNÇÕES AUXILIARES ====================

def _calculate_metric_statistics(user_id, metric_name):
    """Calcular estatísticas para uma métrica específica"""
    try:
        metrics = SpiritualMetric.query.filter_by(
            user_id=user_id,
            name=metric_name
        ).order_by(SpiritualMetric.timestamp.asc()).all()
        
        if not metrics:
            return {"message": "Nenhuma métrica encontrada"}
        
        values = [m.value for m in metrics]
        
        stats = {
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "mean": statistics.mean(values),
            "median": statistics.median(values),
            "latest_value": values[-1],
            "first_value": values[0],
            "latest_timestamp": metrics[-1].timestamp.isoformat(),
            "first_timestamp": metrics[0].timestamp.isoformat()
        }
        
        if len(values) > 1:
            stats["std_dev"] = statistics.stdev(values)
            stats["variance"] = statistics.variance(values)
            
            # Calcular tendência
            if len(values) >= 3:
                recent_avg = statistics.mean(values[-3:])
                older_avg = statistics.mean(values[:3]) if len(values) >= 6 else statistics.mean(values[:-3])
                
                if recent_avg > older_avg * 1.1:
                    stats["trend"] = "increasing"
                elif recent_avg < older_avg * 0.9:
                    stats["trend"] = "decreasing"
                else:
                    stats["trend"] = "stable"
                
                stats["trend_percentage"] = ((recent_avg - older_avg) / older_avg) * 100
        
        return stats
        
    except Exception as e:
        return {"error": f"Erro ao calcular estatísticas: {str(e)}"}

def _calculate_detailed_statistics(user_id, metric_name, start_date, end_date):
    """Calcular estatísticas detalhadas para uma métrica"""
    try:
        query = SpiritualMetric.query.filter_by(
            user_id=user_id,
            name=metric_name
        )
        
        if start_date:
            query = query.filter(SpiritualMetric.timestamp >= start_date)
        if end_date:
            query = query.filter(SpiritualMetric.timestamp <= end_date)
        
        metrics = query.order_by(SpiritualMetric.timestamp.asc()).all()
        
        if not metrics:
            return {"message": "Nenhuma métrica encontrada para o período"}
        
        values = [m.value for m in metrics]
        
        # Estatísticas básicas
        stats = {
            "basic": {
                "count": len(values),
                "min": min(values),
                "max": max(values),
                "mean": statistics.mean(values),
                "median": statistics.median(values),
                "range": max(values) - min(values)
            }
        }
        
        if len(values) > 1:
            stats["advanced"] = {
                "std_dev": statistics.stdev(values),
                "variance": statistics.variance(values),
                "coefficient_variation": (statistics.stdev(values) / statistics.mean(values)) * 100
            }
            
            # Quartis
            sorted_values = sorted(values)
            n = len(sorted_values)
            stats["quartiles"] = {
                "q1": sorted_values[n//4],
                "q2": statistics.median(sorted_values),
                "q3": sorted_values[3*n//4]
            }
            
            # Análise de frequência
            value_counts = {}
            for v in values:
                rounded_v = round(v, 1)
                value_counts[rounded_v] = value_counts.get(rounded_v, 0) + 1
            
            most_common = max(value_counts.items(), key=lambda x: x[1])
            stats["frequency"] = {
                "most_common_value": most_common[0],
                "most_common_count": most_common[1],
                "unique_values": len(value_counts)
            }
        
        return stats
        
    except Exception as e:
        return {"error": f"Erro ao calcular estatísticas detalhadas: {str(e)}"}

def _calculate_general_statistics(user_id, start_date=None, end_date=None):
    """Calcular estatísticas gerais de todas as métricas"""
    try:
        query = SpiritualMetric.query.filter_by(user_id=user_id)
        
        if start_date:
            query = query.filter(SpiritualMetric.timestamp >= start_date)
        if end_date:
            query = query.filter(SpiritualMetric.timestamp <= end_date)
        
        metrics = query.all()
        
        if not metrics:
            return {"message": "Nenhuma métrica encontrada"}
        
        # Agrupar por nome da métrica
        by_metric = defaultdict(list)
        for m in metrics:
            by_metric[m.name].append(m.value)
        
        stats = {
            "overview": {
                "total_records": len(metrics),
                "unique_metrics": len(by_metric),
                "date_range": {
                    "start": min(m.timestamp for m in metrics).isoformat(),
                    "end": max(m.timestamp for m in metrics).isoformat()
                }
            },
            "by_metric": {}
        }
        
        for metric_name, values in by_metric.items():
            if values:
                metric_stats = {
                    "count": len(values),
                    "mean": statistics.mean(values),
                    "min": min(values),
                    "max": max(values),
                    "latest": values[-1] if values else None
                }
                
                if len(values) > 1:
                    metric_stats["std_dev"] = statistics.stdev(values)
                
                stats["by_metric"][metric_name] = metric_stats
        
        return stats
        
    except Exception as e:
        return {"error": f"Erro ao calcular estatísticas gerais: {str(e)}"}

def _group_metrics_by_period(metrics, group_by):
    """Agrupar métricas por período"""
    try:
        grouped = defaultdict(list)
        
        for metric in metrics:
            if group_by == 'day':
                key = metric.timestamp.strftime('%Y-%m-%d')
            elif group_by == 'week':
                # Primeira data da semana
                start_of_week = metric.timestamp - datetime.timedelta(days=metric.timestamp.weekday())
                key = start_of_week.strftime('%Y-%m-%d')
            elif group_by == 'month':
                key = metric.timestamp.strftime('%Y-%m')
            elif group_by == 'year':
                key = metric.timestamp.strftime('%Y')
            else:
                key = metric.timestamp.strftime('%Y-%m-%d')
            
            grouped[key].append(metric.value)
        
        # Calcular agregações para cada período
        aggregations = []
        for period, values in sorted(grouped.items()):
            agg = {
                "period": period,
                "count": len(values),
                "mean": statistics.mean(values),
                "min": min(values),
                "max": max(values),
                "sum": sum(values)
            }
            
            if len(values) > 1:
                agg["std_dev"] = statistics.stdev(values)
            
            aggregations.append(agg)
        
        return aggregations
        
    except Exception as e:
        return []

def _analyze_trend(metrics):
    """Analisar tendência dos dados"""
    try:
        if len(metrics) < 2:
            return {"trend": "insufficient_data"}
        
        values = [m.value for m in metrics]
        
        # Regressão linear simples
        n = len(values)
        x = list(range(n))
        
        # Calcular coeficientes
        x_mean = statistics.mean(x)
        y_mean = statistics.mean(values)
        
        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            slope = 0
        else:
            slope = numerator / denominator
        
        intercept = y_mean - slope * x_mean
        
        # Determinar tendência
        if abs(slope) < 0.01:
            trend = "stable"
        elif slope > 0:
            trend = "increasing"
        else:
            trend = "decreasing"
        
        # Calcular R²
        y_pred = [slope * i + intercept for i in x]
        ss_res = sum((values[i] - y_pred[i]) ** 2 for i in range(n))
        ss_tot = sum((values[i] - y_mean) ** 2 for i in range(n))
        
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            "trend": trend,
            "slope": slope,
            "intercept": intercept,
            "r_squared": r_squared,
            "confidence": "high" if r_squared > 0.7 else "medium" if r_squared > 0.3 else "low",
            "data_points": n
        }
        
    except Exception as e:
        return {"error": f"Erro na análise de tendência: {str(e)}"}

def _export_to_csv(export_data, username):
    """Exportar dados para CSV"""
    try:
        import csv
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalho
        writer.writerow([
            'ID', 'Nome', 'Nome Exibição', 'Valor', 'Unidade', 
            'Categoria', 'Data/Hora', 'Notas'
        ])
        
        # Dados
        for metric in export_data['metrics']:
            writer.writerow([
                metric['id'],
                metric['name'],
                metric['display_name'],
                metric['value'],
                metric['unit'],
                metric['category'],
                metric['timestamp'],
                metric['notes']
            ])
        
        temp_file.close()
        
        filename = f"ilyra_metricas_{username}_{datetime.datetime.now().strftime('%Y%m%d')}.csv"
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype="text/csv"
        )
        
    except Exception as e:
        raise Exception(f"Erro ao exportar CSV: {str(e)}")

def _export_to_excel(export_data, username):
    """Exportar dados para Excel"""
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        temp_path = temp_file.name
        temp_file.close()
        
        # Criar DataFrame
        df_data = []
        for metric in export_data['metrics']:
            df_data.append({
                'ID': metric['id'],
                'Nome': metric['name'],
                'Nome Exibição': metric['display_name'],
                'Valor': metric['value'],
                'Unidade': metric['unit'],
                'Categoria': metric['category'],
                'Data/Hora': metric['timestamp'],
                'Notas': metric['notes']
            })
        
        df = pd.DataFrame(df_data)
        
        # Salvar Excel
        with pd.ExcelWriter(temp_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Métricas', index=False)
            
            # Adicionar estatísticas se disponível
            if 'statistics' in export_data:
                stats_data = []
                for metric_name, stats in export_data['statistics'].get('by_metric', {}).items():
                    stats_data.append({
                        'Métrica': metric_name,
                        'Contagem': stats.get('count', 0),
                        'Média': stats.get('mean', 0),
                        'Mínimo': stats.get('min', 0),
                        'Máximo': stats.get('max', 0),
                        'Último Valor': stats.get('latest', 0)
                    })
                
                if stats_data:
                    stats_df = pd.DataFrame(stats_data)
                    stats_df.to_excel(writer, sheet_name='Estatísticas', index=False)
        
        filename = f"ilyra_metricas_{username}_{datetime.datetime.now().strftime('%Y%m%d')}.xlsx"
        
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
    except Exception as e:
        raise Exception(f"Erro ao exportar Excel: {str(e)}")
