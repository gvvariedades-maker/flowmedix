# Matriz de migração visual — v3 → v4

**Data:** 2026-08-11
**Desfecho:** **A**
**SHA:** `f5ee914eacfd2de66553e87de45676314290b2d5`
**ADR:** [`../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md`](../DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md)
**Direction v4:** [`tokens/AVANT-VISUAL-DIRECTION-v4.md`](AVANT-VISUAL-DIRECTION-v4.md)
**Spec:** [`NEUROSLIDES-VISUAL-SPEC-v2.md`](NEUROSLIDES-VISUAL-SPEC-v2.md)

Classificações: `MIGRADO` · `MIGRADO_PARCIALMENTE` · `LEGADO_INTENCIONAL` · `SUPERADO` · `SUPERADO_PARCIALMENTE` · `PENDENTE` · `NAO_CONFIRMADO`

| Elemento | Estado anterior | Estado atual | Evidência | Classificação | Ação |
| -------- | --------------- | ------------ | --------- | ------------- | ---- |
| Marca (brand) | Verde `#8fe020` (v3) | Laranja `#F26522` | PR #90; `globals.css` editorial | MIGRADO | Direction v4 |
| Success | Misturado com marca na doc | `#16a34a` editorial; `#00ff88` `:root` | `globals.css` | MIGRADO | Marca ≠ success |
| Fundo app | Editorial | `#FFF1E0` | CSS editorial | MIGRADO | — |
| Cartões app | Cards brancos | `.card-elevated*` | CSS | MIGRADO | — |
| Botões app | CTA editorial | `.btn-editorial-primary` | CSS + player | MIGRADO | — |
| Navegação | Barra marca | `--color-nav-active-bar` `#F26522` | CSS | MIGRADO | — |
| Tipografia app | Slate | `--color-text-*` | CSS | MIGRADO | Font stack inventário = PENDENTE doc |
| NeuroSlides (UI player) | Cyber `#010409` obrigatório | Claro Opção B | Player + slideSurface + themeGenerator | MIGRADO | Spec v2 |
| NeuroSlides (cérebro 4 tipos) | Ordem v2 | Ordem v2 | DECISAO G2 | LEGADO_INTENCIONAL (válido) | Manter |
| NeuroCanvas (tooling) | Filas G0.x | Independente da skin UI | docs NEUROCANVAS | NAO_CONFIRMADO neste pacote UI | Não misturar |
| Logo | Rebrand | AVANT preto + enf laranja | PR #91 | MIGRADO | — |
| Favicon / App Router (`app/icon.png`, `app/apple-icon.png`) | Verde residual possível | Arquivos existem; checklist ainda pede regenerar se verde | `app/icon.png`, `app/apple-icon.png`; `REBRAND_LOGO_ASSETS_CHECKLIST.md` unchecked | MIGRADO_PARCIALMENTE | Regenerar PNG se ainda verde; UI in-app SVG ok |
| PWA manifest | — | `app/manifest.ts` theme/bg `#f1f5f9`; icons SVG `#F26522` + PNG 512 | `app/manifest.ts`; `public/brand/avant-app-icon.svg` hex `#F26522` | MIGRADO_PARCIALMENTE | SVG canônico; PNGs maskable/any checklist aberto |
| OG cover | — | `/brand/avant-logo-cover.png` em metadata | `app/layout.tsx` openGraph/twitter | MIGRADO_PARCIALMENTE | Checklist pede regenerar cover |
| Brand constants | Verde marca | `EDITORIAL_BRAND` `#F26522`; aliases deprecados | `lib/brand/avantBrandPalette.ts`, `avantLogoConstants.ts` | MIGRADO | — |
| Loading | — | Padrões player | código | NAO_CONFIRMADO doc | Ampliar se necessário |
| Screenshots baseline Cyber | avant-baseline | Histórico | pasta | LEGADO_INTENCIONAL | Banner |
| Screenshots editorial v2 | avant-editorial-v2 | Parcial app | pasta | MIGRADO_PARCIALMENTE | Falta reverso claro @ SHA |
| Baseline reverso claro @ SHA | — | Não gerado nesta tarefa | — | PENDENTE | Manifesto |
| Skills avant-ui-visual | Cyber no reverso | Alinhar v4 | sync tarefa | MIGRADO (docs) | Atualizar |
| Skills avant-neuroslides-visual | Skin Cyber | Spec v2 | sync | MIGRADO (docs) | Atualizar |
| Rules avant-ui-visual.mdc | Dual | v4 | sync | MIGRADO (docs) | Atualizar |
| DESIGNER_FRONT_AVANT.md | Autoridade v3 | Autoridade v4 | hub | MIGRADO | Atualizar |
| AVANT-VISUAL-DIRECTION-v3.md | Vigente | Histórico | tokens/ | SUPERADO | Banner |
| CLAUDE.md §3 | NeuroSlides = Cyber | NeuroSlides claros | CLAUDE | MIGRADO (docs) | Diff mínimo |
| WCAG editorial | Contraste | Complemento; marca verde v3 obsoleta | WCAG doc | SUPERADO_PARCIALMENTE | Ressalva marca |
| Comentário globals.css player Cyber | Texto velho | Código claro | globals.css | PENDENTE | Runtime fora de escopo |
| Landing demos `#010409` | Cyber | Ainda presente | DemoInterativa.tsx | MIGRADO_PARCIALMENTE | Exceção |
| Archive cyber-clinical-v1 | Snapshot | Arquivo | design-archive | LEGADO_INTENCIONAL | Preservar |
| Tokens `:root` Cyber | Default CSS | Ainda no CSS | globals.css | LEGADO_INTENCIONAL | Não deletar aqui |
| Autoridade docs canônicos | Em `auditoria-visual-v2/` (cursorignore) | `docs/design-system/` legível | move revisão corretiva | MIGRADO | Manter v3/screenshots na auditoria |
