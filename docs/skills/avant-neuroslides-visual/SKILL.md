---
name: avant-neuroslides-visual
description: >-
  Design visual dos NeuroSlides no AVANT para retenção (gesto = decisão da prova).
  Traduz inspiração pedagógica em metáfora espacial, checklist 4/4 e handoff de molde
  sem copiar carrossel/Instagram. Use com Design visual:, Molde visual:, retenção de
  slides, polish de layout_variant, pós-brief L3, ou quando pedir visual que fixe
  pegadinha/funil/trilho/arena. Não use para UI de vitrine/dashboard (avant-ui-visual)
  nem para escrever conteúdo da questão (handcraft / professor).
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# AVANT — NeuroSlides Visual (retenção)

Skill de **inteligência visual por ramo**: eleva o *como se vê* a decisão da prova para o aluno **lembrar e transferir**.

**Frase norte:** inspiração de retenção, não template de cópia. Visual sem gesto = decoração.

**Onboarding designer (hub):** [`docs/DESIGNER_FRONT_AVANT.md`](../../DESIGNER_FRONT_AVANT.md) — Trilho B (NeuroSlides).

**Não** substitui:
- `avant-golden-anchor-handcraft` / `professor-*` — **o que** ensinar
- `brief-enfermagem` / `brief-lingua-portuguesa` — brief 4/4 / decisão L3
- `avant-json-template` — forma JSON
- `avant-ui-visual` — vitrine, dashboard, landing
- `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` — corpo do brief (linkar)
- `@docs/VARIANT_MOLDS.md` — engenharia React (só com `Implementar molde:`)

**Complementa:** brief + âncora JSON → esta skill calibra gesto/retenção → React sob pedido.

Refs: [`reference-retencao.md`](reference-retencao.md) · ADR G2 [`docs/DECISAO_NEUROSLIDES_GERACAO_2.md`](../../DECISAO_NEUROSLIDES_GERACAO_2.md) · **barra + ratchet** [`docs/NEUROSLIDES_VISUAL_BAR.md`](../../NEUROSLIDES_VISUAL_BAR.md) · piso [`artifacts/neuroslides-g2-demo.html`](../../../artifacts/neuroslides-g2-demo.html) · roadmap [`docs/NEUROSLIDES_GERACAO_2_ROADMAP.md`](../../NEUROSLIDES_GERACAO_2_ROADMAP.md) · estratégia [`docs/NEUROSLIDES_VISUAL_STRATEGY.md`](../../NEUROSLIDES_VISUAL_STRATEGY.md) · kit [`components/slides/primitives/`](../../../components/slides/primitives/) · catálogo Fábrica [`artifacts/pre-onda3-print-to-primitives-catalog.md`](../../../artifacts/pre-onda3-print-to-primitives-catalog.md)

**Piso visual (2026-08-04):** todo molde novo/redesign ≥ demo G2; cada modelo **só melhora** (`visual_bar: pass` + ratchet). Rule: `.cursor/rules/neuroslides-visual-bar.mdc`.

**Galeria visual (playbook):** ramos com `visual_gallery` indexam capturas do player — abrir antes de Design visual / Implementar molde. Ex. PT: `artifacts/l3-visual-gallery-lingua-portuguesa-index.md` · campo em `pedagogical_branches[].visual_gallery`.

---

## Triggers

| Usuário / contexto | Ação |
|--------------------|------|
| `Design visual: <ramo>` / `Molde visual: <ramo>` | Modo **V** — checklist retenção + handoff |
| Pós-brief L3 / “elevar visual dos slides” / retenção | Modo **V** com brief + âncora |
| Handcraft “slides ultra-premium” sem React | Modo **A** — só princípios nos slots (sem arquivo novo) |
| `Implementar molde:` | Ler brief **e** saída desta skill → `VARIANT_MOLDS` (não codar sem pedido) |
| Galeria / capture âncora visual | Atualizar `visual_gallery` no playbook + índice (PNG via `capture:questao-review`) |
| Polish vitrine / login / dashboard | **Não** — `avant-ui-visual` |

---

## Encadeamento

| Ordem | Quem | Papel |
|------:|------|--------|
| 1 | Professor + golden-anchor | Conteúdo / slots |
| 2 | Brief TE ou Brief PT | Metáfora + `layout_variant` 4/4 |
| 3 | **Esta skill** | Barra de retenção · anti-cópia · DoD visual |
| 4 | `VARIANT_MOLDS` | React (pedido explícito) |

Sem brief em ramo `molde_redesign`: pedir brief **antes** de propor bespoke — arquivo em `artifacts/l3-brief-<pacote>-<branch_id>.md` (`@docs/PROMPT_VARIANTES_NEUROSLIDES.md`).  
Sem JSON âncora: pedir âncora **antes** de inventar slots React.  
**Wiring:** brief nomeia `layout_variant`; JSON de catálogo **omite** — não sugerir colar variant no handcraft.

---

## Lei de retenção (obrigatória — 7)

Cada decisão de design responde às 3 perguntas. Sem resposta → genérico + justificativa.

1. **Erro espacial** — o visual torna óbvio o erro que a banca repete (funil, trilho, ✗/✓, núcleo em foco).
2. **Metáfora única 4/4** — os 4 slides compartilham o mesmo universo (não misturar funil + arena + timeline no mesmo pacote sem brief).
3. **Chunking** — ≤5–7 slots/tela; 1 ideia/card; números em bloco.
4. **Toque com significado** — tap revela info que muda a decisão (não confete).
5. **Contraste emocional calibrado** — danger = “quase caí → assim acerto”; sem pânico.
6. **Transferência** — `footer_rule` / último step com estratégia de prova em 1 linha.
7. **JSON alimenta tudo** — 0 hardcode de gabarito/letra/prova no componente.

Detalhe + mapa inspiração→AVANT: [`reference-retencao.md`](reference-retencao.md).

---

## Inspiração ≠ cópia

Referências tipo mapa mental, compare ✗/✓, calendário por faixa, macete visual, decreto em chunks = **fonte de princípios**. Catálogo curado: `reference-retencao.md` §2b. **Não** indexar PNG de feed na `visual_gallery` do playbook.

| Pegar | Deixar no feed |
|-------|----------------|
| Chunking, hierarquia, cor = categoria | Bebê 3D, @handle, like/save, carrossel 2/11 |
| Contraste errado×certo, destaque de número | Poster único com 15–18 cards (estoura mobile) |
| Fluxo / seta / trilho / timeline / chip+corpo | Marca de concorrente / watermark |
| 1 regra + exemplos curtos; grade partida em slides | Apostila inteira numa tela; conteúdo clínico errado “bonito” |

Skin obrigatória NeuroSlides: **Cyber Clinical** (`#010409`, cards claros sobre shell escuro, tokens semânticos). Não forçar pastel Instagram no player.

---

## Modo A — Handcraft (sem React)

Ao revisar/escrever JSON com foco visual:

1. Confirmar metáfora do ramo (brief ou `reference-metaforas` / playbook).
2. Cortar texto que não cabe no gesto (densidade ≤110c em `detail`/`step`/`value`).
3. Garantir par concept_map ↔ danger_zone (mesmo erro, slide 4 instancia por letra).
4. Saída curta (§ Saída).

**Não** gravar artefato novo no Modo A.

---

## Modo V — Design visual / molde (retenção)

Inputs mínimos:

| Campo | Exemplo |
|-------|---------|
| Ramo | `pt_crase`, `urgencias_xabcde_trauma` |
| Brief | `artifacts/l3-brief-…` ou “ok_generico” |
| Âncora | path JSON ou enunciado+gabarito |
| Galeria | `visual_gallery` no playbook (se existir) — status + captures |
| Erro espacial (1 frase) | Crase automática sem funil |

Passos:

0. Se o playbook tiver `visual_gallery` com `status` `pilot`/`ready`: **abrir** `captures_dir` (PNGs do player) antes de redesenhar gesto.
1. Nomear o **gesto** em 1 frase (funil / trilho / arena / matriz / zonas…).
2. Mapear 4 slides → retenção (o que cada um fixa).
3. Listar 3 anti-padrões deste ramo.
4. Confirmar slots JSON (palavras-gatilho) — compatível com brief.
5. Se bespoke: handoff `VARIANT_MOLDS` (variants + wire; brief já nomeou `layout_variant`). **Proibido** implementar React sem `Implementar molde:`.
6. Após âncora `[READY]` + capture: atualizar `visual_gallery` (`pilot` → `ready` pós-React) e o índice `l3_visual_gallery_index` do playbook.
7. Gate DoD (§ Gate).

---

## Checklist rápido por slide

| Slide | Retenção mínima |
|-------|-----------------|
| `concept_map` | Terreno + pegadinha-âncora; **sem** letra |
| `golden_rule` | Tabela/mnemônico portátil; **sem** “Gabarito X” |
| `logic_flow` | `tap`; cada step = decisão; cita letras só aqui |
| `danger_zone` | Compare; `correct` **único** por item |

Mobile: alvos ≥44px; 375px legível; `prefers-reduced-motion` = revelar tudo.

---

## Gate DoD (Modo V)

- [ ] Gesto único nomeado (1 frase)
- [ ] Lei 7/7 aplicável (ou exceção documentada)
- [ ] Metáfora 4/4 coerente com brief
- [ ] Inspiração traduzida (sem cópia de feed)
- [ ] Slots/gatilhos alinhados à âncora
- [ ] Anti-padrões listados
- [ ] Skin cyber / tokens AVANT
- [ ] React só se usuário pediu `Implementar molde:`

Falha → reescrever design mental; **não** escalar molde.

### Onda 3 Fábrica 20 (pacote já `production_ready`)

Não confundir com **Strategy Onda 3** (Imu EXCETO). Checklist completo: [`docs/NEUROSLIDES_VISUAL_STRATEGY.md`](../../NEUROSLIDES_VISUAL_STRATEGY.md) Camada 7 · catálogo [`artifacts/pre-onda3-print-to-primitives-catalog.md`](../../../artifacts/pre-onda3-print-to-primitives-catalog.md) · `reference-retencao.md` §2c.

| Reusar | `Implementar molde:` |
|--------|----------------------|
| Gesto já no kit/mapa do ramo; polish glanceable | Gesto espacial **novo** ou ≥5 questões sem board |

---

## Saída

### Modo A (após JSON)

```text
Visual: <gesto> | Ramo: <id>
Retenção: <1 frase — o que o aluno leva>
L3: genérico premium | bespoke <variant> — <motivo>
```

### Modo V

```text
## Design visual — <ramo>
Gesto: …
Erro espacial: …
4/4: concept=… | golden=… | logic=… | danger=…
Inspiração → AVANT: <3 bullets>
Anti-padrões: …
Handoff: brief <path> | React: não | Implementar molde: <se pedido>
DoD: PASS | FAIL — <gap>
```

---

## Anti-padrões (nunca)

- Copiar layout de Instagram / concorrente
- UI bonita sem JSON âncora
- Gabarito no componente ou nos slides 1–2
- >7 elementos competindo na tela
- Animação sem significado
- Misturar `avant-ui-visual` (produto) com molde de aula
- Codar React no mesmo passo do “Design visual:” sem autorização
- Drift de ramo (ex. IPCS em questão sem CVC)

---

## Invocação rápida

```text
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@artifacts/l3-brief-<pacote>-<ramo>.md
@<path-json-ancora>

Design visual: <branch_id>
Erro espacial: <1 frase>
Gere checklist de retenção 4/4 + handoff (sem React).
```
