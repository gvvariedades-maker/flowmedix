# Sign-off — `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1` (Fase 0)

Registro de gates automatizados e status da matriz manual **M1–M13** / **D1–D2**.

**Data do gate:** 2026-06-05  
**Preview/staging:** `flowmedix-git-staging-gvvariedades-makers-projects.vercel.app`

---

## 1. Vercel — variável habilitada

Confirmado via `vercel env ls`:

| Ambiente | `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE` |
|----------|-----------------------------------|
| Preview (global) | `1` |
| Preview (`staging` branch) | configurado (encrypted) |

**Production:** não habilitado (correto — aguarda sign-off manual).

---

## 2. Jest (regressão modal + hook imersivo)

```bash
npm test -- __tests__/components/estudar/EstudarQuestaoModalRoute.test.tsx
npm test -- __tests__/components/lesson/useEstudarQuestaoShellState.test.tsx
npm test -- __tests__/components/estudar/useEstudarModalActive.test.tsx
npm test -- __tests__/layout/useEstudarQuestaoImmersive.test.ts
npm test -- __tests__/components/lesson/AvantLessonPlayer.navigation.test.tsx
```

**Resultado:** 26 testes passando (5 suites).

---

## 3. E2E modal

| Comando | Resultado | Notas |
|---------|-----------|-------|
| `npm run test:e2e:modal` (local) | Parcial | Questão carrega; `role="dialog"` não aparece — log dev: `Invalid interception route` em `(.)[slug]` (Next 16 / Windows). Requer QA manual em preview ou fix de rota intercept. |
| `npm run test:e2e:modal:staging` | Bloqueado | Preview sem `E2E_DASHBOARD_BYPASS`; seed `Urgências e Emergências E2E` inexistente. Esperado: matriz **M1–M13** manual com sessão real (ver `MOBILE_BOTTOM_NAV_QA.md`). |

**Cobertura E2E local quando intercept funcionar:** M1, M3, M5, M6, M7, M12 (spec `e2e/estudar-modal.spec.ts`).

---

## 4. Matriz manual M1–M13 (390×844)

Preencher em preview com flag ligada. Automatizado não substitui esta etapa.

| ID | Status | Responsável | Data |
|----|--------|-------------|------|
| M1 | Pendente QA manual | | |
| M2 | Pendente QA manual | | |
| M3 | Pendente QA manual | | |
| M4 | Pendente QA manual | | |
| M5 | Pendente QA manual | | |
| M6 | Pendente QA manual | | |
| M7 | Pendente QA manual | | |
| M8 | Pendente QA manual | | |
| M9 | Pendente QA manual | | |
| M10 | Pendente QA manual | | |
| M11 | Pendente QA manual | | |
| M12 | Pendente QA manual | | |
| M13 | Pendente QA manual | | |
| D1 | Pendente QA manual | | |
| D2 | Pendente QA manual | | |

---

## 5. Sign-off produção

**Não habilitar** `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1` em Production até:

- [ ] M1–M13 e D1–D2 OK no preview staging
- [ ] `npm run test:e2e:vitrine-pagination:staging` verde
- [ ] Rotas #1–#8 de `MOBILE_BOTTOM_NAV_QA.md` revalidadas
- [ ] Nenhum bug P0 em navegação estudar / modal

Responsável: _______________  Data: _______________
