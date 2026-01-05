"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, FolderPlus, MapPin, 
  ArrowRight, Database, Layout 
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
    alert("Assunto criado!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <header className="mb-12">
          <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter">
            CONTROLE <span className="text-blue-600">MASTER</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Gestão de Conteúdo • Aprova Tec</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CIDADES */}
          <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-3 mb-8"><MapPin className="text-blue-600" /><h2 className="font-black italic uppercase">1. Cidade</h2></div>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Cuité PB" value={nomeCidade} onChange={(e) => setNomeCidade(e.target.value)} />
              <button onClick={criarCidade} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase italic hover:bg-blue-600 transition-all">Salvar Cidade</button>
            </div>
          </section>

          {/* MÓDULOS */}
          <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-3 mb-8"><FolderPlus className="text-blue-600" /><h2 className="font-black italic uppercase">2. Módulos</h2></div>
            <div className="space-y-4">
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={cidadeSelecionada} onChange={(e) => setCidadeSelecionada(e.target.value)}>
                <option value="">Escolher Cidade...</option>
                {concursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Módulo 01 - Português" value={nomeModulo} onChange={(e) => setNomeModulo(e.target.value)} />
              <button onClick={criarModulo} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase italic hover:bg-blue-600 transition-all">Criar Módulo</button>
            </div>
          </section>
        </div>

        {/* ASSUNTOS E LISTAGEM */}
        <section className="bg-white p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-3 mb-8"><PlusCircle className="text-blue-600 w-8 h-8" /><h2 className="text-2xl font-black italic uppercase">3. Assuntos e Edição</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <select className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={cidadeSelecionada} onChange={(e) => setCidadeSelecionada(e.target.value)}>
               <option value="">Cidade...</option>
               {concursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={moduloSelecionado} onChange={(e) => setModuloSelecionado(e.target.value)}>
               <option value="">Módulo...</option>
               {modulos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <input className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Nome do Assunto" value={nomeAssunto} onChange={(e) => setNomeAssunto(e.target.value)} />
          </div>
          <button onClick={criarAssunto} className="w-full bg-blue-600 text-white p-5 rounded-[24px] font-[1000] italic uppercase hover:scale-[1.01] transition-all mb-12">Criar e Vincular Assunto</button>

          <div className="space-y-3">
            <h3 className="font-black italic uppercase text-slate-400 text-xs tracking-widest mb-4 flex items-center gap-2"><Database className="w-3 h-3" /> Assuntos Cadastrados</h3>
            {assuntos.map(assunto => (
              <div key={assunto.id} className="flex items-center justify-between p-5 bg-slate-50 border-2 border-transparent hover:border-slate-900 rounded-[24px] transition-all">
                <span className="font-black italic uppercase text-sm">{assunto.nome}</span>
                <Link href={`/admin/laboratorio?id=${assunto.id}`} className="bg-white border-2 border-slate-900 p-3 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}