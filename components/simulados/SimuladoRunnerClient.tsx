'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, ClipboardList } from 'lucide-react';
import {
  answerSimuladoQuestion,
  getSimuladoQuestionPayload,
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
import { sanitizeHTML } from '@/lib/validations';
import {
  buildDerivedQuestionHeaderLine,
  buildQuestionSubjectLine,
  stripLeadingQuestionEnumeration,
} from '@/lib/questionHeader';

type FeedbackState = {
  acertou: boolean;
  opcao_correta_id: string;
  opcao_correta_texto: string | null;
  opcao_id: string;
} | null;

type SimuladoRunnerClientProps = {
  sessionId: string;
};

export function SimuladoRunnerClient({ sessionId }: SimuladoRunnerClientProps) {
  const router = useRouter();
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
  const [finalFeedbackPending, setFinalFeedbackPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [liveMessage, setLiveMessage] = useState('');
  const optionsGroupRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!activeItem || !activeItem.respondida) return;
    setSelectedOption(activeItem.opcao_id);
  }, [activeItem]);

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
    setFinalFeedbackPending(false);
    setSubmitError(null);
    setLiveMessage('');

    try {
      const json = await getSimuladoQuestionPayload(slug);
      setQuestionData(json.dados);
    } catch (err) {
      setQuestionError(
        err instanceof SimuladoApiError ? err.message : 'Erro de rede ao carregar a questão.',
      );
    } finally {
      setLoadingQuestion(false);
    }
  }, []);

  useEffect(() => {
    if (!activeSlug || sessionData?.session.status === 'concluido') return;
    setQuestionStartedAt(Date.now());
    void loadQuestion(activeSlug);
  }, [activeSlug, sessionData?.session.status, loadQuestion]);

  const isTreino = sessionData?.session.modo === 'treino';

  const handleConfirmAnswer = async () => {
    if (!activeItem || !activeSlug || !selectedOption || submitting || feedback) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await answerSimuladoQuestion({
        session_id: sessionId,
        modulo_slug: activeSlug,
        opcao_id: selectedOption,
        tempo_ms: Math.max(0, Date.now() - questionStartedAt),
      });

      if (isTreino && result.acertou !== null && result.opcao_correta_id) {
        const correctOption = options.find((opt) => opt.id === result.opcao_correta_id);
        setFeedback({
          acertou: result.acertou,
          opcao_correta_id: result.opcao_correta_id,
          opcao_correta_texto: correctOption?.text ?? null,
          opcao_id: selectedOption,
        });
        setLiveMessage(
          result.acertou
            ? 'Resposta correta confirmada.'
            : `Resposta incorreta. Gabarito ${result.opcao_correta_id}${correctOption?.text ? `: ${correctOption.text}` : ''}.`,
        );
      } else {
        setFeedback(null);
        setLiveMessage('Resposta registrada. Gabarito disponível no resumo final.');
      }

      const refreshed = await getSimuladoSession(sessionId);
      setSessionData(refreshed);
      setFinalFeedbackPending(result.session_status === 'concluido' && isTreino);

      if (result.session_status === 'concluido') {
        return;
      }
      if (!isTreino) {
        const nextSlug = refreshed.questoes.find((q) => !q.respondida)?.modulo_slug ?? null;
        if (nextSlug) setActiveSlug(nextSlug);
      }
    } catch (err) {
      setSubmitError(
        err instanceof SimuladoApiError ? err.message : 'Erro ao registrar resposta.',
      );
      setLiveMessage('Erro ao registrar resposta. Tente novamente.');
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
      const nextItem = sessionData.questoes.find((q) => q.modulo_slug === nextSlug);
      if (nextItem?.ordem) {
        setLiveMessage(`Questão ${nextItem.ordem} carregada.`);
      } else {
        setLiveMessage('Próxima questão carregada.');
      }
    } finally {
      setAdvancing(false);
    }
  };

  const options = questionData?.question_data?.options ?? [];
  const isAnswerLocked = submitting || (!isTreino && !!activeItem?.respondida);
  const canConfirm = !!selectedOption && !submitting && !isAnswerLocked;
  const canAdvance = !!feedback && !advancing;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!questionData || loadingQuestion || submitting) return;
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTypingTarget) return;

      const key = event.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        const optionExists = options.some((opt) => opt.id.toUpperCase() === key);
        if (optionExists) {
          event.preventDefault();
          setSelectedOption(key);
          setLiveMessage(`Alternativa ${key} selecionada.`);
        }
      }

      if (event.key === 'Enter' && selectedOption && !feedback) {
        event.preventDefault();
        void handleConfirmAnswer();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [questionData, loadingQuestion, submitting, options, selectedOption, feedback]);

  const handleOptionsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!options.length || feedback || isAnswerLocked) return;
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const currentIndex = options.findIndex((opt) => opt.id === selectedOption);
    const nextIndex =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? (currentIndex + 1 + options.length) % options.length
        : (currentIndex - 1 + options.length) % options.length;
    const nextOption = options[nextIndex];
    if (!nextOption) return;
    setSelectedOption(nextOption.id);
    setLiveMessage(`Alternativa ${nextOption.id} selecionada.`);
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
                router.push('/simulados');
              },
            }}
          />
        </div>
      </div>
    );
  }

  if (sessionData.session.status === 'concluido' && !finalFeedbackPending) {
    return (
      <SimuladoResumoClient
        session={sessionData.session}
        resumo={sessionData.resumo}
        questoes={sessionData.questoes}
      />
    );
  }

  const examHeaderLine = questionData?.meta
    ? (questionData.meta.header_line?.trim() || buildDerivedQuestionHeaderLine(questionData.meta))
    : activeItem?.meta.banca ?? '';
  const subjectLine = questionData?.meta ? buildQuestionSubjectLine(questionData.meta) : null;
  const textFragment = questionData?.question_data?.text_fragment ?? '';
  const instruction = stripLeadingQuestionEnumeration(questionData?.question_data?.instruction ?? '');
  const hasPending = sessionData.questoes.some((q) => !q.respondida);
  const showFinalFeedbackCta = finalFeedbackPending && !!feedback && !hasPending;

  return (
    <div className="min-h-screen bg-[#010409] px-4 pb-[8.5rem] pt-6 sm:px-6 sm:pb-safe lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Simulado em andamento"
          breadcrumb={[
            { label: 'Simulados', href: '/simulados' },
            { label: `Questão ${activeItem?.ordem ?? '—'}` },
          ]}
          description={`${sessionData.resumo.respondidas} de ${sessionData.session.total_questoes} respondidas · ordem aleatória`}
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

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Mapa de questões
          </p>
          <div className="flex flex-wrap gap-2">
            {sessionData.questoes.map((item) => (
              <button
                key={`${item.ordem}-${item.modulo_slug}`}
                type="button"
                onClick={() => setActiveSlug(item.modulo_slug)}
                className={cn(
                  'h-8 min-w-8 rounded-lg border px-2 text-xs font-semibold',
                  activeSlug === item.modulo_slug
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                    : item.respondida
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/10 bg-white/[0.03] text-slate-300',
                )}
              >
                {item.ordem}
              </button>
            ))}
          </div>
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
            {examHeaderLine && (
              <div className="space-y-2 border-b border-white/10 pb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">
                  {examHeaderLine}
                </p>
                {subjectLine && <p className="text-sm font-semibold text-slate-100">{subjectLine}</p>}
              </div>
            )}

            {textFragment && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm italic text-slate-300">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(textFragment) }} />
              </div>
            )}

            <div className="text-sm leading-relaxed text-slate-200 [&_p]:mb-2 [&_p:last-child]:mb-0">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(instruction) }} />
            </div>

            <fieldset className="space-y-3" disabled={isAnswerLocked}>
              <legend className="sr-only">Alternativas</legend>
              <div
                ref={optionsGroupRef}
                className="space-y-3"
                role="radiogroup"
                aria-label="Alternativas da questão"
                onKeyDown={handleOptionsKeyDown}
              >
                {options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const showCorrect = feedback && feedback.opcao_correta_id === opt.id;
                  const showWrong =
                    feedback && !feedback.acertou && feedback.opcao_id === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (feedback) return;
                        setSelectedOption(opt.id);
                        setLiveMessage(`Alternativa ${opt.id} selecionada.`);
                      }}
                      className={cn(
                        'btn-option w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#010409]',
                        isSelected && !feedback && 'border-cyan-500/50 bg-cyan-500/10',
                        showCorrect && 'border-emerald-500/50 bg-emerald-500/10',
                        showWrong && 'border-rose-500/50 bg-rose-500/10',
                        !isSelected && !showCorrect && !showWrong && 'border-white/10 bg-white/[0.03]',
                      )}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <span className="mr-2 font-mono text-cyan-400/90">{opt.id})</span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div aria-live="polite" aria-atomic="true" className="min-h-[1.25rem]">
              <p className="sr-only">{liveMessage}</p>
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
                      {feedback.opcao_correta_texto ? ` — ${feedback.opcao_correta_texto}` : ''}
                    </span>
                  )}
                </p>
              )}
              {!isTreino && !feedback && activeItem?.respondida && (
                <p className="text-sm font-medium text-emerald-400">
                  Resposta registrada. Gabarito disponível no resumo final.
                </p>
              )}
              {submitError && (
                <p className="text-sm text-rose-400" role="alert">
                  {submitError}
                </p>
              )}
            </div>

            <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:justify-end">
              {feedback ? (
                <Button
                  type="button"
                  disabled={advancing}
                  onClick={() => {
                    if (showFinalFeedbackCta) {
                      setFinalFeedbackPending(false);
                      return;
                    }
                    void handleNext();
                  }}
                  className="h-11 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                >
                  {advancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Carregando…
                    </>
                  ) : (
                    <>
                      {showFinalFeedbackCta ? 'Ver resultado' : 'Próxima questão'}
                      <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!canConfirm}
                  onClick={() => void handleConfirmAnswer()}
                  className="h-11 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Confirmando…
                    </>
                  ) : (
                    activeItem?.respondida && isTreino ? 'Atualizar resposta' : 'Confirmar resposta'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {!loadingQuestion && !questionError && activeSlug && activeItem && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#010409]/95 p-4 pb-safe backdrop-blur supports-[backdrop-filter]:bg-[#010409]/80 sm:hidden">
            {feedback ? (
              <Button
                type="button"
                disabled={!canAdvance}
                onClick={() => {
                  if (showFinalFeedbackCta) {
                    setFinalFeedbackPending(false);
                    return;
                  }
                  void handleNext();
                }}
                className="h-12 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
              >
                {advancing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Carregando…
                  </>
                ) : (
                  <>
                    {showFinalFeedbackCta ? 'Ver resultado' : 'Próxima questão'}
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!canConfirm}
                onClick={() => void handleConfirmAnswer()}
                className="h-12 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Confirmando…
                  </>
                ) : (
                  activeItem?.respondida && isTreino ? 'Atualizar resposta' : 'Confirmar resposta'
                )}
              </Button>
            )}
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
