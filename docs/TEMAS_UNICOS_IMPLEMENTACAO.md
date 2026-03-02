# Sistema de Temas Únicos por Questão - Implementação

## Visão Geral

Sistema implementado para garantir que **cada questão tenha slides exclusivos visualmente**, sem repetição de temas entre questões diferentes.

## Como Funciona

### 1. Geração de Hash Robusto

O hash da questão agora combina múltiplos fatores:
```typescript
questionHash = [
  instruction,
  banca,
  ano,
  topico,
  subtopico,
  modulo_slug
].join('-')
```

Isso garante que questões diferentes tenham hashes diferentes, mesmo que compartilhem alguns atributos.

### 2. Sistema de Variações Únicas (INTENSIDADE AUMENTADA)

Cada questão recebe variações perceptíveis baseadas no hash:
- **Glow Intensity**: 0.25 - 0.75 (variação de 0.5, aumentado de 0.3-0.6)
- **Border Opacity**: 15-50% (variação de 35%, aumentado de 20-40%)
- **Gradient Opacity**: Variação relacionada para maior diferenciação visual
- **Hash único**: Combina questionHash + slideIndex + slideType

### 3. Priorização Inteligente

1. **Subject** → Tema semântico + variações únicas
2. **Meta.topico/subtopico** → Tema semântico + variações únicas
3. **QuestionHash** → Tema único garantido + variações únicas

## Garantias de Unicidade

### Por Questão
- Hash único baseado em múltiplos fatores da questão
- Variações aplicadas garantem diferença visual

### Por Slide
- Cada slide dentro da mesma questão tem variações diferentes
- `slideIndex` é incluído no hash para garantir unicidade

### Por Tipo de Slide
- `slideType` também influencia o hash
- Mesmo tipo de slide em questões diferentes = visual diferente

## Exemplo

**Questão A:**
- Hash: `"instrução-1-CPCON-2024-Português-Sintaxe-slug-1"`
- Slide 0 (logic_flow): Tema indigo + glow 0.58 + border 42%
- Slide 1 (concept_map): Tema indigo + glow 0.65 + border 28%

**Questão B:**
- Hash: `"instrução-2-CPCON-2024-Português-Sintaxe-slug-2"`
- Slide 0 (logic_flow): Tema indigo + glow 0.32 + border 48%
- Slide 1 (concept_map): Tema indigo + glow 0.41 + border 19%

Mesmo tema base (indigo), mas **variações perceptíveis** garantem visual único e facilmente distinguível!

## Benefícios

✅ **Unicidade Garantida**: Cada questão tem assinatura visual única
✅ **Semântica Preservada**: Subject ainda influencia tema base
✅ **Performance**: Cálculo rápido, sem queries adicionais
✅ **Escalabilidade**: Funciona para milhares de questões
✅ **Consistência**: Mesma questão sempre tem mesmo visual

## Teste

1. Crie 2 questões diferentes com mesmo `subject`
2. Compare os slides de cada questão
3. **Resultado Esperado**: Visual diferente (glow, border opacity diferentes)

## Próximas Melhorias

- [ ] Variações de gradiente (rotação)
- [ ] Variações de saturação/brightness (se necessário)
- [ ] Cache de temas calculados (otimização)
