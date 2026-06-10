'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  BookOpen,
  Layers,
  Loader2,
  BookMarked,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { CadernoDetail, CadernoSetupMode, ModuloDisponivel, NotebookItem } from './page';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { requestNotebookActivationRefresh } from '@/lib/cadernos/notebookActivationBridge';
import {
  buildQuickAddPreset,
  pickWizardBatchModulos,
  readWizardPreset,
  resolveBancaFilterOption,
  type ModuloTemplateRow,
} from '@/lib/cadernos/templates';
import { useFirstSeen } from '@/components/onboarding/useFirstSeen';
import { SearchPanelToggle, type SearchPanelToggleHandle } from '@/components/dashboard/cadernos/SearchPanelToggle';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import { QuestaoFilterBar } from '@/components/questao-filter/QuestaoFilterBar';
import {
  filterModulosForQuestaoPanel,
  hasQuestaoPanelFilterCriteria,
} from '@/lib/questao-filter/matchModulos';
import { useToast } from '@/lib/toast-context';

// ── Componente: item do caderno ────────────────────────────────────────────
function ItemCaderno({
  item,
  index,
  notebookId,
  onRemoved,
}: {
  item: NotebookItem;
  index: number;
  notebookId: string;
  onRemoved: (id: string) => void;
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetchWithAuth(`/api/notebooks/${notebookId}/items/${item.id}`, { method: 'DELETE' });
      if (res.ok) onRemoved(item.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border p-4 transition-all',
        !item.acessivel
          ? 'border-amber-500/20 bg-amber-950/20 opacity-80'
          : item.estudada
            ? 'border-emerald-500/25 bg-emerald-950/30'
            : 'border-[rgba(255,255,255,0.10)] bg-[#0d1117] hover:border-cyan-500/20',
      )}
    >
      {/* Número */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-white/[0.08]">
        <span className="text-[11px] font-black text-slate-500">{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Status estudada */}
      <div className="shrink-0">
        {item.estudada
          ? <CheckCircle2 size={16} className="text-emerald-500" />
          : <Circle size={16} className="text-slate-500" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {item.topico || 'Questão'}
          </p>
          {formatAvantCodigo(item.avant_codigo) && (
            <span className="shrink-0 rounded-md border border-[rgba(0,242,255,0.35)] bg-[rgba(0,242,255,0.08)] px-1.5 py-0.5 font-mono text-[9px] font-black text-[#67e8f9]">
              {formatAvantCodigo(item.avant_codigo)}
            </span>
          )}
        </div>
        <p className="truncate text-sm font-bold text-slate-200">{item.titulo_aula || item.modulo_slug}</p>
        {!item.acessivel ? (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300/90">
            Fora do seu pacote
          </p>
        ) : null}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        {item.acessivel ? (
          <Link
            href={`/estudar/${item.modulo_slug}?from=caderno&caderno_id=${notebookId}`}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/25 bg-[rgba(0,242,255,0.08)] transition-colors hover:bg-[rgba(0,242,255,0.14)]"
            title="Estudar questão"
          >
            <Play size={13} className="text-cyan-300" />
          </Link>
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10"
            title="Questão fora do pacote matriculado"
          >
            <Play size={13} className="text-amber-300/70" />
          </span>
        )}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.10)] bg-white/[0.04] transition-colors hover:border-rose-500/35 hover:bg-rose-500/10 disabled:opacity-50"
          title="Remover do caderno"
        >
          {removing
            ? <Loader2 size={13} className="text-slate-400 animate-spin" />
            : <Trash2 size={13} className="text-slate-400 hover:text-rose-500 transition-colors" />
          }
        </button>
      </div>
    </motion.div>
  );
}

// ── Componente: painel de busca/filtro ─────────────────────────────────────
function BuilderPanel({
  modulos,
  notebookId,
  onAdded,
  onAddedMany,
  initialBancas = [],
  initialAssuntos = [],
  highlightFilters = false,
}: {
  modulos: ModuloDisponivel[];
  notebookId: string;
  onAdded: (item: NotebookItem) => void;
  onAddedMany: (items: NotebookItem[]) => void;
  initialBancas?: string[];
  initialAssuntos?: string[];
  highlightFilters?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bancasSelecionadas, setBancasSelecionadas] = useState<string[]>(initialBancas);
  const [assuntosSelecionados, setAssuntosSelecionados] = useState<string[]>(initialAssuntos);
  const [adding, setAdding] = useState<string | null>(null);
  const [addingLote, setAddingLote] = useState(false);

  useEffect(() => {
    if (initialBancas.length) setBancasSelecionadas(initialBancas);
  }, [initialBancas]);

  useEffect(() => {
    if (initialAssuntos.length) setAssuntosSelecionados(initialAssuntos);
  }, [initialAssuntos]);

  const filterParams = useMemo(
    () => ({
      bancas: bancasSelecionadas,
      assuntos: assuntosSelecionados,
      q: searchTerm,
    }),
    [assuntosSelecionados, bancasSelecionadas, searchTerm],
  );

  const filtradosCompletos = useMemo(
    () => filterModulosForQuestaoPanel(modulos, filterParams),
    [filterParams, modulos],
  );

  const filtrados = useMemo(
    () => filtradosCompletos.slice(0, 50),
    [filtradosCompletos],
  );

  const criterioLoteAtivo = hasQuestaoPanelFilterCriteria(filterParams);

  const handleAdd = async (m: ModuloDisponivel) => {
    setAdding(m.modulo_slug);
    try {
      const res = await fetchWithAuth(`/api/notebooks/${notebookId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulo_slug: m.modulo_slug,
          titulo_aula: m.titulo_aula,
          topico: m.modulo_nome,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        onAdded({ ...json.item, estudada: false, avant_codigo: m.avant_codigo ?? null });
      }
    } finally {
      setAdding(null);
    }
  };

  const handleAddLote = async () => {
    if (filtradosCompletos.length === 0 || !criterioLoteAtivo) return;
    if (filtradosCompletos.length > 25) {
      const ok = window.confirm(
        `Adicionar ${filtradosCompletos.length} questões de uma vez ao caderno?`
      );
      if (!ok) return;
    }
    setAddingLote(true);
    try {
      const res = await fetchWithAuth(`/api/notebooks/${notebookId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: filtradosCompletos.map(m => ({
            modulo_slug: m.modulo_slug,
            titulo_aula: m.titulo_aula,
            topico: m.modulo_nome,
          })),
        }),
      });
      const json = (await res.json()) as { items?: NotebookItem[]; error?: string };
      if (res.ok && Array.isArray(json.items)) {
        const meta = new Map(filtradosCompletos.map(m => [m.modulo_slug, m]));
        onAddedMany(
          json.items.map(item => ({
            ...item,
            estudada: false,
            avant_codigo: meta.get(item.modulo_slug)?.avant_codigo ?? null,
          })),
        );
      } else if (!res.ok) {
        window.alert(json.error || 'Não foi possível adicionar o lote.');
      }
    } finally {
      setAddingLote(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] max-lg:h-auto max-lg:flex-none">
      <div className="shrink-0 space-y-3 border-b border-[rgba(255,255,255,0.08)] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">Adicionar questões</p>

        <QuestaoFilterBar
          variant="caderno-panel"
          bancasSelected={bancasSelecionadas}
          assuntosSelected={assuntosSelecionados}
          searchTerm={searchTerm}
          onBancasChange={setBancasSelecionadas}
          onAssuntosChange={setAssuntosSelecionados}
          onSearchChange={setSearchTerm}
          modulosForFallback={modulos}
          resultCount={filtradosCompletos.length}
          highlightActiveFilters={highlightFilters}
          footer={
            <>
              {criterioLoteAtivo && filtradosCompletos.length > 0 ? (
                <div className="border-t border-[rgba(255,255,255,0.08)] pt-3">
                  <button
                    type="button"
                    onClick={handleAddLote}
                    disabled={addingLote}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-[rgba(0,242,255,0.08)] px-3 py-2.5 text-xs font-black uppercase tracking-widest text-cyan-200 transition-colors hover:bg-[rgba(0,242,255,0.12)] disabled:opacity-50"
                  >
                    {addingLote ? (
                      <>
                        <Loader2 size={14} className="animate-spin" aria-hidden />
                        Adicionando lote…
                      </>
                    ) : (
                      <>
                        <Layers size={14} aria-hidden />
                        Adicionar todas ({filtradosCompletos.length}
                        {filtradosCompletos.length > 1 ? ' questões' : ' questão'})
                      </>
                    )}
                  </button>
                  {filtradosCompletos.length > 50 ? (
                    <p className="mt-1.5 text-center text-[10px] font-bold text-slate-400">
                      Lista abaixo mostra 50; o lote inclui as {filtradosCompletos.length} do filtro.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {!criterioLoteAtivo && modulos.length > 0 ? (
                <p className="text-[10px] leading-relaxed text-slate-400">
                  Escolha um <strong className="text-slate-300">assunto</strong> e/ou{' '}
                  <strong className="text-slate-300">banca</strong> ou use a{' '}
                  <strong className="text-slate-300">busca</strong> para ativar a opção de adicionar o lote inteiro de
                  uma vez.
                </p>
              ) : null}
            </>
          }
        />
      </div>

      {/* Resultados: scroll interno no desktop; no mobile o sheet pai rola tudo */}
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain p-2 touch-pan-y max-lg:flex-none max-lg:overflow-visible lg:min-h-0">
        {filtrados.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {criterioLoteAtivo
              ? 'Nenhum resultado'
              : modulos.length === 0
                ? 'Nenhuma questão disponível no seu pacote. Verifique sua matrícula em Planos.'
                : 'Todas as questões já estão no caderno'}
          </div>
        ) : (
          filtrados.map(m => (
            <button
              key={m.modulo_slug}
              type="button"
              onClick={() => handleAdd(m)}
              disabled={adding === m.modulo_slug}
              className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {m.banca || ''} {m.modulo_nome ? `— ${m.modulo_nome}` : ''}
                  </p>
                  {formatAvantCodigo(m.avant_codigo) && (
                    <span className="shrink-0 rounded bg-[rgba(0,242,255,0.08)] px-1 py-0.5 font-mono text-[8px] font-black text-[#67e8f9]">
                      {formatAvantCodigo(m.avant_codigo)}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-bold text-slate-300">{m.titulo_aula || m.modulo_slug}</p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-[rgba(0,242,255,0.12)]">
                {adding === m.modulo_slug ? (
                  <Loader2 size={12} className="animate-spin text-cyan-400" aria-hidden />
                ) : (
                  <Plus size={12} className="text-slate-400 transition-colors group-hover:text-cyan-300" aria-hidden />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {modulos.length > 0 && filtradosCompletos.length > 50 && filtrados.length === 50 && (
        <p className="p-3 text-center text-[10px] font-bold text-slate-400">
          Mostrando 50 de {filtradosCompletos.length} com este filtro — refine a busca
        </p>
      )}
    </div>
  );
}

function modulosToTemplateRows(modulos: ModuloDisponivel[]): ModuloTemplateRow[] {
  return modulos.map((m) => ({
    modulo_slug: m.modulo_slug,
    titulo_aula: m.titulo_aula,
    modulo_nome: m.modulo_nome,
    banca: m.banca,
  }));
}

// ── Componente principal ───────────────────────────────────────────────────
export default function CadernoDetailClient({
  caderno,
  modulosDisponiveis: inicial,
  editalBanca = null,
  setupMode = 'none',
  metricsSlot,
  reverseStudyBadgeSlot,
}: {
  caderno: CadernoDetail;
  modulosDisponiveis: ModuloDisponivel[];
  editalBanca?: string | null;
  setupMode?: CadernoSetupMode;
  metricsSlot?: ReactNode;
  reverseStudyBadgeSlot?: ReactNode;
}) {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const router = useRouter();
  const { addToast } = useToast();
  const searchPanelRef = useRef<SearchPanelToggleHandle>(null);
  const setupToastShownRef = useRef(false);
  const [items, setItems] = useState(caderno.items);
  const [modulos, setModulos] = useState(inicial);
  const [headerPulse, setHeaderPulse] = useState(false);
  const [quickAdding, setQuickAdding] = useState(false);
  const [setupBannerVisible, setSetupBannerVisible] = useState(setupMode === 'done');
  const [filterPrefsReady, setFilterPrefsReady] = useState(false);
  const [initialBancas, setInitialBancas] = useState<string[]>([]);
  const [initialAssuntos, setInitialAssuntos] = useState<string[]>([]);
  const firstItemTip = useFirstSeen('caderno-first-item', items.length > 0);

  const bancasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    modulos.forEach((m) => {
      if (m.banca) set.add(m.banca);
    });
    return Array.from(set).sort();
  }, [modulos]);

  useEffect(() => {
    const stored = readWizardPreset();
    const bancaTarget = stored?.banca ?? editalBanca;
    const resolvedBanca = resolveBancaFilterOption(bancaTarget, bancasDisponiveis);
    const resolvedTopico = stored?.assuntosTop3[0]?.titulo ?? '';
    setInitialBancas(resolvedBanca ? [resolvedBanca] : []);
    setInitialAssuntos(resolvedTopico ? [resolvedTopico] : []);
    setFilterPrefsReady(true);
  }, [bancasDisponiveis, editalBanca]);

  useEffect(() => {
    if (setupMode !== 'done' || items.length === 0 || setupToastShownRef.current) return;
    setupToastShownRef.current = true;
    addToast('Caderno pronto! Comece o estudo reverso quando quiser.', 'success');
    router.replace(`/cadernos/${caderno.id}`, { scroll: false });
  }, [addToast, caderno.id, items.length, router, setupMode]);

  const triggerFirstItemFeedback = useCallback(() => {
    requestNotebookActivationRefresh();
    setHeaderPulse(true);
    window.setTimeout(() => setHeaderPulse(false), 1400);
  }, []);

  const handleRemoved = (itemId: string) => {
    const removed = items.find(i => i.id === itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    if (removed) {
      setModulos(prev => [
        {
          id: removed.id,
          modulo_slug: removed.modulo_slug,
          modulo_nome: removed.topico,
          titulo_aula: removed.titulo_aula,
          banca: null,
          avant_codigo: removed.avant_codigo ?? null,
        },
        ...prev,
      ]);
    }
  };

  const handleAdded = (item: NotebookItem) => {
    setItems((prev) => {
      if (prev.length === 0) triggerFirstItemFeedback();
      return [...prev, item];
    });
    setModulos(prev => prev.filter(m => m.modulo_slug !== item.modulo_slug));
    setSetupBannerVisible(false);
  };

  const handleAddedMany = (novos: NotebookItem[]) => {
    if (novos.length === 0) return;
    const slugs = new Set(novos.map(i => i.modulo_slug));
    setItems((prev) => {
      if (prev.length === 0) triggerFirstItemFeedback();
      return [...prev, ...novos];
    });
    setModulos(prev => prev.filter(m => !slugs.has(m.modulo_slug)));
    setSetupBannerVisible(false);
  };

  const quickAddPreset = useMemo(() => {
    if (!editalBanca?.trim() || modulos.length === 0) return null;
    const edital = { nome: '', banca: editalBanca, orgao: null, ano: null, slug: '' };
    return buildQuickAddPreset(edital, modulosToTemplateRows(modulos));
  }, [editalBanca, modulos]);

  const quickAddBatch = useMemo(() => {
    if (!quickAddPreset) return [];
    return pickWizardBatchModulos(modulosToTemplateRows(modulos), quickAddPreset);
  }, [modulos, quickAddPreset]);

  const handleQuickAddBanca = async () => {
    if (quickAddBatch.length === 0) return;
    setQuickAdding(true);
    try {
      const res = await fetchWithAuth(`/api/notebooks/${caderno.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: quickAddBatch.map((m) => ({
            modulo_slug: m.modulo_slug,
            titulo_aula: m.titulo_aula,
            topico: m.modulo_nome,
          })),
        }),
      });
      const json = (await res.json()) as { items?: NotebookItem[]; error?: string };
      if (res.ok && Array.isArray(json.items)) {
        handleAddedMany(
          json.items.map((item) => ({
            ...item,
            estudada: false,
            avant_codigo:
              modulos.find((m) => m.modulo_slug === item.modulo_slug)?.avant_codigo ?? null,
            acessivel: true,
          })),
        );
      } else if (!res.ok) {
        window.alert(json.error || 'Não foi possível adicionar as questões.');
      }
    } finally {
      setQuickAdding(false);
    }
  };

  const openSearchPanel = () => {
    searchPanelRef.current?.open();
  };

  const firstSlug =
    items.find(i => i.acessivel && !i.estudada)?.modulo_slug ||
    items.find(i => i.acessivel)?.modulo_slug;

  const highlightFilters = setupMode === 'setup';

  return (
    <div className={cn(DASHBOARD_PAGE_ROOT, 'bg-[#010409]', pageBottomPadding)}>
      <div className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.08)] bg-[#010409]/95 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md supports-[backdrop-filter]:bg-[#010409]/90">
        <div className="bg-transparent px-6 py-5 md:px-10">
          <div className="mx-auto max-w-6xl">
            <button
              type="button"
              onClick={() => router.push('/cadernos')}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
            >
              <ArrowLeft size={14} aria-hidden /> Meus cadernos
            </button>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <BookMarked size={18} className="text-cyan-400" aria-hidden />
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Caderno</p>
                </div>
                <h1 className="text-3xl font-black italic tracking-tight text-white">{caderno.title}</h1>
                {caderno.description && <p className="mt-0.5 text-sm text-slate-400">{caderno.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <motion.span
                    animate={
                      headerPulse
                        ? { scale: [1, 1.08, 1], color: ['#94a3b8', '#67e8f9', '#94a3b8'] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-xs font-bold text-slate-400"
                  >
                    <Layers size={11} className="mr-1 inline" aria-hidden />
                    {items.length} {items.length === 1 ? 'questão' : 'questões'}
                  </motion.span>
                  {firstItemTip.visible ? (
                    <button
                      type="button"
                      onClick={() => {
                        firstItemTip.markSeen();
                        if (firstSlug) {
                          router.push(`/estudar/${firstSlug}?from=caderno&caderno_id=${caderno.id}`);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200 transition-colors hover:bg-cyan-500/15"
                    >
                      <Zap size={10} aria-hidden />
                      Próximo passo: estudar
                    </button>
                  ) : null}
                  {metricsSlot}
                </div>
              </div>

              {firstSlug ? (
                <Link
                  href={`/estudar/${firstSlug}?from=caderno&caderno_id=${caderno.id}`}
                  onClick={() => firstItemTip.markSeen()}
                  className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-950/40 transition-all hover:bg-cyan-600"
                >
                  <Play size={15} aria-hidden /> ESTUDAR COM NEUROSLIDES
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo: lista + painel de busca */}
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-10 md:pt-8">
        <AnimatePresence>
          {setupBannerVisible && items.length > 0 && firstSlug ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-white">Caderno pronto!</p>
                  <p className="text-xs text-slate-400">
                    {items.length} {items.length === 1 ? 'questão adicionada' : 'questões adicionadas'} — comece pelo estudo reverso.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/estudar/${firstSlug}?from=caderno&caderno_id=${caderno.id}`}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-cyan-500 px-4 text-xs font-black uppercase tracking-widest text-slate-950 transition-colors hover:bg-cyan-400"
                >
                  Estudar com NeuroSlides
                </Link>
                <button
                  type="button"
                  onClick={() => setSetupBannerVisible(false)}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="flex min-h-[70vh] flex-col gap-6 lg:flex-row">
          {/* Coluna esquerda: itens do caderno */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {reverseStudyBadgeSlot}
            <p className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Questões no caderno ({items.length})
            </p>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[rgba(255,255,255,0.15)] bg-[#0d1117] px-6 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                  <BookOpen size={28} className="text-cyan-300" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-300">Nenhuma questão ainda</p>
                  <p className="mx-auto max-w-xs text-xs text-slate-400">
                    Busque na vitrine ou use a sugestão rápida da banca do seu edital.
                  </p>
                </div>

                {editalBanca && modulos.length > 0 && quickAddBatch.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => void handleQuickAddBanca()}
                    disabled={quickAdding}
                    className="inline-flex min-h-[44px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-[rgba(0,242,255,0.08)] px-4 py-3 text-xs font-black uppercase tracking-widest text-cyan-200 transition-colors hover:bg-[rgba(0,242,255,0.12)] disabled:opacity-60"
                  >
                    {quickAdding ? (
                      <>
                        <Loader2 size={14} className="animate-spin" aria-hidden />
                        Adicionando…
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} aria-hidden />
                        Adicionar {quickAddBatch.length} questões de {editalBanca}
                      </>
                    )}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={openSearchPanel}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition-colors hover:bg-cyan-400"
                >
                  <Search size={14} aria-hidden />
                  Inserir questões
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((item, i) => (
                    <ItemCaderno
                      key={item.id}
                      item={item}
                      index={i}
                      notebookId={caderno.id}
                      onRemoved={handleRemoved}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <SearchPanelToggle
            modulosCount={modulos.length}
            panelRef={searchPanelRef}
            initialOpen={setupMode === 'setup'}
          >
            {filterPrefsReady ? (
              <BuilderPanel
                modulos={modulos}
                notebookId={caderno.id}
                onAdded={handleAdded}
                onAddedMany={handleAddedMany}
                initialBancas={initialBancas}
                initialAssuntos={initialAssuntos}
                highlightFilters={highlightFilters}
              />
            ) : (
              <div className="flex min-h-[12rem] items-center justify-center rounded-3xl border border-white/10 bg-[#0d1117] p-6">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" aria-hidden />
              </div>
            )}
          </SearchPanelToggle>
        </div>
      </div>
    </div>
  );
}
