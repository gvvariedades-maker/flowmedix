'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ConcursoCreateSchema } from '@/lib/validations';
import type { AdminConcursoListItem } from '@/lib/cache';
import type { Concurso, ConcursoModuloOrigem } from '@/types/database';
import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';
import {
  createConcurso,
  linkModulo,
  loadConcursoComModulos,
  searchModulos,
  unlinkModulo,
  updateConcurso,
} from './actions';
import { Loader2 } from 'lucide-react';

type Vinculo = { origem: ConcursoModuloOrigem; modulo: ModuloEstudoListRow };

function slugifyFromNome(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DEBOUNCE_MS = 350;

type FormState = {
  slug: string;
  nome: string;
  cidade: string;
  orgao: string;
  banca: string;
  ano: string;
  cargo: string;
  tipo: 'geral' | 'edital';
  descricao: string;
  destaque: string;
  priceReais: string;
  dataProva: string;
};

const emptyForm = (): FormState => ({
  slug: '',
  nome: '',
  cidade: '',
  orgao: '',
  banca: '',
  ano: '',
  cargo: '',
  tipo: 'edital',
  descricao: '',
  destaque: '',
  priceReais: '',
  dataProva: '',
});

function concursoToForm(c: Concurso): FormState {
  const priceReais =
    c.price_cents != null && Number.isFinite(c.price_cents)
      ? (c.price_cents / 100).toFixed(2).replace('.', ',')
      : '';
  return {
    slug: c.slug,
    nome: c.nome,
    cidade: c.cidade ?? '',
    orgao: c.orgao ?? '',
    banca: c.banca ?? '',
    ano: c.ano != null ? String(c.ano) : '',
    cargo: c.cargo ?? '',
    tipo: c.tipo,
    descricao: c.descricao ?? '',
    destaque: c.destaque ?? '',
    priceReais,
    dataProva: c.data_prova ?? '',
  };
}

function parsePriceCents(raw: string): number | null | undefined {
  const t = raw.trim();
  if (!t) return null;
  const normalized = t.replace(/\s/g, '').replace(',', '.');
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

export default function ConcursoBuilder({ concursos }: { concursos: AdminConcursoListItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [mode, setMode] = useState<'new' | 'edit'>('new');
  const [step, setStep] = useState<1 | 2>(1);
  const [concursoId, setConcursoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const slugTouchedRef = useRef(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [vinculos, setVinculos] = useState<Vinculo[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ModuloEstudoListRow[]>([]);

  const selectOptions = useMemo(
    () => [...concursos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [concursos],
  );

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(searchInput.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedQ.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    void (async () => {
      const res = await searchModulos({ q: debouncedQ });
      if (cancelled) return;
      setSearching(false);
      if (res.ok) {
        setResults(res.modulos);
      } else {
        setResults([]);
        setError(res.error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const refreshList = useCallback(() => {
    router.refresh();
  }, [router]);

  const loadExisting = useCallback((id: string) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await loadConcursoComModulos({ concursoId: id });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setConcursoId(res.concurso.id);
      setForm(concursoToForm(res.concurso));
      slugTouchedRef.current = true;
      setVinculos(res.vinculos);
      setStep(1);
    });
  }, []);

  function resetNovo() {
    setMode('new');
    setConcursoId(null);
    setForm(emptyForm());
    slugTouchedRef.current = false;
    setVinculos([]);
    setStep(1);
    setError(null);
    setMessage(null);
    setSearchInput('');
    setResults([]);
  }

  function onPickConcurso(id: string) {
    if (!id) {
      resetNovo();
      return;
    }
    setMode('edit');
    loadExisting(id);
  }

  function onNomeChange(value: string) {
    setForm((prev) => {
      const next = { ...prev, nome: value };
      if (mode === 'new' && !slugTouchedRef.current) {
        next.slug = slugifyFromNome(value);
      }
      return next;
    });
  }

  function onSlugChange(value: string) {
    slugTouchedRef.current = true;
    setForm((prev) => ({ ...prev, slug: value }));
  }

  function buildCreatePayload() {
    const slugParsed = ConcursoCreateSchema.shape.slug.safeParse(form.slug.trim());
    if (!slugParsed.success) {
      setError(slugParsed.error.issues[0]?.message ?? 'Slug inválido');
      return null;
    }
    const price_cents = parsePriceCents(form.priceReais);
    if (price_cents === undefined) {
      setError('Preço inválido. Use número positivo ou deixe em branco.');
      return null;
    }

    let data_prova: string | null | undefined = form.dataProva.trim() || undefined;
    if (data_prova === '') data_prova = undefined;

    return {
      slug: slugParsed.data,
      nome: form.nome.trim(),
      cidade: form.cidade.trim() || undefined,
      orgao: form.orgao.trim() || undefined,
      banca: form.banca.trim() || undefined,
      ano: form.ano.trim() ? Number(form.ano) : undefined,
      cargo: form.cargo.trim() || undefined,
      tipo: form.tipo,
      descricao: form.descricao.trim() || undefined,
      destaque: form.destaque.trim() || undefined,
      price_cents,
      data_prova,
    };
  }

  function buildUpdatePayload() {
    if (!concursoId) return null;
    const price_cents = parsePriceCents(form.priceReais);
    if (price_cents === undefined) {
      setError('Preço inválido. Use número positivo ou deixe em branco.');
      return null;
    }
    return {
      concursoId,
      nome: form.nome.trim(),
      cidade: form.cidade.trim() || undefined,
      orgao: form.orgao.trim() || undefined,
      banca: form.banca.trim() || undefined,
      ano: form.ano.trim() ? Number(form.ano) : undefined,
      cargo: form.cargo.trim() || undefined,
      tipo: form.tipo,
      descricao: form.descricao.trim() || undefined,
      destaque: form.destaque.trim() || undefined,
      price_cents,
      data_prova: form.dataProva.trim() || null,
    };
  }

  function handleSaveDados(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === 'new' && !concursoId) {
      const payload = buildCreatePayload();
      if (!payload) return;
      startTransition(async () => {
        const res = await createConcurso(payload);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setMode('edit');
        setConcursoId(res.concurso.id);
        setForm(concursoToForm(res.concurso));
        slugTouchedRef.current = true;
        setMessage('Concurso criado como rascunho. Vincule módulos no passo 2.');
        setStep(2);
        refreshList();
      });
      return;
    }

    const patch = buildUpdatePayload();
    if (!patch) return;
    startTransition(async () => {
      const res = await updateConcurso(patch);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setForm(concursoToForm(res.concurso));
      setMessage('Dados salvos.');
      refreshList();
    });
  }

  function handleLink(modulo: ModuloEstudoListRow) {
    if (!concursoId) {
      setError('Salve o concurso antes de vincular módulos.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await linkModulo({
        concursoId,
        moduloId: modulo.id,
        origem: 'manual',
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setVinculos((prev) => {
        if (prev.some((v) => v.modulo.id === modulo.id)) return prev;
        return [...prev, { origem: 'manual', modulo }];
      });
      setMessage('Módulo vinculado.');
      refreshList();
    });
  }

  function handleUnlink(moduloId: string) {
    if (!concursoId) return;
    setError(null);
    startTransition(async () => {
      const res = await unlinkModulo({ concursoId, moduloId });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setVinculos((prev) => prev.filter((v) => v.modulo.id !== moduloId));
      setMessage('Vínculo removido.');
      refreshList();
    });
  }

  const canGoStep2 = Boolean(concursoId);
  const slugReadOnly = mode === 'edit' && Boolean(concursoId);

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Builder visual</h2>
          <p className="text-sm text-slate-500">
            Passo 1: dados do edital. Passo 2: busca com debounce e vínculos; desvincular aplica na hora.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('new');
              resetNovo();
            }}
            className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide ${
              mode === 'new' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-800'
            }`}
          >
            Novo
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="builder-concurso" className="text-xs font-semibold text-slate-500">
              Editar
            </label>
            <select
              id="builder-concurso"
              value={mode === 'edit' && concursoId ? concursoId : ''}
              onChange={(e) => onPickConcurso(e.target.value)}
              className="min-w-[200px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">— selecionar —</option>
              {selectOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.slug})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            step === 1 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          1 · Dados
        </button>
        <button
          type="button"
          disabled={!canGoStep2}
          onClick={() => setStep(2)}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            step === 2 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          2 · Módulos
        </button>
      </div>

      {message ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-900">{error}</div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={handleSaveDados} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => onSlugChange(e.target.value)}
              readOnly={slugReadOnly}
              required={!slugReadOnly}
              placeholder="slug-do-edital"
              className={`w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm ${
                slugReadOnly ? 'bg-slate-50 text-slate-600' : ''
              }`}
            />
            {slugReadOnly ? (
              <p className="mt-1 text-xs text-slate-400">Slug não pode ser alterado após criação.</p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Nome</label>
            <input
              required
              value={form.nome}
              onChange={(e) => onNomeChange(e.target.value)}
              placeholder="Nome do concurso"
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Cidade</label>
            <input
              value={form.cidade}
              onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Órgão</label>
            <input
              value={form.orgao}
              onChange={(e) => setForm((p) => ({ ...p, orgao: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Banca</label>
            <input
              value={form.banca}
              onChange={(e) => setForm((p) => ({ ...p, banca: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Ano</label>
            <input
              value={form.ano}
              onChange={(e) => setForm((p) => ({ ...p, ano: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Cargo</label>
            <input
              value={form.cargo}
              onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as 'geral' | 'edital' }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="edital">Edital</option>
              <option value="geral">Geral</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Preço (BRL)</label>
            <input
              value={form.priceReais}
              onChange={(e) => setForm((p) => ({ ...p, priceReais: e.target.value }))}
              placeholder="37,00 ou vazio"
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Data da prova</label>
            <input
              type="date"
              value={form.dataProva}
              onChange={(e) => setForm((p) => ({ ...p, dataProva: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Destaque</label>
            <input
              value={form.destaque}
              onChange={(e) => setForm((p) => ({ ...p, destaque: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-black uppercase tracking-widest text-white disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === 'new' && !concursoId ? 'Criar concurso' : 'Salvar dados'}
            </button>
            {canGoStep2 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800"
              >
                Ir para módulos →
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Buscar módulos (debounce {DEBOUNCE_MS} ms)
            </label>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Título, slug, banca…"
              className="w-full max-w-xl rounded-xl border border-slate-200 px-4 py-3"
            />
            <p className="mt-1 text-xs text-slate-400">A busca dispara após pausar a digitação.</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Resultados</p>
            {searching ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando…
              </div>
            ) : results.length === 0 ? (
              <p className="text-sm text-slate-500">{debouncedQ ? 'Nenhum módulo encontrado.' : 'Digite para buscar.'}</p>
            ) : (
              <ul className="space-y-2">
                {results.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{m.titulo_aula || m.modulo_nome || m.modulo_slug}</p>
                      <p className="text-xs text-slate-500">
                        {m.modulo_slug} · {m.banca}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLink(m)}
                      disabled={pending}
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50"
                    >
                      Vincular
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vinculados ao concurso (desvincular imediato)
            </p>
            {vinculos.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum módulo vinculado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {vinculos.map((v) => (
                  <li
                    key={v.modulo.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {v.modulo.titulo_aula || v.modulo.modulo_nome || v.modulo.modulo_slug}
                      </p>
                      <p className="text-xs text-slate-500">
                        {v.modulo.modulo_slug} · origem: {v.origem}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnlink(v.modulo.id)}
                      disabled={pending}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-800 disabled:opacity-50"
                    >
                      Desvincular
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            ← Voltar aos dados
          </button>
        </div>
      )}
    </section>
  );
}
