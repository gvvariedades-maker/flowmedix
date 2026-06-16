/** Bump ao trocar PNGs em public/images/compare-avant-*.png */
export const COMPARE_AVANT_VERSION = 'mobile-v2';

/** Apenas screenshots mobile (portrait) — 3 tipos de NeuroSlide. */
export const COMPARE_AVANT_SLIDES = [
  {
    src: `/images/compare-avant-1.png?v=${COMPARE_AVANT_VERSION}`,
    alt: 'NeuroSlide Mapa de Conceitos — Imunização, estudo reverso AVANT no celular',
    width: 390,
    height: 844,
    objectPosition: 'object-top',
  },
  {
    src: `/images/compare-avant-2.png?v=${COMPARE_AVANT_VERSION}`,
    alt: 'NeuroSlide Fluxo Lógico — Verificação de Sinais Vitais, estudo reverso AVANT no celular',
    width: 390,
    height: 844,
    objectPosition: 'object-top',
  },
  {
    src: `/images/compare-avant-3.png?v=${COMPARE_AVANT_VERSION}`,
    alt: 'NeuroSlide Zona de Perigo — Oxigenoterapia e Sinais Vitais, estudo reverso AVANT no celular',
    width: 390,
    height: 844,
    objectPosition: 'object-top',
  },
] as const;
