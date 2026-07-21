import {
  buildRunStateMarkdown,
  computeNextUnit,
  defaultMaxUnitsForSlugCount,
  parseForceUnit,
  parseLoteNn,
  PipelineRunStateSchema,
} from '@/lib/catalogMigration/pipelineRunState';
import { buildWorkerPrompt } from '@/lib/catalogMigration/pipelineWorkerPrompt';
import type { RegistryPacote } from '@/lib/catalogMigration/handcraftRegistry';

describe('pipelineRunState', () => {
  it('parseLoteNn extrai número do lote', () => {
    expect(parseLoteNn('imunizacao-g03', 'imunizacao')).toBe(3);
    expect(parseLoteNn('imunizacao-g12', 'imunizacao')).toBe(12);
    expect(parseLoteNn('outro-g01', 'imunizacao')).toBeNull();
  });

  it('defaultMaxUnitsForSlugCount aplica budget anti-estouro', () => {
    expect(defaultMaxUnitsForSlugCount(16)).toBe(4);
    expect(defaultMaxUnitsForSlugCount(50)).toBe(2);
    expect(defaultMaxUnitsForSlugCount(200)).toBe(1);
  });

  it('parseForceUnit aceita handcraft_lote:id', () => {
    const u = parseForceUnit('handcraft_lote:vias-de-administracao-g03');
    expect(u).toEqual({
      type: 'handcraft_lote',
      id: 'vias-de-administracao-g03',
      lote: 'vias-de-administracao-g03',
    });
  });

  it('computeNextUnit com production_ready → done', () => {
    const pacote: RegistryPacote = {
      pacote_prefix: 'demo',
      manifest: 'x',
      status: 'applied',
      total_slugs: 10,
      handcraft_applied: 10,
      production_status: 'production_ready',
    };
    const { unit } = computeNextUnit('Demo', pacote, { mode: 'full' });
    expect(unit.type).toBe('done');
  });

  it('computeNextUnit applied parcial → handcraft_lote', () => {
    const pacote: RegistryPacote = {
      pacote_prefix: 'demo-inexistente-xyz',
      manifest: 'x',
      status: 'in_progress',
      total_slugs: 40,
      handcraft_applied: 8,
      production_status: 'none',
    };
    const { unit } = computeNextUnit('Demo Inexistente', pacote, { mode: 'handcraft' });
    expect(unit.type).toBe('handcraft_lote');
    expect(unit.lote).toMatch(/^demo-inexistente-xyz-g/);
  });

  it('computeNextUnit applied 100% sem production_ready → ship', () => {
    const pacote: RegistryPacote = {
      pacote_prefix: 'demo-ship-xyz',
      manifest: 'x',
      status: 'applied',
      total_slugs: 10,
      handcraft_applied: 10,
      production_status: 'none',
    };
    const { unit } = computeNextUnit('Demo Ship', pacote, { mode: 'ship' });
    expect(unit.type).toBe('ship');
  });

  it('PipelineRunStateSchema valida estado mínimo', () => {
    const parsed = PipelineRunStateSchema.parse({
      version: 1,
      subtopico: 'Imunização',
      pacote_prefix: 'imunizacao',
      mode: 'handcraft',
      total_slugs: 100,
      handcraft_applied: 8,
      next_unit: { type: 'handcraft_lote', id: 'imunizacao-g02', lote: 'imunizacao-g02' },
      completed_units: ['handcraft_lote:imunizacao-g01'],
      blockers: [],
      updated_at: new Date().toISOString(),
    });
    expect(parsed.version).toBe(1);
    expect(buildRunStateMarkdown(parsed)).toContain('Continuar pipeline');
  });
});

describe('pipelineWorkerPrompt', () => {
  it('handcraft_lote gera prompt curto com gates e STOP', () => {
    const state = PipelineRunStateSchema.parse({
      version: 1,
      subtopico: 'Imunização',
      pacote_prefix: 'imunizacao',
      mode: 'handcraft',
      total_slugs: 100,
      handcraft_applied: 8,
      next_unit: {
        type: 'handcraft_lote',
        id: 'imunizacao-g02',
        lote: 'imunizacao-g02',
      },
      completed_units: [],
      blockers: [],
      updated_at: new Date().toISOString(),
    });
    const prompt = buildWorkerPrompt(state, state.next_unit!, { autoApply: false });
    expect(prompt).toContain('imunizacao-g02');
    expect(prompt).toContain('strict-v2-pedagogy');
    expect(prompt).toContain('NÃO --apply');
    expect(prompt).toContain('SOMENTE esta unidade');
    expect(prompt.length).toBeLessThan(3500);
  });
});
