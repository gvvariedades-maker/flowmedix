'use client';

/**
 * Componente de Análise de Padrões de Erro
 * 
 * Identifica e exibe padrões de erro do usuário
 */

import { motion } from 'framer-motion';
import type { ErrorPattern } from '@/lib/analytics';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ErrorPatternsProps {
  patterns: ErrorPattern[];
}

export default function ErrorPatterns({ patterns }: ErrorPatternsProps) {
  if (patterns.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-slate-900/50 rounded-lg border border-white/10">
        <div className="text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhum padrão de erro identificado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-5 h-5 text-rose-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Padrões de Erro</h3>
          <p className="text-sm text-slate-400">{patterns.length} padrão(ões) identificado(s)</p>
        </div>
      </div>

      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <motion.div
            key={`${pattern.topico}-${pattern.subtopico || 'none'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white mb-1">{pattern.topico}</h4>
                {pattern.subtopico && (
                  <p className="text-xs text-slate-400 mb-2">{pattern.subtopico}</p>
                )}
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-2xl font-bold text-rose-400">
                      {pattern.errorRate}%
                    </span>
                    <p className="text-xs text-slate-400">Taxa de erro</p>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-white">
                      {pattern.totalAttempts}
                    </span>
                    <p className="text-xs text-slate-400">Tentativas</p>
                  </div>
                </div>
              </div>

              {/* Indicador de tendência */}
              <div className="flex flex-col items-center gap-1">
                {pattern.trend === 'improving' && (
                  <>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Melhorando</span>
                  </>
                )}
                {pattern.trend === 'worsening' && (
                  <>
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    <span className="text-xs text-rose-400">Piorando</span>
                  </>
                )}
                {pattern.trend === 'stable' && (
                  <>
                    <Minus className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-400">Estável</span>
                  </>
                )}
              </div>
            </div>

            {/* Barra de erro */}
            <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${pattern.errorRate}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
            </div>

            {pattern.lastError && (
              <p className="text-xs text-slate-500 mt-2">
                Último erro: {new Date(pattern.lastError).toLocaleDateString('pt-BR')}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
