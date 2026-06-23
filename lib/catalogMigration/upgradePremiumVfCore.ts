import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  extractCurativosAssertives,
  resolveCurativosAssertives,
  type CurativosAssertive,
} from '@/lib/catalogMigration/upgradePremiumCurativos';

type SlideRecord = Record<string, unknown>;
type DangerZoneItem = { label: string; detail: string; correct: string };

export type SubtopicoTopicProfile = {
  conceptFooter: string;
  goldenContent: string;
  goldenFooter: string;
  logicFooter: string;
  logicFix: string;
  dangerContent: string;
  dangerFooter: (correctId: string) => string;
  chipLabel?: string;
};

export type BuildPackageSlidesInput = {
  instruction: string;
  options: QuestionOption[];
  topico: string;
  subtopico: string;
};

export type VfPackageConfig = {
  inferTopic: (instruction: string, options: QuestionOption[]) => string;
  topicProfiles: Record<string, SubtopicoTopicProfile>;
  defaultTopic: string;
  buildFalseDangerItem?: (a: CurativosAssertive, correct?: QuestionOption) => DangerZoneItem;
  buildConceptItems?: (
    input: BuildPackageSlidesInput,
    assertives: CurativosAssertive[],
    correct: QuestionOption,
    topic: string,
  ) => { label: string; detail: string; icon: string }[];
  enrichVfGoldenRow?: (
    a: CurativosAssertive,
    correct: QuestionOption,
    topic: string,
  ) => Pick<GoldenRuleRow, 'exam_hint' | 'fixation'>;
};

export type ChoicePackageConfig = {
  inferTopic: (instruction: string, options: QuestionOption[]) => string;
  topicProfiles: Record<string, SubtopicoTopicProfile>;
  defaultTopic: string;
  inferOptionTrap: (text: string) => string;
  inferOptionTheme?: (
    text: string,
    isCorrect: boolean,
  ) => { label: string; icon: string; detail: string };
  buildGoldenRows?: (
    topic: string,
    options: QuestionOption[],
    correct: QuestionOption,
  ) => GoldenRuleRow[];
  buildConceptItems?: (
    input: BuildPackageSlidesInput,
    correct: QuestionOption,
    topic: string,
  ) => { label: string; detail: string; icon: string }[];
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function slideMeta(topico: string, subtopico: string): { topico: string; subtopico: string } {
  return { topico, subtopico };
}

function topicProfile(
  topic: string,
  profiles: Record<string, SubtopicoTopicProfile>,
  defaultTopic: string,
): SubtopicoTopicProfile {
  return profiles[topic] ?? profiles[defaultTopic];
}

function defaultFalseDangerItem(a: CurativosAssertive, correct?: QuestionOption): DangerZoneItem {
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa — gabarito ${correct?.id ?? '?'}.`, 500),
  };
}

function defaultVfConceptItems(
  input: BuildPackageSlidesInput,
  assertives: CurativosAssertive[],
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  const prof = topicProfile(topic, {}, topic);
  void prof;
  const items = assertives.map((a) => ({
    label: `Afirmativa ${a.roman}`,
    detail: truncate(`${a.isTrue ? 'VERDADEIRA' : 'FALSA'}: ${a.text}`, 500),
    icon: a.isTrue ? 'CheckCircle' : 'XCircle',
  }));
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'Target',
  });
  return items.slice(0, 20);
}

export function canBuildVfSlides(instruction: string): boolean {
  return extractCurativosAssertives(instruction).length >= 2;
}

export function buildVfPackageSlides(
  input: BuildPackageSlidesInput,
  config: VfPackageConfig,
): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const assertives = resolveCurativosAssertives(input.instruction, correct);
  if (assertives.length < 2) {
    throw new Error('VF package: enunciado sem afirmativas I/II/III suficientes');
  }
  if (!correct) throw new Error('VF package: gabarito ausente');

  const topic = config.inferTopic(input.instruction, input.options);
  const prof = topicProfile(topic, config.topicProfiles, config.defaultTopic);
  const meta = slideMeta(input.topico, input.subtopico);

  const conceptItems =
    config.buildConceptItems?.(input, assertives, correct, topic) ??
    defaultVfConceptItems(input, assertives, correct, topic);

  const rows: GoldenRuleRow[] = assertives.map((a) => ({
    label: `${a.roman} — ${truncate(a.text.split(/[,.;]/)[0] ?? a.text, 60)}`,
    value: a.isTrue ? truncate(`Verdadeira: ${a.text}`, 500) : truncate(`Falsa: ${a.text}`, 500),
    ...(a.isTrue
      ? { badge: 'ok' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
    ...config.enrichVfGoldenRow?.(a, correct, topic),
  }));
  rows.push({
    label: 'Resposta final',
    value: truncate(correct.text, 500),
    emphasis: 'highlight',
    badge: 'hot',
  });

  const steps = [
    `Ler a questão como combinação V/F sobre ${topic.toLowerCase()}.`,
    ...assertives.map((a) =>
      `Julgar ${a.roman}: ${truncate(a.text, 80)}? → ${a.isTrue ? 'verdadeiro' : 'falso'}.`,
    ),
    'Montar o conjunto correto conforme alternativas.',
    `Marcar ${correct.id}.`,
    `Fixação: ${prof.logicFix}.`,
  ];

  const falseBuilder = config.buildFalseDangerItem ?? defaultFalseDangerItem;
  const items: DangerZoneItem[] = assertives
    .filter((a) => !a.isTrue)
    .map((a) => falseBuilder(a, correct));
  if (items.length < 3) {
    items.push({
      label: 'Marcar sem julgar todas as afirmativas',
      detail: 'Combinar letras sem V/F item a item leva a gabarito errado.',
      correct: 'Julgue I, II, III… antes de olhar as combinações A–E.',
    });
  }

  return [
    {
      type: 'concept_map',
      slide_title: truncate(`${topic} — mapa da prova`, 120),
      chip_label: prof.chipLabel,
      meta,
      items: conceptItems,
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: truncate(`Regra de ouro — ${topic.toLowerCase()}`, 120),
      chip_label: 'REGRA DE OURO',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: rows.slice(0, 12),
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
      chip_label: 'PASSO A PASSO',
      meta,
      reveal_mode: 'tap',
      steps: steps.slice(0, 15),
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: 'Armadilhas que a banca monta',
      chip_label: 'ARMADILHAS DE PROVA',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: items.slice(0, 10),
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

function defaultOptionTheme(text: string, isCorrect: boolean): { label: string; icon: string; detail: string } {
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

export function buildChoicePackageSlides(
  input: BuildPackageSlidesInput,
  config: ChoicePackageConfig,
): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Choice package: gabarito ausente');

  const topic = config.inferTopic(input.instruction, input.options);
  const prof = topicProfile(topic, config.topicProfiles, config.defaultTopic);
  const meta = slideMeta(input.topico, input.subtopico);
  const inferTheme = config.inferOptionTheme ?? defaultOptionTheme;

  const conceptItems =
    config.buildConceptItems?.(input, correct, topic) ?? [
      {
        label: 'Contexto',
        detail: truncate(input.instruction.replace(/\s+/g, ' '), 500),
        icon: 'Gauge',
      },
      ...input.options.slice(0, 4).map((opt) => {
        const theme = inferTheme(opt.text, opt.is_correct);
        return { label: theme.label, detail: theme.detail, icon: theme.icon };
      }),
      {
        label: 'Gabarito',
        detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        icon: 'Target',
      },
    ].slice(0, 20);

  const customRows = config.buildGoldenRows?.(topic, input.options, correct);
  const rows =
    customRows && customRows.length > 0
      ? customRows
      : input.options.map((opt) => ({
      label: `Letra ${opt.id}`,
      value: opt.is_correct
        ? truncate(`Verdadeira: ${opt.text}`, 500)
        : truncate(`Falsa: ${config.inferOptionTrap(opt.text)}`, 500),
      ...(opt.is_correct
        ? { badge: 'ok' as const, emphasis: 'highlight' as const }
        : { emphasis: 'alert' as const, badge: 'warn' as const }),
    }));

  const wrong = input.options.filter((o) => !o.is_correct);
  const steps = [
    `Ler o comando: ${truncate(input.instruction.replace(/\s+/g, ' '), 120)}.`,
    `Fixar o tema: ${topic.toLowerCase()}.`,
    `Identificar gabarito: letra ${correct.id} — ${truncate(correct.text, 100)}.`,
    ...wrong.map(
      (opt) =>
        `Testar letra ${opt.id}: ${truncate(opt.text, 90)} → eliminar (${truncate(config.inferOptionTrap(opt.text), 80)}).`,
    ),
    `Marcar letra ${correct.id}.`,
    `Fixação: ${prof.logicFix}.`,
  ];

  const dangerItems: DangerZoneItem[] = wrong.map((opt) => ({
    label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
    detail: config.inferOptionTrap(opt.text),
    correct: truncate(`Gabarito ${correct.id} — ${correct.text}`, 500),
  }));

  return [
    {
      type: 'concept_map',
      slide_title: truncate(`${topic} — mapa da prova`, 120),
      chip_label: prof.chipLabel,
      meta,
      items: conceptItems,
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: truncate(`Referência — ${topic.toLowerCase()}`, 120),
      chip_label: 'REGRA DE OURO',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: rows.slice(0, 12),
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
      chip_label: 'PASSO A PASSO',
      meta,
      reveal_mode: 'tap',
      steps: steps.slice(0, 15),
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: 'Armadilhas que a banca monta',
      chip_label: 'ARMADILHAS DE PROVA',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: dangerItems.slice(0, 10),
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

export function buildPackageSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
  vfConfig: VfPackageConfig,
  choiceConfig: ChoicePackageConfig,
): SlideRecord[] {
  if (canBuildVfSlides(input.instruction)) {
    return buildVfPackageSlides(input, vfConfig);
  }
  return buildChoicePackageSlides(input, choiceConfig);
}

export function canBuildPackagePremiumSlides(instruction: string, family: string): boolean {
  if (canBuildVfSlides(instruction)) return true;
  return ['conceito', 'protocolo', 'text_fragment', 'calc', 'legis', 'vf', 'certo_errado'].includes(
    family,
  );
}
