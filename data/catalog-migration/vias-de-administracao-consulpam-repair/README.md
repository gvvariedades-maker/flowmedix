# Vias de Administração — repair Consulpam (absorção oral)

**Subtópico:** Vias de Administração  
**Modo:** Handcraft golden-v1 — repair pontual (1 slug)  
**Status:** **applied** (2026-07-01)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Questão documentada

| Campo | Valor |
|-------|--------|
| Slug | `instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0` |
| Golden | [`examples/questao-premium-consulpam-vias-absorcao-oral.json`](../../../examples/questao-premium-consulpam-vias-absorcao-oral.json) |
| Banca / ano | INSTITUTO CONSULPAM 2024 — Pref Hidrolândia |
| Comando | Assinale a alternativa **CORRETA** |
| Gabarito | **D** — absorção VO predominante no intestino delgado |
| Ramo L3 | `via_vf_absorcao` |
| Família | `conceito` |
| Player | `/estudar/instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0` |

## Âncora pedagógica

Referência de estilo para handcraft de **absorção farmacocinética por via** (oral, sublingual, retal, parenteral) — comando CORRETA com `danger_zone` compare semântico por letra.

Registry: [`data/catalog-migration/vias-golden-anchors.json`](../vias-golden-anchors.json)

## Pipeline (reaplicar)

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-consulpam-vias-absorcao-oral.json
npm run catalog:apply-lote -- --lote=vias-de-administracao-consulpam-repair --dry-run
npm run catalog:apply-lote -- --lote=vias-de-administracao-consulpam-repair --apply
```

**Não usar:** `ai:generate` · `catalog:upgrade-premium`
