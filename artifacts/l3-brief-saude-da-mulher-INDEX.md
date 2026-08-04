# INDEX L3 — Saúde da Mulher (Onda 3 Fábrica)

**Atualizado:** 2026-08-03  
**Decisão Onda 3:** **reusar** moldes bespoke 4/4 já wired — **sem** `Implementar molde:` nesta unidade.  
**Print→primitivo:** ver `artifacts/pre-onda3-print-to-primitives-catalog.md` + tabela abaixo.

| branch_id | Gesto (1 frase) | Print-família | Primitivo AVANT (composição) | Molde 4/4 (já existe) | Brief |
|-----------|-----------------|---------------|------------------------------|----------------------|-------|
| `mulher_prenatal` | Trilho gestacional 0–40 sem × exames/trimestre | Calendário / timeline | `ProtocolRailRow` / timeline + `LabelBodyRow` | gestation-timeline · prenatal-board · tap-flow · trap-arena | `l3-brief-…-mulher_prenatal.md` |
| `mulher_parto` | Deck de fases + humanização PNH | Deck / pilares | `PillarDeck` + `PolarityPanel` | labor-phase-deck · parto-board · tap-flow · trap-arena | `…-mulher_parto.md` |
| `mulher_papanicolau` | Espectro etário 25–64 × rastreio | Chip + corpo / espectro | `CategoryStrip` + `LabelBodyRow` | screening-spectrum · papanicolau-board · tap · trap | `…-mulher_papanicolau.md` |
| `mulher_mama` | Espectro 50–69 bienal × mamografia | Chip + corpo | `CategoryStrip` + `LabelBodyRow` | mammography-spectrum · mama-board · tap · trap | `…-mulher_mama.md` |
| `mulher_puerperio` | Linha 0–42 dias × lactação | Timeline / chip+corpo | `ProtocolRailRow` + `LabelBodyRow` | puerperio-timeline · board · tap · trap | `…-mulher_puerperio.md` |
| `mulher_planejamento` | Categorias contraceptivas | Deck / categoria | `PillarDeck` + `CategoryStrip` | contraception-spectrum · planejamento-board · tap · trap | `…-mulher_planejamento.md` |
| `mulher_generico` | Genérico premium | — | SoftLens / morph / compare | morphological · reference_table · vertical · compare | ok_generico |

## Design visual (Modo V — pacote)

```text
## Design visual — Saúde da Mulher (6 ramos fortes)
Gesto por ramo: ver tabela INDEX (trilho / deck / espectro / timeline).
Erro espacial: timing/faixa etária/fase errada vs marco da prova.
4/4: concept=timeline|deck|spectrum | golden=board | logic=tap-flow≤budget | danger=trap-arena
Inspiração → AVANT: calendário PNI→LabelBodyRow; protocolo→ProtocolRailRow; pilares→PillarDeck; Atenção→AlertCallout
Anti-padrões: 1 variant por print; mascote 3D; poster 18 cards; pastel no shell Cyber
Handoff: React: não (moldes já shipped) | Implementar molde: não nesta unidade
DoD Camada 7: PASS se Playwright/captures + nota10-report
```

## P1 (fora deste chat)

Variants Mulher ainda **não** importam `components/slides/primitives/` — refator composição (BoardChrome/LabelBodyRow) em onda futura, sem mudar `layout_variant` IDs.


## Fechamento Fábrica G2 (2026-08-04)

- 18 boards → primitives Tier A
- Playwright L3: **10/10** (prenatal/parto/papanicolau/mama)
- `visual_bar: pass` · `visual_gallery: ready` nos 4 ramos e2e
- Fix: `next.config.js` cpus:1 só VERCEL/CI

