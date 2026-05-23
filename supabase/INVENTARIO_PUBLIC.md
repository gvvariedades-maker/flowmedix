# Inventário — schema `public` (AVANT)

Última atualização: alinhado ao Supabase de produção e ao código em `lib/`, `app/api/`.

## Tabelas ativas (núcleo do produto)

| Tabela | Uso |
|--------|-----|
| `modulos_estudo` | Catálogo de questões, laboratório, cache, estudo |
| `historico_questoes` | Tentativas, desempenho, plano de revisão |
| `study_notebooks` / `study_notebook_items` | Cadernos do aluno |
| `concursos` / `concurso_modulos` / `concurso_matriculas` | Catálogo, vínculos, entitlements |
| `concurso_purchases` | Checkout Stripe + webhook |
| `lp_templates` / `lp_pages` | Landings de concurso |
| `email_templates` | CMS de e-mails (admin, service role) |
| `invite_links` / `invite_redemptions` | Convites Pro temporário (service role) |
| `acessos` | Auditoria Campina Grande + migração legada para matrícula |

Não remova estas tabelas sem migrar o app.

## Tabelas legadas (não existem no banco)

O código **não** referencia mais: `flowcharts`, `exam_contents`, `enrollments`, `exams`, `profiles`, `modules`.

Rotas removidas: `/api/fluxogramas`, `/api/admin/enrollments`.

## RPCs sensíveis

Apenas `service_role` pode executar:

- `admin_get_auth_user_id_by_email`
- `expire_concurso_matriculas`
- `fulfill_concurso_purchase`
- `invalidate_cache_via_webhook`

Migration: `20260523180000_revoke_public_rpc_execute.sql`.

## O que não apagar

- Schema **`auth.*`**: Supabase Auth.
- **`storage.*`**, **`realtime.*`**, extensões do projeto: infraestrutura Supabase.
