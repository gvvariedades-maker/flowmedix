import {
  buildEstudarContextQuerySuffix,
  estudarPayloadSearchContextKey,
  parseEstudarSearchParams,
} from '@/lib/estudar/parseEstudarSearchParams';
import { buildVitrineEstudarQuery } from '@/lib/vitrine/estudarQuery';

describe('parseEstudarSearchParams', () => {
  it('parseia disciplina válida da vitrine', () => {
    expect(parseEstudarSearchParams({ disciplina: 'portugues' }).vitrineDisciplina).toBe(
      'portugues',
    );
    expect(parseEstudarSearchParams({ disciplina: 'enfermagem' }).vitrineDisciplina).toBe(
      'enfermagem',
    );
    expect(parseEstudarSearchParams({ disciplina: 'outra' }).vitrineDisciplina).toBeNull();
  });

  it('buildEstudarContextQuerySuffix alinha com buildVitrineEstudarQuery (inclui disciplina)', () => {
    const parsed = parseEstudarSearchParams({
      banca: 'AOCP',
      page: '2',
      disciplina: 'portugues',
    });
    const suffix = buildEstudarContextQuerySuffix(parsed);
    expect(suffix).toBe(
      buildVitrineEstudarQuery({
        bancas: ['AOCP'],
        assuntos: [],
        page: 2,
        disciplina: 'portugues',
      }),
    );
    expect(suffix).toContain('disciplina=portugues');
  });

  it('estudarPayloadSearchContextKey inclui disciplina', () => {
    expect(estudarPayloadSearchContextKey({ disciplina: 'portugues' })).toBe(
      'disciplina=portugues',
    );
  });
});
