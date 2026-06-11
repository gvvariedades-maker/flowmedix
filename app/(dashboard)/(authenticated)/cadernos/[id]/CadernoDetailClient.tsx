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
          ? 'border-amber-200 bg-amber-50 opacity-90'
          : item.estudada
            ? 'border-green-200 bg-green-50'
            : 'border-slate-200 bg-white hover:border-[rgba(143,224,32,0.3)]',
      )}
    >
      {/* Número */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
        <span className="text-[11px] font-bold text-slate-500">{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Status estudada */}
      <div className="shrink-0">
        {item.estudada
          ? <CheckCircle2 size={16} className="text-green-600" />
          : <Circle size={16} className="text-slate-300" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {item.topico || 'Questão'}
          </p>
          {formatAvantCodigo(item.avant_codigo) && (
            <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-600">
              {formatAvantCodigo(item.avant_codigo)}
            </span>
          )}
        </div>
        <p className="truncate text-sm font-bold text-slate-800">{item.titulo_aula || item.modulo_slug}</p>
        {!item.acessivel ? (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-amber-700">
            Fora do seu pacote
          </p>
        ) : null}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        {item.acessivel ? (
          <Link
            href={`/estudar/${item.modulo_slug}?from=caderno&caderno_id=${notebookId}`}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.10)] transition-colors hover:bg-[rgba(143,224,32,0.16)]"
            title="Estudar questão"
          >
            <Play size={13} className="text-[#3d6b0f]" />
          </Link>
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50"
            title="Questão fora do pacote matriculado"
          >
            <Play size={13} className="text-amber-600/70" />
          </span>
        )}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
          title="Remover do caderno"
        >
          {removing
            ? <Loader2 size={13} className="text-slate-400 animate-spin" />
            : <Trash2 size={13} className="text-slate-400 transition-colors hover:text-red-600" />
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
    <div className="card-elevated flex min-h-0 flex-1 flex-col max-lg:h-auto max-lg:flex-none">
      <div className="shrink-0 space-y-3 border-b border-slate-200 p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Adicionar questões</p>

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
                <div className="border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={handleAddLote}
                    disabled={addingLote}
                    className="btn-editorial-outline flex w-full items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
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
                    <p className="mt-1.5 text-center text-[10px] font-bold text-slate-500">
                      Lista abaixo mostra 50; o lote inclui as {filtradosCompletos.length} do filtro.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {!criterioLoteAtivo && modulos.length > 0 ? (
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Escolha um <strong className="text-slate-700">assunto</strong> e/ou{' '}
                  <strong className="text-slate-700">banca</strong> ou use a{' '}
                  <strong className="text-slate-700">busca</strong> para ativar a opção de adicionar o lote inteiro de
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
          <div className="text-center py-8 text-slate-500 text-sm">
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
              className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {m.banca || ''} {m.modulo_nome ? `— ${m.modulo_nome}` : ''}
                  </p>
                  {formatAvantCodigo(m.avant_codigo) && (
                    <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 font-mono text-[8px] font-bold text-slate-600">
                      {formatAvantCodigo(m.avant_codigo)}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-bold text-slate-700">{m.titulo_aula || m.modulo_slug}</p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-[rgba(143,224,32,0.12)]">
                {adding === m.modulo_slug ? (
                  <Loader2 size={12} className="animate-spin text-[#3d6b0f]" aria-hidden />
                ) : (
                  <Plus size={12} className="text-slate-500 transition-colors group-hover:text-[#3d6b0f]" aria-hidden />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {modulos.length > 0 && filtradosCompletos.length > 50 && filtrados.length === 50 && (
        <p className="p-3 text-center text-[10px] font-bold text-slate-500">
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
    <div className={cn(DASHBOARD_PAGE_ROOT, 'bg-background', pageBottomPadding)}>
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="bg-transparent px-6 py-5 md:px-10">
          <div className="mx-auto max-w-6xl">
            <button
              type="button"
              onClick={() => router.push('/cadernos')}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-700"
            >
              <ArrowLeft size={14} aria-hidden /> Meus cadernos
            </button>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <BookMarked size={18} className="text-[#3d6b0f]" aria-hidden />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#3d6b0f]">Caderno</p>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{caderno.title}</h1>
                {caderno.description && <p className="mt-0.5 text-sm text-slate-500">{caderno.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <motion.span
                    animate={
                      headerPulse
                        ? { scale: [1, 1.08, 1], color: ['#64748b', '#3d6b0f', '#64748b'] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-xs font-bold text-slate-500"
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
                      className="inline-flex items-center gap-1 rounded-full border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.10)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3d6b0f] transition-colors hover:bg-[rgba(143,224,32,0.14)]"
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
                  className="btn-editorial-primary flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  <Play size={15} aria-hidden /> Estudar com NeuroSlides
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
              className="mb-6 flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-slate-900">Caderno pronto!</p>
                  <p className="text-xs text-slate-600">
                    {items.length} {items.length === 1 ? 'questão adicionada' : 'questões adicionadas'} — comece pelo estudo reverso.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/estudar/${firstSlug}?from=caderno&caderno_id=${caderno.id}`}
                  className="btn-editorial-primary inline-flex min-h-[40px] items-center justify-center px-4 text-xs font-bold"
                >
                  Estudar com NeuroSlides
                </Link>
                <button
                  type="button"
                  onClick={() => setSetupBannerVisible(false)}
                  className="btn-editorial-outline inline-flex min-h-[40px] items-center justify-center px-3 text-xs font-semibold"
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
              <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(143,224,32,0.25)] bg-[rgba(143,224,32,0.10)]">
                  <BookOpen size={28} className="text-[#3d6b0f]" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Nenhuma questão ainda</p>
                  <p className="mx-auto max-w-xs text-xs text-slate-500">
                    Busque na vitrine ou use a sugestão rápida da banca do seu edital.
                  </p>
                </div>

                {editalBanca && modulos.length > 0 && quickAddBatch.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => void handleQuickAddBanca()}
                    disabled={quickAdding}
                    className="btn-editorial-outline inline-flex min-h-[44px] w-full max-w-sm items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
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
                  className="btn-editorial-primary inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest"
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
              <div className="card-elevated flex min-h-[12rem] items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-[#3d6b0f]" aria-hidden />
              </div>
            )}
          </SearchPanelToggle>
        </div>
      </div>
    </div>
  );
}
