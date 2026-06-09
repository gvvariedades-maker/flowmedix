import {
  buildDerivedQuestionHeaderLine,
  DEFAULT_CARGO_HEADER,
  inferCargoHeaderFromProva,
  normalizeCargoHeader,
} from '@/lib/questionHeader';

describe('questionHeader — cargo Técnico de Enfermagem', () => {
  it('DEFAULT_CARGO_HEADER é o rótulo completo', () => {
    expect(DEFAULT_CARGO_HEADER).toBe('Técnico de Enfermagem');
  });

  it('inferCargoHeaderFromProva reconhece Tec Enf', () => {
    expect(inferCargoHeaderFromProva('Tec Enf (Pref Concórdia)')).toBe(DEFAULT_CARGO_HEADER);
    expect(inferCargoHeaderFromProva('Técnico de Enfermagem')).toBe(DEFAULT_CARGO_HEADER);
  });

  it('normalizeCargoHeader expande TÉCNICO legado', () => {
    expect(normalizeCargoHeader('TÉCNICO')).toBe(DEFAULT_CARGO_HEADER);
    expect(normalizeCargoHeader('TECNICO')).toBe(DEFAULT_CARGO_HEADER);
    expect(normalizeCargoHeader('Enfermeiro')).toBe('Enfermeiro');
  });

  it('buildDerivedQuestionHeaderLine usa Técnico de Enfermagem', () => {
    const line = buildDerivedQuestionHeaderLine({
      banca: 'FEPESE',
      orgao: 'Pref Concórdia/SAMU',
      ano: '2024',
      prova: 'Tec Enf (Pref Concórdia/SAMU)',
      topico: 'Enfermagem',
      subtopico: 'Processo de Enfermagem',
    });
    expect(line).toBe('FEPESE – Técnico de Enfermagem (Pref Concórdia/SAMU) 2024');
  });

  it('buildDerivedQuestionHeaderLine normaliza cargo_header TÉCNICO no JSON', () => {
    const line = buildDerivedQuestionHeaderLine({
      banca: 'Cesgranrio',
      orgao: 'UNEMAT',
      ano: '2024',
      cargo_header: 'TÉCNICO',
      topico: 'Saúde Pública',
    });
    expect(line).toBe('Cesgranrio – Técnico de Enfermagem (UNEMAT) 2024');
  });
});
