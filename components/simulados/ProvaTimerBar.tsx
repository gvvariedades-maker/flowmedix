'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useProvaElapsed, type UseProvaElapsedInput } from '@/lib/simulado/useProvaElapsed';

type ProvaTimerBarProps = UseProvaElapsedInput;

export function ProvaTimerBar(props: ProvaTimerBarProps) {
  if (!props.provaIniciadaEm) return null;
  return <ProvaTimerBarActive {...props} />;
}

function ProvaTimerBarActive({
  provaIniciadaEm,
  totalQuestoes,
  ritmoMetaSegundosPorQuestao,
}: ProvaTimerBarProps) {
  const { elapsedLabel, metaLabel, passedMeta } = useProvaElapsed({
    provaIniciadaEm,
    totalQuestoes,
    ritmoMetaSegundosPorQuestao,
  });

  const announcedRef = useRef(false);
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    if (passedMeta && !announcedRef.current) {
      announcedRef.current = true;
      setLiveMessage('Tempo acima da meta sugerida');
    }
  }, [passedMeta]);

  return (
    <div
      className={cn(
        'sticky top-0 z-30 border-b bg-[#010409]/95 px-4 py-2.5 backdrop-blur-xl',
        passedMeta ? 'border-amber-500/50' : 'border-white/10',
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 text-sm',
          passedMeta ? 'text-amber-400' : 'text-white/90',
        )}
      >
        <span className="font-mono tabular-nums">
          <span aria-hidden>⏱ </span>
          {elapsedLabel}
        </span>
        <span className={cn('font-mono tabular-nums', passedMeta ? '' : 'text-white/50')}>
          Meta: {metaLabel}
        </span>
      </div>
      {liveMessage ? <span className="sr-only">{liveMessage}</span> : null}
    </div>
  );
}
