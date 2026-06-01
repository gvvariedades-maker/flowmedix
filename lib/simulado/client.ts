import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import type { SimuladoAnswerInput, SimuladoCreateSessionInput, SimuladoTemplateCreateInput } from '@/lib/validations';
import type {
  SimuladoAnswerResponse,
  SimuladoCreateSessionResponse,
  SimuladoOpenSessionResponse,
  SimuladoPoolCountResponse,
  SimuladoQuestaoPayloadResponse,
  SimuladoAnalyticsResponse,
  SimuladoHistoryResponse,
  SimuladoSessionDetailResponse,
  SimuladoTemplateCreateResponse,
  SimuladoTemplatesListResponse,
  SimuladoProvaEvolucaoResponse,
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

export async function iniciarSimuladoProva(
  sessionId: string,
): Promise<SimuladoSessionDetailResponse> {
  const res = await fetchWithAuth(`/api/simulado/sessions/${sessionId}/iniciar-prova`, {
    method: 'POST',
  });
  const json = await parseJsonResponse<SimuladoSessionDetailResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(res.status, json.error ?? 'Erro ao iniciar prova', json.details);
  }
  return json;
}

export async function finalizeSimuladoSession(
  sessionId: string,
): Promise<SimuladoSessionDetailResponse> {
  const res = await fetchWithAuth(`/api/simulado/sessions/${sessionId}/concluir`, {
    method: 'POST',
  });
  const json = await parseJsonResponse<SimuladoSessionDetailResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(res.status, json.error ?? 'Erro ao finalizar simulado', json.details);
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
  const json = await parseJsonResponse<SimuladoAnswerResponse & { limiteAtingido?: boolean; resetEm?: string }>(
    res,
  );
  if (!res.ok) {
    const details =
      json.details ??
      (json.limiteAtingido != null
        ? { limiteAtingido: json.limiteAtingido, resetEm: json.resetEm }
        : undefined);
    throw new SimuladoApiError(res.status, json.error ?? 'Erro ao registrar resposta', details);
  }
  return json;
}

export async function getSimuladoPoolCount(filters?: {
  bancas?: string[];
  assuntos?: string[];
  q?: string;
}): Promise<SimuladoPoolCountResponse> {
  const params = new URLSearchParams();
  filters?.bancas?.forEach((b) => params.append('bancas', b));
  filters?.assuntos?.forEach((a) => params.append('assuntos', a));
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
  init?: { signal?: AbortSignal },
): Promise<SimuladoQuestaoPayloadResponse> {
  const res = await fetchWithAuth(
    `/api/simulado/questao?slug=${encodeURIComponent(slug)}`,
    { signal: init?.signal },
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

export async function getSimuladoAnalytics(filters?: {
  periodo?: '1d' | '7d' | '30d' | '90d' | '12m';
  modo?: 'todos' | 'treino' | 'prova';
  banca?: string;
  topico?: string;
  subtopico?: string;
}): Promise<SimuladoAnalyticsResponse> {
  const params = new URLSearchParams();
  if (filters?.periodo) params.set('periodo', filters.periodo);
  if (filters?.modo) params.set('modo', filters.modo);
  if (filters?.banca) params.set('banca', filters.banca);
  if (filters?.topico) params.set('topico', filters.topico);
  if (filters?.subtopico) params.set('subtopico', filters.subtopico);
  const query = params.toString();
  const res = await fetchWithAuth(
    query ? `/api/simulado/analytics?${query}` : '/api/simulado/analytics',
  );
  const json = await parseJsonResponse<SimuladoAnalyticsResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao carregar analytics de simulados',
      json.details,
    );
  }
  return json;
}

export async function getSimuladoHistory(filters?: {
  periodo?: '1d' | '7d' | '30d' | '90d' | '12m';
  modo?: 'todos' | 'treino' | 'prova';
  banca?: string;
  topico?: string;
  subtopico?: string;
  status?: 'todos' | 'aberto' | 'concluido' | 'cancelado';
  page?: number;
  page_size?: number;
}): Promise<SimuladoHistoryResponse> {
  const params = new URLSearchParams();
  if (filters?.periodo) params.set('periodo', filters.periodo);
  if (filters?.modo) params.set('modo', filters.modo);
  if (filters?.banca) params.set('banca', filters.banca);
  if (filters?.topico) params.set('topico', filters.topico);
  if (filters?.subtopico) params.set('subtopico', filters.subtopico);
  if (filters?.status) params.set('status', filters.status);
  if (typeof filters?.page === 'number') params.set('page', String(filters.page));
  if (typeof filters?.page_size === 'number') params.set('page_size', String(filters.page_size));
  const query = params.toString();
  const res = await fetchWithAuth(
    query ? `/api/simulado/history?${query}` : '/api/simulado/history',
  );
  const json = await parseJsonResponse<SimuladoHistoryResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao carregar histórico de simulados',
      json.details,
    );
  }
  return json;
}

export async function listSimuladoTemplates(): Promise<SimuladoTemplatesListResponse> {
  const res = await fetchWithAuth('/api/simulado/templates');
  const json = await parseJsonResponse<SimuladoTemplatesListResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao carregar simulados salvos',
      json.details,
    );
  }
  return json;
}

export async function createSimuladoTemplate(
  body: SimuladoTemplateCreateInput,
): Promise<SimuladoTemplateCreateResponse> {
  const res = await fetchWithAuth('/api/simulado/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJsonResponse<SimuladoTemplateCreateResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao salvar configuração',
      json.details,
    );
  }
  return json;
}

export async function deleteSimuladoTemplate(templateId: string): Promise<void> {
  const res = await fetchWithAuth(`/api/simulado/templates/${templateId}`, {
    method: 'DELETE',
  });
  const json = await parseJsonResponse<{ success?: boolean; error?: string }>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao excluir simulado salvo',
      json.details,
    );
  }
}

export async function getSimuladoProvaEvolucao(
  titulo: string,
  limit = 5,
): Promise<SimuladoProvaEvolucaoResponse> {
  const params = new URLSearchParams({ titulo, limit: String(limit) });
  const res = await fetchWithAuth(`/api/simulado/evolucao?${params.toString()}`);
  const json = await parseJsonResponse<SimuladoProvaEvolucaoResponse>(res);
  if (!res.ok) {
    throw new SimuladoApiError(
      res.status,
      json.error ?? 'Erro ao carregar evolução',
      json.details,
    );
  }
  return json;
}
