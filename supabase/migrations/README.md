# Migrações do Banco de Dados

Este diretório contém scripts de migração SQL para atualizar o schema do banco de dados Supabase.

## Como executar uma migração

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor** (no menu lateral)
3. Clique em **New Query**
4. Cole o conteúdo do arquivo de migração desejado
5. Clique em **Run** para executar

## Migrações disponíveis

### `add_modulo_nome_to_modulos_estudo.sql`
Adiciona a coluna `modulo_nome` (TEXT) na tabela `modulos_estudo` para permitir agrupamento de módulos por nome.

**Quando executar:** Execute esta migração antes de usar a funcionalidade de agrupamento por módulo no dashboard.

**O que faz:**
- Adiciona a coluna `modulo_nome` na tabela `modulos_estudo`
- Cria um índice para melhorar performance nas consultas
- Adiciona comentário de documentação na coluna

**Nota:** Se a coluna já existir, o script não causará erro (usa `IF NOT EXISTS`).
