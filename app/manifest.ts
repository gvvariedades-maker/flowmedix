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
    background_color: '#2563eb',
    theme_color: '#2563eb',
    lang: 'pt-BR',
    categories: ['education'],
    icons: [
      {
        src: '/brand/avant-pwa-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/avant-pwa-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
