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

## Rollback e recuperação pós-deploy

> **Não confundir** contingência de **disponibilidade** com retorno a um **estado seguro**. O artefato de produção conhecido (`8b942cf0`) carrega `next@^16.2.11`, `sharp@^0.35.3` e `js-yaml@3.15.1` — versões **vulneráveis** que motivaram este hotfix. Redeploy de `8b942cf0` ou `git revert` deste hotfix **não** é recuperação segura; é rollback **para superfície de ataque conhecida**.

### Tipos de ação

| Tipo | Quando usar | Estado de segurança |
|------|-------------|---------------------|
| **Forward-fix** (preferido) | Falha funcional após deploy do hotfix | Mantém ou avança patches de segurança |
| **Recuperação segura** | Incidente com artefato corrigido disponível | Implanta commit com `next@≥16.3.4`, `sharp@≥0.35.4`, `js-yaml@≥3.15.2` |
| **Rollback emergencial de disponibilidade** | Indisponibilidade total (P0) sem hotfix estável à mão | **Vulnerável** — exige decisão explícita de incidente |

### Rollback emergencial (somente incidente P0)

1. **Decisão:** incident commander + owner registram aceitação do risco (GHSA Next RCE, sharp/libheif, js-yaml).
2. **Mitigação temporária:** WAF/rate-limit em `/_next/image`, bloqueio de uploads AVIF se aplicável, monitoramento reforçado.
3. **Ação:** redeploy do artefato anterior **somente** para restaurar serviço — documentar SHA implantado e horário.
4. **Correção prioritária:** forward-fix ou redeploy do hotfix corrigido em SLA acordado (não deixar vulnerável como estado final).

### Recuperação segura (pós-deploy do hotfix)

1. **Confirmar artefato implantado:** SHA do deployment (Vercel/GitHub) = commit com este hotfix (não assumir preview).
2. **Verificar versões efetivas** no ambiente (build log ou `npm ls next sharp` no artefato):
   - `next@16.3.4` ou superior patch corrigido
   - `sharp@0.35.4` ou superior
   - `js-yaml@3.15.2` via cadeia `gray-matter` (build-time)
3. **Smoke pós-deploy (rotas essenciais):**
   - `/` e `/login` — 200, sem 5xx
   - `/estudar` — vitrine carrega
   - `/blog` e um post — frontmatter MDX parse OK
   - `/_next/image` — otimização de imagem (1 URL conhecida)
4. **Monitoramento (30–60 min):** erros 5xx, Sentry, falhas de build/runtime em image optimization.
5. **Critérios de escalonamento:** taxa de 5xx acima do baseline, falha massiva em `/_next/image`, regressão auth — acionar eng + reverter disponibilidade **com** registro de incidente.

### Forward-fix (falha parcial do hotfix)

1. Branch a partir do commit implantado; corrigir causa funcional **sem** reverter bumps de segurança.
2. Gates: `npm audit --omit=dev --audit-level=high`, build, test-unit, smoke acima.
3. Novo deploy com SHA documentado.

### Reversão de overrides dev (não confundir com rollback de prod)

- `brace-expansion@1.1.18` — somente dev/CI (ESLint); reverter **aumenta** risco em pipelines, não afeta runtime aluno.
- `undici@6.28.0` sob `@connectrpc/connect-node` — somente tooling `pipeline:orchestrate --sdk`; ver seção SDK abaixo.

---

## Compatibilidade `@cursor/sdk` / `undici` (hotfix deps-only)

### Escopo no hotfix

| Item | Runtime produção (aluno) | Incluído no hotfix? |
|------|--------------------------|---------------------|
| `next` / `sharp` / `js-yaml` | **Sim** | **Sim** — motivação principal |
| `brace-expansion` override | Não (ESLint dev/CI) | Sim — corrige high em `npm audit` completo |
| `undici@6.28.0` override | Não — `@cursor/sdk` é `devDependency`; ausente em `app/` bundle | Sim — mitiga GHSA na cadeia connect-node |
| Bump `@cursor/sdk` 1.0.24→1.0.31 | Não | **Não** — pin mantido em `1.0.24`; bump no lock foi incidental e foi revertido |

### Resolução efetiva (após hotfix)

| Pacote | Declarado | Efetivo (lock) | Notas |
|--------|-----------|----------------|-------|
| `@cursor/sdk` | `1.0.24` (pin) | `1.0.24` | Orquestrador opcional; `pipeline:sdk-check` |
| `@connectrpc/connect-node` | transitivo | `1.7.0` | `undici: ^5.28.4` declarado; override força `6.28.0` |
| `undici` | override `6.28.0` | `6.28.0` | `engines.node: >=18.17` |
| Node CI (`.github/workflows/test.yml`) | — | `20` | Runtime Next/sharp/js-yaml |
| Node exigido por `@cursor/sdk` | — | `>=22.13` | **Pré-existente**; SDK não roda no CI de testes |

### Justificativa do override `undici`

- **Necessário ao hotfix?** Não para runtime de produção; **sim** para `npm audit --audit-level=high` **completo** (dev) e consistência com ADR RC-004.
- **Alternativa rejeitada:** `npm audit fix --force` — pode quebrar árvore.
- **Não é prova de compatibilidade:** audit zerado ≠ fluxo SDK end-to-end validado.

### Evidência offline (sem `CURSOR_API_KEY`)

Executar localmente após `npm ci`:

```bash
npm run pipeline:sdk-check   # falha esperada sem API key; import do SDK deve carregar
node -e "require('undici'); console.log('undici', require('undici/package.json').version)"
```

**Limitações:** smoke de **import** e versão resolvida; não cobre `Agent.prompt` nem transporte Connect contra API Cursor. CI geral (Node 20) **não** executa orquestrador SDK.

### Risco residual P2

- **Node 20 (CI) vs SDK engines `>=22.13`:** divergência documentada; operadores devem usar Node ≥22.13 para `pipeline:orchestrate --sdk` (ver `docs/PIPELINE_SDK_SETUP.md`).
- **Separação futura:** se o pin SDK/undici gerar conflito, abrir PR dedicado `chore/sdk-undici` — **fora** deste hotfix de runtime.

### O que NÃO fazer neste hotfix

- Copiar `scripts/commercial-approval-backfill-dry-run.ts` ou entradas RC-004 de `package.json`.
- Tratar redeploy de `8b942cf0` como plano de rollback seguro.

