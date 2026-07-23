/**
 * Utilitários compartilhados pelo pacote bespoke `pt-crase-funnel` (Língua Portuguesa / Crase).
 *
 * Regra: nunca hardcode do gabarito nem do texto da questão-âncora — apenas inferência
 * de slot a partir de gatilhos textuais que já vêm no JSON handcraft.
 */

/**
 * Estágios do funil de crase (Cunha & Cintra / Bechara).
 * - definicao: enquadramento a + a = à.
 * - teste_masculino (T1): antes de palavra masculina → sem crase.
 * - teste_verbo (T2): antes de verbo/infinitivo → sem crase.
 * - teste_a_a (T3): prep. a + artigo a feminino → à/às.
 * - teste_ao: portátil — se "ao" cabe no masculino, "à" no feminino.
 * - pegadinha: crase automática ("parece culto" sem funil).
 * - generico: qualquer conteúdo fora dos gatilhos acima.
 */
export type PtCraseFunnelStage =
  | 'definicao'
  | 'teste_masculino'
  | 'teste_verbo'
  | 'teste_a_a'
  | 'teste_ao'
  | 'pegadinha'
  | 'generico';

/** Papéis dos steps do logic_flow (funil letra a letra + gabarito + transferência). */
export type PtCraseStepRole =
  | 'eliminar_letra'
  | 'validar_letra'
  | 'gabarito'
  | 'transferencia'
  | 'generico';

export interface PtCraseChip {
  label: string;
  tone: 'amber' | 'rose' | 'emerald' | 'slate';
}

const NORMALIZE_RE = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(NORMALIZE_RE, '');
}

/** Infere o estágio do funil pelo texto (label + detail). */
export function inferFunnelStage(text: string): PtCraseFunnelStage {
  const t = normalize(text);
  if (/\bpegadinha\b|automatic|parece culto|funil = chute|sem funil/.test(t)) {
    return 'pegadinha';
  }
  if (/teste\s*ao|\bao\b\s*(cabe|couber|no masc)|portatil/.test(t)) {
    return 'teste_ao';
  }
  if (/teste\s*3|teste 3|t3\b|a\s*\+\s*a|prep\.?\s*a\s*\+\s*artigo|artigo\s+a\s+feminino/.test(t)) {
    return 'teste_a_a';
  }
  if (/teste\s*2|teste 2|t2\b|verbo|infinitivo/.test(t)) {
    return 'teste_verbo';
  }
  if (/teste\s*1|teste 1|t1\b|masculino/.test(t)) {
    return 'teste_masculino';
  }
  if (/crase\s*=\s*a\s*\+\s*a|fus[aã]o|prep[oó]si[cç][aã]o|preposicao|artigo/.test(t)) {
    return 'definicao';
  }
  return 'generico';
}

/** Extrai letra A–E do começo de um step ou label. */
export function extractStepLetter(text: string): string | null {
  const match = text.trim().match(/^([A-E])\s*[:.\-–—]/i);
  return match ? match[1].toUpperCase() : null;
}

/** Papel do step no funil (para o logic_flow). */
export function inferStepRole(text: string): PtCraseStepRole {
  const t = normalize(text);
  if (/^gabarito\b|letra\s+[a-e]\b.*sobrev|marque\s+[a-e]\b/.test(t)) {
    return 'gabarito';
  }
  if (/em similares|transfer[eê]|antes de marcar|antes de assinalar|em outra banca|em outra prova/.test(t)) {
    return 'transferencia';
  }
  const letter = extractStepLetter(text);
  if (letter) {
    // Negativos primeiro: «não a+a» / «sem crase» NÃO podem virar “passa”
    if (
      /sem crase|barra|barrad|nunca|nao\s+(e\s+)?a\s*\+\s*a|nao\s+e\s+a\s*\+|automatic|errado|proibid|so\s+prep|so\s+a\b|use\s+so\s+a|nao\s+use|rejeita|errou/.test(
        t,
      )
    ) {
      return 'eliminar_letra';
    }
    // Positivos explícitos (gabarito / “passa”)
    if (
      /\bpassa\b|sobrev|valida|unica|unico|\bcorreto\b|teste:\s*ao|pede\s+a\s*\+\s*a|→\s*a\s*\+\s*a|->\s*a\s*\+\s*a/.test(
        t,
      )
    ) {
      return 'validar_letra';
    }
    // Padrão do funil: letra no início = corte (eliminação)
    return 'eliminar_letra';
  }
  return 'generico';
}

/** Chips descritivos por estágio (para deck / danger arena). Curtos, sem gabarito. */
export function stageChips(stage: PtCraseFunnelStage): PtCraseChip[] {
  switch (stage) {
    case 'definicao':
      return [{ label: 'a + a', tone: 'amber' }];
    case 'teste_masculino':
      return [{ label: 'T1', tone: 'slate' }, { label: 'masc.', tone: 'rose' }];
    case 'teste_verbo':
      return [{ label: 'T2', tone: 'slate' }, { label: 'verbo', tone: 'rose' }];
    case 'teste_a_a':
      return [{ label: 'T3', tone: 'slate' }, { label: 'à / às', tone: 'emerald' }];
    case 'teste_ao':
      return [{ label: 'ao', tone: 'amber' }];
    case 'pegadinha':
      return [{ label: 'chute culto', tone: 'rose' }];
    default:
      return [];
  }
}

/** Label curto para o chip do topo do card ou linha do board. */
export function stageBadge(stage: PtCraseFunnelStage): string {
  switch (stage) {
    case 'definicao':
      return 'DEFINIÇÃO';
    case 'teste_masculino':
      return 'T1 · MASC.';
    case 'teste_verbo':
      return 'T2 · VERBO';
    case 'teste_a_a':
      return 'T3 · a + a';
    case 'teste_ao':
      return 'PORTÁTIL · ao';
    case 'pegadinha':
      return 'PEGADINHA';
    default:
      return 'FUNIL';
  }
}

/** Bucket TE-simples do board (sem jargão T1/T2/T3 na UI). */
export type PtCraseBucket = 'sem_crase' | 'com_crase';

export interface PtCraseFunnelOption {
  letter: string;
  example: string;
  bucket: PtCraseBucket;
  stage: PtCraseFunnelStage;
}

export interface PtCraseFunnelBoardModel {
  /** Trecho com à correta (do step que passa). */
  keyExample: string;
  /** Resposta esperada no Passo 1 («tem a + a?»). */
  keyHasFusion: boolean;
  options: PtCraseFunnelOption[];
  answerLetter: string;
  transferRule?: string;
}

function firstQuotedText(text: string): string | null {
  const match = text.match(/[«“"]([^»”"]+)[»”"]/);
  return match?.[1]?.trim() || null;
}

/** Extrai trecho curto para o board (aspas → à/às → início do step). */
function extractCraseExample(step: string): string | null {
  const quoted = firstQuotedText(step);
  if (quoted) return quoted;

  const withArticle = step.match(
    /\b(?:[\p{L}-]+\s+)?(?:à|às)\s+[\p{L}]+(?:\s+(?:da|de|do|das|dos)\s+[\p{L}]+)*/u,
  );
  if (withArticle?.[0]) return withArticle[0].trim();

  const rest = step.replace(/^[A-E]\s*[:.\-–—]\s*/i, '').trim();
  if (!rest) return null;
  const head = rest.split(/\s*[—–→]|\.\s/)[0]?.trim() ?? rest;
  return head.length > 64 ? `${head.slice(0, 61)}…` : head;
}

function roleToBucket(role: PtCraseStepRole): PtCraseBucket | null {
  if (role === 'validar_letra') return 'com_crase';
  if (role === 'eliminar_letra') return 'sem_crase';
  return null;
}

/**
 * Detecta funil letra-a-letra e monta board comparativo Sem à · Com à.
 * Retorna null se faltar estrutura (fallback no tap-flow legado).
 */
export function buildPtCraseFunnelBoard(steps: string[]): PtCraseFunnelBoardModel | null {
  if (steps.length < 4) return null;

  const options = steps.flatMap<PtCraseFunnelOption>((step) => {
    const letter = extractStepLetter(step);
    if (!letter) return [];
    const role = inferStepRole(step);
    const bucket = roleToBucket(role);
    if (!bucket) return [];
    const example = extractCraseExample(step);
    if (!example) return [];
    return [
      {
        letter,
        example,
        bucket,
        stage: inferFunnelStage(step),
      },
    ];
  });

  const gabaritoStep = steps.find((step) => inferStepRole(step) === 'gabarito');
  const answerLetter =
    gabaritoStep?.match(/\bgabarito\s+([A-E])\b/i)?.[1]?.toUpperCase() ??
    options.find((o) => o.bucket === 'com_crase')?.letter ??
    null;

  const passStep =
    steps.find(
      (step) =>
        extractStepLetter(step) === answerLetter && inferStepRole(step) === 'validar_letra',
    ) ??
    steps.find((step) => extractStepLetter(step) === answerLetter);

  const keyExample =
    (passStep ? extractCraseExample(passStep) : null) ??
    options.find((o) => o.letter === answerLetter)?.example ??
    null;

  const transferRule = steps.find((step) => inferStepRole(step) === 'transferencia');

  if (!answerLetter || !keyExample || options.length < 2) {
    return null;
  }

  const hasPass = options.some((o) => o.bucket === 'com_crase' && o.letter === answerLetter);
  if (!hasPass) return null;

  return {
    keyExample,
    keyHasFusion: true,
    options,
    answerLetter,
    transferRule,
  };
}

/**
 * Badge do painel golden (P0): "barra" só quando o exemplo é sem crase;
 * "valida à" / "passa" no estágio que confirma à; "portátil" no teste ao.
 */
export type PtCraseRowBadge = 'barra' | 'valida à' | 'passa' | 'portátil' | 'funil';

export function inferRowBoardBadge(input: {
  label?: string;
  value?: string;
  emphasis?: string | null;
}): PtCraseRowBadge {
  const emphasis = (input.emphasis ?? 'default').toLowerCase();
  if (emphasis === 'success') return 'valida à';
  if (emphasis === 'highlight') return 'portátil';
  if (emphasis === 'alert') return 'barra';

  const text = `${input.label ?? ''} ${input.value ?? ''}`;
  const stage = inferFunnelStage(text);
  const t = normalize(text);

  if (stage === 'teste_ao') return 'portátil';
  if (stage === 'teste_a_a') return 'valida à';
  if (stage === 'teste_masculino' || stage === 'teste_verbo' || stage === 'pegadinha') {
    return 'barra';
  }
  if (/sem crase|nunca crase|nunca a|so prep|so a\b|barra/.test(t)) return 'barra';
  if (/→\s*a\s*\/\s*as|→\s*à|->\s*à|valida|passa|a \+ a feminino/.test(t)) return 'passa';
  return 'funil';
}
