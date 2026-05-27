import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import type { SimuladoAnswerInput, SimuladoCreateSessionInput } from '@/lib/validations';
import type {
  SimuladoAnswerResponse,
  SimuladoCreateSessionResponse,
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
