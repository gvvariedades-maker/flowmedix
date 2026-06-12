'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SLIDE_CARD } from '../core/slideSurface';

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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const isExpanded = useCallback((index: number) => expandedIndex === index, [expandedIndex]);

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
      <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
        {/* Background animado com tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-60`} />
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 grid w-full flex-1 grid-cols-1 gap-3 p-1 md:gap-5 md:p-3 min-[420px]:[grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]"
          style={{ contentVisibility: 'auto' }}
        >
          {concepts.map((concept, index) => {
            const Icon = getIcon(concept.icon);
            const expanded = isExpanded(index);

            return (
              <motion.button
                key={index}
                type="button"
                variants={item}
                layout
                whileHover={{ scale: 1.01, translateY: -2 }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`group relative overflow-hidden p-4 text-left md:p-5 ${SLIDE_CARD} ${theme.borderColor} ${
                  expanded ? 'ring-2 ring-[#22c55e]/30' : ''
                }`}
              >
                <div className="relative z-10 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} ${theme.iconHoverBg} ${theme.iconHoverText} transition-all duration-300`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className={`font-body font-bold tracking-normal ${theme.textPrimary} text-xl mb-2`}>
                      {concept.title}
                    </h4>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={expanded ? 'open' : 'closed'}
                        initial={{ opacity: 0.85 }}
                        animate={{ opacity: 1 }}
                        className={`font-body leading-relaxed ${theme.textSecondary} text-base md:text-sm ${
                          expanded ? '' : 'line-clamp-2 md:line-clamp-3'
                        }`}
                      >
                        {concept.description}
                      </motion.p>
                    </AnimatePresence>
                    {!expanded && concept.description.length > 72 ? (
                      <span className={`mt-1 inline-block font-mono text-[10px] uppercase tracking-widest ${theme.textSecondary}`}>
                        Toque para expandir
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.button>
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
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-60`} />
        
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
                    className={`w-[8.75rem] h-[8.75rem] sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center text-center px-2 py-2 sm:p-2.5 border-4 ${theme.borderColor} bg-white shadow-sm z-10 relative overflow-hidden`}
                  >
                    <div className={`${theme.iconText} mb-0.5 shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <span
                      lang="pt-BR"
                      className={`font-body font-bold tracking-normal ${theme.textPrimary} w-full max-w-[min(100%,6.75rem)] sm:max-w-[7rem] md:max-w-[7.5rem] text-sm leading-tight break-words [overflow-wrap:anywhere] hyphens-auto md:text-[10px] md:leading-snug lg:text-xs`}
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
                  
                  {/* Tooltip Description — apenas desktop (hover); no mobile usamos lista estatica abaixo */}
                  <div className={`hidden md:block absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 text-center font-body text-xs ${theme.textSecondary} opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 bg-white shadow-md p-2 rounded-lg z-20`}>
                    {concept.description}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Descricoes acessiveis no mobile (sem hover) */}
          {concepts.some((c) => c.description) && (
            <div className="md:hidden mt-4 w-full max-w-md space-y-2">
              {concepts.map((concept, i) =>
                concept.description ? (
                  <div
                    key={i}
                    className={`rounded-lg border ${theme.borderColor} bg-white px-3 py-2 shadow-sm`}
                  >
                    <span className={`font-body text-sm font-bold ${theme.textPrimary}`}>
                      {concept.title}:{' '}
                    </span>
                    <span className={`font-body text-sm ${theme.textSecondary}`}>
                      {concept.description}
                    </span>
                  </div>
                ) : null,
              )}
            </div>
          )}
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
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-60`} />
        
        <div className="w-full max-w-3xl flex flex-col gap-3 relative z-10">
          {concepts.map((concept, i) => {
            const expanded = isExpanded(i);
            return (
              <motion.button
                key={i}
                type="button"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                onClick={() => toggleExpanded(i)}
                aria-expanded={expanded}
                className={`flex w-full flex-col gap-2 rounded-xl border border-slate-200 border-l-4 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:bg-slate-50 md:flex-row md:items-center md:justify-between md:p-4 ${theme.borderColor} ${
                  expanded ? 'ring-2 ring-[#22c55e]/30' : ''
                }`}
              >
                <div className={`font-body min-w-0 w-full font-bold tracking-normal text-xl ${theme.textPrimary} md:w-2/5 md:text-base`}>
                  {concept.title}
                </div>
                <div className="relative mx-4 hidden h-px flex-1 bg-slate-200 md:flex">
                  <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 font-mono text-[10px] uppercase ${theme.textSecondary}`}>
                    Exige
                  </span>
                </div>
                <div className={`font-body min-w-0 w-full text-left text-sm ${theme.textSecondary} md:w-2/5 md:text-right ${expanded ? '' : 'line-clamp-2'}`}>
                  {concept.description}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // VARIANTE: STACK - Layout em coluna (poucos itens)
  if (variant === 'stack') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-4 md:p-6 relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-60`} />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
          className="flex flex-col gap-3 w-full max-w-2xl relative z-10 my-auto"
        >
          {concepts.map((concept, index) => {
            const Icon = getIcon(concept.icon);
            const expanded = isExpanded(index);
            return (
              <motion.button
                key={index}
                type="button"
                layout
                variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`p-4 text-left md:p-5 ${SLIDE_CARD} ${theme.borderColor} ${
                  expanded ? 'ring-2 ring-[#22c55e]/30' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText}`}>
                    <Icon size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-body font-bold tracking-normal ${theme.textPrimary} text-xl mb-2 md:text-lg`}>{concept.title}</h4>
                    <p className={`font-body leading-relaxed ${theme.textSecondary} text-base md:text-sm ${expanded ? '' : 'line-clamp-2'}`}>
                      {concept.description}
                    </p>
                    {!expanded && concept.description.length > 72 ? (
                      <span className={`mt-1 inline-block font-mono text-[10px] uppercase tracking-widest ${theme.textSecondary}`}>
                        Toque para expandir
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    );
  }

  return null;
};
