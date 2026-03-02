# Sistema de Temas Únicos por Questão

## Problema Atual

O sistema atual pode gerar temas repetidos para questões diferentes:
- Questões com mesmo `subject` → mesmo tema
- Hash que resulta no mesmo índice → mesmo tema (hash % themes.length)

## Solução Proposta: Assinatura Visual Única

Cada questão terá uma **assinatura visual única** baseada em:
1. **Hash da questão completa** (garante unicidade)
2. **Variações sutis de cor** (baseadas no hash)
3. **Variações de glow e intensidade** (baseadas no hash)
4. **Rotação de gradientes** (baseadas no hash)

## Arquitetura

### 1. Geração de Hash Robusto
```typescript
// Hash baseado em: instruction + meta + modulo_slug
const questionHash = `${instruction}-${banca}-${ano}-${topico}-${subtopico}`;
```

### 2. Sistema de Variações
- **15 temas base** (existentes)
- **Variações de cor**: ±10% de saturação/luminosidade
- **Variações de glow**: Intensidade 0.3-0.6 baseada em hash
- **Rotação de gradiente**: Direção baseada em hash (0-360°)

### 3. Priorização
1. **questionHash completo** → Tema único garantido
2. **subject** → Tema semântico (fallback)
3. **meta.topico/subtopico** → Tema semântico (fallback)

## Implementação

### Função Principal
```typescript
export const getUniqueThemeForQuestion = (
  slide: any, 
  questionHash: string
): ThemeColors => {
  // 1. Gerar hash robusto da questão
  const robustHash = generateRobustHash(questionHash);
  
  // 2. Selecionar tema base (15 temas)
  const baseTheme = getThemeFromHash(robustHash);
  
  // 3. Aplicar variações únicas
  const variations = generateVariations(robustHash);
  
  // 4. Retornar tema único
  return applyVariations(baseTheme, variations);
};
```

### Variações Aplicadas
- **Cor primária**: Ajuste de saturação/luminosidade
- **Glow**: Intensidade única (0.3-0.6)
- **Gradiente**: Rotação única (0-360°)
- **Bordas**: Opacidade única (20-40%)

## Benefícios

✅ **Unicidade Garantida**: Cada questão tem visual único
✅ **Semântica Preservada**: Subject ainda influencia tema base
✅ **Performance**: Cálculo rápido, sem queries adicionais
✅ **Escalabilidade**: Funciona para milhares de questões

## Próximos Passos

1. Implementar `generateRobustHash()`
2. Implementar `generateVariations()`
3. Implementar `applyVariations()`
4. Atualizar `getThemeForSlide()` para usar novo sistema
5. Testar com múltiplas questões
