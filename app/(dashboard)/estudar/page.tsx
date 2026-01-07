'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, ArrowRight, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SelecaoConcursoPage() {
  const [cidades, setCidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCidades() {
      try {
        const { data, error } = await supabase
          .from('concursos_cidades')
          .select('*')
          .eq('is_active', true)
          .order('nome_cidade');
        
        if (error) throw error;
        setCidades(data || []);
      } catch (err) {
        console.error("Erro ao carregar cidades:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCidades();
  }, []);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      <p className="mt-4 text-emerald-500 font-black italic text-[10px] uppercase tracking-[0.3em]">Sincronizando Editais...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-8 md:p-20 font-sans">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* HEADER MINIMALISTA VERCEL-STYLE */}
        <header className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Sparkles className="w-3 h-3" /> Plataforma de Estudo Reverso
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
              Escolha seu <span className="text-emerald-500">Objetivo</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Selecione um edital verticalizado para iniciar</p>
          </div>
        </header>

        {/* GRID DE CIDADES/CONCURSOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cidades.map((c, index) => (
            <Link key={c.id} href={`/estudar/${c.slug}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-slate-900/50 p-10 rounded-[48px] border border-slate-800 hover:border-emerald-500/50 transition-all group cursor-pointer relative overflow-hidden shadow-2xl"
              >
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="p-5 bg-slate-950 rounded-3xl group-hover:bg-emerald-500 transition-all duration-500 shadow-xl group-hover:shadow-emerald-500/20">
                    <MapPin className="w-8 h-8 text-emerald-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="p-3 rounded-full bg-slate-800 text-slate-500 group-hover:text-emerald-500 transition-colors">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                
                <div className="relative z-10 space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                    {c.nome_cidade}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{c.orgao} • {c.ano}</p>
                </div>
                
                <div className="mt-10 flex items-center gap-3 text-emerald-500 font-black italic uppercase text-[10px] relative z-10">
                   <div className="w-8 h-[2px] bg-emerald-500 group-hover:w-12 transition-all" />
                   <span className="group-hover:tracking-[0.2em] transition-all">Acessar Sala de Guerra</span>
                </div>

                {/* EFEITO DE GLOW NO FUNDO AO PASSAR O MOUSE */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-all" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* FEEDBACK CASO NÃO HAJA CIDADES */}
        {cidades.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-slate-900/30 rounded-[50px] border-2 border-dashed border-slate-800/50"
          >
            <GraduationCap className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="font-black italic uppercase text-slate-600 tracking-tighter">Nenhum concurso ativo disponível para o seu perfil.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}