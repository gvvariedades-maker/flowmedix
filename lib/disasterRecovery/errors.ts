export class DrBackupFailClosedError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DrBackupFailClosedError';
    this.code = code;
  }
}

export function failClosed(code: string, message: string): never {
  throw new DrBackupFailClosedError(code, message);
}
