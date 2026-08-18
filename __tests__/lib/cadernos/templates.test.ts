import {
  buildDesempenhoPreset,
  buildNotebookTitleSuggestions,
  buildQuickAddPreset,
  moduloMatchesBanca,
  pickWizardBatchModulos,
  resolveBancaFilterOption,
  type ModuloTemplateRow,
} from '@/lib/cadernos/templates';

const modulos: ModuloTemplateRow[] = [
  { modulo_slug: 'q-urg-1', titulo_aula: 'Urgências e Emergências', modulo_nome: 'Urg', banca: 'CESPE' },
  { modulo_slug: 'q-urg-2', titulo_aula: 'Urgências e Emergências', modulo_nome: 'Urg', banca: 'CESPE' },
  { modulo_slug: 'q-farm-1', titulo_aula: 'Farmacodinâmica e Farmacocinética', modulo_nome: 'Farm', banca: 'CESPE' },
  { modulo_slug: 'q-ab-1', titulo_aula: 'Atenção Básica / Saúde da Família', modulo_nome: 'AB', banca: 'FGV' },
];

describe('lib/cadernos/templates', () => {
  it('buildNotebookTitleSuggestions usa edital quando disponível', () => {
    const suggestions = buildNotebookTitleSuggestions({
      nome: 'Campina Grande',
      banca: 'CESPE',
      orgao: 'PMCG',
      ano: 2026,
      slug: 'campina',
    });
    expect(suggestions[0]).toBe('Meu edital — CESPE');
    expect(suggestions).toContain('Revisão PMCG');
  });

  it('buildQuickAddPreset prioriza assuntos da banca do edital', () => {
    const preset = buildQuickAddPreset(
      { nome: 'Edital', banca: 'CESPE', orgao: null, ano: null, slug: 'x' },
      modulos,
    );
    expect(preset.banca).toBe('CESPE');
    expect(preset.assuntosTop3[0]?.titulo).toBe('Urgências e Emergências');
    expect(preset.assuntosTop3[0]?.count).toBe(2);
    expect(preset.suggestedBatchSize).toBe(10);
  });

  it('moduloMatchesBanca aceita correspondência parcial', () => {
    expect(moduloMatchesBanca('CESPE/CEBRASPE', 'CESPE')).toBe(true);
    expect(moduloMatchesBanca('FGV', 'CESPE')).toBe(false);
  });

  it('resolveBancaFilterOption encontra banca parcial no catálogo', () => {
    expect(resolveBancaFilterOption('CESPE', ['FGV', 'CESPE/CEBRASPE'])).toBe('CESPE/CEBRASPE');
    expect(resolveBancaFilterOption('CESPE', ['FGV'])).toBe('');
  });

  it('pickWizardBatchModulos limita lote e prioriza assuntos top', () => {
    const preset = buildQuickAddPreset(
      { nome: 'Edital', banca: 'CESPE', orgao: null, ano: null, slug: 'x' },
      modulos,
    );
    const batch = pickWizardBatchModulos(modulos, preset);
    expect(batch.length).toBe(3);
    expect(batch.every((m) => m.banca === 'CESPE')).toBe(true);
    expect(batch[0]?.titulo_aula).toBe('Urgências e Emergências');
  });
});

describe('preset do hub /desempenho (modo estrito)', () => {
  it('declara origem, strict e conta as questões de cada assunto marcado', () => {
    const preset = buildDesempenhoPreset(['Urgências e Emergências', ' '], modulos);

    expect(preset.origem).toBe('desempenho');
    expect(preset.strict).toBe(true);
    expect(preset.assuntosTop3).toEqual([{ titulo: 'Urgências e Emergências', count: 2 }]);
  });

  it('não completa o lote com assuntos fora da seleção', () => {
    const preset = buildDesempenhoPreset(['Urgências e Emergências'], modulos);
    const batch = pickWizardBatchModulos(modulos, preset);

    expect(batch).toHaveLength(2);
    expect(batch.every((m) => m.titulo_aula === 'Urgências e Emergências')).toBe(true);
  });

  it('lote vazio quando o assunto escolhido não tem questão liberada', () => {
    const preset = buildDesempenhoPreset(['Saúde do Adolescente'], modulos);
    expect(preset.assuntosTop3[0]?.count).toBe(0);
    expect(pickWizardBatchModulos(modulos, preset)).toEqual([]);
  });

  it('deduplica assuntos e respeita o teto do lote', () => {
    const preset = buildDesempenhoPreset(
      ['Urgências e Emergências', 'Urgências e Emergências'],
      modulos,
    );
    expect(preset.assuntosTop3).toHaveLength(1);
    expect(preset.suggestedBatchSize).toBe(10);
  });

  it('estrito com banca sem match não volta ao catálogo inteiro', () => {
    const preset = {
      ...buildDesempenhoPreset(['Urgências e Emergências'], modulos),
      banca: 'VUNESP',
    };
    expect(pickWizardBatchModulos(modulos, preset)).toEqual([]);
  });
});
