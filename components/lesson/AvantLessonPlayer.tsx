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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import NeuroSlide from '@/components/slides/NeuroSlide';
import type { AvantLessonPlayerProps, LessonData } from '@/types/lesson';
import { 
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, 
  Layers, Lightbulb, ArrowRight, ArrowLeft, 
  Flag, Building2, BrainCircuit, X
} from 'lucide-react';

export default function AvantLessonPlayer({ 
  dados, 
  mode = 'live', 
  proximaSlug, 
  anteriorSlug,
  moduloSlug 
}: AvantLessonPlayerProps) {
  
  const router = useRouter();
  
  // ============================================================================
  // ESTADOS (Pure React V15)
  // ============================================================================
  const [etapa, setEtapa] = useState<'pergunta' | 'gabarito' | 'estudo'>('pergunta');
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [slideAtual, setSlideAtual] = useState(0);

  // Reset ao mudar de questão
  useEffect(() => {
    setEtapa('pergunta');
    setSelecionada(null);
    setSlideAtual(0);
  }, [dados]);

  if (!dados || !dados.question_data) return null;

  // ============================================================================
  // LÓGICA DE BANCO (Supabase)
  // ============================================================================
  const registrarTentativa = async (opcaoId: string) => {
    if (mode === 'preview') return;

    const opcaoEscolhida = dados.question_data.options.find((o: any) => o.id === opcaoId);
    const acertou = opcaoEscolhida?.is_correct || false;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        await supabase.from('historico_questoes').insert({
            user_id: user.id,
            modulo_slug: moduloSlug || dados.modulo_slug || 'slug-legacy',
            acertou: acertou,
            banca: dados.meta?.banca || 'DESCONHECIDA',
            topico: dados.meta?.topico || 'Geral',
            subtopico: dados.meta?.subtopico || dados.meta?.topico || 'Geral'
        });
    }
  };

  // ============================================================================
  // NAVEGAÇÃO
  // ============================================================================
  const handleNavegar = (slug: string) => router.push(`/estudar/${slug}`);
  const handleConcluir = () => router.push('/estudar');

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  // Fallback para 'study_slides' caso mude a chave no futuro JSON
  const slidesArray = (dados.reverse_study_slides || (dados as any).study_slides || []) as LessonData['reverse_study_slides'];
  const currentSlide = slidesArray?.[slideAtual];
  const totalSlides = slidesArray?.length || 0;
  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  // Gera hash único da questão para tema visual único
  const questionHash = dados.question_data?.instruction || dados.modulo_slug || JSON.stringify(dados).substring(0, 50);

  return (
    <div className="w-full h-full flex flex-col relative bg-white md:rounded-[40px] shadow-2xl overflow-hidden border border-slate-200/60 ring-1 ring-slate-100 font-sans">
      
      {/* BARRA DE PROGRESSO */}
      <div className="h-2 w-full bg-slate-100 flex shrink-0">
        <div className={`h-full transition-all duration-1000 ease-out ${
          etapa === 'pergunta' ? 'w-1/3 bg-indigo-500' : 
          etapa === 'gabarito' ? 'w-2/3 bg-indigo-600' : 
          'w-full bg-[#BEF264]'
        }`} />
      </div>

      {/* ÁREA DE QUESTÃO (SCROLLÁVEL) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-white to-slate-50/50 flex flex-col">
        <div className="flex-1">
          
          {/* Botão Voltar (se mode === 'live') */}
          {mode === 'live' && (
            <div className="px-6 pt-6 pb-2">
              <button 
                onClick={() => window.location.href = '/estudar'} 
                className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
                  <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-medium">Voltar</span>
              </button>
            </div>
          )}

          {/* ========================================================================
              NOVO HEADER: ESTILO "QCONCURSOS / EXAM SITE"
              ======================================================================== */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeInUp} 
            className="bg-purple-50/50 border-b border-purple-100 px-6 py-3 flex flex-col md:flex-row gap-y-2 gap-x-6 text-sm text-slate-600 font-sans leading-snug"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              
              {/* ANO */}
              {dados.meta.ano && (
                <>
                  <span className="flex items-center gap-1">
                    <strong className="text-purple-700 font-bold">Ano:</strong> 
                    <span>{dados.meta.ano}</span>
                  </span>
                  <span className="hidden md:inline text-purple-200">|</span>
                </>
              )}

              {/* BANCA */}
              <span className="flex items-center gap-1">
                <strong className="text-purple-700 font-bold">Banca:</strong> 
                <span className="text-purple-900 font-semibold">{dados.meta.banca}</span>
              </span>

              <span className="hidden md:inline text-purple-200">|</span>

              {/* ÓRGÃO */}
              {dados.meta.orgao && (
                <>
                  <span className="flex items-center gap-1">
                    <strong className="text-purple-700 font-bold">Órgão:</strong> 
                    <span>{dados.meta.orgao}</span>
                  </span>
                  <span className="hidden md:inline text-purple-200">|</span>
                </>
              )}

              {/* PROVA */}
              {dados.meta.prova && (
                <span className="flex items-center gap-1">
                  <strong className="text-purple-700 font-bold">Prova:</strong> 
                  <span className="truncate max-w-[300px] hover:whitespace-normal transition-all" title={dados.meta.prova}>
                    {dados.meta.prova}
                  </span>
                </span>
              )}
              
            </div>
          </motion.div>

          {/* ÁREA DE TEXTO DE APOIO (SE HOUVER CITACÃO DE TEXTO) */}
          {dados.question_data.text_fragment && (
              <div className="px-6 pt-6 pb-2">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-slate-700 text-sm font-serif leading-relaxed italic">
                      <div dangerouslySetInnerHTML={{ __html: dados.question_data.text_fragment }} />
                  </div>
              </div>
          )}

          {/* ENUNCIADO DA QUESTÃO (ESTILO LIMPO) */}
          <div className="px-6 py-6 md:px-8 md:py-8">
            <p className="text-base md:text-lg text-slate-800 leading-relaxed font-normal">
              {dados.question_data.instruction}
            </p>
          </div>
          
          {/* ALTERNATIVAS */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeInUp} 
            transition={{ delay: 0.2 }} 
            className="px-6 pb-8 md:px-8"
          >
            <div className="grid gap-3">
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

                return (
                  <motion.button 
                    key={opt.id}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.01, backgroundColor: '#F8FAFC' } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    onClick={() => setSelecionada(opt.id)} 
                    className={`group relative p-4 md:p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all duration-300 ${styles}`}
                  >
                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors duration-300 ${badge}`}>
                      {opt.id}
                    </span>
                    <span className={`font-medium pt-1 ${text}`}>
                      {opt.text}
                    </span>
                    {showResult && isCorrect && (
                      <div className="absolute right-4 top-5 text-green-600 animate-in zoom-in">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <div className="absolute right-4 top-5 text-red-500 animate-in zoom-in">
                        <XCircle size={24} />
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
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              className="flex justify-center pt-2"
            >
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

        {/* NAVEGAÇÃO INFERIOR */}
        {mode === 'live' && (
          <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
             <button 
               onClick={() => anteriorSlug && handleNavegar(anteriorSlug)} 
               disabled={!anteriorSlug} 
               className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${
                 anteriorSlug ? 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600' : 'text-slate-200 cursor-not-allowed'
               }`}
             >
                <ArrowLeft size={16} /> Anterior
             </button>
             {proximaSlug ? (
               <button 
                 onClick={() => proximaSlug && handleNavegar(proximaSlug)} 
                 className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-black uppercase text-xs tracking-widest hover:bg-indigo-100 transition-all"
               >
                 Próxima Questão <ArrowRight size={16} />
               </button>
             ) : (
                <button 
                  onClick={handleConcluir} 
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#BEF264] text-slate-900 font-black uppercase text-xs tracking-widest hover:bg-[#a3d648] hover:shadow-lg transition-all"
                >
                  Concluir Missão <Flag size={16} />
                </button>
             )}
          </div>
        )}
      </div>

      {/* TOAST GABARITO */}
      <AnimatePresence>
        {etapa === 'gabarito' && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 p-6 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-4xl mx-auto">
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
                <button 
                  onClick={() => { 
                    setEtapa('estudo'); 
                    setSlideAtual(0); 
                  }}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1"
                >
                  <BrainCircuit size={18} /> 
                  <span>Ativar Estudo Reverso</span>
                </button>
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
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
          >
            {/* Container Full Screen */}
            <div className="w-full h-full flex flex-col relative">
              
              {/* Header Minimalista (Top Bar) */}
              <div className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#BEF264] text-slate-900 p-2 rounded-lg">
                    <Lightbulb size={20} fill="black" />
                  </div>
                  <span className="text-white/60 font-bold uppercase text-xs tracking-widest">
                    Avant Neuro-Learning
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Indicador de Slide */}
                  <div className="text-[#BEF264] font-black text-2xl opacity-60 italic">
                    {slideAtual + 1}/{totalSlides}
                  </div>
                  
                  {/* Botão Fechar */}
                  <button
                    onClick={() => setEtapa('pergunta')}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Conteúdo Full Immersion */}
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode='wait'>
                  <motion.div 
                    key={slideAtual}
                    initial={{ opacity: 0, x: 50 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -50 }} 
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="w-full h-full"
                  >
                    <NeuroSlide data={currentSlide} questionHash={questionHash} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer de Navegação (Bottom Bar) */}
              <div className="absolute bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-t border-white/5 px-6 md:px-12 py-6">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                  
                  {/* Botão Anterior */}
                  <button 
                    onClick={() => setSlideAtual(Math.max(0, slideAtual - 1))} 
                    disabled={slideAtual === 0} 
                    className="flex items-center gap-2 text-white/60 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} /> Voltar
                  </button>
                  
                  {/* Indicadores de Progresso */}
                  <div className="flex gap-2">
                    {slidesArray?.map((_, i: number) => (
                      <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i === slideAtual 
                            ? 'w-10 bg-[#BEF264]' 
                            : 'w-2 bg-white/20'
                        }`} 
                      />
                    ))}
                  </div>
                  
                  {/* Botão Próximo/Fechar */}
                  {slideAtual < totalSlides - 1 ? (
                    <button 
                      onClick={() => setSlideAtual(slideAtual + 1)} 
                      className="group bg-white text-slate-900 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#BEF264] transition-all flex items-center gap-2"
                    >
                      Próximo <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEtapa('pergunta')} 
                      className="bg-[#BEF264] hover:bg-[#a3d648] text-slate-900 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)] transition-all"
                    >
                      Concluir Estudo
                    </button>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
