# Auditoria L3 — gap de moldes

Gerado em: 2026-07-02T00:07:14.634Z

## Resumo

| Métrica | Valor |
|---------|-------|
| Fonte slugs | lotes locais |
| Clusters mapeados | 87 |
| Slugs auditados | 1002 |
| ok_existente | 11 |
| ok_generico | 60 |
| ramo_novo | 15 |
| molde_inedito | 1 |
| Pacotes inéditos únicos | 1 |
| Slugs com mismatch L3 | 565 |

## Mismatch por subtópico

| Subtópico | Slugs com mismatch |
|-----------|-------------------|
| Imunização | 553 |
| Saúde Mental | 6 |
| Saúde do Adolescente | 2 |

## Candidatos a molde inédito (pacote de 4 variantes)

### Enfermagem em Central de Material e Esterilização (CME) — Autoclave e métodos de esterilização
- **Slugs:** 10 · **Ramo:** `cme_autoclave_metodos`
- **Pacote proposto:** morphological · reference_table · vertical · compare (genérico) — ou pacote inédito parâmetros/ciclo
- Parâmetros de ciclo — tabela pode bastar; molde inédito só se interação espacial repetir em provas.

## Matriz por cluster

| Subtópico | Cluster | Slugs | % | Decisão | Ramo | Ideal |
|-----------|---------|-------|---|---------|------|-------|
| Assistência Perioperatória (Inclui SRPA) | Pré-operatório / preparo | 21 | 30.9% | ok_generico | `perioperatorio_pre_operatorio` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | Pós-operatório / cuidados | 15 | 22.1% | ok_generico | `perioperatorio_pos_operatorio` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | Protocolo / sequência | 13 | 19.1% | ok_generico | `perioperatorio_protocolo` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | Certo ou errado | 9 | 13.2% | ok_generico | `perioperatorio_vf` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | Default — sem âncora temática | 4 | 5.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | ISC / classificação e prevenção | 2 | 2.9% | ok_generico | `perioperatorio_isc` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | SRPA / atribuição do técnico | 1 | 1.5% | ok_generico | `perioperatorio_pos_operatorio` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | SRPA / CPD e atribuição (C/E) | 1 | 1.5% | ok_generico | `perioperatorio_pos_operatorio` | morphological · reference_table · vertical · compare (genéri… |
| Assistência Perioperatória (Inclui SRPA) | Fases perioperatórias | 1 | 1.5% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
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
| Farmacodinâmica e Farmacocinética | Protocolo / administração clínica (EV, infusão) | 4 | 36.4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Farmacodinâmica e Farmacocinética | Default — sem âncora temática | 2 | 18.2% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Farmacodinâmica e Farmacocinética | Conceito — farmacocinética (ADME) | 2 | 18.2% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Farmacodinâmica e Farmacocinética | Conceito — meia-vida e concentração | 1 | 9.1% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Farmacodinâmica e Farmacocinética | INCORRETA / EXCETO | 1 | 9.1% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Farmacodinâmica e Farmacocinética | Conceito — farmacodinâmica clínica | 1 | 9.1% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
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
| Segurança do Paciente | DRIFT — auditoria/gestão | 16 | 27.1% | ok_generico | `sp_generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Prevenção de quedas | 11 | 18.6% | ok_generico | `sp_prevencao_quedas` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Eventos adversos e incidentes | 9 | 15.3% | ok_generico | `sp_eventos_adversos` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Identificação do paciente | 7 | 11.9% | ok_existente | `sp_identificacao` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | DRIFT — processo de enfermagem | 6 | 10.2% | ok_generico | `sp_generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Segurança do paciente — conceito geral | 2 | 3.4% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Metas internacionais JCI/OMS | 2 | 3.4% | ok_generico | `sp_metas_internacionais` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Segurança na medicação | 1 | 1.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Segurança do paciente — conceito | 1 | 1.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Cultura de segurança | 1 | 1.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Certo ou errado | 1 | 1.7% | ok_generico | `sp_generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Higienização das mãos | 1 | 1.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Segurança do Paciente | Humanização e cuidado | 1 | 1.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |

## Slugs (amostra com branch inferido)

- `imunizacao_calendario`: 553
- `—`: 95
- `biosseg_generico`: 51
- `bacterianas_generico`: 47
- `perioperatorio_pre_operatorio`: 24
- `sp_generico`: 24
- `perioperatorio_pos_operatorio`: 23
- `imunizacao_vf_intervalos`: 19
- `cme_autoclave_metodos`: 17
- `perioperatorio_isc`: 14
- `mental_crise_caps`: 12
- `sp_prevencao_quedas`: 12
- `sp_eventos_adversos`: 11
- `mental_generico`: 10
- `sp_identificacao`: 10
- `cme_generico`: 8
- `mental_raps_legis`: 7
- `farmaco_clinico_protocolo`: 6
- `adolescente_etica_sigilo`: 6
- `cme_preparo_limpeza`: 5
- `perioperatorio_generico`: 5
- `adolescente_antropometria`: 5
- `cme_vf_ce`: 4
- `bacterianas_agente_etiologico`: 4
- `farmaco_generico`: 4
- `biosseg_iras_itu_cateter`: 4
- `imunizacao_generico`: 3
- `mental_depressao`: 3
- `mental_dependencia_tabagismo`: 3
- `perioperatorio_protocolo`: 2
- `adolescente_violencia_protecao`: 2
- `adolescente_generico`: 2
- `mental_aps_acolhimento`: 2
- `sp_metas_internacionais`: 2
- `cme_processamento_conceito`: 1
- `farmaco_pk_pd_vf`: 1
- `adolescente_desenvolvimento`: 1