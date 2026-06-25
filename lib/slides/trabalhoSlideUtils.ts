/** Utilitários compartilhados pelos moldes premium de Enfermagem do Trabalho. */

export type Nr32Annex =
  | 'biologico'
  | 'quimico'
  | 'fisico'
  | 'ergonomico'
  | 'acidente'
  | 'nr32'
  | 'vacina'
  | 'epi'
  | 'gabarito'
  | 'geral';

export type PepSlot = 'lavar' | 'notificar' | 'exames' | 'profilaxia' | 'cat' | 'retorno';

export const NR32_ANNEX_SLOTS: Nr32Annex[] = [
  'biologico',
  'quimico',
  'fisico',
  'ergonomico',
  'acidente',
];

export const PEP_CHAIN_SLOTS: PepSlot[] = ['lavar', 'notificar', 'exames', 'profilaxia'];

export function nr32AnnexLabel(annex: Nr32Annex): string {
  switch (annex) {
    case 'biologico':
      return 'Anexo I';
    case 'quimico':
      return 'Anexo II';
    case 'fisico':
      return 'Anexo III';
    case 'ergonomico':
      return 'Anexo IV';
    case 'acidente':
      return 'Anexo V';
    case 'nr32':
      return 'NR-32';
    case 'vacina':
      return 'Vacina';
    case 'epi':
      return 'EPI';
    case 'gabarito':
      return 'Gabarito';
    default:
      return 'Trabalho';
  }
}

export function pepSlotLabel(slot: PepSlot): string {
  switch (slot) {
    case 'lavar':
      return 'Lavar';
    case 'notificar':
      return 'Notificar';
    case 'exames':
      return 'Exames';
    case 'profilaxia':
      return 'Profilaxia';
    case 'cat':
      return 'CAT';
    case 'retorno':
      return 'Retorno';
    default:
      return slot;
  }
}

export function inferNr32Annex(title: string, description = ''): Nr32Annex {
  const text = `${title} ${description}`.toLowerCase();
  if (/gabarito|resposta|letra\s*[a-e]\s*—/i.test(text)) return 'gabarito';
  if (/nr-?32|norma regulamentadora|serviços de saúde|servicos de saude/.test(text)) return 'nr32';
  if (/vacina|hepatite|influenza|imuniza|pní|pni/.test(text)) return 'vacina';
  if (/epi|equipamento de proteção|equipamento de protecao|luva|máscara|mascara|avental/.test(text)) {
    return 'epi';
  }
  if (/anexo\s*i\b|biológico|biologico|perfuro|material biológico|material biologico|sangue|fluido/.test(text)) {
    return 'biologico';
  }
  if (/anexo\s*ii\b|químico|quimico|desinfetante|antineoplásico|antineoplasico|fispq/.test(text)) {
    return 'quimico';
  }
  if (/anexo\s*iii\b|físico|fisico|radição|radiacao|ruído|ruido|temperatura/.test(text)) {
    return 'fisico';
  }
  if (/anexo\s*iv\b|ergonôm|ergonom|ler|dort|postura|levantamento|mobiliário|mobiliario/.test(text)) {
    return 'ergonomico';
  }
  if (/anexo\s*v\b|acidente|violência|violencia|queda|perfurocortante/.test(text)) return 'acidente';
  return 'geral';
}

export function inferPepSlot(label: string, detail: string, correct = ''): PepSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();
  if (/só lavar|so lavar|lavar e voltar|retornar ao trabalho|sem notificar|sem seguimento/.test(text)) {
    return 'lavar';
  }
  if (/notificar|comunicar|registrar|ocorrência|ocorrencia|cat\b/.test(text)) return 'notificar';
  if (/exame|sorologia|anti-hbs|hiv|hcv|hepatite c|fonte do paciente/.test(text)) return 'exames';
  if (/profilaxia|imunoglobulina|pep|pós-exposição|pos-exposicao|vacina hb/.test(text)) {
    return 'profilaxia';
  }
  if (/cat\b|comunicação de acidente|comunicacao de acidente|inss/.test(text)) return 'cat';
  if (/retorno|afastamento|voltar ao trabalho/.test(text)) return 'retorno';
  return 'notificar';
}

export function inferPepTrapSlots(label: string, detail: string, correct: string): PepSlot[] {
  const text = `${label} ${detail}`.toLowerCase();
  const traps: PepSlot[] = [];
  if (/só lavar|so lavar|lavar e voltar|sem notificar|sem seguimento|basta lavar/.test(text)) {
    traps.push('lavar');
  }
  if (/não notificar|nao notificar|omitir notificação|omitir notificacao|sem cat/.test(text)) {
    traps.push('notificar');
  }
  if (/sem exame|pular exame|dispensar sorologia/.test(text)) {
    traps.push('exames');
  }
  if (/sem profilaxia|dispensar pep|não indicar vacina|nao indicar vacina/.test(text)) {
    traps.push('profilaxia');
  }
  if (traps.length === 0) {
    traps.push(inferPepSlot(label, detail, correct));
  }
  return traps;
}

export function inferPepCorrectSlots(label: string, detail: string, correct: string): PepSlot[] {
  const text = `${correct} ${label}`.toLowerCase();
  const slots: PepSlot[] = [];
  if (/lavar|higienizar|lavagem/.test(text)) slots.push('lavar');
  if (/notificar|comunicar|registrar|protocolo|cat/.test(text)) slots.push('notificar');
  if (/exame|sorologia|avaliar fonte/.test(text)) slots.push('exames');
  if (/profilaxia|imunoglobulina|vacina|pep/.test(text)) slots.push('profilaxia');
  if (slots.length === 0) {
    return PEP_CHAIN_SLOTS;
  }
  return slots;
}
