# Piloto Composer visual — `pt_concordancia`

| Campo | Valor |
|-------|--------|
| Data | 2026-08-08 |
| Trigger | `Composer visual: pt_concordancia` |
| Pacote | Concordância verbal e nominal / Língua Portuguesa |
| Âncora | `examples/questao-premium-vunesp-portugues-concordancia-nucleo-sjrp.json` |
| Brief | `artifacts/l3-brief-lingua-portuguesa-pt_concordancia.md` |
| Preview | http://localhost:3000/dev/slide-mold-review?branch=pt_concordancia |
| Captures | `artifacts/questao-review/questao-premium-vunesp-portugues-concordancia-nucleo-sjrp/` |
| Playbook | `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` → `visual_gallery.status=ready` |

---

## 1) Banco + piso

| Item | Escolha |
|------|---------|
| `gesture_id` | **`focus`** (núcleo em foco — M13) |
| Refs ouro (≤2) | Preview term-matrix / SoftStack (vizinho tap-focus) · demo G2 |
| Gallery prévia | `pending` (moldes alias term-matrix; sem captures_dir) |
| React novo? | **Não** — boards `pt-subject-focus-*` já wired (alias `LogicFlowPtTermMatrixTapFlow` + `LogicFocusShell`) |

---

## 2) Modo V

## Design visual — pt_concordancia

Gesto: `focus` — 1 card + letter rail; tap só muda a decisão (núcleo → verbo → letra)

Erro espacial: aluno concorda com o vizinho do verbo e deixa o núcleo posposto/existencial sumir

4/4: concept=`pt-subject-focus-deck` (pilares pergunta-teste) | golden=`pt-subject-focus-board` (células NÚCLEO→VERBO) | logic=`pt-subject-focus-tap-flow` (`LogicFocusShell`) | danger=`pt-subject-trap-arena` (compare ✗/✓)

Primitives preferidos (banco): `LogicFocusShell` · `BoardChrome` · `CategoryStrip` · `PolarityPanel` (arena)

Inspiração → AVANT:

- Herói tipográfico «NÚCLEO» / «NÚCLEO → VERBO» (não poster de feed)
- Letter rail elimina distratores; B fica vencedor só no logic
- Arena instancia a mesma falha (núcleo errado) por letra

Anti-padrões:

1. Chrome «Matriz de termos/cargos» do alias term-matrix no ramo concordância (dívida de copy — sem React neste piloto)
2. >3 taps sem cortar chute (âncora tem 8 steps; aceito por paridade term-matrix ready; densificar slots = Modo A futuro)
3. Spoiler de gabarito no concept_map

Orçamento de clique (família conceito/eliminação): logic tap com FocusShell; compare aberto no danger

Handoff: brief ok · React: **não** (reuso) · Modo A: opcional densificar steps

DoD retenção: **PASS** (gesto único + metáfora núcleo + JSON alimenta)

---

## 3) Crítica atelier (glanceable 8/8)

| # | Item | Veredito |
|---|------|----------|
| 1 | Herói único apontável | **pass** — «NÚCLEO EM FOCO» / «NÚCLEO → VERBO» |
| 2 | Cards com massa | **pass** |
| 3 | Cor = decisão | **pass** — keep / trap / letter winner |
| 4 | Tipografia legível | **pass** (mobile-375) |
| 5 | Âncora tipográfica | **pass** — NÚCLEO / ✗✓ arena |
| 6 | Footer de transferência | **pass** — «Núcleo em foco — não o vizinho do verbo.» |
| 7 | JSON alimenta tudo | **pass** — 0 letra hardcoded no TSX |
| 8 | Responsivo 375 | **pass** — capture + Playwright DoD |

**Veredito: `ATELIER_PASS`**

Residual (não bloqueia): eyebrow/chip «Matriz*» do alias term-matrix — elevar com `Implementar molde:` (copy de ramo), fora do escopo deste piloto.

---

## 4) Handoff + capture

| Ação | Resultado |
|------|-----------|
| React | Proibido / não pedido — reuso boards |
| `capture:questao-review` | desktop + `--viewport=mobile-375` → 01–06 PNGs |
| `visual_gallery` | `pending` → **`ready`** + `captures_dir` |
| Banco Composer | gesto `focus` **`thin` → `gold`** (1 path ouro) |

---

## 5) Report de barra

```text
visual_bar: pass
gesto: focus
vs_anterior: gallery pending sem captures → ready com âncora player; focus thin → gold no banco
anti_regressao: Playwright «PT Concordância» 5/5 (desktop+mobile+DoD 375) — sem React novo
```

Comando:

```bash
npx playwright test e2e/visual-mold-regression.spec.ts --grep "PT Concordância" --project=chromium
```

---

## Critério de sucesso (plano Fase 2)

- [x] `ATELIER_PASS` + checklist 8/8
- [x] Preview `/dev/slide-mold-review?branch=pt_concordancia`
- [x] Sem React espontâneo
- [x] `visual_gallery` `ready` + captures
- [x] Report neste arquivo
- [x] Regressão L3 Playwright do pacote
