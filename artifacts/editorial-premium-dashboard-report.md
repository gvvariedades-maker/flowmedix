# Relatório §25 — Editorial Premium Dashboard (`a11y-tests`)

**Branch:** `ui/editorial-premium-dashboard` @ `85b267fe` (+ WIP local)  
**Data:** 2026-08-10  
**Escopo deste to-do:** contraste tokens + E2E/capturas after + gates (`check:ship` / `build`) + relatório.

---

## 1. Resumo executivo

O pacote Editorial Premium Dashboard está **validado para a11y/gates**:

- Contraste WCAG AA dos 4 pares editoriais: **PASS** (`__tests__/a11y/editorialContrastTokens.test.ts`)
- Capturas **after** regeneradas (9 PNGs) em `artifacts/editorial-premium-dashboard-after/`
- E2E editorial: **21/21 PASS** (audit-visual + capture-after + capture-t3 + vitrine-premium, incl. assert CSS do CTA `#C2410C`)
- Gates: `check:architecture` · `typecheck` · `lint` · `test` (3300) · `check:ship` · `git diff --check` → **PASS**
- `npm run build` → em execução / ver §8
- **Sem** commit, push, merge ou deploy nesta sessão
- **Sem** alteração de regra de negócio neste to-do (somente evidências/gates/relatório)

---

## 2. Diagnóstico do que realmente foi alterado (delta do ramo)

Implementação já presente no WIP da branch (não refeita neste to-do):

| Área | Delta |
|------|--------|
| Shell / PRO | `PlanStatusCard` → bloco “Plano PRO · Ativo”; tokens; sidebar/toolbar polish em `DashboardShell` |
| Hierarquia CTA | `.btn-editorial-primary-solid` / `.btn-editorial-secondary` + `--color-brand-cta-solid`; helpers `buttonPrimarySolid` / `buttonSecondary` em `vitrineBrand` |
| Vitrine | Cards/header/filtros: chip neutro, progresso semântico, hit areas ≥44px, um primário acima da dobra |
| Progresso / simulados | Heatmap/ranking em tokens success; KPI via `KPI_VALUE_CLASS`; cards sem glow laranja |
| A11y / arch | Teste contraste Jest; gates `no-tailwind-arbitrary-rgba-space` + `no-brand-hex-outside-palette` |

**Este to-do (`a11y-tests`)** acrescentou/confirmou: execução dos testes, regeneração das capturas after, suíte E2E, gates de ship/build e este relatório.

---

## 3. Arquivos relevantes (delta + evidências)

### Modificados (amostra principal — `git diff --stat`)

- `app/globals.css`, `app/(dashboard)/DashboardShell.tsx`
- `components/plan/PlanStatusCard.tsx`
- `components/vitrine/*` (Resume, Subject, Diagnóstico, Mission, Header, Filters, …)
- `components/ui/score-card.tsx`
- `components/dashboard/performance/*`, `components/simulados/SimuladosAnalyticsDashboard.tsx`
- `lib/vitrine/vitrineBrand.ts`, `lib/vitrine/vitrineTopicAccent.ts`
- `e2e/vitrine-premium.spec.ts`, `scripts/check-architecture-patterns.ts`

### Novos / evidências

- `__tests__/a11y/editorialContrastTokens.test.ts`
- `e2e/capture-editorial-premium-before.spec.ts` / `e2e/capture-editorial-premium-after.spec.ts`
- `artifacts/editorial-premium-dashboard-before/` · `artifacts/editorial-premium-dashboard-after/`
- `components/dashboard/performance/activity-sparkline.tsx` (suporte visual progresso)

---

## 4. Tokens

| Token / classe | Uso |
|----------------|-----|
| `--color-brand-cta-solid` `#C2410C` | CTA primário sólido editorial |
| `--color-brand-cta-solid-hover` `#9A3412` | Hover do primário |
| `--color-brand-text` `#9A3412` | Texto de marca / secondary button |
| `--color-surface-0` `#FFF1E0` | Canvas editorial |
| `--color-surface-2` `#ffffff` | Fundo secondary / cards |
| `--color-text-secondary` `#475569` | Descrições |
| `--color-brand-dim` `rgba(242,101,34,0.12)` | Tint sobre canvas |
| `.btn-editorial-primary-solid` / `.btn-editorial-secondary` | Variantes semânticas (só bloco editorial / dashboard-surface) |

**Não** criados sinônimos `--color-canvas` / `--color-ink` / `--color-brand-action`.  
**Não** alterado `:root` Cyber.

---

## 5. Decisões de hierarquia visual

1. **No máximo um** retângulo laranja preenchido acima da dobra (banner Retomar / Diagnóstico / Missão).
2. CTAs de card de assunto = **secondary** (“Iniciar” / “Continuar” / “Revisar”) — sem uppercase/font-black.
3. Primário = sólido `#C2410C`, sem gradiente cyber.
4. Chip fechado neutro; `getTopicAccent` só no expandido/sheet.
5. Progresso: `0%` → “Não iniciado”; `100%` → “Concluído” (success tokens).

---

## 6. Comparação antes / depois

| Cenário | Before | After |
|---------|--------|-------|
| Estudar enfermagem 390 | `before/estudar-enfermagem-390x844.png` | `after/estudar-enfermagem-390x844.png` |
| Estudar enfermagem 1366 | `before/estudar-enfermagem-1366x768.png` | `after/estudar-enfermagem-1366x768.png` |
| Progresso 390 / 1366 | `before/progresso-*.png` | `after/progresso-*.png` |
| Simulados 390 / 1366 | `before/desempenho-simulados-*.png` | `after/desempenho-simulados-*.png` |
| Hub / empty / 1440 | (parcial no before) | `after/estudar-hub-1366x768.png`, `estudar-empty-filter-1366x768.png`, `estudar-enfermagem-1440x900.png` |

Delta visual esperado: CTA sólido editorial, PRO strip textual, cards secondary, métricas sem glow.

### Trade-off 1366×768 (addendum §7)

Meta de “1ª fileira completa” compete com banner + header. Prioridade foi comprimir hierarquia (um primário + stats inline). Se a 1ª fileira ainda não fecha em alguns estados de dados, a captura `estudar-enfermagem-1366x768.png` documenta o trade-off sem forçar corte de UX.

---

## 7. Caminhos das capturas

- Before: `artifacts/editorial-premium-dashboard-before/`
- After: `artifacts/editorial-premium-dashboard-after/` (regeneradas 2026-08-10 ~10:26–10:27)
- Auditoria T3/T*: `docs/auditoria-visual-v2/screenshots/avant-editorial-v2/` (via `audit-visual-editorial-v2` + `capture-t3-vitrine`)

---

## 8. Resultados dos testes / gates

| Gate | Resultado |
|------|-----------|
| `npx jest __tests__/a11y/editorialContrastTokens.test.ts` | **4/4 PASS** |
| `npm run check:architecture` | **PASS** (incl. rgba space + brand hex) |
| `npm run typecheck` | **PASS** |
| `npm run lint` | **PASS** |
| `npm test` (via `check:ship`) | **362 suites / 3300 tests PASS** |
| `git diff --check` | **PASS** |
| Playwright (chromium, 21 tests) | **21/21 PASS** — `audit-visual-editorial-v2`, `capture-editorial-premium-after`, `capture-t3-vitrine`, `vitrine-premium` (V4 CTA `rgb(194,65,12)`) |
| `npm run check:ship` | **PASS** (`SHIP_EXIT=0`) |
| `npm run build` | **PASS** (`BUILD_EXIT=0`; log `artifacts/_gate-build.log`) |

---

## 9. Testes não executados e motivos

| Item | Motivo |
|------|--------|
| Playwright Firefox / WebKit / Mobile projects | Fora do escopo do plano (chromium `--workers=1` conforme specs) |
| Revisão humana A4 de cada PNG | Evidências geradas; julgamento visual humano opcional |
| Commit / PR | Proibido sem pedido explícito |

---

## 10. Riscos restantes

- **Zona amarela:** CSS editorial compartilhado (`globals.css` + shell) — regressão possível em outras telas dashboard se tokens forem reaproveitados fora do escopo.
- Dev local lento (filesystem / cold compile) — E2E flaky se servidor sem `E2E_*_BYPASS`.
- WIP amplo na branch (logo/rebrand adjacente) — revisar diff antes de PR para não misturar escopos.

---

## 11. Confirmação — regra de negócio

**Confirmado:** este to-do não alterou lógica de progresso, entitlements, filtros de catálogo, player ou NeuroSlides. Validação apenas de UI tokens, contraste, capturas e gates.

---

## 12. Confirmação — commit / push / merge / deploy

**Confirmado:** nenhum `git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>"`, `git push`, merge ou deploy foi executado nesta sessão.

