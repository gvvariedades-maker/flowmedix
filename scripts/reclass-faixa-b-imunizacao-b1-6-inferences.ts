#!/usr/bin/env tsx
/**
 * Onda 5 — Imunização faixa B, batches 01-06 (~300 questões).
 * Gera batch-01..06-inferred.json para catalog-merge-agent-infer.
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

const BUCKET = 'Imunização';
const OUT = 'artifacts/reclass/faixa-b/imunizacao';

const IMUNIZACAO_RE =
  /vacin|imuniz|imunobiol|calend[aá]rio (nacional |vacinal|de vacina)|pni\b|programa nacional de imuniza|rede de frio|conserva[cç][aã]o de (vacina|imunobiol)|geladeira.*vacina|termol[aá]bil|esquema vacinal|dose de refor[cç]o|cart[aã]o vacinal|caderneta de vacina|sala de vacina|organismos vivos atenuados|bcg|pentavalente|tr[ií]plice viral|d[tT]pa|antirr[aá]bic|profilaxia p[oó]s.?exposi[cç][aã]o|imunoglobulina|campanha (nacional )?de vacina|vacina[cç][aã]o (infantil|da gestante|em gestante|de gestante|em massa)|hpv\b.*vacina|vacina.*hpv/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'adm-tec-enfermagem-atencao-basica-saude-da-familia-1778968156152-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'SIS para monitorar vacinação infantil — núcleo PNI/imunização.',
  },
  'amauc-enfermagem-imunizacao-1779564109452-2': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Campanha de detecção de diabetes — rastreamento, não vacinação.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780003031246-4': {
    suggested_subtopico: 'Vias de Administração',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Técnica de aplicação IM de medicamentos — não vacinação.',
  },
  'ameosc-enfermagem-imunizacao-1779564079834-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Vacinas de organismos vivos atenuados — composição vacinal.',
  },
  'avancasp-enfermagem-imunizacao-1777103222102-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Fatores que influenciam resposta imune à vacinação.',
  },
  'cebraspe-cespe-enfermagem-imunizacao-1779572166628-0': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Detecção precoce de doenças transmissíveis — prevenção geral.',
  },
  'cebraspe-cespe-enfermagem-imunizacao-1779572166628-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Vacinação HPV no contexto de prevenção combinada — esquema vacinal.',
  },
  'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-5': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Assistência pré-natal/parto/puerpério — núcleo saúde da mulher.',
  },
  'copese-ufpi-enfermagem-imunizacao-1779564079834-5': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Acompanhamento de crianças pelo ACS — trabalho na ESF.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007238824-1': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Manejo clínico de Chikungunya — doença viral.',
  },
  'facet-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-1': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Eficácia, eficiência e efetividade — conceitos epidemiológicos.',
  },
  'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-6': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Caso-índice e investigação epidemiológica.',
  },
  'fau-unicentro-enfermagem-imunizacao-1779564040128-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.88,
    keep_current: true,
    rationale: 'Lacuna sobre imunização — permanece no bucket.',
  },
  'fau-unicentro-enfermagem-imunizacao-1779572180830-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Via de administração da vacina Hepatite A — técnica vacinal.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-2': {
    suggested_subtopico: 'Medidas de Prevenção e Precaução de Contato',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Higienização das mãos para interromper transmissão — precauções.',
  },
  'fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-3': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Prevenção de doenças em geral — promoção à saúde.',
  },
  'fgv-enfermagem-imunizacao-1779563992006-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Mecanismos de defesa e tipos de imunidade no contexto vacinal.',
  },
  'fgv-enfermagem-imunizacao-1779564053668-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Tipos de imunidade — base teórica da imunização.',
  },
  'funcern-enfermagem-imunizacao-1777103238173-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Raiva e profilaxia antirrábica — esquema PNI.',
  },
  'fundatec-enfermagem-imunizacao-1779563975447-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Imunidade passiva do colostro — imunização passiva.',
  },
  'fundatec-enfermagem-imunizacao-1779572528473-2': {
    suggested_subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
    confidence: 0.96,
    keep_current: false,
    rationale: 'AIDS/HIV — IST, não vacinação.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-9': {
    suggested_subtopico:
      'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Diretrizes de tratamentos oncológicos — DCNT.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006954613-7': {
    suggested_subtopico: 'Atenção Básica / Saúde da Família',
    confidence: 0.93,
    keep_current: false,
    rationale: 'eMulti na ESF — atenção básica.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006954613-9': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.9,
    keep_current: false,
    rationale: 'Campanhas de conscientização em fevereiro — promoção à saúde.',
  },
  'fuvest-enfermagem-imunizacao-1779564109452-8': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Vitamina K no recém-nascido — profilaxia neonatal pediátrica.',
  },
  'grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-2': {
    suggested_subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Hanseníase na APS — doença bacteriana.',
  },
  'ibade-enfermagem-imunizacao-1777103230085-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Imunidade inata — fundamentos para compreender vacinas.',
  },
  'ibade-enfermagem-imunizacao-1777103230085-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Imunidade ativa/passiva e vacinação.',
  },
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-8': {
    suggested_subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Objetivo da vigilância sanitária — epidemiologia.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003868364-1': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Vitamina K no recém-nascido — profilaxia neonatal pediátrica.',
  },
  'funcern-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1776581011815-0': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Aedes aegypti e arboviroses — doenças virais, não calendário vacinal.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /campanha.*diabetes|detec[cç][aã]o.*diabetes mellitus/i,
    label: 'Promoção à Saúde e Prevenção de Agravos',
    conf: 0.93,
    note: 'rastreamento diabetes',
  },
  {
    re: /via intramuscular.*medicamento|aplica[cç][aã]o de medicamentos por via intramuscular/i,
    label: 'Vias de Administração',
    conf: 0.94,
    note: 'técnica IM medicamentos',
  },
  {
    re: /chikungunya/i,
    label: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    conf: 0.95,
    note: 'Chikungunya',
  },
  {
    re: /hanseníase/i,
    label: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    conf: 0.94,
    note: 'hanseníase',
  },
  {
    re: /\baids\b|s[ií]ndrome da imunodefici[eê]ncia adquirida/i,
    label: 'Infecções Sexualmente Transmissíveis (ISTs)',
    conf: 0.96,
    note: 'AIDS',
  },
  {
    re: /efic[aá]cia.*efici[eê]ncia.*efetividade|caso[- ]index|vigil[aâ]ncia sanit[aá]ria/i,
    label: 'Epidemiologia e Vigilância Epidemiológica',
    conf: 0.93,
    note: 'epidemiologia',
  },
  {
    re: /tratamentos oncol[oó]gicos|quimioterapia/i,
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    conf: 0.91,
    note: 'oncologia',
  },
  {
    re: /\bemulti\b.*esf|estrat[eé]gia sa[uú]de da fam[ií]lia.*emulti/i,
    label: 'Atenção Básica / Saúde da Família',
    conf: 0.93,
    note: 'eMulti/ESF',
  },
  {
    re: /acompanhamento de crian[cç]as.*acs|trabalho do acs/i,
    label: 'Atenção Básica / Saúde da Família',
    conf: 0.92,
    note: 'ACS/ESF',
  },
  {
    re: /assist[eê]ncia.*pr[eé]-natal.*parto.*puerp[eé]rio/i,
    label: 'Saúde da Mulher',
    conf: 0.94,
    note: 'pré-natal/parto',
  },
  {
    re: /vitamina k.*nascimento|vitamina k.*rec[eé]m.?nascido/i,
    label: 'Saúde da Criança',
    conf: 0.92,
    note: 'vitamina K neonatal',
  },
  {
    re: /preven[cç][aã]o e controle de infec[cç][oõ]es.*higieniza[cç][aã]o das m[aã]os/i,
    label: 'Medidas de Prevenção e Precaução de Contato',
    conf: 0.93,
    note: 'higiene das mãos',
  },
  {
    re: /fevereiro.*campanhas de conscientiza[cç][aã]o/i,
    label: 'Promoção à Saúde e Prevenção de Agravos',
    conf: 0.9,
    note: 'campanhas conscientização',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  // Vacina/calendário/técnica tem prioridade sobre menções a doenças nas alternativas.
  if (IMUNIZACAO_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Vacinas, calendário, técnica ou conservação de imunobiológicos.',
    };
  }

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Imunização.`,
      };
    }
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com Imunização ou sem destino canônico claro ≥0,90.',
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

for (let i = 1; i <= 6; i++) {
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
