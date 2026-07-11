import fs from 'node:fs';
import path from 'node:path';

import {
  lintMulherConceptPegadinha,
  lintMulherDangerMirrorsConcept,
  lintMulherGoldenDecoreOnly,
  lintMulherGoldenNormative,
  lintMulherLogicGabaritoPresent,
  lintSaudeMulherPedagogy,
} from '@/lib/catalogMigration/saudeMulherPedagogy';

describe('saudeMulherPedagogy', () => {
  const prenatalPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-cpcon-saude-mulher-pre-natal-vf.json',
  );
  const partoPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-admtec-saude-mulher-parto-humanizado-vf.json',
  );
  const papanicolauPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-vunesp-saude-mulher-papanicolau.json',
  );
  const mamaPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-vunesp-saude-mulher-mamografia.json',
  );

  it('âncora pré-natal passa pegadinha + mirror + rows + logic gabarito', () => {
    const payload = JSON.parse(fs.readFileSync(prenatalPath, 'utf8'));
    const slides = payload.reverse_study_slides;
    expect(lintMulherConceptPegadinha(slides)).toEqual([]);
    expect(lintMulherDangerMirrorsConcept(slides)).toEqual([]);
    expect(lintMulherGoldenNormative(slides)).toEqual([]);
    expect(lintMulherLogicGabaritoPresent(slides)).toEqual([]);
    expect(lintSaudeMulherPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('âncora parto humanizado passa gramática strict-v2', () => {
    const payload = JSON.parse(fs.readFileSync(partoPath, 'utf8'));
    expect(lintSaudeMulherPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('flagra concept_map sem pegadinha-âncora', () => {
    const issues = lintMulherConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'Gestação', detail: 'Acompanhamento pré-natal na UBS.' },
          { label: 'Consultas', detail: 'Periodicidade conforme protocolo.' },
          { label: 'Exames', detail: 'Solicitar na primeira consulta.' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'mulher_pegadinha_anchor')).toBe(true);
  });

  it('flagra gabarito no concept_map', () => {
    const issues = lintMulherConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'TTGO', detail: 'Entre 24 e 28 semanas' },
          { label: 'Pegadinha 4 consultas', detail: 'Mínimo atual é 6' },
          { label: 'Combinação correta', detail: 'Letra B' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'mulher_concept_gabarito_spoiler')).toBe(true);
  });

  it('mulher_danger_mirror é error mesmo sem strict-v2', () => {
    const payload = JSON.parse(fs.readFileSync(papanicolauPath, 'utf8'));
    const slides = payload.reverse_study_slides.map((s: { type: string }) =>
      s.type === 'danger_zone'
        ? { ...s, items: [{ label: 'Genérico', detail: 'Erro comum', correct: 'Texto genérico' }] }
        : s,
    );
    const issues = lintSaudeMulherPedagogy(
      { ...payload, reverse_study_slides: slides },
      { strictV2: false },
    );
    expect(issues.some((i) => i.code === 'mulher_danger_mirror')).toBe(true);
  });

  it('v3 mental: flagra golden_rule com julgamento V/F', () => {
    const issues = lintMulherGoldenDecoreOnly([
      {
        type: 'golden_rule',
        rows: [{ label: 'III — tabagismo', value: 'FALSA: irrelevante na gestação' }],
      },
    ]);
    expect(issues.some((i) => i.code === 'mulher_golden_vf_judgment')).toBe(true);
  });

  it('v3 mental: 4 âncoras P0 Saúde da Mulher passam strict-v3', () => {
    const anchors = [
      'questao-premium-cpcon-saude-mulher-pre-natal-vf.json',
      'questao-premium-admtec-saude-mulher-parto-humanizado-vf.json',
      'questao-premium-vunesp-saude-mulher-papanicolau.json',
      'questao-premium-vunesp-saude-mulher-mamografia.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      expect(lintSaudeMulherPedagogy(payload, { strictV3: true })).toEqual([]);
    }
  });
});
