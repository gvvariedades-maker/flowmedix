import {
  BookOpen,
  FlaskConical,
  HardHat,
  Stethoscope,
  Syringe,
  Users,
} from 'lucide-react';
import type { ReviewItem } from '@/lib/spaced-repetition';
import type { TópicoCategoria, TópicoUrgência } from './types';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Categoria visual semântica (paleta saúde suave) a partir de tópico/subtópico.
 */
export function categoriaTópico(item: ReviewItem): TópicoCategoria {
  const t = norm(`${item.topico ?? ''} ${item.subtopico ?? ''} ${item.modulo_slug ?? ''}`);

  if (
    t.includes('mulher') ||
    t.includes('gesta') ||
    t.includes('pre') ||
    t.includes('obstet') ||
    t.includes('gineco')
  ) {
    return { circleClass: 'bg-rose-100 text-rose-700 border border-rose-200/80', Icon: Stethoscope };
  }
  if (t.includes('trabalh') || t.includes('ocupac') || t.includes('doenca a')) {
    return { circleClass: 'bg-slate-200 text-slate-800 border border-slate-300/80', Icon: HardHat };
  }
  if (
    t.includes('exame') ||
    t.includes('laborat') ||
    t.includes('lab') ||
    t.includes('soro') ||
    t.includes('urina') ||
    t.includes('glicem')
  ) {
    return { circleClass: 'bg-sky-100 text-sky-800 border border-sky-200/80', Icon: FlaskConical };
  }
  if (t.includes('vaci') || t.includes('imuniz') || t.includes('dose')) {
    return { circleClass: 'bg-amber-100 text-amber-800 border border-amber-200/80', Icon: Syringe };
  }
  if (t.includes('famil') || t.includes('crian') || t.includes('adolesce') || t.includes('idoso') || t.includes('comun')) {
    return { circleClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200/80', Icon: Users };
  }
  if (t.includes('saude') || t.includes('vigil') || t.includes('epidem')) {
    return { circleClass: 'bg-cyan-100 text-cyan-800 border border-cyan-200/80', Icon: Stethoscope };
  }

  return {
    circleClass: 'bg-[rgba(0,242,255,0.10)] text-[#00f2ff] border border-[rgba(0,242,255,0.22)]',
    Icon: BookOpen,
  };
}

export function urgenciaInfo(item: ReviewItem): TópicoUrgência {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoje.getTime() - item.nextReview.getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 0) {
    return { label: 'Hoje', chipClass: 'bg-sky-100 text-sky-800 border-sky-200' };
  }
  if (dias === 1) {
    return { label: '1 dia atraso', chipClass: 'bg-amber-100 text-amber-900 border-amber-200' };
  }
  return { label: `${dias} dias atraso`, chipClass: 'bg-amber-100 text-amber-900 border-amber-200' };
}

export function prioridadeBarPct(item: ReviewItem): number {
  return Math.max(4, Math.min(100, item.priority));
}
