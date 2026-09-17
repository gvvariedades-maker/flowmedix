/**
 * Anti-spoof de aprovação por evidência — sem dependências Node (seguro para bundle client).
 * Usado por validateQuestaoForWrite no Laboratório e APIs.
 *
 * @see docs/DECISAO_APROVACAO_POR_EVIDENCIA_V2.md
 */

/** Campos no payload que não podem auto-conceder aprovação por evidência. */
export function detectUntrustedEvidenceApprovalClaims(payload: {
  meta?: Record<string, unknown>;
}): Array<{ code: string; message: string; path: string }> {
  const issues: Array<{ code: string; message: string; path: string }> = [];
  const meta = payload.meta ?? {};
  const forbidden = [
    'evidence_approved',
    'agent_review_passed',
    'primary_review_passed',
    'adversarial_review_passed',
    'evidence_governed_approval',
  ];
  for (const key of forbidden) {
    if (meta[key] === true || meta[key] === 'PASS') {
      issues.push({
        code: 'evidence_approval_spoof_untrusted',
        message: `${key} não pode ser declarado no payload — evidência vem de artefatos externos.`,
        path: `meta.${key}`,
      });
    }
  }
  const ec = meta.efficacy_contract;
  if (ec && typeof ec === 'object') {
    const ecObj = ec as Record<string, unknown>;
    for (const key of ['evidence_approved', 'evidence_review_passed', 'evidence_governed_pass']) {
      if (ecObj[key] === true) {
        issues.push({
          code: 'evidence_approval_spoof_untrusted',
          message: `efficacy_contract.${key} não pode ser declarado em import/API.`,
          path: `meta.efficacy_contract.${key}`,
        });
      }
    }
  }
  return issues;
}
