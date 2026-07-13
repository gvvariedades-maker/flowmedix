# Punção Venosa e Cuidados com Cateteres — handcraft golden-v1

**Subtópico:** Punção Venosa e Cuidados com Cateteres  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **`production_ready`** — **110/110** handcraft local (`g01`–`g15`) · promote 2026-07-12

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md) · [`docs/FONTE_NORMATIVA_AVANT.md`](../../docs/FONTE_NORMATIVA_AVANT.md) §9

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest | 110 (`puncao-venosa-e-cuidados-com-cateteres-completo/manifest.json`) |
| Drift excluído | 0 |
| Handcraft aplicado | **110/110** (`g01`–`g15`) · DB apply **completo** (2026-07-12) |
| `production_status` | **`production_ready`** (promote 2026-07-12) · `continuous.enabled: true` |
| Ramos L3 | `puncao_flebite` · `puncao_dispositivo` · `puncao_exceto` · `puncao_tempo` · `puncao_periferica_antissepsia` · `puncao_ipcs_cvc` · `puncao_generico` |
| Playbook | [`handcraft-playbooks/puncao-venosa-e-cuidados-com-cateteres.json`](../handcraft-playbooks/puncao-venosa-e-cuidados-com-cateteres.json) |
| Guideline enrich | [`lib/catalogMigration/puncaoPedagogy.ts`](../../lib/catalogMigration/puncaoPedagogy.ts) |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Fontes canônicas (`meta.sources`)

| ID | Tier | Quando |
|----|------|--------|
| `puncao-cateter-anvisa` | A | Sempre (Anvisa / COFEN — AVP, bundle CVC, complicações) |
| `potter-perry-fundamentos-11ed-2024` | B | Sempre — *Fundamentos de Enfermagem*, 11ª ed., Guanabara Koogan, 2024 |
| `sae-cofen-358` | A | Quando há documentação / prontuário / SAE no corpus |
| `manual-tecnico-enfermagem-avp` | B | Nomenclatura popular (ex.: flebite coloquial × infiltração) |

Enrich automático: `npm run enrich:puncao-guideline-meta -- --lote=<lote> --write`

## Clusters P0 (handcraft)

| Cluster | Slugs | Ramo | Lote | Status |
|---------|-------|------|------|--------|
| EXCETO — técnica / conduta | 12 | `puncao_exceto` | `g03` + `g14` | **12/12 readiness** · cluster **esgotado** |
| Dispositivo / calibre / jelco | 12 | `puncao_dispositivo` | `g02` + `g14` | **12/12 readiness** · cluster **esgotado** |
| Tempo / observação pós-procedimento | 11 | `puncao_tempo` | `g04` + `g14` | **11/11 readiness** · cluster **esgotado** |
| Técnica de punção periférica | 7 | `puncao_periferica_antissepsia` | `g13` | **7/7 readiness** · cluster **esgotado** |
| Antissepsia na punção | 8 | `puncao_periferica_antissepsia` | `g12` | **8/8 readiness** · cluster **esgotado** |
| Flebite e complicações | 19 | `puncao_flebite` | `g01` + `g10` + `g11` | **19/19 readiness** · cluster **esgotado** |
| Punção periférica | 19 | `puncao_periferica_antissepsia` | `g05` | **8/8 readiness** · dry-run OK |
| IPCS / CVC | 11 | `puncao_ipcs_cvc` | `g06` | **4/4 readiness** · cluster completo · dry-run OK |
| Cauda genérica | ~24 | `puncao_generico` | `g07`–`g09` | **19/19 readiness** · cauda **esgotada** |

| Cauda final (calc + VF + CVC + periférica + arterial + EV) | 10 | multi-ramo | `g15` | **10/10 readiness** · **110/110** handcraft local |

## Comandos (g15)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g15
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g15 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g15/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g15
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g15 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g15 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g15 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g15 --apply
```

> **Nota g15:** lote misto **10/10** — cauda final do pacote · `puncao_generico` (5) + `puncao_periferica_antissepsia` (3) + `puncao_ipcs_cvc` (2). Slug `…1779562711132-0` exportado manualmente (TecConcursos no DB).

## Comandos (g14)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g14
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g14 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g14/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g14
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g14 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g14 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g14 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g14 --apply
```

> **Nota g14:** lote misto **11/11** — esgota caudas **EXCETO** (4) + **Dispositivo** (4) + **Tempo** (3) · branches por slug.

## Comandos (g13)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g13
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g13 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g13/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g13
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g13 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g13 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g13 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g13 --apply
```

> **Nota g13:** cluster **Técnica de punção periférica** esgotado (7/7) — material AVP · venopunção · indicações · FUNPAR garrote · Carmagnani C/E · garrote 1 min · VUNESP técnica.

## Comandos (g12)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g12
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g12 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g12/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g12
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g12 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g12 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g12 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g12 --apply
```

> **Nota g12:** cluster **Antissepsia na punção** esgotado (8/8) — álcool 70% · HH colega · CVC conexão · flushing SF · técnica asséptica · monitorar sítio · ITU-AC V/F · dânulas.

## Comandos (g11)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g11
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g11 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g11/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g11
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g11 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g11 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g11 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g11 --apply
```

> **Nota g11:** lote parcial **3/3** — **fim do cluster `puncao_flebite`** · lacuna definição (Objetiva) · conduta retirada AVP (Selecon) · definição endotélio (Unifil).

## Comandos (g10)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g10
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g10 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g10/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g10
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g10 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g10 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g10 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g10 --apply
```

> **Nota g10:** cluster `puncao_flebite` continuação — VF Fundatec AVP (V-V-F-V-V) · escala flebite FUVEST · PICC · tipos de flebite.

## Comandos (g09)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g09
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g09 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g09/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g09
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g09 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g09 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g09 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g09 --apply
```

> **Nota g09:** lote parcial **3/3** — fim da cauda `puncao_generico` · `exam_vs_current` obstrução cateter (água destilada) · risco alto A4 em `…1132-2` e VUNESP RCP gestante.

## Comandos (g08)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g08
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g08 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g08/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g08
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g08 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g08 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g08 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g08 --apply
```

> **Nota g08:** risco alto A4 em `instituto-access …4185-6` (grafia Shilley/shunt HD).

## Comandos (g07)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g07
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g07 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g07/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g07
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g07 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g07 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g07 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g07 --apply
```

> **Nota g07:** 3 itens CebraSPE julgue (C/E) · `exam_vs_current` em `…1132-8` (tempos PVPI/clorexidina) e `…9843-3` (garrote) · risco alto A4 em fundatec/ibfc/`…1132-8`.

## Comandos (g06)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g06
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g06 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g06/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g06
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g06 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g06 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g06 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g06 --apply
```

> **Nota:** cluster `puncao_ipcs_cvc` tem apenas **4 slugs** no cluster-report — g06 esgota o P0 IPCS.

## Comandos (g05)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g05
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g05 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g05/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g05
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g05 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g05 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g05 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g05 --apply
```

## Comandos (g04)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g04
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g04 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g04/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g04
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g04 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g04 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g04 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g04 --apply
```

## Comandos (g03)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g03
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g03 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g03/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g03
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g03 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g03 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g03 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g03 --apply
```

## Comandos (g02)

```bash
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g02
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g02 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g02/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g02
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g02 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g02 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g02 --strict-v2-pedagogy
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g02 --apply
```

## Comandos (g01)

```bash
npm run bootstrap:puncao-venosa-e-cuidados-com-cateteres
npm run plan:puncao-venosa-e-cuidados-com-cateteres-g01
npm run catalog:export-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --from-manifest=data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g01/manifest.json
npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g01
npm run enrich:puncao-guideline-meta -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --write
npm run validate:goldens -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --strict
npm run audit:questao-readiness -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --strict-v2-pedagogy
npm run audit:anchor-review -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --record-pass --reviewer=<revisor>
# apply SOMENTE com pedido explícito:
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --apply
```

## Artefatos g01

| Artefato | Caminho |
|----------|---------|
| L6 anchor-review | `artifacts/anchor-review/puncao-venosa-e-cuidados-com-cateteres-g01.json` |
| Readiness | `artifacts/questao-readiness-audit.json` |
| Apply report | `artifacts/catalog-migration-puncao-venosa-e-cuidados-com-cateteres-g01-applied.json` |
| L3 brief flebite | `artifacts/l3-brief-puncao-venosa-e-cuidados-com-cateteres-puncao_flebite.md` |
| A4 piloto | `artifacts/puncao-g01-a4-pilot.md` |

**Ressalva:** slug FAU (`…1779562711132-5`) — `exam_vs_current` (flebite popular × infiltração); risco `alto` / revisão humana A4 recomendada.
