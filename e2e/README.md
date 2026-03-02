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
- `api-validation.spec.ts` - Testes de API
- `cache.spec.ts` - Testes de cache

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
