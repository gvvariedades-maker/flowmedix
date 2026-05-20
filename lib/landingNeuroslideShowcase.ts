/**
 * Prints reais dos NeuroSlides (estudo reverso) — usados na landing.
 * Fonte: capturas do player em `public/images/neuroslide-*.jpg` e `public/images/landing/`.
 */
export type LandingNeuroslideShowcaseItem = {
  tipo: string;
  badgeColor: string;
  titulo: string;
  src: string;
  alt: string;
};

export const LANDING_NEUROSLIDE_SHOWCASE: LandingNeuroslideShowcaseItem[] = [
  {
    tipo: 'Mapa de Conceitos',
    badgeColor: 'bg-cyan-400/20 text-cyan-300',
    titulo: 'Estrutura molecular do conceito (BCG)',
    src: '/images/neuroslide-concept-map.jpg',
    alt: 'NeuroSlide mapa de conceitos com quatro eixos em círculos no player AVANT',
  },
  {
    tipo: 'Regra de Ouro',
    badgeColor: 'bg-amber-400/20 text-amber-300',
    titulo: 'Frase-chave para levar na prova (APS)',
    src: '/images/neuroslide-golden-rule.jpg',
    alt: 'NeuroSlide regra de ouro com mnemônico em destaque no player AVANT',
  },
  {
    tipo: 'Zona de Perigo',
    badgeColor: 'bg-red-400/20 text-red-300',
    titulo: 'Pegadinhas numeradas (vacina BCG)',
    src: '/images/neuroslide-danger-zone.jpg',
    alt: 'NeuroSlide zona de perigo listando erros comuns no player AVANT',
  },
  {
    tipo: 'Fluxo Lógico',
    badgeColor: 'bg-violet-400/20 text-violet-300',
    titulo: 'Pipeline cognitivo passo a passo',
    src: '/images/neuroslide-logic-flow.jpg',
    alt: 'NeuroSlide fluxo lógico com pipeline de decisão no player AVANT',
  },
  {
    tipo: 'Arena Versus',
    badgeColor: 'bg-fuchsia-400/20 text-fuchsia-300',
    titulo: 'Assepsia vs. Antissepsia',
    src: '/images/landing/neuroslide-showcase-versus.jpg',
    alt: 'NeuroSlide arena versus com dois conceitos lado a lado no player AVANT',
  },
  {
    tipo: 'Scanner Silábico',
    badgeColor: 'bg-lime-400/20 text-lime-300',
    titulo: 'Memorização por sílabas e regra',
    src: '/images/landing/neuroslide-showcase-scanner.jpg',
    alt: 'NeuroSlide scanner silábico com sílaba tônica destacada no player AVANT',
  },
];
