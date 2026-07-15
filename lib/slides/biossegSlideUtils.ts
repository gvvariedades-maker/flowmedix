/** Utilitários compartilhados pelos moldes premium de Infecções / Biossegurança (ramo genérico). */

export type BiossegPrecaution =
  | 'padrao'
  | 'contato'
  | 'goticulas'
  | 'aerossois'
  | 'iras'
  | 'residuos'
  | 'gabarito'
  | 'geral';

const PRECAUTION_ORDER: BiossegPrecaution[] = ['padrao', 'contato', 'goticulas', 'aerossois'];

export const BIOSSEG_PRECAUTION_SLOTS = PRECAUTION_ORDER;

export function inferBiossegPrecaution(text: string): BiossegPrecaution {
  const lower = text.toLowerCase();
  if (/gabarito|resposta final|letra [a-e]/.test(lower)) return 'gabarito';
  if (/precau[cç][aã]o padr[aã]o|padr[aã]o para todos|higiene das m[aã]os.*todos/i.test(lower)) {
    return 'padrao';
  }
  if (/precau[cç][aã]o.*contato|mdro|c\.?\s*diff|luva.*avental/i.test(lower)) return 'contato';
  if (/got[ií]cula|m[aá]scara cir[uú]rgica|≤\s*1\s*m|1 metro/i.test(lower)) return 'goticulas';
  if (/aeross[oó]l|n95|pff2|press[aã]o negativa|tuberculose|sarampo|varicela/i.test(lower)) {
    return 'aerossois';
  }
  if (/perfurocortante|res[ií]duo.*grupo|coletor r[ií]gido|n[aã]o recapear/i.test(lower)) {
    return 'residuos';
  }
  if (/iras|infec[cç][aã]o.*assist[eê]ncia|cadeia de infec[cç][aã]o|hospedeiro/i.test(lower)) {
    return 'iras';
  }
  return 'geral';
}

export function biossegPrecautionLabel(route: BiossegPrecaution): string {
  switch (route) {
    case 'padrao':
      return 'Padrão';
    case 'contato':
      return 'Contato';
    case 'goticulas':
      return 'Gotículas';
    case 'aerossois':
      return 'Aerossóis';
    case 'iras':
      return 'IRAS';
    case 'residuos':
      return 'Resíduos';
    case 'gabarito':
      return 'Gabarito';
    default:
      return 'Biosseg';
  }
}

export function inferBiossegTrapRoutes(
  label: string,
  detail: string,
  correct: string,
): { trapRoutes: BiossegPrecaution[]; correctRoutes: BiossegPrecaution[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();
  const trapRoutes = new Set<BiossegPrecaution>();
  const correctRoutes = new Set<BiossegPrecaution>();

  if (/lixo comum|recapear|capa protetora/.test(trapText)) trapRoutes.add('residuos');
  if (/kit [uú]nico|mesmo epi|todos os procedimentos/.test(trapText)) trapRoutes.add('padrao');
  if (/m[aá]scara n95.*todos|pff2.*todos/.test(trapText)) trapRoutes.add('aerossois');
  if (/s[oó] fluidos|apenas.*secre[cç]/i.test(trapText)) trapRoutes.add('padrao');

  for (const route of PRECAUTION_ORDER) {
    if (inferBiossegPrecaution(trapText) === route) trapRoutes.add(route);
    if (inferBiossegPrecaution(correctText) === route) correctRoutes.add(route);
  }

  if (/coletor|perfurocortante|grupo e/i.test(correctText)) correctRoutes.add('residuos');
  if (/5 momentos|higiene das m[aã]os|precau[cç][aã]o padr[aã]o/i.test(correctText)) {
    correctRoutes.add('padrao');
  }
  if (/contato|mdro|luvas/i.test(correctText)) correctRoutes.add('contato');

  const trap = [...trapRoutes].filter((r) => r !== 'gabarito' && r !== 'geral');
  const filteredCorrect = [...correctRoutes].filter((r) => r !== 'gabarito' && r !== 'geral');

  return {
    trapRoutes: trap,
    correctRoutes: filteredCorrect,
    hasRail: trap.length > 0 || filteredCorrect.length > 0,
  };
}
