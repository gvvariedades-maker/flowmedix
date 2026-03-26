/**
 * Hash estável do texto para deduplicação (ex.: content_hash no banco).
 * Web Crypto (`crypto.subtle`) só existe em contexto seguro (HTTPS ou localhost).
 * Em HTTP na LAN, usa fallback determinístico com o mesmo formato (64 hex chars).
 */
export async function generateContentHash(text: string): Promise<string> {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, '');
  const msgUint8 = new TextEncoder().encode(normalized);

  const subtle = globalThis.crypto?.subtle;
  if (subtle && typeof subtle.digest === 'function') {
    const hashBuffer = await subtle.digest('SHA-256', msgUint8);
    return uint8ToHex(new Uint8Array(hashBuffer));
  }

  return fallbackFingerprintHex(msgUint8);
}

function uint8ToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Fingerprint 256-bit em hex, sem SubtleCrypto (não é SHA-256 real). */
function fallbackFingerprintHex(data: Uint8Array): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const parts: string[] = [];
  const seeds = [h >>> 0, data.length >>> 0, 0x9e3779b9, 0x243f6a88];
  for (let r = 0; r < 8; r++) {
    let v = seeds[r % 4] ^ (r * 0x27d4eb2d);
    for (let i = 0; i < data.length; i++) {
      v = (v + ((data[i] ^ (i << 4)) * (0x9e3779b9 + r))) >>> 0;
    }
    parts.push((v >>> 0).toString(16).padStart(8, '0'));
  }
  return parts.join('');
}
