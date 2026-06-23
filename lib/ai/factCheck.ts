import type { GuidelineTable } from '@/lib/guidelines';

/** Padrões numéricos com unidade — cruzados com guideline quando disponível. */
const NUMBER_WITH_UNIT_RE =
  /\b\d+(?:[.,]\d+)?\s*(?:dias?|semanas?|semana|h|horas?|mg|ml|gotas?|gts|%|bpm|irpm|mmhg|°c|anos?|meses?|minutos?)\b/gi;

function normalizeToken(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** "3 meses" e "3meses" equivalentes para cruzamento com guideline/enunciado. */
function compactNumberUnit(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '');
}

/** Rodapés híbridos citam golden por filename — não auditar números embutidos no nome. */
function stripNonClinicalNumericNoise(text: string): string {
  return text.replace(/questao-premium-[\w-]+\.json/gi, '');
}

function tokenInAllowed(token: string, allowed: string): boolean {
  const normalized = normalizeToken(token);
  const allowedCommaDot = allowed.replace(/,/g, '.');
  const tokenCommaDot = normalized.replace(/,/g, '.');
  if (allowed.includes(normalized) || allowedCommaDot.includes(tokenCommaDot)) return true;
  const compact = compactNumberUnit(normalized);
  return compactNumberUnit(allowed).includes(compact);
}

function buildAllowedCorpus(guideline: GuidelineTable): string {
  return guideline.entries
    .flatMap((e) => [e.label, e.value, e.detail ?? ''])
    .join(' ')
    .toLowerCase();
}

/**
 * Verifica se números+unidade nos slides aparecem na guideline.
 * Sem guideline → sem violações (modo conceitual).
 */
export function runFactCheck(
  slides: unknown,
  guideline: GuidelineTable | null,
  options?: { allowedText?: string },
): { violations: string[] } {
  if (!guideline) return { violations: [] };

  const text = stripNonClinicalNumericNoise(JSON.stringify(slides));
  const allowed = [
    buildAllowedCorpus(guideline),
    options?.allowedText?.toLowerCase() ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const violations: string[] = [];

  for (const match of text.matchAll(NUMBER_WITH_UNIT_RE)) {
    const token = normalizeToken(match[0]);
    if (!token) continue;
    if (!tokenInAllowed(token, allowed)) {
      violations.push(
        `factcheck: "${match[0]}" não encontrado na guideline ${guideline.id} (${guideline.snapshot})`,
      );
    }
  }

  return { violations: [...new Set(violations)] };
}
