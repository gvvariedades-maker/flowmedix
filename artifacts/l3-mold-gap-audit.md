# Auditoria L3 — gap de moldes

Gerado em: 2026-06-30T15:49:58.659Z

## Resumo

| Métrica | Valor |
|---------|-------|
| Fonte slugs | Supabase (vivo) |
| Clusters mapeados | 81 |
| Slugs auditados | 68 |
| ok_existente | 11 |
| ok_generico | 50 |
| ramo_novo | 16 |
| molde_inedito | 4 |
| Pacotes inéditos únicos | 4 |
| Slugs com mismatch L3 | 0 |

## Candidatos a molde inédito (pacote de 4 variantes)

### Assistência Perioperatória (Inclui SRPA) — Pré-operatório / preparo
- **Slugs:** 21 · **Ramo:** `perioperatorio_pre_operatorio`
- **Pacote proposto:** procedure-protocol · reference_table · vertical · compare (genérico ou inédito checklist)
- Pré-op com golden âncora — genérico ou checklist inédito se volume sustentar.

### Assistência Perioperatória (Inclui SRPA) — Pós-operatório / cuidados
- **Slugs:** 14 · **Ramo:** `perioperatorio_pos_operatorio`
- **Pacote proposto:** morphological · reference_table · vertical · compare — ou pacote SRPA/aldrete inédito
- SRPA/aldrete — candidato forte a molde espacial (escore, fases).

### Assistência Perioperatória (Inclui SRPA) — Protocolo / sequência
- **Slugs:** 13 · **Ramo:** `perioperatorio_protocolo`
- **Pacote proposto:** procedure-protocol · reference_table · vertical · compare (inédito checklist WHO)
- Protocolo/sequência — checklist interativo repetível.

### Enfermagem em Central de Material e Esterilização (CME) — Autoclave e métodos de esterilização
- **Slugs:** 10 · **Ramo:** `cme_autoclave_metodos`
- **Pacote proposto:** morphological · reference_table · vertical · compare (genérico) — ou pacote inédito parâmetros/ciclo
- Parâmetros de ciclo — tabela pode bastar; molde inédito só se interação espacial repetir em provas.

## Matriz por cluster

| Subtópico | Cluster | Slugs | % | Decisão | Ramo | Ideal |
|-----------|---------|-------|---|---------|------|-------|
| Assistência Perioperatória (Inclui SRPA) | Pré-operatório / preparo | 21 | 30.9% | molde_inedito | `perioperatorio_pre_operatorio` | procedure-protocol · reference_table · vertical · compare (g… |
| Assistência Perioperatória (Inclui SRPA) | Pós-operatório / cuidados | 14 | 20.6% | molde_inedito | `perioperatorio_pos_operatorio` | morphological · reference_table · vertical · compare — ou pa… |
| Assistência Perioperatória (Inclui SRPA) | Protocolo / sequência | 13 | 19.1% | molde_inedito | `perioperatorio_protocolo` | procedure-protocol · reference_table · vertical · compare (i… |
| Assistência Perioperatória (Inclui SRPA) | Certo ou errado | 9 | 13.2% | ramo_novo | `perioperatorio_vf` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | Default — sem âncora temática | 4 | 5.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | ISC / classificação e prevenção | 2 | 2.9% | ramo_novo | `perioperatorio_isc` | wound-stage-tissue-deck · reference_table · vertical · compa… |
| Assistência Perioperatória (Inclui SRPA) | Fases perioperatórias | 2 | 2.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | SRPA / atribuição do técnico | 1 | 1.5% | ramo_novo | `perioperatorio_pos_operatorio` | morphological · reference_table · vertical · compare — ou pa… |
| Assistência Perioperatória (Inclui SRPA) | SRPA / CPD e atribuição (C/E) | 1 | 1.5% | ramo_novo | `perioperatorio_pos_operatorio` | morphological · reference_table · vertical · compare — ou pa… |
| Assistência Perioperatória (Inclui SRPA) | Centro cirúrgico / asséptica | 1 | 1.5% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Enfermagem em Central de Material e Esterilização (CME) | Preparo e limpeza de instrumentais | 12 | 34.3% | ok_generico | `cme_preparo_limpeza` | bridge · minimal · cards · list (genérico)… |
| Enfermagem em Central de Material e Esterilização (CME) | Autoclave e métodos de esterilização | 10 | 28.6% | molde_inedito | `cme_autoclave_metodos` | morphological · reference_table · vertical · compare (genéri… |
| Enfermagem em Central de Material e Esterilização (CME) | Processamento e esterilização — conceito | 4 | 11.4% | ok_generico | `cme_processamento_conceito` | bridge · minimal · cards · list (genérico)… |
| Enfermagem em Central de Material e Esterilização (CME) | Certo ou errado | 4 | 11.4% | ok_generico | `cme_vf_ce` | morphological · reference_table · vertical · compare (genéri… |
| Enfermagem em Central de Material e Esterilização (CME) | INCORRETA / EXCETO | 3 | 8.6% | ok_generico | `cme_generico` | bridge · minimal · cards · list (genérico)… |
| Enfermagem em Central de Material e Esterilização (CME) | Indicadores químicos e biológicos | 1 | 2.9% | ok_generico | `cme_autoclave_metodos` | morphological · reference_table · vertical · compare (genéri… |
| Enfermagem em Central de Material e Esterilização (CME) | CME — conceito geral | 1 | 2.9% | ok_generico | `cme_processamento_conceito` | bridge · minimal · cards · list (genérico)… |
| Saúde Mental | Depressão / epidemiologia | 5 | 13.5% | ok_generico | `mental_depressao` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Dependência química / álcool | 3 | 8.1% | ok_generico | `mental_dependencia_tabagismo` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Esquizofrenia / psicofármacos | 3 | 8.1% | ok_generico | `mental_generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | RAPS / Reforma Psiquiátrica / SRT | 3 | 8.1% | ok_generico | `mental_raps_legis` | bridge · reference_table · vertical · compare (genérico)… |
| Saúde Mental | Tabagismo / PNCT | 3 | 8.1% | ok_generico | `mental_dependencia_tabagismo` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Sono / epilepsia | 3 | 8.1% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Crise / agitação / de-escalada | 2 | 5.4% | ok_existente | `mental_crise_caps` | morphological · center · sae-decision-tap · norm-reveal (bes… |
| Saúde Mental | Acolhimento / biopsicossocial na APS | 2 | 5.4% | ok_generico | `mental_aps_acolhimento` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | CAPS / acolhimento em crise | 2 | 5.4% | ok_existente | `mental_crise_caps` | morphological · center · sae-decision-tap · norm-reveal (bes… |
| Saúde Mental | Redução de danos / entrevista motivacional | 2 | 5.4% | ok_generico | `mental_dependencia_tabagismo` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Certo ou errado | 2 | 5.4% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Default — sem âncora temática | 1 | 2.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | SRT / Reforma Psiquiátrica (dispositivo) | 1 | 2.7% | ok_generico | `mental_raps_legis` | bridge · reference_table · vertical · compare (genérico)… |
| Saúde Mental | Risco suicida / sinais de alerta | 1 | 2.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Agitação / crise / contenção (EXCETO) | 1 | 2.7% | ok_existente | `mental_crise_caps` | morphological · center · sae-decision-tap · norm-reveal (bes… |
| Saúde Mental | EXCETO — conduta / conceito | 1 | 2.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | Demência / Alzheimer | 1 | 2.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde Mental | CAPS / dispositivo de rede | 1 | 2.7% | ok_existente | `mental_crise_caps` | morphological · center · sae-decision-tap · norm-reveal (bes… |
| Saúde do Adolescente | Gravidez / pré-natal / riscos | 2 | 12.5% | ok_existente | `adolescente_etica_sigilo` | adolescent-privacy-curtain · adolescent-sigilo-spectrum · ad… |
| Saúde do Adolescente | Escuta, sigilo e ética (V/F) | 2 | 12.5% | ok_existente | `adolescente_etica_sigilo` | adolescent-privacy-curtain · adolescent-sigilo-spectrum · ad… |
| Saúde do Adolescente | Violência sexual e indicadores | 2 | 12.5% | ok_generico | `adolescente_violencia_protecao` | morphological · reference_table · vertical · compare (genéri… |
| Saúde do Adolescente | Transtornos alimentares / imagem corporal | 2 | 12.5% | ok_generico | `adolescente_saude_mental` | morphological · reference_table · vertical · compare (genéri… |
| Saúde do Adolescente | Diretrizes MS adolescente (EXCETO) | 2 | 12.5% | ok_generico | `adolescente_generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde do Adolescente | Saúde bucal / promoção | 2 | 12.5% | ok_generico | `adolescente_generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Tuberculose — controle, TDO e vigilância | 23 | 45.1% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Outros / tema misto | 6 | 11.8% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Meningite bacteriana | 4 | 7.8% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Agente etiológico — bactéria × vírus × fungo | 4 | 7.8% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Candidíase e micoses | 3 | 5.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Zoonoses (reclassificar?) | 3 | 5.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Hanseníase — transmissão e PQT | 2 | 3.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | IST (reclassificar?) | 2 | 3.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Tétano — profilaxia e imunização | 1 | 2% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Exames laboratoriais (reclassificar?) | 1 | 2% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Bacterioses — conceito geral | 1 | 2% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | Bactérias do trato gastrointestinal | 1 | 2% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Espaçador e inalador — técnica MDI | 1 | 10% | ok_generico | `respiratorio_tecnica_inalador` | morphological · reference_table · cards · compare (genérico)… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Oximetria de pulso / SpO₂ | 1 | 10% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | O₂ titulado na DPOC (APS/emergência) | 1 | 10% | ok_existente | `respiratorio_dpoc_oxigenio` | respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-referen… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Dispositivos de oxigenoterapia (Venturi) | 1 | 10% | ok_existente | `respiratorio_dpoc_oxigenio` | respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-referen… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Asma na APS — educação terapêutica | 1 | 10% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Espirometria VEF1/CVF | 1 | 10% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Semiologia pediátrica — sibilos | 1 | 10% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Semiologia respiratória V/F | 1 | 10% | ok_existente | `respiratorio_vf_asma_dpoc` | respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-referen… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | DPOC na UBS — papel do técnico | 1 | 10% | ok_existente | `respiratorio_dpoc_oxigenio` | respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-referen… |
| Infecções no Contexto da Biossegurança | IRAS / infecção hospitalar (conceitos) | 4 | 16% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Infecções no Contexto da Biossegurança | Higienização das mãos (V/F) | 4 | 16% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Infecções no Contexto da Biossegurança | Precauções padrão e por transmissão | 4 | 16% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Infecções no Contexto da Biossegurança | ITU / cateter vesical (EXCETO) | 4 | 16% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Infecções no Contexto da Biossegurança | Biossegurança e contenção (conceitos) | 4 | 16% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Infecções no Contexto da Biossegurança | Cuidados em paciente imunossuprimido / comorbidades | 4 | 16% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | DRIFT — auditoria/gestão | 19 | 30.6% | ok_generico | `sp_generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Prevenção de quedas | 11 | 17.7% | ok_generico | `sp_prevencao_quedas` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Eventos adversos e incidentes | 9 | 14.5% | ok_generico | `sp_eventos_adversos` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Identificação do paciente | 7 | 11.3% | ok_existente | `sp_identificacao` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | DRIFT — processo de enfermagem | 6 | 9.7% | ok_generico | `sp_generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Segurança do paciente — conceito geral | 2 | 3.2% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Metas internacionais JCI/OMS | 2 | 3.2% | ok_generico | `sp_metas_internacionais` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Segurança na medicação | 1 | 1.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Segurança do paciente — conceito | 1 | 1.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Cultura de segurança | 1 | 1.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Certo ou errado | 1 | 1.6% | ok_generico | `sp_generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Higienização das mãos | 1 | 1.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Humanização e cuidado | 1 | 1.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |

## Slugs (amostra com branch inferido)

- `—`: 68