"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { 
  MapPin, ArrowRight, Database, LayoutDashboard, LogOut, Loader2,
  Zap, Code, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AdminMaster() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cidades, setCidades] = useState<any[]>([]);
  const [modulosEstudo, setModulosEstudo] = useState<any[]>([]);
  const [nomeCidade, setNomeCidade] = useState('');
  const [estadoCidade, setEstadoCidade] = useState('');

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
      fetchCidades();
      fetchModulosEstudo();
    }

    checkAdmin();
  }, [router]);

  async function fetchCidades() {
    const { data } = await supabase.from('cidades').select('*').order('nome');
    setCidades(data || []);
  }

  async function fetchModulosEstudo() {
    const { data } = await supabase.from('modulos_estudo').select('*').order('created_at', { ascending: false });
    setModulosEstudo(data || []);
  }

  const criarCidade = async () => {
    if (!nomeCidade || !estadoCidade) return alert("Preencha nome e estado!");
    const slug = `${nomeCidade}-${estadoCidade}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-');
    const { error } = await supabase.from('cidades').insert([{ 
      nome: nomeCidade, 
      estado: estadoCidade,
      slug 
    }]);
    if (error) {
      alert("Erro ao criar cidade: " + error.message);
      return;
    }
    setNomeCidade('');
    setEstadoCidade('');
    fetchCidades();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pb-24 font-sans text-slate-900">
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
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Gestão de Conteúdo • Sistema AVANT</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BLOCO 1: CIDADES */}
          <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="text-[#4F46E5] w-5 h-5" />
              <h2 className="font-black italic uppercase text-lg text-slate-900">Cadastrar Cidade</h2>
            </div>
            <div className="space-y-4">
              <input 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#4F46E5] outline-none transition-all" 
                placeholder="Nome da Cidade (ex: Prefeitura de Cuité)" 
                value={nomeCidade} 
                onChange={(e) => setNomeCidade(e.target.value)} 
              />
              <input 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#4F46E5] outline-none transition-all" 
                placeholder="Estado (ex: PB)" 
                value={estadoCidade} 
                onChange={(e) => setEstadoCidade(e.target.value)} 
              />
              <button 
                onClick={criarCidade} 
                className="w-full bg-[#4F46E5] text-white p-4 rounded-2xl font-black uppercase italic hover:bg-[#4338ca] transition-all active:scale-95 shadow-lg shadow-[#4F46E5]/20"
              >
                Salvar Nova Cidade
              </button>
            </div>
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
                Acesse o motor de injeção AVANT para criar e editar módulos de estudo com JSON estruturado.
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
                <p className="text-slate-300 text-xs mt-2">Use o Laboratório de Injeção para criar seu primeiro módulo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {modulosEstudo.map(modulo => (
                  <div 
                    key={modulo.id} 
                    className="flex items-center justify-between p-6 bg-slate-50 border-2 border-transparent hover:border-[#4F46E5] rounded-[30px] transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#4F46E5] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          {modulo.modulo_nome || "MÓDULO GERAL"}
                        </span>
                        {modulo.banca && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                            {modulo.banca}
                          </span>
                        )}
                      </div>
                      <h4 className="font-black italic uppercase text-slate-900 text-lg leading-none mb-1">
                        {modulo.titulo_aula || "Sem título"}
                      </h4>
                      {modulo.subtopico && (
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                          {modulo.subtopico}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
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
