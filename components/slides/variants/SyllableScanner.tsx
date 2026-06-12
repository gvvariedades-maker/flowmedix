'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

// ============================================================================
// INTERFACES
// ============================================================================
export interface SyllableScannerProps {
  word: string; // Ex: "en-to-mo-ló-gi-cas"
  tonicIndex: number; // Índice da sílaba tônica (base 0)
  rule: string;
  theme: ThemeColors;
}

// ============================================================================
// SYLLABLE SCANNER: Scanner com tema dinâmico
// ============================================================================
export const SyllableScanner: React.FC<SyllableScannerProps> = ({ word, tonicIndex, rule, theme }) => {
  const syllables = word.split('-');
  
  // Variantes para animação de cascata
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-full min-h-full min-w-0 flex items-center justify-center p-4 md:p-8 relative">
      {/* Background com tema */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative z-10 mx-auto my-auto w-full max-w-3xl rounded-[1.5rem] border bg-white p-6 shadow-sm md:rounded-[2.5rem] md:p-10 lg:p-12 ${theme.borderColor}`}
      >
        <div className={`mb-10 flex items-center gap-3 ${theme.textPrimary}`}>
          <Zap size={24} className="shrink-0 animate-pulse" />
          <span className="text-sm font-black uppercase tracking-[0.3em] md:text-xs">Scanner de Acentuação</span>
        </div>

        {/* Sílabas */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {syllables.map((syl, index) => {
            const isTonic = index === tonicIndex;
            
            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ scale: 1.1 }}
                className={`
                  relative rounded-2xl px-6 py-4 text-2xl font-black transition-all duration-500
                  md:px-8 md:py-5 md:text-3xl
                  ${isTonic 
                    ? `border-2 ${theme.borderColor} ${theme.iconBg} ${theme.iconText}` 
                    : 'border border-slate-200 bg-slate-100 text-slate-400'}
                `}
              >
                {syl.toUpperCase()}
                {isTonic && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm font-black whitespace-nowrap md:text-[11px] ${theme.textSecondary}`}
                  >
                    TÔNICA
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Resultado */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className={`flex items-start gap-4 rounded-2xl border bg-slate-50 p-6 ${theme.borderColor}`}
        >
          <div className={`rounded-xl p-3 ${theme.iconBg} ${theme.iconText}`}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h4 className={`mb-2 text-xl font-black md:text-lg ${theme.textPrimary}`}>Diagnóstico Final</h4>
            <p className={`text-base leading-relaxed md:text-sm ${theme.textSecondary}`}>
              A sílaba forte é a <span className={`${theme.textPrimary} font-black`}>antepenúltima</span>. 
              Regra: <span className={`font-semibold italic ${theme.textPrimary}`}>{rule}</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
