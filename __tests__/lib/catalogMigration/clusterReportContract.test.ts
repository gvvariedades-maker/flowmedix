import {
  ABSORVER_MIN_COUNT,
  resolveClusterDecision,
  strongBranchThreshold,
} from '@/lib/catalogMigration/clusterReportContract';

describe('clusterReportContract', () => {
  describe('strongBranchThreshold', () => {
    it('usa piso 5 para pacotes pequenos', () => {
      expect(strongBranchThreshold(16)).toBe(5);
      expect(strongBranchThreshold(40)).toBe(5);
    });

    it('usa 10% arredondado para cima quando acima de 5', () => {
      expect(strongBranchThreshold(208)).toBe(21);
      expect(strongBranchThreshold(100)).toBe(10);
    });

    it('retorna 5 para total zero', () => {
      expect(strongBranchThreshold(0)).toBe(5);
    });
  });

  describe('resolveClusterDecision', () => {
    const total = 100;
    const threshold = strongBranchThreshold(total);

    it('retorna coberto quando há golden', () => {
      expect(resolveClusterDecision({ hasGolden: true, count: 1, total })).toBe('coberto');
    });

    it('retorna novo_ramo no limiar forte', () => {
      expect(resolveClusterDecision({ hasGolden: false, count: threshold, total })).toBe('novo_ramo');
    });

    it('retorna absorver entre ABSORVER_MIN e limiar', () => {
      expect(resolveClusterDecision({ hasGolden: false, count: ABSORVER_MIN_COUNT, total })).toBe(
        'absorver',
      );
    });

    it('retorna cauda_longa abaixo de ABSORVER_MIN', () => {
      expect(resolveClusterDecision({ hasGolden: false, count: 2, total })).toBe('cauda_longa');
    });
  });
});
