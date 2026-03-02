# Preview em Tempo Real Melhorado

## 📋 Visão Geral

Sistema de preview avançado que permite visualizar questões antes de publicar, com simulação de interações do usuário e visualização responsiva.

## 🎯 Funcionalidades

### 1. Visualização Responsiva

- **Desktop**: Preview em tamanho completo
- **Mobile**: Preview em dimensões de smartphone (375x667px)
- **Toggle rápido** entre modos

### 2. Controles de Estado

- **Pergunta**: Visualiza a questão inicial
- **Gabarito**: Visualiza após resposta
- **Estudo**: Visualiza slides de estudo reverso
- **Navegação** entre estados

### 3. Navegação de Slides

- **Controles** para avançar/retroceder slides
- **Indicador** de progresso (X / Total)
- **Barra de progresso** visual
- **Navegação rápida** entre slides

### 4. Simulação de Interações

- **Simular resposta**: Clicar em alternativas
- **Auto-play**: Simulação automática do fluxo
- **Reset**: Voltar ao estado inicial

### 5. Controles Avançados

- **Fullscreen**: Visualização em tela cheia
- **Auto-play**: Reprodução automática
- **Reset**: Reiniciar preview
- **View Mode**: Alternar desktop/mobile

## 🚀 Como Usar

### Visualizar Preview

1. Cole um JSON válido no editor
2. O preview é atualizado automaticamente
3. Use os controles para navegar

### Simular Resposta

1. No estado "Pergunta", clique em uma alternativa
2. O preview muda para "Gabarito" automaticamente
3. Depois pode avançar para "Estudo"

### Navegar Slides

1. No estado "Estudo", use as setas para navegar
2. Ou clique nos botões de estado para pular etapas
3. Veja o progresso na barra superior

### Auto-play

1. Clique no botão de play
2. O preview simula automaticamente:
   - Seleciona primeira alternativa
   - Mostra gabarito
   - Avança para estudo
3. Clique em pause para parar

## 🎨 Interface

### Header

- **Título**: "Preview em Tempo Real"
- **View Mode**: Toggle Desktop/Mobile
- **Auto-play**: Play/Pause
- **Reset**: Reiniciar
- **Fullscreen**: Expandir

### Barra de Estado

- **Botões de Estado**: Pergunta, Gabarito, Estudo
- **Navegação de Slides**: Setas + contador
- **Meta**: Banca e Tópico

### Área de Preview

- **Container responsivo**: Ajusta ao modo selecionado
- **Player integrado**: Usa AvantLessonPlayer
- **Animações suaves**: Transições fluidas

### Controles de Simulação

- **Botões de Alternativas**: Simular resposta
- **Indicador de Correção**: Mostra qual está correta (✓)

## 📊 Estados do Preview

### Estado: Pergunta

- Mostra a questão inicial
- Exibe alternativas
- Permite simular resposta
- Botões de simulação visíveis

### Estado: Gabarito

- Mostra resultado após resposta
- Indica alternativa correta
- Mostra feedback visual
- Pronto para avançar para estudo

### Estado: Estudo

- Mostra slides de estudo reverso
- Navegação entre slides disponível
- Barra de progresso ativa
- Controles de navegação visíveis

## 🔧 Integração

### No Laboratório Admin

O preview é integrado automaticamente:

```tsx
<EnhancedPreview question={parsedData} />
```

### Props Disponíveis

```typescript
interface EnhancedPreviewProps {
  question: QuestaoCompleta | null;
  onClose?: () => void;
}
```

## 🎯 Benefícios

- ✅ **Validação Visual**: Ver questão antes de publicar
- ✅ **Teste de UX**: Verificar experiência do usuário
- ✅ **Debug Rápido**: Identificar problemas visuais
- ✅ **Confiança**: Publicar com certeza
- ✅ **Iteração Rápida**: Ajustar e ver imediatamente

## 🔮 Melhorias Futuras

- [ ] Preview lado a lado com editor
- [ ] Comparação antes/depois
- [ ] Screenshot do preview
- [ ] Gravação de interação
- [ ] Métricas de preview (tempo, cliques)
- [ ] Preview de múltiplas questões

## 📚 Referências

- [AvantLessonPlayer](../components/lesson/AvantLessonPlayer.tsx)
- [Laboratório Admin](../app/(admin)/admin/laboratorio/page.tsx)
