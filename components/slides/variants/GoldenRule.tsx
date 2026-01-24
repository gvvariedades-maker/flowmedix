'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

interface GoldenRuleProps {
  content: string;
  theme: ThemeColors;
}

// ============================================================================
// GOLDEN RULE: Tipografia gigante com tema dinâmico
// ============================================================================
export const GoldenRule = ({ content, theme }: GoldenRuleProps) => (
  <div className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden">
    {/* Background com tema */}
    <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
    
    <motion.div 
      initial={{ scale: 0.85, opacity: 0, rotateY: -15 }} 
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative z-10 w-full max-w-4xl p-12 md:p-16 rounded-[3rem] text-center border-4 ${theme.borderColor} shadow-[0_0_80px_-20px_${theme.glow}] backdrop-blur-sm`}
    >
      {/* Efeito de brilho animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
      
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Sparkles className={`${theme.iconText} w-16 h-16 mx-auto mb-6 drop-shadow-2xl`} />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          {content}
        </motion.h2>
      </div>
    </motion.div>
  </div>
);
