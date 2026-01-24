'use client';

import { useState, useEffect } from 'react';
import { 
  Code, Eye, Save, ArrowLeft, Zap, 
  CheckCircle2, AlertCircle, Trash2, ClipboardPaste 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';

// ============================================================================
// FUNÇÃO: GERA HASH DO CONTEÚDO PARA DETECÇÃO DE DUPLICATAS
// ============================================================================
async function generateContentHash(text: string) {
  // Normaliza o texto: remove espaços extras e passa para minusculo
  const normalized = text.trim().toLowerCase().replace(/\s+/g, '');
  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AvantLaboratory() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ============================================================================
  // FUNÇÃO: SMART PASTE (A MÁGICA)
  // ============================================================================
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setJsonInput(text);
      // O useEffect de validação cuidará do resto
    } catch (err) {
      console.error("Falha ao ler área de transferência: ", err);
      alert("Permissão de colar negada pelo navegador.");
    }
  };

  // Validação em Tempo Real
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      
      if (!parsed.meta || !parsed.question_data) {
        throw new Error("O JSON precisa ter as chaves 'meta' e 'question_data'.");
      }
      if (!parsed.meta.banca || !parsed.meta.topico) {
        throw new Error("Faltam dados obrigatórios no 'meta': banca e topico são obrigatórios.");
      }
      
      // Subtopico é opcional, usa topico como fallback se não existir
      if (!parsed.meta.subtopico) {
        parsed.meta.subtopico = parsed.meta.topico || 'Geral';
      }
      
      // Validação das options
      if (!parsed.question_data.options || !Array.isArray(parsed.question_data.options) || parsed.question_data.options.length === 0) {
        throw new Error("O 'question_data' precisa ter um array 'options' com pelo menos uma alternativa.");
      }
      
      setParsedData(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setParsedData(null);
    }
  }, [jsonInput]);

  // ============================================================================
  // FUNÇÃO: GERA SLUG ÚNICO
  // ============================================================================
  const generateSlug = (data: any) => {
    const timestamp = Date.now();
    const subtopico = data.meta.subtopico || data.meta.topico || 'geral';
    const slugBase = `${data.meta.banca}-${data.meta.topico}-${subtopico}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-');
    return `${slugBase}-${timestamp}`;
  };

  const handlePublicar = async () => {
    if (!parsedData) return;
    setSaving(true);

    try {
      // 1. Gera o DNA único da questão baseada no enunciado
      const hash = await generateContentHash(parsedData.question_data.instruction);
      
      const slugFinal = generateSlug(parsedData);
      const jsonComSlug = {
        ...parsedData,
        modulo_slug: slugFinal 
      };
      
      // 2. Tenta inserir no Supabase
      const { error: insertError } = await supabase.from('modulos_estudo').insert([{
        cidade_id: null,
        modulo_nome: parsedData.meta.topico, 
        titulo_aula: parsedData.meta.subtopico || parsedData.meta.topico, // Fallback para subtopico
        modulo_slug: slugFinal,
        conteudo_json: jsonComSlug,
        banca: parsedData.meta.banca.toUpperCase(),
        content_hash: hash // Enviamos o Hash para validação
      }]);

      if (insertError) {
        // 3. Verifica se o erro é de duplicidade (Código 23505 no Postgres)
        if (insertError.code === '23505') {
          setToast({ message: "🚨 QUESTÃO DUPLICADA: Esta questão já existe no banco de dados!", type: 'error' });
          setTimeout(() => setToast(null), 5000);
          return;
        }
        throw insertError;
      }

      setToast({ message: "✅ Missão publicada com sucesso!", type: 'success' });
      setTimeout(() => setToast(null), 3000);
      setJsonInput('');
    } catch (err: any) {
      setToast({ message: `❌ Erro técnico: ${err.message}`, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-5 ${
          toast.type === 'success' 
            ? 'bg-green-50 border-2 border-green-200 text-green-800' 
            : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-bold text-sm">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
      )}
      
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
            </div>
          </div>

          <div className="flex gap-3">
            {/* BOTÃO COLAR JSON (NOVO) */}
            <button 
               onClick={handlePaste}
               className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 border border-indigo-200 transition-all active:scale-95"
             >
               <ClipboardPaste className="w-4 h-4" />
               Colar JSON
             </button>

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
                  ? 'bg-[#4F46E5] text-white hover:bg-indigo-700' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
            >
              {saving ? (
                <span className="animate-pulse flex items-center gap-2"><Zap size={14} /> Salvando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" /> 
                  {parsedData ? 'Publicar' : 'Aguardando'}
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ÁREA DE TRABALHO */}
      <main className="max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-8 h-[calc(100vh-100px)]">
        
        {/* EDITOR */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Code className="w-3 h-3 text-[#4F46E5]" /> Payload Input
            </label>
            {error && (
               <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">JSON Inválido</span>
            )}
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Clique no botão 'Colar JSON' acima..."
            className={`flex-1 w-full p-6 font-mono text-xs bg-slate-50 border-2 rounded-[32px] focus:outline-none transition-all resize-none shadow-inner ${
              error ? 'border-red-200' : 'border-slate-100 focus:border-[#4F46E5]/20'
            }`}
          />
        </div>

        {/* PREVIEW */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-[40px] overflow-hidden relative p-4 md:p-8 flex items-center justify-center shadow-inner">
            {parsedData ? (
              <div className="w-full h-full max-w-5xl max-h-[850px] bg-white rounded-[40px] shadow-2xl overflow-hidden">
                 <AvantLessonPlayer key={JSON.stringify(parsedData)} dados={parsedData} mode="preview" />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Zap className="w-10 h-10 text-slate-400 mb-6" />
                <h3 className="text-slate-400 font-black italic uppercase tracking-tighter text-2xl">Aguardando Injeção</h3>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
