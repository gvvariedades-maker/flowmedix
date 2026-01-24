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

  // VARIANTE 1: GRADE CLÁSSICA (Padrão)
  if (variant === 'grid') {
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
      <div className="w-full h-full flex items-center justify-center p-6 overflow-y-auto custom-scrollbar relative">
        {/* Background animado com tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 w-full max-w-5xl relative z-10"
        >
          {concepts.map((concept, index) => {
            const Icon = getIcon(concept.icon);

            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ scale: 1.03, translateY: -8 }}
                className={`group relative overflow-hidden p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border ${theme.borderColor} shadow-2xl shadow-black/50 transition-all duration-500`}
              >
                {/* Efeito de Glow no Hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${theme.glowGradient} to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-3xl`} />
                
                <div className="relative z-10 flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} ${theme.iconHoverBg} ${theme.iconHoverText} transition-all duration-300 shadow-lg`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className={`font-black ${theme.textPrimary} text-xl tracking-tight mb-2`}>
                      {concept.title}
                    </h4>
                    <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
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
      <div className="w-full h-full flex items-center justify-center p-6 overflow-y-auto custom-scrollbar relative">
        {/* Background animado com tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        
        <div className="flex flex-col items-center justify-center h-full gap-2 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 relative">
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
                  {/* Átomo */}
                  <div 
                    className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center text-center p-2 border-4 ${theme.borderColor} bg-slate-900/90 backdrop-blur-xl shadow-2xl z-10 relative`}
                    style={{ boxShadow: `0 0 30px ${theme.glow}` }}
                  >
                    <div className={`${theme.iconText} mb-1`}>
                      <Icon size={20} />
                    </div>
                    <span className={`font-black text-xs uppercase tracking-widest ${theme.textPrimary}`}>
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
                  <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 text-center text-xs ${theme.textSecondary} opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-2 rounded-lg z-20`}>
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
            className={`mt-8 ${theme.textSecondary} text-sm italic tracking-widest`}
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
      <div className="w-full h-full flex items-center justify-center p-6 overflow-y-auto custom-scrollbar relative">
        {/* Background animado com tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        
        <div className="w-full max-w-3xl flex flex-col gap-4 relative z-10">
          {concepts.map((concept, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center justify-between bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border-l-4 ${theme.borderColor} transition-all duration-300 hover:bg-slate-800/70`}
            >
              <div className={`font-bold ${theme.textPrimary} w-1/3`}>
                {concept.title}
              </div>
              <div className="flex-1 h-px bg-slate-600 relative mx-4">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-[10px] ${theme.textSecondary} uppercase`}>
                  Exige
                </div>
              </div>
              <div className={`${theme.textSecondary} text-sm w-1/3 text-right`}>
                {concept.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback para grid se variante desconhecida
  return null;
};
