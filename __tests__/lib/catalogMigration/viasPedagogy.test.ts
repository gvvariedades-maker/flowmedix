import fs from 'node:fs';
import path from 'node:path';

import {
  enrichViasGuidelineMeta,
  lintViasConceptPegadinha,
  lintViasDangerMirrorsConcept,
  lintViasGoldenDecoreOnly,
  lintViasGoldenNormative,
  lintViasLogicGabaritoPresent,
  lintViasPedagogy,
  needsViasCofenGuidelineMeta,
} from '@/lib/catalogMigration/viasPedagogy';

describe('viasPedagogy', () => {
  const consulpamPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-consulpam-vias-absorcao-oral.json',
  );
  const cpconPath = path.join(process.cwd(), 'examples', 'questao-premium-cpcon-vias-im-vf.json');
  const vunespPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-vunesp-via-subcutanea.json',
  );

  it('âncora Consulpam passa pegadinha + mirror + rows + logic gabarito', () => {
    const payload = JSON.parse(fs.readFileSync(consulpamPath, 'utf8'));
    const slides = payload.reverse_study_slides;
    expect(lintViasConceptPegadinha(slides)).toEqual([]);
    expect(lintViasDangerMirrorsConcept(slides)).toEqual([]);
    expect(lintViasGoldenNormative(slides)).toEqual([]);
    expect(lintViasLogicGabaritoPresent(slides)).toEqual([]);
    expect(lintViasPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('âncora CPCON IM passa gramática Vias strict (via_tecnica_admin)', () => {
    const payload = JSON.parse(fs.readFileSync(cpconPath, 'utf8'));
    expect(payload.meta.pedagogical_branch).toBe('via_tecnica_admin');
    expect(lintViasPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('âncoras EXCETO/INCORRETA passam vias_exceto_semantic', () => {
    for (const file of [
      'questao-premium-cetrede-vias-injetaveis-incorreta.json',
      'questao-premium-avancasp-vias-sublingual-exceto.json',
    ]) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      expect(payload.meta.pedagogical_branch).toBe('via_generico');
      expect(lintViasPedagogy(payload, { strictV2: true })).toEqual([]);
    }
  });

  it('âncora VUNESP SC passa gramática Vias strict', () => {
    const payload = JSON.parse(fs.readFileSync(vunespPath, 'utf8'));
    expect(lintViasPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('flagra concept_map sem pegadinha-âncora', () => {
    const issues = lintViasConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'Farmacologia', detail: 'Estudo de fármacos e interações.' },
          { label: 'Vias', detail: 'Administração de medicamentos.' },
          { label: 'Absorção', detail: 'Farmacocinética básica.' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'vias_pegadinha_anchor')).toBe(true);
  });

  it('flagra gabarito no concept_map', () => {
    const issues = lintViasConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'Trilho IM × SC', detail: 'IM mais rápida que SC' },
          { label: 'Pegadinha ventroglúteo', detail: 'Inverte sítio seguro' },
          { label: 'Combinação correta', detail: 'Letra E' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'vias_concept_gabarito_spoiler')).toBe(true);
  });

  it('vias_danger_mirror é error mesmo sem strict-v2', () => {
    const payload = JSON.parse(fs.readFileSync(consulpamPath, 'utf8'));
    const slides = payload.reverse_study_slides.map((s: { type: string }) =>
      s.type === 'danger_zone'
        ? { ...s, items: [{ label: 'Genérico', detail: 'Erro comum', correct: 'Texto genérico' }] }
        : s,
    );
    const issues = lintViasPedagogy(
      { ...payload, reverse_study_slides: slides },
      { strictV2: false },
    );
    expect(issues.some((i) => i.code === 'vias_danger_mirror')).toBe(true);
  });

  it('v3 mental: flagra golden_rule com julgamento V/F', () => {
    const issues = lintViasGoldenDecoreOnly([
      {
        type: 'golden_rule',
        rows: [{ label: 'I — IM×SC', value: 'FALSA: IM mais lenta' }],
      },
    ]);
    expect(issues.some((i) => i.code === 'vias_golden_vf_judgment')).toBe(true);
  });

  it('v3 mental: âncoras Vias passam strict-v3', () => {
    const anchors = [
      'questao-premium-consulpam-vias-absorcao-oral.json',
      'questao-premium-cpcon-vias-im-vf.json',
      'questao-premium-vunesp-via-subcutanea.json',
      'questao-premium-cetrede-vias-injetaveis-incorreta.json',
      'questao-premium-avancasp-vias-sublingual-exceto.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      expect(lintViasPedagogy(payload, { strictV3: true })).toEqual([]);
    }
  });

  it('enrichViasGuidelineMeta adiciona ou mescla COFEN quando há volume/dose', () => {
    const payload = JSON.parse(fs.readFileSync(vunespPath, 'utf8'));
    const { payload: enriched, changed } = enrichViasGuidelineMeta(payload);
    expect(changed).toBe(true);
    const sources = enriched.meta as { sources?: { id: string; tier: string }[] };
    expect(sources.sources?.some((s) => s.id === 'vias-administracao-cofen' && s.tier === 'A')).toBe(
      true,
    );
    const review = (enriched.meta as { content_review?: { guideline_snapshot?: string } })
      .content_review;
    expect(review?.guideline_snapshot?.toLowerCase()).toContain('cofen');
  });

  it('needsViasCofenGuidelineMeta ativa com claim 100% ou dose/ângulo/volume', () => {
    const consulpam = JSON.parse(fs.readFileSync(consulpamPath, 'utf8'));
    expect(needsViasCofenGuidelineMeta(consulpam)).toBe(true);
    const vunesp = JSON.parse(fs.readFileSync(vunespPath, 'utf8'));
    expect(needsViasCofenGuidelineMeta(vunesp)).toBe(true);
  });
});
