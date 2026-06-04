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
| 4 | `/estudar` | Último card da lista; paginação inline visível; filtros Banca/Assunto com sheet + teclado iOS não cobre «Fechar»; **modal questão aberto:** Tab não alcança vitrine nem BottomNav; foco permanece no sheet/player (`EstudarQuestaoModalRoute`); Escape fecha |
| 5 | `/estudar/[slug]` | Última alternativa + confirmar; scroll até confirmar sem ficar sob o nav |
| 6 | `/plano-diario` | Card sticky de lembrete acima do BottomNav; lista rolável até o fim |
| 7 | `/cadernos` | Sheet «Inserir questões» com busca — teclado iOS não cobre conteúdo; botão fechar ≥ 44px |
| 8 | Banner PWA | Com painel «Instale o AVANT» visível: rotas longas do dashboard — conteúdo final acima do banner (`MOBILE_PAGE_PWA_BANNER_PADDING` via `useDashboardBottomInset` / `DashboardMobilePage`; nav já reservado em `MOBILE_MAIN_SCROLL_PADDING` no shell) |

## Mobile — sheets e acordeões

| Item | O que verificar |
|------|-----------------|
| Filtros vitrine (Banca/Assunto) | Itens da lista ≥ 44px; busca com teclado aberto — footer «Fechar» acessível |
| Acordeão assunto | Expandir/colapsar assunto e lista de questões sem jank perceptível (Safari iOS) |
| `DashboardFilterSelect` / `MultiCheckboxFilter` | Paridade: fechar 44px, body lock, teclado iOS |
| Reporte de erro | Painel com `pb-safe`; botão fechar ≥ 44px |
| Modal questão (`/estudar` overlay) | Vitrine com `hidden` + `aria-hidden`; BottomNav com `aria-hidden` e tab bloqueado; focus trap no painel do sheet (não no `<main>` — modal renderiza dentro do main) |
| Alternativas no player | Toque sem scale «grudado» após soltar (sem `whileHover`; `active:scale` + `whileTap`) |
| Fundo global iOS | Listras diagonais sem scroll bleed em páginas longas — padrão em `body::before` (`position: fixed`, `z-index: -1`); **sem** `background-attachment` em `html`/`body` |
| Toast / banner PWA | Botão fechar com área de toque ≥ 44×44px |

## Desktop — regressão

- [`DashboardShell`](../app/(dashboard)/DashboardShell.tsx): `<main>` mantém `md:pb-0` (padding mobile só abaixo de `md`).
- Barras **não** alteradas neste trabalho: `BottomNav` (`fixed bottom-0 z-40`), wrapper PWA `z-[60]`.
- Páginas com `md:pb-8` na root (ex. vitrine, simulados) mantêm espaçamento desktop intencional.

## Automatizado (Jest)

- `__tests__/layout/mobileBottomNav.test.ts` — tokens ativos e `getDashboardPageBottomPadding`.
- `__tests__/layout/dashboardShellDesktopPadding.test.ts` — `MOBILE_MAIN_SCROLL_PADDING` no `<main>`; vitrine header único.
- `__tests__/layout/useBodyScrollLock.test.ts` — refcount de overlays empilhados.
- `__tests__/layout/useMobileSheetKeyboardInset.test.ts` — inset do teclado virtual.

## Comandos

```bash
npm test -- __tests__/layout/useBodyScrollLock.test.ts
npm test -- __tests__/layout/mobileBottomNav.test.ts __tests__/layout/dashboardShellDesktopPadding.test.ts
npm run build
rg "background-attachment" app/globals.css
```

`rg` deve retornar **zero** declarações CSS (comentário em `globals.css` é aceitável). `useBodyScrollLock` aplica `touch-action: none` no primeiro lock do body.
