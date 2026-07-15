'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Mail,
  Megaphone,
  Save,
  Send,
} from 'lucide-react';

import type { EmailTemplateContent } from '@/lib/email/templateContent';

type TemplateRow = {
  slug: string;
  kind: 'transactional' | 'marketing';
  name: string;
  subject: string;
  preview_text: string;
  content: EmailTemplateContent;
  updated_at: string;
};

type ConcursoOption = { id: string; nome: string; slug: string };

const EMPTY_CONTENT: EmailTemplateContent = {
  headline: '',
  paragraph1: '',
  paragraph2: '',
  ctaLabel: '',
  ctaUrl: '',
};

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('welcome');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [content, setContent] = useState<EmailTemplateContent>(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [concursos, setConcursos] = useState<ConcursoOption[]>([]);
  const [audience, setAudience] = useState<'test_me' | 'emails' | 'concurso_matriculas'>('test_me');
  const [emailList, setEmailList] = useState('');
  const [concursoId, setConcursoId] = useState('');

  const selected = templates.find((t) => t.slug === selectedSlug);
  const isMarketing = selected?.kind === 'marketing';

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/email-templates', { credentials: 'same-origin' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao carregar');
      const list = (payload.templates ?? []) as TemplateRow[];
      setTemplates(list);
      if (list.length && !list.some((t) => t.slug === selectedSlug)) {
        setSelectedSlug(list[0].slug);
      }
    } catch (e) {
      setMessage({
        type: 'err',
        text: e instanceof Error ? e.message : 'Erro ao carregar templates',
      });
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSlug]);

  const loadTemplateDetail = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/email-templates/${slug}`, {
        credentials: 'same-origin',
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao carregar template');
      const t = payload.template as TemplateRow;
      setSubject(t.subject);
      setPreviewText(t.preview_text);
      setContent(t.content);
    } catch (e) {
      setMessage({
        type: 'err',
        text: e instanceof Error ? e.message : 'Erro ao carregar template',
      });
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
    void fetch('/api/admin/concursos', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((p) => {
        const rows = (p.concursos ?? p ?? []) as ConcursoOption[];
        setConcursos(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setConcursos([]));
  }, [loadTemplates]);

  useEffect(() => {
    if (selectedSlug) void loadTemplateDetail(selectedSlug);
  }, [selectedSlug, loadTemplateDetail]);

  function draftPayload() {
    return {
      subject: subject.trim(),
      preview_text: previewText.trim(),
      content,
    };
  }

  async function salvarTemplate() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedSlug}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload()),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao salvar');
      setMessage({ type: 'ok', text: payload.message ?? 'Template salvo.' });
      await loadTemplates();
    } catch (e) {
      setMessage({
        type: 'err',
        text: e instanceof Error ? e.message : 'Erro ao salvar',
      });
    } finally {
      setSaving(false);
    }
  }

  async function enviarPreview() {
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedSlug}/test`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload()),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha no preview');
      setMessage({
        type: 'ok',
        text: payload.message ?? `Preview enviado para ${payload.email}`,
      });
    } catch (e) {
      setMessage({
        type: 'err',
        text: e instanceof Error ? e.message : 'Erro no preview',
      });
    } finally {
      setTesting(false);
    }
  }

  async function enviarMarketing() {
    if (!isMarketing) return;
    if (
      audience !== 'test_me' &&
      !window.confirm(
        'Confirmar envio da campanha de marketing? Esta ação envia e-mails reais aos destinatários.',
      )
    ) {
      return;
    }

    setSending(true);
    setMessage(null);
    try {
      const emails =
        audience === 'emails'
          ? emailList
              .split(/[\n,;]+/)
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      const res = await fetch('/api/admin/email-send/marketing', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_slug: selectedSlug,
          ...draftPayload(),
          audience,
          emails,
          concurso_id: audience === 'concurso_matriculas' ? concursoId : undefined,
          confirm: true,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha no envio');
      setMessage({
        type: payload.failed ? 'err' : 'ok',
        text: payload.message ?? `Enviados: ${payload.sent}`,
      });
    } catch (e) {
      setMessage({
        type: 'err',
        text: e instanceof Error ? e.message : 'Erro ao enviar campanha',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 sm:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-black uppercase italic text-slate-500 hover:text-[#4F46E5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>

        <header>
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">
            E-mails <span className="text-[#4F46E5]">AVANT enf</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Edite textos de boas-vindas e campanhas de marketing. Layout e cores permanecem no
            template visual do app.
          </p>
        </header>

        {message ? (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
              message.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {message.text}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
          </div>
        ) : (
          <>
            <section className="rounded-[32px] border-2 border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-black italic uppercase">
                <Mail className="h-5 w-5 text-[#4F46E5]" />
                Editar template
              </h2>

              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                Template
              </label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                {templates.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.kind === 'transactional' ? 'transacional' : 'marketing'})
                  </option>
                ))}
              </select>

              {selectedSlug === 'welcome' ? (
                <p className="text-xs text-slate-500">
                  Use <code className="rounded bg-slate-100 px-1">{'{{firstName}}'}</code> no título
                  (ex.: Olá, {'{{firstName}}'}!). Sem nome no cadastro, o AVANT enf usa «técnico de
                  enfermagem». Este template é usado no cadastro e em «Reenviar boas-vindas».
                </p>
              ) : null}

              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                Assunto (caixa de entrada)
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                Preview (pré-visualização na lista de e-mails)
              </label>
              <input
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                Título do e-mail
              </label>
              <input
                value={content.headline}
                onChange={(e) => setContent((c) => ({ ...c, headline: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                Parágrafo 1
              </label>
              <textarea
                value={content.paragraph1}
                onChange={(e) => setContent((c) => ({ ...c, paragraph1: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />

              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                Parágrafo 2 (opcional)
              </label>
              <textarea
                value={content.paragraph2 ?? ''}
                onChange={(e) => setContent((c) => ({ ...c, paragraph2: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                    Texto do botão
                  </label>
                  <input
                    value={content.ctaLabel ?? ''}
                    onChange={(e) => setContent((c) => ({ ...c, ctaLabel: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                    Link do botão
                  </label>
                  <input
                    value={content.ctaUrl ?? ''}
                    onChange={(e) => setContent((c) => ({ ...c, ctaUrl: e.target.value }))}
                    placeholder="/planos ou https://..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void salvarTemplate()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-5 py-3 text-xs font-black uppercase italic text-white disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar template
                </button>
                <button
                  type="button"
                  disabled={testing}
                  onClick={() => void enviarPreview()}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-900 px-5 py-3 text-xs font-black uppercase italic disabled:opacity-50"
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar preview para mim
                </button>
              </div>
            </section>

            {isMarketing ? (
              <section className="rounded-[32px] border-2 border-amber-200 bg-amber-50/50 p-6 shadow-sm space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-black italic uppercase text-amber-950">
                  <Megaphone className="h-5 w-5" />
                  Enviar campanha
                </h2>
                <p className="text-sm text-amber-900/80">
                  Usa o template <strong>{selected?.name}</strong> salvo acima (ou o rascunho
                  atual do formulário). Máximo 200 destinatários por envio.
                </p>

                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Público
                </label>
                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as 'test_me' | 'emails' | 'concurso_matriculas')
                  }
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold"
                >
                  <option value="test_me">Só teste (meu e-mail admin)</option>
                  <option value="emails">Lista de e-mails</option>
                  <option value="concurso_matriculas">Matriculados ativos em um concurso</option>
                </select>

                {audience === 'emails' ? (
                  <textarea
                    value={emailList}
                    onChange={(e) => setEmailList(e.target.value)}
                    placeholder="um@email.com&#10;outro@email.com"
                    rows={5}
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 font-mono text-sm"
                  />
                ) : null}

                {audience === 'concurso_matriculas' ? (
                  <select
                    value={concursoId}
                    onChange={(e) => setConcursoId(e.target.value)}
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="">Selecione o concurso</option>
                    {concursos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.slug})
                      </option>
                    ))}
                  </select>
                ) : null}

                <button
                  type="button"
                  disabled={sending}
                  onClick={() => void enviarMarketing()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-xs font-black uppercase italic text-white disabled:opacity-50 sm:w-auto"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Megaphone className="h-4 w-4" />
                  )}
                  {audience === 'test_me' ? 'Enviar teste de campanha' : 'Enviar campanha'}
                </button>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
