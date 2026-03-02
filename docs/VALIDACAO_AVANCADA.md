# Validação Avançada - Implementação Completa

## ✅ Implementações Realizadas

### 1. Validação em Rotas de API ✅

**Arquivo:** `app/api/validate-question/route.ts`

Nova rota de API para validação de questões:

- **POST `/api/validate-question`**: Valida uma questão completa
- **GET `/api/validate-question`**: Retorna informações sobre limites e regras

**Exemplo de uso:**
```typescript
const response = await fetch('/api/validate-question', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(questionData),
});

const result = await response.json();
if (result.valid) {
  // Questão válida
} else {
  // Exibir erros: result.errors
}
```

### 2. Testes Unitários ✅

**Arquivo:** `__tests__/validations.test.ts`

Testes completos para todos os schemas:

- ✅ Validação de questões completas
- ✅ Validação de cada tipo de slide
- ✅ Validação de limites de tamanho
- ✅ Validação de ícones Lucide
- ✅ Validação de múltiplos slides

**Executar testes:**
```bash
npm test
npm run test:watch
npm run test:coverage
```

### 3. Sanitização de HTML ✅

**Implementação:** `lib/validations.ts`

- Remove tags `<script>` e eventos perigosos (`onclick`, `onerror`, etc.)
- Remove protocolos `javascript:`
- Mantém apenas tags permitidas: `p`, `strong`, `em`, `u`, `br`, `span`, `div`, `ul`, `ol`, `li`
- Aplicado automaticamente em `text_fragment`

**Exemplo:**
```typescript
// Input perigoso
const html = '<p>Texto</p><script>alert("xss")</script>';

// Output sanitizado
const safe = sanitizeHTML(html); // '<p>Texto</p>'
```

### 4. Validação de Ícones Lucide ✅

**Implementação:** `lib/validations.ts`

Valida que ícones são nomes válidos de componentes Lucide React:

- ✅ Valida contra lista real de ícones disponíveis
- ✅ Mensagem de erro clara com exemplos
- ✅ Aplicado em `SlideItemSchema.icon` e `ConceptMapSlideSchema.concepts[].icon`

**Exemplo:**
```typescript
// ✅ Válido
{ icon: 'Sparkles' }
{ icon: 'Bolt' }
{ icon: 'Shield' }

// ❌ Inválido
{ icon: 'IconeInexistente' } // Erro: "Ícone deve ser um ícone Lucide válido"
```

### 5. Limites de Tamanho ✅

**Implementação:** `lib/validations.ts`

Limites rigorosos para todos os campos:

| Campo | Limite Máximo |
|-------|---------------|
| `instruction` | 2000 caracteres |
| `text_fragment` | 5000 caracteres |
| `content` (golden_rule, danger_zone) | 1000 caracteres |
| `footer_rule` | 500 caracteres |
| `label` | 200 caracteres |
| `detail` | 500 caracteres |
| `step` | 500 caracteres |
| `subject` | 100 caracteres |
| `topico` | 200 caracteres |
| `banca` | 50 caracteres |
| `orgao` | 200 caracteres |
| `prova` | 200 caracteres |

**Limites de Arrays:**
- `concept_map.items`: máximo 20 items
- `logic_flow.steps`: máximo 15 passos
- `danger_zone.items`: máximo 10 items
- `question_data.options`: máximo 10 alternativas

## 📋 Estrutura de Arquivos

```
AVANT/
├── lib/
│   └── validations.ts          # Schemas Zod + validações avançadas
├── app/
│   └── api/
│       └── validate-question/
│           └── route.ts        # Rota de API para validação
├── __tests__/
│   └── validations.test.ts     # Testes unitários
├── jest.config.js              # Configuração Jest
├── jest.setup.js               # Setup Jest
└── package.json                # Scripts de teste adicionados
```

## 🔧 Configuração

### Instalar Dependências

```bash
npm install --save-dev jest @types/jest jest-environment-jsdom
```

### Scripts Disponíveis

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## 📊 Exemplos de Validação

### Exemplo 1: Questão Válida

```json
{
  "meta": {
    "banca": "CPCON",
    "topico": "Língua Portuguesa"
  },
  "question_data": {
    "instruction": "Qual é a resposta?",
    "options": [
      { "id": "A", "text": "Opção A", "is_correct": true }
    ]
  },
  "reverse_study_slides": [
    {
      "type": "logic_flow",
      "steps": ["Passo 1", "Passo 2"]
    }
  ]
}
```

**Resultado:** ✅ Válido

### Exemplo 2: Questão com Erros

```json
{
  "meta": {
    "banca": "CPCON",
    "topico": "Língua Portuguesa"
  },
  "question_data": {
    "instruction": "Qual é a resposta?",
    "options": []
  },
  "reverse_study_slides": [
    {
      "type": "logic_flow",
      "steps": []
    }
  ]
}
```

**Resultado:** ❌ Erros:
- `question_data.options`: Deve ter pelo menos uma alternativa
- `reverse_study_slides[0].steps`: Logic flow deve ter pelo menos 1 passo

### Exemplo 3: HTML Sanitizado

```json
{
  "question_data": {
    "text_fragment": "<p>Texto</p><script>alert('xss')</script>"
  }
}
```

**Resultado:** ✅ HTML sanitizado automaticamente:
```json
{
  "text_fragment": "<p>Texto</p>"
}
```

## 🚀 Uso no Código

### No Laboratório (Frontend)

A validação já está integrada no `admin/laboratorio/page.tsx`:

```typescript
import { QuestaoCompletaSchema } from '@/lib/validations';

const validationResult = QuestaoCompletaSchema.safeParse(parsed);
if (!validationResult.success) {
  // Erros são exibidos na interface
}
```

### Em Rotas de API

```typescript
import { QuestaoCompletaSchema } from '@/lib/validations';

export async function POST(req: Request) {
  const body = await req.json();
  const result = QuestaoCompletaSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: result.error.errors },
      { status: 400 }
    );
  }
  
  // Processar dados validados
}
```

### Validação Programática

```typescript
import { validateSlide, validateSlides, LIMITS } from '@/lib/validations';

// Validar um slide
const result = validateSlide(slideData);

// Validar múltiplos slides
const slidesResult = validateSlides([slide1, slide2]);

// Acessar limites
console.log(LIMITS.INSTRUCTION_MAX); // 2000
```

## 🔒 Segurança

### Sanitização de HTML

- Remove scripts maliciosos
- Remove eventos JavaScript (`onclick`, `onerror`, etc.)
- Remove protocolos perigosos (`javascript:`)
- Mantém apenas tags seguras

### Validação de Entrada

- Todos os campos têm limites de tamanho
- Arrays têm limites máximos
- Tipos são validados rigorosamente
- Ícones são validados contra lista real

## 📈 Benefícios

1. ✅ **Segurança**: Sanitização automática de HTML
2. ✅ **Confiabilidade**: Validação rigorosa antes de salvar
3. ✅ **Performance**: Limites previnem dados excessivamente grandes
4. ✅ **Manutenibilidade**: Testes garantem qualidade
5. ✅ **UX**: Mensagens de erro claras e acionáveis

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar validação de imagens (se necessário)
- [ ] Validar URLs em links
- [ ] Adicionar validação de encoding UTF-8
- [ ] Criar dashboard de métricas de validação
- [ ] Adicionar validação de performance (tamanho total do JSON)
