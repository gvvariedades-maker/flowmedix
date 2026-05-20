import type { Metadata } from 'next';
import NeuroslideShowcaseCaptureClient from './NeuroslideShowcaseCaptureClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Captura NeuroSlides',
};

/** Página interna para gerar JPGs com `npm run capture:landing-neuroslides`. */
export default function NeuroslideShowcaseCapturePage() {
  return <NeuroslideShowcaseCaptureClient />;
}
