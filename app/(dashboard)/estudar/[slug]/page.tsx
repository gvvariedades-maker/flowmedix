'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer'; // O Motor Visual Unificado

export default function PaginaQuestaoDinamica() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    async function carregarQuestao() {
      // 1. Busca o JSON no Supabase baseado no SLUG da URL
      const { data } = await supabase
        .from('modulos_estudo')
        .select('conteudo_json')
        .eq('modulo_slug', params.slug)
        .single();
        
      if (data) setDados(data.conteudo_json);
      setLoading(false);
    }

    if (params.slug) carregarQuestao();
  }, [params.slug]);

  // Loading State (Simples e Elegante)
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="font-black uppercase tracking-widest text-indigo-600 text-xs animate-pulse">
        Carregando Missão...
      </p>
    </div>
  );

  // Error State
  if (!dados) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">
      Missão não encontrada ou acesso restrito.
    </div>
  );

  // Renderização do Player Mestre
  return (
    <div className="h-screen bg-slate-50 p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="w-full h-full max-w-6xl max-h-[90vh]">
        {/* Aqui está a mágica: Usamos o MESMO componente do Laboratório */}
        <AvantLessonPlayer dados={dados} mode="live" />
      </div>
    </div>
  );
}
