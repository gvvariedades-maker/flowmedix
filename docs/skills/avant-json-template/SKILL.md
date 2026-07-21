---
name: avant-json-template
description: Gera e edita JSONs de questões do Avant (meta, cabeçalho, slides, golden-v1, pedagogical_branch L3). Use ao criar questões, handcraft ou estudo reverso. Checklist A1+A2+A3 com audit:questao-readiness.
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# Avant JSON — Geração de Questões com Design Automático

## Regra principal

> **Preencha `meta.subtopico` com o nome exato da tabela abaixo. O app resolve cores e layout automaticamente.**

Não é necessário declarar `template` nem `layout_variant` — o sistema é automático.

### Handcraft premium (L2 — conteúdo bespoke)

Para conteúdo slide a slide com tom de professor (não só forma JSON), siga **esta ordem**:

| # | Skill | Função |
|---|--------|--------|
| 0 | `.cursor/skills/avant-classify-family/SKILL.md` | Define `meta.family` (funil em `lib/catalogMigration/classifyFamily.ts`; gate `l2_family_mismatch`) |
| 1 | Este skill § L2.5+L3 ou playbook do pacote | Escolhe `meta.pedagogical_branch` quando o subtópico tem ramos |
| 2 | `.cursor/skills/avant-golden-anchor-handcraft/SKILL.md` | family → âncora → contrato por slot + **densidade §3b** + cobertura `danger_zone` |
| 3 | Persona de tom (abaixo) | Redação pedagógica — não substitui forma JSON |
| 4 | Este skill (`avant-json-template`) | Forma final: `meta`, cabeçalho, ordem v2, checklist A1+A2+A3 |

**Persona por matéria:**

- **Enfermagem (41 subtópicos):** `.cursor/skills/professor-para-concurso/SKILL.md`
- **Brief L3 TE:** `.cursor/skills/brief-enfermagem/SKILL.md` (+ `reference-pacotes.md`)
- **Língua Portuguesa (geral):** `.cursor/skills/professor-lingua-portuguesa-concurso/SKILL.md` (+ `reference-bancas.md`, `reference-pegadinhas.md`)
- **PT morfossintaxe (Elias / Gran):** `.cursor/skills/professor-elias-santana-metodo/SKILL.md` — termos, pergunta-teste, M01–M16
- **Brief L3 PT:** `.cursor/skills/brief-lingua-portuguesa/SKILL.md` (+ `reference-metaforas.md`, `reference-ramos.md`)

**Barra 10/10 (obrigatório no handcraft novo):**

1. Densidade de card (âncora-handcraft §3b): alvo ≤110 chars em `detail` / `step` / `value`.
2. `danger_zone`: **todas** as letras erradas + **1** item de transferência separado.
3. Último step do `logic_flow` = fixação portátil (“Em similares: …”).
4. `golden_rule` / `footer_rule` ensinam **conduta**, não “decorar letra X”.
5. Um eixo mental por card (ex. CVC: hub ≠ curativo ≠ flush ≠ flebite).

---

## Cabeçalho da questão (`meta` + `instruction`)

O **AvantLessonPlayer** monta duas linhas **acima** do enunciado. Não duplicar esse bloco dentro de `question_data.instruction`.

### Campos do `meta`

| Campo | Uso |
|---|---|
| `banca`, `orgao`, `ano`, `prova` | Linha 1 no formato **CPCON:** `BANCA – TÉCNICO (Órgão) ANO` quando houver cargo (`cargo_header` ou inferido de `prova`, ex. Tec Enf). Senão: legado `Banca - Prova/Órgão/Ano`. |
| `cargo_header` (opcional) | Ex.: `"TÉCNICO"` — força o rótulo entre banca e parêntese do órgão. |
| `topico`, `subtopico` | Segunda linha **só** aqui: `Tópico - Subtópico` (não repetir na linha 1). |
| `header_line` (opcional) | Linha 1 **literal**; substitui qualquer montagem (máx. 500 caracteres). |

### Exemplo de `meta`

```json
"meta": {
  "banca": "CPCON UEPB",
  "prova": "Tec Enf (Pref R Sto Antônio)",
  "orgao": "Pref R Sto Antônio",
  "ano": "2025",
  "cargo_header": "TÉCNICO",
  "topico": "Enfermagem",
  "subtopico": "História da Enfermagem"
}
```

Linha 1 exibida: `CPCON UEPB – TÉCNICO (Pref R Sto Antônio) 2025`. `cargo_header` pode ser omitido se `prova` contiver “Tec Enf” (inferência).

### Enunciado (`question_data.instruction`)

- **Sem** numeração de caderno no início (`1)`, `2)` …) — começar no texto (“De acordo com…”); o app remove `N)` se vier no JSON.
- Afirmações **I**, **II**, **III** com **quebras de linha**; depois “É CORRETO o que se afirma em:”.
- Alternativas **a–e** só em **`options`**, não no `instruction`.

### Figuras no enunciado (`figures[]` / `figure_policy`)

Ver ADR [`docs/DECISAO_QUESTAO_FIGURES.md`](../../../DECISAO_QUESTAO_FIGURES.md).

| Situação | JSON |
|----------|------|
| Tirinha/charge só em raster | `figure_policy: "required"` + `figures[{id,url,alt}]` — upload `npm run figures:upload` |
| Cartaz/frase legível no PDF | `figure_policy: "transcribed"` + `text_fragment` fiel; reescrever comando (“Na sentença abaixo…”) |
| Sem referência visual | omitir ambos |

Checklist A (antes do apply): `npm run figures:audit -- --subtopico="..."` → 0 missing. Gate: `l2_missing_figure` com `--strict-v2-pedagogy`.

---

## Os 4 modelos de slides (sempre os 4 por questão)

**Ordem canônica v2** no array `reverse_study_slides` (handcraft novo):

`concept_map` → `logic_flow` → `golden_rule` → `danger_zone`

O player reordena por `type` se o JSON legado estiver fora de ordem — **não confie nisso** ao escrever conteúdo novo. Template: `examples/_TEMPLATE-golden-v1.json` · código: `lib/reverseStudySlideOrder.ts`.

| Ordem | Tipo | Nome | Função |
|-------|------|------|--------|
| 1 | `concept_map` | Mapa de Conceitos | Enquadramento + núcleos — **sem** gabarito/letra |
| 2 | `logic_flow` | Fluxo Lógico | Eliminação + raciocínio; **novo** com `reveal_mode: "tap"` |
| 3 | `golden_rule` | Regra de Ouro | Decore / tabela normativa — **sem** row de gabarito |
| 4 | `danger_zone` | Zona de Perigo | Pegadinhas; `correct` por distrator + transferência |

---

## Shell do player (chip, banca, fio condutor)

O **player** monta a faixa superior de cada slide via `ReverseStudyShell` (dentro de `NeuroSlide`). **Não** duplicar no JSON o que o app já deriva.

| Elemento | Origem |
|---|---|
| Chip do tipo (ex.: `MAPA DE CONCEITOS`) | Automático pelo `type`; override opcional com `chip_label` |
| Badge da banca | `meta.banca` da questão (não repetir em cada slide) |
| Fio condutor (`Slide N de M — …`) | Automático: posição + arco narrativo por `type` |
| Título de capa do slide | Opcional: `slide_title` no slide |

**Chips padrão por `type`:** `concept_map` → MAPA DE CONCEITOS · `golden_rule` → REGRA DE OURO · `logic_flow` → FLUXO LÓGICO · `danger_zone` → ZONA DE PERIGO.

**Arcos narrativos padrão (ordem v2):** mapa → Panorama do tema · fluxo → Raciocínio passo a passo · regra → Regra que a banca cobra · perigo → Evite as pegadinhas.

```json
{
  "type": "concept_map",
  "slide_title": "Vias de administração",
  "chip_label": "MAPA DE CONCEITOS",
  "items": [ ... ]
}
```

Use `chip_label` só em edge cases; `slide_title` quando o tema do slide precisar de capa além dos itens.

---

## Variantes didáticas (layout_variant)

| Tipo | Variantes disponíveis |
|---|---|
| `concept_map` | `morphological`, `grid`, `molecular`, `bridge`, `stack` |
| `golden_rule` | `center`, `compact`, `minimal`, `banner`, `reference_table` (auto se houver `rows`) |
| `logic_flow` | `vertical`, `horizontal`, `cards` |
| `danger_zone` | `list`, `cards`, `compact`, `compare` (auto se item tiver `correct`) |

---

## Mapa subtópico → design automático

### Fundamentos e Bases
| Subtópico | Cor |
|---|---|
| História da Enfermagem | amber |
| Noções de Anatomia | rose |
| Noções de Fisiologia | cyan |
| Processo de Enfermagem | violet |

### Farmacologia e Medicamentos
| Subtópico | Cor |
|---|---|
| Farmacodinâmica e Farmacocinética | purple |
| Cálculo de Administração de Medicamentos e Infusões | blue |
| Vias de Administração | emerald |
| Cuidados na Administração de Medicamentos | teal |

### Procedimentos
| Subtópico | Cor |
|---|---|
| Verificação de Sinais Vitais | rose |
| Instalação e Manejo de Sondas | indigo |
| Oxigenoterapia e Cuidados Respiratórios | cyan |
| Curativos e Manejo de Feridas | orange |
| Punção Venosa e Cuidados com Cateteres | indigo |
| Coleta de Exames Laboratoriais | sky |
| Mobilização e Posicionamento do Paciente | teal |
| Procedimentos Diversos | emerald |
| Feridas e Queimaduras | orange |

### Biossegurança e Controle de Infecção
| Subtópico | Cor |
|---|---|
| Processamento de Artigos e Produtos de Saúde | teal |
| Enfermagem em Central de Material e Esterilização (CME) | teal |
| Medidas de Prevenção e Precaução de Contato | cyan |
| Infecções no Contexto da Biossegurança | lime |
| Segurança do Paciente | amber |

### Saúde Pública e Epidemiologia
| Subtópico | Cor |
|---|---|
| Epidemiologia e Vigilância Epidemiológica | lime |
| Promoção à Saúde e Prevenção de Agravos | emerald |
| Imunização | lime |
| Atenção Básica / Saúde da Família | emerald |

### Doenças Transmissíveis
| Subtópico | Cor |
|---|---|
| Infecções Sexualmente Transmissíveis (ISTs) | purple |
| Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.) | rose |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | orange |
| Doenças Parasitárias e Zoonoses | lime |
| Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis | teal |
| Questões Mescladas e Outras Doenças Agudas | sky |
| Doenças Respiratórias Crônicas (Asma, DPOC) | cyan |

### Especialidades Cirúrgicas e Críticas
| Subtópico | Cor |
|---|---|
| Assistência Perioperatória (Inclui SRPA) | violet |
| Enfermagem em Centro Cirúrgico | fuchsia |
| Urgências e Emergências | **rose** |

### Saúde Mental, do Trabalho e Ciclos de Vida
| Subtópico | Cor |
|---|---|
| Enfermagem do Trabalho | amber |
| Saúde Mental | violet |
| Saúde da Criança | cyan |
| Saúde do Adolescente | sky |
| Saúde da Mulher | pink |

---

## Formato dos slides (importante)

Use sempre o **formato plano** alinhado ao `QuestaoCompletaSchema`: no mesmo objeto do slide, ao lado de `type`, vêm `items` (concept_map / danger_zone), `content` (golden_rule / danger_zone) ou `steps` (logic_flow). **Não** coloque o conteúdo dentro de um segundo objeto `concept_map`, `golden_rule`, `logic_flow` ou `danger_zone` — isso gerava slides vazios no player antes da normalização no servidor; o agente deve evitar esse padrão.

---

## Estrutura padrão de cada slide

### concept_map
```json
{
  "type": "concept_map",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "SUBTOPICO_EXATO" },
  "items": [
    { "label": "Título", "detail": "Descrição detalhada", "icon": "NomeIconeLucide" }
  ],
  "footer_rule": "REGRA: texto resumo"
}
```

### golden_rule

Conteúdo **novo** com valores de referência (SV, doses, escores): use **`rows`** (`label` + `value`). O player aplica layout **`reference_table`** automaticamente. Use **`content`** como título/mnemônico acima da tabela (opcional com `rows`) ou como frase única em tipografia gigante (legado).

Slides **legados** só com `content` permanecem no layout tipográfico (`center`, etc.).

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
  "footer_rule": "Sempre registrar horário e posição do paciente"
}
```

Mnemônico único (sem tabela):

```json
{
  "type": "golden_rule",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "SUBTOPICO_EXATO" },
  "content": "REGRA EM CAIXA ALTA — FRASE IMPACTANTE E DIRETA"
}
```

### logic_flow

Todo slide `logic_flow` **novo** deve incluir `"reveal_mode": "tap"`: o aluno revela cada passo com toque/CTA (passo 0 já visível; demais bloqueados até avançar). Omitir `reveal_mode` ou `"auto"` mantém animação sequencial automática (~600 ms entre passos) — use só para slides legados.

`steps` são **decisões** em ordem (array de strings, não objetos).

```json
{
  "type": "logic_flow",
  "reveal_mode": "tap",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "SUBTOPICO_EXATO" },
  "steps": [
    "Identificar o quadro clínico prioritário",
    "Cruzar com sinais vitais e protocolo",
    "Escolher a conduta conforme a banca",
    "Registrar e monitorar a resposta"
  ]
}
```

### danger_zone

Todo slide `danger_zone` **novo** deve usar pares **pegadinha × correto**: em cada item, `label`, `detail` (armadilha) e **`correct`** (conduta certa). Com `correct` em ≥1 item o player aplica layout **`compare`** (duas colunas). Omitir `correct` mantém lista legada.

Opcional: `"bullet_style": "x_icon"` (ícone X vermelho na coluna pegadinha); padrão `numbered`.

```json
{
  "type": "danger_zone",
  "bullet_style": "x_icon",
  "subject": "Enfermagem",
  "meta": { "topico": "Enfermagem", "subtopico": "SUBTOPICO_EXATO" },
  "content": "CUIDADO: título do alerta",
  "items": [
    {
      "id": "1",
      "label": "Interromper RCP para verificar pulso",
      "detail": "Errado: parar a cada ciclo para checar pulso.",
      "correct": "Só verificar pulso após 2 minutos de RCP contínua."
    },
    {
      "id": "2",
      "label": "Hiperventilação na RCP",
      "detail": "Errado: ventilações em excesso durante compressões.",
      "correct": "30 compressões : 2 ventilações, sem hiperventilar."
    }
  ],
  "footer_rule": "REGRA FINAL: resumo mnemônico"
}
```

---

## Templates manuais (quando quiser forçar um visual)

| ID | Cor |
|---|---|
| t01 | indigo | t02 | emerald | t03 | rose | t04 | amber |
| t05 | violet | t06 | cyan | t07 | fuchsia | t08 | sky |
| t09 | lime | t10 | teal | t11 | orange | t12 | blue |
| t13 | purple | t14 | pink | t15 | indigo |

Para forçar: `"template": "t07"` ou `"template": "fuchsia"` + `"layout_variant": "banner"`.

---

## Checklist antes de entregar o JSON

- [ ] `meta`: `banca`, `prova`, `orgao`, `ano`, `topico`, `subtopico` quando houver na fonte; `header_line` só se precisar linha literal
- [ ] `instruction` sem `1)` no início; sem repetir cabeçalho da prova; I, II, III com quebras; alternativas só em `options`
- [ ] `meta.subtopico` (nos slides) com nome exato da tabela de assuntos
- [ ] Exatamente 4 slides por questão na **ordem v2**: `concept_map` → `logic_flow` → `golden_rule` → `danger_zone`
- [ ] Um de cada tipo (sem duplicar `type`)
- [ ] `steps` é array de strings (não objetos); `logic_flow` novo com `"reveal_mode": "tap"`
- [ ] `danger_zone` tem `content`, `items` (com `label`, `detail`, **`correct`**) e `footer_rule`
- [ ] `concept_map` tem `items` com `label`, `detail` e `icon` válido do Lucide
- [ ] `golden_rule`: `content` (mnemônico) e/ou `rows` (referência tabular); preferir `rows` para SV/doses/escores
- [ ] Slides em formato **plano** (`items`/`content`/`steps` no mesmo nível que `type` — sem aninhar em `concept_map`, `golden_rule`, etc.)
- [ ] JSON completo e válido (sem truncamentos)
- [ ] **Goldens de referência:** `content_standard: "golden-v1"`, `family`, `sources`, `content_review` — ver `docs/GOLDEN_CONTENT_STANDARD.md`
- [ ] **L3 handcraft:** `meta.pedagogical_branch` quando subtópico tem ramos (tabela L2.5+L3 neste skill)
- [ ] Rodar `npm run audit:questao-readiness` → `READY` antes de apply

---

## GOLDEN v1 — gramática de slots (resumo)

| Slide | Preencher (função) |
|-------|-------------------|
| `concept_map` | Enquadramento + núcleos + pegadinha-âncora — **sem** gabarito/letra |
| `golden_rule` | Título + `rows` oficiais — **sem** row "Gabarito/Combinação" |
| `logic_flow` | Formato → processar item → montar → localizar letra → eliminar distratores → **fixação portátil** (`tap`) |
| `danger_zone` | 1 item por letra errada + **≥1 item de transferência** (`correct` obrigatório e único) |

**Gates (rastreáveis a `lib/goldenContentStandard.ts`):**

- `golden_rule` com row de gabarito → `golden_rule_gabarito_spoiler` (**error** com `--strict-v2-pedagogy`).
- `concept_map` com item de gabarito → removido pelo auto-repair (`repairGoldenV2SpoilerInPayload`) e barrado pelos lints por subtópico (`<pkg>_concept_gabarito_spoiler`); o padrão v2 proíbe mesmo onde não há gate genérico.
- Espelhar `golden_rule` no `concept_map`/`logic_flow` → `slide_layer_redundancy_*`.

**Fixação portátil** (último step do `logic_flow`): regra transferível — *"Em similares: <regra>"*, não a repetição do gabarito.

**Transferência** (item extra no `danger_zone`): *"em outra banca trocam X por Y"*.

Copiar molde: `examples/_TEMPLATE-golden-v1.json`. Metadados `sources` / `content_review` são **internos** (não aparecem no player).

---

## L2.5 + L3 — ramo pedagógico e molde no player (handcraft)

> **Um único prompt** deve entregar **A1 + A2 + A3** no mesmo JSON. O player infere ramo se omitido, mas handcraft **deve declarar** `meta.pedagogical_branch` quando o subtópico tem ramos L3.

### Campos L3 em `meta`

```json
"meta": {
  "content_standard": "golden-v1",
  "family": "vf",
  "pedagogical_branch": "respiratorio_vf_asma_dpoc",
  "subtopico": "Doenças Respiratórias Crônicas (Asma, DPOC)"
}
```

| Campo | Regra |
|-------|--------|
| `family` | Classificar **antes** dos slides com `avant-classify-family` (`vf`, `certo_errado`, `protocolo`, `calc`, `legis`, `conceito`, `text_fragment`). Gate: `l2_family_mismatch` |
| `pedagogical_branch` | **Obrigatório** em handcraft quando o subtópico está na tabela de ramos abaixo (ou no playbook). Gate A3: `l3_branch_inference_mismatch` |
| `template` / `layout_variant` | **Não enviar** — o ramo escolhe o pacote L3 automaticamente |

**Fonte viva de ramos:** `lib/slides/pedagogicalBranch.ts` (`PedagogicalBranchId`, `BRANCH_DESIGN_MAP`) · playbooks em `data/catalog-migration/handcraft-playbooks/` · PT: `brief-lingua-portuguesa/reference-ramos.md`.

### Como escolher o ramo (antes de escrever slides)

1. Ler enunciado + gabarito + cluster do slug.
2. Escolher **um** `pedagogical_branch` da tabela do subtópico.
3. Abrir **1 golden âncora** do mesmo ramo em `examples/` (estilo, não cópia).
4. Ajustar slots ao **pacote de molde** do ramo (bespoke vs genérico).

### Tabela de ramos por subtópico (implementados em `BRANCH_DESIGN_MAP`)

**Processo de Enfermagem**

| Ramo | Quando usar |
|------|-------------|
| `sae_documentacao` | Prontuário, registro, COFEN 358 |
| `sae_etapas` | Diagnóstico, planejamento, etapas SAE |
| `sae_exceto` | EXCETO / INCORRETA em SAE |
| `sae_generico` | Demais |

**Saúde do Adolescente**

| Ramo | Quando usar | Molde L3 |
|------|-------------|----------|
| `adolescente_etica_sigilo` | Sigilo, gravidez, escuta, ética | `adolescent-*` bespoke |
| `adolescente_antropometria` | Escore Z, IMC, nutrição | genérico |
| `adolescente_desenvolvimento` | Puberdade, marcos | genérico |
| `adolescente_saude_mental` | Transtorno alimentar, imagem corporal | genérico |
| `adolescente_violencia_protecao` | Violência, rede de proteção | genérico |
| `adolescente_generico` | EXCETO/diretrizes sem metáfora de sigilo | genérico |

**CME**

| Ramo | Quando usar |
|------|-------------|
| `cme_vf_ce` | V/F certo/errado, CE |
| `cme_autoclave_metodos` | Autoclave, parâmetros de ciclo |
| `cme_preparo_limpeza` | Limpeza, descontaminação |
| `cme_processamento_conceito` | Conceitos de processamento |
| `cme_generico` | Demais |

**Saúde Mental**

| Ramo | Quando usar |
|------|-------------|
| `mental_raps_legis` | RAPS, reforma psiquiátrica |
| `mental_crise_caps` | Crise, agitação, CAPS |
| `mental_dependencia_tabagismo` | Tabagismo, dependência |
| `mental_depressao` | Depressão, epidemiologia |
| `mental_aps_acolhimento` | APS, acolhimento |
| `mental_generico` | Demais |

**Sondas**

| Ramo | Quando usar |
|------|-------------|
| `sonda_instalacao_protocolo` | Instalação, fixação |
| `sonda_medicao_nex` | Medição NEX |
| `sonda_generico` | Demais |

**Farmacodinâmica e Farmacocinética**

| Ramo | Quando usar | Âncora golden |
|------|-------------|---------------|
| `farmaco_pk_pd_vf` | I/II/III, ADME, meia-vida, 1ª passagem | `questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json` |
| `farmaco_clinico_protocolo` | Omeprazol EV, infusão monitorada, diluição hospitalar | `questao-premium-idecan-omeprazol-ev-ulcera.json` |
| `farmaco_generico` | Demais | `questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json` |

**Imunização**

| Ramo | Quando usar | Molde L3 |
|------|-------------|----------|
| `imunizacao_vf_intervalos` | V/F intervalos PNI | `pni-*` bespoke |
| `imunizacao_calendario` | Calendário, esquema por idade | `vaccine-timeline` / `pni-calendar-*` |
| `imunizacao_cadeia_frio` | Cadeia de frio, temperatura 2–8 °C | `cold-chain-hub` / `pni-temperature-rail` |
| `imunizacao_exceto` | EXCETO / INCORRETA PNI | genérico compare |
| `imunizacao_generico` | Demais | genérico |

**Cuidados na Administração de Medicamentos**

| Ramo | Quando usar |
|------|-------------|
| `cam_certos_vf_caso` | Certo/errado com caso clínico |
| `cam_alto_risco` | Medicamentos de alto risco |
| `cam_exceto_conduta` | EXCETO em administração |
| `cam_documentacao` | Checagem, identificação, registro |
| `cam_generico` | Demais |

**Vias de Administração**

| Ramo | Quando usar | Âncora golden |
|------|-------------|---------------|
| `via_vf_absorcao` | Absorção, 1ª passagem, oral/sublingual/retal/parenteral | `questao-premium-consulpam-vias-absorcao-oral.json` |
| `via_tecnica_admin` | Técnica de punção/aplicação | `questao-premium-cpcon-vias-im-vf.json` |
| `via_generico` | Indicação da via, demais | `questao-premium-vunesp-via-subcutanea.json` |

**Punção Venosa e Cuidados com Cateteres**

| Ramo | Quando usar | Âncora golden |
|------|-------------|---------------|
| `puncao_flebite` | Infiltração, flebite, hematoma, complicações locais | `questao-premium-avancasp-puncao-infiltracao-flebite.json` |
| `puncao_dispositivo` | Calibre, jelco, scalp, gauge | `questao-premium-gama-puncao-scalp-jelco-calibre.json` |
| `puncao_exceto` | EXCETO / INCORRETA em técnica ou conduta | `questao-premium-cev-urca-puncao-exceto-med-endovenosa.json` |
| `puncao_tempo` | Troca de equipos, intervalos, permanência | `questao-premium-cpcon-puncao-troca-equipos-intervalos.json` |
| `puncao_periferica_antissepsia` | Técnica de punção, antissepsia | `questao-premium-funpar-puncao-tecnica-periferica.json` |
| `puncao_ipcs_cvc` | Bundle CVC, IPCS | `questao-premium-admtec-puncao-venosa-cateteres.json` |
| `puncao_generico` | Cauda sem cluster forte | `questao-premium-gama-puncao-scalp-jelco-calibre.json` |

**Eixos de revisão (`puncao_ipcs_cvc` / manutenção CVC):** hub · curativo · flush · flebite — **1 eixo por card**; não misturar hub com curativo no mesmo `detail`. Playbook: `data/catalog-migration/handcraft-playbooks/puncao-venosa-e-cuidados-com-cateteres.json` (`review_axes`).

**`meta.sources` (Punção):** sempre `puncao-cateter-anvisa` (tier A) + `potter-perry-fundamentos-11ed-2024` (tier B); adicionar `sae-cofen-358` se documentação AVP; `manual-tecnico-enfermagem-avp` se nomenclatura popular. Enrich: `npm run enrich:puncao-guideline-meta -- --lote=<lote> --write` · código: `lib/catalogMigration/puncaoPedagogy.ts`.

**Cálculo de Medicamentos**

| Ramo | Quando usar |
|------|-------------|
| `calc_dose_equivalencia` | Conta numérica (ml, gotas, regra de três) |
| `calc_conceito` | Definição sem conta |
| `calc_generico` | Demais |

**Doenças Respiratórias Crônicas (Asma, DPOC)**

| Ramo | Quando usar | Molde L3 |
|------|-------------|----------|
| `respiratorio_vf_asma_dpoc` | I/II/III, semiologia V/F | `respiratorio-*` bespoke |
| `respiratorio_dpoc_oxigenio` | SpO₂, O₂ titulado, 88–92%, Venturi | bespoke (spo2-board + trap) |
| `respiratorio_asma_crise` | EXCETO/crise asmática | genérico compare/cards |
| `respiratorio_tecnica_inalador` | MDI, espaçador, peak flow | genérico + `rows` |
| `respiratorio_generico` | Demais | genérico |

**Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)**

| Ramo | Quando usar |
|------|-------------|
| `bacterianas_agente_etiologico` | Agente, transmissão, profilaxia |
| `bacterianas_tuberculose` | TB, DOT, baciloscopia |
| `bacterianas_generico` | Demais |

**Infecções no Contexto da Biossegurança**

| Ramo | Quando usar |
|------|-------------|
| `biosseg_iras_itu_cateter` | IRAS, ITU, cateter |
| `biosseg_generico` | Demais |

**Segurança do Paciente**

| Ramo | Quando usar |
|------|-------------|
| `sp_identificacao` | Pulseira, dupla checagem |
| `sp_prevencao_quedas` | Quedas, escala de risco |
| `sp_eventos_adversos` | Notificação, eventos adversos |
| `sp_metas_internacionais` | Metas OMS / protocolos |
| `sp_generico` | Demais |

**Assistência Perioperatória (Inclui SRPA)**

| Ramo | Quando usar |
|------|-------------|
| `perioperatorio_pre_operatorio` | Jejum, preparo, checklist pré |
| `perioperatorio_pos_operatorio` | Pós-operatório imediato |
| `perioperatorio_protocolo` | Protocolos cirúrgicos |
| `perioperatorio_vf` | V/F perioperatório |
| `perioperatorio_isc` | ISC, infecção de sítio cirúrgico |
| `perioperatorio_generico` | Demais |

**Urgências e Emergências**

| Ramo | Quando usar |
|------|-------------|
| `urgencias_rcp_sbv` | RCP adulto, SBV |
| `urgencias_rcp_pediatrico` | RCP pediátrica |
| `urgencias_avc_iam` | AVC, IAM, tempo-porta |
| `urgencias_xabcde_trauma` | Trauma, ABCDE |
| `urgencias_choque` | Choque, reposição |
| `urgencias_engasgo` | Engasgo, manobra |
| `urgencias_exceto_conduta` | EXCETO em urgência |
| `urgencias_vf_protocolo` | V/F protocolo |
| `urgencias_convulsao` | Convulsão, crise |
| `urgencias_manchester_triagem` | Manchester, triagem |
| `urgencias_anafilaxia` | Anafilaxia |
| `urgencias_queimadura` | Queimadura aguda |
| `urgencias_generico` | Demais |

**Curativos e Manejo de Feridas**

| Ramo | Quando usar |
|------|-------------|
| `curativos_cobertura_selecao` | Escolha de cobertura (bespoke) |
| `curativos_ferida_cirurgica` | FO, ferida cirúrgica |
| `curativos_lpp` | LPP, escala Braden |
| `curativos_tecnica_assepsia` | Técnica, assepsia |
| `curativos_desbridamento` | Desbridamento |
| `curativos_exceto_incorreta` | EXCETO curativos |
| `curativos_estomia` | Estomia |
| `curativos_bandagem_imobilizacao` | Bandagem, imobilização |
| `curativos_dreno` | Dreno |
| `curativos_termoterapia` | Termoterapia |
| `curativos_generico` | Demais |

**Feridas e Queimaduras**

| Ramo | Quando usar |
|------|-------------|
| `feridas_grau_profundidade` | Grau 1º–3º |
| `feridas_scq_calculo` | SCQ, superfície corporal |
| `feridas_scq_regra9` | Regra dos 9 |
| `feridas_grande_queimado` | Grande queimado |
| `feridas_atendimento_inicial` | Atendimento inicial |
| `feridas_classificacao` | Classificação |
| `feridas_cicatrizacao` | Cicatrização |
| `feridas_curativo_tipo` | Tipo de curativo |
| `feridas_generico` | Demais |

**Saúde da Mulher**

| Ramo | Quando usar |
|------|-------------|
| `mulher_prenatal` | Pré-natal, consultas |
| `mulher_parto` | Parto, fases |
| `mulher_papanicolau` | Papanicolau, rastreio |
| `mulher_mama` | Mama, autoexame |
| `mulher_puerperio` | Puerpério |
| `mulher_planejamento` | Planejamento familiar |
| `mulher_generico` | Demais |

**Saúde da Criança**

| Ramo | Quando usar |
|------|-------------|
| `crianca_aleitamento_nutricao` | Aleitamento, nutrição |
| `crianca_triagem_neonatal` | Teste do pezinho, triagem |
| `crianca_neonatologia` | RN, cuidados neonatais |
| `crianca_aps_puericultura` | Puericultura APS |
| `crianca_desenvolvimento` | Marcos do desenvolvimento |
| `crianca_desidratacao` | Desidratação, sinais |
| `crianca_generico` | Demais |

**História da Enfermagem**

| Ramo | Quando usar |
|------|-------------|
| `historia_nightingale` | Nightingale, reforma sanitária |
| `historia_humanizacao` | Humanização |
| `historia_comunicacao_etica` | Comunicação, ética |
| `historia_generico` | Demais |

**Enfermagem do Trabalho**

| Ramo | Quando usar |
|------|-------------|
| `trabalho_vf_nr32` | V/F NR-32, biossegurança |
| `trabalho_pep_trap` | PEP, acidente perfurocortante |
| `trabalho_nr15_reference` | NR-15, insalubridade |
| `trabalho_ergonomia` | Ergonomia, LER/DORT |
| `trabalho_generico` | Demais |

**Língua Portuguesa** — cards vitrine PT (ramos wired no código: `pt_crase`, `pt_pronomes_colocacao` + variantes `_generico`)

Tabela completa (16+ ramos, decisão L3, briefs): `.cursor/skills/brief-lingua-portuguesa/reference-ramos.md` · playbook: `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json`.

| Ramo (wired L3) | Quando usar | Molde L3 |
|-----------------|-------------|----------|
| `pt_crase` | Crase, testes a/à | `pt-crase-funnel` bespoke |
| `pt_crase_generico` | Crase sem sinal forte | genérico |
| `pt_pronomes_colocacao` | Próclise, ênclise, mesóclise | `pt-clitic-rail` bespoke |
| `pt_pronomes_colocacao_generico` | Colocação sem cluster forte | genérico |

Demais eixos PT (`pt_pontuacao`, `pt_termos_oracao`, `pt_exceto_incorreta`, …): ver `reference-ramos.md` — declarar `pedagogical_branch` quando o playbook/cluster exigir.

**Subtópicos sem ramos em `BRANCH_DESIGN_MAP`** (ex.: Noções de Anatomia, ISTs, Sinais Vitais sem playbook): não enviar `pedagogical_branch`; só L1+L2 + design automático por `meta.subtopico`.

### Conteúdo por tipo de ramo

| Tipo | `concept_map` | `golden_rule` | `logic_flow` | `danger_zone` |
|------|---------------|---------------|--------------|---------------|
| **VF bespoke** | ≥3 itens temáticos (não genéricos) | `rows[]` quando molde exige tabela | I/II/III + `tap` | `correct` por distrator; layout compare/trap |
| **EXCETO / crise** | enquadramento do comando | `banner` ou mnemônico curto | passos por letra correta + gabarito | `correct` **semântico** (não precisa “Gabarito letra X”) |
| **Protocolo / O₂** | caso clínico ancorado | `rows` com alvos (ex. SpO₂ 88–92%) | decisão sequencial `tap` | pegadinhas do protocolo |
| **Genérico** | morphological | `center` ou `reference_table` | `vertical` ou `cards` + `tap` | `compare` com `correct` distintos |

### Anti-padrões L3

- Ramo **VF bespoke** com slides só genéricos → `mold_l3_unresolved_bespoke` no gate.
- Ramo **crise/EXCETO** com vocabulário de duel-deck/SpO₂ sem âncora no enunciado → drift ou molde errado.
- Mesmo `correct` em dois itens do `danger_zone` → bloqueio semântico.
- `pedagogical_branch` declarado ≠ conteúdo inferível → revisar ramo ou texto.

### Checklist A1 + A2 + A3 (entregar num prompt só)

**A1 — Estrutural**

- [ ] `QuestaoCompletaSchema`; 4 slides planos na **ordem v2**; `subtopico` canônico; sem TecConcursos

**A2 — Conteúdo golden-v1**

- [ ] `content_standard`, `family` (via `avant-classify-family`), `content_review`, `sources[]`
- [ ] Sem stub; texto específico desta prova; `logic_flow` com `tap`
- [ ] `logic_flow`: último step = **fixação portátil** (regra transferível, não o gabarito sozinho)
- [ ] `danger_zone`: **1 item por cada letra errada** + cada `correct` único + **≥1 item de transferência** separado ("Em outra banca…")
- [ ] Densidade: `detail` / `step` / `value` no alvo ≤110 chars (duro ≤140) — ver âncora-handcraft §3b
- [ ] Sem spoiler: `golden_rule` sem row de gabarito (`golden_rule_gabarito_spoiler` sob strict-v2); `concept_map` sem item de gabarito
- [ ] EXCETO/INCORRETA conforme regra premium (distrator = por que é correto)
- [ ] Eixo mental coerente: não misturar dois eixos clínicos no mesmo card

**A3 — Experiência / ramo**

- [ ] `pedagogical_branch` declarado (se subtópico na tabela)
- [ ] Slots compatíveis com o pacote L3 do ramo (≥3 items, rows se bespoke, etc.)
- [ ] Sem `template` / `layout_variant`

**Validação automática (rodar antes de entregar)**

```bash
npm run audit:questao-readiness -- --file=<caminho-do-json>
# strict pedagógico (handcraft novo):
npm run audit:questao-readiness -- --file=<caminho> --strict-v2-pedagogy
# ou, no lote:
npm run audit:questao-readiness -- --lote=<pacote>-gNN
```

Critério: linha `[READY]` e `ready_100: true` no relatório `artifacts/questao-readiness-audit.json`.  
A4 (piloto humano em `/estudar/[slug]`) fica fora do JSON.

---

## Referência completa

- `.cursor/skills/avant-classify-family/SKILL.md` — funil `meta.family` (fonte: `lib/catalogMigration/classifyFamily.ts`)
- `docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md` — famílias pedagógicas, ordem v2, anti-repetição
- `.cursor/skills/avant-golden-anchor-handcraft/SKILL.md` — family → âncora → slots (handcraft L2)
- `docs/GOLDEN_CONTENT_STANDARD.md` — padrão canônico golden-v1 (slots, fontes, lint)
- `docs/MOLD_AFFINITY_RESOLVER.md` — ramos L3, gate B, backfill, matriz P0–P3
- `lib/slides/pedagogicalBranch.ts` — `PedagogicalBranchId` + `BRANCH_DESIGN_MAP` (fonte viva)
- `data/catalog-migration/handcraft-playbooks/` — ramos + âncoras por pacote
- `docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md` (§12 cabeçalho · §13 shell)
- `docs/AVANT_AGENT_SOURCES.md`
- `examples/_TEMPLATE-golden-v1.json` — molde golden-v1 com ordem v2
- `examples/questao-premium-urgencias-rcp.json` — exemplo golden premium completo
- Rule: `.cursor/rules/avant-agent-json.mdc` (cópia: `docs/cursor/avant-agent-json.mdc`)
