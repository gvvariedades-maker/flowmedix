'use client';

import { AvantLogo } from '@/components/brand/AvantLogo';
import { AvantBrandMark } from '@/components/brand/AvantBrandMark';
import Link from 'next/link';

/**
 * Preview live do lockup AE editorial (light/brand) vs cyber (default).
 * Rota admin: /admin/brand
 */
export default function AdminBrandPreviewPage() {
  return (
    <div className="min-h-screen bg-[#010409] text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Brand · AVANT Enf
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Logo AE — preview light / dark
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Modelo ouro + esmeralda: monograma Ae (estrela) · wordmark AVANT enf 3D.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            ← Admin
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-[#f1f5f9] p-8 text-slate-900 shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Light · Editorial
            </h2>
            <p className="mt-1 mb-8 text-xs text-slate-500">
              tone=&quot;brand&quot; / &quot;light&quot; — dashboard e auth
            </p>
            <div className="flex flex-col gap-10">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  BrandMark sidebar (md)
                </p>
                <AvantBrandMark size="md" variant="editorial" />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Lockup brand lg
                </p>
                <AvantLogo size="lg" tone="brand" animated={false} />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Lockup light nav
                </p>
                <AvantLogo size="nav" tone="light" animated={false} href="/" />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Ícone só
                </p>
                <div className="flex items-center gap-4">
                  <AvantLogo variant="icon" size="lg" tone="brand" />
                  <AvantLogo variant="icon" size="md" tone="brand" />
                  <AvantLogo variant="icon" size="nav" tone="brand" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0d0d18] p-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Dark · Cyber
            </h2>
            <p className="mt-1 mb-8 text-xs text-slate-500">
              tone=&quot;default&quot; — NeuroSlides / landing escura
            </p>
            <div className="flex flex-col gap-10">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Lockup cyber lg (pulse off)
                </p>
                <AvantLogo size="lg" tone="default" animated={false} />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Lockup cyber md
                </p>
                <AvantLogo size="md" tone="default" animated={false} />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  BrandMark cyber
                </p>
                <AvantBrandMark size="md" variant="cyber" />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Ícone só
                </p>
                <div className="flex items-center gap-4">
                  <AvantLogo variant="icon" size="lg" tone="default" />
                  <AvantLogo variant="icon" size="md" tone="default" />
                  <AvantLogo variant="icon" size="nav" tone="default" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <p className="mt-8 text-xs text-slate-600">
          Assets estáticos: <code className="text-slate-500">public/brand/*.svg</code> · preview HTML:{' '}
          <code className="text-slate-500">artifacts/brand-logo-preview.html</code>
        </p>
      </div>
    </div>
  );
}
