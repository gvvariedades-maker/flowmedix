'use client';

import { useMemo } from 'react';
import BentoView, { FlowNode } from '@/components/BentoView';

type FluxogramaViewClientProps = {
  data?: {
    nodes?: FlowNode[];
  };
};

export default function FluxogramaViewClient({ data }: FluxogramaViewClientProps) {
  const nodes = useMemo(() => data?.nodes ?? [], [data]);

  if (!nodes.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <p className="text-lg font-bold uppercase tracking-[0.3em]">Conteúdo em construção</p>
      </div>
    );
  }

  return <BentoView nodes={nodes} />;
}

