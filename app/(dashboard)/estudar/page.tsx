'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Importante para ler a URL
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  BookOpen, PlayCircle, Clock, Zap, 
  Trophy, Flame, Target, ChevronRight, LayoutGrid, Filter
} from 'lucide-react';

// Tipagem dos dados
interface ModuloEstudo {
  id: string;
  modulo_nome: string; 
  titulo_aula: string; 
  modulo_slug: string; 
  banca: string;
  conteudo_json: any;
  created_at: string;
}

export default function VitrineDeEstudos() {
  const searchParams = useSearchParams();
  
  // Captura os filtros da URL
  const cidadeUrl = searchParams.get('cidade') 
    ? decodeURIComponent(searchParams.get('cidade')!) 
    : "Treinamento Geral";
    
  const bancaUrl = searchParams.get('banca') 
    ? decodeURIComponent(searchParams.get('banca')!).toUpperCase() 
    : null; // Se for null, mostra tudo

  const [modulosPorMateria, setModulosPorMateria] = useState<Record<string, ModuloEstudo[]>>({});
  const [destaque, setDestaque] = useState<ModuloEstudo | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats Fictícios
  const stats = [
    { label: 'Ofensiva', value: '3 Dias', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'XP Hoje', value: '450 pts', icon: Zap, color: 'text-[#BEF264]', bg: 'bg-lime-900' },
    { label: 'Taxa de Acerto', value: '87%', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  useEffect(() => {
    async function fetchModulos() {
      let query = supabase
        .from('modulos_estudo')
        .select('*')
        .order('created_at', { ascending: false });

      // --- FILTRAGEM INTELIGENTE ---
      // Se tiver ?banca=CPCON na URL, o banco só retorna CPCON
      if (bancaUrl) {
        query = query.ilike('banca', `%${bancaUrl}%`);
      }

      const { data } = await query;

      if (data && data.length > 0) {
        setDestaque(data[0]);

        // Agrupa por Nome do Módulo (ex: "Sintaxe", "Morfologia")
        const agrupados = data.reduce((acc: any, item: ModuloEstudo) => {
          const materia = item.modulo_nome || 'Geral';
          if (!acc[materia]) acc[materia] = [];
          acc[materia].push(item);
          return acc;
        }, {});
        
        setModulosPorMateria(agrupados);
      } else {
        setModulosPorMateria({});
        setDestaque(null);
      }
      setLoading(false);
    }

    fetchModulos();
  }, [bancaUrl]); // Recarrega se a banca mudar na URL

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-indigo-600 animate-pulse">Buscando Conteúdo {bancaUrl}...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 sticky top-0 z-30 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#BEF264] animate-pulse" />
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Hub de Aprovação
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-[1000] text-slate-900 tracking-tighter italic uppercase">
              Rumo à {cidadeUrl}
            </h2>
            {bancaUrl && (
               <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                 <Filter size={10} /> Filtro Ativo: {bancaUrl}
               </span>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar">
            {stats.map((stat, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-100 shadow-sm min-w-[140px] ${i === 1 ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-wider text-slate-400`}>{stat.label}</p>
                  <p className={`text-sm font-bold ${i === 1 ? 'text-white' : 'text-slate-700'}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-10 space-y-12">
        
        {/* Caso não tenha aulas para essa banca */}
        {!destaque && (
          <div className="text-center py-20 opacity-50">
            <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-xl font-bold text-slate-400">Nenhum módulo encontrado para a banca {bancaUrl}.</p>
          </div>
        )}

        {/* DESTAQUE */}
        {destaque && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group cursor-pointer">
             <Link href={`/estudar/${destaque.modulo_slug}`}>
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[32px] p-8 md:p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden transition-transform hover:scale-[1.01] duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#BEF264] text-slate-900 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">Novo</span>
                      <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-400/30 px-2 py-1 rounded-md">{destaque.modulo_nome}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-[0.9]">{destaque.titulo_aula}</h2>
                  </div>
                  <button className="bg-white text-indigo-900 px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-3 group-hover:bg-[#BEF264] transition-colors">
                    Iniciar Agora <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </Link>
          </motion.section>
        )}

        {/* LISTAGEM POR TÓPICO */}
        <div className="space-y-16">
          {Object.entries(modulosPorMateria).map(([materia, aulas], idx) => (
            <motion.section key={materia} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                   <LayoutGrid size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">{materia}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{aulas.length} Missões</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {aulas.map((aula) => (
                  <Link key={aula.id} href={`/estudar/${aula.modulo_slug}`}>
                    <motion.article whileHover={{ y: -5 }} className="group bg-white rounded-[24px] p-1 border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 h-full flex flex-col">
                      <div className="bg-slate-50 rounded-[20px] p-6 h-full flex flex-col relative overflow-hidden group-hover:bg-white transition-colors">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-black text-slate-500 uppercase tracking-wider">{aula.banca}</span>
                          {aula.conteudo_json.meta?.ano && (<span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12} /> {aula.conteudo_json.meta.ano}</span>)}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">{aula.titulo_aula}</h4>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Trophy size={14} className="text-[#BEF264]" />
                          <span>{aula.conteudo_json.meta?.nivel || 'Nível Médio'}</span>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
}