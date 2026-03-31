'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked, Plus, ChevronRight, BookOpen,
  Clock, Layers, X, Loader2, Trash2,
} from 'lucide-react';
import type { NotebookSummary } from './page';

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `há ${dias} dias`;
}

interface NovoModalProps {
  onClose: () => void;
  onCreated: (c: NotebookSummary) => void;
}

function NovoModal({ onClose, onCreated }: NovoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) { setError('Digite um nome para o caderno.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Erro ao criar caderno.'); return; }
      onCreated({ ...json.notebook, itemCount: 0 });
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-[1000] italic tracking-tighter text-slate-900">Novo caderno</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Nome *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Ex: Fisiologia Humana"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Descrição (opcional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Questões de enfermagem — EBSERH"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
            />
          </div>
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Criar
          </button>
        </div>
      </motion.div>
    </div>
  );
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
      const res = await fetch(`/api/notebooks/${caderno.id}`, { method: 'DELETE' });
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
  const router = useRouter();
  const [cadernos, setCadernos] = useState(inicial);
  const [showModal, setShowModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<NotebookSummary | null>(null);

  const handleCreated = (novo: NotebookSummary) => {
    setCadernos(prev => [novo, ...prev]);
    setShowModal(false);
    router.push(`/cadernos/${novo.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 md:px-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Meus Cadernos</p>
            <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900">Cadernos de Estudo</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={15} /> Novo caderno
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 md:px-10">
        {cadernos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <BookMarked size={36} className="text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-[1000] italic tracking-tighter text-slate-900">Nenhum caderno ainda</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                Crie seu primeiro caderno e adicione as questões que quiser estudar em sequência.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Plus size={15} /> Criar primeiro caderno
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {cadernos.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-stretch gap-2"
              >
                <Link
                  href={`/cadernos/${c.id}`}
                  className="flex flex-1 min-w-0 items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
                    <BookMarked size={22} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{c.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Layers size={10} /> {c.itemCount} {c.itemCount === 1 ? 'questão' : 'questões'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Clock size={10} /> {tempoRelativo(c.updated_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(c)}
                  title="Excluir caderno"
                  className="shrink-0 w-12 self-stretch rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}

            <div className="flex justify-center pt-4">
              <Link
                href="/estudar"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <BookOpen size={15} /> Ir para a Vitrine
              </Link>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <NovoModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
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
