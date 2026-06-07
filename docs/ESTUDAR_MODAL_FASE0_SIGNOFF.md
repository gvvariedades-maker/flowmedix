# Fase 0 — Sign-off modal `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1`

**Data:** 2026-06-05  
**Responsável:** Cursor Agent (Fase 0 ops)  
**Projeto Vercel:** `flowmedix` / `gvvariedades-makers-projects`

---

## 1. Staging — flag habilitada

Verificado via `vercel env ls`:

| Ambiente | Variável | Valor |
|----------|----------|-------|
| Preview | `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE` | `1` |
| Preview (`staging` branch) | `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE` | `1` (encrypted) |
| Production | `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE` | **habilitado neste sign-off** (ver §4) |

Preview URL staging: `https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app`

> **Nota:** E2E remoto contra preview exige sessão autenticada (sem `E2E_DASHBOARD_BYPASS` no deploy). `npm run test:e2e:modal:staging` redireciona para `/login` — comportamento documentado em [`MOBILE_BOTTOM_NAV_QA.md`](./MOBILE_BOTTOM_NAV_QA.md).

---

## 2. Correção bloqueante (intercept route)

Durante o gate local, a rota `@modal/(.)[slug]/page.tsx` estava **ausente** e havia pasta duplicada `(...)estudar/[slug]` inválida → 404 / `Invalid interception route` no dev.

**Correção aplicada:**

- Restaurado `app/(dashboard)/(authenticated)/estudar/@modal/(.)[slug]/page.tsx`
- Removido `(...)estudar/[slug]/page.tsx` duplicado

**Obrigatório:** merge + redeploy em Preview e Production **antes** de validar modal em produção.

---

## 3. Automatizado (local, 2026-06-05)

| Suíte | Comando | Resultado |
|-------|---------|-----------|
| Modal E2E | `npm run test:e2e:modal` | **6/6 OK** (Mobile Chrome, Pixel 5) |
| Vitrine paginação | `npm run test:e2e:vitrine-pagination` | **7/7 OK** |
| Jest modal | `npm test -- EstudarQuestaoModalRoute useEstudarModalActive useEstudarQuestaoShellState` | **17/17 OK** |
| Modal staging remoto | `npm run test:e2e:modal:staging` | **Bloqueado** — redirect `/login` (sem bypass no preview) |

---

## 4. Matriz M1–M13 (mobile 390×844)

Evidência principal: E2E local com flag + Jest. Itens sem spec dedicado marcados para validação visual pós-deploy.

| ID | Cenário | Evidência | OK |
|----|---------|-----------|-----|
| M1 | Abertura soft-nav | `estudar-modal.spec` — dialog sobre vitrine | OK |
| M2 | Sem tela morta na carga | `estudar-modal.spec` — skeleton/dialog &lt; 15s | OK |
| M3 | BottomNav isolado | `estudar-modal.spec` — `aria-hidden="true"` | OK |
| M4 | Focus trap | `EstudarQuestaoModalRoute.test.tsx` + handler Tab no componente | OK |
| M5 | Escape | `estudar-modal.spec` — fecha + vitrine reativa | OK |
| M6 | Backdrop | `estudar-modal.spec` — dismiss + cards clicáveis | OK |
| M7 | Botão Vitrine | `estudar-modal.spec` — preserva `banca` | OK |
| M8 | Próxima / Anterior | `estudar-nav.spec` — navegação sem stale | OK |
| M9 | Dots | `estudar-nav.spec` — dot questão 2 (com flag; revalidar pós-deploy) | OK* |
| M10 | Estudo reverso | Manual pós-deploy — ER z-index &gt; modal | Pendente manual |
| M11 | Menu hamburger | `DashboardShell` + `questaoModalOpen`; D7 drawer (requer flag no webServer) | OK* |
| M12 | Pós-dismiss | `estudar-modal.spec` — segunda abertura sem fantasma | OK |
| M13 | `page=2` | `estudar-nav.spec` API + `vitrine-pagination` Próxima→page=2 | OK* |

\*Revalidar no preview autenticado após redeploy com correção da rota `@modal`.

### Desktop (flag ligada)

| ID | Critério | OK |
|----|----------|-----|
| D1 | Sem overlay modal em ≥768px | OK (código: `md:hidden` no overlay) |
| D2 | prev/próxima sem regressão padding | OK (E2E inline + shell `md:pb-0`) |

---

## 5. Sign-off produção

Checklist [`MOBILE_BOTTOM_NAV_QA.md`](./MOBILE_BOTTOM_NAV_QA.md#sign-off-produção):

- [x] M1–M9, M11–M13 OK local (automatizado + código)
- [ ] M10 ER imersivo — validação manual pós-deploy
- [x] D1–D2 OK (código + E2E inline)
- [x] `npm run test:e2e:modal` verde (6/6)
- [x] `npm run test:e2e:vitrine-pagination` verde (7/7)
- [ ] `npm run test:e2e:modal:staging` — substituído por QA manual autenticado no preview
- [x] Correção `@modal/(.)[slug]` incluída no branch
- [x] `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1` adicionado em **Production** (Vercel)

**Próximo passo operacional:** deploy `main` → produção; smoke manual M10 em `www.avant.enf.br` (390×844).

Responsável: _______________  Data produção deploy: _______________
