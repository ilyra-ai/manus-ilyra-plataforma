from models import db
from sqlalchemy import text

def create_optimized_indexes():
    """Criar índices otimizados para melhorar performance das consultas"""
    
    try:
        # Índices para tabela users
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
        """))
        
        # Índices para tabela spiritual_metrics
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_spiritual_metrics_user_id ON spiritual_metrics(user_id);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_spiritual_metrics_name ON spiritual_metrics(name);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_spiritual_metrics_created_at ON spiritual_metrics(created_at);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_spiritual_metrics_user_name ON spiritual_metrics(user_id, name);
        """))
        
        # Índices para tabela ai_conversations
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_date ON ai_conversations(user_id, created_at);
        """))
        
        # Índices para tabela plans
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_plans_price ON plans(price);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
        """))
        
        # Índices para tabela user_subscriptions (se existir)
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
        """))
        
        # Índices para tabela gamification
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON gamification(user_id);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_gamification_points ON gamification(points);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_gamification_level ON gamification(level);
        """))
        
        # Índices para tabela payments (se existir)
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
        """))
        
        # Índices compostos para consultas complexas
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_spiritual_metrics_user_date ON spiritual_metrics(user_id, created_at DESC);
        """))
        
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_date_desc ON ai_conversations(user_id, created_at DESC);
        """))
        
        # Índices para busca de texto (se suportado pelo MySQL)
        db.session.execute(text("""
            CREATE FULLTEXT INDEX IF NOT EXISTS idx_users_fulltext ON users(username, full_name);
        """))
        
        db.session.execute(text("""
            CREATE FULLTEXT INDEX IF NOT EXISTS idx_ai_conversations_fulltext ON ai_conversations(user_message, ai_response);
        """))
        
        db.session.commit()
        print("✅ Índices otimizados criados com sucesso!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao criar índices: {e}")
        raise

def create_database_views():
    """Criar views úteis para consultas complexas"""
    
    try:
        # View para estatísticas de usuários
        db.session.execute(text("""
            CREATE OR REPLACE VIEW user_stats AS
            SELECT 
                u.id,
                u.username,
                u.email,
                u.created_at,
                COUNT(DISTINCT sm.id) as total_metrics,
                COUNT(DISTINCT ac.id) as total_conversations,
                COALESCE(g.points, 0) as points,
                COALESCE(g.level, 1) as level,
                CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END as is_new_user
            FROM users u
            LEFT JOIN spiritual_metrics sm ON u.id = sm.user_id
            LEFT JOIN ai_conversations ac ON u.id = ac.user_id
            LEFT JOIN gamification g ON u.id = g.user_id
            WHERE u.is_active = 1
            GROUP BY u.id, u.username, u.email, u.created_at, g.points, g.level;
        """))
        
        # View para métricas espirituais recentes
        db.session.execute(text("""
            CREATE OR REPLACE VIEW recent_spiritual_metrics AS
            SELECT 
                sm.*,
                u.username,
                ROW_NUMBER() OVER (PARTITION BY sm.user_id, sm.name ORDER BY sm.created_at DESC) as rn
            FROM spiritual_metrics sm
            JOIN users u ON sm.user_id = u.id
            WHERE sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
        """))
        
        # View para conversas de IA recentes
        db.session.execute(text("""
            CREATE OR REPLACE VIEW recent_ai_conversations AS
            SELECT 
                ac.*,
                u.username,
                DATE(ac.created_at) as conversation_date
            FROM ai_conversations ac
            JOIN users u ON ac.user_id = u.id
            WHERE ac.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY ac.created_at DESC;
        """))
        
        # View para ranking de usuários
        db.session.execute(text("""
            CREATE OR REPLACE VIEW user_ranking AS
            SELECT 
                u.id,
                u.username,
                COALESCE(g.points, 0) as points,
                COALESCE(g.level, 1) as level,
                ROW_NUMBER() OVER (ORDER BY COALESCE(g.points, 0) DESC) as ranking_position
            FROM users u
            LEFT JOIN gamification g ON u.id = g.user_id
            WHERE u.is_active = 1
            ORDER BY points DESC;
        """))
        
        # View para estatísticas de planos
        db.session.execute(text("""
            CREATE OR REPLACE VIEW plan_statistics AS
            SELECT 
                p.id,
                p.name,
                p.price,
                COUNT(us.id) as total_subscribers,
                COUNT(CASE WHEN us.status = 'active' THEN 1 END) as active_subscribers,
                SUM(CASE WHEN us.status = 'active' THEN p.price ELSE 0 END) as monthly_revenue
            FROM plans p
            LEFT JOIN user_subscriptions us ON p.id = us.plan_id
            GROUP BY p.id, p.name, p.price;
        """))
        
        db.session.commit()
        print("✅ Views úteis criadas com sucesso!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao criar views: {e}")
        raise

def create_cleanup_events():
    """Criar eventos de limpeza automática (MySQL Event Scheduler)"""
    
    try:
        # Habilitar o Event Scheduler
        db.session.execute(text("SET GLOBAL event_scheduler = ON;"))
        
        # Evento para limpar conversas antigas (mais de 1 ano)
        db.session.execute(text("""
            CREATE EVENT IF NOT EXISTS cleanup_old_conversations
            ON SCHEDULE EVERY 1 DAY
            STARTS CURRENT_TIMESTAMP
            DO
            DELETE FROM ai_conversations 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
        """))
        
        # Evento para limpar métricas antigas (mais de 2 anos)
        db.session.execute(text("""
            CREATE EVENT IF NOT EXISTS cleanup_old_metrics
            ON SCHEDULE EVERY 1 WEEK
            STARTS CURRENT_TIMESTAMP
            DO
            DELETE FROM spiritual_metrics 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);
        """))
        
        # Evento para limpar logs de auditoria antigos (mais de 6 meses)
        db.session.execute(text("""
            CREATE EVENT IF NOT EXISTS cleanup_old_audit_logs
            ON SCHEDULE EVERY 1 DAY
            STARTS CURRENT_TIMESTAMP
            DO
            DELETE FROM audit_logs 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
        """))
        
        # Evento para atualizar estatísticas de usuários
        db.session.execute(text("""
            CREATE EVENT IF NOT EXISTS update_user_statistics
            ON SCHEDULE EVERY 1 HOUR
            STARTS CURRENT_TIMESTAMP
            DO
            UPDATE users u
            SET last_activity = (
                SELECT MAX(created_at) 
                FROM ai_conversations ac 
                WHERE ac.user_id = u.id
            )
            WHERE u.is_active = 1;
        """))
        
        db.session.commit()
        print("✅ Eventos de limpeza automática criados com sucesso!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao criar eventos de limpeza: {e}")
        # Não fazer raise aqui pois eventos podem não ser suportados em todos os ambientes

def optimize_database():
    """Executar todas as otimizações do banco de dados"""
    print("🔧 Iniciando otimização do banco de dados...")
    
    try:
        create_optimized_indexes()
        create_database_views()
        create_cleanup_events()
        
        print("✅ Otimização do banco de dados concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro durante a otimização: {e}")
        raise

if __name__ == "__main__":
    from app import create_app
    
    app = create_app()
    with app.app_context():
        optimize_database()
