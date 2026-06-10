import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
} from '@/lib/validations';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';
import { isCanonicalSubtopico } from '@/lib/catalogMigration/canonicalSubtopicos';
import { resolveCanonicalSubtopico } from '@/lib/catalogMigration/legacySubtopicoMap';

export type ReclassifySubtopicoResult = {
  changed: boolean;
  skipReason?: string;
  fromLabel: string | null;
  toLabel?: string;
  tier?: 'alias' | 'best_fit';
  payload: unknown;
  zodValid: boolean;
  zodMessage?: string;
  tecconcursos: boolean;
};

function clonePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {};
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
}

export function applySubtopicoLabelToPayload(
  raw: unknown,
  toLabel: string,
  fromLabel?: string | null,
): ReclassifySubtopicoResult {
  const from = fromLabel?.trim() ?? null;
  const to = toLabel.trim();

  if (!to) {
    return {
      changed: false,
      skipReason: 'destino vazio',
      fromLabel: from,
      payload: raw,
      zodValid: false,
      tecconcursos: payloadContainsTecconcursosReference(raw),
    };
  }

  if (!isCanonicalSubtopico(to)) {
    return {
      changed: false,
      skipReason: 'destino não canônico',
      fromLabel: from,
      toLabel: to,
      payload: raw,
      zodValid: false,
      tecconcursos: payloadContainsTecconcursosReference(raw),
    };
  }

  if (from === to) {
    return {
      changed: false,
      skipReason: 'mesmo subtópico',
      fromLabel: from,
      toLabel: to,
      payload: raw,
      zodValid: QuestaoCompletaSchema.safeParse(normalizeQuestaoSlideArrays(raw)).success,
      tecconcursos: payloadContainsTecconcursosReference(raw),
    };
  }

  const base = clonePayload(raw);
  const meta = (base.meta ?? {}) as Record<string, unknown>;
  meta.subtopico = to;
  base.meta = meta;

  updateSlideSubtopicos(base.reverse_study_slides, to);
  updateSlideSubtopicos(base.study_slides, to);

  const normalized = normalizeQuestaoSlideArrays(base);
  const tecconcursos = payloadContainsTecconcursosReference(normalized);
  const parsed = QuestaoCompletaSchema.safeParse(normalized);

  return {
    changed: true,
    fromLabel: from,
    toLabel: to,
    payload: normalized,
    zodValid: parsed.success && !tecconcursos,
    zodMessage: parsed.success
      ? tecconcursos
        ? 'referência TecConcursos'
        : undefined
      : parsed.error.issues
          .slice(0, 2)
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
    tecconcursos,
  };
}

function updateSlideSubtopicos(slides: unknown, canonical: string): void {
  if (!Array.isArray(slides)) return;
  for (const slide of slides) {
    if (!slide || typeof slide !== 'object') continue;
    const rec = slide as Record<string, unknown>;
    const meta =
      rec.meta && typeof rec.meta === 'object' && !Array.isArray(rec.meta)
        ? (rec.meta as Record<string, unknown>)
        : {};
    meta.subtopico = canonical;
    rec.meta = meta;
  }
}

export function reclassifySubtopicoPayload(
  raw: unknown,
  tituloAula: string | null | undefined,
): ReclassifySubtopicoResult {
  const fromLabel = tituloAula?.trim() ?? null;
  const mapping = resolveCanonicalSubtopico(fromLabel);

  if (!fromLabel) {
    return {
      changed: false,
      skipReason: 'sem titulo_aula',
      fromLabel,
      payload: raw,
      zodValid: false,
      tecconcursos: payloadContainsTecconcursosReference(raw),
    };
  }

  if (isCanonicalSubtopico(fromLabel)) {
    return {
      changed: false,
      skipReason: 'já canônico',
      fromLabel,
      payload: raw,
      zodValid: QuestaoCompletaSchema.safeParse(normalizeQuestaoSlideArrays(raw)).success,
      tecconcursos: payloadContainsTecconcursosReference(raw),
    };
  }

  if (!mapping) {
    return {
      changed: false,
      skipReason: 'sem mapeamento legado',
      fromLabel,
      payload: raw,
      zodValid: QuestaoCompletaSchema.safeParse(normalizeQuestaoSlideArrays(raw)).success,
      tecconcursos: payloadContainsTecconcursosReference(raw),
    };
  }

  const result = applySubtopicoLabelToPayload(raw, mapping.canonical, fromLabel);
  return { ...result, tier: mapping.tier };
}
