/** Utilitários compartilhados pelos moldes premium de Saúde do Adolescente. */

export type AdolescentCurtain = 'escuta' | 'sigilo' | 'acompanhamento' | 'prevencao' | 'gabarito' | 'geral';

export type SigiloSpectrumZone = 'protegido' | 'ponderar' | 'quebrar';

export type ConsentGatePath = 'acolher' | 'proteger' | 'vincular' | 'orientar';

const CURTAIN_ORDER: AdolescentCurtain[] = ['escuta', 'sigilo', 'acompanhamento', 'prevencao'];

export const ADOLESCENT_CURTAIN_SLOTS = CURTAIN_ORDER;

export function inferAdolescentCurtain(text: string): AdolescentCurtain {
  const lower = text.toLowerCase();
  if (/gabarito|resposta final|letra [a-e]|marcar/.test(lower)) return 'gabarito';
  if (/escuta|privacidade|acolh|vínculo|vinculo|linguagem acessível|linguagem acessivel|sem julgamento/.test(lower)) {
    return 'escuta';
  }
  if (/sigilo|confidencial|quebra de sigilo|quebrar sigilo|secreto/.test(lower)) return 'sigilo';
  if (/responsável|responsavel|acompanhante|pais|autonomia|consentimento/.test(lower)) {
    return 'acompanhamento';
  }
  if (/contracep|hpv|ist|vacina|prevenção|prevencao|sexualidade|orientação sexual|orientacao sexual/.test(lower)) {
    return 'prevencao';
  }
  if (/gravidez|gestante|pré-natal|pre-natal|gestação|gestacao/.test(lower)) return 'prevencao';
  return 'geral';
}

export function adolescentCurtainLabel(curtain: AdolescentCurtain): string {
  switch (curtain) {
    case 'escuta':
      return 'Escuta';
    case 'sigilo':
      return 'Sigilo';
    case 'acompanhamento':
      return 'Quem entra';
    case 'prevencao':
      return 'Prevenção';
    case 'gabarito':
      return 'Gabarito';
    default:
      return 'Cuidado';
  }
}

export function inferSigiloSpectrumZone(text: string): SigiloSpectrumZone {
  const lower = text.toLowerCase();
  if (
    /linguagem\s+(complexa|rebuscad)|rebuscad|jarg[aã]o|termos\s+m[eé]dicos|barreira/.test(
      lower,
    )
  ) {
    return 'quebrar';
  }
  if (/sempre quebrar|sem critério|sem criterio|absoluto zero|quebrar sempre|sigilo inexistente/.test(lower)) {
    return 'quebrar';
  }
  if (/risco grave|violência|violencia|abuso|notificação compulsória|notificacao compulsoria|quebra/.test(lower)) {
    return 'ponderar';
  }
  if (/privacidade|escuta|contracep|orientação sexual|orientacao sexual|protegido/.test(lower)) {
    return 'protegido';
  }
  if (/gabarito|verdadeira|correta|v[ií]nculo|rede|intersetor|comunidade/.test(lower)) {
    return 'protegido';
  }
  if (/falso|falsa|pegadinha|alert/.test(lower)) return 'quebrar';
  return 'ponderar';
}

export function sigiloSpectrumLabel(zone: SigiloSpectrumZone): string {
  switch (zone) {
    case 'protegido':
      return 'Protegido';
    case 'ponderar':
      return 'Ponderar';
    case 'quebrar':
      return 'Quebrar';
  }
}

/**
 * Hint do painel do espectro — contextual à linha (não só à zona).
 * Preferir `exam_hint` da row quando existir.
 */
export function inferSigiloSpectrumHint(
  zone: SigiloSpectrumZone,
  rowText: string,
  examHint?: string,
): string {
  const explicit = examHint?.trim();
  if (explicit) return explicit;

  const lower = rowText.toLowerCase();

  if (/linguagem|rebuscad|jarg[aã]o|termos\s+m[eé]dicos|barreira|complexa/.test(lower)) {
    return zone === 'quebrar'
      ? 'Pegadinha: informação completa ≠ jargão — sexualidade e preventivo em linguagem clara.'
      : 'Orientação sexual e preventivo pedem linguagem acessível, não termos rebuscados.';
  }
  if (/rede|intersetor|comunidade|escola|cultura|grupos/.test(lower)) {
    return 'Promoção intersetorial: escola, cultura e grupos de jovens na rede de cuidado.';
  }
  if (/v[ií]nculo|escuta|acolh|sem julgamento/.test(lower)) {
    return 'Vínculo e escuta sem julgamento sustentam a consulta com o adolescente.';
  }
  if (/sigilo|privacidade|consentimento|confidencial/.test(lower)) {
    if (zone === 'protegido') {
      return 'Tema protegido por sigilo — contracepção, orientação sexual, IST.';
    }
    if (zone === 'ponderar') {
      return 'Avaliar risco grave, violência ou notificação compulsória antes de quebrar.';
    }
    return 'Pegadinha: sigilo não é zero absoluto nem quebra sem critério.';
  }

  if (zone === 'protegido') {
    return 'Conduta alinhada ao MS — protege o adolescente no encontro de cuidado.';
  }
  if (zone === 'ponderar') {
    return 'Avaliar risco grave, violência ou notificação compulsória antes de quebrar.';
  }
  return 'Pegadinha: a banca troca o limite ético — leia o verbo da afirmativa.';
}

export function parseAdolescentVfWeaveStep(
  step: string,
  index: number,
): {
  kind: 'judgement' | 'combine' | 'fixation' | 'step';
  roman?: 'I' | 'II' | 'III';
  judgement?: 'true' | 'false';
  letter?: string;
  title: string;
  text: string;
} {
  const lower = step.toLowerCase();
  const romanMatch = step.match(/\b(I{1,3})\b/);
  const roman = romanMatch?.[1] as 'I' | 'II' | 'III' | undefined;

  if (/verdadeira|verdadeiro/.test(lower)) {
    return {
      kind: 'judgement',
      roman,
      judgement: 'true',
      title: roman ? `Afirmativa ${roman}` : `Passo ${index + 1}`,
      text: step,
    };
  }
  if (/falsa|falso/.test(lower)) {
    return {
      kind: 'judgement',
      roman,
      judgement: 'false',
      title: roman ? `Afirmativa ${roman}` : `Passo ${index + 1}`,
      text: step,
    };
  }
  if (/letra\s+([a-e])/i.test(step)) {
    const letter = step.match(/letra\s+([a-e])/i)?.[1]?.toUpperCase();
    return {
      kind: 'combine',
      letter,
      title: 'Tece o gabarito',
      text: step,
    };
  }
  if (/fixação|fixar|fixe/.test(lower)) {
    return { kind: 'fixation', title: 'Fixação', text: step };
  }
  return { kind: 'step', roman, title: `Passo ${index + 1}`, text: step };
}

export function inferConsentGatePath(
  label: string,
  detail: string,
  correct: string,
): { trapPath: ConsentGatePath; correctPath: ConsentGatePath } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  let trapPath: ConsentGatePath = 'orientar';
  let correctPath: ConsentGatePath = 'acolher';

  if (/sigilo|quebrar|confidencial/.test(trapText)) trapPath = 'proteger';
  if (/pré-natal|pre-natal|gravidez|gestante/.test(trapText)) trapPath = 'vincular';
  if (/responsável|responsavel|pais|privacidade/.test(trapText)) trapPath = 'acolher';

  if (/escuta|acolh|privacidade|autonomia/.test(correctText)) correctPath = 'acolher';
  if (/sigilo|critério|risco|legislação|legislacao/.test(correctText)) correctPath = 'proteger';
  if (/pré-natal|pre-natal|vincular/.test(correctText)) correctPath = 'vincular';
  if (/contracep|orientação|orientacao|prevenção|prevencao/.test(correctText)) correctPath = 'orientar';

  return { trapPath, correctPath };
}

export function consentGatePathLabel(path: ConsentGatePath): string {
  switch (path) {
    case 'acolher':
      return 'Acolher';
    case 'proteger':
      return 'Proteger';
    case 'vincular':
      return 'Vincular';
    case 'orientar':
      return 'Orientar';
  }
}

/** ---- Ética v2 — pilares / EXCETO / barreira de fala ---- */

export type AdolescentCarePillar = 'vinculo' | 'rede' | 'sigilo' | 'linguagem' | 'geral';

export function inferAdolescentCarePillar(text: string): AdolescentCarePillar {
  const lower = text.toLowerCase();
  if (/linguagem|jarg[aã]o|rebuscad|acess[ií]vel|comunica|falar claro|termos m[eé]dicos/.test(lower)) {
    return 'linguagem';
  }
  if (/sigilo|privacidade|consentimento|confidencial/.test(lower)) return 'sigilo';
  if (/rede|intersetor|escola|comunidade|cultura|grupos|promo[cç][aã]o/.test(lower)) return 'rede';
  if (/v[ií]nculo|escuta|acolh|confian[cç]a|sem julgamento/.test(lower)) return 'vinculo';
  return 'geral';
}

export function adolescentCarePillarLabel(pillar: AdolescentCarePillar): string {
  switch (pillar) {
    case 'vinculo':
      return 'Vínculo';
    case 'rede':
      return 'Rede';
    case 'sigilo':
      return 'Sigilo';
    case 'linguagem':
      return 'Fala clara';
    default:
      return 'Cuidado';
  }
}

export function parseAdolescentExcetoStep(
  step: string,
  index: number,
): {
  kind: 'command' | 'keep' | 'exception' | 'mark' | 'transfer' | 'step';
  letter?: string;
  title: string;
  text: string;
} {
  const lower = step.toLowerCase();
  if (/comando|incorreta|exceto/.test(lower) && index === 0) {
    return { kind: 'command', title: 'Comando', text: step };
  }
  if (/a[–\-–]c|a-c:|condutas certas|descartar/.test(lower)) {
    return { kind: 'keep', title: 'Manter', text: step };
  }
  if (/exce[cç][aã]o|incorreta|jarg[aã]o|rebuscad|complexa/.test(lower) && /d:|letra d|→/.test(lower)) {
    return { kind: 'exception', title: 'Exceção', text: step };
  }
  if (/marcar letra\s*([a-e])/i.test(step)) {
    const letter = step.match(/marcar letra\s*([a-e])/i)?.[1]?.toUpperCase();
    return { kind: 'mark', letter, title: 'Gabarito', text: step };
  }
  if (/em similares|fixa[cç][aã]o|transfer/.test(lower)) {
    return { kind: 'transfer', title: 'Em similares', text: step };
  }
  if (/letra\s+([a-e])/i.test(step)) {
    const letter = step.match(/letra\s+([a-e])/i)?.[1]?.toUpperCase();
    return { kind: 'mark', letter, title: 'Gabarito', text: step };
  }
  return { kind: 'step', title: `Passo ${index + 1}`, text: step };
}

export type SpeakBarrierSide = 'ok' | 'barrier' | 'rights' | 'neutral';

export function inferSpeakBarrierSide(label: string, value: string): SpeakBarrierSide {
  const text = `${label} ${value}`.toLowerCase();
  if (/n[aã]o falar|rebuscad|complexa|jarg[aã]o|barreira|parecer competente|termos m[eé]dicos/.test(text)) {
    return 'barrier';
  }
  if (/como falar|clara|acess[ií]vel|entender/.test(text)) return 'ok';
  if (/direito|sigilo|privacidade|consentimento/.test(text)) return 'rights';
  if (/informar|sexualidade|contracep|preventivo|dst|gravidez/.test(text)) return 'ok';
  return 'neutral';
}

