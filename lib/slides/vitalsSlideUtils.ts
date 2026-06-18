/** Utilitários compartilhados pelos moldes premium de Verificação de Sinais Vitais. */

export type SvKind = 'pa' | 'temp' | 'fc' | 'fr' | 'spo2' | 'other';

export function inferSvKind(text: string): SvKind {
  const lower = text.toLowerCase();
  if (/pa\b|pressão|pressao|sistólica|sistolica|mmhg|diastólica|diastolica/.test(lower)) {
    return 'pa';
  }
  if (/temp|°c|axilar|retal|febr|afebr/.test(lower)) return 'temp';
  if (/fc\b|frequência card|frequencia card|bpm|pulso|cardíac|cardiac/.test(lower)) return 'fc';
  if (/fr\b|frequência resp|frequencia resp|mpm|irpm|respirat/.test(lower)) return 'fr';
  if (/spo2|saturação|saturacao|oxim/.test(lower)) return 'spo2';
  return 'other';
}

export function inferSvIconName(text: string): string {
  switch (inferSvKind(text)) {
    case 'pa':
      return 'Scale';
    case 'temp':
      return 'Thermometer';
    case 'fc':
      return 'HeartPulse';
    case 'fr':
      return 'Wind';
    case 'spo2':
      return 'Activity';
    default:
      return 'Gauge';
  }
}

export function inferSvShortLabel(text: string): string {
  switch (inferSvKind(text)) {
    case 'pa':
      return 'Pressão arterial';
    case 'temp':
      return 'Temperatura';
    case 'fc':
      return 'Frequência cardíaca';
    case 'fr':
      return 'Frequência respiratória';
    case 'spo2':
      return 'Saturação O₂';
    default:
      return 'Sinal vital';
  }
}

export function inferSvReferenceRange(text: string): string {
  switch (inferSvKind(text)) {
    case 'pa':
      return '< 120×80 mmHg';
    case 'temp':
      return '36,0–37,4°C axilar';
    case 'fc':
      return '60–100 bpm';
    case 'fr':
      return '12–20 irpm';
    case 'spo2':
      return '≥ 95%';
    default:
      return '';
  }
}

export function extractMeasuredValue(label: string): string {
  const trimmed = label.trim();
  const paMatch = trimmed.match(/\d+\s*[×x]\s*\d+\s*mmhg/i);
  if (paMatch) return paMatch[0].replace(/\s+/g, ' ');
  const tempMatch = trimmed.match(/\d+[,.]?\d*\s*°c/i);
  if (tempMatch) return tempMatch[0];
  const bpmMatch = trimmed.match(/\d+\s*bpm/i);
  if (bpmMatch) return bpmMatch[0];
  const frMatch = trimmed.match(/\d+\s*(?:mpm|irpm)/i);
  if (frMatch) return frMatch[0];
  const spo2Match = trimmed.match(/\d+\s*%/);
  if (spo2Match && /spo2|saturação|saturacao/i.test(trimmed)) return spo2Match[0];
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx >= 0) return trimmed.slice(colonIdx + 1).trim();
  return trimmed;
}

export function isConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /conclus|gabarito|alternativa|letra [a-e]|marcar/.test(text);
}

export type ParsedTranslationStep =
  | {
      kind: 'translation';
      svName: string;
      rawValue: string;
      clinicalTerm: string;
      referenceRange: string;
      iconName: string;
    }
  | {
      kind: 'plain';
      text: string;
      title: string;
    };

export function parseTranslationStep(step: string, index: number): ParsedTranslationStep {
  const match = step.match(
    /interpretar\s+(?:a\s+)?(.+?):\s*(.+?)\s*=\s*(.+?)\.?$/i,
  );
  if (match) {
    const svName = match[1].trim();
    const rawValue = match[2].trim();
    const clinicalTerm = match[3].trim();
    const iconSource = `${svName} ${rawValue}`;
    return {
      kind: 'translation',
      svName,
      rawValue,
      clinicalTerm,
      referenceRange: inferSvReferenceRange(iconSource),
      iconName: inferSvIconName(iconSource),
    };
  }

  const lower = step.toLowerCase();
  let title = `Passo ${index + 1}`;
  if (/combinar|marcar|gabarito|alternativa/.test(lower)) title = 'Conclusão';
  if (/ler o caso|identificar os valores/.test(lower)) title = 'Leitura inicial';

  return { kind: 'plain', text: step, title };
}
