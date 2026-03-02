#!/bin/bash

# Script para configurar Webhook do Supabase para Invalidação de Cache
# 
# Uso: ./scripts/setup-webhook.sh
#
# Requer: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e WEBHOOK_SECRET

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Configurando Webhook do Supabase para Invalidação de Cache${NC}\n"

# Verificar variáveis de ambiente
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ Erro: SUPABASE_URL não definida${NC}"
    echo "Defina: export SUPABASE_URL=https://seu-projeto.supabase.co"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Erro: SUPABASE_SERVICE_ROLE_KEY não definida${NC}"
    echo "Defina: export SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role"
    exit 1
fi

if [ -z "$WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}⚠️  WEBHOOK_SECRET não definida, usando padrão 'dev-secret'${NC}"
    WEBHOOK_SECRET="dev-secret"
fi

# URL do webhook (ajustar conforme seu domínio)
WEBHOOK_URL="${WEBHOOK_URL:-http://localhost:3000/api/cache/revalidate}"

echo -e "${GREEN}📋 Configuração:${NC}"
echo "  SUPABASE_URL: $SUPABASE_URL"
echo "  WEBHOOK_URL: $WEBHOOK_URL"
echo "  WEBHOOK_SECRET: $WEBHOOK_SECRET"
echo ""

# Tabelas para monitorar
TABLES=("modulos_estudo" "historico_questoes" "flowcharts" "exam_contents")

echo -e "${YELLOW}📝 Instruções para Configuração Manual:${NC}\n"
echo "1. Acesse o Supabase Dashboard: https://app.supabase.com"
echo "2. Vá em Database → Webhooks"
echo "3. Clique em 'Create a new webhook'"
echo ""
echo "Para cada tabela, configure:"
echo ""

for TABLE in "${TABLES[@]}"; do
    echo -e "${GREEN}Tabela: $TABLE${NC}"
    echo "  Name: Invalidate Cache - $TABLE"
    echo "  Table: $TABLE"
    echo "  Events: INSERT, UPDATE, DELETE"
    echo "  Type: HTTP Request"
    echo "  URL: $WEBHOOK_URL"
    echo "  HTTP Method: POST"
    echo "  HTTP Headers:"
    echo "    Authorization: Bearer $WEBHOOK_SECRET"
    echo "    Content-Type: application/json"
    echo "  HTTP Body:"
    echo "    {"
    echo "      \"table\": \"$TABLE\","
    echo "      \"event\": \"{{event}}\""
    echo "    }"
    echo ""
done

echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo -e "${YELLOW}💡 Dica: Teste o webhook com:${NC}"
echo "curl -X POST $WEBHOOK_URL \\"
echo "  -H 'Authorization: Bearer $WEBHOOK_SECRET' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"table\": \"modulos_estudo\", \"event\": \"INSERT\"}'"
