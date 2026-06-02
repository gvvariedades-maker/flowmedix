/**
 * Política de prefetch client-side para /estudar (vitrine e player).
 * Respeita Save-Data e conexões muito lentas (2g / slow-2g).
 */

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

function getNetworkInformation(): NetworkInformationLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

/** Retorna true quando prefetch agressivo deve ser omitido (dados limitados ou 2G). */
export function shouldSkipEstudarPrefetch(): boolean {
  const conn = getNetworkInformation();
  if (!conn) return false;
  if (conn.saveData) return true;
  const type = conn.effectiveType?.toLowerCase();
  return type === '2g' || type === 'slow-2g';
}
