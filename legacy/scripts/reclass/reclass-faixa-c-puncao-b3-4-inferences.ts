#!/usr/bin/env tsx
/**
 * Onda 8 — Punção Venosa e Cuidados com Cateteres, lotes 03–04 (faixa C).
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-c-puncao-b3-4-inferences.ts
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

const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const OUT = 'artifacts/reclass/faixa-c/puncao-cateteres';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const MED = 'Cuidados na Administração de Medicamentos';
const BIOS = 'Infecções no Contexto da Biossegurança';
const PE = 'Processo de Enfermagem';
const SONDA = 'Instalação e Manejo de Sondas';
const VIAS = 'Vias de Administração';
const FISIO = 'Noções de Fisiologia';
const PROC = 'Procedimentos Diversos';
const URG = 'Urgências e Emergências';
const MULHER = 'Saúde da Mulher';
const SEG = 'Segurança do Paciente';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  [
    'instituto-access-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-6',
    [DCNT, 'Falência renal — dispositivos de hemodiálise (Shiley).', 0.94],
  ],
  [
    'instituto-access-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-5',
    [DCNT, 'Diálise peritoneal e cateter de Tenckhoff — terapia renal.', 0.94],
  ],
  [
    'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-0',
    [MED, 'Reação transfusional durante infusão de hemocomponentes.', 0.93],
  ],
  [
    'instituto-aocp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-2',
    [DCNT, 'Cuidados com fístula arteriovenosa em doença renal crônica.', 0.94],
  ],
  [
    'instituto-consulplan-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-2',
    [BIOS, 'IRAS hospitalar — prevenção e controle de infecção relacionada à assistência.', 0.92],
  ],
  [
    'instituto-verbena-enfermagem-processo-de-enfermagem-1780008197597-6',
    [BIOS, 'Biossegurança na coleta, curativos e acesso venoso.', 0.93],
  ],
  [
    'instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-6',
    [PROC, 'Aplicação de calor como intervenção terapêutica — contraindicações.', 0.91],
  ],
  [
    'instituto-verbena-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-0',
    [PE, 'Registros de enfermagem após acesso venoso periférico.', 0.93],
  ],
  [
    'iset-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-8',
    [URG, 'Desidratação grave por diarreia — reposição volêmica urgente.', 0.92],
  ],
  [
    'ivin-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-1',
    [PROC, 'Cateterismo cardíaco diagnóstico — cuidados peri-procedimento.', 0.93],
  ],
  [
    'metrocapital-enfermagem-vias-de-administracao-1778968768987-4',
    [MED, 'Fármacos de alta vigilância em bomba de infusão.', 0.92],
  ],
  [
    'objetiva-concursos-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-2',
    [FISIO, 'Terapia nutricional parenteral — nutrição intravenosa.', 0.91],
  ],
  [
    'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-4',
    [PUNCAO, 'Venóclise — administração de fluidos e medicamentos por veia.', 0.94],
  ],
  [
    'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-0',
    [VIAS, 'Técnica e ângulo de administração endovenosa em veia cubital.', 0.91],
  ],
  [
    'quadrix-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-1',
    [SONDA, 'Alterações urinárias em paciente com sonda vesical de demora.', 0.94],
  ],
  [
    'selecon-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-3',
    [SONDA, 'ITU relacionada à cateterização urinária — prevenção de IRAS.', 0.94],
  ],
  [
    'unifil-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-6',
    [SONDA, 'Prevenção de ITU associada a cateter vesical (ITU-AC).', 0.94],
  ],
  [
    'unifil-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-2',
    [MED, 'Cuidados na administração segura de medicamentos endovenosos.', 0.92],
  ],
  [
    'univali-enfermagem-processo-de-enfermagem-1780010600919-5',
    [MED, 'Escolha de via e administração de medicações no pós-operatório.', 0.91],
  ],
  [
    'vunesp-enfermagem-processo-de-enfermagem-1776056149404-7',
    [PE, 'Anotação de enfermagem incompleta após punção venosa.', 0.93],
  ],
  [
    'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-0',
    [MULHER, 'Eclâmpsia em gestante — emergência obstétrica.', 0.95],
  ],
  [
    'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-4',
    [PROC, 'Procedimentos básicos de enfermagem — aspiração de vias aéreas.', 0.92],
  ],
  [
    'vunesp-enfermagem-seguranca-do-paciente-1779563448133-5',
    [SEG, 'Iatrogenias e erros de medicação — segurança do paciente.', 0.94],
  ],
]);

const PUNCAO_CORE =
  /pun[cç][aã]o venosa|venopun[cç][aã]o|acesso venoso|cateter (venoso|intravascular|endovenoso)|cateteres? perif[eé]ric|flebite|extravasamento|infiltra[cç][aã]o.*acesso|infus[aã]o venosa|ven[oó]clise|terapia endovenosa|inser[cç][aã]o do cateter|lock (salinizado|heparinizado)|hub(s)?.*cateter|bundle.*cateter|infec[cç][aã]o.*corrente sangu[ií]nea.*cateter|ics\b|garrote.*pun[cç][aã]o|jugular interna.*pun[cç][aã]o|f[ií]stula arteriovenosa.*n[aã]o puncionar|shunt.*renal|obstru[cç][aã]o do cateter|curativo de cateter|desinfec[cç][aã]o.*canh[oõ]es|antissepsia.*pun[cç][aã]o|tentativa de pun[cç][aã]o perif[eé]rica|cateteriza[cç][aã]o (venosa|arterial)|mensura[cç][aã]o da pam/i;

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

  const rules: { re: RegExp; to: string; r: string; c: number; skipIfVenoclise?: boolean }[] = [
    {
      re: /di[aá]lise peritoneal|hemodi[aá]lise|tenckhoff|shilley|fal[eê]ncia renal|doen[cç]a renal cr[oô]nica.*f[ií]stula/i,
      to: DCNT,
      r: 'Terapia renal substitutiva ou DRC.',
      c: 0.93,
    },
    {
      re: /transfus[aã]o de (concentrado|plaquetas|hemocomponente)|rea[cç][aã]o transfusional/i,
      to: MED,
      r: 'Hemoterapia e conduta na transfusão.',
      c: 0.92,
    },
    {
      re: /sonda vesical|cateter vesical|itu-ac|itu.*cateteriza[cç][aã]o urin[aá]ria|bolsa coletora.*sonda/i,
      to: SONDA,
      r: 'Cateterismo urinário e ITU associada.',
      c: 0.93,
    },
    {
      re: /registros? de enfermagem|anota[cç][aã]o de enfermagem|documenta[cç][aã]o.*prontu[aá]rio/i,
      to: PE,
      r: 'Registro e documentação de enfermagem.',
      c: 0.92,
    },
    {
      re: /desidrata[cç][aã]o grave|diarreia persistente.*olig[uú]ria/i,
      to: URG,
      r: 'Desidratação grave — manejo urgente.',
      c: 0.91,
    },
    {
      re: /cateterismo card[ií]aco|exame diagn[oó]stico invasivo.*cora[cç][aã]o/i,
      to: PROC,
      r: 'Cateterismo cardíaco — procedimento diagnóstico.',
      c: 0.92,
    },
    {
      re: /terapia nutricional parenteral|\btnp\b|nutri[cç][aã]o parenteral total/i,
      to: FISIO,
      r: 'Nutrição parenteral total.',
      c: 0.91,
      skipIfVenoclise: true,
    },
    {
      re: /bomba de infus[aã]o|f[aá]rmacos.*alta vigil[aâ]ncia/i,
      to: MED,
      r: 'Medicação em bomba de infusão.',
      c: 0.91,
    },
    {
      re: /gestante.*convuls[aã]o|ecl[aâ]mpsia|press[aã]o arterial.*190/i,
      to: MULHER,
      r: 'Emergência obstétrica — eclâmpsia.',
      c: 0.94,
    },
    {
      re: /iatrogenias|erros de medica[cç][aã]o|seguran[cç]a do paciente/i,
      to: SEG,
      r: 'Iatrogenia e segurança do paciente.',
      c: 0.93,
    },
    {
      re: /procedimentos b[aá]sicos de enfermagem|aspira[cç][aã]o das vias respirat[oó]rias/i,
      to: PROC,
      r: 'Procedimentos básicos de enfermagem.',
      c: 0.91,
    },
    {
      re: /iras\b.*hospitalar|infec[cç][aã]o relacionada [àa] assist[eê]ncia/i,
      to: BIOS,
      r: 'IRAS e prevenção de infecção hospitalar.',
      c: 0.9,
    },
    {
      re: /aplica[cç][aã]o de calor.*interven[cç][aã]o terap[eê]utica/i,
      to: PROC,
      r: 'Terapia por calor — procedimento de cuidado.',
      c: 0.9,
    },
    {
      re: /administra[cç][aã]o de medicamentos.*cuidados|6 certos|medica[cç][aã]o certa/i,
      to: MED,
      r: 'Administração segura de medicamentos.',
      c: 0.91,
    },
    {
      re: /ângulo.*administra[cç][aã]o endovenosa|veias superficiais.*cubital/i,
      to: VIAS,
      r: 'Técnica de via endovenosa.',
      c: 0.9,
    },
  ];

  for (const rule of rules) {
    if (rule.skipIfVenoclise && /ven[oó]clise/i.test(text)) continue;
    if (rule.re.test(text) || rule.re.test(slug)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: rule.to,
        confidence: rule.c,
        keep_current: rule.to === PUNCAO,
        rationale: rule.r,
      };
    }
  }

  if (PUNCAO_CORE.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: PUNCAO,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Acesso venoso, punção, cateter, flebite ou infusão endovenosa.',
    };
  }

  if (slug.includes('puncao-venosa-e-cuidados-com-cateteres')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: PUNCAO,
      confidence: 0.9,
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

for (const batch of ['03', '04']) {
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
