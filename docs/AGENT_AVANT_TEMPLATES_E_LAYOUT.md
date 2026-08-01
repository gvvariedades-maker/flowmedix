# Documentação: Sistema de Design de Slides para o Agent-Avant

Referência completa para o **agent-avant** gerar JSONs de questões com design automático por assunto, template (cores) e layout_variant (didática dos slides).

**Brief visual de variantes bespoke (antes de codar):** [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) · **Engenharia de moldes:** [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md).

**Pacote premium completo** (runbook Fases 0–6): [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) § Runbook.

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
| `logic_flow` | Fluxo lógico | Sequência de passos; `reveal_mode: "tap"` (premium) ou `auto` (padrão legado) |
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
| **golden_rule** | `center` | Texto gigante centralizado. Padrão (sem `rows`) |
| | `compact` | Card menor com texto denso |
| | `minimal` | Texto com borda lateral, sem fundo |
| | `banner` | Faixa com ícone e destaque máximo |
| | `reference_table` | Tabela rótulo × valor. **Automático** quando há `rows` |
| **logic_flow** | `vertical` | Pipeline vertical com setas. Padrão |
| | `horizontal` | Passos em linha com setas laterais |
| | `cards` | Grid de cards com numeração |
| **danger_zone** | `list` | Lista com borda vermelha. Padrão (sem `correct` nos itens) |
| | `compare` | Duas colunas: pegadinha × correto. **Automático** quando ≥1 item tem `correct` |
| | `cards` | Itens em cards separados |
| | `compact` | Layout condensado, sem muito espaço |

### 4.1 Moldes bespoke — Imunização (`meta.pedagogical_branch`)

O fallback da linha **Imunização** na §6.5 é genérico; com `pedagogical_branch` declarado, o player usa `BRANCH_DESIGN_MAP`:

| Ramo | concept_map | golden_rule | logic_flow | danger_zone |
|------|-------------|-------------|------------|-------------|
| `imunizacao_vf_intervalos` | `pni-rules-deck` | `pni-interval-matrix` | `pni-vf-juggle-tap` | `pni-trap-chips` |
| `imunizacao_calendario` | `vaccine-timeline` | `pni-calendar-board` | `pni-calendar-elimination-tap` | `calendar-mismatch` |
| `imunizacao_cadeia_frio` | `cold-chain-hub` | `pni-temperature-rail` | `pni-cold-chain-tap` | `temperature-mismatch` |
| `imunizacao_generico` | `morphological` | `reference_table` | `vertical` / tap | `compare` |

Detalhe visual e goldens: [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) · briefs em `artifacts/l3-brief-imunizacao-*.md`.

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
| Farmacodinâmica e Farmacocinética | purple | adme-journey-rail | pk-pd-reference-board | farmaco-vf-juggle-tap | farmaco-trap |
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
| Feridas e Queimaduras | orange | burn-depth-layer-deck | burn-rule-nine-board | burn-triage-tap-flow | burn-trap-arena |

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
| Promoção à Saúde e Prevenção de Agravos | emerald | **sus-art4-orbit** | center / `reference_table` | cards | **scope-trap** |
| Imunização | lime | morphological* | compact* | horizontal* | compact* |

\*Fallback do subtópico — ver §4.1 ramos `imunizacao_*` quando `meta.pedagogical_branch` estiver declarado.  
Promoção: ramo forte `promocao_art4_composicao` usa `sus-art4-orbit` + `scope-trap` (já wired); demais ramos → genérico premium — ver [`artifacts/l3-brief-promocao-a-saude-e-prevencao-de-agravos-INDEX.md`](../artifacts/l3-brief-promocao-a-saude-e-prevencao-de-agravos-INDEX.md).
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
| Saúde do Adolescente | sky | **por ramo** — ver §6.8.1 | **por ramo** | **por ramo** | **por ramo** |

#### 6.8.1 Saúde do Adolescente — ramos L3 (`meta.pedagogical_branch`)

O subtópico canônico é amplo; o player resolve o pacote por **ramo pedagógico** (não use só a linha da tabela acima).

| Ramo | concept_map | golden_rule | logic_flow | danger_zone |
|------|-------------|-------------|------------|-------------|
| `adolescente_etica_sigilo` | `adolescent-care-pillars-deck` | `adolescent-speak-barrier-board` | `adolescent-exceto-isolate-board` | `adolescent-exceto-compare` |
| `adolescente_antropometria` (escore Z) | `adolescent-growth-z-rail` | `adolescent-z-band-board` | `adolescent-z-classify-tap` | `adolescent-z-threshold-trap` |
| demais ramos | `morphological` | `reference_table` | `vertical` + `reveal_mode: tap` | `compare` + `items[].correct` |

Briefs 4/4 por ramo: [`artifacts/l3-brief-saude-adolescente-INDEX.md`](../artifacts/l3-brief-saude-adolescente-INDEX.md) · resolver: [`MOLD_AFFINITY_RESOLVER.md`](MOLD_AFFINITY_RESOLVER.md).
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

O campo `steps` deve ser sempre **array de strings** (cada string = uma decisão do raciocínio).

| `reveal_mode` | Comportamento no player |
|---|---|
| omitido ou `"auto"` | Revelação automática sequencial (~600 ms entre passos). Slides já publicados. |
| `"tap"` | Passo 0 visível; demais ilegíveis até o aluno tocar no card ativo ou em **Próximo passo**; contador *Passo X de Y*. Conteúdo **novo** do agente deve usar este valor. |

`prefers-reduced-motion` no dispositivo revela todos os passos de uma vez (equivalente a `auto` completo).

```json
{
  "type": "logic_flow",
  "reveal_mode": "tap",
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

### Estrutura do `golden_rule`

Conteúdo **novo** com valores de referência: **`rows`** com `label` e `value` (SV, doses, escores). O player usa layout **`reference_table`** automaticamente. **`content`** opcional como título/mnemônico acima da tabela; só `content` mantém tipografia gigante (slides legados).

```json
{
  "type": "golden_rule",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "Verificação de Sinais Vitais" },
  "content": "VALORES DE REFERÊNCIA — ADULTO",
  "rows": [
    { "label": "PA sistólica", "value": "90–140 mmHg" },
    { "label": "FC", "value": "60–100 bpm" },
    { "label": "FR", "value": "12–20 irpm" },
    { "label": "SpO₂", "value": "≥ 94%" }
  ],
  "footer_rule": "Registrar horário e posição do paciente"
}
```

### Estrutura do `danger_zone`

Conteúdo **novo:** cada item com `label`, `detail` (pegadinha) e **`correct`** (texto da coluna certa). O player usa layout **`compare`** automaticamente. Opcional: `"bullet_style": "x_icon"` (padrão `numbered`).

Slides **legados** sem `correct` continuam no layout `list`.

```json
{
  "type": "danger_zone",
  "bullet_style": "x_icon",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "Urgências e Emergências" },
  "content": "CUIDADO: título do alerta principal",
  "items": [
    {
      "id": "1",
      "label": "Interromper RCP para verificar pulso",
      "detail": "Errado: parar a cada ciclo para checar pulso.",
      "correct": "Só verificar pulso após 2 minutos de RCP contínua."
    },
    {
      "id": "2",
      "label": "Hiperventilação durante RCP",
      "detail": "Errado: ventilações em excesso.",
      "correct": "30 compressões : 2 ventilações, sem hiperventilar."
    }
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
        {
          "id": "1",
          "label": "Interromper RCP para verificar pulso",
          "detail": "Errado: parar a cada ciclo para checar pulso.",
          "correct": "Só verificar pulso após 2 minutos de RCP contínua."
        },
        {
          "id": "2",
          "label": "Hiperventilação durante RCP",
          "detail": "Errado: ventilações em excesso reduzem retorno venoso.",
          "correct": "30 compressões : 2 ventilações, sem hiperventilar."
        },
        {
          "id": "3",
          "label": "RCP sem acionar emergência",
          "detail": "Errado: iniciar compressões sem pedir ajuda.",
          "correct": "Acionar SAMU 192 primeiro (exceto afogamento/crianças)."
        }
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
- [ ] Um slide de cada tipo na ordem canônica: `concept_map`, `logic_flow`, `golden_rule`, `danger_zone`
- [ ] `steps` do `logic_flow` é array de strings (não objetos)
- [ ] `danger_zone` tem `content`, `items` (com `label`, `detail`, **`correct`**) e `footer_rule`
- [ ] `concept_map` tem `items` com `label`, `detail` e `icon` (ícone Lucide válido)
- [ ] `golden_rule` tem `content` (mnemônico) e/ou `rows` (referência); preferir `rows` para SV/doses/escores
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

---

## 12. Cabeçalho da questão (tela do enunciado)

O player monta duas linhas acima do `question_data.instruction`:

1. **Linha da prova:** se existir `meta.header_line`, usa esse texto literal; senão, quando houver `banca`, órgão e cargo (explícito ou inferido), monta no formato **CPCON / concurso técnico:**  
   `BANCA – TÉCNICO (Órgão) ANO` (travessão en `–`, sem barras `/` e sem repetir o órgão).  
   O cargo vem de `meta.cargo_header` ou é inferido de `prova` (ex.: texto com “Tec Enf” → `TÉCNICO`).  
   Se não der para montar esse formato, usa o legado `Banca - Prova/Órgão/Ano`.
2. **Linha de matéria:** `Tópico - Subtópico` — **não** entra na linha da prova (só aqui).

Exemplo alinhado ao PDF (linha 1 do caderno compactada no AVANT):

```json
"meta": {
  "banca": "CPCON UEPB",
  "prova": "Tec Enf (Pref R Sto Antônio)",
  "orgao": "Pref R Sto Antônio",
  "ano": "2025",
  "topico": "Enfermagem",
  "subtopico": "História da Enfermagem",
  "cargo_header": "TÉCNICO"
}
```

- Com `cargo_header` ou `prova` reconhecível: linha 1 ≈ `CPCON UEPB – TÉCNICO (Pref R Sto Antônio) 2025`.  
- `cargo_header` é opcional se `prova` permitir inferir “Tec Enf” → `TÉCNICO`.  
- `header_line` (opcional) substitui toda a linha 1, se precisar de texto 100% manual.

```json
"header_line": "Texto literal opcional que substitui a linha derivada"
```

No **`question_data.instruction`**:

- **Não** incluir a numeração global do caderno no PDF (`1)`, `2)`, …). O texto deve começar em “De acordo com…” (ou equivalente). O player também **remove** automaticamente `N)` no início, se vier por engano.
- Use quebras de linha (ou `<br>` / `<p>` permitidos) entre **I -**, **II -**, **III -** e antes de “É CORRETO o que se afirma em:”.
- As alternativas **a) b) c)** ficam em **`question_data.options`** (não repetir no `instruction`, salvo exceção de layout).

---

## 13. Shell dos slides (chip, banca, fio condutor)

No **estudo reverso**, `NeuroSlide` envolve cada slide com `ReverseStudyShell` (uma única fonte de verdade — não duplicar chips nos variantes).

| UI | Origem no JSON / app |
|---|---|
| Chip do tipo (MAPA DE CONCEITOS, REGRA DE OURO, …) | `type` → rótulo em `components/slides/core/slideLabels.ts`; override: `chip_label` |
| Badge da banca (canto superior) | `meta.banca` da questão — **não** repetir em cada slide |
| `Slide N de M — {arco}` | Índice no player + arco por `type` (`SLIDE_ARC_BY_TYPE`) |
| Título de capa | Opcional: `slide_title` no slide |

**Mapeamento chip padrão (PT-BR, uppercase):**

| `type` | Chip |
|---|---|
| `concept_map` | MAPA DE CONCEITOS |
| `golden_rule` | REGRA DE OURO |
| `logic_flow` | FLUXO LÓGICO |
| `danger_zone` | ZONA DE PERIGO |
| `syllable_scanner` | SCANNER SILÁBICO |
| `versus_arena` | ARENA VERSUS |

**Arcos narrativos padrão (ordem v2):** concept_map → Panorama do tema · logic_flow → Raciocínio passo a passo · golden_rule → Regra que a banca cobra · danger_zone → Evite as pegadinhas.

Previews isolados (`standalone` em `NeuroSlide`) usam shell sem badge de banca (slide 1 de 1).
