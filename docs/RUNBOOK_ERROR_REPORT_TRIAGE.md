# Runbook — Triagem de reportes de erro

Operação pós-publicação para manter subtópicos em `production_ready`. Integra **Camada L5** do [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) e o loop contínuo em [`CONTINUOUS_QUALITY_RUNBOOK.md`](CONTINUOUS_QUALITY_RUNBOOK.md).

---

## 1. Fontes

| Componente | Caminho |
|------------|---------|
| Dialog aluno | `components/report/ReportErrorDialog.tsx` |
| API POST | `app/api/reportar-erro/route.ts` |
| Painel admin | `components/admin/LaboratorioErrorReportsPanel.tsx` |
| API admin | `app/api/admin/error-reports/route.ts` |
| Tabela | `error_reports` (migration `20260603020858`) |
| Metadata técnica | `lib/lesson/errorReportMetadata.ts` |
| Saúde agregada | `npm run audit:content-health` (Fase 7) |

---

## 2. Modelo de dados

### Campos principais (`error_reports`)

| Campo | Valores |
|-------|---------|
| `context_type` | `lesson` \| `simulado` |
| `category` | `enunciado` \| `alternativas` \| `gabarito` \| `slides` \| `navegacao` \| `outro` |
| `status` | `novo` → `triagem` → `resolvido` \| `descartado` |
| `priority` | `p0` \| `p1` \| `p2` \| `p3` |
| `modulo_slug` | slug da questão (quando `lesson`) |
| `metadata` | JSONB — banca, subtópico, slide ativo, branch, etc. |

### Auto-prioridade (meta — implementação Fase 7)

| Gatilho | Prioridade sugerida |
|---------|---------------------|
| `category === 'gabarito'` | **P0** |
| `category === 'slides'` + menção a danger/gabarito | **P1** |
| ≥ 3 reportes no mesmo slug em 7 dias | **P1** |
| Demais | **P2** (default no schema) |
| Ruído / duplicata óbvia | **P3** ou `descartado` |

---

## 3. SLA

| Prioridade | Triagem | Correção | Impacto em `production_status` |
|------------|---------|----------|--------------------------------|
| **P0** | 4h | 24h | `blocked` se aberto > 24h (via `audit:subtopico-health`) |
| **P1** | 24h | 72h | Conta no SLO (`open_p1_max` ≤ 2) |
| **P2** | Best effort | Best effort | Não bloqueia |
| **P3** | Best effort | Best effort | Não bloqueia |

**P0 típico:** gabarito errado, alternativa correta marcada incorretamente, número normativo invertido em slide que o aluno seguiria na prova.

---

## 4. Fluxo de triagem

```text
novo → triagem (atribuir prioridade, owner) → investigação → correção → resolvido
                                              ↘ descartado (falso positivo)
```

### Passo a passo (admin)

1. Abrir **Laboratório** → painel **Reportes de erro** (ou lista filtrada por `priority=p0`).
2. Ler `description` + `metadata` (slug, subtópico, slide, `content_standard`).
3. Reproduzir no player `/estudar/[slug]` ou captures em `artifacts/questao-review/<slug>/`.
4. Classificar:
   - **Conteúdo** → handcraft repair (§5)
   - **Bug app** → issue engenharia; não alterar JSON
   - **Preferência / ruído** → `descartado` com `admin_notes`
5. Atualizar `status`, `priority`, `admin_notes`, `resolved_at`, `resolved_by`.
6. Se P0/P1 em subtópico `production_ready`: rodar `audit:content-health` após correção.
7. Se o pacote entrou em `blocked` por P0 stale: após resolver todos os P0, rodar recover:
   ```bash
   npm run audit:subtopico-health -- --subtopico="<nome canônico>" --recover
   ```
   Ver [`CONTINUOUS_QUALITY_RUNBOOK.md`](CONTINUOUS_QUALITY_RUNBOOK.md) §5.

---

## 5. Handcraft repair (conteúdo)

Quando o reporte confirma erro de conteúdo golden-v1:

1. Localizar JSON: `data/catalog-migration/<pacote>-gNN/questions/<slug>.json`
2. Corrigir seguindo [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) e gates L2.
3. Validar:
   ```bash
   npm run audit:questao-readiness -- --file=data/catalog-migration/<lote>/questions/<slug>.json
   npm run audit:slug-alignment -- --slug=<slug> --strict
   ```
4. Apply pontual ou re-apply do lote:
   ```bash
   npm run catalog:apply-lote -- --lote=<lote> --apply --only=<slug>
   ```
   (se `--only` não existir, dry-run do lote + apply do lote inteiro)
5. Registrar em `admin_notes` do reporte: commit/PR, data, causa raiz.
6. Marcar `resolvido`.
7. Se pacote estava `blocked`: `audit:subtopico-health -- --subtopico="..." --recover`.

### Bulk resolve (mesma causa raiz)

Vários slugs afetados por guideline atualizada ou template errado de um lote:

1. Identificar slugs via `metadata.meta_subtopico` ou cluster do lote.
2. Correção em lote nos JSONs locais.
3. `npm run catalog:preflight -- --lote=<lote>`
4. `npm run catalog:apply-lote -- --lote=<lote> --apply`
5. Resolver reportes em massa no painel com nota única referenciando o apply report.

---

## 6. Métricas e SLO (L5)

`audit:content-health` agrega por subtópico:

| Métrica | Fórmula / fonte |
|---------|-----------------|
| `sessions_30d` | `historico_questoes` por `modulo_slug` |
| `open_reports` | `error_reports` onde `status` ∉ (`resolvido`, `descartado`) |
| `report_rate_pct` | `open_reports / sessions_30d × 100` |
| Top slugs | 10 slugs com mais reportes abertos |

**Pass L5** para ship (`--promote`):

- `open_p0 === 0`
- `open_p1 ≤ quality.slo.open_p1_max` (default 2)
- `report_rate_pct < quality.slo.report_rate_max_pct` (default 2,0%) **ou** warming (sessions < `min_sessions_30d`)

**Continuous (pós-venda):** P0 recente não bloqueia; P0 stale > `p0_block_after_hours` → `blocked`. Ver [`DECISAO_QUALITY_HIBRIDA.md`](DECISAO_QUALITY_HIBRIDA.md).

---

## 7. Escalação

| Situação | Ação |
|----------|------|
| P0 > 24h em subtópico flagship | `production_status: blocked` (automático via `audit:subtopico-health`); notificar owner; `--recover` após repair |
| Mesmo distrator reportado 3× em 7d | Elevar para P1; revisar `danger_zone` do slug |
| Divergência prova × guideline | Manter gabarito da prova nos slides; documentar `exam_vs_current` |
| Bug de player (navegação) | Não editar JSON; ticket engenharia |

---

## 8. Checklist diário (ops)

- [ ] Fila P0 = 0 itens com idade > 4h
- [ ] Fila P1 revisada (idade > 24h)
- [ ] `audit:subtopico-health --all-production-ready` (pacotes vendáveis)
- [ ] Pacotes `blocked`: confirmar repair + `--recover`
- [ ] Após correção em lote: `audit:content-health -- --subtopico="..."` ou `audit:subtopico-health`
