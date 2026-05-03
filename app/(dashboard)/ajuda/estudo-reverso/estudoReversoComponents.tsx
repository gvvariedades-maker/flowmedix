import Link from 'next/link';
import { ArrowRight, BookOpenCheck, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { ActionLink, AJUDA_SURFACE } from '../ajudaComponents';

const FLUXO_BADGES_SURFACE =
  'rounded-2xl border border-[rgba(0,242,255,0.15)] bg-[rgba(0,242,255,0.05)]';

type Cta = {
  label: string;
  href: string;
};

export function HeroEstudoReverso({
  eyebrow,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: Cta;
  ctaSecondary: Cta;
}) {
  return (
    <section className={`p-5 shadow-sm md:p-7 ${AJUDA_SURFACE}`}>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-[#00f2ff]" aria-hidden />
        {eyebrow}
      </div>
      <h1 className="text-balance text-3xl font-black tracking-tight text-slate-100 md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-pretty text-base font-medium leading-relaxed text-slate-400 md:text-lg">{subtitle}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ActionLink href={ctaPrimary.href}>{ctaPrimary.label}</ActionLink>
        <Link
          href={ctaSecondary.href}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-black text-slate-200 shadow-sm transition-colors hover:bg-white/10"
        >
          {ctaSecondary.label}
        </Link>
      </div>
    </section>
  );
}

export function ProblemaBloco({ titulo, paragrafo, sintomas }: { titulo: string; paragrafo: string; sintomas: readonly string[] }) {
  return (
    <div className={`p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
      <h2 className="text-2xl font-black tracking-tight text-slate-100">{titulo}</h2>
      <p className="mt-3 text-base leading-relaxed text-slate-400">{paragrafo}</p>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {sintomas.map((sintoma) => (
          <li
            key={sintoma}
            className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-4 text-sm font-semibold leading-snug text-slate-200"
          >
            <CheckCircle2 className="mb-2 h-5 w-5 text-[#00ff88]" aria-hidden />
            {sintoma}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FluxoBadges({ itens }: { itens: readonly string[] }) {
  return (
    <div
      className={`mt-5 flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between ${FLUXO_BADGES_SURFACE}`}
    >
      {itens.map((item, index) => (
        <div key={item} className="flex items-center gap-2">
          <span className="rounded-full bg-[#0d1117] px-3 py-2 text-sm font-black text-slate-100 shadow-sm ring-1 ring-white/10">
            {item}
          </span>
          {index < itens.length - 1 ? (
            <ChevronRight className="hidden h-4 w-4 text-cyan-400/70 md:block" aria-hidden />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CicloCards({
  titulo,
  intro,
  etapas,
}: {
  titulo: string;
  intro: string;
  etapas: readonly { n: string; nome: string; desc: string; noAvant: string }[];
}) {
  return (
    <div className={`p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
      <h2 className="text-2xl font-black tracking-tight text-slate-100">{titulo}</h2>
      <p className="mt-3 text-base leading-relaxed text-slate-400">{intro}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {etapas.map((etapa) => (
          <article
            key={etapa.nome}
            className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">{etapa.n}</span>
            <h3 className="mt-3 text-lg font-black text-slate-100">{etapa.nome}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{etapa.desc}</p>
            <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold leading-relaxed text-slate-300">
              No AVANT: {etapa.noAvant}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ComparativoColunas({
  titulo,
  tradicional,
  reverso,
}: {
  titulo: string;
  tradicional: { rotulo: string; linhaDoTempo: readonly string[] };
  reverso: { rotulo: string; linhaDoTempo: readonly string[] };
}) {
  return (
    <div className={`p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
      <h2 className="text-2xl font-black tracking-tight text-slate-100">{titulo}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TimelineCard tone="slate" rotulo={tradicional.rotulo} itens={tradicional.linhaDoTempo} />
        <TimelineCard tone="indigo" rotulo={reverso.rotulo} itens={reverso.linhaDoTempo} />
      </div>
    </div>
  );
}

function TimelineCard({ rotulo, itens, tone }: { rotulo: string; itens: readonly string[]; tone: 'slate' | 'indigo' }) {
  const toneClasses =
    tone === 'indigo'
      ? FLUXO_BADGES_SURFACE
      : 'border-[rgba(255,255,255,0.10)] bg-[#0d1117]';

  return (
    <article className={`rounded-2xl border p-4 ${toneClasses}`}>
      <h3 className="text-lg font-black text-slate-100">{rotulo}</h3>
      <ol className="mt-4 space-y-3">
        {itens.map((item, index) => (
          <li key={item} className="flex gap-3 text-sm font-semibold leading-relaxed text-slate-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function PilaresGrid({
  titulo,
  itens,
}: {
  titulo: string;
  itens: readonly { nome: string; desc: string; noAvant: string; fonte: string }[];
}) {
  return (
    <div className={`p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
      <h2 className="text-2xl font-black tracking-tight text-slate-100">{titulo}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itens.map((item) => (
          <article
            key={item.nome}
            className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-4"
          >
            <BookOpenCheck className="h-5 w-5 text-[#00f2ff]" aria-hidden />
            <h3 className="mt-3 text-lg font-black text-slate-100">{item.nome}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
            <p className="mt-3 text-xs font-bold leading-relaxed text-indigo-400">No AVANT: {item.noAvant}</p>
            <p className="mt-2 text-[11px] font-semibold text-slate-400">Referência: {item.fonte}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FaqLista({ itens }: { itens: readonly { q: string; a: string }[] }) {
  return (
    <div className={`p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
      <h2 className="text-2xl font-black tracking-tight text-slate-100">Perguntas frequentes</h2>
      <div className="mt-5 space-y-3">
        {itens.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-[rgba(255,255,255,0.10)] bg-white/[0.03] p-4"
          >
            <summary className="cursor-pointer text-sm font-black text-slate-100 [&::-webkit-details-marker]:text-[#00f2ff]">
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function FontesLista({ itens }: { itens: readonly string[] }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-5 shadow-sm">
      <h2 className="text-lg font-black tracking-tight text-slate-100">Fontes e leituras de apoio</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        As referências abaixo apoiam os conceitos citados. Elas não prometem resultado automático, mas ajudam a explicar por que prática ativa,
        feedback e revisão são estratégias fortes de aprendizagem.
      </p>
      <ul className="mt-4 space-y-2 text-xs leading-relaxed text-slate-400">
        {itens.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f2ff]" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CtaFinal({ titulo, subtitulo, primary, secondary }: { titulo: string; subtitulo: string; primary: Cta; secondary: Cta }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 text-white shadow-sm md:p-7">
      <h2 className="text-2xl font-black tracking-tight md:text-3xl">{titulo}</h2>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-indigo-50 md:text-base">{subtitulo}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={primary.href}
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-black text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
        >
          {primary.label}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
        <Link
          href={secondary.href}
          className="inline-flex items-center justify-center rounded-xl border border-white/25 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-white/10"
        >
          {secondary.label}
        </Link>
      </div>
    </section>
  );
}
