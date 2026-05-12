'use client';

import { useState, useMemo, useEffect, useRef, createElement } from 'react';
import Link from 'next/link';
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
  ChevronLeft,
  CheckCircle2,
  Circle,
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
  type LucideIcon,
} from 'lucide-react';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { compareModuloCurriculum } from '@/lib/vitrineOrder';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { NeonBadge } from '@/components/ui/neon-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressRing } from '@/components/ui/progress-ring';

import {
  FILTER_ALL_VALUE,
  SELECT_CONTENT_DARK,
  SELECT_ITEM_DARK,
} from '@/components/dashboard/dashboard-select-dark';

const ASSUNTOS_POR_PAGINA = 12;
const FILTER_ALL = FILTER_ALL_VALUE;

const containerVariants = {
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

interface ModuloEstudo {
  id: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  modulo_slug: string;
  banca: string;
  avant_codigo: number | null;
  created_at: string | null;
  estudoReversoConcluido: boolean;
  stats: {
    acertos: number;
    total: number;
    percentual: number;
    priorityScore: number;
  };
}

interface GrupoSubtopico {
  titulo_aula: string;
  modulo_nome: string;
  banca: string;
  questoes: QuestaoItem[];
  acertos: number;
  erros: number;
  totalResolvidas: number;
  totalQuestoes: number;
  trabalhadas: number;
  percentual: number;
  firstSlug: string;
}

interface VitrineClientProps {
  initialModulos: ModuloEstudo[];
  /** Título quando a URL não traz `?cidade=` (ex.: nome do edital matriculado). */
  fallbackTitulo?: string;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function VitrineClient({
  initialModulos,
  fallbackTitulo = 'Estudo Reverso',
}: VitrineClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Não ler `searchParams` no primeiro render: no SSR / primeiro paint o cliente pode
   * divergir da URL real → erro de hidratação. Defaults iguais ao servidor; URL aplica depois.
   */
  const [cidadeUrl, setCidadeUrl] = useState(fallbackTitulo);
  const [modulos] = useState<ModuloEstudo[]>(initialModulos);
  const [searchTerm, setSearchTerm] = useState('');
  const [bancaFilter, setBancaFilter] = useState('');
  const [assuntoFilter, setAssuntoFilter] = useState('');
  const [pagina, setPagina] = useState(1);
  /**
   * Radix Select gera `aria-controls` (ids) que podem divergir entre SSR e hidratação (React/Next 16 + Turbopack).
   * O primeiro frame usa placeholders estáticos; após o mount, os `Select` montam só no cliente.
   */
  const [filtrosSelectMontados, setFiltrosSelectMontados] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setFiltrosSelectMontados(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /** Sincroniza estado com a barra de endereços (abertura, voltar/avançar, links externos). */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const c = searchParams.get('cidade');
      setCidadeUrl(c ? decodeURIComponent(c) : fallbackTitulo);
      setSearchTerm(searchParams.get('q') ?? '');
      setBancaFilter(searchParams.get('banca') ?? '');
      setAssuntoFilter(searchParams.get('assunto') ?? '');
      const raw = parseInt(searchParams.get('page') || '1', 10);
      setPagina(Number.isFinite(raw) && raw >= 1 ? raw : 1);
    });
    return () => cancelAnimationFrame(id);
  }, [searchParams, fallbackTitulo]);

  const bancas = useMemo(
    () => [...new Set(modulos.map((m) => m.banca).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [modulos],
  );
  const assuntos = useMemo(
    () =>
      [...new Set(modulos.map((m) => m.titulo_aula).filter((n): n is string => !!n))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [modulos],
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (bancaFilter) params.set('banca', bancaFilter);
    else params.delete('banca');
    if (assuntoFilter) params.set('assunto', assuntoFilter);
    else params.delete('assunto');
    if (searchTerm) params.set('q', searchTerm);
    else params.delete('q');
    if (pagina > 1) params.set('page', String(pagina));
    else params.delete('page');
    const queryString = params.toString();
    const newSearch = queryString ? `?${queryString}` : '';
    if (typeof window !== 'undefined' && window.location.search !== newSearch) {
      router.replace(`${pathname}${newSearch}`, { scroll: false });
    }
  }, [bancaFilter, assuntoFilter, searchTerm, pagina, pathname, router, searchParams]);

  /** Só banca/assunto/q — repassado ao abrir questão para o player usar a mesma lista filtrada. */
  const estudarQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (bancaFilter) p.set('banca', bancaFilter);
    if (assuntoFilter) p.set('assunto', assuntoFilter);
    if (searchTerm.trim()) p.set('q', searchTerm.trim());
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [bancaFilter, assuntoFilter, searchTerm]);

  const filteredModulos = useMemo(() => {
    let result = modulos;
    if (bancaFilter) result = result.filter((m) => m.banca === bancaFilter);
    if (assuntoFilter) result = result.filter((m) => m.titulo_aula === assuntoFilter);
    if (searchTerm) {
      const q = searchTerm.trim().toLowerCase();
      const soNumero = q.replace(/^q-?/, '');
      result = result.filter((m) => {
        if (m.titulo_aula?.toLowerCase().includes(q) ?? false) return true;
        if (m.modulo_nome?.toLowerCase().includes(q) ?? false) return true;
        if (m.banca?.toLowerCase().includes(q) ?? false) return true;
        if (m.modulo_slug?.toLowerCase().includes(q) ?? false) return true;
        if (m.avant_codigo != null) {
          if (String(m.avant_codigo) === soNumero) return true;
          if (`q-${m.avant_codigo}`.includes(q)) return true;
        }
        return false;
      });
    }
    return result;
  }, [modulos, bancaFilter, assuntoFilter, searchTerm]);

  const grupos = useMemo(() => {
    const map = new Map<string, GrupoSubtopico>();

    filteredModulos.forEach((m) => {
      const topico = m.modulo_nome || 'Geral';
      const subtopico = m.titulo_aula || 'Sem subtópico';
      const banca = m.banca || '';
      const key = subtopico;

      if (!map.has(key)) {
        map.set(key, {
          titulo_aula: subtopico,
          modulo_nome: topico,
          banca,
          questoes: [],
          acertos: 0,
          erros: 0,
          totalResolvidas: 0,
          totalQuestoes: 0,
          trabalhadas: 0,
          percentual: 0,
          firstSlug: m.modulo_slug,
        });
      }

      const grupo = map.get(key)!;

      const status: QuestaoStatus = m.estudoReversoConcluido ? 'estudada' : 'nao_estudada';

      grupo.questoes.push({
        slug: m.modulo_slug,
        numero: 0,
        status,
        avant_codigo: m.avant_codigo,
        created_at: m.created_at,
      });
      grupo.acertos += m.stats.acertos;
      grupo.erros += m.stats.total - m.stats.acertos;
      grupo.totalResolvidas += m.stats.total;
      grupo.totalQuestoes += 1;
      if (m.estudoReversoConcluido) grupo.trabalhadas += 1;
      const tentativas = grupo.acertos + grupo.erros;
      grupo.percentual = tentativas > 0 ? Math.round((grupo.acertos / tentativas) * 100) : 0;
    });

    map.forEach((grupo) => {
      grupo.questoes.sort((a, b) =>
        compareModuloCurriculum(
          { created_at: a.created_at, avant_codigo: a.avant_codigo, modulo_slug: a.slug },
          { created_at: b.created_at, avant_codigo: b.avant_codigo, modulo_slug: b.slug },
        ),
      );
      grupo.questoes.forEach((q, i) => {
        q.numero = i + 1;
      });
      const primeiroNao = grupo.questoes.find((q) => q.status === 'nao_estudada');
      grupo.firstSlug = primeiroNao?.slug ?? grupo.questoes[0]?.slug ?? grupo.firstSlug;
    });

    return Array.from(map.values()).sort((a, b) => {
      const pendentesA = a.totalQuestoes - a.trabalhadas;
      const pendentesB = b.totalQuestoes - b.trabalhadas;
      if (pendentesB !== pendentesA) return pendentesB - pendentesA;
      return a.titulo_aula.localeCompare(b.titulo_aula);
    });
  }, [filteredModulos]);

  const totalAssuntos = grupos.length;
  const totalPaginas = Math.max(1, Math.ceil(totalAssuntos / ASSUNTOS_POR_PAGINA));
  const paginaEfetiva = Math.min(Math.max(1, pagina), totalPaginas);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (pagina > totalPaginas) setPagina(totalPaginas);
    });
    return () => cancelAnimationFrame(id);
  }, [pagina, totalPaginas]);

  const gruposPagina = useMemo(() => {
    const start = (paginaEfetiva - 1) * ASSUNTOS_POR_PAGINA;
    return grupos.slice(start, start + ASSUNTOS_POR_PAGINA);
  }, [grupos, paginaEfetiva]);

  const vitrineListaRef = useRef<HTMLDivElement>(null);
  const paginaScrollSkipRef = useRef(true);
  useEffect(() => {
    if (paginaScrollSkipRef.current) {
      paginaScrollSkipRef.current = false;
      return;
    }
    vitrineListaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pagina]);

  const isVitrineTituloPadrao =
    !searchTerm.trim() && !bancaFilter && !assuntoFilter;

  return (
    <div className="dashboard-surface min-h-screen bg-background pb-24 pb-safe text-foreground selection:bg-indigo-100 selection:text-indigo-900">
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/95 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <header className="bg-transparent">
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
                setPagina(1);
              }}
              className="h-11 rounded-2xl border-border/80 pl-11 pr-11"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
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

        <div className="mx-auto max-w-7xl px-6 pb-6 pt-0">
        <section className="space-y-4" aria-label="Filtros da vitrine">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter size={16} aria-hidden />
            <span className="text-xs font-medium uppercase tracking-wider">Filtros</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtrosSelectMontados ? (
              <>
                <Select
                  value={bancaFilter || FILTER_ALL}
                  onValueChange={(v) => {
                    setBancaFilter(v === FILTER_ALL ? '' : v);
                    setPagina(1);
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Todas as bancas" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" className={SELECT_CONTENT_DARK}>
                    <SelectItem value={FILTER_ALL} className={SELECT_ITEM_DARK}>Todas as bancas</SelectItem>
                    {bancas.map((b) => (
                      <SelectItem key={b} value={b} className={SELECT_ITEM_DARK}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={assuntoFilter || FILTER_ALL}
                  onValueChange={(v) => {
                    setAssuntoFilter(v === FILTER_ALL ? '' : v);
                    setPagina(1);
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Todos os assuntos" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" className={SELECT_CONTENT_DARK}>
                    <SelectItem value={FILTER_ALL} className={SELECT_ITEM_DARK}>Todos os assuntos</SelectItem>
                    {assuntos.map((a) => (
                      <SelectItem key={a} value={a} className={SELECT_ITEM_DARK}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <div
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm text-foreground/80 shadow-sm"
                  aria-hidden
                >
                  <span className="line-clamp-1">Todas as bancas</span>
                  <ChevronDown className="h-4 w-4 opacity-50" aria-hidden />
                </div>
                <div
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm text-foreground/80 shadow-sm"
                  aria-hidden
                >
                  <span className="line-clamp-1">Todos os assuntos</span>
                  <ChevronDown className="h-4 w-4 opacity-50" aria-hidden />
                </div>
              </>
            )}
          </div>
          {(bancaFilter || assuntoFilter) && (
            <button
              type="button"
              onClick={() => {
                setBancaFilter('');
                setAssuntoFilter('');
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

      <main className="mx-auto max-w-7xl space-y-8 px-6 pt-6 md:pt-8">
        <section className="space-y-8">
          <PageHeader
            title={
              searchTerm
                ? `Resultados para "${searchTerm}"`
                : bancaFilter || assuntoFilter
                  ? `Filtrado${bancaFilter ? ` \u2022 ${bancaFilter}` : ''}${assuntoFilter ? ` \u2022 ${assuntoFilter}` : ''}`
                  : 'Vitrine de questões'
            }
            description={
              totalAssuntos > 0 && totalPaginas > 1
                ? `Mostrando ${(paginaEfetiva - 1) * ASSUNTOS_POR_PAGINA + 1}\u2013${Math.min(paginaEfetiva * ASSUNTOS_POR_PAGINA, totalAssuntos)} de ${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`
                : `${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`
            }
            titleClassName="border-l-4 border-cyan-400 pl-4 text-2xl font-black text-white truncate"
          />
          {grupos.length > 0 ? (
            <>
              <motion.div
                ref={vitrineListaRef}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4"
              >
                {gruposPagina.map((grupo, idx) => (
                  <SubtopicoCard key={grupo.titulo_aula} grupo={grupo} estudarQuery={estudarQuery} index={idx} />
                ))}
              </motion.div>
              {totalPaginas > 1 && (
                <nav
                  className="flex flex-col gap-4 border-t border-border pt-2 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Paginação da vitrine"
                >
                  <p className="order-2 text-xs font-medium text-muted-foreground sm:order-1">
                    Página {paginaEfetiva} de {totalPaginas}
                  </p>
                  <div className="order-1 flex items-center gap-2 sm:order-2 sm:ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={paginaEfetiva <= 1}
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      className="rounded-xl"
                    >
                      <ChevronLeft size={18} className="mr-1" />
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={paginaEfetiva >= totalPaginas}
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      className="rounded-xl"
                    >
                      Próxima
                      <ChevronRight size={18} className="ml-1" />
                    </Button>
                  </div>
                </nav>
              )}
            </>
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

function SubtopicoCard({ grupo, estudarQuery, index }: { grupo: GrupoSubtopico; estudarQuery: string; index: number }) {
  const [assuntoExpandido, setAssuntoExpandido] = useState(false);
  const [questoesExpandido, setQuestoesExpandido] = useState(false);
  const { titulo_aula, modulo_nome, totalResolvidas, totalQuestoes, trabalhadas, questoes, firstSlug } = grupo;

  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  const pendentes = totalQuestoes - trabalhadas;
  const hasQuestions = totalQuestoes > 0;
  const mostrarNovo = totalResolvidas === 0 && !todas && hasQuestions;
  const mostrarBarraProgresso = totalResolvidas > 0 && !todas && hasQuestions;
  const mostrarCheckConclusao = todas && hasQuestions;
  const progressoPct = hasQuestions ? Math.round((trabalhadas / totalQuestoes) * 100) : 0;
  const panelId = `assunto-panel-${firstSlug}`;
  const toggleAssunto = () => {
    setAssuntoExpandido((prev) => {
      const next = !prev;
      if (!next) setQuestoesExpandido(false);
      return next;
    });
  };

  const topicIcon = getTopicIcon(titulo_aula, modulo_nome);

  return (
    <motion.div
      layout
      variants={index < 8 ? itemVariants : itemGroupVariants}
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
        <span
          className={cn(
            'min-w-0 flex-1 break-words text-sm font-semibold leading-snug text-white',
            assuntoExpandido ? 'line-clamp-none' : 'line-clamp-2',
          )}
        >
          {titulo_aula}
        </span>
        {mostrarCheckConclusao && (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#6ee7b7]" aria-hidden />
        )}
        {assuntoExpandido ? (
          <ChevronUp size={18} className="mt-0.5 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown size={18} className="mt-0.5 shrink-0 text-slate-500" />
        )}
      </button>

      <AnimatePresence>
        {assuntoExpandido && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="space-y-3 overflow-hidden sm:space-y-4"
          >
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
                <Link href={`/estudar/${firstSlug}${estudarQuery}`}>Entrar no assunto</Link>
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
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <span className="text-xs font-medium">
                {questoesExpandido
                  ? 'Ocultar questões'
                  : `Ver ${totalQuestoes} questão${totalQuestoes !== 1 ? 'ões' : ''}`}
              </span>
              {questoesExpandido ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </button>

            <AnimatePresence>
              {questoesExpandido && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="max-h-[min(50vh,20rem)] space-y-1.5 overflow-y-auto overscroll-contain pt-1 pr-1">
                    {questoes.map((q) => {
                      const estudada = q.status === 'estudada';
                      return (
                        <Link
                          key={q.slug}
                          href={`/estudar/${q.slug}${estudarQuery}`}
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
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {totalQuestoes} questão{totalQuestoes !== 1 ? 'ões' : ''} no assunto
              </span>
              {totalResolvidas === 0 && (
                <NeonBadge variant="neutral">Não iniciado</NeonBadge>
              )}
              {totalResolvidas > 0 && !todas && (
                <NeonBadge variant="warning">Em progresso</NeonBadge>
              )}
              {todas && <NeonBadge variant="success">Concluído</NeonBadge>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
