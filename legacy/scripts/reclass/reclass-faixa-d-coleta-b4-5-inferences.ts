#!/usr/bin/env tsx
/**
 * Onda 7 — Coleta de Exames Laboratoriais, lotes 04–05 (faixa D).
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-d-coleta-b4-5-inferences.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const COLETA = 'Coleta de Exames Laboratoriais';
const OUT = 'artifacts/reclass/faixa-d/coleta-exames';
const FISIO = 'Noções de Fisiologia';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const SV = 'Verificação de Sinais Vitais';
const URG = 'Urgências e Emergências';
const PRECAU = 'Medidas de Prevenção e Precaução de Contato';
const PE = 'Processo de Enfermagem';
const PROC = 'Procedimentos Diversos';
const SCM = 'Saúde da Mulher';
const SCRI = 'Saúde da Criança';
const BACT = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const EPID = 'Epidemiologia e Vigilância Epidemiológica';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  ['igeduc-enfermagem-processo-de-enfermagem-1780009392850-8', [PRECAU, 'Biossegurança geral, EPI e descarte de resíduos — precauções padrão.', 0.94]],
  ['imparh-enfermagem-exames-laboratoriais-1779563631609-0', [FISIO, 'Distúrbio metabólico — hipernatremia e equilíbrio eletrolítico.', 0.94]],
  ['inaz-do-para-enfermagem-exames-laboratoriais-1779563559434-9', [FISIO, 'Componentes do sangue — hemácias e função fisiológica.', 0.93]],
  ['instituto-access-enfermagem-coleta-de-exames-laboratoriais-1779563272300-5', [DCNT, 'Complicações e mortalidade do diabetes mellitus.', 0.92]],
  ['instituto-access-enfermagem-exames-laboratoriais-1779563559434-3', [BACT, 'Diagnóstico laboratorial da tuberculose pulmonar.', 0.91]],
  ['instituto-access-enfermagem-exames-laboratoriais-1779563613404-7', [DCNT, 'Hipoglicemia em paciente com diabetes.', 0.93]],
  ['instituto-aocp-enfermagem-exames-laboratoriais-1779563646977-1', [VIRAL, 'RT-PCR em tempo real para diagnóstico de doenças virais.', 0.92]],
  ['instituto-consulpam-enfermagem-exames-complementares-1779563674260-5', [SV, 'Classificação da pressão arterial de medição casual.', 0.95]],
  ['instituto-consulpam-enfermagem-exames-complementares-1779563674260-6', [URG, 'Escala de Coma de Glasgow na avaliação neurológica.', 0.93]],
  ['instituto-consulplan-enfermagem-coleta-de-exames-laboratoriais-1779563272300-6', [DCNT, 'Monitorização glicêmica capilar no controle do diabetes.', 0.91]],
  ['instituto-evo-enfermagem-exames-complementares-1779563655698-7', [URG, 'Objetivo da escala de Glasgow na avaliação de pacientes.', 0.93]],
  ['instituto-iacp-enfermagem-processo-de-enfermagem-1780003637054-0', [PRECAU, 'Exposição ocupacional a HIV por perfurocortante — PEP e precauções.', 0.94]],
  ['instituto-verbena-enfermagem-coleta-de-exames-laboratoriais-1779563248005-6', [VIRAL, 'Condutas pós-coleta de swab nasofaringe para COVID-19.', 0.92]],
  ['instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-2', [PRECAU, 'Acidente com material biológico e condutas de biossegurança.', 0.93]],
  ['intec-enfermagem-coleta-de-exames-laboratoriais-1779563248005-7', [SCRI, 'Programa Nacional de Triagem Neonatal — teste do pezinho.', 0.91]],
  ['isba-enfermagem-exames-complementares-1779563685104-3', [BACT, 'Tuberculose — etiologia e doença infectocontagiosa.', 0.94]],
  ['iset-enfermagem-exames-complementares-1779563655698-4', [DCNT, 'Quadro clínico de diabetes tipo 2 e hipertensão.', 0.9]],
  ['iset-enfermagem-exames-complementares-1779563655698-5', [DCNT, 'Cetoacidose diabética em paciente com diabetes tipo 1.', 0.92]],
  ['itame-enfermagem-exames-complementares-1779563679414-4', [PE, 'Cadastro e guarda de exames no prontuário do paciente.', 0.93]],
  ['itame-enfermagem-exames-laboratoriais-1779563559434-4', [FISIO, 'Conceito e utilidade da gasometria arterial em UTI.', 0.91]],
  ['ivin-enfermagem-exames-laboratoriais-1779563559434-6', [DCNT, 'Hipoglicemia como complicação aguda do diabetes mellitus.', 0.93]],
  ['lj-assessoria-enfermagem-exames-complementares-1779563668619-1', [PROC, 'Abrangência dos procedimentos de análises complementares.', 0.9]],
  ['metrocapital-enfermagem-exames-laboratoriais-1779563631609-1', [FISIO, 'Interpretação de leucopenia no hemograma.', 0.93]],
  ['objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779563140631-7', [DCNT, 'Indicação da glicemia capilar no acompanhamento do diabético.', 0.91]],
  ['objetiva-concursos-enfermagem-exames-laboratoriais-1779563549311-8', [DCNT, 'Valores de referência da glicemia em jejum e pós-prandial.', 0.92]],
  ['objetiva-concursos-enfermagem-exames-laboratoriais-1779563613404-1', [DCNT, 'Testes laboratoriais para diagnóstico e monitoramento da glicose.', 0.93]],
  ['objetiva-concursos-enfermagem-exames-laboratoriais-1779563613404-8', [URG, 'Exame principal para confirmar meningite — punção lombar/LCR.', 0.94]],
  ['omni-enfermagem-exames-laboratoriais-1779563646977-5', [VIRAL, 'Sorologia viral com amostras pareadas aguda/convalescente.', 0.94]],
  ['quadrix-enfermagem-exames-laboratoriais-1779563613404-6', [FISIO, 'Hipercalemia — distúrbio eletrolítico do potássio.', 0.94]],
  ['selecon-enfermagem-exames-complementares-1779563668619-4', [SCRI, 'Doença de Perthes — osteonecrose do quadril em crianças.', 0.95]],
  ['selecon-enfermagem-exames-complementares-1779563674260-7', [PROC, 'Artefatos em radiografia — imagens não anatômicas.', 0.91]],
  ['selecon-enfermagem-exames-laboratoriais-1779563621885-4', [FISIO, 'Componentes da gasometria arterial — equilíbrio ácido-base.', 0.91]],
  ['unesc-enfermagem-exames-complementares-1779563674260-4', [SCM, 'Acompanhamento pré-natal e gestação saudável.', 0.94]],
  ['unesc-enfermagem-exames-laboratoriais-1779563621885-5', [FISIO, 'Hipocalemia — valores de referência do potássio sérico.', 0.93]],
  ['unifil-enfermagem-exames-laboratoriais-1779563646977-4', [IST, 'VDRL para diagnóstico de sífilis.', 0.96]],
  ['unifil-enfermagem-exames-laboratoriais-1779563650975-0', [DCNT, 'Automonitorização da glicemia capilar no paciente diabético.', 0.92]],
  ['unifil-enfermagem-exames-laboratoriais-1779563650975-1', [FISIO, 'Fezes acólicas — alteração biliar e fisiologia digestiva.', 0.9]],
  ['univali-enfermagem-exames-complementares-1779563674260-1', [SV, 'Aferição da pressão arterial pelo método auscultatório.', 0.95]],
  ['univali-enfermagem-processo-de-enfermagem-1780010594524-5', [PROC, 'Definição e papel dos exames complementares no diagnóstico.', 0.9]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-4', [SCM, 'Preparo para exame citopatológico do colo uterino.', 0.95]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-3', [SCRI, 'Alta do recém-nascido e teste do pezinho na maternidade.', 0.91]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-9', [SCM, 'Teste de gravidez — orientação e realização.', 0.93]],
  ['vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563818401-2', [EPID, 'Notificação compulsória semanal de agravos.', 0.96]],
  ['vunesp-enfermagem-exames-complementares-1779424094915-0', [URG, 'Diarreia aquosa e desidratação na unidade de pronto atendimento.', 0.92]],
  ['vunesp-enfermagem-exames-complementares-1779563685104-0', [URG, 'Instrumentos para avaliação do estado neurológico.', 0.91]],
  ['vunesp-enfermagem-exames-laboratoriais-1779563621885-2', [DCNT, 'Monitorização da glicemia de diabéticos na UBS.', 0.91]],
  ['vunesp-enfermagem-exames-laboratoriais-1779563650975-3', [FISIO, 'Interpretação de hemograma — leucócitos e plaquetas.', 0.93]],
  ['legalle-enfermagem-processo-de-enfermagem-1780010585356-7', [COLETA, 'Técnica de coleta de sangue para sorologia de ISTs/AIDS.', 0.94]],
  ['reis-e-reis-enfermagem-coleta-de-exames-laboratoriais-1779562768558-8', [COLETA, 'Hemólise como intercorrência na qualidade da amostra coletada.', 0.93]],
  ['objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779563140631-1', [COLETA, 'Recomendações para coleta de escarro — técnica de amostra.', 0.94]],
  ['unifil-enfermagem-coleta-de-exames-laboratoriais-1779562768558-0', [COLETA, 'Coleta de sangue em papel-filtro para teste do pezinho.', 0.94]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-5', [COLETA, 'Técnica adequada de coleta de escarro para baciloscopia.', 0.94]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-7', [COLETA, 'Cuidados na coleta de escarro para baciloscopia de TB.', 0.94]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563200105-4', [COLETA, 'Coleta de escarro para diagnóstico e acompanhamento da TB.', 0.94]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563248005-5', [COLETA, 'Procedimento de coleta do teste de triagem neonatal.', 0.94]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563272300-7', [COLETA, 'Cuidados na coleta de escarro para baciloscopia.', 0.94]],
  ['vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563200105-0', [COLETA, 'Cuidados na verificação da glicemia capilar — técnica de coleta.', 0.91]],
  ['instituto-verbena-enfermagem-coleta-de-exames-laboratoriais-1779563248005-6', [COLETA, 'Condutas pós-coleta de swab para COVID-19 — manejo da amostra.', 0.92]],
]);

const COLETA_CORE =
  /coleta de (sangue|urina|fezes|escarro|materiais|amostras|material)|hemocultura|urocultura|baciloscopia.*escarro|gasometria arterial.*coleta|teste do pezinho|triagem neonatal|swab.*nasofaringe|papel-filtro|tubo.*edta|tampa roxa|ordem dos tubos|torniquete.*coleta|homogeneiza.*amostra|antissepsia.*punção|urina de 24 horas|controle de diurese|jejum.*exame|preparo.*coleta|acondicionamento da amostra|identificação.*paciente.*coleta|hemólise.*amostra|gama.?gt.*jejum|preservação de amostra/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === COLETA,
      rationale,
    };
  }

  const text = `${instruction} ${options}`.toLowerCase();

  if (COLETA_CORE.test(text) || slug.includes('coleta-de-exames-laboratoriais')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: COLETA,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Técnica, preparo ou preservação de amostras laboratoriais.',
    };
  }

  const rules: { re: RegExp; to: string; r: string; c: number }[] = [
    { re: /notificação compulsória|vigilância epidemiológica|lista nacional de notificação/i, to: EPID, r: 'Notificação compulsória e vigilância epidemiológica.', c: 0.94 },
    { re: /escala de coma de glasgow|escala de glasgow/i, to: URG, r: 'Escala de Glasgow na avaliação neurológica.', c: 0.92 },
    { re: /pressão arterial.*classificação|aferição da pressão arterial|medição casual.*pressão/i, to: SV, r: 'Aferição e classificação da pressão arterial.', c: 0.93 },
    { re: /\bvdrl\b|sífilis|diagnóstico de aids|\bists?\b/i, to: IST, r: 'Sorologia e diagnóstico de ISTs.', c: 0.93 },
    { re: /rt-pcr|covid-19|sorologia viral|anticorpos.*fase aguda|doenças virais/i, to: VIRAL, r: 'Diagnóstico sorológico ou molecular de doenças virais.', c: 0.91 },
    { re: /tuberculose.*causada|mycobacterium tuberculosis|bacilo de koch.*doença/i, to: BACT, r: 'Tuberculose e doenças bacterianas.', c: 0.91 },
    { re: /citopatológico|colo uterino|teste de gravidez|pré-natal|gestação/i, to: SCM, r: 'Saúde da mulher — gestação ou rastreamento ginecológico.', c: 0.92 },
    { re: /doença de perthes|alta.*recém-nascido.*maternidade/i, to: SCRI, r: 'Saúde da criança — pediatria.', c: 0.91 },
    { re: /diabetes mellitus|diabético|glicemia.*jejum|hipoglicemia|hiperglicemia|cetoacidose|hemoglobina glicada/i, to: DCNT, r: 'Diabetes e controle glicêmico — DCNT.', c: 0.9 },
    { re: /hipernatremia|hiponatremia|hipercalemia|hipocalemia|hemácias|leucopenia|hemograma.*interpret|distúrbio metabólico|equilíbrio ácido-base/i, to: FISIO, r: 'Distúrbios eletrolíticos ou interpretação fisiológica.', c: 0.91 },
    { re: /acidente com material biológico|exposição ocupacional|biossegurança.*epi|descarte de resíduos/i, to: PRECAU, r: 'Biossegurança e precauções no cuidado.', c: 0.91 },
    { re: /prontuário|documentação de enfermagem|registro em prontuário/i, to: PE, r: 'Documentação no processo de enfermagem.', c: 0.9 },
    { re: /radiografia|radiologia|artefatos.*imagem/i, to: PROC, r: 'Exames de imagem — procedimentos complementares.', c: 0.9 },
    { re: /meningite|punção lombar.*lcr|desidratação.*upa/i, to: URG, r: 'Urgência — quadro agudo ou exame diagnóstico emergencial.', c: 0.91 },
  ];

  for (const rule of rules) {
    if (rule.re.test(text) || rule.re.test(slug)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: rule.to,
        confidence: rule.c,
        keep_current: rule.to === COLETA,
        rationale: rule.r,
      };
    }
  }

  if (slug.includes('exames-laboratoriais') || slug.includes('exames-complementares')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: COLETA,
      confidence: 0.88,
      keep_current: true,
      rationale: 'Conteúdo laboratorial sem tema dominante fora de coleta — manter bucket.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: COLETA,
    confidence: 0.78,
    keep_current: true,
    rationale: 'Sem tema dominante claro — manter bucket.',
  };
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['04', '05']) {
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8')) as {
    items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
  };
  const inferences = data.items.map((it) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: COLETA, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));
