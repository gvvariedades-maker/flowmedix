import {
  buildQuestionProvenanceLine,
  buildQuestionSubjectLine,
} from '@/lib/questionHeader';
import type { LessonMeta } from '@/types/lesson';
import { cn } from '@/lib/utils';

export type QuestionHeaderBlockProps = {
  meta: LessonMeta;
  className?: string;
  subjectClassName?: string;
  provenanceClassName?: string;
};

/**
 * Cabeçalho canônico da questão: disciplina/assunto em destaque + proveniência compacta.
 */
export function QuestionHeaderBlock({
  meta,
  className,
  subjectClassName,
  provenanceClassName,
}: QuestionHeaderBlockProps) {
  const subjectLine = buildQuestionSubjectLine(meta);
  const provenanceLine = buildQuestionProvenanceLine(meta);

  if (!subjectLine && !provenanceLine) return null;

  return (
    <div className={className}>
      {subjectLine ? (
        <p
          className={cn(
            'border-l-4 border-[var(--color-brand)] pl-3 text-base font-bold leading-snug text-slate-900 md:text-lg',
            subjectClassName,
          )}
        >
          {subjectLine}
        </p>
      ) : null}
      {provenanceLine ? (
        <p
          className={cn(
            'text-sm font-medium leading-snug text-slate-500 md:text-base',
            subjectLine ? 'mt-2' : '',
            provenanceClassName,
          )}
        >
          {provenanceLine}
        </p>
      ) : null}
    </div>
  );
}
