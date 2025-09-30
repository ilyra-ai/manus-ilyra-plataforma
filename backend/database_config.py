"""
Configuração Completa do Banco de Dados para iLyra Platform
Implementação de MySQL 8.0, Views, Eventos e Otimizações
"""

import os
import pymysql
from sqlalchemy import create_engine, text, event
from sqlalchemy.pool import QueuePool
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timedelta
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Configuração completa do banco de dados"""
    
    def __init__(self, app=None):
        self.app = app
        self.db = None
        self.migrate = None
        
    def init_app(self, app):
        """Inicializar configuração do banco com a aplicação Flask"""
        self.app = app
        
        # Configurações do MySQL
        mysql_config = {
            'host': os.getenv('MYSQL_HOST', 'localhost'),
            'port': int(os.getenv('MYSQL_PORT', 3306)),
            'user': os.getenv('MYSQL_USER', 'ilyra_user'),
            'password': os.getenv('MYSQL_PASSWORD', 'ilyra_password'),
            'database': os.getenv('MYSQL_DATABASE', 'ilyra_db'),
            'charset': 'utf8mb4'
        }
        
        # URL de conexão
        database_url = (
            f"mysql+pymysql://{mysql_config['user']}:{mysql_config['password']}"
            f"@{mysql_config['host']}:{mysql_config['port']}"
            f"/{mysql_config['database']}?charset={mysql_config['charset']}"
        )
        
        # Configurações do SQLAlchemy
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['SQLALCHEMY_POOL_SIZE'] = 20
        app.config['SQLALCHEMY_POOL_TIMEOUT'] = 30
        app.config['SQLALCHEMY_POOL_RECYCLE'] = 3600
        app.config['SQLALCHEMY_MAX_OVERFLOW'] = 30
        app.config['SQLALCHEMY_POOL_PRE_PING'] = True
        
        # Engine personalizado com configurações otimizadas
        engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=20,
            max_overflow=30,
            pool_timeout=30,
            pool_recycle=3600,
            pool_pre_ping=True,
            echo=app.config.get('DEBUG', False),  # Log SQL queries em debug
            connect_args={
                'charset': 'utf8mb4',
                'autocommit': False,
                'connect_timeout': 60,
                'read_timeout': 60,
                'write_timeout': 60
            }
        )
        
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'poolclass': QueuePool,
            'pool_size': 20,
            'max_overflow': 30,
            'pool_timeout': 30,
            'pool_recycle': 3600,
            'pool_pre_ping': True
        }
        
        # Inicializar SQLAlchemy e Migrate
        from models import db
        self.db = db
        self.db.init_app(app)
        
        self.migrate = Migrate(app, self.db)
        
        # Configurar eventos do SQLAlchemy
        self._setup_sqlalchemy_events()
        
        logger.info("Configuração do banco de dados inicializada")
    
    def _setup_sqlalchemy_events(self):
        """Configurar eventos do SQLAlchemy"""
        
        @event.listens_for(self.db.engine, "connect")
        def set_mysql_mode(dbapi_connection, connection_record):
            """Configurar modo MySQL na conexão"""
            try:
                with dbapi_connection.cursor() as cursor:
                    # Configurar timezone
                    cursor.execute("SET time_zone = '+00:00'")
                    
                    # Configurar SQL mode para compatibilidade
                    cursor.execute("""
                        SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'
                    """)
                    
                    # Configurar charset
                    cursor.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci")
                    
                    # Configurar autocommit
                    cursor.execute("SET autocommit = 0")
                    
                dbapi_connection.commit()
                logger.info("Configurações MySQL aplicadas na conexão")
                
            except Exception as e:
                logger.error(f"Erro ao configurar conexão MySQL: {str(e)}")
    
    def create_database_if_not_exists(self):
        """Criar banco de dados se não existir"""
        try:
            mysql_config = {
                'host': os.getenv('MYSQL_HOST', 'localhost'),
                'port': int(os.getenv('MYSQL_PORT', 3306)),
                'user': os.getenv('MYSQL_USER', 'ilyra_user'),
                'password': os.getenv('MYSQL_PASSWORD', 'ilyra_password'),
                'database': os.getenv('MYSQL_DATABASE', 'ilyra_db'),
            }
            
            # Conectar sem especificar database
            connection = pymysql.connect(
                host=mysql_config['host'],
                port=mysql_config['port'],
                user=mysql_config['user'],
                password=mysql_config['password'],
                charset='utf8mb4'
            )
            
            with connection.cursor() as cursor:
                # Criar database se não existir
                cursor.execute(f"""
                    CREATE DATABASE IF NOT EXISTS `{mysql_config['database']}`
                    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                """)
                
                logger.info(f"Database {mysql_config['database']} criado/verificado")
            
            connection.commit()
            connection.close()
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao criar database: {str(e)}")
            return False
    
    def create_database_views(self):
        """Criar views úteis no banco de dados"""
        try:
            with self.db.engine.connect() as connection:
                
                # View: Estatísticas de usuários
                connection.execute(text("""
                    CREATE OR REPLACE VIEW user_statistics AS
                    SELECT 
                        COUNT(*) as total_users,
                        COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_users,
                        COUNT(CASE WHEN email_verified = 0 THEN 1 END) as unverified_users,
                        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
                        COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
                        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_last_30_days,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_last_30_days
                    FROM user
                """))
                
                # View: Estatísticas de planos
                connection.execute(text("""
                    CREATE OR REPLACE VIEW plan_statistics AS
                    SELECT 
                        p.id,
                        p.name,
                        p.price,
                        COUNT(u.id) as user_count,
                        SUM(p.price) as total_revenue
                    FROM plan p
                    LEFT JOIN user u ON p.id = u.plan_id
                    GROUP BY p.id, p.name, p.price
                """))
                
                # View: Métricas espirituais por usuário
                connection.execute(text("""
                    CREATE OR REPLACE VIEW user_spiritual_summary AS
                    SELECT 
                        u.id as user_id,
                        u.username,
                        u.email,
                        COUNT(sm.id) as total_metrics,
                        AVG(sm.value) as avg_metric_value,
                        MAX(sm.timestamp) as last_metric_date,
                        COUNT(CASE WHEN sm.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as metrics_last_week
                    FROM user u
                    LEFT JOIN spiritual_metric sm ON u.id = sm.user_id
                    GROUP BY u.id, u.username, u.email
                """))
                
                # View: Conversas IA por usuário
                connection.execute(text("""
                    CREATE OR REPLACE VIEW user_ai_summary AS
                    SELECT 
                        u.id as user_id,
                        u.username,
                        COUNT(ai.id) as total_conversations,
                        MAX(ai.timestamp) as last_conversation_date,
                        COUNT(CASE WHEN ai.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as conversations_last_week,
                        AVG(CHAR_LENGTH(ai.conversation)) as avg_conversation_length
                    FROM user u
                    LEFT JOIN ai_conversation ai ON u.id = ai.user_id
                    GROUP BY u.id, u.username
                """))
                
                # View: Logs de auditoria resumidos
                connection.execute(text("""
                    CREATE OR REPLACE VIEW audit_summary AS
                    SELECT 
                        DATE(timestamp) as date,
                        action,
                        COUNT(*) as action_count,
                        COUNT(DISTINCT user_id) as unique_users
                    FROM user_audit_log
                    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    GROUP BY DATE(timestamp), action
                    ORDER BY date DESC, action_count DESC
                """))
                
                # View: Tokens ativos
                connection.execute(text("""
                    CREATE OR REPLACE VIEW active_tokens AS
                    SELECT 
                        'email_verification' as token_type,
                        COUNT(*) as active_count,
                        MIN(expires_at) as earliest_expiry,
                        MAX(expires_at) as latest_expiry
                    FROM email_verification_token
                    WHERE used = 0 AND expires_at > NOW()
                    
                    UNION ALL
                    
                    SELECT 
                        'password_reset' as token_type,
                        COUNT(*) as active_count,
                        MIN(expires_at) as earliest_expiry,
                        MAX(expires_at) as latest_expiry
                    FROM password_reset_token
                    WHERE used = 0 AND expires_at > NOW()
                    
                    UNION ALL
                    
                    SELECT 
                        'blacklisted_jwt' as token_type,
                        COUNT(*) as active_count,
                        MIN(expires_at) as earliest_expiry,
                        MAX(expires_at) as latest_expiry
                    FROM blacklisted_token
                    WHERE expires_at > NOW()
                """))
                
                connection.commit()
                logger.info("Views do banco de dados criadas com sucesso")
                return True
                
        except Exception as e:
            logger.error(f"Erro ao criar views: {str(e)}")
            return False
    
    def create_database_events(self):
        """Criar eventos de limpeza automática"""
        try:
            with self.db.engine.connect() as connection:
                
                # Evento: Limpeza de tokens expirados (executa a cada hora)
                connection.execute(text("""
                    CREATE EVENT IF NOT EXISTS cleanup_expired_tokens
                    ON SCHEDULE EVERY 1 HOUR
                    STARTS CURRENT_TIMESTAMP
                    DO
                    BEGIN
                        -- Limpar tokens de verificação de email expirados
                        DELETE FROM email_verification_token 
                        WHERE expires_at < NOW();
                        
                        -- Limpar tokens de reset de senha expirados
                        DELETE FROM password_reset_token 
                        WHERE expires_at < NOW();
                        
                        -- Limpar tokens JWT blacklistados expirados
                        DELETE FROM blacklisted_token 
                        WHERE expires_at < NOW();
                        
                        -- Log da limpeza
                        INSERT INTO user_audit_log (user_id, action, details, timestamp)
                        VALUES (NULL, 'system_cleanup_tokens', 
                                JSON_OBJECT('cleanup_time', NOW()), NOW());
                    END
                """))
                
                # Evento: Limpeza de logs antigos (executa diariamente)
                connection.execute(text("""
                    CREATE EVENT IF NOT EXISTS cleanup_old_audit_logs
                    ON SCHEDULE EVERY 1 DAY
                    STARTS CURRENT_TIMESTAMP
                    DO
                    BEGIN
                        -- Manter apenas logs dos últimos 90 dias
                        DELETE FROM user_audit_log 
                        WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
                        
                        -- Log da limpeza
                        INSERT INTO user_audit_log (user_id, action, details, timestamp)
                        VALUES (NULL, 'system_cleanup_audit_logs', 
                                JSON_OBJECT('cleanup_time', NOW(), 'retention_days', 90), NOW());
                    END
                """))
                
                # Evento: Estatísticas diárias (executa à meia-noite)
                connection.execute(text("""
                    CREATE EVENT IF NOT EXISTS daily_statistics
                    ON SCHEDULE EVERY 1 DAY
                    STARTS (CURRENT_DATE + INTERVAL 1 DAY)
                    DO
                    BEGIN
                        -- Criar tabela de estatísticas diárias se não existir
                        CREATE TABLE IF NOT EXISTS daily_statistics (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            date DATE NOT NULL UNIQUE,
                            total_users INT DEFAULT 0,
                            new_users INT DEFAULT 0,
                            active_users INT DEFAULT 0,
                            total_conversations INT DEFAULT 0,
                            total_metrics INT DEFAULT 0,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        -- Inserir estatísticas do dia anterior
                        INSERT INTO daily_statistics (date, total_users, new_users, active_users, total_conversations, total_metrics)
                        SELECT 
                            DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY) as date,
                            (SELECT COUNT(*) FROM user) as total_users,
                            (SELECT COUNT(*) FROM user WHERE DATE(created_at) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)) as new_users,
                            (SELECT COUNT(*) FROM user WHERE DATE(last_login) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)) as active_users,
                            (SELECT COUNT(*) FROM ai_conversation WHERE DATE(timestamp) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)) as total_conversations,
                            (SELECT COUNT(*) FROM spiritual_metric WHERE DATE(timestamp) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)) as total_metrics
                        ON DUPLICATE KEY UPDATE
                            total_users = VALUES(total_users),
                            new_users = VALUES(new_users),
                            active_users = VALUES(active_users),
                            total_conversations = VALUES(total_conversations),
                            total_metrics = VALUES(total_metrics);
                    END
                """))
                
                # Habilitar event scheduler se não estiver habilitado
                connection.execute(text("SET GLOBAL event_scheduler = ON"))
                
                connection.commit()
                logger.info("Eventos do banco de dados criados com sucesso")
                return True
                
        except Exception as e:
            logger.error(f"Erro ao criar eventos: {str(e)}")
            return False
    
    def create_indexes(self):
        """Criar índices otimizados"""
        try:
            with self.db.engine.connect() as connection:
                
                # Índices para tabela user
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_user_email ON user(email)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_user_username ON user(username)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_user_created_at ON user(created_at)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_user_last_login ON user(last_login)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_user_plan_id ON user(plan_id)"))
                
                # Índices para tabela spiritual_metric
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_spiritual_metric_user_id ON spiritual_metric(user_id)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_spiritual_metric_timestamp ON spiritual_metric(timestamp)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_spiritual_metric_name ON spiritual_metric(name)"))
                
                # Índices para tabela ai_conversation
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_conversation_user_id ON ai_conversation(user_id)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_conversation_timestamp ON ai_conversation(timestamp)"))
                
                # Índices para tabela user_audit_log
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON user_audit_log(user_id)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON user_audit_log(timestamp)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_audit_log_action ON user_audit_log(action)"))
                
                # Índices para tokens
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_email_token_hash ON email_verification_token(token_hash)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_email_token_expires ON email_verification_token(expires_at)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_password_token_hash ON password_reset_token(token_hash)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_password_token_expires ON password_reset_token(expires_at)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_blacklisted_token_jti ON blacklisted_token(jti)"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_blacklisted_token_expires ON blacklisted_token(expires_at)"))
                
                connection.commit()
                logger.info("Índices do banco de dados criados com sucesso")
                return True
                
        except Exception as e:
            logger.error(f"Erro ao criar índices: {str(e)}")
            return False
    
    def get_database_status(self):
        """Obter status do banco de dados"""
        try:
            with self.db.engine.connect() as connection:
                
                # Informações básicas
                result = connection.execute(text("SELECT VERSION() as version"))
                mysql_version = result.fetchone()[0]
                
                # Status das tabelas
                result = connection.execute(text("""
                    SELECT 
                        table_name,
                        table_rows,
                        data_length,
                        index_length
                    FROM information_schema.tables 
                    WHERE table_schema = DATABASE()
                    ORDER BY table_name
                """))
                
                tables = []
                for row in result:
                    tables.append({
                        'name': row[0],
                        'rows': row[1] or 0,
                        'data_size': row[2] or 0,
                        'index_size': row[3] or 0
                    })
                
                # Status dos eventos
                result = connection.execute(text("""
                    SELECT event_name, status, last_executed
                    FROM information_schema.events
                    WHERE event_schema = DATABASE()
                """))
                
                events = []
                for row in result:
                    events.append({
                        'name': row[0],
                        'status': row[1],
                        'last_executed': row[2]
                    })
                
                return {
                    'mysql_version': mysql_version,
                    'tables': tables,
                    'events': events,
                    'total_tables': len(tables),
                    'total_rows': sum(t['rows'] for t in tables),
                    'total_data_size': sum(t['data_size'] for t in tables),
                    'total_index_size': sum(t['index_size'] for t in tables)
                }
                
        except Exception as e:
            logger.error(f"Erro ao obter status do banco: {str(e)}")
            return None

# Instância global
database_config = DatabaseConfig()
