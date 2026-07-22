/** Assign NODE_ENV in tests (@types/node marks it readonly at compile time). */
export function setNodeEnv(value: 'development' | 'production' | 'test'): void {
  (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV = value;
}
