import {
  applyVitrineQualityGateToPage,
  buildVitrineQualityGateState,
  filterModulosByVitrineQualityGate,
  invalidateVitrineQualityGateCache,
  isTituloAulaVisibleInVitrine,
} from '@/lib/catalogMigration/vitrineQualityGate';
import {
  defaultQuality,
  loadHandcraftRegistry,
  type HandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';

jest.mock('@/lib/catalogMigration/handcraftRegistry', () => {
  const actual = jest.requireActual<typeof import('@/lib/catalogMigration/handcraftRegistry')>(
    '@/lib/catalogMigration/handcraftRegistry',
  );
  return {
    ...actual,
    loadHandcraftRegistry: jest.fn(),
  };
});

const loadRegistry = loadHandcraftRegistry as jest.MockedFunction<typeof loadHandcraftRegistry>;

const ORIGINAL_GATE = process.env.QUALITY_VITRINE_GATE;

function mockRegistry(pacotes: HandcraftRegistry['pacotes']): HandcraftRegistry {
  return { version: 2, updated_at: '2026-06-29', pacotes };
}

describe('buildVitrineQualityGateState', () => {
  it('marca só production_ready como sellable', () => {
    const registry = mockRegistry({
      CME: {
        pacote_prefix: 'cme',
        manifest: '',
        status: 'applied',
        total_slugs: 1,
        handcraft_applied: 1,
        production_status: 'none',
        quality: defaultQuality(),
      },
      Processamento: {
        pacote_prefix: 'processamento',
        manifest: '',
        status: 'applied',
        total_slugs: 1,
        handcraft_applied: 1,
        production_status: 'production_ready',
        quality: defaultQuality(),
      },
    });

    const state = buildVitrineQualityGateState(registry);
    expect(state.gatedKeys.has('cme')).toBe(true);
    expect(state.sellableKeys.has('cme')).toBe(false);
    expect(state.sellableKeys.has('processamento')).toBe(true);
  });
});

describe('isTituloAulaVisibleInVitrine', () => {
  beforeEach(() => {
    process.env.QUALITY_VITRINE_GATE = 'true';
    invalidateVitrineQualityGateCache();
    loadRegistry.mockReturnValue(
      mockRegistry({
        'Enfermagem em Central de Material e Esterilização (CME)': {
          pacote_prefix: 'cme',
          manifest: '',
          status: 'applied',
          total_slugs: 1,
          handcraft_applied: 1,
          production_status: 'none',
          quality: defaultQuality(),
        },
      }),
    );
  });

  afterEach(() => {
    if (ORIGINAL_GATE === undefined) delete process.env.QUALITY_VITRINE_GATE;
    else process.env.QUALITY_VITRINE_GATE = ORIGINAL_GATE;
    jest.clearAllMocks();
  });

  it('legado fora do registry permanece visível', () => {
    expect(isTituloAulaVisibleInVitrine('Imunização')).toBe(true);
  });

  it('pacote none no registry fica oculto para aluno', () => {
    expect(
      isTituloAulaVisibleInVitrine('Enfermagem em Central de Material e Esterilização (CME)'),
    ).toBe(false);
  });

  it('admin bypass', () => {
    expect(
      isTituloAulaVisibleInVitrine('Enfermagem em Central de Material e Esterilização (CME)', {
        isAdmin: true,
      }),
    ).toBe(true);
  });

  it('gate desligado via env', () => {
    process.env.QUALITY_VITRINE_GATE = 'false';
    expect(
      isTituloAulaVisibleInVitrine('Enfermagem em Central de Material e Esterilização (CME)'),
    ).toBe(true);
  });

  it('casa o pacote sem diferenciar maiúsculas', () => {
    expect(
      isTituloAulaVisibleInVitrine('enfermagem em central de material e esterilização (cme)'),
    ).toBe(false);
  });

  it('título vazio permanece visível', () => {
    expect(isTituloAulaVisibleInVitrine('')).toBe(true);
    expect(isTituloAulaVisibleInVitrine(null)).toBe(true);
  });

  it('carrega o registry uma vez para milhares de lookups', () => {
    const titulo = 'Enfermagem em Central de Material e Esterilização (CME)';
    for (let i = 0; i < 5476; i += 1) {
      isTituloAulaVisibleInVitrine(i % 2 === 0 ? titulo : 'Imunização');
    }
    expect(loadRegistry).toHaveBeenCalledTimes(1);
  });
});

describe('filterModulosByVitrineQualityGate', () => {
  beforeEach(() => {
    process.env.QUALITY_VITRINE_GATE = 'true';
    invalidateVitrineQualityGateCache();
    loadRegistry.mockReturnValue(
      mockRegistry({
        'Gated None': {
          pacote_prefix: 'g',
          manifest: '',
          status: 'applied',
          total_slugs: 1,
          handcraft_applied: 1,
          production_status: 'none',
          quality: defaultQuality(),
        },
      }),
    );
  });

  afterEach(() => {
    if (ORIGINAL_GATE === undefined) delete process.env.QUALITY_VITRINE_GATE;
    else process.env.QUALITY_VITRINE_GATE = ORIGINAL_GATE;
  });

  it('mantém legado e remove gated não vendável', () => {
    const out = filterModulosByVitrineQualityGate([
      { titulo_aula: 'Legacy Topic' },
      { titulo_aula: 'Gated None' },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.titulo_aula).toBe('Legacy Topic');
  });
});

describe('applyVitrineQualityGateToPage', () => {
  beforeEach(() => {
    process.env.QUALITY_VITRINE_GATE = 'true';
    invalidateVitrineQualityGateCache();
    loadRegistry.mockReturnValue(
      mockRegistry({
        Hidden: {
          pacote_prefix: 'h',
          manifest: '',
          status: 'applied',
          total_slugs: 1,
          handcraft_applied: 1,
          production_status: 'blocked',
          quality: defaultQuality(),
        },
      }),
    );
  });

  afterEach(() => {
    if (ORIGINAL_GATE === undefined) delete process.env.QUALITY_VITRINE_GATE;
    else process.env.QUALITY_VITRINE_GATE = ORIGINAL_GATE;
  });

  it('filtra grupos e facets', () => {
    const page = applyVitrineQualityGateToPage({
      groups: [
        {
          titulo_aula: 'Visible Legacy',
          modulo_nome: 'Q',
          banca: 'FGV',
          questoes: [],
          acertos: 0,
          erros: 0,
          totalResolvidas: 0,
          totalQuestoes: 2,
          totalNeuroSlides: 0,
          trabalhadas: 0,
          percentual: 0,
          firstSlug: 'a',
        },
        {
          titulo_aula: 'Hidden',
          modulo_nome: 'Q',
          banca: 'FGV',
          questoes: [],
          acertos: 0,
          erros: 0,
          totalResolvidas: 0,
          totalQuestoes: 3,
          totalNeuroSlides: 0,
          trabalhadas: 0,
          percentual: 0,
          firstSlug: 'b',
        },
      ],
      facets: { bancas: ['FGV'], assuntos: ['Visible Legacy', 'Hidden'] },
      pagination: { page: 1, perPage: 12, totalGroups: 2, totalPages: 1 },
      totalModulosFiltrados: 5,
    });

    expect(page.groups).toHaveLength(1);
    expect(page.facets?.assuntos).toEqual(['Visible Legacy']);
    expect(page.totalModulosFiltrados).toBe(2);
  });
});
