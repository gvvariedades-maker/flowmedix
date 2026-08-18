'use client';

import { CALC_ICON_CATALOG } from '@/components/slides/icons/calc';

export function CalcIconsPreviewClient() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <header className="mx-auto mb-8 max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Dev · kit SVG B/C
        </p>
        <h1 className="mt-1 font-display text-2xl font-black tracking-tight">
          Ícones — Cálculo de medicamentos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Mapeados da infográfico «Regra de Três». Nível B/C: volume, highlight e
          stroke escuro — vetor React, sem PNG. Inspiração ≠ cópia de feed.
        </p>
        <p className="mt-1 font-mono text-xs text-slate-500">
          components/slides/icons/calc/
        </p>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {CALC_ICON_CATALOG.map(({ id, label, step, Component }) => (
          <article
            key={id}
            className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50 ring-1 ring-slate-200">
              <Component className="h-14 w-14" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                {step}
              </p>
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <p className="font-mono text-[10px] text-slate-500">{id}</p>
            </div>
          </article>
        ))}
      </main>

      <section className="mx-auto mt-8 max-w-5xl rounded-2xl bg-[#010409] p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Sobre fundo NeuroSlides
        </p>
        <div className="flex flex-wrap gap-4">
          {CALC_ICON_CATALOG.map(({ id, Component }) => (
            <div
              key={`dark-${id}`}
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
            >
              <Component className="h-11 w-11" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          Mapa (imagem → SVG)
        </p>
        <ol className="grid gap-1.5 text-sm text-slate-700 sm:grid-cols-2">
          <li>1. Header esq. → <code className="text-xs">bottle-pill</code></li>
          <li>2. Header dir. → <code className="text-xs">syringe</code></li>
          <li>3. Subhead → <code className="text-xs">target-arrow</code></li>
          <li>4. Passo 1 → <code className="text-xs">balance-scale</code></li>
          <li>5. Passo 2 → <code className="text-xs">chain-link</code></li>
          <li>6. Passo 3 → <code className="text-xs">calculator</code></li>
          <li>7. Passo 4 → <code className="text-xs">clipboard-check</code></li>
          <li>8. Passo 5 → <code className="text-xs">capsule</code></li>
          <li>9. Footer dica → <code className="text-xs">lightbulb-badge</code></li>
          <li>10. Footer escudo → <code className="text-xs">shield-cross</code></li>
        </ol>
      </section>
    </div>
  );
}
