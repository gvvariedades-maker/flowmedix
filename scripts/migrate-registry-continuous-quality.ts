#!/usr/bin/env tsx
/**
 * One-shot: adiciona quality.continuous + slo.p0_block_after_hours em todos os pacotes.
 *
 *   npm run migrate:registry-continuous-quality
 */
import { loadEnvConfig } from '@next/env';
import {
  defaultContinuousQuality,
  loadHandcraftRegistry,
  saveHandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';

loadEnvConfig(process.cwd());

function main(): void {
  const registry = loadHandcraftRegistry();
  let migrated = 0;

  for (const [key, pacote] of Object.entries(registry.pacotes)) {
    const quality = pacote.quality;
    if (!quality) continue;

    if (!quality.continuous) {
      quality.continuous = defaultContinuousQuality();
      migrated += 1;
    }
    if (quality.slo.p0_block_after_hours == null) {
      quality.slo.p0_block_after_hours = 24;
      migrated += 1;
    }

    registry.pacotes[key] = { ...pacote, quality };
  }

  saveHandcraftRegistry(registry);
  console.log(`[migrate:registry-continuous-quality] pacotes atualizados: ${migrated} campos`);
}

main();
