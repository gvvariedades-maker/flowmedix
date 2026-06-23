# Plano de aprofundamento máximo — Guidelines por subtópico

Gerado em: 2026-06-22T16:26:40.028Z
Auditoria base: 2026-06-22T16:26:38.672Z (modulos_estudo)

## North star

Aprofundamento máximo = extração literal tier A por tema do edital, não só contagem; meta ≥15 entries/100 questões ou target_merged_entries do spec.

**Estado atual (baseline expandido):** 636 entries, 41/41 mapeados, registry `extracted`.
**Gap total estimado:** 0 entries até as metas deste plano.

## Workflow por subtópico

- 1. Escolher subtópico da fase (ordenado por priority_score).
- 2. Extrair entries dos sources_tier_a — um bloco por edital_theme.
- 3. Codificar em lib/guidelines/<pacote>.ts com sourceId estável.
- 4. Rodar npm test (slideGeneration factcheck + guidelineCoverage).
- 5. npm run audit:guideline-coverage → gap_entries → 0 para o subtópico.
- 6. npm run update:guideline-status se novas tabelas/merge.
- 7. Piloto 5–10 slugs no player + lote IA se subtópico tem builder.

## Fases

### Fase 1 — Crítico (volume × gap)

| Subtópico | Questões | Atual | Meta | Gap | Banda |
|-----------|--------:|------:|-----:|----:|-------|
| Imunização | 575 | 90 | 90 | 0 | adequado |
| Verificação de Sinais Vitais | 482 | 75 | 75 | 0 | adequado |
| Urgências e Emergências | 348 | 55 | 55 | 0 | adequado |

### Fase 2 — Alto volume moderado

| Subtópico | Questões | Atual | Meta | Gap | Banda |
|-----------|--------:|------:|-----:|----:|-------|
| Saúde da Mulher | 262 | 45 | 45 | 0 | adequado |
| Cuidados na Administração de Medicamentos | 216 | 40 | 40 | 0 | adequado |
| Oxigenoterapia e Cuidados Respiratórios | 172 | 35 | 35 | 0 | adequado |
| Atenção Básica / Saúde da Família | 170 | 35 | 35 | 0 | adequado |
| Instalação e Manejo de Sondas | 169 | 35 | 35 | 0 | adequado |
| Coleta de Exames Laboratoriais | 159 | 35 | 35 | 0 | adequado |
| Processo de Enfermagem | 134 | 35 | 35 | 0 | adequado |
| Cálculo de Administração de Medicamentos e Infusões | 114 | 35 | 35 | 0 | adequado |

### Fase 3 — Complementar / adequar meta

| Subtópico | Questões | Atual | Meta | Gap | Banda |
|-----------|--------:|------:|-----:|----:|-------|
| Epidemiologia e Vigilância Epidemiológica | 224 | 66 | 40 | 0 | adequado |
| Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.) | 135 | 63 | 50 | 0 | adequado |
| Promoção à Saúde e Prevenção de Agravos | 124 | 30 | 30 | 0 | adequado |
| Enfermagem em Centro Cirúrgico | 122 | 30 | 30 | 0 | adequado |
| Segurança do Paciente | 91 | 30 | 30 | 0 | adequado |
| Saúde da Criança | 81 | 93 | 45 | 0 | adequado |
| Infecções Sexualmente Transmissíveis (ISTs) | 76 | 30 | 30 | 0 | adequado |
| Medidas de Prevenção e Precaução de Contato | 71 | 30 | 30 | 0 | adequado |
| Assistência Perioperatória (Inclui SRPA) | 68 | 30 | 30 | 0 | adequado |
| Doenças Parasitárias e Zoonoses | 62 | 28 | 28 | 0 | adequado |
| Infecções no Contexto da Biossegurança | 54 | 30 | 30 | 0 | adequado |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | 51 | 50 | 40 | 0 | adequado |
| Enfermagem do Trabalho | 48 | 25 | 25 | 0 | adequado |
| Saúde Mental | 37 | 25 | 25 | 0 | adequado |
| Enfermagem em Central de Material e Esterilização (CME) | 35 | 28 | 28 | 0 | adequado |
| Feridas e Queimaduras | 26 | 50 | 30 | 0 | adequado |
| Farmacodinâmica e Farmacocinética | 25 | 30 | 30 | 0 | adequado |
| Processamento de Artigos e Produtos de Saúde | 18 | 28 | 28 | 0 | adequado |
| Saúde do Adolescente | 16 | 25 | 25 | 0 | adequado |
| Doenças Respiratórias Crônicas (Asma, DPOC) | 10 | 50 | 35 | 0 | adequado |

### Fase 0 — Manter (revisão pontual)

| Subtópico | Questões | Atual | Meta | Gap | Banda |
|-----------|--------:|------:|-----:|----:|-------|
| Vias de Administração | 231 | 58 | 40 | 0 | adequado |
| Curativos e Manejo de Feridas | 122 | 35 | 35 | 0 | adequado |
| Procedimentos Diversos | 118 | 45 | 35 | 0 | adequado |
| Punção Venosa e Cuidados com Cateteres | 116 | 52 | 40 | 0 | adequado |
| Mobilização e Posicionamento do Paciente | 91 | 49 | 30 | 0 | adequado |

### Fase 4 — Conceitual / reclassificação

| Subtópico | Questões | Atual | Meta | Gap | Banda |
|-----------|--------:|------:|-----:|----:|-------|
| Noções de Anatomia | 103 | 25 | 25 | 0 | adequado |
| Noções de Fisiologia | 89 | 89 | 30 | 0 | adequado |
| História da Enfermagem | 18 | 22 | 22 | 0 | adequado |
| Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis | 6 | 123 | 50 | 0 | adequado |
| Questões Mescladas e Outras Doenças Agudas | 0 | 100 | 40 | 0 | sem_guideline |

## Detalhe — Fase 1 (prioridade imediata)

### Imunização

- **Gap:** 0 entries (atual 90 → meta 90)
- **Tabelas:** `pni-2025-intervalos` + `pni-calendario-2025`
- **Temas do edital:**
  - Calendário nacional por idade (criança, adolescente, adulto, idoso, gestante)
  - Intervalos entre vacinas (vivas, inativadas, grace period 4 dias)
  - Contraindicações e eventos adversos
  - Cadeia de frio (2–8 °C, validade aberta, descarte)
  - Técnicas de aplicação (via, local, dose)
  - Bloqueio vacinal e surtos (sarampo, FA)
  - Registros SIS/PNI e erros de imunização
- **Fontes tier A:**
  - Manual PNI 2025 — intervalos e procedimentos
  - Calendário Nacional de Vacinação 2025
  - Manual da Rede de Frio (MS)
- **DoD:** Toda vacina do calendário infantil/adulto com idade, dose, via e intervalo; factcheck PNI sem violações em lote piloto ≥20 slugs.

### Verificação de Sinais Vitais

- **Gap:** 0 entries (atual 75 → meta 75)
- **Tabelas:** `sv-adulto-referencia`
- **Temas do edital:**
  - Técnica de aferição (PA, FC, FR, Temp, SpO₂)
  - Faixas adulto, idoso, gestante
  - Faixas pediátricas por idade (RN, lactente, pré-escolar, escolar, adolescente)
  - PA — métodos e valores (SBC/MS)
  - Escalas (APGAR, Glasgow, dor EVA)
  - Interpretação clínica e conduta inicial
  - Registro e frequência de monitorização
- **Fontes tier A:**
  - Protocolos MS de aferição de sinais vitais
  - Diretriz brasileira de hipertensão (SBC) — valores PA
  - SBP — referências pediátricas
- **DoD:** Cada parâmetro × faixa etária com valor numérico; cobertura gestante/idoso; testes factcheck SV golden FEPese/CPCON passam.

### Urgências e Emergências

- **Gap:** 0 entries (atual 55 → meta 55)
- **Tabelas:** `urgencias-rcp-sbv-ms`
- **Temas do edital:**
  - XABCDE / avaliação primária
  - RCP adulto e pediátrico (30:2, 15:2, DEA)
  - Via aérea e engasgo
  - Choque (hipovolêmico, séptico — reconhecimento)
  - AVC — FAST e tempo porta
  - Anafilaxia e adrenalina
  - Hemorragia e torniquete
  - SAMU 192 e segurança da cena
- **Fontes tier A:**
  - Protocolo SBV/RCP MS SAMU 192
  - Diretrizes AHA/ILCOR adotadas pelo MS
  - Protocolos MS urgência/emergência
- **DoD:** Além de RCP: 3+ protocolos não-RCP com números; factcheck lote urgências sem falsos positivos.

## Relação com pacote premium

Aprofundamento de guideline é **trilho B** (transição / IA / factcheck). Não substitui nem precede o pacote premium (golden + builder + moldes). Ver [`FONTE_NORMATIVA_AVANT.md`](FONTE_NORMATIVA_AVANT.md).

## Referências

- Especificação: [`lib/guidelines/deepeningPlan.ts`](../lib/guidelines/deepeningPlan.ts)
- Auditoria: [`artifacts/guideline-coverage-audit.json`](../artifacts/guideline-coverage-audit.json)
- Código: [`lib/guidelines/`](../lib/guidelines/) · [`SUBTOPICO_GUIDELINE_IDS`](../lib/guidelines/index.ts)
- Registry: `npm run update:guideline-status` · `npm run refresh:guideline-counts`
