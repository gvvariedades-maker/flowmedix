import { normalizeSearchForCacheKey } from '@/lib/estudar/navigation';
import { buildVitrineEstudarQuery } from '@/lib/vitrine/estudarQuery';
import { parseVitrineDisciplina, type VitrineDisciplinaId } from '@/lib/vitrine/disciplina';

export type EstudarSearchParams = Record<string, string | string[] | undefined>;

export type ParsedEstudarSearchParams = {
  fromPlano: boolean;
  fromCaderno: boolean;
  cadernoId: string | undefined;
  vitrineBancas: string[];
  vitrineAssuntos: string[];
  vitrineQ: string;
  vitrinePage: number;
  /** Hub TE/PT — deve ir no `vitrineQuerySuffix` (evita payloadStale / SINCRONIZANDO). */
  vitrineDisciplina: VitrineDisciplinaId | null;
};

export function parseEstudarSearchParams(
  searchParams: EstudarSearchParams,
): ParsedEstudarSearchParams {
  const from = searchParams.from as string | undefined;
  const fromPlano = from === 'plano';
  const fromCaderno = from === 'caderno';
  const cadernoId = fromCaderno
    ? typeof searchParams.caderno_id === 'string'
      ? searchParams.caderno_id
      : undefined
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
  const vitrineDisciplina = parseVitrineDisciplina(
    typeof searchParams.disciplina === 'string' ? searchParams.disciplina : null,
  );

  return {
    fromPlano,
    fromCaderno,
    cadernoId,
    vitrineBancas,
    vitrineAssuntos,
    vitrineQ,
    vitrinePage,
    vitrineDisciplina,
  };
}

/**
 * Query de contexto do player — mesma forma que a vitrine (`buildVitrineEstudarQuery`)
 * + plano/caderno. Fonte única para `vitrineQuerySuffix` e chave de cache.
 */
export function buildEstudarContextQuerySuffix(
  parsed: ParsedEstudarSearchParams,
): string {
  if (parsed.fromPlano) return '?from=plano';
  if (parsed.fromCaderno && parsed.cadernoId) {
    return `?from=caderno&caderno_id=${encodeURIComponent(parsed.cadernoId)}`;
  }
  return buildVitrineEstudarQuery({
    bancas: parsed.vitrineBancas,
    assuntos: parsed.vitrineAssuntos,
    q: parsed.vitrineQ || undefined,
    page: parsed.vitrinePage,
    disciplina: parsed.vitrineDisciplina,
  });
}

export function estudarPayloadSearchContextKey(
  searchParams: EstudarSearchParams = {},
): string {
  const suffix = buildEstudarContextQuerySuffix(parseEstudarSearchParams(searchParams));
  return normalizeSearchForCacheKey(suffix.replace(/^\?/, '')) || 'default';
}
