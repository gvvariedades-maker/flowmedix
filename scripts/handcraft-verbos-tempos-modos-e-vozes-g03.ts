#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — verbos-tempos-modos-e-vozes-g03 (8 slugs · Verbos · lote 3).
 *
 *   npx tsx scripts/handcraft-verbos-tempos-modos-e-vozes-g03.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'verbos-tempos-modos-e-vozes-g03';
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
    'imperativo',
    'modo',
    'pretérito perfeito',
    'pretérito imperfeito',
    'pretérito imperfeito do subjuntivo',
    'particípio',
    'futuro do pretérito',
    'presente do indicativo',
    'ordem direta/indireta',
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
      reviewer: 'handcraft:verbos-tempos-modos-e-vozes-g03',
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
  'fgv-tec-ebse-verbos-assinale-a-frase-que-nao-mostra-uma-3385119': {
    family: 'conceito',
    source_tec_id: '3385119',
    source_note: 'EXCETO ordem — imperativo × enunciado factual · FGV Tec EBSERH 2025 tec 3385119',
    meta: {
      banca: 'FGV',
      prova: 'Tec (EBSERH) Citopatologia',
      orgao: 'EBSERH',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a frase que não mostra uma ordem de forma direta ou indireta.',
    options: [
      { id: 'A', text: 'Tente não gastar todo o seu dinheiro.', is_correct: false },
      { id: 'B', text: 'Lembre-me daqui a dois dias.', is_correct: false },
      { id: 'C', text: 'Que ela venha aqui amanhã de manhã.', is_correct: false },
      { id: 'D', text: 'A chuva vai continuar por todo o dia.', is_correct: true },
      { id: 'E', text: 'Tome um comprimido a cada dia.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ordem × enunciado',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'A frase manda, pede ou só informa um fato?', icon: 'HelpCircle' },
          { label: 'Ordem direta', detail: 'Imperativo: «tente», «tome», «lembre-me».', icon: 'Megaphone' },
          { label: 'Ordem indireta', detail: 'Subjuntivo desiderativo: «Que ela venha…».', icon: 'MessageCircle' },
          { label: 'Pegadinha', detail: 'Futuro «vai continuar» parece previsão — não é ordem.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EXCETO: achar a frase sem valor de comando.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar a frase que NÃO é ordem (direta ou indireta).',
          'A «Tente…» = imperativo — ordem direta — eliminar (é ordem).',
          'B «Lembre-me…» = imperativo — pedido/ordem — eliminar.',
          'C «Que ela venha…» = subjuntivo desiderativo — ordem indireta — eliminar.',
          'E «Tome…» = imperativo — ordem médica típica — eliminar.',
          'D «A chuva vai continuar…» = previsão/fato futuro — sem comando a alguém.',
          'Gabarito D — enunciado factual, não ordem.',
          'Em similares: EXCETO ordem → isole a frase sem destinatário de comando.',
        ],
        footer_rule: 'D = fato/previsão, não imperativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ORDEM — DIRETA × INDIRETA',
        rows: [
          { label: 'Direta', value: 'Imperativo: «tente», «tome», «lembre».' },
          { label: 'Indireta', value: '«Que + subjuntivo»: desejo com força de comando.' },
          { label: 'Não-ordem', value: 'Afirmação/previsão: «vai continuar», «está chovendo».' },
          { label: 'Nesta questão', value: 'D — chuva = fato futuro, sem ordem.' },
        ],
        footer_rule: 'Ordem precisa de destinatário (implícito ou explícito).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Frases que SÃO ordem — por que não são o EXCETO.',
        items: [
          {
            label: 'A — Tente não gastar…',
            detail: 'Imperativo «tente» = conselho/ordem direta.',
            correct: 'É ordem direta — o EXCETO pede a frase sem comando.',
          },
          {
            label: 'B — Lembre-me…',
            detail: 'Imperativo «lembre» = pedido de ação.',
            correct: 'Pedido no imperativo = ordem direta — não é o EXCETO.',
          },
          {
            label: 'C — Que ela venha…',
            detail: 'Subjuntivo desiderativo funciona como ordem indireta.',
            correct: '«Que + venha» = comando indireto — não é o EXCETO.',
          },
          {
            label: 'E — Tome um comprimido…',
            detail: 'Imperativo «tome» = prescrição/ordem.',
            correct: 'Ordem direta clássica — não é o EXCETO.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «O sol vai nascer às seis.» — ordem ou fato?',
            correct: 'Presente/futuro factual — previsão, não imperativo (mesma linha de D).',
          },
        ],
        footer_rule: 'Gabarito D — só a chuva não ordena.',
      },
    ],
  },

  'selecon-athh-verbos-quando-eu-deixei-de-acreditar-em-mim-3416674': {
    family: 'text_fragment',
    source_tec_id: '3416674',
    source_note: '«deixei» — pretérito perfeito · SELECON ATHH HEMOMINAS 2025 tec 3416674',
    meta: {
      banca: 'SELECON',
      prova: 'ATHH (HEMOMINAS) Aux. Adm.',
      orgao: 'HEMOMINAS',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «Quando eu deixei de acreditar em mim», a forma verbal destacada está no:',
    text_fragment:
      'Quando foi que deixei de acreditar na única pessoa em quem deveria confiar sempre? Dia desses, me peguei tentando me lembrar quando foi que eu deixei de acreditar em mim mesma.',
    options: [
      { id: 'A', text: 'pretérito perfeito do indicativo', is_correct: true },
      { id: 'B', text: 'pretérito imperfeito do indicativo', is_correct: false },
      { id: 'C', text: 'pretérito imperfeito do subjuntivo', is_correct: false },
      { id: 'D', text: 'pretérito mais-que-perfeito do indicativo', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pretérito — três pontos',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Deixei»: ação pontual concluída ou fundo habitual?', icon: 'Clock' },
          { label: 'Deixei', detail: '1ª sing. do pretérito perfeito — fato encerrado no passado.', icon: 'CheckCircle' },
          { label: 'Linha do tempo', detail: 'Perfeito = ponto; imperfeito = curso; mais-que-perfeito = antes.', icon: 'GitBranch' },
          { label: 'Pegadinha', detail: 'Trocar por imperfeito («deixava») ou mais-que-perfeito («deixara»).', icon: 'AlertTriangle' },
        ],
        footer_rule: '«-ei» em 1ª sing. = perfeito (deixei, fiz, saí).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar o tempo/modo de «deixei».',
          '«Deixei» = 1ª pessoa singular — ação concluída («quando foi que…»).',
          'Valor: pretérito perfeito do indicativo — fato pontual no passado.',
          'B imperfeito seria «deixava» — fundo/hábito — eliminar.',
          'C imperfeito do subjuntivo seria «deixasse» — hipótese — eliminar.',
          'D mais-que-perfeito seria «deixara» / «tinha deixado» — anterioridade — eliminar.',
          'Gabarito A — pretérito perfeito do indicativo.',
          'Em similares: «-ei/-i» pontual no passado → perfeito, não imperfeito.',
        ],
        footer_rule: 'A = pretérito perfeito.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRETÉRITOS — INDICATIVO',
        rows: [
          { label: 'Perfeito', value: 'Ação concluída: «deixei», «fiz», «saí».' },
          { label: 'Imperfeito', value: 'Curso/hábito: «deixava», «fazia».' },
          { label: 'Mais-que-perfeito', value: 'Anterior a outro passado: «deixara», «tinha deixado».' },
          { label: 'Nesta questão', value: 'A — «deixei» = pretérito perfeito.' },
        ],
        footer_rule: 'Pergunte: ponto, curso ou «já antes»?',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Tempos vizinhos que não são «deixei».',
        items: [
          {
            label: 'B — pretérito imperfeito',
            detail: 'Imperfeito seria «deixava» — fundo, não o corte «quando foi que».',
            correct: 'Imperfeito = curso/habitual; «deixei» = perfeito pontual.',
          },
          {
            label: 'C — imperfeito do subjuntivo',
            detail: 'Subjuntivo seria «deixasse» — hipótese, não fato narrado.',
            correct: '«Deixei» é indicativo (fato); subjuntivo = «deixasse».',
          },
          {
            label: 'D — mais-que-perfeito',
            detail: 'Mais-que-perfeito marca anterioridade («já tinha deixado»).',
            correct: 'Mais-que-perfeito = anterior; «deixei» = perfeito simples.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Quando cheguei ao plantão, o plantão já tinha começado.» — «cheguei»',
            correct: 'Pretérito perfeito «cheguei» — ação pontual concluída (mesmo valor de «deixei»).',
          },
        ],
        footer_rule: 'Gabarito A — pretérito perfeito do indicativo.',
      },
    ],
  },

  'ibfc-tec-enf-verbos-analise-o-texto-e-responda-a-questao-3450762': {
    family: 'text_fragment',
    source_tec_id: '3450762',
    source_note: '«diz» — presente recorrente · IBFC Tec Enf SES SE 2025 tec 3450762',
    meta: {
      banca: 'IBFC',
      prova: 'Tec Enf (SES SE)',
      orgao: 'SES SE',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em “Mamãe diz que é perda de tempo esse meu sentimentalismo com as cartas”, a flexão do verbo em destaque indica uma ação:',
    text_fragment:
      'Mamãe diz que é perda de tempo esse meu sentimentalismo com as cartas, mas não há outra maneira de falar com a senhora…',
    options: [
      { id: 'A', text: 'realizada de forma, relativamente, recorrente.', is_correct: true },
      { id: 'B', text: 'ocorrida em um momento pontual do passado.', is_correct: false },
      { id: 'C', text: 'desenvolvida apenas no momento da enunciação.', is_correct: false },
      { id: 'D', text: 'futura, mas programada em um passado próximo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Presente — valor habitual',
        meta: slideMeta,
        items: [
          {
            label: 'Pergunta-teste',
            detail: '«Mamãe diz»: agora só, hábito ou passado pontual?',
            icon: 'HelpCircle',
          },
          {
            label: 'Mamãe diz',
            detail: 'Presente do indicativo — fala habitual sobre o sentimentalismo com as cartas.',
            icon: 'Repeat',
          },
          {
            label: 'Cartas / senhora',
            detail: 'Contexto: falar com a senhora por cartas — opinião recorrente da mamãe.',
            icon: 'Mail',
          },
          {
            label: 'Pegadinha',
            detail: 'Ler «diz» como «disse» ou só o instante da enunciação.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Presente = agora, hábito ou verdade geral.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor aspectual de «diz» em «Mamãe diz que é perda de tempo…».',
          'Mamãe diz que o sentimentalismo com as cartas é perda de tempo — opinião/atitude repetida.',
          'Presente do indicativo com leitura habitual/recorrente (não um instante único).',
          'B passado pontual seria «disse» — eliminar.',
          'C «só no instante da fala» ignora o hábito da mamãe sobre as cartas — eliminar.',
          'D futuro programado no passado seria «ia dizer» / «diria» — eliminar.',
          'Gabarito A — ação relativamente recorrente.',
          'Em similares: «mamãe diz / o técnico confere» → presente habitual, não perfeito.',
        ],
        footer_rule: 'A = presente habitual/recorrente.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRESENTE DO INDICATIVO',
        rows: [
          { label: 'Atual', value: 'Ação no momento: «estou», «escrevo agora».' },
          {
            label: 'Habitual',
            value: 'Recorrência: «Mamãe diz», «sentimentalismo com as cartas».',
          },
          { label: '≠ Perfeito', value: '«Disse» = um fato pontual no passado.' },
          { label: 'Nesta questão', value: 'A — «diz» (mamãe) = recorrente.' },
        ],
        footer_rule: 'Presente ≠ só «agora neste segundo».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Leituras que deslocam o valor de «diz» (cartas / senhora).',
        items: [
          {
            label: 'B — momento pontual do passado',
            detail: 'Passado pontual seria «disse» — perfeito.',
            correct: '«Mamãe diz» = presente; pontual passado = pretérito perfeito «disse».',
          },
          {
            label: 'C — só no momento da enunciação',
            detail: 'Reduz demais: mamãe julga o sentimentalismo com as cartas por hábito.',
            correct: 'Presente habitual = recorrente, não só o instante de falar com a senhora.',
          },
          {
            label: 'D — futura programada no passado',
            detail: 'Valor de futuro no passado não cabe em «diz».',
            correct: 'Futuro do pretérito / «ia + inf.» — não o presente «diz».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «A tia sempre diz que as cartas são perda de tempo.» — «diz»',
            correct: 'Presente do indicativo — ação habitual/recorrente (mesmo valor de «Mamãe diz»).',
          },
        ],
        footer_rule: 'Gabarito A — recorrente.',
      },
    ],
  },

  'avancasp-ana-verbos-leia-o-texto-a-seguir-para-responder-3460031': {
    family: 'text_fragment',
    source_tec_id: '3460031',
    source_note: '«houvesse sido» — imperfeito subj. + particípio · AVANÇASP Ana FUSAM 2025 tec 3460031',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ana (FUSAM) Controladoria',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «Suspeitava-se que em sua mocidade houvesse sido um terrível pirata», as formas verbais «houvesse» e «sido», nessa ordem, estão no:',
    text_fragment:
      'E havia um velho mendigo que tinha uma perna de pau. Suspeitava-se que em sua mocidade houvesse sido um terrível pirata; de qualquer maneira era agora apenas um velho mendigo…',
    options: [
      { id: 'A', text: 'presente do subjuntivo e particípio.', is_correct: false },
      { id: 'B', text: 'pretérito imperfeito do subjuntivo e particípio.', is_correct: true },
      { id: 'C', text: 'pretérito imperfeito do indicativo e particípio.', is_correct: false },
      { id: 'D', text: 'pretérito perfeito do indicativo e particípio.', is_correct: false },
      { id: 'E', text: 'pretérito imperfeito do indicativo e imperativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Locução no subjuntivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Após «suspeitava-se que»: indicativo ou subjuntivo?', icon: 'HelpCircle' },
          { label: 'Houvesse', detail: 'Pretérito imperfeito do subjuntivo de «haver».', icon: 'Cloud' },
          { label: 'Sido', detail: 'Particípio de «ser» — completa a locução.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Ler «houvesse» como imperfeito do indicativo («havia»).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Dúvida + «que» → subjuntivo + particípio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «houvesse» e «sido» nessa ordem.',
          '«Suspeitava-se que…» introduz incerteza — puxa subjuntivo.',
          '«Houvesse» = pretérito imperfeito do subjuntivo; «sido» = particípio.',
          'A presente do subjuntivo seria «haja» — eliminar.',
          'C/D indicativo («havia» / «houve») — não casa com «houvesse» — eliminar.',
          'E «sido» não é imperativo — eliminar.',
          'Gabarito B — imperfeito do subjuntivo + particípio.',
          'Em similares: «que + -esse/-asse» = imperfeito do subjuntivo.',
        ],
        footer_rule: 'B = imperfeito subj. + particípio.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HOUVER × SUBJUNTIVO',
        rows: [
          { label: 'Imperfeito subj.', value: '«houvesse», «fosse», «tivesse».' },
          { label: 'Presente subj.', value: '«haja», «seja», «tenha».' },
          { label: 'Particípio', value: '«sido», «feito», «dito» — sem flexão de tempo sozinho.' },
          { label: 'Nesta questão', value: 'B — houvesse + sido.' },
        ],
        footer_rule: 'Locução: auxiliar no modo/tempo + particípio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocas de modo/tempo na dupla.',
        items: [
          {
            label: 'A — presente do subjuntivo + particípio',
            detail: 'Presente seria «haja sido» — forma dada é «houvesse».',
            correct: '«Houvesse» = imperfeito do subjuntivo, não presente «haja».',
          },
          {
            label: 'C — imperfeito do indicativo + particípio',
            detail: 'Indicativo seria «havia sido» — outra forma.',
            correct: '«Houvesse» = subjuntivo; «havia» = indicativo.',
          },
          {
            label: 'D — perfeito do indicativo + particípio',
            detail: 'Perfeito seria «houve sido» — não ocorre assim.',
            correct: 'Não é perfeito; é imperfeito do subjuntivo + particípio.',
          },
          {
            label: 'E — imperfeito do indicativo + imperativo',
            detail: '«Sido» não ordena — é particípio.',
            correct: '2ª forma = particípio «sido», nunca imperativo.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Duvidavam que ele tivesse ido ao plantão.» — «tivesse» e «ido»',
            correct: 'Pretérito imperfeito do subjuntivo + particípio (mesmo par de B).',
          },
        ],
        footer_rule: 'Gabarito B — imperfeito subj. + particípio.',
      },
    ],
  },

  'selecon-acs-verbos-leia-o-texto-a-seguir-para-responder-3586919': {
    family: 'text_fragment',
    source_tec_id: '3586919',
    source_note: '«obtiveram» — pretérito perfeito · SELECON ACS Pref LRV 2025 tec 3586919',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (Pref L do Rio Verde)',
      orgao: 'Pref. Lagoa do Rio Verde',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em “cientistas que utilizam o Telescópio Espacial James Webb obtiveram o que consideram os mais fortes sinais…”, a forma verbal destacada está flexionada no:',
    text_fragment:
      'Em uma descoberta potencialmente marcante, cientistas que utilizam o Telescópio Espacial James Webb obtiveram o que consideram os mais fortes sinais de possível existência de vida além do sistema solar…',
    options: [
      { id: 'A', text: 'pretérito perfeito do indicativo', is_correct: true },
      { id: 'B', text: 'pretérito imperfeito do indicativo', is_correct: false },
      { id: 'C', text: 'pretérito imperfeito do subjuntivo', is_correct: false },
      { id: 'D', text: 'pretérito mais-que-perfeito do indicativo', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Obtiveram — ponto no passado',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Obtiveram»: fato concluído ou fundo contínuo?', icon: 'Clock' },
          { label: 'Obtiveram', detail: '3ª pl. do pretérito perfeito — descoberta pontual.', icon: 'CheckCircle' },
          { label: 'Utilizam', detail: 'Presente do relativo — não confundir com o verbo pedido.', icon: 'Filter' },
          { label: 'Pegadinha', detail: 'Marcar imperfeito («obtinham») por causa do contexto científico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Foque o verbo destacado, não o relativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «obtiveram» (não «utilizam»).',
          '«Obtiveram» = 3ª pessoa do plural — fato concluído da descoberta.',
          'Tempo/modo: pretérito perfeito do indicativo.',
          'B imperfeito seria «obtinham» — curso — eliminar.',
          'C subjuntivo seria «obtivessem» — hipótese — eliminar.',
          'D mais-que-perfeito seria «obtivera(m)» / «tinham obtido» — eliminar.',
          'Gabarito A — pretérito perfeito do indicativo.',
          'Em similares: -eram/-aram em 3ª pl. = perfeito, não imperfeito.',
        ],
        footer_rule: 'A = pretérito perfeito.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRETÉRITO PERFEITO — 3ª PL.',
        rows: [
          { label: 'Perfeito', value: '«obtiveram», «fizeram», «chegaram» — fato concluído.' },
          { label: 'Imperfeito', value: '«obtinham», «faziam» — curso/hábito.' },
          { label: 'Mais-que-perfeito', value: '«obtivera» / «tinham obtido» — anterioridade.' },
          { label: 'Nesta questão', value: 'A — «obtiveram» = perfeito.' },
        ],
        footer_rule: 'Terminação -eram/-aram → perfeito.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Tempos vizinhos de «obtiveram».',
        items: [
          {
            label: 'B — pretérito imperfeito',
            detail: 'Imperfeito seria «obtinham» — processo contínuo.',
            correct: 'Imperfeito = curso; «obtiveram» = perfeito pontual.',
          },
          {
            label: 'C — imperfeito do subjuntivo',
            detail: 'Subjuntivo seria «obtivessem» — hipótese.',
            correct: '«Obtiveram» é indicativo (fato); subjuntivo = «obtivessem».',
          },
          {
            label: 'D — mais-que-perfeito',
            detail: 'Mais-que-perfeito marca «já antes» de outro passado.',
            correct: 'Mais-que-perfeito ≠ perfeito simples «obtiveram».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Os técnicos obtiveram o resultado do exame.» — «obtiveram»',
            correct: 'Pretérito perfeito do indicativo — ação concluída (mesmo valor de A).',
          },
        ],
        footer_rule: 'Gabarito A — pretérito perfeito do indicativo.',
      },
    ],
  },

  'vunesp-ade-g-verbos-leia-a-tira-para-responder-a-questao-3607391': {
    family: 'text_fragment',
    source_tec_id: '3607391',
    source_note: 'Imperativo «você» — esforce-se / não tire · VUNESP ADE Guararapes 2025 tec 3607391',
    meta: {
      banca: 'VUNESP',
      prova: 'ADE (Pref Guararapes)',
      orgao: 'Pref. Guararapes',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considerando a interlocução com o uso do pronome “Você”, as informações do segundo quadrinho admitem a reescrita:',
    figure_policy: 'transcribed',
    text_fragment:
      'Calvin (tira): interlocução com “Você” — conselho no segundo quadrinho = esforço + não tirar notas baixas.',
    options: [
      { id: 'A', text: 'Então, esforce-se mais e não tire notas baixas.', is_correct: true },
      { id: 'B', text: 'Então, esforça-se mais e não tire notas baixas.', is_correct: false },
      { id: 'C', text: 'Então, esforce-se mais e não tira notas baixas.', is_correct: false },
      { id: 'D', text: 'Então, esforça-se mais e não tira notas baixas.', is_correct: false },
      { id: 'E', text: 'Então, esforças-se mais e não tires notas baixas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Imperativo com «Você»',
        meta: slideMeta,
        items: [
          {
            label: 'Pergunta-teste',
            detail: 'Interlocução com o pronome «Você»: flexão de tu ou de você na reescrita?',
            icon: 'HelpCircle',
          },
          {
            label: 'Segundo quadrinho',
            detail: 'Informações do segundo quadrinho = esforço + não tirar notas baixas.',
            icon: 'LayoutGrid',
          },
          { label: 'Afirmativo', detail: 'Reescrita: «Esforce-se» (você) — não «esforça-se» (tu).', icon: 'Megaphone' },
          { label: 'Pegadinha', detail: 'Misturar tu («esforça/tires») com o pronome «Você».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pronome Você = 3ª pessoa no imperativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: interlocução com o pronome «Você» — reescrita do segundo quadrinho.',
          'Afirmativo você: «esforce-se» (ênclise) — não «esforça-se» (tu).',
          'Negativo você: «não tire» — não «não tira» (indicativo) nem «não tires» (tu).',
          'B/D usam «esforça-se» (tu) — eliminar.',
          'C «não tira» = indicativo, não imperativo negativo — eliminar.',
          'E «esforças-se / tires» = paradigma de tu — eliminar.',
          'Gabarito A — reescrita: esforce-se + não tire.',
          'Em similares: pronome Você + reescrita afirmativa = forma de ele/ela; negativo = «não» + subjuntivo.',
        ],
        footer_rule: 'A = imperativo Você completo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMPERATIVO — PRONOME VOCÊ × TU',
        rows: [
          { label: 'Você afirmativo', value: 'Reescrita: «esforce-se», «fale», «estude».' },
          { label: 'Você negativo', value: '«não tire», «não fale», «não estude».' },
          { label: 'Tu afirmativo', value: '«esforça-te», «fala», «estuda».' },
          { label: 'Nesta questão', value: 'A — segundo quadrinho: esforce-se + não tire.' },
        ],
        footer_rule: 'Não misture tu e Você na mesma reescrita.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Misturas tu/Você e indicativo no negativo da reescrita.',
        items: [
          {
            label: 'B — esforça-se + não tire',
            detail: '«Esforça-se» é paradigma de tu; interlocução pede o pronome «Você».',
            correct: 'Afirmativo Você = «esforce-se» — não «esforça-se».',
          },
          {
            label: 'C — esforce-se + não tira',
            detail: '«Não tira» é indicativo, não imperativo negativo na reescrita.',
            correct: 'Negativo Você = «não tire» (subjuntivo), não «não tira».',
          },
          {
            label: 'D — esforça-se + não tira',
            detail: 'Duas formas de tu/indicativo — fora do pronome «Você».',
            correct: 'Par de Você no segundo quadrinho: «esforce-se» + «não tire».',
          },
          {
            label: 'E — esforças-se + não tires',
            detail: 'Paradigma completo de tu — enunciado pede interlocução com «Você».',
            correct: 'Com o pronome «Você»: 3ª pessoa — «esforce-se» / «não tire».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique o modo na reescrita: «Não tire o cateter sem técnica.»',
            correct: 'Imperativo negativo (Você) — «não» + presente do subjuntivo.',
          },
        ],
        footer_rule: 'Gabarito A — reescrita esforce-se + não tire.',
      },
    ],
  },

  'cpcon-uepb-a-verbos-leia-o-texto-i-para-responder-a-ques-3651721': {
    family: 'text_fragment',
    source_tec_id: '3651721',
    source_note: '«rolaria» — futuro do pretérito · CPCON Ag Adm Pref São Bentinho 2025 tec 3651721',
    meta: {
      banca: 'CPCON',
      prova: 'Ag Adm (Pref São Bentinho)',
      orgao: 'Pref. São Bentinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'No trecho “rolaria por ali de tanto rir”, o verbo “rolaria” está flexionado no:',
    text_fragment:
      'Comecei a rir e tanto que se o chão não estivesse ocupado, rolaria por ali de tanto rir.',
    options: [
      { id: 'A', text: 'pretérito do modo subjuntivo.', is_correct: false },
      { id: 'B', text: 'futuro do presente do modo imperativo.', is_correct: false },
      { id: 'C', text: 'pretérito imperfeito do modo indicativo.', is_correct: false },
      { id: 'D', text: 'presente do modo subjuntivo.', is_correct: false },
      { id: 'E', text: 'futuro do pretérito do modo indicativo.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Futuro do pretérito',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Rolaria»: fato passado, hipótese ou ordem?', icon: 'HelpCircle' },
          { label: 'Rolaria', detail: 'Futuro do pretérito — posterioridade vista do passado.', icon: 'CornerDownRight' },
          { label: 'Se…', detail: 'Correlação com «se o chão não estivesse» — condicional.', icon: 'GitBranch' },
          { label: 'Pegadinha', detail: 'Chamar de «pretérito do subjuntivo» por causa do «se».', icon: 'AlertTriangle' },
        ],
        footer_rule: '«-ria» = futuro do pretérito (indicativo).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «rolaria» no trecho condicional.',
          'Terminação «-ria» = futuro do pretérito do indicativo.',
          'Valor: ação hipotética/posterior vista do passado («rolaria se…»).',
          'A «pretérito do subjuntivo» seria «rolasse» — eliminar.',
          'B imperativo não tem «futuro do presente» nessa forma — eliminar.',
          'C imperfeito indicativo seria «rolava» — eliminar.',
          'D presente subjuntivo seria «role» — eliminar.',
          'Gabarito E — futuro do pretérito do indicativo.',
          'Em similares: «-ria/-riam» → futuro do pretérito, não subjuntivo.',
        ],
        footer_rule: 'E = futuro do pretérito.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FUTURO DO PRETÉRITO',
        rows: [
          { label: 'Forma', value: '«rolaria», «faria», «diria» — -ria.' },
          { label: 'Valor', value: 'Hipótese / posterioridade no passado.' },
          { label: '≠ Subjuntivo', value: '«Rolasse» = imperfeito do subjuntivo.' },
          { label: 'Nesta questão', value: 'E — futuro do pretérito.' },
        ],
        footer_rule: 'Condicional clássico = futuro do pretérito.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Rótulos que deslocam «rolaria».',
        items: [
          {
            label: 'A — pretérito do subjuntivo',
            detail: 'Subjuntivo seria «rolasse» — forma diferente.',
            correct: '«Rolaria» = futuro do pretérito (indicativo), não «rolasse».',
          },
          {
            label: 'B — futuro do presente / imperativo',
            detail: 'Imperativo não se rotula assim; futuro do presente = «rolarei».',
            correct: '«-ria» ≠ imperativo e ≠ futuro do presente.',
          },
          {
            label: 'C — pretérito imperfeito',
            detail: 'Imperfeito seria «rolava» — fundo no passado.',
            correct: 'Imperfeito = «rolava»; «rolaria» = futuro do pretérito.',
          },
          {
            label: 'D — presente do subjuntivo',
            detail: 'Presente subjuntivo seria «role».',
            correct: 'Presente subjuntivo ≠ «rolaria» (-ria).',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Se chovesse, o plantão atrasaria.» — «atrasaria»',
            correct: 'Futuro do pretérito do indicativo — hipótese vista do passado.',
          },
        ],
        footer_rule: 'Gabarito E — futuro do pretérito do indicativo.',
      },
    ],
  },

  'cpcon-uepb-a-verbos-leia-o-texto-i-para-responder-a-ques-3654541': {
    family: 'text_fragment',
    source_tec_id: '3654541',
    source_note: '«rolaria» — futuro do pretérito · CPCON ACS Pref R Sto Antônio 2025 tec 3654541',
    meta: {
      banca: 'CPCON',
      prova: 'ACS (Pref R Sto Antônio)',
      orgao: 'Pref. Riacho de Santo Antônio',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'No trecho “rolaria por ali de tanto rir”, o verbo “rolaria” está flexionado no:',
    text_fragment:
      'Uma formiguinha desgarrada sacudia a cabeça entre as mãos. Comecei a rir e tanto que se o chão não estivesse ocupado, rolaria por ali de tanto rir.',
    options: [
      { id: 'A', text: 'pretérito do modo subjuntivo.', is_correct: false },
      { id: 'B', text: 'futuro do presente do modo imperativo.', is_correct: false },
      { id: 'C', text: 'pretérito imperfeito do modo indicativo.', is_correct: false },
      { id: 'D', text: 'presente do modo subjuntivo.', is_correct: false },
      { id: 'E', text: 'futuro do pretérito do modo indicativo.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Condicional na narrativa',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'No conto, «rolaria» marca fato ou hipótese?', icon: 'HelpCircle' },
          { label: 'Se + estivesse', detail: 'Protase no imperfeito do subjuntivo puxa -ria.', icon: 'GitBranch' },
          { label: 'Rolaria', detail: 'Futuro do pretérito — resultado hipotético.', icon: 'CornerDownRight' },
          { label: 'Pegadinha', detail: 'Rotular como pretérito/subjuntivo por estar no passado narrativo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mesma forma da prova-irmã — foque a terminação -ria.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: tempo e modo de «rolaria» no trecho das formigas.',
          'Correlação: «se … estivesse» + «rolaria» = condicional clássico.',
          '«Rolaria» = futuro do pretérito do modo indicativo.',
          'A seria «rolasse» (subjuntivo) — eliminar.',
          'B não descreve imperativo — eliminar.',
          'C «rolava» seria imperfeito — eliminar.',
          'D «role» seria presente do subjuntivo — eliminar.',
          'Gabarito E — futuro do pretérito do indicativo.',
          'Em similares: apodose com -ria após «se + -esse» → futuro do pretérito.',
        ],
        footer_rule: 'E = futuro do pretérito.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CORRELAÇÃO CONDICIONAL',
        rows: [
          { label: 'Se + imperf. subj.', value: '«se estivesse», «se chovesse».' },
          { label: 'Apodose', value: 'Futuro do pretérito: «rolaria», «iria».' },
          { label: 'Forma-chave', value: 'Terminação -ria = futuro do pretérito.' },
          { label: 'Nesta questão', value: 'E — «rolaria».' },
        ],
        footer_rule: 'Não confunda apodose (-ria) com protase (-esse).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros de rótulo em «rolaria» (prova ACS).',
        items: [
          {
            label: 'A — pretérito do subjuntivo',
            detail: 'Confunde a protase («estivesse») com a apodose.',
            correct: '«Rolaria» é indicativo futuro do pretérito; subjuntivo seria «rolasse».',
          },
          {
            label: 'B — futuro do presente / imperativo',
            detail: 'Não há ordem; futuro do presente seria «rolarei».',
            correct: 'Sem imperativo; -ria ≠ futuro do presente.',
          },
          {
            label: 'C — pretérito imperfeito',
            detail: '«Rolava» descreve curso — não a hipótese «rolaria».',
            correct: 'Imperfeito = «rolava»; condicional = «rolaria».',
          },
          {
            label: 'D — presente do subjuntivo',
            detail: 'Presente seria «role» — grafia e valor distintos.',
            correct: 'Presente do subjuntivo ≠ futuro do pretérito.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Se o médico liberasse, a alta sairia hoje.» — «sairia»',
            correct: 'Futuro do pretérito do indicativo — apodose condicional.',
          },
        ],
        footer_rule: 'Gabarito E — futuro do pretérito do indicativo.',
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
