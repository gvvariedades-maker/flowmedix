'use client';

import dynamic from 'next/dynamic';
import type { PreviewProps } from './NeuroVisualShadowPreview';

const Preview = dynamic(
  () =>
    import('./NeuroVisualShadowPreview').then(
      (module) => module.NeuroVisualShadowPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <p className="font-mono text-xs font-bold uppercase tracking-widest">
          Carregando preview isolado…
        </p>
      </main>
    ),
  },
);

export function NeuroVisualShadowPreviewClient(props: PreviewProps) {
  return <Preview {...props} />;
}
