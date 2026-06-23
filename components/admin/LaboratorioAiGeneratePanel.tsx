'use client';

import { useMemo, useState } from 'react';
import { Sparkles, ChevronDown, FileJson } from 'lucide-react';

import { logger } from '@/lib/logger';
import { extractLabGenerateInput } from '@/lib/ai/labGenerateInput';
import { requestLabSlideGeneration, type AiGenerateResult } from '@/lib/ai/labGenerateClient';

export type { AiGenerateResult };

type LaboratorioAiGeneratePanelProps = {
  onGenerated: (json: string, result: AiGenerateResult) => void;
  disabled?: boolean;
  /** Questão parseada do editor JSON (modo individual). */
  editorQuestao?: unknown | null;
};

function parseOptions(raw: string): { id: string; text: string; is_correct: boolean }[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const m = line.match(/^([A-E])[\)\.\-:\s]+(.+?)(\s*\*)?\s*$/i);
      if (m) {
        return {
          id: m[1].toUpperCase(),
          text: m[2].trim(),
          is_correct: Boolean(m[3]),
        };
      }
      return {
        id: String.fromCharCode(65 + i),
        text: line.replace(/^\*|\*$/g, '').trim(),
        is_correct: /^\*/.test(line) || /\*$/.test(line),
      };
    });
}

export function LaboratorioAiGeneratePanel({
  onGenerated,
  disabled = false,
  editorQuestao = null,
}: LaboratorioAiGeneratePanelProps) {
  const [open, setOpen] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingFromEditor, setGeneratingFromEditor] = useState(false);
  const [banca, setBanca] = useState('');
  const [subtopico, setSubtopico] = useState('');
  const [ano, setAno] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [alternativas, setAlternativas] = useState('');

  const editorExtract = useMemo(
    () => (editorQuestao ? extractLabGenerateInput(editorQuestao) : null),
    [editorQuestao],
  );

  const runGeneration = async (
    body: Parameters<typeof requestLabSlideGeneration>[0],
    mode: 'editor' | 'form',
  ) => {
    const setBusy = mode === 'editor' ? setGeneratingFromEditor : setGenerating;
    setBusy(true);
    try {
      const data = await requestLabSlideGeneration(body);
      onGenerated(JSON.stringify(data.questao, null, 2), {
        status: data.status,
        score: data.score,
        issues: data.issues ?? [],
        questao: data.questao,
      });
    } catch (err) {
      logger.error('Laboratório: geração IA falhou', err);
      onGenerated('', {
        status: 'failed',
        score: 0,
        issues: [err instanceof Error ? err.message : 'Erro na geração'],
        questao: {},
      });
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateFromEditor = async () => {
    if (!editorExtract?.ok) return;
    await runGeneration({ questao: editorExtract.questao }, 'editor');
  };

  const handleGenerate = async () => {
    const options = parseOptions(alternativas);
    if (!enunciado.trim() || options.length < 2) return;

    const hasGabarito = options.some((o) => o.is_correct);
    if (!hasGabarito && options.length > 0) {
      options[0] = { ...options[0], is_correct: true };
    }

    await runGeneration(
      {
        meta: {
          banca: banca.trim() || 'Banca',
          topico: 'Enfermagem',
          subtopico: subtopico.trim() || undefined,
          ano: ano.trim() || undefined,
        },
        question_data: {
          instruction: enunciado.trim(),
          options,
        },
      },
      'form',
    );
  };

  const busy = generating || generatingFromEditor || disabled;
  const canGenerateFromEditor = !busy && editorExtract?.ok === true;
  const canGenerateForm =
    !busy && enunciado.trim().length >= 10 && parseOptions(alternativas).length >= 2;

  const editorSubtopico =
    editorExtract?.ok && typeof editorExtract.questao.meta.subtopico === 'string'
      ? editorExtract.questao.meta.subtopico
      : null;

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-800">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Avant Agent — Gerar NeuroSlides
        </span>
        <ChevronDown
          className={`h-4 w-4 text-violet-600 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-violet-100 px-4 pb-4 pt-3">
          {editorQuestao != null ? (
            <div className="rounded-xl border border-violet-100 bg-white/80 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-900">
                JSON aberto no editor
              </p>
              {editorExtract?.ok ? (
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Usa <strong>meta</strong> + <strong>question_data</strong> do JSON colado e
                  regenera os 4 slides. Metadados extras (sources, content_review) são preservados.
                  {editorSubtopico ? (
                    <>
                      {' '}
                      Subtópico: <strong>{editorSubtopico}</strong>
                    </>
                  ) : (
                    <>
                      {' '}
                      <span className="text-amber-700">Sem subtópico — molde visual pode cair em fallback.</span>
                    </>
                  )}
                </p>
              ) : (
                <p className="text-[10px] text-red-600">
                  {editorExtract?.error ?? 'JSON inválido para geração'}
                </p>
              )}
              <button
                type="button"
                onClick={handleGenerateFromEditor}
                disabled={!canGenerateFromEditor}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                  canGenerateFromEditor
                    ? 'bg-violet-700 text-white shadow-md hover:bg-violet-800'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                }`}
              >
                <FileJson className="h-4 w-4" aria-hidden />
                {generatingFromEditor ? 'Gerando do JSON…' : 'Gerar slides do JSON aberto'}
              </button>
            </div>
          ) : null}

          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Ou preencha manualmente
          </p>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Banca"
              value={banca}
              onChange={(e) => setBanca(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            />
            <input
              type="text"
              placeholder="Subtópico canônico"
              value={subtopico}
              onChange={(e) => setSubtopico(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            />
            <input
              type="text"
              placeholder="Ano"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            />
          </div>

          <textarea
            placeholder="Enunciado da questão (I -, II - em linhas separadas se V/F)"
            value={enunciado}
            onChange={(e) => setEnunciado(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-xs leading-relaxed"
          />

          <textarea
            placeholder={'Alternativas (uma por linha):\nA) texto distrator\nB) texto correto *'}
            value={alternativas}
            onChange={(e) => setAlternativas(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono leading-relaxed"
          />

          <p className="text-[10px] text-slate-500">
            Marque o gabarito com <strong>*</strong> no fim da linha. O JSON gerado substitui o conteúdo
            do editor — revise o preview antes de publicar.
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerateForm}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
              canGenerateForm
                ? 'bg-violet-600 text-white shadow-md hover:bg-violet-700'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {generating ? 'Gerando… (até ~45s)' : 'Gerar com IA (formulário)'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
