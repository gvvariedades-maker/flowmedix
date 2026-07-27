import {
  buildSkillId,
  createTaxonomyRegistry,
  getSkillDefinition,
  hasMinimumInventory,
  isSkillIdAliasOfBranchOrFamily,
  isValidSkillIdFormat,
  listSkillsByDisciplina,
  listSkillsBySubtopico,
  type EvidenceSkillDefinition,
} from '@/lib/evidence/taxonomy';

function makeSkill(overrides: Partial<EvidenceSkillDefinition> = {}): EvidenceSkillDefinition {
  return {
    skill_id: 'portugues.pontuacao.vocativo',
    disciplina: 'lingua_portuguesa',
    subtopico: 'Pontuação',
    cluster: 'Elementos isolados',
    label: 'Identificar vocativo',
    misconceptions: [],
    minimum_inventory_confirmed: false,
    ...overrides,
  };
}

describe('taxonomy — formato de skill_id', () => {
  it('aceita formato disciplina.cluster.competencia', () => {
    expect(isValidSkillIdFormat('portugues.pontuacao.vocativo')).toBe(true);
    expect(isValidSkillIdFormat(buildSkillId('portugues', 'crase', 'regencia_obrigatoria'))).toBe(
      true,
    );
  });

  it('rejeita formatos inválidos', () => {
    expect(isValidSkillIdFormat('')).toBe(false);
    expect(isValidSkillIdFormat('sem_ponto')).toBe(false);
    expect(isValidSkillIdFormat('Maiuscula.invalida.aqui')).toBe(false);
    expect(isValidSkillIdFormat(123)).toBe(false);
    expect(isValidSkillIdFormat(null)).toBe(false);
  });
});

describe('taxonomy — registro', () => {
  it('cria registro e recupera por skill_id', () => {
    const registry = createTaxonomyRegistry([makeSkill()]);
    const found = getSkillDefinition(registry, 'portugues.pontuacao.vocativo');
    expect(found?.label).toBe('Identificar vocativo');
    expect(getSkillDefinition(registry, 'inexistente.skill.id')).toBeNull();
  });

  it('rejeita skill_id inválido no registro', () => {
    expect(() =>
      createTaxonomyRegistry([makeSkill({ skill_id: 'invalido' })]),
    ).toThrow();
  });

  it('rejeita skill_id duplicado', () => {
    expect(() =>
      createTaxonomyRegistry([makeSkill(), makeSkill()]),
    ).toThrow();
  });

  it('lista por disciplina e por subtopico', () => {
    const registry = createTaxonomyRegistry([
      makeSkill(),
      makeSkill({ skill_id: 'portugues.crase.regencia_obrigatoria', subtopico: 'Crase' }),
    ]);
    expect(listSkillsByDisciplina(registry, 'lingua_portuguesa')).toHaveLength(2);
    expect(listSkillsBySubtopico(registry, 'Crase')).toHaveLength(1);
  });

  it('reporta inventário mínimo confirmado por skill', () => {
    const registry = createTaxonomyRegistry([
      makeSkill({ minimum_inventory_confirmed: true }),
    ]);
    expect(hasMinimumInventory(registry, 'portugues.pontuacao.vocativo')).toBe(true);
    expect(hasMinimumInventory(registry, 'nao_existe.skill.id')).toBe(false);
  });
});

describe('taxonomy — guarda anti-alias (ADR §6)', () => {
  it('detecta skill_id que coincide com pedagogical_branch ou family conhecidos', () => {
    const branches = ['pt_crase', 'via_vf_absorcao'];
    const families = ['vf', 'conceito'];
    expect(isSkillIdAliasOfBranchOrFamily('pt_crase', branches, families)).toBe(true);
    expect(isSkillIdAliasOfBranchOrFamily('vf', branches, families)).toBe(true);
    expect(
      isSkillIdAliasOfBranchOrFamily('portugues.crase.regencia_obrigatoria', branches, families),
    ).toBe(false);
  });
});
