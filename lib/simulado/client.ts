import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import type { SimuladoAnswerInput, SimuladoCreateSessionInput } from '@/lib/validations';
import type {
  SimuladoAnswerResponse,
  SimuladoCreateSessionResponse,
  SimuladoOpenSessionResponse,
  SimuladoPoolCountResponse,
  SimuladoQuestaoPayloadResponse,
  SimuladoSessionDetailResponse,
} from '@/lib/simulado/types';

export class SimuladoApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'SimuladoApiError';
    this.status = status;
    this.details = details;
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T & { error?: string; details?: unknown }> {
  return res.json() as Promise<T & { error?: string; details?: unknown }>;
}

export async function createSimuladoSession(
  body: SimuladoCreateSessionInput,
): Promise<SimuladoCreateSessionResponse> {
  const res = await fetchWithAuth('/api/simulado/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJsonResponse<SimuladoCreateSessionResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(res.status, json.error ?? 'Erro ao criar simulado', json.details);
  }
  return json;
}

export async function getOpenSimuladoSession(): Promise<SimuladoOpenSessionResponse> {
  const res = await fetchWithAuth('/api/simulado/sessions');
  const json = await parseJsonResponse<SimuladoOpenSessionResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao verificar sessão aberta',
      json.details,
    );
  }
  return json;
}

export async function getSimuladoSession(sessionId: string): Promise<SimuladoSessionDetailResponse> {
  const res = await fetchWithAuth(`/api/simulado/sessions/${sessionId}`);
  const json = await parseJsonResponse<SimuladoSessionDetailResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(res.status, json.error ?? 'Erro ao carregar simulado', json.details);
  }
  return json;
}

export async function answerSimuladoQuestion(
  body: SimuladoAnswerInput,
): Promise<SimuladoAnswerResponse> {
  const res = await fetchWithAuth('/api/simulado/responder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJsonResponse<SimuladoAnswerResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(res.status, json.error ?? 'Erro ao registrar resposta', json.details);
  }
  return json;
}

export async function getSimuladoPoolCount(filters?: {
  banca?: string;
  assunto?: string;
  q?: string;
}): Promise<SimuladoPoolCountResponse> {
  const params = new URLSearchParams();
  if (filters?.banca) params.set('banca', filters.banca);
  if (filters?.assunto) params.set('assunto', filters.assunto);
  if (filters?.q) params.set('q', filters.q);

  const query = params.toString();
  const res = await fetchWithAuth(query ? `/api/simulado/pool-count?${query}` : '/api/simulado/pool-count');
  const json = await parseJsonResponse<SimuladoPoolCountResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao estimar pool de questões',
      json.details,
    );
  }
  return json;
}

export async function getSimuladoQuestionPayload(
  slug: string,
): Promise<SimuladoQuestaoPayloadResponse> {
  const res = await fetchWithAuth(
    `/api/estudar/questao?slug=${encodeURIComponent(slug)}&context=simulado`,
  );
  const json = await parseJsonResponse<SimuladoQuestaoPayloadResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Não foi possível carregar a questão.',
      json.details,
    );
  }
  return json;
}
