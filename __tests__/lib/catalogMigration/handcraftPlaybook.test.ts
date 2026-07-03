import {
  buildHandcraftBrief,
  formatProibidoList,
  loadHandcraftPlaybook,
  parseHandcraftTrigger,
  resolveFirstLote,
  resolveRegistryPackage,
  substitutePlaybookPlaceholders,
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
    expect(brief).toContain('**Primeiro lote:** `respiratorio-cronico-repair-l3-g01`');
    expect(brief).toContain('catalog:patch-pedagogical-branch');
  });

  it('buildHandcraftBrief renderiza proibido do playbook', () => {
    const brief = buildHandcraftBrief('Farmacodinâmica e Farmacocinética');
    expect(brief).toContain('## Proibido (playbook)');
    expect(brief).toContain('`catalog:upgrade-premium`');
    expect(formatProibidoList(loadHandcraftPlaybook('Farmacodinâmica e Farmacocinética'))).toContain(
      '`ai:generate`',
    );
  });

  it('buildHandcraftBrief perioperatória usa after_handcraft com strict-v2', () => {
    const brief = buildHandcraftBrief('Assistência Perioperatória (Inclui SRPA)');
    expect(brief).toContain('--strict-v2-pedagogy');
    expect(brief).toContain('perioperatoria-repair-v3-g01');
  });

  it('resolveFirstLote prioriza modes.first_lote', () => {
    const playbook = loadHandcraftPlaybook('Doenças Respiratórias Crônicas (Asma, DPOC)');
    const pkg = resolveRegistryPackage('Doenças Respiratórias Crônicas (Asma, DPOC)')?.pkg;
    expect(resolveFirstLote(playbook, pkg, 'subtopico_repair_l3')).toBe(
      'respiratorio-cronico-repair-l3-g01',
    );
  });

  it('substitutePlaybookPlaceholders expande lote e slug', () => {
    expect(
      substitutePlaybookPlaceholders(
        'npm run audit:questao-readiness -- --file=data/catalog-migration/<lote>/questions/<slug>.json',
        {
          lote: 'foo-g01',
          slug: 'bar-1',
          canonical: 'Vias de Administração',
          prefix: 'vias-de-administracao',
        },
      ),
    ).toBe('npm run audit:questao-readiness -- --file=data/catalog-migration/foo-g01/questions/bar-1.json');
  });

  it('buildHandcraftBrief Imunização inclui ramo cadeia_frio, L2 e patch-pedagogical-branch', () => {
    const brief = buildHandcraftBrief('Imunização');
    expect(brief).toContain('imunizacao_cadeia_frio');
    expect(brief).toContain('**Primeiro lote:** `imunizacao-g01`');
    expect(brief).toContain('catalog:patch-pedagogical-branch');
    expect(brief).toContain('audit:slug-alignment');
    expect(brief).toContain('audit:numeric-factcheck');
    expect(brief).toContain('capture:questao-review');
    expect(brief).toContain('test:e2e:visual-molds');
    expect(brief).toContain('Cadeia de frio');
  });

  it('buildHandcraftBrief com slug entra em modo single_slug', () => {
    const brief = buildHandcraftBrief('Doenças Respiratórias Crônicas (Asma, DPOC)', {
      slug: 'test-slug-1',
    });
    expect(brief).toContain('test-slug-1');
    expect(brief).toContain('Uma questão');
  });
});
