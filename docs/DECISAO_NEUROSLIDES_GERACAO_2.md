> **Status: SUPERADO PARCIALMENTE (skin visual).** Trechos que obrigam shell Cyber Clinical (#010409 / neon) no player de NeuroSlides foram superados pelo desfecho A. Autoridade de pele: [uditoria-visual-v2/NEUROSLIDES-VISUAL-SPEC-v2.md](design-system/NEUROSLIDES-VISUAL-SPEC-v2.md) · Direction: [uditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v4.md](design-system/AVANT-VISUAL-DIRECTION-v4.md) · ADR: [DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md](DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md).
> Seções afetadas: menções a 'Skin = Cyber Clinical + cards claros' como obrigação de pele do player. Cérebro 4 tipos permanece vigente.
> Pedagogia (4 tipos, spoiler, barra, gesto) permanece válida nas seções não marcadas.

---
# Decisão — NeuroSlides Geração 2 (Visual OS)

**Data:** 2026-08-04
**Status:** vigente
**Escopo:** experiência visual dos 4 NeuroSlides (estudo reverso) no AVANT — sem alterar a gramática L1 dos tipos

Complementa:
- [`NEUROSLIDES_VISUAL_STRATEGY.md`](NEUROSLIDES_VISUAL_STRATEGY.md) — primitives, glanceable, ondas
- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — L1 estrutura · L2 conteúdo · L3 molde
- [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) — slots pedagógicos
- [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md) — handcraft golden-v1
- Roadmap operacional: [`NEUROSLIDES_GERACAO_2_ROADMAP.md`](NEUROSLIDES_GERACAO_2_ROADMAP.md)

---

## Contexto

O material “moderno” de estudo de TE no mercado (cards coloridos, chip+corpo, compare ✗×✔, trilhos de protocolo) é **idioma visual**, não pedagogia de concurso.

O AVANT já possui uma arquitetura cognitiva mais forte que a maioria dos carrosséis: quatro papéis fixos, gates de spoiler, `danger_zone` por distrator, famílias golden-v1 e moldes L3 por ramo. A tentação de “trocar os 4 modelos de slide por outros 4 do zero” confundiria **pele** com **cérebro** e queimaria schema, handcraft, gates L1–L6 e o hábito do aluno.

Paralelamente, a barra visual ainda não está uniforme em todo o catálogo: há kit de primitives e ondas entregues, mas falhas de glanceable / orçamento de clique / cauda genérica ainda fazem o player parecer “misto” frente ao feed de mercado.

---

## Decisão

Adotar **NeuroSlides Geração 2 = Visual OS**:

| Camada | Regra |
|--------|--------|
| **Cérebro (imutável)** | Os 4 `type` canônicos permanecem: `concept_map` → `logic_flow` → `golden_rule` → `danger_zone` (ordem v2). Schema Zod, slots golden-v1 e gates de pedagogia **não** são reescritos para “novos tipos”. |
| **Corpo (evolui)** | Idioma visual de mercado via `components/slides/primitives/` + boards glanceable + shells `logicFlowShells/` + moldes por ramo (`layout_variant` / `BRANCH_DESIGN_MAP`). |
| **Nome de produto (opcional)** | Chips / títulos no player podem usar rótulos de UX (“Mapa da cobrança”, “Trilho até a letra”, “Decore clínico”, “Arena da pegadinha”) **sem** mudar `type` no JSON. |
| **Metáfora** | Uma metáfora espacial por ramo forte (funil / trilho / arena / calendário…), não quatro “modelos globais novos”. |

**Frase norte:** mesmo estudo reverso de concurso; chassis visual de retenção alinhado ao mercado — e superior a ele porque ensina *esta* prova.

### Barra mínima + ratchet (2026-08-04)

A partir desta data, **todo molde novo ou redesenhado** deve ficar **no nível da demo G2 ou acima**. Cada modelo **só melhora** a barra (ratchet) — nunca regressa.

| Artefato | Papel |
|----------|-------|
| [`NEUROSLIDES_VISUAL_BAR.md`](NEUROSLIDES_VISUAL_BAR.md) | Checklist PASS + ratchet |
| [`artifacts/neuroslides-g2-demo.html`](../artifacts/neuroslides-g2-demo.html) | Piso visual vivo |
| Rule `.cursor/rules/neuroslides-visual-bar.mdc` | Agente em `components/slides/**` |

Não declarar nota-10 visual / ship de molde sem `visual_bar: pass`.

---

## O que Geração 2 **não** é

| Proibido | Motivo |
|----------|--------|
| Substituir os 4 `type` por outros 4 tipos no schema | Quebra L1, goldens, handcraft, affinity, regressão visual |
| Uma variant React por print de Instagram/WhatsApp | Explode manutenção; viola “inspiração ≠ cópia” |
| Re-handcraft em massa só para “parecer moderno” | O ganho está no renderer/molde; conteúdo L2 já passa pelos gates |
| Forçar pastel / chrome de feed no shell NeuroSlides | Skin = Cyber Clinical + cards editoriais claros |
| Desligar `reveal_mode: "tap"` em todo o catálogo | Tap só onde a sequência muda a decisão; boards 0 taps para EXCETO/norma |

---

## Relação com o que já existe

Geração 2 **nomeia e governa** o trabalho já iniciado — não reinicia do zero:

| Já entregue (Strategy Ondas 0–5) | Papel na G2 |
|----------------------------------|-------------|
| Kit `primitives/` + `boardTokens` | Fundação do Visual OS |
| Shells `LogicFocusShell` / `LogicRailShell` / `LogicIsolateShell` | Convergência do `logic_flow` |
| Piloto Adolescente ética + glanceable; Imu EXCETO; Urgências/ADME/PT | Prova de conceito flagship |
| Fábrica Onda 3 (Camada 7 da strategy) | Rollout nota-10 em pacotes `production_ready` |

O roadmap [`NEUROSLIDES_GERACAO_2_ROADMAP.md`](NEUROSLIDES_GERACAO_2_ROADMAP.md) ordena: **primitives estáveis → flagships → Fábrica → cauda genérica premium** — sem schema novo.

---

## Critério de sucesso

| Nível | Critério |
|-------|----------|
| Produto | Aluno reconhece os 4 momentos; visual “de mercado”; retenção = gesto da prova |
| Engenharia | Novas variants **compõem** primitives (exceto exceção documentada) |
| Conteúdo | Zero hardcode de gabarito/letra no TSX; JSON alimenta tudo |
| Escala | Pacote `production_ready` pode fechar nota-10 visual **sem** reabrir handcraft em massa |
| Não-sucesso | Quatro tipos novos no Zod; clone pixel a pixel de feed |

---

## Implicações para docs e agentes

1. **Narrativa de produto / designer:** falar em “4 momentos de estudo” + Visual OS; apontar para este ADR + roadmap.
2. **Docs técnicos / gates:** continuar citando `concept_map` / `logic_flow` / `golden_rule` / `danger_zone`.
3. **Triggers Cursor:** `Design visual:` / `Molde visual:` / `Implementar molde:` / Fábrica nota-10 — sem trigger de “trocar os 4 tipos”.
4. **Mudança de schema dos 4 tipos:** exige **novo ADR** que supersede este — não é caminho padrão.

---

## Documentação canônica

| Artefato | Uso |
|----------|-----|
| Este ADR | Decisão de produto (cérebro vs corpo) |
| [`NEUROSLIDES_GERACAO_2_ROADMAP.md`](NEUROSLIDES_GERACAO_2_ROADMAP.md) | Fases, ordem de pacotes, DoD |
| [`NEUROSLIDES_VISUAL_STRATEGY.md`](NEUROSLIDES_VISUAL_STRATEGY.md) | Primitives, clique, ondas técnicas |
| Skill `avant-neuroslides-visual` | Lei de retenção / anti-cópia |
| [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) | Engenharia React sob pedido explícito |
| [`DESIGNER_FRONT_AVANT.md`](DESIGNER_FRONT_AVANT.md) | Hub Trilho B |
