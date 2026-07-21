#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g09 (8 slugs · Classes de palavras · lote 9 · Conjunção).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g09.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g09 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g09 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g09';
const SUBTOPICO = 'Classes de palavras';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_classes_palavras';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-formacao-palavras-siglas.json';

const CLASSES_SOURCE = {
  id: 'pt-classes-palavras-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Classes de palavras — morfologia e função na oração',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'conjunção coordenativa e subordinativa',
    'valor semântico do conectivo',
    'oposição adição finalidade concessão condição',
    'mas porém embora se para que',
    'pergunta-teste M02/M03',
    'classificação morfológica',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado';

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
      reviewer: 'handcraft:classes-de-palavras-g09',
      guideline_snapshot: `M02/M03 Elias TE-simples — «O que a palavra faz na oração?» · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      CLASSES_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt_classes_palavras'],
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
  'cpcon-uepb-a-classes-leia-o-texto-3-para-responder-a-ques-3483811': {
    family: 'conceito',
    source_tec_id: '3483811',
    source_note: '«mas» oposição banheiro Germano — CPCON UEPB Ag Pref Nazarezinho 2025 tec 3483811',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag (Pref Nazarezinho)',
      orgao: 'Pref Nazarezinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Com base no Texto 3, responda à questão abaixo.\n\nTEXTO 3\n\nO papa vai ao banheiro?\nPor Tiago Germano\n\n[...] A última imagem que guardarei do Papa João Paulo II, o único e verdadeiro Papa da minha geração, é a de sua dor, que o igualou a cada ser humano neste planeta. Uma dor como a de Jesus, que era humano mas que também era Deus. E que talvez também fosse ao banheiro, mas só de vez em quando.\n\nFonte: GERMANO, Tiago. Demônios Domésticos. [S. L.]: Le Chien, 2017.\n\nNo trecho «E que talvez também fosse ao banheiro, mas só de vez em quando», o sentido da conjunção «mas» é de:',
    options: [
      { id: 'A', text: 'conclusão, finalizando uma reflexão.', is_correct: false },
      { id: 'B', text: 'adição, agregando uma possibilidade ao contexto.', is_correct: false },
      { id: 'C', text: 'oposição, reforçando a ideia de eventualidade.', is_correct: true },
      { id: 'D', text: 'causa, justificando a possibilidade de ação.', is_correct: false },
      { id: 'E', text: 'explicação, esclarecendo o ponto anterior.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mas × de vez em quando',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O conectivo liga ideias? Que relação cria?', icon: 'Focus' },
          { label: 'Texto 3 Germano', detail: 'Memória do Papa — humanidade e humor do catecismo.', icon: 'BookOpen' },
          { label: 'Talvez fosse', detail: 'Hipótese sobre o Papa ir ao banheiro.', icon: 'HelpCircle' },
          { label: 'Mas só de vez em quando', detail: 'Contrasta frequência — não sempre.', icon: 'GitCompare' },
          { label: 'Oposição', detail: '«Mas» adversativo — limita a ideia anterior.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Confundir com adição («e») ou explicação («pois»).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mas = oposição/adversativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → gabarito',
        meta: slideMeta,
        steps: [
          'Texto 3 (Germano): reflexão sobre a humanidade do Papa João Paulo II.',
          'Trecho: «talvez também fosse ao banheiro, mas só de vez em quando».',
          '«Mas» introduz contraste de frequência — não o tempo todo.',
          'A conclusão pediria «portanto», «logo» — eliminar.',
          'B adição usaria «e», «bem como» — eliminar.',
          'D causa pediria «porque», «já que» — eliminar.',
          'E explicação pediria «pois», «porque» esclarecedor — eliminar.',
          'C oposição — «mas» adversativo com matiz de eventualidade.',
          'Gabarito C.',
          'Em similares: «mas» limita ou contrapõe o que veio antes.',
        ],
        footer_rule: 'C — mas = oposição.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MAS ADVERSATIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Contrasta duas ideias?' },
          { label: 'Mas', value: 'Conjunção coordenativa adversativa (oposição).' },
          { label: 'Neste trecho', value: 'Contrasta «talvez fosse» × «só de vez em quando».' },
          { label: '× adição', value: 'Seria «e também», sem contraste.' },
          { label: 'Nesta questão', value: 'C — oposição.' },
        ],
        footer_rule: 'Mas ≠ e (adição).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outro valor semântico',
        items: [
          { label: 'A — conclusão', detail: '«Mas» não encerra raciocínio como «portanto».', correct: 'Valor adversativo — opõe frequência.' },
          { label: 'B — adição', detail: 'Soma ideia sem contraste.', correct: '«Mas» corta a expectativa de «sempre».' },
          { label: 'D — causa', detail: 'Não justifica motivo da ação.', correct: 'Contraste, não causalidade.' },
          { label: 'E — explicação', detail: 'Não esclarece o anterior como «pois».', correct: 'Limita a hipótese — oposição.' },
          { label: 'Em outra banca…', detail: 'Trocam por «porém» ou «contudo».', correct: 'Mesmo valor adversativo de «mas».' },
        ],
        footer_rule: 'Só C — oposição.',
      },
    ],
  },

  'educa-pb-ate-classes-texto-ii-governo-federal-lanca-campa-3576929': {
    family: 'conceito',
    source_tec_id: '3576929',
    source_note: 'Três conectivos Feminicídio Zero — EDUCA PB Aten CD Pref Pedras de Fogo 2025 tec 3576929',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Aten CD (Pref Pedras de Fogo)',
      orgao: 'Pref Pedras de Fogo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto II\n\nGoverno federal lança campanha Feminicídio Zero na Sapucaí\n\nO Ministério das Mulheres lançou a campanha Feminicídio Zero na Sapucaí. As mensagens lembram que o carnaval é um momento de festejar e não de assediar. [...] «Para ter igualdade, precisamos estar vivas, inteiras, sem ser violentadas e estupradas. Acredito que é possível mudar a sociedade brasileira para que ela não seja de violência, mas de respeito às mulheres.» [...] «Nenhum tipo de violência ou assédio é normal e aceitável.» [...] «E no carnaval vamos marcar fortemente essa luta, que precisa ser de todos contra o machismo e a misoginia na sociedade.»\n\nAnalisando o Texto II, considerando os conectivos destacados nas passagens:\n• «Nenhum tipo de violência ou assédio é normal e aceitável.»\n• «Acredito que é possível mudar a sociedade brasileira para que ela não seja de violência, mas de respeito às mulheres.»\n• «E no carnaval vamos marcar fortemente essa luta, que precisa ser de todos contra o machismo e a misoginia na sociedade.»\n\nOs conectivos destacados introduzem, respectivamente, os sentidos de:',
    options: [
      { id: 'A', text: 'Adição, oposição, causa.', is_correct: false },
      { id: 'B', text: 'Explicação, consequência, adição.', is_correct: false },
      { id: 'C', text: 'Oposição, conclusão, explicação.', is_correct: false },
      { id: 'D', text: 'Alternância, finalidade, adição.', is_correct: true },
      { id: 'E', text: 'Concessão, finalidade, alternância.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três conectivos',
        chip_label: 'M03 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada conectivo: que relação semântica?', icon: 'Focus' },
          { label: 'Violência ou assédio', detail: '«Ou» apresenta alternativas — alternância.', icon: 'Shuffle' },
          { label: 'Para que', detail: 'Objetivo da mudança social — finalidade.', icon: 'Target' },
          { label: 'E no carnaval', detail: '«E» acrescenta ação — adição.', icon: 'Plus' },
          { label: 'Texto II', detail: 'Feminicídio Zero na Sapucaí — carnaval, machismo, misoginia.', icon: 'Megaphone' },
          { label: 'Violência ou assédio', detail: 'Primeiro conectivo destacado no Texto II.', icon: 'Shield' },
          { label: 'Pegadinha', detail: 'Trocar «ou» (alternância) por oposição ou concessão.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ou · para que · E — ordem do texto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto II: campanha Feminicídio Zero na Sapucaí — carnaval, machismo, misoginia, respeito às mulheres.',
          '1.º «violência ou assédio» — «ou» = alternância entre tipos.',
          '2.º «para que ela não seja de violência» — finalidade (objetivo).',
          '3.º «E no carnaval» — adição de nova informação.',
          'Sequência: alternância, finalidade, adição → letra D.',
          'A troca oposição/causa no fim — eliminar.',
          'B mistura explicação/consequência — eliminar.',
          'C opõe onde há alternância — eliminar.',
          'E inverte concessão e alternância — eliminar.',
          'Gabarito D.',
          'Em similares: leia os três conectivos na ordem do texto.',
        ],
        footer_rule: 'D — ou · para que · E.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MAPA I–II–III',
        rows: [
          { label: 'Ou', value: 'Alternância — uma ou outra opção.' },
          { label: 'Para que', value: 'Finalidade — objetivo da ação.' },
          { label: 'E', value: 'Adição — acrescenta ideia.' },
          { label: 'Ordem', value: 'Alternância → finalidade → adição.' },
          { label: 'Nesta questão', value: 'D — tríade correta.' },
        ],
        footer_rule: 'Um valor por conectivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erro em cada posição',
        items: [
          { label: 'A — adição no 1.º', detail: '«Ou» não soma — apresenta opções.', correct: '1.º = alternância (violência ou assédio).' },
          { label: 'B — explicação', detail: 'Nenhum conectivo explica causa como «pois».', correct: '2.º = finalidade (para que).' },
          { label: 'C — oposição no 1.º', detail: '«Ou» não é adversativo.', correct: 'Oposição seria «mas» — aqui é alternância.' },
          { label: 'E — concessão', detail: 'Não há «embora», «ainda que».', correct: '1.º = ou (alternância), não concessão.' },
          { label: 'Em outra banca…', detail: 'Trocam campanha por outro texto jornalístico.', correct: 'Mesmo teste: ou / para que / e.' },
        ],
        footer_rule: 'Só D fecha I–II–III.',
      },
    ],
  },

  'avancasp-ace-classes-leia-o-texto-a-seguir-para-responder-3662931': {
    family: 'conceito',
    source_tec_id: '3662931',
    source_note: '«mas» ≈ porém Domingo Oliveira — AVANÇASP ACE Pref Cerquilho 2025 tec 3662931',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACE (Pref Cerquilho)',
      orgao: 'Pref Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nDomingo\nUm dia sem jornais é como um domingo chuvoso. Há tempo para tudo, mas a chuva estraga. Há tempo ao longo da rua, tempo de telefone e presença, mas falta aprofundidade de um sol. [...]\n\nOLIVEIRA, J. C. Domingo. In: OLIVEIRA, J. C. A revolução das bonecas. Rio de Janeiro: Sabiá, 1967, p. 151-152.\n\nA conjunção «mas», no trecho «Há tempo para tudo, mas a chuva estraga», tem o mesmo sentido de:',
    options: [
      { id: 'A', text: 'conquanto.', is_correct: false },
      { id: 'B', text: 'malgrado.', is_correct: false },
      { id: 'C', text: 'pois.', is_correct: false },
      { id: 'D', text: 'porém.', is_correct: true },
      { id: 'E', text: 'caso.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mas ≈ porém',
        chip_label: 'M02 — adversativa',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Mas» opõe ou acrescenta?', icon: 'Focus' },
          { label: 'Domingo chuvoso', detail: 'Crônica de José Carlos Oliveira — falta de jornal.', icon: 'CloudRain' },
          { label: 'Há tempo para tudo', detail: 'Ideia positiva — disponibilidade.', icon: 'Clock' },
          { label: 'Mas a chuva estraga', detail: 'Contraste — o tempo existe, mas perde qualidade.', icon: 'XCircle' },
          { label: 'Porém', detail: 'Sinônimo adversativo de «mas».', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Malgrado/conquanto = concessão, não adversativa plena.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mas adversativo = porém (oposição entre orações).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto «Domingo»: metáfora do dia sem jornais como domingo chuvoso.',
          '«Há tempo para tudo, mas a chuva estraga» — contraste entre ter tempo e o tempo ser arruinado.',
          '«Mas» = adversativa — mesmo valor de «porém».',
          'A conquanto = concessão subordinativa — eliminar.',
          'B malgrado = concessão («apesar de») — eliminar.',
          'C pois = causa — eliminar.',
          'E caso = condição — eliminar.',
          'Gabarito D — porém.',
          'Em similares: mas/todavia/contudo/porém — oposição.',
        ],
        footer_rule: 'Gabarito D — mas tem o mesmo sentido de porém.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADVERSATIVAS',
        rows: [
          { label: 'Mas / porém', value: 'Oposição entre orações coordenadas.' },
          { label: '× concessão', value: 'Malgrado, conquanto, embora — matizam, não opõem igual.' },
          { label: '× causa', value: 'Pois, porque, já que.' },
          { label: '× condição', value: 'Caso, se, contanto que.' },
          { label: 'Nesta questão', value: 'D — porém.' },
        ],
        footer_rule: 'Há tempo para tudo, mas a chuva estraga.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Parecem sinônimo de «mas»',
        items: [
          { label: 'A — conquanto', detail: 'Concessão: «embora tenha tempo».', correct: 'Adversativa plena = porém, não concessão.' },
          { label: 'B — malgrado', detail: 'Também concessiva («apesar de»).', correct: '«Mas» opõe fatos — não «apesar de».' },
          { label: 'C — pois', detail: 'Explicaria por que há tempo.', correct: 'Trecho contrasta — não explica causa.' },
          { label: 'E — caso', detail: 'Condicional hipotética.', correct: 'Não há hipótese — há oposição real.' },
          { label: 'Em outra banca…', detail: 'Trocam «chuva estraga» por «falta o sol».', correct: 'Mesmo par: mas ≈ porém.' },
        ],
        footer_rule: 'Só D substitui «mas».',
      },
    ],
  },

  'consulplan-a-classes-leia-o-texto-para-responder-a-questa-3694420': {
    family: 'conceito',
    source_tec_id: '3694420',
    source_note: '«Embora» concessão tecnologia — CONSULPLAN AOE Pref Indaiatuba 2025 tec 3694420',
    meta: {
      banca: 'CONSULPLAN',
      prova: 'AOE (Pref Indaiatuba)',
      orgao: 'Pref Indaiatuba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto para responder à questão abaixo.\n\nMemória cheia? Entenda se cérebro humano pode ficar sem espaço\n\n[...] Mesmo tendo uma capacidade imensa de armazenamento, especialistas apontam que a exposição nas redes sociais a conteúdos rápidos e curtos é prejudicial. [...] «Embora a tecnologia seja uma aliada, quando delegamos demais, deixamos de exercitar circuitos importantes de memória, planejamento e tomada de decisão. Lembre-se que as tecnologias vieram para facilitar a nossa vida, não para substituí-las», ressalta Oliveira.\n\n(Jorge Agle. Metrópoles, ago. 2025. Adaptado.)\n\nNo trecho «Embora a tecnologia seja uma aliada, quando delegamos demais...», a conjunção sublinhada expressa ideia de:',
    options: [
      { id: 'A', text: 'Causa.', is_correct: false },
      { id: 'B', text: 'Condição.', is_correct: false },
      { id: 'C', text: 'Finalidade.', is_correct: false },
      { id: 'D', text: 'Concessão.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Embora = concessão',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Admite fato e contrapõe matiz?', icon: 'Focus' },
          { label: 'Texto memória', detail: 'Cérebro × tecnologia — Oliveira, neurociência.', icon: 'Brain' },
          { label: 'Embora seja aliada', detail: 'Reconhece benefício da tecnologia.', icon: 'Smartphone' },
          { label: 'Delegamos demais', detail: 'Contraste — excesso prejudica memória.', icon: 'AlertTriangle' },
          { label: 'Concessão', detail: '«Embora» subordinativa concessiva.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Confundir com causa («porque») ou condição («se»).', icon: 'Ban' },
        ],
        footer_rule: 'Embora = apesar de (concessão).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto «Memória cheia?»: redes sociais, poda sináptica, tecnologia e cognição.',
          '«Embora a tecnologia seja uma aliada» — admite verdade parcial.',
          'Segunda oração: excesso de delegação prejudica circuitos cerebrais.',
          'Valor: concessão — «mesmo sendo aliada, há limite».',
          'A causa usaria «porque», «já que» — eliminar.',
          'B condição usaria «se», «caso» — eliminar.',
          'C finalidade usaria «para que», «a fim de» — eliminar.',
          'Gabarito D — concessão.',
          'Em similares: embora/ainda que/mesmo que = concessão.',
        ],
        footer_rule: 'D — concessão.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EMBORA',
        rows: [
          { label: 'Classe', value: 'Conjunção subordinativa concessiva.' },
          { label: 'Sentido', value: 'Apesar de / mesmo que (admite + contrapõe).' },
          { label: 'Neste trecho', value: 'Aliada, mas delegar demais prejudica.' },
          { label: '× causa', value: 'Não explica motivo — matiza o elogio.' },
          { label: 'Nesta questão', value: 'D — concessão.' },
        ],
        footer_rule: 'Embora ≠ porque.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outro valor para «embora»',
        items: [
          { label: 'A — causa', detail: 'A segunda oração não é efeito causal direto.', correct: '«Embora» admite — não fundamenta com «porque».' },
          { label: 'B — condição', detail: 'Não estabelece hipótese como «se delegarmos».', correct: 'Fato dado + ressalva = concessão.' },
          { label: 'C — finalidade', detail: 'Não indica objetivo de usar tecnologia.', correct: 'Contraste de excesso — concessiva.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Ainda que a IA ajude...».', correct: 'Mesmo valor: concessão.' },
          { label: 'Pegadinha adversativa', detail: '«Mas» coordenaria duas ideias iguais.', correct: '«Embora» subordina e concede — classe distinta.' },
        ],
        footer_rule: 'Só D — concessão.',
      },
    ],
  },

  'fgv-acs-pref-classes-assinale-a-opcao-em-que-o-valor-do-e-3719042': {
    family: 'conceito',
    source_tec_id: '3719042',
    source_note: '«Já» oposição literatura — FGV ACS Pref Nova Iguaçu 2025 tec 3719042',
    meta: {
      banca: 'FGV',
      prova: 'ACS (Pref Nova Iguaçu)',
      orgao: 'Pref Nova Iguaçu',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a opção em que o valor do elemento destacado está corretamente indicado.',
    options: [
      { id: 'A', text: 'Foi à praia e não entrou no mar. (adição)', is_correct: false },
      { id: 'B', text: 'A palavra dá respostas. Já a literatura cria perguntas. (oposição)', is_correct: true },
      { id: 'C', text: 'Por saber-se finito, o homem cria. (finalidade)', is_correct: false },
      { id: 'D', text: 'Perguntava-se como chegara àquele estado. (conformidade)', is_correct: false },
      { id: 'E', text: 'Estudava muito, pois queria passar. (conclusão)', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Já = oposição',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O destacado indica relação correta?', icon: 'Focus' },
          { label: 'Palavra × literatura', detail: 'Respostas opõem-se a perguntas.', icon: 'BookOpen' },
          { label: 'Já', detail: 'Conjunção adversativa — «mas», «porém».', icon: 'GitCompare' },
          { label: 'Oposição', detail: 'Contrasta dois modos de conhecimento.', icon: 'CheckCircle' },
          { label: '× Adição', detail: '«E» somaria sem contraste.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Já» também é advérbio de tempo — contexto define.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Já aqui = mas (oposição).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: par frase + valor do conectivo destacado.',
          'B «A palavra dá respostas. Já a literatura cria perguntas.»',
          '«Já» introduz contraste — oposição entre palavra e literatura.',
          'A «e não entrou» é adversativa, não adição pura — rótulo errado.',
          'C «Por saber-se» = causa, não finalidade — rótulo errado.',
          'D «como chegara» = modo/conformidade questionável — rótulo errado.',
          'E «pois queria» = causa, não conclusão — rótulo errado.',
          'Gabarito B — oposição correta.',
          'Em similares: «já» entre períodos = adversativa (FGV clássica).',
        ],
        footer_rule: 'B — já = oposição.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'JÁ ADVERSATIVO',
        rows: [
          { label: 'Já (conjunção)', value: 'Oposição — equivalente a «mas».' },
          { label: 'Nesta frase', value: 'Respostas (palavra) × perguntas (literatura).' },
          { label: '× adição', value: '«E» ligaria sem contraste.' },
          { label: '× tempo', value: 'Advérbio «já» seria em outro contexto.' },
          { label: 'Nesta questão', value: 'B — oposição.' },
        ],
        footer_rule: 'FGV: já = mas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Rótulo errado por item',
        items: [
          { label: 'A — adição', detail: '«E não entrou» contrasta praia e mar.', correct: 'Valor adversativo — não aditivo.' },
          { label: 'C — finalidade', detail: '«Por saber-se» indica causa/motivo.', correct: 'Causal, não final (para que).' },
          { label: 'D — conformidade', detail: '«Como» indica modo, não «conforme».', correct: 'Rótulo «conformidade» inadequado.' },
          { label: 'E — conclusão', detail: '«Pois» aqui explica motivo (causa).', correct: 'Causa, não conclusão (portanto).' },
          { label: 'Em outra banca…', detail: 'Trocam «já» por «ora» ou «mas».', correct: 'Mesmo valor adversativo.' },
        ],
        footer_rule: 'Só B acerta rótulo e valor.',
      },
    ],
  },

  'avancasp-acr-classes-as-criancas-devem-ser-acompanhadas-c-3727509': {
    family: 'conceito',
    source_tec_id: '3727509',
    source_note: 'a fim de que / porque — AVANÇASP ACre Pref Varginha 2025 tec 3727509',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Varginha)',
      orgao: 'Pref Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«As crianças devem ser acompanhadas com muito zelo _____ aprendam os valores necessários para uma boa sociedade, isso certamente vai ser cobrado delas no futuro.»\n\nAssinale a alternativa cujas palavras preenchem corretamente os espaços em branco no enunciado acima, na mesma ordem.',
    options: [
      { id: 'A', text: 'a fim de que – porque', is_correct: true },
      { id: 'B', text: 'a fim de quê – porque', is_correct: false },
      { id: 'C', text: 'afim de que – porquê', is_correct: false },
      { id: 'D', text: 'afim de quê – por que', is_correct: false },
      { id: 'E', text: 'à fim de que – por quê', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Finalidade + causa',
        chip_label: 'M03 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '1.º lacuna: objetivo? 2.º: motivo?', icon: 'Focus' },
          { label: 'Crianças + zelo', detail: '«As crianças devem ser acompanhadas com muito zelo».', icon: 'Baby' },
          { label: 'A fim de que', detail: 'Finalidade — para que aprendam valores na sociedade.', icon: 'Target' },
          { label: 'Aprendam', detail: 'Subjuntivo após finalidade — «a fim de que».', icon: 'BookOpen' },
          { label: 'Porque', detail: 'Causal — cobrado delas no futuro.', icon: 'Link' },
          { label: 'Ortografia', detail: '«A fim de» (separado) + «que»; «porque» (causal, junto).', icon: 'SpellCheck' },
          { label: 'Pegadinha', detail: 'Afim (sem espaço) = semelhante; porquê = substantivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'A fim de que + porque.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Frase: crianças acompanhadas com zelo a fim de que aprendam valores — cobrado no futuro.',
          '1.ª lacuna: objetivo de aprender valores → finalidade → «a fim de que».',
          'Verbo «aprendam» (subjuntivo) confirma finalidade.',
          '2.ª lacuna: explica por que será cobrado → causal → «porque» (junto).',
          'B «a fim de quê» — «quê» errado antes de oração — eliminar.',
          'C «afim de que» + «porquê» — ortografia e classe — eliminar.',
          'D «afim» + «por que» separado (interrogativo) — eliminar.',
          'E «à fim» + «por quê» substantivo — eliminar.',
          'Gabarito A.',
          'Em similares: a fim de que + verbo subjuntivo; porque causal junto.',
        ],
        footer_rule: 'A — a fim de que · porque.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DUAS LACUNAS',
        rows: [
          { label: 'A fim de que', value: 'Finalidade — sempre separado + «que».' },
          { label: 'Aprendam', value: 'Subjuntivo — reforça finalidade.' },
          { label: 'Porque', value: 'Causal (explicação) — escrito junto.' },
          { label: '× afim', value: 'Advérbio de modo («semelhante») — contexto outro.' },
          { label: 'Nesta questão', value: 'A — a fim de que – porque.' },
        ],
        footer_rule: 'Ortografia mata distrator.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Ortografia × valor',
        items: [
          { label: 'B — quê', detail: 'Antes de oração com verbo, usa-se «que».', correct: '«A fim de que aprendam» — não «quê».' },
          { label: 'C — afim + porquê', detail: '«Afim» sem espaço = advérbio; «porquê» = nome.', correct: 'Finalidade exige «a fim de que»; causal «porque».' },
          { label: 'D — por que', detail: 'Separado = interrogativo ou preposição + pronome.', correct: 'Causal explicativa = «porque» junto.' },
          { label: 'E — à fim + por quê', detail: 'Crase e substantivo não encaixam.', correct: 'Sem crase em «a fim de que»; «porque» causal.' },
          { label: 'Em outra banca…', detail: 'Trocam «aprendam» por «aprendessem».', correct: 'Mesma regra: a fim de que + subjuntivo.' },
        ],
        footer_rule: 'Só A — ortografia e sentido.',
      },
    ],
  },

  'avancasp-aco-classes-se-ando-cheio-me-dilua-se-estou-no-m-3738889': {
    family: 'conceito',
    source_tec_id: '3738889',
    source_note: 'Se condicional + imperativo Arnaldo Antunes — AVANÇASP ACO Pref Cunha 2025 tec 3738889',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACO (Pref Cunha)',
      orgao: 'Pref Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Se ando cheio, me dilua.\nSe estou no meio, conclua.\nSe perco o freio, me obstrua.\nSe me arruinei, reconstrua.» (Arnaldo Antunes)\n\nAnalisando essa composição, assinale a alternativa cujas palavras preenchem corretamente as lacunas abaixo:\n\n«A primeira parte de cada verso se inicia com um(a) _______ de sentido _______, e a segunda parte apresenta um verbo no modo _______ exprimindo _______.»',
    options: [
      { id: 'A', text: 'preposição – temporal – indicativo – descrição', is_correct: false },
      { id: 'B', text: 'advérbio – temporal – imperativo – ordem ou pedido', is_correct: false },
      { id: 'C', text: 'advérbio – condicional – subjuntivo – conselho ou sugestão', is_correct: false },
      { id: 'D', text: 'preposição – temporal – subjuntivo – conselho ou sugestão', is_correct: false },
      { id: 'E', text: 'conjunção – condicional – imperativo – ordem ou pedido', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Se + imperativo',
        chip_label: 'M03 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Se» liga orações? Que modo do verbo?', icon: 'Focus' },
          { label: 'Arnaldo Antunes', detail: 'Versos com estrutura paralela — condição + pedido.', icon: 'Music' },
          { label: 'Se ando cheio', detail: '«Se» = conjunção condicional (hipótese).', icon: 'HelpCircle' },
          { label: 'Me dilua', detail: 'Imperativo — ordem ou pedido ao interlocutor.', icon: 'Zap' },
          { label: 'Padrão', detail: 'Cada verso repete: Se + condição / imperativo.', icon: 'Repeat' },
          { label: 'Pegadinha', detail: 'Chamar «Se» de advérbio ou preposição.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Se = conjunção condicional.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Poema Arnaldo Antunes: quatro versos com mesma estrutura.',
          'Início: «Se» + oração condicional («ando cheio», «estou no meio»...).',
          'Classe: conjunção subordinativa condicional — não advérbio.',
          'Sentido: condicional — estabelece hipótese.',
          '2.ª parte: «dilua», «conclua», «obstrua», «reconstrua» — imperativo.',
          'Valor: ordem ou pedido dirigido ao outro.',
          'A preposição/temporal/indicativo — eliminar.',
          'B advérbio temporal — eliminar.',
          'C advérbio + subjuntivo — eliminar.',
          'D preposição + subjuntivo — eliminar.',
          'Gabarito E — conjunção, condicional, imperativo, ordem.',
          'Em similares: Se + oração / imperativo = condição + comando.',
        ],
        footer_rule: 'E — conjunção condicional + imperativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VERSO SE + VERBO',
        rows: [
          { label: 'Se', value: 'Conjunção condicional.' },
          { label: 'Sentido', value: 'Hipótese («se isso ocorrer...»).' },
          { label: '2.ª parte', value: 'Imperativo — dilua, conclua, obstrua.' },
          { label: 'Valor', value: 'Ordem ou pedido.' },
          { label: 'Nesta questão', value: 'E — quatro lacunas corretas.' },
        ],
        footer_rule: 'Não confunda Se com advérbio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe errada do «Se»',
        items: [
          { label: 'A — preposição', detail: '«Se» inicia oração subordinada.', correct: 'Conjunção condicional — liga períodos.' },
          { label: 'B — advérbio temporal', detail: '«Se» não indica tempo aqui.', correct: 'Condicional: hipótese para o imperativo.' },
          { label: 'C — subjuntivo', detail: 'Verbos estão no imperativo, não subjuntivo.', correct: 'Dilua/conclua = imperativo.' },
          { label: 'D — preposição + subjuntivo', detail: 'Duplo erro de classe e modo.', correct: 'Conjunção + imperativo.' },
          { label: 'Em outra banca…', detail: 'Trocam poema por «Se chover, fique em casa».', correct: 'Mesmo esquema: Se condicional + imperativo.' },
        ],
        footer_rule: 'Só E fecha as quatro lacunas.',
      },
    ],
  },

  'educa-pb-acd-classes-leia-o-texto-a-seguir-para-responder-3746555': {
    family: 'conceito',
    source_tec_id: '3746555',
    source_note: '«Se» condicional setembro lilás — EDUCA PB ACD Pref Santa Cecília 2025 tec 3746555',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Santa Cecília)',
      orgao: 'Pref Santa Cecília',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nTEXTO I\nSetembro lilás e o direito a uma chance\nLaura Brito\n\nO setembro lilás nos convoca a um mês de conscientização da doença de Alzheimer e outros tipos de demência. Se você que me lê pensa que é só mais um mês ou só mais uma cor, peço um pouco de atenção aos números de demência no Brasil. Em 2024, o Ministério da Saúde divulgou o Relatório Nacional sobre a Demência [...] cerca de 8,5% da população com 60 anos ou mais convivem com algum tipo de demência. [...] Se uma pessoa próxima está tendo dificuldade de se lembrar de algo que fez há pouco, é hora de enfrentar o tabu e dizer: vamos buscar um médico.\n\nNo trecho «Se você que me lê pensa que é só mais um mês ou só mais uma cor», a conjunção «Se» expressa noção de:',
    options: [
      { id: 'A', text: 'Dúvida.', is_correct: false },
      { id: 'B', text: 'Condição.', is_correct: true },
      { id: 'C', text: 'Comparação.', is_correct: false },
      { id: 'D', text: 'Explicação.', is_correct: false },
      { id: 'E', text: 'Conclusão.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Se = condição',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Se» introduz hipótese ou compara?', icon: 'Focus' },
          { label: 'Texto I Brito', detail: 'Setembro lilás — Alzheimer, demência, diagnóstico.', icon: 'Heart' },
          { label: 'Se você pensa', detail: 'Hipótese sobre a atitude do leitor.', icon: 'HelpCircle' },
          { label: 'Só mais um mês', detail: 'Condição: caso o leitor minimize a campanha.', icon: 'Calendar' },
          { label: 'Condição', detail: '«Se» subordinativa condicional.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Confundir com dúvida («será que») ou explicação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Se + oração = condição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto I: conscientização Alzheimer — dados do Ministério da Saúde.',
          '«Se você que me lê pensa que é só mais um mês ou só mais uma cor...»',
          '«Se» apresenta condição hipotética sobre o leitor.',
          'A dúvida usaria «será que», tom interrogativo — eliminar.',
          'C comparação usaria «como», «tal qual» — eliminar.',
          'D explicação usaria «pois», «porque» — eliminar.',
          'E conclusão usaria «portanto», «logo» — eliminar.',
          'Gabarito B — condição.',
          'Em similares: Se + indicativo pode marcar condição real ou hipotética.',
        ],
        footer_rule: 'B — condição.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SE CONDICIONAL',
        rows: [
          { label: 'Se', value: 'Conjunção subordinativa condicional.' },
          { label: 'Sentido', value: 'Hipótese / condição para o que segue.' },
          { label: 'Neste trecho', value: 'Caso o leitor minimize setembro lilás.' },
          { label: '× dúvida', value: 'Não pergunta — estabelece cenário.' },
          { label: 'Nesta questão', value: 'B — condição.' },
        ],
        footer_rule: 'Se pensa = se isso for verdade.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Valor errado do «Se»',
        items: [
          { label: 'A — dúvida', detail: 'O autor não questiona — supõe atitude.', correct: 'Condicional: «caso você pense assim».' },
          { label: 'C — comparação', detail: 'Não há paralelo com «como».', correct: 'Hipótese sobre o leitor — condição.' },
          { label: 'D — explicação', detail: 'Não esclarece causa do parágrafo anterior.', correct: 'Abre condição para pedir atenção.' },
          { label: 'E — conclusão', detail: 'Não encerra raciocínio.', correct: 'Inicia período condicional.' },
          { label: 'Em outra banca…', detail: 'Segundo «Se» no texto (buscar médico).', correct: 'Também condicional — mesma classe.' },
        ],
        footer_rule: 'Só B — condição.',
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
    slugs,
  };
  writeFileSync(loteCatalogPath(LOTE), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] catalog.json written (${slugs.length} slugs)`);

  const manifest = {
    lote: LOTE,
    subtopico: SUBTOPICO,
    topico: TOPICO,
    pedagogical_branch: BRANCH,
    total: slugs.length,
    slugs,
  };
  writeFileSync(loteManifestPath(LOTE), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] manifest.json written (${slugs.length} slugs)`);
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
