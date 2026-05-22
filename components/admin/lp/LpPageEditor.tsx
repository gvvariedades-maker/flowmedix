'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2, Save, Send } from 'lucide-react';
import type { LpPageConfigInput, LpPageSeoInput } from '@/lib/validations';
import { EMPTY_LP_CONFIG, emptyLpSeo } from '@/lib/lp/formDefaults';
import { lpPublicHref } from '@/lib/lp/shared';

type TemplateOption = { id: string; slug: string; nome: string };

type PageRow = {
  id: string;
  path: string;
  template_id: string;
  status: string;
  internal_name: string;
  config: LpPageConfigInput;
  seo: LpPageSeoInput;
  utm_campaign: string | null;
};

type LpPageEditorProps = {
  mode: 'create' | 'edit';
  pageId?: string;
  initial?: PageRow;
};

function ensureTuple3(arr: string[]): [string, string, string] {
  return [arr[0] ?? '', arr[1] ?? '', arr[2] ?? ''];
}

export function LpPageEditor({ mode, pageId, initial }: LpPageEditorProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(initial?.status ?? 'rascunho');

  const [templateId, setTemplateId] = useState(initial?.template_id ?? '');
  const [path, setPath] = useState(initial?.path ?? '');
  const [internalName, setInternalName] = useState(initial?.internal_name ?? '');
  const [utmCampaign, setUtmCampaign] = useState(initial?.utm_campaign ?? '');
  const [config, setConfig] = useState<LpPageConfigInput>(initial?.config ?? EMPTY_LP_CONFIG);
  const [seo, setSeo] = useState<LpPageSeoInput>(
    initial?.seo ?? emptyLpSeo('', ''),
  );

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch('/api/admin/lp-templates', { credentials: 'same-origin' });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || 'Falha ao carregar templates');
        const list = (payload.templates ?? []) as TemplateOption[];
        setTemplates(list);
        if (!templateId && list[0]) setTemplateId(list[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar templates');
      } finally {
        setLoadingTemplates(false);
      }
    }
    void loadTemplates();
  }, [templateId]);

  const updateConcurso = useCallback(
    (field: keyof LpPageConfigInput['concurso'], value: string) => {
      setConfig((prev) => ({
        ...prev,
        concurso: { ...prev.concurso, [field]: value },
      }));
    },
    [],
  );

  const updateCopy = useCallback(
    (field: keyof LpPageConfigInput['copy'], value: string | string[]) => {
      setConfig((prev) => ({
        ...prev,
        copy: { ...prev.copy, [field]: value },
      }));
    },
    [],
  );

  const buildPayload = useCallback(() => {
    const normalizedPath = path.trim().toLowerCase();
    return {
      template_id: templateId,
      path: normalizedPath,
      internal_name: internalName.trim(),
      config: {
        ...config,
        copy: {
          ...config.copy,
          dores: ensureTuple3([...config.copy.dores]),
          perigosBanca: ensureTuple3([...config.copy.perigosBanca]),
        },
      },
      seo: {
        ...seo,
        canonical: seo.canonical || `/lp/${normalizedPath}`,
      },
      utm_campaign: utmCampaign.trim() || null,
    };
  }, [templateId, path, internalName, config, seo, utmCampaign]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const url = mode === 'create' ? '/api/admin/lp-pages' : `/api/admin/lp-pages/${pageId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        const detail = body.details?.[0]?.message;
        throw new Error(detail || body.error || 'Falha ao salvar');
      }
      if (mode === 'create' && body.page?.id) {
        router.push(`/admin/landings/${body.page.id}`);
        return;
      }
      setStatus(body.page?.status ?? status);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!pageId) return;
    setPublishing(true);
    setError(null);
    try {
      const payload = buildPayload();
      const saveRes = await fetch(`/api/admin/lp-pages/${pageId}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saveBody = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveBody.error || 'Falha ao salvar antes de publicar');
      }
      const res = await fetch(`/api/admin/lp-pages/${pageId}/publish`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Falha ao publicar');
      setStatus('ativo');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao publicar');
    } finally {
      setPublishing(false);
    }
  }

  if (loadingTemplates) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  const publicHref = path.trim() ? lpPublicHref(path) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/landings"
          className="inline-flex items-center gap-2 text-xs font-black uppercase italic text-slate-500 hover:text-[#4F46E5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex flex-wrap gap-2">
          {mode === 'edit' && pageId ? (
            <Link
              href={`/admin/landings/${pageId}/preview`}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-4 py-2 text-xs font-black uppercase italic"
            >
              Preview
            </Link>
          ) : null}
          {status === 'ativo' && publicHref ? (
            <a
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase italic text-cyan-800"
            >
              Abrir LP
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      <header>
        <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter text-slate-900">
          {mode === 'create' ? 'Nova landing' : 'Editar landing'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Funil AVANT Pro — status:{' '}
          <span className="font-bold text-slate-700">{status}</span>
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="space-y-4 rounded-[32px] border-[1.5px] border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <h2 className="font-black italic uppercase text-slate-900">Geral</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome interno</span>
            <input
              value={internalName}
              onChange={(e) => setInternalName(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Path (URL)</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-400">/lp/</span>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-mono"
                placeholder="campina-grande"
              />
            </div>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">UTM (opcional)</span>
            <input
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preço exibido (Pro)</span>
            <input
              value={config.oferta?.preco ?? '14,90'}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, oferta: { preco: e.target.value } }))
              }
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6">
        <h2 className="font-black italic uppercase text-slate-900">Edital</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['cidade', 'Cidade'],
              ['cargo', 'Cargo'],
              ['banca', 'Banca (sigla)'],
              ['nomeBanca', 'Nome banca'],
              ['vagas', 'Vagas'],
              ['vagasPCD', 'Vagas PCD'],
              ['orgao', 'Órgão'],
              ['dataProva', 'Data prova (ISO)'],
              ['dataProvaFormatada', 'Data prova (texto)'],
              ['statusInscricoes', 'Status inscrições'],
              ['remuneracao', 'Remuneração'],
              ['taxaInscricao', 'Taxa inscrição'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
              <input
                value={config.concurso[key] ?? ''}
                onChange={(e) => updateConcurso(key, e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6">
        <h2 className="font-black italic uppercase text-slate-900">Copy</h2>
        <label className="block space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headline</span>
          <input
            value={config.copy.headlinePrincipal}
            onChange={(e) => updateCopy('headlinePrincipal', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtítulo</span>
          <textarea
            value={config.copy.subtitulo}
            onChange={(e) => updateCopy('subtitulo', e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        {[0, 1, 2].map((i) => (
          <label key={`dor-${i}`} className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dor {i + 1}</span>
            <input
              value={config.copy.dores[i]}
              onChange={(e) => {
                const d = [...config.copy.dores] as string[];
                d[i] = e.target.value;
                updateCopy('dores', ensureTuple3(d));
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        ))}
        {[0, 1, 2].map((i) => (
          <label key={`perigo-${i}`} className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Perigo banca {i + 1}</span>
            <input
              value={config.copy.perigosBanca[i]}
              onChange={(e) => {
                const p = [...config.copy.perigosBanca] as string[];
                p[i] = e.target.value;
                updateCopy('perigosBanca', ensureTuple3(p));
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        ))}
        <label className="block space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Benefícios (um por linha)
          </span>
          <textarea
            value={config.copy.listaBeneficios.join('\n')}
            onChange={(e) =>
              updateCopy(
                'listaBeneficios',
                e.target.value.split('\n').filter((l) => l.trim()),
              )
            }
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disclaimer</span>
          <textarea
            value={config.copy.disclaimer}
            onChange={(e) => updateCopy('disclaimer', e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disclaimer legal</span>
          <textarea
            value={config.copy.disclaimerLegal}
            onChange={(e) => updateCopy('disclaimerLegal', e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6">
        <h2 className="font-black italic uppercase text-slate-900">Walkthrough (URLs)</h2>
        {config.walkthrough.imagens.map((url, i) => (
          <label key={i} className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Imagem {i + 1}</span>
            <input
              value={url}
              onChange={(e) => {
                const imgs = [...config.walkthrough.imagens];
                imgs[i] = e.target.value;
                setConfig((prev) => ({ ...prev, walkthrough: { imagens: imgs } }));
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </label>
        ))}
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6">
        <h2 className="font-black italic uppercase text-slate-900">SEO</h2>
        {(
          [
            ['title', 'Title'],
            ['description', 'Description'],
            ['canonical', 'Canonical'],
            ['ogTitle', 'OG Title'],
            ['ogDescription', 'OG Description'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <input
              value={seo[key] ?? ''}
              onChange={(e) => setSeo((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving || publishing}
          onClick={() => void handleSave()}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black uppercase italic text-[#BEF264] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar rascunho
        </button>
        <button
          type="button"
          disabled={saving || publishing || mode === 'create'}
          onClick={() => void handlePublish()}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-6 py-3 text-xs font-black uppercase italic text-white disabled:opacity-50"
        >
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publicar
        </button>
      </div>
    </div>
  );
}
