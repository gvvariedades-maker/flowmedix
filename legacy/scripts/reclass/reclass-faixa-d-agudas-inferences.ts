#!/usr/bin/env tsx
/**
 * Onda 9 — Questões Mescladas e Outras Doenças Agudas (11 questões, batch único).
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

const BUCKET = 'Questões Mescladas e Outras Doenças Agudas';
const OUT = 'artifacts/reclass/faixa-d/agudas';

const APS = 'Atenção Básica / Saúde da Família';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const EPI = 'Epidemiologia e Vigilância Epidemiológica';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const BACTER = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const URG = 'Urgências e Emergências';
const PARASIT = 'Doenças Parasitárias e Zoonoses';

/** Classificação por leitura do enunciado (agente). */
const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'coseac-uff-enfermagem-semiologia-em-enfermagem-1779563531989-9': {
    suggested_subtopico: APS,
    confidence: 0.93,
    keep_current: false,
    rationale: '[agent] Disúria/polaciúria na demanda espontânea da UBS — semiologia na APS.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-7': {
    suggested_subtopico: OXI,
    confidence: 0.94,
    keep_current: false,
    rationale: '[agent] Pneumonia PAC — cuidado prioritário respiratório e expansão pulmonar.',
  },
  'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-0': {
    suggested_subtopico: EPI,
    confidence: 0.92,
    keep_current: false,
    rationale: '[agent] Dengue grave no PS — foco em notificação compulsória correta.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-2': {
    suggested_subtopico: DCNT,
    confidence: 0.93,
    keep_current: false,
    rationale: '[agent] Glomerulonefrite aguda — cuidados de enfermagem em doença renal.',
  },
  'furb-enfermagem-semiologia-em-enfermagem-1779563500147-2': {
    suggested_subtopico: OXI,
    confidence: 0.92,
    keep_current: false,
    rationale: '[agent] Definição de hemoptise — semiologia respiratória.',
  },
  'iaupe-enfermagem-semiologia-em-enfermagem-1779563512485-5': {
    suggested_subtopico: BACTER,
    confidence: 0.91,
    keep_current: false,
    rationale: '[agent] Pneumonia pneumocócica — clínica de infecção bacteriana pulmonar.',
  },
  'ibam-enfermagem-semiologia-em-enfermagem-1779563495719-1': {
    suggested_subtopico: URG,
    confidence: 0.95,
    keep_current: false,
    rationale: '[agent] Abdome agudo — sinais de Murphy, Jobert e Gersuny na urgência.',
  },
  'ibfc-enfermagem-semiologia-em-enfermagem-1779563527042-4': {
    suggested_subtopico: PARASIT,
    confidence: 0.96,
    keep_current: false,
    rationale: '[agent] Acidente por aranha armadeira (Phoneutria) — zoonose/peçonha.',
  },
  'idecan-enfermagem-questoes-mescladas-e-outras-doencas-agudas-1780066992037-8': {
    suggested_subtopico: BACTER,
    confidence: 0.91,
    keep_current: false,
    rationale: '[agent] V/F sobre tipos e fisiopatologia da pneumonia infecciosa.',
  },
  'instituto-consulplan-enfermagem-semiologia-em-enfermagem-1779563531989-2': {
    suggested_subtopico: BACTER,
    confidence: 0.94,
    keep_current: false,
    rationale: '[agent] Meningite bacteriana — sinal de Kernig e irritação meníngea.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-8': {
    suggested_subtopico: PARASIT,
    confidence: 0.96,
    keep_current: false,
    rationale: '[agent] Picada de escorpião — sinais de gravidade do envenenamento.',
  },
};

function main() {
  const batchPath = resolve(process.cwd(), OUT, 'batch-01.json');
  const batch = JSON.parse(readFileSync(batchPath, 'utf8')) as {
    items: { modulo_slug: string }[];
  };

  const inferences: InferRow[] = [];
  for (const item of batch.items) {
    const override = OVERRIDES[item.modulo_slug];
    if (!override) {
      throw new Error(`Sem classificação para ${item.modulo_slug}`);
    }
    inferences.push({ modulo_slug: item.modulo_slug, ...override });
  }

  const outPath = resolve(process.cwd(), OUT, 'batch-01-inferred.json');
  writeFileSync(
    outPath,
    JSON.stringify({ batch: '01', bucket: BUCKET, inferences }, null, 2) + '\n',
  );

  const moves = inferences.filter((i) => !i.keep_current && i.confidence >= 0.9).length;
  console.log(
    JSON.stringify(
      { bucket: BUCKET, scanned: inferences.length, moves, out: outPath },
      null,
      2,
    ),
  );
}

main();
