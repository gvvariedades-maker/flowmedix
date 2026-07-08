import fs from 'node:fs';
import path from 'node:path';

import {
  enrichVitalsGuidelineMeta,
  lintVitalsConceptPegadinha,
  lintVitalsDangerMirrorsConcept,
  lintVitalsGoldenDecoreOnly,
  lintVitalsGoldenNormative,
  lintVitalsLogicGabaritoPresent,
  lintVitalsPedagogy,
} from '@/lib/catalogMigration/sinaisVitaisPedagogy';

describe('sinaisVitaisPedagogy', () => {
  const fepesePath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-fepese-sv-interpretacao-valores.json',
  );
  const idecanPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-idecan-fc-radial-ce.json',
  );
  /** Golden commitado (questions/ do g01 é gitignored — não usar em CI). */
  const pilotGoldenPath = idecanPath;

  it('âncora FEPESE passa pegadinha + mirror + rows + logic gabarito (strict-v2)', () => {
    const payload = JSON.parse(fs.readFileSync(fepesePath, 'utf8'));
    const slides = payload.reverse_study_slides;
    expect(lintVitalsConceptPegadinha(slides)).toEqual([]);
    expect(lintVitalsDangerMirrorsConcept(slides)).toEqual([]);
    expect(lintVitalsGoldenNormative(slides)).toEqual([]);
    expect(lintVitalsLogicGabaritoPresent(slides)).toEqual([]);
    expect(lintVitalsPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('âncora IDECAN passa gramática SV strict-v2 e strict-v3', () => {
    const payload = JSON.parse(fs.readFileSync(pilotGoldenPath, 'utf8'));
    expect(lintVitalsPedagogy(payload, { strictV2: true })).toEqual([]);
    expect(lintVitalsPedagogy(payload, { strictV3: true })).toEqual([]);
  });

  it('âncora EXCETO/INCORRETA AVANÇASP passa vitals_exceto_semantic + strict-v3', () => {
    const excetoPath = path.join(
      process.cwd(),
      'examples',
      'questao-premium-avancasp-sv-pa-incorreta-divergente.json',
    );
    const payload = JSON.parse(fs.readFileSync(excetoPath, 'utf8'));
    expect(payload.meta.pedagogical_branch).toBe('vitals_exceto_tecnica');
    expect(lintVitalsPedagogy(payload, { strictV2: true })).toEqual([]);
    expect(lintVitalsPedagogy(payload, { strictV3: true })).toEqual([]);
  });

  it('v3 mental: âncoras SV em examples/ passam strict-v3', () => {
    const anchors = [
      'questao-premium-fepese-sv-interpretacao-valores.json',
      'questao-premium-idecan-fc-radial-ce.json',
      'questao-premium-avancasp-sv-pa-incorreta-divergente.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      expect(lintVitalsPedagogy(payload, { strictV3: true })).toEqual([]);
    }
  });

  it('flagra concept_map sem pegadinha-âncora', () => {
    const issues = lintVitalsConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'PA', detail: 'Pressão arterial do adulto.' },
          { label: 'FC', detail: 'Frequência cardíaca.' },
          { label: 'FR', detail: 'Frequência respiratória.' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'vitals_pegadinha_anchor')).toBe(true);
  });

  it('vitals_danger_mirror é error mesmo sem strict-v2', () => {
    const payload = JSON.parse(fs.readFileSync(pilotGoldenPath, 'utf8'));
    const slides = payload.reverse_study_slides.map((s: { type: string }) =>
      s.type === 'danger_zone'
        ? { ...s, items: [{ label: 'Genérico', detail: 'Erro comum', correct: 'Texto genérico' }] }
        : s,
    );
    const issues = lintVitalsPedagogy(
      { ...payload, reverse_study_slides: slides },
      { strictV2: false },
    );
    expect(issues.some((i) => i.code === 'vitals_danger_mirror')).toBe(true);
  });

  it('v3 mental: flagra golden_rule com julgamento V/F', () => {
    const issues = lintVitalsGoldenDecoreOnly([
      {
        type: 'golden_rule',
        rows: [{ label: 'Letra A', value: 'FALSA: FC 130 bpm' }],
      },
    ]);
    expect(issues.some((i) => i.code === 'vitals_golden_vf_judgment')).toBe(true);
  });

  it('enrich adiciona fonte sv-adulto-referencia em golden com números', () => {
    const payload = JSON.parse(fs.readFileSync(fepesePath, 'utf8'));
    const stripped = {
      ...payload,
      meta: {
        ...payload.meta,
        sources: [],
        content_review: { ...payload.meta.content_review, guideline_snapshot: '' },
      },
    };
    const { changed, payload: next } = enrichVitalsGuidelineMeta(stripped);
    expect(changed).toBe(true);
    const sources = (next.meta as { sources: { id: string }[] }).sources;
    expect(sources.some((s) => s.id === 'sv-adulto-referencia')).toBe(true);
  });
});
