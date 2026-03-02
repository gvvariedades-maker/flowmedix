'use client';

import { useState, useEffect } from 'react';
import { 
  Code, Eye, Save, ArrowLeft, Zap, 
  CheckCircle2, AlertCircle, Trash2, ClipboardPaste 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { logger } from '@/lib/logger';
import { QuestaoCompletaSchema } from '@/lib/validations';
import { ValidationErrorsPanel, formatZodErrors } from '@/components/admin/ValidationErrorsPanel';
import { JsonEditorWithHighlight } from '@/components/admin/JsonEditorWithHighlight';
import { findErrorLocation, findAllErrorLocations, type ErrorLocation } from '@/lib/jsonErrorLocator';
import { applySuggestion } from '@/lib/autoFix';
import type { Suggestion } from '@/lib/errorSuggestions';
import type { ZodError } from 'zod';
import { TemplateSelector } from '@/components/admin/TemplateSelector';
import { QuestionExporter } from '@/components/admin/QuestionExporter';
import { EnhancedPreview } from '@/components/admin/EnhancedPreview';
import type { QuestaoCompleta } from '@/types/lesson';

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

interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

export default function AvantLaboratory() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [errorLocations, setErrorLocations] = useState<Map<number, ErrorLocation>>(new Map());
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

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
      logger.error("Falha ao ler área de transferência", err);
      alert("Permissão de colar negada pelo navegador.");
    }
  };

  // Validação em Tempo Real com Zod
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedData(null);
      setError(null);
      setValidationErrors([]);
      setErrorLocations(new Map());
      setErrorLines(new Set());
      return;
    }
    
    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonInput);
    } catch (parseError) {
      // Erro de parsing JSON
      setError('JSON inválido: erro de sintaxe');
      setParsedData(null);
      setValidationErrors([]);
      setErrorLocations(new Map());
      setErrorLines(new Set());
      return;
    }
    
    try {
      // Validação rigorosa com Zod
      const validationResult = QuestaoCompletaSchema.safeParse(parsed);
      
      if (!validationResult.success) {
        // Formata erros Zod em formato estruturado para o painel visual
        const formattedErrors = formatZodErrors(validationResult.error);
        setValidationErrors(formattedErrors);
        
        // Encontra localizações dos erros no JSON
        const locations = findAllErrorLocations(jsonInput, formattedErrors);
        setErrorLocations(locations);
        
        // Extrai linhas com erro para highlight
        const linesWithErrors = new Set<number>();
        locations.forEach((location) => {
          linesWithErrors.add(location.line);
        });
        setErrorLines(linesWithErrors);
        
        // Mantém mensagem de erro simples para compatibilidade
        const errorMessages = formattedErrors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        setError(`Erros de validação:\n${errorMessages.join('\n')}`);
        setParsedData(null);
        return;
      }
      
      // Limpa erros se validação passou
      setValidationErrors([]);
      setErrorLocations(new Map());
      setErrorLines(new Set());
      setSelectedLine(null);
      setError(null);
      
      // Subtopico é opcional, usa topico como fallback se não existir
      if (!validationResult.data.meta.subtopico) {
        validationResult.data.meta.subtopico = validationResult.data.meta.topico || 'Geral';
      }
      
      // Validação adicional dos slides (se existirem)
      if (validationResult.data.reverse_study_slides && validationResult.data.reverse_study_slides.length > 0) {
        validationResult.data.reverse_study_slides.forEach((slide: any, index: number) => {
          // Valida que cada slide tem type ou layout_type
          if (!slide.type && !slide.layout_type) {
            throw new Error(`Slide ${index + 1}: deve ter 'type' ou 'layout_type'`);
          }
          
          // Validação específica por tipo
          if (slide.type === 'logic_flow' && (!slide.steps || slide.steps.length === 0)) {
            throw new Error(`Slide ${index + 1} (logic_flow): deve ter 'steps' com pelo menos 1 passo`);
          }
          
          if (slide.type === 'golden_rule' && !slide.content) {
            throw new Error(`Slide ${index + 1} (golden_rule): deve ter 'content'`);
          }
          
          if (slide.type === 'concept_map' && (!slide.items || slide.items.length === 0) && (!slide.concepts || slide.concepts.length === 0)) {
            throw new Error(`Slide ${index + 1} (concept_map): deve ter 'items' ou 'concepts'`);
          }
          
          if (slide.type === 'danger_zone' && !slide.content) {
            throw new Error(`Slide ${index + 1} (danger_zone): deve ter 'content'`);
          }
        });
      }
      
      setParsedData(validationResult.data);
    } catch (e: any) {
      // Erro de parsing JSON ou validação manual adicional
      setError(e.message);
      setParsedData(null);
      // Se for erro de parsing, limpa erros de validação
      if (e.message.includes('JSON')) {
        setValidationErrors([]);
        setErrorLocations(new Map());
        setErrorLines(new Set());
        setSelectedLine(null);
      }
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

      // 4. Invalidar cache para a questão aparecer na área do aluno imediatamente
      try {
        await fetch('/api/admin/revalidate-cache', {
          method: 'POST',
          credentials: 'same-origin',
        });
      } catch (e) {
        logger.warn('Cache revalidation failed (questão foi salva)', e);
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
               <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                 {validationErrors.length > 0 ? `${validationErrors.length} Erros` : 'JSON Inválido'}
               </span>
            )}
            {parsedData && !error && (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Válido
              </span>
            )}
          </div>
          
          <div className={`flex-1 rounded-[32px] border-2 overflow-hidden shadow-inner bg-slate-50 ${
            error ? 'border-red-200' : parsedData && !error 
              ? 'border-green-200' 
              : 'border-slate-100 focus-within:border-[#4F46E5]/20'
          }`}>
            <JsonEditorWithHighlight
              value={jsonInput}
              onChange={setJsonInput}
              errorLines={errorLines}
              selectedLine={selectedLine}
              onLineClick={(line) => {
                setSelectedLine(line);
                // Scroll para a linha já é feito pelo componente
              }}
              placeholder="Clique no botão 'Colar JSON' acima..."
              className="h-full"
            />
          </div>
          
          {/* Painel de Erros de Validação */}
          {validationErrors.length > 0 && (
            <div className="mt-2">
              <ValidationErrorsPanel 
                errors={validationErrors}
                jsonData={parsedData || (() => {
                  try {
                    return JSON.parse(jsonInput);
                  } catch {
                    return null;
                  }
                })()}
                onErrorClick={(error, location) => {
                  // Navega para o erro no JSON
                  if (location) {
                    setSelectedLine(location.line);
                    // Scroll é feito automaticamente pelo JsonEditorWithHighlight
                  } else {
                    // Fallback: tenta encontrar a localização
                    const foundLocation = findErrorLocation(jsonInput, error.path);
                    if (foundLocation) {
                      setSelectedLine(foundLocation.line);
                    }
                  }
                }}
                onApplySuggestion={(errorIndex, suggestion) => {
                  // Aplica correção automática
                  const error = validationErrors[errorIndex];
                  if (error && suggestion.fix) {
                    try {
                      const fixedJson = applySuggestion(jsonInput, error, suggestion);
                      setJsonInput(fixedJson);
                      // Limpa seleção após aplicar correção
                      setTimeout(() => setSelectedLine(null), 1000);
                    } catch (err) {
                      logger.error('Failed to apply suggestion', err);
                    }
                  }
                }}
              />
            </div>
          )}
          
          {/* Mensagem de erro simples (para erros não-Zod) */}
          {error && validationErrors.length === 0 && (
            <div className="mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 text-sm mb-1">Erro</h4>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PREVIEW MELHORADO */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-[40px] overflow-hidden relative shadow-inner">
            {parsedData ? (
              <EnhancedPreview question={parsedData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                <Zap className="w-10 h-10 text-slate-400 mb-6" />
                <h3 className="text-slate-400 font-black italic uppercase tracking-tighter text-2xl">Aguardando Injeção</h3>
                <p className="text-slate-400 text-sm mt-2">Cole um JSON ou selecione um template para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <TemplateSelector
              onSelectTemplate={(question: QuestaoCompleta) => {
                setJsonInput(JSON.stringify(question, null, 2));
                setShowTemplateSelector(false);
                setToast({ 
                  message: '✅ Template carregado com sucesso!', 
                  type: 'success' 
                });
                setTimeout(() => setToast(null), 3000);
              }}
              onClose={() => setShowTemplateSelector(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
