#!/usr/bin/env tsx
/** Onda 8 — Punção Venosa, lotes 01–02 (faixa C). */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const OUT = 'artifacts/reclass/faixa-c/puncao-cateteres';
const MED = 'Cuidados na Administração de Medicamentos';
const BIOS = 'Infecções no Contexto da Biossegurança';
const PE = 'Processo de Enfermagem';
const VIAS = 'Vias de Administração';
const PROC = 'Procedimentos Diversos';
const URG = 'Urgências e Emergências';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const SEG = 'Segurança do Paciente';
const PREV = 'Medidas de Prevenção e Precaução de Contato';
const FARM = 'Farmacodinâmica e Farmacocinética';

const MANUAL = new Map<string, [string, string, number]>([
  ['amauc-enfermagem-processo-de-enfermagem-1780001517858-6', [MED, 'Reação adversa à vancomicina IV — administração medicamentosa.', 0.92]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780002845055-9', [PREV, 'Descarte de perfurocortantes — precauções padrão.', 0.93]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780003868364-0', [PERI, 'Cuidados pré-operatório imediato.', 0.94]],
  ['avancasp-enfermagem-processo-de-enfermagem-1780006444165-3', [URG, 'XABCDE no trauma — emergência.', 0.95]],
  ['cotec-fadenor-enfermagem-processo-de-enfermagem-1780010579953-1', [URG, 'Choque e perfusão tissular — emergência.', 0.94]],
  ['fcpc-enfermagem-processo-de-enfermagem-1780004906875-1', [SEG, 'Lista de verificação de cirurgia segura OMS.', 0.93]],
  ['fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-6', [URG, 'Parada cardiorrespiratória — RCP.', 0.96]],
  ['fundatec-enfermagem-processo-de-enfermagem-1780006976703-9', [PROC, 'CRRT em UTI — terapia renal contínua.', 0.91]],
  ['fundatec-enfermagem-vias-de-administracao-1776056409987-7', [VIAS, 'Noradrenalina e diluição para via endovenosa.', 0.92]],
  ['grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-8', [MED, 'Preparo e administração segura de medicamentos IV.', 0.93]],
  ['ibade-enfermagem-processo-de-enfermagem-1780005128081-9', [PERI, 'Assistência pós-operatório imediato.', 0.93]],
  ['ibade-enfermagem-processo-de-enfermagem-1780005137458-3', [BIOS, 'Coleta, isolamento e biossegurança simultâneos.', 0.91]],
  ['idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-8', [PROC, 'Administração de contraste radiológico.', 0.92]],
  ['idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-6', [BIOS, 'IRAS — infecção relacionada à assistência.', 0.95]],
  ['idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778712220716-4', [BIOS, 'IRAS — infecção relacionada à assistência.', 0.95]],
  ['idecan-enfermagem-seguranca-do-paciente-1778712220716-9', [MED, 'Cinco certos na terapia endovenosa.', 0.91]],
  ['idecan-enfermagem-vias-de-administracao-1778712108887-3', [MED, 'Preparo de antibióticos e antifúngicos EV.', 0.92]],
  ['igeduc-enfermagem-processo-de-enfermagem-1780010917301-2', [MED, 'Administração de ceftriaxona IV diluída.', 0.94]],
  ['fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-8', [PROC, 'Definição genérica de procedimento invasivo.', 0.9]],
]);

const PUNCAO_CORE =
  /pun[cç][aã]o venosa|venopun[cç][aã]o|acesso venoso|cateter (venoso|intravascular|endovenoso)|cateteres? perif[eé]ric|flebite|extravasamento|infus[aã]o venosa|ven[oó]clise|terapia endovenosa|inser[cç][aã]o do cateter|lock (salinizado|heparinizado)|press[aã]o venosa central|\bPVC\b|curativo de cateter|desinfec[cç][aã]o.*canh[oõ]es|antissepsia.*pun[cç][aã]o|cateteriza[cç][aã]o venosa|mensura[cç][aã]o da pam|jelco|scalp|perman[eê]ncia.*cateter|s[ií]tio de inser[cç][aã]o|corrente sangu[ií]nea.*cateter|ics\b/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === PUNCAO,
      rationale,
    };
  }

  const text = `${instruction} ${options}`;

  if (PUNCAO_CORE.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: PUNCAO,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Acesso venoso, punção, cateter ou cuidados com dispositivo intravascular.',
    };
  }

  if (slug.includes('puncao-venosa-e-cuidados-com-cateteres')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: PUNCAO,
      confidence: 0.92,
      keep_current: true,
      rationale: 'Conteúdo de punção venosa e cuidados com cateteres.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: PUNCAO,
    confidence: 0.78,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de punção — manter bucket.',
  };
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['01', '02']) {
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8')) as {
    items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
  };
  const inferences = data.items.map((it) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: PUNCAO, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));
