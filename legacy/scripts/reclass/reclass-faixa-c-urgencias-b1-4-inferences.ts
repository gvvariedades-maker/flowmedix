#!/usr/bin/env tsx
/**
 * Onda 6 — Urgências e Emergências faixa C, batches 01-04 (~200 questões).
 * Gera batch-01..04-inferred.json para catalog-merge-agent-infer.
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

const BUCKET = 'Urgências e Emergências';
const OUT = 'artifacts/reclass/faixa-c/urgencias';

const EPID = 'Epidemiologia e Vigilância Epidemiológica';
const SV = 'Verificação de Sinais Vitais';
const PARAS = 'Doenças Parasitárias e Zoonoses';
const BACT = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const PROC = 'Procedimentos Diversos';
const SM = 'Saúde Mental';
const MED = 'Cuidados na Administração de Medicamentos';
const ET = 'Enfermagem do Trabalho';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const IMUN = 'Imunização';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const SCC = 'Saúde da Criança';
const SCM = 'Saúde da Mulher';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const CUR = 'Curativos e Manejo de Feridas';
const FQ = 'Feridas e Queimaduras';
const ANAT = 'Noções de Anatomia';
const SP = 'Segurança do Paciente';
const PE = 'Processo de Enfermagem';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-4': {
    suggested_subtopico: PROC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Reação transfusional aguda — manejo de hemoterapia.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-7': {
    suggested_subtopico: BACT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Quadro clínico de meningite — doença bacteriana infecciosa.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780001988576-4': {
    suggested_subtopico: ET,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Exposição nuclear/radiológica ocupacional — saúde do trabalho.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Amputação traumática — avaliação primária ABCDE.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Classificação de risco em serviço de urgência — triagem emergencial.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006954613-2': {
    suggested_subtopico: PE,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Siglas e terminologias de enfermagem — processo/documentação.',
  },
  'fundatec-enfermagem-urgencias-e-emergencias-1777104056718-8': {
    suggested_subtopico: BACT,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Meningite bacteriana — infecção do SNC.',
  },
  'funtef-enfermagem-urgencias-e-emergencias-1777103970505-2': {
    suggested_subtopico: SCM,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Adolescente em consulta ginecológica com convulsão — núcleo obstétrico/gineco.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011908736-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Lacuna sobre emergência/trauma — permanece no bucket.',
  },
  'furb-enfermagem-urgencias-e-emergencias-1777104012755-4': {
    suggested_subtopico: OXI,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Padrões respiratórios anormais — semiologia respiratória.',
  },
  'furb-enfermagem-urgencias-e-emergencias-1777104012755-5': {
    suggested_subtopico: CUR,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Curativo hemostático/pressão — manejo de feridas.',
  },
  'iaupe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-8': {
    suggested_subtopico: EPID,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Definição epidemiológica de trauma — vigilância.',
  },
  'ibade-enfermagem-verificacao-de-sinais-vitais-1779344178184-5': {
    suggested_subtopico: SV,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Disposição de eletrodos de monitor cardíaco — técnica SV/monitorização.',
  },
  'ibade-geral-urgencias-e-emergencias-1777103590498-1': {
    suggested_subtopico: PARAS,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Espectro clínico da dengue — arbovirose/zoonose.',
  },
  'ibade-geral-urgencias-e-emergencias-1777103590498-2': {
    suggested_subtopico: PARAS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Choque na fase crítica da dengue — manejo da doença.',
  },
  'ibade-geral-urgencias-e-emergencias-1777103590498-4': {
    suggested_subtopico: PARAS,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Casos graves de dengue — classificação clínica.',
  },
  'ibfc-enfermagem-semiologia-em-enfermagem-1779563527042-6': {
    suggested_subtopico: ANAT,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Terminologia pupilar (isocoria) — noção anatômica.',
  },
  'icece-enfermagem-outros-temas-de-enfermagem-1780001440222-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'HDA com instabilidade — emergência digestiva.',
  },
  'idecan-enfermagem-enfermagem-em-uti-1778712381105-8': {
    suggested_subtopico: SM,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Delirium em paciente sedado na UTI — saúde mental.',
  },
  'idecan-enfermagem-enfermagem-em-uti-1778712392541-0': {
    suggested_subtopico: MED,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Administração de drogas vasoativas — cuidados medicamentosos.',
  },
  'idecan-enfermagem-enfermagem-em-uti-1778712392541-1': {
    suggested_subtopico: SV,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Monitorização cardíaca contínua na UTI — vigilância de SV.',
  },
  'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Definição de primeiros socorros no contexto emergencial.',
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-7': {
    suggested_subtopico: ET,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Acidente ocupacional com agulha e PEP HIV — saúde do trabalho.',
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-8': {
    suggested_subtopico: SP,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Qualidade e segurança do atendimento hospitalar.',
  },
  'idib-enfermagem-acidente-vascular-cerebral-avc-1778934918280-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Epidemiologia e reconhecimento de AVC — emergência neurológica.',
  },
  'idib-enfermagem-processo-de-enfermagem-1778934863952-4': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Cateterismo cardíaco invasivo — procedimento diagnóstico.',
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-3': {
    suggested_subtopico: IMUN,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Esquema vacinal antirrábica pós-exposição — imunização.',
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1': {
    suggested_subtopico: IST,
    confidence: 0.96,
    keep_current: false,
    rationale: 'PrEP HIV sob demanda — profilaxia IST.',
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Urgência hipertensiva no protocolo SBV — emergência.',
  },
  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-1': {
    suggested_subtopico: PERI,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Retorno pós-colecistectomia — cuidado pós-operatório.',
  },
  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-3': {
    suggested_subtopico: SCC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cuidados ao RN imediato pós-parto — saúde da criança.',
  },
  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-4': {
    suggested_subtopico: SV,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Técnica de aferição de pressão arterial.',
  },
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011956256-1': {
    suggested_subtopico: PERI,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Internação pré-procedimento com anticoagulante — perioperatório.',
  },
  'fgv-enfermagem-urgencias-e-emergencias-1777104063550-1': {
    suggested_subtopico: SCM,
    confidence: 0.93,
    keep_current: false,
    rationale: 'RCP em gestante — obstetrícia de emergência (saúde da mulher).',
  },
  'facape-enfermagem-semiologia-em-enfermagem-1779563486900-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Pico hipertensivo na UBS com encaminhamento emergencial.',
  },
  'educa-pb-enfermagem-urgencias-e-emergencias-1777104070286-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Definição de emergência — conceito central de urgência/emergência.',
  },
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563495719-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Avaliação pupilar no exame neurológico emergencial.',
  },
};

const URG_RE =
  /primeiros socorros|suporte b[aá]sico de vida|sbv\b|ressuscita[cç][aã]o cardiopulmonar|\brcp\b|parada card[ií]orrespirat|parada c[aá]rdiorrespirat|\bpcr\b|manobra de heimlich|desobstru[cç][aã]o.*via a[eé]rea|engasgo|obstru[cç][aã]o.*vias a[eé]reas|acidente vascular (cerebral|encef[aá]lico)|\bavc\b|\bave\b|escala de (coma de )?glasgow|escala de cincinnati|protocolo (público de atendimento )?(pr[eé]-?hospitalar.*)?abcde|xabcde|atendimento pr[eé]-?hospitalar|\baph\b|\bsamu\b|trauma (cran|abdominal|p[eé]lvic|ortop[eé]dic)|\btce\b|politraumat|choque (hipovol[eê]mico|el[eé]trico|hemorr[aá]gico|s[eé]ptico)|hemorragia externa|imobiliza[cç][aã]o.*fratura|fratura exposta|entorse|s[ií]ndrome compartimental|acidente (of[ií]dic|escorpi[oõ]n|peçonhent)|escorpionismo|picada de (abelha|escorpi[aã]o|serpente)|envenenamento|intoxica[cç][aã]o (ex[oó]gena|por)|organofosforad|crise (convulsiva|epil[eé]ptic)|convuls[aã]o|emerg[eê]ncia (hipertensiva|traum[aá]tica)|conceito de emerg[eê]ncia|risco iminente de morte|infarto agudo|iam\b|dor tor[aá]cica.*emerg|triagem.*(risco|emerg)|classifica[cç][aã]o de risco.*urg|manchester|cadeia de sobreviv[eê]ncia|compress[oõ]es tor[aá]cicas|desfibril|ventila[cç][oõ]es.*compress|via a[eé]rea avan[cç]ada|estabiliza[cç][aã]o.*coluna cervical|sinal universal de engasgo|postura de descerebra|anafilaxia|angioedema.*urtic[aá]ria|rea[cç][aã]o al[eé]rgica grave|avalia[cç][aã]o.*pupilar|exame f[ií]sico neurol[oó]gico/i;

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /defini[cç][aã]o epidemiol[oó]gica.*trauma|vigil[aâ]ncia.*trauma|incid[eê]ncia.*trauma.*popula[cç][aã]o/i,
    label: EPID,
    conf: 0.93,
    note: 'epidemiologia trauma',
  },
  {
    re: /dengue.*(espectro|fase cr[ií]tica|choque|extravasamento|sangramento grave)/i,
    label: PARAS,
    conf: 0.94,
    note: 'dengue clínica',
  },
  {
    re: /meningite bacteriana|meningite.*rigidez de nuca|rigidez de nuca.*fotofobia/i,
    label: BACT,
    conf: 0.94,
    note: 'meningite',
  },
  {
    re: /rea[cç][aã]o transfusional|transfus[aã]o de concentrado/i,
    label: PROC,
    conf: 0.93,
    note: 'hemoterapia',
  },
  {
    re: /del[ií]rium|delirium/i,
    label: SM,
    conf: 0.94,
    note: 'delirium',
  },
  {
    re: /drogas vasoativas|noradrenalina|dopamina.*infus[aã]o|vasopressor/i,
    label: MED,
    conf: 0.93,
    note: 'vasoativas',
  },
  {
    re: /prep\b|profilaxia pr[eé]-exposi[cç][aã]o.*hiv|imunodefici[eê]ncia humana.*demanda/i,
    label: IST,
    conf: 0.96,
    note: 'PrEP HIV',
  },
  {
    re: /vacina antirr[aá]bic|esquema vacinal.*raiva|profilaxia p[oó]s.?exposi[cç][aã]o.*raiva/i,
    label: IMUN,
    conf: 0.94,
    note: 'antirrábica',
  },
  {
    re: /acidente (de trabalho|ocupacional)|agulha contaminada|exposi[cç][aã]o (ocupacional|profissional)|nr-32|radia[cç][aã]o.*acidente/i,
    label: ET,
    conf: 0.93,
    note: 'saúde ocupacional',
  },
  {
    re: /colecistectomia|p[oó]s-operat[oó]rio.*cir[uú]rgic|recupera[cç][aã]o anest[eé]sica|internado.*anticoagulante.*procedimento/i,
    label: PERI,
    conf: 0.92,
    note: 'perioperatório',
  },
  {
    re: /rec[eé]m-nascido.*p[oó]s-parto|rn a termo.*parto vaginal|teste do pezinho/i,
    label: SCC,
    conf: 0.93,
    note: 'neonatologia',
  },
  {
    re: /consulta ginecol[oó]gica.*adolescente|gestante.*parada card|parada card.*gestante/i,
    label: SCM,
    conf: 0.92,
    note: 'saúde da mulher',
  },
  {
    re: /aferi[cç][aã]o da press[aã]o arterial|esfigmoman|eletrodos.*monitor|dispor.*eletrodos/i,
    label: SV,
    conf: 0.93,
    note: 'sinais vitais',
  },
  {
    re: /padr[oõ]es respirat[oó]rios|cheyne-stokes|kussmaul|biot\b/i,
    label: OXI,
    conf: 0.92,
    note: 'padrões respiratórios',
  },
  {
    re: /curativo.*(hemost[aá]tic|press[aã]o)|estancar.*sangue|compress[aã]o.*hemorragia/i,
    label: CUR,
    conf: 0.93,
    note: 'curativo hemostático',
  },
  {
    re: /queimadura t[eé]rmica.*remo[cç][aã]o|classifica[cç][aã]o.*queimadura.*grau/i,
    label: FQ,
    conf: 0.9,
    note: 'queimaduras',
  },
  {
    re: /isocoria|anisocoria|midr[ií]ase|miose.*pupila/i,
    label: ANAT,
    conf: 0.9,
    note: 'terminologia pupilar',
  },
  {
    re: /cateterismo card[ií]aco|eletrocardiograma.*deriva/i,
    label: PROC,
    conf: 0.92,
    note: 'procedimento invasivo',
  },
  {
    re: /qualidade do atendimento|notifica[cç][aã]o de incidente|seguran[cç]a do paciente/i,
    label: SP,
    conf: 0.91,
    note: 'segurança do paciente',
  },
  {
    re: /siglas.*enfermagem|terminologias de enfermagem.*siglas/i,
    label: PE,
    conf: 0.9,
    note: 'terminologia PE',
  },
  {
    re: /níveis de preven[cç][aã]o.*promo[cç][aã]o|carteira de ottawa|determinantes sociais/i,
    label: PROMO,
    conf: 0.9,
    note: 'promoção à saúde',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  if (URG_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'RCP, trauma, choque, emergências ou primeiros socorros.',
    };
  }

  for (const rule of MOVE_RULES) {
    const target = rule.re.source.includes('dengue') ? item.instruction : blob;
    if (rule.re.test(target)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Urgências.`,
      };
    }
  }

  if (item.modulo_slug.includes('urgencias-e-emergencias')) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.91,
      keep_current: true,
      rationale: 'Slug urgências sem destino canônico claro — manter.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com Urgências ou sem destino claro ≥0,90.',
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

for (let i = 1; i <= 4; i++) {
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
