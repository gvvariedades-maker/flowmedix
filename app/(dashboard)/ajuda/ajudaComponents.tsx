import Image from 'next/image';
import Link from 'next/link';
import { existsSync } from 'fs';
import { join } from 'path';
import { ChevronRight } from 'lucide-react';

const TUTORIAL_DIR = join(process.cwd(), 'public', 'tutorial');

/** Tokens reutilizáveis nas rotas `/ajuda` — tema escuro consistente */
export const AJUDA_SURFACE =
  'rounded-3xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117]';
export const AJUDA_SURFACE_SM =
  'rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117]';
export const ONDE_CLICAR =
  'rounded-2xl border border-[rgba(0,242,255,0.15)] bg-[rgba(0,242,255,0.05)]';
export const TEXT_MAIN = 'text-slate-100';
export const TEXT_MUTED = 'text-slate-400';

export function hasTutorialImage(name: string): boolean {
  return existsSync(join(TUTORIAL_DIR, name));
}

export function hasTutorialVideo(name: string): boolean {
  return existsSync(join(TUTORIAL_DIR, name));
}

export function TutorialVideo({
  file,
  src,
  title,
  poster,
}: {
  file?: string;
  src?: string;
  title: string;
  poster?: string;
}) {
  const resolvedSrc = src ?? (file ? `/tutorial/${file}` : null);
  if (!resolvedSrc) return null;
  if (!src && file && !hasTutorialVideo(file)) return null;
  const posterSrc = poster && hasTutorialImage(poster) ? `/tutorial/${poster}` : undefined;

  return (
    <div className={`not-prose overflow-hidden shadow-md shadow-black/20 ${AJUDA_SURFACE}`}>
      <div className="aspect-video w-full bg-black">
        <video
          className="h-full w-full"
          controls
          preload="metadata"
          playsInline
          controlsList="nodownload"
          aria-label={title}
          poster={posterSrc}
        >
          <source src={resolvedSrc} type="video/mp4" />
          Seu navegador não suporta vídeo HTML5.
        </video>
      </div>
      <div className="px-4 py-3">
        <p className={`text-sm font-bold ${TEXT_MAIN}`}>{title}</p>
        <p className={`mt-1 text-xs font-medium ${TEXT_MUTED}`}>
          Dica: se o vídeo não carregar, atualize a página ou tente outra rede. Em iPhone/iPad, prefira Safari.
        </p>
      </div>
    </div>
  );
}

export function ClickLegend({ items }: { items: { alvo: string; acao: string }[] }) {
  return (
    <div className={`not-prose my-4 p-4 shadow-sm ${ONDE_CLICAR}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300">
        Legenda — onde clicar
      </p>
      <ol className={`mt-3 list-none space-y-2.5 text-sm ${TEXT_MAIN}`}>
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-[11px] font-black text-white"
              aria-hidden
            >
              {i + 1}
            </span>
            <span className={TEXT_MUTED}>
              <strong className={`font-semibold ${TEXT_MAIN}`}>{it.alvo}:</strong> {it.acao}
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
      <div
        className={`overflow-hidden shadow-md shadow-black/20 ${AJUDA_SURFACE_SM}`}
      >
        <Image
          src={`/tutorial/${file}`}
          alt={alt}
          width={1280}
          height={800}
          className="h-auto w-full"
          priority={priority}
        />
      </div>
      <figcaption className={`text-center text-xs font-medium ${TEXT_MUTED}`}>{caption}</figcaption>
    </figure>
  );
}

export function Toc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav
      className={`not-prose my-6 p-4 shadow-sm ${AJUDA_SURFACE}`}
      aria-label="Índice do tutorial"
    >
      <p className={`text-[11px] font-black uppercase tracking-widest ${TEXT_MUTED}`}>
        Índice (passo a passo)
      </p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`group flex items-start gap-2 rounded-lg py-1 ${TEXT_MAIN} transition-colors hover:bg-white/[0.05]`}
            >
              <span className="font-mono text-xs tabular-nums text-[#00f2ff]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={`font-medium group-hover:underline ${TEXT_MAIN}`}>
                {it.label}{' '}
                <ChevronRight
                  className="ml-0.5 inline h-3.5 w-3.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-cyan-400"
                  aria-hidden
                />
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
    <div
      className={`not-prose my-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:font-mono [&_code]:text-slate-200 [&_strong]:text-amber-50`}
    >
      {children}
    </div>
  );
}

export function InternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-bold text-[#00f2ff] underline-offset-2 transition-colors hover:bg-white/[0.06] hover:text-cyan-300 hover:underline"
    >
      {children}
    </Link>
  );
}

export function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-3 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-indigo-500/20 transition-colors hover:bg-indigo-700"
    >
      {children}
    </Link>
  );
}
