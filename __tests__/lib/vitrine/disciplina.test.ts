import {
  buildDisciplinaSummaries,
  disciplinasVisiveisNoPicker,
  guessDisciplinaFromTituloAula,
  isPortuguesModuloNome,
  isVitrineDisciplineHubMode,
  parseVitrineDisciplina,
  resolveDisciplinaCtaLabel,
  resolveVitrineDisciplinaId,
} from '@/lib/vitrine/disciplina';

describe('disciplina vitrine', () => {
  it('reconhece Língua Portuguesa e default enfermagem', () => {
    expect(isPortuguesModuloNome('Língua Portuguesa')).toBe(true);
    expect(isPortuguesModuloNome('Lingua Portuguesa')).toBe(true);
    expect(isPortuguesModuloNome('Procedimentos de Enfermagem')).toBe(false);
    expect(resolveVitrineDisciplinaId('Língua Portuguesa')).toBe('portugues');
    expect(resolveVitrineDisciplinaId('Farmacologia')).toBe('enfermagem');
  });

  it('parseia query disciplina', () => {
    expect(parseVitrineDisciplina('portugues')).toBe('portugues');
    expect(parseVitrineDisciplina('enfermagem')).toBe('enfermagem');
    expect(parseVitrineDisciplina('math')).toBeNull();
    expect(parseVitrineDisciplina(undefined)).toBeNull();
  });

  it('agrega resumos e esconde picker com uma disciplina', () => {
    const summaries = buildDisciplinaSummaries([
      {
        modulo_nome: 'Procedimentos',
        totalQuestoes: 10,
        trabalhadas: 2,
        acertos: 1,
        totalResolvidas: 2,
      },
      {
        modulo_nome: 'Língua Portuguesa',
        totalQuestoes: 5,
        trabalhadas: 0,
        acertos: 0,
        totalResolvidas: 0,
      },
      {
        modulo_nome: 'Língua Portuguesa',
        totalQuestoes: 3,
        trabalhadas: 1,
        acertos: 1,
        totalResolvidas: 1,
      },
    ]);
    expect(summaries).toEqual([
      expect.objectContaining({
        id: 'enfermagem',
        totalAssuntos: 1,
        totalQuestoes: 10,
        trabalhadas: 2,
        totalResolvidas: 2,
        acertos: 1,
        percentual: 50,
        progressoPct: 20,
      }),
      expect.objectContaining({
        id: 'portugues',
        totalAssuntos: 2,
        totalQuestoes: 8,
        trabalhadas: 1,
        totalResolvidas: 1,
        acertos: 1,
        percentual: 100,
        progressoPct: 13,
      }),
    ]);
    expect(disciplinasVisiveisNoPicker(summaries)).toHaveLength(2);
    expect(
      disciplinasVisiveisNoPicker([
        { ...summaries[0], totalAssuntos: 0 },
        summaries[1],
      ]),
    ).toHaveLength(1);
  });

  it('sem respondidas mantém cobertura por trabalhadas (RPC legada)', () => {
    const summaries = buildDisciplinaSummaries([
      { modulo_nome: 'Procedimentos', totalQuestoes: 10, trabalhadas: 2 },
    ]);
    expect(summaries[0]).toMatchObject({
      progressoPct: 20,
      totalResolvidas: 0,
      percentual: 0,
    });
  });

  it('hub mode só sem seleção e com ≥2 disciplinas', () => {
    const summaries = buildDisciplinaSummaries([
      { modulo_nome: 'Procedimentos', totalQuestoes: 10, trabalhadas: 0 },
      { modulo_nome: 'Língua Portuguesa', totalQuestoes: 5, trabalhadas: 0 },
    ]);
    expect(isVitrineDisciplineHubMode(summaries, null)).toBe(true);
    expect(isVitrineDisciplineHubMode(summaries, 'enfermagem')).toBe(false);
    expect(
      isVitrineDisciplineHubMode(
        [{ ...summaries[0] }, { ...summaries[1], totalAssuntos: 0 }],
        null,
      ),
    ).toBe(false);
  });

  it('heurística de título para retomar estudo', () => {
    expect(guessDisciplinaFromTituloAula('Classes de palavras')).toBe('portugues');
    expect(guessDisciplinaFromTituloAula('Crase')).toBe('portugues');
    expect(guessDisciplinaFromTituloAula('Verificação de Sinais Vitais')).toBe('enfermagem');
  });

  it('CTA por progresso', () => {
    expect(
      resolveDisciplinaCtaLabel({
        id: 'enfermagem',
        label: 'Enfermagem',
        totalAssuntos: 1,
        totalQuestoes: 10,
        trabalhadas: 0,
        progressoPct: 0,
      }),
    ).toBe('Iniciar');
    expect(
      resolveDisciplinaCtaLabel({
        id: 'enfermagem',
        label: 'Enfermagem',
        totalAssuntos: 1,
        totalQuestoes: 10,
        trabalhadas: 4,
        progressoPct: 40,
      }),
    ).toBe('Continuar');
    expect(
      resolveDisciplinaCtaLabel({
        id: 'enfermagem',
        label: 'Enfermagem',
        totalAssuntos: 1,
        totalQuestoes: 10,
        trabalhadas: 10,
        progressoPct: 100,
      }),
    ).toBe('Revisar');
  });
});
