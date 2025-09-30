import google.generativeai as genai
from datetime import datetime, timedelta
import json
import os
from models import AIConversation, User, SpiritualMetric, db
from sqlalchemy import func, desc, text
import pickle
import numpy as np
from collections import defaultdict

class AITrainingSystem:
    """Sistema de treinamento contínuo para IA espiritual"""
    
    def __init__(self):
        # Configurar API do Gemini
        genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Base de conhecimento em constante evolução
        self.knowledge_base = {
            'conversation_patterns': {},
            'user_preferences': {},
            'effective_responses': {},
            'spiritual_insights': {},
            'personalization_rules': {}
        }
        
        # Métricas de performance
        self.performance_metrics = {
            'response_quality': 0.0,
            'user_satisfaction': 0.0,
            'conversation_depth': 0.0,
            'spiritual_relevance': 0.0,
            'personalization_score': 0.0
        }
    
    def analyze_conversation_patterns(self):
        """Analisar padrões nas conversas para melhorar respostas"""
        try:
            # Buscar conversas dos últimos 30 dias
            recent_conversations = AIConversation.query.filter(
                AIConversation.created_at >= datetime.now() - timedelta(days=30)
            ).all()
            
            patterns = {
                'common_topics': defaultdict(int),
                'question_types': defaultdict(int),
                'response_lengths': [],
                'user_engagement': defaultdict(list),
                'spiritual_themes': defaultdict(int)
            }
            
            for conv in recent_conversations:
                # Analisar tópicos comuns
                user_msg = conv.user_message.lower()
                
                # Identificar temas espirituais
                spiritual_keywords = {
                    'meditação': ['meditar', 'meditação', 'mindfulness'],
                    'chakras': ['chakra', 'energia', 'equilíbrio'],
                    'espiritualidade': ['espiritual', 'alma', 'consciência'],
                    'amor': ['amor', 'compaixão', 'coração'],
                    'propósito': ['propósito', 'missão', 'destino'],
                    'cura': ['cura', 'healing', 'terapia'],
                    'intuição': ['intuição', 'sexto sentido', 'clarividência']
                }
                
                for theme, keywords in spiritual_keywords.items():
                    if any(keyword in user_msg for keyword in keywords):
                        patterns['spiritual_themes'][theme] += 1
                
                # Analisar tipos de pergunta
                if '?' in conv.user_message:
                    if any(word in user_msg for word in ['como', 'what', 'how']):
                        patterns['question_types']['how_to'] += 1
                    elif any(word in user_msg for word in ['por que', 'why', 'porque']):
                        patterns['question_types']['why'] += 1
                    elif any(word in user_msg for word in ['quando', 'when']):
                        patterns['question_types']['when'] += 1
                
                # Analisar comprimento das respostas
                patterns['response_lengths'].append(len(conv.ai_response))
                
                # Analisar engajamento do usuário (conversas subsequentes)
                user_conversations = AIConversation.query.filter(
                    AIConversation.user_id == conv.user_id,
                    AIConversation.created_at > conv.created_at,
                    AIConversation.created_at <= conv.created_at + timedelta(hours=24)
                ).count()
                
                patterns['user_engagement'][conv.user_id].append(user_conversations)
            
            # Salvar padrões analisados
            self.knowledge_base['conversation_patterns'] = dict(patterns)
            self.save_knowledge_base()
            
            return patterns
            
        except Exception as e:
            print(f"Erro ao analisar padrões: {e}")
            return {}
    
    def learn_from_user_feedback(self, conversation_id, feedback_score, feedback_text=None):
        """Aprender com feedback do usuário"""
        try:
            conversation = AIConversation.query.get(conversation_id)
            if not conversation:
                return False
            
            # Registrar feedback
            feedback_data = {
                'conversation_id': conversation_id,
                'score': feedback_score,  # 1-5
                'feedback_text': feedback_text,
                'user_message': conversation.user_message,
                'ai_response': conversation.ai_response,
                'timestamp': datetime.now().isoformat()
            }
            
            # Analisar o que funcionou bem ou mal
            if feedback_score >= 4:  # Resposta positiva
                self.knowledge_base['effective_responses'][conversation.user_message] = {
                    'response': conversation.ai_response,
                    'score': feedback_score,
                    'context': conversation.context
                }
            elif feedback_score <= 2:  # Resposta negativa
                # Gerar resposta melhorada
                improved_response = self.generate_improved_response(
                    conversation.user_message, 
                    conversation.ai_response,
                    feedback_text
                )
                
                self.knowledge_base['effective_responses'][conversation.user_message] = {
                    'original_response': conversation.ai_response,
                    'improved_response': improved_response,
                    'feedback': feedback_text,
                    'score': feedback_score
                }
            
            self.save_knowledge_base()
            return True
            
        except Exception as e:
            print(f"Erro ao processar feedback: {e}")
            return False
    
    def generate_improved_response(self, user_message, original_response, feedback):
        """Gerar resposta melhorada baseada no feedback"""
        try:
            prompt = f"""
            Como um especialista em IA conversacional espiritual, melhore a resposta baseada no feedback:
            
            Pergunta do usuário: {user_message}
            Resposta original: {original_response}
            Feedback do usuário: {feedback}
            
            Gere uma resposta melhorada que:
            1. Aborde as preocupações do feedback
            2. Seja mais empática e acolhedora
            3. Ofereça insights espirituais mais profundos
            4. Seja mais prática e aplicável
            5. Mantenha o tom inspirador
            
            Responda em português brasileiro.
            """
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            print(f"Erro ao gerar resposta melhorada: {e}")
            return original_response
    
    def personalize_responses_for_user(self, user_id):
        """Personalizar respostas baseadas no histórico do usuário"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {}
            
            # Analisar histórico de conversas
            user_conversations = AIConversation.query.filter(
                AIConversation.user_id == user_id
            ).order_by(desc(AIConversation.created_at)).limit(50).all()
            
            # Analisar métricas espirituais
            user_metrics = SpiritualMetric.query.filter(
                SpiritualMetric.user_id == user_id
            ).order_by(desc(SpiritualMetric.created_at)).limit(20).all()
            
            personalization = {
                'communication_style': self.analyze_communication_style(user_conversations),
                'spiritual_interests': self.identify_spiritual_interests(user_conversations),
                'preferred_practices': self.identify_preferred_practices(user_metrics),
                'response_length_preference': self.analyze_response_preferences(user_conversations),
                'spiritual_level': self.estimate_spiritual_level(user_metrics, user_conversations)
            }
            
            # Salvar personalização
            self.knowledge_base['user_preferences'][user_id] = personalization
            self.save_knowledge_base()
            
            return personalization
            
        except Exception as e:
            print(f"Erro ao personalizar para usuário {user_id}: {e}")
            return {}
    
    def analyze_communication_style(self, conversations):
        """Analisar estilo de comunicação preferido do usuário"""
        if not conversations:
            return 'balanced'
        
        # Analisar características das mensagens
        formal_indicators = 0
        casual_indicators = 0
        emotional_indicators = 0
        
        for conv in conversations:
            msg = conv.user_message.lower()
            
            # Indicadores formais
            if any(word in msg for word in ['por favor', 'gostaria', 'poderia']):
                formal_indicators += 1
            
            # Indicadores casuais
            if any(word in msg for word in ['oi', 'olá', 'valeu', 'obrigado']):
                casual_indicators += 1
            
            # Indicadores emocionais
            if any(word in msg for word in ['sinto', 'emoção', 'coração', 'amor']):
                emotional_indicators += 1
        
        total = len(conversations)
        if formal_indicators / total > 0.6:
            return 'formal'
        elif casual_indicators / total > 0.6:
            return 'casual'
        elif emotional_indicators / total > 0.5:
            return 'emotional'
        else:
            return 'balanced'
    
    def identify_spiritual_interests(self, conversations):
        """Identificar interesses espirituais do usuário"""
        interests = defaultdict(int)
        
        spiritual_topics = {
            'meditação': ['meditar', 'meditação', 'mindfulness', 'respiração'],
            'chakras': ['chakra', 'energia', 'equilíbrio', 'aura'],
            'tarot': ['tarot', 'cartas', 'oráculo', 'adivinhação'],
            'astrologia': ['astrologia', 'signo', 'mapa astral', 'planetas'],
            'cristais': ['cristal', 'pedra', 'quartzo', 'ametista'],
            'reiki': ['reiki', 'energia', 'cura', 'imposição'],
            'yoga': ['yoga', 'asana', 'pranayama', 'namaste'],
            'espiritismo': ['espírito', 'mediunidade', 'psicografia', 'chico xavier']
        }
        
        for conv in conversations:
            msg = conv.user_message.lower()
            for topic, keywords in spiritual_topics.items():
                if any(keyword in msg for keyword in keywords):
                    interests[topic] += 1
        
        # Retornar top 3 interesses
        sorted_interests = sorted(interests.items(), key=lambda x: x[1], reverse=True)
        return [interest[0] for interest in sorted_interests[:3]]
    
    def identify_preferred_practices(self, metrics):
        """Identificar práticas espirituais preferidas baseadas nas métricas"""
        if not metrics:
            return []
        
        practice_frequency = defaultdict(int)
        
        for metric in metrics:
            practice_frequency[metric.name] += 1
        
        # Retornar práticas mais frequentes
        sorted_practices = sorted(practice_frequency.items(), key=lambda x: x[1], reverse=True)
        return [practice[0] for practice in sorted_practices[:5]]
    
    def analyze_response_preferences(self, conversations):
        """Analisar preferências de comprimento de resposta"""
        if not conversations:
            return 'medium'
        
        # Analisar se usuário faz perguntas de follow-up
        follow_up_rate = 0
        
        for i, conv in enumerate(conversations[:-1]):
            next_conv = conversations[i + 1]
            time_diff = (conv.created_at - next_conv.created_at).total_seconds()
            
            # Se próxima pergunta foi feita em menos de 1 hora
            if time_diff < 3600:
                follow_up_rate += 1
        
        follow_up_percentage = follow_up_rate / len(conversations) if conversations else 0
        
        # Se muitas perguntas de follow-up, usuário prefere respostas mais detalhadas
        if follow_up_percentage > 0.3:
            return 'detailed'
        elif follow_up_percentage < 0.1:
            return 'concise'
        else:
            return 'medium'
    
    def estimate_spiritual_level(self, metrics, conversations):
        """Estimar nível espiritual do usuário"""
        level_indicators = 0
        
        # Baseado na diversidade de métricas
        if metrics:
            unique_metrics = len(set(m.name for m in metrics))
            level_indicators += min(unique_metrics, 10)
        
        # Baseado na profundidade das conversas
        if conversations:
            complex_questions = sum(1 for conv in conversations 
                                  if len(conv.user_message.split()) > 10)
            level_indicators += min(complex_questions, 10)
        
        # Classificar nível
        if level_indicators >= 15:
            return 'advanced'
        elif level_indicators >= 8:
            return 'intermediate'
        else:
            return 'beginner'
    
    def train_contextual_understanding(self):
        """Treinar compreensão contextual baseada em conversas históricas"""
        try:
            # Buscar conversas com contexto rico
            conversations = AIConversation.query.filter(
                AIConversation.context.isnot(None),
                AIConversation.created_at >= datetime.now() - timedelta(days=60)
            ).all()
            
            context_patterns = {}
            
            for conv in conversations:
                try:
                    context_data = json.loads(conv.context) if conv.context else {}
                    
                    # Extrair padrões contextuais
                    if 'metrics_summary' in context_data:
                        metrics = context_data['metrics_summary']
                        
                        # Identificar correlações entre métricas e tipos de pergunta
                        question_type = self.classify_question_type(conv.user_message)
                        
                        if question_type not in context_patterns:
                            context_patterns[question_type] = {
                                'common_metrics': defaultdict(int),
                                'response_strategies': []
                            }
                        
                        # Registrar métricas comuns para este tipo de pergunta
                        for metric_name in metrics.get('metrics_data', {}):
                            context_patterns[question_type]['common_metrics'][metric_name] += 1
                        
                        # Registrar estratégias de resposta eficazes
                        context_patterns[question_type]['response_strategies'].append({
                            'response_length': len(conv.ai_response),
                            'includes_practical_advice': 'prática' in conv.ai_response.lower(),
                            'includes_spiritual_insight': any(word in conv.ai_response.lower() 
                                                            for word in ['alma', 'espírito', 'consciência'])
                        })
                
                except json.JSONDecodeError:
                    continue
            
            # Salvar padrões contextuais
            self.knowledge_base['contextual_patterns'] = context_patterns
            self.save_knowledge_base()
            
            return context_patterns
            
        except Exception as e:
            print(f"Erro no treinamento contextual: {e}")
            return {}
    
    def classify_question_type(self, question):
        """Classificar tipo de pergunta"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['como', 'how']):
            return 'how_to'
        elif any(word in question_lower for word in ['por que', 'why', 'porque']):
            return 'explanation'
        elif any(word in question_lower for word in ['quando', 'when']):
            return 'timing'
        elif any(word in question_lower for word in ['o que', 'what', 'que é']):
            return 'definition'
        elif '?' not in question:
            return 'statement'
        else:
            return 'general_question'
    
    def evaluate_model_performance(self):
        """Avaliar performance do modelo"""
        try:
            # Buscar conversas recentes com feedback
            recent_conversations = db.session.execute(text("""
                SELECT ac.*, uf.score, uf.feedback_text
                FROM ai_conversations ac
                LEFT JOIN user_feedback uf ON ac.id = uf.conversation_id
                WHERE ac.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            """)).fetchall()
            
            if not recent_conversations:
                return self.performance_metrics
            
            # Calcular métricas
            total_conversations = len(recent_conversations)
            feedback_conversations = [c for c in recent_conversations if c.score is not None]
            
            if feedback_conversations:
                avg_satisfaction = sum(c.score for c in feedback_conversations) / len(feedback_conversations)
                self.performance_metrics['user_satisfaction'] = avg_satisfaction / 5.0  # Normalizar para 0-1
            
            # Calcular outras métricas
            response_lengths = [len(c.ai_response) for c in recent_conversations]
            avg_response_length = sum(response_lengths) / len(response_lengths)
            
            # Métricas de qualidade baseadas em heurísticas
            quality_scores = []
            for conv in recent_conversations:
                score = self.calculate_response_quality_score(conv.user_message, conv.ai_response)
                quality_scores.append(score)
            
            self.performance_metrics['response_quality'] = sum(quality_scores) / len(quality_scores)
            self.performance_metrics['conversation_depth'] = min(avg_response_length / 500, 1.0)  # Normalizar
            
            return self.performance_metrics
            
        except Exception as e:
            print(f"Erro ao avaliar performance: {e}")
            return self.performance_metrics
    
    def calculate_response_quality_score(self, question, response):
        """Calcular score de qualidade da resposta"""
        score = 0.5  # Base score
        
        # Verificar se resposta aborda a pergunta
        question_words = set(question.lower().split())
        response_words = set(response.lower().split())
        overlap = len(question_words.intersection(response_words))
        score += min(overlap / len(question_words), 0.3)
        
        # Verificar comprimento apropriado
        if 100 <= len(response) <= 1000:
            score += 0.1
        
        # Verificar presença de elementos espirituais
        spiritual_words = ['alma', 'espírito', 'consciência', 'energia', 'amor', 'luz']
        if any(word in response.lower() for word in spiritual_words):
            score += 0.1
        
        return min(score, 1.0)
    
    def save_knowledge_base(self):
        """Salvar base de conhecimento"""
        try:
            knowledge_file = 'ai_knowledge_base.pkl'
            with open(knowledge_file, 'wb') as f:
                pickle.dump(self.knowledge_base, f)
        except Exception as e:
            print(f"Erro ao salvar base de conhecimento: {e}")
    
    def load_knowledge_base(self):
        """Carregar base de conhecimento"""
        try:
            knowledge_file = 'ai_knowledge_base.pkl'
            if os.path.exists(knowledge_file):
                with open(knowledge_file, 'rb') as f:
                    self.knowledge_base = pickle.load(f)
        except Exception as e:
            print(f"Erro ao carregar base de conhecimento: {e}")
    
    def run_training_cycle(self):
        """Executar ciclo completo de treinamento"""
        print("🤖 Iniciando ciclo de treinamento da IA...")
        
        try:
            # 1. Analisar padrões de conversação
            patterns = self.analyze_conversation_patterns()
            print(f"✅ Padrões analisados: {len(patterns)} categorias")
            
            # 2. Treinar compreensão contextual
            context_patterns = self.train_contextual_understanding()
            print(f"✅ Padrões contextuais: {len(context_patterns)} tipos")
            
            # 3. Avaliar performance
            performance = self.evaluate_model_performance()
            print(f"✅ Performance avaliada: {performance}")
            
            # 4. Salvar conhecimento
            self.save_knowledge_base()
            print("✅ Base de conhecimento atualizada")
            
            return {
                "training_completed": True,
                "patterns_analyzed": len(patterns),
                "context_patterns": len(context_patterns),
                "performance_metrics": performance,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Erro no ciclo de treinamento: {e}")
            return {"training_completed": False, "error": str(e)}

# Funções para integração com scheduler
def run_daily_training():
    """Executar treinamento diário"""
    trainer = AITrainingSystem()
    trainer.load_knowledge_base()
    return trainer.run_training_cycle()

def process_user_feedback(conversation_id, score, feedback_text=None):
    """Processar feedback do usuário"""
    trainer = AITrainingSystem()
    trainer.load_knowledge_base()
    return trainer.learn_from_user_feedback(conversation_id, score, feedback_text)
