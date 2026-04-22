'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, BookOpen, Clock, Layers, X, Loader2, Trash2, Play, Pencil } from 'lucide-react';
import { CadernosEmptyState } from '@/components/dashboard/cadernos/CadernosEmptyState';
import { CadernosHeader } from '@/components/dashboard/cadernos/CadernosHeader';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-[1000] italic tracking-tighter text-slate-900">Excluir caderno</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-1">
          Tem certeza que deseja excluir <span className="font-bold text-slate-900">&quot;{caderno.title}&quot;</span>?
        </p>
        <p className="text-xs text-slate-400 mb-5">
          Todas as questões deste caderno serão removidas. Esta ação não pode ser desfeita.
        </p>
        {error && <p className="text-xs text-rose-500 font-bold mb-3">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-black text-sm hover:bg-rose-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CadernosListClient({ cadernos: inicial }: { cadernos: NotebookSummary[] }) {
  const [cadernos, setCadernos] = useState(inicial);
  const [pendingDelete, setPendingDelete] = useState<NotebookSummary | null>(null);

  return (
    <div className="min-h-screen bg-slate-50/90 pb-safe">
      <CadernosHeader />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-10">
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
                      'flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm',
                      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75)] transition-all duration-300 ease-out',
                      'hover:scale-[1.01] hover:shadow-md hover:shadow-slate-300/30 sm:flex-row sm:items-center sm:justify-between',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100/80">
                        <BookMarked size={22} className="text-sky-600" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-slate-900">{c.title}</p>
                        {c.description && (
                          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{c.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {c.itemCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50/90 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                              <Layers className="h-2.5 w-2.5" aria-hidden />
                              {c.studiedCount}/{c.itemCount}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <Layers size={10} aria-hidden />
                            {c.itemCount} {c.itemCount === 1 ? 'questão' : 'questões'}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <Clock size={10} aria-hidden />
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
                          className="rounded-xl bg-sky-600 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
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
                          className="rounded-xl text-xs font-semibold"
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Estudar caderno
                        </Button>
                      )}
                      <Button variant="outline" asChild size="sm" className="rounded-xl border-slate-200 text-xs font-semibold">
                        <Link href={`/cadernos/${c.id}`} className="inline-flex items-center gap-1.5">
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Editar caderno
                        </Link>
                      </Button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(c)}
                        title="Excluir caderno"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
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
                className="rounded-2xl border-slate-200 bg-white px-6 font-semibold text-slate-600 transition-all duration-200 hover:scale-[1.02] hover:border-sky-200 hover:text-sky-800"
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
