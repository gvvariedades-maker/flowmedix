import { OFFICIAL_LANE_PROVENANCE_JUNDIAI_QUADRIX_PROPOSAL } from '@/lib/neurocanvas/officialLaneProvenanceJundiaiQuadrixProposal';

describe('officialLaneProvenanceJundiaiQuadrixProposal', () => {
  it('proposta: 2 casos defer, sem materialização', () => {
    expect(OFFICIAL_LANE_PROVENANCE_JUNDIAI_QUADRIX_PROPOSAL.status).toBe('proposal_only');
    expect(OFFICIAL_LANE_PROVENANCE_JUNDIAI_QUADRIX_PROPOSAL.materialization).toBe(
      'forbidden_until_explicit_approval',
    );
    expect(OFFICIAL_LANE_PROVENANCE_JUNDIAI_QUADRIX_PROPOSAL.cases).toHaveLength(2);
    expect(OFFICIAL_LANE_PROVENANCE_JUNDIAI_QUADRIX_PROPOSAL.batch_summary.decisions.defer).toBe(2);
    for (const c of OFFICIAL_LANE_PROVENANCE_JUNDIAI_QUADRIX_PROPOSAL.cases) {
      expect(c.decision).toBe('defer');
      expect(c.official_exam_research.found_on_official_prova_pdf).toBe(false);
      expect(c.official_exam_research.official_question_number).toBeNull();
    }
  });

  it('mapeia slugs canônicos corretos (hipótese tier B)', () => {
    const [jundiai, quadrix] = OFFICIAL_LANE_PROVENANCE_JUNDIAI_QUADRIX_PROPOSAL.cases;
    expect(jundiai.proposed_canonical_slug).toBe('vunesp-jundiai-crase-tira-qual-3776323');
    expect(quadrix.proposed_canonical_slug).toBe('quadrix-ses-sp-termos-folhetos-enquanto-3779634');
    expect(jundiai.tec_id).toBe('3776323');
    expect(quadrix.tec_id).toBe('3779634');
  });
});
