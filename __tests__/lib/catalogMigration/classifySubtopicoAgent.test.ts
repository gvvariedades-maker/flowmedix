import { classifySubtopicoAgent } from '@/lib/catalogMigration/classifySubtopicoAgent';

describe('classifySubtopicoAgent', () => {
  it('mantém segurança do paciente quando enunciado é identificação', () => {
    const r = classifySubtopicoAgent({
      slug: 'fgv-enfermagem-seguranca-do-paciente-1777102742836-4',
      instruction:
        'Com base no protocolo de identificação do paciente do Ministério da Saúde, analise as afirmativas a seguir.',
      currentSubtopico: 'Segurança do Paciente',
    });
    expect(r.keep_current).toBe(true);
    expect(r.suggested_subtopico).toBe('Segurança do Paciente');
  });

  it('não confunde assistência com IST', () => {
    const r = classifySubtopicoAgent({
      slug: 'test-seguranca',
      instruction: 'Meta 2: Melhorar a efetividade da comunicação entre profissionais da assistência.',
      currentSubtopico: 'Segurança do Paciente',
    });
    expect(r.suggested_subtopico).not.toBe('Infecções Sexualmente Transmissíveis (ISTs)');
  });

  it('move nutricao-aplicada para Promoção à Saúde', () => {
    const r = classifySubtopicoAgent({
      slug: 'cebraspe-nutricao-aplicada-a-enfermagem-123',
      instruction: 'Sobre dietas hospitalares e avaliação nutricional.',
      currentSubtopico: 'Procedimentos Diversos',
    });
    expect(r.suggested_subtopico).toBe('Promoção à Saúde e Prevenção de Agravos');
    expect(r.keep_current).toBe(false);
  });

  it('move curativos slug para Curativos', () => {
    const r = classifySubtopicoAgent({
      slug: 'adm-tec-enfermagem-curativos-e-manejo-de-feridas-1779344773456-1',
      instruction: 'Sobre termoterapia em feridas.',
      currentSubtopico: 'Procedimentos Diversos',
    });
    expect(r.suggested_subtopico).toBe('Curativos e Manejo de Feridas');
  });

  it('move nocoes-de-fisiologia slug para Fisiologia', () => {
    const r = classifySubtopicoAgent({
      slug: 'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-4',
      instruction: 'Sobre fixadores histológicos.',
      currentSubtopico: 'Procedimentos Diversos',
    });
    expect(r.suggested_subtopico).toBe('Noções de Fisiologia');
  });

  it('move hantavirose para Zoonoses', () => {
    const r = classifySubtopicoAgent({
      slug: 'idib-enfermagem-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1778934918280-0',
      instruction: 'Prevenção da hantavirose transmitida por roedores.',
      currentSubtopico: 'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
    });
    expect(r.suggested_subtopico).toBe('Doenças Parasitárias e Zoonoses');
  });
});
