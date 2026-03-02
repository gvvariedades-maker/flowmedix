'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

interface LogicFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  layoutVariant?: string;
}

// ============================================================================
// PIPELINE COGNITIVO: Estrutura Vertical/Horizontal/Cards com Desbloqueio Sequencial
// layout_variant: vertical | horizontal | cards
// ============================================================================
export const LogicFlow = ({ steps, theme, layoutVariant = 'vertical' }: LogicFlowProps) => {
  const variant = layoutVariant || 'vertical';
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);

  // Normalizar steps: aceita tanto string[] quanto Array<{id, text}>
  const normalizedSteps = useMemo(() => {
    if (!steps || steps.length === 0) return [];
    return steps.map((step) => {
      // Se for string, retorna direto
      if (typeof step === 'string') return step;
      // Se for objeto, extrai o texto
      if (typeof step === 'object' && step !== null && 'text' in step) {
        return step.text;
      }
      // Fallback: converte para string
      return String(step);
    });
  }, [steps]);

  // Revelação sequencial automática
  useEffect(() => {
    // Reset ao mudar de steps
    setRevealedSteps([]);
    
    if (normalizedSteps.length === 0) return;
    
    const revealSequence = async () => {
      for (let i = 0; i < normalizedSteps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setRevealedSteps((prev) => [...prev, i]);
      }
    };
    revealSequence();
    
    // Cleanup ao desmontar ou mudar steps
    return () => {
      setRevealedSteps([]);
    };
  }, [normalizedSteps]);

  if (!normalizedSteps || normalizedSteps.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <p className="text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  const baseBg = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-60`} />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
    </>
  );

  // VARIANTE: HORIZONTAL - Passos em linha com setas
  if (variant === 'horizontal') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto custom-scrollbar relative">
        {baseBg}
        <div className="relative z-10 w-full max-w-6xl flex flex-wrap items-center justify-center gap-2 md:gap-4 py-8">
          {normalizedSteps.map((step, index) => {
            const isRevealed = revealedSteps.includes(index);
            const isLast = index === normalizedSteps.length - 1;
            return (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isRevealed ? 1 : 0.4, scale: isRevealed ? 1 : 0.9 }}
                  transition={{ delay: index * 0.15 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 ${theme.borderColor} bg-slate-900/80 backdrop-blur-xl max-w-[280px]`}
                  style={{ borderColor: isRevealed ? theme.glow : 'rgba(255,255,255,0.1)' }}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-gradient-to-br ${theme.primary} text-slate-900`}>
                    {isRevealed ? <CheckCircle2 size={18} /> : index + 1}
                  </span>
                  <p className={`text-sm font-medium truncate ${isRevealed ? theme.textPrimary : 'text-slate-500'}`}>{step}</p>
                </motion.div>
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isRevealed ? 1 : 0.3 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    <ArrowRight className="w-5 h-5" style={{ color: theme.glow }} />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // VARIANTE: CARDS - Grid de cards
  if (variant === 'cards') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto custom-scrollbar relative">
        {baseBg}
        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
          {normalizedSteps.map((step, index) => {
            const isRevealed = revealedSteps.includes(index);
            const isActive = revealedSteps[revealedSteps.length - 1] === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isRevealed ? 1 : 0.5, y: isRevealed ? 0 : 10 }}
                transition={{ delay: index * 0.2 }}
                className={`rounded-2xl p-5 border-2 ${theme.borderColor} bg-slate-900/80 backdrop-blur-xl transition-all ${
                  isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
                }`}
                style={{
                  borderColor: isRevealed ? theme.glow : 'rgba(255,255,255,0.1)',
                  boxShadow: isRevealed ? `0 0 20px ${theme.glow}40` : 'none',
                  ringColor: theme.glow,
                }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mb-3 bg-gradient-to-br ${theme.primary} text-slate-900`}>
                  {isRevealed ? <CheckCircle2 size={20} /> : index + 1}
                </div>
                <p className={`text-sm font-medium leading-relaxed ${isRevealed ? theme.textPrimary : 'text-slate-500'}`}>{step}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // VARIANTE PADRÃO: VERTICAL - Pipeline conectado
  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 md:p-6 lg:p-12 overflow-y-auto custom-scrollbar relative">
      {/* Background com tema e padrão diagonal */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-60`} />
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`,
        }}
      />

      {/* Container principal do pipeline */}
      <div className="w-full max-w-3xl relative z-10 py-4 md:py-8">
        {/* Título do Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Pipeline Cognitivo
            </span>
          </div>
        </motion.div>

        {/* Pipeline Vertical Conectado */}
        <div className="relative">
          {normalizedSteps.map((step, index) => {
            const isRevealed = revealedSteps.includes(index);
            const isLast = index === normalizedSteps.length - 1;
            const isActive = revealedSteps[revealedSteps.length - 1] === index;

            return (
              <div key={index} className="relative">
                {/* Container do Step */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: isRevealed ? 1 : 0.3,
                    scale: isRevealed ? 1 : 0.8,
                    y: isRevealed ? 0 : 20,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="relative"
                >
                  {/* Step Card */}
                  <motion.div
                    animate={{
                      scale: isActive ? [1, 1.02, 1] : 1,
                      boxShadow: isActive
                        ? [`0 0 20px ${theme.glow}`, `0 0 40px ${theme.glow}`, `0 0 20px ${theme.glow}`]
                        : `0 0 15px ${theme.glow}40`,
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: isActive ? Infinity : 0,
                      repeatDelay: 1,
                    }}
                    className={`
                      relative rounded-2xl p-6 md:p-8
                      bg-slate-900/80 backdrop-blur-xl
                      border-2 ${theme.borderColor}
                      transition-all duration-300
                      ${isRevealed ? 'opacity-100' : 'opacity-30'}
                      ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''}
                    `}
                    style={{
                      borderColor: isRevealed ? theme.glow : 'rgba(255,255,255,0.1)',
                      ringColor: theme.glow,
                    }}
                  >
                    {/* Número do Step com Glow */}
                    <div className="flex items-start gap-4">
                      {/* Badge Numérico */}
                      <motion.div
                        animate={{
                          scale: isRevealed ? 1 : 0.5,
                          rotate: isRevealed ? 0 : 180,
                        }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className={`
                          flex-shrink-0 w-12 h-12 md:w-14 md:h-14
                          rounded-xl flex items-center justify-center
                          font-black text-lg md:text-xl
                          bg-gradient-to-br ${theme.primary}
                          text-slate-900
                          relative
                        `}
                        style={{
                          boxShadow: `0 0 20px ${theme.glow}`,
                        }}
                      >
                        {/* Ícone de Status */}
                        {isRevealed ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1 + 0.4 }}
                          >
                            <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" />
                          </motion.div>
                        ) : (
                          <Circle className="w-6 h-6 md:w-7 md:h-7 opacity-50" />
                        )}
                        
                        {/* Número sobreposto (se não revelado) */}
                        {!isRevealed && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            {index + 1}
                          </span>
                        )}
                      </motion.div>

                      {/* Conteúdo do Step */}
                      <div className="flex-1 pt-1">
                        <motion.p
                          animate={{
                            color: isRevealed ? theme.textPrimary : 'rgba(148, 163, 184, 0.4)',
                          }}
                          className={`
                            text-sm md:text-base lg:text-lg
                            font-medium leading-relaxed
                            ${isRevealed ? theme.textPrimary : 'text-slate-500'}
                            transition-colors duration-300
                          `}
                        >
                          {step}
                        </motion.p>
                      </div>
                    </div>

                    {/* Efeito de Brilho ao Revelar */}
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, ${theme.glow}40 0%, transparent 70%)`,
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Conector Vertical (Linha entre steps) */}
                  {!isLast && (
                    <div className="relative flex justify-center py-2">
                      {/* Linha Estática */}
                      <div
                        className="w-0.5 h-8 bg-gradient-to-b from-slate-700/50 to-transparent"
                        style={{ opacity: isRevealed ? 0.3 : 0.1 }}
                      />

                      {/* Linha Animada (Cresce quando step é revelado) */}
                      {isRevealed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 32, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                          className="absolute w-0.5"
                          style={{
                            background: `linear-gradient(to bottom, ${theme.glow}, transparent)`,
                            boxShadow: `0 0 10px ${theme.glow}`,
                          }}
                        />
                      )}

                      {/* Ícone de Direção */}
                      {isRevealed && (
                        <motion.div
                          initial={{ scale: 0, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.7 }}
                          className="absolute top-1/2 -translate-y-1/2"
                        >
                          <ArrowDown
                            className="w-5 h-5"
                            style={{ color: theme.glow }}
                          />
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Footer com Contador */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: normalizedSteps.length * 0.1 + 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10">
            <span className="text-xs text-slate-400">
              {revealedSteps.length} de {normalizedSteps.length} passos concluídos
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
