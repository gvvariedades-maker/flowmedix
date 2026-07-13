#!/usr/bin/env tsx
/**
 * Onda 7 — Oxigenoterapia faixa B, batches 01-03 (~150 questões).
 * Gera batch-01..03-inferred.json para catalog-merge-agent-infer.
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

type BatchItem = {
  modulo_slug: string;
  instruction: string;
  textFragment?: string;
  optionsPreview?: string;
};

const BUCKET = 'Oxigenoterapia e Cuidados Respiratórios';
const OUT = 'artifacts/reclass/faixa-b/oxigenoterapia';

const OXI_CORE_RE =
  /oxigenoterap|oxigenioterap|administra[cç][aã]o de oxig[eê]nio|suplementa[cç][aã]o de oxig[eê]nio|terapia com oxig[eê]nio|cateter nasal|m[aá]scara venturi|m[aá]scara de reinala|nebuliza|aerossolterap|aspira[cç][aã]o.*(?:vias a[eé]reas|orofaringe|traqueostomia)|dispositiv.*oxig|equipament.*oxig|umidifica.*oxig|FiO2|hipoxem|hip[oó]xi|insufici[eê]ncia respirat|dispn[eé]i|apn[eé]ia|ortopn[eé]ia|taquipn[eé]ia|bradipn[eé]ia|padr[oõ]es respirat|ritmo.*respirat|respira[cç][aã]o de kussmaul|respira[cç][aã]o cheyne|toracocentese|drenagem tor[aá]cica|dreno de t[oó]rax|ventila[cç][aã]o mec[aâ]nica|intubad.*ventila|inaloterap|cilindro de oxig[eê]nio|sistema.*(?:alto|baixo) fluxo.*oxig|bolsa reservat[oó]ria|fluxo.*l\/min.*oxig|afogamento.*oxigena/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'amauc-enfermagem-processo-de-enfermagem-1780001613305-0': {
    suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde',
    confidence: 0.95,
    keep_current: false,
    rationale: 'OPA vs glutaraldeído — desinfecção de materiais, não oxigenoterapia.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-2': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Atendimento pré-hospitalar (APH) — emergência pré-hospitalar.',
  },
  'ameosc-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344645032-2': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Posicionamento em AVC — manejo de emergência neurológica.',
  },
  'ameosc-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344786992-6': {
    suggested_subtopico: 'Mobilização e Posicionamento do Paciente',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Úlceras por pressão — prevenção de LPP, não oxigenoterapia.',
  },
  'ameosc-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056694842-5': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Teste do coraçãozinho — triagem neonatal cardíaca.',
  },
  'ameosc-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056709494-1': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Gestante em pronto atendimento — assistência obstétrica.',
  },
  'avancasp-enfermagem-seguranca-do-paciente-1777102861438-2': {
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Transporte intra-hospitalar seguro — protocolo de segurança.',
  },
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-7': {
    suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Definição de esterilização — processamento de materiais.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003261833-4': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Primeiros socorros imediatos — atendimento de emergência.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-4': {
    suggested_subtopico: 'Verificação de Sinais Vitais',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Definição de saturação de oxigênio (SpO2) — parâmetro de sinais vitais.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-2': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Posição prona na pandemia de Covid-19 — manejo de doença viral.',
  },
  'fcm-enfermagem-atencao-basica-saude-da-familia-1778967504475-1': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Procedimentos na atenção domiciliar/ESF — núcleo APS.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004602717-4': {
    suggested_subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    confidence: 0.93,
    keep_current: false,
    rationale: 'DPOC em emergência — doença respiratória crônica, não técnica de O2.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-0': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Trauma por explosão — avaliação primária de emergência.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-8': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Engasgo com obstrução grave — manobra de emergência.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-5': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Reanimação neonatal/asfixia — cuidado pediátrico neonatal.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-6': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Atendimento pré-hospitalar a politraumatizado — urgência.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-0': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Rebaixamento de consciência e proteção de VA — emergência.',
  },
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563480978-2': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Infecções do trato respiratório em crianças — pediatria.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011908736-9': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.96,
    keep_current: false,
    rationale: 'Suporte Básico de Vida (AHA) — RCP/emergência.',
  },
  'furb-enfermagem-semiologia-em-enfermagem-1779563500147-2': {
    suggested_subtopico: 'Questões Mescladas e Outras Doenças Agudas',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Hemoptise — semiologia clínica aguda, não oxigenoterapia.',
  },
  'grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-1': {
    suggested_subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Usuário com DPOC na ESF — manejo de doença crônica respiratória.',
  },
  'idecan-enfermagem-questoes-mescladas-e-outras-doencas-agudas-1780066992037-8': {
    suggested_subtopico: 'Questões Mescladas e Outras Doenças Agudas',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Pneumonia como infecção aguda — doença, não procedimento de O2.',
  },
  'idib-enfermagem-questoes-mescladas-e-outras-doencas-agudas-1778934918280-2': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Choque distributivo — emergência hemodinâmica.',
  },
  'igecap-enfermagem-processo-de-enfermagem-1780004452857-3': {
    suggested_subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Assistência ao usuário com asma na APS — doença respiratória crônica.',
  },
  'igecap-enfermagem-processo-de-enfermagem-1780007230169-8': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Atendimento pré-hospitalar básico — protocolo de urgência.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-0': {
    suggested_subtopico: 'Punção Venosa e Cuidados com Cateteres',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Reação durante transfusão de plaquetas — cuidado com infusão/transfusão.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-8': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Engasgo/obstrução de VA durante refeição — emergência.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006969552-0': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Obstrução grave de VA em criança — manobra de emergência.',
  },
  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-8': {
    suggested_subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    confidence: 0.91,
    keep_current: false,
    rationale: 'DPOC exacerbada — foco na doença crônica, não dispositivo de O2.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /processamento de produtos|desinfetante de alto n[ií]vel|ortoftalalde|glutaralde[ií]do|esteriliza[cç][aã]o de materiais/i,
    label: 'Processamento de Artigos e Produtos de Saúde',
    conf: 0.94,
    note: 'processamento/esterilização',
  },
  {
    re: /atendimento pr[eé]-hospitalar|\bAPH\b|pr[eé]-hospitalar b[aá]sico|primeiros socorros/i,
    label: 'Urgências e Emergências',
    conf: 0.93,
    note: 'APH/primeiros socorros',
  },
  {
    re: /parada cardiorrespirat|suporte b[aá]sico de vida|\bSBV\b|manobra.*engasgo|obstru[cç][aã]o grave.*via a[eé]rea|reanima[cç][aã]o neonatal|asfixia neonatal/i,
    label: 'Urgências e Emergências',
    conf: 0.94,
    note: 'RCP/engasgo/obstrução VA',
  },
  {
    re: /politraumatiz|explos[aã]o de caldeira|choque distributivo|rebaixamento.*consci[eê]ncia/i,
    label: 'Urgências e Emergências',
    conf: 0.93,
    note: 'trauma/choque/emergência',
  },
  {
    re: /satura[cç][aã]o de oxig[eê]nio [eé] a porcentagem|oximetria de pulso.*m[eé]todo n[aã]o invasivo/i,
    label: 'Verificação de Sinais Vitais',
    conf: 0.93,
    note: 'definição SpO2',
  },
  {
    re: /[uú]lceras por press[aã]o|\bLPP\b|les[aã]o por press[aã]o/i,
    label: 'Mobilização e Posicionamento do Paciente',
    conf: 0.94,
    note: 'LPP',
  },
  {
    re: /transporte intra-hospitalar de pacientes/i,
    label: 'Segurança do Paciente',
    conf: 0.92,
    note: 'transporte seguro',
  },
  {
    re: /transfus[aã]o de (?:concentrado de )?plaquetas|rea[cç][aã]o.*transfus/i,
    label: 'Punção Venosa e Cuidados com Cateteres',
    conf: 0.92,
    note: 'transfusão',
  },
  {
    re: /pneumonia [eé] uma infec[cç][aã]o|quadro.*pneumonia bilateral grave(?!.*oxigen)/i,
    label: 'Questões Mescladas e Outras Doenças Agudas',
    conf: 0.91,
    note: 'pneumonia aguda',
  },
  {
    re: /assist[eê]ncia.*(?:usu[aá]rio|paciente).*asma|linha de cuidado.*asma/i,
    label: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    conf: 0.92,
    note: 'asma crônica',
  },
  {
    re: /doen[cç]a pulmonar obstrutiva cr[oô]nica.*(?:ESF|estrat[eé]gia sa[uú]de|exacerbad)/i,
    label: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    conf: 0.91,
    note: 'DPOC crônica',
  },
  {
    re: /hemoptise/i,
    label: 'Questões Mescladas e Outras Doenças Agudas',
    conf: 0.91,
    note: 'hemoptise',
  },
  {
    re: /infec[cç][oõ]es do trato respirat[oó]rio.*crian[cç]as|teste do cora[cç][ãa]ozinho|triagem neonatal/i,
    label: 'Saúde da Criança',
    conf: 0.92,
    note: 'pediatria/neonatal',
  },
  {
    re: /gestante|gesta [iI]+|semana de gesta[cç][aã]o|puerp[eé]rio/i,
    label: 'Saúde da Mulher',
    conf: 0.93,
    note: 'gestação/obstetrícia',
  },
  {
    re: /covid-19|sars-cov-2.*posi[cç][aã]o prona/i,
    label: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    conf: 0.92,
    note: 'Covid-19',
  },
  {
    re: /aten[cç][aã]o domiciliar.*associe|procedimentos.*aten[cç][aã]o domiciliar/i,
    label: 'Atenção Básica / Saúde da Família',
    conf: 0.91,
    note: 'atenção domiciliar/APS',
  },
  {
    re: /acidente vascular cerebral|\bAVC\b/i,
    label: 'Urgências e Emergências',
    conf: 0.92,
    note: 'AVC',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Oxigenoterapia.`,
      };
    }
  }

  if (OXI_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Oxigenoterapia, dispositivos de O2, vias aéreas ou padrões respiratórios.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com Oxigenoterapia ou sem destino canônico claro ≥0,90.',
  };
}

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

let totalMoves = 0;
let totalScanned = 0;

for (let i = 1; i <= 3; i++) {
  const batch = String(i).padStart(2, '0');
  const data = JSON.parse(
    readFileSync(resolve(process.cwd(), `${OUT}/batch-${batch}.json`), 'utf8'),
  ) as { items: BatchItem[] };

  const rows: InferRow[] = data.items.map((item) => ({
    modulo_slug: item.modulo_slug,
    ...classify(item),
  }));

  writeInferred(batch, rows);
  totalScanned += rows.length;
  totalMoves += rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
}

console.log(`TOTAL: ${totalScanned} scanned, ${totalMoves} moves (>=0.90)`);
