import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAnalyticsSummary } from '@/lib/analytics';
import { generateRecommendations } from '@/lib/recommendations';
import { getTodayReviews } from '@/lib/spaced-repetition';
import StatsCards from '@/components/analytics/StatsCards';
import ProgressChart from '@/components/analytics/ProgressChart';
import PerformanceHeatmap from '@/components/analytics/PerformanceHeatmap';
import ErrorPatterns from '@/components/analytics/ErrorPatterns';
import Recommendations from '@/components/analytics/Recommendations';
import { logger } from '@/lib/logger';
import { BarChart3, BookOpen, Brain, ChevronRight, Crosshair, Flame, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Next.js já cuida dos cookies em Server Components
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  try {
    // Buscar histórico completo diretamente (sem cache para analytics)
    const { data: historicoData, error: historicoError } = await supabase
      .from('historico_questoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (historicoError) {
      logger.error('Failed to fetch history for analytics', historicoError, { userId });
      throw new Error('Erro ao buscar histórico de questões');
    }

    const historico = (historicoData || []) as any[];

    // ── EMPTY STATE ───────────────────────────────────────────────────────────
    if (historico.length === 0) {
      return (
        <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6 relative overflow-hidden">
          {/* Blurs decorativos */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl w-full text-center space-y-10">

            {/* Ícone central */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <BarChart3 size={44} className="text-indigo-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Zap size={12} className="text-amber-400" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Texto principal */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Desempenho Inteligente
              </p>
              <h1 className="text-3xl md:text-4xl font-[1000] italic tracking-tighter text-white leading-tight">
                Seus Insights Aparecem<br />
                <span className="text-indigo-400">Aqui em Breve</span>
              </h1>
              <p className="text-slate-400 font-medium text-sm max-w-md mx-auto leading-relaxed">
                Complete sua primeira sessão de estudos e o sistema começa a mapear
                seu desempenho com análises precisas e recomendações personalizadas.
              </p>
            </div>

            {/* Preview do que vai aparecer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icone: <TrendingUp size={18} />, label: 'Taxa de Acerto', cor: 'emerald' },
                { icone: <Brain size={18} />, label: 'Padrões de Erro', cor: 'violet' },
                { icone: <Crosshair size={18} />, label: 'Áreas Críticas', cor: 'rose' },
                { icone: <Flame size={18} />, label: 'Streak de Estudos', cor: 'amber' },
              ].map(({ icone, label, cor }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl border border-white/5 bg-white/[0.03] flex flex-col items-center gap-2 opacity-50"
                >
                  <div className={`w-9 h-9 rounded-xl bg-${cor}-500/10 border border-${cor}-500/20 flex items-center justify-center text-${cor}-400`}>
                    {icone}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide text-center leading-tight">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Passos rápidos */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-left space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-4">
                Como desbloquear seus insights
              </p>
              {[
                { n: '1', texto: 'Acesse a Vitrine de Aulas', detalhe: 'Escolha um módulo do seu edital' },
                { n: '2', texto: 'Responda as questões', detalhe: 'Pode ser apenas 5 questões para começar' },
                { n: '3', texto: 'Volte aqui', detalhe: 'Seus dados já estarão sendo analisados' },
              ].map(({ n, texto, detalhe }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 mt-0.5">
                    {n}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{texto}</p>
                    <p className="text-xs text-slate-500">{detalhe}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="/estudar"
              className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 group"
            >
              <BookOpen size={18} />
              Começar a Estudar Agora
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>

          </div>
        </div>
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Importar funções de análise
    const analyticsModule = await import('@/lib/analytics');
    const {
      calculateOverallStats,
      analyzeByTopic,
      analyzeByBanca,
      generateTimeSeries,
      identifyErrorPatterns,
      identifyWeakAreas,
      identifyStrongAreas,
    } = analyticsModule;

    // Calcular analytics
    const overall = calculateOverallStats(historico);
    const byTopic = analyzeByTopic(historico);
    const byBanca = analyzeByBanca(historico);
    const timeSeries = generateTimeSeries(historico, 30);
    const errorPatterns = identifyErrorPatterns(historico);
    const weakAreas = identifyWeakAreas(byTopic);
    const strongAreas = identifyStrongAreas(byTopic);

    const analytics = {
      overall,
      byTopic,
      byBanca,
      timeSeries,
      errorPatterns,
      weakAreas,
      strongAreas,
    };

    // Buscar recomendações e revisões usando histórico já carregado
    const recommendationsModule = await import('@/lib/recommendations');
    const spacedRepetitionModule = await import('@/lib/spaced-repetition');
    
    // Gerar recomendações usando histórico já carregado
    let recommendations: any[] = [];
    let reviews: any[] = [];
    
    try {
      // Passar histórico para as funções que precisam
      recommendations = await recommendationsModule.generateRecommendations(userId, { 
        maxRecommendations: 10 
      });
    } catch (err) {
      logger.error('Failed to generate recommendations', err, { userId });
      recommendations = [];
    }
    
    try {
      reviews = await spacedRepetitionModule.getTodayReviews(userId);
    } catch (err) {
      logger.error('Failed to get today reviews', err, { userId });
      reviews = [];
    }

    return (
      <div className="min-h-screen bg-[#010409] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Insights Inteligentes</h1>
            <p className="text-slate-400">
              Análise detalhada do seu desempenho e recomendações personalizadas
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={analytics.overall} />

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Progresso */}
            <div className="lg:col-span-2">
              <ProgressChart data={analytics.timeSeries} />
            </div>

            {/* Recomendações */}
            <div>
              <Recommendations recommendations={recommendations} maxItems={5} />
            </div>

            {/* Revisões Espaçadas */}
            {reviews.length > 0 && (
              <div>
                <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Revisões para Hoje</h3>
                    <span className="ml-auto px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">
                      {reviews.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {reviews.slice(0, 5).map((review) => (
                      <a
                        key={review.modulo_slug}
                        href={`/estudar/${review.modulo_slug}`}
                        className="block p-3 rounded-lg border border-white/10 bg-slate-800/50 hover:border-emerald-400/50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {review.topico || review.modulo_slug}
                            </p>
                            {review.subtopico && (
                              <p className="text-xs text-slate-400">{review.subtopico}</p>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            Prioridade: {review.priority}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Heatmap de Desempenho */}
            <div className="lg:col-span-2">
              <PerformanceHeatmap data={analytics.byTopic} maxItems={15} />
            </div>

            {/* Padrões de Erro */}
            {analytics.errorPatterns.length > 0 && (
              <div className="lg:col-span-2">
                <ErrorPatterns patterns={analytics.errorPatterns} />
              </div>
            )}

            {/* Áreas Fracas */}
            {analytics.weakAreas.length > 0 && (
              <div>
                <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="text-lg font-semibold text-white">Áreas que Precisam Atenção</h3>
                  </div>
                  <div className="space-y-2">
                    {analytics.weakAreas.slice(0, 5).map((area) => (
                      <div
                        key={`${area.topico}-${area.subtopico || 'none'}`}
                        className="p-3 rounded-lg border border-rose-400/20 bg-rose-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{area.topico}</p>
                            {area.subtopico && (
                              <p className="text-xs text-slate-400">{area.subtopico}</p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-rose-400">
                            {area.percentual}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Áreas Fortes */}
            {analytics.strongAreas.length > 0 && (
              <div>
                <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Áreas de Maestria</h3>
                  </div>
                  <div className="space-y-2">
                    {analytics.strongAreas.slice(0, 5).map((area) => (
                      <div
                        key={`${area.topico}-${area.subtopico || 'none'}`}
                        className="p-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{area.topico}</p>
                            {area.subtopico && (
                              <p className="text-xs text-slate-400">{area.subtopico}</p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-emerald-400">
                            {area.percentual}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Failed to load analytics', error, { userId });
    
    // Log detalhado para debug
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Analytics error details', {
      userId,
      errorMessage,
      errorStack,
      error: String(error),
    });
    
    return (
      <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Erro ao carregar insights</h2>
          <p className="text-slate-400 mb-4">
            {process.env.NODE_ENV === 'development' 
              ? `Erro: ${errorMessage}` 
              : 'Tente novamente mais tarde'}
          </p>
          <div className="mt-4">
            <a
              href="/estudar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white hover:bg-slate-700 transition"
            >
              <BookOpen className="w-4 h-4" />
              Voltar para Estudos
            </a>
          </div>
        </div>
      </div>
    );
  }
}
