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
- `api-validation.spec.ts` - Testes de API
- `cache.spec.ts` - Testes de cache

## 🔐 Bypass admin (somente testes)

O Playwright injeta `E2E_ADMIN_BYPASS=true` e `E2E_DASHBOARD_BYPASS=true` no servidor via `webServer.env` (`playwright.config.ts`). Isso permite acessar `/admin/*` e rotas autenticadas do dashboard (ex.: `/simulados`) nos E2E sem login. As variáveis são **server-only** e só ativam em desenvolvimento ou com `CI=true` — **nunca configure em produção** (Vercel/deploy).

O spec `simulados.spec.ts` usa seed in-memory no servidor (`lib/e2e/simuladoSeed.ts`, ID fixo em `lib/e2e/constants.ts`) quando `E2E_DASHBOARD_BYPASS=true`.

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
