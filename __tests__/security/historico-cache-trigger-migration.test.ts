/**
 * @jest-environment node
 *
 * Invariantes da migration 20260814120000 — reset 1A (trigger DEFINER + DELETE STATEMENT).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATION = 'supabase/migrations/20260814120000_historico_cache_trigger_definer.sql';

describe('migration historico cache trigger definer', () => {
  const sql = readFileSync(join(process.cwd(), MIGRATION), 'utf8');

  it('torna os três wrappers SECURITY DEFINER com search_path fixo', () => {
    expect(sql).toContain('trigger_invalidate_cache_historico_insert');
    expect(sql).toContain('trigger_invalidate_cache_historico_update');
    expect(sql).toContain('trigger_invalidate_cache_historico_delete');
    expect(sql.match(/SECURITY DEFINER/g)?.length).toBeGreaterThanOrEqual(3);
    expect(sql).toContain('SET search_path TO pg_catalog, public');
  });

  it('qualifica a webhook e não concede EXECUTE a authenticated', () => {
    expect(sql).toContain("PERFORM public.invalidate_cache_via_webhook('historico_questoes'");
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) FROM PUBLIC, anon, authenticated',
    );
    expect(sql).not.toMatch(
      /GRANT EXECUTE ON FUNCTION public\.invalidate_cache_via_webhook\(text, text\) TO (PUBLIC|anon|authenticated)/,
    );
  });

  it('DELETE do histórico é FOR EACH STATEMENT e RETURN NULL', () => {
    expect(sql).toContain('FOR EACH STATEMENT');
    expect(sql).toMatch(
      /trigger_invalidate_cache_historico_delete[\s\S]*RETURN NULL/,
    );
    expect(sql).not.toMatch(
      /trigger_invalidate_cache_historico_delete[\s\S]*RETURN OLD/,
    );
  });

  it('revoga EXECUTE dos wrappers para anon e authenticated', () => {
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.trigger_invalidate_cache_historico_delete() FROM PUBLIC, anon, authenticated',
    );
  });
});
