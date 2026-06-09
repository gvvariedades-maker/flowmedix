import {
  FAMILY_VISUAL_PROFILE,
  getFamilyVisualSlideProfile,
  getFamilyVisualProfile,
} from '@/lib/catalogMigration/familyLayoutProfile';

describe('familyVisualProfile', () => {
  it('expõe 7 famílias com pools em todos os slides', () => {
    expect(Object.keys(FAMILY_VISUAL_PROFILE)).toHaveLength(7);
    for (const profile of Object.values(FAMILY_VISUAL_PROFILE)) {
      expect(profile.conceptMap.pool.length).toBeGreaterThan(0);
      expect(profile.goldenRule.pool.length).toBeGreaterThan(0);
      expect(profile.logicFlow.pool.length).toBeGreaterThan(0);
      expect(profile.dangerZone.pool.length).toBeGreaterThan(0);
    }
  });

  it('protocolo ancora molecular no concept_map e cards no logic_flow', () => {
    const protocolo = getFamilyVisualProfile('protocolo');
    expect(protocolo.conceptMap.anchor).toBe('molecular');
    expect(protocolo.logicFlow.anchor).toBe('cards');
    expect(protocolo.dangerZone.anchor).toBe('compare');
  });

  it('legis usa center como âncora tipográfica (reference_table é semântico)', () => {
    const legis = getFamilyVisualSlideProfile('legis', 'goldenRule');
    expect(legis.anchor).toBe('center');
    expect(legis.pool).toContain('banner');
  });

  it('text_fragment ancora cards no danger_zone', () => {
    const dz = getFamilyVisualSlideProfile('text_fragment', 'dangerZone');
    expect(dz.anchor).toBe('cards');
  });
});
