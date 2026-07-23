/**
 * Quiz de transferência no danger_zone + requisitos do gate de conclusão
 * do estudo reverso (sem schema novo — inferência a partir do JSON handcraft).
 */

export type CliticQuizChoice = 'proclise' | 'enclise' | 'mesoclise';

export type CraseQuizChoice = 'com_crase' | 'sem_crase';

export const CLITIC_QUIZ_CHOICES: ReadonlyArray<{
  id: CliticQuizChoice;
  label: string;
}> = [
  { id: 'proclise', label: 'Antes do verbo' },
  { id: 'enclise', label: 'Depois do verbo' },
  { id: 'mesoclise', label: 'Dentro da forma' },
] as const;

export const CRASE_QUIZ_CHOICES: ReadonlyArray<{
  id: CraseQuizChoice;
  label: string;
}> = [
  { id: 'com_crase', label: 'Com à' },
  { id: 'sem_crase', label: 'Sem à' },
] as const;

const NORMALIZE_RE = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(NORMALIZE_RE, '');
}

/** Item de transferência no danger_zone (label / detail). */
export function isTransferDangerItem(label?: string, detail?: string): boolean {
  const t = normalize(`${label ?? ''} ${detail ?? ''}`);
  return (
    /^transfer/.test(t) ||
    /\btransferencia\b/.test(t) ||
    /\bem similares\b/.test(t) ||
    /\bem outra banca\b/.test(t) ||
    /\bem outra prova\b/.test(t)
  );
}

/**
 * Extrai a classificação esperada do texto `correct` (ex.: "Ênclise: me aparece…").
 * Retorna null quando não há quiz de 3 opções aplicável.
 */
export function inferCliticQuizAnswer(correct?: string): CliticQuizChoice | null {
  if (!correct?.trim()) return null;
  const t = normalize(correct);
  // Ordem: mesóclise antes de ênclise (evita falso positivo em substrings).
  if (/\bmesoclise\b/.test(t)) return 'mesoclise';
  if (/\bproclise\b/.test(t)) return 'proclise';
  if (/\benclise\b/.test(t)) return 'enclise';
  if (/\bantes do verbo\b/.test(t)) return 'proclise';
  if (/\bdentro da forma futura\b|\bno meio do futuro\b/.test(t)) return 'mesoclise';
  if (/\bdepois do verbo\b/.test(t)) return 'enclise';
  return null;
}

/**
 * Extrai com à / sem à a partir do `correct` da transferência de crase.
 * Preferir frases explícitas ("Sem crase…", "Com à…").
 */
export function inferCraseQuizAnswer(correct?: string): CraseQuizChoice | null {
  if (!correct?.trim()) return null;
  const t = normalize(correct);

  const saysSem =
    /\bsem crase\b|\bsem a\b|\bso a\b|\bapenas a\b|\bnunca a\b|\bnao use a\b|\buse so a\b/.test(
      t,
    );
  const saysCom =
    /\bcom a\b|\ba \+ a\b|\bcrase correta\b|\bpede a\b|\b→\s*a\b|\b->\s*a\b/.test(t) ||
    (/à|às/.test(correct) && /\b(crase|artigo|fusao|feminino)\b/.test(t));

  // Se cita os dois contrastes, a primeira menção manda (ex.: "Sem crase: a Paris… Com à: à Serra").
  const firstSem = t.search(/\bsem crase\b|\bsem a\b|\bso a\b/);
  const firstCom = t.search(/\bcom a\b|\ba \+ a\b/);
  if (firstSem >= 0 && (firstCom < 0 || firstSem < firstCom)) return 'sem_crase';
  if (firstCom >= 0 && (firstSem < 0 || firstCom < firstSem)) return 'com_crase';

  if (saysSem && !saysCom) return 'sem_crase';
  if (saysCom && !saysSem) return 'com_crase';
  return null;
}

export type ReverseStudyGateKey =
  | 'logic_flow_complete'
  | 'danger_zone_all_revealed'
  | 'transfer_quiz'
  | 'transfer_revealed';

type SlideLike = {
  type?: string;
  reveal_mode?: string;
  items?: Array<{
    label?: string;
    title?: string;
    detail?: string;
    description?: string;
    correct?: string;
  }>;
};

/**
 * Requisitos do gate derivados do JSON (antes dos componentes montarem).
 * Sem requisitos → conclusão livre (legado / slides sem tap+transfer).
 */
export function getReverseStudyGateRequirements(slides: SlideLike[] | undefined | null): ReverseStudyGateKey[] {
  if (!slides?.length) return [];
  const keys = new Set<ReverseStudyGateKey>();

  for (const slide of slides) {
    if (slide.type === 'logic_flow' && slide.reveal_mode === 'tap') {
      keys.add('logic_flow_complete');
    }
    if (slide.type !== 'danger_zone') continue;
    const items = slide.items ?? [];
    const withCorrect = items.filter((i) => typeof i.correct === 'string' && i.correct.trim());
    if (withCorrect.length === 0) continue;

    keys.add('danger_zone_all_revealed');

    const transfer = items.find((i) =>
      isTransferDangerItem(i.label ?? i.title, i.detail ?? i.description),
    );
    if (!transfer) continue;

    const quizAnswer =
      inferCliticQuizAnswer(transfer.correct) ?? inferCraseQuizAnswer(transfer.correct);
    if (quizAnswer) {
      keys.add('transfer_quiz');
    } else {
      keys.add('transfer_revealed');
    }
  }

  return Array.from(keys);
}

export function gateKeyLabel(key: ReverseStudyGateKey): string {
  switch (key) {
    case 'logic_flow_complete':
      return 'Percorra o fluxo lógico até o fim';
    case 'danger_zone_all_revealed':
      return 'Revele todas as pegadinhas';
    case 'transfer_quiz':
      return 'Responda a transferência';
    case 'transfer_revealed':
      return 'Toque na transferência';
    default:
      return key;
  }
}
