'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Save, ChevronLeft, Loader2, ClipboardPaste, 
  X, Info, Zap, ChevronRight, CheckCircle2, 
  UserCheck, ShieldCheck, AlertTriangle, Gavel, Microscope, Users, Scale, Flag 
} from 'lucide-react';
import Link from 'next/link';

// Mapeamento de Ícones para os Cards
const iconMap: any = {
  UserCheck: <UserCheck />, ShieldCheck: <ShieldCheck />, AlertTriangle: <AlertTriangle />,
  Gavel: <Gavel />, Microscope: <Microscope />, Users: <Users />, Scale: <Scale />, Flag: <Flag />
};

function EditorLaboratorio() {
  const searchParams = useSearchParams();
  const assuntoId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [data, setData] = useState<any>(null);
  
  // Estado do Modal de Slides
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!assuntoId) { setLoading(false); return; }
      const { data: res } = await supabase.from('assuntos').select('conteudo_json').eq('id', assuntoId).single();
      if (res?.conteudo_json) {
        setJsonInput(JSON.stringify(res.conteudo_json, null, 2));
        setData(res.conteudo_json);
      }
      setLoading(false);
    }
    loadData();
  }, [assuntoId]);

  const handlePasteJSON = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      const parsed = JSON.parse(text);
      setData(parsed);
    } catch (err) { alert("Falha ao ler área de transferência ou JSON inválido"); }
  };

  const onSave = async () => {
    if (!assuntoId) return;
    setSaving(true);
    const { error } = await supabase.from('assuntos').update({ conteudo_json: JSON.parse(jsonInput) }).eq('id', assuntoId);
    setSaving(false);
    if (!error) alert('🚀 Publicado com sucesso!');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white font-black italic animate-pulse text-blue-600">CARREGANDO LABORATÓRIO...</div>;

  return (
    <div className="h-screen flex flex-col bg-white text-slate-900 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="p-4 bg-white border-b-2 border-slate-100 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft className="text-slate-400" /></Link>
          <h1 className="font-black uppercase italic tracking-tighter text-xl">LAB<span className="text-blue-600">FLOW</span></h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handlePasteJSON} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all uppercase italic">
            <ClipboardPaste className="w-4 h-4" /> Colar JSON
          </button>
          <button onClick={onSave} disabled={saving} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-black text-xs uppercase italic flex items-center gap-2 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Publicar
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LADO ESQUERDO: EDITOR */}
        <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col font-mono text-xs">
          <div className="p-3 bg-slate-200/50 text-[10px] font-black uppercase text-slate-500 tracking-widest">Estrutura de Dados</div>
          <textarea 
            className="flex-1 p-6 bg-transparent outline-none resize-none text-blue-600 leading-relaxed"
            value={jsonInput}
            onChange={(e) => { setJsonInput(e.target.value); try { setData(JSON.parse(e.target.value)) } catch(e){} }}
            spellCheck={false}
          />
        </div>

        {/* LADO DIREITO: PREVIEW DOS CARDS (BRANCO COM CARDS COLORIDOS) */}
        <div className="flex-1 bg-white p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black italic uppercase mb-12 text-slate-900 border-l-8 border-blue-600 pl-6">
              {data?.flow_title || "Novo Fluxograma"}
            </h2>

            <div className="grid grid-cols-2 gap-8">
              {data?.nodes?.map((node: any) => (
                <button 
                  key={node.id}
                  onClick={() => { setSelectedNode(node); setCurrentSlide(0); }}
                  className="group relative h-48 rounded-[32px] p-8 flex flex-col justify-between items-start transition-all hover:-translate-y-2"
                  style={{ 
                    background: `linear-gradient(135deg, ${node.data.colorStart}, ${node.data.colorEnd})`,
                    boxShadow: `0 20px 40px -15px ${node.data.colorStart}80` // Efeito Neon/Glow
                  }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/30">
                    {iconMap[node.data.icon] || <Zap />}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">{node.data.label}</p>
                    <h3 className="text-xl font-black text-white uppercase italic leading-tight">{node.data.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE SLIDES (CAROUSEL) */}
      {selectedNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
            {/* Header do Slide */}
            <div className="p-6 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                <span className="font-black uppercase italic text-slate-400 text-xs">Slide {currentSlide + 1} de {selectedNode.data.menu_content.length}</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-300 hover:text-slate-900"><X /></button>
            </div>

            {/* Conteúdo do Slide */}
            <div className="flex-1 p-10 flex flex-col justify-center">
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4">
                  {selectedNode.data.menu_content[currentSlide]?.title}
                </h3>
                <p className="text-slate-600 font-bold leading-relaxed text-lg mb-6">
                  {selectedNode.data.menu_content[currentSlide]?.content}
                </p>
                {selectedNode.data.menu_content[currentSlide]?.tip && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex gap-3 italic text-xs font-black text-amber-700">
                    <Info className="w-5 h-5 shrink-0" /> {selectedNode.data.menu_content[currentSlide]?.tip}
                  </div>
                )}
              </div>
            </div>

            {/* Footer de Navegação */}
            <div className="p-8 bg-slate-50 flex justify-between items-center">
              <button 
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => prev - 1)}
                className="px-6 py-2 font-black uppercase italic text-xs text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
              >
                Anterior
              </button>
              
              <div className="flex gap-2">
                {selectedNode.data.menu_content.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`} />
                ))}
              </div>

              {currentSlide < selectedNode.data.menu_content.length - 1 ? (
                <button 
                  onClick={() => setCurrentSlide(prev => prev + 1)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:bg-slate-900 transition-all"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:bg-slate-900 transition-all"
                >
                  Concluir <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LaboratorioPage() {
  return <Suspense fallback={null}><EditorLaboratorio /></Suspense>;
}