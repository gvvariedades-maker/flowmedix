#!/usr/bin/env tsx
/**
 * Onda 5 — Verificação de Sinais Vitais, lotes 01–07.
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-a-sinais-vitais-b1-7-inferences.ts
 */

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SV = 'Verificação de Sinais Vitais';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const URG = 'Urgências e Emergências';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const PE = 'Processo de Enfermagem';
const FISIO = 'Noções de Fisiologia';
const ANAT = 'Noções de Anatomia';
const MED = 'Cuidados na Administração de Medicamentos';
const SM = 'Saúde Mental';
const SCM = 'Saúde da Mulher';
const SCC = 'Saúde da Criança';
const ATB = 'Atenção Básica / Saúde da Família';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const MOB = 'Mobilização e Posicionamento do Paciente';
const SONDA = 'Instalação e Manejo de Sondas';
const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const BACT = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const AGUDA = 'Questões Mescladas e Outras Doenças Agudas';
const DRC = 'Doenças Respiratórias Crônicas (Asma, DPOC)';
const PROC = 'Procedimentos Diversos';
const AUDIT = 'Segurança do Paciente';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map([
  // batch 01
  ['adm-tec-enfermagem-semiologia-em-enfermagem-1779563486900-6', [SV, 'Padrões evolutivos da febre — classificação do sinal temperatura.', 0.93]],
  ['adm-tec-enfermagem-semiologia-em-enfermagem-1779563491765-0', [SCM, 'Sofrimento fetal e cardiotocografia — obstetrícia.', 0.95]],
  ['adm-tec-enfermagem-semiologia-em-enfermagem-1779563517223-6', [BACT, 'Quadro clínico de meningite meningocócica — doença infecciosa.', 0.94]],
  ['amauc-enfermagem-processo-de-enfermagem-1780001517858-3', [SV, 'Déficit de pulso — técnica de verificação de FC.', 0.95]],
  ['amauc-enfermagem-processo-de-enfermagem-1780002441285-7', [DCNT, 'Acompanhamento de diabetes e hipertensão — DCNT.', 0.92]],
  ['adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-7', [SV, 'Valores normais de FR em lactentes — parâmetro SV.', 0.94]],
  ['ameosc-enfermagem-processo-de-enfermagem-1780003031246-1', [SV, 'Técnica de PA na visita domiciliar — aferição.', 0.93]],
  ['ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3', [SV, 'Aferição de SV em visita domiciliar — técnica.', 0.93]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780002714111-1', [SV, 'Material para aferição de PA — esfigmomanômetro.', 0.94]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780003709908-7', [SV, 'Material para aferição de PA.', 0.94]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780011859940-6', [SV, 'Técnica de PA em adulto sentado.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-0', [SV, 'Terminologia taquicardia/eupneia após aferição.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-1', [SV, 'Técnica de esfigmomanômetro.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-2', [SV, 'Terminologia taquisfigmia/taquicardia.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-3', [SV, 'Terminologia dispneia/taquipneia.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343845367-1', [SV, 'Equipamento para PA — esfigmomanômetro.', 0.94]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-0', [SV, 'Preparo para monitor multiparamétrico — SV.', 0.91]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-1', [SV, 'Utilização do esfigmomanômetro.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-6', [SV, 'Identificação do esfigmomanômetro.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343945057-2', [SV, 'Sons de Korotkoff na aferição de PA.', 0.96]],
  ['cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344189558-1', [SV, 'PA em idoso com esfigmomanômetro aneroide.', 0.94]],
  ['amauc-enfermagem-verificacao-de-sinais-vitais-1779344196733-2', [SV, 'Fases de Korotkoff na aferição de PA.', 0.93]],
  ['fenix-instituto-enfermagem-verificacao-de-sinais-vitais-1780000468214-0', [SV, 'Frequência cardíaca como sinal vital.', 0.94]],
  ['fepese-enfermagem-verificacao-de-sinais-vitais-1779344127707-4', [SV, 'Técnica de aferição de PA.', 0.95]],
  ['fundatec-enfermagem-verificacao-de-sinais-vitais-1778969745165-4', [SV, 'Cuidados na aferição de PA.', 0.95]],
  ['fundatec-enfermagem-verificacao-de-sinais-vitais-1779343811344-2', [ANAT, 'Localização de artérias para pulso — anatomia aplicada.', 0.91]],
  ['fundatec-enfermagem-verificacao-de-sinais-vitais-1779343919045-3', [SV, 'Verificação de pulso apical em criança.', 0.94]],
  ['fundatec-enfermagem-verificacao-de-sinais-vitais-1779344253939-0', [DCNT, 'HAS epidemiológica e controle — DCNT.', 0.91]],
  ['fuvest-enfermagem-verificacao-de-sinais-vitais-1779344137078-1', [SV, 'PA como parâmetro clínico confiável.', 0.94]],
  ['furb-enfermagem-verificacao-de-sinais-vitais-1778969745165-7', [SV, 'Locais de palpação do pulso.', 0.94]],
  ['amauc-enfermagem-processo-de-enfermagem-1780002549800-2', [PERI, 'Assistência pré/trans/pós-operatória.', 0.94]],
  ['amauc-enfermagem-processo-de-enfermagem-1780002549800-3', [URG, 'Atendimento emergencial e manejo de trauma.', 0.95]],
  ['amauc-enfermagem-processo-de-enfermagem-1780005128081-6', [DCNT, 'Características clínicas da HAS — DCNT.', 0.93]],
  ['amauc-enfermagem-semiologia-em-enfermagem-1779563500147-9', [URG, 'Escala de Cincinnati para suspeita de AVC.', 0.96]],
  ['ameosc-enfermagem-atencao-basica-saude-da-familia-1778968094018-4', [ATB, 'Monitoramento da população adscrita na APS.', 0.91]],
  ['ameosc-enfermagem-processo-de-enfermagem-1776056158507-7', [ATB, 'Acolhimento na PNH — atenção básica.', 0.9]],
  ['ameosc-enfermagem-processo-de-enfermagem-1776056181857-2', [PE, 'Registro e passagem de plantão — processo de enfermagem.', 0.91]],
  ['ameosc-enfermagem-processo-de-enfermagem-1780002934000-4', [PE, 'Registro de sinais vitais no prontuário — documentação PE.', 0.9]],
  ['ameosc-enfermagem-processo-de-enfermagem-1780005556782-6', [URG, 'Primeiros socorros e emergência.', 0.94]],
  ['ameosc-enfermagem-processo-de-enfermagem-1780008225255-3', [PE, 'Acolhimento com dor abdominal — fluxo de avaliação PE.', 0.88]],
  ['ameosc-enfermagem-processo-de-enfermagem-1780008225255-5', [PE, 'Cuidados integrais em pneumonia — PE hospitalar.', 0.87]],
  ['ameosc-enfermagem-processo-de-enfermagem-1780008225255-7', [SCM, 'Pré-natal e gestante com edema — saúde da mulher.', 0.93]],
  ['ameosc-enfermagem-processo-de-enfermagem-1780008232871-4', [PE, 'Cuidados integrais sob supervisão do enfermeiro.', 0.88]],
  ['ameosc-enfermagem-verificacao-de-sinais-vitais-1779343883917-2', [PERI, 'Cuidados pós-operatórios incluindo temperatura.', 0.91]],
  // batch 02
  ['avancasp-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-0', [PE, 'Pesagem em internados — antropometria no cuidado.', 0.9]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780002714111-4', [PE, 'Peso/altura para estado nutricional — antropometria.', 0.91]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780003031246-8', [PE, 'Medidas antropométricas vs sinais vitais.', 0.92]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780003261833-0', [SV, 'Monitorização contínua na UTI — sinais vitais.', 0.9]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780003709908-3', [URG, 'Choque hipovolêmico em trauma.', 0.95]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780003709908-8', [PE, 'Técnica de medida antropométrica (estatura).', 0.92]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780003793968-5', [PROMO, 'Prevenção de hipertensão — promoção à saúde.', 0.91]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780006444165-6', [PUNCAO, 'PVC via cateter — punção/monitorização venosa.', 0.93]],
  ['avancasp-enfermagem-semiologia-em-enfermagem-1779563480978-0', [OXI, 'Padrões respiratórios (Cheyne-Stokes, apneia).', 0.92]],
  ['avancasp-enfermagem-semiologia-em-enfermagem-1779563480978-1', [URG, 'Anafilaxia/angioedema em emergência.', 0.94]],
  ['avancasp-enfermagem-semiologia-em-enfermagem-1779563486900-2', [SV, 'Particularidades da febre — sinal temperatura.', 0.91]],
  ['avancasp-enfermagem-semiologia-em-enfermagem-1779563500147-8', [URG, 'Manifestações clínicas do choque.', 0.94]],
  ['avancasp-enfermagem-semiologia-em-enfermagem-1779563517223-1', [MOB, 'Avaliação de risco de úlceras por pressão.', 0.95]],
  ['avancasp-enfermagem-semiologia-em-enfermagem-1779563517223-4', [URG, 'Choque hipovolêmico — emergência.', 0.95]],
  ['avancasp-enfermagem-verificacao-de-sinais-vitais-1779343897104-2', [OXI, 'Dispneia e ritmos respiratórios anormais.', 0.9]],
  // batch 03
  ['cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001790945-0', [SCC, 'IMC/classificação nutricional infantil.', 0.92]],
  ['cebraspe-cespe-enfermagem-semiologia-em-enfermagem-1779563549311-2', [AGUDA, 'Pós-operatório oncológico — cuidado clínico cirúrgico.', 0.88]],
  ['cev-urca-enfermagem-processo-de-enfermagem-1780006494066-6', [SCC, 'Atribuições do técnico em saúde da criança na AB.', 0.91]],
  ['cev-urca-enfermagem-processo-de-enfermagem-1780006947080-0', [ATB, 'Atribuições do técnico na atenção básica.', 0.92]],
  ['cev-urca-enfermagem-semiologia-em-enfermagem-1779563491765-1', [SCC, 'Desidratação em lactentes — pediatria.', 0.94]],
  // batch 04
  ['consulplan-enfermagem-semiologia-em-enfermagem-1779563531989-4', [SV, 'Interpretação de FC e PA — terminologia SV.', 0.95]],
  ['coseac-uff-enfermagem-semiologia-em-enfermagem-1779563531989-9', [AGUDA, 'Disúria e sintomas urinários — semiologia clínica.', 0.9]],
  ['coseac-uff-enfermagem-semiologia-em-enfermagem-1779563549311-3', [SCC, 'Visita domiciliar a criança menor de 2 meses.', 0.93]],
  ['cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-0', [DCNT, 'Cuidados em insuficiência cardíaca — DCNT.', 0.92]],
  ['cotec-fadenor-enfermagem-semiologia-em-enfermagem-1779563537258-0', [PROC, 'Testes ortopédicos (túnel do carpo) — procedimento específico.', 0.9]],
  ['cpcon-uepb-enfermagem-processo-de-enfermagem-1780003654722-8', [PROC, 'Banho e higiene pessoal do paciente.', 0.91]],
  ['cpcon-uepb-enfermagem-processo-de-enfermagem-1780003868364-2', [DCNT, 'Diretriz de HAS em criança/adolescente — hipertensão.', 0.9]],
  ['cpcon-uepb-enfermagem-processo-de-enfermagem-1780003868364-6', [URG, 'SAMU e rebaixamento de consciência — pré-hospitalar.', 0.94]],
  ['cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-2', [MED, 'Epistaxe e uso de varfarina — cuidados medicamentosos.', 0.88]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563491765-4', [BACT, 'Mancha hansênica — hanseníase.', 0.95]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563500147-3', [SCM, 'Sinais de gravidez e amenorreia.', 0.96]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563500147-4', [BACT, 'Hemoptise e suspeita de tuberculose.', 0.94]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563500147-5', [SCM, 'Sinais de gravidez (duplicata).', 0.96]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-3', [DCNT, 'Diabetes e doença renal — DCNT.', 0.93]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-4', [SM, 'Sintomas negativos da esquizofrenia.', 0.97]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-5', [SCC, 'SDR em RN pré-termo — neonatologia.', 0.95]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-7', [URG, 'Dor torácica na atenção primária — emergência cardíaca.', 0.9]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563517223-3', [SV, 'Padrão de febre intermitente — classificação temperatura.', 0.92]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563521756-2', [SCM, 'Tipos de abortamento.', 0.97]],
  ['cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563521756-3', [SCC, 'RN pré-termo — critérios pediátricos além de SV.', 0.9]],
  ['cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779343945057-1', [PROC, 'ECG e derivações — exame complementar.', 0.93]],
  ['cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779344182672-6', [ATB, 'Atribuições do ACS com gestante.', 0.92]],
  ['decorp-enfermagem-verificacao-de-sinais-vitais-1779343811344-4', [DCNT, 'Coma diabético — monitoramento glicemia e SV.', 0.9]],
  ['educa-pb-enfermagem-processo-de-enfermagem-1776056181857-1', [PE, 'Admissão, alta e óbito — etapas PE.', 0.93]],
  ['educa-pb-enfermagem-processo-de-enfermagem-1780007246385-9', [MED, 'Administração de opioide e antiemético.', 0.94]],
  ['educa-pb-enfermagem-semiologia-em-enfermagem-1779563527042-1', [SCC, 'Quando levar criança ao pediatra.', 0.93]],
  ['educa-pb-enfermagem-verificacao-de-sinais-vitais-1779343883917-4', [PE, 'Variações fisiológicas no PE — contexto PE.', 0.88]],
  // batch 05
  ['facape-enfermagem-semiologia-em-enfermagem-1779563486900-8', [URG, 'Triagem de pico hipertensivo — emergência.', 0.9]],
  ['fafipa-enfermagem-processo-de-enfermagem-1780009379028-6', [DCNT, 'Classificação HAS estágio 2 — diretriz.', 0.93]],
  ['fafipa-enfermagem-processo-de-enfermagem-1780009386446-6', [SCM, 'Síndromes hipertensivas na gestação.', 0.96]],
  ['fafipa-enfermagem-processo-de-enfermagem-1780009392850-0', [ATB, 'Visita domiciliar na atenção básica.', 0.92]],
  ['fau-unicentro-enfermagem-processo-de-enfermagem-1780002217274-5', [DCNT, 'Classificação pré-hipertensão — diretriz HAS.', 0.92]],
  ['fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-8', [PUNCAO, 'Definição de punção — acesso invasivo.', 0.94]],
  ['fau-unicentro-enfermagem-processo-de-enfermagem-1780002549800-7', [DCNT, 'Classificação PA pela diretriz HAS.', 0.92]],
  ['fau-unicentro-enfermagem-semiologia-em-enfermagem-1779563480978-6', [ANAT, 'Prefixo médico ECTO — terminologia.', 0.95]],
  ['fau-unicentro-enfermagem-semiologia-em-enfermagem-1779563480978-7', [ANAT, 'Sinônimos de afecção — terminologia.', 0.93]],
  ['fau-unicentro-enfermagem-semiologia-em-enfermagem-1779563480978-8', [FISIO, 'Icterícia — semiologia clínica.', 0.9]],
  ['fau-unicentro-enfermagem-semiologia-em-enfermagem-1779563486900-5', [FISIO, 'Sinais flogísticos — processo inflamatório.', 0.91]],
  ['fau-unicentro-enfermagem-semiologia-em-enfermagem-1779563491765-6', [FISIO, 'Sinal flogístico rubor.', 0.9]],
  ['fau-unicentro-enfermagem-semiologia-em-enfermagem-1779563505333-1', [SCM, 'Pródromos do trabalho de parto.', 0.94]],
  ['fauel-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-8', [PROMO, 'Diário do cuidador — prevenção e promoção.', 0.92]],
  ['faurgs-enfermagem-semiologia-em-enfermagem-1779563542813-1', [SM, 'Delirium — saúde mental.', 0.95]],
  ['faurgs-enfermagem-semiologia-em-enfermagem-1779563542813-2', [DCNT, 'Pé diabético — complicação diabetes.', 0.94]],
  ['faurgs-enfermagem-semiologia-em-enfermagem-1779563542813-3', [DCNT, 'Sintomas diabetes mellitus tipo 1.', 0.95]],
  ['fcpc-enfermagem-processo-de-enfermagem-1780004602717-2', [SV, 'Padrão de febre sustentada — curva térmica.', 0.92]],
  ['fcpc-enfermagem-processo-de-enfermagem-1780004602717-4', [OXI, 'DPOC com oxigenoterapia e SpO2.', 0.94]],
  ['fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-0', [MOB, 'Mudança de decúbito para prevenir LPP.', 0.95]],
  ['fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-4', [SV, 'Febre como sinal vital de temperatura.', 0.91]],
  ['fenix-instituto-enfermagem-semiologia-em-enfermagem-1779563467322-3', [FISIO, 'Edema e alterações anatômicas — semiologia.', 0.9]],
  ['fenix-instituto-enfermagem-semiologia-em-enfermagem-1779563495719-3', [DCNT, 'Hipoglicemia em diabético.', 0.93]],
  ['fenix-instituto-enfermagem-semiologia-em-enfermagem-1779563495719-5', [AGUDA, 'Constipação intestinal — eliminações.', 0.88]],
  ['fepese-enfermagem-processo-de-enfermagem-1780002110600-9', [MED, 'Glicemia capilar e glicosímetro — vigilância medicamentosa/diabetes.', 0.91]],
  // batch 06
  ['fgv-enfermagem-processo-de-enfermagem-1780002110600-4', [URG, 'Trauma amputação — avaliação primária BT.', 0.95]],
  ['fgv-enfermagem-semiologia-em-enfermagem-1779563491765-8', [URG, 'Choque grave na UPA.', 0.95]],
  ['fgv-enfermagem-semiologia-em-enfermagem-1779563495719-0', [SM, 'Distúrbios psicológicos — saúde mental.', 0.94]],
  ['funatec-enfermagem-semiologia-em-enfermagem-1779563527042-2', [FISIO, 'Icterícia e obstrução biliar — semiologia.', 0.9]],
  ['funatec-enfermagem-semiologia-em-enfermagem-1779563527042-3', [DCNT, 'Semiologia de insuficiência cardíaca.', 0.91]],
  ['fundatec-enfermagem-processo-de-enfermagem-1776056158507-3', [ATB, 'Melhor em Casa — atribuições domiciliar.', 0.92]],
  ['fundatec-enfermagem-processo-de-enfermagem-1776056181857-8', [PE, 'Anotações de enfermagem — documentação PE.', 0.94]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780001903454-3', [PROC, 'Eletrocardiograma — exame complementar.', 0.94]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780006962671-0', [MED, 'Reação anafilática pós-medicamento.', 0.93]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780006962671-2', [MED, 'Analgesia em politrauma — administração medicamentos.', 0.92]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780006962671-4', [MED, 'Manejo medicamentoso de crise hipertensiva.', 0.93]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780006969552-7', [FISIO, 'Perfusão renal na UTI — fisiologia hemodinâmica.', 0.88]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780006969552-9', [URG, 'TCE grave com hipertensão intracraniana.', 0.95]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780006976703-7', [URG, 'Emergência hipertensiva com papiledema.', 0.94]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780007230169-2', [AGUDA, 'Glomerulonefrite aguda — doença renal aguda.', 0.9]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780011956256-7', [SCC, 'Teste do coraçãozinho — triagem neonatal.', 0.94]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563480978-2', [OXI, 'Sons respiratórios em crianças.', 0.91]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563480978-3', [URG, 'Fratura úmero e lesão nervo radial — trauma.', 0.9]],
  // batch 07
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563480978-4', [MOB, 'Imobilização prolongada e complicações.', 0.91]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563486900-3', [URG, 'Sinal de Levine — dor cardíaca.', 0.9]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563495719-4', [URG, 'Avaliação pupilar neurológica.', 0.9]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563500147-7', [SV, 'Interpretação de PA, FC, FR e temperatura.', 0.95]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563505333-0', [SV, 'Padrões febris remitente — temperatura.', 0.93]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563517223-7', [SCM, 'Hipogonadismo — saúde da mulher/endócrino.', 0.9]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563531989-3', [URG, 'Sinal de Battle — trauma craniano.', 0.94]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563537258-2', [FISIO, 'Terminologia xerostomia e polidipsia.', 0.9]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563537258-3', [ANAT, 'Terminologia pupilar (isocoria, anisocoria).', 0.93]],
  ['fundatec-enfermagem-semiologia-em-enfermagem-1779563537258-4', [FISIO, 'Nomenclatura de evacuações — semiologia.', 0.88]],
  ['fundep-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-4', [PROMO, 'Prevenção de hipertensão em risco.', 0.92]],
  ['fundep-enfermagem-semiologia-em-enfermagem-1779563512485-3', [MED, 'Melena e uso de AINEs — semiologia GI/medicamentos.', 0.88]],
  ['fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-2', [DCNT, 'Cuidados em doenças cardiovasculares.', 0.9]],
  ['funtef-enfermagem-semiologia-em-enfermagem-1779563517223-5', [SCM, 'Alteração mamária — saúde da mulher.', 0.94]],
  ['furb-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-7', [AUDIT, 'Auditoria e qualidade em saúde coletiva.', 0.93]],
  ['furb-enfermagem-semiologia-em-enfermagem-1779563500147-2', [OXI, 'Hemoptise — semiologia respiratória.', 0.9]],
  ['gama-enfermagem-semiologia-em-enfermagem-1779563467322-7', [SONDA, 'Disúria pós-cateterismo vesical.', 0.94]],
  ['grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-1', [OXI, 'DPOC com oxigenoterapia domiciliar e SpO2.', 0.95]],
  ['grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-7', [SCM, 'Pré-eclâmpsia em gestante — obstetrícia.', 0.96]],
  ['iaupe-enfermagem-processo-de-enfermagem-1776056149404-2', [URG, 'Atribuições em urgência/emergência.', 0.92]],
  ['iaupe-enfermagem-semiologia-em-enfermagem-1779563512485-5', [AGUDA, 'Pneumonia — doença aguda respiratória.', 0.93]],
]);

const SV_CORE =
  /sinais?\s+vitais|aferi|aferição|pressão arterial|frequência cardíaca|frequência respiratória|pulso apical|pulso radial|esfigmoman|manguito|korotkoff|oxímetr|spo2|saturação de oxigênio|termômetr|bradicard|taquicard|taquipne|bradipne|normocárd|eupnei|normoten|hipertenso|hipotenso|hiperpirex|hipoterm|febril|afebril|ictus cordis|curva térmica|padrão.*febre|padrões febris|sons de korotkoff|déficit de pulso|pulso paradoxal/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug);
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === SV,
      rationale,
    };
  }

  const text = `${instruction} ${options}`.toLowerCase();

  // Tema central = técnica/interpretação de SV (antes de regras genéricas)
  if (SV_CORE.test(text)) {
    const nonSvDominant =
      /atribuições do (técnico|acs|agente)|exceto:|não faz parte das atribuições|melhor em casa.*exceto|abortamento|esquizofrenia|meningite|tuberculose|hanseníase|eletrocardiograma|ecg\b|oxigenioterapia.*instituir|primeiros socorros|choque hipovolêmico|samu\b|avc\b|escala de cincinnati/i;
    if (!nonSvDominant.test(text)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: SV,
        confidence: 0.93,
        keep_current: true,
        rationale: 'Técnica ou interpretação de sinais vitais (PA/FC/FR/temp/SpO2).',
      };
    }
  }

  // Regras por tema dominante (ordem de prioridade)
  const rules = [
    { re: /esquizofrenia|delírio|alucinação|psiquiatr|saúde mental|transtorno bipolar|autismo|depressão/, to: SM, r: 'Psiquiatria e saúde mental.', c: 0.94 },
    { re: /abortamento|gestante|gestação|pré-natal|parto|puerpério|fetal|eclampsia|obstetr|amenorreia|mamografia|cardiotocografia/, to: SCM, r: 'Gestação/parto/obstetrícia.', c: 0.93 },
    { re: /recém-nascido|neonat|lactente|puericultura|pediatr|criança menor|sbp.*lactente|teste do coraçãozinho|síndrome do desconforto respiratório/, to: SCC, r: 'Saúde da criança/neonatologia.', c: 0.92 },
    { re: /meningite|tuberculose|hanseníase|tétano|sarampo|covid|influenza/, to: BACT, r: 'Doença infecciosa bacteriana/aguda.', c: 0.91 },
    { re: /diabetes mellitus|diabete melito|hipoglicemia|hiperglicemia|pé diabético|coma diabético|glomerulonefrite|insuficiência cardíaca|hipertensão arterial sistêmica|diretriz brasileira de hipertensão|doença renal crônica|doenças crônicas degenerativas/, to: DCNT, r: 'DCNT (HAS, diabetes, ICC).', c: 0.91 },
    { re: /dpoc|asma|doença pulmonar obstrutiva/, to: DRC, r: 'Doença respiratória crônica.', c: 0.9 },
    { re: /oxigenioterapia|oxigênio suplementar|máscara de o2|inalação de oxigênio|hipoxemia.*oxig/, to: OXI, r: 'Oxigenoterapia e cuidados respiratórios.', c: 0.93 },
    { re: /primeiros socorros|samu|bt\d|suporte básico de vida|rcp|reanimação cardiopulmonar|acidente vascular cerebral|escala de cincinnati|choque hipovolêmico|politraumatizado|trauma cran|tce grave|emergência hipertensiva|papiledema/, to: URG, r: 'Urgência/emergência.', c: 0.93 },
    { re: /úlcera.*pressão|lesão por pressão|lpp|mudança.*decúbito|posicionamento do paciente/, to: MOB, r: 'Mobilização e prevenção de LPP.', c: 0.92 },
    { re: /cateterismo vesical|sonda vesical|svd/, to: SONDA, r: 'Manejo de sondas.', c: 0.93 },
    { re: /pressão venosa central|pvc|cateter venoso central/, to: PUNCAO, r: 'Acesso venoso e cateteres.', c: 0.92 },
    { re: /administração de medicamento|administrar.*medicamento|prescrição médica de|analgésico opioide|reação adversa medicamentosa|6 certos|glicosímetro|glicemia capilar/, to: MED, r: 'Cuidados na administração de medicamentos.', c: 0.91 },
    { re: /pré.?operat|pós.?operat|perioperat|srpa|recuperação anestésica/, to: PERI, r: 'Assistência perioperatória.', c: 0.92 },
    { re: /atenção básica.*atribuições|atribuições.*atenção básica|melhor em casa|estratégia saúde da família.*atribuições|agente comunitário.*(não|atribuições)|papel do acs|população adscrita.*atenção primária|acolhimento.*pnh|política nacional de humanização/, to: ATB, r: 'Atenção básica/saúde da família.', c: 0.9 },
    { re: /promoção.*saúde|prevenção de agravos|hábitos alimentares saudáveis/, to: PROMO, r: 'Promoção à saúde.', c: 0.9 },
    { re: /processo de enfermagem|sae|nanda|anotações de enfermagem|passagem de plantão|admissão.*alta|registro.*prontuário/, to: PE, r: 'Processo de enfermagem.', c: 0.88 },
    { re: /eletrocardiograma|ecg|derivações precordiais/, to: PROC, r: 'ECG — procedimento complementar.', c: 0.92 },
    { re: /prefixo|terminologia|sinônimo.*afecção|anatomia|estrutura corporal/, to: ANAT, r: 'Terminologia/anatomia.', c: 0.9 },
    { re: /semiologia|sinal de |sintoma.*sugere|patologia|inflamatório|flogístic/, to: FISIO, r: 'Semiologia/fisiologia clínica.', c: 0.85, skipSvSlug: true },
  ];

  for (const rule of rules) {
    if (rule.skipSvSlug && slug.includes('verificacao-de-sinais-vitais')) continue;
    if (rule.re.test(text) || rule.re.test(slug)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: rule.to,
        confidence: rule.c,
        keep_current: rule.to === SV,
        rationale: rule.r,
      };
    }
  }

  // slug verificacao-de-sinais-vitais sem outro tema → manter
  if (slug.includes('verificacao-de-sinais-vitais')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: SV,
      confidence: 0.9,
      keep_current: true,
      rationale: 'Conteúdo de verificação de sinais vitais.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: SV,
    confidence: 0.75,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de SV — manter bucket.',
  };
}

const OUT = 'artifacts/reclass/faixa-a/sinais-vitais';
let totalScanned = 0;
let totalMoves = 0;
const moveList = [];

for (let b = 1; b <= 7; b++) {
  const batch = String(b).padStart(2, '0');
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8'));
  const inferences = data.items.map((it) => classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''));
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: SV, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  moves.forEach((m) => moveList.push({ batch, slug: m.modulo_slug, to: m.suggested_subtopico, c: m.confidence }));
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves, move_list: moveList }, null, 2));
