# AVANT — Editorial v2 (pós-rebrand dashboard)

| Campo | Valor |
|-------|-------|
| **ID roster** | D2 |
| **URL** | app local / produção |
| **Categoria** | Controle — estado pós-migração editorial |
| **Tag Git** | `avant/editorial-v2` |
| **Rollback Git** | `avant/cyber-clinical-v1` |
| **Data da captura** | 2026-06-10 |
| **Viewport desktop** | 1440×900 |
| **Viewport mobile** | 375×812 |
| **Método** | Playwright `e2e/audit-visual-editorial-v2.spec.ts` + `E2E_DASHBOARD_BYPASS` |

---

## Identidade Editorial v2

### Tokens (`html[data-theme='editorial']` em `app/globals.css`)

| Token | Valor |
|-------|-------|
| `--color-surface-0` | `#f8fafc` |
| `--color-surface-2` | `#ffffff` |
| `--color-brand` | `#8fe020` (verde logo) |
| `--color-brand-text` | `#3d6b0f` |
| `--color-success` | `#16a34a` |
| `--color-danger` | `#dc2626` |
| Nav ativo | verde `#8fe020` / texto `#3d6b0f` |

### Utilitários

- `.card-elevated` / `.card-elevated-lg` — cards brancos, borda slate-200, sombra sutil
- `.btn-editorial-primary` — CTA verde `#8fe020`, label `#1a2e05`
- `.btn-editorial-outline` — secundário branco/slate
- `.btn-option-editorial` — alternativas do player
- `useEditorialTheme()` — ativa `data-theme='editorial'` no dashboard

---

## Escopo migrado (Fases 0–6)

| Área | Status |
|------|--------|
| Auth (`/login`, `/register`) | Editorial |
| Dashboard shell (sidebar, bottom nav) | Editorial |
| Vitrine, cadernos, simulados, plano, analytics, ajuda, assinatura, material | Editorial |
| Player questão (card enunciado/alternativas) | Editorial |
| Modais transversais (paywall, PWA, report, welcome) | Editorial |
| Estudo Reverso fullscreen + NeuroSlides overlay | **Escuro** (exceção) |
| Landing pública, admin, e-mails | Cyber (fora do escopo) |

---

## Rotas capturadas

| Rota | Telha |
|------|-------|
| `/` | T1 (LP ainda cyber) |
| `/login` | T2 |
| `/estudar` | T3 |
| `/estudar/[slug]` | T5, T6, T9 |
| `/simulados`, `/simulados/novo` | T10 |
| `/cadernos` | T11 |
| `/plano-diario` | T7 |
| `/conta/assinatura` | T8 |
| `/material/neuroslides` | extra |
| `/ajuda/estudo-reverso` | extra |

Screenshots: `screenshots/avant-editorial-v2/`

---

## Telhas

| ID | Desktop | Mobile | Arquivo | Notas |
|----|---------|--------|---------|-------|
| T1 | ☑ | ☑ | `T1-landing-*.png` | LP permanece cyber até fase landing |
| T2 | ☑ | ☑ | `T2-login-*.png` | editorial |
| T3 | ☑ | ☑ | `T3-vitrine-*.png` | editorial |
| T4 | — | — | _(em T3)_ | card na lista |
| T5 | ☑ | ☑ | `T5-player-*.png` | card editorial; reverso escuro |
| T6 | ☑ | ☑ | `T6-feedback-*.png` | feedback acerto/erro editorial |
| T7 | ☑ | ☑ | `T7-plano-diario-*.png` | |
| T8 | ☑ | ☑ | `T8-conta-*.png` | |
| T9 | ☑ | ☑ | `T9-neuroslides-*.png` | overlay escuro (exceção) |
| T10 lista | ☑ | ☑ | `T10-simulados-lista-*.png` | |
| T10 setup | ☑ | ☑ | `T10-simulado-setup-*.png` | |
| T11 | ☑ | ☑ | `T11-cadernos-*.png` | |
| extra material | ☑ | ☑ | `T-material-*.png` | |
| extra ajuda | ☑ | ☑ | `T-ajuda-estudo-reverso-*.png` | |

**Total:** 26 PNG em `screenshots/avant-editorial-v2/`

---

## WCAG AA

Validação automatizada: `node scripts/wcag-editorial-contrast.mjs`  
Relatório: [`../tokens/WCAG-CONTRAST-EDITORIAL-V2.md`](../tokens/WCAG-CONTRAST-EDITORIAL-V2.md)

---

## Comparação vs D1 (Cyber baseline)

| Aspecto | D1 Cyber | D2 Editorial |
|---------|----------|--------------|
| Fundo app | `#010409` + listras | `#f8fafc` limpo |
| CTA | cyan glow | verde logo sólido |
| Cards | glass-panel blur | branco opaco |
| Confiança institucional | alta tech, baixa “prova” | alinhado QConcursos/Gabarita |
| Exclusividade | NeuroSlides neon | NeuroSlides escuro + verde marca |
