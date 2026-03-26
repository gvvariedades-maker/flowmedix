'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Flame, AlertTriangle,
  LayoutDashboard, Search, X, Filter,
  ChevronDown, ChevronUp, ChevronRight,
  CheckCircle2, XCircle, Circle,
} from 'lucide-react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

type QuestaoStatus = 'nao_respondida' | 'acertou' | 'errou';

interface QuestaoItem {
  slug: string;
  numero: number;
  status: QuestaoStatus;
}

interface ModuloEstudo {
  id: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  modulo_slug: string;
  banca: string;
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
  percentual: number;
  firstSlug: string;
}

interface VitrineClientProps {
  initialModulos: ModuloEstudo[];
  globalStats: {
    ofensiva: number;
    xp: number;
    taxaGeral: number;
  };
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function VitrineClient({ initialModulos, globalStats: initialGlobalStats }: VitrineClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cidadeUrl = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : 'Treinamento';

  const [modulos] = useState<ModuloEstudo[]>(initialModulos);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [globalStats] = useState(initialGlobalStats);
  const [bancaFilter, setBancaFilter] = useState<string>(searchParams.get('banca') ?? '');
  const [assuntoFilter, setAssuntoFilter] = useState<string>(searchParams.get('assunto') ?? '');

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

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (bancaFilter) params.set('banca', bancaFilter); else params.delete('banca');
    if (assuntoFilter) params.set('assunto', assuntoFilter); else params.delete('assunto');
    if (searchTerm) params.set('q', searchTerm); else params.delete('q');
    const queryString = params.toString();
    const newSearch = queryString ? `?${queryString}` : '';
    if (typeof window !== 'undefined' && window.location.search !== newSearch) {
      router.replace(`${pathname}${newSearch}`, { scroll: false });
    }
  }, [bancaFilter, assuntoFilter, searchTerm, pathname, router, searchParams]);

  const filteredModulos = useMemo(() => {
    let result = modulos;
    if (bancaFilter) result = result.filter(m => m.banca === bancaFilter);
    if (assuntoFilter) result = result.filter(m => m.titulo_aula === assuntoFilter);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        m =>
          (m.titulo_aula?.toLowerCase().includes(lower) ?? false) ||
          (m.modulo_nome?.toLowerCase().includes(lower) ?? false),
      );
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
          percentual: 0,
          firstSlug: m.modulo_slug,
        });
      }

      const grupo = map.get(key)!;

      // Determina status individual da questão
      const status: QuestaoStatus =
        m.stats.total === 0 ? 'nao_respondida' :
        m.stats.acertos > 0 ? 'acertou' : 'errou';

      grupo.questoes.push({ slug: m.modulo_slug, numero: 0, status });
      grupo.acertos += m.stats.acertos;
      grupo.erros += m.stats.total - m.stats.acertos;
      grupo.totalResolvidas += m.stats.total;
      grupo.totalQuestoes += 1;
      const tentativas = grupo.acertos + grupo.erros;
      grupo.percentual = tentativas > 0 ? Math.round((grupo.acertos / tentativas) * 100) : 0;
    });

    // Para cada grupo: ordena questões (não_respondidas → errou → acertou) e numera
    const ORDEM: Record<QuestaoStatus, number> = { nao_respondida: 0, errou: 1, acertou: 2 };
    map.forEach(grupo => {
      grupo.questoes.sort((a, b) => ORDEM[a.status] - ORDEM[b.status]);
      grupo.questoes.forEach((q, i) => { q.numero = i + 1; });

      // firstSlug = primeira não respondida → primeira errada → primeira acertada
      const primeiro = grupo.questoes[0];
      grupo.firstSlug = primeiro?.slug ?? grupo.firstSlug;
    });

    return Array.from(map.values()).sort((a, b) => a.titulo_aula.localeCompare(b.titulo_aula));
  }, [filteredModulos]);

  const topPriority = useMemo(() => filteredModulos[0], [filteredModulos]);
  const showHero =
    !searchTerm && !bancaFilter && !assuntoFilter && topPriority && topPriority.stats.priorityScore > 50;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-indigo-100 selection:text-indigo-900">

      {/* ── HEADER ── */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 rounded-2xl bg-slate-100 text-indigo-600 border border-slate-200 shrink-0">
              <LayoutDashboard size={24} />
            </div>
            <div className="hidden md:block">
              <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Painel Tático</h1>
              <h2 className="text-xl font-[1000] italic uppercase tracking-tighter text-slate-800 line-clamp-1">
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
              placeholder="Buscar assunto, tópico ou banca..."
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

          <div className="hidden lg:flex gap-3">
            <QuickStat icon={Flame} value={`${globalStats.ofensiva}D`} label="Streak" color="text-orange-500" />
            <QuickStat icon={Zap} value={globalStats.xp} label="XP Total" color="text-indigo-600" />
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

        {/* ── HERO CARD ── */}
        <AnimatePresence>
          {showHero && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 ml-2">
                Alvo Prioritário Identificado
              </div>
              <Link href={`/estudar/${topPriority.modulo_slug}`}>
                <div className="relative group overflow-hidden rounded-[40px] border border-red-200 bg-white p-8 md:p-12 transition-all hover:border-red-400 hover:shadow-xl hover:shadow-red-500/10 cursor-pointer">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertTriangle size={120} className="text-red-500" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                      <span className="px-4 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-[0.2em]">
                        Intervenção Urgente
                      </span>
                      <h3 className="text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none text-slate-900">
                        {topPriority.titulo_aula || 'Aula sem título'}
                      </h3>
                      <p className="text-slate-500 font-medium max-w-xl">
                        Sua performance aqui é de{' '}
                        <strong className="text-red-600">{topPriority.stats.percentual}%</strong>.{' '}
                        Neutralize essa lacuna para blindar sua aprovação.
                      </p>
                    </div>
                    <div className="shrink-0 w-24 h-24 rounded-full border-4 border-red-100 bg-red-50 flex items-center justify-center text-2xl font-black text-red-600">
                      {topPriority.stats.percentual}%
                    </div>
                  </div>
                </div>
              </Link>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── VITRINE DE QUESTÕES ── */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-500">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : bancaFilter || assuntoFilter
                  ? `Filtrado${bancaFilter ? ` • ${bancaFilter}` : ''}${assuntoFilter ? ` • ${assuntoFilter}` : ''}`
                  : 'Vitrine de Questões'}
            </h3>
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {grupos.length} assunto{grupos.length !== 1 ? 's' : ''}
            </span>
          </div>

          {grupos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {grupos.map(grupo => (
                <SubtopicoCard key={grupo.titulo_aula} grupo={grupo} />
              ))}
            </div>
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

// ─── QuickStat ────────────────────────────────────────────────────────────────

function QuickStat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ size: number; className: string }>;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
      <Icon size={16} className={color} />
      <div>
        <p className="text-[10px] font-black leading-none text-slate-900">{value}</p>
        <p className="text-[8px] uppercase tracking-widest text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

function DonutChart({ acertos, erros, percentual }: { acertos: number; erros: number; percentual: number }) {
  const r = 54;
  const strokeWidth = 20;
  const size = 168;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const total = acertos + erros;
  const acertosLen = total > 0 ? (acertos / total) * circumference : 0;
  const errosLen = total > 0 ? (erros / total) * circumference : 0;
  const hasData = total > 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        {hasData && erros > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={strokeWidth}
            strokeDasharray={`${errosLen} ${circumference}`}
            strokeDashoffset={-acertosLen}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
        )}
        {hasData && acertos > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={strokeWidth}
            strokeDasharray={`${acertosLen} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none gap-0.5">
        <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a5f', lineHeight: 1, fontStyle: 'italic' }}>
          {percentual}%
        </span>
        {hasData ? (
          <>
            <span style={{ fontSize: '0.48rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              de acerto
            </span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#22c55e' }}>{acertos}✓</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#ef4444' }}>{erros}✗</span>
            </div>
          </>
        ) : (
          <span style={{ fontSize: '0.45rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            sem respostas
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Badge de status individual da questão ────────────────────────────────────

function StatusBadge({ status }: { status: QuestaoStatus }) {
  if (status === 'acertou') {
    return <CheckCircle2 size={16} className="text-green-500 shrink-0" />;
  }
  if (status === 'errou') {
    return <XCircle size={16} className="text-red-500 shrink-0" />;
  }
  return <Circle size={16} className="text-slate-300 shrink-0" />;
}

// ─── SubtopicoCard ────────────────────────────────────────────────────────────

function SubtopicoCard({ grupo }: { grupo: GrupoSubtopico }) {
  const [expandido, setExpandido] = useState(false);
  const { titulo_aula, acertos, erros, totalResolvidas, totalQuestoes, percentual, questoes, firstSlug } = grupo;

  const respondidas = questoes.filter(q => q.status !== 'nao_respondida').length;
  const progressoPct = totalQuestoes > 0 ? Math.round((respondidas / totalQuestoes) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-4 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
    >
      {/* Breadcrumb */}
      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 leading-snug">
        Questões — Assunto{' '}
        <span className="text-slate-700">({titulo_aula})</span>
      </p>

      {/* Donut centralizado — clica para ir direto à primeira questão */}
      <Link href={`/estudar/${firstSlug}`} className="flex justify-center">
        <DonutChart acertos={acertos} erros={erros} percentual={percentual} />
      </Link>

      {/* Barra de progresso */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Progresso
          </span>
          <span className="text-[9px] font-black text-slate-500">
            {respondidas}/{totalQuestoes} respondida{totalQuestoes !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressoPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-indigo-500 rounded-full"
          />
        </div>
      </div>

      {/* Botão expandir/recolher */}
      <button
        onClick={() => setExpandido(v => !v)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-slate-600 hover:text-indigo-600"
      >
        <span className="text-[9px] font-black uppercase tracking-widest">
          {expandido ? 'Ocultar questões' : `Ver ${totalQuestoes} questão${totalQuestoes !== 1 ? 'ões' : ''}`}
        </span>
        {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Lista de questões (expansível) */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-1">
              {questoes.map(q => (
                <Link
                  key={q.slug}
                  href={`/estudar/${q.slug}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all group
                    ${q.status === 'acertou'
                      ? 'border-green-100 bg-green-50 hover:border-green-300 hover:bg-green-100'
                      : q.status === 'errou'
                        ? 'border-red-100 bg-red-50 hover:border-red-300 hover:bg-red-100'
                        : 'border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50'
                    }`}
                >
                  <StatusBadge status={q.status} />
                  <span className={`flex-1 text-[10px] font-black uppercase tracking-wider
                    ${q.status === 'acertou' ? 'text-green-700' :
                      q.status === 'errou' ? 'text-red-700' : 'text-slate-600'}`}>
                    Questão {String(q.numero).padStart(2, '0')}
                  </span>
                  <ChevronRight size={12} className={`shrink-0 opacity-40 group-hover:opacity-100 transition-opacity
                    ${q.status === 'acertou' ? 'text-green-600' :
                      q.status === 'errou' ? 'text-red-600' : 'text-slate-400'}`} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé com stats */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
        {totalResolvidas > 0 ? (
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {totalResolvidas} resolv{totalResolvidas !== 1 ? 'idas' : 'ida'}
          </span>
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
            não resolvida
          </span>
        )}
        {totalResolvidas > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-green-500">
              {acertos} acerto{acertos !== 1 ? 's' : ''}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider text-red-500">
              {erros} erro{erros !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
