'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Flame, Target, ChevronRight, AlertTriangle, 
  ShieldCheck, LayoutDashboard, Search, X
} from 'lucide-react';

// --- INTERFACES ---
interface ModuloEstudo {
  id: string;
  modulo_nome: string; 
  titulo_aula: string; 
  modulo_slug: string; 
  banca: string;
  stats: { 
    acertos: number; 
    total: number; 
    percentual: number;
    priorityScore: number;
  };
}

export default function VitrineDeEstudos() {
  const searchParams = useSearchParams();
  const bancaUrl = searchParams.get('banca')?.toUpperCase() || "GERAL";
  const cidadeUrl = searchParams.get('cidade') ? decodeURIComponent(searchParams.get('cidade')!) : "Treinamento";

  const [modulos, setModulos] = useState<ModuloEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado da Busca
  const [globalStats, setGlobalStats] = useState({ ofensiva: 1, xp: 0, taxaGeral: 0 });

  useEffect(() => {
    async function loadCommandCenter() {
      setLoading(true);
      
      const { data: modulosData } = await supabase.from('modulos_estudo')
        .select('*')
        .ilike('banca', `%${bancaUrl === 'GERAL' ? '' : bancaUrl}%`);

      const { data: historicoData } = await supabase.from('historico_questoes').select('*');

      if (modulosData) {
        const processados = modulosData.map(modulo => {
          const tentativas = historicoData?.filter(h => h.modulo_slug === modulo.modulo_slug) || [];
          const acertos = tentativas.filter(t => t.acertou).length;
          const total = tentativas.length;
          const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
          
          // ALGORITMO DE PRIORIDADE
          let priorityScore = 0;
          if (total === 0) priorityScore = 50; 
          else if (percentual < 70) priorityScore = 100 + (70 - percentual);
          else if (percentual >= 90) priorityScore = 10;
          else priorityScore = 30;

          return { ...modulo, stats: { acertos, total, percentual, priorityScore } };
        });

        // Ordenar por prioridade
        const ordenados = processados.sort((a, b) => b.stats.priorityScore - a.stats.priorityScore);
        
        const totalAcertos = historicoData?.filter(h => h.acertou).length || 0;
        setGlobalStats({
          ofensiva: 1,
          xp: totalAcertos * 50,
          taxaGeral: Math.round((totalAcertos / (historicoData?.length || 1)) * 100)
        });

        setModulos(ordenados);
      }
      setLoading(false);
    }
    loadCommandCenter();
  }, [bancaUrl]);

  // Lógica de Filtragem (Busca Instantânea)
  const filteredModulos = useMemo(() => {
    if (!searchTerm) return modulos;
    const lowerTerm = searchTerm.toLowerCase();
    return modulos.filter(m => 
      m.titulo_aula.toLowerCase().includes(lowerTerm) || 
      m.modulo_nome.toLowerCase().includes(lowerTerm)
    );
  }, [modulos, searchTerm]);

  // Top Priority (Só aparece se não estiver buscando)
  const topPriority = useMemo(() => modulos[0], [modulos]);
  const showHero = !searchTerm && topPriority && topPriority.stats.priorityScore > 50;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* HEADER: CLEAN COMMAND CENTER */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo & Título */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 rounded-2xl bg-slate-100 text-indigo-600 border border-slate-200 shrink-0">
              <LayoutDashboard size={24} />
            </div>
            <div className="hidden md:block">
              <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Painel Tático</h1>
              <h2 className="text-xl font-[1000] italic uppercase tracking-tighter text-slate-800 line-clamp-1">Missão: {cidadeUrl}</h2>
            </div>
          </div>

          {/* BARRA DE BUSCA (Pilar A) */}
          <div className="flex-1 max-w-xl w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar missão, tópico ou aula..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-2xl bg-slate-100 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Stats (Hidden on mobile for cleaner search) */}
          <div className="hidden lg:flex gap-3">
            <QuickStat icon={Flame} value={`${globalStats.ofensiva}D`} label="Streak" color="text-orange-500" />
            <QuickStat icon={Zap} value={globalStats.xp} label="XP Total" color="text-indigo-600" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 space-y-12">
        
        {/* LOADING SKELETONS (Pilar C - UX) */}
        {loading ? (
          <div className="space-y-12 animate-pulse">
             <div className="h-64 w-full bg-slate-200 rounded-[40px]" /> {/* Hero Skeleton */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-72 rounded-[32px] bg-slate-200 border border-slate-300/50" />
                ))}
             </div>
          </div>
        ) : (
          <>
            {/* HERO CARD (Somente se não estiver buscando) */}
            <AnimatePresence>
              {showHero && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 ml-2">Alvo Prioritário Identificado</div>
                  <Link href={`/estudar/${topPriority.modulo_slug}`}>
                    <div className="relative group overflow-hidden rounded-[40px] border border-red-200 bg-white p-8 md:p-12 transition-all hover:border-red-400 hover:shadow-xl hover:shadow-red-500/10 cursor-pointer">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={120} className="text-red-500" />
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-4 text-center md:text-left">
                          <span className="px-4 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-[0.2em]">Intervenção Urgente</span>
                          <h3 className="text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none text-slate-900">
                            {topPriority.titulo_aula}
                          </h3>
                          <p className="text-slate-500 font-medium max-w-xl">
                            Sua performance aqui é de <strong className="text-red-600">{topPriority.stats.percentual}%</strong>. 
                            Neutralize essa lacuna para blindar sua aprovação.
                          </p>
                        </div>
                        <div className="shrink-0 w-24 h-24 rounded-full border-4 border-red-100 bg-red-50 flex items-center justify-center text-2xl font-black text-red-600">
                          {topPriority.stats.percentual}%
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.section>
              )}
            </AnimatePresence>

            {/* LISTAGEM DE MÓDULOS */}
            <section className="space-y-8">
               <div className="flex items-center gap-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-500">
                    {searchTerm ? `Resultados para "${searchTerm}"` : 'Setores de Operação'}
                  </h3>
                  <div className="h-px flex-1 bg-slate-200" />
               </div>

               {filteredModulos.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModulos.map((aula) => (
                      <EliteModuleCard key={aula.id} aula={aula} />
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">Nenhum módulo encontrado.</p>
                 </div>
               )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES (MANTIDOS) ---

function QuickStat({ icon: Icon, value, label, color }: any) {
  return (
    <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
      <Icon size={16} className={color} />
      <div>
        <p className="text-[10px] font-black leading-none text-slate-900">{value}</p>
        <p className="text-[8px] uppercase tracking-widest text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function EliteModuleCard({ aula }: { aula: ModuloEstudo }) {
  const isCritical = aula.stats.percentual > 0 && aula.stats.percentual < 70;
  const isMastered = aula.stats.percentual >= 90;

  return (
    <Link href={`/estudar/${aula.modulo_slug}`}>
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className={`relative p-8 rounded-[32px] border transition-all h-full flex flex-col justify-between overflow-hidden bg-white shadow-sm hover:shadow-xl
          ${isCritical ? 'border-red-200 hover:border-red-400' : 'border-slate-200 hover:border-indigo-400'}
          ${isMastered ? 'border-emerald-200 hover:border-emerald-400' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{aula.modulo_nome}</span>
            <h4 className="text-xl font-bold text-slate-800 tracking-tighter uppercase italic leading-tight group-hover:text-indigo-600 transition-colors">
              {aula.titulo_aula}
            </h4>
          </div>
          {isMastered && <ShieldCheck className="text-emerald-500" size={24} />}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Precisão</div>
            <div className={`text-2xl font-black italic ${isCritical ? 'text-red-500' : isMastered ? 'text-emerald-600' : 'text-slate-800'}`}>
              {aula.stats.total > 0 ? `${aula.stats.percentual}%` : '--'}
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${aula.stats.percentual}%` }}
              className={`h-full ${isCritical ? 'bg-red-500' : isMastered ? 'bg-emerald-500' : 'bg-indigo-600'}`}
            />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{aula.stats.total} Questões</span>
            <ChevronRight size={14} className="text-slate-300" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}