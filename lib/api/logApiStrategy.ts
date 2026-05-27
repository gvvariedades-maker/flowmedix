import { logger } from '@/lib/logger';

type ApiStrategy = 'cache' | 'builder' | 'rpc' | 'js';

type LogApiStrategyParams = {
  event: string;
  strategy: ApiStrategy;
  durationMs: number;
  context?: Record<string, unknown>;
};

export function logApiStrategy(params: LogApiStrategyParams): void {
  const { event, strategy, durationMs, context } = params;

  logger.info(`${event} strategy`, {
    strategy,
    durationMs,
    ...context,
  });
}
