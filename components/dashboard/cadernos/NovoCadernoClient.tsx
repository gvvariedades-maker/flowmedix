'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Library, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';

/**
 * Página (fluxo) de criação de caderno — mesmo vocabulário visual da lista: fundo claro, cartão elevado, CTA azul.
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

  return (
    <div className="min-h-screen bg-slate-50/90 pb-safe">
      <header className="border-b border-slate-200/80 bg-white/80 shadow-sm shadow-slate-200/30 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-10">
          <Button
            type="button"
            variant="ghost"
            asChild
            className="mb-2 -ml-2 h-auto gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-800"
          >
            <Link href="/cadernos">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Cadernos de Estudo
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo caderno</h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">Dê um nome e, se quiser, uma descrição</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-10">
        <div
          className="relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-200/90 bg-slate-100/40 p-6 sm:p-10 md:p-12"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184/0.22)_1px,transparent_0)] [background-size:20px_20px] opacity-90"
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-100/35 blur-3xl" aria-hidden />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative mx-auto max-w-lg"
          >
            <Card className="border-slate-200/90 bg-white shadow-md shadow-slate-200/40">
              <CardHeader className="border-b border-slate-100/80 pb-4">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100/80"
                    aria-hidden
                  >
                    <Library className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-800">Dados do caderno</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Depois você adiciona questões da vitrine.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <label htmlFor="caderno-nome" className="text-sm font-medium text-slate-700">
                    Nome <span className="text-rose-600">*</span>
                  </label>
                  <Input
                    id="caderno-nome"
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && void handleCreate()}
                    placeholder="Ex: Fisiologia humana"
                    className="h-12 rounded-lg border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="caderno-desc" className="text-sm font-medium text-slate-700">
                    Descrição <span className="font-normal text-slate-400">(opcional)</span>
                  </label>
                  <Input
                    id="caderno-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Questões de enfermagem — EBSERH"
                    className="h-12 rounded-lg border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200/50"
                  />
                </div>
                {error && (
                  <p className="text-sm font-medium text-rose-600" role="alert">
                    {error}
                  </p>
                )}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="h-12 rounded-lg border-slate-200"
                  >
                    <Link href="/cadernos">Cancelar</Link>
                  </Button>
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => void handleCreate()}
                    className={cn(
                      'inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-8 text-sm font-semibold text-white shadow-md',
                      'transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg',
                      'disabled:translate-y-0 disabled:opacity-60',
                    )}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    )}
                    Criar caderno
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
