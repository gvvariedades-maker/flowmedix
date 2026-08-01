# F3 — repair `vf_label`

- comando: `npm run repair:pedagogy-rotulos-vf`
- corpus: catalog
- modo: **dry-run**
- arquivos varridos: 5252
- arquivos que mudariam: 0
- edições: 0
- pulados (fila de handcraft): 1461
- idempotência: OK

## Assinaturas alvo (antes → depois)

| assinatura | antes | depois |
| --- | --- | --- |
| `pedagogy_vf_verdict_spoiler` | 1461 | 1461 |
| `pedagogy_question_bound_label` | 0 | 0 |

## Diff revisável

## Pulados — exigem handcraft

| motivo | caminho | texto |
| --- | --- | --- |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I e III apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: III apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I e II apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: II e III apenas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Auricular. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intratecal. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Intravenosa. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Intradérmica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: I e II , apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: III e IV , apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: II e III , apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: II , apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Oclusivo. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Esfacelo. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Compressivo. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Aberto. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Hidrogel. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Colagenase. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Hidropolímero. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: II , apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: III, apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: I e II, apenas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: um cateter enteral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F, V, F, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V, V, F, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I, II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: II e III, apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I e II, apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Artéria radial. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Artéria ulnar. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Artéria femoral. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Artéria poplítea. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: F, V, V, V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, F, V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V, V, V, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: I e III apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I e II apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: II apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F, V, F, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V, F, F, V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: F, V, V, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Apenas, III e IV. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Apenas, I e II. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Apenas, IV. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Apenas, II e III. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Punho. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Ausculta cardíaca. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Região inguinal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Pescoço. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Timpânica. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Axilar. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Retal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Oral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 2 a 3. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 7 a 9. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 0 a 1. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 4 a 6. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, F, V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V, V, V, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Apenas II e III. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Apenas I e IV. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Apenas I e III. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Timpânica. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Axilar. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Retal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Oral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Hipotermia. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Levantar e sentar. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Retal. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Axilar. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Timpânica. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Oral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 4 ml. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 3 ml. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 20 ml. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 1 ml. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa — que = OD de amar |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Desbridamento autolítico |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Desbridamento biológico |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Desbridamento mecânico |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Desbridamento instrumental |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Desbridamento enzimático |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Autolítico |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Enzimático |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Mecânico |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Instrumental |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Biológico |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Oclusivo hidrofóbico |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Esponja de drenagem |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: trombose. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: lesão neurológica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Cateterismo Intermitente. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Sondagem Gástrica. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: não-aderência |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: permeabilidade |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: toxicidade |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: isolamento térmico |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Curativo de ferida. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Banho no leito. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Medição de peso. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Tornozelo. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Cotovelo. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Clavícula. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Pulso. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Joelho. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I , apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: II , apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I e III , apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: II e III , apenas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: I , II e III . |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Monitor multiparamétrico. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: O sexo do paciente. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Temperatura corporal. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pulso. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Pressão arterial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Peso corporal. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Frequência respiratória. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Preencher formulários. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Postergado. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Evitar registros. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Reduzir equipe. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Diminuir visitas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Choque hipovolêmico. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: II. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: III. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: IV. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: V. |
| `remainder_still_spoils` | `golden_rule.rows[0].value` | Falsa: Déficit de pulso é a diferença entre o pulso apical e o pulso periférico. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Polipneia |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Hiperpneia |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Oligopneia |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Espanopneia |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Taquipneia |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Pressão arterial |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Temperatura |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Dor |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Frequência cardíaca |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Frequência respiratória |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Febre contínua |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Febre intermitente |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Febre remitente |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Febre recorrente |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Febre ondulante |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: ritmo de pulsação |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: disparidade |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: elasticidade |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V, F, F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V, V, V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V, V, V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F, F, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Termômetro. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Otoscópio. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Bomba de infusão. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Oxímetro. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: Esfigmomanômetro. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Pulso radial. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pressão arterial. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Frequência respiratória. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Temperatura corporal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 36,9ºC. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 37,8ºC. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 38,7ºC. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 39,4ºC. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: 40,5ºC. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Frequência cardíaca |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Frequência respiratória |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Dor |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Temperatura |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Pressão arterial |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Bradipneia |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Espanopneia |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Oligopneia |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Hipopneia |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: Taquipneia |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Esfigmomanômetro. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Estetoscópio. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Anemoscópio. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Cinescópio. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Ressectoscópio. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: sons de Brith. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: sons de Korotkoff. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: sons hipertensivos. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: arritmia. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: sons de Bird. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 2. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 3. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 4. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 5. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 2. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 3. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 4. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 5. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: Pulso fino. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Pulso carotídeo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pulso braquial |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Pulso femoral |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Pulso apical |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Pulso radial |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: radial. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: braquial. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: ulnar. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: basílica. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: cefálica. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: dificuldade respiratória. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V – V – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V – V – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: V – F – F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – V – F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F – F – V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: poplítea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: pediosa. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: auricular. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: apical. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: carotídea. |
| `remainder_too_short` | `concept_map.items[0].detail` | Verdadeira: Aquecer as mãos. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Aquecer as mãos. |
| `remainder_too_short` | `concept_map.items[0].detail` | Verdadeira: Estetoscópio. |
| `remainder_too_short` | `concept_map.items[2].detail` | Falsa: Cuba rim. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Estetoscópio. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Cuba rim. |
| `remainder_too_short` | `concept_map.items[2].detail` | Falsa: Braço não apoiado. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Braço não apoiado. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, V, V, V |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, F, F, F |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F, V, F, V |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: F, F, F, V |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V, F, F, V |
| `remainder_too_short` | `concept_map.items[2].detail` | VERDADEIRA: Oral – deglutição |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Oral – deglutição |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Sublingual |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Nasal |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Oral |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Retal |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Duodenal |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Região Hochstetter |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Região deltoide |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Região reto femoral |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Região dorso glútea |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: endovenosa. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: intramuscular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: subcutânea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: retal. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: sublingual. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `concept_map.items[1].label` | Falsa |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeira |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeira |
| `remainder_too_short` | `concept_map.items[1].label` | Falsa |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeira |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Errado |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeira |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Hidrocolóide. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Hidrogel. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Papaína creme 10%. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V-V-F-F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F-F-V-V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: F-V-V-F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V-V-V-F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V-F-F-V. |
| `remainder_still_spoils` | `golden_rule.rows[2].value` | Verdadeira: Apenas as alternativas A e D estão corretas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Intramuscular (IM). |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intravenosa (IV). |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Subcutânea (SC). |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Oral. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Sublingual. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: O abdome. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: A região Deltoide. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Carótida. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Jugular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Temporal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Braquial. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, V, F, V, V |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: V, V, F, F, V |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, V, F, V |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F, V, F, V, F |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F, V, F, V, V |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: I, II e IV |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: II, III e IV |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I e III |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: III e IV |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: I e II |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 0,1 ml. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 0,25 ml. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 0,5 ml. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 1 ml. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 2 ml. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Bradipneia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Hipertensão. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Hipotensão. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Taquipneia. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Apneia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: termômetro. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: esfigmomanômetro. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: oxímetro. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: otoscópio. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: sonar. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 30º. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 50º. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 60º. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 80º. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: 90º. |
| `remainder_too_short` | `golden_rule.rows[0].value` | VERDADEIRA — fora do prazo. |
| `remainder_too_short` | `golden_rule.rows[1].value` | VERDADEIRA — retrógrado. |
| `remainder_too_short` | `golden_rule.rows[4].value` | VERDADEIRA — polissemia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | VERDADEIRA — coesão lexical. |
| `remainder_too_short` | `concept_map.items[5].detail` | VERDADEIRA: Sonda Vesical |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Sonda Vesical |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Ressuscitação cardiopulmonar. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: manobra de Leopold. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: manobra de Heimlich |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: torniquete. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: massagem cardíaca. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Pulso magnus. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pulso bigeminado. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Pulso paradoxal. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Pulso normal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: EV Contínua.. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: EV em Bolus. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: EV Lenta. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: EV Rápida. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: EV Intermitente. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: II, III , apenas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: I, II, III, IV . |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 2 – 1 – 3 – 4 – 5. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 1 – 2 – 3 – 4 – 5. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 1 – 3 – 4 – 2 – 5. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 3 – 2 – 1 – 4 – 5. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 1 – 2 – 4 – 3 – 5. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Braço (bíceps) |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Antebraço (extensor) |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I e III, apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I, II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: I, II e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Soro fisiológico. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Soro iodado. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Soro muriático. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Soro antiofídico. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Soro hialurônico. |
| `remainder_too_short` | `concept_map.items[0].detail` | VERDADEIRA. Sarampo. |
| `remainder_too_short` | `concept_map.items[1].detail` | VERDADEIRA. Caxumba. |
| `remainder_too_short` | `concept_map.items[2].detail` | FALSA. Poliomielite. |
| `remainder_too_short` | `concept_map.items[3].detail` | VERDADEIRA. Rubéola. |
| `remainder_too_short` | `concept_map.items[4].detail` | FALSA. Poliomielite. |
| `remainder_too_short` | `golden_rule.rows[0].value` | VERDADEIRA: Sarampo. |
| `remainder_too_short` | `golden_rule.rows[1].value` | VERDADEIRA: Caxumba. |
| `remainder_too_short` | `golden_rule.rows[2].value` | FALSA: Poliomielite. |
| `remainder_too_short` | `golden_rule.rows[3].value` | VERDADEIRA: Rubéola. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Na bexiga. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Amóxia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Hipóxia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Atóxica. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Hemóxia. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Hitóxia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Números. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Letras. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Símbolos. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Cores. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Gráficos. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Intratecal. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intraóssea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Oral. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Suprapúbica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Banho de leito. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Cirurgia eletiva. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Puericultura. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Parada cardiorrespiratória. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Mamografia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Mãos no pescoço. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Sede intermitente. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Vômito em jato. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Típica. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Atípica. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Motora. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Diafragmática. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Olfativa. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Síndrome compartimental. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Sepse. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Síndrome disruptiva. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Síndrome neurogênica. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Apoptose. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 97%. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 43 rpm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 93 bpm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 42 ºC. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 120 mmHg. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Veia radial. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Fossa poplitea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Artéria braquial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Jugular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Ouvidos. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 0 (zero). |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 1 (um). |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 2 (dois). |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 3 (três). |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 4 (quatro). |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 2 segundos. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 8 10 segundos. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 20 segundos. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 60 segundos. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 120 segundos. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Via oral. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Via nasal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: VO. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: IM. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: IV. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: SC. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: HD. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Contínua. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Não contínua. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Bolus. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: IM. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Hipodermóclise. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Infusão rápida. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Infusão contínua. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Infusão lenta. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Bolus. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: Infusão intermitente. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: pulso arterial. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: pressão arterial. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: frequência respiratória. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: temperatura corporal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: febre. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: cianose. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: hipotermia. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: taquipneia. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: sudorese profusa. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Transporte ao colo. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Choque anafilático. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Choque septicêmico. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Choque neurogênico. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Choque cardiogênico. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: Choque hipovolêmico. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V • V • V • V • V |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: V • V • V • F • V |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V • F • V • F • V |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F • V • F • F • F |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F • F • F • V • F |
| `remainder_still_spoils` | `golden_rule.rows[0].value` | Falsa: Um paciente com temperatura axilar de 36,6°C está febril. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1 • 3 • 2 • 4 |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 1 • 3 • 4 • 2 |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 2 • 1 • 4 • 3 |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 2 • 1 • 3 • 4 |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 3 • 1 • 4 • 2 |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F – F – F . |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V – F – F . |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F – V – V . |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V – V – V . |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: F – V – F . |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F – V – F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V – F – V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F – V – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V – F – F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F – F – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Avaliar pupilas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V – V – F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F – F – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: V – F – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – V – F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V – V – V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F – V – F – F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V – V – F – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – F – V – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V – V – V – F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F – F – F – F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F – V – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F – V – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – F – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V – V – V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: V – V – F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F – V – F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V – V – V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F – F – F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V – F – V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F – V – V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: de uma em uma hora. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: a cada 4 horas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: a cada 15 minutos. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: a cada 30 minutos. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V – F – F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F – F – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – V – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – V – F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: V – F – V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V – V – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F – V – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – F – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – F – F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F – F – V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: nomal. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: filiforme. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: alternante. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: dicrótico. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: paradoxal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 40 bpm. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 50 bpm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 60 bpm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 70 bpm. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 80 bpm. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V – F – F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F – F – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – V – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: F – V – V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V – F – V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Coxa. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Braço. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Nádegas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Abdômen. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: subcutânea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: endovenosa. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: intramuscular profunda. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Bandeja. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Medicamento prescrito. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Gaze. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Deltoide 4 ml. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Glútea 5 ml. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Ventroglútea 2 ml. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Endocardite. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Fibrilação atrial. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Apenas I e III. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Apenas II e IV. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Apenas I, III e IV. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: I, II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: profilático. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: propedêutico. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: condutivo. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Movimento em J. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Manobra de PLS. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Manobra de prona. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Manobra de Sims. |
| `remainder_still_spoils` | `golden_rule.rows[4].value` | Verdadeira: Débito urinário horário monitorado continuamente, refletindo perfusão e função renal imediata. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Hiperglicemia leve. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Aumento do apetite. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 1 – 2 – 3 – 4. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 2 – 1 – 4 – 3. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 3 – 2 – 1 – 4. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 4 – 3 – 2 – 1. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 1 – 3 – 4 – 2. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Fentanil. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Naloxona. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Morfina. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Efedrina. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Lidocaína. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Amiodarona. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Atropina. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Dobutamina. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Pulso. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pressão arterial. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Temperatura. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Dor. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dicrótico. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Filocárdio. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Normocárdio. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Filiforme. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Discárdio. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V – F – V – F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V – V – F – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: V – F – F – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – V – V – F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F – F – V – V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Esfigmomanômetro. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Oxímetro de pulso. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Estetoscópio. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: F – V – V – F – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F – F – V – V – V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – F – V – V – F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – V – F – F – V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V – V – F – V – F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V – F – V – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: V – V – F – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – V – F – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – F – V – V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F – V – V – F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Apenas I e II. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Apenas I e III. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Apenas II e IV. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Apenas III e IV. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: I, II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dor. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pressão arterial. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Oximetria de pulso. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Frequência respiratória. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Temperatura. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Pressão arterial. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Frequência cardíaca. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Frequência respiratória. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Massa corporal. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Temperatura axilar. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: subcutânea – edema |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V – F – F – V – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F – F – V – V – F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V – V – F – F – V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – V – V – F – V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V – F – V – F – F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Oral. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Intravenosa. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Otológica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: oral |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: intravenosa |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: intradérmica |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: subcutânea |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: sublingual |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intradérmica. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Endovenosa. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Oral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 25°. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 30°. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 45°. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 60°. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: 90°. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1 – 2 – 3 – 2 – 1. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 2 – 2 – 1 – 3 – 3. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 1 – 1 – 3 – 2 – 2. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 3 – 1 – 2 – 1 – 1. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 1 – 2 – 2 – 3 – 2. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Enteral. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Cutânea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Endotraqueal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Sublingual. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: Parenteral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: imprudência. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: negligência. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: imperícia. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: inconsistência. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Colostomia |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Cistostomia |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Traqueostomia |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Jejunostomia |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V F F V V |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V V F V F |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F V V F F |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F F V F V |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dispneia |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Ortopneia |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Taquipneia |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Bradipneia |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Korotkoff. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Hipertensômetro. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Esfigmomanômetro. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Estetoscópio. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Técnica vertical. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Técnica em "Z". |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Técnica em "V". |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Técnica horizontal. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: medir a oximetria. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F − F − V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V − F − F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V − F − V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F − V − F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: V − V − F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I, apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I e II, apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: II e III, apenas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: II, apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 26. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 24. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 18. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 22. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 20. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F − V − V − F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: V − V − F − V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V − F − F − F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V − F − V − V |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F − V − F − F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 13 x 4,5 mm. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 13 x 8 mm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 25 x 7 mm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 40 x 12 mm. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 30 x 8 mm. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 25. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 10. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 5. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 20. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 15. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I, II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: I, II e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: III e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: I e II, apenas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: III, apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: I e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I, II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I, II e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: II e III, apenas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: III, apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Korotkoff. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Bainbridge. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Rochester. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Laplace. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Galvani. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Pupilas anisocóricas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pupilas isocóricas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Pupilas midriáticas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Pupilas nistagmáticas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Pupilas mióticas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F − F − V − F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: V − F − V − V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F − V − F − V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V − V − F − F. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V − F − V − F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dorsoglúteo. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Glúteo. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Ventroglúteo. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Deltoide. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Fenitoína. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Furosemida. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Diazempam. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Clopromazina. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Ventro glúteo. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Deltoide. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Dorso glúteo. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Anterior da coxa. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Via intramuscular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Via retal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Via oral. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: Via sublingual. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Retal. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Respiratória. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Intravenosa. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, V, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V, F, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: F,V,F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V,V, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1,0 a 1,5 cm. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 2,5 a 5,0 cm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 8,0 a 10,0 cm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 15,0 a 25,0 cm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Cateterismo gravitacional. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Intravenosa. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Intradérmica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Imunobiológicos. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Anticoagulantes. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I , II e III . |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I , II e IV . |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: II e IV . |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: I e IV . |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: III . |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: I, IV e V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: II, IV e V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: I, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: II e III, apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: I, II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, V, V, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: F, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V, V, F, V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F, V, V, V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, F, V, F |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: F, V, F, F |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, V, F, V |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F, F, V, F |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V, F, F, F |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 1.V, 2.F, 3.V; |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 1.F, 2.V, 3.F; |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 1.V, 2.V, 3.F; |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 1.V, 2.F, 3.F; |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 1.F, 2.V, 3.V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: apical. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: femoral. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: radial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: temporal. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: poplíteo. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 35,8º. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 36,8º |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 37º. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 37,8º. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: 40º. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: timpânica. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: axilar. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: retal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: oral. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: orgânica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 45º graus; |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 60º graus; |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 90º graus; |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 30º graus; |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 15º graus. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: região ventroglútea. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: parenteral. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: intramuscular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: subcutânea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: enteral |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: venosa. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: sublingual. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: intramuscular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: subcutânea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: intravenosa. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: intracardíaca. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: fácil aplicação. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: permite autoaplicação. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: benzetacil. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: amiodarona. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: dipirona. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: furosemida. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: adrenalina. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: músculo |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: veia |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Afrouxe as roupas |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Manobra de Heimlich |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Manobra de Valsalva |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Manobra de Leopold |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Bradicardia |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Taquisfigmia |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Bradisfigmia |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Taquicardia |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Normocardia |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Pulso irregular |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Pulso dicrótico |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 58bpm a 90bpm. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 90bpm a 160bpm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 75bpm a 118bpm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 100bpm a 205bpm. |
| `remainder_too_short` | `golden_rule.rows[0].value` | FALSA: isso é absorção |
| `remainder_too_short` | `golden_rule.rows[1].value` | VERDADEIRA: farmacodinâmica |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Asma. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Infarto. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Cólera. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Diabetes. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 45 bpm. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 75 bpm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 120 bpm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 130 bpm. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 50 bpm. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: I e III. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: II e IV. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I, III e IV. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Pirexia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Eupneia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Hipertensão. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Taquisfigmia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Inalatória. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Intravenosa. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Intratecal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Inalatória. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Intravenosa. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Intratecal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 95% |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 89% |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 90% |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 92%. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: 94% |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Hiperventilação |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Biot |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Kussmaul |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Taquipneia |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Cheyne-Stokes |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Hiperventilação |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Biot |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Kussmaul |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Taquipneia |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Cheyne-Stokes |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeiro no item |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: II e III, apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I e III, apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: II e IV, apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V, V, F, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F, V, V, F. |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeira |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeira |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Errado |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Certo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Errado |
| `remainder_too_short` | `concept_map.items[1].label` | Verdadeiro no texto |
| `remainder_too_short` | `concept_map.items[2].label` | Falso no texto |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Deltoide. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Dorsoglúteo. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Supraglúteo. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Hematúria. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Disúria. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Hematoquezia. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Urina concentrada. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Hematêmese. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Oral. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Sublingual. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Retal. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Nasal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Peso elevado |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Hipertensão |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Idade avançada |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, V, F, F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F, V, V, V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: II e III , apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I , apenas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: I e II , apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: III , apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, F, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: V, V, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F, V, F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F, F, V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, V, F, F |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, V, V, F |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F, F, V, V |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V, F, F, F |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: II e III. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I e II. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I e III. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Tipo A. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Tipo B. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Tipo C. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Tipo D. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Trendelenburg. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Kraske. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 90/60 mmHg. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 120/80 mmHg. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 140/90 mmHg. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 160/100 mmHg. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 30°. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 45°. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 60°. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 90°. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1 – 2 – 3 – 4. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 3 – 2 – 1 – 4. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 2 – 1 – 4 – 3. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 1 – 2 – 4 – 3. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 4 – 3 – 2 – 1. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: a NIHSS. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: a de Cincinnati. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: de Glasgow. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: nitroglicerina. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: morfina. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: clopidogrel. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: cetamina. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: desmopressina. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: jugular. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: carótida. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: radial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: braquial. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: poplítea. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira — interdisciplinaridade |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira — rede de diálogo |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V-V-V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V-F-V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F-V-F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F-F-V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 2 ml. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 3 ml. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 4 ml. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 5 ml. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 6 ml. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Palidez. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Edema excessivo. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Aumento do pulso. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1 minuto. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 2 minutos. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 5 minutos. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 10 minutos. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Tipo A. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Tipo B. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Tipo C. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Tipo D. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Respiração. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Acesso venoso. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Ulnar. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Radial. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Braquial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Caroídeo. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 90 mmHg. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 100 mmHg. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 110 mmHg. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 140 mmHg. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Hiperpneia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Taquipneia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Respiração Kussmaul. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dor. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Anemia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Tabagismo crônico. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 18 / taquipneico |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 25 / bradipneico |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 65 / taquicárdico |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 80 / normocárdico |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F, F, F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, V, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V, V, V. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Diurese. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Respiração. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Temperatura. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Pressão arterial. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: F, V, V, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, F, F, V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, V, F, F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: II. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I e III. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: II e IV. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: I, II e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I e II. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: III e IV. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: I, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 2, 4, 1, 3. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 3, 2, 4, 1. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 4, 1, 3, 2. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 1, 3, 2, 4. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 0,1 a 0,5 ml. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 0,5 a 1,5 ml. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 1 a 3 ml. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 3 a 5 ml. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Nos olhos. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Sob a pele. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Intravenosa. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intradermal. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Direta na veia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 25° |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 45° |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 50° |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 90° |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Sonda de Mallecot; |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Sonda Foley |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Sonda Fouchet |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Sonda Petzzer |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Sonda de Hander |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 190/70 mmHg |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 134/84 mmHg |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 100/50 mmHg |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 90/50 mmHg |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Pressão arterial |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: transdérmica |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: implantação |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: intravenosa |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: subcutâneo |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Região dorsoglútea |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Músculo deltoide |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Região ventroglútea |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Processo Xifoide. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: femoral. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: ciático. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: obturatório. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: pudendo. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: fibular comum. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: deltoide. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: glúteo máximo. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: vasto lateral. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: glúteo médio. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: reto femoral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: No músculo |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Na derme |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Tecido adiposo |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V / F / V |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F / V / V |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: V / F / F |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V / V / F |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Hemorragia intra-abdominal |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 8 |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 9 |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 12 |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 14 |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: de Valsalva. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: de Heimlich. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: de Sellick. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: de Osler. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: intravenosa. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: subcutânea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: sublingual. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: intramuscular. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: enteral. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: parenteral. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: epidural. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: pleural. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Temperatura. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Pulso. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Pupilas dilatadas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Pressão sanguínea. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Taquipneico. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Apneico. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Eupneico. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Dispneico. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Bradipneico. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dreno de Penrose. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Dreno de Kehr. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Dreno Tubular. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Dreno de Tórax. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Angina Estável. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Fibrilação Ventricular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Hipoglicemia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Assistolia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Fibrilação Atrial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Fibrilação Ventricular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Bradicardia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V, F, F, F, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V, V, V, F, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, F, V, F, V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F, F, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: F, V, V, V, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dorsoglútea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Ventroglútea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Deltoide. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Vasto lateral. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Vasto medial. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Glútea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Dorsoglútea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Ventroglútea. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Deltóide. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Oral, oral e oral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: >120 e >80. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: <120 e <80. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 120-125 e 80-84. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 120-129 e 80-89. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 130-139 e 90-94. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 0,5 ml. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 1 ml. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 1,5 ml. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 2 ml. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 5 ml. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: F-V-V-F |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F-V-F-V |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V-F-V-F |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: V-F-F-V |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Sonda Foley. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Sonda Levine. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Sonda Dobbhoff. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Sonda de Nelaton. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Sonda Malecot. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 140/90mmHg. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 149/99 mmHg. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 141/91 mmHg. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 123/75 mmHg. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 145/89 mmHg. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 35°C e 37,5°C. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 36, 5°C e 37°C. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 36°C e 37,4°C. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 35°C e 37,8°C. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 36,5°C e 37,5°C. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Desinfecção. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Lavagem terminal. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Lavagem gástrica. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Higienização. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Sonda gástrica. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Sonda nasal. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Sonda parenteral. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Sonda vesical. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Aneurismas cerebrais. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Trombos ou êmbolos. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Traumas cranioencefálicos. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Enema. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Endoscopia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Acesso periférico. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Acesso central. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Colonoscopia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Sonda enteral. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Somente o item I. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Somente o item II. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Todos os itens. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1 a 4cm. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 5 a 7cm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 20 a 25cm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 10 a 15cm. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: zero \| zero |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: zero \| dois |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: dois \| zero |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: três \| dois |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: E - C - E. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: C - C - C. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: C - E - E. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: E - E - C. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: C - C - E. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: E - E - C. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: C - E - C. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: E - C - C. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Somente o item I. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Somente o item II. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Todos os itens. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Taquicardia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Taquisfigmia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Taquiarritmia. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Taquipneia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Epidural. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intraperitoneal. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Intratecal. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Intrapleural. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Trendelenburg. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Genupeitoral. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Litotomia. |
| `remainder_too_short` | `concept_map.items[2].detail` | FALSA: Tópica ou cutânea. |
| `remainder_too_short` | `concept_map.items[3].detail` | FALSA: Via ocular. |
| `remainder_too_short` | `concept_map.items[4].detail` | FALSA: Otológica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Tópica ou cutânea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Via ocular. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Otológica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 1 - 2 - 3 - 4. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 3 - 4 - 2 - 1. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 4 - 2 - 3 - 1. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 2 - 1 - 4 - 3. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 0,70x25mm |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 0,45x13mm |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 0,55x20mm |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 1,00x25mm |
| `remainder_too_short` | `concept_map.items[3].detail` | VERDADEIRA: Deltoide. |
| `remainder_too_short` | `concept_map.items[4].detail` | FALSA: Periumbilical. |
| `remainder_too_short` | `concept_map.items[5].detail` | VERDADEIRA: Ventroglúteo. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: Deltoide. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Periumbilical. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Ventroglúteo. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 1 - 2 - 3. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 3 - 2 - 1. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 2 - 3 - 1. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 2 - 1 - 3. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I, II. III e IV. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Apenas II e III. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Apenas I e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Apneia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Bradipneia. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Ortopneia. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Taquipneia. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: V, V, F, F. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: F, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F, V, F, V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: I, II e III. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I, II e IV. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I, III e IV. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: II, III e IV. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: diabetes melito. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: choque cardiogênico. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: sepse. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 12 a 20 rpm. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 18 a 34 rpm. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 18 a 40 rpm. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 24 a 40 rpm. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 30 a 60 rpm. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: glúteo. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: músculo deltoide. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intradérmica. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Subcutânea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Oral. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Nasal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 45 graus. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 70 graus. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: paralelo a pele. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 90 graus. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 360 graus. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 2 ml |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 5 ml |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 10 ml |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: 20 ml |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: 2,5 cm |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 3,5 cm |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 4,0 cm |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 6,5 cm |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: vesical de demora |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: vesical de alívio |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Tenckoff |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Blake |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Gasglow |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Ked block |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Jaw Thrust |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: bradpneia |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: magnus |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: parvus |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: apical |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 10 minutos |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 30 minutos |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 60 minutos |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 90 minutos |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: deltoide |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: ventroglúteo |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: bíceps braquial |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: oral |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: enteral |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: parenteral |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: sublingual |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: endovenosa |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: parenteral |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: sublingual |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: ocular |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: I e III , apenas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: I , II e III . |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: I e II , apenas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: III , apenas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: F, F, V, V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V, F, V, F. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: V, V, V, V. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: V, F, F, V. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: V, F, F, F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dreno de penrose. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Catete duplo J. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Sonda nasoentérica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Dreno de penrose. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Catete duplo J. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Sonda nasoentérica. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Tratamento curativo |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Prevenção primária |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Vigilância passiva |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Prevenção terciária |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Notificação compulsória |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Febre. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Sonolência. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Síncope. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Hipotensão. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 24 horas. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 12 a 24 horas. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 15 a 48 horas. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 96 horas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: 2 a 4 horas. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: V – F – V – F – V. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: V – V – F – F – V. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: F – F – V – V – F. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: F – V – F – V – F. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: iatrogenia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: sepse. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: pancreatite. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: infecção súbita. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 2 e 0. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 1 e 2. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 1 e 1. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 2 e 1. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 0 e 0. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Região deltoideana. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Região dorsoglútea. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Região ventroglútea. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Subcutânea |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: Intradérmica |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: Percutânea |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Intramuscular |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: desidratação. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: constipação intestinal. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: hemorragia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: poliúria. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: corrimento. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: hematúria. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: empiema. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: diarreia. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: vômitos. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: constipação. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: desidratação. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: náuseas. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: náuseas e vômitos. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: prurido. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: fraqueza no membro. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: dor. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: pneumotórax. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: colecistite. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: derrame pleural. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: hepatomegalia. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: angina. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Escala de Ramsay. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Escala de Ritcher. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Escala de Glasgow. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Escala de PH. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Escala de Bristol. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Valsalva … engasgo |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Lift. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Prancha deslizante. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Colar cervical. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Slide up wide. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: em equipe. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: competitivo. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: tecnicista. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: em agrupamento. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: unidimensional. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Poplítea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Carótida. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Braquial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Femoral. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Radial. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 140/120/zero mmHg. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Verdadeira: 138/122/zero mmHg. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 14 x 12 mmHg. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 13,8 x 12,2 mmHg. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 14/12/zero mmHg. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Verdadeira: hipotensão ortostática. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: pseudohipertensão. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: hipertensão secundária. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: poplítea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: femoral. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: carótida. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: braquial. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: basílica. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Verdadeira: Esfigmomanômetro. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: manobra de Osler. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Poplítea. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Carótida. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Braquial. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Femoral. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Pulmonar. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 0,1 mL. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 0,3 mL. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: 0,4 mL. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 0,5 mL. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: 1,0 mL. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: endovenosa. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: subcutânea. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Falsa: intradérmica. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: auricular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Verdadeira: intramuscular. |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: 15° |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: 25° |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: 45° |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: 90° |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: 120° |
| `remainder_too_short` | `golden_rule.rows[0].value` | Falsa: Enteral. |
| `remainder_too_short` | `golden_rule.rows[1].value` | Falsa: Intratecal. |
| `remainder_too_short` | `golden_rule.rows[2].value` | Verdadeira: Endovenosa. |
| `remainder_too_short` | `golden_rule.rows[3].value` | Falsa: Intramuscular. |
| `remainder_too_short` | `golden_rule.rows[4].value` | Falsa: Oral. |

