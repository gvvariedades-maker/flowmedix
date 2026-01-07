'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, Check, ChevronRight, Zap, 
  HelpCircle, AlertCircle, CheckCircle2,
  ChevronLeft, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionPlayer({ params }: { params: { topicoId: string } }) {
  const [loading, setLoading] = useState(true);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedAlt, setSelectedAlt] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReverso, setShowReverso] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function fetchQuestoes() {
      const { data } = await supabase
        .from('questoes')
        .select('*')
        .eq('topico_edital_id', params.topicoId);
      setQuestoes(data || []);
      setLoading(false);
    }
    fetchQuestoes();
  }, [params.topicoId]);

  const questaoAtual = questoes[index];
  const isCorreto = selectedAlt === questaoAtual?.resposta_correta;

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-black italic animate-pulse tracking-widest">CARREGANDO DESAFIO...</div>;
  if (!questaoAtual) return <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-black uppercase italic">Nenhuma questão mapeada para este tópico.</div>;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
      
      {/* HEADER DE PROGRESSO */}
      <header className="p-6 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 font-black italic text-xs">
            {index + 1}
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Questão em andamento</h2>
            <p className="text-xs font-bold text-white uppercase italic mt-1 tracking-tighter">Banca: {questaoAtual.banca_id || 'Oficial'}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {questoes.map((_, i) => (
            <div key={i} className={`h-1 w-6 rounded-full transition-all ${i === index ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : i < index ? 'bg-emerald-800' : 'bg-slate-800'}`} />
          ))}
        </div>
      </header>

      {/* ÁREA DA QUESTÃO */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="bg-slate-900/30 p-8 rounded-[40px] border border-slate-800/50">
            <p className="text-lg md:text-xl font-bold leading-relaxed text-slate-100">
              {questaoAtual.enunciado}
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(questaoAtual.alternativas).map(([key, value]: [string, any]) => (
              <button
                key={key}
                disabled={showFeedback}
                onClick={() => setSelectedAlt(key)}
                className={`w-full p-6 rounded-[28px] border-2 text-left transition-all flex items-center gap-4 group
                  ${selectedAlt === key 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors
                  ${selectedAlt === key ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                  {key.toUpperCase()}
                </div>
                <span className={`font-bold text-sm ${selectedAlt === key ? 'text-white' : 'text-slate-400'}`}>{value}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER DE AÇÃO */}
      <footer className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center">
        {!showFeedback ? (
          <button
            disabled={!selectedAlt}
            onClick={() => setShowFeedback(true)}
            className="w-full max-w-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white p-5 rounded-[24px] font-[1000] uppercase italic text-xs transition-all shadow-xl flex items-center justify-center gap-2"
          >
            Confirmar Resposta <Check className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4">
            <div className={`flex-1 p-5 rounded-[24px] border flex items-center gap-4 ${isCorreto ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
               {isCorreto ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
               <span className={`font-black uppercase italic text-xs ${isCorreto ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {isCorreto ? 'Excelente! Você dominou o conceito.' : `Resposta incorreta. A correta é a ${questaoAtual.resposta_correta.toUpperCase()}`}
               </span>
            </div>
            <button
              onClick={() => { setShowReverso(true); setCurrentSlide(0); }}
              className="bg-white text-slate-950 px-8 py-5 rounded-[24px] font-[1000] uppercase italic text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all"
            >
              <Zap className="w-4 h-4" /> Estudo Reverso
            </button>
            <button
              onClick={() => { setIndex(index + 1); setSelectedAlt(null); setShowFeedback(false); }}
              className="bg-slate-800 text-white px-8 py-5 rounded-[24px] font-[1000] uppercase italic text-xs flex items-center justify-center gap-2"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </footer>

      {/* MODAL DE ESTUDO REVERSO (THE MAGIC) */}
      <AnimatePresence>
        {showReverso && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden border-[6px] border-slate-950 shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col min-h-[500px]"
            >
              {/* Header do Slide */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.3em] italic">Mentalset Reverso</span>
                </div>
                <button onClick={() => setShowReverso(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-300 hover:text-slate-950 transition-all"><X /></button>
              </div>

              {/* Conteúdo Dinâmico do Slide */}
              <div className="flex-1 p-12 flex flex-col justify-center items-center text-center">
                <h3 className="text-3xl font-[1000] text-slate-950 uppercase italic leading-none mb-6 tracking-tighter">
                  {questaoAtual.estudo_reverso_json.nodes[0].data.menu_content[currentSlide]?.title}
                </h3>
                <p className="text-lg text-slate-600 font-bold leading-relaxed max-w-md">
                  {questaoAtual.estudo_reverso_json.nodes[0].data.menu_content[currentSlide]?.content}
                </p>
              </div>

              {/* Navegação de Slide */}
              <div className="p-8 bg-slate-50 flex justify-between items-center">
                <button 
                  disabled={currentSlide === 0} 
                  onClick={() => setCurrentSlide(s => s - 1)}
                  className="text-[10px] font-black uppercase italic text-slate-400 hover:text-slate-950 disabled:opacity-0"
                >
                  Anterior
                </button>
                
                <div className="flex gap-2">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300'}`} />
                  ))}
                </div>

                {currentSlide < 3 ? (
                  <button 
                    onClick={() => setCurrentSlide(s => s + 1)}
                    className="bg-slate-950 text-white px-8 py-3 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 shadow-lg shadow-slate-900/20"
                  >
                    Próximo <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowReverso(false)}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2"
                  >
                    Finalizar <CheckCircle2 className="w-3 h-3" />
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