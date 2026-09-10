/**

 * RC-004 — Runtime commercial approval aligned to handcraft registry + readiness.

 *

 * Vincula elegibilidade de entrega ao subtópico production_ready no registry,

 * ready_100 (A1–A3) e aprovação comercial vinculada ao fingerprint do payload.

 * Default-deny para subtópicos fora do registry ou sem readiness/aprovação.

 */

import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';

export { fingerprintConteudoJson };

import {

  evaluateCommercialContentApproval,

  computeRegistryAuthorityRevision,

} from '@/lib/catalogMigration/commercialContentApproval';

import {

  findPacoteBySubtopico,

  loadHandcraftRegistry,

} from '@/lib/catalogMigration/handcraftRegistry';

import { canSell } from '@/lib/catalogMigration/shipGate';

import { unwrapCatalogPayload } from '@/lib/catalogMigration/unwrapCatalogPayload';



export type RuntimeApprovalReason =

  | 'SUBTOPIC_NOT_IN_REGISTRY'

  | 'SUBTOPIC_NOT_PRODUCTION_READY'

  | 'READINESS_NOT_APPROVED'

  | 'COMMERCIAL_APPROVAL_NOT_BOUND'

  | 'COMMERCIAL_APPROVAL_MISMATCH'

  | 'COMMERCIAL_APPROVAL_REVOKED'

  | 'COMMERCIAL_APPROVAL_AUTHORITY_INVALID'

  | 'COMMERCIAL_APPROVAL_GATE_BLOCKED'

  | 'CONTENT_NOT_PROVIDED';



export type RuntimeApprovalResult = {

  approved: boolean;

  contentFingerprint?: string;

  reason?: RuntimeApprovalReason;

  readinessCodes?: string[];

  approvalDetail?: string;

  subtopico?: string;

};



type DenialCacheEntry = {

  reason: RuntimeApprovalReason;

  approvalDetail?: string;

  readinessCodes?: string[];

  at: number;

};



/** Só negativas — aprovações não são cacheadas (revogação/registry). */

const denialCache = new Map<string, DenialCacheEntry>();

const DENIAL_CACHE_TTL_MS = 60_000;



/**
 * Gate RC-004 — opt-in explícito (merge ≠ rollout).
 * Ausente ou false/0/off → OFF (P0 denylist e gates estruturais continuam ativos).
 * true/1/on → ON (production_ready + ready_100 + fingerprint no runtime).
 */
export function isCommercialRuntimeReadinessGateEnabled(): boolean {
  const raw = process.env.COMMERCIAL_RUNTIME_READINESS_GATE?.trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'on';
}



export function resolveCommercialSubtopico(

  tituloAula: string | null | undefined,

  conteudoJson: unknown,

): string | null {

  const raw = conteudoJson as Record<string, unknown> | null;

  const payload = (unwrapCatalogPayload(raw) ?? raw) as Record<string, unknown> | null;

  const meta = payload?.meta as Record<string, unknown> | undefined;

  const fromMeta = typeof meta?.subtopico === 'string' ? meta.subtopico.trim() : '';

  if (fromMeta) return fromMeta;

  const title = tituloAula?.trim();

  return title || null;

}



function mapApprovalReason(

  reason: string,

): RuntimeApprovalReason {

  switch (reason) {

    case 'APPROVAL_UNBOUND':

      return 'COMMERCIAL_APPROVAL_NOT_BOUND';

    case 'APPROVAL_CONTENT_MISMATCH':

      return 'COMMERCIAL_APPROVAL_MISMATCH';

    case 'APPROVAL_REVOKED':

      return 'COMMERCIAL_APPROVAL_REVOKED';

    case 'APPROVAL_AUTHORITY_INVALID':

      return 'COMMERCIAL_APPROVAL_AUTHORITY_INVALID';

    case 'APPROVAL_GATE_BLOCKED':

      return 'COMMERCIAL_APPROVAL_GATE_BLOCKED';

    default:

      return 'READINESS_NOT_APPROVED';

  }

}



function buildDenialCacheKey(

  slug: string | null | undefined,

  fingerprint: string,

  authorityRevision: string,

): string {

  return `${slug ?? ''}:${fingerprint}:${authorityRevision}`;

}



export function evaluateCommercialRuntimeApproval(input: {

  slug?: string | null;

  tituloAula?: string | null;

  conteudoJson?: unknown;

}): RuntimeApprovalResult {

  if (!isCommercialRuntimeReadinessGateEnabled()) {

    return {

      approved: true,

      contentFingerprint: input.conteudoJson ? fingerprintConteudoJson(input.conteudoJson) : undefined,

    };

  }



  if (!input.conteudoJson) {

    return { approved: false, reason: 'CONTENT_NOT_PROVIDED' };

  }



  const subtopico = resolveCommercialSubtopico(input.tituloAula, input.conteudoJson);

  if (!subtopico) {

    return { approved: false, reason: 'SUBTOPIC_NOT_IN_REGISTRY' };

  }



  const registry = loadHandcraftRegistry();

  const found = findPacoteBySubtopico(registry, subtopico);

  if (!found) {

    return { approved: false, reason: 'SUBTOPIC_NOT_IN_REGISTRY', subtopico };

  }



  const authorityRevision = computeRegistryAuthorityRevision(found.key, found.pacote);

  const fingerprint = fingerprintConteudoJson(input.conteudoJson);

  const denialKey = buildDenialCacheKey(input.slug, fingerprint, authorityRevision);



  if (!canSell(found.pacote)) {

    denialCache.set(denialKey, {

      reason: 'SUBTOPIC_NOT_PRODUCTION_READY',

      at: Date.now(),

    });

    return { approved: false, reason: 'SUBTOPIC_NOT_PRODUCTION_READY', subtopico, contentFingerprint: fingerprint };

  }



  const cachedDenial = denialCache.get(denialKey);

  if (cachedDenial && Date.now() - cachedDenial.at < DENIAL_CACHE_TTL_MS) {

    return {

      approved: false,

      reason: cachedDenial.reason,

      contentFingerprint: fingerprint,

      subtopico,

      approvalDetail: cachedDenial.approvalDetail,

      readinessCodes: cachedDenial.readinessCodes,

    };

  }



  const payload = unwrapCatalogPayload(input.conteudoJson) ?? input.conteudoJson;

  const readiness = auditQuestaoReadiness(payload as never, {

    slug: input.slug ?? undefined,

    strict: true,

    strictV2Pedagogy: true,

    productionReady: true,

    autoApprovalEnabled: found.pacote.auto_approval?.enabled !== false,

  });



  if (!readiness.ready_100) {

    const codes = readiness.checks.filter((c) => c.severity === 'error').map((c) => c.code);

    denialCache.set(denialKey, {

      reason: 'READINESS_NOT_APPROVED',

      readinessCodes: codes.slice(0, 12),

      at: Date.now(),

    });

    return {

      approved: false,

      reason: 'READINESS_NOT_APPROVED',

      contentFingerprint: fingerprint,

      readinessCodes: codes.slice(0, 12),

      subtopico,

    };

  }



  if (!readiness.risk) {
    denialCache.set(denialKey, {
      reason: 'READINESS_NOT_APPROVED',
      at: Date.now(),
    });
    return {
      approved: false,
      reason: 'READINESS_NOT_APPROVED',
      contentFingerprint: fingerprint,
      subtopico,
    };
  }



  const approval = evaluateCommercialContentApproval(

    payload as never,

    fingerprint,

    readiness.risk,

  );



  if (!approval.approved) {

    const reason = mapApprovalReason(approval.reason ?? 'APPROVAL_UNBOUND');

    denialCache.set(denialKey, {

      reason,

      approvalDetail: approval.detail,

      at: Date.now(),

    });

    return {

      approved: false,

      reason,

      contentFingerprint: fingerprint,

      approvalDetail: approval.detail,

      subtopico,

    };

  }



  return { approved: true, contentFingerprint: fingerprint, subtopico };

}



export function clearCommercialRuntimeApprovalCache(): void {

  denialCache.clear();

}



/** Expõe tamanho do cache de negações (testes). */

export function getCommercialRuntimeDenialCacheSize(): number {

  return denialCache.size;

}


