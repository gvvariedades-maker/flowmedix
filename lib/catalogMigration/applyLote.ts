import { generateContentHash } from '@/lib/contentHash';
import {
  invalidateModulosCache,
  invalidateQuestoesCache,
  invalidateQuestaoSlugsCache,
} from '@/lib/cache';
import { getDefaultConcursoId, linkModuloToConcurso } from '@/lib/concursos/entitlements';
import type { createServerSupabase } from '@/lib/supabase/server';
import {
  buildConteudoJson,
  correctOptionId,
  type ValidatedQuestao,
} from '@/lib/catalogMigration/validatePayload';
import {
  formatPremiumGateIssues,
  premiumGateErrors,
} from '@/lib/catalogMigration/premiumGate';
import {
  computeCandidateSha256,
  resolveTrustedEvidenceForSlug,
  toTrustedEvidenceApproval,
  type TrustedEvidenceApproval,
} from '@/lib/catalogMigration/evidenceGovernedApproval';
import {
  assertApprovalGate,
  requiresEvidenceApproval,
  requiresMandatoryEditorialApproval,
  scoreQuestaoRisk,
  type RiskResult,
  type RiskScoringContext,
} from '@/lib/catalogMigration/riskScoring';
import {
  issueServerCommercialApproval,
  stripCommercialApprovalBinding,
} from '@/lib/catalogMigration/commercialApprovalWriteBoundary';
import { auditAndMitigateA4Minimo } from '@/lib/catalogMigration/a4MinimoRegistry';

export type ApplyLoteItem = {
  modulo_slug: string;
  payload: ValidatedQuestao;
};

export type ApplyLoteOptions = {
  dryRun: boolean;
  strictGabarito: boolean;
  allowInsert: boolean;
  /** Bloqueia escrita de questões com conteúdo/visual genérico (default: true). */
  premiumGate?: boolean;
  /**
   * Gate de auto-aprovação por risco (default: false — opt-in por pacote).
   * Controla auto / auto_conditional e commercial stamp.
   * evidence_required e human_required são sempre aplicados (fail-closed).
   * @see docs/DECISAO_APROVACAO_POR_EVIDENCIA_V2.md
   */
  riskApprovalGate?: boolean;
  /** Contexto do registry para score de risco. */
  riskContext?: RiskScoringContext;
  /**
   * Emite approved_content_fingerprint server-side no apply autorizado (default: false).
   * Requer strip de metadados não confiáveis; não reintroduz aprovação revogada.
   */
  commercialApprovalStamp?: boolean;
  /** Manifest EVIDENCE_GOVERNED_APPROVAL_V2 (path relativo ao repo). */
  evidenceManifestPath?: string;
  repoRoot?: string;
  /**
   * --skip-risk-approval: não bypassa evidence_required nem human_required.
   * @see docs/DECISAO_APROVACAO_POR_EVIDENCIA_V2.md
   */
  allowSkipRiskApproval?: boolean;
};

export type ApplyLoteRowResult = {
  modulo_slug: string;
  status: 'ok' | 'skipped' | 'failed';
  mode: 'update' | 'insert' | 'skip';
  detail?: string;
  risk_tier?: string;
  approval_mode?: string;
  evidence_status?: string;
  evidence_codes?: string[];
  human_escalation_required?: boolean;
  primary_review_id?: string;
  adversarial_review_id?: string;
  candidate_sha256?: string;
};

function scoreRiskForApply(
  payload: ValidatedQuestao,
  riskContext?: RiskScoringContext,
) {
  const base = scoreQuestaoRisk(payload, riskContext);
  return auditAndMitigateA4Minimo(payload, base, {
    autoApprovalEnabled: riskContext?.autoApprovalEnabled,
  }).risk;
}

export type EditorialApprovalEvaluation = {
  risk: RiskResult;
  blockers: string[];
  trustedEvidence: TrustedEvidenceApproval | null;
  evidenceStatus?: string;
  evidenceCodes?: string[];
  humanEscalation: boolean;
  primaryReviewId?: string;
  adversarialReviewId?: string;
  candidateSha256?: string;
  /** SHA do candidato imediatamente após o gate — anti-TOCTOU na mesma execução. */
  boundCandidateSha256: string;
};

/** Avalia gate editorial (mandatory + opt-in). Exportado para testes adversariais. */
export function evaluateEditorialApprovalGate(
  slug: string,
  payload: ValidatedQuestao,
  options: Pick<
    ApplyLoteOptions,
    'riskContext' | 'evidenceManifestPath' | 'repoRoot' | 'allowSkipRiskApproval' | 'riskApprovalGate'
  >,
): EditorialApprovalEvaluation {
  const risk = scoreRiskForApply(payload, options.riskContext);
  const mandatory = requiresMandatoryEditorialApproval(risk);
  const runGate = mandatory || options.riskApprovalGate === true;

  let trustedEvidence: TrustedEvidenceApproval | null = null;
  let evidenceStatus: string | undefined;
  let evidenceCodes: string[] | undefined;
  let humanEscalation = false;
  let primaryReviewId: string | undefined;
  let adversarialReviewId: string | undefined;
  let candidateSha256: string | undefined;

  if (runGate && requiresEvidenceApproval(risk)) {
    if (!options.evidenceManifestPath) {
      evidenceStatus = 'MISSING';
      evidenceCodes = ['EVIDENCE_MANIFEST_REQUIRED'];
    } else {
      const ev = resolveTrustedEvidenceForSlug({
        repoRoot: options.repoRoot ?? process.cwd(),
        manifestPath: options.evidenceManifestPath,
        slug,
        candidate: payload,
      });
      evidenceStatus = ev.status;
      evidenceCodes = ev.codes;
      humanEscalation = ev.human_escalation_required;
      primaryReviewId = ev.primary_review_id;
      adversarialReviewId = ev.adversarial_review_id;
      candidateSha256 = ev.candidate_sha256;
      trustedEvidence = toTrustedEvidenceApproval(ev);
    }
  }

  const blockers = runGate
    ? assertApprovalGate(payload, risk, trustedEvidence, {
        allowSkipRiskApproval: options.allowSkipRiskApproval,
      })
    : [];

  return {
    risk,
    blockers,
    trustedEvidence,
    evidenceStatus,
    evidenceCodes,
    humanEscalation,
    primaryReviewId,
    adversarialReviewId,
    candidateSha256,
    boundCandidateSha256: computeCandidateSha256(payload),
  };
}

export async function applyLoteToSupabase(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  items: ApplyLoteItem[],
  options: ApplyLoteOptions,
): Promise<{ results: ApplyLoteRowResult[]; appliedSlugs: string[] }> {
  const results: ApplyLoteRowResult[] = [];
  const appliedSlugs: string[] = [];

  const premiumGate = options.premiumGate !== false;
  const riskApprovalGate = options.riskApprovalGate === true;
  const commercialApprovalStamp = options.commercialApprovalStamp === true;

  for (const item of items) {
    const { modulo_slug: slug } = item;
    let { payload } = item;
    payload = stripCommercialApprovalBinding(payload);

    if (commercialApprovalStamp) {
      const issued = issueServerCommercialApproval({
        payload,
        slug,
        riskContext: options.riskContext,
      });
      payload = issued.payload;
    }

    if (premiumGate) {
      const gateErrors = premiumGateErrors(payload);
      if (gateErrors.length > 0) {
        results.push({
          modulo_slug: slug,
          status: 'failed',
          mode: 'update',
          detail: `gate premium: ${formatPremiumGateIssues(gateErrors)}`,
        });
        continue;
      }
    }

    const editorial = evaluateEditorialApprovalGate(slug, payload, options);
    if (editorial.blockers.length > 0) {
      results.push({
        modulo_slug: slug,
        status: 'failed',
        mode: 'update',
        detail: `risk approval: ${editorial.blockers[0]}`,
        risk_tier: editorial.risk.risk_tier,
        approval_mode: editorial.risk.approval_mode,
        evidence_status: editorial.evidenceStatus,
        evidence_codes: editorial.evidenceCodes,
        human_escalation_required: editorial.humanEscalation,
        primary_review_id: editorial.primaryReviewId,
        adversarial_review_id: editorial.adversarialReviewId,
        candidate_sha256: editorial.candidateSha256,
      });
      continue;
    }

    if (computeCandidateSha256(payload) !== editorial.boundCandidateSha256) {
      results.push({
        modulo_slug: slug,
        status: 'failed',
        mode: 'update',
        detail:
          'TOCTOU: candidato alterado após gate editorial — bloqueado (revalide evidência).',
        risk_tier: editorial.risk.risk_tier,
        approval_mode: editorial.risk.approval_mode,
        candidate_sha256: computeCandidateSha256(payload),
      });
      continue;
    }

    const conteudoJson = buildConteudoJson(payload, slug);
    const instruction = payload.question_data.instruction;
    const contentHash = await generateContentHash(instruction);
    const localCorrect = correctOptionId(payload);

    const { data: row, error: fetchError } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (fetchError) {
      results.push({
        modulo_slug: slug,
        status: 'failed',
        mode: 'update',
        detail: fetchError.message,
      });
      continue;
    }

    if (!row) {
      if (!options.allowInsert) {
        results.push({
          modulo_slug: slug,
          status: 'skipped',
          mode: 'skip',
          detail: 'slug não encontrado (use --allow-insert)',
        });
        continue;
      }

      if (options.dryRun) {
        results.push({
          modulo_slug: slug,
          status: 'ok',
          mode: 'insert',
          detail: 'dry-run: would insert',
        });
        continue;
      }

      let { data: inserted, error: insertError } = await supabase
        .from('modulos_estudo')
        .insert([
          {
            modulo_nome: payload.meta.topico,
            titulo_aula: payload.meta.subtopico || payload.meta.topico,
            modulo_slug: slug,
            conteudo_json: conteudoJson,
            banca: payload.meta.banca.toUpperCase(),
            content_hash: contentHash,
          },
        ])
        .select('id')
        .single();

      if (insertError?.message?.includes('uniq_modulos_estudo_content_hash')) {
        const retry = await supabase
          .from('modulos_estudo')
          .insert([
            {
              modulo_nome: payload.meta.topico,
              titulo_aula: payload.meta.subtopico || payload.meta.topico,
              modulo_slug: slug,
              conteudo_json: conteudoJson,
              banca: payload.meta.banca.toUpperCase(),
            },
          ])
          .select('id')
          .single();
        inserted = retry.data;
        insertError = retry.error;
      }

      if (insertError || !inserted) {
        results.push({
          modulo_slug: slug,
          status: 'failed',
          mode: 'insert',
          detail: insertError?.message ?? 'insert falhou',
        });
        continue;
      }

      try {
        const concursoId = await getDefaultConcursoId();
        await linkModuloToConcurso(concursoId, inserted.id, 'publicacao');
      } catch (linkErr) {
        results.push({
          modulo_slug: slug,
          status: 'ok',
          mode: 'insert',
          detail: `inserida; vínculo concurso falhou: ${
            linkErr instanceof Error ? linkErr.message : 'erro'
          }`,
        });
        appliedSlugs.push(slug);
        continue;
      }

      results.push({
        modulo_slug: slug,
        status: 'ok',
        mode: 'insert',
        detail: 'inserida e vinculada ao concurso',
      });
      appliedSlugs.push(slug);
      continue;
    }

    if (options.strictGabarito) {
      const dbCorrect = correctOptionId(row.conteudo_json);
      if (dbCorrect && localCorrect && dbCorrect !== localCorrect) {
        results.push({
          modulo_slug: slug,
          status: 'failed',
          mode: 'update',
          detail: `gabarito diverge: DB=${dbCorrect} local=${localCorrect}`,
        });
        continue;
      }
    }

    if (options.dryRun) {
      results.push({
        modulo_slug: slug,
        status: 'ok',
        mode: 'update',
        detail: 'dry-run: would update conteudo_json',
      });
      continue;
    }

    let { error: updateError } = await supabase
      .from('modulos_estudo')
      .update({
        conteudo_json: conteudoJson,
        content_hash: contentHash,
        banca: payload.meta.banca.toUpperCase(),
        modulo_nome: payload.meta.topico,
        titulo_aula: payload.meta.subtopico || payload.meta.topico,
      })
      .eq('id', row.id);

    if (updateError?.message?.includes('uniq_modulos_estudo_content_hash')) {
      const retry = await supabase
        .from('modulos_estudo')
        .update({
          conteudo_json: conteudoJson,
          banca: payload.meta.banca.toUpperCase(),
          modulo_nome: payload.meta.topico,
          titulo_aula: payload.meta.subtopico || payload.meta.topico,
        })
        .eq('id', row.id);
      updateError = retry.error;
    }

    if (updateError) {
      results.push({
        modulo_slug: slug,
        status: 'failed',
        mode: 'update',
        detail: updateError.message,
      });
      continue;
    }

    results.push({
      modulo_slug: slug,
      status: 'ok',
      mode: 'update',
      detail: 'conteudo_json aplicado',
    });
    appliedSlugs.push(slug);
  }

  if (!options.dryRun && appliedSlugs.length > 0) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
      await invalidateQuestaoSlugsCache(appliedSlugs);
    } catch {
      // CLI fora do Next.js — esperado
    }
  }

  return { results, appliedSlugs };
}
