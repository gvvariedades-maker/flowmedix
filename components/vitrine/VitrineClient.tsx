'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Flame, ChevronRight, AlertTriangle, 
  ShieldCheck, LayoutDashboard, Search, X, Filter
} from 'lucide-react';

// --- INTERFACES ---
interface ModuloEstudo {
  id: string;
  modulo_nome: string | null; 
  titulo_aula: string | null; 
  modulo_slug: string; 
  banca: string;
  stats: { 
    acertos: number; 
    total: number; 
    percentual: number;
    priorityScore: number;
  };
}

interface VitrineClientProps {
  initialModulos: ModuloEstudo[];
  globalStats: {
    ofensiva: number;
    xp: number;
    taxaGeral: number;
  };
}

export default function VitrineClient({ initialModulos, globalStats: initialGlobalStats }: VitrineClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cidadeUrl = searchParams.get('cidade') ? decodeURIComponent(searchParams.get('cidade')!) : "Treinamento";

  const [modulos] = useState<ModuloEstudo[]>(initialModulos);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [globalStats] = useState(initialGlobalStats);

  // Filtros Banca e Assunto (inicializados pela URL)
  const [bancaFilter, setBancaFilter] = useState<string>(searchParams.get('banca') ?? '');
  const [assuntoFilter, setAssuntoFilter] = useState<string>(searchParams.get('assunto') ?? '');

  // Listas únicas para os dropdowns (derivadas dos módulos)
  const bancas = useMemo(() => 
    [...new Set(modulos.map(m => m.banca).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [modulos]
  );
  // Assunto = titulo_aula (subtopico específico, ex: "Noções de Anatomia"), não modulo_nome (disciplina genérica como "Enfermagem")
  const assuntos = useMemo(() => 
    [...new Set(modulos.map(m => m.titulo_aula).filter((n): n is string => !!n))].sort((a, b) => a.localeCompare(b)),
    [modulos]
  );

  // Sincroniza filtros com a URL (links compartilháveis)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (bancaFilter) params.set('banca', bancaFilter); else params.delete('banca');
    if (assuntoFilter) params.set('assunto', assuntoFilter); else params.delete('assunto');
    if (searchTerm) params.set('q', searchTerm); else params.delete('q');
    const queryString = params.toString();
    const newSearch = queryString ? `?${queryString}` : '';
    if (typeof window !== 'undefined' && window.location.search !== newSearch) {
      router.replace(`${pathname}${newSearch}`, { scroll: false });
    }
  }, [bancaFilter, assuntoFilter, searchTerm, pathname, router, searchParams]);

  // Lógica de Filtragem (Busca + Banca + Assunto)
  const filteredModulos = useMemo(() => {
    let result = modulos;
    if (bancaFilter) result = result.filter(m => m.banca === bancaFilter);
    if (assuntoFilter) result = result.filter(m => m.titulo_aula === assuntoFilter);
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(m => 
        (m.titulo_aula?.toLowerCase().includes(lowerTerm) ?? false) || 
        (m.modulo_nome?.toLowerCase().includes(lowerTerm) ?? false)
      );
    }
    return result;
  }, [modulos, bancaFilter, assuntoFilter, searchTerm]);

  // Top Priority (Só aparece se não estiver buscando nem filtrando)
  const topPriority = useMemo(() => filteredModulos[0], [filteredModulos]);
  const showHero = !searchTerm && !bancaFilter && !assuntoFilter && topPriority && topPriority.stats.priorityScore > 50;

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
        
        {/* FILTROS: BANCA E ASSUNTO */}
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Filtros</span>
          </div>
          <select
            value={bancaFilter}
            onChange={(e) => setBancaFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value="">Todas as bancas</option>
            {bancas.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={assuntoFilter}
            onChange={(e) => setAssuntoFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[200px]"
          >
            <option value="">Todos os assuntos</option>
            {assuntos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          {(bancaFilter || assuntoFilter) && (
            <button
              onClick={() => { setBancaFilter(''); setAssuntoFilter(''); }}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-wider"
            >
              Limpar filtros
            </button>
          )}
        </section>

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
                        {topPriority.titulo_aula || 'Aula sem título'}
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
                {searchTerm 
                  ? `Resultados para "${searchTerm}"` 
                  : (bancaFilter || assuntoFilter) 
                    ? `Filtrado${bancaFilter ? ` • ${bancaFilter}` : ''}${assuntoFilter ? ` • ${assuntoFilter}` : ''}`
                    : 'Setores de Operação'}
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
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function QuickStat({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) {
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
  const router = useRouter();

  // Prefetch quando o mouse entra no card (otimização de performance)
  const handleMouseEnter = () => {
    router.prefetch(`/estudar/${aula.modulo_slug}`);
  };

  return (
    <Link 
      href={`/estudar/${aula.modulo_slug}`}
      prefetch={true} // Prefetch automático do Next.js
      onMouseEnter={handleMouseEnter} // Prefetch adicional no hover
    >
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{aula.modulo_nome || 'Módulo'}</span>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{aula.banca}</span>
            </div>
            <h4 className="text-xl font-bold text-slate-800 tracking-tighter uppercase italic leading-tight group-hover:text-indigo-600 transition-colors">
              {aula.titulo_aula || 'Aula sem título'}
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
