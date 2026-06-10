import {
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
