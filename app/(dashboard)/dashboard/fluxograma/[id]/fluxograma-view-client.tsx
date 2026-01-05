'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Zap, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function FluxogramaViewClient({ assunto }: { assunto: any }) {
  const data = assunto.conteudo_json;
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pb-20">
      {/* HEADER DO ALUNO */}
      <header className="p-6 bg-[#0F172A] border-b border-cyan-500/20 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-xl border border-slate-700 transition-all text-white">
            <ChevronLeft />
          </Link>
          <div>
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest leading-none mb-1">
              {assunto.modulos?.nome}
            </p>
            <h1 className="text-xl font-black italic uppercase text-white tracking-tighter">
              {assunto.nome}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <h2 className="text-2xl font-black text-white uppercase italic mb-10 text-center tracking-widest">
          {data?.flow_title || "Mapa de Estudo"}
        </h2>

        {/* GRID DE CARDS NEON */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.nodes?.map((node: any) => (
            <button
              key={node.id}
              onClick={() => { setSelectedNode(node); setCurrentSlide(0); }}
              className="aspect-square relative flex flex-col items-center justify-center p-6 rounded-[32px] border border-white/10 transition-all hover:scale-105 group overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${node.data.colorStart}15, ${node.data.colorEnd}30)` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_40px_rgba(6,182,212,0.2)]" 
                   style={{ boxShadow: `inset 0 0 30px ${node.data.colorStart}44` }} />
              
              <div className="p-4 bg-white/5 rounded-2xl mb-4 group-hover:rotate-12 transition-transform">
                <Zap className="w-8 h-8 text-white" style={{ filter: `drop-shadow(0 0 8px ${node.data.colorStart})` }} />
              </div>
              
              <span className="text-[9px] font-black uppercase text-cyan-400 mb-1">{node.data.label}</span>
              <h3 className="text-xs font-black text-white uppercase italic text-center leading-tight">
                {node.data.title}
              </h3>
            </button>
          ))}
        </div>
      </main>

      {/* MODAL COM NAVEGAÇÃO POR SLIDES */}
      {selectedNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0F172A] w-full max-w-xl rounded-[40px] border border-white/20 shadow-2xl flex flex-col overflow-hidden">
            
            <div className="p-6 flex justify-between items-center border-b border-white/10"
                 style={{ borderBottomColor: selectedNode.data.colorStart }}>
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-400">{selectedNode.data.label}</span>
                <h3 className="text-xl font-black text-white uppercase italic">{selectedNode.data.title}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-2 text-white hover:bg-white/10 rounded-full"><X /></button>
            </div>

            <div className="flex-1 p-10 min-h-[350px] flex flex-col justify-center animate-in slide-in-from-right-8 duration-300" key={currentSlide}>
                <h4 className="text-cyan-400 font-black uppercase text-[10px] mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  SLIDE {currentSlide + 1} / {selectedNode.data.menu_content?.length}
                </h4>
                <h2 className="text-2xl font-black text-white uppercase italic mb-4 leading-tight">
                  {selectedNode.data.menu_content[currentSlide]?.title}
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed italic text-lg">
                  "{selectedNode.data.menu_content[currentSlide]?.content}"
                </p>
                
                {selectedNode.data.menu_content[currentSlide]?.tip && (
                  <div className="mt-8 p-4 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-2xl">
                    <p className="text-xs font-bold text-cyan-200 italic">
                       💡 DICA DE OURO: {selectedNode.data.menu_content[currentSlide].tip}
                    </p>
                  </div>
                )}
            </div>

            <div className="p-8 bg-slate-900/50 flex items-center justify-between border-t border-white/10">
              <button 
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => prev - 1)}
                className="px-6 py-2 rounded-xl font-black uppercase italic text-[10px] text-white disabled:opacity-20 transition-all"
              >
                Anterior
              </button>

              <div className="flex gap-2">
                {selectedNode.data.menu_content.map((_: any, i: number) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-cyan-400 w-6' : 'bg-slate-700'}`} />
                ))}
              </div>

              {currentSlide === selectedNode.data.menu_content.length - 1 ? (
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <CheckCircle2 className="w-4 h-4" /> Concluir Passo
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentSlide(prev => prev + 1)}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 transition-all"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}