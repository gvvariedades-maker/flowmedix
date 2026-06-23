/**
 * POST /api/admin/generate-slides
 * Gera NeuroSlides via Gemini + write spec (admin autenticado).
 * Não grava no Supabase — devolve JSON para o editor do Laboratório.
 *
 * Body:
 * - `{ questao: QuestaoCompleta | parcial, maxAttempts? }` — a partir do JSON aberto no Lab
 * - `{ meta, question_data, maxAttempts? }` — formulário manual do Agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { generateSlidesForQuestao } from '@/lib/ai';
import { extractLabGenerateInput } from '@/lib/ai/labGenerateInput';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

const GenerateBodySchema = z.object({
  meta: z.object({
    banca: z.string().min(1),
    topico: z.string().min(1),
    subtopico: z.string().optional(),
    ano: z.string().optional(),
    orgao: z.string().optional(),
    prova: z.string().optional(),
    cargo_header: z.string().optional(),
    header_line: z.string().max(500).optional(),
  }),
  question_data: z.object({
    instruction: z.string().min(10),
    text_fragment: z.string().optional(),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          text: z.string().min(1),
          is_correct: z.boolean(),
        }),
      )
      .min(2)
      .max(10),
  }),
  maxAttempts: z.number().int().min(1).max(3).optional(),
});

const GenerateFromQuestaoSchema = z.object({
  questao: z.unknown(),
  maxAttempts: z.number().int().min(1).max(3).optional(),
});

function resolveGeneratePayload(body: unknown):
  | { ok: true; questao: Record<string, unknown>; maxAttempts: number }
  | { ok: false; error: string; status: number } {
  const fromQuestao = GenerateFromQuestaoSchema.safeParse(body);
  if (fromQuestao.success) {
    const extracted = extractLabGenerateInput(fromQuestao.data.questao);
    if (!extracted.ok) {
      return { ok: false, error: extracted.error, status: 400 };
    }
    return {
      ok: true,
      questao: extracted.questao as Record<string, unknown>,
      maxAttempts: fromQuestao.data.maxAttempts ?? 3,
    };
  }

  const minimal = GenerateBodySchema.safeParse(body);
  if (!minimal.success) {
    return {
      ok: false,
      error: 'Payload inválido — envie { questao } ou { meta, question_data }',
      status: 400,
    };
  }

  return {
    ok: true,
    questao: minimal.data as Record<string, unknown>,
    maxAttempts: minimal.data.maxAttempts ?? 3,
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const resolved = resolveGeneratePayload(body);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { questao, maxAttempts } = resolved;
  const slugTemp = `lab-${Date.now()}`;

  try {
    const outcome = await generateSlidesForQuestao(slugTemp, questao, {
      maxAttempts,
      dryRun: true,
    });

    const meta = questao.meta as Record<string, unknown> | undefined;
    const fullQuestao =
      outcome.payload ??
      ({
        ...questao,
        meta: {
          ...(meta ?? {}),
          subtopico:
            (typeof meta?.subtopico === 'string' && meta.subtopico) ||
            (typeof meta?.topico === 'string' && meta.topico) ||
            'Geral',
        },
        reverse_study_slides: [],
      } as Record<string, unknown>);

    logger.info('Laboratório: slides gerados via IA', {
      email: auth.email,
      status: outcome.status,
      score: outcome.score,
      attempts: outcome.attempts,
    });

    return NextResponse.json({
      status: outcome.status,
      score: outcome.score,
      attempts: outcome.attempts,
      issues: outcome.issues,
      model: outcome.model,
      usage: outcome.usage,
      questao: fullQuestao,
    });
  } catch (err) {
    logger.error('Falha na geração de slides via Laboratório', err, { slug: slugTemp });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro na geração' },
      { status: 500 },
    );
  }
}
