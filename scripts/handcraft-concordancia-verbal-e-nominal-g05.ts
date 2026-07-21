#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — concordancia-verbal-e-nominal-g05 (8 slugs · Concordância · lote 5, q33–40).
 *
 *   npx tsx scripts/handcraft-concordancia-verbal-e-nominal-g05.ts
 *   npm run audit:questao-readiness -- --lote=concordancia-verbal-e-nominal-g05 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=concordancia-verbal-e-nominal-g05 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'concordancia-verbal-e-nominal-g05';
const SUBTOPICO = 'Concordância verbal e nominal';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_concordancia';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-concordancia-nucleo-sjrp.json';

const CONCORDANCIA_SOURCE = {
  id: 'pt-concordancia-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Concordância verbal e nominal — núcleo do sujeito e casos especiais',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'núcleo do sujeito',
    'concordância verbal',
    'concordância nominal',
    'sujeito pós-verbo',
    'partitivo (maior parte)',
    'predicativo de número',
    'haver/existir impessoal',
    'aqueles que / um dos que',
    'locução de tempo',
    'bastar impessoal',
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
      reviewer: 'handcraft:concordancia-verbal-e-nominal-g05',
      guideline_snapshot: `M13 Elias TE-simples — pergunta «Qual o núcleo do sujeito?» · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      CONCORDANCIA_SOURCE,
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
  'cebraspe-ces-concordancia-texto-cg1a1a-relacao-entre-sustentab-3698155': {
    family: 'text_fragment',
    source_tec_id: '3698155',
    source_note: 'CG1A1 relação é nova núcleo relação — CEBRASPE Ana Sau Pref Boa Vista 2025 tec 3698155',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ana Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
    },
    instruction:
      'No que diz respeito à concordância nominal e verbal no texto CG1A1, assinale a opção correta.',
    text_fragment:
      '<p><strong>Texto CG1A1</strong> — Sustentabilidade e saúde (Fórum Econômico Mundial / FGV)</p><p>A <strong>relação entre sustentabilidade e saúde</strong> não é nova. Impactos do modo de produção retornam ao ser humano em danos à saúde. Mudanças climáticas alteram habitats, vetores (dengue, malária) e agravam doenças crônicas. Relatório de 2024 projeta milhões de mortes e custos bilionários; ecoansiedade e sofrimento de crianças e adolescentes associam-se à emergência climática.</p><p>portal.fgv.br — adaptado</p>',
    options: [
      {
        id: 'A',
        text: 'No segundo período do texto, a forma verbal "têm" está flexionada na terceira pessoa do singular, estabelecendo concordância com o termo que a antecede — "meio ambiente".',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'No primeiro período do texto, a flexão da forma verbal "é" na terceira pessoa do singular justifica-se pela concordância verbal com o termo "relação", que é o núcleo do sujeito da oração.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'No segundo período do texto, os adjetivos "perigosos" e "radioativos" poderiam, sem prejuízo da correção gramatical, estar flexionados no singular.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'No primeiro período do texto, o termo "nova" está flexionado no feminino singular porque estabelece concordância com o termo mais próximo, a palavra "saúde".',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'No primeiro período do texto, sem prejuízo da correção gramatical, a forma verbal "é" poderia ser flexionada na terceira pessoa do plural — são — em concordância com os termos "sustentabilidade" e "saúde".',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo «relação»',
        chip_label: 'M13 — CG1A1',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que «é» concorda?', icon: 'Focus' },
          { label: '1º período', detail: '«A relação… não é nova» — sujeito = relação (fem. sing.).', icon: 'Target' },
          { label: 'Nova', detail: 'Predicativo concorda com «relação», não com «saúde».', icon: 'Check' },
          { label: '2º período', detail: '«Os impactos… têm retornado» — núcleo plural «impactos».', icon: 'Layers' },
          { label: 'Pegadinha D/E', detail: 'Proximidade com «saúde» ou composto «sustentabilidade e saúde».', icon: 'AlertTriangle' },
        ],
        footer_rule: '«É» concorda com «relação» — núcleo do sujeito.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Período → núcleo → letras',
        meta: slideMeta,
        steps: [
          'Comando: opção correta sobre concordância no texto CG1A1.',
          '1º período: «A relação entre sustentabilidade e saúde não é nova».',
          'Sujeito: «a relação» (núcleo sing.) → «é» 3ª sing. — B descreve isso corretamente.',
          'A: «têm» com «meio ambiente» — núcleo real é «impactos» (pl.) no 2º período — eliminar.',
          'C: «perigosos/radioativos» concordam com «resíduos» (pl.) — não podem ir ao singular — eliminar.',
          'D: «nova» não segue «saúde» (regra da proximidade é falsa) — eliminar.',
          'E: sujeito «relação» (sing.) não admite «são» — eliminar.',
          'Gabarito B.',
          'Em similares: identifique o núcleo antes de julgar verbo e predicativo.',
        ],
        footer_rule: 'B: «é» × núcleo «relação».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÚCLEO DO SUJEITO',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo? «Relação» ou «sustentabilidade e saúde»?' },
          { label: '1º período', value: '«A relação… não é nova» — núcleo sing. «relação».' },
          { label: 'Predicativo', value: '«Nova» concorda com o núcleo, não com termo vizinho.' },
          { label: '2º período', value: '«Os impactos têm retornado» — plural com «impactos».' },
          { label: 'Nesta questão', value: 'B — «é» com núcleo «relação»' },
        ],
        footer_rule: 'Núcleo manda — não o vizinho.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Por que A, C, D e E falham',
        items: [
          {
            label: 'A — têm × meio ambiente',
            detail: 'Atribui concordância errada no 2º período.',
            correct: '«Os impactos têm retornado» — núcleo plural «impactos».',
          },
          {
            label: 'B — é × relação',
            detail: 'Análise correta do 1º período.',
            correct: 'Gabarito B — «é» concorda com núcleo «relação».',
          },
          {
            label: 'C — adj. no singular',
            detail: '«Perigosos/radioativos» modificam «resíduos» (pl.).',
            correct: 'Adjetivos devem permanecer no plural.',
          },
          {
            label: 'D — nova × saúde',
            detail: 'Falsa regra da proximidade.',
            correct: '«Nova» concorda com núcleo «relação».',
          },
          {
            label: 'E — são',
            detail: 'Pluraliza verbo com termos dentro do sujeito.',
            correct: 'Sujeito «a relação» exige «é», não «são».',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam por «A ligação entre X e Y».',
            correct: 'Mesmo trilho: núcleo «ligação» → verbo singular.',
          },
        ],
        footer_rule: 'Só B descreve a concordância corretamente.',
      },
    ],
  },

  'cebraspe-ces-concordancia-texto-cg2a1imagino-que-a-escrita-nas-3705180': {
    family: 'text_fragment',
    source_tec_id: '3705180',
    source_note: 'CG2A1 Verissimo sujeito elíptico eu — CEBRASPE Ass Tec Sau Pref Boa Vista 2025 tec 3705180',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ass Tec Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'A respeito das relações de concordância verbal estabelecidas no texto CG2A1, assinale a opção correta.',
    text_fragment:
      '<p><strong>Memória e anotações</strong> — Luís Fernando Verissimo (<em>Estadão</em>, 2011)</p><p>Crônica sobre a angústia de não esquecer: o pré-homem que «preciso me lembrar», o salmão que «sabe, não sabendo», o homem que «precisa consultar as suas notas». No 3º parágrafo, o narrador acorda com uma ideia, anota num papel e perde o fio: «Normalmente não <strong>faço</strong> isso… sempre me <strong>esqueço</strong>… <strong>sei</strong>… se <strong>tivesse</strong> o bloco…»</p>',
    options: [
      {
        id: 'A',
        text: 'No penúltimo período do primeiro parágrafo, a forma verbal "retivesse" estabelece concordância com "memória".',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'No quarto período do segundo parágrafo, a forma verbal "precisa" estabelece concordância com "o homem".',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'No terceiro período do terceiro parágrafo, as formas verbais "faço", "esqueço", "sei" e "tivesse" estabelecem concordância com o sujeito elíptico eu.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'No segundo período do primeiro parágrafo, a forma verbal "preciso" estabelece concordância com "O primeiro pré-homem".',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'No segundo período do primeiro parágrafo, a forma verbal "era" estabelece concordância com "ele".',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sujeito elíptico «eu»',
        chip_label: 'M13 — CG2A1',
        meta: slideMeta,
        items: [
          { label: 'Verissimo', detail: 'Memória e anotações — crônica sobre angústia de esquecer.', icon: 'BookOpen' },
          { label: 'Pré-homem', detail: '«Preciso me lembrar» — discurso citado no 1º parágrafo.', icon: 'Quote' },
          { label: '3º parágrafo', detail: 'Narrador em 1ª pessoa: faço, esqueço, sei, tivesse.', icon: 'User' },
          { label: 'Sujeito elíptico', detail: 'Verbos de 1ª sing. sem «eu» explícito — sujeito = eu.', icon: 'Focus' },
          { label: 'Pegadinha D', detail: 'Atribuir «preciso» citado ao «pré-homem» como análise do narrador.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Faço/esqueço/sei/tivesse → sujeito elíptico «eu».',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: concordância verbal correta no texto CG2A1 (Verissimo).',
          'C: 3º parágrafo — «não faço», «esqueço», «sei», «tivesse» — 1ª pessoa do narrador (eu elíptico) — correto.',
          'A «retivesse» × memória: sujeito é «algo» (ideias/cenas) — eliminar.',
          'B «precisa» × homem: período fala do salmão/elefante, não do «homem» genérico nesse trecho — eliminar.',
          'D «preciso» × pré-homem: «preciso» está no discurso citado do pré-homem, não concorda com ele como sujeito gramatical — eliminar.',
          'E «era» × ele: «era» concorda com «pedaço de papel e uma Bic» (composto) — eliminar.',
          'Gabarito C.',
          'Em similares: localize o sujeito real — citado × narrador.',
        ],
        footer_rule: 'C: elipse de «eu» no narrador.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUJEITO ELÍPTICO',
        rows: [
          { label: 'Pergunta-teste', value: 'Quem pratica a ação? Narrador ou personagem citado?' },
          { label: '1ª pessoa', value: '«Faço/esqueço/sei» — sujeito oculto «eu».' },
          { label: 'Discurso citado', value: '«Preciso me lembrar» — fala do pré-homem, análise distinta.' },
          { label: 'Composto', value: '«Era um pedaço de papel e uma Bic» — verbo no singular.' },
          { label: 'Nesta questão', value: 'C — faço, esqueço, sei, tivesse com «eu»' },
        ],
        footer_rule: 'Narrador 1ª pessoa = eu elíptico.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises trocadas',
        items: [
          {
            label: 'A — retivesse × memória',
            detail: 'Confunde complemento com sujeito.',
            correct: 'Sujeito: «algo que as retivesse na memória».',
          },
          {
            label: 'B — precisa × homem',
            detail: 'Período errado ou sujeito errado.',
            correct: '«O homem precisa consultar» — mas B cita o 4º período do 2º parágrafo incorretamente.',
          },
          {
            label: 'C — eu elíptico',
            detail: 'Narrador em 1ª pessoa no 3º parágrafo.',
            correct: 'Gabarito C — faço, esqueço, sei, tivesse.',
          },
          {
            label: 'D — preciso × pré-homem',
            detail: 'Cita discurso direto como se fosse sujeito.',
            correct: '«Preciso» é fala citada; sujeito elíptico da citação é o pré-homem, mas a opção descreve mal.',
          },
          {
            label: 'E — era × ele',
            detail: '«Era» não concorda só com «ele».',
            correct: '«Era um pedaço de papel e uma Bic» — sujeito composto.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam Verissimo por crônica em 3ª pessoa.',
            correct: 'Mesmo teste: quem fala? narrador × citado.',
          },
        ],
        footer_rule: 'Só C descreve a concordância corretamente.',
      },
    ],
  },

  'avancasp-ag-concordancia-leia-o-texto-a-seguir-para-responder-3709814': {
    family: 'text_fragment',
    source_tec_id: '3709814',
    source_note: 'Drummond reduzido × número — AVANÇASP Ag Pref SM Arcanjo 2025 tec 3709814',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref SM Arcanjo)',
      orgao: 'Pref. SM Arcanjo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão. Assinale a alternativa correta a respeito da concordância no primeiro parágrafo do texto: «O maior fabricante de abotoaduras de punho fechou a indústria depois de convencer-se de que é infinitamente reduzido o número de camisas de manga comprida, à disposição da humanidade.»',
    text_fragment:
      '<p><strong>Abotoaduras</strong> — Carlos Drummond de Andrade (<em>Contos plausíveis</em>)</p><p>O maior fabricante de abotoaduras fechou a indústria ao perceber que <strong>é infinitamente reduzido o número de camisas de manga comprida</strong> à disposição da humanidade — e que as que restam já têm botões. O narrador lamenta o fim das abotoaduras e, ao ver uma camisa esporte voar como bandeira, resolve investir em camisas de manga curta.</p>',
    options: [
      { id: 'A', text: 'O termo "reduzido" concorda com "número".', is_correct: true },
      { id: 'B', text: 'O termo "reduzido" concorda com "camisas".', is_correct: false },
      { id: 'C', text: 'O termo "comprida" concorda com "camisas".', is_correct: false },
      { id: 'D', text: 'O termo "fechou" concorda com "abotoaduras".', is_correct: false },
      { id: 'E', text: 'O termo "comprida" concorda com "indústrias".', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Predicativo × núcleo',
        chip_label: 'M13 — sujeito posposto',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Com o que «reduzido» concorda?', icon: 'Focus' },
          { label: 'Sujeito posposto', detail: '«É reduzido o número…» — núcleo antes do verbo: número.', icon: 'ArrowRight' },
          { label: 'Número (sing.)', detail: '«Reduzido» predicativo concorda com «número».', icon: 'Hash' },
          { label: 'De camisas', detail: 'Complemento plural não puxa o predicativo.', icon: 'Shirt' },
          { label: 'Pegadinha B', detail: '«Camisas» vizinha atrai o olho, não a concordância.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Reduzido → número (sing.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: «é infinitamente reduzido o número de camisas de manga comprida».',
          'Sujeito posposto: núcleo = «número» (masc. sing.).',
          'Predicativo «reduzido» concorda com «número» → A correta.',
          'B «reduzido» × camisas: complemento de «número», não núcleo — eliminar.',
          'C «comprida» × camisas: adjetivo de «manga» (sing.) — eliminar.',
          'D «fechou» × abotoaduras: verbo concorda com «fabricante» — eliminar.',
          'E «comprida» × indústrias: sem relação — eliminar.',
          'Gabarito A.',
          'Em similares: sujeito posposto — ache o núcleo depois do verbo.',
        ],
        footer_rule: 'A: reduzido concorda com número.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUJEITO POSPOSTO',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo? «Número» ou «camisas»?' },
          { label: 'Estrutura', value: '«É reduzido o número de camisas…»' },
          { label: 'Predicativo', value: '«Reduzido» → núcleo «número» (sing.).' },
          { label: 'Manga comprida', value: '«Comprida» concorda com «manga», não «camisas».' },
          { label: 'Nesta questão', value: 'A — reduzido × número' },
        ],
        footer_rule: 'Número sing. → reduzido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vizinho plural engana',
        items: [
          { label: 'A — reduzido × número', detail: 'Predicativo alinhado ao núcleo sing.', correct: 'Gabarito A — concordância correta.' },
          { label: 'B — reduzido × camisas', detail: 'Confunde complemento com núcleo.', correct: '«Número» (sing.) manda no predicativo.' },
          { label: 'C — comprida × camisas', detail: '«Manga comprida» — núcleo «manga» sing.', correct: '«Comprida» concorda com «manga».' },
          { label: 'D — fechou × abotoaduras', detail: 'Sujeito é «fabricante», não «abotoaduras».', correct: '«O fabricante fechou».' },
          { label: 'E — comprida × indústrias', detail: 'Termo inexistente no trecho analisado.', correct: '«Indústria» é objeto de «fechou».' },
          { label: 'Em outra banca…', detail: 'Trocam por «é grande a quantidade de».', correct: 'Mesma regra: quantidade/número (sing.).' },
        ],
        footer_rule: 'Só A identifica o núcleo certo.',
      },
    ],
  },

  'avancasp-of-concordancia-era-uma-hora-e-quarenta-e-um-minutos-3725105': {
    family: 'conceito',
    source_tec_id: '3725105',
    source_note: 'Contagem 3 corretas locução tempo — AVANÇASP Of Adm Pref Varginha 2025 tec 3725105',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Of Adm (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '- Era uma hora e quarenta e um minutos.\n- A lista das autoridades especiais convidadas foram feitas com muito carinho.\n- A maior parte dos parentes chegaram cedo para a festa.\n- Nem tudo são flores no mundo empresarial.\n- Bastam que venham todos de acordo com as recomendações que lhes passei.\n\nEm quantos enunciados acima a concordância da forma verbal destacada está correta?',
    options: [
      { id: 'A', text: 'Quatro', is_correct: false },
      { id: 'B', text: 'Dois', is_correct: false },
      { id: 'C', text: 'Um', is_correct: false },
      { id: 'D', text: 'Três', is_correct: true },
      { id: 'E', text: 'Cinco', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conte as corretas',
        chip_label: 'M13 — casos mistos',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada frase: o verbo está alinhado ao núcleo?', icon: 'Focus' },
          { label: '1 — Era… minutos', detail: 'Locução de tempo composta — «era» sing. — correta.', icon: 'Clock' },
          { label: '3 — chegaram', detail: 'Partitivo: «maior parte dos parentes» → plural aceito.', icon: 'Users' },
          { label: '4 — são flores', detail: 'Predicativo plural atrai verbo — «são flores» aceito.', icon: 'Flower' },
          { label: '2 e 5 erradas', detail: 'Lista → «foi feita»; bastar → «basta que».', icon: 'XCircle' },
        ],
        footer_rule: 'Três corretas: 1, 3 e 4.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quantas frases têm concordância verbal correta?',
          '1 «Era uma hora e quarenta e um minutos» — locução de tempo, singular — ✓',
          '2 «A lista… foram feitas» — núcleo «lista» (sing.) → «foi feita» — ✗',
          '3 «A maior parte dos parentes chegaram» — partitivo com «parentes» — ✓',
          '4 «Nem tudo são flores» — predicativo plural «flores» — ✓',
          '5 «Bastam que venham» — bastar impessoal → «Basta que» — ✗',
          'Total: três corretas (1, 3, 4).',
          'Gabarito D (Três).',
          'Em similares: analise frase a frase — não pare na primeira.',
        ],
        footer_rule: 'D — três enunciados corretos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHECKLIST DAS 5 FRASES',
        rows: [
          { label: '1 — era', value: 'Locução de tempo → singular ✓' },
          { label: '2 — foram feitas', value: '«Lista» sing. → «foi feita» ✗' },
          { label: '3 — chegaram', value: 'Partitivo → plural com «parentes» ✓' },
          { label: '4 — são flores', value: 'Predicativo plural → «são» ✓' },
          { label: '5 — bastam', value: 'Impersonal → «basta que» ✗' },
        ],
        footer_rule: '3 corretas → letra D.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros nas frases 2 e 5',
        items: [
          { label: '1 — era (correta)', detail: 'Hora + minutos: verbo no singular.', correct: '«Era uma hora e quarenta e um minutos» — ok.' },
          { label: '2 — foram feitas', detail: '«Lista» é núcleo singular feminino.', correct: '«A lista foi feita com muito carinho».' },
          { label: '3 — chegaram (correta)', detail: 'Concordância partitiva com «parentes».', correct: '«A maior parte dos parentes chegaram» — aceito.' },
          { label: '4 — são flores (correta)', detail: 'Atração do predicativo plural.', correct: '«Nem tudo são flores» — construção aceita.' },
          { label: '5 — bastam', detail: 'Bastar impessoal não pluraliza.', correct: '«Basta que venham todos de acordo…».' },
          { label: 'Em outra banca…', detail: 'Incluem «Fazem dez anos» para confundir.', correct: 'Locução de tempo → «Faz dez anos» (sing.).' },
        ],
        footer_rule: 'Gabarito D — três corretas.',
      },
    ],
  },

  'avancasp-tla-concordancia-a-maior-parte-dos-torcedores-aderiu-3726057': {
    family: 'conceito',
    source_tec_id: '3726057',
    source_note: 'Maior parte aderiu/aderiram ênfase — AVANÇASP TLab Pref Varginha 2025 tec 3726057',
    meta: {
      banca: 'AVANÇASP',
      prova: 'TLab (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«A maior parte dos torcedores (aderiu/aderiram) às medidas do clube.» Assinale a alternativa que preenche corretamente a lacuna da frase acima e justifica o uso do(s) verbo(s) de forma adequada.',
    options: [
      {
        id: 'A',
        text: '«aderiu», só existindo a possibilidade de concordância com «a maior parte».',
        is_correct: false,
      },
      {
        id: 'B',
        text: '«aderiram», só existindo a possibilidade de concordância com «torcedores».',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«aderiram», podendo concordar tanto com «torcedores» quanto com «medidas».',
        is_correct: false,
      },
      {
        id: 'D',
        text: '«aderiu» ou «aderiram», dependendo da ênfase que se quer dar à frase, concordando com «a maior parte» ou «torcedores».',
        is_correct: true,
      },
      {
        id: 'E',
        text: '«aderiu» ou «aderiram», não implicando nenhuma ênfase diferente, independente do verbo a ser empregado.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Partitivo duplo',
        chip_label: 'M13 — maior parte',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Concorda com «maior parte» ou «torcedores»?', icon: 'Focus' },
          { label: 'A maior parte', detail: 'Núcleo do partitivo → «aderiu» (sing.).', icon: 'PieChart' },
          { label: 'Dos torcedores', detail: 'Especificador plural → «aderiram» (pl.).', icon: 'Users' },
          { label: 'Ênfase', detail: 'Sing. = coletivo; pl. = indivíduos — ambas corretas.', icon: 'Scale' },
          { label: 'Pegadinha A/B', detail: '«Só» uma possibilidade — falso na norma culta.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Aderiu ou aderiram — ambas válidas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Lacuna: «A maior parte dos torcedores (aderiu/aderiram) às medidas».',
          'Concordância partitiva: verbo com «maior parte» (sing.) OU «torcedores» (pl.).',
          'A «só aderiu» — ignora concordância com o especificador — eliminar.',
          'B «só aderiram» — ignora concordância com o núcleo — eliminar.',
          'C «aderiram» com «medidas» — «medidas» não é sujeito — eliminar.',
          'D «aderiu ou aderiram» conforme ênfase — correto.',
          'E nega diferença de ênfase — falso — eliminar.',
          'Gabarito D.',
          'Em similares: «a maioria de», «grande parte de» — dupla concordância.',
        ],
        footer_rule: 'D: dupla possibilidade com ênfase.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MAIOR PARTE DE',
        rows: [
          { label: 'Pergunta-teste', value: 'Ênfase no todo ou nos indivíduos?' },
          { label: 'Com núcleo', value: '«A maior parte aderiu» — coletivo.' },
          { label: 'Com especificador', value: '«A maior parte dos torcedores aderiram» — indivíduos.' },
          { label: 'Medidas', value: 'Objeto — nunca sujeito do verbo.' },
          { label: 'Nesta questão', value: 'D — aderiu ou aderiram' },
        ],
        footer_rule: 'Partitivo: dupla concordância possível.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Por que não A, B, C, E',
        items: [
          { label: 'A — só aderiu', detail: 'Restringe a concordância ao núcleo apenas.', correct: 'Também se admite «aderiram» com «torcedores».' },
          { label: 'B — só aderiram', detail: 'Restringe ao especificador apenas.', correct: 'Também se admite «aderiu» com «maior parte».' },
          { label: 'C — medidas', detail: '«Medidas» é objeto, não sujeito.', correct: 'Verbo concorda com parte ou torcedores.' },
          { label: 'D — ambas com ênfase', detail: 'Descrição gramatical completa.', correct: 'Gabarito D.' },
          { label: 'E — sem ênfase', detail: 'As formas não são totalmente equivalentes.', correct: 'Sing. × pl. carrega ênfase distinta.' },
          { label: 'Em outra banca…', detail: 'Trocam por «metade dos alunos».', correct: 'Mesma regra: metade fez / fizeram.' },
        ],
        footer_rule: 'Só D justifica corretamente.',
      },
    ],
  },

  'avancasp-ag-concordancia-mal-iniciara-seu-discurso-o-deputado-3727002': {
    family: 'conceito',
    source_tec_id: '3727002',
    source_note: 'Aqueles que recusam / um dos que recusa — AVANÇASP Ag Fisc Pref Varginha 2025 tec 3727002',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag Fisc (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Mal iniciara seu discurso, o deputado embatucou: – Senhor Presidente: não sou daqueles que... O verbo ia para o singular ou para o plural? Tudo indicava o plural. No entanto, podia perfeitamente ser o singular: – Não sou daqueles que... Não sou daqueles que recusam... No plural soava melhor. Mas era preciso precaver-se contra essas armadilhas da linguagem – que recusa? (...)» (Trecho de Eloquência singular, de Fernando Sabino)\n\nMantendo o mesmo sentido da construção verbal motivadora do texto acima, assinale a alternativa em que ambas as formas estão de acordo com a norma-padrão.',
    options: [
      { id: 'A', text: 'Não sou daqueles que recusam. / Não sou um dos que recusa.', is_correct: true },
      { id: 'B', text: 'Não sou daqueles que recusa. / Não sou daqueles que recuso.', is_correct: false },
      { id: 'C', text: 'Não sou um dos que recusam. / Não estou entre os que recusa.', is_correct: false },
      { id: 'D', text: 'Não estou entre os que recusam. / Não estou entre os que recusa.', is_correct: false },
      { id: 'E', text: 'Não sou um que recusam. / Não sou um que recusa.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aqueles que × um dos que',
        chip_label: 'M13 — relativa',
        meta: slideMeta,
        items: [
          { label: 'Sabino', detail: 'Deputado em dúvida: «não sou daqueles que…» sing. ou pl.?', icon: 'Mic' },
          { label: 'Aqueles que', detail: 'Antecedente plural → relativa «recusam».', icon: 'Users' },
          { label: 'Um dos que', detail: '«Um» (sing.) → relativa «recusa».', icon: 'User' },
          { label: 'Pegadinha B', detail: '«Aqueles que recusa» — antecedente pl. com verbo sing.', icon: 'AlertTriangle' },
          { label: 'Pegadinha E', detail: '«Um que recusam» — construção inexistente.', icon: 'XCircle' },
        ],
        footer_rule: 'Aqueles → recusam; um dos → recusa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Sabino: deputado hesita entre singular e plural na relativa.',
          'A «Não sou daqueles que recusam» + «Não sou um dos que recusa» — ambas corretas.',
          'B «aqueles que recusa» — antecedente plural exige plural — eliminar.',
          'C «um dos que recusam» — «um» exige singular na relativa — eliminar.',
          'D segunda frase «entre os que recusa» — «os» plural, verbo deveria ser «recusam» — eliminar.',
          'E «um que recusam» — construção agramatical — eliminar.',
          'Gabarito A.',
          'Em similares: antecedente da relativa manda no verbo.',
        ],
        footer_rule: 'A: recusam (aqueles) + recusa (um dos).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RELATIVA × ANTECEDENTE',
        rows: [
          { label: 'Aqueles que', value: 'Antecedente pl. → «recusam».' },
          { label: 'Um dos que', value: '«Um» sing. → «recusa».' },
          { label: 'Entre os que', value: '«Os» pl. → «recusam» (não «recusa»).' },
          { label: 'Errado', value: '«Aqueles que recusa» / «um que recusam».' },
          { label: 'Nesta questão', value: 'A — par de frases corretas' },
        ],
        footer_rule: 'Antecedente determina a relativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada par incorreto',
        items: [
          { label: 'A — recusam / recusa', detail: 'Par alinhado à norma culta.', correct: 'Gabarito A — ambas corretas.' },
          { label: 'B — recusa / recuso', detail: '«Aqueles» (pl.) com «recusa» (sing.).', correct: '«Aqueles que recusam».' },
          { label: 'C — recusam / recusa', detail: 'Primeira frase ok; segunda «os que recusa» erra.', correct: '«Entre os que recusam».' },
          { label: 'D — recusam / recusa', detail: 'Segunda frase: «os» exige «recusam».', correct: '«Não estou entre os que recusam».' },
          { label: 'E — recusam / recusa', detail: '«Um que recusam» é agramatical.', correct: '«Um dos que recusa».' },
          { label: 'Em outra banca…', detail: 'Trocam por «não sou dos que aceita».', correct: 'Mesma regra: dos (pl.) → aceitam.' },
        ],
        footer_rule: 'Só A tem as duas frases corretas.',
      },
    ],
  },

  'quadrix-aux-concordancia-texto-para-a-questao-imagine-um-time-3738655': {
    family: 'text_fragment',
    source_tec_id: '3738655',
    source_note: 'Deixa × sistema núcleo — QUADRIX Aux FUABC 2025 tec 3738655',
    meta: {
      banca: 'QUADRIX',
      prova: 'Aux (FUABC)',
      orgao: 'FUABC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Na oração «O sistema de defesa do organismo (sistema imunológico) deixa de reconhecer o próprio corpo», a forma verbal «deixa» faz concordância com a palavra',
    text_fragment:
      '<p><strong>Doenças autoimunes</strong> — adaptado de desenbahia.ba.gov.br</p><p>Metáfora do time que marca gol contra a própria equipe: o <strong>sistema de defesa do organismo (sistema imunológico)</strong> deixa de reconhecer o próprio corpo e ataca células saudáveis. Incidência crescente; hipóteses incluem higiene excessiva e infecções que desregulam a imunidade.</p>',
    options: [
      { id: 'A', text: '«sistema» (primeira ocorrência).', is_correct: true },
      { id: 'B', text: '«defesa».', is_correct: false },
      { id: 'C', text: '«organismo».', is_correct: false },
      { id: 'D', text: '«sistema» (segunda ocorrência).', is_correct: false },
      { id: 'E', text: '«corpo».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo «sistema»',
        chip_label: 'M13 — sujeito',
        meta: slideMeta,
        items: [
          { label: 'Doenças autoimunes', detail: 'Texto adaptado de desenbahia — metáfora do time contra a própria equipe.', icon: 'Shield' },
          { label: 'Organismo', detail: 'Sistema de defesa do organismo deixa de reconhecer o corpo.', icon: 'Heart' },
          { label: 'Imunológico', detail: 'Aposto «(sistema imunológico)» explica o sujeito.', icon: 'Info' },
          { label: 'Núcleo sistema', detail: '«Deixa» concorda com primeira ocorrência de «sistema».', icon: 'Focus' },
          { label: 'Pegadinha D', detail: 'Segunda «sistema» é aposto, não núcleo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Deixa → sistema (1ª ocorrência).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto desenbahia: doenças autoimunes — metáfora do time contra a própria equipe.',
          'Oração: «O sistema de defesa do organismo (sistema imunológico) deixa de reconhecer…»',
          'Sujeito: «o sistema de defesa do organismo» — núcleo = «sistema» (1ª ocorrência).',
          '«Deixa» 3ª sing. concorda com «sistema» — A correta.',
          'B «defesa»: núcleo do sintagma, mas núcleo do sujeito é «sistema» — eliminar.',
          'C «organismo»: complemento de «de» — eliminar.',
          'D 2ª «sistema»: aposto entre parênteses — eliminar.',
          'E «corpo»: objeto de «reconhecer» — eliminar.',
          'Gabarito A.',
          'Em similares: aposto não substitui o núcleo do sujeito.',
        ],
        footer_rule: 'A: deixa × sistema (1ª).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÚCLEO DO SUJEITO',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual palavra é núcleo do sujeito?' },
          { label: 'Sujeito', value: '«O sistema de defesa do organismo»' },
          { label: 'Núcleo', value: '«Sistema» (primeira ocorrência).' },
          { label: 'Aposto', value: '«(sistema imunológico)» — explica, não comanda.' },
          { label: 'Nesta questão', value: 'A — sistema (1ª ocorrência)' },
        ],
        footer_rule: 'Sistema → deixa (sing.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Termo errado por função',
        items: [
          { label: 'A — sistema (1ª)', detail: 'Núcleo do sujeito da oração.', correct: 'Gabarito A — concordância correta.' },
          { label: 'B — defesa', detail: 'Núcleo do sintagma interno, não do sujeito.', correct: 'Sujeito inteiro tem núcleo «sistema».' },
          { label: 'C — organismo', detail: 'Termo regido por «de».', correct: '«Do organismo» — adjunto.' },
          { label: 'D — sistema (2ª)', detail: 'Aposto explicativo entre parênteses.', correct: 'Não é o núcleo do sujeito.' },
          { label: 'E — corpo', detail: 'Objeto direto de «reconhecer».', correct: '«Reconhecer o próprio corpo».' },
          { label: 'Em outra banca…', detail: 'Trocam por «O conjunto de regras (norma) determina».', correct: 'Núcleo = conjunto, não norma (aposto).' },
        ],
        footer_rule: 'Só A identifica o núcleo.',
      },
    ],
  },

  'avancasp-aco-concordancia-havia-alguma-coisa-errada-com-o-rei-3738890': {
    family: 'conceito',
    source_tec_id: '3738890',
    source_note: 'Havia/existir plural coisas — AVANÇASP ACO Pref Cunha 2025 tec 3738890',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACO (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Havia alguma coisa errada com o rei» (RPM)\n\nAssinale a alternativa em que as duas formas reescritas do trecho destacado acima, no plural, estão totalmente corretas.',
    options: [
      { id: 'A', text: 'Haviam algumas coisas erradas / Existiam algumas coisas erradas', is_correct: false },
      { id: 'B', text: 'Havia algumas coisas erradas / Existia algumas coisas erradas', is_correct: false },
      { id: 'C', text: 'Haviam algumas coisas erradas / Existia algumas coisas erradas', is_correct: false },
      { id: 'D', text: 'Tem algumas coisas erradas / Teem algumas coisas erradas', is_correct: false },
      { id: 'E', text: 'Havia algumas coisas erradas / Existiam algumas coisas erradas', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Haver × existir no plural',
        chip_label: 'M13 — impessoal',
        meta: slideMeta,
        items: [
          { label: 'Singular original', detail: '«Havia alguma coisa errada» — haver impessoal sing.', icon: 'Crown' },
          { label: 'Plural pedido', detail: '«Algumas coisas» (pl.) — como flexionar?', icon: 'Layers' },
          { label: 'Haver', detail: 'Impessoal permanece sing.: «Havia algumas coisas».', icon: 'Check' },
          { label: 'Existir', detail: 'Com sujeito pl.: «Existiam algumas coisas».', icon: 'Check' },
          { label: 'Pegadinha A/C', detail: '«Haviam» — pluralização proibida de haver.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Havia (sing.) + existiam (pl.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho RPM: «Havia alguma coisa errada com o rei» — reescrever no plural.',
          'Haver impessoal: «Havia algumas coisas erradas» — verbo no singular — ok.',
          'Existir com sujeito: «Existiam algumas coisas erradas» — verbo no plural — ok.',
          'A «Haviam» — haver não pluraliza — eliminar.',
          'B «Existia algumas» — sujeito pl. com verbo sing. — eliminar.',
          'C combina os dois erros — eliminar.',
          'D «Tem/Teem» — troca indevida + «teem» grafia errada — eliminar.',
          'Gabarito E.',
          'Em similares: haver impessoal × existir com sujeito determinado.',
        ],
        footer_rule: 'E: Havia… / Existiam…',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HAVER × EXISTIR',
        rows: [
          { label: 'Haver impessoal', value: '«Havia coisas» — singular, mesmo com pl.' },
          { label: 'Existir', value: '«Existiam coisas» — concorda com sujeito pl.' },
          { label: 'Proibido', value: '«Haviam coisas» — não existe.' },
          { label: 'Tem/teem', value: 'Não substitui haver neste sentido.' },
          { label: 'Nesta questão', value: 'E — Havia / Existiam' },
        ],
        footer_rule: 'Havia (sing.) · existiam (pl.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada par falho',
        items: [
          { label: 'A — Haviam / Existiam', detail: 'Primeira forma pluraliza haver.', correct: '«Havia algumas coisas erradas».' },
          { label: 'B — Havia / Existia', detail: 'Segunda: sujeito pl. com «existia» sing.', correct: '«Existiam algumas coisas erradas».' },
          { label: 'C — Haviam / Existia', detail: 'Erro nas duas formas.', correct: 'Havia (sing.) + existiam (pl.).' },
          { label: 'D — Tem / Teem', detail: 'Troca haver por ter + grafia «teem».', correct: 'Manter haver impessoal + existir.' },
          { label: 'E — Havia / Existiam', detail: 'Par totalmente correto.', correct: 'Gabarito E.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Houveram problemas».', correct: 'Haver impessoal → «Havia problemas».' },
        ],
        footer_rule: 'Só E reescreve corretamente no plural.',
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
