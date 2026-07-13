'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  buildDerivedQuestionHeaderLine,
  buildQuestionSubjectLine,
  stripLeadingQuestionEnumeration,
} from '@/lib/questionHeader';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';
import { sanitizeHTML } from '@/lib/validations';
import {
  buildPublicSimuladoDiagnostico,
  buildPublicSimuladoUtm,
  gradePublicSimuladoAnswer,
  resolveEixoFromLesson,
} from '@/lib/public-simulado/grade';
import type {
  PublicSimuladoAnswerRecord,
  PublicSimuladoBundle,
  PublicSimuladoPhase,
} from '@/lib/public-simulado/types';
import { cn } from '@/lib/utils';

const AvantLessonPlayer = dynamic(() => import('@/components/lesson/AvantLessonPlayer'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#010409] text-sm text-slate-400">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-400" />
      Carregando estudo reverso…
    </div>
  ),
});

type ReviewFilter = 'todos' | 'erros' | 'acertos';

type PublicSimuladoRunnerProps = {
  bundle: PublicSimuladoBundle;
};

function formatTimer(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function PublicSimuladoRunner({ bundle }: PublicSimuladoRunnerProps) {
  const { manifest, questoes } = bundle;
  const total = questoes.length;

  const [phase, setPhase] = useState<PublicSimuladoPhase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timerSec, setTimerSec] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('todos');
  const [estudoSlug, setEstudoSlug] = useState<string | null>(null);

  const ctaHref = useMemo(() => {
    const utm = buildPublicSimuladoUtm(manifest.utmCampaign);
    return `${manifest.ctaLpPath}?${utm}`;
  }, [manifest.ctaLpPath, manifest.utmCampaign]);

  const current = questoes[questionIndex];
  const slimDados = useMemo(
    () => (current ? stripQuestionAnswersForClient(current.dados) : null),
    [current],
  );

  useEffect(() => {
    if (phase !== 'question' || startTime == null) return;
    const id = window.setInterval(() => {
      setTimerSec(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, startTime]);

  const answerRecords = useMemo((): PublicSimuladoAnswerRecord[] => {
    return questoes.map((q, index) => {
      const opcaoId = answers[q.slug] ?? '';
      const graded = opcaoId ? gradePublicSimuladoAnswer(q.dados, opcaoId) : null;
      return {
        slug: q.slug,
        opcaoId,
        acertou: graded?.acertou ?? false,
        opcaoCorretaId: graded?.opcaoCorretaId ?? '',
        eixo: resolveEixoFromLesson(q.dados),
        ordem: index + 1,
      };
    });
  }, [answers, questoes]);

  const acertos = answerRecords.filter((r) => r.acertou).length;
  const pct = total > 0 ? Math.round((acertos / total) * 100) : 0;
  const diagnostico = useMemo(() => buildPublicSimuladoDiagnostico(answerRecords), [answerRecords]);

  const tempoTotalSec =
    startTime != null && endTime != null ? Math.floor((endTime - startTime) / 1000) : 0;

  const startSimulado = () => {
    setQuestionIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setStartTime(Date.now());
    setEndTime(null);
    setTimerSec(0);
    setPhase('question');
  };

  const confirmAnswer = () => {
    if (!current || !selectedOption) return;
    const nextAnswers = { ...answers, [current.slug]: selectedOption };
    setAnswers(nextAnswers);

    if (questionIndex >= total - 1) {
      setEndTime(Date.now());
      setPhase('result');
      return;
    }

    setQuestionIndex((i) => i + 1);
    setSelectedOption(nextAnswers[questoes[questionIndex + 1]?.slug ?? ''] ?? null);
  };

  const openEstudo = useCallback((slug: string) => {
    setEstudoSlug(slug);
    setPhase('estudo');
  }, []);

  const closeEstudo = () => {
    setEstudoSlug(null);
    setPhase('review');
  };

  const estudoItem = estudoSlug ? questoes.find((q) => q.slug === estudoSlug) : null;
  const estudoOpcao = estudoSlug ? answers[estudoSlug] : undefined;

  if (phase === 'estudo' && estudoItem) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#010409]">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#010409]/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={closeEstudo}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à revisão
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
            Estudo reverso
          </span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <AvantLessonPlayer
            key={estudoItem.slug}
            dados={estudoItem.dados}
            mode="preview"
            previewImmersive
            previewInitialEtapa="estudo"
            previewInitialOpcaoId={estudoOpcao}
            moduloSlug={estudoItem.slug}
          />
        </div>
        <div className="border-t border-white/10 bg-[#010409] p-4 pb-safe">
          <Link
            href={ctaHref}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-950"
          >
            Garantir acesso AVANT Enf · Campina Grande
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0c0c16] text-[#f0f0ff]">
      {/* INTRO */}
      {phase === 'intro' && (
        <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg">
              ⚡
            </div>
            <span className="text-xl font-black tracking-wide text-white">AVANT Enf</span>
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">
            📍 {manifest.cidade} · {manifest.uf} · {manifest.dataProvaFormatada}
          </div>
          <div className="mb-3 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold tracking-wide text-cyan-300">
            SIMULADO PÚBLICO · {manifest.banca}
          </div>
          <h1 className="text-3xl font-black leading-tight text-white">{manifest.titulo}</h1>
          <p className="mt-2 text-sm text-slate-400">{manifest.subtitulo}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{manifest.descricao}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400">{total}</div>
              <div className="text-[10px] tracking-widest text-slate-500">QUESTÕES</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400">~15</div>
              <div className="text-[10px] tracking-widest text-slate-500">MINUTOS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400">100%</div>
              <div className="text-[10px] tracking-widest text-slate-500">GRATUITO</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400">ER</div>
              <div className="text-[10px] tracking-widest text-slate-500">COMPLETO</div>
            </div>
          </div>

          <p className="mt-4 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-xs leading-relaxed text-slate-400">
            Conteúdo específico de técnico de enfermagem (IDECAN). Estudo reverso com NeuroSlides em
            todas as questões — mesmo formato do app AVANT Enf.
          </p>

          <button
            type="button"
            onClick={startSimulado}
            className="mt-8 w-full rounded-2xl bg-cyan-400 py-4 text-base font-black text-slate-950"
          >
            ⚡ Iniciar simulado
          </button>
        </div>
      )}

      {/* QUESTÃO */}
      {phase === 'question' && current && slimDados && (
        <>
          <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0c16] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-cyan-400">AVANT Enf</span>
              <span className="text-sm font-bold text-cyan-400">{formatTimer(timerSec)}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-cyan-400 transition-all"
                style={{ width: `${(questionIndex / total) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Questão {questionIndex + 1} de {total}
            </p>
          </div>

          <div className="mx-auto max-w-lg px-4 pb-36 pt-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              {slimDados.meta && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-400">
                    {slimDados.meta.header_line?.trim() ||
                      buildDerivedQuestionHeaderLine(slimDados.meta)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {buildQuestionSubjectLine(slimDados.meta)}
                  </p>
                  <div className="my-4 h-px bg-white/10" />
                </>
              )}
              {slimDados.question_data.text_fragment ? (
                <div
                  className="prose prose-invert mb-4 max-w-none text-sm text-slate-300"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(slimDados.question_data.text_fragment),
                  }}
                />
              ) : null}
              <p className="text-sm leading-relaxed text-slate-100">
                {stripLeadingQuestionEnumeration(slimDados.question_data.instruction)}
              </p>
            </div>

            <div className="mt-4 space-y-2" role="listbox" aria-label="Alternativas">
              {slimDados.question_data.options.map((opt) => {
                const selected = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setSelectedOption(opt.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors',
                      selected
                        ? 'border-cyan-400/60 bg-cyan-400/10'
                        : 'border-white/10 bg-slate-900/80 hover:border-white/20',
                    )}
                  >
                    <span className="min-w-[1.5rem] text-sm font-bold text-cyan-400">
                      {opt.id})
                    </span>
                    <span className="text-sm leading-relaxed text-slate-100">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0c0c16] p-4 pb-safe">
            <button
              type="button"
              disabled={!selectedOption}
              onClick={confirmAnswer}
              className={cn(
                'w-full rounded-2xl py-4 text-base font-black',
                selectedOption
                  ? 'bg-cyan-400 text-slate-950'
                  : 'cursor-not-allowed bg-cyan-400/30 text-slate-600',
              )}
            >
              {questionIndex >= total - 1 ? 'Finalizar simulado' : 'Confirmar resposta'}
            </button>
          </div>
        </>
      )}

      {/* RESULTADO */}
      {phase === 'result' && (
        <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
          <h2 className="text-2xl font-black text-white">Simulado concluído</h2>
          <p className="mt-1 text-sm text-slate-400">
            {total} questões · {manifest.banca}
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center">
            <div className="text-5xl font-black text-cyan-400">{pct}%</div>
            <div className="text-xs tracking-widest text-slate-500">DE ACERTO</div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-black text-emerald-400">{acertos}</div>
                <div className="text-[10px] text-slate-500">ACERTOS</div>
              </div>
              <div>
                <div className="text-3xl font-black text-rose-400">{total - acertos}</div>
                <div className="text-[10px] text-slate-500">ERROS</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-cyan-300">
              Tempo: {formatTimer(tempoTotalSec)} · média{' '}
              {total > 0 ? Math.round(tempoTotalSec / total) : 0}s/questão
            </p>
          </div>

          {diagnostico.length > 0 ? (
            <div className="mt-6">
              <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-slate-500">
                SEUS PONTOS FRACOS
              </p>
              {diagnostico.slice(0, 3).map((item) => (
                <div key={item.eixo} className="mb-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-200">{item.eixo}</span>
                    <span className="font-bold text-rose-400">
                      {item.erros} erro{item.erros > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${Math.round((item.erros / item.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-emerald-400">🏆 Gabaritou! Desempenho perfeito!</p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={ctaHref}
              className="flex w-full items-center justify-center rounded-2xl bg-[#BEF264] py-4 text-sm font-black uppercase tracking-widest text-slate-950"
            >
              Garantir acesso · R$ 37
            </Link>
            <button
              type="button"
              onClick={() => setPhase('review')}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 py-3.5 text-sm font-semibold text-white"
            >
              📋 Ver revisão por questão
            </button>
          </div>
        </div>
      )}

      {/* REVISÃO */}
      {phase === 'review' && (
        <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
          <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500">REVISÃO POR QUESTÃO</h2>
          <div className="mt-3 flex gap-2">
            {(['todos', 'erros', 'acertos'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setReviewFilter(f)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold',
                  reviewFilter === f
                    ? 'border-cyan-400/50 bg-slate-800 text-white'
                    : 'border-white/10 text-slate-400',
                )}
              >
                {f === 'todos' ? 'Todos' : f === 'erros' ? 'Só erros' : 'Só acertos'}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {answerRecords
              .filter((r) => {
                if (reviewFilter === 'erros') return !r.acertou;
                if (reviewFilter === 'acertos') return r.acertou;
                return true;
              })
              .map((r) => (
                <div
                  key={r.slug}
                  className={cn(
                    'rounded-2xl border p-4',
                    r.acertou
                      ? 'border-emerald-500/20 bg-emerald-950/30'
                      : 'border-rose-500/20 bg-rose-950/20',
                  )}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span>{r.acertou ? '✅' : '❌'}</span>
                    <span className="text-slate-500">#{r.ordem}</span>
                    <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                      {manifest.banca}
                    </span>
                    <span
                      className={cn(
                        'ml-auto font-bold',
                        r.acertou ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      {r.acertou ? 'Acertou' : 'Errou'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-200">{r.eixo}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Sua resposta: <span className="font-bold text-white">{r.opcaoId || '—'}</span>
                    {' · '}
                    Gabarito:{' '}
                    <span className={r.acertou ? 'text-emerald-400' : 'text-rose-400'}>
                      {r.opcaoCorretaId}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => openEstudo(r.slug)}
                    className="mt-3 flex items-center gap-1 text-sm font-semibold text-cyan-400"
                  >
                    Revisar no estudo reverso
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={ctaHref}
              className="flex w-full items-center justify-center rounded-2xl bg-[#BEF264] py-4 text-sm font-black uppercase tracking-widest text-slate-950"
            >
              Garantir acesso AVANT Enf
            </Link>
            <button
              type="button"
              onClick={() => setPhase('result')}
              className="w-full rounded-2xl border border-white/10 py-3 text-sm text-slate-400"
            >
              ← Voltar ao resultado
            </button>
          </div>
        </div>
      )}

      {/* Bottom brand bar on intro/result/review */}
      {phase !== 'question' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-white/10 bg-[#0f0f1a] px-4 py-3 pb-safe">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-xs">
              ⚡
            </div>
            <span className="text-sm font-black text-white">AVANT Enf</span>
          </div>
          <Link href={ctaHref} className="rounded-full bg-[#BEF264] px-4 py-1.5 text-xs font-black text-slate-950">
            Campina Grande →
          </Link>
        </div>
      )}
    </div>
  );
}
