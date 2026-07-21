import {
  evaluateGoldenAnchorGate,
  resolveExamplesPath,
  suggestedAnchorFile,
} from '@/lib/catalogMigration/goldenAnchorGate';

describe('goldenAnchorGate', () => {
  describe('suggestedAnchorFile', () => {
    it('monta path examples com branch e banca do sample', () => {
      expect(
        suggestedAnchorFile({
          pacotePrefix: 'farmacodinamica',
          branchId: 'farmaco_pk_pd_vf',
          cluster: 'VF ADME',
          sampleSlug: 'funcamp-enfermagem-farmacodinamica-1',
        }),
      ).toBe('examples/questao-premium-funcamp-farmacodinamica-farmaco_pk_pd_vf.json');
    });
  });

  describe('resolveExamplesPath', () => {
    it('aceita basename sob examples/', () => {
      const p = resolveExamplesPath('questao-premium-x.json');
      expect(p?.replace(/\\/g, '/')).toMatch(/examples\/questao-premium-x\.json$/);
    });

    it('aceita path examples/…', () => {
      const p = resolveExamplesPath('examples/questao-premium-x.json');
      expect(p?.replace(/\\/g, '/')).toMatch(/examples\/questao-premium-x\.json$/);
    });

    it('retorna null para vazio', () => {
      expect(resolveExamplesPath(null)).toBeNull();
      expect(resolveExamplesPath('')).toBeNull();
    });
  });

  describe('evaluateGoldenAnchorGate', () => {
    it('bloqueia novo_ramo sem has_golden', () => {
      const report = evaluateGoldenAnchorGate({
        subtopico: 'Teste',
        pacotePrefix: 'teste',
        clusterReport: {
          total: 20,
          cluster_decisions: [
            {
              cluster: 'Ramo A',
              count: 8,
              decision: 'novo_ramo',
              has_golden: false,
              golden_file: null,
              pedagogical_branch_proposed: 'ramo_a',
              sample_slugs: ['cpcon-slug-1'],
            },
          ],
        },
      });
      expect(report.gate).toBe('block');
      expect(report.handcraft_allowed).toBe(false);
      expect(report.goldens_needed).toBe(1);
      expect(report.missing[0]?.suggested_file).toContain('examples/');
      expect(report.missing[0]?.sample_slug).toBe('cpcon-slug-1');
    });

    it('passa quando novo_ramo coberto e arquivo existe', () => {
      const report = evaluateGoldenAnchorGate({
        subtopico: 'Farmacodinâmica e Farmacocinética',
        pacotePrefix: 'farmacodinamica',
        clusterReport: {
          total: 13,
          cluster_decisions: [
            {
              cluster: 'Protocolo EV',
              count: 4,
              decision: 'coberto',
              has_golden: true,
              golden_file: 'questao-premium-idecan-omeprazol-ev-ulcera.json',
              pedagogical_branch_proposed: 'farmaco_clinico_protocolo',
              sample_slugs: ['idecan-x'],
            },
          ],
        },
      });
      expect(report.gate).toBe('pass');
      expect(report.handcraft_allowed).toBe(true);
      expect(report.covered.length).toBe(1);
      expect(report.goldens_needed).toBe(0);
    });

    it('warn quando cluster ausente', () => {
      const report = evaluateGoldenAnchorGate({
        subtopico: 'X',
        pacotePrefix: 'x',
        clusterReport: null,
        clusterReportPath: null,
      });
      expect(report.gate).toBe('warn');
      expect(report.handcraft_allowed).toBe(true);
    });

    it('warn em skip de emergência', () => {
      const report = evaluateGoldenAnchorGate({
        subtopico: 'X',
        pacotePrefix: 'x',
        skip: true,
        clusterReport: {
          cluster_decisions: [
            {
              cluster: 'Ramo',
              count: 10,
              decision: 'novo_ramo',
              has_golden: false,
            },
          ],
        },
      });
      expect(report.gate).toBe('warn');
      expect(report.handcraft_allowed).toBe(true);
      expect(report.goldens_needed).toBe(0);
    });

    it('bloqueia has_golden com arquivo fantasma', () => {
      const report = evaluateGoldenAnchorGate({
        subtopico: 'X',
        pacotePrefix: 'x',
        clusterReport: {
          cluster_decisions: [
            {
              cluster: 'Ramo fantasma',
              count: 6,
              decision: 'novo_ramo',
              has_golden: true,
              golden_file: 'questao-premium-nao-existe-zzz.json',
              sample_slugs: ['a'],
            },
          ],
        },
      });
      expect(report.gate).toBe('block');
      expect(report.missing).toHaveLength(1);
      expect(report.missing[0]?.reason).toMatch(/arquivo ausente/);
    });

    it('warn em absorver sem golden', () => {
      const report = evaluateGoldenAnchorGate({
        subtopico: 'X',
        pacotePrefix: 'x',
        clusterReport: {
          cluster_decisions: [
            {
              cluster: 'Pequeno',
              count: 3,
              decision: 'absorver',
              has_golden: false,
            },
          ],
        },
      });
      expect(report.gate).toBe('warn');
      expect(report.handcraft_allowed).toBe(true);
      expect(report.warnings.some((w) => w.includes('absorver'))).toBe(true);
    });
  });
});
