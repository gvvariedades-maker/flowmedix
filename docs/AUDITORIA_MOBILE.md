# Auditoria Mobile AVANT

Auditoria profunda do funcionamento do AVANT no celular (rodar 100%, sem quebrar nem travar) e registro das correcoes aplicadas para prontidao de venda.

- Data: 2026-06-08
- Escopo: tudo que afeta o mobile — fluxo do aluno, prontidao de producao e admin/laboratorio.
- Metodo: leitura do codigo (3 frentes: player/slides, layout responsivo, performance/PWA/build) + remediacao em 5 fases.

## Veredito

A engenharia mobile do fluxo do aluno ja era deliberada e de boa qualidade (shell flex `100svh`, safe-area, modo imersivo, zoom de texto Model B, bottom nav inline, PWA com manifest + service worker + install prompt, E2E mobile real). Os bloqueadores reais estavam em observabilidade/estabilidade de producao, peso de bundle no caminho pago, alguns alvos de toque < 44px, contraste em tema escuro e o admin/Laboratorio desktop-only. Todos foram tratados nas fases abaixo.

---

## FASE 1 — Estabilidade e producao (P0)

| Achado | Risco | Correcao |
|--------|-------|----------|
| `app/global-error.tsx` inexistente | Crash no shell raiz = tela branca no celular | Criado [`app/global-error.tsx`](../app/global-error.tsx) com `html`/`body` proprios e estilos inline (globals.css nao carrega nesse fallback) |
| Copy "Nossa equipe foi notificada" em [`app/error.tsx`](../app/error.tsx) sem notificacao real | Promessa falsa ao usuario | Copy ajustada para "O erro foi registrado…" + reporte real conectado |
| Sem captura de crash client-side (apenas comentarios sobre Sentry em [`lib/logger.ts`](../lib/logger.ts)) | Impossivel diagnosticar travamentos em campo | Reporter vendor-neutral: [`lib/monitoring/reportClientError.ts`](../lib/monitoring/reportClientError.ts) + endpoint [`app/api/client-error/route.ts`](../app/api/client-error/route.ts) (loga server-side via `logger`) + [`components/monitoring/GlobalErrorListeners.tsx`](../components/monitoring/GlobalErrorListeners.tsx) (window.onerror/unhandledrejection) montado no layout raiz. Boundaries (`error.tsx`, `global-error.tsx`) tambem reportam. Seam pronto para plugar Sentry no route handler |
| PWA com unico icone 512px | Instalabilidade/qualidade do icone | [`app/manifest.ts`](../app/manifest.ts): adicionado SVG escalavel (`sizes: any`). Apple touch icon ja vem de `app/apple-icon.png` (convencao Next) |

Observacao: o reporter usa `sendBeacon`/`fetch keepalive` para a mesma origem — nenhuma mudanca de CSP foi necessaria (a CSP `connect-src 'self'` ja cobre). Para alertas em tempo real, basta encaminhar o payload para Sentry dentro do route handler (gated por env opcional).

---

## FASE 2 — UX mobile do aluno (P1)

| Achado | Arquivo | Correcao |
|--------|---------|----------|
| Portal do Estudo Reverso fullscreen `fixed top-0` sem safe-area | [`AvantLessonPlayer.tsx`](../components/lesson/AvantLessonPlayer.tsx) ~1769 | Padding-top do header agora inclui `env(safe-area-inset-top)` (notch), preservando o minimo de 12/24px |
| Alvos de toque < 44px | varios | Mapa de simulado 32→44px ([`SimuladoQuestionMap.tsx`](../components/simulados/SimuladoQuestionMap.tsx)); botao fechar modal cadernos 32→44px; acoes do plano diario 36→44px; toolbar simulado 40→44px ([`SimuladoRunnerClient.tsx`](../components/simulados/SimuladoRunnerClient.tsx)); tabs 36→44px ([`ui/tabs.tsx`](../components/ui/tabs.tsx)) |
| Chips/barra em tema claro sobre card escuro | [`PlanoDiarioTopicCard.tsx`](../components/dashboard/daily-plan/PlanoDiarioTopicCard.tsx) + [`topic-helpers.ts`](../components/dashboard/daily-plan/topic-helpers.ts) | Convertidos para tokens dark (`bg-*-500/10 text-*-200 border-*-500/30`); barra `bg-slate-100`→`bg-white/10` |
| Descricao do ConceptMap molecular so em hover (inacessivel no toque) | [`ConceptMap.tsx`](../components/slides/variants/ConceptMap.tsx) | Tooltip mantida no desktop; lista estatica de descricoes adicionada no mobile |
| Badge "VS" centralizado sobrepoe colunas empilhadas | [`VersusArena.tsx`](../components/slides/variants/VersusArena.tsx) | Clearance no mobile (`max-md:pb-16` / `max-md:pt-16`) ao redor do divisor |

---

## FASE 3 — Performance / anti-travamento (P1/P2)

| Achado | Correcao |
|--------|----------|
| Player (~2k linhas + framer-motion) importado estatico no caminho pago | `next/dynamic` (ssr:false, fallback skeleton) em [`EstudarQuestaoShell.tsx`](../components/lesson/EstudarQuestaoShell.tsx) e [`EstudarQuestaoModalRoute.tsx`](../components/estudar/EstudarQuestaoModalRoute.tsx) |
| 7 lotes de material importados de uma vez | Cada lote vira chunk lazy em [`materialSlideLots.tsx`](../components/material/materialSlideLots.tsx) |
| Sem `optimizePackageImports` | Adicionado em [`next.config.js`](../next.config.js) para `lucide-react`, `framer-motion`, `@radix-ui/react-tabs` |
| `@xyflow/react` so usado por tipos; CSS React Flow 280px morto | Tipos locais em [`types/flow.ts`](../types/flow.ts); dependencia removida (`npm install` sincronizou lockfile, 19 pacotes); CSS morto removido de [`globals.css`](../app/globals.css) |
| `filter: blur` na transicao do `golden_rule` (custoso em GPU mobile) | Removido o blur (mantido scale+opacity) em `getSlideVariants` |
| `DM_Sans` carregada 2x (layout raiz + landing) | Landing reaproveita `var(--font-body)`; peso 700 adicionado ao DM Sans raiz |

`logic_flow` em modo auto ja era gated por `prefersReducedMotion` (mostra todos os passos), entao foi mantido.

---

## FASE 4 — Admin / Laboratorio no celular (P2)

| Achado | Correcao |
|--------|----------|
| [`admin/laboratorio/page.tsx`](../app/(admin)/admin/laboratorio/page.tsx) `h-screen overflow-hidden` + `grid-cols-12` (desktop-only; preview clipado no mobile) | Layout empilha e rola no mobile (`flex-col` + alturas `max-lg:h-[60vh]`/`max-lg:h-[75vh]`); grid de altura fixa so em `lg+` |
| [`admin/layout.tsx`](../app/(admin)/layout.tsx) sem protecao de overflow | `overflow-x-hidden` para evitar scroll horizontal de tabelas largas |

---

## FASE 5 — Cobertura: loading, cross-browser, CI

| Achado | Correcao |
|--------|----------|
| Rotas sem `loading.tsx` (shell "congelado" em 4G) | Criados skeletons em cadernos, progresso, material, plano-diario e conta/assinatura |
| CSS `zoom` historicamente so WebKit/Blink | Fallback `transform: scale` com compensacao de altura, feature-detected (`CSS.supports('zoom')`) em [`ReadableTextZoom.tsx`](../components/accessibility/ReadableTextZoom.tsx); caminho comum inalterado |
| CI Playwright so desktop chromium | Projeto `Mobile Chrome` (Pixel 5) adicionado ao CI em [`playwright.config.ts`](../playwright.config.ts) |

---

## Validacao

- `tsc --noEmit`: sem erros em arquivos de codigo-fonte (erros remanescentes sao pre-existentes em `__tests__/`, `e2e/` e `scripts/`, fora do build de producao).
- Jest: layout/zoom (80 testes) e AvantLessonPlayer (16 testes) passando.
- Lint: sem erros nos arquivos alterados.

## Itens em aberto / proximos passos (opcionais)

- Plugar Sentry (ou equivalente) no endpoint `/api/client-error` para alertas em tempo real (seam pronto; precisa de DSN/conta).
- Considerar swipe entre slides (gap de UX, nao bloqueante).
- Web Vitals/RUM client-side se quiser metricas de campo continuas.
