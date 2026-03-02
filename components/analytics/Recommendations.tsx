'use client';

/**
 * Componente de Recomendações Inteligentes
 * 
 * Exibe questões recomendadas baseadas em análise de desempenho
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { RecommendedQuestion } from '@/lib/recommendations';
import { 
  Target, 
  AlertTriangle, 
  BookOpen, 
  RotateCcw, 
  Clock,
  ArrowRight 
} from 'lucide-react';

interface RecommendationsProps {
  recommendations: RecommendedQuestion[];
  maxItems?: number;
}

const categoryIcons = {
  weak_area: Target,
  error_pattern: AlertTriangle,
  not_attempted: BookOpen,
  review_needed: RotateCcw,
  spaced_repetition: Clock,
};

const categoryLabels = {
  weak_area: 'Área Fraca',
  error_pattern: 'Padrão de Erro',
  not_attempted: 'Não Tentada',
  review_needed: 'Revisão Necessária',
  spaced_repetition: 'Revisão Espaçada',
};

const categoryColors = {
  weak_area: 'border-rose-400/50 bg-rose-500/10 text-rose-400',
  error_pattern: 'border-amber-400/50 bg-amber-500/10 text-amber-400',
  not_attempted: 'border-cyan-400/50 bg-cyan-500/10 text-cyan-400',
  review_needed: 'border-indigo-400/50 bg-indigo-500/10 text-indigo-400',
  spaced_repetition: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-400',
};

export default function Recommendations({ recommendations, maxItems = 10 }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-slate-900/50 rounded-lg border border-white/10">
        <div className="text-center">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhuma recomendação disponível</p>
        </div>
      </div>
    );
  }

  const displayed = recommendations.slice(0, maxItems);

  return (
    <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Questões Recomendadas</h3>
          <p className="text-sm text-slate-400">
            Baseado na sua análise de desempenho
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {displayed.map((rec, index) => {
          const Icon = categoryIcons[rec.category];
          const colorClass = categoryColors[rec.category];

          return (
            <motion.div
              key={rec.modulo_slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/estudar/${rec.modulo_slug}`}
                className={`block rounded-lg border p-4 transition-all hover:border-white/30 hover:shadow-[0_0_20px_rgba(0,242,255,0.15)] ${colorClass}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        {categoryLabels[rec.category]}
                      </span>
                      <span className="text-xs text-slate-400">
                        Prioridade: {Math.round(rec.priority)}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-white mb-1">
                      {rec.titulo_aula || rec.modulo_slug}
                    </h4>
                    
                    {rec.topico && (
                      <p className="text-xs text-slate-400 mb-2">
                        {rec.topico}
                        {rec.subtopico && ` • ${rec.subtopico}`}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500">{rec.reason}</p>
                  </div>

                  <ArrowRight className="w-5 h-5 ml-4 flex-shrink-0 opacity-50" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {recommendations.length > maxItems && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          Mostrando {maxItems} de {recommendations.length} recomendações
        </p>
      )}
    </div>
  );
}
