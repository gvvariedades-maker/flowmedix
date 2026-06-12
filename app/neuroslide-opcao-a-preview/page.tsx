import type { Metadata } from 'next';
import OpcaoAPreviewClient from '@/components/slides/preview/opcaoA/OpcaoAPreviewClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Preview NeuroSlides — Opção A',
  description: 'Mock interativo da linguagem visual única (modo foco escuro-suave).',
};

/** Preview interno — comparar Opção A antes de migrar NeuroSlides em produção. */
export default function NeuroslideOpcaoAPreviewPage() {
  return <OpcaoAPreviewClient />;
}
