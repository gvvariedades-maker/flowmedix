'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Save, ChevronLeft, Loader2, ClipboardPaste, 
  X, Zap, ChevronRight, CheckCircle2, 
  Target, BookOpen, MapPin, ListOrdered
} from 'lucide-react';
import Link from 'next/link';

export default function LaboratorioEdital() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados de Dados
  const [cidades, setCidades] = useState<any[]>([]);
  const [topicos, setTopicos] = useState<any[]>([]);
  const [cidadeSel, setCidadeSel] = useState('');
  const [topicoSel, setTopicoSel] = useState('');
  
  // Estado da Questão e JSON
  const [enunciado, setEnunciado] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.from('concursos_cidades').select('*').order('nome_cidade');
      setCidades(data || []);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (cidadeSel) {
      supabase.from('topicos_edital')
        .select('*')
        .eq('concurso_id', cidadeSel)
        .order('ordem')
        .then(({ data }) => setTopicos(data || []));
    }
  }, [cidadeSel]);

  const handlePasteJSON = async () => {
    const text = await navigator.clipboard.readText();
    setJsonInput(text);
    try { setPreviewData(JSON.parse(text)); } catch (e) {}
  };

  const salvarQuestao = async () => {
    if (!topicoSel || !jsonInput) return alert("Selecione o tópico e cole o JSON!");
    setSaving(true);
    
    const parsedJSON = JSON.parse(jsonInput);
    
    const { error } = await supabase.from('questoes').insert([{
      topico_edital_id: topicoSel,
      enunciado: enunciado,
      alternativas: parsedJSON.alternativas, // O JSON deve conter as alternativas agora
      resposta_correta: parsedJSON.resposta_correta,
      estudo_reverso_json: parsedJSON,
      banca_id: parsedJSON.banca_id // Opcional se vier no JSON
    }]);

    setSaving(false);
    if (!error) alert("🚀 Questão de Estudo Reverso mapeada ao edital!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-emerald-500 font-black italic animate-pulse">CARREGANDO SISTEMA...</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-300 font-sans">
      {/* HEADER ESTRATÉGICO */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-800 rounded-xl transition-all"><ChevronLeft /></Link>
          <div className="flex flex-col">
            <h1 className="font-black italic uppercase tracking-tighter text-white">Edital<span className="text-emerald-500 text-xs ml-2">Optimizer v3</span></h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Estudo Reverso de Língua Portuguesa</span>
          </div>
        </div>

        <button onClick={salvarQuestao} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Target className="w-4 h-4" />}
          Publicar no Edital
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* COLUNA 1: CONFIGURAÇÃO DO EDITAL */}
        <div className="w-1/4 border-r border-slate-800 p-6 space-y-6 overflow-y-auto bg-slate-950/50">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2"><MapPin className="w-3 h-3" /> Selecionar Concurso</label>
            <select className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500" value={cidadeSel} onChange={(e) => setCidadeSel(e.target.value)}>
              <option value="">Escolher Cidade...</option>
              {cidades.map(c => <option key={c.id} value={c.id}>{c.nome_cidade}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2"><ListOrdered className="w-3 h-3" /> Tópico do Edital</label>
            <select className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500" value={topicoSel} onChange={(e) => setTopicoSel(e.target.value)}>
              <option value="">Vincular ao Item do Edital...</option>
              {topicos.map(t => <option key={t.id} value={t.id}>{t.nome_topico}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Enunciado da Questão</label>
            <textarea className="w-full h-40 p-4 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-medium text-slate-300 outline-none focus:border-emerald-500 resize-none" value={enunciado} onChange={(e) => setEnunciado(e.target.value)} placeholder="Ex: Assinale a alternativa em que a crase foi empregada corretamente..." />
          </div>
        </div>

        {/* COLUNA 2: EDITOR JSON (ESTUDO REVERSO) */}
        <div className="w-1/4 border-r border-slate-800 flex flex-col bg-slate-950">
          <div className="p-4 bg-slate-900/50 flex justify-between items-center border-b border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Estudo Reverso JSON</span>
            <button onClick={handlePasteJSON} className="p-2 hover:bg-slate-800 rounded-lg text-emerald-500 transition-all"><ClipboardPaste className="w-4 h-4" /></button>
          </div>
          <textarea className="flex-1 p-6 bg-transparent font-mono text-[11px] text-emerald-400 outline-none resize-none" value={jsonInput} onChange={(e) => { setJsonInput(e.target.value); try { setPreviewData(JSON.parse(e.target.value)) } catch(e){} }} placeholder='{ "flow_title": "...", "nodes": [...] }' spellCheck={false} />
        </div>

        {/* COLUNA 3: PREVIEW INTERATIVO (NEON STYLE) */}
        <div className="flex-1 bg-white p-12 overflow-y-auto relative">
          <div className="max-w-xl mx-auto">
            {previewData ? (
              <div className="space-y-8">
                <div className="text-center">
                   <h2 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter leading-tight underline decoration-emerald-500 decoration-4">{previewData.flow_title}</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {previewData.nodes?.map((node: any) => (
                    <button key={node.id} onClick={() => { setSelectedNode(node); setCurrentSlide(0); }} className="p-6 rounded-[24px] border-2 border-slate-950 flex items-center gap-4 transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${node.data.colorStart}, ${node.data.colorEnd})`, boxShadow: `0 10px 20px -5px ${node.data.colorStart}60` }}>
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white"><Zap className="w-5 h-5" /></div>
                      <div className="text-left"><p className="text-[8px] font-black text-white/50 uppercase">{node.data.label}</p><h4 className="text-sm font-black text-white uppercase italic">{node.data.title}</h4></div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-200">
                <Target className="w-16 h-16 opacity-10 mb-4" />
                <p className="font-black italic uppercase tracking-tighter opacity-20">Aguardando Mapeamento</p>
              </div>
            )}
          </div>

          {/* MODAL DE SLIDES (MESMA LÓGICA DO ALUNO) */}
          {selectedNode && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border-4 border-slate-950 flex flex-col min-h-[450px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest italic">Estudo Reverso: Slide {currentSlide + 1}</span>
                  <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-300 hover:text-slate-950 transition-all"><X /></button>
                </div>
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <h3 className="text-xl font-black text-slate-950 uppercase italic mb-4">{selectedNode.data.menu_content[currentSlide]?.title}</h3>
                  <p className="text-slate-600 font-bold leading-relaxed">{selectedNode.data.menu_content[currentSlide]?.content}</p>
                </div>
                <div className="p-6 bg-slate-50 flex justify-between items-center">
                  <button disabled={currentSlide === 0} onClick={() => setCurrentSlide(s => s - 1)} className="text-[10px] font-black uppercase italic text-slate-400 hover:text-slate-950 disabled:opacity-0">Anterior</button>
                  <div className="flex gap-2">{selectedNode.data.menu_content.map((_: any, i: number) => (<div key={i} className={`h-1 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-300'}`} />))}</div>
                  {currentSlide < selectedNode.data.menu_content.length - 1 ? (
                    <button onClick={() => setCurrentSlide(s => s + 1)} className="bg-slate-950 text-white px-6 py-2 rounded-xl font-black uppercase italic text-[10px] flex items-center gap-2">Próximo <ChevronRight className="w-3 h-3" /></button>
                  ) : (
                    <button onClick={() => setSelectedNode(null)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black uppercase italic text-[10px] flex items-center gap-2">Concluir <CheckCircle2 className="w-3 h-3" /></button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}