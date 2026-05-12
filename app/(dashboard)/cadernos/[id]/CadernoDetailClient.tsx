'use client';

import { useState, useMemo, useEffect } from 'react';
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
  X,
  BookMarked,
  ChevronDown,
} from 'lucide-react';
import type { CadernoDetail, ModuloDisponivel, NotebookItem } from './page';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FILTER_ALL_VALUE,
  SELECT_CONTENT_DARK,
  SELECT_ITEM_DARK,
  SELECT_TRIGGER_DARK_PANEL,
} from '@/components/dashboard/dashboard-select-dark';

const FILTER_ALL = FILTER_ALL_VALUE;

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
}: {
  modulos: ModuloDisponivel[];
  notebookId: string;
  onAdded: (item: NotebookItem) => void;
  onAddedMany: (items: NotebookItem[]) => void;
}) {
  const [busca, setBusca] = useState('');
  const [filtroTopico, setFiltroTopico] = useState('');
  const [filtroBanca, setFiltroBanca] = useState('');
  const [adding, setAdding] = useState<string | null>(null);
  const [addingLote, setAddingLote] = useState(false);
  const [filtrosMontados, setFiltrosMontados] = useState(false);

  useEffect(() => {
    setFiltrosMontados(true);
  }, []);

  const topicos = useMemo(() => {
    const set = new Set<string>();
    modulos.forEach(m => { if (m.titulo_aula) set.add(m.titulo_aula); });
    return Array.from(set).sort();
  }, [modulos]);

  const bancas = useMemo(() => {
    const set = new Set<string>();
    modulos.forEach(m => { if (m.banca) set.add(m.banca); });
    return Array.from(set).sort();
  }, [modulos]);

  /** Todos os módulos que batem com busca + assunto + banca (sem teto de 50). */
  const filtradosCompletos = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const soNumero = q.replace(/^q-?/, '');
    return modulos.filter(m => {
      const matchCodigo =
        m.avant_codigo != null &&
        (String(m.avant_codigo) === soNumero || `q-${m.avant_codigo}`.includes(q));
      const matchBusca = !q
        || matchCodigo
        || m.titulo_aula?.toLowerCase().includes(q)
        || m.modulo_nome?.toLowerCase().includes(q)
        || m.banca?.toLowerCase().includes(q)
        || m.modulo_slug.toLowerCase().includes(q);
      const matchTopico = !filtroTopico || m.titulo_aula === filtroTopico;
      const matchBanca = !filtroBanca || m.banca === filtroBanca;
      return matchBusca && matchTopico && matchBanca;
    });
  }, [modulos, busca, filtroTopico, filtroBanca]);

  const filtrados = useMemo(
    () => filtradosCompletos.slice(0, 50),
    [filtradosCompletos],
  );

  /** Evita “adicionar tudo do catálogo” sem nenhum critério. */
  const criterioLoteAtivo =
    Boolean(filtroTopico) || Boolean(filtroBanca) || busca.trim().length > 0;

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
    <div className="flex h-full flex-col rounded-3xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117]">
      <div className="space-y-3 border-b border-[rgba(255,255,255,0.08)] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">Adicionar questões</p>

        {/* Busca */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Assunto, banca, slug ou Q-…"
            className="w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#010409] py-2.5 pl-9 pr-10 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          />
          {busca && (
            <button type="button" onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={13} className="text-slate-500 hover:text-slate-300" aria-hidden />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {filtrosMontados ? (
            <>
              <Select
                value={filtroTopico || FILTER_ALL}
                onValueChange={(v) => setFiltroTopico(v === FILTER_ALL ? '' : v)}
              >
                <SelectTrigger className={SELECT_TRIGGER_DARK_PANEL}>
                  <SelectValue placeholder="Todos os assuntos" />
                </SelectTrigger>
                <SelectContent position="item-aligned" className={SELECT_CONTENT_DARK}>
                  <SelectItem value={FILTER_ALL} className={SELECT_ITEM_DARK}>
                    Todos os assuntos
                  </SelectItem>
                  {topicos.map((t) => (
                    <SelectItem key={t} value={t} className={SELECT_ITEM_DARK}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filtroBanca || FILTER_ALL}
                onValueChange={(v) => setFiltroBanca(v === FILTER_ALL ? '' : v)}
              >
                <SelectTrigger className={SELECT_TRIGGER_DARK_PANEL}>
                  <SelectValue placeholder="Todas as bancas" />
                </SelectTrigger>
                <SelectContent position="item-aligned" className={SELECT_CONTENT_DARK}>
                  <SelectItem value={FILTER_ALL} className={SELECT_ITEM_DARK}>
                    Todas as bancas
                  </SelectItem>
                  {bancas.map((b) => (
                    <SelectItem key={b} value={b} className={SELECT_ITEM_DARK}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <div
                className="flex h-11 min-w-0 w-full items-center justify-between rounded-xl border border-[rgba(255,255,255,0.15)] bg-[#0d1117] px-3 py-2 text-sm text-slate-400"
                aria-hidden
              >
                <span className="line-clamp-1">Todos os assuntos</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              </div>
              <div
                className="flex h-11 min-w-0 w-full items-center justify-between rounded-xl border border-[rgba(255,255,255,0.15)] bg-[#0d1117] px-3 py-2 text-sm text-slate-400"
                aria-hidden
              >
                <span className="line-clamp-1">Todas as bancas</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              </div>
            </>
          )}
        </div>

        {criterioLoteAtivo && filtradosCompletos.length > 0 && (
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
            {filtradosCompletos.length > 50 && (
              <p className="mt-1.5 text-center text-[10px] font-bold text-slate-400">
                Lista abaixo mostra 50; o lote inclui as {filtradosCompletos.length} do filtro.
              </p>
            )}
          </div>
        )}

        {!criterioLoteAtivo && modulos.length > 0 && (
          <p className="text-[10px] leading-relaxed text-slate-400">
            Escolha um <strong className="text-slate-300">assunto</strong> e/ou{' '}
            <strong className="text-slate-300">banca</strong> ou use a
            <strong className="text-slate-300"> busca</strong> para ativar a opção de adicionar o lote inteiro de
            uma vez.
          </p>
        )}
      </div>

      {/* Resultados */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {filtrados.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {busca || filtroTopico || filtroBanca ? 'Nenhum resultado' : 'Todas as questões já estão no caderno'}
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

// ── Componente principal ───────────────────────────────────────────────────
export default function CadernoDetailClient({
  caderno,
  modulosDisponiveis: inicial,
}: {
  caderno: CadernoDetail;
  modulosDisponiveis: ModuloDisponivel[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(caderno.items);
  const [modulos, setModulos] = useState(inicial);

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
    setItems(prev => [...prev, item]);
    setModulos(prev => prev.filter(m => m.modulo_slug !== item.modulo_slug));
  };

  const handleAddedMany = (novos: NotebookItem[]) => {
    if (novos.length === 0) return;
    const slugs = new Set(novos.map(i => i.modulo_slug));
    setItems(prev => [...prev, ...novos]);
    setModulos(prev => prev.filter(m => !slugs.has(m.modulo_slug)));
  };

  const estudadas = items.filter(i => i.estudada).length;
  const firstSlug = items.find(i => !i.estudada)?.modulo_slug || items[0]?.modulo_slug;

  return (
    <div className="min-h-screen bg-[#010409] pb-24 pb-safe">
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
                  <span className="text-xs font-bold text-slate-400">
                    <Layers size={11} className="mr-1 inline" aria-hidden />
                    {items.length} {items.length === 1 ? 'questão' : 'questões'}
                  </span>
                  {items.length > 0 && (
                    <span className="text-xs font-bold text-emerald-400">
                      <CheckCircle2 size={11} className="mr-1 inline" aria-hidden />
                      {estudadas}/{items.length} estudadas
                    </span>
                  )}
                </div>
              </div>

              {firstSlug && (
                <Link
                  href={`/estudar/${firstSlug}?from=caderno&caderno_id=${caderno.id}`}
                  className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-950/40 transition-all hover:bg-cyan-600"
                >
                  <Play size={15} aria-hidden /> Estudar caderno
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo: 2 colunas */}
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-10 md:pt-8">
        <div className="grid min-h-[70vh] grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Coluna esquerda: itens do caderno */}
          <div className="flex flex-col gap-3">
            <p className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Questões no caderno ({items.length})
            </p>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center space-y-3 rounded-3xl border border-dashed border-[rgba(255,255,255,0.15)] bg-[#0d1117] py-16 text-center">
                <BookOpen size={32} className="text-slate-500" aria-hidden />
                <p className="text-sm font-bold text-slate-400">Nenhuma questão ainda</p>
                <p className="max-w-xs text-xs text-slate-400">
                  Use o painel ao lado para buscar e adicionar questões ao caderno.
                </p>
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

          {/* Coluna direita: builder */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-160px)]">
            <p className="mb-3 px-1 text-xs font-black uppercase tracking-widest text-slate-500">
              Buscar questões ({modulos.length} disponíveis)
            </p>
            <div className="h-[calc(100%-28px)]">
              <BuilderPanel
                modulos={modulos}
                notebookId={caderno.id}
                onAdded={handleAdded}
                onAddedMany={handleAddedMany}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
