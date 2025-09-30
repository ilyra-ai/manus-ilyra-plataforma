import google.generativeai as genai
from datetime import datetime, timedelta
import json
import os
from models import SpiritualMetric, User, AIConversation, Gamification, db
from sqlalchemy import func, desc
import random

class AIInsightsGenerator:
    """Gerador de insights e recomendações personalizadas usando IA"""
    
    def __init__(self):
        # Configurar API do Gemini
        genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Base de conhecimento espiritual
        self.spiritual_knowledge = {
            'chakras': {
                'Muladhara': 'Chakra Raiz - Segurança, estabilidade, conexão com a Terra',
                'Svadhisthana': 'Chakra Sacral - Criatividade, sexualidade, emoções',
                'Manipura': 'Chakra Plexo Solar - Poder pessoal, autoestima, vontade',
                'Anahata': 'Chakra Coração - Amor, compaixão, conexão',
                'Vishuddha': 'Chakra Laríngeo - Comunicação, verdade, expressão',
                'Ajna': 'Chakra Terceiro Olho - Intuição, sabedoria, clarividência',
                'Sahasrara': 'Chakra Coronário - Espiritualidade, conexão divina'
            },
            'elementos': {
                'Terra': 'Estabilidade, praticidade, materialização',
                'Água': 'Emoções, intuição, fluidez',
                'Fogo': 'Paixão, transformação, energia',
                'Ar': 'Comunicação, pensamento, liberdade',
                'Éter': 'Espiritualidade, transcendência, conexão cósmica'
            },
            'fases_lunares': {
                'Nova': 'Novos começos, intenções, plantio de sementes',
                'Crescente': 'Crescimento, ação, manifestação',
                'Cheia': 'Plenitude, realização, celebração',
                'Minguante': 'Liberação, limpeza, perdão'
            }
        }
    
    def generate_daily_insights(self, user_id):
        """Gerar insights diários personalizados"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {"error": "Usuário não encontrado"}
            
            # Obter dados do usuário
            user_profile = self.get_user_spiritual_profile(user_id)
            recent_metrics = self.get_recent_metrics(user_id, days=7)
            current_challenges = self.identify_current_challenges(user_id)
            
            # Prompt para insights diários
            prompt = f"""
            Como um guia espiritual experiente, gere insights diários personalizados para {user.username}.
            
            Perfil Espiritual:
            {json.dumps(user_profile, indent=2, ensure_ascii=False)}
            
            Métricas Recentes (7 dias):
            {json.dumps(recent_metrics, indent=2, ensure_ascii=False)}
            
            Desafios Atuais:
            {json.dumps(current_challenges, indent=2, ensure_ascii=False)}
            
            Gere insights que incluam:
            1. Reflexão sobre o momento espiritual atual
            2. Orientação para o dia
            3. Prática espiritual recomendada
            4. Afirmação ou mantra
            5. Área de foco para crescimento
            
            Seja inspirador, prático e acolhedor. Responda em português brasileiro.
            """
            
            response = self.model.generate_content(prompt)
            
            insights = {
                "daily_insight": response.text,
                "generated_at": datetime.now().isoformat(),
                "user_profile": user_profile,
                "focus_areas": current_challenges,
                "recommended_practices": self.get_recommended_practices(user_profile)
            }
            
            # Salvar insights no histórico
            self.save_insights_to_history(user_id, insights)
            
            return insights
            
        except Exception as e:
            return {
                "error": f"Erro ao gerar insights: {str(e)}",
                "fallback_insight": self.generate_fallback_daily_insight()
            }
    
    def get_user_spiritual_profile(self, user_id):
        """Criar perfil espiritual do usuário baseado em suas métricas"""
        try:
            # Obter métricas mais recentes de cada tipo
            latest_metrics = db.session.query(
                SpiritualMetric.name,
                func.max(SpiritualMetric.value).label('latest_value'),
                func.avg(SpiritualMetric.value).label('avg_value'),
                func.count(SpiritualMetric.id).label('frequency')
            ).filter(
                SpiritualMetric.user_id == user_id,
                SpiritualMetric.created_at >= datetime.now() - timedelta(days=30)
            ).group_by(SpiritualMetric.name).all()
            
            # Obter dados de gamificação
            gamification = Gamification.query.filter_by(user_id=user_id).first()
            
            profile = {
                "spiritual_level": gamification.level if gamification else 1,
                "total_points": gamification.points if gamification else 0,
                "active_metrics": len(latest_metrics),
                "strongest_areas": [],
                "growth_areas": [],
                "practice_frequency": "regular" if len(latest_metrics) > 5 else "beginner"
            }
            
            # Identificar áreas fortes e de crescimento
            for metric in latest_metrics:
                if metric.latest_value >= 8:  # Valores altos (8-10)
                    profile["strongest_areas"].append(metric.name)
                elif metric.latest_value <= 4:  # Valores baixos (1-4)
                    profile["growth_areas"].append(metric.name)
            
            return profile
            
        except Exception as e:
            return {"error": f"Erro ao criar perfil: {str(e)}"}
    
    def get_recent_metrics(self, user_id, days=7):
        """Obter métricas recentes do usuário"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            metrics = SpiritualMetric.query.filter(
                SpiritualMetric.user_id == user_id,
                SpiritualMetric.created_at >= start_date
            ).order_by(desc(SpiritualMetric.created_at)).all()
            
            return [{
                "name": m.name,
                "value": m.value,
                "date": m.created_at.isoformat(),
                "description": m.description
            } for m in metrics]
            
        except Exception as e:
            return []
    
    def identify_current_challenges(self, user_id):
        """Identificar desafios atuais baseados nas métricas"""
        try:
            # Buscar métricas com valores baixos ou em declínio
            recent_metrics = self.get_recent_metrics(user_id, days=14)
            
            challenges = []
            metric_groups = {}
            
            # Agrupar por nome da métrica
            for metric in recent_metrics:
                if metric['name'] not in metric_groups:
                    metric_groups[metric['name']] = []
                metric_groups[metric['name']].append(metric['value'])
            
            # Identificar problemas
            for metric_name, values in metric_groups.items():
                if not values:
                    continue
                
                avg_value = sum(values) / len(values)
                latest_value = values[0] if values else 0
                
                # Valores consistentemente baixos
                if avg_value < 5:
                    challenges.append({
                        "type": "low_performance",
                        "metric": metric_name,
                        "description": f"{metric_name} com valores baixos (média: {avg_value:.1f})"
                    })
                
                # Declínio recente
                if len(values) >= 3:
                    trend = (values[0] - values[-1]) / len(values)
                    if trend < -1:
                        challenges.append({
                            "type": "declining_trend",
                            "metric": metric_name,
                            "description": f"{metric_name} em declínio recente"
                        })
            
            return challenges[:5]  # Limitar a 5 desafios principais
            
        except Exception as e:
            return []
    
    def get_recommended_practices(self, user_profile):
        """Obter práticas recomendadas baseadas no perfil"""
        practices = {
            "beginner": [
                "Meditação de 5-10 minutos diários",
                "Respiração consciente",
                "Gratidão diária",
                "Caminhada na natureza",
                "Journaling espiritual"
            ],
            "intermediate": [
                "Meditação de 15-20 minutos",
                "Trabalho com chakras",
                "Visualizações criativas",
                "Práticas de perdão",
                "Estudo de textos espirituais"
            ],
            "advanced": [
                "Meditação prolongada (30+ minutos)",
                "Canalização e comunicação espiritual",
                "Trabalho energético avançado",
                "Práticas xamânicas",
                "Ensino e mentoria espiritual"
            ]
        }
        
        level = user_profile.get("practice_frequency", "beginner")
        if user_profile.get("spiritual_level", 1) > 20:
            level = "advanced"
        elif user_profile.get("spiritual_level", 1) > 10:
            level = "intermediate"
        
        return practices.get(level, practices["beginner"])
    
    def generate_weekly_recommendations(self, user_id):
        """Gerar recomendações semanais personalizadas"""
        try:
            user = User.query.get(user_id)
            user_profile = self.get_user_spiritual_profile(user_id)
            weekly_metrics = self.get_recent_metrics(user_id, days=7)
            
            prompt = f"""
            Como um mentor espiritual, crie um plano semanal personalizado para {user.username}.
            
            Perfil: {json.dumps(user_profile, indent=2, ensure_ascii=False)}
            Atividade da Semana: {json.dumps(weekly_metrics, indent=2, ensure_ascii=False)}
            
            Crie recomendações para os próximos 7 dias incluindo:
            1. Tema da semana para foco espiritual
            2. Práticas diárias específicas
            3. Desafio semanal de crescimento
            4. Reflexões para journaling
            5. Metas mensuráveis
            
            Seja específico, prático e inspirador. Responda em português brasileiro.
            """
            
            response = self.model.generate_content(prompt)
            
            return {
                "weekly_plan": response.text,
                "generated_at": datetime.now().isoformat(),
                "focus_theme": self.extract_weekly_theme(response.text),
                "daily_practices": self.extract_daily_practices(response.text)
            }
            
        except Exception as e:
            return {"error": f"Erro ao gerar recomendações semanais: {str(e)}"}
    
    def generate_personalized_affirmations(self, user_id, count=5):
        """Gerar afirmações personalizadas"""
        try:
            user_profile = self.get_user_spiritual_profile(user_id)
            challenges = self.identify_current_challenges(user_id)
            
            prompt = f"""
            Crie {count} afirmações poderosas e personalizadas baseadas no perfil:
            
            Perfil: {json.dumps(user_profile, indent=2, ensure_ascii=False)}
            Desafios: {json.dumps(challenges, indent=2, ensure_ascii=False)}
            
            As afirmações devem:
            - Ser positivas e no presente
            - Abordar áreas de crescimento específicas
            - Ser inspiradoras e empoderadoras
            - Usar linguagem acolhedora
            
            Formate como uma lista numerada em português brasileiro.
            """
            
            response = self.model.generate_content(prompt)
            affirmations = self.extract_affirmations(response.text)
            
            return {
                "affirmations": affirmations,
                "generated_at": datetime.now().isoformat(),
                "personalized_for": user_profile
            }
            
        except Exception as e:
            return {"error": f"Erro ao gerar afirmações: {str(e)}"}
    
    def extract_weekly_theme(self, text):
        """Extrair tema da semana do texto"""
        lines = text.split('\n')
        for line in lines:
            if 'tema' in line.lower() and ('semana' in line.lower() or 'foco' in line.lower()):
                return line.strip()
        return "Crescimento e Autoconhecimento"
    
    def extract_daily_practices(self, text):
        """Extrair práticas diárias do texto"""
        practices = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith(('•', '-', '*')) and ('prática' in line.lower() or 'exercício' in line.lower()):
                clean_line = line.lstrip('•-* ').strip()
                practices.append(clean_line)
        
        return practices[:7]  # Uma para cada dia da semana
    
    def extract_affirmations(self, text):
        """Extrair afirmações do texto"""
        affirmations = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line and (line.startswith(('1.', '2.', '3.', '4.', '5.')) or 
                        line.startswith(('•', '-', '*')) or
                        ('eu sou' in line.lower() or 'eu tenho' in line.lower() or 'eu mereço' in line.lower())):
                clean_line = line.lstrip('•-*123456789. ').strip()
                if clean_line and len(clean_line) > 10:  # Filtrar linhas muito curtas
                    affirmations.append(clean_line)
        
        return affirmations[:5]  # Limitar a 5 afirmações
    
    def generate_fallback_daily_insight(self):
        """Gerar insight básico em caso de erro"""
        fallback_insights = [
            "Hoje é um dia perfeito para conectar-se com sua essência interior. Dedique alguns minutos à respiração consciente.",
            "A jornada espiritual é feita de pequenos passos diários. Celebre cada momento de presença e consciência.",
            "Sua alma está em constante evolução. Confie no processo e permita-se crescer com amor e paciência.",
            "O universo conspira a seu favor. Mantenha-se aberto aos sinais e sincronicidades ao seu redor.",
            "Cada desafio é uma oportunidade de crescimento. Abrace as lições com gratidão e sabedoria."
        ]
        
        return random.choice(fallback_insights)
    
    def save_insights_to_history(self, user_id, insights):
        """Salvar insights no histórico"""
        try:
            conversation = AIConversation(
                user_id=user_id,
                user_message="Insights diários personalizados",
                ai_response=insights["daily_insight"],
                context=json.dumps(insights),
                created_at=datetime.now()
            )
            
            db.session.add(conversation)
            db.session.commit()
            
        except Exception as e:
            print(f"Erro ao salvar insights: {e}")

# Funções para integração com as rotas da API
def get_daily_insights(user_id):
    """Função principal para insights diários"""
    generator = AIInsightsGenerator()
    return generator.generate_daily_insights(user_id)

def get_weekly_recommendations(user_id):
    """Função para recomendações semanais"""
    generator = AIInsightsGenerator()
    return generator.generate_weekly_recommendations(user_id)

def get_personalized_affirmations(user_id, count=5):
    """Função para afirmações personalizadas"""
    generator = AIInsightsGenerator()
    return generator.generate_personalized_affirmations(user_id, count)
