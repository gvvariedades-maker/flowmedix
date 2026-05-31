'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

// ============================================================================
// INTERFACES
// ============================================================================
export interface Concept {
  icon: string;
  title: string;
  description: string;
}

interface ConceptMapProps {
  concepts: Concept[];
  theme: ThemeColors;
  layoutVariant?: string;
}

// ============================================================================
// CONCEPT MAP: Mapa de conceitos com variantes geométricas
// ============================================================================
export const ConceptMap = ({ concepts, theme, layoutVariant }: ConceptMapProps) => {
  const variant = layoutVariant || 'grid';
  
  // Helper para obter ícone
  const getIcon = (iconName: string) => {
    const IconName = iconName as keyof typeof LucideIcons;
    const IconComponent = LucideIcons[IconName];
    return (IconComponent && typeof IconComponent === 'function') 
      ? (IconComponent as React.ComponentType<{ size?: number }>)
      : HelpCircle;
  };

  // VARIANTE 1: GRADE CLÁSSICA (Padrão) - também fallback para variantes desconhecidas
  if (variant === 'grid' || !['molecular', 'bridge', 'stack'].includes(variant)) {
    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
      }
    };

    const item = {
      hidden: { y: 20, opacity: 0 },
      show: { 
        y: 0, 
        opacity: 1
      }
    };

    return (
      <div className="w-full min-h-0 min-w-0 flex flex-1 items-start justify-center overflow-y-auto p-4 md:p-6 relative">
        {/* Background animado com tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 min-[420px]:[grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3 md:gap-5 p-1 md:p-3 w-full max-w-5xl relative z-10"
          style={{ contentVisibility: 'auto' }}
        >
          {concepts.map((concept, index) => {
            const Icon = getIcon(concept.icon);

            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ scale: 1.03, translateY: -8 }}
                className={`group relative overflow-hidden p-4 md:p-5 rounded-3xl bg-slate-900/70 backdrop-blur-xl border ${theme.borderColor} shadow-2xl shadow-black/50 transition-all duration-500`}
              >
                {/* Efeito de Glow no Hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${theme.glowGradient} to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-3xl`} />
                
                <div className="relative z-10 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} ${theme.iconHoverBg} ${theme.iconHoverText} transition-all duration-300 shadow-lg`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className={`font-display font-extrabold tracking-tight ${theme.textPrimary} text-xl mb-2`}>
                      {concept.title}
                    </h4>
                    <p className={`font-body leading-relaxed ${theme.textSecondary} text-base md:text-sm`}>
                      {concept.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }

  // VARIANTE 2: MOLECULAR (Para Morfologia)
  if (variant === 'molecular') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-6 relative">
        {/* Background animado com tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        
        <div className="flex flex-col items-center justify-center min-h-[min(100%,32rem)] w-full gap-2 relative z-10 py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 relative">
            {concepts.map((concept, i) => {
              const Icon = getIcon(concept.icon);
              
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.2, type: 'spring', stiffness: 200 }}
                  className="relative group"
                >
                  {/* Átomo — mobile: mais espaço + quebra de linha para termos longos (ex.: VASOCONSTRIÇÃO) */}
                  <div
                    className={`w-[8.75rem] h-[8.75rem] sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center text-center px-2 py-2 sm:p-2.5 border-4 ${theme.borderColor} bg-slate-900/90 backdrop-blur-xl shadow-2xl z-10 relative overflow-hidden`}
                    style={{ boxShadow: `0 0 30px ${theme.glow}` }}
                  >
                    <div className={`${theme.iconText} mb-0.5 shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <span
                      lang="pt-BR"
                      className={`font-display font-extrabold tracking-tight uppercase ${theme.textPrimary} w-full max-w-[min(100%,6.75rem)] sm:max-w-[7rem] md:max-w-[7.5rem] text-sm leading-tight break-words [overflow-wrap:anywhere] hyphens-auto md:text-[10px] md:leading-snug lg:text-xs`}
                    >
                      {concept.title}
                    </span>
                  </div>
                  
                  {/* Linha de Conexão (exceto no último) */}
                  {i < concepts.length - 1 && (
                    <div 
                      className="hidden md:block absolute top-1/2 left-full w-4 h-1 -translate-y-1/2"
                      style={{ backgroundColor: theme.glow }}
                    />
                  )}
                  
                  {/* Tooltip Description */}
                  <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 text-center font-body text-xs ${theme.textSecondary} opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-2 rounded-lg z-20`}>
                    {concept.description}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: concepts.length * 0.2 }}
            className={`mt-6 font-mono tracking-widest ${theme.textSecondary} text-sm italic`}
          >
            Estrutura Molecular da Palavra
          </motion.p>
        </div>
      </div>
    );
  }

  // VARIANTE 3: BRIDGE (Para Regência)
  if (variant === 'bridge') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-4 md:p-6 relative">
        {/* Background animado com tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        
        <div className="w-full max-w-3xl flex flex-col gap-3 relative z-10">
          {concepts.map((concept, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex flex-col gap-2 md:flex-row md:items-center md:justify-between bg-slate-800/50 backdrop-blur-sm p-3 md:p-4 rounded-xl border-l-4 ${theme.borderColor} transition-all duration-300 hover:bg-slate-800/70`}
            >
              <div className={`font-display font-bold text-xl ${theme.textPrimary} min-w-0 w-full md:w-2/5 md:text-base`}>
                {concept.title}
              </div>
              <div className="hidden md:flex flex-1 h-px bg-slate-600 relative mx-4">
                <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 font-mono text-[10px] uppercase ${theme.textSecondary}`}>
                  Exige
                </span>
              </div>
              <div className={`font-body ${theme.textSecondary} min-w-0 w-full md:w-2/5 md:text-right text-left text-sm`}>
                {concept.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // VARIANTE: STACK - Layout em coluna (poucos itens)
  if (variant === 'stack') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-4 md:p-6 relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
          className="flex flex-col gap-3 w-full max-w-2xl relative z-10 my-auto"
        >
          {concepts.map((concept, index) => {
            const Icon = getIcon(concept.icon);
            return (
              <motion.div
                key={index}
                variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                className={`p-4 md:p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border ${theme.borderColor}`}
              >
                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className={`font-display font-extrabold tracking-tight ${theme.textPrimary} text-xl mb-2 md:text-lg`}>{concept.title}</h4>
                    <p className={`font-body leading-relaxed ${theme.textSecondary} text-base md:text-sm`}>{concept.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }

  return null;
};
