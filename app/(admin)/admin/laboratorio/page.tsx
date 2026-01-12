'use client';

import { useState, useEffect } from 'react';
import { Code, Eye, Save, ArrowLeft, Zap, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';

export default function AvantLaboratory() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Validação em Tempo Real
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Validação de Estrutura Mínima
      if (!parsed.meta || !parsed.question_data) {
        throw new Error("O JSON precisa ter as chaves 'meta' e 'question_data'.");
      }
      if (!parsed.meta.banca || !parsed.meta.topico || !parsed.meta.subtopico) {
        throw new Error("Faltam dados no 'meta': banca, topico ou subtopico.");
      }
      
      setParsedData(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setParsedData(null);
    }
  }, [jsonInput]);

  const handlePublicar = async () => {
    if (!parsedData) return;
    setSaving(true);

    try {
      // 1. Geração Automática de Slug Único
      // Ex: cpcon-sintaxe-concordancia-17099999
      const timestamp = Date.now();
      const slugBase = `${parsedData.meta.banca}-${parsedData.meta.topico}-${parsedData.meta.subtopico}`
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9]+/g, '-'); // Remove caracteres especiais
      
      const slugFinal = `${slugBase}-${timestamp}`;

      // 2. Inserção no Banco (Universal)
      const { error: insertError } = await supabase.from('modulos_estudo').insert([{
        cidade_id: null, // <--- IMPORTANTE: Não vincula a cidade
        
        // Usa o Tópico do JSON como Nome do Módulo (ex: "Língua Portuguesa - Sintaxe")
        modulo_nome: parsedData.meta.topico, 
        
        // Usa o Subtópico como Título da Aula (ex: "Termos da Oração")
        titulo_aula: parsedData.meta.subtopico, 
        
        modulo_slug: slugFinal,
        conteudo_json: parsedData,
        banca: parsedData.meta.banca.toUpperCase() // Garante padronização (CPCON)
      }]);

      if (insertError) throw insertError;

      alert(`✅ Missão Publicada com Sucesso!\nSlug: ${slugFinal}`);
      setJsonInput(''); // Limpa para a próxima

    } catch (err: any) {
      alert("❌ Erro ao publicar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* NAVBAR */}
      <nav className="border-b border-slate-100 px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/estudar" className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
              <span className="text-xl font-[1000] italic tracking-tighter text-[#4F46E5]">
                AVANT <span className="text-slate-300 font-light ml-2 text-sm uppercase tracking-[0.3em] not-italic">Universal Engine</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Publicação Automática por Banca</span>
            </div>
          </div>

          <div className="flex gap-3">
             <button 
               onClick={() => setJsonInput('')}
               className="px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
               disabled={!jsonInput}
             >
               <Trash2 className="w-4 h-4" />
             </button>

            <button 
              onClick={handlePublicar}
              disabled={!!error || !parsedData || saving}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg
                ${parsedData && !error 
                  ? 'bg-[#4F46E5] text-white hover:bg-indigo-700 hover:shadow-indigo-500/30 hover:scale-105' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
            >
              {saving ? (
                <span className="animate-pulse flex items-center gap-2"><Zap size={14} /> Processando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" /> 
                  {parsedData ? 'Publicar Missão' : 'Aguardando JSON'}
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ÁREA DE TRABALHO */}
      <main className="max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-8 h-[calc(100vh-100px)]">
        
        {/* EDITOR (ESQUERDA) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Code className="w-3 h-3 text-[#4F46E5]" /> Payload Input
            </label>
            {error ? (
               <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md"><AlertCircle size={12}/> JSON Inválido</span>
            ) : parsedData ? (
               <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={12}/> JSON Válido</span>
            ) : null}
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Cole o JSON da questão aqui..."
            className={`flex-1 w-full p-6 font-mono text-xs bg-slate-50 border-2 rounded-[32px] focus:outline-none transition-all resize-none leading-relaxed shadow-inner ${
              error ? 'border-red-200 bg-red-50/50 text-red-600' : 
              parsedData ? 'border-indigo-200 bg-indigo-50/20 text-slate-700' : 'border-slate-100 focus:border-[#4F46E5]/20'
            }`}
          />
        </div>

        {/* PREVIEW (DIREITA) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
           <div className="px-2 flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Eye className="w-3 h-3 text-indigo-500" /> Preview em Tempo Real
            </label>
            {parsedData && (
              <div className="flex gap-2">
                 <span className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1 rounded-full shadow-md shadow-indigo-200">
                    {parsedData.meta.banca}
                 </span>
                 <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                    {parsedData.meta.topico}
                 </span>
              </div>
            )}
          </div>

          <div className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-[40px] overflow-hidden relative p-4 md:p-8 flex items-center justify-center shadow-inner">
            {parsedData ? (
              <div className="w-full h-full max-w-5xl max-h-[850px] bg-white rounded-[40px] shadow-2xl overflow-hidden">
                 <AvantLessonPlayer key={JSON.stringify(parsedData)} dados={parsedData} mode="preview" />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                   <Zap className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-slate-400 font-black italic uppercase tracking-tighter text-2xl">Aguardando Injeção</h3>
                <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs mx-auto">Cole o código JSON no painel à esquerda para visualizar a questão antes de publicar.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
