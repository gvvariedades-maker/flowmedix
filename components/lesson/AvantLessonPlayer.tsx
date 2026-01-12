'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, BrainCircuit, CheckCircle2, XCircle, 
  ChevronRight, ChevronLeft, BookOpen, Layers, Lightbulb, ArrowRight, ArrowLeft
} from 'lucide-react';

interface AvantLessonPlayerProps {
  dados: any;
  mode?: 'preview' | 'live';
}

export default function AvantLessonPlayer({ dados, mode = 'live' }: AvantLessonPlayerProps) {
  const [etapa, setEtapa] = useState<'pergunta' | 'gabarito' | 'estudo'>('pergunta');
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [slideAtual, setSlideAtual] = useState(0);

  if (!dados) return null;

  // Variantes de Animação
  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="w-full h-full flex flex-col relative bg-white md:rounded-[40px] shadow-2xl overflow-hidden border border-slate-200/60 ring-1 ring-slate-100">
      
      {/* --- FAIXA SUPERIOR: BARRA DE STATUS --- */}
      <div className="h-2 w-full bg-slate-100 flex">
        <div className={`h-full transition-all duration-1000 ease-out ${etapa === 'pergunta' ? 'w-1/3 bg-indigo-500' : etapa === 'gabarito' ? 'w-2/3 bg-indigo-600' : 'w-full bg-[#BEF264]'}`} />
      </div>

      {/* --- ÁREA DE SCROLL (CONTEÚDO) --- */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-gradient-to-b from-white to-slate-50/50">
        
        {/* HEADER DE CREDIBILIDADE + BOTÃO VOLTAR */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
           <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              
              {/* BOTÃO VOLTAR (SÓ APARECE NO MODO LIVE) */}
              {mode === 'live' && (
                <button 
                  onClick={() => window.location.href = '/estudar'} 
                  className="group flex items-center gap-2 pr-4 md:border-r border-slate-200 hover:text-indigo-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
                    <ArrowLeft size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
                </button>
              )}

              <div className="space-y-1">
                  <div className="flex flex-wrap gap-2">
                    {dados.meta.ano && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">Ano: {dados.meta.ano}</span>}
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-black uppercase text-indigo-600 tracking-wider border border-indigo-100">Banca: {dados.meta.banca}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium max-w-[250px] md:max-w-lg truncate">{dados.meta.prova || 'Prova não identificada'}</p>
              </div>
           </div>

           <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50">
              <Layers size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{dados.meta.topico}</span>
           </div>
        </motion.div>

        {/* ENUNCIADO E FRAGMENTO */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.1 }}>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed mb-6 pl-2 border-l-4 border-indigo-500">
            {dados.question_data.instruction}
          </h2>

          <div 
            className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-lg font-serif text-slate-700 leading-loose"
            dangerouslySetInnerHTML={{ __html: dados.question_data.text_fragment }} 
          />
        </motion.div>
        
        {/* --- OPÇÕES INTERATIVAS (COM LÓGICA DE CORREÇÃO) --- */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.2 }} className="grid gap-3 pb-24">
          {dados.question_data.options.map((opt: any) => {
            const isSelected = selecionada === opt.id;
            const isCorrect = opt.is_correct;
            const showResult = etapa === 'gabarito' || etapa === 'estudo';

            // LÓGICA DE ESTILO AVANÇADA
            let containerClass = "border-slate-100 bg-white hover:border-slate-300"; // Padrão
            let badgeClass = "bg-slate-100 text-slate-400 group-hover:bg-slate-200"; // Padrão
            let textClass = "text-slate-600"; // Padrão

            if (showResult) {
                if (isCorrect) {
                    // Revela a correta (sempre Verde)
                    containerClass = "border-green-500 bg-green-50 ring-1 ring-green-200";
                    badgeClass = "bg-green-500 text-white shadow-md";
                    textClass = "text-green-800 font-bold";
                } else if (isSelected && !isCorrect) {
                    // Mostra o erro do usuário (Vermelho)
                    containerClass = "border-red-400 bg-red-50";
                    badgeClass = "bg-red-500 text-white shadow-md";
                    textClass = "text-red-800 font-bold";
                } else {
                    // Outras opções (Ficam apagadas)
                    containerClass = "border-slate-100 bg-slate-50 opacity-50";
                }
            } else if (isSelected) {
                // Estado de Seleção (Azul Índigo)
                containerClass = "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10";
                badgeClass = "bg-indigo-600 text-white shadow-md";
                textClass = "text-indigo-900 font-bold";
            }

            return (
              <motion.button 
                key={opt.id}
                whileHover={!showResult ? { scale: 1.01, backgroundColor: '#F8FAFC' } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => !showResult && setSelecionada(opt.id)} // Bloqueia clique após responder
                className={`group relative p-4 md:p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all duration-300 ${containerClass}`}
              >
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors duration-300 ${badgeClass}`}>
                  {opt.id}
                </span>
                <span className={`font-medium pt-1 ${textClass}`}>
                  {opt.text}
                </span>
                
                {/* Ícones de Resultado */}
                {showResult && isCorrect && (
                  <div className="absolute right-4 top-5 text-green-600 animate-in zoom-in duration-300">
                    <CheckCircle2 size={24} />
                  </div>
                )}
                {showResult && isSelected && !isCorrect && (
                   <div className="absolute right-4 top-5 text-red-500 animate-in zoom-in duration-300">
                    <XCircle size={24} />
                  </div>
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* BOTÃO FLUTUANTE DE AÇÃO */}
        {etapa === 'pergunta' && selecionada && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center pt-2 pb-12">
            <button 
              onClick={() => setEtapa('gabarito')} 
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

      {/* --- TOAST DE FEEDBACK (GABARITO) --- */}
      <AnimatePresence>
        {etapa === 'gabarito' && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 p-6 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-4xl mx-auto">
                
                {/* Resultado */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner
                    ${dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-500'}`}>
                    {dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct 
                      ? <CheckCircle2 size={32} /> 
                      : <XCircle size={32} />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Diagnóstico</p>
                    <p className={`text-xl font-black italic tracking-tighter uppercase 
                       ${dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct ? 'text-green-600' : 'text-red-500'}`}>
                       {dados.question_data.options.find((o:any) => o.id === selecionada)?.is_correct ? 'Resposta Correta' : 'Resposta Incorreta'}
                    </p>
                  </div>
                </div>

                {/* Botão Estudo Reverso */}
                <button 
                  onClick={() => setEtapa('estudo')} 
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1"
                >
                  <BrainCircuit size={18} />
                  <span>Ativar Estudo Reverso</span>
                  <div className="bg-white/20 px-2 py-0.5 rounded text-[9px]">ENTER</div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL ESTUDO REVERSO (PADRONIZADO) --- */}
      <AnimatePresence>
        {etapa === 'estudo' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          >
            {/* CONTAINER PADRONIZADO (Fix Size) */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-5xl h-[650px] bg-slate-800 rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-white/10 relative"
            >
              
              {/* HEADER DO SLIDE */}
              <div className="px-8 md:px-12 pt-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="bg-[#BEF264] text-slate-900 p-2 rounded-lg">
                      <Lightbulb size={20} fill="black" />
                   </div>
                   <span className="text-white/60 font-bold uppercase text-xs tracking-widest">
                     Avant Neuro-Learning
                   </span>
                </div>
                <div className="text-[#BEF264] font-black text-4xl opacity-20 italic">
                  0{slideAtual + 1}
                </div>
              </div>

              {/* CONTEÚDO (SCROLLÁVEL MAS DENTRO DA ÁREA FIXA) */}
              <div className="flex-1 px-8 md:px-16 flex flex-col justify-center overflow-y-auto custom-scrollbar">
                <motion.div 
                  key={slideAtual} // Chave para forçar animação na troca
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                >
                  {/* Etiqueta do Fluxo */}
                  <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <BookOpen size={12} />
                    {dados.reverse_study_slides[slideAtual].fluxo}
                  </div>
                  
                  {/* Título */}
                  <h3 className="text-3xl md:text-5xl font-[1000] text-white italic uppercase tracking-tighter mb-6 leading-[1.1]">
                    {dados.reverse_study_slides[slideAtual].title}
                  </h3>
                  
                  {/* Texto Rico */}
                  <div 
                    className="text-lg md:text-xl text-slate-300 leading-relaxed font-light [&>strong]:text-[#BEF264] [&>strong]:font-bold" 
                    dangerouslySetInnerHTML={{__html: dados.reverse_study_slides[slideAtual].content}} 
                  />
                </motion.div>
              </div>

              {/* FOOTER DE NAVEGAÇÃO */}
              <div className="h-24 bg-black/40 backdrop-blur-md border-t border-white/5 flex justify-between items-center px-8 md:px-12 shrink-0">
                
                <button 
                  onClick={() => setSlideAtual(Math.max(0, slideAtual - 1))} 
                  disabled={slideAtual === 0}
                  className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
                
                {/* Indicadores de Progresso */}
                <div className="flex gap-2">
                  {dados.reverse_study_slides.map((_: any, i: number) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === slideAtual ? 'w-10 bg-[#BEF264]' : 'w-2 bg-white/20'}`} />
                  ))}
                </div>
                
                {slideAtual < (dados.reverse_study_slides.length - 1) ? (
                  <button 
                    onClick={() => setSlideAtual(slideAtual + 1)} 
                    className="group bg-white text-slate-900 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#BEF264] transition-all flex items-center gap-2"
                  >
                    Próximo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setEtapa('pergunta')} 
                    className="bg-[#BEF264] hover:bg-[#a3d648] text-slate-900 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)] transition-all transform hover:-translate-y-1"
                  >
                    Concluir Missão
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}