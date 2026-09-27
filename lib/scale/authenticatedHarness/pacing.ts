/** Offset inicial por VU para evitar thundering herd (distribuição uniforme no intervalo). */
export function computeVuStaggerMs(vuIndex: number, virtualUsers: number, intervalMs: number): number {
  if (virtualUsers <= 1) return 0;
  return Math.floor((vuIndex / virtualUsers) * intervalMs);
}

/**
 * Espera até o próximo tick start-to-start (compensa latência da request anterior).
 */
export async function sleepUntilNextStartToStart(
  nextStartAtMs: number,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<number> {
  const now = Date.now();
  const wait = nextStartAtMs - now;
  if (wait > 0) await sleep(wait);
  return Date.now();
}
