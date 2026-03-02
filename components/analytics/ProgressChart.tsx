'use client';

/**
 * Componente de Gráfico de Progresso Temporal
 * 
 * Mostra evolução de acertos/erros ao longo do tempo
 */

import { motion } from 'framer-motion';
import type { TimeSeriesData } from '@/lib/analytics';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProgressChartProps {
  data: TimeSeriesData[];
  height?: number;
}

export default function ProgressChart({ data, height = 200 }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-slate-900/50 rounded-lg border border-white/10">
        <p className="text-sm text-slate-400">Sem dados para exibir</p>
      </div>
    );
  }

  // Calcular valores máximos para escala
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const maxPercentual = Math.max(...data.map((d) => d.percentual), 100);

  // Calcular tendência geral
  const recent = data.slice(-7);
  const older = data.slice(0, Math.max(0, data.length - 7));
  const recentAvg = recent.reduce((sum, d) => sum + d.percentual, 0) / recent.length;
  const olderAvg = older.length > 0 
    ? older.reduce((sum, d) => sum + d.percentual, 0) / older.length 
    : recentAvg;
  
  const trend = recentAvg > olderAvg + 5 ? 'up' : recentAvg < olderAvg - 5 ? 'down' : 'stable';

  return (
    <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Progresso Temporal</h3>
          <p className="text-sm text-slate-400">Últimos {data.length} dias</p>
        </div>
        <div className="flex items-center gap-2">
          {trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="w-5 h-5 text-rose-400" />}
          {trend === 'stable' && <Minus className="w-5 h-5 text-slate-400" />}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-emerald-400' : 
            trend === 'down' ? 'text-rose-400' : 
            'text-slate-400'
          }`}>
            {trend === 'up' ? 'Melhorando' : trend === 'down' ? 'Piorando' : 'Estável'}
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={(height * (100 - percent)) / 100}
              x2="100%"
              y2={(height * (100 - percent)) / 100}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Linha de percentual */}
          <motion.polyline
            points={data
              .map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100;
                const y = height - (d.percentual / 100) * height;
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Gradiente */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>

          {/* Pontos */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = height - (d.percentual / 100) * height;
            return (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy={y}
                r="4"
                fill="#00f2ff"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02 }}
              />
            );
          })}
        </svg>

        {/* Labels do eixo X (datas) */}
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          {data
            .filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1)
            .map((d, i) => (
              <span key={i}>
                {new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </span>
            ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400"></div>
          <span className="text-xs text-slate-400">Média: {Math.round(recentAvg)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400/20 border border-cyan-400"></div>
          <span className="text-xs text-slate-400">Máximo: {maxPercentual}%</span>
        </div>
      </div>
    </div>
  );
}
