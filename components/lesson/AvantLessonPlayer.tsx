'use client';

/**
 * AVANT OMNI-ARCHITECT: AvantLessonPlayer Component
 * 
 * Pure V15 React Player com:
 * - Estados: 'pergunta' -> 'gabarito' -> 'estudo'
 * - Modal Full Immersion para NeuroSlide
 * - Navegação entre 4 Super Slides
 * - Registro de tentativas no Supabase (historico_questoes)
 */

import { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Target, Transition } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  buildEstudarCacheKeyFromSlugComQuery,
  buildEstudarHref,
  buildEstudarQuestaoApiUrl,
  buildEstudarVitrineHref,
} from '@/lib/estudar/navigation';
import {
  buildEstudarSlugComQueryFromPlayerProps,
  fetchLessonSlidesLayer,
  lessonDataHasSlides,
  mergeSlidesIntoLessonData,
  SLIDES_LAYER_FALLBACK_BANNER,
  slidesLayerErrorMessage,
} from '@/lib/estudar/questaoLayers';
import { useQuestaoNavigationOptional } from '@/components/lesson/questao-navigation-context';
import NeuroSlide from '@/components/slides/NeuroSlide';
import { resolveQuestionFamilyId } from '@/components/slides/core/questionFamily';
import {
  ReadableTextZoomProvider,
  ReadableTextZoomToolbar,
  ReadableTextZoomContent,
} from '@/components/accessibility/ReadableTextZoom';
import {
  EstudoReversoSlideZoom,
  EstudoReversoSlideZoomProvider,
  EstudoReversoSlideZoomToolbar,
} from '@/components/lesson/EstudoReversoSlideZoom';
import { EstudoReversoSlideSwipe } from '@/components/lesson/EstudoReversoSlideSwipe';
import { MicroTip } from '@/components/onboarding/MicroTip';
import {
  getReverseStudySlideMicrotipKey,
  REVERSE_STUDY_MICROTIPS,
} from '@/components/onboarding/reverseStudyMicrotips';
import { logger } from '@/lib/logger';
import { sanitizeHTML } from '@/lib/validations';
import {
  buildDerivedQuestionHeaderLine,
  buildQuestionExamDetailLine,
  buildQuestionHeaderChips,
  buildQuestionSubjectLine,
  stripLeadingQuestionEnumeration,
} from '@/lib/questionHeader';
import { isCertoErradoQuestion } from '@/lib/questionKind';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { buildDotsNavWindow } from '@/lib/estudar/dotsNavWindow';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';
import { ESTUDAR_STALE_RECOVERY_MS } from '@/components/lesson/useEstudarStaleRecovery';
import { patchQuestaoEstudadaInPayload } from '@/lib/estudar/patchQuestaoEstudada';
import {
  clearQuestaoEliminations,
  readQuestaoEliminations,
  writeQuestaoEliminations,
} from '@/lib/estudar/questaoEliminations';
import {
  computeQuestionListProgressPercent,
  computeQuestionListProgressVisualPercent,
} from '@/lib/estudar/questionListProgress';
import { cn } from '@/lib/utils';
import {
  MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM,
  ESTUDO_REVERSO_FULLSCREEN_Z,
  ESTUDO_REVERSO_DESKTOP_INSET,
  ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM,
  ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM_IMMERSIVE,
} from '@/lib/layout/mobileBottomNav';
import { useEstudarQuestaoImmersive } from '@/lib/layout/useEstudarQuestaoImmersive';
import { EstudoReversoHost } from '@/components/lesson/EstudoReversoFullscreenPortal';
import { supabase } from '@/lib/supabase/client';
import { PaywallModal } from '@/components/freemium/PaywallModal';
import { ReportErrorDialog } from '@/components/report/ReportErrorDialog';
import type { AvantLessonPlayerProps, LessonData, ReverseStudySlide } from '@/types/lesson';
import type { GabaritoTentativa } from '@/lib/estudar/questionPayload';
import { 
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, 
  Lightbulb, ArrowRight, ArrowLeft, 
  Flag, BrainCircuit, X, BadgeCheck, Loader2, Scissors
} from 'lucide-react';

const QUESTION_TEXT_TYPOGRAPHY = 'text-[15px] md:text-base leading-relaxed';

function resetDashboardMainScroll() {
  if (typeof document === 'undefined') return;
  const mainEl =
    document.querySelector('main[class*="overflow-y-auto"]') ??
    document.querySelector('main');
  if (mainEl) mainEl.scrollTop = 0;
}

type SlideMotionProps = {
  initial: Target;
  animate: Target;
  exit: Target;
  transition: Transition;
};

function getSlideVariants(slideKind: string, reducedMotion: boolean): SlideMotionProps {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    };
  }

  switch (slideKind) {
    case 'golden_rule':
      // Sem filter: blur — compositing de blur anima mal em GPUs mobile de baixo/medio porte.
      return {
        initial: { opacity: 0, scale: 0.93 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.03 },
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      };
    case 'danger_zone':
      return {
        initial: { opacity: 0, x: -16, rotate: -0.8 },
        animate: { opacity: 1, x: 0, rotate: 0 },
        exit: { opacity: 0, x: 16 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      };
    case 'logic_flow':
      return {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      };
    case 'concept_map':
      return {
        initial: { opacity: 0, scale: 0.96, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.38, ease: [0.34, 1.4, 0.64, 1] },
      };
    default:
      return {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
      };
  }
}

const SLIDE_KIND_COLOR: Record<string, string> = {
  concept_map: 'text-cyan-600',
  golden_rule: 'text-amber-600',
  logic_flow: 'text-violet-600',
  danger_zone: 'text-red-600',
  syllable_scanner: 'text-emerald-600',
  versus_arena: 'text-fuchsia-600',
};

export default function AvantLessonPlayer({
  dados: dadosIniciais,
  mode = 'live', 
  proximaSlug, 
  anteriorSlug,
  moduloSlug,
  questoesDoAssunto,
  fromPlano = false,
  fromCaderno,
  listaContexto,
  avantCodigo,
  vitrineQuerySuffix = '',
  payloadStale = false,
  previewImmersive = false,
  previewInitialEtapa,
  previewInitialOpcaoId,
}: AvantLessonPlayerProps) {
  
  const router = useRouter();
  const estudarQuestaoImmersive = useEstudarQuestaoImmersive();
  const questaoNav = useQuestaoNavigationOptional();
  const [isNavigating, setIsNavigating] = useState(false);
  const [staleElapsedMs, setStaleElapsedMs] = useState(0);
  const bottomNavRef = useRef<HTMLDivElement>(null);
  const questaoAtualDotRef = useRef<HTMLButtonElement | null>(null);
  /** Área com overflow-y-auto (enunciado + alternativas). Ref usada para wheel sobre <button>. */
  const questionBodyScrollRef = useRef<HTMLDivElement>(null);
  /** Bloco do botão Confirmar — scroll após escolher alternativa para não exigir rolar manualmente. */
  const confirmarRespostaRef = useRef<HTMLDivElement>(null);
  const ativarEstudoRef = useRef<HTMLButtonElement>(null);
  const fecharEstudoRef = useRef<HTMLButtonElement>(null);
  const [bottomNavHeightPx, setBottomNavHeightPx] = useState(0);
  const [keyboardInsetPx, setKeyboardInsetPx] = useState(0);

  const bottomNavPaddingBottom =
    keyboardInsetPx > 0
      ? `calc(${keyboardInsetPx}px + env(safe-area-inset-bottom, 0px))`
      : undefined;

  /**
   * Garante que a roda do mouse sempre role o container correto (question body).
   * Necessário porque:
   *  - motion.button pode consumir o evento antes do browser calcular o scroll target
   *  - Sem isso, o Chrome pode tentar rolar ancestrais (ou a página) quando o conteúdo
   *    não excede a altura do container interno naquele frame.
   */
  useEffect(() => {
    const el = questionBodyScrollRef.current;
    if (!el) return;

    const LINE_HEIGHT_PX = 16; // fallback para deltaMode LINE
    const PAGE_HEIGHT_PX = () => el.clientHeight;

    const onWheel = (e: WheelEvent) => {
      // Converte delta para pixels independente do deltaMode do SO/mouse
      let delta = e.deltaY;
      if (e.deltaMode === 1 /* DOM_DELTA_LINE */) delta *= LINE_HEIGHT_PX;
      if (e.deltaMode === 2 /* DOM_DELTA_PAGE */) delta *= PAGE_HEIGHT_PX();

      // Se ainda há espaço para rolar neste container, toma controle
      const canScrollDown = delta > 0 && el.scrollTop < el.scrollHeight - el.clientHeight;
      const canScrollUp   = delta < 0 && el.scrollTop > 0;

      if (canScrollDown || canScrollUp) {
        el.scrollTop += delta;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useLayoutEffect(() => {
    if (mode !== 'live') {
      setBottomNavHeightPx(0);
      return;
    }
    const el = bottomNavRef.current;
    if (!el) {
      setBottomNavHeightPx(0);
      return;
    }
    const sync = () => setBottomNavHeightPx(el.offsetHeight);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  /** Evita que a barra inferior fique atrás do teclado virtual em mobile. */
  useEffect(() => {
    if (mode !== 'live' || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const syncKeyboardInset = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardInsetPx(inset);
    };

    syncKeyboardInset();
    vv.addEventListener('resize', syncKeyboardInset);
    vv.addEventListener('scroll', syncKeyboardInset);
    return () => {
      vv.removeEventListener('resize', syncKeyboardInset);
      vv.removeEventListener('scroll', syncKeyboardInset);
    };
  }, [mode]);

  const dotsNavItems = useMemo(
    () =>
      buildDotsNavWindow(questoesDoAssunto ?? [], {
        currentSlug: moduloSlug,
        currentIndice: listaContexto?.atual,
        total: listaContexto?.total,
      }),
    [questoesDoAssunto, moduloSlug, listaContexto?.atual, listaContexto?.total],
  );

  const dotsWindowKey =
    dotsNavItems.length > 0 ? dotsNavItems.map((item) => item.questao.indice).join('-') : 'empty';

  const questionListProgressPercent = useMemo(() => {
    if (!listaContexto || listaContexto.total <= 0) return null;
    return computeQuestionListProgressPercent(listaContexto.atual, listaContexto.total);
  }, [listaContexto?.atual, listaContexto?.total]);

  const questionListProgressVisualPercent = useMemo(() => {
    if (!listaContexto || listaContexto.total <= 0) return null;
    return computeQuestionListProgressVisualPercent(listaContexto.atual, listaContexto.total);
  }, [listaContexto?.atual, listaContexto?.total]);

  const prevDotsIndiceRef = useRef(listaContexto?.atual ?? 1);
  const [dotsSlideDirection, setDotsSlideDirection] = useState(0);

  useEffect(() => {
    const currentIndice = listaContexto?.atual;
    if (currentIndice == null) return;
    if (prevDotsIndiceRef.current !== currentIndice) {
      setDotsSlideDirection(currentIndice > prevDotsIndiceRef.current ? 1 : -1);
      prevDotsIndiceRef.current = currentIndice;
    }
  }, [listaContexto?.atual, moduloSlug]);

  // ============================================================================
  // ESTADOS (Pure React V15)
  // ============================================================================
  const [etapa, setEtapa] = useState<'pergunta' | 'gabarito' | 'estudo'>(() =>
    mode === 'preview' && previewInitialEtapa ? previewInitialEtapa : 'pergunta',
  );
  const [selecionada, setSelecionada] = useState<string | null>(() =>
    mode === 'preview' ? previewInitialOpcaoId ?? null : null,
  );
  const [eliminadas, setEliminadas] = useState<Set<string>>(() => new Set());
  const [slideAtual, setSlideAtual] = useState(0);
  const [estudoConcluido, setEstudoConcluido] = useState(false);
  const [marcandoConclusao, setMarcandoConclusao] = useState(false);
  const [conclusaoErro, setConclusaoErro] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [resetEm, setResetEm] = useState<string | null>(null);
  const [freemiumLimiteAtingido, setFreemiumLimiteAtingido] = useState(false);
  const [freemiumStatusWarning, setFreemiumStatusWarning] = useState<string | null>(null);
  const [confirmandoResposta, setConfirmandoResposta] = useState(false);
  const [tentativaErro, setTentativaErro] = useState<string | null>(null);
  const [tentativaAccessDenied, setTentativaAccessDenied] = useState(false);
  const [gabarito, setGabarito] = useState<GabaritoTentativa | null>(null);
  const [dadosComSlides, setDadosComSlides] = useState<LessonData | null>(null);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [slidesLoadError, setSlidesLoadError] = useState<string | null>(null);
  const [slidesAccessDenied, setSlidesAccessDenied] = useState(false);
  const [slidesUsingFallback, setSlidesUsingFallback] = useState(false);
  const [slidesFetchTrigger, setSlidesFetchTrigger] = useState(0);
  const slidesLayerFetchRef = useRef(false);
  const slidesPersistFailedRef = useRef(false);
  const tentativaAbortRef = useRef<AbortController | null>(null);
  const questoesDoAssuntoRef = useRef(questoesDoAssunto);
  questoesDoAssuntoRef.current = questoesDoAssunto;
  const activeDados = dadosComSlides ?? dadosIniciais;

  useEffect(() => {
    setDadosComSlides(null);
    slidesLayerFetchRef.current = false;
    slidesPersistFailedRef.current = false;
    setSlidesLoading(false);
    setSlidesLoadError(null);
    setSlidesAccessDenied(false);
    setSlidesUsingFallback(false);
  }, [moduloSlug]);

  const retrySlidesLoad = useCallback(() => {
    slidesLayerFetchRef.current = false;
    setSlidesLoadError(null);
    setSlidesFetchTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    tentativaAbortRef.current?.abort();
    tentativaAbortRef.current = null;
  }, [moduloSlug]);

  useEffect(
    () => () => {
      tentativaAbortRef.current?.abort();
    },
    [],
  );

  // Reset ao mudar de questão (só slug — não re-dispara quando o Hydrator reenvia o mesmo slug)
  useEffect(() => {
    const jaEstudada =
      questoesDoAssuntoRef.current?.find((q) => q.slug === moduloSlug)?.estudada ?? false;
    const initialEtapa =
      mode === 'preview' && previewInitialEtapa ? previewInitialEtapa : 'pergunta';
    setEtapa(initialEtapa);
    setSelecionada(mode === 'preview' && previewInitialOpcaoId ? previewInitialOpcaoId : null);
    setEliminadas(
      mode === 'live' && moduloSlug ? readQuestaoEliminations(moduloSlug) : new Set(),
    );
    setSlideAtual(0);
    setEstudoConcluido(jaEstudada);
    setMarcandoConclusao(false);
    setConfirmandoResposta(false);
    setConclusaoErro(null);
    setPaywallOpen(false);
    setFreemiumLimiteAtingido(false);
    setFreemiumStatusWarning(null);
    setTentativaErro(null);
    setTentativaAccessDenied(false);
    setGabarito(null);
    questionBodyScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [moduloSlug, mode, previewInitialEtapa, previewInitialOpcaoId]);

  const navegacaoBloqueada = confirmandoResposta || marcandoConclusao;
  const navegacaoIndisponivel = navegacaoBloqueada || isNavigating || payloadStale;
  const navegacaoStatusLabel = isNavigating
    ? 'Carregando...'
    : payloadStale
      ? 'Sincronizando...'
      : null;

  useEffect(() => {
    if (!payloadStale) {
      setStaleElapsedMs(0);
      return;
    }
    const startedAt = Date.now();
    const tick = () => setStaleElapsedMs(Date.now() - startedAt);
    tick();
    const intervalId = window.setInterval(tick, 250);
    return () => window.clearInterval(intervalId);
  }, [payloadStale]);

  const showStaleRetry =
    payloadStale &&
    staleElapsedMs >= ESTUDAR_STALE_RECOVERY_MS &&
    Boolean(questaoNav?.refetchRoutePayload);

  const handleStaleRetry = useCallback(() => {
    if (typeof window === 'undefined' || !questaoNav) return;
    const slug = parseEstudarSlugFromPathname(window.location.pathname);
    if (!slug) return;
    void questaoNav.refetchRoutePayload(`${slug}${window.location.search}`, {
      skipCache: true,
    });
  }, [questaoNav]);

  useEffect(() => {
    if (mode !== 'live') return;
    let cancelled = false;

    fetchWithAuth('/api/freemium/status')
      .then(async (response) => {
        if (cancelled) return;
        if (!response.ok) {
          setFreemiumStatusWarning(
            'Não foi possível verificar seu plano gratuito. O limite diário pode não estar atualizado.',
          );
          return;
        }
        const data = (await response.json()) as {
          limiteAtingido?: boolean;
          resetEm?: string;
        };
        if (cancelled) return;
        setFreemiumStatusWarning(null);
        if (data.limiteAtingido) {
          setFreemiumLimiteAtingido(true);
          if (data.resetEm) setResetEm(data.resetEm);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFreemiumStatusWarning(
            'Não foi possível verificar seu plano gratuito. O limite diário pode não estar atualizado.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode, moduloSlug]);

  const prefetchSlug = useCallback(
    (slugComQuery: string | null | undefined) => {
      if (mode !== 'live' || !slugComQuery) return;
      if (questaoNav) {
        questaoNav.prefetchEstudar(slugComQuery);
      } else {
        router.prefetch(buildEstudarHref(slugComQuery));
      }
    },
    [mode, questaoNav, router],
  );

  useEffect(() => {
    if (mode !== 'live' || navegacaoBloqueada) return;
    prefetchSlug(proximaSlug);
    prefetchSlug(anteriorSlug);
  }, [mode, proximaSlug, anteriorSlug, navegacaoBloqueada, prefetchSlug]);

  /** Após escolher uma alternativa, leva o botão Confirmar para a área visível do scroll. */
  useLayoutEffect(() => {
    if (etapa !== 'pergunta' || !selecionada) return;
    const el = confirmarRespostaRef.current;
    if (!el) return;
    const scrollMarginBottom = bottomNavHeightPx + keyboardInsetPx + 16;
    el.style.scrollMarginBottom = `${scrollMarginBottom}px`;
    const narrowViewport =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    el.scrollIntoView({
      behavior: narrowViewport ? 'auto' : 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }, [selecionada, etapa, bottomNavHeightPx, keyboardInsetPx]);

  useLayoutEffect(() => {
    if (etapa === 'gabarito' && gabarito !== null) {
      ativarEstudoRef.current?.focus();
    }
  }, [etapa, gabarito]);

  useLayoutEffect(() => {
    if (etapa === 'estudo') {
      fecharEstudoRef.current?.focus();
    }
  }, [etapa, slideAtual]);

  useEffect(() => {
    if (etapa === 'estudo') return;
    slidesPersistFailedRef.current = false;
    setSlidesLoading(false);
    setSlidesLoadError(null);
    setSlidesAccessDenied(false);
    setSlidesUsingFallback(false);
  }, [etapa]);

  /** L1: prefetch `layers=core` não traz slides — busca `full` ao entrar no estudo reverso. */
  useEffect(() => {
    if (etapa !== 'estudo' || mode !== 'live') return;
    if (lessonDataHasSlides(activeDados)) {
      setSlidesLoading(false);
      setSlidesLoadError(null);
      setSlidesUsingFallback(false);
      return;
    }
    if (!moduloSlug || slidesLayerFetchRef.current) return;

    const slugComQuery = buildEstudarSlugComQueryFromPlayerProps({
      moduloSlug,
      fromPlano,
      fromCaderno,
      vitrineQuerySuffix,
    });
    if (!slugComQuery) return;

    slidesLayerFetchRef.current = true;
    let cancelled = false;
    setSlidesLoading(true);
    setSlidesLoadError(null);
    setSlidesAccessDenied(false);

    const apiUrl = buildEstudarQuestaoApiUrl(slugComQuery, { layers: 'full' });

    void (async () => {
      try {
        const result = await fetchLessonSlidesLayer(apiUrl, fetchWithAuth);
        if (cancelled) return;

        if (result.status === 'success') {
          slidesPersistFailedRef.current = false;
          const merged = mergeSlidesIntoLessonData(activeDados, result.dados);
          setDadosComSlides(merged);
          setSlidesUsingFallback(false);
          setSlidesLoadError(null);
          if (questaoNav) {
            const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
            const cached = questaoNav.getCachedPayload(cacheKey);
            if (cached) {
              questaoNav.cachePayload(cacheKey, { ...cached, dados: merged });
            }
          }
          return;
        }

        if (result.status === 'empty') {
          setSlidesUsingFallback(true);
          setSlidesLoadError(null);
          return;
        }

        if (slidesPersistFailedRef.current) {
          setSlidesUsingFallback(true);
          setSlidesLoadError(null);
          logger.warn('NeuroSlides indisponíveis após retry — usando resumo', {
            moduloSlug,
            kind: result.status,
          });
        } else {
          slidesPersistFailedRef.current = true;
          if (result.status === 'http_error') {
            setSlidesLoadError(slidesLayerErrorMessage(result.httpStatus));
            setSlidesAccessDenied(result.httpStatus === 403);
          } else {
            setSlidesLoadError(slidesLayerErrorMessage(0));
            setSlidesAccessDenied(false);
          }
        }
        if (result.status === 'http_error') {
          logger.error('Falha HTTP ao carregar NeuroSlides (layers=full)', undefined, {
            moduloSlug,
            httpStatus: result.httpStatus,
          });
        } else if (result.status === 'network_error') {
          logger.error('Falha de rede ao carregar NeuroSlides (layers=full)', undefined, {
            moduloSlug,
          });
        }
      } finally {
        if (!cancelled) {
          slidesLayerFetchRef.current = false;
          setSlidesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    etapa,
    mode,
    moduloSlug,
    fromPlano,
    fromCaderno,
    vitrineQuerySuffix,
    activeDados,
    questaoNav,
    slidesFetchTrigger,
  ]);

  const examHeaderLine = useMemo(() => {
    if (!activeDados?.meta) return '';
    const raw = activeDados.meta.header_line?.trim();
    if (raw) return raw;
    return buildDerivedQuestionHeaderLine(activeDados.meta);
  }, [activeDados.meta]);

  const subjectLine = useMemo(() => {
    if (!activeDados?.meta) return null;
    return buildQuestionSubjectLine(activeDados.meta);
  }, [activeDados.meta]);

  const usesHeaderChips = Boolean(activeDados?.meta && !activeDados.meta.header_line?.trim());

  const headerChips = useMemo(() => {
    if (!usesHeaderChips || !activeDados?.meta) return [];
    return buildQuestionHeaderChips(activeDados.meta);
  }, [activeDados.meta, usesHeaderChips]);

  const examDetailLine = useMemo(() => {
    if (!usesHeaderChips || !activeDados?.meta) return null;
    return buildQuestionExamDetailLine(activeDados.meta);
  }, [activeDados.meta, usesHeaderChips]);

  const instructionParaExibicao = useMemo(() => {
    const raw = activeDados?.question_data?.instruction;
    if (!raw) return '';
    return stripLeadingQuestionEnumeration(raw);
  }, [activeDados.question_data?.instruction]);

  const sanitizedInstructionHtml = useMemo(
    () => sanitizeHTML(instructionParaExibicao),
    [instructionParaExibicao],
  );

  const sanitizedTextFragmentHtml = useMemo(() => {
    const fragment = activeDados?.question_data?.text_fragment;
    return fragment ? sanitizeHTML(fragment) : null;
  }, [activeDados?.question_data?.text_fragment]);

  const prefersReducedMotion = useReducedMotion() ?? false;

  const handleNavegar = useCallback(
    async (slugComQuery: string) => {
      if (navegacaoIndisponivel) return;
      setIsNavigating(true);
      try {
        if (questaoNav) {
          await questaoNav.navigateEstudar(slugComQuery);
        } else {
          router.push(buildEstudarHref(slugComQuery));
        }
      } finally {
        setIsNavigating(false);
      }
    },
    [navegacaoIndisponivel, questaoNav, router],
  );

  if (!activeDados?.question_data?.options?.length) {
    const vitrineSuffix = fromPlano
      ? '?from=plano'
      : fromCaderno
        ? `?from=caderno&caderno_id=${encodeURIComponent(fromCaderno)}`
        : vitrineQuerySuffix || '';
    const handleVoltarVitrine = () => {
      const ctx = { fromPlano, fromCaderno, vitrineQuerySuffix: vitrineSuffix };
      if (questaoNav) {
        questaoNav.dismissToVitrine(ctx);
      } else {
        router.replace(buildEstudarVitrineHref(ctx));
      }
      resetDashboardMainScroll();
    };
    const vitrineDestinoLabel = fromPlano
      ? 'plano diário'
      : fromCaderno
        ? 'cadernos'
        : 'vitrine';

    return (
      <div
        data-testid="lesson-empty-question-error"
        className="card-elevated-lg flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden font-sans shadow-none md:rounded-[2.5rem]"
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-200 bg-rose-50">
            <XCircle size={32} className="text-rose-600" aria-hidden />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Questão indisponível</h2>
            <p className="max-w-md text-sm text-slate-600">
              Esta questão não possui alternativas válidas para exibição. Volte à {vitrineDestinoLabel} e escolha outra.
            </p>
          </div>
          <button
            type="button"
            onClick={handleVoltarVitrine}
            className="btn-editorial-outline group flex min-h-[48px] items-center gap-2 px-6 py-3 text-sm font-semibold"
          >
            <ArrowLeft size={16} className="shrink-0" aria-hidden />
            Voltar à {vitrineDestinoLabel}
          </button>
        </div>
      </div>
    );
  }

  const meta = activeDados.meta ?? {
    banca: 'DESCONHECIDA',
    topico: 'Geral',
    subtopico: 'Geral',
  };

  const certoErradoLayout = isCertoErradoQuestion(activeDados.question_data.options);

  // ============================================================================
  // LÓGICA DE BANCO (Supabase)
  // ============================================================================
  const postWithSessionRetry = async (
    url: string,
    payload: Record<string, unknown>,
    signal?: AbortSignal,
  ) => {
    const doPost = () =>
      fetchWithAuth(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });

    let response = await doPost();
    if (response.status !== 401) return response;

    // Token pode ter vencido: renova no browser (único ponto de refresh) e reenvia com Bearer.
    await supabase.auth.getSession();
    return doPost();
  };

  type RegistrarTentativaResult =
    | { status: 'ok'; gabarito: GabaritoTentativa }
    | { status: 'blocked' }
    | { status: 'unauthorized' }
    | { status: 'forbidden'; message: string }
    | { status: 'error' };

  const buildPreviewGabarito = (opcaoId: string): GabaritoTentativa => {
    const opcaoCorretaId =
      activeDados.question_data.options.find((option) => option.is_correct)?.id ?? '';
    const opcaoEscolhida = activeDados.question_data.options.find((option) => option.id === opcaoId);
    return {
      acertou: opcaoEscolhida?.is_correct ?? false,
      opcaoCorretaId,
    };
  };

  const registrarTentativa = async (opcaoId: string): Promise<RegistrarTentativaResult> => {
    if (mode === 'preview') {
      return { status: 'ok', gabarito: buildPreviewGabarito(opcaoId) };
    }

    tentativaAbortRef.current?.abort();
    const controller = new AbortController();
    tentativaAbortRef.current = controller;

    try {
      const response = await postWithSessionRetry(
        '/api/registrar-tentativa',
        {
          modulo_slug: moduloSlug || activeDados.modulo_slug || 'slug-legacy',
          opcao_id: opcaoId,
          banca: activeDados.meta?.banca || 'DESCONHECIDA',
          topico: activeDados.meta?.topico || 'Geral',
          subtopico: activeDados.meta?.subtopico || activeDados.meta?.topico || 'Geral',
        },
        controller.signal,
      );

      if (controller.signal.aborted) {
        return { status: 'error' as const };
      }

      if (response.status === 403) {
        const payload = (await response.json().catch(() => ({}))) as {
          limiteAtingido?: boolean;
          resetEm?: string;
          error?: string;
        };
        if (payload.limiteAtingido) {
          if (payload.resetEm) setResetEm(payload.resetEm);
          setFreemiumLimiteAtingido(true);
          setPaywallOpen(true);
          return { status: 'blocked' };
        }
        logger.warn('Attempt blocked by access check', {
          moduloSlug,
          error: payload.error,
        });
        const message = payload.error ?? 'Sem acesso a esta questão.';
        setTentativaAccessDenied(true);
        setTentativaErro(message);
        return { status: 'forbidden', message };
      }

      if (!response.ok) {
        if (response.status === 401) {
          logger.warn('Attempt not registered: unauthorized after session retry', { moduloSlug });
          return { status: 'unauthorized' };
        }
        logger.error('Failed to register attempt via API', { status: response.status, moduloSlug });
        return { status: 'error' };
      }

      const payload = (await response.json()) as {
        acertou?: boolean;
        opcao_correta_id?: string;
      };

      if (
        typeof payload.acertou !== 'boolean' ||
        typeof payload.opcao_correta_id !== 'string' ||
        payload.opcao_correta_id.length === 0
      ) {
        logger.error('Invalid gabarito payload from registrar-tentativa', { moduloSlug });
        return { status: 'error' };
      }

      return {
        status: 'ok',
        gabarito: {
          acertou: payload.acertou,
          opcaoCorretaId: payload.opcao_correta_id,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { status: 'error' as const };
      }
      logger.error('Unexpected error registering attempt', error);
      return { status: 'error' };
    } finally {
      if (tentativaAbortRef.current === controller) {
        tentativaAbortRef.current = null;
      }
    }
  };

  const handleConfirmarResposta = async () => {
    if (!selecionada || confirmandoResposta) return;

    if (freemiumLimiteAtingido) {
      setPaywallOpen(true);
      return;
    }

    setConfirmandoResposta(true);
    setTentativaErro(null);
    setTentativaAccessDenied(false);
    try {
      const result = await registrarTentativa(selecionada);
      if (result.status !== 'ok') {
        if (result.status === 'unauthorized') {
          setTentativaErro('Sessão expirada. Faça login novamente para registrar sua resposta.');
        } else if (result.status === 'forbidden') {
          setTentativaAccessDenied(true);
          setTentativaErro(result.message);
        } else if (result.status === 'error') {
          setTentativaErro('Não foi possível registrar sua resposta. Tente novamente.');
        }
        return;
      }
      setGabarito(result.gabarito);
      setEtapa('gabarito');
      setEliminadas(new Set());
      {
        const slug = moduloSlug || activeDados.modulo_slug || '';
        if (slug) clearQuestaoEliminations(slug);
      }
      if (questaoNav && estudoConcluido) {
        const slug = moduloSlug || activeDados.modulo_slug || '';
        if (slug) {
          const slugComQuery = buildEstudarSlugComQueryFromPlayerProps({
            moduloSlug: slug,
            fromPlano,
            fromCaderno,
            vitrineQuerySuffix,
          });
          const basePayload =
            questaoNav.displayPayload?.moduloSlug === slug
              ? questaoNav.displayPayload
              : {
                  dados: activeDados,
                  mode,
                  proximaSlug,
                  anteriorSlug,
                  moduloSlug: slug,
                  questoesDoAssunto,
                  fromPlano,
                  fromCaderno,
                  listaContexto,
                  avantCodigo,
                  vitrineQuerySuffix,
                };
          const patched = patchQuestaoEstudadaInPayload(basePayload, slug);
          questaoNav.setDisplayPayload(patched);
          if (slugComQuery) {
            const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
            questaoNav.cachePayload(cacheKey, patched);
          }
        }
      }
    } finally {
      setConfirmandoResposta(false);
    }
  };

  // ============================================================================
  // MARCAR ESTUDO REVERSO COMO CONCLUÍDO
  // ============================================================================
  const marcarEstudoConcluido = async () => {
    if (mode === 'preview' || marcandoConclusao || estudoConcluido) return;
    setMarcandoConclusao(true);
    setConclusaoErro(null);
    try {
      const slug = moduloSlug || activeDados.modulo_slug || '';
      if (!slug) {
        setConclusaoErro('Não foi possível identificar a questão. Recarregue a página.');
        return;
      }
      const response = await postWithSessionRetry('/api/concluir-estudo-reverso', { modulo_slug: slug });
      if (response.ok) {
        setEstudoConcluido(true);
        if (questaoNav) {
          const slugComQuery = buildEstudarSlugComQueryFromPlayerProps({
            moduloSlug: slug,
            fromPlano,
            fromCaderno,
            vitrineQuerySuffix,
          });
          const basePayload =
            questaoNav.displayPayload?.moduloSlug === slug
              ? questaoNav.displayPayload
              : {
                  dados: activeDados,
                  mode,
                  proximaSlug,
                  anteriorSlug,
                  moduloSlug: slug,
                  questoesDoAssunto,
                  fromPlano,
                  fromCaderno,
                  listaContexto,
                  avantCodigo,
                  vitrineQuerySuffix,
                };
          const patched = patchQuestaoEstudadaInPayload(basePayload, slug);
          questaoNav.setDisplayPayload(patched);
          if (slugComQuery) {
            const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
            questaoNav.cachePayload(cacheKey, patched);
          }
        }
        router.refresh();
      } else {
        if (response.status === 401) {
          logger.warn('Could not mark estudo concluido: unauthorized after session retry', { moduloSlug: slug });
          setConclusaoErro('Sessão expirada. Faça login novamente para salvar o estudo.');
          return;
        }
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        logger.error('Failed to mark estudo reverso as concluido', { status: response.status });
        setConclusaoErro(payload.error ?? 'Não foi possível salvar. Tente de novo.');
      }
    } catch (error) {
      logger.error('Unexpected error marking estudo reverso', error);
      setConclusaoErro('Erro de conexão. Verifique a internet e tente novamente.');
    } finally {
      setMarcandoConclusao(false);
    }
  };

  // ============================================================================
  // NAVEGAÇÃO
  // ============================================================================
  const buildNavegacaoSuffix = () => {
    if (fromPlano) return '?from=plano';
    if (fromCaderno) return `?from=caderno&caderno_id=${encodeURIComponent(fromCaderno)}`;
    return vitrineQuerySuffix || '';
  };

  const vitrineReturnContext = () => ({
    fromPlano,
    fromCaderno,
    vitrineQuerySuffix: buildNavegacaoSuffix(),
  });

  const handleVoltarLista = () => {
    if (questaoNav) {
      questaoNav.dismissToVitrine(vitrineReturnContext());
    } else {
      router.replace(buildEstudarVitrineHref(vitrineReturnContext()));
    }
    resetDashboardMainScroll();
  };

  const handleConcluir = () => {
    if (questaoNav) {
      questaoNav.dismissToVitrine(vitrineReturnContext());
      return;
    }
    router.replace(buildEstudarVitrineHref(vitrineReturnContext()));
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const questionSubject = meta.topico || meta.subtopico || 'Geral';
  const subtopicLabel = meta.subtopico
    ? `Subtópico: ${meta.subtopico}`
    : meta.topico
      ? `Tópico: ${meta.topico}`
      : 'Revisão guiada por estudo reverso';

  const slidesSource = ((activeDados.reverse_study_slides || activeDados.study_slides) ?? []) as LessonData['reverse_study_slides'];
  const fallbackSlide: ReverseStudySlide = {
    type: 'golden_rule',
    layout_type: 'golden_rule',
    structure: {
      header: {
        title: `Estudo reverso: ${questionSubject}`,
        subtitle: subtopicLabel,
      },
      main_text: activeDados.question_data.instruction,
      footer_rule: activeDados.question_data.instruction,
    },
    design_system: {
      accent_color: 'cyan',
    },
    subject: questionSubject,
    meta: {
      topico: meta.topico,
      subtopico: meta.subtopico,
    },
  };

  const normalizeStructure = (structure?: ReverseStudySlide['structure']) => {
    if (!structure) return undefined;
    const headerBase = structure.header || { title: '' };
    const fallbackTitle = activeDados.question_data.instruction || questionSubject;
    const fallbackSubtitle = headerBase.subtitle || subtopicLabel;
    return {
      ...structure,
      header: {
        ...headerBase,
        title: headerBase.title || fallbackTitle,
        subtitle: headerBase.subtitle || fallbackSubtitle,
      },
      footer_rule: structure.footer_rule || activeDados.question_data.instruction || `Revisão de ${questionSubject}`,
    };
  };

  const normalizeSlide = (slide: ReverseStudySlide): ReverseStudySlide => ({
    ...slide,
    subject: slide.subject || questionSubject,
    meta: {
      topico: slide.meta?.topico || meta.topico,
      subtopico: slide.meta?.subtopico || meta.subtopico,
      ...slide.meta,
    },
    structure: normalizeStructure(slide.structure) ?? slide.structure,
  });

  const hasRealSlides = lessonDataHasSlides(activeDados);
  const slidesArray = (
    hasRealSlides
      ? (slidesSource ?? [])
      : slidesUsingFallback || (mode === 'preview' && !hasRealSlides)
        ? [fallbackSlide]
        : []
  ).map(normalizeSlide);
  const showSlidesLoading =
    etapa === 'estudo' && mode === 'live' && !hasRealSlides && slidesLoading;
  const showSlidesLoadError =
    etapa === 'estudo' &&
    mode === 'live' &&
    !hasRealSlides &&
    !slidesUsingFallback &&
    Boolean(slidesLoadError);
  const showSlidesFallbackBanner =
    etapa === 'estudo' && slidesUsingFallback && !hasRealSlides;
  const currentSlide = slidesArray[slideAtual];
  const slideKind = currentSlide?.type ?? currentSlide?.layout_type ?? 'default';
  const slideCounterColor = SLIDE_KIND_COLOR[slideKind] ?? 'text-slate-600';
  const slideMotion = getSlideVariants(slideKind, prefersReducedMotion);
  const currentSlideMicrotipKey = getReverseStudySlideMicrotipKey(currentSlide?.type ?? currentSlide?.layout_type);
  const totalSlides = slidesArray.length;
  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  // Gera hash único e robusto da questão para tema visual único
  // Combina múltiplos fatores para garantir unicidade: instruction + meta + modulo_slug
  const questionHash = [
    activeDados.question_data?.instruction || '',
    activeDados.meta?.banca || '',
    activeDados.meta?.ano || '',
    activeDados.meta?.topico || '',
    activeDados.meta?.subtopico || '',
    activeDados.modulo_slug || '',
  ].filter(Boolean).join('-') || JSON.stringify(activeDados).substring(0, 100);

  const questionFamilyId = useMemo(
    () =>
      resolveQuestionFamilyId({
        instruction: activeDados.question_data?.instruction,
        subtopico: activeDados.meta?.subtopico ?? activeDados.meta?.topico,
        options: activeDados.question_data?.options?.map((option) => ({
          id: option.id,
          text: option.text,
          is_correct: option.is_correct ?? false,
        })),
        textFragment: activeDados.question_data?.text_fragment,
      }),
    [
      activeDados.question_data?.instruction,
      activeDados.question_data?.options,
      activeDados.question_data?.text_fragment,
      activeDados.meta?.subtopico,
      activeDados.meta?.topico,
    ],
  );

  const questionZoomContentKey = `${moduloSlug ?? questionHash}-${etapa}`;
  const showQuestionZoom = etapa === 'pergunta' || etapa === 'gabarito';

  const isPreviewMode = mode === 'preview';

  const opcaoEstaCorreta = (optId: string): boolean => {
    if (isPreviewMode) {
      return activeDados.question_data.options.find((option) => option.id === optId)?.is_correct ?? false;
    }
    return gabarito?.opcaoCorretaId === optId;
  };

  const respostaAcertou =
    gabarito != null
      ? gabarito.acertou
      : isPreviewMode && selecionada
        ? opcaoEstaCorreta(selecionada)
        : false;

  /** Na LP a demo fica no card — não usar overlay fixed em tela cheia. */
  const sairEstudoReverso = () => {
    setSlideAtual(0);
    if (mode === 'preview') {
      setEtapa('pergunta');
      resetDashboardMainScroll();
      return;
    }
    setEtapa(gabarito !== null ? 'gabarito' : 'pergunta');
    resetDashboardMainScroll();
  };

  const buildOptionAriaLabel = (
    opt: { id: string; text: string },
    isSelected: boolean,
    isCorrect: boolean,
    showResult: boolean,
  ): string => {
    const base = `Alternativa ${opt.id}: ${opt.text}`;
    if (!showResult) {
      return isSelected ? `${base}, selecionada` : base;
    }
    if (isCorrect && isSelected) return `${base}, correta, sua escolha`;
    if (isCorrect) return `${base}, correta`;
    if (isSelected) return `${base}, sua escolha, incorreta`;
    return base;
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    optId: string,
    index: number,
    blockSelection: boolean,
  ) => {
    if (
      showOptionElimination &&
      (e.key === 'e' || e.key === 'E' || e.key === 'Delete' || e.key === 'Backspace')
    ) {
      e.preventDefault();
      toggleEliminada(optId);
      return;
    }
    if (blockSelection) return;
    const options = activeDados.question_data.options;
    const findNextSelectable = (direction: 1 | -1): number | null => {
      for (let step = 1; step <= options.length; step += 1) {
        const candidate = (index + direction * step + options.length) % options.length;
        if (!eliminadas.has(options[candidate].id)) return candidate;
      }
      return null;
    };
    let nextIndex: number | null = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      nextIndex = findNextSelectable(1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      nextIndex = findNextSelectable(-1);
    }
    if (nextIndex === null) return;
    e.preventDefault();
    const nextId = options[nextIndex].id;
    setSelecionada(nextId);
    requestAnimationFrame(() => {
      document.getElementById(`lesson-option-${nextId}`)?.focus();
    });
  };

  const showOptionElimination = etapa === 'pergunta' && !certoErradoLayout;

  const toggleEliminada = useCallback(
    (optId: string) => {
      setEliminadas((prev) => {
        const next = new Set(prev);
        if (next.has(optId)) next.delete(optId);
        else next.add(optId);
        const slug = moduloSlug || activeDados.modulo_slug || '';
        if (mode === 'live' && slug) writeQuestaoEliminations(slug, next);
        return next;
      });
      setSelecionada((current) => (current === optId ? null : current));
    },
    [activeDados.modulo_slug, mode, moduloSlug],
  );

  const handleRadiogroupKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (etapa !== 'pergunta') return;
    const options = activeDados.question_data.options;
    const digit = Number.parseInt(e.key, 10);
    if (Number.isFinite(digit) && digit >= 1 && digit <= options.length) {
      const opt = options[digit - 1];
      if (!eliminadas.has(opt.id)) {
        e.preventDefault();
        setSelecionada(opt.id);
        requestAnimationFrame(() => {
          document.getElementById(`lesson-option-${opt.id}`)?.focus();
        });
      }
      return;
    }
    const key = e.key.toLowerCase();
    const byLetter = options.find((option) => option.id.toLowerCase() === key);
    if (byLetter && !eliminadas.has(byLetter.id)) {
      e.preventDefault();
      setSelecionada(byLetter.id);
      requestAnimationFrame(() => {
        document.getElementById(`lesson-option-${byLetter.id}`)?.focus();
      });
    }
  };

  const renderQuestionLiveHeader = (withZoom: boolean) => {
    if (mode !== 'live') return null;

    const voltarDestino = fromPlano ? 'Plano diário' : fromCaderno ? 'Meus cadernos' : 'Vitrine';

    return (
      <div
        className={cn(
          'flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-slate-200 px-4 pb-1.5 sm:gap-x-3 sm:px-6',
          estudarQuestaoImmersive ? 'pt-safe md:pt-4' : 'pt-3 sm:pt-4',
        )}
      >
        <button
          type="button"
          onClick={handleVoltarLista}
          aria-label={`Voltar para ${voltarDestino}`}
          className="group flex min-w-0 shrink-0 items-center gap-2 rounded-xl px-1 -ml-1 text-slate-500 transition-colors hover:text-[#166534] min-h-[44px] min-w-[44px] sm:max-w-none"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-all group-hover:border-[rgba(34,197,94,0.35)] group-hover:bg-[rgba(34,197,94,0.08)]">
            <ArrowLeft size={16} />
          </div>
          <span className="max-w-[5rem] truncate text-xs font-medium sm:max-w-none sm:text-sm">
            {voltarDestino}
          </span>
        </button>
        <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {listaContexto && listaContexto.total > 0 && (
            <span
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold tabular-nums text-slate-600 sm:px-3 sm:text-xs sm:text-sm"
              aria-label={`Questão ${listaContexto.atual} de ${listaContexto.total}`}
            >
              <span className="sm:hidden">
                {listaContexto.atual}/{listaContexto.total}
              </span>
              <span className="hidden sm:inline">
                Questão {listaContexto.atual} de {listaContexto.total}
              </span>
            </span>
          )}
          {withZoom ? (
            <ReadableTextZoomToolbar ariaLabel="Tamanho do texto da questão" />
          ) : null}
          <ReportErrorDialog
            contextType="lesson"
            moduloSlug={moduloSlug || activeDados.modulo_slug}
            metadata={{
              etapa,
              slide_atual: slideAtual,
              total_slides: totalSlides,
              question_hash: questionHash,
              alternativa_selecionada: selecionada,
              acertou: gabarito?.acertou ?? null,
              opcao_correta_id: gabarito?.opcaoCorretaId ?? null,
            }}
            triggerLabel="Reportar erro"
            triggerClassName="min-h-[44px] min-w-[44px] h-11 w-11 px-0 sm:h-9 sm:min-h-0 sm:min-w-0 sm:w-auto sm:px-3 text-xs font-semibold"
          />
        </div>
      </div>
    );
  };

  const renderQuestionScrollBody = (withZoom: boolean) => {
    const zoomableContent = (
      <>
        {activeDados.question_data.text_fragment && (
          <div className="px-6 pt-4 pb-2 md:px-8">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-serif leading-relaxed italic text-slate-600">
              <div dangerouslySetInnerHTML={{ __html: sanitizedTextFragmentHtml ?? '' }} />
            </div>
          </div>
        )}

        <div className="min-w-0 px-6 pt-4 pb-2 md:px-8 md:pt-5 md:pb-3">
          <div className={`${QUESTION_TEXT_TYPOGRAPHY} text-slate-800 font-normal whitespace-pre-wrap break-words overflow-x-hidden [&_strong]:font-semibold [&_p]:mb-2 [&_p:last-child]:mb-0`}>
            <span dangerouslySetInnerHTML={{ __html: sanitizedInstructionHtml }} />
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="px-6 pb-6 md:px-8 md:pb-7"
        >
          {showOptionElimination ? (
            <MicroTip
              storageKey="reverse-study.option-elimination"
              tip={REVERSE_STUDY_MICROTIPS['option-elimination']}
              enabled={etapa === 'pergunta'}
              className={cn('mb-3', estudarQuestaoImmersive && 'max-md:mb-2')}
            />
          ) : null}
          <div
            role="radiogroup"
            aria-label="Alternativas da questão"
            onKeyDown={handleRadiogroupKeyDown}
            className={
              certoErradoLayout
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto'
                : 'grid gap-2 md:gap-2.5'
            }
          >
            {activeDados.question_data.options.map((opt, optionIndex) => {
              const isSelected = selecionada === opt.id;
              const isEliminada = eliminadas.has(opt.id);
              const isCorrect = opcaoEstaCorreta(opt.id);
              const showResult = (etapa === 'gabarito' || etapa === 'estudo') && gabarito !== null;

              let styles = "border-slate-200 bg-white hover:border-[rgba(34,197,94,0.45)] hover:bg-[rgba(34,197,94,0.06)]";
              let badge = "border border-slate-200 bg-slate-100 text-slate-600 group-hover:border-[rgba(34,197,94,0.35)] group-hover:text-[#166534]";
              let text = "text-slate-800";

              if (isEliminada && !showResult) {
                styles = "border-slate-100 bg-slate-50";
                badge = "border border-slate-200 bg-slate-100 text-slate-400";
                text = "text-slate-400 line-through decoration-slate-400/80";
              } else if (showResult) {
                if (isCorrect) {
                  styles = "border-emerald-300 bg-emerald-50";
                  badge = "bg-emerald-500 text-white shadow-md";
                  text = "text-emerald-700 font-bold";
                } else if (isSelected && !isCorrect) {
                  styles = "border-rose-300 bg-rose-50";
                  badge = "bg-rose-500 text-white shadow-md";
                  text = "text-rose-700 font-bold";
                } else {
                  styles = "border-slate-100 bg-slate-50 opacity-70";
                }
              } else if (isSelected) {
                styles = "border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.08)] shadow-sm";
                badge = "bg-[#22c55e] text-slate-900 shadow-md";
                text = "text-[#166534] font-bold";
              }

              const rowLayout = certoErradoLayout
                ? 'flex flex-col items-center justify-center text-center min-h-[92px] sm:min-h-[108px] gap-2 p-5 md:p-6'
                : 'text-left flex min-h-[48px] items-center gap-3 px-3 py-3 md:px-4';

              const optionAriaLabel = [
                buildOptionAriaLabel(opt, isSelected, isCorrect, showResult),
                isEliminada && !showResult ? 'eliminada' : '',
              ]
                .filter(Boolean)
                .join(', ');

              return (
                <div key={opt.id} className="flex min-w-0 items-stretch gap-1">
                  {showOptionElimination ? (
                    <button
                      type="button"
                      onClick={() => toggleEliminada(opt.id)}
                      aria-label={
                        isEliminada
                          ? `Restaurar alternativa ${opt.id}`
                          : `Eliminar alternativa ${opt.id}`
                      }
                      aria-pressed={isEliminada}
                      title={isEliminada ? 'Restaurar alternativa' : 'Eliminar alternativa (tecla E)'}
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors sm:h-12 sm:w-12',
                        isEliminada
                          ? 'border-sky-200 bg-sky-50 text-sky-600'
                          : 'border-transparent text-slate-300 hover:border-slate-200 hover:bg-slate-50 hover:text-sky-600',
                      )}
                    >
                      <Scissors size={16} aria-hidden />
                    </button>
                  ) : null}
                  <motion.button
                    id={`lesson-option-${opt.id}`}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={optionAriaLabel}
                    aria-disabled={isEliminada && !showResult ? true : undefined}
                    disabled={showResult || (isEliminada && !showResult)}
                    tabIndex={
                      showResult || isEliminada
                        ? -1
                        : isSelected || (!selecionada && optionIndex === 0)
                          ? 0
                          : -1
                    }
                    whileTap={!showResult && !isEliminada ? { scale: 0.98 } : undefined}
                    onClick={() => {
                      if (!isEliminada) setSelecionada(opt.id);
                    }}
                    onKeyDown={(e) =>
                      handleOptionKeyDown(e, opt.id, optionIndex, showResult || isEliminada)
                    }
                    className={`group relative min-w-0 flex-1 rounded-xl border transition-all duration-300 active:scale-[0.98] btn-option-editorial ${styles} ${rowLayout}`}
                  >
                    {!certoErradoLayout && (
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase transition-colors duration-300 ${badge}`}>
                        {opt.id}
                      </span>
                    )}
                    <span className={`min-w-0 flex-1 ${QUESTION_TEXT_TYPOGRAPHY} ${certoErradoLayout ? 'font-semibold' : 'font-normal'} ${text}`}>
                      {opt.text}
                    </span>
                    {showResult && isCorrect && (
                      <div
                        className={`text-emerald-600 animate-in zoom-in ${certoErradoLayout ? 'mt-1' : 'absolute right-3 top-1/2 -translate-y-1/2'}`}
                        aria-hidden
                      >
                        <CheckCircle2 size={certoErradoLayout ? 32 : 24} />
                      </div>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <div
                        className={`text-rose-600 animate-in zoom-in ${certoErradoLayout ? 'mt-1' : 'absolute right-3 top-1/2 -translate-y-1/2'}`}
                        aria-hidden
                      >
                        <XCircle size={certoErradoLayout ? 32 : 24} />
                      </div>
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {mode === 'live' && freemiumStatusWarning ? (
          <div
            role="status"
            className="mx-6 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-800 md:mx-8"
          >
            {freemiumStatusWarning}
          </div>
        ) : null}

        {etapa === 'pergunta' && selecionada && (
          <motion.div
            ref={confirmarRespostaRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              'flex flex-col items-center gap-2 scroll-mt-4 px-6 pt-1 pb-5',
              MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM,
              estudarQuestaoImmersive && 'pb-safe',
            )}
          >
            <MicroTip
              storageKey="reverse-study.answer-before-feedback"
              tip={REVERSE_STUDY_MICROTIPS['answer-before-feedback']}
              enabled={etapa === 'pergunta'}
              className="w-full max-w-xl"
            />
            {tentativaErro ? (
              <div
                role="alert"
                className="flex w-full max-w-xl flex-col items-center gap-2 px-2 text-center"
              >
                <p className="text-sm font-medium text-rose-600">{tentativaErro}</p>
                {tentativaAccessDenied ? (
                  <button
                    type="button"
                    onClick={handleVoltarLista}
                    className="link-editorial-secondary text-xs font-semibold underline-offset-2 hover:underline"
                  >
                    Voltar à vitrine
                  </button>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleConfirmarResposta}
              disabled={confirmandoResposta}
              className="btn-editorial-primary group flex min-h-[48px] items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {confirmandoResposta ? 'Registrando…' : 'Confirmar Resposta'}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                <ChevronRight size={16} />
              </span>
            </button>
          </motion.div>
        )}
      </>
    );

    return (
      <>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="border-b border-slate-200 bg-slate-50 px-6 py-4 md:px-8 md:py-5"
        >
          {subjectLine && (
            <p className="text-base md:text-lg font-semibold text-slate-900 border-l-4 border-[#22c55e] pl-3 leading-snug">
              {subjectLine}
            </p>
          )}
          {usesHeaderChips && headerChips.length > 0 ? (
            <div
              className={cn(
                'flex flex-wrap items-center gap-x-2 gap-y-1.5',
                subjectLine ? 'mt-2' : '',
              )}
            >
              {headerChips.map((chip) => (
                <span
                  key={chip.id}
                  className={cn(
                    'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-tight',
                    chip.tone === 'banca'
                      ? 'border-sky-200 bg-sky-50 text-sky-800'
                      : 'border-slate-200 bg-white text-slate-600',
                  )}
                >
                  {chip.label}
                </span>
              ))}
              {examDetailLine ? (
                <span className="text-xs text-slate-500 leading-snug">{examDetailLine}</span>
              ) : null}
            </div>
          ) : examHeaderLine ? (
            <p
              className={cn(
                'text-xs md:text-sm text-slate-500 leading-snug',
                subjectLine ? 'mt-2' : '',
              )}
            >
              {examHeaderLine}
            </p>
          ) : null}
          {mode !== 'live' && formatAvantCodigo(avantCodigo) && (
            <p
              className={cn(
                'text-[10px] font-mono text-slate-400',
                subjectLine || examHeaderLine || headerChips.length > 0 ? 'mt-1.5' : '',
              )}
              title="Código da questão (igual ao painel admin)"
            >
              {formatAvantCodigo(avantCodigo)}
            </p>
          )}
        </motion.div>

        {withZoom ? (
          <ReadableTextZoomContent>{zoomableContent}</ReadableTextZoomContent>
        ) : (
          zoomableContent
        )}
      </>
    );
  };

  return (
    <>
    <div
      className={cn(
        'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white font-sans',
        mode === 'live' || previewImmersive
          ? 'border-0 shadow-none'
          : 'card-elevated-lg border border-slate-200 shadow-lg md:rounded-[2.5rem]',
        estudarQuestaoImmersive && mode === 'live' && 'max-md:min-h-[100dvh]',
      )}
    >
      
      {/* BARRA DE PROGRESSO — posição na lista (não etapas do fluxo) */}
      <div
        className="flex h-2 w-full shrink-0 bg-slate-200"
        role="progressbar"
        aria-valuemin={listaContexto ? 1 : 0}
        aria-valuemax={listaContexto?.total ?? 100}
        aria-valuenow={
          questionListProgressPercent != null
            ? listaContexto!.atual
            : etapa === 'pergunta'
              ? 1
              : etapa === 'gabarito'
                ? 2
                : 3
        }
        aria-label={
          listaContexto
            ? `Progresso na lista: questão ${listaContexto.atual} de ${listaContexto.total}`
            : 'Progresso na questão'
        }
      >
        <div
          className="h-full bg-[#22c55e] transition-all duration-500 ease-out"
          style={{
            width:
              questionListProgressVisualPercent != null
                ? `${questionListProgressVisualPercent}%`
                : etapa === 'pergunta'
                  ? '12%'
                  : etapa === 'gabarito'
                    ? '50%'
                    : '100%',
          }}
        />
      </div>

      {showQuestionZoom ? (
        <ReadableTextZoomProvider contentKey={questionZoomContentKey}>
          {renderQuestionLiveHeader(true)}
          <div
            ref={questionBodyScrollRef}
            data-testid="lesson-scroll-body"
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto touch-pan-y bg-white custom-scrollbar"
          >
            <div className="flex min-w-0 flex-col">{renderQuestionScrollBody(true)}</div>
          </div>
        </ReadableTextZoomProvider>
      ) : (
        <>
          {renderQuestionLiveHeader(false)}
          <div
            ref={questionBodyScrollRef}
            data-testid="lesson-scroll-body"
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto touch-pan-y bg-white custom-scrollbar"
          >
            <div className="flex min-w-0 flex-col">{renderQuestionScrollBody(false)}</div>
          </div>
        </>
      )}

      {/* Gabarito + CTA estudo reverso (app e preview do laboratório) */}
      <AnimatePresence>
        {etapa === 'gabarito' && gabarito !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 shrink-0 overflow-hidden border-t border-b border-slate-200 bg-white shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.06)]"
          >
            <div className="p-4 sm:p-5 md:p-6">
              <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:gap-5 md:flex-row">
                <div
                  className="flex items-center gap-4"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner sm:h-14 sm:w-14 ${
                      respostaAcertou
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                    aria-hidden
                  >
                    {respostaAcertou ? (
                      <CheckCircle2 size={28} />
                    ) : (
                      <XCircle size={28} />
                    )}
                  </div>
                  <div>
                    <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Gabarito
                    </p>
                    <p
                      className={`text-lg font-bold sm:text-xl ${
                        respostaAcertou ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {respostaAcertou ? 'Você acertou!' : 'Você errou'}
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-auto md:max-w-sm">
                  <MicroTip
                    storageKey="reverse-study.feedback-learning"
                    tip={REVERSE_STUDY_MICROTIPS['feedback-learning']}
                    enabled={etapa === 'gabarito'}
                    className="mb-3"
                  />
                  <button
                    ref={ativarEstudoRef}
                    type="button"
                    onClick={() => {
                      setEtapa('estudo');
                      setSlideAtual(0);
                    }}
                    className="btn-editorial-primary flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:gap-3 sm:px-8"
                  >
                    <BrainCircuit size={20} className="shrink-0" />
                    <span className="text-center leading-tight">Ativar estudo reverso</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVEGAÇÃO INFERIOR — fora do scroll: fica fixa no rodapé do card (só app) */}
      {mode === 'live' && (
        <div
          ref={bottomNavRef}
          aria-busy={navegacaoIndisponivel || undefined}
          className="z-10 shrink-0 border-t border-slate-200 bg-white shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.06)] pb-safe"
          style={bottomNavPaddingBottom ? { paddingBottom: bottomNavPaddingBottom } : undefined}
        >
          {/* Navegação inline: Anterior | carrossel de dots (máx. 5) | Próxima/Concluir */}
          <div className="w-full min-w-0 px-1 pb-2 pt-1 sm:px-4 sm:pb-3">
            <div className="flex h-14 w-full min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label={navegacaoStatusLabel ?? 'Anterior'}
                onClick={() => anteriorSlug && handleNavegar(anteriorSlug)}
                onMouseEnter={() => {
                  if (!navegacaoBloqueada) prefetchSlug(anteriorSlug);
                }}
                onFocus={() => {
                  if (!navegacaoBloqueada) prefetchSlug(anteriorSlug);
                }}
                disabled={!anteriorSlug || navegacaoIndisponivel}
                className={`flex h-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 font-bold uppercase text-[10px] tracking-wide transition-all sm:gap-2 sm:px-4 sm:text-xs ${
                  anteriorSlug && !navegacaoIndisponivel
                    ? 'btn-editorial-outline text-slate-700 active:scale-[0.97]'
                    : 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <ArrowLeft size={22} className="shrink-0" aria-hidden />
                <span className="hidden sm:inline">{navegacaoStatusLabel ?? 'Anterior'}</span>
              </button>

              {dotsNavItems.length > 0 ? (
                <div
                  className="relative mx-0.5 flex min-w-0 flex-1 items-center justify-center overflow-hidden sm:mx-1"
                  aria-label={
                    listaContexto
                      ? `Navegação entre questões, questão ${listaContexto.atual} de ${listaContexto.total}`
                      : 'Navegação entre questões'
                  }
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={dotsWindowKey}
                      initial={
                        prefersReducedMotion
                          ? false
                          : { x: dotsSlideDirection * 28, opacity: 0.55 }
                      }
                      animate={{ x: 0, opacity: 1 }}
                      exit={
                        prefersReducedMotion
                          ? undefined
                          : { x: dotsSlideDirection * -28, opacity: 0.55 }
                      }
                      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                      className="flex w-full flex-nowrap items-center justify-center gap-1.5 sm:gap-2"
                    >
                      {dotsNavItems.map((item) => {
                        const q = item.questao;
                        const isCurrent = q.slug === moduloSlug;
                        const posicaoLista = q.indice;
                        return (
                          <button
                            key={q.slug}
                            ref={isCurrent ? questaoAtualDotRef : undefined}
                            type="button"
                            disabled={navegacaoIndisponivel}
                            onClick={() => {
                              handleNavegar(`${q.slug}${buildNavegacaoSuffix()}`);
                            }}
                            onMouseEnter={() => {
                              if (navegacaoBloqueada) return;
                              prefetchSlug(`${q.slug}${buildNavegacaoSuffix()}`);
                            }}
                            onFocus={() => {
                              if (navegacaoBloqueada) return;
                              prefetchSlug(`${q.slug}${buildNavegacaoSuffix()}`);
                            }}
                            title={`Questão ${posicaoLista}${q.estudada ? ' — estudo reverso concluído' : ''}`}
                            aria-label={`Questão ${posicaoLista}${isCurrent ? ', atual' : ''}${q.estudada ? ', estudo reverso concluído' : ''}`}
                            aria-current={isCurrent ? 'step' : undefined}
                            className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span
                              className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                                isCurrent
                                  ? 'h-7 w-7 bg-[#22c55e] ring-2 ring-[rgba(34,197,94,0.40)] ring-offset-1 ring-offset-white shadow-md'
                                  : q.estudada
                                    ? 'h-5 w-5 bg-emerald-500 hover:bg-emerald-600'
                                    : 'h-5 w-5 bg-slate-300 hover:bg-slate-400'
                              }`}
                              aria-hidden
                            >
                              {isCurrent && (
                                <span className="text-[10px] font-black leading-none text-slate-900">
                                  {posicaoLista}
                                </span>
                              )}
                              {!isCurrent && q.estudada && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                                  <path
                                    d="M2 5l2.5 2.5L8 3"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="min-w-0 flex-1" aria-hidden />
              )}

              {proximaSlug ? (
                <button
                  type="button"
                  aria-label={navegacaoStatusLabel ?? 'Próxima'}
                  onClick={() => proximaSlug && handleNavegar(proximaSlug)}
                  onMouseEnter={() => {
                    if (!navegacaoBloqueada) prefetchSlug(proximaSlug);
                  }}
                  onFocus={() => {
                    if (!navegacaoBloqueada) prefetchSlug(proximaSlug);
                  }}
                  disabled={navegacaoIndisponivel}
                  className="btn-editorial-primary flex h-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 font-black uppercase text-[10px] tracking-wide transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-xs"
                >
                  <span className="hidden sm:inline">{navegacaoStatusLabel ?? 'Próxima Questão'}</span>
                  <span className="sm:hidden">{navegacaoStatusLabel ?? 'Próxima'}</span>
                  <ArrowRight size={22} className="shrink-0" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={
                    fromPlano ? 'Concluir Plano' : fromCaderno ? 'Concluir Caderno' : 'Concluir Missão'
                  }
                  onClick={handleConcluir}
                  className="flex h-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#22c55e] px-3 font-black uppercase text-[10px] tracking-wide text-slate-900 transition-all hover:bg-[#7acc1a] hover:shadow-md active:scale-[0.97] sm:gap-2 sm:px-4 sm:text-xs"
                >
                  <span className="hidden sm:inline">
                    {fromPlano ? 'Concluir Plano' : fromCaderno ? 'Concluir Caderno' : 'Concluir Missão'}
                  </span>
                  <Flag size={20} className="shrink-0" aria-hidden />
                </button>
              )}
            </div>

            {dotsNavItems.length > 0 ? (
              <>
                <p className="sr-only">Verde = estudo reverso concluído</p>
                <MicroTip
                  storageKey="reverse-study.dots-meaning"
                  tip={REVERSE_STUDY_MICROTIPS['dots-meaning']}
                  enabled={dotsNavItems.length > 0}
                  className="mb-2"
                />
              </>
            ) : null}
          </div>
          {gabarito !== null && !estudoConcluido && etapa === 'gabarito' && (
            <div className="flex justify-center px-3 pb-1.5" role="status">
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800">
                Estudo reverso pendente
              </span>
            </div>
          )}
          {showStaleRetry && (
            <div className="flex justify-center px-3 pt-2">
              <button
                type="button"
                onClick={handleStaleRetry}
                className="link-editorial-secondary text-[10px] font-semibold uppercase tracking-wide hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Estudo Reverso — fullscreen (portal) no app; embutido no card na demo da LP */}
      <EstudoReversoHost preview={isPreviewMode}>
      <AnimatePresence>
        {etapa === 'estudo' && (
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={
              isPreviewMode
                ? cn(
                    'absolute inset-0 z-30 flex h-full max-h-full flex-col overflow-hidden bg-slate-100 overscroll-y-contain',
                    previewImmersive ? 'rounded-none' : 'rounded-b-[2rem]',
                  )
                : cn(
                    'fixed inset-x-0 top-0 flex flex-col overflow-hidden bg-slate-100 overscroll-y-contain',
                    estudarQuestaoImmersive
                      ? ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM_IMMERSIVE
                      : ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM,
                    ESTUDO_REVERSO_DESKTOP_INSET,
                    'h-full max-h-full',
                    ESTUDO_REVERSO_FULLSCREEN_Z,
                  )
            }
          >
            {/* overflow-y: contido no filho (scroll vertical). overflow-x: auto para texto ampliado (zoom) não ser cortado. */}
            <EstudoReversoSlideZoomProvider key={slideAtual} slideKey={slideAtual}>
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-auto overflow-y-hidden">
              
              {/* Header Minimalista (Top Bar) — zoom mobile ao lado da numeração, fixo fora da rolagem do slide */}
              <div className="shrink-0 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-6 md:px-8 sm:pt-[max(1.5rem,env(safe-area-inset-top,0px))] flex justify-between items-center gap-2 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="btn-editorial-primary shrink-0 rounded-lg p-2">
                    <Lightbulb size={20} className="text-[#1a2e05]" aria-hidden />
                  </div>
                  <span className="hidden sm:inline truncate max-w-[120px] text-xs font-bold uppercase tracking-widest text-slate-500 md:max-w-none">
                    Avant Neuro-Learning
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-baseline gap-0.5 whitespace-nowrap font-mono tabular-nums">
                      <span className={`text-xl sm:text-2xl font-black ${slideCounterColor}`}>
                        {slideAtual + 1}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-400">
                        /{totalSlides}
                      </span>
                    </div>
                    <EstudoReversoSlideZoomToolbar />
                  </div>
                  
                  <button
                    ref={fecharEstudoRef}
                    type="button"
                    onClick={sairEstudoReverso}
                    className={
                      isPreviewMode
                        ? 'btn-editorial-outline flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest'
                        : 'flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50'
                    }
                    aria-label="Fechar estudo reverso"
                  >
                    <X size={18} className="shrink-0 text-slate-700" />
                    {isPreviewMode ? <span>Sair</span> : null}
                  </button>
                </div>
              </div>

              {showSlidesFallbackBanner ? (
                <div
                  className="mx-auto w-full shrink-0 px-4 pb-2 sm:px-6 md:px-8"
                  role="status"
                >
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-[11px] font-semibold text-amber-900 sm:text-xs">
                    {SLIDES_LAYER_FALLBACK_BANNER}
                  </p>
                </div>
              ) : null}

              {/* Sem overflow-x-hidden: com zoom mobile o conteúdo pode ultrapassar a largura — rolagem horizontal fica no EstudoReversoSlideZoom / pai. */}
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
                {showSlidesLoading ? (
                  <div
                    className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12"
                    aria-busy="true"
                    aria-live="polite"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-[#22c55e]" aria-hidden />
                    <p className="text-center text-sm font-semibold text-slate-600">
                      Carregando material…
                    </p>
                  </div>
                ) : showSlidesLoadError ? (
                  <div
                    className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12"
                    role="alert"
                  >
                    <p className="max-w-md text-center text-sm text-slate-600">{slidesLoadError}</p>
                    <div className="flex flex-col items-center gap-3">
                      {!slidesAccessDenied ? (
                        <button
                          type="button"
                          onClick={retrySlidesLoad}
                          className="btn-editorial-outline min-h-[44px] rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest"
                        >
                          Tentar de novo
                        </button>
                      ) : null}
                      {slidesAccessDenied ? (
                        <button
                          type="button"
                          onClick={handleVoltarLista}
                          className="btn-editorial-outline min-h-[44px] rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest"
                        >
                          Voltar à vitrine
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                <>
                <div className="mx-auto w-full shrink-0 px-4 pb-2 sm:px-6 md:px-8">
                  <MicroTip
                    storageKey="reverse-study.intro"
                    tip={REVERSE_STUDY_MICROTIPS['reverse-study-intro']}
                    enabled={etapa === 'estudo' && slideAtual === 0}
                    className="bg-white/95"
                  />
                  {currentSlideMicrotipKey ? (
                    <MicroTip
                      storageKey={`reverse-study.${currentSlideMicrotipKey}`}
                      tip={REVERSE_STUDY_MICROTIPS[currentSlideMicrotipKey]}
                      enabled={etapa === 'estudo'}
                      className="mt-2 bg-white/95"
                    />
                  ) : null}
                </div>
                <EstudoReversoSlideZoom>
                  {totalSlides > 0 && currentSlide ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`slide-${slideAtual}-${slideKind}`}
                      initial={slideMotion.initial}
                      animate={slideMotion.animate}
                      exit={slideMotion.exit}
                      transition={slideMotion.transition}
                      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch"
                    >
                      <EstudoReversoSlideSwipe
                        canSwipePrev={slideAtual > 0}
                        canSwipeNext={slideAtual < totalSlides - 1}
                        onSwipePrev={() => setSlideAtual(Math.max(0, slideAtual - 1))}
                        onSwipeNext={() => setSlideAtual(Math.min(totalSlides - 1, slideAtual + 1))}
                      >
                        <NeuroSlide
                          data={currentSlide}
                          questionHash={questionHash}
                          questionSlug={moduloSlug || activeDados.modulo_slug}
                          slideIndex={slideAtual}
                          questionFamilyId={questionFamilyId}
                          shellContext={{
                            slideIndex: slideAtual,
                            totalSlides,
                            banca: activeDados.meta?.banca,
                          }}
                        />
                      </EstudoReversoSlideSwipe>
                    </motion.div>
                  </AnimatePresence>
                  ) : null}
                </EstudoReversoSlideZoom>
                </>
                )}
              </div>

              {/* Footer de Navegação (Bottom Bar) */}
              <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 md:px-8 sm:py-6 pb-safe">
                <div className="mx-auto flex w-full max-w-none flex-wrap items-center justify-center gap-3 sm:justify-between sm:gap-4">
                  
                  {/* Botão Anterior */}
                  <button 
                    type="button"
                    onClick={() => setSlideAtual(Math.max(0, slideAtual - 1))} 
                    disabled={slideAtual === 0 || totalSlides === 0} 
                    className="btn-editorial-outline order-1 flex min-h-[44px] items-center gap-2 rounded-full px-3 text-[10px] font-bold uppercase tracking-wide sm:order-none sm:text-xs sm:tracking-widest disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={16} /> Voltar
                  </button>
                  
                  {/* Indicadores de Progresso */}
                  <div className="flex gap-1.5 sm:gap-2 order-3 sm:order-none w-full sm:w-auto justify-center basis-full sm:basis-auto">
                    {slidesArray?.map((_, i: number) => (
                      <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i === slideAtual 
                            ? 'w-8 sm:w-10 bg-[#22c55e]' 
                            : 'w-2 bg-slate-200'
                        }`} 
                      />
                    ))}
                  </div>
                  
                  {/* Botão Próximo / Confirmação no último slide */}
                  {totalSlides === 0 ? (
                    <span className="order-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:order-none">
                      {showSlidesLoading ? 'Aguarde…' : showSlidesLoadError ? 'Material indisponível' : ''}
                    </span>
                  ) : slideAtual < totalSlides - 1 ? (
                    <button 
                      type="button"
                      onClick={() => setSlideAtual(slideAtual + 1)} 
                      className="btn-editorial-primary group order-2 flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide sm:order-none sm:px-6 sm:py-3 sm:text-xs sm:tracking-widest"
                    >
                      Próximo <ArrowRight size={16} />
                    </button>
                  ) : isPreviewMode ? (
                    <button
                      type="button"
                      onClick={sairEstudoReverso}
                      className="btn-editorial-outline group order-2 flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-wide sm:order-none sm:px-6 sm:text-xs sm:tracking-widest"
                    >
                      Voltar à questão
                    </button>
                  ) : estudoConcluido ? (
                    <div className="flex w-full max-w-md flex-col items-stretch gap-3 order-2 sm:order-none sm:max-w-lg">
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-green-800 sm:text-xs sm:tracking-widest">
                        <BadgeCheck size={16} className="shrink-0" aria-hidden />
                        Estudo concluído
                      </div>
                      <MicroTip
                        storageKey="reverse-study.study-completed"
                        tip={REVERSE_STUDY_MICROTIPS['study-completed']}
                        enabled={estudoConcluido}
                        className="max-w-none bg-white/95 text-slate-900"
                      />
                      {proximaSlug ? (
                        <button
                          type="button"
                          onClick={() => proximaSlug && handleNavegar(proximaSlug)}
                          onMouseEnter={() => prefetchSlug(proximaSlug)}
                          onFocus={() => prefetchSlug(proximaSlug)}
                          disabled={navegacaoIndisponivel}
                          className="btn-editorial-primary group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-wide transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs sm:tracking-widest"
                        >
                          Próxima questão
                          <ArrowRight size={18} className="shrink-0" aria-hidden />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={sairEstudoReverso}
                          className="btn-editorial-outline flex min-h-[48px] w-full items-center justify-center rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-wide sm:text-xs sm:tracking-widest"
                        >
                          Voltar à questão
                        </button>
                      )}
                    </div>
                  ) : (
                    <motion.div layout className="flex flex-col items-end gap-2 order-2 sm:order-none max-w-[min(100%,280px)] sm:max-w-none">
                    <button
                      type="button"
                      onClick={marcarEstudoConcluido}
                      disabled={marcandoConclusao}
                      className="btn-editorial-primary group flex min-h-[44px] w-full max-w-[min(100%,280px)] items-center gap-2 rounded-full px-3 py-2.5 text-[9px] font-black uppercase tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:max-w-none sm:px-6 sm:py-3 sm:text-xs sm:tracking-widest"
                    >
                      <BadgeCheck size={16} className="shrink-0" />
                      <span className="text-left leading-tight">
                        {marcandoConclusao ? 'Salvando...' : (
                          <>
                            <span className="sm:hidden">Marcar estudado</span>
                            <span className="hidden sm:inline">Marcar como Estudado</span>
                          </>
                        )}
                      </span>
                    </button>
                    {conclusaoErro ? (
                      <p role="alert" className="max-w-[280px] text-right text-[10px] leading-snug text-rose-600 sm:text-xs">
                        {conclusaoErro}
                      </p>
                    ) : null}
                    </motion.div>
                  )}
                </div>
              </div>

            </div>
            </EstudoReversoSlideZoomProvider>
          </motion.div>
        )}
      </AnimatePresence>
      </EstudoReversoHost>
    </div>

    {mode === 'live' ? (
      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        resetEm={resetEm}
      />
    ) : null}
    </>
  );
}
