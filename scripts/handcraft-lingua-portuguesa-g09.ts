#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g09 (8 slugs · Pontuação · lote 2).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g09.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g09 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g09 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';

const LOTE = 'lingua-portuguesa-g09';
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
    'discurso-indireto',
    'adjunto-deslocado',
    'enumeração',
    'verbo-OD',
    'reescrita',
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
      reviewer: 'handcraft:lingua-portuguesa-g09',
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

const UNIVERSIDADES_FRAGMENT =
  '<p><strong>As universidades e o desafio da desigualdade social</strong> (Cesar Martins — Folha, 2026 — adaptado)</p>' +
  '<p>Desde o surgimento dos primeiros agrupamentos humanos, a desigualdade tem sido uma marca das sociedades. ' +
  '<strong>Atualmente, a desigualdade é tema de debate</strong> em universidades de várias partes do mundo.</p>' +
  '<p><strong>Hoje, a maioria das universidades públicas</strong> conta com programas de inclusão, apoio estudantil e permanência, ' +
  'tornando esse espaço historicamente elitista mais diverso e representativo da sociedade brasileira.</p>';

const SPECS: Record<string, Spec> = {
  'avancasp-nova-odessa-pontuacao-reescrita-3963918': {
    family: 'conceito',
    source_tec_id: '3963918',
    source_note: 'Reescrita discurso indireto — AVANÇASP Esc Pref Nova Odessa 2026 tec 3963918',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Nova Odessa)',
      orgao: 'Pref. Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«O estudante perguntou ao professor, com muito receio: «Que dia será a prova?»»\n\nAssinale a alternativa que apresenta uma forma reescrita correta do trecho acima, com o emprego adequado dos sinais de pontuação.',
    options: [
      {
        id: 'A',
        text: 'O estudante perguntou: ao professor com muito receio, que dia seria a prova.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O estudante perguntou ao professor, com muito receio, que dia seria a prova?',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'O estudante perguntou ao professor, com muito receio, que dia seria a prova.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'O estudante, perguntou ao professor com muito receio que dia, seria a prova.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'O estudante, perguntou ao professor com muito receio que dia seria, a prova?',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Discurso indireto',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          {
            label: 'Fala direta original',
            detail: 'Dois-pontos/travessão + pergunta com «?» — discurso direto.',
            icon: 'MessageSquare',
          },
          {
            label: 'Reescrita indireta',
            detail: 'Sem «?» nem «:» — pergunta vira oração subordinada.',
            icon: 'ArrowRightLeft',
          },
          {
            label: '«com muito receio»',
            detail: 'Adjunto intercalado — vírgulas dos dois lados.',
            icon: 'Pause',
          },
          {
            label: 'Trilho sujeito|verbo',
            detail: '«O estudante perguntou» — sem vírgula entre sujeito e verbo.',
            icon: 'GitCommitHorizontal',
          },
        ],
        footer_rule: 'Indireto: sem ? na subordinada; adjunto intercalado com vírgulas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Corte letra a letra',
        meta: slideMeta,
        steps: [
          'Original: fala direta com «:» e interrogação na pergunta.',
          'Reescrita certa = discurso indireto: «que dia seria a prova» sem «?».',
          'A: «perguntou:» e ordem quebrada — pontuação e sintaxe erradas.',
          'B: mantém «?» no indireto — indevido na norma culta.',
          'D/E: vírgula entre sujeito e verbo («O estudante, perguntou») — proibido.',
          'C: adjunto «com muito receio» isolado; indireto sem «?» nem «:».',
          'Gabarito C.',
          'Em similares: o que a vírgula isola? Indireto tira «?»; sujeito|verbo livre.',
        ],
        footer_rule: 'C = discurso indireto com pontuação adequada.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Trilho de bolso',
        meta: slideMeta,
        content: 'DISCURSO INDIRETO',
        rows: [
          { label: 'Direto → indireto', value: 'tire «?» e «:» da pergunta incorporada' },
          { label: 'Adjunto intercalado', value: '«, com muito receio,» — vírgulas dos dois lados' },
          { label: 'Proibido', value: 'sujeito, verbo — nunca separe o núcleo do verbo' },
          { label: 'Nesta questão', value: 'C — indireto sem ? nem :' },
        ],
        footer_rule: 'Indireto: pergunta vira oração; sem interrogação final.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o aluno cai',
        meta: slideMeta,
        content: 'Confundir direto com indireto na reescrita',
        items: [
          {
            label: 'A — dois-pontos',
            detail: '«perguntou:» imita fala direta.',
            correct: 'Indireto não usa «:» antes da oração incorporada.',
          },
          {
            label: 'B — interrogação',
            detail: 'Parece manter o tom de pergunta.',
            correct: 'Discurso indireto: «que dia seria» — sem «?».',
          },
          {
            label: 'D — sujeito, verbo',
            detail: 'Vírgulas espalhadas no período.',
            correct: '«O estudante, perguntou» corta sujeito|verbo.',
          },
          {
            label: 'E — sujeito, verbo + ?',
            detail: 'Mistura corte do trilho com interrogação.',
            correct: 'Duplo erro: sujeito|verbo e «?» no indireto.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam «professor» por «colega».',
            correct: 'Mesmo teste: indireto sem ?; adjunto com vírgulas.',
          },
        ],
        footer_rule: 'C passa: reescrita indireta correta.',
      },
    ],
  },

  'epice-monteiro-pontuacao-atualmente-4024909': {
    family: 'text_fragment',
    source_tec_id: '4024909',
    source_note: 'Vírgula após Atualmente — Ápice ACS Pref Monteiro 2026 tec 4024909',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref. Monteiro',
      ano: '2026',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nAnalise o uso da vírgula após «atualmente» no seguinte trecho: «Atualmente, a desigualdade é tema de debate em universidades de várias partes do mundo. No entanto, durante boa parte de sua história, essas instituições atenderam a um segmento específico da população, a elite econômica, contribuindo para a estratificação social.»\n\nDe acordo com as regras de pontuação, a vírgula presente imediatamente após o termo «Atualmente» no trecho anterior é de uso:',
    text_fragment: UNIVERSIDADES_FRAGMENT,
    options: [
      { id: 'A', text: 'facultativo, por isolar um aposto especificativo.', is_correct: false },
      {
        id: 'B',
        text: 'facultativo, por isolar um adjunto adverbial de curta extensão deslocado.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'obrigatório, por isolar um adjunto adverbial de curta extensão deslocado.',
        is_correct: false,
      },
      { id: 'D', text: 'obrigatório, por isolar um aposto especificativo.', is_correct: false },
      {
        id: 'E',
        text: 'obrigatório, por isolar um adjunto adnominal de curta extensão deslocado.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula após Atualmente',
        chip_label: 'O que isola?',
        meta: slideMeta,
        items: [
          { label: '«Atualmente,»', detail: 'Advérbio de tempo anteposto — adjunto adverbial deslocado.', icon: 'Clock' },
          { label: 'Pergunta-teste M08', detail: 'O que a vírgula isola? Advérbio deslocado, não aposto.', icon: 'ScanSearch' },
          { label: 'Curta extensão', detail: 'Um advérbio — vírgula facultativa na norma culta.', icon: 'Minus' },
          { label: 'Não é aposto', detail: '«Atualmente» não explica «desigualdade».', icon: 'UserX' },
        ],
        footer_rule: 'Advérbio curto no início → vírgula facultativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Folha: desigualdade nas universidades — trecho com «Atualmente,».',
          'Pergunta-teste: o que a vírgula isola? Advérbio de tempo deslocado.',
          'A/D: aposto — «Atualmente» não nomeia nem explica outro termo.',
          'E: adjunto adnominal — advérbio não modifica substantivo adjacente.',
          'C: obrigatório — advérbio curto anteposto pode dispensar vírgula.',
          'B: facultativo — adjunto adverbial curto deslocado.',
          'Gabarito B.',
          'Em similares: o que a vírgula isola? Advérbio curto = facultativo.',
        ],
        footer_rule: 'B = facultativo — adjunto adverbial curto deslocado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO DESLOCADO',
        rows: [
          { label: 'Pergunta-teste', value: 'O que a vírgula isola?' },
          { label: 'Advérbio curto', value: '«Atualmente,» / «Hoje,» — facultativo' },
          { label: 'Aposto', value: 'explica nome — não é o caso' },
          { label: 'Nesta questão', value: 'B — facultativo' },
        ],
        footer_rule: 'Advérbio de tempo no início: vírgula facultativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir adjunto com aposto ou obrigatoriedade',
        items: [
          { label: 'A — aposto', detail: '«Atualmente» parece comentar a frase.', correct: 'Aposto explica nome; advérbio indica tempo.' },
          { label: 'C — obrigatório', detail: 'Vírgula parece indispensável.', correct: 'Advérbio curto anteposto: uso facultativo.' },
          { label: 'D — aposto obrigatório', detail: 'Dupla confusão de função.', correct: 'Não há aposto; nem obrigatoriedade.' },
          { label: 'E — adnominal', detail: 'Advérbio confundido com modificador de nome.', correct: '«Atualmente» modifica o predicado, não um SN.' },
          { label: 'Em outra banca…', detail: 'Trocam «Atualmente» por «Hoje».', correct: 'Mesma regra: adjunto adverbial curto deslocado.' },
        ],
        footer_rule: 'B passa: facultativo — adjunto adverbial.',
      },
    ],
  },

  'epice-monteiro-pontuacao-hoje-4024933': {
    family: 'text_fragment',
    source_tec_id: '4024933',
    source_note: 'Vírgula após Hoje — Ápice ACS Pref Monteiro 2026 tec 4024933',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref. Monteiro',
      ano: '2026',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nSobre o trecho: «Essas políticas alteraram o perfil do estudante universitário brasileiro. Hoje, a maioria das universidades públicas conta com programas de inclusão, apoio estudantil e permanência, tornando esse espaço historicamente elitista mais diverso e representativo da sociedade brasileira.»\n\nSobre a pontuação, especificamente o uso das vírgulas, assinale a alternativa correta.',
    text_fragment: UNIVERSIDADES_FRAGMENT,
    options: [
      {
        id: 'A',
        text: 'Para o trecho estar de acordo com a norma-padrão da língua portuguesa, deveria haver uma vírgula após o vocábulo «alteraram».',
        is_correct: false,
      },
      { id: 'B', text: 'A vírgula após o vocábulo «hoje» é obrigatória.', is_correct: false },
      {
        id: 'C',
        text: 'Para o trecho estar de acordo com a norma-padrão da língua portuguesa, deveria haver uma vírgula após o vocábulo «políticas».',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Para o trecho estar de acordo com a norma-padrão da língua portuguesa, deveria haver uma vírgula após o vocábulo «universidades».',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A vírgula após o vocábulo «hoje» é facultativa, uma vez que separa adjunto adverbial de curta extensão deslocado de sua posição original.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula após Hoje',
        chip_label: 'O que isola?',
        meta: slideMeta,
        items: [
          { label: '«Hoje,»', detail: 'Advérbio de tempo no início — desigualdade/universidades no texto.', icon: 'Clock' },
          {
            label: 'Universidades públicas',
            detail: 'Programas de inclusão, apoio e permanência — perfil diverso.',
            icon: 'GraduationCap',
          },
          { label: 'Facultativa', detail: 'Adjunto adverbial curto — vírgula opcional.', icon: 'Check' },
          { label: 'Outras vírgulas', detail: 'Enumeração «inclusão, apoio…» — função distinta.', icon: 'List' },
        ],
        footer_rule: '«Hoje,» = adjunto adverbial curto deslocado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: universidades públicas, programas de inclusão e permanência; «Hoje, a maioria…».',
          'Pergunta-teste na vírgula após «hoje»: o que isola?',
          'A/C/D: pedem vírgula onde não há adjunto deslocado ou enumeração exige outro lugar.',
          'B: obrigatória — advérbio curto anteposto admite omissão da vírgula.',
          'E: facultativa — adjunto adverbial curto deslocado.',
          'Gabarito E.',
          'Em similares: o que a vírgula isola? Hoje/Atualmente = facultativo.',
        ],
        footer_rule: 'E = vírgula após «hoje» facultativa.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HOJE, ATUALMENTE',
        rows: [
          { label: 'Função', value: 'adjunto adverbial de tempo deslocado' },
          { label: 'Vírgula', value: 'facultativa (curta extensão)' },
          { label: '≠ enumeração', value: '«inclusão, apoio, permanência» — outra regra' },
          { label: 'Nesta questão', value: 'E — facultativa' },
        ],
        footer_rule: 'Advérbio curto anteposto: vírgula facultativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Exigir vírgula onde a banca não cobra',
        items: [
          { label: 'A — após alteraram', detail: 'Parece fechar a 1ª oração.', correct: 'Não há termo deslocado após «alteraram».' },
          { label: 'B — obrigatória', detail: 'Vírgula após «hoje» parece regra fixa.', correct: 'Advérbio curto: uso facultativo.' },
          { label: 'C — após políticas', detail: 'Confunde com enumeração posterior.', correct: '«políticas» não exige vírgula isolada ali.' },
          { label: 'D — após universidades', detail: 'SN no meio do período confunde.', correct: 'Vírgula debateada é só após «hoje».' },
          { label: 'Em outra banca…', detail: 'Par com questão «Atualmente».', correct: 'Mesmo trilho: adjunto curto deslocado.' },
        ],
        footer_rule: 'E passa: facultativa após «hoje».',
      },
    ],
  },

  'epice-sj-cordeiros-pontuacao-meme-4037433': {
    family: 'conceito',
    source_tec_id: '4037433',
    source_note: 'Enumeração meme — Ápice AP EI Pref SJ Cordeiros 2026 tec 4037433',
    exam_vs_current: 'banca A; leitura normativa enumeração ≈ C',
    meta: {
      banca: 'Ápice',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref. SJ Cordeiros',
      ano: '2026',
    },
    instruction:
      'No trecho «Imagem, vídeo, frase, expressão, parte de um texto etc.», o uso das vírgulas tem a função de:',
    options: [
      {
        id: 'A',
        text: 'separar palavras que apresentam sentidos opostos dentro do mesmo enunciado.',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'marcar uma pausa para explicar uma informação adicional dentro da frase.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'organizar uma sequência de termos que exemplificam diferentes tipos de conteúdo.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'indicar a omissão de um verbo que já foi mencionado anteriormente no período.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'destacar um termo que está sendo diretamente chamado no enunciado.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgulas no trecho meme',
        meta: slideMeta,
        items: [
          { label: 'Imagem, vídeo, frase…', detail: 'Lista de tipos de conteúdo — enumeração.', icon: 'List' },
          { label: 'Gabarito prova', detail: 'A — leitura literal do enunciado da banca.', icon: 'Target' },
          { label: 'Norma culta', detail: 'Enumeração ≈ C — mesma função sintática.', icon: 'BookOpen' },
          { label: 'Pergunta-teste', detail: 'O que a vírgula isola? Itens coordenados.', icon: 'ScanSearch' },
        ],
        footer_rule: 'Prova: A; norma: enumeração de exemplos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho define «meme»: imagem, vídeo, frase, expressão, parte de texto.',
          'Vírgulas separam itens da série — função de enumeração na norma.',
          'B: pausa explicativa — não há inciso; são termos coordenados.',
          'D: omissão de verbo — lista nominal, não elipse verbal.',
          'E: vocativo — ninguém é chamado no trecho.',
          'C: enumeração normativa — banca preferiu A (sentidos distintos).',
          'Gabarito A (prova); leitura normativa ≈ C.',
          'Em similares: o que a vírgula isola? Itens de mesma função = enumeração.',
        ],
        footer_rule: 'A na prova; C na norma — registre exam_vs_current.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ENUMERAÇÃO × PROVA',
        rows: [
          { label: 'Norma', value: 'vírgula entre itens de mesma função (≈ C)' },
          { label: 'Chave da prova', value: 'A — sentidos distintos no enunciado' },
          { label: 'Pergunta-teste', value: 'O que a vírgula isola?' },
          { label: 'Divergência', value: 'Registrar exam_vs_current se norma ≠ banca' },
        ],
        footer_rule: 'Slides ensinam gabarito A; norma ≈ enumeração.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar leitura da banca pela norma pura',
        items: [
          {
            label: 'C — enumeração',
            detail: 'Resposta gramaticalmente mais precisa.',
            correct: 'Norma ≈ C, mas gabarito oficial da prova é A.',
          },
          {
            label: 'B — pausa explicativa',
            detail: 'Vírgulas parecem inciso.',
            correct: 'São separadores de itens, não explicação intercalada.',
          },
          {
            label: 'D — omissão verbal',
            detail: 'Lista nominal confunde com zeugma.',
            correct: 'Não há verbo omitido entre os termos.',
          },
          {
            label: 'E — vocativo',
            detail: 'Termos isolados parecem chamamento.',
            correct: 'Nenhum vocativo no trecho definicional.',
          },
          {
            label: 'Em outra banca…',
            detail: 'FGV/Cebraspe cobrariam enumeração.',
            correct: 'Esta prova: A; registre exam_vs_current.',
          },
        ],
        footer_rule: 'A passa na prova; C ≈ norma culta.',
      },
    ],
  },

  'vunesp-osasco-pontuacao-virgula-adjunto-3323730': {
    family: 'text_fragment',
    source_tec_id: '3323730',
    source_note: 'Adjunto finalmente deslocado — VUNESP Aux Sau Buc Osasco 2025 tec 3323730',
    meta: {
      banca: 'VUNESP',
      prova: 'Aux Sau Buc (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nAssinale a alternativa em que o acréscimo de vírgulas preserva a norma-padrão de pontuação.',
    text_fragment:
      '<p><strong>Luz no fim do túnel para as Santas Casas</strong> (O Estado de S.Paulo, 2024 — adaptado)</p>' +
      '<p>A Santa Casa de São Paulo vende imóveis para quitar dívidas. Hospitais filantrópicos respondem por quase metade dos leitos do SUS.</p>' +
      '<p>Há décadas a Tabela do SUS está defasada. <strong>No início de 2024 finalmente foi sancionada uma lei federal</strong> estabelecendo revisão periódica da tabela.</p>',
    options: [
      {
        id: 'A',
        text: 'A Santa Casa de Misericórdia de São Paulo, anunciou, a venda de sete imóveis… (1º parágrafo)',
        is_correct: false,
      },
      {
        id: 'B',
        text: '… e os hospitais filantrópicos respondem por quase, metade, dos leitos do SUS. (2º parágrafo)',
        is_correct: false,
      },
      {
        id: 'C',
        text: '… o Estado recolhe, o dinheiro, do contribuinte e o repassa a entidades sem fins lucrativos… (3º parágrafo)',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Há décadas, os valores, de repasse da Tabela do SUS estão defasados. (4º parágrafo)',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'No início de 2024, finalmente, foi sancionada uma lei federal… (5º parágrafo)',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adjunto intercalado',
        chip_label: 'O que isola?',
        meta: slideMeta,
        items: [
          {
            label: 'Santas Casas / SUS',
            detail: 'Hospitais filantrópicos; Tabela do SUS defasada há décadas.',
            icon: 'HeartPulse',
          },
          { label: '«finalmente,»', detail: 'Advérbio intercalado — vírgulas dos dois lados.', icon: 'Pause' },
          { label: '«No início de 2024,»', detail: 'Adjunto adverbial anteposto — vírgula após.', icon: 'Calendar' },
          { label: 'Erros A–D', detail: 'Cortam sujeito|verbo ou SN|determinante.', icon: 'XCircle' },
        ],
        footer_rule: 'Termo deslocado/intercalado → vírgulas de isolamento.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: Santa Casa de Misericórdia, hospitais filantrópicos, lei federal sancionada em 2024.',
          'A: «São Paulo, anunciou,» — vírgula entre sujeito e verbo. Errado.',
          'B: «quase, metade,» — corta sintagma nominal. Errado.',
          'C: «recolhe, o dinheiro,» — verbo|OD. Errado.',
          'D: «valores, de repasse» — separa nome e complemento. Errado.',
          'E: «No início de 2024, finalmente,» — adjuntos isolados corretamente.',
          'Gabarito E.',
          'Em similares: o que a vírgula isola? Nunca sujeito|verbo nem verbo|OD.',
        ],
        footer_rule: 'E = adjuntos deslocados/intercalados.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TERMO DESLOCADO',
        rows: [
          { label: 'Pergunta-teste', value: 'O que a vírgula isola?' },
          { label: 'Pode', value: 'adjunto anteposto ou intercalado («finalmente,»)' },
          { label: 'Proibido', value: 'sujeito|verbo · verbo|OD · SN|corte' },
          { label: 'Nesta questão', value: 'E — 2024, finalmente,' },
        ],
        footer_rule: 'Isola adjunto — não corte o trilho sujeito|verbo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgulas que cortam o trilho',
        items: [
          { label: 'A — anunciou', detail: 'Parece pausa na leitura.', correct: 'Sujeito|verbo: Santa Casa anunciou — sem vírgula.' },
          { label: 'B — metade', detail: 'Advérbio «quase» mal isolado.', correct: 'Não separe «quase metade» com vírgulas.' },
          { label: 'C — dinheiro', detail: 'Objeto direto após verbo.', correct: 'Verbo|OD: recolhe o dinheiro — sem vírgula.' },
          { label: 'D — valores', detail: 'Complemento nominal unido.', correct: '«valores de repasse» — sem vírgula no meio.' },
          { label: 'Em outra banca…', detail: 'Trocam «finalmente» por «por fim».', correct: 'Mesmo teste: intercalado = duas vírgulas.' },
        ],
        footer_rule: 'E passa: adjuntos «2024» e «finalmente».',
      },
    ],
  },

  'vunesp-campinas-pontuacao-virgula-citacao-3345654': {
    family: 'text_fragment',
    source_tec_id: '3345654',
    source_note: 'Vírgula após Aqui na citação — VUNESP Ag AS Campinas 2025 tec 3345654',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag AS (Pref Campinas) Farmácia',
      orgao: 'Pref. Campinas',
      ano: '2025',
    },
    instruction:
      'Leia o texto a seguir para responder à questão abaixo.\n\nAssinale a alternativa em que a vírgula acrescentada ao trecho preserva a norma-padrão de emprego desse sinal de pontuação.',
    text_fragment:
      '<p><strong>Dia dos Mortos no México</strong> (Mariana Melo — USP, adaptado)</p>' +
      '<p>A pesquisadora Júlia Batista Alves comparou festas no Brasil e no México. Sobre a fraca tradição brasileira, ela observou: «Aqui não vemos nada parecido com o que acontece nas ruas do México».</p>' +
      '<p>No México, altares coloridos, desfiles e sincretismo cultural marcam o Dia dos Mortos.</p>',
    options: [
      {
        id: 'A',
        text: '… a pesquisadora Júlia Batista Alves pôde perceber por que há pouca força do evento no Brasil: «Aqui, não vemos nada parecido com o que acontece nas ruas do México».',
        is_correct: true,
      },
      {
        id: 'B',
        text: '… é uma das maiores celebrações do mundo e demonstra a forte conexão que os mexicanos têm, com seus antepassados.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'A comparação entre as festas realizadas no Dia dos Finados no Brasil e no México, demonstrou que a população do país da América do Norte…',
        is_correct: false,
      },
      {
        id: 'D',
        text: '… os indígenas mexicanos conseguiram fazer com que, os jesuítas europeus assimilassem mais sua cultura…',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A Festa dos Mortos tem proporções muito maiores, do que as celebrações relativas no Brasil…',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula após Aqui',
        chip_label: 'O que isola?',
        meta: slideMeta,
        items: [
          { label: 'Citação da pesquisadora', detail: '«Aqui, não vemos…» — fala direta.', icon: 'Quote' },
          { label: '«Aqui,»', detail: 'Advérbio de lugar anteposto na oração citada.', icon: 'MapPin' },
          { label: 'Dia dos Mortos', detail: 'México × Brasil — tradição indígena.', icon: 'Globe' },
          { label: 'Outras alternativas', detail: 'Cortam sujeito|verbo ou SN.', icon: 'XCircle' },
        ],
        footer_rule: 'Advérbio de lugar deslocado → vírgula após «Aqui».',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: Júlia compara festas — cita «Aqui não vemos…».',
          'Pergunta-teste na vírgula após «Aqui»: adjunto de lugar deslocado.',
          'B: «têm, com antepassados» — verbo|complemento. Errado.',
          'C: «México, demonstrou» — sujeito|verbo. Errado.',
          'D: «que, os jesuítas» — sujeito|verbo da subordinada. Errado.',
          'E: «maiores, do que» — comparação não exige vírgula ali.',
          'A: «Aqui,» isola advérbio de lugar no início da citação.',
          'Gabarito A.',
          'Em similares: o que a vírgula isola? Aqui/Ali antepostos = vírgula.',
        ],
        footer_rule: 'A = adjunto de lugar «Aqui,».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADVÉRBIO DE LUGAR',
        rows: [
          { label: 'Pergunta-teste', value: 'O que a vírgula isola?' },
          { label: '«Aqui,» / «Ali,»', value: 'adjunto de lugar deslocado' },
          { label: 'Proibido', value: 'sujeito|verbo · verbo|complemento' },
          { label: 'Nesta questão', value: 'A — «Aqui,» na citação' },
        ],
        footer_rule: 'Advérbio de lugar no início → vírgula depois.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgulas no lugar errado do período',
        items: [
          { label: 'B — antepassados', detail: 'Parece pausa em «têm com».', correct: 'Verbo|complemento: têm com antepassados.' },
          { label: 'C — demonstrou', detail: 'Sujeito longo confunde.', correct: 'Sujeito|verbo: comparação demonstrou.' },
          { label: 'D — jesuítas', detail: 'Subordinada com «que».', correct: 'Sujeito da oração: os jesuítas — sem vírgula.' },
          { label: 'E — do que', detail: 'Comparativo mal pontuado.', correct: '«maiores do que» — sem vírgula antes de «do».' },
          { label: 'Em outra banca…', detail: 'Trocam «Aqui» por «Lá».', correct: 'Mesma regra: advérbio de lugar anteposto.' },
        ],
        footer_rule: 'A passa: «Aqui,» na fala citada.',
      },
    ],
  },

  'vunesp-sertaozinho-pontuacao-enumeracao-3352588': {
    family: 'text_fragment',
    source_tec_id: '3352588',
    source_note: 'Enumeração catalogar/cuidar — VUNESP Ag Sertãozinho 2025 tec 3352588',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Sertãozinho) SP Saneamento',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nAssinale a alternativa em que as vírgulas foram empregadas para separar os termos de uma enumeração.',
    text_fragment:
      '<p><strong>Tsundoku — a arte de acumular livros</strong> (Alex Castro — Quatro Cinco Um, 2024 — adaptado)</p>' +
      '<p>Existem bibliófilas, acumuladoras e nós — que compramos livros sem ler. Sobre acumuladoras: «são também incapazes de catalogar, cuidar, organizar, até mesmo limpar seus objetos».</p>' +
      '<p>Roberto Calasso defende bibliotecas organizadas de forma lúdica e aleatória.</p>',
    options: [
      {
        id: 'A',
        text: '… são também incapazes de catalogar, cuidar, organizar, até mesmo limpar seus objetos.',
        is_correct: true,
      },
      {
        id: 'B',
        text: '… nem a patologia descontrolada das acumuladoras, mas que, sim, vamos comprando livros pela vida…',
        is_correct: false,
      },
      {
        id: 'C',
        text: '… antes de termos lido qualquer uma das compras da anterior, já estamos comprando novos…',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Para o escritor Roberto Calasso, autor de Como organizar uma biblioteca, bibliotecas deveriam ser organizadas…',
        is_correct: false,
      },
      {
        id: 'E',
        text: '… um lugar para o usuário se perder e, quem sabe, encontrar um livro ainda melhor…',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Enumeração de verbos',
        meta: slideMeta,
        items: [
          { label: 'Acumuladoras', detail: 'Patologia: não jogam objetos fora — texto Tsundoku.', icon: 'Package' },
          { label: 'catalogar, cuidar…', detail: 'Quatro verbos coordenados — mesma função.', icon: 'List' },
          { label: 'Vírgula entre itens', detail: 'Enumeração: separar termos de igual estatuto.', icon: 'Check' },
          { label: 'Pegadinha B', detail: '«mas que, sim,» — oração intercalada.', icon: 'GitBranch' },
        ],
        footer_rule: 'Mesma função sintática → vírgula entre itens.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Quatro Cinco Um: bibliófilas × acumuladoras × nós.',
          'Comando: vírgulas que separam enumeração.',
          'B: «mas que, sim,» — vírgulas isolam oração, não listam verbos.',
          'C: adjuntos e orações — não enumeração pura.',
          'D: aposto «Roberto Calasso, autor…» — função distinta.',
          'E: «quem sabe» intercalado — inciso, não lista.',
          'A: catalogar, cuidar, organizar, limpar — verbos coordenados.',
          'Gabarito A.',
          'Em similares: o que a vírgula isola? Itens iguais = enumeração.',
        ],
        footer_rule: 'A = enumeração de verbos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ENUMERAÇÃO',
        rows: [
          { label: 'Regra', value: 'vírgula entre itens de mesma função' },
          { label: 'Exemplo', value: 'catalogar, cuidar, organizar, limpar' },
          { label: 'Não é', value: 'oração intercalada («sim») ou aposto' },
          { label: 'Nesta questão', value: 'A' },
        ],
        footer_rule: 'Lista coordenada = vírgulas entre os itens.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgulas com outras funções',
        items: [
          { label: 'B — sim', detail: 'Três vírgulas parecem lista.', correct: 'Oração intercalada «mas que, sim,».' },
          { label: 'C — anterior', detail: 'Período longo com várias pausas.', correct: 'Adjuntos e orações — não enumeração.' },
          { label: 'D — Calasso', detail: 'Duas vírgulas no nome.', correct: 'Aposto explicativo, não lista de verbos.' },
          { label: 'E — quem sabe', detail: 'Inciso no meio da oração.', correct: 'Intercalado, não enumeração.' },
          { label: 'Em outra banca…', detail: 'Trocam verbos por substantivos.', correct: 'Mesmo teste: mesma função sintática?' },
        ],
        footer_rule: 'A passa: enumeração de verbos.',
      },
    ],
  },

  'avancasp-amparo-pontuacao-incorreta-3352962': {
    family: 'certo_errado',
    source_tec_id: '3352962',
    source_note: 'INCORRETA pontuação — AVANÇASP ACS Pref Amparo 2025 tec 3352962',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Amparo SP)',
      orgao: 'Pref. Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Qual das frases a seguir está INCORRETA em relação à pontuação?',
    options: [
      { id: 'A', text: 'No mês passado, venderam duas casas novas e muito bonitas.', is_correct: false },
      { id: 'B', text: 'Ela buscava um objetivo: morar na Irlanda.', is_correct: false },
      { id: 'C', text: 'Parabéns, João! Estou orgulhosa de você.', is_correct: false },
      { id: 'D', text: 'Minha mãe trouxe, torta, bolo, suco, e café.', is_correct: true },
      { id: 'E', text: 'Por que você discutiu com a sua melhor amiga?', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA: achar o erro',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Quatro frases corretas; uma incorreta.', icon: 'Search' },
          { label: 'A — adjunto', detail: '«No mês passado,» — advérbio deslocado. Correto.', icon: 'Check' },
          { label: 'B — dois-pontos', detail: 'Esclarecimento do objetivo. Correto.', icon: 'Check' },
          { label: 'D — gabarito', detail: 'Vírgula após verbo e antes de «e». Incorreto.', icon: 'XCircle' },
        ],
        footer_rule: 'INCORRETA: localize vírgula entre verbo e OD.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual frase está INCORRETA na pontuação?',
          'A: «No mês passado,» — adjunto adverbial. Pontuação correta.',
          'B: «objetivo: morar» — dois-pontos explicativos. Correto.',
          'C: «Parabéns, João!» — vocativo isolado. Correto.',
          'E: pergunta direta sem erro de vírgula. Correto.',
          'D: «trouxe, torta» — vírgula entre verbo e OD; «suco, e» antes do «e».',
          'Gabarito D — única incorreta.',
          'Em similares: o que a vírgula isola? Verbo|OD = erro clássico.',
        ],
        footer_rule: 'D = INCORRETA — vírgulas indevidas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROIBIÇÕES',
        rows: [
          { label: 'Verbo|OD', value: '«trouxe torta» — sem vírgula' },
          { label: 'Antes do e', value: 'enumeração: torta, bolo, suco e café' },
          { label: 'Pode', value: 'vocativo (João,) · adjunto (No mês passado,)' },
          { label: 'Nesta questão', value: 'D — incorreta' },
        ],
        footer_rule: 'Trilho verbo|OD livre; «e» final sem vírgula antes.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Marcar frase correta no EXCETO',
        items: [
          {
            label: 'A — mês passado',
            detail: 'Advérbio no início parece estranho.',
            correct: 'Adjunto adverbial deslocado — pontuação correta.',
          },
          {
            label: 'B — objetivo:',
            detail: 'Dois-pontos confundem com enumeração.',
            correct: 'Esclarecimento — uso correto dos «:».',
          },
          {
            label: 'C — João',
            detail: 'Exclamação + vocativo assustam.',
            correct: 'Vocativo «Parabéns, João!» — correto.',
          },
          {
            label: 'E — pergunta',
            detail: '«Por que» parece erro.',
            correct: 'Interrogação direta — sem falha de vírgula.',
          },
          {
            label: 'D — trouxe, torta',
            detail: 'Lista com vírgulas parece enumeração.',
            correct: 'Erro: após «trouxe» e antes de «e» — INCORRETA.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «torta, bolo» por outra lista.',
            correct: 'Mesmo teste: verbo|OD livre; sem vírgula antes do «e».',
          },
        ],
        footer_rule: 'D passa: única frase com pontuação errada.',
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
