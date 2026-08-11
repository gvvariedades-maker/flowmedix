import type { HistoricoQuestao } from '@/lib/analytics';
import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';
import {
  getGrandeAreaMeta,
  getRiskBandMeta,
  GRANDE_AREAS,
  parseGrandeAreaId,
  resolveTaxonomiaAssunto,
  RISK_BANDS,
  type GrandeAreaId,
  type RiskBandId,
} from '@/lib/desempenho/taxonomiaEnfermagem';
import {
  DESEMPENHO_COACH_UNLOCK,
  DESEMPENHO_META_DIA_DEFAULT,
  DESEMPENHO_MIN_SAMPLE,
  DESEMPENHO_NEXT_PRACTICE_LIMIT,
  type AreaPerformance,
  type AssuntoPerformance,
  type CatalogDesempenhoRow,
  type DesempenhoEstudoData,
  type DesempenhoEstudoFilters,
  type DesempenhoPeriodo,
  type HistoricoDesempenhoRow,
  type PracticeFocus,
  type RecentAttempt,
  type RiskBandPerformance,
} from '@/lib/desempenho/types';
import {
  parseVitrineDisciplina,
  resolveVitrineDisciplinaId,
  type VitrineDisciplinaId,
} from '@/lib/vitrine/disciplina';

export const DESEMPENHO_PERIODOS = ['7d', '30d', '90d', '12m', 'all'] as const satisfies ReadonlyArray<DesempenhoPeriodo>;

/**
 * Importa só tipos de analytics — runtime de `getHistoricoCompleto` /
 * `getModulosEstudoForUserCached` fica em dynamic import (evita puxar
 * `next/cache` em testes unitários da agregação pura).
 */

const TITULO_ORFAO = 'Sem assunto no catálogo';

type SlugCatalogInfo = {
  tituloAula: string;
  moduloNome: string | null;
  banca: string;
  disciplina: VitrineDisciplinaId;
};

function pctOrNull(acertos: number, respondidas: number): number | null {
  if (respondidas < DESEMPENHO_MIN_SAMPLE) return null;
  if (respondidas === 0) return null;
  return Math.round((acertos / respondidas) * 100);
}

function coberturaPct(respondidas: number, totalDisponivel: number): number {
  if (totalDisponivel <= 0) return 0;
  return Math.min(100, Math.round((respondidas / totalDisponivel) * 100));
}

function startOfLocalDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getDesempenhoPeriodStart(
  periodo: DesempenhoPeriodo,
  now: Date = new Date(),
): Date | null {
  if (periodo === 'all') return null;
  const base = new Date(now);
  if (periodo === '7d') base.setDate(now.getDate() - 7);
  else if (periodo === '30d') base.setDate(now.getDate() - 30);
  else if (periodo === '90d') base.setDate(now.getDate() - 90);
  else if (periodo === '12m') base.setMonth(now.getMonth() - 12);
  return base;
}

function normalizeFilters(
  filters?: Partial<DesempenhoEstudoFilters> | null,
): DesempenhoEstudoFilters {
  return {
    periodo: filters?.periodo ?? 'all',
    banca: filters?.banca?.trim() || null,
    areaId: filters?.areaId ?? null,
    disciplina: filters?.disciplina ?? null,
  };
}

/**
 * Normaliza `searchParams` da página `/desempenho` (periodo, banca, area, disciplina).
 * Valores inválidos caem no default sem filtrar.
 */
export function normalizeDesempenhoEstudoFilters(input: {
  periodoRaw?: string | null;
  bancaRaw?: string | null;
  areaRaw?: string | null;
  disciplinaRaw?: string | null;
}): DesempenhoEstudoFilters {
  const periodo = DESEMPENHO_PERIODOS.includes(input.periodoRaw as DesempenhoPeriodo)
    ? (input.periodoRaw as DesempenhoPeriodo)
    : 'all';

  return normalizeFilters({
    periodo,
    banca: input.bancaRaw,
    areaId: parseGrandeAreaId(input.areaRaw),
    disciplina: parseVitrineDisciplina(input.disciplinaRaw),
  });
}

function toHistoricoRows(
  historico: readonly (HistoricoQuestao | HistoricoDesempenhoRow)[],
): HistoricoDesempenhoRow[] {
  return historico.map((h) => ({
    id: h.id,
    modulo_slug: h.modulo_slug,
    acertou: h.acertou,
    created_at: h.created_at,
    banca: 'banca' in h ? h.banca ?? null : null,
    estudo_reverso_concluido:
      'estudo_reverso_concluido' in h
        ? ((h as HistoricoDesempenhoRow).estudo_reverso_concluido ?? null)
        : null,
    respondida:
      'respondida' in h ? ((h as HistoricoDesempenhoRow).respondida ?? true) : true,
  }));
}

/** Tentativa com alternativa escolhida (exclui placeholder de estudo reverso). */
function isRespondida(h: Pick<HistoricoDesempenhoRow, 'respondida'>): boolean {
  return h.respondida !== false;
}

function toCatalogRows(
  catalog: readonly (ModuloEstudoListRow | CatalogDesempenhoRow)[],
): CatalogDesempenhoRow[] {
  return catalog.map((m) => ({
    modulo_slug: m.modulo_slug,
    titulo_aula: m.titulo_aula,
    modulo_nome: m.modulo_nome,
    banca: m.banca,
  }));
}

function buildSlugIndex(catalog: readonly CatalogDesempenhoRow[]): Map<string, SlugCatalogInfo> {
  const map = new Map<string, SlugCatalogInfo>();
  for (const row of catalog) {
    const slug = row.modulo_slug?.trim();
    if (!slug || map.has(slug)) continue;
    const titulo = row.titulo_aula?.trim() || TITULO_ORFAO;
    map.set(slug, {
      tituloAula: titulo,
      moduloNome: row.modulo_nome,
      banca: row.banca,
      disciplina: resolveVitrineDisciplinaId(row.modulo_nome),
    });
  }
  return map;
}

function countCatalogByTitulo(
  catalog: readonly CatalogDesempenhoRow[],
  filters: DesempenhoEstudoFilters,
): Map<string, { total: number; bancas: Set<string>; disciplina: VitrineDisciplinaId; moduloNome: string | null }> {
  const byTitulo = new Map<
    string,
    { total: number; bancas: Set<string>; disciplina: VitrineDisciplinaId; moduloNome: string | null }
  >();

  for (const row of catalog) {
    const titulo = row.titulo_aula?.trim() || TITULO_ORFAO;
    const disciplina = resolveVitrineDisciplinaId(row.modulo_nome);
    if (filters.disciplina && disciplina !== filters.disciplina) continue;
    if (filters.banca && row.banca !== filters.banca) continue;

    const tax = resolveTaxonomiaAssunto(titulo === TITULO_ORFAO ? null : titulo);
    if (filters.areaId && tax.areaId !== filters.areaId) continue;

    const existing = byTitulo.get(titulo);
    if (existing) {
      existing.total += 1;
      existing.bancas.add(row.banca);
    } else {
      byTitulo.set(titulo, {
        total: 1,
        bancas: new Set([row.banca]),
        disciplina,
        moduloNome: row.modulo_nome,
      });
    }
  }

  return byTitulo;
}

function filterHistoricoByActivity(
  historico: readonly HistoricoDesempenhoRow[],
  filters: DesempenhoEstudoFilters,
  now: Date,
): HistoricoDesempenhoRow[] {
  const periodStart = getDesempenhoPeriodStart(filters.periodo, now);
  if (!periodStart) return [...historico];
  return historico.filter((h) => new Date(h.created_at) >= periodStart);
}

function compareAssuntosWorstFirst(a: AssuntoPerformance, b: AssuntoPerformance): number {
  if (a.amostraSuficiente && b.amostraSuficiente) {
    if (a.percentual !== b.percentual) return (a.percentual ?? 100) - (b.percentual ?? 100);
  } else if (a.amostraSuficiente !== b.amostraSuficiente) {
    return a.amostraSuficiente ? -1 : 1;
  }
  if (a.respondidas !== b.respondidas) return b.respondidas - a.respondidas;
  return a.tituloAula.localeCompare(b.tituloAula, 'pt-BR');
}

function buildNextPractice(
  assuntos: AssuntoPerformance[],
  historicoJoined: Array<HistoricoDesempenhoRow & { tituloAula: string }>,
): PracticeFocus[] {
  const foci: PracticeFocus[] = [];
  const seen = new Set<string>();

  const push = (focus: PracticeFocus) => {
    if (seen.has(focus.tituloAula) || foci.length >= DESEMPENHO_NEXT_PRACTICE_LIMIT) return;
    seen.add(focus.tituloAula);
    foci.push(focus);
  };

  for (const a of assuntos) {
    if (!a.amostraSuficiente || a.percentual == null) continue;
    if (a.percentual >= 70) continue;
    push({
      tituloAula: a.tituloAula,
      reason: 'weak_accuracy',
      percentual: a.percentual,
      respondidas: a.respondidas,
      erros: a.erros,
      deepLinkAssunto: a.tituloAula,
    });
  }

  const unreviewedByTitulo = new Map<string, { erros: number; respondidas: number }>();
  for (const h of historicoJoined) {
    if (h.acertou) continue;
    if (h.estudo_reverso_concluido === true) continue;
    const cur = unreviewedByTitulo.get(h.tituloAula) ?? { erros: 0, respondidas: 0 };
    cur.erros += 1;
    cur.respondidas += 1;
    unreviewedByTitulo.set(h.tituloAula, cur);
  }

  const unreviewedSorted = [...unreviewedByTitulo.entries()].sort(
    (a, b) => b[1].erros - a[1].erros || a[0].localeCompare(b[0], 'pt-BR'),
  );
  for (const [titulo, stats] of unreviewedSorted) {
    const assunto = assuntos.find((a) => a.tituloAula === titulo);
    push({
      tituloAula: titulo,
      reason: 'wrong_unreviewed',
      percentual: assunto?.percentual ?? null,
      respondidas: assunto?.respondidas ?? stats.respondidas,
      erros: stats.erros,
      deepLinkAssunto: titulo,
    });
  }

  for (const a of assuntos) {
    if (a.totalDisponivel <= 0) continue;
    if (a.coberturaPct >= 40) continue;
    if (a.respondidas === 0 && a.totalDisponivel < 3) continue;
    push({
      tituloAula: a.tituloAula,
      reason: 'low_coverage',
      percentual: a.percentual,
      respondidas: a.respondidas,
      erros: a.erros,
      deepLinkAssunto: a.tituloAula,
    });
  }

  return foci;
}

function rollupAreas(assuntos: AssuntoPerformance[]): AreaPerformance[] {
  const byArea = new Map<GrandeAreaId, AssuntoPerformance[]>();
  for (const a of assuntos) {
    const list = byArea.get(a.areaId) ?? [];
    list.push(a);
    byArea.set(a.areaId, list);
  }

  const areas: AreaPerformance[] = [];
  for (const meta of GRANDE_AREAS) {
    const list = byArea.get(meta.id) ?? [];
    if (list.length === 0 && meta.id === 'outros') continue;
    if (list.length === 0) continue;

    const respondidas = list.reduce((s, x) => s + x.respondidas, 0);
    const acertos = list.reduce((s, x) => s + x.acertos, 0);
    const erros = list.reduce((s, x) => s + x.erros, 0);
    const totalDisponivel = list.reduce((s, x) => s + x.totalDisponivel, 0);

    areas.push({
      areaId: meta.id,
      areaLabel: meta.label,
      riskBandId: meta.riskBandId,
      respondidas,
      acertos,
      erros,
      percentual: pctOrNull(acertos, respondidas),
      coberturaPct: coberturaPct(respondidas, totalDisponivel),
      totalDisponivel,
      amostraSuficiente: respondidas >= DESEMPENHO_MIN_SAMPLE,
      assuntos: [...list].sort(compareAssuntosWorstFirst),
    });
  }

  return areas.sort((a, b) => {
    const oa = getGrandeAreaMeta(a.areaId).order;
    const ob = getGrandeAreaMeta(b.areaId).order;
    return oa - ob;
  });
}

function rollupRiskBands(assuntos: AssuntoPerformance[]): RiskBandPerformance[] {
  const byBand = new Map<RiskBandId, AssuntoPerformance[]>();
  for (const a of assuntos) {
    const list = byBand.get(a.riskBandId) ?? [];
    list.push(a);
    byBand.set(a.riskBandId, list);
  }

  const bands: RiskBandPerformance[] = [];
  for (const meta of RISK_BANDS) {
    const list = byBand.get(meta.id) ?? [];
    if (list.length === 0) continue;

    const respondidas = list.reduce((s, x) => s + x.respondidas, 0);
    const acertos = list.reduce((s, x) => s + x.acertos, 0);
    const erros = list.reduce((s, x) => s + x.erros, 0);
    const totalDisponivel = list.reduce((s, x) => s + x.totalDisponivel, 0);

    bands.push({
      riskBandId: meta.id,
      label: meta.label,
      respondidas,
      acertos,
      erros,
      percentual: pctOrNull(acertos, respondidas),
      coberturaPct: coberturaPct(respondidas, totalDisponivel),
      totalDisponivel,
      amostraSuficiente: respondidas >= DESEMPENHO_MIN_SAMPLE,
    });
  }

  return bands.sort(
    (a, b) => getRiskBandMeta(a.riskBandId).order - getRiskBandMeta(b.riskBandId).order,
  );
}

/**
 * Agrega desempenho de estudo: join `historico.modulo_slug` × catálogo →
 * agrupamento por `titulo_aula` (mesma chave da vitrine).
 *
 * Métricas honestas (upsert 1 linha/questão):
 * - respondidas = questões distintas
 * - % acerto = acertos ÷ respondidas (estado atual)
 * - cobertura = respondidas ÷ total liberado no assunto
 * - período = filtro de “atividade no período” (última prática)
 */
export function aggregateStudyPerformance(
  historicoInput: readonly (HistoricoQuestao | HistoricoDesempenhoRow)[],
  catalogInput: readonly (ModuloEstudoListRow | CatalogDesempenhoRow)[],
  filtersInput?: Partial<DesempenhoEstudoFilters> | null,
  now: Date = new Date(),
): DesempenhoEstudoData {
  const filters = normalizeFilters(filtersInput);
  const catalog = toCatalogRows(catalogInput);
  const historicoAll = toHistoricoRows(historicoInput);
  const slugIndex = buildSlugIndex(catalog);
  const catalogByTitulo = countCatalogByTitulo(catalog, filters);

  const historicoPeriod = filterHistoricoByActivity(historicoAll, filters, now);

  type Acc = {
    respondidas: number;
    acertos: number;
    erros: number;
    ultimaPratica: string | null;
    bancas: Set<string>;
    disciplina: VitrineDisciplinaId;
  };

  const accByTitulo = new Map<string, Acc>();
  const historicoJoined: Array<HistoricoDesempenhoRow & { tituloAula: string }> = [];

  for (const h of historicoPeriod) {
    const slug = h.modulo_slug?.trim();
    if (!slug) continue;
    const info = slugIndex.get(slug);
    const tituloAula = info?.tituloAula ?? TITULO_ORFAO;
    const disciplina = info?.disciplina ?? 'enfermagem';
    const bancaCatalog = info?.banca ?? h.banca ?? null;

    if (filters.disciplina && disciplina !== filters.disciplina) continue;
    if (filters.banca) {
      const bancaMatch = bancaCatalog === filters.banca || h.banca === filters.banca;
      if (!bancaMatch) continue;
    }

    const tax = resolveTaxonomiaAssunto(tituloAula === TITULO_ORFAO ? null : tituloAula);
    if (filters.areaId && tax.areaId !== filters.areaId) continue;

    // Placeholders (marcar estudado sem alternativa) não entram no placar/%/recentes.
    if (!isRespondida(h)) continue;

    historicoJoined.push({ ...h, tituloAula });

    const existing = accByTitulo.get(tituloAula);
    if (existing) {
      existing.respondidas += 1;
      if (h.acertou) existing.acertos += 1;
      else existing.erros += 1;
      if (!existing.ultimaPratica || h.created_at > existing.ultimaPratica) {
        existing.ultimaPratica = h.created_at;
      }
      if (bancaCatalog) existing.bancas.add(bancaCatalog);
    } else {
      accByTitulo.set(tituloAula, {
        respondidas: 1,
        acertos: h.acertou ? 1 : 0,
        erros: h.acertou ? 0 : 1,
        ultimaPratica: h.created_at,
        bancas: new Set(bancaCatalog ? [bancaCatalog] : []),
        disciplina,
      });
    }
  }

  const tituloKeys = new Set<string>([...catalogByTitulo.keys(), ...accByTitulo.keys()]);
  const assuntos: AssuntoPerformance[] = [];

  for (const tituloAula of tituloKeys) {
    const catalogInfo = catalogByTitulo.get(tituloAula);
    const acc = accByTitulo.get(tituloAula);
    const respondidas = acc?.respondidas ?? 0;
    const acertos = acc?.acertos ?? 0;
    const erros = acc?.erros ?? 0;
    const totalDisponivel = catalogInfo?.total ?? respondidas;
    const tax = resolveTaxonomiaAssunto(tituloAula === TITULO_ORFAO ? null : tituloAula);
    const disciplina = catalogInfo?.disciplina ?? acc?.disciplina ?? 'enfermagem';
    const bancas = [
      ...new Set([...(catalogInfo?.bancas ?? []), ...(acc?.bancas ?? [])]),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    if (filters.areaId && tax.areaId !== filters.areaId) continue;
    if (filters.disciplina && disciplina !== filters.disciplina) continue;

    assuntos.push({
      tituloAula,
      canonicalSubtopico: tax.canonicalSubtopico,
      areaId: tax.areaId,
      areaLabel: tax.areaLabel,
      riskBandId: tax.riskBandId,
      disciplina,
      respondidas,
      acertos,
      erros,
      percentual: pctOrNull(acertos, respondidas),
      coberturaPct: coberturaPct(respondidas, totalDisponivel),
      totalDisponivel,
      ultimaPratica: acc?.ultimaPratica ?? null,
      amostraSuficiente: respondidas >= DESEMPENHO_MIN_SAMPLE,
      bancas,
    });
  }

  assuntos.sort(compareAssuntosWorstFirst);

  const areas = rollupAreas(assuntos);
  const riskBands = rollupRiskBands(assuntos);

  const placarRespondidas = historicoJoined.length;
  const placarAcertos = historicoJoined.filter((h) => h.acertou).length;
  const placarErros = placarRespondidas - placarAcertos;

  const dayStart = startOfLocalDay(now);
  const respondidasHoje = historicoAll.filter((h) => {
    if (!isRespondida(h)) return false;
    const slug = h.modulo_slug?.trim();
    if (!slug) return false;
    const info = slugIndex.get(slug);
    if (filters.disciplina && (info?.disciplina ?? 'enfermagem') !== filters.disciplina) {
      return false;
    }
    if (filters.banca) {
      const bancaCatalog = info?.banca ?? h.banca ?? null;
      if (bancaCatalog !== filters.banca && h.banca !== filters.banca) return false;
    }
    return new Date(h.created_at) >= dayStart;
  }).length;

  const weakAreas = assuntos
    .filter((a) => a.amostraSuficiente && a.percentual != null && a.percentual < 70)
    .sort(compareAssuntosWorstFirst);

  const recentAttempts: RecentAttempt[] = [...historicoJoined]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
    .map((h) => ({
      id: h.id,
      moduloSlug: h.modulo_slug,
      tituloAula: h.tituloAula === TITULO_ORFAO ? null : h.tituloAula,
      acertou: h.acertou,
      estudoReversoConcluido: h.estudo_reverso_concluido === true,
      createdAt: h.created_at,
    }));

  return {
    placar: {
      respondidas: placarRespondidas,
      acertos: placarAcertos,
      erros: placarErros,
      percentual: pctOrNull(placarAcertos, placarRespondidas),
      metaDoDia: {
        respondidasHoje,
        meta: DESEMPENHO_META_DIA_DEFAULT,
      },
      coachUnlocked: placarRespondidas >= DESEMPENHO_COACH_UNLOCK,
    },
    assuntos,
    areas,
    riskBands,
    weakAreas,
    nextPractice: buildNextPractice(assuntos, historicoJoined),
    recentAttempts,
    filtersApplied: filters,
    /** Agregação pura (sem ledger) — orquestração preenche em `getDesempenhoEstudoData`. */
    attemptSeries: {
      available: false,
      unavailableReason: 'flag_off',
      daily: [],
      tempoMedioMs: null,
      firstAttemptAccuracyPct: null,
      attemptsPerQuestionAvg: null,
      totalEvents: 0,
      distinctQuestions: 0,
      dadosDesde: null,
      coberturaParcial: false,
    },
  };
}

/**
 * Orquestra fontes P0: histórico analytics + catálogo com entitlements.
 * P4: ledger EE (`attemptSeries`) quando `EE_V1_INSTRUMENTATION` está on.
 * Não toca em `lib/cache.ts` / proxy — só consome APIs existentes (+ cache USER do analytics).
 */
export async function getDesempenhoEstudoData(
  userId: string,
  filters?: Partial<DesempenhoEstudoFilters> | null,
  now: Date = new Date(),
): Promise<DesempenhoEstudoData> {
  const [
    { getHistoricoCompleto },
    { getModulosEstudoForUserCached },
    { getAttemptSeriesData },
  ] = await Promise.all([
    import('@/lib/analytics'),
    import('@/lib/cache'),
    import('@/lib/desempenho/attemptSeries'),
  ]);

  const [historico, catalog] = await Promise.all([
    getHistoricoCompleto(userId),
    getModulosEstudoForUserCached(userId),
  ]);

  const historicoComReverso = historico as Array<
    HistoricoQuestao & { estudo_reverso_concluido?: boolean | null }
  >;

  const data = aggregateStudyPerformance(historicoComReverso, catalog, filters, now);

  const respondidasRows = historicoComReverso.filter(
    (h) => h.respondida !== false && Boolean(h.modulo_slug?.trim()),
  );
  const historicoOldestAt =
    respondidasRows.length > 0
      ? respondidasRows.reduce(
          (min, h) => (h.created_at < min ? h.created_at : min),
          respondidasRows[0]!.created_at,
        )
      : null;

  const attemptSeries = await getAttemptSeriesData({
    userId,
    periodo: data.filtersApplied.periodo,
    now,
    historicoOldestAt,
    historicoRespondidas: respondidasRows.length,
  });

  return { ...data, attemptSeries };
}
