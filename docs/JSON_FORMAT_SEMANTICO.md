# Formato JSON Semântico - AVANT

## Visão Geral

O AVANT agora suporta um formato JSON **semântico e enxuto**, onde apenas os dados são armazenados e a apresentação visual é gerada automaticamente pelo frontend.

## Benefícios

- ✅ **40-60% menor** que o formato antigo
- ✅ **Desacoplamento** entre conteúdo e apresentação
- ✅ **Flexibilidade visual** sem alterar dados
- ✅ **Escalabilidade** melhorada
- ✅ **Manutenibilidade** simplificada

## Formato Recomendado (Novo)

```json
{
  "meta": {
    "ano": "2024",
    "banca": "EBSERH",
    "orgao": "Hospital Universitário",
    "prova": "Técnico de Enfermagem",
    "topico": "Fundamentos de Enfermagem",
    "subtopico": "Sistematização da Assistência de Enfermagem (SAE)"
  },
  "question_data": {
    "instruction": "No período: \"É preciso conhecer essas limitações-características <strong>para nos darmos melhor com essa tecnologia</strong>\". A oração em destaque é classificada como:",
    "text_fragment": "<p>\"É preciso conhecer essas limitações-características <strong>para nos darmos melhor com essa tecnologia</strong>\".</p>",
    "options": [
      { "id": "A", "text": "Oração subordinada adverbial temporal.", "is_correct": false },
      { "id": "B", "text": "Oração subordinada adjetiva restritiva.", "is_correct": false },
      { "id": "C", "text": "Oração subordinada adverbial final.", "is_correct": true },
      { "id": "D", "text": "Oração subordinada concessiva.", "is_correct": false },
      { "id": "E", "text": "Oração coordenada conclusiva.", "is_correct": false }
    ]
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "subject": "Orações subordinadas",
      "meta": { "topico": "Fundamentos de Enfermagem", "subtopico": "SAE" },
      "items": [
        { "label": "Oração destacada", "detail": "Para nos darmos melhor com essa tecnologia", "icon": "Sparkles" },
        { "label": "Função", "detail": "Indica finalidade", "icon": "Bolt" },
        { "label": "Verbo principal", "detail": "É preciso conhecer", "icon": "Shield" }
      ],
      "footer_rule": "Trace cada termo em volta da oração para entender sua relação."
    },
    {
      "type": "logic_flow",
      "subject": "Decisão final",
      "meta": { "topico": "Fundamentos de Enfermagem", "subtopico": "SAE" },
      "steps": [
        "Leia o trecho destacado: \"para nos darmos melhor com essa tecnologia\".",
        "Pergunte-se \"para quê?\"; se responde finalidade, é adverbial final.",
        "Confirme o verbo no infinitivo (\"darmos\") junto ao conectivo \"para\".",
        "Selecione a alternativa que explicita o propósito da ação."
      ],
      "footer_rule": "Sempre aplique o \"para quê?\" antes de confirmar a letra."
    },
    {
      "type": "golden_rule",
      "subject": "Regra de ouro",
      "meta": { "topico": "Fundamentos de Enfermagem", "subtopico": "SAE" },
      "content": "Orações iniciadas por \"para\" + verbo no infinitivo indicam finalidade; responda \"para quê?\" antes de marcar.",
      "footer_rule": "Repita o mantra: finalidade = \"para quê?\"."
    },
    {
      "type": "danger_zone",
      "subject": "Pegadinhas críticas",
      "meta": { "topico": "Fundamentos de Enfermagem", "subtopico": "SAE" },
      "content": "Esta questão é uma pegadinha porque muitos alunos confundem \"para\" + infinitivo com outras classificações.",
      "items": [
        { "label": "Confundir com temporal", "detail": "Nem todo \"para\" indica tempo; quando há verbo no infinitivo, sempre indica finalidade." },
        { "label": "Ignorar a finalidade", "detail": "Evite confundir com concessiva; a presença do infinitivo \"darmos\" é a chave." }
      ],
      "footer_rule": "Só marque como final quando a oração respondeu \"para quê?\" e tiver verbo no infinitivo."
    }
  ]
}
```

## Campos por Tipo de Slide

### `concept_map`
```json
{
  "type": "concept_map",
  "subject": "string", // Para mapeamento automático de tema
  "items": [
    {
      "label": "string",
      "detail": "string",
      "icon": "string" // Nome do ícone Lucide (opcional)
    }
  ],
  "footer_rule": "string" // Opcional
}
```

### `logic_flow`
```json
{
  "type": "logic_flow",
  "subject": "string",
  "steps": ["string", "string", ...],
  "footer_rule": "string" // Opcional
}
```

### `golden_rule`
```json
{
  "type": "golden_rule",
  "subject": "string",
  "content": "string",
  "footer_rule": "string" // Opcional
}
```

### `danger_zone`
```json
{
  "type": "danger_zone",
  "subject": "string",
  "content": "string", // Resumo da pegadinha
  "items": [
    {
      "label": "string",
      "detail": "string"
    }
  ],
  "footer_rule": "string" // Opcional
}
```

## Geração Automática de Tema

O tema visual é gerado automaticamente baseado no campo `subject`:

- `subject: "Sintaxe"` → Tema `violet`
- `subject: "Morfologia"` → Tema `indigo`
- `subject: "Direito"` → Tema `amber`
- etc.

Se `subject` não estiver presente, o sistema usa `meta.topico` ou `meta.subtopico` como fallback.

## Cálculo Automático de Layout

O `layout_variant` é calculado automaticamente baseado em:

- **Tipo de slide**: Cada tipo tem um layout padrão
- **Número de items**: Para `concept_map`, o layout muda conforme a quantidade
- **Contexto**: O componente decide a melhor apresentação

## Compatibilidade

O AVANT mantém **100% de compatibilidade** com o formato antigo (que inclui `structure`, `design_system`, `layout_variant`). O sistema detecta automaticamente qual formato está sendo usado e normaliza adequadamente.

## Migração

Para migrar do formato antigo para o novo:

1. Remova `design_system` (tema gerado automaticamente)
2. Remova `layout_variant` (calculado automaticamente)
3. Remova `structure` (use campos diretos)
4. Mantenha apenas `type`, `subject`, `meta` e dados específicos do tipo

## Exemplo de Migração

### Antes (Formato Antigo)
```json
{
  "type": "logic_flow",
  "layout_variant": "vertical",
  "design_system": {
    "accent_color": "amber",
    "glow_color": "lime"
  },
  "structure": {
    "steps": ["passo 1", "passo 2"]
  }
}
```

### Depois (Formato Novo)
```json
{
  "type": "logic_flow",
  "subject": "Orações subordinadas",
  "steps": ["passo 1", "passo 2"]
}
```

**Redução de tamanho: ~60%**
