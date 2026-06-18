/** Utilitários compartilhados pelos moldes premium de Verificação de Sinais Vitais. */

export type SvKind = 'pa' | 'temp' | 'fc' | 'fr' | 'spo2' | 'meta' | 'other';

const SV_KIND_VALUES: SvKind[] = ['pa', 'temp', 'fc', 'fr', 'spo2', 'meta', 'other'];

export function isExplicitSvKind(value: unknown): value is SvKind {
  return typeof value === 'string' && SV_KIND_VALUES.includes(value as SvKind);
}

/** Evita falso positivo: "Tempo ideal" ≠ temperatura; "palpação" ≠ pressão arterial. */
export function inferSvKind(text: string): SvKind {
  const lower = text.toLowerCase();

  if (
    /mmhg|press[aã]o arterial|\bpa\s*\d|sist[oó]lica|diast[oó]lica/.test(lower) &&
    !/palpa|pulso/.test(lower)
  ) {
    return 'pa';
  }

  if (
    /(?:temperatura|termometria)|°\s*c\b|\baxilar\b|\bretal\b|febr|afebril/.test(lower) &&
    !/\btempo\b/.test(lower)
  ) {
    return 'temp';
  }

  if (
    /fc\b|frequ[eê]ncia card|batimentos?\s+por\s+min|\bbpm\b|card[ií]ac|pulso radial|\bpulso\b/.test(
      lower,
    )
  ) {
    return 'fc';
  }

  if (/fr\b|frequ[eê]ncia resp|mpm|irpm|respirat/.test(lower)) return 'fr';
  if (/spo2|saturação|saturacao|oxim/.test(lower)) return 'spo2';
  return 'other';
}

export function resolveSvKindForRow(row: {
  label?: string;
  value?: string;
  sv_kind?: string;
}): SvKind {
  if (isExplicitSvKind(row.sv_kind)) {
    return row.sv_kind === 'meta' ? 'meta' : row.sv_kind;
  }
  return inferSvKind(`${row.label ?? ''} ${row.value ?? ''}`);
}

export function rowHasMeasuredVital(label: string, value: string): boolean {
  const blob = `${label} ${value}`;
  return (
    /\d+\s*bpm/i.test(blob) ||
    /\d+\s*[×x]\s*\d+\s*mmhg/i.test(blob) ||
    /\d+[,.]?\d*\s*°\s*c/i.test(blob) ||
    /\d+\s*(?:mpm|irpm)/i.test(blob) ||
    (/\d+\s*%/.test(blob) && /spo2|saturação|saturacao/i.test(blob))
  );
}

/** Detecta row incompatível com vitals-reference-board (inferência errada ou label vaga sem sv_kind). */
export function isSvRowMoldCompatible(row: {
  label?: string;
  value?: string;
  sv_kind?: string;
}): boolean {
  if (row.sv_kind === 'meta') return true;
  const label = (row.label ?? '').trim();
  const text = `${label} ${row.value ?? ''}`.toLowerCase();
  const kind = resolveSvKindForRow(row);
  if (/\btempo\b/.test(text) && kind === 'temp') return false;
  if (/palpa/.test(text) && kind === 'pa') return false;
  if (/^(como aferir|tempo ideal|normalidade)$/i.test(label)) return false;
  return true;
}

export function inferSvIconName(text: string, explicitKind?: SvKind): string {
  const kind = explicitKind ?? inferSvKind(text);
  switch (kind) {
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
    case 'meta':
      return 'ClipboardList';
    default:
      return 'Gauge';
  }
}

export function inferSvShortLabel(text: string, explicitKind?: SvKind): string {
  const kind = explicitKind ?? inferSvKind(text);
  switch (kind) {
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
    case 'meta':
      return 'Referência da prova';
    default:
      return 'Sinal vital';
  }
}

export function inferSvReferenceRange(text: string, explicitKind?: SvKind): string {
  const kind = explicitKind ?? inferSvKind(text);
  if (kind === 'meta' || kind === 'other') return '';
  switch (kind) {
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

export function extractMeasuredValue(label: string, value?: string): string {
  const trimmed = label.trim();
  const paMatch = trimmed.match(/\d+\s*[×x]\s*\d+\s*mmhg/i);
  if (paMatch) return paMatch[0].replace(/\s+/g, ' ');
  const tempMatch = trimmed.match(/\d+[,.]?\d*\s*°\s*c/i);
  if (tempMatch) return tempMatch[0];
  const bpmMatch = trimmed.match(/\d+\s*bpm/i);
  if (bpmMatch) return bpmMatch[0];
  const frMatch = trimmed.match(/\d+\s*(?:mpm|irpm)/i);
  if (frMatch) return frMatch[0];
  const spo2Match = trimmed.match(/\d+\s*%/);
  if (spo2Match && /spo2|saturação|saturacao/i.test(trimmed)) return spo2Match[0];
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx >= 0) return trimmed.slice(colonIdx + 1).trim();
  if (value?.trim()) return value.trim();
  return trimmed;
}

export function isConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /conclus|gabarito|alternativa|letra [a-e]|marcar|\bcerto\b|\berrado\b/.test(text);
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
  const match = step.match(/interpretar\s+(?:a\s+)?(.+?):\s*(.+?)\s*=\s*(.+?)\.?$/i);
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
