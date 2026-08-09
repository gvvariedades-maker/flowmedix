'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, BookOpen, Clock, Layers, X, Loader2, Trash2, Play, Pencil, Plus } from 'lucide-react';
import { CadernosEmptyState } from '@/components/dashboard/cadernos/CadernosEmptyState';
import { CadernosHeader } from '@/components/dashboard/cadernos/CadernosHeader';
import { PacksProntosSection } from '@/components/dashboard/cadernos/PacksProntosSection';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import type { ResolvedPack } from '@/lib/cadernos/resolvePacks';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import type { NotebookSummary } from './page';

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  return `Há ${dias} dias`;
}

function ProgressRingCaderno({ studied, total }: { studied: number; total: number }) {
  const complete = studied === total && total > 0;
  const value = total > 0 ? (studied / total) * 100 : 0;
  const size = 52;
  const strokeWidth = 4;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`${studied} de ${total} questões concluídas`}
    >
      <ProgressRing
        value={value}
        size={size}
        strokeWidth={strokeWidth}
        variant={complete ? 'success' : 'brand'}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="text-sm font-bold tabular-nums leading-none text-slate-900">{studied}</span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500">/{total}</span>
      </div>
    </div>
  );
}

function ConfirmExcluirModal({
  caderno,
  onClose,
  onDeleted,
}: {
  caderno: NotebookSummary;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/notebooks/${caderno.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Não foi possível excluir.');
        return;
      }
      onDeleted();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card-elevated-lg w-full max-w-md p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Excluir caderno</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <p className="mb-1 text-sm leading-relaxed text-slate-600">
          Tem certeza que deseja excluir{' '}
          <span className="font-bold text-slate-900">&quot;{caderno.title}&quot;</span>?
        </p>
        <p className="mb-5 text-xs text-slate-500">
          Todas as questões deste caderno serão removidas. Esta ação não pode ser desfeita.
        </p>
        {error && <p className="mb-3 text-xs font-bold text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-editorial-outline flex-1 py-3"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-black text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} aria-hidden />}
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CadernosListClient({
  cadernos: inicial,
  editalBanca = null,
  packs = [],
}: {
  cadernos: NotebookSummary[];
  editalBanca?: string | null;
  packs?: ResolvedPack[];
}) {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const [cadernos, setCadernos] = useState(inicial);
  const [pendingDelete, setPendingDelete] = useState<NotebookSummary | null>(null);

  const hasPacks = packs.length > 0;
  const hasCadernos = cadernos.length > 0;
  const showEmptyState = !hasCadernos && !hasPacks;

  return (
    <div className={cn(DASHBOARD_PAGE_ROOT, 'bg-background', pageBottomPadding)}>
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <CadernosHeader />
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 md:px-10 md:pt-8">
        {hasPacks && <PacksProntosSection packs={packs} />}

        {showEmptyState ? (
          <CadernosEmptyState editalBanca={editalBanca} />
        ) : (
          <section aria-labelledby="meus-cadernos-heading" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="meus-cadernos-heading"
                  className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
                >
                  Meus cadernos
                </h2>
                {!hasCadernos && (
                  <p className="mt-1 text-sm text-slate-500">
                    Ainda não há cadernos seus — comece por um pack acima ou monte um guiado.
                  </p>
                )}
              </div>
              {hasPacks && (
                <Link
                  href="/cadernos/novo?wizard=1"
                  className="text-sm font-semibold text-slate-500 underline-offset-4 transition-colors hover:text-slate-800 hover:underline"
                >
                  Criar caderno guiado
                </Link>
              )}
            </div>

            {hasCadernos ? (
              <>
                <ul className="space-y-4">
                  {cadernos.map((c, i) => (
                    <motion.li
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 360, damping: 28 }}
                      className="list-none"
                    >
                      <div
                        className={cn(
                          'card-elevated flex flex-col gap-4 p-5 transition-all duration-300 ease-out',
                          'hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between',
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          {c.itemCount > 0 ? (
                            <ProgressRingCaderno studied={c.studiedCount} total={c.itemCount} />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(242, 101, 34,0.25)] bg-[rgba(242, 101, 34,0.10)]">
                              <BookMarked size={22} className="text-[#9A3412]" aria-hidden />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="truncate text-base font-bold text-slate-900">{c.title}</p>
                              {c.source_pack_id && (
                                <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                  Pronto
                                </span>
                              )}
                            </div>
                            {c.description && (
                              <p className="mt-0.5 truncate text-sm font-medium text-slate-500">{c.description}</p>
                            )}
                            {c.studyEntryTitle && c.itemCount > 0 && (
                              <p className="mt-1 truncate text-xs font-semibold text-[#9A3412]">
                                Próxima
                                {c.studyEntryPosition != null ? ` (${c.studyEntryPosition}/${c.itemCount})` : ''}:{' '}
                                {c.studyEntryTitle}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                                <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {c.itemCount} {c.itemCount === 1 ? 'questão' : 'questões'}
                              </span>
                              <span className="flex items-center gap-1 text-sm font-semibold text-slate-400">
                                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {tempoRelativo(c.updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
                          {c.studyEntrySlug ? (
                            <Link
                              href={`/estudar/${c.studyEntrySlug}?from=caderno&caderno_id=${c.id}`}
                              className="btn-editorial-primary inline-flex min-h-9 items-center justify-center gap-1.5 px-4 text-xs font-bold"
                            >
                              <Play className="h-3.5 w-3.5" aria-hidden />
                              Estudar caderno
                            </Link>
                          ) : (
                            <Link
                              href={`/cadernos/${c.id}?setup=1`}
                              className="btn-editorial-primary inline-flex min-h-9 items-center justify-center gap-1.5 px-4 text-xs font-bold"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden />
                              Adicionar questões
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            asChild
                            size="sm"
                            className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 shadow-none hover:border-[rgba(242, 101, 34,0.35)] hover:bg-[rgba(242, 101, 34,0.06)] hover:text-[#9A3412]"
                          >
                            <Link href={`/cadernos/${c.id}`} className="inline-flex items-center gap-1.5">
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                              Editar caderno
                            </Link>
                          </Button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(c)}
                            title="Excluir caderno"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} aria-hidden />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    asChild
                    className="btn-editorial-outline rounded-2xl px-6 font-semibold"
                  >
                    <Link href="/estudar" className="inline-flex items-center gap-2">
                      <BookOpen className="h-4 w-4" aria-hidden />
                      Ir para a Vitrine
                    </Link>
                  </Button>
                </div>
              </>
            ) : null}
          </section>
        )}
      </div>

      <AnimatePresence>
        {pendingDelete && (
          <ConfirmExcluirModal
            caderno={pendingDelete}
            onClose={() => setPendingDelete(null)}
            onDeleted={() => {
              setCadernos((prev) => prev.filter((x) => x.id !== pendingDelete.id));
              setPendingDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
