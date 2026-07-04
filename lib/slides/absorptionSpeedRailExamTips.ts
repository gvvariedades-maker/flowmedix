export interface QuestionOptionLike {
  id: string;
  text: string;
  is_correct?: boolean;
}

export type AbsorptionRouteSlot = 'iv' | 'im' | 'sc' | 'vo';

const GENERIC_TIPS: Record<AbsorptionRouteSlot, string> = {
  iv: 'Absorção imediata — perfil da IV, não da SC lenta e contínua.',
  im: 'IM absorve mais rápido que SC — não confunda quando a banca pede efeito lento.',
  sc: 'Absorção lenta e contínua — perfil típico da SC quando o enunciado pede liberação gradual.',
  vo: 'VO depende do TGI — o comparativo ajuda a eliminar distractors em questões de SC.',
};

/** Infere a via parenteral/oral de uma alternativa MCQ (ID fica fora do trilho). */
export function inferOptionAbsorptionRoute(optionText: string): AbsorptionRouteSlot | null {
  const t = optionText.toLowerCase();
  if (/intradérmica|\bid\b/.test(t)) return null;
  if (/endovenosa|intravenosa|\bev\b/.test(t)) return 'iv';
  if (/intramuscular|\bim\b/.test(t)) return 'im';
  if (/subcutânea|\bsc\b/.test(t)) return 'sc';
  if (/via oral|\bvo\b|\boral\b/.test(t)) return 'vo';
  return null;
}

export function resolveCorrectAnswerLetter(options?: QuestionOptionLike[]): string | undefined {
  const letter = options?.find((o) => o.is_correct)?.id?.trim();
  return letter ? letter.toUpperCase() : undefined;
}

function findWrongOptionForRoute(
  options: QuestionOptionLike[],
  route: AbsorptionRouteSlot,
): QuestionOptionLike | undefined {
  return options.find((o) => !o.is_correct && inferOptionAbsorptionRoute(o.text) === route);
}

/** Dica de prova contextualizada por via — usa letras reais das alternativas quando disponível. */
export function buildAbsorptionExamTip(
  route: AbsorptionRouteSlot,
  options?: QuestionOptionLike[],
): string {
  if (!options?.length) return GENERIC_TIPS[route];

  const correctOpt = options.find((o) => o.is_correct);
  const correctLetter = correctOpt?.id?.trim().toUpperCase();
  const wrongForRoute = findWrongOptionForRoute(options, route);

  switch (route) {
    case 'sc':
      if (correctLetter && correctOpt && inferOptionAbsorptionRoute(correctOpt.text) === 'sc') {
        return `Gabarito ${correctLetter}: absorção lenta e contínua — sem dose grande, sem alta pressão.`;
      }
      return GENERIC_TIPS.sc;
    case 'iv':
      if (wrongForRoute) {
        return `Letra ${wrongForRoute.id.toUpperCase()}: seduz pelo efeito rápido — IV é imediata, não o perfil SC do enunciado.`;
      }
      return GENERIC_TIPS.iv;
    case 'im':
      if (wrongForRoute) {
        return `Letra ${wrongForRoute.id.toUpperCase()}: IM absorve mais rápido que SC — perfil errado quando a banca pede efeito lento.`;
      }
      return GENERIC_TIPS.im;
    case 'vo':
      if (wrongForRoute) {
        return `Letra ${wrongForRoute.id.toUpperCase()}: proteína degrada no TGI — sem absorção útil por VO.`;
      }
      return GENERIC_TIPS.vo;
    default:
      return GENERIC_TIPS[route];
  }
}

/** Badge no painel SC — só quando o gabarito da questão é subcutânea. */
export function resolveScGabaritoBadge(options?: QuestionOptionLike[]): string | null {
  const correct = options?.find((o) => o.is_correct);
  if (!correct) return null;
  if (inferOptionAbsorptionRoute(correct.text) !== 'sc') return null;
  const letter = correct.id?.trim().toUpperCase();
  return letter ? `Gabarito ${letter}` : null;
}
