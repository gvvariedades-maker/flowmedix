#!/usr/bin/env tsx
/**
 * Ajuste manual de pedagogical_branch para cobrir 5 ramos CME no catálogo Processamento.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const BRANCH_BY_SLUG: Record<string, string> = {
  'idecan-enfermagem-processamento-de-artigos-e-produtos-de-saude-1778712203076-7': 'cme_processamento_conceito',
  'legalle-enfermagem-processo-de-enfermagem-1780011879977-7': 'cme_processamento_conceito',
  'avancasp-enfermagem-processo-de-enfermagem-1780003031246-7': 'cme_processamento_conceito',
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-1': 'cme_processamento_conceito',
  'amauc-enfermagem-processo-de-enfermagem-1780001613305-0': 'cme_preparo_limpeza',
  'omni-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-7': 'cme_preparo_limpeza',
};

function syncLote(fromLote: string, slug: string, payload: Record<string, unknown>): void {
  for (const lote of ['processamento-g01', 'processamento-g02']) {
    const target = join(loteQuestionsDir(lote), `${slug}.json`);
    if (existsSync(target)) {
      writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    }
  }
}

function main(): void {
  const dir = loteQuestionsDir('processamento-completo');
  let updated = 0;
  for (const [slug, branch] of Object.entries(BRANCH_BY_SLUG)) {
    const path = join(dir, `${slug}.json`);
    const payload = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const meta = { ...(payload.meta as Record<string, unknown>), pedagogical_branch: branch };
    payload.meta = meta;
    writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    syncLote('processamento-completo', slug, payload);
    updated += 1;
    console.log(`[patch-processamento-branches] ${slug} → ${branch}`);
  }
  console.log(`[patch-processamento-branches] done updated=${updated}`);
}

main();
