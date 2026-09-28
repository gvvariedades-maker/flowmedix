import {
  buildSanitizedBaselineReport,
  extractExecuteResultFromHarnessLog,
} from '@/lib/scale/authenticatedHarness/baselineReportSanitize';

describe('baselineReportSanitize', () => {
  it('extrai result de log truncado sem latency samples completas', () => {
    const raw = `{"harness":"scale-authenticated","mode":"execute","result":{"executed":true,"http_requests_sent":2,"measured_elapsed_ms":1000,"setup_elapsed_ms":1,"metrics":{"target_mean_rps":5,"achieved_mean_rps":5,"setup_failures":0,"operations":[{"operation_id":"api_estudar_questao","kind":"read","requests":2,"successes":2,"failures":0,"status_counts":{"200":2},"latency_ms_samples":[1,2,`;
    const result = extractExecuteResultFromHarnessLog(raw);
    expect(result?.executed).toBe(true);
    const ops = (result?.metrics as { operations: { operation_id: string }[] }).operations;
    expect(ops[0]?.operation_id).toBe('api_estudar_questao');
  });

  it('extrai result do log do harness', () => {
    const raw = `{"a":1}\n{"harness":"scale-authenticated","mode":"execute","result":{"executed":true,"http_requests_sent":10,"measured_elapsed_ms":1000,"setup_elapsed_ms":50,"metrics":{"target_mean_rps":5,"achieved_mean_rps":4.9,"setup_failures":0,"operations":[]}}}`;
    const result = extractExecuteResultFromHarnessLog(raw);
    expect(result?.executed).toBe(true);
    expect(result?.http_requests_sent).toBe(10);
  });

  it('monta relatório sem secrets', () => {
    const report = buildSanitizedBaselineReport({
      harnessGitSha: 'abc',
      executeResult: {
        executed: true,
        http_requests_sent: 100,
        measured_elapsed_ms: 600000,
        setup_elapsed_ms: 20000,
        metrics: {
          target_mean_rps: 5,
          achieved_mean_rps: 5,
          setup_failures: 0,
          operations: [
            {
              operation_id: 'api_vitrine_page',
              kind: 'read',
              requests: 10,
              successes: 10,
              failures: 0,
              status_counts: { '200': 10 },
              p50_ms: 100,
              p95_ms: 200,
              p99_ms: 300,
              max_ms: 400,
            },
          ],
        },
      },
      canonical: {
        envelope_version: '1.0.3',
        envelope_digest_sha256: '07f7c3b34c29445b6c6b58b9bd73be646ae41123c07f3be0ff2018a846a85179',
        allowlist_digest_sha256: '088b5b0436d57affbee93d96009b6923df80ddb846fd2bb06a0860df9fabb93e',
      },
      appStagingGitSha: 'd1fe4a28',
      vercelDeployId: 'dpl_test',
      stagingAppHost: 'example.vercel.app',
      supabaseProjectRef: 'higsjzfigprqvldpxfwj',
    });
    expect(report.operations).toHaveLength(1);
    expect(report.harness_git_sha).toBe('abc');
    expect(JSON.stringify(report)).not.toMatch(/access_token|cookie_header/i);
  });
});
