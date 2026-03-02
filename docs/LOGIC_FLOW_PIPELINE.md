# Pipeline Cognitivo - Logic Flow Component

## Visão Geral

O componente `LogicFlow` foi redesenhado como um **Pipeline Cognitivo** que transforma processos cognitivos lineares em uma estrutura visual digerível, reduzindo a carga cognitiva e facilitando a memorização sequencial.

## Arquitetura

### Conceito: Desbloqueio Sequencial

Ao invés de mostrar todos os passos de uma vez, o Pipeline Cognitivo revela cada step progressivamente, criando uma experiência de "desbloqueio" que reforça a relação causa → efeito.

### Stack Tecnológico

- **Framer Motion**: Orquestração sequencial de animações
- **Tailwind CSS**: Glassmorphism e efeitos neon
- **Lucide React**: Indicadores de direção (`ArrowDown`, `CheckCircle2`, `Sparkles`)

## Funcionalidades Implementadas

### 1. Revelação Sequencial Automática

- Cada step é revelado após **600ms** do anterior
- Animação spring physics (stiffness: 200, damping: 20)
- Estados visuais distintos para steps revelados/não revelados

### 2. Conexão Visual Vertical

- **Linha estática**: Background sutil entre steps
- **Linha animada**: Cresce quando step é revelado (gradiente com glow)
- **Ícone de direção**: `ArrowDown` aparece após revelação

### 3. Feedback Visual Avançado

- **Step Ativo**: Pulsa com glow intensificado
- **Step Revelado**: CheckCircle2 aparece com animação de rotação
- **Step Não Revelado**: Opacidade reduzida, número visível
- **Efeito de Brilho**: Radial gradient ao revelar cada step

### 4. Design Cyber Clinical

- **Glassmorphism**: `bg-slate-900/80 backdrop-blur-xl`
- **Neon Glow**: Dinâmico baseado no tema (`theme.glow`)
- **Padrão Diagonal**: Background sutil com repeating-linear-gradient
- **Bordas Animadas**: Glow pulsante no step ativo

### 5. Indicadores de Progresso

- **Badge Superior**: "Pipeline Cognitivo" com ícone Sparkles
- **Contador Footer**: "X de Y passos concluídos"
- **Status Visual**: Cada step mostra seu estado claramente

## Estrutura Visual

```
┌─────────────────────────────────┐
│  ✨ Pipeline Cognitivo          │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ ✓ Step 1                 │  │ ← Revelado
│  └───────────────────────────┘  │
│         ↓ (linha animada)        │
│  ┌───────────────────────────┐  │
│  │ ✓ Step 2                 │  │ ← Ativo (pulsando)
│  └───────────────────────────┘  │
│         ↓ (linha estática)       │
│  ┌───────────────────────────┐  │
│  │ ○ Step 3                 │  │ ← Não revelado
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  2 de 3 passos concluídos       │
└─────────────────────────────────┘
```

## Estados dos Steps

### Não Revelado
- Opacidade: 30%
- Scale: 0.8
- Badge: Número visível, Circle icon
- Texto: Cor reduzida (slate-500)

### Revelado
- Opacidade: 100%
- Scale: 1.0
- Badge: CheckCircle2 com animação
- Texto: Cor do tema (theme.textPrimary)
- Efeito: Brilho radial ao revelar

### Ativo (Último Revelado)
- Pulsa com glow intensificado
- Ring effect visível
- Box shadow animado

## Animações

### Sequência de Revelação

1. **Step aparece**: `opacity: 0 → 1`, `scale: 0.8 → 1`, `y: 20 → 0`
2. **Badge rotaciona**: `rotate: 180 → 0`
3. **CheckCircle aparece**: `scale: 0 → 1`, `rotate: -180 → 0`
4. **Linha cresce**: `height: 0 → 32px`
5. **ArrowDown aparece**: `scale: 0 → 1`, `y: -10 → 0`
6. **Brilho radial**: `opacity: [0, 1, 0]`, `scale: [0.8, 1.2, 1.5]`

### Timing

- Delay entre steps: **600ms**
- Delay inicial por step: `index * 0.1`
- Duração de animações: **0.3s - 0.8s**

## Benefícios Pedagógicos

### 1. Redução de Carga Cognitiva
- **Antes**: Todos os passos visíveis → sobrecarga
- **Depois**: Um step por vez → foco direcionado

### 2. Memorização Sequencial
- Conexão visual clara entre causa e efeito
- Fluxo unidirecional explícito
- Relação temporal preservada

### 3. Engajamento
- Animações mantêm atenção
- Feedback imediato de progresso
- Sensação de "desbloqueio" motiva continuidade

### 4. Acessibilidade Visual
- Contraste claro entre estados
- Indicadores visuais múltiplos
- Responsivo (mobile-first)

## Uso

O componente é usado automaticamente quando o slide tem `type: "logic_flow"`:

```json
{
  "type": "logic_flow",
  "steps": [
    "Identifique o sujeito da oração",
    "Localize o verbo principal",
    "Analise a relação entre sujeito e verbo",
    "Classifique o tipo de oração"
  ]
}
```

## Customização

O componente usa o sistema de temas do AVANT:

- **Tema Indigo**: Para Português/Morfologia
- **Tema Emerald**: Para Fonética/Acentuação
- **Tema Violet**: Para Sintaxe
- **Tema Rose**: Para Danger Zone

O tema é determinado automaticamente pelo `subject` do slide ou pelo hash da questão.

## Performance

- **Lazy Animation**: Animações só executam quando necessário
- **CSS Transforms**: Usa GPU acceleration
- **Debounce**: Revelação sequencial evita sobrecarga
- **Memoization**: Steps são renderizados eficientemente

## Próximas Melhorias

- [ ] Controle manual (pausar/avançar)
- [ ] Modo "revisão rápida" (todos visíveis)
- [ ] Sons opcionais ao revelar
- [ ] Animações customizáveis por tema
- [ ] Exportação de progresso
