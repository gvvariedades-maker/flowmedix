/**
 * @jest-environment node
 */
import { CANONICAL_ALLOWED_R2_BUCKETS } from '@/scripts/backup-automation';
import {
  CANONICAL_PRODUCTION_ALLOWLIST,
  assertAllowedHttpMethod,
  assertAllowedManagementEndpoint,
  assertAllowedProjectRef,
  assertAllowedR2Bucket,
  assertAllowedR2Host,
  assertAllowedR2Target,
  type DrBackupAllowlist,
} from '@/lib/disasterRecovery/allowlist';
import {
  CANONICAL_PRODUCTION_PROJECT_REF,
  CANONICAL_PRODUCTION_R2_BUCKET,
} from '@/lib/disasterRecovery/constants';
import { DrBackupFailClosedError } from '@/lib/disasterRecovery/errors';

const TEST_ALLOWLIST: DrBackupAllowlist = {
  projectRefs: [CANONICAL_PRODUCTION_PROJECT_REF],
  r2Buckets: [CANONICAL_PRODUCTION_R2_BUCKET],
  r2Hosts: ['0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com'],
  managementApiHosts: ['api.supabase.com'],
  allowedHttpMethods: ['POST'],
};

function expectFailClosed(fn: () => void, code: string): void {
  try {
    fn();
    throw new Error(`esperava ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(DrBackupFailClosedError);
    expect((error as DrBackupFailClosedError).code).toBe(code);
  }
}

describe('DR backup allowlist', () => {
  it('deriva buckets do BackupEngine (single source of truth)', () => {
    expect(CANONICAL_ALLOWED_R2_BUCKETS).toContain(CANONICAL_PRODUCTION_R2_BUCKET);
    expect(CANONICAL_PRODUCTION_ALLOWLIST.r2Buckets.every((b) =>
      (CANONICAL_ALLOWED_R2_BUCKETS as readonly string[]).includes(b),
    )).toBe(true);
  });

  it('aceita o project ref canônico e rejeita outro', () => {
    expect(() =>
      assertAllowedProjectRef(CANONICAL_PRODUCTION_PROJECT_REF, CANONICAL_PRODUCTION_ALLOWLIST),
    ).not.toThrow();
    expectFailClosed(
      () => assertAllowedProjectRef('otherprojref0000000000', CANONICAL_PRODUCTION_ALLOWLIST),
      'PROJECT_REF_NOT_ALLOWED',
    );
  });

  it('aceita o endpoint SQL read-only canônico', () => {
    expect(() =>
      assertAllowedManagementEndpoint(
        {
          host: 'api.supabase.com',
          method: 'POST',
          path: `/v1/projects/${CANONICAL_PRODUCTION_PROJECT_REF}/database/query/read-only`,
          projectRef: CANONICAL_PRODUCTION_PROJECT_REF,
        },
        CANONICAL_PRODUCTION_ALLOWLIST,
      ),
    ).not.toThrow();
  });

  it('rejeita o endpoint SQL genérico /database/query', () => {
    expectFailClosed(
      () =>
        assertAllowedManagementEndpoint(
          {
            host: 'api.supabase.com',
            method: 'POST',
            path: `/v1/projects/${CANONICAL_PRODUCTION_PROJECT_REF}/database/query`,
            projectRef: CANONICAL_PRODUCTION_PROJECT_REF,
          },
          CANONICAL_PRODUCTION_ALLOWLIST,
        ),
      'SQL_WRITE_ENDPOINT_NOT_ALLOWED',
    );
  });

  it('rejeita método diferente de POST', () => {
    expectFailClosed(() => assertAllowedHttpMethod('GET', TEST_ALLOWLIST), 'HTTP_METHOD_NOT_ALLOWED');
    expectFailClosed(
      () =>
        assertAllowedManagementEndpoint(
          {
            host: 'api.supabase.com',
            method: 'GET',
            path: `/v1/projects/${CANONICAL_PRODUCTION_PROJECT_REF}/database/query/read-only`,
            projectRef: CANONICAL_PRODUCTION_PROJECT_REF,
          },
          TEST_ALLOWLIST,
        ),
      'HTTP_METHOD_NOT_ALLOWED',
    );
  });

  it('rejeita bucket diferente do canônico', () => {
    expectFailClosed(
      () => assertAllowedR2Bucket('other-vault', CANONICAL_PRODUCTION_ALLOWLIST),
      'R2_BUCKET_NOT_ALLOWED',
    );
    expectFailClosed(
      () => assertAllowedR2Bucket('synthetic-test-vault', CANONICAL_PRODUCTION_ALLOWLIST),
      'R2_BUCKET_NOT_ALLOWED',
    );
  });

  it('rejeita host R2 fora do padrão', () => {
    expectFailClosed(() => assertAllowedR2Host('evil.example', TEST_ALLOWLIST), 'R2_HOST_NOT_ALLOWED');
    expectFailClosed(
      () => assertAllowedR2Host('s3.amazonaws.com', TEST_ALLOWLIST),
      'R2_HOST_NOT_ALLOWED',
    );
    expectFailClosed(
      () => assertAllowedR2Host('nothex.r2.cloudflarestorage.com', TEST_ALLOWLIST),
      'R2_HOST_NOT_ALLOWED',
    );
  });

  it('aceita host R2 no formato e na allowlist de teste; rejeita host formatado mas não listado', () => {
    expect(() =>
      assertAllowedR2Target(
        {
          host: '0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com',
          bucket: CANONICAL_PRODUCTION_R2_BUCKET,
        },
        TEST_ALLOWLIST,
      ),
    ).not.toThrow();
    expectFailClosed(
      () =>
        assertAllowedR2Host(
          'ffffffffffffffffffffffffffffffff.r2.cloudflarestorage.com',
          TEST_ALLOWLIST,
        ),
      'R2_HOST_NOT_ALLOWED',
    );
    expectFailClosed(
      () =>
        assertAllowedR2Host(
          '0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com',
          CANONICAL_PRODUCTION_ALLOWLIST,
        ),
      'R2_HOST_NOT_ALLOWED',
    );
  });
});
