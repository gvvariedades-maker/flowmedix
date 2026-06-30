#!/usr/bin/env tsx
/**
 * Fase 9 — retro piloto CME + Processamento → production_ready.
 *
 * Uso:
 *   npm run retro:pilot-quality
 *   npm run retro:pilot-quality -- --promote
 */
import { loadEnvConfig } from '@next/env';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';

const PILOT_SUBTOPICOS = [
  'Enfermagem em Central de Material e Esterilização (CME)',
  'Processamento de Artigos e Produtos de Saúde',
];

function run(cmd: string, args: string[]): boolean {
  console.log(`\n>>> ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd: process.cwd() });
  return result.status === 0;
}

function main(): void {
  const promote = hasFlag('promote');
  let allOk = true;

  for (const subtopico of PILOT_SUBTOPICOS) {
    console.log(`\n=== Retro piloto: ${subtopico} ===`);

    const prefix = subtopico.includes('CME') ? 'cme' : 'processamento';
    if (!run('npx', ['tsx', 'scripts/reconcile-handcraft-manifest.ts', `--pacote-prefix=${prefix}`])) {
      allOk = false;
    }

    const qualityArgs = [
      'tsx',
      'scripts/audit-subtopico-quality.ts',
      `--subtopico=${subtopico}`,
    ];
    if (promote) qualityArgs.push('--promote');
    if (!run('npx', qualityArgs)) {
      allOk = false;
    }
  }

  console.log(`\n[retro:pilot-quality] concluído — ${allOk ? 'OK' : 'com falhas'}`);
  process.exitCode = allOk ? 0 : 1;
}

main();
