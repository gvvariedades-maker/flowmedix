# Security Closure — Row Level Security (RLS)

**Status:** `RLS: PASS`  
**Data de Fechamento:** 2026-08-24  
**Ambiente Alvo:** Supabase Production (`ozgouenqrofnvgrlgfwd.supabase.co`)  
**Commit SHA Base:** `7fc5776d90dfb6e1c06cf8ba470522567eef7d21` (origin/main)  
**Lotes de Sustentação:** 7D.1 (Anon Boundary) · 7D.2 (Auth Discovery) · 7D.2A (Auth Health) · 7D.2B (Live Ownership & Cross-User Proof)

---

## 1. Sumário Executivo

O bloco de segurança e isolamento por **Row Level Security (RLS)** do AVANT encontra-se formalmente **ENCERRADO como PASS**.

Todas as exigências de isolamento de tenant/usuário, limites de acesso anônimo, proteção de conteúdo por matrícula, restrição de mutação na camada de aplicação e bloqueio de funções administrativas em nível de banco de dados foram rigorosamente comprovadas por meio de suítes de testes automatizados e evidências ao vivo em Supabase Production com ciclo de vida atômico e 100% de limpeza residual.

---

## 2. Escopo Validado

1. **Limites de Acesso Anônimo (7D.1):**
   - Tabelas sensíveis (`modulos_estudo`, `historico_questoes`, `concurso_matriculas`, `stripe_webhook_events`, `email_templates`, `invite_links`) retornam 0 linhas para qualquer chamada `anon`.
   - RPCs internas (`invalidate_cache_via_webhook`, `get_vitrine_page`, `expire_concurso_matriculas`) possuem `REVOKE EXECUTE` de `PUBLIC` e `anon`.

2. **Isolamento de Leitura e Ownership (7D.2B):**
   - Usuário autenticado visualiza estritamente seus próprios registros em `concurso_matriculas` e `historico_questoes` via predicado otimizado `(select auth.uid()) = user_id`.

3. **Bloqueio Cross-User / Prevenção de IDOR (7D.2B):**
   - Consultas diretas autenticadas por chave primária a registros pertencentes a outro usuário retornam 0 linhas tanto para matrículas quanto para históricos.

4. **Autorização de Conteúdo por Matrícula (7D.2B):**
   - Policy `modulos_estudo_select_enrolled_only` assegura que um aluno só acessa o `conteudo_json` de módulos vinculados a concursos em que possui matrícula com status `ativo` e vigente. Tentativas de acesso a módulos de outros concursos retornam 0 linhas.

5. **Bloqueio de RPCs Administrativas para Autenticados (7D.2B):**
   - Tentativa de execução de `invalidate_cache_via_webhook` por usuário autenticado não-admin resulta em `42501 permission denied for function invalidate_cache_via_webhook`.

6. **Prova Inversa de Sanidade (7D.2B):**
   - Execução simétrica cruzada comprovando que a política é bidirecionalmente estrita.

7. **Isolamento na Camada Server-Side:**
   - Testes de integração em `__tests__/security/` validam que rotas como `POST /api/registrar-tentativa` e leituras em `lib/cache.ts` ignoram `user_id` arbitrário fornecido no payload, vinculando-se unicamente à sessão autenticada.

---

## 3. Matriz de Evidências

| Controle | Evidência / Artefato | Resultado |
| :--- | :--- | :--- |
| **RLS ativo nas tabelas críticas** | `scripts/rls-performance-smoke.ts` · `__tests__/security/anon-rls-contract.test.ts` | **PASS** |
| **Limites anônimos (7D.1)** | Supabase Production `ozgouenqrofnvgrlgfwd` · Contratos `rlsAnonExpectations.ts` | **PASS** |
| **Isolamento de leitura (Ownership)** | Live 7D.2B (`USER_A_OWN_MATRICULA_VISIBLE`, `USER_A_OWN_HISTORY_VISIBLE`) | **PASS** |
| **Bloqueio Cross-User (IDOR)** | Live 7D.2B (`USER_A_CANNOT_READ_USER_B_MATRICULA`, `USER_A_CANNOT_READ_USER_B_HISTORY`) | **PASS** |
| **Autorização de Conteúdo (Matrícula)** | Live 7D.2B (`ENROLLED_USER_CAN_READ_AUTHORIZED_MODULE`, `UNENROLLED_USER_CANNOT_READ_MODULE`) | **PASS** |
| **Bloqueio RPC Administrativa** | Live 7D.2B (`AUTHENTICATED_CANNOT_EXECUTE_ADMIN_RPC` — Code 42501) | **PASS** |
| **Prova Inversa de Sanidade** | Live 7D.2B (`USER_B_INVERSE_SANITY_PROOF`) | **PASS** |
| **Isolamento de Escrita (Server API)** | `__tests__/security/historico-idor.test.ts` (ignora payload arbitrário) | **PASS** |
| **Proteção de Rotas Admin** | `__tests__/security/admin-forbid-aluno.test.ts` (403 para não-admin) | **PASS** |
| **Zero Resíduos de Fixtures** | Live 7D.2B Auditoria Pós-Cleanup (`VERIFIED 100% CLEAN`) | **PASS** |
| **Ausência de Drift de Policies/Schema** | `git status --short` limpo · Paridade com migrations consolidadas | **PASS** |
| **Usuários Legados em `auth.users`** | Dívida técnica controlada isolada (`AUTH_LEGACY_USER_NULL_FIELDS_REPAIR_PENDING`) | **OUT OF SCOPE** |

---

## 4. Dívida Controlada: Usuários Legados (`auth.users`)

- **Identificação:** 2 registros em `auth.users` criados em dezembro de 2025 (anteriores à migração `20260516174644_fix_auth_users_email_change_null.sql`).
- **Classificação:** `Controlled Debt / Out of Scope` (Dívida Técnica Controlada).
- **Inconsistência Conhecida:** Campos opcionais de texto/token com valor `NULL` que acionam erro de scan do Go SQL driver durante listagem paginada em lote no endpoint administrativo GoTrue `/auth/v1/admin/users`.
- **Impacto em RLS:** **Nenhum (ZERO)**. O isolamento de Row Level Security do PostgreSQL é avaliado diretamente sobre as claims do JWT de sessão (`request.jwt.claims -> sub`) via `auth.uid()`, sem qualquer dependência da paginação administrativa do GoTrue. Consultas pontuais (`getUserById`) e usuários modernos operam com 100% de integridade.
- **Justificativa de Não-Mutação:** A eventual padronização desses 2 registros exigiria comando `UPDATE auth.users`, o que violaria o princípio de integridade e não-mutação de dados de produção sem autorização e migração dedicada.
- **Garantia de Integridade:** Nenhuma alteração foi executada em `auth.users` neste lote. Qualquer intervenção futura deverá ocorrer em lote operacional independente com aprovação explícita e plano de rollback.

---

## 5. Cláusula de Decisão e Fechamento

> **Decisão Formal:**  
> O bloco de segurança **Row Level Security (RLS)** permanece formalmente **ENCERRADO como PASS**.  
>  
> Este bloco **NÃO DEVERÁ SER REABERTO** sem nova evidência objetiva de regressão, bypass prático comprovado, alteração de policies/migrations ou fato técnico que desconstitua as provas e auditorias registradas.

---

## 6. Próximo Passo Recomendado

- **Lote Recomendado:** `7E.0 — Production Observability / Sentry Evidence Audit`
