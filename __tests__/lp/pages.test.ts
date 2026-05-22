import { mergeTemplateDefaults } from '@/lib/lp/pages';
import type { LPConcursoConfig } from '@/app/_components/LPConcurso';

describe('mergeTemplateDefaults', () => {
  const pageConfig: LPConcursoConfig = {
    concurso: {
      cidade: 'João Pessoa',
      cargo: 'Técnico em Enfermagem',
      banca: 'IDECAN',
      nomeBanca: 'IDECAN',
      vagas: '10',
      dataProva: '2026-09-01',
      dataProvaFormatada: '01/09/2026',
      statusInscricoes: 'Abertas',
      remuneracao: 'R$ 3.000',
      taxaInscricao: 'R$ 80',
      orgao: 'Prefeitura',
    },
    oferta: { preco: '19,90' },
    copy: {
      headlinePrincipal: 'Headline JP',
      subtitulo: 'Sub JP',
      dores: ['d1', 'd2', 'd3'],
      perigosBanca: ['p1', 'p2', 'p3'],
      listaBeneficios: ['b1'],
      disclaimer: 'disc',
      disclaimerLegal: 'legal',
    },
    walkthrough: { imagens: ['/a.jpg'] },
  };

  it('mantém oferta da página quando template tem preço default', () => {
    const merged = mergeTemplateDefaults({ oferta: { preco: '14,90' } }, pageConfig);
    expect(merged.oferta?.preco).toBe('19,90');
  });

  it('preserva bloco concurso da página', () => {
    const merged = mergeTemplateDefaults(
      { concurso: { cidade: 'Default' } as LPConcursoConfig['concurso'] },
      pageConfig,
    );
    expect(merged.concurso.cidade).toBe('João Pessoa');
  });
});
