#!/usr/bin/env tsx
/**
 * Onda 7 — Saúde da Mulher faixa D, lotes 01–03 (~150 questões).
 * Núcleo: gestação, parto, puerpério, ginecologia.
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

const BUCKET = 'Saúde da Mulher';
const OUT = 'artifacts/reclass/faixa-d/saude-mulher';

const EPID = 'Epidemiologia e Vigilância Epidemiológica';
const APS = 'Atenção Básica / Saúde da Família';
const ANAT = 'Noções de Anatomia';
const SCC = 'Saúde da Criança';
const URG = 'Urgências e Emergências';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const IMUN = 'Imunização';
const FISIO = 'Noções de Fisiologia';
const SA = 'Saúde do Adolescente';

const SM_CORE_RE =
  /gesta[çc][ãa]o|gestante|gravidez|grávida|pré-?natal|pre-?natal|parto|puerp[eé]ri|puérpera|parturiente|trabalho de parto|obstétr|ginecol|colo (do )?útero|cérvice|útero|ovário|ovul|menstrua|amenorreia|contraceptiv|anticoncepc|planejamento familiar|métodos contraceptivos|\bdiu\b|laqueadura|ligadura tub|papanicolau|pap smear|citopatol|mamografia|climatério|menopausa|aleitamento materno|amamenta|lacta[cç][ãa]o|colostro|nutriz|feto|fetal|cardiotocograf|sofrimento fetal|dilata[cç][ãa]o cervical|período expulsivo|hemorragia pós-parto|\bhpp\b|pr[eé]-ecl[aâ]mpsia|ecl[aâ]mpsia|síndrome hellp|diabetes gestacional|hipertens[aã]o.*gesta|ovários pol|\bsop\b|transmiss[aã]o vertical|primípara|multípara|nulípara|naegle|istmocele|gravidez anembrion|aborto|dip\b|doença inflamatória pélvica|câncer de (colo|mama)|trauma perineal|concepto e placenta|placenta ou os restos|cesárea|parto normal|parto humanizado|ácido fólico|defeito.*tubo neural|teste rápido de gravidez|couvade|síndrome do homem grávido|pródromos.*trabalho de parto|líquido amniótico|sac[oó] amniótico|periodicidade das consultas.*pré-natal|ligadura tubária|histerectomia|miométrio|distocias|periodo expulsivo|autoexame das mamas|corrimento vaginal|endometriose|mioma uterino|ligação tubária|esterilização (cirúrgica|voluntária)|vasectomia.*planejamento/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-2': {
    suggested_subtopico: EPID,
    confidence: 0.96,
    keep_current: false,
    rationale: 'SINASC e vigilância de nascidos vivos — epidemiologia.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-0': {
    suggested_subtopico: ANAT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Fratura verde em ortopedia — lesão óssea/anatomia.',
  },
  'cotec-fadenor-enfermagem-saude-da-mulher-1777104235003-1': {
    suggested_subtopico: IST,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Testagem e aconselhamento HIV no CTA — IST.',
  },
  'cpcon-uepb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-2': {
    suggested_subtopico: APS,
    confidence: 0.91,
    keep_current: false,
    rationale: 'ACS identificando situações de risco na comunidade — APS.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003261833-5': {
    suggested_subtopico: APS,
    confidence: 0.93,
    keep_current: false,
    rationale: 'ACS e registro civil na visita domiciliar — atenção básica.',
  },
  'cpcon-uepb-enfermagem-saude-da-mulher-1777104329543-4': {
    suggested_subtopico: EPID,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Registro de óbitos maternos e vigilância epidemiológica.',
  },
  'fafipa-enfermagem-processo-de-enfermagem-1780009392850-4': {
    suggested_subtopico: SCC,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Teste do Pezinho — triagem neonatal/pediatria.',
  },
  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-4': {
    suggested_subtopico: APS,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Situações de risco identificadas pelo ACS — APS.',
  },
  'fepese-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-6': {
    suggested_subtopico: APS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Níveis de atenção do SUS e atenção primária.',
  },
  'fgv-enfermagem-urgencias-e-emergencias-1777104063550-1': {
    suggested_subtopico: URG,
    confidence: 0.95,
    keep_current: false,
    rationale: 'RCP em gestante com parada cardiorrespiratória — urgência.',
  },
  'fepese-enfermagem-saude-da-mulher-1777104323066-5': {
    suggested_subtopico: IMUN,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Esquema vacinal contra HPV — imunização.',
  },
  'funtef-enfermagem-urgencias-e-emergencias-1777103970505-2': {
    suggested_subtopico: URG,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Crise convulsiva em adolescente — emergência clínica.',
  },
  'idecan-enfermagem-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1780066992037-7': {
    suggested_subtopico: IST,
    confidence: 0.96,
    keep_current: false,
    rationale: 'HPV como infecção sexualmente transmissível.',
  },
  'idecan-enfermagem-saude-da-mulher-1777104432986-0': {
    suggested_subtopico: VIRAL,
    confidence: 0.93,
    keep_current: false,
    rationale: 'COVID-19 na gestação — doença viral epidemiológica.',
  },
  'idcap-enfermagem-saude-da-mulher-1777104389226-6': {
    suggested_subtopico: VIRAL,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Zika vírus e anomalias congênitas — arbovirose viral.',
  },
  'amauc-enfermagem-saude-da-mulher-1777104295283-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Prevenção do câncer cérvico-uterino com HPV e Papanicolau — ginecologia.',
  },
  'cotec-fadenor-enfermagem-saude-da-mulher-1777104323066-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Mamografia e achado clínico de mama — saúde da mulher.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string; instructionOnly?: boolean }[] = [
  {
    re: /sistema de informa[cç][õo]es sobre nascidos vivos|\bsinasc\b/i,
    label: EPID,
    conf: 0.96,
    note: 'SINASC',
  },
  {
    re: /^[\s\S]*(?:Na ortopedia|fratura de espessura|osso sofre fissura)[\s\S]*$/i,
    label: ANAT,
    conf: 0.94,
    note: 'ortopedia',
    instructionOnly: true,
  },
  {
    re: /registro civil|sem documenta[cç][ãa]o.*cidad[ãa]o/i,
    label: APS,
    conf: 0.93,
    note: 'registro civil ACS',
  },
  {
    re: /teste do pezinho|triagem neonatal/i,
    label: SCC,
    conf: 0.96,
    note: 'teste pezinho',
  },
  {
    re: /tr[eê]s n[ií]veis de aten[cç][ãa]o.*sus|nível prim[aá]rio.*secund[aá]rio.*terci[aá]rio/i,
    label: APS,
    conf: 0.94,
    note: 'níveis SUS',
  },
  {
    re: /parada card[ií]orrespirat|ressuscita[cç][ãa]o cardiopulmonar|\brcp\b/i,
    label: URG,
    conf: 0.95,
    note: 'RCP',
  },
  {
    re: /centro de testagem e aconselhamento|\bcta\b|teste r[aá]pido.*hiv|v[ií]rus da imunodefici[eê]ncia humana/i,
    label: IST,
    conf: 0.95,
    note: 'HIV/CTA',
  },
  {
    re: /hpv.*infec[cç][ãa]o transmitida|human papillomavirus.*transmitida sexualmente/i,
    label: IST,
    conf: 0.96,
    note: 'HPV IST',
  },
  {
    re: /covid-19|sars-cov-2/i,
    label: VIRAL,
    conf: 0.93,
    note: 'COVID',
  },
  {
    re: /zika v[ií]rus|arbovirose/i,
    label: VIRAL,
    conf: 0.92,
    note: 'Zika',
  },
  {
    re: /crise convulsiva|convuls[aã]o.*adolescente/i,
    label: URG,
    conf: 0.94,
    note: 'convulsão',
  },
  {
    re: /altera[cç][õo]es em rela[cç][ãa]o ao esquema vacinal|calend[aá]rio.*vacina.*hpv/i,
    label: IMUN,
    conf: 0.92,
    note: 'vacina HPV',
  },
  {
    re: /situa[cç][õo]es de risco.*agentes comunit[aá]rios|atribui[cç][õo]es dos agentes comunit[aá]rios.*risco/i,
    label: APS,
    conf: 0.91,
    note: 'ACS risco',
  },
  {
    re: /óbitos de crian[cç]as e mulheres|mortalidade materna.*registro/i,
    label: EPID,
    conf: 0.92,
    note: 'mortalidade materna',
  },
  {
    re: /hipogonadismo/i,
    label: FISIO,
    conf: 0.91,
    note: 'hipogonadismo',
  },
  {
    re: /adolescente.*14 anos.*ginecol[oó]gica/i,
    label: SA,
    conf: 0.9,
    note: 'adolescente',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  for (const rule of MOVE_RULES) {
    const haystack = rule.instructionOnly ? item.instruction : blob;
    if (rule.re.test(haystack)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Saúde da Mulher.`,
      };
    }
  }

  if (SM_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Gestação, parto, puerpério ou ginecologia.',
    };
  }

  if (item.modulo_slug.includes('saude-da-mulher')) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.92,
      keep_current: true,
      rationale: 'Conteúdo de saúde da mulher no slug do módulo.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Sem destino canônico claro ≥0,90 — manter Saúde da Mulher.',
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
