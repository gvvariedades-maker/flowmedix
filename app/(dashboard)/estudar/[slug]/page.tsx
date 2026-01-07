'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Zap, CheckCircle2, Circle, 
  ArrowRight, BookOpen, Target, 
  Trophy, LayoutGrid, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardEdital({ params }: { params: { slug: string } }) {
  const [loading, setLoading] = useState(true);
  const [concurso, setConcurso] = useState<any>(null);
  const [topicos, setTopicos] = useState<any[]>([]);
  const [progresso, setProgresso] = useState({ total: 0, concluidos: 0 });

  useEffect(() => {
    async function carregarConteudoLimpo() {
      setLoading(true);

      try {
        // 1. Busca APENAS o concurso atual pelo slug da URL
        const { data: concursoData, error: concursoError } = await supabase
          .from('concursos_cidades')
          .select('id, nome_cidade, orgao')
          .eq('slug', params.slug)
          .single();

        if (concursoError || !concursoData) {
          console.error('Erro ao buscar concurso:', concursoError);
          setConcurso(null);
          setTopicos([]);
          setLoading(false);
          return;
        }

        setConcurso(concursoData);

        // 2. Busca APENAS os tópicos que pertencem a ESSE concurso
        // Isso "limpa" automaticamente o conteúdo de outros concursos
        const { data: topicosData, error: topicosError } = await supabase
          .from('topicos_edital')
          .select(`
            id, 
            nome_topico, 
            ordem,
            questoes (id)
          `)
          .eq('concurso_id', concursoData.id) // FILTRO CRÍTICO: garante que só busca tópicos deste concurso
          .order('ordem', { ascending: true });

        if (topicosError) {
          console.error('Erro ao buscar tópicos:', topicosError);
          setTopicos([]);
        } else {
          setTopicos(topicosData || []);
        }
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setConcurso(null);
        setTopicos([]);
      } finally {
        setLoading(false);
      }
    }

    carregarConteudoLimpo();
  }, [params.slug]);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-emerald-500 font-black italic uppercase tracking-widest text-xs">Sincronizando Edital...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER ESTRATÉGICO: STATUS DE DOMÍNIO */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h1 className="text-4xl md:text-6xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
              {concurso?.nome_cidade} <span className="text-emerald-500 block text-2xl md:text-3xl">{concurso?.orgao}</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
               <div className="px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-widest">Língua Portuguesa</div>
               <div className="px-4 py-1 bg-slate-800 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">Nível Médio</div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Progresso do Edital</p>
              <div className="text-4xl font-[1000] italic text-white mb-2">
                {Math.round((progresso.concluidos / progresso.total) * 100)}%
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(progresso.concluidos / progresso.total) * 100}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
            <Trophy className="absolute -bottom-2 -right-2 w-20 h-20 text-emerald-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </header>

        {/* BENTO GRID: TÓPICOS DO EDITAL VERTICALIZADO */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicos.map((topico, idx) => {
            const isConcluido = idx < progresso.concluidos;
            return (
              <motion.button
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={topico.id}
                className={`group relative p-8 rounded-[40px] border-2 text-left transition-all flex flex-col justify-between h-64 overflow-hidden
                  ${isConcluido 
                    ? 'bg-emerald-500/5 border-emerald-500 shadow-[10px_10px_0px_0px_rgba(16,185,129,0.2)]' 
                    : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)]'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${isConcluido ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-emerald-500'} transition-colors`}>
                      {isConcluido ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Módulo {idx + 1}</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic leading-tight mb-2 tracking-tighter">
                    {topico.nome_topico}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {topico.questoes?.length || 0} questões mapeadas
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6">
                   <div className="text-[10px] font-black uppercase italic text-emerald-500 group-hover:underline">
                      {isConcluido ? 'Revisar Estudo' : 'Iniciar Estudo Reverso'}
                   </div>
                   <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-2 ${isConcluido ? 'text-emerald-500' : 'text-slate-700'}`} />
                </div>

                {/* Efeito Visual de Fundo */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            );
          })}
        </section>

        {/* FOOTER: SUPORTE AO MENTALSET */}
        <footer className="py-20 text-center border-t border-slate-900">
           <div className="inline-flex items-center gap-2 bg-slate-900 px-6 py-2 rounded-full border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Target className="w-3 h-3 text-emerald-500" /> Foco total na banca do edital
           </div>
        </footer>
      </div>
    </div>
  );
}