# NeuroCanvas — runbook de auditoria

Auditoria read-only do catálogo editorial + resolver de slides. **Não altera** manifests, registry, runtime do player nem Supabase.

## Proibido

**Nunca** executar `npm run audit:neurocanvas` — esse comando **não existe**.

## CI e testes herméticos

A suíte Jest em `__tests__/lib/neurocanvas/` é **hermética**:

- usa fixtures temporárias (`materializeCatalogFixture()` em `tmpdir`);
- **não lê** `data/catalog-migration` (gitignored);
- funciona em runner vazio;
- duração de poucos segundos;
- suíte hermética; snapshot atual: **14 testes** (8 em `audit.test.ts` + 4 em `portablePath.test.ts` + 2 em `preflightParity.test.ts`);
- nunca produz falso verde por catálogo ausente — há teste explícito de baseline vazia.

O job `test-unit` do CI executa `npm test`, que **inclui naturalmente** essa suíte (não há job dedicado a `test:neurocanvas`). O atalho abaixo é **somente conveniência local** para rodar só NeuroCanvas:

```bash
npm run test:neurocanvas
# equivalente:
npx jest __tests__/lib/neurocanvas --runInBand
```

## Paridade local (filesystem, pesada)

Requer catálogo real exportado em `data/catalog-migration/**/questions/`. **Nunca** roda no CI.

```bash
npm run neurocanvas:parity-local
```

Sequência (após preflight):

1. `preflight:neurocanvas-parity` — aborta com exit ≠ 0 se não houver JSON em `questions/`
2. `audit:neurocanvas-catalog`
3. `audit:neurocanvas-duplicates`
4. `audit:neurocanvas-blockers`
5. `audit:neurocanvas-baseline-impact`
6. `audit:resolve-slide-presentation -- --source=catalog`
7. `generate:neurocanvas-audit-report-data`
8. `write:neurocanvas-audit-report`

**Ausência de catálogo:** o preflight falha **antes** de qualquer passo que sobrescreva `artifacts/`.

**Limitação do preflight:** valida **presença** de ao menos um `*.json` em `**/questions/` — **não** valida completude editorial, manifests reconciliados ou qualidade de conteúdo. Para override em testes: `--catalog-root=<path>`.

Pode levar vários minutos. Não consulta Supabase.

Opcional após resolver audit (ainda sem Supabase):

```bash
npm run generate:neurocanvas-pilot-cohort
npm run write:neurocanvas-baseline-readiness
```

## Reconciliação live (Supabase, opt-in)

```bash
npm run write:neurocanvas-g02-reconciliation
```

**Separada** da paridade local padrão. **Não** é chamada por `neurocanvas:parity-local` nem pelo CI.

Pré-requisitos:

- `.env` com credenciais Supabase válidas.
- Script é **read-only**: apenas `SELECT` em `modulos_estudo` (`modulo_slug`, `conteudo_json`).

Para reaplicar correções documentais nos artifacts **sem** reconsultar Supabase:

```bash
npm run refresh:neurocanvas-g02-artifacts
```

## Artifacts principais

| Arquivo | Gerado por |
|---------|------------|
| `artifacts/neurocanvas-catalog-audit.json` | `audit:neurocanvas-catalog` |
| `artifacts/neurocanvas-duplicate-analysis.json` | `audit:neurocanvas-duplicates` |
| `artifacts/neurocanvas-blocker-clusters.json` | `audit:neurocanvas-blockers` |
| `artifacts/neurocanvas-baseline-impact.json` | `audit:neurocanvas-baseline-impact` |
| `artifacts/neurocanvas-resolver-audit-catalog-full.json` | `audit:resolve-slide-presentation` |
| `artifacts/neurocanvas-audit-report-data.json` | `generate:neurocanvas-audit-report-data` |
| `artifacts/neurocanvas-audit-report.md` | `write:neurocanvas-audit-report` |
| `artifacts/neurocanvas-live-reconciliation.json` | `write:neurocanvas-g02-reconciliation` |

## Código de referência

- `lib/neurocanvas/*` — lógica de auditoria
- `scripts/audit-neurocanvas-*.ts` — CLIs filesystem
- `scripts/preflight-neurocanvas-parity.ts` — gate antes da paridade (presença, não completude)
- `scripts/write-neurocanvas-g02-reconciliation.ts` — G0.2 (SELECT Supabase)
- `__tests__/lib/neurocanvas/` — testes herméticos (incluídos em `npm test` / CI)
