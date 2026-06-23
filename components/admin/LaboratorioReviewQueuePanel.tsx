'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ChevronRight, ClipboardList, Loader2, RefreshCw } from 'lucide-react';

import type { ReviewQueueItem, ReviewQueueResult } from '@/lib/admin/reviewQueue';

type LaboratorioReviewQueuePanelProps = {
  onLoadQuestao: (json: string, item: ReviewQueueItem, issues: string[]) => void;
  disabled?: boolean;
};

export function LaboratorioReviewQueuePanel({
  onLoadQuestao,
  disabled = false,
}: LaboratorioReviewQueuePanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'ai-report'>('ai-report');
  const [subtopico, setSubtopico] = useState('');
  const [lote, setLote] = useState('imunizacao-lote-01');
  const [queue, setQueue] = useState<ReviewQueueResult | null>(null);
  const [availableLotes, setAvailableLotes] = useState<string[]>([]);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        source,
        limit: '30',
        offset: '0',
      });
      if (subtopico.trim()) params.set('subtopico', subtopico.trim());
      if (source === 'ai-report' && lote.trim()) params.set('lote', lote.trim());

      const res = await fetch(`/api/admin/review-queue?${params}`, { credentials: 'same-origin' });
      const body = await res.json();
      if (!res.ok) {
        if (Array.isArray(body.available_lotes)) {
          setAvailableLotes(body.available_lotes);
        }
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setQueue(body as ReviewQueueResult);
      if (body.lote) setLote(body.lote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar fila');
      setQueue(null);
    } finally {
      setLoading(false);
    }
  }, [source, subtopico, lote]);

  useEffect(() => {
    if (open && !queue && !loading) {
      void fetchQueue();
    }
  }, [open, queue, loading, fetchQueue]);

  const handleLoad = async (item: ReviewQueueItem) => {
    setLoadingSlug(item.modulo_slug);
    setError(null);
    try {
      const params = new URLSearchParams({ source: item.source });
      if (item.source === 'ai-report' && lote.trim()) {
        params.set('lote', lote.trim());
      }
      const res = await fetch(
        `/api/admin/review-queue/${encodeURIComponent(item.modulo_slug)}?${params}`,
        { credentials: 'same-origin' },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);

      const issues =
        item.source === 'ai-report' && Array.isArray(body.issues)
          ? body.issues
          : item.issues;

      onLoadQuestao(JSON.stringify(body.questao, null, 2), item, issues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar questão');
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/90 to-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-900">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          Fila de Revisão Premium
          {queue && (
            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[9px] font-bold text-amber-900">
              {queue.total_pending} pendentes
            </span>
          )}
        </span>
        <ChevronRight
          className={`h-4 w-4 text-amber-700 transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-amber-100 px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-2">
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value as 'supabase' | 'ai-report');
                setQueue(null);
              }}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            >
              <option value="ai-report">Relatório IA (local)</option>
              <option value="supabase">Catálogo Supabase</option>
            </select>
            {source === 'ai-report' ? (
              <input
                type="text"
                placeholder="Lote (ex: imunizacao-lote-01)"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                list="avant-ai-lotes"
                className="min-w-[180px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              />
            ) : (
              <input
                type="text"
                placeholder="Filtrar subtópico"
                value={subtopico}
                onChange={(e) => setSubtopico(e.target.value)}
                className="min-w-[140px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              />
            )}
            <button
              type="button"
              onClick={() => void fetchQueue()}
              disabled={loading || disabled}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-3 w-3" aria-hidden />
              )}
              Atualizar
            </button>
          </div>

          {availableLotes.length > 0 && (
            <datalist id="avant-ai-lotes">
              {availableLotes.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          )}

          {error && (
            <p className="flex items-start gap-2 text-[10px] text-red-600" role="alert">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          {queue && queue.items.length === 0 && !loading && (
            <p className="text-[10px] text-slate-500">Nenhuma pendência nesta fila.</p>
          )}

          <ul className="max-h-48 space-y-1.5 overflow-y-auto">
            {queue?.items.map((item) => (
              <li key={item.modulo_slug}>
                <button
                  type="button"
                  disabled={disabled || loadingSlug === item.modulo_slug}
                  onClick={() => void handleLoad(item)}
                  className="flex w-full flex-col gap-0.5 rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-left hover:border-amber-300 hover:bg-amber-50/50 disabled:opacity-50"
                >
                  <span className="truncate text-[10px] font-bold text-slate-800">
                    {item.modulo_slug}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {item.subtopico ?? item.titulo_aula ?? '—'}
                    {item.banca ? ` · ${item.banca}` : ''}
                    {item.ai_score != null ? ` · score ${item.ai_score}` : ''}
                    {` · ${item.issue_count} pendência(s)`}
                  </span>
                  {item.issues[0] && (
                    <span className="line-clamp-1 text-[9px] text-amber-800">{item.issues[0]}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <p className="text-[10px] text-slate-500">
            Clique em uma questão para carregar no editor. Corrija, publique e volte para a próxima.
          </p>
        </div>
      ) : null}
    </div>
  );
}
