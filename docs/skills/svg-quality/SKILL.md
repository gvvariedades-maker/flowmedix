---
name: svg-quality
description: >-
  Cria e revisa SVG de altíssima qualidade (ícones, diagramas, gestos NeuroSlides)
  com gramática Lucide/Heroicons/Tabler + referências locais. Use com SVG:,
  criar SVG, ícone SVG custom, diagrama vetorial, ilustração flat, ou quando
  pedir qualidade visual de SVG. Não substitui lucide-react nem Health Icons
  em UI padrão do app.
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# AVANT — SVG Quality

Skill para **desenhar SVG** com barra profissional (design systems open-source), não “path AI genérico”.

**Rule:** [`.cursor/rules/svg-quality.mdc`](../../../.cursor/rules/svg-quality.mdc) · cópia [`docs/cursor/svg-quality.mdc`](../../cursor/svg-quality.mdc)  
**Refs baixadas:** [`docs/design-refs/svg-models/`](../../design-refs/svg-models/README.md)  
**Detalhe dos modelos:** [`reference-models.md`](reference-models.md) · checklist [`reference-checklist.md`](reference-checklist.md)

## Lei (ler antes de qualquer path)

1. **Reusar > inventar** — UI app → `lucide-react`; saúde → `public/icons/healthicons/`; custom só se não existir equivalente.
2. **Uma família por arquivo** — não misturar stroke 2 Lucide com fill Phosphor no mesmo SVG.
3. **Grid canônico** — ícone `0 0 24 24`; diagrama: um viewBox fixo documentado (ex. `0 0 120 64`).
4. **Composição geométrica** — `path` curto + `circle`/`rect`/`line`; proibido Bézier orgânico denso sem referência.
5. **`currentColor`** (ou tokens AVANT) — sem paleta inventada de 6 cores.
6. **Abrir 1–3 refs locais** da família escolhida **antes** de escrever o SVG.
7. **Preview + crítica** — só ship após checklist PASS.

## Triggers

| Usuário | Ação |
|---------|------|
| `SVG:` / `criar SVG` / `ícone SVG` / `diagrama SVG` | Fluxo completo abaixo |
| Polish visual de SVG existente | Modo revisão (checklist) |
| Ícone UI genérico (home, check, alert…) | **Não desenhar** — apontar Lucide |
| Ícone clínico (seringa, vírus, EPI…) | Preferir Health Icons; custom só se gap real |
| Molde NeuroSlides React | Encadear `avant-neuroslides-visual` — SVG só como gesto/asset |

## Decisão rápida (família)

| Caso | Família | Abrir refs |
|------|---------|------------|
| Ícone UI AVANT / editorial / cyber chip | **Lucide** (default) | `docs/design-refs/svg-models/lucide/` |
| Outline Tailwind-like, stroke 1.5 | Heroicons outline | `.../heroicons-outline/` |
| Densidade média, muitos detalhes tipográficos | Tabler | `.../tabler/` |
| Regular com peso um pouco mais “soft” | Phosphor regular | `.../phosphor-regular/` |
| Pictograma clínico | Health Icons | `.../healthicons-outline/` + set completo em `public/icons/healthicons/` |
| Gesto pedagógico (compare, funil, trilho) | AVANT diagrams | `.../diagrams/` |

Default AVANT: **Lucide**.

## Spec obrigatória (preencher mentalmente)

```text
tipo: icon24 | diagram | pictogram
família: lucide | heroicons | tabler | phosphor | healthicons | avant-diagram
viewBox: …
stroke: 2 (lucide) | 1.5 (hero) | …
fill: none | currentColor (só solid intencional)
metáfora: 1 só
shapes: ≤ 6 (ícone) / ≤ 12 (diagrama)
texto: nenhum (exceto title/aria)
skin: cyber (#010409 bg / currentColor) | editorial | mono
```

## Shell canônico (ícone Lucide)

```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <!-- shapes -->
</svg>
```

Omitir `width`/`height` fixos em componentes React (controlar via CSS/`className`). Em arquivo `.svg` solto, `width="24" height="24"` ok.

## Gramática Lucide (default — inegociável em ícone AVANT)

Fonte: [Lucide Icon Design Guide](https://lucide.dev/contribute/icon-design-guide)

| Regra | Valor |
|-------|-------|
| Canvas | 24×24 |
| Padding mínimo | 1px dentro do canvas |
| Stroke | 2, centered |
| Caps / joins | `round` / `round` |
| Radius rect | 2 se ≥8px; 1 se &lt;8px |
| Gap entre elementos | ≥2px |
| Volume óptico | ≈ círculo/quadrado de referência |
| Centro | centro de gravidade visual |
| Pixel | alinhar a grid quando possível |
| Elementos permitidos | `path`, `circle`, `rect`, `line`, `polyline`, `polygon`, `ellipse` |
| Proibido | `use`, filters, transforms complexos, stroke/fill por elemento (salvo exceção solid) |

## Fluxo de produção (eficiente)

1. **Classificar** — icon24 vs diagram vs pictogram; família.
2. **Buscar existente** — Lucide name / Health Icons path. Se achar → usar componente/arquivo; parar.
3. **Abrir refs** — 1 ícone geométrico (`circle`/`square`) + 1 metafórico próximo + 1 diagrama se gesto.
4. **Desenhar** — live area ~20×20 no 24; shapes primitivas; `currentColor`.
5. **Validar** — [`reference-checklist.md`](reference-checklist.md) → todos PASS.
6. **Entregar** — arquivo em path pedido **ou** JSX inline mínimo; sem narrativa longa.

## Anti-padrões (bloquear)

- Path com dezenas de curvas “orgânicas” sem ref
- Misturar outline + filled aleatório
- Gradientes / glow / drop-shadow decorativos em ícone UI
- Texto decorativo dentro do SVG de ícone
- viewBox content-tight que quebra o set (`2 2 20 20` em família 24)
- Terceira cor decorativa fora tokens AVANT
- Copiar watermark / marca de set comercial
- Inventar ícone UI quando Lucide já tem o glifo

## Tokens AVANT (quando cor explícita)

| Skin | Stroke/fill |
|------|-------------|
| Cyber | `currentColor` sobre `#010409`; acento só `#00f2ff` / success / danger se pedido |
| Editorial | `currentColor` slate; acento `#F26522` só se CTA/foco |
| Mono | só `currentColor` |

## Encadeamento

| Precisa | Skill / doc |
|---------|-------------|
| UI app (não SVG novo) | `avant-ui-visual` |
| Gesto NeuroSlides / molde | `avant-neuroslides-visual` |
| Conteúdo da questão | handcraft / professor — **não** esta skill |

## Entrega

- Código SVG limpo (comentário curto só se gold/diagrama AVANT).
- Citar refs usadas: `@docs/design-refs/svg-models/<família>/<nome>.svg`.
- Se gap de set: dizer “não existe em Lucide/Health Icons” e justificar custom.
