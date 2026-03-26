# Documentação: Sistema de Templates e Layout Variants para Agent-Avant

Documento de referência para implementar no **agent-avant** (gerador de JSON de questões) o sistema de templates (cores) e layout_variant (didática dos slides) do Avant.

---

## 1. Visão Geral

O JSON de questões do Avant suporta dois níveis de personalização visual por slide:

| Campo | Propósito | Escopo |
|-------|-----------|--------|
| `template` ou `theme_id` | **Cores/tema** (indigo, violet, cyan, etc.) | Prioridade máxima na escolha do tema |
| `layout_variant` | **Didática/layout** (como o conteúdo é exibido) | Define a estrutura visual de cada slide |

---

## 2. Campos no JSON

### 2.1 Por slide (dentro de `reverse_study_slides`)

```json
{
  "type": "concept_map",
  "subject": "Enfermagem",
  "template": "t05",
  "theme_id": "t05",
  "layout_variant": "morphological",
  "items": [...],
  "footer_rule": "..."
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `template` | string | Não | ID do template (t01-t15) ou nome do tema (ex: "violet"). Prioridade máxima para cores. |
| `theme_id` | string | Não | Alias de `template`. Mesmo comportamento. |
| `layout_variant` | string | Não | Variante didática do slide. Depende do `type`. |

---

## 3. Template (Cores/Tema)

### 3.1 Mapeamento t01–t15

| ID | Tema |
|----|------|
| t01 | indigo |
| t02 | emerald |
| t03 | rose |
| t04 | amber |
| t05 | violet |
| t06 | cyan |
| t07 | fuchsia |
| t08 | sky |
| t09 | lime |
| t10 | teal |
| t11 | orange |
| t12 | blue |
| t13 | purple |
| t14 | pink |
| t15 | indigo |

### 3.2 Uso alternativo

O `template` pode receber o **nome do tema** diretamente: `"template": "violet"` ou `"template": "cyan"`.

### 3.3 Prioridade de seleção do tema (no Avant)

1. `slide.template` ou `slide.theme_id` (quando presente)
2. `slide.design_system.accent_color` (formato legado)
3. `slide.subject` → mapeamento SUBJECT_THEME_MAP
4. `slide.meta.topico` ou `slide.meta.subtopico`
5. Hash da questão (fallback)

---

## 4. Layout Variant (Didática)

### 4.1 Variantes por tipo de slide

| type | layout_variant | Descrição |
|-----|----------------|-----------|
| **concept_map** | `morphological` | Card central + detalhes em grid. Padrão quando há 3+ itens. |
| | `grid` | Grade de cards. |
| | `molecular` | Círculos conectados (estilo morfologia). |
| | `bridge` | Linhas horizontais com conector. |
| | `stack` | Coluna vertical (poucos itens). |
| **golden_rule** | `center` | Texto grande centralizado. Padrão. |
| | `compact` | Card menor, texto denso. |
| | `minimal` | Texto com borda lateral. |
| | `banner` | Faixa horizontal com ícone. |
| **logic_flow** | `vertical` | Pipeline vertical conectado. Padrão. |
| | `horizontal` | Passos em linha com setas. |
| | `cards` | Grid de cards. |
| **danger_zone** | `list` | Lista com borda vermelha. Padrão. |
| | `cards` | Itens em cards separados. |
| | `compact` | Layout condensado. |

### 4.2 Valores padrão quando ausente

| type | layout_variant padrão |
|------|------------------------|
| concept_map | `morphological` (3+ itens) ou `stack` (≤2 itens) |
| golden_rule | `center` |
| logic_flow | `vertical` |
| danger_zone | `list` |

---

## 5. Validação (Zod)

Os schemas de validação **devem** incluir `template` e `theme_id` em cada slide. Caso contrário, o Zod remove esses campos na validação e eles nunca chegam ao player.

### 5.1 Campos obrigatórios nos schemas de slide

Em cada schema de slide (ConceptMapSlideSchema, LogicFlowSlideSchema, etc.):

```typescript
template: z.string().max(20).optional(),
theme_id: z.string().max(20).optional(),
layout_variant: z.string().max(50).optional(),
```

---

## 6. Exemplo completo de JSON

```json
{
  "meta": {
    "ano": "2024",
    "banca": "IBADE",
    "orgao": "Prefeitura de Recife",
    "prova": "Técnico (Pref Recife)",
    "topico": "Enfermagem - Noções de Fisiologia",
    "subtopico": "Histopatologia"
  },
  "question_data": {
    "instruction": "...",
    "options": [...],
    "correct_answer": "E",
    "explanation": "..."
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "layout_variant": "molecular",
      "subject": "Enfermagem - Noções de Fisiologia",
      "template": "t08",
      "meta": { "topico": "...", "subtopico": "..." },
      "items": [
        { "label": "...", "detail": "...", "icon": "Flame" }
      ],
      "footer_rule": "REGRA: ..."
    },
    {
      "type": "golden_rule",
      "layout_variant": "banner",
      "subject": "Enfermagem - Noções de Fisiologia",
      "template": "t08",
      "content": "REGRA DE OURO..."
    },
    {
      "type": "logic_flow",
      "layout_variant": "cards",
      "subject": "Enfermagem - Noções de Fisiologia",
      "template": "t08",
      "steps": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
      "footer_rule": "Pipeline: ..."
    },
    {
      "type": "danger_zone",
      "layout_variant": "cards",
      "subject": "Enfermagem - Noções de Fisiologia",
      "template": "t08",
      "content": "CUIDADO: ...",
      "items": [
        { "id": "1", "label": "...", "detail": "..." }
      ],
      "footer_rule": "REGRA DE OURO: ..."
    }
  ]
}
```

---

## 7. Regras para o Agent-Avant

### 7.1 Ao gerar JSON de questões

1. Incluir `template` em cada slide de `reverse_study_slides`.
2. Variar o template por assunto: ex.: Enfermagem → t05, Legislação → t04, Anatomia → t03, Fisiologia → t06.
3. Incluir `layout_variant` em cada slide para variar a didática.
4. Recomendação: usar um template por questão e variar `layout_variant` entre os 4 slides.

### 7.2 Boas práticas

- **Variedade**: alternar entre t01–t15 para assuntos diferentes.
- **Didática**: usar `layout_variant` diferentes por slide (ex.: concept_map=molecular, golden_rule=banner, logic_flow=cards, danger_zone=cards).
- **Consistência opcional**: usar o mesmo template em todos os slides de uma questão para unidade visual.
- **Ícones**: usar ícones Lucide válidos em `items` (ex.: Flame, FlaskConical, AlertTriangle, Scissors, Bone).

### 7.3 logic_flow: formato de steps

O campo `steps` deve ser um **array de strings**:

```json
"steps": ["Passo 1", "Passo 2", "Passo 3"]
```

Não usar objetos `{ "id": "1", "text": "..." }` se o schema validar apenas strings.

---

## 8. Referência rápida (data/themes-map.json)

```json
{
  "template_ids": {
    "t01": "indigo", "t02": "emerald", "t03": "rose", "t04": "amber",
    "t05": "violet", "t06": "cyan", "t07": "fuchsia", "t08": "sky",
    "t09": "lime", "t10": "teal", "t11": "orange", "t12": "blue",
    "t13": "purple", "t14": "pink", "t15": "indigo"
  },
  "layout_variants": {
    "concept_map": ["morphological", "grid", "molecular", "bridge", "stack"],
    "golden_rule": ["center", "compact", "minimal", "banner"],
    "logic_flow": ["vertical", "horizontal", "cards"],
    "danger_zone": ["list", "cards", "compact"]
  }
}
```

---

## 9. Checklist de implementação no agent-avant

- [ ] Garantir que cada slide gerado inclua `template` (t01–t15)
- [ ] Garantir que cada slide inclua `layout_variant` compatível com o `type`
- [ ] Variar template por assunto (mapeamento subject → template)
- [ ] Variar layout_variant entre os 4 slides de uma questão
- [ ] Usar `steps` como array de strings em `logic_flow`
- [ ] Incluir `template` e `theme_id` nos schemas de validação (se o agent valida com Zod)
- [ ] Documentar as opções de template e layout_variant na documentação do agent

---

## Seção 8 — Design Automático por Subtópico

### Como funciona

O Avant possui um sistema automático que escolhe **template (cores) + layout_variant (didática)** com base no `meta.subtopico` do slide, sem precisar declarar no JSON.

**Arquivo:** `components/slides/core/themeGenerator.ts`

**Mapa:** `SUBTOPIC_DESIGN_MAP` — cada subtópico tem um pacote completo:

```ts
'histopatologia': {
  template: 'sky',
  conceptMap: 'molecular',
  goldenRule: 'banner',
  logicFlow: 'cards',
  dangerZone: 'cards'
}
```

### Prioridade de resolução

```
1. JSON declara "template"/"theme_id" explícito      → usa esse
2. JSON declara "layout_variant" explícito            → usa esse
3. meta.subtopico encontrado em SUBTOPIC_DESIGN_MAP  → usa o pacote do mapa
4. slide.subject encontrado em SUBJECT_THEME_MAP     → usa tema por matéria
5. Hash da questão                                   → fallback aleatório consistente
```

### Subtópicos mapeados automaticamente

| Subtópico               | Template | concept_map  | golden_rule | logic_flow | danger_zone |
|-------------------------|----------|--------------|-------------|------------|-------------|
| histopatologia          | sky      | molecular    | banner      | cards      | cards       |
| anatomia                | rose     | morphological| center      | vertical   | list        |
| noções de fisiologia    | cyan     | molecular    | banner      | cards      | cards       |
| legislação              | amber    | bridge       | minimal     | vertical   | list        |
| lei 7.498/86            | amber    | bridge       | minimal     | vertical   | list        |
| sae                     | violet   | morphological| center      | vertical   | list        |
| biossegurança           | teal     | molecular    | banner      | cards      | cards       |
| farmacologia            | purple   | molecular    | minimal     | vertical   | list        |
| imobilização ortopédica | rose     | grid         | banner      | cards      | compact     |
| *(outros)*              | *hash*   | *semântico*  | center      | vertical   | list        |

### Para adicionar novos subtópicos

Edite o `SUBTOPIC_DESIGN_MAP` em `themeGenerator.ts` adicionando:

```ts
'nome do subtópico': {
  template: 'violet',       // qualquer nome de tema (indigo/sky/rose/teal/etc)
  conceptMap: 'grid',
  goldenRule: 'compact',
  logicFlow: 'horizontal',
  dangerZone: 'compact',
},
```

### Para forçar um design diferente no JSON (sobrescreve o automático)

```json
{
  "type": "golden_rule",
  "template": "t08",
  "layout_variant": "banner",
  "meta": { "subtopico": "Histopatologia" }
}
```

> Os campos `template` e `layout_variant` no JSON têm **prioridade máxima** sobre o automático.
