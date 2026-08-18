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
import { SCALE_LIMITS } from '@/lib/scale/constants';
import {
  DESEMPENHO_COACH_UNLOCK,
  DESEMPENHO_HOME_RECENT_LIMIT,
  DESEMPENHO_META_DIA_DEFAULT,
  DESEMPENHO_MIN_SAMPLE,
  DESEMPENHO_NEXT_PRACTICE_LIMIT,
  DESEMPENHO_PERIODOS,
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
import { desempenhoConfidenceId } from '@/lib/desempenho/confidence';
import {
  getDesempenhoPeriodRange,
  isWithinDesempenhoPeriod,
  toDesempenhoDayKey,
  type DesempenhoPeriodRange,
} from '@/lib/desempenho/periodo';
import { toFreemiumTimezoneYmd } from '@/lib/freemium/constants';
import type {
  AggregateAttemptSeriesOptions,
  AttemptSeriesRead,
} from '@/lib/desempenho/attemptSeries';

export { DESEMPENHO_PERIODOS };

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

function normalizeFilters(
  filters?: Partial<DesempenhoEstudoFilters> | null,
): DesempenhoEstudoFilters {
  const areaId = filters?.areaId ?? null;
  const assunto = areaId ? filters?.assunto?.trim() || null : null;
  return {
    periodo: filters?.periodo ?? 'all',
    banca: filters?.banca?.trim() || null,
    areaId,
    disciplina: filters?.disciplina ?? null,
    assunto,
  };
}

/**
 * Normaliza `searchParams` da página `/desempenho` (periodo, banca, area, disciplina, assunto).
 * Valores inválidos caem no default sem filtrar. Assunto sem área é descartado.
 */
export function normalizeDesempenhoEstudoFilters(input: {
  periodoRaw?: string | null;
  bancaRaw?: string | null;
  areaRaw?: string | null;
  disciplinaRaw?: string | null;
  assuntoRaw?: string | null;
}): DesempenhoEstudoFilters {
  const periodo = DESEMPENHO_PERIODOS.includes(input.periodoRaw as DesempenhoPeriodo)
    ? (input.periodoRaw as DesempenhoPeriodo)
    : 'all';

  return normalizeFilters({
    periodo,
    banca: input.bancaRaw,
    areaId: parseGrandeAreaId(input.areaRaw),
    disciplina: parseVitrineDisciplina(input.disciplinaRaw),
    assunto: input.assuntoRaw,
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

/** Metadados P0 que a série EE precisa depois do ledger (cobertura / oldest). */
export function historicoAttemptSeriesMeta(
  historico: readonly HistoricoDesempenhoRow[],
): { historicoOldestAt: string | null; historicoRespondidas: number } {
  const respondidasRows = historico.filter(
    (h) => isRespondida(h) && Boolean(h.modulo_slug?.trim()),
  );
  const historicoOldestAt =
    respondidasRows.length > 0
      ? respondidasRows.reduce(
          (min, h) => (h.created_at < min ? h.created_at : min),
          respondidasRows[0]!.created_at,
        )
      : null;
  return { historicoOldestAt, historicoRespondidas: respondidasRows.length };
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
    if (filters.assunto && titulo !== filters.assunto) continue;

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

function listAssuntoOpcoes(
  catalog: readonly CatalogDesempenhoRow[],
  filters: DesempenhoEstudoFilters,
): string[] {
  const semAssunto: DesempenhoEstudoFilters = { ...filters, assunto: null };
  const byTitulo = countCatalogByTitulo(catalog, semAssunto);
  return [...byTitulo.keys()]
    .filter((titulo) => titulo !== TITULO_ORFAO)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function historicoPassaCatalogo(
  h: HistoricoDesempenhoRow,
  slugIndex: Map<string, SlugCatalogInfo>,
  recorte: Pick<DesempenhoEstudoFilters, 'disciplina' | 'banca'>,
): { tituloAula: string; disciplina: VitrineDisciplinaId; bancaCatalog: string | null } | null {
  const slug = h.modulo_slug?.trim();
  if (!slug) return null;
  const info = slugIndex.get(slug);
  const tituloAula = info?.tituloAula ?? TITULO_ORFAO;
  const disciplina = info?.disciplina ?? 'enfermagem';
  const bancaCatalog = info?.banca ?? h.banca ?? null;

  if (recorte.disciplina && disciplina !== recorte.disciplina) return null;
  if (recorte.banca) {
    const bancaMatch = bancaCatalog === recorte.banca || h.banca === recorte.banca;
    if (!bancaMatch) return null;
  }
  return { tituloAula, disciplina, bancaCatalog };
}

function countUniversoRespondidas(
  historicoAll: readonly HistoricoDesempenhoRow[],
  slugIndex: Map<string, SlugCatalogInfo>,
  filters: DesempenhoEstudoFilters,
): number {
  let total = 0;
  for (const h of historicoAll) {
    if (!isRespondida(h)) continue;
    if (!historicoPassaCatalogo(h, slugIndex, filters)) continue;
    total += 1;
  }
  return total;
}

/** Atividade dentro do recorte civil de Brasília `[start, endExclusive)`. */
function filterHistoricoByActivity(
  historico: readonly HistoricoDesempenhoRow[],
  range: DesempenhoPeriodRange,
): HistoricoDesempenhoRow[] {
  return historico.filter((h) => isWithinDesempenhoPeriod(h.created_at, range));
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

/** Prática mais antiga primeiro; sem data confiável vai para o fim. */
function compareUltimaPraticaAsc(a: AssuntoPerformance, b: AssuntoPerformance): number {
  if (a.ultimaPratica && b.ultimaPratica) return a.ultimaPratica.localeCompare(b.ultimaPratica);
  if (a.ultimaPratica) return -1;
  if (b.ultimaPratica) return 1;
  return 0;
}

function compareAlfabetico(a: AssuntoPerformance, b: AssuntoPerformance): number {
  return a.tituloAula.localeCompare(b.tituloAula, 'pt-BR');
}

/** Cobertura mínima disponível para sugerir "praticar mais deste assunto". */
const LOW_COVERAGE_MIN_DISPONIVEL = 3;
const LOW_COVERAGE_MAX_PCT = 40;
const WEAK_ACCURACY_MAX_PCT = 70;

/**
 * Fila de prioridade **determinística e explicável** (docs/PROMPT_DESEMPENHO_TEC_ADAPTADO §6.3):
 *
 * 1. erros atuais sem estudo reverso concluído, por quantidade de erros;
 * 2. menor taxa de acerto com amostra ≥ 5 (desempate: maior amostra);
 * 3. menor cobertura com ao menos 3 questões disponíveis;
 * 4. prática mais antiga;
 * 5. ordem alfabética estável.
 *
 * Sem "importância em prova" / "alta incidência": não há fonte auditável de frequência.
 */
function buildNextPractice(assuntos: AssuntoPerformance[]): PracticeFocus[] {
  const foci: PracticeFocus[] = [];
  const seen = new Set<string>();

  const push = (assunto: AssuntoPerformance, reason: PracticeFocus['reason']) => {
    if (seen.has(assunto.tituloAula) || foci.length >= DESEMPENHO_NEXT_PRACTICE_LIMIT) return;
    seen.add(assunto.tituloAula);
    foci.push({
      tituloAula: assunto.tituloAula,
      reason,
      percentual: assunto.percentual,
      respondidas: assunto.respondidas,
      acertos: assunto.acertos,
      erros: assunto.erros,
      errosSemReverso: assunto.errosSemReverso,
      coberturaPct: assunto.coberturaPct,
      totalDisponivel: assunto.totalDisponivel,
      confidenceId: assunto.confidenceId,
      deepLinkAssunto: assunto.tituloAula,
    });
  };

  // 1. Evento concreto: errou e ainda não fez o estudo reverso (não exige amostra mínima).
  [...assuntos]
    .filter((a) => a.errosSemReverso > 0)
    .sort(
      (a, b) =>
        b.errosSemReverso - a.errosSemReverso ||
        compareUltimaPraticaAsc(a, b) ||
        compareAlfabetico(a, b),
    )
    .forEach((a) => push(a, 'wrong_unreviewed'));

  // 2. Baixo acerto com amostra suficiente (diagnóstico estatístico).
  [...assuntos]
    .filter(
      (a) => a.amostraSuficiente && a.percentual != null && a.percentual < WEAK_ACCURACY_MAX_PCT,
    )
    .sort(
      (a, b) =>
        (a.percentual ?? 100) - (b.percentual ?? 100) ||
        b.respondidas - a.respondidas ||
        compareUltimaPraticaAsc(a, b) ||
        compareAlfabetico(a, b),
    )
    .forEach((a) => push(a, 'weak_accuracy'));

  // 3. Cobertura baixa com material disponível suficiente.
  [...assuntos]
    .filter(
      (a) =>
        a.totalDisponivel >= LOW_COVERAGE_MIN_DISPONIVEL &&
        a.coberturaPct < LOW_COVERAGE_MAX_PCT,
    )
    .sort(
      (a, b) =>
        a.coberturaPct - b.coberturaPct ||
        b.totalDisponivel - a.totalDisponivel ||
        compareUltimaPraticaAsc(a, b) ||
        compareAlfabetico(a, b),
    )
    .forEach((a) => push(a, 'low_coverage'));

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
      confidenceId: desempenhoConfidenceId(respondidas),
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
      confidenceId: desempenhoConfidenceId(respondidas),
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
  loadState: DesempenhoEstudoData['loadState'] = 'ok',
  recentLimit: number = DESEMPENHO_HOME_RECENT_LIMIT * 4,
): DesempenhoEstudoData {
  const filters = normalizeFilters(filtersInput);
  const catalog = toCatalogRows(catalogInput);
  const historicoAll = toHistoricoRows(historicoInput);
  const slugIndex = buildSlugIndex(catalog);
  const catalogByTitulo = countCatalogByTitulo(catalog, filters);
  const assuntoOpcoes = listAssuntoOpcoes(catalog, filters);

  const range = getDesempenhoPeriodRange(filters.periodo, now);
  const historicoPeriod = filterHistoricoByActivity(historicoAll, range);

  type Acc = {
    respondidas: number;
    acertos: number;
    erros: number;
    errosSemReverso: number;
    ultimaPratica: string | null;
    bancas: Set<string>;
    disciplina: VitrineDisciplinaId;
  };

  const accByTitulo = new Map<string, Acc>();
  const historicoJoined: Array<HistoricoDesempenhoRow & { tituloAula: string }> = [];

  for (const h of historicoPeriod) {
    const joined = historicoPassaCatalogo(h, slugIndex, filters);
    if (!joined) continue;
    const { tituloAula, disciplina, bancaCatalog } = joined;

    const tax = resolveTaxonomiaAssunto(tituloAula === TITULO_ORFAO ? null : tituloAula);
    if (filters.areaId && tax.areaId !== filters.areaId) continue;
    if (filters.assunto && tituloAula !== filters.assunto) continue;

    // Placeholders (marcar estudado sem alternativa) não entram no placar/%/recentes.
    if (!isRespondida(h)) continue;

    historicoJoined.push({ ...h, tituloAula });

    const erroSemReverso = !h.acertou && h.estudo_reverso_concluido !== true ? 1 : 0;

    const existing = accByTitulo.get(tituloAula);
    if (existing) {
      existing.respondidas += 1;
      if (h.acertou) existing.acertos += 1;
      else existing.erros += 1;
      existing.errosSemReverso += erroSemReverso;
      if (!existing.ultimaPratica || h.created_at > existing.ultimaPratica) {
        existing.ultimaPratica = h.created_at;
      }
      if (bancaCatalog) existing.bancas.add(bancaCatalog);
    } else {
      accByTitulo.set(tituloAula, {
        respondidas: 1,
        acertos: h.acertou ? 1 : 0,
        erros: h.acertou ? 0 : 1,
        errosSemReverso: erroSemReverso,
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
      confidenceId: desempenhoConfidenceId(respondidas),
      errosSemReverso: acc?.errosSemReverso ?? 0,
      bancas,
    });
  }

  assuntos.sort(compareAssuntosWorstFirst);

  const areas = rollupAreas(assuntos);
  const riskBands = rollupRiskBands(assuntos);

  const placarRespondidas = historicoJoined.length;
  const placarAcertos = historicoJoined.filter((h) => h.acertou).length;
  const placarErros = placarRespondidas - placarAcertos;

  // Meta do dia = data civil de hoje em Brasília (não o fuso do runtime).
  const todayYmd = toFreemiumTimezoneYmd(now);
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
    return toDesempenhoDayKey(h.created_at, now) === todayYmd;
  }).length;

  const weakAreas = assuntos
    .filter((a) => a.amostraSuficiente && a.percentual != null && a.percentual < 70)
    .sort(compareAssuntosWorstFirst);

  const recentAttempts: RecentAttempt[] = [...historicoJoined]
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id))
    .slice(0, recentLimit)
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
      confidenceId: desempenhoConfidenceId(placarRespondidas),
    },
    assuntos,
    areas,
    riskBands,
    weakAreas,
    nextPractice: buildNextPractice(assuntos),
    recentAttempts,
    filtersApplied: filters,
    universoRespondidas: countUniversoRespondidas(historicoAll, slugIndex, filters),
    assuntoOpcoes,
    leituraTruncada: historicoAll.length >= SCALE_LIMITS.HISTORICO_ANALYTICS_READ,
    periodoResumo: {
      periodo: range.periodo,
      startYmd: range.startYmd,
      endYmdInclusive: range.endYmdInclusive,
      civilDays: range.civilDays,
    },
    loadState,
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
      truncated: false,
      limiteRegistros: null,
    },
  };
}

export type LoadDesempenhoEstudoCoreOptions = {
  recentLimit?: number;
  /** Liga a I/O do ledger EE em paralelo com histórico+catálogo. Default true. */
  startAttemptSeries?: boolean;
  /** Override de flag EE (testes). */
  instrumentationEnabled?: boolean;
};

export type DesempenhoEstudoCoreLoad = {
  data: DesempenhoEstudoData;
  /** Null quando a série não deve ir (mapa/histórico, flag off, ou skip). */
  seriesReadPromise: Promise<AttemptSeriesRead> | null;
  seriesOptions: AggregateAttemptSeriesOptions;
};

/**
 * P0 (histórico + catálogo + agregação) e, se pedido, dispara o ledger EE
 * no mesmo tick — sem esperar o join JS. Não toca em `lib/cache.ts` / proxy.
 */
export async function loadDesempenhoEstudoCore(
  userId: string,
  filters?: Partial<DesempenhoEstudoFilters> | null,
  now: Date = new Date(),
  options?: LoadDesempenhoEstudoCoreOptions,
): Promise<DesempenhoEstudoCoreLoad> {
  const startAttemptSeries = options?.startAttemptSeries ?? true;

  const [{ getHistoricoCompleto }, { getModulosEstudoForUserCached }, attemptSeriesMod, envMod] =
    await Promise.all([
      import('@/lib/analytics'),
      import('@/lib/cache'),
      import('@/lib/desempenho/attemptSeries'),
      import('@/lib/env'),
    ]);

  const instrumentationEnabled =
    options?.instrumentationEnabled ?? envMod.isEvidenceV1InstrumentationEnabled();
  const seriesReadPromise =
    startAttemptSeries && instrumentationEnabled
      ? attemptSeriesMod.beginAttemptSeriesRead(userId, true)
      : null;

  const [historico, catalog] = await Promise.all([
    getHistoricoCompleto(userId),
    getModulosEstudoForUserCached(userId),
  ]);

  const historicoComReverso = historico as Array<
    HistoricoQuestao & { estudo_reverso_concluido?: boolean | null }
  >;

  const data = aggregateStudyPerformance(
    historicoComReverso,
    catalog,
    filters,
    now,
    'ok',
    options?.recentLimit,
  );

  const meta = historicoAttemptSeriesMeta(historicoComReverso);
  const seriesOptions: AggregateAttemptSeriesOptions = {
    periodo: data.filtersApplied.periodo,
    now,
    historicoOldestAt: meta.historicoOldestAt,
    historicoRespondidas: meta.historicoRespondidas,
  };

  return { data, seriesReadPromise, seriesOptions };
}

export async function resolveAttemptSeriesOnCore(
  core: DesempenhoEstudoCoreLoad,
): Promise<DesempenhoEstudoData> {
  if (!core.seriesReadPromise) {
    return core.data;
  }
  const { finishAttemptSeries } = await import('@/lib/desempenho/attemptSeries');
  return {
    ...core.data,
    attemptSeries: finishAttemptSeries(await core.seriesReadPromise, core.seriesOptions),
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
  options?: LoadDesempenhoEstudoCoreOptions,
): Promise<DesempenhoEstudoData> {
  const core = await loadDesempenhoEstudoCore(userId, filters, now, options);
  return resolveAttemptSeriesOnCore(core);
}
