'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkPlus, Database, Info, Loader2, SearchX, Trash2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { PageHeader } from '@/components/ui/page-header';
import { SimuladosBackLink } from '@/components/simulados/SimuladosBackLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { MultiCheckboxFilter } from '@/components/ui/MultiCheckboxFilter';
import {
  createSimuladoSession,
  createSimuladoTemplate,
  deleteSimuladoTemplate,
  getSimuladoPoolCount,
  getOpenSimuladoSession,
  listSimuladoTemplates,
  SimuladoApiError,
} from '@/lib/simulado/client';
import { SimuladoCreateSessionSchema, SimuladoTemplateCreateSchema } from '@/lib/validations';
import type { ZodIssue } from 'zod';
import type { VitrineFacets } from '@/lib/vitrine/types';
import { cn } from '@/lib/utils';
import type {
  SimuladoOpenSessionResponse,
  SimuladoModo,
  SimuladoTemplateSummary,
} from '@/lib/simulado/types';
import type { RitmoMetaOption } from '@/lib/simulado/provaMeta';
import { buildDefaultTitulo, formatRitmoMetaLabel, sessionDisplayTitulo } from '@/lib/simulado/provaMeta';
import {
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
} from '@/lib/freemium/constants';
import { PaywallModal } from '@/components/freemium/PaywallModal';
import { MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM } from '@/lib/layout/mobileBottomNav';

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
  const [titulo, setTitulo] = useState('');
  const [ritmoMeta, setRitmoMeta] = useState<RitmoMetaOption>('3min');
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
  const [templates, setTemplates] = useState<SimuladoTemplateSummary[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateActionId, setTemplateActionId] = useState<string | null>(null);
  const [templateMessage, setTemplateMessage] = useState<string | null>(null);

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
    async function loadTemplates() {
      setTemplatesLoading(true);
      try {
        const response = await listSimuladoTemplates();
        if (!cancelled) setTemplates(response.templates);
      } catch {
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    }
    void loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

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
  const qNum = Math.min(100, Math.max(1, parseInt(quantidade, 10) || 20));

  const tituloAutoPreview = useMemo(
    () =>
      buildDefaultTitulo({
        bancas: bancasSelecionadas,
        assuntos: assuntosSelecionados,
        quantidade: qNum,
        modo,
      }),
    [assuntosSelecionados, bancasSelecionadas, modo, qNum],
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

  const applyTemplateToForm = (template: SimuladoTemplateSummary) => {
    setModo(template.modo);
    setQuantidade(String(template.quantidade));
    setTitulo(template.titulo);
    setRitmoMeta(template.ritmo_meta);
    const filtros = template.filtros ?? {};
    setBancasSelecionadas(
      Array.isArray(filtros.bancas)
        ? filtros.bancas.filter((item): item is string => typeof item === 'string')
        : [],
    );
    setAssuntosSelecionados(
      Array.isArray(filtros.assuntos)
        ? filtros.assuntos.filter((item): item is string => typeof item === 'string')
        : [],
    );
    setQ(typeof filtros.q === 'string' ? filtros.q : '');
    setError(null);
    setNoQuestions(false);
    setTemplateMessage(null);
  };

  const handleSaveTemplate = async () => {
    setTemplateMessage(null);
    setSavingTemplate(true);

    const tituloSalvar =
      (modo === 'prova' ? titulo.trim() : '') || tituloAutoPreview;

    const parsed = SimuladoTemplateCreateSchema.safeParse({
      titulo: tituloSalvar,
      modo,
      quantidade: qNum,
      ...(modo === 'prova' ? { ritmo_meta: ritmoMeta } : {}),
      ...(bancasSelecionadas.length ? { bancas: bancasSelecionadas } : {}),
      ...(assuntosSelecionados.length ? { assuntos: assuntosSelecionados } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
    });

    if (!parsed.success) {
      setTemplateMessage(formatZodIssues(parsed.error.issues));
      setSavingTemplate(false);
      return;
    }

    try {
      const result = await createSimuladoTemplate(parsed.data);
      setTemplates((current) => [result.template, ...current.filter((t) => t.id !== result.template.id)]);
      setTemplateMessage('Configuração salva com sucesso.');
    } catch (err) {
      setTemplateMessage(
        err instanceof SimuladoApiError
          ? err.message
          : 'Não foi possível salvar a configuração.',
      );
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setTemplateActionId(templateId);
    setTemplateMessage(null);
    try {
      await deleteSimuladoTemplate(templateId);
      setTemplates((current) => current.filter((t) => t.id !== templateId));
    } catch (err) {
      setTemplateMessage(
        err instanceof SimuladoApiError
          ? err.message
          : 'Não foi possível excluir o simulado salvo.',
      );
    } finally {
      setTemplateActionId(null);
    }
  };

  const startFromTemplate = async (template: SimuladoTemplateSummary) => {
    if (simuladoFreeLimitReached) {
      setPaywallOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setNoQuestions(false);
    setTemplateMessage(null);

    try {
      const result = await createSimuladoSession({
        template_id: template.id,
        forcar_novo: true,
      });
      router.push(`/simulados/${result.session.id}`);
    } catch (err) {
      if (err instanceof SimuladoApiError) {
        if (err.status === 404) {
          setNoQuestions(true);
          setError(null);
        } else {
          setError(err.message);
        }
      } else {
        setError('Não foi possível iniciar o simulado salvo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (opts?: { forcarNovo?: boolean }) => {
    setLoading(true);
    setError(null);
    setNoQuestions(false);

    const parsed = SimuladoCreateSessionSchema.safeParse({
      quantidade,
      modo,
      ...(modo === 'prova' && titulo.trim() ? { titulo: titulo.trim() } : {}),
      ...(modo === 'prova' ? { ritmo_meta: ritmoMeta } : {}),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (simuladoFreeLimitReached) {
      setPaywallOpen(true);
      return;
    }
    await startSession(openSession ? { forcarNovo: true } : undefined);
  };

  const bump = (delta: number) =>
    setQuantidade(String(Math.min(100, Math.max(1, qNum + delta))));

  const submitButton =
    simuladoFreeLimitReached ? (
      <Button
        type="button"
        disabled={loading}
        onClick={() => setPaywallOpen(true)}
        className="h-12 w-full rounded-2xl border border-amber-400/40 bg-amber-400/15 text-base font-semibold text-amber-200 hover:bg-amber-400/25"
      >
        Limite diário atingido — ver AVANT Pro
      </Button>
    ) : (
      <Button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full rounded-2xl border border-cyan-500/40 bg-cyan-500/15 text-base font-semibold text-cyan-300 hover:bg-cyan-500/25"
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
    );

  return (
    <div className="bg-[#010409] px-4 pt-6 sm:px-6 lg:px-8 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <SimuladosBackLink className="mb-3" />
        <PageHeader
          title="Novo simulado"
          description="Monte um simulado com questões do seu catálogo. Corrija questão a questão e revise o resultado ao final."
          descriptionClassName="text-sm text-slate-400 mt-1 max-w-xl"
          titleClassName="text-[22px] font-bold tracking-tight text-white"
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
            <div className="space-y-4 rounded-2xl border border-[#00f2ff]/20 bg-gradient-to-b from-[#00f2ff]/[0.06] to-transparent p-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00f2ff]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f2ff] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00f2ff]" />
                  </span>
                  Em andamento
                </span>
                <p className="text-sm font-semibold text-white">
                  {openSession.titulo?.trim() ||
                    (openSession.modo === 'prova' ? 'Prova' : 'Simulado · Treino')}
                </p>
                <p className="text-sm text-slate-200">
                  {openSession.modo === 'treino' ? 'Treino' : 'Prova'} · {openSession.total_questoes}{' '}
                  questões
                </p>
                <p className="sr-only">
                  Você tem um simulado em andamento ({openSession.modo}) com {openSession.total_questoes}{' '}
                  questões.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => router.push(`/simulados/${openSession.id}`)}
                  className="h-11 w-full rounded-xl bg-[#00f2ff] font-semibold text-[#010409] hover:bg-[#00f2ff]/90"
                >
                  Continuar simulado
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <Info size={14} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
            <p className="text-xs leading-relaxed text-slate-500">
              Filtros opcionais refinam o pool. Sem filtros, o simulado usa questões acessíveis no seu
              plano.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p id="simulado-modo-label" className="text-sm font-medium text-slate-200">
              Modo do simulado
            </p>
            <div
              role="radiogroup"
              aria-labelledby="simulado-modo-label"
              className="grid gap-3 sm:grid-cols-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={modo === 'treino'}
                onClick={() => setModo('treino')}
                className={cn(
                  'rounded-xl p-4 text-left',
                  modo === 'treino'
                    ? 'border-2 border-[#00f2ff] bg-[#00f2ff]/[0.08]'
                    : 'border border-white/[0.08] bg-white/[0.03] hover:border-white/20',
                )}
              >
                <span
                  className={cn(
                    'block text-sm',
                    modo === 'treino' ? 'font-bold text-[#00f2ff]' : 'font-semibold text-slate-300',
                  )}
                >
                  Treino
                </span>
                <span
                  className={cn(
                    'mt-1 block text-xs',
                    modo === 'treino' ? 'text-slate-300' : 'text-slate-500',
                  )}
                >
                  Feedback imediato com gabarito por questão.
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={modo === 'prova'}
                onClick={() => setModo('prova')}
                className={cn(
                  'rounded-xl p-4 text-left',
                  modo === 'prova'
                    ? 'border-2 border-[#00f2ff] bg-[#00f2ff]/[0.08]'
                    : 'border border-white/[0.08] bg-white/[0.03] hover:border-white/20',
                )}
              >
                <span
                  className={cn(
                    'block text-sm',
                    modo === 'prova' ? 'font-bold text-[#00f2ff]' : 'font-semibold text-slate-300',
                  )}
                >
                  Prova
                </span>
                <span
                  className={cn(
                    'mt-1 block text-xs',
                    modo === 'prova' ? 'text-slate-300' : 'text-slate-500',
                  )}
                >
                  Gabarito liberado apenas no resumo final.
                </span>
              </button>
            </div>
          </div>

          {modo === 'prova' ? (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="space-y-2">
                <label htmlFor="simulado-titulo" className="text-sm font-medium text-slate-200">
                  Nome do simulado
                </label>
                <Input
                  id="simulado-titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={loading}
                  maxLength={120}
                  placeholder={tituloAutoPreview}
                  className="h-11 rounded-xl border-white/15 bg-[#0d1117] text-slate-100"
                />
                <p className="text-xs text-slate-500">
                  Deixe em branco para usar: <span className="text-slate-400">{tituloAutoPreview}</span>
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="simulado-ritmo" className="text-sm font-medium text-slate-200">
                  Ritmo sugerido
                </label>
                <select
                  id="simulado-ritmo"
                  value={ritmoMeta}
                  onChange={(e) => setRitmoMeta(e.target.value as RitmoMetaOption)}
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-white/15 bg-[#0d1117] px-3 text-sm text-slate-100"
                >
                  <option value="3min">3 min/questão (padrão)</option>
                  <option value="2min">2 min/questão</option>
                  <option value="none">Sem meta</option>
                </select>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <span id="simulado-quantidade-label" className="text-sm font-medium text-slate-300">
              Quantidade de questões
            </span>
            <div
              role="group"
              aria-labelledby="simulado-quantidade-label"
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => bump(-5)}
                disabled={loading || qNum <= 1}
                aria-label="Diminuir quantidade"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#0d1117] text-lg font-medium text-slate-200 transition-colors hover:border-white/25 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-[2.5rem] text-center text-lg font-semibold tabular-nums text-slate-100">
                {qNum}
              </span>
              <button
                type="button"
                onClick={() => bump(5)}
                disabled={loading || qNum >= 100}
                aria-label="Aumentar quantidade"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#0d1117] text-lg font-medium text-slate-200 transition-colors hover:border-white/25 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="text-xs text-slate-500">Entre 1 e 100 questões (padrão: 20)</p>
          </div>

          {poolLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              Estimando pool de questões...
            </div>
          ) : poolCount !== null ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#00ff88]/20 bg-[#00ff88]/[0.06] px-4 py-3">
              <Database size={16} className="mt-0.5 shrink-0 text-[#00ff88]" aria-hidden />
              <div>
                <p className="text-sm font-bold tabular-nums text-[#00ff88]">
                  ~{poolCount.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-400">questões disponíveis com os filtros atuais</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-slate-500">
              Não foi possível estimar o pool com os filtros atuais.
            </div>
          )}

          {poolCount !== null && qNum > poolCount && !poolLoading && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Você pediu {qNum} questões, mas o pool estimado tem ~
              {poolCount.toLocaleString('pt-BR')}. Reduza a quantidade ou amplie os filtros.
            </div>
          )}

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
              className={cn(
                'h-11 rounded-xl border-white/15 bg-[#0d1117] text-slate-100 md:scroll-mb-0',
                MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM,
              )}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          {templateMessage && (
            <p
              className={cn(
                'text-sm',
                templateMessage.includes('sucesso') ? 'text-emerald-400' : 'text-rose-400',
              )}
              role="status"
              aria-live="polite"
            >
              {templateMessage}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={loading || savingTemplate}
              onClick={() => void handleSaveTemplate()}
              className="h-11 rounded-xl border-white/15 bg-transparent text-slate-200 hover:bg-white/5"
            >
              {savingTemplate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Salvando…
                </>
              ) : (
                <>
                  <BookmarkPlus className="mr-2 h-4 w-4" aria-hidden />
                  Salvar esta configuração
                </>
              )}
            </Button>
          </div>

          {noQuestions && (
            <EmptyState
              icon={SearchX}
              title="Nenhuma questão encontrada"
              description="Não há questões acessíveis com os filtros atuais. Amplie a busca ou remova filtros."
              action={{ label: 'Limpar filtros', onClick: clearFilters }}
              className="py-10"
            />
          )}

          <div className="pt-2">{submitButton}</div>
        </form>

        <section
          aria-labelledby="simulados-salvos-titulo"
          className="glass-panel mt-8 space-y-4 border border-white/10 p-6 sm:p-8"
        >
          <div className="space-y-1">
            <h2
              id="simulados-salvos-titulo"
              className="text-lg font-semibold tracking-tight text-white"
            >
              Meus simulados salvos
            </h2>
            <p className="text-sm text-slate-400">
              Reutilize configurações com um clique — ideal para provas recorrentes.
            </p>
          </div>

          {templatesLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Carregando simulados salvos…
            </div>
          ) : templates.length === 0 ? (
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center text-sm text-slate-500">
              Nenhuma configuração salva ainda. Ajuste os filtros acima e use &quot;Salvar esta
              configuração&quot;.
            </p>
          ) : (
            <ul className="space-y-3">
              {templates.map((template) => {
                const filtros = template.filtros ?? {};
                const bancasCount = Array.isArray(filtros.bancas) ? filtros.bancas.length : 0;
                const assuntosCount = Array.isArray(filtros.assuntos) ? filtros.assuntos.length : 0;
                const resumoFiltros = [
                  bancasCount === 1
                    ? String((filtros.bancas as string[])[0])
                    : bancasCount > 1
                      ? `${bancasCount} bancas`
                      : null,
                  assuntosCount === 1
                    ? String((filtros.assuntos as string[])[0])
                    : assuntosCount > 1
                      ? `${assuntosCount} assuntos`
                      : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <li
                    key={template.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-semibold text-slate-100">
                          {sessionDisplayTitulo(template.titulo, template.modo)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {template.modo === 'prova' ? 'Prova' : 'Treino'} · {template.quantidade}{' '}
                          questões
                          {template.modo === 'prova'
                            ? ` · ${formatRitmoMetaLabel(template.ritmo_meta_segundos_por_questao)}`
                            : ''}
                        </p>
                        {resumoFiltros ? (
                          <p className="truncate text-xs text-slate-500">{resumoFiltros}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={loading || templateActionId === template.id}
                          onClick={() => void startFromTemplate(template)}
                          className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                        >
                          Iniciar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={loading || templateActionId === template.id}
                          onClick={() => applyTemplateToForm(template)}
                          className="rounded-lg border-white/15 bg-transparent text-slate-300 hover:bg-white/5"
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={loading || templateActionId === template.id}
                          onClick={() => void handleDeleteTemplate(template.id)}
                          aria-label={`Excluir ${template.titulo}`}
                          className="rounded-lg border-white/15 bg-transparent text-slate-400 hover:border-rose-500/30 hover:text-rose-300"
                        >
                          {templateActionId === template.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          )}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
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
