# Testes E2E e Integração

## 📋 Visão Geral

Sistema completo de testes End-to-End (E2E) e de integração para garantir qualidade e confiabilidade do AVANT.

## 🎯 Estrutura de Testes

### 1. Testes Unitários (Jest)

**Localização:** `__tests__/`

- `validations.test.ts` - Validação Zod
- `cache.test.ts` - Sistema de cache
- `templates.test.ts` - Templates e geradores
- `api/validate-question.test.ts` - API de validação

**Executar:**
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### 2. Testes E2E (Playwright)

**Localização:** `e2e/`

- `laboratorio.spec.ts` - Fluxo completo do laboratório
- `api-validation.spec.ts` - Testes de API
- `cache.spec.ts` - Testes de cache

**Executar:**
```bash
npm run test:e2e
npm run test:e2e:ui      # Modo UI interativo
npm run test:e2e:headed # Com navegador visível
npm run test:e2e:debug  # Modo debug
```

### 3. Testes de Integração

**Localização:** `__tests__/api/`

- Testes de APIs Next.js
- Testes de cache
- Testes de templates

## 🚀 Como Executar

### Instalação

```bash
# Instalar dependências
npm install

# Instalar browsers do Playwright
npx playwright install
```

### Executar Todos os Testes

```bash
# Unitários + E2E
npm run test:all

# Apenas unitários
npm run test

# Apenas E2E
npm run test:e2e
```

### Modo Interativo (Playwright UI)

```bash
npm run test:e2e:ui
```

Abre interface visual para:
- Ver testes em tempo real
- Debug passo a passo
- Ver screenshots e vídeos
- Re-executar testes específicos

## 📊 Cobertura de Testes

### Fluxos Testados

#### Laboratório Admin
- ✅ Carregamento da página
- ✅ Abertura de templates
- ✅ Seleção de template
- ✅ Validação em tempo real
- ✅ Preview de questões
- ✅ Export/Import
- ✅ Highlight de erros

#### APIs
- ✅ Validação de questões
- ✅ Sanitização de HTML
- ✅ Rejeição de dados inválidos
- ✅ Metadata de validação

#### Cache
- ✅ Invalidação via API
- ✅ Status do endpoint
- ✅ Autenticação

## 🔧 Configuração

### Variáveis de Ambiente

```env
# URL base para testes E2E
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Secret para testes de cache
WEBHOOK_SECRET=test-secret
```

### Playwright Config

Arquivo: `playwright.config.ts`

- **Browsers:** Chromium, Firefox, WebKit
- **Mobile:** Chrome Mobile, Safari Mobile
- **Timeout:** 30s por teste
- **Retry:** 2x no CI
- **Screenshots:** Apenas em falhas
- **Videos:** Apenas em retry

## 📝 Escrevendo Testes

### Teste E2E Básico

```typescript
import { test, expect } from '@playwright/test';

test('deve fazer algo', async ({ page }) => {
  await page.goto('/admin/laboratorio');
  await expect(page.locator('text=AVANT')).toBeVisible();
});
```

### Teste de API

```typescript
test('deve validar questão', async ({ request }) => {
  const response = await request.post('/api/validate-question', {
    data: { /* ... */ },
  });
  
  expect(response.status()).toBe(200);
});
```

### Teste de Integração

```typescript
import { POST } from '@/app/api/validate-question/route';

it('deve validar questão', async () => {
  const request = new NextRequest(/* ... */);
  const response = await POST(request);
  expect(response.status).toBe(200);
});
```

## 🎯 Boas Práticas

### E2E Tests

1. ✅ **Isolar testes**: Cada teste deve ser independente
2. ✅ **Aguardar elementos**: Use `waitFor` quando necessário
3. ✅ **Timeouts adequados**: Não muito curtos, não muito longos
4. ✅ **Assertions claras**: Mensagens de erro descritivas
5. ✅ **Dados de teste**: Use fixtures ou factories

### Integration Tests

1. ✅ **Mock externos**: Supabase, APIs externas
2. ✅ **Testar contratos**: Validação de schemas
3. ✅ **Edge cases**: Valores limites, erros
4. ✅ **Cleanup**: Limpar dados após testes

## 🔍 Debugging

### Playwright UI Mode

```bash
npm run test:e2e:ui
```

- Visualiza testes em tempo real
- Debug passo a passo
- Inspect elementos
- Ver network requests

### Playwright Debug Mode

```bash
npm run test:e2e:debug
```

- Pausa em breakpoints
- Console interativo
- Step through

### Screenshots e Videos

Automáticos em falhas:
- Screenshots: `test-results/`
- Videos: `test-results/`
- Traces: `test-results/`

## 📈 CI/CD

### GitHub Actions

Arquivo: `.github/workflows/test.yml`

Executa:
1. Testes unitários
2. Testes E2E
3. Upload de coverage
4. Upload de relatórios

### Executar Localmente

```bash
# Simular CI
CI=true npm run test:all
```

## 🎯 Cobertura Alvo

| Tipo | Meta | Atual |
|------|------|-------|
| **Unitários** | > 70% | ⏳ |
| **E2E** | Fluxos críticos | ✅ |
| **Integração** | APIs principais | ✅ |

## 📚 Referências

- [Playwright Docs](https://playwright.dev)
- [Jest Docs](https://jestjs.io)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)
