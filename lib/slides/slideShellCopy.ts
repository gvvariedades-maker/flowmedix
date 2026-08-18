/**
 * Copy dos shells NeuroSlides por disciplina (TE clínico × Língua Portuguesa).
 * Evita "Decisão clínica" / "Decore clínico" / "Conduta certa" em cards de gramática.
 */

export type SlideShellCopy = {
  goldenEyebrow: string;
  compareBackFaceDefault: string;
  logicFocusEyebrow: string;
};

function normalizeKey(value: string | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Pacotes / ramos de Língua Portuguesa (Conhecimentos Básicos). */
export function isLinguaPortuguesaShell(
  subtopico?: string,
  pedagogicalBranch?: string,
): boolean {
  const branch = (pedagogicalBranch ?? '').trim();
  if (branch.startsWith('pt_')) return true;

  const key = normalizeKey(subtopico);
  if (!key) return false;

  return (
    key.includes('lingua portuguesa') ||
    key.includes('classes de palavras') ||
    key.includes('crase') ||
    key.includes('colocacao') ||
    key.includes('pronomes') ||
    key.includes('pontuacao') ||
    key.includes('termos da oracao') ||
    key.includes('concordancia') ||
    key.includes('verbos') ||
    key.includes('regencia') ||
    key.includes('ortografia') ||
    key.includes('interpretacao') ||
    key.includes('figuras de linguagem') ||
    key.includes('coesao') ||
    key.includes('coerencia')
  );
}

export function getSlideShellCopy(
  subtopico?: string,
  pedagogicalBranch?: string,
): SlideShellCopy {
  if (isLinguaPortuguesaShell(subtopico, pedagogicalBranch)) {
    return {
      goldenEyebrow: 'Decore gramática',
      compareBackFaceDefault: 'Resposta certa',
      logicFocusEyebrow: 'Estratégia de prova',
    };
  }

  return {
    goldenEyebrow: 'Decore clínico',
    compareBackFaceDefault: 'Conduta certa na prova',
    logicFocusEyebrow: 'Decisão clínica',
  };
}
