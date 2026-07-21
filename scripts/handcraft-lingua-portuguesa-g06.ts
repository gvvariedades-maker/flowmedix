#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g06 (5 slugs · Crase · fechamento PDF).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g06.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g06 --strict-v2-pedagogy
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_CRASE_CONCURSOS } from '@/lib/guidelines/linguaPortuguesa/crase';

const LOTE = 'lingua-portuguesa-g06';
const SUBTOPICO = 'Crase';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_crase';
const REVIEWED = '2026-07-19';

const GOLDEN_REFERENCES = {
  eliminacao: 'examples/questao-premium-vunesp-portugues-crase-funil.json',
  lacunas: 'examples/questao-premium-vunesp-portugues-crase-lacunas-ioga.json',
} as const;

type AnchorStyle = keyof typeof GOLDEN_REFERENCES;

const SLUG_ANCHOR_STYLE: Record<string, AnchorStyle> = {
  'cebraspe-verissimo-crase-vf-itens-3739266': 'eliminacao',
  'avancasp-crase-facultativo-evidencias-3951800': 'eliminacao',
  'epice-crase-adultizacao-regencia-3951857': 'eliminacao',
  'epice-crase-facultativo-pestana-3951877': 'eliminacao',
  'caderno-pt-crase-penha-escrever-caneta': 'eliminacao',
};

const PT_CRASE_SOURCE = {
  id: PT_CRASE_CONCURSOS.id,
  tier: 'A' as const,
  issuer: PT_CRASE_CONCURSOS.issuer,
  title: PT_CRASE_CONCURSOS.title,
  year: PT_CRASE_CONCURSOS.year,
  url: PT_CRASE_CONCURSOS.url,
  covers: ['funil 3 testes', 'teste ao', 'locução adverbial feminina', 'horas', 'pronome pessoal'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment' | 'certo_errado';

type Spec = {
  family: Family;
  anchor_style?: AnchorStyle;
  meta: {
    banca: string;
    prova: string;
    orgao: string;
    ano: string;
    cargo_header?: string;
  };
  instruction: string;
  text_fragment?: string;
  options: Opt[];
  source_tec_id: string;
  source_note: string;
  slides: unknown[];
};

const slideMeta = { topico: TOPICO, subtopico: SUBTOPICO };

function metaBase(spec: Spec, slug: string) {
  const anchorStyle = spec.anchor_style ?? SLUG_ANCHOR_STYLE[slug] ?? 'eliminacao';
  const goldenReference = GOLDEN_REFERENCES[anchorStyle];
  return {
    ...spec.meta,
    topico: TOPICO,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:lingua-portuguesa-g06',
      guideline_snapshot: `${PT_CRASE_CONCURSOS.snapshot} · âncora ${anchorStyle} → ${goldenReference}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      PT_CRASE_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', `âncora ${anchorStyle}`],
      },
    ],
  };
}

function build(slug: string, spec: Spec) {
  const qd: { instruction: string; options: Opt[]; text_fragment?: string } = {
    instruction: spec.instruction,
    options: spec.options,
  };
  if (spec.text_fragment) qd.text_fragment = spec.text_fragment;
  return {
    meta: metaBase(spec, slug),
    question_data: qd,
    reverse_study_slides: spec.slides,
  };
}

const SPECS: Record<string, Spec> = {
  'cebraspe-verissimo-crase-vf-itens-3739266': {
    family: 'certo_errado',
    source_tec_id: '3739266',
    source_note: 'Crase VF itens — Verissimo Memória e anotações (CG2A1) tec 3739266',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Mon (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Julgue os seguintes itens, relativos ao emprego do sinal indicativo de crase no texto CG2A1.\nI. O emprego do sinal indicativo de crase em «à esferográfica» (quarto período do primeiro parágrafo) é facultativo.\nII. Em «à mão» (terceiro período do terceiro parágrafo), o emprego do sinal indicativo de crase justifica-se pela mesma regra que prevê o uso desse sinal na expressão adverbial «às vezes».\nIII. O emprego do sinal indicativo de crase é opcional no trecho «Conhece-te a ti mesmo» (último período do terceiro parágrafo).\nAssinale a opção correta.',
    text_fragment:
      '<p>Luís Fernando Verissimo — <em>Memória e anotações</em> (Estadão, 2011 — adaptado)</p><p>Imagino que a escrita nasceu da necessidade de não esquecer. Para chegar ao papel e à esferográfica, passamos pelo risco com vara no chão e pelo hieróglifo no tablete de barro. O homem consulta as suas notas — e, às vezes, perde a ideia anotada no papel.</p>',
    options: [
      { id: 'A', text: 'Nenhum item está certo.', is_correct: false },
      { id: 'B', text: 'Apenas o item II está certo.', is_correct: true },
      { id: 'C', text: 'Apenas o item III está certo.', is_correct: false },
      { id: 'D', text: 'Apenas os itens I e II estão certos.', is_correct: false },
      { id: 'E', text: 'Apenas os itens I e III estão certos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'I · II · III — Verissimo',
        meta: slideMeta,
        items: [
          { label: 'Verissimo / escrita', detail: 'Memória e anotações — papel, esferográfica e bloco de notas.', icon: 'PenLine' },
          { label: 'I — à esferográfica', detail: 'Chegar ao papel e à esferográfica — crase obrigatória, não facultativa.', icon: 'XCircle' },
          { label: 'II — à mão', detail: 'Bloco à mão — locução adverbial fem., como às vezes.', icon: 'CheckCircle' },
          { label: 'III — a ti mesmo', detail: 'Conhece-te a ti mesmo — pronome, sem crase opcional.', icon: 'Ban' },
          { label: 'CG2A1', detail: 'Texto sobre memória, anotações e ideias esquecidas.', icon: 'BookOpen' },
        ],
        footer_rule: 'Só o item II está certo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Verissimo: escrita, esferográfica, bloco de notas à mão.',
          'I: «à esferográfica» facultativo? — a + a esferográfica → crase obrigatória. Item FALSO.',
          'II: «à mão» = mesma regra de «às vezes»? — locução adverbial fem. Item VERDADEIRO.',
          'III: crase opcional em «a ti mesmo»? — pronome pessoal barra crase. Item FALSO.',
          'Só II passa — gabarito B.',
          'C/D/E incluem I ou III incorretos.',
          'Em similares: locução à mão × destino à esferográfica.',
          'Funil: locução fem. × pronome × OD com artigo.',
        ],
        footer_rule: 'B = apenas o item II.',
      },
      {
        type: 'golden_rule',
        slide_title: 'VF de bolso',
        meta: slideMeta,
        content: 'I F · II V · III F',
        rows: [
          { label: 'I (falso)', value: 'à esferográfica — a+a fem., não facultativo' },
          { label: 'II (verdadeiro)', value: 'à mão — locução como às vezes' },
          { label: 'III (falso)', value: 'a ti mesmo — pronome, sem crase' },
          { label: 'Marque', value: 'apenas o item II' },
        ],
        footer_rule: 'Locução adverbial fem. = II.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas dos itens',
        meta: slideMeta,
        content: 'Achar I ou III certos',
        items: [
          { label: 'D — I e II', detail: 'I parece «facultativo culto» na esferográfica.', correct: 'À esferográfica é a+a fem. — crase obrigatória.' },
          { label: 'E — I e III', detail: 'Dois itens «opcionais».', correct: 'I exige crase; III é pronome sem crase.' },
          { label: 'C — só III', detail: '«Conhece-te a ti mesmo» parece aceitar à.', correct: 'Pronome pessoal: a ti, nunca à ti.' },
          { label: 'A — nenhum', detail: 'II é verdadeiro — não marque A.', correct: 'À mão = locução adverbial como às vezes.' },
          { label: 'Em outra banca…', detail: 'Trocam esferográfica por «à moda» ou «à noite».', correct: 'Classifique: locução × OD fem. × pronome.' },
        ],
        footer_rule: 'B: apenas II correto.',
      },
    ],
  },

  'avancasp-crase-facultativo-evidencias-3951800': {
    family: 'conceito',
    source_tec_id: '3951800',
    source_note: 'Crase facultativo — AVANÇASP Mon Cunha evidências à/a sua presença tec 3951800',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Mon (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa cuja lacuna pode ser preenchida com "a" ou "à", de acordo com a norma-padrão da Língua Portuguesa.',
    options: [
      { id: 'A', text: 'O material foi entregue ___ secretária para que ela desse a destinação adequada.', is_correct: false },
      { id: 'B', text: 'De janeiro ___ janeiro, aves migratórias cruzam por todo o país.', is_correct: false },
      { id: 'C', text: 'As evidências foram levadas ___ sua presença para uma análise com bom senso.', is_correct: true },
      { id: 'D', text: 'Eu me referi ___quela matéria que costuma causar muitas dificuldades.', is_correct: false },
      { id: 'E', text: 'Ontem no almoço nós comemos um bife ___ parmegiana muito suculento.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Facultativo: a ou à',
        meta: slideMeta,
        items: [
          { label: 'Evidências a/à', detail: 'Levadas a ou à sua presença — facultativo (C).', icon: 'Shuffle' },
          { label: 'Entregue à secretária', detail: 'Regência verbal — só a secretária (A).', icon: 'User' },
          { label: 'Janeiro a janeiro', detail: 'Intervalo — a simples (B).', icon: 'Calendar' },
          { label: 'Referi a matéria', detail: 'Demonstrativo «aquela» — a aquela (D).', icon: 'FileText' },
          { label: 'Bife à parmegiana', detail: 'Modo de preparo — locução fixa à (E).', icon: 'Utensils' },
        ],
        footer_rule: 'C aceita a e à — sua presença.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: lacuna aceita a e à — norma-padrão.',
          'A: entregue à secretária — regência fixa, não facultativo.',
          'B: de janeiro a janeiro — intervalo, só a.',
          'C: levadas a/à sua presença — ambas corretas.',
          'D: referi a aquela matéria — demonstrativo bloqueia à.',
          'E: bife à parmegiana — locução fixa, não facultativo.',
          'Gabarito C.',
          'Teste ao: levado ao local × levada à/a sua presença.',
        ],
        footer_rule: 'C = evidências a ou à sua presença.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Facultativo × fixo',
        meta: slideMeta,
        content: 'A OU À — QUANDO?',
        rows: [
          { label: 'Facultativo', value: 'levadas a/à sua presença — OD fem.' },
          { label: 'Regência', value: 'entregue a secretária — só a' },
          { label: 'Intervalo', value: 'de janeiro a janeiro' },
          { label: 'Demonstrativo', value: 'referi a aquela matéria' },
        ],
        footer_rule: 'C aceita as duas formas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar facultativo por locução',
        slide_title: 'Por que não são C',
        items: [
          { label: 'A — à secretária', detail: '«Entregue à secretária» parece facultativo.', correct: 'Entregue a secretária — regência verbal com a.' },
          { label: 'B — à janeiro', detail: 'Crase no intervalo.', correct: 'De janeiro a janeiro — a simples.' },
          { label: 'D — à aquela', detail: 'Crase antes de demonstrativo.', correct: 'Referi-me a aquela matéria — sem crase.' },
          { label: 'E — a parmegiana', detail: '«Bife a parmegiana» sem locução.', correct: 'Bife à parmegiana — locução fixa com crase.' },
          { label: 'Em outra banca…', detail: 'Pedem entrega a/à escola ou carta a/à mãe.', correct: 'Facultativo em OD fem. determinado — teste ao.' },
        ],
        footer_rule: 'C: a ou à sua presença.',
      },
    ],
  },

  'epice-crase-adultizacao-regencia-3951857': {
    family: 'text_fragment',
    source_tec_id: '3951857',
    source_note: 'Crase regência nominal — Épice Escorsim adultização homenagem à infância tec 3951857',
    meta: {
      banca: 'Épice',
      prova: 'ACS (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'É possível observar que no período «Que a nossa própria "adultização" seja, portanto, a melhor homenagem à infância que queremos proteger e o legado mais valioso que podemos deixar», presente no último parágrafo do texto, o acento grave (representativo da crase) foi utilizado por motivo de regência nominal.\nIdentifique a alternativa em que o acento grave foi usado pelo mesmo motivo.',
    text_fragment:
      '<p>Precisamos falar sobre a adultização dos adultos — Francisco Escorsim</p><p>Texto sobre Felca, miniinfluencers, pais que expõem filhos nas redes e a proposta de adultizar os adultos. Fecha com: a melhor homenagem à infância que queremos proteger.</p><p>Gazeta do Povo — adaptado</p>',
    options: [
      { id: 'A', text: 'Chegamos às cinco horas da tarde.', is_correct: false },
      { id: 'B', text: 'O autor faz alusão à linguagem utilizada pelos internautas.', is_correct: true },
      { id: 'C', text: 'À medida que estudamos, ficamos mais preparados.', is_correct: false },
      { id: 'D', text: 'Ele demonstrava que estava à frente de seu tempo.', is_correct: false },
      { id: 'E', text: 'Às vezes, ele age como uma criança.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Regência nominal',
        meta: slideMeta,
        items: [
          { label: 'Escorsim / Felca', detail: 'Adultização dos adultos — redes, pais e miniinfluencers.', icon: 'Smartphone' },
          { label: 'Homenagem à infância', detail: 'Crase por regência nominal do substantivo homenagem.', icon: 'Heart' },
          { label: 'Alusão à linguagem', detail: 'Fazer alusão à linguagem — mesmo motivo (B).', icon: 'MessageSquare' },
          { label: 'Às cinco horas', detail: 'Hora determinada — não regência nominal (A).', icon: 'Clock' },
          { label: 'Às vezes', detail: 'Locução adverbial — não regência nominal (E).', icon: 'Timer' },
        ],
        footer_rule: 'Homenagem à = alusão à — regência nominal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Escorsim: adultização, Felca, homenagem à infância no último parágrafo.',
          'Destaque: crase em «homenagem à infância» — regência nominal.',
          'A: «às cinco horas» — hora, não regência de substantivo.',
          'B: «alusão à linguagem» — fazer alusão a + a linguagem → regência nominal.',
          'C: «à medida que» — locução conjuntiva/adverbial.',
          'D: «à frente de» — locução prepositiva.',
          'E: «às vezes» — locução adverbial.',
          'Gabarito B — mesmo motivo da homenagem à infância.',
        ],
        footer_rule: 'B = alusão à linguagem.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Regência nominal',
        meta: slideMeta,
        content: 'HOMENAGEM À = ALUSÃO À',
        rows: [
          { label: 'Texto', value: 'homenagem à infância — RN' },
          { label: 'Par', value: 'alusão à linguagem — RN' },
          { label: 'Não é hora', value: 'às cinco horas — circunstância' },
          { label: 'Não é locução', value: 'às vezes · à frente de' },
        ],
        footer_rule: 'B: regência nominal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir RN com locução ou hora',
        slide_title: 'Pegadinhas',
        items: [
          { label: 'A — às horas', detail: 'Hora parece «regência culta».', correct: 'Chegamos às cinco horas — hora determinada.' },
          { label: 'C — à medida', detail: 'Locução parece substantivo.', correct: 'À medida que — locução, não RN de «medida».' },
          { label: 'D — à frente', detail: '«À frente de seu tempo» parece RN.', correct: 'Locução prepositiva, não complemento nominal.' },
          { label: 'E — às vezes', detail: 'Crase familiar atrai.', correct: 'Às vezes — locução adverbial fixa.' },
          { label: 'Em outra banca…', detail: 'Trocam homenagem por referência ou menção.', correct: 'Mesma RN: referência à · menção à.' },
        ],
        footer_rule: 'B passa: alusão à linguagem.',
      },
    ],
  },

  'epice-crase-facultativo-pestana-3951877': {
    family: 'conceito',
    source_tec_id: '3951877',
    source_note: 'Crase facultativo — Épice Pestana instruções à/a nossa instituição tec 3951877',
    meta: {
      banca: 'Épice',
      prova: 'ACS (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise as frases abaixo, retiradas de Pestana (2023), e assinale a alternativa em que o uso do acento grave, representativo da crase, é facultativo:',
    options: [
      { id: 'A', text: 'Ontem jantei um bacalhau à Gomes de Sá.', is_correct: false },
      { id: 'B', text: 'Iremos à uma reunião muito importante no domingo.', is_correct: false },
      { id: 'C', text: 'Talvez amanhã eu coma um tutu à mineira.', is_correct: false },
      { id: 'D', text: 'Hoje comerei um filé à Osvaldo Aranha.', is_correct: false },
      { id: 'E', text: 'Enviamos instruções à nossa instituição.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crase facultativa',
        meta: slideMeta,
        items: [
          { label: 'Instruções a/à', detail: 'Enviamos instruções à ou a nossa instituição (E).', icon: 'Shuffle' },
          { label: 'Bacalhau à Gomes', detail: 'Prato nomeado — locução fixa à (A).', icon: 'Utensils' },
          { label: 'À uma reunião', detail: 'Crase antes de numeral — só à (B).', icon: 'Calendar' },
          { label: 'Tutu à mineira', detail: 'Modo de preparo — locução à (C).', icon: 'MapPin' },
          { label: 'Filé à Osvaldo', detail: 'Prato nomeado — locução fixa (D).', icon: 'Beef' },
        ],
        footer_rule: 'E: instruções a ou à nossa instituição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: crase FACULTATIVA — aceita a e à.',
          'A: bacalhau à Gomes de Sá — locução fixa, não facultativo.',
          'B: à uma reunião — crase obrigatória antes de «uma».',
          'C: tutu à mineira — locução culinária fixa.',
          'D: filé à Osvaldo Aranha — locução fixa de prato.',
          'E: instruções à/a nossa instituição — ambas corretas.',
          'Gabarito E.',
          'Teste ao: instruções ao nosso departamento.',
        ],
        footer_rule: 'E = facultativo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Facultativo × fixo',
        meta: slideMeta,
        content: 'PESTANA — FACULTATIVO',
        rows: [
          { label: 'E (certa)', value: 'instruções a/à nossa instituição' },
          { label: 'Prato', value: 'à Gomes de Sá · à Osvaldo — fixo' },
          { label: 'Modo', value: 'tutu à mineira — locução' },
          { label: 'Numeral', value: 'à uma reunião — crase obrigatória' },
        ],
        footer_rule: 'E aceita a e à.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Locução fixa parece facultativa',
        slide_title: 'Pegadinhas',
        items: [
          { label: 'A — Gomes de Sá', detail: 'Prato nomeado parece aceitar «a».', correct: 'Bacalhau à Gomes de Sá — locução fixa com crase.' },
          { label: 'B — à uma', detail: '«A uma reunião» oral confunde.', correct: 'Iremos à uma reunião — crase obrigatória.' },
          { label: 'C — à mineira', detail: 'Modo regional parece flexível.', correct: 'Tutu à mineira — locução culinária fixa.' },
          { label: 'D — à Osvaldo', detail: 'Mesma pegadinha de A.', correct: 'Filé à Osvaldo Aranha — nome de prato.' },
          { label: 'Em outra banca…', detail: 'Carta a/à diretoria ou entrega a/à escola.', correct: 'OD fem. determinado — facultativo.' },
        ],
        footer_rule: 'E: instruções a ou à.',
      },
    ],
  },

  'caderno-pt-crase-penha-escrever-caneta': {
    family: 'text_fragment',
    source_tec_id: 'penha-cartacapital-2025',
    source_note: 'Crase comparação — editorial Penha arrancada à bala × escrever à caneta (CartaCapital)',
    meta: {
      banca: 'Caderno PT',
      prova: 'Crase — editorial CartaCapital (Penha)',
      orgao: 'AVANT',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No que diz respeito ao uso da crase, assinale a alternativa na qual o uso da crase assemelha-se ao caso em destaque na frase «Corpos de jovens, corpos sem nome, corpos com documentos no bolso e dignidade arrancada à bala», retirada do artigo de opinião lido.',
    text_fragment:
      '<p>O massacre na Penha obriga o país a escolher — Amarílis Costa (CartaCapital)</p><p>Moradores da Penha levaram corpos à Praça São Lucas. Trecho: dignidade arrancada à bala. Criolo, necropolítica, Operação Contenção e genocídio negro institucionalizado.</p><p>Fonte: cartacapital.com.br — adaptado</p>',
    options: [
      { id: 'A', text: 'Fui à praia no final de semana passado.', is_correct: false },
      { id: 'B', text: 'Eu costumo escrever à caneta.', is_correct: true },
      { id: 'C', text: 'Fizemos referência à autora durante a apresentação.', is_correct: false },
      { id: 'D', text: 'Uma ideia lhe veio à mente.', is_correct: false },
      { id: 'E', text: 'Peguei o carro na oficina às horas marcadas da tarde.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'À bala × à caneta',
        meta: slideMeta,
        items: [
          { label: 'Penha / Criolo', detail: 'Massacre na Penha — Praça São Lucas, CartaCapital.', icon: 'MapPin' },
          { label: 'Arrancada à bala', detail: 'Locução/regência de meio — crase no destaque.', icon: 'Target' },
          { label: 'Escrever à caneta', detail: 'Mesmo tipo: instrumento/meio — gabarito B.', icon: 'PenLine' },
          { label: 'À praia', detail: 'Destino — função distinta (A).', icon: 'Umbrella' },
          { label: 'Referência à autora', detail: 'Regência nominal — outro motivo (C).', icon: 'User' },
        ],
        footer_rule: 'Relatorio Penha: arrancada à bala ≈ escrever à caneta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Penha: corpos na praça, dignidade arrancada à bala.',
          'Destaque: «à bala» — meio/instrumento da ação.',
          'A: «à praia» — destino, não meio.',
          'B: «escrever à caneta» — instrumento, como «à bala».',
          'C: «referência à autora» — regência nominal.',
          'D: «veio à mente» — locução diferente.',
          'E: «às horas» — hora determinada.',
          'Gabarito B — crase por meio/instrumento.',
        ],
        footer_rule: 'B = escrever à caneta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Meio × destino',
        meta: slideMeta,
        content: 'À BALA = À CANETA',
        rows: [
          { label: 'Destaque', value: 'arrancada à bala — meio' },
          { label: 'Par', value: 'escrever à caneta — instrumento' },
          { label: 'Não é', value: 'à praia (destino) · à autora (RN)' },
          { label: 'Função', value: 'meio/instrumento com crase' },
        ],
        footer_rule: 'Meio/instrumento com crase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir meio com destino ou RN',
        slide_title: 'Pegadinhas',
        items: [
          { label: 'A — à praia', detail: 'Também tem crase — parece «igual».', correct: 'Fui à praia — destino, não meio da ação.' },
          { label: 'C — à autora', detail: 'Regência nominal parece técnica.', correct: 'Referência à autora — RN, não instrumento.' },
          { label: 'D — à mente', detail: 'Locução «veio à mente» confunde.', correct: 'Função distinta de «à bala»/«à caneta».' },
          { label: 'E — às horas', detail: 'Crase em hora atrai.', correct: 'Hora marcada — circunstância temporal.' },
          { label: 'Em outra banca…', detail: 'Trocam por «à moda de» ou «a pé».', correct: 'Compare função: meio/instrumento × destino.' },
        ],
        footer_rule: 'B passa: escrever à caneta.',
      },
    ],
  },
};

function main() {
  const outDir = loteQuestionsDir(LOTE);
  mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(outDir, `${slug}.json`);
    writeFileSync(path, `${JSON.stringify(build(slug, spec), null, 2)}\n`, 'utf8');
    n += 1;
    console.log(`[handcraft] OK ${slug}`);
  }
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
