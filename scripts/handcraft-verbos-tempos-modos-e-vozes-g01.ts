#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — verbos-tempos-modos-e-vozes-g01 (8 slugs · Verbos · lote 1).
 *
 *   npx tsx scripts/handcraft-verbos-tempos-modos-e-vozes-g01.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'verbos-tempos-modos-e-vozes-g01';
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
    'correlação temporal',
    'locução verbal',
    'subjuntivo',
    'futuro do subjuntivo',
    'presente do subjuntivo',
    'ter existencial',
    'haver/existir',
    'pergunta-teste tempo/modo',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'vf';

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
      reviewer: 'handcraft:verbos-tempos-modos-e-vozes-g01',
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

/** Reuse anchor golden for slug 3789241 */
function loadAnchor3789241(): unknown[] {
  const anchorPath = join(process.cwd(), GOLDEN_REFERENCE);
  const anchor = JSON.parse(readFileSync(anchorPath, 'utf8')) as {
    reverse_study_slides: unknown[];
  };
  return anchor.reverse_study_slides;
}

const SPECS: Record<string, Spec> = {
  'vunesp-ag-ad-verbos-leia-o-texto-a-seguir-para-responder-3789241': {
    family: 'conceito',
    source_tec_id: '3789241',
    source_note: 'Mais-que-perfeito composto↔simples — VUNESP Ag Adm Pref SJRP 2026 tec 3789241',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag Adm (Pref SJRP)',
      orgao: 'Pref. São José do Rio Preto',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em "... as coisas que sabia tinha escutado entre os oito e os doze anos de idade", a expressão destacada equivale a:',
    options: [
      { id: 'A', text: 'escutaria.', is_correct: false },
      { id: 'B', text: 'escutava.', is_correct: false },
      { id: 'C', text: 'escuta.', is_correct: false },
      { id: 'D', text: 'escutara.', is_correct: true },
      { id: 'E', text: 'escutou.', is_correct: false },
    ],
    slides: loadAnchor3789241(),
  },

  'avancasp-tec-verbos-quando-voce-peco-que-a-atividade-e-q-3835991': {
    family: 'conceito',
    source_tec_id: '3835991',
    source_note: 'Correlação modal — lacunas puder/faça/entregue · AVANÇASP Tec Enf Estiva Gerbi 2026 tec 3835991',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Tec Enf (Pref Estiva Gerbi)',
      orgao: 'Pref. Estiva Gerbi',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '"Quando você _______, peço que _______ a atividade e que me _______ o quanto antes." Assinale a alternativa que apresenta as formas verbais, na mesma ordem, que preenchem corretamente as lacunas acima:',
    options: [
      { id: 'A', text: 'puder – faça – entregue', is_correct: true },
      { id: 'B', text: 'poder – faça – entregue', is_correct: false },
      { id: 'C', text: 'puder – faça – entrega', is_correct: false },
      { id: 'D', text: 'puder – faz – entregue', is_correct: false },
      { id: 'E', text: 'poder – faz – entrega', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Correlação de modos',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada lacuna: qual modo? Condição, pedido ou indicativo?', icon: 'HelpCircle' },
          { label: 'Quando + futuro', detail: '«Quando você puder» — futuro do subjuntivo (condição futura).', icon: 'Clock' },
          { label: 'Peço que + presente', detail: '«Peço que faça/entregue» — presente do subjuntivo (desejo).', icon: 'MessageSquare' },
          { label: 'Pegadinha', detail: 'Infinitivo «poder/fazer» ou indicativo «faz/entrega» quebram a correlação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Quando (futuro subj.) + peço que (pres. subj.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: três lacunas — testar modo de cada uma na ordem.',
          '1ª «Quando você ___»: condição futura → futuro do subjuntivo «puder» (não «poder»).',
          '2ª «peço que ___ a atividade»: desejo/pedido → presente do subjuntivo «faça» (não «faz»).',
          '3ª «que me ___»: mesma oração subordinada → «entregue» (não «entrega»).',
          'A «puder – faça – entregue»: correlação modal completa — manter.',
          'B «poder»: infinitivo na 1ª lacuna — eliminar.',
          'C/D/E: indicativo «faz/entrega» ou infinitivo «poder» — eliminar.',
          'Gabarito A.',
          'Em similares: «Quando» futuro exige subjuntivo; «peço que» fixa presente do subjuntivo.',
        ],
        footer_rule: 'Três lacunas = três modos distintos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CORRELAÇÃO MODAL — LACUNAS',
        rows: [
          { label: 'Quando + condição', value: 'Futuro do subjuntivo: «Quando você puder…»' },
          { label: 'Peço que + desejo', value: 'Presente do subjuntivo: «…que faça… que entregue»' },
          { label: 'Proibido', value: 'Infinitivo ou indicativo onde a banca exige subjuntivo.' },
          { label: 'Nesta questão', value: 'puder – faça – entregue (A).' },
        ],
        footer_rule: 'Pedido formal = subjuntivo nas orações de «que».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra um elo da correlação.',
        items: [
          {
            label: 'B — poder – faça – entregue',
            detail: '«Poder» infinitivo onde cabe «puder» (futuro subj.).',
            correct: '1ª lacuna: futuro do subjuntivo «puder», não infinitivo «poder».',
          },
          {
            label: 'C — puder – faça – entrega',
            detail: '«Entrega» indicativo na 3ª lacuna subordinada a «que».',
            correct: 'Após «que me»: presente do subjuntivo «entregue».',
          },
          {
            label: 'D — puder – faz – entregue',
            detail: '«Faz» indicativo após «peço que».',
            correct: 'Pedido + «que»: presente do subjuntivo «faça».',
          },
          {
            label: 'E — poder – faz – entrega',
            detail: 'Infinitivo e dois indicativos — quebra tripla.',
            correct: 'Só A mantém futuro subj. + dois presentes do subjuntivo.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Quando puder, peço que envie o relatório.»',
            correct: 'Futuro subj. «puder» + pres. subj. «envie» — mesma correlação.',
          },
        ],
        footer_rule: 'A = puder · faça · entregue.',
      },
    ],
  },

  'avancasp-acs-verbos-assinale-a-alternativa-em-que-a-form-3839413': {
    family: 'conceito',
    source_tec_id: '3839413',
    source_note: 'Forma verbal correta — futuro subj. «estiver» · AVANÇASP ACS Pref Potim 2026 tec 3839413',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa em que a forma verbal destacada está empregada corretamente.',
    options: [
      { id: 'A', text: 'Assim que ela fazer a tarefa, sairemos para o nosso compromisso.', is_correct: false },
      { id: 'B', text: 'Quando você vir para os lados de cá, é só me falar.', is_correct: false },
      { id: 'C', text: 'Assim que você estiver pronta, dê um sinal, por favor.', is_correct: true },
      { id: 'D', text: 'Se você dizer o que está pensando, eu não vou insistir mais.', is_correct: false },
      { id: 'E', text: 'Quando você pôr o seu quarto em ordem, poderá ir à rua.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Subjuntivo após conectivos',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Após «assim que/quando/se»: qual tempo do subjuntivo?', icon: 'GitBranch' },
          { label: 'Futuro do subjuntivo', detail: 'Condição futura: «estiver», «puser», «vier» (vir/ver).', icon: 'Forward' },
          { label: 'Presente do subjuntivo', detail: 'Hipótese atual: «diga», «faça» após «se» no presente.', icon: 'CircleDot' },
          { label: 'Pegadinha', detail: 'Infinitivo «fazer/pôr» ou «vir» de «ver» no lugar de «vier» (vir=chegar).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Conectivo temporal futuro → futuro do subjuntivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar a frase com forma verbal correta.',
          'A «ela fazer»: infinitivo após «assim que» — deveria ser «fizer» — eliminar.',
          'B «você vir»: «vir» aqui é futuro subj. de «ver»; sentido é chegar → «vier» — eliminar.',
          'C «estiver pronta»: futuro do subjuntivo após «assim que» + imperativo «dê» — correto.',
          'D «dizer»: infinitivo após «se» — deveria ser «diga/disser» — eliminar.',
          'E «pôr»: infinitivo; após «quando» futuro → «puser» — eliminar.',
          'Gabarito C.',
          'Em similares: «assim que/quando» + ação futura → futuro do subjuntivo, não infinitivo.',
        ],
        footer_rule: 'C = estiver (futuro subj.).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONECTIVO → MODO/TEMPO',
        rows: [
          { label: 'Assim que / Quando (futuro)', value: 'Futuro do subjuntivo: estiver, puser, vier.' },
          { label: 'Se (presente)', value: 'Presente do subjuntivo: diga, faça, tenha.' },
          { label: 'Erro clássico', value: 'Infinitivo «fazer/pôr» no lugar de subjuntivo.' },
          { label: 'Nesta questão', value: 'C — «estiver pronta».' },
        ],
        footer_rule: 'Infinitivo após conectivo temporal = erro de prova.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Formas erradas por lacuna de subjuntivo.',
        items: [
          {
            label: 'A — ela fazer',
            detail: 'Infinitivo «fazer» após «assim que».',
            correct: 'Exige futuro do subjuntivo: «Assim que ela fizer…»',
          },
          {
            label: 'B — você vir',
            detail: '«Vir» como futuro subj. de «ver», mas o sentido é chegar.',
            correct: 'Vir (chegar) → futuro subj. «vier»: «Quando você vier…»',
          },
          {
            label: 'D — dizer',
            detail: 'Infinitivo «dizer» após «se você».',
            correct: 'Presente do subjuntivo: «Se você disser/diga o que pensa…»',
          },
          {
            label: 'E — pôr',
            detail: 'Infinitivo após «quando» de tempo futuro.',
            correct: 'Futuro do subjuntivo de «pôr»: «Quando você puser…»',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Assim que terminar o expediente, avise-me.»',
            correct: 'Futuro do subjuntivo de «terminar»: «Assim que terminar» — conectivo temporal futuro.',
          },
        ],
        footer_rule: 'Gabarito C — «estiver pronta».',
      },
    ],
  },

  'avancasp-aoe-verbos-leia-o-texto-a-seguir-para-responder-3886648': {
    family: 'conceito',
    source_tec_id: '3886648',
    source_note: 'Ter existencial → há/existem — AVANÇASP AOE Pref Jeriquara 2026 tec 3886648',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AOE (Pref Jeriquara)',
      orgao: 'Pref. Jeriquara',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «Friamente, tem os que negam, mas no fundo, lá no fundo, os brasileiros e brasileiras fazem uma fezinha no próprio signo», a forma verbal destacada, de uso popular, pode ser substituída corretamente, de acordo com a norma-padrão, por:',
    text_fragment: 'Friamente, tem os que negam, mas no fundo, lá no fundo…',
    options: [
      { id: 'A', text: '"há" ou "existem".', is_correct: true },
      { id: 'B', text: '"hão" ou "existem".', is_correct: false },
      { id: 'C', text: '"hão" ou "existe".', is_correct: false },
      { id: 'D', text: '"têm" ou "existe".', is_correct: false },
      { id: 'E', text: '"há" ou "existe".', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ter × haver existencial',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'É existencial impessoal? Sujeito «os que negam» é plural.', icon: 'Users' },
          { label: 'Popular', detail: '«Tem os que negam» — «ter» no lugar de «haver» (oral).', icon: 'MessageCircle' },
          { label: 'Norma culta', detail: '«Há os que negam» (sing.) ou «Existem os que negam» (pl.).', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: '«Hão» inexistente; «têm» como existencial; «existe» com sujeito plural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Existencial + sujeito plural → há ou existem.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: substituir «tem» (existencial popular) pela norma-padrão.',
          'Sujeito «os que negam» é plural — rejeitar «existe» (sing.).',
          'Existencial impessoal culto: «há» (3ª sing.) mesmo com plural — aceito.',
          'Alternativa culta plural: «existem os que negam» — também aceito.',
          'B/C «hão»: forma inexistente — eliminar.',
          'D «têm/existe»: «têm» não é existencial; «existe» discorda — eliminar.',
          'E «há/existe»: «existe» com sujeito plural — eliminar.',
          'Gabarito A — presente do subjuntivo.',
          'Em similares: «tem gente» oral → «há gente» ou «existem pessoas» na norma culta.',
        ],
        footer_rule: 'A = há | existem.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXISTENCIAL — NORMA CULTA',
        rows: [
          { label: 'Oral (popular)', value: '«Tem os que…» / «Tem gente que…»' },
          { label: 'Culto impessoal', value: '«Há os que…» — verbo sempre no singular.' },
          { label: 'Culto plural', value: '«Existem os que…» — verbo no plural.' },
          { label: 'Nesta questão', value: 'A — «há» ou «existem».' },
        ],
        footer_rule: 'Nunca «hão»; «ter» existencial é coloquial.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares impossíveis na norma culta.',
        items: [
          {
            label: 'B — hão ou existem',
            detail: '«Hão» não existe na língua padrão.',
            correct: 'Forma inexistente — rejeitar qualquer opção com «hão».',
          },
          {
            label: 'C — hão ou existe',
            detail: '«Hão» + «existe» com sujeito plural.',
            correct: 'Duplo erro: forma falsa + concordância sing. com «os que».',
          },
          {
            label: 'D — têm ou existe',
            detail: '«Têm» como auxiliar de posse, não existencial.',
            correct: 'Existencial culto: «há/existem», não «têm/existe».',
          },
          {
            label: 'E — há ou existe',
            detail: '«Existe» singular diante de «os que negam» (pl.).',
            correct: 'Com sujeito plural: «existem» — não «existe» sozinho.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Tem muitos candidatos na sala.» (norma culta)',
            correct: 'Existencial culto: «Há muitos candidatos» ou «Existem muitos candidatos».',
          },
        ],
        footer_rule: 'Gabarito A — «há» ou «existem».',
      },
    ],
  },

  'avancasp-aoe-verbos-assinale-a-alternativa-que-apresenta-3886651': {
    family: 'conceito',
    source_tec_id: '3886651',
    source_note: 'Futuro do subjuntivo «puser» — AVANÇASP AOE Pref Jeriquara 2026 tec 3886651',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AOE (Pref Jeriquara)',
      orgao: 'Pref. Jeriquara',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa que apresenta a flexão correta da forma verbal destacada no enunciado.',
    options: [
      { id: 'A', text: 'Se você querer de verdade, fará coisas que até você duvida.', is_correct: false },
      { id: 'B', text: 'Se você vir à escola, avise-me antes para recebê-lo com honrarias.', is_correct: false },
      { id: 'C', text: 'Se você puser a mão na consciência, fará a coisa certa.', is_correct: true },
      { id: 'D', text: 'Se você compor uma canção, mostre-me antes de anunciá-la ao público.', is_correct: false },
      { id: 'E', text: 'Se você deter o ladrão, será muito bem recompensado.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Futuro do subjuntivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Após «se» + condição futura: qual flexão irregular?', icon: 'Zap' },
          { label: 'Pôr', detail: 'Futuro do subjuntivo: puser (não «pôr» infinitivo).', icon: 'PenLine' },
          { label: 'Querer / vir / compor', detail: 'quiser · vier · compuser — não infinitivo nem «vir» de ver.', icon: 'Shuffle' },
          { label: 'Pegadinha', detail: 'Infinitivo «querer/pôr/compor/deter» após «se você».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Se + condição → futuro do subjuntivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: flexão correta após «Se você» (condição).',
          'A «querer»: infinitivo — futuro subj. «quiser» — eliminar.',
          'B «vir»: ambíguo (ver/vir); «vier» para chegar — eliminar.',
          'C «puser»: futuro do subjuntivo de «pôr» — correto.',
          'D «compor»: infinitivo — «compuser» — eliminar.',
          'E «deter»: infinitivo — «detiver» — eliminar.',
          'Gabarito C.',
          'Em similares: verbos irregulares no futuro do subjuntivo — decore puser, quiser, vier, compuser.',
        ],
        footer_rule: 'Gabarito C — futuro subj. «puser».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FUTURO DO SUBJUNTIVO — IRREGULARES',
        rows: [
          { label: 'Pôr', value: 'puser' },
          { label: 'Querer', value: 'quiser' },
          { label: 'Vir (chegar)', value: 'vier' },
          { label: 'Compor', value: 'compuser' },
          { label: 'Nesta questão', value: 'C — «puser a mão na consciência».' },
        ],
        footer_rule: 'Infinitivo após «se você» = erro clássico.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Infinitivo onde a banca exige futuro subj.',
        items: [
          {
            label: 'A — querer',
            detail: 'Infinitivo no lugar de «quiser».',
            correct: 'Futuro do subjuntivo: «Se você quiser de verdade…»',
          },
          {
            label: 'B — vir',
            detail: 'Forma ambígua; sentido exige «vier» (chegar).',
            correct: '«Se você vier à escola…» — futuro subj. de vir (chegar).',
          },
          {
            label: 'D — compor',
            detail: 'Infinitivo após «se» condicional.',
            correct: 'Futuro do subjuntivo: «Se você compuser uma canção…»',
          },
          {
            label: 'E — deter',
            detail: 'Infinitivo; flexão correta seria «detiver».',
            correct: 'Futuro do subjuntivo: «Se você detiver o ladrão…»',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Se você pôr fim ao atraso, ganhará pontos.»',
            correct: 'Futuro do subjuntivo: «Se você puser fim…» — irregular de «pôr».',
          },
        ],
        footer_rule: 'Gabarito C — puser.',
      },
    ],
  },

  'cpcon-uepb-a-verbos-leia-o-texto-ii-para-responder-a-que-3912873': {
    family: 'vf',
    source_tec_id: '3912873',
    source_note: 'VF tempos/modos do «é» — tirinha CPCON UEPB Pref Cuité 2026 tec 3912873',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Cuité)',
      orgao: 'Pref. Cuité',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe as assertivas sobre o uso dos tempos e modos verbais na tirinha:\n\nTrecho: «É cinco, quatro, três, dois, um… Quem é Vivi, vó?»\n\nI - O verbo «é», em «É cinco, quatro…», está no presente do indicativo, ação no momento da fala.\nII - O verbo «é» expressa certeza, característica do modo indicativo.\nIII - Substituir «é» por «fosse» tornaria a frase hipotética (subjuntivo).\nIV - Em «Quem é Vivi, vó?», «é» está no pretérito perfeito do indicativo.\n\nÉ CORRETO o que se afirma em:',
    figure_policy: 'transcribed',
    text_fragment: 'É cinco, quatro, três, dois, um… Quem é Vivi, vó?',
    options: [
      { id: 'A', text: 'I, II, III e IV.', is_correct: false },
      { id: 'B', text: 'I e II, apenas.', is_correct: false },
      { id: 'C', text: 'II e IV, apenas.', is_correct: false },
      { id: 'D', text: 'III e IV, apenas.', is_correct: false },
      { id: 'E', text: 'I, II e III, apenas.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Presente do indicativo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada «é»: qual tempo e modo? IV troca perfeito por presente.', icon: 'Search' },
          { label: 'Contagem', detail: '«É cinco, quatro…» — ação simultânea à fala (presente).', icon: 'Timer' },
          { label: 'Modo indicativo', detail: 'Certeza factual — não hipótese (subjuntivo «fosse»).', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Achar «é» = pretérito perfeito só porque a fala é passada na história.', icon: 'AlertTriangle' },
        ],
        footer_rule: '«É» na fala = presente do indicativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando VF: julgar I–IV antes de combinar letras.',
          'I VERDADEIRO: «É cinco…» = presente do indicativo (momento da fala).',
          'II VERDADEIRO: indicativo = certeza sobre a contagem.',
          'III VERDADEIRO: «fosse» = subjuntivo hipotético — mudaria o modo.',
          'IV FALSO: «Quem é Vivi» — «é» presente, não pretérito perfeito.',
          'Combinação correta: I + II + III — sem IV.',
          'Letra E «I, II e III, apenas».',
          'Em similares: VF de tempo verbal — teste se a ação é no momento da fala.',
        ],
        footer_rule: 'E = I, II e III.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VF — TEMPO × MODO',
        rows: [
          { label: 'Presente indicativo', value: 'Ação atual ou simultânea à fala — «é», «conta».' },
          { label: 'Indicativo', value: 'Certeza / fato — opõe-se ao subjuntivo «fosse».' },
          { label: 'Perfeito', value: 'Ação concluída — «foi», «esteve» — não «é».' },
          { label: 'Nesta questão', value: 'E — I, II e III corretas; IV errada.' },
        ],
        footer_rule: 'IV erra o tempo de «Quem é Vivi».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Combinações que incluem IV falsa.',
        items: [
          {
            label: 'A — I, II, III e IV',
            detail: 'Inclui IV (perfeito) — falsa.',
            correct: 'IV erra: «é» = presente, não pretérito perfeito.',
          },
          {
            label: 'B — I e II, apenas',
            detail: 'Omite III, que também é verdadeira.',
            correct: 'III correta: «fosse» = subjuntivo hipotético.',
          },
          {
            label: 'C — II e IV, apenas',
            detail: 'Inclui IV falsa e exclui I e III verdadeiras.',
            correct: 'IV falsa; I e III também entram no gabarito.',
          },
          {
            label: 'D — III e IV, apenas',
            detail: 'III certa, mas IV falsa — par inválido.',
            correct: 'Só III entre as duas; gabarito exige I+II+III (E).',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «É hora de sair.» (tempo/modo de «é»)',
            correct: 'Presente do indicativo — ação/state simultâneo à fala.',
          },
        ],
        footer_rule: 'Gabarito E — I, II e III corretas.',
      },
    ],
  },

  'educa-pb-ag-verbos-leia-o-texto-a-seguir-e-responda-a-q-3913860': {
    family: 'conceito',
    source_tec_id: '3913860',
    source_note: 'Talvez + subjuntivo «tenha» — EDUCA PB Ag Adm Pref Cajazeiras 2026 tec 3913860',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref. Cajazeiras',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Releia o verso de Manuel Bandeira: «Talvez eu tenha medo.» Assinale a opção que apresenta a classificação correta do verbo destacado:',
    text_fragment: 'Talvez eu tenha medo.',
    options: [
      { id: 'A', text: 'Presente do subjuntivo.', is_correct: true },
      { id: 'B', text: 'Presente do indicativo.', is_correct: false },
      { id: 'C', text: 'Futuro do subjuntivo.', is_correct: false },
      { id: 'D', text: 'Pretérito perfeito do indicativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Talvez + subjuntivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Talvez» exige dúvida — qual modo?', icon: 'Cloud' },
          { label: 'Tenha', detail: 'Presente do subjuntivo de «ter» — não indicativo «tenho».', icon: 'Heart' },
          { label: 'Indicativo?', detail: '«Tenho medo» = certeza; «tenha» = possibilidade.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Confundir «tenha» com pretérito/perfeito pela grafia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Talvez → subjuntivo (presente).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar «tenha» em «Talvez eu tenha medo».',
          '«Talvez» = dúvida/possibilidade → modo subjuntivo.',
          '«Tenha» = presente do subjuntivo de «ter» (1ª sing.).',
          'B indicativo «tenho» teria certeza — eliminar.',
          'C futuro subjuntivo seria «tiver» — eliminar.',
          'D perfeito indicativo «tive» — eliminar.',
          'Gabarito A — presente do subjuntivo.',
          'Em similares: palavras como «talvez», «oxalá», «que» dubitativo → subjuntivo.',
        ],
        footer_rule: 'A = presente do subjuntivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GATILHOS DO SUBJUNTIVO',
        rows: [
          { label: 'Talvez / Oxalá', value: 'Presente do subjuntivo: «tenha», «seja».' },
          { label: 'Ter — pres. subj.', value: 'eu tenha · tu tenhas · ele/ela tenha' },
          { label: 'Indicativo × subj.', value: '«Tenho medo» (certeza) × «Talvez tenha» (dúvida).' },
          { label: 'Nesta questão', value: 'A — presente do subjuntivo.' },
        ],
        footer_rule: 'Dúvida = subjuntivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Modos trocados na classificação.',
        items: [
          {
            label: 'B — presente do indicativo',
            detail: '«Tenho» seria indicativo; «tenha» não.',
            correct: 'Com «talvez»: subjuntivo «tenha», não indicativo «tenho».',
          },
          {
            label: 'C — futuro do subjuntivo',
            detail: 'Futuro de «ter» = «tiver», não «tenha».',
            correct: '«Tenha» = presente do subjuntivo; futuro seria «tiver».',
          },
          {
            label: 'D — pretérito perfeito',
            detail: 'Perfeito de «ter» = «tive» — forma distinta.',
            correct: '«Tenha» não é pretérito; é presente do subjuntivo.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Oxalá ele chegue a tempo.»',
            correct: 'Presente do subjuntivo de «chegar» — gatilho «oxalá».',
          },
        ],
        footer_rule: 'Gabarito A — presente do subjuntivo.',
      },
    ],
  },

  'selecon-acs-verbos-considere-o-texto-a-seguir-para-resp-3990829': {
    family: 'conceito',
    source_tec_id: '3990829',
    source_note: 'Valor semântico do presente — habitualidade · SELECON ACS FeSaúde 2026 tec 3990829',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (FeSaúde)',
      orgao: 'FeSaúde',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Os verbos «percebem», «vivenciam» e «lidam» estão no presente do indicativo. No contexto do texto sobre servidores e desinformação, o valor expresso é de:',
    options: [
      {
        id: 'A',
        text: 'pontualidade, indicando ações restritas ao instante exato da redação do texto',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'habitualidade e continuidade, indicando experiência recorrente e permanente dos servidores',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'futuridade e projeção, indicando ações após a publicação dos resultados da pesquisa',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'hipótese e condição, indicando ações dependentes da adesão ao questionário',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Presente — valor semântico',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Presente = agora pontual ou hábito/atualidade geral?', icon: 'Repeat' },
          { label: 'Contexto Ipea', detail: 'Servidores «percebem/vivenciam/lidam» no cotidiano institucional.', icon: 'Building' },
          { label: 'Habitual', detail: 'Experiência recorrente — não fato único nem futuro.', icon: 'RefreshCw' },
          { label: 'Pegadinha', detail: 'Confundir presente de atualidade com condicional/hipótese.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Cotidiano = habitualidade no presente.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor semântico do presente indicativo no trecho.',
          'Verbos descrevem rotina dos servidores com desinformação — não instante único.',
          'A pontualidade: restringiria ao momento da redação — eliminar.',
          'B habitualidade/continuidade: encaixa «cotidiano institucional» — manter.',
          'C futuridade: verbos no presente, não futuro — eliminar.',
          'D hipótese/condição: valor de subjuntivo, não indicativo — eliminar.',
          'Gabarito B.',
          'Em similares: presente + «cotidiano/rotina/sempre» → habitualidade, não pontual.',
        ],
        footer_rule: 'B = habitualidade e continuidade.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRESENTE DO INDICATIVO — VALOR',
        rows: [
          { label: 'Pontual', value: 'Fato único agora: «O ministro anuncia hoje».' },
          { label: 'Habitual', value: 'Rotina/atualidade: «Servidores percebem… no cotidiano».' },
          { label: 'Futuro / hipótese', value: 'Exigiriam futuro ou subjuntivo — não o caso.' },
          { label: 'Nesta questão', value: 'B — habitualidade e continuidade.' },
        ],
        footer_rule: 'Texto descritivo de rotina → habitual.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Valores semânticos incompatíveis.',
        items: [
          {
            label: 'A — pontualidade',
            detail: 'Restringe ao instante da redação — não ao cotidiano.',
            correct: '«Percebem/vivenciam/lidam» = rotina recorrente, não fato pontual.',
          },
          {
            label: 'C — futuridade',
            detail: 'Projeta ações após a pesquisa — tempo errado.',
            correct: 'Presente indicativo ≠ futuro; contexto fala de experiência atual.',
          },
          {
            label: 'D — hipótese e condição',
            detail: 'Valor típico do subjuntivo/condicional.',
            correct: 'Indicativo no trecho = fato habitual, não dependência condicional.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Enfermeiros registram os sinais a cada turno.»',
            correct: 'Presente indicativo de habitualidade — ação recorrente no trabalho.',
          },
        ],
        footer_rule: 'Gabarito B — habitualidade no presente.',
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
