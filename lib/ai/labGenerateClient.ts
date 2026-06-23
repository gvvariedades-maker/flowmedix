export type AiGenerateResult = {
  status: 'approved' | 'needs_review' | 'failed';
  score: number;
  issues: string[];
  questao: Record<string, unknown>;
};

export type SlideGenerationApiResponse = AiGenerateResult & {
  attempts?: number;
  model?: string;
};

export async function requestLabSlideGeneration(body: {
  questao?: unknown;
  meta?: unknown;
  question_data?: unknown;
  maxAttempts?: number;
}): Promise<SlideGenerationApiResponse> {
  const res = await fetch('/api/admin/generate-slides', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const detail =
      typeof data.error === 'string'
        ? data.error
        : 'Falha na geração';
    throw new Error(detail);
  }

  return {
    status: data.status,
    score: data.score,
    issues: data.issues ?? [],
    questao: data.questao,
    attempts: data.attempts,
    model: data.model,
  };
}
