'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Layers,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuestaoFilterBar } from '@/components/questao-filter/QuestaoFilterBar';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { createNotebookWithItemsCompensation } from '@/lib/cadernos/createNotebookWithItems';
import { requestNotebookActivationRefresh } from '@/lib/cadernos/notebookActivationBridge';
import {
  clearDesempenhoSelecao,
  readDesempenhoSelecao,
} from '@/lib/cadernos/desempenhoSelecao';
import {
  buildDesempenhoPreset,
  buildNotebookTitleSuggestions,
  buildQuickAddPreset,
  persistWizardPreset,
  pickWizardBatchModulos,
  resolveBancaFilterOption,
  type ModuloTemplateRow,
  type NotebookEditalContext,
  type QuickAddPreset,
} from '@/lib/cadernos/templates';
import {
  SELECT_VISIBLE_MAX,
  WIZARD_DISPLAY_PAGE_SIZE,
  countByDisciplinaLabel,
  selectDisplayedSlugs,
  toggleSlugInSet,
} from '@/lib/cadernos/wizardSelection';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import { filterModulosForQuestaoPanel } from '@/lib/questao-filter/matchModulos';
import { logger } from '@/lib/logger';
import {
  getVitrineDisciplinaMeta,
  resolveVitrineDisciplinaId,
  type VitrineDisciplinaId,
} from '@/lib/vitrine/disciplina';
import { cn } from '@/lib/utils';

export type NovoCadernoContext = {
  wizard: boolean;
  /** `desempenho` = assuntos escolhidos no hub; lote estrito. */
  origem?: 'edital' | 'desempenho';
  edital: NotebookEditalContext;
  modulos: ModuloTemplateRow[];
};

type WizardStep = 1 | 2 | 3;

const inputEditorial = 'input-editorial h-12 text-sm';
const ctaPrimary = 'btn-editorial-primary min-h-[48px] h-12 px-8 text-sm font-bold';
const ctaOutline = 'btn-editorial-outline min-h-[48px] h-12';

/** Rodapé das etapas: fixo no fim do card no mobile; sticky no desktop. */
function wizardStepFooterClass(justify: 'end' | 'between') {
  return cn(
    'z-10 -mx-1 flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-white/95 px-1 pt-4 backdrop-blur-sm',
    'pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]',
    'max-md:mt-3',
    justify === 'end' ? 'sm:flex-row sm:justify-end' : 'sm:flex-row sm:justify-between',
    'md:sticky md:bottom-0 md:pb-1',
  );
}

const wizardStepShellClass =
  'flex flex-col max-md:h-full max-md:min-h-0 max-md:flex-1 max-md:overflow-hidden';

const wizardStepScrollClass =
  'max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto max-md:overscroll-y-contain';

function WizardProgress({ step, total = 3 }: { step: WizardStep; total?: 2 | 3 }) {
  const labels3: Record<WizardStep, string> = {
    1: 'Dados do caderno',
    2: 'Selecionar questões',
    3: 'Revisar e criar',
  };
  const labels2: Record<1 | 2, string> = {
    1: 'Nome do caderno',
    2: 'Montar conteúdo',
  };
  const width =
    total === 2 ? (step === 1 ? '50%' : '100%') : step === 1 ? '33%' : step === 2 ? '66%' : '100%';
  const label = total === 2 ? labels2[step === 3 ? 2 : step] : labels3[step];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>
          {total === 2 && step === 3 ? 2 : step} de {total}
        </span>
        <span>{label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <motion.div
          className="h-full rounded-full bg-[var(--color-success)]"
          initial={false}
          animate={{ width }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function WizardNovoCadernoForm({
  edital,
  modulos,
  origem = 'edital',
}: {
  edital: NotebookEditalContext;
  modulos: ModuloTemplateRow[];
  origem?: 'edital' | 'desempenho';
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const titleSuggestions = useMemo(() => buildNotebookTitleSuggestions(edital), [edital]);

  const [selecaoDesempenho, setSelecaoDesempenho] = useState<string[] | null>(null);
  useEffect(() => {
    if (origem !== 'desempenho') return;
    // sessionStorage só existe após o mount; ler no effect evita mismatch de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única de store externo
    setSelecaoDesempenho(readDesempenhoSelecao());
  }, [origem]);

  const modoDesempenho = origem === 'desempenho';
  const preset = useMemo(() => {
    if (modoDesempenho) {
      return buildDesempenhoPreset(selecaoDesempenho ?? [], modulos);
    }
    return buildQuickAddPreset(edital, modulos);
  }, [edital, modoDesempenho, modulos, selecaoDesempenho]);
  const presetBatch = useMemo(() => pickWizardBatchModulos(modulos, preset), [modulos, preset]);
  const selecaoPerdida = modoDesempenho && selecaoDesempenho !== null && selecaoDesempenho.length === 0;
  const semQuestoesNaSelecao =
    modoDesempenho && !selecaoPerdida && (selecaoDesempenho?.length ?? 0) > 0 && presetBatch.length === 0;
  const moduloBySlug = useMemo(() => {
    const map = new Map<string, ModuloTemplateRow>();
    for (const m of modulos) map.set(m.modulo_slug, m);
    return map;
  }, [modulos]);

  const bancasDisponiveis = useMemo(
    () => [...new Set(modulos.map((m) => m.banca).filter(Boolean) as string[])],
    [modulos],
  );

  const [step, setStep] = useState<WizardStep>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(
    () => new Set(presetBatch.map((m) => m.modulo_slug)),
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<VitrineDisciplinaId | null>(null);
  const [bancasSelecionadas, setBancasSelecionadas] = useState<string[]>(() => {
    const bancaOption = resolveBancaFilterOption(preset.banca, bancasDisponiveis);
    return bancaOption ? [bancaOption] : [];
  });
  const [assuntosSelecionados, setAssuntosSelecionados] = useState<string[]>(() =>
    preset.assuntosTop3.length > 0 ? preset.assuntosTop3.map((a) => a.titulo).slice(0, 3) : [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loteHint, setLoteHint] = useState('');
  const submittingRef = useRef(false);

  const filterParams = useMemo(
    () => ({
      disciplina: disciplinaSelecionada,
      bancas: bancasSelecionadas,
      assuntos: assuntosSelecionados,
      q: searchTerm,
    }),
    [assuntosSelecionados, bancasSelecionadas, disciplinaSelecionada, searchTerm],
  );

  const filtradosCompletos = useMemo(
    () => filterModulosForQuestaoPanel(modulos, filterParams),
    [filterParams, modulos],
  );

  const filtradosExibidos = useMemo(
    () => filtradosCompletos.slice(0, WIZARD_DISPLAY_PAGE_SIZE),
    [filtradosCompletos],
  );

  const selectedRows = useMemo(() => {
    const rows: ModuloTemplateRow[] = [];
    for (const slug of selectedSlugs) {
      const row = moduloBySlug.get(slug);
      if (row) rows.push(row);
    }
    return rows;
  }, [moduloBySlug, selectedSlugs]);

  const disciplinaDist = useMemo(
    () =>
      countByDisciplinaLabel(selectedRows, (nome) =>
        getVitrineDisciplinaMeta(resolveVitrineDisciplinaId(nome)).label,
      ),
    [selectedRows],
  );

  const goStep2 = useCallback(() => {
    if (!title.trim()) {
      setError('Digite um nome para o caderno.');
      return;
    }
    setError('');
    setStatusMessage('');
    setStep(2);
  }, [title]);

  const handleSelectDisplayed = useCallback(() => {
    const displayed = filtradosExibidos.map((m) => m.modulo_slug);
    const result = selectDisplayedSlugs(displayed, selectedSlugs, SELECT_VISIBLE_MAX);
    setSelectedSlugs(result.next);
    if (displayed.length === 0) {
      setLoteHint('Nenhuma questão exibida para selecionar.');
      return;
    }
    if (result.capped) {
      setLoteHint(
        `Selecionadas até ${SELECT_VISIBLE_MAX} questões exibidas (há ${filtradosCompletos.length} no filtro). Seleções anteriores foram mantidas.`,
      );
    } else if (result.added === 0) {
      setLoteHint('Todas as questões exibidas já estavam selecionadas.');
    } else {
      setLoteHint(
        `${result.added} questão${result.added === 1 ? '' : 'ões'} adicionada${result.added === 1 ? '' : 's'} à seleção (${result.next.size} no total).`,
      );
    }
  }, [filtradosCompletos.length, filtradosExibidos, selectedSlugs]);

  const handleCreate = useCallback(async () => {
    if (submittingRef.current) return;
    if (!title.trim()) {
      setError('Digite um nome para o caderno.');
      setStep(1);
      return;
    }
    if (modoDesempenho && selecaoDesempenho === null) {
      setError('Ainda estamos lendo os assuntos marcados. Aguarde um instante.');
      return;
    }
    if (selecaoPerdida) {
      setError('Não encontramos os assuntos selecionados. Volte ao seu desempenho e marque de novo.');
      return;
    }
    if (semQuestoesNaSelecao) {
      setError('Nenhuma questão liberada nos assuntos escolhidos. Escolha outro assunto no hub.');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    setStatusMessage('Criando caderno…');

    const slugsForCreate = modoDesempenho
      ? presetBatch.map((m) => m.modulo_slug)
      : [...selectedSlugs];
    const items = slugsForCreate.map((slug) => {
      const m = moduloBySlug.get(slug);
      return {
        modulo_slug: slug,
        titulo_aula: m?.titulo_aula ?? null,
        topico: m?.modulo_nome ?? null,
      };
    });

    try {
      const result = await createNotebookWithItemsCompensation({
        title: title.trim(),
        description: description.trim() || null,
        items,
        fetchAuth: fetchWithAuth,
      });

      if (!result.ok) {
        if (result.cleanupFailed) {
          logger.error('Wizard caderno: falha ao inserir itens e no cleanup', undefined, {
            orphanNotebookId: result.orphanNotebookId,
          });
        }
        setError(result.error);
        setStatusMessage('');
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }

      persistWizardPreset(preset);
      if (modoDesempenho) clearDesempenhoSelecao();
      setStatusMessage('Caderno criado com sucesso.');
      requestNotebookActivationRefresh();
      router.push(
        result.itemCount > 0
          ? `/cadernos/${result.notebookId}?setup=done`
          : `/cadernos/${result.notebookId}?setup=1`,
      );
    } catch (err) {
      logger.error('Wizard caderno: erro inesperado na criação', err);
      setError('Não foi possível criar o caderno. Tente de novo.');
      setStatusMessage('');
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [
    description,
    modoDesempenho,
    moduloBySlug,
    preset,
    presetBatch,
    router,
    selectedSlugs,
    selecaoDesempenho,
    selecaoPerdida,
    semQuestoesNaSelecao,
    title,
  ]);

  const stepMotion = reduceMotion
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : undefined;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col max-md:overflow-hidden"
    >
      <div className="login-auth-card flex min-h-0 flex-1 flex-col max-md:overflow-hidden">
        <div className="mb-6 shrink-0 space-y-4 border-b border-slate-200 pb-5">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgba(34,197,94,0.10)]"
              aria-hidden
            >
              <Sparkles className="h-7 w-7 text-[#166534]" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-slate-900">Monte seu caderno</h2>
              <p className="mt-1 text-sm text-slate-500">
                {modoDesempenho
                  ? 'Em 2 passos você nomeia e recebe só questões dos assuntos que marcou no seu desempenho.'
                  : 'Em 3 passos: nomeie, escolha as questões e confirme antes de criar.'}
              </p>
            </div>
          </div>
          <WizardProgress step={step} total={modoDesempenho ? 2 : 3} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col max-md:overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step-1"
              {...(stepMotion ?? {
                initial: { opacity: 0, x: -12 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: 12 },
                transition: { duration: 0.2 },
              })}
              className={cn(wizardStepShellClass, 'space-y-5 max-md:space-y-0')}
            >
              <div className={cn(wizardStepScrollClass, 'space-y-5 max-md:pr-0.5')}>
              <div className="space-y-2">
                <label htmlFor="wizard-caderno-nome" className="label-editorial">
                  Nome do caderno <span className="text-red-600">*</span>
                </label>
                <Input
                  id="wizard-caderno-nome"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      goStep2();
                    }
                  }}
                  placeholder="Ex: Meu edital — CESPE"
                  className={cn(inputEditorial)}
                  aria-required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="wizard-caderno-desc" className="label-editorial">
                  Descrição <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <Input
                  id="wizard-caderno-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Questões focadas do meu edital"
                  className={cn(inputEditorial)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Sugestões rápidas
                </p>
                <div className="flex flex-wrap gap-2">
                  {titleSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTitle(suggestion)}
                      className={cn(
                        'min-h-[44px] rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                        title === suggestion
                          ? 'border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.12)] text-[#166534]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[rgba(34,197,94,0.35)] hover:text-slate-900',
                      )}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {!modoDesempenho ? (
                <PresetHint preset={preset} batchCount={presetBatch.length} />
              ) : null}

              {error ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              </div>

              <div className={wizardStepFooterClass('end')}>
                <Button type="button" variant="outline" asChild className={ctaOutline}>
                  <Link href="/cadernos">Cancelar</Link>
                </Button>
                <button type="button" disabled={!title.trim()} onClick={goStep2} className={ctaPrimary}>
                  Continuar
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          ) : null}

          {step === 2 && modoDesempenho ? (
            <motion.div
              key="step-2-desempenho"
              {...(stepMotion ?? {
                initial: { opacity: 0, x: 12 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -12 },
                transition: { duration: 0.2 },
              })}
              className={cn(wizardStepShellClass, 'space-y-5 max-md:space-y-0')}
            >
              <div className={cn(wizardStepScrollClass, 'space-y-5 max-md:pr-0.5')}>
                {selecaoPerdida ? (
                  <SelecaoPerdidaAviso />
                ) : (
                  <PresetPreview
                    preset={preset}
                    batchCount={presetBatch.length}
                    carregandoSelecao={selecaoDesempenho === null}
                  />
                )}
                {error ? (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
              <div className={wizardStepFooterClass('between')}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => {
                    setError('');
                    setStep(1);
                  }}
                  className={ctaOutline}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Voltar
                </Button>
                <button
                  type="button"
                  disabled={
                    submitting ||
                    selecaoDesempenho === null ||
                    selecaoPerdida ||
                    semQuestoesNaSelecao
                  }
                  onClick={() => void handleCreate()}
                  className={ctaPrimary}
                  aria-busy={submitting}
                >
                  {submitting ? (
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
          ) : null}

          {step === 2 && !modoDesempenho ? (
            <motion.div
              key="step-2"
              {...(stepMotion ?? {
                initial: { opacity: 0, x: 12 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -12 },
                transition: { duration: 0.2 },
              })}
              className={wizardStepShellClass}
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 max-md:overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 shrink-0">
                <p className="text-sm font-bold text-slate-800" aria-live="polite">
                  {selectedSlugs.size}{' '}
                  {selectedSlugs.size === 1 ? 'questão selecionada' : 'questões selecionadas'}
                </p>
                <button
                  type="button"
                  disabled={selectedSlugs.size === 0}
                  onClick={() => {
                    setSelectedSlugs(new Set());
                    setLoteHint('Seleção limpa.');
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Limpar seleção
                </button>
              </div>

              <QuestaoFilterBar
                variant="caderno-panel"
                bancasSelected={bancasSelecionadas}
                assuntosSelected={assuntosSelecionados}
                searchTerm={searchTerm}
                disciplinaSelected={disciplinaSelecionada}
                onBancasChange={setBancasSelecionadas}
                onAssuntosChange={setAssuntosSelecionados}
                onSearchChange={setSearchTerm}
                onDisciplinaChange={setDisciplinaSelecionada}
                modulosForFallback={modulos}
                resultCount={filtradosCompletos.length}
                footer={
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <button
                      type="button"
                      onClick={handleSelectDisplayed}
                      disabled={filtradosExibidos.length === 0}
                      className="btn-editorial-outline flex w-full min-h-[48px] items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      <Layers size={14} aria-hidden />
                      Selecionar questões exibidas
                      {filtradosExibidos.length > 0
                        ? ` (${Math.min(filtradosExibidos.length, SELECT_VISIBLE_MAX)})`
                        : ''}
                    </button>
                    {filtradosCompletos.length > WIZARD_DISPLAY_PAGE_SIZE ? (
                      <p className="text-center text-[10px] font-bold text-slate-500">
                        Lista mostra {WIZARD_DISPLAY_PAGE_SIZE} de {filtradosCompletos.length}. O lote
                        automático usa só as exibidas (máx. {SELECT_VISIBLE_MAX}).
                      </p>
                    ) : null}
                    {loteHint ? (
                      <p className="text-center text-[11px] font-medium text-slate-600" role="status">
                        {loteHint}
                      </p>
                    ) : null}
                  </div>
                }
              />

              <div
                className={cn(
                  'min-h-0 space-y-1 overflow-y-auto overscroll-y-contain rounded-2xl border border-slate-200 p-2',
                  'max-md:flex-1',
                  'md:max-h-[min(50dvh,24rem)]',
                )}
                role="listbox"
                aria-label="Questões para o caderno"
                aria-multiselectable
              >
                {modulos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Nenhuma questão disponível no seu pacote. Você pode criar o caderno vazio e
                    adicionar depois.
                  </p>
                ) : filtradosExibidos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">Nenhum resultado para os filtros.</p>
                ) : (
                  filtradosExibidos.map((m) => {
                    const selected = selectedSlugs.has(m.modulo_slug);
                    const codigo = formatAvantCodigo(m.avant_codigo ?? null);
                    return (
                      <button
                        key={m.modulo_slug}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => setSelectedSlugs((prev) => toggleSlugInSet(prev, m.modulo_slug))}
                        className={cn(
                          'flex w-full min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                          selected
                            ? 'border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.08)]'
                            : 'border-transparent hover:bg-slate-50',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                            selected
                              ? 'border-[#166534] bg-[#166534] text-white'
                              : 'border-slate-300 bg-white text-transparent',
                          )}
                          aria-hidden
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {m.banca || 'Questão'}
                            </span>
                            {codigo ? (
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-600">
                                {codigo}
                              </span>
                            ) : null}
                          </span>
                          <span className="block truncate text-sm font-bold text-slate-800">
                            {m.titulo_aula || m.modulo_slug}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {error ? (
                <p className="shrink-0 text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              </div>

              <div className={wizardStepFooterClass('between')}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => {
                    setError('');
                    setStep(1);
                  }}
                  className={ctaOutline}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Voltar
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStep(3);
                  }}
                  className={ctaPrimary}
                >
                  Revisar
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          ) : null}

          {step === 3 && !modoDesempenho ? (
            <motion.div
              key="step-3"
              {...(stepMotion ?? {
                initial: { opacity: 0, x: 12 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -12 },
                transition: { duration: 0.2 },
              })}
              className={cn(wizardStepShellClass, 'space-y-5 max-md:space-y-0')}
            >
              <div className={cn(wizardStepScrollClass, 'space-y-5 max-md:pr-0.5')}>
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome</p>
                  <p className="text-base font-bold text-slate-900">{title.trim() || '—'}</p>
                </div>
                {description.trim() ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Descrição
                    </p>
                    <p className="text-sm text-slate-700">{description.trim()}</p>
                  </div>
                ) : null}
                {preset.banca || preset.assuntosTop3.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Origem da sugestão
                    </p>
                    <p className="text-sm text-slate-700">
                      {preset.banca
                        ? `Preset do edital (${preset.banca})`
                        : 'Preset do catálogo AVANT enf'}
                      {preset.assuntosTop3.length > 0
                        ? ` · ${preset.assuntosTop3.map((a) => a.titulo).join(', ')}`
                        : ''}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Questões
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedSlugs.size}{' '}
                    {selectedSlugs.size === 1 ? 'questão selecionada' : 'questões selecionadas'}
                  </p>
                </div>
                {disciplinaDist.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Por disciplina
                    </p>
                    <ul className="mt-1 space-y-1">
                      {disciplinaDist.map((d) => (
                        <li key={d.label} className="flex justify-between text-sm text-slate-700">
                          <span>{d.label}</span>
                          <span className="font-bold tabular-nums">{d.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="text-xs text-slate-500">
                  Estudo reverso e NeuroSlides ficam disponíveis nas questões do caderno. Você poderá
                  adicionar mais questões depois.
                </p>
              </div>

              {error ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              {statusMessage ? (
                <p className="text-sm font-medium text-[#166534]" role="status" aria-live="polite">
                  {statusMessage}
                </p>
              ) : null}
              </div>

              <div className={wizardStepFooterClass('between')}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => {
                    setError('');
                    setStatusMessage('');
                    setStep(2);
                  }}
                  className={ctaOutline}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Voltar à seleção
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => {
                      setError('');
                      setStatusMessage('');
                      setStep(1);
                    }}
                    className={ctaOutline}
                  >
                    Editar dados
                  </Button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleCreate()}
                    className={ctaPrimary}
                    aria-busy={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                        Criando…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        Criar caderno
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function PresetHint({ preset, batchCount }: { preset: QuickAddPreset; batchCount: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      {preset.banca ? (
        <p className="font-bold text-slate-900">
          Sugestão inicial: banca <span className="text-[#166534]">{preset.banca}</span>
        </p>
      ) : (
        <p className="font-bold text-slate-900">Sugestão inicial do catálogo</p>
      )}
      <p className="mt-1 text-xs leading-relaxed">
        {batchCount > 0
          ? `Na próxima etapa, até ${batchCount} questões já virão pré-selecionadas (editáveis). Nada é salvo até você confirmar.`
          : 'Na próxima etapa você escolhe as questões. Nada é salvo até confirmar.'}
      </p>
    </div>
  );
}

/** Seleção do hub não chegou (aba nova, storage limpo): não inventar lote. */
function SelecaoPerdidaAviso() {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-2xl border border-[var(--color-warning)]/40 bg-[var(--color-warning-dim)] p-4"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <AlertTriangle className="h-4 w-4 text-[var(--color-warning-text)]" aria-hidden />
        Não encontramos os assuntos selecionados
      </p>
      <p className="text-sm text-slate-600">
        A seleção vale só na aba onde você marcou os assuntos. Volte ao seu desempenho e marque
        novamente — assim o caderno recebe exatamente o que você escolheu.
      </p>
      <Link
        href="/desempenho"
        className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900"
      >
        Voltar ao meu desempenho
      </Link>
    </div>
  );
}

function PresetPreview({
  preset,
  batchCount,
  carregandoSelecao = false,
}: {
  preset: QuickAddPreset;
  batchCount: number;
  carregandoSelecao?: boolean;
}) {
  const estrito = preset.strict === true;

  if (carregandoSelecao) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Lendo os assuntos que você marcou…
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {estrito ? (
        <p className="text-sm font-bold text-slate-900">Assuntos escolhidos no seu desempenho</p>
      ) : preset.banca ? (
        <p className="text-sm font-bold text-slate-900">
          Sua banca: <span className="text-[var(--color-success-text)]">{preset.banca}</span>
        </p>
      ) : (
        <p className="text-sm font-bold text-slate-900">Sugestões do catálogo AVANT enf</p>
      )}

      {preset.assuntosTop3.length > 0 ? (
        <ul className="space-y-2">
          {preset.assuntosTop3.map((assunto) => (
            <li
              key={assunto.titulo}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-slate-700">{assunto.titulo}</span>
              <span className="shrink-0 text-xs font-bold text-slate-500">{assunto.count} questões</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          Nenhum assunto sugerido no momento — você poderá buscar questões depois.
        </p>
      )}

      <p className="text-xs text-slate-500">
        {estrito
          ? batchCount > 0
            ? `Vamos adicionar ${batchCount} ${batchCount === 1 ? 'questão' : 'questões'} — só desses assuntos, sem completar com outros.`
            : 'Nenhuma questão liberada nesses assuntos. Escolha outro assunto no seu desempenho.'
          : batchCount > 0
            ? `Vamos adicionar até ${Math.min(batchCount, preset.suggestedBatchSize)} questões com foco nesses assuntos.`
            : 'O caderno será criado vazio; adicione questões na próxima tela.'}
      </p>
    </div>
  );
}

export default function NovoCadernoClient({ context }: { context: NovoCadernoContext }) {
  const { pageBottomPadding } = useDashboardBottomInset('default');

  return (
    <div
      className={cn(
        DASHBOARD_PAGE_ROOT,
        'bg-background',
        pageBottomPadding,
        'max-md:flex max-md:h-full max-md:max-h-full max-md:flex-col max-md:overflow-hidden',
      )}
    >
      <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-background/95 backdrop-blur-md">
        <header className="bg-transparent">
          <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-10">
            <Link
              href="/cadernos"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Cadernos de Estudo
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Novo caderno</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Nomeie, selecione questões e confirme — o caderno só é criado no final
            </p>
          </div>
        </header>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 md:px-10 md:pt-8 max-md:h-full max-md:max-h-full max-md:overflow-hidden max-md:py-4">
        <WizardNovoCadernoForm
          edital={context.edital}
          modulos={context.modulos}
          origem={context.origem}
        />
      </div>
    </div>
  );
}
