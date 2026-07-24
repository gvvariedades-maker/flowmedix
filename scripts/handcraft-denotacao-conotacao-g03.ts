#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — denotacao-conotacao-g03 (8 slugs · Denotação/conotação · lote 3).
 *
 *   npx tsx scripts/handcraft-denotacao-conotacao-g03.ts
 *   npm run audit:questao-readiness -- --lote=denotacao-conotacao-g03 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=denotacao-conotacao-g03 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'denotacao-conotacao-g03';
const SUBTOPICO = 'Denotação, conotação e figuras de linguagem';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_denotacao_conotacao';
const REVIEWED = '2026-07-24';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-denotacao-literal-figurado.json';
const GOLDEN_TIRINHA = 'examples/questao-premium-avancasp-portugues-denotacao-tirinha-drogas.json';
const TIRINHA_SLUG = 'avancasp-acd-denotacao-leia-o-texto-a-seguir-para-responder-3554834';
const TIRINHA_GUIDELINE_SNAPSHOT = `Elias TE-simples — tirinha · âncoras ${GOLDEN_REFERENCE.split('/').pop()?.replace('.json', '')} + ${GOLDEN_TIRINHA.split('/').pop()?.replace('.json', '')}`;

const DENOTACAO_SOURCE = {
  id: 'pt-denotacao-conotacao-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Denotação, conotação e figuras de linguagem',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'denotação',
    'conotação',
    'sentido literal',
    'sentido figurado',
    'metáfora',
    'metonímia',
    'eufemismo',
    'ironia',
    'pergunta-teste',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'text_fragment';

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
  const guideline_snapshot =
    slug === TIRINHA_SLUG
      ? TIRINHA_GUIDELINE_SNAPSHOT
      : `Elias TE-simples — pergunta «Literal ou figurado?» · lente dicionário × efeito (denotacaoConotacao.ts) · âncora → ${GOLDEN_REFERENCE}`;

  return {
    ...spec.meta,
    topico: TOPICO,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:denotacao-conotacao-g03',
      guideline_snapshot,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      DENOTACAO_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt-subject-focus'],
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
  [TIRINHA_SLUG]: {
    family: 'text_fragment',
    source_tec_id: '3554834',
    source_note:
      'Tirinha Armandinho «drogas» polissemia — AVANÇASP ACD Pref Vinhedo 2025 tec 3554834',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACD (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nA palavra «drogas», na tirinha, parece apresentar sentido próprio (denotativo) na leitura do primeiro quadrinho. No entanto, quando o leitor chega ao último quadrinho, percebe que o termo estava sendo usado em sentido figurado (conotativo). Assinale a alternativa correta a respeito de ambos os sentidos da palavra na tirinha:',
    figure_policy: 'transcribed',
    text_fragment:
      '<p><strong>Tirinha Armandinho</strong> (Alexandre Beck) — leitura em dois tempos:</p>' +
      '<p><em>1º quadrinho:</em> a palavra «drogas» soa como produto alucinógeno / dependência química (sentido próprio aparente).</p>' +
      '<p><em>Último quadrinho:</em> o contexto revela que «drogas» era metáfora — algo que atrai, apaixona e intoxica o espírito (sentido figurado / conotativo).</p>' +
      '<p>Humor = troca de lente entre o primeiro e o último quadro.</p>',
    options: [
      {
        id: 'A',
        text: 'Sentido próprio: conjunto dos diversos elementos estruturados. Sentido figurado: elemento que entra numa composição, num preparado ou numa mistura.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Sentido próprio: qualquer ato, produto ou objeto de pouco valor, insignificante. Sentido figurado: bebida ou comida de má qualidade e que pode fazer mal.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Sentido próprio: unidade ou item componente de um todo linguístico. Sentido figurado: qualquer uma das quatro substâncias (água, ar, terra e fogo) consideradas na ciência antiga.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Sentido próprio: qualquer produto alucinógeno que leve à dependência química. Sentido figurado: algo que atraia, apaixone, intoxique o espírito.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Sentido próprio: caráter do que é sólido, firme; força, robustez, vigor. Sentido figurado: qualquer espécie de matéria.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tirinha: duas lentes',
        chip_label: 'Quadrinho × efeito',
        meta: slideMeta,
        items: [
          { label: '1º quadrinho', detail: '«Drogas» parece denotativo — alucinógeno, dependência química.', icon: 'BookOpen' },
          { label: 'Último quadrinho', detail: 'Contexto vira a chave — atração / paixão / intoxicação do espírito.', icon: 'Sparkles' },
          { label: 'Pergunta-teste', detail: 'Literal no 1º? Figurado no último? Qual par de sentidos a banca pede?', icon: 'Eye' },
          { label: 'Polissemia', detail: 'Mesma palavra, duas leituras — humor da tirinha Armandinho.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Marcar glossário genérico (elementos, matéria) sem o par drogas.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Na tirinha: leia o arco 1º → último antes de abrir o dicionário.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: '1º quadro → último → letras',
        chip_label: 'Um toque = um corte',
        meta: slideMeta,
        steps: [
          'Comando: ambos os sentidos de «drogas» na tirinha — próprio no 1º + figurado no último.',
          'Próprio esperado: produto alucinógeno / dependência química (leitura inicial).',
          'Figurado esperado: algo que atrai, apaixona, intoxica o espírito (revelação final).',
          'A «elementos / mistura»: glossário de composição — não «drogas» — eliminar.',
          'B «pouco valor / bebida ruim»: sentidos errados — eliminar.',
          'C «item linguístico / quatro elementos»: outro campo semântico — eliminar.',
          'E «sólido-firme / matéria»: não casa com alucinógeno nem espírito — eliminar.',
          'D: próprio = alucinógeno/dependência; figurado = intoxique o espírito — casa com o arco da tirinha.',
          'Gabarito D.',
          'Em similares: em tirinha, teste a palavra no 1º quadro e de novo no último — a banca cobra o par.',
        ],
        footer_rule: 'Tap = mudar de lente entre quadrinhos.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        chip_label: 'Tabela portátil',
        meta: slideMeta,
        content: 'TIRINHA — DUAS LENTES',
        rows: [
          { label: 'Denotação', value: '1º quadro — sentido de dicionário (alucinógeno).' },
          { label: 'Conotação', value: 'Último quadro — carga afetiva (espírito intoxicado).' },
          { label: 'Método', value: 'Ler arco completo antes de escolher o par de glossas.' },
          { label: 'Pegadinha', value: 'Definições genéricas que não citam «drogas».' },
          { label: 'Nesta questão', value: 'D — alucinógeno + intoxique o espírito.' },
        ],
        footer_rule: 'Humor da tirinha = troca de lente, não troca de palavra.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Glossários que não são «drogas»',
        chip_label: 'Compare',
        meta: slideMeta,
        content: 'Cada letra erra o par denotativo × conotativo',
        items: [
          { label: 'A — elementos / mistura', detail: 'Define composição química genérica, não a palavra da tirinha.', correct: 'Sentido literal de «drogas» na tirinha = alucinógeno — não «elementos estruturados».' },
          { label: 'B — pouco valor / bebida ruim', detail: 'Troca o campo semântico (insignificância / comida).', correct: 'Sentido figurado na tirinha = intoxicar o espírito — não bebida de má qualidade.' },
          { label: 'C — item linguístico / 4 elementos', detail: 'Confunde morfologia / ciência antiga com «drogas».', correct: 'Par certo: dependência química × paixão que intoxica — não água-ar-terra-fogo.' },
          { label: 'E — sólido / matéria', detail: 'Fala de firmeza e matéria — sem o arco da tirinha.', correct: 'Sentido literal: alucinógeno; figurado: apaixone o espírito — não «espécie de matéria».' },
          {
            label: 'Transferência',
            detail: 'Classifique: na tirinha, «Ele é viciado em séries» (último quadro).',
            correct: 'Sentido figurado: «viciado» transfere dependência química → hábito que prende — não droga ilícita.',
          },
        ],
        footer_rule: 'D sobrou: alucinógeno + espírito intoxicado.',
      },
    ],
  },

  'vunesp-tec-h-denotacao-leia-a-tira-a-seguir-para-responder-3572890': {
    family: 'text_fragment',
    source_tec_id: '3572890',
    source_note: 'Calvin «dobrar» figurado — VUNESP Tec HC-FAMEMA 2025 tec 3572890',
    meta: {
      banca: 'VUNESP',
      prova: 'Tec (HC-FAMEMA)',
      orgao: 'HC-FAMEMA',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira a seguir para responder à questão abaixo.\n\n(Bill Watterson. O melhor de Calvin. Disponível em: www.estadao.com.br, 16.03.2025)\n\nNa frase «Eles não conseguem me dobrar!» (2º quadro), o garoto Calvin emprega a palavra destacada em sentido',
    figure_policy: 'transcribed',
    text_fragment:
      '<p><strong>Calvin e Haroldo — Bill Watterson (adaptado)</strong></p>' +
      '<p><strong>1º quadro:</strong> Calvin enfrenta um tigre (Haroldo) em discussão acalorada.</p>' +
      '<p><strong>2º quadro:</strong> Calvin exclama: «Eles não conseguem me <strong>dobrar</strong>!» — referindo-se a quem tenta mudar sua postura ou convicção.</p>' +
      '<p><strong>3º quadro:</strong> Haroldo reage à bravata; o humor explora o duplo sentido de «dobrar» (flexionar corpo × ceder).</p>' +
      '<p>No 2º quadro, «dobrar» não é dobrar papel nem músculo — é não ceder de propósito.</p>',
    options: [
      { id: 'A', text: 'figurado, para dar ao tigre uma noção de sua submissão.', is_correct: false },
      { id: 'B', text: 'figurado, para dizer que não vai ceder de seu propósito.', is_correct: true },
      { id: 'C', text: 'próprio, para se referir à sua paciência acima do normal.', is_correct: false },
      { id: 'D', text: 'próprio, para indicar que só ele comanda seus músculos.', is_correct: false },
      { id: 'E', text: 'próprio, para mostrar que a sua serenidade é a que prevalece.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dobrar: corpo ou vontade?',
        chip_label: 'Polissemia',
        meta: slideMeta,
        items: [
          { label: 'Calvin', detail: 'Bravata contra Haroldo no 2º quadro da tira.', icon: 'Image' },
          { label: 'Dobrar', detail: 'Não ceder de propósito — sentido figurado.', icon: 'Shield' },
          { label: 'Literal', detail: 'Flexionar corpo, papel ou músculo — eliminado.', icon: 'Activity' },
          { label: 'Pergunta-teste', detail: 'Dobrar braço ou dobrar convicção?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Confundir submissão física com firmeza de caráter.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Na tira: «dobrar» = não ceder.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Calvin: 2º quadro — «Eles não conseguem me dobrar!»',
          'Comando: palavra «dobrar» — figurado ou próprio?',
          'A figurado + submissão ao tigre: sentido errado — não é humilhação — eliminar.',
          'B figurado + não ceder propósito: firmeza de vontade — alinha com a fala.',
          'C próprio + paciência: leitura literal inadequada — eliminar.',
          'D próprio + músculos: dobra física — não é o eixo da bravata — eliminar.',
          'E próprio + serenidade: calma literal — eliminar.',
          'Gabarito B.',
          'Em similares: verbo de ação física + contexto de resistência = figurado.',
        ],
        footer_rule: 'Tap = separar corpo de vontade.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOBRAR — LENTE',
        rows: [
          { label: 'Próprio', value: 'Flexionar, dobrar papel, curvar o corpo.' },
          { label: 'Figurado', value: 'Ceder, submeter a vontade — resistência.' },
          { label: 'Calvin', value: '«Não conseguem me dobrar» = não mudo de ideia.' },
          { label: 'Nesta questão', value: 'B — figurado: não ceder de propósito.' },
        ],
        footer_rule: 'Bravata de Calvin ≠ ginástica.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Leituras erradas de «dobrar»',
        items: [
          { label: 'A — submissão', detail: 'Diz que Calvin se submete ao tigre.', correct: 'Figurado sim, mas sentido errado — ele afirma resistência, não submissão.' },
          { label: 'C — paciência', detail: 'Trata «dobrar» como calma literal.', correct: 'Sentido próprio inadequado — não é paciência acima do normal.' },
          { label: 'D — músculos', detail: 'Dobra física do corpo.', correct: 'Sentido próprio — não é o foco da bravata de Calvin.' },
          { label: 'E — serenidade', detail: 'Calma que prevalece.', correct: 'Sentido próprio — Calvin está em confronto, não em serenidade.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Ninguém vai me dobrar nessa negociação.»',
            correct: 'Sentido figurado: «dobrar» transfere flexão física → ceder na negociação.',
          },
        ],
        footer_rule: 'B: dobrar = não ceder.',
      },
    ],
  },

  'vunesp-ag-pr-denotacao-leia-o-texto-a-seguir-para-responder-3583300': {
    family: 'text_fragment',
    source_tec_id: '3583300',
    source_note: 'CDH crianças indígenas «frear» figurado — VUNESP Ag Pref Itatiba 2025 tec 3583300',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAssinale a alternativa em que a palavra destacada pode ser substituída, mantendo-se o sentido do trecho, pela que está entre colchetes, empregada em sentido figurado.',
    text_fragment:
      '<p>A <strong>Comissão de Direitos Humanos (CDH)</strong> debateu o fortalecimento de políticas públicas para a proteção de crianças e adolescentes indígenas. Participantes da audiência pública defenderam, entre outras medidas, a ampliação do acesso à saúde, o combate à violência, o apoio para gestantes, a garantia de segurança alimentar e a preservação dos territórios.</p>' +
      '<p>No debate, o indígena yanomâmi Renato Sanumá falou sobre as dificuldades de combater o abandono e o abuso sexual infantil, além dos desafios de tratamento de crianças com deficiências e problemas neurológicos nas aldeias. Segundo ele, não há como proteger efetivamente as crianças sem medidas de apoio.</p>' +
      '<p>Representante da Secretaria de Saúde Indígena, Vanessa Quaresma afirmou que a meta do governo federal é reduzir a mortalidade infantil em 30% até 2027. «Nosso grande desafio é <strong>impedir</strong> a perda de crianças nessa faixa etária menor de cinco anos», destacou Vanessa. Ela ressaltou que as dificuldades geográficas são barreiras para a acessibilidade dos serviços de saúde nos territórios indígenas.</p>' +
      '<p>(Agência Senado. Debatedores defendem fortalecimento de políticas públicas para crianças indígenas. 23.05.2024 — adaptado)</p>',
    options: [
      {
        id: 'A',
        text: 'Participantes da audiência pública defenderam, entre outras medidas [providências], a ampliação do acesso à saúde… (1º parágrafo)',
        is_correct: false,
      },
      {
        id: 'B',
        text: '… além dos desafios de tratamento de crianças com deficiências e problemas [distúrbios] neurológicos nas aldeias… (2º parágrafo)',
        is_correct: false,
      },
      {
        id: 'C',
        text: '… Vanessa Quaresma afirmou que a meta do governo federal é reduzir [diminuir] a mortalidade infantil em 30%… (3º parágrafo)',
        is_correct: false,
      },
      {
        id: 'D',
        text: '«Nosso grande desafio é impedir [frear] a perda de crianças nessa faixa etária menor de cinco anos… (4º parágrafo)',
        is_correct: true,
      },
      {
        id: 'E',
        text: '… integrar práticas de cuidados da medicina ocidental com as práticas [técnicas] da medicina indígena. (5º parágrafo)',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Substituição figurada',
        chip_label: 'Colchetes',
        meta: slideMeta,
        items: [
          { label: 'CDH debateu', detail: 'Fortalecimento de políticas públicas — crianças indígenas.', icon: 'Users' },
          { label: 'Audiência', detail: 'Participantes defenderam saúde, território, violência.', icon: 'Mic' },
          { label: 'Impedir', detail: 'Evitar perda de crianças — pode receber «frear» figurado.', icon: 'Shield' },
          { label: 'Frear', detail: 'Parar movimento — metáfora de freio na perda.', icon: 'Octagon' },
          { label: 'Literal A–C', detail: 'Providências, distúrbios, diminuir — sinônimos próprios.', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: 'Marcar sinônimo literal quando o colchete é figurado.', icon: 'AlertTriangle' },
        ],
        footer_rule: '«Frear» perda = figurado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto CDH: debateu fortalecimento de políticas — participantes da audiência, crianças indígenas.',
          'Sanumá, Vanessa Quaresma, mortalidade infantil.',
          'Comando: substituição por colchete em sentido figurado.',
          'A [providências]: sinônimo direto de medidas — literal — eliminar.',
          'B [distúrbios]: equivalente a problemas neurológicos — literal — eliminar.',
          'C [diminuir]: sinônimo de reduzir — literal — eliminar.',
          'D [frear]: «impedir perda» — frear transfere freio de veículo — figurado.',
          'E [técnicas]: equivalente a práticas — literal — eliminar.',
          'Gabarito D.',
          'Em similares: verbo de trânsito + abstração = figura.',
        ],
        footer_rule: 'Frear perda ≠ freio de carro literal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COLCHETE FIGURADO',
        rows: [
          { label: 'Literal', value: 'Sinônimo direto — mesmo campo semântico.' },
          { label: 'Figurado', value: '«Frear» perda = parar o dano (metáfora).' },
          { label: 'CDH', value: 'Impedir perda de crianças indígenas.' },
          { label: 'Nesta questão', value: 'D — impedir [frear] em sentido figurado.' },
        ],
        footer_rule: 'Perda não tem pedal de freio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Substituições literais',
        items: [
          { label: 'A — providências', detail: 'Sinônimo de medidas na audiência.', correct: 'Sentido literal: equivalência direta — não figurado.' },
          { label: 'B — distúrbios', detail: 'Equivalente a problemas neurológicos.', correct: 'Sentido literal: sinônimo técnico.' },
          { label: 'C — diminuir', detail: 'Sinônimo de reduzir mortalidade.', correct: 'Sentido literal: mesmo sentido numérico.' },
          { label: 'E — técnicas', detail: 'Equivalente a práticas de medicina.', correct: 'Sentido literal: sinônimo de métodos.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Precisamos frear a evasão escolar.»',
            correct: 'Sentido figurado: «frear» transfere freio — não objeto mecânico.',
          },
        ],
        footer_rule: 'D: frear figurado.',
      },
    ],
  },

  'vunesp-ag-pr-denotacao-leia-o-texto-a-seguir-para-responder-3583381': {
    family: 'text_fragment',
    source_tec_id: '3583381',
    source_note: 'Minayo «banhado» de amor figurado — VUNESP Ag Pref Itatiba Trânsito 2025 tec 3583381',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nConsidere o trecho a seguir:\n\n«E, mesmo quando seu trabalho é banhado de amor e reconhecimento, ela se empobrece do ponto de vista econômico e social e passa a ter, desde então, uma existência restrita e confinada, unicamente dedicada ao familiar em situação de dependência.» (2º parágrafo)\n\nFoi empregada em sentido figurado a palavra',
    text_fragment:
      '<p><strong>Cuidar de quem cuida de idosos dependentes</strong> (Maria Cecília de Souza Minayo — adaptado)</p>' +
      '<p>Cuidar decorre das expectativas sociais sobre o conceito cultural de família e continua a ser parte das obrigações femininas. Costuma acontecer que, nas famílias, uma mulher é escolhida como cuidadora.</p>' +
      '<p>E, mesmo quando seu trabalho é <strong>banhado</strong> de amor e reconhecimento, ela se empobrece do ponto de vista econômico e social e passa a ter uma existência restrita e confinada, unicamente dedicada ao familiar em situação de dependência.</p>' +
      '<p>As que são apoiadas por algum tipo de renda consideram esse aporte insuficiente. Cuidar sempre afeta a vida da cuidadora — com pior saúde física, depressão, ansiedade e sensação de sobrecarga.</p>',
    options: [
      { id: 'A', text: '«trabalho».', is_correct: false },
      { id: 'B', text: '«banhado».', is_correct: true },
      { id: 'C', text: '«econômico».', is_correct: false },
      { id: 'D', text: '«existência».', is_correct: false },
      { id: 'E', text: '«dependência».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Banhado de amor',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Minayo', detail: 'Cuidadoras de idosos dependentes — sobrecarga feminina.', icon: 'Heart' },
          { label: 'Banhado', detail: 'Coberto de amor — metáfora do banho/immersão.', icon: 'Droplets' },
          { label: 'Trabalho A', detail: 'Atividade de cuidado — uso literal possível.', icon: 'Briefcase' },
          { label: 'Dependência E', detail: 'Estado do familiar — termo técnico literal.', icon: 'User' },
          { label: 'Pegadinha', detail: 'Marcar substantivo literal em vez do verbo figurado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Banhado = imagem, não banho real.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Minayo: cuidadoras de idosos, empobrecimento, sobrecarga.',
          'Comando: palavra em sentido figurado no trecho destacado.',
          'A «trabalho»: atividade de cuidado — literal — eliminar.',
          'B «banhado»: coberto de amor como líquido — metáfora — figurado.',
          'C «econômico»: adjetivo de empobrecimento — literal — eliminar.',
          'D «existência»: vida restrita — literal — eliminar.',
          'E «dependência»: estado do familiar — literal — eliminar.',
          'Gabarito B.',
          'Em similares: verbo de líquido + abstração = figura.',
        ],
        footer_rule: 'Banhado de amor ≠ banho físico.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'BANHADO — LENTE',
        rows: [
          { label: 'Literal', value: 'Banho físico com água.' },
          { label: 'Figurado', value: 'Coberto, envolvido de amor — metáfora.' },
          { label: 'Minayo', value: 'Cuidadora com reconhecimento afetivo, mas empobrecida.' },
          { label: 'Nesta questão', value: 'B — «banhado» figurado.' },
        ],
        footer_rule: 'Amor não é água de banheira.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Termos literais no trecho',
        items: [
          { label: 'A — trabalho', detail: 'Atividade de cuidado da cuidadora.', correct: 'Sentido literal: trabalho como função social.' },
          { label: 'C — econômico', detail: 'Empobrecimento material da cuidadora.', correct: 'Sentido literal: aspecto financeiro objetivo.' },
          { label: 'D — existência', detail: 'Vida restrita e confinada.', correct: 'Sentido literal: modo de viver descrito.' },
          { label: 'E — dependência', detail: 'Estado do familiar idoso.', correct: 'Sentido literal: condição de dependência.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O discurso foi banhado em esperança.»',
            correct: 'Sentido figurado: «banhado» transfere imersão em líquido — não banho real.',
          },
        ],
        footer_rule: 'B: banhado figurado.',
      },
    ],
  },

  'vunesp-acs-p-denotacao-leia-o-texto-a-seguir-para-responder-3607113': {
    family: 'text_fragment',
    source_tec_id: '3607113',
    source_note: 'Munroe alma gêmea «pesadelo» figurado — VUNESP ACS Pref Osasco 2025 tec 3607113',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAssinale a alternativa em que a palavra destacada está empregada em sentido figurado.',
    text_fragment:
      '<p><strong>E se?</strong> — Randall Munroe (adaptado)</p>' +
      '<p>E se todo mundo realmente tivesse uma alma gêmea, que fosse uma pessoa aleatória em qualquer lugar do mundo? <strong>Resposta: seria um pesadelo.</strong> Vamos supor que sua alma gêmea fosse determinada ao nascer.</p>' +
      '<p>Você não sabe nada sobre a pessoa, quem é ou onde está, mas — como diz o clichê — vocês se reconhecerão num cruzar de olhares. Será que sua alma gêmea ainda estaria viva? Uns 100 bilhões de humanos já existiram, mas só 7 bilhões estão vivos no momento.</p>' +
      '<p>Se fôssemos emparelhados aleatoriamente, 90% de nossas almas gêmeas estariam mortas há muito tempo. Um argumento simples mostra que não devemos nos limitar aos seres humanos do passado — também há incontáveis seres no futuro.</p>' +
      '<p>Considerando faixa etária, a maioria da humanidade teria cerca de meio bilhão de combinações possíveis. As chances de encontrar o par perfeito seriam absurdamente pequenas.</p>',
    options: [
      {
        id: 'A',
        text: 'Resposta: seria um pesadelo. (abertura do texto — palavra destacada «pesadelo»)',
        is_correct: true,
      },
      {
        id: 'B',
        text: '… se nossa alma gêmea pode estar no passado remoto, então também pode ser possível encontrar almas gêmeas no futuro distante. (2º parágrafo)',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Então vamos supor que vocês vivam na mesma época. Além disso, ela está na mesma faixa etária que você. (3º parágrafo)',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Considerando a restrição de faixa etária, a maioria da humanidade teria uma reserva de aproximadamente meio bilhão de combinações possíveis. (4º parágrafo)',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'O número de estranhos com os quais estabelecemos contato visual por dia varia de quase zero a muitos milhares. (5º parágrafo)',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alma gêmea: pesadelo?',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Resposta: pesadelo', detail: 'Realmente ter alma gêmea aleatória seria terrível.', icon: 'Moon' },
          { label: 'Munroe', detail: 'E se? — emparelhamento aleatório no mundo.', icon: 'Heart' },
          { label: 'Determinada', detail: 'Alma gêmea fixada ao nascer — hipótese do texto.', icon: 'Users' },
          { label: 'Humanos', detail: '100 bilhões existiram — estatística do argumento.', icon: 'BarChart' },
          { label: 'Pegadinha', detail: 'Confundir dado estatístico com metáfora de abertura.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pesadelo aqui = catástrofe, não sonho.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Munroe: realmente ter alma gêmea aleatória em qualquer lugar? Resposta: pesadelo.',
          'Comando: palavra destacada em sentido figurado.',
          'Alma gêmea determinada ao nascer — humanos que existiram vs vivos.',
          'Abertura «seria um pesadelo»: situação terrível — metáfora do sonho ruim — figurado.',
          'B futuro distante: argumento lógico — literal — eliminar.',
          'C mesma época/faixa etária: condição hipotética — literal — eliminar.',
          'D meio bilhão de combinações: dado estatístico — literal — eliminar.',
          'E contato visual diário: descrição factual — literal — eliminar.',
          'Gabarito A.',
          'Em similares: abertura impactante costuma trazer metáfora central.',
        ],
        footer_rule: 'Pesadelo = figura de avaliação negativa.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PESADELO — LENTE',
        rows: [
          { label: 'Literal', value: 'Sonho desagradável durante o sono.' },
          { label: 'Figurado', value: 'Situação terrível, catastrófica — metáfora.' },
          { label: 'Munroe', value: 'Alma gêmea aleatória = «pesadelo» estatístico.' },
          { label: 'Nesta questão', value: 'A — «pesadelo» figurado na abertura.' },
        ],
        footer_rule: 'Autor não dormiu — avaliou a hipótese.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trechos literais',
        items: [
          { label: 'B — futuro distante', detail: 'Extensão do argumento temporal.', correct: 'Sentido literal: hipótese lógica sobre futuro.' },
          { label: 'C — mesma época', detail: 'Restrição de faixa etária.', correct: 'Sentido literal: condição do raciocínio.' },
          { label: 'D — meio bilhão', detail: 'Reserva de combinações possíveis.', correct: 'Sentido literal: estatística objetiva.' },
          { label: 'E — contato visual', detail: 'Variação de estranhos por dia.', correct: 'Sentido literal: descrição de comportamento.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Organizar esse evento foi um pesadelo.»',
            correct: 'Sentido figurado: «pesadelo» transfere sonho ruim → experiência terrível.',
          },
        ],
        footer_rule: 'A: pesadelo figurado.',
      },
    ],
  },

  'vunesp-ade-g-denotacao-leia-o-texto-para-responder-a-questa-3607397': {
    family: 'text_fragment',
    source_tec_id: '3607397',
    source_note: 'Mobilidade social «condenados» figurado — VUNESP ADE Guararapes 2025 tec 3607397',
    meta: {
      banca: 'VUNESP',
      prova: 'ADE (Guararapes)',
      orgao: 'Guararapes',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão abaixo.\n\nO termo destacado está empregado em sentido figurado em:',
    text_fragment:
      '<p><strong>Crianças condenadas à estagnação</strong> (Opinião — adaptado)</p>' +
      '<p>A probabilidade de um brasileiro nascer pobre e morrer pobre é alta. Menos de 2% das crianças cujos pais estão entre os 50% mais pobres alcançarão a renda dos 10% mais ricos. O Atlas da Mobilidade Social do IMDS traça cenário desolador: a imobilidade social parece ser a regra.</p>' +
      '<p>A mobilidade é ainda difícil para crianças do sexo feminino, negras e do Norte. Nos Estados dessa região, quase 80% das crianças pobres permanecerão na mesma situação na vida adulta.</p>' +
      '<p>O Brasil não alcançou a meta de colocar 50% das crianças de zero a 3 anos na creche — só cerca de 40% matriculadas. Os indicadores de educação apontam desempenho baixo.</p>' +
      '<p>Se nada mudar, o País e milhões dos seus cidadãos estarão <strong>condenados</strong> a futuro algum.</p>',
    options: [
      {
        id: 'A',
        text: 'O estudo sobre mobilidade intergeracional traça um cenário bastante desolador... (2º parágrafo)',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Tudo isso indica que o Brasil desonrou compromissos firmados com o seu povo... (4º parágrafo)',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'E é essa mesma Constituição que diz aos brasileiros que a criança é uma prioridade absoluta. (4º parágrafo)',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Os indicadores de educação apontam que a qualidade do ensino brasileiro é baixa... (6º parágrafo)',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Se nada mudar, o País e milhões dos seus cidadãos estarão condenados a futuro algum. (7º parágrafo)',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Condenados ao futuro',
        chip_label: 'Metáfora jurídica',
        meta: slideMeta,
        items: [
          { label: 'Probabilidade', detail: 'Brasileiro nascer pobre e morrer pobre — alta.', icon: 'TrendingDown' },
          { label: 'Atlas IMDS', detail: 'Mobilidade social intergeracional — cenário desolador.', icon: 'BarChart' },
          { label: 'Condenados', detail: 'Destinados à estagnação — metáfora do veredicto.', icon: 'Gavel' },
          { label: 'Crianças', detail: 'Menos de 2% saem da pobreza — dado do estudo.', icon: 'Users' },
          { label: 'Pegadinha', detail: 'Confundir linguagem jurídica real com metáfora.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Condenados = sem perspectiva, não tribunal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: probabilidade de brasileiro nascer pobre e morrer pobre — Atlas IMDS.',
          'Mobilidade social, crianças, creche, educação.',
          'Comando: termo destacado em sentido figurado.',
          'A «desolador»: adjetivo de cenário — literal — eliminar.',
          'B «desonrou compromissos»: metáfora possível, mas não é o gabarito pedido — eliminar.',
          'C «prioridade absoluta»: norma constitucional — literal — eliminar.',
          'D «qualidade baixa»: diagnóstico educacional — literal — eliminar.',
          'E «condenados a futuro algum»: veredicto jurídico transferido ao destino social — figurado.',
          'Gabarito E.',
          'Em similares: «condenado» + abstração = metáfora jurídica.',
        ],
        footer_rule: 'E: metáfora do veredicto.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONDENADOS — LENTE',
        rows: [
          { label: 'Literal', value: 'Sentença judicial, pena criminal.' },
          { label: 'Figurado', value: 'Destinados sem saída — metáfora jurídica.' },
          { label: 'IMDS', value: 'Imobilidade social como regra no Brasil.' },
          { label: 'Nesta questão', value: 'E — «condenados a futuro algum».' },
        ],
        footer_rule: 'País não foi ao tribunal — foi ao destino.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras passagens',
        items: [
          { label: 'A — desolador', detail: 'Cenário triste do estudo IMDS.', correct: 'Sentido literal: adjetivo avaliativo do cenário.' },
          { label: 'B — desonrou', detail: 'Brasil e compromissos constitucionais.', correct: 'Metáfora possível, mas não é o trecho gabarito da questão.' },
          { label: 'C — prioridade', detail: 'Criança como prioridade na Constituição.', correct: 'Sentido literal: norma jurídica objetiva.' },
          { label: 'D — qualidade baixa', detail: 'Diagnóstico do ensino brasileiro.', correct: 'Sentido literal: avaliação educacional.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Sem investimento, a cidade está condenada ao atraso.»',
            correct: 'Sentido figurado: «condenada» transfere veredicto — não sentença judicial.',
          },
        ],
        footer_rule: 'E: condenados figurado.',
      },
    ],
  },

  'cpcon-uepb-a-denotacao-leia-o-texto-ii-para-responder-a-que-3651731': {
    family: 'text_fragment',
    source_tec_id: '3651731',
    source_note: 'Entomologia «coleções científicas» denotação — CPCON UEPB Ag Adm Pref São Bentinho 2025 tec 3651731',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref São Bentinho)',
      orgao: 'Pref. São Bentinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto II para responder à questão abaixo.\n\nNo trecho «A palavra Entomologia é proveniente da união de dois radicais gregos, entomon (inseto) e logos (estudo)...», observa-se o uso da etimologia para esclarecer o significado de um termo técnico.\n\nCom base em todo o texto, marque a alternativa que contém a explicação CORRETA sobre um dos mecanismos semânticos ou lexicais.',
    text_fragment:
      '<p><strong>Texto II — A entomologia</strong></p>' +
      '<p>É a especialidade da biologia que estuda os insetos sob todos os seus aspectos e relações com o homem, as plantas, os animais e o meio ambiente. A palavra <strong>Entomologia</strong> é proveniente da união de dois radicais gregos, <em>entomon</em> (inseto) e <em>logos</em> (estudo).</p>' +
      '<p><em>Entomos</em> significa cortado, dividido — a maioria dos insetos apresenta o corpo dividido em segmentos. <em>Logos</em> significa fala, discurso, estudo de algo. <strong>Inseto</strong> deriva do latim <em>Animale insectum</em> — animal segmentado.</p>' +
      '<p>As <strong>coleções científicas</strong> formadas por insetos são chamadas entomológicas. Nestes acervos encontram-se armazenados, ordenados e preservados espécimes mortos para pesquisas. São registros da existência de espécies no tempo e no espaço.</p>' +
      '<p>A Coleção Entomológica do Instituto Oswaldo Cruz é uma das maiores da América Latina — referência para identificação de vetores de doenças infecciosas.</p>',
    options: [
      {
        id: 'A',
        text: 'O par «logos» e «fala» representa homonímia, pois são palavras com grafia semelhante e significados distintos.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O termo «inseto» é exemplo de ambiguidade, pois seu significado se altera conforme o contexto.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'As palavras «entomologia» e «inseto» apresentam sinonímia, pois ambas designam o mesmo conceito.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'O termo «coleções científicas» apresenta denotação, pois indica objetivamente o valor desses acervos.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'O termo «coleção entomológica» apresenta conotação, pois indica subjetivamente o valor simbólico desses acervos.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mecanismo semântico',
        chip_label: 'Denotação',
        meta: slideMeta,
        items: [
          { label: 'Entomologia', detail: 'Estudo dos insetos — etimologia grega no texto.', icon: 'Bug' },
          { label: 'Coleções', detail: 'Acervos de espécimes — sentido objetivo.', icon: 'Archive' },
          { label: 'Denotação D', detail: 'Designação literal dos acervos científicos.', icon: 'BookOpen' },
          { label: 'Homonímia A', detail: 'Logos/fala — etimologia, não homônimos.', icon: 'X' },
          { label: 'Pegadinha', detail: 'Trocar denotação por conotação em termo técnico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Acervo científico = denotação objetiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto II: entomologia, etimologia grega, coleções de insetos, Fiocruz.',
          'Comando: mecanismo semântico ou lexical correto.',
          'A homonímia logos/fala: etimologia explicativa — não homônimos — eliminar.',
          'B ambiguidade de «inseto»: significado estável no texto — eliminar.',
          'C sinonímia entomologia/inseto: campo ≠ objeto de estudo — eliminar.',
          'D denotação de «coleções científicas»: acervos objetivos — correto.',
          'E conotação de «coleção entomológica»: texto descreve função, não carga subjetiva — eliminar.',
          'Gabarito D.',
          'Em similares: termo técnico de acervo costuma ser denotativo.',
        ],
        footer_rule: 'Tap = separar etimologia de mecanismo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DENOTAR ACERVO',
        rows: [
          { label: 'Denotação', value: 'Sentido objetivo — coleções = acervos reais.' },
          { label: 'Conotação', value: 'Carga subjetiva — não é o foco do trecho.' },
          { label: 'Etimologia', value: 'Entomon + logos — explica origem, não homonímia.' },
          { label: 'Nesta questão', value: 'D — «coleções científicas» denotativas.' },
        ],
        footer_rule: 'Espécime preservado ≠ símbolo subjetivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classificações incorretas',
        items: [
          { label: 'A — homonímia', detail: 'Par logos/fala na etimologia.', correct: 'Não é homonímia — é explicação etimológica de um termo.' },
          { label: 'B — ambiguidade', detail: '«Inseto» muda de sentido.', correct: 'No texto, significado estável — não ambiguidade.' },
          { label: 'C — sinonímia', detail: 'Entomologia = inseto.', correct: 'Não são sinônimos — uma é ciência, outra é animal.' },
          { label: 'E — conotação', detail: 'Valor simbólico da coleção.', correct: 'Texto descreve função objetiva — denotação, não conotação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O herbário guarda plantas secas para pesquisa.»',
            correct: 'Sentido literal/denotativo: «herbário» designa acervo objetivo.',
          },
        ],
        footer_rule: 'D: denotação do acervo.',
      },
    ],
  },

  'cpcon-uepb-a-denotacao-leia-o-texto-ii-para-responder-a-que-3654555': {
    family: 'text_fragment',
    source_tec_id: '3654555',
    source_note: 'Entomologia mecanismo semântico — CPCON UEPB ACS Pref R Sto Antônio 2025 tec 3654555',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref R Sto Antônio)',
      orgao: 'Pref R Sto Antônio',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto II para responder à questão abaixo.\n\nNo trecho «A palavra Entomologia é proveniente da união de dois radicais gregos, entomon (inseto) e logos (estudo)...», observa-se o uso da etimologia para esclarecer o significado de um termo técnico.\n\nCom base em todo o texto, marque a alternativa que contém a explicação CORRETA sobre um dos mecanismos semânticos ou lexicais.',
    text_fragment:
      '<p><strong>Texto II — A entomologia</strong></p>' +
      '<p>É a especialidade da biologia que estuda os insetos sob todos os seus aspectos e relações com o homem, as plantas, os animais e o meio ambiente. A palavra <strong>Entomologia</strong> é proveniente da união de dois radicais gregos, <em>entomon</em> (inseto) e <em>logos</em> (estudo).</p>' +
      '<p><em>Entomos</em> significa cortado, dividido — a maioria dos insetos apresenta o corpo dividido em segmentos. <em>Logos</em> significa fala, discurso, estudo de algo. <strong>Inseto</strong> deriva do latim <em>Animale insectum</em> — animal segmentado.</p>' +
      '<p>As <strong>coleções científicas</strong> formadas por insetos são chamadas entomológicas. Nestes acervos encontram-se armazenados, ordenados e preservados espécimes mortos para pesquisas. São registros da existência de espécies no tempo e no espaço.</p>' +
      '<p>A Coleção Entomológica do Instituto Oswaldo Cruz é uma das maiores da América Latina — referência para identificação de vetores de doenças infecciosas.</p>',
    options: [
      {
        id: 'A',
        text: 'O par «logos» e «fala» representa homonímia, pois são palavras com grafia semelhante e significados distintos.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O termo «inseto» é exemplo de ambiguidade, pois seu significado se altera conforme o contexto.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'As palavras «entomologia» e «inseto» apresentam sinonímia, pois ambas designam o mesmo conceito.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'O termo «coleções científicas» apresenta denotação, pois indica objetivamente o valor desses acervos.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'O termo «coleção entomológica» apresenta conotação, pois indica subjetivamente o valor simbólico desses acervos.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lexical × objetivo',
        chip_label: 'Etimologia',
        meta: slideMeta,
        items: [
          { label: 'Radicais gregos', detail: 'Entomon + logos — formação da palavra.', icon: 'Languages' },
          { label: 'Acervos', detail: 'Espécimes preservados para ciência.', icon: 'Microscope' },
          { label: 'Objetividade', detail: '«Coleções científicas» — referente real.', icon: 'Target' },
          { label: 'Fiocruz', detail: 'Maior coleção entomológica da AL.', icon: 'Building' },
          { label: 'Pegadinha', detail: 'Rotular etimologia como homonímia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pergunta-teste: explica origem ou classifica mecanismo?',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto II (mesmo enunciado): biologia dos insetos, etimologia, acervos.',
          'Comando: qual explicação de mecanismo semântico/lexical está correta?',
          'A: logos ≠ homonímia com «fala» — é etimologia — descartar.',
          'B: «inseto» não oscila de sentido no texto — descartar ambiguidade.',
          'C: entomologia estuda inseto — não são sinônimos — descartar.',
          'D: «coleções científicas» nomeia acervo com precisão — denotação.',
          'E: conotação exige carga afetiva — texto é descritivo — descartar.',
          'Gabarito D.',
          'Em similares: valor objetivo de acervo → denotação.',
        ],
        footer_rule: 'Tap = etimologia ≠ homonímia.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MECANISMOS — FILTRO',
        rows: [
          { label: 'Etimologia', value: 'Origem da palavra — não confundir com homonímia.' },
          { label: 'Denotação', value: 'Nomear acervo sem subjetividade.' },
          { label: 'Sinonímia', value: 'Mesmo conceito — entomologia ≠ inseto.' },
          { label: 'Nesta questão', value: 'D — denotação de coleções científicas.' },
        ],
        footer_rule: 'Ciência nomeia — não sentimentaliza o acervo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Mecanismos mal rotulados',
        items: [
          { label: 'A — homonímia', detail: 'Grafia parecida entre logos e fala.', correct: 'Etimologia explicativa — não par de homônimos.' },
          { label: 'B — ambiguidade', detail: 'Sentido de inseto varia.', correct: 'Significado estável no texto técnico.' },
          { label: 'C — sinonímia', detail: 'Entomologia e inseto iguais.', correct: 'Ciência e objeto — conceitos distintos.' },
          { label: 'E — conotação', detail: 'Valor simbólico subjetivo.', correct: 'Descrição funcional do acervo — denotação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O museu preserva fósseis para estudo.»',
            correct: 'Sentido denotativo: «fósseis» designa objeto de pesquisa.',
          },
        ],
        footer_rule: 'D: denotação objetiva.',
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
