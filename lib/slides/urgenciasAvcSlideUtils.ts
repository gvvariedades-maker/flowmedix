/** Utilitários de slot para moldes L3 — Urgências / AVC · Cincinnati (FAST). */

export type CincinnatiSign = 'face' | 'arms' | 'speech' | 'time' | 'alerta' | 'geral';

export const CINCINNATI_SIGNS: CincinnatiSign[] = ['face', 'arms', 'speech', 'time'];

export type UrgenciasStrokeTrapSlot =
  | 'meningeal'
  | 'iam'
  | 'glasgow'
  | 'ssvv'
  | 'generico';

export const URGENCIAS_STROKE_TRAP_SLOTS: UrgenciasStrokeTrapSlot[] = [
  'meningeal',
  'iam',
  'glasgow',
  'ssvv',
];

export function cincinnatiSignLabel(sign: CincinnatiSign): string {
  const labels: Record<CincinnatiSign, string> = {
    face: 'Face',
    arms: 'Braços',
    speech: 'Fala',
    time: 'Tempo',
    alerta: 'Alerta',
    geral: 'AVC',
  };
  return labels[sign];
}

export function urgenciasStrokeTrapSlotLabel(slot: UrgenciasStrokeTrapSlot): string {
  const labels: Record<UrgenciasStrokeTrapSlot, string> = {
    meningeal: 'Meníngea',
    iam: 'IAM',
    glasgow: 'Glasgow',
    ssvv: 'SSVV',
    generico: 'Outra escala',
  };
  return labels[slot];
}

export function inferCincinnatiSign(title: string, detail: string): CincinnatiSign {
  const text = `${title} ${detail}`.toLowerCase();

  if (/face|sorriso|assimetria facial|labial/i.test(text)) return 'face';
  if (/bra[cç]o|arms|mmss|membro superior|queda de bra/i.test(text)) return 'arms';
  if (/fala|speech|disartria|afasia|frase/i.test(text)) return 'speech';
  if (/tempo|192|samu|acionar|time\b|minuto/i.test(text)) return 'time';
  if (/pegadinha|glasgow|ssvv|men[ií]ngea|iam|n[aã]o entra/i.test(text)) return 'alerta';
  if (/cincinnati|fast|avc|acidente vascular/i.test(text)) return 'face';

  return 'geral';
}

export function inferUrgenciasStrokeTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasStrokeTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/men[ií]ngea|cefaleia|rigidez|v[oô]mito.*jato|nuca/i.test(text)) return 'meningeal';
  if (/tor[aá]cic|dispneia|sudorese|iam|infarto|coronar/i.test(text)) return 'iam';
  if (/glasgow|gcs|consci[eê]ncia.*motor|resposta verbal|resposta motora/i.test(text)) {
    return 'glasgow';
  }
  if (/ssvv|press[aã]o arterial|frequ[eê]ncia card|frequ[eê]ncia resp|fc\b|fr\b|pa\b/i.test(text)) {
    return 'ssvv';
  }

  return 'generico';
}
