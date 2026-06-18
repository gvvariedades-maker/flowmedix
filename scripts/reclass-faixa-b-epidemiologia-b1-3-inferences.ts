#!/usr/bin/env tsx
/**
 * Onda 8 — Epidemiologia faixa B, batches 01-03 (~150 questões).
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

const BUCKET = 'Epidemiologia e Vigilância Epidemiológica';
const OUT = 'artifacts/reclass/faixa-b/epidemiologia';

const EPID_CORE_RE =
  /vigil[aâ]ncia epidemiol[oó]gica|vigil[aâ]ncia em sa[uú]de|notifica[cç][aã]o compuls[oó]ria|sinan\b|sis(?:van|mama|nasc|on)|lista nacional de (?:doen[cç]as de )?notifica|investiga[cç][aã]o epidemiol[oó]gica|surto|endemia|epidemia|pandemia|taxa de (?:incid[eê]ncia|mortalidade|morbidade|letalidade)|indicador(?:es)? (?:de )?sa[uú]de|sinasc|nascidos vivos|lira+a|caso[- ]?[ií]ndice|per[ií]odo de (?:incuba[cç][aã]o|lat[eê]ncia)|hist[oó]ria natural da doen[cç]a|agente etiol[oó]gico.*(?:hospedeiro|reservat[oó]rio|vetor)|cadeia de transmiss[aã]o|efic[aá]cia.*efici[eê]ncia.*efetividade|an[aá]lise situacional|plano de sa[uú]de|regi[aã]o de sa[uú]de|portaria.*420\/2022|portaria.*1\.271|sinan|dnv\b|notifica[cç][aã]o imediata|agravo de notifica|vigil[aâ]ncia entomol[oó]gica|vigil[aâ]ncia sanit[aá]ria|controle de vetores|ace\b.*endemia|desratiza|levantamento r[aá]pido de [ií]ndices/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Objetivo da Vigilância em Saúde — núcleo epidemiológico.',
  },
  'cebraspe-cespe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Notificação compulsória e RSI — vigilância, não calendário vacinal.',
  },
  'cpcon-uepb-enfermagem-saude-da-mulher-1777104329543-4': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Registro de óbitos maternos e causas — saúde da mulher.',
  },
  'facape-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-5': {
    suggested_subtopico: 'Saúde da Mulher',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Assistência ao parto e notificação de eventos obstétricos.',
  },
  'facet-enfermagem-atencao-basica-saude-da-familia-1778968039063-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Indicadores epidemiológicos para monitoramento populacional.',
  },
  'facet-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Conduta de vigilância epidemiológica em ILPI — protocolo VE.',
  },
  'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-3': {
    suggested_subtopico: 'Imunização',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Janela imunológica — conceito de imunização/vacinação.',
  },
  'fafipa-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-9': {
    suggested_subtopico:
      'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Coqueluche — etiologia e quadro clínico bacteriano.',
  },
  'funatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-3': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Atuação do técnico na promoção da saúde, não vigilância.',
  },
  'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-3': {
    suggested_subtopico: 'Enfermagem do Trabalho',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Dermatoses ocupacionais — saúde do trabalhador.',
  },
  'fgv-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-5': {
    suggested_subtopico:
      'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Busca ativa de sintomáticos respiratórios — controle de TB.',
  },
  'fepese-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1776578199777-0': {
    suggested_subtopico:
      'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Definição de vetor/transmissão — doenças transmissíveis.',
  },
  'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-0': {
    suggested_subtopico: 'Questões Mescladas e Outras Doenças Agudas',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Manejo clínico de dengue grave no pronto-socorro.',
  },
  'ibade-enfermagem-atencao-basica-saude-da-familia-1778968144588-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Coleta demográfica para planejamento — indicadores epidemiológicos.',
  },
  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-0': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Saneamento básico e repercussões na saúde — promoção/prevenção.',
  },
  'idcap-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Roedores e desratização — vigilância de vetores/endemias.',
  },
  'ideap-geral-epidemiologia-e-vigilancia-epidemiologica-1777103502990-4': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Medidas de prevenção da dengue — controle de vetores.',
  },
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712242196-7': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Investigação de surto de hepatite A — doença viral.',
  },
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1780066961947-8': {
    suggested_subtopico: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Transmissão e endemia de esquistossomose.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008232871-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Notificação compulsória e investigação de meningite — VE.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780005791580-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Notificação compulsória à autoridade sanitária.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011908736-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Indicadores de saúde e taxas epidemiológicas.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011915153-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Conceito de endemia — terminologia epidemiológica.',
  },
  'gama-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Eficácia, eficiência e efetividade de programas de saúde.',
  },
  'gama-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Territorialização no contexto de vigilância em saúde.',
  },
  'iaupe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-8': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Definição de trauma/evento nocivo — urgência pré-hospitalar.',
  },
  'idecan-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1778712242196-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Gestão de risco de desastres em saúde pública.',
  },
  'idecan-enfermagem-atencao-basica-saude-da-familia-1778712418722-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Larvicidas e controle de vetores — vigilância entomológica.',
  },
  'idecan-enfermagem-atencao-basica-saude-da-familia-1778712418722-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Medidas de controle ambiental de vetores.',
  },
  'idecan-enfermagem-atencao-basica-saude-da-familia-1778968239687-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Larvicidas — controle de vetores/endemias.',
  },
  'idecan-enfermagem-atencao-basica-saude-da-familia-1778968263411-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Modificação ambiental contra vetores — vigilância.',
  },
  'amauc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Plano de Saúde e análise situacional — gestão epidemiológica.',
  },
  'copese-ufpi-enfermagem-atencao-basica-saude-da-familia-1778967776515-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Manejo integrado de vetores — controle de endemias.',
  },
  'copese-ufpi-enfermagem-atencao-basica-saude-da-familia-1778967776515-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Proteção do ACE e controle de endemias.',
  },
  'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Periodicidade de notificação compulsória semanal.',
  },
  'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Definição de Vigilância em Saúde — núcleo epidemiológico.',
  },
  'idcap-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Componentes da vigilância em saúde.',
  },
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Aplicações da epidemiologia na saúde pública.',
  },
  'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Definição de vigilância epidemiológica.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /janela imunol[oó]gica|calend[aá]rio (nacional )?de vacina|programa nacional de imuniza/i,
    label: 'Imunização',
    conf: 0.93,
    note: 'imunização/vacinação',
  },
  {
    re: /registro.*[óo]bitos.*mulheres|assist[eê]ncia ao parto|notifica[cç][aã]o.*parto|puerp[eé]rio/i,
    label: 'Saúde da Mulher',
    conf: 0.93,
    note: 'saúde da mulher/obstetrícia',
  },
  {
    re: /dermatoses ocupacionais|NR-?32\b|sa[uú]de ocupacional|vigil[aâ]ncia em sa[uú]de do trabalhador/i,
    label: 'Enfermagem do Trabalho',
    conf: 0.93,
    note: 'saúde do trabalho',
  },
  {
    re: /carta de ottawa|n[ií]veis de preven[cç][aã]o de levin/i,
    label: 'Promoção à Saúde e Prevenção de Agravos',
    conf: 0.91,
    note: 'promoção à saúde',
  },
  {
    re: /saneamento b[aá]sico.*repercuss|falta de saneamento b[aá]sico/i,
    label: 'Promoção à Saúde e Prevenção de Agravos',
    conf: 0.92,
    note: 'saneamento/prevenção',
  },
  {
    re: /busca ativa de sintom[aá]ticos respirat[oó]rios/i,
    label: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    conf: 0.91,
    note: 'controle de TB',
  },
  {
    re: /^A coqueluche [eé]|Bordetella pertussis/i,
    label: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    conf: 0.92,
    note: 'coqueluche',
  },
  {
    re: /d[aá] entrada no pronto-socorro.*dengue grave|diagn[oó]stico m[eé]dico confirmado de dengue grave/i,
    label: 'Questões Mescladas e Outras Doenças Agudas',
    conf: 0.91,
    note: 'dengue aguda',
  },
  {
    re: /esquistossomose.*end[eê]mica|transmiss[aã]o da esquistossomose/i,
    label: 'Doenças Parasitárias e Zoonoses',
    conf: 0.92,
    note: 'esquistossomose',
  },
  {
    re: /surto de hepatite a|hepatite a em sua cidade/i,
    label: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    conf: 0.91,
    note: 'hepatite A',
  },
  {
    re: /inseto ou qualquer portador vivo que transporta um agente infeccioso/i,
    label: 'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
    conf: 0.93,
    note: 'vetor/transmissão',
  },
  {
    re: /trauma [eé] definido como.*evento nocivo|libera[cç][aã]o de formas espec[ií]ficas de energia/i,
    label: 'Urgências e Emergências',
    conf: 0.91,
    note: 'trauma/urgência',
  },
  {
    re: /medidas para preven[cç][aã]o da dengue.*exceto|preven[cç][aã]o da dengue, exceto/i,
    label: 'Doenças Parasitárias e Zoonoses',
    conf: 0.91,
    note: 'controle dengue',
  },
  {
    re: /\bNANDA\b|diagn[oó]stico de enfermagem.*NANDA|etapas do processo de enfermagem/i,
    label: 'Processo de Enfermagem',
    conf: 0.93,
    note: 'SAE/processamento PE',
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
        rationale: `${rule.note} — tema dominante fora de Epidemiologia.`,
      };
    }
  }

  if (EPID_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Vigilância, indicadores, notificação ou conceitos epidemiológicos.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com Epidemiologia ou sem destino canônico claro ≥0,90.',
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
