import { logger } from '@/lib/logger';
import { recordVitrineStrategy, type VitrineStrategyKind } from '@/lib/metrics';

type ApiStrategy = 'cache' | 'builder' | VitrineStrategyKind;

type LogApiStrategyParams = {
  event: string;
  strategy: ApiStrategy;
  durationMs: number;
  context?: Record<string, unknown>;
};

export function logApiStrategy(params: LogApiStrategyParams): void {
  const { event, strategy, durationMs, context } = params;

  if (event === 'vitrine_page' && (strategy === 'rpc' || strategy === 'js')) {
    try {
      recordVitrineStrategy(strategy, durationMs);
    } catch {
      // métricas opcionais
    }
  }

  const payload = {
    strategy,
    durationMs,
    ...context,
  };

  if (event === 'vitrine_page' && strategy === 'js') {
    logger.warn(`${event} strategy: pipeline JS (investigar RPC/entitlements)`, payload);
    return;
  }

  logger.info(`${event} strategy`, payload);
}
