'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Search, Plus, Trash2,
  CheckCircle2, Circle, BookOpen, Layers,
  ChevronRight, Loader2, X, BookMarked,
} from 'lucide-react';
import type { CadernoDetail, ModuloDisponivel, NotebookItem } from './page';

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
      const res = await fetch(`/api/notebooks/${notebookId}/items/${item.id}`, { method: 'DELETE' });
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
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all group ${
        item.estudada
          ? 'bg-emerald-50 border-emerald-100'
          : 'bg-white border-slate-200 hover:border-indigo-200'
      }`}
    >
      {/* Número */}
      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 transition-colors">
        <span className="text-[11px] font-black text-slate-500">{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Status estudada */}
      <div className="shrink-0">
        {item.estudada
          ? <CheckCircle2 size={16} className="text-emerald-500" />
          : <Circle size={16} className="text-slate-300" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          {item.topico || 'Questão'}
        </p>
        <p className="text-sm font-bold text-slate-800 truncate">
          {item.titulo_aula || item.modulo_slug}
        </p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/estudar/${item.modulo_slug}?from=caderno&caderno_id=${notebookId}`}
          className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
          title="Estudar questão"
        >
          <Play size={13} className="text-indigo-600" />
        </Link>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 flex items-center justify-center transition-colors disabled:opacity-50"
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
}: {
  modulos: ModuloDisponivel[];
  notebookId: string;
  onAdded: (item: NotebookItem) => void;
}) {
  const [busca, setBusca] = useState('');
  const [filtroTopico, setFiltroTopico] = useState('');
  const [filtroBanca, setFiltroBanca] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

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

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase();
    return modulos.filter(m => {
      const matchBusca = !q
        || m.titulo_aula?.toLowerCase().includes(q)
        || m.modulo_nome?.toLowerCase().includes(q)
        || m.banca?.toLowerCase().includes(q)
        || m.modulo_slug.toLowerCase().includes(q);
      const matchTopico = !filtroTopico || m.titulo_aula === filtroTopico;
      const matchBanca = !filtroBanca || m.banca === filtroBanca;
      return matchBusca && matchTopico && matchBanca;
    }).slice(0, 50);
  }, [modulos, busca, filtroTopico, filtroBanca]);

  const handleAdd = async (m: ModuloDisponivel) => {
    setAdding(m.modulo_slug);
    try {
      const res = await fetch(`/api/notebooks/${notebookId}/items`, {
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
        onAdded({ ...json.item, estudada: false });
      }
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Adicionar questões
        </p>

        {/* Busca */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por assunto ou banca…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-700 placeholder:text-slate-300"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Filtros — coluna no mobile (evita texto cortado nos selects nativos) */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            value={filtroTopico}
            onChange={e => setFiltroTopico(e.target.value)}
            title="Filtrar por assunto"
            aria-label="Filtrar por assunto"
            className="w-full sm:flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">Todos os assuntos</option>
            {topicos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filtroBanca}
            onChange={e => setFiltroBanca(e.target.value)}
            title="Filtrar por banca"
            aria-label="Filtrar por banca"
            className="w-full sm:flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">Todas as bancas</option>
            {bancas.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtrados.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {busca || filtroTopico || filtroBanca ? 'Nenhum resultado' : 'Todas as questões já estão no caderno'}
          </div>
        ) : (
          filtrados.map(m => (
            <button
              key={m.modulo_slug}
              onClick={() => handleAdd(m)}
              disabled={adding === m.modulo_slug}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors text-left group disabled:opacity-60"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
                  {m.banca || ''} {m.modulo_nome ? `— ${m.modulo_nome}` : ''}
                </p>
                <p className="text-xs font-bold text-slate-700 truncate">
                  {m.titulo_aula || m.modulo_slug}
                </p>
              </div>
              <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                {adding === m.modulo_slug
                  ? <Loader2 size={12} className="text-indigo-500 animate-spin" />
                  : <Plus size={12} className="text-slate-500 group-hover:text-indigo-600" />
                }
              </div>
            </button>
          ))
        )}
      </div>

      {modulos.length > 0 && filtrados.length === 50 && (
        <p className="text-center text-[10px] text-slate-400 font-bold p-3">
          Mostrando 50 de {modulos.length} — refine a busca
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
        },
        ...prev,
      ]);
    }
  };

  const handleAdded = (item: NotebookItem) => {
    setItems(prev => [...prev, item]);
    setModulos(prev => prev.filter(m => m.modulo_slug !== item.modulo_slug));
  };

  const estudadas = items.filter(i => i.estudada).length;
  const firstSlug = items.find(i => !i.estudada)?.modulo_slug || items[0]?.modulo_slug;

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/cadernos')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Meus Cadernos
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookMarked size={18} className="text-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Caderno</p>
              </div>
              <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900">{caderno.title}</h1>
              {caderno.description && (
                <p className="text-sm text-slate-500 mt-0.5">{caderno.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-bold text-slate-400">
                  <Layers size={11} className="inline mr-1" />
                  {items.length} {items.length === 1 ? 'questão' : 'questões'}
                </span>
                {items.length > 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    <CheckCircle2 size={11} className="inline mr-1" />
                    {estudadas}/{items.length} estudadas
                  </span>
                )}
              </div>
            </div>

            {firstSlug && (
              <Link
                href={`/estudar/${firstSlug}?from=caderno&caderno_id=${caderno.id}`}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <Play size={15} /> Estudar caderno
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo: 2 colunas */}
      <div className="max-w-6xl mx-auto px-6 py-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[70vh]">

          {/* Coluna esquerda: itens do caderno */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
              Questões no caderno ({items.length})
            </p>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-slate-200">
                <BookOpen size={32} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-400">Nenhuma questão ainda</p>
                <p className="text-xs text-slate-400 max-w-xs">
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 mb-3">
              Buscar questões ({modulos.length} disponíveis)
            </p>
            <div className="h-[calc(100%-28px)]">
              <BuilderPanel
                modulos={modulos}
                notebookId={caderno.id}
                onAdded={handleAdded}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
