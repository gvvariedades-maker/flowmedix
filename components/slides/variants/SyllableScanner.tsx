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
    <div className="w-full h-full flex items-center justify-center p-8 overflow-y-auto custom-scrollbar relative">
      {/* Background com tema */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative z-10 w-full max-w-3xl mx-auto p-10 md:p-12 bg-slate-900/80 rounded-[2.5rem] border ${theme.borderColor} backdrop-blur-xl shadow-2xl`}
      >
        <div className={`flex items-center gap-3 mb-10 ${theme.textPrimary}`}>
          <Zap size={24} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Scanner de Acentuação</span>
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
                  relative px-8 py-5 rounded-2xl text-3xl font-black transition-all duration-500
                  ${isTonic 
                    ? `bg-gradient-to-br ${theme.primary} text-white shadow-[0_0_40px_-10px_${theme.glow}] border-2 border-white/30` 
                    : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'}
                `}
              >
                {syl.toUpperCase()}
                {isTonic && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] ${theme.textSecondary} whitespace-nowrap font-black`}
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
          className={`bg-gradient-to-br ${theme.secondary}/20 border ${theme.borderColor} p-6 rounded-2xl flex items-start gap-4 backdrop-blur-sm`}
        >
          <div className={`bg-gradient-to-br ${theme.primary} p-3 rounded-xl text-white shadow-lg`}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h4 className={`${theme.textPrimary} font-black mb-2 text-lg`}>Diagnóstico Final</h4>
            <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
              A sílaba forte é a <span className={`${theme.textPrimary} font-black`}>antepenúltima</span>. 
              Regra: <span className="text-white italic">{rule}</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
