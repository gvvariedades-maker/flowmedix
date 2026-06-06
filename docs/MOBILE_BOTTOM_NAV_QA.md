# QA — clearance inferior mobile (BottomNav + faixas fixas)

Checklist manual obrigatório após mudanças em `lib/layout/mobileBottomNav.ts`, `DashboardShell` ou padding de páginas.

**Viewport:** 390×844 (ou iPhone 14), safe area simulada no DevTools.  
**Desktop:** largura ≥ `md` (768px) — confirmar que barras fixas e `md:pb-0` do shell não regrediram.

---

## Fase 5 — Rollout modal (`NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1`)

Gate obrigatório **antes** de habilitar a flag em **Production**. Staging/Preview deve validar primeiro.

### Habilitar em staging (Vercel)

1. **Vercel → Settings → Environment Variables**
   - Nome: `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE`
   - Valor: `1`
   - Ambientes: **Preview** (e opcionalmente um branch dedicado `staging`) — **não** Production até o sign-off abaixo.
2. Redeploy do preview após salvar (variável `NEXT_PUBLIC_*` é embutida no build).
3. Copiar baseline local: `copy .env.staging.example .env.staging.local` e preencher `PERF_BASE_URL` / `NEXT_PUBLIC_APP_URL` com a URL do preview.
4. Confirmar no browser (mobile): abrir questão na vitrine → sheet sobre a vitrine (não página cheia sem sidebar de contexto).

### Automatizado (staging / local)

```bash
# Local — sobe dev com flag via webServer do Playwright
npm run test:e2e:modal

# Preview Vercel (flag já no deploy + .env.staging.local com PERF_BASE_URL)
npm run test:e2e:modal:staging
```

Jest (regressão Fase 1.3 — sem dead zone):

```bash
npm test -- __tests__/components/estudar/EstudarQuestaoModalRoute.test.tsx
npm test -- __tests__/components/lesson/useEstudarQuestaoShellState.test.tsx
npm test -- __tests__/components/estudar/useEstudarModalActive.test.tsx
```

### Matriz manual — modal intercept (mobile)

Preencher em staging com viewport 390×844. Marcar **OK** / **Falha** / **N/A**.

| ID | Cenário | Passos | Critério de aceite | OK |
|----|---------|--------|-------------------|-----|
| M1 | Abertura soft-nav | Vitrine filtrada → «Entrar no assunto» | Dialog `role="dialog"` visível; questão no painel inferior; URL `/estudar/[slug]` com query preservada | |
| M2 | Sem tela morta na carga | Repetir M1 em rede lenta (DevTools 3G) ou cold open | Skeleton ou dialog visível em &lt; 1 s; vitrine **não** fica clicável por baixo durante carga (`pointer-events-none` no slot) | |
| M3 | BottomNav isolado | Com modal aberto | `nav[aria-label="Navegação rápida"]` **ausente** (immersive) ou `aria-hidden="true"`; links do nav não recebem foco via Tab | |
| M4 | Focus trap | Tab / Shift+Tab no player | Foco circula dentro do painel do modal; não «vaza» para vitrine nem BottomNav | |
| M5 | Escape | `Escape` com modal aberto | Modal fecha; URL volta à vitrine; `[data-vitrine-slot-ready="true"]`; cards clicáveis sem F5 | |
| M6 | Backdrop | Toque na **faixa escurecida** acima do sheet (pode ser estreita em telas baixas — painel `flex-1`) | Mesmo resultado que M5; handler `Fechar questão` dispara dismiss | |
| M7 | Botão Vitrine | «Vitrine» no player | Fecha modal; `page` e filtros (`banca`, `assunto`) preservados na URL | |
| M8 | Próxima / Anterior | Navegar entre questões no modal | Botões nunca presos em «Carregando...» / «Sincronizando...» &gt; 3 s; conteúdo atualiza no mesmo overlay | |
| M9 | Dots | Clicar dot não adjacente | Troca de questão no modal; query da vitrine intacta | |
| M10 | Estudo reverso | Gabarito → Ativar estudo → slides → Marcar estudado | ER imersivo acima do modal (`z` ER &gt; modal); ao fechar ER, player no modal ainda funcional | |
| M11 | Menu hamburger | Com modal aberto, tocar Menu | Menu **não** abre por cima do modal (drawer bloqueado quando `questaoModalOpen`) | |
| M12 | Pós-dismiss | Após M5/M6/M7, abrir outra questão | Segunda abertura sem overlay fantasma nem vitrine `hidden` permanente | |
| M13 | `page=2` | Vitrine `?page=2` → questão → Vitrine | Retorno na mesma página da vitrine; barra sticky ainda visível; Próxima/Anterior funcionam; próxima questão mantém `page=2` | |

### Matriz manual — desktop (flag ligada)

| ID | Cenário | Critério de aceite | OK |
|----|---------|-------------------|-----|
| D1 | Vitrine → questão em ≥ 768px | **Sem** overlay modal; player no shell ao lado da sidebar (`md:hidden` no overlay) | |
| D2 | Navegação prev/próxima | Paridade com fluxo pré-flag (sem regressão de padding `md:pb-0`) | |

### Sign-off staging (antes de Production)

Checklist após deploy preview com paginação sticky + `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1`:

1. **Automatizado local (obrigatório em CI/dev):** `npm run test:e2e:vitrine-pagination` — 4 testes Pixel 5 (sticky, nav, `page=2`, último card).
2. **Preview Vercel:** matriz **M1–M13** + rota **#4** manual (390×844) — E2E remoto exige sessão autenticada (sem `E2E_DASHBOARD_BYPASS` no preview).
3. **Modal staging (se flag ligada):** `npm run test:e2e:modal:staging` + Jest em `EstudarQuestaoModalRoute` / `useEstudarModalActive`.
4. **Desktop:** **D1–D2** (sem overlay modal em ≥768px).

### Sign-off produção

Só habilitar `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1` em **Production** quando:

- [ ] Todos os itens **M1–M13** OK em staging (ou preview dedicado).
- [ ] **D1–D2** OK em desktop no mesmo deploy.
- [ ] `npm run test:e2e:modal:staging` verde contra o preview.
- [ ] Rotas **#1–#8** da seção abaixo revalidadas com a flag ligada (regressão BottomNav).
- [ ] Rota **#4** (`/estudar`): paginação sticky + último card acima do nav validados (`npm run test:e2e:vitrine-pagination:staging`).
- [ ] `npm run test:e2e:vitrine-pagination:staging` verde contra o preview (mobile Pixel 5).
- [ ] Nenhum bug P0 aberto em navegação estudar / modal.

Responsável: _______________  Data: _______________

---

## Rotas (8)

| # | Rota | O que verificar |
|---|------|-----------------|
| 1 | `/simulados` | Botão final do formulário visível acima do BottomNav; com banner PWA aberto, submit ainda rolável |
| 2 | `/simulados/[id]` | Confirmar / próxima; link «Sair e voltar» acima da faixa de ação + nav |
| 3 | `/simulados/[id]` (resumo) | Três CTAs inferiores sem corte |
| 4 | `/estudar` | Último card da lista rolável até acima do BottomNav (padding `pb-vitrine-sticky-pagination` na grade); **paginação sticky** Anterior/Próxima sempre visível acima do nav quando `totalPaginas > 1` (`VitrinePaginationBar` variant sticky); paginação inline só em `md+`; filtros Banca/Assunto com sheet + teclado iOS não cobre «Fechar»; **modal questão aberto:** Tab não alcança vitrine nem BottomNav; foco permanece no sheet/player (`EstudarQuestaoModalRoute`); Escape fecha; **`page=2`** preservado ao abrir/voltar da questão; opt-in `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1` em staging antes de produção |
| 5 | `/estudar/[slug]` | **Imersivo mobile** (`useEstudarQuestaoImmersive`): header global + BottomNav ocultos; última alternativa + **Confirmar Resposta** visível sem cobertura inferior; toolbar **A+/A−** no player; ER fullscreen colado ao rodapé (`bottom-0`); voltar à vitrine restaura header + nav. Automatizado: `npm run test:e2e:estudar-nav` (describe «immersive inline mobile») |
| 6 | `/plano-diario` | Card sticky de lembrete acima do BottomNav; lista rolável até o fim |
| 7 | `/cadernos` | Sheet «Inserir questões» com busca — teclado iOS não cobre conteúdo; botão fechar ≥ 44px |
| 8 | Banner PWA | Com painel «Instale o AVANT» visível: rotas longas do dashboard — conteúdo final acima do banner (`MOBILE_PAGE_PWA_BANNER_PADDING` via `useDashboardBottomInset` / `DashboardMobilePage`; nav já reservado em `MOBILE_MAIN_SCROLL_PADDING` no shell) |

## Mobile — sheets e acordeões

| Item | O que verificar |
|------|-----------------|
| Filtros vitrine (Banca/Assunto) | Itens da lista ≥ 44px; busca com teclado aberto — footer «Fechar» acessível |
| Paginação vitrine (mobile) | Barra sticky Anterior/Próxima acima do BottomNav; botões ≥ 44px; `?page=N` na URL; último card da página rolável sem corte pelo nav |
| Acordeão assunto | Expandir/colapsar assunto e lista de questões sem jank perceptível (Safari iOS) |
| `DashboardFilterSelect` / `MultiCheckboxFilter` | Paridade: fechar 44px, body lock, teclado iOS |
| Reporte de erro | Painel com `pb-safe`; botão fechar ≥ 44px |
| Modal questão (`/estudar` overlay) | Vitrine com `hidden` + `aria-hidden`; BottomNav com `aria-hidden` e tab bloqueado; focus trap no painel do sheet (não no `<main>` — modal renderiza dentro do main); **após dismiss** (backdrop, Escape ou voltar): vitrine interativa — `[data-vitrine-slot-ready="true"]` no slot da vitrine; cards clicáveis sem F5 |
| Alternativas no player | Toque sem scale «grudado» após soltar (sem `whileHover`; `active:scale` + `whileTap`) |
| Fundo global iOS | Listras diagonais sem scroll bleed em páginas longas — padrão em `body::before` (`position: fixed`, `z-index: -1`); **sem** `background-attachment` em `html`/`body` |
| Toast / banner PWA | Botão fechar com área de toque ≥ 44×44px |

## Desktop — regressão

- [`DashboardShell`](../app/(dashboard)/DashboardShell.tsx): `<main>` mantém `md:pb-0` (padding mobile só abaixo de `md`).
- Barras **não** alteradas neste trabalho: `BottomNav` (`fixed bottom-0 z-40`), wrapper PWA `z-[60]`.
- Páginas com `md:pb-8` na root (ex. vitrine, simulados) mantêm espaçamento desktop intencional.

## Drawer mobile (Mais)

Checklist manual após mudanças em `DashboardShell`, `MobileDashboardDrawer`, `BottomNav` ou `PlanStatusCard` no drawer.

**Viewport:** 390×844, safe area simulada no DevTools.

### Matriz manual — drawer (mobile)

| ID | Cenário | Passos | Critério de aceite | OK |
|----|---------|--------|-------------------|-----|
| D1 | Abertura | `/estudar` → **Mais** | `#dashboard-mobile-drawer` visível; ícone X no nav | |
| D2 | Toggle fecha | Com drawer aberto → **Mais** (X) | Drawer ausente; ícone hamburger | |
| D3 | Overlay | Toque na área escurecida à direita do painel | Drawer fecha | |
| D4 | Escape | `Escape` com drawer aberto | Drawer fecha | |
| D5 | Navegação | Link «Como usar (tutorial)» | Navega para `/ajuda`; drawer fecha | |
| D6 | Scroll lock | Com drawer aberto, tentar rolar vitrine | `main` não incrementa `scrollTop`; body sem scroll | |
| D7 | Modal questão | Com modal aberto (`NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1`) → **Mais** | Drawer **não** abre | |
| D8 | Foco | Fechar drawer (Escape ou overlay) | Foco no botão **Mais** (`Abrir menu`) | |
| D9 | Nav inerte | `/plano-diario` ou `/ajuda` → **Mais** → tocar **Estudar** no BottomNav | URL inalterada; drawer continua aberto; links com `aria-hidden` (nav sem `aria-hidden` — **Mais** ainda no SR). E2E automatizado usa `/ajuda` ( `/plano-diario` exige login). | |
| D10 | Mais ativo | `/plano-diario` ou `/ajuda` (drawer fechado) | Botão **Mais** com `aria-current="page"` e label cyan (`text-[#00f2ff]`). E2E automatizado usa `/ajuda`. | |

Rotas mínimas pós-deploy: `/estudar`, `/cadernos`, `/simulados`, `/plano-diario`, `/conta/assinatura` (via link do drawer). Confirmar **D10** também em `/ajuda`, `/material` e `/conta/assinatura` (rotas exclusivas do drawer).

### Automatizado (drawer)

```bash
npm test -- __tests__/layout/dashboardShellMobileDrawer.test.ts
npm run test:e2e:drawer
```

- [`e2e/mobile-drawer.spec.ts`](../e2e/mobile-drawer.spec.ts) — matriz D1–D10 (D7 skip sem flag modal).
- D7 compartilha staging com modal: `npm run test:e2e:modal:staging` quando flag ligada.

---

## Automatizado (Jest)

- `__tests__/layout/bottomNavActive.test.ts` — matriz de rotas ativas (links + **Mais**).
- `__tests__/layout/bottomNav.test.ts` — indicador abaixo do label, inércia com drawer/welcome, `aria-label`, props no shell.
- `__tests__/layout/useBottomNavHeightSync.test.ts` — `--bottom-nav-height` via `ResizeObserver`.
- `__tests__/layout/mobileBottomNav.test.ts` — tokens ativos e `getDashboardPageBottomPadding`.
- `__tests__/layout/dashboardShellDesktopPadding.test.ts` — `MOBILE_MAIN_SCROLL_PADDING` no `<main>`; vitrine header único.
- `__tests__/layout/dashboardShellMobileDrawer.test.ts` — toggle, scroll lock, portal, welcome, aria-hidden, focusable util.
- `__tests__/layout/useBodyScrollLock.test.ts` — refcount de overlays empilhados (drawer + modal empilhados).
- `__tests__/layout/useMobileSheetKeyboardInset.test.ts` — inset do teclado virtual.
- `__tests__/lib/vitrine/paridadeNav.test.ts` — ordem de slugs vitrine ↔ player.
- `__tests__/lib/estudar/questaoPlayerPayload.test.ts` — `anteriorSlug` / `proximaSlug` por índice na lista.
- `__tests__/components/lesson/AvantLessonPlayer.navigation.test.tsx` — `payloadStale` bloqueia dots e Próxima; barra inline expõe `aria-label` Anterior/Próxima.
- `__tests__/layout/useEstudarQuestaoImmersive.test.ts` — pathname `/estudar` vs `/estudar/[slug]`, desktop off.

### Matriz manual — questão inline imersiva (rota #5, 390×844)

Preencher após Fase 1 (flag modal **off** ou navegação direta `/estudar/[slug]`). Automatizado parcial em `e2e/estudar-nav.spec.ts`.

| ID | Cenário | Critério de aceite | Automatizado | OK |
|----|---------|-------------------|--------------|-----|
| I5-1 | Shell imersivo | Header «AVANT» e BottomNav ausentes na questão | `estudar-nav` — oculta header e nav | |
| I5-2 | Confirmar visível | Scroll até última alternativa; **Confirmar Resposta** ≥ 44px e acima do rodapé do player | `estudar-nav` — confirmar no viewport | |
| I5-3 | Zoom mobile | Botões **Aumentar texto** / **Diminuir texto** no header do player | `estudar-nav` + Jest `readableTextZoom` | |
| I5-4 | Estudo reverso | Gabarito → Ativar ER → painel fullscreen sem faixa inferior (nav off) | `estudar-nav` — ER ancorado ao rodapé | |
| I5-5 | Retorno vitrine | «Vitrine» → header + BottomNav visíveis; lista clicável | `estudar-nav` — restaura shell | |

## Comandos

```bash
npm test -- __tests__/layout/bottomNavActive.test.ts __tests__/layout/bottomNav.test.ts __tests__/layout/useBottomNavHeightSync.test.ts
npm test -- __tests__/layout/useBodyScrollLock.test.ts
npm test -- __tests__/layout/mobileBottomNav.test.ts __tests__/layout/dashboardShellDesktopPadding.test.ts
npm test -- __tests__/layout/useEstudarQuestaoImmersive.test.ts __tests__/components/lesson/AvantLessonPlayer.navigation.test.tsx
npm run test:e2e:estudar-nav
npm run test:e2e:modal
npm run test:e2e:drawer
npm run test:e2e:vitrine-pagination
npm test -- readableTextZoom
npm run build
rg "background-attachment" app/globals.css
```

`rg` deve retornar **zero** declarações CSS (comentário em `globals.css` é aceitável). `useBodyScrollLock` aplica `touch-action: none` no primeiro lock do body.

## Automatizado (E2E estudar-nav)

- [`e2e/estudar-nav.spec.ts`](../e2e/estudar-nav.spec.ts) — vitrine → questão → próxima/anterior; dots; `page=2`; **rota #5 imersiva** (Pixel 5).
- Local: `npm run test:e2e:estudar-nav`
- Staging: `npm run test:e2e:estudar-nav:staging`

## Automatizado (E2E modal)

- [`e2e/estudar-modal.spec.ts`](../e2e/estudar-modal.spec.ts) — Escape, backdrop, BottomNav `aria-hidden`, vitrine reativa, anti dead-zone, **M8** Anterior/Próxima inline.
- Requer `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1` (script `npm run test:e2e:modal` injeta no webServer local).

## Automatizado (E2E vitrine paginação)

- [`e2e/vitrine-pagination.spec.ts`](../e2e/vitrine-pagination.spec.ts) — barra sticky acima do BottomNav, navegação `?page=2`, último card não sob o nav (viewport Pixel 5).
- Local: `npm run test:e2e:vitrine-pagination`
- Staging/preview: `npm run test:e2e:vitrine-pagination:staging` (`.env.staging.local` com `PERF_BASE_URL` + `VERCEL_PROTECTION_BYPASS` quando aplicável).
- **Preview autenticado:** o deploy staging **não** usa `E2E_DASHBOARD_BYPASS` — o spec redireciona para `/login` sem sessão. Rodar contra preview exige login Playwright (cookies) **ou** validar rota **#4** / **M13** manualmente em 390×844 após deploy com paginação sticky. Local/CI (`npm run test:e2e:vitrine-pagination`) cobre regressão automatizada.
- Cobertura parcial da rota **#4** e critério **M13** (retorno `page=2` — complementar com matriz manual modal).
