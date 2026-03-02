import VitrineClient from '@/components/vitrine/VitrineClient';
import { 
  getModulosEstudoCached, 
  getHistoricoQuestoesCached 
} from '@/lib/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  // Obter userId fora do cache (cookies são dinâmicos - não permitidos dentro de unstable_cache)
  const cookieStore = await cookies();
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
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Usa cache estratégico - revalida a cada 5 minutos (módulos) e 2 minutos (histórico)
  const [modulosData, historicoData] = await Promise.all([
    getModulosEstudoCached(),
    getHistoricoQuestoesCached(userId),
  ]);

  // Type assertions para compatibilidade
  const modulosTyped = (modulosData || []) as ModuloEstudoRow[];
  const historicoTyped = (historicoData || []) as HistoricoQuestaoRow[];

  // Otimização: Criar Map para O(1) lookup em vez de O(n*m)
  const historicoMap = new Map<string, HistoricoQuestaoRow[]>();
  historicoTyped.forEach((h: HistoricoQuestaoRow) => {
    const existing = historicoMap.get(h.modulo_slug) || [];
    historicoMap.set(h.modulo_slug, [...existing, h]);
  });

  const modulosProcessados = modulosTyped.map((modulo: ModuloEstudoRow) => {
    const tentativas = historicoMap.get(modulo.modulo_slug) || [];
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

  const totalAcertos = historicoTyped.filter((h: HistoricoQuestaoRow) => h.acertou).length;
  const globalStats = {
    ofensiva: 1,
    xp: totalAcertos * 50,
    taxaGeral: Math.round((totalAcertos / (historicoTyped.length || 1)) * 100)
  };

  return (
    <VitrineClient 
      initialModulos={modulosProcessados} 
      globalStats={globalStats} 
    />
  );
}
