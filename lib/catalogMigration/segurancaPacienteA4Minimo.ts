/**
 * Protocolo A4-mínimo — Segurança do Paciente (onda paridade Adolescente + L3 bespoke).
 * Risco clínico médio: identificação, quedas, eventos adversos, metas OMS/PNSP.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_SEGURANCA_PACIENTE.md
 * @see lib/guidelines/segurancaPaciente.ts
 */

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
  scoreWithA4Minimo,
  type A4MinimoAudit,
  type A4MinimoPackageConfig,
  type A4MinimoWhitelistClaim,
  type QuestaoLike,
} from '@/lib/catalogMigration/a4MinimoCore';
import type { EfficacyContract, RiskResult, RiskScoringContext } from '@/lib/catalogMigration/riskScoring';

export const SEGURANCA_PACIENTE_A4_MINIMO_AGENT = 'agent:seguranca-paciente-a4-minimo-v1';
export const SEGURANCA_PACIENTE_SUBTOPICO = 'Segurança do Paciente';

export type SegurancaPacienteReviewAxis =
  | 'identificacao'
  | 'quedas'
  | 'eventos'
  | 'metas'
  | 'notificacao'
  | 'pegadinha';

export type SegurancaPacienteWhitelistClaim = A4MinimoWhitelistClaim & {
  axis: SegurancaPacienteReviewAxis;
};
export type SegurancaPacienteA4MinimoAudit = A4MinimoAudit;

export function isSegurancaPacienteSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'segurança do paciente' || n === 'seguranca do paciente';
}

export const SEGURANCA_PACIENTE_CLAIM_WHITELIST: readonly SegurancaPacienteWhitelistClaim[] = [
  {
    id: 'dois-identificadores',
    axis: 'identificacao',
    match: /dois\s+identificador|2\s+identificador|nome\s*\+\s*(?:data\s+de\s+)?nascimento|dupla\s+checagem/i,
    canonical: 'Dois identificadores independentes antes de medicação e procedimento',
    guidelineEntryId: 'sp-dois-identificadores',
    groundsNumeric: false,
  },
  {
    id: 'pulseira-identificacao',
    axis: 'identificacao',
    match: /pulseira|identifica[cç][aã]o\s+segura|dois\s+identificador/i,
    canonical: 'Pulseira com nome e DN — estratégia de identificação segura',
    guidelineEntryId: 'sp-pulseira-identificacao',
    groundsNumeric: false,
  },
  {
    id: 'meta-1-oms',
    axis: 'metas',
    match: /meta\s*1|identificar\s+corretamente\s+o\s+paciente|paciente\s+certo/i,
    canonical: 'Meta 1 OMS — identificar corretamente o paciente',
    guidelineEntryId: 'sp-meta-1-identificar',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-urgencia-id',
    axis: 'pegadinha',
    match: /urg[eê]ncia.{0,40}(?:dispens|sem\s+qualquer|n[aã]o\s+precisa).{0,40}identif|alto\s+risco.{0,30}sem\s+identif/i,
    canonical: 'Urgência não dispensa identificação — pegadinha clássica',
    guidelineEntryId: 'sp-pegadinha-urgencia-id',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-quarto-id',
    axis: 'pegadinha',
    match: /quarto\s+como\s+identificador|leito\s+como\s+identificador|identificar\s+pelo\s+quarto/i,
    canonical: 'Quarto/leito não identifica o paciente',
    guidelineEntryId: 'sp-pegadinha-quarto-id',
    groundsNumeric: false,
  },
  {
    id: 'escala-queda-admissao',
    axis: 'quedas',
    match: /escala.{0,30}admiss[aã]o|avaliar\s+risco.{0,30}admiss[aã]o|indicador\s+de\s+queda|avalia[cç][aã]o\s+na\s+admiss[aã]o/i,
    canonical: 'Avaliação de risco de queda na admissão com escala',
    guidelineEntryId: 'sp-morse-escala',
    groundsNumeric: false,
  },
  {
    id: 'morse-quedas',
    axis: 'quedas',
    match: /\bmorse\b|escala.{0,20}queda|risco\s+de\s+queda|preven[cç][aã]o.{0,12}queda|prevenir\s+queda|cal[cç]ado\s+antiderrapante|ambiente\s+seguro|tapete.{0,20}queda/i,
    canonical: 'Estratificação de risco de queda — Morse e sinalização',
    guidelineEntryId: 'sp-morse-escala',
    groundsNumeric: false,
  },
  {
    id: 'grades-cama-quedas',
    axis: 'quedas',
    match: /grades?.{0,30}(?:elevada|cama|leito)|barreiras?\s+laterais/i,
    canonical: 'Grades elevadas no leito — complemento do pacote anti-queda',
    guidelineEntryId: 'sp-grades-cama',
    groundsNumeric: false,
  },
  {
    id: 'meta-6-quedas',
    axis: 'quedas',
    match: /meta\s*6|preven[cç][aã]o\s+de\s+queda|reduzir.{0,20}queda/i,
    canonical: 'Meta 6 OMS — reduzir risco de quedas (pacote de cuidados)',
    guidelineEntryId: 'sp-meta-6-quedas',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-grades-sozinhas',
    axis: 'pegadinha',
    match: /grades?.{0,40}(?:s[oó]|apenas|isolada|suficiente\s+sozinha)|medida\s+isolada.{0,20}queda/i,
    canonical: 'Grades sozinhas não bastam — avaliação + ambiente + supervisão',
    guidelineEntryId: 'sp-grades-cama',
    groundsNumeric: false,
  },
  {
    id: 'evento-adverso-dano',
    axis: 'eventos',
    match: /evento\s+adverso|resultou\s+em\s+dano|dano\s+ao\s+paciente/i,
    canonical: 'Evento adverso = incidente com dano ao paciente',
    guidelineEntryId: 'sp-evento-adverso',
    groundsNumeric: false,
  },
  {
    id: 'incidente-sem-dano',
    axis: 'eventos',
    match: /incidente.{0,40}(?:sem\s+dano|n[aã]o\s+causou\s+dano)|atingiu.{0,20}n[aã]o\s+causou/i,
    canonical: 'Incidente sem dano — atingiu mas não lesionou',
    guidelineEntryId: 'sp-incidente-sem-dano',
    groundsNumeric: false,
  },
  {
    id: 'quase-erro-near-miss',
    axis: 'eventos',
    match: /quase[\s-]?erro|near\s+miss|n[aã]o\s+atingiu\s+o\s+paciente/i,
    canonical: 'Quase-erro — falha que não alcançou o paciente',
    guidelineEntryId: 'sp-quase-erro',
    groundsNumeric: false,
  },
  {
    id: 'notificacao-pnsp',
    axis: 'notificacao',
    match: /notifica[cç][aã]o\s+de\s+evento|\bpnsp\b|portaria.{0,10}529|cultura\s+de\s+seguran[cç]a|sistema[s]?\s+mais\s+seguro|risco\s+cl[ií]nico/i,
    canonical: 'PNSP — notificar eventos para aprendizado (cultura não punitiva)',
    guidelineEntryId: 'sp-notificacao-evento',
    groundsNumeric: false,
  },
  {
    id: 'higienizacao-maos-meta',
    axis: 'metas',
    match: /higieniza[cç][aã]o\s+das?\s+m[aã]os|momento\s+da\s+higiene/i,
    canonical: 'Higienização das mãos — meta internacional de segurança',
    guidelineEntryId: 'sp-higienizacao-maos',
    groundsNumeric: false,
  },
];

const SEGURANCA_PACIENTE_SENSITIVE_RE =
  /identificador|pulseira|paciente\s+errado|queda|\bmorse\b|evento\s+adverso|incidente|near\s+miss|quase[\s-]?erro|\bpnsp\b|meta\s*[16]|portaria.{0,6}529|dupla\s+checagem/i;

export const SEGURANCA_PACIENTE_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'seguranca-do-paciente',
  label: 'Segurança do Paciente',
  agentId: SEGURANCA_PACIENTE_A4_MINIMO_AGENT,
  isApplicable: isSegurancaPacienteSubtopico,
  whitelist: SEGURANCA_PACIENTE_CLAIM_WHITELIST,
  sensitiveClaimHintRe: SEGURANCA_PACIENTE_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /fixa[cç][aã]o|identific|queda|morse|evento|incidente|meta\s*[16]|paciente\s+certo|n[aã]o\s+confund|pegadinha/i,
};

export function auditSegurancaPacienteA4Minimo(payload: QuestaoLike): SegurancaPacienteA4MinimoAudit {
  return auditA4Minimo(SEGURANCA_PACIENTE_A4_MINIMO_CONFIG, payload);
}

export function applySegurancaPacienteA4MinimoMitigation(
  risk: RiskResult,
  audit: SegurancaPacienteA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(SEGURANCA_PACIENTE_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithSegurancaPacienteA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: SegurancaPacienteA4MinimoAudit } {
  return scoreWithA4Minimo(SEGURANCA_PACIENTE_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildSegurancaPacienteA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: SegurancaPacienteA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(SEGURANCA_PACIENTE_A4_MINIMO_CONFIG, risk, audit, options);
}
