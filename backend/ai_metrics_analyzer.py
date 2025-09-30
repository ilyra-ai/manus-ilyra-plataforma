import google.generativeai as genai
from datetime import datetime, timedelta
import json
import os
from models import SpiritualMetric, User, AIConversation, db
from sqlalchemy import func, desc

class AIMetricsAnalyzer:
    """Analisador de métricas espirituais usando IA"""
    
    def __init__(self):
        # Configurar API do Gemini
        genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Contexto especializado em espiritualidade
        self.spiritual_context = """
        Você é um especialista em espiritualidade e desenvolvimento pessoal com conhecimento profundo em:
        - Meditação e práticas contemplativas
        - Chakras e energia vital
        - Consciência e evolução espiritual
        - Numerologia e astrologia
        - Vidas passadas e regressão
        - Proteção energética
        - Intuição e clarividência
        - Conexão com guias espirituais
        - Frequências vibracionais
        - Propósito de vida e missão da alma
        
        Analise as métricas espirituais fornecidas e ofereça insights profundos, 
        orientações práticas e recomendações personalizadas para o crescimento espiritual.
        """
    
    def get_user_metrics_summary(self, user_id, days=30):
        """Obter resumo das métricas do usuário"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Buscar métricas do período
        metrics = SpiritualMetric.query.filter(
            SpiritualMetric.user_id == user_id,
            SpiritualMetric.created_at >= start_date
        ).order_by(desc(SpiritualMetric.created_at)).all()
        
        if not metrics:
            return None
        
        # Organizar métricas por tipo
        metrics_by_type = {}
        for metric in metrics:
            if metric.name not in metrics_by_type:
                metrics_by_type[metric.name] = []
            metrics_by_type[metric.name].append({
                'value': metric.value,
                'date': metric.created_at.isoformat(),
                'description': metric.description
            })
        
        # Calcular estatísticas
        summary = {
            'period': f'{days} dias',
            'total_entries': len(metrics),
            'metrics_tracked': len(metrics_by_type),
            'metrics_data': {}
        }
        
        for metric_name, values in metrics_by_type.items():
            metric_values = [v['value'] for v in values]
            summary['metrics_data'][metric_name] = {
                'current_value': metric_values[0] if metric_values else 0,
                'average': sum(metric_values) / len(metric_values),
                'min_value': min(metric_values),
                'max_value': max(metric_values),
                'trend': self.calculate_trend(metric_values),
                'entries_count': len(values),
                'recent_entries': values[:5]  # 5 mais recentes
            }
        
        return summary
    
    def calculate_trend(self, values):
        """Calcular tendência dos valores"""
        if len(values) < 2:
            return 'stable'
        
        # Comparar primeira metade com segunda metade
        mid = len(values) // 2
        first_half_avg = sum(values[:mid]) / mid if mid > 0 else 0
        second_half_avg = sum(values[mid:]) / (len(values) - mid)
        
        diff_percentage = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
        
        if diff_percentage > 10:
            return 'increasing'
        elif diff_percentage < -10:
            return 'decreasing'
        else:
            return 'stable'
    
    def analyze_metrics_with_ai(self, user_id, specific_question=None):
        """Analisar métricas usando IA"""
        try:
            # Obter dados do usuário
            user = User.query.get(user_id)
            if not user:
                return {"error": "Usuário não encontrado"}
            
            # Obter resumo das métricas
            metrics_summary = self.get_user_metrics_summary(user_id)
            if not metrics_summary:
                return {
                    "analysis": "Ainda não há métricas suficientes para análise. Comece registrando suas práticas espirituais diárias para receber insights personalizados.",
                    "recommendations": [
                        "Registre sua prática de meditação diária",
                        "Avalie seu nível de energia vital",
                        "Monitore o equilíbrio dos seus chakras",
                        "Anote suas experiências espirituais"
                    ]
                }
            
            # Preparar prompt para a IA
            prompt = f"""
            {self.spiritual_context}
            
            Analise as seguintes métricas espirituais do usuário {user.username}:
            
            {json.dumps(metrics_summary, indent=2, ensure_ascii=False)}
            
            {"Pergunta específica: " + specific_question if specific_question else ""}
            
            Forneça uma análise detalhada incluindo:
            1. Interpretação dos padrões e tendências
            2. Pontos fortes identificados
            3. Áreas que precisam de atenção
            4. Recomendações práticas específicas
            5. Exercícios ou práticas sugeridas
            6. Insights sobre o progresso espiritual
            
            Responda em português brasileiro de forma acolhedora e inspiradora.
            """
            
            # Gerar análise com IA
            response = self.model.generate_content(prompt)
            
            # Processar resposta
            analysis_text = response.text
            
            # Extrair recomendações (buscar por listas numeradas ou com marcadores)
            recommendations = self.extract_recommendations(analysis_text)
            
            # Salvar análise no histórico
            self.save_analysis_to_history(user_id, analysis_text, metrics_summary)
            
            return {
                "analysis": analysis_text,
                "recommendations": recommendations,
                "metrics_summary": metrics_summary,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "error": f"Erro ao analisar métricas: {str(e)}",
                "fallback_analysis": self.generate_fallback_analysis(metrics_summary)
            }
    
    def extract_recommendations(self, text):
        """Extrair recomendações do texto da análise"""
        recommendations = []
        lines = text.split('\n')
        
        in_recommendations = False
        for line in lines:
            line = line.strip()
            
            # Detectar início da seção de recomendações
            if any(keyword in line.lower() for keyword in ['recomendações', 'sugestões', 'práticas', 'exercícios']):
                in_recommendations = True
                continue
            
            # Extrair itens de lista
            if in_recommendations and line:
                if line.startswith(('•', '-', '*', '1.', '2.', '3.', '4.', '5.')):
                    # Limpar marcadores
                    clean_line = line.lstrip('•-*123456789. ').strip()
                    if clean_line:
                        recommendations.append(clean_line)
                elif line.startswith(('##', '**', 'Conclusão', 'Em resumo')):
                    # Parar se chegou em nova seção
                    break
        
        return recommendations[:10]  # Limitar a 10 recomendações
    
    def generate_fallback_analysis(self, metrics_summary):
        """Gerar análise básica sem IA em caso de erro"""
        if not metrics_summary:
            return "Não há dados suficientes para análise."
        
        analysis = "Análise básica das suas métricas espirituais:\n\n"
        
        for metric_name, data in metrics_summary['metrics_data'].items():
            trend_text = {
                'increasing': 'em crescimento',
                'decreasing': 'em declínio',
                'stable': 'estável'
            }.get(data['trend'], 'estável')
            
            analysis += f"• {metric_name}: Valor atual {data['current_value']}, tendência {trend_text}\n"
        
        analysis += "\nContinue registrando suas práticas para insights mais detalhados."
        
        return analysis
    
    def save_analysis_to_history(self, user_id, analysis, metrics_data):
        """Salvar análise no histórico de conversas"""
        try:
            conversation = AIConversation(
                user_id=user_id,
                user_message="Análise das minhas métricas espirituais",
                ai_response=analysis,
                context=json.dumps(metrics_data),
                created_at=datetime.now()
            )
            
            db.session.add(conversation)
            db.session.commit()
            
        except Exception as e:
            print(f"Erro ao salvar análise no histórico: {e}")
    
    def generate_insights_for_metric(self, metric_name, user_id):
        """Gerar insights específicos para uma métrica"""
        try:
            # Buscar dados históricos da métrica
            metrics = SpiritualMetric.query.filter(
                SpiritualMetric.user_id == user_id,
                SpiritualMetric.name == metric_name
            ).order_by(desc(SpiritualMetric.created_at)).limit(30).all()
            
            if not metrics:
                return {"error": f"Nenhum dado encontrado para a métrica {metric_name}"}
            
            # Preparar dados para análise
            metric_data = {
                'name': metric_name,
                'values': [{'value': m.value, 'date': m.created_at.isoformat(), 'description': m.description} for m in metrics],
                'current_value': metrics[0].value,
                'trend': self.calculate_trend([m.value for m in metrics])
            }
            
            # Prompt específico para a métrica
            prompt = f"""
            {self.spiritual_context}
            
            Analise especificamente a métrica espiritual "{metric_name}" com os seguintes dados:
            
            {json.dumps(metric_data, indent=2, ensure_ascii=False)}
            
            Forneça insights específicos sobre:
            1. O que essa métrica representa espiritualmente
            2. Interpretação dos valores e tendências
            3. Como melhorar essa área específica
            4. Práticas recomendadas
            5. Sinais de progresso a observar
            
            Responda em português brasileiro de forma prática e inspiradora.
            """
            
            response = self.model.generate_content(prompt)
            
            return {
                "metric_name": metric_name,
                "insights": response.text,
                "current_value": metric_data['current_value'],
                "trend": metric_data['trend'],
                "data_points": len(metrics)
            }
            
        except Exception as e:
            return {"error": f"Erro ao gerar insights para {metric_name}: {str(e)}"}
    
    def suggest_new_metrics(self, user_id):
        """Sugerir novas métricas baseadas no perfil do usuário"""
        try:
            # Obter métricas já rastreadas
            existing_metrics = db.session.query(SpiritualMetric.name).filter(
                SpiritualMetric.user_id == user_id
            ).distinct().all()
            
            existing_names = [m[0] for m in existing_metrics]
            
            # Lista de métricas disponíveis
            all_metrics = [
                "Meditação Diária", "Nível de Consciência", "Energia Vital",
                "Idade da Alma", "Ativação Starseed", "Memórias de Vidas Passadas",
                "Equilíbrio dos Chakras", "Proteção Energética", "Intuição e Clarividência",
                "Conexão com Guias", "Frequência Vibracional", "Propósito de Vida",
                "Gratidão Diária", "Compaixão", "Perdão", "Amor Próprio",
                "Conexão com a Natureza", "Práticas de Cura", "Sonhos Lúcidos",
                "Manifestação", "Sincronicidades", "Equilíbrio Emocional"
            ]
            
            # Sugerir métricas não rastreadas
            suggested = [m for m in all_metrics if m not in existing_names]
            
            return {
                "suggested_metrics": suggested[:10],  # Top 10 sugestões
                "currently_tracking": existing_names,
                "total_available": len(all_metrics)
            }
            
        except Exception as e:
            return {"error": f"Erro ao sugerir métricas: {str(e)}"}

# Função para integrar com as rotas da API
def analyze_user_metrics(user_id, question=None):
    """Função principal para análise de métricas"""
    analyzer = AIMetricsAnalyzer()
    return analyzer.analyze_metrics_with_ai(user_id, question)

def get_metric_insights(metric_name, user_id):
    """Função para insights de métrica específica"""
    analyzer = AIMetricsAnalyzer()
    return analyzer.generate_insights_for_metric(metric_name, user_id)

def get_metric_suggestions(user_id):
    """Função para sugestões de novas métricas"""
    analyzer = AIMetricsAnalyzer()
    return analyzer.suggest_new_metrics(user_id)
