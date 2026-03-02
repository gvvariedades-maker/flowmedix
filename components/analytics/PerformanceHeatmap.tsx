'use client';

/**
 * Componente de Heatmap de Desempenho
 * 
 * Visualização de calor mostrando desempenho por tópico/subtópico
 */

import { motion } from 'framer-motion';
import type { TopicPerformance } from '@/lib/analytics';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PerformanceHeatmapProps {
  data: TopicPerformance[];
  maxItems?: number;
}

export default function PerformanceHeatmap({ data, maxItems = 20 }: PerformanceHeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-slate-900/50 rounded-lg border border-white/10">
        <p className="text-sm text-slate-400">Sem dados para exibir</p>
      </div>
    );
  }

  const displayed = data.slice(0, maxItems);
  const maxTotal = Math.max(...displayed.map((d) => d.total), 1);

  // Função para calcular cor baseada no percentual
  const getColor = (percentual: number) => {
    if (percentual >= 90) return 'bg-emerald-500/20 border-emerald-400/50';
    if (percentual >= 70) return 'bg-indigo-500/20 border-indigo-400/50';
    if (percentual >= 50) return 'bg-amber-500/20 border-amber-400/50';
    return 'bg-rose-500/20 border-rose-400/50';
  };

  const getTextColor = (percentual: number) => {
    if (percentual >= 90) return 'text-emerald-400';
    if (percentual >= 70) return 'text-indigo-400';
    if (percentual >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Desempenho por Tópico</h3>
          <p className="text-sm text-slate-400">{data.length} tópicos analisados</p>
        </div>
      </div>

      <div className="space-y-3">
        {displayed.map((item, index) => {
          const widthPercent = (item.total / maxTotal) * 100;
          
          return (
            <motion.div
              key={`${item.topico}-${item.subtopico || 'none'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg border p-4 ${getColor(item.percentual)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.percentual >= 70 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-white">{item.topico}</h4>
                    {item.subtopico && (
                      <p className="text-xs text-slate-400">{item.subtopico}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${getTextColor(item.percentual)}`}>
                    {item.percentual}%
                  </span>
                  <p className="text-xs text-slate-400">
                    {item.acertos}/{item.total}
                  </p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${getColor(item.percentual).split(' ')[0]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentual}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                />
              </div>

              {/* Barra de frequência */}
              <div className="mt-2 relative h-1 bg-slate-800/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400/30"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {item.total} tentativa{item.total !== 1 ? 's' : ''}
              </p>
            </motion.div>
          );
        })}
      </div>

      {data.length > maxItems && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          Mostrando {maxItems} de {data.length} tópicos
        </p>
      )}
    </div>
  );
}
