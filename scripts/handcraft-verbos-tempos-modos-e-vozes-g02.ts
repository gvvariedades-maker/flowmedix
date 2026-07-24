#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — verbos-tempos-modos-e-vozes-g02 (8 slugs · Verbos · lote 2).
 *
 *   npx tsx scripts/handcraft-verbos-tempos-modos-e-vozes-g02.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'verbos-tempos-modos-e-vozes-g02';
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
    'mais-que-perfeito',
    'pretérito perfeito',
    'pretérito imperfeito',
    'pretérito perfeito composto',
    'correlação temporal',
    'locução verbal',
    'subjuntivo',
    'futuro do subjuntivo',
    'presente do subjuntivo',
    'voz passiva',
    'pessoa verbal',
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
      reviewer: 'handcraft:verbos-tempos-modos-e-vozes-g02',
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
        year: Number(spec.meta.ano) || 2026,
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
  'avancasp-gcm-verbos-cazo-novo-filme-disponivel-em-na-fal-4001122': {
    family: 'conceito',
    source_tec_id: '4001122',
    source_note: 'Modo/tempo «derrote» × «aparecem» — charge CAZO · AVANÇASP GCM Pref Taiúva 2026 tec 4001122',
    meta: {
      banca: 'AVANÇASP',
      prova: 'GCM (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Na fala do personagem da charge (trecho abaixo), cada uma das formas verbais «derrote» e «aparecem», nessa ordem, indica:',
    figure_policy: 'transcribed',
    text_fragment: 'Novo filme! Que derrote a monotonia — os bons títulos aparecem na tela.',
    options: [
      { id: 'A', text: 'uma ação real, certa no tempo passado; e uma ação hipotética, provável.', is_correct: false },
      { id: 'B', text: 'uma ação real, certa no tempo presente; e uma ação hipotética, provável.', is_correct: false },
      { id: 'C', text: 'uma ação hipotética, provável; e uma ação real, certa no tempo presente.', is_correct: true },
      { id: 'D', text: 'uma ação real, certa no tempo passado; e uma ação real, certa no tempo presente.', is_correct: false },
      { id: 'E', text: 'uma ação certa, real no tempo futuro; e uma ação presa a uma condição do passado.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Modo × tempo na fala',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Testar «derrote» e «aparecem» separadamente — modo e tempo.', icon: 'Split' },
          { label: 'Derrote', detail: 'Subjuntivo/imperativo — desejo, ordem ou hipótese (não fato).', icon: 'Cloud' },
          { label: 'Aparecem', detail: 'Presente do indicativo — fato atual, real e certo.', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Inverter a ordem das duas formas ou rotular ambas como passado.', icon: 'AlertTriangle' },
        ],
        footer_rule: '1ª forma = hipótese · 2ª = presente real.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «derrote» e «aparecem» na ordem pedida.',
          '«Derrote»: subjuntivo/imperativo — ação desejada ou hipotética, não fato consumado.',
          '«Aparecem»: presente do indicativo — ação real no momento (filmes disponíveis).',
          'A/D trocam passado/presente na 1ª forma — eliminar.',
          'B inverte a ordem (presente antes de hipótese) — eliminar.',
          'E projeta futuro e condição passada — não casa com as formas — eliminar.',
          'Gabarito C — hipotética + real no presente.',
          'Em similares: ordem do enunciado importa — teste cada verbo antes de combinar.',
        ],
        footer_rule: 'C = hipótese · presente real.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VALOR SEMÂNTICO — DUPLA FORMA',
        rows: [
          { label: 'Subjuntivo / imperativo', value: 'Hipótese, desejo ou ordem — «derrote», «venha».' },
          { label: 'Presente indicativo', value: 'Fato atual e certo — «aparecem», «está».' },
          { label: 'Ordem no enunciado', value: '1ª forma → 1º valor; 2ª forma → 2º valor.' },
          { label: 'Nesta questão', value: 'C — hipotética + real presente.' },
        ],
        footer_rule: 'Não confundir desejo (subj.) com fato (ind.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Combinações que trocam modo ou ordem.',
        items: [
          {
            label: 'A — passado + hipótese',
            detail: '«Derrote» não é pretérito — é subjuntivo/imperativo.',
            correct: '1ª forma = hipótese; não rotule como passado real.',
          },
          {
            label: 'B — presente + hipótese (invertido)',
            detail: 'Troca a ordem: «aparecem» é que é presente real.',
            correct: '2ª forma = presente indicativo; 1ª = hipotética.',
          },
          {
            label: 'D — passado + presente',
            detail: 'Nenhuma das duas está no passado indicativo.',
            correct: '«Derrote» = hipótese; «aparecem» = presente — não passado.',
          },
          {
            label: 'E — futuro + condição passada',
            detail: 'Valores semânticos não correspondem às flexões dadas.',
            correct: 'Subjuntivo ≠ futuro real; «aparecem» ≠ condicional passado.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Que venha logo; os resultados chegam hoje.»',
            correct: '«Venha» = hipótese/desejo; «chegam» = presente indicativo real.',
          },
        ],
        footer_rule: 'Gabarito C — hipótese + presente real.',
      },
    ],
  },

  'avancasp-acs-verbos-nao-posso-compreender-que-a-literatu-4003501': {
    family: 'conceito',
    source_tec_id: '4003501',
    source_note: '«Consista» após «compreender que» — subjuntivo · AVANÇASP ACS Pref Taiúva 2026 tec 4003501',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Não posso compreender que a literatura consista no culto ao dicionário.» (Lima Barreto) A forma verbal destacada no pensamento acima se encontra no:',
    text_fragment: 'Não posso compreender que a literatura consista no culto ao dicionário.',
    options: [
      { id: 'A', text: 'presente do modo indicativo, sinalizando uma ação concreta, real.', is_correct: false },
      { id: 'B', text: 'presente do modo subjuntivo, indicando uma ação hipotética, provável.', is_correct: true },
      { id: 'C', text: 'modo imperativo afirmativo, indicando uma sugestão ou conselho.', is_correct: false },
      { id: 'D', text: 'modo imperativo negativo, indicando uma advertência ou proibição.', is_correct: false },
      { id: 'E', text: 'futuro do modo subjuntivo, indicando uma ação presa a uma condição do passado.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Subjuntivo após «que»',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Após «compreender que»: indicativo ou subjuntivo?', icon: 'HelpCircle' },
          { label: 'Consista', detail: 'Presente do subjuntivo de «consistir» — opinião subjetiva.', icon: 'BookOpen' },
          { label: 'Indicativo?', detail: '«Consiste» seria fato objetivo — não a visão do autor.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Confundir «consista» com imperativo ou futuro do subjuntivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Opinião + «que» → subjuntivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «consista» no trecho de Lima Barreto.',
          '«Compreender que» introduz ideia subjetiva — exige subjuntivo.',
          '«Consista» = presente do subjuntivo (3ª sing.) — hipótese/opinião.',
          'A indicativo «consiste» teria certeza factual — eliminar.',
          'C/D imperativo exige 2ª pessoa ou ordem — eliminar.',
          'E futuro subjuntivo seria «consistir» — eliminar.',
          'Gabarito B — presente do subjuntivo.',
          'Em similares: verbos de opinião/dúvida + «que» → subjuntivo no presente.',
        ],
        footer_rule: 'B = presente do subjuntivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GATILHOS — SUBJUNTIVO',
        rows: [
          { label: 'Opinião / dúvida + que', value: 'Presente do subjuntivo: «consista», «seja».' },
          { label: 'Consistir — pres. subj.', value: 'que consista · que consistam' },
          { label: 'Indicativo × subj.', value: '«Consiste» (fato) × «consista» (ponto de vista).' },
          { label: 'Nesta questão', value: 'B — presente do subjuntivo.' },
        ],
        footer_rule: 'Subjetividade = subjuntivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Modos trocados na classificação.',
        items: [
          {
            label: 'A — presente indicativo',
            detail: '«Consiste» seria indicativo; «consista» não.',
            correct: 'Após «compreender que»: subjuntivo «consista», não «consiste».',
          },
          {
            label: 'C — imperativo afirmativo',
            detail: 'Imperativo ordena — não opina sobre literatura.',
            correct: '«Consista» aqui é subjuntivo, não ordem «consista!».',
          },
          {
            label: 'D — imperativo negativo',
            detail: 'Não há proibição nem 2ª pessoa de comando.',
            correct: 'Forma subordinada a «que» — subjuntivo, não imperativo.',
          },
          {
            label: 'E — futuro do subjuntivo',
            detail: 'Futuro de «consistir» = «consistir» (mesma grafia, contexto distinto).',
            correct: 'Valor hipotético atual → presente do subjuntivo «consista».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Não aceito que ele minta tanto.»',
            correct: 'Presente do subjuntivo «minta» — opinião + «que».',
          },
        ],
        footer_rule: 'Gabarito B — presente do subjuntivo.',
      },
    ],
  },

  'avancasp-acs-verbos-15-07-2026-19-33-10-88-30-31-cazo-ib-4003519': {
    family: 'conceito',
    source_tec_id: '4003519',
    source_note: '«Tem passado» — pretérito perfeito composto · charge CAZO IBGE · AVANÇASP ACS 2026 tec 4003519',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'A expressão verbal «tem passado», na fala da personagem da charge (trecho abaixo), indica uma ação que:',
    figure_policy: 'transcribed',
    text_fragment: 'O IBGE tem passado por mudanças — mas ainda falta gente para responder ao censo.',
    options: [
      { id: 'A', text: 'está começando no presente e vai continuar até o futuro.', is_correct: false },
      { id: 'B', text: 'começou no passado e continua até o momento da fala.', is_correct: true },
      { id: 'C', text: 'está sendo planejada para acontecer num futuro distante.', is_correct: false },
      { id: 'D', text: 'está sendo planejada para acontecer num futuro próximo.', is_correct: false },
      { id: 'E', text: 'depende de uma condição no passado para acontecer no futuro.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pretérito perfeito composto',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Tem + particípio»: qual valor temporal?', icon: 'Clock' },
          { label: 'Tem passado', detail: 'Auxiliar «ter» no presente + particípio «passado».', icon: 'Link' },
          { label: 'Valor', detail: 'Ação iniciada antes e ainda relevante no momento da fala.', icon: 'Activity' },
          { label: 'Pegadinha', detail: 'Confundir com futuro ou condicional por causa da charge.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ter + particípio = perfeito composto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor semântico de «tem passado».',
          'Estrutura: presente de «ter» + particípio «passado» = pretérito perfeito composto.',
          'Valor: processo começou no passado e se prolonga até agora.',
          'A descreve início no presente — locução não é «está passando» — eliminar.',
          'C/D falam de planejamento futuro — eliminar.',
          'E exige condição passada para futuro — valor de futuro subj. — eliminar.',
          'Gabarito B — passado com continuidade até a fala.',
          'Em similares: «tem chovido», «tenho estudado» = ação passada ainda em curso.',
        ],
        footer_rule: 'B = passado → presente.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PERFEITO COMPOSTO',
        rows: [
          { label: 'Formação', value: 'Ter/haver (pres.) + particípio: «tem passado».' },
          { label: 'Valor', value: 'Início no passado + continuidade/relevância atual.' },
          { label: '≠ futuro', value: 'Não projeta plano; descreve processo em curso.' },
          { label: 'Nesta questão', value: 'B — começou no passado e continua.' },
        ],
        footer_rule: 'Perfeito composto = passado vivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Valores temporais incompatíveis.',
        items: [
          {
            label: 'A — começa agora',
            detail: 'Perfeito composto pressupõe início anterior à fala.',
            correct: '«Tem passado» = passado com eco no presente, não início agora.',
          },
          {
            label: 'C — futuro distante',
            detail: 'Locução não marca planejamento.',
            correct: 'Perfeito composto descreve ação já iniciada — não futura.',
          },
          {
            label: 'D — futuro próximo',
            detail: 'Mesmo erro: valor é retrospectivo-contínuo.',
            correct: 'Auxiliar no presente + particípio = passado até agora.',
          },
          {
            label: 'E — condição passada',
            detail: 'Valor típico de hipótese, não de perfeito composto.',
            correct: '«Tem passado» = continuidade temporal, não protase condicional.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Tenho trabalhado muito esta semana.»',
            correct: 'Perfeito composto — ação passada com continuidade até o momento.',
          },
        ],
        footer_rule: 'Gabarito B — passado com continuidade até a fala.',
      },
    ],
  },

  'apice-acs-pr-verbos-considere-o-texto-a-seguir-para-resp-4024894': {
    family: 'text_fragment',
    source_tec_id: '4024894',
    source_note: '«Adotou» — pretérito perfeito indicativo · Ápice ACS Pref Monteiro 2026 tec 4024894',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref. Monteiro',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o trecho: «Embora tardio, o Brasil adotou relativamente cedo o modelo de universidades públicas, em princípio abertas a todos.» Assinale a alternativa correta sobre o verbo «adotou»:',
    text_fragment:
      'Embora tardio, o Brasil adotou relativamente cedo o modelo de universidades públicas, em princípio abertas a todos.',
    options: [
      {
        id: 'A',
        text: 'o verbo «adotou» encontra-se no tempo pretérito imperfeito do indicativo.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'o verbo «adotou» encontra-se no tempo pretérito mais-que-perfeito do indicativo.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'o verbo «adotou» encontra-se no tempo pretérito perfeito do indicativo.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'o verbo «adotou» encontra-se no tempo pretérito perfeito do subjuntivo.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'o verbo «adotou» encontra-se no tempo pretérito perfeito do imperativo.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pretérito perfeito',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Adotou»: ação pontual concluída ou anterior a outra?', icon: 'Search' },
          { label: 'Adotou', detail: '3ª sing. pretérito perfeito do indicativo de «adotar».', icon: 'CheckCircle' },
          { label: 'Valor', detail: 'Fato histórico encerrado — Brasil adotou o modelo em dado momento.', icon: 'Landmark' },
          { label: 'Pegadinha', detail: 'Confundir com mais-que-perfeito ou imperfeito pela narrativa longa.', icon: 'AlertTriangle' },
        ],
        footer_rule: '-ou = pretérito perfeito do indicativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «adotou» no trecho sobre universidades.',
          'Terminação -ou → pretérito perfeito do indicativo (3ª sing.).',
          'Ação concluída no passado — não continua no imperfeito.',
          'A imperfeito seria «adotava» (habitual/passado contínuo) — eliminar.',
          'B mais-que-perfeito seria «adotara/adotou» anterior a outro passado — eliminar.',
          'D subjuntivo e E imperativo não têm «adotou» nesse valor — eliminar.',
          'Gabarito C — pretérito perfeito do indicativo.',
          'Em similares: -ei/-ou/-aram no indicativo = ação pontual concluída no passado.',
        ],
        footer_rule: 'C = pretérito perfeito indicativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PERFEITO × OUTROS PRETÉRITOS',
        rows: [
          { label: 'Pretérito perfeito', value: 'Ação pontual concluída: «adotou», «criou».' },
          { label: 'Imperfeito', value: 'Habitualidade/passado em curso: «adotava».' },
          { label: 'Mais-que-perfeito', value: 'Anterior a outro passado: «adotara».' },
          { label: 'Nesta questão', value: 'C — «adotou» = perfeito indicativo.' },
        ],
        footer_rule: '-ou terminado = perfeito indicativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Tempos trocados na classificação.',
        items: [
          {
            label: 'A — pretérito imperfeito',
            detail: 'Imperfeito = «adotava» — continuidade ou repetição no passado.',
            correct: '«Adotou» marca fato pontual concluído — perfeito, não imperfeito.',
          },
          {
            label: 'B — mais-que-perfeito',
            detail: 'Exige referência a ação passada anterior a outra.',
            correct: '«Adotou» = perfeito simples; mais-que-perfeito seria «adotara».',
          },
          {
            label: 'D — perfeito subjuntivo',
            detail: 'Subjuntivo perfeito: «adotasse/adotar» — contexto hipotético.',
            correct: 'Frase assertiva histórica → indicativo «adotou».',
          },
          {
            label: 'E — perfeito imperativo',
            detail: 'Imperativo não flexiona em pretérito perfeito assim.',
            correct: '«Adotou» = indicativo; imperativo seria «adote/adotem».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «O país sancionou a lei em 1988.»',
            correct: '«Sancionou» = pretérito perfeito do indicativo — fato pontual.',
          },
        ],
        footer_rule: 'Gabarito C — «adotou» = perfeito indicativo.',
      },
    ],
  },

  'vunesp-aux-s-verbos-leia-o-texto-para-responder-a-questa-3323735': {
    family: 'text_fragment',
    source_tec_id: '3323735',
    source_note: 'Se + futuro subjuntivo «recompuser» · VUNESP Aux Sau Buc Pref Osasco 2025 tec 3323735',
    meta: {
      banca: 'VUNESP',
      prova: 'Aux Sau Buc (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Com base no texto sobre a Santa Casa de São Paulo, assinale a alternativa em que a flexão verbal está de acordo com a norma-padrão:',
    text_fragment:
      'Há uma luz no fim do túnel. No início de 2024 finalmente foi sancionada uma lei federal estabelecendo a revisão periódica da tabela.',
    options: [
      {
        id: 'A',
        text: 'Se não recompor as perdas financeiras de anos, ao menos o aumento da Tabela de repasses as contêm.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Se não recompuser as perdas financeiras de anos, ao menos o aumento da Tabela de repasses as contêm.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Se não recompuser as perdas financeiras de anos, ao menos o aumento da Tabela de repasses as conterá.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Se não recompuserem as perdas financeiras de anos, ao menos o aumento da Tabela de repasses as contêm.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Se não recompuseram as perdas financeiras de anos, ao menos o aumento da Tabela de repasses as continham.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Se + futuro subjuntivo',
        meta: slideMeta,
        items: [
          { label: 'Santa Casa', detail: 'Texto sobre dívidas; lei sancionada em 2024 revisa a tabela de repasses.', icon: 'Building' },
          { label: 'Pergunta-teste', detail: 'Protase «Se não ___»: qual modo? Apódose: qual tempo?', icon: 'GitBranch' },
          { label: 'Revisão da tabela', detail: 'Trecho: lei federal sancionada estabelece revisão periódica da tabela.', icon: 'FileText' },
          { label: 'Recompuser', detail: 'Futuro do subjuntivo de «recompor» — hipótese futura na condicional.', icon: 'Forward' },
          { label: 'Pegadinha', detail: 'Infinitivo «recompor», plural «recompuserem» ou indicativo «recompuseram».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Se + futuro subj. → apódose no futuro do indicativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar frase com flexões corretas na norma-padrão (texto Santa Casa).',
          '«Se não ___ perdas»: hipótese futura → futuro do subjuntivo «recompuser».',
          'Sujeito da apódose «o aumento» (sing.) → verbo no singular «conterá».',
          'A infinitivo «recompor» e «contêm» presente — eliminar.',
          'B «recompuser» ok, mas «contêm» presente — eliminar.',
          'D «recompuserem» plural — sujeito «aumento» é singular — eliminar.',
          'E «recompuseram» indicativo na protase — eliminar.',
          'Gabarito C.',
          'Em similares: «Se + futuro subj.» na protase → futuro indicativo na apódose.',
        ],
        footer_rule: 'C = recompuser · conterá.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONDICIONAL FUTURA',
        rows: [
          { label: 'Protase', value: 'Se + futuro do subjuntivo: «Se não recompuser…»' },
          { label: 'Apódose', value: 'Futuro do indicativo: «…conterá/limitará».' },
          { label: 'Concordância', value: 'Sujeito «aumento» → verbo singular «conterá».' },
          { label: 'Nesta questão', value: 'C — recompuser + conterá.' },
        ],
        footer_rule: 'Hipótese futura = subj. + futuro ind.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros de modo, tempo e concordância.',
        items: [
          {
            label: 'A — recompor · contêm',
            detail: 'Infinitivo na protase; presente na apódose.',
            correct: 'Protase condicional: futuro subj. «recompuser»; apódose: futuro «conterá».',
          },
          {
            label: 'B — recompuser · contêm',
            detail: 'Protase correta, mas apódose no presente.',
            correct: 'Consequência futura → «conterá», não «contêm».',
          },
          {
            label: 'D — recompuserem · contêm',
            detail: 'Verbo plural com sujeito singular «aumento».',
            correct: '«O aumento» → «conterá»; protase segue sujeito elíptico «ele/isto».',
          },
          {
            label: 'E — recompuseram · continham',
            detail: 'Indicativo + pretérito — rompe a condicional futura.',
            correct: 'Hipótese futura exige subjuntivo «recompuser», não «recompuseram».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Se não chover amanhã, faremos piquenique.»',
            correct: 'Futuro subj. «chover» + futuro ind. «faremos» — mesma correlação.',
          },
        ],
        footer_rule: 'Gabarito C — recompuser + conterá.',
      },
    ],
  },

  'selecon-fisc-verbos-inteligencia-artificial-consegue-dec-3352883': {
    family: 'text_fragment',
    source_tec_id: '3352883',
    source_note: 'Auxiliar «foram» — ser pretérito perfeito · SELECON Fisc Pref Sinop 2025 tec 3352883',
    meta: {
      banca: 'SELECON',
      prova: 'Fisc (Pref Sinop)',
      orgao: 'Pref. Sinop',
      ano: '2025',
    },
    instruction:
      'No trecho «os papiros de Herculano que foram queimados durante a erupção do Vesúvio em 79 d.C.», a forma verbal «foram» encontra-se no:',
    text_fragment:
      'Com essa inteligência artificial, os especialistas foram capazes de decifrar os papiros de Herculano que foram queimados durante a erupção do Vesúvio em 79 d.C.',
    options: [
      {
        id: 'A',
        text: 'QUEIMAR, no pretérito perfeito do indicativo.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'IR, no pretérito imperfeito do indicativo.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'SER, no pretérito perfeito do indicativo.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'SER, no pretérito imperfeito do indicativo.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Voz passiva — auxiliar ser',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Foram queimados»: qual verbo auxiliar e qual tempo?', icon: 'Layers' },
          { label: 'Foram', detail: '3ª pl. pretérito perfeito do indicativo de «ser».', icon: 'CheckCircle' },
          { label: 'Passiva', detail: 'Ser + particípio «queimados» — voz passiva sintética.', icon: 'Shuffle' },
          { label: 'Herculano / Vesúvio', detail: 'Trecho: papiros queimados na erupção — «foram» auxilia o particípio.', icon: 'Flame' },
          { label: 'Pegadinha', detail: 'Atribuir «foram» a «ir» ou rotular como imperfeito.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Foram + particípio = ser no perfeito.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «foram» em «foram queimados» (papiros de Herculano).',
          'Estrutura passiva: auxiliar «ser» + particípio «queimados».',
          '«Foram» = pretérito perfeito do indicativo de «ser» (3ª pl.).',
          'A «QUEIMAR perfeito» — «foram» é auxiliar de «ser», não flexão de «queimar» — eliminar.',
          'B «IR imperfeito» — «foram» não é de «ir» (iria/iam) — eliminar.',
          'D «SER imperfeito» — imperfeito seria «eram queimados» — eliminar.',
          'Gabarito C — SER, pretérito perfeito do indicativo.',
          'Em similares: «foi feito», «foram vendidos» — auxiliar ser no tempo da passiva.',
        ],
        footer_rule: 'C = ser · pretérito perfeito.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PASSIVA SINTÉTICA',
        rows: [
          { label: 'Estrutura', value: 'Ser (tempo) + particípio: «foram queimados».' },
          { label: 'Auxiliar', value: 'Pretérito perfeito de «ser»: foi/foram.' },
          { label: '≠ imperfeito', value: 'Passiva no passado contínuo: «eram queimados».' },
          { label: 'Nesta questão', value: 'C — SER, pretérito perfeito indicativo.' },
        ],
        footer_rule: 'Particípio exige «ser/estar» como auxiliar.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Verbo ou tempo errado.',
        items: [
          {
            label: 'A — QUEIMAR perfeito',
            detail: '«Queimados» é particípio; «foram» não flexiona o verbo principal.',
            correct: 'Auxiliar da passiva = «ser» no perfeito, não «queimaram».',
          },
          {
            label: 'B — IR imperfeito',
            detail: '«Foram» não flexiona «ir» — seria «iam» no imperfeito.',
            correct: 'Auxiliar da passiva = «ser», não «ir».',
          },
          {
            label: 'D — SER imperfeito',
            detail: 'Imperfeito da passiva: «eram queimados» (processo/contínuo).',
            correct: 'Fato pontual concluído → perfeito «foram queimados».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «As cartas foram entregues ontem.»',
            correct: '«Foram» = pretérito perfeito de «ser» — passiva sintética.',
          },
        ],
        footer_rule: 'Gabarito C — ser no pretérito perfeito.',
      },
    ],
  },

  'vunesp-an-op-verbos-assinale-a-alternativa-em-que-a-form-3354410': {
    family: 'conceito',
    source_tec_id: '3354410',
    source_note: 'Forma correta «previram» — VUNESP An OP Pref Sertãozinho 2025 tec 3354410',
    meta: {
      banca: 'VUNESP',
      prova: 'An OP (Pref Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
    },
    instruction: 'Assinale a alternativa em que a forma verbal destacada está de acordo com a norma-padrão.',
    options: [
      { id: 'A', text: 'Se você a ver na escola, dê-lhe meu recado.', is_correct: false },
      { id: 'B', text: 'Ontem mantemos todos a decisão de não viajar.', is_correct: false },
      { id: 'C', text: 'Os cientistas não previram essa quantidade de chuvas.', is_correct: true },
      { id: 'D', text: 'Se todos virem aqui amanhã, faremos uma festa linda.', is_correct: false },
      { id: 'E', text: 'O governo interviu a tempo de evitar uma tragédia.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Flexão irregular',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada frase: a forma destacada está na norma culta?', icon: 'ListChecks' },
          { label: 'Previram', detail: 'Pretérito perfeito de «prever» — irregular, mas regularizado na norma.', icon: 'CloudRain' },
          { label: 'Erros clássicos', detail: '«a ver», «mantemos», «virem» (ver×vir), «interviu» (intervir).', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Confundir «vir» (chegar) com «ver» ou «intervir» com «intervir» popular.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Teste cada forma isoladamente.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar a única frase com forma verbal correta.',
          'A «a ver»: futuro subj. de «ver» = «vir» (chegar) → «Se você o vir…» — eliminar.',
          'B «mantemos»: pretérito exige «mantivemos» — eliminar.',
          'C «previram»: pretérito perfeito de «prever» — forma aceita — manter.',
          'D «virem»: futuro subj. de «ver»; sentido é chegar → «vierem» — eliminar.',
          'E «interviu»: de «intervir» → «interveio» — eliminar.',
          'Gabarito C.',
          'Em similares: teste irregularidades (ver/vir, intervir, prever) antes de marcar.',
        ],
        footer_rule: 'C = previram.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IRREGULARES COBRADOS',
        rows: [
          { label: 'Ver × vir', value: 'Ver (olhar): «vir» fut. subj.; Vir (chegar): «vier».' },
          { label: 'Manter', value: 'Pretérito: «mantivemos», não «mantemos».' },
          { label: 'Intervir', value: 'Pretérito: «interveio/intervieram», não «interviu».' },
          { label: 'Nesta questão', value: 'C — «previram» (prever).' },
        ],
        footer_rule: 'Irregular = banca adora.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Formas populares ou trocadas.',
        items: [
          {
            label: 'A — a ver',
            detail: 'Futuro subj. de «ver» confundido; recado pede «vir» (chegar).',
            correct: 'Norma: «Se você o vir na escola…» (vir = chegar).',
          },
          {
            label: 'B — mantemos',
            detail: 'Presente no lugar do pretérito «ontem».',
            correct: 'Marcador «ontem» → «mantivemos a decisão».',
          },
          {
            label: 'D — virem',
            detail: 'Futuro subj. de «ver» onde o sentido é «vir» (chegar).',
            correct: '«Se todos vierem aqui amanhã…» — vir, não ver.',
          },
          {
            label: 'E — interviu',
            detail: 'Flexão popular de «intervir».',
            correct: 'Pretérito de «intervir»: «interveio a tempo…».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Se ele me vir amanhã, avisarei.»',
            correct: 'Futuro subj. de «ver» (olhar) = «vir» — distinto de «vier» (chegar).',
          },
        ],
        footer_rule: 'Gabarito C — «previram» correta.',
      },
    ],
  },

  'avancasp-aee-verbos-o-que-e-angustia-um-rapaz-fez-me-ess-3374802': {
    family: 'conceito',
    source_tec_id: '3374802',
    source_note: '«Acha» com «você» — 3ª pessoa · AVANÇASP AEE Pref Caieiras 2025 tec 3374802',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AEE (Pref Caieiras)',
      orgao: 'Pref. Caieiras',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'A flexão da forma verbal «acha», em «você não acha que há um vazio sinistro em tudo?», indica a:',
    text_fragment: 'Há sim. Enquanto se espera que o coração entenda.',
    options: [
      { id: 'A', text: 'primeira pessoa do singular.', is_correct: false },
      { id: 'B', text: 'segunda pessoa do singular.', is_correct: false },
      { id: 'C', text: 'terceira pessoa do singular.', is_correct: true },
      { id: 'D', text: 'primeira pessoa do plural.', is_correct: false },
      { id: 'E', text: 'segunda pessoa do plural.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pessoa verbal × pronome',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Você» na frase — o verbo concorda em qual pessoa?', icon: 'User' },
          { label: 'Acha', detail: '3ª sing. (ele/ela) — não 2ª «achas» nem 1ª «acho».', icon: 'Hash' },
          { label: 'Pergunta retórica', detail: '«Você não acha que…?» = «Não é verdade que…?»', icon: 'MessageCircle' },
          { label: 'Pegadinha', detail: 'Achar que «você» força 2ª pessoa no verbo «acha».', icon: 'AlertTriangle' },
        ],
        footer_rule: '«Acha» = 3ª pessoa, mesmo com «você».',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: identificar a pessoa de «acha».',
          'Flexão «acha» = 3ª pessoa do singular (ele/ela/ você tratamento).',
          '«Você» pode ser tratamento de 3ª — verbo não vai para «achas».',
          'A «acho» = 1ª sing. — eliminar.',
          'B «achas» = 2ª sing. — forma seria «achas», não «acha» — eliminar.',
          'D/E plural «achamos/acham» — forma é singular — eliminar.',
          'Gabarito C — terceira pessoa do singular.',
          'Em similares: «Você não sabe» — «sabe» 3ª sing., não «sabes».',
        ],
        footer_rule: 'C = 3ª pessoa singular.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PESSOA — VOCÊ + VERBO',
        rows: [
          { label: 'Acha', value: '3ª sing.: ele/ela acha · você acha (forma «acha»).' },
          { label: '2ª sing.', value: 'Seria «achas» — não aparece no trecho.' },
          { label: 'Pergunta tag', value: '«Você não acha que…?» mantém flexão de 3ª.' },
          { label: 'Nesta questão', value: 'C — terceira pessoa do singular.' },
        ],
        footer_rule: 'Olhe a terminação, não só o pronome.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pessoa inferida pelo pronome, não pela flexão.',
        items: [
          {
            label: 'A — 1ª pessoa singular',
            detail: '1ª seria «acho» — forma dada é «acha».',
            correct: 'Terminação -a 3ª sing.: «ele/ela/você acha».',
          },
          {
            label: 'B — 2ª pessoa singular',
            detail: '2ª seria «achas» — pegadinha clássica com «você».',
            correct: '«Você acha» usa flexão de 3ª — «acha», não «achas».',
          },
          {
            label: 'D — 1ª plural',
            detail: '1ª pl. = «achamos» — incompatível com «acha».',
            correct: 'Singular «acha» → 3ª sing., não plural.',
          },
          {
            label: 'E — 2ª plural',
            detail: '2ª pl. = «achais» — forma ausente.',
            correct: '«Acha» só cabe em 3ª pessoa do singular.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique a pessoa: «Você não concorda com isso?»',
            correct: '«Concorda» = 3ª sing. — mesmo fenômeno de «você» + 3ª.',
          },
        ],
        footer_rule: 'Gabarito C — terceira pessoa do singular.',
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
