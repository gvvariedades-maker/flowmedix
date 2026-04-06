'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  LayoutDashboard, Search, X, Filter,
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  CheckCircle2, Circle,
} from 'lucide-react';
import { formatAvantCodigo } from '@/lib/avantCodigo';

const ASSUNTOS_POR_PAGINA = 12;

// ─── Interfaces ───────────────────────────────────────────────────────────────

type QuestaoStatus = 'nao_estudada' | 'estudada';

interface QuestaoItem {
  slug: string;
  numero: number;
  status: QuestaoStatus;
  avant_codigo: number | null;
}

interface ModuloEstudo {
  id: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  modulo_slug: string;
  banca: string;
  avant_codigo: number | null;
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
  totalResolvidas: number;  // tentativas registradas
  totalQuestoes: number;    // total de questões disponíveis
  trabalhadas: number;      // questões que o aluno abriu/respondeu ao menos uma vez
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
  const cidadeUrl = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : 'Treinamento';

  const [modulos] = useState<ModuloEstudo[]>(initialModulos);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [bancaFilter, setBancaFilter] = useState<string>(searchParams.get('banca') ?? '');
  const [assuntoFilter, setAssuntoFilter] = useState<string>(searchParams.get('assunto') ?? '');
  const [pagina, setPagina] = useState(() => {
    const raw = parseInt(searchParams.get('page') || '1', 10);
    return Number.isFinite(raw) && raw >= 1 ? raw : 1;
  });

  const bancas = useMemo(
    () => [...new Set(modulos.map(m => m.banca).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [modulos],
  );
  const assuntos = useMemo(
    () =>
      [...new Set(modulos.map(m => m.titulo_aula).filter((n): n is string => !!n))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [modulos],
  );

  const filtrosPrevRef = useRef<{ b: string; a: string; q: string } | null>(null);
  useEffect(() => {
    if (filtrosPrevRef.current === null) {
      filtrosPrevRef.current = { b: bancaFilter, a: assuntoFilter, q: searchTerm };
      return;
    }
    const prev = filtrosPrevRef.current;
    const mudou =
      prev.b !== bancaFilter || prev.a !== assuntoFilter || prev.q !== searchTerm;
    filtrosPrevRef.current = { b: bancaFilter, a: assuntoFilter, q: searchTerm };
    if (mudou) setPagina(1);
  }, [bancaFilter, assuntoFilter, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (bancaFilter) params.set('banca', bancaFilter); else params.delete('banca');
    if (assuntoFilter) params.set('assunto', assuntoFilter); else params.delete('assunto');
    if (searchTerm) params.set('q', searchTerm); else params.delete('q');
    if (pagina > 1) params.set('page', String(pagina)); else params.delete('page');
    const queryString = params.toString();
    const newSearch = queryString ? `?${queryString}` : '';
    if (typeof window !== 'undefined' && window.location.search !== newSearch) {
      router.replace(`${pathname}${newSearch}`, { scroll: false });
    }
  }, [bancaFilter, assuntoFilter, searchTerm, pagina, pathname, router, searchParams]);

  const filteredModulos = useMemo(() => {
    let result = modulos;
    if (bancaFilter) result = result.filter(m => m.banca === bancaFilter);
    if (assuntoFilter) result = result.filter(m => m.titulo_aula === assuntoFilter);
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

  // Agrupa apenas por titulo_aula — 1 card por assunto
  const grupos = useMemo(() => {
    const map = new Map<string, GrupoSubtopico>();

    filteredModulos.forEach(m => {
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

      // "estudada" = aluno confirmou conclusão do ciclo de estudo reverso
      const status: QuestaoStatus = m.estudoReversoConcluido ? 'estudada' : 'nao_estudada';

      grupo.questoes.push({
        slug: m.modulo_slug,
        numero: 0,
        status,
        avant_codigo: m.avant_codigo,
      });
      grupo.acertos += m.stats.acertos;
      grupo.erros += m.stats.total - m.stats.acertos;
      grupo.totalResolvidas += m.stats.total;
      grupo.totalQuestoes += 1;
      // "trabalhada" = aluno concluiu o ciclo de estudo reverso explicitamente
      if (m.estudoReversoConcluido) grupo.trabalhadas += 1;
      const tentativas = grupo.acertos + grupo.erros;
      grupo.percentual = tentativas > 0 ? Math.round((grupo.acertos / tentativas) * 100) : 0;
    });

    // Ordena dentro de cada grupo: não estudadas primeiro, estudadas depois
    map.forEach(grupo => {
      grupo.questoes.sort((a, b) => {
        const estudadaA = a.status === 'estudada' ? 1 : 0;
        const estudadaB = b.status === 'estudada' ? 1 : 0;
        return estudadaA - estudadaB;
      });
      grupo.questoes.forEach((q, i) => { q.numero = i + 1; });
      // firstSlug = primeira não trabalhada ou primeira errada
      grupo.firstSlug = grupo.questoes[0]?.slug ?? grupo.firstSlug;
    });

    return Array.from(map.values()).sort((a, b) => {
      // Prioriza assuntos com mais questões não trabalhadas
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
    if (pagina > totalPaginas) setPagina(totalPaginas);
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

  const grupoComMaisPendentes = useMemo(() =>
    grupos.find(g => g.trabalhadas < g.totalQuestoes) ?? null,
    [grupos],
  );
  const showHero = !searchTerm && !bancaFilter && !assuntoFilter && grupoComMaisPendentes !== null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 pb-safe selection:bg-indigo-100 selection:text-indigo-900">

      {/* ── HEADER ── */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto min-w-0">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-100 text-indigo-600 border border-slate-200 shrink-0">
              <LayoutDashboard size={24} />
            </div>
            <div className="min-w-0 flex-1 md:flex-none">
              <h1 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-slate-400">
                Painel Tático
              </h1>
              <h2 className="text-sm sm:text-lg md:text-xl font-[1000] italic uppercase tracking-tighter text-slate-800 line-clamp-2 md:line-clamp-1 leading-tight">
                Missão: {cidadeUrl}
              </h2>
            </div>
          </div>

          <div className="flex-1 max-w-xl w-full relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Assunto, tópico, banca, slug ou Q-…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-2xl bg-slate-100 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 space-y-12">

        {/* ── FILTROS ── */}
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Filtros</span>
          </div>
          <select
            value={bancaFilter}
            onChange={e => setBancaFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value="">Todas as bancas</option>
            {bancas.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={assuntoFilter}
            onChange={e => setAssuntoFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[200px]"
          >
            <option value="">Todos os assuntos</option>
            {assuntos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {(bancaFilter || assuntoFilter) && (
            <button
              onClick={() => { setBancaFilter(''); setAssuntoFilter(''); }}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-wider"
            >
              Limpar filtros
            </button>
          )}
        </section>

        {/* ── HERO: PRÓXIMO ASSUNTO A TRABALHAR ── */}
        <AnimatePresence>
          {showHero && grupoComMaisPendentes && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 ml-2">
                Continue de onde parou
              </div>
              <Link href={`/estudar/${grupoComMaisPendentes.firstSlug}`}>
                <div className="relative group overflow-hidden rounded-[40px] border border-indigo-200 bg-white p-8 md:p-10 transition-all hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen size={120} className="text-indigo-500" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-3 text-center md:text-left">
                      <span className="px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.2em]">
                        Próximo ciclo de estudo
                      </span>
                      <h3 className="text-3xl md:text-4xl font-[1000] italic uppercase tracking-tighter leading-none text-slate-900">
                        {grupoComMaisPendentes.titulo_aula}
                      </h3>
                      <p className="text-slate-500 font-medium max-w-xl text-sm">
                        <strong className="text-indigo-600">
                          {grupoComMaisPendentes.totalQuestoes - grupoComMaisPendentes.trabalhadas} questão{(grupoComMaisPendentes.totalQuestoes - grupoComMaisPendentes.trabalhadas) !== 1 ? 'ões' : ''}
                        </strong>{' '}
                        ainda não trabalhada{(grupoComMaisPendentes.totalQuestoes - grupoComMaisPendentes.trabalhadas) !== 1 ? 's' : ''} neste assunto.
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <ProgressRing
                        trabalhadas={grupoComMaisPendentes.trabalhadas}
                        total={grupoComMaisPendentes.totalQuestoes}
                        size={96}
                        strokeWidth={10}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── VITRINE DE QUESTÕES ── */}
        <section className="space-y-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-500">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : bancaFilter || assuntoFilter
                  ? `Filtrado${bancaFilter ? ` • ${bancaFilter}` : ''}${assuntoFilter ? ` • ${assuntoFilter}` : ''}`
                  : 'Vitrine de Questões'}
            </h3>
            <div className="h-px flex-1 min-w-[4rem] bg-slate-200 hidden sm:block" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full sm:w-auto sm:text-right">
              {totalAssuntos > 0 && totalPaginas > 1
                ? `Mostrando ${(paginaEfetiva - 1) * ASSUNTOS_POR_PAGINA + 1}–${Math.min(paginaEfetiva * ASSUNTOS_POR_PAGINA, totalAssuntos)} de ${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`
                : `${totalAssuntos} assunto${totalAssuntos !== 1 ? 's' : ''}`}
            </span>
          </div>

          {grupos.length > 0 ? (
            <>
              <div
                ref={vitrineListaRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {gruposPagina.map(grupo => (
                  <SubtopicoCard key={grupo.titulo_aula} grupo={grupo} />
                ))}
              </div>
              {totalPaginas > 1 && (
                <nav
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-200"
                  aria-label="Paginação da vitrine"
                >
                  <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                    Página {paginaEfetiva} de {totalPaginas}
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2 sm:ml-auto">
                    <button
                      type="button"
                      disabled={paginaEfetiva <= 1}
                      onClick={() => setPagina(p => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft size={18} />
                      Anterior
                    </button>
                    <button
                      type="button"
                      disabled={paginaEfetiva >= totalPaginas}
                      onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      Próxima
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Nenhum assunto encontrado.</p>
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

  // Cor: cinza → indigo parcial → verde completo
  const corArco = todas ? '#22c55e' : '#6366f1';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Trilha */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        {/* Progresso */}
        {trabalhadas > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
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
      {/* Centro */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span style={{
          fontSize: size >= 120 ? '1.6rem' : '1.1rem',
          fontWeight: 900,
          color: todas ? '#16a34a' : '#3730a3',
          lineHeight: 1,
          fontStyle: 'italic',
        }}>
          {trabalhadas}
        </span>
        <span style={{
          fontSize: size >= 120 ? '0.55rem' : '0.42rem',
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: '3px',
        }}>
          de {total}
        </span>
        {todas && (
          <span style={{ fontSize: '0.42rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
            completo ✓
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Badge de status individual da questão ────────────────────────────────────

function StatusBadge({ status }: { status: QuestaoStatus }) {
  if (status === 'estudada') return <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />;
  return <Circle size={15} className="text-slate-300 shrink-0" />;
}

// ─── SubtopicoCard ────────────────────────────────────────────────────────────

function SubtopicoCard({ grupo }: { grupo: GrupoSubtopico }) {
  const [expandido, setExpandido] = useState(false);
  const router = useRouter();
  const {
    titulo_aula, acertos, erros,
    totalResolvidas, totalQuestoes, trabalhadas,
    questoes, firstSlug,
  } = grupo;

  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  const pendentes = totalQuestoes - trabalhadas;

  // Navega para a primeira questão não estudada ao clicar no card
  const handleCardClick = () => router.push(`/estudar/${firstSlug}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={handleCardClick}
      className={`bg-white rounded-3xl p-5 flex flex-col gap-4 transition-all border cursor-pointer
        ${todas
          ? 'border-green-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10'
          : 'border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10'
        }`}
    >
      {/* Breadcrumb + badge de status */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 leading-snug flex-1">
          Questões — Assunto{' '}
          <span className="text-slate-700">({titulo_aula})</span>
        </p>
        {todas && (
          <span className="shrink-0 text-[8px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-0.5 rounded-md border border-green-100">
            Completo
          </span>
        )}
        {!todas && pendentes > 0 && (
          <span className="shrink-0 text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md border border-indigo-100">
            {pendentes} pendente{pendentes !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Anel de progresso */}
      <div className="flex justify-center">
        <ProgressRing trabalhadas={trabalhadas} total={totalQuestoes} />
      </div>

      {/* Label principal: foco no método */}
      <div className="text-center -mt-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          questões trabalhadas
        </p>
      </div>

      {/* Botão expandir — bloqueia propagação para não navegar ao clicar */}
      <button
        onClick={e => { e.stopPropagation(); setExpandido(v => !v); }}
        className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-slate-600 hover:text-indigo-600"
      >
        <span className="text-[9px] font-black uppercase tracking-widest">
          {expandido ? 'Ocultar questões' : `Ver ${totalQuestoes} questão${totalQuestoes !== 1 ? 'ões' : ''}`}
        </span>
        {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Lista expansível de questões */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-1">
              {questoes.map(q => {
                const estudada = q.status === 'estudada';
                return (
                  <Link
                    key={q.slug}
                    href={`/estudar/${q.slug}`}
                    onClick={e => e.stopPropagation()}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all group
                      ${estudada
                        ? 'border-indigo-100 bg-indigo-50 hover:border-indigo-300'
                        : 'border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50'
                      }`}
                  >
                    <StatusBadge status={q.status} />
                    <span className={`flex-1 text-[10px] font-black uppercase tracking-wider flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0
                      ${estudada ? 'text-indigo-600' : 'text-slate-600'}`}>
                      <span>Questão {String(q.numero).padStart(2, '0')}</span>
                      {formatAvantCodigo(q.avant_codigo) && (
                        <span className="font-mono text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                          {formatAvantCodigo(q.avant_codigo)}
                        </span>
                      )}
                    </span>
                    {!estudada && (
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        iniciar
                      </span>
                    )}
                    {estudada && (
                      <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider">
                        revisitar
                      </span>
                    )}
                    <ChevronRight size={12} className="shrink-0 opacity-30 group-hover:opacity-80 transition-opacity text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          {totalQuestoes} questão{totalQuestoes !== 1 ? 'ões' : ''} no assunto
        </span>
        {totalResolvidas === 0 && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
            não iniciado
          </span>
        )}
        {totalResolvidas > 0 && !todas && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">
            em progresso
          </span>
        )}
        {todas && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">
            concluído ✓
          </span>
        )}
      </div>
    </motion.div>
  );
}
