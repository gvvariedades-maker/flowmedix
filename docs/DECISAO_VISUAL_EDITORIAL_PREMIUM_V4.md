# Decisão — Identidade visual editorial premium v4 (App + NeuroSlides claros)

**Status:** ACEITA
**Data:** 2026-08-11
**Responsáveis pela decisão:** proprietário do produto
**Desfecho de descoberta:** **A** — app editorial + NeuroSlides claros de ponta a ponta no player
**SHA de auditoria:** `f5ee914eacfd2de66553e87de45676314290b2d5`
**Branch de documentação:** `docs/design-system-visual-v4`

Complementa / governa:

- Autoridade de identidade: [`design-system/AVANT-VISUAL-DIRECTION-v4.md`](design-system/AVANT-VISUAL-DIRECTION-v4.md)
- Pele dos NeuroSlides: [`design-system/NEUROSLIDES-VISUAL-SPEC-v2.md`](design-system/NEUROSLIDES-VISUAL-SPEC-v2.md)
- Matriz: [`design-system/VISUAL-MIGRATION-v3-to-v4.md`](design-system/VISUAL-MIGRATION-v3-to-v4.md)
- Hub: [`DESIGNER_FRONT_AVANT.md`](DESIGNER_FRONT_AVANT.md)
- Cérebro pedagógico (imutável): [`DECISAO_NEUROSLIDES_GERACAO_2.md`](DECISAO_NEUROSLIDES_GERACAO_2.md)
- Errata: [`design-system/ERRATA-AUDITORIA-VISUAL-RECLASSIFICACAO.md`](design-system/ERRATA-AUDITORIA-VISUAL-RECLASSIFICACAO.md)
- Índice design-system: [`design-system/README.md`](design-system/README.md)

> Canônicos vigentes em `docs/design-system/` (legível; fora do `.cursorignore`). Histórico/screenshots permanecem em `docs/auditoria-visual-v2/`.

---

## Contexto

O AVANT enf usa estudo reverso com quatro NeuroSlides (`concept_map` → `logic_flow` → `golden_rule` → `danger_zone`). A documentação vigente até esta decisão (Direction v3, `CLAUDE.md` §3, skills UI/NeuroSlides) ainda descrevia **duas skins** com NeuroSlides obrigatoriamente em **Cyber Clinical** (`#010409`, cyan neon).

No código em `f5ee914e`, o app logado já usa `html[data-theme='editorial']` (papel creme `#FFF1E0`, marca `#F26522`) e o fullscreen de estudo reverso já usa superfícies claras (`bg-slate-100` + `toEditorialTheme` / `slideSurface` Opção B). A documentação ficou atrás da implementação.

## Identidade anterior (confirmada)

| Camada | Evidência | Estado anterior |
|--------|-----------|-----------------|
| Snapshot Cyber | Tag `avant/cyber-clinical-v1` (`b44c114f…`, 2026-06-10) + [`design-archive/cyber-clinical-v1/`](design-archive/cyber-clinical-v1/README.md) | AVANT completo em Cyber Clinical |
| Editorial híbrido documentado | [`AVANT-VISUAL-DIRECTION-v3.md`](auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md) (2026-06-11) | Ato 1 claro + Ato 2 Cyber no reverso; marca editorial citada como `#8fe020` (verde) em trechos da v3 |
| Rebrand de marca | PR [#90](https://github.com/gvvariedades-maker/flowmedix/pull/90) / merge `2e0045d4` / commit `de364aa0` | Verde de marca → laranja `#F26522` |
| Lockup | PR [#91](https://github.com/gvvariedades-maker/flowmedix/pull/91) / merge `eb7fd73c` / commit `85b267fe` | AVANT preto + enf laranja |
| Editorial Premium (dashboard/vitrine) | PR [#93](https://github.com/gvvariedades-maker/flowmedix/pull/93) / merge `bf1760f2` / commit `7ad1ed65` | Hierarquia CTA/KPIs editorial; **não** é o rebrand de hex |
| Hub desempenho | PR [#94](https://github.com/gvvariedades-maker/flowmedix/pull/94) / merge `dda1d1d7` / commit `f5ee914e` | Analytics/vitrine por acerto — **não** rebrand |

**Correção vs relato preliminar:** “Editorial Premium” foi atribuído por alguns textos só ao commit `7ad1ed65` sem número de PR. Evidência `gh`/API: o commit pertence ao **PR #93** (merged 2026-08-10). PR **#94** permanece fora do rebrand (desempenho).

## Problema de documentação encontrado

- Skills e onboarding ordenavam agentes a manter NeuroSlides em Cyber, enquanto o player já renderiza reverso claro.
- Direction v3 ainda rejeitava “NeuroSlide light” e listava marca verde `#8fe020`, em conflito com `globals.css` editorial (`#F26522`) e com o rebrand #90.
- Comentário em `app/globals.css` ainda diz que “landing e player permanecem Cyber até fases seguintes” — **obsoleto** face ao código do player (dívida; **não corrigida nesta tarefa** — runtime fora de escopo).

## Decisão atual

1. Tratar a implementação visual atual do **app logado + player (enunciado e reverso)** como direção aprovada (**desfecho A**).
2. **Não** restaurar identidade verde de marca nem o contrato Cyber dos NeuroSlides no player com base em documentação antiga.
3. Publicar pacote canônico v4 (este ADR + Direction v4 + Spec NeuroSlides v2 + matriz).
4. Preservar Cyber Clinical como **histórico** (`design-archive`, tag) e como **exceção contextual** onde o código ainda usa `#010409` de forma intencional (ex.: trechos de demo/landing, tokens `:root` para superfícies que ainda não migraram).
5. Manter ordem e função pedagógica dos quatro NeuroSlides; esta decisão altera **pele**, não schema/Zod/handcraft.
6. Esta tarefa **não** adiciona IA ao runtime.

## Evidências verificadas (código)

| Achado | Origem |
|--------|--------|
| Editorial `surface-0` `#FFF1E0`, brand `#F26522`, success `#16a34a` | `app/globals.css` — `html[data-theme='editorial']` |
| Ativação editorial no dashboard | `lib/layout/useEditorialTheme.ts` |
| Fullscreen reverso `bg-slate-100` + CTAs `.btn-editorial-*` | `components/lesson/AvantLessonPlayer.tsx` |
| Temas de slide via `toEditorialTheme` | `components/slides/core/themeGenerator.ts` (`finalizeSlideTheme`) |
| Gradientes claros por tipo | `components/slides/core/slideSurface.ts` |
| Preview Opção B força editorial no `<html>` | `app/neuroslide-opcao-b-preview/layout.tsx` |

## Alcance

| Superfície | Decisão |
|------------|---------|
| Login, register, dashboard, vitrine, enunciado do player | Editorial canônico |
| NeuroSlides / estudo reverso no player | Claro / editorial (Opção B) — **substitui** contrato Cyber no player |
| Tokens `:root` Cyber | Legado / base CSS — não são a pele do reverso atual |
| Landing home | Mista: `useEditorialTheme` em client; alguns blocos demo ainda `#010409` → `MIGRADO_PARCIALMENTE` |
| Admin | Classificar na matriz; não declarar 100% migrado sem evidência adicional |
| Pedagogia 4 slides / Visual OS cérebro | **Continua válido** |

## Consequências positivas

- Agentes deixam de “corrigir” o reverso claro de volta para Cyber.
- Marca laranja e success verde ficam discriminados de forma canônica.
- Auditorias futuras separam decisão intencional de defeitos técnicos.

## Custos e riscos

- Drift temporário até sync de skills/rules/`CLAUDE.md`.
- Landing/admin podem permanecer parcialmente escuros — documentar, não forçar redesign nesta tarefa.
- Baseline de screenshots do reverso claro vinculado a este SHA pode estar **PENDENTE**.

## Pendências de migração (não bloqueiam ACEITA)

- Comentário obsoleto em `app/globals.css` (runtime — fora de escopo documental).
- Capturas autenticadas do reverso claro @ SHA `f5ee914e` (ver manifesto de screenshots).
- Contextos landing/admin ainda com `#010409` pontual.
- Assets PWA/favicon: confirmar no inventário da matriz (não presumir pendência só por auditoria antiga verde).

## Documentos substituídos / ainda válidos

| Documento | Status pós-v4 |
|-----------|----------------|
| `AVANT-VISUAL-DIRECTION-v3.md` | **SUPERADO** como autoridade de identidade (histórico + WCAG auxiliar) |
| Trechos “skin Cyber obrigatória” em skills/prompts | **SUPERADO PARCIALMENTE** |
| `DECISAO_NEUROSLIDES_GERACAO_2.md` (cérebro 4 tipos) | **Válido** — só seções de skin Cyber perdem autoridade de pele |
| `NEUROSLIDES_VISUAL_BAR.md` | **Válido** (piso/ratchet) |
| `design-archive/cyber-clinical-v1/` | **LEGADO_INTENCIONAL** (arquivo) |

## Critérios para futuras alterações

1. Mudança de identidade exige novo ADR + atualização da Direction + evidência em código.
2. Não reverter o player para Cyber sem decisão explícita do proprietário.
3. Tokens numéricos: `app/globals.css` permanece fonte de verdade; docs apontam, não inventam hex.
4. Não confundir `--color-success` verde com marca.
