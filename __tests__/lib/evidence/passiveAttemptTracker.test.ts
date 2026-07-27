import {
  createPassiveAttemptTracker,
} from '@/lib/evidence/passiveAttemptTracker';

describe('createPassiveAttemptTracker (EE-I01 / Lote 7)', () => {
  it('gera attempt_id UUID v4 no beginConfirm e reutiliza em retry', () => {
    let t = 1_000_000;
    let n = 0;
    const tracker = createPassiveAttemptTracker({
      now: () => t,
      uuid: () => {
        n += 1;
        return `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`;
      },
    });

    t = 1_000_500;
    const first = tracker.beginConfirm();
    expect(first.attempt_id).toBe('11111111-1111-4111-8111-000000000001');
    expect(first.conviction).toBe('unknown');
    expect(first.response_time_ms).toBe(500);
    expect(first.answer_change_count).toBe(0);

    t = 1_001_000;
    const retry = tracker.beginConfirm();
    expect(retry.attempt_id).toBe(first.attempt_id);
    expect(retry.response_time_ms).toBe(1000);

    tracker.clearPendingAfterSuccess();
    t = 1_002_000;
    const next = tracker.beginConfirm();
    expect(next.attempt_id).toBe('11111111-1111-4111-8111-000000000002');
  });

  it('conta mudanças de seleção após a primeira', () => {
    const tracker = createPassiveAttemptTracker({
      now: () => 0,
      uuid: () => '22222222-2222-4222-8222-000000000001',
    });
    tracker.noteSelectionChange(); // primeira seleção
    tracker.noteSelectionChange(); // troca
    tracker.noteSelectionChange(); // troca
    const payload = tracker.beginConfirm();
    expect(payload.answer_change_count).toBe(2);
  });

  it('marca tab_backgrounded e reseta em nova questão', () => {
    const tracker = createPassiveAttemptTracker({
      now: () => 50,
      uuid: () => '33333333-3333-4333-8333-000000000001',
    });
    tracker.noteVisibilityHidden();
    expect(tracker.beginConfirm().tab_backgrounded).toBe(true);

    tracker.clearPendingAfterSuccess();
    tracker.resetForNewQuestion();
    expect(tracker.getTabBackgrounded()).toBe(false);
    expect(tracker.getAnswerChangeCount()).toBe(0);
    expect(tracker.getPendingAttemptId()).toBeNull();
  });

  it('aplica override de conviction (Lote 8) e mantém unknown por default', () => {
    let t = 5_000;
    const tracker = createPassiveAttemptTracker({
      now: () => t,
      uuid: () => '44444444-4444-4444-8444-000000000001',
    });

    t = 5_200;
    const defaulted = tracker.beginConfirm();
    expect(defaulted.conviction).toBe('unknown');

    t = 5_400;
    const withConviction = tracker.beginConfirm({ conviction: 'certeza' });
    expect(withConviction.conviction).toBe('certeza');
    expect(withConviction.attempt_id).toBe(defaulted.attempt_id);
    // answered_at deve avançar com o novo now() — calculado após a escolha.
    expect(new Date(withConviction.answered_at).getTime()).toBeGreaterThan(
      new Date(defaulted.answered_at).getTime(),
    );
  });
});
