# NeuroSlides — Barra visual mínima (best-in-market) + ratchet

**Vigente desde:** 2026-08-04  
**Decisão pai:** [`DECISAO_NEUROSLIDES_GERACAO_2.md`](DECISAO_NEUROSLIDES_GERACAO_2.md)  
**Referência viva (mock):** [`artifacts/neuroslides-g2-demo.html`](../artifacts/neuroslides-g2-demo.html)  
**Rule Cursor:** [`.cursor/rules/neuroslides-visual-bar.mdc`](../.cursor/rules/neuroslides-visual-bar.mdc)

---

## Decisão do produto

A partir desta data, **todo NeuroSlide novo ou redesenhado** no AVANT deve ficar **neste nível ou acima** da demo G2 (ética/sigilo — best-in-market).

| Regra | Significado |
|-------|-------------|
| **Piso** | A barra da demo é o **mínimo aceitável** para moldes novos / Fábrica nota-10 / `Implementar molde:` |
| **Ratchet** | Cada molde, variant ou onda **só pode melhorar** a barra (hierarquia, massa, legibilidade, gesto). **Proibido** regressar para branco-no-branco, pastel flat ou tipografia ilegível |
| **Cérebro intacto** | Continua valendo os 4 `type` + golden-v1 + gates L1–L6 |
| **Cauda legado** | Slides já em produção abaixo do piso entram na Fábrica / polish — não se declara “nota-10 visual” sem fechar o checklist |

---

## Checklist PASS (1 segundo no mobile)

Um slide passa a barra se, em ~1s:

1. **Herói único** — dá para apontar o bloco que carrega a decisão (EXCEÇÃO, ✓, ÂNCORA, número crítico…)
2. **Cards com massa** — fill + borda de cor; nunca card branco sumido no paper
3. **Cor = decisão** — keep / exception / command / trap (não decoração)
4. **Tipografia legível** — sans de UI (ex. DM Sans / tokens do app); **sem** display ultra-largo que atrapalha leitura de TE
5. **Âncora tipográfica** — uma palavra ou glifo de outdoor (`NÃO`, `EXCETO`, `!`, `✗`/`✓`) sem poluir o corpo
6. **Footer de transferência** — frase de prova que o aluno leva (FIXAÇÃO / TRANSFERÊNCIA / DECORE)
7. **JSON alimenta tudo** — zero gabarito/letra hardcoded no TSX
8. **Responsivo** — fullscreen no player; coluna legível no desktop (não esticar texto em ultrawide)

Falha em **dois ou mais** itens → **não** ship do molde / não marcar barra visual verde no report.

---

## Ratchet — “sempre melhorar a cada modelo”

Ao criar ou revisar um molde (`Implementar molde:`, Fábrica, Design visual):

| Pergunta | Se “não” |
|----------|----------|
| Este molde fica **pelo menos** no nível da demo + do último flagship do pacote? | Redesign antes de merge |
| Alguma coisa ficou **mais fraca** que o molde anterior do mesmo gesto (compare, rail, isolate…)? | Bloquear — ratchet violado |
| A legibilidade piorou (fonte, contraste, densidade)? | Bloquear |
| Há herói claro + massa nos cards? | Bloquear |

**Melhorar** pode ser: hierarquia mais forte, menos taps inúteis, melhor contraste, melhor mobile, primitivo reutilizável novo — **não** só “cores mais gritantes”.

Registrar no brief ou no `artifacts/<pacote>-nota10-report.md` uma linha:  
`visual_bar: pass | fail` + o que subiu vs. o molde anterior.

---

## Onde vale (escopo)

| Escopo | Obrigatório? |
|--------|----------------|
| Novo `layout_variant` / variant React | Sim |
| Redesign de molde flagship | Sim |
| Fábrica Onda 3 / nota-10 visual | Sim |
| Handcraft só JSON (Modo A) sem React | Aplicar princípios de densidade/gesto; mass visual vem do molde |
| Layout genérico (`grid`, SoftLens…) | Elevar via primitives até o piso; sem inventar 4 tipos novos |
| UI vitrine / dashboard | **Não** — Trilho A (`avant-ui-visual`) |

---

## Referências

| Artefato | Uso |
|----------|-----|
| Demo HTML | Piso visual / comunicação com stakeholders |
| [`components/slides/primitives/`](../components/slides/primitives/) | **Implementação da barra no player** (BoardChrome, PolarityPanel, …) |
| [`NEUROSLIDES_VISUAL_STRATEGY.md`](NEUROSLIDES_VISUAL_STRATEGY.md) | Primitives + ondas |
| Skill `avant-neuroslides-visual` | Lei de retenção + Modo V |
| [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) | Engenharia React |
| [`NEUROSLIDES_GERACAO_2_ROADMAP.md`](NEUROSLIDES_GERACAO_2_ROADMAP.md) | Rollout |
