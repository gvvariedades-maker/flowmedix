"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, FolderPlus, MapPin, 
  ArrowRight, Database, Layout, Trash2 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminMaster() {
  const [concursos, setConcursos] = useState<any[]>([]);
  const [modulos, setModulos] = useState<any[]>([]);
  const [assuntos, setAssuntos] = useState<any[]>([]);

  const [nomeCidade, setNomeCidade] = useState('');
  const [nomeModulo, setNomeModulo] = useState('');
  const [nomeAssunto, setNomeAssunto] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [moduloSelecionado, setModuloSelecionado] = useState('');

  useEffect(() => {
    fetchCidades();
    fetchAssuntos();
  }, []);

  useEffect(() => {
    if (cidadeSelecionada) fetchModulos();
  }, [cidadeSelecionada]);

  async function fetchCidades() {
    const { data } = await supabase.from('concursos').select('*').order('nome');
    setConcursos(data || []);
  }

  async function fetchModulos() {
    const { data } = await supabase.from('modulos').select('*').eq('concurso_id', cidadeSelecionada).order('ordem');
    setModulos(data || []);
  }

  async function fetchAssuntos() {
    const { data } = await supabase.from('assuntos').select('*').order('created_at', { ascending: false });
    setAssuntos(data || []);
  }

  const criarCidade = async () => {
    if (!nomeCidade) return;
    const slug = nomeCidade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-');
    await supabase.from('concursos').insert([{ nome: nomeCidade, slug }]);
    setNomeCidade('');
    fetchCidades();
  };

  const criarModulo = async () => {
    if (!nomeModulo || !cidadeSelecionada) return alert("Selecione a cidade!");
    const cidade = concursos.find(c => c.id === cidadeSelecionada);
    await supabase.from('modulos').insert([{ 
      nome: nomeModulo, 
      concurso_id: cidadeSelecionada,
      concurso_slug: cidade?.slug 
    }]);
    setNomeModulo('');
    fetchModulos();
  };

  const criarAssunto = async () => {
    if (!nomeAssunto || !moduloSelecionado) return alert("Selecione o módulo!");
    await supabase.from('assuntos').insert([{ 
      nome: nomeAssunto, 
      modulo_id: moduloSelecionado,
      conteudo_json: { nodes: [], edges: [] }
    }]);
    setNomeAssunto('');
    fetchAssuntos();
    alert("Assunto criado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter">
              CONTROLE <span className="text-blue-600">MASTER</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Aprova Tec • Gestão de Conteúdo</p>
          </div>
          <Link href="/dashboard" className="text-[10px] font-black uppercase italic bg-slate-200 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
            Ver Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BLOCO 1: CIDADES */}
          <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="text-blue-600 w-5 h-5" />
              <h2 className="font-black italic uppercase text-lg text-slate-900">1. Cadastrar Cidade</h2>
            </div>
            <div className="space-y-4">
              <input 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-slate-900 outline-none transition-all" 
                placeholder="Ex: Prefeitura de Cuité PB" 
                value={nomeCidade} 
                onChange={(e) => setNomeCidade(e.target.value)} 
              />
              <button onClick={criarCidade} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase italic hover:bg-blue-600 transition-all active:scale-95">
                Salvar Nova Cidade
              </button>
            </div>
          </section>

          {/* BLOCO 2: MÓDULOS */}
          <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-3 mb-8">
              <FolderPlus className="text-blue-600 w-5 h-5" />
              <h2 className="font-black italic uppercase text-lg text-slate-900">2. Criar Módulos</h2>
            </div>
            <div className="space-y-4">
              <select 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none cursor-pointer" 
                value={cidadeSelecionada} 
                onChange={(e) => setCidadeSelecionada(e.target.value)}
              >
                <option value="">Selecione a Cidade...</option>
                {concursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-slate-900 outline-none transition-all" 
                placeholder="Ex: Módulo 01 - Português" 
                value={nomeModulo} 
                onChange={(e) => setNomeModulo(e.target.value)} 
              />
              <button onClick={criarModulo} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase italic hover:bg-blue-600 transition-all active:scale-95">
                Criar Módulo na Cidade
              </button>
            </div>
          </section>
        </div>

        {/* BLOCO 3: ASSUNTOS E GERENCIAMENTO */}
        <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle className="text-blue-600 w-8 h-8" />
            <h2 className="text-2xl font-black italic uppercase text-slate-900">3. Vincular Assuntos e Editar</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <select className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none" value={cidadeSelecionada} onChange={(e) => setCidadeSelecionada(e.target.value)}>
               <option value="">Filtrar Cidade...</option>
               {concursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none" value={moduloSelecionado} onChange={(e) => setModuloSelecionado(e.target.value)}>
               <option value="">Escolher Módulo...</option>
               {modulos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <input className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-slate-900 outline-none" placeholder="Nome do Assunto" value={nomeAssunto} onChange={(e) => setNomeAssunto(e.target.value)} />
          </div>
          
          <button onClick={criarAssunto} className="w-full bg-blue-600 text-white p-5 rounded-[24px] font-[1000] italic uppercase hover:scale-[1.01] transition-all mb-12 shadow-lg shadow-blue-200">
            Confirmar e Vincular Conteúdo
          </button>

          <div className="space-y-4">
            <h3 className="font-black italic uppercase text-slate-400 text-xs tracking-[0.3em] mb-6 flex items-center gap-2">
              <Database className="w-3 h-3 text-blue-600" /> Conteúdo Disponível para Edição
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {assuntos.map(assunto => (
                <div key={assunto.id} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-transparent hover:border-slate-900 rounded-[30px] transition-all group">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Assunto ID: {assunto.id.slice(0,8)}</p>
                    <h4 className="font-black italic uppercase text-slate-900 text-lg leading-none">{assunto.nome}</h4>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* LINK CORRIGIDO PARA O LABORATÓRIO FORA DA PASTA ADMIN */}
                    <Link 
                      href={`/laboratorio?id=${assunto.id}`} 
                      className="flex items-center gap-2 bg-white border-2 border-slate-900 px-6 py-3 rounded-2xl font-black uppercase italic text-xs hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      Editar Fluxograma <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}