'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { getSimuladoSession, SimuladoApiError } from '@/lib/simulado/client';
import { applyAnswerPatch } from '@/lib/simulado/applyAnswerPatch';
import type { SimuladoAnswerResponse, SimuladoSessionDetailResponse } from '@/lib/simulado/types';

type SessionState = {
  data: SimuladoSessionDetailResponse | null;
  loading: boolean;
  error: string | null;
};

type SessionAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: SimuladoSessionDetailResponse }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'SET_SESSION'; payload: SimuladoSessionDetailResponse }
  | { type: 'PATCH_ANSWER'; payload: SimuladoAnswerResponse };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_SESSION':
      return { ...state, data: action.payload, loading: false, error: null };
    case 'PATCH_ANSWER': {
      if (!state.data) return state;
      return {
        ...state,
        data: applyAnswerPatch(state.data, action.payload),
      };
    }
    default:
      return state;
  }
}

function resolveSessionError(err: unknown): string {
  if (err instanceof SimuladoApiError) {
    return err.status === 404 ? 'Sessão não encontrada.' : err.message;
  }
  return 'Erro ao carregar simulado.';
}

export type UseSimuladoSessionOptions = {
  sessionId: string;
  initialSession?: SimuladoSessionDetailResponse | null;
  skipInitialLoad?: boolean;
};

export function useSimuladoSession({
  sessionId,
  initialSession = null,
  skipInitialLoad = false,
}: UseSimuladoSessionOptions) {
  const [state, dispatch] = useReducer(sessionReducer, {
    data: initialSession,
    loading: !initialSession,
    error: null,
  });

  const skipFirstLoad = useRef(Boolean(initialSession && skipInitialLoad));

  const loadSession = useCallback(async (): Promise<SimuladoSessionDetailResponse | null> => {
    dispatch({ type: 'LOAD_START' });
    try {
      const data = await getSimuladoSession(sessionId);
      dispatch({ type: 'LOAD_SUCCESS', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR', payload: resolveSessionError(err) });
      return null;
    }
  }, [sessionId]);

  const applyAnswerPatchToSession = useCallback((answer: SimuladoAnswerResponse) => {
    dispatch({ type: 'PATCH_ANSWER', payload: answer });
  }, []);

  const setSession = useCallback((data: SimuladoSessionDetailResponse) => {
    dispatch({ type: 'SET_SESSION', payload: data });
  }, []);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    void loadSession();
  }, [loadSession]);

  return {
    sessionData: state.data,
    loadingSession: state.loading,
    sessionError: state.error,
    loadSession,
    applyAnswerPatchToSession,
    setSession,
  };
}
