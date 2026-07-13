import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  parseTrueNumeralsFromGabarito,
} from '@/legacy/catalog-migration/upgradePremiumCurativos';

export const IMUNIZACAO_GOLDEN_FILE = 'questao-premium-cpcon-imunizacao-intervalos-vf.json';
export const IMUNIZACAO_CALENDARIO_GOLDEN_FILE =
  'questao-premium-fundatec-meningococica-3meses.json';

type SlideRecord = Record<string, unknown>;

type DangerZoneItem = { label: string; detail: string; correct: string };

export type ImunizacaoAssertive = {
  roman: string;
  text: string;
  isTrue: boolean;
};

export type BuildImunizacaoSlidesInput = {
  instruction: string;
  options: QuestionOption[];
  topico: string;
  subtopico: string;
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function slideMeta(topico: string, subtopico: string): { topico: string; subtopico: string } {
  return { topico, subtopico };
}

export function isImunizacaoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'imunização' || n === 'imunizacao' || n === 'vacinação' || n === 'vacinacao';
}

export function normalizeImunizacaoInstruction(instruction: string): string {
  return instruction
    .replace(/\r\n/g, '\n')
    .replace(/([IVX]+)\s*\n+\s*[-–]\s*/gi, '$1- ')
    .replace(/É\s*\n+\s*CORRETO/gi, 'É CORRETO')
    .replace(/CORRETO\s*\n+\s*o que se afirma/gi, 'CORRETO o que se afirma');
}

export function extractImunizacaoAssertives(instruction: string): ImunizacaoAssertive[] {
  const normalized = normalizeImunizacaoInstruction(instruction);
  const re = /([IVX]+)\s*[-–]\s*([^\n]+)/gi;
  const raw: { roman: string; text: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(normalized)) !== null) {
    raw.push({ roman: match[1].toUpperCase(), text: match[2].trim() });
  }
  return raw.slice(0, 4).map((item) => ({ ...item, isTrue: false }));
}

export function resolveImunizacaoAssertives(
  instruction: string,
  correctOption?: QuestionOption,
): ImunizacaoAssertive[] {
  const assertives = extractImunizacaoAssertives(instruction);
  if (assertives.length === 0) return assertives;
  const trueSet = parseTrueNumeralsFromGabarito(correctOption?.text ?? '', assertives);
  return assertives.map((a) => ({ ...a, isTrue: trueSet.has(a.roman) }));
}

function formatGabaritoCombo(assertives: ImunizacaoAssertive[]): string {
  const trueOnes = assertives.filter((a) => a.isTrue).map((a) => a.roman);
  if (trueOnes.length === 0) return '—';
  if (trueOnes.length === 1) return trueOnes[0];
  if (trueOnes.length === 2) return `${trueOnes[0]} e ${trueOnes[1]}`;
  return `${trueOnes.slice(0, -1).join(', ')} e ${trueOnes[trueOnes.length - 1]}`;
}

type PniTopic =
  | 'Intervalos PNI'
  | 'Calendário PNI'
  | 'Rede de frio'
  | 'Cuidados e contraindicações'
  | 'Imunização';

function inferTopicFromInstruction(instruction: string): PniTopic {
  const lower = instruction.toLowerCase();
  if (/2\s*°c|8\s*°c|cadeia de frio|termômetro|isopor|termoláb|rede de frio|desvio de qualidade/.test(lower)) {
    return 'Rede de frio';
  }
  if (/intervalo|grace|simultâneo|simultaneo|vpc13|vpp23|oral ×|injetável|injetavel|4\s*dia/.test(lower)) {
    return 'Intervalos PNI';
  }
  if (
    /\d+\s*(?:º|o)?\s*m[eê]s|ao nascer|calendário|calendario|vacina a ser|marco|3o mês|3º mês/.test(
      lower,
    )
  ) {
    return 'Calendário PNI';
  }
  if (/gestante|imunodeprim|contraindicat|vivo atenuado|corticoide/.test(lower)) {
    return 'Cuidados e contraindicações';
  }
  return 'Imunização';
}

function inferAssertiveShortLabel(roman: string, text: string): string {
  const lower = text.toLowerCase();
  if (/4\s*dia|grace|idade mínima|idade minima|antecip/.test(lower)) {
    return `Afirmativa ${roman} — grace period (4 dias)`;
  }
  if (/febre amarela|tríplice viral|tetraviral|scr|scrv/.test(lower)) {
    return `Afirmativa ${roman} — SCR/SCRV × febre amarela`;
  }
  if (/vpc13|vpp23|pneumo|13-valente|23-valente/.test(lower)) {
    return `Afirmativa ${roman} — VPC13 e VPP23`;
  }
  if (/oral|injetável|injetavel|atenuada oral/.test(lower)) {
    return `Afirmativa ${roman} — oral × injetável`;
  }
  if (/bcg|nascer|neonatal/.test(lower)) return `Afirmativa ${roman} — BCG / ao nascer`;
  if (/meningo|men c|meningocócica/.test(lower)) return `Afirmativa ${roman} — meningocócica`;
  if (/rotavírus|rotavirus/.test(lower)) return `Afirmativa ${roman} — rotavírus`;
  if (/pentavalente|difteria|dtp|vip/.test(lower)) return `Afirmativa ${roman} — pentavalente / DTP`;
  if (/2\s*°c|8\s*°c|termoláb|frio/.test(lower)) return `Afirmativa ${roman} — cadeia de frio`;
  return `Afirmativa ${roman} — ${truncate(text.split(/[,.;]/)[0] ?? text, 48)}`;
}

function inferAssertiveIcon(text: string): string {
  const lower = text.toLowerCase();
  if (/4\s*dia|grace|intervalo|semana|simultâneo|simultaneo/.test(lower)) return 'Clock';
  if (/febre amarela|menor de 2|tríplice|tetraviral/.test(lower)) return 'Baby';
  if (/vpc13|vpp23|pneumo/.test(lower)) return 'Shield';
  if (/oral|injetável|injetavel|rotavírus|rotavirus/.test(lower)) return 'Pill';
  if (/2\s*°c|8\s*°c|termoláb|frio/.test(lower)) return 'Thermometer';
  if (/bcg|nascer/.test(lower)) return 'Baby';
  if (/meningo/.test(lower)) return 'Syringe';
  return 'Syringe';
}

function inferAssertiveDetail(text: string, isTrue: boolean): string {
  const lower = text.toLowerCase();
  const verdict = isTrue ? 'VERDADEIRA' : 'FALSA';

  if (/4\s*dia|grace|idade mínima|idade minima/.test(lower)) {
    return isTrue
      ? `${verdict}. Antecipação dentro do grace period pode ser válida conforme o manual — leia o enunciado.`
      : `${verdict}. Dose aplicada até 4 dias ANTES da idade mínima ou intervalo mínimo é considerada VÁLIDA no PNI — não registrar erro nem repetir por antecipação.`;
  }
  if (/febre amarela|tríplice viral|tetraviral|scr|scrv/.test(lower) && /menor|2 anos|dois anos/.test(lower)) {
    return `${verdict}. Menor de 2 anos, em rotina: tríplice/tetraviral NÃO simultâneo com FA — intervalo mínimo de 30 dias.`;
  }
  if (/vpc13|vpp23|pneumo|13-valente|23-valente/.test(lower)) {
    return `${verdict}. Não simultâneas; mínimo 8 semanas; VPC13 primeiro. Se VPP23 veio antes, aguardar 1 ano para VPC13.`;
  }
  if (/oral|injetável|injetavel|atenuada oral/.test(lower)) {
    return `${verdict}. Vacinas orais atenuadas podem ser no mesmo dia ou em qualquer intervalo com vacinas injetáveis.`;
  }
  if (/2\s*°c|8\s*°c|termoláb|cadeia de frio/.test(lower)) {
    return isTrue
      ? `${verdict}. Imunobiológicos termolábeis exigem conservação entre +2 °C e +8 °C na rede de frio.`
      : `${verdict}. Verifique temperatura, validade e integridade — desvio de qualidade exige bloqueio e notificação.`;
  }
  if (/bcg/.test(lower) && !isTrue) {
    return `${verdict}. BCG é ao nascer — não confundir com marcos do lactente (2, 3, 4 meses).`;
  }
  if (/rotavírus|rotavirus/.test(lower)) {
    return isTrue
      ? `${verdict}. ${truncate(text, 200)}`
      : `${verdict}. Rotavírus humano: esquema 2 e 4 meses no PNI — não aos 3 meses.`;
  }
  return `${verdict}. ${truncate(text, 480)}`;
}

function inferGoldenRowLabel(roman: string, text: string): string {
  const lower = text.toLowerCase();
  if (/4\s*dia|grace|idade mínima|idade minima/.test(lower)) return `${roman} — antecipação 4 dias`;
  if (/febre amarela|tríplice|tetraviral/.test(lower)) return `${roman} — SCR/SCRV × FA <2 anos`;
  if (/vpc13|vpp23|pneumo/.test(lower)) return `${roman} — VPC13 × VPP23`;
  if (/oral|injetável|injetavel/.test(lower)) return `${roman} — oral × injetável`;
  if (/2\s*°c|8\s*°c|termoláb/.test(lower)) return `${roman} — cadeia de frio`;
  return `${roman} — ${truncate(text.split(/[,.;]/)[0] ?? text, 56)}`;
}

function extractAgeMonths(instruction: string): number | null {
  const match = instruction.match(/(\d+)\s*(?:º|o|°)?\s*m[eê]s/i);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

function inferVaccineTheme(text: string, isCorrect: boolean): { label: string; icon: string; detail: string } {
  const lower = text.toLowerCase();
  if (/meningo|men c/.test(lower)) {
    return {
      label: 'Meningocócica C (conjugada)',
      icon: 'Syringe',
      detail: isCorrect
        ? 'Esquema PNI: 3, 5 e 12 meses — dose aos 3 meses é clássica de prova.'
        : 'Men C tem marco aos 3 meses; confira se o enunciado pede essa idade.',
    };
  }
  if (/bcg/.test(lower)) {
    return {
      label: 'BCG',
      icon: 'Baby',
      detail: isCorrect ? 'Vacina ao nascer com Hepatite B.' : 'BCG não é dose dos 3 meses — pegadinha clássica.',
    };
  }
  if (/rotavírus|rotavirus/.test(lower)) {
    return {
      label: 'Rotavírus humano',
      icon: 'Pill',
      detail: isCorrect ? 'Esquema 2 e 4 meses.' : 'Rotavírus: 2 e 4 meses — não 3.',
    };
  }
  if (/pneumo|10-valente|13-valente|vpc/.test(lower)) {
    return {
      label: 'Pneumocócica conjugada',
      icon: 'Shield',
      detail: isCorrect ? 'Marcos típicos: 2, 4 e 12 meses (10v) ou conforme esquema vigente.' : 'Pneumo não usa marco exclusivo aos 3 meses.',
    };
  }
  if (/difteria|pentavalente|dtp|adsorvida/.test(lower)) {
    return {
      label: 'Pentavalente / DTP',
      icon: 'Layers',
      detail: isCorrect ? 'Marcos 2, 4 e 6 meses.' : 'Componente da pentavalente — marcos 2-4-6, não dose isolada aos 3 meses.',
    };
  }
  if (/hepatite|hb/.test(lower)) {
    return { label: 'Hepatite B', icon: 'Syringe', detail: truncate(text, 500) };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

function inferCalendarTrapDetail(wrongText: string, ageMonths: number | null): string {
  const lower = wrongText.toLowerCase();
  if (/bcg/.test(lower)) return `BCG é ao nascer — não aos ${ageMonths ?? '?'} meses.`;
  if (/rotavírus|rotavirus/.test(lower)) return 'Rotavírus: esquema 2 e 4 meses — calendário pula o 3º mês.';
  if (/pneumo/.test(lower)) return 'Pneumocócica: marcos 2, 4 e 12 meses — 3 meses não entra no esquema.';
  if (/difteria|pentavalente|adsorvida/.test(lower)) return 'Pentavalente/DTP: marcos 2, 4 e 6 meses.';
  return truncate(wrongText, 500);
}

function inferCalendarCorrection(wrongText: string, correctText: string, ageMonths: number | null): string {
  const lower = wrongText.toLowerCase();
  const ageLabel = ageMonths != null ? `${ageMonths} meses` : 'idade do enunciado';
  if (/bcg/.test(lower)) {
    return `BCG = ao nascer. Aos ${ageLabel} a vacina correta é ${truncate(correctText, 120)}.`;
  }
  if (/rotavírus|rotavirus/.test(lower)) return `Rotavírus = 2 e 4 meses. Gabarito: ${truncate(correctText, 120)}.`;
  if (/pneumo/.test(lower)) return `Pneumo 10 = 2 · 4 · 12 meses. Gabarito: ${truncate(correctText, 120)}.`;
  if (/difteria|pentavalente|adsorvida/.test(lower)) {
    return `Pentavalente: 2, 4 e 6 meses — não dose isolada aos ${ageLabel}. Gabarito: ${truncate(correctText, 120)}.`;
  }
  return truncate(`Gabarito: ${correctText}`, 500);
}

function inferLetterTrapDetail(
  opt: QuestionOption,
  assertives: ImunizacaoAssertive[],
): string {
  const text = opt.text.toLowerCase();
  const includesFalse = assertives.filter((a) => !a.isTrue).some((a) => text.includes(a.roman.toLowerCase()) || new RegExp(`\\b${a.roman}\\b`).test(opt.text.toUpperCase()));
  if (includesFalse) {
    const falseOne = assertives.find((a) => !a.isTrue && new RegExp(`\\b${a.roman}\\b`).test(opt.text.toUpperCase()));
    if (falseOne && /4\s*dia|grace/.test(falseOne.text.toLowerCase())) {
      return 'Aceita a afirmativa I (grace period invertido) como verdadeira.';
    }
    return `Combinação inclui afirmativa(s) falsa(s) ou exclui verdadeira(s) do manual.`;
  }
  return truncate(opt.text, 500);
}

function inferLetterCorrection(
  opt: QuestionOption,
  assertives: ImunizacaoAssertive[],
  correct: QuestionOption,
): string {
  const combo = formatGabaritoCombo(assertives);
  const falseOnes = assertives.filter((a) => !a.isTrue);
  const trueOnes = assertives.filter((a) => a.isTrue);

  for (const a of falseOnes) {
    if (new RegExp(`\\b${a.roman}\\b`).test(opt.text.toUpperCase())) {
      return truncate(
        `I é ${falseOnes.some((x) => x.roman === 'I') && a.roman === 'I' ? 'FALSA' : `falsa (${a.roman})`}: ${inferAssertiveDetail(a.text, false).replace(/^FALSA\.\s*/, '')} — gabarito: letra ${correct.id} (${combo}).`,
        500,
      );
    }
  }

  if (trueOnes.length > 0 && !trueOnes.every((a) => new RegExp(`\\b${a.roman}\\b`).test(opt.text.toUpperCase()))) {
    const missing = trueOnes.filter((a) => !new RegExp(`\\b${a.roman}\\b`).test(opt.text.toUpperCase()));
    if (missing.length > 0) {
      return truncate(
        `${missing.map((m) => m.roman).join(', ')} ${missing.length > 1 ? 'são' : 'é'} VERDADEIRA(S) no manual — gabarito exige ${combo} → letra ${correct.id}.`,
        500,
      );
    }
  }

  return truncate(`Gabarito: letra ${correct.id} — ${correct.text}`, 500);
}

function buildVfConceptMap(input: BuildImunizacaoSlidesInput, assertives: ImunizacaoAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferTopicFromInstruction(input.instruction);
  const falseOnes = assertives.filter((a) => !a.isTrue);
  const firstTrap = falseOnes[0];

  const items = assertives.slice(0, 4).map((a) => ({
    label: inferAssertiveShortLabel(a.roman, a.text),
    detail: inferAssertiveDetail(a.text, a.isTrue),
    icon: inferAssertiveIcon(a.text),
  }));

  if (firstTrap) {
    items.push({
      label: `Pegadinha da ${firstTrap.roman}`,
      detail: inferAssertiveDetail(firstTrap.text, false),
      icon: 'AlertTriangle',
    });
  }

  items.push({
    label: 'Combinação correta',
    detail: truncate(
      `${assertives.map((a) => `${a.roman}=${a.isTrue ? 'V' : 'F'}`).join(', ')} → letra ${correct?.id ?? '?'}.`,
      500,
    ),
    icon: 'CheckCircle',
  });

  return {
    type: 'concept_map',
    slide_title: truncate(`${topic} — mapa V/F da prova`, 120),
    meta: slideMeta(input.topico, input.subtopico),
    items: items.slice(0, 20),
    footer_rule: truncate(
      topic === 'Intervalos PNI'
        ? 'INTERVALOS: grace 4d · FA×SCR 30d · VPC13→VPP23 8sem · oral×IM livre'
        : `PNI — ${topic.toUpperCase()}`,
      500,
    ),
  };
}

function buildVfGoldenRule(input: BuildImunizacaoSlidesInput, assertives: ImunizacaoAssertive[]): SlideRecord {
  const topic = inferTopicFromInstruction(input.instruction);
  const correct = input.options.find((o) => o.is_correct);

  const rows: GoldenRuleRow[] = assertives.map((a) => ({
    label: inferGoldenRowLabel(a.roman, a.text),
    value: a.isTrue
      ? truncate(`VERDADEIRA: ${inferAssertiveDetail(a.text, true).replace(/^VERDADEIRA\.\s*/, '')}`, 500)
      : truncate(`FALSA: ${inferAssertiveDetail(a.text, false).replace(/^FALSA\.\s*/, '')}`, 500),
    ...(a.isTrue
      ? { badge: 'ok' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));

  if (topic === 'Intervalos PNI') {
    rows.push({
      label: 'Virais vivos injetáveis',
      value: 'Mesmo dia OU ≥4 semanas entre si (2ª inválida se <4 sem)',
      badge: 'info',
    });
    rows.push({
      label: 'Oral × oral (extra)',
      value: 'Simultâneo OU ≥15 dias — não confundir com oral × injetável',
      badge: 'warn',
    });
  }

  rows.push({
    label: 'Combinação — gabarito',
    value: truncate(`${formatGabaritoCombo(assertives)} → letra ${correct?.id ?? '?'}`, 500),
    emphasis: 'success',
    badge: 'hot',
  });

  return {
    type: 'golden_rule',
    slide_title: truncate('Referência — intervalos na prova', 120),
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate('INTERVALOS PNI — JULGAMENTO DAS AFIRMATIVAS', 1000),
    rows: rows.slice(0, 12),
    footer_rule: truncate(
      'Decore: grace 4d · FA×SCR 30d · VPC13→VPP23 8sem · oral×IM livre',
      500,
    ),
  };
}

function clampLogicSteps(steps: string[]): string[] {
  return steps.slice(0, 15).map((step) => truncate(step, 500));
}

function buildVfLogicFlow(input: BuildImunizacaoSlidesInput, assertives: ImunizacaoAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const countWord = assertives.length === 4 ? 'quatro' : assertives.length === 3 ? 'três' : 'várias';

  const steps: string[] = [
    `Identificar formato: ${countWord} afirmativas (I–${assertives[assertives.length - 1]?.roman ?? 'IV'}) sobre intervalos entre vacinas + “É CORRETO o que se afirma em”.`,
  ];

  for (const a of assertives) {
    const preview = truncate(a.text.split(/[,.;]/)[0] ?? a.text, 90);
    steps.push(
      `Julgar ${a.roman}: ${preview}? → ${a.isTrue ? 'VERDADEIRO' : 'FALSO'} — ${inferAssertiveDetail(a.text, a.isTrue).replace(/^(VERDADEIRA|FALSA)\.\s*/, '').slice(0, 80)}.`,
    );
  }

  const combo = formatGabaritoCombo(assertives);
  const falseRomans = assertives.filter((a) => !a.isTrue).map((a) => a.roman);

  steps.push(`Montar conjunto verdadeiro: ${combo}${falseRomans.length > 0 ? `; ${falseRomans.join(', ')} fica(m) de fora` : ''}.`);
  steps.push(`Localizar alternativa ${correct?.id ?? '?'} = “${truncate(correct?.text ?? '', 80)}”.`);

  for (const opt of input.options.filter((o) => !o.is_correct)) {
    steps.push(`Eliminar ${opt.id} (${truncate(opt.text, 60)}).`);
  }

  steps.push(`Marcar ${correct?.id ?? '?'}.`);
  steps.push('Fixação: em V/F de intervalos, sempre testar I (grace period) antes de montar combinação.');

  return {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta(input.topico, input.subtopico),
    steps: clampLogicSteps(steps),
    footer_rule: truncate('Roteiro V/F: I → II → III → IV → conjunto → eliminar letras com I falsa', 500),
  };
}

function buildVfDangerZone(input: BuildImunizacaoSlidesInput, assertives: ImunizacaoAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Imunizacao VF: gabarito ausente');

  const items: DangerZoneItem[] = input.options
    .filter((o) => !o.is_correct)
    .map((opt) => ({
      label: truncate(`Letra ${opt.id} — ${opt.text}`, 200),
      detail: inferLetterTrapDetail(opt, assertives),
      correct: inferLetterCorrection(opt, assertives, correct),
    }));

  const graceFalse = assertives.find((a) => !a.isTrue && /4\s*dia|grace|idade mínima|idade minima/.test(a.text.toLowerCase()));
  if (graceFalse) {
    items.push({
      label: 'Confundir grace period (I)',
      detail: '“4 dias” parece margem para repetir — a banca inverte: repetir só se passar de 4 dias ou intervalo curto.',
      correct: 'Grace period: antecipação ≤4 dias = dose válida; não é erro de imunização.',
    });
  }

  const faTrue = assertives.find((a) => a.isTrue && /febre amarela|tríplice|tetraviral/.test(a.text.toLowerCase()));
  if (faTrue) {
    items.push({
      label: 'Vacinar tudo no mesmo dia (II)',
      detail: 'Simultaneidade é regra geral, mas SCR/SCRV + FA <2 anos é exceção na rotina.',
      correct: 'Menor de 2 anos: tríplice/tetraviral e FA com intervalo mínimo de 30 dias.',
    });
  }

  if (items.length < 4) {
    items.push({
      label: 'Marcar sem testar todas as letras',
      detail: 'Eliminar distratoras pelo texto literal de cada alternativa antes de confirmar.',
      correct: truncate(`Gabarito: letra ${correct.id} — ${correct.text}`, 500),
    });
  }

  return {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate('PEGADINHAS CPCON — INTERVALOS (I–IV)', 1000),
    items: items.slice(0, 10),
    footer_rule: truncate('V/F intervalos: julgue I (grace) antes de montar combinação', 500),
  };
}

function buildCalendarConceptMap(input: BuildImunizacaoSlidesInput): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const ageMonths = extractAgeMonths(input.instruction);
  const ageLabel = ageMonths != null ? `${ageMonths}º mês` : 'marco etário';

  const items = [
    {
      label: 'Marco da questão',
      detail: truncate(
        `${ageLabel} de vida — cruzar idade × vacina no Calendário Nacional (PNI).`,
        500,
      ),
      icon: 'Calendar',
    },
  ];

  for (const opt of input.options.slice(0, 4)) {
    const theme = inferVaccineTheme(opt.text, opt.is_correct);
    items.push({ label: theme.label, detail: theme.detail, icon: theme.icon });
  }

  const firstWrong = input.options.find((o) => !o.is_correct);
  if (firstWrong) {
    items.push({
      label: `Pegadinha da ${firstWrong.id}`,
      detail: inferCalendarTrapDetail(firstWrong.text, ageMonths),
      icon: 'XCircle',
    });
  }

  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct?.id ?? '?'}: ${correct?.text ?? ''}.`, 500),
    icon: 'CheckCircle',
  });

  return {
    type: 'concept_map',
    slide_title: truncate(`Calendário PNI — ${ageLabel}`, 120),
    meta: slideMeta(input.topico, input.subtopico),
    items: items.slice(0, 20),
    footer_rule: truncate(
      ageMonths === 3
        ? '3 MESES = 1ª DOSE MENINGOCÓCICA C — esquema 3 · 5 · 12 meses'
        : 'Em prova: idade do enunciado → linha do calendário → cruzar com alternativa',
      500,
    ),
  };
}

function buildCalendarGoldenRule(input: BuildImunizacaoSlidesInput): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const ageMonths = extractAgeMonths(input.instruction);

  const rows: GoldenRuleRow[] = [
    { label: 'Ao nascer', value: 'BCG + Hepatite B (1ª dose)', badge: 'info' },
    { label: '2 meses', value: 'Pentavalente (1ª) · VIP/VOP · Pneumo 10 (1ª) · Rotavírus (1ª)', badge: 'warn' },
  ];

  if (ageMonths != null) {
    rows.push({
      label: `${ageMonths} meses — questão`,
      value: truncate(correct?.text ?? 'Vacina do marco', 500),
      emphasis: 'highlight',
      badge: 'hot',
    });
  }

  rows.push({
    label: '4 meses',
    value: 'Pentavalente (2ª) · VIP · Pneumo 10 (2ª) · Rotavírus (2ª)',
    badge: 'warn',
  });
  rows.push({
    label: `Letra ${correct?.id ?? '?'} — gabarito`,
    value: truncate(`${correct?.text ?? ''} aos ${ageMonths ?? '?'} meses`, 500),
    emphasis: 'success',
    badge: 'hot',
  });

  return {
    type: 'golden_rule',
    slide_title: truncate('Referência de prova — marcos do lactente', 120),
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate('PNI — VACINAS COBRADAS POR IDADE (LACTENTE)', 1000),
    rows: rows.slice(0, 12),
    footer_rule: truncate('Em prova: idade do enunciado → linha do calendário → cruzar com alternativa', 500),
  };
}

function buildCalendarLogicFlow(input: BuildImunizacaoSlidesInput): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const ageMonths = extractAgeMonths(input.instruction);
  const ageLabel = ageMonths != null ? `${ageMonths}º mês` : 'marco etário';

  const steps = [
    `Ler o marco etário: “${ageLabel} de vida” — fixar a idade, não “terceira dose” de outra vacina.`,
    'Abrir mentalmente o PNI do lactente: o que tem dose específica nessa idade?',
  ];

  if (correct) {
    steps.push(`Recuperar: ${truncate(correct.text, 100)} — marco do calendário para esta idade.`);
  }

  for (const opt of input.options.filter((o) => !o.is_correct)) {
    steps.push(`Testar ${opt.id} (${truncate(opt.text, 60)}): ${inferCalendarTrapDetail(opt.text, ageMonths)} → eliminar.`);
  }

  steps.push(`Marcar ${correct?.id ?? '?'}: única alternativa alinhada ao calendário.`);
  steps.push('Fixação: cruzar idade do enunciado com nome da vacina — banca troca meses vizinhos (2 × 3 × 4).');

  return {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta(input.topico, input.subtopico),
    steps: clampLogicSteps(steps),
    footer_rule: truncate('Estratégia: idade → calendário PNI → eliminar por mês errado → gabarito', 500),
  };
}

function buildCalendarDangerZone(input: BuildImunizacaoSlidesInput): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Imunizacao calendário: gabarito ausente');
  const ageMonths = extractAgeMonths(input.instruction);

  const items: DangerZoneItem[] = input.options
    .filter((o) => !o.is_correct)
    .map((opt) => ({
      label: truncate(`Letra ${opt.id} — ${opt.text}`, 200),
      detail: inferCalendarTrapDetail(opt.text, ageMonths),
      correct: inferCalendarCorrection(opt.text, correct.text, ageMonths),
    }));

  items.push({
    label: '3ª dose = 3 meses de vida',
    detail: 'Aluno lê “3” e associa ao 3º mês; a 3ª dose da pentavalente é aos 6 meses.',
    correct: '3 meses de vida ≠ 3ª dose — cruzar idade com calendário, não ordem da série.',
  });

  return {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(`PEGADINHAS — CALENDÁRIO INFANTIL (${ageMonths ?? '?'} MESES)`, 1000),
    items: items.slice(0, 10),
    footer_rule: truncate('Enunciado com idade exata → descarte meses vizinhos → gabarito', 500),
  };
}

export function canBuildImunizacaoVfSlides(instruction: string): boolean {
  return extractImunizacaoAssertives(instruction).length >= 2;
}

const IMUNIZACAO_SUPPORTED_FAMILIES = [
  'conceito',
  'protocolo',
  'text_fragment',
  'legis',
  'calc',
  'vf',
  'certo_errado',
] as const;

export function canBuildImunizacaoPremiumSlides(instruction: string, family: string): boolean {
  if (canBuildImunizacaoVfSlides(instruction)) return true;
  return IMUNIZACAO_SUPPORTED_FAMILIES.includes(
    family as (typeof IMUNIZACAO_SUPPORTED_FAMILIES)[number],
  );
}

export function buildImunizacaoPremiumSlides(input: BuildImunizacaoSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const assertives = resolveImunizacaoAssertives(input.instruction, correct);
  if (assertives.length < 2) {
    throw new Error('Imunizacao VF: enunciado sem afirmativas I/II/III suficientes');
  }

  return [
    buildVfConceptMap(input, assertives),
    buildVfGoldenRule(input, assertives),
    buildVfLogicFlow(input, assertives),
    buildVfDangerZone(input, assertives),
  ];
}

export function buildImunizacaoChoiceSlides(input: BuildImunizacaoSlidesInput): SlideRecord[] {
  if (!input.options.some((o) => o.is_correct)) {
    throw new Error('Imunizacao choice: gabarito ausente');
  }

  return [
    buildCalendarConceptMap(input),
    buildCalendarGoldenRule(input),
    buildCalendarLogicFlow(input),
    buildCalendarDangerZone(input),
  ];
}

export function buildImunizacaoPremiumSlidesForFamily(
  input: BuildImunizacaoSlidesInput,
  family: string,
): SlideRecord[] {
  if (canBuildImunizacaoVfSlides(input.instruction)) {
    return buildImunizacaoPremiumSlides(input);
  }
  return buildImunizacaoChoiceSlides(input);
}

export function imunizacaoGoldenReferenceForFamily(family: string): string {
  return family === 'vf' ? IMUNIZACAO_GOLDEN_FILE : IMUNIZACAO_CALENDARIO_GOLDEN_FILE;
}
