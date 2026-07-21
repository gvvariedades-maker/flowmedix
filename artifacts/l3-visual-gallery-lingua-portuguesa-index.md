# L3 Visual Gallery INDEX — Língua Portuguesa

Galeria **leve** por ramo: espelho operacional das âncoras pedagógicas.
Capturas = PNGs do **player AVANT** (`capture:questao-review`), não posters Instagram.

| Campo | Valor |
|-------|--------|
| pacote_prefix | lingua-portuguesa |
| Playbook | `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → `visual_gallery` |
| Brief index | `artifacts/l3-brief-lingua-portuguesa-index.md` |
| Skill | `.cursor/skills/avant-neuroslides-visual/SKILL.md` |
| Capture | `npm run capture:questao-review -- --slug=<anchor_slug>` |
| Saída PNG | `artifacts/questao-review/<anchor_slug>/` |

## Status

| status | Significado |
|--------|-------------|
| pending | Brief ok; falta JSON âncora e/ou capture |
| pilot | JSON em `anchors` + capture com layout **genérico** premium |
| ready | Bespoke wired + re-capture pós-React |

## Ramos

| branch_id | brief | JSON âncora | layouts | captures_dir | status |
|-----------|-------|-------------|---------|--------------|--------|
| pt_crase | `artifacts/l3-brief-lingua-portuguesa-pt_crase.md` | `examples/questao-premium-vunesp-portugues-crase-funil.json` (tec 3607076, gab. C) | pt-crase-funnel-deck · board · tap-flow · trap-arena | `artifacts/questao-review/questao-premium-vunesp-portugues-crase-funil/` | **ready** |

### Checklist piloto pt_crase

1. [x] Handcraft âncora + `anchors[]` no playbook
2. [x] `audit:questao-readiness --strict-v2-pedagogy` → `[READY]`
3. [x] `visual_gallery.anchor_slug` preenchido
4. [x] `capture:questao-review` mobile-375
5. [x] status → **ready** (bespoke + re-capture)
6. [x] `Implementar molde: pt_crase` 4/4 wired

## Política

- Só ramos `molde_redesign` / `molde_inedito`.
- 1 galeria por ramo.
- Proibido indexar PNG de feed externo.
