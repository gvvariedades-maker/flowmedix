'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ClipboardList, Loader2, SearchX } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FILTER_ALL_VALUE,
  SELECT_CONTENT_DARK,
  SELECT_ITEM_DARK,
  SELECT_TRIGGER_DARK_PANEL,
} from '@/components/dashboard/dashboard-select-dark';
import { createSimuladoSession, SimuladoApiError } from '@/lib/simulado/client';
import { SimuladoCreateSessionSchema } from '@/lib/validations';
import type { ZodIssue } from 'zod';
import type { VitrineFacets } from '@/lib/vitrine/types';
import { cn } from '@/lib/utils';

const FILTER_ALL = FILTER_ALL_VALUE;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noQuestions, setNoQuestions] = useState(false);

  const [bancas, setBancas] = useState<string[]>([]);
  const [assuntos, setAssuntos] = useState<string[]>([]);
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [filtrosSelectMontados, setFiltrosSelectMontados] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFiltrosSelectMontados(true));
    return () => cancelAnimationFrame(id);
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

  const clearFilters = () => {
    setBanca('');
    setAssunto('');
    setQ('');
    setError(null);
    setNoQuestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNoQuestions(false);

    const parsed = SimuladoCreateSessionSchema.safeParse({
      quantidade,
      ...(banca ? { banca } : {}),
      ...(assunto ? { assunto } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
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
          onSubmit={handleSubmit}
          className="glass-panel space-y-6 border border-white/10 p-6 sm:p-8"
          aria-busy={loading}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
            <ClipboardList className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden />
            <p className="text-sm text-slate-300">
              Filtros opcionais refinam o pool. Sem filtros, o simulado usa questões acessíveis no seu
              plano.
            </p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span id="simulado-banca-label" className="text-sm font-medium text-slate-300">
                Banca (opcional)
              </span>
              {filtrosSelectMontados ? (
                <Select
                  value={banca || FILTER_ALL}
                  disabled={loading || (facetsLoading && bancas.length === 0)}
                  onValueChange={(v) => {
                    setBanca(v === FILTER_ALL ? '' : v);
                    setNoQuestions(false);
                  }}
                >
                  <SelectTrigger
                    id="simulado-banca"
                    aria-labelledby="simulado-banca-label"
                    className={SELECT_TRIGGER_DARK_PANEL}
                  >
                    <SelectValue placeholder="Todas as bancas" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" className={SELECT_CONTENT_DARK}>
                    <SelectItem value={FILTER_ALL} className={SELECT_ITEM_DARK}>
                      Todas as bancas
                    </SelectItem>
                    {bancas.map((b) => (
                      <SelectItem key={b} value={b} className={SELECT_ITEM_DARK}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select
                  value={assunto || FILTER_ALL}
                  disabled={loading || (facetsLoading && assuntos.length === 0)}
                  onValueChange={(v) => {
                    setAssunto(v === FILTER_ALL ? '' : v);
                    setNoQuestions(false);
                  }}
                >
                  <SelectTrigger
                    id="simulado-assunto"
                    aria-labelledby="simulado-assunto-label"
                    className={SELECT_TRIGGER_DARK_PANEL}
                  >
                    <SelectValue placeholder="Todos os assuntos" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" className={SELECT_CONTENT_DARK}>
                    <SelectItem value={FILTER_ALL} className={SELECT_ITEM_DARK}>
                      Todos os assuntos
                    </SelectItem>
                    {assuntos.map((a) => (
                      <SelectItem key={a} value={a} className={SELECT_ITEM_DARK}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            disabled={loading}
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
              'Iniciar simulado'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
