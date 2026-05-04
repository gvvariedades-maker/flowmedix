'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookMarked, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';

/**
 * Página de criação de caderno — alinhada ao design system dark do dashboard.
 */
export default function NovoCadernoClient() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Digite um nome para o caderno.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === 'string' ? json.error : 'Erro ao criar caderno.');
        return;
      }
      router.push(`/cadernos/${json.notebook.id}`);
    } finally {
      setLoading(false);
    }
  };

  const inputDark =
    'h-12 rounded-xl border border-white/10 bg-white/[0.05] text-white shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/30 focus-visible:ring-offset-0';

  return (
    <div className="min-h-screen pb-24 pb-safe" style={{ backgroundColor: '#010409' }}>
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#010409]/95 backdrop-blur-md">
        <header className="bg-transparent">
          <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-10">
            <Link
              href="/cadernos"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Cadernos de Estudo
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-white">Novo caderno</h1>
            <p className="mt-1.5 text-sm text-slate-400">Dê um nome e, se quiser, uma descrição</p>
          </div>
        </header>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-10 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative mx-auto max-w-lg"
        >
          <div
            className="rounded-[2rem] border p-6 sm:p-10 shadow-xl sm:p-12"
            style={{
              backgroundColor: '#0d1117',
              borderColor: 'rgba(255, 255, 255, 0.10)',
            }}
          >
            <div className="flex items-start gap-4 border-b pb-5" style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}>
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(0, 242, 255, 0.10)' }}
                aria-hidden
              >
                <BookMarked className="h-7 w-7" strokeWidth={1.5} style={{ color: '#00f2ff' }} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Dados do caderno</h2>
                <p className="mt-1 text-sm text-slate-400">Depois você adiciona questões da vitrine.</p>
              </div>
            </div>

            <div className="space-y-5 pt-6">
              <div className="space-y-2">
                <label htmlFor="caderno-nome" className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Nome <span className="text-red-400">*</span>
                </label>
                <Input
                  id="caderno-nome"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && void handleCreate()}
                  placeholder="Ex: Fisiologia humana"
                  className={cn(inputDark)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="caderno-desc" className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Descrição <span className="font-normal normal-case tracking-normal text-slate-500">(opcional)</span>
                </label>
                <Input
                  id="caderno-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Questões de enfermagem — EBSERH"
                  className={cn(inputDark)}
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-red-400" role="alert">
                  {error}
                </p>
              )}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  asChild
                  className="h-12 rounded-xl bg-white/[0.08] text-slate-300 hover:bg-white/[0.12] hover:text-slate-200"
                >
                  <Link href="/cadernos">Cancelar</Link>
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleCreate()}
                  className={cn(
                    'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg',
                    'transition-all duration-200 hover:bg-indigo-500',
                    'disabled:opacity-60',
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      Criando…
                    </>
                  ) : (
                    '+ Criar caderno'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
