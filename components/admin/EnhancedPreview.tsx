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

export function EnhancedPreview({ question, onClose }: EnhancedPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [previewState, setPreviewState] = useState<PreviewState>('question');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Reset quando questão muda
  useEffect(() => {
    setPreviewState('question');
    setSelectedOption(null);
    setCurrentSlide(0);
  }, [question]);

  // Auto-play simulation
  useEffect(() => {
    if (!autoPlay || !question) return;

    const timer = setTimeout(() => {
      if (previewState === 'question' && !selectedOption) {
        // Simula seleção automática
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

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="text-center text-slate-400">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma questão para visualizar</p>
        </div>
      </div>
    );
  }

  const totalSlides = question.reverse_study_slides?.length || 0;

  const handleReset = () => {
    setPreviewState('question');
    setSelectedOption(null);
    setCurrentSlide(0);
  };

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

  return (
    <div 
      ref={previewRef}
      className="relative bg-white rounded-xl border-2 border-slate-200 overflow-hidden flex flex-col h-full min-h-0"
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

      {/* Preview Container */}
      <div
        data-testid="preview-scroll-fallback"
        className={`flex-1 min-h-0 bg-slate-100 p-4 ${
          viewMode === 'mobile'
            ? 'flex items-center justify-center overflow-auto'
            : 'flex flex-col overflow-y-auto overflow-x-hidden'
        }`}
      >
        {/* div simples — motion.div com scale cria stacking context via transform inline
            e pode impedir que o wheel event chegue ao overflow-y-auto interno do player */}
        <div
          className={`rounded-xl shadow-2xl flex flex-col transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'w-[375px] h-[667px] max-h-full shrink-0 overflow-hidden'
              : 'mx-auto w-full h-full max-w-6xl flex-1 min-h-0 overflow-hidden'
          }`}
        >
          <div className="h-full flex-1 min-h-0 flex flex-col" key={JSON.stringify(question)}>
            <AvantLessonPlayer
              dados={question}
              mode="preview"
            />
          </div>
        </div>
      </div>

      {/* Simulação de Interação */}
      {previewState === 'question' && (
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
            <span className="font-medium">Simular Resposta:</span>
            {question.question_data.options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedOption(option.id);
                  setTimeout(() => setPreviewState('answer'), 500);
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedOption === option.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
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
