import {
  filterModulosForQuestaoPanel,
  hasQuestaoPanelFilterCriteria,
  type QuestaoPanelModulo,
} from '@/lib/questao-filter/matchModulos';

const modulos: QuestaoPanelModulo[] = [
  {
    modulo_slug: 'urg-1',
    titulo_aula: 'Urgências e Emergências',
    modulo_nome: 'Urgências',
    banca: 'CESPE',
    avant_codigo: 101,
  },
  {
    modulo_slug: 'farm-1',
    titulo_aula: 'Farmacologia',
    modulo_nome: 'Farm',
    banca: 'FGV',
    avant_codigo: 202,
  },
  {
    modulo_slug: 'q-101-alias',
    titulo_aula: 'Urgências e Emergências',
    modulo_nome: 'Urgências',
    banca: 'CESPE',
    avant_codigo: 101,
  },
  {
    modulo_slug: 'pt-crase-1',
    titulo_aula: 'Crase',
    modulo_nome: 'Língua Portuguesa',
    banca: 'FGV',
    avant_codigo: 501,
  },
];

describe('filterModulosForQuestaoPanel', () => {
  it('filtra por múltiplas bancas (match ANY)', () => {
    const result = filterModulosForQuestaoPanel(modulos, { bancas: ['CESPE', 'FGV'] });
    expect(result).toHaveLength(4);
    const onlyCespe = filterModulosForQuestaoPanel(modulos, { bancas: ['CESPE'] });
    expect(onlyCespe).toHaveLength(2);
  });

  it('filtra por múltiplos assuntos', () => {
    const result = filterModulosForQuestaoPanel(modulos, {
      assuntos: ['Farmacologia'],
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.modulo_slug).toBe('farm-1');
  });

  it('filtra por disciplina (português vs enfermagem)', () => {
    const pt = filterModulosForQuestaoPanel(modulos, { disciplina: 'portugues' });
    expect(pt).toHaveLength(1);
    expect(pt[0]?.modulo_slug).toBe('pt-crase-1');

    const enf = filterModulosForQuestaoPanel(modulos, { disciplina: 'enfermagem' });
    expect(enf).toHaveLength(3);
    expect(enf.every((m) => m.modulo_slug !== 'pt-crase-1')).toBe(true);
  });

  it('combina disciplina + banca', () => {
    const result = filterModulosForQuestaoPanel(modulos, {
      disciplina: 'enfermagem',
      bancas: ['FGV'],
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.modulo_slug).toBe('farm-1');
  });

  it('busca por Q- e slug', () => {
    expect(filterModulosForQuestaoPanel(modulos, { q: 'q-101' })).toHaveLength(2);
    expect(filterModulosForQuestaoPanel(modulos, { q: 'urg-1' })).toHaveLength(1);
    expect(filterModulosForQuestaoPanel(modulos, { q: 'cespe' })).toHaveLength(2);
  });

  it('hasQuestaoPanelFilterCriteria exige critério para lote', () => {
    expect(hasQuestaoPanelFilterCriteria({})).toBe(false);
    expect(hasQuestaoPanelFilterCriteria({ bancas: ['FGV'] })).toBe(true);
    expect(hasQuestaoPanelFilterCriteria({ q: 'farm' })).toBe(true);
    expect(hasQuestaoPanelFilterCriteria({ disciplina: 'portugues' })).toBe(true);
  });
});
