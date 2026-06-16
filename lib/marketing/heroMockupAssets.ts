/** Bump ao trocar os PNGs em public/mockups/ (invalida cache do next/image). */
export const HERO_MOCKUP_VERSION = 'curativos-lpp-v1';

export const HERO_MOCKUP_ASSETS = {
  laptop: {
    src: `/mockups/laptop-player.png?v=${HERO_MOCKUP_VERSION}`,
    alt: 'Player AVANT no desktop — Curativos e Manejo de Feridas, CPCON UEPB 2025',
    width: 1440,
    height: 900,
    objectPosition: 'object-top',
  },
  tablet: {
    src: `/mockups/tablet-neuroslide.png?v=${HERO_MOCKUP_VERSION}`,
    alt: 'NeuroSlide Mapa de Conceitos — Prevenção de LPP, CPCON UEPB',
    width: 1280,
    height: 720,
    objectPosition: 'object-top',
  },
  phone: {
    src: `/mockups/phone-questao.png?v=${HERO_MOCKUP_VERSION}`,
    alt: 'Questão mobile AVANT — desbridamento de feridas, AVANÇASP 2024',
    width: 390,
    height: 844,
    objectPosition: 'object-top',
  },
} as const;
