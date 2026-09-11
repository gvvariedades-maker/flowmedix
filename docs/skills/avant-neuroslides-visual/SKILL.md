---
name: avant-neuroslides-visual
description: >-
  Design visual dos NeuroSlides no AVANT para retenção (gesto = decisão da prova).
  Entrada preferida: Composer visual: (banco → Modo V → crítica atelier → handoff).
  Também Design visual:, Molde visual:, Atelier visual:, Crítica atelier:, retenção,
  polish de layout_variant, pós-brief L3. Não use para UI de vitrine/dashboard
  (avant-ui-visual) nem para escrever conteúdo da questão (handcraft / professor).
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# AVANT — NeuroSlides Visual (retenção)

Skill de **inteligência visual por ramo**: eleva o *como se vê* a decisão da prova para o aluno **lembrar e transferir**.

**Frase norte:** inspiração de retenção, não template de cópia. Visual sem gesto = decoração.

**Entrada preferida (Agent-first):** `Composer visual: <ramo>` — [`docs/PROMPT_COMPOSER_VISUAL.md`](../../PROMPT_COMPOSER_VISUAL.md) · rule [`.cursor/rules/composer-visual.mdc`](../../../.cursor/rules/composer-visual.mdc) · **banco** [`artifacts/composer-visual-bank.md`](../../../artifacts/composer-visual-bank.md).

**Papéis:** Composer = orquestrador (banco → gesto → crítica → handoff). Atelier = crítica glanceable (`ATELIER_PASS` / `FAIL`). Esta skill = Modo V / Modo A (retenção 4/4).

**Onboarding designer (hub):** [`docs/DESIGNER_FRONT_AVANT.md`](../../DESIGNER_FRONT_AVANT.md) — Trilho B (NeuroSlides).

**Não** substitui:
- `avant-golden-anchor-handcraft` / `professor-*` — **o que** ensinar
- `brief-enfermagem` / `brief-lingua-portuguesa` — brief 4/4 / decisão L3
- `avant-json-template` — forma JSON
- `avant-ui-visual` — vitrine, dashboard, landing
- `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` — corpo do brief (linkar)
- `@docs/VARIANT_MOLDS.md` — engenharia React (só com `Implementar molde:`)

**Complementa:** brief + âncora JSON → Composer/esta skill calibra gesto/retenção → React sob pedido.

Refs: [`reference-retencao.md`](reference-retencao.md) (§ Banco Composer) · **banco 8 gestos** [`artifacts/composer-visual-bank.md`](../../../artifacts/composer-visual-bank.md) · Composer [`docs/PROMPT_COMPOSER_VISUAL.md`](../../PROMPT_COMPOSER_VISUAL.md) · ADR G2 [`docs/DECISAO_NEUROSLIDES_GERACAO_2.md`](../../DECISAO_NEUROSLIDES_GERACAO_2.md) · **pele vigente** [`docs/design-system/NEUROSLIDES-VISUAL-SPEC-v2.md`](../../design-system/NEUROSLIDES-VISUAL-SPEC-v2.md) · Direction [`AVANT-VISUAL-DIRECTION-v4.md`](../../design-system/AVANT-VISUAL-DIRECTION-v4.md) · **barra + ratchet** [`docs/NEUROSLIDES_VISUAL_BAR.md`](../../NEUROSLIDES_VISUAL_BAR.md) · piso [`artifacts/neuroslides-g2-demo.html`](../../../artifacts/neuroslides-g2-demo.html) · roadmap [`docs/NEUROSLIDES_GERACAO_2_ROADMAP.md`](../../NEUROSLIDES_GERACAO_2_ROADMAP.md) · estratégia [`docs/NEUROSLIDES_VISUAL_STRATEGY.md`](../../NEUROSLIDES_VISUAL_STRATEGY.md) · kit primitives [`components/slides/primitives/`](../../../components/slides/primitives/) · catálogo Fábrica [`artifacts/pre-onda3-print-to-primitives-catalog.md`](../../../artifacts/pre-onda3-print-to-primitives-catalog.md) · **atelier (crítica)** [`docs/NEUROSLIDES_ATELIER_KIT.md`](../../NEUROSLIDES_ATELIER_KIT.md) · [`docs/PROMPT_ATELIER_VISUAL.md`](../../PROMPT_ATELIER_VISUAL.md)

**Piso visual (2026-08-04):** todo molde novo/redesign ≥ demo G2; cada modelo **só melhora** (`visual_bar: pass` + ratchet). Rule: `.cursor/rules/neuroslides-visual-bar.mdc`.

**Galeria visual (playbook):** ramos com `visual_gallery` indexam capturas do player — abrir antes de Design visual / Implementar molde. Ex. PT: `artifacts/l3-visual-gallery-lingua-portuguesa-index.md` · campo em `pedagogical_branches[].visual_gallery`.

**Composer → Atelier:** `Composer visual:` abre banco + demo G2 + 1–2 âncoras ouro do `gesture_id` → Modo V (esta skill) → auto-crítica atelier → handoff Modo A / reuso / `Implementar molde:` (só se gesto novo ou ≥5 sem board). Atelier isolado (`Atelier visual:` / `Crítica atelier:`) = só crítica ou ciclo sem orquestrador completo.

---

## Triggers

| Usuário / contexto | Ação |
|--------------------|------|
| **`Composer visual: <ramo>`** (preferido) | Pipeline [`PROMPT_COMPOSER_VISUAL`](../../PROMPT_COMPOSER_VISUAL.md): banco → Modo V → crítica → handoff; rule `composer-visual` |
| `Design visual: <ramo>` / `Molde visual: <ramo>` | Modo **V** — checklist retenção + handoff (sem orquestração completa) |
| `Atelier visual:` / `Crítica atelier:` | Kit [`NEUROSLIDES_ATELIER_KIT`](../../NEUROSLIDES_ATELIER_KIT.md) + [`PROMPT_ATELIER_VISUAL`](../../PROMPT_ATELIER_VISUAL.md) — crítica glanceable (Composer = orquestrador; Atelier = crítica) |
| Pós-brief L3 / “elevar visual dos slides” / retenção | Preferir `Composer visual:`; senão Modo **V** com brief + âncora |
| Handcraft “slides ultra-premium” sem React | Modo **A** — só princípios nos slots (sem arquivo novo); ou Composer + `Só Modo A` |
| `Implementar molde:` | Ler brief **e** saída desta skill → `VARIANT_MOLDS` (não codar sem pedido) |
| Galeria / capture âncora visual / prints AVANT anexados | Atualizar `visual_gallery` no playbook + índice (PNG em `artifacts/questao-review/<slug>/`); se elevou ouro → linha no banco (≤2 âncoras/gesto) |
| Polish vitrine / login / dashboard | **Não** — `avant-ui-visual` |

---

## Encadeamento

| Ordem | Quem | Papel |
|------:|------|--------|
| 1 | Professor + golden-anchor | Conteúdo / slots |
| 2 | Brief TE ou Brief PT | Metáfora + `layout_variant` 4/4 |
| 3 | **Composer** (`Composer visual:`) | Banco 8 gestos → Modo V (esta skill) → crítica atelier → handoff |
| 4 | **Esta skill** (Modo V / A) | Barra de retenção · anti-cópia · DoD visual |
| 5 | Atelier (`Crítica atelier:`) | Glanceable 8/8 → `ATELIER_PASS` \| `FAIL` |
| 6 | `VARIANT_MOLDS` | React (pedido explícito `Implementar molde:`) |
| 7 | Fábrica (`Fábrica visual G2:`) | Cobertura por pacote — Composer **precede** se gallery `pending`/`thin`/ausente ([`PROMPT_FABRICA` § Pré-passo](../../PROMPT_FABRICA_VISUAL_G2.md)) |

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

Skin obrigatória NeuroSlides no player: **editorial clara** (desfecho A) — ver [`NEUROSLIDES-VISUAL-SPEC-v2.md`](../../design-system/NEUROSLIDES-VISUAL-SPEC-v2.md) (`bg-slate-100`, `toEditorialTheme`, pastéis por tipo). **Não** restaurar shell Cyber `#010409`. Evitar pastel Instagram genérico / feed chrome.

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

0. Se veio de `Composer visual:` (ou elevação de ramo): abrir [`composer-visual-bank.md`](../../../artifacts/composer-visual-bank.md) → escolher `gesture_id` + **1–2** âncoras ouro + demo G2. Se playbook tiver `visual_gallery` `pilot`/`ready`: **abrir** `captures_dir` antes de redesenhar.
1. Nomear o **gesto** em 1 frase (alinhar ao `gesture_id` do banco quando existir).
2. Mapear 4 slides → retenção (o que cada um fixa).
3. Listar 3 anti-padrões deste ramo.
4. Confirmar slots JSON (palavras-gatilho) — compatível com brief.
5. Auto-crítica atelier (se Composer ou `Atelier visual:`) → `ATELIER_PASS` \| `FAIL`; FAIL → reescrever Modo V, **não** React.
6. Se bespoke: handoff `VARIANT_MOLDS` só após PASS e se gesto novo / ≥5 sem board. **Proibido** React sem `Implementar molde:`.
7. Após âncora `[READY]` + capture: atualizar `visual_gallery` e, se elevou ouro, no máx. 1 path na linha do banco (≤2 âncoras/gesto).
8. Gate DoD (§ Gate).

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

**Preferido (orquestrador):**

```text
@artifacts/composer-visual-bank.md
@docs/PROMPT_COMPOSER_VISUAL.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@artifacts/l3-brief-<pacote>-<ramo>.md
@<path-json-ancora>

Composer visual: <branch_id>
Erro espacial: <1 frase>
```

**Modo V isolado (sem pipeline Composer):**

```text
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@artifacts/composer-visual-bank.md
@artifacts/l3-brief-<pacote>-<ramo>.md
@<path-json-ancora>

Design visual: <branch_id>
Erro espacial: <1 frase>
Gere checklist de retenção 4/4 + handoff (sem React).
```
