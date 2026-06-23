/** Utilitários compartilhados pelos moldes premium de IST. */

export type IstRoute = 'sexual' | 'parceria' | 'parenteral' | 'prevencao' | 'agente' | 'gabarito' | 'geral';

const ROUTE_ORDER: IstRoute[] = ['sexual', 'parceria', 'parenteral', 'prevencao'];

export const IST_ROUTE_SLOTS = ROUTE_ORDER;

export function inferIstRoute(text: string): IstRoute {
  const lower = text.toLowerCase();
  if (/gabarito|resposta final|letra [a-e]/.test(lower)) return 'gabarito';
  if (/camisinha|preservativo|relação sexual|relacao sexual|sexo sem|desprotegid/.test(lower)) {
    return 'sexual';
  }
  if (/parceiro|companheir|terceiros|parceria/.test(lower)) return 'parceria';
  if (/agulha|seringa|droga injet|parenteral|compartilh/.test(lower)) return 'parenteral';
  if (/profilax|pep\b|prep\b|prevenção|prevencao/.test(lower)) return 'prevencao';
  if (/hiv|sífilis|sifilis|hepatite|hpv|gonorreia|clamídia|clamidia/.test(lower)) return 'agente';
  return 'geral';
}

export function istRouteLabel(route: IstRoute): string {
  switch (route) {
    case 'sexual':
      return 'Sexual';
    case 'parceria':
      return 'Parceria';
    case 'parenteral':
      return 'Parenteral';
    case 'prevencao':
      return 'Prevenção';
    case 'agente':
      return 'Agente';
    case 'gabarito':
      return 'Gabarito';
    default:
      return 'IST';
  }
}

export function inferIstTrapRoutes(
  label: string,
  detail: string,
  correct: string,
): { trapRoutes: IstRoute[]; correctRoutes: IstRoute[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();
  const trapRoutes = new Set<IstRoute>();
  const correctRoutes = new Set<IstRoute>();

  if (/uso pessoal|exclusivamente pessoal|agulha pessoal/.test(trapText)) {
    trapRoutes.add('parenteral');
    correctRoutes.add('sexual');
    correctRoutes.add('parceria');
  }
  if (/só hiv|unicamente hiv|somente hiv/.test(trapText)) trapRoutes.add('agente');
  if (/curar|cura/.test(trapText)) trapRoutes.add('prevencao');

  for (const route of ROUTE_ORDER) {
    if (inferIstRoute(trapText) === route) trapRoutes.add(route);
    if (inferIstRoute(correctText) === route) correctRoutes.add(route);
  }

  if (/compartilh/.test(correctText)) correctRoutes.add('parenteral');
  if (/camisinha|preservativo/.test(correctText)) correctRoutes.add('sexual');
  if (/parceiro|terceiros/.test(correctText)) correctRoutes.add('parceria');

  const trap = [...trapRoutes].filter((r) => r !== 'gabarito' && r !== 'geral');
  const filteredCorrectRoutes = [...correctRoutes].filter((r) => r !== 'gabarito' && r !== 'geral');

  return {
    trapRoutes: trap,
    correctRoutes: filteredCorrectRoutes,
    hasRail: trap.length > 0 || filteredCorrectRoutes.length > 0,
  };
}
