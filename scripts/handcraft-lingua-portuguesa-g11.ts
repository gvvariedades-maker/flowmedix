#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g11 (8 slugs · Pontuação · lote 4).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g11.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g11 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g11 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';

const LOTE = 'lingua-portuguesa-g11';
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
    'vocativo',
    'aposto',
    'reescrita',
    'reticencias',
    'adjunto-deslocado',
    'travessao',
    'dois-pontos',
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
      reviewer: 'handcraft:lingua-portuguesa-g11',
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

const ARMANDINHO_FRAGMENT =
  '<p><strong>Armandinho</strong> (tirinha de Alexandre Beck — adaptado)</p>' +
  '<p>Personagem filósofo do cotidiano reflete sobre situações do dia a dia em quadrinhos de humor.</p>' +
  '<p>No <strong>segundo quadrinho</strong>, a fala termina com reticências (...). ' +
  'No <strong>terceiro quadrinho</strong>, a frase também começa com reticências — ' +
  'marca hesitação ou breve interrupção do pensamento antes de concluir a ideia.</p>';

const CDH_FRAGMENT =
  '<p><strong>CDH — crianças indígenas</strong> (Agência Senado, 23.05.2024 — adaptado)</p>' +
  '<p>A Comissão de Direitos Humanos debateu o fortalecimento de políticas públicas para a proteção de crianças e adolescentes indígenas.</p>' +
  '<p>No debate, o indígena ianomâmi Renato Sanumá falou sobre abandono e abuso sexual infantil nas aldeias.</p>' +
  '<p><strong>Ele participou do debate por videoconferência em sua língua nativa</strong> — traduzida durante a audiência.</p>' +
  '<p>Vanessa Quaresma, da Secretaria de Saúde Indígena, destacou metas de redução da mortalidade infantil e barreiras geográficas nos territórios.</p>';

const VIETNA_FRAGMENT =
  '<p><strong>Vietnã</strong> (Wisława Szymborska — adaptado)</p>' +
  '<p>Mulher, como você se chama? – Não sei.<br/>' +
  'Quando você nasceu, de onde você vem? – Não sei.<br/>' +
  'Para que cavou uma toca na terra? – Não sei.<br/>' +
  'Desde quando está aqui escondida? – Não sei.<br/>' +
  'Por que mordeu o meu dedo anular? – Não sei.<br/>' +
  'Não sabe que não vamos te fazer nenhum mal? – Não sei.<br/>' +
  'De que lado você está? – Não sei.<br/>' +
  'É a guerra, você tem que escolher. – Não sei.<br/>' +
  'Tua aldeia ainda existe? – Não sei.<br/>' +
  'Esses são teus filhos? – São.</p>';

const ALMA_GEMEA_FRAGMENT =
  '<p><strong>E se?</strong> (Randall Munroe — adaptado)</p>' +
  '<p>E se todo mundo realmente tivesse uma alma gêmea, que fosse uma pessoa aleatória em qualquer lugar do mundo? Resposta: seria um pesadelo.</p>' +
  '<p>Se fôssemos emparelhados aleatoriamente, 90% de nossas almas gêmeas estariam mortas há muito tempo.</p>' +
  '<p>O número de estranhos com os quais estabelecemos contato visual por dia varia de quase zero ' +
  '(no caso de introvertidos ou gente que mora em cidades pequenas) a muitos milhares ' +
  '(como um policial na Times Square).</p>' +
  '<p><strong>Eu sou bastante introvertido, então no meu caso a estimativa é bem generosa.</strong></p>';

const SPECS: Record<string, Spec> = {
  'avancasp-fusam-pontuacao-incorreta-3460046': {
    family: 'certo_errado',
    source_tec_id: '3460046',
    source_note: 'INCORRETA vocativo mal pontuado — AVANÇASP Ana FUSAM Controladoria 2025 tec 3460046',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ana (FUSAM Controladoria)',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'O emprego da vírgula está INCORRETO apenas em:',
    options: [
      { id: 'A', text: 'Ela, que não gostava do rapaz, casou-se mesmo assim.', is_correct: false },
      {
        id: 'B',
        text: 'A mãe perguntou, à professora, a data das provas do filho.',
        is_correct: true,
      },
      { id: 'C', text: 'As árvores, floridas e cheias de vida, enfeitavam a rua.', is_correct: false },
      { id: 'D', text: 'O rapaz trabalha de manhã e a moça, à tarde.', is_correct: false },
      {
        id: 'E',
        text: 'A menina, sabendo de suas obrigações, passou a ajudar os pais.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA: vocativo × OD',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Quatro frases corretas; uma incorreta.', icon: 'Search' },
          { label: 'A — oração adjetiva', detail: '«Ela, que não gostava…» — vírgulas em adjetiva explicativa. Correto.', icon: 'Check' },
          { label: 'B — gabarito', detail: '«perguntou, à professora,» — OD mal isolado como vocativo.', icon: 'XCircle' },
          { label: 'Teste aposto × vocativo', detail: '«professora» não é chamamento — é destinatário da pergunta.', icon: 'HelpCircle' },
        ],
        footer_rule: 'INCORRETA: «à professora» é OD, não vocativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Corte letra a letra',
        meta: slideMeta,
        steps: [
          'Comando: vírgula INCORRETA apenas em uma alternativa.',
          'A: «Ela, que não gostava…» — oração adjetiva explicativa entre vírgulas. Correto.',
          'C: «As árvores, floridas e cheias de vida,» — aposto/adjetivo explicativo. Correto.',
          'D: «a moça, à tarde» — zeugma/termo omitido após vírgula. Correto.',
          'E: «A menina, sabendo de suas obrigações,» — oração subordinada reduzida. Correto.',
          'B: «A mãe perguntou, à professora, a data» — vírgulas isolam OD como se fosse vocativo.',
          'Correto seria: «perguntou à professora» ou «perguntou, professora, a data».',
          'Gabarito B — única incorreta.',
          'Em similares: o que a vírgula isola? Vocativo chama; OD complementa o verbo.',
        ],
        footer_rule: 'B = INCORRETA — vocativo mal pontuado.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Trilho de bolso',
        meta: slideMeta,
        content: 'VOCATIVO × OD',
        rows: [
          { label: 'Vocativo', value: 'chama alguém: «professora, a data?»' },
          { label: 'OD', value: 'complemento do verbo: «perguntou à professora»' },
          { label: 'Erro clássico', value: '«perguntou, à professora,» — vírgula no OD' },
          { label: 'Nesta questão', value: 'B — incorreta' },
        ],
        footer_rule: 'Vocativo chama; OD não leva vírgula de isolamento.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o aluno cai',
        meta: slideMeta,
        content: 'Marcar frase correta no EXCETO',
        items: [
          {
            label: 'A — oração adjetiva',
            detail: 'Vírgulas em «que não gostava» parecem erro.',
            correct: 'Oração adjetiva explicativa — pontuação correta.',
          },
          {
            label: 'C — aposto',
            detail: 'Adjunto longo entre vírgulas confunde.',
            correct: 'Aposto/adjetivo explicativo — correto.',
          },
          {
            label: 'D — zeugma',
            detail: '«a moça, à tarde» parece estranho.',
            correct: 'Zeugma — omissão de verbo após vírgula. Correto.',
          },
          {
            label: 'E — subordinada',
            detail: 'Inciso inicial entre vírgulas.',
            correct: 'Oração subordinada reduzida — correto.',
          },
          {
            label: 'B — à professora',
            detail: 'Pausa oral parece vocativo.',
            correct: 'OD do verbo perguntar — sem vírgulas: «perguntou à professora».',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «professora» por «diretora».',
            correct: 'Mesmo teste: vocativo chama ou OD complementa?',
          },
        ],
        footer_rule: 'B passa: única vírgula incorreta.',
      },
    ],
  },

  'avancasp-fusam-pontuacao-reescrita-3460254': {
    family: 'conceito',
    source_tec_id: '3460254',
    source_note: 'Reescrita pontuação discurso direto — AVANÇASP Cont FUSAM 2025 tec 3460254',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Cont (FUSAM)',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'O excerto a seguir não apresenta sinais de pontuação. Analise-o e assinale a alternativa que o reescreve corretamente, com a segmentação das orações e os sinais de pontuação necessários à sua interpretação.\n\n«A colega convidou-me para conhecer a sua casa pensei céus logo hoje mas mesmo assim eu fui o que não fazemos para agradar aos outros não é»',
    options: [
      {
        id: 'A',
        text: 'A colega convidou-me para, conhecer a sua casa, pensei: "céus. logo, hoje?" Mas, mesmo assim eu fui. O que não fazemos, para agradar aos outros, não, é!',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'A colega, convidou-me para conhecer a sua casa. Pensei, céus, logo hoje! Mas, mesmo assim, eu fui. O que não fazemos, para agradar aos outros, não é?',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'A colega convidou-me para conhecer a sua casa, pensei, céus, logo hoje! Mas mesmo, assim eu fui; o que não fazemos para agradar aos outros não, é?',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A colega convidou-me para conhecer a sua casa. Pensei: "Céus! Logo hoje?". Mas, mesmo assim, eu fui. O que não fazemos para agradar aos outros, não é?',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'A colega convidou-me para conhecer, a sua casa! Pensei, céus. Logo, hoje… Mas, mesmo assim eu fui. O que não fazemos para agradar, aos outros… não é!',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reescrita com pontuação',
        chip_label: 'Períodos + discurso direto',
        meta: slideMeta,
        items: [
          { label: 'Trecho sem sinais', detail: 'Convite + pensamento + ida + reflexão final.', icon: 'FileText' },
          { label: 'D — gabarito', detail: 'Períodos corretos + Pensei: «Céus! Logo hoje?» + discurso direto.', icon: 'Check' },
          { label: 'Dois-pontos + aspas', detail: 'Discurso direto após «Pensei:» — interjeição + pergunta.', icon: 'MessageSquare' },
          { label: 'Erros comuns', detail: 'Sujeito|verbo (B) · vírgula no infinitivo (A/E).', icon: 'XCircle' },
        ],
        footer_rule: 'D: segmentação + discurso direto corretos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: convite da colega → pensamento «céus logo hoje» → fui mesmo assim → reflexão.',
          'A: vírgula no infinitivo «para, conhecer» — erro. Pontuação confusa no final.',
          'B: «A colega, convidou-me» — sujeito|verbo cortado. Discurso direto sem aspas.',
          'C: vírgula antes de «assim»; ponto e vírgula inadequado; vírgula antes de «é».',
          'E: vírgula no SN «conhecer, a sua casa»; reticências onde não cabem.',
          'D: períodos bem fechados. «Pensei: "Céus! Logo hoje?"» — discurso direto correto.',
          'Gabarito D.',
          'Em similares: feche períodos; discurso direto = dois-pontos + aspas + sinais internos.',
        ],
        footer_rule: 'D = reescrita correta com discurso direto.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REESCRITA',
        rows: [
          { label: 'Períodos', value: 'cada oração com ponto final adequado' },
          { label: 'Discurso direto', value: 'Pensei: «Céus! Logo hoje?»' },
          { label: 'Proibido', value: 'colega, convidou · para, conhecer' },
          { label: 'Nesta questão', value: 'D' },
        ],
        footer_rule: 'Segmentar orações; discurso direto com «:» + aspas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir pausa oral com norma',
        items: [
          { label: 'A — infinitivo', detail: 'Vírgula após «para» parece natural.', correct: 'Infinitivo colado: «para conhecer» — sem vírgula.' },
          { label: 'B — colega, convidou', detail: 'Pausa na fala justifica vírgula.', correct: 'Sujeito|verbo livre: «A colega convidou-me».' },
          { label: 'C — mesmo, assim', detail: 'Advérbio parece intercalado.', correct: '«mesmo assim» — locução advérbial unida.' },
          { label: 'E — reticências', detail: 'Suspensão dramática no pensamento.', correct: 'Interjeição + pergunta exclamativa — não reticências.' },
          { label: 'Em outra banca…', detail: 'Trocam «céus» por «nossa».', correct: 'Mesmo teste: períodos + discurso direto.' },
        ],
        footer_rule: 'D passa: única reescrita correta.',
      },
    ],
  },

  'avancasp-vinhedo-pontuacao-reticencias-3554844': {
    family: 'text_fragment',
    source_tec_id: '3554844',
    source_note: 'Reticências hesitação Armandinho — AVANÇASP ACD Pref Vinhedo 2025 tec 3554844',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACD (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2025',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nNo fim da frase do segundo quadrinho e no início da frase do terceiro, há reticências. Por qual razão esse sinal de pontuação é utilizado na tirinha?',
    text_fragment: ARMANDINHO_FRAGMENT,
    options: [
      { id: 'A', text: 'Depois de interjeição para exprimir susto.', is_correct: false },
      { id: 'B', text: 'Para fechar o período.', is_correct: false },
      { id: 'C', text: 'Para indicar certa hesitação ou breve interrupção do pensamento.', is_correct: true },
      { id: 'D', text: 'Para isolar frases intercaladas no período, com caráter explicativo.', is_correct: false },
      { id: 'E', text: 'Nos diálogos, para indicar mudança de interlocutor.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reticências na tirinha',
        chip_label: 'Hesitação',
        meta: slideMeta,
        items: [
          { label: 'Armandinho', detail: 'Tirinha de humor filosófico — reticências no 2º e 3º quadrinhos.', icon: 'MessageCircle' },
          { label: 'Reticências', detail: 'Sinal de pontuação — pausa, hesitação ou interrupção.', icon: 'MoreHorizontal' },
          { label: 'C — gabarito', detail: 'Hesitação ou breve interrupção do pensamento.', icon: 'Check' },
          { label: '≠ travessão (E)', detail: 'Mudança de interlocutor usa travessão, não reticências.', icon: 'Minus' },
        ],
        footer_rule: 'Reticências = hesitação/interrupção do pensamento.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: tirinha Armandinho — reticências no fim do 2º quadrinho e início do 3º.',
          'A: após interjeição de susto — não é o caso; não há «Ai!» ou similar.',
          'B: fechar período — reticências não substituem ponto final.',
          'D: isolar frase intercalada explicativa — função da vírgula/travessão.',
          'E: mudança de interlocutor — função do travessão em diálogos.',
          'C: hesitação ou breve interrupção do pensamento — pausa reflexiva.',
          'Gabarito C.',
          'Em similares: reticências marcam hesitação, não diálogo nem enumeração.',
        ],
        footer_rule: 'C = hesitação/interrupção do pensamento.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RETICÊNCIAS',
        rows: [
          { label: 'Hesitação', value: 'pausa reflexiva ou interrupção do pensamento' },
          { label: '≠ susto', value: 'interjeição usa exclamação, não reticências' },
          { label: '≠ diálogo', value: 'mudança de interlocutor = travessão' },
          { label: 'Nesta questão', value: 'C — Armandinho' },
        ],
        footer_rule: 'Reticências = pensamento interrompido ou hesitante.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir reticências com outros sinais',
        items: [
          { label: 'A — susto', detail: 'Reticências parecem emoção.', correct: 'Susto = exclamação após interjeição.' },
          { label: 'B — fechar', detail: 'Reticências no fim parecem ponto.', correct: 'Ponto final encerra; reticências suspendem.' },
          { label: 'D — intercalada', detail: 'Pausa parece inciso explicativo.', correct: 'Inciso explicativo = vírgulas/travessão.' },
          { label: 'E — interlocutor', detail: 'Quadrinhos têm diálogo.', correct: 'Diálogo em tirinha usa balões; travessão muda falante.' },
          { label: 'Em outra banca…', detail: 'Trocam tirinha por romance.', correct: 'Mesmo teste: hesitação ou interrupção?' },
        ],
        footer_rule: 'C passa: hesitação/interrupção do pensamento.',
      },
    ],
  },

  'vunesp-itatiba-pontuacao-virgula-3583301': {
    family: 'text_fragment',
    source_tec_id: '3583301',
    source_note: 'Vírgula adjunto deslocado CDH — VUNESP Ag Pref Itatiba Fiscal Ambiental 2025 tec 3583301',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba) Fiscal Ambiental',
      orgao: 'Pref. Itatiba',
      ano: '2025',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nO acréscimo de uma vírgula ao trecho manteve a norma-padrão do emprego desse sinal de pontuação em:',
    text_fragment: CDH_FRAGMENT,
    options: [
      {
        id: 'A',
        text: 'A Comissão de Direitos Humanos (CDH) debateu, o fortalecimento de políticas públicas para a proteção de crianças e adolescentes indígenas.',
        is_correct: false,
      },
      {
        id: 'B',
        text: '… o indígena ianomâmi Renato Sanumá, falou sobre as dificuldades de combater o abandono e o abuso sexual infantil…',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Ele participou do debate por videoconferência, em sua língua nativa – traduzida durante a audiência.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Ela ressaltou que, as dificuldades geográficas são uma das barreiras para acessibilidade dos serviços de saúde nos territórios indígenas.',
        is_correct: false,
      },
      {
        id: 'E',
        text: '… Vanessa afirmou que uma das estratégias trabalhadas pela secretaria, envolve integrar práticas de cuidados…',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula correta no texto',
        chip_label: 'Adjunto deslocado',
        meta: slideMeta,
        items: [
          { label: 'CDH / indígenas', detail: 'Comissão de Direitos Humanos debateu fortalecimento de políticas para criancas indigenas.', icon: 'Globe' },
          { label: 'Sanumá / videoconferência', detail: 'Indígena ianomâmi participou por videoconferência em sua língua nativa.', icon: 'Video' },
          { label: 'C — gabarito', detail: '«videoconferência, em sua língua nativa» — adjunto deslocado.', icon: 'Check' },
          { label: 'Adjunto deslocado', detail: 'Termo deslocado para depois do núcleo → vírgula de isolamento.', icon: 'ArrowRight' },
        ],
        footer_rule: 'Adjunto deslocado após o núcleo → vírgula correta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto CDH: Comissão de Direitos Humanos debateu fortalecimento de politicas publicas para criancas indigenas.',
          'Sanumá participou por videoconferência em sua língua nativa.',
          'Comando: acréscimo de vírgula manteve a norma-padrão.',
          'A: «debateu, o fortalecimento» — verbo|OD cortado. Incorreto.',
          'B: «Sanumá, falou» — sujeito|verbo cortado. Incorreto.',
          'D: «que, as dificuldades» — vírgula após «que» quebra a subordinada. Incorreto.',
          'E: «secretaria, envolve» — sujeito|verbo cortado. Incorreto.',
          'C: «videoconferência, em sua língua nativa» — adjunto deslocado isolado.',
          'Gabarito C.',
          'Em similares: o que a vírgula isola? Adjunto deslocado = correto; sujeito|verbo = erro.',
        ],
        footer_rule: 'C = adjunto deslocado «em sua língua nativa».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO DESLOCADO',
        rows: [
          { label: 'Correto', value: '«videoconferência, em sua língua nativa»' },
          { label: 'Proibido', value: 'Sanumá, falou · debateu, o fortalecimento' },
          { label: 'Teste', value: 'o que a vírgula isola? adjunto ou trilho sujeito|verbo?' },
          { label: 'Nesta questão', value: 'C' },
        ],
        footer_rule: 'Adjunto deslocado → vírgula; sujeito|verbo → sem vírgula.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgula onde a norma proíbe',
        items: [
          { label: 'A — debateu, o', detail: 'Pausa oral após verbo.', correct: 'Verbo|OD: debateu o fortalecimento — sem vírgula.' },
          { label: 'B — Sanumá, falou', detail: 'Nome longo parece vocativo.', correct: 'Sujeito|verbo: Sanumá falou — sem vírgula.' },
          { label: 'D — que, as', detail: 'Vírgula após conectivo.', correct: 'Subordinada substantiva: que as dificuldades — sem vírgula.' },
          { label: 'E — secretaria, envolve', detail: 'Pausa antes do verbo.', correct: 'Sujeito|verbo: secretaria envolve — sem vírgula.' },
          { label: 'Em outra banca…', detail: 'Trocam «língua nativa» por «tradutor».', correct: 'Mesmo teste: adjunto deslocado ou trilho cortado?' },
        ],
        footer_rule: 'C passa: única vírgula normativa.',
      },
    ],
  },

  'vunesp-itatiba-pontuacao-travessao-3583375': {
    family: 'text_fragment',
    source_tec_id: '3583375',
    source_note: 'Travessão mudança interlocutor Szymborska — VUNESP Ag Pref Itatiba Trânsito 2025 tec 3583375',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba) Trânsito',
      orgao: 'Pref. Itatiba',
      ano: '2025',
    },
    instruction: 'Leia o poema a seguir para responder à questão.\n\nNo poema, os travessões indicam',
    text_fragment: VIETNA_FRAGMENT,
    options: [
      { id: 'A', text: 'a introdução de explicações.', is_correct: false },
      { id: 'B', text: 'a mudança de interlocutor.', is_correct: true },
      { id: 'C', text: 'a ênfase em algumas palavras.', is_correct: false },
      { id: 'D', text: 'a alteração no ritmo de uma frase.', is_correct: false },
      { id: 'E', text: 'o início de uma enumeração.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Travessão no diálogo',
        chip_label: 'Poema Vietnã',
        meta: slideMeta,
        items: [
          { label: 'Szymborska — Vietnã', detail: 'Diálogo entre soldado e mulher vietnamita na guerra.', icon: 'BookOpen' },
          { label: 'Pergunta – Resposta', detail: 'Cada travessão separa falante diferente.', icon: 'MessagesSquare' },
          { label: 'B — gabarito', detail: 'Mudança de interlocutor — pergunta do soldado / «Não sei» dela.', icon: 'Check' },
          { label: '≠ explicação (A)', detail: 'Travessão explicativo isola inciso; aqui é diálogo.', icon: 'Info' },
        ],
        footer_rule: 'Travessão em diálogo = mudança de quem fala.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Poema Vietnã: sequência de perguntas do soldado e respostas «Não sei» / «São».',
          'Comando: função dos travessões no poema.',
          'A: explicações — travessão pode isolar inciso, mas aqui há diálogo alternado.',
          'C: ênfase — itálico ou repetição; travessão não enfatiza palavra isolada.',
          'D: ritmo — efeito secundário; função primária é trocar falante.',
          'E: enumeração — usa vírgula ou dois-pontos, não travessão entre falas.',
          'B: mudança de interlocutor — cada «–» alterna soldado e mulher.',
          'Gabarito B.',
          'Em similares: travessão entre falas = diálogo; entre termos = inciso.',
        ],
        footer_rule: 'B = mudança de interlocutor.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRAVESSÃO',
        rows: [
          { label: 'Diálogo', value: 'pergunta – resposta — troca de falante' },
          { label: 'Poema', value: '«Mulher, como você se chama? – Não sei.»' },
          { label: '≠ enumeração', value: 'lista usa vírgula ou dois-pontos' },
          { label: 'Nesta questão', value: 'B' },
        ],
        footer_rule: 'Travessão entre falas = outro interlocutor.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir funções do travessão',
        items: [
          { label: 'A — explicação', detail: 'Travessão isola comentário.', correct: 'Inciso explicativo ≠ diálogo alternado.' },
          { label: 'C — ênfase', detail: 'Pausa dramática parece ênfase.', correct: 'Ênfase = itálico/repetição; aqui troca falante.' },
          { label: 'D — ritmo', detail: 'Poema tem ritmo marcado.', correct: 'Ritmo é efeito; função = mudança de interlocutor.' },
          { label: 'E — enumeração', detail: 'Sequência de perguntas parece lista.', correct: 'Enumeração ≠ diálogo pergunta-resposta.' },
          { label: 'Em outra banca…', detail: 'Trocam poema por teatro.', correct: 'Mesmo teste: quem fala após o travessão?' },
        ],
        footer_rule: 'B passa: travessão = mudança de interlocutor.',
      },
    ],
  },

  'fgv-sjc-pontuacao-dois-pontos-3587457': {
    family: 'conceito',
    source_tec_id: '3587457',
    source_note: 'Dois-pontos esclarecimento FGV — FGV Ass TS Pref SJC Tec Enfermagem 2025 tec 3587457',
    meta: {
      banca: 'FGV',
      prova: 'Ass TS (Pref SJC) Técnico Enfermagem',
      orgao: 'Pref. SJC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a frase a seguir em que o uso de dois-pontos (:) está empregado por preceder um esclarecimento.',
    options: [
      {
        id: 'A',
        text: 'Existem duas classes de escritores geniais: os que pensam e os que fazem pensar.',
        is_correct: false,
      },
      { id: 'B', text: 'Há dois tipos de pedestres: os rápidos e os atropelados.', is_correct: false },
      {
        id: 'C',
        text: 'Só há uma coisa pior do que ser objeto de falatórios: é não sê-lo.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Quando era jovem me diziam: "Você vai ver quando tiver 50 anos". Tenho 50 anos e ainda não vi nada.',
        is_correct: false,
      },
      { id: 'E', text: 'A obra de arte: uma interrupção do tempo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois-pontos = esclarecimento',
        chip_label: 'Pontuação',
        meta: slideMeta,
        items: [
          { label: 'Esclarecimento', detail: 'Dois-pontos introduzem explicação do que precede.', icon: 'TextQuote' },
          { label: 'C — gabarito', detail: '«falatórios: é não sê-lo» — esclarece o que é pior.', icon: 'Check' },
          { label: 'A/B — enumeração', detail: 'Dois-pontos antes de lista/tipos — função distinta.', icon: 'List' },
          { label: 'D — citação', detail: 'Dois-pontos antes de fala alheia — discurso direto.', icon: 'Quote' },
        ],
        footer_rule: 'Esclarecimento ≠ enumeração nem citação.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: dois-pontos precedendo esclarecimento (não enumeração nem citação).',
          'A: «duas classes…: os que pensam» — enumeração de tipos.',
          'B: «dois tipos de pedestres: os rápidos» — enumeração.',
          'D: «me diziam: "Você vai ver"» — antecede citação/discurso direto.',
          'E: «A obra de arte: uma interrupção» — definição/aposto, não esclarecimento de oração.',
          'C: «pior do que ser objeto de falatórios: é não sê-lo» — esclarece qual é pior.',
          'Gabarito C.',
          'Em similares: o que vem após «:»? Esclarecimento, lista ou citação?',
        ],
        footer_rule: 'C = esclarecimento após comparação.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOIS-PONTOS',
        rows: [
          { label: 'Esclarecimento', value: '«pior…: é não sê-lo» — explica a comparação' },
          { label: 'Enumeração', value: 'A/B — lista de tipos/classes' },
          { label: 'Citação', value: 'D — discurso direto após «:' },
          { label: 'Nesta questão', value: 'C' },
        ],
        footer_rule: 'Esclarecimento explica a oração anterior.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Igualar enumeração a esclarecimento',
        items: [
          { label: 'A — geniais', detail: 'Dois-pontos + lista parece esclarecer.', correct: 'Enumeração de classes — função distinta.' },
          { label: 'B — pedestres', detail: 'Estrutura paralela a C.', correct: 'Enumeração de tipos — não esclarecimento.' },
          { label: 'D — me diziam', detail: 'Dois-pontos introduzem fala.', correct: 'Citação/discurso direto — não esclarecimento.' },
          { label: 'E — obra de arte', detail: 'Definição após «:».', correct: 'Aposto/definição — FGV quer esclarecimento oracional.' },
          { label: 'Em outra banca…', detail: 'FGV costuma separar enumeração × esclarecimento.', correct: 'Mesmo teste: lista ou explica a comparação?' },
        ],
        footer_rule: 'C passa: esclarecimento da comparação.',
      },
    ],
  },

  'vunesp-osasco-pontuacao-virgula-3607149': {
    family: 'text_fragment',
    source_tec_id: '3607149',
    source_note: 'Vírgulas adjuntos deslocados alma gêmea — VUNESP ACS Pref Osasco 2025 tec 3607149',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAssinale a alternativa em que a inclusão de vírgula(s) no trecho original mantém a correção gramatical e o sentido original do texto.',
    text_fragment: ALMA_GEMEA_FRAGMENT,
    options: [
      {
        id: 'A',
        text: 'Se fôssemos emparelhados aleatoriamente, 90% de nossas almas gêmeas, estariam mortas há muito tempo. (1º parágrafo)',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Um argumento bem simples, demonstra que não devemos nos limitar aos seres humanos do passado… (2º parágrafo)',
        is_correct: false,
      },
      {
        id: 'C',
        text: '… se nossa alma gêmea pode estar no passado remoto, então, também pode ser possível, encontrar almas gêmeas no futuro distante. (2º parágrafo)',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'O número de estranhos, com os quais estabelecemos contato visual por dia varia, de quase zero… (3º parágrafo)',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Eu sou bastante introvertido, então, no meu caso, a estimativa é bem generosa. (3º parágrafo)',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgulas corretas no texto',
        chip_label: 'Adjuntos deslocados',
        meta: slideMeta,
        items: [
          { label: 'Alma gêmea', detail: 'Randall Munroe: probabilidade de encontrar o par perfeito.', icon: 'Heart' },
          { label: 'E — gabarito', detail: '«introvertido, então, no meu caso,» — adjuntos/oração intercalada.', icon: 'Check' },
          { label: 'então, no meu caso', detail: 'Conectivo + adjunto deslocado — vírgulas de isolamento.', icon: 'ArrowRight' },
          { label: 'Erros (A–D)', detail: 'Sujeito|verbo · verbo|predicado · vírgulas excessivas.', icon: 'XCircle' },
        ],
        footer_rule: 'Adjuntos deslocados e intercalados → vírgulas corretas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Munroe: alma gêmea aleatória seria pesadelo — baixíssima chance de cruzar olhares.',
          'Comando: inclusão de vírgula(s) mantém correção e sentido.',
          'A: «almas gêmeas, estariam» — sujeito|verbo cortado. Incorreto.',
          'B: «argumento bem simples, demonstra» — sujeito|verbo cortado. Incorreto.',
          'C: vírgulas excessivas («então, também» · «possível, encontrar»). Incorreto.',
          'D: «estranhos, com os quais» e «varia, de quase zero» — cortes indevidos. Incorreto.',
          'E: «introvertido, então, no meu caso, a estimativa» — intercalados bem isolados.',
          'Gabarito E.',
          'Em similares: o que a vírgula isola? Adjunto/oração intercalada = ok; sujeito|verbo = erro.',
        ],
        footer_rule: 'E = adjuntos deslocados corretamente pontuados.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTOS DESLOCADOS',
        rows: [
          { label: 'Correto', value: '«introvertido, então, no meu caso, a estimativa»' },
          { label: 'Proibido', value: 'gêmeas, estariam · argumento, demonstra' },
          { label: 'Teste', value: 'o que a vírgula isola? trilho sujeito|verbo livre?' },
          { label: 'Nesta questão', value: 'E' },
        ],
        footer_rule: 'Intercalados sim → vírgulas; sujeito|verbo → sem vírgula.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgula entre sujeito e verbo',
        items: [
          { label: 'A — gêmeas, estariam', detail: 'Pausa oral após sujeito longo.', correct: 'Sujeito|verbo: gêmeas estariam — sem vírgula.' },
          { label: 'B — argumento, demonstra', detail: 'Adjunto antes do verbo confunde.', correct: 'Sujeito|verbo: argumento demonstra — sem vírgula.' },
          { label: 'C — então, também', detail: 'Vírgulas parecem marcar pausa.', correct: 'Vírgulas excessivas quebram a oração.' },
          { label: 'D — estranhos, com', detail: 'Relativa colada ao antecedente.', correct: 'Sem vírgula: estranhos com os quais…' },
          { label: 'Em outra banca…', detail: 'Trocam «introvertido» por «tímido».', correct: 'Mesmo teste: adjunto intercalado ou trilho cortado?' },
        ],
        footer_rule: 'E passa: vírgulas em adjuntos deslocados.',
      },
    ],
  },

  'facet-bom-jardim-pontuacao-incorreta-3614676': {
    family: 'certo_errado',
    source_tec_id: '3614676',
    source_note: 'INCORRETA porém sem vírgula — FACET AAd Pref Bom Jardim PE 2025 tec 3614676',
    meta: {
      banca: 'FACET',
      prova: 'AAd (Pref Bom Jardim PE)',
      orgao: 'Pref. Bom Jardim',
      ano: '2025',
    },
    instruction: 'Marque a alternativa incorreta quanto ao emprego da vírgula, de acordo com as normas gramaticais.',
    options: [
      { id: 'A', text: 'Objetivos, conteúdo, método e recursos didáticos compõem um plano.', is_correct: false },
      { id: 'B', text: 'Ana, atenda a campainha!', is_correct: false },
      { id: 'C', text: 'João, professor do Ensino Médio, está de licença.', is_correct: false },
      { id: 'D', text: 'Sim, estamos satisfeitos com os resultados.', is_correct: false },
      { id: 'E', text: 'Vi, porém as opções que eu tinha.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA: porém',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Quatro frases corretas; uma incorreta.', icon: 'Search' },
          { label: 'A — enumeração', detail: 'Vírgulas separam termos coordenados. Correto.', icon: 'Check' },
          { label: 'B — vocativo', detail: '«Ana,» chama a interlocutora. Correto.', icon: 'Check' },
          { label: 'E — gabarito', detail: '«Vi, porém as opções» — falta vírgula após «porém».', icon: 'XCircle' },
        ],
        footer_rule: 'INCORRETA: conectivo «porém» exige vírgula após.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Corte letra a letra',
        meta: slideMeta,
        steps: [
          'Comando: alternativa incorreta quanto à vírgula.',
          'A: «Objetivos, conteúdo, método e recursos» — enumeração. Correto.',
          'B: «Ana, atenda» — vocativo isolado. Correto.',
          'C: «João, professor do Ensino Médio,» — aposto explicativo. Correto.',
          'D: «Sim, estamos» — advérbio de afirmação deslocado. Correto.',
          'E: «Vi, porém as opções» — conectivo adversativo «porém» sem vírgula após.',
          'Correto: «Vi, porém, as opções que eu tinha.»',
          'Gabarito E — única incorreta.',
          'Em similares: conectivo adversativo → vírgula antes e depois quando intercalado.',
        ],
        footer_rule: 'E = INCORRETA — falta vírgula após «porém».',
      },
      {
        type: 'golden_rule',
        slide_title: 'Trilho de bolso',
        meta: slideMeta,
        content: 'CONCESSIVA / ADVERSATIVA',
        rows: [
          { label: 'Porém', value: '«Vi, porém, as opções» — vírgula após o conectivo' },
          { label: 'Pode', value: 'enumeração · vocativo · aposto · Sim, estamos' },
          { label: 'Pergunta-teste', value: 'O conectivo está isolado por vírgulas?' },
          { label: 'Nesta questão', value: 'E — incorreta' },
        ],
        footer_rule: 'Porém intercalado → vírgula antes e depois.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o aluno cai',
        meta: slideMeta,
        content: 'Marcar frase correta no EXCETO',
        items: [
          {
            label: 'A — enumeração',
            detail: 'Muitas vírgulas parecem excesso.',
            correct: 'Enumeração de termos coordenados — correto.',
          },
          {
            label: 'B — Ana',
            detail: 'Vocativo no início assusta.',
            correct: 'Vocativo «Ana,» isolado — correto.',
          },
          {
            label: 'C — aposto',
            detail: 'Duas vírgulas confundem.',
            correct: 'Aposto explicativo «professor do Ensino Médio» — correto.',
          },
          {
            label: 'D — Sim',
            detail: 'Vírgula após advérbio parece opcional.',
            correct: 'Advérbio deslocado «Sim,» — correto.',
          },
          {
            label: 'E — porém',
            detail: 'Vírgula antes de «porém» parece suficiente.',
            correct: 'Falta vírgula após «porém»: Vi, porém, as opções.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «porém» por «contudo».',
            correct: 'Mesmo teste: conectivo isolado por vírgulas?',
          },
        ],
        footer_rule: 'E passa: única frase com pontuação errada.',
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
