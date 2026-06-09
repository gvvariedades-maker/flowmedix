'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, ClipboardList } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { PaywallModal } from '@/components/freemium/PaywallModal';
import { FREEMIUM_SIMULADO_DAILY_LIMIT } from '@/lib/freemium/constants';
import {
  answerSimuladoQuestion,
  finalizeSimuladoSession,
  iniciarSimuladoProva,
  SimuladoApiError,
} from '@/lib/simulado/client';
import type { SimuladoSessionDetailResponse } from '@/lib/simulado/types';
import { sessionDisplayTitulo } from '@/lib/simulado/provaMeta';
import type { LessonData } from '@/types/lesson';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

const SimuladoResumoClient = dynamic(
  () =>
    import('@/components/simulados/SimuladoResumoClient').then((mod) => ({
      default: mod.SimuladoResumoClient,
    })),
  {
    loading: () => (
      <div className={cn('bg-[#010409]', DASHBOARD_PAGE_CENTER)}>
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" aria-label="Carregando resumo" />
      </div>
    ),
  },
);
import {
  SimuladoSessionProvider,
  useSimuladoSessionContext,
} from '@/components/simulados/SimuladoSessionProvider';
import { applyAnswerPatch } from '@/lib/simulado/applyAnswerPatch';
import { findFirstPendingSlug } from '@/lib/simulado/questionNavigation';
import { SimuladoQuestionMap } from '@/components/simulados/SimuladoQuestionMap';
import { ProvaTimerBar } from '@/components/simulados/ProvaTimerBar';
import { SimuladoProvaInstrucoes } from '@/components/simulados/SimuladoProvaInstrucoes';
import { cn } from '@/lib/utils';
import { sanitizeHTML } from '@/lib/validations';
import {
  buildDerivedQuestionHeaderLine,
  buildQuestionSubjectLine,
  stripLeadingQuestionEnumeration,
} from '@/lib/questionHeader';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_CENTER, DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import { ReportErrorDialog } from '@/components/report/ReportErrorDialog';

type FeedbackState = {
  acertou: boolean;
  opcao_correta_id: string;
  opcao_correta_texto: string | null;
  opcao_id: string;
} | null;

type SimuladoRunnerClientProps = {
  sessionId: string;
  initialSession?: SimuladoSessionDetailResponse | null;
};

export function SimuladoRunnerClient({ sessionId, initialSession }: SimuladoRunnerClientProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <SimuladoSessionProvider
      sessionId={sessionId}
      initialSession={initialSession}
      activeSlug={activeSlug}
    >
      <SimuladoRunnerView
        sessionId={sessionId}
        activeSlug={activeSlug}
        setActiveSlug={setActiveSlug}
      />
    </SimuladoSessionProvider>
  );
}

type SimuladoRunnerViewProps = {
  sessionId: string;
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
};

function SimuladoRunnerView({ sessionId, activeSlug, setActiveSlug }: SimuladoRunnerViewProps) {
  const router = useRouter();
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const {
    sessionData,
    loadingSession,
    sessionError,
    loadSession,
    applyAnswerPatchToSession,
    getCachedQuestion,
    loadQuestion: loadQuestionFromCache,
  } = useSimuladoSessionContext();

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
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [liveMessage, setLiveMessage] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [resetEm, setResetEm] = useState<string | null>(null);
  const [simuladoLimiteAtingido, setSimuladoLimiteAtingido] = useState(false);
  const [iniciandoProva, setIniciandoProva] = useState(false);
  const [iniciarProvaError, setIniciarProvaError] = useState<string | null>(null);
  const optionsGroupRef = useRef<HTMLDivElement | null>(null);
  const confirmarRespostaRef = useRef<HTMLDivElement>(null);
  const proximaAcaoRef = useRef<HTMLDivElement>(null);
  const questionLoadIdRef = useRef(0);

  const firstPendingSlug = useMemo(() => {
    if (!sessionData) return null;
    return findFirstPendingSlug(sessionData.questoes);
  }, [sessionData]);

  const provaAguardandoInicio =
    sessionData?.session.modo === 'prova' && !sessionData.session.prova_iniciada_em;

  useEffect(() => {
    if (!sessionData || sessionData.session.status === 'concluido') return;
    if (provaAguardandoInicio) return;
    if (sessionInitialized.current) return;
    if (!firstPendingSlug) return;
    sessionInitialized.current = true;
    setActiveSlug(firstPendingSlug);
  }, [sessionData, firstPendingSlug, setActiveSlug, provaAguardandoInicio]);

  useEffect(() => {
    let cancelled = false;

    fetchWithAuth('/api/freemium/status')
      .then(async (response) => {
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as {
          isPro?: boolean;
          simulado?: { limiteAtingido?: boolean };
          resetEm?: string;
        };
        if (cancelled || data.isPro) return;
        if (data.simulado?.limiteAtingido) {
          setSimuladoLimiteAtingido(true);
          if (data.resetEm) setResetEm(data.resetEm);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

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

  const loadQuestion = useCallback(
    async (slug: string) => {
      const loadId = ++questionLoadIdRef.current;

      setQuestionError(null);
      setFeedback(null);
      setFinalFeedbackPending(false);
      setSubmitError(null);
      setLiveMessage('');

      const cached = getCachedQuestion(slug);
      if (cached) {
        if (loadId !== questionLoadIdRef.current) return;
        setQuestionData(cached as LessonData);
        setSelectedOption(null);
        setLoadingQuestion(false);
        return;
      }

      setLoadingQuestion(true);
      setQuestionData(null);
      setSelectedOption(null);

      try {
        const dados = await loadQuestionFromCache(slug);
        if (loadId !== questionLoadIdRef.current) return;
        setQuestionData(dados as LessonData);
      } catch (err) {
        if (loadId !== questionLoadIdRef.current) return;
        setQuestionError(
          err instanceof SimuladoApiError ? err.message : 'Erro de rede ao carregar a questão.',
        );
      } finally {
        if (loadId === questionLoadIdRef.current) {
          setLoadingQuestion(false);
        }
      }
    },
    [getCachedQuestion, loadQuestionFromCache],
  );

  useEffect(() => {
    if (!activeSlug || sessionData?.session.status === 'concluido' || provaAguardandoInicio) return;
    setQuestionStartedAt(Date.now());
    void loadQuestion(activeSlug);
  }, [activeSlug, sessionData?.session.status, loadQuestion, provaAguardandoInicio]);

  const isTreino = sessionData?.session.modo === 'treino';
  const options = useMemo(
    () => questionData?.question_data?.options ?? [],
    [questionData?.question_data?.options],
  );

  const handleConfirmAnswer = useCallback(async () => {
    if (!activeItem || !activeSlug || !selectedOption || submitting || feedback) return;

    const needsNewAnswerSlot = !activeItem.respondida;
    if (needsNewAnswerSlot && simuladoLimiteAtingido) {
      setPaywallOpen(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await answerSimuladoQuestion({
        session_id: sessionId,
        modulo_slug: activeSlug,
        opcao_id: selectedOption,
        tempo_ms: Math.max(0, Date.now() - questionStartedAt),
      });

      applyAnswerPatchToSession(result);

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

      setFinalFeedbackPending(result.session_status === 'concluido' && isTreino);

      if (result.session_status === 'concluido') {
        return;
      }
      if (!isTreino && sessionData) {
        const patched = applyAnswerPatch(sessionData, result);
        const nextFromPatch = findFirstPendingSlug(patched.questoes);
        if (nextFromPatch) setActiveSlug(nextFromPatch);
      }
    } catch (err) {
      if (err instanceof SimuladoApiError && err.status === 403) {
        const details = err.details as { limiteAtingido?: boolean; resetEm?: string } | undefined;
        if (details?.limiteAtingido) {
          setSimuladoLimiteAtingido(true);
          if (details.resetEm) setResetEm(details.resetEm);
          setPaywallOpen(true);
          setSubmitError(null);
          setLiveMessage('Limite diário de simulado atingido.');
          return;
        }
      }
      setSubmitError(
        err instanceof SimuladoApiError ? err.message : 'Erro ao registrar resposta.',
      );
      setLiveMessage('Erro ao registrar resposta. Tente novamente.');
      void loadSession();
    } finally {
      setSubmitting(false);
    }
  }, [
    activeItem,
    activeSlug,
    selectedOption,
    submitting,
    feedback,
    sessionId,
    questionStartedAt,
    applyAnswerPatchToSession,
    isTreino,
    options,
    sessionData,
    loadSession,
    setActiveSlug,
    simuladoLimiteAtingido,
  ]);

  const handleFinalizeSimulado = useCallback(async () => {
    if (!sessionData || finalizing) return;

    const pendentes = sessionData.resumo.pendentes;
    if (pendentes > 0) {
      const ok = window.confirm(
        `Ainda há ${pendentes} questão${pendentes !== 1 ? 'ões' : ''} sem resposta. Deseja finalizar o simulado e ver o resultado?`,
      );
      if (!ok) return;
    }

    setFinalizeError(null);
    setFinalizing(true);
    try {
      await finalizeSimuladoSession(sessionId);
      setFeedback(null);
      setFinalFeedbackPending(false);
      await loadSession();
      setLiveMessage('Simulado finalizado. Confira o resumo.');
    } catch (err) {
      setFinalizeError(
        err instanceof SimuladoApiError ? err.message : 'Não foi possível finalizar o simulado.',
      );
    } finally {
      setFinalizing(false);
    }
  }, [sessionData, finalizing, sessionId, loadSession]);

  const handleNext = async () => {
    if (!sessionData || advancing) return;

    const nextSlug = findFirstPendingSlug(sessionData.questoes);
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

  const simuladoBlockedForNewAnswer =
    simuladoLimiteAtingido && activeItem != null && !activeItem.respondida;
  const isAnswerLocked =
    submitting || (!isTreino && !!activeItem?.respondida) || simuladoBlockedForNewAnswer;
  const canConfirm = !!selectedOption && !submitting && !isAnswerLocked && !simuladoBlockedForNewAnswer;
  const canAdvance = !!feedback && !advancing;
  const confirmLabel =
    activeItem?.respondida && isTreino ? 'Atualizar resposta' : 'Confirmar resposta';
  const showConfirmAction = !!selectedOption && !feedback && !isAnswerLocked;

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
  }, [questionData, loadingQuestion, submitting, options, selectedOption, feedback, handleConfirmAnswer]);

  useLayoutEffect(() => {
    if (!selectedOption || feedback) return;
    confirmarRespostaRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [selectedOption, feedback]);

  useLayoutEffect(() => {
    if (!feedback) return;
    proximaAcaoRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [feedback]);

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

  const handleMapSelect = useCallback(
    (slug: string) => {
      setActiveSlug(slug);
    },
    [setActiveSlug],
  );

  const handleIniciarProva = useCallback(async () => {
    if (iniciandoProva) return;
    setIniciandoProva(true);
    setIniciarProvaError(null);
    try {
      await iniciarSimuladoProva(sessionId);
      sessionInitialized.current = false;
      await loadSession();
    } catch (err) {
      setIniciarProvaError(
        err instanceof SimuladoApiError ? err.message : 'Não foi possível iniciar a prova.',
      );
    } finally {
      setIniciandoProva(false);
    }
  }, [iniciandoProva, sessionId, loadSession]);

  if (loadingSession && !sessionData) {
    return (
      <div
        className={cn(
          cn('bg-[#010409]', DASHBOARD_PAGE_CENTER),
          pageBottomPadding,
        )}
      >
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" aria-label="Carregando simulado" />
      </div>
    );
  }

  if (sessionError || !sessionData) {
    return (
      <div className={cn(DASHBOARD_PAGE_ROOT, 'bg-[#010409] px-4 pt-6', pageBottomPadding)}>
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

  if (provaAguardandoInicio) {
    return (
      <DashboardMobilePage
        variant="default"
        className={cn(DASHBOARD_PAGE_ROOT, 'bg-[#010409] px-4 pt-6 sm:px-6 md:pb-8 lg:px-8')}
      >
        <SimuladoProvaInstrucoes
          titulo={sessionData.session.titulo}
          modo={sessionData.session.modo}
          totalQuestoes={sessionData.session.total_questoes}
          ritmoMetaSegundosPorQuestao={sessionData.session.ritmo_meta_segundos_por_questao}
          iniciandoProva={iniciandoProva}
          iniciarProvaError={iniciarProvaError}
          onIniciar={() => void handleIniciarProva()}
        />
      </DashboardMobilePage>
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
  const isProvaAtiva = sessionData.session.modo === 'prova';
  const runnerTitle = isProvaAtiva
    ? sessionDisplayTitulo(sessionData.session.titulo, sessionData.session.modo)
    : 'Simulado em andamento';
  const runnerDescription = isProvaAtiva
    ? `Questão ${activeItem?.ordem ?? '—'} · ${sessionData.resumo.respondidas} de ${sessionData.session.total_questoes} respondidas`
    : `${sessionData.resumo.respondidas} de ${sessionData.session.total_questoes} respondidas · ordem aleatória`;
  const runnerBreadcrumb = isProvaAtiva
    ? [{ label: 'Simulados', href: '/simulados' }, { label: runnerTitle }]
    : [
        { label: 'Simulados', href: '/simulados' },
        { label: `Questão ${activeItem?.ordem ?? '—'}` },
      ];

  const finalizeButtonCompact = (
    <Button
      type="button"
      variant="outline"
      disabled={finalizing || submitting}
      onClick={() => void handleFinalizeSimulado()}
      className="min-h-[44px] shrink-0 rounded-xl border-white/15 bg-white/[0.03] text-xs font-bold text-slate-200 hover:bg-white/[0.06] sm:text-sm"
    >
      {finalizing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Finalizando…
        </>
      ) : (
        'Finalizar simulado'
      )}
    </Button>
  );

  const reportErrorControl = (
    <ReportErrorDialog
      contextType="simulado"
      moduloSlug={activeSlug}
      simuladoSessionId={sessionId}
      metadata={{
        question_order: activeItem?.ordem ?? null,
        feedback_visible: !!feedback,
        selected_option: selectedOption,
        acertou: feedback?.acertou ?? null,
        opcao_correta_id: feedback?.opcao_correta_id ?? null,
      }}
      triggerLabel="Reportar erro"
      triggerClassName="min-h-[44px] shrink-0 rounded-xl border-white/15 bg-white/[0.03] text-xs font-bold text-slate-200 hover:bg-white/[0.06] sm:text-sm"
    />
  );

  const mapVariant =
    sessionData.session.modo === 'prova' && sessionData.session.status === 'aberto'
      ? 'prova'
      : 'treino';

  const runnerToolbar = (
    <div className="flex w-full flex-wrap items-center justify-end gap-2">
      {finalizeButtonCompact}
      {reportErrorControl}
    </div>
  );

  return (
    <DashboardMobilePage
      variant="default"
      className={cn(DASHBOARD_PAGE_ROOT, 'bg-[#010409] px-4 pt-6 sm:px-6 md:pb-8 lg:px-8')}
    >
      {sessionData.session.modo === 'prova' && sessionData.session.prova_iniciada_em ? (
        <ProvaTimerBar
          provaIniciadaEm={sessionData.session.prova_iniciada_em}
          totalQuestoes={sessionData.session.total_questoes}
          ritmoMetaSegundosPorQuestao={sessionData.session.ritmo_meta_segundos_por_questao}
        />
      ) : null}
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title={runnerTitle}
          breadcrumb={runnerBreadcrumb}
          description={runnerDescription}
          descriptionClassName="text-sm text-slate-400 mt-1"
          titleClassName="text-xl font-[1000] italic tracking-tighter text-white sm:text-2xl"
          action={runnerToolbar}
        />

        {finalizeError && (
          <p className="text-sm text-rose-400" role="alert">
            {finalizeError}
          </p>
        )}

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
          <SimuladoQuestionMap
            questoes={sessionData.questoes}
            activeSlug={activeSlug}
            variant={mapVariant}
            onSelect={handleMapSelect}
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
                <p className="text-sm font-medium text-slate-300">
                  Resposta registrada. Gabarito disponível no resumo final.
                </p>
              )}
              {submitError && (
                <p className="text-sm text-rose-400" role="alert">
                  {submitError}
                </p>
              )}
            </div>

            {showConfirmAction ? (
              <div
                ref={confirmarRespostaRef}
                className="flex scroll-mt-4 flex-col items-center gap-2 pt-2"
              >
                <Button
                  type="button"
                  disabled={!canConfirm}
                  onClick={() => void handleConfirmAnswer()}
                  className="h-12 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-8 text-sm font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Confirmando…
                    </>
                  ) : (
                    <>
                      {confirmLabel}
                      <ChevronRight className="ml-2 h-4 w-4" aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            {feedback ? (
              <div
                ref={proximaAcaoRef}
                className="flex scroll-mt-4 flex-col items-center gap-2 pt-2"
              >
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
                  className="h-12 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-8 text-sm font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50"
                >
                  {advancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Carregando…
                    </>
                  ) : (
                    <>
                      {showFinalFeedbackCta ? 'Ver resultado' : 'Próxima questão'}
                      <ChevronRight className="ml-2 h-4 w-4" aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {simuladoBlockedForNewAnswer && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-200">
            Plano gratuito: você já respondeu {FREEMIUM_SIMULADO_DAILY_LIMIT} questões de simulado
            hoje.{' '}
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="font-semibold text-cyan-300 underline-offset-2 hover:underline"
            >
              Assine o Pro
            </button>{' '}
            para continuar ou volte amanhã.
          </div>
        )}

        <p className="mb-6 text-center text-xs text-slate-600 md:mb-0">
          <Link href="/simulados" className="transition-colors hover:text-slate-400">
            Voltar para Simulados
          </Link>
        </p>
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        resetEm={resetEm}
        variant="simulado"
      />
    </DashboardMobilePage>
  );
}
