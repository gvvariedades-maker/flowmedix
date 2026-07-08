import fs from 'node:fs';
import path from 'node:path';

import {
  lintUrgenciasConceptPegadinha,
  lintUrgenciasDangerMirrorsConcept,
  lintUrgenciasGoldenDecoreOnly,
  lintUrgenciasGoldenNormative,
  lintUrgenciasLogicGabaritoPresent,
  lintUrgenciasPedagogy,
} from '@/lib/catalogMigration/urgenciasPedagogy';

describe('urgenciasPedagogy', () => {
  const pediatricPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-access-urgencias-rcp-pediatrica-15-2.json',
  );
  const rcpPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-admtec-urgencias-rcp-30-2-aha2020.json',
  );
  const excetoPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json',
  );

  it('âncora RCP pediátrica passa pegadinha + mirror + rows + logic gabarito', () => {
    const payload = JSON.parse(fs.readFileSync(pediatricPath, 'utf8'));
    const slides = payload.reverse_study_slides;
    expect(lintUrgenciasConceptPegadinha(slides)).toEqual([]);
    expect(lintUrgenciasDangerMirrorsConcept(slides)).toEqual([]);
    expect(lintUrgenciasGoldenNormative(slides)).toEqual([]);
    expect(lintUrgenciasLogicGabaritoPresent(slides)).toEqual([]);
    expect(lintUrgenciasPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('âncora RCP adulto AHA passa gramática Urgências strict', () => {
    const payload = JSON.parse(fs.readFileSync(rcpPath, 'utf8'));
    expect(lintUrgenciasPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('flagra concept_map sem pegadinha-âncora', () => {
    const issues = lintUrgenciasConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'Atendimento', detail: 'Protocolo hospitalar genérico.' },
          { label: 'Emergência', detail: 'Cuidados iniciais sem caso clínico.' },
          { label: 'Protocolo', detail: 'Condutas padronizadas de enfermagem.' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'urgencias_pegadinha_anchor')).toBe(true);
  });

  it('flagra gabarito no concept_map', () => {
    const issues = lintUrgenciasConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: '15:2', detail: 'Proporção pediátrica' },
          { label: 'Pegadinha 30:2', detail: 'Adulto no lugar de pediatria' },
          { label: 'Combinação correta', detail: 'Letra D' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'urgencias_concept_gabarito_spoiler')).toBe(true);
  });

  it('urgencias_danger_mirror é error mesmo sem strict-v2', () => {
    const payload = JSON.parse(fs.readFileSync(pediatricPath, 'utf8'));
    const slides = payload.reverse_study_slides.map((s: { type: string }) =>
      s.type === 'danger_zone'
        ? { ...s, items: [{ label: 'Genérico', detail: 'Erro comum', correct: 'Texto genérico' }] }
        : s,
    );
    const issues = lintUrgenciasPedagogy(
      { ...payload, reverse_study_slides: slides },
      { strictV2: false },
    );
    expect(issues.some((i) => i.code === 'urgencias_danger_mirror')).toBe(true);
  });

  it('âncora EXCETO fratura exposta passa lint semântico', () => {
    const payload = JSON.parse(fs.readFileSync(excetoPath, 'utf8'));
    expect(lintUrgenciasPedagogy(payload, { strictV2: true })).toEqual([]);
    expect(payload.meta.pedagogical_branch).toBe('urgencias_exceto_conduta');
  });

  it('v3 mental: flagra golden_rule com julgamento V/F', () => {
    const issues = lintUrgenciasGoldenDecoreOnly([
      {
        type: 'golden_rule',
        rows: [{ label: 'I — RCP', value: 'FALSA: 30:2 adulto' }],
      },
    ]);
    expect(issues.some((i) => i.code === 'urgencias_golden_vf_judgment')).toBe(true);
  });

  it('v3 mental: âncoras P0 Urgências passam strict-v3', () => {
    const anchors = [
      'questao-premium-access-urgencias-rcp-pediatrica-15-2.json',
      'questao-premium-admtec-urgencias-rcp-30-2-aha2020.json',
      'questao-premium-amauc-urgencias-cincinnati-avc.json',
      'questao-premium-ameosc-urgencias-trauma-queimadura.json',
      'questao-premium-admtec-urgencias-choque-eletrico.json',
      'questao-premium-fau-unicentro-urgencias-engasgo-sinal-universal.json',
      'questao-premium-ameosc-urgencias-triagem-etiquetas.json',
      'questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json',
      'questao-premium-admtec-urgencias-convulsao-crise.json',
      'questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json',
      'questao-premium-ameosc-urgencias-queimadura-vf-primeiros-socorros.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      expect(lintUrgenciasPedagogy(payload, { strictV3: true })).toEqual([]);
    }
  });
});
