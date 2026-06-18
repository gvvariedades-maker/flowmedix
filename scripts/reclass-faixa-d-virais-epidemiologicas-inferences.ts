#!/usr/bin/env tsx
/** Classificações agente — Doenças Virais de Interesse Epidemiológico (faixa D, onda 6). */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET =
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const OUT = 'artifacts/reclass/faixa-d/virais-epidemiologicas';

/** Movimentações com tema dominante fora do bucket de arboviroses / virais epidemiológicos. */
const MOVES: Record<
  string,
  { suggested_subtopico: string; confidence: number; rationale: string }
> = {
  'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale:
      'Conceitos epidemiológicos (latência, infectividade, infecção inaparente) — não doença viral específica.',
  },
  'avancasp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-7': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'Prazo de notificação compulsória de dengue — vigilância epidemiológica.',
  },
  'copese-ufpi-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-7': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'Vigilância entomológica de arboviroses — indicadores e controle de vetores.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-2': {
    suggested_subtopico: 'Oxigenoterapia e Cuidados Respiratórios',
    confidence: 0.92,
    rationale: 'Posição prona na Covid-19 — manobra ventilatória/respiratória.',
  },
  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-6': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.94,
    rationale: 'Terapia com SRO para doença diarreica aguda (DDA) — prevenção de desidratação.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-6': {
    suggested_subtopico:
      'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.96,
    rationale: 'Tosse >3 semanas, febre vespertina e sudorese — quadro clássico de tuberculose.',
  },
  'ideap-geral-epidemiologia-e-vigilancia-epidemiologica-1777103502990-4': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.91,
    rationale: 'Medidas ambientais de prevenção da dengue — vigilância e controle vetorial.',
  },
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-9': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    rationale: 'LIRAa — levantamento de índices do Aedes aegypti para vigilância.',
  },
  'igeduc-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1777103471372-5': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.91,
    rationale: 'Acolhimento e classificação de risco de chikungunya na APS/UPA.',
  },
  'instituto-aocp-geral-procedimentos-1777103510083-2': {
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.92,
    rationale: 'Finalidade técnica da prova do laço como exame de coagulação/fragilidade capilar.',
  },
  'instituto-verbena-enfermagem-atencao-basica-saude-da-familia-1778968194611-0': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.93,
    rationale: 'Controle mecânico de criadouros do Aedes pelo ACS na atenção básica.',
  },
  'ivin-geral-epidemiologia-e-vigilancia-epidemiologica-1777103597693-0': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.92,
    rationale: 'Inseticidas larvicidas (temephós) no programa de controle vetorial da dengue.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010911471-7': {
    suggested_subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
    confidence: 0.94,
    rationale: 'Hepatites virais A–E — transmissão fecal-oral da hepatite A (eixo IST/hepatites).',
  },
  'ms-sarmento-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-5': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.93,
    rationale: 'Doenças reemergentes — conceito epidemiológico (dengue como exemplo).',
  },
  'ms-sarmento-enfermagem-imunizacao-1777103215560-5': {
    suggested_subtopico: 'Imunização',
    confidence: 0.95,
    rationale: 'Catapora (varicela) — transmissão e prevenção vacinal.',
  },
  'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-5': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    rationale: 'Armadilhas e combate químico/biológico ao Aedes — vigilância entomológica.',
  },
  'objetiva-concursos-enfermagem-processo-de-enfermagem-1780010566816-8': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.97,
    rationale: 'Esquistossomose por Schistosoma mansoni — helmintíase parasitária.',
  },
  'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-8': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.92,
    rationale: 'Objetivo da aplicação de larvicidas em criadouros — prevenção comunitária.',
  },
};

function shortRationale(instruction: string): string {
  const one = instruction.replace(/\s+/g, ' ').trim();
  const cut = one.length > 72 ? `${one.slice(0, 69)}…` : one;
  return `Tema viral/arbovirose: ${cut}`;
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
if (total !== 119) {
  throw new Error(`Esperado 119 questões, obtido ${total}`);
}
if (Object.keys(MOVES).length !== 18) {
  throw new Error(`Esperado 18 movimentações, obtido ${Object.keys(MOVES).length}`);
}

writeInferred('01', BATCH01);
writeInferred('02', BATCH02);
writeInferred('03', BATCH03);

const all = [...BATCH01, ...BATCH02, ...BATCH03];
const moves = all.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(`TOTAL: ${all.length} scanned, ${moves.length} moves (>=0.90)`);
