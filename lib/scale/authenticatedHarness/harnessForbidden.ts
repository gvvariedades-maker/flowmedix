export class HarnessExecutionForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HarnessExecutionForbiddenError';
  }
}
