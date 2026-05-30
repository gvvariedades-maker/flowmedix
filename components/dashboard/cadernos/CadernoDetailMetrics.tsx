import { BookOpen, Brain } from 'lucide-react';
import type { NotebookProgressStats } from '@/lib/cache';

type Props = {
  stats: NotebookProgressStats;
};

export default function CadernoDetailMetrics({ stats }: Props) {
  if (stats.totalQuestions === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-bold text-slate-300 backdrop-blur-xl">
        <BookOpen size={12} aria-hidden />
        {stats.answeredQuestions}/{stats.totalQuestions} questões respondidas
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-bold text-[#00f2ff] backdrop-blur-xl">
        <Brain size={12} aria-hidden />
        {stats.reversoCompleted}/{stats.totalQuestions} com estudo reverso concluído
      </span>
    </div>
  );
}
