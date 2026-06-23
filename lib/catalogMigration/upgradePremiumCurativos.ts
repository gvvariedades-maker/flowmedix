import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';

export const CURATIVOS_GOLDEN_FILE = 'questao-premium-cpcon-curativos-lpp-prevencao-vf.json';

type SlideRecord = Record<string, unknown>;

type DangerZoneItem = { label: string; detail: string; correct: string };

export type CurativosAssertive = {
  roman: string;
  text: string;
  isTrue: boolean;
};

export type BuildCurativosSlidesInput = {
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

export function isCurativosSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'curativos e manejo de feridas' ||
    n === 'curativos' ||
    n === 'manejo de feridas'
  );
}

export function normalizeCurativosInstruction(instruction: string): string {
  return instruction
    .replace(/\r\n/g, '\n')
    .replace(/([IVX]+)\s*\n+\s*[-–]\s*/gi, '$1- ')
    .replace(/([IVX]+)\s*\.\s+/gi, '$1- ')
    .replace(/É\s*\n+\s*CORRETO/gi, 'É CORRETO')
    .replace(/CORRETO\s*\n+\s*o que se afirma/gi, 'CORRETO o que se afirma');
}

/** Extrai afirmativas I / II / III / IV do enunciado. */
const ROMAN_BY_INDEX = ['I', 'II', 'III', 'IV', 'V'] as const;

function extractParenAssertives(instruction: string): { roman: string; text: string }[] {
  const normalized = normalizeCurativosInstruction(instruction);
  const re = /\(__\)\s*([^\n]+)/gi;
  const texts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(normalized)) !== null) {
    const text = match[1].trim();
    if (text) texts.push(text);
  }
  return texts.slice(0, 5).map((text, index) => ({
    roman: ROMAN_BY_INDEX[index] ?? String(index + 1),
    text,
  }));
}

/** Gabarito no formato F, V, F, V (comum em SV e curativos). */
export function parseVfFlagsFromGabarito(correctText: string, count: number): boolean[] | null {
  const tokens = correctText.toUpperCase().match(/\b[VF]\b/g);
  if (!tokens || tokens.length < count) return null;
  return tokens.slice(0, count).map((t) => t === 'V');
}

export function extractCurativosAssertives(instruction: string): CurativosAssertive[] {
  const normalized = normalizeCurativosInstruction(instruction);
  const re = /([IVX]+)\s*[-–]\s*([^\n]+)/gi;
  const raw: { roman: string; text: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(normalized)) !== null) {
    raw.push({ roman: match[1].toUpperCase(), text: match[2].trim() });
  }
  const fromRoman = raw.slice(0, 4).map((item) => ({ ...item, isTrue: false }));
  if (fromRoman.length >= 2) return fromRoman;

  const fromParen = extractParenAssertives(instruction);
  return fromParen.slice(0, 4).map((item) => ({ ...item, isTrue: false }));
}

/** Romanos presentes no texto da alternativa correta (ordem IV→I evita falso positivo). */
export function parseTrueNumeralsFromGabarito(
  correctText: string,
  assertives: { roman: string }[],
): Set<string> {
  const text = correctText.toUpperCase();
  const found = new Set<string>();
  const order = ['IV', 'III', 'II', 'I'] as const;
  for (const id of order) {
    if (!assertives.some((a) => a.roman === id)) continue;
    if (new RegExp(`\\b${id}\\b`).test(text)) found.add(id);
  }
  return found;
}

export function resolveCurativosAssertives(
  instruction: string,
  correctOption?: QuestionOption,
): CurativosAssertive[] {
  const assertives = extractCurativosAssertives(instruction);
  if (assertives.length === 0) return assertives;

  const vfFlags = parseVfFlagsFromGabarito(correctOption?.text ?? '', assertives.length);
  if (vfFlags) {
    return assertives.map((a, index) => ({ ...a, isTrue: vfFlags[index] ?? false }));
  }

  const trueSet = parseTrueNumeralsFromGabarito(correctOption?.text ?? '', assertives);
  return assertives.map((a) => ({ ...a, isTrue: trueSet.has(a.roman) }));
}

function inferTopicFromInstruction(instruction: string): string {
  const lower = instruction.toLowerCase();
  const isLppFraming =
    /lesão por pressão|lesao por pressao|\blpp\b|evitar a ocorrência de lesão|prevenção de lesão/.test(
      lower,
    );

  if (!isLppFraming && /estágio|estagio|necrose|granulação|esfacelo/.test(lower)) {
    return 'Estágios da ferida';
  }
  if (isLppFraming || /acamado|proeminência|calcanhar/.test(lower)) {
    return 'Prevenção de LPP';
  }
  if (/exsudato|hidrocoloide|alginato|oclusiv|gaze|cobertura|curativo/.test(lower)) {
    return 'Cobertura e curativos';
  }
  if (/limpeza|sf|soro fisiológico|antisséptico|álcool/.test(lower)) return 'Limpeza do leito';
  return 'Curativos e feridas';
}

type TopicProfile = {
  conceptFooter: string;
  goldenFooter: string;
  logicFooter: string;
  logicFix: string;
  choiceLogicFix: string;
  choiceGoldenFooter: string;
  choiceDangerFooter: (correctId: string) => string;
  dangerFooter: (combo: string, falseRomans: string[]) => string;
};

const TOPIC_PROFILES: Record<string, TopicProfile> = {
  'Prevenção de LPP': {
    conceptFooter:
      'Prevenção de LPP = alívio de pressão + pele seca + pH adequado + sem massagem em proeminências',
    goldenFooter: 'Na LPP, a banca inverte úmido/seco e inclui massagem como se fosse cuidado',
    logicFooter: 'Raciocínio seguro: alívio de pressão + pH neutro, sem úmido nem massagem',
    logicFix: 'em LPP, úmido e massagem em proeminência são pegadinhas clássicas',
    choiceLogicFix:
      'em LPP, elimine distratoras pelo texto literal — pele seca e sem massagem em proeminências',
    choiceGoldenFooter: 'Na LPP, a banca adora condicionais errados e biossegurança frouxa',
    choiceDangerFooter: (id) => `Compare cada alternativa com a letra ${id} antes de marcar`,
    dangerFooter: (combo, falseRomans) =>
      falseRomans.length >= 2
        ? `Banca costuma errar na ${falseRomans.slice(0, 2).join(' e ')} — gabarito fica em ${combo}`
        : `Conferir gabarito ${combo} após julgar cada afirmativa`,
  },
  'Estágios da ferida': {
    conceptFooter: 'Relacione cada estágio ao tecido: granulação, esfacelo ou necrose',
    goldenFooter: 'Estágio I: eritema não branqueável; IV: exposição de osso/tendão',
    logicFooter: 'Classifique o estágio pela profundidade e pelo tecido visível',
    logicFix: 'a banca troca a ordem dos estágios e o tipo de tecido',
    choiceLogicFix: 'relacione estágio × tecido antes de eliminar distratoras',
    choiceGoldenFooter: 'A banca confunde estágios e tipos de tecido no leito',
    choiceDangerFooter: (id) => `Confirme estágio × tecido antes de marcar letra ${id}`,
    dangerFooter: (combo) => `Confirme estágio × tecido antes de fechar ${combo}`,
  },
  'Cobertura e curativos': {
    conceptFooter: 'Escolha a cobertura pelo exsudato e pela fase da ferida',
    goldenFooter: 'Exsudato alto → alginato/espuma; baixo → hidrocoloide/filme',
    logicFooter: 'Combine exsudato + fase da ferida + objetivo da cobertura',
    logicFix: 'a banca troca a cobertura pelo nível de exsudato',
    choiceLogicFix: 'combine exsudato + fase da ferida antes de eliminar distratoras',
    choiceGoldenFooter: 'A banca troca cobertura pelo nível de exsudato',
    choiceDangerFooter: (id) => `Cobertura certa para o exsudato fecha letra ${id}`,
    dangerFooter: (combo) => `Cobertura certa para o exsudato fecha ${combo}`,
  },
  'Limpeza do leito': {
    conceptFooter: 'SF 0,9% é o padrão; antissépticos citotóxicos são exceção',
    goldenFooter: 'Álcool e iodo no leito são pegadinhas — SF 0,9% limpa sem citotoxicidade',
    logicFooter: 'Limpe do menos para o mais contaminado, com SF 0,9%',
    logicFix: 'a banca inverte o sentido da limpeza e troca SF por antisséptico',
    choiceLogicFix: 'limpe do menos para o mais contaminado — SF 0,9% é o padrão',
    choiceGoldenFooter: 'A banca testa técnica de limpeza e antisséptico no leito',
    choiceDangerFooter: (id) => `Técnica de limpeza correta fecha letra ${id}`,
    dangerFooter: (combo) => `Técnica de limpeza correta fecha ${combo}`,
  },
  'Curativos e feridas': {
    conceptFooter: 'Julgue cada afirmativa antes de combinar as letras',
    goldenFooter: 'Em curativos, condicionais absolutos e biossegurança frouxa enganam',
    logicFooter: 'Estratégia: julgar item a item antes de combinar',
    logicFix: 'elimine distratoras pelo texto literal',
    choiceLogicFix: 'elimine distratoras pelo texto literal — técnica asséptica e cobertura adequada',
    choiceGoldenFooter: 'Em curativos, a banca adora condicionais errados e biossegurança frouxa',
    choiceDangerFooter: (id) => `Compare cada alternativa com a letra ${id} antes de marcar`,
    dangerFooter: (combo, falseRomans) =>
      falseRomans.length >= 2
        ? `Banca costuma errar na ${falseRomans.slice(0, 2).join(' e ')} — gabarito fica em ${combo}`
        : `Conferir gabarito ${combo} após julgar cada afirmativa`,
  },
};

function topicProfile(topic: string): TopicProfile {
  return TOPIC_PROFILES[topic] ?? TOPIC_PROFILES['Curativos e feridas'];
}

function inferConceptLabel(text: string, isTrue: boolean): { label: string; icon: string } {
  const lower = text.toLowerCase();
  if (/calcanhar|pressão|pressao|alívio|alivio|livre|panturrilha/.test(lower)) {
    return { label: 'Alívio de pressão', icon: 'Bed' };
  }
  if (/úmid|umid|seca|maceração|maceracao|barreira/.test(lower)) {
    return { label: 'Barreira cutânea', icon: 'Droplets' };
  }
  if (/ph|alcalino|sabonete/.test(lower)) {
    return { label: 'pH da pele', icon: 'FlaskConical' };
  }
  if (/massage|proeminência|proeminencia|hiperemia/.test(lower)) {
    return { label: 'Proeminências ósseas', icon: 'AlertTriangle' };
  }
  if (/sf|soro fisiológico|limpeza|antisséptico|álcool|iodo/.test(lower)) {
    return { label: 'Limpeza do leito', icon: 'Scissors' };
  }
  if (/hidrocoloide|alginato|gaze|filme|oclusiv|exsudato|cobertura/.test(lower)) {
    return { label: 'Cobertura adequada', icon: 'Bandage' };
  }
  if (/estágio|estagio|necrose|granulação|esfacelo/.test(lower)) {
    return { label: 'Estágio / tecido', icon: 'Layers' };
  }
  const short = truncate(text.split(/[,.;]/)[0] ?? text, 40);
  return { label: short, icon: isTrue ? 'CheckCircle' : 'Circle' };
}

function inferConceptDetail(text: string, isTrue: boolean): string {
  const lower = text.toLowerCase();
  if (/úmid|umid/.test(lower) && !isTrue) {
    return 'Pegadinha: pele úmida favorece maceração — o padrão em acamado é limpa e seca.';
  }
  if (/massage/.test(lower) && !isTrue) {
    return 'Não massagear proeminências ósseas nem áreas hiperemiadas — aumenta microtrauma.';
  }
  if (/calcanhar|livre/.test(lower) && isTrue) {
    return 'Calcanhar livre ou suspensão redistribui peso e reduz compressão local.';
  }
  if (/ph|alcalino/.test(lower) && isTrue) {
    return 'Evitar sabonetes e produtos alcalinos preserva a barreira cutânea.';
  }
  if (/seca/.test(lower) && isTrue) {
    return 'Pele limpa e seca preserva integridade em paciente acamado.';
  }
  if (/estágio\s*i\b|eritema|não branque|nao branque/.test(lower)) {
    return 'Estágio I: eritema não branqueável, pele íntegra.';
  }
  if (/estágio\s*ii\b|flictena|bolha|perda parcial.*derme/.test(lower)) {
    return 'Estágio II: perda parcial da derme, leito róseo/úmido.';
  }
  if (/estágio\s*iii\b|subcutâne|subcutane/.test(lower)) {
    return 'Estágio III: perda total da pele, tecido subcutâneo visível.';
  }
  if (/estágio\s*iv\b|osso|tendão|tendao|músculo|musculo/.test(lower)) {
    return 'Estágio IV: exposição de osso, tendão ou músculo.';
  }
  if (/granulação|granulacao/.test(lower)) {
    return 'Tecido de granulação: leito róseo, indica cicatrização ativa.';
  }
  if (/esfacelo/.test(lower)) {
    return 'Esfacelo: tecido desvitalizado amarelado — deve ser desbridado.';
  }
  if (/necrose|necrótico|necrotico/.test(lower)) {
    return 'Necrose: tecido desvitalizado — avaliar desbridamento.';
  }
  if (/alginato/.test(lower)) {
    return 'Alginato de cálcio: exsudato moderado a alto, ação hemostática.';
  }
  if (/hidrocoloide/.test(lower)) {
    return 'Hidrocoloide: exsudato baixo, mantém meio úmido e protege.';
  }
  if (/espuma|poliuretano/.test(lower)) {
    return 'Espuma: exsudato moderado/alto, absorve e protege.';
  }
  if (/filme transparente|filme/.test(lower)) {
    return 'Filme: ferida superficial seca ou fixação secundária.';
  }
  if (/sf|soro fisiológico/.test(lower)) {
    return 'SF 0,9% é o padrão de limpeza — não é citotóxico no leito.';
  }
  if (/álcool|alcool|iodo|clorexidina/.test(lower) && !isTrue) {
    return 'Antisséptico citotóxico no leito atrasa cicatrização — SF 0,9% é a escolha.';
  }
  if (/reaproveit|reutiliz/.test(lower) && !isTrue) {
    return 'Material em contato com a ferida é descartável — reuso é risco de infecção.';
  }
  return truncate(text, 500);
}

function formatGabaritoCombo(assertives: CurativosAssertive[]): string {
  const trueOnes = assertives.filter((a) => a.isTrue).map((a) => a.roman);
  if (trueOnes.length === 0) return '—';
  if (trueOnes.length === 1) return trueOnes[0];
  if (trueOnes.length === 2) return `${trueOnes[0]} e ${trueOnes[1]}`;
  return `${trueOnes.slice(0, -1).join(', ')} e ${trueOnes[trueOnes.length - 1]}`;
}

function inferGoldenRowLabel(roman: string, text: string): string {
  const lower = text.toLowerCase();
  if (/calcanhar|livre/.test(lower)) return `${roman} — calcanhar livre`;
  if (/úmid|umid|seca/.test(lower)) return `${roman} — pele limpa e úmida`;
  if (/ph|alcalino|sabonete/.test(lower)) return `${roman} — evitar pH alcalino`;
  if (/massage|proeminência|proeminencia/.test(lower)) return `${roman} — massagear proeminências`;
  if (/sf|soro fisiológico/.test(lower)) return `${roman} — limpeza com SF`;
  if (/hidrocoloide|alginato|gaze/.test(lower)) return `${roman} — cobertura`;
  return `${roman} — ${truncate(text.split(/[,.;]/)[0] ?? text, 60)}`;
}

function buildConceptMap(input: BuildCurativosSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferTopicFromInstruction(input.instruction);
  const falseOnes = assertives.filter((a) => !a.isTrue);
  const firstTrap = falseOnes[0];

  const items = assertives.slice(0, 4).map((a) => {
    const { label, icon } = inferConceptLabel(a.text, a.isTrue);
    return {
      label,
      detail: inferConceptDetail(a.text, a.isTrue),
      icon,
    };
  });

  if (firstTrap) {
    items.push({
      label: `Pegadinha da ${firstTrap.roman}`,
      detail: inferConceptDetail(firstTrap.text, false),
      icon: 'XCircle',
    });
  }

  items.push({
    label: 'Gabarito',
    detail: truncate(
      `Letra ${correct?.id ?? '?'}: ${formatGabaritoCombo(assertives)}.`,
      500,
    ),
    icon: 'CheckCircle',
  });

  const prof = topicProfile(topic);

  return {
    type: 'concept_map',
    slide_title: truncate(`${topic} — mapa da prova`, 120),
    meta: slideMeta(input.topico, input.subtopico),
    items: items.slice(0, 20),
    footer_rule: truncate(prof.conceptFooter, 500),
  };
}

function buildGoldenRule(input: BuildCurativosSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const topic = inferTopicFromInstruction(input.instruction);
  const rows: GoldenRuleRow[] = assertives.map((a) => ({
    label: inferGoldenRowLabel(a.roman, a.text),
    value: a.isTrue
      ? truncate(`Verdadeira: ${inferConceptDetail(a.text, true)}`, 500)
      : truncate(`Falsa: ${inferConceptDetail(a.text, false)}`, 500),
    ...(a.isTrue
      ? { badge: 'ok' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));

  rows.push({
    label: 'Resposta final',
    value: formatGabaritoCombo(assertives),
    emphasis: 'highlight' as const,
    badge: 'hot' as const,
  });

  const content =
    topic === 'Prevenção de LPP' ? 'LPP — O QUE A BANCA COBRA' : `${topic.toUpperCase()} — O QUE A BANCA COBRA`;

  return {
    type: 'golden_rule',
    slide_title: truncate(`Regra de ouro — ${topic.toLowerCase()}`, 120),
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(content, 1000),
    rows: rows.slice(0, 12),
    footer_rule: truncate(topicProfile(topic).goldenFooter, 500),
  };
}

function buildLogicFlow(input: BuildCurativosSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferTopicFromInstruction(input.instruction);
  const countWord =
    assertives.length === 4 ? 'quatro' : assertives.length === 3 ? 'três' : 'várias';

  const steps: string[] = [
    `Ler a questão como combinação V/F de ${countWord} afirmativas sobre ${topic.toLowerCase()}.`,
  ];

  for (const a of assertives) {
    const preview = truncate(a.text.split(/[,.;]/)[0] ?? a.text, 80);
    steps.push(
      `Julgar ${a.roman}: ${preview}? → ${a.isTrue ? 'verdadeiro' : 'falso'}.`,
    );
  }

  const combo = formatGabaritoCombo(assertives);
  const falseRomans = assertives.filter((a) => !a.isTrue).map((a) => a.roman);

  steps.push(`Montar o conjunto correto: ${combo}.`);
  if (falseRomans.length > 0) {
    steps.push(`Eliminar alternativas que tragam ${falseRomans.join(' ou ')}.`);
  }
  const prof = topicProfile(topic);
  steps.push(`Marcar ${correct?.id ?? '?'}.`);
  steps.push(`Fixação: ${prof.logicFix}.`);

  return {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta(input.topico, input.subtopico),
    steps: steps.slice(0, 15),
    footer_rule: truncate(prof.logicFooter, 500),
  };
}

function buildDangerZoneItem(a: CurativosAssertive): DangerZoneItem {
  const lower = a.text.toLowerCase();
  if (/úmid|umid/.test(lower)) {
    return {
      label: `Aceitar pele limpa e úmida na ${a.roman}`,
      detail: 'Úmido parece cuidadoso, mas favorece maceração em paciente acamado.',
      correct: 'O regime correto é pele limpa e seca.',
    };
  }
  if (/massage|proeminência|proeminencia|hiperemia/.test(lower)) {
    return {
      label: `Massagear proeminências ósseas na ${a.roman}`,
      detail: 'Massagem em área de risco aumenta isquemia local — parece conforto, mas erra.',
      correct: 'Não massagear proeminências ósseas nem áreas hiperemiadas.',
    };
  }
  if (/álcool|alcool|iodo/.test(lower) && !/sf|soro fisiológico/.test(lower)) {
    return {
      label: `Usar álcool ou iodo no leito na ${a.roman}`,
      detail: 'Antisséptico citotóxico no leito é pegadinha — SF 0,9% é o padrão de limpeza.',
      correct: 'Limpar com SF 0,9% sem citotoxicidade no leito da ferida.',
    };
  }
  return {
    label: `Aceitar afirmativa ${a.roman} como verdadeira`,
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

function buildTrueTrapItem(a: CurativosAssertive): DangerZoneItem | null {
  const lower = a.text.toLowerCase();
  if (/calcanhar|livre|pressão|pressao/.test(lower)) {
    return {
      label: `Descartar a ${a.roman} por falar em calcanhar livre`,
      detail: 'Suspender ou liberar o calcanhar é estratégia real de redistribuição de pressão.',
      correct: truncate(a.text, 500),
    };
  }
  if (/sf|soro fisiológico|ph|alcalino/.test(lower)) {
    return {
      label: `Descartar a ${a.roman} por parecer detalhe técnico`,
      detail: 'Limpeza e pH da pele são critérios reais de prevenção de LPP.',
      correct: truncate(a.text, 500),
    };
  }
  return null;
}

function buildDangerZone(input: BuildCurativosSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const topic = inferTopicFromInstruction(input.instruction);
  const items: DangerZoneItem[] = [];

  for (const a of assertives.filter((x) => !x.isTrue)) {
    items.push(buildDangerZoneItem(a));
  }

  for (const a of assertives.filter((x) => x.isTrue)) {
    const trap = buildTrueTrapItem(a);
    if (trap) items.push(trap);
  }

  if (items.length < 3) {
    items.push({
      label: 'Marcar sem julgar todas as afirmativas',
      detail: 'Combinar letras sem V/F item a item leva a gabarito errado em Curativos.',
      correct: 'Julgue I, II, III… antes de olhar as combinações A–E.',
    });
  }

  const falseRomans = assertives.filter((a) => !a.isTrue).map((a) => a.roman);
  const combo = formatGabaritoCombo(assertives);
  const prof = topicProfile(topic);

  return {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(`PEGADINHAS — ${topic.toUpperCase()}`, 1000),
    items: items.slice(0, 10),
    footer_rule: truncate(prof.dangerFooter(combo, falseRomans), 500),
  };
}

export function canBuildCurativosVfSlides(instruction: string): boolean {
  return extractCurativosAssertives(instruction).length >= 2;
}

function inferOptionTheme(text: string, isCorrect: boolean): { label: string; icon: string; detail: string } {
  const lower = text.toLowerCase();
  if (/gaze|reaproveit|descart/.test(lower)) {
    return {
      label: 'Material do curativo',
      icon: 'Bandage',
      detail: isCorrect
        ? 'Gaze e material descartável não se reaproveitam após contato com a ferida.'
        : 'Reaproveitar gaze é pegadinha de biossegurança.',
    };
  }
  if (/circular|limpeza|sf|soro fisiológico|antisséptico/.test(lower)) {
    return {
      label: 'Limpeza do leito',
      icon: 'Droplets',
      detail: isCorrect
        ? 'Limpeza deve respeitar técnica asséptica e avaliação do leito.'
        : 'Limpeza circular da borda para o centro pode não ser o padrão cobrado.',
    };
  }
  if (/asséptica|asseptica|técnica|tecnica|observação|observacao/.test(lower)) {
    return {
      label: 'Técnica asséptica',
      icon: 'ShieldCheck',
      detail: 'Troca de curativo exige técnica asséptica e observação da ferida.',
    };
  }
  if (/luva|estéril|esteril|epi/.test(lower)) {
    return {
      label: 'EPI e esterilidade',
      icon: 'Hand',
      detail: isCorrect
        ? 'Luvas estéreis conforme indicação do procedimento e risco.'
        : 'Condicionar luva estéril só à secreção purulenta é armadilha comum.',
    };
  }
  if (/úmid|umid|seca|hidrata|umectante/.test(lower)) {
    return {
      label: 'Barreira cutânea',
      icon: 'Droplets',
      detail: isCorrect
        ? truncate(text, 500)
        : 'Pele úmida ou hidratação inadequada é pegadinha em LPP.',
    };
  }
  if (/pressão|pressao|calcanhar|proeminência|proeminencia|massage/.test(lower)) {
    return {
      label: 'Prevenção de LPP',
      icon: 'Bed',
      detail: truncate(text, 500),
    };
  }
  if (/hidrocoloide|alginato|exsudato|oclusiv|cobertura/.test(lower)) {
    return {
      label: 'Cobertura adequada',
      icon: 'Layers',
      detail: 'Escolha da cobertura conforme exsudato e fase da ferida.',
    };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

function inferChoiceTrapDetail(text: string): string {
  const lower = text.toLowerCase();
  if (/reaproveit|gaze/.test(lower)) return 'Material em contato com ferida não se reutiliza — risco de contaminação.';
  if (/circular/.test(lower)) return 'A banca testa técnica de limpeza; circular da borda pode não ser a conduta preferida.';
  if (/somente se houver|apenas se|só se|purulent/.test(lower)) {
    return 'Condicionais absolutos (“só se…”) costumam ser distratoras em curativos.';
  }
  if (/úmid|umid/.test(lower)) return 'Úmido favorece maceração — em LPP o padrão é pele seca.';
  if (/massage/.test(lower)) return 'Massagem em proeminência óssea é contraindicada na prevenção de LPP.';
  return truncate(text, 500);
}

/** O que seria o certo no lugar de cada distrator (não a resposta inteira). */
function inferChoiceCorrection(wrongText: string): string {
  const lower = wrongText.toLowerCase();
  if (/reaproveit|reutiliz|gaze/.test(lower)) {
    return 'Material do curativo é descartado após o uso.';
  }
  if (/circular/.test(lower)) {
    return 'Limpar do menos para o mais contaminado, sem regra fixa borda→centro.';
  }
  if (/somente se|apenas se|só se|purulent/.test(lower)) {
    return 'Técnica asséptica é regra, não condicional.';
  }
  if (/úmid|umid/.test(lower)) return 'Em LPP o padrão é pele limpa e seca.';
  if (/massage/.test(lower)) {
    return 'Não massagear proeminências ósseas nem áreas hiperemiadas.';
  }
  if (/álcool|alcool|iodo/.test(lower)) {
    return 'Limpar com SF 0,9%, sem citotóxico no leito.';
  }
  return 'Confronte com a conduta correta da questão.';
}

/** Pacote 4/4 para múltipla escolha (A–E) em Curativos — padrão premium. */
export function buildCurativosChoiceSlides(input: BuildCurativosSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const wrong = input.options.filter((o) => !o.is_correct);
  if (!correct) throw new Error('Curativos choice: gabarito ausente');

  const topic = inferTopicFromInstruction(input.instruction);
  const prof = topicProfile(topic);
  const preview = truncate(input.instruction.replace(/\s+/g, ' '), 120);

  const conceptItems = input.options.slice(0, 4).map((opt) => {
    const theme = inferOptionTheme(opt.text, opt.is_correct);
    return {
      label: theme.label,
      detail: theme.detail,
      icon: theme.icon,
    };
  });

  const firstWrong = wrong[0];
  if (firstWrong) {
    conceptItems.push({
      label: `Pegadinha da ${firstWrong.id}`,
      detail: inferChoiceTrapDetail(firstWrong.text),
      icon: 'XCircle',
    });
  }

  conceptItems.push({
    label: 'Gabarito',
    detail: `Letra ${correct.id}: ${truncate(correct.text, 200)}.`,
    icon: 'CheckCircle',
  });

  const rows: GoldenRuleRow[] = input.options.map((opt) => ({
    label: `Letra ${opt.id}`,
    value: opt.is_correct
      ? truncate(`Verdadeira: ${opt.text}`, 500)
      : truncate(`Falsa: ${inferChoiceTrapDetail(opt.text)}`, 500),
    ...(opt.is_correct
      ? { badge: 'ok' as const, emphasis: 'highlight' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));

  rows.push({
    label: 'Resposta final',
    value: `Letra ${correct.id}`,
    emphasis: 'highlight' as const,
    badge: 'hot' as const,
  });

  const steps = [
    `Ler o comando: “${preview}”.`,
    `Fixar o tema: ${topic.toLowerCase()}.`,
    `Identificar gabarito: letra ${correct.id} — “${truncate(correct.text, 100)}”.`,
  ];
  for (const opt of wrong) {
    steps.push(
      `Testar letra ${opt.id}: “${truncate(opt.text, 90)}” → eliminar (incorreta).`,
    );
  }
  steps.push(`Marcar letra ${correct.id}.`);
  steps.push(`Fixação: ${prof.choiceLogicFix}.`);

  const dangerItems = wrong.map((opt) => ({
    label: truncate(`Cair na letra ${opt.id}`, 200),
    detail: inferChoiceTrapDetail(opt.text),
    correct: truncate(inferChoiceCorrection(opt.text), 500),
  }));

  if (dangerItems.length < 4) {
    dangerItems.push({
      label: 'Marcar sem testar todas as letras',
      detail: 'Eliminar distratoras pelo texto literal antes de confirmar.',
      correct: truncate(`Gabarito: letra ${correct.id} — ${correct.text}`, 500),
    });
  }

  const meta = slideMeta(input.topico, input.subtopico);

  return [
    {
      type: 'concept_map',
      slide_title: truncate(`${topic} — mapa da prova`, 120),
      meta,
      items: conceptItems.slice(0, 20),
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: truncate(`Regra de ouro — ${topic.toLowerCase()}`, 120),
      meta,
      content: truncate(`${topic.toUpperCase()} — O QUE A BANCA COBRA`, 1000),
      rows: rows.slice(0, 12),
      footer_rule: truncate(prof.choiceGoldenFooter, 500),
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta,
      steps: steps.slice(0, 15),
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta,
      content: truncate(`PEGADINHAS — ${topic.toUpperCase()}`, 1000),
      items: dangerItems.slice(0, 10),
      footer_rule: truncate(prof.choiceDangerFooter(correct.id), 500),
    },
  ];
}

export function canBuildCurativosPremiumSlides(
  instruction: string,
  family: string,
): boolean {
  if (canBuildCurativosVfSlides(instruction)) return true;
  return ['conceito', 'protocolo', 'text_fragment', 'legis', 'calc', 'certo_errado', 'vf'].includes(
    family,
  );
}

export function buildCurativosPremiumSlidesForFamily(
  input: BuildCurativosSlidesInput,
  family: string,
): SlideRecord[] {
  if (canBuildCurativosVfSlides(input.instruction)) {
    return buildCurativosPremiumSlides(input);
  }
  return buildCurativosChoiceSlides(input);
}

/** Pacote 4/4 no padrão golden CPCON LPP (família V/F). */
export function buildCurativosPremiumSlides(input: BuildCurativosSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const assertives = resolveCurativosAssertives(input.instruction, correct);
  if (assertives.length < 2) {
    throw new Error('Curativos VF: enunciado sem afirmativas I/II/III suficientes');
  }

  return [
    buildConceptMap(input, assertives),
    buildGoldenRule(input, assertives),
    buildLogicFlow(input, assertives),
    buildDangerZone(input, assertives),
  ];
}
