# ADR — Riscos de dependência RC-004 (brace-expansion + undici)

**Data:** 2026-09-08  
**Status:** proposto — undici mitigado via override `6.28.0` (2026-09-08 worktree RC-004c)  
**Escopo:** worktree `codex/commercial-enforcement-integration` · gate `npm audit --audit-level=high`  
**Relacionado:** [`DECISAO_AUTO_APROVACAO_RISCO.md`](DECISAO_AUTO_APROVACAO_RISCO.md) · [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md)

---

## Contexto

Após `npm audit fix` (sem `--force`), permaneciam vulnerabilidades em três cadeias (corrigidas 2026-09-08 RC-004 security closure):

1. `brace-expansion` (via `minimatch@3` → ESLint) — **corrigido** via override `1.1.18`
2. `undici@5.29.0` (via `@connectrpc/connect-node` → `@cursor/sdk`) — **mitigado** via override `undici@6.28.0`
3. `next@16.2.11` + `sharp@0.35.3` + `js-yaml@3.15.1` (gray-matter) — **corrigido** via bump mínimo:
   - `next@16.3.4` (GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4)
   - `sharp@0.35.4` (GHSA-rgj7-g3m4-5g8c / libheif)
   - `js-yaml@3.15.2` override em gray-matter (GHSA-2883-xcg3-v3hh)

`npm audit` e `npm audit --audit-level=high` → **0 vulnerabilities** (worktree integração, 2026-09-08).

---

## Matriz de advisories (6 high reportados)

| Cadeia | Pacote instalado | Advisories (resumo) | Fix upstream | Runtime |
|--------|------------------|---------------------|--------------|---------|
| Next.js | `next@16.3.4` + `sharp@0.35.4` | GHSA-p293, GHSA-2xp9 (RCE Windows / AVIF Image Optimization) | bump patch 16.3.4 | **Runtime prod** — `/_next/image`, SSR/SSG |
| ESLint | `brace-expansion@1.1.18` (override) | GHSA-f886, 3jxr, mh99, rgw5 | override | **Dev/CI** |
| Cursor SDK | `undici@6.28.0` (override) | GHSA undici ≤6.27 | override | **Scripts locais/CI** |
| gray-matter | `js-yaml@3.15.2` (override) | GHSA-2883-xcg3-v3hh | override | **Build-time** — `content/blog` frontmatter |

**Nota:** os 11 GHSA de `undici` contam como **1 causa-raiz** no audit (1 pacote vulnerável).

---

## Evidência — `@cursor/sdk` fora do bundle de produção

| Verificação | Resultado |
|-------------|-----------|
| `import '@cursor/sdk'` em `app/` | **Ausente** |
| Uso em runtime Next | **Ausente** — apenas `lib/catalogMigration/pipelineOrchestrator.ts` (dynamic import) |
| Outros consumidores | `scripts/pipeline-sdk-check.ts`, shim `types/cursor-sdk-shim.d.ts` |
| `next.config` / server externals | Sem referência ao SDK |
| Dependência em `package.json` | `devDependencies` implícito via scripts; pacote em `dependencies` para orquestrador opcional |

**Caminho de exposição real:** operador executa `npm run pipeline:orchestrate -- --sdk` com `CURSOR_API_KEY` — cliente HTTP fala com API Cursor via undici.  
**Entrada não confiável:** respostas HTTP da API Cursor (rede externa). Não é superfície do aluno nem Route Handler público.

**Mitigação operacional:**

- Não executar orquestrador SDK em hosts compartilhados sem necessidade.
- `CURSOR_API_KEY` somente em CI/operador autorizado (secret, não em `.env` de preview aluno).
- Revisar trimestralmente changelog `@cursor/sdk` / `@connectrpc/connect-node`.

---

## Evidência — `brace-expansion` / ESLint

| Verificação | Resultado |
|-------------|-----------|
| Cadeia | `eslint@9.39.4` → `minimatch@3.1.5` → `brace-expansion` |
| Override anterior | `minimatch@3` pinava `brace-expansion@1.1.12` (**vulnerável**) |
| Correção aplicada | Override → `brace-expansion@1.1.18` em `package.json` |
| Exposição | `eslint .` em dev/CI — padrões glob de lint, não input de aluno |
| Entrada não confiável | Baixa — globs definidos no repositório |

**Risco residual:** se futuro plugin passar glob controlado por terceiros ao ESLint, revisar. Hoje: **baixo**.

---

## Decisão proposta

| Item | Ação |
|------|------|
| `brace-expansion` | **Corrigir** via override `1.1.18` + `npm install` + regressão lint/test |
| `undici` | **MITIGADO** — override `6.28.0` sob `@connectrpc/connect-node`; regressão `pipeline:sdk-check` (load) OK |
| Aceitação undici residual | **N/A** se audit high = 0 — rever trimestralmente quando `@cursor/sdk` atualizar connect-node |

### Aceitação de risco undici (template — não assinado)

| Campo | Valor proposto |
|-------|----------------|
| Responsável pela aceitação | **Project Owner** (pendente) |
| Prazo de revisão | **2026-12-08** (90 dias) |
| Condição de reabertura | `npm audit` sem high em `undici` **ou** remoção/substituição de `@cursor/sdk` |
| Alternativa | Orquestrador sem SDK (IDE-only); ou pin quando upstream publicar undici ≥6.28 |
| Risco residual | DoS/smuggling no **cliente** do pipeline SDK — não afeta app aluno |

---

## O que NÃO fazer

- `npm audit fix --force`
- `.npmrc` ignore genérico para obter PASS falso
- Declarar `SECURITY_AUDIT=PASS` com audit falhando

---

## Rollback

- Reverter override `brace-expansion` em `package.json` + `package-lock.json`
- Remover `@cursor/sdk` se orquestrador SDK for descontinuado (impacto: `pipeline:orchestrate --sdk`)

