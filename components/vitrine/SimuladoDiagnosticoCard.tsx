'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ClipboardCheck, Loader2 } from 'lucide-react';
import type { DiagnosticoSimuladoCardState } from '@/lib/simulado/types';
import { createDiagnosticoSimulado, SimuladoApiError } from '@/lib/simulado/client';
import {
  SIMULADO_DIAGNOSTICO_QUANTIDADE_DEFAULT,
  SIMULADO_DIAGNOSTICO_TITULO,
} from '@/lib/simulado/diagnosticoConstants';

export type SimuladoDiagnosticoCardProps = {
  state: DiagnosticoSimuladoCardState;
};

export function SimuladoDiagnosticoCard({ state }: SimuladoDiagnosticoCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state.show_card) return null;

  const isResume = state.has_open_session && state.session != null;
  const questaoCount = state.session?.total_questoes ?? SIMULADO_DIAGNOSTICO_QUANTIDADE_DEFAULT;

  const handleStart = async () => {
    if (isResume && state.session) {
      router.push(`/simulados/${state.session.id}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createDiagnosticoSimulado();
      router.push(`/simulados/${result.session.id}`);
    } catch (err) {
      if (err instanceof SimuladoApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível iniciar o simulado diagnóstico. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="simulado-diagnostico-card"
      className="flex flex-col gap-3 rounded-r-2xl border border-cyan-200 border-l-[#00b8d4] bg-gradient-to-r from-cyan-50 via-sky-50 to-white px-4 py-4 [border-left-width:4px] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-100/80 text-cyan-700"
            aria-hidden
          >
            <ClipboardCheck size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
            {isResume ? 'Simulado em andamento' : 'Boas-vindas ao AVANT'}
          </p>
        </div>
        <p className="mt-2 text-sm font-bold leading-snug text-slate-900">
          {isResume
            ? `Continue seu ${SIMULADO_DIAGNOSTICO_TITULO}`
            : 'Inicie seu Simulado Diagnóstico e descubra o seu nível atual'}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {isResume
            ? `${questaoCount} questões personalizadas com base no seu perfil de estudo.`
            : 'Questões balanceadas pelas suas preferências e pelo motor adaptativo — leva cerca de 20 min.'}
        </p>
        {error ? (
          <p className="mt-2 text-xs font-medium text-rose-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#00b8d4] px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70 sm:self-auto"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Preparando…
          </>
        ) : (
          <>
            {isResume ? 'Continuar simulado' : 'Iniciar diagnóstico'}
            <ArrowRight size={16} aria-hidden />
          </>
        )}
      </button>
    </div>
  );
}

export default SimuladoDiagnosticoCard;
