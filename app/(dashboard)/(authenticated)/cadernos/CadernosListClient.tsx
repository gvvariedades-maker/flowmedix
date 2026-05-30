'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, BookOpen, Clock, Layers, X, Loader2, Trash2, Play, Pencil } from 'lucide-react';
import { CadernosEmptyState } from '@/components/dashboard/cadernos/CadernosEmptyState';
import { CadernosHeader } from '@/components/dashboard/cadernos/CadernosHeader';
import { Button } from '@/components/ui/button';
import { NeonBadge } from '@/components/ui/neon-badge';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import type { NotebookSummary } from './page';

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  return `Há ${dias} dias`;
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
        className="w-full max-w-md rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[#0d1117] p-6 shadow-2xl shadow-black/40"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-[1000] italic tracking-tighter text-white">Excluir caderno</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400 transition-colors hover:bg-white/[0.1] hover:text-slate-200"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <p className="mb-1 text-sm leading-relaxed text-slate-300">
          Tem certeza que deseja excluir{' '}
          <span className="font-bold text-white">&quot;{caderno.title}&quot;</span>?
        </p>
        <p className="mb-5 text-xs text-slate-400">
          Todas as questões deste caderno serão removidas. Esta ação não pode ser desfeita.
        </p>
        {error && <p className="mb-3 text-xs font-bold text-rose-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[rgba(255,255,255,0.15)] py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-white/[0.04]"
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

export default function CadernosListClient({ cadernos: inicial }: { cadernos: NotebookSummary[] }) {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const [cadernos, setCadernos] = useState(inicial);
  const [pendingDelete, setPendingDelete] = useState<NotebookSummary | null>(null);

  return (
    <div className={cn('min-h-screen bg-[#010409]', pageBottomPadding)}>
      <div className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.08)] bg-[#010409]/95 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md supports-[backdrop-filter]:bg-[#010409]/90">
        <CadernosHeader />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-10 md:pt-8">
        {cadernos.length === 0 ? (
          <CadernosEmptyState />
        ) : (
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
                      'flex flex-col gap-4 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-5 shadow-sm shadow-black/20',
                      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-300 ease-out',
                      'hover:scale-[1.01] hover:shadow-md hover:shadow-black/30 sm:flex-row sm:items-center sm:justify-between',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(0,242,255,0.20)] bg-[rgba(0,242,255,0.08)]">
                        <BookMarked size={22} className="text-cyan-300" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-black text-white">{c.title}</p>
                        {c.description && (
                          <p className="mt-0.5 truncate text-sm font-medium text-slate-400">{c.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {c.itemCount > 0 && (
                            <NeonBadge variant={c.studiedCount === c.itemCount && c.itemCount > 0 ? 'success' : 'brand'}>
                              <Layers className="mr-1 h-2.5 w-2.5" aria-hidden />
                              {c.studiedCount}/{c.itemCount}
                            </NeonBadge>
                          )}
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-400">
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
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-cyan-500 text-xs font-semibold text-white shadow-sm hover:bg-cyan-600"
                        >
                          <Link
                            href={`/estudar/${c.studyEntrySlug}?from=caderno&caderno_id=${c.id}`}
                            className="inline-flex items-center gap-1.5"
                          >
                            <Play className="h-3.5 w-3.5" aria-hidden />
                            Estudar caderno
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled
                          title="Adicione questões ao caderno para começar a estudar"
                          className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-white/[0.04] text-xs font-semibold text-slate-500"
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Estudar caderno
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        asChild
                        size="sm"
                        className="rounded-xl border-[rgba(255,255,255,0.15)] bg-transparent text-xs font-semibold text-white shadow-none hover:bg-white/[0.04]"
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
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.15)] bg-transparent text-slate-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                asChild
                className="rounded-2xl border-[rgba(255,255,255,0.15)] bg-transparent px-6 font-semibold text-slate-300 shadow-none transition-all duration-200 hover:scale-[1.02] hover:border-cyan-500/35 hover:bg-white/[0.04] hover:text-cyan-200"
              >
                <Link href="/estudar" className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden />
                  Ir para a Vitrine
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {pendingDelete && (
          <ConfirmExcluirModal
            caderno={pendingDelete}
            onClose={() => setPendingDelete(null)}
            onDeleted={() => {
              setCadernos(prev => prev.filter(x => x.id !== pendingDelete.id));
              setPendingDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
