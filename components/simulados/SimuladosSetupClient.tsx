'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Loader2, PlayCircle, SearchX } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { MultiCheckboxFilter } from '@/components/ui/MultiCheckboxFilter';
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
import {
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
} from '@/lib/freemium';
import { PaywallModal } from '@/components/freemium/PaywallModal';

function formatZodIssues(issues: ZodIssue[]): string {
  const first = issues[0];
  if (!first) return 'Verifique os campos do formulário.';
  const field = first.path.length ? String(first.path[0]) : 'formulário';
  return `${field}: ${first.message}`;
}

export function SimuladosSetupClient() {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState('20');
  const [bancasSelecionadas, setBancasSelecionadas] = useState<string[]>([]);
  const [assuntosSelecionados, setAssuntosSelecionados] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [modo, setModo] = useState<SimuladoModo>('treino');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noQuestions, setNoQuestions] = useState(false);

  const [facetBancas, setFacetBancas] = useState<string[]>([]);
  const [facetAssuntos, setFacetAssuntos] = useState<string[]>([]);
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [openSession, setOpenSession] = useState<SimuladoOpenSessionResponse['session']>(null);
  const [loadingOpenSession, setLoadingOpenSession] = useState(true);
  const [poolCount, setPoolCount] = useState<number | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);
  const [freemiumStatus, setFreemiumStatus] = useState<{
    isPro: boolean;
    resetEm: string;
    simulado: {
      questoesHoje: number;
      limite: number;
      restantes: number;
      limiteAtingido: boolean;
    };
  } | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

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
      bancasSelecionadas.forEach((b) => params.append('bancas', b));

      try {
        const query = params.toString();
        const res = await fetchWithAuth(
          query ? `/api/vitrine/facets?${query}` : '/api/vitrine/facets',
        );
        if (!res.ok) throw new Error('facets');
        const data = (await res.json()) as VitrineFacets;
        if (cancelled) return;
        setFacetBancas(data.bancas);
        setFacetAssuntos(data.assuntos);
        setAssuntosSelecionados((current) =>
          current.filter((a) => data.assuntos.includes(a)),
        );
      } catch {
        if (!cancelled) {
          setFacetBancas([]);
          setFacetAssuntos([]);
        }
      } finally {
        if (!cancelled) setFacetsLoading(false);
      }
    }

    void loadFacets();
    return () => {
      cancelled = true;
    };
  }, [bancasSelecionadas]);

  useEffect(() => {
    let cancelled = false;
    async function loadFreemiumStatus() {
      try {
        const res = await fetchWithAuth('/api/freemium/status');
        if (!res.ok) return;
        const data = (await res.json()) as {
          isPro: boolean;
          resetEm: string;
          simulado: {
            questoesHoje: number;
            limite: number;
            restantes: number;
            limiteAtingido: boolean;
          };
        };
        if (!cancelled && data.simulado) setFreemiumStatus(data);
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
          ...(bancasSelecionadas.length ? { bancas: bancasSelecionadas } : {}),
          ...(assuntosSelecionados.length ? { assuntos: assuntosSelecionados } : {}),
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
  }, [bancasSelecionadas, assuntosSelecionados, q]);

  const simuladoFreeLimitReached = useMemo(
    () =>
      !!freemiumStatus && !freemiumStatus.isPro && freemiumStatus.simulado.limiteAtingido,
    [freemiumStatus],
  );

  const startLabel = openSession ? 'Iniciar novo simulado' : 'Iniciar simulado';

  const startButtonClassName = cn(
    'h-12 w-full rounded-2xl text-base font-semibold',
    'border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25',
  );

  const simuladoFreeHint = useMemo(() => {
    if (!freemiumStatus || freemiumStatus.isPro) return null;
    const { questoesHoje, limite, restantes } = freemiumStatus.simulado;
    if (simuladoFreeLimitReached) {
      return `Plano gratuito: limite de ${limite} questões de simulado por dia atingido (${FREEMIUM_PLAN_LIMITS_DESCRIPTION}). Novo acesso em ${new Date(freemiumStatus.resetEm).toLocaleString('pt-BR')}. Você ainda pode continuar um simulado em andamento para revisar questões já respondidas.`;
    }
    return `Plano gratuito para treinar: ${FREEMIUM_PLAN_LIMITS_DESCRIPTION}. No simulado: ${restantes} de ${limite} restante${restantes === 1 ? '' : 's'} hoje (${questoesHoje} respondida${questoesHoje === 1 ? '' : 's'}).`;
  }, [freemiumStatus, simuladoFreeLimitReached]);

  const clearFilters = () => {
    setBancasSelecionadas([]);
    setAssuntosSelecionados([]);
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
      ...(bancasSelecionadas.length ? { bancas: bancasSelecionadas } : {}),
      ...(assuntosSelecionados.length ? { assuntos: assuntosSelecionados } : {}),
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

  const requestStartSession = (opts?: { forcarNovo?: boolean }) => {
    if (simuladoFreeLimitReached) {
      setPaywallOpen(true);
      return;
    }
    void startSession(opts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (simuladoFreeLimitReached) {
      setPaywallOpen(true);
      return;
    }
    await startSession(openSession ? { forcarNovo: true } : undefined);
  };

  return (
    <div className="min-h-screen bg-[#010409] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Simulados"
          description="Monte um simulado com questões do seu catálogo. Corrija questão a questão e revise o resultado ao final."
          descriptionClassName="text-sm text-slate-400 mt-1 max-w-xl"
          titleClassName="text-2xl font-[1000] italic tracking-tighter text-white"
        />

        <form
          id="simulado-setup-form"
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
                  onClick={() => requestStartSession({ forcarNovo: true })}
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

          {simuladoFreeHint && (
            <div
              className={cn(
                'rounded-xl border px-4 py-3 text-sm',
                simuladoFreeLimitReached
                  ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                  : 'border-white/10 bg-white/[0.02] text-slate-400',
              )}
            >
              {simuladoFreeHint}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span id="simulado-banca-label" className="text-sm font-medium text-slate-300">
                Banca (opcional)
              </span>
              <MultiCheckboxFilter
                id="simulado-banca"
                aria-labelledby="simulado-banca-label"
                emptyLabel="Todas as bancas"
                searchPlaceholder="Buscar banca..."
                addButtonLabel="Adicionar banca"
                sheetTitle="Adicionar banca"
                emptySearchLabel="Nenhuma banca encontrada"
                options={facetBancas}
                value={bancasSelecionadas}
                disabled={loading || (facetsLoading && facetBancas.length === 0)}
                onChange={(next) => {
                  setBancasSelecionadas(next);
                  setNoQuestions(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <span id="simulado-assunto-label" className="text-sm font-medium text-slate-300">
                Assunto (opcional)
              </span>
              <MultiCheckboxFilter
                id="simulado-assunto"
                aria-labelledby="simulado-assunto-label"
                emptyLabel="Todos os assuntos"
                searchPlaceholder="Buscar assunto..."
                addButtonLabel="Adicionar assunto"
                sheetTitle="Adicionar assunto"
                emptySearchLabel="Nenhum assunto encontrado"
                contentMinWidth="min-w-[240px]"
                options={facetAssuntos}
                value={assuntosSelecionados}
                disabled={loading || (facetsLoading && facetAssuntos.length === 0)}
                onChange={(next) => {
                  setAssuntosSelecionados(next);
                  setNoQuestions(false);
                }}
              />
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
            disabled={loading}
            className={cn(startButtonClassName, 'hidden md:inline-flex')}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Montando simulado…
              </>
            ) : (
              startLabel
            )}
          </Button>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-white/10 bg-[#010409]/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-[#010409]/80 md:hidden">
        {openSession ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            <Button
              type="button"
              onClick={() => router.push(`/simulados/${openSession.id}`)}
              className={startButtonClassName}
            >
              <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
              Continuar simulado
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => requestStartSession({ forcarNovo: true })}
              className="h-10 w-full rounded-xl border border-white/15 text-slate-300 hover:bg-white/5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Montando simulado…
                </>
              ) : (
                'Iniciar novo simulado'
              )}
            </Button>
          </div>
        ) : simuladoFreeLimitReached ? (
          <div className="mx-auto max-w-3xl space-y-2">
            <Button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="h-12 w-full rounded-2xl border border-amber-400/40 bg-amber-400/15 text-base font-semibold text-amber-200 hover:bg-amber-400/25"
            >
              Limite diário atingido — ver AVANT Pro
            </Button>
          </div>
        ) : (
          <Button
            type="submit"
            form="simulado-setup-form"
            disabled={loading}
            className={cn(startButtonClassName, 'mx-auto max-w-3xl')}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Montando simulado…
              </>
            ) : (
              startLabel
            )}
          </Button>
        )}
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        resetEm={freemiumStatus?.resetEm ?? null}
        isAuthenticated
        variant="simulado"
      />
    </div>
  );
}
