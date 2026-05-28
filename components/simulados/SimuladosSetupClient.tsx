'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ClipboardList, Loader2, PlayCircle, SearchX } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardFilterSelect } from '@/components/dashboard/DashboardFilterSelect';
import { SELECT_TRIGGER_DARK_PANEL } from '@/components/dashboard/dashboard-select-dark';
import {
  createSimuladoSession,
  getSimuladoPoolCount,
  getOpenSimuladoSession,
  SimuladoApiError,
} from '@/lib/simulado/client';
import { SimuladoCreateSessionSchema } from '@/lib/validations';
import type { ZodIssue } from 'zod';
import type { VitrineFacets } from '@/lib/vitrine/types';
import { cn } from '@/lib/utils';
import type { SimuladoOpenSessionResponse } from '@/lib/simulado/types';
import type { SimuladoModo } from '@/lib/simulado/types';

function formatZodIssues(issues: ZodIssue[]): string {
  const first = issues[0];
  if (!first) return 'Verifique os campos do formulário.';
  const field = first.path.length ? String(first.path[0]) : 'formulário';
  return `${field}: ${first.message}`;
}

export function SimuladosSetupClient() {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState('20');
  const [banca, setBanca] = useState('');
  const [assunto, setAssunto] = useState('');
  const [q, setQ] = useState('');
  const [modo, setModo] = useState<SimuladoModo>('treino');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noQuestions, setNoQuestions] = useState(false);

  const [bancas, setBancas] = useState<string[]>([]);
  const [assuntos, setAssuntos] = useState<string[]>([]);
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [filtrosSelectMontados, setFiltrosSelectMontados] = useState(false);
  const [openSession, setOpenSession] = useState<SimuladoOpenSessionResponse['session']>(null);
  const [loadingOpenSession, setLoadingOpenSession] = useState(true);
  const [poolCount, setPoolCount] = useState<number | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);
  const [freemiumStatus, setFreemiumStatus] = useState<{
    isPro: boolean;
    limiteAtingido: boolean;
    resetEm: string;
  } | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFiltrosSelectMontados(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadOpenSession() {
      setLoadingOpenSession(true);
      try {
        const response = await getOpenSimuladoSession();
        if (cancelled) return;
        setOpenSession(response.session);
      } catch {
        if (!cancelled) setOpenSession(null);
      } finally {
        if (!cancelled) setLoadingOpenSession(false);
      }
    }
    void loadOpenSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFacets() {
      setFacetsLoading(true);
      const params = new URLSearchParams();
      if (banca) params.set('banca', banca);

      try {
        const query = params.toString();
        const res = await fetchWithAuth(
          query ? `/api/vitrine/facets?${query}` : '/api/vitrine/facets',
        );
        if (!res.ok) throw new Error('facets');
        const data = (await res.json()) as VitrineFacets;
        if (cancelled) return;
        setBancas(data.bancas);
        setAssuntos(data.assuntos);
        setAssunto((current) => (current && !data.assuntos.includes(current) ? '' : current));
      } catch {
        if (!cancelled) {
          setBancas([]);
          setAssuntos([]);
        }
      } finally {
        if (!cancelled) setFacetsLoading(false);
      }
    }

    void loadFacets();
    return () => {
      cancelled = true;
    };
  }, [banca]);

  useEffect(() => {
    let cancelled = false;
    async function loadFreemiumStatus() {
      try {
        const res = await fetchWithAuth('/api/freemium/status');
        if (!res.ok) return;
        const data = (await res.json()) as { isPro: boolean; limiteAtingido: boolean; resetEm: string };
        if (!cancelled) setFreemiumStatus(data);
      } catch {
        // noop
      }
    }
    void loadFreemiumStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      setPoolLoading(true);
      try {
        const data = await getSimuladoPoolCount({
          ...(banca ? { banca } : {}),
          ...(assunto ? { assunto } : {}),
          ...(q.trim() ? { q: q.trim() } : {}),
        });
        if (!cancelled) setPoolCount(data.estimated_count);
      } catch {
        if (!cancelled) setPoolCount(null);
      } finally {
        if (!cancelled) setPoolLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [banca, assunto, q]);

  const freeLimitReached = useMemo(
    () => !!freemiumStatus && !freemiumStatus.isPro && freemiumStatus.limiteAtingido,
    [freemiumStatus],
  );

  const clearFilters = () => {
    setBanca('');
    setAssunto('');
    setQ('');
    setError(null);
    setNoQuestions(false);
  };

  const startSession = async (opts?: { forcarNovo?: boolean }) => {
    setLoading(true);
    setError(null);
    setNoQuestions(false);

    const parsed = SimuladoCreateSessionSchema.safeParse({
      quantidade,
      modo,
      ...(banca ? { banca } : {}),
      ...(assunto ? { assunto } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
      ...(opts?.forcarNovo ? { forcar_novo: true } : {}),
    });

    if (!parsed.success) {
      setError(formatZodIssues(parsed.error.issues));
      setLoading(false);
      return;
    }

    try {
      const result = await createSimuladoSession(parsed.data);
      router.push(`/simulados/${result.session.id}`);
    } catch (err) {
      if (err instanceof SimuladoApiError) {
        if (err.status === 404) {
          setNoQuestions(true);
          setError(null);
        } else if (err.status === 400 && err.details && typeof err.details === 'object') {
          const flat = err.details as { fieldErrors?: Record<string, string[]> };
          const fieldMsg = flat.fieldErrors
            ? Object.entries(flat.fieldErrors)
                .flatMap(([k, msgs]) => msgs.map((m) => `${k}: ${m}`))
                .join(' ')
            : null;
          setError(fieldMsg || err.message);
        } else if (err.status === 403) {
          setError('Plano gratuito: 1 simulado por dia. Faça upgrade para liberar ilimitado.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Não foi possível iniciar o simulado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await startSession();
  };

  return (
    <div className="min-h-screen bg-[#010409] px-4 pb-safe pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Simulados"
          description="Monte um simulado com questões do seu catálogo. Corrija questão a questão e revise o resultado ao final."
          descriptionClassName="text-sm text-slate-400 mt-1 max-w-xl"
          titleClassName="text-2xl font-[1000] italic tracking-tighter text-white"
        />

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="glass-panel space-y-6 border border-white/10 p-6 sm:p-8"
          aria-busy={loading}
        >
          {loadingOpenSession ? (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Verificando sessão em andamento...
            </div>
          ) : openSession ? (
            <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="text-sm text-slate-200">
                Você tem um simulado em andamento ({openSession.modo}) com {openSession.total_questoes}{' '}
                questões.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => router.push(`/simulados/${openSession.id}`)}
                  className="h-10 rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                >
                  <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
                  Continuar simulado
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => void startSession({ forcarNovo: true })}
                  className="h-10 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5"
                >
                  Iniciar novo simulado
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
            <ClipboardList className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden />
            <p className="text-sm text-slate-300">
              Filtros opcionais refinam o pool. Sem filtros, o simulado usa questões acessíveis no seu
              plano.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-slate-200">Modo do simulado</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setModo('treino')}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left text-sm',
                  modo === 'treino'
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                    : 'border-white/10 bg-white/[0.02] text-slate-300',
                )}
              >
                <span className="block font-semibold">Treino</span>
                <span className="text-xs text-slate-400">Feedback imediato com gabarito por questão.</span>
              </button>
              <button
                type="button"
                onClick={() => setModo('prova')}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left text-sm',
                  modo === 'prova'
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                    : 'border-white/10 bg-white/[0.02] text-slate-300',
                )}
              >
                <span className="block font-semibold">Prova</span>
                <span className="text-xs text-slate-400">Gabarito liberado apenas no resumo final.</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="simulado-quantidade" className="text-sm font-medium text-slate-300">
              Quantidade de questões
            </label>
            <Input
              id="simulado-quantidade"
              type="number"
              min={1}
              max={100}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              disabled={loading}
              className="h-11 rounded-xl border-white/15 bg-[#0d1117] text-slate-100"
            />
            <p className="text-xs text-slate-500">Entre 1 e 100 questões (padrão: 20).</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
            {poolLoading ? (
              <span>Estimando pool de questões...</span>
            ) : poolCount !== null ? (
              <span>
                ~{poolCount} questões disponíveis com os filtros atuais.
              </span>
            ) : (
              <span>Não foi possível estimar o pool com os filtros atuais.</span>
            )}
          </div>

          {freeLimitReached && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Plano gratuito: limite de 1 simulado por dia atingido. Novo acesso em{' '}
              {new Date(freemiumStatus!.resetEm).toLocaleString('pt-BR')}.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span id="simulado-banca-label" className="text-sm font-medium text-slate-300">
                Banca (opcional)
              </span>
              {filtrosSelectMontados ? (
                <DashboardFilterSelect
                  id="simulado-banca"
                  aria-labelledby="simulado-banca-label"
                  variant="panel"
                  placeholder="Todas as bancas"
                  allLabel="Todas as bancas"
                  sheetTitle="Filtrar por banca"
                  value={banca}
                  options={bancas}
                  disabled={loading || (facetsLoading && bancas.length === 0)}
                  onValueChange={(v) => {
                    setBanca(v);
                    setNoQuestions(false);
                  }}
                />
              ) : (
                <div
                  className={cn(SELECT_TRIGGER_DARK_PANEL, 'text-slate-400')}
                  aria-hidden
                >
                  <span className="line-clamp-1">Todas as bancas</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span id="simulado-assunto-label" className="text-sm font-medium text-slate-300">
                Assunto (opcional)
              </span>
              {filtrosSelectMontados ? (
                <DashboardFilterSelect
                  id="simulado-assunto"
                  aria-labelledby="simulado-assunto-label"
                  variant="panel"
                  placeholder="Todos os assuntos"
                  allLabel="Todos os assuntos"
                  sheetTitle="Filtrar por assunto"
                  value={assunto}
                  options={assuntos}
                  disabled={loading || (facetsLoading && assuntos.length === 0)}
                  onValueChange={(v) => {
                    setAssunto(v);
                    setNoQuestions(false);
                  }}
                />
              ) : (
                <div
                  className={cn(SELECT_TRIGGER_DARK_PANEL, 'text-slate-400')}
                  aria-hidden
                >
                  <span className="line-clamp-1">Todos os assuntos</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="simulado-q" className="text-sm font-medium text-slate-300">
              Busca livre (opcional)
            </label>
            <Input
              id="simulado-q"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setNoQuestions(false);
              }}
              disabled={loading}
              placeholder="Palavra-chave no enunciado ou metadados"
              className="h-11 rounded-xl border-white/15 bg-[#0d1117] text-slate-100"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          {noQuestions && (
            <EmptyState
              icon={SearchX}
              title="Nenhuma questão encontrada"
              description="Não há questões acessíveis com os filtros atuais. Amplie a busca ou remova filtros."
              action={{ label: 'Limpar filtros', onClick: clearFilters }}
              className="py-10"
            />
          )}

          <Button
            type="submit"
            disabled={loading || freeLimitReached}
            className={cn(
              'h-12 w-full rounded-2xl text-base font-semibold',
              'border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Montando simulado…
              </>
            ) : (
              openSession ? 'Iniciar novo simulado' : 'Iniciar simulado'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
