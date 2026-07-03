# Farmacodinâmica — repair cauda longa (v2 premium)

**Subtópico:** Farmacodinâmica e Farmacocinética  
**Modo:** Handcraft golden-v1 — repair cauda longa (3 slugs)  
**Status:** **applied** (2026-07-01)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Slugs

| Slug | Cluster | Estilo absorvido | Gabarito |
|------|---------|------------------|----------|
| `idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-7` | Farmacodinâmica clínica | Idecan omeprazol (PK/PD clínico) | B |
| `fundatec-enfermagem-processo-de-enfermagem-1780006976703-2` | INCORRETA / EXCETO | Gramática EXCETO (idib ITU cateter) | E |
| `fundatec-enfermagem-processo-de-enfermagem-1780006976703-0` | Protocolo EV / infusão | Idecan omeprazol (monitorização UTI) | B |

## Pipeline

```bash
npm run audit:questao-readiness -- --lote=farmacodinamica-cauda-longa-repair
npm run validate:goldens -- --lote=farmacodinamica-cauda-longa-repair --strict
npm run catalog:apply-lote -- --lote=farmacodinamica-cauda-longa-repair --dry-run
npm run catalog:apply-lote -- --lote=farmacodinamica-cauda-longa-repair --apply
```

**Não usar:** `ai:generate` · `catalog:upgrade-premium`
