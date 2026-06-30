import { resolveClusterIdeal, formatMoldPackage } from '@/lib/slides/l3MoldGapCatalog';
import { ADOLESCENTE_GENERIC_DESIGN } from '@/lib/slides/pedagogicalBranch';

describe('l3MoldGapCatalog', () => {
  const subtopico = 'Saúde do Adolescente';
  const generic = formatMoldPackage(ADOLESCENTE_GENERIC_DESIGN);

  it('violência sexual → ok_generico com ramo violencia_protecao', () => {
    const r = resolveClusterIdeal(subtopico, 'Violência sexual e indicadores', 4, 25, generic);
    expect(r.branch_id).toBe('adolescente_violencia_protecao');
    expect(r.branch_implemented).toBe(true);
    expect(r.decision).toBe('ok_generico');
    expect(r.ideal_mold_package).toContain('genérico');
  });

  it('gravidez → ok_existente adolescent-*', () => {
    const r = resolveClusterIdeal(subtopico, 'Gravidez / pré-natal / riscos', 3, 18, generic);
    expect(r.branch_id).toBe('adolescente_etica_sigilo');
    expect(r.decision).toBe('ok_existente');
  });

  it('puberdade cluster genérico se rotulado como desenvolvimento', () => {
    const r = resolveClusterIdeal(subtopico, 'Diretrizes MS adolescente (EXCETO)', 2, 12, generic);
    expect(r.decision).toBe('ok_generico');
  });

  it('CME autoclave com volume alto pode elevar a molde_inedito', () => {
    const r = resolveClusterIdeal(
      'Enfermagem em Central de Material e Esterilização (CME)',
      'Autoclave e métodos de esterilização',
      10,
      28.6,
      'bridge · minimal',
    );
    expect(r.branch_id).toBe('cme_autoclave_metodos');
    expect(r.decision).toBe('molde_inedito');
  });

  it('Segurança do Paciente identificação → ok_existente', () => {
    const r = resolveClusterIdeal(
      'Segurança do Paciente',
      'Identificação do paciente',
      7,
      11.3,
      'bridge · minimal · cards · list',
    );
    expect(r.branch_id).toBe('sp_identificacao');
    expect(r.decision).toBe('ok_existente');
    expect(r.branch_implemented).toBe(true);
  });

  it('Segurança do Paciente quedas com volume → ok_generico', () => {
    const r = resolveClusterIdeal(
      'Segurança do Paciente',
      'Prevenção de quedas',
      11,
      17.7,
      'bridge · minimal',
    );
    expect(r.branch_id).toBe('sp_prevencao_quedas');
    expect(r.decision).toBe('ok_generico');
  });

  it('Segurança do Paciente eventos adversos → ok_generico', () => {
    const r = resolveClusterIdeal(
      'Segurança do Paciente',
      'Eventos adversos e incidentes',
      9,
      14.5,
      'bridge · minimal',
    );
    expect(r.branch_id).toBe('sp_eventos_adversos');
    expect(r.decision).toBe('ok_generico');
  });
});
