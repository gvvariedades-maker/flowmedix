'use client';

import { IM_ICON_CATALOG, ImStepBadge } from '@/components/slides/icons/im';

export function ImIconsPreviewClient() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <header className="mx-auto mb-8 max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Dev · kit SVG
        </p>
        <h1 className="mt-1 font-display text-2xl font-black tracking-tight">
          Ícones IM — intramuscular
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Vetores React (SVG), sem PNG. Inspirados no gesto dos mapas mentais de
          enfermagem — não são cópia de feed. Use em moldes / chips / boards.
        </p>
        <p className="mt-1 font-mono text-xs text-slate-500">
          components/slides/icons/im/
        </p>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {IM_ICON_CATALOG.map(({ id, label, Component }) => (
          <article
            key={id}
            className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
              <Component className="h-9 w-9" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <p className="font-mono text-[10px] text-slate-500">{id}</p>
            </div>
          </article>
        ))}

        <article className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
          <p className="text-sm font-bold text-slate-900">Passos numerados</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ImStepBadge key={n} n={n} className="h-10 w-10" />
            ))}
            <ImStepBadge n="4A" tone="red" className="h-10 w-10" />
            <ImStepBadge n="4B" tone="red" className="h-10 w-10" />
          </div>
        </article>
      </main>

      <section className="mx-auto mt-8 max-w-5xl rounded-2xl bg-[#010409] p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Sobre fundo NeuroSlides
        </p>
        <div className="flex flex-wrap gap-4">
          {IM_ICON_CATALOG.slice(0, 8).map(({ id, Component }) => (
            <div
              key={`dark-${id}`}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
            >
              <Component className="h-8 w-8" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
