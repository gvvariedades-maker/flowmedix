#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — verbos-tempos-modos-e-vozes-g05 (8 slugs · Verbos · lote 5).
 *
 *   npx tsx scripts/handcraft-verbos-tempos-modos-e-vozes-g05.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'verbos-tempos-modos-e-vozes-g05';
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
    'futuro do pretérito',
    'pretérito perfeito',
    'presente do indicativo',
    'correlação temporal',
    'locução verbal',
    'estar + gerúndio',
    'vir + gerúndio',
    'imperfeito do subjuntivo',
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
      reviewer: 'handcraft:verbos-tempos-modos-e-vozes-g05',
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
  'selecon-afar-verbos-leia-o-texto-a-seguir-apaixonados-po-3770517': {
    family: 'text_fragment',
    source_tec_id: '3770517',
    source_note: '«teria» — futuro do pretérito · SELECON AFarm Barra do Garças 2025 tec 3770517',
    meta: {
      banca: 'SELECON',
      prova: 'AFarm (Pref Barra do Garças)',
      orgao: 'Pref. Barra do Garças',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '“Você teria coragem de pegar um morcego com as próprias mãos?”. A forma verbal destacada está flexionada no:',
    text_fragment:
      'Você teria coragem de pegar um morcego com as próprias mãos? A resposta mais comum é um “não” decidido. Os morcegos são peças-chave para o equilíbrio ambiental.',
    options: [
      { id: 'A', text: 'presente do indicativo', is_correct: false },
      { id: 'B', text: 'futuro do pretérito do indicativo', is_correct: true },
      { id: 'C', text: 'pretérito imperfeito do indicativo', is_correct: false },
      { id: 'D', text: 'pretérito imperfeito do subjuntivo', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Teria — hipótese',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Teria» (morcego / coragem): fato atual ou hipótese?', icon: 'HelpCircle' },
          { label: 'Teria', detail: 'Futuro do pretérito — possibilidade / pergunta retórica.', icon: 'Cloud' },
          { label: 'Morcego', detail: 'Contexto: pegar um morcego com as próprias mãos.', icon: 'Bug' },
          { label: 'Pegadinha', detail: 'Confundir com imperfeito «tinha» ou presente «tem».', icon: 'AlertTriangle' },
        ],
        footer_rule: '-ria = futuro do pretérito.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «teria» — coragem de pegar um morcego.',
          'Terminação «-ria» = futuro do pretérito do indicativo.',
          'Valor: hipótese / cortesia na pergunta retórica.',
          'A presente seria «tem» — eliminar.',
          'C imperfeito seria «tinha» — eliminar.',
          'D imperfeito do subjuntivo seria «tivesse» — eliminar.',
          'Gabarito B — futuro do pretérito do indicativo.',
          'Em similares: «Você faria isso?» = futuro do pretérito.',
        ],
        footer_rule: 'B = futuro do pretérito do indicativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FUTURO DO PRETÉRITO',
        rows: [
          { label: 'Forma', value: 'teria, faria, pegaria' },
          { label: 'Valor', value: 'Hipótese, cortesia, possibilidade.' },
          { label: '≠ Imperfeito', value: 'tinha / fazia = curso no passado.' },
          { label: 'Nesta questão', value: 'B — «teria».' },
        ],
        footer_rule: 'Pergunta com -ria = não-fato.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Tempos vizinhos de «teria» (morcego).',
        items: [
          {
            label: 'A — presente do indicativo',
            detail: 'Presente seria «tem coragem».',
            correct: '«Teria» = futuro do pretérito, não presente.',
          },
          {
            label: 'C — pretérito imperfeito',
            detail: 'Imperfeito seria «tinha coragem».',
            correct: 'Imperfeito = curso; «teria» = hipótese (-ria).',
          },
          {
            label: 'D — imperfeito do subjuntivo',
            detail: 'Subjuntivo seria «tivesse».',
            correct: '«Teria» é indicativo (futuro do pretérito), não «tivesse».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Você teria coragem de aplicar a vacina sem treino?»',
            correct: 'Futuro do pretérito do indicativo — mesma hipótese de «teria».',
          },
        ],
        footer_rule: 'Gabarito B — futuro do pretérito.',
      },
    ],
  },

  'apice-ag-adm-verbos-leia-a-charge-abaixo-e-responda-a-qu-3793471': {
    family: 'conceito',
    source_tec_id: '3793471',
    source_note: '«coloquei» — pretérito perfeito · Ápice Ag Adm R Bacamarte 2025 tec 3793471',
    meta: {
      banca: 'Ápice',
      prova: 'Ag Adm (Pref R Bacamarte)',
      orgao: 'Pref. Riacho de Bacamarte',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise o trecho “...inclusive já coloquei o celular para despertar às 6 horas da manhã!” e assinale a alternativa que apresenta corretamente a classificação do verbo “coloquei” quanto ao tempo e ao modo verbal:',
    figure_policy: 'transcribed',
    text_fragment:
      'Charge: “…inclusive já coloquei o celular para despertar às 6 horas da manhã!”',
    options: [
      { id: 'A', text: 'pretérito imperfeito do indicativo.', is_correct: false },
      { id: 'B', text: 'pretérito perfeito do modo indicativo.', is_correct: true },
      { id: 'C', text: 'pretérito mais-que-perfeito do modo indicativo.', is_correct: false },
      { id: 'D', text: 'futuro do presente do modo indicativo.', is_correct: false },
      { id: 'E', text: 'futuro do pretérito do modo indicativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coloquei — ponto no passado',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Coloquei» (celular / despertar): pontual ou curso?', icon: 'HelpCircle' },
          { label: 'Coloquei', detail: '1ª sing. pretérito perfeito — ação concluída.', icon: 'CheckCircle' },
          { label: 'Já', detail: 'Reforça fato encerrado antes da fala da charge.', icon: 'Clock' },
          { label: 'Pegadinha', detail: 'Trocar por imperfeito («colocava») ou mais-que-perfeito.', icon: 'AlertTriangle' },
        ],
        footer_rule: '-ei 1ª sing. = pretérito perfeito.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: tempo e modo de «coloquei» — celular para despertar.',
          '«Coloquei» = 1ª pessoa singular — fato concluído («já»).',
          'Classificação: pretérito perfeito do modo indicativo.',
          'A imperfeito seria «colocava» — eliminar.',
          'C mais-que-perfeito seria «colocara» / «tinha colocado» — eliminar.',
          'D/E futuros («colocarei» / «colocaria») — eliminar.',
          'Gabarito B — pretérito perfeito do indicativo.',
          'Em similares: «já fiz / já coloquei» = perfeito pontual.',
        ],
        footer_rule: 'B = pretérito perfeito do indicativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRETÉRITO PERFEITO — 1ª SING.',
        rows: [
          { label: 'Perfeito', value: 'coloquei, fiz, saí — ponto concluído.' },
          { label: 'Imperfeito', value: 'colocava — curso/hábito.' },
          { label: 'Mais-que-perfeito', value: 'colocara / tinha colocado.' },
          { label: 'Nesta questão', value: 'B — «coloquei».' },
        ],
        footer_rule: '«Já» + -ei = perfeito.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Tempos que não são «coloquei».',
        items: [
          {
            label: 'A — pretérito imperfeito',
            detail: 'Imperfeito seria «colocava» — fundo habitual.',
            correct: '«Coloquei» = perfeito pontual (celular já programado).',
          },
          {
            label: 'C — mais-que-perfeito',
            detail: 'Mais-que-perfeito marca anterioridade a outro passado.',
            correct: 'Não há «já antes de X»; é perfeito simples «coloquei».',
          },
          {
            label: 'D — futuro do presente',
            detail: 'Futuro seria «colocarei».',
            correct: 'Ação já feita — pretérito perfeito, não futuro.',
          },
          {
            label: 'E — futuro do pretérito',
            detail: 'Seria «colocaria» — hipótese.',
            correct: 'Fato narrado na charge = perfeito, não -ria.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Já preparei o material do plantão.» — «preparei»',
            correct: 'Pretérito perfeito do indicativo — ação concluída (mesmo valor).',
          },
        ],
        footer_rule: 'Gabarito B — pretérito perfeito.',
      },
    ],
  },

  'educa-pb-ace-verbos-considere-o-texto-a-seguir-para-resp-3820024': {
    family: 'text_fragment',
    source_tec_id: '3820024',
    source_note: 'sinto / escrevo / Cumpro — presente do indicativo · EDUCA PB ACE Ibiara 2025 tec 3820024',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACE (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No verso “Mas o que sinto escrevo. Cumpro a sina.”, os verbos destacados estão empregados no:',
    text_fragment:
      'Mas o que sinto escrevo. Cumpro a sina. Inauguro linhagens, fundo reinos — dor não é amargura. (Adélia Prado)',
    options: [
      { id: 'A', text: 'Presente do indicativo.', is_correct: true },
      { id: 'B', text: 'Presente do subjuntivo.', is_correct: false },
      { id: 'C', text: 'Pretérito imperfeito do indicativo.', is_correct: false },
      { id: 'D', text: 'Pretérito perfeito do indicativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Presente — sina poética',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'sinto / escrevo / Cumpro: agora ou passado?', icon: 'HelpCircle' },
          { label: 'Tríade', detail: 'Três presentes do indicativo — fato/atitude atual.', icon: 'Layers' },
          { label: 'Sina', detail: '«Cumpro a sina» — presente de afirmação identitária.', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: 'Ler como subjuntivo («sinta») ou pretérito («senti»).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Presente do indicativo = agora / verdade do eu.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar sinto / escrevo / Cumpro no verso de Adélia Prado.',
          'Formas de 1ª pessoa no presente — atitude atual da voz poética.',
          'Modo: indicativo (afirmação), não subjuntivo.',
          'B presente do subjuntivo seria «sinta / escreva / cumpra» — eliminar.',
          'C imperfeito seria «sentia / escrevia / cumpria» — eliminar.',
          'D perfeito seria «sentí / escrevi / cumpri» — eliminar.',
          'Gabarito A — presente do indicativo.',
          'Em similares: verbos de 1ª em -o/-o no presente = indicativo.',
        ],
        footer_rule: 'A = presente do indicativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRESENTE DO INDICATIVO — 1ª SING.',
        rows: [
          { label: 'Formas', value: 'sinto · escrevo · cumpro' },
          { label: 'Valor', value: 'Agora, hábito ou verdade do sujeito.' },
          { label: '≠ Subjuntivo', value: 'sinta · escreva · cumpra' },
          { label: 'Nesta questão', value: 'A — presente do indicativo.' },
        ],
        footer_rule: 'Afirmação poética = indicativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Modos/tempos que não são o verso.',
        items: [
          {
            label: 'B — presente do subjuntivo',
            detail: 'Subjuntivo mudaria a grafia («sinta»).',
            correct: '«Sinto / escrevo / Cumpro» = indicativo presente.',
          },
          {
            label: 'C — pretérito imperfeito',
            detail: 'Imperfeito seria «sentia / escrevia».',
            correct: 'Verso no presente — não curso passado.',
          },
          {
            label: 'D — pretérito perfeito',
            detail: 'Perfeito seria «sentí / escrevi / cumpri».',
            correct: 'Não há pontual passado — presente do indicativo.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «O que vejo, anoto. Cumpro o protocolo.»',
            correct: 'Presente do indicativo — mesma tríade afirmativa.',
          },
        ],
        footer_rule: 'Gabarito A — presente do indicativo.',
      },
    ],
  },

  'fcc-tec-verbos-considere-o-texto-abaixo-para-respon-3908381': {
    family: 'text_fragment',
    source_tec_id: '3908381',
    source_note: 'Correlação — caso tivessem + poderiam · FCC Tec SESAPI 2026 tec 3908381',
    meta: {
      banca: 'FCC',
      prova: 'Tec (SESAPI) Segurança do Trabalho',
      orgao: 'SESAPI',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considerando a expectativa de vida citada no texto (completar 30 anos no passado × cerca de +22 anos no Brasil atual), assinale a alternativa em que a correlação verbal está corretamente estabelecida:',
    text_fragment:
      'Assolados por doenças graves, guerras, fome e epidemias, completar 30 anos era privilégio de poucos no tempo das cavernas. Desde Montaigne, a expectativa de vida aumentou…',
    options: [
      {
        id: 'A',
        text: 'Se eles tivessem chegado a essa idade no Brasil de hoje, seriam 22 anos mais velhos, em média.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Por terem chegado a essa idade no Brasil de hoje, sua expectativa de vida média aumentou 22 anos.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Poderiam viver, em média, 22 anos a mais que o estimado à sua época, caso tivessem chegado a essa idade no Brasil atual.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Se tivessem a expectativa de viver mais 22 anos hoje, seria como se tivessem chegado a essa idade no Brasil de uma geração atrás.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Caso cheguem com essa idade no país, poderão viver, em média, outros 22 anos.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Correlação condicional',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Hipótese no passado (cavernas / expectativa): qual par de tempos?', icon: 'HelpCircle' },
          { label: 'Caso + -essem', detail: 'Imperfeito do subjuntivo — «tivessem chegado» (Montaigne / 30 anos).', icon: 'GitBranch' },
          { label: 'Apodose -riam', detail: 'Futuro do pretérito — «poderiam viver» (+22 anos).', icon: 'CornerDownRight' },
          { label: 'Pegadinha', detail: 'Misturar epidemias/guerras com presente («cheguem»).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Se/caso + imperf. subj. → futuro do pretérito.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: correlação verbal — completar 30 anos (cavernas) × +22 anos (Brasil atual).',
          'Hipótese: «caso tivessem chegado» + «poderiam viver» — expectativa de vida.',
          'C mantém imperfeito do subjuntivo + futuro do pretérito (Montaigne → hoje).',
          'A «seriam 22 anos mais velhos» distorce o sentido (idade ≠ expectativa) — eliminar.',
          'B «por terem chegado» afirma fato, não hipótese correlata — eliminar.',
          'D embaralha expectativa e «geração atrás» — lógica frouxa — eliminar.',
          'E «cheguem / poderão» = presente/futuro — não casa com hipótese passada — eliminar.',
          'Gabarito C — correlação adequada.',
          'Em similares: caso + -esse → -ria na apodose.',
        ],
        footer_rule: 'C = tivessem + poderiam.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CORRELAÇÃO — HIPÓTESE',
        rows: [
          { label: 'Protase', value: 'caso / se + imperfeito do subjuntivo.' },
          { label: 'Apodose', value: 'futuro do pretérito (-ria).' },
          { label: 'Evite', value: 'misturar «cheguem» (pres. subj.) com hipótese passada.' },
          { label: 'Nesta questão', value: 'C — poderiam… caso tivessem.' },
        ],
        footer_rule: 'Correlação = casar tempos da hipótese.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Reescritas que quebram correlação ou sentido.',
        items: [
          {
            label: 'A — seriam 22 anos mais velhos',
            detail: 'Confunde expectativa de vida com idade cronológica.',
            correct: 'Correto: poderiam viver 22 anos a mais (C), não «ser mais velho».',
          },
          {
            label: 'B — por terem chegado',
            detail: 'Afirmação factual — perde a hipótese condicional.',
            correct: 'Pedido = correlação hipotética (caso + -ria).',
          },
          {
            label: 'D — geração atrás',
            detail: 'Inverte a linha do tempo do enunciado.',
            correct: 'Brasil atual = +22 anos em relação à época passada (C).',
          },
          {
            label: 'E — cheguem / poderão',
            detail: 'Presente do subjuntivo + futuro do presente.',
            correct: 'Hipótese passada pede «tivessem» + «poderiam», não E.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique a correlação: «Caso o plantão tivesse atrasado, o plantonista sairia mais tarde.»',
            correct: 'Imperfeito do subjuntivo + futuro do pretérito — mesmo par de C.',
          },
        ],
        footer_rule: 'Gabarito C — poderiam… caso tivessem.',
      },
    ],
  },

  'avancasp-aee-verbos-nao-se-estabelece-no-emprego-das-for-3374820': {
    family: 'conceito',
    source_tec_id: '3374820',
    source_note: 'EXCETO correlação — se descesse… machuca · AVANÇASP AEE Caieiras 2025 tec 3374820',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AEE (Pref Caieiras)',
      orgao: 'Pref. Caieiras',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Não se estabelece, no emprego das formas verbais, a correlação temporal necessária ao contexto apenas em:',
    options: [
      { id: 'A', text: 'Mande lembranças a Ana quando a vir.', is_correct: false },
      { id: 'B', text: 'Seguiu viagem, embora quisesse voltar para casa.', is_correct: false },
      { id: 'C', text: 'Ela chorou ainda mais quando descobrira a morte do pai.', is_correct: false },
      { id: 'D', text: 'Se descesse do ônibus com algum apoio, não se machuca tanto.', is_correct: true },
      { id: 'E', text: 'Após ter perdido o controle do carro, sofreu um grave acidente.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — correlação quebrada',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual frase NÃO casa os tempos da hipótese?', icon: 'HelpCircle' },
          { label: 'Par correto', detail: 'Se + imperf. subj. → futuro do pretérito (-ria).', icon: 'Link' },
          { label: 'Quebra', detail: '«Se descesse… não se machuca» mistura subjuntivo + presente.', icon: 'Unlink' },
          { label: 'Pegadinha', detail: 'Atacar C («descobrira») e deixar passar D.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EXCETO = achar a correlação falha.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar a ÚNICA frase sem correlação temporal adequada.',
          'D: «Se descesse» (imperf. subj.) + «não se machuca» (presente) — quebra clássica.',
          'Correto seria «não se machucaria» (futuro do pretérito).',
          'A «quando a vir» = futuro do subjuntivo após quando — ok — eliminar (é correlação).',
          'B «embora quisesse» + pretérito — ok — eliminar.',
          'C «quando descobrira» = mais-que-perfeito aceitável na narrativa — eliminar.',
          'E «após ter perdido» + «sofreu» — anterioridade ok — eliminar.',
          'Gabarito D — única correlação falha.',
          'Em similares: se + -esse exige -ria na apodose, não presente.',
        ],
        footer_rule: 'D = descesse + machuca (quebra).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CORRELAÇÃO — SE + SUBJUNTIVO',
        rows: [
          { label: 'Protase', value: 'Se descesse / se viesse' },
          { label: 'Apodose', value: 'não se machucaria / viria' },
          { label: 'Erro clássico', value: 'apodose no presente («machuca»).' },
          { label: 'Nesta questão', value: 'D — quebra a correlação.' },
        ],
        footer_rule: 'EXCETO pede a frase errada.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Frases que MANTÊM correlação — por que não são o EXCETO.',
        items: [
          {
            label: 'A — quando a vir',
            detail: 'Futuro do subjuntivo após «quando» — correlação ok.',
            correct: 'Não é o EXCETO — tempos casam.',
          },
          {
            label: 'B — embora quisesse',
            detail: 'Concessiva no imperfeito do subjuntivo + pretérito — ok.',
            correct: 'Correlação adequada — não é o EXCETO.',
          },
          {
            label: 'C — quando descobrira',
            detail: 'Mais-que-perfeito marca anterioridade na narrativa.',
            correct: 'Aceitável no contexto — o falho é D.',
          },
          {
            label: 'E — após ter perdido',
            detail: 'Infinitivo composto + pretérito — sequência clara.',
            correct: 'Correlação ok — não é o EXCETO.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique o erro: «Se estudasse mais, passa na prova.»',
            correct: 'Quebra: imperf. subj. + presente — apodose deveria ser «passaria».',
          },
        ],
        footer_rule: 'Gabarito D — se descesse… machuca.',
      },
    ],
  },

  'instituto-ao-verbos-leia-o-texto-a-seguir-para-responder-3840829': {
    family: 'text_fragment',
    source_tec_id: '3840829',
    source_note: 'Locução estar + gerúndio «está se tornando» · AOCP Ass UNIRIO 2026 tec 3840829',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO) Alunos',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que ocorre locução verbal formada por auxiliar «estar» + gerúndio:',
    text_fragment:
      '“O déficit de brincadeiras entre adultos está se tornando uma crise de saúde pública”, disse em entrevista à revista National Geographic.',
    options: [
      {
        id: 'A',
        text: '“Na infância, a gente se sente livre para explorar esse lado lúdico.”',
        is_correct: false,
      },
      {
        id: 'B',
        text: '“Pode ser algo tão simples quanto massinha de modelar, jogar stop com amigos ou correr atrás de uma bola no parque.”',
        is_correct: false,
      },
      {
        id: 'C',
        text: '“Dedicar alguns minutos do dia a algo leve, só por prazer, pode ser justamente o que falta para sua rotina ficar um pouco mais solar.”',
        is_correct: false,
      },
      {
        id: 'D',
        text: '“O déficit de brincadeiras entre adultos está se tornando uma crise de saúde pública [...]”.',
        is_correct: true,
      },
      {
        id: 'E',
        text: '“Ao nos conectarmos com o presente, também conseguimos escutar melhor nós mesmos [...]”.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estar + gerúndio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual trecho tem «estar» + gerúndio?', icon: 'HelpCircle' },
          { label: 'Está se tornando', detail: 'Auxiliar estar + gerúndio — processo em curso.', icon: 'Activity' },
          { label: 'Déficit / adultos', detail: 'Brincadeiras e crise de saúde pública no trecho.', icon: 'Users' },
          { label: 'Pegadinha', detail: 'Marcar «pode ser» / «conseguimos escutar» (outras locuções).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pedido específico: estar + gerúndio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar locução «estar» + gerúndio.',
          'D: «está se tornando» = estar (presente) + gerúndio «tornando».',
          'A «se sente» = verbo pronominal — não estar+gerúndio — eliminar.',
          'B/C «pode ser» = poder + infinitivo — outra locução — eliminar.',
          'E «conseguimos escutar» = conseguir + infinitivo — eliminar.',
          'Gabarito D — está se tornando.',
          'Em similares: «está crescendo / estava lendo» = estar + gerúndio.',
        ],
        footer_rule: 'D = estar + gerúndio.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LOCUÇÃO — ESTAR + GERÚNDIO',
        rows: [
          { label: 'Forma', value: 'está se tornando · estava brincando' },
          { label: 'Valor', value: 'Processo em curso / progressivo.' },
          { label: '≠ Poder + inf.', value: 'pode ser · pode trazer' },
          { label: 'Nesta questão', value: 'D — está se tornando.' },
        ],
        footer_rule: 'Leia o pedido: qual auxiliar + qual forma nominal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Locuções (ou não) que não são estar+gerúndio.',
        items: [
          {
            label: 'A — se sente',
            detail: 'Verbo pronominal — sem gerúndio de locução.',
            correct: 'Não é «estar» + gerúndio — o alvo é D.',
          },
          {
            label: 'B — pode ser',
            detail: 'Locução poder + infinitivo — outro tipo.',
            correct: 'Pedido = estar + gerúndio («está se tornando»).',
          },
          {
            label: 'C — pode ser',
            detail: 'Mesma estrutura de B — poder + infinitivo.',
            correct: 'Não atende ao pedido específico de D.',
          },
          {
            label: 'E — conseguimos escutar',
            detail: 'Conseguir + infinitivo — locução diferente.',
            correct: 'Gerúndio com estar só em D.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «A campanha está alcançando alta cobertura.»',
            correct: 'Locução estar + gerúndio — mesmo molde de «está se tornando».',
          },
        ],
        footer_rule: 'Gabarito D — está se tornando.',
      },
    ],
  },

  'instituto-ao-verbos-o-texto-a-seguir-refere-se-a-questao-3841123': {
    family: 'text_fragment',
    source_tec_id: '3841123',
    source_note: 'Locução futuro do subjuntivo + gerúndio «estiverem realizando» · AOCP Ass UNIRIO 2026 tec 3841123',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO) Administração',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que a locução verbal é formada por auxiliar no futuro do subjuntivo + gerúndio:',
    text_fragment:
      'Estudos indicam que adultos são mais propensos a cometer deslizes ao dirigir se estiverem realizando outras tarefas ao mesmo tempo.',
    options: [
      {
        id: 'A',
        text: '“Chegar ao fim do dia com a cabeça a mil e não conseguir dormir é um clássico.”',
        is_correct: false,
      },
      {
        id: 'B',
        text: '“Por essas e outras, seria sensato parar de glorificar esse comportamento [...]”.',
        is_correct: false,
      },
      {
        id: 'C',
        text: '“[...] o renomado neurocientista Earl Miller [...] acredita que só podemos ter um ou dois pensamentos de cada vez.”',
        is_correct: false,
      },
      {
        id: 'D',
        text: '“[...] ao mudar de atividade, o cérebro precisa se reajustar, retomar o raciocínio e lembrar as ‘regras’ de cada função.”',
        is_correct: false,
      },
      {
        id: 'E',
        text: '“[...] adultos são mais propensos a cometer deslizes ao dirigir se estiverem realizando outras tarefas ao mesmo tempo [...]”.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estiverem realizando',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual trecho tem futuro do subjuntivo + gerúndio?', icon: 'HelpCircle' },
          { label: 'Estiverem', detail: 'Futuro do subjuntivo de «estar» — após «se».', icon: 'GitBranch' },
          { label: 'Realizando', detail: 'Gerúndio — outras tarefas / multitasking.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Marcar «podemos ter» ou infinitivos soltos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Se + estiverem + gerúndio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar auxiliar no futuro do subjuntivo + gerúndio.',
          'E: «se estiverem realizando» = estiverem (fut. subj.) + realizando.',
          'A infinitivos («Chegar» / «conseguir») — sem esse par — eliminar.',
          'B «seria sensato parar» — futuro do pretérito + infinitivo — eliminar.',
          'C «podemos ter» — presente + infinitivo — eliminar.',
          'D «precisa se reajustar» — presente + infinitivo — eliminar.',
          'Gabarito E — estiverem realizando.',
          'Em similares: se + estiverem / tiverem + gerúndio.',
        ],
        footer_rule: 'E = futuro do subjuntivo + gerúndio.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LOCUÇÃO — FUTURO DO SUBJUNTIVO + GERÚNDIO',
        rows: [
          { label: 'Forma', value: 'se estiverem realizando · se tiverem lendo' },
          { label: 'Gatilho', value: 'se / quando / caso + futuro do subjuntivo' },
          { label: '≠ Poder + inf.', value: 'podemos ter · precisa reajustar' },
          { label: 'Nesta questão', value: 'E — estiverem realizando.' },
        ],
        footer_rule: 'Olhe a flexão do auxiliar, não só o gerúndio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trechos sem o par pedido.',
        items: [
          {
            label: 'A — infinitivos',
            detail: '«Chegar» / «conseguir» — sem futuro do subjuntivo.',
            correct: 'Pedido = estiverem + gerúndio (E).',
          },
          {
            label: 'B — seria … parar',
            detail: 'Futuro do pretérito + infinitivo.',
            correct: 'Não é futuro do subjuntivo + gerúndio.',
          },
          {
            label: 'C — podemos ter',
            detail: 'Presente do indicativo + infinitivo.',
            correct: 'Auxiliar errado para o pedido — alvo é E.',
          },
          {
            label: 'D — precisa se reajustar',
            detail: 'Presente + infinitivo — multitasking no cérebro.',
            correct: 'Sem futuro do subjuntivo + gerúndio.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Se estiverem aferindo a PA, não interrompa.»',
            correct: 'Futuro do subjuntivo + gerúndio — mesmo molde de E.',
          },
        ],
        footer_rule: 'Gabarito E — estiverem realizando.',
      },
    ],
  },

  'quadrix-aux-verbos-texto-para-a-questao-imagine-um-time-3738674': {
    family: 'text_fragment',
    source_tec_id: '3738674',
    source_note: '«tem aumentado» → «vem aumentando» · QUADRIX Aux FUABC 2025 tec 3738674',
    meta: {
      banca: 'QUADRIX',
      prova: 'Aux (FUABC) Administrativo',
      orgao: 'FUABC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Na oração “A incidência de doenças autoimunes tem aumentado”, a forma verbal destacada pode ser corretamente substituída por:',
    text_fragment:
      'A incidência de doenças autoimunes tem aumentado. Duplicou nos últimos 40 anos — também não se sabe por que…',
    options: [
      { id: 'A', text: 'têm aumentado.', is_correct: false },
      { id: 'B', text: 'teem aumentado.', is_correct: false },
      { id: 'C', text: 'vem aumentando.', is_correct: true },
      { id: 'D', text: 'vêm aumentando.', is_correct: false },
      { id: 'E', text: 'veem aumentando.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vir + gerúndio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Incidência» (singular): vem ou vêm aumentando?', icon: 'HelpCircle' },
          { label: 'Núcleo', detail: 'Incidência = singular → verbo no singular.', icon: 'Target' },
          { label: 'Vem aumentando', detail: 'Vir (presente) + gerúndio — processo contínuo.', icon: 'TrendingUp' },
          { label: 'Pegadinha', detail: 'Pluralizar por «doenças» ou escrever «teem/veem».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Sujeito singular = vem (não vêm).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: substituir «tem aumentado» — incidência de doenças autoimunes.',
          'Núcleo «incidência» = singular → 3ª pessoa do singular.',
          'Equivalente com vir + gerúndio: «vem aumentando».',
          'A/D plural («têm» / «vêm») — concordância errada — eliminar.',
          'B «teem» — grafia inexistente — eliminar.',
          'E «veem» = verbo ver, não vir — eliminar.',
          'Gabarito C — vem aumentando.',
          'Em similares: ignore o adjunto «de doenças» — foque o núcleo.',
        ],
        footer_rule: 'C = vem aumentando (singular).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VIR + GERÚNDIO — CONCORDÂNCIA',
        rows: [
          { label: 'Singular', value: 'a incidência vem aumentando' },
          { label: 'Plural', value: 'os casos vêm aumentando' },
          { label: '≠ Ver', value: 'veem = eles veem (enxergar)' },
          { label: 'Nesta questão', value: 'C — vem aumentando.' },
        ],
        footer_rule: 'Núcleo do sujeito manda na flexão.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Formas que quebram concordância ou o verbo.',
        items: [
          {
            label: 'A — têm aumentado',
            detail: 'Plural — atrai pela palavra «doenças».',
            correct: 'Núcleo «incidência» = singular → «tem/vem», não «têm».',
          },
          {
            label: 'B — teem aumentado',
            detail: 'Grafia inválida de «ter».',
            correct: 'Não existe «teem» — use «tem» ou «vem aumentando».',
          },
          {
            label: 'D — vêm aumentando',
            detail: 'Plural de vir — sujeito errado.',
            correct: 'Singular: «vem aumentando» (C).',
          },
          {
            label: 'E — veem aumentando',
            detail: 'Verbo ver («eles veem»), não vir.',
            correct: 'Locução pedida = vir + gerúndio «vem aumentando».',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «A taxa de cobertura tem crescido.» → vir + gerúndio',
            correct: '«Vem crescendo» — núcleo singular (mesmo molde de C).',
          },
        ],
        footer_rule: 'Gabarito C — vem aumentando.',
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
