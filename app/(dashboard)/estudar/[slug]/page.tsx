'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Adicionado useRouter
import { supabase } from '@/lib/supabase';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';

export default function PaginaQuestaoDinamica() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>(null);
  
  // Novos estados para navegação
  const [proximaSlug, setProximaSlug] = useState<string | null>(null);
  const [anteriorSlug, setAnteriorSlug] = useState<string | null>(null);

  useEffect(() => {
    async function carregarSessao() {
      // 1. Busca a Questão Atual
      const { data: atual, error } = await supabase
        .from('modulos_estudo')
        .select('*') // Precisamos de todos os campos para comparar
        .eq('modulo_slug', params.slug)
        .single();
        
      if (error || !atual) {
        setLoading(false);
        return;
      }

      setDados(atual.conteudo_json);

      // 2. Busca os "Vizinhos" (Mesma Banca e Mesmo Módulo/Tópico)
      // Ordenados por Data de Criação (para seguir a ordem que você cadastrou)
      const { data: lista } = await supabase
        .from('modulos_estudo')
        .select('modulo_slug, id')
        .eq('banca', atual.banca)
        .eq('modulo_nome', atual.modulo_nome)
        .order('created_at', { ascending: true });

      if (lista) {
        // Encontra o índice da questão atual na lista
        const indexAtual = lista.findIndex(item => item.id === atual.id);
        
        // Define Anterior e Próxima
        if (indexAtual > 0) {
          setAnteriorSlug(lista[indexAtual - 1].modulo_slug);
        } else {
          setAnteriorSlug(null);
        }

        if (indexAtual < lista.length - 1) {
          setProximaSlug(lista[indexAtual + 1].modulo_slug);
        } else {
          setProximaSlug(null); // É a última (Concluir)
        }
      }

      setLoading(false);
    }

    if (params.slug) carregarSessao();
  }, [params.slug]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="font-black uppercase tracking-widest text-indigo-600 text-xs animate-pulse">
        Sincronizando Trilha...
      </p>
    </div>
  );

  if (!dados) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">
      Missão não encontrada.
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="w-full h-full max-w-6xl max-h-[90vh]">
        {/* Passamos os slugs de navegação para o Player */}
        <AvantLessonPlayer 
          dados={dados} 
          mode="live" 
          proximaSlug={proximaSlug}
          anteriorSlug={anteriorSlug}
          moduloSlug={params.slug as string}
        />
      </div>
    </div>
  );
}
