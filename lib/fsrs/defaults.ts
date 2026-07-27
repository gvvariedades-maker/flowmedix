/**
 * Constantes puras do FSRS MVP (R1.1).
 * Versão do pacote é pin auditável — **não** ler package.json em runtime.
 */

/** Pin npm exato do adapter (deve coincidir com package.json). */
export const FSRS_MVP_PACKAGE_VERSION = '5.4.1' as const;

/** Algoritmo declarado no schema persistível. */
export const FSRS_MVP_ALGORITHM = 'ts-fsrs' as const;

/** schemaVersion do payload serializado do card. */
export const FSRS_MVP_CARD_SCHEMA_VERSION = 1 as const;

/** Prefixo versionado dos review_unit_id. */
export const FSRS_MVP_REVIEW_UNIT_PREFIX = 'fsrs:v1' as const;

/** Retenção desejada inicial do MVP (ADR). */
export const FSRS_MVP_DEFAULT_REQUEST_RETENTION = 0.9;

/** Limiar default de inventário (informativo; confirmação explícita é do caller). */
export const FSRS_MVP_DEFAULT_MIN_CLUSTER_INVENTORY = 3;

/**
 * Identificador algorithmário para logs/config (pin + string da lib).
 * Persistência usa `FSRS_MVP_PACKAGE_VERSION` no schema do card.
 */
export const FSRS_MVP_ALGORITHM_VERSION_LABEL = `ts-fsrs@${FSRS_MVP_PACKAGE_VERSION}` as const;

/** Fuzz desligado no MVP para previsibilidade e testes determinísticos. */
export const FSRS_MVP_ENABLE_FUZZ = false as const;
