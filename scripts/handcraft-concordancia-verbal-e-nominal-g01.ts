#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — concordancia-verbal-e-nominal-g01 (8 slugs · Concordância · lote 1).
 *
 *   npx tsx scripts/handcraft-concordancia-verbal-e-nominal-g01.ts
 *   npm run audit:questao-readiness -- --lote=concordancia-verbal-e-nominal-g01 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=concordancia-verbal-e-nominal-g01 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'concordancia-verbal-e-nominal-g01';
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
    'impessoal com se',
    'haver existencial',
    'existe/existem',
    'partitivo (maioria)',
    'subjuntivo com sujeito plural',
    'expressões de tempo (passar de)',
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
      reviewer: 'handcraft:concordancia-verbal-e-nominal-g01',
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
  'vunesp-acs-concordancia-texto-nominal-verbal-3776326': {
    family: 'conceito',
    source_tec_id: '3776326',
    source_note: 'Concordância nominal+verbal correta — VUNESP ACS Pref Jundiaí 2026 tec 3776326',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Jundiaí)',
      orgao: 'Pref. Jundiaí',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'A frase, baseada no texto, que está redigida de acordo com a norma-padrão de concordância nominal e verbal é:',
    options: [
      {
        id: 'A',
        text: 'A lista de artistas mais ouvidos do Brasil no Youtube e no Spotfy já foi liderado por ele durante meses.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Tendo-se graduado em Pedagogia, ela dá aulas fazem 25 anos e já encontrou outros alunos.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Reviu vários alunos: a maioria deles é formado, uns são médicos pediatra e outros advogado.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Feita por um ex-aluno, pouco antes do dia dos professores, a homenagem os incentiva muito.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Espera-se seja feita ações igual à de João Gomes, para mostrar o valor do professor para as crianças.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que concorda?', icon: 'Focus' },
          { label: 'Verbo × sujeito', detail: 'Número e pessoa do verbo seguem o núcleo — não o vizinho.', icon: 'Target' },
          { label: 'Nominal', detail: 'Adj/adjunto flexiona com o nome que modifica.', icon: 'Box' },
          { label: 'Sujeito posposto', detail: '«Feita… a homenagem» — núcleo depois do verbo.', icon: 'Link2' },
          { label: 'Pegadinha', detail: 'Concordar com termo próximo ao verbo em vez do núcleo real.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Achar o núcleo antes de julgar a letra.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Núcleo → verbo → letras',
        meta: slideMeta,
        steps: [
          'Comando: frase com concordância nominal e verbal corretas.',
          'A «foi liderado»: sujeito «a lista» (fem.) → particípio «liderada»; «liderado» erra — eliminar.',
          'B «ela dá aulas fazem»: dois verbos sem núcleo alinhado — «faz» ou «fazem» quebrado — eliminar.',
          'C «maioria… é formado» + «médicos pediatra»: plural/singular e nominal desalinhados — eliminar.',
          'D «a homenagem os incentiva»: sujeito «homenagem» (sing.) + verbo «incentiva» + OD «os» — correto.',
          'E «seja feita ações»: «ações» (pl.) exige «sejam feitas» — eliminar.',
          'Gabarito D.',
          'Em similares: isole núcleo verbal e nominal em cada alternativa.',
        ],
        footer_rule: 'Núcleo em foco — verbal e nominal.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'NÚCLEO → VERBO / NOME',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo do sujeito? Com o que concorda?' },
          { label: 'Verbal', value: 'Verbo segue número/pessoa do núcleo do sujeito.' },
          { label: 'Nominal', value: 'Adj/part. concordam com o substantivo que qualificam.' },
          { label: 'Sujeito posposto', value: 'Núcleo pode vir depois — não muda a regra.' },
          { label: 'Nesta questão', value: 'D: homenagem (sing.) → incentiva; demais letras desalinhadas.' },
        ],
        footer_rule: 'Lista/maioria/ações: teste o núcleo, não a vizinhança.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra por desalinhar núcleo',
        items: [
          { label: 'A — liderado', detail: '«Lista» é feminina; particípio deveria ser «liderada».', correct: 'Concordância nominal: lista foi liderada.' },
          { label: 'B — fazem', detail: '«Ela dá» (sing.) + «fazem» (pl.) na mesma oração.', correct: '«Ela dá aulas há/faz 25 anos» — um núcleo por verbo.' },
          { label: 'C — formado / pediatra', detail: 'Maioria plural + «formado» sing.; «médicos pediatra» sem plural.', correct: '«são formados»; «médicos pediatras».' },
          { label: 'E — feita ações', detail: '«Ações» plural com «seja feita» singular.', correct: '«Espera-se sejam feitas ações…».' },
          { label: 'Em outra banca…', detail: 'Trocam «homenagem» por «mensagem» ou «carta».', correct: 'Mesmo trilho: sujeito posposto + verbo alinhado ao núcleo.' },
        ],
        footer_rule: 'Só D mantém verbal e nominal corretas.',
      },
    ],
  },

  'vunesp-sjrp-concordancia-verbal-registram-se-3789256': {
    family: 'conceito',
    source_tec_id: '3789256',
    source_note: 'Registram-se + sujeito posposto — VUNESP Ag Adm Pref SJRP 2026 tec 3789256',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag Adm (Pref SJRP)',
      orgao: 'Pref. São José do Rio Preto',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa redigida em conformidade com a norma-padrão de concordância verbal.',
    options: [
      { id: 'A', text: 'Sempre houveram crianças interessadas nas histórias de avós que já morreram.', is_correct: false },
      {
        id: 'B',
        text: 'Registram-se em diários, cadernos e álbuns fotográficos, as histórias de muitas famílias.',
        is_correct: true,
      },
      { id: 'C', text: 'Existe famílias cujos membros gostam de conversar sobre seus antepassados.', is_correct: false },
      {
        id: 'D',
        text: 'É comum que apareça, nos mais diferentes relatos de família, histórias de muito sofrimento.',
        is_correct: false,
      },
      { id: 'E', text: 'É interessante que os mais velhos procure contar aos mais novos histórias de família.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que o verbo concorda?', icon: 'Focus' },
          { label: 'Núcleo', detail: 'Termo que determina número e pessoa do verbo — ignore adjuntos colados ao verbo.', icon: 'Target' },
          { label: 'Sujeito pós-verbo', detail: '«Registram-se … as histórias» — o núcleo vem depois; concorda no plural.', icon: 'Link2' },
          { label: 'Haver / existir', detail: 'Existencial → verbo no singular; sujeito é o que existe.', icon: 'Users' },
          { label: 'Pegadinha', detail: 'Concordar com o termo mais próximo do verbo em vez do núcleo real.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Achar o núcleo antes de julgar a letra.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Núcleo → verbo → letras',
        meta: slideMeta,
        steps: [
          'Comando: frase com concordância verbal correta — marcar núcleo de cada opção.',
          'A «haveram crianças»: haver existencial → singular «houve/havia»; «haveram» errado — eliminar.',
          'B «Registram-se … as histórias»: sujeito posposto «as histórias» (plural) → «registram-se» correto.',
          'C «Existe famílias»: núcleo plural «famílias» exige «existem» — eliminar.',
          'D «apareça … histórias»: subjuntivo deve acompanhar núcleo plural → «apareçam» — eliminar.',
          'E «procure … os mais velhos»: núcleo plural «os mais velhos» → «procurem» — eliminar.',
          'Gabarito B — impessoal com se + sujeito posposto no plural.',
          'Em similares: isole o núcleo; o resto é ruído circunstancial.',
        ],
        footer_rule: 'Núcleo em foco — não o vizinho do verbo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'NÚCLEO → VERBO',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo do sujeito? Com o que concorda?' },
          { label: 'Núcleo', value: 'Determina número/pessoa — adjuntos não mandam sozinhos.' },
          { label: 'Haver / existir', value: 'Existencial → verbo singular; plural no sujeito posposto.' },
          { label: 'Impessoal com se', value: 'Verbo concorda com o sujeito lógico (pode vir depois).' },
          { label: 'Subjuntivo', value: 'Concorda com o núcleo do sujeito da oração subordinada.' },
          { label: 'Nesta questão', value: 'B: «as histórias» (pl.) → «registram-se».' },
        ],
        footer_rule: 'Mais de um núcleo? Regra do composto ou partitivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra por confundir núcleo ou regra especial',
        items: [
          { label: 'A — haver no plural', detail: '«Houveram» trata haver como existencial no plural.', correct: 'Haver existencial → «Havia crianças» / «Houve crianças».' },
          { label: 'C — existe + plural', detail: 'Concorda com «famílias» vizinha, mas usa «existe» no singular.', correct: 'Núcleo plural → «Existem famílias…».' },
          { label: 'D — subjuntivo no singular', detail: '«Apareça» não acompanha núcleo plural «histórias».', correct: '«…que apareçam… histórias…».' },
          { label: 'E — subjuntivo sem plural', detail: '«Procure» isolado diante de sujeito «os mais velhos».', correct: '«…que os mais velhos procurem contar…».' },
          {
            label: 'Transferência — sujeito posposto',
            detail: 'Em outra banca, o núcleo pode vir depois de «Faz-se», «Vendem-se», «Registram-se».',
            correct: 'Sempre localize o núcleo lógico antes de julgar número do verbo.',
          },
        ],
        footer_rule: 'Só B mantém núcleo e verbo alinhados.',
      },
    ],
  },

  'avancasp-esc-concordancia-armandinho-existem-3826754': {
    family: 'conceito',
    source_tec_id: '3826754',
    source_note: 'Armandinho «uns motivos existem» — AVANÇASP Esc Pref Vinhedo 2026 tec 3826754',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'BECK, Alexandre. Tiras de Armandinho. Disponível em <de-armandinho>. Reescrevendo a frase "Na verdade um motivo existe...", empregada na tirinha acima, com alterações de tempo e número, fica correta a seguinte forma:',
    options: [
      { id: 'A', text: 'Na verdade uns motivos existe...', is_correct: false },
      { id: 'B', text: 'Na verdade haviam uns motivos...', is_correct: false },
      { id: 'C', text: 'Na verdade haverão uns motivos...', is_correct: false },
      { id: 'D', text: 'Na verdade uns motivos existem...', is_correct: true },
      { id: 'E', text: 'Na verdade houveram uns motivos...', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Plural no núcleo',
        chip_label: 'M13 — existir',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que concorda?', icon: 'Focus' },
          { label: 'Um → uns motivos', detail: 'Mudança de número: sujeito passa ao plural.', icon: 'Users' },
          { label: 'Existir', detail: 'Verbo pessoal — concorda com o sujeito (≠ haver impessoal).', icon: 'Check' },
          { label: 'Haver', detail: 'Existencial → singular «havia/houve»; «haviam/houveram» errado.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Tratar «existir» como «haver» impessoal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Existir segue o núcleo; haver existencial não pluraliza.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tirinha Armandinho: original «um motivo existe» — reescrever no plural.',
          'Núcleo novo: «uns motivos» (plural) → verbo no plural «existem».',
          'A «motivos existe»: plural + singular — eliminar.',
          'B «haviam motivos» / E «houveram»: haver existencial não vai ao plural — eliminar.',
          'C «haverão motivos»: futuro de haver impessoal inadequado aqui — eliminar.',
          'D «uns motivos existem»: núcleo e verbo no plural — correto.',
          'Gabarito D.',
          'Em similares: existir = pessoal; haver/existir impessoal = singular.',
        ],
        footer_rule: 'Motivos (pl.) → existem.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXISTIR × HAVER',
        rows: [
          { label: 'Existir', value: 'Verbo pessoal — concorda: «motivos existem».' },
          { label: 'Haver impessoal', value: '«Havia motivos» — verbo no singular.' },
          { label: 'Pergunta-teste', value: 'Qual o núcleo? Com o que concorda?' },
          { label: 'Nesta questão', value: 'D — uns motivos existem' },
        ],
        footer_rule: 'Plural no sujeito → plural no existir.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir existir com haver',
        items: [
          { label: 'A — existe', detail: '«Motivos» plural com verbo singular.', correct: 'Núcleo plural → «existem».' },
          { label: 'B — haviam', detail: 'Haver no plural como existencial.', correct: '«Havia uns motivos» — haver no singular.' },
          { label: 'C — haverão', detail: 'Futuro de haver como verbo pessoal plural.', correct: 'Reescrever com «existirão» se futuro pessoal.' },
          { label: 'E — houveram', detail: 'Pretérito plural de haver existencial.', correct: '«Houve uns motivos» — impessoal no singular.' },
          { label: 'Em outra banca…', detail: 'Trocam por «há mundos que existem».', correct: 'Há (sing.) + oração com existir pessoal — duas regras.' },
        ],
        footer_rule: 'D: existir pessoal no plural.',
      },
    ],
  },

  'avancasp-esc-concordancia-maioria-veio-3826756': {
    family: 'conceito',
    source_tec_id: '3826756',
    source_note: 'Maioria veio/vieram — AVANÇASP Esc Pref Vinhedo 2026 tec 3826756',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que o espaço em branco pode ser preenchido corretamente pelas duas formas apresentadas entre parênteses.',
    options: [
      { id: 'A', text: 'Algum de nós _______ para chegar mais tarde. (pediu / pedimos)', is_correct: false },
      { id: 'B', text: 'A maioria das pessoas _______ cedo para a festa. (veio / vieram)', is_correct: true },
      { id: 'C', text: 'A caixa de ferramentas _______ com a chuva. (estragou / estragaram)', is_correct: false },
      { id: 'D', text: 'Os padrinhos da noiva _______ pelo salão de festas. (desfilou / desfilaram)', is_correct: false },
      { id: 'E', text: 'O desfile das campeãs _______ a atenção do público. (atraiu / atraíram)', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Partitivo e núcleo',
        chip_label: 'M13 — maioria',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que concorda?', icon: 'Focus' },
          { label: 'A maioria de', detail: 'Concordância partitiva: verbo com «maioria» ou com «pessoas».', icon: 'Users' },
          { label: 'Dupla forma', detail: '«Veio» (núcleo maioria) ou «vieram» (núcleo pessoas) — ambas corretas.', icon: 'Check' },
          { label: 'Algum de nós', detail: '«Algum» singular → só «pediu»; «pedimos» não cabe.', icon: 'User' },
          { label: 'Pegadinha', detail: 'Achar que partitivo só aceita uma concordância.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Maioria de + pl.: duas concordâncias possíveis.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: lacuna aceita as duas formas entre parênteses.',
          'A «algum de nós»: núcleo «algum» (sing.) → só «pediu»; «pedimos» exige «nós» — eliminar.',
          'B «a maioria das pessoas»: partitivo — «veio» (maioria) ou «vieram» (pessoas) — ambas ok.',
          'C «caixa de ferramentas»: núcleo «caixa» (sing.) → só «estragou» — eliminar.',
          'D «os padrinhos»: plural fixo → só «desfilaram» — eliminar.',
          'E «o desfile»: singular → só «atraiu» — eliminar.',
          'Gabarito B.',
          'Em similares: partitivo (maioria, metade, parte) admite dupla concordância.',
        ],
        footer_rule: 'Só B aceita as duas formas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PARTITIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Núcleo = «maioria» ou termo de «de»?' },
          { label: 'A maioria de', value: '«Veio» (maioria) ou «vieram» (pessoas) — norma culta.' },
          { label: 'Algum de nós', value: '«Algum» manda → singular.' },
          { label: 'Caixa / desfile', value: 'Núcleo singular — só forma singular.' },
          { label: 'Nesta questão', value: 'B — veio / vieram' },
        ],
        footer_rule: 'Dupla forma = partitivo ou coletivo flexível.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Por que só B aceita as duas',
        items: [
          { label: 'A — pedimos', detail: '«Algum» não autoriza plural «pedimos».', correct: 'Só «pediu» — núcleo «algum».' },
          { label: 'C — estragaram', detail: '«Caixa» singular não aceita plural.', correct: '«A caixa estragou» — núcleo caixa.' },
          { label: 'D — desfilou', detail: '«Padrinhos» plural exige plural.', correct: '«Os padrinhos desfilaram».' },
          { label: 'E — atraíram', detail: '«Desfile» singular não pluraliza verbo.', correct: '«O desfile atraiu».' },
          { label: 'Em outra banca…', detail: 'Trocam por «a maior parte dos alunos».', correct: 'Mesma regra partitiva: dupla concordância.' },
        ],
        footer_rule: 'B: maioria das pessoas — veio ou vieram.',
      },
    ],
  },

  'avancasp-tec-concordancia-haver-casas-3835995': {
    family: 'conceito',
    source_tec_id: '3835995',
    source_note: 'Havia + possuíam — AVANÇASP Tec Enf Pref Estiva Gerbi 2026 tec 3835995',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Tec Enf (Pref Estiva Gerbi)',
      orgao: 'Pref. Estiva Gerbi',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      '"_______ várias casas na rua que _______ paredes coloridas e janelas decoradas." Assinale a alternativa cujas formas verbais preenchem corretamente as lacunas acima, na mesma ordem.',
    options: [
      { id: 'A', text: 'Havia – possuiam', is_correct: false },
      { id: 'B', text: 'Havia – possuíam', is_correct: true },
      { id: 'C', text: 'Existia – possuíam', is_correct: false },
      { id: 'D', text: 'Haviam – possuíam', is_correct: false },
      { id: 'E', text: 'Existiam – possuíam', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Haver + relativa',
        chip_label: 'M13 — dupla lacuna',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo de cada oração? Com o que concorda?', icon: 'Focus' },
          { label: '1ª lacuna', detail: 'Haver existencial → «havia» (sing.) com «várias casas» posposto.', icon: 'Home' },
          { label: '2ª lacuna', detail: '«Casas» núcleo da relativa → «possuíam» (pl.).', icon: 'Layers' },
          { label: 'Acento', detail: 'Possuir (verbo) → «possuíam»; possuir (prep.) seria «possuiam».', icon: 'PenLine' },
          { label: 'Pegadinha', detail: 'Pluralizar «haviam» na 1ª lacuna.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Haver impessoal + relativa com núcleo plural.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Duas concordâncias: existencial + oração relativa.',
          '1ª: «várias casas» com haver → «Havia várias casas» (impessoal, singular).',
          'A/D «Haviam»: haver existencial não pluraliza — eliminar D; A erra acento «possuiam».',
          'C «Existia casas»: existir pessoal exige «existiam» — eliminar.',
          'E «Existiam» na 1ª: inadequado para existencial com haver — eliminar.',
          '2ª: sujeito da relativa «casas» → «possuíam» com acento (verbo).',
          'Gabarito B — Havia / possuíam.',
          'Em similares: 1ª lacuna = haver sing.; 2ª = núcleo da relativa.',
        ],
        footer_rule: 'Havia casas que possuíam…',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DUPLA LACUNA',
        rows: [
          { label: 'Haver existencial', value: '«Havia várias casas» — verbo singular.' },
          { label: 'Relativa', value: '«casas que possuíam» — núcleo plural.' },
          { label: 'Possuíam', value: 'Verbo possuir (3ª pl.) — acento gráfico.' },
          { label: 'Nesta questão', value: 'B — Havia / possuíam' },
        ],
        footer_rule: 'Não confunda haver impessoal com existir.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros por lacuna',
        items: [
          { label: 'A — possuiam', detail: 'Sem acento — forma de possuir (prep.) ou erro ortográfico.', correct: 'Verbo → «possuíam» (acento).' },
          { label: 'C — existia', detail: 'Existir com sujeito plural «casas».', correct: '«Existiam várias casas» — não «existia».' },
          { label: 'D — haviam', detail: 'Haver existencial no plural.', correct: '«Havia várias casas» — impessoal singular.' },
          { label: 'E — existiam', detail: '1ª lacuna: existir pessoal onde a banca usa haver.', correct: 'Padrão: «Havia… que possuíam».' },
          { label: 'Em outra banca…', detail: 'Trocam «casas» por «prédios antigos».', correct: 'Mesma dupla: haver sing. + relativa plural.' },
        ],
        footer_rule: 'B: Havia + possuíam.',
      },
    ],
  },

  'cpcon-uepb-concordancia-paes-franceses-3836503': {
    family: 'conceito',
    source_tec_id: '3836503',
    source_note: 'Pães franceses — CPCON UEPB ACS Pref Condado PB 2026 tec 3836503',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Condado (PB))',
      orgao: 'Pref. Condado (PB)',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Para responder à questão, leia o texto que segue. Texto III Fonte: @abaixadaegua. Disponível em: Acesso em: 23 out. 2025. Na tirinha, o personagem demonstra insegurança ao tentar falar corretamente: "5 pães franceses? Muito formal. 5 pão francês? Oxe, e eu num sei português não, é?" Essa dúvida também pode se relacionar à concordância nominal e verbal, pois envolve a relação entre número (singular/plural) e forma das palavras. Analise as frases abaixo e assinale a alternativa em que todas as concordâncias estão CORRETAS, segundo a norma-padrão da língua portuguesa.',
    options: [
      { id: 'A', text: 'Os pão francês estava frescos e delicioso.', is_correct: false },
      { id: 'B', text: 'Os pães franceses estavam frescos e deliciosos.', is_correct: true },
      { id: 'C', text: 'O pães francês estavam fresco e deliciosa.', is_correct: false },
      { id: 'D', text: 'Os pães francês estavam frescos e deliciosa.', is_correct: false },
      { id: 'E', text: 'Os pães franceses estava frescos e deliciosa.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeia nominal plural',
        chip_label: 'M13 — nominal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? Com o que concordam adjetivo e verbo?', icon: 'Focus' },
          { label: 'Os pães franceses', detail: 'Núcleo «pães» (pl.) → artigo, adj e verbo no plural.', icon: 'Sandwich' },
          { label: 'Verbo', detail: '«Estavam» acompanha sujeito plural.', icon: 'Check' },
          { label: 'Adjetivos', detail: '«Frescos e deliciosos» — plural com «pães».', icon: 'Sparkles' },
          { label: 'Pegadinha', detail: 'Plural só no artigo ou só no adjetivo — cadeia quebrada.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Plural em cadeia: artigo + núcleo + adj + verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tirinha «5 pães franceses»: todas as concordâncias corretas em uma letra.',
          'Núcleo plural: «os pães franceses» — artigo, substantivo, adjetivo alinhados.',
          'Verbo: «estavam» (pl.) com sujeito plural.',
          'Adjetivos: «frescos e deliciosos» (pl. masc.).',
          'A/C/D/E: misturam sing./pl. (pão/pães, estava/estavam, fresco/frescos) — eliminar.',
          'Gabarito B.',
          'Em similares: marque artigo, núcleo, adjetivo e verbo — todos no mesmo número.',
        ],
        footer_rule: 'B: cadeia plural completa.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONCORDÂNCIA NOMINAL',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo do sintagma? Tudo concorda com ele.' },
          { label: 'Artigo + núcleo', value: 'Os pães — plural em ambos.' },
          { label: 'Adjetivo', value: 'Franceses, frescos, deliciosos — plural.' },
          { label: 'Verbal', value: 'Estavam — plural com sujeito.' },
          { label: 'Nesta questão', value: 'B — os pães franceses estavam frescos e deliciosos' },
        ],
        footer_rule: 'Não deixe «pão» no singular com «os».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cadeia quebrada em cada letra errada',
        items: [
          { label: 'A — pão / frescos', detail: '«Os pão» e «estava» com «frescos» misturados.', correct: 'Tudo plural: os pães estavam frescos.' },
          { label: 'C — o pães', detail: 'Artigo singular com substantivo plural.', correct: 'Os pães ou o pão — não misturar.' },
          { label: 'D — francês / deliciosa', detail: 'Adj singular/feminino com «pães» masc. pl.', correct: 'Franceses; deliciosos.' },
          { label: 'E — estava frescos', detail: 'Verbo singular com adj plural.', correct: 'Estavam frescos — alinhamento.' },
          { label: 'Em outra banca…', detail: 'Trocam por «bolos de chocolate».', correct: 'Mesmo teste: artigo, núcleo, adj, verbo.' },
        ],
        footer_rule: 'Só B mantém toda a cadeia plural.',
      },
    ],
  },

  'avancasp-aae-concordancia-amarelos-singular-3839711': {
    family: 'text_fragment',
    source_tec_id: '3839711',
    source_note: 'Análise «amarelos» Risadinha — AVANÇASP AAE Pref Potim 2026 tec 3839711',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AAE (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Leia o texto a seguir para responder à questão.',
    text_fragment:
      '<p>«Foi este último um dos mais <strong>divertidos</strong> e <strong>perigosos brinquedos</strong> da nossa infância: o velho corria atrás da gente brandindo a bengala, seus <strong>bastos bigodes amarelos</strong> fremindo sob as <strong>ventas vulcânicas</strong>» (Lima Barreto, <em>O Risadinha</em>).</p>',
    options: [
      { id: 'A', text: 'O termo "divertidos" está no masculino plural porque está concordando com "brinquedos".', is_correct: false },
      { id: 'B', text: 'O termo "bastos" está no masculino plural porque está concordando com "bigodes".', is_correct: false },
      { id: 'C', text: 'O termo "ventas" está no feminino plural porque está concordando com "vulcânicas".', is_correct: false },
      { id: 'D', text: 'O termo "perigosos" está no masculino plural porque está concordando com "brinquedos".', is_correct: false },
      {
        id: 'E',
        text: 'O termo "amarelos" está no masculino singular porque está concordando com "brinquedos".',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adj concorda com núcleo',
        chip_label: 'M13 — nominal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sintagma? Com quem o adj concorda?', icon: 'Focus' },
          { label: 'Bigodes amarelos', detail: '«Amarelos» qualifica «bigodes» (masc. pl.) — não brinquedos.', icon: 'User' },
          { label: 'Divertidos / perigosos', detail: 'Concordam com «brinquedos» — análises corretas em A e D.', icon: 'Check' },
          { label: 'Bastos', detail: 'Concorda com «bigodes» — B correta.', icon: 'Box' },
          { label: 'Pegadinha E', detail: 'Dizer que «amarelos» é singular e concorda com brinquedos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ache o núcleo do adjetivo — não o mais distante.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Risadinha (Lima Barreto): assinalar análise INCORRETA de concordância nominal.',
          'Trecho: «divertidos e perigosos brinquedos» + «bastos bigodes amarelos» + «ventas vulcânicas».',
          'A «divertidos» concorda com «brinquedos» (masc. pl.) — análise correta.',
          'B «bastos» concorda com «bigodes» (masc. pl.) — análise correta.',
          'C «ventas» fem. pl.; «vulcânicas» qualifica «ventas» — análise correta.',
          'D «perigosos» concorda com «brinquedos» — análise correta.',
          'E «amarelos» singular com «brinquedos»: FALSO — «amarelos» é masc. pl. com «bigodes».',
          'Gabarito E — única análise errada.',
          'Em similares: isole núcleo do adjetivo antes de julgar número/gênero.',
        ],
        footer_rule: 'Amarelos = plural com bigodes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJ × NÚCLEO',
        rows: [
          { label: 'Pergunta-teste', value: 'Com qual substantivo o adjetivo concorda?' },
          { label: 'Amarelos', value: 'Masc. pl. — qualifica «bigodes», não «brinquedos».' },
          { label: 'Divertidos / perigosos', value: 'Concordam com «brinquedos» (pl.).' },
          { label: 'Bastos', value: 'Concorda com «bigodes» (pl.).' },
          { label: 'Nesta questão', value: 'E — afirmação falsa (gabarito)' },
        ],
        footer_rule: 'Não confunda sintagma distante com núcleo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises corretas × E errada',
        items: [
          {
            label: 'A — divertidos',
            detail: '«Divertidos» qualifica «brinquedos» no trecho da infância.',
            correct: 'Masc. pl. com «brinquedos» — análise correta, não é gabarito.',
          },
          {
            label: 'B — bastos',
            detail: '«Bastos» acompanha o núcleo «bigodes» do professor.',
            correct: 'Adj. masc. pl. concordando com «bigodes» — análise correta.',
          },
          {
            label: 'C — ventas',
            detail: '«Vulcânicas» modifica «ventas», não o contrário.',
            correct: '«Ventas» fem. pl.; «vulcânicas» adj. fem. pl. — análise correta.',
          },
          {
            label: 'D — perigosos',
            detail: '«Perigosos» no mesmo sintagma de «brinquedos».',
            correct: 'Masc. pl. com «brinquedos» — análise correta, elimine D.',
          },
          {
            label: 'E — amarelos singular',
            detail: '«Amarelos» é plural e qualifica «bigodes», não «brinquedos».',
            correct: 'INCORRETA: «amarelos» masc. pl. concorda com «bigodes» — gabarito E.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «bigodes amarelos» por «cabelos grisalhos».',
            correct: 'Mesmo teste: adjetivo segue o núcleo do sintagma nominal.',
          },
        ],
        footer_rule: 'E erra número e núcleo de «amarelos».',
      },
    ],
  },

  'avancasp-acr-concordancia-incorreta-passam-3839870': {
    family: 'certo_errado',
    source_tec_id: '3839870',
    source_note: 'INCORRETA «Passam de 01h00» — AVANÇASP ACre Pref Potim 2026 tec 3839870',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Analise a concordância nas frases abaixo e assinale a alternativa INCORRETA.',
    options: [
      { id: 'A', text: 'Mais de dois mil produtos foram vendidos.', is_correct: false },
      { id: 'B', text: 'Quem vai apresentar os concorrentes?', is_correct: false },
      { id: 'C', text: 'Nada indicava que o evento terminaria cedo.', is_correct: false },
      { id: 'D', text: 'Passam de 01h00 da madrugada e ainda não tivemos nenhuma notícia.', is_correct: true },
      { id: 'E', text: 'Prometeram recompensar os participantes com uma excelente premiação.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — relógio',
        chip_label: 'M13 — especial',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? Comando pede a frase INCORRETA.', icon: 'Focus' },
          { label: 'Passar de horas', detail: '«Passa de 01h00» — expressão impessoal, verbo no singular.', icon: 'Clock' },
          { label: 'A–C–E', detail: 'Concordâncias corretas — produtos/vendidos; quem/vai; nada/indicava.', icon: 'Check' },
          { label: 'D — Passam', detail: 'Plural indevido na locução de tempo.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Achar que «01h00» ou «madrugada» puxam o verbo ao plural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Passar de + hora → passa (sing.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando INCORRETA: quatro frases certas, uma errada.',
          'A «produtos foram vendidos»: sujeito pl. + verbo pl. — correta.',
          'B «Quem vai apresentar»: «quem» → 3ª sing. «vai» — correta.',
          'C «Nada indicava»: sujeito «nada» (sing.) — correta.',
          'E «Prometeram recompensar»: sujeito pl. implícito «eles» — correta.',
          'D «Passam de 01h00»: deveria ser «Passa de 01h00» — incorreta.',
          'Gabarito D.',
          'Em similares: locuções impessoais de tempo (passar de, fazer) → singular.',
        ],
        footer_rule: 'Só D quebra a concordância.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PASSAR DE + HORA',
        rows: [
          { label: 'Pergunta-teste', value: 'É locução impessoal? Verbo no singular.' },
          { label: 'Passa de', value: '«Passa de meia-noite» — não pluraliza.' },
          { label: 'Quem / nada', value: '«Quem vai» (sing.); «nada indicava» (sing.).' },
          { label: 'Nesta questão', value: 'D incorreta — «Passam» → «Passa»' },
        ],
        footer_rule: 'INCORRETA = D.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'INCORRETA — cada letra certa exceto D',
        items: [
          {
            label: 'A — foram vendidos',
            detail: '«Mais de dois mil produtos» como sujeito plural.',
            correct: '«Produtos» (pl.) → «foram vendidos» — concordância correta.',
          },
          {
            label: 'B — Quem vai',
            detail: '«Quem» como sujeito indeterminado singular.',
            correct: '«Quem» exige 3ª sing.: «Quem vai apresentar» — correto.',
          },
          {
            label: 'C — Nada indicava',
            detail: '«Nada» funciona como sujeito singular da oração.',
            correct: 'Sujeito «nada» (sing.) → «indicava» — concordância correta.',
          },
          {
            label: 'E — Prometeram',
            detail: 'Sujeito elíptico plural («eles») com verbo no plural.',
            correct: '«Prometeram recompensar» — plural alinhado ao sujeito.',
          },
          {
            label: 'D — Passam de 01h00',
            detail: 'Plural na locução impessoal de tempo.',
            correct: 'INCORRETA: «Passa de 01h00 da madrugada…» — locução no singular.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam por «Já passam das duas» para induzir plural.',
            correct: 'Transferência: «passa das duas» — mesma regra impessoal.',
          },
        ],
        footer_rule: 'Gabarito D — passa, não passam.',
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
