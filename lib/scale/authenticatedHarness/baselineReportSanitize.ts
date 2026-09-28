import { readFileSync } from 'node:fs';

export function readHarnessLogText(filePath: string): string {
  const buf = readFileSync(filePath);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString('utf16le').replace(/^\uFEFF/, '');
  }
  return buf.toString('utf8');
}

export type SanitizedBaselineOperation = {
  operation_id: string;
  kind: string;
  requests: number;
  successes: number;
  failures: number;
  status_counts: Record<string, number>;
  p50_ms: number | null;
  p95_ms: number | null;
  p99_ms: number | null;
  max_ms: number | null;
};

export type SanitizedBaselineReport = {
  schema_version: 1;
  ewu: 'EWU-SCALE-1K-READINESS-001';
  harness_git_sha: string;
  app_staging_git_sha: string;
  vercel_deploy_id: string;
  staging_app_host: string;
  supabase_project_ref: string;
  tier: 'conservative';
  peak_ccu: number;
  measured_duration_ms: number;
  http_requests_sent: number;
  target_mean_rps: number;
  achieved_mean_rps: number;
  setup_failures: number;
  setup_elapsed_ms: number;
  canonical_artifact_digests_git_blob: {
    envelope_version: string;
    envelope_sha256: string;
    allowlist_sha256: string;
  };
  run_50_baseline_worktree_digests_crlf_windows?: {
    envelope_sha256: string;
    allowlist_sha256: string;
    note: string;
  };
  operations: SanitizedBaselineOperation[];
  notes: string[];
  post_baseline_study_read_sweep?: {
    source: string;
    http_403: number;
    http_200: number;
    slug_403_summary: Array<{ default_questao_slug: string; vu_count: number }>;
    commercial_reason_sample: string | null;
  };
};

/** Remove amostras brutas (logs enormes / truncados) mantendo agregados já calculados. */
export function stripLatencySamplesFromHarnessLog(raw: string): string {
  const key = '"latency_ms_samples"';
  let out = '';
  let i = 0;
  while (i < raw.length) {
    const idx = raw.indexOf(key, i);
    if (idx < 0) {
      out += raw.slice(i);
      break;
    }
    out += raw.slice(i, idx + key.length);
    let j = idx + key.length;
    while (j < raw.length && raw[j] !== '[') j += 1;
    if (j >= raw.length) {
      out += ':[]';
      break;
    }
    let depth = 0;
    let k = j;
    for (; k < raw.length; k += 1) {
      const c = raw[k];
      if (c === '[') depth += 1;
      else if (c === ']') {
        depth -= 1;
        if (depth === 0) {
          k += 1;
          break;
        }
      }
    }
    out += ':[]';
    i = k;
  }
  return out;
}

function closeTruncatedJsonObjects(raw: string): string {
  let s = raw.trimEnd();
  if (s.endsWith(',')) s = s.slice(0, -1);
  const closers: string[] = [];
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') closers.push('}');
    else if (ch === '[') closers.push(']');
    else if (ch === '}' || ch === ']') closers.pop();
  }
  if (closers.length > 0) s += closers.reverse().join('');
  return s;
}

export function extractExecuteResultFromHarnessLog(raw: string): Record<string, unknown> | null {
  const prepared = closeTruncatedJsonObjects(stripLatencySamplesFromHarnessLog(raw));
  const chunks: Record<string, unknown>[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < prepared.length; i += 1) {
    const ch = prepared[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        const slice = prepared.slice(start, i + 1);
        try {
          chunks.push(JSON.parse(slice) as Record<string, unknown>);
        } catch {
          // ignore partial json
        }
        start = -1;
      }
    }
  }
  for (const chunk of chunks) {
    if (chunk.harness === 'scale-authenticated' && chunk.mode === 'execute' && chunk.result) {
      return chunk.result as Record<string, unknown>;
    }
  }
  return null;
}

export function buildSanitizedBaselineReport(options: {
  harnessGitSha: string;
  executeResult: Record<string, unknown>;
  canonical: {
    envelope_version: string;
    envelope_digest_sha256: string;
    allowlist_digest_sha256: string;
  };
  worktreeDigestsCrlf?: { envelope_sha256: string; allowlist_sha256: string };
  appStagingGitSha: string;
  vercelDeployId: string;
  stagingAppHost: string;
  supabaseProjectRef: string;
  postBaselineStudyReadSweep?: SanitizedBaselineReport['post_baseline_study_read_sweep'];
}): SanitizedBaselineReport {
  const metrics = options.executeResult.metrics as Record<string, unknown> | undefined;
  const opsRaw = (metrics?.operations as Array<Record<string, unknown>>) ?? [];
  const operations: SanitizedBaselineOperation[] = opsRaw.map((op) => ({
    operation_id: String(op.operation_id ?? ''),
    kind: String(op.kind ?? ''),
    requests: Number(op.requests ?? 0),
    successes: Number(op.successes ?? 0),
    failures: Number(op.failures ?? 0),
    status_counts: (op.status_counts as Record<string, number>) ?? {},
    p50_ms: op.p50_ms != null ? Number(op.p50_ms) : null,
    p95_ms: op.p95_ms != null ? Number(op.p95_ms) : null,
    p99_ms: op.p99_ms != null ? Number(op.p99_ms) : null,
    max_ms: op.max_ms != null ? Number(op.max_ms) : null,
  }));

  const notes: string[] = [
    'Relatório sanitizado — sem tokens, cookies ou secrets.',
    'Latências derivadas do harness metrics; thresholds prospectivos não aplicados.',
  ];
  if (options.worktreeDigestsCrlf) {
    notes.push(
      'RUN_50_BASELINE_WORKTREE_DIGESTS: digests CRLF do checkout Windows usados na autorização runtime da 1ª execução.',
    );
  }

  return {
    schema_version: 1,
    ewu: 'EWU-SCALE-1K-READINESS-001',
    harness_git_sha: options.harnessGitSha,
    app_staging_git_sha: options.appStagingGitSha,
    vercel_deploy_id: options.vercelDeployId,
    staging_app_host: options.stagingAppHost,
    supabase_project_ref: options.supabaseProjectRef,
    tier: 'conservative',
    peak_ccu: 50,
    measured_duration_ms: Number(options.executeResult.measured_elapsed_ms ?? 0),
    http_requests_sent: Number(options.executeResult.http_requests_sent ?? 0),
    target_mean_rps: Number((metrics?.target_mean_rps as number) ?? 5),
    achieved_mean_rps: Number((metrics?.achieved_mean_rps as number) ?? 0),
    setup_failures: Number((metrics?.setup_failures as number) ?? 0),
    setup_elapsed_ms: Number(options.executeResult.setup_elapsed_ms ?? 0),
    canonical_artifact_digests_git_blob: {
      envelope_version: options.canonical.envelope_version,
      envelope_sha256: options.canonical.envelope_digest_sha256,
      allowlist_sha256: options.canonical.allowlist_digest_sha256,
    },
    run_50_baseline_worktree_digests_crlf_windows: options.worktreeDigestsCrlf
      ? {
          envelope_sha256: options.worktreeDigestsCrlf.envelope_sha256,
          allowlist_sha256: options.worktreeDigestsCrlf.allowlist_sha256,
          note: 'Windows working tree / CRLF — histórico do run 50 CCU baseline v1',
        }
      : undefined,
    operations,
    notes,
    post_baseline_study_read_sweep: options.postBaselineStudyReadSweep,
  };
}
