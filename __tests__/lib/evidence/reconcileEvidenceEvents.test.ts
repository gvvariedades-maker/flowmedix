import {
  buildBackfillEventDraft,
  reconcileEvidenceEvents,
  type ReconcileAttemptSourceRecord,
  type ReconcileEventRecord,
} from '@/lib/evidence/reconcileEvidenceEvents';

function source(
  overrides: Partial<ReconcileAttemptSourceRecord> = {},
): ReconcileAttemptSourceRecord {
  return {
    source_table: 'historico_questoes',
    source_id: 'hq-1',
    user_id: 'user-1',
    question_id: 'questao-1',
    session_id: null,
    attempt_id: null,
    selected_alternative: null,
    correct: null,
    conviction: null,
    context: 'regular_practice',
    question_version: null,
    occurred_at: '2026-01-01T10:00:00.000Z',
    ...overrides,
  };
}

function event(overrides: Partial<ReconcileEventRecord> = {}): ReconcileEventRecord {
  return {
    attempt_id: 'attempt-1',
    user_id: 'user-1',
    question_id: 'questao-1',
    session_id: null,
    selected_alternative: 'A',
    correct: true,
    created_at: '2026-01-01T10:00:05.000Z',
    ...overrides,
  };
}

describe('reconcileEvidenceEvents', () => {
  it('pareia por attempt_id quando disponível na fonte', () => {
    const src = source({ attempt_id: 'attempt-1', correct: true });
    const evt = event();
    const report = reconcileEvidenceEvents({ sources: [src], events: [evt], window_ms: 60_000 });

    expect(report.counts.paired).toBe(1);
    expect(report.paired[0].matched_by).toBe('attempt_id');
    expect(report.counts.gaps_missing_event).toBe(0);
    expect(report.counts.gaps_missing_source).toBe(0);
  });

  it('pareia por secundário (user+question+janela) quando attempt_id ausente na fonte', () => {
    const src = source({ occurred_at: '2026-01-01T10:00:00.000Z' });
    const evt = event({ created_at: '2026-01-01T10:00:02.000Z' });
    const report = reconcileEvidenceEvents({ sources: [src], events: [evt], window_ms: 60_000 });

    expect(report.counts.paired).toBe(1);
    expect(report.paired[0].matched_by).toBe('secondary');
  });

  it('não pareia fora da janela de tempo — gera gap', () => {
    const src = source({ occurred_at: '2026-01-01T10:00:00.000Z' });
    const evt = event({ created_at: '2026-01-01T10:20:00.000Z' });
    const report = reconcileEvidenceEvents({ sources: [src], events: [evt], window_ms: 60_000 });

    expect(report.counts.paired).toBe(0);
    expect(report.counts.gaps_missing_event).toBe(1);
    expect(report.counts.gaps_missing_source).toBe(1);
  });

  it('respeita session_id quando presente na fonte (não pareia sessão diferente)', () => {
    const src = source({ session_id: 'sess-a', occurred_at: '2026-01-01T10:00:00.000Z' });
    const evt = event({ session_id: 'sess-b', created_at: '2026-01-01T10:00:02.000Z' });
    const report = reconcileEvidenceEvents({ sources: [src], events: [evt], window_ms: 60_000 });

    expect(report.counts.paired).toBe(0);
    expect(report.counts.gaps_missing_event).toBe(1);
  });

  it('gap de historico_questoes (sem selected_alternative) nunca é backfillable', () => {
    const src = source({
      source_table: 'historico_questoes',
      selected_alternative: null,
      correct: true,
      question_version: null,
      occurred_at: '2026-01-01T10:00:00.000Z',
    });
    const report = reconcileEvidenceEvents({ sources: [src], events: [], window_ms: 60_000 });

    expect(report.counts.gaps_missing_event).toBe(1);
    expect(report.gaps_missing_event[0].backfillable).toBe(false);
    expect(report.counts.unresolved).toBe(1);
    expect(report.counts.backfill_candidates).toBe(0);
  });

  it('gap de simulado_respostas com metadados completos é backfillable', () => {
    const src = source({
      source_table: 'simulado_respostas',
      selected_alternative: 'B',
      correct: false,
      question_version: 'a'.repeat(64),
      context: 'simulation',
      occurred_at: '2026-01-01T10:00:00.000Z',
    });
    const report = reconcileEvidenceEvents({ sources: [src], events: [], window_ms: 60_000 });

    expect(report.counts.backfill_candidates).toBe(1);
    expect(report.counts.unresolved).toBe(0);
    expect(report.gaps_missing_event[0].backfillable).toBe(true);
  });

  it('detecta outcome mismatch (P1) sem corrigir silenciosamente', () => {
    const src = source({ attempt_id: 'attempt-1', selected_alternative: 'A', correct: true });
    const evt = event({ attempt_id: 'attempt-1', selected_alternative: 'B', correct: false });
    const report = reconcileEvidenceEvents({ sources: [src], events: [evt], window_ms: 60_000 });

    expect(report.counts.paired).toBe(0);
    expect(report.counts.outcome_mismatches).toBe(1);
    expect(report.outcome_mismatches[0].reason).toBe('selected_alternative_mismatch');
  });

  it('evento sem fonte correspondente entra em gaps_missing_source', () => {
    const evt = event({ user_id: 'user-sem-fonte' });
    const report = reconcileEvidenceEvents({ sources: [], events: [evt], window_ms: 60_000 });

    expect(report.counts.gaps_missing_source).toBe(1);
    expect(report.gaps_missing_source[0].event.attempt_id).toBe('attempt-1');
  });

  it('não assume 1:1 por (user_id, question_id) — múltiplos eventos pareiam fontes distintas', () => {
    const src1 = source({ source_id: 'hq-1', occurred_at: '2026-01-01T10:00:00.000Z' });
    const src2 = source({ source_id: 'hq-2', occurred_at: '2026-01-01T10:05:00.000Z' });
    const evt1 = event({ attempt_id: 'attempt-a', created_at: '2026-01-01T10:00:01.000Z' });
    const evt2 = event({ attempt_id: 'attempt-b', created_at: '2026-01-01T10:05:01.000Z' });
    const report = reconcileEvidenceEvents({
      sources: [src1, src2],
      events: [evt1, evt2],
      window_ms: 60_000,
    });

    expect(report.counts.paired).toBe(2);
    const pairedIds = report.paired.map((p) => p.event.attempt_id).sort();
    expect(pairedIds).toEqual(['attempt-a', 'attempt-b']);
  });
});

describe('buildBackfillEventDraft', () => {
  it('retorna null quando gap não é backfillable', () => {
    const src = source({ selected_alternative: null });
    const draft = buildBackfillEventDraft(
      { kind: 'gap_missing_event', source: src, backfillable: false, reason: 'no_secondary_match' },
      'new-attempt-id',
      '2026-01-01T12:00:00.000Z',
    );
    expect(draft).toBeNull();
  });

  it('constrói draft com source=reconcile_backfill e sem inventar tempo', () => {
    const src = source({
      source_table: 'simulado_respostas',
      selected_alternative: 'C',
      correct: true,
      question_version: 'b'.repeat(64),
      context: 'diagnostic',
      session_id: 'sess-x',
    });
    const draft = buildBackfillEventDraft(
      { kind: 'gap_missing_event', source: src, backfillable: true, reason: 'no_secondary_match' },
      'new-attempt-id',
      '2026-01-01T12:00:00.000Z',
    );

    expect(draft).not.toBeNull();
    expect(draft?.source).toBe('reconcile_backfill');
    expect(draft?.attempt_id).toBe('new-attempt-id');
    expect(draft?.selected_alternative).toBe('C');
    expect(draft?.correct).toBe(true);
    expect(draft?.conviction).toBe('unknown');
    expect(draft?.context).toBe('diagnostic');
    expect(draft?.session_id).toBe('sess-x');
    expect(draft?.started_at).toBeNull();
    expect(draft?.answered_at).toBeNull();
    expect(draft?.response_time_status).toBe('unknown');
    expect(draft?.is_internal).toBe(false);
  });
});
