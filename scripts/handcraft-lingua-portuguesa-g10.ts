#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g10 (8 slugs · Pontuação · lote 3).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g10.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g10 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g10 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';

const LOTE = 'lingua-portuguesa-g10';
const SUBTOPICO = 'Pontuação';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_pontuacao';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json';

const PT_PONTUACAO_SOURCE = {
  id: PT_PONTUACAO.id,
  tier: 'A' as const,
  issuer: PT_PONTUACAO.issuer,
  title: PT_PONTUACAO.title,
  year: PT_PONTUACAO.year,
  url: PT_PONTUACAO.url,
  covers: [
    'pergunta-teste',
    'sujeito-verbo',
    'zeugma',
    'reticencias',
    'dois-pontos',
    'enumeração',
    'parenteses',
    'concessiva',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment' | 'certo_errado';

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
  options: Opt[];
  source_tec_id: string;
  source_note: string;
  slides: unknown[];
  exam_vs_current?: string;
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
      reviewer: 'handcraft:lingua-portuguesa-g10',
      guideline_snapshot: `${PT_PONTUACAO.snapshot} · referência Rita → ${GOLDEN_REFERENCE}`,
      exam_vs_current: spec.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: [
      PT_PONTUACAO_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'M08 pergunta-teste'],
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

const MARTE_FRAGMENT =
  '<p><strong>Marte e a gravidade zero</strong> (Fernando Reinach — Estadão, 2024 — adaptado)</p>' +
  '<p>A humanidade se divide: bilhões acreditam que o futuro está na Terra; um grupo minúsculo aposta em <strong>colônias em Marte</strong>.</p>' +
  '<p>Estudo com mini-corações humanos: um operava na <strong>ausência de gravidade</strong> e a outra, com gravidade normal. ' +
  'Conclusão: o <strong>coração humano deteriora</strong> rapidamente sem gravidade — risco para viagens de meses.</p>';

const MAYARA_FRAGMENT =
  '<p><strong>Quando eu deixei de acreditar em mim</strong> (Mayara Godoy — cronicasdecategoria.com, 2024 — adaptado)</p>' +
  '<p>Eu sempre fui autoconfiante, estudiosa, com sede de conhecimento. Ao me formar, seguia em frente sem hesitar.</p>' +
  '<p>Com o passar dos anos, continuei perseguindo crescimento. ' +
  '<strong>Sempre segui estudando, me dedicando, dando o meu melhor.</strong> Mas, em algum momento, isso mudou.</p>' +
  '<p>Hoje me sinto incapaz, obsoleta, perdida. Aquela autoconfiança sumiu.</p>';

const SOLIDAO_FRAGMENT =
  '<p><strong>Por que agora a solidão nos adoece?</strong> (Leon Ferrari — Estadão, adaptado)</p>' +
  '<p>Para Vivek Murthy, a teoria evolutiva da solidão explica por que humanos sobreviveram em <strong>grupos sociais</strong>.</p>' +
  '<p><strong>Hoje, todavia, segundo os especialistas, a solidão é mais prevalente e intensa</strong> do que nunca — grave problema de saúde pública.</p>' +
  '<p>Murthy associa desconexão social a risco cardiovascular, demência e depressão. Japão criou um «Ministério da Solidão».</p>';

const DOR_FRAGMENT =
  '<p><strong>Texto II — As dores e o cérebro</strong> (BBC Português — adaptado)</p>' +
  '<p>«As dores são muito interessantes porque sabemos muito pouco sobre elas», diz Anne MacGregor, especialista em cefaleias.</p>' +
  '<p>A dor funciona como sistema de advertência: avisa que estamos fazendo algo prejudicial ao corpo.</p>' +
  '<p><strong>No entanto, embora o cérebro seja o órgão que recebe os sinais de dor</strong> captados pelo corpo, ' +
  'ele mesmo não tem terminações nervosas que captam a dor.</p>';

const SPECS: Record<string, Spec> = {
  'avancasp-amparo-pontuacao-incorreta-3353965': {
    family: 'certo_errado',
    source_tec_id: '3353965',
    source_note: 'INCORRETA sujeito|verbo — AVANÇASP ACEVA Pref Amparo 2025 tec 3353965',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACEVA (Pref Amparo SP)',
      orgao: 'Pref. Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Qual das frases a seguir está INCORRETA quanto ao emprego dos sinais de pontuação?',
    options: [
      { id: 'A', text: 'Cuidado! Há um buraco na calçada.', is_correct: false },
      {
        id: 'B',
        text: 'Eu vou levar alguns produtos de higiene pessoal: sabonete, pasta de dente e papel higiênico.',
        is_correct: false,
      },
      { id: 'C', text: 'Luana, venha até a minha sala.', is_correct: false },
      { id: 'D', text: 'Por que você não foi ao casamento?', is_correct: false },
      {
        id: 'E',
        text: 'A minha professora, ganhou muitos presentes no dia dos professores.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA: achar o erro',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Quatro frases corretas; uma incorreta.', icon: 'Search' },
          { label: 'A — exclamação', detail: '«Cuidado!» — interjeição + enunciado. Correto.', icon: 'Check' },
          { label: 'B — dois-pontos', detail: 'Enumeração após «:». Correto.', icon: 'Check' },
          { label: 'E — gabarito', detail: '«professora, ganhou» — sujeito|verbo. Incorreto.', icon: 'XCircle' },
        ],
        footer_rule: 'INCORRETA: localize vírgula entre sujeito e verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Corte letra a letra',
        meta: slideMeta,
        steps: [
          'Comando: qual frase está INCORRETA na pontuação?',
          'A: «Cuidado!» — exclamação direta. Pontuação correta.',
          'B: «higiene pessoal: sabonete…» — dois-pontos + enumeração. Correto.',
          'C: «Luana, venha» — vocativo isolado. Correto.',
          'D: pergunta direta «Por que…?» — sem erro de vírgula. Correto.',
          'E: «A minha professora, ganhou» — vírgula entre sujeito e verbo.',
          'Gabarito E — única incorreta.',
          'Em similares: o que a vírgula isola? Sujeito|verbo = erro clássico.',
        ],
        footer_rule: 'E = INCORRETA — sujeito|verbo cortado.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Trilho de bolso',
        meta: slideMeta,
        content: 'PROIBIÇÕES',
        rows: [
          { label: 'Sujeito|verbo', value: '«A professora ganhou» — sem vírgula no meio' },
          { label: 'Pode', value: 'vocativo (Luana,) · dois-pontos · exclamação' },
          { label: 'Pergunta-teste', value: 'O que a vírgula isola?' },
          { label: 'Nesta questão', value: 'E — incorreta' },
        ],
        footer_rule: 'Trilho sujeito|verbo livre — nunca «professora, ganhou».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o aluno cai',
        meta: slideMeta,
        content: 'Marcar frase correta no EXCETO',
        items: [
          {
            label: 'A — Cuidado!',
            detail: 'Exclamação parece estranha na prova.',
            correct: 'Interjeição + enunciado — pontuação correta.',
          },
          {
            label: 'B — dois-pontos',
            detail: 'Lista após «:» confunde com enumeração errada.',
            correct: 'Dois-pontos antes da enumeração — uso correto.',
          },
          {
            label: 'C — Luana',
            detail: 'Vocativo no início assusta.',
            correct: 'Vocativo «Luana,» isolado — correto.',
          },
          {
            label: 'D — pergunta',
            detail: '«Por que» parece erro ortográfico.',
            correct: 'Interrogação direta — sem falha de vírgula.',
          },
          {
            label: 'E — professora, ganhou',
            detail: 'Pausa oral parece justificar a vírgula.',
            correct: 'Erro: sujeito|verbo cortado — INCORRETA.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «professora» por «médico».',
            correct: 'Mesmo teste: o que isola? sujeito|verbo livre.',
          },
        ],
        footer_rule: 'E passa: única frase com pontuação errada.',
      },
    ],
  },

  'vunesp-sertaozinho-pontuacao-omissao-3354418': {
    family: 'text_fragment',
    source_tec_id: '3354418',
    source_note: 'Zeugma omissão operava — VUNESP An OP Pref Sertãozinho 2025 tec 3354418',
    meta: {
      banca: 'VUNESP',
      prova: 'An OP (Pref Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nAssinale a alternativa em cujo trecho a vírgula marca a omissão de um vocábulo.',
    text_fragment: MARTE_FRAGMENT,
    options: [
      {
        id: 'A',
        text: 'Um com bilhões de pessoas, que sabem que o futuro da espécie está fadado a ocorrer aqui…',
        is_correct: false,
      },
      {
        id: 'B',
        text: '… talvez Marte, onde deveríamos estabelecer colônias.',
        is_correct: false,
      },
      {
        id: 'C',
        text: '… está ligado a sensores presentes nos pontos de fixação, a frequência e a força de cada batimento cardíaco podem ser medidas.',
        is_correct: false,
      },
      {
        id: 'D',
        text: '… uma operava na ausência de gravidade e a outra, com gravidade normal.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'E pode atrasar muito, ou mesmo tornar impossível…',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula = omissão',
        chip_label: 'Zeugma',
        meta: slideMeta,
        items: [
          { label: 'Marte / gravidade', detail: 'Mini-corações: um sem gravidade, outro com gravidade normal.', icon: 'Rocket' },
          { label: '«a outra, com gravidade»', detail: 'Vírgula antes de termo omitido — zeugma.', icon: 'Minus' },
          { label: 'Verbo omitido', detail: 'Entende-se «operava» após «a outra,».', icon: 'Eye' },
          { label: 'Pergunta-teste', detail: 'O que a vírgula isola? O termo repetido que se elide.', icon: 'ScanSearch' },
        ],
        footer_rule: 'Zeugma: vírgula marca verbo/substantivo omitido.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Reinach: futuro em Marte; coração deteriora sem gravidade.',
          'Comando: vírgula que marca omissão de vocábulo (zeugma).',
          'A: oração subordinada — vírgula não marca elipse verbal.',
          'B: «Marte, onde» — vírgula antes de oração relativa, não omissão.',
          'C: adjunto deslocado antes do sujeito «a frequência» — outra função.',
          'E: enumeração «atrasar…, ou tornar» — coordenação, não zeugma.',
          'D: «uma operava… e a outra, com gravidade normal» — omite «operava».',
          'Gabarito D.',
          'Em similares: o que a vírgula isola? Repetição elidida = zeugma.',
        ],
        footer_rule: 'D = omissão de «operava» após «a outra,».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ZEUGMA',
        rows: [
          { label: 'Função', value: 'vírgula marca termo omitido (geralmente verbo)' },
          { label: 'Teste', value: 'complete mentalmente: «a outra [operava] com gravidade»' },
          { label: '≠ adjunto', value: 'deslocado ou enumeração — funções distintas' },
          { label: 'Nesta questão', value: 'D — gravidade / operava' },
        ],
        footer_rule: 'Vírgula + termo incompleto → complete o omitido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir zeugma com outras vírgulas',
        items: [
          { label: 'A — bilhões', detail: 'Vírgula após grupo nominal.', correct: 'Oração subordinada — não marca omissão.' },
          { label: 'B — Marte', detail: 'Pausa antes de «onde».', correct: 'Relativa «onde deveríamos» — não zeugma.' },
          { label: 'C — fixação', detail: 'Vírgula antes de nova oração.', correct: 'Adjunto deslocado — não elipse verbal.' },
          { label: 'E — impossível', detail: 'Vírgula antes de «ou».', correct: 'Coordenação alternativa — não omissão.' },
          { label: 'Em outra banca…', detail: 'Trocam «operava» por «funcionava».', correct: 'Mesmo teste: complete o verbo omitido.' },
        ],
        footer_rule: 'D passa: zeugma «a outra, [operava] com gravidade».',
      },
    ],
  },

  'fgv-ebserh-pontuacao-reticencias-3385117': {
    family: 'conceito',
    source_tec_id: '3385117',
    source_note: 'Reticências emoção intensa — FGV Tec EBSERH Citopatologia 2025 tec 3385117',
    meta: {
      banca: 'FGV',
      prova: 'Tec (EBSERH Citopatologia)',
      orgao: 'EBSERH',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a frase em que, comparativamente, as reticências mostram a expressão de uma emoção intensa.',
    options: [
      { id: 'A', text: 'O quadro não é ... um pouco ... como dizer?', is_correct: false },
      { id: 'B', text: 'Mas a barata ... a barata ... você a matou?', is_correct: true },
      { id: 'C', text: 'Quem diria...', is_correct: false },
      { id: 'D', text: 'Você já sabe, né? O casamento dele...', is_correct: false },
      { id: 'E', text: 'Comprei o carro barato... barato ...', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reticências e emoção',
        chip_label: 'Pontuação',
        meta: slideMeta,
        items: [
          { label: 'Reticências', detail: 'Sinal de pontuação — pausa, hesitação ou ênfase emocional.', icon: 'MoreHorizontal' },
          { label: 'Pergunta-teste M08', detail: 'O que a vírgula isola? Aqui: o que as reticências expressam?', icon: 'ScanSearch' },
          { label: 'B — barata', detail: 'Repetição + reticências = choque/indignação intensa.', icon: 'Zap' },
          { label: 'A — hesitação', detail: '«como dizer?» — dúvida, não emoção forte.', icon: 'HelpCircle' },
          { label: 'Comparativo', detail: 'FGV pede a frase com emoção mais intensa.', icon: 'Scale' },
        ],
        footer_rule: 'Reticências + repetição = emoção intensa (B).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: reticências que expressam emoção intensa (comparativamente).',
          'A: hesitação ao descrever quadro — dúvida, não choque.',
          'C: «Quem diria...» — ironia/surpresa leve.',
          'D/E: suspensão ou repetição fraca — menos intensidade.',
          'B: «a barata ... a barata ... você a matou?» — indignação repetida.',
          'Gabarito B.',
          'Em similares: reticências marcam hesitação, interrupção ou emoção forte?',
        ],
        footer_rule: 'B = emoção intensa — repetição indignada.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RETICÊNCIAS',
        rows: [
          { label: 'Hesitação', value: '«como dizer?» — dúvida na fala' },
          { label: 'Emoção intensa', value: 'repetição + reticências (barata... barata...)' },
          { label: 'Suspensão', value: 'frase interrompida — tom distinto' },
          { label: 'Nesta questão', value: 'B — indignação' },
        ],
        footer_rule: 'Compare intensidade: repetição emotiva vence hesitação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Igualar todas as reticências',
        items: [
          { label: 'A — um pouco', detail: 'Reticências parecem emoção.', correct: 'Hesitação/dúvida — intensidade menor.' },
          { label: 'C — Quem diria', detail: 'Suspensão clássica.', correct: 'Surpresa leve — não indignação repetida.' },
          { label: 'D — casamento', detail: 'Reticências no final.', correct: 'Suspensão informativa — tom mais fraco.' },
          { label: 'E — barato', detail: 'Repetição de palavra.', correct: 'Ênfase irônica — menos intensa que B.' },
          { label: 'Em outra banca…', detail: 'FGV costuma cobrar comparativo.', correct: 'Mesmo teste: qual emoção é mais forte?' },
        ],
        footer_rule: 'B passa: indignação repetida com reticências.',
      },
    ],
  },

  'fgv-ebserh-pontuacao-correta-3385123': {
    family: 'conceito',
    source_tec_id: '3385123',
    source_note: 'Pontuação correta dois-pontos — FGV Tec EBSERH 2025 tec 3385123',
    meta: {
      banca: 'FGV',
      prova: 'Tec (EBSERH Citopatologia)',
      orgao: 'EBSERH',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a frase cuja pontuação está correta.',
    options: [
      { id: 'A', text: 'A verdade, como todos sabem incomoda.', is_correct: false },
      { id: 'B', text: 'Você Paulo, me deve um grande favor.', is_correct: false },
      { id: 'C', text: 'Eis a verdade: nada dura a vida toda.', is_correct: true },
      { id: 'D', text: 'Eu, cumpri o meu dever.', is_correct: false },
      { id: 'E', text: 'Nós, graças a Deus, estamos, bem.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Frase correta',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          { label: 'C — gabarito', detail: '«Eis a verdade: nada dura a vida toda.» — dois-pontos explicativos.', icon: 'Check' },
          { label: 'Dois-pontos', detail: 'Sinal de pontuação — anuncia esclarecimento do que precede.', icon: 'TextQuote' },
          { label: 'Erros clássicos', detail: 'Sujeito|verbo (D/E) · vocativo sem vírgula (B).', icon: 'XCircle' },
          { label: 'Aposto (A)', detail: 'Falta vírgula após oração intercalada.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Só C: dois-pontos + trilhos intactos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: única frase com pontuação correta.',
          'A: «como todos sabem incomoda» — falta vírgula fechando aposto/oração.',
          'B: «Você Paulo,» — vocativo «Paulo» sem vírgula de isolamento.',
          'D: «Eu, cumpri» — sujeito|verbo cortado.',
          'E: «estamos, bem» — verbo|predicativo cortado.',
          'C: «Eis a verdade: nada dura…» — dois-pontos explicativos corretos.',
          'Gabarito C.',
          'Em similares: o que a vírgula isola? Sujeito|verbo livre; vocativo isolado.',
        ],
        footer_rule: 'C = dois-pontos explicativos corretos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PONTUAÇÃO CORRETA',
        rows: [
          { label: 'Dois-pontos', value: '«verdade: nada dura» — esclarecimento' },
          { label: 'Proibido', value: 'Eu, cumpri · estamos, bem · sujeito|verbo' },
          { label: 'Vocativo', value: 'Paulo, me deve — vírgula após o nome' },
          { label: 'Nesta questão', value: 'C' },
        ],
        footer_rule: 'Trilho sujeito|verbo livre; dois-pontos explicam.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pausa oral ≠ norma escrita',
        items: [
          { label: 'A — verdade', detail: 'Frase parece fluir sem vírgula extra.', correct: 'Oração intercalada exige vírgulas.' },
          { label: 'B — Paulo', detail: 'Vocativo colado ao pronome.', correct: 'Vocativo isolado: «Você, Paulo, me deve».' },
          { label: 'D — Eu, cumpri', detail: 'Pausa na fala justifica vírgula.', correct: 'Sujeito|verbo: Eu cumpri — sem vírgula.' },
          { label: 'E — estamos, bem', detail: 'Intercalado «graças a Deus» confunde.', correct: 'Predicativo colado: estamos bem.' },
          { label: 'Em outra banca…', detail: 'Trocam «verdade» por «fato».', correct: 'Mesmo teste: dois-pontos + trilhos livres.' },
        ],
        footer_rule: 'C passa: única pontuação correta.',
      },
    ],
  },

  'selecon-hemominas-pontuacao-enumeracao-3416694': {
    family: 'text_fragment',
    source_tec_id: '3416694',
    source_note: 'Enumeração verbos coordenados — SELECON ATHH HEMOMINAS 2025 tec 3416694',
    meta: {
      banca: 'SELECON',
      prova: 'ATHH (HEMOMINAS Auxiliar Administrativo)',
      orgao: 'HEMOMINAS',
      ano: '2025',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\n«Sempre segui estudando, me dedicando, dando o meu melhor» (7º parágrafo). Nesse trecho, as vírgulas foram empregadas para:',
    text_fragment: MAYARA_FRAGMENT,
    options: [
      { id: 'A', text: 'coordenar orações', is_correct: true },
      { id: 'B', text: 'inserir uma explicação', is_correct: false },
      { id: 'C', text: 'apresentar o uso de um aposto', is_correct: false },
      { id: 'D', text: 'indicar uma inversão na ordem dos termos da oração', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgulas no trecho Mayara',
        meta: slideMeta,
        items: [
          { label: 'estudando, dedicando, dando', detail: 'Três formas verbais coordenadas — mesma função.', icon: 'List' },
          { label: 'Autoconfiança', detail: 'Crônica sobre perda de fé em si mesma.', icon: 'User' },
          { label: 'Enumeração verbal', detail: 'Vírgulas separam orações/verbos de igual estatuto.', icon: 'GitBranch' },
          { label: 'Pergunta-teste', detail: 'O que a vírgula isola? Itens coordenados.', icon: 'ScanSearch' },
        ],
        footer_rule: 'Verbos paralelos → vírgula entre orações coordenadas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Mayara Godoy: autoconfiança que se perdeu com o tempo.',
          'Trecho: «Sempre segui estudando, me dedicando, dando o meu melhor».',
          'B: explicação — não há inciso explicativo; são ações paralelas.',
          'C: aposto — nenhum termo explica outro nome.',
          'D: inversão — ordem não está invertida; verbos seguem em série.',
          'A: coordenar orações — três predicados ligados ao mesmo «segui».',
          'Gabarito A.',
          'Em similares: o que a vírgula isola? Verbos paralelos = coordenação.',
        ],
        footer_rule: 'A = coordenação de orações/verbos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COORDENAÇÃO',
        rows: [
          { label: 'Trecho', value: 'estudando, me dedicando, dando o meu melhor' },
          { label: 'Função', value: 'vírgula entre orações coordenadas' },
          { label: '≠ aposto', value: 'não explica um substantivo' },
          { label: 'Nesta questão', value: 'A' },
        ],
        footer_rule: 'Mesma função sintática → coordenação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir coordenação com aposto ou inciso',
        items: [
          { label: 'B — explicação', detail: 'Vírgulas parecem inciso.', correct: 'São verbos coordenados, não explicação.' },
          { label: 'C — aposto', detail: '«me dedicando» parece comentar «estudando».', correct: 'Aposto explica nome; aqui são predicados.' },
          { label: 'D — inversão', detail: 'Ordem dos termos confunde.', correct: 'Não há inversão — série verbal paralela.' },
          { label: 'Em outra banca…', detail: 'Trocam verbos por substantivos.', correct: 'Mesmo teste: itens de mesma função?' },
        ],
        footer_rule: 'A passa: coordenação de orações.',
      },
    ],
  },

  'vunesp-itapevi-pontuacao-parenteses-3419140': {
    family: 'text_fragment',
    source_tec_id: '3419140',
    source_note: 'Parêntese observação suprimível — VUNESP Ag Pref Itapevi 2025 tec 3419140',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itapevi) Administração Pública',
      orgao: 'Pref. Itapevi',
      ano: '2025',
    },
    instruction:
      'Os parênteses permitem introduzir observação adicional que pode ser suprimida sem interferir na compreensão do texto. É o que ocorre no trecho reescrito em:',
    text_fragment: SOLIDAO_FRAGMENT,
    options: [
      {
        id: 'A',
        text: '«Assim temos (uma maior chance) de adaptação ao nosso ambiente», defendeu o psiquiatra…',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Hoje, todavia, segundo os especialistas, a solidão é mais prevalente (e intensa) do que nunca…',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Em relatório de 2023, Murthy destaca que essa condição (está associada) a um risco maior de doença cardiovascular…',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'O Japão criou um «Ministério da Solidão», e, no Reino Unido, (uma secretária) foi nomeada para combatê-la.',
        is_correct: false,
      },
      {
        id: 'E',
        text: '… têm a ver com profundidade, com estabelecer efetivas relações sociais e pensar que elas (são sempre) uma troca.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parêntese suprimível',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste M08', detail: 'Parêntese ≠ vírgula — mas pontuação isola observação suprimível.', icon: 'ScanSearch' },
          { label: 'Solidão / saúde', detail: 'Murthy: desconexão social como risco à saúde pública.', icon: 'HeartPulse' },
          { label: 'B — (e intensa)', detail: 'Observação acessória — pontuação suprimível sem perder sentido.', icon: 'Info' },
          { label: 'Suprimível', detail: '«prevalente do que nunca» permanece coerente.', icon: 'Check' },
          { label: '≠ essencial (C/D)', detail: 'Retirar verbo/sujeito quebra a frase.', icon: 'XCircle' },
        ],
        footer_rule: 'Parêntese = observação que pode sair sem prejuízo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Ferrari: solidão como epidemia; teoria evolutiva de Cacioppo.',
          'Comando: parêntese com observação suprimível.',
          'A: «(uma maior chance)» — complemento nominal essencial.',
          'C: «(está associada)» — verbo do predicado; não suprimível.',
          'D: «(uma secretária)» — sujeito da oração; retirar quebra sintaxe.',
          'E: «(são sempre)» — núcleo verbal; não é mero comentário.',
          'B: «prevalente (e intensa) do que nunca» — adjunto opcional.',
          'Gabarito B.',
          'Em similares: tire o parêntese — a frase ainda fecha?',
        ],
        footer_rule: 'B = «(e intensa)» observação suprimível.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PARÊNTESES',
        rows: [
          { label: 'Função', value: 'observação acessória suprimível' },
          { label: 'Teste', value: 'retire o parêntese — sentido central permanece?' },
          { label: 'Não é', value: 'sujeito, verbo ou OD indispensáveis' },
          { label: 'Nesta questão', value: 'B — (e intensa)' },
        ],
        footer_rule: 'Parêntese suprimível ≠ termo sintático essencial.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Parêntese com termo indispensável',
        items: [
          { label: 'A — chance', detail: 'Parêntese no SN parece opcional.', correct: '«uma maior chance» é complemento essencial.' },
          { label: 'C — associada', detail: 'Parêntese no verbo confunde.', correct: 'Verbo «está associada» — não suprimível.' },
          { label: 'D — secretária', detail: 'Sujeito entre parênteses.', correct: 'Sujeito da oração — retirar quebra a frase.' },
          { label: 'E — são sempre', detail: 'Parêntese no predicado.', correct: 'Núcleo verbal — não mera observação.' },
          { label: 'Em outra banca…', detail: 'Trocam «intensa» por «grave».', correct: 'Mesmo teste: adjunto acessório suprimível?' },
        ],
        footer_rule: 'B passa: (e intensa) suprimível.',
      },
    ],
  },

  'ibfc-ses-se-pontuacao-concessiva-3450786': {
    family: 'text_fragment',
    source_tec_id: '3450786',
    source_note: 'Oração concessiva embora — IBFC Tec Enf SES SE 2025 tec 3450786',
    meta: {
      banca: 'IBFC',
      prova: 'Tec Enf (SES SE)',
      orgao: 'SES SE',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise o texto a seguir e responda à questão abaixo.\n\nNo último parágrafo, a oração entre vírgulas possui um valor semântico:',
    text_fragment: DOR_FRAGMENT,
    options: [
      { id: 'A', text: 'conclusivo.', is_correct: false },
      { id: 'B', text: 'concessivo.', is_correct: true },
      { id: 'C', text: 'conformativo.', is_correct: false },
      { id: 'D', text: 'consecutivo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Oração entre vírgulas',
        chip_label: 'Valor semântico',
        meta: slideMeta,
        items: [
          { label: 'Dor interessante', detail: '«As dores são muito interessantes» — MacGregor, cefaleias.', icon: 'Brain' },
          { label: 'Sistema de advertência', detail: 'Dor avisa que estamos fazendo algo prejudicial ao corpo.', icon: 'AlertTriangle' },
          { label: '«embora o cérebro seja…»', detail: 'Concessiva: admite fato contrário ao principal.', icon: 'GitBranch' },
          { label: 'Terminações nervosas', detail: 'Cérebro recebe sinais, mas não tem terminações que captam dor.', icon: 'Zap' },
        ],
        footer_rule: 'Embora = concessiva — fato contrário admitido.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto BBC: «As dores são muito interessantes» — MacGregor estuda cefaleias e advertência da dor.',
          'Último parágrafo: «No entanto, embora o cérebro seja…, ele não tem terminações nervosas…».',
          'A: conclusivo — não há ideia de conclusão («portanto»).',
          'C: conformativo — não confirma conformidade («conforme»).',
          'D: consecutivo — não expressa consequência («tão… que»).',
          'B: concessivo — «embora» admite oposição: recebe sinais, mas não sente.',
          'Gabarito B.',
          'Em similares: o que a vírgula isola? Embora/ainda que = concessiva.',
        ],
        footer_rule: 'B = valor concessivo (embora).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONCESSIVA',
        rows: [
          { label: 'Conectivo', value: 'embora, ainda que, mesmo que' },
          { label: 'Sentido', value: 'admite fato contrário ao da oração principal' },
          { label: 'Trecho', value: 'embora o cérebro receba sinais…' },
          { label: 'Nesta questão', value: 'B — concessivo' },
        ],
        footer_rule: 'Embora = apesar de — oração concessiva.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir tipos de subordinada adverbial',
        items: [
          { label: 'A — conclusivo', detail: '«No entanto» parece conclusão.', correct: 'Conclusiva usa «portanto»; aqui é «embora».' },
          { label: 'C — conformativo', detail: 'Oposição confundida com conformidade.', correct: 'Conformativa confirma modo («conforme»).' },
          { label: 'D — consecutivo', detail: 'Contraste parece consequência.', correct: 'Consecutiva = resultado («tão… que»).' },
          { label: 'Em outra banca…', detail: 'Trocam «embora» por «mesmo que».', correct: 'Mesmo valor concessivo.' },
        ],
        footer_rule: 'B passa: oração concessiva com «embora».',
      },
    ],
  },

  'avancasp-morungaba-pontuacao-dois-pontos-3452341': {
    family: 'conceito',
    source_tec_id: '3452341',
    source_note: 'Dois-pontos esclarecimento Sabino — AVANÇASP ACS Pref Morungaba 2025 tec 3452341',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Morungaba)',
      orgao: 'Pref. Morungaba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder a questão abaixo.\n\nEm «Sei dizer não senhor: não tomo café.» e «Sei dizer não senhor: eu não sou daqui.» O emprego de dois-pontos serve para:',
    options: [
      {
        id: 'A',
        text: 'Indicar um esclarecimento, um resultado ou resumo do que se disse.',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'Anunciar a fala dos personagens nas histórias de ficção.',
        is_correct: false,
      },
      { id: 'C', text: 'Anteceder uma citação direta.', is_correct: false },
      { id: 'D', text: 'Indicar a elipse de um termo.', is_correct: false },
      { id: 'E', text: 'Indicar pergunta direta.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois-pontos em Sabino',
        chip_label: 'Pontuação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste M08', detail: 'Sinal de pontuação — o que vem após «:» esclarece o anterior.', icon: 'ScanSearch' },
          { label: 'Conversinha mineira', detail: 'Diálogo irônico no bar — Sabino, 1962.', icon: 'Coffee' },
          { label: '«Sei dizer não senhor:»', detail: 'Fórmula + esclarecimento do que se sabe dizer.', icon: 'MessageSquare' },
          { label: 'Esclarecimento', detail: 'Dois-pontos introduzem explicação/resposta.', icon: 'TextQuote' },
          { label: '≠ citação (C)', detail: 'Não antecede fala de terceiro citado.', icon: 'Quote' },
        ],
        footer_rule: 'Dois-pontos = esclarecimento do que precede.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Sabino: diálogo mineiro sobre café, leite e política local.',
          'Trechos: «Sei dizer não senhor: não tomo café» / «… eu não sou daqui».',
          'B: fala de ficção — diálogo usa travessão/aspas, não esta função dos «:».',
          'C: citação direta — aqui é esclarecimento, não abertura de citação.',
          'D: elipse — não há termo omitido marcado por «:».',
          'E: pergunta — frases declarativas após os dois-pontos.',
          'A: esclarecimento/resumo — «não tomo café» explica «sei dizer».',
          'Gabarito A.',
          'Em similares: o que vem depois dos «:»? Esclarecimento do anterior.',
        ],
        footer_rule: 'A = esclarecimento após «Sei dizer».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOIS-PONTOS',
        rows: [
          { label: 'Função', value: 'esclarecimento, resultado ou resumo' },
          { label: 'Sabino', value: '«Sei dizer não senhor: não tomo café»' },
          { label: '≠ citação', value: 'discurso direto usa travessão/aspas' },
          { label: 'Nesta questão', value: 'A' },
        ],
        footer_rule: '«:» anuncia o que esclarece a fórmula anterior.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir dois-pontos com diálogo ou citação',
        items: [
          { label: 'B — ficção', detail: 'Texto é narrativa dialogada.', correct: 'Diálogo usa travessão; «:» aqui esclarece.' },
          { label: 'C — citação', detail: 'Aspas no texto confundem.', correct: 'Citação direta ≠ esclarecimento interno.' },
          { label: 'D — elipse', detail: 'Fórmula mineira parece omitir termo.', correct: 'Não há zeugma — há explicação.' },
          { label: 'E — pergunta', detail: 'Tom dialogal parece interrogação.', correct: 'Orações após «:» são declarativas.' },
          { label: 'Em outra banca…', detail: 'Trocam Sabino por outro cronista.', correct: 'Mesmo teste: esclarecimento após «:».' },
        ],
        footer_rule: 'A passa: esclarecimento/resumo.',
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
