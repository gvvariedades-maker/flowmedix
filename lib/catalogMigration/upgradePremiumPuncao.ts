import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  extractCurativosAssertives,
  normalizeCurativosInstruction,
  resolveCurativosAssertives,
  type CurativosAssertive,
} from '@/lib/catalogMigration/upgradePremiumCurativos';

export const PUNCAO_GOLDEN_FILE = 'questao-premium-admtec-puncao-venosa-cateteres.json';

type SlideRecord = Record<string, unknown>;
type DangerZoneItem = { label: string; detail: string; correct: string };

export type BuildPuncaoSlidesInput = {
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

export function isPuncaoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'punção venosa e cuidados com cateteres' ||
    n === 'punção venosa' ||
    n === 'cateteres'
  );
}

export const normalizePuncaoInstruction = normalizeCurativosInstruction;

export function inferPuncaoTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (
    /ipcs|infecção.*cateter|infeccao.*cateter|corrente sanguínea|corrente sanguinea|cateter venoso central|\bcvc\b|barreira estéril máxima|barreira esteril maxima/.test(
      blob,
    )
  ) {
    return 'Prevenção de IPCS no CVC';
  }
  if (/flebite|extravasação|extravasacao|flebitis|endoflebite/.test(blob)) {
    return 'Flebite e complicações';
  }
  if (/punção venosa|puncao venosa|acesso venoso perif|periféric|periferic|jelco|scalp|dispositivo.*infusão|dispositivo.*infusao/.test(
      blob,
    )
  ) {
    return 'Punção venosa periférica';
  }
  if (/curativo.*cateter|manutenção.*cateter|manutencao.*cateter|lúmen|lumen|obstrução|obstrucao|flushing|heparinização/.test(
      blob,
    )
  ) {
    return 'Manutenção de cateter';
  }
  return 'Acesso venoso e cateteres';
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
  'Prevenção de IPCS no CVC': {
    conceptFooter: 'IPCS no CVC = bundle completo — uma medida isolada não substitui o pacote.',
    goldenContent: 'BUNDLE DO CVC: ASSEPSIA + BARREIRA MÁXIMA + CURATIVO CERTO + REMOÇÃO PRECOCE',
    goldenFooter: 'Gabarito resume o bundle: assepsia + barreira máxima + curativo adequado + remoção precoce.',
    logicFooter: 'Estratégia: enunciado → bundle → gabarito → eliminar distratoras',
    logicFix: 'IPCS no CVC — bundle integrado vence “uma medida só”.',
    dangerContent: 'PEGADINHAS — IPCS NO CATETER VENOSO CENTRAL',
    dangerFooter: (id) => `Interrogue cada letra: armadilha × bundle completo (letra ${id}) antes de marcar.`,
    chipLabel: 'IPCS — CVC',
  },
  'Flebite e complicações': {
    conceptFooter: 'Flebite = dor, calor, rubor no trajeto venoso — retire o dispositivo.',
    goldenContent: 'FLEBITE: RETIRAR DISPOSITIVO + AVALIAR EXTENSÃO + NÃO REUTILIZAR O MESMO ACESSO',
    goldenFooter: 'A banca confunde sinais locais com extravasação e conduta de manutenção.',
    logicFooter: 'Identifique sinais locais → retire cateter → documente e reavalie acesso.',
    logicFix: 'flebite exige retirada do dispositivo, não “observar e manter”.',
    dangerContent: 'PEGADINHAS — FLEBITE E ACESSO VENOSO',
    dangerFooter: (id) => `Sinais de flebite fecham letra ${id} — não mantenha o cateter inflamado.`,
    chipLabel: 'FLEBITE',
  },
  'Punção venosa periférica': {
    conceptFooter: 'Punção periférica = técnica asséptica + ordem correta + fixação e observação pós-punção.',
    goldenContent: 'PUNÇÃO SEGURA: ASSEPSIA + SELEÇÃO DO VASO + ÂNGULO/PROFUNDIDADE + FIXAÇÃO',
    goldenFooter: 'A banca testa sequência, contraindicações locais e cuidados pós-punção.',
    logicFooter: 'Sequência: preparo → punção → confirmação → fixação → documentação.',
    logicFix: 'técnica asséptica e seleção do vaso vencem atalhos de punção.',
    dangerContent: 'PEGADINHAS — PUNÇÃO VENOSA PERIFÉRICA',
    dangerFooter: (id) => `Técnica e sequência corretas fecham letra ${id}.`,
    chipLabel: 'PUNÇÃO',
  },
  'Manutenção de cateter': {
    conceptFooter: 'Manutenção = assepsia na manipulação + curativo íntegro + flushing conforme protocolo.',
    goldenContent: 'MANUTENÇÃO: HIGIENE DAS MÃOS + CURATIVO ÍNTEGRO + TÉCNICA ASSÉPTICA NO LÚMEN',
    goldenFooter: 'A banca troca frequência de curativo e técnica de desinfecção do conector.',
    logicFooter: 'Cada manipulação exige assepsia — curativo úmido ou solto troca na hora.',
    logicFix: 'manutenção asséptica contínua previne IPCS e obstrução.',
    dangerContent: 'PEGADINHAS — MANUTENÇÃO DE CATETER',
    dangerFooter: (id) => `Protocolo de manutenção correto fecha letra ${id}.`,
    chipLabel: 'CATETER',
  },
  'Acesso venoso e cateteres': {
    conceptFooter: 'Julgue técnica asséptica, indicação e cuidados do dispositivo antes de marcar.',
    goldenContent: 'ACESSO VENOSO: ASSEPSIA + INDICAÇÃO + MANUTENÇÃO + RETIRADA OPORTUNA',
    goldenFooter: 'Em cateteres, conduta isolada raramente é a resposta da banca.',
    logicFooter: 'Enunciado → tema do acesso → gabarito → eliminar distratoras.',
    logicFix: 'elimine alternativas que quebrem técnica asséptica ou bundle de prevenção.',
    dangerContent: 'PEGADINHAS — ACESSO VENOSO',
    dangerFooter: (id) => `Compare cada alternativa com a letra ${id} antes de marcar.`,
    chipLabel: 'ACESSO IV',
  },
};

function topicProfile(topic: string): TopicProfile {
  return TOPIC_PROFILES[topic] ?? TOPIC_PROFILES['Acesso venoso e cateteres'];
}

function inferOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/0,5%|0\.5%/.test(lower) && /clorexidina/.test(lower)) {
    return 'Concentração ou uso isolado de clorexidina sem bundle completo.';
  }
  if (/72 horas|72 h/.test(lower) && /independente|independentemente/.test(lower)) {
    return 'Curativo não se troca em cronograma fixo — troca quando sujo, solto ou úmido.';
  }
  if (/femoral/.test(lower) && /rotina|preferir|instável|instavel/.test(lower)) {
    return 'Femoral não é preferência de rotina — maior risco de infecção.';
  }
  if (/antibiótico|antibiotico|profilátic|profilatic/.test(lower)) {
    return 'Antibiótico profilático não faz parte do bundle de prevenção de IPCS.';
  }
  if (/vigilância microbiológica|vigilancia microbiologica|cultura rotineira/.test(lower)) {
    return 'Cultura rotineira do cateter não substitui bundle de inserção/manutenção.';
  }
  if (/iodo-povidona|iodopovidona|povidona/.test(lower) && /lúmen|lumen/.test(lower)) {
    return 'Desinfecção rotineira do lúmen com iodo não é conduta padrão do bundle.';
  }
  if (/reutiliz|reaproveit/.test(lower)) {
    return 'Dispositivo ou material de punção não se reutiliza.';
  }
  if (/álcool 70|alcool 70/.test(lower) && /punção|puncao/.test(lower)) {
    return 'Antissepsia antes da punção exige clorexidina alcoólica, não só álcool 70%.';
  }
  return truncate(text, 500);
}

function inferOptionCorrection(wrongText: string, correctText: string, correctId: string): string {
  const trap = inferOptionTrap(wrongText);
  if (trap !== truncate(wrongText, 500)) return `Gabarito ${correctId} — ${trap}`;
  return truncate(`Gabarito ${correctId} — ${correctText}`, 500);
}

function inferOptionTheme(text: string, isCorrect: boolean): { label: string; icon: string; detail: string } {
  const lower = text.toLowerCase();
  if (/barreira estéril|barreira esteril|técnica asséptica|tecnica asséptica|asseptica/.test(lower)) {
    return {
      label: 'Barreira estéril',
      icon: 'Shield',
      detail: isCorrect
        ? 'Técnica asséptica rigorosa com barreira estéril máxima na inserção e manutenção.'
        : 'Bundle incompleto se citar só uma medida isolada.',
    };
  }
  if (/clorexidina|antissepsia|higienização|higienizacao/.test(lower)) {
    return {
      label: 'Antissepsia',
      icon: 'Droplets',
      detail: isCorrect
        ? 'Higienização das mãos e antissepsia cutânea antes da inserção.'
        : inferOptionTrap(text),
    };
  }
  if (/curativo|semipermeável|semipermeavel/.test(lower)) {
    return {
      label: 'Curativo',
      icon: 'Bandage',
      detail: isCorrect
        ? 'Curativo trocado quando sujo, solto ou úmido.'
        : inferOptionTrap(text),
    };
  }
  if (/remover|remoção|remocao|retirar|interrupção|interrupcao/.test(lower)) {
    return {
      label: 'Remoção precoce',
      icon: 'CircleX',
      detail: 'Retirar o cateter assim que não houver indicação clínica.',
    };
  }
  if (/flebite|extravasação|extravasacao/.test(lower)) {
    return { label: 'Flebite / extravasação', icon: 'AlertTriangle', detail: truncate(text, 500) };
  }
  if (/punção|puncao|acesso venoso|jelco|scalp/.test(lower)) {
    return { label: 'Punção / acesso', icon: 'Syringe', detail: truncate(text, 500) };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

function buildIpCsConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(input.instruction.replace(/\s+/g, ' '), 120);
  return [
    {
      label: 'Contexto',
      detail: truncate(`${preview}`, 500),
      icon: 'Gauge',
    },
    {
      label: 'Antissepsia',
      detail:
        'Higienização das mãos e antissepsia cutânea antes da inserção — clorexidina alcoólica na concentração correta.',
      icon: 'Droplets',
    },
    {
      label: 'Barreira estéril',
      detail: 'Técnica asséptica rigorosa + barreira estéril máxima na inserção e manutenção do CVC.',
      icon: 'Shield',
    },
    {
      label: 'Curativo',
      detail: 'Curativo semipermeável trocado quando sujo, solto ou úmido — não em cronograma fixo cego.',
      icon: 'Bandage',
    },
    {
      label: 'Remoção precoce',
      detail: 'Retirar o CVC assim que não houver mais indicação clínica.',
      icon: 'CircleX',
    },
    {
      label: 'Gabarito',
      detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
      icon: 'Target',
    },
  ];
}

function buildChoiceGoldenRows(
  topic: string,
  options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  if (topic === 'Prevenção de IPCS no CVC') {
    return [
      {
        label: 'Contexto UTI',
        value: 'Aumento de IPCS no CVC exige bundle de prevenção, não conduta isolada.',
        emphasis: 'highlight',
        badge: 'hot',
      },
      {
        label: 'Higienização',
        value: 'Mãos e antissepsia cutânea sempre antes e após manipular o acesso venoso.',
        emphasis: 'default',
        badge: 'ok',
      },
      {
        label: 'Barreira',
        value: 'Barreira estéril máxima na inserção e manutenção.',
        emphasis: 'success',
        badge: 'ok',
      },
      {
        label: 'Curativo',
        value: 'Trocar quando sujo, solto ou úmido — não a cada 72 h “independente da integridade”.',
        emphasis: 'alert',
        badge: 'warn',
      },
      {
        label: 'Remoção',
        value: 'Retirar o CVC assim que não for mais necessário.',
        emphasis: 'success',
        badge: 'ok',
      },
      {
        label: 'Gabarito',
        value: `Letra ${correct.id}`,
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }

  return options.map((opt) => ({
    label: `Letra ${opt.id}`,
    value: opt.is_correct
      ? truncate(`Verdadeira: ${opt.text}`, 500)
      : truncate(`Falsa: ${inferOptionTrap(opt.text)}`, 500),
    ...(opt.is_correct
      ? { badge: 'ok' as const, emphasis: 'highlight' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));
}

function buildChoiceLogicSteps(
  input: BuildPuncaoSlidesInput,
  topic: string,
  correct: QuestionOption,
): string[] {
  const wrong = input.options.filter((o) => !o.is_correct);
  const preview = truncate(input.instruction.replace(/\s+/g, ' '), 120);
  const prof = topicProfile(topic);

  const steps = [
    `Ler o comando: ${preview}.`,
    topic === 'Prevenção de IPCS no CVC'
      ? 'Fixar o bundle: antissepsia + barreira estéril máxima + curativo adequado + remoção precoce.'
      : `Fixar o tema: ${topic.toLowerCase()}.`,
    `Identificar gabarito: letra ${correct.id} — ${truncate(correct.text, 100)}.`,
  ];

  for (const opt of wrong) {
    const trap = inferOptionTrap(opt.text);
    steps.push(`Testar letra ${opt.id}: ${truncate(opt.text, 90)} → eliminar (${truncate(trap, 80)}).`);
  }

  steps.push(`Marcar letra ${correct.id}.`);
  steps.push(`Fixação: ${prof.logicFix}`);
  return steps.slice(0, 15);
}

function buildChoiceDangerItems(
  options: QuestionOption[],
  correct: QuestionOption,
): DangerZoneItem[] {
  return options
    .filter((o) => !o.is_correct)
    .map((opt) => ({
      label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
      detail: inferOptionTrap(opt.text),
      correct: inferOptionCorrection(opt.text, correct.text, correct.id),
    }));
}

/** Múltipla escolha — padrão golden Adm&Tec IPCS/CVC e temas de acesso venoso. */
export function buildPuncaoChoiceSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Punção choice: gabarito ausente');

  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);
  const meta = slideMeta(input.topico, input.subtopico);

  const conceptItems =
    topic === 'Prevenção de IPCS no CVC'
      ? buildIpCsConceptItems(input, correct)
      : [
          {
            label: 'Contexto',
            detail: truncate(input.instruction.replace(/\s+/g, ' '), 500),
            icon: 'Gauge',
          },
          ...input.options.slice(0, 4).map((opt) => {
            const theme = inferOptionTheme(opt.text, opt.is_correct);
            return { label: theme.label, detail: theme.detail, icon: theme.icon };
          }),
          {
            label: 'Gabarito',
            detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
            icon: 'Target',
          },
        ].slice(0, 20);

  const rows = buildChoiceGoldenRows(topic, input.options, correct);
  const steps = buildChoiceLogicSteps(input, topic, correct);
  const dangerItems = buildChoiceDangerItems(input.options, correct);

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
      slide_title: truncate(`Bundle / regra — ${topic.split(' ').slice(0, 3).join(' ').toLowerCase()}`, 120),
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
      items: dangerItems.slice(0, 10),
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

function inferVfConceptLabel(text: string, isTrue: boolean): { label: string; icon: string } {
  const lower = text.toLowerCase();
  if (/assepsia|asséptica|esteril|clorexidina|higieniza/.test(lower)) {
    return { label: 'Técnica asséptica', icon: 'Shield' };
  }
  if (/curativo|semipermeável|semipermeavel/.test(lower)) {
    return { label: 'Curativo', icon: 'Bandage' };
  }
  if (/flebite|extravasação|extravasacao/.test(lower)) {
    return { label: 'Flebite', icon: 'AlertTriangle' };
  }
  if (/punção|puncao|angulação|angulacao|bevel|bisel/.test(lower)) {
    return { label: 'Técnica de punção', icon: 'Syringe' };
  }
  if (/remoção|remocao|retirar|interrupção|interrupcao/.test(lower)) {
    return { label: 'Remoção do cateter', icon: 'CircleX' };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isTrue ? 'CheckCircle' : 'XCircle',
  };
}

function buildVfConceptMap(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferPuncaoTopic(input.instruction, input.options);
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

function buildVfGoldenRule(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);
  const correct = input.options.find((o) => o.is_correct);

  const rows: GoldenRuleRow[] = assertives.map((a) => ({
    label: `${a.roman} — ${truncate(a.text.split(/[,.;]/)[0] ?? a.text, 60)}`,
    value: a.isTrue ? truncate(`Verdadeira: ${a.text}`, 500) : truncate(`Falsa: ${a.text}`, 500),
    ...(a.isTrue
      ? { badge: 'ok' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));

  rows.push({
    label: 'Resposta final',
    value: truncate(correct?.text ?? '', 500),
    emphasis: 'highlight',
    badge: 'hot',
  });

  return {
    type: 'golden_rule',
    slide_title: truncate(`Regra de ouro — ${topic.toLowerCase()}`, 120),
    chip_label: 'REGRA DE OURO',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(prof.goldenContent, 1000),
    rows: rows.slice(0, 12),
    footer_rule: truncate(prof.goldenFooter, 500),
  };
}

function buildVfLogicFlow(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);

  const steps = [
    `Ler a questão como combinação V/F sobre ${topic.toLowerCase()}.`,
    ...assertives.map((a) =>
      `Julgar ${a.roman}: ${truncate(a.text, 80)}? → ${a.isTrue ? 'verdadeiro' : 'falso'}.`,
    ),
    `Montar o conjunto correto conforme alternativas.`,
    `Marcar ${correct?.id ?? '?'}.`,
    `Fixação: ${prof.logicFix}.`,
  ];

  return {
    type: 'logic_flow',
    slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
    chip_label: 'PASSO A PASSO',
    meta: slideMeta(input.topico, input.subtopico),
    reveal_mode: 'tap',
    steps: steps.slice(0, 15),
    footer_rule: truncate(prof.logicFooter, 500),
  };
}

function buildVfDangerZone(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferPuncaoTopic(input.instruction, input.options);
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
      detail: 'Combinar letras sem V/F item a item leva a gabarito errado.',
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

export function buildPuncaoVfSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const assertives = resolveCurativosAssertives(input.instruction, correct);
  if (assertives.length < 2) {
    throw new Error('Punção VF: enunciado sem afirmativas I/II/III suficientes');
  }

  return [
    buildVfConceptMap(input, assertives),
    buildVfGoldenRule(input, assertives),
    buildVfLogicFlow(input, assertives),
    buildVfDangerZone(input, assertives),
  ];
}

function buildCertoErradoSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Punção CE: gabarito ausente');

  const topic = inferPuncaoTopic(input.instruction, input.options);
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
            ? 'A afirmativa está correta segundo protocolo de acesso venoso.'
            : 'A afirmativa contém erro técnico ou conduta inadequada.',
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
      slide_title: 'Julgamento da afirmativa',
      chip_label: 'REGRA DE OURO',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: [
        {
          label: 'Afirmativa',
          value: statement,
          emphasis: 'default',
          badge: 'info',
        },
        {
          label: 'Julgamento',
          value: isStatementTrue ? 'Certo — conduta/protocolo adequado' : 'Errado — conduta/protocolo inadequado',
          emphasis: isStatementTrue ? 'success' : 'alert',
          badge: isStatementTrue ? 'ok' : 'warn',
        },
        {
          label: 'Gabarito',
          value: `Letra ${correct.id}`,
          emphasis: 'highlight',
          badge: 'hot',
        },
      ],
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
      chip_label: 'PASSO A PASSO',
      meta,
      reveal_mode: 'tap',
      steps: [
        `Ler a afirmativa: ${truncate(statement, 120)}.`,
        `Confrontar com protocolo de ${topic.toLowerCase()}.`,
        `Decidir: ${isStatementTrue ? 'certo' : 'errado'}.`,
        `Marcar letra ${correct.id}.`,
        `Fixação: ${prof.logicFix}.`,
      ],
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: 'Armadilhas que a banca monta',
      chip_label: 'ARMADILHAS DE PROVA',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: [
        {
          label: 'Confundir detalhe técnico com exceção',
          detail: 'A banca altera concentração, sequência ou indicação do procedimento.',
          correct: truncate(`Gabarito ${correct.id} — ${correct.text}`, 500),
        },
        {
          label: 'Marcar pelo “parece correto”',
          detail: 'Sem protocolo claro, a pegadinha parece plausível.',
          correct: truncate(`Confronte com bundle/técnica asséptica antes de marcar ${correct.id}.`, 500),
        },
      ],
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

export function canBuildPuncaoVfSlides(instruction: string): boolean {
  return extractCurativosAssertives(normalizePuncaoInstruction(instruction)).length >= 2;
}

export function canBuildPuncaoPremiumSlides(instruction: string, family: string): boolean {
  if (canBuildPuncaoVfSlides(instruction)) return true;
  if (family === 'certo_errado') return true;
  return ['conceito', 'protocolo', 'text_fragment', 'calc'].includes(family);
}

export function buildPuncaoPremiumSlidesForFamily(
  input: BuildPuncaoSlidesInput,
  family: string,
): SlideRecord[] {
  if (canBuildPuncaoVfSlides(input.instruction)) {
    return buildPuncaoVfSlides(input);
  }
  if (family === 'certo_errado') {
    return buildCertoErradoSlides(input);
  }
  return buildPuncaoChoiceSlides(input);
}

export function buildPuncaoPremiumSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  return buildPuncaoChoiceSlides(input);
}
