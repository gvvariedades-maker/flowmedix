# AVANT Visual Direction v4 — Editorial premium (desfecho A)

> Este documento é a autoridade visual vigente do AVANT **para os pontos cobertos pelo desfecho A**. Ele substitui as direções anteriores somente nos pontos explicitamente indicados na matriz de migração. Tokens de implementação: [`app/globals.css`](../../app/globals.css) permanece fonte de verdade numérica.

**Status:** vigente
**Versão:** v4
**Data:** 2026-08-11
**Desfecho:** **A** — App editorial + NeuroSlides claros de ponta a ponta no player
**ADR:** [`DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md`](../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md)
**Spec NeuroSlides (pele):** [`NEUROSLIDES-VISUAL-SPEC-v2.md`](NEUROSLIDES-VISUAL-SPEC-v2.md)
**Matriz:** [`VISUAL-MIGRATION-v3-to-v4.md`](VISUAL-MIGRATION-v3-to-v4.md)
**Hub:** [`DESIGNER_FRONT_AVANT.md`](../DESIGNER_FRONT_AVANT.md)
**SHA auditado:** `f5ee914eacfd2de66553e87de45676314290b2d5`

> **Local canônico legível:** docs/design-system/ (fora do .cursorignore). Histórico pesado: docs/auditoria-visual-v2/.

Documento histórico substituído como autoridade: [`AVANT-VISUAL-DIRECTION-v3.md`](../auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md).

---

## 1. Escopo por superfície

| Superfície | Skin vigente | Notas |
|------------|--------------|-------|
| Login / register / dashboard / vitrine / enunciado | Editorial (`data-theme='editorial'`) | Papel creme + laranja |
| NeuroSlides / reverso no player | Claro / editorial (Opção B) | `bg-slate-100` + gradientes pastéis — **não** Cyber fullscreen |
| Tokens `:root` (sem theme) | Cyber legado (base CSS) | Ainda definidos; não ditam o reverso atual |
| Landing `/` | Mista | Client usa editorial; demos pontuais `#010409` |
| Admin | Verificar por rota | Não declarar MIGRADO sem evidência |
| Arquivo histórico | Cyber Clinical v1 | Tag `avant/cyber-clinical-v1` |

## 2. Princípios da identidade

1. **Clínico** — precisão para Técnico de Enfermagem em concurso; sem infantilizar.
2. **Claro** — legibilidade e densidade escaneável na área de estudo.
3. **Revelador** — o reverso ensina a questão; o contraste agora é tipográfico/gestual (pastéis por tipo), não shell neon.
4. **Marca ≠ sucesso** — laranja `#F26522` é brand; verde `#16a34a` é acerto.

## 3. Personalidade visual

Editorial premium: superfícies claras, papel creme, cards brancos com sombra quente sutil, CTA laranja, tipografia slate. NeuroSlides: full-bleed claro com identidade por tipo (rosa / azul / âmbar / vermelho suaves), bordas com tint laranja.

## 4. Paleta oficial (confirmada no código)

| Token | Valor | Função | Origem no código | Contraste/observação | Classificação |
| ----- | ----- | ------ | ---------------- | -------------------- | ------------- |
| `--color-surface-0` (editorial) | `#FFF1E0` | Fundo app / papel | `globals.css` `html[data-theme='editorial']` | Base creme | canônico |
| `--color-surface-1` (editorial) | `#FFE8D4` | Faixas / strip | idem | | canônico |
| `--color-surface-2` (editorial) | `#ffffff` | Cards | idem | | canônico |
| `--color-surface-3` (editorial) | `#F0DCC8` | Muted / hover | idem | | canônico |
| `--color-brand` (editorial) | `#F26522` | Marca / CTA | idem + brand palette | Rebrand PR #90 | canônico |
| `--color-brand-text` (editorial) | `#9A3412` | Texto marca em fundo claro | `globals.css` editorial | | canônico |
| `--color-success` (editorial) | `#16a34a` | Acerto | idem | **Não** é marca | canônico |
| `--color-danger` (editorial) | `#dc2626` | Erro | idem | | canônico |
| `--color-warning` (editorial) | `#d97706` | Aviso | idem | | canônico |
| `--color-text-primary` (editorial) | `#0f172a` | Texto principal | idem | | canônico |
| `--color-text-secondary` (editorial) | `#475569` | Secundário | idem | AA em `#FFF1E0` | canônico |
| `--color-border-default` (editorial) | `#E5C9B0` | Borda | idem | | canônico |
| Reverso shell | `bg-slate-100` | Fullscreen NeuroSlides | `AvantLessonPlayer.tsx` | Tailwind | canônico (aplicação) |
| Slide `concept_map` bg | gradiente branco→`#FCE7F3`→`#E0ECFF` | Fundo tipo | `slideSurface.ts` | | canônico |
| Slide `logic_flow` bg | branco→`#DBEAFE`→`#C7DCFF` | Fundo tipo | idem | | canônico |
| Slide `golden_rule` bg | branco→`#FEF3C7`→`#FDE9B8` | Fundo tipo | idem | | canônico |
| Slide `danger_zone` bg | branco→`#FEE2E2`→`#FFD4D8` | Fundo tipo | idem | | canônico |
| Card slide border | `rgba(242,101,34,0.28)` | Borda tint marca | `slideSurface.ts` | | canônico |
| `--color-surface-0` (`:root`) | `#010409` | Base Cyber | `globals.css` `:root` | Default sem theme | legado |
| `--color-brand` (`:root`) | `#00f2ff` | Cyan Cyber | `:root` | Não usar como marca do app logado | legado |
| `--color-success` (`:root`) | `#00ff88` | Success neon | `:root` | Contextos Cyber residuais | legado |
| Marca verde `#8fe020` (v3) | — | Marca antiga documentada | Direction v3 | Substituída pelo rebrand #90 | superado |
| Demo landing `#010409` | hardcoded | Blocos demo | `DemoInterativa.tsx` | Exceção pontual | exceção contextual |

## 5. Tokens semânticos

Usar nomes `--color-*` de `globals.css`. Não criar aliases paralelos. Em área logada, assumir `data-theme='editorial'`.

## 6. Tipografia

Hierarquia slate (`text-slate-*` / `--color-text-*`). Inventário completo de font-family: **PENDENTE / NÃO DOCUMENTADO AINDA** neste MVP — seguir componentes existentes.

## 7. Espaçamento, raios, sombras

| Item | Valor / token | Origem | Classificação |
|------|---------------|--------|---------------|
| `--radius-card` | `1rem` | `:root` `globals.css` | canônico |
| `--radius-control` | `0.75rem` | idem | canônico |
| `--radius-pill` | `9999px` | idem | canônico |
| `--shadow-editorial-sm/md/lg` | ver CSS editorial | `html[data-theme='editorial']` | canônico |

## 8. Botões, cartões, navegação, estados

| Padrão | Uso | Origem |
|--------|-----|--------|
| `.btn-editorial-primary` | CTA primário laranja | `globals.css` + player |
| `.btn-editorial-outline` | Secundário | idem |
| `.btn-option-editorial` | Alternativas no enunciado | CSS |
| `.card-elevated` / `.card-elevated-lg` | Cards app | CSS editorial |
| `--color-nav-active-bar` `#F26522` | Nav ativo | editorial |

Classes Cyber (`.glass-panel`, `.text-neon-gradient`, etc.) = **legado / exceção** — não prescritas para novo polish de vitrine/player/reverso.

## 9. Logo, favicon, PWA

- Lockup: AVANT tipográfico escuro + enf/acento laranja (PR #91).
- Favicon/PWA: inventariar na matriz — **não** marcar pendente só porque auditoria antiga citou verde.

## 10. Exemplos permitidos

- Dashboard/vitrine em papel creme com CTA `#F26522`.
- Reverso claro com gradiente por tipo de slide e borda tint laranja.
- Success verde apenas para feedback de acerto.

## 11. Usos proibidos

- Restaurar marca verde `#8fe020` como brand.
- Restaurar shell Cyber `#010409` + cyan no fullscreen do player por doc antiga.
- Tratar NeuroSlides claros como regressão.
- Confundir success green com marca.
- Inventar hex oficiais sem origem em código.

## 12. Acessibilidade

Referência: [`WCAG-CONTRAST-EDITORIAL-V2.md`](../auditoria-visual-v2/tokens/WCAG-CONTRAST-EDITORIAL-V2.md) — complemento; valores de marca verdes da v3 estão **superados**.

## 13. Movimento / iconografia / ilustrações / formulários / skeletons

**PENDENTE / NÃO DOCUMENTADO AINDA** neste v4 MVP — seguir componentes existentes.

## 14. Governança

1. Alterar identidade → novo ADR + bump desta Direction + matriz.
2. `app/globals.css` vence divergência numérica.
3. Spec NeuroSlides v2 governa pele do reverso; cérebro em `DECISAO_NEUROSLIDES_GERACAO_2.md`.
4. Skills/rules apontam para **v4**, não v3.
