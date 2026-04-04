"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/constants';
import {
  ArrowRight, Database, LayoutDashboard, LogOut, Loader2,
  Zap, Code, Sparkles, Layers, Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminMaster() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modulosEstudo, setModulosEstudo] = useState<any[]>([]);
  const [excluirAlvo, setExcluirAlvo] = useState<{ id: string; titulo: string } | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

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

  async function fetchModulosEstudo() {
    const { data } = await supabase
      .from('modulos_estudo')
      .select('*')
      .order('created_at', { ascending: false });
    setModulosEstudo(data || []);
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
            <h3 className="font-black italic uppercase text-slate-400 text-xs tracking-[0.3em] mb-6 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#BEF264]" /> Conteúdo Disponível para Edição
            </h3>

            {modulosEstudo.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-sm">Nenhum módulo publicado ainda.</p>
                <p className="text-slate-300 text-xs mt-2">
                  Use o Laboratório de Injeção para criar seu primeiro módulo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {modulosEstudo.map((modulo) => (
                  <div
                    key={modulo.id}
                    className="flex items-center justify-between p-6 bg-slate-50 border-2 border-transparent hover:border-[#4F46E5] rounded-[30px] transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#4F46E5] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          {modulo.modulo_nome || 'MÓDULO GERAL'}
                        </span>
                        {modulo.banca && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                            {modulo.banca}
                          </span>
                        )}
                      </div>
                      <h4 className="font-black italic uppercase text-slate-900 text-lg leading-none mb-1">
                        {modulo.titulo_aula || 'Sem título'}
                      </h4>
                      {modulo.subtopico && (
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                          {modulo.subtopico}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setErroExcluir(null);
                          setExcluirAlvo({
                            id: modulo.id,
                            titulo: modulo.titulo_aula || modulo.modulo_slug || 'Sem título',
                          });
                        }}
                        className="flex items-center gap-2 border-2 border-rose-200 text-rose-700 bg-white px-4 py-3 rounded-2xl font-black uppercase italic text-xs hover:bg-rose-50 transition-all"
                        title="Excluir questão"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                      <Link
                        href={`/admin/laboratorio?id=${modulo.id}`}
                        className="flex items-center gap-2 bg-white border-2 border-[#4F46E5] px-6 py-3 rounded-2xl font-black uppercase italic text-xs hover:bg-[#4F46E5] hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-[#4F46E5]/20"
                      >
                        Editar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
