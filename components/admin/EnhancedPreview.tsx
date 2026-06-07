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
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-play simulation (controles externos — fluxo principal é pelo player)
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setTimeout(() => {
      if (previewState === 'question') {
        setPreviewState('answer');
      } else if (previewState === 'answer') {
        setPreviewState('study');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoPlay, previewState]);

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
    setCurrentSlide(0);
  };

  return (
    <div
      ref={previewRef}
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0d1117]"
    >
      <PreviewControls
        viewMode={viewMode}
        previewState={previewState}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        autoPlay={autoPlay}
        onViewModeChange={setViewMode}
        onPreviewStateChange={setPreviewState}
        onSlideChange={setCurrentSlide}
        onAutoPlayToggle={() => setAutoPlay(!autoPlay)}
        onReset={handleReset}
        onFullscreenToggle={() => {}}
        fullscreenTargetRef={previewRef}
        questionMeta={{
          banca: question.meta.banca,
          topico: question.meta.topico,
        }}
      />

      <div
        data-testid="preview-scroll-fallback"
        className={
          viewMode === 'mobile'
            ? 'flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-900/40 p-3'
            : 'flex min-h-0 h-0 flex-1 flex-col overflow-hidden bg-[#0d1117]'
        }
      >
        <div
          className={
            viewMode === 'mobile'
              ? 'h-[min(780px,100%)] w-[min(390px,100%)] shrink-0 overflow-hidden rounded-[2rem] shadow-2xl'
              : 'flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden'
          }
        >
          <div className="flex h-full min-h-0 flex-1 flex-col" key={previewQuestionKey(question)}>
            <AvantLessonPlayer
              dados={question}
              mode="preview"
              previewImmersive={viewMode === 'desktop'}
            />
          </div>
        </div>
      </div>
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
