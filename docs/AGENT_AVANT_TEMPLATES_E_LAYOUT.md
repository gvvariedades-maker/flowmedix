# Documentação: Sistema de Design de Slides para o Agent-Avant

Referência completa para o **agent-avant** gerar JSONs de questões com design automático por assunto, template (cores) e layout_variant (didática dos slides).

---

## 1. Como funciona em resumo

O Avant tem um sistema de design inteligente que funciona em **dois modos**:

### Modo Automático (recomendado)
O agent só precisa preencher o `meta.subtopico` corretamente. O app resolve cores e layout sozinho.

```json
"meta": {
  "topico": "Enfermagem",
  "subtopico": "Urgências e Emergências"
}
```

### Modo Manual (override)
O agent declara explicitamente `template` e `layout_variant` em cada slide. Sobrescreve o automático.

```json
{
  "type": "golden_rule",
  "template": "t03",
  "layout_variant": "banner",
  "content": "REGRA DE OURO..."
}
```

---

## 2. Prioridade de resolução do design

O app resolve o design de cada slide nesta ordem:

```
1. JSON declara "template" ou "theme_id" explícito   → usa esse (prioridade máxima)
2. JSON declara "layout_variant" explícito            → usa esse
3. meta.subtopico encontrado no SUBTOPIC_DESIGN_MAP  → usa o pacote do mapa (automático)
4. slide.subject encontrado no SUBJECT_THEME_MAP     → usa tema por matéria
5. Hash da questão                                   → fallback aleatório consistente
```

---

## 3. Os 4 modelos de slides (tipos)

Cada questão no estudo reverso tem 4 slides, um de cada tipo:

| Tipo (`type`) | Nome | Função didática |
|---|---|---|
| `concept_map` | Mapa de Conceitos | Apresenta múltiplos conceitos simultaneamente com ícone, título e descrição |
| `golden_rule` | Regra de Ouro | Destaca UMA regra essencial em tipografia gigante — o conceito que o aluno não pode esquecer |
| `logic_flow` | Pipeline Cognitivo | Mostra uma sequência de passos em ordem, com animação progressiva |
| `danger_zone` | Zona de Perigo | Alerta sobre erros comuns e pegadinhas de prova com visual de alerta vermelho |

---

## 4. Variantes didáticas por tipo (layout_variant)

| Tipo | layout_variant | Descrição |
|---|---|---|
| **concept_map** | `morphological` | Card central + grid de detalhes. Padrão para 3+ itens |
| | `grid` | Grade de cards simples |
| | `molecular` | Círculos conectados, estilo orgânico |
| | `bridge` | Linhas horizontais com conector central |
| | `stack` | Coluna vertical (poucos itens, ≤2) |
| **golden_rule** | `center` | Texto gigante centralizado. Padrão |
| | `compact` | Card menor com texto denso |
| | `minimal` | Texto com borda lateral, sem fundo |
| | `banner` | Faixa com ícone e destaque máximo |
| **logic_flow** | `vertical` | Pipeline vertical com setas. Padrão |
| | `horizontal` | Passos em linha com setas laterais |
| | `cards` | Grid de cards com numeração |
| **danger_zone** | `list` | Lista com borda vermelha. Padrão |
| | `cards` | Itens em cards separados |
| | `compact` | Layout condensado, sem muito espaço |

---

## 5. Templates de cores (t01–t15)

| ID | Cor | Assuntos sugeridos |
|---|---|---|
| t01 | indigo | Fundamentos de Enfermagem |
| t02 | emerald | Procedimentos, Atenção Básica |
| t03 | rose | Anatomia, Urgências, Cardiologia |
| t04 | amber | Legislação, História, Segurança |
| t05 | violet | SAE, Processo de Enfermagem, Saúde Mental |
| t06 | cyan | Fisiologia, Oxigenoterapia, Respiratório |
| t07 | fuchsia | Centro Cirúrgico, Informática |
| t08 | sky | Histopatologia, Saúde do Adolescente, Ética |
| t09 | lime | Epidemiologia, Imunização, Parasitologia |
| t10 | teal | CME, Biossegurança, Saúde Pública |
| t11 | orange | Curativos, Feridas, Bacterianas/Fúngicas |
| t12 | blue | Cálculos, Matemática |
| t13 | purple | Farmacologia, ISTs |
| t14 | pink | Saúde da Mulher, Obstetrícia |
| t15 | indigo | (variação de t01) |

Também aceita nome direto: `"template": "violet"`, `"template": "rose"`, etc.

---

## 6. Mapa completo de subtópicos → design automático

O `meta.subtopico` do JSON é usado para resolver automaticamente o design completo.
**O agent não precisa declarar `template` nem `layout_variant`** se preencher o subtópico corretamente.

### 6.1 Fundamentos e Bases

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| História da Enfermagem | amber | bridge | minimal | vertical | list |
| Noções de Anatomia | rose | morphological | center | vertical | list |
| Noções de Fisiologia | cyan | molecular | banner | cards | cards |
| Processo de Enfermagem | violet | morphological | center | vertical | list |

### 6.2 Farmacologia e Medicamentos

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| Farmacodinâmica e Farmacocinética | purple | molecular | minimal | cards | list |
| Cálculo de Administração de Medicamentos e Infusões | blue | stack | minimal | vertical | compact |
| Vias de Administração | emerald | grid | compact | horizontal | cards |
| Cuidados na Administração de Medicamentos | teal | grid | compact | horizontal | cards |

### 6.3 Procedimentos de Enfermagem

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| Verificação de Sinais Vitais | rose | grid | compact | horizontal | compact |
| Instalação e Manejo de Sondas | indigo | grid | compact | vertical | cards |
| Oxigenoterapia e Cuidados Respiratórios | cyan | molecular | banner | cards | compact |
| Curativos e Manejo de Feridas | orange | grid | banner | cards | compact |
| Punção Venosa e Cuidados com Cateteres | indigo | grid | compact | vertical | cards |
| Coleta de Exames Laboratoriais | sky | grid | compact | horizontal | compact |
| Mobilização e Posicionamento do Paciente | teal | grid | compact | horizontal | compact |
| Procedimentos Diversos | emerald | grid | compact | horizontal | cards |
| Feridas e Queimaduras | orange | morphological | banner | cards | cards |

### 6.4 Biossegurança e Controle de Infecção

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| Processamento de Artigos e Produtos de Saúde | teal | bridge | minimal | vertical | list |
| Enfermagem em Central de Material e Esterilização (CME) | teal | bridge | minimal | vertical | list |
| Medidas de Prevenção e Precaução de Contato | cyan | molecular | banner | cards | cards |
| Infecções no Contexto da Biossegurança | lime | molecular | banner | cards | cards |
| Segurança do Paciente | amber | bridge | minimal | vertical | list |

### 6.5 Saúde Pública e Epidemiologia

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| Epidemiologia e Vigilância Epidemiológica | lime | grid | compact | horizontal | compact |
| Promoção à Saúde e Prevenção de Agravos | emerald | grid | compact | horizontal | compact |
| Imunização | lime | morphological | compact | horizontal | compact |
| Atenção Básica / Saúde da Família | emerald | morphological | center | vertical | list |

### 6.6 Doenças Transmissíveis

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| Infecções Sexualmente Transmissíveis (ISTs) | purple | molecular | minimal | cards | compact |
| Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.) | rose | molecular | banner | cards | cards |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | orange | molecular | minimal | vertical | list |
| Doenças Parasitárias e Zoonoses | lime | molecular | compact | cards | cards |
| Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis | teal | grid | compact | horizontal | compact |
| Questões Mescladas e Outras Doenças Agudas | sky | grid | compact | horizontal | compact |
| Doenças Respiratórias Crônicas (Asma, DPOC) | cyan | bridge | compact | horizontal | compact |

### 6.7 Especialidades Cirúrgicas e Críticas

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| Assistência Perioperatória (Inclui SRPA) | violet | bridge | minimal | vertical | list |
| Enfermagem em Centro Cirúrgico | fuchsia | bridge | minimal | vertical | list |
| Urgências e Emergências | **rose** | molecular | banner | cards | cards |

### 6.8 Saúde Mental, do Trabalho e Ciclos de Vida

| Subtópico (exato) | Cor | concept_map | golden_rule | logic_flow | danger_zone |
|---|---|---|---|---|---|
| Enfermagem do Trabalho | amber | grid | compact | horizontal | cards |
| Saúde Mental | violet | morphological | center | vertical | list |
| Saúde da Criança | cyan | morphological | banner | cards | compact |
| Saúde do Adolescente | sky | grid | compact | horizontal | compact |
| Saúde da Mulher | pink | morphological | center | vertical | list |

---

## 7. Como o agent deve preencher o JSON

### Regra principal

> **Preencha sempre o `meta.subtopico` com o nome exato da tabela acima. O design é resolvido automaticamente.**

### Estrutura obrigatória de cada slide

```json
{
  "type": "concept_map",
  "subject": "Enfermagem",
  "meta": {
    "topico": "Enfermagem",
    "subtopico": "Urgências e Emergências"
  },
  "items": [
    { "label": "Título do conceito", "detail": "Descrição detalhada", "icon": "AlertTriangle" }
  ],
  "footer_rule": "REGRA: texto da regra de ouro"
}
```

### Estrutura do `logic_flow` (atenção especial)

O campo `steps` deve ser sempre **array de strings**:

```json
{
  "type": "logic_flow",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
  "steps": [
    "Avaliação primária do paciente",
    "Verificação dos sinais vitais",
    "Acionamento da equipe multiprofissional",
    "Registro e monitoramento contínuo"
  ]
}
```

### Estrutura do `danger_zone`

```json
{
  "type": "danger_zone",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
  "content": "CUIDADO: título do alerta principal",
  "items": [
    { "id": "1", "label": "Nome da pegadinha", "detail": "Explicação do erro comum" },
    { "id": "2", "label": "Outra pegadinha", "detail": "Explicação detalhada" }
  ],
  "footer_rule": "REGRA FINAL: resumo mnemônico"
}
```

---

## 8. Exemplo completo de JSON — Urgências e Emergências

```json
{
  "meta": {
    "ano": "2024",
    "banca": "IBADE",
    "orgao": "Prefeitura de Recife",
    "prova": "Técnico de Enfermagem",
    "topico": "Enfermagem",
    "subtopico": "Urgências e Emergências"
  },
  "question_data": {
    "instruction": "Texto da questão...",
    "options": [
      { "id": "A", "text": "Alternativa A", "is_correct": false },
      { "id": "B", "text": "Alternativa B", "is_correct": true }
    ],
    "correct_answer": "B",
    "explanation": "Explicação do gabarito..."
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "subject": "Enfermagem",
      "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
      "items": [
        { "label": "Parada Cardiorrespiratória", "detail": "Ausência de pulso e respiração. Iniciar RCP imediatamente.", "icon": "Heart" },
        { "label": "Choque", "detail": "Perfusão tecidual inadequada. Identificar tipo e tratar causa.", "icon": "Zap" },
        { "label": "Obstrução de Vias Aéreas", "detail": "Manobra de Heimlich em adultos conscientes.", "icon": "Wind" }
      ],
      "footer_rule": "REGRA: Em toda emergência — avaliar, chamar, agir"
    },
    {
      "type": "golden_rule",
      "subject": "Enfermagem",
      "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
      "content": "TODA PARADA CARDIORRESPIRATÓRIA EXIGE RCP IMEDIATA — CADA MINUTO REDUZ 10% A CHANCE DE SOBREVIDA"
    },
    {
      "type": "logic_flow",
      "subject": "Enfermagem",
      "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
      "steps": [
        "Avaliar segurança do ambiente",
        "Verificar responsividade do paciente",
        "Acionar emergência (SAMU 192)",
        "Iniciar RCP: 30 compressões + 2 ventilações",
        "Utilizar DEA assim que disponível"
      ]
    },
    {
      "type": "danger_zone",
      "subject": "Enfermagem",
      "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
      "content": "CUIDADO: Erros Críticos em Emergências",
      "items": [
        { "id": "1", "label": "Interromper RCP para verificar pulso", "detail": "Errado. Só verificar pulso após 2 minutos de RCP contínua." },
        { "id": "2", "label": "Hiperventilação durante RCP", "detail": "Errado. Ventilações em excesso aumentam pressão intratorácica e reduzem retorno venoso." },
        { "id": "3", "label": "Iniciar RCP sem acionar o serviço de emergência", "detail": "Errado. Acionar primeiro, depois iniciar RCP (exceto afogamento e crianças)." }
      ],
      "footer_rule": "REGRA: Comprima forte, comprima rápido (100-120/min), minimize interrupções"
    }
  ]
}
```

---

## 9. Exemplo com design manual (override)

Quando quiser forçar um design diferente do automático:

```json
{
  "type": "golden_rule",
  "template": "t07",
  "layout_variant": "minimal",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
  "content": "REGRA DE OURO..."
}
```

> `template` e `layout_variant` declarados no JSON têm **prioridade máxima** sobre o design automático.

---

## 10. Checklist do agent ao gerar cada questão

- [ ] `meta.subtopico` preenchido com nome exato da tabela da Seção 6
- [ ] Cada questão tem exatamente **4 slides** em `reverse_study_slides`
- [ ] Um slide de cada tipo: `concept_map`, `golden_rule`, `logic_flow`, `danger_zone`
- [ ] `steps` do `logic_flow` é array de strings (não objetos)
- [ ] `danger_zone` tem `content`, `items` (array) e `footer_rule`
- [ ] `concept_map` tem `items` com `label`, `detail` e `icon` (ícone Lucide válido)
- [ ] `golden_rule` tem `content` com a regra principal em caixa alta
- [ ] `subject` preenchido em todos os slides
- [ ] JSON válido e completo (sem truncamentos)

---

## 11. Ícones Lucide recomendados por assunto

| Assunto | Ícones sugeridos |
|---|---|
| Anatomia / Fisiologia | `Bone`, `Brain`, `Heart`, `Eye`, `Stethoscope` |
| Farmacologia | `Pill`, `FlaskConical`, `Syringe`, `TestTube` |
| Urgências | `AlertTriangle`, `Heart`, `Zap`, `Wind`, `ShieldAlert` |
| Biossegurança / CME | `Shield`, `ShieldCheck`, `Trash2`, `Droplets` |
| Procedimentos | `Scissors`, `Bandage`, `Thermometer`, `Activity` |
| Epidemiologia | `BarChart2`, `TrendingUp`, `Globe`, `Users` |
| Legislação | `Scale`, `BookOpen`, `FileText`, `Gavel` |
| Saúde Mental | `Brain`, `Heart`, `Smile`, `MessageCircle` |
| Saúde da Mulher | `Baby`, `Heart`, `User` |
| Saúde da Criança | `Baby`, `Heart`, `Smile`, `Shield` |
| Cirúrgico / Periop | `Scissors`, `Activity`, `AlertTriangle`, `Clock` |
