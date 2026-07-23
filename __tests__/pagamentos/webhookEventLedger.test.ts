/**
 * @jest-environment node
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  claimStripeWebhookEvent,
  hashStripeWebhookPayload,
  markStripeWebhookEventProcessed,
  releaseStripeWebhookEventClaim,
} from '@/lib/stripe/webhookEventLedger';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function createLedgerSupabaseMock(options?: {
  insertError?: { code?: string; message?: string } | null;
  existingStatus?: 'processing' | 'processed' | null;
}) {
  const insert = jest.fn().mockResolvedValue({ error: options?.insertError ?? null });
  const eqDelete = jest.fn().mockResolvedValue({ error: null });
  const deleteFn = jest.fn().mockReturnValue({ eq: eqDelete });
  const eqUpdate = jest.fn().mockResolvedValue({ error: null });
  const update = jest.fn().mockReturnValue({ eq: eqUpdate });
  const maybeSingle = jest.fn().mockResolvedValue({
    data:
      options?.existingStatus != null
        ? { status: options.existingStatus }
        : options?.existingStatus === null
          ? null
          : null,
    error: null,
  });
  const eqSelect = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq: eqSelect });

  const from = jest.fn((table: string) => {
    if (table !== 'stripe_webhook_events') {
      throw new Error(`Tabela inesperada: ${table}`);
    }
    return { insert, delete: deleteFn, select, update };
  });

  return {
    from,
    insert,
    delete: deleteFn,
    eqDelete,
    update,
    eqUpdate,
    select,
    maybeSingle,
  } as unknown as SupabaseClient & {
    insert: jest.Mock;
    delete: jest.Mock;
    eqDelete: jest.Mock;
    update: jest.Mock;
    eqUpdate: jest.Mock;
    maybeSingle: jest.Mock;
  };
}

describe('webhookEventLedger', () => {
  it('hashStripeWebhookPayload é estável (sha256 hex)', () => {
    expect(hashStripeWebhookPayload('{"id":"evt"}')).toBe(
      hashStripeWebhookPayload('{"id":"evt"}'),
    );
    expect(hashStripeWebhookPayload('a')).toHaveLength(64);
    expect(hashStripeWebhookPayload('a')).not.toBe(hashStripeWebhookPayload('b'));
  });

  it('claimStripeWebhookEvent retorna claimed em insert ok', async () => {
    const supabase = createLedgerSupabaseMock();

    const result = await claimStripeWebhookEvent(
      supabase,
      { id: 'evt_1', type: 'checkout.session.completed' },
      { payloadHash: 'abc' },
    );

    expect(result).toBe('claimed');
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: 'evt_1',
        type: 'checkout.session.completed',
        status: 'processing',
        payload_hash: 'abc',
        processed_at: null,
      }),
    );
  });

  it('claimStripeWebhookEvent retorna already_processed quando status=processed', async () => {
    const supabase = createLedgerSupabaseMock({
      insertError: { code: '23505', message: 'duplicate key' },
      existingStatus: 'processed',
    });

    const result = await claimStripeWebhookEvent(supabase, {
      id: 'evt_done',
      type: 'checkout.session.completed',
    });

    expect(result).toBe('already_processed');
  });

  it('claimStripeWebhookEvent retorna in_flight quando status=processing', async () => {
    const supabase = createLedgerSupabaseMock({
      insertError: { code: '23505', message: 'duplicate key' },
      existingStatus: 'processing',
    });

    const result = await claimStripeWebhookEvent(supabase, {
      id: 'evt_busy',
      type: 'checkout.session.completed',
    });

    expect(result).toBe('in_flight');
  });

  it('markStripeWebhookEventProcessed atualiza status', async () => {
    const supabase = createLedgerSupabaseMock();

    await markStripeWebhookEventProcessed(supabase, 'evt_mark');

    expect(supabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'processed',
      }),
    );
    expect(supabase.eqUpdate).toHaveBeenCalledWith('event_id', 'evt_mark');
  });

  it('releaseStripeWebhookEventClaim deleta por event_id', async () => {
    const supabase = createLedgerSupabaseMock();

    await releaseStripeWebhookEventClaim(supabase, 'evt_release');

    expect(supabase.delete).toHaveBeenCalled();
    expect(supabase.eqDelete).toHaveBeenCalledWith('event_id', 'evt_release');
  });
});
