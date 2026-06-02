import { normalizeSearchForCacheKey } from '@/lib/estudar/navigation';

export type EstudarSearchParams = Record<string, string | string[] | undefined>;

export function parseEstudarSearchParams(searchParams: EstudarSearchParams) {
  const from = searchParams.from as string | undefined;
  const fromPlano = from === 'plano';
  const fromCaderno = from === 'caderno';
  const cadernoId = fromCaderno
    ? (typeof searchParams.caderno_id === 'string' ? searchParams.caderno_id : undefined)
    : undefined;
  const vitrineBancas = Array.isArray(searchParams.banca)
    ? searchParams.banca.map((b) => String(b).trim()).filter(Boolean)
    : typeof searchParams.banca === 'string' && searchParams.banca.trim()
      ? [searchParams.banca.trim()]
      : [];
  const vitrineAssuntos = Array.isArray(searchParams.assunto)
    ? searchParams.assunto.map((a) => String(a).trim()).filter(Boolean)
    : typeof searchParams.assunto === 'string' && searchParams.assunto.trim()
      ? [searchParams.assunto.trim()]
      : [];
  const vitrineQ = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const rawPage =
    typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const vitrinePage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  return {
    fromPlano,
    fromCaderno,
    cadernoId,
    vitrineBancas,
    vitrineAssuntos,
    vitrineQ,
    vitrinePage,
  };
}

export function estudarPayloadSearchContextKey(searchParams: EstudarSearchParams = {}): string {
  const {
    fromPlano,
    fromCaderno,
    cadernoId,
    vitrineBancas,
    vitrineAssuntos,
    vitrineQ,
    vitrinePage,
  } = parseEstudarSearchParams(searchParams);
  const params = new URLSearchParams();
  if (fromPlano) {
    params.set('from', 'plano');
  } else if (fromCaderno && cadernoId) {
    params.set('from', 'caderno');
    params.set('caderno_id', cadernoId);
  } else {
    vitrineBancas.forEach((b) => params.append('banca', b));
    vitrineAssuntos.forEach((a) => params.append('assunto', a));
    if (vitrineQ) params.set('q', vitrineQ);
    if (vitrinePage > 1) params.set('page', String(vitrinePage));
  }
  return normalizeSearchForCacheKey(params.toString()) || 'default';
}
