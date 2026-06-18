import fs from 'node:fs';
import path from 'node:path';

import {
  hasGenericSlides,
  hasPremiumStubMarkers,
  PREMIUM_STUB_MARKERS,
} from '@/lib/catalogMigration/upgradePremiumHybrid';

const EXAMPLES_DIR = path.join(process.cwd(), 'examples');

function loadPremiumExamples(): { file: string; slides: unknown }[] {
  const files = fs
    .readdirSync(EXAMPLES_DIR)
    .filter((f) => f.startsWith('questao-premium-') && f.endsWith('.json'))
    .sort();

  return files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(EXAMPLES_DIR, file), 'utf8')) as {
      reverse_study_slides?: unknown;
      study_slides?: unknown;
    };
    const slides = raw.reverse_study_slides ?? raw.study_slides ?? [];
    return { file, slides };
  });
}

const GENERIC_PAYLOAD_SLIDES = [
  {
    type: 'concept_map',
    items: [{ label: 'Ponto 1', detail: 'Relacione o tema' }],
  },
  {
    type: 'golden_rule',
    content: 'Regra essencial genérica',
  },
  {
    type: 'logic_flow',
    steps: ['Passo genérico'],
  },
  {
    type: 'danger_zone',
    content: 'Erros comuns na prova',
    items: [{ label: 'Ponto 1', detail: 'Erro genérico' }],
  },
];

const HYBRID_IA_STUB_SLIDES = [
  {
    type: 'golden_rule',
    rows: [
      { label: '[IA] Dispositivo', value: 'Preencher artigo/lei cobrado nesta questão' },
    ],
    footer_rule: '[IA] Completar rows — ver questao-premium-sus-lei-8080-cesgranrio.json',
  },
];

describe('premium-no-stub (gate anti-stub)', () => {
  it('PREMIUM_STUB_MARKERS inclui placeholders de hybrid/IA', () => {
    expect(PREMIUM_STUB_MARKERS).toEqual(
      expect.arrayContaining(['[ia] completar', '[ia] dispositivo', 'conceito central']),
    );
  });

  it('hasPremiumStubMarkers é alias de hasGenericSlides', () => {
    expect(hasPremiumStubMarkers(GENERIC_PAYLOAD_SLIDES)).toBe(true);
    expect(hasGenericSlides(GENERIC_PAYLOAD_SLIDES)).toBe(true);
  });

  it('detecta payload genérico de teste do hybrid', () => {
    expect(hasPremiumStubMarkers(GENERIC_PAYLOAD_SLIDES)).toBe(true);
  });

  it('detecta stubs [IA] do hybrid genérico', () => {
    expect(hasPremiumStubMarkers(HYBRID_IA_STUB_SLIDES)).toBe(true);
  });

  it('slides vazios ou ausentes contam como stub', () => {
    expect(hasPremiumStubMarkers([])).toBe(true);
    expect(hasPremiumStubMarkers(undefined)).toBe(true);
  });

  describe('goldens em examples/questao-premium-*.json', () => {
    const premiums = loadPremiumExamples();

    it('encontra ao menos um golden premium', () => {
      expect(premiums.length).toBeGreaterThan(0);
    });

    it.each(premiums.map((p) => [p.file, p.slides] as const))(
      '%s não contém marcadores stub nos slides',
      (_file, slides) => {
        expect(hasPremiumStubMarkers(slides)).toBe(false);
      },
    );
  });
});
