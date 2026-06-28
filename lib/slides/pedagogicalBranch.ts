/**
 * Ramo pedagógico (L2.5) — subtópico canônico é bucket; o ramo define molde L3.
 *
 * @see docs/MOLD_AFFINITY_RESOLVER.md
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { getDesignBySubtopic, type SubtopicDesign } from '@/components/slides/core/themeGenerator';
import { collectSlideTextCorpus, type MoldAffinitySlide } from '@/lib/slides/moldAffinity';

export type PedagogicalBranchId =
  // Saúde do Adolescente
  | 'adolescente_etica_sigilo'
  | 'adolescente_antropometria'
  | 'adolescente_desenvolvimento'
  | 'adolescente_saude_mental'
  | 'adolescente_violencia_protecao'
  | 'adolescente_generico'
  // CME
  | 'cme_preparo_limpeza'
  | 'cme_autoclave_metodos'
  | 'cme_processamento_conceito'
  | 'cme_vf_ce'
  | 'cme_generico'
  // Saúde Mental
  | 'mental_raps_legis'
  | 'mental_dependencia_tabagismo'
  | 'mental_crise_caps'
  | 'mental_depressao'
  | 'mental_aps_acolhimento'
  | 'mental_generico'
  // Sondas
  | 'sonda_instalacao_protocolo'
  | 'sonda_medicao_nex'
  | 'sonda_generico'
  // Farmacodinâmica e Farmacocinética
  | 'farmaco_pk_pd_vf'
  | 'farmaco_clinico_protocolo'
  | 'farmaco_generico'
  // Imunização
  | 'imunizacao_vf_intervalos'
  | 'imunizacao_calendario'
  | 'imunizacao_generico'
  // Vias de Administração
  | 'via_vf_absorcao'
  | 'via_tecnica_admin'
  | 'via_generico'
  // Cálculo de Medicamentos
  | 'calc_dose_equivalencia'
  | 'calc_conceito'
  | 'calc_generico';

const ADOLESCENTE_ETHICS_MOLD: SubtopicDesign = {
  template: 'sky',
  conceptMap: 'adolescent-privacy-curtain',
  goldenRule: 'adolescent-sigilo-spectrum',
  logicFlow: 'adolescent-vf-weave-tap',
  dangerZone: 'adolescent-consent-gate',
};

/** Layout genérico dentro do tema adolescente (sem moldes ética/sigilo). */
export const ADOLESCENTE_GENERIC_DESIGN: SubtopicDesign = {
  template: 'sky',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const CME_DEFAULT: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'bridge',
  goldenRule: 'minimal',
  logicFlow: 'cards',
  dangerZone: 'list',
};

const CME_REFERENCE: SubtopicDesign = {
  template: 'teal',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const MENTAL_CRISIS_MOLD: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'sae-decision-tap',
  dangerZone: 'norm-reveal',
};

const MENTAL_GENERIC: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const MENTAL_LEGIS: SubtopicDesign = {
  template: 'violet',
  conceptMap: 'bridge',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const SONDA_BESPOKE: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'procedure-protocol',
  goldenRule: 'sonda-measurement-board',
  logicFlow: 'sonda-decision-tap',
  dangerZone: 'trap-reveal',
};

const SONDA_GENERIC: SubtopicDesign = {
  template: 'indigo',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

/** Pacote VF PK/PD — trilho adme-journey-rail (âncora FUNCAMP). */
const FARMACO_VF_MOLD: SubtopicDesign = {
  template: 'purple',
  conceptMap: 'adme-journey-rail',
  goldenRule: 'pk-pd-reference-board',
  logicFlow: 'farmaco-vf-juggle-tap',
  dangerZone: 'farmaco-trap',
};

/** MCQ clínico — droga, via, infusão (omeprazol, antibiótico EV…). */
const FARMACO_CLINICO_MOLD: SubtopicDesign = {
  template: 'purple',
  conceptMap: 'morphological',
  goldenRule: 'banner',
  logicFlow: 'cards',
  dangerZone: 'compare',
};

const FARMACO_GENERIC_MOLD: SubtopicDesign = {
  template: 'purple',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const IMUNIZACAO_VF_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'pni-rules-deck',
  goldenRule: 'pni-interval-matrix',
  logicFlow: 'pni-vf-juggle-tap',
  dangerZone: 'pni-trap-chips',
};

const IMUNIZACAO_CALENDARIO_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'morphological',
  goldenRule: 'pni-interval-matrix',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const IMUNIZACAO_GENERIC_MOLD: SubtopicDesign = {
  template: 'lime',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const VIA_VF_MOLD: SubtopicDesign = {
  template: 'emerald',
  conceptMap: 'absorption-speed-rail',
  goldenRule: 'via-reference-board',
  logicFlow: 'via-vf-juggle-tap',
  dangerZone: 'route-trap',
};

const VIA_TECNICA_MOLD: SubtopicDesign = {
  template: 'emerald',
  conceptMap: 'morphological',
  goldenRule: 'banner',
  logicFlow: 'cards',
  dangerZone: 'compare',
};

const VIA_GENERIC_MOLD: SubtopicDesign = {
  template: 'emerald',
  conceptMap: 'morphological',
  goldenRule: 'center',
  logicFlow: 'vertical',
  dangerZone: 'compare',
};

const CALC_DOSE_MOLD: SubtopicDesign = {
  template: 'blue',
  conceptMap: 'dose-equivalence-rail',
  goldenRule: 'soft-lens-board',
  logicFlow: 'dose-calc-tap',
  dangerZone: 'dose-trap',
};

const CALC_GENERIC_MOLD: SubtopicDesign = {
  template: 'blue',
  conceptMap: 'morphological',
  goldenRule: 'reference_table',
  logicFlow: 'horizontal',
  dangerZone: 'compare',
};

/**
 * Mapa ramo → pacote L3 por subtópico.
 * Chave externa: fragmento normalizado do subtópico canônico.
 */
export const BRANCH_DESIGN_MAP: Record<string, Partial<Record<PedagogicalBranchId, SubtopicDesign>>> = {
  'saude do adolescente': {
    adolescente_etica_sigilo: ADOLESCENTE_ETHICS_MOLD,
    adolescente_antropometria: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_desenvolvimento: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_saude_mental: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_violencia_protecao: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_generico: ADOLESCENTE_GENERIC_DESIGN,
  },
  adolescente: {
    adolescente_etica_sigilo: ADOLESCENTE_ETHICS_MOLD,
    adolescente_antropometria: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_desenvolvimento: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_saude_mental: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_violencia_protecao: ADOLESCENTE_GENERIC_DESIGN,
    adolescente_generico: ADOLESCENTE_GENERIC_DESIGN,
  },
  'central de material e esterilizacao': {
    cme_preparo_limpeza: CME_DEFAULT,
    cme_autoclave_metodos: CME_REFERENCE,
    cme_processamento_conceito: CME_DEFAULT,
    cme_vf_ce: CME_REFERENCE,
    cme_generico: CME_DEFAULT,
  },
  cme: {
    cme_preparo_limpeza: CME_DEFAULT,
    cme_autoclave_metodos: CME_REFERENCE,
    cme_processamento_conceito: CME_DEFAULT,
    cme_vf_ce: CME_REFERENCE,
    cme_generico: CME_DEFAULT,
  },
  'saude mental': {
    mental_raps_legis: MENTAL_LEGIS,
    mental_dependencia_tabagismo: MENTAL_GENERIC,
    mental_crise_caps: MENTAL_CRISIS_MOLD,
    mental_depressao: MENTAL_GENERIC,
    mental_aps_acolhimento: MENTAL_GENERIC,
    mental_generico: MENTAL_GENERIC,
  },
  psiquiatria: {
    mental_raps_legis: MENTAL_LEGIS,
    mental_dependencia_tabagismo: MENTAL_GENERIC,
    mental_crise_caps: MENTAL_CRISIS_MOLD,
    mental_depressao: MENTAL_GENERIC,
    mental_aps_acolhimento: MENTAL_GENERIC,
    mental_generico: MENTAL_GENERIC,
  },
  'instalacao e manejo de sondas': {
    sonda_instalacao_protocolo: SONDA_BESPOKE,
    sonda_medicao_nex: SONDA_BESPOKE,
    sonda_generico: SONDA_GENERIC,
  },
  sondas: {
    sonda_instalacao_protocolo: SONDA_BESPOKE,
    sonda_medicao_nex: SONDA_BESPOKE,
    sonda_generico: SONDA_GENERIC,
  },
  'farmacodinamica e farmacocinetica': {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  farmacodinamica: {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  farmacocinetica: {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  farmacologia: {
    farmaco_pk_pd_vf: FARMACO_VF_MOLD,
    farmaco_clinico_protocolo: FARMACO_CLINICO_MOLD,
    farmaco_generico: FARMACO_GENERIC_MOLD,
  },
  imunizacao: {
    imunizacao_vf_intervalos: IMUNIZACAO_VF_MOLD,
    imunizacao_calendario: IMUNIZACAO_CALENDARIO_MOLD,
    imunizacao_generico: IMUNIZACAO_GENERIC_MOLD,
  },
  vacinacao: {
    imunizacao_vf_intervalos: IMUNIZACAO_VF_MOLD,
    imunizacao_calendario: IMUNIZACAO_CALENDARIO_MOLD,
    imunizacao_generico: IMUNIZACAO_GENERIC_MOLD,
  },
  'vias de administracao': {
    via_vf_absorcao: VIA_VF_MOLD,
    via_tecnica_admin: VIA_TECNICA_MOLD,
    via_generico: VIA_GENERIC_MOLD,
  },
  'calculo de administracao de medicamentos e infusoes': {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
  'calculo de administracao de medicamentos': {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
  'calculos de enfermagem': {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
  dosagens: {
    calc_dose_equivalencia: CALC_DOSE_MOLD,
    calc_conceito: CALC_GENERIC_MOLD,
    calc_generico: CALC_GENERIC_MOLD,
  },
};

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function countPatternMatches(corpus: string, patterns: RegExp[]): number {
  return patterns.reduce((n, p) => (p.test(corpus) ? n + 1 : n), 0);
}

const NUTRITION_ANTHROPOMETRY: RegExp[] = [
  /escore\s*z|score\s*z|\bz\s*[<>≤≥]|desvio[\s-]?padr[aã]o/i,
  /\bimc\b|índice de massa|eutrofi|sobrepeso|obesidade|magreza/i,
  /antropometr|pondero[\s-]?estatur|caderneta do adolescente|curvas?\s*oms/i,
  /classifica[cç][aã]o nutricional|estatura muito baixa/i,
];

const ADOLESCENT_ETHICS: RegExp[] = [
  /sigilo|confidencial|quebra de sigilo|quebrar sigilo/i,
  /escuta qualificada|privacidade|acolhimento|v[ií]nculo/i,
  /gravidez|gestante|gesta[cç][aã]o|pr[eé][\s-]?natal/i,
  /\bcaps\b|aten[cç][aã]o psicossocial/i,
  /contracep|orienta[cç][aã]o sexual/i,
  /autonomia|consentimento|respons[aá]vel legal/i,
];

/** Violência / rede de proteção — não usar moldes de sigilo em consulta. */
const ADOLESCENT_VIOLENCE: RegExp[] = [
  /viol[eê]ncia sexual|abuso sexual|agressor|denunciar.*abusador/i,
  /notifica[cç][aã]o compuls[oó]ria.*viol|agravo.*notifica[cç]/i,
  /rede de prote[cç][aã]o|conselho tutelar|ind[ií]cios? de viol[eê]ncia/i,
  /viol[eê]ncia.*crian[cç]a|viol[eê]ncia.*adolescente|espa[cç]o.*viol[eê]ncia sexual/i,
];

const ADOLESCENT_DEVELOPMENT: RegExp[] = [
  /puberdade|puberal|metamorfose/i,
  /horm[oô]nio|disfun[cç][aã]o hormonal|desenvolvimento das mamas|test[ií]culo/i,
  /menarca|espermarquia|estadiamento de tanner|tanner/i,
  /atraso na puberdade|maturidade sexual/i,
];

const ADOLESCENT_MENTAL: RegExp[] = [
  /anorexia|bulimia|transtorno alimentar|imagem corporal/i,
  /depress[aã]o adolescente|autoles[aã]o|suic[ií]dio adolescente/i,
  /sa[uú]de mental.*adolescente/i,
];

const CME_PREPARO: RegExp[] = [
  /preparo|pr[eé][\s-]?secagem|limpeza de instrumental|descontamin|lavagem mec[aâ]nica|ultrasson/i,
];

const CME_AUTOCLAVE: RegExp[] = [
  /autoclave|vapor saturado|esteriliza[cç][aã]o por calor|temperatura.*press[aã]o|ciclo de esteriliza/i,
  /indicador (qu[ií]mico|biol[oó]gico)|embalagem.*esteril/i,
];

const CME_PROCESSAMENTO: RegExp[] = [
  /processamento de artigos|áreas?\s*(limp|suja|semimorta)|cadeia de processamento|rt\b.*cme/i,
];

const CME_VF_CE: RegExp[] = [
  /julgue|certo ou errado|verdadeira.*falsa|assinale a alternativa incorreta|exceto/i,
];

const MENTAL_RAPS: RegExp[] = [
  /\braps\b|reforma psiqui[aá]trica|\bsrt\b|portaria.*3088|rede de aten[cç][aã]o psicossocial/i,
];

const MENTAL_DEPENDENCIA: RegExp[] = [
  /tabagismo|pnct|depend[eê]ncia qu[ií]mica|álcool|redu[cç][aã]o de danos|cigarro|nicotina/i,
];

const MENTAL_CRISE: RegExp[] = [
  /crise|agita[cç][aã]o|conten[cç][aã]o f[ií]sica|\bcaps\b|urg[eê]ncia psiqui[aá]trica/i,
  /risco suicida|ideação suicida|autoagress/i,
];

const MENTAL_DEPRESSAO: RegExp[] = [
  /depress[aã]o|transtorno de humor|epidemiologia.*mental|melancolia/i,
];

const MENTAL_APS: RegExp[] = [
  /\baps\b|aten[cç][aã]o b[aá]sica|biopsicossocial|acolhimento.*prim[aá]ria/i,
];

const SONDA_MEDICAO: RegExp[] = [
  /\bnex\b|nariz.*orelha|lobo da orelha|xifoide|umbigo|medi[cç][aã]o.*sonda|comprimento/i,
];

const SONDA_INSTALACAO: RegExp[] = [
  /instala[cç][aã]o|fixa[cç][aã]o|nasog[aá]strica|nasoenteral|bal[aã]o|gastrostomia|jejunostomia/i,
];

const FARMACO_VF: RegExp[] = [
  /\b(i|ii|iii)\s*[-–—]/i,
  /afirmativa|verdadeira.*falsa|julgue os itens|correto o que se afirma/i,
  /meia[\s-]?vida|t½|t1\/2|\badme\b/i,
  /farmacocin[eé]tica.*farmacodin[aâ]mica|corpo.*f[aá]rmaco/i,
];

const FARMACO_CLINICO: RegExp[] = [
  /hospitaliz|úlcera|infus[aã]o contínua|monitoriz|ph g[aá]stric|titulad/i,
  /omeprazol|antibi[oó]tic|endovenos|fentanil|meropenem|insulina|anest[eé]sico local/i,
  /administra[cç][aã]o correta|conduta.*enfermagem.*medicamento/i,
];

const IMUNIZACAO_VF: RegExp[] = [
  /\b(i|ii|iii)\s*[-–—]/i,
  /afirmativa|verdadeira.*falsa|julgue os itens/i,
  /intervalo|refor[cç]o|dose.*vacina/i,
];

const IMUNIZACAO_CALENDARIO: RegExp[] = [
  /calend[aá]rio|pni\b|esquema vacinal|idade.*dose|refor[cç]o|bcg|tr[ií]plice|hexa|penta/i,
];

const VIA_VF: RegExp[] = [
  /\b(i|ii|iii)\s*[-–—]/i,
  /absor[cç][aã]o|biodisponibilidade|via.*intramuscular|via.*subcut[aâ]nea/i,
];

const VIA_TECNICA: RegExp[] = [
  /t[eé]cnica|administra[cç][aã]o|ângulo|m[uú]sculo|deltoide|ventrogluteo|pun[cç][aã]o/i,
];

const CALC_DOSE: RegExp[] = [
  /calcul|gota|ml\b|mg\b|equival[eê]ncia|dilui[cç][aã]o|regra de tr[eê]s|gts\/min|ml\/h/i,
  /quantos?\s+ml|quantas?\s+gotas|prescri[cç][aã]o.*dose/i,
];

function branchMapKey(subtopico: string): string | undefined {
  const key = normalizeKey(subtopico);
  const matches = Object.keys(BRANCH_DESIGN_MAP).filter(
    (k) => key === k || key.includes(k) || k.includes(key),
  );
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => b.length - a.length)[0];
}

/** true quando o subtópico tem ramos L2.5 em BRANCH_DESIGN_MAP (elegível a backfill). */
export function hasSubtopicBranchDesign(subtopico: string | undefined): boolean {
  if (!subtopico?.trim()) return false;
  return branchMapKey(subtopico) !== undefined;
}

function inferAdolescentBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (familyId === 'calc' || countPatternMatches(corpus, NUTRITION_ANTHROPOMETRY) > 0) {
    return 'adolescente_antropometria';
  }
  if (countPatternMatches(corpus, ADOLESCENT_VIOLENCE) > 0) {
    return 'adolescente_violencia_protecao';
  }
  if (countPatternMatches(corpus, ADOLESCENT_ETHICS) > 0) {
    return 'adolescente_etica_sigilo';
  }
  if (countPatternMatches(corpus, ADOLESCENT_DEVELOPMENT) > 0) {
    return 'adolescente_desenvolvimento';
  }
  if (countPatternMatches(corpus, ADOLESCENT_MENTAL) > 0) {
    return 'adolescente_saude_mental';
  }
  return 'adolescente_generico';
}

function inferCmeBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (familyId === 'certo_errado' || familyId === 'vf' || countPatternMatches(corpus, CME_VF_CE) > 0) {
    return 'cme_vf_ce';
  }
  if (countPatternMatches(corpus, CME_AUTOCLAVE) > 0) {
    return 'cme_autoclave_metodos';
  }
  if (countPatternMatches(corpus, CME_PREPARO) > 0) {
    return 'cme_preparo_limpeza';
  }
  if (countPatternMatches(corpus, CME_PROCESSAMENTO) > 0) {
    return 'cme_processamento_conceito';
  }
  return 'cme_generico';
}

function inferMentalBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, MENTAL_RAPS) > 0) {
    return 'mental_raps_legis';
  }
  if (countPatternMatches(corpus, MENTAL_CRISE) > 0) {
    return 'mental_crise_caps';
  }
  if (countPatternMatches(corpus, MENTAL_DEPENDENCIA) > 0) {
    return 'mental_dependencia_tabagismo';
  }
  if (countPatternMatches(corpus, MENTAL_DEPRESSAO) > 0) {
    return 'mental_depressao';
  }
  if (countPatternMatches(corpus, MENTAL_APS) > 0) {
    return 'mental_aps_acolhimento';
  }
  return 'mental_generico';
}

function inferSondaBranch(corpus: string): PedagogicalBranchId {
  if (countPatternMatches(corpus, SONDA_MEDICAO) > 0 && countPatternMatches(corpus, SONDA_INSTALACAO) === 0) {
    return 'sonda_medicao_nex';
  }
  if (countPatternMatches(corpus, SONDA_INSTALACAO) > 0 || countPatternMatches(corpus, SONDA_MEDICAO) > 0) {
    return 'sonda_instalacao_protocolo';
  }
  return 'sonda_generico';
}

function inferFarmacoBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const isVf =
    familyId === 'vf' ||
    (countPatternMatches(corpus, FARMACO_VF) >= 2 &&
      /\b(i|ii|iii)\s*[-–—]/i.test(corpus));
  if (isVf) return 'farmaco_pk_pd_vf';

  const isClinical =
    familyId === 'protocolo' ||
    (familyId !== 'vf' && countPatternMatches(corpus, FARMACO_CLINICO) > 0);
  if (isClinical) return 'farmaco_clinico_protocolo';

  return 'farmaco_generico';
}

function inferImunizacaoBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const isVf =
    familyId === 'vf' ||
    familyId === 'certo_errado' ||
    (/\b(i|ii|iii)\s*[-–—]/i.test(corpus) && countPatternMatches(corpus, IMUNIZACAO_VF) >= 1);
  if (isVf) return 'imunizacao_vf_intervalos';

  if (countPatternMatches(corpus, IMUNIZACAO_CALENDARIO) > 0) {
    return 'imunizacao_calendario';
  }

  return 'imunizacao_generico';
}

function inferViaBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  const isVf =
    familyId === 'vf' ||
    (/\b(i|ii|iii)\s*[-–—]/i.test(corpus) && countPatternMatches(corpus, VIA_VF) >= 1);
  if (isVf) return 'via_vf_absorcao';

  if (countPatternMatches(corpus, VIA_TECNICA) > 0) {
    return 'via_tecnica_admin';
  }

  return 'via_generico';
}

function inferCalcBranch(corpus: string, familyId?: FamilyId): PedagogicalBranchId {
  if (familyId === 'calc' || countPatternMatches(corpus, CALC_DOSE) > 0) {
    return 'calc_dose_equivalencia';
  }
  if (familyId === 'conceito' || /conceito|defini[cç][aã]o/i.test(corpus)) {
    return 'calc_conceito';
  }
  return 'calc_generico';
}

function inferBranchForBucket(
  mapKey: string,
  corpus: string,
  familyId?: FamilyId,
): PedagogicalBranchId | undefined {
  if (mapKey.includes('adolescente')) {
    return inferAdolescentBranch(corpus, familyId);
  }
  if (mapKey.includes('cme') || mapKey.includes('material')) {
    return inferCmeBranch(corpus, familyId);
  }
  if (mapKey.includes('mental') || mapKey === 'psiquiatria') {
    return inferMentalBranch(corpus);
  }
  if (mapKey.includes('sonda')) {
    return inferSondaBranch(corpus);
  }
  if (
    mapKey.includes('farmacodinamica') ||
    mapKey.includes('farmacocinetica') ||
    mapKey.includes('farmacologia')
  ) {
    return inferFarmacoBranch(corpus, familyId);
  }
  if (mapKey.includes('imunizacao') || mapKey.includes('vacinacao')) {
    return inferImunizacaoBranch(corpus, familyId);
  }
  if (mapKey.includes('vias de administracao')) {
    return inferViaBranch(corpus, familyId);
  }
  if (
    mapKey.includes('calculo de administracao') ||
    mapKey.includes('calculos de enfermagem') ||
    mapKey === 'dosagens'
  ) {
    return inferCalcBranch(corpus, familyId);
  }
  return undefined;
}

/** Ramo explícito em meta ou inferido por enunciado + slides. */
export function inferPedagogicalBranch(
  subtopico: string | undefined,
  instruction: string,
  slides: MoldAffinitySlide[],
  familyId?: FamilyId,
): PedagogicalBranchId | undefined {
  const mapKey = subtopico ? branchMapKey(subtopico) : undefined;
  if (!mapKey) return undefined;

  const corpus = [instruction, ...slides.map((s) => collectSlideTextCorpus(s))].join(' ');
  return inferBranchForBucket(mapKey, corpus, familyId);
}

export function resolvePedagogicalBranch(
  subtopico: string | undefined,
  instruction: string,
  slides: MoldAffinitySlide[],
  explicitBranch?: string | null,
  familyId?: FamilyId,
): PedagogicalBranchId | undefined {
  if (explicitBranch?.trim()) {
    return explicitBranch.trim() as PedagogicalBranchId;
  }
  return inferPedagogicalBranch(subtopico, instruction, slides, familyId);
}

/** Design L3 efetivo: ramo vence mapa fixo do subtópico quando há entrada em BRANCH_DESIGN_MAP. */
export function getPresentationDesign(
  subtopico: string | undefined,
  branch?: PedagogicalBranchId,
): SubtopicDesign | undefined {
  if (!subtopico?.trim()) return undefined;

  const mapKey = branchMapKey(subtopico);
  if (mapKey && branch) {
    const branchDesign = BRANCH_DESIGN_MAP[mapKey]?.[branch];
    if (branchDesign) return branchDesign;
  }

  return getDesignBySubtopic(subtopico);
}

export function getLayoutVariantForBranch(
  subtopico: string | undefined,
  slideType: string,
  branch?: PedagogicalBranchId,
): string | undefined {
  const design = getPresentationDesign(subtopico, branch);
  if (!design) return undefined;
  switch (slideType) {
    case 'concept_map':
      return design.conceptMap;
    case 'golden_rule':
      return design.goldenRule;
    case 'logic_flow':
      return design.logicFlow;
    case 'danger_zone':
      return design.dangerZone;
    default:
      return undefined;
  }
}
