'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, MapPin, ListTree, Trash2, 
  ChevronRight, Save, Loader2, Globe, Eye 
} from 'lucide-react';
import Link from 'next/link';

export default function GestaoEditais() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cidades, setCidades] = useState<any[]>([]);
  
  // Estados para Nova Cidade
  const [nomeCidade, setNomeCidade] = useState('');
  const [orgao, setOrgao] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());

  // Estados para Tópicos
  const [cidadeSel, setCidadeSel] = useState<any>(null);
  const [novoTopico, setNovoTopico] = useState('');
  const [topicos, setTopicos] = useState<any[]>([]);

  useEffect(() => {
    fetchCidades();
  }, []);

  async function fetchCidades() {
    const { data } = await supabase.from('concursos_cidades').select('*').order('created_at', { ascending: false });
    setCidades(data || []);
    setLoading(false);
  }

  async function criarCidade() {
    if (!nomeCidade || !orgao) return;
    setSaving(true);
    const slug = `${nomeCidade}-${orgao}-${ano}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-');
    
    await supabase.from('concursos_cidades').insert([{
      nome_cidade: nomeCidade,
      orgao,
      ano,
      slug
    }]);
    
    setNomeCidade(''); setOrgao('');
    fetchCidades();
    setSaving(false);
  }

  async function carregarTopicos(cidade: any) {
    setCidadeSel(cidade);
    const { data } = await supabase.from('topicos_edital')
      .select('*')
      .eq('concurso_id', cidade.id)
      .order('ordem');
    setTopicos(data || []);
  }

  async function adicionarTopico() {
    if (!novoTopico || !cidadeSel) return;
    const { data } = await supabase.from('topicos_edital').insert([{
      concurso_id: cidadeSel.id,
      nome_topico: novoTopico,
      ordem: topicos.length + 1
    }]).select();
    
    if (data) setTopicos([...topicos, data[0]]);
    setNovoTopico('');
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-emerald-500 font-black italic">CARREGANDO ENGINE DE EDITAIS...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUNA 1: CADASTRO DE CONCURSO (CIDADE) */}
        <section className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
          <header>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white">
              Gestão de <span className="text-emerald-500 text-shadow-glow">Concursos</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 tracking-[0.3em]">Mapeamento de Editais Ativos</p>
          </header>

          <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 shadow-2xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-500">Cidade</label>
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500" placeholder="Ex: Cuité PB" value={nomeCidade} onChange={(e) => setNomeCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-500">Ano</label>
                <input type="number" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-emerald-500">Órgão / Instituição</label>
              <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500" placeholder="Ex: Prefeitura Municipal" value={orgao} onChange={(e) => setOrgao(e.target.value)} />
            </div>
            <button onClick={criarCidade} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-3xl font-black uppercase italic text-xs transition-all flex items-center justify-center gap-2">
              {saving ? <Loader2 className="animate-spin" /> : <Plus className="w-4 h-4" />} Ativar Novo Edital
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Editais em Aberto</h3>
            {cidades.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <button 
                  onClick={() => carregarTopicos(c)} 
                  className={`flex-1 flex items-center justify-between p-6 rounded-3xl border transition-all ${cidadeSel?.id === c.id ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}
                >
                  <div className="text-left">
                    <h4 className="font-black text-white uppercase italic text-sm">{c.nome_cidade}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{c.orgao}</p>
                  </div>
                  <ChevronRight className={cidadeSel?.id === c.id ? 'text-emerald-500' : 'text-slate-700'} />
                </button>
                <Link 
                  href={`/estudar/${c.slug}`} 
                  target="_blank"
                  className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 group"
                  title="Ver como Aluno"
                >
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* COLUNA 2: VERTICALIZAÇÃO DO EDITAL (TÓPICOS) */}
        <section className="animate-in fade-in slide-in-from-right duration-500">
          {cidadeSel ? (
            <div className="bg-slate-900 min-h-full rounded-[40px] border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-2 text-emerald-500"><ListTree className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Verticalização de Edital</span></div>
                <h2 className="text-2xl font-[1000] italic uppercase text-white tracking-tighter">{cidadeSel.nome_cidade}</h2>
              </div>

              <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500" 
                    placeholder="Ex: 1. Compreensão e Interpretação de Texto" 
                    value={novoTopico} 
                    onChange={(e) => setNovoTopico(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarTopico()}
                  />
                  <button onClick={adicionarTopico} className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-500 transition-all"><Plus /></button>
                </div>

                <div className="space-y-3">
                  {topicos.map((t, idx) => (
                    <div key={t.id} className="group flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-700 group-hover:text-emerald-500 transition-colors">#{idx + 1}</span>
                        <p className="text-xs font-bold text-slate-300">{t.nome_topico}</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {topicos.length === 0 && (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center">
                      <ListTree className="w-12 h-12 mb-4" />
                      <p className="font-black italic uppercase text-sm tracking-tighter">Nenhum tópico cadastrado</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-950/50 border-t border-slate-800">
                <Link 
                  href="/laboratorio" 
                  className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-white text-slate-950 font-[1000] uppercase italic text-xs hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                >
                  <Save className="w-4 h-4" /> Mapear Questões para este Edital
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-800 opacity-30">
              <Globe className="w-16 h-16 mb-4" />
              <p className="font-black italic uppercase tracking-tighter">Selecione um edital para verticalizar</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}