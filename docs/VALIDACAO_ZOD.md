# Validação Zod Rigorosa - AVANT

## Visão Geral

O AVANT agora possui validação Zod rigorosa para garantir que todos os JSONs de questões estejam no formato correto antes de serem salvos no banco de dados.

## Schemas Disponíveis

### Schemas de Slides

#### `ConceptMapSlideSchema`
Valida slides do tipo `concept_map`:
```typescript
{
  type: 'concept_map',
  subject?: string,
  meta?: { topico?: string, subtopico?: string },
  items: Array<{ label: string, detail?: string, icon?: string }>,
  footer_rule?: string
}
```

#### `LogicFlowSlideSchema`
Valida slides do tipo `logic_flow`:
```typescript
{
  type: 'logic_flow',
  subject?: string,
  meta?: { topico?: string, subtopico?: string },
  steps: string[], // Mínimo 1 passo
  footer_rule?: string
}
```

#### `GoldenRuleSlideSchema`
Valida slides do tipo `golden_rule`:
```typescript
{
  type: 'golden_rule',
  subject?: string,
  meta?: { topico?: string, subtopico?: string },
  content: string, // Obrigatório
  footer_rule?: string
}
```

#### `DangerZoneSlideSchema`
Valida slides do tipo `danger_zone`:
```typescript
{
  type: 'danger_zone',
  subject?: string,
  meta?: { topico?: string, subtopico?: string },
  content: string, // Obrigatório
  items?: Array<{ label: string, detail?: string }>,
  footer_rule?: string
}
```

### Schema Principal

#### `QuestaoCompletaSchema`
Valida a estrutura completa de uma questão:
```typescript
{
  id?: string,
  meta: {
    ano?: string,
    banca: string, // Obrigatório
    orgao?: string,
    prova?: string,
    topico: string, // Obrigatório
    subtopico?: string
  },
  question_data: {
    instruction: string, // Obrigatório
    text_fragment?: string,
    options: Array<{
      id: string,
      text: string,
      is_correct: boolean
    }> // Mínimo 1 alternativa
  },
  reverse_study_slides?: ReverseStudySlide[],
  study_slides?: ReverseStudySlide[]
}
```

## Uso

### No Laboratório (Admin)

A validação é executada automaticamente quando você cola um JSON:

```typescript
import { QuestaoCompletaSchema } from '@/lib/validations';

const validationResult = QuestaoCompletaSchema.safeParse(jsonData);

if (!validationResult.success) {
  // Erros formatados são exibidos na interface
  console.error(validationResult.error.errors);
}
```

### Validação Programática

```typescript
import { validateSlide, validateSlides } from '@/lib/validations';

// Validar um slide individual
const slideResult = validateSlide(slideData);
if (!slideResult.success) {
  console.error('Erros:', slideResult.error.errors);
}

// Validar múltiplos slides
const slidesResult = validateSlides([slide1, slide2, slide3]);
if (!slidesResult.valid) {
  slidesResult.errors.forEach(({ index, errors }) => {
    console.error(`Slide ${index}:`, errors);
  });
}
```

## Mensagens de Erro

A validação retorna mensagens de erro claras e específicas:

### Exemplo 1: Campo obrigatório faltando
```
Erros de validação:
meta.banca: Banca é obrigatória
question_data.instruction: Instrução é obrigatória
```

### Exemplo 2: Slide inválido
```
Erros de validação:
reverse_study_slides[0].steps: Logic flow deve ter pelo menos 1 passo
reverse_study_slides[1].content: Content é obrigatório para golden_rule
```

### Exemplo 3: Array vazio
```
Erros de validação:
question_data.options: Deve ter pelo menos uma alternativa
reverse_study_slides[0].items: Concept map deve ter pelo menos 1 item
```

## Compatibilidade

A validação suporta **ambos os formatos**:

1. **Formato Novo (Semântico)**: Validação rigorosa com campos específicos por tipo
2. **Formato Antigo (Legado)**: Validação flexível para manter compatibilidade

### Exemplo de Formato Novo (Validado)
```json
{
  "type": "logic_flow",
  "subject": "Orações subordinadas",
  "steps": ["passo 1", "passo 2"]
}
```

### Exemplo de Formato Antigo (Também Validado)
```json
{
  "layout_type": "logic_flow",
  "structure": {
    "steps": ["passo 1", "passo 2"]
  }
}
```

## Validações Específicas

### Por Tipo de Slide

| Tipo | Campos Obrigatórios | Validações Especiais |
|------|---------------------|----------------------|
| `concept_map` | `items` ou `concepts` | Mínimo 1 item |
| `logic_flow` | `steps` | Mínimo 1 passo, cada passo não pode ser vazio |
| `golden_rule` | `content` | Content não pode ser vazio |
| `danger_zone` | `content` | Content não pode ser vazio |
| `syllable_scanner` | `word` | Word não pode ser vazio |
| `versus_arena` | `concept_a`, `concept_b` | Ambos obrigatórios |

### Validações Globais

- `meta.banca`: Obrigatório, mínimo 1 caractere
- `meta.topico`: Obrigatório, mínimo 1 caractere
- `question_data.instruction`: Obrigatório, mínimo 1 caractere
- `question_data.options`: Mínimo 1 alternativa
- Cada alternativa deve ter `id`, `text` e `is_correct`

## Tratamento de Erros

### No Frontend (Laboratório)

Os erros são exibidos em tempo real enquanto você digita o JSON:

```typescript
// Erro formatado aparece na interface
setError(`Erros de validação:\n${errorMessages.join('\n')}`);
```

### Na API

Você pode usar a validação em rotas de API:

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
  const validData = result.data;
}
```

## Benefícios

1. ✅ **Prevenção de Erros**: Captura problemas antes de salvar no banco
2. ✅ **Feedback Claro**: Mensagens de erro específicas e acionáveis
3. ✅ **Type Safety**: TypeScript types gerados automaticamente
4. ✅ **Compatibilidade**: Suporta formato novo e antigo
5. ✅ **Manutenibilidade**: Schemas centralizados e reutilizáveis

## Próximos Passos

- [ ] Adicionar validação em rotas de API
- [ ] Criar testes unitários para cada schema
- [ ] Adicionar validação de HTML em `text_fragment`
- [ ] Validar tamanho máximo de strings
- [ ] Adicionar validação de ícones Lucide válidos
