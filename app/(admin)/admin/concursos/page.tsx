'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';

interface ConcursoRow {
  id: string;
  slug: string;
  nome: string;
  cidade: string | null;
  orgao: string | null;
  banca: string | null;
  ano: number | null;
  cargo: string | null;
  tipo: 'geral' | 'edital';
  status: 'rascunho' | 'ativo' | 'arquivado';
}

export default function AdminConcursosPage() {
  const [concursos, setConcursos] = useState<ConcursoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '',
    nome: '',
    cidade: '',
    orgao: '',
    banca: '',
    ano: '',
    cargo: '',
    tipo: 'edital' as 'geral' | 'edital',
    status: 'rascunho' as 'rascunho' | 'ativo' | 'arquivado',
  });
  const [matricula, setMatricula] = useState({
    email: '',
    concursoId: '',
    userId: '',
  });
  const [moduloLink, setModuloLink] = useState({
    concursoId: '',
    moduloId: '',
  });
  const [regra, setRegra] = useState({
    concursoId: '',
    banca: '',
    orgao: '',
    ano: '',
  });

  async function loadConcursos() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/concursos', { credentials: 'same-origin' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao carregar concursos');
      setConcursos(payload.concursos ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar concursos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConcursos();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/concursos', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug.trim(),
          nome: form.nome.trim(),
          cidade: form.cidade.trim() || undefined,
          orgao: form.orgao.trim() || undefined,
          banca: form.banca.trim() || undefined,
          ano: form.ano ? Number(form.ano) : undefined,
          cargo: form.cargo.trim() || undefined,
          tipo: form.tipo,
          status: form.status,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao criar concurso');
      setForm({
        slug: '',
        nome: '',
        cidade: '',
        orgao: '',
        banca: '',
        ano: '',
        cargo: '',
        tipo: 'edital',
        status: 'rascunho',
      });
      setMessage('Concurso criado.');
      await loadConcursos();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar concurso');
    } finally {
      setSaving(false);
    }
  }

  async function handleResolveUser() {
    setMessage(null);
    try {
      const res = await fetch('/api/admin/resolve-user', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: matricula.email.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Usuário não encontrado');
      setMatricula((prev) => ({ ...prev, userId: payload.userId }));
      setMessage(`Usuário resolvido: ${matricula.email.trim()}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao resolver usuário');
    }
  }

  async function handleModuloLink() {
    if (!moduloLink.concursoId || !moduloLink.moduloId.trim()) {
      setMessage('Selecione o concurso e informe o ID do módulo.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${moduloLink.concursoId}/modulos`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduloId: moduloLink.moduloId.trim(),
          origem: 'manual',
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao vincular módulo');
      setMessage('Módulo vinculado ao concurso.');
      setModuloLink((prev) => ({ ...prev, moduloId: '' }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao vincular módulo');
    } finally {
      setSaving(false);
    }
  }

  async function handleRegraModulos() {
    if (!regra.concursoId || !regra.banca.trim()) {
      setMessage('Selecione o concurso e informe a banca.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${regra.concursoId}/modulos/regra`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banca: regra.banca.trim(),
          orgao: regra.orgao.trim() || undefined,
          ano: regra.ano ? Number(regra.ano) : undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao aplicar regra');
      setMessage(`Regra aplicada. ${payload.linkedCount ?? 0} módulo(s) vinculado(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao aplicar regra');
    } finally {
      setSaving(false);
    }
  }

  async function handleMatricula() {
    if (!matricula.userId || !matricula.concursoId) {
      setMessage('Resolva o usuário e selecione o concurso.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${matricula.concursoId}/matriculas`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: matricula.userId,
          concursoId: matricula.concursoId,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha na matrícula');
      setMessage('Matrícula registrada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro na matrícula');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Concursos e matrículas</h1>
            <p className="text-sm text-slate-500">Pacotes por edital, vínculo de publicação e matrícula manual.</p>
          </div>
        </div>
        <Link
          href="/admin/concursos/builder"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black uppercase tracking-wide text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          Builder visual →
        </Link>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Novo concurso</h2>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="slug-do-edital"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            required
            value={form.nome}
            onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
            placeholder="Nome do concurso"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            value={form.cidade}
            onChange={(e) => setForm((prev) => ({ ...prev, cidade: e.target.value }))}
            placeholder="Cidade"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            value={form.orgao}
            onChange={(e) => setForm((prev) => ({ ...prev, orgao: e.target.value }))}
            placeholder="Órgão"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            value={form.banca}
            onChange={(e) => setForm((prev) => ({ ...prev, banca: e.target.value }))}
            placeholder="Banca"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            value={form.ano}
            onChange={(e) => setForm((prev) => ({ ...prev, ano: e.target.value }))}
            placeholder="Ano"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <select
            value={form.tipo}
            onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value as 'geral' | 'edital' }))}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="edital">Edital</option>
            <option value="geral">Geral</option>
          </select>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as 'rascunho' | 'ativo' | 'arquivado',
              }))
            }
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="rascunho">Rascunho</option>
            <option value="ativo">Ativo</option>
            <option value="arquivado">Arquivado</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="md:col-span-2 rounded-2xl bg-slate-900 px-4 py-3 font-black uppercase tracking-widest text-white"
          >
            {saving ? 'Salvando…' : 'Criar concurso'}
          </button>
        </form>
      </section>

      <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Matrícula manual</h2>
        <p className="mb-4 text-sm text-slate-500">
          Para <strong>listar matriculados</strong> e <strong>revogar acesso</strong>, abra a página do concurso em{' '}
          <span className="font-mono text-slate-700">/admin/concursos/[id]/matriculas</span> (link em cada concurso na
          lista abaixo). Aqui você pode matricular em um passo sem abrir essa página.
        </p>
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={matricula.email}
            onChange={(e) => setMatricula((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="E-mail do aluno"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <button
            type="button"
            onClick={handleResolveUser}
            className="rounded-2xl border border-slate-200 px-4 py-3 font-bold"
          >
            Resolver usuário
          </button>
          <select
            value={matricula.concursoId}
            onChange={(e) => setMatricula((prev) => ({ ...prev, concursoId: e.target.value }))}
            className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
          >
            <option value="">Selecione o concurso</option>
            {concursos.map((concurso) => (
              <option key={concurso.id} value={concurso.id}>
                {concurso.nome} ({concurso.slug})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleMatricula}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black uppercase tracking-widest text-white md:col-span-2"
          >
            <UserPlus className="h-4 w-4" />
            Matricular
          </button>
        </div>
      </section>

      <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Vincular módulo manualmente</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={moduloLink.concursoId}
            onChange={(e) => setModuloLink((prev) => ({ ...prev, concursoId: e.target.value }))}
            className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
          >
            <option value="">Selecione o concurso</option>
            {concursos.map((concurso) => (
              <option key={concurso.id} value={concurso.id}>
                {concurso.nome} ({concurso.slug})
              </option>
            ))}
          </select>
          <input
            value={moduloLink.moduloId}
            onChange={(e) => setModuloLink((prev) => ({ ...prev, moduloId: e.target.value }))}
            placeholder="UUID do módulo (modulos_estudo.id)"
            className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
          />
          <button
            type="button"
            onClick={handleModuloLink}
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-3 font-black uppercase tracking-widest text-white md:col-span-2"
          >
            Vincular módulo
          </button>
        </div>
      </section>

      <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Incluir por regra</h2>
        <p className="mb-4 text-sm text-slate-500">
          Materializa vínculos por banca e, opcionalmente, órgão/ano em `conteudo_json.meta`.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={regra.concursoId}
            onChange={(e) => setRegra((prev) => ({ ...prev, concursoId: e.target.value }))}
            className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
          >
            <option value="">Selecione o concurso</option>
            {concursos.map((concurso) => (
              <option key={concurso.id} value={concurso.id}>
                {concurso.nome} ({concurso.slug})
              </option>
            ))}
          </select>
          <input
            value={regra.banca}
            onChange={(e) => setRegra((prev) => ({ ...prev, banca: e.target.value }))}
            placeholder="Banca"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            value={regra.orgao}
            onChange={(e) => setRegra((prev) => ({ ...prev, orgao: e.target.value }))}
            placeholder="Órgão (opcional)"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            value={regra.ano}
            onChange={(e) => setRegra((prev) => ({ ...prev, ano: e.target.value }))}
            placeholder="Ano (opcional)"
            className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
          />
          <button
            type="button"
            onClick={handleRegraModulos}
            disabled={saving}
            className="rounded-2xl bg-indigo-600 px-4 py-3 font-black uppercase tracking-widest text-white md:col-span-2"
          >
            Aplicar regra
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Concursos cadastrados</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando…
          </div>
        ) : (
          <div className="space-y-3">
            {concursos.map((concurso) => (
              <div
                key={concurso.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-slate-900">{concurso.nome}</p>
                  <p className="text-xs text-slate-500">
                    {concurso.slug} · {concurso.tipo} · {concurso.status}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/concursos/${concurso.id}/matriculas`}
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700"
                  >
                    Matrículas
                  </Link>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {concurso.banca || 'Sem banca'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
