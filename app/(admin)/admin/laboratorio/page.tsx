'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Code, Save, ArrowLeft, Zap,
  CheckCircle2, AlertCircle, Trash2, ClipboardPaste, Layers, FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
  TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE,
  questaoPayloadTecconcursosZodError,
} from '@/lib/validations';
import { ValidationErrorsPanel, formatZodErrors } from '@/components/admin/ValidationErrorsPanel';
import { JsonEditorWithHighlight } from '@/components/admin/JsonEditorWithHighlight';
import { findErrorLocation, findAllErrorLocations, type ErrorLocation } from '@/lib/jsonErrorLocator';
import { applySuggestion } from '@/lib/autoFix';
import { TemplateSelector } from '@/components/admin/TemplateSelector';
import { EnhancedPreview } from '@/components/admin/EnhancedPreview';
import type { QuestaoCompleta } from '@/types/lesson';
import { tryRecoverUtf8FromLatin1Misread } from '@/lib/fixUtf8Mojibake';

interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

interface BatchItem {
  index: number;
  valid: boolean;
  data: any;
  errors: ValidationError[];
}

interface BatchResult {
  inserted: number;
  skipped: number;
  errors: number;
  details: {
    inserted: number[];
    skipped: Array<{ index: number; reason: string }>;
    errors: Array<{ index: number; reason: string }>;
  };
}

interface ConcursoOption {
  id: string;
  slug: string;
  nome: string;
  status: string;
}

const MAX_JSON_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const LAB_CONCURSO_STORAGE_KEY = 'avant:lab-concurso-ativo';

export default function AvantLaboratory() {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
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

  // Estado do modo lote
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchPublishing, setBatchPublishing] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [concursos, setConcursos] = useState<ConcursoOption[]>([]);
  const [concursoAtivoId, setConcursoAtivoId] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/admin/concursos', { credentials: 'same-origin' });
        if (!res.ok || cancelled) return;
        const payload = await res.json();
        const list = (payload.concursos ?? []) as ConcursoOption[];
        setConcursos(list);
        const saved = sessionStorage.getItem(LAB_CONCURSO_STORAGE_KEY);
        const fallback = list.find((item) => item.slug === 'geral')?.id || list[0]?.id || '';
        const next = saved && list.some((item) => item.id === saved) ? saved : fallback;
        if (!cancelled) setConcursoAtivoId(next);
      } catch (err) {
        logger.error('Falha ao carregar concursos do laboratório', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (concursoAtivoId) {
      sessionStorage.setItem(LAB_CONCURSO_STORAGE_KEY, concursoAtivoId);
    }
  }, [concursoAtivoId]);

  const publishHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (concursoAtivoId) headers['X-Avant-Concurso-Id'] = concursoAtivoId;
    return headers;
  };

  // ============================================================================
  // FUNÇÃO: SMART PASTE
  // ============================================================================
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setJsonInput(tryRecoverUtf8FromLatin1Misread(text));
    } catch (err) {
      logger.error('Falha ao ler área de transferência', err);
      alert('Permissão de colar negada pelo navegador.');
    }
  };

  const handleJsonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_JSON_FILE_BYTES) {
      setToast({
        message: `Arquivo muito grande (máx. ${MAX_JSON_FILE_BYTES / (1024 * 1024)} MB).`,
        type: 'error',
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    try {
      const text = await file.text();
      setJsonInput(tryRecoverUtf8FromLatin1Misread(text));
      setToast({ message: `✅ Carregado: ${file.name}`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      logger.error('Falha ao ler arquivo JSON', err);
      setToast({ message: 'Não foi possível ler o arquivo.', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  // ============================================================================
  // VALIDAÇÃO EM TEMPO REAL — detecta objeto (individual) vs array (lote)
  // ============================================================================
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedData(null);
      setError(null);
      setValidationErrors([]);
      setErrorLocations(new Map());
      setErrorLines(new Set());
      setIsBatchMode(false);
      setBatchItems([]);
      setBatchResult(null);
      return;
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setError('JSON inválido: erro de sintaxe');
      setParsedData(null);
      setValidationErrors([]);
      setErrorLocations(new Map());
      setErrorLines(new Set());
      setIsBatchMode(false);
      setBatchItems([]);
      return;
    }

    // Array → modo lote
    if (Array.isArray(parsed)) {
      setIsBatchMode(true);
      setParsedData(null);
      setError(null);
      setValidationErrors([]);
      setErrorLocations(new Map());
      setErrorLines(new Set());
      setBatchResult(null);

      const items: BatchItem[] = parsed.map((item: any, index: number) => {
        if (payloadContainsTecconcursosReference(item)) {
          return {
            index,
            valid: false,
            data: item,
            errors: formatZodErrors(questaoPayloadTecconcursosZodError()),
          };
        }
        const result = QuestaoCompletaSchema.safeParse(item);
        if (!result.success) {
          const errs = formatZodErrors(result.error);
          return { index, valid: false, data: item, errors: errs };
        }
        const data = result.data;
        if (!data.meta.subtopico) data.meta.subtopico = data.meta.topico || 'Geral';
        return { index, valid: true, data, errors: [] };
      });

      setBatchItems(items);
      return;
    }

    // Objeto → modo individual (lógica original)
    setIsBatchMode(false);
    setBatchItems([]);
    setBatchResult(null);

    try {
      if (payloadContainsTecconcursosReference(parsed)) {
        const gateErrors: ValidationError[] = [
          { path: [], message: TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE, code: 'custom' },
        ];
        setValidationErrors(gateErrors);
        const locations = findAllErrorLocations(jsonInput, gateErrors);
        setErrorLocations(locations);
        const linesWithErrors = new Set<number>();
        locations.forEach((location) => {
          linesWithErrors.add(location.line);
        });
        setErrorLines(linesWithErrors);
        setError(`Erros de validação:\n${gateErrors.map((err) => err.message).join('\n')}`);
        setParsedData(null);
        return;
      }

      const validationResult = QuestaoCompletaSchema.safeParse(parsed);

      if (!validationResult.success) {
        const formattedErrors = formatZodErrors(validationResult.error);
        setValidationErrors(formattedErrors);
        const locations = findAllErrorLocations(jsonInput, formattedErrors);
        setErrorLocations(locations);
        const linesWithErrors = new Set<number>();
        locations.forEach((location) => { linesWithErrors.add(location.line); });
        setErrorLines(linesWithErrors);
        const errorMessages = formattedErrors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        setError(`Erros de validação:\n${errorMessages.join('\n')}`);
        setParsedData(null);
        return;
      }

      setValidationErrors([]);
      setErrorLocations(new Map());
      setErrorLines(new Set());
      setSelectedLine(null);
      setError(null);

      if (!validationResult.data.meta.subtopico) {
        validationResult.data.meta.subtopico = validationResult.data.meta.topico || 'Geral';
      }

      // Validação adicional dos slides
      if (validationResult.data.reverse_study_slides && validationResult.data.reverse_study_slides.length > 0) {
        validationResult.data.reverse_study_slides.forEach((slide: any, index: number) => {
          if (!slide.type && !slide.layout_type) {
            throw new Error(`Slide ${index + 1}: deve ter 'type' ou 'layout_type'`);
          }
          if (slide.type === 'logic_flow' && (!slide.steps || slide.steps.length === 0)) {
            throw new Error(`Slide ${index + 1} (logic_flow): deve ter 'steps' com pelo menos 1 passo`);
          }
          if (
            slide.type === 'golden_rule' &&
            !(typeof slide.content === 'string' && slide.content.trim()) &&
            !(Array.isArray(slide.rows) && slide.rows.length > 0)
          ) {
            throw new Error(`Slide ${index + 1} (golden_rule): deve ter 'content' ou 'rows'`);
          }
          if (
            slide.type === 'concept_map' &&
            (!slide.items || slide.items.length === 0) &&
            (!slide.concepts || slide.concepts.length === 0)
          ) {
            throw new Error(`Slide ${index + 1} (concept_map): deve ter 'items' ou 'concepts'`);
          }
          if (slide.type === 'danger_zone' && !slide.content) {
            throw new Error(`Slide ${index + 1} (danger_zone): deve ter 'content'`);
          }
        });
      }

      setParsedData(validationResult.data);
    } catch (e: any) {
      setError(e.message);
      setParsedData(null);
      if (e.message.includes('JSON')) {
        setValidationErrors([]);
        setErrorLocations(new Map());
        setErrorLines(new Set());
        setSelectedLine(null);
      }
    }
  }, [jsonInput]);

  // ============================================================================
  // PUBLICAR — questão individual via API segura
  // ============================================================================
  const handlePublicar = async () => {
    if (!parsedData) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(parsedData),
      });
      const result = await res.json();

      if (!res.ok) {
        setToast({ message: `❌ Erro: ${result.error || 'Erro desconhecido'}`, type: 'error' });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (result.skipped > 0) {
        const det = (result as BatchResult).details?.skipped?.[0]?.reason;
        setToast({
          message: det
            ? `🚨 Questão não inserida: ${det}`
            : '🚨 Questão repetida: já existe no AVANT (mesmo enunciado) ou no lote.',
          type: 'error',
        });
        setTimeout(() => setToast(null), 6000);
        return;
      }

      setToast({ message: '✅ Missão publicada com sucesso!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      setJsonInput('');
    } catch (err: any) {
      setToast({ message: `❌ Erro técnico: ${err.message}`, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // PUBLICAR LOTE — somente as questões válidas, via API segura
  // ============================================================================
  const handlePublicarLote = async () => {
    const validItems = batchItems.filter((i) => i.valid).map((i) => i.data);
    if (!validItems.length) return;
    setBatchPublishing(true);
    setBatchResult(null);

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: publishHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(validItems),
      });
      const result: BatchResult = await res.json();
      setBatchResult(result);

      if (!res.ok) {
        setToast({ message: `❌ Erro no lote: ${(result as any).error || 'Erro desconhecido'}`, type: 'error' });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      const parts = [
        result.inserted > 0 ? `${result.inserted} publicadas` : null,
        result.skipped > 0 ? `${result.skipped} duplicadas` : null,
        result.errors > 0 ? `${result.errors} erros` : null,
      ].filter(Boolean);

      setToast({
        message: result.inserted > 0 ? `✅ ${parts.join(' • ')}` : `⚠️ ${parts.join(' • ')}`,
        type: result.inserted > 0 ? 'success' : 'error',
      });
      setTimeout(() => setToast(null), 6000);

      // Limpa editor se tudo foi publicado com sucesso
      if (result.inserted > 0 && result.errors === 0 && result.skipped === 0) {
        setJsonInput('');
      }
    } catch (err: any) {
      setToast({ message: `❌ Erro técnico: ${err.message}`, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setBatchPublishing(false);
    }
  };

  const validBatchCount = batchItems.filter((i) => i.valid).length;
  const invalidBatchCount = batchItems.filter((i) => !i.valid).length;

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-900 font-sans">

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-5 ${
            toast.type === 'success'
              ? 'bg-green-50 border-2 border-green-200 text-green-800'
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-bold text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
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
                AVANT{' '}
                <span className="text-slate-300 font-light ml-2 text-sm uppercase tracking-[0.3em] not-italic">
                  Universal Engine
                </span>
              </span>
            </div>
            {isBatchMode && (
              <span className="bg-indigo-100 text-[#4F46E5] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Modo Lote
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3 justify-end">
            <div className="flex min-w-[220px] flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Concurso ativo
              </label>
              <select
                value={concursoAtivoId}
                onChange={(event) => setConcursoAtivoId(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                {concursos.length === 0 ? (
                  <option value="">Carregando…</option>
                ) : (
                  concursos.map((concurso) => (
                    <option key={concurso.id} value={concurso.id}>
                      {concurso.nome} ({concurso.slug})
                    </option>
                  ))
                )}
              </select>
            </div>
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              tabIndex={-1}
              onChange={handleJsonFileChange}
            />
            <button
              type="button"
              onClick={() => jsonFileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-all active:scale-95"
              aria-label="Abrir arquivo JSON do computador"
            >
              <FolderOpen className="w-4 h-4" />
              Abrir JSON
            </button>
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 border border-indigo-200 transition-all active:scale-95"
            >
              <ClipboardPaste className="w-4 h-4" />
              Colar JSON
            </button>

            <button
              type="button"
              title="Corrige texto tipo NÃ£o → Não (UTF-8 lido como Latin-1)"
              onClick={() => setJsonInput((prev) => tryRecoverUtf8FromLatin1Misread(prev))}
              className="px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
              disabled={!jsonInput}
            >
              UTF-8
            </button>

            <button
              onClick={() => setJsonInput('')}
              className="px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              disabled={!jsonInput}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {isBatchMode ? (
              <button
                onClick={handlePublicarLote}
                disabled={validBatchCount === 0 || batchPublishing}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                  validBatchCount > 0 && !batchPublishing
                    ? 'bg-[#4F46E5] text-white hover:bg-indigo-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {batchPublishing ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <Zap size={14} /> Publicando...
                  </span>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Publicar {validBatchCount} {validBatchCount === 1 ? 'questão' : 'questões'}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handlePublicar}
                disabled={!!error || !parsedData || saving}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                  parsedData && !error
                    ? 'bg-[#4F46E5] text-white hover:bg-indigo-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {saving ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <Zap size={14} /> Salvando...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {parsedData ? 'Publicar' : 'Aguardando'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ÁREA DE TRABALHO */}
      <main className="max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-8 h-[calc(100vh-100px)] [grid-template-rows:1fr]">

        <aside className="col-span-12 -mb-2">
          <details className="group rounded-2xl border border-slate-200 bg-amber-50/60 px-4 py-3 text-slate-700 shadow-sm open:pb-4">
            <summary className="cursor-pointer list-none text-left text-xs font-bold uppercase tracking-wider text-amber-900/90">
              <span className="inline-flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                Cidade, import em massa e coluna <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">cidade_id</code>
                <span className="text-[10px] font-semibold text-amber-700/80 group-open:hidden">(clique para expandir)</span>
              </span>
            </summary>
            <ul className="mt-3 space-y-2 border-t border-amber-200/80 pt-3 text-[12px] leading-relaxed text-slate-600">
              <li>
                O painel e a API de publicação usam o JSON da questão (<strong>sem</strong>{' '}
                <code className="text-[11px]">cidade_id</code> no corpo do JSON). Cidade aluno
                fica no link do painel, ex.: <code className="text-[11px]">/estudar?cidade=…</code>.
              </li>
              <li>
                A tabela <code className="text-[11px]">modulos_estudo</code> pode ter{' '}
                <code className="text-[11px]">cidade_id</code> optional (legado) para import SQL/CSV
                antigo; fora isso, pode deixar de fora.
              </li>
              <li>
                Se um import mostrar “Could not find the column <code className="text-[11px]">cidade_id</code>”,
                rode a migration que recria a coluna nullable no Supabase, ou remova a coluna do CSV.
              </li>
            </ul>
            <p className="mt-2 text-[11px] text-slate-500">
              Documentação: <code className="rounded bg-slate-100 px-1">docs/IMPORTACAO_LABORATORIO.md</code>
            </p>
          </details>
        </aside>

        {/* EDITOR */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between px-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Code className="w-3 h-3 text-[#4F46E5]" /> Payload Input
            </label>
            {isBatchMode ? (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1">
                <Layers className="w-3 h-3" /> {batchItems.length} questões
              </span>
            ) : error ? (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                {validationErrors.length > 0 ? `${validationErrors.length} Erros` : 'JSON Inválido'}
              </span>
            ) : parsedData && !error ? (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Válido
              </span>
            ) : null}
          </div>

          <div
            className={`flex-1 rounded-[32px] border-2 overflow-hidden shadow-inner bg-slate-50 ${
              isBatchMode
                ? 'border-indigo-200 focus-within:border-[#4F46E5]/40'
                : error
                ? 'border-red-200'
                : parsedData && !error
                ? 'border-green-200'
                : 'border-slate-100 focus-within:border-[#4F46E5]/20'
            }`}
          >
            <JsonEditorWithHighlight
              value={jsonInput}
              onChange={setJsonInput}
              errorLines={errorLines}
              selectedLine={selectedLine}
              onLineClick={(line) => { setSelectedLine(line); }}
              normalizePastedText={tryRecoverUtf8FromLatin1Misread}
              placeholder={
                'Use Abrir JSON, Colar JSON ou digite: um objeto { } ou um array [ ] para lote'
              }
              className="h-full"
            />
          </div>

          {/* Painel de erros Zod (modo individual) */}
          {!isBatchMode && validationErrors.length > 0 && (
            <div className="mt-2">
              <ValidationErrorsPanel
                errors={validationErrors}
                jsonData={
                  parsedData ||
                  (() => {
                    try {
                      return JSON.parse(jsonInput);
                    } catch {
                      return null;
                    }
                  })()
                }
                onErrorClick={(error, location) => {
                  if (location) {
                    setSelectedLine(location.line);
                  } else {
                    const foundLocation = findErrorLocation(jsonInput, error.path);
                    if (foundLocation) setSelectedLine(foundLocation.line);
                  }
                }}
                onApplySuggestion={(errorIndex, suggestion) => {
                  const err = validationErrors[errorIndex];
                  if (err && suggestion.fix) {
                    try {
                      const fixedJson = applySuggestion(jsonInput, err, suggestion);
                      setJsonInput(fixedJson);
                      setTimeout(() => setSelectedLine(null), 1000);
                    } catch (e) {
                      logger.error('Failed to apply suggestion', e);
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Erro simples não-Zod (modo individual) */}
          {!isBatchMode && error && validationErrors.length === 0 && (
            <div className="mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 text-sm mb-1">Erro</h4>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">{error}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PREVIEW (individual) / SUMÁRIO DE LOTE */}
        <div className="col-span-12 lg:col-span-8 flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-[40px] border-2 border-slate-200 bg-slate-100 shadow-inner">
            {isBatchMode ? (
              /* ------------------------------------------------------------------ */
              /* MODO LOTE: sumário de validação + resultado após publicar           */
              /* ------------------------------------------------------------------ */
              <div className="h-full flex flex-col p-6 overflow-auto gap-4">

                {/* Cabeçalho */}
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Layers className="w-5 h-5 text-[#4F46E5]" />
                    <h3 className="font-black uppercase italic text-slate-900">Lote Detectado</h3>
                  </div>
                  <div className="flex gap-6 text-sm font-bold flex-wrap">
                    <span className="text-slate-500">{batchItems.length} questões no total</span>
                    <span className="text-green-600">✓ {validBatchCount} válidas</span>
                    {invalidBatchCount > 0 && (
                      <span className="text-red-500">✗ {invalidBatchCount} com erros</span>
                    )}
                  </div>
                </div>

                {/* Resultado após publicar */}
                {batchResult && (
                  <div
                    className={`border-2 rounded-2xl p-5 shrink-0 ${
                      batchResult.inserted > 0
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <p className="font-black uppercase italic text-sm mb-2">
                      {batchResult.inserted > 0 ? '✅ Lote Processado' : '⚠️ Nenhuma publicada'}
                    </p>
                    <div className="flex gap-5 text-xs font-bold flex-wrap">
                      {batchResult.inserted > 0 && (
                        <span className="text-green-700">{batchResult.inserted} publicadas</span>
                      )}
                      {batchResult.skipped > 0 && (
                        <span className="text-amber-700">{batchResult.skipped} duplicadas (ignoradas)</span>
                      )}
                      {batchResult.errors > 0 && (
                        <span className="text-red-700">{batchResult.errors} com erro de inserção</span>
                      )}
                    </div>
                    {batchResult.details.skipped.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-amber-200 pt-3">
                        <p className="text-[10px] font-black uppercase text-amber-800 mb-1">
                          Não inseridas (repetidas)
                        </p>
                        {batchResult.details.skipped.map((s) => (
                          <p key={`skip-${s.index}`} className="text-xs text-amber-800">
                            #{s.index + 1}: {s.reason}
                          </p>
                        ))}
                      </div>
                    )}
                    {batchResult.details.errors.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-black uppercase text-red-700 mb-1">
                          Erros
                        </p>
                        {batchResult.details.errors.map((e) => (
                          <p key={e.index} className="text-xs text-red-600">
                            #{e.index + 1}: {e.reason}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de questões do lote */}
                <div className="flex-1 overflow-auto space-y-2">
                  {batchItems.map((item) => (
                    <div
                      key={item.index}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-colors ${
                        item.valid
                          ? 'border-green-100 bg-white hover:border-green-200'
                          : 'border-red-100 bg-red-50/50 hover:border-red-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          item.valid ? 'bg-green-500' : 'bg-red-400'
                        }`}
                      >
                        {item.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-black text-slate-400 shrink-0">
                            #{item.index + 1}
                          </span>
                          {item.data?.meta && (
                            <>
                              <span className="text-[10px] font-bold bg-[#4F46E5]/10 text-[#4F46E5] px-2 py-0.5 rounded-full shrink-0">
                                {item.data.meta.banca}
                              </span>
                              <span className="text-xs font-bold text-slate-700 truncate">
                                {item.data.meta.subtopico || item.data.meta.topico}
                              </span>
                            </>
                          )}
                        </div>
                        {item.data?.question_data?.instruction && (
                          <p className="text-xs text-slate-500 truncate">
                            {item.data.question_data.instruction}
                          </p>
                        )}
                        {!item.valid && item.errors.length > 0 && (
                          <p className="text-xs text-red-600 font-medium mt-1">
                            {item.errors[0].path.join('.')} — {item.errors[0].message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : parsedData ? (
              /* ------------------------------------------------------------------ */
              /* MODO INDIVIDUAL: preview visual da questão                          */
              /* ------------------------------------------------------------------ */
              <EnhancedPreview question={parsedData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                <Zap className="w-10 h-10 text-slate-400 mb-6" />
                <h3 className="text-slate-400 font-black italic uppercase tracking-tighter text-2xl">
                  Aguardando Injeção
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  Cole um objeto <span className="font-mono">{'{}'}</span> para visualizar uma questão, ou um
                  array <span className="font-mono">{'[]'}</span> para inserção em lote
                </p>
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
                setToast({ message: '✅ Template carregado com sucesso!', type: 'success' });
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
