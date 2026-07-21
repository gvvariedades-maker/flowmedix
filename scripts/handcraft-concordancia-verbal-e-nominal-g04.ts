#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — concordancia-verbal-e-nominal-g04 (8 slugs · Concordância · lote 4, q25–32).
 *
 *   npx tsx scripts/handcraft-concordancia-verbal-e-nominal-g04.ts
 *   npm run audit:questao-readiness -- --lote=concordancia-verbal-e-nominal-g04 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=concordancia-verbal-e-nominal-g04 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'concordancia-verbal-e-nominal-g04';
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
    'adjetivo composto',
    'número + de + plural',
    'pluralização em cadeia',
    'INCORRETA',
    'subjuntivo × indicativo',
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
      reviewer: 'handcraft:concordancia-verbal-e-nominal-g04',
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
  'avancasp-acs-concordancia-assinale-a-alternativa-que-contem-a-3452381': {
    family: 'certo_errado',
    source_tec_id: '3452381',
    source_note: 'INCORRETA nominal «voaram junta» — AVANÇASP ACS Pref Morungaba 2025 tec 3452381',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Morungaba)',
      orgao: 'Pref. Morungaba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa que contém a frase INCORRETA em relação à concordância nominal.',
    options: [
      { id: 'A', text: 'Essa linda homenagem acontecerá na próxima sexta-feira.', is_correct: false },
      { id: 'B', text: 'Os ônibus saíram cheios do ponto final.', is_correct: false },
      { id: 'C', text: 'Todos os carros que ele já teve eram vermelhos.', is_correct: false },
      { id: 'D', text: 'As toalhas de mesa ficaram muito encardidas depois do jantar.', is_correct: false },
      { id: 'E', text: 'As duas araras-azuis voaram junta até a árvore.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — adj × núcleo',
        chip_label: 'M13 — nominal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Com qual substantivo o adjetivo concorda?', icon: 'Focus' },
          { label: 'Duas araras', detail: 'Sujeito plural feminino — adjetivo no plural.', icon: 'Bird' },
          { label: 'Junta × juntas', detail: 'Advérbio de modo ou adjetivo? «Juntas» concorda com araras.', icon: 'Users' },
          { label: 'A–D corretas', detail: 'Homenagem/linda; ônibus/cheios; carros/vermelhos; toalhas/encardidas.', icon: 'Check' },
          { label: 'Pegadinha E', detail: 'Tratar «junta» como advérbio invariável.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'INCORRETA = E — juntas, não junta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Núcleo → adjetivo → letras',
        meta: slideMeta,
        steps: [
          'Comando INCORRETA: quatro frases com concordância nominal correta, uma errada.',
          'A «linda homenagem»: adj. fem. sing. com núcleo «homenagem» — correta.',
          'B «ônibus cheios»: predicativo com núcleo plural — correta.',
          'C «carros vermelhos» / D «toalhas encardidas»: cadeia plural alinhada — corretas.',
          'E «araras voaram junta»: sujeito «as duas araras» (fem. pl.) exige «juntas».',
          'Gabarito E — única frase com concordância nominal incorreta.',
          'Em similares: «junto/junta» como adjetivo flexiona; como advérbio («vieram junto») é invariável.',
        ],
        footer_rule: 'Araras (pl.) → juntas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJ × NÚCLEO',
        rows: [
          { label: 'Pergunta-teste', value: 'Com qual substantivo o adjetivo concorda?' },
          { label: 'Juntas', value: 'Adj. de modo = concorda: «as araras voaram juntas».' },
          { label: 'Junto (adv.)', value: 'Invariável quando = «em companhia»: «vieram junto».' },
          { label: 'Nesta questão', value: 'E incorreta — «junta» → «juntas»' },
        ],
        footer_rule: 'Duas araras → juntas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'INCORRETA — só E quebra a nominal',
        items: [
          { label: 'A — linda homenagem', detail: 'Adj. «linda» qualifica «homenagem» (fem. sing.).', correct: 'Concordância correta — não é gabarito.' },
          { label: 'B — cheios', detail: 'Predicativo «cheios» com «ônibus» (masc. pl.).', correct: 'Nominal correta — elimine B.' },
          { label: 'C — vermelhos', detail: '«Carros» (pl.) → «vermelhos» (pl.).', correct: 'Cadeia plural ok — elimine C.' },
          { label: 'D — encardidas', detail: '«Toalhas» (fem. pl.) → «encardidas».', correct: 'Concordância correta — elimine D.' },
          { label: 'E — junta', detail: '«As duas araras» (fem. pl.) com «junta» no singular.', correct: 'INCORRETA: «voaram juntas até a árvore» — gabarito E.' },
          { label: 'Em outra banca…', detail: 'Trocam por «as irmãs saíram junta».', correct: 'Mesmo teste: adjetivo segue o núcleo plural.' },
        ],
        footer_rule: 'Gabarito E — juntas com araras.',
      },
    ],
  },

  'avancasp-ag-concordancia-a-sentenca-em-que-as-concordancias-v-3457300': {
    family: 'conceito',
    source_tec_id: '3457300',
    source_note: 'Verbal+nominal incorretas «é necessário tantas obras» — AVANÇASP Ag Pref Caconde 2025 tec 3457300',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref Caconde)',
      orgao: 'Pref. Caconde',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'A sentença em que as concordâncias verbal e nominal estão incorretas é:',
    options: [
      { id: 'A', text: 'Se é necessário tantas obras, autorizo que as façam.', is_correct: true },
      { id: 'B', text: 'Nem só de futilidades vivem os jovens.', is_correct: false },
      { id: 'C', text: 'O museu contratou cerca de quinze pessoas nesta semana.', is_correct: false },
      { id: 'D', text: 'Eles compraram uma casa próxima à praia.', is_correct: false },
      { id: 'E', text: 'As flores amarelas estão mais chamativas nesta primavera.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Verbal + nominal juntas',
        chip_label: 'M13 — dupla',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? Verbo e adjetivo alinhados?', icon: 'Focus' },
          { label: 'A — duplo erro', detail: '«É necessário tantas obras» — verbal e nominal desalinhadas.', icon: 'XCircle' },
          { label: 'B — sujeito posposto', detail: '«Vivem os jovens» — núcleo plural, verbo plural.', icon: 'Check' },
          { label: 'Cerca de', detail: '«Cerca de quinze pessoas» — verbo plural com núcleo «pessoas».', icon: 'Hash' },
          { label: 'Pegadinha', detail: 'Achar que «é necessário» aceita plural sem ajustar adjetivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Tantas obras → são necessárias.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frase com verbal E nominal incorretas — só uma letra.',
          'A «Se é necessário tantas obras»: deveria ser «Se são necessárias tantas obras» — duplo desvio.',
          'B «vivem os jovens»: sujeito posposto plural + verbo plural — correta.',
          'C «contratou… pessoas»: «cerca de» não impede plural «contratou» com «pessoas» — correta.',
          'D «casa próxima»: nominal e verbal corretas — eliminar.',
          'E «flores amarelas estão chamativas»: cadeia plural — correta.',
          'Gabarito A — única com dupla concordância errada.',
          'Em similares: «tantas/somos necessários» — teste núcleo + adjetivo + verbo.',
        ],
        footer_rule: 'Só A erra verbal e nominal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NECESSÁRIO × OBRAS',
        rows: [
          { label: 'Pergunta-teste', value: 'Núcleo plural? Adjetivo e verbo acompanham.' },
          { label: 'Errado', value: '«É necessário tantas obras».' },
          { label: 'Correto', value: '«São necessárias tantas obras».' },
          { label: 'Nesta questão', value: 'A — verbal + nominal incorretas' },
        ],
        footer_rule: 'Obras (pl.) → são necessárias.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Por que só A está duplamente errada',
        items: [
          { label: 'A — é necessário', detail: '«Tantas obras» (pl.) com «é necessário» (sing.).', correct: '«São necessárias tantas obras» — gabarito A.' },
          { label: 'B — vivem', detail: '«Os jovens» (pl.) → «vivem» — sujeito posposto ok.', correct: 'Verbal correta — elimine B.' },
          { label: 'C — contratou', detail: '«Pessoas» como núcleo após «cerca de».', correct: 'Concordância verbal correta.' },
          { label: 'D — próxima', detail: '«Casa» fem. sing. → «próxima».', correct: 'Nominal correta — elimine D.' },
          { label: 'E — chamativas', detail: '«Flores amarelas» → «estão chamativas».', correct: 'Cadeia plural correta.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Se é preciso tantas reformas».', correct: 'Mesmo teste: plural no adjetivo e no verbo.' },
        ],
        footer_rule: 'A: são necessárias tantas obras.',
      },
    ],
  },

  'avancasp-acd-concordancia-em-qual-das-alternativas-abaixo-a-fr-3554865': {
    family: 'conceito',
    source_tec_id: '3554865',
    source_note: 'Reescrita no plural brinquedos — AVANÇASP ACD Pref Vinhedo 2025 tec 3554865',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACD (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em qual das alternativas abaixo a frase a seguir foi reescrita no plural com a concordância correta? “A criança ganhou livro infantil, camiseta e saia azul, quebra-cabeça, urso de pelúcia marrom, bola colorida e boneca de pano.”',
    options: [
      {
        id: 'A',
        text: 'As crianças ganharam livros infantis, camisetas e saias azuis, quebra-cabeças, urso de pelúcia marrons, bola coloridas e bonecas de pano.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'As criança ganharam livros infantis, camisetas e saias azuis, quebras-cabeças, ursos de pelúcia marrons, bolas coloridas e bonecas de panos.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'As crianças ganharam livros infantil, camisetas e saias azuis, quebras-cabeças, ursos de pelúcias marrom, bolas colorida e boneca de pano.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'As crianças ganhou livro infantis, camisetas e saias azul, quebra-cabeças, ursos de pelúcia marrons, bola coloridas e bonecas de pano.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'As crianças ganharam livros infantis, camisetas e saias azuis, quebra-cabeças, ursos de pelúcia marrons, bolas coloridas e bonecas de pano.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Plural em cadeia',
        chip_label: 'M13 — reescrita',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada núcleo pluralizou? Adj e verbo acompanham?', icon: 'Focus' },
          { label: 'Criança → crianças', detail: 'Sujeito plural → «ganharam».', icon: 'Users' },
          { label: 'Lista de objetos', detail: 'Livros, camisetas, saias, ursos, bolas, bonecas — tudo no plural.', icon: 'Gift' },
          { label: 'Compostos', detail: 'Quebra-cabeças (pl. no segundo termo); «de pano» invariável.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Plural só no artigo ou só em um adjetivo da lista.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Plural completo: sujeito, verbo, nomes e adjetivos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Original no singular — reescrever tudo no plural com concordância correta.',
          'Sujeito «as crianças» → verbo «ganharam» (pl.).',
          'Objetos: livros infantis, camisetas, saias azuis, quebra-cabeças, ursos de pelúcia marrons, bolas coloridas, bonecas de pano.',
          'A erra: «urso» sing., «bola coloridas» — eliminar.',
          'B erra: «as criança», «de panos» — eliminar.',
          'C erra: «livros infantil», «pelúcias marrom» — eliminar.',
          'D erra: «ganhou», «livro infantis» — eliminar.',
          'Gabarito E — cadeia plural completa.',
          'Em similares: pluralize sujeito, verbo e cada item da enumeração — adjetivos com o núcleo.',
        ],
        footer_rule: 'E: tudo pluralizado corretamente.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REESCRITA PLURAL',
        rows: [
          { label: 'Pergunta-teste', value: 'Cada elemento da lista está no plural?' },
          { label: 'Verbo', value: 'Crianças → ganharam.' },
          { label: 'Adjetivos', value: 'Infantis, azuis, marrons, coloridas — pl. com núcleo.' },
          { label: 'Composto', value: 'Quebra-cabeças — plural no segundo elemento.' },
          { label: 'Nesta questão', value: 'E — reescrita integral correta' },
        ],
        footer_rule: 'Marque sujeito, verbo e cada objeto da lista.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Onde cada letra quebra a cadeia',
        items: [
          { label: 'A — urso / bola', detail: '«Urso» no singular; «bola coloridas» desalinhado.', correct: '«Ursos… bolas coloridas».' },
          { label: 'B — criança / panos', detail: '«As criança»; «de panos» (prep. invariável).', correct: '«As crianças… bonecas de pano».' },
          { label: 'C — infantil / marrom', detail: '«Livros infantil»; «pelúcias marrom».', correct: '«Livros infantis»; «marrons».' },
          { label: 'D — ganhou / infantis', detail: 'Verbo singular; «livro infantis».', correct: '«Ganharam livros infantis».' },
          { label: 'E — correta', detail: 'Plural em sujeito, verbo, nomes e adjetivos.', correct: 'Gabarito E — cadeia completa.' },
          { label: 'Em outra banca…', detail: 'Trocam brinquedos por «brinquedo educativo».', correct: 'Mesmo trilho: pluralizar toda a enumeração.' },
        ],
        footer_rule: 'Só E mantém a reescrita correta.',
      },
    ],
  },

  'vunesp-ro-sa-concordancia-leia-o-texto-a-seguir-para-responder-3558391': {
    family: 'text_fragment',
    source_tec_id: '3558391',
    source_note: 'Texto neurologia higiene bucal — VUNESP RO SAMU Osasco 2025 tec 3558391',
    meta: {
      banca: 'VUNESP',
      prova: 'RO (SAMU Osasco)',
      orgao: 'SAMU Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Leia o texto a seguir para responder à questão abaixo.',
    text_fragment:
      '<p><strong>Pequenas coisas que os neurologistas gostariam que você fizesse pelo seu cérebro</strong></p><p>Pequenas mudanças na sua rotina diária podem contribuir muito para proteger o centro de controle do seu corpo e prevenir o declínio cognitivo. Os cientistas acreditam que até 45% dos casos de demência poderiam ser adiados ou evitados com mudanças simples no comportamento.</p><p>Exercício beneficia o cérebro ao aumentar o fluxo sanguíneo. Comer leguminosas, grãos integrais, frutas e verduras ajuda a controlar o colesterol. A <strong>higiene bucal</strong> é essencial para prevenir infecções e doenças gengivais — pesquisas encontraram ligação entre doenças gengivais e demência.</p><p><em>Assinale a alternativa redigida em conformidade com a norma-padrão de concordância verbal e nominal.</em></p>',
    options: [
      {
        id: 'A',
        text: 'Já foi apontado, em pesquisas, conclusões de que doenças gengivais e demência tem ligação.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Existe, em sua rotina diária, pequenas mudanças bastante capaz de proteger o centro de controle do seu corpo.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Houveram constatações à ideia de que evitar 45% dos casos de demência com higiene oral ainda é pouco.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A pesquisa sobre demência ainda é meia inconclusiva acerca das infecções orais que se espalha para os seios da face.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Está provado que a higiene oral é necessária para que se previnam infecções e doenças gengivais.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — texto',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Verbo e adjetivo alinhados?', icon: 'Focus' },
          { label: 'Tema do texto', detail: 'Cérebro, demência, higiene bucal — concordância na reescrita.', icon: 'Brain' },
          { label: 'E — correta', detail: '«Higiene oral é necessária» + subjuntivo «se previnam» com plural.', icon: 'Check' },
          { label: 'A — tem', detail: 'Sujeito composto «doenças e demência» → «têm».', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Existir/haver no plural; adjetivo longe do núcleo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'E: higiene é necessária; previnam infecções.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto sobre neurologia e higiene bucal — marcar frase com concordância correta.',
          'A «doenças… e demência tem»: sujeito composto → «têm ligação» — eliminar.',
          'B «Existe… pequenas mudanças… capaz»: existir com plural + «capaz» sing. — eliminar.',
          'C «Houveram constatações»: haver como existencial → «Houve constatações» — eliminar.',
          'D «infecções… que se espalha»: relativa com núcleo plural → «espalham» — eliminar.',
          'E «higiene oral é necessária… se previnam»: nominal e verbal corretas.',
          'Gabarito E.',
          'Em similares: teste sujeito, verbo principal e relativa separadamente.',
        ],
        footer_rule: 'Só E mantém verbal e nominal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRÊS TESTES',
        rows: [
          { label: 'Sujeito composto', value: 'Doenças e demência → têm.' },
          { label: 'Existir', value: '«Existem pequenas mudanças» — verbo pessoal plural.' },
          { label: 'Relativa', value: '«Infecções que se espalham» — núcleo plural.' },
          { label: 'Nesta questão', value: 'E — está provado… é necessária… se previnam' },
        ],
        footer_rule: 'Uma frase, três pontos de concordância.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erro de cada distrator',
        items: [
          { label: 'A — tem', detail: 'Doenças + demência (dois núcleos) com «tem» singular.', correct: '«…têm ligação» — sujeito composto.' },
          { label: 'B — existe / capaz', detail: '«Pequenas mudanças» com «existe» e «capaz» singular.', correct: '«Existem… mudanças capazes».' },
          { label: 'C — houveram', detail: 'Haver existencial no plural.', correct: '«Houve constatações» — impessoal singular.' },
          { label: 'D — espalha', detail: '«Infecções» (pl.) com verbo «espalha» (sing.).', correct: '«…que se espalham para os seios».' },
          { label: 'E — correta', detail: 'Higiene (sing.) → é necessária; infecções → previnam.', correct: 'Gabarito E — concordância integral.' },
          { label: 'Em outra banca…', detail: 'Trocam tema por exercício e alimentação.', correct: 'Mesmo método: núcleo → verbo → adjetivo.' },
        ],
        footer_rule: 'E alinha sujeito, verbo e subjuntivo.',
      },
    ],
  },

  'apice-ace-pr-concordancia-no-que-diz-respeito-a-concordancia-n-3558981': {
    family: 'conceito',
    source_tec_id: '3558981',
    source_note: 'Problema nominal «médicas-cirúrgicas» — Ápice ACE Pref Pocinhos 2025 tec 3558981',
    meta: {
      banca: 'Ápice',
      prova: 'ACE (Pref Pocinhos)',
      orgao: 'Pref. Pocinhos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No que diz respeito à concordância nominal, assinale, a seguir, a alternativa que apresenta um problema de concordância.',
    options: [
      {
        id: 'A',
        text: 'Minha aluna e meu aluno foram aprovados para a segunda fase do exame nacional.',
        is_correct: false,
      },
      { id: 'B', text: 'As intervenções médicas-cirúrgicas foram um sucesso!.', is_correct: true },
      {
        id: 'C',
        text: 'Fica óbvio que a maioria dos casos de gripe suína é reveladora da falta de condições socioambiental.',
        is_correct: false,
      },
      { id: 'D', text: 'As palavras-chave daquele artigo foram bem selecionadas.', is_correct: false },
      { id: 'E', text: 'As fitas verde-amarelas foram entregues hoje.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adjeto composto',
        chip_label: 'M13 — nominal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Adjetivo composto: qual elemento flexiona?', icon: 'Focus' },
          { label: 'Médico-cirúrgico', detail: 'Uma só qualidade → «médico-cirúrgicas», não «médicas-cirúrgicas».', icon: 'Stethoscope' },
          { label: 'Verde-amarelo', detail: 'Cor composta → «verde-amarelas» (só o segundo varia).', icon: 'Palette' },
          { label: 'Palavras-chave', detail: 'Composto substantivo + adj. — «palavras-chave» ok.', icon: 'Key' },
          { label: 'Pegadinha B', detail: 'Pluralizar os dois membros do composto de qualidade.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Médico-cirúrgicas — só o segundo flexiona.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa com PROBLEMA de concordância nominal.',
          'A «aluna e aluno aprovados»: coordenação com adj. no masc. pl. — correta.',
          'B «médicas-cirúrgicas»: composto de qualidade única → «médico-cirúrgicas» — problema.',
          'C «socioambiental»: pode ser analisado, mas «falta de condições» aceita sing. em prova — não é o foco.',
          'D «palavras-chave selecionadas» / E «verde-amarelas»: compostos corretos.',
          'Gabarito B — adjetivo composto mal flexionado.',
          'Em similares: luso-brasileiro, ítalo-americano — só o segundo varia.',
        ],
        footer_rule: 'B: médico-cirúrgicas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJ. COMPOSTO',
        rows: [
          { label: 'Uma qualidade', value: 'Médico-cirúrgico → intervenções médico-cirúrgicas.' },
          { label: 'Regra', value: 'Só o último elemento varia em gênero/número.' },
          { label: 'Verde-amarelo', value: 'Fitas verde-amarelas — modelo da prova.' },
          { label: 'Nesta questão', value: 'B — «médicas-cirúrgicas» incorreto' },
        ],
        footer_rule: 'Não pluralize os dois membros.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Problema nominal — gabarito B',
        items: [
          { label: 'A — aprovados', detail: 'Dois núcleos masc. → adj. masc. pl.', correct: 'Concordância correta — elimine A.' },
          { label: 'B — médicas-cirúrgicas', detail: 'Plural nos dois termos do composto de qualidade.', correct: '«Intervenções médico-cirúrgicas» — gabarito B.' },
          { label: 'C — socioambiental', detail: 'Possível debate, mas não é o gabarito da banca.', correct: 'Foco da questão: composto médico-cirúrgico.' },
          { label: 'D — palavras-chave', detail: 'Composto substantivo + adj. invariável no 2º.', correct: 'Forma aceita — elimine D.' },
          { label: 'E — verde-amarelas', detail: 'Modelo correto de composto de cor.', correct: 'Só o segundo varia — elimine E.' },
          { label: 'Em outra banca…', detail: 'Trocam por «curso teórico-práticos».', correct: '«Teórico-práticos» — mesma regra.' },
        ],
        footer_rule: 'B quebra a regra do composto.',
      },
    ],
  },

  'vunesp-tec-h-concordancia-a-norma-padrao-de-concordancia-nomin-3572925': {
    family: 'conceito',
    source_tec_id: '3572925',
    source_note: 'Concordância + crase correta — VUNESP Tec HC-FAMEMA 2025 tec 3572925',
    meta: {
      banca: 'VUNESP',
      prova: 'Tec (HC-FAMEMA)',
      orgao: 'HC-FAMEMA',
      ano: '2025',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      'A norma-padrão de concordância nominal e verbal, assim como a de emprego do acento indicativo de crase, está respeitada em:',
    options: [
      { id: 'A', text: 'É importante praticar boas ações sem olhar à quem, tornando-se um craque em cidadania.', is_correct: false },
      { id: 'B', text: 'O cheque é desconhecido à alguns, mas há quem não saia de casa sem levá-los.', is_correct: false },
      {
        id: 'C',
        text: 'Eram fartos em voos o serviço de bordo, mas às empresas os encolheram para economizar.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Apesar de considerar as amizades importante, hoje é difícil dar atenção à todas elas.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Tinha-se mais liberdade antes, mas a sociedade perdeu-a devido à violência nas cidades.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Concordância + crase',
        chip_label: 'M13 — pacote',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Núcleo ok? Crase antes de artigo feminino?', icon: 'Focus' },
          { label: 'E — correta', detail: '«Tinha-se» impessoal; «perdeu-a»; «devido à violência».', icon: 'Check' },
          { label: 'À quem', detail: 'Sem crase antes de pronome — A erra.', icon: 'Ban' },
          { label: 'Sujeito posposto', detail: 'C «serviço… encolheram» — verbo com empresa (pl.).', icon: 'Link2' },
          { label: 'Pegadinha', detail: 'Crase indevida ou faltante junto com erro verbal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'E: verbal, nominal e crase ok.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frase com concordância verbal, nominal E crase corretas.',
          'A «olhar à quem»: crase indevida antes de pronome — eliminar.',
          'B «desconhecido à alguns»: crase errada; «levá-los» com «cheque» — eliminar.',
          'C «Eram fartos… serviço»: sujeito posposto + verbo plural desalinhado — eliminar.',
          'D «amizades importante» / «à todas»: nominal e crase erradas — eliminar.',
          'E «Tinha-se… perdeu-a… devido à violência»: pacote correto.',
          'Gabarito E.',
          'Em similares: teste crase (a+a) separado da concordância.',
        ],
        footer_rule: 'Só E passa nos três filtros.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRÊS FILTROS',
        rows: [
          { label: 'Crase', value: '«Devido à violência» — prep. + art. fem.' },
          { label: 'Sem crase', value: 'Antes de pronome: «a quem», não «à quem».' },
          { label: 'Impessoal', value: '«Tinha-se mais liberdade» — se + verbo 3ª sing.' },
          { label: 'Nesta questão', value: 'E — única frase integralmente correta' },
        ],
        footer_rule: 'Concordância + crase na mesma letra.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erro em A–D',
        items: [
          { label: 'A — à quem', detail: 'Crase indevida antes do pronome «quem».', correct: '«Sem olhar a quem» — sem crase.' },
          { label: 'B — à alguns', detail: 'Crase antes de «alguns»; «levá-los» incoerente.', correct: '«Desconhecido a alguns»; pronome coerente.' },
          { label: 'C — encolheram', detail: '«Serviço» (sing.) com «eram fartos» / «encolheram».', correct: 'Concordância verbal desalinhada.' },
          { label: 'D — importante / à todas', detail: '«Amizades importante»; crase antes de «todas».', correct: '«Importantes»; «a todas elas».' },
          { label: 'E — correta', detail: 'Impessoal, objeto «-a» e «devido à» corretos.', correct: 'Gabarito E.' },
          { label: 'Em outra banca…', detail: 'Mescla crase com «devido a» sem artigo.', correct: '«Devido à» + fem.; «devido a» + masc.' },
        ],
        footer_rule: 'E: liberdade, sociedade, violência — tudo certo.',
      },
    ],
  },

  'vunesp-ag-pr-concordancia-esta-em-conformidade-com-a-norma-pad-3583302': {
    family: 'conceito',
    source_tec_id: '3583302',
    source_note: 'Indígenas encontradas — VUNESP Ag Pref Itatiba 2025 tec 3583302',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Está em conformidade com a norma-padrão de concordância nominal e verbal a frase:',
    options: [
      { id: 'A', text: 'O debate a respeito da saúde dos povos indígenas precisa ser mais frequentes.', is_correct: false },
      {
        id: 'B',
        text: 'Indígenas da etnia curuaia podem ser encontradas na região sudeste do estado do Pará.',
        is_correct: true,
      },
      { id: 'C', text: 'É importante haverem representantes indígenas nos órgãos que cuidam desses povos.', is_correct: false },
      { id: 'D', text: 'Cabem ao governo criar políticas que favoreçam a todos, sobretudo os mais vulneráveis.', is_correct: false },
      {
        id: 'E',
        text: 'Existem bastante fármacos com diversos efeitos colaterais usados na medicina ocidental.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — indígenas',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? Verbo e particípio alinhados?', icon: 'Focus' },
          { label: 'B — correta', detail: '«Indígenas… encontradas» — particípio fem. pl. com sujeito.', icon: 'Check' },
          { label: 'A — frequentes', detail: '«Debate» (sing.) → «frequente», não «frequentes».', icon: 'XCircle' },
          { label: 'Haver', detail: '«É importante haver» — impessoal, não «haverem».', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Cabem/cabe; existem/bastante — quantidade e núcleo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'B: indígenas → encontradas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frase com concordância verbal e nominal corretas.',
          'A «debate… frequentes»: núcleo «debate» (sing.) → «frequente» — eliminar.',
          'B «Indígenas… podem ser encontradas»: sujeito fem. pl. + particípio «encontradas» — correto.',
          'C «haverem representantes»: haver impessoal → «haver» sem plural — eliminar.',
          'D «Cabem ao governo»: «caber» impessoal → «Cabe ao governo» — eliminar.',
          'E «Existem bastante fármacos»: «bastante» com plural → «muitos»/«bastantes» — eliminar.',
          'Gabarito B.',
          'Em similares: particípio de voz passiva concorda com o sujeito.',
        ],
        footer_rule: 'Particípio segue o sujeito «indígenas».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PARTICÍPIO × SUJEITO',
        rows: [
          { label: 'Pergunta-teste', value: 'Quem é encontrado? O sujeito paciente.' },
          { label: 'Passiva', value: '«Podem ser encontradas» — fem. pl. com «indígenas».' },
          { label: 'Haver', value: '«É importante haver» — infinitivo, sem «haverem».' },
          { label: 'Caber', value: 'Impersonal → «Cabe ao governo».' },
          { label: 'Nesta questão', value: 'B — concordância integral' },
        ],
        footer_rule: 'Encontradas = indígenas (fem. pl.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada distrator',
        items: [
          { label: 'A — frequentes', detail: '«Debate» singular com adj. plural.', correct: '«Precisa ser mais frequente».' },
          { label: 'B — encontradas', detail: 'Particípio fem. pl. com sujeito «indígenas».', correct: 'Gabarito B — passiva correta.' },
          { label: 'C — haverem', detail: 'Pluralização indevida de haver impessoal.', correct: '«É importante haver representantes».' },
          { label: 'D — cabem', detail: '«Caber» impessoal no plural.', correct: '«Cabe ao governo criar políticas».' },
          { label: 'E — bastante', detail: '«Bastante» invariável ou «muitos fármacos».', correct: '«Existem muitos fármacos».' },
          { label: 'Em outra banca…', detail: 'Trocam por «mulheres indígenas são respeitadas».', correct: 'Mesma regra: particípio = sujeito.' },
        ],
        footer_rule: 'Só B está correta.',
      },
    ],
  },

  'vunesp-acs-p-concordancia-leia-o-texto-a-seguir-para-responder-3607135': {
    family: 'text_fragment',
    source_tec_id: '3607135',
    source_note: 'Alma gêmea Munroe número incontável — VUNESP ACS Pref Osasco 2025 tec 3607135',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e assinale a alternativa que apresenta uma frase reescrita em conformidade com a norma-padrão de concordância.',
    text_fragment:
      '<p><strong>E se?</strong> — Randall Munroe (adaptado)</p><p>E se todo mundo realmente tivesse uma alma gêmea, que fosse uma pessoa aleatória em qualquer lugar do mundo? Você não sabe nada sobre a pessoa, quem é ou onde está, mas — como diz o clichê — vocês se reconhecerão num cruzar de olhares.</p><p><strong>Um argumento bem simples demonstra que não devemos nos limitar aos seres humanos do passado</strong>, pois também temos que incluir um número incontável de seres humanos do futuro. Considerando a restrição de faixa etária, a maioria da humanidade teria uma reserva de aproximadamente meio bilhão de combinações possíveis.</p>',
    options: [
      { id: 'A', text: 'Vamos supor que se determinassem a sua alma gêmea ao nascer.', is_correct: false },
      { id: 'B', text: 'Logo de cara, isso faz com que seja levantado algumas perguntas.', is_correct: false },
      {
        id: 'C',
        text: 'Um número incontável de seres humanos do futuro teria que ser incluído na conta.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'A maioria da humanidade teriam quinhentas milhões de combinações possíveis.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Mas vamos supor que todo dia você troque olhares com uma média de poucas dezenas de gente que nunca viu.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Número + de + plural',
        chip_label: 'M13 — núcleo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que concorda?', icon: 'Focus' },
          { label: 'Número incontável', detail: 'Núcleo «número» (sing.) → verbo no singular «teria».', icon: 'Hash' },
          { label: 'De seres humanos', detail: 'Complemento plural não puxa o verbo ao plural.', icon: 'Users' },
          { label: 'Maioria', detail: '«A maioria… teria» — núcleo «maioria» (sing.).', icon: 'PieChart' },
          { label: 'Pegadinha', detail: 'Pluralizar verbo por «seres humanos» ou «perguntas» vizinhos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Número (sing.) → teria.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Munroe (alma gêmea): frase reescrita com concordância correta.',
          'C «Um número incontável de seres… teria»: núcleo «número» (sing.) → «teria» — correto.',
          'A «se determinassem a sua alma»: voz passiva/se — «se determinasse» — eliminar.',
          'B «seja levantado algumas perguntas»: particípio sing. + «algumas» pl. — eliminar.',
          'D «A maioria… teriam»: núcleo «maioria» (sing.) → «teria» — eliminar.',
          'E «todo dia você troque»: hábito → indicativo «troca», não subjuntivo — eliminar.',
          'Gabarito C.',
          'Em similares: «A maioria de», «Um grupo de», «O número de» — teste o núcleo.',
        ],
        footer_rule: 'C: número… teria que ser incluído.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÚCLEO «NÚMERO»',
        rows: [
          { label: 'Pergunta-teste', value: 'Núcleo = «número» ou «seres humanos»?' },
          { label: 'Regra', value: '«Um número de…» → verbo no singular.' },
          { label: 'Maioria', value: '«A maioria teria» — núcleo sing. (ou teriam partitivo).' },
          { label: 'Hábito', value: '«Todo dia você troca» — indicativo, não subjuntivo.' },
          { label: 'Nesta questão', value: 'C — teria (sing.) com «número»' },
        ],
        footer_rule: 'Incontável de seres → teria.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Por que só C passa',
        items: [
          { label: 'A — determinassem', detail: 'Construção com «se» + alma gêmea mal formada.', correct: '«Se determinasse a alma gêmea» — voz passiva.' },
          { label: 'B — levantado algumas', detail: 'Particípio singular com «algumas perguntas» plural.', correct: '«Sejam levantadas algumas perguntas».' },
          { label: 'C — teria', detail: 'Núcleo «número» (sing.) com verbo singular.', correct: 'Gabarito C — concordância correta.' },
          { label: 'D — teriam', detail: '«Maioria» como núcleo singular com «teriam».', correct: '«A maioria teria…» ou «teriam» com «humanos».' },
          { label: 'E — troque', detail: '«Todo dia» (hábito) com subjuntivo «troque».', correct: '«Todo dia você troca olhares» — indicativo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Um monte de pessoas».', correct: 'Mesmo teste: monte (sing.) → verbo sing.' },
        ],
        footer_rule: 'C: número incontável → teria.',
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
