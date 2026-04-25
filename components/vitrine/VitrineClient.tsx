'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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

const ASSUNTOS_POR_PAGINA = 12;
const FILTER_ALL = '__all__';

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
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function VitrineClient({ initialModulos }: VitrineClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Não ler `searchParams` no primeiro render: no SSR / primeiro paint o cliente pode
   * divergir da URL real → erro de hidratação. Defaults iguais ao servidor; URL aplica depois.
   */
  const [cidadeUrl, setCidadeUrl] = useState('Estudo Reverso');
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
      setCidadeUrl(c ? decodeURIComponent(c) : 'Estudo Reverso');
      setSearchTerm(searchParams.get('q') ?? '');
      setBancaFilter(searchParams.get('banca') ?? '');
      setAssuntoFilter(searchParams.get('assunto') ?? '');
      const raw = parseInt(searchParams.get('page') || '1', 10);
      setPagina(Number.isFinite(raw) && raw >= 1 ? raw : 1);
    });
    return () => cancelAnimationFrame(id);
  }, [searchParams]);

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
              <h1 className="mb-1.5">
                <span className="inline-block rounded-md bg-gradient-to-r from-indigo-600/10 via-indigo-500/12 to-violet-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-800 ring-1 ring-indigo-400/30 shadow-sm shadow-indigo-900/5 sm:text-[11px] sm:px-3">
                  Painel Tático
                </span>
              </h1>
              <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground md:line-clamp-1">
                Missão: {cidadeUrl}
              </h2>
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
                  <SelectContent position="item-aligned">
                    <SelectItem value={FILTER_ALL}>Todas as bancas</SelectItem>
                    {bancas.map((b) => (
                      <SelectItem key={b} value={b}>
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
                  <SelectContent position="item-aligned">
                    <SelectItem value={FILTER_ALL}>Todos os assuntos</SelectItem>
                    {assuntos.map((a) => (
                      <SelectItem key={a} value={a}>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <h2
              className={cn(
                'max-w-[85%] text-balance leading-[1.15] tracking-tight',
                isVitrineTituloPadrao
                  ? 'border-l-[4px] border-indigo-500 pl-4 text-2xl font-extrabold sm:pl-5 sm:text-3xl'
                  : 'text-xl font-bold text-slate-900 sm:text-2xl',
              )}
            >
              {searchTerm ? (
                `Resultados para “${searchTerm}”`
              ) : bancaFilter || assuntoFilter ? (
                `Filtrado${bancaFilter ? ` • ${bancaFilter}` : ''}${assuntoFilter ? ` • ${assuntoFilter}` : ''}`
              ) : (
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
                  Vitrine de questões
                </span>
              )}
            </h2>
            <p className="shrink-0 text-sm leading-relaxed text-slate-500 sm:max-w-[46%] sm:pb-1 sm:text-right">
              {totalAssuntos > 0 && totalPaginas > 1
                ? `Mostrando ${(paginaEfetiva - 1) * ASSUNTOS_POR_PAGINA + 1}–${Math.min(paginaEfetiva * ASSUNTOS_POR_PAGINA, totalAssuntos)} de ${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`
                : `${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`}
            </p>
          </div>

          {grupos.length > 0 ? (
            <>
              <div
                ref={vitrineListaRef}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {gruposPagina.map((grupo) => (
                  <SubtopicoCard key={grupo.titulo_aula} grupo={grupo} estudarQuery={estudarQuery} />
                ))}
              </div>
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
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Search size={48} className="mb-4 opacity-30" aria-hidden />
              <p className="font-medium">Nenhum assunto encontrado.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ─── ProgressRing — anel de progresso do método ───────────────────────────────

function ProgressRing({
  trabalhadas,
  total,
  size = 140,
  strokeWidth = 16,
}: {
  trabalhadas: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? trabalhadas / total : 0;
  const filled = pct * circumference;
  const todas = trabalhadas === total && total > 0;

  const corArco = todas ? '#22c55e' : '#6366f1';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        {trabalhadas > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={corArco}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filled} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex select-none flex-col items-center justify-center">
        <span
          className={cn(
            'leading-none font-bold tabular-nums',
            todas ? 'text-lg text-green-600 sm:text-xl' : 'text-lg text-indigo-700 sm:text-xl',
          )}
          style={{ fontSize: size >= 120 ? '1.5rem' : '1.1rem' }}
        >
          {trabalhadas}
        </span>
        <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-[0.6rem]">
          de {total}
        </span>
        {todas && (
          <span className="mt-0.5 text-[0.5rem] font-semibold uppercase tracking-wide text-green-600">
            Completo
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: QuestaoStatus }) {
  if (status === 'estudada') return <CheckCircle2 size={15} className="shrink-0 text-indigo-500" />;
  return <Circle size={15} className="shrink-0 text-muted-foreground/40" />;
}

function SubtopicoCard({ grupo, estudarQuery }: { grupo: GrupoSubtopico; estudarQuery: string }) {
  const [assuntoExpandido, setAssuntoExpandido] = useState(false);
  const [questoesExpandido, setQuestoesExpandido] = useState(false);
  const { titulo_aula, totalResolvidas, totalQuestoes, trabalhadas, questoes, firstSlug } = grupo;

  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  const pendentes = totalQuestoes - trabalhadas;
  const panelId = `assunto-panel-${firstSlug}`;
  const toggleAssunto = () => {
    setAssuntoExpandido((prev) => {
      const next = !prev;
      if (!next) setQuestoesExpandido(false);
      return next;
    });
  };

  return (
    <motion.div
      layout
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'flex flex-col gap-3 rounded-3xl border bg-card p-4 transition-all sm:gap-4 sm:p-5',
        todas
          ? 'border-green-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10'
          : 'border-border hover:border-indigo-300/50 hover:shadow-lg hover:shadow-indigo-500/10',
      )}
    >
      <button
        type="button"
        aria-expanded={assuntoExpandido}
        aria-controls={panelId}
        onClick={toggleAssunto}
        className="flex w-full items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/60"
      >
        <span
          className={cn(
            'text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-lg',
            assuntoExpandido ? 'line-clamp-none' : 'line-clamp-3 sm:line-clamp-2',
          )}
        >
          {titulo_aula}
        </span>
        {assuntoExpandido ? (
          <ChevronUp size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
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
                <span className="shrink-0 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  Completo
                </span>
              )}
              {!todas && pendentes > 0 && (
                <span className="shrink-0 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                  {pendentes} pendente{pendentes !== 1 ? 's' : ''}
                </span>
              )}
              <Button asChild variant="outline" size="sm" className="ml-auto rounded-xl">
                <Link href={`/estudar/${firstSlug}${estudarQuery}`}>Entrar no assunto</Link>
              </Button>
            </div>

            <div className="flex justify-center">
              <ProgressRing trabalhadas={trabalhadas} total={totalQuestoes} size={120} strokeWidth={14} />
            </div>

            <div className="-mt-1 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Questões trabalhadas
              </p>
            </div>

            <button
              type="button"
              onClick={() => setQuestoesExpandido((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="text-xs font-medium">
                {questoesExpandido
                  ? 'Ocultar questões'
                  : `Ver ${totalQuestoes} questão${totalQuestoes !== 1 ? 'ões' : ''}`}
              </span>
              {questoesExpandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                            'group flex items-center gap-3 rounded-xl border px-3 py-2 transition-all',
                            estudada
                              ? 'border-indigo-100 bg-indigo-50 hover:border-indigo-300'
                              : 'border-border bg-muted/30 hover:border-indigo-200 hover:bg-indigo-50/80',
                          )}
                        >
                          <StatusBadge status={q.status} />
                          <span
                            className={cn(
                              'flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium',
                              estudada ? 'text-indigo-800' : 'text-foreground',
                            )}
                          >
                            <span>Questão {String(q.numero).padStart(2, '0')}</span>
                            {formatAvantCodigo(q.avant_codigo) && (
                              <span className="rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] text-indigo-700">
                                {formatAvantCodigo(q.avant_codigo)}
                              </span>
                            )}
                          </span>
                          {!estudada && (
                            <span className="text-[10px] font-medium text-muted-foreground">Iniciar</span>
                          )}
                          {estudada && <span className="text-[10px] font-medium text-indigo-600">Revisitar</span>}
                          <ChevronRight
                            size={12}
                            className="shrink-0 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-80"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {totalQuestoes} questão{totalQuestoes !== 1 ? 'ões' : ''} no assunto
              </span>
              {totalResolvidas === 0 && (
                <span className="text-[10px] font-medium text-muted-foreground/70">Não iniciado</span>
              )}
              {totalResolvidas > 0 && !todas && (
                <span className="text-[10px] font-medium text-indigo-600">Em progresso</span>
              )}
              {todas && <span className="text-[10px] font-medium text-green-600">Concluído</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
