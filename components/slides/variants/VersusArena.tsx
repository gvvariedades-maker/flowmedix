'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

interface SideProps {
  title: string;
  points: string[];
  icon?: string;
}

interface VersusArenaProps {
  concept_a: SideProps;
  concept_b: SideProps;
  theme: ThemeColors;
}

// Helper para obter ícone dinamicamente
const getIcon = (iconName?: string, fallback: React.ComponentType<{ size?: number }> = Shield) => {
  if (!iconName) return fallback;
  const IconName = iconName as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[IconName];
  return (IconComponent && typeof IconComponent === 'function') 
    ? (IconComponent as React.ComponentType<{ size?: number }>)
    : fallback;
};

export const VersusArena = ({ concept_a, concept_b, theme }: VersusArenaProps) => {
  
  // Animação dos Pontos
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { x: -10, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  const IconA = getIcon(concept_a.icon, Shield);
  const IconB = getIcon(concept_b.icon, AlertCircle);

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative overflow-hidden bg-slate-950">
      
      {/* BACKGROUND SPLIT */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />
      
      {/* LADO A (Esquerda) */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="flex-1 p-6 md:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative bg-gradient-to-r from-slate-900/80 to-transparent backdrop-blur-sm"
      >
        <div className="relative z-10 max-w-md mx-auto md:ml-auto md:mr-10">
          <div className={`inline-flex items-center justify-center p-3 rounded-xl ${theme.iconBg} ${theme.iconText} mb-4 shadow-lg`}>
            <IconA size={24} />
          </div>
          <h3 className={`text-2xl md:text-3xl font-[1000] uppercase italic tracking-tighter ${theme.textPrimary} mb-6`}>
            {concept_a.title}
          </h3>
          <motion.ul variants={container} initial="hidden" animate="show" className="space-y-3">
            {concept_a.points.map((point, i) => (
              <motion.li key={i} variants={item} className="flex items-start gap-3 text-sm md:text-base text-slate-300">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${theme.iconBg}`} />
                <span>{point}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* ELEMENTO CENTRAL "VS" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${theme.borderColor} bg-slate-900 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden`}
        >
           {/* Efeito Radar no VS */}
           <div className={`absolute inset-0 bg-gradient-to-t ${theme.primary} opacity-20 animate-spin-slow`} />
           <Swords className={theme.textPrimary} size={32} />
        </motion.div>
        <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 font-black text-xs ${theme.textSecondary} tracking-[0.3em] uppercase whitespace-nowrap`}>
          Versus
        </div>
      </div>

      {/* LADO B (Direita) */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="flex-1 p-6 md:p-10 flex flex-col justify-center relative bg-gradient-to-l from-slate-900/80 to-transparent backdrop-blur-sm"
      >
        <div className="relative z-10 max-w-md mx-auto md:mr-auto md:ml-10">
          {/* Ícone alinhado à direita no mobile, à esquerda no desktop */}
          <div className="flex justify-end md:justify-start mb-4">
            <div className={`inline-flex items-center justify-center p-3 rounded-xl ${theme.iconBg} ${theme.iconText} shadow-lg`}>
              <IconB size={24} />
            </div>
          </div>
          
          {/* Título alinhado à direita no mobile, à esquerda no desktop */}
          <h3 className={`text-2xl md:text-3xl font-[1000] uppercase italic tracking-tighter ${theme.textPrimary} mb-6 text-right md:text-left`}>
            {concept_b.title}
          </h3>
          
          {/* Lista de pontos */}
          <motion.ul variants={container} initial="hidden" animate="show" className="space-y-3">
            {concept_b.points.map((point, i) => (
              <motion.li 
                key={i} 
                variants={item} 
                className={`flex items-start gap-3 text-sm md:text-base ${theme.textSecondary} justify-end md:justify-start`}
              >
                {/* No mobile: texto primeiro, depois bullet */}
                {/* No desktop: bullet primeiro, depois texto */}
                <span className="md:hidden order-2">{point}</span>
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${theme.iconBg} order-1 md:order-none`} />
                <span className="hidden md:block">{point}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

    </div>
  );
};
