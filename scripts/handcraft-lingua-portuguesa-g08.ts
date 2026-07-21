#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g08 (8 slugs · Pontuação · lote 1).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g08.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g08 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g08 --strict
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';

const LOTE = 'lingua-portuguesa-g08';
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
  covers: ['pergunta-teste', 'sujeito|verbo', 'vocativo', 'travessão', 'dois-pontos', 'enumeração'],
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
  use_anchor_payload?: boolean;
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
      reviewer: 'handcraft:lingua-portuguesa-g08',
      guideline_snapshot: `${PT_PONTUACAO.snapshot} · âncora Rita → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
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
        covers: ['enunciado', 'alternativas', 'gabarito', 'âncora Rita'],
      },
    ],
  };
}

function loadAnchorPayload(): { question_data: unknown; reverse_study_slides: unknown[] } {
  const anchorPath = resolve(process.cwd(), GOLDEN_REFERENCE);
  const anchor = JSON.parse(readFileSync(anchorPath, 'utf8')) as {
    question_data: unknown;
    reverse_study_slides: unknown[];
  };
  return { question_data: anchor.question_data, reverse_study_slides: anchor.reverse_study_slides };
}

function build(slug: string, spec: Spec) {
  if (spec.use_anchor_payload) {
    const anchor = loadAnchorPayload();
    return {
      meta: metaBase(spec, slug),
      question_data: anchor.question_data,
      reverse_study_slides: anchor.reverse_study_slides,
    };
  }
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
  'vunesp-jundiai-pontuacao-travessao-3776215': {
    family: 'text_fragment',
    source_tec_id: '3776215',
    source_note: 'Travessão explicativo — VUNESP ACS Jundiaí 2026 tec 3776215',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Jundiaí)',
      orgao: 'Pref. Jundiaí',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nO uso dos travessões, no segundo parágrafo, indica a',
    text_fragment:
      '<p><strong>A fome e a produção de alimentos no Brasil</strong> (Correio Braziliense, 2025 — adaptado)</p><p>O Brasil deixou o Mapa da Fome e se consolidou como grande produtor de alimentos. No entanto, convive com uma dura contradição: embora seja potência agrícola, milhões ainda enfrentam a incerteza sobre o que pôr na mesa.</p><p>O acesso a uma alimentação saudável permanece restrito a uma parcela privilegiada da população brasileira <strong>— classe média e alta —</strong> enquanto a grande maioria, especialmente periferias urbanas pobres e comunidades vulneráveis, sofre com a insegurança alimentar.</p>',
    options: [
      { id: 'A', text: 'intercalação da fala de um interlocutor.', is_correct: false },
      { id: 'B', text: 'citação direta de uma outra fonte.', is_correct: false },
      { id: 'C', text: 'explicação acerca de uma afirmação.', is_correct: true },
      { id: 'D', text: 'opinião irônica do autor do texto.', is_correct: false },
      { id: 'E', text: 'pausa brusca na sequência de ideias.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Travessão no texto',
        chip_label: 'O que isola?',
        meta: slideMeta,
        items: [
          { label: 'Mapa da Fome', detail: 'Texto: fome × potência agrícola no Brasil.', icon: 'Globe' },
          { label: 'Classe média e alta', detail: '2º parágrafo: travessões isolam explicação.', icon: 'ScanSearch' },
          { label: 'Periferias vulneráveis', detail: 'Maioria enfrenta insegurança alimentar.', icon: 'Users' },
          { label: 'Função do travessão', detail: 'Explica a «parcela privilegiada» — inciso explicativo.', icon: 'Info' },
        ],
        footer_rule: 'Travessão pode isolar explicação do termo anterior.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Corte letra a letra',
        meta: slideMeta,
        steps: [
          'Texto: Mapa da Fome, classe média e alta, periferias vulneráveis.',
          'A: fala de interlocutor — não há diálogo nem inciso de voz alheia.',
          'B: citação direta — trecho não reproduz outra fonte entre aspas.',
          'D: ironia — travessão explica, não zomba do autor.',
          'E: pausa brusca — há explicação, não só interrupção seca.',
          'C: explica «parcela privilegiada» = classe média e alta.',
          'Gabarito C.',
          'Em similares: travessão duplo pode substituir vírgulas de aposto.',
        ],
        footer_rule: 'C = explicação da afirmação anterior.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Trilho de bolso',
        meta: slideMeta,
        content: 'TRAVESSÃO',
        rows: [
          { label: 'Explica termo', value: '— aposto ou inciso explicativo —' },
          { label: 'Diálogo', value: 'travessão + fala direta (outro contexto)' },
          { label: 'Citação', value: 'aspas + fonte, não só travessão' },
          { label: 'Nesta questão', value: 'C — explica «parcela privilegiada»' },
        ],
        footer_rule: 'Travessão duplo = isola explicação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o aluno cai',
        meta: slideMeta,
        content: 'Confundir travessão com diálogo ou pausa',
        items: [
          { label: 'A — interlocutor', detail: 'Parece inciso de fala.', correct: 'Não há discurso direto no trecho.' },
          { label: 'B — citação', detail: 'Travessão lembra citação longa.', correct: 'Sem aspas nem referência a outro autor.' },
          { label: 'D — ironia', detail: 'Tom crítico do texto confunde.', correct: 'Travessão explica, não ironiza.' },
          { label: 'E — pausa brusca', detail: 'Pausa oral parece bastar.', correct: 'Há função explicativa clara.' },
          { label: 'Em outra banca…', detail: 'Trocam travessão por parênteses.', correct: 'Mesma lógica: explica o termo anterior.' },
        ],
        footer_rule: 'C passa: explicação acerca da afirmação.',
      },
    ],
  },

  'aocp-ses-sc-pontuacao-dois-pontos-3804106': {
    family: 'text_fragment',
    source_tec_id: '3804106',
    source_note: 'Dois-pontos esclarecimento — AOCP TAA SES SC 2026 tec 3804106',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'TAA (SES SC)',
      orgao: 'SES SC',
      ano: '2026',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nNo título, «Ele tem 22 anos e uma missão: varrer o lixo espacial da órbita da Terra», os dois-pontos foram empregados',
    text_fragment:
      '<p><strong>Ele tem 22 anos e uma missão: varrer o lixo espacial da órbita da Terra</strong></p><p>Leonidas Askianakis agenda reuniões de 30 em 30 minutos — das 5h às 23h — só sobre espaço. Monitorar detritos de 1 a 10 cm na órbita é o foco da Project-S, empresa que fundou após engenharia aeroespacial em Munique.</p><p><em>Adaptado de notícia DW/UOL, nov. 2025</em></p>',
    options: [
      { id: 'A', text: 'obrigatoriamente para introduzir uma citação.', is_correct: false },
      { id: 'B', text: 'para introduzir uma enumeração.', is_correct: false },
      { id: 'C', text: 'para sinalizar inversão, tendo uso facultativo nesse caso.', is_correct: false },
      { id: 'D', text: 'para indicar que a frase foi interrompida ou está truncada.', is_correct: false },
      { id: 'E', text: 'com o objetivo de introduzir um esclarecimento.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois-pontos no título',
        meta: slideMeta,
        items: [
          { label: 'Pontuação no título', detail: 'Sinal «:» anuncia o que vem depois.', icon: 'Megaphone' },
          { label: 'Antes dos :', detail: '«uma missão» — ideia geral anunciada.', icon: 'Target' },
          { label: 'Depois dos :', detail: '«varrer o lixo espacial» — detalha a missão.', icon: 'ZoomIn' },
          { label: 'Não é lista', detail: 'Só um esclarecimento, não vários itens.', icon: 'ListX' },
        ],
        footer_rule: 'Pontuação: dois-pontos anuncia o que vem depois.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Título: missão geral + conteúdo específico após «:».',
          'A: citação — não há fala alheia nem aspas.',
          'B: enumeração — vem um só complemento, não lista.',
          'C: inversão — ordem direta; não há inversão sintática.',
          'D: truncamento — frase completa, não interrompida.',
          'E: esclarecimento — explica qual é a missão.',
          'Gabarito E.',
          'Em similares: «:» anuncia explicação, enumeração ou citação.',
        ],
        footer_rule: 'E = introduz esclarecimento da missão.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOIS-PONTOS',
        rows: [
          { label: 'Esclarecimento', value: 'ideia geral: detalhe (esta questão)' },
          { label: 'Enumeração', value: 'vários itens de mesma função' },
          { label: 'Citação', value: 'antes de fala direta longa' },
          { label: 'Nesta questão', value: 'E — esclarece a missão' },
        ],
        footer_rule: 'Após «:» vem o que se explica.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Funções trocadas dos dois-pontos',
        items: [
          { label: 'A — citação', detail: 'Dois-pontos podem anteceder fala.', correct: 'Aqui não há discurso citado.' },
          { label: 'B — enumeração', detail: 'Confunde com listas do texto.', correct: 'Só um complemento após «:».' },
          { label: 'C — inversão', detail: 'Facultativo em outro contexto.', correct: 'Título não inverte sujeito e verbo.' },
          { label: 'D — truncada', detail: 'Parece título incompleto.', correct: 'Frase fechada; «:» explica.' },
          { label: 'Em outra banca…', detail: 'Trocam «missão» por «objetivo».', correct: 'Mesmo teste: o que vem depois dos «:»?' },
        ],
        footer_rule: 'E passa: esclarecimento da missão.',
      },
    ],
  },

  'cpcon-condado-pontuacao-tirinha-vf-3836507': {
    family: 'vf',
    source_tec_id: '3836507',
    source_note: 'VF pontuação tirinha — CPCON ACS Condado PB 2026 tec 3836507',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Condado)',
      orgao: 'Pref. Condado',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Para responder à questão, leia o texto que segue.\n\nLeia o trecho da tirinha: «5 pães franceses? Muito formal. 5 pão francês? Oxe, e eu num sei português não, é?» Observe que o humor depende, em parte, da pontuação. Sobre o uso dos sinais, analise as afirmativas:\n\nI - O ponto de interrogação expressa a dúvida do personagem quanto à forma correta.\nII - O ponto final em «Muito formal.» sugere conclusão e julgamento do falante.\nIII - A vírgula antes de «Oxe…» marca pausa expressiva da oralidade regional.\n\nÉ CORRETO o que se afirma em:',
    options: [
      { id: 'A', text: 'I, apenas.', is_correct: false },
      { id: 'B', text: 'I e II, apenas.', is_correct: false },
      { id: 'C', text: 'II e III, apenas.', is_correct: false },
      { id: 'D', text: 'I, II e III.', is_correct: true },
      { id: 'E', text: 'III, apenas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tirinha: três sinais',
        meta: slideMeta,
        items: [
          { label: 'I — ?', detail: 'Interrogação nas perguntas sobre plural — dúvida do personagem.', icon: 'HelpCircle' },
          { label: 'II — ponto', detail: '«Muito formal.» fecha julgamento sobre o registro.', icon: 'Check' },
          { label: 'III — vírgula', detail: 'Pausa antes de «Oxe» — oralidade e tom regional.', icon: 'Pause' },
          { label: 'Sequência', detail: 'Três afirmativas certas → D.', icon: 'ListOrdered' },
        ],
        footer_rule: 'VF: julgue I, II e III no contexto da fala.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tirinha: humor pela pontuação do personagem nordestino.',
          'I: «5 pães? / 5 pão?» — interrogação = dúvida sobre a forma → CERTO.',
          'II: «Muito formal.» — ponto final conclui o julgamento → CERTO.',
          'III: vírgula antes de «Oxe» — pausa oral expressiva → CERTO.',
          'Sequência: I + II + III — todas corretas.',
          'Gabarito D.',
          'Em similares: em VF, cada sinal tem função no contexto da fala.',
        ],
        footer_rule: 'D = I, II e III corretas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VF NA TIRINHA',
        rows: [
          { label: 'I — ?', value: 'dúvida sobre plural formal' },
          { label: 'II — .', value: 'conclusão «Muito formal»' },
          { label: 'III — ,', value: 'pausa oral antes de «Oxe»' },
          { label: 'Sequência', value: 'D — todas certas' },
        ],
        footer_rule: 'Três sinais, três leituras certas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sequências que subestimam a tirinha',
        items: [
          { label: 'A — só I', detail: 'Ignora função do ponto e da vírgula.', correct: 'II e III também estão certas.' },
          { label: 'B — I e II', detail: 'Descarta a pausa da vírgula.', correct: 'III também é correta no contexto.' },
          { label: 'C — II e III', detail: 'Esquece a dúvida das interrogações.', correct: 'I também vale — dúvida do personagem.' },
          { label: 'E — só III', detail: 'Reduz tudo à oralidade.', correct: 'I e II têm leituras corretas.' },
          { label: 'Em outra banca…', detail: 'Podem usar charge em vez de tirinha.', correct: 'Mesmo método: função de cada sinal no texto.' },
        ],
        footer_rule: 'D passa: I, II e III.',
      },
    ],
  },

  'avancasp-aae-pref-potim-pontuacao-rita-3839712': {
    family: 'conceito',
    use_anchor_payload: true,
    source_tec_id: '3839712',
    source_note: 'Vocativo Rita — AVANÇASP AAE Potim 2026 tec 3839712 · âncora M08',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AAE (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: '',
    options: [],
    slides: [],
  },

  'avancasp-potim-pontuacao-travessao-dois-pontos-3839857': {
    family: 'text_fragment',
    source_tec_id: '3839857',
    source_note: 'Travessão × dois-pontos Rubem Braga — AVANÇASP Potim 2026 tec 3839857',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o trecho a seguir.\n\n«Digo, mas não acredito, ou pelo menos desconfio que esse impulso que tive ao ler a notícia ficará no que foi — um impulso de fazer uma coisa boa e simples, que se perde no meio da pressa e da inquietação dos minutos que voam.»\n\nO travessão utilizado no trecho pode ser corretamente substituído por qual sinal de pontuação? Assinale a alternativa correta.',
    text_fragment:
      '<p><strong>Flor-de-maio</strong> (Rubem Braga — adaptado)</p><p>Entre tantas notícias do jornal — crimes, desastres, aumento do pão — há uma nota do Jardim Botânico: a flor-de-maio está em flor.</p><p>Suspiro e digo comigo mesmo que amanhã irei ao Jardim. Digo, mas não acredito que esse impulso ficará <strong>no que foi — um impulso de fazer uma coisa boa e simples</strong>, que se perde na pressa dos minutos que voam.</p>',
    options: [
      { id: 'A', text: 'Dois-pontos.', is_correct: true },
      { id: 'B', text: 'Ponto-final.', is_correct: false },
      { id: 'C', text: 'Ponto de exclamação.', is_correct: false },
      { id: 'D', text: 'Ponto de interrogação.', is_correct: false },
      { id: 'E', text: 'Aspas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Travessão ou dois-pontos?',
        meta: slideMeta,
        items: [
          { label: 'Notícias do jornal', detail: 'Crimes, desastres, aumento do pão — contraste com flor-de-maio.', icon: 'Newspaper' },
          { label: 'Flor-de-maio', detail: 'Rubem Braga: notícia do Jardim Botânico.', icon: 'Flower' },
          { label: 'Impulso perdido', detail: '«ficará no que foi — um impulso…» — 2ª parte explica.', icon: 'ArrowRight' },
          { label: 'Dois-pontos', detail: 'Substitui travessão — anuncia explicação.', icon: 'CircleDot' },
        ],
        footer_rule: 'Explicação após ideia geral → dois-pontos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Rubem Braga: notícias do jornal, crimes, desastres — impulso que se perde.',
          'Trecho: «ficará no que foi — um impulso…» — 2ª parte explica a 1ª.',
          'B: ponto-final cortaria a explicação essencial.',
          'C/D: exclamação/interrogação não explicam — mudam o tom.',
          'E: aspas marcam citação, não esclarecimento interno.',
          'A: dois-pontos anunciam o esclarecimento do impulso.',
          'Gabarito A.',
          'Em similares: travessão explicativo pode virar «:» sem mudar sentido.',
        ],
        footer_rule: 'A = dois-pontos no lugar do travessão.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRAVESSÃO × :',
        rows: [
          { label: 'Explicar', value: 'travessão ou dois-pontos' },
          { label: 'Encerrar', value: 'ponto-final — não aqui' },
          { label: 'Citar', value: 'aspas — outro uso' },
          { label: 'Nesta questão', value: 'A — Dois-pontos' },
        ],
        footer_rule: 'Ideia + explicação = «:» ou travessão.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sinais que mudam o sentido',
        items: [
          { label: 'B — ponto-final', detail: 'Parece fechar a frase cedo.', correct: 'Cortaria «um impulso de fazer…».' },
          { label: 'C — exclamação', detail: 'Tom emotivo do texto confunde.', correct: 'Não é ênfase — é explicação.' },
          { label: 'D — interrogação', detail: 'Desconfiança do narrador confunde.', correct: 'Não há pergunta na 2ª parte.' },
          { label: 'E — aspas', detail: 'Crônica parece citação.', correct: 'Trecho não reproduz fala alheia.' },
          { label: 'Em outra banca…', detail: 'Trocam travessão por parênteses.', correct: 'Parênteses também explicam — «:» é gabarito.' },
        ],
        footer_rule: 'A passa: Dois-pontos.',
      },
    ],
  },

  'aocp-unirio-pontuacao-enumeracao-3840868': {
    family: 'text_fragment',
    source_tec_id: '3840868',
    source_note: 'Enumeração vírgulas — AOCP UNIRIO 2026 tec 3840868',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAssinale a alternativa em que o emprego das vírgulas é obrigatório porque elas separam uma sequência de itens de mesmo estatuto sintático.',
    text_fragment:
      '<p><strong>Bons motivos para não se levar tão a sério</strong> (Folha de S.Paulo, 2025 — adaptado)</p><p>Brincar traz benefícios à saúde e fortalece laços. Stuart Brown defende que o déficit de brincadeiras entre adultos é crise de saúde pública.</p><p>Segundo Brown, brincar desenvolve <strong>adaptabilidade, inteligência, criatividade</strong> e capacidade de resolver problemas — habilidades essenciais em tempos difíceis.</p>',
    options: [
      {
        id: 'A',
        text: '«[...] e, por isso, têm ganhado espaço em um mercado cada vez mais guiado pela nostalgia [...]».',
        is_correct: false,
      },
      {
        id: 'B',
        text: '«[...] brincar ainda é uma forma eficiente de desenvolver a adaptabilidade, a inteligência, a criatividade [...]».',
        is_correct: true,
      },
      {
        id: 'C',
        text: '«[...] algo que, convenhamos, anda cada vez mais raro.»',
        is_correct: false,
      },
      {
        id: 'D',
        text: '«Embora compartilhar nas redes o que tem feito você se divertir seja legal, inclusive para inspirar outras pessoas, viver uma experiência [...]».',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«[...] muitas vezes, durante essas atividades lúdicas, aprendemos a compartilhar [...]».',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Enumeração no trilho',
        meta: slideMeta,
        items: [
          { label: 'Stuart Brown', detail: 'Texto Folha: brincar desenvolve habilidades.', icon: 'Brain' },
          { label: 'Adaptabilidade', detail: 'Lista com inteligência e criatividade — enumeração.', icon: 'List' },
          { label: 'Vírgula obrigatória', detail: 'Separa termos de mesma função sintática.', icon: 'Check' },
          { label: 'Pegadinha A', detail: '«e, por isso,» — oração intercalada, não lista.', icon: 'GitBranch' },
        ],
        footer_rule: 'Mesma função sintática → vírgula entre itens.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Folha: Stuart Brown — adaptabilidade, inteligência, criatividade.',
          'A: «e, por isso,» — vírgulas isolam oração, não listam termos.',
          'C: «convenhamos» intercalado — função de inciso, não lista.',
          'D/E: vírgulas separam orações ou adjuntos — não enumeração pura.',
          'B: adaptabilidade, inteligência, criatividade — três objetos de «desenvolver».',
          'Gabarito B — enumeração de complementos nominais.',
          'Em similares: nomeie a função de cada termo entre vírgulas.',
        ],
        footer_rule: 'B = itens de mesma função sintática.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ENUMERAÇÃO',
        rows: [
          { label: 'Regra', value: 'vírgula entre itens de mesma função' },
          { label: 'Exemplo', value: 'pão, leite e café' },
          { label: 'Não é', value: 'oração intercalada ou vocativo' },
          { label: 'Nesta questão', value: 'B — adaptabilidade, inteligência, criatividade' },
        ],
        footer_rule: 'Lista coordenada = vírgulas obrigatórias.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgulas com outras funções',
        items: [
          { label: 'A — por isso', detail: 'Parece enumeração de ideias.', correct: 'Oração intercalada «por isso».' },
          { label: 'C — convenhamos', detail: 'Vírgulas dos dois lados.', correct: 'Inciso explicativo, não lista.' },
          { label: 'D — Embora…', detail: 'Muitas vírgulas no período.', correct: 'Separam orações, não itens iguais.' },
          { label: 'E — muitas vezes', detail: 'Advérbio deslocado no início.', correct: 'Adjunto adverbial, não enumeração.' },
          { label: 'Em outra banca…', detail: 'Trocam substantivos por verbos.', correct: 'Mesmo teste: mesma função sintática?' },
        ],
        footer_rule: 'B passa: enumeração de substantivos.',
      },
    ],
  },

  'selecon-porto-gauchos-pontuacao-adjunto-3852273': {
    family: 'text_fragment',
    source_tec_id: '3852273',
    source_note: 'Vírgula adjunto deslocado — SELECON Porto dos Gaúchos 2026 tec 3852273',
    meta: {
      banca: 'SELECON',
      prova: 'Recep (CM Porto dos Gaúchos)',
      orgao: 'CM Porto dos Gaúchos',
      ano: '2026',
    },
    instruction:
      'Leia o texto a seguir.\n\n«De acordo com Soo-jong, a Innospace está analisando os dados de voo, rastreamento e monitoramento em cooperação com as autoridades competentes, além de conduzir revisão técnica para entender o que levou à falha» (7º parágrafo).\n\nA vírgula empregada após o termo em destaque serve para indicar:',
    text_fragment:
      '<p><strong>CEO da Innospace pede desculpas por falha em Alcântara</strong></p><p>Kim Soo-jong lamentou a anomalia que fez o foguete HANBIT-Nano cair pouco após a decolagem na Base de Alcântara. A FAB confirmou que não houve feridos.</p><p><strong>De acordo com Soo-jong,</strong> a Innospace analisa dados de voo e conduz revisão técnica para entender a falha.</p><p><em>Adaptado de notícia, dez. 2023</em></p>',
    options: [
      { id: 'A', text: 'adjunto adverbial deslocado.', is_correct: true },
      { id: 'B', text: 'uma enumeração de itens.', is_correct: false },
      { id: 'C', text: 'um aposto explicativo.', is_correct: false },
      { id: 'D', text: 'um vocativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula após Soo-jong',
        meta: slideMeta,
        items: [
          { label: 'Soo-jong / Innospace', detail: 'CEO analisa dados de voo após falha em Alcântara.', icon: 'Rocket' },
          { label: 'Vírgula após nome', detail: '«De acordo com Soo-jong,» — adjunto anteposto.', icon: 'ScanSearch' },
          { label: 'Revisão técnica', detail: 'Período explica análise da falha do foguete.', icon: 'Wrench' },
          { label: 'Não é vocativo', detail: 'Soo-jong não é chamado — é referência.', icon: 'UserX' },
        ],
        footer_rule: 'Termo deslocado → vírgula depois dele.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: foguete HANBIT-Nano em Alcântara — Soo-jong analisa dados de voo.',
          'Citação 7º parágrafo: revisão técnica para entender a falha.',
          'B: enumeração — não há lista de itens após a vírgula.',
          'C: aposto — não nomeia nem explica «Soo-jong» como aposto.',
          'D: vocativo — não há chamamento ao interlocutor.',
          'A: «De acordo com Soo-jong» = adjunto adverbial anteposto.',
          'Gabarito A.',
          'Em similares: o que a vírgula isola? deslocado = adjunto.',
        ],
        footer_rule: 'A = adjunto adverbial deslocado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TERMO DESLOCADO',
        rows: [
          { label: 'Anteposto', value: '«Segundo X,» / «De acordo com X,»' },
          { label: 'Vírgula', value: 'isola o adjunto deslocado' },
          { label: 'Vocativo', value: 'chama alguém — não é o caso' },
          { label: 'Nesta questão', value: 'A — adjunto adverbial' },
        ],
        footer_rule: 'Adjunto no início → vírgula após ele.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Funções trocadas após o nome',
        items: [
          { label: 'B — enumeração', detail: 'Vírgulas no período parecem lista.', correct: 'Não há itens coordenados após Soo-jong.' },
          { label: 'C — aposto', detail: 'Nome próprio parece explicado.', correct: '«De acordo com» indica conformidade, não aposto.' },
          { label: 'D — vocativo', detail: 'Nome isolado parece chamamento.', correct: 'Não se dirige fala a Soo-jong.' },
          { label: 'Em outra banca…', detail: 'Trocam «Soo-jong» por «o CEO».', correct: 'Mesma regra: adjunto anteposto + vírgula.' },
        ],
        footer_rule: 'A passa: adjunto adverbial deslocado.',
      },
    ],
  },

  'cpcon-cuite-pontuacao-enumeracao-numeros-3912868': {
    family: 'conceito',
    source_tec_id: '3912868',
    source_note: 'Enumeração números avó — CPCON ACS Cuité 2026 tec 3912868',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Cuité)',
      orgao: 'Pref. Cuité',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto II para responder à questão.\n\nSobre as regras de pontuação, observe a fala da avó: «É \'cinco, quatro, três, dois, um\'(...)».\n\nO uso das vírgulas, no contexto do trecho, pode ser justificado:',
    options: [
      { id: 'A', text: 'para separar ideias diferentes.', is_correct: false },
      { id: 'B', text: 'para separar termos com mesma função sintática.', is_correct: true },
      { id: 'C', text: 'para separar orações intercaladas.', is_correct: false },
      { id: 'D', text: 'para contribuir com a sonoridade do texto.', is_correct: false },
      { id: 'E', text: 'para separar termos com funções distintas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Contagem: enumeração',
        meta: slideMeta,
        items: [
          { label: 'Trecho', detail: '«cinco, quatro, três, dois, um» — sequência de números.', icon: 'Hash' },
          { label: 'Mesma função', detail: 'Cada algarismo/nome numeral = item da contagem regressiva.', icon: 'List' },
          { label: 'Não é oração', detail: 'Sem verbos intercalados — só termos coordenados.', icon: 'Minus' },
          { label: 'Sonoridade', detail: 'Ritmo oral existe, mas a norma cobra função sintática.', icon: 'Music' },
        ],
        footer_rule: 'Números em série = enumeração.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Avó conta regressivamente: cinco até um.',
          'A: ideias diferentes — são itens da mesma contagem.',
          'C: orações intercaladas — não há oração no meio.',
          'D: sonoridade — pausa oral não explica a regra da prova.',
          'E: funções distintas — todos são numerais na mesma série.',
          'B: mesma função sintática — enumeração de termos.',
          'Gabarito B.',
          'Em similares: série de itens iguais → vírgula entre eles.',
        ],
        footer_rule: 'B = termos de mesma função.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ENUMERAÇÃO',
        rows: [
          { label: 'Regra', value: 'vírgula entre itens de mesma função' },
          { label: 'Exemplo', value: 'cinco, quatro, três, dois, um' },
          { label: 'Evite', value: 'sonoridade ou ideias distintas (pegadinhas)' },
          { label: 'Nesta questão', value: 'B' },
        ],
        footer_rule: 'Contagem = enumeração coordenada.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Justificativas vagas da banca',
        items: [
          { label: 'A — ideias diferentes', detail: 'Cada número parece ideia nova.', correct: 'São termos da mesma série numérica.' },
          { label: 'C — orações', detail: 'Fala oral parece período composto.', correct: 'Só numerais coordenados — sem oração.' },
          { label: 'D — sonoridade', detail: 'Contagem tem ritmo — tenta seduzir.', correct: 'Prova cobra função sintática, não som.' },
          { label: 'E — funções distintas', detail: 'Números diferentes confundem.', correct: 'Função igual: numeral na enumeração.' },
          { label: 'Em outra banca…', detail: 'Trocam por dias da semana.', correct: 'Mesma regra: segunda, terça, quarta…' },
        ],
        footer_rule: 'B passa: mesma função sintática.',
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
