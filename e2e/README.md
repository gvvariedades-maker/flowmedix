# Testes E2E - Guia Rápido

## 🚀 Executar Testes

```bash
# Instalar browsers (primeira vez)
npx playwright install

# Executar todos os testes
npm run test:e2e

# Modo UI (recomendado para desenvolvimento)
npm run test:e2e:ui

# Com navegador visível
npm run test:e2e:headed

# Debug passo a passo
npm run test:e2e:debug
```

## 📝 Estrutura

- `laboratorio.spec.ts` - Testes do laboratório admin
- `simulados.spec.ts` - Fluxo aluno (setup → runner → resumo)
- `estudar-nav.spec.ts` - Vitrine → questão → próxima (query preservada); rota #5 imersiva (`npm run test:e2e:estudar-nav`)
- `estudar-modal.spec.ts` - Modal intercept (`npm run test:e2e:modal`, flag `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1`)
- `api-validation.spec.ts` - Testes de API
- `cache.spec.ts` - Testes de cache

## 🔐 Bypass admin (somente testes)

O Playwright injeta `E2E_ADMIN_BYPASS=true`, `E2E_DASHBOARD_BYPASS=true` e `NEXT_PUBLIC_E2E_DASHBOARD_BYPASS=true` no servidor via `webServer.env` (`playwright.config.ts`). Isso permite acessar `/admin/*` e rotas autenticadas do dashboard (ex.: `/estudar`, `/simulados`) nos E2E sem login. As variáveis `E2E_*` são **server-only**; `NEXT_PUBLIC_E2E_DASHBOARD_BYPASS` evita que `fetchWithAuth` trave em `getSession()` contra Supabase placeholder no CI. **Nunca configure em produção** (Vercel/deploy).

O spec `simulados.spec.ts` usa seed in-memory no servidor (`lib/e2e/simuladoSeed.ts`, ID fixo em `lib/e2e/constants.ts`) quando `E2E_DASHBOARD_BYPASS=true`.

O spec `estudar-nav.spec.ts` usa seed em `lib/e2e/estudarSeed.ts` (slugs `questao-e2e-estudar-1/2`).

## 🔧 Configuração

Ver `playwright.config.ts` para:
- Browsers testados
- Timeouts
- Screenshots/Videos
- Servidor de desenvolvimento

## 📊 Relatórios

Após executar:
- HTML Report: `npx playwright show-report`
- Screenshots: `test-results/`
- Videos: `test-results/`
