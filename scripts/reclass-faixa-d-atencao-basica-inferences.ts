#!/usr/bin/env tsx
/** Classificações agente — Atenção Básica / Saúde da Família (faixa D, onda 5). */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Atenção Básica / Saúde da Família';
const OUT = 'artifacts/reclass/faixa-d/atencao-basica';

/** Movimentações com tema dominante fora do bucket APS/ESF. */
const MOVES: Record<
  string,
  { suggested_subtopico: string; confidence: number; rationale: string }
> = {
  'amauc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-5': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'Elaboração do Plano de Saúde — análise situacional e metas do gestor.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780011872350-3': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.92,
    rationale: 'Norma técnica de dados antropométricos — peso e estatura no acompanhamento.',
  },
  'copese-ufpi-enfermagem-atencao-basica-saude-da-familia-1778967776515-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.91,
    rationale: 'Proteção do ACE e manejo integrado de vetores no controle de endemias.',
  },
  'facet-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-5': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.94,
    rationale: 'Técnicas de levantamento de condições de vida para planejamento em saúde.',
  },
  'fafipa-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-4': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.95,
    rationale: 'TRIA de insegurança alimentar na visita domiciliar — rastreamento nutricional.',
  },
  'funatec-enfermagem-atencao-basica-saude-da-familia-1778968239687-0': {
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.96,
    rationale: 'Técnicas de comunicação terapêutica — paráfrase e habilidades de relação.',
  },
  'ibade-enfermagem-atencao-basica-saude-da-familia-1778968144588-3': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.92,
    rationale: 'Coleta de dados demográficos e socioeconômicos para planejamento em saúde.',
  },
  'igecap-enfermagem-processo-de-enfermagem-1780004452857-2': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Definição de Região de Saúde — agrupamento de municípios limítrofes.',
  },
  'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-2': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.95,
    rationale: 'Criança com diarreia e sinais de desidratação na Atenção Básica.',
  },
  'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-5': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Câncer na AB — promoção, prevenção e detecção precoce.',
  },
  'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001297464-8': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.95,
    rationale: 'Assistência à criança com diarreia e desidratação na Atenção Básica.',
  },
  'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001362784-1': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Papel da AB na prevenção e detecção precoce do câncer.',
  },
  'instituto-access-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-1': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    rationale: 'ACS promovendo ações de educação em saúde na comunidade.',
  },
  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968094018-1': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.96,
    rationale: 'Consulta de puericultura — criança de 10 meses e Caderno de Atenção Básica.',
  },
  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-4': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.94,
    rationale: 'ACS identificando situações de risco de maus-tratos à criança.',
  },
  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-7': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.95,
    rationale: '5º Dia de Saúde Integral do recém-nascido na UBS.',
  },
  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968323839-5': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'Levantamento de condições de vida e saúde da população para planejamento.',
  },
  'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-3': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.94,
    rationale: 'Acesso à saúde como pré-requisito da promoção e universalidade.',
  },
  'instituto-verbena-enfermagem-atencao-basica-saude-da-familia-1778968194611-1': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.95,
    rationale: 'Visita domiciliar pós-parto — avaliação do recém-nascido.',
  },
  'selecon-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-8': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'NOB/SUS 96 e Programação Pactuada e Integrada — regionalização.',
  },
  'unesc-enfermagem-atencao-basica-saude-da-familia-1778968028412-1': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.96,
    rationale: 'Atribuições do técnico no pré-natal de baixo risco — CAB MS.',
  },
  'unesc-enfermagem-atencao-basica-saude-da-familia-1780001297464-7': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.96,
    rationale: 'Atribuições do técnico no pré-natal de baixo risco — CAB MS.',
  },
  'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968323839-4': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.95,
    rationale: 'Atribuições do técnico de enfermagem na assistência pré-natal na AB.',
  },
  'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968357339-4': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.94,
    rationale: 'Prevenção do câncer do colo do útero — atribuições do técnico na AB.',
  },
};

function shortRationale(instruction: string): string {
  const one = instruction.replace(/\s+/g, ' ').trim();
  const cut = one.length > 72 ? `${one.slice(0, 69)}…` : one;
  return `Tema dominante ESF/APS: ${cut}`;
}

function loadBatch(batch: string): InferRow[] {
  const rel = `${OUT}/batch-${batch}.json`;
  const data = JSON.parse(readFileSync(resolve(process.cwd(), rel), 'utf8')) as {
    items: { modulo_slug: string; instruction: string }[];
  };
  return data.items.map((item) => {
    const move = MOVES[item.modulo_slug];
    if (move) {
      return {
        modulo_slug: item.modulo_slug,
        suggested_subtopico: move.suggested_subtopico,
        confidence: move.confidence,
        keep_current: false,
        rationale: move.rationale,
      };
    }
    return {
      modulo_slug: item.modulo_slug,
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: shortRationale(item.instruction),
    };
  });
}

const BATCH01 = loadBatch('01');
const BATCH02 = loadBatch('02');
const BATCH03 = loadBatch('03');

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`${BUCKET} batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

const total = BATCH01.length + BATCH02.length + BATCH03.length;
if (total !== 141) {
  throw new Error(`Esperado 141 questões, obtido ${total}`);
}
if (Object.keys(MOVES).length !== 24) {
  throw new Error(`Esperado 24 movimentações, obtido ${Object.keys(MOVES).length}`);
}

writeInferred('01', BATCH01);
writeInferred('02', BATCH02);
writeInferred('03', BATCH03);

const all = [...BATCH01, ...BATCH02, ...BATCH03];
const moves = all.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(`TOTAL: ${all.length} scanned, ${moves.length} moves (>=0.90)`);
