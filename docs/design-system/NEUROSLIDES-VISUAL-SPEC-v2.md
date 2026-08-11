# NeuroSlides Visual Spec v2 — pele editorial clara (player)

**Status:** vigente (pele / apresentação)
**Data:** 2026-08-11
**Desfecho:** **A**
**ADR:** [`../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md`](../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md)
**Direction:** [`tokens/AVANT-VISUAL-DIRECTION-v4.md`](AVANT-VISUAL-DIRECTION-v4.md)
**SHA:** `f5ee914eacfd2de66553e87de45676314290b2d5`

> A especificação v2 substitui o antigo contrato visual Cyber no **player de estudo reverso** pelo sistema claro/editorial atualmente implementado (`bg-slate-100`, `toEditorialTheme`, `slideSurface` Opção B).

### Autoridades de cérebro (não reescritas aqui)

| Doc | Papel |
|-----|--------|
| [`DECISAO_NEUROSLIDES_GERACAO_2.md`](../DECISAO_NEUROSLIDES_GERACAO_2.md) | Visual OS — 4 tipos imutáveis |
| [`NEUROSLIDES_VISUAL_BAR.md`](../NEUROSLIDES_VISUAL_BAR.md) | Piso + ratchet |
| [`PROMPT_VARIANTES_NEUROSLIDES.md`](../PROMPT_VARIANTES_NEUROSLIDES.md) | Brief 4/4; trechos Cyber de skin = SUPERADO PARCIALMENTE |
| [`GOLDEN_CONTENT_STANDARD.md`](../GOLDEN_CONTENT_STANDARD.md) | Slots de conteúdo |

Ordem canônica obrigatória:

1. `concept_map`
2. `logic_flow`
3. `golden_rule`
4. `danger_zone`

---

## Regras transversais

- Uma ideia central por slide.
- Visual com valor didático (gesto = decisão da prova); sem decoração vazia.
- Sem marcadores temporários tipo `?` como conteúdo.
- Sem truncar conteúdo essencial atrás de chrome fixo.
- Controles acessíveis; alvos ≥44px no mobile quando aplicável.
- Linguagem adequada a Técnico de Enfermagem.
- Sem spoiler antes do momento pedagógico.
- `logic_flow` revela raciocínio e gabarito (`reveal_mode: "tap"` em conteúdo novo).
- `golden_rule` consolida a regra — **sem** row "Gabarito letra X".
- `danger_zone` = pegadinhas / erros frequentes; `items[].correct` único por distrator.
- Sem IA adicionada ao runtime nesta especificação.

## Pele global do reverso (confirmada)

| Elemento | Implementação | Origem |
|----------|---------------|--------|
| Shell fullscreen | `bg-slate-100` | `AvantLessonPlayer.tsx` |
| Chrome / CTAs | `.btn-editorial-primary` / `.btn-editorial-outline` | idem |
| Tema de slide | `finalizeSlideTheme` → `toEditorialTheme` | `themeGenerator.ts` |
| Página default | `SLIDE_PAGE_BG` = `bg-slate-50` | `slideSurface.ts` |
| Shell do slide | `SLIDE_SHELL_CARD` transparente full-bleed | idem |
| Cards de conteúdo | branco + borda `rgba(242,101,34,0.28)` | `SLIDE_CARD*` |

**Cyber `#010409` / glass neon:** não é a pele vigente do player. Tokens `:root` Cyber permanecem no CSS como legado/base.

### Exceções Cyber residuais (fora do fullscreen player)

| Contexto | Exemplo | Motivo | Duração |
|----------|---------|--------|---------|
| Demo landing | `DemoInterativa.tsx` `#010409` | Bloco demo legado | Não localizado prazo — `LEGADO_INTENCIONAL` / dívida |
| `:root` sem theme | `globals.css` | Base CSS | Enquanto houver superfícies sem `data-theme` |

---

## 1. `concept_map`

| Aspecto | Spec |
|---------|------|
| Finalidade | Enquadramento do tema — **sem** gabarito/letra |
| Momento | 1º slide do reverso |
| Spoiler | Proibido revelar gabarito |
| Anatomia | Itens (ícone + label + detail); footer_rule opcional |
| Hierarquia | Título tipo (`text-pink-800`) + grade/stack de conceitos |
| Fundo | Gradiente branco → `#FCE7F3` → `#E0ECFF` |
| Densidade | Preferir glanceable; evitar parede de texto |
| Mobile/Desktop | Shell full-bleed; scroll interno no card shell |
| Truncamento | Não truncar essencial; scroll vertical no shell |
| Exemplos proibidos | Gabarito no mapa; shell Cyber; decoração sem pedagogia |

## 2. `logic_flow`

| Aspecto | Spec |
|---------|------|
| Finalidade | Sequência de eliminação até a letra |
| Momento | 2º slide |
| Spoiler | **Permitido** — único lugar canônico do gabarito no fluxo |
| Anatomia | `steps: string[]`; `reveal_mode: "tap"` em conteúdo novo |
| Hierarquia | Título azul (`text-blue-700`) + passos progressivos |
| Fundo | Gradiente branco → `#DBEAFE` → `#C7DCFF` |
| Comportamento | Tap revela passo a passo |
| Exemplos proibidos | Spoiler de letra em slides anteriores; steps como objetos |

## 3. `golden_rule`

| Aspecto | Spec |
|---------|------|
| Finalidade | Decore / tabela normativa |
| Momento | 3º slide |
| Spoiler | Sem "Gabarito letra X" |
| Anatomia | `content` e/ou `rows[]` (reference_table) |
| Hierarquia | Título âmbar (`text-amber-700`) + regra/tabela |
| Fundo | Gradiente branco → `#FEF3C7` → `#FDE9B8` |
| Exemplos proibidos | Spoiler precoce; texto genérico sem âncora na questão |

## 4. `danger_zone`

| Aspecto | Spec |
|---------|------|
| Finalidade | Pegadinhas e erros frequentes |
| Momento | 4º slide |
| Spoiler | Compara distrator × correto; não antecipar no concept_map |
| Anatomia | `content` + `items[]` com `label`, `detail`, `correct` |
| Hierarquia | Título vermelho (`text-red-700`) + compare |
| Fundo | Gradiente branco → `#FEE2E2` → `#FFD4D8` |
| Regra L2 | Cada `correct` único; sem copy-paste entre letras |
| Exemplos proibidos | Mesma justificativa em dois itens; vazar vocabulário de outro ramo |

## Loading / erro / fullscreen / navegação / a11y

- Fullscreen: player (`fixed` / preview `absolute`) com fundo `slate-100`.
- Navegação: chrome editorial do player (não reintroduzir nav neon).
- Loading/erro: padrões do player — não inventar estados aqui.
- A11y: contraste texto slate em pastéis; foco visível; conteúdo não coberto por barras fixas.

## Relação com G2 / Composer / Atelier

Pedagogia de gesto, barra e ratchet **permanecem**. A obrigação de "shell Cyber `#010409`" está **revogada** no player.
