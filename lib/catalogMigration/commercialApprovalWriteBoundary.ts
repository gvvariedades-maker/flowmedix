/**
 * RC-004c — Fronteira de confiança na escrita de aprovação comercial.
 *
 * Entrada não confiável (Laboratório, API admin, import manual) não pode
 * auto-conceder aprovação comercial. Fingerprint só é emitido server-side
 * no apply autorizado, após gates de risco vigentes.
 */
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import {
  assertApprovalGate,
  buildEfficacyContractFromRisk,
  hasHumanA4Signature,
  type RiskResult,
  type RiskScoringContext,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';
import type { z } from 'zod';
import type { QuestaoCompletaSchema } from '@/lib/validations';

type QuestaoPayload = z.infer<typeof QuestaoCompletaSchema>;

export type CommercialWriteTrust = 'untrusted' | 'authorized_apply' | 'runtime_read';

export type CommercialApprovalWriteIssue = {
  code: string;
  message: string;
  path: string;
};

/** Revisor humano verificável — não aceita prefixos autodeclarados `human:` / `agent:`. */
export function isVerifiableHumanCommercialReviewer(reviewer: string | undefined | null): boolean {
  const r = (reviewer ?? '').trim();
  if (r.length < 2) return false;
  if (/^agent:/i.test(r)) return false;
  if (/^human:/i.test(r)) return false;
  return true;
}

export function hasVerifiableHumanCommercialSignature(payload: {
  meta?: {
    efficacy_contract?: { a4_reviewed?: boolean; a4_reviewer?: string };
    anchor_100_approval?: { status?: string; reviewer?: string };
  };
}): boolean {
  const ec = payload.meta?.efficacy_contract;
  if (ec?.a4_reviewed === true && isVerifiableHumanCommercialReviewer(ec.a4_reviewer)) {
    return true;
  }
  const anchor = payload.meta?.anchor_100_approval;
  if (anchor?.status === 'pass' && isVerifiableHumanCommercialReviewer(anchor.reviewer)) {
    return true;
  }
  return false;
}

/** Detecta metadados de aprovação comercial vindos de entrada não confiável. */
export function detectUntrustedCommercialApprovalClaims(
  payload: QuestaoPayload,
): CommercialApprovalWriteIssue[] {
  const issues: CommercialApprovalWriteIssue[] = [];
  const ec = payload.meta?.efficacy_contract;
  const anchor = payload.meta?.anchor_100_approval;

  if (ec?.approved_content_fingerprint?.trim()) {
    issues.push({
      code: 'commercial_approval_fingerprint_untrusted',
      message:
        'approved_content_fingerprint não pode ser enviado em import/API — emitido somente server-side no apply autorizado.',
      path: 'meta.efficacy_contract.approved_content_fingerprint',
    });
  }

  if (anchor?.approved_content_fingerprint?.trim()) {
    issues.push({
      code: 'commercial_anchor_fingerprint_untrusted',
      message:
        'anchor_100_approval.approved_content_fingerprint não pode ser enviado em import/API.',
      path: 'meta.anchor_100_approval.approved_content_fingerprint',
    });
  }

  if (anchor?.status === 'pass') {
    issues.push({
      code: 'commercial_anchor_pass_untrusted',
      message:
        'anchor_100_approval.status=pass não pode ser declarado em import/API — fluxo anchor-100 autorizado apenas.',
      path: 'meta.anchor_100_approval.status',
    });
  }

  if (ec?.a4_reviewed === true && !isVerifiableHumanCommercialReviewer(ec.a4_reviewer)) {
    if (/^human:/i.test(ec.a4_reviewer ?? '') || /^agent:/i.test(ec.a4_reviewer ?? '')) {
      issues.push({
        code: 'commercial_reviewer_spoof_untrusted',
        message:
          'a4_reviewer com prefixo human:/agent: não é evidência verificável em import/API.',
        path: 'meta.efficacy_contract.a4_reviewer',
      });
    }
  }

  return issues;
}

/** Remove vínculos comerciais — usado antes de persistir entradas não confiáveis. */
export function stripCommercialApprovalBinding<T extends QuestaoPayload>(payload: T): T {
  const meta = { ...payload.meta };
  if (meta.efficacy_contract) {
    const ec = { ...meta.efficacy_contract };
    delete ec.approved_content_fingerprint;
    meta.efficacy_contract = ec;
  }
  if (meta.anchor_100_approval) {
    const anchor = { ...meta.anchor_100_approval };
    delete anchor.approved_content_fingerprint;
    if (anchor.status === 'pass') {
      anchor.status = 'pending';
    }
    meta.anchor_100_approval = anchor;
  }
  return { ...payload, meta };
}

export type IssueServerCommercialApprovalInput = {
  payload: QuestaoPayload;
  slug?: string;
  riskContext?: RiskScoringContext;
  /** ISO date for auto_approved_at when aplicável. */
  approvedAt?: string;
};

export type IssueServerCommercialApprovalResult = {
  payload: QuestaoPayload;
  stamped: boolean;
  reason?: string;
  contentFingerprint?: string;
};

/**
 * Emite approved_content_fingerprint server-side sobre o payload final.
 * Só no trust `authorized_apply` após gates de risco.
 */
export function issueServerCommercialApproval(
  input: IssueServerCommercialApprovalInput,
): IssueServerCommercialApprovalResult {
  const risk = scoreQuestaoRisk(input.payload, input.riskContext);
  const blockers = assertApprovalGate(input.payload, risk);
  if (blockers.length > 0) {
    return { payload: stripCommercialApprovalBinding(input.payload), stamped: false, reason: blockers[0] };
  }

  const base = stripCommercialApprovalBinding(input.payload);
  const fp = fingerprintConteudoJson(base);

  if (hasVerifiableHumanCommercialSignature(base)) {
    const meta = { ...base.meta };
    const ec = { ...(meta.efficacy_contract ?? {}) };
    meta.efficacy_contract = {
      ...ec,
      a4_reviewed: true,
      approved_content_fingerprint: fp,
      auto_approved_at: ec.auto_approved_at ?? input.approvedAt ?? new Date().toISOString().slice(0, 10),
    };
    return {
      payload: { ...base, meta },
      stamped: true,
      contentFingerprint: fp,
    };
  }

  const anchor = base.meta?.anchor_100_approval;
  if (anchor?.status === 'pass' && isVerifiableHumanCommercialReviewer(anchor.reviewer)) {
    const meta = { ...base.meta! };
    meta.anchor_100_approval = {
      ...anchor,
      approved_content_fingerprint: fp,
    };
    return {
      payload: { ...base, meta },
      stamped: true,
      contentFingerprint: fp,
    };
  }

  if (risk.approval_mode !== 'human_required' && input.riskContext?.autoApprovalEnabled === true) {
    const autoEc = buildEfficacyContractFromRisk(risk, {
      isoDate: input.approvedAt,
    });
    const meta = {
      ...base.meta,
      efficacy_contract: {
        ...(base.meta?.efficacy_contract ?? {}),
        ...autoEc,
      },
    };
    return {
      payload: { ...base, meta },
      stamped: false,
      reason: 'auto_tier_sem_evidencia_humana_comercial',
      contentFingerprint: fp,
    };
  }

  return {
    payload: base,
    stamped: false,
    reason: 'sem_evidencia_humana_verificavel',
    contentFingerprint: fp,
  };
}
