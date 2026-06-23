import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Vias de administração — absorção, sítios e técnica.
 * Fonte: COFEN / referência técnica de enfermagem (Potter & Perry, provas CPCON).
 */
export const VIAS_ADMINISTRACAO_COFEN: GuidelineTable = {
  id: 'vias-administracao-cofen',
  snapshot: 'Vias IM, SC, EV — absorção e técnica',
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  entries: [
    {
      id: 'im-absorcao',
      label: 'Via IM — absorção',
      value: 'mais rápida que SC',
      detail: 'Músculo é mais vascularizado que tecido subcutâneo.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'sc-absorcao',
      label: 'Via SC — absorção',
      value: 'mais lenta que IM',
      detail: 'Indicada para medicamentos de absorção gradual (ex.: insulina, heparina).',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'ev-absorcao',
      label: 'Via EV',
      value: 'ação imediata — 100% biodisponível',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'im-ventrogluteo',
      label: 'Sítio IM — ventroglúteo',
      value: 'recomendado e seguro em adultos',
      detail: 'Glúteo médio — afastado do nervo ciático.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'im-deltoide',
      label: 'Sítio IM — deltoide',
      value: 'volume limitado (até 2 mL em adulto)',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'im-vastolateral',
      label: 'Sítio IM — vasto lateral',
      value: 'seguro em lactentes e crianças',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'im-tecnica',
      label: 'Técnica IM',
      value: 'palpar músculo, marcos ósseos, posicionar e minimizar dor',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'im-angulo',
      label: 'Ângulo de punção IM',
      value: '90°',
      detail: 'Agulha perpendicular ao músculo.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'sc-angulo',
      label: 'Ângulo de punção SC',
      value: '45° ou 90° conforme tecido adiposo',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'pegadinha-im-sc',
      label: 'Pegadinha absorção',
      value: 'IM não é mais lenta que SC',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'ev-direta-lenta',
      label: 'EV direta lenta',
      value: 'bolus em 3 a 5 minutos (ou conforme bula)',
      detail: 'Administrar lentamente — reduz risco de reação adversa grave (ex.: fenitoína, vancomicina).',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'vo-jejum',
      label: 'VO em jejum',
      value: '30 min antes ou 2 h após refeição',
      detail: 'Garante absorção previsível — alguns fármacos exigem jejum absoluto (levotiroxina).',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'via-retal',
      label: 'Via retal',
      value: 'absorção irregular — bypass parcial da primeira passagem',
      detail: 'Indicada quando VO inviável (vômito, convulsão); supositórios e enemas medicamentosos.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'via-inalatoria',
      label: 'Via inalatória',
      value: 'ação rápida na mucosa pulmonar',
      detail: 'Broncodilatadores (SABA) e corticoides inalatórios — técnica correta do dispositivo é essencial.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'via-topica',
      label: 'Via tópica',
      value: 'ação local no sítio de aplicação',
      detail: 'Pomadas, cremes e colírios — evitar contaminação do frasco; não é sistêmica de rotina.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'intradermica-teste',
      label: 'Intradérmica — teste',
      value: 'bevel para cima, ângulo 10° a 15°, bolsa pápulo visível',
      detail: 'PPD/tuberculina e testes de alergia — volume 0,1 mL; ler reação em 48 a 72 h.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'sublingual-bypass',
      label: 'Via sublingual',
      value: 'absorção pela mucosa oral — evita primeira passagem hepática',
      detail: 'Nitroglicerina SL: não engolir; efeito em 1 a 3 minutos.',
      sourceId: 'vias-administracao-cofen',
    },
    {
      id: 'vo-com-alimento',
      label: 'VO com alimento',
      value: 'alguns fármacos exigem refeição para reduzir irritação gástrica',
      detail: 'AINEs e metformina — outros (tetraciclinas, quinolonas) não devem ser tomados com laticínios.',
      sourceId: 'vias-administracao-cofen',
    },
  ],
};
