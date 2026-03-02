'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Square
} from 'lucide-react';

interface PreviewControlsProps {
  viewMode: 'desktop' | 'mobile';
  previewState: 'question' | 'answer' | 'study';
  currentSlide: number;
  totalSlides: number;
  autoPlay: boolean;
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  onPreviewStateChange: (state: 'question' | 'answer' | 'study') => void;
  onSlideChange: (slide: number) => void;
  onAutoPlayToggle: () => void;
  onReset: () => void;
  onFullscreenToggle: () => void;
  questionMeta?: {
    banca?: string;
    topico?: string;
  };
}

export function PreviewControls({
  viewMode,
  previewState,
  currentSlide,
  totalSlides,
  autoPlay,
  onViewModeChange,
  onPreviewStateChange,
  onSlideChange,
  onAutoPlayToggle,
  onReset,
  onFullscreenToggle,
  questionMeta,
}: PreviewControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    onFullscreenToggle();
  };

  return (
    <>
      {/* Header com Controles */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold text-sm">Preview em Tempo Real</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/20 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('desktop')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'desktop' 
                  ? 'bg-white text-indigo-600' 
                  : 'text-white hover:bg-white/20'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('mobile')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'mobile' 
                  ? 'bg-white text-indigo-600' 
                  : 'text-white hover:bg-white/20'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-play Toggle */}
          <button
            onClick={onAutoPlayToggle}
            className={`p-2 rounded transition-colors ${
              autoPlay 
                ? 'bg-green-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={autoPlay ? 'Pausar Auto-play' : 'Iniciar Auto-play'}
          >
            {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
            title="Resetar Preview"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleFullscreen}
            className="p-2 bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
            title={isFullscreen ? 'Sair de Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? <Square className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Estado e Progresso */}
      <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-xs shrink-0 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Estado:</span>
            <div className="flex gap-1">
              {(['question', 'answer', 'study'] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => onPreviewStateChange(state)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    previewState === state
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {state === 'question' ? 'Pergunta' : state === 'answer' ? 'Gabarito' : 'Estudo'}
                </button>
              ))}
            </div>
          </div>

          {previewState === 'study' && totalSlides > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Slide:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-slate-700 font-medium min-w-[60px] text-center">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button
                  onClick={() => onSlideChange(Math.min(totalSlides - 1, currentSlide + 1))}
                  disabled={currentSlide === totalSlides - 1}
                  className="p-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {questionMeta && (
          <div className="text-slate-500 text-xs">
            {questionMeta.banca} - {questionMeta.topico}
          </div>
        )}
      </div>

      {/* Barra de Progresso de Slides */}
      {previewState === 'study' && totalSlides > 0 && (
        <div className="h-1 bg-slate-200 shrink-0">
          <motion.div
            className="h-full bg-indigo-600"
            initial={false}
            animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </>
  );
}
