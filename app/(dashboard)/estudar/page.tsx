import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import VitrineClient from '@/components/vitrine/VitrineClient';

interface ModuloEstudoRow {
  id: string;
  modulo_slug: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  banca: string;
  [key: string]: any;
}

interface HistoricoQuestaoRow {
  modulo_slug: string;
  acertou: boolean;
  [key: string]: any;
}

export default async function VitrinePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const [modulosRes, historicoRes] = await Promise.all([
    supabase.from('modulos_estudo').select('*'),
    supabase.from('historico_questoes').select('*')
  ]);

  const modulosData = (modulosRes.data || []) as ModuloEstudoRow[];
  const historicoData = (historicoRes.data || []) as HistoricoQuestaoRow[];

  const modulosProcessados = modulosData.map((modulo: ModuloEstudoRow) => {
    const tentativas = historicoData.filter((h: HistoricoQuestaoRow) => h.modulo_slug === modulo.modulo_slug);
    const acertos = tentativas.filter((t: HistoricoQuestaoRow) => t.acertou).length;
    const total = tentativas.length;
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
    
    let priorityScore = 0;
    if (total === 0) priorityScore = 50; 
    else if (percentual < 70) priorityScore = 100 + (70 - percentual);
    else if (percentual >= 90) priorityScore = 10;
    else priorityScore = 30;

    return {
      id: modulo.id,
      modulo_slug: modulo.modulo_slug,
      modulo_nome: modulo.modulo_nome || 'Módulo',
      titulo_aula: modulo.titulo_aula || 'Aula sem título',
      banca: modulo.banca,
      stats: { acertos, total, percentual, priorityScore }
    };
  }).sort((a: any, b: any) => b.stats.priorityScore - a.stats.priorityScore);

  const totalAcertos = historicoData.filter((h: HistoricoQuestaoRow) => h.acertou).length;
  const globalStats = {
    ofensiva: 1,
    xp: totalAcertos * 50,
    taxaGeral: Math.round((totalAcertos / (historicoData.length || 1)) * 100)
  };

  return (
    <VitrineClient 
      initialModulos={modulosProcessados} 
      globalStats={globalStats} 
    />
  );
}
