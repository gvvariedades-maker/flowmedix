# Decisão — Trilho A único (handcraft golden-v1)

**Data:** 2026-06-27  
**Status:** vigente  
**Escopo:** produção de conteúdo premium no catálogo AVANT (~5.180 questões, 41 subtópicos)

---

## Decisão

A partir desta data, **existe um único trilho de produção premium**:

**Handcraft golden-v1 por slug** — 1 JSON `golden-v1` específico para cada questão, validado com `validate:goldens --strict` e aplicado com `catalog:apply-lote --apply`.

Não há trilho alternativo por volume (builder em escala, hybrid genérico ou `ai:generate` em lote).

---

## O que isso significa

| Aspecto | Regra |
|---------|--------|
| Entrega L2 | Slides ensinam **esta** prova; `meta.content_standard: "golden-v1"` |
| Por subtópico | Export → cluster (opcional) → âncoras de estilo por ramo → lotes `g01`…`gNN` (8 slugs/lote) |
| Validação | `npm run validate:goldens -- --lote=<lote> --strict` antes de qualquer apply |
| Apply | Só JSON handcraft; nunca saída de `catalog:upgrade-premium` |
| Definition of Done | 100% slugs handcraft + 0 falhas strict + amostra ≥5% no player |

---

## Proibido em produção nova

- `npm run catalog:upgrade-premium` (hybrid ou builder)
- `npm run ai:generate` para gerar slides de catálogo
- Declarar subtópico **fechado** sem `handcraft_applied === total_slugs` no registry

---

## Legado (código permanece; não é caminho de produção)

O repositório ainda contém:

- `lib/catalogMigration/upgradePremium*.ts` — conteúdo migrado antes desta decisão
- Subtópicos “100% premium” via builder (Imunização, Curativos, Sinais Vitais…) — **pendentes re-handcraft**

Esses registros devem ser **re-handcraftados** seguindo [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) até o subtópico fechar no [`handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json).

---

## Documentação canônica

| Doc | Papel |
|-----|--------|
| **Este arquivo** | ADR — decisão de produto |
| [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | Runbook handcraft |
| [`TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) | Classificar subtópico **antes** do handcraft |
| [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md) | Prompt `Classify: <bucket>` |
| [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | Prompt `Handcraft: <subtópico>` |
| [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) | Progresso por subtópico |

Handcraft **só após taxonomia estável** por subtópico. Ver [`TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) · [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md) (`Classify:`).

---

## Referência de pacote fechado

[`data/catalog-migration/perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) — 68/68 handcraft, apply g01–g09.
