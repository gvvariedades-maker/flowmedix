import type { TopicPerformance } from '@/lib/analytics';
import type { SimuladoPoolItem } from '@/lib/simulado/rpc';
import type { UserDeclaredPreferences } from '@/lib/recommendations';

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

export function topicMatchesDeclared(
  declared: string,
  topico?: string | null,
  subtopico?: string | null,
): boolean {
  const needle = normalizeLabel(declared);
  if (!needle) return false;

  const candidates = [topico, subtopico]
    .filter((v): v is string => Boolean(v))
    .map(normalizeLabel);

  return candidates.some(
    (candidate) =>
      candidate === needle || candidate.includes(needle) || needle.includes(candidate),
  );
}

export const WEEKLY_SIMULADO_ORIGEM = 'weekly' as const;
export const WEEKLY_SIMULADO_DEFAULT_QUANTIDADE = 20;

export const WEEKLY_POOL_BUCKET_SHARES = {
  weakness: 0.4,
  affinity: 0.3,
  not_attempted: 0.2,
  review: 0.1,
} as const;

export type WeeklyPoolBucket = keyof typeof WEEKLY_POOL_BUCKET_SHARES;

export type WeeklySimuladoStatus = 'pendente' | 'em_andamento' | 'concluido';

export type ScoredModulo = {
  modulo_id: string;
  modulo_slug: string;
  topico: string | null;
  subtopico: string | null;
  banca: string;
  priority: number;
  category: string;
  bucket: WeeklyPoolBucket;
};

export type IsoWeekInfo = {
  isoYear: number;
  isoWeek: number;
  weekStart: Date;
  weekEndsAt: Date;
};

export function getIsoWeekInfo(date: Date = new Date()): IsoWeekInfo {
  const target = new Date(date.valueOf());
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const isoYear = target.getFullYear();
  const firstThursday = new Date(isoYear, 0, 4);
  const dayDiff = (target.getTime() - firstThursday.getTime()) / 86_400_000;
  const isoWeek = 1 + Math.floor(dayDiff / 7);

  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - dayNr);
  weekStart.setHours(0, 0, 0, 0);

  const weekEndsAt = new Date(weekStart);
  weekEndsAt.setDate(weekStart.getDate() + 6);
  weekEndsAt.setHours(23, 59, 59, 999);

  return { isoYear, isoWeek, weekStart, weekEndsAt };
}

export function buildWeeklySimuladoTitulo(isoWeek: number, focoPrincipal: string): string {
  const foco = focoPrincipal.trim() || 'Estudo Geral';
  return `Simulado da Semana #${isoWeek} - ${foco}`;
}

export function isWeeklySimuladoFiltros(filtros: Record<string, unknown> | null | undefined): boolean {
  return filtros?.origem === WEEKLY_SIMULADO_ORIGEM;
}

export function weeklyFiltrosMatchWeek(
  filtros: Record<string, unknown> | null | undefined,
  isoYear: number,
  isoWeek: number,
): boolean {
  if (!isWeeklySimuladoFiltros(filtros)) return false;
  return Number(filtros?.iso_year) === isoYear && Number(filtros?.iso_week) === isoWeek;
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

function countForBucket(total: number, share: number, remaining: number): number {
  if (remaining <= 0) return 0;
  return Math.min(remaining, Math.max(0, Math.round(total * share)));
}

export function assignWeeklyBucket(
  item: {
    modulo_slug: string;
    topico: string | null;
    subtopico: string | null;
    category: string;
  },
  context: {
    historicoSlugs: Set<string>;
    wrongSlugs: Set<string>;
    preferences: UserDeclaredPreferences | null;
    weakAreas: TopicPerformance[];
  },
): WeeklyPoolBucket {
  const topico = item.topico;
  const subtopico = item.subtopico;

  if (context.wrongSlugs.has(item.modulo_slug)) {
    return 'review';
  }

  const isWeak =
    item.category === 'weak_area' ||
    context.weakAreas.some(
      (w) =>
        (w.topico === topico && w.subtopico === subtopico) ||
        (w.topico === topico && !subtopico),
    ) ||
    (context.preferences?.topicos_dificuldade ?? []).some((t) =>
      topicMatchesDeclared(t, topico, subtopico),
    );

  if (isWeak) return 'weakness';

  if (!context.historicoSlugs.has(item.modulo_slug) || item.category === 'not_attempted') {
    return 'not_attempted';
  }

  const isAffinity =
    item.category === 'review_needed' ||
    (context.preferences?.topicos_afinidade ?? []).some((t) =>
      topicMatchesDeclared(t, topico, subtopico),
    );

  if (isAffinity) return 'affinity';

  return 'weakness';
}

export function buildWeeklyQuestionPoolFromScored(
  scored: ScoredModulo[],
  quantidade: number,
): SimuladoPoolItem[] {
  const buckets: Record<WeeklyPoolBucket, ScoredModulo[]> = {
    weakness: [],
    affinity: [],
    not_attempted: [],
    review: [],
  };

  for (const item of scored) {
    buckets[item.bucket].push(item);
  }

  for (const key of Object.keys(buckets) as WeeklyPoolBucket[]) {
    shuffleInPlace(buckets[key]);
  }

  const targets: Record<WeeklyPoolBucket, number> = {
    weakness: countForBucket(quantidade, WEEKLY_POOL_BUCKET_SHARES.weakness, quantidade),
    affinity: countForBucket(quantidade, WEEKLY_POOL_BUCKET_SHARES.affinity, quantidade),
    not_attempted: countForBucket(
      quantidade,
      WEEKLY_POOL_BUCKET_SHARES.not_attempted,
      quantidade,
    ),
    review: countForBucket(quantidade, WEEKLY_POOL_BUCKET_SHARES.review, quantidade),
  };

  let allocated =
    targets.weakness + targets.affinity + targets.not_attempted + targets.review;
  while (allocated > quantidade) {
    if (targets.affinity > 0) {
      targets.affinity -= 1;
      allocated -= 1;
    } else if (targets.not_attempted > 0) {
      targets.not_attempted -= 1;
      allocated -= 1;
    } else if (targets.weakness > 1) {
      targets.weakness -= 1;
      allocated -= 1;
    } else {
      break;
    }
  }
  while (allocated < quantidade) {
    targets.weakness += 1;
    allocated += 1;
  }

  const picked: ScoredModulo[] = [];
  const usedSlugs = new Set<string>();

  const pullFromBucket = (bucket: WeeklyPoolBucket, limit: number) => {
    let added = 0;
    for (const item of buckets[bucket]) {
      if (added >= limit) break;
      if (usedSlugs.has(item.modulo_slug)) continue;
      usedSlugs.add(item.modulo_slug);
      picked.push(item);
      added += 1;
    }
    return added;
  };

  for (const bucket of Object.keys(targets) as WeeklyPoolBucket[]) {
    pullFromBucket(bucket, targets[bucket]);
  }

  if (picked.length < quantidade) {
    const fallback = shuffleInPlace([...scored]).filter((item) => !usedSlugs.has(item.modulo_slug));
    for (const item of fallback) {
      if (picked.length >= quantidade) break;
      usedSlugs.add(item.modulo_slug);
      picked.push(item);
    }
  }

  shuffleInPlace(picked);

  return picked.slice(0, quantidade).map((item, idx) => ({
    modulo_id: item.modulo_id,
    modulo_slug: item.modulo_slug,
    ordem: idx + 1,
  }));
}

export function resolveWeeklyFocoPrincipal(
  weaknessItems: ScoredModulo[],
  weakAreas: TopicPerformance[],
  preferences: UserDeclaredPreferences | null,
): string {
  const weakArea = weakAreas[0];
  if (weakArea) {
    return weakArea.subtopico?.trim() || weakArea.topico?.trim() || 'Estudo Geral';
  }

  const declared = preferences?.topicos_dificuldade?.[0]?.trim();
  if (declared) return declared;

  const topWeak = weaknessItems[0];
  if (topWeak) {
    return topWeak.subtopico?.trim() || topWeak.topico?.trim() || 'Estudo Geral';
  }

  return 'Estudo Geral';
}

export function resolveWeeklySimuladoStatus(
  session: { status: 'aberto' | 'concluido' | 'cancelado' },
  respondidas: number,
): WeeklySimuladoStatus {
  if (session.status === 'concluido') return 'concluido';
  return respondidas > 0 ? 'em_andamento' : 'pendente';
}
