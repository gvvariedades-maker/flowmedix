import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';
import type { BlindReaderResult } from '@/lib/neurocanvas/blindReaderGate';
import { gradeSlideReadiness } from '@/lib/neurocanvas/readiness';
import {
  gradePedagogicalNote,
  summarizePedagogicalNotes,
} from '@/lib/neurocanvas/pedagogicalNote';

const blindReader = (verdict: BlindReaderResult['verdict']): BlindReaderResult => ({
  slug: 'slug-x',
  verdict,
  blocking: verdict === 'fail_leak',
  gabarito: 'C',
  correct_letter: 'C',
  evidencia: 'C erra ao dizer que máxima e mínima se aproximam',
  evidence_literal: verdict === 'fail_leak',
  surfaces_count: 5,
});

describe('gradePedagogicalNote', () => {
  it('passa quando não há achado nem acerto do leitor cego', () => {
    const note = gradePedagogicalNote({ slug: 'slug-x', findings: [] });
    expect(note.grade).toBe('pass');
    expect(note.score).toBe(100);
    expect(note.reasons).toEqual([]);
  });

  it('reprova por assinatura bloqueante do detector', () => {
    const findings = detectUnifiedPedagogy({
      question_data: { instruction: 'Assinale a correta.' },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'Núcleo', detail: 'C erra ao dizer isso.' }] },
        { type: 'logic_flow', steps: ['Julgar I', 'Marcar C'] },
      ],
    });
    const note = gradePedagogicalNote({ slug: 'slug-x', findings });
    expect(note.blocking_codes).toContain('pedagogy_letter_spoiler');
    expect(note.grade).toBe('fail');
    expect(note.score).toBeLessThan(100);
  });

  it('reprova por fail_leak do leitor cego mesmo sem assinatura de regex', () => {
    const note = gradePedagogicalNote({
      slug: 'slug-x',
      findings: [],
      blindReader: blindReader('fail_leak'),
    });
    expect(note.grade).toBe('fail');
    expect(note.blocking_codes).toEqual([]);
    expect(note.reasons.join(' ')).toContain('blind_reader');
  });

  it('warn_unsupported_hit degrada para warn, não fail', () => {
    const note = gradePedagogicalNote({
      slug: 'slug-x',
      findings: [],
      blindReader: blindReader('warn_unsupported_hit'),
    });
    expect(note.grade).toBe('warn');
  });

  it('não altera a nota estrutural de gradeSlideReadiness', () => {
    const slide = {
      type: 'concept_map',
      items: [
        { label: 'a', detail: 'C erra ao dizer isso.' },
        { label: 'b' },
        { label: 'c' },
      ],
    };
    expect(gradeSlideReadiness(slide)).toBe('A');
    const note = gradePedagogicalNote({
      slug: 'slug-x',
      findings: detectUnifiedPedagogy({ reverse_study_slides: [slide] }),
    });
    expect(note.grade).toBe('fail');
  });
});

describe('summarizePedagogicalNotes', () => {
  it('agrega contagens e média', () => {
    const notes = [
      gradePedagogicalNote({ slug: 'a', findings: [] }),
      gradePedagogicalNote({ slug: 'b', findings: [], blindReader: blindReader('fail_leak') }),
    ];
    const summary = summarizePedagogicalNotes(notes);
    expect(summary).toMatchObject({ total: 2, pass: 1, fail: 1, warn: 0 });
    expect(summary.avg_score).toBe(80);
  });

  it('média 0 sem notas', () => {
    expect(summarizePedagogicalNotes([]).avg_score).toBe(0);
  });
});
