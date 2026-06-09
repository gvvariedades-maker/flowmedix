import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AVANT — Estudo Reverso',
    short_name: 'AVANT',
    description:
      'Estudo reverso para Técnicos de Enfermagem. Questões reais, NeuroSlides e revisão inteligente.',
    start_url: '/estudar',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#3b49df',
    theme_color: '#3b49df',
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
        src: '/brand/avant-pwa-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
