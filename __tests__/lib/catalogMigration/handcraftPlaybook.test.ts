import {
  buildHandcraftBrief,
  loadHandcraftPlaybook,
  parseHandcraftTrigger,
  resolveRegistryPackage,
} from '@/lib/catalogMigration/handcraftPlaybook';

describe('handcraftPlaybook', () => {
  it('parseHandcraftTrigger extrai subtópico e slug opcional', () => {
    expect(parseHandcraftTrigger('Handcraft: Doenças Respiratórias Crônicas (Asma, DPOC)')).toEqual({
      subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
      slug: undefined,
    });

    expect(
      parseHandcraftTrigger(
        'Handcraft: Doenças Respiratórias Crônicas (Asma, DPOC)\nSlug: foo-bar-1',
      ),
    ).toEqual({
      subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
      slug: 'foo-bar-1',
    });
  });

  it('resolveRegistryPackage para Respiratórias Crônicas', () => {
    const resolved = resolveRegistryPackage('Doenças Respiratórias Crônicas (Asma, DPOC)');
    expect(resolved?.canonicalName).toBe('Doenças Respiratórias Crônicas (Asma, DPOC)');
    expect(resolved?.pkg.pacote_prefix).toBe('respiratorio-cronico');
  });

  it('loadHandcraftPlaybook carrega respiratorio-cronico.json', () => {
    const playbook = loadHandcraftPlaybook('Doenças Respiratórias Crônicas (Asma, DPOC)');
    expect(playbook?.pacote_prefix).toBe('respiratorio-cronico');
    expect(playbook?.pedagogical_branches?.length).toBeGreaterThanOrEqual(5);
    expect(playbook?.scope_default).toBe('subtopico_repair_l3');
  });

  it('buildHandcraftBrief inclui ramos L3 e pipeline', () => {
    const brief = buildHandcraftBrief('Doenças Respiratórias Crônicas (Asma, DPOC)');
    expect(brief).toContain('respiratorio_vf_asma_dpoc');
    expect(brief).toContain('respiratorio_asma_crise');
    expect(brief).toContain('audit:questao-readiness');
    expect(brief).toContain('repair-l3');
  });

  it('buildHandcraftBrief com slug entra em modo single_slug', () => {
    const brief = buildHandcraftBrief('Doenças Respiratórias Crônicas (Asma, DPOC)', {
      slug: 'test-slug-1',
    });
    expect(brief).toContain('test-slug-1');
    expect(brief).toContain('Uma questão');
  });
});
