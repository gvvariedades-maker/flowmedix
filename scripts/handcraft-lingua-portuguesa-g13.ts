#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g13 (8 slugs · Pontuação · lote 6/6 · 48/48).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g13.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g13 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g13 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';

const LOTE = 'lingua-portuguesa-g13';
const SUBTOPICO = 'Pontuação';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_pontuacao';
const REVIEWED = '2026-07-20';

const GOLDEN_REFERENCES = {
  eliminacao: 'examples/questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json',
  vf: 'examples/questao-premium-cpcon-portugues-pontuacao-tirinha-vf.json',
} as const;

type AnchorStyle = keyof typeof GOLDEN_REFERENCES;

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
    'adjunto-deslocado',
    'travessao',
    'dois-pontos',
    'coordenada-anteposta',
    'adverbial-anteposta',
    'termo-deslocado',
    'virgula-facultativa',
    'discurso-direto',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment' | 'vf';

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
  exam_vs_current?: string;
};

const slideMeta = { topico: TOPICO, subtopico: SUBTOPICO };

function metaBase(spec: Spec, slug: string) {
  const anchorStyle = spec.anchor_style ?? 'eliminacao';
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
      reviewer: 'handcraft:lingua-portuguesa-g13',
      guideline_snapshot: `${PT_PONTUACAO.snapshot} · âncora ${anchorStyle} → ${goldenReference}`,
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

const MEMORIA_DOIS_PONTOS_FRAGMENT =
  '<p><strong>Memória e anotações</strong> — Luís Fernando Verissimo (Estadão, 2011, adaptado)</p>' +
  '<p>Crônica sobre esquecimento, bloco de notas e ideias fugidas — a escrita nasceu da necessidade de não esquecer.</p>' +
  '<p><strong>Penúltimo período:</strong> «Mas geralmente se pensa o contrário: as melhores ideias são as que a gente esqueceu.»</p>' +
  '<p>Os <strong>dois-pontos</strong> após «o contrário» introduzem esclarecimento sobre o que se pensa — função explicativa.</p>';

const MEME_FRAGMENT =
  '<p><strong>Meme de nostalgia</strong> (formato pergunta + resposta, adaptado)</p>' +
  '<p>Estrutura típica: pergunta nostálgica com <strong>ponto de interrogação</strong> («Você lembra disso?») ' +
  'seguida de resposta direta que confirma ou nega a lembrança.</p>' +
  '<p>A interrogação marca <strong>interrogatividade</strong> e pode sugerir dúvida quanto à veracidade ou nitidez da memória relatada.</p>';

const CHOCOLATE_FRAGMENT =
  '<p><strong>Chocolate faz bem para a saúde?</strong> — Fabricio Alves Ferreira (adaptado)</p>' +
  '<p>Texto informativo sobre cacau, história e efeitos do chocolate.</p>' +
  '<p><strong>Trecho em foco:</strong> «Mas o que para alguns é um prazer incontrolável, para outros se constitui em uma tentação, ' +
  'principalmente para os que querem emagrecer.»</p>' +
  '<p>Estrutura <strong>contrastiva</strong> «para alguns… para outros» — vírgulas delimitam segmentos explicativos e isolam termos intercalados.</p>';

const SPECS: Record<string, Spec> = {
  'cebraspe-boa-vista-pontuacao-dois-pontos-3705151': {
    family: 'text_fragment',
    anchor_style: 'eliminacao',
    source_tec_id: '3705151',
    source_note: 'Dois-pontos esclarecimento — CEBRASPE Ass Tec Sau Pref Boa Vista 2025 tec 3705151',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ass Tec Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto CG2A1 de Luís Fernando Verissimo.\n\n' +
      'O sinal de dois-pontos no penúltimo período do texto CG2A1 está empregado com a finalidade de',
    text_fragment: MEMORIA_DOIS_PONTOS_FRAGMENT,
    options: [
      { id: 'A', text: 'exemplificar uma ideia.', is_correct: false },
      { id: 'B', text: 'apresentar uma citação.', is_correct: false },
      { id: 'C', text: 'esclarecer uma ideia.', is_correct: true },
      { id: 'D', text: 'resumir uma ideia.', is_correct: false },
      { id: 'E', text: 'introduzir uma enumeração.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois-pontos no penúltimo período',
        chip_label: 'Esclarecer ou enumerar?',
        meta: slideMeta,
        items: [
          { label: 'Memoria e anotacoes', detail: 'Verissimo — penultimo periodo com «o contrario: …»', icon: 'FileText' },
          { label: 'Esquecimento', detail: 'Crônica sobre notas, ideias fugidas e angustia de esquecer.', icon: 'BookOpen' },
          { label: 'C — gabarito', detail: 'Dois-pontos esclarecem a ideia anterior.', icon: 'Check' },
          { label: 'Pontuação', detail: 'Esclarecimento explicativo — não enumeração nem citação.', icon: 'Quote' },
        ],
        footer_rule: 'Pontuação: dois-pontos explicam o termo ou ideia que os precede.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Função dos dois-pontos',
        meta: slideMeta,
        steps: [
          'Texto Verissimo Memoria e anotacoes: penultimo periodo com «o contrario: as melhores ideias…»',
          'Após os dois-pontos vem esclarecimento do que significa «pensar o contrário».',
          'A: não exemplifica — explica uma ideia abstrata.',
          'B: não apresenta citação — continua o raciocínio do autor.',
          'D: não resume — desenvolve o pensamento oposto.',
          'E: não enumera itens — uma única oração explicativa.',
          'C: dois-pontos introduzem esclarecimento sobre «o contrário».',
          'Teste: o que vem depois? Explica, cita, enumera ou resume?',
          'Gabarito C.',
          'Em similares: penúltimo período Verissimo — dois-pontos esclarecem, não enumeram.',
        ],
        footer_rule: 'C = esclarecer uma ideia.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOIS-PONTOS — ESCLARECIMENTO',
        rows: [
          { label: 'Esclarecer', value: '«pensa o contrário: as melhores ideias…»' },
          { label: 'Enumeração', value: '«Há três motivos: A, B e C»' },
          { label: 'Citação', value: '«disse o autor: "trecho literal"»' },
        ],
        footer_rule: 'Pergunta-teste: explica, enumera ou cita?',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir explicação com enumeração ou citação',
        items: [
          { label: 'A — exemplificar', detail: 'Não traz exemplo concreto isolado.', correct: 'Função explicativa — esclarece «o contrário», não exemplifica.' },
          { label: 'B — citação', detail: 'Trecho continua o pensamento do narrador.', correct: 'Sem fala de terceiro — não é citação direta.' },
          { label: 'D — resumir', detail: 'O trecho desenvolve, não condensa.', correct: 'Esclarece a ideia oposta — não resume período anterior.' },
          { label: 'E — enumeração', detail: 'Só uma oração após «:».', correct: 'Não há lista de itens — oração explicativa única.' },
          { label: 'Em outra banca…', detail: 'Podem usar «angústia primordial: perder o pensamento».', correct: 'Mesmo teste: explica o termo anterior ou lista itens?' },
        ],
        footer_rule: 'C passa: esclarecimento de «o contrário».',
      },
    ],
  },

  'educapb-sj-rio-peixe-pontuacao-meme-3711365': {
    family: 'text_fragment',
    anchor_style: 'eliminacao',
    source_tec_id: '3711365',
    source_note: 'Interrogação e meme nostalgia — EDUCA PB Ag Adm Pref SJ Rio do Peixe 2025 tec 3711365',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref SJ Rio do Peixe)',
      orgao: 'Pref. SJ Rio do Peixe',
      ano: '2025',
    },
    instruction:
      'Leia o texto sobre o meme de nostalgia.\n\n' +
      'O meme traz uma pergunta e, em seguida, a resposta. Pensando nisso, a pontuação empregada contribui para a construção do efeito de sentido da seguinte forma:',
    text_fragment: MEME_FRAGMENT,
    options: [
      {
        id: 'A',
        text: 'O ponto de interrogação indica dúvida quanto à veracidade da lembrança relatada.',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'A ausência de pontuação na resposta compromete a coerência do meme.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'O uso da pergunta e da resposta indicam a estrutura de uma crônica humorística.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A pontuação organiza a interação entre personagem e leitor, sendo a pergunta um convite à identificação e a resposta, direta e informal, reforça o tom cômico.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'O uso do ponto de interrogação quebra a lógica textual e prejudica o entendimento da imagem.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Interrogação no meme',
        chip_label: 'Pergunta nostálgica',
        meta: slideMeta,
        items: [
          { label: 'Formato', detail: 'Pergunta + resposta — estrutura binária do meme.', icon: 'MessageCircle' },
          { label: 'Interrogação', detail: 'Marca dúvida ou consulta sobre a lembrança.', icon: 'HelpCircle' },
          { label: 'A — gabarito', detail: '«?» pode indicar dúvida quanto à veracidade da memória.', icon: 'Check' },
          { label: 'Efeito', detail: 'Convida o leitor a questionar se realmente lembra.', icon: 'Users' },
        ],
        footer_rule: 'Interrogação = interrogatividade (dúvida ou pergunta).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Meme: pergunta nostálgica com «?» + resposta direta.',
          'Comando: como a pontuação constrói o efeito de sentido.',
          'B: resposta sem pontuação não quebra coerência do formato meme.',
          'C: não é crônica literária — gênero digital/humorístico.',
          'D: parcialmente plausível, mas banca aponta função da interrogação sobre a memória.',
          'E: interrogação não quebra lógica — é recurso central do meme.',
          'A: ponto de interrogação indica dúvida quanto à veracidade da lembrança.',
          'Gabarito A.',
        ],
        footer_rule: 'A = dúvida sobre a lembrança.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PONTO DE INTERROGAÇÃO',
        rows: [
          { label: 'Função', value: 'Marca pergunta ou dúvida' },
          { label: 'Meme', value: '«Você lembra?» → dúvida sobre nitidez/veracidade da memória' },
          { label: '≠ incoerência', value: 'Interrogação organiza o efeito — não quebra' },
        ],
        footer_rule: '«?» = interrogatividade no formato pergunta-resposta.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Atribuir funções que não são da interrogação',
        items: [
          { label: 'B — ausência na resposta', detail: 'Resposta curta dispensa pontuação formal.', correct: 'Coerência mantida — resposta direta é norma do meme.' },
          { label: 'C — crônica', detail: 'Gênero digital, não crônica literária.', correct: 'Estrutura pergunta-resposta ≠ crônica humorística clássica.' },
          { label: 'D — personagem e leitor', detail: 'Foco parcial; banca pede função da «?» sobre memória.', correct: 'Alternativa sedutora — gabarito aponta dúvida sobre veracidade.' },
          { label: 'E — quebra lógica', detail: 'Interrogação é recurso central do meme.', correct: '«?» organiza o efeito — não prejudica entendimento.' },
          { label: 'Em outra banca…', detail: 'Podem trocar «lembrança» por «infância».', correct: 'Mesmo teste: «?» marca dúvida ou outra função?' },
        ],
        footer_rule: 'A passa: dúvida sobre a lembrança.',
      },
    ],
  },

  'quadrix-fuabc-pontuacao-virgula-facultativa-3721193': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3721193',
    source_note: 'Vírgula facultativa PNI — QUADRIX Aux FUABC 2025 tec 3721193',
    meta: {
      banca: 'QUADRIX',
      prova: 'Aux (FUABC)',
      orgao: 'FUABC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Com relação ao conteúdo textual sobre imunização e o PNI, assinale a opção cuja reescrita do trecho apresenta emprego facultativo de vírgulas.',
    options: [
      {
        id: 'A',
        text: 'Entre as formas de imunização a vacinação é reconhecida como uma das mais eficazes estratégias para preservar a saúde da população e manter uma sociedade saudável e resistente.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Estabelecido em 1973 o PNI desempenha um papel fundamental na promoção da saúde da população brasileira.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'O calendário nacional de vacinação contempla na rotina dos serviços 19 vacinas que protegem o indivíduo em todos os ciclos de vida desde o nascimento.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Entre as doenças imunopreveníveis por essas vacinas, estão a poliomielite, o sarampo, a rubéola, o tétano, a coqueluche e outras doenças graves e muitas vezes fatais.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Assim o Ministério da Saúde atua em conjunto com os estados os municípios e o Distrito Federal para garantir o acesso equitativo às vacinas em todo o País.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula facultativa',
        chip_label: 'Obrigatória × opcional',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Reescrita com emprego facultativo de vírgulas.', icon: 'Search' },
          { label: 'D — gabarito', detail: 'Vírgula antes de «e muitas vezes» é opcional na enumeração.', icon: 'Check' },
          { label: 'Enumeração', detail: '«coqueluche e outras doenças graves e muitas vezes fatais».', icon: 'List' },
          { label: 'Facultativa', detail: 'Pode escrever «graves, e muitas vezes, fatais» ou sem vírgula.', icon: 'Info' },
        ],
        footer_rule: 'Facultativa = norma aceita com ou sem vírgula.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: reescrita com emprego facultativo (opcional) de vírgulas.',
          'A: falta vírgula após «imunização» — adjunto mal separado; não é facultativa.',
          'B: falta vírgula após «1973» — oração reduzida exige vírgula obrigatória.',
          'C: faltam vírgulas em adjuntos e enumeração — erros, não facultativas.',
          'E: faltam vírgulas em «Assim,» e na enumeração estados/municípios.',
          'D: «graves e muitas vezes fatais» — vírgula antes de «e muitas vezes» é facultativa.',
          'Original do texto usava «graves e, muitas vezes, fatais» — reescrita sem vírgula também é correta.',
          'Gabarito D.',
        ],
        footer_rule: 'D = vírgula facultativa na enumeração.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VÍRGULA FACULTATIVA',
        rows: [
          { label: 'Facultativa', value: 'Aceita presença ou ausência sem erro' },
          { label: 'Exemplo D', value: '«graves e muitas vezes fatais» ou «graves, e muitas vezes, fatais»' },
          { label: 'Obrigatória', value: '«Estabelecido em 1973, o PNI» — oração reduzida' },
        ],
        footer_rule: 'Facultativa ≠ ausência de vírgula obrigatória.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir facultativa com omissão obrigatória',
        items: [
          { label: 'A — imunização a vacinação', detail: 'Falta vírgula após termo anteposto.', correct: '«Entre as formas de imunização, a vacinação» — vírgula necessária, não facultativa.' },
          { label: 'B — Estabelecido em 1973', detail: 'Oração reduzida de participio exige vírgula.', correct: 'Vírgula obrigatória após «1973» — omissão é erro.' },
          { label: 'C — calendário contempla', detail: 'Adjuntos e enumeração mal pontuados.', correct: 'Faltam vírgulas obrigatórias — não é emprego facultativo.' },
          { label: 'E — Assim o Ministério', detail: 'Advérbio «Assim» e enumeração exigem vírgulas.', correct: '«Assim,» e «estados, os municípios» — omissões, não facultativas.' },
          { label: 'Em outra banca…', detail: 'Podem pedir vírgula obrigatória em oração reduzida.', correct: 'Mesmo teste: opcional ou omissão de vírgula necessária?' },
        ],
        footer_rule: 'D passa: «e muitas vezes» com vírgula facultativa.',
      },
    ],
  },

  'avancasp-varginha-pontuacao-reescrita-erico-3726048': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3726048',
    source_note: 'Reescrita Érico Veríssimo — AVANÇASP TLab Pref Varginha 2025 tec 3726048',
    meta: {
      banca: 'AVANÇASP',
      prova: 'TLab (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Na véspera à noite notara-se uma certa alegria talvez um tanto infantil quando as luzes as lâmpadas das ruas tornaram a acender-se finda a greve» (Érico Veríssimo)\n\n' +
      'No trecho acima, foram retirados os sinais de pontuação. Assinale a alternativa que apresenta uma forma reescrita do mesmo trecho com a pontuação totalmente correta.',
    options: [
      {
        id: 'A',
        text: 'Na véspera à noite, notara-se uma certa alegria, talvez um tanto infantil quando, as luzes das lâmpadas das ruas tornaram a acender-se, finda a greve.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Na véspera, à noite, notara-se uma certa alegria – talvez um tanto infantil – quando as luzes das lâmpadas das ruas tornaram a acender-se, finda a greve.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Na véspera, à noite, notara-se uma certa alegria, talvez um tanto infantil, quando as luzes das lâmpadas das ruas, tornaram a acender-se finda a greve.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Na véspera à noite notara-se, uma certa alegria (talvez um tanto infantil quando as luzes das lâmpadas das ruas tornaram a acender-se) finda a greve.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Na véspera – à noite – notara-se uma certa alegria: talvez um tanto infantil quando as luzes das lâmpadas das ruas, tornaram a acender-se, finda a greve.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reescrita Érico Veríssimo',
        chip_label: 'Travessão × vírgula',
        meta: slideMeta,
        items: [
          { label: 'Original', detail: 'Trecho sem pontuação — greve e luzes das ruas.', icon: 'FileText' },
          { label: 'B — gabarito', detail: '«Na véspera, à noite,» + travessões + «finda a greve».', icon: 'Check' },
          { label: 'Travessões', detail: '«– talvez um tanto infantil –» isola termo intercalado.', icon: 'Minus' },
          { label: 'Oração final', detail: '«finda a greve» — oração reduzida no final.', icon: 'Clock' },
        ],
        footer_rule: 'Travessão isola aposto/inciso; vírgula separa adjuntos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho Érico sem pontuação — reescrita com sinais corretos.',
          'A: «quando, as luzes» — vírgula indevida após «quando»; «véspera à noite» sem vírgula interna.',
          'C: «luzes das lâmpadas das ruas, tornaram» — vírgula entre sujeito e verbo.',
          'D: parênteses mal fechados; «notara-se, uma certa alegria» — sujeito|verbo cortado.',
          'E: travessões em «véspera – à noite» inadequados; dois-pontos onde basta travessão.',
          'B: «Na véspera, à noite,» — adjuntos temporais; travessões em «talvez um tanto infantil».',
          '«tornaram a acender-se, finda a greve» — oração reduzida final bem pontuada.',
          'Gabarito B.',
        ],
        footer_rule: 'B = única reescrita totalmente correta.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REESCRITA — ÉRICO',
        rows: [
          { label: 'Adjuntos', value: '«Na véspera, à noite, notara-se»' },
          { label: 'Travessão', value: '«alegria – talvez um tanto infantil – quando»' },
          { label: 'Evitar', value: 'sujeito|verbo · «quando,» · parêntese mal fechado' },
        ],
        footer_rule: 'Reescrita: sentido + norma culta.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgulas a mais ou sinal inadequado',
        items: [
          { label: 'A — quando, as luzes', detail: 'Vírgula após conjunção integrante.', correct: '«quando as luzes» — sem vírgula entre «quando» e sujeito.' },
          { label: 'C — ruas, tornaram', detail: 'Vírgula entre sujeito e verbo.', correct: '«as luzes… tornaram» — sujeito|verbo sem vírgula.' },
          { label: 'D — parênteses', detail: 'Inciso mal delimitado; sujeito cortado.', correct: 'Parêntese não substitui travessão aqui; «notara-se uma certa alegria» sem vírgula.' },
          { label: 'E — véspera – à noite', detail: 'Travessão onde basta vírgula; dois-pontos inadequado.', correct: 'Adjuntos temporais → vírgulas, não travessões + dois-pontos.' },
          { label: 'Em outra banca…', detail: 'Podem trocar «finda a greve» por «terminada a greve».', correct: 'Mesmo teste: oração reduzida final bem pontuada?' },
        ],
        footer_rule: 'B passa: travessões + vírgulas corretas.',
      },
    ],
  },

  'avancasp-varginha-pontuacao-reescrita-coragem-3727507': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3727507',
    source_note: 'Reescrita coragem travessão — AVANÇASP ACre Pref Varginha 2025 tec 3727507',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«A vida parece cruel aos olhos de alguns homens, mas o que ela requer de todo mundo é coragem. ' +
      'Coragem para continuar e não desistir jamais de realizar grandes feitos.»\n\n' +
      'Assinale a alternativa que reescreve corretamente o trecho sobre coragem, com emprego adequado dos sinais de pontuação.',
    options: [
      {
        id: 'A',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer, de todo mundo é coragem – coragem para continuar e não desistir jamais de realizar grandes feitos.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer de todo mundo é coragem – coragem para continuar e não desistir, jamais, de realizar grandes feitos.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer de todo mundo, é coragem; coragem para continuar e não desistir jamais de realizar grandes feitos.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer, de todo mundo, é coragem, coragem para continuar e não desistir jamais, de realizar grandes feitos.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A vida parece cruel, aos olhos de alguns homens, mas o que ela requer, de todo mundo é coragem; coragem, para continuar e não desistir jamais de realizar grandes feitos.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reescrita: trecho sobre coragem',
        chip_label: 'Travessão + «jamais»',
        meta: slideMeta,
        items: [
          { label: 'Tema', detail: 'Coragem exigida pela vida — dois períodos originais.', icon: 'Heart' },
          { label: 'B — gabarito', detail: 'Travessão retoma «coragem»; «jamais» entre vírgulas.', icon: 'Check' },
          { label: 'Travessão', detail: '«é coragem – coragem para continuar…» — aposto/explicação.', icon: 'Minus' },
          { label: 'jamais', detail: 'Advérbio intercalado: «não desistir, jamais, de realizar».', icon: 'Clock' },
        ],
        footer_rule: 'Travessão retoma termo; advérbio deslocado → vírgulas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho sobre coragem em dois períodos — reescrita com nova pontuação.',
          'A: «requer, de todo mundo é» — vírgula entre verbo e complemento. Erro.',
          'C: «todo mundo, é coragem» — vírgula antes de «é»; ponto e vírgula inadequado.',
          'D: vírgulas em excesso («de todo mundo,» · «coragem, coragem» · «jamais, de»).',
          'E: «cruel, aos olhos» corta locução; «coragem, para continuar» isola prep.',
          'B: travessão explica «coragem»; «jamais» isolado entre vírgulas.',
          '«não desistir, jamais, de realizar grandes feitos» — advérbio bem intercalado.',
          'Gabarito B.',
        ],
        footer_rule: 'B = reescrita correta do trecho sobre coragem.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CORAGEM — REESCRITA',
        rows: [
          { label: 'Travessão', value: '«é coragem – coragem para continuar…»' },
          { label: 'Advérbio', value: '«não desistir, jamais, de realizar»' },
          { label: 'Evitar', value: 'verbo|OD · sujeito|verbo · «, é coragem»' },
        ],
        footer_rule: 'Reescrita: travessão + termo deslocado.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgulas a mais na reescrita',
        items: [
          { label: 'A — de todo mundo', detail: 'Vírgula entre verbo e complemento.', correct: '«requer de todo mundo» — sem vírgula interna.' },
          { label: 'C — ; coragem', detail: 'Ponto e vírgula onde basta travessão.', correct: 'Coordenação mal marcada; vírgula antes de «é».' },
          { label: 'D — coragem, coragem', detail: 'Duas vírgulas seguidas confundem aposto.', correct: 'Travessão basta para retomar «coragem».' },
          { label: 'E — cruel, aos olhos', detail: 'Isola locução adverbial indevidamente.', correct: '«cruel aos olhos de alguns homens» — sem corte.' },
          { label: 'Em outra banca…', detail: 'Podem trocar «jamais» por «nunca».', correct: 'Mesmo teste: advérbio intercalado ou trilho cortado?' },
        ],
        footer_rule: 'B passa: travessão + «jamais» intercalado.',
      },
    ],
  },

  'avancasp-cunha-pontuacao-correta-3738882': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3738882',
    source_note: 'Sentença totalmente correta — AVANÇASP ACO Pref Cunha 2025 tec 3738882',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACO (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa cuja sentença se apresenta totalmente correta em relação à pontuação.',
    options: [
      {
        id: 'A',
        text: 'Prefiro estar entre vocês que me acolheram que me entendem porque, nem todas as pessoas, apresentam esse desprendimento.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Existem sentimentos bons (como saudade, alegria, e existem sentimentos ruins – como tristeza e ódio) tudo forma o nosso caráter.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Disse o orador, em tom bastante alegre: “Meus amigos, é chegada a hora de, apesar dos protestos, iniciarmos o nosso jantar festivo”.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Ele me perguntou se era para eu ir também à festa? Sim eu respondi para ele, não se preocupar com essa questão.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Tudo – céu, estrelas, espaço sideral – tudo, é obra de incrível perfeição mas nós, não costumamos dar o devido valor.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sentença totalmente correta',
        chip_label: 'Dois-pontos + discurso direto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Única alternativa totalmente correta na pontuação.', icon: 'Search' },
          { label: 'C — gabarito', detail: 'Orador + dois-pontos + fala entre aspas.', icon: 'Check' },
          { label: 'Discurso direto', detail: '«Disse o orador…: "Meus amigos…"»', icon: 'Quote' },
          { label: 'Inciso', detail: '«de, apesar dos protestos, iniciarmos» — termo intercalado.', icon: 'ArrowLeftRight' },
        ],
        footer_rule: 'Dois-pontos introduzem fala; inciso entre vírgulas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sentença totalmente correta em pontuação.',
          'A: «porque, nem todas» — vírgula indevida; «que… que» sem vírgula entre orações.',
          'B: parêntese mal fechado; «alegria, e existem» — vírgula antes de «e» inadequada.',
          'D: pergunta indireta com «?»; «Sim eu respondi» — falta vírgula e pontuação.',
          'E: «tudo, é obra» — vírgula antes de verbo; «mas nós,» — sujeito|verbo cortado.',
          'C: verbo de enunciação + dois-pontos + discurso direto entre aspas.',
          '«de, apesar dos protestos, iniciarmos» — inciso bem isolado.',
          'Gabarito C.',
        ],
        footer_rule: 'C = orador + dois-pontos + fala direta.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DISCURSO DIRETO',
        rows: [
          { label: 'Estrutura', value: '«Disse o orador: "fala"» ou com inciso antes dos dois-pontos' },
          { label: 'Dois-pontos', value: 'Introduzem citação ou fala' },
          { label: 'Inciso', value: '«de, apesar dos protestos, iniciarmos»' },
        ],
        footer_rule: 'Verbo de enunciação + «:» + aspas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros clássicos de pontuação',
        items: [
          { label: 'A — porque, nem', detail: 'Vírgula separa conjunção de oração.', correct: '«porque nem todas» — sem vírgula após «porque».' },
          { label: 'B — parêntese', detail: 'Enumeração mal fechada; vírgula antes de «e».', correct: 'Parêntese desequilibrado; coordenação interna mal pontuada.' },
          { label: 'D — festa?', detail: 'Pergunta indireta não leva interrogação.', correct: '«perguntou se era…» — ponto final, não «?».' },
          { label: 'E — tudo, é', detail: 'Vírgula entre sujeito e verbo; «nós,» corta sujeito.', correct: '«tudo é obra» · «mas nós não costumamos» — sem vírgulas.' },
          { label: 'Em outra banca…', detail: 'Podem trocar «orador» por «presidente».', correct: 'Mesmo teste: dois-pontos + aspas ou erro de trilho?' },
        ],
        footer_rule: 'C passa: discurso direto correto.',
      },
    ],
  },

  'educapb-santa-cecilia-pontuacao-chocolate-3746565': {
    family: 'text_fragment',
    anchor_style: 'eliminacao',
    source_tec_id: '3746565',
    source_note: 'Vírgulas contrastivas chocolate — EDUCA PB ACD Pref Santa Cecília 2025 tec 3746565',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Santa Cecília)',
      orgao: 'Pref. Santa Cecília',
      ano: '2025',
    },
    instruction:
      'Leia o texto sobre chocolate.\n\n' +
      'Quanto ao uso das vírgulas no trecho «…Mas o que para alguns é um prazer incontrolável, para outros se constitui em uma tentação, ' +
      'principalmente para os que querem emagrecer», é CORRETO afirmar que:',
    text_fragment: CHOCOLATE_FRAGMENT,
    options: [
      {
        id: 'A',
        text: 'Elas delimitam elementos explicativos e isolam expressões intercaladas.',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'A vírgula antes de «para outros» deveria ser substituída por ponto e vírgula.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'A vírgula antes de «principalmente» é incorreta e poderia ser suprimida.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Todas as vírgulas poderiam ser substituídas por travessões sem prejuízo para o sentido.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estrutura contrastiva',
        chip_label: 'Para alguns × para outros',
        meta: slideMeta,
        items: [
          { label: 'Trecho', detail: '«para alguns… prazer…, para outros… tentação…»', icon: 'Scale' },
          { label: 'Contraste', detail: 'Oposição de posições sobre o chocolate.', icon: 'GitCompare' },
          { label: 'A — gabarito', detail: 'Vírgulas delimitam explicativos e intercalados.', icon: 'Check' },
          { label: 'principalmente', detail: '«principalmente para os que…» — adjunto final.', icon: 'Info' },
        ],
        footer_rule: 'Vírgulas separam segmentos explicativos no contraste.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho chocolate: contraste «para alguns… para outros…».',
          'Vírgulas separam blocos explicativos da oposição.',
          'B: ponto e vírgula não substitui vírgula aqui — coordenação interna.',
          'C: vírgula antes de «principalmente» pode marcar adjunto — não é erro.',
          'D: travessões não substituem todas as vírgulas sem alterar ritmo/norma.',
          'A: vírgulas delimitam elementos explicativos e isolam expressões intercaladas.',
          'Estrutura «o que para alguns…, para outros…, principalmente…».',
          'Gabarito A (4 alternativas A–D).',
          'Em similares: contraste «para alguns… para outros» → vírgulas delimitam blocos explicativos.',
        ],
        footer_rule: 'A = explicativos + intercalados.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VÍRGULA CONTRASTIVA',
        rows: [
          { label: 'Contraste', value: '«para alguns…, para outros…»' },
          { label: 'Explicativo', value: 'Segmentos que explicam «o que»' },
          { label: 'Adjunto final', value: '«principalmente para os que querem emagrecer»' },
        ],
        footer_rule: 'Contraste opositivo → vírgulas delimitam blocos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar vírgula por outro sinal',
        items: [
          { label: 'B — ponto e vírgula', detail: 'Coordenação interna não exige «;».', correct: 'Vírgula adequada entre segmentos do contraste — «;» inadequado.' },
          { label: 'C — principalmente', detail: 'Adjunto final pode ser isolado.', correct: 'Vírgula antes de «principalmente» não é erro — marca adjunto.' },
          { label: 'D — travessões', detail: 'Substituição total altera norma e ritmo.', correct: 'Nem toda vírgula vira travessão sem prejuízo.' },
          { label: 'Em outra banca…', detail: 'Podem trocar «chocolate» por «doce».', correct: 'Mesmo teste: contraste «para alguns… para outros»?' },
        ],
        footer_rule: 'A passa: explicativos e intercalados.',
      },
    ],
  },

  'apice-boa-vista-pb-pontuacao-incorreta-3951884': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3951884',
    source_note: 'Vírgula incorreta — Ápice ACS Pref Boa Vista PB 2025 tec 3951884',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Boa Vista PB)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
    },
    instruction:
      'Sabendo que o uso da vírgula tem mais a ver com a sintaxe do que com a prosódia, assinale, a seguir, a alternativa em que a vírgula foi utilizada incorretamente.',
    options: [
      {
        id: 'A',
        text: 'Na última aula ministrada, todos os alunos daquele professor entenderam a explicação sobre vírgula;',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Na aula da semana passada, os alunos entenderam que precisam estudar bem a vírgula;',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Nossos alunos ficaram exercitando questões de vírgula, depois da aula de hoje;',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Todos os alunos foram convidados, por aquele professor para a Feira;',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'O professor do curso, Evanildo Bechara, ministra aulas de Português.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula incorreta',
        chip_label: 'Sintaxe × prosódia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Alternativa com vírgula utilizada incorretamente.', icon: 'Search' },
          { label: 'D — gabarito', detail: '«convidados, por aquele professor» — vírgula indevida.', icon: 'XCircle' },
          { label: 'Regra', detail: 'Não separar verbo transitivo do complemento com vírgula.', icon: 'Ban' },
          { label: 'Outras letras', detail: 'A–C e E: vírgulas sintaticamente corretas.', icon: 'Check' },
        ],
        footer_rule: 'Vírgula separa termos — não verbo|complemento.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando INCORRETA: achar a frase com vírgula mal empregada.',
          'A: «Na última aula ministrada,» — adjunto anteposto. Correto.',
          'B: «Na aula da semana passada,» — adjunto temporal anteposto. Correto.',
          'C: «exercitando questões de vírgula, depois da aula» — adjunto posterior. Correto.',
          'E: «Evanildo Bechara» — aposto explicativo de «professor». Correto.',
          'D: «foram convidados, por aquele professor» — vírgula entre verbo e prep. «por».',
          '«convidados por aquele professor» — complemento integrado; vírgula indevida.',
          'Gabarito D.',
        ],
        footer_rule: 'D = vírgula antes de «por aquele professor».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VERBO|COMPLEMENTO',
        rows: [
          { label: 'Proibido', value: '«foram convidados, por aquele professor»' },
          { label: 'Correto', value: '«foram convidados por aquele professor para a Feira»' },
          { label: 'Adjunto anteposto', value: '«Na última aula ministrada, todos…»' },
        ],
        footer_rule: 'Sintaxe: não cortar verbo transitivo do complemento.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'INCORRETA — só D tem vírgula errada',
        items: [
          {
            label: 'A — última aula ministrada',
            detail: 'Parece pausa oral após sujeito.',
            correct: 'Adjunto adverbial anteposto «Na última aula ministrada,» — vírgula correta.',
          },
          {
            label: 'B — semana passada',
            detail: 'Pode parecer vírgula opcional demais.',
            correct: 'Adjunto temporal anteposto — vírgula necessária e correta.',
          },
          {
            label: 'C — depois da aula',
            detail: 'Vírgula antes de adjunto posterior seduz.',
            correct: '«exercitando…, depois da aula de hoje» — adjunto deslocado, vírgula correta.',
          },
          {
            label: 'D — convidados, por',
            detail: 'Única vírgula sintaticamente incorreta.',
            correct: 'Vírgula indevida entre verbo e complemento preposicionado «por aquele professor».',
          },
          {
            label: 'E — Evanildo Bechara',
            detail: 'Aposto parece vocativo.',
            correct: 'Aposto explicativo «Evanildo Bechara» — vírgulas corretas de isolamento.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «Feira» por «reunião».',
            correct: 'Mesmo teste: vírgula entre verbo e complemento «por»?',
          },
        ],
        footer_rule: 'D passa: única vírgula incorreta.',
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
