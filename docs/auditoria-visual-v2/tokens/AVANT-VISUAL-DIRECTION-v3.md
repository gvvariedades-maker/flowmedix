> **Status: SUPERADO.** Este documento foi preservado apenas para rastreabilidade histórica. A autoridade visual vigente está em [AVANT-VISUAL-DIRECTION-v4.md](../../design-system/AVANT-VISUAL-DIRECTION-v4.md). Para os NeuroSlides (pele), consulte [../NEUROSLIDES-VISUAL-SPEC-v2.md](../../design-system/NEUROSLIDES-VISUAL-SPEC-v2.md). Decisão: [../../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md](../../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md). Matriz: [../VISUAL-MIGRATION-v3-to-v4.md](../../design-system/VISUAL-MIGRATION-v3-to-v4.md).
>
> Partes ainda úteis como complemento histórico: referências WCAG irmãs; narrativa de duas camadas (antes do desfecho A). Marca #8fe020 e obrigação de Cyber no reverso **não** são mais autoridade.

---
# AVANT Visual Direction v3 — Clinical Study (híbrido)

**Data:** 2026-06-11
**Status:** Editorial **v2.1 soft slate** em `globals.css` (profundidade tipo AprovaEnf, sem teal/navy)
**Fonte de verdade de tokens:** [`app/globals.css`](../../../app/globals.css)
**WCAG editorial:** [`WCAG-CONTRAST-EDITORIAL-V2.md`](./WCAG-CONTRAST-EDITORIAL-V2.md)

---

## Personalidade (3 adjetivos)

**Clínico · Claro · Revelador**

- **Clínico** — precisão, protocolo, sem infantilização; público técnico de enfermagem sob pressão.
- **Claro** — app logado legível, denso mas escaneável; aceitável no mercado BR de concursos.
- **Revelador** — o estudo reverso (NeuroSlides) é o momento imersivo escuro; diferencial de marca.

Não copiar QConcursos (laranja), Estudei (teal) nem Gabarita (âmbar). Sintetizar **confiança institucional** + **identidade AVANT**.

---

## Duas camadas de cor (não negociável)

```
┌─────────────────────────────────────────────────────────────┐
│  ATO 1 — TRABALHO (Editorial v2)                              │
│  Login, dashboard, vitrine, player enunciado, modais          │
│  Fundo slate #f1f5f9 · cards brancos · sombra editorial (flutuam) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ após responder / reverso
┌─────────────────────────────────────────────────────────────┐
│  ATO 2 — REVELAÇÃO (Cyber Clinical)                           │
│  NeuroSlides fullscreen, overlay estudo reverso               │
│  Fundo #010409 · cyan #00f2ff · glass · neon semântico        │
└─────────────────────────────────────────────────────────────┘
```

**Não** levar NeuroSlides para light mode com borda verde hospitalar. O contraste claro → escuro **é** o estilo próprio.

---

## Decisão de marca (vs skill `avant-light-design`)

| Proposta externa | Decisão AVANT | Motivo |
|------------------|---------------|--------|
| `--brand` `#00a86b` (verde hospital) | **Manter** `--color-brand` `#8fe020` | Logo, CTA validado WCAG, editorial-v2 em produção |
| Fundo `#f4f7fb` | **Manter** `--color-surface-0` `#f8fafc` | Diferença mínima; já no scorecard |
| `--green` `#16a34a` acerto | **Adotado** como `--color-success` | Já idêntico no editorial |
| Azul `#2563eb` ação secundária | **Opcional** para links externos / info — não competir com CTA | Regra: verde = marca e primário |
| NeuroSlide light | **Rejeitado** | Reverso permanece cyber |

---

## Tokens canônicos (Editorial v2)

Usar **nomes** `--color-*` do `globals.css`. Não criar aliases paralelos (`--bg`, `--t1`, `--brand`).

| Semântica | Token | Hex | Uso |
|-----------|-------|-----|-----|
| Fundo app | `--color-surface-0` | `#f1f5f9` | `body` editorial (não-branco) |
| Fundo strip | `--color-surface-1` | `#e8edf4` | header questão, faixas |
| Card | `--color-surface-2` | `#ffffff` | `.card-elevated` + sombra |
| Muted | `--color-surface-3` | `#e2e8f0` | hover sutil |
| Sombra card sm | `--shadow-editorial-sm` | ver `globals.css` | profundidade (AprovaEnf, sem glow) |
| Sombra card md | `--shadow-editorial-md` | ver `globals.css` | `.card-elevated-lg` |
| Marca / CTA | `--color-brand` | `#8fe020` | botão primário, nav ativo |
| Label CTA | — | `#1a2e05` | texto sobre brand (`.btn-editorial-primary`) |
| Texto marca em fundo claro | `--color-brand-text` | `#3d6b0f` | links, ênfase |
| Tint marca | `--color-brand-dim` | `rgba(143,224,32,0.12)` | hover chip, seleção |
| Sucesso (acerto) | `--color-success` | `#16a34a` | **não** confundir com brand |
| Sucesso texto | `--color-success-text` | `#15803d` | corpo em card branco |
| Erro | `--color-danger` | `#dc2626` | |
| Aviso | `--color-warning` | `#d97706` | exceção, alerta |
| Texto primário | `--color-text-primary` | `#0f172a` | |
| Texto secundário | `--color-text-secondary` | `#475569` | AA em `#f1f5f9` |
| Texto terciário | `--color-text-tertiary` | `#94a3b8` | placeholder apenas — ver WCAG |
| Borda | `--color-border-subtle` | `#e2e8f0` | |

### Tokens canônicos (Cyber — reverso / landing / admin)

| Semântica | Token | Hex |
|-----------|-------|-----|
| Fundo | `--color-surface-0` | `#010409` |
| Marca | `--color-brand` | `#00f2ff` |
| Sucesso neon | `--color-success` | `#00ff88` |
| Erro neon | `--color-danger` | `#ff0055` |

---

## Mapeamento: skill `avant-light-design` → AVANT

Para agentes/skills que tragam tokens da skill light HTML — **traduzir**, não copiar hex de marca.

| Skill `avant-light` | Token AVANT | Notas |
|---------------------|-------------|-------|
| `--bg` `#f4f7fb` | `--color-surface-0` | não duplicar |
| `--bg-card` `#ffffff` | `--color-surface-2` | |
| `--bg-subtle` `#eef2f8` | `--color-surface-1` | próximo de `#f1f5f9` |
| `--brand` `#00a86b` | `--color-brand` `#8fe020` | **substituir sempre** |
| `--brand-d` `#007a4d` | hover via Tailwind / opacity | sem token hoje |
| `--brand-l` `#e6f7f1` | `--color-brand-dim` | |
| `--green` `#16a34a` | `--color-success` | |
| `--green-l` `#dcfce7` | `--color-success-dim` + bg Tailwind | |
| `--red` / `--red-l` | `--color-danger` / `--color-danger-dim` | |
| `--amber` / `--amber-l` | `--color-warning` / `--color-warning-dim` | |
| `--blue` `#2563eb` | link: `text-blue-600` pontual | secundário, não primário |
| `--t1`–`--t4` | `--color-text-primary` … `tertiary` | |
| `--border` | `--color-border-subtle` | |
| `--sh-sm/md/lg` | sombra Tailwind ou `.card-elevated` | ver abaixo |
| `--r-xs` 6px … `--r-xl` 28px | `rounded-lg` / `rounded-2xl` / `rounded-[2.5rem]` cyber | |

### Sombras (princípio adotado da skill light)

Editorial — preferir sombra **sutil** em cards flutuantes:

```css
/* equivalente mental a --sh-sm da skill */
box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);
```

Já coberto por `.card-elevated` / `.card-elevated-lg`. **Não** glass na vitrine.

---

## Cor por subtópico (regra de aplicação)

O `themeGenerator.ts` define cor por subtópico nos **NeuroSlides (cyber)**.

No **shell editorial**:

| Permitido | Proibido |
|-----------|----------|
| Ícone do assunto tintado | Card inteiro em cor de módulo |
| Barra 4px ou ring pequeno de progresso | Arco-íris de fundos por tela |
| `NeonBadge` discreto | Competir com verde `#8fe020` do CTA |

Máximo **um** acento cromático por card além da marca.

---

## Regras por superfície

### Vitrine `/estudar`

- Skin: **editorial**
- Stats compactos; uma hierarquia de título
- Grid: `1 → 2 → 3` colunas (evitar 4 que trunca)
- Progresso visível sem expandir (≥ 4px)
- CTA: Iniciar / Continuar / Revisar — verde brand
- Componentes: `VitrinePageHeader`, `VitrineSubjectCard`, `VitrineToolbar`, `VitrineQuickFilters`

### Player (enunciado + alternativas)

- Skin: **editorial** — `.card-elevated`, `.btn-option-editorial`
- Feedback: borda + fundo `--color-success-dim` / `--color-danger-dim`
- Label acerto: `--color-success-text`, não `--color-brand`

### Estudo reverso / NeuroSlides

- Skin: **cyber** — sem tokens editoriais
- Glass só em overlay/modal
- `main`/`section` transparentes no cyber global (listras)

### Login / auth

- Editorial; CTA `#8fe020` + label `#1a2e05`

---

## Sempre / Nunca

| Sempre | Nunca |
|--------|-------|
| Token `--color-*` antes de hex solto | `--brand` `#00a86b` ou paleta paralela da skill HTML |
| Separar marca (`--color-brand`) de acerto (`--color-success`) | Verde lima em “questão correta” |
| Toque ≥ 44px em mobile | `--color-text-tertiary` em texto obrigatório |
| `pb-safe` / `pt-safe` no dashboard | Indigo legado na vitrine |
| Estender componente existente | Card-dentro-de-card sem motivo |
| Reverso escuro após questão | NeuroSlides light na app Next |

---

## O que NÃO importar da skill `avant-light-design`

- JavaScript ES5, HTML offline, Android 5+ — escopo **ebook** / infoproduto, não app Next
- `font-size` só em px / anti-rem — o app usa Tailwind + rem com escala do design system
- Tabela cromática arco-íris em toda UI
- Claim “único verde no nicho” — diferencial real é **lima + reverso**

---

## Verificação rápida (antes de PR visual)

1. Rota usa skin correta? (editorial vs cyber)
2. CTA usa `#8fe020` + label escuro?
3. Acerto/erro usam success/danger, não brand?
4. Contraste: [`WCAG-CONTRAST-EDITORIAL-V2.md`](./WCAG-CONTRAST-EDITORIAL-V2.md)
5. Desktop 1440 + mobile 375 — sem overflow horizontal
6. Screenshot telha em `screenshots/avant-editorial-v2/` se mudança de chrome

---

## Profundidade (v2.1 — inspiração AprovaEnf)

- **Fundo app** não é branco puro — `surface-0` `#f1f5f9` faz cards brancos “flutuarem”.
- **Sombras** `--shadow-editorial-sm/md` em slate (sem glow teal/cyan).
- **Sem** navy `#0A1628` nem teal `#00C9B1` no editorial.

---

## Landing pública (`/`)

Fase 8 — ainda cyber em código; alvo **light v3** alinhado ao editorial.

| Tema | Regra |
|------|-------|
| Corpo LP | Claro `#f8fafc`, CTA `#8fe020` — **não** teal/roxo Estudei |
| Preview reverso | Único bloco escuro (cyber) na página |
| Estudei | Adotar estrutura (hero, passos, pricing ✓); rejeitar paleta |

Brief completo: [`../LANDING-AVANT-v3.md`](../LANDING-AVANT-v3.md).

---

## Referências

| Arquivo | Conteúdo |
|---------|----------|
| [`LANDING-AVANT-v3.md`](../LANDING-AVANT-v3.md) | Brief LP — síntese Estudei, seções, tokens, checklist Fase 8 |
| [`AVANT-EDITORIAL-V2-DRAFT.md`](./AVANT-EDITORIAL-V2-DRAFT.md) | Histórico cyber → editorial |
| [`D2-avant-editorial-v2.md`](../plataformas/D2-avant-editorial-v2.md) | Escopo migrado, telhas |
| [`C1-estudei.md`](../plataformas/C1-estudei.md) | Referência LP Estudei |
| [`VITRINE-REBRAND-BACKLOG.md`](../VITRINE-REBRAND-BACKLOG.md) | Backlog vitrine |
| [`.cursor/skills/avant-ui-visual/SKILL.md`](../../../.cursor/skills/avant-ui-visual/SKILL.md) | Skill operacional UI |
| [`CLAUDE.md`](../../../CLAUDE.md) §3 | Design system resumido |
