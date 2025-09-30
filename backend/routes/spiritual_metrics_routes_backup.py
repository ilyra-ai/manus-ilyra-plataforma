from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, SpiritualMetric, User
import datetime
import json

spiritual_metrics_bp = Blueprint("spiritual_metrics", __name__, url_prefix="/api/spiritual-metrics")

# ==================== MÉTRICAS ESPIRITUAIS COMPLETAS ====================

SPIRITUAL_METRICS = {
    # Métricas Básicas (12 principais)
    'meditation_daily': {
        'name': 'Meditação Diária',
        'description': 'Tempo diário dedicado à meditação',
        'unit': 'minutos',
        'min_value': 0,
        'max_value': 480,
        'category': 'basic'
    },
    'consciousness_level': {
        'name': 'Nível de Consciência',
        'description': 'Nível atual de consciência espiritual',
        'unit': 'escala 1-100',
        'min_value': 1,
        'max_value': 100,
        'category': 'basic'
    },
    'vital_energy': {
        'name': 'Energia Vital',
        'description': 'Nível de energia vital/chi',
        'unit': 'escala 1-100',
        'min_value': 1,
        'max_value': 100,
        'category': 'basic'
    },
    'soul_age': {
        'name': 'Idade da Alma',
        'description': 'Maturidade espiritual da alma',
        'unit': 'escala 1-7',
        'min_value': 1,
        'max_value': 7,
        'category': 'basic'
    },
    'starseed_activation': {
        'name': 'Ativação Starseed',
        'description': 'Nível de ativação das características starseed',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'basic'
    },
    'past_life_memories': {
        'name': 'Memórias de Vidas Passadas',
        'description': 'Clareza das memórias de vidas passadas',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic'
    },
    'chakra_balance': {
        'name': 'Equilíbrio dos Chakras',
        'description': 'Equilíbrio geral dos 7 chakras principais',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'basic'
    },
    'energy_protection': {
        'name': 'Proteção Energética',
        'description': 'Nível de proteção contra energias negativas',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic'
    },
    'intuition_clairvoyance': {
        'name': 'Intuição e Clarividência',
        'description': 'Desenvolvimento da intuição e clarividência',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic'
    },
    'spirit_guides_connection': {
        'name': 'Conexão com Guias',
        'description': 'Qualidade da conexão com guias espirituais',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'basic'
    },
    'vibrational_frequency': {
        'name': 'Frequência Vibracional',
        'description': 'Frequência vibracional atual',
        'unit': 'Hz',
        'min_value': 20,
        'max_value': 1000,
        'category': 'basic'
    },
    'life_purpose': {
        'name': 'Propósito de Vida',
        'description': 'Clareza sobre o propósito de vida',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'basic'
    },
    
    # Métricas Avançadas (40+ adicionais)
    'astral_projection': {
        'name': 'Projeção Astral',
        'description': 'Habilidade de projeção astral',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'lucid_dreaming': {
        'name': 'Sonho Lúcido',
        'description': 'Frequência e controle de sonhos lúcidos',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'telepathy': {
        'name': 'Telepatia',
        'description': 'Habilidades telepáticas',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'psychometry': {
        'name': 'Psicometria',
        'description': 'Habilidade de ler objetos',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'aura_reading': {
        'name': 'Leitura de Aura',
        'description': 'Capacidade de ver e interpretar auras',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'energy_healing': {
        'name': 'Cura Energética',
        'description': 'Habilidades de cura energética',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'channeling': {
        'name': 'Canalização',
        'description': 'Habilidade de canalizar entidades',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'akashic_records': {
        'name': 'Registros Akáshicos',
        'description': 'Acesso aos registros akáshicos',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'crystal_healing': {
        'name': 'Cura com Cristais',
        'description': 'Conhecimento e uso de cristais',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'tarot_reading': {
        'name': 'Leitura de Tarô',
        'description': 'Habilidade com cartas de tarô',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'numerology': {
        'name': 'Numerologia',
        'description': 'Conhecimento numerológico',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'astrology': {
        'name': 'Astrologia',
        'description': 'Conhecimento astrológico',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'reiki_level': {
        'name': 'Nível Reiki',
        'description': 'Nível de iniciação em Reiki',
        'unit': 'nível 0-4',
        'min_value': 0,
        'max_value': 4,
        'category': 'advanced'
    },
    'kundalini_awakening': {
        'name': 'Despertar Kundalini',
        'description': 'Nível de despertar da kundalini',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'third_eye_opening': {
        'name': 'Abertura do Terceiro Olho',
        'description': 'Grau de abertura do terceiro olho',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'merkaba_activation': {
        'name': 'Ativação Merkaba',
        'description': 'Nível de ativação do merkaba',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'light_body_activation': {
        'name': 'Ativação Corpo de Luz',
        'description': 'Ativação do corpo de luz',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'dna_activation': {
        'name': 'Ativação DNA',
        'description': 'Ativação de fitas de DNA adicionais',
        'unit': 'número de fitas',
        'min_value': 2,
        'max_value': 12,
        'category': 'advanced'
    },
    'ascension_symptoms': {
        'name': 'Sintomas de Ascensão',
        'description': 'Intensidade dos sintomas de ascensão',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'galactic_connection': {
        'name': 'Conexão Galáctica',
        'description': 'Conexão com civilizações galácticas',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'earth_connection': {
        'name': 'Conexão com a Terra',
        'description': 'Conexão com a energia da Terra',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'animal_communication': {
        'name': 'Comunicação Animal',
        'description': 'Habilidade de comunicação com animais',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'plant_communication': {
        'name': 'Comunicação Vegetal',
        'description': 'Habilidade de comunicação com plantas',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'elemental_connection': {
        'name': 'Conexão Elemental',
        'description': 'Conexão com elementais',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'shadow_work': {
        'name': 'Trabalho de Sombra',
        'description': 'Progresso no trabalho de sombra',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'inner_child_healing': {
        'name': 'Cura da Criança Interior',
        'description': 'Progresso na cura da criança interior',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'karmic_clearing': {
        'name': 'Limpeza Kármica',
        'description': 'Progresso na limpeza kármica',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'soul_retrieval': {
        'name': 'Recuperação da Alma',
        'description': 'Progresso na recuperação de fragmentos da alma',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'cord_cutting': {
        'name': 'Corte de Cordões',
        'description': 'Efetividade no corte de cordões energéticos',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'entity_clearing': {
        'name': 'Limpeza de Entidades',
        'description': 'Habilidade de limpeza de entidades',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'psychic_protection': {
        'name': 'Proteção Psíquica',
        'description': 'Nível de proteção psíquica',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'manifestation_power': {
        'name': 'Poder de Manifestação',
        'description': 'Habilidade de manifestação',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'law_of_attraction': {
        'name': 'Lei da Atração',
        'description': 'Domínio da lei da atração',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'quantum_healing': {
        'name': 'Cura Quântica',
        'description': 'Habilidades de cura quântica',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'timeline_healing': {
        'name': 'Cura de Linha Temporal',
        'description': 'Habilidade de cura de linhas temporais',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'multidimensional_awareness': {
        'name': 'Consciência Multidimensional',
        'description': 'Consciência de múltiplas dimensões',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'cosmic_consciousness': {
        'name': 'Consciência Cósmica',
        'description': 'Nível de consciência cósmica',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'unity_consciousness': {
        'name': 'Consciência de Unidade',
        'description': 'Experiência de consciência de unidade',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'christ_consciousness': {
        'name': 'Consciência Crística',
        'description': 'Nível de consciência crística',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'buddha_consciousness': {
        'name': 'Consciência Búdica',
        'description': 'Nível de consciência búdica',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'divine_feminine': {
        'name': 'Divino Feminino',
        'description': 'Integração do divino feminino',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'divine_masculine': {
        'name': 'Divino Masculino',
        'description': 'Integração do divino masculino',
        'unit': 'porcentagem',
        'min_value': 0,
        'max_value': 100,
        'category': 'advanced'
    },
    'twin_flame_connection': {
        'name': 'Conexão Chama Gêmea',
        'description': 'Qualidade da conexão com chama gêmea',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'soul_mate_recognition': {
        'name': 'Reconhecimento Alma Gêmea',
        'description': 'Habilidade de reconhecer almas gêmeas',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'sacred_geometry': {
        'name': 'Geometria Sagrada',
        'description': 'Compreensão da geometria sagrada',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'sound_healing': {
        'name': 'Cura Sonora',
        'description': 'Habilidades de cura através do som',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'color_therapy': {
        'name': 'Terapia das Cores',
        'description': 'Conhecimento de terapia das cores',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    },
    'breathwork_mastery': {
        'name': 'Domínio da Respiração',
        'description': 'Domínio de técnicas respiratórias',
        'unit': 'escala 1-10',
        'min_value': 1,
        'max_value': 10,
        'category': 'advanced'
    }
}

@spiritual_metrics_bp.route("/metrics", methods=["POST"])
@jwt_required()
def create_spiritual_metric():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    name = data.get("name")
    value = data.get("value")

    if not name or value is None:
        return jsonify({"msg": "Missing name or value"}), 400

    # Validação da métrica
    if name not in SPIRITUAL_METRICS:
        return jsonify({"msg": f"Metric {name} not recognized"}), 400
    metric_info = SPIRITUAL_METRICS[name]
    if not (metric_info['min_value'] <= value <= metric_info['max_value']):
        return jsonify({"msg": f"Value {value} for {name} is out of range ({metric_info['min_value']}-{metric_info['max_value']})"}), 400

    new_metric = SpiritualMetric(user_id=current_user_id, name=name, value=value)
    db.session.add(new_metric)
    db.session.commit()
    return jsonify({"msg": "Spiritual metric created successfully", "id": new_metric.id}), 201

@spiritual_metrics_bp.route("/metrics", methods=["GET"])
@jwt_required()
def get_spiritual_metrics():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    metrics = SpiritualMetric.query.filter_by(user_id=current_user_id).order_by(SpiritualMetric.timestamp.desc()).all()
    output = []
    for metric in metrics:
        output.append({
            "id": metric.id,
            "name": metric.name,
            "value": metric.value,
            "timestamp": metric.timestamp.isoformat()
        })
    return jsonify(output), 200

@spiritual_metrics_bp.route("/metrics/<int:metric_id>", methods=["PUT"])
@jwt_required()
def update_spiritual_metric(metric_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    metric = SpiritualMetric.query.filter_by(id=metric_id, user_id=current_user_id).first()
    if not metric:
        return jsonify({"msg": "Metric not found or unauthorized"}), 404

    data = request.get_json()
    new_name = data.get("name", metric.name)
    new_value = data.get("value", metric.value)

    # Validação da métrica
    if new_name not in SPIRITUAL_METRICS:
        return jsonify({"msg": f"Metric {new_name} not recognized"}), 400
    metric_info = SPIRITUAL_METRICS[new_name]
    if not (metric_info['min_value'] <= new_value <= metric_info['max_value']):
        return jsonify({"msg": f"Value {new_value} for {new_name} is out of range ({metric_info['min_value']}-{metric_info['max_value']})"}), 400

    metric.name = new_name
    metric.value = new_value
    db.session.commit()
    return jsonify({"msg": "Spiritual metric updated successfully"}), 200

@spiritual_metrics_bp.route("/metrics/<int:metric_id>", methods=["DELETE"])
@jwt_required()
def delete_spiritual_metric(metric_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    metric = SpiritualMetric.query.filter_by(id=metric_id, user_id=current_user_id).first()
    if not metric:
        return jsonify({"msg": "Metric not found or unauthorized"}), 404

    db.session.delete(metric)
    db.session.commit()
    return jsonify({"msg": "Spiritual metric deleted successfully"}), 200

@spiritual_metrics_bp.route("/metrics/calculate", methods=["GET"])
@jwt_required()
def calculate_metrics():
    # Placeholder para sistema de cálculo automático
    return jsonify({"msg": "Sistema de cálculo automático de métricas não implementado."}), 501

@spiritual_metrics_bp.route("/metrics/history", methods=["GET"])
@jwt_required()
def get_metrics_history():
    # Placeholder para histórico de evolução
    return jsonify({"msg": "Histórico de evolução de métricas não implementado."}), 501

@spiritual_metrics_bp.route("/metrics/patterns", methods=["GET"])
@jwt_required()
def analyze_metrics_patterns():
    # Placeholder para análise de padrões
    return jsonify({"msg": "Análise de padrões de métricas não implementada."}), 501

@spiritual_metrics_bp.route("/metrics/reports", methods=["GET"])
@jwt_required()
def get_metrics_reports():
    # Placeholder para relatórios personalizados
    return jsonify({"msg": "Relatórios personalizados de métricas não implementados."}), 501

@spiritual_metrics_bp.route("/metrics/ai-insights", methods=["GET"])
@jwt_required()
def get_ai_insights_for_metrics():
    # Placeholder para integração com IA para insights
    return jsonify({"msg": "Integração com IA para insights de métricas não implementada."}), 501

