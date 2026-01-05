'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

type MenuContentItem = {
  page: number;
  title: string;
  content: string;
  image_url?: string;
  illustration?: string;
  tip?: string;
};

interface InteractiveDeepDiveProps {
  menuContent: MenuContentItem[];
  onClose: () => void;
}

const InteractiveDeepDive = ({ menuContent, onClose }: InteractiveDeepDiveProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = menuContent.length;

  if (totalSlides === 0) return null;

  const nextSlide = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentItem = menuContent[currentIndex];
  const illustrationSrc = currentItem.image_url || currentItem.illustration;

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-white/10 bg-white/95 shadow-2xl">
      <div className="flex h-1 w-full gap-1 bg-slate-200/60">
        {menuContent.map((_, idx) => (
          <div
            key={idx}
            className={`h-full transition-all duration-500 ${idx <= currentIndex ? 'bg-[#10B981]' : 'bg-white/30'}`}
            style={{ width: `${100 / totalSlides}%` }}
          />
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden bg-white p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">{currentItem.title}</h3>
              <span className="text-xs uppercase tracking-[0.6em] text-slate-500">Pág. {currentItem.page}</span>
            </div>
            <p className="text-base leading-relaxed text-slate-700">{currentItem.content}</p>
            {illustrationSrc && (
              <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                <img
                  src={illustrationSrc}
                  alt={currentItem.title}
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>
            )}
            {currentItem.tip && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-inner">
                💡 {currentItem.tip}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-white/80">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            currentIndex === 0
              ? 'cursor-not-allowed border border-slate-200 text-slate-400'
              : 'border border-slate-200 text-slate-700 hover:border-[#0284C7] hover:text-[#0284C7]'
          }`}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <span className="text-xs font-semibold uppercase tracking-[0.6em] text-slate-500">
          {currentIndex + 1} / {totalSlides}
        </span>

        {currentIndex === totalSlides - 1 ? (
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-[#0284C7] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#0369a1]"
          >
            Concluir
            <CheckCircle size={16} />
          </button>
        ) : (
          <button
            onClick={nextSlide}
            className="flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#059669]"
          >
            Próximo
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InteractiveDeepDive;





