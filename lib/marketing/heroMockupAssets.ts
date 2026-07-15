import { heroCaptureScreenPx } from '@/lib/marketing/heroCaptureDimensions';

/** Bump ao trocar os PNGs em public/mockups/ (invalida cache do next/image). */
export const HERO_MOCKUP_VERSION = 'curativos-lpp-v2-retina';

const laptop = heroCaptureScreenPx('laptop');
const tablet = heroCaptureScreenPx('tablet');
const phone = heroCaptureScreenPx('phone');

export const HERO_MOCKUP_ASSETS = {
  laptop: {
    src: `/mockups/laptop-player.png?v=${HERO_MOCKUP_VERSION}`,
    alt: 'Player AVANT enf no desktop — Curativos e Manejo de Feridas, CPCON UEPB 2025',
    width: laptop.width,
    height: laptop.height,
    objectPosition: 'object-top',
  },
  tablet: {
    src: `/mockups/tablet-neuroslide.png?v=${HERO_MOCKUP_VERSION}`,
    alt: 'NeuroSlide Mapa de Conceitos — Prevenção de LPP, CPCON UEPB',
    width: tablet.width,
    height: tablet.height,
    objectPosition: 'object-top',
  },
  phone: {
    src: `/mockups/phone-questao.png?v=${HERO_MOCKUP_VERSION}`,
    alt: 'Questão mobile AVANT — lesão por pressão, CPCON UEPB 2025',
    width: phone.width,
    height: phone.height,
    objectPosition: 'object-top',
  },
} as const;
