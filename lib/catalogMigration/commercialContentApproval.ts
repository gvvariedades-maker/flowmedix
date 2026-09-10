/**
 * RC-004b — Vínculo de aprovação comercial ao conteúdo servido.
 *
 * Reutiliza assertApprovalGate (apply) + meta.efficacy_contract / anchor_100_approval.
 * Exige approved_content_fingerprint === fingerprintConteudoJson(payload atual).
 * Sem migration: campo opcional no JSON (meta).
 */
import { createHash } from 'node:crypto';
import {
  isVerifiableHumanCommercialReviewer,
} from '@/lib/catalogMigration/commercialApprovalWriteBoundary';
import {
  assertApprovalGate,
  type RiskResult,
} from '@/lib/catalogMigration/riskScoring';
import type { RegistryPacote } from '@/lib/catalogMigration/handcraftRegistry';
import { normalizeProductionStatus } from '@/lib/catalogMigration/shipGate';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';

export type CommercialContentApprovalReason =
  | 'APPROVAL_GATE_BLOCKED'
  | 'APPROVAL_UNBOUND'
  | 'APPROVAL_CONTENT_MISMATCH'
  | 'APPROVAL_REVOKED'
  | 'APPROVAL_AUTHORITY_INVALID';

export type CommercialContentApprovalResult = {
  approved: boolean;
  reason?: CommercialContentApprovalReason;
  detail?: string;
  authority?: string;
  approvedAt?: string;
};

type QuestaoMetaLike = {
  efficacy_contract?: {
    a4_reviewed?: boolean;
    a4_reviewer?: string;
    auto_approved_at?: string;
    approved_content_fingerprint?: string;
    approval_mode?: string;
  };
  anchor_100_approval?: {
    status?: string;
    reviewed_at?: string;
    reviewer?: string;
    approved_content_fingerprint?: string;
  };
};

type PayloadLike = { meta?: QuestaoMetaLike };

export function computeRegistryAuthorityRevision(
  pacoteKey: string,
  pacote: RegistryPacote,
): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        pacote_key: pacoteKey,
        pacote_prefix: pacote.pacote_prefix,
        production_status: normalizeProductionStatus(pacote.production_status),
        auto_approval: pacote.auto_approval?.enabled ?? true,
      }),
    )
    .digest('hex')
    .slice(0, 16);
}

function verifyFingerprintBinding(
  stored: string | undefined,
  current: string,
): CommercialContentApprovalResult {
  if (!stored?.trim()) {
    return { approved: false, reason: 'APPROVAL_UNBOUND' };
  }
  if (stored !== current) {
    return {
      approved: false,
      reason: 'APPROVAL_CONTENT_MISMATCH',
      detail: `expected=${stored.slice(0, 12)}… actual=${current.slice(0, 12)}…`,
    };
  }
  return { approved: true };
}

/**
 * Avalia aprovação comercial obrigatória no runtime (pós ready_100).
 * Não substitui ready_100 nem denylist.
 */
export function evaluateCommercialContentApproval(
  payload: PayloadLike,
  contentFingerprint: string,
  risk: RiskResult,
): CommercialContentApprovalResult {
  const blockers = assertApprovalGate(payload as never, risk);
  if (blockers.length > 0) {
    return {
      approved: false,
      reason: 'APPROVAL_GATE_BLOCKED',
      detail: blockers[0],
    };
  }

  const meta = payload.meta ?? {};
  const anchor = meta.anchor_100_approval;
  if (anchor?.status === 'fail' || anchor?.status === 'pending' || anchor?.status === 'human_required') {
    return {
      approved: false,
      reason: 'APPROVAL_REVOKED',
      detail: `anchor_100_approval.status=${anchor.status}`,
      authority: anchor.reviewer,
    };
  }

  if (anchor?.status === 'pass') {
    if (!isVerifiableHumanCommercialReviewer(anchor.reviewer)) {
      return {
        approved: false,
        reason: 'APPROVAL_AUTHORITY_INVALID',
        detail: 'anchor_100_approval exige reviewer humano (não agent:)',
      };
    }
    const bound = verifyFingerprintBinding(anchor.approved_content_fingerprint, contentFingerprint);
    return {
      ...bound,
      authority: anchor.reviewer,
      approvedAt: anchor.reviewed_at,
    };
  }

  const ec = meta.efficacy_contract;
  if (ec?.a4_reviewed === true) {
    if (!isVerifiableHumanCommercialReviewer(ec.a4_reviewer)) {
      return {
        approved: false,
        reason: 'APPROVAL_AUTHORITY_INVALID',
        detail: 'efficacy_contract exige a4_reviewer humano verificável (sem prefixo human:/agent:)',
        authority: ec.a4_reviewer,
      };
    }
    const bound = verifyFingerprintBinding(ec.approved_content_fingerprint, contentFingerprint);
    return {
      ...bound,
      authority: ec.a4_reviewer,
      approvedAt: ec.auto_approved_at,
    };
  }

  return { approved: false, reason: 'APPROVAL_UNBOUND' };
}

/** Helper de teste/fixture — carimba fingerprint no efficacy_contract. */
export function stampEfficacyContentFingerprint<T extends PayloadLike>(
  payload: T,
  contentFingerprint?: string,
  options?: { reviewer?: string; autoApprovedAt?: string },
): T {
  const fp = contentFingerprint ?? fingerprintConteudoJson(payload);
  const meta = payload.meta ?? {};
  const ec = meta.efficacy_contract ?? {};
  return {
    ...payload,
    meta: {
      ...meta,
      efficacy_contract: {
        ...ec,
        a4_reviewed: true,
        a4_reviewer: options?.reviewer ?? 'PC',
        approval_mode: ec.approval_mode ?? 'auto',
        auto_approved_at: options?.autoApprovedAt ?? '2026-09-08',
        approved_content_fingerprint: fp,
      },
    },
  };
}
