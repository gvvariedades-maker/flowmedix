import type { MetadataRoute } from 'next';
import { BRAND_NAME, BRAND_SHORT_NAME } from '@/lib/brand/brandName';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} — Estudo Reverso`,
    short_name: BRAND_SHORT_NAME,
    description:
      'Questão real, diagnóstico do erro e NeuroSlides que ensinam exatamente o que você errou. Para Técnicos de Enfermagem.',
    start_url: '/estudar',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF8EF',
    theme_color: '#F45A1F',
    lang: 'pt-BR',
    categories: ['education'],
    icons: [
      {
        src: '/brand/v2.1/app-icon/app-icon-master.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/brand/v2.1/app-icon/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/v2.1/app-icon/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
