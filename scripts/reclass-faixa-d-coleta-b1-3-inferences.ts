#!/usr/bin/env tsx
/**
 * Onda 7 — Coleta de Exames Laboratoriais faixa D, batches 01-03 (~150 questões).
 * Núcleo: coleta sanguínea, urina, fezes, preservação de amostras.
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

const BUCKET = 'Coleta de Exames Laboratoriais';
const OUT = 'artifacts/reclass/faixa-d/coleta-exames';
const PROC = 'Procedimentos Diversos';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const FISIO = 'Noções de Fisiologia';
const CRIANCA = 'Saúde da Criança';
const MULHER = 'Saúde da Mulher';
const PARASIT = 'Doenças Parasitárias e Zoonoses';
const BACTER = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const SV = 'Verificação de Sinais Vitais';
const BIOSSEG = 'Medidas de Prevenção e Precaução de Contato';
const PERIOP = 'Assistência Perioperatória (Inclui SRPA)';
const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const TRAB = 'Enfermagem do Trabalho';

const COLETA_CORE_RE =
  /coleta de sangue|coleta venosa|hemocultura|tubos? a v[aá]cuo|tubos? de coleta|ordem de coleta|sequ[eê]ncia.*tubos?|aditivos?.*tubo|tampa (azul|roxa|verde|cinza|vermelh|amarel|lil[aá]s)|citrato de s[oó]dio|EDTA|hemograma completo|vacutainer|escalpe|garrote|pun[cç][aã]o capilar|pun[cç][aã]o venosa.*coleta|coleta de urina|urina tipo i|sum[aá]rio de urina|urocultura|jato m[eé]dio|amostra de urina|coleta de fezes|parasitol[oó]gico de fezes|sangue oculto nas fezes|coleta de escarro|amostras? biol[oó]gicas?|material biol[oó]gico|acondicionamento.*amostra|transporte de amostra|fase pr[eé]-anal[ií]tica|jejum para coleta|preparo do paciente para exame|rotula[cç][aã]o.*frasco|antiss[eé]ptico.*hemocultura|hem[oó]lise|glicemia capilar|teste do pezinho.*coleta|puncionar.*palma do p[eé]|dismorfismo eritrocit[aá]rio|pesquisa de bacilo|expectora[cç][aã]o.*coleta|BK\b.*coleta|frasco.*urina est[eé]ril|coleta.*cateter urin[aá]rio/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'adm-tec-enfermagem-exames-laboratoriais-1779563613404-2': {
    suggested_subtopico: CRIANCA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Objetivo do teste do pezinho na triagem neonatal — saúde da criança.',
  },
  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562725491-3': {
    suggested_subtopico: CRIANCA,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Timing e indicações do teste do pezinho — triagem neonatal.',
  },
  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562735777-1': {
    suggested_subtopico: PERIOP,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Mescla coleta laboratorial e preparo cirúrgico sem tema dominante de coleta.',
  },
  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562768558-1': {
    suggested_subtopico: BIOSSEG,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Conceito geral de biossegurança, não técnica de coleta laboratorial.',
  },
  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562768558-3': {
    suggested_subtopico: MULHER,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Protocolo APS para saúde da mulher — não coleta laboratorial.',
  },
  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779562716126-7': {
    suggested_subtopico: MULHER,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Assistência na coleta de Papanicolau — saúde da mulher.',
  },
  'avancasp-enfermagem-exames-laboratoriais-1779563553840-0': {
    suggested_subtopico: FISIO,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Distúrbios do equilíbrio hidroeletrolítico — fisiologia.',
  },
  'avancasp-enfermagem-exames-laboratoriais-1779563559434-2': {
    suggested_subtopico: FISIO,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Manejo de desidratação e infusão — fisiologia/manejo clínico.',
  },
  'cebraspe-cespe-enfermagem-exames-complementares-1779563655698-8': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Incidências radiológicas — exame complementar de imagem.',
  },
  'cetrede-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Coleta, conservação e encaminhamento de amostra bacteriológica.',
  },
  'cotec-fadenor-enfermagem-exames-laboratoriais-1779563621885-3': {
    suggested_subtopico: PROMO,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Testes rápidos para ampliar acesso ao diagnóstico — prevenção/rastreamento.',
  },
  'cpcon-uepb-enfermagem-exames-complementares-1779563655698-2': {
    suggested_subtopico: FISIO,
    confidence: 0.9,
    keep_current: false,
    rationale: 'Interpretação do hemograma — fisiologia hematológica, não técnica de coleta.',
  },
  'cpcon-uepb-enfermagem-exames-complementares-1779563668619-0': {
    suggested_subtopico: SV,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Atendimento de rotina com registro de dados clínicos e sinais vitais.',
  },
  'cpcon-uepb-enfermagem-exames-laboratoriais-1779563613404-4': {
    suggested_subtopico: DCNT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Epidemiologia da hiperglicemia — doença crônica (diabetes).',
  },
  'fundatec-enfermagem-coleta-de-exames-laboratoriais-1779563140631-4': {
    suggested_subtopico: BACTER,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Exame auxiliar no diagnóstico de tuberculose (BK) — doença bacteriana.',
  },
  'gama-enfermagem-coleta-de-exames-laboratoriais-1779562735777-5': {
    suggested_subtopico: PARASIT,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Esquistossomose — parasitose de relevância epidemiológica.',
  },
  'gama-enfermagem-coleta-de-exames-laboratoriais-1779563225798-5': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Gasometria/oximetria — exame complementar, não coleta laboratorial rotineira.',
  },
  'gualimp-enfermagem-exames-laboratoriais-1779563613404-5': {
    suggested_subtopico: FISIO,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Transporte de oxigênio no sangue — fisiologia respiratória.',
  },
  'iaupe-enfermagem-exames-laboratoriais-1779563559434-8': {
    suggested_subtopico: DCNT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Diabetes mellitus e composto bioquímico — patologia crônica metabólica.',
  },
  'ibfc-enfermagem-exames-laboratoriais-1779563613404-0': {
    suggested_subtopico: DCNT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Critérios laboratoriais de glicemia para diagnóstico de diabetes.',
  },
  'idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-4': {
    suggested_subtopico: BACTER,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Orientação para diagnóstico de tuberculose — doença bacteriana.',
  },
  'idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Glicemia capilar — punção capilar e técnica de coleta.',
  },
  'idecan-enfermagem-exames-laboratoriais-1780066961947-6': {
    suggested_subtopico: FISIO,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Funções gerais do sangue — fisiologia cardiovascular.',
  },
  'idcap-enfermagem-exames-complementares-1779563668619-8': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Arritmias cardíacas no ECG — exame complementar.',
  },
  'funcern-enfermagem-exames-laboratoriais-1779563631609-6': {
    suggested_subtopico: DCNT,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Diabetes descompensada — manejo de doença crônica.',
  },
  'fgv-enfermagem-exames-laboratoriais-1779563559434-1': {
    suggested_subtopico: DCNT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Diretrizes SBD para diagnóstico de diabetes — DCNT.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /eletrocardiograma|\becg\b|deriva[cç][oõ]es (perif[eé]ricas|precordiais)|ritmo card[ií]aco.*ecg|iam necessita.*ecg|arritmias card[ií]acas/i,
    label: PROC,
    conf: 0.94,
    note: 'ECG',
  },
  {
    re: /radiograf|tomograf|resson[aâ]ncia magn[eé]tica|ultrassonograf|imagenolog|incid[eê]ncias radiol[oó]gicas|fratura de monteggia|raio-?x/i,
    label: PROC,
    conf: 0.93,
    note: 'exame de imagem',
  },
  {
    re: /medida ambulatorial da press[aã]o arterial|\bmapa\b/i,
    label: SV,
    conf: 0.95,
    note: 'MAPA',
  },
  {
    re: /medidas antropom[eé]tricas|estadi[oô]metro|antropometria/i,
    label: PROC,
    conf: 0.92,
    note: 'antropometria',
  },
  {
    re: /teste do pezinho|triagem neonatal|rec[eé]m-nascido.*(objetivo|obrigat[oó]rio)/i,
    label: CRIANCA,
    conf: 0.93,
    note: 'teste do pezinho',
  },
  {
    re: /papanicolau|citopatol[oó]gico do colo|cervicovaginal/i,
    label: MULHER,
    conf: 0.95,
    note: 'Papanicolau',
  },
  {
    re: /esquistossomose|schistosoma/i,
    label: PARASIT,
    conf: 0.96,
    note: 'esquistossomose',
  },
  {
    re: /tuberculose|bacilo de koch|\bbk\b.*diagn[oó]stico|baar\b/i,
    label: BACTER,
    conf: 0.93,
    note: 'tuberculose',
  },
  {
    re: /sociedade brasileira de diabetes|diabetes mellitus|glicemia em jejum para diagn[oó]stico|diabetes descompensad|crit[eé]rios laboratoriais.*glicemia/i,
    label: DCNT,
    conf: 0.93,
    note: 'diabetes/DCNT',
  },
  {
    re: /dist[uú]rbios? do equil[ií]brio hidroeletrol[ií]tico|altera[cç][oõ]es dos eletr[oó]litos|desidrata[cç][aã]o.*infus[aã]o de solu[cç][aã]o/i,
    label: FISIO,
    conf: 0.92,
    note: 'hidroeletrolítico',
  },
  {
    re: /oxig[eê]nio.*transportad|hemoglobina.*transport|fun[cç][oõ]es.*sangue.*temperatura corporal/i,
    label: FISIO,
    conf: 0.93,
    note: 'fisiologia do sangue',
  },
  {
    re: /testes r[aá]pidos.*amplia[cç][aã]o do acesso|ferramentas na amplia[cç][aã]o do acesso ao diagn[oó]stico/i,
    label: PROMO,
    conf: 0.91,
    note: 'testes rápidos/prevenção',
  },
  {
    re: /exames complementares em sa[uú]de do trabalhador|sa[uú]de do trabalhador.*ecg/i,
    label: TRAB,
    conf: 0.92,
    note: 'saúde do trabalho',
  },
  {
    re: /assist[eê]ncia ao paciente cardiopata|intervencionista cardiovascular/i,
    label: PROC,
    conf: 0.91,
    note: 'cardiologia complementar',
  },
  {
    re: /instrumentos.*monitorar indicadores de sa[uú]de de adultos|avalia[cç][aã]o da sa[uú]de de adultos/i,
    label: PROMO,
    conf: 0.9,
    note: 'rastreamento adulto',
  },
  {
    re: /prepara[cç][aã]o para interven[cç][oõ]es cir[uú]rgicas|pr[eé]-operat[oó]rio.*cir[uú]rg/i,
    label: PERIOP,
    conf: 0.91,
    note: 'perioperatório',
  },
  {
    re: /protocolo de enfermagem.*aten[cç][aã]o prim[aá]ria.*sa[uú]de da mulher/i,
    label: MULHER,
    conf: 0.94,
    note: 'APS mulher',
  },
  {
    re: /biosseguran[cç]a [eé] um conjunto de medidas que visa proteger/i,
    label: BIOSSEG,
    conf: 0.92,
    note: 'biossegurança geral',
  },
  {
    re: /hemograma [eé] um exame.*avalia as c[eé]lulas/i,
    label: FISIO,
    conf: 0.9,
    note: 'interpretação hemograma',
  },
  {
    re: /glicemia elevada [eé] o terceiro fator|oms.*2009.*glicemia/i,
    label: DCNT,
    conf: 0.92,
    note: 'epidemiologia diabetes',
  },
  {
    re: /sintomas neurol[oó]gicos.*realizad/i,
    label: FISIO,
    conf: 0.9,
    note: 'neurologia/fisiologia',
  },
  {
    re: /pun[cç][aã]o venosa e cuidados com cateter|flebite.*cateter|acesso venoso perif[eé]rico.*infus[aã]o/i,
    label: PUNCAO,
    conf: 0.93,
    note: 'punção/cateter',
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
        rationale: `${rule.note} — tema dominante fora de coleta laboratorial.`,
      };
    }
  }

  if (/exames-complementares/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: PROC,
      confidence: 0.93,
      keep_current: false,
      rationale: 'Exame complementar (imagem, ECG etc.) — procedimentos diversos.',
    };
  }

  if (COLETA_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Coleta sanguínea, urina, fezes ou preservação de amostras.',
    };
  }

  if (/exames-laboratoriais/.test(item.modulo_slug) && /dosagem|an[aá]lise|resultado|valores de refer[eê]ncia|interpret/i.test(blob)) {
    return {
      suggested_subtopico: FISIO,
      confidence: 0.9,
      keep_current: false,
      rationale: 'Interpretação de exame laboratorial — fisiologia, não técnica de coleta.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com coleta laboratorial ou sem destino canônico claro ≥0,90.',
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
