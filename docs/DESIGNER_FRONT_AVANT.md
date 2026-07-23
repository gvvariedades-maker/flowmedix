# Designer front — onboarding AVANT

Leitura estimada: **~5 minutos**. Hub de descoberta — **não** duplica tokens nem checklists.

> **Frase-guia:** duas skins, dois trilhos. Tokens vivem no código; este arquivo só aponta.

---

## Qual trilho? (15 segundos)

| Você vai trabalhar em… | Trilho | Próximo passo |
|------------------------|--------|---------------|
| Vitrine `/estudar`, player (enunciado), dashboard, login, shell | **A — App UI** | [Ordem A](#trilho-a--app-ui) |
| NeuroSlides / estudo reverso (gesto, moldes, brief 4/4) | **B — NeuroSlides** | [Ordem B](#trilho-b--neuroslides) |
| Comportamento + código (bug, API, feature) | Engenharia | [`AGENTS.md`](../AGENTS.md) · `Feature:` / `Bug:` — **não** polish visual |

**Não misturar:** polish de vitrine ≠ design de molde de slide. Skills e triggers são distintos.

---

## Trilho A — App UI

**Ordem de leitura (pare quando souber decidir):**

1. [`auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md`](auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md) — direção v3, sempre/nunca, Editorial × Cyber  
2. [`auditoria-visual-v2/plataformas/D2-avant-editorial-v2.md`](auditoria-visual-v2/plataformas/D2-avant-editorial-v2.md) — escopo editorial, telhas, WCAG  
3. [`skills/avant-ui-visual/SKILL.md`](skills/avant-ui-visual/SKILL.md) — craft no app  
4. [`skills/avant-ui-visual/reference-microsaas-craft.md`](skills/avant-ui-visual/reference-microsaas-craft.md) — checklist vitrine + player  
5. Screenshots: `auditoria-visual-v2/screenshots/avant-editorial-v2/` (+ `*-BACKLOG.md` se houver)  
6. Código: [`app/globals.css`](../app/globals.css) — **fonte de verdade dos tokens**

**Complementos pontuais:** [`ZOOM_MOBILE_POLICY.md`](ZOOM_MOBILE_POLICY.md) · landing (só shell): [`auditoria-visual-v2/LANDING-AVANT-v3.md`](auditoria-visual-v2/LANDING-AVANT-v3.md) · resumo rápido: [`CLAUDE.md`](../CLAUDE.md) §3

**No Cursor:** `Visual:` · `Polish vitrine` · `Polish player` · `craft UI`  
Rule: [`.cursor/rules/avant-ui-visual.mdc`](../.cursor/rules/avant-ui-visual.mdc) · cópia: [`cursor/avant-ui-visual.mdc`](cursor/avant-ui-visual.mdc)

---

## Trilho B — NeuroSlides

**Ordem de leitura:**

1. [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) — brief 4/4 (designer instrucional)  
2. [`.cursor/skills/avant-neuroslides-visual/SKILL.md`](../.cursor/skills/avant-neuroslides-visual/SKILL.md) — gesto = decisão; anti-cópia  
3. [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — layouts genéricos dos 4 slides  
4. [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — L3 = experiência visual bespoke  
5. Só ao **implementar React:** [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md)

**No Cursor:** `Design visual:` · `Molde visual:` · brief via `Brief TE:` / `Brief PT:`  
**Não** use `Visual:` / `Polish vitrine` para moldes de slide.

---

## Hierarquia de autoridade (anti-drift)

| Camada | Canônico | Papel |
|--------|----------|--------|
| Direção / paleta | `AVANT-VISUAL-DIRECTION-v3.md` | O que é AVANT visualmente |
| Escopo editorial | `D2-avant-editorial-v2.md` | Telas, WCAG, screenshots |
| Craft app | `avant-ui-visual` + `reference-microsaas-craft` | Como polishar vitrine/player |
| Brief slides | `PROMPT_VARIANTES_NEUROSLIDES.md` | Metáfora 4/4 antes do React |
| Retenção visual | `avant-neuroslides-visual` | Gesto ≠ decoração |
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
| Designer de slides | Este hub → `PROMPT_VARIANTES` → `avant-neuroslides-visual` |
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
