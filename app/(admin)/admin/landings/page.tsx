'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Loader2, Plus, Pencil } from 'lucide-react';
import { lpPublicHref } from '@/lib/lp/shared';

type LpListRow = {
  id: string;
  path: string;
  internal_name: string;
  status: string;
  updated_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  ativo: 'Publicada',
  arquivado: 'Arquivada',
};

export default function AdminLandingsPage() {
  const [pages, setPages] = useState<LpListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/lp-pages', { credentials: 'same-origin' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao carregar');
      setPages(payload.pages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-black uppercase italic text-slate-500 hover:text-[#4F46E5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">
              Landings <span className="text-[#4F46E5]">de concurso</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Páginas de marketing reutilizáveis — funil AVANT Pro.
            </p>
          </div>
          <Link
            href="/admin/landings/nova"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase italic text-[#BEF264]"
          >
            <Plus className="h-4 w-4" />
            Nova LP
          </Link>
        </header>

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
          </div>
        ) : pages.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
            Nenhuma landing cadastrada.
          </p>
        ) : (
          <ul className="space-y-3">
            {pages.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border-2 border-slate-200 bg-white p-5"
              >
                <div>
                  <p className="font-black italic uppercase text-slate-900">{p.internal_name}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">{lpPublicHref(p.path)}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {STATUS_LABEL[p.status] ?? p.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.status === 'ativo' ? (
                    <a
                      href={lpPublicHref(p.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase italic"
                    >
                      Ver
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                  <Link
                    href={`/admin/landings/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#4F46E5] px-3 py-2 text-[10px] font-black uppercase italic text-white"
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
