# Imunização — repair DECORP tríplice viral (via)

**Subtópico:** Imunização  
**Modo:** Handcraft golden-v1 — repair pontual (1 slug)  
**Status:** **applied** (2026-07-01)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Questão documentada

| Campo | Valor |
|-------|--------|
| Slug | `decorp-enfermagem-vias-de-administracao-1776056357082-0` |
| Golden | [`examples/questao-premium-decorp-imunizacao-triplice-viral-via.json`](../../../examples/questao-premium-decorp-imunizacao-triplice-viral-via.json) |
| Banca / ano | DECORP 2025 |
| Comando | Via de administração **correta** da tríplice viral aos 12 meses |
| Gabarito | **A** — via subcutânea |
| Ramo L3 | `imunizacao_generico` |
| Família | `conceito` |
| Player | `/estudar/decorp-enfermagem-vias-de-administracao-1776056357082-0` |

## Pipeline (reaplicar)

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-decorp-imunizacao-triplice-viral-via.json
npm run catalog:apply-lote -- --lote=imunizacao-decorp-triplice-viral-repair --dry-run
npm run catalog:apply-lote -- --lote=imunizacao-decorp-triplice-viral-repair --apply
```

**Não usar:** `ai:generate` · `catalog:upgrade-premium`
