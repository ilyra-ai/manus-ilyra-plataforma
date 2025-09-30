#!/bin/bash

# iLyra Database Backup Script
# Executa backup automatizado do banco de dados PostgreSQL

set -e

# Configurações
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="ilyra_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ]; then
    error "Variáveis de ambiente do PostgreSQL não definidas"
    exit 1
fi

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

log "Iniciando backup do banco de dados iLyra..."

# Executar backup
export PGPASSWORD="$POSTGRES_PASSWORD"

if pg_dump -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_DIR/$BACKUP_FILE.custom"; then
    
    log "Backup custom criado com sucesso: $BACKUP_FILE.custom"
    
    # Criar também backup em SQL plain text
    if pg_dump -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        --file="$BACKUP_DIR/$BACKUP_FILE"; then
        
        log "Backup SQL criado com sucesso: $BACKUP_FILE"
        
        # Comprimir backup SQL
        gzip "$BACKUP_DIR/$BACKUP_FILE"
        log "Backup comprimido: $BACKUP_FILE.gz"
        
    else
        error "Falha ao criar backup SQL"
    fi
    
else
    error "Falha ao criar backup custom"
    exit 1
fi

# Verificar integridade do backup
log "Verificando integridade do backup..."

if pg_restore --list "$BACKUP_DIR/$BACKUP_FILE.custom" > /dev/null 2>&1; then
    log "Backup custom verificado com sucesso"
else
    error "Backup custom corrompido!"
    exit 1
fi

# Calcular tamanho dos backups
CUSTOM_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE.custom" | cut -f1)
SQL_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)

log "Tamanho do backup custom: $CUSTOM_SIZE"
log "Tamanho do backup SQL comprimido: $SQL_SIZE"

# Limpeza de backups antigos
log "Removendo backups antigos (mais de $RETENTION_DAYS dias)..."

find "$BACKUP_DIR" -name "ilyra_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "ilyra_backup_*.custom" -mtime +$RETENTION_DAYS -delete

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "ilyra_backup_*" | wc -l)
log "Backups restantes: $REMAINING_BACKUPS"

# Estatísticas do banco
log "Coletando estatísticas do banco de dados..."

STATS=$(psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
")

echo "$STATS" > "$BACKUP_DIR/stats_${TIMESTAMP}.txt"
log "Estatísticas salvas em: stats_${TIMESTAMP}.txt"

# Criar manifest do backup
cat > "$BACKUP_DIR/manifest_${TIMESTAMP}.json" << EOF
{
    "timestamp": "$TIMESTAMP",
    "database": "$POSTGRES_DB",
    "backup_files": {
        "custom": "$BACKUP_FILE.custom",
        "sql_compressed": "$BACKUP_FILE.gz"
    },
    "sizes": {
        "custom": "$CUSTOM_SIZE",
        "sql_compressed": "$SQL_SIZE"
    },
    "retention_days": $RETENTION_DAYS,
    "remaining_backups": $REMAINING_BACKUPS
}
EOF

log "Manifest criado: manifest_${TIMESTAMP}.json"

# Notificação de sucesso
log "✅ Backup concluído com sucesso!"
log "Arquivos criados:"
log "  - $BACKUP_FILE.custom ($CUSTOM_SIZE)"
log "  - $BACKUP_FILE.gz ($SQL_SIZE)"
log "  - stats_${TIMESTAMP}.txt"
log "  - manifest_${TIMESTAMP}.json"

# Opcional: Enviar notificação (webhook, email, etc.)
if [ ! -z "$BACKUP_WEBHOOK_URL" ]; then
    curl -X POST "$BACKUP_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"✅ Backup iLyra concluído com sucesso!\",
            \"timestamp\": \"$TIMESTAMP\",
            \"database\": \"$POSTGRES_DB\",
            \"size_custom\": \"$CUSTOM_SIZE\",
            \"size_sql\": \"$SQL_SIZE\"
        }" || warning "Falha ao enviar notificação webhook"
fi

exit 0
