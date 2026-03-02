# Sistema de Templates e Geradores

## 📋 Visão Geral

O sistema de templates do AVANT permite criar questões rapidamente usando modelos pré-configurados, reduzindo tempo de criação em até 90% e garantindo padronização.

## 🎯 Objetivos

- ✅ **Acelerar criação** de questões (10x mais rápido)
- ✅ **Reduzir erros** de validação
- ✅ **Padronizar formato** de questões
- ✅ **Facilitar reutilização** de estruturas

## 🚀 Funcionalidades

### 1. Biblioteca de Templates

Templates pré-configurados por categoria (foco: Técnico de Enfermagem):

- **Enfermagem**: Template completo com 4 slides (SAE, concept_map, logic_flow, golden_rule, danger_zone)
- **Legislação**: Template COFEN/COREN com concept_map e golden_rule
- **Matemática**: Template com logic_flow e golden_rule (cálculos/dosagens)

### 2. Seletor de Templates

Interface visual para:
- Buscar templates
- Filtrar por categoria
- Visualizar estrutura
- Aplicar template ao editor

### 3. Export/Import

- **Exportar**: Salvar questão como JSON
- **Importar**: Carregar questão de arquivo JSON
- **Validação**: Verificar formato antes de importar

## 📦 Como Usar

### Usar Template

1. Clique em **"Templates"** no laboratório admin
2. Escolha um template da lista
3. Clique em **"Usar Template"**
4. O JSON será preenchido automaticamente
5. Edite conforme necessário

### Exportar Questão

1. Valide sua questão (deve estar válida)
2. Clique em **"Exportar"**
3. Arquivo JSON será baixado automaticamente

### Importar Questão

1. Clique em **"Importar"**
2. Selecione arquivo JSON
3. Questão será carregada no editor

## 🎨 Templates Disponíveis

### Fundamentos de Enfermagem

**Estrutura:**
- 4 slides completos
- Concept Map (SAE, etapas do processo)
- Logic Flow com passos
- Golden Rule com regra principal
- Danger Zone (Diagnóstico Enfermagem vs Médico)

**Uso:** Questões de SAE, procedimentos, fundamentos, etc.

### Legislação em Enfermagem

**Estrutura:**
- Concept Map (Lei 7.498/86, COFEN, COREN)
- Golden Rule com atribuições do Técnico

**Uso:** Questões de Lei 7.498/86, COFEN, COREN, ética.

### Matemática - Básico

**Estrutura:**
- Logic Flow para resolução
- Golden Rule com fórmula/conceito

**Uso:** Questões de cálculos, dosagens, álgebra (conteúdo comum em concursos).

## 🔧 Criar Novo Template

### Via Código

1. Abra `lib/templates.ts`
2. Crie novo template seguindo estrutura:

```typescript
export const templateNovo: QuestaoCompleta = {
  meta: { /* ... */ },
  question_data: { /* ... */ },
  reverse_study_slides: [ /* ... */ ],
};

export const templates: Template[] = [
  // ... templates existentes
  {
    id: 'novo-template',
    name: 'Novo Template',
    description: 'Descrição',
    category: 'enfermagem',
    banca: 'EBSERH',
    template: templateNovo,
  },
];
```

### Via Interface (Futuro)

- Criar template a partir de questão existente
- Salvar template personalizado
- Compartilhar templates entre usuários

## 📊 Estrutura de Template

```typescript
interface Template {
  id: string;              // Identificador único
  name: string;            // Nome exibido
  description: string;     // Descrição
  category: string;        // Categoria (enfermagem, legislacao, matematica, etc.)
  banca: string;           // Banca padrão
  template: QuestaoCompleta; // Estrutura completa da questão
}
```

## 🔄 Funções Úteis

### Obter Template

```typescript
import { getTemplateById } from '@/lib/templates';

const template = getTemplateById('enfermagem-basico');
```

### Criar Questão do Template

```typescript
import { createQuestionFromTemplate } from '@/lib/templates';

const question = createQuestionFromTemplate('enfermagem-basico', {
  meta: {
    banca: 'FGV', // Sobrescreve banca do template
  },
});
```

### Filtrar Templates

```typescript
import { getTemplatesByCategory, getTemplatesByBanca } from '@/lib/templates';

const enfermagemTemplates = getTemplatesByCategory('enfermagem');
const ebserhTemplates = getTemplatesByBanca('EBSERH');
```

## 📁 Export/Import

### Exportar

```typescript
import { exportQuestion } from '@/lib/questionExporter';

exportQuestion(question, 'minha-questao.json');
```

### Importar

```typescript
import { importQuestion } from '@/lib/questionExporter';

const question = await importQuestion(file);
```

## 🎯 Boas Práticas

### Ao Criar Template

1. ✅ Use estrutura completa (meta, question_data, slides)
2. ✅ Inclua exemplos realistas
3. ✅ Documente propósito do template
4. ✅ Teste validação antes de adicionar

### Ao Usar Template

1. ✅ Revise todos os campos
2. ✅ Personalize conteúdo específico
3. ✅ Valide antes de publicar
4. ✅ Exporte para backup

## 🔮 Melhorias Futuras

- [ ] Editor visual de templates
- [ ] Templates por banca específica
- [ ] Biblioteca compartilhada de templates
- [ ] Versões de templates
- [ ] Estatísticas de uso de templates
- [ ] Sugestão automática de template baseado em conteúdo

## 📚 Referências

- [Formato JSON Semântico](./JSON_FORMAT_SEMANTICO.md)
- [Validação Zod](./VALIDACAO_ZOD.md)
- [Laboratório Admin](../app/(admin)/admin/laboratorio/page.tsx)
