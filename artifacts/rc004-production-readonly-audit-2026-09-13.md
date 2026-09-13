# RC004 — Auditoria operacional read-only de Production

**Data:** 2026-09-13  
**Autorização:** `AUTHORIZE_RC004_PRODUCTION_READONLY_AUDIT=YES`  
**Baseline operacional:** `SAFE_FROZEN_OFF`  
**Escopo:** leitura de deployment/configuração Vercel Production, estado lógico das flags RC004/commercial (sem revelar secrets), confirmação read-only do Supabase Production target, relatório pós-merge.

**Não autorizado / não executado:** alterar env, deploy, migration, binding, Production write, rollout RC004, leitura ou exposição de tokens/secrets.

---

## Resumo executivo

A auditoria read-only confirma que o merge do PR #126 (`0b8b3e30`) está deployado em **Production** na Vercel, com domínios canônicos ativos, enquanto **binding** e **rollout comercial** permanecem **OFF**. Nenhuma flag RC004/commercial está configurada no ambiente Production. Não há caminho automatizado que execute `rc004:binding-only`.

**Resultado:** `POST_MERGE_OPERATIONAL_AUDIT=PASS`

---

## Critérios de encerramento

| Campo | Resultado |
|-------|-----------|
| `MERGE_COMMIT` | `0b8b3e305da8bfdd68037df54ccaacde083edf70` (`0b8b3e30`) |
| `VERCEL_ENVIRONMENT` | **PRODUCTION** |
| `VERCEL_DEPLOYMENT_ID` | `dpl_9zS61t5MvJePERo2aRNgedVNZD7u` |
| `VERCEL_DEPLOYMENT_STATUS` | `READY` |
| `VERCEL_PRODUCTION_DOMAINS` | `www.avant.enf.br`, `avant.enf.br`, `flowmedix.vercel.app`, aliases `flowmedix-git-main-*` |
| `COMMERCIAL_RUNTIME_READINESS_GATE` | **ABSENT** → efetivo **OFF** |
| `RC004_BINDING_ONLY_APPLY_ARCHITECTURE_APPROVED` | **ABSENT** |
| `RC004_BINDING_ONLY_CAS_LIVE_VALIDATED` | **ABSENT** (informativo) |
| `AUTOMATED_BINDING_EXECUTION` | **NONE** |
| `PRODUCTION_BINDING_EXECUTED` | **NO** |
| `PRODUCTION_WRITES` | **0** (durante esta auditoria) |
| `RC004_CODE_IN_MAIN` | **YES** |
| `RC004_BINDING_OPERATION` | **OFF** |
| `RC004_COMMERCIAL_ROLLOUT` | **OFF** |
| `POST_MERGE_OPERATIONAL_AUDIT` | **PASS** |

### Estado operacional congelado

`
RC004_CODE_IN_MAIN=YES
RC004_BINDING_OPERATION=OFF
RC004_COMMERCIAL_ROLLOUT=OFF
PRODUCTION_BINDING_AUTHORIZED=NO
CAN_APPLY_NOW=NO
CODE_SAFETY=CONFIRMED
AUTOMATED_BINDING_PATH=NONE_FOUND
POST_MERGE_OPERATIONAL_AUDIT=PASS
BASELINE=SAFE_FROZEN_OFF
`

---

## Vercel — deployment do merge

O commit `0b8b3e30` (merge PR #126, branch `main`) foi deployado como **Production**, não Preview.

| Atributo | Valor |
|----------|-------|
| Projeto | `flowmedix` (`prj_JQl6DT8ZO9ZS5U605ArlChAWdzXN`) |
| Team | `gvvariedades-makers-projects` |
| Deployment ID | `dpl_9zS61t5MvJePERo2aRNgedVNZD7u` |
| Target | `production` |
| Status | `READY` |
| Commit SHA | `0b8b3e305da8bfdd68037df54ccaacde083edf70` |
| Branch | `main` |
| Mensagem | `Merge PR #126: RC004 binding-only commercial approval writer` |
| Inspector | https://vercel.com/gvvariedades-makers-projects/flowmedix/9zS61t5MvJePERo2aRNgedVNZD7u |

### Domínios / aliases Production

- https://www.avant.enf.br
- https://avant.enf.br
- https://flowmedix.vercel.app
- https://flowmedix-gvvariedades-makers-projects.vercel.app
- https://flowmedix-git-main-gvvariedades-makers-projects.vercel.app

### Nota sobre deployments mais recentes

Existe deployment **posterior** (`dpl_8YiGRuqqzBnJ2PF8K2A7CvhBmnif`, Dependabot PR #127) com `target: null` (Preview). Ele **não** substitui Production; os domínios canônicos permanecem no deployment `0b8b3e30`.

---

## Vercel — flags RC004/commercial

Verificação dupla, **sem exibir valores de secrets**:

1. **`vercel env ls production`** — inventário completo do projeto: as três flags abaixo **não aparecem** na lista de variáveis de Production (nem Preview).
2. **`vercel env run -e production`** — probe do runtime efetivo no ambiente Production:

| Variável | Estado lógico |
|----------|---------------|
| `COMMERCIAL_RUNTIME_READINESS_GATE` | **ABSENT** |
| `RC004_BINDING_ONLY_APPLY_ARCHITECTURE_APPROVED` | **ABSENT** |
| `RC004_BINDING_ONLY_CAS_LIVE_VALIDATED` | **ABSENT** |

### Semântica no código

Em `lib/catalogMigration/commercialRuntimeGate.ts`:

- Ausente ou `false` / `0` / `off` → gate **OFF** (P0 denylist e gates estruturais continuam ativos).
- `true` / `1` / `on` → gate **ON** (production_ready + ready_100 + fingerprint no runtime).

**Conclusão:** merge ≠ rollout. O código RC004 está em Production; o enforcement comercial em runtime permanece desligado.

---

## Supabase Production — identidade

| Campo | Valor |
|-------|-------|
| `SUPABASE_PROJECT_REF` (canônico docs/ops) | `ozgouenqrofnvgrlgfwd` |
| `SUPABASE_URL` | https://ozgouenqrofnvgrlgfwd.supabase.co |
| `NEXT_PUBLIC_SUPABASE_URL` (Production Vercel) | **MATCH** com ref `ozgouenqrofnvgrlgfwd` |
| Migrations aplicadas nesta auditoria | **0** |
| Queries de binding/catálogo | **não executadas** |

---

## Pós-merge — ausência de automação de binding

| Vetor | Resultado |
|-------|-----------|
| `.github/workflows/*` | Nenhum job chama `rc004:binding-only` |
| `vercel.json` crons | Apenas matrículas, simulado-retention, weekly generate — **sem RC004** |
| `package.json` script `rc004:binding-only` | Existe, mas **somente invocação manual CLI** |
| Writer apply | Exige `--apply`, `--confirm-production-binding`, flag explícita e target hash |

### Código em `main`

- `lib/catalogMigration/rc004BindingOnly.ts` — writer binding-only
- `lib/catalogMigration/bindingOnlyDiff.ts` — allowlist metadata comercial
- `lib/catalogMigration/commercialRuntimeGate.ts` — runtime gate opt-in
- `scripts/rc004-binding-only.ts` — entrypoint CLI (default DRY-RUN)

---

## Auditoria de código (contexto pré-operacional)

Concluída na mesma fase RC004, antes desta auditoria operacional:

- Writer invocado apenas via CLI manual, harness Test F e testes.
- Default: **DRY-RUN**.
- `RC004_BINDING_ONLY_CAS_LIVE_VALIDATED` é evidência, não hard gate de apply.
- Nenhum cron/workflow/API auto-executa binding.

**Risco residual antes desta auditoria:** configuração externa (Vercel env), não código. Esta auditoria removeu essa incerteza.

---

## RC004 Production Binding — Phase 1 (futuro)

Quando o Project Owner decidir binding real em Production, tratar como **fase nova e separada**, com preflight próprio. **Não reutilizar** automaticamente a autorização desta auditoria read-only.

### Pré-requisitos antes de qualquer write

1. `main`/Production SHA conhecido e sem drift relevante.
2. Catálogo Production atualizado (read-only).
3. Manifest gerado a partir do **fingerprint da linha live Supabase** — nunca do arquivo local.
4. Cohort explicitamente delimitada.
5. Reviewer humano explicitamente definido.
6. Target hash Production conferido.
7. Dry-run completo imediatamente antes do apply.
8. Autorização do Project Owner **específica para aquela cohort**.
9. Plano de observação pós-write.

### Invariante: binding ≠ rollout comercial

- **Binding** e **rollout runtime** são operações **independentes**.
- Mesmo após binding bem-sucedido, **não** ligar `COMMERCIAL_RUNTIME_READINESS_GATE` automaticamente.
- Rollout comercial exige decisão e autorização próprias.

### Autorização sugerida (futura, não vigente)

`
AUTHORIZE_RC004_PRODUCTION_BINDING_PHASE1=YES
COHORT=<delimitação explícita>
REVIEWER=<identidade humana>
TARGET_HASH=<hash conferido>
`

---

## Referências

- PR mergeado: #126 — RC004 binding-only commercial approval writer
- Merge commit: `0b8b3e305da8bfdd68037df54ccaacde083edf70`
- Repo: `gvvariedades-maker/flowmedix`
- Vercel project: `flowmedix`
- Supabase ref: `ozgouenqrofnvgrlgfwd`

---

## Changelog do artefato

| Data | Evento |
|------|--------|
| 2026-09-13 | Auditoria read-only executada; baseline `SAFE_FROZEN_OFF` registrado; `POST_MERGE_OPERATIONAL_AUDIT=PASS` |
