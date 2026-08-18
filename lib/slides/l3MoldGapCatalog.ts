/**
 * Catálogo ramo/cluster → decisão L3 (molde existente, genérico, ramo novo, molde inédito).
 * @see docs/MOLD_AFFINITY_RESOLVER.md · artifacts/l3-mold-gap-audit.json
 */
import type { SubtopicDesign } from '@/components/slides/core/themeGenerator';
import type { PedagogicalBranchId } from '@/lib/slides/pedagogicalBranch';
import { isBespokeLayoutVariant } from '@/lib/slides/moldAffinity';

export type L3MoldGapDecision =
  | 'ok_existente'
  | 'ok_generico'
  | 'ramo_novo'
  | 'molde_inedito'
  | 'molde_redesign';

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

const ADOLESCENT_ETHICS = 'adolescent-care-pillars-deck · adolescent-speak-barrier-board · adolescent-exceto-isolate-board · adolescent-exceto-compare (bespoke v2)';
const HISTORIA_BRIDGE = 'bridge · reference_table · vertical · compare (genérico premium)';
const HISTORIA_GENERIC = 'morphological · reference_table · vertical · compare (genérico premium)';
const SP_GENERIC = 'morphological · reference_table · vertical · compare (genérico)';
const SP_IDENTIFICACAO_BESPOKE =
  'sp-id-verify-deck · sp-nsp-reference-board · sp-vf-juggle-tap · sp-safety-trap-arena (bespoke)';
const SP_QUEDAS_BESPOKE =
  'sp-fall-risk-rail · sp-nsp-reference-board · sp-protocol-tap-flow · sp-safety-trap-arena (bespoke)';
const SP_EVENTOS_BESPOKE =
  'sp-incident-taxonomy-deck · sp-nsp-reference-board · sp-protocol-tap-flow · sp-safety-trap-arena (bespoke)';
const PERI_GENERIC = 'morphological · reference_table · vertical · compare (genérico)';

const SAE_BESPOKE_PKG =
  'sae-responsibility-matrix · sae-reference-board · sae-decision-tap · norm-reveal (bespoke)';
const SAE_DOC_BESPOKE_PKG =
  'sae-documentation · sae-reference-board · sae-decision-tap · norm-reveal (bespoke)';
const URGENCIAS_LEGACY =
  'survival-chain · center · vertical · trap-reveal (legado subtópico — redesign obrigatório)';
const URGENCIAS_GENERIC = 'morphological · reference_table · vertical · compare (genérico)';
const URGENCIAS_RCP_BESPOKE =
  'urgencias-survival-chain-deck · urgencias-rcp-params-board · urgencias-rcp-tap-flow · urgencias-rcp-trap-arena (bespoke)';
const URGENCIAS_XABCDE_BESPOKE =
  'urgencias-xabcde-rail · urgencias-trauma-reference-board · urgencias-xabcde-tap-flow · urgencias-trauma-trap-arena (bespoke)';
const URGENCIAS_AVC_BESPOKE =
  'urgencias-stroke-signs-deck · urgencias-cincinnati-board · urgencias-stroke-elimination-tap · urgencias-stroke-trap-arena (bespoke)';
const URGENCIAS_CHOQUE_BESPOKE =
  'urgencias-shock-types-deck · urgencias-shock-reference-board · urgencias-shock-tap-flow · urgencias-shock-trap-arena (bespoke)';
const URGENCIAS_ENGASGO_BESPOKE =
  'urgencias-choking-signal-deck · urgencias-heimlich-board · urgencias-choking-tap-flow · urgencias-choking-trap-arena (bespoke)';
const URGENCIAS_PEDIATRIC_BESPOKE =
  'urgencias-pediatric-rcp-deck · urgencias-pediatric-params-board · urgencias-pediatric-tap-flow · urgencias-pediatric-trap-arena (bespoke)';
const URGENCIAS_MANCHESTER_BESPOKE =
  'urgencias-manchester-spectrum · urgencias-manchester-board · cards · urgencias-manchester-trap (bespoke)';
const URGENCIAS_EXCETO_BESPOKE =
  'urgencias-exceto-rail · urgencias-exceto-reference-board · urgencias-exceto-tap-flow · urgencias-exceto-trap-arena (bespoke)';
const URGENCIAS_PROTOCOL_BESPOKE =
  'urgencias-protocol-rules-deck · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)';
const URGENCIAS_EMERGENCY_GENERIC_BESPOKE =
  'urgencias-emergency-hub · urgencias-protocol-reference-board · urgencias-protocol-tap-flow · urgencias-protocol-trap-arena (bespoke)';
const MULHER_GENERIC = 'morphological · reference_table · vertical · compare (genérico)';
const MULHER_PRENATAL_BESPOKE =
  'mulher-gestation-timeline · mulher-prenatal-board · mulher-prenatal-tap-flow · mulher-prenatal-trap-arena (bespoke)';
const MULHER_PARTO_BESPOKE =
  'mulher-labor-phase-deck · mulher-parto-humanizado-board · mulher-labor-tap-flow · mulher-parto-trap-arena (bespoke)';
const MULHER_PAPANICOLAU_BESPOKE =
  'mulher-screening-spectrum · mulher-papanicolau-board · mulher-screening-tap-flow · mulher-screening-trap-arena (bespoke)';
const MULHER_MAMA_BESPOKE =
  'mulher-mammography-spectrum · mulher-mama-board · mulher-mama-tap-flow · mulher-mama-trap-arena (bespoke)';
const MULHER_PUERPERIO_BESPOKE =
  'mulher-puerperio-timeline · mulher-puerperio-board · mulher-puerperio-tap-flow · mulher-puerperio-trap-arena (bespoke)';
const MULHER_PLANEJAMENTO_BESPOKE =
  'mulher-contraception-spectrum · mulher-planejamento-board · mulher-planejamento-tap-flow · mulher-planejamento-trap-arena (bespoke)';

const ADOLESCENT_ANTHROPOMETRY_BESPOKE =
  'adolescent-growth-z-rail · adolescent-z-band-board · adolescent-z-classify-tap · adolescent-z-threshold-trap (bespoke)';

const ADOLESCENT_VIOLENCE_BESPOKE =
  'adolescent-violence-deck · reference_table · adolescent-violence-timeline · adolescent-violence-calendar (bespoke CM+LF+DZ)';

const ADOLESCENT_MENTAL_BESPOKE =
  'adolescent-mental-route-list · adolescent-mental-protocol-rail · adolescent-mental-hub-board · adolescent-mental-step-trap (bespoke 0-tap)';

const ADOLESCENT_DEV_BESPOKE =
  'adolescent-dev-pair-rail · adolescent-dev-objective-flow · adolescent-dev-vigilance-board · adolescent-dev-budget-checklist (bespoke 0-tap)';

const ADOLESCENT_GENERIC_BESPOKE =
  'adolescent-generic-hub-orbit · adolescent-generic-care-levels · adolescent-generic-finance-checklist · adolescent-generic-versus-blocks (bespoke 0-tap)';

const COLETA_GENERIC =
  'morphological · reference_table · vertical · compare (genérico teal — COLETA_GENERIC_DESIGN)';

const RULES_BY_SUBTOPIC: Record<string, ClusterRule[]> = {
  'saude do adolescente': [
    {
      pattern: /escore\s*z|score\s*z|caderneta\s+do\s+adolescente|classifica[cç][aã]o\s+nutricional.*z/i,
      branch_id: 'adolescente_antropometria',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_ANTHROPOMETRY_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Escore Z / Caderneta — trilho de faixas antropométricas (brief l3 antropometria).',
    },
    {
      pattern: /viol[eê]ncia sexual|indicadores.*viol|rede de prote[cç][aã]o|notifica[cç][aã]o compuls/i,
      branch_id: 'adolescente_violencia_protecao',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_VIOLENCE_BESPOKE,
      base_decision: 'molde_inedito',
      rationale:
        'Violência/rede de proteção — calendário (CM) + timeline estática ELIMINA×MANTÉM (LF); GR/DZ genéricos.',
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
      pattern: /transtorno alimentar|imagem corporal|anorexia|bulimia|depress[aã]o|ansiedade/i,
      branch_id: 'adolescente_saude_mental',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_MENTAL_BESPOKE,
      base_decision: 'molde_inedito',
      rationale:
        'Saúde mental — Vias (CM) + XABCDE (LF) + Hub (GR) + Regra de Três (DZ); todos estáticos.',
    },
    {
      pattern: /puberdade|tanner|menarca|espermarquia|desenvolvimento puberal|metamorfose f[ií]sica/i,
      branch_id: 'adolescente_desenvolvimento',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_DEV_BESPOKE,
      base_decision: 'molde_inedito',
      rationale:
        'Desenvolvimento/puberdade — pares SUS (CM) + objetivos (LF) + vigilância (GR) + checklist (DZ); 0 taps.',
    },
    {
      pattern: /diretrizes|exceto|ms adolescente/i,
      branch_id: 'adolescente_generico',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_GENERIC_BESPOKE,
      base_decision: 'molde_inedito',
      rationale:
        'EXCETO/diretrizes — hub CF + níveis + checklist financiamento + versus COFEN; 0 taps.',
    },
    {
      pattern: /sa[uú]de bucal|promo[cç][aã]o/i,
      branch_id: 'adolescente_generico',
      branch_implemented: true,
      ideal_mold_package: ADOLESCENT_GENERIC_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Promoção/bucal — mesmo pacote genérico bespoke 0-tap.',
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
  'processo de enfermagem': [
    {
      pattern: /documenta[cç][aã]o|anota[cç][aã]o|prontu[aá]rio|registro|soapi/i,
      branch_id: 'sae_documentacao',
      branch_implemented: true,
      ideal_mold_package: SAE_DOC_BESPOKE_PKG,
      base_decision: 'molde_redesign',
      rationale: 'Documentação/anotação — pacote sae-documentation 4/4.',
    },
    {
      pattern: /etapa|coleta|planejamento|implementa[cç][aã]o|avalia[cç][aã]o|nanda|diagn[oó]stico/i,
      branch_id: 'sae_etapas',
      branch_implemented: true,
      ideal_mold_package: SAE_BESPOKE_PKG,
      base_decision: 'molde_redesign',
      rationale: 'Etapas SAE / NANDA-NIC-NOC — matriz de responsabilidades.',
    },
    {
      pattern: /exceto|incorret[oa]/i,
      branch_id: 'sae_exceto',
      branch_implemented: true,
      ideal_mold_package: SAE_BESPOKE_PKG,
      base_decision: 'molde_redesign',
      rationale: 'EXCETO conduta SAE — norm-reveal.',
    },
    {
      pattern: /.*/,
      branch_id: 'sae_generico',
      branch_implemented: true,
      ideal_mold_package: SAE_BESPOKE_PKG,
      base_decision: 'molde_redesign',
      rationale: 'Cauda SAE — pacote violet bespoke.',
    },
  ],
  'saude mental': [
    {
      pattern: /raps|reforma|srt/i,
      branch_id: 'mental_raps_legis',
      branch_implemented: true,
      ideal_mold_package:
        'mental-raps-network-rail · mental-raps-tier-board · mental-raps-classify-tap · mental-raps-trap-arena',
      base_decision: 'molde_inedito',
      rationale: 'RAPS/legis — pacote violet bespoke 4/4 (rede × componente).',
    },
    {
      pattern: /crise|agita[cç][aã]o|conten[cç][aã]o|caps/i,
      branch_id: 'mental_crise_caps',
      branch_implemented: true,
      ideal_mold_package:
        'mental-crisis-signal-deck · mental-crisis-ladder-board · mental-crisis-decision-tap · mental-crisis-coercion-trap',
      base_decision: 'molde_redesign',
      rationale: 'Crise/CAPS — molde_redesign (não ok_existente SAE).',
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
      ideal_mold_package:
        'peri-preop-phase-deck · peri-preop-prep-board · peri-preop-decision-tap · peri-preop-trap-arena',
      base_decision: 'molde_inedito',
      rationale: 'Pré-op — trilho fases × preparo (jejum/tricotomia); âncora AVANÇASP.',
    },
    {
      pattern: /p[oó]s[\s-]?operat|srpa|aldrete/i,
      branch_id: 'perioperatorio_pos_operatorio',
      branch_implemented: true,
      ideal_mold_package:
        'peri-srpa-monitor-deck · peri-aldrete-board · peri-srpa-decision-tap · peri-srpa-trap-arena',
      base_decision: 'molde_inedito',
      rationale: 'Pós-op/SRPA — monitorização × Aldrete × EXCETO; âncoras IDECAN/Fundatec.',
    },
    {
      pattern: /protocolo|sequ[eê]ncia|cirurgia segura/i,
      branch_id: 'perioperatorio_protocolo',
      branch_implemented: true,
      ideal_mold_package:
        'peri-protocol-checklist-deck · peri-protocol-reference-board · peri-protocol-tap-flow · peri-protocol-trap-arena',
      base_decision: 'molde_inedito',
      rationale: 'Protocolo/WHO/CDC — checklist espacial × tap; âncora COGEPS.',
    },
    {
      pattern: /certo ou errado/i,
      branch_id: 'perioperatorio_vf',
      branch_implemented: true,
      ideal_mold_package:
        'peri-vf-assertions-deck · peri-vf-reference-board · peri-vf-juggle-tap · peri-vf-trap-chips',
      base_decision: 'molde_inedito',
      rationale: 'V/F Cebraspe I–III — juggle tap violet bespoke.',
    },
    {
      pattern: /isc|classifica[cç][aã]o.*ferida/i,
      branch_id: 'perioperatorio_isc',
      branch_implemented: true,
      ideal_mold_package: PERI_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'ISC/CDC ferida — cauda longa (2 slugs); reference_table (âncora FURB).',
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
      base_decision: 'molde_redesign',
      rationale: 'VF de intervalos PNI — pacote pni-* wired.',
    },
    {
      pattern: /cadeia de frio|conserva[cç][aã]o|refriger|congel|termo|si-pni|gelox|caixa t[eé]rmica/i,
      branch_id: 'imunizacao_cadeia_frio',
      branch_implemented: true,
      ideal_mold_package: 'cold-chain-hub · pni-temperature-rail · pni-cold-chain-tap · temperature-mismatch (bespoke)',
      base_decision: 'molde_redesign',
      rationale: 'Cadeia de frio / SI-PNI — pacote pni-temperature-rail wired.',
    },
    {
      pattern: /calend[aá]rio|esquema|idade.*dose|bcg|penta/i,
      branch_id: 'imunizacao_calendario',
      branch_implemented: true,
      ideal_mold_package: 'vaccine-timeline · pni-calendar-board · pni-calendar-elimination-tap · calendar-mismatch (bespoke)',
      base_decision: 'molde_redesign',
      rationale: 'Calendário/esquema — pacote pni-calendar wired; golden usa LabelBodyRow (Onda 3).',
    },
    {
      pattern: /\bexceto\b|incorret[oa]|alternativa\s+incorreta/i,
      branch_id: 'imunizacao_exceto',
      branch_implemented: true,
      ideal_mold_package:
        'pni-exceto-command-hub · pni-exceto-rule-board · pni-exceto-isolate-board · pni-exceto-compare',
      base_decision: 'molde_redesign',
      rationale:
        'EXCETO/INCORRETA PNI — hub INCORRETA+mito; NÃO ADIA; isolate-board + compare letras (Glance OS).',
    },
  ],
  'vias de administracao': [
    {
      pattern: /\b(i|ii|iii)\s*[-–—]|absor[cç][aã]o|biodisponibilidade/i,
      branch_id: 'via_vf_absorcao',
      branch_implemented: true,
      ideal_mold_package: 'absorption-speed-rail · via-reference-board · via-vf-juggle-tap · route-trap (bespoke)',
      base_decision: 'molde_redesign',
      rationale: 'VF absorção/velocidade — trilho bespoke implementado; brief l3-brief-vias-de-administracao-via_vf_absorcao.md.',
    },
    {
      pattern: /t[eé]cnica|ângulo|m[uú]sculo|pun[cç][aã]o|administra[cç][aã]o/i,
      branch_id: 'via_tecnica_admin',
      branch_implemented: true,
      ideal_mold_package: 'morphological · banner · cards · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Técnica punção IM/IV — genérico P1; brief bespoke opcional pós-g01.',
    },
    {
      pattern: /\bexceto\b|alternativa\s+incorreta|incorret[oa]\s+afirmar/i,
      branch_id: 'via_generico',
      branch_implemented: true,
      ideal_mold_package: 'morphological · center · vertical · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'EXCETO/INCORRETA e cauda — compare semântico; sem brief bespoke.',
    },
  ],
  'cuidados na administracao de medicamentos': [
    {
      pattern: /\b(i|ii|iii)\s*[-–—]|9 certos|nove certos|dois identificador|alto risco|dose certa/i,
      branch_id: 'cam_certos_vf_caso',
      branch_implemented: true,
      ideal_mold_package:
        'cam-certos-deck · cam-nine-rights-board · cam-vf-juggle-tap · cam-certos-trap-arena (bespoke)',
      base_decision: 'molde_redesign',
      rationale:
        'VF I–III sobre 9 Certos em caso clínico — trilho bespoke implementado; brief l3-brief-cuidados-na-administracao-de-medicamentos-cam_certos_vf_caso.md.',
    },
    {
      pattern: /alto risco|confer[eê]ncia dupla|insulina|nph|heparina|quimioter[aá]pico/i,
      branch_id: 'cam_alto_risco',
      branch_implemented: true,
      ideal_mold_package:
        'cam-high-risk-duo-deck · cam-high-risk-protocol-board · cam-alto-risco-elimination-tap · cam-high-risk-trap-arena (bespoke)',
      base_decision: 'molde_inedito',
      rationale:
        'Alto risco / conferência dupla / insulina — trilho bespoke implementado; brief l3-brief-cuidados-na-administracao-de-medicamentos-cam_alto_risco.md.',
    },
    {
      pattern: /\bexceto\b|incorret[oa]\s+afirmar|alternativa\s+incorreta|preparo de medicamento/i,
      branch_id: 'cam_exceto_conduta',
      branch_implemented: true,
      ideal_mold_package:
        'cam-exceto-rail · cam-exceto-reference-board · cam-exceto-tap-flow · cam-exceto-trap-arena (bespoke)',
      base_decision: 'molde_redesign',
      rationale:
        'EXCETO/INCORRETA preparo e conduta — pacote cam-exceto-* bespoke 4/4; gate cam_exceto_semantic.',
    },
    {
      pattern: /registro certo|documenta[cç][aã]o certa|prontu[aá]rio|anotar.*ap[oó]s administrar/i,
      branch_id: 'cam_documentacao',
      branch_implemented: true,
      ideal_mold_package:
        'cam-documentacao-deck · cam-documentacao-board · cam-documentacao-vf-tap · cam-documentacao-trap-arena (bespoke)',
      base_decision: 'molde_redesign',
      rationale: 'V/F Registro certo (Certo 6) — pacote documentação bespoke 4/4.',
    },
    {
      pattern: /administra[cç][aã]o de medicamentos|cuidados na administra[cç][aã]o/i,
      branch_id: 'cam_generico',
      branch_implemented: true,
      ideal_mold_package: 'bridge · center · cards · compare (genérico)',
      base_decision: 'ok_generico',
      rationale: 'Cauda longa (vigilância, protocolo MS) — compare semântico.',
    },
  ],
  calculo: [
    {
      pattern: /calcul|gota|ml\b|mg\b|equival[eê]ncia|regra de tr[eê]s/i,
      branch_id: 'calc_dose_equivalencia',
      branch_implemented: true,
      ideal_mold_package: 'dose-equivalence-rail · soft-lens-board · dose-calc-tap · dose-trap (bespoke)',
      base_decision: 'molde_redesign',
      rationale: 'Cálculo numérico — trilho dose (bespoke 4/4 implementado).',
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
      ideal_mold_package: SP_IDENTIFICACAO_BESPOKE,
      base_decision: 'molde_redesign',
      rationale: 'Identificação segura — deck 2 IDs + VF juggle NSP + trap arena (âncora IDECAN).',
    },
    {
      pattern: /queda|morse|grades da cama/i,
      branch_id: 'sp_prevencao_quedas',
      branch_implemented: true,
      ideal_mold_package: SP_QUEDAS_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Prevenção de quedas — trilho Morse + protocol tap + trap arena (âncora VUNESP).',
    },
    {
      pattern: /evento adverso|incidente|pnsp|portaria.*529|near miss/i,
      branch_id: 'sp_eventos_adversos',
      branch_implemented: true,
      ideal_mold_package: SP_EVENTOS_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'PNSP 4 grupos — taxonomy deck + protocol tap + trap arena (âncora FCM).',
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
  urgencias: [
    {
      pattern: /drift|reclassificar/i,
      branch_id: 'urgencias_generico',
      branch_implemented: false,
      ideal_mold_package: URGENCIAS_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Drift taxonômico — reclassificar subtópico antes de handcraft.',
    },
    {
      pattern: /rcp pediatrica|lactente/i,
      branch_id: 'urgencias_rcp_pediatrico',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_PEDIATRIC_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'RCP pediátrica 15:2 — separar visualmente do adulto 30:2 (âncora ACCESS).',
    },
    {
      pattern: /manchester|triagem de risco/i,
      branch_id: 'urgencias_manchester_triagem',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_MANCHESTER_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Espectro de cores Manchester — erro espacial (etiqueta vermelha × demais).',
    },
    {
      pattern: /exceto|incorreta/i,
      branch_id: 'urgencias_exceto_conduta',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_EXCETO_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'EXCETO conduta — rail semântico por letra (âncora ADM&TEC fratura exposta).',
    },
    {
      pattern: /xabcde|trauma e hemorragia/i,
      branch_id: 'urgencias_xabcde_trauma',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_XABCDE_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Trilho XABCDE pré-hospitalar — trauma ≠ cadeia RCP (âncoras AMEOSC/SELECON).',
    },
    {
      pattern: /avc|iam|reconhecimento/i,
      branch_id: 'urgencias_avc_iam',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_AVC_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Cincinnati Face·Arms·Speech — pegadinhas Glasgow/IAM/SSVV (âncora AMAUC).',
    },
    {
      pattern: /engasgo|obstrucao de via aerea/i,
      branch_id: 'urgencias_engasgo',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_ENGASGO_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Sinal universal × manobra Heimlich — metáfora espacial (âncora FAU).',
    },
    {
      pattern: /choque|hipoperfusao/i,
      branch_id: 'urgencias_choque',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_CHOQUE_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Tipos de choque + segurança da cena — matriz mecanismo × conduta.',
    },
    {
      pattern: /convulsao|crise epileptica/i,
      branch_id: 'urgencias_convulsao',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_PROTOCOL_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Crise epiléptica — protocol rules deck (âncora ADM&TEC).',
    },
    {
      pattern: /anafilaxia|epinefrina/i,
      branch_id: 'urgencias_anafilaxia',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_PROTOCOL_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Anafilaxia — epinefrina IM × IV (âncora CPCON).',
    },
    {
      pattern: /queimadura/i,
      branch_id: 'urgencias_queimadura',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_PROTOCOL_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Primeiro socorro queimadura — protocol trap (âncora AMEOSC V/F).',
    },
    {
      pattern: /rcp.*sbv|sbv adulto/i,
      branch_id: 'urgencias_rcp_sbv',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_RCP_BESPOKE,
      base_decision: 'molde_redesign',
      rationale:
        'Legado survival-chain no subtópico — brief urgencias_rcp_sbv aprovado; pacote urgencias-rcp-*.',
    },
    {
      pattern: /v\/f.*protocolo|protocolos i/i,
      branch_id: 'urgencias_vf_protocolo',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_PROTOCOL_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'V/F I–IV combinatório — protocol rules deck (brief L3).',
    },
    {
      pattern: /certo ou errado/i,
      branch_id: 'urgencias_generico',
      branch_implemented: false,
      ideal_mold_package: URGENCIAS_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'C/E disperso — handcraft com compare até clusterizar.',
    },
    {
      pattern: /conceito geral|default|sem ancora/i,
      branch_id: 'urgencias_generico',
      branch_implemented: true,
      ideal_mold_package: URGENCIAS_EMERGENCY_GENERIC_BESPOKE,
      base_decision: 'molde_inedito',
      rationale: 'Bucket residual — emergency hub + protocol pack.',
    },
  ],
  'saude da mulher': [
    {
      pattern: /drift|reclassificar|anatomia feminina|semiologia/i,
      branch_id: 'mulher_generico',
      branch_implemented: true,
      ideal_mold_package: MULHER_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Drift taxonômico (anatomia/semiologia) — reclassificar antes de handcraft; genérico interim.',
    },
    {
      pattern: /trabalho de parto|parto humanizado|fase expulsiva|dequita/i,
      branch_id: 'mulher_parto',
      branch_implemented: true,
      ideal_mold_package: MULHER_PARTO_BESPOKE,
      base_decision: 'ok_existente',
      rationale: 'Parto/trabalho de parto — pacote mulher-parto-* implementado; brief l3-brief-saude-da-mulher-mulher_parto.md.',
    },
    {
      pattern: /papanicolau|rastreio.*colo|c[aâ]ncer de colo|citologia onc/i,
      branch_id: 'mulher_papanicolau',
      branch_implemented: true,
      ideal_mold_package: MULHER_PAPANICOLAU_BESPOKE,
      base_decision: 'ok_existente',
      rationale: 'Rastreio câncer de colo — pacote mulher-screening-* implementado; brief l3-brief-saude-da-mulher-mulher_papanicolau.md.',
    },
    {
      pattern: /sa[uú]de da mama|mamografia|rastreio.*mama|c[aâ]ncer de mama/i,
      branch_id: 'mulher_mama',
      branch_implemented: true,
      ideal_mold_package: MULHER_MAMA_BESPOKE,
      base_decision: 'ok_existente',
      rationale: 'Saúde da mama — pacote mulher-mama-* implementado; brief l3-brief-saude-da-mulher-mulher_mama.md.',
    },
    {
      pattern: /pr[eé][\s-]?natal|gesta[cç][aã]o|gestante|ttgo|idade gestacional/i,
      branch_id: 'mulher_prenatal',
      branch_implemented: true,
      ideal_mold_package: MULHER_PRENATAL_BESPOKE,
      base_decision: 'ok_existente',
      rationale: 'Pré-natal/gestação — pacote mulher-prenatal-* implementado; âncora CPCON golden.',
    },
    {
      pattern: /puerp[eé]rio|lacta[cç][aã]o|aleitamento|amamenta/i,
      branch_id: 'mulher_puerperio',
      branch_implemented: true,
      ideal_mold_package: MULHER_PUERPERIO_BESPOKE,
      base_decision: 'ok_existente',
      rationale: 'Puerpério/lactação — pacote mulher-puerperio-* implementado; âncora MS consulta 42 dias.',
    },
    {
      pattern: /planejamento familiar|contracep|anticoncep/i,
      branch_id: 'mulher_planejamento',
      branch_implemented: true,
      ideal_mold_package: MULHER_PLANEJAMENTO_BESPOKE,
      base_decision: 'ok_existente',
      rationale: 'Planejamento familiar — pacote mulher-planejamento-* implementado; âncora CPCON VF.',
    },
    {
      pattern: /climat[eé]rio|menopausa/i,
      branch_id: 'mulher_generico',
      branch_implemented: true,
      ideal_mold_package: MULHER_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Climatério/menopausa — cauda longa; genérico.',
    },
    {
      pattern: /conceito geral|default/i,
      branch_id: 'mulher_generico',
      branch_implemented: true,
      ideal_mold_package: MULHER_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Bucket residual — morphological + compare até clusterizar.',
    },
  ],
  'historia da enfermagem': [
    {
      pattern: /nightingale|florence|crimeia|dama da l[aâ]mpada|12 de maio|pioneir|anna nery/i,
      branch_id: 'historia_nightingale',
      branch_implemented: true,
      ideal_mold_package: HISTORIA_BRIDGE,
      base_decision: 'ok_generico',
      rationale: 'Marcos históricos / cronologia — bridge conecta pilares temporais.',
    },
    {
      pattern: /pr[eé][\s-]?sus|sistema [uú]nico|1988|sa[uú]de p[uú]blica.*brasil|lei\s*7\.?498/i,
      branch_id: 'historia_nightingale',
      branch_implemented: true,
      ideal_mold_package: HISTORIA_BRIDGE,
      base_decision: 'ok_generico',
      rationale: 'Legislação e marcos brasileiros — tabela + bridge.',
    },
    {
      pattern: /humaniza[cç][aã]o|peplau|horta|watson|hol[ií]stic|interdisciplinar/i,
      branch_id: 'historia_humanizacao',
      branch_implemented: true,
      ideal_mold_package: HISTORIA_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Humanização e teorias do cuidado — morphological + compare.',
    },
    {
      pattern: /c[oó]digo de [eé]tica|cofen|coren|comunica[cç][aã]o profissional|ru[ií]do/i,
      branch_id: 'historia_comunicacao_etica',
      branch_implemented: true,
      ideal_mold_package: HISTORIA_BRIDGE,
      base_decision: 'ok_generico',
      rationale: 'Ética COFEN e comunicação — bridge COFEN×COREN×conduta.',
    },
    {
      pattern: /teoria.*administrativa|processo de enfermagem|lideran[cç]a/i,
      branch_id: 'historia_generico',
      branch_implemented: true,
      ideal_mold_package: HISTORIA_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Cauda longa — slug legado com tema adjacente.',
    },
  ],
  'coleta de exames laboratoriais': [
    {
      pattern: /urina|fezes|escarro|jato m[eé]dio|urocultura/i,
      branch_id: 'coleta_nao_sanguinea',
      branch_implemented: true,
      ideal_mold_package: COLETA_GENERIC,
      base_decision: 'molde_redesign',
      rationale: 'Coleta não sanguínea — jato médio / recipiente / preservação; genérico wired até molde bespoke.',
    },
    {
      pattern: /tubos?|\bedta\b|citrato|ordem de coleta|tampa/i,
      branch_id: 'coleta_tubos_ordem',
      branch_implemented: true,
      ideal_mold_package: COLETA_GENERIC,
      base_decision: 'molde_redesign',
      rationale: 'Ordem de tubos / aditivos / tampa — trilho sequencial; genérico wired até tubo-rail bespoke.',
    },
    {
      pattern: /pun[cç][aã]o venosa|garrote|hem[oó]lise|v[aá]cuo/i,
      branch_id: 'coleta_tecnica_venosa',
      branch_implemented: true,
      ideal_mold_package: COLETA_GENERIC,
      base_decision: 'molde_redesign',
      rationale: 'Técnica venosa / vácuo / hemólise — genérico wired até molde procedure-protocol.',
    },
    {
      pattern: /hemocultura/i,
      branch_id: 'coleta_hemocultura',
      branch_implemented: true,
      ideal_mold_package: COLETA_GENERIC,
      base_decision: 'molde_redesign',
      rationale: 'Hemocultura — assepsia máxima / volume / número de amostras; genérico wired.',
    },
    {
      pattern: /jejum|preparo|triglicer[ií]deos|lip[ií]dios/i,
      branch_id: 'coleta_jejum_preparo',
      branch_implemented: true,
      ideal_mold_package: COLETA_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Jejum / preparo — tabela de referência rows + tap no logic_flow.',
    },
    {
      pattern: /capilar|glicos[ií]metro|\bamgc\b|\bhgt\b/i,
      branch_id: 'coleta_capilar_glicemia',
      branch_implemented: true,
      ideal_mold_package: COLETA_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Glicemia capilar / AMGC — reference_table + compare genérico.',
    },
    {
      pattern: /conceito geral|default|coleta/i,
      branch_id: 'coleta_generico',
      branch_implemented: true,
      ideal_mold_package: COLETA_GENERIC,
      base_decision: 'ok_generico',
      rationale: 'Cauda longa — morphological + compare até clusterizar.',
    },
  ],
};

function subtopicKey(subtopico: string): string | undefined {
  const key = normalizeKey(subtopico);
  if (key.includes('adolescente')) return 'saude do adolescente';
  if (key.includes('historia da enfermagem') || key.includes('historia enfermagem')) {
    return 'historia da enfermagem';
  }
  if (key.includes('central de material') || key === 'cme' || key.includes('esterilizacao'))
    return 'cme';
  if (key.includes('saude mental') || key.includes('psiquiatria')) return 'saude mental';
  if (key.includes('processo de enfermagem') || key === 'sae') return 'processo de enfermagem';
  if (key.includes('perioperator') || key.includes('srpa')) return 'perioperatoria';
  if (key.includes('sonda')) return 'sondas';
  if (key.includes('imunizacao') || key.includes('vacinacao')) return 'imunizacao';
  if (key.includes('vias de administracao')) return 'vias de administracao';
  if (key.includes('cuidados na administracao de medicamentos')) {
    return 'cuidados na administracao de medicamentos';
  }
  if (key.includes('calculo') || key.includes('dosagens')) return 'calculo';
  if (key.includes('farmacodinamica') || key.includes('farmacocinetica')) return 'farmacologia';
  if (key.includes('respiratorias cronicas') || key.includes('asma') || key === 'dpoc')
    return 'respiratorio';
  if (key.includes('seguranca do paciente')) return 'seguranca do paciente';
  if (key.includes('saude da mulher')) return 'saude da mulher';
  if (key.includes('urgencias') || key.includes('emergencias')) return 'urgencias';
  if (key.includes('coleta de exames') || key.includes('exames laboratoriais')) {
    return 'coleta de exames laboratoriais';
  }
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
    if (rule.base_decision === 'ok_generico') {
      return 'ok_generico';
    }
    if (
      rule.base_decision === 'molde_redesign' &&
      (count >= VOLUME_MIN_COUNT || pct >= VOLUME_MIN_PCT)
    ) {
      return 'molde_redesign';
    }
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
    'adolescente_violencia_protecao',
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
    'urgencias_rcp_sbv',
    'urgencias_xabcde_trauma',
    'urgencias_avc_iam',
    'urgencias_choque',
    'urgencias_engasgo',
    'urgencias_rcp_pediatrico',
    'urgencias_manchester_triagem',
    'urgencias_exceto_conduta',
    'urgencias_vf_protocolo',
    'urgencias_convulsao',
    'urgencias_anafilaxia',
    'urgencias_queimadura',
    'urgencias_generico',
    'mulher_prenatal',
    'mulher_parto',
    'mulher_papanicolau',
    'mulher_mama',
    'mulher_puerperio',
    'mulher_planejamento',
    'mulher_generico',
    'historia_nightingale',
    'historia_humanizacao',
    'historia_comunicacao_etica',
    'historia_generico',
  ];
}
