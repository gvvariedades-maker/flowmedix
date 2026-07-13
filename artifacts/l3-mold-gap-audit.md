# Auditoria L3 — gap de moldes

Gerado em: 2026-07-11T23:05:09.678Z

## Resumo

| Métrica | Valor |
|---------|-------|
| Fonte slugs | Supabase (vivo) |
| Clusters mapeados | 182 |
| Slugs auditados | 145 |
| ok_existente | 18 |
| ok_generico | 94 |
| ramo_novo | 47 |
| molde_inedito | 14 |
| Pacotes inéditos únicos | 10 |
| Slugs com mismatch L3 | 0 |

## Candidatos a molde inédito (pacote de 4 variantes)

### Enfermagem em Central de Material e Esterilização (CME) — Autoclave e métodos de esterilização
- **Slugs:** 10 · **Ramo:** `cme_autoclave_metodos`
- **Pacote proposto:** morphological · reference_table · vertical · compare (genérico) — ou pacote inédito parâmetros/ciclo
- Parâmetros de ciclo — tabela pode bastar; molde inédito só se interação espacial repetir em provas.

### Urgências e Emergências — Default — sem âncora temática
- **Slugs:** 63 · **Ramo:** `urgencias_generico`
- **Pacote proposto:** urgencias-emergency-hub · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)
- Bucket residual — emergency hub + protocol pack.

### Urgências e Emergências — Urgências — conceito geral
- **Slugs:** 45 · **Ramo:** `urgencias_generico`
- **Pacote proposto:** urgencias-emergency-hub · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)
- Bucket residual — emergency hub + protocol pack.

### Urgências e Emergências — AVC / IAM — reconhecimento
- **Slugs:** 23 · **Ramo:** `urgencias_avc_iam`
- **Pacote proposto:** urgencias-stroke-signs-deck · urgencias-cincinnati-board · urgencias-stroke-elimination-tap · urgencias-stroke-trap-arena (bespoke)
- Cincinnati Face·Arms·Speech — pegadinhas Glasgow/IAM/SSVV (âncora AMAUC).

### Urgências e Emergências — EXCETO / INCORRETA — conduta
- **Slugs:** 22 · **Ramo:** `urgencias_exceto_conduta`
- **Pacote proposto:** urgencias-exceto-rail · urgencias-exceto-reference-board · urgencias-exceto-tap-flow · urgencias-exceto-trap-arena (bespoke)
- EXCETO conduta — rail semântico por letra (âncora ADM&TEC fratura exposta).

### Urgências e Emergências — XABCDE / trauma e hemorragia
- **Slugs:** 22 · **Ramo:** `urgencias_xabcde_trauma`
- **Pacote proposto:** urgencias-xabcde-rail · urgencias-trauma-reference-board · urgencias-xabcde-tap-flow · urgencias-trauma-trap-arena (bespoke)
- Trilho XABCDE pré-hospitalar — trauma ≠ cadeia RCP (âncoras AMEOSC/SELECON).

### Urgências e Emergências — Choque / hipoperfusão
- **Slugs:** 18 · **Ramo:** `urgencias_choque`
- **Pacote proposto:** urgencias-shock-types-deck · urgencias-shock-reference-board · urgencias-shock-tap-flow · urgencias-shock-trap-arena (bespoke)
- Tipos de choque + segurança da cena — matriz mecanismo × conduta.

### Urgências e Emergências — Engasgo / obstrução de via aérea
- **Slugs:** 12 · **Ramo:** `urgencias_engasgo`
- **Pacote proposto:** urgencias-choking-signal-deck · urgencias-heimlich-board · urgencias-choking-tap-flow · urgencias-choking-trap-arena (bespoke)
- Sinal universal × manobra Heimlich — metáfora espacial (âncora FAU).

### Urgências e Emergências — RCP pediátrica / lactente
- **Slugs:** 9 · **Ramo:** `urgencias_rcp_pediatrico`
- **Pacote proposto:** urgencias-pediatric-rcp-deck · urgencias-pediatric-params-board · urgencias-pediatric-tap-flow · urgencias-pediatric-trap-arena (bespoke)
- RCP pediátrica 15:2 — separar visualmente do adulto 30:2 (âncora ACCESS).

### Urgências e Emergências — V/F — protocolos I/II/III
- **Slugs:** 8 · **Ramo:** `urgencias_vf_protocolo`
- **Pacote proposto:** urgencias-protocol-rules-deck · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)
- V/F I–IV combinatório — protocol rules deck (brief L3).

### Urgências e Emergências — Convulsão / crise epiléptica
- **Slugs:** 7 · **Ramo:** `urgencias_convulsao`
- **Pacote proposto:** urgencias-protocol-rules-deck · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)
- Crise epiléptica — protocol rules deck (âncora ADM&TEC).

### Urgências e Emergências — Manchester / triagem de risco
- **Slugs:** 4 · **Ramo:** `urgencias_manchester_triagem`
- **Pacote proposto:** urgencias-manchester-spectrum · urgencias-manchester-board · cards · urgencias-manchester-trap (bespoke)
- Espectro de cores Manchester — erro espacial (etiqueta vermelha × demais).

### Urgências e Emergências — Anafilaxia / epinefrina
- **Slugs:** 1 · **Ramo:** `urgencias_anafilaxia`
- **Pacote proposto:** urgencias-protocol-rules-deck · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)
- Anafilaxia — epinefrina IM × IV (âncora CPCON).

### Urgências e Emergências — Queimadura — primeiro socorro
- **Slugs:** 1 · **Ramo:** `urgencias_queimadura`
- **Pacote proposto:** urgencias-protocol-rules-deck · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)
- Primeiro socorro queimadura — protocol trap (âncora AMEOSC V/F).

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
| Doenças Respiratórias Crônicas (Asma, DPOC) | Oximetria de pulso / SpO₂ | 3 | 23.1% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | DPOC na UBS — papel do técnico | 2 | 15.4% | ok_existente | `respiratorio_dpoc_oxigenio` | respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-referen… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | O₂ titulado na DPOC (APS/emergência) | 2 | 15.4% | ok_existente | `respiratorio_dpoc_oxigenio` | respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-referen… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Respiratório crônico — conceito geral | 1 | 7.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Outros / tema misto | 1 | 7.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Espaçador e inalador — técnica MDI | 1 | 7.7% | ok_generico | `respiratorio_tecnica_inalador` | morphological · reference_table · cards · compare (genérico)… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Espirometria VEF1/CVF | 1 | 7.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Semiologia pediátrica — sibilos | 1 | 7.7% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Doenças Respiratórias Crônicas (Asma, DPOC) | Semiologia respiratória V/F | 1 | 7.7% | ok_existente | `respiratorio_vf_asma_dpoc` | respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-referen… |
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
| Verificação de Sinais Vitais | PA — técnica e interpretação | 196 | 55.4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | FC e pulso — faixas e técnica | 40 | 11.3% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | Temperatura — vias e febre | 33 | 9.3% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | EXCETO/INCORRETA — técnica SV | 20 | 5.6% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | FR e padrão respiratório | 16 | 4.5% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | SV geral / múltiplos parâmetros | 14 | 4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | Certo ou errado | 10 | 2.8% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | V/F — faixas de referência (I/II/III) | 9 | 2.5% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | SpO₂ e oximetria | 5 | 1.4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | Faixas pediátricas por idade | 5 | 1.4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | Glasgow / escala de coma | 4 | 1.1% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Verificação de Sinais Vitais | Drift taxonômico — reclassificar subtópico | 2 | 0.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Vias de Administração | Técnica de punção IM/IV | 68 | 28.9% | ok_generico | `via_tecnica_admin` | morphological · banner · cards · compare (genérico)… |
| Vias de Administração | V/F — absorção e perfil de vias | 57 | 24.3% | molde_redesign | `via_vf_absorcao` | absorption-speed-rail · via-reference-board · via-vf-juggle-… |
| Vias de Administração | Absorção / farmacocinética (CORRETA) | 26 | 11.1% | molde_redesign | `via_vf_absorcao` | absorption-speed-rail · via-reference-board · via-vf-juggle-… |
| Vias de Administração | Perfis de via | 25 | 10.6% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Vias de Administração | Indicação da via (velocidade SC/IM/IV) | 19 | 8.1% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Vias de Administração | INCORRETA / EXCETO | 18 | 7.7% | ok_generico | `via_generico` | morphological · center · vertical · compare (genérico)… |
| Vias de Administração | Default — sem âncora temática | 11 | 4.7% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Vias de Administração | Certo ou errado | 8 | 3.4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Vias de Administração | 1ª passagem hepática / biodisponibilidade | 3 | 1.3% | molde_redesign | `via_vf_absorcao` | absorption-speed-rail · via-reference-board · via-vf-juggle-… |
| Cuidados na Administração de Medicamentos | Default — sem âncora temática | 28 | 22.8% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | Alto risco / conferência dupla | 19 | 15.4% | molde_redesign | `cam_certos_vf_caso` | cam-certos-deck · cam-nine-rights-board · cam-vf-juggle-tap … |
| Cuidados na Administração de Medicamentos | V/F — 9 certos em caso clínico | 18 | 14.6% | molde_redesign | `cam_certos_vf_caso` | cam-certos-deck · cam-nine-rights-board · cam-vf-juggle-tap … |
| Cuidados na Administração de Medicamentos | Documentação / registro | 16 | 13% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | INCORRETA / EXCETO | 9 | 7.3% | molde_redesign | `cam_exceto_conduta` | cam-exceto-rail · cam-exceto-reference-board · cam-exceto-ta… |
| Cuidados na Administração de Medicamentos | Vigilância / reações adversas | 7 | 5.7% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | Preparo / sala de medicação | 6 | 4.9% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | V/F — protocolo MS / I–VI | 5 | 4.1% | molde_redesign | `cam_certos_vf_caso` | cam-certos-deck · cam-nine-rights-board · cam-vf-juggle-tap … |
| Cuidados na Administração de Medicamentos | Horário / aprazamento | 5 | 4.1% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | Prescrição ilegível / dúvida | 3 | 2.4% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | Certo ou errado | 2 | 1.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | Orientação ao paciente | 2 | 1.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Cuidados na Administração de Medicamentos | Nove certos — listagem | 2 | 1.6% | molde_redesign | `cam_certos_vf_caso` | cam-certos-deck · cam-nine-rights-board · cam-vf-juggle-tap … |
| Cuidados na Administração de Medicamentos | LASA / nomes semelhantes | 1 | 0.8% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Urgências e Emergências | RCP / SBV adulto (V/F ou protocolo) | 68 | 20% | molde_redesign | `urgencias_rcp_sbv` | urgencias-survival-chain-deck · urgencias-rcp-params-board ·… |
| Urgências e Emergências | Default — sem âncora temática | 63 | 18.5% | molde_inedito | `urgencias_generico` | urgencias-emergency-hub · urgencias-protocol-reference-board… |
| Urgências e Emergências | Urgências — conceito geral | 45 | 13.2% | molde_inedito | `urgencias_generico` | urgencias-emergency-hub · urgencias-protocol-reference-board… |
| Urgências e Emergências | Certo ou errado | 32 | 9.4% | ok_generico | `urgencias_generico` | morphological · reference_table · vertical · compare (genéri… |
| Urgências e Emergências | AVC / IAM — reconhecimento | 23 | 6.8% | molde_inedito | `urgencias_avc_iam` | urgencias-stroke-signs-deck · urgencias-cincinnati-board · u… |
| Urgências e Emergências | EXCETO / INCORRETA — conduta | 22 | 6.5% | molde_inedito | `urgencias_exceto_conduta` | urgencias-exceto-rail · urgencias-exceto-reference-board · u… |
| Urgências e Emergências | XABCDE / trauma e hemorragia | 22 | 6.5% | molde_inedito | `urgencias_xabcde_trauma` | urgencias-xabcde-rail · urgencias-trauma-reference-board · u… |
| Urgências e Emergências | Choque / hipoperfusão | 18 | 5.3% | molde_inedito | `urgencias_choque` | urgencias-shock-types-deck · urgencias-shock-reference-board… |
| Urgências e Emergências | Engasgo / obstrução de via aérea | 12 | 3.5% | molde_inedito | `urgencias_engasgo` | urgencias-choking-signal-deck · urgencias-heimlich-board · u… |
| Urgências e Emergências | RCP pediátrica / lactente | 9 | 2.6% | molde_inedito | `urgencias_rcp_pediatrico` | urgencias-pediatric-rcp-deck · urgencias-pediatric-params-bo… |
| Urgências e Emergências | V/F — protocolos I/II/III | 8 | 2.4% | molde_inedito | `urgencias_vf_protocolo` | urgencias-protocol-rules-deck · urgencias-protocol-reference… |
| Urgências e Emergências | Convulsão / crise epiléptica | 7 | 2.1% | molde_inedito | `urgencias_convulsao` | urgencias-protocol-rules-deck · urgencias-protocol-reference… |
| Urgências e Emergências | Drift taxonômico — reclassificar subtópico | 5 | 1.5% | ok_generico | `urgencias_generico` | morphological · reference_table · vertical · compare (genéri… |
| Urgências e Emergências | Manchester / triagem de risco | 4 | 1.2% | molde_inedito | `urgencias_manchester_triagem` | urgencias-manchester-spectrum · urgencias-manchester-board ·… |
| Urgências e Emergências | Anafilaxia / epinefrina | 1 | 0.3% | molde_inedito | `urgencias_anafilaxia` | urgencias-protocol-rules-deck · urgencias-protocol-reference… |
| Urgências e Emergências | Queimadura — primeiro socorro | 1 | 0.3% | molde_inedito | `urgencias_queimadura` | urgencias-protocol-rules-deck · urgencias-protocol-reference… |
| Imunização | Calendário vacinal — adolescente/adulto/idoso | 137 | 23.8% | ok_generico | `imunizacao_calendario` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | Calendário vacinal — infantil | 135 | 23.5% | ok_generico | `imunizacao_calendario` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | Cadeia de frio / conservação / SI-PNI | 68 | 11.8% | ok_generico | `imunizacao_cadeia_frio` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | HPV / campanhas e prevenção | 46 | 8% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | INCORRETA / EXCETO | 42 | 7.3% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | Default — sem âncora temática | 41 | 7.1% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | Gestante / puérpera — vacinação | 40 | 7% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | Certo ou errado | 28 | 4.9% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | V/F — intervalos PNI (I/II/III/IV) | 18 | 3.1% | ok_existente | `imunizacao_vf_intervalos` | pni-rules-deck · pni-interval-matrix · pni-vf-juggle-tap · p… |
| Imunização | Técnica de aplicação / sala de vacinação | 11 | 1.9% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | Conceito — tipos de vacina / imunobiológicos | 8 | 1.4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Imunização | Contraindicações / eventos adversos | 1 | 0.2% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | Pré-natal / gestação | 75 | 28.5% | ok_existente | `mulher_prenatal` | mulher-gestation-timeline · mulher-prenatal-board · mulher-p… |
| Saúde da Mulher | Parto / trabalho de parto | 62 | 23.6% | ok_existente | `mulher_parto` | mulher-labor-phase-deck · mulher-parto-humanizado-board · mu… |
| Saúde da Mulher | Rastreio câncer de colo | 37 | 14.1% | ok_existente | `mulher_papanicolau` | mulher-screening-spectrum · mulher-papanicolau-board · mulhe… |
| Saúde da Mulher | Saúde da mama | 28 | 10.6% | ok_existente | `mulher_mama` | mulher-mammography-spectrum · mulher-mama-board · mulher-mam… |
| Saúde da Mulher | Saúde da mulher — conceito geral | 13 | 4.9% | ok_generico | `mulher_generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | Anatomia feminina (drift?) | 13 | 4.9% | ok_generico | `mulher_generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | Puerpério / lactação | 9 | 3.4% | ok_existente | `mulher_puerperio` | mulher-puerperio-timeline · mulher-puerperio-board · mulher-… |
| Saúde da Mulher | Planejamento familiar / contracepção | 7 | 2.7% | ok_existente | `mulher_planejamento` | mulher-contraception-spectrum · mulher-planejamento-board · … |
| Saúde da Mulher | Semiologia (drift?) | 6 | 2.3% | ok_generico | `mulher_generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | Climatério / menopausa | 3 | 1.1% | ok_generico | `mulher_generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | IST na gestação | 3 | 1.1% | ok_existente | `mulher_prenatal` | mulher-gestation-timeline · mulher-prenatal-board · mulher-p… |
| Saúde da Mulher | Violência contra a mulher | 3 | 1.1% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | Ciclo menstrual / amenorreia | 2 | 0.8% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | Coleta de exames (drift?) | 1 | 0.4% | ok_generico | `mulher_generico` | morphological · reference_table · vertical · compare (genéri… |
| Saúde da Mulher | Epidemiologia (drift?) | 1 | 0.4% | ok_generico | `mulher_generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Flebite e complicações | 19 | 17.3% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Dispositivo / calibre / jelco | 12 | 10.9% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | EXCETO — técnica / conduta | 12 | 10.9% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Tempo / observação pós-procedimento | 11 | 10% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Punção venosa periférica | 10 | 9.1% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Antissepsia na punção | 8 | 7.3% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Técnica de punção periférica | 7 | 6.4% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Protocolo / procedimento | 6 | 5.5% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Manutenção de cateter | 5 | 4.5% | ramo_novo | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Prevenção de IPCS no CVC | 4 | 3.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Certo ou errado | 4 | 3.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Default — sem âncora temática | 4 | 3.6% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Cálculo / dose / tempo numérico | 2 | 1.8% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | V/F — assertivas I/II/III | 2 | 1.8% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Acesso venoso central | 2 | 1.8% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Acesso arterial / PAM | 1 | 0.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |
| Punção Venosa e Cuidados com Cateteres | Medicação endovenosa — técnica | 1 | 0.9% | ok_generico | `generico` | morphological · reference_table · vertical · compare (genéri… |

## Slugs (amostra com branch inferido)

- `—`: 145