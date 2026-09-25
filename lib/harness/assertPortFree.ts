import { createServer } from 'node:net';

/** Fails if `127.0.0.1:port` is already bound — prevents health checks against a foreign server. */
export function assertPortFree(port: number, label = 'harness'): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const probe = createServer();
    probe.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(
          new Error(
            `[${label}] Port ${port} is already in use. Choose a free port or stop the conflicting process.`,
          ),
        );
        return;
      }
      reject(err);
    });
    probe.listen(port, '127.0.0.1', () => {
      probe.close(() => resolvePromise());
    });
  });
}
