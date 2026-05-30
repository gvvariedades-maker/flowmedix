# QA — clearance inferior mobile (BottomNav + faixas fixas)

Checklist manual obrigatório após mudanças em `lib/layout/mobileBottomNav.ts`, `DashboardShell` ou padding de páginas.

**Viewport:** 390×844 (ou iPhone 14), safe area simulada no DevTools.  
**Desktop:** largura ≥ `md` (768px) — confirmar que barras fixas e `md:pb-0` do shell não regrediram.

## Rotas (8)

| # | Rota | O que verificar |
|---|------|-----------------|
| 1 | `/simulados` | Botão final do formulário visível acima do BottomNav; com banner PWA aberto, submit ainda rolável |
| 2 | `/simulados/[id]` | Confirmar / próxima; link «Sair e voltar» acima da faixa de ação + nav |
| 3 | `/simulados/[id]` (resumo) | Três CTAs inferiores sem corte |
| 4 | `/estudar` | Último card da lista; com 2+ páginas, paginação fixa não cobre cards |
| 5 | `/estudar/[slug]` | Última alternativa + confirmar; scroll até confirmar sem ficar sob o nav |
| 6 | `/plano-diario` | Card sticky de lembrete acima do BottomNav; lista rolável até o fim |
| 7 | `/material` e `/material/neuroslides` | Rodapé / últimos itens acima do nav |
| 8 | Banner PWA | Com painel «Instale o AVANT» visível: rotas longas do dashboard (`/simulados`, `/estudar`, `/plano-diario`, `/material`, `/cadernos`, `/progresso`, etc.) — conteúdo final acima do banner (`MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA` via `useDashboardBottomInset` / `DashboardMobilePage`) |

## Desktop — regressão

- [`DashboardShell`](../app/(dashboard)/DashboardShell.tsx): `<main>` mantém `md:pb-0` (padding mobile só abaixo de `md`).
- Barras **não** alteradas neste trabalho: `BottomNav` (`fixed bottom-0 z-40`), paginação vitrine `fixed`, faixa simulado portal, wrapper PWA `z-[60]`.
- Páginas com `md:pb-8` na root (ex. vitrine, simulados) mantêm espaçamento desktop intencional.

## Automatizado (Jest)

- `__tests__/layout/mobileBottomNav.test.ts` — strings dos tokens e `getDashboardPageBottomPadding`.
- `__tests__/layout/dashboardShellDesktopPadding.test.ts` — `DashboardShell` contém `md:pb-0` no `<main>`; páginas client usam `useDashboardBottomInset` ou `DashboardMobilePage` (PWA por padrão).

## Comandos

```bash
npm test -- __tests__/layout/mobileBottomNav.test.ts __tests__/layout/dashboardShellDesktopPadding.test.ts
```
