#!/usr/bin/env tsx
/**
 * Verifica instalação do Cursor SDK + CURSOR_API_KEY para pipeline:orchestrate --sdk.
 *
 *   npm run pipeline:sdk-check
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

function maskKey(key: string): string {
  if (key.length <= 12) return '***';
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

async function main(): Promise<void> {
  let ok = true;

  console.log('[pipeline:sdk-check] Cursor SDK — orquestrador AVANT\n');

  let Agent: { prompt?: unknown; create?: unknown } | undefined;
  try {
    const mod = await import('@cursor/sdk');
    Agent = mod.Agent;
    console.log('✅ @cursor/sdk instalado');
    console.log(`   Agent.prompt: ${typeof Agent?.prompt}`);
    console.log(`   Agent.create: ${typeof Agent?.create}`);
  } catch (err) {
    ok = false;
    console.error('❌ @cursor/sdk não carregou');
    console.error(`   ${err instanceof Error ? err.message : err}`);
    console.error('   Rode: npm install');
  }

  const apiKey = (process.env.CURSOR_API_KEY ?? '').trim();
  const model = (process.env.CURSOR_ORCHESTRATOR_MODEL ?? 'composer-2.5').trim();

  if (apiKey) {
    console.log(`✅ CURSOR_API_KEY definida (${maskKey(apiKey)})`);
  } else {
    ok = false;
    console.log('❌ CURSOR_API_KEY ausente');
    console.log('   1. Cursor Dashboard → Integrations → API Keys');
    console.log('   2. Adicione em .env.local na raiz do repo:');
    console.log('      CURSOR_API_KEY=cursor_...');
    console.log('   3. Ou no PowerShell (sessão atual):');
    console.log('      $env:CURSOR_API_KEY = "cursor_..."');
    console.log('   Template: docs/env.pipeline-sdk.example');
  }

  console.log(`ℹ️  Modelo orquestrador: ${model} (CURSOR_ORCHESTRATOR_MODEL)`);

  console.log('\nComandos prontos:');
  console.log('  npm run pipeline:next-unit -- --subtopico="..." --print-prompt');
  console.log('  npm run pipeline:orchestrate -- --subtopico="..." --dry-run');
  if (apiKey) {
    console.log('  npm run pipeline:orchestrate -- --subtopico="..." --sdk --max-units=1');
  }

  console.log('\nDoc: docs/PIPELINE_SDK_SETUP.md');

  process.exitCode = ok ? 0 : 1;
}

void main();
