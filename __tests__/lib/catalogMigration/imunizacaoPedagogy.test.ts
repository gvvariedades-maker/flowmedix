import fs from 'node:fs';
import path from 'node:path';

import {
  lintImunizacaoConceptPegadinha,
  lintImunizacaoDangerMirrorsConcept,
  lintImunizacaoGoldenDecoreOnly,
  lintImunizacaoGoldenNormative,
  lintImunizacaoLogicGabaritoPresent,
  lintImunizacaoPedagogy,
} from '@/lib/catalogMigration/imunizacaoPedagogy';

describe('imunizacaoPedagogy', () => {
  const fundatecPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-fundatec-meningococica-3meses.json',
  );
  const ameoscPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-ameosc-imunizacao-vf-cadeia-frio.json',
  );

  it('âncora Fundatec passa pegadinha + mirror + rows + logic gabarito', () => {
    const payload = JSON.parse(fs.readFileSync(fundatecPath, 'utf8'));
    const slides = payload.reverse_study_slides;
    expect(lintImunizacaoConceptPegadinha(slides)).toEqual([]);
    expect(lintImunizacaoDangerMirrorsConcept(slides)).toEqual([]);
    expect(lintImunizacaoGoldenNormative(slides)).toEqual([]);
    expect(lintImunizacaoLogicGabaritoPresent(slides)).toEqual([]);
    expect(lintImunizacaoPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('âncora AMEOSC passa gramática Imunização strict', () => {
    const payload = JSON.parse(fs.readFileSync(ameoscPath, 'utf8'));
    expect(lintImunizacaoPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('flagra concept_map sem pegadinha-âncora', () => {
    const issues = lintImunizacaoConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'PNI', detail: 'Calendário nacional de vacinação infantil.' },
          { label: 'Vacinas', detail: 'Importância da imunização.' },
          { label: 'Sala', detail: 'Cuidados na aplicação.' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'imunizacao_pegadinha_anchor')).toBe(true);
  });

  it('flagra gabarito no concept_map', () => {
    const issues = lintImunizacaoConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'Marco', detail: '3 meses MenC' },
          { label: 'Pegadinha BCG', detail: 'Confunde ao nascer' },
          { label: 'Combinação correta', detail: 'Letra B' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'imunizacao_concept_gabarito_spoiler')).toBe(true);
  });

  it('imunizacao_danger_mirror é error mesmo sem strict-v2', () => {
    const payload = JSON.parse(fs.readFileSync(fundatecPath, 'utf8'));
    const slides = payload.reverse_study_slides.map((s: { type: string }) =>
      s.type === 'danger_zone'
        ? { ...s, items: [{ label: 'Genérico', detail: 'Erro comum', correct: 'Texto genérico' }] }
        : s,
    );
    const issues = lintImunizacaoPedagogy(
      { ...payload, reverse_study_slides: slides },
      { strictV2: false },
    );
    expect(issues.some((i) => i.code === 'imunizacao_danger_mirror')).toBe(true);
  });

  it('âncora Agirh passa lint EXCETO semântico', () => {
    const agirhPath = path.join(
      process.cwd(),
      'examples',
      'questao-premium-agirh-imunizacao-incorreta-antibiotico.json',
    );
    const payload = JSON.parse(fs.readFileSync(agirhPath, 'utf8'));
    expect(lintImunizacaoPedagogy(payload, { strictV2: true })).toEqual([]);
    expect(payload.meta.pedagogical_branch).toBe('imunizacao_exceto');
  });

  it('v3 mental: flagra golden_rule com julgamento V/F', () => {
    const issues = lintImunizacaoGoldenDecoreOnly([
      {
        type: 'golden_rule',
        rows: [{ label: 'I — grace', value: 'FALSA: dose válida' }],
      },
    ]);
    expect(issues.some((i) => i.code === 'imunizacao_golden_vf_judgment')).toBe(true);
  });

  it('v3 mental: âncoras Imunização passam strict-v3', () => {
    const anchors = [
      'questao-premium-fundatec-meningococica-3meses.json',
      'questao-premium-ameosc-imunizacao-vf-cadeia-frio.json',
      'questao-premium-avancasp-imunizacao-rede-frio-temperatura.json',
      'questao-premium-cpcon-imunizacao-intervalos-vf.json',
      'questao-premium-agirh-imunizacao-incorreta-antibiotico.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      expect(lintImunizacaoPedagogy(payload, { strictV3: true })).toEqual([]);
    }
  });
});
