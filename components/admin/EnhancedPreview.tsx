'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  RotateCcw, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react';
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

  return (
    <div 
      ref={previewRef}
      className="relative bg-white rounded-xl border-2 border-slate-200 overflow-hidden flex flex-col h-full"
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
      <div className="flex-1 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'w-[375px] h-[667px] max-h-full'
              : 'w-full h-full max-w-6xl'
          }`}
        >
          {/* Player - Atualiza quando dados mudam */}
          <div className="h-full" key={JSON.stringify(question)}>
            <AvantLessonPlayer
              dados={question}
              mode="preview"
            />
          </div>
        </motion.div>
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
