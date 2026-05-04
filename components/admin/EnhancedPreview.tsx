'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { PreviewControls } from '@/components/admin/PreviewControls';
import type { QuestaoCompleta } from '@/types/lesson';

interface EnhancedPreviewProps {
  question: QuestaoCompleta | null;
  onClose?: () => void;
}

type ViewMode = 'desktop' | 'mobile';
type PreviewState = 'question' | 'answer' | 'study';

/** Chave estável para remontar o preview quando a questão muda (evita reset via effect). */
function previewQuestionKey(q: QuestaoCompleta): string {
  if (q.id) return q.id;
  const instr = q.question_data.instruction;
  return `${q.meta.banca}|${q.meta.topico}|${q.meta.subtopico ?? ''}|${instr.slice(0, 160)}`;
}

type EnhancedPreviewContentProps = {
  question: QuestaoCompleta;
};

function EnhancedPreviewContent({ question }: EnhancedPreviewContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [previewState, setPreviewState] = useState<PreviewState>('question');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-play simulation
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setTimeout(() => {
      if (previewState === 'question' && !selectedOption) {
        const firstOption = question.question_data.options[0]?.id;
        if (firstOption) {
          setSelectedOption(firstOption);
          setTimeout(() => setPreviewState('answer'), 1000);
        }
      } else if (previewState === 'answer') {
        setTimeout(() => setPreviewState('study'), 1500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoPlay, previewState, selectedOption, question]);

  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;

    const onWheel = (e: WheelEvent) => {
      const scrollEl = root.querySelector('[data-testid="lesson-scroll-body"]') as HTMLDivElement | null;
      const fallbackEl = root.querySelector('[data-testid="preview-scroll-fallback"]') as HTMLDivElement | null;
      const target = scrollEl ?? fallbackEl;

      if (!target) return;

      const LINE_PX = 16;
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= LINE_PX;
      if (e.deltaMode === 2) delta *= target.clientHeight;

      const canScrollDown = delta > 0 && target.scrollTop < target.scrollHeight - target.clientHeight;
      const canScrollUp = delta < 0 && target.scrollTop > 0;

      if (canScrollDown || canScrollUp) {
        target.scrollTop += delta;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    root.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => root.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  const totalSlides = question.reverse_study_slides?.length || 0;

  const handleReset = () => {
    setPreviewState('question');
    setSelectedOption(null);
    setCurrentSlide(0);
  };

  return (
    <div
      ref={previewRef}
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-2 border-slate-200 bg-white"
    >
      <PreviewControls
        viewMode={viewMode}
        previewState={previewState}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        autoPlay={autoPlay}
        onViewModeChange={setViewMode}
        onPreviewStateChange={(state) => {
          setPreviewState(state);
          if (state === 'question') {
            setSelectedOption(null);
          }
        }}
        onSlideChange={setCurrentSlide}
        onAutoPlayToggle={() => setAutoPlay(!autoPlay)}
        onReset={handleReset}
        onFullscreenToggle={() => {}}
        questionMeta={{
          banca: question.meta.banca,
          topico: question.meta.topico,
        }}
      />

      <div
        data-testid="preview-scroll-fallback"
        className={`min-h-0 flex-1 bg-slate-100 p-4 ${
          viewMode === 'mobile'
            ? 'flex items-center justify-center overflow-auto'
            : 'flex flex-col overflow-y-auto overflow-x-hidden'
        }`}
      >
        <div
          className={`flex flex-col rounded-xl shadow-2xl transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'h-[667px] max-h-full w-[375px] shrink-0 overflow-hidden'
              : 'mx-auto h-full w-full max-w-6xl min-h-0 flex-1 overflow-hidden'
          }`}
        >
          <div className="flex h-full min-h-0 flex-1 flex-col" key={JSON.stringify(question)}>
            <AvantLessonPlayer dados={question} mode="preview" />
          </div>
        </div>
      </div>

      {previewState === 'question' && (
        <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-medium">Simular Resposta:</span>
            {question.question_data.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedOption(option.id);
                  setTimeout(() => setPreviewState('answer'), 500);
                }}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  selectedOption === option.id
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.id}
                {option.is_correct && ' ✓'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function EnhancedPreview({ question, onClose }: EnhancedPreviewProps) {
  void onClose;
  if (!question) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-slate-100">
        <div className="text-center text-slate-400">
          <Eye className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p className="text-sm">Nenhuma questão para visualizar</p>
        </div>
      </div>
    );
  }

  return <EnhancedPreviewContent key={previewQuestionKey(question)} question={question} />;
}
