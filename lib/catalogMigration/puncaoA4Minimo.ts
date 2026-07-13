/**
 * Protocolo A4-mínimo — Punção Venosa e Cuidados com Cateteres.
 * Pluga whitelist no core genérico (`a4MinimoCore`).
 *
 * @see docs/PROTOCOLO_A4_MINIMO_PUNCAO.md
 * @see docs/PROTOCOLO_A4_MINIMO.md
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
import { isPuncaoSubtopico } from '@/lib/catalogMigration/puncaoPedagogy';
import type { EfficacyContract, RiskResult, RiskScoringContext } from '@/lib/catalogMigration/riskScoring';

export const PUNCAO_A4_MINIMO_AGENT = 'agent:puncao-a4-minimo-v1';

export type PuncaoReviewAxis =
  | 'hub'
  | 'curativo'
  | 'flush'
  | 'flebite'
  | 'antissepsia'
  | 'bundle'
  | 'dispositivo'
  | 'tempo'
  | 'infiltracao'
  | 'hematoma';

export type PuncaoWhitelistClaim = A4MinimoWhitelistClaim & { axis: PuncaoReviewAxis };
export type PuncaoA4MinimoAudit = A4MinimoAudit;

export const PUNCAO_CLAIM_WHITELIST: readonly PuncaoWhitelistClaim[] = [
  {
    id: 'hub-alcool-70',
    axis: 'hub',
    match:
      /(?:\bhub\b|conex[aã]o|canh[aã]o|d[aâ]nula).{0,80}(?:[aá]lcool\s*70|alcool\s*70)|(?:[aá]lcool\s*70|alcool\s*70).{0,80}(?:\bhub\b|conex[aã]o|canh[aã]o|fric[cç][aã]o|manipula)/i,
    forbid: /[aá]lcool\s*(?:80|90|95|100)\s*%/i,
    canonical: 'Álcool 70% com fricção no hub/conexão a cada manipulação',
    guidelineEntryId: 'hub-desinfeccao-alcool-70',
    groundsNumeric: true,
  },
  {
    id: 'curativo-descolar-asseptico',
    axis: 'curativo',
    match:
      /curativo.{0,60}(?:descol|solto|sujo|úmido|umido|ass[eé]ptic)|(?:troca|trocar).{0,40}curativo/i,
    canonical: 'Troca de curativo asséptica quando sujo/solto/descolado',
    guidelineEntryId: 'curativo-troca',
    groundsNumeric: false,
  },
  {
    id: 'flush-sf09-continuo',
    axis: 'flush',
    match:
      /(?:flush|lavagem|lavar).{0,50}(?:sf\s*0[,.]?9|soro\s*fisiol|salina)|(?:sf\s*0[,.]?9|soro\s*fisiol).{0,50}(?:flush|lavagem|permeabil)/i,
    forbid: /(?:flush|lavar|lavagem).{0,40}apenas\s+(?:na|no)\s+inser/i,
    canonical: 'Flush com SF 0,9% — manutenção contínua do lúmen',
    guidelineEntryId: 'flush-sf09',
    groundsNumeric: true,
  },
  {
    id: 'flebite-retirar',
    axis: 'flebite',
    match: /flebite.{0,80}(?:retir|remov)|(?:retir|remov).{0,40}(?:cateter|dispositivo).{0,40}flebite/i,
    canonical: 'Flebite: retirar o dispositivo',
    guidelineEntryId: 'flebite-conduta',
    groundsNumeric: false,
  },
  {
    id: 'infiltracao-suspender',
    axis: 'infiltracao',
    match:
      /(?:infiltra|extravasa).{0,60}(?:suspend|remov|retir)|(?:suspend|remov).{0,40}(?:infiltra|extravasa)/i,
    canonical: 'Infiltração/extravasamento: suspender e remover o cateter',
    guidelineEntryId: 'infiltracao-conduta',
    groundsNumeric: false,
  },
  {
    id: 'hematoma-compressao',
    axis: 'hematoma',
    match: /hematoma.{0,50}compress|compress.{0,40}hematoma/i,
    canonical: 'Hematoma: compressão local e observação',
    guidelineEntryId: 'hematoma-conduta',
    groundsNumeric: false,
  },
  {
    id: 'antissepsia-alcool-70-pele',
    axis: 'antissepsia',
    match:
      /(?:antissepsia|assepsia|pele|s[ií]tio).{0,50}[aá]lcool\s*70|[aá]lcool\s*70.{0,50}(?:antissepsia|assepsia|pun[cç])/i,
    forbid: /[aá]lcool\s*(?:80|90|95|100)\s*%.{0,30}(?:antissepsia|pun[cç])/i,
    canonical: 'Antissepsia cutânea em punção: álcool 70% (padrão de prova)',
    guidelineEntryId: 'antissepsia-puncao',
    groundsNumeric: true,
  },
  {
    id: 'bundle-cvc-ipcs',
    axis: 'bundle',
    match: /bundle|(?:preven[cç][aã]o|previne).{0,40}(?:ipcs|corrente\s*sangu)/i,
    canonical: 'Bundle CVC — pacote de prevenção de IPCS',
    guidelineEntryId: 'bundle-cvc',
    groundsNumeric: false,
  },
  {
    id: 'antibiotico-nao-bundle',
    axis: 'bundle',
    match:
      /antibi[oó]tico.{0,50}(?:n[aã]o\s*substitui|n[aã]o\s*dispensa|n[aã]o\s*faz\s*parte)|(?:n[aã]o\s*substitui|n[aã]o\s*dispensa).{0,40}(?:bundle|manuten)/i,
    canonical: 'Antibiótico IV não substitui bundle de manutenção',
    guidelineEntryId: 'antibiotico-nao-substitui-bundle',
    groundsNumeric: false,
  },
  {
    id: 'manutencao-reativa-errada',
    axis: 'curativo',
    match:
      /(?:manuten[cç][aã]o\s*reativa|s[oó]\s*(?:trocar|troca)\s*se\s*infect|esperar\s*sinais?\s*locais).{0,40}(?:tardi|risco|errada|eliminar)/i,
    canonical: 'Manutenção reativa (só se infectar) é conduta tardia — eliminar',
    guidelineEntryId: 'curativo-troca',
    groundsNumeric: false,
  },
];

const PUNCAO_SENSITIVE_RE =
  /\b\d+([.,]\d+)?\s*%|\b\d+([.,]\d+)?\s*(mg|ml|h\b|hora|horas|min|dia|dias|g\b)|[aá]lcool\s*\d+|sf\s*0[,.]?9|clorexidina|heparina|bundle|fric[cç]|flush|hub\b|canh[aã]o|flebite|infiltra|extravasa|hematoma|gauge|\d+\s*°/i;

export const PUNCAO_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'puncao',
  label: 'Punção',
  agentId: PUNCAO_A4_MINIMO_AGENT,
  isApplicable: isPuncaoSubtopico,
  whitelist: PUNCAO_CLAIM_WHITELIST,
  sensitiveClaimHintRe: PUNCAO_SENSITIVE_RE,
  fixacaoStepRe: /similares|em outra|transfer|port[aá]til|hub.*curativo|curativo.*hub/i,
  extraUnmatchedSensitive: (corpus, _matchedIds) => {
    const alcoholOdd = corpus.match(/[aá]lcool\s*(?:80|90|95|100)\s*%/gi);
    return alcoholOdd ? alcoholOdd.slice(0, 3) : [];
  },
};

export function auditPuncaoA4Minimo(payload: QuestaoLike): PuncaoA4MinimoAudit {
  return auditA4Minimo(PUNCAO_A4_MINIMO_CONFIG, payload);
}

export function applyPuncaoA4MinimoMitigation(
  risk: RiskResult,
  audit: PuncaoA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(PUNCAO_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithPuncaoA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: PuncaoA4MinimoAudit } {
  return scoreWithA4Minimo(PUNCAO_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildPuncaoA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: PuncaoA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(PUNCAO_A4_MINIMO_CONFIG, risk, audit, options);
}
