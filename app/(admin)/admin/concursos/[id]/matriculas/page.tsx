'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  X,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';

type ConcursoHeader = { id: string; slug: string; nome: string };

type MatriculaRow = {
  userId: string;
  email: string;
  origem: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
};

type AdminBanner = {
  variant: 'success' | 'error' | 'info';
  title: string;
  detail?: string;
};

type WelcomeRowFeedback =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'success'; email: string; resendId: string | null; sentAt: string }
  | { status: 'error'; detail: string };

type WelcomeToast = {
  variant: 'loading' | 'success' | 'error';
  title: string;
  detail: string;
  email: string;
};

export default function AdminConcursoMatriculasPage() {
  const params = useParams();
  const concursoId = typeof params.id === 'string' ? params.id : '';

  const [concurso, setConcurso] = useState<ConcursoHeader | null>(null);
  const [matriculas, setMatriculas] = useState<MatriculaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<AdminBanner | null>(null);
  const [welcomeFeedback, setWelcomeFeedback] = useState<Record<string, WelcomeRowFeedback>>({});
  const [welcomeToast, setWelcomeToast] = useState<WelcomeToast | null>(null);
  const [welcomeSendingUserId, setWelcomeSendingUserId] = useState<string | null>(null);
  const welcomeRowRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const [emailBusca, setEmailBusca] = useState('');
  const [nomeNovo, setNomeNovo] = useState('');
  const [emailNovo, setEmailNovo] = useState('');
  const [emailsLote, setEmailsLote] = useState('');
  const [filtroLista, setFiltroLista] = useState('');
  const [resolvedUserId, setResolvedUserId] = useState('');

  function showStatus(variant: AdminBanner['variant'], title: string, detail?: string) {
    setBanner({ variant, title, detail });
  }

  const carregar = useCallback(async () => {
    if (!concursoId) return;
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas`, {
        credentials: 'same-origin',
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao carregar');
      setConcurso(payload.concurso ?? null);
      setMatriculas(payload.matriculas ?? []);
    } catch (e) {
      showStatus('error', 'Erro ao carregar lista', e instanceof Error ? e.message : undefined);
      setConcurso(null);
      setMatriculas([]);
    } finally {
      setLoading(false);
    }
  }, [concursoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (welcomeToast?.variant !== 'success') return;
    const t = window.setTimeout(() => setWelcomeToast(null), 12_000);
    return () => window.clearTimeout(t);
  }, [welcomeToast]);

  useEffect(() => {
    for (const [userId, fb] of Object.entries(welcomeFeedback)) {
      if (fb.status === 'success' || fb.status === 'error') {
        welcomeRowRefs.current[userId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        break;
      }
    }
  }, [welcomeFeedback]);

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
    setBanner(null);
    const email = emailBusca.trim();
    if (!email) {
      showStatus('info', 'Informe o e-mail do aluno.');
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
      showStatus('success', 'Usuário encontrado', email);
    } catch (e) {
      setResolvedUserId('');
      showStatus('error', 'Erro ao resolver usuário', e instanceof Error ? e.message : undefined);
    }
  }

  function parseEmailsLote(raw: string): string[] {
    const parts = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return [...new Set(parts)];
  }

  async function criarUsuarioEMatricular() {
    const email = emailNovo.trim();
    if (!email || !concursoId) {
      showStatus('info', 'Informe o e-mail do novo aluno.');
      return;
    }
    setSaving(true);
    setBanner(null);
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
      showStatus(
        'success',
        'Conta criada',
        typeof payload.message === 'string'
          ? payload.message
          : 'Matrícula registrada no concurso.',
      );
      setEmailNovo('');
      setNomeNovo('');
      await carregar();
    } catch (e) {
      showStatus('error', 'Erro ao criar usuário', e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function liberarAcessoEmLote() {
    const emails = parseEmailsLote(emailsLote);
    if (!emails.length || !concursoId) {
      showStatus('info', 'Cole ao menos um e-mail (um por linha ou separados por vírgula).');
      return;
    }
    setSaving(true);
    setBanner(null);
    const ok: string[] = [];
    const falhas: string[] = [];
    try {
      for (const email of emails) {
        try {
          const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas/criar-usuario`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.error || 'Falha');
          ok.push(email);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Erro';
          falhas.push(`${email}: ${msg}`);
        }
      }
      if (ok.length) {
        setEmailsLote('');
        await carregar();
      }
      const resumo = `${ok.length} e-mail(s) com acesso liberado.`;
      showStatus(
        falhas.length ? 'error' : 'success',
        falhas.length ? 'Lote com falhas' : 'Lote concluído',
        falhas.length ? `${resumo} Falhas: ${falhas.slice(0, 5).join(' · ')}${falhas.length > 5 ? '…' : ''}` : resumo,
      );
    } finally {
      setSaving(false);
    }
  }

  async function matricularGratis() {
    if (!resolvedUserId || !concursoId) {
      showStatus('info', 'Resolva o usuário pelo e-mail antes de matricular.');
      return;
    }
    setSaving(true);
    setBanner(null);
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
      showStatus('success', 'Matrícula registrada', 'Origem admin, sem expiração.');
      setResolvedUserId('');
      setEmailBusca('');
      await carregar();
    } catch (e) {
      showStatus('error', 'Erro na matrícula', e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function excluirMatricula(userId: string, email: string, deleteAccount: boolean) {
    if (!concursoId) return;
    if (deleteAccount) {
      if (
        !window.confirm(
          `Excluir a CONTA de ${email}?\n\nRemove o usuário do Auth (matrículas, histórico e cadernos em cascade). O e-mail poderá ser usado de novo no cadastro grátis.\n\nEsta ação não pode ser desfeita.`,
        )
      ) {
        return;
      }
    } else if (
      !window.confirm(
        `Remover só a matrícula de ${email} neste concurso?\n\nA conta no Auth continua existindo — o e-mail NÃO poderá se cadastrar de novo. Para permitir recadastro, use «Excluir conta».`,
      )
    ) {
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, deleteAccount }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao excluir');
      showStatus(
        'success',
        deleteAccount ? 'Conta excluída' : 'Matrícula excluída',
        typeof payload.message === 'string' ? payload.message : undefined,
      );
      await carregar();
    } catch (e) {
      showStatus('error', 'Erro ao excluir', e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function reenviarBoasVindas(userId: string, email: string) {
    setWelcomeSendingUserId(userId);
    setWelcomeFeedback((prev) => ({ ...prev, [userId]: { status: 'sending' } }));
    setWelcomeToast({
      variant: 'loading',
      title: 'Enviando boas-vindas…',
      detail: email,
      email,
    });

    try {
      const res = await fetch('/api/admin/resend-welcome', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const raw = await res.text();
      let payload: Record<string, unknown> = {};
      if (raw.trim()) {
        try {
          payload = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          payload = { error: raw.slice(0, 240) || 'Resposta inválida do servidor' };
        }
      }

      const sentOk =
        res.ok &&
        (payload.sent === true ||
          (payload.ok === true && typeof payload.error !== 'string'));

      if (!sentOk) {
        const detail =
          (typeof payload.error === 'string' && payload.error) ||
          (typeof payload.message === 'string' && payload.message) ||
          `Falha ao enviar (HTTP ${res.status})`;
        setWelcomeFeedback((prev) => ({
          ...prev,
          [userId]: { status: 'error', detail },
        }));
        setWelcomeToast({
          variant: 'error',
          title: 'Boas-vindas não enviado',
          detail,
          email,
        });
        showStatus('error', 'Boas-vindas não enviado', `${email}: ${detail}`);
        return;
      }

      const destino = typeof payload.email === 'string' ? payload.email : email;
      const sentAt =
        typeof payload.sentAt === 'string' ? payload.sentAt : new Date().toISOString();
      const resendId = typeof payload.resendId === 'string' ? payload.resendId : null;
      const horario = new Date(sentAt).toLocaleString('pt-BR');
      const idResend = resendId
        ? `ID Resend: ${resendId}`
        : 'Confira também o painel Resend se o e-mail não chegar.';

      setWelcomeFeedback((prev) => ({
        ...prev,
        [userId]: {
          status: 'success',
          email: destino,
          resendId,
          sentAt,
        },
      }));
      setWelcomeToast({
        variant: 'success',
        title: 'E-mail enviado',
        detail: `${destino} · ${horario}. ${idResend}`,
        email: destino,
      });
      showStatus('success', 'E-mail de boas-vindas enviado', `Para ${destino} em ${horario}. ${idResend}`);
    } catch (e) {
      const detail = e instanceof Error ? e.message : 'Erro ao reenviar e-mail';
      setWelcomeFeedback((prev) => ({
        ...prev,
        [userId]: { status: 'error', detail },
      }));
      setWelcomeToast({
        variant: 'error',
        title: 'Boas-vindas não enviado',
        detail,
        email,
      });
      showStatus('error', 'Boas-vindas não enviado', `${email}: ${detail}`);
    } finally {
      setWelcomeSendingUserId(null);
    }
  }

  async function revogar(userId: string) {
    if (!concursoId) return;
    if (!window.confirm('Revogar acesso deste usuário a este concurso? (status: expirado)')) return;
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/concursos/${concursoId}/matriculas`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao revogar');
      showStatus('success', 'Acesso revogado');
      await carregar();
    } catch (e) {
      showStatus('error', 'Erro ao revogar', e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/admin"
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100"
          title="Voltar ao painel admin"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black text-slate-900">Liberar acesso por e-mail</h1>
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

      {banner ? (
        <div
          className={`mb-6 flex gap-3 rounded-2xl border px-4 py-3 text-sm ${
            banner.variant === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : banner.variant === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-950'
                : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
          role="status"
          aria-live="polite"
        >
          {banner.variant === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          ) : banner.variant === 'error' ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
          ) : (
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
          )}
          <div className="min-w-0">
            <p className="font-black">{banner.title}</p>
            {banner.detail ? (
              <p className="mt-1 font-medium leading-relaxed">{banner.detail}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="mb-10 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-black text-slate-900">Vários e-mails de uma vez</h2>
        <p className="mb-4 text-sm text-slate-600">
          Cole uma lista (um e-mail por linha ou separados por vírgula). Para cada endereço: cria a conta se não
          existir e libera o acesso neste pacote.
        </p>
        <textarea
          value={emailsLote}
          onChange={(e) => setEmailsLote(e.target.value)}
          placeholder={'aluno1@email.com\naluno2@email.com'}
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm"
        />
        <button
          type="button"
          disabled={saving || !emailsLote.trim()}
          onClick={() => void liberarAcessoEmLote()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-black uppercase tracking-widest text-white disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          Liberar acesso em lote
        </button>
      </section>

      <section className="mb-10 rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-black text-slate-900">Um e-mail — criar conta e matricular</h2>
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

        {welcomeToast ? (
          <div
            role="alert"
            aria-live="assertive"
            className={`mb-4 flex gap-3 rounded-2xl border-2 px-4 py-3 text-sm ${
              welcomeToast.variant === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                : welcomeToast.variant === 'error'
                  ? 'border-rose-300 bg-rose-50 text-rose-950'
                  : 'border-cyan-300 bg-cyan-50 text-cyan-950'
            }`}
          >
            {welcomeToast.variant === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            ) : welcomeToast.variant === 'error' ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
            ) : (
              <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-cyan-600" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-black">{welcomeToast.title}</p>
              <p className="mt-1 font-medium leading-relaxed">{welcomeToast.detail}</p>
            </div>
          </div>
        ) : null}

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
            {matriculasFiltradas.map((m) => {
              const welcome = welcomeFeedback[m.userId] ?? { status: 'idle' as const };
              const welcomeSending =
                welcome.status === 'sending' || welcomeSendingUserId === m.userId;

              return (
              <li
                key={m.userId}
                ref={(el) => {
                  welcomeRowRefs.current[m.userId] = el;
                }}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
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
                  {welcome.status === 'sending' ? (
                    <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-cyan-800">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      Enviando boas-vindas…
                    </p>
                  ) : null}
                  {welcome.status === 'success' ? (
                    <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
                      <span className="flex items-center gap-1.5 font-black">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Enviado para {welcome.email}
                      </span>
                      <span className="mt-1 block text-emerald-800/90">
                        {new Date(welcome.sentAt).toLocaleString('pt-BR')}
                        {welcome.resendId ? ` · ${welcome.resendId}` : ''}
                      </span>
                    </p>
                  ) : null}
                  {welcome.status === 'error' ? (
                    <p className="mt-2 flex items-start gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-900">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span>
                        <span className="font-black">Não enviado:</span> {welcome.detail}
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={welcomeSending}
                    onClick={() => void reenviarBoasVindas(m.userId, m.email)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-900 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {welcomeSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Mail className="h-4 w-4" aria-hidden />
                    )}
                    {welcomeSending ? 'Enviando…' : 'Reenviar boas-vindas'}
                  </button>
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
                    onClick={() => void excluirMatricula(m.userId, m.email, false)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Só matrícula
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void excluirMatricula(m.userId, m.email, true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir conta
                  </button>
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </section>

      {welcomeToast ? (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed inset-x-4 bottom-6 z-[200] mx-auto flex max-w-lg gap-3 rounded-2xl border-2 px-4 py-4 shadow-2xl ${
            welcomeToast.variant === 'success'
              ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
              : welcomeToast.variant === 'error'
                ? 'border-rose-400 bg-rose-50 text-rose-950'
                : 'border-cyan-400 bg-cyan-50 text-cyan-950'
          }`}
        >
          {welcomeToast.variant === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
          ) : welcomeToast.variant === 'error' ? (
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" aria-hidden />
          ) : (
            <Loader2 className="mt-0.5 h-6 w-6 shrink-0 animate-spin text-cyan-600" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-black">{welcomeToast.title}</p>
            <p className="mt-1 text-sm font-medium leading-relaxed">{welcomeToast.detail}</p>
          </div>
          <button
            type="button"
            onClick={() => setWelcomeToast(null)}
            className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-black/5"
            aria-label="Fechar aviso"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
