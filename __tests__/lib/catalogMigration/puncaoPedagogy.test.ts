import fs from 'node:fs';
import path from 'node:path';

import {
  buildPuncaoAnvisaSource,
  buildPuncaoGuidelineSnapshot,
  buildPuncaoPotterSource,
  buildPuncaoSourcesForSlug,
  enrichPuncaoGuidelineMeta,
  needsPuncaoGuidelineMeta,
} from '@/lib/catalogMigration/puncaoPedagogy';
import { POTTER_PERRY_FUNDAMENTOS_11ED, PUNCAO_CATETER_ANVISA } from '@/lib/guidelines';

const flebiteGolden = path.join(
  process.cwd(),
  'examples/questao-premium-avancasp-puncao-infiltracao-flebite.json',
);

describe('puncaoPedagogy guideline enrich', () => {
  it('buildPuncaoAnvisaSource usa id canônico Anvisa', () => {
    const src = buildPuncaoAnvisaSource('infiltração flebite hematoma');
    expect(src.id).toBe(PUNCAO_CATETER_ANVISA.id);
    expect(src.tier).toBe('A');
    expect(src.url).toBeTruthy();
    expect(src.covers).toContain('infiltração');
  });

  it('buildPuncaoGuidelineSnapshot prefixa snapshot Anvisa e cita Potter', () => {
    const snap = buildPuncaoGuidelineSnapshot('flebite infiltração no acesso venoso');
    expect(snap.toLowerCase()).toContain('anvisa');
    expect(snap.toLowerCase()).toContain('potter');
  });

  it('buildPuncaoPotterSource usa id canônico 11ª ed. 2024', () => {
    const src = buildPuncaoPotterSource('flebite infiltração hematoma no AVP');
    expect(src.id).toBe(POTTER_PERRY_FUNDAMENTOS_11ED.id);
    expect(src.tier).toBe('B');
    expect(src.year).toBe(2024);
    expect(src.covers).toContain('flebite');
  });

  it('buildPuncaoSourcesForSlug inclui Anvisa e Potter', () => {
    const sources = buildPuncaoSourcesForSlug('punção venosa periférica flebite');
    expect(sources.some((s) => s.id === PUNCAO_CATETER_ANVISA.id)).toBe(true);
    expect(sources.some((s) => s.id === POTTER_PERRY_FUNDAMENTOS_11ED.id)).toBe(true);
  });

  it('enrichPuncaoGuidelineMeta substitui fonte genérica COFEN por Anvisa pinada', () => {
    const payload = {
      meta: {
        subtopico: 'Punção Venosa e Cuidados com Cateteres',
        content_standard: 'golden-v1',
        content_review: {
          guideline_snapshot: 'Complicações de acesso venoso periférico — infiltração, flebite, hematoma',
        },
        sources: [
          {
            id: 'cofen-puncao-complicacoes',
            tier: 'A',
            issuer: 'COFEN',
            title: 'Procedimentos de enfermagem — punção venosa e complicações locais',
            year: 2024,
            covers: ['flebite'],
          },
        ],
      },
      question_data: {
        instruction: 'Infiltração versus flebite no acesso venoso periférico.',
        options: [{ text: 'Flebite' }],
      },
      reverse_study_slides: [],
    };
    const { payload: enriched, changed } = enrichPuncaoGuidelineMeta(payload);
    expect(changed).toBe(true);
    const sources = (enriched.meta as { sources?: { id: string; url?: string }[] }).sources ?? [];
    expect(sources.some((s) => s.id === PUNCAO_CATETER_ANVISA.id && s.url)).toBe(true);
    expect(sources.some((s) => s.id === POTTER_PERRY_FUNDAMENTOS_11ED.id)).toBe(true);
    expect(sources.some((s) => s.id === 'cofen-puncao-complicacoes')).toBe(false);
    const review = (enriched.meta as { content_review?: { guideline_snapshot?: string } })
      .content_review;
    expect(review?.guideline_snapshot?.toLowerCase()).toContain('anvisa');
  });

  it('needsPuncaoGuidelineMeta desliga após enrich canônico', () => {
    const payload = JSON.parse(fs.readFileSync(flebiteGolden, 'utf8')) as Record<string, unknown>;
    const { payload: enriched } = enrichPuncaoGuidelineMeta(payload);
    expect(needsPuncaoGuidelineMeta(enriched as never)).toBe(false);
  });

  it('enrich adiciona COFEN 358 quando há documentação AVP', () => {
    const payload = {
      meta: {
        subtopico: 'Punção Venosa e Cuidados com Cateteres',
        content_standard: 'golden-v1',
        content_review: { guideline_snapshot: 'temp' },
        sources: [],
      },
      question_data: {
        instruction: 'Registre no prontuário a complicação do acesso venoso periférico.',
        options: [{ text: 'Anotação de enfermagem' }],
      },
      reverse_study_slides: [],
    };
    const { payload: enriched } = enrichPuncaoGuidelineMeta(payload);
    const sources = (enriched.meta as { sources?: { id: string }[] }).sources ?? [];
    expect(sources.some((s) => s.id === 'sae-cofen-358')).toBe(true);
  });
});
