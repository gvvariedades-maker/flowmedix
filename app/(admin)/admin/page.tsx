"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/constants';
import { logger } from '@/lib/logger';
import {
  ArrowRight, Database, LayoutDashboard, LogOut, Loader2,
  Zap, Code, Sparkles, Layers, Trash2, Search, Copy, Check, Users,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { compareModuloCurriculum } from '@/lib/vitrineOrder';

const ASSUNTOS_POR_PAGINA_ADMIN = 12;

function enunciadoResumo(conteudo: unknown): string {
  if (!conteudo || typeof conteudo !== 'object') return '';
  const inst = (conteudo as { question_data?: { instruction?: unknown } }).question_data?.instruction;
  if (typeof inst !== 'string') return '';
  return inst.replace(/\s+/g, ' ').trim().slice(0, 160);
}

function moduloMatchesBusca(modulo: Record<string, unknown>, qRaw: string): boolean {
  const q = qRaw.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return true;
  const codigo = modulo.avant_codigo as number | null | undefined;
  const codigoStr = codigo != null ? String(codigo) : '';
  const semPrefixoQ = q.replace(/^q-?/, '');
  const hay = [
    codigo != null ? `q-${codigo}` : '',
    codigoStr,
    modulo.modulo_slug,
    modulo.titulo_aula,
    modulo.modulo_nome,
    modulo.banca,
    modulo.id,
    enunciadoResumo(modulo.conteudo_json),
  ]
    .filter((x) => x != null && String(x).length > 0)
    .join(' ')
    .toLowerCase();
  if (hay.includes(q)) return true;
  if (hay.replace(/\s+/g, ' ').includes(q)) return true;
  if (codigoStr && (q === codigoStr || semPrefixoQ === codigoStr)) return true;
  return false;
}

/** Mesma regra da vitrine do aluno (`VitrineClient`): agrupa por `titulo_aula` (assunto). */
type ModuloEstudoRow = Record<string, unknown> & {
  id: string;
  modulo_slug: string;
  titulo_aula?: string | null;
  modulo_nome?: string | null;
  banca?: string | null;
  avant_codigo?: number | null;
  created_at?: string | null;
  subtopico?: string | null;
  conteudo_json?: unknown;
};

type GrupoAssuntoAdmin = {
  titulo_aula: string;
  modulo_nome: string;
  banca: string;
  modulos: ModuloEstudoRow[];
  totalQuestoes: number;
  firstSlug: string;
};

function buildGruposPorAssunto(modulos: ModuloEstudoRow[]): GrupoAssuntoAdmin[] {
  const map = new Map<string, GrupoAssuntoAdmin>();

  modulos.forEach((m) => {
    const topico = m.modulo_nome || 'Geral';
    const subtopico = m.titulo_aula || 'Sem subtópico';
    const banca = m.banca || '';
    const key = subtopico;

    if (!map.has(key)) {
      map.set(key, {
        titulo_aula: subtopico,
        modulo_nome: topico,
        banca,
        modulos: [],
        totalQuestoes: 0,
        firstSlug: m.modulo_slug,
      });
    }

    const grupo = map.get(key)!;
    grupo.modulos.push(m);
    grupo.totalQuestoes += 1;
  });

  map.forEach((grupo) => {
    grupo.modulos.sort((a, b) =>
      compareModuloCurriculum(
        { created_at: a.created_at as string | null | undefined, avant_codigo: a.avant_codigo as number | null | undefined, modulo_slug: a.modulo_slug },
        { created_at: b.created_at as string | null | undefined, avant_codigo: b.avant_codigo as number | null | undefined, modulo_slug: b.modulo_slug },
      ),
    );
    grupo.firstSlug = grupo.modulos[0]?.modulo_slug ?? grupo.firstSlug;
  });

  return Array.from(map.values()).sort((a, b) => {
    const pendentesA = a.totalQuestoes;
    const pendentesB = b.totalQuestoes;
    if (pendentesB !== pendentesA) return pendentesB - pendentesA;
    return a.titulo_aula.localeCompare(b.titulo_aula);
  });
}

function AdminGrupoAssuntoCard({
  grupo,
  copiedModuloId,
  onCopiar,
  onAbrirExcluir,
}: {
  grupo: GrupoAssuntoAdmin;
  copiedModuloId: string | null;
  onCopiar: (moduloId: string, codigo: number) => void;
  onAbrirExcluir: (modulo: ModuloEstudoRow) => void;
}) {
  const [assuntoAberto, setAssuntoAberto] = useState(false);
  const [listaAberta, setListaAberta] = useState(false);
  const panelId = `admin-assunto-${grupo.firstSlug}`;

  return (
    <div className="rounded-[30px] border-2 border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <button
        type="button"
        aria-expanded={assuntoAberto}
        aria-controls={panelId}
        onClick={() => {
          setAssuntoAberto((prev) => {
            const next = !prev;
            if (!next) setListaAberta(false);
            return next;
          });
        }}
        className="flex w-full items-start justify-between gap-3 rounded-2xl text-left transition-colors hover:bg-slate-50/80"
      >
        <div className="min-w-0 flex-1">
          <h4 className="font-black italic uppercase text-slate-900 text-base leading-tight sm:text-lg">
            {grupo.titulo_aula}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="bg-[#4F46E5] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              {grupo.modulo_nome}
            </span>
            {grupo.banca ? (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                {grupo.banca}
              </span>
            ) : null}
            <span className="text-[10px] font-bold text-slate-400">
              {grupo.totalQuestoes} questão{grupo.totalQuestoes !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>
        {assuntoAberto ? (
          <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-500" />
        )}
      </button>

      {assuntoAberto && (
        <div id={panelId} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setListaAberta((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 transition-colors hover:bg-slate-100"
          >
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              {listaAberta
                ? 'Ocultar questões'
                : `Ver ${grupo.totalQuestoes} questão${grupo.totalQuestoes !== 1 ? 'ões' : ''}`}
            </span>
            {listaAberta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {listaAberta && (
            <div className="max-h-[min(50vh,22rem)] space-y-2 overflow-y-auto overscroll-contain pr-1">
              {grupo.modulos.map((modulo, idx) => {
                const codigoLabel = formatAvantCodigo(modulo.avant_codigo);
                const n = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={modulo.id}
                    className="flex flex-col gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Questão {n}</span>
                        {codigoLabel ? (
                          <span className="inline-flex items-center gap-1.5 bg-slate-900 text-[#BEF264] text-[10px] font-mono font-black px-3 py-1 rounded-full tracking-wide">
                            {codigoLabel}
                            <button
                              type="button"
                              title="Copiar código"
                              onClick={() => void onCopiar(modulo.id, modulo.avant_codigo as number)}
                              className="p-0.5 rounded hover:bg-white/20 transition-colors"
                            >
                              {copiedModuloId === modulo.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Sem Q-code</span>
                        )}
                        {modulo.banca && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200/60 px-2 py-0.5 rounded">
                            {String(modulo.banca)}
                          </span>
                        )}
                      </div>
                      {modulo.subtopico && String(modulo.subtopico) !== String(grupo.titulo_aula) && (
                        <p className="text-xs font-bold text-slate-600 mt-0.5">{String(modulo.subtopico)}</p>
                      )}
                      {modulo.modulo_slug && (
                        <p className="text-[10px] font-mono text-slate-500 truncate mt-1" title={String(modulo.modulo_slug)}>
                          {String(modulo.modulo_slug)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => onAbrirExcluir(modulo)}
                        className="flex items-center gap-2 border-2 border-rose-200 text-rose-700 bg-white px-3 py-2.5 rounded-2xl font-black uppercase italic text-[10px] hover:bg-rose-50 transition-all"
                        title="Excluir questão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                      <Link
                        href={`/admin/laboratorio?id=${modulo.id}`}
                        className="flex items-center gap-2 bg-white border-2 border-[#4F46E5] px-4 py-2.5 rounded-2xl font-black uppercase italic text-[10px] hover:bg-[#4F46E5] hover:text-white transition-all"
                      >
                        Editar <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminMaster() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listaModulosCarregando, setListaModulosCarregando] = useState(true);
  const [modulosEstudo, setModulosEstudo] = useState<any[]>([]);
  const [excluirAlvo, setExcluirAlvo] = useState<{
    id: string;
    titulo: string;
    avantCodigo: number | null;
  } | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [buscaModulos, setBuscaModulos] = useState('');
  const [copiedModuloId, setCopiedModuloId] = useState<string | null>(null);
  const [paginaAssuntos, setPaginaAssuntos] = useState(1);

  const modulosFiltrados = useMemo(
    () => modulosEstudo.filter((m) => moduloMatchesBusca(m, buscaModulos)),
    [modulosEstudo, buscaModulos]
  );

  const gruposPorAssunto = useMemo(
    () => buildGruposPorAssunto(modulosFiltrados as ModuloEstudoRow[]),
    [modulosFiltrados]
  );

  const totalAssuntos = gruposPorAssunto.length;
  const totalPaginasAssuntos = Math.max(1, Math.ceil(totalAssuntos / ASSUNTOS_POR_PAGINA_ADMIN));
  const paginaAssuntosEfetiva = Math.min(Math.max(1, paginaAssuntos), totalPaginasAssuntos);

  const gruposAssuntosPagina = useMemo(() => {
    const start = (paginaAssuntosEfetiva - 1) * ASSUNTOS_POR_PAGINA_ADMIN;
    return gruposPorAssunto.slice(start, start + ASSUNTOS_POR_PAGINA_ADMIN);
  }, [gruposPorAssunto, paginaAssuntosEfetiva]);

  useEffect(() => {
    setPaginaAssuntos(1);
  }, [buscaModulos]);

  useEffect(() => {
    if (paginaAssuntos > totalPaginasAssuntos) setPaginaAssuntos(totalPaginasAssuntos);
  }, [paginaAssuntos, totalPaginasAssuntos]);

  async function copiarCodigoAvant(moduloId: string, codigo: number) {
    try {
      await navigator.clipboard.writeText(`Q-${codigo}`);
      setCopiedModuloId(moduloId);
      setTimeout(() => setCopiedModuloId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const userEmail = user.email?.toLowerCase();
      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        router.push('/estudar');
        return;
      }

      setLoading(false);
      fetchModulosEstudo();
    }

    checkAdmin();
  }, [router]);

  /**
   * O PostgREST (Supabase) retorna no máx. 1000 linhas por request se não
   * usarmos .range() em páginas. Busca em lotes até trazer tudo.
   */
  async function fetchModulosEstudo() {
    setListaModulosCarregando(true);
    const PAGE = 1000;
    const all: any[] = [];
    try {
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
          .from('modulos_estudo')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + PAGE - 1);
        if (error) {
          logger.error('Admin: listar modulos_estudo', error, { from });
          setModulosEstudo([]);
          return;
        }
        if (!data?.length) break;
        all.push(...data);
        if (data.length < PAGE) break;
      }
      setModulosEstudo(all);
    } catch (e) {
      logger.error('Admin: fetchModulosEstudo inesperado', e);
      setModulosEstudo([]);
    } finally {
      setListaModulosCarregando(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluirAlvo) return;
    setErroExcluir(null);
    setExcluindoId(excluirAlvo.id);
    try {
      const res = await fetch(`/api/admin/modulos-estudo/${excluirAlvo.id}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroExcluir(typeof body.error === 'string' ? body.error : 'Falha ao excluir.');
        return;
      }
      setExcluirAlvo(null);
      await fetchModulosEstudo();
    } finally {
      setExcluindoId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pb-24 font-sans text-slate-900 relative">
      {excluirAlvo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-excluir-titulo"
        >
          <div className="w-full max-w-md bg-white rounded-[28px] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-6 space-y-4">
            <h2 id="admin-excluir-titulo" className="text-lg font-black italic uppercase text-slate-900">
              Excluir questão publicada?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {excluirAlvo.avantCodigo != null && (
                <span className="block text-xs font-mono font-bold text-[#4F46E5] mb-2">
                  {formatAvantCodigo(excluirAlvo.avantCodigo)}
                </span>
              )}
              <span className="font-bold text-slate-900">{excluirAlvo.titulo}</span> será removida do AVANT.
              Histórico de tentativas e entradas em cadernos ligadas a esta questão também serão apagados. Não dá para
              desfazer.
            </p>
            {erroExcluir && (
              <p className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {erroExcluir}
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
              <button
                type="button"
                disabled={!!excluindoId}
                onClick={() => {
                  setExcluirAlvo(null);
                  setErroExcluir(null);
                }}
                className="px-4 py-3 rounded-2xl border-2 border-slate-200 font-black uppercase italic text-xs hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!!excluindoId}
                onClick={() => void confirmarExclusao()}
                className="px-4 py-3 rounded-2xl bg-rose-600 text-white font-black uppercase italic text-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {excluindoId ? 'Excluindo…' : 'Excluir definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-10">

        <div className="flex justify-end mb-4 gap-3">
          <Link
            href="/estudar"
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-full text-xs font-black uppercase italic hover:bg-[#4338ca] transition-all"
          >
            <LayoutDashboard className="w-4 h-4" /> Voltar para a Área do Aluno
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase italic hover:bg-[#4F46E5] transition-all"
          >
            <LogOut className="w-3 h-3" />
            Sair
          </button>
        </div>

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter">
              AVANT <span className="text-[#4F46E5]">ADMIN</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              Gestão de Conteúdo • Sistema AVANT
            </p>
          </div>
        </header>

        <section className="bg-white p-6 sm:p-8 rounded-[32px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-[#4F46E5] rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black italic uppercase text-lg text-slate-900">Cadastros na plataforma</h2>
              <p className="text-slate-500 text-sm mt-1">
                Total de contas, semana em curso, últimas semanas fechadas, gráfico de 7 dias e export
                CSV (UTC).
              </p>
            </div>
          </div>
          <Link
            href="/admin/metricas"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-[#BEF264] font-black uppercase italic text-xs hover:bg-[#4338ca] hover:text-white transition-all"
          >
            Abrir métricas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* BLOCO 1: INSERÇÃO EM LOTE */}
          <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                <Layers className="text-[#BEF264] w-5 h-5" />
              </div>
              <h2 className="font-black italic uppercase text-lg text-slate-900">Inserção em Lote</h2>
            </div>
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">
              Cole um array JSON com várias questões de uma vez. O sistema valida cada item, ignora duplicatas e publica as válidas automaticamente.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Formato no editor
              </p>
              <pre className="text-xs text-[#4F46E5] font-mono overflow-x-auto whitespace-nowrap">
                {'[ { "meta": {...} }, { "meta": {...} } ]'}
              </pre>
            </div>
            <Link
              href="/admin/laboratorio"
              className="w-full bg-slate-900 text-[#BEF264] p-4 rounded-2xl font-black uppercase italic hover:bg-[#4F46E5] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              <Layers className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Abrir para Lote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>

          {/* BLOCO 2: LABORATÓRIO DE INJEÇÃO */}
          <section className="bg-gradient-to-br from-[#4F46E5] to-[#4338ca] p-8 rounded-[40px] border-[1.5px] border-[#4F46E5] shadow-[6px_6px_0px_0px_rgba(79,70,229,0.3)] relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#BEF264]/10 rounded-full blur-3xl group-hover:bg-[#BEF264]/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#BEF264] rounded-2xl flex items-center justify-center">
                  <Zap className="text-slate-900 w-6 h-6" />
                </div>
                <h2 className="font-black italic uppercase text-xl text-white">Laboratório de Injeção</h2>
              </div>
              <p className="text-white/90 text-sm mb-8 leading-relaxed">
                Uma questão por vez, com preview visual completo e validação em tempo real. Ideal para revisar e ajustar o JSON antes de publicar.
              </p>
              <Link
                href="/admin/laboratorio"
                className="w-full bg-[#BEF264] text-slate-900 p-5 rounded-2xl font-black uppercase italic hover:bg-[#a3d651] transition-all active:scale-95 shadow-xl shadow-[#BEF264]/30 flex items-center justify-center gap-3 group"
              >
                <Code className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Abrir Laboratório AVANT
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        </div>

        {/* BLOCO 3: LISTAGEM DE MÓDULOS */}
        <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-3 mb-8">
            <Database className="text-[#4F46E5] w-8 h-8" />
            <h2 className="text-2xl font-black italic uppercase text-slate-900">Módulos de Estudo Publicados</h2>
          </div>

          <div className="space-y-4">
            <h3 className="font-black italic uppercase text-slate-400 text-xs tracking-[0.3em] mb-4 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#BEF264]" /> Conteúdo Disponível para Edição
            </h3>

            {modulosEstudo.length > 0 && (
              <div className="mb-6 space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Buscar por código (Q-…), slug, banca, título ou trecho do enunciado
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="search"
                    value={buscaModulos}
                    onChange={(e) => setBuscaModulos(e.target.value)}
                    placeholder="Ex.: Q-42, anatomia, igeduc…"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-500">
                  {listaModulosCarregando
                    ? 'Atualizando lista a partir do banco…'
                    : `${totalAssuntos} assunto${totalAssuntos === 1 ? '' : 's'} · ${
                        modulosFiltrados.length
                      } questão${modulosFiltrados.length === 1 ? '' : 'es'} no filtro (${
                        modulosEstudo.length
                      } publicada${modulosEstudo.length === 1 ? '' : 's'} no banco)`}
                </p>
              </div>
            )}

            {modulosEstudo.length === 0 && !listaModulosCarregando ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-sm">Nenhum módulo publicado ainda.</p>
                <p className="text-slate-300 text-xs mt-2">
                  Use o Laboratório de Injeção para criar seu primeiro módulo. Se a lista falhou, atualize a página.
                </p>
              </div>
            ) : modulosEstudo.length === 0 && listaModulosCarregando ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-[#4F46E5]" />
                <p className="text-slate-600 font-bold text-sm">Carregando o catálogo de questões…</p>
                <p className="text-slate-400 text-xs mt-2">Catálogos grandes usam mais de um lote (1000 em 1000).</p>
              </div>
            ) : modulosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-amber-50 rounded-2xl border-2 border-amber-200">
                <p className="text-amber-900 font-bold text-sm">Nenhuma questão corresponde à busca.</p>
                <p className="text-amber-700 text-xs mt-2">Limpe o filtro ou tente outro código, slug ou palavra do enunciado.</p>
                <button
                  type="button"
                  onClick={() => setBuscaModulos('')}
                  className="mt-4 text-xs font-black uppercase italic text-[#4F46E5] underline"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Mesma organização da área do aluno (Vitrine): um bloco por assunto; abra o assunto e depois
                  &quot;Ver questões&quot; para listar, editar ou excluir.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {gruposAssuntosPagina.map((grupo) => (
                    <AdminGrupoAssuntoCard
                      key={grupo.titulo_aula + grupo.firstSlug}
                      grupo={grupo}
                      copiedModuloId={copiedModuloId}
                      onCopiar={copiarCodigoAvant}
                      onAbrirExcluir={(modulo) => {
                        setErroExcluir(null);
                        setExcluirAlvo({
                          id: modulo.id,
                          titulo: (modulo.titulo_aula as string) || (modulo.modulo_slug as string) || 'Sem título',
                          avantCodigo:
                            modulo.avant_codigo != null && !Number.isNaN(Number(modulo.avant_codigo))
                              ? Number(modulo.avant_codigo)
                              : null,
                        });
                      }}
                    />
                  ))}
                </div>
                {totalPaginasAssuntos > 1 && (
                  <nav
                    className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
                    aria-label="Paginação por assunto"
                  >
                    <p className="text-xs font-bold text-slate-500 sm:order-1">
                      {totalAssuntos > 0
                        ? `Assuntos ${
                            (paginaAssuntosEfetiva - 1) * ASSUNTOS_POR_PAGINA_ADMIN + 1
                          }–${Math.min(
                            paginaAssuntosEfetiva * ASSUNTOS_POR_PAGINA_ADMIN,
                            totalAssuntos
                          )} de ${totalAssuntos}`
                        : null}
                    </p>
                    <p className="text-xs text-slate-400 sm:order-2 sm:text-right">
                      Página {paginaAssuntosEfetiva} de {totalPaginasAssuntos}
                    </p>
                    <div className="flex items-center gap-2 sm:order-3 sm:ml-auto">
                      <button
                        type="button"
                        disabled={paginaAssuntosEfetiva <= 1}
                        onClick={() => setPaginaAssuntos((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </button>
                      <button
                        type="button"
                        disabled={paginaAssuntosEfetiva >= totalPaginasAssuntos}
                        onClick={() => setPaginaAssuntos((p) => Math.min(totalPaginasAssuntos, p + 1))}
                        className="inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </nav>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
