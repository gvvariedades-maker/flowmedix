import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import { formatGabaritoCorrect } from '@/lib/catalogMigration/slideContract';
import {
  extractCurativosAssertives,
  normalizeCurativosInstruction,
  resolveCurativosAssertives,
  type CurativosAssertive,
} from '@/legacy/catalog-migration/upgradePremiumCurativos';

export const SAUDE_MENTAL_AGITACAO_EXCETO_GOLDEN_FILE =
  'questao-premium-fundatec-saude-mental-agitacao-exceto.json';
export const SAUDE_MENTAL_CAPS_GOLDEN_FILE =
  'questao-premium-ibade-saude-mental-caps-acolhimento.json';

/** Ramo SM-4 — tópicos atendidos pelo builder dedicado (piloto crise/CAPS). */
export const CRISE_RAMO_TOPICS = [
  'EXCETO — agitação pré-violência',
  'CAPS / acolhimento em crise',
  'De-escalada / agitação',
  'Delirium / cuidado crítico',
  'APS / acolhimento em saúde mental',
  'Certo ou errado — de-escalada',
] as const;

export type CriseRamoTopic = (typeof CRISE_RAMO_TOPICS)[number];

type SlideRecord = Record<string, unknown>;
type DangerZoneItem = { label: string; detail: string; correct: string };

export type BuildSaudeMentalSlidesInput = {
  instruction: string;
  options: QuestionOption[];
  topico: string;
  subtopico: string;
};

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

const TOPIC_PROFILES: Record<CriseRamoTopic, TopicProfile> = {
  'EXCETO — agitação pré-violência': {
    conceptFooter: 'EXCETO = marque o que NÃO é sinal de agitação pré-violência',
    goldenContent: 'AGITAÇÃO: MOTOR + TENSÃO + INQUIETAÇÃO',
    goldenFooter: 'Observe escalada: motor → tensão → impaciência',
    logicFooter: 'Estratégia EXCETO: validar cada sinal → sobra a exceção',
    logicFix: 'no EXCETO, confirme cada alternativa como sinal antes de marcar a exceção',
    dangerContent: 'PEGADINHAS — SINAIS DE AGITAÇÃO',
    dangerFooter: () => 'Letra E é a exceção — as demais são sinais de agitação',
    chipLabel: 'EXCETO',
  },
  'CAPS / acolhimento em crise': {
    conceptFooter: 'Agitação no CAPS: acolher e escutar antes de conter',
    goldenContent: 'ACOLHER → ESCUTAR → ESTRATÉGIAS NÃO COERCITIVAS',
    goldenFooter: 'Resistência não é insubordinação — é sinal de sofrimento',
    logicFooter: 'De-escalada verbal → acolhimento → contenção só se necessário',
    logicFix: 'na prova, agitação pede de-escalada verbal antes de contenção',
    dangerContent: 'PEGADINHAS — AGITAÇÃO NO CAPS',
    dangerFooter: () => 'Segurança sim — mas contenção não é o primeiro passo',
    chipLabel: 'CRISE',
  },
  'De-escalada / agitação': {
    conceptFooter: 'Crise aguda: comunicação calma, ambiente seguro e equipe — contenção é exceção',
    goldenContent: 'DE-ESCALADA: CALMA + AMBIENTE + EQUIPE — NÃO CONFRONTAR',
    goldenFooter: 'A banca induz contenção imediata ou confronto como “segurança”',
    logicFooter: 'Acolher → proteger ambiente → acionar equipe → contenção só se esgotadas alternativas',
    logicFix: 'técnico não ignora crise nem contenha sem avaliação multiprofissional',
    dangerContent: 'PEGADINHAS — AGITAÇÃO E DE-ESCALADA',
    dangerFooter: (id) => `Comunicação calma e equipe fecham letra ${id}`,
    chipLabel: 'DE-ESCALADA',
  },
  'Delirium / cuidado crítico': {
    conceptFooter: 'Delirium na UTI: monitorar sedação, escalas (RASS) e mobilização precoce',
    goldenContent: 'DELIRIUM: PAUSA SEDAÇÃO + ESCALA + COMUNICAÇÃO COM A EQUIPE',
    goldenFooter: 'Sedação contínua sem avaliação aumenta risco de delirium',
    logicFooter: 'Pausa diária da sedação + RASS + reportar alterações à equipe',
    logicFix: 'agitação em UTI exige reavaliar sedação — não apenas aumentar dose',
    dangerContent: 'PEGADINHAS — DELIRIUM NA UTI',
    dangerFooter: (id) => `Protocolo de sedação e delirium fecha letra ${id}`,
    chipLabel: 'UTI',
  },
  'APS / acolhimento em saúde mental': {
    conceptFooter: 'APS: acolhimento, escuta e articulação com a RAPS — não só encaminhar',
    goldenContent: 'APS + SAÚDE MENTAL: ACOLHER · ESCUTAR · ARTICULAR REDE',
    goldenFooter: 'Medicação isolada ou encaminhamento automático são pegadinhas',
    logicFooter: 'Técnico na APS participa de acolhimento e cuidado compartilhado',
    logicFix: 'saúde mental na APS é trabalho cotidiano — não exclusividade do CAPS',
    dangerContent: 'PEGADINHAS — SAÚDE MENTAL NA APS',
    dangerFooter: (id) => `Acolhimento e articulação com a rede fecham letra ${id}`,
    chipLabel: 'APS',
  },
  'Certo ou errado — de-escalada': {
    conceptFooter: 'Surto psicótico: de-escalada verbal calma antes de contenção',
    goldenContent: 'SURTO: COMUNICAÇÃO VERBAL CALMA — ÚLTIMO RECURSO = CONTENÇÃO',
    goldenFooter: 'Assertiva certa quando prioriza abordagem não violenta',
    logicFooter: 'Julgar se a conduta respeita humanização e de-escalada',
    logicFix: 'comunicação verbal calma é primeira estratégia em crise psíquica',
    dangerContent: 'PEGADINHAS — CERTO OU ERRADO EM CRISE',
    dangerFooter: (id) => `De-escalada verbal alinhada ao protocolo fecha letra ${id}`,
    chipLabel: 'C/E',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function slideMeta(topico: string, subtopico: string): { topico: string; subtopico: string } {
  return { topico, subtopico };
}

function topicProfile(topic: CriseRamoTopic): TopicProfile {
  return TOPIC_PROFILES[topic];
}

function isExcetoCommand(instruction: string): boolean {
  const blob = instruction.toLowerCase();
  return (
    /\bexceto\b/.test(blob) ||
    /\bincorreta\b/.test(blob) ||
    /\bincorreto\b/.test(blob) ||
    /\bnão (se aplica|constitui)\b/.test(blob) ||
    /\bnao (se aplica|constitui)\b/.test(blob)
  );
}

function isCriseAnchor(blob: string): boolean {
  return (
    /\bagita[çc]|conten[çc]|violência iminente|violencia iminente|de-escal|surto psic[oó]tico|surto psicotico|comportamento agressivo|delirium|delírio|sedação contínua|sedacao continua/.test(
      blob,
    ) || /\bcaps\b|centro de atenção psicossocial|centro de atencao psicossocial/.test(blob)
  );
}

export function isSaudeMentalSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'saúde mental' || n === 'saude mental';
}

export function normalizeSaudeMentalInstruction(instruction: string): string {
  return normalizeCurativosInstruction(instruction)
    .replace(/\n?\d{3,4}\)\s*(\d{3,4}\)\s*)*/g, '')
    .replace(/\(\s*\d{3,4}\s*\)/g, '')
    .trim();
}

/** Infere tópico do ramo SM-4; retorna null se fora do escopo do piloto. */
export function inferSaudeMentalCriseTopic(
  instruction: string,
  options: QuestionOption[],
  family = 'conceito',
): CriseRamoTopic | null {
  const instr = instruction.toLowerCase();
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (family === 'certo_errado' && /surto|de-escal|conten[çc]|agita[çc]|saúde mental|saude mental/.test(blob)) {
    return 'Certo ou errado — de-escalada';
  }

  if (!isCriseAnchor(blob) && !isExcetoCommand(instruction)) {
    return null;
  }

  if (isExcetoCommand(instruction) && /agita[çc]|violência iminente|violencia iminente|psicomotor/.test(blob)) {
    return 'EXCETO — agitação pré-violência';
  }

  if (/\bdelirium|delírio|sedacao continua|sedação contínua|\buti\b|paciente crítico|paciente critico|\brass\b/.test(blob)) {
    return 'Delirium / cuidado crítico';
  }

  if (
    /atenção primária|atencao primaria|atenção básica|atencao basica|\baps\b|assistência de enfermagem em saúde mental na atenção primária|assistencia de enfermagem em saude mental na atencao primaria/.test(
      instr,
    )
  ) {
    return 'APS / acolhimento em saúde mental';
  }

  if (
    /\bcaps\b|centro de atenção psicossocial|centro de atencao psicossocial/.test(instr) &&
    /agita[çc]|crise|acolh|recusa|desconfian/.test(blob)
  ) {
    return 'CAPS / acolhimento em crise';
  }

  if (/\bupa\b|pronto atendimento|agressivo|autoagress|de-escal|comunicação calma|comunicacao calma/.test(blob)) {
    return 'De-escalada / agitação';
  }

  if (/agita[çc]|conten[çc]|surto|crise ps[ií]quica|crise psiquica/.test(blob)) {
    return 'De-escalada / agitação';
  }

  return null;
}

export function saudeMentalGoldenReferenceForInput(
  instruction: string,
  options: QuestionOption[],
  family = 'conceito',
): string {
  const topic = inferSaudeMentalCriseTopic(instruction, options, family);
  if (topic === 'EXCETO — agitação pré-violência') return SAUDE_MENTAL_AGITACAO_EXCETO_GOLDEN_FILE;
  return SAUDE_MENTAL_CAPS_GOLDEN_FILE;
}

function inferAgitationSignLabel(text: string): string {
  const lower = text.toLowerCase();
  if (/caminhar/.test(lower)) return 'Sinal motor';
  if (/tensão|tensao|dentes/.test(lower)) return 'Tensão corporal';
  if (/impaciência|impaciencia/.test(lower)) return 'Comportamento';
  if (/segurar objeto/.test(lower)) return 'EXCETO';
  return truncate(text.split(/[,.;]/)[0] ?? text, 40);
}

function inferExcetoAgitationNote(wrongText: string, correctId: string): string {
  const lower = wrongText.toLowerCase();
  if (/caminhar/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'caminhar constante é sinal válido, não o EXCETO.');
  }
  if (/tensão|tensao/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'tensão muscular é sinal de agitação, não a exceção.');
  }
  if (/dentes/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'dentes cerrados é sinal de tensão, não o EXCETO.');
  }
  if (/impaciência|impaciencia/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'impaciência é sinal de agitação, não o EXCETO.');
  }
  return formatGabaritoCorrect(correctId, 'esta alternativa é sinal válido — marque a exceção.');
}

function inferCriseTrap(wrongText: string, correctText: string, correctId: string, topic: CriseRamoTopic): string {
  const lower = wrongText.toLowerCase();

  if (topic === 'EXCETO — agitação pré-violência') {
    return inferExcetoAgitationNote(wrongText, correctId);
  }

  if (/ignorar o paciente|abstendo-se|só o médico|so o medico|só o psicólogo|so o psicologo/.test(lower)) {
    return formatGabaritoCorrect(
      correctId,
      'técnico participa do acolhimento inicial — não se abstém da crise agitada.',
    );
  }
  if (/conten[çc].*segurança|contenc.*seguranca|imobiliz|amarr/.test(lower) && !/após|apos|depois/.test(lower)) {
    return formatGabaritoCorrect(
      correctId,
      'contenção imediata sem avaliação da equipe — priorize escuta e ambiente seguro.',
    );
  }
  if (/registrar.*após|registrar.*apos|após a contenção|apos a contencao/.test(lower)) {
    return formatGabaritoCorrect(
      correctId,
      'técnico participa da abordagem inicial — registro não substitui de-escalada.',
    );
  }
  if (/conten[çc]|imobiliz|amarr|restri[çc]ão física|restricao fisica|segurança.*imediata/.test(lower)) {
    return formatGabaritoCorrect(
      correctId,
      'contenção imediata como padrão — priorize escuta e acolhimento não coercitivo.',
    );
  }
  if (/insubordina|disciplinar|puni/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'resistência exige acolhimento, não punição disciplinar.');
  }
  if (/ignorar|abstendo|não é atribuição|nao e atribuicao/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'técnico participa do acolhimento e registro em saúde mental.');
  }
  if (/confront|elevar o tom|autoridade|polícia|policia|expor.*histórico/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'postura não confrontativa e comunicação calma são a primeira linha.');
  }
  if (/só medica|so medica|exclusivamente.*procedimento|sem equipe|sem família|sem familia/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'cuidado em saúde mental é multiprofissional e inclui vínculo.');
  }
  if (/encaminh.*direto|só caps|so caps|hospital psiquiátrico|hospital psiquiatrico/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'APS acolhe e articula com a rede — não encaminha tudo automaticamente.');
  }
  if (/psicofármaco.*primeira|psicofarmaco.*primeira|medicação.*primeira linha/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'acolhimento e intervenções psicossociais precedem medicação isolada.');
  }
  if (/sedação ininterrupta|sedacao ininterrupta|12 horas|sem escalas/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'pausa da sedação e escalas validadas (RASS) previnem delirium.');
  }
  if (/mobilização precoce|mobilizacao precoce/.test(lower) && /restringir|desconsiderar/.test(lower)) {
    return formatGabaritoCorrect(correctId, 'mobilização precoce e reavaliação da sedação fazem parte do protocolo.');
  }

  const snippet = truncate(wrongText.split(/[,.;]/)[0] ?? wrongText, 120);
  const correctSnippet = truncate(correctText.split(/[,.;]/)[0] ?? correctText, 80);
  return formatGabaritoCorrect(correctId, `prefira ${correctSnippet} — não ${snippet}.`);
}

function buildExcetoAgitationConceptItems(
  input: BuildSaudeMentalSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const wrong = input.options.filter((o) => !o.is_correct);
  return [
    {
      label: 'Comando',
      detail: 'EXCETO: quatro alternativas são sinais de agitação pré-violência — uma não se encaixa.',
      icon: 'AlertTriangle',
    },
    ...wrong.slice(0, 3).map((opt) => ({
      label: inferAgitationSignLabel(opt.text),
      detail: truncate(opt.text, 500),
      icon: 'Activity' as const,
    })),
    {
      label: `EXCETO — letra ${correct.id}`,
      detail: truncate(correct.text, 500),
      icon: 'XCircle',
    },
    {
      label: 'Gabarito',
      detail: `Letra ${correct.id} — ${truncate(correct.text, 200)}`,
      icon: 'Target',
    },
  ];
}

function buildCapsConceptItems(
  input: BuildSaudeMentalSlidesInput,
  correct: QuestionOption,
  topic: CriseRamoTopic,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(normalizeSaudeMentalInstruction(input.instruction).replace(/\s+/g, ' '), 500);
  const items: { label: string; detail: string; icon: string }[] = [
    {
      label: 'ENQUADRAMENTO',
      detail: preview,
      icon: 'Heart',
    },
  ];

  if (topic === 'CAPS / acolhimento em crise') {
    items.push(
      {
        label: 'Primeira linha',
        detail: 'Escuta qualificada, acolhimento e comunicação terapêutica — estratégias não coercitivas.',
        icon: 'MessageCircle',
      },
      {
        label: 'Contenção física',
        detail: 'Não é medida padrão imediata — último recurso quando esgotadas alternativas.',
        icon: 'Ban',
      },
    );
  } else if (topic === 'De-escalada / agitação') {
    items.push(
      {
        label: 'Comunicação',
        detail: 'Tom calmo, postura não confrontativa e ambiente mais reservado.',
        icon: 'MessageCircle',
      },
      {
        label: 'Equipe',
        detail: 'Acionar enfermeiro e médico — técnico não atua isolado na crise.',
        icon: 'Users',
      },
    );
  } else if (topic === 'Delirium / cuidado crítico') {
    items.push(
      {
        label: 'Sedação',
        detail: 'Pausa diária da sedação e uso de escalas (RASS) com comunicação à equipe.',
        icon: 'Activity',
      },
      {
        label: 'Delirium',
        detail: 'Agitação em UTI exige reavaliar sedação — não apenas aumentar dose.',
        icon: 'Brain',
      },
    );
  } else {
    items.push(
      {
        label: 'Acolhimento APS',
        detail: 'Escuta qualificada, intervenções breves e articulação com a RAPS.',
        icon: 'Heart',
      },
      {
        label: 'Rede',
        detail: 'Cuidado compartilhado — não encaminhamento automático para todos os casos.',
        icon: 'Network',
      },
    );
  }

  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'CheckCircle',
  });
  return items.slice(0, 20);
}

function buildGoldenRows(
  topic: CriseRamoTopic,
  options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  const prof = topicProfile(topic);

  if (topic === 'EXCETO — agitação pré-violência') {
    return [
      { label: 'Motor', value: 'Caminhar constante, hiperatividade', badge: 'ok' },
      { label: 'Tensão', value: 'Tensão muscular, dentes cerrados', badge: 'ok' },
      { label: 'Comportamento', value: 'Impaciência, inquietação', badge: 'ok' },
      {
        label: 'EXCETO',
        value: truncate(correct.text, 500),
        emphasis: 'alert',
        badge: 'warn',
      },
      { label: 'Gabarito', value: `Letra ${correct.id}`, emphasis: 'success', badge: 'hot' },
    ];
  }

  if (topic === 'CAPS / acolhimento em crise' || topic === 'De-escalada / agitação') {
    return [
      {
        label: '1ª resposta',
        value: 'Escuta qualificada e comunicação terapêutica',
        emphasis: 'highlight',
        badge: 'hot',
      },
      {
        label: 'Contenção',
        value: 'Último recurso — não padrão imediato na agitação',
        emphasis: 'alert',
        badge: 'warn',
      },
      {
        label: 'Papel do técnico',
        value: 'Vínculo, orientação e articulação com a equipe',
        badge: 'ok',
      },
      { label: 'Gabarito', value: `Letra ${correct.id}`, emphasis: 'success', badge: 'hot' },
    ];
  }

  if (topic === 'Delirium / cuidado crítico') {
    return [
      {
        label: 'Monitorização',
        value: 'Pausa diária da sedação + escala RASS',
        emphasis: 'highlight',
        badge: 'hot',
      },
      {
        label: 'Comunicação',
        value: 'Reportar agitação e alterações respiratórias à equipe',
        badge: 'ok',
      },
      { label: 'Gabarito', value: `Letra ${correct.id}`, emphasis: 'success', badge: 'hot' },
    ];
  }

  if (topic === 'APS / acolhimento em saúde mental') {
    return [
      {
        label: 'APS',
        value: 'Acolhimento, escuta e intervenções breves na atenção primária',
        emphasis: 'highlight',
        badge: 'hot',
      },
      {
        label: 'Rede',
        value: 'Articulação com CAPS e RAPS conforme complexidade',
        badge: 'ok',
      },
      { label: 'Gabarito', value: `Letra ${correct.id}`, emphasis: 'success', badge: 'hot' },
    ];
  }

  return [
    {
      label: 'Princípio',
      value: truncate(prof.goldenContent, 500),
      emphasis: 'highlight',
      badge: 'hot',
    },
    ...options
      .filter((o) => !o.is_correct)
      .slice(0, 3)
      .map((opt) => ({
        label: `Letra ${opt.id}`,
        value: truncate(opt.text, 500),
        emphasis: 'alert' as const,
        badge: 'warn' as const,
      })),
    { label: 'Gabarito', value: `Letra ${correct.id}`, emphasis: 'success', badge: 'hot' },
  ];
}

function buildLogicSteps(
  input: BuildSaudeMentalSlidesInput,
  topic: CriseRamoTopic,
  correct: QuestionOption,
): string[] {
  const prof = topicProfile(topic);
  const instruction = normalizeSaudeMentalInstruction(input.instruction);
  const preview = truncate(instruction.replace(/\s+/g, ' '), 120);
  const wrong = input.options.filter((o) => !o.is_correct);

  if (topic === 'EXCETO — agitação pré-violência') {
    return [
      `Comando EXCETO: sinais de agitação pré-violência — marque o que NÃO é sinal.`,
      ...wrong.map(
        (opt) => `${opt.id} — ${truncate(opt.text, 60)}: sinal válido de agitação (não é o EXCETO).`,
      ),
      `${correct.id} — ${truncate(correct.text, 60)}: não se encaixa como sinal típico nesta questão.`,
      `Marcar letra ${correct.id}.`,
      `Fixação: ${prof.logicFix}.`,
    ].slice(0, 15);
  }

  const steps = [
    topic === 'Certo ou errado — de-escalada'
      ? `Ler a assertiva: ${preview}.`
      : `Cenário: ${preview}.`,
    `Princípio: ${prof.goldenContent}.`,
    ...wrong.map(
      (opt) =>
        `Eliminar ${opt.id}: ${truncate(opt.text, 70)} — ${truncate(inferCriseTrap(opt.text, correct.text, correct.id, topic).replace(/^Gabarito letra [A-E] — /i, ''), 80)}.`,
    ),
    `Marcar ${correct.id}: ${truncate(correct.text, 100)}.`,
    `Fixação: ${prof.logicFix}.`,
  ];
  return steps.slice(0, 15);
}

function buildDangerItems(
  options: QuestionOption[],
  correct: QuestionOption,
  topic: CriseRamoTopic,
): DangerZoneItem[] {
  const wrong = options.filter((o) => !o.is_correct);

  if (topic === 'EXCETO — agitação pré-violência') {
    return wrong.slice(0, 4).map((opt) => ({
      label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
      detail: truncate(opt.text, 500),
      correct: inferExcetoAgitationNote(opt.text, correct.id),
    }));
  }

  return wrong.map((opt) => ({
    label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
    detail: truncate(opt.text, 500),
    correct: inferCriseTrap(opt.text, correct.text, correct.id, topic),
  }));
}

function buildCriseChoiceSlides(
  input: BuildSaudeMentalSlidesInput,
  topic: CriseRamoTopic,
): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Saúde Mental crise: gabarito ausente');

  const prof = topicProfile(topic);
  const meta = slideMeta(input.topico, input.subtopico);

  const conceptItems =
    topic === 'EXCETO — agitação pré-violência'
      ? buildExcetoAgitationConceptItems(input, correct)
      : buildCapsConceptItems(input, correct, topic);

  return [
    {
      type: 'concept_map',
      slide_title: truncate(
        topic === 'EXCETO — agitação pré-violência'
          ? 'Agitação psicomotora — comando EXCETO'
          : `${topic} — mapa da prova`,
        120,
      ),
      chip_label: prof.chipLabel,
      meta,
      items: conceptItems,
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: truncate(
        topic === 'EXCETO — agitação pré-violência'
          ? 'Sinais de agitação — referência'
          : topic === 'CAPS / acolhimento em crise'
            ? 'Crise psíquica — ordem de conduta'
            : `Referência — ${topic.toLowerCase()}`,
        120,
      ),
      chip_label: 'REGRA DE OURO',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: buildGoldenRows(topic, input.options, correct).slice(0, 12),
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
      chip_label: 'PASSO A PASSO',
      meta,
      reveal_mode: 'tap',
      steps: buildLogicSteps(input, topic, correct),
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: truncate(
        topic === 'CAPS / acolhimento em crise'
          ? 'Armadilhas — agitação e contenção'
          : 'Armadilhas que a banca monta',
        120,
      ),
      chip_label: 'ARMADILHAS',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: buildDangerItems(input.options, correct, topic).slice(0, 10),
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

function buildCertoErradoSlides(input: BuildSaudeMentalSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Saúde Mental CE: gabarito ausente');

  const topic: CriseRamoTopic = 'Certo ou errado — de-escalada';
  const prof = topicProfile(topic);
  const meta = slideMeta(input.topico, input.subtopico);
  const statement = truncate(input.instruction.replace(/\s+/g, ' '), 500);
  const isStatementTrue = /certo/i.test(correct.text ?? '');

  return [
    {
      type: 'concept_map',
      slide_title: 'Surto psicótico — certo ou errado',
      chip_label: prof.chipLabel,
      meta,
      items: [
        { label: 'Assertiva', detail: statement, icon: 'FileText' },
        {
          label: isStatementTrue ? 'Verdadeira' : 'Falsa',
          detail: isStatementTrue
            ? 'De-escalada verbal calma alinha-se às boas práticas em saúde mental.'
            : 'A assertiva contraria acolhimento e de-escalada na crise.',
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
      slide_title: 'Julgamento da assertiva',
      chip_label: 'REGRA DE OURO',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: [
        {
          label: 'Assertiva',
          value: statement,
          badge: 'info',
        },
        {
          label: 'Julgamento',
          value: isStatementTrue
            ? 'Certo — de-escalada verbal como primeira estratégia'
            : 'Errado — conduta inadequada na crise psíquica',
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
      slide_title: 'Como resolver — certo ou errado',
      chip_label: 'PASSO A PASSO',
      meta,
      reveal_mode: 'tap',
      steps: buildLogicSteps(input, topic, correct),
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: 'Armadilhas — certo ou errado',
      chip_label: 'ARMADILHAS',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: [
        {
          label: 'Confundir contenção com primeira linha',
          detail: 'A banca testa se você prioriza restrição em vez de comunicação calma.',
          correct: formatGabaritoCorrect(
            correct.id,
            'de-escalada verbal calma é primeira estratégia — contenção é exceção.',
          ),
        },
        {
          label: 'Marcar pelo “parece correto”',
          detail: 'Sem protocolo de crise, a pegadinha parece plausível.',
          correct: formatGabaritoCorrect(
            correct.id,
            'surto psicótico exige abordagem humanizada e não violenta.',
          ),
        },
      ],
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

function buildVfSlides(input: BuildSaudeMentalSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const assertives = resolveCurativosAssertives(input.instruction, correct);
  if (assertives.length < 2 || !correct) {
    throw new Error('Saúde Mental VF: afirmativas insuficientes');
  }
  const topic = inferSaudeMentalCriseTopic(input.instruction, input.options) ?? 'De-escalada / agitação';
  return buildCriseChoiceSlides(input, topic);
}

export function canBuildSaudeMentalVfSlides(instruction: string): boolean {
  return extractCurativosAssertives(normalizeSaudeMentalInstruction(instruction)).length >= 2;
}

export function canBuildSaudeMentalPremiumSlides(
  instruction: string,
  options: QuestionOption[],
  family: string,
): boolean {
  if (!isCriseAnchor(`${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase()) && family !== 'certo_errado') {
    if (!isExcetoCommand(instruction)) return false;
  }
  return inferSaudeMentalCriseTopic(instruction, options, family) !== null;
}

export function buildSaudeMentalPremiumSlidesForFamily(
  input: BuildSaudeMentalSlidesInput,
  family: string,
): SlideRecord[] {
  if (family === 'certo_errado') {
    return buildCertoErradoSlides(input);
  }
  if (canBuildSaudeMentalVfSlides(input.instruction)) {
    return buildVfSlides(input);
  }
  const topic = inferSaudeMentalCriseTopic(input.instruction, input.options, family);
  if (!topic) throw new Error('Saúde Mental: tópico fora do ramo SM-4');
  return buildCriseChoiceSlides(input, topic);
}

export function buildSaudeMentalPremiumSlides(input: BuildSaudeMentalSlidesInput): SlideRecord[] {
  return buildSaudeMentalPremiumSlidesForFamily(input, 'conceito');
}
