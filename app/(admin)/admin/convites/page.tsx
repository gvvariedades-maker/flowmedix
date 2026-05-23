'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  Gift,
  Loader2,
  Ban,
  Plus,
} from 'lucide-react';

import { invitePublicPath, type InviteLinkPublicStatus } from '@/lib/invite/shared';

type InviteLinkRow = {
  id: string;
  token: string;
  label: string | null;
  pro_days: number;
  link_expires_at: string;
  max_uses: number;
  use_count: number;
  revoked_at: string | null;
  created_by: string | null;
  created_at: string;
  status: InviteLinkPublicStatus;
  invitePath: string;
  inviteUrl: string;
};

const STATUS_LABEL: Record<InviteLinkPublicStatus, string> = {
  active: 'Ativo',
  revoked: 'Revogado',
  expired: 'Expirado',
  exhausted: 'Esgotado',
};

const PRO_PRESETS = [7, 14, 30] as const;
const LINK_PRESETS = [14, 30] as const;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso),
  );
}

export default function AdminConvitesPage() {
  const [links, setLinks] = useState<InviteLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [proDays, setProDays] = useState(14);
  const [linkValidDays, setLinkValidDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [label, setLabel] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/invite-links', { credentials: 'same-origin' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao carregar');
      setLinks(payload.links ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function criarLink(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/invite-links', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pro_days: proDays,
          link_valid_days: linkValidDays,
          max_uses: maxUses,
          label: label.trim() || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao criar');
      setMessage('Link criado. Copie a URL abaixo.');
      setLabel('');
      await load();
      const created = payload.link as InviteLinkRow;
      if (created?.id) {
        await copiarUrl(created);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar');
    } finally {
      setCreating(false);
    }
  }

  async function revogar(id: string) {
    if (!confirm('Revogar este link? Quem ainda não resgatou não poderá usar.')) return;
    setRevokingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invite-links/${id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao revogar');
      setMessage('Link revogado.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao revogar');
    } finally {
      setRevokingId(null);
    }
  }

  async function copiarUrl(link: InviteLinkRow) {
    const url =
      link.inviteUrl ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}${link.invitePath || invitePublicPath(link.token)}`
        : link.invitePath || invitePublicPath(link.token));
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Não foi possível copiar. Copie manualmente da lista.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-black uppercase italic text-slate-500 hover:text-[#4F46E5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>

        <header>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F46E5] text-white">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">
                Links de <span className="text-[#4F46E5]">convite</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Pro temporário por link — diferente de matrícula manual por e-mail (sem Pro
                ilimitado).
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            {message}
          </p>
        ) : null}

        <form
          onSubmit={criarLink}
          className="space-y-5 rounded-[32px] border-[1.5px] border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]"
        >
          <h2 className="font-black italic uppercase text-slate-900">Novo convite</h2>

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Dias de Pro (após resgate)
            </p>
            <div className="flex flex-wrap gap-2">
              {PRO_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setProDays(d)}
                  className={`rounded-xl px-3 py-2 text-xs font-black uppercase italic ${
                    proDays === d
                      ? 'bg-[#4F46E5] text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {d}d Pro
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={proDays}
              onChange={(e) => setProDays(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold"
            />
          </div>

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Validade do link (dias)
            </p>
            <div className="flex flex-wrap gap-2">
              {LINK_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setLinkValidDays(d)}
                  className={`rounded-xl px-3 py-2 text-xs font-black uppercase italic ${
                    linkValidDays === d
                      ? 'bg-slate-900 text-[#BEF264]'
                      : 'border border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {d}d link
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={90}
              value={linkValidDays}
              onChange={(e) => setLinkValidDays(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Usos máximos
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Rótulo (opcional)
              </label>
              <input
                type="text"
                maxLength={200}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Beta março"
                className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-black uppercase italic text-[#BEF264] disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Gerar link
          </button>
        </form>

        <section className="space-y-3">
          <h2 className="font-black italic uppercase text-slate-900">Links criados</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
            </div>
          ) : links.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
              Nenhum convite ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {links.map((link) => (
                <li
                  key={link.id}
                  className="rounded-[24px] border-2 border-slate-200 bg-white p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-black italic uppercase text-slate-900">
                        {link.label || `${link.pro_days}d Pro`}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {STATUS_LABEL[link.status]} · {link.use_count}/{link.max_uses} usos · Pro{' '}
                        {link.pro_days}d
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Link até {formatDate(link.link_expires_at)}
                      </p>
                    </div>
                    {link.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => void revogar(link.id)}
                        disabled={revokingId === link.id}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-[10px] font-black uppercase italic text-rose-700 disabled:opacity-50"
                      >
                        {revokingId === link.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Ban className="h-3 w-3" />
                        )}
                        Revogar
                      </button>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
                      {link.inviteUrl || link.invitePath}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copiarUrl(link)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#4F46E5] px-3 py-2 text-[10px] font-black uppercase italic text-white"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copiar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
