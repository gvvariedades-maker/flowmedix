import Image from 'next/image';
import Link from 'next/link';
import { existsSync } from 'fs';
import { join } from 'path';
import { ChevronRight } from 'lucide-react';
import type { TutorialCallout } from './tutorial-annotations';
import { TUTORIAL_ANNOTATIONS } from './tutorial-annotations';

const TUTORIAL_DIR = join(process.cwd(), 'public', 'tutorial');

export function hasTutorialImage(name: string): boolean {
  return existsSync(join(TUTORIAL_DIR, name));
}

export function ClickLegend({ items }: { items: { alvo: string; acao: string }[] }) {
  return (
    <div className="not-prose my-4 rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-slate-50/80 p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-800">Legenda — onde clicar</p>
      <ol className="mt-3 list-none space-y-2.5 text-sm text-slate-800">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-[11px] font-black text-white"
              aria-hidden
            >
              {i + 1}
            </span>
            <span>
              <strong className="text-slate-900">{it.alvo}:</strong> {it.acao}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TutorialFigure({
  file,
  alt,
  caption,
  priority,
}: {
  file: string;
  alt: string;
  caption: string;
  priority?: boolean;
}) {
  if (!hasTutorialImage(file)) return null;
  return (
    <figure className="not-prose my-4 space-y-2">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 shadow-md shadow-slate-200/40">
        <Image
          src={`/tutorial/${file}`}
          alt={alt}
          width={1280}
          height={800}
          className="h-auto w-full"
          priority={priority}
        />
      </div>
      <figcaption className="text-center text-xs font-medium text-slate-500">{caption}</figcaption>
    </figure>
  );
}

/**
 * Imagem com selos numerados e texto (legenda) — posições vêm de `TUTORIAL_ANNOTATIONS[file]`.
 * Use `callouts` para override; por padrão lê do mapa.
 */
export function AnnotatedShot({
  file,
  alt,
  caption,
  priority,
  callouts: calloutsOverride,
}: {
  file: string;
  alt: string;
  caption: string;
  priority?: boolean;
  callouts?: TutorialCallout[];
}) {
  if (!hasTutorialImage(file)) return null;
  const callouts = calloutsOverride ?? TUTORIAL_ANNOTATIONS[file] ?? [];

  return (
    <figure className="not-prose my-5 space-y-3" aria-label={alt}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-700">Legenda na figura (números na captura)</p>
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-indigo-200/60 bg-slate-900/5 shadow-lg shadow-slate-300/30">
        <Image
          src={`/tutorial/${file}`}
          alt={alt}
          width={1280}
          height={800}
          className="h-auto w-full"
          priority={priority}
        />
        {callouts.map((c) => (
          <div
            key={`${c.n}-${c.left}-${c.top}`}
            className="pointer-events-none absolute z-10"
            style={{ top: c.top, left: c.left, transform: 'translate(-50%, -50%)' }}
          >
            <div className="flex max-w-[min(16rem,55vw)] flex-col items-center gap-1 sm:max-w-xs">
              <div className="flex h-7 w-7 min-h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-[11px] font-black text-white shadow-lg ring-1 ring-indigo-900/20">
                {c.n}
              </div>
              <div className="rounded-lg border border-slate-200/90 bg-white/95 px-2 py-1.5 text-center text-[9px] font-semibold leading-tight text-slate-800 shadow-md backdrop-blur-sm sm:text-[10px]">
                {c.text}
              </div>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="text-balance text-center text-xs font-medium text-slate-500">{caption}</figcaption>
    </figure>
  );
}

export function Toc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav
      className="not-prose my-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label="Índice do tutorial"
    >
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Índice (passo a passo)</p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="group flex items-start gap-2 rounded-lg py-1 text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-900"
            >
              <span className="font-mono text-xs text-indigo-500 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-medium group-hover:underline">
                {it.label} <ChevronRight className="ml-0.5 inline h-3.5 w-3.5 opacity-0 group-hover:opacity-100" aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-4 rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
      {children}
    </div>
  );
}

export function InternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-bold text-indigo-600 hover:underline">
      {children}
    </Link>
  );
}
