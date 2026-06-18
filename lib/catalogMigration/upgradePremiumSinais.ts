import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  extractCurativosAssertives,
  normalizeCurativosInstruction,
  resolveCurativosAssertives,
  type CurativosAssertive,
} from '@/lib/catalogMigration/upgradePremiumCurativos';

export const SINAIS_GOLDEN_FILE = 'questao-premium-fepese-sv-interpretacao-valores.json';
export const SINAIS_GOLDEN_CE_FILE = 'questao-premium-idecan-fc-radial-ce.json';

type SlideRecord = Record<string, unknown>;
type DangerZoneItem = { label: string; detail: string; correct: string };

export type BuildSinaisSlidesInput = {
  instruction: string;
  options: QuestionOption[];
  topico: string;
  subtopico: string;
};

type VitalKind = 'pa' | 'temp' | 'fc' | 'fr' | 'spo2';

type VitalReading = {
  kind: VitalKind;
  label: string;
  value: string;
  clinicalTerm: string;
  detail: string;
  icon: string;
  emphasis: 'success' | 'alert' | 'default';
  logicName: string;
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function slideMeta(topico: string, subtopico: string): { topico: string; subtopico: string } {
  return { topico, subtopico };
}

function parseDecimal(raw: string): number {
  return parseFloat(raw.replace(',', '.'));
}

export function isSinaisSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'verificação de sinais vitais' || n === 'sinais vitais';
}

export const normalizeSinaisInstruction = normalizeCurativosInstruction;

function classifyPa(sys: number, dia: number): Pick<VitalReading, 'clinicalTerm' | 'detail' | 'emphasis'> {
  if (sys >= 140 || dia >= 90) {
    return {
      clinicalTerm: 'Hipertenso',
      detail: 'Pressão arterial elevada para o adulto em repouso.',
      emphasis: 'alert',
    };
  }
  if (sys < 90 || dia < 60) {
    return {
      clinicalTerm: 'Hipotenso',
      detail: 'Pressão arterial abaixo do esperado para o adulto em repouso.',
      emphasis: 'alert',
    };
  }
  return {
    clinicalTerm: 'Normotenso',
    detail: 'Compatível com normotensão no adulto em repouso.',
    emphasis: 'success',
  };
}

function classifyTemp(celsius: number): Pick<VitalReading, 'clinicalTerm' | 'detail' | 'emphasis'> {
  if (celsius >= 37.8) {
    return {
      clinicalTerm: 'Febril',
      detail: 'Temperatura acima do limite de febre na aferição axilar.',
      emphasis: 'alert',
    };
  }
  if (celsius < 36.0) {
    return {
      clinicalTerm: 'Hipotermia',
      detail: 'Temperatura abaixo da faixa de normotermia.',
      emphasis: 'alert',
    };
  }
  return {
    clinicalTerm: 'Afebril',
    detail: 'Valor compatível com afebril / normotermia.',
    emphasis: 'success',
  };
}

function classifyFc(bpm: number): Pick<VitalReading, 'clinicalTerm' | 'detail' | 'emphasis'> {
  if (bpm > 100) {
    return {
      clinicalTerm: 'Taquicárdico',
      detail: 'Acima de 100 bpm: taquicardia.',
      emphasis: 'alert',
    };
  }
  if (bpm < 60) {
    return {
      clinicalTerm: 'Bradicárdico',
      detail: 'Abaixo de 60 bpm: bradicardia.',
      emphasis: 'alert',
    };
  }
  return {
    clinicalTerm: 'Normocárdico',
    detail: 'Entre 60 e 100 bpm: frequência cardíaca normal no adulto.',
    emphasis: 'success',
  };
}

function classifyFr(irpm: number): Pick<VitalReading, 'clinicalTerm' | 'detail' | 'emphasis'> {
  if (irpm > 20) {
    return {
      clinicalTerm: 'Taquipneico',
      detail: 'Acima de 20 irpm: taquipneia.',
      emphasis: 'alert',
    };
  }
  if (irpm < 12) {
    return {
      clinicalTerm: 'Bradipneico',
      detail: 'Abaixo de 12 irpm: bradipneia.',
      emphasis: 'alert',
    };
  }
  return {
    clinicalTerm: 'Eupneico',
    detail: 'Entre 12 e 20 irpm: frequência respiratória normal.',
    emphasis: 'success',
  };
}

function classifySpo2(pct: number): Pick<VitalReading, 'clinicalTerm' | 'detail' | 'emphasis'> {
  if (pct < 95) {
    return {
      clinicalTerm: 'Hipoxemia',
      detail: 'Saturação abaixo de 95% exige avaliação respiratória.',
      emphasis: 'alert',
    };
  }
  return {
    clinicalTerm: 'Saturação adequada',
    detail: 'SpO₂ ≥ 95% compatível com oxigenação adequada.',
    emphasis: 'success',
  };
}

function logicNameForKind(kind: VitalKind): string {
  switch (kind) {
    case 'pa':
      return 'a pressão arterial';
    case 'temp':
      return 'a temperatura axilar';
    case 'fc':
      return 'a frequência cardíaca';
    case 'fr':
      return 'a frequência respiratória';
    case 'spo2':
      return 'a saturação de oxigênio';
    default:
      return 'o sinal vital';
  }
}

function iconForKind(kind: VitalKind): string {
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
    default:
      return 'Gauge';
  }
}

function formatCelsius(c: number): string {
  return String(c).replace('.', ',');
}

/** Remove aspas usadas como bullet em importação PDF (ex.: `" PA …` / `" FC …`). */
function preprocessVitalsInstruction(instruction: string): string {
  return instruction
    .replace(/\r\n/g, '\n')
    .replace(/(?:^|\n)\s*["'"'«»]\s*/g, ' ')
    .replace(
      /(["'"'«»])\s+(?=(?:PA|Press[aã]o|Temperatura|Temp\.?\b|FC|FR|Frequ[eê]ncia|SpO2|SpO₂)\b)/gi,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function conceptLabelForVital(v: VitalReading): string {
  if (v.kind === 'temp' && v.logicName.includes('axilar')) {
    return `${v.value} axilar`;
  }
  return v.label;
}

export function extractVitalsFromInstruction(instruction: string): VitalReading[] {
  const text = preprocessVitalsInstruction(instruction);
  const readings: VitalReading[] = [];
  const seen = new Set<VitalKind>();

  const paMatch =
    text.match(/(?:pa|press[aã]o\s+arterial)\s*[:\s"']*(\d+)\s*[×xX]\s*(\d+)\s*mm\s*hg/i) ??
    text.match(/(\d+)\s*[×xX]\s*(\d+)\s*mm\s*hg/i);
  if (paMatch && !seen.has('pa')) {
    const sys = parseInt(paMatch[1], 10);
    const dia = parseInt(paMatch[2], 10);
    const classified = classifyPa(sys, dia);
    readings.push({
      kind: 'pa',
      label: `PA ${sys}×${dia} mmHg`,
      value: `${sys}×${dia} mmHg`,
      icon: iconForKind('pa'),
      logicName: logicNameForKind('pa'),
      ...classified,
    });
    seen.add('pa');
  }

  const tempMatch =
    text.match(/(?:temp(?:eratura)?(?:\s+axilar)?|axilar)\s*[:\s"']*(\d+[,.]?\d*)\s*°?\s*c/i) ??
    text.match(/(\d+[,.]?\d*)\s*°c\s*(?:axilar|retal|oral)?/i);
  if (tempMatch && !seen.has('temp')) {
    const c = parseDecimal(tempMatch[1]);
    const classified = classifyTemp(c);
    const matchIndex = tempMatch.index ?? 0;
    const context = text.slice(Math.max(0, matchIndex - 24), matchIndex + tempMatch[0].length + 24);
    const axilar = /axilar/i.test(context);
    const formatted = formatCelsius(c);
    const value = `${formatted}°C`;
    readings.push({
      kind: 'temp',
      label: axilar ? `Temperatura axilar ${formatted}°C` : `Temperatura ${formatted}°C`,
      value,
      icon: iconForKind('temp'),
      logicName: axilar ? 'a temperatura axilar' : logicNameForKind('temp'),
      ...classified,
    });
    seen.add('temp');
  }

  const fcMatch =
    text.match(/(?:fc|frequ[eê]ncia\s+card[ií]aca|pulso)\s*[:\s"']*(\d+)\s*bpm/i) ??
    (seen.has('fr') ? null : text.match(/\b(\d{2,3})\s*bpm\b/i));
  if (fcMatch && !seen.has('fc')) {
    const bpm = parseInt(fcMatch[1], 10);
    const classified = classifyFc(bpm);
    readings.push({
      kind: 'fc',
      label: `FC ${bpm} bpm`,
      value: `${bpm} bpm`,
      icon: iconForKind('fc'),
      logicName: logicNameForKind('fc'),
      ...classified,
    });
    seen.add('fc');
  }

  const frMatch =
    text.match(/(?:fr|frequ[eê]ncia\s+respirat[oó]ria)\s*[:\s"']*(\d+)\s*(?:mpm|irpm|mrpm)/i) ??
    text.match(/\b(\d+)\s*(?:mpm|irpm|mrpm)\b/i);
  if (frMatch && !seen.has('fr')) {
    const irpm = parseInt(frMatch[1], 10);
    const classified = classifyFr(irpm);
    readings.push({
      kind: 'fr',
      label: `FR ${irpm} mpm`,
      value: `${irpm} mpm`,
      icon: iconForKind('fr'),
      logicName: logicNameForKind('fr'),
      ...classified,
    });
    seen.add('fr');
  }

  const spo2Match = text.match(/(?:spo2|satura[cç][aã]o)\s*[:\s"']*(\d+)\s*%/i);
  if (spo2Match && !seen.has('spo2')) {
    const pct = parseInt(spo2Match[1], 10);
    const classified = classifySpo2(pct);
    readings.push({
      kind: 'spo2',
      label: `SpO₂ ${pct}%`,
      value: `${pct}%`,
      icon: iconForKind('spo2'),
      logicName: logicNameForKind('spo2'),
      ...classified,
    });
    seen.add('spo2');
  }

  return readings;
}

export function inferSinaisTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  const vitals = extractVitalsFromInstruction(instruction);

  if (vitals.length >= 2) return 'Interpretação de valores';
  if (/spo2|satura[cç][aã]o|oximetria|oxímetro|oximetro/.test(blob)) return 'Oximetria e SpO₂';
  if (/pulso radial|palpa[cç][aã]o|60 segundos|60 s\b|frequ[eê]ncia card[ií]aca|\bfc\b|\bbpm\b/.test(blob)) {
    return 'Frequência cardíaca e pulso';
  }
  if (/press[aã]o arterial|\bpa\b|mmhg|sist[oó]lica|diast[oó]lica|normotens|hipertens|hipotens/.test(blob)) {
    return 'Pressão arterial';
  }
  if (/temperatura|°c|axilar|retal|febril|afebril|hipotermia/.test(blob)) {
    return 'Temperatura corporal';
  }
  if (/frequ[eê]ncia respirat[oó]ria|\bfr\b|irpm|mpm|taquipne|eupne|respira[cç][aã]o/.test(blob)) {
    return 'Frequência respiratória';
  }
  if (/aferi[cç][aã]o|aferir|verifica[cç][aã]o|contar|palpar|t[eé]cnica/.test(blob)) {
    return 'Técnica de aferição';
  }
  return 'Verificação de sinais vitais';
}

type TopicProfile = {
  conceptFooter: string;
  goldenContent: string;
  goldenFooter: string;
  logicFooter: string;
  logicFix: string;
  dangerContent: string;
  dangerFooter: (correctId: string) => string;
  chipLabel: string;
};

const TOPIC_PROFILES: Record<string, TopicProfile> = {
  'Interpretação de valores': {
    conceptFooter: 'Leia cada sinal vital e traduza o valor em termo clínico antes de marcar a alternativa.',
    goldenContent: 'TRADUZA CADA VALOR ANTES DE COMBINAR A RESPOSTA — A BANCA TESTA CLASSIFICAÇÃO CLÍNICA.',
    goldenFooter: 'A leitura clínica é combinada: interprete todos os sinais do enunciado juntos.',
    logicFooter: 'Na interpretação de SV, traduza cada número para o termo clínico correspondente.',
    logicFix: 'traduzir valor numérico → termo clínico → combinar → marcar letra.',
    dangerContent: 'PEGADINHAS NA INTERPRETAÇÃO DOS VALORES',
    dangerFooter: (id) => `A combinação correta fecha letra ${id} — não marque olhando um sinal só.`,
    chipLabel: 'SV — MAPA',
  },
  'Frequência cardíaca e pulso': {
    conceptFooter: 'FC de rotina: pulso radial, conte com calma e compare com a faixa de 60 a 100 bpm.',
    goldenContent: 'FREQUÊNCIA CARDÍACA NORMAL EM ADULTO: 60 A 100 BPM.',
    goldenFooter: 'Quando a questão citar pulso radial e 60 segundos, a referência clássica é 60 a 100 bpm.',
    logicFooter: 'Na prova, o comando costuma premiar a faixa de 60 a 100 bpm e a contagem por 60 segundos.',
    logicFix: 'pulso radial + 60 s + faixa 60–100 bpm = referência de prova.',
    dangerContent: 'PEGADINHAS NA AFERIÇÃO DA FREQUÊNCIA CARDÍACA',
    dangerFooter: (id) => `Técnica e faixa normal fecham letra ${id}.`,
    chipLabel: 'FC — PULSO',
  },
  'Pressão arterial': {
    conceptFooter: 'PA: compare sistólica e diastólica com normotensão (< 120×80 mmHg no adulto).',
    goldenContent: 'PA NO ADULTO: COMPARE SISTÓLICA E DIASTÓLICA COM A FAIXA DE NORMALIDADE.',
    goldenFooter: 'Hipertensão e hipotensão são pegadinhas clássicas em interpretação de valores.',
    logicFooter: 'Identifique PA → classifique (normo/hiper/hipo) → marque alternativa.',
    logicFix: '110×75 mmHg costuma ser normotenso, não hipertenso.',
    dangerContent: 'PEGADINHAS NA PRESSÃO ARTERIAL',
    dangerFooter: (id) => `Classificação correta da PA fecha letra ${id}.`,
    chipLabel: 'PA',
  },
  'Temperatura corporal': {
    conceptFooter: 'Axilar: 36,0–37,4°C afebril; acima de 37,8°C febril na maioria das bancas.',
    goldenContent: 'TEMPERATURA: SITE DE AFERIÇÃO + FAIXA DE NORMALIDADE.',
    goldenFooter: 'Confundir afebril com febril é distrator frequente quando o valor está na norma.',
    logicFooter: 'Site (axilar/retal) + valor numérico → termo clínico.',
    logicFix: '36,5°C axilar = afebril na prova.',
    dangerContent: 'PEGADINHAS NA TEMPERATURA',
    dangerFooter: (id) => `Leitura térmica correta fecha letra ${id}.`,
    chipLabel: 'TEMP',
  },
  'Frequência respiratória': {
    conceptFooter: 'Adulto em repouso: 12–20 irpm eupneico; acima de 20 irpm taquipneia.',
    goldenContent: 'FR NORMAL NO ADULTO: 12 A 20 IRPM.',
    goldenFooter: 'Taquipneia vs eupneia aparece em combinação com FC e PA.',
    logicFooter: 'Conte a FR e traduza antes de combinar com os demais sinais.',
    logicFix: 'FR 30 mpm = taquipneico, não eupneico.',
    dangerContent: 'PEGADINHAS NA FREQUÊNCIA RESPIRATÓRIA',
    dangerFooter: (id) => `FR corretamente classificada fecha letra ${id}.`,
    chipLabel: 'FR',
  },
  'Oximetria e SpO₂': {
    conceptFooter: 'SpO₂ ≥ 95% costuma ser referência de adequação em prova de técnico.',
    goldenContent: 'SATURAÇÃO: ≥ 95% ADEQUADA — AVALIE CONTEXTO CLÍNICO.',
    goldenFooter: 'Hipoxemia (< 95%) exige correlacionar com FR e quadro clínico.',
    logicFooter: 'SpO₂ + FR + esforço respiratório → classificação integrada.',
    logicFix: 'oximetria de pulso complementa FR, não substitui avaliação completa.',
    dangerContent: 'PEGADINHAS NA OXIMETRIA',
    dangerFooter: (id) => `SpO₂ interpretada corretamente fecha letra ${id}.`,
    chipLabel: 'SpO₂',
  },
  'Técnica de aferição': {
    conceptFooter: 'Técnica correta: site, tempo de contagem, posição do paciente e registro.',
    goldenContent: 'AFERIÇÃO SEGURA: TÉCNICA + TEMPO + REGISTRO + INTERPRETAÇÃO.',
    goldenFooter: 'A banca troca tempo de contagem, dedos usados na palpação e site de aferição.',
    logicFooter: 'Enunciado → técnica correta → faixa de normalidade → gabarito.',
    logicFix: 'polegar não palpa pulso; 60 s quando a precisão importa.',
    dangerContent: 'PEGADINHAS NA TÉCNICA DE AFERIÇÃO',
    dangerFooter: (id) => `Técnica correta fecha letra ${id}.`,
    chipLabel: 'TÉCNICA',
  },
  'Verificação de sinais vitais': {
    conceptFooter: 'Julgue cada parâmetro antes de combinar a resposta final.',
    goldenContent: 'SINAIS VITAIS: LEIA, CLASSIFIQUE E COMBINE ANTES DE MARCAR.',
    goldenFooter: 'Em prova, a combinação de PA, T, FC e FR define a alternativa.',
    logicFooter: 'Traduza cada sinal → elimine distratoras → marque gabarito.',
    logicFix: 'não marque pela PA isolada se o enunciado trouxe quatro sinais.',
    dangerContent: 'PEGADINHAS EM SINAIS VITAIS',
    dangerFooter: (id) => `Leitura integrada dos SV fecha letra ${id}.`,
    chipLabel: 'SV',
  },
};

function topicProfile(topic: string): TopicProfile {
  return TOPIC_PROFILES[topic] ?? TOPIC_PROFILES['Verificação de sinais vitais'];
}

function inferSvOptionTrap(wrongText: string, vitals: VitalReading[]): string {
  const lower = wrongText.toLowerCase();
  if (/hipertens/.test(lower) && vitals.some((v) => v.kind === 'pa' && v.clinicalTerm === 'Normotenso')) {
    return 'PA do caso está na faixa normal; a alternativa inventa hipertensão.';
  }
  if (/hipotens/.test(lower) && vitals.some((v) => v.kind === 'pa' && v.clinicalTerm === 'Normotenso')) {
    return 'PA normal no enunciado — não confunda com hipotensão.';
  }
  if (/febril/.test(lower) && !/afebril/.test(lower) && vitals.some((v) => v.kind === 'temp' && v.clinicalTerm === 'Afebril')) {
    return 'Temperatura do caso é afebril; a alternativa chama de febre.';
  }
  if (/normoc[aá]rdic/.test(lower) && vitals.some((v) => v.kind === 'fc' && v.clinicalTerm === 'Taquicárdico')) {
    return 'FC elevada no enunciado — não classifique como normocárdico.';
  }
  if (/eupneic/.test(lower) && vitals.some((v) => v.kind === 'fr' && v.clinicalTerm === 'Taquipneico')) {
    return 'FR elevada no enunciado — taquipneia, não eupneia.';
  }
  if (/taquipneic/.test(lower) && vitals.some((v) => v.kind === 'fr' && v.clinicalTerm === 'Eupneico')) {
    return 'FR normal no enunciado — não classifique como taquipneia.';
  }
  if (/bradic[aá]rdic/.test(lower) && vitals.some((v) => v.kind === 'fc' && v.clinicalTerm === 'Taquicárdico')) {
    return 'FC taquicárdica no caso — distrator inverte a classificação.';
  }
  return truncate(wrongText, 500);
}

function inferSvOptionCorrection(
  wrongText: string,
  correctText: string,
  correctId: string,
  vitals: VitalReading[],
): string {
  const trap = inferSvOptionTrap(wrongText, vitals);
  if (trap !== truncate(wrongText, 500)) return trap;
  return truncate(`Gabarito ${correctId} — ${correctText}`, 500);
}

function buildVitalsGoldenRows(vitals: VitalReading[], correct: QuestionOption): GoldenRuleRow[] {
  const rows: GoldenRuleRow[] = vitals.map((v) => ({
    label: v.label,
    value: v.clinicalTerm,
    emphasis: v.emphasis === 'alert' ? 'alert' : v.emphasis === 'success' ? 'success' : 'default',
    badge: v.emphasis === 'alert' ? 'warn' : v.emphasis === 'success' ? 'ok' : 'info',
  }));
  rows.push({
    label: 'Conclusão',
    value: `Alternativa ${correct.id}`,
    emphasis: 'highlight',
    badge: 'hot',
  });
  return rows.slice(0, 12);
}

function buildVitalsLogicSteps(vitals: VitalReading[], correct: QuestionOption): string[] {
  const steps = vitals.map(
    (v) => `Interpretar ${v.logicName}: ${v.value} = ${v.clinicalTerm.toLowerCase()}.`,
  );
  steps.push(`Combinar os achados e marcar a alternativa ${correct.id}.`);
  return steps.slice(0, 15);
}

function buildChoiceDangerItems(
  options: QuestionOption[],
  correct: QuestionOption,
  vitals: VitalReading[],
): DangerZoneItem[] {
  const wrong = options.filter((o) => !o.is_correct);
  const items: DangerZoneItem[] = wrong.map((opt) => ({
    label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
    detail: inferSvOptionTrap(opt.text, vitals),
    correct: inferSvOptionCorrection(opt.text, correct.text, correct.id, vitals),
  }));

  if (vitals.length >= 2) {
    items.push({
      label: 'Classificar olhando um sinal só',
      detail: 'Marcar pela PA ou pela febre isolada ignora que o enunciado pede a leitura combinada.',
      correct: `Interprete os ${vitals.length} sinais juntos antes de marcar a alternativa.`,
    });
  }

  const frVital = vitals.find((v) => v.kind === 'fr' && v.clinicalTerm === 'Taquipneico');
  if (frVital && !items.some((i) => i.label.toLowerCase().includes('eupne'))) {
    items.push({
      label: 'Chamar FR elevada de eupneia',
      detail: 'Respiração acima de 20 irpm no adulto em repouso não é eupneia.',
      correct: `${frVital.label} = taquipneia (acima de 20 irpm).`,
    });
  }

  return items.slice(0, 10);
}

function buildGenericChoiceConceptItems(
  input: BuildSinaisSlidesInput,
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string; correct?: string }[] {
  const preview = truncate(input.instruction.replace(/\s+/g, ' '), 500);
  return [
    { label: 'Contexto', detail: preview, icon: 'Activity' },
    {
      label: truncate(topic, 40),
      detail: truncate(correct.text, 500),
      icon: 'HeartPulse',
      correct: truncate(correct.text, 200),
    },
    ...input.options
      .filter((o) => !o.is_correct)
      .slice(0, 2)
      .map((opt) => ({
        label: truncate(`Distrator ${opt.id}`, 40),
        detail: truncate(opt.text, 500),
        icon: 'XCircle' as const,
      })),
    {
      label: 'Gabarito',
      detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
      icon: 'Target',
    },
  ].slice(0, 20);
}

/** Múltipla escolha — padrão golden FEPESE interpretação de SV. */
export function buildSinaisChoiceSlides(input: BuildSinaisSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Sinais choice: gabarito ausente');

  const topic = inferSinaisTopic(input.instruction, input.options);
  const prof = topicProfile(topic);
  const meta = slideMeta(input.topico, input.subtopico);
  const vitals = extractVitalsFromInstruction(input.instruction);

  const conceptItems =
    vitals.length > 0
      ? vitals.map((v) => ({
          label: conceptLabelForVital(v),
          detail: v.detail,
          icon: v.icon,
          correct: v.clinicalTerm,
        }))
      : buildGenericChoiceConceptItems(input, correct, topic);

  const rows =
    vitals.length > 0
      ? buildVitalsGoldenRows(vitals, correct)
      : input.options.map((opt) => ({
          label: `Letra ${opt.id}`,
          value: opt.is_correct
            ? truncate(`Verdadeira: ${opt.text}`, 500)
            : truncate(`Falsa: ${inferSvOptionTrap(opt.text, vitals)}`, 500),
          ...(opt.is_correct
            ? { badge: 'ok' as const, emphasis: 'highlight' as const }
            : { emphasis: 'alert' as const, badge: 'warn' as const }),
        }));

  const steps =
    vitals.length > 0
      ? buildVitalsLogicSteps(vitals, correct)
      : [
          `Ler o comando: ${truncate(input.instruction.replace(/\s+/g, ' '), 120)}.`,
          `Fixar o tema: ${topic.toLowerCase()}.`,
          `Identificar gabarito: letra ${correct.id} — ${truncate(correct.text, 100)}.`,
          ...input.options
            .filter((o) => !o.is_correct)
            .map(
              (opt) =>
                `Testar letra ${opt.id}: ${truncate(opt.text, 90)} → eliminar (${truncate(inferSvOptionTrap(opt.text, vitals), 80)}).`,
            ),
          `Marcar letra ${correct.id}.`,
          `Fixação: ${prof.logicFix}`,
        ].slice(0, 15);

  const dangerItems = buildChoiceDangerItems(input.options, correct, vitals);

  return [
    {
      type: 'concept_map',
      slide_title:
        vitals.length > 0 ? 'Leitura dos sinais vitais do caso' : truncate(`${topic} — mapa da prova`, 120),
      chip_label: prof.chipLabel,
      meta,
      items: conceptItems,
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: 'Sinais vitais — tabela de prova',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows,
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      slide_title:
        vitals.length > 0 ? 'Como resolver — interpretação de SV' : truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
      reveal_mode: 'tap',
      meta,
      steps,
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: 'Armadilhas que a banca monta',
      chip_label: 'ARMADILHAS DE PROVA',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: dangerItems,
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

function inferVfConceptLabel(text: string, isTrue: boolean): { label: string; icon: string } {
  const lower = text.toLowerCase();
  if (/press[aã]o|mmhg|\bpa\b/.test(lower)) return { label: 'Pressão arterial', icon: 'Scale' };
  if (/temperatura|°c|febril|afebril/.test(lower)) return { label: 'Temperatura', icon: 'Thermometer' };
  if (/fc|frequ[eê]ncia card|bpm|pulso/.test(lower)) return { label: 'Frequência cardíaca', icon: 'HeartPulse' };
  if (/fr|frequ[eê]ncia resp|irpm|mpm|respira/.test(lower)) return { label: 'Frequência respiratória', icon: 'Wind' };
  if (/spo2|satura/.test(lower)) return { label: 'Oximetria', icon: 'Activity' };
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isTrue ? 'CheckCircle' : 'XCircle',
  };
}

function buildVfConceptMap(input: BuildSinaisSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferSinaisTopic(input.instruction, input.options);
  const prof = topicProfile(topic);

  const items = assertives.slice(0, 4).map((a) => {
    const { label, icon } = inferVfConceptLabel(a.text, a.isTrue);
    return {
      label,
      detail: truncate(a.isTrue ? `Verdadeira: ${a.text}` : `Falsa: ${a.text}`, 500),
      icon,
    };
  });

  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`, 500),
    icon: 'Target',
  });

  return {
    type: 'concept_map',
    slide_title: truncate(`${topic} — mapa V/F`, 120),
    chip_label: prof.chipLabel,
    meta: slideMeta(input.topico, input.subtopico),
    items: items.slice(0, 20),
    footer_rule: truncate(prof.conceptFooter, 500),
  };
}

function buildVfGoldenRule(input: BuildSinaisSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const topic = inferSinaisTopic(input.instruction, input.options);
  const prof = topicProfile(topic);
  const correct = input.options.find((o) => o.is_correct);

  const rows: GoldenRuleRow[] = assertives.map((a) => ({
    label: `${a.roman} — ${truncate(a.text.split(/[,.;]/)[0] ?? a.text, 60)}`,
    value: a.isTrue ? truncate(`Verdadeira: ${a.text}`, 500) : truncate(`Falsa: ${a.text}`, 500),
    ...(a.isTrue ? { badge: 'ok' as const } : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));

  rows.push({
    label: 'Resposta final',
    value: truncate(correct?.text ?? '', 500),
    emphasis: 'highlight',
    badge: 'hot',
  });

  return {
    type: 'golden_rule',
    slide_title: 'Sinais vitais — tabela de prova',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(prof.goldenContent, 1000),
    rows: rows.slice(0, 12),
    footer_rule: truncate(prof.goldenFooter, 500),
  };
}

function buildVfLogicFlow(input: BuildSinaisSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferSinaisTopic(input.instruction, input.options);
  const prof = topicProfile(topic);

  const steps = [
    `Ler a questão como combinação V/F sobre ${topic.toLowerCase()}.`,
    ...assertives.map((a) =>
      `Julgar ${a.roman}: ${truncate(a.text, 80)}? → ${a.isTrue ? 'verdadeiro' : 'falso'}.`,
    ),
    'Montar o conjunto correto conforme alternativas.',
    `Marcar ${correct?.id ?? '?'}.`,
    `Fixação: ${prof.logicFix}.`,
  ];

  return {
    type: 'logic_flow',
    slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
    reveal_mode: 'tap',
    meta: slideMeta(input.topico, input.subtopico),
    steps: steps.slice(0, 15),
    footer_rule: truncate(prof.logicFooter, 500),
  };
}

function buildVfDangerZone(input: BuildSinaisSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferSinaisTopic(input.instruction, input.options);
  const prof = topicProfile(topic);

  const items: DangerZoneItem[] = assertives
    .filter((a) => !a.isTrue)
    .map((a) => ({
      label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
      detail: truncate(a.text, 500),
      correct: truncate(`Afirmativa ${a.roman} é falsa — gabarito ${correct?.id ?? '?'}.`, 500),
    }));

  if (items.length < 3) {
    items.push({
      label: 'Marcar sem julgar todas as afirmativas',
      detail: 'Combinar letras sem V/F item a item leva a gabarito errado em sinais vitais.',
      correct: 'Julgue I, II, III… antes de olhar as combinações A–E.',
    });
  }

  return {
    type: 'danger_zone',
    slide_title: 'Armadilhas que a banca monta',
    chip_label: 'ARMADILHAS DE PROVA',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(prof.dangerContent, 1000),
    bullet_style: 'x_icon',
    items: items.slice(0, 10),
    footer_rule: truncate(prof.dangerFooter(correct?.id ?? '?'), 500),
  };
}

export function buildSinaisVfSlides(input: BuildSinaisSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const assertives = resolveCurativosAssertives(input.instruction, correct);
  if (assertives.length < 2) {
    throw new Error('Sinais VF: enunciado sem afirmativas I/II/III suficientes');
  }

  return [
    buildVfConceptMap(input, assertives),
    buildVfGoldenRule(input, assertives),
    buildVfLogicFlow(input, assertives),
    buildVfDangerZone(input, assertives),
  ];
}

function isFcCertoErradoTopic(instruction: string): boolean {
  const blob = instruction.toLowerCase();
  return /frequ[eê]ncia card[ií]aca|pulso radial|\bbpm\b|60-100|60 a 100/.test(blob);
}

function buildFcCertoErradoSlides(input: BuildSinaisSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Sinais CE: gabarito ausente');

  const meta = slideMeta(input.topico, input.subtopico);
  const statement = truncate(input.instruction.replace(/\s+/g, ' '), 500);
  const isStatementTrue = /certo/i.test(correct.text ?? '');

  return [
    {
      type: 'concept_map',
      meta,
      items: [
        {
          label: 'Pulso radial',
          detail: 'Local mais usado na prática e em prova para aferir a frequência cardíaca.',
          icon: 'HeartPulse',
        },
        {
          label: '60 segundos',
          detail: 'Tempo completo para contagem quando se quer maior precisão.',
          icon: 'TimerReset',
        },
        {
          label: 'Faixa normal',
          detail: 'Adulto em repouso: 60 a 100 batimentos por minuto.',
          icon: 'Scale',
        },
        {
          label: 'Afirmativa da prova',
          detail: 'Pulso radial, 60 s de contagem e faixa 60–100 bpm — padrão que a banca costuma marcar como certo.',
          icon: 'CheckCircle',
        },
      ],
      footer_rule: 'FC de rotina: pulso radial, conte com calma e compare com a faixa de 60 a 100 bpm.',
    },
    {
      type: 'golden_rule',
      meta,
      content: 'AFIRMATIVA IDECAN: PULSO RADIAL, 60 S E FAIXA 60–100 BPM.',
      rows: [
        {
          label: 'Técnica citada na prova',
          value: 'Pulso radial, 60 segundos (indicador e médio)',
          sv_kind: 'meta',
        },
        {
          label: 'FC adulto — referência',
          value: '60 a 100 batimentos por minuto',
          sv_kind: 'fc',
          emphasis: 'success',
          badge: 'ok',
        },
        {
          label: 'Gabarito',
          value: `Certo — letra ${correct.id}`,
          sv_kind: 'meta',
          emphasis: 'highlight',
          badge: 'hot',
        },
      ],
      footer_rule: truncate(
        isStatementTrue
          ? 'A frase repete técnica + faixa normal: marque certo (letra ' + correct.id + ').'
          : `Gabarito ${correct.id} — confronte cada trecho da afirmativa com técnica e faixa.`,
        500,
      ),
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta,
      steps: [
        'Identificar o parâmetro avaliado: frequência cardíaca.',
        'Localizar o pulso radial com os dedos indicador e médio.',
        'Contar as pulsações por 60 segundos completos.',
        'Comparar o resultado com a faixa de normalidade do adulto.',
        `Marcar ${isStatementTrue ? 'certo' : 'errado'} — letra ${correct.id}.`,
      ],
      footer_rule: 'Na prova, o comando costuma premiar a faixa de 60 a 100 bpm e a contagem por 60 segundos.',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta,
      content: 'PEGADINHAS NA AFERIÇÃO DA FREQUÊNCIA CARDÍACA',
      items: [
        {
          label: 'Contar só 15 segundos',
          detail: 'A banca tenta reduzir o tempo para confundir a precisão da aferição.',
          correct: 'Quando a aferição precisa ser fiel, conte 60 segundos completos.',
        },
        {
          label: 'Dizer que normal é acima de 100 bpm',
          detail: 'Isso troca a normalidade por taquicardia.',
          correct: 'A faixa normal do adulto é 60 a 100 bpm.',
        },
        {
          label: 'Palpar com o polegar',
          detail: 'O polegar tem pulsação própria e pode contaminar a leitura.',
          correct: 'Use indicador e médio para palpar o pulso.',
        },
      ],
      footer_rule: truncate(
        isStatementTrue
          ? 'Se a frase trouxer 60 a 100 bpm e pulso radial, a leitura tende a estar correta.'
          : `Gabarito ${correct.id} — confronte a afirmativa com técnica e faixa normal.`,
        500,
      ),
    },
  ];
}

function buildGenericCertoErradoSlides(input: BuildSinaisSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Sinais CE: gabarito ausente');

  const topic = inferSinaisTopic(input.instruction, input.options);
  const prof = topicProfile(topic);
  const meta = slideMeta(input.topico, input.subtopico);
  const statement = truncate(input.instruction.replace(/\s+/g, ' '), 500);
  const isStatementTrue = /certo/i.test(correct.text ?? '');

  return [
    {
      type: 'concept_map',
      slide_title: truncate(`${topic} — certo ou errado`, 120),
      chip_label: prof.chipLabel,
      meta,
      items: [
        { label: 'Afirmativa', detail: statement, icon: 'FileText' },
        {
          label: isStatementTrue ? 'Verdadeira' : 'Falsa',
          detail: isStatementTrue
            ? 'A afirmativa está correta segundo referência de sinais vitais.'
            : 'A afirmativa contém erro técnico ou classificação inadequada.',
          icon: isStatementTrue ? 'CheckCircle' : 'XCircle',
        },
        {
          label: 'Gabarito',
          detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
          icon: 'Target',
        },
      ],
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: [
        { label: 'Afirmativa', value: statement, badge: 'info' },
        {
          label: 'Julgamento',
          value: isStatementTrue ? 'Certo — referência de SV adequada' : 'Errado — referência de SV inadequada',
          emphasis: isStatementTrue ? 'success' : 'alert',
          badge: isStatementTrue ? 'ok' : 'warn',
        },
        { label: 'Gabarito', value: `Letra ${correct.id}`, emphasis: 'highlight', badge: 'hot' },
      ],
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta,
      steps: [
        `Ler a afirmativa: ${truncate(statement, 120)}.`,
        `Confrontar com referência de ${topic.toLowerCase()}.`,
        `Decidir: ${isStatementTrue ? 'certo' : 'errado'}.`,
        `Marcar letra ${correct.id}.`,
        `Fixação: ${prof.logicFix}.`,
      ],
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta,
      content: truncate(prof.dangerContent, 1000),
      items: [
        {
          label: 'Confundir faixa normal com valor alterado',
          detail: 'A banca inverte limites de PA, FC, FR ou temperatura.',
          correct: truncate(`Gabarito ${correct.id} — ${correct.text}`, 500),
        },
        {
          label: 'Marcar pelo “parece correto”',
          detail: 'Sem comparar com faixa de referência, a pegadinha parece plausível.',
          correct: truncate(`Confronte valor + faixa normal antes de marcar ${correct.id}.`, 500),
        },
      ],
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

function buildCertoErradoSlides(input: BuildSinaisSlidesInput): SlideRecord[] {
  if (isFcCertoErradoTopic(input.instruction)) {
    return buildFcCertoErradoSlides(input);
  }
  return buildGenericCertoErradoSlides(input);
}

export function canBuildSinaisVfSlides(instruction: string): boolean {
  return extractCurativosAssertives(normalizeSinaisInstruction(instruction)).length >= 2;
}

export function canBuildSinaisPremiumSlides(instruction: string, family: string): boolean {
  if (canBuildSinaisVfSlides(instruction)) return true;
  if (family === 'certo_errado') return true;
  return ['conceito', 'protocolo', 'text_fragment', 'calc'].includes(family);
}

export function buildSinaisPremiumSlidesForFamily(
  input: BuildSinaisSlidesInput,
  family: string,
): SlideRecord[] {
  if (canBuildSinaisVfSlides(input.instruction)) {
    return buildSinaisVfSlides(input);
  }
  if (family === 'certo_errado') {
    return buildCertoErradoSlides(input);
  }
  return buildSinaisChoiceSlides(input);
}

export function buildSinaisPremiumSlides(input: BuildSinaisSlidesInput): SlideRecord[] {
  return buildSinaisChoiceSlides(input);
}

export function sinaisGoldenReferenceForFamily(family: string): string {
  return family === 'certo_errado' ? SINAIS_GOLDEN_CE_FILE : SINAIS_GOLDEN_FILE;
}
