---
name: avant-ui-visual
description: >-
  Designer de UI para o app AVANT (Next.js, Tailwind, Cyber Clinical + Editorial v2).
  Prioridade de craft: vitrine (/estudar) + player (AvantLessonPlayer) — qualidade
  micro-SaaS profissional. Use ao melhorar componentes, telas, vitrine, player,
  dashboard, design system, CSS, hierarquia visual, microinterações, polish premium
  ou rebrand. Triggers: Visual:, Polish vitrine, Polish player, micro-SaaS, craft UI.
  Escopo: app Next.js (vitrine, player, dashboard, tokens da landing); não ebooks HTML offline nem copy/CRO de LP.
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# AVANT UI Visual — Cyber Clinical + Editorial v2

> **Rule operacional (triggers):** [`.cursor/rules/avant-ui-visual.mdc`](../../../.cursor/rules/avant-ui-visual.mdc) — ativa com `Visual:`, `Polish vitrine`, `Polish player`, `micro-SaaS`, `craft UI`. Cópia versionada: [`docs/cursor/avant-ui-visual.mdc`](../../../docs/cursor/avant-ui-visual.mdc).  
> **Esta skill** = conhecimento detalhado; a **rule** = quando executar + checklist ship.  
> **Onboarding humano (hub):** [`docs/DESIGNER_FRONT_AVANT.md`](../../DESIGNER_FRONT_AVANT.md) — App UI vs NeuroSlides; ordem de leitura.

Skill derivada da VEGA, **só com o que melhora o front do app**. Stack obrigatória: Next 16, React 19, TypeScript, Tailwind 4, Radix/shadcn, Framer Motion quando já houver motion no arquivo.

**Prioridade de craft (2026):** vitrine + player → depois dashboard/analytics → landing (só tokens/shell visual; copy/CRO fora desta skill).

Detalhe operacional: [`reference-microsaas-craft.md`](reference-microsaas-craft.md).

## Antes de codar

1. Ler o componente adjacente e **estender** — não redesenhar do zero.
2. Identificar o tema da rota:
   - **Editorial v2** — dashboard/vitrine/player enunciado (`useEditorialTheme`, `html[data-theme='editorial']`): fundo claro, verde `#8fe020`, `.card-elevated`, `.btn-editorial-*`.
   - **Cyber Clinical** — NeuroSlides fullscreen, preview reverso, admin escuro: fundo `#010409`, cyan neon, `.glass-panel`, `.text-neon-gradient`.
3. Consultar capturas em `docs/auditoria-visual-v2/screenshots/avant-editorial-v2/` e backlog em `docs/auditoria-visual-v2/*-BACKLOG.md`.
4. Se a tarefa for **vitrine ou player**, seguir a seção [Vitrine + Player](#vitrine--player-prioridade-craft) e o checklist do reference.

## Craft micro-SaaS (disciplina, não clone)

Referência de **disciplina**: Stripe / Linear / Vercel — clareza, um acento, tipografia âncora, microestados, whitespace, performance. **Não** clonar paleta dark-cinza genérica.

| Princípio | No AVANT |
|-----------|----------|
| Monocromático + 1 acento | Editorial: slate + `#8fe020` só em CTA/foco. Cyber: preto + cyan só em ação. Sem terceira cor decorativa. |
| Produto no centro | Questão, progresso, NeuroSlide real — não ilustração genérica. |
| Menos chrome | Um CTA primário por viewport; secundário como texto/ghost. |
| Microestados | hover, `focus-visible`, active, disabled, loading, empty, skeleton. |
| Performance = design | Motion leve e local; sem animação decorativa em listas longas. |
| Dois mundos | Editorial na área logada/enunciado; **cyber só no reverso** — nunca uniformizar tudo em cinza SaaS. |

## Tokens (fonte: `app/globals.css`)

**Nunca inventar paleta paralela.** Fonte canônica: `app/globals.css` (editorial `#8fe020`). Usar CSS vars ou classes utilitárias existentes.

| Semântica | Cyber (`:root`) | Editorial (`data-theme='editorial'`) |
|-----------|-----------------|--------------------------------------|
| Fundo base | `--color-surface-0` `#010409` | `#f1f5f9` (v2.1 soft slate) |
| Superfície card | `.glass-panel` / `slate-900/80` | `.card-elevated` + `--shadow-editorial-sm/md` |
| Marca / foco | `--color-brand` `#00f2ff` | `#8fe020` (`--color-brand-text` `#3d6b0f`) |
| Sucesso | `--color-success` `#00ff88` | `#16a34a` |
| Erro | `--color-danger` `#ff0055` | `#dc2626` |
| Aviso | `--color-warning` `#ffb800` | tokens editoriais em globals |
| Texto | `--color-text-primary/secondary` | `text-slate-900`, `text-slate-600` |

Bordas cyber: `border-white/10`. Editorial: `border-slate-200`.

## Utilitários e componentes (reutilizar)

| Necessidade | Usar |
|-------------|------|
| Painel glass (cyber) | `.glass-panel` |
| Alternativa questão (cyber) | `.btn-option` |
| Alternativa questão (editorial) | `.btn-option-editorial` |
| Acerto / erro feedback | `.card-success-static` / `.card-error-static` ou `card-success-editorial` |
| Título hero cyber | `.text-neon-gradient` |
| Badge status | `NeonBadge` (`brand`, `success`, `neutral`) — editorial: variantes discretas |
| Botão | `@/components/ui/button` + `cn()` |
| Layout dashboard | `DashboardShell`, `pb-safe` / `pt-safe` |
| Slides | `NeuroSlide` + `themeGenerator` — cores por `meta.subtopico` |
| Vitrine | `VitrineClient`, `VitrinePageHeader`, `VitrineToolbar`, `VitrineQuickFilters`, `VitrineSubjectCard`, `VitrineResumeCard`, `VitrineProgressRing`, `VitrineQuestaoList`, `VitrinePaginationBar`, `VitrineSubjectSheet`, `VitrineCatalogStatsStrip` / `Skeleton` |
| Player | `AvantLessonPlayer` — shell editorial → reverso cyber |

Ícones: **Lucide** via `lucide-react` (não SVG inventado). Gap real / diagrama custom → skill [`svg-quality`](../svg-quality/SKILL.md) + refs [`docs/design-refs/svg-models/`](../../design-refs/svg-models/README.md) · trigger `SVG:`.

## Hierarquia de decisão (da VEGA — válida)

1. **Funcionalidade antes de estética** — menos chrome, mais scanability.
2. **Legibilidade OLED / WCAG AA** — texto secundário não pode sumir no escuro; mínimo ~4.5:1.
3. **Toque ≥ 44×44px** em CTAs, chips e ícones clicáveis (mobile).
4. **Microinteração em feedback** — acerto/erro no player e simulados (motion leve, 200–300ms).
5. **Glassmorphism só em** cards de progresso, modais, overlays cyber — **nunca** fundo de página inteira.

## Vitrine + Player (prioridade craft)

### Vitrine `/estudar` (editorial)

Componentes: `components/vitrine/*`.

- Stats compactos (`VitrineCatalogStatsStrip`); evitar “hero KPI” que empurra a lista.
- Uma hierarquia de título por viewport (sem H1 duplicado sticky + main).
- Grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` — evitar 4 colunas que truncam títulos.
- Card (`VitrineSubjectCard`): título, progresso (`VitrineProgressRing` / barra ≥4px), **um** CTA — labels canônicos `Iniciar` / `Continuar` / `Revisar`.
- Toolbar sticky: `VitrineToolbar` + `VitrineQuickFilters`; chip ativo óbvio; alvo ≥44px.
- Estados obrigatórios: skeleton (`VitrineCatalogStatsSkeleton`), empty, zero resultados de filtro.
- Acento só no CTA/foco verde; sem terceira cor decorativa no grid.

### Player `AvantLessonPlayer` (shell editorial → reverso cyber)

- Enunciado + alternativas dominam o viewport; chrome mínimo.
- Alternativas: `.btn-option-editorial` + estados hover / `focus-visible` / selected / disabled.
- Feedback pós-resposta: borda + fundo semântico (`success` / `danger`), **não** só cor de texto.
- Um CTA primário por passo (responder / continuar); secundário como texto ou ghost.
- NeuroSlides fullscreen: **sempre cyber** — não forçar tokens editoriais nos slides.
- Handoff claro: área logada clara → lab escuro; contraste intencional, não “suavizar” o reverso.

### NeuroSlides (sempre cyber)

- Layout automático por subtópico — não adicionar `template`/`layout_variant` sem motivo.
- `logic_flow` com `reveal_mode: "tap"` em conteúdo novo.
- Visual de moldes: skill `avant-neuroslides-visual` quando o pedido for retenção/gesto espacial.

### Landing `/` (ponte visual — não CRO)

- Tokens: corpo claro + CTA `#8fe020`; único bloco escuro = preview reverso
- **Não** roxo/teal `#6735BC` / `#00CDA0`; drift `#BEF264` → `--color-brand`
- Copy/CRO da LP: ver [`docs/LP_CONVERSA.md`](../../LP_CONVERSA.md) (runbook) · pesquisa [`docs/LP_RESEARCH_CAPABILITY_MAP.md`](../../LP_RESEARCH_CAPABILITY_MAP.md) · brief histórico `docs/auditoria-visual-v2/LANDING-AVANT-v3.md` · copy em `lib/marketing/landingCopy.ts` (fora desta skill)

## Benchmark (por que AVANT pode ganhar)

Concorrentes (Gran, Estratégia, QConcursos): light genérico, pouca identidade dark/premium.  
AVANT diferencia com: **dark nativo no reverso**, tokens semânticos, mobile-first real, estudo reverso guiado, craft de vitrine/player no nível micro-SaaS.

Ao propor mudança, nomeie **o que supera** (ex.: “stats compactos como Estudei, mas com progresso por assunto visível”).

## Formato de entrega

**[DECISÃO]** — 2–3 linhas: padrão superado + tema (editorial/cyber) + superfície (vitrine/player/…).

**[CÓDIGO]** — diff focado em `.tsx` / `globals.css`; comentário só se lógica não óbvia.

**[VERIFICAÇÃO]** — checklist:
- Desktop 1440 e mobile 375 (`pb-safe`, sem overflow horizontal)
- Contraste AA e alvo de toque ≥44px
- Tema correto na rota (editorial vs cyber)
- Se vitrine/player: empty + loading + um CTA primário por viewport (ver reference)

## Anti-padrões (proibidos)

- ES5, HTML monolítico, zero-framework — **fora do escopo do app**
- `bg-blue-500` / paleta Tailwind genérica fora dos tokens AVANT
- Indigo/roxo legado na vitrine (migrar para brand editorial/cyan cyber)
- Card-dentro-de-card sem necessidade
- Glass em `main`/`body` inteiro
- Redesenhar componente existente em outro arquivo duplicado
- Google Fonts / CDN externo novo
- `console.log` — usar `logger` se precisar log server-side
- “Linearizar” o reverso (tirar cyber dos NeuroSlides)
- Três CTAs iguais competindo no mesmo viewport
- Feedback de acerto/erro só com cor de texto

## O que veio da VEGA e foi descartado

| Descartado | Motivo |
|------------|--------|
| ES5, `var`, sem arrow functions | TypeScript + React |
| Tokens `--bg-primary`, `.glass-card` | Duplicam `globals.css` |
| Offline-first, Android 5+ | App Next.js |
| Entrega HTML copy-paste | Entrega componentes React |
| oklch obrigatório | Tailwind + hex nos tokens já bastam |

## Direção de cor (obrigatório)

**Fonte canônica:** [`docs/auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md`](../../docs/auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md)

- Marca editorial: `--color-brand` `#8fe020` — **não** substituir por `#00a86b` (skill light HTML).
- Acerto: `--color-success` `#16a34a` — separado da marca.
- NeuroSlides: sempre cyber; não light mode.

Se outra skill trouxer tokens `--bg`, `--brand`, `--t1`: mapear com a tabela em Visual Direction v3.

## Referências no repo

| Arquivo | Conteúdo |
|---------|----------|
| [`docs/DESIGNER_FRONT_AVANT.md`](../../DESIGNER_FRONT_AVANT.md) | Hub onboarding designer front |
| [`.cursor/rules/avant-ui-visual.mdc`](../../../.cursor/rules/avant-ui-visual.mdc) | Rule operacional — triggers, checklist ship, anti-padrões |
| [`docs/cursor/avant-ui-visual.mdc`](../../../docs/cursor/avant-ui-visual.mdc) | Cópia versionada da rule |
| [`reference-microsaas-craft.md`](reference-microsaas-craft.md) | Checklist vitrine + player, estados, anti-padrões craft |
| `docs/LP_CONVERSA.md` | Runbook LP (`LP:`) — copy + design + conversão |
| `docs/LP_RESEARCH_CAPABILITY_MAP.md` | Pesquisa especialistas → C1–C16 |
| `docs/auditoria-visual-v2/LANDING-AVANT-v3.md` | Brief histórico landing `/` |
| `docs/auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md` | Paleta híbrida, mapeamento skills, sempre/nunca |
| `CLAUDE.md` §3 Design system | Tokens e classes |
| `docs/auditoria-visual-v2/plataformas/D2-avant-editorial-v2.md` | Escopo editorial |
| `docs/SISTEMA_TEMAS_UNICOS.md` | Temas NeuroSlides |
| `components/slides/core/themeGenerator.ts` | Mapa subtópico → cor |
| `components/vitrine/*` | Superfície vitrine |
| `components/lesson/AvantLessonPlayer.tsx` | Player |
| `examples/questao-premium-urgencias-rcp.json` | Referência visual reverso |
