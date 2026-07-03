#!/usr/bin/env tsx
/** Aplica só as duas âncoras cadeia de frio do premium-pilot-manifest. */
import { loadEnvConfig } from '@next/env';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { applyLoteToSupabase } from '@/lib/catalogMigration/applyLote';
import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { validateAndNormalizeQuestao } from '@/lib/catalogMigration/validatePayload';

const IDS = ['ameosc-imunizacao-cadeia-frio', 'avancasp-imunizacao-rede-frio-temperatura'];

async function main() {
  const apply = hasFlag('apply');
  const manifest = JSON.parse(
    readFileSync(resolve(process.cwd(), 'data/premium-pilot-manifest.json'), 'utf8'),
  ) as { items: Array<{ id: string; modulo_slug: string; golden_file: string | null; mode: string }> };

  const items = [];
  for (const id of IDS) {
    const item = manifest.items.find((i) => i.id === id);
    if (!item?.golden_file) throw new Error(`Manifest item not found: ${id}`);
    const goldenPath = resolve(process.cwd(), 'examples', item.golden_file);
    if (!existsSync(goldenPath)) throw new Error(`Golden missing: ${goldenPath}`);
    const raw = JSON.parse(readFileSync(goldenPath, 'utf8'));
    const validated = validateAndNormalizeQuestao(item.modulo_slug, raw);
    if (!validated.ok) throw new Error(`${id}: ${validated.reason}`);
    items.push({ modulo_slug: item.modulo_slug, payload: validated.data });
  }

  const supabase = await createServerSupabase();
  const result = await applyLoteToSupabase(supabase, items, { dryRun: !apply });

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...result }, null, 2));
  if (!apply) {
    console.log('\nRode com --apply para gravar no Supabase.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
