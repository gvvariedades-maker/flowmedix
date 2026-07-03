/**
 * Catálogo ramo/cluster → decisão L3 (molde existente, genérico, ramo novo, molde inédito).
 * @see docs/MOLD_AFFINITY_RESOLVER.md · artifacts/l3-mold-gap-audit.json
 */
import type { SubtopicDesign } from '@/components/slides/core/themeGenerator';
import type { PedagogicalBranchId } from '@/lib/slides/pedagogicalBranch';
import { isBespokeLayoutVariant } from '@/lib/slides/moldAffinity';

export type L3MoldGapDecision = 'ok_existente' | 'ok_generico' | 'ramo_novo' | 'molde_inedito';

export type ClusterIdealSpec = {
  branch_id: string;
  branch_implemented: boolean;
  current_mold_package: string;
  ideal_mold_package: string;
  decision: L3MoldGapDecision;
  rationale: string;
};

type ClusterRule = {
  pattern: RegExp;
  branch_id: string;
  branch_implemented: boolean;
  ideal_mold_package: string;
  base_decision: L3MoldGapDecision;
  rationale: string;
  /** Se true, volume alto pode elevar ok_generico → molde_inedito */
  inedito_if_volume?: boolean;
};

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Rótulo legível do pacote L3 (4 slides). */
export function formatMoldPackage(design?: SubtopicDesign): string {
  if (!design) return '—';
  const parts = [design.conceptMap, design.goldenRule, design.logicFlow, design.dangerZone].filter(
    Boolean,
  );
  const bespoke = parts.some((p) => isBespokeLayoutVariant(p ?? ''));
  return `${parts.join(' · ')}${bespoke ? ' (bespoke)' : ' (genérico)'}`;
}

export function packageUsesBespoke(design?: SubtopicDesign): boolean {
  if (!design) return false;
  return [design.conceptMap, design.goldenRule, design.logicFlow, design.dangerZone].some((p) =>
    isBespokeLayoutVariant(p ?? ''),
  );
}

const ADOLESCENT_ETHICS = 'adolescent-privacy-curtain · adolescent-sigilo-spectrum · adolescent-vf-weave-tap · adolescent-consent-gate (bespoke)';
const ADOLESCENT_GENERIC = 'morphological · reference_table · vertical · compare (genérico)';
const SP_GENERIC = 'morphological · reference_table · vertical · compare (genérico)';
const PERI_GENERIC = 'morphological · reference_table · vertical · compare (genérico)';

const RULES_BY_SUBTOPIC: Record<string, ClusterRule[]> = {
  'saude do adolescente': [
    {
      pattern: /viol[eê]ncia sexual|indicadores.*viol/i,
      branch_id: 'adolescente_violencia_protecao',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_GENERIC,
      base_decision: 'ok_generico',
      rationale:
        'Violência/rede de proteção — layouts genéricos (sem moldes adolescent-* de sigilo em consulta).',
    },
    {
      pattern: /gravidez|pr[eé][\s-]?natal|riscos gestacion/i,
      branch_id: 'adolescente_etica_sigilo',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_ETHICS,
      base_decision: 'ok_existente',
      rationale: 'Gravidez na adolescência — moldes adolescent-* já desenhados para sigilo/escuta.',
    },
    {
      pattern: /escuta|sigilo|[eé]tica/i,
      branch_id: 'adolescente_etica_sigilo',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_ETHICS,
      base_decision: 'ok_existente',
      rationale: 'V/F e ética do cuidado — pacote adolescent-*.',
    },
    {
      pattern: /transtorno alimentar|imagem corporal|anorexia|bulimia/i,
      branch_id: 'adolescente_saude_mental',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Saúde mental alimentar — compare + tabela bastam.',
    },
    {
      pattern: /diretrizes|exceto|ms adolescente/i,
      branch_id: 'adolescente_generico',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'EXCETO/diretrizes — layout genérico premium.',
    },
    {
      pattern: /sa[uú]de bucal|promo[cç][aã]o/i,
      branch_id: 'adolescente_generico',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Promoção/bucal — sem metáfora espacial fixa.',
    },
  ],
  cme: [
    {
      pattern: /autoclave|m[eé]todos de esteriliza/i,
      branch_id: 'cme_autoclave_metodos',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico) — ou pacote inédito parâmetros/ciclo',
      base_decision: 'ok_generico',
      inedito_if_volume: true,
      rationale: 'Parâmetros de ciclo — tabela pode bastar; molde inédito só se interação espacial repetir em provas.',
    },
    {
      pattern: /preparo|limpeza|pr[eé][\s-]?secagem/i,
      branch_id: 'cme_preparo_limpeza',
      branch_implemented: true,
      ideal_mold_package: 'bridge · minimal · cards · list (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Preparo/limpeza — conceito sequencial sem molde bespoke obrigatório.',
    },
    {
      pattern: /processamento|conceito/i,
      branch_id: 'cme_processamento_conceito',
      branch_implemented: true,
      ideal_mold_package: 'bridge · minimal · cards · list (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Conceito CME — genérico.',
    },
    {
      pattern: /certo ou errado|verdadeira.*falsa/i,
      branch_id: 'cme_vf_ce',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'V/F e C/E — compare + tap.',
    },
    {
      pattern: /incorreta|exceto/i,
      branch_id: 'cme_generico',
      branch_implemented: true,
      ideal_mold_package: 'bridge · minimal · cards · list (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Absorver em genérico compare.',
    },
    {
      pattern: /indicador|qu[ií]mico|biol[oó]gico/i,
      branch_id: 'cme_autoclave_metodos',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Cauda longa — tabela de referência.',
    },
  ],
  'saude mental': [
    {
      pattern: /raps|reforma|srt/i,
      branch_id: 'mental_raps_legis',
      branch_implemented: true,
      ideal_mold_package: 'bridge · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Legislação/RAPS — tabela + compare.',
    },
    {
      pattern: /crise|agita[cç][aã]o|conten[cç][aã]o|caps/i,
      branch_id: 'mental_crise_caps',
      branch_implemented: true,
      ideal_mold_package: 'morphological · center · sae-decision-tap · norm-reveal (bespoke parcial)',
      base_decision: 'ok_existente',
      rationale: 'Crise/CAPS — moldes SAE já wired.',
    },
    {
      pattern: /tabagismo|pnct|depend[eê]ncia|redu[cç][aã]o de danos|álcool/i,
      branch_id: 'mental_dependencia_tabagismo',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Dependência/tabagismo — genérico.',
    },
    {
      pattern: /depress[aã]o|epidemiologia|humor/i,
      branch_id: 'mental_depressao',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Depressão/epidemiologia — genérico.',
    },
    {
      pattern: /esquizofrenia|psicof[aá]rmaco|psicose/i,
      branch_id: 'mental_generico',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Psicofármacos — genérico.',
    },
    {
      pattern: /aps|acolhimento|biopsicossocial/i,
      branch_id: 'mental_aps_acolhimento',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'APS/acolhimento — genérico.',
    },
  ],
  perioperatoria: [
    {
      pattern: /pr[eé][\s-]?operat|preparo/i,
      branch_id: 'perioperatorio_pre_operatorio',
      branch_implemented: true,
      ideal_mold_package: PERI_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Pré-op — reference_table + compare bastam (âncora AVANÇASP).',
    },
    {
      pattern: /p[oó]s[\s-]?operat|srpa|aldrete/i,
      branch_id: 'perioperatorio_pos_operatorio',
      branch_implemented: true,
      ideal_mold_package: PERI_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Pós-op/SRPA — rows Aldrete + compare; sem molde espacial no volume atual.',
    },
    {
      pattern: /protocolo|sequ[eê]ncia|cirurgia segura/i,
      branch_id: 'perioperatorio_protocolo',
      branch_implemented: true,
      ideal_mold_package: PERI_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Protocolo/CDC — tabela + tap; checklist WHO não exige UI bespoke.',
    },
    {
      pattern: /certo ou errado/i,
      branch_id: 'perioperatorio_vf',
      branch_implemented: true,
      ideal_mold_package: PERI_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'V/F Cebraspe — pacote genérico premium.',
    },
    {
      pattern: /isc|classifica[cç][aã]o.*ferida/i,
      branch_id: 'perioperatorio_isc',
      branch_implemented: true,
      ideal_mold_package: PERI_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'ISC/CDC ferida — reference_table (âncora FURB/COGEPS).',
    },
  ],
  sondas: [
    {
      pattern: /medi[cç][aã]o|nex|comprimento/i,
      branch_id: 'sonda_medicao_nex',
      branch_implemented: true,
      ideal_mold_package: 'procedure-protocol · sonda-measurement-board · sonda-decision-tap · trap-reveal (bespoke)',
      base_decision: 'ok_existente',
      rationale: 'Medição NEX — bespoke sondas já existe.',
    },
    {
      pattern: /instala[cç][aã]o|nasog[aá]strica|fixa[cç][aã]o/i,
      branch_id: 'sonda_instalacao_protocolo',
      branch_implemented: true,
      ideal_mold_package: 'procedure-protocol · sonda-measurement-board · sonda-decision-tap · trap-reveal (bespoke)',
      base_decision: 'ok_existente',
      rationale: 'Instalação — pacote sondas.',
    },
  ],
  imunizacao: [
    {
      pattern: /\b(i|ii|iii)\s*[-–—]|intervalo|refor[cç]o/i,
      branch_id: 'imunizacao_vf_intervalos',
      branch_implemented: true,
      ideal_mold_package: 'pni-rules-deck · pni-interval-matrix · pni-vf-juggle-tap · pni-trap-chips (bespoke)',
      base_decision: 'ok_existente',
      rationale: 'VF de intervalos PNI — pacote pni-*.',
    },
    {
      pattern: /cadeia de frio|conserva[cç][aã]o|refriger|congel|termo|si-pni|gelox|caixa t[eé]rmica/i,
      branch_id: 'imunizacao_cadeia_frio',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Cadeia de frio / SI-PNI — tabela de conservação.',
    },
    {
      pattern: /calend[aá]rio|esquema|idade.*dose|bcg|penta/i,
      branch_id: 'imunizacao_calendario',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Calendário/esquema — tabela de intervalos.',
    },
  ],
  'vias de administracao': [
    {
      pattern: /\b(i|ii|iii)\s*[-–—]|absor[cç][aã]o|biodisponibilidade/i,
      branch_id: 'via_vf_absorcao',
      branch_implemented: true,
      ideal_mold_package: 'absorption-speed-rail · via-reference-board · via-vf-juggle-tap · route-trap (bespoke)',
      base_decision: 'ok_existente',
      rationale: 'VF absorção/velocidade — trilho vias.',
    },
    {
      pattern: /t[eé]cnica|ângulo|m[uú]sculo|pun[cç][aã]o|administra[cç][aã]o/i,
      branch_id: 'via_tecnica_admin',
      branch_implemented: true,
      ideal_mold_package: 'morphological · banner · cards · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Técnica de aplicação — genérico.',
    },
  ],
  calculo: [
    {
      pattern: /calcul|gota|ml\b|mg\b|equival[eê]ncia|regra de tr[eê]s/i,
      branch_id: 'calc_dose_equivalencia',
      branch_implemented: true,
      ideal_mold_package: 'dose-equivalence-rail · soft-lens-board · dose-calc-tap · dose-trap (bespoke)',
      base_decision: 'ok_existente',
      rationale: 'Cálculo numérico — trilho dose.',
    },
    {
      pattern: /conceito|defini[cç][aã]o/i,
      branch_id: 'calc_conceito',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · horizontal · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Conceito sem conta — genérico.',
    },
  ],
  respiratorio: [
    {
      pattern: /\b(i|ii|iii)\s*[-–—]|semiologia respirat/i,
      branch_id: 'respiratorio_vf_asma_dpoc',
      branch_implemented: true,
      ideal_mold_package:
        'respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-reference-board · respiratorio-vf-juggle-tap · respiratorio-spo2-trap-arena (bespoke)',
      base_decision: 'ok_existente',
      rationale: 'VF asma/DPOC — pacote respiratorio-*.',
    },
    {
      pattern: /spo2|o2 titulad|88.?92|dpoc|venturi/i,
      branch_id: 'respiratorio_dpoc_oxigenio',
      branch_implemented: true,
      ideal_mold_package:
        'respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-reference-board · cards · respiratorio-spo2-trap-arena (bespoke)',
      base_decision: 'ok_existente',
      rationale: 'O₂ titulado / SpO₂ alvo — golden spo2-reference-board + trap.',
    },
    {
      pattern: /\bexceto\b|crise asm[aá]tica|broncoespasmo/i,
      branch_id: 'respiratorio_asma_crise',
      branch_implemented: true,
      ideal_mold_package: 'morphological · banner · cards · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Crise asmática / EXCETO — compare sem duel-deck.',
    },
    {
      pattern: /espacador|inalador|mdi|peak flow|pico de fluxo/i,
      branch_id: 'respiratorio_tecnica_inalador',
      branch_implemented: true,
      ideal_mold_package: 'morphological · reference_table · cards · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Técnica MDI/espaçador — tabela de referência.',
    },
  ],
  'seguranca do paciente': [
    {
      pattern: /identificac|dois identificador|pulseira/i,
      branch_id: 'sp_identificacao',
      branch_implemented: true,
      ideal_mold_package: SP_GENERIC,
      base_decision: 'ok_existente',
      rationale: 'Identificação segura — golden CESGRANRIO + reference_table + compare.',
    },
    {
      pattern: /queda|morse|grades da cama/i,
      branch_id: 'sp_prevencao_quedas',
      branch_implemented: true,
      ideal_mold_package: SP_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Prevenção de quedas — escala/protocolo; compare + rows bastam.',
    },
    {
      pattern: /evento adverso|incidente|pnsp|portaria.*529|near miss/i,
      branch_id: 'sp_eventos_adversos',
      branch_implemented: true,
      ideal_mold_package: SP_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'PNSP / 4 grupos de incidente — compare + tabela de definições.',
    },
    {
      pattern: /metas internacionais|jci|joint commission/i,
      branch_id: 'sp_metas_internacionais',
      branch_implemented: true,
      ideal_mold_package: SP_GENERIC,
      base_decision: 'ok_generico',
      rationale: '6 metas JCI/OMS — reference_table rows + tap no logic_flow.',
    },
    {
      pattern: /v\/f|assertivas|certo ou errado/i,
      branch_id: 'sp_generico',
      branch_implemented: true,
      ideal_mold_package: SP_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'V/F e C/E — compare + tap genérico.',
    },
    {
      pattern: /incorreta|exceto/i,
      branch_id: 'sp_generico',
      branch_implemented: true,
      ideal_mold_package: SP_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'EXCETO — danger_zone compare sem molde bespoke.',
    },
    {
      pattern: /drift|reclassificar/i,
      branch_id: 'sp_generico',
      branch_implemented: true,
      ideal_mold_package: SP_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Drift taxonômico — reclassificar antes de handcraft; layout genérico interim.',
    },
  ],
};

function subtopicKey(subtopico: string): string | undefined {
  const key = normalizeKey(subtopico);
  if (key.includes('adolescente')) return 'saude do adolescente';
  if (key.includes('central de material') || key === 'cme' || key.includes('esterilizacao'))
    return 'cme';
  if (key.includes('saude mental') || key.includes('psiquiatria')) return 'saude mental';
  if (key.includes('perioperator') || key.includes('srpa')) return 'perioperatoria';
  if (key.includes('sonda')) return 'sondas';
  if (key.includes('imunizacao') || key.includes('vacinacao')) return 'imunizacao';
  if (key.includes('vias de administracao')) return 'vias de administracao';
  if (key.includes('calculo') || key.includes('dosagens')) return 'calculo';
  if (key.includes('farmacodinamica') || key.includes('farmacocinetica')) return 'farmacologia';
  if (key.includes('respiratorias cronicas') || key.includes('asma') || key === 'dpoc')
    return 'respiratorio';
  if (key.includes('seguranca do paciente')) return 'seguranca do paciente';
  return undefined;
}

const VOLUME_MIN_COUNT = 5;
const VOLUME_MIN_PCT = 10;

function finalizeDecision(
  rule: ClusterRule,
  count: number,
  pct: number,
): L3MoldGapDecision {
  if (!rule.branch_implemented) {
    if (rule.base_decision === 'molde_inedito' || rule.inedito_if_volume) {
      if (count >= VOLUME_MIN_COUNT || pct >= VOLUME_MIN_PCT) {
        return rule.inedito_if_volume && rule.base_decision !== 'molde_inedito'
          ? 'molde_inedito'
          : rule.base_decision === 'molde_inedito'
            ? 'molde_inedito'
            : 'ramo_novo';
      }
      return 'ramo_novo';
    }
    return 'ramo_novo';
  }

  if (
    rule.inedito_if_volume &&
    rule.base_decision === 'ok_generico' &&
    (count >= VOLUME_MIN_COUNT || pct >= VOLUME_MIN_PCT)
  ) {
    return 'molde_inedito';
  }

  return rule.base_decision;
}

export function resolveClusterIdeal(
  subtopico: string,
  clusterLabel: string,
  count: number,
  pct: number,
  currentMoldPackage = '—',
): ClusterIdealSpec {
  const topicKey = subtopicKey(subtopico);
  const rules = topicKey ? RULES_BY_SUBTOPIC[topicKey] : undefined;
  const label = normalizeKey(clusterLabel);

  if (rules) {
    for (const rule of rules) {
      if (rule.pattern.test(label)) {
        const decision = finalizeDecision(rule, count, pct);
        return {
          branch_id: rule.branch_id,
          branch_implemented: rule.branch_implemented,
          current_mold_package: currentMoldPackage,
          ideal_mold_package: rule.ideal_mold_package,
          decision,
          rationale: rule.rationale,
        };
      }
    }
  }

  const genericFallback: ClusterIdealSpec = {
    branch_id: 'generico',
    branch_implemented: false,
    current_mold_package: currentMoldPackage,
    ideal_mold_package: 'morphological · reference_table · vertical · compare (genérico)',
    decision: count >= VOLUME_MIN_COUNT || pct >= VOLUME_MIN_PCT ? 'ramo_novo' : 'ok_generico',
    rationale: 'Sem regra no catálogo — genérico ou ramo novo se volume alto.',
  };
  return genericFallback;
}

export function implementedBranchIds(): PedagogicalBranchId[] {
  return [
    'adolescente_etica_sigilo',
    'adolescente_antropometria',
    'adolescente_desenvolvimento',
    'adolescente_saude_mental',
    'adolescente_generico',
    'cme_preparo_limpeza',
    'cme_autoclave_metodos',
    'cme_processamento_conceito',
    'cme_vf_ce',
    'cme_generico',
    'mental_raps_legis',
    'mental_dependencia_tabagismo',
    'mental_crise_caps',
    'mental_depressao',
    'mental_aps_acolhimento',
    'mental_generico',
    'sonda_instalacao_protocolo',
    'sonda_medicao_nex',
    'sonda_generico',
    'farmaco_pk_pd_vf',
    'farmaco_clinico_protocolo',
    'farmaco_generico',
    'imunizacao_vf_intervalos',
    'imunizacao_calendario',
    'imunizacao_cadeia_frio',
    'imunizacao_exceto',
    'imunizacao_generico',
    'via_vf_absorcao',
    'via_tecnica_admin',
    'via_generico',
    'calc_dose_equivalencia',
    'calc_conceito',
    'calc_generico',
    'respiratorio_vf_asma_dpoc',
    'respiratorio_dpoc_oxigenio',
    'respiratorio_asma_crise',
    'respiratorio_tecnica_inalador',
    'respiratorio_generico',
    'sp_identificacao',
    'sp_prevencao_quedas',
    'sp_eventos_adversos',
    'sp_metas_internacionais',
    'sp_generico',
    'perioperatorio_pre_operatorio',
    'perioperatorio_pos_operatorio',
    'perioperatorio_protocolo',
    'perioperatorio_vf',
    'perioperatorio_isc',
    'perioperatorio_generico',
  ];
}
