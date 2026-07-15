import type { MetadataRoute } from 'next';
import { BRAND_NAME, BRAND_SHORT_NAME } from '@/lib/brand/brandName';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} — Estudo Reverso`,
    short_name: BRAND_SHORT_NAME,
    description:
      'Estudo reverso para Técnicos de Enfermagem. Questões reais, NeuroSlides e revisão inteligente.',
    start_url: '/estudar',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f1f5f9',
    theme_color: '#f1f5f9',
    lang: 'pt-BR',
    categories: ['education'],
    icons: [
      {
        src: '/brand/avant-app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/brand/avant-pwa-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/avant-pwa-icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
