#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — verbos-tempos-modos-e-vozes-g04 (8 slugs · Verbos · lote 4).
 *
 *   npx tsx scripts/handcraft-verbos-tempos-modos-e-vozes-g04.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'verbos-tempos-modos-e-vozes-g04';
const SUBTOPICO = 'Verbos — tempos, modos e vozes';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_verbos';
const REVIEWED = '2026-07-23';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-verbos-mais-que-perfeito-sjrp.json';

const VERBOS_SOURCE = {
  id: 'pt-verbos-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Verbos — tempo, modo, voz e correlação temporal',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'presente do indicativo',
    'futuro do presente',
    'pretérito perfeito',
    'pretérito imperfeito',
    'presente do subjuntivo',
    'futuro do pretérito',
    'imperativo',
    'futuro do subjuntivo',
    'ver × vir',
    'pergunta-teste tempo/modo',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'vf' | 'text_fragment';

type Spec = {
  family: Family;
  meta: {
    banca: string;
    prova: string;
    orgao: string;
    ano: string;
    cargo_header?: string;
  };
  instruction: string;
  text_fragment?: string;
  figure_policy?: 'transcribed' | 'required';
  options: Opt[];
  source_tec_id: string;
  source_note: string;
  slides: unknown[];
};

const slideMeta = { topico: TOPICO, subtopico: SUBTOPICO };

function metaBase(spec: Spec, slug: string) {
  return {
    ...spec.meta,
    topico: TOPICO,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:verbos-tempos-modos-e-vozes-g04',
      guideline_snapshot: `M14 Elias TE-simples — pergunta «Qual tempo/modo?» · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      VERBOS_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2025,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt_verbos'],
      },
    ],
  };
}

function build(slug: string, spec: Spec) {
  const qd: {
    instruction: string;
    options: Opt[];
    text_fragment?: string;
    figure_policy?: 'transcribed' | 'required';
  } = {
    instruction: spec.instruction,
    options: spec.options,
  };
  if (spec.text_fragment) qd.text_fragment = spec.text_fragment;
  if (spec.figure_policy) qd.figure_policy = spec.figure_policy;
  return {
    meta: metaBase(spec, slug),
    question_data: qd,
    reverse_study_slides: spec.slides,
  };
}

const SPECS: Record<string, Spec> = {
  'avancasp-ace-verbos-leia-o-texto-a-seguir-para-responder-3662932': {
    family: 'text_fragment',
    source_tec_id: '3662932',
    source_note: 'Sou / estará / morreram — mesmo modo, tempos diferentes · AVANÇASP ACE Cerquilho 2025 tec 3662932',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACE (Pref Cerquilho)',
      orgao: 'Pref. Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Os verbos em destaque nos excertos I. “Sou amigo íntimo dos satélites artificiais” II. “Como estará a coisa là bas?” III. “Quantos morreram no último desastre da Leopoldina?” estão conjugados:',
    text_fragment:
      'I. Sou amigo íntimo dos satélites artificiais. II. Como estará a coisa là bas? III. Quantos morreram no último desastre da Leopoldina?',
    options: [
      { id: 'A', text: 'no mesmo tempo e no mesmo modo.', is_correct: false },
      { id: 'B', text: 'no mesmo tempo, mas em modos diferentes.', is_correct: false },
      { id: 'C', text: 'no mesmo modo, mas em tempos diferentes.', is_correct: true },
      { id: 'D', text: 'em tempos e modos diferentes.', is_correct: false },
      { id: 'E', text: 'no mesmo tempo, modo e pessoa gramatical.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três formas — um modo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Sou / estará / morreram: mesmo modo? mesmos tempos?', icon: 'HelpCircle' },
          { label: 'Sou / satélites', detail: 'Presente — «Sou amigo íntimo dos satélites artificiais».', icon: 'Sun' },
          { label: 'Estará / morreram', detail: 'Futuro · perfeito — Leopoldina / desastre no passado.', icon: 'Clock' },
          { label: 'Pegadinha', detail: 'Achar que futuro ou perfeito mudam o modo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Modo = indicativo · tempos = três pontos na linha.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: comparar «sou» (satélites artificiais), «estará» e «morreram» (desastre / Leopoldina).',
          '«Sou» = presente · «estará» = futuro do presente · «morreram» = pretérito perfeito.',
          'Os três estão no modo indicativo — fato/informação.',
          'Tempos diferentes → não A (mesmo tempo) nem B (modos diferentes).',
          'D exige modos diferentes — falso — eliminar.',
          'E exige mesma pessoa: «sou» 1ª · «estará» 3ª · «morreram» 3ª pl. — eliminar.',
          'Gabarito C — mesmo modo, tempos diferentes.',
          'Em similares: separe modo (atitude) de tempo (quando) antes de marcar.',
        ],
        footer_rule: 'C = indicativo · três tempos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MODO × TEMPO',
        rows: [
          { label: 'Presente', value: '«sou» — agora / estado.' },
          { label: 'Futuro do presente', value: '«estará» — posterioridade.' },
          { label: 'Pretérito perfeito', value: '«morreram» — passado concluído.' },
          { label: 'Nesta questão', value: 'C — mesmo modo (indicativo), tempos diferentes.' },
        ],
        footer_rule: 'Indicativo cobre presente, passado e futuro.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Leituras que misturam modo e tempo.',
        items: [
          {
            label: 'A — mesmo tempo e modo',
            detail: 'Presente ≠ futuro ≠ perfeito — tempos distintos.',
            correct: 'Três tempos do indicativo — não o mesmo tempo.',
          },
          {
            label: 'B — mesmo tempo, modos diferentes',
            detail: 'Não há subjuntivo/imperativo nos três trechos.',
            correct: 'Modo único = indicativo; o que muda é o tempo.',
          },
          {
            label: 'D — tempos e modos diferentes',
            detail: 'Modos diferentes exigiria subjuntivo ou imperativo.',
            correct: 'Só o tempo muda — modo permanece indicativo.',
          },
          {
            label: 'E — mesmo tempo, modo e pessoa',
            detail: 'Pessoas: 1ª («sou») × 3ª («estará» / «morreram»).',
            correct: 'Pessoa gramatical também diverge — não é E.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Estudo de manhã; estudarei à noite; estudei ontem.»',
            correct: 'Mesmo modo (indicativo), tempos diferentes — presente / futuro / perfeito.',
          },
        ],
        footer_rule: 'Gabarito C — mesmo modo, tempos diferentes.',
      },
    ],
  },

  'selecon-ass-verbos-leia-o-texto-a-seguir-a-fruta-que-aj-3692789': {
    family: 'text_fragment',
    source_tec_id: '3692789',
    source_note: '«é» → pretérito imperfeito «era» · SELECON Ass Adm Tapurah 2025 tec 3692789',
    meta: {
      banca: 'SELECON',
      prova: 'Ass Adm (Pref Tapurah)',
      orgao: 'Pref. Tapurah',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Excerto “Uma opção simples, acessível e com respaldo científico é o consumo de laranjas”. No pretérito imperfeito, a forma verbal em destaque seria flexionada como:',
    text_fragment:
      'Uma opção simples, acessível e com respaldo científico é o consumo de laranjas. Diversos estudos indicam que essa fruta fortalece as defesas do organismo.',
    options: [
      { id: 'A', text: 'foi', is_correct: false },
      { id: 'B', text: 'era', is_correct: true },
      { id: 'C', text: 'fosse', is_correct: false },
      { id: 'D', text: 'seria', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Presente → imperfeito',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«É» (consumo de laranjas): foi, era, fosse ou seria no imperfeito?', icon: 'HelpCircle' },
          { label: 'É / laranjas', detail: 'Presente — opção simples e acessível: consumo de laranjas com respaldo científico.', icon: 'CheckCircle' },
          { label: 'Imperfeito', detail: 'Curso/hábito no passado → «era».', icon: 'Rewind' },
          { label: 'Pegadinha', detail: 'Trocar por perfeito («foi») ou condicional («seria»).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'ser: é → era (imperfeito) — laranjas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: reescrever «é» (laranjas / respaldo científico) no pretérito imperfeito.',
          '«É» = 3ª sing. presente de «ser» — consumo de laranjas no trecho.',
          'Pretérito imperfeito de «ser» = «era» (não «foi»).',
          'A «foi» = pretérito perfeito — ponto concluído — eliminar.',
          'C «fosse» = imperfeito do subjuntivo — hipótese — eliminar.',
          'D «seria» = futuro do pretérito — condicional — eliminar.',
          'Gabarito B — era (laranjas / respaldo científico).',
          'Em similares: presente «é/está» → imperfeito «era/estava».',
        ],
        footer_rule: 'B = era (pretérito imperfeito).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SER — LINHA DO TEMPO',
        rows: [
          { label: 'Presente', value: 'é / são — consumo de laranjas (fato atual).' },
          { label: 'Imperfeito', value: 'era / eram' },
          { label: 'Perfeito', value: 'foi / foram' },
          { label: 'Nesta questão', value: 'B — «é» → «era» (opção acessível).' },
        ],
        footer_rule: 'Imperfeito ≠ perfeito («foi»).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Formas de «ser» que não são imperfeito (laranjas).',
        items: [
          {
            label: 'A — foi',
            detail: 'Pretérito perfeito — fato pontual.',
            correct: 'Imperfeito = «era»; perfeito = «foi» — não o pedido.',
          },
          {
            label: 'C — fosse',
            detail: 'Imperfeito do subjuntivo — hipótese («se fosse»).',
            correct: 'Pedido = imperfeito do indicativo «era», não «fosse».',
          },
          {
            label: 'D — seria',
            detail: 'Futuro do pretérito — condicional.',
            correct: '«Seria» ≠ imperfeito; «era» = curso no passado.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «A laranja é aliada das vias aéreas.» → pretérito imperfeito',
            correct: 'Pretérito imperfeito «era» — mesmo mapeamento de «é» → «era».',
          },
        ],
        footer_rule: 'Gabarito B — era.',
      },
    ],
  },

  'consulplan-a-verbos-leia-o-texto-para-responder-a-questa-3694424': {
    family: 'text_fragment',
    source_tec_id: '3694424',
    source_note: '«volte» — presente do subjuntivo · CONSULPLAN AOE Indaiatuba 2025 tec 3694424',
    meta: {
      banca: 'CONSULPLAN',
      prova: 'AOE (Pref Indaiatuba)',
      orgao: 'Pref. Indaiatuba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho “caso a informação volte a ser acessada”, a forma verbal destacada está no:',
    text_fragment:
      'Por outro lado, caso a informação volte a ser acessada, seja por meio de estudo ou repetição, a conexão pode ser fortalecida novamente.',
    options: [
      { id: 'A', text: 'Imperativo afirmativo, indicando um conselho.', is_correct: false },
      { id: 'B', text: 'Pretérito do subjuntivo, por apresentar uma condição.', is_correct: false },
      { id: 'C', text: 'Presente do subjuntivo, pois apresenta uma possibilidade.', is_correct: true },
      { id: 'D', text: 'Presente do indicativo, caracterizando uma ação concreta.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso + subjuntivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Após «caso a informação…»: indicativo ou subjuntivo?', icon: 'HelpCircle' },
          { label: 'Volte / acessada', detail: 'Presente do subjuntivo — informação que volte a ser acessada.', icon: 'Cloud' },
          { label: 'Estudo / conexão', detail: 'Seja por estudo ou repetição — conexão fortalecida.', icon: 'GitBranch' },
          { label: 'Pegadinha', detail: 'Ler «volte» como imperativo («volte!») ou indicativo («volta»).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Caso + presente do subjuntivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «volte» — caso a informação volte a ser acessada.',
          '«Caso» introduz hipótese — informação / conexão / estudo.',
          '«Volte» = presente do subjuntivo (3ª sing.) — possibilidade.',
          'A imperativo afirmativo seria comando direto — eliminar.',
          'B pretérito do subjuntivo seria «voltasse» — eliminar.',
          'D presente do indicativo seria «volta» — eliminar.',
          'Gabarito C — presente do subjuntivo (possibilidade).',
          'Em similares: «caso / se / quando (futuro)» + -e/-a → presente do subjuntivo.',
        ],
        footer_rule: 'C = presente do subjuntivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRESENTE DO SUBJUNTIVO',
        rows: [
          { label: 'Gatilhos', value: 'caso, se, que (dúvida/desejo), talvez.' },
          { label: 'Forma', value: '«volte», «seja», «faça».' },
          { label: '≠ Indicativo', value: '«volta», «é», «faz» = fato.' },
          { label: 'Nesta questão', value: 'C — «volte» = possibilidade.' },
        ],
        footer_rule: 'Possibilidade após «caso» = subjuntivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Modos/tempos trocados em «volte».',
        items: [
          {
            label: 'A — imperativo afirmativo',
            detail: 'Imperativo ordena («Volte agora!»); aqui há condição.',
            correct: 'Após «caso»: subjuntivo de possibilidade, não ordem.',
          },
          {
            label: 'B — pretérito do subjuntivo',
            detail: 'Pretérito seria «voltasse» — outra flexão.',
            correct: '«Volte» = presente do subjuntivo, não «voltasse».',
          },
          {
            label: 'D — presente do indicativo',
            detail: 'Indicativo seria «volta» — fato concreto.',
            correct: 'Hipótese «caso…» → subjuntivo «volte», não «volta».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Caso o plantão atrase, avise a equipe.» — «atrase»',
            correct: 'Presente do subjuntivo — possibilidade após «caso».',
          },
        ],
        footer_rule: 'Gabarito C — presente do subjuntivo.',
      },
    ],
  },

  'consulplan-a-verbos-leia-o-texto-e-responda-a-questao-ab-3694741': {
    family: 'text_fragment',
    source_tec_id: '3694741',
    source_note: '«poderia» — futuro do pretérito / hipótese · CONSULPLAN ASA Indaiatuba 2025 tec 3694741',
    meta: {
      banca: 'CONSULPLAN',
      prova: 'ASA (Pref Indaiatuba)',
      orgao: 'Pref. Indaiatuba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em “o que poderia eu fazer?”, a forma verbal destacada indica uma ação que:',
    text_fragment:
      'Agora: o que poderia eu fazer? Humanos têm como demonstrar seus ciúmes… Mas eu sou um rádio…',
    options: [
      { id: 'A', text: 'É contínua e não tem um limite temporal definido.', is_correct: false },
      { id: 'B', text: 'Acontecerá em um futuro próximo ao momento atual.', is_correct: false },
      { id: 'C', text: 'Aconteceu em um passado recente com indícios no futuro.', is_correct: false },
      { id: 'D', text: 'Trata-se de uma possibilidade remota, uma ideia hipotética.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Poderia — hipótese',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Poderia»: fato contínuo, futuro certo ou hipótese?', icon: 'HelpCircle' },
          { label: 'Poderia', detail: 'Futuro do pretérito — o que poderia eu fazer?', icon: 'Cloud' },
          { label: 'Humanos / ciúmes', detail: 'Humanos demonstram ciúmes; o rádio só pergunta.', icon: 'Radio' },
          { label: 'Pegadinha', detail: 'Ler como imperfeito contínuo («podia») ou futuro próximo.', icon: 'AlertTriangle' },
        ],
        footer_rule: '-ria = hipótese / condicional.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor de «poderia» — humanos / ciúmes / rádio.',
          'Terminação «-ria» = futuro do pretérito — ideia hipotética.',
          'Não descreve curso contínuo nem futuro certo.',
          'A contínuo sem limite ≈ imperfeito «podia» — eliminar.',
          'B futuro próximo ≈ «poderei» / «vou poder» — eliminar.',
          'C passado recente com indício futuro — não casa com «-ria» sozinho — eliminar.',
          'Gabarito D — possibilidade remota / hipótese.',
          'Em similares: «o que eu faria?» = hipótese, não fato.',
        ],
        footer_rule: 'D = hipótese remota.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FUTURO DO PRETÉRITO — VALOR',
        rows: [
          { label: 'Forma', value: 'poderia, faria, diria' },
          { label: 'Valor', value: 'Hipótese, cortesia, possibilidade remota.' },
          { label: '≠ Imperfeito', value: '«Podia» = curso no passado.' },
          { label: 'Nesta questão', value: 'D — «poderia» = hipótese.' },
        ],
        footer_rule: 'Pergunta retórica com -ria = não-fato.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Leituras que deslocam «poderia».',
        items: [
          {
            label: 'A — contínua sem limite',
            detail: 'Curso contínuo pede imperfeito («podia»), não «poderia».',
            correct: 'Futuro do pretérito = hipótese; imperfeito = curso.',
          },
          {
            label: 'B — futuro próximo atual',
            detail: 'Futuro do presente seria «poderei» / «vou poder».',
            correct: '«Poderia» não marca futuro certo próximo.',
          },
          {
            label: 'C — passado recente + indício futuro',
            detail: 'Descrição híbrida não corresponde à flexão -ria.',
            correct: 'Valor central = possibilidade hipotética (D).',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «O que eu faria se o plantão atrasasse?» — «faria»',
            correct: 'Futuro do pretérito — ideia hipotética (mesmo valor de «poderia»).',
          },
        ],
        footer_rule: 'Gabarito D — possibilidade remota.',
      },
    ],
  },

  'cpcon-uepb-a-verbos-leia-o-texto-iv-para-responder-a-que-3709452': {
    family: 'text_fragment',
    source_tec_id: '3709452',
    source_note: 'Verbo «ver» nos quatro momentos — presente do indicativo · CPCON Ag Adm Olivedos 2025 tec 3709452',
    meta: {
      banca: 'CPCON',
      prova: 'Ag Adm (Pref Olivedos)',
      orgao: 'Pref. Olivedos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe o verbo “ver” que aparece nos quatro momentos do texto. Sobre ele, é CORRETO afirmar que:',
    figure_policy: 'transcribed',
    text_fragment:
      'Meme / texto IV — quatro usos do verbo «ver» (vejo / vês / vê / vemos ou equivalentes no presente): em todos, o verbo está no presente do indicativo.',
    options: [
      { id: 'A', text: 'em todas as situações, o verbo “ver” está conjugado no presente do subjuntivo.', is_correct: false },
      { id: 'B', text: 'em todas as situações, o verbo “ver” está conjugado no presente do indicativo.', is_correct: true },
      { id: 'C', text: 'dos quatros usos do verbo “ver”, apenas dois possuem sujeito.', is_correct: false },
      { id: 'D', text: 'o verbo “ver” está flexionado no mesmo número nas quatro situações de uso: no plural.', is_correct: false },
      { id: 'E', text: 'o verbo “ver” está flexionado no mesmo número nas quatro situações de uso: no singular.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ver — quatro presentes',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Nos quatro momentos: subjuntivo ou indicativo?', icon: 'HelpCircle' },
          { label: 'Ver', detail: 'Presente do indicativo muda a pessoa (vejo/vês/vê/vemos).', icon: 'Eye' },
          { label: 'Número', detail: 'Singular e plural aparecem — não um só número.', icon: 'Split' },
          { label: 'Pegadinha', detail: 'Marcar subjuntivo («veja») ou «só plural/só singular».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mesmo tempo/modo · pessoas diferentes.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmar o que é CORRETO sobre «ver» nos quatro usos.',
          'Formas do meme = presente do indicativo em pessoas distintas.',
          'A presente do subjuntivo seria «veja / vejamos» — eliminar.',
          'C «apenas dois possuem sujeito» — falso: flexões pessoais têm sujeito (explícito ou elíptico) — eliminar.',
          'D/E «mesmo número» — misturam singular e plural — eliminar.',
          'Gabarito B — presente do indicativo em todas.',
          'Em similares: teste se a forma é «vê» (ind.) ou «veja» (subj./imper.).',
        ],
        footer_rule: 'B = presente do indicativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VER — PRESENTE DO INDICATIVO',
        rows: [
          { label: 'Singular', value: 'vejo · vês · vê' },
          { label: 'Plural', value: 'vemos · vedes · veem' },
          { label: '≠ Subjuntivo', value: 'veja · vejamos · vejam' },
          { label: 'Nesta questão', value: 'B — quatro usos no presente do indicativo.' },
        ],
        footer_rule: 'Pessoa muda; modo/tempo permanecem.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Afirmações falsas sobre os quatro «ver».',
        items: [
          {
            label: 'A — presente do subjuntivo',
            detail: 'Subjuntivo = «veja»; o meme usa formas do indicativo.',
            correct: 'Presente do indicativo em todos os quadrantes — não subjuntivo.',
          },
          {
            label: 'C — só dois com sujeito',
            detail: 'Flexão pessoal implica sujeito (mesmo elíptico).',
            correct: 'Não é critério válido — o certo é o modo/tempo (B).',
          },
          {
            label: 'D — todas no plural',
            detail: 'Há formas singulares (vê / vejo) no conjunto.',
            correct: 'Número varia — não «todas no plural».',
          },
          {
            label: 'E — todas no singular',
            detail: 'Há formas plurais (vemos / veem) no conjunto.',
            correct: 'Número varia — não «todas no singular».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Eu vejo; ela vê; nós vemos o protocolo.»',
            correct: 'Presente do indicativo em todas — pessoas/números diferentes.',
          },
        ],
        footer_rule: 'Gabarito B — presente do indicativo.',
      },
    ],
  },

  'avancasp-of-verbos-assinale-a-alternativa-cujo-enunciad-3725104': {
    family: 'conceito',
    source_tec_id: '3725104',
    source_note: 'Flexões corretas — verem / virem × haver/irmos/querer/vir · AVANÇASP Of Adm Varginha 2025 tec 3725104',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Of Adm (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa cujo enunciado apresenta todas as formas verbais empregadas corretamente.',
    options: [
      {
        id: 'A',
        text: 'Sempre que haver alguma discussão, abstenha-se de querer resolver com violência.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Caso queira mudar, deixe as pessoas verem o seu esforço e virem até você.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Se todos nós irmos à sua casa ao mesmo tempo, não vai sobrar mais espaço algum.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Se você querer ser meu parceiro de aventuras, vai ter que se esforçar bem mais.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Quando você vir à minha casa, não deixe que todas as pessoas o vejam assim desolado.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Armadilhas de conjugação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual enunciado traz todas as formas verbais corretas?', icon: 'HelpCircle' },
          { label: 'Houver / formos / quiser', detail: 'Futuro do subjuntivo — não infinitivo cru.', icon: 'Check' },
          { label: 'Ver × vir', detail: 'verem (ver) · virem (vir=chegar) · vier (vir).', icon: 'GitCompare' },
          { label: 'Pegadinha', detail: '«haver/irmos/querer/vir» no lugar do futuro do subjuntivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Após se/quando/caso: futuro do subjuntivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar a alternativa com TODAS as formas corretas.',
          'A «Sempre que haver» → deveria ser «houver» — eliminar.',
          'C «Se nós irmos» → futuro do subjuntivo de ir = «formos» — eliminar.',
          'D «Se você querer» → «quiser» — eliminar.',
          'E «Quando você vir à casa» (sentido chegar) → «vier»; «vir» = ver — eliminar.',
          'B «queira» + «verem» (inf. pessoal de ver) + «virem» (fut. subj. de vir) — correto.',
          'Gabarito B — todas as formas ok.',
          'Em similares: teste ver×vir e futuro do subjuntivo após se/quando.',
        ],
        footer_rule: 'B = queira · verem · virem.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FUTURO DO SUBJUNTIVO — PEGAS',
        rows: [
          { label: 'Haver', value: 'quando houver (não «haver»).' },
          { label: 'Ir', value: 'se formos (não «irmos»).' },
          { label: 'Querer', value: 'se quiser (não «querer»).' },
          { label: 'Vir × ver', value: 'quando vier (chegar) · quando vir (ver).' },
        ],
        footer_rule: 'B acerta verem (ver) e virem (vir).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Onde cada distrator quebra a conjugação.',
        items: [
          {
            label: 'A — haver',
            detail: 'Após «sempre que»: futuro do subjuntivo «houver».',
            correct: 'Forma correta: «Sempre que houver…» — não infinitivo «haver».',
          },
          {
            label: 'C — irmos',
            detail: 'Futuro do subjuntivo de ir = «formos», não «irmos».',
            correct: '«Se todos nós formos…» — «irmos» é erro clássico.',
          },
          {
            label: 'D — querer',
            detail: 'Após «se»: «quiser», não o infinitivo «querer».',
            correct: '«Se você quiser…» — futuro do subjuntivo.',
          },
          {
            label: 'E — vir (= chegar)',
            detail: '«Vir» é futuro do subjuntivo de ver; chegar = «vier».',
            correct: '«Quando você vier à minha casa…» — não «vir».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique o erro: «Se você fazer isso, avise.»',
            correct: 'Futuro do subjuntivo: «Se você fizer» — não infinitivo «fazer».',
          },
        ],
        footer_rule: 'Gabarito B — enunciado integralmente correto.',
      },
    ],
  },

  'educa-pb-acd-verbos-leia-o-texto-a-seguir-e-responda-a-q-3746597': {
    family: 'text_fragment',
    source_tec_id: '3746597',
    source_note: '«Acostuma-te» — imperativo afirmativo · EDUCA PB ACD Sta Cecília 2025 tec 3746597',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Santa Cecília)',
      orgao: 'Pref. Santa Cecília',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Releia o verso: “Acostuma-te à lama que te espera!” Assinale a alternativa que apresenta a classificação CORRETA do verbo sublinhado:',
    text_fragment:
      'Acostuma-te à lama que te espera! O Homem, que, nesta terra miserável, Mora entre feras… (Augusto dos Anjos, Versos íntimos)',
    options: [
      { id: 'A', text: 'Futuro do indicativo, indicando ação futura.', is_correct: false },
      { id: 'B', text: 'Presente do indicativo, descrevendo fato habitual.', is_correct: false },
      { id: 'C', text: 'Imperativo afirmativo, expressando ordem ou conselho.', is_correct: true },
      { id: 'D', text: 'Presente do subjuntivo, expressando possibilidade.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Acostuma-te — ordem',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Acostuma-te»: fato, hipótese ou ordem?', icon: 'HelpCircle' },
          { label: 'Imperativo', detail: 'Afirmativo de tu — «acostuma» + ênclise «-te».', icon: 'Megaphone' },
          { label: 'Verso', detail: 'Conselho/ordem poética à 2ª pessoa.', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: 'Confundir com presente («acostuma») sem valor de comando.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ênclise + tom de ordem = imperativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «Acostuma-te» no verso de Augusto dos Anjos.',
          'Forma de tu + pronome enclítico + exclamação = imperativo afirmativo.',
          'Valor: ordem/conselho — «acostuma-te à lama».',
          'A futuro seria «acostumar-te-ás» / «te acostumarás» — eliminar.',
          'B presente indicativo descreve hábito sem comando — fraco no verso — eliminar.',
          'D presente do subjuntivo seria «acostumes» — eliminar.',
          'Gabarito C — imperativo afirmativo.',
          'Em similares: «Estuda!» / «Acostuma-te!» = imperativo, não presente neutro.',
        ],
        footer_rule: 'C = imperativo afirmativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMPERATIVO AFIRMATIVO — TU',
        rows: [
          { label: 'Forma', value: 'acostuma-te · fala · estuda' },
          { label: 'Valor', value: 'Ordem, pedido, conselho.' },
          { label: '≠ Presente', value: 'Presente narra; imperativo manda.' },
          { label: 'Nesta questão', value: 'C — «Acostuma-te».' },
        ],
        footer_rule: 'Exclamação + ênclise reforçam o imperativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classificações que tiram o comando do verso.',
        items: [
          {
            label: 'A — futuro do indicativo',
            detail: 'Futuro não casa com a ordem imediata do verso.',
            correct: 'Imperativo afirmativo — não futuro.',
          },
          {
            label: 'B — presente do indicativo',
            detail: 'Presente descreve; o verso ordena («acostuma-te»).',
            correct: 'Valor de ordem = imperativo, não hábito narrado.',
          },
          {
            label: 'D — presente do subjuntivo',
            detail: 'Subjuntivo seria «acostumes» — possibilidade.',
            correct: '«Acostuma-te» = imperativo de tu, não subjuntivo.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Lava as mãos antes do procedimento!»',
            correct: 'Imperativo afirmativo — ordem/conselho (mesmo valor de «Acostuma-te»).',
          },
        ],
        footer_rule: 'Gabarito C — imperativo afirmativo.',
      },
    ],
  },

  'selecon-ag-f-verbos-leia-o-texto-a-seguir-ses-distribui-3754252': {
    family: 'text_fragment',
    source_tec_id: '3754252',
    source_note: '«confirmou» → pretérito imperfeito «confirmava» · SELECON Ag Fisc Marcelândia 2025 tec 3754252',
    meta: {
      banca: 'SELECON',
      prova: 'Ag Fisc (Pref Marcelândia)',
      orgao: 'Pref. Marcelândia',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho “o Brasil confirmou 31 casos importados”, a forma verbal no pretérito imperfeito do indicativo seria:',
    text_fragment:
      'Até 1º de outubro de 2025, o Brasil confirmou 31 casos importados, quando a infecção ocorre fora do país. Em Mato Grosso, foram registrados três casos…',
    options: [
      { id: 'A', text: 'confirmaria', is_correct: false },
      { id: 'B', text: 'confirmava', is_correct: true },
      { id: 'C', text: 'confirmara', is_correct: false },
      { id: 'D', text: 'confirmasse', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Perfeito → imperfeito',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Confirmou» (Brasil / casos) no imperfeito: qual forma?', icon: 'HelpCircle' },
          { label: 'Confirmou', detail: 'Pretérito perfeito — Brasil confirmou 31 casos importados.', icon: 'CheckCircle' },
          { label: 'Imperfeito', detail: 'Curso no passado → «confirmava» (outubro / infecção).', icon: 'Rewind' },
          { label: 'Pegadinha', detail: 'Trocar por -ria, mais-que-perfeito ou subjuntivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Perfeito -ou → imperfeito -ava.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: reescrever «confirmou» (Brasil / casos importados) no pretérito imperfeito.',
          '«Confirmou» = 3ª sing. pretérito perfeito — outubro / infecção fora do país.',
          'Imperfeito do indicativo = «confirmava».',
          'A «confirmaria» = futuro do pretérito — eliminar.',
          'C «confirmara» = mais-que-perfeito — eliminar.',
          'D «confirmasse» = imperfeito do subjuntivo — eliminar.',
          'Gabarito B — confirmava.',
          'Em similares: -ou/-eu → -ava/-ia no imperfeito.',
        ],
        footer_rule: 'B = confirmava.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRETÉRITOS — CONFIRMAR',
        rows: [
          { label: 'Perfeito', value: 'confirmou — fato pontual.' },
          { label: 'Imperfeito', value: 'confirmava — curso/hábito.' },
          { label: 'Mais-que-perfeito', value: 'confirmara — anterioridade.' },
          { label: 'Nesta questão', value: 'B — «confirmou» → «confirmava».' },
        ],
        footer_rule: 'Pedido = imperfeito do indicativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Formas que não são imperfeito do indicativo.',
        items: [
          {
            label: 'A — confirmaria',
            detail: 'Futuro do pretérito — hipótese.',
            correct: 'Imperfeito = «confirmava»; -ria = condicional.',
          },
          {
            label: 'C — confirmara',
            detail: 'Mais-que-perfeito — anterior a outro passado.',
            correct: 'Mais-que-perfeito ≠ imperfeito pedido.',
          },
          {
            label: 'D — confirmasse',
            detail: 'Imperfeito do subjuntivo — hipótese («se confirmasse»).',
            correct: 'Pedido = indicativo «confirmava», não «confirmasse».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «A SES distribuiu 500 mil doses.» → pretérito imperfeito',
            correct: 'Pretérito imperfeito «distribuía» — mesmo mapeamento perfeito → imperfeito.',
          },
        ],
        footer_rule: 'Gabarito B — confirmava.',
      },
    ],
  },
};

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const loteRoot = loteDir(LOTE);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(loteRoot, { recursive: true });

  const slugs = Object.keys(SPECS);
  let n = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(outDir, `${slug}.json`);
    writeFileSync(path, `${JSON.stringify(build(slug, spec), null, 2)}\n`, 'utf8');
    n += 1;
    console.log(`[handcraft] OK ${slug}`);
  }

  const catalog = {
    lote: LOTE,
    subtopico: SUBTOPICO,
    topico: TOPICO,
    pedagogical_branch: BRANCH,
    total: slugs.length,
    slugs,
  };
  writeFileSync(loteCatalogPath(LOTE), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] catalog.json written (${slugs.length} slugs)`);
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
