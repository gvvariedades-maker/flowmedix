'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

interface DangerZoneProps {
  content: string;
  theme: ThemeColors;
}

// ============================================================================
// DANGER ZONE: Pegadinhas com tema dinâmico
// ============================================================================
export const DangerZone = ({ content, theme }: DangerZoneProps) => (
  <div className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden">
    {/* Background com tema (mantém vermelho para danger) */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-slate-900/90 to-red-950/90" />
    
    <motion.div 
      initial={{ x: -50, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className={`relative z-10 w-full max-w-3xl p-10 md:p-12 rounded-3xl border-l-8 border-red-500 shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)] backdrop-blur-xl`}
    >
      {/* Ícone de alerta animado */}
      <motion.div 
        className="absolute top-6 right-6 opacity-20"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AlertTriangle size={140} className="text-red-500" />
      </motion.div>
      
      <div className="relative z-10">
        <motion.h3 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-red-400 font-black flex items-center gap-3 mb-6 text-xl md:text-2xl"
        >
          <AlertTriangle size={28} className="animate-pulse" /> 
          CUIDADO COM A PEGADINHA
        </motion.h3>
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-3xl text-slate-100 font-bold leading-relaxed"
        >
          {content}
        </motion.p>
      </div>
    </motion.div>
  </div>
);
