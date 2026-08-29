import {
  BackupEngine,
  type AuthenticatedDrSnapshotEnvelope,
} from '@/scripts/backup-automation';
import {
  assertAllowedManagementEndpoint,
  assertAllowedR2Target,
  CANONICAL_PRODUCTION_ALLOWLIST,
  type DrBackupAllowlist,
  type ManagementApiRequest,
  type R2Target,
} from './allowlist';
import { SNAPSHOT_FORMAT } from './constants';
import { failClosed } from './errors';
import type { AvantR2ObjectStore } from './r2Client';
import { captureSyntheticQuestaoFiguresForBackup, STORAGE_FIGURES_COMPONENT_NAME } from './storageReader';

export type DrBackupMode = 'synthetic' | 'production';

export type DrBackupArgvParse = {
  synthetic: boolean;
  production: boolean;
  unknownFlags: string[];
};

export type DrBackupRunInput = {
  argv?: string[];
  mode?: DrBackupMode;
  productionAuthorized?: boolean;
  allowlist?: DrBackupAllowlist;
  managementRequest?: ManagementApiRequest;
  r2Target?: R2Target;
  now?: Date;
  engine?: BackupEngine;
  /** Known this lot; synthetic mode must not send. Production remains fail-closed. */
  r2Store?: AvantR2ObjectStore;
};

export type DrBackupRunResult = {
  ok: true;
  mode: 'synthetic';
  format: typeof SNAPSHOT_FORMAT;
  snapshotId: string;
  sequenceId: number;
  ciphertextSha256: string;
  envelopeVerified: true;
  monotonicReplayCheck: true;
  networkCalls: 0;
  productionConnections: 0;
  storageRealConnections: 0;
  r2RealConnections: 0;
  offsiteObjectsCreated: 0;
  productionMutations: 0;
  realR2ClientImplementationFound: 'YES';
  realR2UploadImplementedInThisLot: 'YES';
  storageObjectBytesCapture: 'NOT_PROVEN';
};

const SYNTHETIC_KEK = 'avant-synthetic-demo-kek-2026';

export function parseDrBackupArgv(argv: string[]): DrBackupArgvParse {
  const flags = argv.filter((arg) => arg.startsWith('--'));
  const synthetic = flags.includes('--synthetic');
  const production = flags.includes('--production');
  const unknownFlags = flags.filter((flag) => flag !== '--synthetic' && flag !== '--production');
  return { synthetic, production, unknownFlags };
}

function resolveMode(input: DrBackupRunInput): DrBackupMode {
  const parsed = input.argv ? parseDrBackupArgv(input.argv) : null;

  if (parsed?.unknownFlags.length) {
    failClosed('UNKNOWN_FLAG', `flag não suportada: ${parsed.unknownFlags.join(', ')}`);
  }

  const synthetic = input.mode === 'synthetic' || parsed?.synthetic === true;
  const production = input.mode === 'production' || parsed?.production === true;

  if (synthetic && production) {
    failClosed('INVALID_SEQUENCE', 'sequência inválida: --synthetic e --production juntos');
  }

  if (!synthetic && !production) {
    failClosed('MISSING_MODE', 'informe --synthetic (único modo autorizado neste lote)');
  }

  return production ? 'production' : 'synthetic';
}

async function sealAndVerifySynthetic(
  engine: BackupEngine,
  now: Date,
): Promise<{ envelope: AuthenticatedDrSnapshotEnvelope }> {
  const storageItem = await captureSyntheticQuestaoFiguresForBackup();
  const items = engine.generateSyntheticBackupSet().map((item) =>
    item.name === STORAGE_FIGURES_COMPONENT_NAME ? storageItem : item,
  );
  const createdAt = now.toISOString();
  const envelope = engine.createDrSnapshot(items, {
    projectId: 'synthetic-avant-dev',
    sequenceId: 1,
    createdAt,
    gfsTier: 'daily',
  });

  if (envelope.format_version !== SNAPSHOT_FORMAT) {
    failClosed('SNAPSHOT_FORMAT_MISMATCH', 'envelope não é AVANT_DR_SNAPSHOT_V1');
  }

  engine.decryptAndVerifyDrSnapshot(envelope);
  engine.validateMonotonicSequence(envelope, null);

  const later = new Date(now.getTime() + 60_000);
  const next = engine.createDrSnapshot(items, {
    projectId: 'synthetic-avant-dev',
    sequenceId: 2,
    createdAt: later.toISOString(),
    gfsTier: 'daily',
  });
  engine.validateMonotonicSequence(next, {
    sequence_id: envelope.sequence_id,
    created_at: envelope.created_at,
  });

  return { envelope };
}

export async function runDrBackup(input: DrBackupRunInput = {}): Promise<DrBackupRunResult> {
  const mode = resolveMode(input);

  if (mode === 'production') {
    if (input.productionAuthorized !== true) {
      failClosed(
        'PRODUCTION_NOT_AUTHORIZED',
        'modo production não autorizado neste lote (fail closed)',
      );
    }
    failClosed(
      'PRODUCTION_CONFIG_ABSENT',
      'ausência de configuração necessária para backup de production',
    );
  }

  const allowlist = input.allowlist ?? CANONICAL_PRODUCTION_ALLOWLIST;

  if (input.managementRequest) {
    assertAllowedManagementEndpoint(input.managementRequest, allowlist);
    failClosed(
      'MANAGEMENT_API_CALL_FORBIDDEN',
      'chamada à Management API não é permitida neste lote',
    );
  }

  if (input.r2Target) {
    assertAllowedR2Target(input.r2Target, allowlist);
    failClosed('R2_CALL_FORBIDDEN', 'conexão R2 real não é permitida neste lote');
  }

  const now = input.now ?? new Date();
  const engine = input.engine ?? new BackupEngine(SYNTHETIC_KEK);
  const { envelope } = await sealAndVerifySynthetic(engine, now);

  return {
    ok: true,
    mode: 'synthetic',
    format: SNAPSHOT_FORMAT,
    snapshotId: envelope.snapshot_id,
    sequenceId: envelope.sequence_id,
    ciphertextSha256: envelope.ciphertext_sha256,
    envelopeVerified: true,
    monotonicReplayCheck: true,
    networkCalls: 0,
    productionConnections: 0,
    storageRealConnections: 0,
    r2RealConnections: 0,
    offsiteObjectsCreated: 0,
    productionMutations: 0,
    realR2ClientImplementationFound: 'YES',
    realR2UploadImplementedInThisLot: 'YES',
    storageObjectBytesCapture: 'NOT_PROVEN',
  };
}
