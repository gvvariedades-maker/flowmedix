'use client';

import {
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  RefreshCw,
} from 'lucide-react';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import {
  vitrineFacetsQueryKey,
  vitrineListQueryKey,
  parseVitrineStatus,
  parseVitrineView,
  readStoredVitrineView,
  writeStoredVitrineView,
  type VitrineListQuery,
  type VitrineViewMode,
} from '@/lib/vitrine/parseListQuery';
import {
  filterVitrineGroupsByStatus,
  isPendingVitrineGroup,
  isNewVitrineGroup,
  vitrineStatusFilterLabel,
  type VitrineStatusFilter,
} from '@/lib/vitrine/filterGroups';
import type { VitrineFacets, VitrinePageResponse } from '@/lib/vitrine/types';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { VitrinePaginationBar } from '@/components/vitrine/VitrinePaginationBar';
import VitrinePageHeader from '@/components/vitrine/VitrinePageHeader';
import VitrineSubjectCard from '@/components/vitrine/VitrineSubjectCard';
import VitrineToolbar from '@/components/vitrine/VitrineToolbar';
import VitrineResumeCard from '@/components/vitrine/VitrineResumeCard';
import SimuladoDiagnosticoCard from '@/components/vitrine/SimuladoDiagnosticoCard';
import WeeklySimuladoMissionCard from '@/components/vitrine/WeeklySimuladoMissionCard';
import VitrineQuickFilters from '@/components/vitrine/VitrineQuickFilters';
import VitrineDisciplinePicker from '@/components/vitrine/VitrineDisciplinePicker';
import type { VitrineResumeHint } from '@/lib/vitrine/resume';
import {
  guessDisciplinaFromTituloAula,
  isVitrineDisciplineHubMode,
  parseVitrineDisciplina,
  type VitrineDisciplinaId,
} from '@/lib/vitrine/disciplina';
import type { DiagnosticoSimuladoCardState, WeeklySimuladoMission } from '@/lib/simulado/types';
import { vitrineContainerVariants } from '@/components/vitrine/vitrineMotion';
import { multiFilterResumo } from '@/lib/questao-filter/multiFilterResumo';
import { scrollDashboardMainToTop } from '@/lib/layout/dashboardMainScroll';
import { MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM } from '@/lib/layout/mobileBottomNav';
import { useVitrineVisiblePrefetch } from '@/hooks/useVitrineVisiblePrefetch';
import { useVitrineListSwr } from '@/hooks/useVitrineListSwr';
import { buildVitrineEstudarQuery } from '@/lib/vitrine/estudarQuery';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';

const VITRINE_SEARCH_DEBOUNCE_MS = 350;

const VITRINE_FILTER_QUERY_KEYS = new Set([
  'banca',
  'bancas',
  'assunto',
  'assuntos',
  'q',
  'page',
  'status',
  'view',
  'disciplina',
]);

function readMultiQueryParam(
  searchParams: { getAll: (key: string) => string[] },
  keys: string[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of keys) {
    for (const raw of searchParams.getAll(key)) {
      const value = raw.trim();
      if (value && !seen.has(value)) {
        seen.add(value);
        out.push(value);
      }
    }
  }
  return out;
}

function stringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

/** Evita aplicar paginação de cache SWR (keepPreviousData) de outra página/filtro. */
function vitrineResponseMatchesListKey(
  data: VitrinePageResponse,
  requested: VitrineListQuery,
): boolean {
  return (
    vitrineListQueryKey({
      page: data.pagination.page,
      bancas: requested.bancas,
      assuntos: requested.assuntos,
      q: requested.q,
      disciplina: requested.disciplina,
    }) === vitrineListQueryKey(requested)
  );
}

/** Query de filtros na barra de endereço (preserva cidade, concurso, etc.). */
function buildVitrineLocationSearch(
  searchParams: { forEach: (cb: (value: string, key: string) => void) => void },
  filters: {
    bancas: string[];
    assuntos: string[];
    searchTerm: string;
    pagina: number;
    status: VitrineStatusFilter;
    view: VitrineViewMode;
    disciplina: VitrineDisciplinaId | null;
  },
): string {
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (!VITRINE_FILTER_QUERY_KEYS.has(key)) {
      params.append(key, value);
    }
  });
  filters.bancas.forEach((b) => params.append('banca', b));
  filters.assuntos.forEach((a) => params.append('assunto', a));
  if (filters.searchTerm.trim()) params.set('q', filters.searchTerm.trim());
  if (filters.pagina > 1) params.set('page', String(filters.pagina));
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.view === 'compact') params.set('view', 'compact');
  if (filters.disciplina) params.set('disciplina', filters.disciplina);
  const query = params.toString();
  return query ? `?${query}` : '';
}

function normalizeLocationSearch(search: string): string {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  if (!raw) return '';
  const params = new URLSearchParams(raw);
  const entries = [...params.entries()].sort(
    (a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]),
  );
  const normalized = new URLSearchParams(entries).toString();
  return normalized ? `?${normalized}` : '';
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface VitrineClientProps {
  /** Título quando a URL não traz `?cidade=` (ex.: nome do edital matriculado). */
  fallbackTitulo?: string;
  /** Server Component (ex.: contadores globais do catálogo) — renderizado acima da lista de assuntos. */
  children?: ReactNode;
  /** Query da URL já resolvida no RSC (alinha hidratação com SSR). */
  initialListQuery?: VitrineListQuery;
  /** Primeira página da vitrine pré-carregada no servidor. */
  initialPageData?: VitrinePageResponse | null;
  /** Facets pré-carregados no servidor. */
  initialFacetsData?: VitrineFacets | null;
  /** Erro explícito do SSR — exibe banner de retry em vez de skeleton infinito. */
  initialPayloadError?: string | null;
  /** Chaves para pular o 1º fetch client quando bater com a query atual. */
  ssrListQueryKey?: string;
  ssrFacetsQueryKey?: string;
  /** Última questão estudada (SSR) — card "Continuar" na vitrine sem filtros. */
  initialResume?: VitrineResumeHint | null;
  /** Estado do simulado diagnóstico inicial (SSR) — card de boas-vindas. */
  initialDiagnostico?: DiagnosticoSimuladoCardState | null;
  /** Simulado da Semana personalizado (SSR). */
  initialWeeklyMission?: WeeklySimuladoMission | null;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function VitrineClient({
  fallbackTitulo: _fallbackTitulo = 'Estudo Reverso',
  children,
  initialListQuery,
  initialPageData = null,
  initialFacetsData = null,
  initialPayloadError = null,
  ssrListQueryKey,
  ssrFacetsQueryKey,
  initialResume = null,
  initialDiagnostico = null,
  initialWeeklyMission = null,
}: VitrineClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const ssrQuery = initialListQuery ?? {
    page: 1,
    bancas: [] as string[],
    assuntos: [] as string[],
    q: undefined as string | undefined,
    status: 'all' as VitrineStatusFilter,
    view: 'grid' as VitrineViewMode,
    disciplina: null as VitrineDisciplinaId | null,
  };

  /**
   * Estado inicial alinhado ao SSR quando `initialListQuery` veio do RSC.
   * `useLayoutEffect` ainda sincroniza mudanças de URL após navegação client-side.
   */
  const [searchTerm, setSearchTerm] = useState(ssrQuery.q ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(ssrQuery.q ?? '');
  const [bancasSelecionadas, setBancasSelecionadas] = useState<string[]>(ssrQuery.bancas);
  const [assuntosSelecionados, setAssuntosSelecionados] = useState<string[]>(ssrQuery.assuntos);
  const [pagina, setPagina] = useState(ssrQuery.page);
  const [statusFilter, setStatusFilter] = useState<VitrineStatusFilter>(ssrQuery.status);
  const [viewMode, setViewMode] = useState<VitrineViewMode>(ssrQuery.view);
  const [disciplina, setDisciplina] = useState<VitrineDisciplinaId | null>(ssrQuery.disciplina);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [bancas, setBancas] = useState<string[]>(() => initialFacetsData?.bancas ?? []);
  const [assuntos, setAssuntos] = useState<string[]>(() => initialFacetsData?.assuntos ?? []);
  const [facetsLoading, setFacetsLoading] = useState(() => !initialFacetsData);
  const [ssrErrorDismissed, setSsrErrorDismissed] = useState(false);
  const [weeklyMission, setWeeklyMission] = useState<WeeklySimuladoMission | null>(
    initialWeeklyMission,
  );
  const [retryNonce, setRetryNonce] = useState(0);
  const vitrineListaRef = useRef<HTMLDivElement>(null);
  const vitrinePaginationInlineRef = useRef<HTMLElement>(null);
  const totalPaginasRef = useRef(1);
  /** Persiste entre soft-nav; zera ao abrir questão para não voltar com card aberto. */
  const [expandedPanelSlug, setExpandedPanelSlug] = useState<string | null>(null);
  /** Evita scroll ao topo quando setPagina(1) veio de filtro/busca, não de Anterior/Próxima. */
  const paginaViaFiltroRef = useRef(false);
  /** Evita gravar na URL antes de ler os filtros (impede loop com estado inicial vazio). */
  const filtersHydratedFromUrlRef = useRef(Boolean(initialListQuery));
  /** Última query já aplicada ao estado (evita re-sync URL→estado com mesma string). */
  const vitrineUrlSyncedRef = useRef<string | null>(null);
  const ssrFacetsConsumedRef = useRef(false);
  const searchParamsRef = useRef(searchParams);
  /** Evita re-sync URL→estado quando `useSearchParams()` muda referência sem mudar query. */
  const searchParamsString = searchParams.toString();

  const vitrineListQuery = useMemo(
    (): VitrineListQuery => ({
      page: pagina,
      bancas: bancasSelecionadas,
      assuntos: assuntosSelecionados,
      q: debouncedSearch || undefined,
      status: statusFilter,
      view: viewMode,
      disciplina,
    }),
    [
      pagina,
      bancasSelecionadas,
      assuntosSelecionados,
      debouncedSearch,
      statusFilter,
      viewMode,
      disciplina,
    ],
  );

  const {
    data: vitrinePageData,
    error: vitrineFetchError,
    isLoading: vitrineLoading,
    isValidating: vitrineValidating,
  } = useVitrineListSwr(vitrineListQuery, {
    fallbackData: initialPageData,
    ssrListQueryKey,
    retryNonce,
  });

  const gruposPagina = useMemo(
    () => vitrinePageData?.groups ?? [],
    [vitrinePageData?.groups],
  );
  const gruposFiltrados = useMemo(
    () => filterVitrineGroupsByStatus(gruposPagina, statusFilter),
    [gruposPagina, statusFilter],
  );
  const statusCounts = useMemo(
    () => ({
      all: gruposPagina.length,
      pending: gruposPagina.filter(isPendingVitrineGroup).length,
      new: gruposPagina.filter(isNewVitrineGroup).length,
    }),
    [gruposPagina],
  );
  const totalAssuntos = vitrinePageData?.pagination.totalGroups ?? 0;
  const totalPaginas = vitrinePageData?.pagination.totalPages ?? 1;
  totalPaginasRef.current = totalPaginas;
  const paginaEfetiva = vitrinePageData?.pagination.page ?? pagina;
  const perPage = vitrinePageData?.pagination.perPage ?? 12;
  const fetchError = vitrineFetchError ?? (retryNonce === 0 ? initialPayloadError : null);
  const loading = vitrineLoading && gruposPagina.length === 0;
  const isRefreshing = vitrineValidating && gruposPagina.length > 0;

  useEffect(() => {
    if (!vitrinePageData || !vitrineResponseMatchesListKey(vitrinePageData, vitrineListQuery)) {
      return;
    }
    const pageFromApi = vitrinePageData.pagination.page;
    if (pageFromApi !== pagina) {
      setPagina(pageFromApi);
    }
  }, [vitrinePageData, vitrineListQuery, pagina]);

  /**
   * URL → estado antes do paint e antes dos useEffects que gravam na URL / buscam dados.
   * Sem useLayoutEffect, o efeito de escrita rodava com bancas=[] e apagava ?banca= da URL.
   */
  useEffect(() => {
    if (parseEstudarSlugFromPathname(pathname) !== null) {
      setExpandedPanelSlug(null);
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (vitrineUrlSyncedRef.current === searchParamsString) return;
    vitrineUrlSyncedRef.current = searchParamsString;

    const q = searchParams.get('q') ?? '';
    setSearchTerm((prev) => (prev === q ? prev : q));
    setDebouncedSearch((prev) => (prev === q ? prev : q));

    const bancasFromUrl = readMultiQueryParam(searchParams, ['banca', 'bancas']);
    setBancasSelecionadas((prev) =>
      stringArraysEqual(prev, bancasFromUrl) ? prev : bancasFromUrl,
    );

    const assuntosFromUrl = readMultiQueryParam(searchParams, ['assunto', 'assuntos']);
    setAssuntosSelecionados((prev) =>
      stringArraysEqual(prev, assuntosFromUrl) ? prev : assuntosFromUrl,
    );

    const raw = parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isFinite(raw) && raw >= 1 ? raw : 1;
    setPagina((prev) => (prev === page ? prev : page));

    const statusFromUrl = parseVitrineStatus(searchParams.get('status') ?? undefined);
    setStatusFilter((prev) => (prev === statusFromUrl ? prev : statusFromUrl));

    const viewParam = searchParams.get('view');
    const nextView =
      viewParam === 'compact' || viewParam === 'grid'
        ? parseVitrineView(viewParam)
        : readStoredVitrineView();
    setViewMode((prev) => (prev === nextView ? prev : nextView));

    const disciplinaFromUrl = parseVitrineDisciplina(searchParams.get('disciplina'));
    setDisciplina((prev) => (prev === disciplinaFromUrl ? prev : disciplinaFromUrl));

    filtersHydratedFromUrlRef.current = true;
  }, [searchParamsString, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, VITRINE_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadFacets() {
      const currentFacetsKey = vitrineFacetsQueryKey(bancasSelecionadas);

      if (bancasSelecionadas.length === 0 && initialFacetsData) {
        if (
          !ssrFacetsConsumedRef.current &&
          ssrFacetsQueryKey === currentFacetsKey
        ) {
          ssrFacetsConsumedRef.current = true;
        }
        return;
      }

      if (
        !ssrFacetsConsumedRef.current &&
        initialFacetsData &&
        ssrFacetsQueryKey === currentFacetsKey
      ) {
        ssrFacetsConsumedRef.current = true;
        return;
      }

      setFacetsLoading(true);

      const params = new URLSearchParams();
      bancasSelecionadas.forEach((b) => params.append('bancas', b));

      try {
        const query = params.toString();
        const res = await fetchWithAuth(
          query ? `/api/vitrine/facets?${query}` : '/api/vitrine/facets',
        );
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Erro ${res.status}`);
        }
        const data = (await res.json()) as VitrinePageResponse['facets'];
        if (cancelled) return;

        setBancas(data.bancas);
        setAssuntos(data.assuntos);
      } catch {
        if (cancelled) return;
        setBancas([]);
        setAssuntos([]);
      } finally {
        if (!cancelled) setFacetsLoading(false);
      }
    }

    void loadFacets();
    return () => {
      cancelled = true;
    };
  }, [bancasSelecionadas, initialFacetsData, ssrFacetsQueryKey]);

  const searchPaginaResetSkipRef = useRef(true);
  useEffect(() => {
    if (searchPaginaResetSkipRef.current) {
      searchPaginaResetSkipRef.current = false;
      return;
    }
    paginaViaFiltroRef.current = true;
    setPagina(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!assuntosSelecionados.length) return;
    const valid = assuntosSelecionados.filter((a) => assuntos.includes(a));
    if (valid.length !== assuntosSelecionados.length) {
      const prevKey = vitrineListQueryKey({
        page: pagina,
        bancas: bancasSelecionadas,
        assuntos: assuntosSelecionados,
        q: debouncedSearch || undefined,
      });
      const nextKey = vitrineListQueryKey({
        page: pagina,
        bancas: bancasSelecionadas,
        assuntos: valid,
        q: debouncedSearch || undefined,
      });
      setAssuntosSelecionados(valid);
      if (prevKey !== nextKey) {
        paginaViaFiltroRef.current = true;
        setPagina(1);
      }
    }
  }, [assuntos, assuntosSelecionados, bancasSelecionadas, debouncedSearch, pagina]);

  searchParamsRef.current = searchParams;

  const replaceVitrineLocation = useCallback(
    (nextPagina: number) => {
      if (!filtersHydratedFromUrlRef.current) return;

      const preservedParams = new URLSearchParams(searchParamsRef.current.toString());
      const newSearch = buildVitrineLocationSearch(preservedParams, {
        bancas: bancasSelecionadas,
        assuntos: assuntosSelecionados,
        searchTerm,
        pagina: nextPagina,
        status: statusFilter,
        view: viewMode,
        disciplina,
      });
      vitrineUrlSyncedRef.current = newSearch.startsWith('?') ? newSearch.slice(1) : newSearch;

      if (
        typeof window !== 'undefined' &&
        normalizeLocationSearch(window.location.search) !== normalizeLocationSearch(newSearch)
      ) {
        router.replace(`${pathname}${newSearch}`, { scroll: false });
      }
    },
    [
      assuntosSelecionados,
      bancasSelecionadas,
      disciplina,
      pathname,
      router,
      searchTerm,
      statusFilter,
      viewMode,
    ],
  );

  const goToPagina = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(1, next), totalPaginasRef.current);
      setPagina(clamped);
      replaceVitrineLocation(clamped);
    },
    [replaceVitrineLocation],
  );

  /** Estado → URL (só após hidratação; searchParams via ref para não re-disparar em router.replace). */
  useEffect(() => {
    if (!filtersHydratedFromUrlRef.current) return;

    const preservedParams = new URLSearchParams(searchParamsRef.current.toString());
    const newSearch = buildVitrineLocationSearch(preservedParams, {
      bancas: bancasSelecionadas,
      assuntos: assuntosSelecionados,
      searchTerm,
      pagina,
      status: statusFilter,
      view: viewMode,
      disciplina,
    });
    vitrineUrlSyncedRef.current = newSearch.startsWith('?') ? newSearch.slice(1) : newSearch;

    if (
      typeof window !== 'undefined' &&
      normalizeLocationSearch(window.location.search) !== normalizeLocationSearch(newSearch)
    ) {
      router.replace(`${pathname}${newSearch}`, { scroll: false });
    }
  }, [
    bancasSelecionadas,
    assuntosSelecionados,
    searchTerm,
    pagina,
    statusFilter,
    viewMode,
    disciplina,
    pathname,
    router,
  ]);

  const handleStatusFilterChange = useCallback((next: VitrineStatusFilter) => {
    setStatusFilter(next);
  }, []);

  const handleDisciplinaChange = useCallback((next: VitrineDisciplinaId | null) => {
    paginaViaFiltroRef.current = true;
    setDisciplina(next);
    setPagina(1);
    setExpandedPanelSlug(null);
  }, []);

  const handleViewModeChange = useCallback((next: VitrineViewMode) => {
    setViewMode(next);
    writeStoredVitrineView(next);
    if (next === 'grid') {
      setExpandedPanelSlug(null);
    }
  }, []);

  /** Filtros + página da vitrine — repassados ao abrir questão (paridade com prefetch). */
  const estudarQuery = useMemo(
    () =>
      buildVitrineEstudarQuery({
        bancas: bancasSelecionadas,
        assuntos: assuntosSelecionados,
        q: debouncedSearch || undefined,
        page: paginaEfetiva,
        disciplina,
      }),
    [bancasSelecionadas, assuntosSelecionados, debouncedSearch, paginaEfetiva, disciplina],
  );

  useEffect(() => {
    if (paginaViaFiltroRef.current) {
      paginaViaFiltroRef.current = false;
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollDashboardMainToTop('auto');
    });

    return () => cancelAnimationFrame(frame);
  }, [pagina]);

  useEffect(() => {
    const handler = () => {
      setMobileSearchOpen(true);
      requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>('[data-vitrine-shell-search]')?.focus();
      });
    };
    window.addEventListener('avant:open-search', handler);
    return () => window.removeEventListener('avant:open-search', handler);
  }, []);

  const disciplinaSummaries = vitrinePageData?.disciplinas ?? [];
  const hubMode = isVitrineDisciplineHubMode(disciplinaSummaries, disciplina);
  const showSubjectCatalog = !hubMode;
  const pageSectionTitle = hubMode
    ? 'Vitrine de disciplinas'
    : disciplina
      ? 'Assuntos'
      : 'Vitrine de questões';

  const listBusy = loading || isRefreshing;
  const listDataMatchesQuery =
    vitrinePageData != null &&
    vitrineResponseMatchesListKey(vitrinePageData, vitrineListQuery);
  /** Bloqueia Anterior/Próxima enquanto SWR exibe página/filtro anterior (keepPreviousData). */
  const paginationBusy = listBusy || !listDataMatchesQuery;

  useVitrineVisiblePrefetch(vitrineListaRef, {
    enabled: showSubjectCatalog && gruposPagina.length > 0 && !listBusy,
    observeKey: `p${paginaEfetiva}-${gruposPagina.length}-${disciplina ?? 'all'}`,
  });

  const pageSectionDescription = (() => {
    if (fetchError) return fetchError;

    if (hubMode) {
      return 'Escolha uma disciplina para ver os assuntos';
    }

    const segments: string[] = [];
    const trimmedSearch = searchTerm.trim();

    if (disciplina) {
      segments.push(disciplina === 'portugues' ? 'Português' : 'Enfermagem');
    }

    if (trimmedSearch) {
      segments.push(`Resultados para "${trimmedSearch}"`);
    }

    if (statusFilter !== 'all' && gruposPagina.length > 0) {
      segments.push(
        `${vitrineStatusFilterLabel(statusFilter)} nesta página (${gruposFiltrados.length} de ${gruposPagina.length} assuntos)`,
      );
    } else if (totalAssuntos > 0 && totalPaginas > 1) {
      segments.push(
        `Mostrando ${(paginaEfetiva - 1) * perPage + 1}\u2013${Math.min(paginaEfetiva * perPage, totalAssuntos)} de ${totalAssuntos} assuntos`,
      );
    } else if (loading) {
      segments.push('Carregando assuntos…');
    } else if (isRefreshing) {
      segments.push('Atualizando assuntos…');
    } else if (totalAssuntos > 0) {
      segments.push(`${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`);
    }

    if (bancasSelecionadas.length > 0 || assuntosSelecionados.length > 0) {
      const filterBits: string[] = [];
      const bancasLabel = multiFilterResumo(bancasSelecionadas, 'bancas');
      const assuntosLabel = multiFilterResumo(assuntosSelecionados, 'assuntos');
      if (bancasLabel) filterBits.push(bancasLabel);
      if (assuntosLabel) filterBits.push(assuntosLabel);
      if (filterBits.length > 0) {
        segments.push(`Filtrado por ${filterBits.join(', ')}`);
      }
    }

    return segments.length > 0 ? segments.join(' \u00b7 ') : null;
  })();

  const showSsrErrorBanner =
    Boolean(initialPayloadError) && !ssrErrorDismissed && !initialPageData;

  const resumeMatchesDisciplina =
    initialResume != null &&
    (!disciplina ||
      guessDisciplinaFromTituloAula(initialResume.tituloAula) === disciplina);

  const showResumeCard =
    initialResume != null &&
    resumeMatchesDisciplina &&
    bancasSelecionadas.length === 0 &&
    assuntosSelecionados.length === 0 &&
    !debouncedSearch &&
    statusFilter === 'all' &&
    pagina === 1 &&
    (hubMode || Boolean(disciplina) || disciplinaSummaries.length <= 1);

  const showWeeklyMissionCard =
    weeklyMission != null &&
    bancasSelecionadas.length === 0 &&
    assuntosSelecionados.length === 0 &&
    !debouncedSearch &&
    statusFilter === 'all' &&
    pagina === 1 &&
    (hubMode || !disciplina);

  const showDiagnosticoCard =
    initialDiagnostico?.show_card === true &&
    bancasSelecionadas.length === 0 &&
    assuntosSelecionados.length === 0 &&
    !debouncedSearch &&
    statusFilter === 'all' &&
    pagina === 1 &&
    (hubMode || !disciplina);

  const handleRetryLoad = useCallback(() => {
    setSsrErrorDismissed(true);
    setRetryNonce((n) => n + 1);
    router.refresh();
  }, [router]);

  const markFilterPaginaReset = useCallback(() => {
    paginaViaFiltroRef.current = true;
    setPagina(1);
  }, []);

  return (
    <div
      className={cn(
        'dashboard-surface flex min-h-0 flex-1 flex-col bg-background text-foreground selection:text-[#1a2e05] md:min-h-screen md:pb-8',
        vitrineBrand.selection,
      )}
    >
      {!hubMode ? (
        <VitrineToolbar
          searchTerm={searchTerm}
          onSearchChange={(term) => {
            setSearchTerm(term);
            paginaViaFiltroRef.current = true;
            setPagina(1);
          }}
          onSearchClear={() => {
            setSearchTerm('');
            paginaViaFiltroRef.current = true;
            setPagina(1);
          }}
          mobileSearchOpen={mobileSearchOpen}
          bancasSelected={bancasSelecionadas}
          assuntosSelected={assuntosSelecionados}
          onBancasChange={(next) => {
            setBancasSelecionadas(next);
            markFilterPaginaReset();
          }}
          onAssuntosChange={(next) => {
            setAssuntosSelecionados(next);
            markFilterPaginaReset();
          }}
          onClearBancas={() => {
            setBancasSelecionadas([]);
            markFilterPaginaReset();
          }}
          onClearAssuntos={() => {
            setAssuntosSelecionados([]);
            markFilterPaginaReset();
          }}
          onClearAllFilters={() => {
            setBancasSelecionadas([]);
            setAssuntosSelecionados([]);
            setSearchTerm('');
            markFilterPaginaReset();
          }}
          facets={{ bancas, assuntos }}
          facetsLoading={facetsLoading}
        />
      ) : null}

      <main
        className={cn(
          'w-full px-4 md:px-6 lg:px-8',
          hubMode
            ? 'max-w-none space-y-6 pt-4 md:space-y-8 md:pt-8'
            : 'mx-auto max-w-7xl space-y-5 pt-3 md:space-y-8 md:pt-6',
        )}
      >
        {showSsrErrorBanner && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-amber-800">{initialPayloadError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetryLoad}
              className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              <RefreshCw size={16} className="mr-2" aria-hidden />
              Tentar novamente
            </Button>
          </div>
        )}
        <section className={cn(hubMode ? 'space-y-6 md:space-y-8' : 'space-y-5 md:space-y-8')}>
          <VitrinePageHeader
            title={pageSectionTitle}
            description={pageSectionDescription || null}
          />
          {children ? <div className={hubMode ? 'mb-0' : 'mb-4 md:mb-6'}>{children}</div> : null}
          {disciplinaSummaries.length > 0 ? (
            <VitrineDisciplinePicker
              summaries={disciplinaSummaries}
              selected={disciplina}
              onSelect={handleDisciplinaChange}
            />
          ) : null}
          {hubMode && (showDiagnosticoCard || showWeeklyMissionCard || showResumeCard) ? (
            <div className="space-y-3 border-t border-slate-200/80 pt-6">
              {showWeeklyMissionCard && !showDiagnosticoCard && weeklyMission ? (
                <WeeklySimuladoMissionCard
                  mission={weeklyMission}
                  onMissionUpdate={setWeeklyMission}
                />
              ) : null}
              {showDiagnosticoCard && initialDiagnostico ? (
                <SimuladoDiagnosticoCard state={initialDiagnostico} />
              ) : null}
              {showResumeCard ? (
                <VitrineResumeCard resume={initialResume} estudarQuery={estudarQuery} />
              ) : null}
            </div>
          ) : null}
          {!hubMode ? (
            <>
              {showWeeklyMissionCard && !showDiagnosticoCard && weeklyMission ? (
                <WeeklySimuladoMissionCard
                  mission={weeklyMission}
                  onMissionUpdate={setWeeklyMission}
                />
              ) : null}
              {showDiagnosticoCard && initialDiagnostico ? (
                <SimuladoDiagnosticoCard state={initialDiagnostico} />
              ) : null}
              {showResumeCard ? (
                <VitrineResumeCard resume={initialResume} estudarQuery={estudarQuery} />
              ) : null}
            </>
          ) : null}
          {showSubjectCatalog ? (
            <>
              {!loading && gruposPagina.length > 0 ? (
                <VitrineQuickFilters
                  status={statusFilter}
                  onStatusChange={handleStatusFilterChange}
                  view={viewMode}
                  onViewChange={handleViewModeChange}
                  counts={statusCounts}
                />
              ) : null}
              {loading && gruposPagina.length === 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted/50" />
                  ))}
                </div>
              ) : gruposFiltrados.length > 0 ? (
                <>
                  <motion.div
                    key={`${disciplina ?? 'all'}-${bancasSelecionadas.join('|')}-${assuntosSelecionados.join('|')}-${searchTerm}-${statusFilter}-${viewMode}`}
                    ref={vitrineListaRef}
                    data-vitrine-list-ready={listBusy ? 'false' : 'true'}
                    aria-busy={listBusy || undefined}
                    variants={vitrineContainerVariants}
                    initial={false}
                    animate="animate"
                    className={cn(
                      viewMode === 'compact'
                        ? 'flex flex-col gap-2'
                        : 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5',
                      MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM,
                      isRefreshing && 'opacity-80',
                    )}
                  >
                    {gruposFiltrados.map((grupo, idx) => (
                      <VitrineSubjectCard
                        key={grupo.titulo_aula}
                        grupo={grupo}
                        estudarQuery={estudarQuery}
                        index={idx}
                        compact={viewMode === 'compact'}
                        assuntoExpandido={expandedPanelSlug === grupo.firstSlug}
                        onAssuntoExpandedChange={(open) =>
                          setExpandedPanelSlug(open ? grupo.firstSlug : null)
                        }
                      />
                    ))}
                  </motion.div>
                  {totalPaginas > 1 ? (
                    <VitrinePaginationBar
                      ref={vitrinePaginationInlineRef}
                      pagina={pagina}
                      paginaEfetiva={paginaEfetiva}
                      totalPaginas={totalPaginas}
                      listBusy={paginationBusy}
                      onPrev={() => goToPagina(pagina - 1)}
                      onNext={() => goToPagina(pagina + 1)}
                    />
                  ) : null}
                </>
              ) : gruposPagina.length > 0 && statusFilter !== 'all' ? (
                <EmptyState
                  icon={Search}
                  title={`Nenhum assunto ${statusFilter === 'pending' ? 'pendente' : 'novo'} nesta página`}
                  description="Avance para outra página ou volte para Todos para ver o catálogo completo."
                />
              ) : fetchError ? (
                <EmptyState
                  icon={Search}
                  title="Não foi possível carregar a vitrine"
                  description="Verifique sua conexão e tente novamente. Se persistir, recarregue a página."
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Nenhum assunto encontrado"
                  description="Tente ajustar os filtros ou limpar a busca para ver todos os assuntos disponíveis."
                />
              )}
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
