# AVANT enf — Brand Golden Master Closure

Runbook canônico de **fechamento técnico** da identidade V2.1 → Golden Master oficial.

| Campo | Valor |
|-------|--------|
| **Status inicial** | `BRAND_GOLDEN_MASTER=NOT_YET` |
| **Preflight** | `GOLDEN_MASTER_NEEDS_TECHNICAL_FIX` |
| **HEAD inventariado** | `88864ec6accbaad7f058f73036b94b20a2065511` |
| **Branch inventariada** | `codex/commercial-content-enforcement-r1` |
| **Supersede** | Este runbook **não** substitui execução; complementa `docs/REBRAND_LOGO_ASSETS_CHECKLIST.md` |

> **Regra:** esta closure **não** redesenha a marca. Repara drift técnico de assets, documentação e especificação.

---

## 1. Purpose

Transformar o preflight read-only (`artifacts/brand-golden-master-preflight.json`, gitignored) em plano auditável para declarar `BRAND_GOLDEN_MASTER=PASS`.

Objetivos documentais:

1. Estado visual atualmente aprovado no produto editorial  
2. Evidências existentes no repositório  
3. Inconsistências técnicas que impedem Golden Master  
4. Decisões congeladas vs abertas  
5. Ondas de implementação futuras (fora deste doc)  
6. Critérios objetivos de aceitação final  

---

## 2. Current Status

```
BRAND_GOLDEN_MASTER=NOT_YET
BRAND_REDESIGN_REQUIRED=NO
TECHNICAL_ASSET_FIX_REQUIRED=YES
DOCUMENTATION_CLOSURE_REQUIRED=YES

PWA_ICON_STATUS=LEGACY_GREEN_ACTIVE
APP_ICON_STATUS=DRIFT_BLACK_SVG_VS_ORANGE_TARGET
FAVICON_STATUS=LEGACY_GREEN_TRACKED
FLAT_MASTERS_STATUS=GAP
TYPOGRAPHY_STATUS=DECISION_REQUIRED
CLEAR_SPACE_STATUS=DECISION_REQUIRED
USAGE_RULES_STATUS=GAP
GOLDEN_BOARD_STATUS=GAP

NEXT_SAFE_ACTION=BRAND_WAVE_1_TECHNICAL_ASSET_REPAIR
```

O **produto logado** (header/sidebar/e-mail) está alinhado ao laranja editorial `#F26522` com lockup PNG proprietário. O **pacote PWA/favicon/metadata** e a **documentação de marca** não fecham Golden Master.

---

## 3. Evidence Baseline

### Preflight local (não versionar)

| Artefato | Path | Git |
|----------|------|-----|
| Preflight JSON | `artifacts/brand-golden-master-preflight.json` | gitignored |

### Documentação existente

| Documento | Path | Papel |
|-----------|------|--------|
| Checklist rebrand assets | `docs/REBRAND_LOGO_ASSETS_CHECKLIST.md` | Onda 4 — PNG/PWA/favicon; smoke UI editorial |
| Editorial v2 (auditoria) | `docs/auditoria-visual-v2/plataformas/D2-avant-editorial-v2.md` | Direção visual app (referência) |
| Archive cyber v1 | `docs/design-archive/cyber-clinical-v1/brand/` | Legado; não usar em produção nova |

### Código e assets (fonte de verdade runtime)

| Área | Path |
|------|------|
| Paleta editorial | `lib/brand/avantBrandPalette.ts` → `EDITORIAL_BRAND.hex = #F26522` |
| Constantes logo | `lib/brand/avantLogoConstants.ts` |
| Componente lockup | `components/brand/AvantLogo.tsx` |
| Brand mark wrapper | `components/brand/AvantBrandMark.tsx` |
| E-mail | `emails/AvantLogoEmail.tsx` |
| Tokens CSS | `app/globals.css` |
| PWA manifest | `app/manifest.ts` |
| Metadata OG | `app/layout.tsx` |
| Assets públicos | `public/brand/` |
| Ícones App Router | `app/icon.png`, `app/apple-icon.png` |
| Gerador PWA (legado verde) | `scripts/build-pwa-icon.py` |
| Testes regressão | `__tests__/components/brand/AvantBrandMark.test.ts`, `__tests__/layout/sidebarRebrandP1.test.ts` |

### Regressão confirmada

```bash
npm test -- --testPathPattern="AvantBrandMark|sidebarRebrandP1" --no-coverage
```

Resultado inventariado: **13/13 PASS** (2 suites).

---

## 4. Frozen Brand Direction

### A. Decisões congeladas (não redesenhar em ondas técnicas)

| Decisão | Evidência |
|---------|-----------|
| Nome **AVANT enf** | `lib/brand/brandName.ts` |
| Laranja principal **#F26522** (CTA / marca editorial) | `EDITORIAL_BRAND` + `globals.css` |
| Hover **#E05518** | `EDITORIAL_BRAND.hover` |
| Estética premium, limpa, mobile-first, saúde sem hospital genérico | Editorial v2 + produto |
| Lockup produto: **PNG proprietário** (`a-mark` + `avant-word` + `enf`) | `AvantLogo.tsx` |
| Wordmark **não** é tipografia Inter/Montserrat no lockup | Implementação PNG |
| Cyber Clinical (`#00f2ff`) = **skin de produto** (NeuroSlides), não nova identidade de marca | `globals.css` `:root` |
| Sem redesign de logo/símbolo nesta closure | `BRAND_REDESIGN_REQUIRED=NO` |

### B. Decisões ainda abertas

| Tópico | Estado |
|--------|--------|
| App icon master: laranja sólido + A branco vs card preto atual | `DECISION_REQUIRED` (direção V2.1 preferida documentada abaixo) |
| Tipografia de marca: Montserrat (brief externo V2.1) vs famílias no app | `TYPOGRAPHY_DECISION_REQUIRED` |
| Tagline institucional canônica | `TAGLINE_CANONICAL=UNDEFINED` |
| Clear space oficial | `CLEAR_SPACE_RULE=DECISION_REQUIRED` |
| Master file único para derivados PWA | `BRAND_MASTER_SOURCE=DECISION_REQUIRED` |

---

## 5. Current Runtime Implementation

### Cor editorial

```typescript
// lib/brand/avantBrandPalette.ts
EDITORIAL_BRAND.hex = '#F26522'
EDITORIAL_BRAND.hover = '#E05518'
EDITORIAL_BRAND.washBg = '#FFF1E0'  // off-white editorial
```

`globals.css` replica tokens sob `html[data-theme='editorial']` e superfícies navy/slate no modo escuro.

### Lockup no app (`AvantLogo`)

Implementação **confirmada** (2026-09-17):

- Ícone: `<img src="/brand/avant-logo-a-mark.png">` — **não** SVG inline `AVANT_AE_MONOGRAM_PATHS`
- Wordmark: `<img>` de `avant-logo-avant-word.png` (+ variant light) e `avant-logo-enf.png`
- Constantes: `AVANT_LOGO_PNG` em `lib/brand/avantLogoConstants.ts`

### Surfaces de marca ativas

| Surface | Asset / implementação | Runtime |
|---------|----------------------|---------|
| Header / sidebar | `AvantBrandMark` → `AvantLogo` PNG | **ACTIVE** |
| E-mail transacional | `AvantLogoEmail.tsx` — selo laranja + AE texto | **ACTIVE** |
| OG / Twitter | `avant-logo-cover.png` | **ACTIVE** (`app/layout.tsx`) |
| PWA manifest | `avant-app-icon.svg` + `avant-pwa-icon*.png` | **ACTIVE** |
| Browser tab (App Router) | `app/icon.png` (32×32) | **ACTIVE** (conteúdo legado verde) |
| Apple touch | `app/apple-icon.png` (180×180) | **ACTIVE** (conteúdo legado verde) |
| SVG wordmark/horizontal | embutem `avant-logo-wordmark-raster.png` | **LEGACY_REFERENCED** (arquivos existem; app não usa em runtime) |

---

## 6. Documentation vs Implementation Drift

```
DOCUMENTATION_IMPLEMENTATION_DRIFT=CONFIRMED
```

| Afirmação (checklist / comentários) | Realidade no código |
|-------------------------------------|---------------------|
| UI in-app usa `AvantLogoIcon` SVG + `AVANT_AE_MONOGRAM_PATHS` | `AvantLogo.tsx` usa **`<img>` PNG** (`avant-logo-a-mark.png`) |
| `AVANT_AE_MONOGRAM_PATHS` como fonte do ícone | Paths existem em `avantLogoConstants.ts` mas **não são renderizados** em `AvantLogo` |
| Checklist: “app não depende mais do PNG verde” | **Parcial:** nav usa PNG laranja; PWA/favicon ainda verdes |

**Impacto:** manutenção e ondas futuras podem regenerar assets errados se seguirem só o checklist sem este runbook.

**Correção documental:** `docs/REBRAND_LOGO_ASSETS_CHECKLIST.md` **não** é alterado nesta tarefa. Este runbook **supersede** a descrição de implementação do lockup para fins de Golden Master.

**Comportamento atual correto para o produto:** lockup PNG proprietário no header — **preservar** até decisão explícita contrária.

---

## 7. Golden Master Blockers

Auditoria individual (BGM-01…07). Classificações: `CONFIRMED` | `PARTIAL` | `NOT_CONFIRMED` | `DECISION_REQUIRED`.

### BGM-01 — PWA icon legado / verde

| Campo | Valor |
|-------|--------|
| **Status** | **CONFIRMED** |
| **Categoria** | `TECHNICAL_ASSET_DRIFT` |
| **Severidade** | `BLOCKER` |

**Evidência:**

- `public/brand/avant-pwa-icon.png` (512×512): canto ~`rgb(12,201,58)`, centro ~`rgb(2,187,6)`
- `public/brand/avant-pwa-icon-maskable.png` — mesma família (gerada pelo script legado)
- `app/manifest.ts` referencia ambos + `avant-app-icon.svg`
- `scripts/build-pwa-icon.py`: `BG_RGB = (12, 201, 58)` — **hardcoded verde**; fonte `avant-logo-shield.png`

**Correção futura (Wave 1):** regenerar família PWA a partir do master laranja aprovado; atualizar `BG_RGB` e fonte do script.

---

### BGM-02 — App icon SVG

| Campo | Valor |
|-------|--------|
| **Status** | **CONFIRMED** |
| **Categoria** | `TECHNICAL_ASSET_DRIFT` |

**CURRENT_STATE:** `public/brand/avant-app-icon.svg` — fundo `#0a0a0a`, A em stroke `#E8E8E8` + acento `#F26522`.

**TARGET_STATE (direção V2.1 preferida):** fundo laranja sólido `#F26522` + símbolo A branco flat (sem gradiente obrigatório).

```
REQUIRES_ASSET_REGENERATION=YES
```

---

### BGM-03 — Wordmark SVG legado

| Campo | Valor |
|-------|--------|
| **Status** | **CONFIRMED** |
| **Categoria** | `TECHNICAL_ASSET_DRIFT` + `LEGACY_DEBT` |

**Arquivos:**

| Arquivo | Classificação | Runtime |
|---------|---------------|---------|
| `avant-logo-wordmark.svg` | `LEGACY_REFERENCED` | Não usado por `AvantLogo` |
| `avant-logo-wordmark-light.svg` | `LEGACY_REFERENCED` | Não usado por `AvantLogo` |
| `avant-logo-horizontal.svg` | `LEGACY_REFERENCED` | Não usado por `AvantLogo` |
| `avant-logo-horizontal-light.svg` | `LEGACY_REFERENCED` | Não usado por `AvantLogo` |
| `avant-logo-wordmark-raster.png` | `LEGACY_REFERENCED` | Embutido nos SVGs; ~10% pixels verde-amostra no preflight |
| `avant-logo-avant-word.png` | **ACTIVE** | Lockup app |
| `avant-logo-enf.png` | **ACTIVE** | Lockup app |
| `avant-logo-shield.png` | `DEPRECATION_CANDIDATE` | Fonte do script PWA legado |
| `avant-logo-ae-flat.png` | `LEGACY_UNREFERENCED` | Não referenciado em runtime grep |
| `avant-logo-ae-monogram.png` | `LEGACY_UNREFERENCED` | Não referenciado em runtime grep |

**Correção futura:** Wave 2 — reexport vetorial ou aposentadoria formal dos SVGs que embutem raster legado.

---

### BGM-04 — Favicon / metadata icons

| Campo | Valor |
|-------|--------|
| **Status** | **PARTIAL** |
| **Categoria** | `TECHNICAL_ASSET_DRIFT` |

**CURRENT_ICON_ENTRYPOINTS:**

| Entrypoint | Existe | Git tracked | Conteúdo |
|------------|--------|-------------|----------|
| `app/icon.png` | Sim (32×32) | Sim | **Verde legado** ~`rgb(1,220,46)` |
| `app/apple-icon.png` | Sim (180×180) | Sim | **Verde legado** ~`rgb(12,201,58)` |
| `public/favicon.ico` | Não | — | — |
| `app/manifest.ts` icons | Sim | Sim | SVG preto + PNG verde |

**NEXTJS_METADATA_CONTRACT:** Next.js App Router usa `app/icon.png` e `app/apple-icon.png` como convenção; `favicon.ico` é opcional se `icon.png` atende.

**GOLDEN_MASTER_REQUIREMENT:** entrypoints existentes com **conteúdo coerente** com V2.1 laranja — não ausência de arquivos.

```
MISSING_REQUIRED_ENTRYPOINTS=NONE
WRONG_CONTENT_ENTRYPOINTS=app/icon.png, app/apple-icon.png, avant-pwa-icon*.png
```

---

### BGM-05 — Golden Master documentation

| Campo | Valor |
|-------|--------|
| **Status** | **CONFIRMED** (gap fechado por este arquivo) |

Antes deste runbook: não existia `docs/BRAND_GOLDEN_MASTER_*`.

Este arquivo é o runbook canônico de **closure** — **não** declara Golden Master concluído.

---

### BGM-06 — Flat masters

| Campo | Valor |
|-------|--------|
| **Status** | **CONFIRMED** |
| **Categoria** | `SPEC_GAP` |

**Definição (closure):** *Flat master* = asset oficial de marca em **uma cor**, sem gradiente, sombra, volume ou efeito obrigatório; geometria reconhecível isolada.

**Inventário atual:**

| Variante alvo | Existe como export dedicado? | Notas |
|---------------|---------------------------|--------|
| Orange flat | Parcial | `avant-logo-a-mark.png` (laranja + A branco); não nomeado como flat master |
| Navy/dark flat | Não | `avant-logo-symbol.svg` usa `#0a0a0a`, não navy `#0f172a` |
| Black flat | Não | — |
| White/reverse flat | Não | — |

```
FLAT_MASTER_PACKAGE=GAP
PROPOSED_TARGET_NAMES:
  public/brand/avant-symbol-flat-orange.svg
  public/brand/avant-symbol-flat-navy.svg
  public/brand/avant-symbol-flat-black.svg
  public/brand/avant-symbol-flat-white.svg
```

---

### BGM-07 — Typography reconciliation

| Campo | Valor |
|-------|--------|
| **Status** | **DECISION_REQUIRED** |
| **Classificação** | `TYPOGRAPHY_SPEC_DRIFT` (brief V2.1 externo vs repo) |

**Brief V2.1 recebido (externo):** Montserrat (headings) + Inter (UI/body).

**Repo (confirmado `app/layout.tsx`):**

| Família | Papel |
|---------|--------|
| Inter | `body` className default |
| Plus Jakarta Sans | `--font-plus-jakarta-sans` |
| DM Sans | `--font-body` |
| Source Serif 4 | `--font-source-serif` |
| JetBrains Mono | `--font-mono` |
| Montserrat | **Ausente** em todo o repositório (grep 0) |

**Lockup marca:** raster PNG — **não** depende de Montserrat/Inter.

**Não** classificar como `TYPOGRAPHY_IMPLEMENTATION_BUG` sem decisão de produto: pode ser spec de materiais de marca vs UI implementada.

**Wave 3:** documentar papéis finais ou atualizar spec V2.1 para refletir Plus Jakarta/DM Sans se aprovados.

---

## 8. V2.1 Coverage Matrix

| Área | Estado | Evidência | Gap | Ação futura |
|------|--------|-----------|-----|-------------|
| Direção congelada | PARTIAL | `EDITORIAL_BRAND`, `AvantLogo` PNG | PWA/favicon divergem | Wave 1 |
| Wordmark spec | GAP | PNG ativo; sem doc formal proprietário | Spec escrita | Wave 3 |
| Flat master | GAP | Sem exports nomeados | 4 variantes flat | Wave 2 |
| Small-size proof | GAP | Sem artefatos 16–64px | Prova óptica + variant se necessário | Wave 4 |
| App icon | GAP | SVG preto; PNG verde no manifest | Regenerar | Wave 1 |
| Favicon | PARTIAL | `app/icon.png` existe; conteúdo verde | Recolor/regenerar | Wave 1 |
| Clear space | GAP | Só dims em `avantLogoConstants.ts` | Regra geométrica | Wave 3 |
| Cores | PARTIAL | `EDITORIAL_BRAND` + `globals.css` | Tabela HEX/RGB/HSL/CMYK marca | Wave 3 |
| Usage rules | GAP | — | Checklist do/don't | Wave 3 |
| Fotografia | PASS | Núcleo não depende de foto | — | — |
| Taglines | GAP | `landingCopy.tagline` genérica | Decisão institucional | Wave 3 (não blocking) |
| Product proof | PARTIAL | Jest 13/13; `/admin/brand` | Golden board + capturas | Wave 4 |
| Golden board | GAP | — | Prancha única QA | Wave 4 |
| Asset package | PARTIAL | `public/brand/` misto ativo/legado | Hierarquia + limpeza | Wave 2 |
| QA final | PARTIAL | Jest PASS; PWA verde FAIL | Small-size + visual | Wave 4 |

---

## 9. Asset Source-of-Truth Model

```
BRAND_ASSET_SOURCE_OF_TRUTH=DECISION_REQUIRED
```

**Problema:** o produto usa `avant-logo-a-mark.png` (laranja); PWA/favicon usam pipeline verde via `avant-logo-shield.png` + `build-pwa-icon.py`.

**Recomendação (closure):** após Wave 1, declarar um único **BRAND_MASTER_SYMBOL** (vetorial preferido) do qual derivam:

- PWA / maskable  
- `app/icon.png` / `apple-icon.png`  
- Favicon sizes  
- Flat masters  

**Critérios para eleger master (Wave 2):** resolução, transparência, uso atual, consistência com lockup aprovado, ausência de verde legado.

**Até decisão:** não gerar novos derivados sem atualizar este runbook.

---

## 10. Asset Hierarchy

Níveis conceituais — nomes **reais** onde existem; `PROPOSED_TARGET_NAME` onde não.

### LEVEL 1 — BRAND MASTER (produto atual)

| Papel | Arquivo real | Notas |
|-------|--------------|--------|
| Símbolo lockup | `public/brand/avant-logo-a-mark.png` | ACTIVE — header |
| Wordmark AVANT | `public/brand/avant-logo-avant-word.png` | ACTIVE |
| Sufixo enf | `public/brand/avant-logo-enf.png` | ACTIVE |

### LEVEL 2 — FLAT MASTERS

| Variante | Status |
|----------|--------|
| Orange | Parcial (`a-mark.png`) |
| Navy / black / white | GAP — ver §BGM-06 |

### LEVEL 3 — PRODUCT LOCKUPS

| Contexto | Implementação |
|----------|---------------|
| Header / sidebar | `components/brand/AvantLogo.tsx` |
| E-mail | `emails/AvantLogoEmail.tsx` |
| Admin preview | `app/(admin)/admin/brand/page.tsx` |
| OG social | `avant-logo-cover.png` |

### LEVEL 4 — SMALL-SIZE ASSETS

| Asset | Status |
|-------|--------|
| `avant-app-icon.svg` | ACTIVE — fundo preto (drift) |
| `avant-pwa-icon.png` | ACTIVE — verde (drift) |
| `app/icon.png` | ACTIVE — verde (drift) |
| `app/apple-icon.png` | ACTIVE — verde (drift) |

### LEVEL 5 — DERIVED / LEGACY

| Asset | Classificação |
|-------|---------------|
| `avant-logo-shield.png` | DEPRECATION_CANDIDATE (fonte script verde) |
| `avant-logo-wordmark-raster.png` | LEGACY_REFERENCED (SVG embed) |
| `avant-logo-ae-flat.png`, `ae-monogram.png` | LEGACY_UNREFERENCED |
| `docs/design-archive/cyber-clinical-v1/brand/*` | ARCHIVE |

---

## 11. Typography Reconciliation

| Camada | Especificação V2.1 (externa) | Implementação atual |
|--------|-------------------------------|---------------------|
| Brand wordmark | Lettering proprietário | PNG raster |
| Product headings | Montserrat (brief) | Plus Jakarta Sans variable |
| UI / body | Inter | Inter + DM Sans |

```
TYPOGRAPHY_STATUS=DECISION_REQUIRED
```

**Wave 3 deliverables:**

- Tabela final: família × peso × uso × fallback  
- Decisão: adotar Montserrat no app vs manter Plus Jakarta vs spec-only  
- Documentar que **enf** no lockup **não** é Inter  

---

## 12. Small-Size Requirements

Critérios objetivos futuros (Wave 4) — **não** validados nesta closure:

| Tamanho | Contexto |
|---------|----------|
| 16×16, 32×32, 48×48 | Favicon / tab |
| 24×24, 32×32, 48×48, 64×64 | Símbolo isolado |
| 128–512 | PWA / maskable |
| Wordmark 120px / 160px largura | Legibilidade enf |

**Checklist QA:**

- Legibilidade sem ampliar mockup  
- Contraste suficiente (claro/escuro)  
- Sem halo verde legado  
- Sem borda indesejada  
- Padding consistente (maskable safe zone 80%)  
- Forma reconhecível  

**Optical small-size variant:** só se 16px falhar — mesma silhueta, simplificação mínima; **não** novo símbolo.

---

## 13. Clear Space

```
CLEAR_SPACE_RULE=DECISION_REQUIRED
```

**Existente hoje:** dimensões de lockup em `AVANT_LOGO_DIMENSIONS` (`lib/brand/avantLogoConstants.ts`) — padding/gap tipográfico, **não** regra de marca publicada.

**Golden Master exigirá documentar:**

- Unidade-base (ex.: altura do símbolo ou x-height do wordmark)  
- Margem mínima ao redor do símbolo e do lockup horizontal  
- Comportamento icon-only vs horizontal  
- Fundos permitidos  

---

## 14. Usage Rules

Checklist futuro (Wave 3) — **esboço**, não norma final:

### Permitido (a confirmar)

- Lockup PNG em header editorial / cyber shell  
- Fundo claro editorial (`#FFF1E0` / branco)  
- Fundo escuro cyber  
- Monochrome para export impresso (após flat masters)  
- App icon laranja + A branco (pós Wave 1)  

### Proibido (a confirmar)

- Recoloração arbitrária do laranja  
- Distorção / rotação / outline pesado  
- Sombra obrigatória para reconhecimento  
- Combinação com verde legado `#0CC93A` / `rgb(12,201,58)`  
- Separar AVANT e enf com espaçamento não aprovado  
- Usar `avant-logo-wordmark-raster.png` em superfícies novas  

---

## 15. Tagline Status

```
TAGLINE_CANONICAL=UNDEFINED
```

**Existente no repo:** `lib/marketing/landingCopy.ts` → `tagline: 'Estudo reverso para Técnico em Enfermagem'` (marketing, não assinatura institucional V2.1).

Frases do brief externo (“Estudo que te leva mais longe.” / “Mais que estudo. Avanço real.”) **não** encontradas no código.

```
GOLDEN_MASTER_BLOCKING=NO
```

Tagline **não** bloqueia Wave 1 (assets técnicos). Bloqueia fechamento completo de materiais de marketing institucional.

---

## 16. Golden Board Requirement

```
BRAND_GOLDEN_BOARD=NOT_YET
```

**Escopo futuro (Wave 4):** uma prancha única de QA visual contendo:

1. Master symbol (produto)  
2. Wordmark PNG  
3. Horizontal / compact lockup  
4. Flat masters (4 cores)  
5. Light / dark  
6. App icon + PWA + favicon em tamanhos reais  
7. Small-size proof 16–64px  
8. Exemplo header + sidebar  
9. Do / Don't (resumo)  

**Critério de aceite:** inspeção humana sem redesign; todos os ativos **ativos** representados.

---

## 17. Closure Waves

| Wave | Nome | Escopo | Executar nesta tarefa? |
|------|------|--------|------------------------|
| **0** | Documentation | Este runbook | ✅ Sim |
| **1** | Technical asset repair | PWA, app icon SVG, favicon/metadata, remover verde ativo | ❌ Não |
| **2** | Master asset package | Flat masters, organização `public/brand/`, legado | ❌ Não |
| **3** | Specification closure | Tipografia, clear space, usage, cores tabuladas, tagline | ❌ Não |
| **4** | Golden board + QA | Prancha, small-size, capturas produto | ❌ Não |
| **5** | Final brand gate | `BRAND_GOLDEN_MASTER=PASS` | ❌ Não |

---

## 18. Acceptance Criteria

`BRAND_GOLDEN_MASTER=PASS` somente quando **todos** obrigatórios:

| # | Critério |
|---|----------|
| 1 | Nenhum asset **ativo** com verde legado pré-rebrand |
| 2 | `BRAND_MASTER_SOURCE` definido e documentado |
| 3 | Lockup produto (`AvantLogo` PNG) aprovado e estável |
| 4 | PWA icons coerentes com master laranja |
| 5 | `app/icon.png` / `apple-icon.png` coerentes |
| 6 | Flat masters orange/navy/black/white exportados |
| 7 | Variantes light/dark/monochrome documentadas |
| 8 | Small-size QA 16–64px aprovado |
| 9 | Clear-space rule publicada |
| 10 | Tipografia reconciliada (spec ↔ app) |
| 11 | Usage rules publicadas |
| 12 | Legacy assets classificados (aposentados ou arquivados) |
| 13 | Drift checklist ↔ implementação resolvido ou superseded |
| 14 | Jest brand regressão PASS |
| 15 | Inspeção visual golden board aprovada |
| 16 | Contraste WCAG relevante mantido |
| 17 | `BRAND_REDESIGN_REQUIRED=NO` preservado |

---

## 19. Explicit Non-Goals

Esta closure **não** pretende:

- Criar nova marca ou redesenhar logo/símbolo  
- Substituir lockup PNG atual sem evidência  
- Trocar paleta `#F26522`  
- Redesenhar UI / páginas / UX  
- Trocar fontes globalmente na Wave 0  
- Alterar arquitetura frontend  
- Tocar P0, evidence manifests, RC004, commercial binding, denylist, Supabase, Production  

---

## 20. Safety / Separation from P0

Trilho **independente** de:

- `EVIDENCE_GOVERNED_APPROVAL_V2` / P0 cohort  
- `catalog:apply-lote`  
- `P0_APPLY_AUTHORIZED`  
- Fingerprints comerciais  

Nenhum artefato desta closure autoriza apply de conteúdo ou mudança comercial.

---

## 21. Final Gate Definition

### Estados

| Gate | Condição |
|------|----------|
| `BRAND_GOLDEN_MASTER=NOT_YET` | Estado atual |
| `BRAND_GOLDEN_MASTER=PASS` | Todos critérios §18 + blockers BGM fechados |
| `BRAND_GOLDEN_MASTER=FAIL` | Regressão grave pós-PASS (procedimento futuro) |

### Snapshot inicial (pós-runbook)

```
BRAND_GOLDEN_MASTER=NOT_YET
BRAND_REDESIGN_REQUIRED=NO
TECHNICAL_ASSET_FIX_REQUIRED=YES
DOCUMENTATION_CLOSURE_REQUIRED=YES
PWA_ICON_STATUS=LEGACY_GREEN_ACTIVE
APP_ICON_STATUS=DRIFT_BLACK_SVG_VS_ORANGE_TARGET
FAVICON_STATUS=LEGACY_GREEN_TRACKED
FLAT_MASTERS_STATUS=GAP
TYPOGRAPHY_STATUS=DECISION_REQUIRED
CLEAR_SPACE_STATUS=DECISION_REQUIRED
USAGE_RULES_STATUS=GAP
GOLDEN_BOARD_STATUS=GAP
NEXT_SAFE_ACTION=BRAND_WAVE_1_TECHNICAL_ASSET_REPAIR
```

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| `docs/REBRAND_LOGO_ASSETS_CHECKLIST.md` | Checklist operacional Onda 4 — **drift de implementação** ver §6 |
| `artifacts/brand-golden-master-preflight.json` | Evidência local read-only (gitignored) |
| `docs/P0_PEDAGOGICAL_REVIEW_CONVERSA.md` | Trilho P0 — **não** misturar |

---

*Runbook criado em modo DOC ONLY — sem alteração de assets, código, CSS, PWA ou fontes.*
