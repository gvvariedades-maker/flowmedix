import { classifyFamily } from '@/lib/catalogMigration/classifyFamily';
import { isPremiumSubtopico } from '@/lib/catalogMigration/premiumGate';
import { validateQuestaoForWrite } from '@/lib/questaoSpec';

import { enrichQuestaoGoldenMeta } from './enrichGoldenMeta';
import { scoreConfidence } from './confidenceScore';
import { runFactCheck } from './factCheck';
import { generateStructuredJson } from './geminiClient';
import { normalizeAiSlides } from './normalizeAiSlides';
import {
  buildCorrectionAppendix,
  buildSystemPrompt,
  buildUserPrompt,
} from './promptBuilder';
import { extractSlidesFromModelJson } from './responseSchema';
import {
  getExemplar,
  getGuidelineForSubtopico,
  getMoldeSummary,
} from './retrieval';

export type GenerationStatus = 'approved' | 'needs_review' | 'failed';

export type GenerationOutcome = {
  slug: string;
  status: GenerationStatus;
  attempts: number;
  score: number;
  model: string;
  payload?: Record<string, unknown>;
  issues: string[];
  usage: { promptTokens: number; candidateTokens: number };
};

type QuestaoLike = {
  meta?: {
    topico?: string;
    subtopico?: string;
    banca?: string;
  };
  question_data?: {
    instruction?: string;
    options?: { id: string; text: string; is_correct: boolean }[];
    text_fragment?: string;
  };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
};

export type GenerateSlidesOptions = {
  maxAttempts?: number;
  apiKey?: string;
  modelId?: string;
  dryRun?: boolean;
};

export async function generateSlidesForQuestao(
  slug: string,
  questaoRaw: unknown,
  options: GenerateSlidesOptions = {},
): Promise<GenerationOutcome> {
  const questao = questaoRaw as QuestaoLike;
  const qd = questao.question_data;
  const instruction = qd?.instruction?.trim() ?? '';
  const optionsList = qd?.options ?? [];
  const textFragment = qd?.text_fragment ?? '';
  const subtopico = questao.meta?.subtopico?.trim() || questao.meta?.topico?.trim() || 'Geral';
  const topico = questao.meta?.topico?.trim() || 'Enfermagem';

  if (!instruction || optionsList.length === 0) {
    return {
      slug,
      status: 'failed',
      attempts: 0,
      score: 0,
      model: options.modelId ?? '',
      issues: ['questão sem instruction ou options'],
      usage: { promptTokens: 0, candidateTokens: 0 },
    };
  }

  const family = classifyFamily(instruction, subtopico, optionsList, textFragment);
  const guideline = getGuidelineForSubtopico(subtopico);
  const exemplar = getExemplar(subtopico, family);
  const moldeSummary = getMoldeSummary(subtopico);
  const premiumSubtopico = isPremiumSubtopico(subtopico);

  const system = buildSystemPrompt();
  const maxAttempts = options.maxAttempts ?? 3;
  let feedback = '';
  let lastIssues: string[] = [];
  let lastCandidate: Record<string, unknown> | undefined;
  let totalUsage = { promptTokens: 0, candidateTokens: 0 };
  let lastModel = options.modelId ?? '';

  const finalizePayload = (raw: Record<string, unknown>): Record<string, unknown> =>
    enrichQuestaoGoldenMeta(raw, { subtopico, family, guideline });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const user =
      buildUserPrompt({
        questao: { instruction, options: optionsList, text_fragment: textFragment },
        subtopico,
        topico,
        family,
        guideline,
        moldeSummary,
        exemplar,
      }) + (feedback ? buildCorrectionAppendix(lastIssues) : '');

    let result: Awaited<ReturnType<typeof generateStructuredJson>>;
    try {
      result = await generateStructuredJson({
        system,
        user,
        apiKey: options.apiKey,
        modelId: options.modelId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        slug,
        status: 'failed',
        attempts: attempt,
        score: 0,
        model: lastModel,
        issues: [`gemini: ${msg}`],
        usage: totalUsage,
      };
    }

    lastModel = result.model;
    totalUsage.promptTokens += result.usage.promptTokens;
    totalUsage.candidateTokens += result.usage.candidateTokens;

    const slides = extractSlidesFromModelJson(result.json);
    if (!slides || slides.length === 0) {
      lastIssues = ['resposta sem reverse_study_slides válido'];
      feedback = 'retry';
      continue;
    }

    const normalizedSlides = normalizeAiSlides(slides);
    const questionCorpus = [instruction, textFragment, ...optionsList.map((o) => o.text)].join(' ');

    const candidate: Record<string, unknown> = {
      ...(questao as Record<string, unknown>),
      meta: { ...questao.meta, subtopico, topico },
      question_data: questao.question_data,
      reverse_study_slides: normalizedSlides,
    };
    delete candidate.study_slides;

    const spec = validateQuestaoForWrite(candidate, { premiumGate: true, goldenLint: true });
    const fact = runFactCheck(normalizedSlides, guideline, { allowedText: questionCorpus });

    const issues = [
      ...(spec.ok ? [] : spec.errors.map((e) => `${e.layer}/${e.code}: ${e.message}`)),
      ...fact.violations,
    ];

    if (issues.length === 0) {
      const warnings = spec.ok ? spec.warnings.length : 0;
      return {
        slug,
        status: 'approved',
        attempts: attempt,
        score: scoreConfidence({
          attempts: attempt,
          family,
          guideline,
          factViolations: 0,
          writeWarnings: warnings,
          premiumSubtopico,
        }),
        model: result.model,
        payload: finalizePayload(
          (spec.ok ? (spec.data as Record<string, unknown>) : candidate) as Record<string, unknown>,
        ),
        issues: [],
        usage: totalUsage,
      };
    }

    lastIssues = issues;
    const rawCandidate = spec.ok ? (spec.data as Record<string, unknown>) : candidate;
    lastCandidate = finalizePayload(rawCandidate);
    feedback = 'retry';
  }

  return {
    slug,
    status: 'needs_review',
    attempts: maxAttempts,
    score: scoreConfidence({
      attempts: maxAttempts,
      family,
      guideline,
      factViolations: lastIssues.filter((i) => i.startsWith('factcheck')).length,
      writeWarnings: 0,
      premiumSubtopico,
    }),
    model: lastModel,
    payload: lastCandidate,
    issues: lastIssues,
    usage: totalUsage,
  };
}
