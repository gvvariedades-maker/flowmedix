/**
 * Flag da projeção de 2 telas (F7) — opt-in, piloto por subtópico.
 *
 * Omitida = off: o player continua com os 4 NeuroSlides em sequência. Ligar com
 * `NEXT_PUBLIC_LESSON_PROJECTION=1`, que ainda assim só vale nos subtópicos do
 * piloto (Farmacodinâmica, 13 slugs já `production_ready`).
 *
 * @see lib/lesson/lessonProjection.ts
 */

/** Piloto: pacote pequeno, vendável, com moldes L3 fechados. */
export const LESSON_PROJECTION_PILOT_SUBTOPICOS: readonly string[] = [
  'Farmacodinâmica e Farmacocinética',
];

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Master switch. Omitida / qualquer valor ≠ `1` = off. */
export function isLessonProjectionEnabled(
  rawEnv: string | undefined = process.env.NEXT_PUBLIC_LESSON_PROJECTION,
): boolean {
  return rawEnv?.trim() === '1';
}

export function isLessonProjectionPilotSubtopico(subtopico?: string): boolean {
  if (!subtopico) return false;
  const target = normalize(subtopico);
  return LESSON_PROJECTION_PILOT_SUBTOPICOS.some((s) => normalize(s) === target);
}

/** Flag ligada **e** subtópico no piloto — a checagem que o player faz. */
export function isLessonProjectionEnabledForSubtopico(
  subtopico?: string,
  rawEnv?: string,
): boolean {
  return isLessonProjectionEnabled(rawEnv) && isLessonProjectionPilotSubtopico(subtopico);
}
