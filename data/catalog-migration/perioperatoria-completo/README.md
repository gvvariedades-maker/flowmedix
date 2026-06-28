# Assistência Perioperatória — handcraft golden-v1 (fechado)

**Subtópico:** Assistência Perioperatória (Inclui SRPA)  
**Modo:** Handcraft golden-v1 total (1 JSON por slug)  
**Status:** 68/68 handcraft · apply g01–g09 OK (2026-06-23)

Runbook geral: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · ADR: [`docs/DECISAO_TRILHO_A_UNICO.md`](../../../docs/DECISAO_TRILHO_A_UNICO.md).

**Nova conversa (outro subtópico):** envie `Handcraft: <subtópico canônico>` — ver [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md).

---

## O que este pacote fez

| Decisão | Valor |
|---------|--------|
| Slugs no catálogo | 68 (`manifest.json`) |
| Lotes de migração | `perioperatoria-g01` … `g09` (8+8+…+4) |
| Âncoras de estilo | 6 em `examples/questao-premium-*-perioperatoria-*.json` |
| Cluster pedagógico | `npm run cluster:perioperatoria` → `artifacts/perioperatoria-topic-cluster-report.json` |
| **Não usado** | `npm run ai:generate` · `npm run catalog:upgrade-premium` |

Cada questão foi reescrita no Cursor com 4 slides planos, `meta.sources`, `content_review` e `content_standard: "golden-v1"`.

---

## Pipeline por lote (repetir em qualquer subtópico)

```bash
# 1. Export do Supabase (slugs do manifest ou lista explícita)
npm run catalog:export-lote -- --lote=perioperatoria-g01 --slugs=slug1,slug2,...

# 2. Handcraft — editar JSONs em data/catalog-migration/<lote>/questions/<slug>.json

# 3. Validação bloqueante (Zod + lintGoldenContent em modo strict)
npm run validate:goldens -- --lote=perioperatoria-g01 --strict

# 4. Dry-run apply
npm run catalog:apply-lote -- --lote=perioperatoria-g01 --dry-run

# 5. Gravar no Supabase (após amostra no player)
npm run catalog:apply-lote -- --lote=perioperatoria-g01 --apply
```

> Rodar via **`npm run`** no Windows — evitar `npx tsx` direto.

---

## Lotes e artefatos

| Lote | Questões | Links player | Relatório apply |
|------|----------|--------------|-----------------|
| g01 | 8 | [`artifacts/perioperatoria-g01-links.html`](../../../artifacts/perioperatoria-g01-links.html) | `artifacts/catalog-migration-perioperatoria-g01-applied.json` |
| g02 | 8 | `artifacts/perioperatoria-g02-links.html` | `…-g02-applied.json` |
| g03 | 8 | `artifacts/perioperatoria-g03-links.html` | `…-g03-applied.json` |
| g04 | 8 | `artifacts/perioperatoria-g04-links.html` | `…-g04-applied.json` |
| g05 | 8 | `artifacts/perioperatoria-g05-links.html` | `…-g05-applied.json` |
| g06 | 8 | `artifacts/perioperatoria-g06-links.html` | `…-g06-applied.json` |
| g07 | 8 | `artifacts/perioperatoria-g07-links.html` | `…-g07-applied.json` |
| g08 | 8 | `artifacts/perioperatoria-g08-links.html` | `…-g08-applied.json` |
| g09 | 4 | `artifacts/perioperatoria-g09-links.html` | `…-g09-applied.json` |

Slugs por lote: `data/catalog-migration/perioperatoria-gNN/manifest.json`.

Metadados operacionais: `data/catalog-migration/perioperatoria-gNN/lote-meta.json`.

---

## Contrato JSON (checklist rápido)

- `meta.content_standard: "golden-v1"` + `family` + `content_review` + `sources[]` (tier A/B, `year` numérico)
- `meta.subtopico` canônico — repetir em cada slide
- 4 slides planos: `concept_map`, `golden_rule`, `logic_flow` (`reveal_mode: "tap"`), `danger_zone` (`items[].correct`)
- Sem `template` / `layout_variant` (design automático)
- `danger_zone`: justificativa **distinta** por distrator; EXCETO/INCORRETA — distrator explica conduta certa, só gabarito aponta exceção
- V/F: `logic_flow` com “Julgar I, II, III…” (não só “afirmativas”)

Referência: [`docs/GOLDEN_CONTENT_STANDARD.md`](../../../docs/GOLDEN_CONTENT_STANDARD.md) · template [`examples/_TEMPLATE-golden-v1.json`](../../../examples/_TEMPLATE-golden-v1.json).

---

## Âncoras por ramo (estilo, não catálogo)

| Ramo | Arquivo em `examples/` |
|------|------------------------|
| SRPA / CPD (C/E) | `questao-premium-idecan-srpa-curativo-cpd-ce.json` |
| SRPA / Aldrete | `questao-premium-idecan-perioperatoria-aldrete-srpa.json` |
| SRPA / técnico | `questao-premium-consulplan-perioperatoria-srpa-monitorizacao.json` |
| Pré-operatório | `questao-premium-avancasp-perioperatoria-pre-operatorio.json` |
| ISC classificação | `questao-premium-furb-perioperatoria-isc-classificacao.json` |
| Cirurgia segura / CDC | `questao-premium-cogeps-perioperatoria-cirurgia-segura-cdc.json` |

---

## Erros de validação frequentes (já vistos neste pacote)

| Código / sintoma | Correção |
|------------------|----------|
| `vf_roman` | Steps: “Julgar I, II, III…”; labels I–IV nos slides |
| `source_year` | `sources[].year` como número ≥ 1990 |
| Ícone Lucide inválido | Trocar por ícone exportado no pacote (ex. `Lungs` → `Wind`) |
| `danger_duplicate_justifications` | `correct` diferente em cada item |
| `slide_topic_drift` | Sem vocabulário IPCS/CVC/bundle sem âncora no enunciado |
| `danger_zone_items` | Cebraspe C/E: mínimo 2 itens com `correct` |

---

## Definition of Done (este subtópico)

- [x] 68/68 slugs com `golden-v1` em `data/catalog-migration/perioperatoria-g*/questions/`
- [x] `validate:goldens --lote=… --strict` 0 falhas em todos os lotes
- [x] `catalog:apply-lote --apply` 0 failed (g01–g09)
- [ ] Amostra humana ≥5% no player (recomendado pós-deploy)
- [ ] Re-cluster pós-migração (`drift ≈ 0`) — opcional auditoria

---

## Reaplicar todos os lotes

```bash
foreach ($i in 1..9) {
  npm run catalog:apply-lote -- --lote=("perioperatoria-g{0:D2}" -f $i) --apply
}
```
