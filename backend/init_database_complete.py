#!/usr/bin/env python3
"""
Script de Inicialização Completa do Banco de Dados - iLyra Platform
Configuração, migração, views, eventos, índices e seeds
"""

import os
import sys
import logging
from flask import Flask
from flask_migrate import upgrade, init, migrate as flask_migrate
from database_config import database_config
from database_seeds import database_seeds

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Criar aplicação Flask para inicialização"""
    app = Flask(__name__)
    
    # Configurações básicas
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Configurar banco de dados
    database_config.init_app(app)
    
    return app

def initialize_database(include_demo_data=True, force_recreate=False):
    """Inicializar banco de dados completo"""
    try:
        logger.info("=== INICIALIZAÇÃO DO BANCO DE DADOS iLyra ===")
        
        # Criar aplicação
        app = create_app()
        
        with app.app_context():
            
            # 1. Criar banco de dados se não existir
            logger.info("1. Verificando/criando banco de dados...")
            if not database_config.create_database_if_not_exists():
                logger.error("Falha ao criar banco de dados")
                return False
            
            # 2. Inicializar migrações se necessário
            logger.info("2. Configurando migrações...")
            migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
            
            if not os.path.exists(migrations_dir) or force_recreate:
                logger.info("Inicializando sistema de migrações...")
                try:
                    init()
                    logger.info("Sistema de migrações inicializado")
                except Exception as e:
                    logger.warning(f"Migrações já inicializadas ou erro: {str(e)}")
            
            # 3. Criar/atualizar tabelas
            logger.info("3. Criando/atualizando estrutura das tabelas...")
            try:
                # Importar modelos para garantir que estejam registrados
                from models import (
                    User, Plan, SpiritualMetric, AIConversation, 
                    Gamification, EmailVerificationToken, PasswordResetToken,
                    UserAuditLog, BlacklistedToken
                )
                
                # Criar todas as tabelas
                database_config.db.create_all()
                logger.info("Tabelas criadas/atualizadas com sucesso")
                
                # Executar migrações pendentes
                try:
                    upgrade()
                    logger.info("Migrações aplicadas com sucesso")
                except Exception as e:
                    logger.warning(f"Nenhuma migração pendente ou erro: {str(e)}")
                
            except Exception as e:
                logger.error(f"Erro ao criar tabelas: {str(e)}")
                return False
            
            # 4. Criar índices otimizados
            logger.info("4. Criando índices otimizados...")
            if not database_config.create_indexes():
                logger.warning("Alguns índices podem não ter sido criados")
            
            # 5. Criar views úteis
            logger.info("5. Criando views do banco de dados...")
            if not database_config.create_database_views():
                logger.warning("Algumas views podem não ter sido criadas")
            
            # 6. Criar eventos de limpeza automática
            logger.info("6. Configurando eventos automáticos...")
            if not database_config.create_database_events():
                logger.warning("Alguns eventos podem não ter sido criados")
            
            # 7. Executar seeds de dados
            logger.info("7. Executando seeds de dados...")
            if not database_seeds.run_all_seeds(include_demo_data=include_demo_data):
                logger.warning("Alguns seeds podem não ter sido executados")
            
            # 8. Verificar status final
            logger.info("8. Verificando status final do banco...")
            status = database_config.get_database_status()
            
            if status:
                logger.info("=== STATUS DO BANCO DE DADOS ===")
                logger.info(f"MySQL Version: {status['mysql_version']}")
                logger.info(f"Total de Tabelas: {status['total_tables']}")
                logger.info(f"Total de Registros: {status['total_rows']}")
                logger.info(f"Tamanho dos Dados: {status['total_data_size']} bytes")
                logger.info(f"Tamanho dos Índices: {status['total_index_size']} bytes")
                
                logger.info("=== TABELAS CRIADAS ===")
                for table in status['tables']:
                    logger.info(f"- {table['name']}: {table['rows']} registros")
                
                if status['events']:
                    logger.info("=== EVENTOS CONFIGURADOS ===")
                    for event in status['events']:
                        logger.info(f"- {event['name']}: {event['status']}")
            
            logger.info("=== INICIALIZAÇÃO CONCLUÍDA COM SUCESSO ===")
            return True
            
    except Exception as e:
        logger.error(f"Erro na inicialização do banco de dados: {str(e)}")
        return False

def reset_database():
    """Resetar banco de dados (CUIDADO: remove todos os dados)"""
    try:
        logger.warning("=== RESETANDO BANCO DE DADOS ===")
        logger.warning("ATENÇÃO: Todos os dados serão perdidos!")
        
        app = create_app()
        
        with app.app_context():
            # Limpar todos os dados
            if database_seeds.clear_all_data():
                logger.info("Dados removidos com sucesso")
            
            # Recriar estrutura
            database_config.db.drop_all()
            database_config.db.create_all()
            
            logger.info("Banco de dados resetado com sucesso")
            return True
            
    except Exception as e:
        logger.error(f"Erro ao resetar banco de dados: {str(e)}")
        return False

def check_database_health():
    """Verificar saúde do banco de dados"""
    try:
        logger.info("=== VERIFICAÇÃO DE SAÚDE DO BANCO ===")
        
        app = create_app()
        
        with app.app_context():
            status = database_config.get_database_status()
            
            if status:
                logger.info("✅ Banco de dados está funcionando")
                logger.info(f"MySQL Version: {status['mysql_version']}")
                logger.info(f"Tabelas: {status['total_tables']}")
                logger.info(f"Registros: {status['total_rows']}")
                
                # Verificar conectividade
                from models import User
                user_count = User.query.count()
                logger.info(f"✅ Conectividade OK - {user_count} usuários encontrados")
                
                return True
            else:
                logger.error("❌ Erro ao conectar com o banco de dados")
                return False
                
    except Exception as e:
        logger.error(f"❌ Erro na verificação: {str(e)}")
        return False

def main():
    """Função principal do script"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Inicialização do Banco de Dados iLyra')
    parser.add_argument('--action', choices=['init', 'reset', 'check'], default='init',
                       help='Ação a executar (default: init)')
    parser.add_argument('--no-demo', action='store_true',
                       help='Não incluir dados de demonstração')
    parser.add_argument('--force', action='store_true',
                       help='Forçar recriação (apenas para init)')
    
    args = parser.parse_args()
    
    if args.action == 'init':
        success = initialize_database(
            include_demo_data=not args.no_demo,
            force_recreate=args.force
        )
    elif args.action == 'reset':
        success = reset_database()
    elif args.action == 'check':
        success = check_database_health()
    else:
        logger.error("Ação inválida")
        success = False
    
    if success:
        logger.info("✅ Operação concluída com sucesso!")
        sys.exit(0)
    else:
        logger.error("❌ Operação falhou!")
        sys.exit(1)

if __name__ == '__main__':
    main()
