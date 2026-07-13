#!/usr/bin/env tsx
/**
 * Onda 6 — Cuidados na Administração de Medicamentos faixa C, batches 01-03 (~150 questões).
 * Núcleo: 6 certos, interações, preparo, vigilância.
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

const BUCKET = 'Cuidados na Administração de Medicamentos';
const OUT = 'artifacts/reclass/faixa-c/cuidados-medicamentos';

const MED_CORE_RE =
  /(?:5|6|7|8|9|10|nove|dez) certos|certos da (medica|administra)|registro certo|documenta[cç][aã]o certa|preparo de medic|preparo da medica|fase de preparo de medica|reconstitui[cç][aã]o|barreira final|confer[eê]ncia rigorosa|intera[cç][aã]o medicament|incompatibilidade.*medic|erro.*medica|administra[cç][aã]o segura de medic|imprud[eê]ncia|antecipar o hor[aá]rio de um medic|frasco.*ileg[ií]vel|r[oó]tulo.*ileg[ií]vel|identifica[cç][aã]o do medicamento|vigil[aâ]ncia.*medic|rea[cç][aã]o adversa.*medic|evento adverso.*medic|edema de l[aá]bios|urtic[aá]ria|anafilaxia|dose maior que a prescrita|dose prescrita corresponde|n[aã]o administrar o medicamento|administrar medicamento|administra[cç][aã]o de medic|preparo e administra[cç][aã]o|medica[cç][aã]o intramuscular|medica[cç][aã]o oral|medica[cç][aã]o intravenosa|insulina.*administra|bolus intravenoso|infus[aã]o cont[ií]nua.*medic|refrigera[cç][aã]o.*reconstitu|assepsia.*preparo|seguran[cç]a do paciente na administra[cç][aã]o de medic|padr[oõ]es de execu[cç][aã]o do procedimento.*medic|notificar.*erro.*medic|comunicar o enfermeiro.*medic/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'ameosc-enfermagem-cuidados-na-administracao-de-medicamentos-1778969504315-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Mescla administração de medicamentos e curativos sem tema dominante único.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1776056129848-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Registro de intercorrência após administração de medicação — vigilância.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780002934000-9': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Protocolos de segurança e conferência na administração de medicamentos.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008225255-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Superdosagem medicamentosa e conduta de segurança na administração.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008225255-9': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Administração de medicamento por via prescrita com conferência dos certos.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008232871-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Administração oral seguindo prescrição e princípios dos certos.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002714111-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.96,
    keep_current: true,
    rationale: 'Conferência dos certos antes da administração de medicamento.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003137298-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.97,
    keep_current: true,
    rationale: 'Conferência dos certos antes de administrar medicamento.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Diluição de antibiótico IV conforme orientação — preparo medicamentoso.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003793968-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Princípio dos certos na administração oral.',
  },
  'avancasp-enfermagem-seguranca-do-paciente-1777102742836-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Padrões de execução para evitar erros na administração de medicamento.',
  },
  'avancasp-enfermagem-seguranca-do-paciente-1777102742836-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Registro certo na documentação da administração de medicação.',
  },
  'avancasp-enfermagem-seguranca-do-paciente-1777102861438-4': {
    suggested_subtopico: 'Vias de Administração',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Técnica e local de aplicação da injeção intramuscular.',
  },
  'cebraspe-cespe-enfermagem-cuidados-na-administracao-de-medicamentos-1778969573419-7': {
    suggested_subtopico: 'Farmacodinâmica e Farmacocinética',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Princípios farmacológicos gerais, não rotina de preparo/administração.',
  },
  'cebraspe-cespe-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-8': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Protocolo de segurança na prescrição, uso e administração de medicamentos.',
  },
  'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-0': {
    suggested_subtopico: 'Segurança do Paciente',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Dano associado à assistência em saúde — segurança do paciente geral.',
  },
  'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.96,
    keep_current: true,
    rationale: 'Seguir os certos no preparo e administração de medicamentos.',
  },
  'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-7': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Cuidados com idoso voltados à autonomia e promoção da saúde.',
  },
  'coseac-uff-enfermagem-cuidados-na-administracao-de-medicamentos-1779343967847-2': {
    suggested_subtopico: 'Vias de Administração',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Locais anatômicos indicados para injeção intramuscular.',
  },
  'coseac-uff-enfermagem-cuidados-na-administracao-de-medicamentos-1779343967847-4': {
    suggested_subtopico: 'Infecções no Contexto da Biossegurança',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Clorexidina no controle de infecção hospitalar — biossegurança.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003868364-4': {
    suggested_subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.95,
    keep_current: false,
    rationale: 'Manejo clínico de suspeita de dengue — doença viral.',
  },
  'fafipa-enfermagem-processo-de-enfermagem-1780009386446-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.97,
    keep_current: true,
    rationale: 'Interações medicamentosas entre dipirona, AAS e anticoagulantes.',
  },
  'fafipa-enfermagem-processo-de-enfermagem-1780009386446-5': {
    suggested_subtopico: 'Saúde da Criança',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Aleitamento materno e linha de cuidado da criança.',
  },
  'fafipa-enfermagem-processo-de-enfermagem-1780009386446-7': {
    suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Programa de controle do tabagismo — prevenção de agravos.',
  },
  'fauel-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-3': {
    suggested_subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cálculo de dose a partir de concentração da ampola.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006471061-9': {
    suggested_subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Cálculo de gotejamento de solução intravenosa.',
  },
  'fundatec-enfermagem-cuidados-na-administracao-de-medicamentos-1778969685650-6': {
    suggested_subtopico: 'Farmacodinâmica e Farmacocinética',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Mecanismo de ação dos anticoagulantes — farmacologia.',
  },
  'fundatec-enfermagem-cuidados-na-administracao-de-medicamentos-1778969685650-7': {
    suggested_subtopico: 'Farmacodinâmica e Farmacocinética',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Fisiologia e produção da insulina — farmacologia, não técnica de aplicação.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780001903454-2': {
    suggested_subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cálculo de dose de ondansetrona a partir do frasco-ampola.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Reação alérgica após administração — vigilância medicamentosa.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Preparo e administração segura de analgesia em politraumatizado.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-4': {
    suggested_subtopico: 'Urgências e Emergências',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Manejo medicamentoso de crise hipertensiva em urgência.',
  },
  'fundatec-enfermagem-seguranca-do-paciente-1779563436357-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Erros na prática assistencial com foco em administração de medicamentos.',
  },
  'fundatec-enfermagem-seguranca-do-paciente-1779563443877-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Preparo e administração de medicamentos em serviço de urgência.',
  },
  'furb-enfermagem-cuidados-na-administracao-de-medicamentos-1778969685650-0': {
    suggested_subtopico: 'Farmacodinâmica e Farmacocinética',
    confidence: 0.91,
    keep_current: false,
    rationale: 'Indicação terapêutica da vancomicina — farmacologia clínica.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011908736-0': {
    suggested_subtopico: 'Vias de Administração',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Calibre e comprimento de agulha para via parenteral.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011908736-6': {
    suggested_subtopico: 'Vias de Administração',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Técnicas de administração intramuscular.',
  },
  'furb-enfermagem-processo-de-enfermagem-1780011915153-1': {
    suggested_subtopico: 'Vias de Administração',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Técnicas de administração intramuscular.',
  },
  'grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-4': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Segurança do paciente e acompanhamento de terapias medicamentosas.',
  },
  'grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Dose prescrita incompatível com protocolo — não administrar e comunicar.',
  },
  'ibade-enfermagem-cuidados-na-administracao-de-medicamentos-1778969573419-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Mescla preparo de medicamentos e exames sem tema dominante único.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /promo[cç][aã]o da sa[uú]de|fitoterapia|pr[aá]ticas integrativas|controle do tabagismo/i,
    label: 'Promoção à Saúde e Prevenção de Agravos',
    conf: 0.93,
    note: 'promoção/prevenção',
  },
  {
    re: /fatores de risco.*diabetes|pr[eé]-diabetes|glicocorticoide/i,
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    conf: 0.94,
    note: 'fatores de risco diabetes',
  },
  {
    re: /alta hospitalar|transi[cç][aã]o de cuidados/i,
    label: 'Processo de Enfermagem',
    conf: 0.92,
    note: 'alta/transição',
  },
  {
    re: /prontu[aá]rio|anota[cç][aã]o de enfermagem|registros de enfermagem/i,
    label: 'Processo de Enfermagem',
    conf: 0.93,
    note: 'documentação PE',
  },
  {
    re: /transtorno mental|comportamento agressivo verbal/i,
    label: 'Saúde Mental',
    conf: 0.94,
    note: 'saúde mental',
  },
  {
    re: /biosseguran[cç]a em servi[cç]os|reutiliza[cç][aã]o de seringa/i,
    label: 'Medidas de Prevenção e Precaução de Contato',
    conf: 0.93,
    note: 'biossegurança/precauções',
  },
  {
    re: /sistema [uú]nico de sa[uú]de|acesso universal.*sus/i,
    label: 'Atenção Básica / Saúde da Família',
    conf: 0.92,
    note: 'SUS/APS',
  },
  {
    re: /finalidade principal.*enfermagem|atividades.*responsabilidade do enfermeiro/i,
    label: 'Processo de Enfermagem',
    conf: 0.91,
    note: 'atribuições PE',
  },
  {
    re: /gotejamento de solu[cç][oõ]es|gts\/min|regra de tr[eê]s|ampola de \d+ mL contendo \d+ mg|gotas de um medicamento oral.*seringa graduada/i,
    label: 'Cálculo de Administração de Medicamentos e Infusões',
    conf: 0.94,
    note: 'cálculo de dose/gotejamento',
  },
  {
    re: /aferi[cç][aã]o.*press[aã]o arterial|press[aã]o arterial.*avali/i,
    label: 'Verificação de Sinais Vitais',
    conf: 0.95,
    note: 'aferição de PA',
  },
  {
    re: /glicos[ií]metro|glicemia capilar/i,
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    conf: 0.93,
    note: 'glicemia capilar',
  },
  {
    re: /s[ií]filis/i,
    label: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    conf: 0.96,
    note: 'sífilis',
  },
  {
    re: /parto de emerg[eê]ncia|puerp[eé]ra|sangramento vaginal volumoso/i,
    label: 'Saúde da Mulher',
    conf: 0.95,
    note: 'puerpério/parto',
  },
  {
    re: /acidose metab[oó]lica grave|ventila[cç][aã]o mec[aâ]nica prolongada/i,
    label: 'Urgências e Emergências',
    conf: 0.94,
    note: 'urgência crítica',
  },
  {
    re: /pr[eé]-operat[oó]rio.*cuidado b[aá]sico/i,
    label: 'Assistência Perioperatória (Inclui SRPA)',
    conf: 0.92,
    note: 'pré-operatório',
  },
  {
    re: /aleitamento materno|linha de cuidado da crian[cç]a/i,
    label: 'Saúde da Criança',
    conf: 0.94,
    note: 'saúde da criança',
  },
  {
    re: /suspeita de dengue|manejo cl[ií]nico.*dengue/i,
    label: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    conf: 0.95,
    note: 'dengue',
  },
  {
    re: /ilhotas de langerhans|mecanismo de a[cç][aã]o do f[aá]rmaco|princ[ií]pios farmacol[oó]gicos/i,
    label: 'Farmacodinâmica e Farmacocinética',
    conf: 0.92,
    note: 'farmacologia',
  },
  {
    re: /volume m[aá]ximo.*intramuscular|vasto lateral da coxa|di[aâ]metro e do comprimento das agulhas|escolha adequada do di[aâ]metro/i,
    label: 'Vias de Administração',
    conf: 0.93,
    note: 'técnica/via parenteral',
  },
  {
    re: /pomadas antib[ió]ticas em curativos/i,
    label: 'Curativos e Manejo de Feridas',
    conf: 0.94,
    note: 'curativos',
  },
  {
    re: /envelhecimento.*sens[ií]vel aos efeitos adversos/i,
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    conf: 0.91,
    note: 'farmacoterapia no idoso',
  },
  {
    re: /OMS.*1 em cada 10 pacientes/i,
    label: 'Segurança do Paciente',
    conf: 0.92,
    note: 'segurança do paciente OMS',
  },
  {
    re: /infec[cç][aã]o hospitalar|gluconato de clorexidina/i,
    label: 'Infecções no Contexto da Biossegurança',
    conf: 0.93,
    note: 'IRAS/biossegurança',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  if (MED_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: '6 certos, preparo, interações ou vigilância na administração de medicamentos.',
    };
  }

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Cuidados na Administração de Medicamentos.`,
      };
    }
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com administração de medicamentos ou sem destino canônico claro ≥0,90.',
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
