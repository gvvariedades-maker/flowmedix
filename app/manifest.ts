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
    background_color: '#010409',
    theme_color: '#010409',
    lang: 'pt-BR',
    categories: ['education'],
    icons: [
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/brand/avant-app-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
