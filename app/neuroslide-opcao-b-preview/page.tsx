import type { Metadata } from 'next';
import OpcaoBPreviewClient from '@/components/slides/preview/opcaoB/OpcaoBPreviewClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Preview NeuroSlides — Opção B',
  description: 'Mock interativo da linguagem visual única 100% clara (editorial).',
};

/** Preview interno — comparar Opção B (light) com A e produção. */
export default function NeuroslideOpcaoBPreviewPage() {
  return <OpcaoBPreviewClient />;
}
