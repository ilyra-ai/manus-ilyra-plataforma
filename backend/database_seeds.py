"""
Sistema de Seeds para iLyra Platform
Implementação completa de dados iniciais para desenvolvimento e produção
"""

import json
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from models import (
    db, User, Plan, SpiritualMetric, AIConversation, 
    Gamification, UserAuditLog
)
import logging

logger = logging.getLogger(__name__)

class DatabaseSeeds:
    """Sistema completo de seeds para o banco de dados"""
    
    def __init__(self):
        self.created_items = {
            'plans': 0,
            'users': 0,
            'spiritual_metrics': 0,
            'ai_conversations': 0,
            'gamification': 0,
            'audit_logs': 0
        }
    
    def seed_plans(self):
        """Criar planos de assinatura padrão"""
        try:
            plans_data = [
                {
                    'name': 'Free',
                    'price': 0.0,
                    'features': json.dumps([
                        'Acesso básico ao dashboard',
                        '5 métricas espirituais',
                        '10 conversas IA por mês',
                        'Relatórios básicos',
                        'Suporte por email'
                    ])
                },
                {
                    'name': 'Essential',
                    'price': 29.90,
                    'features': json.dumps([
                        'Todas as funcionalidades do Free',
                        '25 métricas espirituais',
                        '100 conversas IA por mês',
                        'Relatórios avançados em PDF',
                        'Análises de progresso',
                        'Suporte prioritário',
                        'Backup automático'
                    ])
                },
                {
                    'name': 'Premium',
                    'price': 59.90,
                    'features': json.dumps([
                        'Todas as funcionalidades do Essential',
                        'Métricas espirituais ilimitadas',
                        '500 conversas IA por mês',
                        'IA especializada em espiritualidade',
                        'Relatórios personalizados',
                        'Análises preditivas',
                        'Integração com calendário',
                        'Lembretes personalizados',
                        'Suporte 24/7'
                    ])
                },
                {
                    'name': 'Master',
                    'price': 99.90,
                    'features': json.dumps([
                        'Todas as funcionalidades do Premium',
                        'Conversas IA ilimitadas',
                        'Acesso a todos os modelos de IA',
                        'Consultoria espiritual personalizada',
                        'Relatórios executivos',
                        'API para integrações',
                        'Treinamento personalizado da IA',
                        'Sessões de coaching',
                        'Suporte dedicado',
                        'Acesso antecipado a novas funcionalidades'
                    ])
                }
            ]
            
            for plan_data in plans_data:
                existing_plan = Plan.query.filter_by(name=plan_data['name']).first()
                if not existing_plan:
                    plan = Plan(
                        name=plan_data['name'],
                        price=plan_data['price'],
                        features=plan_data['features']
                    )
                    db.session.add(plan)
                    self.created_items['plans'] += 1
                    logger.info(f"Plano '{plan_data['name']}' criado")
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao criar planos: {str(e)}")
            return False
    
    def seed_admin_user(self):
        """Criar usuário administrador padrão"""
        try:
            admin_email = 'admin@ilyra.com'
            existing_admin = User.query.filter_by(email=admin_email).first()
            
            if not existing_admin:
                # Buscar plano Master para o admin
                master_plan = Plan.query.filter_by(name='Master').first()
                
                admin_user = User(
                    username='admin',
                    email=admin_email,
                    password_hash=generate_password_hash('Admin@123456'),
                    role='admin',
                    created_at=datetime.utcnow(),
                    plan=master_plan,
                    email_verified=True,
                    email_verified_at=datetime.utcnow()
                )
                
                db.session.add(admin_user)
                db.session.commit()
                
                # Criar gamificação para o admin
                admin_gamification = Gamification(
                    user_id=admin_user.id,
                    points=1000,
                    level=10,
                    badges='admin,founder,master'
                )
                
                db.session.add(admin_gamification)
                self.created_items['users'] += 1
                self.created_items['gamification'] += 1
                
                logger.info(f"Usuário admin criado: {admin_email}")
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao criar usuário admin: {str(e)}")
            return False
    
    def seed_demo_users(self, count=5):
        """Criar usuários de demonstração"""
        try:
            demo_users_data = [
                {
                    'username': 'maria_luz',
                    'email': 'maria@demo.ilyra.com',
                    'plan_name': 'Premium'
                },
                {
                    'username': 'joao_espiritual',
                    'email': 'joao@demo.ilyra.com',
                    'plan_name': 'Essential'
                },
                {
                    'username': 'ana_consciencia',
                    'email': 'ana@demo.ilyra.com',
                    'plan_name': 'Free'
                },
                {
                    'username': 'carlos_meditacao',
                    'email': 'carlos@demo.ilyra.com',
                    'plan_name': 'Premium'
                },
                {
                    'username': 'lucia_starseed',
                    'email': 'lucia@demo.ilyra.com',
                    'plan_name': 'Master'
                }
            ]
            
            for i, user_data in enumerate(demo_users_data[:count]):
                existing_user = User.query.filter_by(email=user_data['email']).first()
                
                if not existing_user:
                    plan = Plan.query.filter_by(name=user_data['plan_name']).first()
                    
                    demo_user = User(
                        username=user_data['username'],
                        email=user_data['email'],
                        password_hash=generate_password_hash('Demo@123456'),
                        role='user',
                        created_at=datetime.utcnow() - timedelta(days=30-i*5),
                        plan=plan,
                        email_verified=True,
                        email_verified_at=datetime.utcnow() - timedelta(days=29-i*5),
                        last_login=datetime.utcnow() - timedelta(days=i+1)
                    )
                    
                    db.session.add(demo_user)
                    db.session.flush()  # Para obter o ID
                    
                    # Criar gamificação
                    gamification = Gamification(
                        user_id=demo_user.id,
                        points=(i+1) * 150,
                        level=i+2,
                        badges=f'newcomer,active_user' + (f',premium_user' if plan.price > 0 else '')
                    )
                    
                    db.session.add(gamification)
                    self.created_items['users'] += 1
                    self.created_items['gamification'] += 1
                    
                    logger.info(f"Usuário demo criado: {user_data['email']}")
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao criar usuários demo: {str(e)}")
            return False
    
    def seed_spiritual_metrics(self):
        """Criar métricas espirituais de exemplo"""
        try:
            # Buscar usuários para criar métricas
            users = User.query.filter_by(role='user').limit(5).all()
            
            spiritual_metrics_names = [
                'Meditação Diária',
                'Nível de Consciência',
                'Energia Vital',
                'Idade da Alma',
                'Ativação Starseed',
                'Memórias de Vidas Passadas',
                'Equilíbrio dos Chakras',
                'Proteção Energética',
                'Intuição e Clarividência',
                'Conexão com Guias',
                'Frequência Vibracional',
                'Propósito de Vida'
            ]
            
            for user in users:
                for i, metric_name in enumerate(spiritual_metrics_names):
                    # Criar várias medições ao longo do tempo
                    for days_ago in range(30, 0, -3):  # A cada 3 dias nos últimos 30 dias
                        metric_value = 50 + (i * 5) + (days_ago % 20)  # Valor variável
                        
                        spiritual_metric = SpiritualMetric(
                            user_id=user.id,
                            name=metric_name,
                            value=min(100, max(0, metric_value)),  # Entre 0 e 100
                            timestamp=datetime.utcnow() - timedelta(days=days_ago)
                        )
                        
                        db.session.add(spiritual_metric)
                        self.created_items['spiritual_metrics'] += 1
            
            db.session.commit()
            logger.info(f"Métricas espirituais criadas: {self.created_items['spiritual_metrics']}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao criar métricas espirituais: {str(e)}")
            return False
    
    def seed_ai_conversations(self):
        """Criar conversas IA de exemplo"""
        try:
            users = User.query.filter_by(role='user').limit(5).all()
            
            conversation_templates = [
                {
                    'user_message': 'Como posso aumentar minha frequência vibracional?',
                    'ai_response': 'Para aumentar sua frequência vibracional, recomendo: 1) Praticar meditação diária, 2) Consumir alimentos orgânicos e naturais, 3) Passar tempo na natureza, 4) Praticar gratidão, 5) Ouvir música de alta frequência (528Hz, 741Hz). A consistência é fundamental para elevar sua vibração.'
                },
                {
                    'user_message': 'Sinto que sou um Starseed. Como posso ter certeza?',
                    'ai_response': 'Sinais comuns de Starseeds incluem: sentir-se diferente desde criança, forte conexão com as estrelas, interesse em espiritualidade, empatia elevada, sonhos vívidos com outros mundos. Para confirmar, observe seus padrões energéticos, medite sobre suas origens estelares e confie em sua intuição.'
                },
                {
                    'user_message': 'Meus chakras estão desalinhados. O que fazer?',
                    'ai_response': 'Para realinhar seus chakras: 1) Identifique quais estão bloqueados através de meditação, 2) Use cristais específicos (ametista para coronário, quartzo rosa para cardíaco), 3) Pratique yoga, 4) Use mantras específicos, 5) Visualize as cores correspondentes. Recomendo uma limpeza energética semanal.'
                },
                {
                    'user_message': 'Como desenvolver minha intuição?',
                    'ai_response': 'Para desenvolver intuição: 1) Medite regularmente para silenciar a mente, 2) Mantenha um diário de insights, 3) Pratique exercícios de percepção extrassensorial, 4) Confie nos primeiros impulsos, 5) Observe sincronicidades. A prática constante fortalece essa habilidade natural.'
                },
                {
                    'user_message': 'Qual é o meu propósito de vida?',
                    'ai_response': 'Seu propósito de vida está conectado aos seus dons naturais e paixões. Reflita sobre: O que te traz alegria genuína? Quais problemas você sente vontade de resolver? Que impacto quer deixar no mundo? Medite sobre essas questões e observe os sinais que o universo envia.'
                }
            ]
            
            for user in users:
                for i, template in enumerate(conversation_templates):
                    conversation_data = {
                        'messages': [
                            {
                                'role': 'user',
                                'content': template['user_message'],
                                'timestamp': (datetime.utcnow() - timedelta(days=20-i*2)).isoformat()
                            },
                            {
                                'role': 'assistant',
                                'content': template['ai_response'],
                                'timestamp': (datetime.utcnow() - timedelta(days=20-i*2, minutes=5)).isoformat()
                            }
                        ],
                        'metadata': {
                            'model': 'gemini-pro',
                            'tokens_used': len(template['user_message'] + template['ai_response']) // 4,
                            'satisfaction_rating': 4 + (i % 2)  # 4 ou 5 estrelas
                        }
                    }
                    
                    ai_conversation = AIConversation(
                        user_id=user.id,
                        conversation=json.dumps(conversation_data),
                        timestamp=datetime.utcnow() - timedelta(days=20-i*2)
                    )
                    
                    db.session.add(ai_conversation)
                    self.created_items['ai_conversations'] += 1
            
            db.session.commit()
            logger.info(f"Conversas IA criadas: {self.created_items['ai_conversations']}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao criar conversas IA: {str(e)}")
            return False
    
    def seed_audit_logs(self):
        """Criar logs de auditoria de exemplo"""
        try:
            users = User.query.all()
            
            audit_actions = [
                'login_success',
                'logout',
                'profile_update',
                'password_change',
                'metric_created',
                'ai_conversation_started',
                'report_generated',
                'plan_upgraded'
            ]
            
            for user in users:
                for i in range(10):  # 10 logs por usuário
                    action = audit_actions[i % len(audit_actions)]
                    
                    details = {
                        'action_details': f'Ação {action} executada pelo usuário',
                        'ip_address': f'192.168.1.{100 + (i % 50)}',
                        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                    
                    audit_log = UserAuditLog(
                        user_id=user.id,
                        action=action,
                        ip_address=details['ip_address'],
                        user_agent=details['user_agent'],
                        details=json.dumps(details),
                        timestamp=datetime.utcnow() - timedelta(days=i*2, hours=i)
                    )
                    
                    db.session.add(audit_log)
                    self.created_items['audit_logs'] += 1
            
            db.session.commit()
            logger.info(f"Logs de auditoria criados: {self.created_items['audit_logs']}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao criar logs de auditoria: {str(e)}")
            return False
    
    def run_all_seeds(self, include_demo_data=True):
        """Executar todos os seeds"""
        try:
            logger.info("Iniciando processo de seeds...")
            
            # Seeds essenciais (sempre executar)
            if not self.seed_plans():
                return False
            
            if not self.seed_admin_user():
                return False
            
            # Seeds de demonstração (opcional)
            if include_demo_data:
                if not self.seed_demo_users():
                    return False
                
                if not self.seed_spiritual_metrics():
                    return False
                
                if not self.seed_ai_conversations():
                    return False
                
                if not self.seed_audit_logs():
                    return False
            
            logger.info("Seeds executados com sucesso!")
            logger.info(f"Resumo: {self.created_items}")
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao executar seeds: {str(e)}")
            return False
    
    def clear_all_data(self):
        """Limpar todos os dados (CUIDADO: usar apenas em desenvolvimento)"""
        try:
            logger.warning("ATENÇÃO: Limpando todos os dados do banco!")
            
            # Ordem de exclusão respeitando foreign keys
            UserAuditLog.query.delete()
            AIConversation.query.delete()
            SpiritualMetric.query.delete()
            Gamification.query.delete()
            User.query.delete()
            Plan.query.delete()
            
            db.session.commit()
            logger.info("Todos os dados foram removidos")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao limpar dados: {str(e)}")
            return False

# Instância global
database_seeds = DatabaseSeeds()
