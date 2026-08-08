# Saúde do Adolescente — Âncoras 100% (Fase 2)

**Subtópico:** Saúde do Adolescente  
**Pacote:** `saude-adolescente`  
**Fechado em:** 2026-08-07  
**Status:** **100% — base liberada** (âncoras golden + Glance OS / barra G2)

> Não confundir com `applied` (handcraft no DB) nem `production_ready` (vendável).  
> Este relatório fecha **âncoras 100%** + galeria visual 6/6. O pacote já estava `applied` 16/16 e `production_ready` (onda nota-10 2026-07-13).

---

## Tabela final

| branch | âncora | READY | require-visual | approval | visual_gallery |
|--------|--------|-------|----------------|----------|----------------|
| `adolescente_etica_sigilo` | idecan-…1778712426701-6 | yes | pass (visual-anchors) | signed:agent | ready |
| `adolescente_antropometria` | ibam-…1777102845644-0 | yes | pass | signed:agent | ready |
| `adolescente_violencia_protecao` | funcern-…1777104229064-1 | yes | pass | signed:agent | ready |
| `adolescente_saude_mental` | cpcon-uepb-…1780007246385-1 | yes | pass | signed:agent | ready |
| `adolescente_desenvolvimento` | nao-informado-…1777104229064-0 | yes | pass | signed:agent | ready |
| `adolescente_generico` | questao-premium-cpcon-saude-adolescente-gravidez-vf | yes | pass | signed:agent | ready |

**Ramos L3:** 6/6 com `approval.status=pass` + `gesture_g2` via `--require-visual`  
**Galeria:** 6/6 `visual_gallery=ready` — índice `artifacts/l3-visual-gallery-saude-adolescente-index.md`

---

## Gates de fechamento (2026-08-07)

| Gate | Resultado |
|------|-----------|
| `audit:anchor-100 --require-visual` ×6 | **PASS** + `--sign-agent --write-meta` |
| Playwright L3 chromium `Saúde do Adolescente` | **13/13 passed** |
| Registry | `applied` 16/16 · `production_ready` · L1–L6 |
| A4-mínimo (onda nota-10) | 16/16 (histórico 2026-07-13) |

---

## Moldes 4/4 por ramo

| Ramo | Layouts |
|------|---------|
| ética/sigilo | care-pillars-deck · exceto-isolate · speak-barrier · exceto-compare |
| antropometria | growth-z-rail · z-band-board · z-classify-tap · z-threshold-trap |
| violência | violence-deck · violence-timeline · reference_table · violence-calendar |
| saúde mental | mental-route-list · mental-protocol-rail · mental-hub-board · mental-step-trap |
| desenvolvimento | dev-pair-rail · dev-objective-flow · dev-vigilance-board · dev-budget-checklist |
| genérico | generic-hub-orbit · generic-care-levels · generic-finance-checklist · generic-versus-blocks |

Ícones genérico: `components/slides/icons/adolescente/AdolescentGenericIcons.tsx` (soft-3D).

---

## Artefatos

| Artefato | Path |
|----------|------|
| Playbook | `data/catalog-migration/handcraft-playbooks/saude-adolescente.json` |
| Visual anchors | `data/catalog-migration/visual-anchors.json` |
| Mapa gestos | `artifacts/glance-os-saude-adolescente-MAPA-8-GESTOS.md` |
| Galeria L3 | `artifacts/l3-visual-gallery-saude-adolescente-index.md` |
| Briefs L3 | `artifacts/l3-brief-saude-adolescente-INDEX.md` |
| Nota-10 (venda) | `artifacts/saude-adolescente-nota10-report.md` |
| Guideline | `lib/guidelines/saudeAdolescente.ts` |

---

## Nota de taxonomia

Âncora de `adolescente_generico` = VF gravidez/sigilo (overlap temático com ética). Aceita como âncora de estilo do ramo genérico; cauda MS/promoção/bucal segue o mesmo molde hub/níveis/checklist/versus.

---

## Próximo passo (opcional — nova conversa)

1. Pacote já vendável — **não** segundo `--promote` rotineiro.
2. Monitoring: `npm run audit:subtopico-health -- --subtopico="Saúde do Adolescente"`
3. Fábrica visual G2 só se quiser ratchet além do piso atual.

**Declaração:** Âncoras do subtópico **Saúde do Adolescente**: **100%** via `audit:anchor-100` (`--require-visual` + assinatura) — pacote **100% pronto** (âncoras + galeria + production_ready).
