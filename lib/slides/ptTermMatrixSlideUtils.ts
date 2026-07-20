/**
 * Utilitários compartilhados pelo pacote bespoke `pt-term-matrix`
 * (Língua Portuguesa / Termos da oração — Elias M05).
 */

export type PtTermMatrixCell =
  | 'definicao'
  | 'pergunta_teste'
  | 'adj_adv'
  | 'adj_adn'
  | 'complemento_nominal'
  | 'loc_adv_tempo'
  | 'deslocado'
  | 'pegadinha'
  | 'generico';

export type PtTermStepRole =
  | 'classificar_termo'
  | 'eliminar_letra'
  | 'validar_letra'
  | 'gabarito'
  | 'transferencia'
  | 'generico';

export interface PtTermChip {
  label: string;
  tone: 'teal' | 'rose' | 'emerald' | 'slate' | 'amber' | 'cyan';
}

const NORMALIZE_RE = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(NORMALIZE_RE, '');
}

export function inferTermMatrixCell(text: string): PtTermMatrixCell {
  const t = normalize(text);
  if (
    /\bpegadinha\b|rotulo do vizinho|vizinho|confunde|cola o rotulo|sem pergunta/.test(
      t,
    )
  ) {
    return 'pegadinha';
  }
  if (/deslocad|antepost/.test(t)) {
    return 'deslocado';
  }
  if (/enquanto|quando|locu[cç][aã]o adverbial de tempo|marca tempo|tempo da/.test(t)) {
    return 'loc_adv_tempo';
  }
  if (/complemento nominal|de qu[eê]\?|prep\./.test(t)) {
    return 'complemento_nominal';
  }
  if (/adjunto adnominal|modifica nome|caracteriza|substantivo|adjetiv/.test(t)) {
    return 'adj_adn';
  }
  if (
    /adjunto adverbial|circunst[aâ]ncia|modifica verbo|adv\./.test(t)
  ) {
    return 'adj_adv';
  }
  if (/pergunta|modifica verbo\?|modifica nome\?|cargo|matriz|funcao/.test(t)) {
    return 'pergunta_teste';
  }
  if (/termo|sintaxe|ora[cç][aã]o|classifica/.test(t)) {
    return 'definicao';
  }
  return 'generico';
}

export function extractTermStepLetter(text: string): string | null {
  const match = text.trim().match(/^([A-E])\s*[:.\-–—]/i);
  return match ? match[1].toUpperCase() : null;
}

export function inferTermStepRole(text: string): PtTermStepRole {
  const t = normalize(text);
  if (/^t1\b|^t2\b|classificar|circunst[aâ]ncia|locu[cç][aã]o/.test(t) && !/^gabarito/.test(t)) {
    if (/eliminar|fora|corta|nao e|não é|confunde/.test(t)) {
      return 'eliminar_letra';
    }
    return 'classificar_termo';
  }
  if (/^gabarito\b|par correto|sobrou|unica que/.test(t)) {
    return 'gabarito';
  }
  if (/em similares|transfer[eê]|em outra banca|mesma matriz|pergunta-teste/.test(t)) {
    return 'transferencia';
  }
  const letter = extractTermStepLetter(text);
  if (letter) {
    if (/eliminar|fora|confunde|nao e|não é|errad/.test(t)) {
      return 'eliminar_letra';
    }
    if (/\bpassa\b|valida|correto|confere/.test(t)) {
      return 'validar_letra';
    }
    return 'eliminar_letra';
  }
  if (/comando|dois termos|par de cargos/.test(t)) {
    return 'generico';
  }
  return 'generico';
}

export function termMatrixCellChips(cell: PtTermMatrixCell): PtTermChip[] {
  switch (cell) {
    case 'definicao':
      return [{ label: 'cargo', tone: 'teal' }];
    case 'pergunta_teste':
      return [{ label: 'M05', tone: 'amber' }, { label: 'teste?', tone: 'teal' }];
    case 'adj_adv':
      return [{ label: 'ADV', tone: 'cyan' }, { label: 'verbo', tone: 'slate' }];
    case 'adj_adn':
      return [{ label: 'ADN', tone: 'teal' }, { label: 'nome', tone: 'slate' }];
    case 'complemento_nominal':
      return [{ label: 'CN', tone: 'amber' }];
    case 'loc_adv_tempo':
      return [{ label: 'tempo', tone: 'emerald' }];
    case 'deslocado':
      return [{ label: 'desloc.', tone: 'cyan' }];
    case 'pegadinha':
      return [{ label: 'vizinho', tone: 'rose' }];
    default:
      return [];
  }
}

export function termMatrixCellBadge(cell: PtTermMatrixCell): string {
  switch (cell) {
    case 'definicao':
      return 'TERMO = CARGO';
    case 'pergunta_teste':
      return 'PORTÃO · PERGUNTA-TESTE';
    case 'adj_adv':
      return 'ADJ. ADVERBIAL';
    case 'adj_adn':
      return 'ADJ. ADNOMINAL';
    case 'complemento_nominal':
      return 'COMPLEMENTO NOMINAL';
    case 'loc_adv_tempo':
      return 'LOC. ADV. TEMPO';
    case 'deslocado':
      return 'DESLOCADO';
    case 'pegadinha':
      return 'RÓTULO VIZINHO';
    default:
      return 'MATRIZ';
  }
}

export type PtTermRowBadge = 'barra' | 'célula' | 'cargo' | 'portátil' | 'matriz';

export function inferTermRowBoardBadge(input: {
  label?: string;
  value?: string;
  emphasis?: string | null;
}): PtTermRowBadge {
  const emphasis = (input.emphasis ?? 'default').toLowerCase();
  if (emphasis === 'success') return 'célula';
  if (emphasis === 'highlight') return 'portátil';
  if (emphasis === 'alert') return 'barra';

  const text = `${input.label ?? ''} ${input.value ?? ''}`;
  const cell = inferTermMatrixCell(text);
  const t = normalize(text);

  if (cell === 'pergunta_teste') return 'portátil';
  if (cell === 'pegadinha') return 'barra';
  if (cell === 'adj_adv' || cell === 'adj_adn' || cell === 'loc_adv_tempo') return 'célula';
  if (/barra|nao modifica|nunca|eliminar/.test(t)) return 'barra';
  if (/cargo|funcao|classifica/.test(t)) return 'cargo';
  return 'matriz';
}
