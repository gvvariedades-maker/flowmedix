import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import MeuDesempenhoClient from './MeuDesempenhoClient';

export interface DiaEstudo {
  data: string;   // 'YYYY-MM-DD'
  count: number;  // questões com estudo_reverso_concluido naquele dia
}

export interface AssuntoTop {
  nome: string;
  count: number;
}

export interface DesempenhoData {
  hoje: number;
  metaDiaria: number;
  streak: number;
  totalGeral: number;       // últimos 30 dias
  totalTodosTempos: number; // desde o início
  serie30dias: DiaEstudo[];
  topAssuntos: AssuntoTop[];
}

const META_DIARIA = 10;

export default async function MeuDesempenhoPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');

  const userId = session.user.id;

  try {
    // Busca total histórico (todos os tempos) e últimos 30 dias em paralelo
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);

    const [{ count: totalHistorico, error: errorTotal }, { data, error }] = await Promise.all([
      supabase
        .from('historico_questoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('estudo_reverso_concluido', true),
      supabase
        .from('historico_questoes')
        .select('created_at, subtopico, topico, modulo_slug')
        .eq('user_id', userId)
        .eq('estudo_reverso_concluido', true)
        .gte('created_at', desde.toISOString())
        .order('created_at', { ascending: false }),
    ]);

    if (errorTotal) {
      logger.error('Failed to fetch total count for meu-desempenho', errorTotal, { userId });
    }
    if (error) {
      logger.error('Failed to fetch history for meu-desempenho', error, { userId });
      throw error;
    }

    const registros = (data || []) as any[];
    const totalTodosTempos = totalHistorico ?? 0;

    // ── helpers de data ────────────────────────────────────────────────────────
    const toDateStr = (iso: string) => iso.slice(0, 10); // 'YYYY-MM-DD'
    const todayStr = new Date().toISOString().slice(0, 10);

    // ── Conta de hoje ──────────────────────────────────────────────────────────
    const hoje = registros.filter(r => toDateStr(r.created_at) === todayStr).length;

    // ── Total geral ────────────────────────────────────────────────────────────
    const totalGeral = registros.length;

    // ── Série temporal 30 dias ─────────────────────────────────────────────────
    const countByDay = new Map<string, number>();
    registros.forEach(r => {
      const d = toDateStr(r.created_at);
      countByDay.set(d, (countByDay.get(d) || 0) + 1);
    });

    const serie30dias: DiaEstudo[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      serie30dias.push({ data: str, count: countByDay.get(str) || 0 });
    }

    // ── Streak (dias consecutivos com pelo menos 1 questão) ───────────────────
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      if ((countByDay.get(str) || 0) > 0) {
        streak++;
      } else {
        // Tolera ausência somente no dia de hoje (pode ainda estudar)
        if (i === 0) continue;
        break;
      }
    }

    // ── Top assuntos ───────────────────────────────────────────────────────────
    const countByAssunto = new Map<string, number>();
    registros.forEach(r => {
      const nome = r.subtopico || r.topico || r.modulo_slug || 'Geral';
      countByAssunto.set(nome, (countByAssunto.get(nome) || 0) + 1);
    });
    const topAssuntos: AssuntoTop[] = Array.from(countByAssunto.entries())
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const desempenho: DesempenhoData = {
      hoje,
      metaDiaria: META_DIARIA,
      streak,
      totalGeral,
      totalTodosTempos,
      serie30dias,
      topAssuntos,
    };

    return <MeuDesempenhoClient dados={desempenho} />;
  } catch (error) {
    logger.error('Failed to load meu-desempenho', error, { userId });
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <p className="text-slate-500 text-sm">Erro ao carregar dados. Tente novamente.</p>
          <a href="/estudar" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm">
            Voltar para Estudos
          </a>
        </div>
      </div>
    );
  }
}
