import { OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL } from '@/lib/neurocanvas/officialLaneProvenanceIgeducProposal';

describe('officialLaneProvenanceIgeducProposal', () => {
  it('proposta: 3 casos, sem materialização, baseline intacta', () => {
    expect(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.status).toBe('proposal_only');
    expect(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.materialization).toBe(
      'forbidden_until_explicit_approval',
    );
    expect(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.cases).toHaveLength(3);
    expect(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.baseline_ref.metrics).toBe(
      '339 / 104 / 11 / 0',
    );
    expect(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.phase_0b.ready).toBe(false);
    expect(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.batch_summary.materialization_authorized).toBe(
      false,
    );
  });

  it('decisões: 2 create + 1 defer', () => {
    const { decisions } = OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.batch_summary;
    expect(decisions.create_corrected_candidate).toBe(2);
    expect(decisions.defer).toBe(1);
    expect(decisions.choose_existing_candidate).toBe(0);

    const [jati, cisrp, triunfo] = OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.cases;
    expect(jati.decision).toBe('create_corrected_candidate');
    expect(jati.official_exam_research.found_on_official_prova_pdf).toBe(true);
    expect(jati.official_exam_research.official_question_number).toBe(38);
    expect(jati.official_exam_research.official_gabarito_letra).toBe('A');

    expect(cisrp.decision).toBe('create_corrected_candidate');
    expect(cisrp.official_exam_research.found_on_official_prova_pdf).toBe(true);
    expect(cisrp.official_exam_research.official_question_number).toBe(48);
    expect(cisrp.official_exam_research.official_gabarito_letra).toBe('E');

    expect(triunfo.decision).toBe('defer');
    expect(triunfo.official_exam_research.found_on_official_prova_pdf).toBe(false);
    expect(triunfo.official_exam_research.official_question_number).toBeNull();
  });

  it('elegíveis a materialização futura = só create', () => {
    expect(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL.batch_summary.materialization_eligible_case_ids).toEqual(
      ['nc-g03-9bc30daff9fcfbc0', 'nc-g03-7df66747dffa2e92'],
    );
  });
});
