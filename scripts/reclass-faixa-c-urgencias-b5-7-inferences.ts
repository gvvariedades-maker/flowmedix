#!/usr/bin/env tsx
/** Classificações agente — Urgências e Emergências (faixa C, onda 6, lotes 05–07). */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Urgências e Emergências';
const OUT = 'artifacts/reclass/faixa-c/urgencias';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const SV = 'Verificação de Sinais Vitais';
const CAM = 'Cuidados na Administração de Medicamentos';
const SM = 'Saúde Mental';
const MUL = 'Saúde da Mulher';
const PED = 'Saúde da Criança';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const BIO = 'Medidas de Prevenção e Precaução de Contato';
const FQ = 'Feridas e Queimaduras';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const AGU = 'Questões Mescladas e Outras Doenças Agudas';
const SP = 'Segurança do Paciente';
const PE = 'Processo de Enfermagem';
const FARM = 'Farmacodinâmica e Farmacocinética';

type ClassResult = { suggested: string; confidence: number; keep_current: boolean; rationale: string };

function getTopic(slug: string): string {
  const m = slug.match(/enfermagem-(.+)-\d{13}-\d$/);
  return m ? m[1]! : slug;
}

/** Overrides por leitura de enunciados ambíguos ou mis-slug. */
const OVERRIDES: Record<string, Omit<ClassResult, 'keep_current'> & { keep_current?: boolean }> = {
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-4': {
    suggested: DCNT,
    confidence: 0.94,
    rationale: 'HAS como problema crônico de saúde pública, não manejo agudo de emergência.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010911471-6': {
    suggested: DCNT,
    confidence: 0.95,
    rationale: 'Prevenção e controle da hipertensão arterial sistêmica crônica.',
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780009294428-4': {
    suggested: SV,
    confidence: 0.93,
    rationale: 'Monitoramento de sinais vitais como prática fundamental, sem protocolo de emergência.',
  },
  'selecon-enfermagem-processo-de-enfermagem-1780009310940-3': {
    suggested: CAM,
    confidence: 0.94,
    rationale: 'Administração segura de antibiótico IV com checagem dos 6 certos.',
  },
  'univali-enfermagem-teorias-em-enfermagem-1776055843703-2': {
    suggested: SM,
    confidence: 0.92,
    rationale: 'Conduta diante de ansiedade e medo no paciente com IAM.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-2': {
    suggested: IST,
    confidence: 0.95,
    rationale: 'Profilaxia pós-exposição (PEP) ao HIV.',
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-1': {
    suggested: BIO,
    confidence: 0.93,
    rationale: 'Exposição a material biológico e profilaxia de patógenos.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-8': {
    suggested: MUL,
    confidence: 0.94,
    rationale: 'Identificação de urgências e emergências obstétricas na gestação.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104090044-1': {
    suggested: MUL,
    confidence: 0.96,
    rationale: 'Gestante com cefaleia intensa — suspeita de pré-eclâmpsia/eclâmpsia.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104083571-1': {
    suggested: PED,
    confidence: 0.91,
    rationale: 'Desidratação e manejo de criança na UPA — pediatria.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-8': {
    suggested: AGU,
    confidence: 0.92,
    rationale: 'Picada de escorpião e sinais de gravidade — acidente por animal peçonhento.',
  },
  'instituto-verbena-enfermagem-urgencias-e-emergencias-1777103994618-2': {
    suggested: BIO,
    confidence: 0.91,
    rationale: 'Variáveis de risco em acidente com material biológico.',
  },
  'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-3': {
    suggested: SP,
    confidence: 0.91,
    rationale: 'Reorganização de fluxo e treinamento em serviço de urgência — gestão da qualidade.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-7': {
    suggested: FQ,
    confidence: 0.92,
    rationale: 'Classificação e agentes causadores de queimaduras.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103981770-2': {
    suggested: FQ,
    confidence: 0.93,
    rationale: 'Primeiros socorros em queimadura química — manejo de queimadura.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103981770-4': {
    suggested: FQ,
    confidence: 0.92,
    rationale: 'Cuidados pré-hospitalares à vítima de queimadura.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104083571-2': {
    suggested: FQ,
    confidence: 0.93,
    rationale: 'Indicação de intubação em queimadura extensa.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104090044-2': {
    suggested: FQ,
    confidence: 0.94,
    rationale: 'Cálculo de superfície corporal queimada (regra dos nove).',
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-0': {
    suggested: DCNT,
    confidence: 0.91,
    rationale: 'Hipoglicemia como complicação do diabetes mellitus.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-3': {
    suggested: OXI,
    confidence: 0.91,
    rationale: 'Ventilação e oxigenação pós-RCP no protocolo SAMU.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-5': {
    suggested: OXI,
    confidence: 0.92,
    rationale: 'Administração de O2 em alto fluxo no protocolo de afogamento.',
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104048047-8': {
    suggested: FARM,
    confidence: 0.91,
    rationale: 'Medicamento no suporte avançado de vida — farmacologia de emergência.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-0': {
    suggested: FARM,
    confidence: 0.92,
    rationale: 'Adrenalina na PCR — droga e posologia em reanimação.',
  },
};

function classify(slug: string, instruction: string, optionsPreview = ''): ClassResult {
  const override = OVERRIDES[slug];
  if (override) {
    const keep = override.keep_current ?? override.suggested === BUCKET;
    return {
      suggested: override.suggested,
      confidence: override.confidence,
      keep_current: keep,
      rationale: override.rationale,
    };
  }

  const t = `${instruction} ${optionsPreview}`.toLowerCase();
  const topic = getTopic(slug);

  // Slugs de outros tópicos já no balde — conteúdo decide
  if (topic === 'auditoria-e-gestao-da-qualidade-enfermagem') {
    return { suggested: SP, confidence: 0.91, keep_current: false, rationale: 'Gestão da qualidade e fluxo assistencial.' };
  }
  if (topic === 'teorias-em-enfermagem') {
    if (/ansiedade|medo de morrer|comunicação|acolhimento/.test(t)) {
      return { suggested: SM, confidence: 0.91, keep_current: false, rationale: 'Comunicação e suporte emocional.' };
    }
    return { suggested: PE, confidence: 0.9, keep_current: false, rationale: 'Teorias e relação de cuidado.' };
  }

  // Movimentos OUT por conteúdo dominante
  if (/profilaxia pós-exposição|\bpep\b.*hiv|exposição.*hiv/.test(t)) {
    return { suggested: IST, confidence: 0.94, keep_current: false, rationale: 'PEP e prevenção de IST.' };
  }
  if (/exposição a material biológico|acidente com material biológico/.test(t) && !/urgência|emergência|rcp|pcr/.test(t)) {
    return { suggested: BIO, confidence: 0.91, keep_current: false, rationale: 'Acidente ocupacional com material biológico.' };
  }
  if (/hipertensão arterial sistêmica.*problema.*saúde pública|adotar uma dieta saudável.*menos sal.*exercícios/.test(t)) {
    return { suggested: DCNT, confidence: 0.94, keep_current: false, rationale: 'HAS crônica e modificação de estilo de vida.' };
  }
  if (/hipoglicemia.*diabét|diabéticos.*insulina.*complicação/.test(t) && !/emergência|urgência|samu|upa/.test(t)) {
    return { suggested: DCNT, confidence: 0.91, keep_current: false, rationale: 'Complicação aguda do diabetes — DCNT.' };
  }
  if (/administrou.*antibiótico|6 certos|conferiu a identificação.*antes da administração/.test(t)) {
    return { suggested: CAM, confidence: 0.93, keep_current: false, rationale: 'Segurança na administração de medicamentos.' };
  }
  if (/monitoramento dos sinais vitais.*práticas fundamentais|aferição dos sinais vitais/.test(t) && !/rcp|pcr|parada|emergência|samu|trauma/.test(t)) {
    return { suggested: SV, confidence: 0.92, keep_current: false, rationale: 'Aferição e monitoramento de sinais vitais.' };
  }
  if (/queimadur/.test(t) && /regra dos nove|superfície corporal|agentes.*térmica.*química|soda cáustica/.test(t)) {
    return { suggested: FQ, confidence: 0.92, keep_current: false, rationale: 'Classificação e manejo de queimaduras.' };
  }
  if (/picada de escorpião|escorpião/.test(t)) {
    return { suggested: AGU, confidence: 0.92, keep_current: false, rationale: 'Acidente por animal peçonhento.' };
  }
  if (/idade gestacional|gestante.*cefaleia|pré-eclampsia|eclampsia|urgência.*obstétrica|placenta prévia|trombose venosa.*gestação/.test(t)) {
    return { suggested: MUL, confidence: 0.93, keep_current: false, rationale: 'Urgência obstétrica ou gestação.' };
  }
  if (/criança de \d+ anos|lactente|pediatr/.test(t) && /desidratação|evacuações líquidas|vômitos/.test(t) && !/rcp|pcr|ovace|obstrução de via aérea/.test(t)) {
    return { suggested: PED, confidence: 0.91, keep_current: false, rationale: 'Quadro pediátrico na atenção à criança.' };
  }
  if (/ventilação.*oxigenação.*o2|oxigenação pós-rpc|o2 em alto fluxo.*sato2/.test(t)) {
    return { suggested: OXI, confidence: 0.91, keep_current: false, rationale: 'Oxigenoterapia em suporte ventilatório.' };
  }
  if (/adrenalina.*1mg|vasopressores|antiarrítmicos.*pcr|naloxona|medicamento.*suporte avançado/.test(t)) {
    return { suggested: FARM, confidence: 0.91, keep_current: false, rationale: 'Farmacologia em emergência/RCP.' };
  }

  // Conteúdo claramente de urgência — permanece
  if (
    /parada cardiorrespiratória|\bpcr\b|ressuscitação cardiopulmonar|\brcp\b|desfibrila|suporte básico de vida|suporte avançado de vida|cadeia de sobrevivência|ritmo chocável|manobra de heimlich|ovace|obstrução de via aérea|x-abcde|phtls|samu|atendimento pré-hospitalar|\baph\b|ambulância|tarm|código amarelo|imobilização.*coluna|rolamento em bloco|prancha longa|trauma|acidente automobilístico|acidente de trânsito|choque elétrico|choque hipovolêmico|sepse|síndrome compartimental|avc|acidente vascular|escala de cincinnati|tce|traumatismo cranioencefálico|intoxicação|naloxona|infarto agudo|iam\b|dor torácica aguda|crise hipertensiva|embolia gasosa|hemorragia digestiva|epistaxe|afogamento|luxação|subluxação|amputação traumática|k-ed\b|mnemônico x-abcde|avaliação primária|glicemia capilar.*acidente|intubação orotraqueal.*queimadura/.test(
      t,
    )
  ) {
    return { suggested: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Protocolo ou conduta de urgência/emergência.' };
  }

  if (topic === 'processo-de-enfermagem' || topic === 'semiologia-em-enfermagem') {
    if (/parada|pcr|rcp|avc|cincinnati|trauma|choque|urgência|emergência|primeiros socorros|imobilização/.test(t)) {
      return { suggested: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Conteúdo de urgência apesar do slug legado.' };
    }
  }

  if (topic === 'urgencias-e-emergencias') {
    return { suggested: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Conteúdo central de urgências e emergências.' };
  }

  return { suggested: BUCKET, confidence: 0.9, keep_current: true, rationale: 'Sem tema dominante alternativo ≥0,90 — mantém urgências.' };
}

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    `${JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2)}\n`,
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

type BatchFile = {
  batch: string;
  items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
};

let allRows: InferRow[] = [];

for (const n of ['05', '06', '07']) {
  const path = resolve(process.cwd(), `${OUT}/batch-${n}.json`);
  const batch = JSON.parse(readFileSync(path, 'utf8')) as BatchFile;
  const rows: InferRow[] = batch.items.map((it) => {
    const c = classify(it.modulo_slug, it.instruction ?? '', it.optionsPreview ?? '');
    return {
      modulo_slug: it.modulo_slug,
      suggested_subtopico: c.suggested,
      confidence: c.confidence,
      keep_current: c.keep_current,
      rationale: c.rationale,
    };
  });
  writeInferred(n, rows);
  allRows = allRows.concat(rows);
}

const moves = allRows.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(`TOTAL: ${allRows.length} scanned, ${moves.length} moves (>=0.90)`);
