import { createElement } from 'react';
import { BookMarked, RotateCcw, Sparkles, type LucideIcon } from 'lucide-react';
import type { PackFamily } from '@/lib/cadernos/packs';
import { cn } from '@/lib/utils';
import { getTopicAccent } from '@/lib/vitrine/vitrineTopicAccent';
import { getTopicIcon } from '@/lib/vitrine/vitrineTopicIcon';

type CadernoProntoCoverProps = {
  family: PackFamily;
  /** `titulo_aula` canônico — usado quando `family === 'assunto'`. */
  tituloAula?: string | null;
  className?: string;
};

const FAMILY_COVER: Record<
  Exclude<PackFamily, 'assunto'>,
  { gradient: string; iconClass: string; Icon: LucideIcon }
> = {
  ativacao: {
    gradient: 'from-lime-100 via-emerald-50 to-teal-100',
    iconClass: 'text-emerald-700',
    Icon: Sparkles,
  },
  edital: {
    gradient: 'from-amber-100 via-orange-50 to-yellow-100',
    iconClass: 'text-amber-700',
    Icon: BookMarked,
  },
  revisao: {
    gradient: 'from-rose-100 via-pink-50 to-orange-100',
    iconClass: 'text-rose-700',
    Icon: RotateCcw,
  },
};

/** Gradientes full-bleed alinhados aos accents da vitrine (purge-safe). */
function assuntoCoverGradient(tituloAula?: string | null): string {
  const src = `${tituloAula ?? ''}`.toLowerCase();
  if (/urg[eê]n|emerg|rcp|sinais?\s*vitais|sv\b|card|cora[çc]/.test(src)) {
    return 'from-rose-100 via-rose-50 to-orange-100';
  }
  if (/adolescente/.test(src)) return 'from-sky-100 via-sky-50 to-cyan-100';
  if (/vacin|imuniz/.test(src)) return 'from-emerald-100 via-emerald-50 to-teal-100';
  if (/farm|medic|dose|prescr|farmacocin|via|administra/.test(src)) {
    return 'from-violet-100 via-purple-50 to-fuchsia-100';
  }
  if (/infect|epidem|dst|hiv|ist/.test(src)) return 'from-teal-100 via-teal-50 to-cyan-100';
  if (/[eé]tica|legisl|lei\b|c[oó]d|cofen|coren/.test(src)) {
    return 'from-amber-100 via-amber-50 to-yellow-100';
  }
  return 'from-indigo-100 via-slate-50 to-sky-100';
}

function resolveCover(family: PackFamily, tituloAula?: string | null) {
  if (family === 'assunto') {
    return {
      gradient: assuntoCoverGradient(tituloAula),
      iconClass: getTopicAccent(tituloAula).icon,
      Icon: getTopicIcon(tituloAula),
    };
  }
  return FAMILY_COVER[family];
}

/**
 * Capa tipada do Caderno Pronto — gradiente + ícone (sem asset/bucket).
 * `aria-hidden`: a informação vive no texto do card.
 */
export function CadernoProntoCover({ family, tituloAula, className }: CadernoProntoCoverProps) {
  const { gradient, iconClass, Icon } = resolveCover(family, tituloAula);

  return (
    <div
      aria-hidden
      className={cn(
        'relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br',
        gradient,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.09) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />
      <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/35 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 size-40 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        {createElement(Icon, {
          size: 44,
          strokeWidth: 1.75,
          className: cn('drop-shadow-sm', iconClass),
        })}
      </div>
    </div>
  );
}
