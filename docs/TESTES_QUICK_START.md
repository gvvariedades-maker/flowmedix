# Testes - Guia Rápido

## 🚀 Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Instalar browsers do Playwright (primeira vez)
npx playwright install

# 3. Executar testes
npm run test:all
```

## 📝 Comandos Principais

### Testes Unitários

```bash
npm run test              # Executar todos
npm run test:watch        # Modo watch
npm run test:coverage     # Com cobertura
```

### Testes E2E

```bash
npm run test:e2e          # Executar todos
npm run test:e2e:ui       # Modo UI (recomendado!)
npm run test:e2e:headed   # Com navegador visível
npm run test:e2e:debug    # Modo debug
```

### Todos os Testes

```bash
npm run test:all          # Unitários + E2E
```

## 🎯 Modo UI (Recomendado)

```bash
npm run test:e2e:ui
```

Abre interface visual onde você pode:
- ✅ Ver testes em tempo real
- ✅ Debug passo a passo
- ✅ Ver screenshots e vídeos
- ✅ Re-executar testes específicos
- ✅ Time travel debugging

## 📊 Estrutura de Testes

```
e2e/                          # Testes E2E (Playwright)
  ├── laboratorio.spec.ts     # Laboratório admin
  ├── api-validation.spec.ts  # API de validação
  └── cache.spec.ts           # Sistema de cache

__tests__/                    # Testes unitários/integração
  ├── validations.test.ts     # Validação Zod
  ├── cache.test.ts          # Cache
  ├── templates.test.ts      # Templates
  └── api/                    # APIs
      └── validate-question.test.ts
```

## ✅ O Que Está Sendo Testado

### E2E
- ✅ Carregamento do laboratório
- ✅ Seleção de templates
- ✅ Validação em tempo real
- ✅ Preview de questões
- ✅ Export/Import
- ✅ APIs de validação
- ✅ Sistema de cache

### Integração
- ✅ Validação Zod
- ✅ Templates
- ✅ Cache functions
- ✅ Sanitização HTML

## 🔍 Debugging

### Ver Relatório HTML

```bash
npx playwright show-report
```

### Ver Screenshots de Falhas

```bash
# Screenshots em: test-results/
```

### Modo Debug Interativo

```bash
npm run test:e2e:debug
```

## 📚 Documentação Completa

Ver: `docs/TESTES_E2E.md`
