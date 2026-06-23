/**
 * Cliente Gemini para geração de slides premium (Flash por padrão).
 * Reutiliza GOOGLE_API_KEY do projeto; modelo override via GOOGLE_GEMINI_SLIDES_MODEL.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

import { getGoogleApiKey } from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';
import { logger } from '@/lib/logger';

/** Flash — equilíbrio custo/qualidade para geração em lote. */
export const DEFAULT_GEMINI_SLIDES_MODEL = 'gemini-2.5-flash';

export function getGeminiSlidesModelId(): string {
  return (
    process.env.GOOGLE_GEMINI_SLIDES_MODEL?.trim() ||
    process.env.GOOGLE_GEMINI_MODEL?.trim() ||
    DEFAULT_GEMINI_SLIDES_MODEL
  );
}

export type GeminiUsage = {
  promptTokens: number;
  candidateTokens: number;
};

export type GeminiStructuredResult = {
  json: unknown;
  usage: GeminiUsage;
  raw: string;
  model: string;
};

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('429') || msg.toLowerCase().includes('quota');
}

function parseRetryDelayMs(message: string): number | null {
  const match = message.match(/retry in ([\d.]+)s/i);
  if (!match) return null;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.ceil(seconds * 1000) + 1000;
}

export async function generateStructuredJson(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxRetries?: number;
  apiKey?: string;
  modelId?: string;
}): Promise<GeminiStructuredResult> {
  const apiKey = opts.apiKey ?? getGoogleApiKey();
  if (!apiKey) {
    throw new Error(
      'GOOGLE_API_KEY ausente. Defina em .env.local (https://aistudio.google.com/apikey)',
    );
  }

  const modelId = opts.modelId ?? getGeminiSlidesModelId();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: opts.system,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: opts.temperature ?? 0.35,
    },
  });

  const maxRetries = opts.maxRetries ?? 3;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await model.generateContent(opts.user);
      const raw = res.response.text();
      const json = JSON.parse(raw) as unknown;
      return {
        json,
        raw,
        model: modelId,
        usage: {
          promptTokens: res.response.usageMetadata?.promptTokenCount ?? 0,
          candidateTokens: res.response.usageMetadata?.candidatesTokenCount ?? 0,
        },
      };
    } catch (err) {
      lastErr = err;
      if (attempt >= maxRetries) break;
      if (isRateLimitError(err)) {
        const delay =
          parseRetryDelayMs(err instanceof Error ? err.message : String(err)) ?? 5000 * (attempt + 1);
        logger.warn('Gemini rate limit — aguardando retry', { attempt, delay, model: modelId });
        await sleepMs(delay);
        continue;
      }
      logger.warn('Gemini call falhou', { attempt, model: modelId, error: String(err) });
      await sleepMs(1000 * (attempt + 1));
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
