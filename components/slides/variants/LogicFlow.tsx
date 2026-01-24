'use client';

import { motion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';

interface LogicFlowProps {
  steps: string[];
  theme: ThemeColors;
}

// ============================================================================
// LOGIC FLOW: Passo a passo com tema dinâmico e centralização
// ============================================================================
export const LogicFlow = ({ steps, theme }: LogicFlowProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar relative">
      {/* Background com tema */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
      
      <div className="w-full max-w-2xl space-y-3 relative z-10">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-sm border ${theme.borderColor} transition-all duration-300 hover:bg-slate-900/60`}
          >
            {/* Número com gradiente do tema e glow */}
            <div 
              className={`flex-shrink-0 w-8 h-8 rounded-full text-slate-900 flex items-center justify-center font-black bg-gradient-to-br ${theme.primary} shadow-lg`}
              style={{ boxShadow: `0 0 15px ${theme.glow}` }}
            >
              {i + 1}
            </div>
            <p className={`${theme.textPrimary} text-sm md:text-base font-medium flex-1`}>
              {step}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
