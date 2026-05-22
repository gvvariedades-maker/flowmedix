import { mergeTemplateDefaults } from '@/lib/lp/pages';

describe('listPublishedLpPagesForCatalog', () => {
  it('mapeia item de catálogo a partir de config válido', () => {
    const config = mergeTemplateDefaults(
      { oferta: { preco: '14,90' } },
      {
        concurso: {
          cidade: 'Recife',
          cargo: 'Técnico em Enfermagem',
          banca: 'CESPE',
          nomeBanca: 'CESPE',
          vagas: '10',
          dataProva: '2026-09-01',
          dataProvaFormatada: '01/09/2026',
          statusInscricoes: 'Abertas',
          remuneracao: 'R$ 3.000',
          taxaInscricao: 'R$ 80',
          orgao: 'Prefeitura',
        },
        copy: {
          headlinePrincipal: 'Headline teste',
          subtitulo: 'Sub',
          dores: ['a', 'b', 'c'],
          perigosBanca: ['p1', 'p2', 'p3'],
          listaBeneficios: ['benefício'],
          disclaimer: 'disc',
          disclaimerLegal: 'legal',
        },
        walkthrough: { imagens: ['/a.jpg'] },
      },
    );
    expect(config.concurso.cidade).toBe('Recife');
    expect(config.copy.headlinePrincipal).toBe('Headline teste');
  });
});
