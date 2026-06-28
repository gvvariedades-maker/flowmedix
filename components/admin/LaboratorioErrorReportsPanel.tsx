'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';

import {
  ERROR_REPORT_CATEGORY_LABELS,
  ERROR_REPORT_PRIORITY_LABELS,
  ERROR_REPORT_STATUS_LABELS,
  formatErrorReportMetadataPreview,
  type ErrorReportListResponse,
  type ErrorReportRow,
  type ErrorReportSlugGroup,
  type ErrorReportSummaryResponse,
} from '@/lib/admin/errorReports';
import type {
  ErrorReportCategoryInput,
  ErrorReportPriorityInput,
  ErrorReportStatusInput,
} from '@/lib/validations';
import { cn } from '@/lib/utils';

type LaboratorioErrorReportsPanelProps = {
  onLoadQuestao?: (json: string, slug: string, report: ErrorReportRow) => void;
  disabled?: boolean;
};

const STATUS_OPTIONS: Array<{ value: '' | ErrorReportStatusInput; label: string }> = [
  { value: '', label: 'Todos os status' },
  { value: 'novo', label: 'Novos' },
  { value: 'triagem', label: 'Em triagem' },
  { value: 'resolvido', label: 'Resolvidos' },
  { value: 'descartado', label: 'Descartados' },
];

const CATEGORY_OPTIONS: Array<{ value: '' | ErrorReportCategoryInput; label: string }> = [
  { value: '', label: 'Todas categorias' },
  { value: 'slides', label: 'Slides' },
  { value: 'enunciado', label: 'Enunciado' },
  { value: 'alternativas', label: 'Alternativas' },
  { value: 'gabarito', label: 'Gabarito' },
  { value: 'navegacao', label: 'Navegação' },
  { value: 'outro', label: 'Outro' },
];

const PRIORITY_OPTIONS: Array<{ value: '' | ErrorReportPriorityInput; label: string }> = [
  { value: '', label: 'Todas prioridades' },
  { value: 'p0', label: 'P0' },
  { value: 'p1', label: 'P1' },
  { value: 'p2', label: 'P2' },
  { value: 'p3', label: 'P3' },
];

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function LaboratorioErrorReportsPanel({
  onLoadQuestao,
  disabled = false,
}: LaboratorioErrorReportsPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<ErrorReportListResponse | null>(null);
  const [summary, setSummary] = useState<ErrorReportSummaryResponse | null>(null);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const [status, setStatus] = useState<'' | ErrorReportStatusInput>('novo');
  const [category, setCategory] = useState<'' | ErrorReportCategoryInput>('');
  const [priority, setPriority] = useState<'' | ErrorReportPriorityInput>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const [draftStatus, setDraftStatus] = useState<ErrorReportStatusInput>('novo');
  const [draftPriority, setDraftPriority] = useState<ErrorReportPriorityInput>('p2');
  const [draftNotes, setDraftNotes] = useState('');

  const selectedGroup = useMemo(
    () => list?.groups?.find((g) => g.group_key === selectedGroupKey) ?? null,
    [list?.groups, selectedGroupKey],
  );

  const selectedReport = useMemo(() => {
    if (!selectedGroup) return null;
    if (selectedReportId) {
      return selectedGroup.reports.find((r) => r.id === selectedReportId) ?? selectedGroup.latest_report;
    }
    return selectedGroup.latest_report;
  }, [selectedGroup, selectedReportId]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/admin/error-reports/summary?limit=15', { credentials: 'same-origin' });
      const body = (await res.json()) as ErrorReportSummaryResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setSummary(body);
    } catch (err) {
      setSummary(null);
      setError(err instanceof Error ? err.message : 'Falha ao carregar resumo');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchList = useCallback(
    async (overrides?: { q?: string; status?: '' | ErrorReportStatusInput; page?: number }) => {
      setLoading(true);
      setError(null);
      const effectivePage = overrides?.page ?? page;
      const effectiveStatus = overrides?.status !== undefined ? overrides.status : status;
      const effectiveQ = overrides?.q !== undefined ? overrides.q : q;
      try {
        const params = new URLSearchParams({
          page: String(effectivePage),
          page_size: '15',
          group_by_slug: '1',
        });
        if (effectiveStatus) params.set('status', effectiveStatus);
        if (category) params.set('category', category);
        if (priority) params.set('priority', priority);
        if (effectiveQ.trim()) params.set('q', effectiveQ.trim());

        const res = await fetch(`/api/admin/error-reports?${params}`, { credentials: 'same-origin' });
        const body = (await res.json()) as ErrorReportListResponse & { error?: string };
        if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
        setList(body);
        const groups = body.groups ?? [];
        if (groups.length > 0) {
          const stillSelected = groups.some((g) => g.group_key === selectedGroupKey);
          if (!stillSelected) {
            const first = groups[0]!;
            setSelectedGroupKey(first.group_key);
            setSelectedReportId(first.latest_report.id);
          }
        } else {
          setSelectedGroupKey(null);
          setSelectedReportId(null);
        }
      } catch (err) {
        setList(null);
        setError(err instanceof Error ? err.message : 'Falha ao carregar reportes');
      } finally {
        setLoading(false);
      }
    },
    [page, status, category, priority, q, selectedGroupKey],
  );

  useEffect(() => {
    if (!open) return;
    void fetchSummary();
    void fetchList();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- carrega ao abrir

  useEffect(() => {
    if (!open) return;
    void fetchList();
  }, [page, status, category, priority]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedReport) return;
    setDraftStatus(selectedReport.status);
    setDraftPriority(selectedReport.priority);
    setDraftNotes(selectedReport.admin_notes ?? '');
  }, [selectedReport]);

  const handleSearch = () => {
    setPage(1);
    void fetchList({ page: 1 });
  };

  const filterBySlug = (slug: string) => {
    setQ(slug);
    setPage(1);
    setStatus('');
    void fetchList({ q: slug, status: '', page: 1 });
  };

  const handleSaveTriage = async () => {
    if (!selectedGroup || !selectedReport) return;
    const reportIds = selectedGroup.reports.map((r) => r.id);
    const savingKey = selectedGroup.group_key;
    setSavingId(savingKey);
    setError(null);
    try {
      const payload = {
        status: draftStatus,
        priority: draftPriority,
        admin_notes: draftNotes.trim() || undefined,
      };

      const res =
        reportIds.length > 1
          ? await fetch('/api/admin/error-reports/bulk', {
              method: 'PATCH',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ report_ids: reportIds, ...payload }),
            })
          : await fetch(`/api/admin/error-reports/${selectedReport.id}`, {
              method: 'PATCH',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);

      if (reportIds.length > 1) {
        const updated = (body.reports ?? []) as ErrorReportRow[];
        const byId = new Map(updated.map((r) => [r.id, r]));
        setList((prev) => {
          if (!prev?.groups) return prev;
          return {
            ...prev,
            groups: prev.groups.map((group) =>
              group.group_key === savingKey
                ? {
                    ...group,
                    reports: group.reports.map((r) => byId.get(r.id) ?? r),
                    latest_report: byId.get(group.latest_report.id) ?? group.latest_report,
                    open_count: group.reports.filter((r) => {
                      const next = byId.get(r.id) ?? r;
                      return next.status === 'novo' || next.status === 'triagem';
                    }).length,
                  }
                : group,
            ),
          };
        });
      } else {
        const updated = body.report as ErrorReportRow;
        setList((prev) => {
          if (!prev?.groups) return prev;
          return {
            ...prev,
            groups: prev.groups.map((group) =>
              group.group_key === savingKey
                ? {
                    ...group,
                    reports: group.reports.map((r) => (r.id === updated.id ? updated : r)),
                    latest_report:
                      group.latest_report.id === updated.id ? updated : group.latest_report,
                    open_count: group.reports.filter((r) => {
                      const row = r.id === updated.id ? updated : r;
                      return row.status === 'novo' || row.status === 'triagem';
                    }).length,
                  }
                : group,
            ),
          };
        });
      }

      void fetchSummary();
      void fetchList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar triagem');
    } finally {
      setSavingId(null);
    }
  };

  const selectGroup = (group: ErrorReportSlugGroup) => {
    setSelectedGroupKey(group.group_key);
    setSelectedReportId(group.latest_report.id);
  };

  const displayGroups = list?.groups ?? [];

  const handleLoadInLab = async (slug: string, report: ErrorReportRow) => {
    if (!onLoadQuestao) return;
    setLoadingSlug(slug);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/review-queue/${encodeURIComponent(slug)}?source=supabase`,
        { credentials: 'same-origin' },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      onLoadQuestao(JSON.stringify(body.questao, null, 2), slug, report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar questão');
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/90 to-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-900">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          Reportes de alunos
          {summary ? (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white tabular-nums">
              {summary.totals.open} abertos
            </span>
          ) : null}
        </span>
        <span className="text-[10px] font-bold text-rose-700">{open ? 'Recolher' : 'Expandir'}</span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-rose-200/80 px-4 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading || summaryLoading}
              onClick={() => {
                void fetchSummary();
                void fetchList();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase text-rose-800 hover:bg-rose-50 disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3 w-3', (loading || summaryLoading) && 'animate-spin')} />
              Atualizar
            </button>
            {summary ? (
              <span className="text-[10px] text-slate-600">
                {summary.totals.slides_open} report(s) de slides em aberto · lista agrupada por slug
              </span>
            ) : null}
          </div>

          {summary && summary.by_slug.length > 0 ? (
            <div className="rounded-xl border border-rose-100 bg-white/90 p-2.5">
              <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-rose-800">
                Slugs mais reportados (abertos)
              </p>
              <ul className="max-h-28 space-y-1 overflow-y-auto">
                {summary.by_slug.map((item) => (
                  <li key={item.modulo_slug}>
                    <button
                      type="button"
                      onClick={() => filterBySlug(item.modulo_slug)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-left hover:bg-rose-50"
                    >
                      <span className="truncate font-mono text-[10px] text-slate-800">{item.modulo_slug}</span>
                      <span className="shrink-0 text-[9px] font-bold text-rose-700 tabular-nums">
                        {item.open_count} aberto{item.open_count !== 1 ? 's' : ''}
                        {item.slide_reports > 0 ? ` · ${item.slide_reports} slide` : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as '' | ErrorReportStatusInput);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-800"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as '' | ErrorReportCategoryInput);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-800"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as '' | ErrorReportPriorityInput);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-800"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="col-span-2 flex gap-1 sm:col-span-1">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Slug ou texto…"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] text-slate-800"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-lg border border-slate-200 bg-white px-2 text-slate-700 hover:bg-slate-50"
                aria-label="Buscar"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {error ? (
            <p className="flex items-start gap-2 text-[10px] text-red-600" role="alert">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}

          <div className="grid min-h-[12rem] grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-white/90 p-2">
              {loading && !list ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : displayGroups.length === 0 ? (
                <p className="py-6 text-center text-[10px] text-slate-500">Nenhum report neste filtro.</p>
              ) : (
                displayGroups.map((group) => (
                  <button
                    key={group.group_key}
                    type="button"
                    onClick={() => selectGroup(group)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors',
                      selectedGroupKey === group.group_key
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate font-mono text-[10px] font-bold text-slate-900">
                          {group.modulo_slug ?? 'Sem slug'}
                        </span>
                        {group.count > 1 ? (
                          <span className="shrink-0 rounded-full bg-rose-600 px-1.5 py-0.5 text-[8px] font-bold text-white tabular-nums">
                            ×{group.count}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-[9px] text-slate-500">{formatWhen(group.latest_at)}</span>
                    </span>
                    <span className="text-[9px] text-slate-600">
                      {group.categories.map((c) => ERROR_REPORT_CATEGORY_LABELS[c]).join(', ')} ·{' '}
                      {group.open_count} aberto{group.open_count !== 1 ? 's' : ''} ·{' '}
                      {group.highest_priority.toUpperCase()}
                    </span>
                    <span className="line-clamp-2 text-[9px] text-slate-700">
                      {group.latest_report.description}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/90 p-3">
              {!selectedReport || !selectedGroup ? (
                <p className="py-8 text-center text-[10px] text-slate-500">Selecione um grupo para triar.</p>
              ) : (
                <div className="space-y-3">
                  {selectedGroup.count > 1 ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] text-amber-900">
                      <span className="font-bold">{selectedGroup.count} reportes</span> do mesmo slug foram
                      agrupados. A triagem abaixo aplica a <span className="font-bold">todos</span>.
                    </p>
                  ) : null}

                  {selectedGroup.count > 1 ? (
                    <div className="max-h-24 space-y-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        Reportes neste grupo
                      </p>
                      {selectedGroup.reports.map((report) => (
                        <button
                          key={report.id}
                          type="button"
                          onClick={() => setSelectedReportId(report.id)}
                          className={cn(
                            'block w-full rounded-md px-2 py-1 text-left text-[9px]',
                            selectedReportId === report.id
                              ? 'bg-white font-semibold text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:bg-white/80',
                          )}
                        >
                          <span className="text-slate-500">{formatWhen(report.created_at)}</span>
                          {' — '}
                          {ERROR_REPORT_CATEGORY_LABELS[report.category]}: {report.description.slice(0, 80)}
                          {report.description.length > 80 ? '…' : ''}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Descrição do aluno
                      {selectedGroup.count > 1 ? ' (selecionado)' : ''}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-800">{selectedReport.description}</p>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold">Contexto:</span>{' '}
                    {formatErrorReportMetadataPreview(selectedReport.metadata)}
                  </p>
                  {selectedReport.modulo_slug ? (
                    <div className="flex flex-wrap gap-2">
                      {onLoadQuestao ? (
                        <button
                          type="button"
                          disabled={disabled || loadingSlug === selectedReport.modulo_slug}
                          onClick={() =>
                            void handleLoadInLab(selectedReport.modulo_slug!, selectedReport)
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          {loadingSlug === selectedReport.modulo_slug ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : null}
                          Abrir no editor
                        </button>
                      ) : null}
                      <Link
                        href={`/estudar/${encodeURIComponent(selectedReport.modulo_slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-700 hover:bg-slate-50"
                      >
                        Player
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1">
                      <span className="text-[9px] font-bold uppercase text-slate-500">Status</span>
                      <select
                        value={draftStatus}
                        onChange={(e) => setDraftStatus(e.target.value as ErrorReportStatusInput)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
                      >
                        {(Object.keys(ERROR_REPORT_STATUS_LABELS) as ErrorReportStatusInput[]).map((key) => (
                          <option key={key} value={key}>
                            {ERROR_REPORT_STATUS_LABELS[key]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-[9px] font-bold uppercase text-slate-500">Prioridade</span>
                      <select
                        value={draftPriority}
                        onChange={(e) => setDraftPriority(e.target.value as ErrorReportPriorityInput)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
                      >
                        {(Object.keys(ERROR_REPORT_PRIORITY_LABELS) as ErrorReportPriorityInput[]).map((key) => (
                          <option key={key} value={key}>
                            {ERROR_REPORT_PRIORITY_LABELS[key]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-500">Notas internas</span>
                    <textarea
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      rows={3}
                      maxLength={5000}
                      className="w-full resize-y rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
                      placeholder="Triagem, causa, link para PR…"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={disabled || savingId === selectedGroup.group_key}
                    onClick={() => void handleSaveTriage()}
                    className="w-full rounded-lg bg-slate-900 py-2 text-[10px] font-bold uppercase text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {savingId === selectedGroup.group_key
                      ? 'Salvando…'
                      : selectedGroup.count > 1
                        ? `Salvar triagem (${selectedGroup.count} reportes)`
                        : 'Salvar triagem'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {list && list.pagination.total_pages > 1 ? (
            <nav className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold disabled:opacity-50"
              >
                <ChevronLeft className="h-3 w-3" />
                Anterior
              </button>
              <span className="text-[10px] text-slate-600 tabular-nums">
                Página {list.pagination.page} de {list.pagination.total_pages}
                {list.pagination.grouped
                  ? ` · ${list.pagination.total} grupo${list.pagination.total !== 1 ? 's' : ''}`
                  : null}
                {list.pagination.total_reports != null
                  ? ` (${list.pagination.total_reports} report${list.pagination.total_reports !== 1 ? 's' : ''})`
                  : list.pagination.total > 0
                    ? ` (${list.pagination.total} total)`
                    : ''}
              </span>
              <button
                type="button"
                disabled={page >= list.pagination.total_pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-3 w-3" />
              </button>
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
