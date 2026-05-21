'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2, UserMinus, UserPlus } from 'lucide-react';

type ConcursoHeader = { id: string; slug: string; nome: string };

type MatriculaRow = {
  userId: string;
  email: string;
  origem: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
};

export default function AdminConcursoMatriculasPage() {
  const params = useParams();
  const concursoId = typeof params.id === 'string' ? params.id : '';

  const [concurso, setConcurso] = useState<ConcursoHeader | null>(null);
  const [matriculas, setMatriculas] = useState<MatriculaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [emailBusca, setEmailBusca] = useState('');
  const [nomeNovo, setNomeNovo] = useState('');
  const [emailNovo, setEmailNovo] = useState('');
  const [filtroLista, setFiltroLista] = useState('');
  const [resolvedUserId, setResolvedUserId] = useState('');

  const carregar = useCallback(async () => {
    if (!concursoId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas`, {
        credentials: 'same-origin',
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao carregar');
      setConcurso(payload.concurso ?? null);
      setMatriculas(payload.matriculas ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erro ao carregar');
      setConcurso(null);
      setMatriculas([]);
    } finally {
      setLoading(false);
    }
  }, [concursoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const matriculasFiltradas = useMemo(() => {
    const q = filtroLista.trim().toLowerCase();
    if (!q) return matriculas;
    return matriculas.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        m.userId.toLowerCase().includes(q) ||
        m.origem.toLowerCase().includes(q),
    );
  }, [matriculas, filtroLista]);

  async function resolverUsuario() {
    setMessage(null);
    const email = emailBusca.trim();
    if (!email) {
      setMessage('Informe o e-mail do aluno.');
      return;
    }
    try {
      const res = await fetch('/api/admin/resolve-user', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Usuário não encontrado');
      setResolvedUserId(payload.userId);
      setMessage(`Usuário encontrado: ${email}`);
    } catch (e) {
      setResolvedUserId('');
      setMessage(e instanceof Error ? e.message : 'Erro ao resolver usuário');
    }
  }

  async function criarUsuarioEMatricular() {
    const email = emailNovo.trim();
    if (!email || !concursoId) {
      setMessage('Informe o e-mail do novo aluno.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas/criar-usuario`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome: nomeNovo.trim() || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao criar usuário');
      setMessage(
        typeof payload.message === 'string'
          ? payload.message
          : 'Conta criada e matrícula registrada.',
      );
      setEmailNovo('');
      setNomeNovo('');
      await carregar();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  }

  async function matricularGratis() {
    if (!resolvedUserId || !concursoId) {
      setMessage('Resolva o usuário pelo e-mail antes de matricular.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resolvedUserId,
          concursoId,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha na matrícula');
      setMessage('Matrícula gratuita registrada (origem: admin, sem expiração).');
      setResolvedUserId('');
      setEmailBusca('');
      await carregar();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erro na matrícula');
    } finally {
      setSaving(false);
    }
  }

  async function excluirMatricula(userId: string, email: string) {
    if (!concursoId) return;
    if (
      !window.confirm(
        `Excluir permanentemente a matrícula de ${email} neste concurso?\n\nO registro será removido do Supabase. Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao excluir');
      setMessage('Matrícula excluída do Supabase.');
      await carregar();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erro ao excluir matrícula');
    } finally {
      setSaving(false);
    }
  }

  async function revogar(userId: string) {
    if (!concursoId) return;
    if (!window.confirm('Revogar acesso deste usuário a este concurso? (status: expirado)')) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao revogar');
      setMessage('Acesso revogado.');
      await carregar();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erro ao revogar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/admin/concursos"
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black text-slate-900">Matrículas do concurso</h1>
          {concurso ? (
            <p className="truncate text-sm text-slate-500">
              {concurso.nome} · <span className="font-mono">{concurso.slug}</span>
            </p>
          ) : loading ? (
            <p className="text-sm text-slate-400">Carregando…</p>
          ) : (
            <p className="text-sm text-rose-600">Concurso não encontrado.</p>
          )}
        </div>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="mb-10 rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-black text-slate-900">Criar conta e matricular</h2>
        <p className="mb-4 text-sm text-slate-600">
          Cria o usuário no Auth (se o e-mail ainda não existir) e já matricula neste concurso. O aluno define a
          senha em <span className="font-semibold">Esqueci a senha</span> no login.
        </p>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">E-mail</label>
            <input
              type="email"
              value={emailNovo}
              onChange={(e) => setEmailNovo(e.target.value)}
              placeholder="novo@email.com"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Nome (opcional)
            </label>
            <input
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              placeholder="Nome completo"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            />
          </div>
          <button
            type="button"
            disabled={saving || !emailNovo.trim()}
            onClick={() => void criarUsuarioEMatricular()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Criar conta e matricular
          </button>
        </div>
      </section>

      <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-black text-slate-900">Matricular usuário existente</h2>
        <p className="mb-4 text-sm text-slate-500">
          Para quem já tem conta. Origem <span className="font-mono">admin</span>, sem expiração. Não exige Stripe.
        </p>
        <div className="grid gap-4">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            E-mail do usuário
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={emailBusca}
              onChange={(e) => {
                setEmailBusca(e.target.value);
                setResolvedUserId('');
              }}
              placeholder="aluno@email.com"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3"
            />
            <button
              type="button"
              onClick={() => void resolverUsuario()}
              className="shrink-0 rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-800 hover:bg-slate-50"
            >
              Buscar usuário
            </button>
          </div>
          {resolvedUserId ? (
            <p className="text-xs font-mono text-emerald-700">
              user_id: {resolvedUserId}
            </p>
          ) : null}
          <p className="text-xs text-slate-400">
            O concurso desta página já está fixo na URL. Não é necessário escolher outro no formulário.
          </p>
          <button
            type="button"
            disabled={saving || !resolvedUserId}
            onClick={() => void matricularGratis()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Matricular gratuitamente
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Matriculados</h2>
        <div className="mb-4">
          <input
            type="search"
            value={filtroLista}
            onChange={(e) => setFiltroLista(e.target.value)}
            placeholder="Filtrar por e-mail, UUID ou origem…"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando lista…
          </div>
        ) : matriculasFiltradas.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma matrícula neste filtro.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {matriculasFiltradas.map((m) => (
              <li
                key={m.userId}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{m.email}</p>
                  <p className="font-mono text-xs text-slate-400">{m.userId}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Origem: <span className="font-semibold">{m.origem}</span> · Status:{' '}
                    <span className="font-semibold">{m.status}</span>
                    {m.expiresAt ? (
                      <>
                        {' '}
                        · Expira: {new Date(m.expiresAt).toLocaleString('pt-BR')}
                      </>
                    ) : (
                      ' · Sem expiração'
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {m.status === 'ativo' ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void revogar(m.userId)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                    >
                      <UserMinus className="h-4 w-4" />
                      Revogar acesso
                    </button>
                  ) : (
                    <span className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Expirado
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void excluirMatricula(m.userId, m.email)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir matrícula
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
