'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookMarked, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { requestNotebookActivationRefresh } from '@/lib/cadernos/notebookActivationBridge';
import {
  buildNotebookTitleSuggestions,
  buildQuickAddPreset,
  persistWizardPreset,
  pickWizardBatchModulos,
  type ModuloTemplateRow,
  type NotebookEditalContext,
  type QuickAddPreset,
} from '@/lib/cadernos/templates';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';

export type NovoCadernoContext = {
  wizard: boolean;
  edital: NotebookEditalContext;
  modulos: ModuloTemplateRow[];
};

const inputDark =
  'h-12 rounded-xl border border-white/10 bg-white/[0.05] text-white shadow-none placeholder:text-slate-500 focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/30 focus-visible:ring-offset-0';

const ctaPrimary =
  'inline-flex min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl border-0 bg-cyan-500 px-8 text-sm font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-cyan-950/40 transition-colors hover:bg-cyan-400 disabled:pointer-events-none disabled:opacity-60';

function WizardProgress({ step }: { step: 1 | 2 }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>{step} de 2</span>
        <span>{step === 1 ? 'Nome do caderno' : 'Montar conteúdo'}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-cyan-500"
          initial={false}
          animate={{ width: step === 1 ? '50%' : '100%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function LegacyNovoCadernoForm() {
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mx-auto max-w-lg"
    >
      <div
        className="rounded-[2rem] border p-6 shadow-xl sm:p-10"
        style={{ backgroundColor: '#0d1117', borderColor: 'rgba(255, 255, 255, 0.10)' }}
      >
        <div
          className="flex items-start gap-4 border-b pb-5"
          style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}
        >
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
          {error ? (
            <p className="text-sm font-medium text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              asChild
              className="h-12 rounded-xl bg-white/[0.08] text-slate-300 hover:bg-white/[0.12] hover:text-slate-200"
            >
              <Link href="/cadernos">Cancelar</Link>
            </Button>
            <button type="button" disabled={loading} onClick={() => void handleCreate()} className={ctaPrimary}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  Criando…
                </>
              ) : (
                '+ Criar caderno'
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WizardNovoCadernoForm({
  edital,
  modulos,
}: {
  edital: NotebookEditalContext;
  modulos: ModuloTemplateRow[];
}) {
  const router = useRouter();
  const titleSuggestions = useMemo(() => buildNotebookTitleSuggestions(edital), [edital]);
  const preset = useMemo(() => buildQuickAddPreset(edital, modulos), [edital, modulos]);
  const batchPreview = useMemo(() => pickWizardBatchModulos(modulos, preset), [modulos, preset]);

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateWithBatch = async () => {
    if (!title.trim()) {
      setError('Escolha ou digite um nome para o caderno.');
      setStep(1);
      return;
    }
    setLoading(true);
    setError('');
    persistWizardPreset(preset);

    try {
      const createRes = await fetchWithAuth('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: null }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) {
        setError(typeof createJson.error === 'string' ? createJson.error : 'Erro ao criar caderno.');
        return;
      }

      const notebookId = createJson.notebook.id as string;

      if (batchPreview.length > 0) {
        const itemsRes = await fetchWithAuth(`/api/notebooks/${notebookId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: batchPreview.map((m) => ({
              modulo_slug: m.modulo_slug,
              titulo_aula: m.titulo_aula,
              topico: m.modulo_nome,
            })),
          }),
        });

        if (itemsRes.ok) {
          requestNotebookActivationRefresh();
          router.push(`/cadernos/${notebookId}?setup=done`);
          return;
        }

        router.push(`/cadernos/${notebookId}?setup=1`);
        return;
      }

      router.push(`/cadernos/${notebookId}?setup=1`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mx-auto max-w-lg"
    >
      <div
        className="rounded-[2rem] border p-6 shadow-xl sm:p-10"
        style={{ backgroundColor: '#0d1117', borderColor: 'rgba(255, 255, 255, 0.10)' }}
      >
        <div className="mb-6 space-y-4 border-b pb-5" style={{ borderColor: 'rgba(255, 255, 255, 0.10)' }}>
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"
              aria-hidden
            >
              <Sparkles className="h-7 w-7 text-cyan-300" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-white">Monte seu caderno</h2>
              <p className="mt-1 text-sm text-slate-400">
                Em 2 passos você nomeia e já recebe questões sugeridas do seu edital.
              </p>
            </div>
          </div>
          <WizardProgress step={step} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="wizard-caderno-nome" className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Nome do caderno <span className="text-red-400">*</span>
                </label>
                <Input
                  id="wizard-caderno-nome"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Meu edital — CESPE"
                  className={cn(inputDark)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sugestões rápidas</p>
                <div className="flex flex-wrap gap-2">
                  {titleSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTitle(suggestion)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                        title === suggestion
                          ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                          : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/30 hover:text-white',
                      )}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  asChild
                  className="h-12 rounded-xl bg-white/[0.08] text-slate-300 hover:bg-white/[0.12] hover:text-slate-200"
                >
                  <Link href="/cadernos">Cancelar</Link>
                </Button>
                <button
                  type="button"
                  disabled={!title.trim()}
                  onClick={() => {
                    setError('');
                    setStep(2);
                  }}
                  className={ctaPrimary}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <PresetPreview preset={preset} batchCount={batchPreview.length} />

              {error ? (
                <p className="text-sm font-medium text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="h-12 rounded-xl bg-white/[0.08] text-slate-300 hover:bg-white/[0.12] hover:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Voltar
                </Button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleCreateWithBatch()}
                  className={ctaPrimary}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      Montando…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Criar e adicionar questões
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PresetPreview({ preset, batchCount }: { preset: QuickAddPreset; batchCount: number }) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {preset.banca ? (
        <p className="text-sm font-bold text-white">
          Sua banca: <span className="text-cyan-300">{preset.banca}</span>
        </p>
      ) : (
        <p className="text-sm font-bold text-white">Sugestões do catálogo AVANT</p>
      )}

      {preset.assuntosTop3.length > 0 ? (
        <ul className="space-y-2">
          {preset.assuntosTop3.map((assunto) => (
            <li
              key={assunto.titulo}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#010409]/60 px-3 py-2.5"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-slate-200">{assunto.titulo}</span>
              <span className="shrink-0 text-xs font-bold text-slate-500">{assunto.count} questões</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">Nenhum assunto sugerido no momento — você poderá buscar questões depois.</p>
      )}

      <p className="text-xs text-slate-500">
        {batchCount > 0
          ? `Vamos adicionar até ${Math.min(batchCount, preset.suggestedBatchSize)} questões com foco nesses assuntos.`
          : 'O caderno será criado vazio; adicione questões na próxima tela.'}
      </p>
    </div>
  );
}

export default function NovoCadernoClient({ context }: { context: NovoCadernoContext }) {
  const { pageBottomPadding } = useDashboardBottomInset('default');

  return (
    <div className={cn(DASHBOARD_PAGE_ROOT, pageBottomPadding)} style={{ backgroundColor: '#010409' }}>
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
            <h1 className="text-3xl font-black tracking-tight text-white">
              {context.wizard ? 'Novo caderno guiado' : 'Novo caderno'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              {context.wizard
                ? 'Nomeie, confira as sugestões do edital e comece a estudar com NeuroSlides'
                : 'Dê um nome e, se quiser, uma descrição'}
            </p>
          </div>
        </header>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-10 md:pt-8">
        {context.wizard ? (
          <WizardNovoCadernoForm edital={context.edital} modulos={context.modulos} />
        ) : (
          <LegacyNovoCadernoForm />
        )}
      </div>
    </div>
  );
}
