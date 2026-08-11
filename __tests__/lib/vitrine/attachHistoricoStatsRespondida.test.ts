import { attachHistoricoStats, type ModuloEstudoRow } from '@/lib/vitrineFilters';

const modulo = (slug: string): ModuloEstudoRow => ({
  id: slug,
  modulo_slug: slug,
  modulo_nome: 'Enfermagem',
  titulo_aula: 'Imunização',
  banca: 'CPCON',
  avant_codigo: 1,
  created_at: '2026-08-01T00:00:00.000Z',
});

describe('attachHistoricoStats — respondida', () => {
  it('exclui placeholder respondida=false do % e mantém estudo reverso', () => {
    const modulos = [modulo('q-1')];
    const historico = [
      {
        modulo_slug: 'q-1',
        acertou: false,
        estudo_reverso_concluido: true,
        respondida: false,
      },
    ];

    const [row] = attachHistoricoStats(modulos, historico);
    expect(row.estudoReversoConcluido).toBe(true);
    expect(row.stats).toMatchObject({ acertos: 0, total: 0, percentual: 0 });
  });

  it('conta só tentativas respondidas no percentual', () => {
    const modulos = [modulo('q-1'), modulo('q-2')];
    const historico = [
      {
        modulo_slug: 'q-1',
        acertou: true,
        estudo_reverso_concluido: true,
        respondida: true,
      },
      {
        modulo_slug: 'q-2',
        acertou: false,
        estudo_reverso_concluido: true,
        respondida: false,
      },
    ];

    const withStats = attachHistoricoStats(modulos, historico);
    expect(withStats.find((m) => m.modulo_slug === 'q-1')?.stats).toMatchObject({
      acertos: 1,
      total: 1,
      percentual: 100,
    });
    expect(withStats.find((m) => m.modulo_slug === 'q-2')?.stats).toMatchObject({
      acertos: 0,
      total: 0,
      percentual: 0,
    });
  });
});
