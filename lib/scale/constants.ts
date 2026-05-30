/** Limites alinhados ao código (cache, entitlements, analytics). */
export const SCALE_LIMITS = {
  VITRINE_MODULOS: 10_000,
  ACCESSIBLE_MODULOS: 10_000,
  QUESTOES_POR_ASSUNTO: 200,
  HISTORICO_ANALYTICS_READ: 5000,
  /** Aviso quando catálogo atinge 80% do teto da vitrine. */
  VITRINE_WARN_RATIO: 0.8,
  VITRINE_CRITICAL_RATIO: 0.96,
  /** Tamanho de conteudo_json (bytes) — pg_column_size. */
  JSON_P95_WARN_BYTES: 50_000,
  JSON_MAX_WARN_BYTES: 100_000,
  JSON_MAX_CRITICAL_BYTES: 200_000,
  LAB_MAX_JSON_FILE_BYTES: 8 * 1024 * 1024,
} as const;

export const SCALE_HEALTH_RPC = 'avant_scale_health_metrics' as const;
export const CATALOG_STATS_RPC = 'avant_catalog_stats' as const;
