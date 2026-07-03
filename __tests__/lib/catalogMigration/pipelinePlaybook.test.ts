import {
  buildPipelineBrief,
  parsePipelineCompletoTrigger,
  resolvePipelinePhase,
} from '@/lib/catalogMigration/pipelinePlaybook';
import { buildCatalogProgramReport } from '@/lib/catalogMigration/catalogProgramStatus';

describe('pipelinePlaybook', () => {
  it('parsePipelineCompletoTrigger extrai subtópico, slug e modificadores', () => {
    expect(parsePipelineCompletoTrigger('Pipeline completo: Imunização')).toEqual({
      subtopico: 'Imunização',
      slug: undefined,
      handcraftOnly: false,
      qualityOnly: false,
    });

    expect(
      parsePipelineCompletoTrigger(
        'Pipeline completo: Enfermagem em Central de Material e Esterilização (CME)\nSlug: foo-bar-1\nSó qualidade',
      ),
    ).toEqual({
      subtopico: 'Enfermagem em Central de Material e Esterilização (CME)',
      slug: 'foo-bar-1',
      handcraftOnly: false,
      qualityOnly: true,
    });
  });

  it('resolvePipelinePhase para CME production_ready → fase3', () => {
    const phase = resolvePipelinePhase({
      status: 'applied',
      total_slugs: 35,
      handcraft_applied: 35,
      production_status: 'production_ready',
    });
    expect(phase).toBe('fase3');
  });

  it('buildPipelineBrief inclui persona, v2 e strict-v2-pedagogy', () => {
    const brief = buildPipelineBrief('Enfermagem em Central de Material e Esterilização (CME)');
    expect(brief).toContain('professor de concursos');
    expect(brief).toContain('strict-v2-pedagogy');
    expect(brief).toContain('concept_map');
    expect(brief).toContain('fase3');
  });

  it('buildPipelineBrief sem pacote sugere fase0', () => {
    const brief = buildPipelineBrief('Mobilização e Posicionamento do Paciente');
    expect(brief).toContain('Fase 0');
    expect(brief).toContain('audit:subtopico-inventory');
  });

  it('buildPipelineBrief Imunização em andamento sugere fase1', () => {
    const brief = buildPipelineBrief('Imunização');
    expect(brief).toContain('Fase 1');
    expect(brief).toContain('Handcraft golden-v1');
  });
});

describe('catalogProgramStatus', () => {
  it('buildCatalogProgramReport lista 41 subtópicos canônicos', () => {
    const report = buildCatalogProgramReport();
    expect(report.total_canonicos).toBe(41);
    expect(report.rows.length).toBe(41);
    expect(report.counts.production_ready).toBeGreaterThanOrEqual(10);
  });
});
