import { BookOpen, Brain } from 'lucide-react';
import { NeonBadge } from '@/components/ui/neon-badge';
import type { NotebookProgressStats } from '@/lib/cache';

type Props = {
  stats: NotebookProgressStats;
};

export default function CadernoDetailMetrics({ stats }: Props) {
  if (stats.totalQuestions === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <NeonBadge variant="neutral" className="gap-1.5 px-3 py-1 text-xs normal-case tracking-normal">
        <BookOpen size={12} aria-hidden />
        {stats.answeredQuestions}/{stats.totalQuestions} respondidas
      </NeonBadge>
      <NeonBadge variant="brand" className="gap-1.5 px-3 py-1 text-xs normal-case tracking-normal">
        <Brain size={12} aria-hidden />
        {stats.reversoCompleted}/{stats.totalQuestions} estudo reverso
      </NeonBadge>
    </div>
  );
}
