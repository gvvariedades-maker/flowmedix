import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
} from '@/lib/validations';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';
import {
  classifyFamily,
  FAMILY_GOLDEN_FILE,
  FAMILY_LABELS,
  type FamilyId,
  type QuestionOption,
} from '@/lib/catalogMigration/classifyFamily';
import { getFamilyLayoutProfile } from '@/lib/catalogMigration/familyLayoutProfile';

const GENERIC_MARKERS = [
  'relacione o tema',
  'ponto 1',
  'ponto 2',
  'erros comuns',
  'conceito central',
  'regra essencial',
  'seleção do antígeno',
  'processamento e purificação',
  'tema da questão',
  'gabarito desta prova',
  'critério de prova',
  '[ia] enriquecer concept_map',
];

export type UpgradeChangeCode =
  | 'danger_zone'
  | 'logic_flow'
  | 'concept_map'
  | 'golden_rule'
  | 'slides_reordered';

export type UpgradePremiumHybridOptions = {
  /** Atualiza mesmo quando slides não são genéricos. */
  force?: boolean;
  /** Mantém concept_map / golden_rule existentes se não forem genéricos. */
  preserveRichSlides?: boolean;
  /** Só reconstrói danger_zone + logic_flow (estrutural). */
  dangerOnly?: boolean;
};

export type UpgradePremiumHybridResult = {
  changed: boolean;
  skipped: boolean;
  skipReason?: string;
  family: FamilyId;
  familyLabel: string;
  goldenReference: string;
  genericBefore: boolean;
  changes: UpgradeChangeCode[];
  payload: Record<string, unknown>;
  zodValid: boolean;
  zodMessage?: string;
  tecconcursos: boolean;
};

type SlideRecord = Record<string, unknown>;

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function slideMeta(topico: string, subtopico: string): { topico: string; subtopico: string } {
  return { topico, subtopico };
}

export function isGenericSlideText(text: string): boolean {
  const lower = text.toLowerCase();
  return GENERIC_MARKERS.some((m) => lower.includes(m));
}

export function hasGenericSlides(slides: unknown): boolean {
  if (!Array.isArray(slides) || slides.length === 0) return true;
  const txt = JSON.stringify(slides).toLowerCase();
  return GENERIC_MARKERS.some((m) => txt.includes(m));
}

function findSlide(slides: SlideRecord[], type: string): SlideRecord | undefined {
  return slides.find((s) => s.type === type);
}

function isSlideGeneric(slide: SlideRecord | undefined): boolean {
  if (!slide) return true;
  return isGenericSlideText(JSON.stringify(slide));
}

function extractAssertives(instruction: string): string[] {
  const items: string[] = [];
  const re = /([IVX]+)\s*[-–]\s*([^\n]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(instruction)) !== null) {
    items.push(`${match[1].toUpperCase()} — ${match[2].trim()}`);
  }
  return items.slice(0, 4);
}

export function buildDangerZoneFromOptions(input: {
  options: QuestionOption[];
  subtopico: string;
  family: FamilyId;
  instructionPreview?: string;
}): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const wrong = input.options.filter((o) => !o.is_correct);
  const correctId = correct?.id ?? '?';
  const correctText = correct?.text?.trim() ?? 'gabarito da prova';

  const items = wrong.map((opt) => ({
    label: truncate(`Letra ${opt.id} — ${opt.text}`, 200),
    detail: truncate(opt.text, 500),
    correct: truncate(`Gabarito: letra ${correctId} — ${correctText}`, 500),
  }));

  if (input.family === 'certo_errado' && wrong.length === 1) {
    items[0] = {
      label: truncate(`Marcar “${wrong[0].text}”`, 200),
      detail: truncate(
        `A afirmativa do enunciado exige julgamento Certo/Errado — esta letra não é o gabarito.`,
        500,
      ),
      correct: truncate(`Gabarito: ${correct?.text ?? correctId} — ${correctText}`, 500),
    };
  }

  if (items.length < 10 && input.family !== 'certo_errado') {
    items.push({
      label: 'Marcar sem testar todas as letras',
      detail: 'Eliminar distratoras pelo texto literal de cada alternativa antes de confirmar.',
      correct: truncate(
        `Conferir gabarito ${correctId} — “${correctText}” — contra o enunciado.`,
        500,
      ),
    });
  }

  const familyShort = FAMILY_LABELS[input.family].split('/')[0].trim().toUpperCase();

  return {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    content: truncate(`PEGADINHAS — ${input.subtopico.toUpperCase()} (${familyShort})`, 1000),
    items: items.slice(0, 10),
    footer_rule: truncate(
      `Compare cada alternativa da prova com o gabarito letra ${correctId} antes de marcar.`,
      500,
    ),
  };
}

export function buildLogicFlowFromOptions(input: {
  instruction: string;
  options: QuestionOption[];
  subtopico: string;
  family: FamilyId;
}): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const wrong = input.options.filter((o) => !o.is_correct);
  const correctId = correct?.id ?? '?';
  const correctText = correct?.text?.trim() ?? '';
  const preview = truncate(input.instruction.replace(/\s+/g, ' '), 120);

  const steps: string[] = [];

  if (input.family === 'vf') {
    steps.push(`Ler o comando V/F: “${preview}”.`);
    steps.push('Julgar cada afirmativa (I, II, III…) antes de olhar combinações nas letras.');
  } else if (input.family === 'certo_errado') {
    steps.push(`Ler a afirmativa do enunciado: “${preview}”.`);
    steps.push('Decidir se a afirmativa é Certa ou Errada conforme norma/conceito cobrado.');
  } else {
    steps.push(`Ler o comando: “${preview}”.`);
    steps.push(`Fixar o que a banca pede em ${input.subtopico}.`);
  }

  steps.push(
    truncate(
      `Identificar gabarito: letra ${correctId}${correctText ? ` — “${correctText}”` : ''}.`,
      500,
    ),
  );

  for (const opt of wrong) {
    steps.push(
      truncate(`Testar letra ${opt.id}: “${opt.text}” → eliminar (incorreta).`, 500),
    );
  }

  steps.push(`Marcar letra ${correctId}.`);
  steps.push(
    truncate(
      `Fixação: em ${input.subtopico}, elimine distratoras pelo texto literal das alternativas.`,
      500,
    ),
  );

  return {
    type: 'logic_flow',
    reveal_mode: 'tap',
    steps: steps.slice(0, 15),
    footer_rule: truncate(
      `Estratégia: enunciado → gabarito ${correctId} → eliminar ${wrong.map((o) => o.id).join('/')}`,
      500,
    ),
  };
}

function buildConceptMapStub(input: {
  instruction: string;
  options: QuestionOption[];
  topico: string;
  subtopico: string;
  family: FamilyId;
}): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const wrong = input.options.filter((o) => !o.is_correct);
  const assertives = extractAssertives(input.instruction);
  const instructionFlat = input.instruction.replace(/\s+/g, ' ');
  const base = {
    type: 'concept_map' as const,
    meta: slideMeta(input.topico, input.subtopico),
  };

  if (input.family === 'vf' && assertives.length >= 2) {
    return {
      ...base,
      items: assertives.map((line, i) => ({
        label: truncate(line.split('—')[0]?.trim() ?? `Item ${i + 1}`, 200),
        detail: truncate(line.split('—').slice(1).join('—').trim() || line, 500),
        icon: ['ListChecks', 'CheckCircle', 'AlertCircle', 'HelpCircle'][i] ?? 'Circle',
      })),
      footer_rule: 'Julgue I → II → III antes de montar a combinação nas letras A–E.',
    };
  }

  if (input.family === 'certo_errado') {
    return {
      ...base,
      items: [
        {
          label: 'Afirmativa da prova',
          detail: truncate(instructionFlat, 500),
          icon: 'FileText',
        },
        {
          label: 'Julgamento exigido',
          detail: 'Banca pede Certo ou Errado — não há alternativas A–E de conteúdo.',
          icon: 'Scale',
        },
        {
          label: 'Gabarito',
          detail: truncate(
            `Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`,
            500,
          ),
          icon: 'CheckCircle',
        },
      ],
      footer_rule: 'C/E: leia a afirmativa inteira antes de marcar.',
    };
  }

  if (input.family === 'calc') {
    return {
      ...base,
      items: [
        {
          label: 'Enunciado numérico',
          detail: truncate(instructionFlat.slice(0, 480), 500),
          icon: 'Calculator',
        },
        {
          label: 'Resposta da prova',
          detail: truncate(
            `Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`,
            500,
          ),
          icon: 'Equal',
        },
      ],
      footer_rule: 'Conferir unidade, fórmula e arredondamento antes de marcar.',
    };
  }

  if (input.family === 'protocolo') {
    return {
      ...base,
      items: [
        {
          label: 'Protocolo cobrado',
          detail: truncate(`${input.subtopico} — conduta / sequência de prova`, 500),
          icon: 'Activity',
        },
        {
          label: 'Parâmetro-chave',
          detail: truncate(instructionFlat.slice(0, 480), 500),
          icon: 'Gauge',
        },
        {
          label: 'Prioridade na prova',
          detail: 'Identifique o passo inicial e valores numéricos antes de olhar as letras.',
          icon: 'ArrowRight',
        },
        {
          label: 'Gabarito',
          detail: truncate(
            `Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`,
            500,
          ),
          icon: 'Target',
        },
      ],
      footer_rule: 'Protocolo: sequência e números literais da banca vencem “senso comum”.',
    };
  }

  if (input.family === 'legis') {
    return {
      ...base,
      items: [
        {
          label: 'Base legal',
          detail: 'Localizar lei, artigo ou norma citada no enunciado.',
          icon: 'Scale',
        },
        {
          label: 'Dispositivo em jogo',
          detail: truncate(instructionFlat.slice(0, 480), 500),
          icon: 'BookMarked',
        },
        {
          label: 'Gabarito',
          detail: truncate(
            `Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`,
            500,
          ),
          icon: 'CheckCircle',
        },
        {
          label: 'Confusão típica',
          detail: 'Princípios, competências ou artigos adjacentes — não trocar blocos da norma.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Legislação: artigo exato + princípio correto antes de marcar.',
    };
  }

  if (input.family === 'text_fragment') {
    return {
      ...base,
      items: [
        {
          label: 'Caso clínico',
          detail: truncate(instructionFlat.slice(0, 480), 500),
          icon: 'User',
        },
        {
          label: 'Comando',
          detail: 'Extrair o que a banca pede a partir do texto-base da prova.',
          icon: 'Search',
        },
        {
          label: 'Gabarito',
          detail: truncate(
            `Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`,
            500,
          ),
          icon: 'CheckCircle',
        },
      ],
      footer_rule: 'Leia o fragmento inteiro antes de eliminar alternativas.',
    };
  }

  return {
    ...base,
    items: [
      {
        label: 'Conceito cobrado',
        detail: truncate(`${input.subtopico} — ${FAMILY_LABELS[input.family]}`, 500),
        icon: 'Lightbulb',
      },
      {
        label: 'Comando da prova',
        detail: truncate(instructionFlat.slice(0, 480), 500),
        icon: 'FileText',
      },
      {
        label: 'Resposta certa',
        detail: truncate(
          `Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`,
          500,
        ),
        icon: 'CheckCircle',
      },
      {
        label: 'Distratores',
        detail: truncate(
          `${wrong.length} letras a eliminar: ${wrong.map((o) => o.id).join(', ')}`,
          500,
        ),
        icon: 'XCircle',
      },
    ],
    footer_rule: truncate(
      `Exclua por termo-chave antes de confirmar letra ${correct?.id ?? '?'}.`,
      500,
    ),
  };
}

function buildGoldenRuleStub(input: {
  subtopico: string;
  topico: string;
  family: FamilyId;
  correct?: QuestionOption;
}): SlideRecord {
  const layouts = getFamilyLayoutProfile(input.family);
  const gabarito = input.correct
    ? `Letra ${input.correct.id} — ${input.correct.text}`
    : 'Conferir alternativa correta';
  const meta = slideMeta(input.topico, input.subtopico);

  if (layouts.goldenRule === 'center' || layouts.goldenRule === 'minimal') {
    const content =
      input.family === 'vf'
        ? `MONTE A COMBINAÇÃO I → II → III ANTES DE OLHAR AS LETRAS — GABARITO: ${gabarito.toUpperCase()}`
        : layouts.goldenRule === 'minimal'
          ? truncate(`GABARITO: ${gabarito}`, 1000)
          : truncate(
              `FOCO EM PROVA — ${input.subtopico.toUpperCase()}: ${gabarito}`,
              1000,
            );

    return {
      type: 'golden_rule',
      meta,
      content,
      footer_rule: truncate(
        `Fixação: ${FAMILY_LABELS[input.family]} — ver ${FAMILY_GOLDEN_FILE[input.family]}`,
        500,
      ),
    };
  }

  if (layouts.goldenRule === 'banner') {
    return {
      type: 'golden_rule',
      meta,
      content: truncate(`PROTOCOLO DE PROVA — ${input.subtopico.toUpperCase()}`, 1000),
      footer_rule: truncate(`Gabarito desta questão: ${gabarito}`, 500),
    };
  }

  if (layouts.goldenRule === 'compact') {
    return {
      type: 'golden_rule',
      meta,
      content: truncate(
        `Leia o caso clínico completo — resposta: ${gabarito}`,
        1000,
      ),
      footer_rule: 'Caso clínico: dados do texto-base guiam a letra.',
    };
  }

  const rows = [
    {
      label: 'Família pedagógica',
      value: FAMILY_LABELS[input.family],
    },
    {
      label: 'Subtópico',
      value: input.subtopico,
    },
    {
      label: 'Gabarito',
      value: gabarito,
    },
  ];

  if (input.family === 'legis') {
    rows.push({
      label: '[IA] Dispositivo',
      value: 'Preencher artigo/lei cobrado nesta questão',
    });
  } else if (input.family === 'calc') {
    rows.push({
      label: '[IA] Fórmula',
      value: 'Preencher fórmula e exemplo numérico da prova',
    });
  }

  return {
    type: 'golden_rule',
    meta,
    content: truncate(`REFERÊNCIA — ${input.subtopico.toUpperCase()}`, 1000),
    rows,
    footer_rule: truncate(
      `[IA] Completar rows — ver ${FAMILY_GOLDEN_FILE[input.family]}`,
      500,
    ),
  };
}

function ensureFourSlides(slides: SlideRecord[]): SlideRecord[] {
  const order = ['concept_map', 'golden_rule', 'logic_flow', 'danger_zone'] as const;
  const byType = new Map(slides.map((s) => [s.type, s]));
  return order.map((type) => byType.get(type)!).filter(Boolean);
}

export function upgradePremiumHybrid(
  raw: unknown,
  options: UpgradePremiumHybridOptions = {},
): UpgradePremiumHybridResult {
  const preserveRichSlides = options.preserveRichSlides !== false && !options.force;
  const base =
    typeof raw === 'object' && raw !== null
      ? (normalizeQuestaoSlideArrays({ ...(raw as object) }) as Record<string, unknown>)
      : {};

  const meta = (base.meta ?? {}) as Record<string, unknown>;
  const questionData = (base.question_data ?? {}) as Record<string, unknown>;
  const instruction = String(questionData.instruction ?? '').trim();
  const textFragment = String(questionData.text_fragment ?? '').trim();
  const optionsList = Array.isArray(questionData.options)
    ? (questionData.options as QuestionOption[])
    : [];
  const topico = String(meta.topico ?? 'Enfermagem');
  const subtopico = String(meta.subtopico ?? topico);

  const family = classifyFamily(instruction, subtopico, optionsList, textFragment);
  const existingSlides = (
    Array.isArray(base.reverse_study_slides)
      ? base.reverse_study_slides
      : Array.isArray(base.study_slides)
        ? base.study_slides
        : []
  ) as SlideRecord[];

  const genericBefore = hasGenericSlides(existingSlides);
  const tecconcursos = payloadContainsTecconcursosReference(base);

  if (tecconcursos) {
    return {
      changed: false,
      skipped: true,
      skipReason: 'referência TecConcursos',
      family,
      familyLabel: FAMILY_LABELS[family],
      goldenReference: FAMILY_GOLDEN_FILE[family],
      genericBefore,
      changes: [],
      payload: base,
      zodValid: false,
      tecconcursos: true,
    };
  }

  const correctCount = optionsList.filter((o) => o.is_correct).length;
  if (optionsList.length === 0 || correctCount !== 1) {
    return {
      changed: false,
      skipped: true,
      skipReason:
        correctCount !== 1
          ? `gabarito ambíguo (${correctCount} corretas)`
          : 'sem alternativas',
      family,
      familyLabel: FAMILY_LABELS[family],
      goldenReference: FAMILY_GOLDEN_FILE[family],
      genericBefore,
      changes: [],
      payload: base,
      zodValid: QuestaoCompletaSchema.safeParse(base).success,
      tecconcursos: false,
    };
  }

  if (!options.force && !genericBefore) {
    return {
      changed: false,
      skipped: true,
      skipReason: 'slides já premium (use --force para sobrescrever)',
      family,
      familyLabel: FAMILY_LABELS[family],
      goldenReference: FAMILY_GOLDEN_FILE[family],
      genericBefore,
      changes: [],
      payload: base,
      zodValid: QuestaoCompletaSchema.safeParse(base).success,
      tecconcursos: false,
    };
  }

  const correct = optionsList.find((o) => o.is_correct);
  const changes: UpgradeChangeCode[] = [];

  const dangerZone = buildDangerZoneFromOptions({
    options: optionsList,
    subtopico,
    family,
    instructionPreview: instruction,
  });
  dangerZone.meta = slideMeta(topico, subtopico);
  changes.push('danger_zone');

  const logicFlow = buildLogicFlowFromOptions({
    instruction,
    options: optionsList,
    subtopico,
    family,
  });
  logicFlow.meta = slideMeta(topico, subtopico);
  changes.push('logic_flow');

  const existingConcept = findSlide(existingSlides, 'concept_map');
  const existingGolden = findSlide(existingSlides, 'golden_rule');

  let conceptMap: SlideRecord;
  if (
    options.dangerOnly &&
    existingConcept &&
    typeof existingConcept.type === 'string'
  ) {
    conceptMap = { ...existingConcept };
  } else if (preserveRichSlides && existingConcept && !isSlideGeneric(existingConcept)) {
    conceptMap = { ...existingConcept };
  } else {
    conceptMap = buildConceptMapStub({
      instruction,
      options: optionsList,
      topico,
      subtopico,
      family,
    });
    changes.push('concept_map');
  }

  let goldenRule: SlideRecord;
  if (
    options.dangerOnly &&
    existingGolden &&
    typeof existingGolden.type === 'string'
  ) {
    goldenRule = { ...existingGolden };
  } else if (preserveRichSlides && existingGolden && !isSlideGeneric(existingGolden)) {
    goldenRule = { ...existingGolden };
  } else {
    goldenRule = buildGoldenRuleStub({
      subtopico,
      topico,
      family,
      correct,
    });
    changes.push('golden_rule');
  }

  const nextSlides = ensureFourSlides([conceptMap, goldenRule, logicFlow, dangerZone]);

  const working: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
    reverse_study_slides: nextSlides,
  };
  delete working.study_slides;

  const parsed = QuestaoCompletaSchema.safeParse(working);

  return {
    changed: true,
    skipped: false,
    family,
    familyLabel: FAMILY_LABELS[family],
    goldenReference: FAMILY_GOLDEN_FILE[family],
    genericBefore,
    changes,
    payload: working,
    zodValid: parsed.success,
    zodMessage: parsed.success
      ? undefined
      : parsed.error.issues
          .slice(0, 2)
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
    tecconcursos: false,
  };
}
