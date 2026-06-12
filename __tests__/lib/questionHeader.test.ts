import {
  buildDerivedQuestionHeaderLine,
  buildQuestionExamDetailLine,
  buildQuestionHeaderChips,
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

  it('buildQuestionHeaderChips separa banca e ano', () => {
    const chips = buildQuestionHeaderChips({
      banca: 'Instituto Consulplan',
      ano: '2024',
      topico: 'Procedimentos',
    });
    expect(chips).toEqual([
      { id: 'banca', label: 'Instituto Consulplan', tone: 'banca' },
      { id: 'ano', label: '2024', tone: 'ano' },
    ]);
  });

  it('buildQuestionExamDetailLine monta cargo e órgão', () => {
    const detail = buildQuestionExamDetailLine({
      banca: 'FEPESE',
      orgao: 'Pref Pitangueiras',
      ano: '2024',
      prova: 'Tec Enf',
      topico: 'Enfermagem',
      subtopico: 'Verificação de Sinais Vitais',
    });
    expect(detail).toBe('Técnico de Enfermagem (Pref Pitangueiras)');
  });
});
