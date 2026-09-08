/**
 * AVANT — Commercial Content Authority
 * Fonte unica e server-side para elegibilidade e entrega de conteudo pedagogico.
 *
 * Principios:
 * 1. SERVER_SIDE: Decisao executada exclusivamente no servidor.
 * 2. DEFAULT_DENY: Qualquer estado desconhecido ou invalido bloqueia a entrega.
 * 3. DETERMINISTIC: Regras auditaveis sem dependencia de estado transiente do cliente.
 * 4. P0_DENYLIST: Bloqueio imediato dos 16 itens confirmados com defeito critico.
 * 5. RC-004: Subtopico production_ready + ready_100 no payload atual (commercialRuntimeGate).
 */

import { isSlugInP0Denylist } from '@/lib/catalogMigration/p0Denylist';
import {
  evaluateCommercialRuntimeApproval,
  isCommercialRuntimeReadinessGateEnabled,
  resolveCommercialSubtopico,
} from '@/lib/catalogMigration/commercialRuntimeGate';
import {
  isTituloAulaVisibleInVitrine,
} from '@/lib/catalogMigration/vitrineQualityGate';
import {
  findCorrectOptionId,
  lessonDataHasPlayableQuestion,
} from '@/lib/estudar/questionPayload';
import { detectMissingFigure } from '@/lib/catalogMigration/figureContract';
import type { LessonData } from '@/types/lesson';
import { findPacoteBySubtopico, loadHandcraftRegistry } from '@/lib/catalogMigration/handcraftRegistry';

export type CommercialEligibilityResult = {
  eligible: boolean;
  reason?:
    | 'P0_DENYLIST'
    | 'QUALITY_GATE_BLOCKED'
    | 'MALFORMED_CONTENT'
    | 'NO_CORRECT_ANSWER'
    | 'MISSING_FIGURE'
    | 'SUBTOPIC_NOT_IN_REGISTRY'
    | 'SUBTOPIC_NOT_PRODUCTION_READY'
    | 'READINESS_NOT_APPROVED'
    | 'COMMERCIAL_APPROVAL_NOT_BOUND'
    | 'COMMERCIAL_APPROVAL_MISMATCH'
    | 'COMMERCIAL_APPROVAL_REVOKED'
    | 'COMMERCIAL_APPROVAL_AUTHORITY_INVALID'
    | 'COMMERCIAL_APPROVAL_GATE_BLOCKED'
    | 'CONTENT_NOT_PROVIDED'
    | 'ADMIN_BYPASS';
  contentFingerprint?: string;
  readinessCodes?: string[];
};

export type CommercialEvaluationContext = {
  isAdmin?: boolean;
  slug?: string | null;
  tituloAula?: string | null;
  conteudoJson?: unknown;
};

/**
 * Avalia se um modulo/slug e elegivel para listagens (vitrine, cadernos, resume).
 * Nivel slug — integridade de conteudo validada em canServeCommercialContent.
 */
export function isModuloCommercialEligible(input: {
  slug?: string | null;
  tituloAula?: string | null;
  isAdmin?: boolean;
}): boolean {
  if (input.isAdmin) return true;
  if (input.slug && isSlugInP0Denylist(input.slug)) {
    return false;
  }
  if (input.tituloAula && !isTituloAulaVisibleInVitrine(input.tituloAula, { isAdmin: input.isAdmin })) {
    return false;
  }
  if (isCommercialRuntimeReadinessGateEnabled()) {
    const subtopico = input.tituloAula?.trim() || null;
    if (subtopico) {
      const found = findPacoteBySubtopico(loadHandcraftRegistry(), subtopico);
      if (!found) return false;
    }
  }
  return true;
}

/**
 * Avalia se um conteudo completo pode ser servido ao aluno (player, simulados, etc.).
 */
export function canServeCommercialContent(context: CommercialEvaluationContext): CommercialEligibilityResult {
  if (context.isAdmin) {
    return { eligible: true, reason: 'ADMIN_BYPASS' };
  }

  const slug = context.slug?.trim();
  if (slug && isSlugInP0Denylist(slug)) {
    return { eligible: false, reason: 'P0_DENYLIST' };
  }

  if (context.tituloAula && !isTituloAulaVisibleInVitrine(context.tituloAula, { isAdmin: false })) {
    return { eligible: false, reason: 'QUALITY_GATE_BLOCKED' };
  }

  if (!context.conteudoJson) {
    return { eligible: false, reason: 'CONTENT_NOT_PROVIDED' };
  }

  const raw = context.conteudoJson as Record<string, unknown>;
  const isEnvelope = raw && raw.payload && !raw.question_data && !raw.reverse_study_slides;
  if (isEnvelope) {
    return { eligible: false, reason: 'MALFORMED_CONTENT' };
  }
  const dados = raw as unknown as LessonData;
  if (!lessonDataHasPlayableQuestion(dados)) {
    return { eligible: false, reason: 'MALFORMED_CONTENT' };
  }
  const correctId = findCorrectOptionId(dados);
  if (!correctId) {
    return { eligible: false, reason: 'NO_CORRECT_ANSWER' };
  }
  const missingFig = detectMissingFigure(dados as Parameters<typeof detectMissingFigure>[0]);
  if (missingFig) {
    return { eligible: false, reason: 'MISSING_FIGURE' };
  }

  const runtime = evaluateCommercialRuntimeApproval({
    slug,
    tituloAula: context.tituloAula,
    conteudoJson: context.conteudoJson,
  });

  if (!runtime.approved) {
    return {
      eligible: false,
      reason: runtime.reason,
      contentFingerprint: runtime.contentFingerprint,
      readinessCodes: runtime.readinessCodes,
    };
  }

  return {
    eligible: true,
    contentFingerprint: runtime.contentFingerprint,
  };
}

/** Resolve subtópico canônico para auditoria (exportado para testes). */
export { resolveCommercialSubtopico };
