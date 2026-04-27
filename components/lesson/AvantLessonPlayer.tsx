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

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NeuroSlide from '@/components/slides/NeuroSlide';
import {
  EstudoReversoSlideZoom,
  EstudoReversoSlideZoomProvider,
  EstudoReversoSlideZoomToolbar,
} from '@/components/lesson/EstudoReversoSlideZoom';
import { MicroTip } from '@/components/onboarding/MicroTip';
import {
  getReverseStudySlideMicrotipKey,
  REVERSE_STUDY_MICROTIPS,
} from '@/components/onboarding/reverseStudyMicrotips';
import { logger } from '@/lib/logger';
import { sanitizeHTML } from '@/lib/validations';
import {
  buildDerivedQuestionHeaderLine,
  buildQuestionSubjectLine,
  stripLeadingQuestionEnumeration,
} from '@/lib/questionHeader';
import { isCertoErradoQuestion } from '@/lib/questionKind';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { supabase } from '@/lib/supabase/client';
import type { AvantLessonPlayerProps, LessonData, ReverseStudySlide } from '@/types/lesson';
import { 
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, 
  Lightbulb, ArrowRight, ArrowLeft, 
  Flag, BrainCircuit, X, BadgeCheck
} from 'lucide-react';

export default function AvantLessonPlayer({ 
  dados, 
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
}: AvantLessonPlayerProps) {
  
  const router = useRouter();
  const bottomNavRef = useRef<HTMLDivElement>(null);
  const questaoAtualDotRef = useRef<HTMLButtonElement | null>(null);
  /** Área com overflow-y-auto (enunciado + alternativas). Ref usada para wheel sobre <button>. */
  const questionBodyScrollRef = useRef<HTMLDivElement>(null);
  /** Bloco do botão Confirmar — scroll após escolher alternativa para não exigir rolar manualmente. */
  const confirmarRespostaRef = useRef<HTMLDivElement>(null);
  const [bottomNavHeightPx, setBottomNavHeightPx] = useState(0);

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
  }, [mode, questoesDoAssunto?.length]);

  /** Garante que a bolinha da questão atual fique visível na faixa rolável (listas longas). */
  useLayoutEffect(() => {
    if (mode !== 'live' || !questoesDoAssunto?.length) return;
    const btn = questaoAtualDotRef.current;
    if (!btn) return;
    btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [mode, moduloSlug, questoesDoAssunto?.length]);

  // ============================================================================
  // ESTADOS (Pure React V15)
  // ============================================================================
  const [etapa, setEtapa] = useState<'pergunta' | 'gabarito' | 'estudo'>('pergunta');
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [slideAtual, setSlideAtual] = useState(0);
  const [estudoConcluido, setEstudoConcluido] = useState(false);
  const [marcandoConclusao, setMarcandoConclusao] = useState(false);

  // Reset ao mudar de questão
  useEffect(() => {
    setEtapa('pergunta');
    setSelecionada(null);
    setSlideAtual(0);
    setEstudoConcluido(false);
    setMarcandoConclusao(false);
  }, [dados]);

  /** Após escolher uma alternativa, leva o botão Confirmar para a área visível do scroll. */
  useLayoutEffect(() => {
    if (etapa !== 'pergunta' || !selecionada) return;
    const el = confirmarRespostaRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [selecionada, etapa]);

  const examHeaderLine = useMemo(() => {
    if (!dados?.meta) return '';
    const raw = dados.meta.header_line?.trim();
    if (raw) return raw;
    return buildDerivedQuestionHeaderLine(dados.meta);
  }, [dados?.meta]);

  const subjectLine = useMemo(() => {
    if (!dados?.meta) return null;
    return buildQuestionSubjectLine(dados.meta);
  }, [dados?.meta]);

  const instructionParaExibicao = useMemo(() => {
    const raw = dados?.question_data?.instruction;
    if (!raw) return '';
    return stripLeadingQuestionEnumeration(raw);
  }, [dados?.question_data?.instruction]);

  if (!dados || !dados.question_data) return null;

  const certoErradoLayout = isCertoErradoQuestion(dados.question_data.options);

  // ============================================================================
  // LÓGICA DE BANCO (Supabase)
  // ============================================================================
  const postWithSessionRetry = async (url: string, payload: Record<string, unknown>) => {
    const doPost = () =>
      fetchWithAuth(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

    let response = await doPost();
    if (response.status !== 401) return response;

    // Token pode ter vencido: renova no browser (único ponto de refresh) e reenvia com Bearer.
    await supabase.auth.getSession();
    return doPost();
  };

  const registrarTentativa = async (opcaoId: string) => {
    if (mode === 'preview') return;

    try {
      const opcaoEscolhida = dados.question_data.options.find((o: any) => o.id === opcaoId);
      const acertou = opcaoEscolhida?.is_correct || false;

      // Usa API route para registrar E invalidar o cache do histórico imediatamente
      const response = await postWithSessionRetry('/api/registrar-tentativa', {
        modulo_slug: moduloSlug || dados.modulo_slug || 'slug-legacy',
        acertou,
        banca: dados.meta?.banca || 'DESCONHECIDA',
        topico: dados.meta?.topico || 'Geral',
        subtopico: dados.meta?.subtopico || dados.meta?.topico || 'Geral',
      });

      if (!response.ok) {
        if (response.status === 401) {
          logger.warn('Attempt not registered: unauthorized after session retry', { moduloSlug });
          return;
        }
        logger.error('Failed to register attempt via API', { status: response.status, moduloSlug });
      }
    } catch (error) {
      logger.error('Unexpected error registering attempt', error);
      // Não interromper o fluxo do usuário em caso de erro
    }
  };

  // ============================================================================
  // MARCAR ESTUDO REVERSO COMO CONCLUÍDO
  // ============================================================================
  const marcarEstudoConcluido = async () => {
    if (mode === 'preview' || marcandoConclusao || estudoConcluido) return;
    setMarcandoConclusao(true);
    try {
      const slug = moduloSlug || dados.modulo_slug || '';
      const response = await postWithSessionRetry('/api/concluir-estudo-reverso', { modulo_slug: slug });
      if (response.ok) {
        setEstudoConcluido(true);
      } else {
        if (response.status === 401) {
          logger.warn('Could not mark estudo concluido: unauthorized after session retry', { moduloSlug: slug });
          return;
        }
        logger.error('Failed to mark estudo reverso as concluido', { status: response.status });
      }
    } catch (error) {
      logger.error('Unexpected error marking estudo reverso', error);
    } finally {
      setMarcandoConclusao(false);
    }
  };

  // ============================================================================
  // NAVEGAÇÃO
  // ============================================================================
  const handleNavegar = (slugComQuery: string) => {
    router.push(`/estudar/${slugComQuery}`);
  };

  const handleVoltarLista = () => {
    if (fromPlano) return router.push('/plano-diario');
    // Lista "Meus cadernos" — não a página de edição `/cadernos/[id]`
    if (fromCaderno) return router.push('/cadernos');
    router.push('/estudar');
  };

  const handleConcluir = () => {
    if (fromPlano) return router.push('/plano-diario');
    if (fromCaderno) return router.push('/cadernos');
    router.push('/estudar');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const questionSubject = dados.meta.topico || dados.meta.subtopico || 'Geral';
  const subtopicLabel = dados.meta.subtopico
    ? `Subtópico: ${dados.meta.subtopico}`
    : dados.meta.topico
      ? `Tópico: ${dados.meta.topico}`
      : 'Revisão guiada por estudo reverso';

  const slidesSource = ((dados.reverse_study_slides || (dados as any).study_slides) ?? []) as LessonData['reverse_study_slides'];
  const fallbackSlide: ReverseStudySlide = {
    type: 'golden_rule',
    layout_type: 'golden_rule',
    structure: {
      header: {
        title: `Estudo reverso: ${questionSubject}`,
        subtitle: subtopicLabel,
      },
      main_text: dados.question_data.instruction,
      footer_rule: dados.question_data.instruction,
    },
    design_system: {
      accent_color: 'cyan',
    },
    subject: questionSubject,
    meta: {
      topico: dados.meta.topico,
      subtopico: dados.meta.subtopico,
    },
  };

  const normalizeStructure = (structure?: ReverseStudySlide['structure']) => {
    if (!structure) return undefined;
    const headerBase = structure.header || { title: '' };
    const fallbackTitle = dados.question_data.instruction || questionSubject;
    const fallbackSubtitle = headerBase.subtitle || subtopicLabel;
    return {
      ...structure,
      header: {
        ...headerBase,
        title: headerBase.title || fallbackTitle,
        subtitle: headerBase.subtitle || fallbackSubtitle,
      },
      footer_rule: structure.footer_rule || dados.question_data.instruction || `Revisão de ${questionSubject}`,
    };
  };

  const normalizeSlide = (slide: ReverseStudySlide): ReverseStudySlide => ({
    ...slide,
    subject: slide.subject || questionSubject,
    meta: {
      topico: slide.meta?.topico || dados.meta.topico,
      subtopico: slide.meta?.subtopico || dados.meta.subtopico,
      ...slide.meta,
    },
    structure: normalizeStructure(slide.structure) ?? slide.structure,
  });

  const slidesArray = (slidesSource?.length ? slidesSource : [fallbackSlide]).map(normalizeSlide);
  const currentSlide = slidesArray[slideAtual];
  const currentSlideMicrotipKey = getReverseStudySlideMicrotipKey(currentSlide?.type ?? currentSlide?.layout_type);
  const totalSlides = slidesArray.length;
  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  // Gera hash único e robusto da questão para tema visual único
  // Combina múltiplos fatores para garantir unicidade: instruction + meta + modulo_slug
  const questionHash = [
    dados.question_data?.instruction || '',
    dados.meta?.banca || '',
    dados.meta?.ano || '',
    dados.meta?.topico || '',
    dados.meta?.subtopico || '',
    dados.modulo_slug || '',
  ].filter(Boolean).join('-') || JSON.stringify(dados).substring(0, 100);

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col relative bg-white md:rounded-[40px] shadow-2xl overflow-hidden border border-slate-200/60 ring-1 ring-slate-100 font-sans">
      
      {/* BARRA DE PROGRESSO */}
      <div className="h-2 w-full bg-slate-100 flex shrink-0">
        <div className={`h-full transition-all duration-1000 ease-out ${
          etapa === 'pergunta' ? 'w-1/3 bg-indigo-500' : 
          etapa === 'gabarito' ? 'w-2/3 bg-indigo-600' : 
          'w-full bg-[#BEF264]'
        }`} />
      </div>

      {/* ÁREA DE QUESTÃO (SCROLLÁVEL) */}
      <div
        ref={questionBodyScrollRef}
        data-testid="lesson-scroll-body"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-b from-white to-slate-50/50 flex flex-col touch-pan-y"
      >
        <div className="flex flex-col min-w-0 shrink-0">
          
          {/* Botão Voltar (se mode === 'live') */}
          {mode === 'live' && (
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex flex-wrap items-center justify-between gap-3">
              <button 
                type="button"
                onClick={handleVoltarLista}
                className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px] -ml-1 px-1 rounded-xl"
              >
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
                  <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-medium">
                  {fromPlano ? 'Plano diário' : fromCaderno ? 'Meus cadernos' : 'Vitrine'}
                </span>
              </button>
              {listaContexto && listaContexto.total > 0 && (
                <span
                  className="text-xs sm:text-sm font-semibold tabular-nums text-slate-600 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-full shrink-0"
                  aria-label={`Questão ${listaContexto.atual} de ${listaContexto.total}`}
                >
                  Questão {listaContexto.atual} de {listaContexto.total}
                </span>
              )}
            </div>
          )}

          {/* Cabeçalho estilo caderno: linha da prova + matéria (tópico - subtópico) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="border-b border-slate-200 bg-gradient-to-b from-slate-50/90 to-white px-6 py-4 md:px-8 md:py-5"
          >
            {formatAvantCodigo(avantCodigo) && (
              <p
                className="text-[11px] font-mono font-black text-indigo-600 mb-2 tracking-wide"
                title="Código da questão (igual ao painel admin)"
              >
                {formatAvantCodigo(avantCodigo)}
              </p>
            )}
            <p className="text-sm md:text-[15px] text-slate-700 leading-snug font-medium tracking-tight">
              {examHeaderLine}
            </p>
            {subjectLine && (
              <p className="mt-3 text-base md:text-lg font-semibold text-slate-900 border-l-4 border-indigo-500 pl-3 leading-snug">
                {subjectLine}
              </p>
            )}
          </motion.div>

          {/* ÁREA DE TEXTO DE APOIO (SE HOUVER CITACÃO DE TEXTO) */}
          {dados.question_data.text_fragment && (
              <div className="px-6 pt-6 pb-2">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-slate-700 text-sm font-serif leading-relaxed italic">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(dados.question_data.text_fragment) }} />
                  </div>
              </div>
          )}

          {/* ENUNCIADO: quebras de linha preservadas (I, II, III em blocos) */}
          <div className="px-6 py-6 md:px-8 md:py-8 min-w-0">
            <div className="text-base md:text-lg text-slate-800 leading-relaxed font-normal whitespace-pre-wrap break-words overflow-x-hidden [&_strong]:font-semibold [&_p]:mb-3 [&_p:last-child]:mb-0">
              <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(instructionParaExibicao) }} />
            </div>
          </div>
          
          {/* ALTERNATIVAS (layout dedicado para Certo / Errado) */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeInUp} 
            transition={{ delay: 0.2 }} 
            className="px-6 pb-8 md:px-8"
          >
            <div
              className={
                certoErradoLayout
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto'
                  : 'grid gap-3'
              }
            >
              {dados.question_data.options.map((opt) => {
                const isSelected = selecionada === opt.id;
                const isCorrect = opt.is_correct;
                const showResult = etapa === 'gabarito' || etapa === 'estudo';
                
                let styles = "border-slate-100 bg-white hover:border-slate-300";
                let badge = "bg-slate-100 text-slate-400 group-hover:bg-slate-200";
                let text = "text-slate-600";

                if (showResult) {
                    if (isCorrect) {
                        styles = "border-green-500 bg-green-50 ring-1 ring-green-200";
                        badge = "bg-green-500 text-white shadow-md";
                        text = "text-green-800 font-bold";
                    } else if (isSelected && !isCorrect) {
                        styles = "border-red-400 bg-red-50";
                        badge = "bg-red-500 text-white shadow-md";
                        text = "text-red-800 font-bold";
                    } else {
                        styles = "border-slate-100 bg-slate-50 opacity-50";
                    }
                } else if (isSelected) {
                    styles = "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10";
                    badge = "bg-indigo-600 text-white shadow-md";
                    text = "text-indigo-900 font-bold";
                }

                const rowLayout = certoErradoLayout
                  ? 'flex flex-col items-center justify-center text-center min-h-[100px] sm:min-h-[120px] gap-2 p-6 md:p-8'
                  : 'text-left flex items-start gap-4 p-4 md:p-5';

                return (
                  <motion.button 
                    key={opt.id}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    onClick={() => setSelecionada(opt.id)} 
                    className={`group relative rounded-2xl border-2 transition-all duration-300 ${styles} ${rowLayout}`}
                  >
                    {!certoErradoLayout && (
                      <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors duration-300 ${badge}`}>
                        {opt.id}
                      </span>
                    )}
                    <span className={`font-semibold ${certoErradoLayout ? 'text-lg md:text-xl' : 'font-medium pt-1'} ${text}`}>
                      {opt.text}
                    </span>
                    {showResult && isCorrect && (
                      <div className={`text-green-600 animate-in zoom-in ${certoErradoLayout ? 'mt-1' : 'absolute right-4 top-5'}`}>
                        <CheckCircle2 size={certoErradoLayout ? 32 : 24} />
                      </div>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <div className={`text-red-500 animate-in zoom-in ${certoErradoLayout ? 'mt-1' : 'absolute right-4 top-5'}`}>
                        <XCircle size={certoErradoLayout ? 32 : 24} />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* BOTÃO CONFIRMAR */}
          {etapa === 'pergunta' && selecionada && (
            <motion.div 
              ref={confirmarRespostaRef}
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              className="flex flex-col items-center gap-3 scroll-mt-4 px-6 pt-2 pb-6"
            >
              <MicroTip
                storageKey="reverse-study.answer-before-feedback"
                tip={REVERSE_STUDY_MICROTIPS['answer-before-feedback']}
                enabled={etapa === 'pergunta'}
                className="w-full max-w-xl"
              />
              <button 
                onClick={() => { 
                  setEtapa('gabarito'); 
                  registrarTentativa(selecionada); 
                }} 
                className="group bg-slate-900 text-white pl-8 pr-2 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:scale-105 transition-all flex items-center gap-4"
              >
                Confirmar Resposta
                <span className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center group-hover:bg-[#BEF264] group-hover:text-slate-900 transition-colors">
                  <ChevronRight size={16} />
                </span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* NAVEGAÇÃO INFERIOR — fora do scroll: fica fixa no rodapé do card */}
      {mode === 'live' && (
        <div
          ref={bottomNavRef}
          className="bg-white border-t border-slate-100 shrink-0 z-10 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.08)] pb-safe md:rounded-b-[40px]"
        >
          {/* Dots de status das questões do assunto (rolagem horizontal quando não couber; 1 questão também mostra o indicador) */}
          {questoesDoAssunto && questoesDoAssunto.length > 0 && (
            <div className="w-full min-w-0 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth pt-3 pb-1">
              <div className="mx-auto flex w-max min-w-full flex-nowrap items-center justify-center gap-1.5 px-3 sm:gap-2 sm:px-4">
              {questoesDoAssunto.map((q, i) => {
                const isCurrent = q.slug === moduloSlug;
                return (
                  <button
                    key={q.slug}
                    ref={isCurrent ? questaoAtualDotRef : undefined}
                    onClick={() => {
                      const s = fromPlano
                        ? '?from=plano'
                        : fromCaderno
                          ? `?from=caderno&caderno_id=${fromCaderno}`
                          : vitrineQuerySuffix || '';
                      router.push(`/estudar/${q.slug}${s}`);
                    }}
                    title={`Questão ${i + 1}${q.estudada ? ' — estudada' : ''}`}
                    className={`shrink-0 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isCurrent
                        ? 'w-7 h-7 bg-indigo-600 ring-2 ring-indigo-300 ring-offset-1 shadow-md'
                        : q.estudada
                          ? 'w-5 h-5 bg-emerald-400 hover:bg-emerald-500'
                          : 'w-5 h-5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    {isCurrent && (
                      <span className="text-white text-[10px] font-black leading-none">{i + 1}</span>
                    )}
                    {!isCurrent && q.estudada && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                );
              })}
              </div>
            </div>
          )}
          <div className="px-2 sm:px-4 py-3 flex flex-wrap justify-between items-center gap-2">
            <button 
              type="button"
              onClick={() => anteriorSlug && handleNavegar(anteriorSlug)} 
              disabled={!anteriorSlug} 
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-wide sm:tracking-widest transition-all min-h-[44px] ${
                anteriorSlug ? 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600' : 'text-slate-200 cursor-not-allowed'
              }`}
            >
              <ArrowLeft size={16} /> <span>Anterior</span>
            </button>
            {proximaSlug ? (
              <button 
                type="button"
                onClick={() => proximaSlug && handleNavegar(proximaSlug)} 
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-indigo-50 text-indigo-700 font-black uppercase text-[10px] sm:text-xs tracking-wide sm:tracking-widest hover:bg-indigo-100 transition-all min-h-[44px]"
              >
                <span className="sm:hidden">Próxima</span>
                <span className="hidden sm:inline">Próxima Questão</span>
                <ArrowRight size={16} className="shrink-0" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleConcluir} 
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#BEF264] text-slate-900 font-black uppercase text-[10px] sm:text-xs tracking-wide sm:tracking-widest hover:bg-[#a3d648] hover:shadow-lg transition-all min-h-[44px]"
              >
                <span className="max-[380px]:hidden">
                  {fromPlano ? 'Concluir Plano' : fromCaderno ? 'Concluir Caderno' : 'Concluir Missão'}
                </span>
                <span className="hidden max-[380px]:inline">
                  {fromPlano ? 'Plano' : fromCaderno ? 'Caderno' : 'Fim'}
                </span>
                <Flag size={16} className="shrink-0" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TOAST GABARITO */}
      <AnimatePresence>
        {etapa === 'gabarito' && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            className="absolute left-0 right-0 z-20"
            style={{ bottom: bottomNavHeightPx }}
          >
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 pb-safe sm:p-6 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-500'
                  }`}>
                    {dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct ? (
                      <CheckCircle2 size={32} />
                    ) : (
                      <XCircle size={32} />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">
                      Diagnóstico
                    </p>
                    <p className={`text-xl font-black italic tracking-tighter uppercase ${
                      dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct 
                        ? 'text-green-600' 
                        : 'text-red-500'
                    }`}>
                      {dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct 
                        ? 'Resposta Correta' 
                        : 'Resposta Incorreta'}
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
                    type="button"
                    onClick={() => { 
                      setEtapa('estudo'); 
                      setSlideAtual(0); 
                    }}
                    className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold uppercase text-[10px] sm:text-[11px] tracking-wide sm:tracking-widest shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 sm:gap-3 transition-all sm:hover:-translate-y-1"
                  >
                    <BrainCircuit size={18} className="shrink-0" /> 
                    <span className="text-center leading-tight">Ativar Estudo Reverso</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================
          MODAL FULL IMMERSION (Estudo Reverso)
          ======================================================================== */}
      <AnimatePresence>
        {etapa === 'estudo' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md pt-safe h-[100dvh] max-h-[100dvh] overscroll-y-contain"
          >
            {/* overflow-y: contido no filho (scroll vertical). overflow-x: auto para texto ampliado (zoom) não ser cortado. */}
            <EstudoReversoSlideZoomProvider slideKey={slideAtual}>
            <div className="w-full flex-1 min-h-0 max-h-[100dvh] flex flex-col overflow-y-hidden overflow-x-auto min-w-0">
              
              {/* Header Minimalista (Top Bar) — zoom mobile ao lado da numeração, fixo fora da rolagem do slide */}
              <div className="shrink-0 px-4 sm:px-6 md:px-12 pt-3 sm:pt-6 pb-2 flex justify-between items-center gap-2 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-[#BEF264] text-slate-900 p-2 rounded-lg shrink-0">
                    <Lightbulb size={20} fill="black" />
                  </div>
                  <span className="hidden sm:inline text-white/60 font-bold uppercase text-xs tracking-widest truncate max-w-[120px] md:max-w-none">
                    Avant Neuro-Learning
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-[#BEF264] font-black text-xl sm:text-2xl opacity-60 italic tabular-nums whitespace-nowrap">
                      {slideAtual + 1}/{totalSlides}
                    </div>
                    <EstudoReversoSlideZoomToolbar />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setEtapa('pergunta')}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors shrink-0"
                    aria-label="Fechar estudo reverso"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Sem overflow-x-hidden: com zoom mobile o conteúdo pode ultrapassar a largura — rolagem horizontal fica no EstudoReversoSlideZoom / pai. */}
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="mx-auto w-full max-w-5xl shrink-0 px-4 pb-2 sm:px-6 md:px-12">
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
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`slide-${slideAtual}-${currentSlide?.type || 'default'}-${JSON.stringify(currentSlide).substring(0, 20)}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="flex w-full min-w-0 flex-col items-center"
                    >
                      <NeuroSlide
                        data={currentSlide}
                        questionHash={questionHash}
                        slideIndex={slideAtual}
                      />
                    </motion.div>
                  </AnimatePresence>
                </EstudoReversoSlideZoom>
              </div>

              {/* Footer de Navegação (Bottom Bar) */}
              <div className="shrink-0 bg-black/40 backdrop-blur-xl border-t border-white/5 px-4 sm:px-6 md:px-12 py-4 sm:py-6 pb-safe">
                <div className="flex flex-wrap justify-center sm:justify-between items-center gap-3 sm:gap-4 max-w-6xl mx-auto">
                  
                  {/* Botão Anterior */}
                  <button 
                    type="button"
                    onClick={() => setSlideAtual(Math.max(0, slideAtual - 1))} 
                    disabled={slideAtual === 0} 
                    className="flex items-center gap-2 text-white/60 font-bold uppercase text-[10px] sm:text-xs tracking-wide sm:tracking-widest hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] px-1 order-1 sm:order-none"
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
                            ? 'w-8 sm:w-10 bg-[#BEF264]' 
                            : 'w-2 bg-white/20'
                        }`} 
                      />
                    ))}
                  </div>
                  
                  {/* Botão Próximo / Confirmação no último slide */}
                  {slideAtual < totalSlides - 1 ? (
                    <button 
                      type="button"
                      onClick={() => setSlideAtual(slideAtual + 1)} 
                      className="group bg-white text-slate-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-wide sm:tracking-widest hover:bg-[#BEF264] transition-all flex items-center gap-2 min-h-[44px] order-2 sm:order-none"
                    >
                      Próximo <ArrowRight size={16} />
                    </button>
                  ) : estudoConcluido ? (
                    <div className="flex flex-col items-stretch gap-2 order-2 sm:order-none">
                      <div className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-black uppercase text-[10px] sm:text-xs tracking-wide sm:tracking-widest text-center">
                        <BadgeCheck size={16} className="shrink-0" />
                        Estudo Concluído!
                      </div>
                      <MicroTip
                        storageKey="reverse-study.study-completed"
                        tip={REVERSE_STUDY_MICROTIPS['study-completed']}
                        enabled={estudoConcluido}
                        className="max-w-sm bg-white/95 text-slate-900"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={marcarEstudoConcluido}
                      disabled={marcandoConclusao}
                      className="group flex items-center gap-2 bg-[#BEF264] hover:bg-[#a3d648] disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black uppercase text-[9px] sm:text-xs tracking-wide sm:tracking-widest shadow-[0_0_20px_rgba(190,242,100,0.3)] transition-all min-h-[44px] order-2 sm:order-none max-w-[min(100%,280px)] sm:max-w-none"
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
                  )}
                </div>
              </div>

            </div>
            </EstudoReversoSlideZoomProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
