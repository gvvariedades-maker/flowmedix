/** Utilitários compartilhados pelos moldes premium de Segurança do Paciente (NSP). */

export type SpIdSlot =
  | 'wristband'
  | 'two_identifiers'
  | 'homonym'
  | 'bedside'
  | 'barcode'
  | 'wrong_patient'
  | 'general';

export type SpFallSlot =
  | 'morse'
  | 'risk_factor'
  | 'environment'
  | 'intervention'
  | 'bracelet'
  | 'mobility'
  | 'general';

export type SpIncidentSlot =
  | 'adverse_event'
  | 'incident'
  | 'near_miss'
  | 'no_harm'
  | 'notification'
  | 'culture'
  | 'general';

export type SpTrapSlot = SpIdSlot | SpFallSlot | SpIncidentSlot;

export type SpBranchHint =
  | 'sp_identificacao'
  | 'sp_prevencao_quedas'
  | 'sp_eventos_adversos'
  | 'sp_metas_internacionais'
  | 'sp_generico';

export const SP_ID_RAIL_SLOTS: SpIdSlot[] = [
  'two_identifiers',
  'wristband',
  'bedside',
  'homonym',
  'barcode',
];

export const SP_FALL_RAIL_SLOTS: SpFallSlot[] = [
  'morse',
  'risk_factor',
  'environment',
  'intervention',
  'bracelet',
  'mobility',
];

export const SP_INCIDENT_DECK_SLOTS: SpIncidentSlot[] = [
  'adverse_event',
  'incident',
  'near_miss',
  'no_harm',
  'notification',
  'culture',
];

export function spIdSlotLabel(slot: SpIdSlot): string {
  switch (slot) {
    case 'wristband':
      return 'Pulseira';
    case 'two_identifiers':
      return '2 IDs';
    case 'homonym':
      return 'Homônimo';
    case 'bedside':
      return 'Leito';
    case 'barcode':
      return 'Código';
    case 'wrong_patient':
      return 'Paciente errado';
    default:
      return 'NSP';
  }
}

export function spFallSlotLabel(slot: SpFallSlot): string {
  switch (slot) {
    case 'morse':
      return 'Morse';
    case 'risk_factor':
      return 'Risco';
    case 'environment':
      return 'Ambiente';
    case 'intervention':
      return 'Intervenção';
    case 'bracelet':
      return 'Pulseira';
    case 'mobility':
      return 'Mobilidade';
    default:
      return 'Queda';
  }
}

export function spIncidentSlotLabel(slot: SpIncidentSlot): string {
  switch (slot) {
    case 'adverse_event':
      return 'Evento adverso';
    case 'incident':
      return 'Incidente';
    case 'near_miss':
      return 'Quase erro';
    case 'no_harm':
      return 'Sem dano';
    case 'notification':
      return 'Notificação';
    case 'culture':
      return 'Cultura';
    default:
      return 'PNSP';
  }
}

export function spTrapSlotLabel(slot: SpTrapSlot): string {
  if (SP_ID_RAIL_SLOTS.includes(slot as SpIdSlot)) {
    return spIdSlotLabel(slot as SpIdSlot);
  }
  if (SP_FALL_RAIL_SLOTS.includes(slot as SpFallSlot)) {
    return spFallSlotLabel(slot as SpFallSlot);
  }
  return spIncidentSlotLabel(slot as SpIncidentSlot);
}

export function inferSpIdSlot(title: string, description = ''): SpIdSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/paciente errado|troca de paciente|hom[oô]nimo|mesmo nome/.test(text)) return 'homonym';
  if (/dois identificador|2 identificador|dupla checagem|dois dados/.test(text)) {
    return 'two_identifiers';
  }
  if (/pulseira|identifica[cç][aã]o do paciente|bra[cç]adeira/.test(text)) return 'wristband';
  if (/leito|cabeceira|quarto|local/.test(text)) return 'bedside';
  if (/c[oó]digo de barras|barcode|crach[aá]/.test(text)) return 'barcode';
  if (/um s[oó] identificador|sem checagem|n[aã]o perguntar/.test(text)) return 'wrong_patient';
  return 'general';
}

export function inferSpFallSlot(title: string, description = ''): SpFallSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/\bmorse\b|escala de morse|pontua[cç][aã]o.*morse/.test(text)) return 'morse';
  if (/pulseira.*queda|identifica[cç][aã]o.*risco|amarela/.test(text)) return 'bracelet';
  if (/grade|cama|corrim[aã]o|ambiente|ilumina[cç][aã]o|piso/.test(text)) return 'environment';
  if (/cal[cç]ado|anti-derrapante|mobilidade|deambula|transfer[eê]ncia/.test(text)) {
    return 'mobility';
  }
  if (/interven[cç][aã]o|protocolo|precau[cç][aã]o|sinaliza[cç][aã]o/.test(text)) return 'intervention';
  if (/fator de risco|idoso|confus|sedado|hipoten|vertig/.test(text)) return 'risk_factor';
  return 'general';
}

export function inferSpIncidentSlot(title: string, description = ''): SpIncidentSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/quase erro|near miss|quase incidente/.test(text)) return 'near_miss';
  if (/evento adverso|dano ao paciente|les[aã]o.*paciente/.test(text)) return 'adverse_event';
  if (/incidente(?!.*adverso)|sem dano|sem les[aã]o/.test(text)) return 'incident';
  if (/notifica[cç][aã]o|notificar|registro|portaria.*529|\bpnsp\b/.test(text)) {
    return 'notification';
  }
  if (/cultura de seguran[cç]a|aprendizado|melhoria cont[ií]nua/.test(text)) return 'culture';
  if (/sem dano|n[aã]o atingiu o paciente/.test(text)) return 'no_harm';
  return 'general';
}

export function inferSpBranchFromText(corpus: string): SpBranchHint {
  const text = corpus.toLowerCase();
  if (/dois identificador|pulseira.*identifica|paciente errado|hom[oô]nimo|dupla checagem/.test(text)) {
    return 'sp_identificacao';
  }
  if (/queda|\bmorse\b|risco de queda|grades da cama|prevenc[aã]o de queda/.test(text)) {
    return 'sp_prevencao_quedas';
  }
  if (/evento adverso|incidente|near miss|quase erro|\bpnsp\b|portaria.*529/.test(text)) {
    return 'sp_eventos_adversos';
  }
  if (/metas internacionais|\bjci\b|joint commission|6 metas/.test(text)) {
    return 'sp_metas_internacionais';
  }
  return 'sp_generico';
}

export function inferSpTrapSlot(
  label: string,
  detail: string,
  correct = '',
  branchHint?: SpBranchHint,
): SpTrapSlot {
  const corpus = `${label} ${detail} ${correct}`;
  const branch = branchHint ?? inferSpBranchFromText(corpus);

  if (branch === 'sp_identificacao') {
    return inferSpIdSlot(label, `${detail} ${correct}`);
  }
  if (branch === 'sp_prevencao_quedas') {
    return inferSpFallSlot(label, `${detail} ${correct}`);
  }
  if (branch === 'sp_eventos_adversos') {
    return inferSpIncidentSlot(label, `${detail} ${correct}`);
  }

  const id = inferSpIdSlot(label, `${detail} ${correct}`);
  if (id !== 'general') return id;
  const fall = inferSpFallSlot(label, `${detail} ${correct}`);
  if (fall !== 'general') return fall;
  return inferSpIncidentSlot(label, `${detail} ${correct}`);
}

export function inferSpTrapFixation(slot: SpTrapSlot, correct: string): string {
  if (correct.trim()) return correct.trim();
  if (slot === 'two_identifiers' || slot === 'wristband' || slot === 'bedside') {
    return 'Identificação segura exige dois identificadores independentes — nome e data de nascimento no leito.';
  }
  if (slot === 'homonym' || slot === 'wrong_patient') {
    return 'Homônimos e troca de paciente são erro clássico — sempre checar dois identificadores no leito.';
  }
  if (slot === 'morse' || slot === 'risk_factor') {
    return 'Escala de Morse e fatores de risco guiam o plano — não subestime idoso ou paciente confuso.';
  }
  if (slot === 'environment' || slot === 'mobility') {
    return 'Ambiente seguro: grades elevadas, piso seco, calçado adequado e supervisão na transferência.';
  }
  if (slot === 'near_miss' || slot === 'incident') {
    return 'PNSP: quase erro e incidente sem dano também devem ser notificados — cultura de segurança.';
  }
  if (slot === 'adverse_event' || slot === 'notification') {
    return 'Evento adverso com dano exige notificação institucional — classifique e registre sem omitir.';
  }
  return 'Relacione a pegadinha ao protocolo NSP da questão antes de marcar a letra.';
}
