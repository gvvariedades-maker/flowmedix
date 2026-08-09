# Designer front — onboarding AVANT

Leitura estimada: **~5 minutos**. Hub de descoberta — **não** duplica tokens nem checklists.

> **Frase-guia:** duas skins, três trilhos. Tokens vivem no código; este arquivo só aponta.  
> **Segurança de app/infra:** [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) (hub separado).

---

## Qual trilho? (15 segundos)

| Você vai trabalhar em… | Trilho | Próximo passo |
|------------------------|--------|---------------|
| Vitrine `/estudar`, player (enunciado), dashboard, login, shell | **A — App UI** | [Ordem A](#trilho-a--app-ui) |
| NeuroSlides / estudo reverso (gesto, moldes, brief 4/4) | **B — NeuroSlides** | [Ordem B](#trilho-b--neuroslides) |
| Landing `/` ou LP de concurso `/lp/*` (copy + conversão + design) | **C — Landing / LP** | [Ordem C](#trilho-c--landing--lp) |
| Comportamento + código (bug, API, feature) | Engenharia | [`AGENTS.md`](../AGENTS.md) · [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) · `Feature:` / `Bug:` — **não** polish visual |

**Não misturar:** polish de vitrine ≠ design de molde de slide ≠ CRO de LP. Skills e triggers são distintos.

---

## Trilho A — App UI

**Ordem de leitura (pare quando souber decidir):**

1. [`auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md`](auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md) — direção v3, sempre/nunca, Editorial × Cyber  
2. [`auditoria-visual-v2/plataformas/D2-avant-editorial-v2.md`](auditoria-visual-v2/plataformas/D2-avant-editorial-v2.md) — escopo editorial, telhas, WCAG  
3. [`skills/avant-ui-visual/SKILL.md`](skills/avant-ui-visual/SKILL.md) — craft no app  
4. [`skills/avant-ui-visual/reference-microsaas-craft.md`](skills/avant-ui-visual/reference-microsaas-craft.md) — checklist vitrine + player  
5. Screenshots: `auditoria-visual-v2/screenshots/avant-editorial-v2/` (+ `*-BACKLOG.md` se houver)  
6. Código: [`app/globals.css`](../app/globals.css) — **fonte de verdade dos tokens**

**Complementos pontuais:** [`ZOOM_MOBILE_POLICY.md`](ZOOM_MOBILE_POLICY.md) · resumo rápido: [`CLAUDE.md`](../CLAUDE.md) §3  
**Landing com CRO:** use o [Trilho C](#trilho-c--landing--lp) — não só polish de tokens.

**No Cursor:** `Visual:` · `Polish vitrine` · `Polish player` · `craft UI`  
Rule: [`.cursor/rules/avant-ui-visual.mdc`](../.cursor/rules/avant-ui-visual.mdc) · cópia: [`cursor/avant-ui-visual.mdc`](cursor/avant-ui-visual.mdc)

---

## Trilho B — NeuroSlides

**Ordem de leitura:**

1. [`DECISAO_NEUROSLIDES_GERACAO_2.md`](DECISAO_NEUROSLIDES_GERACAO_2.md) — ADR: 4 tipos imutáveis + Visual OS  
2. [`NEUROSLIDES_VISUAL_BAR.md`](NEUROSLIDES_VISUAL_BAR.md) — **piso best-in-market + ratchet** (cada molde só melhora)  
3. [`PROMPT_COMPOSER_VISUAL.md`](PROMPT_COMPOSER_VISUAL.md) — **Composer** (orquestrador Agent-first: banco → Modo V → crítica → handoff)  
4. [`artifacts/composer-visual-bank.md`](../artifacts/composer-visual-bank.md) — banco curado 8 gestos (≤2 âncoras ouro/gesto)  
5. [`NEUROSLIDES_ATELIER_KIT.md`](NEUROSLIDES_ATELIER_KIT.md) — **Atelier** = crítica glanceable + 8 gestos ouro  
6. [`PROMPT_ATELIER_VISUAL.md`](PROMPT_ATELIER_VISUAL.md) — formato da crítica (`ATELIER_PASS` / `FAIL`)  
7. [`NEUROSLIDES_GERACAO_2_ROADMAP.md`](NEUROSLIDES_GERACAO_2_ROADMAP.md) — fases flagship → Fábrica → cauda  
8. [`PROMPT_FABRICA_VISUAL_G2.md`](PROMPT_FABRICA_VISUAL_G2.md) — prompt reutilizável (1 pacote / P1 shells); Composer **precede** se gallery pending/thin ([§ Pré-passo](PROMPT_FABRICA_VISUAL_G2.md#pré-passo-composer--obrigatório-quando-gallery-pendingthin); validação Processo: [`composer-fabrica-hook-processo-de-enfermagem.md`](../artifacts/composer-fabrica-hook-processo-de-enfermagem.md))  
9. [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) — brief 4/4 (designer instrucional)  
10. [`.cursor/skills/avant-neuroslides-visual/SKILL.md`](../.cursor/skills/avant-neuroslides-visual/SKILL.md) — gesto = decisão; anti-cópia  
11. [`NEUROSLIDES_VISUAL_STRATEGY.md`](NEUROSLIDES_VISUAL_STRATEGY.md) — primitives + glanceable + ondas  
12. [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — layouts genéricos dos 4 slides  
13. [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — L3 = experiência visual bespoke  
14. Só ao **implementar React:** [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md)

**No Cursor:** `Composer visual:` (preferido) · `Atelier visual:` / `Crítica atelier:` · `Design visual:` · `Molde visual:` · `Fábrica visual G2:` · `P1 NeuroSlides G2:` · brief via `Brief TE:` / `Brief PT:`  
**Papéis:** Composer = orquestrador · Atelier = crítica · skill = Modo V/A.  
**Não** use `Visual:` / `Polish vitrine` para moldes de slide.

---

## Trilho C — Landing / LP

**Ordem de leitura:**

1. [`LP_CONVERSA.md`](LP_CONVERSA.md) — runbook operacional (`LP: home` / `LP: <path>` / `LP: polish visual`)  
2. [`LP_RESEARCH_CAPABILITY_MAP.md`](LP_RESEARCH_CAPABILITY_MAP.md) — C1–C16 (Gardner, Wiebe, LIFT, Emotional Targeting…)  
3. Brief histórico home: [`auditoria-visual-v2/LANDING-AVANT-v3.md`](auditoria-visual-v2/LANDING-AVANT-v3.md)  
4. Código: `lib/marketing/landingCopy.ts` · `components/landing/*` · `LPConcurso` · CMS `/admin/landings`  
5. Golden concurso: `components/lp/campina/LPCampinaV2.tsx`  
6. Tokens: Visual Direction v3 + `globals.css` (não duplicar paleta na LP)

**No Cursor:** `LP: home` · `LP: campina-grande` · `LP: polish visual`  
Rule: [`.cursor/rules/lp-conversa.mdc`](../.cursor/rules/lp-conversa.mdc) · cópia: [`cursor/lp-conversa.mdc`](cursor/lp-conversa.mdc)  
**Não** use só `Visual:` quando o pedido for conversão/copy — `Visual:` = shell; `LP:` = CRO + design.

---

## Hierarquia de autoridade (anti-drift)

| Camada | Canônico | Papel |
|--------|----------|--------|
| Direção / paleta | `AVANT-VISUAL-DIRECTION-v3.md` | O que é AVANT visualmente |
| Escopo editorial | `D2-avant-editorial-v2.md` | Telas, WCAG, screenshots |
| Craft app | `avant-ui-visual` + `reference-microsaas-craft` | Como polishar vitrine/player |
| SVG custom / diagramas | `svg-quality` + `docs/design-refs/svg-models/` | Ícone/diagrama vetorial (não Lucide/Health Icons) |
| Landing / LP (CRO) | `LP_CONVERSA.md` | Copy + anatomia + ship de `/` e `/lp/*` |
| Pesquisa LP | `LP_RESEARCH_CAPABILITY_MAP.md` | Por que C1–C16 |
| Geração 2 (produto) | `DECISAO_NEUROSLIDES_GERACAO_2.md` | Cérebro 4 tipos × corpo Visual OS |
| Barra visual + ratchet | `NEUROSLIDES_VISUAL_BAR.md` | Piso demo G2; cada molde só melhora |
| Roadmap G2 | `NEUROSLIDES_GERACAO_2_ROADMAP.md` | Flagships → Fábrica → cauda |
| Prompt Fábrica / P1 | `PROMPT_FABRICA_VISUAL_G2.md` | 1 conversa = 1 pacote (ou lote shells) |
| Composer visual | `PROMPT_COMPOSER_VISUAL.md` + `composer-visual-bank.md` | Orquestra gesto → 4/4 (precede Fábrica se gallery thin) |
| Atelier (crítica) | `NEUROSLIDES_ATELIER_KIT` + `PROMPT_ATELIER_VISUAL` | Glanceable PASS/FAIL — não substitui Composer |
| Brief slides | `PROMPT_VARIANTES_NEUROSLIDES.md` | Metáfora 4/4 antes do React |
| Retenção visual | `avant-neuroslides-visual` | Gesto ≠ decoração (entrada preferida: Composer) |
| Strategy visual | `NEUROSLIDES_VISUAL_STRATEGY.md` | Primitives + ondas |
| Implementação molde | `VARIANT_MOLDS.md` | Wiring React (pedido explícito) |
| Tokens no código | `app/globals.css` | **Última palavra** — não inventar paleta paralela |

Este hub **aponta**; não copia tabelas de tokens.

---

## Always / Never (resumo)

**Always**

- Editorial na área logada / enunciado; Cyber **só** no reverso (e admin escuro quando já for o caso)
- Monocromático + **1** acento (Editorial: slate + `#8fe020`; Cyber: preto + cyan)
- Estender componente adjacente; reutilizar classes (`.card-elevated`, `.glass-panel`, `.btn-editorial-*`, …)
- Microestados: hover, `focus-visible`, loading, empty, disabled
- Alvos ≥44px no mobile; contraste AA

**Never**

- Terceira cor decorativa / paleta genérica (indigo SaaS, cream+serif, etc.)
- Uniformizar tudo em cinza “micro-SaaS” apagando o cyber do reverso
- Cards decorativos sem interação; KPI hero empurrando o catálogo
- Animação em loop em listas longas
- Colar `template` / `layout_variant` no JSON de catálogo sem override intencional

Detalhe: Visual Direction v3 + skill `avant-ui-visual`.

---

## Por persona (tempo-alvo <10 min)

| Persona | Abre só |
|---------|---------|
| Designer de produto (vitrine/player) | Este hub → Visual Direction → `reference-microsaas-craft` → screenshots |
| Designer / growth de LP | Este hub → Trilho C → `LP_CONVERSA.md` |
| Designer de slides | Este hub → `PROMPT_COMPOSER_VISUAL` + banco → `PROMPT_VARIANTES` → `avant-neuroslides-visual` |
| Dev implementando polish | Este hub → skill + `Visual:` → componente adjacente |

---

## Não usar como onboarding de design

| Doc | Por quê |
|-----|---------|
| [`SISTEMA_TEMAS_UNICOS.md`](SISTEMA_TEMAS_UNICOS.md) | Proposta/hash de tema — não DS de produto |
| [`EDITOR_VISUAL_ERROS.md`](EDITOR_VISUAL_ERROS.md) | Admin / validação Zod no laboratório |
| [`LEGADO_INDEX.md`](LEGADO_INDEX.md) | Índice histórico — não produção nova |
| Pipeline handcraft / qualidade | Conteúdo de questão, não UI do app |

---

## Mapa rápido de arquivos de UI

| Peça | Path |
|------|------|
| Tokens | `app/globals.css` |
| Vitrine | `components/vitrine/*` |
| Player | `components/lesson/AvantLessonPlayer.tsx` |
| Slides | `components/slides/core/NeuroSlide.tsx` + `themeGenerator.ts` |
| Zoom mobile | `components/accessibility/ReadableTextZoom.tsx` · [`ZOOM_MOBILE_POLICY.md`](ZOOM_MOBILE_POLICY.md) |
| Landing home | `components/landing/*` · `lib/marketing/landingCopy.ts` · [`LP_CONVERSA.md`](LP_CONVERSA.md) |
| LP concurso | `app/lp/[path]` · `LPConcurso` · `/admin/landings` · [`LP_CONVERSA.md`](LP_CONVERSA.md) |
