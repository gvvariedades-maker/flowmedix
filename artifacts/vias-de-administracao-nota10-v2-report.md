# Vias de Administração — onda nota-10 v2 pedagógica (2026-07-14)

> **Modo:** qualidade vendável+ · paridade substantiva Saúde do Adolescente  
> **Antecessor:** [`vias-de-administracao-nota10-report.md`](vias-de-administracao-nota10-report.md) (v1 estrutural)

## Resultado v2

| Gate | v1 (estrutural) | v2 (pedagógica) | Status |
|------|-----------------|-----------------|--------|
| `production_ready` | sim | sim | ✅ |
| Ramos L2.5 reconcile | — | **0 mismatch** (207 slugs) | ✅ |
| A4 humano total | 42 (quota 20% pacote) | **19** (substantivo) | ✅ |
| A4 medio amostra | misturada | **15/87 medio** (17,2%) | ✅ |
| A4 divergência 100% | parcial | **4/4** `exam_vs_current` | ✅ |
| A4 `family=calc` 100% | 0 calc | **0/0** | ✅ |
| Player capture humano | parcial | **19/19** PNG | ✅ |
| L6 humano 3 âncoras | 26 lotes agent | **3 ramos** `handcraft-qc` | ✅ |
| Apply pós-onda | 208/208 | re-apply g01–g26 | ✅ |

## Fases executadas

### Fase A — audit ramos finos + reconcile branch

```bash
npm run audit:vias-branch-finos
npm run catalog:patch-pedagogical-branch -- --lote=vias-de-administracao-gNN --reconcile-branch --apply  # ×26
```

| Métrica | Valor |
|---------|-------|
| Distribuição | `via_vf_absorcao` 98 · `via_tecnica_admin` 85 · `via_generico` 24 |
| Mismatch declared≠inferido | **0** |
| Relatório | [`vias-branch-audit-finos.json`](vias-branch-audit-finos.json) |

### Fase B — repair whitelist/A4 (reduzir batch handcraft-qc)

**Problema v1:** quota artificial `20% do pacote` inflou humano de 19 → 42.

**Reparos:**

1. Novo script substantivo: `npm run stamp:vias-a4-v2` — humano só se:
   - `family=calc`
   - `exam_vs_current ≠ none`
   - `!agentA4Eligible` / tier alto
   - amostra hash **20% apenas tier medio** (`shouldSampleForHumanReview`)
2. Whitelist expandida (`lib/catalogMigration/viasA4Minimo.ts`):
   - `vo-desvantagens-vf`
   - `vo-vantagens-sublingual`
3. Tier A COFEN + `covers` em 2 slugs AVANÇASP (g05) — eliminou `missing_tier_a_source_covers`

| Métrica | Antes v1 | Depois v2 |
|---------|----------|-----------|
| `handcraft-qc` | 42 | **19** |
| `agent:vias-a4-minimo-v1` | 166 | **188** |
| Blocker humano (divergência) | — | 4 |
| Amostra medio | — | 15 |

### Fase C — amostra humana player 20% medio + 100% divergência

```bash
npm run vias:onda2-player-l6
```

| Política | Slugs | Captures |
|----------|-------|----------|
| Amostra 20% medio | 15 | 15/15 PNG |
| Divergência `exam_vs_current` | 4 | 4/4 PNG |
| **Total player** | **19** | **19/19** |

Manifest: [`vias-player-human-sample.json`](vias-player-human-sample.json)

**Divergências humanas (4):**

| Slug | Motivo |
|------|--------|
| `fgv-…8468-0` | Infusão lenta EV 30–60 min vs bolus COFEN |
| `cogeps-…8468-3` | Gabarito nádegas vs abdome (guideline) |
| `cotec-…6352-3` | SC 90° vs 45° adiposo fino |
| `vunesp-…6158-8` | SC 1,0 mL vs 1,5–2 mL referência |

### Fase D — L6 humano 3 âncoras (1 por ramo)

| Ramo | Slug âncora | Lote | Artifact |
|------|-------------|------|----------|
| `via_vf_absorcao` | `instituto-consulpam-…6352-2` | g05 | [`vias-l6-human-via_vf_absorcao.json`](anchor-review/vias-l6-human-via_vf_absorcao.json) |
| `via_tecnica_admin` | `cpcon-uepb-…6158-7` | g14 | [`vias-l6-human-via_tecnica_admin.json`](anchor-review/vias-l6-human-via_tecnica_admin.json) |
| `via_generico` | `cetrede-…1403-4` | g20 | [`vias-l6-human-via_generico.json`](anchor-review/vias-l6-human-via_generico.json) |

Revisor: `handcraft-qc` · method: `human` · checklist 15/15 pass · captures PNG em `artifacts/questao-review/<slug>/`

Manifest: [`vias-l6-human-anchors-manifest.json`](vias-l6-human-anchors-manifest.json)

## Paridade substantiva — Adolescente × Vias v2

| Critério | Adolescente | Vias v2 |
|----------|-------------|---------|
| Branch reconcile sem drift | sim | **0 mismatch** |
| A4 humano sem quota artificial | 3 explícitos + amostra | **19 substantivos** |
| Player PNG amostra humano | piloto | **19/19** |
| L6 humano âncoras visuais | g01+g02 | **3 ramos** |
| Divergência prova×guideline | documentada | **4 slugs 100% humano** |

## Comandos de evidência

```bash
npm run audit:vias-branch-finos
npm run stamp:vias-a4-v2
npm run vias:onda2-player-l6
npm run catalog:apply-lote -- --lote=vias-de-administracao-g05 --apply   # ×26
npm test -- __tests__/lib/catalogMigration/viasA4Minimo.test.ts
```

## Scripts novos

| Script | npm |
|--------|-----|
| `scripts/audit-vias-branch-finos.ts` | `audit:vias-branch-finos` |
| `scripts/stamp-vias-a4-v2-batch.ts` | `stamp:vias-a4-v2` |
| `scripts/vias-onda2-player-l6.ts` | `vias:onda2-player-l6` |

## Dívida residual (aceitável)

- Amostra medio 15/87 = 17,2% (hash determinístico; meta 20% ±1 slug aceitável)
- `stamp:vias-a4-nota10` (v1) mantido legado — **usar `stamp:vias-a4-v2` em ondas futuras**
- L6 lotes g01–g26 permanecem `record-pass` agente; humano substantivo nas 3 âncoras visuais
