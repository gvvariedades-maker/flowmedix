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

  // Antes de FC: "oximetria de pulso" não pode virar FC por causa de "pulso"
  // NÃO usar "oxim" solto — casa dentro de "aproximam"/"aproximação"
  if (/spo2|satura[cç][aã]o|oximetr/.test(lower)) return 'spo2';

  if (
    /fc\b|frequ[eê]ncia card|batimentos?\s+por\s+min|\bbpm\b|card[ií]ac|pulso radial|\bpulso\b/.test(
      lower,
    )
  ) {
    return 'fc';
  }

  if (/fr\b|frequ[eê]ncia resp|mpm|irpm|respirat/.test(lower)) return 'fr';
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
  const lower = text.toLowerCase();
  if (/ocular|abertura ocular|\bolhos?\b/.test(lower)) return 'Eye';
  if (/verbal|resposta verbal/.test(lower)) return 'MessageCircle';
  if (/motor|resposta motora/.test(lower)) return 'Hand';
  if (/\bpupilas?\b/.test(lower)) return 'ScanEye';
  if (/este caso|soma glasgow|pontua/.test(lower)) return 'Calculator';
  if (/classifica|grave|moderado/.test(lower) && /leve|glasgow|faixa/.test(lower)) return 'Layers';
  if (/classifica/.test(lower)) return 'Layers';

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
  const lower = text.toLowerCase();
  if (/em similares|transfer[eê]ncia|outra banca|\bmcq\b/.test(lower)) {
    return 'Transferência';
  }
  if (/glasgow|escore|abertura ocular|resposta verbal|resposta motora|\bpupilas?\b/.test(lower)) {
    return 'Glasgow';
  }
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

/**
 * Faixa normativa só quando o card traz valor aferido (mmHg/bpm/…).
 * Técnica (manguito, posição, repouso) não deve colar "< 120×80".
 */
export function shouldShowSvReferenceRange(
  label: string,
  value: string,
  explicitKind?: SvKind,
): boolean {
  const kind = explicitKind ?? inferSvKind(`${label} ${value}`);
  if (kind === 'meta' || kind === 'other') return false;
  return rowHasMeasuredVital(label, value);
}

export function inferSvReferenceRange(text: string, explicitKind?: SvKind): string {
  const kind = explicitKind ?? inferSvKind(text);
  if (kind === 'meta' || kind === 'other') return '';
  switch (kind) {
    case 'pa':
      return '< 120×80 mmHg';
    case 'temp':
      return '36–37,5°C axilar';
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

/** Normaliza texto de faixa/valor para detectar duplicata visual (60 a 100 ≈ 60–100). */
export function normalizeSvDisplayText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[×x]/g, 'x')
    .replace(/[–—−-]/g, ' ')
    .replace(/\ba\b/g, ' ')
    .replace(/[^a-z0-9.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function svDisplayTextsNearDuplicate(a: string, b: string): boolean {
  const left = normalizeSvDisplayText(a);
  const right = normalizeSvDisplayText(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
}

/** Faixa normativa (60 a 100 bpm) ≠ valor aferido de um paciente (110 bpm). */
export function isSvNormativeRangeText(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\d+\s*(?:a|–|-|ate|até)\s*\d+/.test(t) ||
    /\d+\s*[–-]\s*\d+/.test(t) ||
    /<\s*\d+|≥\s*\d+|>=\s*\d+/.test(t)
  );
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

/**
 * Classifica NORMAL/ALTERADO a partir do valor aferido (sem termo clínico).
 * Usado no vitals-panel quando o concept_map omite `correct` (anti-spoiler).
 */
export function inferMeasuredVitalStatus(
  text: string,
): 'normal' | 'altered' | null {
  const blob = text.replace(/\s+/g, ' ').trim();
  if (!rowHasMeasuredVital(blob, '')) return null;

  const pa = blob.match(/(\d+)\s*[×x]\s*(\d+)\s*mmhg/i);
  if (pa) {
    const sys = Number(pa[1]);
    const dia = Number(pa[2]);
    if (!Number.isFinite(sys) || !Number.isFinite(dia)) return null;
    return sys < 120 && dia < 80 ? 'normal' : 'altered';
  }

  const temp = blob.match(/(\d+[,.]?\d*)\s*°\s*c/i);
  if (temp) {
    const c = Number(temp[1].replace(',', '.'));
    if (!Number.isFinite(c)) return null;
    return c >= 36 && c <= 37.5 ? 'normal' : 'altered';
  }

  const fc = blob.match(/(\d+)\s*bpm/i);
  if (fc) {
    const bpm = Number(fc[1]);
    if (!Number.isFinite(bpm)) return null;
    return bpm >= 60 && bpm <= 100 ? 'normal' : 'altered';
  }

  const fr = blob.match(/(\d+)\s*(?:mpm|irpm)/i);
  if (fr) {
    const rate = Number(fr[1]);
    if (!Number.isFinite(rate)) return null;
    return rate >= 12 && rate <= 20 ? 'normal' : 'altered';
  }

  const spo2 = blob.match(/(\d+)\s*%/);
  if (spo2 && /spo2|saturação|saturacao|oxim/i.test(blob)) {
    const pct = Number(spo2[1]);
    if (!Number.isFinite(pct)) return null;
    return pct >= 95 ? 'normal' : 'altered';
  }

  return null;
}

export function parseTranslationStep(step: string, index: number): ParsedTranslationStep {
  const interpret = step.match(/interpretar\s+(?:a\s+)?(.+?):\s*(.+?)\s*=\s*(.+?)\.?$/i);
  if (interpret) {
    const svName = interpret[1].trim();
    const rawValue = interpret[2].trim();
    const clinicalTerm = interpret[3].trim();
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

  // Forma compacta das âncoras: "PA 110×75 mmHg → normotenso (…)."
  // Não confundir com eliminação MCQ: "B: febril → eliminar." / "A — 30 a 60 irpm → candidata."
  const arrow = step.match(/^(.+?)\s*(?:→|->)\s*(.+?)\.?$/);
  if (arrow) {
    const left = arrow[1].trim();
    const right = arrow[2].trim();
    const rightLower = right.toLowerCase();
    const leftIsMcqLetter = /^[a-e]\b/i.test(left) || /^letra\s+[a-e]\b/i.test(left);
    if (
      !leftIsMcqLetter &&
      !/eliminar|elimine|gabarito|candidat|em similares|marcar|excluir/.test(rightLower) &&
      rowHasMeasuredVital(left, '') &&
      !/^[a-e]\s*:/i.test(left)
    ) {
      const clinicalTerm = right.replace(/\s*\([^)]*\)\s*$/, '').trim();
      const rawValue = extractMeasuredValue(left);
      const svName = inferSvShortLabel(left);
      const iconSource = `${left} ${rawValue}`;
      return {
        kind: 'translation',
        svName,
        rawValue,
        clinicalTerm,
        referenceRange: inferSvReferenceRange(iconSource),
        iconName: inferSvIconName(iconSource),
      };
    }
  }

  const lower = step.toLowerCase();
  let title = `Passo ${index + 1}`;
  if (/combinar|marcar|gabarito|alternativa|em similares/.test(lower)) title = 'Conclusão';
  if (/ler o caso|identificar os valores/.test(lower)) title = 'Leitura inicial';
  if (/^[a-e]\s*[:—-]/.test(step) || /eliminar|candidat/.test(lower)) title = 'Eliminação';

  return { kind: 'plain', text: step, title };
}
