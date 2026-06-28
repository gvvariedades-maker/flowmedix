# Landing AVANT v3 — Brief visual (síntese Estudei)

**Data:** 2026-06-11  
**Rota:** `/` → [`components/landing/LandingHome.tsx`](../../components/landing/LandingHome.tsx)  
**Status:** Fase 8 pendente (LP ainda **Cyber**; app logado já **Editorial v2**)  
**Direção geral:** [`tokens/AVANT-VISUAL-DIRECTION-v3.md`](./tokens/AVANT-VISUAL-DIRECTION-v3.md)  
**Referência mercado:** Estudei C1 (prints usuário jun/2026 + [`plataformas/C1-estudei.md`](./plataformas/C1-estudei.md))

---

## Objetivo

Landing **própria**, bonita e aceitável no BR (conversão + confiança), **sem** copiar roxo/teal do Estudei nem laranja do QConcursos.  
Narrativa Estudei (método, passos, pricing claro) + identidade AVANT (lima `#8fe020`, nicho técnico enfermagem, **preview do reverso escuro**).

---

## Estado atual vs alvo

| Aspecto | Hoje (`LandingHome`) | Alvo v3 |
|---------|----------------------|---------|
| Fundo | `#010409` + glows cyan/indigo | **Soft slate** `#f1f5f9` + cards brancos com sombra |
| CTA | `#BEF264` (lima próximo, não token) | `--color-brand` `#8fe020` + label `#1a2e05` |
| Acentos | Cyan + **indigo** + rose | Lima + slate; cyan **só** em bloco reverso |
| Cards | Glass dark, `rounded-[2rem]` | `.card-elevated` branco, sombra sutil |
| Mockup | Carousel NeuroSlides (bom) | Manter; frame tipo Estudei (device) |
| Pricing | FAQ menciona R$ 14,90 | Bloco dedicado estilo Estudei (ver § Pricing) |

**Drift a corrigir na implementação:** trocar `#BEF264` / `#d4f879` por tokens `#8fe020`; remover `indigo-*` da LP.

---

## O que pegar do Estudei (princípio, não cor)

| Print Estudei | Padrão | Aplicação AVANT |
|---------------|--------|-----------------|
| Hero branco + mockups | Split 50/50, CTA pill, badge credencial | Hero §1 |
| “Transforme estudos em conquistas” + cards inclinados | Passos/features visuais | **Cards retos** na LP; inclinação só em ilustração opcional |
| Fundo roxo + CTA verde | Contraste seção | **Não** roxo — usar faixa `--color-surface-1` ou strip escura só no bloco reverso |
| “Simples 1-2-3-4” fundo verde | Método numerado | Seção método com fundo **claro**; números em `--color-brand-text` |
| Pricing dark + lista ✓ | Conversão | Seção §8: fundo `#0f172a` **ou** card branco com borda brand |
| E-books roxo + mockup 3D | Prova de produto | Bloco NeuroSlides com **screenshot real** (já existe carousel) |

### O que **não** copiar

- Roxo `#6735BC` / teal `#00CDA0` (branding Estudei)
- Wallpaper verde saturado em seção inteira
- Neulis / fonte custom externa
- Cards rotacionados na grade principal
- Tom genérico “organizador de estudos” — copy AVANT = **estudo reverso + técnico enfermagem**

---

## Arquitetura de seções (ordem v4 — jun/2026)

```
Header — CTA primário "Começar grátis", secundário "Ver planos", âncora Missão semanal
→ Hero
→ Trust strip (4 chips, inclui 2 simulados personalizados)
→ Problema
→ Comparativo (inclui evolução semanal × apostila)
→ Demo interativa (antes do método)
→ Método 01–04
→ Missão da semana (#missao-semanal) — preview hub + funil 2 simulados grátis
→ NeuroSlides
→ Recursos (missão como card)
→ Autoridade (iniciais + credencial)
→ Pricing (grátis: 2 simulados + limites diários)
→ FAQ + CTA final + sticky mobile
```

### Freemium na LP

- Grátis: `FREEMIUM_SIMULADOS_PERSONALIZADOS_DESCRIPTION` (diagnóstico + missão D+7)
- Pro: missão semanal contínua, streak, histórico completo

---

## Arquitetura de seções (ordem sugerida v3 — legado)

```
┌─────────────────────────────────────────────────────────────┐
│ 0. Header público — logo, Login (outline), CTA Assinar      │
├─────────────────────────────────────────────────────────────┤
│ 1. HERO (claro)                                             │
│    [badge credencial]                                       │
│    Headline: 1 palavra em --color-brand-text                │
│    Sub + pricing teaser (freemium)                            │
│    [CTA primário pill] [CTA secundário outline]             │
│    Direita: mockup vitrine OU carousel NeuroSlide           │
├─────────────────────────────────────────────────────────────┤
│ 2. Trust strip — 4–5 chips (questões, EBSERH, sem cartão…)  │
├─────────────────────────────────────────────────────────────┤
│ 3. Problema — lista dores (já existe #problema-real)        │
├─────────────────────────────────────────────────────────────┤
│ 4. Comparativo — Apostila × AVANT (manter carousel slides)  │
├─────────────────────────────────────────────────────────────┤
│ 5. Método 01–04 — grid 2×2 desktop, stack mobile            │
│    (equivalente Estudei “como funciona”)                    │
├─────────────────────────────────────────────────────────────┤
│ 6. NeuroSlides — 4 tipos + demo interativa                  │
│    Preview com moldura escura = “gostinho” do reverso       │
├─────────────────────────────────────────────────────────────┤
│ 7. Features app — vitrine, desempenho, plano, cadernos       │
├─────────────────────────────────────────────────────────────┤
│ 8. Pricing — plano anual/mensal, lista ✓, CTA               │
│    Estrutura Estudei; cores AVANT                            │
├─────────────────────────────────────────────────────────────┤
│ 9. FAQ + CTA final                                          │
├─────────────────────────────────────────────────────────────┤
│ Footer — links, WhatsApp                                    │
└─────────────────────────────────────────────────────────────┘
```

Seções já existentes em `LandingHome.tsx` podem ser **reordenadas e re-skinadas**, não reescritas do zero.

---

## Tokens LP (compartilhados com Editorial v2)

Usar `html[data-theme='editorial']` **ou** classes equivalentes sem ativar no dashboard.

| Uso | Token / classe |
|-----|----------------|
| Fundo página | `--color-surface-0` `#f8fafc` |
| Card | `.card-elevated` / `--color-surface-2` |
| CTA primário | `.btn-editorial-primary` |
| CTA secundário | `.btn-editorial-outline` |
| Destaque headline | `--color-brand-text` `#3d6b0f` |
| Check pricing | `--color-success` `#16a34a` |
| Texto | `--color-text-primary` / `secondary` |

### Bloco “reverso preview” (exceção escura na LP)

Única área cyber na landing — mostra o produto diferenciado:

| Token | Valor |
|-------|-------|
| Fundo | `#010409` ou `#0f172a` |
| Borda mockup | `border-white/10` |
| Acento | `#00f2ff` ou glow lima sutil |

Transição claro → escuro **só** neste bloco (paralelo Estudei: capa escura do e-book dentro de LP clara).

---

## Hero — especificação

**Referência:** Estudei hero branco (print 3).

| Elemento | Especificação |
|----------|---------------|
| Badge | Pill cinza `bg-slate-100`, dot verde; ex.: “Foco em Técnico de Enfermagem · EBSERH e prefeituras” |
| H1 | ~40–48px desktop; ex.: “A plataforma que transforma cada **erro** em aprendizado real” — palavra-chave em `#3d6b0f` |
| Sub | 18–20px `#64748b`, max 2 linhas |
| Teaser preço | “Plano gratuito: X questões/dia · sem cartão” |
| CTA 1 | “Quero começar agora” → `/register` |
| CTA 2 | “Ver como funciona” → `#metodo` |
| Visual direita | `CompareAvantCarousel` ou screenshot vitrine editorial |

**Não:** gradiente cyan→lima no título inteiro; uppercase tracking extremo no H1.

---

## Método 01–04 — especificação

**Referência:** Estudei passos + cards numerados (prints 1 e 4).

| Elemento | Especificação |
|----------|---------------|
| Layout | Grid `md:grid-cols-2`, gap 16–24px |
| Card | `.card-elevated`, `p-6`, número `01` em `#94a3b8` pequeno |
| Ícone | Lucide 44px, tint `--color-brand-dim` |
| Título | `font-semibold text-slate-900` |
| Motion | `fadeUp` leve (já existe) — sem rotação |

Conteúdo: reutilizar `methodSteps` atual.

---

## Pricing — especificação

**Referência:** Estudei bloco escuro “Anual 12x 19,80” (print 2).

| Elemento | AVANT (ajustar preços reais do produto) |
|----------|----------------------------------------|
| Layout | 2 colunas desktop: benefícios | preço + CTA |
| Benefícios | 6–8 itens com `CheckCircle2` em `#16a34a` |
| Destaque | “Pro” ou “Anual” — tipografia grande, valor em `#3d6b0f` ou brand |
| CTA | `.btn-editorial-primary` full width mobile |
| Fundo | Opção A: seção `#0f172a` texto branco; Opção B: card branco com borda `2px #8fe020` |

**Nota:** validar valores em `lib/freemium` e Stripe antes de publicar.

---

## Componentes a reutilizar

| Componente | Arquivo |
|------------|---------|
| Landing shell | `LandingHome.tsx` |
| Demo | `DemoInterativa.tsx` |
| Slides marketing | `NeuroSlideCarousel.tsx`, `SlideStylePreviews.tsx` |
| Header | `PublicDarkSiteHeader.tsx` → criar variante **light** ou editorial |
| CTA Pro | `ProSubscribeCtaLink.tsx` |
| Logo | `AvantLogo.tsx` |

---

## Checklist implementação (Fase 8)

- [ ] `LandingHome`: fundo claro; remover glows indigo/cyan do body
- [ ] Unificar CTA para `#8fe020` / `.btn-editorial-primary`
- [ ] `PublicDarkSiteHeader` → header editorial na LP
- [ ] Hero split + badge credencial
- [ ] Seção pricing dedicada (nova)
- [ ] Bloco NeuroSlides com frame escuro (preview reverso)
- [ ] Captura T1 em `screenshots/avant-editorial-v2/T1-landing-*.png`
- [ ] WCAG: rodar `scripts/wcag-editorial-contrast.mjs` nos pares novos
- [ ] Não aplicar `useEditorialTheme` global na LP se conflitar com cyber no mesmo documento — preferir classes explícitas ou `data-theme='editorial'` só no wrapper LP

---

## Referências visuais

| Fonte | Caminho |
|-------|---------|
| Estudei capturas (jun/2026) | Prints fornecidos pelo usuário (hero, pricing, método, e-books) |
| Estudei auditoria | [`screenshots/estudei/`](./screenshots/estudei/) |
| Comparativo LP | [`COMPARATIVO-LP.md`](./COMPARATIVO-LP.md) |
| AVANT baseline cyber | [`screenshots/avant-baseline/T1-landing-*.png`](./screenshots/avant-baseline/) |

---

## Relação LP ↔ App

| LP (v3 claro) | Após cadastro |
|---------------|---------------|
| Promete método + visual limpo | Dashboard editorial — mesma linguagem |
| Mostra reverso escuro em preview | Reverso fullscreen cyber — continuidade emocional |

O usuário não deve sentir “outro produto” ao entrar — só aprofundamento do que a LP mostrou.
