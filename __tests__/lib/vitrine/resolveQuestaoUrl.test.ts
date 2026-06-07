import { buildVitrineResolveQuestaoSearchParams } from '@/lib/vitrine/resolveQuestaoUrl';

describe('buildVitrineResolveQuestaoSearchParams', () => {
  it('inclui assunto, alvo e bancas da vitrine', () => {
    const params = buildVitrineResolveQuestaoSearchParams({
      assunto: 'Processo de Enfermagem',
      alvo: ' 847 ',
      estudarQuery: '?banca=IDECAN&page=2&assunto=Outro',
    });
    expect(params.get('assunto')).toBe('Processo de Enfermagem');
    expect(params.get('alvo')).toBe('847');
    expect(params.getAll('banca')).toEqual(['IDECAN']);
    expect(params.get('page')).toBeNull();
    expect(params.get('assunto')).toBe('Processo de Enfermagem');
  });
});
