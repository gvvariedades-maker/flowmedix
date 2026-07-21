import fs from 'node:fs';
import path from 'node:path';

import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';

describe('auditQuestaoReadiness', () => {
  it('golden respiratório EXCETO passa A1–A3 (sem branch declarado → A3 fail)', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, { slug: 'vunesp-exceto' });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.checks.some((c) => c.code === 'l3_branch_undeclared' && c.severity === 'error')).toBe(
      true,
    );
    expect(result.ready_100).toBe(false);
  });

  it('golden respiratório com pedagogical_branch declarado passa 100%', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    payload.meta.pedagogical_branch = 'respiratorio_asma_crise';

    const result = auditQuestaoReadiness(payload, { slug: 'vunesp-exceto' });
    expect(result.ready_100).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
  });

  it('payload com stub falha A2', () => {
    const result = auditQuestaoReadiness({
      meta: {
        subtopico: 'Noções de Anatomia',
        banca: 'X',
        topico: 'Enfermagem',
        content_standard: 'golden-v1',
        family: 'conceito',
        content_review: {
          reviewed_at: '2026-01-01',
          guideline_snapshot: 'test',
        },
        sources: [
          {
            id: 's1',
            tier: 'A',
            issuer: 'MS',
            title: 'Doc',
            year: 2020,
          },
        ],
      },
      question_data: {
        instruction: 'Assinale a correta.',
        options: [{ id: 'A', text: 'a', is_correct: true }],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          items: [
            { label: 'A', detail: 'conceito central', icon: 'Circle' },
            { label: 'B', detail: 'b', icon: 'Circle' },
            { label: 'C', detail: 'c', icon: 'Circle' },
          ],
        },
        { type: 'golden_rule', content: 'Regra', rows: [{ label: 'X', value: 'Y' }] },
        { type: 'logic_flow', reveal_mode: 'tap', steps: ['1', '2', '3'] },
        {
          type: 'danger_zone',
          content: 'z',
          items: [{ label: 'A', detail: 'b', correct: 'Gabarito letra A — ok' }],
        },
      ],
    });

    expect(result.tier_pass.A2).toBe(false);
    expect(result.checks.some((c) => c.code === 'l2_stub')).toBe(true);
  });

  it('golden Consulpam vias absorção oral passa ready_100', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-consulpam-vias-absorcao-oral.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, {
      slug: 'instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0',
    });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
    expect(result.ready_100).toBe(true);
  });

  it('golden IDECAN omeprazol EV passa ready_100', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-idecan-omeprazol-ev-ulcera.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, {
      slug: 'idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6',
    });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
    expect(result.ready_100).toBe(true);
  });

  it('golden DECORP imunização SCR via passa ready_100', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-decorp-imunizacao-triplice-viral-via.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, {
      slug: 'decorp-enfermagem-vias-de-administracao-1776056357082-0',
    });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
    expect(result.ready_100).toBe(true);
  });

  it('golden ADM&TEC adolescente cartão perdido passa ready_100', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, {
      slug: 'adm-tec-enfermagem-imunizacao-1779563986606-5',
    });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
    expect(result.ready_100).toBe(true);
  });

  it('golden AMEOSC cadeia de frio V/F passa ready_100', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-ameosc-imunizacao-vf-cadeia-frio.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, {
      slug: 'ameosc-enfermagem-processo-de-enfermagem-1780005791580-3',
    });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
    expect(result.ready_100).toBe(true);
  });

  it('golden perioperatória Fundatec EXCETO v3 passa ready_100 com strict-v2', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-fundatec-perioperatoria-anestesia-regional-exceto.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, {
      slug: 'fundatec-enfermagem-vias-de-administracao-1776056374837-7',
      strictV2Pedagogy: true,
    });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
    expect(result.ready_100).toBe(true);
    expect(result.checks.find((c) => c.code === 'golden_rule_gabarito_spoiler')).toBeUndefined();
  });

  it('strictV2Pedagogy promove golden_rule_gabarito_spoiler a error', () => {
    const base = {
      meta: {
        subtopico: 'Imunização',
        banca: 'X',
        topico: 'Enfermagem',
        content_standard: 'golden-v1',
        family: 'vf' as const,
        content_review: { reviewed_at: '2026-01-01', guideline_snapshot: 'PNI' },
        sources: [{ id: 's1', tier: 'A' as const, issuer: 'MS', title: 'PNI', year: 2025 }],
      },
      question_data: {
        instruction: 'I - Vacina X II - Intervalo Y III - Esquema Z\nÉ CORRETO o que se afirma em:',
        options: [
          { id: 'A', text: 'I', is_correct: false },
          { id: 'B', text: 'II e III', is_correct: true },
          { id: 'C', text: 'I e II', is_correct: false },
        ],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          items: [
            { label: 'I', detail: 'Vacina X no esquema PNI', icon: 'Syringe' },
            { label: 'II', detail: 'Intervalo mínimo entre doses', icon: 'Clock' },
            { label: 'III', detail: 'Esquema completo primovacinação', icon: 'ListChecks' },
          ],
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          steps: ['Julgar I', 'Julgar II', 'Julgar III', 'Marcar B'],
        },
        {
          type: 'golden_rule',
          content: 'PNI',
          rows: [{ label: 'Gabarito', value: 'Letra B — II e III' }],
        },
        {
          type: 'danger_zone',
          content: 'z',
          items: [{ label: 'A', detail: 'b', correct: 'Gabarito letra B — II e III corretos' }],
        },
      ],
    };

    const warnOnly = auditQuestaoReadiness(base as never, { strictV2Pedagogy: false });
    const strictV2 = auditQuestaoReadiness(base as never, { strictV2Pedagogy: true });

    const spoilerWarn = warnOnly.checks.find((c) => c.code === 'golden_rule_gabarito_spoiler');
    expect(spoilerWarn?.severity).toBe('warn');

    const spoilerErr = strictV2.checks.find((c) => c.code === 'golden_rule_gabarito_spoiler');
    expect(spoilerErr?.severity).toBe('error');
    expect(strictV2.ready_100).toBe(false);
  });

  it('emite l2_family_mismatch quando meta.family diverge do funil', () => {
    const payload = {
      meta: {
        subtopico: 'Punção Venosa e Cuidados com Cateteres',
        content_standard: 'golden-v1',
        family: 'protocolo',
        content_review: { reviewed_at: '2026-01-01' },
        sources: [{ tier: 'A', label: 'teste' }],
      },
      question_data: {
        instruction: 'Assinale a alternativa correta sobre flebite.',
        options: [
          { id: 'A', text: 'Opção A', is_correct: true },
          { id: 'B', text: 'Opção B', is_correct: false },
        ],
      },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'A', detail: 'b' }] },
        { type: 'logic_flow', reveal_mode: 'tap', steps: ['a', 'b', 'c', 'd'] },
        { type: 'golden_rule', content: 'Regra' },
        { type: 'danger_zone', content: 'z', items: [{ label: 'A', detail: 'b', correct: 'c' }] },
      ],
    };

    const warnOnly = auditQuestaoReadiness(payload as never, { strictV2Pedagogy: false });
    const strictV2 = auditQuestaoReadiness(payload as never, { strictV2Pedagogy: true });

    const mismatchWarn = warnOnly.checks.find((c) => c.code === 'l2_family_mismatch');
    expect(mismatchWarn?.severity).toBe('warn');
    expect(mismatchWarn?.message).toContain('inferido: conceito');

    const mismatchErr = strictV2.checks.find((c) => c.code === 'l2_family_mismatch');
    expect(mismatchErr?.severity).toBe('error');
  });
});
