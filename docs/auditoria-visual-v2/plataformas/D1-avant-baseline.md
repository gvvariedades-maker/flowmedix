# AVANT — baseline Cyber Clinical v1

| Campo | Valor |
|-------|-------|
| **ID roster** | D1 |
| **URL** | app local / produção |
| **Categoria** | Controle — estado atual pré-rebrand |
| **Rollback Git** | `avant/cyber-clinical-v1` |
| **Data da captura** | 2026-06-10 |
| **Viewport desktop** | 1440×900 |
| **Viewport mobile** | 375×812 |
| **Método** | Playwright `e2e/audit-visual-baseline.spec.ts` + `E2E_DASHBOARD_BYPASS` |

---

## Identidade atual (referência técnica)

### Tokens (`app/globals.css`)

| Token | Valor |
|-------|-------|
| `--color-surface-0` | `#010409` |
| `--color-surface-2` | `#0d1117` |
| `--color-brand` | `#00f2ff` (cyan) |
| `--color-success` | `#00ff88` |
| `--color-danger` | `#ff0055` |
| Nav ativo | violet `#8b5cf6` |

### Utilitários

- `.glass-panel` — slate-900/80, blur, rounded 2.5rem
- `.text-neon-gradient` — white → cyan → blue
- `.btn-option` — hover cyan glow
- `body::before` — listras diagonais fixas

### Logo (`lib/brand/avantLogoConstants.ts`)

- Ícone: gradiente roxo `#3018c8` → `#180c80`
- Raio/acento: verde-limão `#8fe020`, `#d8ff70`, `#58b800`
- Lockup: barra accent verde, fundo `#0d0d18`

---

## O que PRESERVAR no rebrand

1. **Logo e verde-limão** como assinatura de marca (CTA ou accent).
2. **NeuroSlides** — cores por subtópico (`themeGenerator.ts`), suavizar glow apenas.
3. **Estudo Reverso** — narrativa e fluxo do player intactos.
4. **Tokens semânticos** success/danger — sem neon, manter significado.
5. **Arquitetura** `dashboard-surface` + shadcn — trocar valores, não estrutura.

---

## O que SUBSTITUIR

1. Fundo `#010409` + listras → superfície editorial clara (ou dark suave).
2. Cyan `#00f2ff` como brand principal → verde logo ou azul editorial.
3. Glassmorphism em massa → cards opacos com sombra sutil.
4. `rounded-[2.5rem]` universal → escala 8 / 12 / 16 px.
5. Hardcodes `bg-[#010409]` (~40+ arquivos) → classes semânticas.

---

## Rotas para captura

| Rota | Telha |
|------|-------|
| `/` ou landing ativa | T1 |
| `/login`, `/register` | T2 |
| `/estudar` | T3, T4 |
| `/estudar/[slug]` | T5, T6, T9 |
| `/simulados`, `/simulados/novo` | T10 (lista + setup; runner omitido — seed E2E instável no dev) |
| `/cadernos`, `/cadernos/[id]` | T11 |
| `/plano-diario` | T7 |
| `/conta` ou assinatura | T8 |
| `/material/neuroslides` | extra (`/material` redireciona para `/estudar`) |
| `/ajuda/estudo-reverso` | copy/método |

Screenshots: `screenshots/avant-baseline/`

---

## Telhas

| ID | Desktop | Mobile | Arquivo | Notas |
|----|---------|--------|---------|-------|
| T1 | ☑ | ☑ | `T1-landing-*.png` | `LandingHome.tsx` |
| T2 | ☑ | ☑ | `T2-login-*.png` | heading "Acesse sua Área" |
| T3 | ☑ | ☑ | `T3-vitrine-*.png` | `VitrineClient.tsx` |
| T4 | — | — | _(em T3)_ | card na lista; sem crop dedicado |
| T5 | ☑ | ☑ | `T5-player-*.png` | slug E2E seed |
| T6 | ☑ | ☑ | `T6-feedback-*.png` | após confirmar resposta |
| T7 | ☑ | ☑ | `T7-plano-diario-*.png` | bypass → revisões vazias |
| T8 | ☑ | ☑ | `T8-conta-*.png` | `/conta/assinatura` |
| T9 | ☑ | ☑ | `T9-neuroslides-*.png` | overlay Estudo Reverso |
| T10 lista | ☑ | ☑ | `T10-simulados-lista-*.png` | `/simulados` |
| T10 setup | ☑ | ☑ | `T10-simulado-setup-*.png` | `/simulados/novo` |
| T11 | ☑ | ☑ | `T11-cadernos-*.png` | bypass → lista vazia |
| extra material | ☑ | ☑ | `T-material-*.png` | |
| extra ajuda | ☑ | ☑ | `T-ajuda-estudo-reverso-*.png` | copy do método |

**Total:** 26 PNG em `screenshots/avant-baseline/` (inclui extras).

---

## Dívida técnica visual (amostra)

Arquivos com `bg-[#010409]` hardcoded — limpar na fase 5 do rebrand:

- `components/dashboard/*`
- `components/simulados/*`
- `components/vitrine/VitrineClient.tsx`
- `app/(dashboard)/**/loading.tsx`
- `emails/base-layout.tsx` (BG `#010409`)

---

## Scores (baseline de comparação)

Fonte: `scores/scorecard.csv` — 2026-06-10.

### T1 Landing

| L | H | D | C | M | I | A | P | E | X |
|---|---|---|---|---|---|---|---|---|---|
| 4 | 4 | 3 | 3 | 4 | 5 | 3 | 3 | 4 | 5 |

### T-app (vitrine, player, dashboard — agregado)

| L | H | D | C | M | I | A | P | E | X |
|---|---|---|---|---|---|---|---|---|---|
| 4 | 4 | 4 | 3 | 4 | 5 | 3 | 3 | 3 | 5 |

**Leitura:** identidade e exclusividade altas (I/X=5); confiança institucional e performance visual abaixo de QConcursos — alvo do rebrand editorial.
