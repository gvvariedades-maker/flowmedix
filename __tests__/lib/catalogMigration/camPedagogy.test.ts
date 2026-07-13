import fs from 'node:fs';
import path from 'node:path';

import {
  lintCamConceptPegadinha,
  lintCamDangerMirrorsConcept,
  lintCamGoldenDecoreOnly,
  lintCamGoldenNormative,
  lintCamLogicGabaritoPresent,
  lintCamPedagogy,
  lintCamVfIIIBinding,
} from '@/lib/catalogMigration/camPedagogy';
import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';

describe('camPedagogy', () => {
  const certosPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-fepese-cuidados-administracao-medicamentos.json',
  );
  const insulinaPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-fepese-cuidados-insulina-alto-risco.json',
  );
  const excetoPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json',
  );

  it('âncora FEPESE 9 Certos passa pegadinha + mirror + rows + logic gabarito', () => {
    const payload = JSON.parse(fs.readFileSync(certosPath, 'utf8'));
    const slides = payload.reverse_study_slides;
    expect(lintCamConceptPegadinha(slides)).toEqual([]);
    expect(lintCamDangerMirrorsConcept(slides)).toEqual([]);
    expect(lintCamGoldenNormative(slides)).toEqual([]);
    expect(lintCamLogicGabaritoPresent(slides)).toEqual([]);
    expect(lintCamVfIIIBinding(payload)).toEqual([]);
    expect(lintCamPedagogy(payload, { strictV2: true })).toEqual([]);
  });

  it('âncora FEPESE insulina alto risco passa gramática CAM strict', () => {
    const payload = JSON.parse(fs.readFileSync(insulinaPath, 'utf8'));
    expect(lintCamPedagogy(payload, { strictV2: true })).toEqual([]);
    expect(payload.meta.pedagogical_branch).toBe('cam_alto_risco');
  });

  it('âncora AVANÇASP EXCETO passa lint semântico', () => {
    const payload = JSON.parse(fs.readFileSync(excetoPath, 'utf8'));
    expect(lintCamPedagogy(payload, { strictV2: true })).toEqual([]);
    expect(payload.meta.pedagogical_branch).toBe('cam_exceto_conduta');
  });

  it('flagra concept_map sem pegadinha-âncora', () => {
    const issues = lintCamConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'Rotina', detail: 'Fluxo padronizado na unidade de internação.' },
          { label: 'Equipe', detail: 'Trabalho multiprofissional no plantão.' },
          { label: 'Farmácia', detail: 'Estoque e dispensação local.' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'cam_pegadinha_anchor')).toBe(true);
  });

  it('flagra gabarito no concept_map', () => {
    const issues = lintCamConceptPegadinha([
      {
        type: 'concept_map',
        items: [
          { label: 'Dúvida', detail: 'Suspender se ilegível' },
          { label: 'Pegadinha uso habitual', detail: 'III libera administração' },
          { label: 'Combinação correta', detail: 'Letra B' },
        ],
      },
    ]);
    expect(issues.some((i) => i.code === 'cam_concept_gabarito_spoiler')).toBe(true);
  });

  it('cam_danger_mirror é error mesmo sem strict-v2', () => {
    const payload = JSON.parse(fs.readFileSync(certosPath, 'utf8'));
    const slides = payload.reverse_study_slides.map((s: { type: string }) =>
      s.type === 'danger_zone'
        ? { ...s, items: [{ label: 'Genérico', detail: 'Erro comum', correct: 'Texto genérico' }] }
        : s,
    );
    const issues = lintCamPedagogy(
      { ...payload, reverse_study_slides: slides },
      { strictV2: false },
    );
    expect(issues.some((i) => i.code === 'cam_danger_mirror')).toBe(true);
  });

  it('v3 mental: flagra golden_rule com julgamento V/F', () => {
    const issues = lintCamGoldenDecoreOnly([
      {
        type: 'golden_rule',
        rows: [{ label: 'III — dúvida', value: 'FALSA: administrar com uso habitual' }],
      },
    ]);
    expect(issues.some((i) => i.code === 'cam_golden_vf_judgment')).toBe(true);
  });

  it('v3 mental: âncoras CAM passam strict-v3', () => {
    const anchors = [
      'questao-premium-fepese-cuidados-administracao-medicamentos.json',
      'questao-premium-fepese-cuidados-insulina-alto-risco.json',
      'questao-premium-cotec-cuidados-heparina-alto-risco.json',
      'questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json',
      'questao-premium-cpcon-cuidados-incorreta-nove-certos.json',
      'questao-premium-avancasp-cuidados-documentacao-vf.json',
      'questao-premium-facet-cuidados-vigilancia-reacao-adversa.json',
      'questao-premium-ameosc-cuidados-protocolo-ms-vf.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      expect(lintCamPedagogy(payload, { strictV3: true })).toEqual([]);
    }
  });
});

describe('auditQuestaoReadiness — CAM', () => {
  it('âncoras CAM passam ready_100 com strict-v2-pedagogy', () => {
    const anchors = [
      'questao-premium-fepese-cuidados-administracao-medicamentos.json',
      'questao-premium-fepese-cuidados-insulina-alto-risco.json',
      'questao-premium-cotec-cuidados-heparina-alto-risco.json',
      'questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json',
      'questao-premium-cpcon-cuidados-incorreta-nove-certos.json',
      'questao-premium-avancasp-cuidados-documentacao-vf.json',
      'questao-premium-facet-cuidados-vigilancia-reacao-adversa.json',
      'questao-premium-ameosc-cuidados-protocolo-ms-vf.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'examples', file), 'utf8'),
      );
      const result = auditQuestaoReadiness(payload, {
        slug: `cam-anchor-${file}`,
        strictV2Pedagogy: true,
      });
      const pedagogyErrors = result.checks.filter(
        (c) => c.code.startsWith('cam_') && c.severity === 'error',
      );
      expect(pedagogyErrors).toEqual([]);
      expect(result.tier_pass.A2).toBe(true);
    }
  });
});
