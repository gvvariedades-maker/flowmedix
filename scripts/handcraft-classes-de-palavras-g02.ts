#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g02 (8 slugs · Classes de palavras · lote 2 · Adjetivo).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g02.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g02 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g02 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g02';
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
    'adjetivo qualificativo',
    'grau superlativo e comparativo',
    'flexão de gênero',
    'derivação e etimologia',
    'função adjetiva',
    'pergunta-teste M02',
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
      reviewer: 'handcraft:classes-de-palavras-g02',
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
  'avancasp-acr-classes-considere-o-trecho-abaixo-divirto-me-3839861': {
    family: 'conceito',
    source_tec_id: '3839861',
    source_note: '«vazia»/«escancaradas» adjetivos — AVANÇASP ACre Pref Potim 2026 tec 3839861',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Potim)',
      orgao: 'Pref Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o trecho abaixo:\n\n“Divirto-me pensando no que encontraremos; sei que quando chegarmos será como se eu já tivesse visto tudo (...): a rua vazia, as portas do banco escancaradas, o cofre vazio.” (SCLIAR, Moacyr. Piquenique. In: Histórias da Terra Trêmula. São Paulo: Vertente, 1977. p. 24-26).\n\nAssinale a alternativa que indica qual a classe gramatical a que pertencem os termos “vazia” e “escancaradas” destacados acima.',
    options: [
      { id: 'A', text: 'Adjetivos', is_correct: true },
      { id: 'B', text: 'Conjunções', is_correct: false },
      { id: 'C', text: 'Pronomes', is_correct: false },
      { id: 'D', text: 'Preposições', is_correct: false },
      { id: 'E', text: 'Artigos', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vazia · escancaradas',
        chip_label: 'M02 — adjetivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qualifica substantivo? → adjetivo.', icon: 'Focus' },
          { label: 'A rua vazia', detail: '«Vazia» caracteriza «rua» — adjetivo.', icon: 'Home' },
          { label: 'Portas escancaradas', detail: '«Escancaradas» caracteriza «portas» — adjetivo.', icon: 'DoorOpen' },
          { label: 'Cofre vazio', detail: 'Mesmo padrão — adjunto adnominal.', icon: 'Box' },
          { label: 'Pegadinha', detail: 'Confundir com artigo, pronome ou conjunção.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adjunto adnominal = adjetivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Classe → gabarito',
        meta: slideMeta,
        steps: [
          'Trecho Scliar: foco em «vazia» e «escancaradas».',
          '«Vazia» junto a «rua» — qualifica o nome → adjetivo.',
          '«Escancaradas» junto a «portas» — qualifica o nome → adjetivo.',
          'B conjunção liga orações — não é o caso — eliminar.',
          'C pronome substitui nome — eliminar.',
          'D preposição liga termos — eliminar.',
          'E artigo antecede substantivo (o, as) — «vazia» não é artigo — eliminar.',
          'Gabarito A — adjetivos.',
          'Em similares: «rua vazia» / «portas escancaradas» — qualifica substantivo → adjetivo.',
        ],
        footer_rule: 'A — adjetivos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJETIVO = QUALIFICA',
        rows: [
          { label: 'Pergunta-teste', value: 'Modifica/qualifica substantivo?' },
          { label: 'Vazia', value: 'Adjunto de «rua» — adjetivo.' },
          { label: 'Escancaradas', value: 'Adjunto de «portas» — adjetivo.' },
          { label: '× outras classes', value: 'Não ligam, substituem nem antecedem nome sozinhas.' },
          { label: 'Nesta questão', value: 'A — adjetivos.' },
        ],
        footer_rule: 'Qualifica nome → adjetivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras classes não encaixam',
        items: [
          { label: 'B — conjunções', detail: 'Conjunção liga orações/palavras («e», «mas»).', correct: '«Vazia»/«escancaradas» qualificam substantivos — adjetivo.' },
          { label: 'C — pronomes', detail: 'Pronome substitui ou acompanha nome.', correct: 'Função adjetival — caracterizam rua/portas.' },
          { label: 'D — preposições', detail: 'Preposição introduz complemento (de, em, com).', correct: 'Não ligam termos aqui — são adjetivos.' },
          { label: 'E — artigos', detail: 'Artigo antecede substantivo (a, as, o).', correct: '«Vazia» e «escancaradas» qualificam, não determinam.' },
          { label: 'Em outra banca…', detail: 'Trocam por «cidade silenciosa» / «janelas abertas».', correct: 'Mesmo teste: qualifica substantivo → adjetivo.' },
        ],
        footer_rule: 'Só A — adjetivos.',
      },
    ],
  },

  'vunesp-ag-pr-classes-leia-o-texto-para-responder-a-questa-3352592': {
    family: 'conceito',
    source_tec_id: '3352592',
    source_note: 'Superlativo público/publicíssimo tsundoku — VUNESP Ag Pref Sertãozinho 2025 tec 3352592',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Sertãozinho)',
      orgao: 'Pref Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nExistem as pessoas bibliófilas (do grego biblíon, “livro”, e philos, “amigo”): quase sempre intelectuais, adoram ter livros raros, edições únicas, várias traduções dos mesmos textos. Reúnem coleções catalogadas que podem ser utilíssimas para pesquisadores. Existem as pessoas acumuladoras: adoram ter uma enorme quantidade de objetos, incluindo livros. Via de regra, o termo já designa uma patologia: pessoas que acumulam itens porque simplesmente não conseguem jogá-los fora. E, portanto, são também incapazes de catalogar, cuidar, organizar, até mesmo limpar seus objetos. E existimos nós, pobres mortais que não temos nem a seriedade e o senso de propósito das bibliófilas, e nem a patologia descontrolada das acumuladoras, mas que, sim, vamos comprando livros pela vida e, na semana seguinte, antes de termos lido qualquer uma das compras da anterior, já estamos comprando novos, que vão se acumulando sem serem lidos.\n\nPara o escritor Roberto Calasso, autor de Como organizar uma biblioteca, bibliotecas deveriam ser organizadas de forma aleatória e lúdica, um lugar para o usuário se perder e, quem sabe, encontrar um livro ainda melhor quando se está buscando por outro apenas adequado. Mais importante, toda boa biblioteca é comprada no presente, mas para ser útil no futuro. “Nada tira o fascínio de ter nas mãos — na hora — um livro de cuja necessidade não se sabia até um momento antes”, escreve ele.\n\n(Alex Castro. “Tsundoku”, a arte de acumular livros. Revista Quatro Cinco Um. Julho de 2024. Adaptado)\n\nEm “Reúnem coleções catalogadas que podem ser utilíssimas...”, o adjetivo “úteis”, em destaque, está no grau superlativo. Assinale a alternativa em que se apresentam corretamente o adjetivo e sua forma superlativa.',
    options: [
      { id: 'A', text: 'agradável – agradavelzíssimo.', is_correct: false },
      { id: 'B', text: 'difícil – dificíssimo.', is_correct: false },
      { id: 'C', text: 'público – publicíssimo.', is_correct: true },
      { id: 'D', text: 'regular – regularzíssimo.', is_correct: false },
      { id: 'E', text: 'comum – comuncíssimo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Par adjetivo + superlativo',
        chip_label: 'M02 — grau',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O superlativo sintético está correto?', icon: 'Focus' },
          { label: 'Bibliófilas', detail: 'Intelectuais com coleções catalogadas — texto Alex Castro.', icon: 'Library' },
          { label: 'Acumuladoras', detail: 'Patologia de acumular objetos e livros sem organizar.', icon: 'Archive' },
          { label: 'Utilíssimas', detail: '«Utilíssimas para pesquisadores» — modelo superlativo.', icon: 'BookOpen' },
          { label: 'Público', detail: 'Superlativo: publicíssimo — forma regular.', icon: 'CheckCircle' },
          { label: 'Pegadinhas', detail: 'Hiato irregular, forma inexistente ou comparativo.', icon: 'AlertTriangle' },
          { label: 'Dificílimo', detail: 'De «difícil» — forma erudita (ílimo), não «dificíssimo».', icon: 'Ban' },
        ],
        footer_rule: 'Bibliófilas, acumuladoras, utilíssimas — teste o par superlativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto tsundoku (Alex Castro/Quatro Cinco Um): bibliófilas, acumuladoras, Roberto Calasso, biblioteca.',
          'Existem coleções catalogadas utilíssimas; pobres mortais comprando livros sem ler.',
          'Nada tira o fascínio de ter nas mãos um livro; biblioteca comprada no presente para o futuro.',
          'Trecho «Reúnem coleções catalogadas que podem ser utilíssimas para pesquisadores».',
          'Comando: par correto adjetivo + superlativo absoluto sintético.',
          'A «agradavelzíssimo» — forma inexistente — eliminar.',
          'B «difícil – dificíssimo»: forma erudita é dificílimo — eliminar.',
          'D «regularzíssimo»: superlativo é regularíssimo — eliminar.',
          'E «comuncíssimo»: superlativo é comuníssimo — eliminar.',
          'C «público – publicíssimo» — par correto.',
          'Gabarito C.',
          'Em similares: no texto «utilíssimas»; na prova teste o par adjetivo + -íssimo real (público/publicíssimo).',
        ],
        footer_rule: 'C — público/publicíssimo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUPERLATIVO SINTÉTICO',
        rows: [
          { label: 'Pergunta-teste', value: 'Sufixo -íssimo, -ílimo ou -érrimo?' },
          { label: 'Público', value: 'Publicíssimo — correto.' },
          { label: 'Difícil', value: 'Dificílimo (não dificíssimo).' },
          { label: 'Regular / comum', value: 'Regularíssimo · comuníssimo.' },
          { label: 'Nesta questão', value: 'C — público/publicíssimo.' },
          { label: 'Contexto', value: 'Bibliófilas, acumuladoras, Roberto Calasso, biblioteca, coleções catalogadas, tsundoku, fascínio, futuro.' },
        ],
        footer_rule: 'Memorize pares irregulares da banca.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Forma inventada ou errada',
        items: [
          { label: 'A — agradavelzíssimo', detail: 'Inventa sufixo em «agradável».', correct: 'Forma correta: agradabilíssimo.' },
          { label: 'B — dificíssimo', detail: 'Ignora superlativo erudito de «difícil».', correct: 'Dificílimo — não dificíssimo.' },
          { label: 'D — regularzíssimo', detail: 'Troca -íssimo por forma inexistente.', correct: 'Regularíssimo é o superlativo.' },
          { label: 'E — comuncíssimo', detail: 'Erra grafia do superlativo de «comum».', correct: 'Comuníssimo — com u.' },
          { label: 'Em outra banca…', detail: 'Trocam por «fácil/facílimo» ou «ágil/agilíssimo».', correct: 'Mesmo teste: par adjetivo + superlativo real.' },
        ],
        footer_rule: 'Só C fecha o par.',
      },
    ],
  },

  'avancasp-aee-classes-o-que-e-angustia-um-rapaz-fez-me-ess-3374787': {
    family: 'conceito',
    source_tec_id: '3374787',
    source_note: 'Incauto/cautela — par sem relação linha/lígneo — AVANÇASP AEE Pref Caieiras 2025 tec 3374787',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AEE (Pref Caieiras)',
      orgao: 'Pref Caieiras',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'O que é angústia\n\nUm rapaz fez-me essa pergunta difícil de ser respondida. Pois depende do angustiado. Para alguns incautos, inclusive, é palavra que se orgulham de pronunciar como se com ela subissem de categoria — o que também é uma forma de angústia. Angústia pode ser não ter esperança na esperança. Ou conformar-se sem se resignar. Ou não se confessar nem a si próprio. Ou não ser o que realmente se é, e nunca se é. Angústia pode ser o desamparo de estar vivo. Pode ser também não ter coragem de ter angústia — e a fuga é outra angústia. Mas angústia faz parte: o que é vivo, por ser vivo, se contrai. Esse mesmo rapaz perguntou-me: você não acha que há um vazio sinistro em tudo? Há sim. Enquanto se espera que o coração entenda.\n\nLISPECTOR, C. O que é angústia. Todas as crônicas. Rio de Janeiro: Rocco, 2018, p. 535.\n\nO adjetivo “incauto”, que ocorre em “Para alguns incautos, inclusive, é palavra que se orgulham de pronunciar”, tem relação com o substantivo “cautela”. Identifique o par de palavras a seguir em que o adjetivo não tem relação com o substantivo com o qual se apresenta.',
    options: [
      { id: 'A', text: 'chumbo – plúmbeo.', is_correct: false },
      { id: 'B', text: 'linha – lígneo.', is_correct: true },
      { id: 'C', text: 'realeza – real.', is_correct: false },
      { id: 'D', text: 'gênero – genérico.', is_correct: false },
      { id: 'E', text: 'seda – sérico.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Incauto × cautela',
        chip_label: 'M02 — derivação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Adjetivo vem do mesmo radical do substantivo?', icon: 'Focus' },
          { label: 'Angústia', detail: 'Crônica Lispector: rapaz, angustiado, vazio sinistro.', icon: 'Heart' },
          { label: 'Incautos', detail: '«Para alguns incautos» — sem cautela.', icon: 'Link' },
          { label: 'Cautela', detail: 'Substantivo-base; «incauto» = in- + cautela.', icon: 'Shield' },
          { label: 'Plúmbeo', detail: 'De «chumbo» (lat. plumbum) — relação etimológica.', icon: 'Check' },
          { label: 'Lígneo', detail: 'De «lignum» (madeira) — não de «linha».', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Parecer fonética sem etimologia real.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Angústia, rapaz, angustiado, incautos, cautela — teste etimologia.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica Lispector «O que é angústia»: rapaz, angustiado, incautos, cautela, conformar, resignar.',
          'Comando: par em que adjetivo NÃO se relaciona ao substantivo.',
          'A chumbo/plúmbeo — mesma origem (Pb) — eliminar.',
          'B linha/lígneo — «lígneo» = de madeira; «linha» = traço — SEM relação.',
          'C realeza/real — mesmo radical — eliminar.',
          'D gênero/genérico — mesma família — eliminar.',
          'E seda/sérico — seda → sérico — eliminar.',
          'Gabarito B — único par sem vínculo etimológico.',
          'Em similares: «incautos»/cautela no texto; no par teste a etimologia (lígneo = madeira, não linha).',
        ],
        footer_rule: 'B — linha/lígneo sem relação.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ETIMOLOGIA DO PAR',
        rows: [
          { label: 'Pergunta-teste', value: 'Adjetivo deriva do substantivo?' },
          { label: 'Incauto', value: 'De cautela (prefixo in-).' },
          { label: 'Pares com relação', value: 'Chumbo/plúmbeo · realeza/real · gênero/genérico · seda/sérico.' },
          { label: 'Exceção', value: 'Linha/lígneo — lígneo = madeira (lignum).' },
          { label: 'Nesta questão', value: 'B — sem relação.' },
          { label: 'Contexto', value: 'Angústia, desamparo, contrai, coração, Lispector, conformar, resignar.' },
        ],
        footer_rule: 'Lígneo ≠ linha.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares que têm relação etimológica',
        items: [
          { label: 'A — plúmbeo', detail: 'Plúmbeo deriva de «chumbo» (latim plumbum).', correct: 'Há relação — não é o gabarito (pede exceção).' },
          { label: 'C — real', detail: 'Real deriva de «realeza/rei».', correct: 'Mesma família lexical — eliminar.' },
          { label: 'D — genérico', detail: 'Genérico deriva de «gênero».', correct: 'Relação morfológica clara — eliminar.' },
          { label: 'E — sérico', detail: 'Sérico deriva de «seda».', correct: 'Mesmo campo semântico — eliminar.' },
          { label: 'Em outra banca…', detail: 'Trocam por «ouro/áureo» ou «fogo/ígneo».', correct: 'Mesmo teste: adjetivo do radical do substantivo.' },
        ],
        footer_rule: 'Só B não relaciona.',
      },
    ],
  },

  'avancasp-ana-classes-dentre-as-palavras-a-seguir-a-unica-3460039': {
    family: 'conceito',
    source_tec_id: '3460039',
    source_note: 'Flexão gênero fétida/fétido — AVANÇASP Ana FUSAM 2025 tec 3460039',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ana (FUSAM)',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Dentre as palavras a seguir, a única que admite a flexão de gênero e que pode, portanto, receber o morfema de gênero masculino (-o) em sua terminação é:',
    options: [
      { id: 'A', text: 'carisma.', is_correct: false },
      { id: 'B', text: 'façanha.', is_correct: false },
      { id: 'C', text: 'fétida.', is_correct: true },
      { id: 'D', text: 'matrona.', is_correct: false },
      { id: 'E', text: 'residente.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Flexão de gênero',
        chip_label: 'M03 — adjetivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Muda -a para -o no masculino?', icon: 'Focus' },
          { label: 'Fétida', detail: 'Feminino → fétido (masculino) — flexiona.', icon: 'CheckCircle' },
          { label: 'Carisma', detail: 'Substantivo masculino — não flexiona para -a.', icon: 'Ban' },
          { label: 'Façanha / matrona', detail: 'Substantivos femininos fixos.', icon: 'User' },
          { label: 'Residente', detail: 'Duas-formas (-e) — não troca -a por -o.', icon: 'Users' },
        ],
        footer_rule: 'Adjetivo em -a → masculino em -o.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: palavra que recebe morfema masculino (-o) na terminação.',
          'A carisma — substantivo masculino (o carisma) — não vira *carismo — eliminar.',
          'B façanha — substantivo feminino fixo — eliminar.',
          'C fétida — adjetivo: fétida → fétido — flexiona gênero.',
          'D matrona — substantivo feminino — eliminar.',
          'E residente — duas-formas (residente/residente) — não -a/-o — eliminar.',
          'Gabarito C.',
          'Em similares: adjetivo terminado em -a flexiona para -o.',
        ],
        footer_rule: 'C — fétida/fétido.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GÊNERO DO ADJETIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Termina em -a e vira -o?' },
          { label: 'Fétida → fétido', value: 'Flexão regular de gênero.' },
          { label: 'Carisma', value: 'Substantivo — não adjetivo flexionável.' },
          { label: 'Residente', value: 'Epiceno/duas-formas — mantém -e.' },
          { label: 'Nesta questão', value: 'C — fétida.' },
        ],
        footer_rule: 'Só adjetivo -a/-o flexiona assim.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Substantivo fixo ou epiceno',
        items: [
          { label: 'A — carisma', detail: 'Substantivo masculino — não recebe -o novo.', correct: 'Já é masculino; não flexiona -a→-o.' },
          { label: 'B — façanha', detail: 'Substantivo feminino sem par masculino em -o.', correct: 'Feminino fixo — não é o caso pedido.' },
          { label: 'D — matrona', detail: 'Substantivo feminino.', correct: 'Não vira *matrono na norma.' },
          { label: 'E — residente', detail: 'Terminação -e (duas-formas).', correct: 'Não troca -a por -o — flexão diferente.' },
          { label: 'Em outra banca…', detail: 'Trocam por «bonita» ou «má».', correct: 'Mesmo teste: adjetivo -a → masculino -o.' },
        ],
        footer_rule: 'Só C flexiona -a/-o.',
      },
    ],
  },

  'idecan-atas-classes-leia-o-texto-para-responder-a-questa-3531596': {
    family: 'conceito',
    source_tec_id: '3531596',
    source_note: 'Crocante/maturados/improváveis função adjetiva — IDECAN ATAS SESAP RN 2025 tec 3531596',
    meta: {
      banca: 'IDECAN',
      prova: 'ATAS (SESAP RN)',
      orgao: 'SESAP RN',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto para responder a questão abaixo.\n\nVALE DO PARAÍBA TEM RELAÇÃO CULTURAL COM O ARROZ E OUSA COM TIPOS ESPECIAIS\n\nEm Guaratinguetá, plantações de arroz provam que alimento, além de ser elementar na mesa do brasileiro, tem diferentes variedades, sabores e usos no dia a dia. No Sudeste, digo que o sabor se manifesta por meio da memória. Isso porque a mesa dos estados que compõem a região é recheada de tradições e referências que foram ganhando atualizações e novos jeitinhos de conquistar o nosso paladar. Na busca pelos sabores do Brasil, a viagem nesta parte do país nos presenteia com torresmo crocante, queijos maturados e até vinhos que nascem de uvas de terras antes consideradas improváveis. Para dar pontapé à jornada pelo Sudeste, desembarquei com a temporada especial CNN Viagem & Gastronomia: Sabores do Brasil no Vale do Paraíba, região histórica entre as serras da Mantiqueira e do Mar que entrega paisagens fascinantes e que se apoia na tradição alimentar como traço identitário e de desenvolvimento. Afinal, os arredores tiveram papel fundamental no Ciclo do Café e hoje nos deparamos com um polo tecnológico que se debruça também em pesquisas de alimentos. Na cidade de Guaratinguetá, isso se traduz por meio de plantações de arroz, um dos símbolos mais fortes do Brasil.\n\nDisponível em: https://www.cnnbrasil.com.br/viagemegastronomia/gastronomia/vale-do-paraiba-tem-relacao-cultural-com-o-arroz-e-ousa-com-tipos-especiais.\n\nConsidere o trecho: “Na busca pelos sabores do Brasil, a viagem nesta parte do país nos presenteia com torresmo crocante, queijos maturados e até vinhos que nascem de uvas de terras antes consideradas improváveis.”\n\nAssinale a alternativa que apresenta corretamente o que se pode afirmar dos três elementos destacados.',
    options: [
      { id: 'A', text: 'Todos têm a função explicativa.', is_correct: false },
      { id: 'B', text: 'Todos são determinantes.', is_correct: false },
      { id: 'C', text: 'Todos têm a função adjetiva.', is_correct: true },
      { id: 'D', text: 'Todos têm a função adverbial.', is_correct: false },
      { id: 'E', text: 'Todos são orações subordinadas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três destacados',
        chip_label: 'M02 — adjetivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qualificam substantivo? → adjetivo.', icon: 'Focus' },
          { label: 'Guaratinguetá', detail: 'Texto CNN Viagem & Gastronomia — plantações de arroz.', icon: 'MapPin' },
          { label: 'Crocante', detail: '«Torresmo crocante» no trecho sabores do Brasil.', icon: 'Utensils' },
          { label: 'Maturados', detail: '«Queijos maturados» — função adjetiva.', icon: 'Package' },
          { label: 'Improváveis', detail: '«Terras... improváveis» — qualifica substantivo.', icon: 'Mountain' },
          { label: 'Pegadinha', detail: 'Confundir com advérbio ou oração.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vale do Paraíba, Guaratinguetá, arroz — três adjetivos no trecho.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto CNN Vale do Paraíba: Guaratinguetá, plantações de arroz, Mantiqueira, gastronomia.',
          'Região Sudeste, tradições alimentares, Ciclo do Café, paladar brasileiro, pesquisas alimentos.',
          'Trecho sabores do Brasil: torresmo crocante, queijos maturados, vinhos, uvas, terras improváveis.',
          '«Torresmo crocante» — crocante qualifica torresmo → adjetivo.',
          '«Queijos maturados» — maturados qualifica queijos → adjetivo.',
          '«Terras improváveis» — improváveis qualifica terras → adjetivo.',
          'A função explicativa — não é o caso — eliminar.',
          'B determinante — artigo/numeral — eliminar.',
          'D adverbial — modificaria verbo — eliminar.',
          'E oração subordinada — são palavras, não orações — eliminar.',
          'Gabarito C — função adjetiva.',
          'Em similares: no texto sabores do Brasil/torresmo/queijos/terras — adjunto que qualifica nome.',
        ],
        footer_rule: 'C — função adjetiva.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FUNÇÃO ADJETIVA',
        rows: [
          { label: 'Pergunta-teste', value: 'Caracteriza substantivo?' },
          { label: 'Crocante', value: 'Adjunto de torresmo.' },
          { label: 'Maturados', value: 'Adjunto de queijos (particípio adjetivado).' },
          { label: 'Improváveis', value: 'Adjunto de terras.' },
          { label: 'Nesta questão', value: 'C — todos adjetivos.' },
          { label: 'Contexto', value: 'Vale do Paraíba, Mantiqueira, Ciclo do Café, tradições, paladar, brasileiro.' },
        ],
        footer_rule: 'Três qualificam nomes.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras funções sintáticas',
        items: [
          { label: 'A — explicativa', detail: 'Aposto/oração explicativa — não adjunto.', correct: 'São adjuntos adnominais — função adjetiva.' },
          { label: 'B — determinantes', detail: 'Artigo/numeral/demonstrativo.', correct: 'Qualificam, não determinam — adjetivos.' },
          { label: 'D — adverbial', detail: 'Advérbio modificaria verbo/adj/adv.', correct: 'Ligados a substantivos — adjetivo.' },
          { label: 'E — orações', detail: 'Oração tem verbo conjugado.', correct: 'Palavras isoladas — não orações.' },
          { label: 'Em outra banca…', detail: 'Trocam por «pão quente» / «vinhos gelados».', correct: 'Mesmo teste: qualifica nome → adjetivo.' },
        ],
        footer_rule: 'Só C descreve os três.',
      },
    ],
  },

  'avancasp-acs-classes-leia-o-texto-a-seguir-para-responder-3661683': {
    family: 'conceito',
    source_tec_id: '3661683',
    source_note: 'Encabuladíssimo superlativo sintético Osvaldo — AVANÇASP ACS Pref Cerquilho 2025 tec 3661683',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Cerquilho)',
      orgao: 'Pref Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nUm coelho\n\nTodo mundo sabe: uma agência de publicidade comemorou a Páscoa oferecendo um coelho vivo a 20 personalidades do Rio de Janeiro. Mas o que ninguém sabe é que só depois da Páscoa o meu coelho conseguiu me encontrar. Dentro de uma gaiola, o coelho era pesado e assustadiço. Chamava-se Osvaldo — Osvaldo Coelho. [...] Eu, principalmente, estava encabuladíssimo, pois acabava de sugerir uma navalhada no pescoço dele. A intuição feminina prevaleceria. A cozinheira mais que depressa abriu a porta da rua e sorriu maliciosamente na minha direção. O coelho, com as orelhas eretas, contemplou longamente a liberdade. Depois, por sua vez, se precipitou para fora. Fechamos a porta e suspiramos.\n\nOLIVEIRA, J. C. Domingo. In: Caderno B, Jornal do Brasil. Rio de Janeiro, 1969. Disponível em <https://cronicabrasileira.org.br/cronicas/16674/um-coelho>.\n\nO grau do adjetivo em “Eu, principalmente, estava encabuladíssimo” é:',
    options: [
      { id: 'A', text: 'superlativo relativo.', is_correct: false },
      { id: 'B', text: 'superlativo absoluto sintético.', is_correct: true },
      { id: 'C', text: 'superlativo absoluto analítico.', is_correct: false },
      { id: 'D', text: 'comparativo de igualdade.', is_correct: false },
      { id: 'E', text: 'comparativo de superioridade.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Encabuladíssimo',
        chip_label: 'M02 — grau',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Intensifica sem comparar? Uma palavra só?', icon: 'Focus' },
          { label: 'Agência', detail: 'Crônica «Um coelho»: publicidade, Páscoa, personalidades.', icon: 'Building' },
          { label: 'Osvaldo', detail: 'Coelho na gaiola — encabuladíssimo após navalhada.', icon: 'Rabbit' },
          { label: 'Encabulado', detail: 'Adjetivo base — vergonha ao sugerir navalhada.', icon: 'User' },
          { label: '-íssimo', detail: 'Sufixo de superlativo absoluto sintético.', icon: 'TrendingUp' },
          { label: '× analítico', detail: 'Seria «muito encabulado» — duas palavras.', icon: 'Ban' },
          { label: '× comparativo', detail: 'Comparar exige «mais/menos que».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Encabuladíssimo = sintético.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica «Um coelho» (Oliveira): agência, publicidade, Páscoa, gaiola, cozinheira, navalhada.',
          '«Eu, principalmente, estava encabuladíssimo» — grau do adjetivo.',
          'A superlativo relativo exige comparação com grupo — eliminar.',
          'C analítico = «muito/extremamente encabulado» — eliminar.',
          'D comparativo de igualdade («tão... como») — eliminar.',
          'E comparativo de superioridade («mais... que») — eliminar.',
          'Gabarito B.',
          'Em similares: -íssimo/-érrimo/-ílimo = sintético.',
        ],
        footer_rule: 'B — superlativo absoluto sintético.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GRAUS DO ADJETIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Compara ou só intensifica?' },
          { label: 'Sintético', value: 'Uma palavra: encabuladíssimo, facílimo.' },
          { label: 'Analítico', value: 'Muito + adjetivo.' },
          { label: 'Comparativo', value: 'Mais/menos/tão... que/como.' },
          { label: 'Nesta questão', value: 'B — sintético (-íssimo).' },
          { label: 'Contexto', value: 'Agência publicidade Páscoa personalidades gaiola cozinheira navalhada principalmente.' },
        ],
        footer_rule: '-íssimo = absoluto sintético.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir tipo de grau',
        items: [
          { label: 'A — relativo', detail: 'Relativo compara com grupo («o mais encabulado»).', correct: 'Aqui só intensifica — absoluto sintético.' },
          { label: 'C — analítico', detail: 'Analítico usa advérbio intensificador separado.', correct: '«Encabuladíssimo» é uma palavra — sintético.' },
          { label: 'D — igualdade', detail: 'Exige «tão encabulado como».', correct: 'Não há comparação de igualdade.' },
          { label: 'E — superioridade', detail: 'Exige «mais encabulado que».', correct: 'Não há segundo termo comparado.' },
          { label: 'Em outra banca…', detail: 'Trocam por «felicíssimo» ou «facílimo».', correct: 'Mesmo trilho: sufixo em uma palavra = sintético.' },
        ],
        footer_rule: 'Só B fecha o grau.',
      },
    ],
  },

  'avancasp-fon-classes-era-daltonico-1-e-nao-sabia-chegou-a-3665299': {
    family: 'conceito',
    source_tec_id: '3665299',
    source_note: 'Otto Lara Resende daltônico/azul/verde — AVANÇASP Fono FMSRC 2025 tec 3665299',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Fono (FMSRC)',
      orgao: 'FMSRC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '“Era daltônico(1) e não sabia. Chegou assim à idade adulta(2), sem se queixar das cores que não via. (...) E aos seus olhos, o azul(3) não era honestamente azul(4). Era verde(5).” (Otto Lara Resende)\n\nAssinale a alternativa que apresenta uma análise correta das palavras identificadas no trecho acima.',
    options: [
      { id: 'A', text: '(1), (2) e (3) são palavras empregadas no trecho com valor substantivo.', is_correct: false },
      { id: 'B', text: '(1), (2) e (3) são palavras empregadas no trecho com valor adjetivo.', is_correct: false },
      {
        id: 'C',
        text: '(1) e (2) são palavras de natureza adjetiva que qualificam o personagem do texto (“ele”).',
        is_correct: false,
      },
      { id: 'D', text: '(3) é uma palavra de natureza adjetiva que qualifica (4) e (5).', is_correct: false },
      {
        id: 'E',
        text: '(4) e (5) são palavras de natureza adjetiva que qualificam o substantivo (3).',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Números (1)–(5)',
        chip_label: 'M02 — adj × subst',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Nomeia (substantivo) ou qualifica (adjetivo)?', icon: 'Focus' },
          { label: '(1) daltônico', detail: 'Predicativo de «ele» — adjetivo.', icon: 'User' },
          { label: '(2) adulta', detail: 'Qualifica «idade» — adjetivo.', icon: 'Calendar' },
          { label: '(3) o azul', detail: 'Artigo + cor → substantivo (nome da tonalidade).', icon: 'Palette' },
          { label: '(4)(5) azul/verde', detail: 'Predicativos ligados a «o azul» — adjetivos.', icon: 'Paintbrush' },
        ],
        footer_rule: 'O azul = substantivo; azul/verde = adjetivos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Mapa → gabarito',
        meta: slideMeta,
        steps: [
          'Trecho Otto Lara Resende: cinco palavras numeradas sobre daltonismo e cores.',
          '(1) daltônico e (2) adulta qualificam seres — adjetivos (C fala só nelas, mas ignora o núcleo).',
          '(3) «o azul» — artigo + cor = substantivo — eliminar A/B (tratam 1–3 como só adj ou só subst).',
          '(4) «azul» e (5) «verde» predicam sobre «o azul» — adjetivos.',
          'D inverte: (3) não é adjetivo de (4) e (5).',
          'E: (4) e (5) adjetivos qualificam o substantivo (3) — correto.',
          'Gabarito E.',
          'Em similares: artigo antes da cor = substantivo; repetição da cor sem artigo = adjetivo.',
        ],
        footer_rule: 'E — (4)(5) adjetivos de (3).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'O AZUL × AZUL',
        rows: [
          { label: 'Pergunta-teste', value: 'Tem artigo? Qualifica outro nome?' },
          { label: '(3) o azul', value: 'Substantivo — nome da cor.' },
          { label: '(4)(5) azul/verde', value: 'Adjetivos — predicativos do núcleo «azul».' },
          { label: '(1)(2)', value: 'Adjetivos — daltônico/adulta.' },
          { label: 'Nesta questão', value: 'E — adjetivos (4)(5) sobre substantivo (3).' },
        ],
        footer_rule: 'O azul ≠ azul predicativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra o par numerado',
        items: [
          { label: 'A — 1–3 substantivo', detail: 'Trata «daltônico» e «o azul» só como substantivos.', correct: '(1)(2) são adjetivos; (3) é substantivo — não todos substantivos.' },
          { label: 'B — 1–3 adjetivo', detail: 'Ignora substantivação de «o azul».', correct: '(3) com artigo é substantivo — B falha no item 3.' },
          { label: 'C — 1 e 2', detail: 'Acerta (1)(2), mas não responde ao foco (3)(4)(5).', correct: 'Análise incompleta — gabarito exige relação (4)(5) → (3).' },
          { label: 'D — (3) adjetivo', detail: 'Inverte: faz «o azul» qualificar (4) e (5).', correct: '(3) é núcleo substantivo; (4)(5) o qualificam.' },
          { label: 'Em outra banca…', detail: 'Trocam por «o verde dos campos» / «era verde».', correct: 'Mesmo trilho: artigo + cor = substantivo; predicativo = adjetivo.' },
        ],
        footer_rule: 'Só E fecha (3)(4)(5).',
      },
    ],
  },

  'avancasp-fon-classes-cartazes-publicitarios-disponivel-em-3665303': {
    family: 'conceito',
    source_tec_id: '3665303',
    source_note: 'Cartaz ferido/pé descalço — AVANÇASP Fono FMSRC 2025 tec 3665303',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Fono (FMSRC)',
      orgao: 'FMSRC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'CARTAZES PUBLICITÁRIOS. Disponível em <https://pt.pinterest.com/engiverca/cartazes-publicitarios/>.\n\nNo cartaz publicitário acima, é correto afirmar que:',
    options: [
      { id: 'A', text: 'em “pode ser”, a forma verbal “pode” tem o sentido de permissão.', is_correct: false },
      { id: 'B', text: '“ferido” é um adjetivo que qualifica a expressão “pé perdido”.', is_correct: false },
      { id: 'C', text: '“ferido” é um adjetivo que qualifica a expressão “pé descalço”.', is_correct: true },
      { id: 'D', text: 'em “não ande descalço”, a forma verbal se encontra no modo subjuntivo.', is_correct: false },
      { id: 'E', text: '“perdido” é um adjetivo que qualifica somente a expressão “pé descalço”.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ferido no cartaz',
        chip_label: 'M02 — adjetivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Ferido» qualifica qual nome?', icon: 'Focus' },
          { label: 'Pé descalço', detail: 'Sintagma nominal do cartaz de segurança.', icon: 'Footprints' },
          { label: 'Ferido', detail: 'Adjetivo — qualifica «pé» (descalço).', icon: 'Bandage' },
          { label: 'Pé perdido', detail: 'Expressão diferente — «ferido» não o modifica.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Trocar pé perdido × pé descalço.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ferido → pé descalço.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cartaz publicitário: foco em classe/função de «ferido» e formas verbais.',
          'C: «ferido» qualifica «pé descalço» — adjetivo no sintagma — correto.',
          'B troca para «pé perdido» — eliminar.',
          'A «pode» no cartaz = possibilidade/capacidade, não permissão — eliminar.',
          'D «não ande descalço» — imperativo, não subjuntivo — eliminar.',
          'E «perdido» não qualifica só «pé descalço» — eliminar.',
          'Gabarito C.',
          'Em similares: leia o sintagma inteiro antes de ligar adjetivo ao nome.',
        ],
        footer_rule: 'C — ferido + pé descalço.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJETIVO NO CARTAZ',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual substantivo o adjetivo qualifica?' },
          { label: 'Ferido', value: 'Qualifica «pé» em «pé descalço ferido».' },
          { label: '× pé perdido', value: 'Outra expressão — distrator B.' },
          { label: 'Pode', value: 'Possibilidade — não permissão (A).' },
          { label: 'Nesta questão', value: 'C — ferido → pé descalço.' },
        ],
        footer_rule: 'Leia o sintagma do cartaz.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Distrator por palavra vizinha',
        items: [
          { label: 'A — pode/permissão', detail: '«Pode ser» indica possibilidade, não autorização.', correct: 'Sentido modal de capacidade — não permissão.' },
          { label: 'B — pé perdido', detail: 'Troca o sintagma qualificado por «ferido».', correct: '«Ferido» liga-se a «pé descalço», não a «perdido».' },
          { label: 'D — subjuntivo', detail: '«Não ande» é imperativo (conselho/proibição).', correct: 'Modo imperativo — não subjuntivo.' },
          { label: 'E — perdido', detail: '«Perdido» não restringe só a «pé descalço».', correct: 'Análise incorreta do adjunto — eliminar.' },
          { label: 'Em outra banca…', detail: 'Trocam cartaz de trânsito por campanha de saúde.', correct: 'Mesmo teste: adjetivo + sintagma nominal correto.' },
        ],
        footer_rule: 'Só C descreve «ferido».',
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
