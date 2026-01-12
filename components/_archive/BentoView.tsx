'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

type SlideContent = {
  title: string;
  content: string;
  tip?: string;
};

type NodeData = {
  icon?: string;
  gradient?: string;
  colorStart?: string;
  colorEnd?: string;
  label?: string;
  title?: string;
  menu_content?: SlideContent[];
};

export type FlowNode = {
  id: string;
  data: NodeData;
};

const ModalSlides = ({
  content,
  onClose,
  themeColor = '#2563eb',
}: {
  content: SlideContent[];
  onClose: () => void;
  themeColor?: string;
}) => {
  const [current, setCurrent] = useState(0);
  const Icon = Icons.ChevronRight;

  if (!content || content.length === 0) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-3xl h-[600px] rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative items-center justify-center"
      >
        <div className="text-center p-10">
          <p className="font-bold text-slate-500 text-lg mb-4">
            Nenhum detalhe disponível para este passo.
          </p>
          <button
            onClick={onClose}
            className="text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105"
            style={{ backgroundColor: themeColor }}
          >
            Fechar
          </button>
        </div>
      </motion.div>
    );
  }

  const currentSlide = content[current];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-white w-full max-w-3xl h-[600px] rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative"
    >
      <div className="h-2 bg-slate-100 flex">
        {content.map((_, i) => (
          <div
            key={i}
            className="h-full transition-all duration-500"
            style={{
              width: `${100 / content.length}%`,
              backgroundColor: i <= current ? themeColor : 'transparent',
            }}
          />
        ))}
      </div>

      <div className="p-8 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <span
            className="text-[10px] font-black uppercase tracking-[0.4em]"
            style={{ color: themeColor }}
          >
            Slide {current + 1} de {content.length}
          </span>
          <h3
            className="text-4xl font-black uppercase italic tracking-tighter mt-1"
            style={{ color: themeColor }}
          >
            {currentSlide.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <Icons.X size={24} />
        </button>
      </div>

      <div
        className="flex-1 px-10 overflow-y-auto py-4 custom-scrollbar"
        style={{ background: `linear-gradient(to bottom, ${themeColor}05, transparent)` }}
      >
        <div className="prose prose-slate max-w-none">
          <p className="text-xl text-slate-700 leading-relaxed font-medium">
            {currentSlide.content}
          </p>
        </div>

        {currentSlide.tip && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-8 p-6 rounded-3xl border-l-8 flex gap-4 items-center bg-slate-50"
            style={{ borderColor: themeColor }}
          >
            <div className="text-3xl">💡</div>
            <p className="text-sm font-bold text-slate-600 italic leading-snug">
              {currentSlide.tip}
            </p>
          </motion.div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-50 flex justify-between items-center">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          className={`font-black uppercase tracking-widest text-xs transition-all ${
            current === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          Anterior
        </button>

        <div className="flex gap-4">
          {current === content.length - 1 ? (
            <button
              onClick={onClose}
              className="text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              Concluir Estudo
            </button>
          ) : (
            <button
              onClick={() => setCurrent(current + 1)}
              className="text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              style={{ backgroundColor: themeColor }}
            >
              Próximo <Icon size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const BentoView = ({ nodes }: { nodes?: FlowNode[] }) => {
  const [activeNode, setActiveNode] = useState<FlowNode | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 p-10 overflow-y-auto relative">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 mb-10 uppercase italic tracking-tighter border-l-8 border-blue-600 pl-4">
            Fluxograma
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nodes?.map((node) => {
              const iconName = node.data.icon as keyof typeof Icons;
              const RawIcon = Icons[iconName];
              const IconComponent =
                typeof RawIcon === 'function' ? (RawIcon as React.ComponentType<any>) : Icons.Zap;
              const colorStart = node.data.colorStart || '#2563eb';
              const colorEnd = node.data.colorEnd || '#1e40af';

              return (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveNode(node)}
                  className="relative aspect-square w-full rounded-[3rem] p-8 cursor-pointer overflow-hidden border border-white/30 group transition-all flex flex-col items-center justify-center text-center"
                  style={{
                    background: `linear-gradient(135deg, ${colorStart} 0%, ${colorEnd} 100%)`,
                    boxShadow: `0 25px 50px -12px ${colorStart}66`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent opacity-40 pointer-events-none" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative z-10 p-5 bg-white/20 backdrop-blur-2xl rounded-[2.2rem] mb-6 border border-white/40 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                    <IconComponent className="text-white drop-shadow-lg" size={48} strokeWidth={2.5} />
                  </div>

                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.5em] block">
                      {node.data.label || 'PASSO'}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl px-2">
                      {node.data.title || 'Sem Título'}
                    </h3>
                  </div>

                  <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-12 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <ModalSlides
              content={activeNode.data.menu_content || []}
              onClose={() => setActiveNode(null)}
              themeColor={activeNode.data.colorStart || '#2563eb'}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BentoView;



