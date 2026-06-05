'use client';

import {
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  createElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Circle,
  RefreshCw,
  Baby,
  Scissors,
  HeartPulse,
  Brain,
  ShieldAlert,
  Syringe,
  Pill,
  FlaskConical,
  Users,
  HardHat,
  Scale,
  BookOpen,
  Stethoscope,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { useMobileSheetKeyboardInset } from '@/lib/layout/useMobileSheetKeyboardInset';
import {
  vitrineFacetsQueryKey,
  vitrineListQueryKey,
  type VitrineListQuery,
} from '@/lib/vitrine/parseListQuery';
import type { VitrineFacets, VitrineGrupoSubtopico, VitrinePageResponse } from '@/lib/vitrine/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiCheckboxFilter } from '@/components/ui/MultiCheckboxFilter';
import { NeonBadge } from '@/components/ui/neon-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressRing } from '@/components/ui/progress-ring';
import { VitrineQuestaoLink } from '@/components/vitrine/VitrineQuestaoLink';
import { VitrinePaginationBar } from '@/components/vitrine/VitrinePaginationBar';
import {
  MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM,
  MOBILE_VITRINE_GRID_STICKY_PAGINATION_PADDING,
} from '@/lib/layout/mobileBottomNav';
import { useVitrineVisiblePrefetch, VITRINE_PREFETCH_DATA_ATTR } from '@/hooks/useVitrineVisiblePrefetch';
import { useVitrineListSwr } from '@/hooks/useVitrineListSwr';
import { buildVitrineEstudarQuery } from '@/lib/vitrine/estudarQuery';
import { labelQuestoes } from '@/lib/labelQuestoes';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';

const VITRINE_SEARCH_DEBOUNCE_MS = 350;

const VITRINE_FILTER_QUERY_KEYS = new Set([
  'banca',
  'bancas',
  'assunto',
  'assuntos',
  'q',
  'page',
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

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const } },
};
const itemGroupVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.32 },
  },
};

// ─── Ícone por categoria de assunto (forma única — cor no badge do card) ───────

function getTopicIcon(titulo_aula?: string | null, modulo_nome?: string | null): LucideIcon {
  const src = `${titulo_aula ?? ''} ${modulo_nome ?? ''}`.toLowerCase();

  if (/obstet|gesta|ginec|mulher/.test(src)) return Baby;
  if (/crian[çc]a|pedia|neonat/.test(src)) return Baby;
  if (/surg|cirug|peri[\s-]?op/.test(src)) return Scissors;
  if (/card|cora[çc]|infarto/.test(src)) return HeartPulse;
  if (/neuro|cerebr/.test(src)) return Brain;
  if (/psiq|mental|sa[úu]de\s*ment/.test(src)) return Brain;
  if (/infect|epidem|dst|hiv/.test(src)) return ShieldAlert;
  if (/vacin|imuniz/.test(src)) return Syringe;
  if (/farm|medic|dose|prescr/.test(src)) return Pill;
  if (/exame|laborat|sorol|glicem/.test(src)) return FlaskConical;
  if (/famil|comun|aps|b[aá]sic/.test(src)) return Users;
  if (/trabalh|ocupac/.test(src)) return HardHat;
  if (/[eé]tica|legisl|lei\b|c[oó]d/.test(src)) return Scale;
  if (/histor|fundament|semiolog/.test(src)) return BookOpen;

  return Stethoscope;
}

function multiFilterResumo(items: string[], pluralLabel: string): string {
  if (items.length === 0) return '';
  if (items.length <= 2) return items.join(', ');
  return `${items.length} ${pluralLabel}`;
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

type QuestaoStatus = 'nao_estudada' | 'estudada';

interface QuestaoItem {
  slug: string;
  numero: number;
  status: QuestaoStatus;
  avant_codigo: number | null;
  /** Mesma chave de ordenação de `getQuestoesByAssuntoCached` (created_at asc). */
  created_at: string | null;
}

type GrupoSubtopico = VitrineGrupoSubtopico;

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
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function VitrineClient({
  fallbackTitulo = 'Estudo Reverso',
  children,
  initialListQuery,
  initialPageData = null,
  initialFacetsData = null,
  initialPayloadError = null,
  ssrListQueryKey,
  ssrFacetsQueryKey,
}: VitrineClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const ssrQuery = initialListQuery ?? {
    page: 1,
    bancas: [] as string[],
    assuntos: [] as string[],
    q: undefined as string | undefined,
  };

  /**
   * Estado inicial alinhado ao SSR quando `initialListQuery` veio do RSC.
   * `useLayoutEffect` ainda sincroniza mudanças de URL após navegação client-side.
   */
  const [cidadeUrl, setCidadeUrl] = useState(fallbackTitulo);
  const [searchTerm, setSearchTerm] = useState(ssrQuery.q ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(ssrQuery.q ?? '');
  const [bancasSelecionadas, setBancasSelecionadas] = useState<string[]>(ssrQuery.bancas);
  const [assuntosSelecionados, setAssuntosSelecionados] = useState<string[]>(ssrQuery.assuntos);
  const [pagina, setPagina] = useState(ssrQuery.page);
  const [bancaSheetOpen, setBancaSheetOpen] = useState(false);
  const [assuntoSheetOpen, setAssuntoSheetOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [bancas, setBancas] = useState<string[]>(() => initialFacetsData?.bancas ?? []);
  const [assuntos, setAssuntos] = useState<string[]>(() => initialFacetsData?.assuntos ?? []);
  const [facetsLoading, setFacetsLoading] = useState(() => !initialFacetsData);
  const [ssrErrorDismissed, setSsrErrorDismissed] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const vitrineListaRef = useRef<HTMLDivElement>(null);
  const vitrinePaginationInlineRef = useRef<HTMLElement>(null);
  const totalPaginasRef = useRef(1);
  /** Persiste entre soft-nav; zera ao abrir questão para não voltar com card aberto. */
  const [expandedPanelSlug, setExpandedPanelSlug] = useState<string | null>(null);
  /** Evita scrollIntoView quando setPagina(1) veio de filtro/busca, não de Anterior/Próxima. */
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
    }),
    [pagina, bancasSelecionadas, assuntosSelecionados, debouncedSearch],
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

  const gruposPagina = vitrinePageData?.groups ?? [];
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

    const c = searchParams.get('cidade');
    setCidadeUrl(c ? decodeURIComponent(c) : fallbackTitulo);

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

    filtersHydratedFromUrlRef.current = true;
  }, [searchParamsString, fallbackTitulo]);

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
      });
      vitrineUrlSyncedRef.current = newSearch.startsWith('?') ? newSearch.slice(1) : newSearch;

      if (
        typeof window !== 'undefined' &&
        normalizeLocationSearch(window.location.search) !== normalizeLocationSearch(newSearch)
      ) {
        router.replace(`${pathname}${newSearch}`, { scroll: false });
      }
    },
    [assuntosSelecionados, bancasSelecionadas, pathname, router, searchTerm],
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
    });
    vitrineUrlSyncedRef.current = newSearch.startsWith('?') ? newSearch.slice(1) : newSearch;

    if (
      typeof window !== 'undefined' &&
      normalizeLocationSearch(window.location.search) !== normalizeLocationSearch(newSearch)
    ) {
      router.replace(`${pathname}${newSearch}`, { scroll: false });
    }
  }, [bancasSelecionadas, assuntosSelecionados, searchTerm, pagina, pathname, router]);

  /** Filtros + página da vitrine — repassados ao abrir questão (paridade com prefetch). */
  const estudarQuery = useMemo(
    () =>
      buildVitrineEstudarQuery({
        bancas: bancasSelecionadas,
        assuntos: assuntosSelecionados,
        q: debouncedSearch || undefined,
        page: paginaEfetiva,
      }),
    [bancasSelecionadas, assuntosSelecionados, debouncedSearch, paginaEfetiva],
  );

  useEffect(() => {
    if (paginaViaFiltroRef.current) {
      paginaViaFiltroRef.current = false;
      return;
    }

    const frame = requestAnimationFrame(() => {
      vitrineListaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const pageSectionTitle = searchTerm
    ? `Resultados para "${searchTerm}"`
    : bancasSelecionadas.length || assuntosSelecionados.length
      ? (() => {
          const parts: string[] = ['Filtrado'];
          const bancasLabel = multiFilterResumo(bancasSelecionadas, 'bancas');
          const assuntosLabel = multiFilterResumo(assuntosSelecionados, 'assuntos');
          if (bancasLabel) parts.push(bancasLabel);
          if (assuntosLabel) parts.push(assuntosLabel);
          return parts.join(' \u2022 ');
        })()
      : 'Vitrine de questões';

  const listBusy = loading || isRefreshing;
  const listDataMatchesQuery =
    vitrinePageData != null &&
    vitrineResponseMatchesListKey(vitrinePageData, vitrineListQuery);
  /** Bloqueia Anterior/Próxima enquanto SWR exibe página/filtro anterior (keepPreviousData). */
  const paginationBusy = listBusy || !listDataMatchesQuery;

  useVitrineVisiblePrefetch(vitrineListaRef, {
    enabled: gruposPagina.length > 0 && !listBusy,
    observeKey: `p${paginaEfetiva}-${gruposPagina.length}`,
  });

  const pageSectionDescription = fetchError
    ? fetchError
    : totalAssuntos > 0 && totalPaginas > 1
      ? `Mostrando ${(paginaEfetiva - 1) * perPage + 1}\u2013${Math.min(paginaEfetiva * perPage, totalAssuntos)} de ${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`
      : loading
        ? 'Carregando assuntos…'
        : isRefreshing
          ? 'Atualizando assuntos…'
          : `${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`;

  const showSsrErrorBanner =
    Boolean(initialPayloadError) && !ssrErrorDismissed && !initialPageData;

  const handleRetryLoad = useCallback(() => {
    setSsrErrorDismissed(true);
    setRetryNonce((n) => n + 1);
    router.refresh();
  }, [router]);

  return (
    <div
      className={cn(
        'dashboard-surface min-h-0 bg-background text-foreground selection:bg-indigo-100 selection:text-indigo-900 md:min-h-screen md:pb-8',
      )}
    >
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/95 pt-safe shadow-[0_4px_24px_-12px_rgba(15,23,42,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90 md:pt-0">
        {/* Header mobile — cidade, busca e filtros (único sticky; shell oculto em /estudar) */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 px-4 py-3">
            <h1 className="min-w-0 flex-1 truncate text-base font-black leading-snug tracking-tight text-foreground">
              {cidadeUrl}
            </h1>
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((open) => {
                  const next = !open;
                  if (next) {
                    requestAnimationFrame(() => {
                      document
                        .querySelector<HTMLInputElement>('[data-vitrine-shell-search]')
                        ?.focus();
                    });
                  }
                  return next;
                });
              }}
              aria-expanded={mobileSearchOpen}
              aria-label={mobileSearchOpen ? 'Fechar busca' : 'Abrir busca'}
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-400 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <Search size={16} aria-hidden />
            </button>
          </div>

          {mobileSearchOpen ? (
            <div className="border-t border-border/70 px-4 pb-3 pt-2">
              <div className="group relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="text"
                  data-vitrine-shell-search
                  autoFocus
                  placeholder="Assunto, tópico, banca, slug ou Q-…"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    paginaViaFiltroRef.current = true;
                    setPagina(1);
                  }}
                  className="h-11 rounded-xl border-border/80 bg-white/[0.05] pl-10 pr-11 text-sm"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      paginaViaFiltroRef.current = true;
                      setPagina(1);
                    }}
                    className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Limpar busca"
                  >
                    <X size={16} aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div
            className="flex items-center gap-2 overflow-x-auto scroll-pl-4 px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Filtros da vitrine"
          >
          {bancasSelecionadas.length > 0 ? (
            <div
              className={cn(
                'inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[#00f2ff]/35 bg-[#00f2ff]/10 text-xs font-medium text-[#00f2ff]',
                facetsLoading && bancas.length === 0 && 'opacity-50',
              )}
            >
              <button
                type="button"
                disabled={facetsLoading && bancas.length === 0}
                onClick={() => setBancaSheetOpen(true)}
                className="inline-flex min-h-[44px] max-w-[10rem] items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-1 disabled:cursor-not-allowed"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f2ff]" aria-hidden />
                <span className="truncate">{multiFilterResumo(bancasSelecionadas, 'bancas')}</span>
              </button>
              <button
                type="button"
                aria-label="Limpar filtro de banca"
                onClick={(e) => {
                  e.stopPropagation();
                  setBancasSelecionadas([]);
                  paginaViaFiltroRef.current = true;
                  setPagina(1);
                }}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-r-full hover:bg-[#00f2ff]/20"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={facetsLoading && bancas.length === 0}
              onClick={() => setBancaSheetOpen(true)}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SlidersHorizontal size={14} aria-hidden />
              Banca
            </button>
          )}

          {assuntosSelecionados.length > 0 ? (
            <div
              className={cn(
                'inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[#00f2ff]/35 bg-[#00f2ff]/10 text-xs font-medium text-[#00f2ff]',
                facetsLoading && assuntos.length === 0 && 'opacity-50',
              )}
            >
              <button
                type="button"
                disabled={facetsLoading && assuntos.length === 0}
                onClick={() => setAssuntoSheetOpen(true)}
                className="inline-flex min-h-[44px] max-w-[10rem] items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-1 disabled:cursor-not-allowed"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f2ff]" aria-hidden />
                <span className="truncate">
                  {multiFilterResumo(assuntosSelecionados, 'assuntos')}
                </span>
              </button>
              <button
                type="button"
                aria-label="Limpar filtro de assunto"
                onClick={(e) => {
                  e.stopPropagation();
                  setAssuntosSelecionados([]);
                  paginaViaFiltroRef.current = true;
                  setPagina(1);
                }}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-r-full hover:bg-[#00f2ff]/20"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={facetsLoading && assuntos.length === 0}
              onClick={() => setAssuntoSheetOpen(true)}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BookOpen size={14} aria-hidden />
              Assunto
            </button>
          )}

          {(bancasSelecionadas.length > 0 ||
            assuntosSelecionados.length > 0 ||
            searchTerm.trim().length > 0) && (
            <button
              type="button"
              onClick={() => {
                setBancasSelecionadas([]);
                setAssuntosSelecionados([]);
                setSearchTerm('');
                paginaViaFiltroRef.current = true;
                setPagina(1);
              }}
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
            >
              Limpar
            </button>
          )}
          </div>
        </div>

        <VitrineMobileFilterSheet
          open={bancaSheetOpen}
          onClose={() => setBancaSheetOpen(false)}
          title="Filtrar por banca"
          options={bancas}
          selected={bancasSelecionadas}
          disabled={facetsLoading && bancas.length === 0}
          searchPlaceholder="Buscar banca..."
          emptySearchLabel="Nenhuma banca encontrada"
          onChange={(next) => {
            setBancasSelecionadas(next);
            paginaViaFiltroRef.current = true;
            setPagina(1);
          }}
        />
        <VitrineMobileFilterSheet
          open={assuntoSheetOpen}
          onClose={() => setAssuntoSheetOpen(false)}
          title="Filtrar por assunto"
          options={assuntos}
          selected={assuntosSelecionados}
          disabled={facetsLoading && assuntos.length === 0}
          searchPlaceholder="Buscar assunto..."
          emptySearchLabel="Nenhum assunto encontrado"
          onChange={(next) => {
            setAssuntosSelecionados(next);
            paginaViaFiltroRef.current = true;
            setPagina(1);
          }}
        />

        {/* Header desktop */}
        <header className="hidden bg-transparent md:block">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-5 md:flex-row">
            <div className="flex w-full min-w-0 items-center gap-3 sm:gap-4 md:w-auto">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50/90 ring-1 ring-indigo-200/50 shadow-sm shadow-indigo-900/[0.06] sm:h-12 sm:w-12"
                aria-hidden
              >
                <LayoutDashboard size={24} className="text-indigo-600" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1 md:flex-none">
                <h1 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground md:line-clamp-1">
                  {cidadeUrl}
                </h1>
              </div>
            </div>

            <div className="group relative w-full max-w-xl flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground"
                aria-hidden
              />
              <Input
                type="text"
                placeholder="Assunto, tópico, banca, slug ou Q-…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  paginaViaFiltroRef.current = true;
                  setPagina(1);
                }}
                className="h-11 rounded-2xl border-border/80 pl-11 pr-11"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    paginaViaFiltroRef.current = true;
                    setPagina(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto hidden max-w-7xl px-6 pb-6 pt-0 md:block">
        <section className="space-y-4" aria-label="Filtros da vitrine">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter size={16} aria-hidden />
            <span className="text-xs font-medium uppercase tracking-wider">Filtros</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MultiCheckboxFilter
              emptyLabel="Todas as bancas"
              searchPlaceholder="Buscar banca..."
              addButtonLabel="Adicionar banca"
              sheetTitle="Adicionar banca"
              emptySearchLabel="Nenhuma banca encontrada"
              options={bancas}
              value={bancasSelecionadas}
              disabled={facetsLoading && bancas.length === 0}
              onChange={(next) => {
                setBancasSelecionadas(next);
                paginaViaFiltroRef.current = true;
                setPagina(1);
              }}
            />

            <MultiCheckboxFilter
              emptyLabel="Todos os assuntos"
              searchPlaceholder="Buscar assunto..."
              addButtonLabel="Adicionar assunto"
              sheetTitle="Adicionar assunto"
              emptySearchLabel="Nenhum assunto encontrado"
              contentMinWidth="min-w-[240px]"
              options={assuntos}
              value={assuntosSelecionados}
              disabled={facetsLoading && assuntos.length === 0}
              onChange={(next) => {
                setAssuntosSelecionados(next);
                paginaViaFiltroRef.current = true;
                setPagina(1);
              }}
            />
          </div>
          {(bancasSelecionadas.length > 0 || assuntosSelecionados.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setBancasSelecionadas([]);
                setAssuntosSelecionados([]);
                paginaViaFiltroRef.current = true;
                setPagina(1);
              }}
              className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-6 md:px-6 md:pt-8">
        {showSsrErrorBanner && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-amber-100/90">{initialPayloadError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetryLoad}
              className="shrink-0 border-amber-500/40 text-amber-100 hover:bg-amber-500/15"
            >
              <RefreshCw size={16} className="mr-2" aria-hidden />
              Tentar novamente
            </Button>
          </div>
        )}
        <section className="space-y-8">
          <div className="mb-8 flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-stretch gap-3">
                <div
                  className="w-1 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-500/30"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-500/70">
                    Estudo Reverso
                  </p>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {pageSectionTitle}
                  </h1>
                  {pageSectionDescription ? (
                    <p className="mt-1 font-mono text-[11px] tabular-nums text-slate-500">
                      {pageSectionDescription}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          {children ? <div className="mb-6">{children}</div> : null}
          {loading && gruposPagina.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-3xl bg-muted/50" />
              ))}
            </div>
          ) : gruposPagina.length > 0 ? (
            <>
              <div
                className={cn(
                  totalPaginas > 1 && MOBILE_VITRINE_GRID_STICKY_PAGINATION_PADDING,
                )}
              >
                <motion.div
                  key={`${bancasSelecionadas.join('|')}-${assuntosSelecionados.join('|')}-${searchTerm}`}
                  ref={vitrineListaRef}
                  data-vitrine-list-ready={listBusy ? 'false' : 'true'}
                  aria-busy={listBusy || undefined}
                  variants={containerVariants}
                  initial={false}
                  animate="animate"
                  className={cn(
                    'grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4',
                    MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM,
                    isRefreshing && 'opacity-80',
                  )}
                >
                  {gruposPagina.map((grupo, idx) => (
                    <SubtopicoCard
                      key={grupo.titulo_aula}
                      grupo={grupo}
                      estudarQuery={estudarQuery}
                      index={idx}
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
                    variant="inline"
                    pagina={pagina}
                    paginaEfetiva={paginaEfetiva}
                    totalPaginas={totalPaginas}
                    listBusy={paginationBusy}
                    onPrev={() => goToPagina(pagina - 1)}
                    onNext={() => goToPagina(pagina + 1)}
                  />
                ) : null}
              </div>
              {totalPaginas > 1 ? (
                <VitrinePaginationBar
                  variant="sticky"
                  pagina={pagina}
                  paginaEfetiva={paginaEfetiva}
                  totalPaginas={totalPaginas}
                  listBusy={paginationBusy}
                  onPrev={() => goToPagina(pagina - 1)}
                  onNext={() => goToPagina(pagina + 1)}
                />
              ) : null}
            </>
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
        </section>
      </main>
    </div>
  );
}

// ─── Sheet de filtro multi-select (mobile) ─────────────────────────────────────

type VitrineMobileFilterSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  searchPlaceholder: string;
  emptySearchLabel: string;
  disabled?: boolean;
};

function VitrineMobileFilterSheet({
  open,
  onClose,
  title,
  options,
  selected,
  onChange,
  searchPlaceholder,
  emptySearchLabel,
  disabled,
}: VitrineMobileFilterSheetProps) {
  const [busca, setBusca] = useState('');
  const [portalReady, setPortalReady] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const optionsFiltradas = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(busca.toLowerCase().trim())),
    [options, busca],
  );

  const closeSheet = useCallback(() => {
    onClose();
    setBusca('');
  }, [onClose]);

  const toggleOption = useCallback(
    (option: string) => {
      if (disabled) return;
      if (selectedSet.has(option)) {
        onChange(selected.filter((v) => v !== option));
      } else {
        onChange([...selected, option]);
      }
    },
    [disabled, onChange, selected, selectedSet],
  );

  useBodyScrollLock(open);
  const keyboardInsetPx = useMobileSheetKeyboardInset(open);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeSheet();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeSheet]);

  if (!portalReady || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="vitrine-mobile-filter-sheet"
          className="fixed inset-0 z-[200] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Fechar filtros"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={closeSheet}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="absolute inset-x-0 bottom-0 z-[201] flex max-h-[min(85dvh,32rem)] flex-col rounded-t-3xl border border-white/10 bg-[#0d1117] pb-safe shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-bold text-white">{title}</p>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Fechar"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="sticky top-0 z-10 bg-[#0d1117] px-2 pb-2 pt-2">
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  disabled={disabled}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-[#00f2ff]/40 focus:bg-[#00f2ff]/[0.04] disabled:opacity-50"
                />
              </div>
              <ul
                className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-1"
                role="listbox"
                aria-label={searchPlaceholder}
                style={
                  keyboardInsetPx > 0
                    ? { scrollPaddingBottom: keyboardInsetPx + 16 }
                    : undefined
                }
              >
                {optionsFiltradas.length === 0 ? (
                  <li className="py-4 text-center text-xs text-slate-500" role="presentation">
                    {emptySearchLabel}
                  </li>
                ) : (
                  optionsFiltradas.map((option) => {
                    const isSelected = selectedSet.has(option);
                    return (
                      <li key={option}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={disabled}
                          onClick={() => toggleOption(option)}
                          className="flex min-h-[44px] w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-cyan-400/10 hover:text-cyan-100 disabled:opacity-50"
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                              isSelected
                                ? 'border-[#00f2ff]/60 bg-[#00f2ff]/20 text-[#00f2ff]'
                                : 'border-white/25 bg-transparent',
                            )}
                            aria-hidden
                          >
                            {isSelected ? <CheckCircle2 className="h-3 w-3" /> : null}
                          </span>
                          <span className="min-w-0 flex-1 leading-snug">{option}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
            <button
              type="button"
              className="min-h-[44px] border-t border-white/10 px-4 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              style={
                keyboardInsetPx > 0
                  ? { paddingBottom: `calc(0.875rem + ${keyboardInsetPx}px)` }
                  : undefined
              }
              onClick={closeSheet}
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

// ─── ProgressRingVitrine — anel de progresso com label interno ─────────────────

function ProgressRingVitrine({
  trabalhadas,
  total,
  size = 120,
  strokeWidth = 14,
}: {
  trabalhadas: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}) {
  const todas = trabalhadas === total && total > 0;
  const value = total > 0 ? (trabalhadas / total) * 100 : 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ProgressRing
        value={value}
        size={size}
        strokeWidth={strokeWidth}
        variant={todas ? 'success' : 'brand'}
      />
      <div className="absolute inset-0 flex select-none flex-col items-center justify-center">
        <span
          className="leading-none font-bold tabular-nums text-[#e6edf3]"
          style={{ fontSize: size >= 120 ? '1.5rem' : '1.1rem' }}
        >
          {trabalhadas}
        </span>
        <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-wide text-[#8b949e] sm:text-[0.6rem]">
          de {total}
        </span>
        {todas && (
          <span className="mt-0.5 text-[0.5rem] font-semibold uppercase tracking-wide text-[#6ee7b7]">
            Completo
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: QuestaoStatus }) {
  if (status === 'estudada') return <CheckCircle2 size={15} className="shrink-0 text-[#6ee7b7]" />;
  return <Circle size={15} className="shrink-0 text-slate-600" />;
}

function SubtopicoCard({
  grupo,
  estudarQuery,
  index,
  assuntoExpandido,
  onAssuntoExpandedChange,
}: {
  grupo: GrupoSubtopico;
  estudarQuery: string;
  index: number;
  assuntoExpandido: boolean;
  onAssuntoExpandedChange: (open: boolean) => void;
}) {
  const [questoesExpandido, setQuestoesExpandido] = useState(false);
  const {
    titulo_aula,
    modulo_nome,
    banca,
    totalResolvidas,
    totalQuestoes,
    trabalhadas,
    questoes,
    firstSlug,
  } = grupo;

  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  const pendentes = totalQuestoes - trabalhadas;
  const questoesExibidas = questoes.length;
  const questoesTruncadas = Math.max(0, totalQuestoes - questoesExibidas);
  const listaFoiTruncada = questoesTruncadas > 0;
  const hasQuestions = totalQuestoes > 0;
  const mostrarNovo = totalResolvidas === 0 && !todas && hasQuestions;
  const mostrarBarraProgresso = totalResolvidas > 0 && !todas && hasQuestions;
  const mostrarCheckConclusao = todas && hasQuestions;
  const progressoPct = hasQuestions ? Math.round((trabalhadas / totalQuestoes) * 100) : 0;
  const panelId = `assunto-panel-${firstSlug}`;
  const toggleAssunto = () => {
    const next = !assuntoExpandido;
    if (!next) setQuestoesExpandido(false);
    onAssuntoExpandedChange(next);
  };

  const topicIcon = getTopicIcon(titulo_aula, modulo_nome);

  return (
    <motion.div
      variants={index < 8 ? itemVariants : itemGroupVariants}
      {...{ [VITRINE_PREFETCH_DATA_ATTR]: `${firstSlug}${estudarQuery}` }}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl border bg-slate-900/40 backdrop-blur-sm transition-all hover:bg-slate-900/60',
        todas
          ? 'border-[rgba(0,255,136,0.25)] hover:border-[rgba(0,255,136,0.35)]'
          : 'border-white/10 hover:border-cyan-400/30',
      )}
    >
      {mostrarNovo && (
        <span
          className="pointer-events-none absolute right-3 top-3 z-10 rounded-md border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6ee7b7] sm:text-[11px]"
          aria-label="Assunto novo"
        >
          Novo
        </span>
      )}

      <div
        className={cn(
          'flex flex-col gap-3 p-4 sm:gap-4 sm:p-5',
          mostrarNovo && 'pt-9 sm:pt-10',
        )}
      >
      <button
        type="button"
        aria-expanded={assuntoExpandido}
        aria-controls={panelId}
        onClick={toggleAssunto}
        className="group flex w-full items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3.5 text-left transition-all hover:border-cyan-400/20 hover:bg-white/[0.07]"
      >
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(0,242,255,0.2)] bg-[rgba(0,242,255,0.10)] transition-colors group-hover:border-[rgba(0,242,255,0.35)] group-hover:bg-[rgba(0,242,255,0.14)]">
          {createElement(topicIcon, {
            size: 18,
            strokeWidth: 2,
            className: 'text-cyan-400',
          })}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              'break-words text-sm font-semibold leading-snug text-white',
              assuntoExpandido ? 'line-clamp-none' : 'line-clamp-2',
            )}
          >
            {titulo_aula}
          </span>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-none text-white/35">
            <span>{banca}</span>
            <span className="text-white/15">·</span>
            <span>
              {totalQuestoes} {labelQuestoes(totalQuestoes)}
            </span>
          </p>
        </div>
        {mostrarCheckConclusao && (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#6ee7b7]" aria-hidden />
        )}
        {assuntoExpandido ? (
          <ChevronUp size={18} className="mt-0.5 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown size={18} className="mt-0.5 shrink-0 text-slate-500" />
        )}
      </button>

      <div
        id={panelId}
        aria-hidden={!assuntoExpandido}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          assuntoExpandido ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {todas && (
                <NeonBadge variant="success">Completo</NeonBadge>
              )}
              {!todas && pendentes > 0 && (
                <NeonBadge variant="warning">
                  {pendentes} pendente{pendentes !== 1 ? 's' : ''}
                </NeonBadge>
              )}
              <Button asChild variant="outline" size="sm" className="ml-auto rounded-xl border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/[0.12] hover:border-white/25 hover:text-white">
                <VitrineQuestaoLink slug={firstSlug} estudarQuery={estudarQuery}>
                  Entrar no assunto
                </VitrineQuestaoLink>
              </Button>
            </div>

            <div className="flex justify-center">
              <ProgressRingVitrine trabalhadas={trabalhadas} total={totalQuestoes} size={120} strokeWidth={14} />
            </div>

            <div className="-mt-1 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Questões trabalhadas
              </p>
            </div>

            <button
              type="button"
              onClick={() => setQuestoesExpandido((v) => !v)}
              className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <span className="text-xs font-medium">
                {questoesExpandido
                  ? 'Ocultar questões'
                  : listaFoiTruncada
                    ? `Ver ${questoesExibidas} de ${totalQuestoes} questões`
                    : `Ver ${totalQuestoes} ${labelQuestoes(totalQuestoes)}`}
              </span>
              {questoesExpandido ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </button>

            <div
              aria-hidden={!questoesExpandido}
              className={cn(
                'grid transition-[grid-template-rows] duration-200 ease-in-out',
                questoesExpandido ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                  <div className="max-h-[min(50vh,20rem)] space-y-1.5 overflow-y-auto overscroll-contain pt-1 pr-1">
                    {questoes.map((q) => {
                      const estudada = q.status === 'estudada';
                      return (
                        <VitrineQuestaoLink
                          key={q.slug}
                          slug={q.slug}
                          estudarQuery={estudarQuery}
                          className={cn(
                            'group flex min-h-[44px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-all',
                            estudada
                              ? 'border-[rgba(0,255,136,0.20)] bg-[rgba(0,255,136,0.05)] hover:border-[rgba(0,255,136,0.35)]'
                              : 'border-white/[0.08] bg-white/[0.03] hover:border-cyan-400/20 hover:bg-cyan-400/[0.05]',
                          )}
                        >
                          <StatusBadge status={q.status} />
                          <span
                            className={cn(
                              'flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium',
                              estudada ? 'text-[#6ee7b7]' : 'text-slate-200',
                            )}
                          >
                            <span>Questão {String(q.numero).padStart(2, '0')}</span>
                            {formatAvantCodigo(q.avant_codigo) && (
                              <span className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                                {formatAvantCodigo(q.avant_codigo)}
                              </span>
                            )}
                          </span>
                          {!estudada && (
                            <span className="text-[10px] font-medium text-slate-500">Iniciar</span>
                          )}
                          {estudada && <span className="text-[10px] font-medium text-[#67e8f9]">Revisitar</span>}
                          <ChevronRight
                            size={12}
                            className="shrink-0 text-slate-600 opacity-40 transition-opacity group-hover:opacity-80"
                          />
                        </VitrineQuestaoLink>
                      );
                    })}
                  </div>
                  {listaFoiTruncada && (
                    <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[11px] font-medium text-amber-400/90">
                      <span>
                        +{questoesTruncadas} {labelQuestoes(questoesTruncadas)} neste assunto.
                      </span>
                      <VitrineQuestaoLink
                        slug={firstSlug}
                        estudarQuery={estudarQuery}
                        className="inline-flex min-h-[44px] items-center font-semibold text-amber-300 underline-offset-2 hover:text-amber-200 hover:underline"
                      >
                        Ver todas
                      </VitrineQuestaoLink>
                    </p>
                  )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {totalQuestoes} {labelQuestoes(totalQuestoes)} no assunto
              </span>
              {totalResolvidas === 0 && (
                <NeonBadge variant="neutral">Não iniciado</NeonBadge>
              )}
              {totalResolvidas > 0 && !todas && (
                <NeonBadge variant="warning">Em progresso</NeonBadge>
              )}
              {todas && <NeonBadge variant="success">Concluído</NeonBadge>}
            </div>
          </div>
        </div>
      </div>

      </div>

      {mostrarBarraProgresso && (
        <div
          className="h-1 w-full shrink-0 bg-white/10"
          role="progressbar"
          aria-valuenow={progressoPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do estudo reverso neste assunto"
        >
          <div
            className="h-full bg-[#00f2ff] transition-[width] duration-300 ease-out"
            style={{ width: `${progressoPct}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
