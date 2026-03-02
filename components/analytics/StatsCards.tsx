'use client';

/**
 * Componente de Cards de Estatísticas
 * 
 * Exibe métricas principais de desempenho
 */

import { motion } from 'framer-motion';
import type { PerformanceStats } from '@/lib/analytics';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Flame 
} from 'lucide-react';

interface StatsCardsProps {
  stats: PerformanceStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total de Tentativas',
      value: stats.total,
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-400/50',
    },
    {
      label: 'Acertos',
      value: stats.acertos,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-400/50',
    },
    {
      label: 'Erros',
      value: stats.erros,
      icon: XCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-400/50',
    },
    {
      label: 'Taxa de Acerto',
      value: `${stats.percentual}%`,
      icon: TrendingUp,
      color: stats.percentual >= 70 ? 'text-emerald-400' : stats.percentual >= 50 ? 'text-amber-400' : 'text-rose-400',
      bgColor: stats.percentual >= 70 ? 'bg-emerald-500/10' : stats.percentual >= 50 ? 'bg-amber-500/10' : 'bg-rose-500/10',
      borderColor: stats.percentual >= 70 ? 'border-emerald-400/50' : stats.percentual >= 50 ? 'border-amber-400/50' : 'border-rose-400/50',
    },
    {
      label: 'Sequência de Acertos',
      value: stats.streak,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-400/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border p-4 ${card.bgColor} ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
            <p className="text-xs text-slate-400">{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
