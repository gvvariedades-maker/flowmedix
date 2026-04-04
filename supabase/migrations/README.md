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

### `unique_content_hash_modulos_estudo.sql`

**Quando executar:** Depois que o AVANT já usa `content_hash` em `modulos_estudo` e você quer garantir no banco que o mesmo enunciado (mesmo hash) não seja inserido duas vezes. A API do app já bloqueia duplicatas; este índice evita corrida entre requisições.

**Antes de rodar — conferir duplicatas existentes** (SQL Editor → New Query → Run):

```sql
SELECT content_hash, COUNT(*) AS qtd
FROM modulos_estudo
WHERE content_hash IS NOT NULL
GROUP BY content_hash
HAVING COUNT(*) > 1;
```

- Se **não retornar linhas**, pode aplicar a migração abaixo com segurança.
- Se **retornar linhas**, é preciso decidir qual registro manter por `content_hash` e apagar ou corrigir os extras **antes** de criar o índice único (senão o `CREATE UNIQUE INDEX` falha).

**Aplicar a migração:** copie o conteúdo de `unique_content_hash_modulos_estudo.sql` e execute no **SQL Editor** (mesmo fluxo das outras migrações).

**Via Supabase CLI** (projeto já com `supabase link`):

```bash
npx supabase db push
```

(Envia as migrações pendentes para o banco remoto ligado ao projeto.)
