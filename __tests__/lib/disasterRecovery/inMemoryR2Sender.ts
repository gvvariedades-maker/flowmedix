import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { failClosed } from '@/lib/disasterRecovery/errors';
import {
  assertAllowedR2Command,
  inspectAllowedR2Command,
  type AllowedR2Command,
  type S3CommandSender,
} from '@/lib/disasterRecovery/r2Client';

export type InMemoryR2Object = {
  body: Buffer;
  metadata: Record<string, string>;
  contentLength: number;
  etag: string;
};

export type InMemoryR2Options = {
  getBodyTransform?: (body: Buffer) => Buffer;
  headMetadataOverride?: Record<string, string>;
  headContentLengthOverride?: number;
};

function objectKey(bucket: string, key: string): string {
  return `${bucket}\0${key}`;
}

export class InMemoryR2CommandSender implements S3CommandSender {
  readonly objects = new Map<string, InMemoryR2Object>();
  readonly sentOps: Array<'PUT' | 'HEAD' | 'GET'> = [];
  readonly options: InMemoryR2Options;

  constructor(options: InMemoryR2Options = {}) {
    this.options = options;
  }

  async send(command: AllowedR2Command): Promise<unknown> {
    assertAllowedR2Command(command);
    const op = inspectAllowedR2Command(command);
    this.sentOps.push(op);

    if (command instanceof PutObjectCommand) {
      const bucket = command.input.Bucket ?? '';
      const key = command.input.Key ?? '';
      const bodyInput = command.input.Body;
      const body = Buffer.isBuffer(bodyInput)
        ? bodyInput
        : Buffer.from((bodyInput as Uint8Array | string) ?? []);
      const metadata: Record<string, string> = {};
      for (const [k, v] of Object.entries(command.input.Metadata ?? {})) {
        metadata[k.toLowerCase()] = v;
      }
      const etag = '"synthetic-etag-not-a-sha256"';
      this.objects.set(objectKey(bucket, key), {
        body,
        metadata,
        contentLength: body.length,
        etag,
      });
      return { ETag: etag };
    }

    if (command instanceof HeadObjectCommand || command instanceof GetObjectCommand) {
      const bucket = command.input.Bucket ?? '';
      const key = command.input.Key ?? '';
      const stored = this.objects.get(objectKey(bucket, key));
      if (!stored) {
        const err = new Error('Not Found');
        (err as Error & { name: string; $metadata: { httpStatusCode: number } }).name = 'NotFound';
        (err as Error & { $metadata: { httpStatusCode: number } }).$metadata = { httpStatusCode: 404 };
        throw err;
      }

      const metadata = {
        ...stored.metadata,
        ...this.options.headMetadataOverride,
      };
      const contentLength = this.options.headContentLengthOverride ?? stored.contentLength;

      if (command instanceof HeadObjectCommand) {
        return {
          ContentLength: contentLength,
          ETag: stored.etag,
          Metadata: metadata,
        };
      }

      const body = this.options.getBodyTransform
        ? this.options.getBodyTransform(stored.body)
        : stored.body;
      return {
        Body: body,
        ETag: stored.etag,
        ContentLength: body.length,
      };
    }

    failClosed('R2_OPERATION_NOT_ALLOWED', 'comando não suportado pelo fake R2');
  }
}
