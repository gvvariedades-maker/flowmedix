/**
 * @jest-environment node
 *
 * FSRS MVP R5 — ops report: dry-run, go/no-go, ausência de PII.
 */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  evaluateFsrsGoNoGo,
  findFsrsOpsReportPiiLeaks,
  opsReportArtifactFileName,
  renderFsrsOpsReportMarkdown,
  zeroFsrsOpsMetrics,
} from '@/lib/fsrs/opsReport';

describe('fsrs opsReport (pure)', () => {
  it('zero metrics → critérios unknown (exceto default_on)', () => {
    const criteria = evaluateFsrsGoNoGo(zeroFsrsOpsMetrics());
    expect(criteria.every((c) => c.status === 'unknown')).toBe(true);
    expect(criteria.map((c) => c.id)).toEqual([
      'volume',
      'retention_good_ge7d',
      'accuracy_d7',
      'accuracy_d14',
      'lapses_per_user_day',
      'due_load',
      'same_stem_fallback',
      'inventory_missing',
      'default_on',
    ]);
  });

  it('template markdown inclui barras go/no-go do plano', () => {
    const md = renderFsrsOpsReportMarkdown({
      generatedAt: new Date('2026-07-28T15:00:00.000Z'),
      metrics: zeroFsrsOpsMetrics(),
      mode: 'dry-run',
    });
    expect(md).toContain('**Modo:** `dry-run`');
    expect(md).toContain('Retenção Good (intervalo ≥ 7d)');
    expect(md).toContain('Acerto D+7');
    expect(md).toContain('Acerto D+14');
    expect(md).toContain('Lapses / usuário / dia');
    expect(md).toContain('Carga due');
    expect(md).toContain('same_stem_fallback');
    expect(md).toContain('inventory_missing');
    expect(md).toMatch(/Cards \| 0/);
    expect(md).toMatch(/Logs \| 0/);
    expect(findFsrsOpsReportPiiLeaks(md)).toEqual([]);
  });

  it('detecta PII se infiltrar no markdown', () => {
    expect(
      findFsrsOpsReportPiiLeaks('contato: aluno@example.com no relatório'),
    ).toContain('email');
    expect(findFsrsOpsReportPiiLeaks('cpf 123.456.789-09')).toContain(
      'cpf-like',
    );
  });

  it('pass/fail coerente com barras provisórias', () => {
    const criteria = evaluateFsrsGoNoGo({
      ...zeroFsrsOpsMetrics(),
      logs: 100,
      good: 80,
      again: 20,
      sameStemFallback: 10,
      inventoryMissing: 5,
      goodRateIntervalGe7d: 0.8,
      intervalGe7dSample: 60,
      accuracyD7: 0.7,
      accuracyD7Sample: 40,
      accuracyD14: 0.6,
      accuracyD14Sample: 25,
      lapsesPerUserDay: 1.2,
      dueLoadRatio: 0.4,
      dueNow: 4,
      sameStemRate: 0.1,
      inventoryMissingRate: 0.05,
    });
    const byId = Object.fromEntries(criteria.map((c) => [c.id, c.status]));
    expect(byId.volume).toBe('pass');
    expect(byId.retention_good_ge7d).toBe('pass');
    expect(byId.accuracy_d7).toBe('pass');
    expect(byId.accuracy_d14).toBe('pass');
    expect(byId.lapses_per_user_day).toBe('pass');
    expect(byId.due_load).toBe('pass');
    expect(byId.same_stem_fallback).toBe('pass');
    expect(byId.inventory_missing).toBe('pass');
    expect(byId.default_on).toBe('unknown');
  });
});

describe('fsrs-mvp-ops-report --dry-run (CLI)', () => {
  let dir: string;
  const repoRoot = join(__dirname, '../../..');

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'fsrs-ops-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('exit 0 sem credenciais e escreve artefato zerado sem PII', () => {
    const result = spawnSync(
      process.execPath,
      [
        require.resolve('tsx/cli'),
        join(repoRoot, 'scripts/fsrs-mvp-ops-report.ts'),
        '--dry-run',
        `--out-dir=${dir}`,
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        env: {
          ...process.env,
          NEXT_PUBLIC_SUPABASE_URL: '',
          SUPABASE_SERVICE_ROLE_KEY: '',
        },
      },
    );

    expect(result.status).toBe(0);
    expect(result.stderr || '').not.toMatch(/obrigatórias/);

    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const file = join(dir, opsReportArtifactFileName(day, 'dry-run'));
    const md = readFileSync(file, 'utf8');
    expect(md).toContain('dry-run');
    expect(md).toMatch(/\| Cards \| 0 \|/);
    expect(md).toMatch(/\| Logs \| 0 \|/);
    expect(md).toContain('Good rate ∈ [0.70, 0.95]');
    expect(md).toContain('inventory_missing');
    expect(findFsrsOpsReportPiiLeaks(md)).toEqual([]);
  });
});
