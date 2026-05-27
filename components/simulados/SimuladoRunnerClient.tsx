'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight, ClipboardList } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import {
  answerSimuladoQuestion,
  getSimuladoSession,
  SimuladoApiError,
} from '@/lib/simulado/client';
import type { SimuladoSessionDetailResponse } from '@/lib/simulado/types';
import type { LessonData } from '@/types/lesson';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SimuladoResumoClient } from '@/components/simulados/SimuladoResumoClient';
import { cn } from '@/lib/utils';

type QuestaoPlayerPayload = {
  dados: LessonData;
};

type FeedbackState = {
  acertou: boolean;
  opcao_correta_id: string;
  opcao_id: string;
} | null;

type SimuladoRunnerClientProps = {
  sessionId: string;
};

export function SimuladoRunnerClient({ sessionId }: SimuladoRunnerClientProps) {
  const [sessionData, setSessionData] = useState<SimuladoSessionDetailResponse | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  /** Slug da questão exibida — só avança em "Próxima questão", não no refetch pós-resposta. */
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const sessionInitialized = useRef(false);

  const [questionData, setQuestionData] = useState<LessonData | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const loadSession = useCallback(async () => {
    setLoadingSession(true);
    setSessionError(null);
    try {
      const data = await getSimuladoSession(sessionId);
      setSessionData(data);
      return data;
    } catch (err) {
      const message =
        err instanceof SimuladoApiError
          ? err.status === 404
            ? 'Sessão não encontrada.'
            : err.message
          : 'Erro ao carregar simulado.';
      setSessionError(message);
      return null;
    } finally {
      setLoadingSession(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const firstPendingSlug = useMemo(() => {
    if (!sessionData) return null;
    return sessionData.questoes.find((q) => !q.respondida)?.modulo_slug ?? null;
  }, [sessionData]);

  useEffect(() => {
    if (!sessionData || sessionData.session.status === 'concluido') return;
    if (sessionInitialized.current) return;
    if (!firstPendingSlug) return;
    sessionInitialized.current = true;
    setActiveSlug(firstPendingSlug);
  }, [sessionData, firstPendingSlug]);

  const activeItem = useMemo(() => {
    if (!sessionData || !activeSlug) return null;
    return sessionData.questoes.find((q) => q.modulo_slug === activeSlug) ?? null;
  }, [sessionData, activeSlug]);

  const progressPct = useMemo(() => {
    if (!sessionData?.session.total_questoes) return 0;
    return Math.round(
      (sessionData.resumo.respondidas / sessionData.session.total_questoes) * 100,
    );
  }, [sessionData]);

  const loadQuestion = useCallback(async (slug: string) => {
    setLoadingQuestion(true);
    setQuestionError(null);
    setQuestionData(null);
    setSelectedOption(null);
    setFeedback(null);
    setSubmitError(null);

    try {
      const res = await fetchWithAuth(`/api/estudar/questao?slug=${encodeURIComponent(slug)}`);
      const json = (await res.json()) as QuestaoPlayerPayload & { error?: string };
      if (!res.ok) {
        setQuestionError(json.error ?? 'Não foi possível carregar a questão.');
        return;
      }
      setQuestionData(json.dados);
    } catch {
      setQuestionError('Erro de rede ao carregar a questão.');
    } finally {
      setLoadingQuestion(false);
    }
  }, []);

  useEffect(() => {
    if (!activeSlug || sessionData?.session.status === 'concluido') return;
    void loadQuestion(activeSlug);
  }, [activeSlug, sessionData?.session.status, loadQuestion]);

  const handleConfirmAnswer = async () => {
    if (!activeItem || !activeSlug || !selectedOption || submitting || feedback) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await answerSimuladoQuestion({
        session_id: sessionId,
        modulo_slug: activeSlug,
        opcao_id: selectedOption,
      });

      setFeedback({
        acertou: result.acertou,
        opcao_correta_id: result.opcao_correta_id,
        opcao_id: selectedOption,
      });

      const refreshed = await getSimuladoSession(sessionId);
      setSessionData(refreshed);

      if (result.session_status === 'concluido') {
        return;
      }
    } catch (err) {
      setSubmitError(
        err instanceof SimuladoApiError ? err.message : 'Erro ao registrar resposta.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!sessionData || advancing) return;

    const nextSlug = sessionData.questoes.find((q) => !q.respondida)?.modulo_slug ?? null;
    if (!nextSlug) {
      const refreshed = await loadSession();
      if (refreshed?.session.status === 'concluido') return;
      return;
    }

    setAdvancing(true);
    try {
      setActiveSlug(nextSlug);
    } finally {
      setAdvancing(false);
    }
  };

  if (loadingSession && !sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#010409]">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" aria-label="Carregando simulado" />
      </div>
    );
  }

  if (sessionError || !sessionData) {
    return (
      <div className="min-h-screen bg-[#010409] px-4 pb-safe pt-6">
        <div className="mx-auto max-w-lg">
          <EmptyState
            icon={ClipboardList}
            title="Simulado indisponível"
            description={sessionError ?? 'Não foi possível carregar esta sessão.'}
            action={{
              label: 'Voltar para Simulados',
              onClick: () => {
                window.location.href = '/simulados';
              },
            }}
          />
        </div>
      </div>
    );
  }

  if (sessionData.session.status === 'concluido') {
    return (
      <SimuladoResumoClient
        session={sessionData.session}
        resumo={sessionData.resumo}
        questoes={sessionData.questoes}
      />
    );
  }

  const options = questionData?.question_data?.options ?? [];
  const instruction = questionData?.question_data?.instruction ?? '';
  const hasPending = sessionData.questoes.some((q) => !q.respondida);

  return (
    <div className="min-h-screen bg-[#010409] px-4 pb-safe pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Simulado em andamento"
          breadcrumb={[
            { label: 'Simulados', href: '/simulados' },
            { label: `Questão ${activeItem?.ordem ?? '—'}` },
          ]}
          description={`${sessionData.resumo.respondidas} de ${sessionData.session.total_questoes} respondidas`}
          descriptionClassName="text-sm text-slate-400 mt-1"
          titleClassName="text-xl font-[1000] italic tracking-tighter text-white sm:text-2xl"
        />

        <div
          className="h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do simulado"
        >
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {!activeSlug || !activeItem ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma questão pendente"
            description="Todas as questões foram respondidas."
            action={
              hasPending
                ? undefined
                : {
                    label: 'Atualizar',
                    onClick: () => void loadSession(),
                  }
            }
          />
        ) : loadingQuestion && !questionData ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" aria-label="Carregando questão" />
          </div>
        ) : questionError ? (
          <div className="glass-panel border border-rose-500/30 p-6 text-center">
            <p className="text-sm text-rose-300" role="alert">
              {questionError}
            </p>
            <Button
              type="button"
              className="mt-4"
              onClick={() => void loadQuestion(activeSlug)}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="glass-panel space-y-6 border border-white/10 p-6 sm:p-8">
            {activeItem.meta.banca && (
              <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">
                {activeItem.meta.banca}
                {activeItem.meta.topico ? ` · ${activeItem.meta.topico}` : ''}
              </p>
            )}

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{instruction}</p>

            <fieldset className="space-y-3" disabled={!!feedback || submitting}>
              <legend className="sr-only">Alternativas</legend>
              {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const showCorrect = feedback && feedback.opcao_correta_id === opt.id;
                const showWrong =
                  feedback && !feedback.acertou && feedback.opcao_id === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => !feedback && setSelectedOption(opt.id)}
                    className={cn(
                      'btn-option w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors',
                      isSelected && !feedback && 'border-cyan-500/50 bg-cyan-500/10',
                      showCorrect && 'border-emerald-500/50 bg-emerald-500/10',
                      showWrong && 'border-rose-500/50 bg-rose-500/10',
                      !isSelected && !showCorrect && !showWrong && 'border-white/10 bg-white/[0.03]',
                    )}
                    aria-pressed={isSelected}
                  >
                    <span className="mr-2 font-mono text-cyan-400/90">{opt.id})</span>
                    {opt.text}
                  </button>
                );
              })}
            </fieldset>

            <div aria-live="polite" className="min-h-[1.25rem]">
              {feedback && (
                <p
                  className={cn(
                    'text-sm font-medium',
                    feedback.acertou ? 'text-emerald-400' : 'text-rose-400',
                  )}
                >
                  {feedback.acertou ? 'Resposta correta!' : 'Resposta incorreta.'}
                  {!feedback.acertou && (
                    <span className="font-normal text-slate-400">
                      {' '}
                      Gabarito: {feedback.opcao_correta_id}
                    </span>
                  )}
                </p>
              )}
              {submitError && (
                <p className="text-sm text-rose-400" role="alert">
                  {submitError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {feedback ? (
                <Button
                  type="button"
                  disabled={advancing}
                  onClick={() => void handleNext()}
                  className="h-11 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                >
                  {advancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Carregando…
                    </>
                  ) : (
                    <>
                      Próxima questão
                      <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!selectedOption || submitting}
                  onClick={() => void handleConfirmAnswer()}
                  className="h-11 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Confirmando…
                    </>
                  ) : (
                    'Confirmar resposta'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-600">
          <Link href="/simulados" className="transition-colors hover:text-slate-400">
            Sair e voltar à configuração
          </Link>
        </p>
      </div>
    </div>
  );
}
