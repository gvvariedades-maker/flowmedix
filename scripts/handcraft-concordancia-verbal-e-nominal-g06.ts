#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — concordancia-verbal-e-nominal-g06 (5 slugs · Concordância · lote 6, q41–45).
 *
 *   npx tsx scripts/handcraft-concordancia-verbal-e-nominal-g06.ts
 *   npm run audit:questao-readiness -- --lote=concordancia-verbal-e-nominal-g06 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=concordancia-verbal-e-nominal-g06 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'concordancia-verbal-e-nominal-g06';
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
    'partitivo (maioria)',
    'concordância ideológica',
    'expressões de tempo (meio-dia)',
    'sujeito composto',
    'todo mundo',
    'subjuntivo × quem',
    'VF itens I–V',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'text_fragment' | 'vf';

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
      reviewer: 'handcraft:concordancia-verbal-e-nominal-g06',
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
  'avancasp-mon-concordancia-a-maioria-das-mulheres-por-melhores-3739269': {
    family: 'conceito',
    source_tec_id: '3739269',
    source_note: 'VF maioria luta/lutam/lutamos — AVANÇASP Mon Pref Cunha 2025 tec 3739269',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Mon (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«A maioria das mulheres __________ por melhores condições de vida.» Em relação à frase acima, analise cada afirmativa a seguir e assinale a alternativa que apresenta todas as corretas:\n\n' +
      'I - Preenchendo a lacuna com «lutamos», subentende-se que a autora da frase se inclui na afirmação, num uso especial de concordância.\n\n' +
      'II - No presente do indicativo, a lacuna pode ser preenchida com «luta» ou «lutam», estando ambas corretas.\n\n' +
      'III - No presente do indicativo, a lacuna pode ser preenchida somente com «lutamos» ou «luta».\n\n' +
      'IV - No presente do indicativo, a lacuna pode ser preenchida somente com «lutamos» ou «lutam».\n\n' +
      'V - A lacuna pode ser preenchida com formas em diferentes tempos verbais.',
    options: [
      { id: 'A', text: 'I, II e V', is_correct: true },
      { id: 'B', text: 'I, II e IV', is_correct: false },
      { id: 'C', text: 'I, III e IV', is_correct: false },
      { id: 'D', text: 'I, IV e V', is_correct: false },
      { id: 'E', text: 'II, III e V', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Itens I–V — a maioria',
        chip_label: 'M13 — partitivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Núcleo = «maioria» ou «mulheres»? Ou 1ª pessoa «nós»?', icon: 'Focus' },
          { label: 'I — lutamos', detail: 'Concordância ideológica: autora se inclui no grupo — CERTO.', icon: 'Check' },
          { label: 'II — luta / lutam', detail: 'Partitivo: verbo com «maioria» (sing.) ou «mulheres» (pl.) — CERTO.', icon: 'Check' },
          { label: 'III — só lutamos/luta', detail: 'Exclui «lutam», que também é válido — ERRADO.', icon: 'XCircle' },
          { label: 'IV — só lutamos/lutam', detail: 'Exclui «luta», que também é válido — ERRADO.', icon: 'XCircle' },
          { label: 'V — outros tempos', detail: '«Lutou», «lutaram», «lutará»… — CERTO.', icon: 'Check' },
        ],
        footer_rule: 'I, II e V corretas → gabarito A.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Itens I–V → letras',
        meta: slideMeta,
        steps: [
          'Lacuna: «A maioria das mulheres ___ por melhores condições de vida».',
          'I «lutamos»: 1ª pessoa plural — autora incluída no grupo (concordância ideológica) → CERTO.',
          'II presente: «luta» (núcleo maioria) ou «lutam» (núcleo mulheres) — dupla concordância partitiva → CERTO.',
          'III «somente lutamos ou luta»: ignora «lutam» — ERRADO.',
          'IV «somente lutamos ou lutam»: ignora «luta» — ERRADO.',
          'V outros tempos verbais: «lutou/lutaram», futuro etc. — CERTO.',
          'Combinação correta: I + II + V → gabarito A.',
          'Em similares: partitivo admite dupla concordância; «nós» é caso especial.',
        ],
        footer_rule: 'A = I, II e V.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'A MAIORIA DE',
        rows: [
          { label: 'Pergunta-teste', value: 'Núcleo = «maioria» ou termo de «de»?' },
          { label: 'Partitivo', value: '«Luta» (maioria) ou «lutam» (mulheres) — ambas corretas.' },
          { label: 'Ideológica', value: '«Lutamos» — autora incluída no grupo.' },
          { label: 'III e IV', value: 'Falsas — restringem opções válidas do partitivo.' },
          { label: 'Nesta questão', value: 'A — I, II e V' },
        ],
        footer_rule: 'Maioria de + pl.: dupla concordância + 1ª pessoa possível.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sequências VF incorretas',
        items: [
          { label: 'B — I, II e IV', detail: 'IV restringe a «lutamos/lutam» e exclui «luta».', correct: 'IV é falsa — não entra com I e II.' },
          { label: 'C — I, III e IV', detail: 'III e IV são mutuamente restritivas e falsas.', correct: 'Falta II (dupla forma) e V (tempos).' },
          { label: 'D — I, IV e V', detail: 'IV errada; II correta não aparece.', correct: 'Combinação válida é I + II + V = A.' },
          { label: 'E — II, III e V', detail: 'III é falsa — «lutam» também cabe no presente.', correct: 'III nega «lutam» — eliminar E.' },
          { label: 'Em outra banca…', detail: 'Trocam por «a maior parte dos alunos».', correct: 'Mesma regra partitiva: dupla concordância.' },
        ],
        footer_rule: 'Só A reúne todas as corretas.',
      },
    ],
  },

  'avancasp-mon-concordancia-assinale-a-alternativa-que-apresenta-3739270': {
    family: 'conceito',
    source_tec_id: '3739270',
    source_note: 'Era meio-dia e meia — AVANÇASP Mon Pref Cunha 2025 tec 3739270',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Mon (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa que apresenta uma frase totalmente correta, de acordo com a concordância.',
    options: [
      { id: 'A', text: 'Eram meio-dia e meia.', is_correct: false },
      { id: 'B', text: 'Era meio-dia e meia.', is_correct: true },
      { id: 'C', text: 'São meio-dia e meia.', is_correct: false },
      { id: 'D', text: 'Era meio-dia e meio.', is_correct: false },
      { id: 'E', text: 'Eram meio-dia e meio.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Horas em foco',
        chip_label: 'M13 — tempo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Verbo impessoal? «Meia» concorda com o quê?', icon: 'Focus' },
          { label: 'Meio-dia', detail: 'Locução temporal — verbo no singular «era».', icon: 'Clock' },
          { label: 'E meia', detail: '«Meia» = meia hora (fem.) — não «meio».', icon: 'Check' },
          { label: 'Eram / são', detail: 'Plural indevido na locução de tempo.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Tratar «meio-dia» como sujeito plural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Era meio-dia e meia — singular + meia.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Locução → verbo → letras',
        meta: slideMeta,
        steps: [
          'Comando: frase totalmente correta em concordância.',
          'Locução «meio-dia e meia» = 12h30 — verbo impessoal no singular.',
          'A «Eram meio-dia»: plural indevido — eliminar.',
          'B «Era meio-dia e meia»: singular + «meia» (hora feminina) — correto.',
          'C «São meio-dia»: presente plural — eliminar.',
          'D «Era meio-dia e meio»: «meio» errado — é «meia» (hora) — eliminar.',
          'E «Eram meio-dia e meio»: plural + «meio» — duplo erro — eliminar.',
          'Gabarito B.',
          'Em similares: «Era uma hora e quarenta» — verbo sempre no singular.',
        ],
        footer_rule: 'B: era + meia.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HORAS',
        rows: [
          { label: 'Verbo', value: 'Locução de tempo → singular: «Era», «É», «Será».' },
          { label: 'Meio-dia e meia', value: '«Meia» = meia hora (fem.) — não «meio».' },
          { label: 'Pergunta-teste', value: 'É locução impessoal? Não pluralize o verbo.' },
          { label: 'Nesta questão', value: 'B — Era meio-dia e meia.' },
        ],
        footer_rule: 'Não confunda meio (masc.) com meia (hora).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros em A, C, D e E',
        items: [
          { label: 'A — eram', detail: 'Plural na locução de tempo.', correct: '«Era meio-dia e meia» — singular.' },
          { label: 'C — são', detail: 'Presente plural inadequado.', correct: '«Era» ou «É meio-dia e meia» — singular.' },
          { label: 'D — meio', detail: '«Meio» masculino em vez de «meia» (hora).', correct: '«E meia» — hora feminina implícita.' },
          { label: 'E — eram + meio', detail: 'Plural e gênero errados.', correct: '«Era meio-dia e meia» — B.' },
          { label: 'Em outra banca…', detail: 'Trocam por «meio-dia e trinta».', correct: 'Mesma regra: verbo singular na locução.' },
        ],
        footer_rule: 'Só B está integralmente correta.',
      },
    ],
  },

  'educa-pb-acs-concordancia-considere-o-texto-a-seguir-para-resp-3819891': {
    family: 'text_fragment',
    source_tec_id: '3819891',
    source_note: 'Fundamentais × valores e atitudes — EDUCA PB ACS Pref Ibiara 2025 tec 3819891',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACS (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «valores e atitudes fundamentais para o convívio social democrático», o termo «fundamentais» concorda:',
    text_fragment:
      '<p><strong>TEXTO III — Direção Defensiva e Convivência no Trânsito</strong></p>' +
      '<p>O trânsito é feito pelas pessoas. E, como nas outras atividades humanas, quatro princípios são importantes para o relacionamento e a convivência social no trânsito. O primeiro deles é a dignidade da pessoa humana, do qual derivam os Direitos Humanos e os <strong>valores e atitudes fundamentais</strong> para o convívio social democrático. O segundo princípio é a igualdade de direitos. Todos têm a possibilidade de exercer a cidadania plenamente. Um outro é o da participação, que fundamenta a mobilização da sociedade para organizar-se em torno dos problemas de trânsito e de suas consequências. Finalmente, o princípio da corresponsabilidade pela vida social, que diz respeito à formação de atitudes e ao aprender a valorizar comportamentos necessários à segurança no trânsito.</p>',
    options: [
      { id: 'A', text: 'Apenas com «valores», por ser o termo mais próximo.', is_correct: false },
      { id: 'B', text: 'Apenas com «atitudes», pois este é o núcleo da expressão.', is_correct: false },
      { id: 'C', text: 'Com «valores» e «atitudes», que formam um sujeito composto.', is_correct: true },
      { id: 'D', text: 'Com «convivência social», pois funciona como modificador do termo final.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adj × núcleos',
        chip_label: 'M13 — composto',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Com qual(is) substantivo(s) «fundamentais» concorda?', icon: 'Focus' },
          { label: 'Trânsito e pessoas', detail: 'Texto III — o trânsito é feito pelas pessoas; relacionamento no trânsito.', icon: 'Car' },
          { label: 'Valores e atitudes', detail: 'Dois núcleos coordenados — adjetivo no plural.', icon: 'Users' },
          { label: 'Fundamentais', detail: 'Masc. pl. — qualifica ambos os substantivos.', icon: 'Check' },
          { label: 'Pegadinha', detail: 'Concordar só com o vizinho do adjetivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Sujeito composto → adjetivo no plural.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto III (direção defensiva): trânsito feito pelas pessoas — relacionamento e convivência.',
          'Trecho: «valores e atitudes fundamentais para o convívio…».',
          'Dois substantivos coordenados por «e»: valores + atitudes.',
          '«Fundamentais» qualifica os dois — concordância nominal com sujeito composto.',
          'A «só valores»: ignora «atitudes» — eliminar.',
          'B «só atitudes»: ignora «valores» — eliminar.',
          'D «convivência social»: é complemento, não núcleo do adjetivo — eliminar.',
          'Gabarito C — valores e atitudes formam núcleo composto.',
          'Em similares: adjetivo depois de «e» concorda com todos os núcleos.',
        ],
        footer_rule: 'C: fundamentais → valores e atitudes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUJEITO COMPOSTO',
        rows: [
          { label: 'Pergunta-teste', value: 'Quantos núcleos o adjetivo qualifica?' },
          { label: 'Valores e atitudes', value: 'Dois núcleos → «fundamentais» (pl. masc.).' },
          { label: 'Proximidade', value: 'Não rege sozinha — os dois núcleos mandam.' },
          { label: 'Nesta questão', value: 'C — concorda com valores e atitudes' },
        ],
        footer_rule: 'E coordena — adjetivo no plural.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises erradas A, B e D',
        items: [
          { label: 'A — só valores', detail: 'Proximidade não exclui o segundo núcleo.', correct: '«Fundamentais» cobre valores E atitudes.' },
          { label: 'B — só atitudes', detail: '«Valores» também é qualificado pelo adjetivo.', correct: 'Composto: ambos os núcleos.' },
          { label: 'D — convivência', detail: '«Convivência social» é termo da oração, não núcleo do adj.', correct: 'Adj. qualifica «valores e atitudes».' },
          { label: 'Em outra banca…', detail: 'Trocam por «esforços e dedicação constantes».', correct: 'Mesmo teste: adj. pl. com dois núcleos.' },
        ],
        footer_rule: 'Só C descreve a concordância correta.',
      },
    ],
  },

  'educa-pb-ace-concordancia-considere-o-texto-a-seguir-para-resp-3820040': {
    family: 'text_fragment',
    source_tec_id: '3820040',
    source_note: 'Todo mundo / sonho é ter — EDUCA PB ACE Pref Ibiara 2025 tec 3820040',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACE (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa CORRETA quanto à concordância verbal e/ou nominal presente no texto.',
    text_fragment:
      '<p><strong>Charge — diálogo</strong></p>' +
      '<p>«Aposto que todo mundo tem um grande sonho de consumo?!»</p>' +
      '<p>«Sim, e o meu atual sonho de consumo é ter consumidores mais conscientes.»</p>',
    options: [
      {
        id: 'A',
        text: 'A expressão «todo mundo» exige o verbo no plural, portanto o correto seria «todo mundo têm um grande sonho de consumo».',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O verbo «é», em «meu atual sonho de consumo é ter consumidores mais conscientes», encontra-se no singular por concordar com o núcleo do sujeito «sonho».',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'O adjetivo «conscientes» deveria estar no singular para concordar com o termo «consumo».',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A forma verbal «aposto» deveria estar no plural para concordar com o sujeito «todo mundo».',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — charge',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que concorda?', icon: 'Focus' },
          { label: 'Todo mundo tem', detail: '«Todo mundo» = sujeito indeterminado singular → «tem».', icon: 'User' },
          { label: 'Sonho é ter', detail: 'Núcleo «sonho» (sing.) → verbo «é» no singular.', icon: 'Check' },
          { label: 'Consumidores conscientes', detail: '«Conscientes» concorda com «consumidores» (pl.).', icon: 'Users' },
          { label: 'Aposto', detail: '1ª pessoa do singular — não concorda com «todo mundo».', icon: 'MessageCircle' },
        ],
        footer_rule: 'Todo mundo = singular; sonho → é.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Charge sobre sonho de consumo — julgar análises de concordância.',
          'A «todo mundo têm»: «todo mundo» é singular → «tem» — análise A falsa.',
          'B «sonho… é ter»: núcleo «sonho» (sing.) + verbo de ligação «é» — análise correta.',
          'C «conscientes» sing.: qualifica «consumidores» (pl.) — análise falsa.',
          'D «aposto» plural: «aposto» = 1ª sing. do verbo apostar — análise falsa.',
          'Gabarito B.',
          'Em similares: «todo mundo» nunca puxa verbo ao plural; ache o núcleo do sujeito.',
        ],
        footer_rule: 'B: é concorda com sonho.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TODO MUNDO × NÚCLEO',
        rows: [
          { label: 'Todo mundo', value: 'Sujeito singular → «tem», não «têm».' },
          { label: 'Sonho é ter', value: 'Núcleo «sonho» → «é» (sing.).' },
          { label: 'Conscientes', value: 'Predicativo de «consumidores» (pl.).' },
          { label: 'Aposto', value: '1ª pessoa sing. — não pluraliza.' },
          { label: 'Nesta questão', value: 'B — análise correta' },
        ],
        footer_rule: 'Núcleo manda — não o termo mais longo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises falsas A, C e D',
        items: [
          { label: 'A — todo mundo têm', detail: '«Todo mundo» é tratado como singular.', correct: '«Todo mundo tem um grande sonho» — correto no texto.' },
          { label: 'C — conscientes sing.', detail: 'Adj. qualifica «consumidores», não «consumo».', correct: '«Consumidores mais conscientes» — plural.' },
          { label: 'D — aposto plural', detail: '«Aposto» é 1ª sing.; sujeito é «eu» implícito.', correct: 'Não concorda com «todo mundo» — fala do eu.' },
          { label: 'Em outra banca…', detail: 'Trocam «todo mundo» por «cada um».', correct: 'Mesma regra: indeterminação → singular.' },
        ],
        footer_rule: 'Só B descreve a concordância certa.',
      },
    ],
  },

  'vunesp-acs-p-concordancia-leia-a-tira-a-seguir-para-responder-3844945': {
    family: 'text_fragment',
    source_tec_id: '3844945',
    source_note: 'Tira 1% quem se perde quisesse — VUNESP ACS Pref Vista Alegre do Alto 2025 tec 3844945',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Vista Alegre do Alto)',
      orgao: 'Pref. Vista Alegre do Alto',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira a seguir para responder à questão. Assinale a alternativa que reescreve o 3° quadro em conformidade com a norma-padrão de concordância e de emprego dos verbos.',
    text_fragment:
      '<p><em>Tira — humor sobre floresta</em></p>' +
      '<p>Quadro original (3°): o personagem imagina que quase todos os perdidos na floresta querem achar o caminho de volta — e se surpreende com a minoria que não quer.</p>' +
      '<p>Reescrever com «1% de quem se perde na floresta» + verbo no modo/tempo adequado.</p>',
    options: [
      {
        id: 'A',
        text: 'Imaginava que 1% de quem se perde na floresta não quisesse achar o caminho de volta!',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'Achava que 1% de quem está perdido na floresta não querem achar o caminho de volta!',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Acredito que quase nenhum dos perdidos na floresta não queiram achar o caminho de volta!',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Penso que muitos poucos dos que estão perdidos na floresta queira achar o caminho de volta!',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Considerei que quem quer que esteja perdido na floresta queiram achar o caminho de volta!',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quem + subjuntivo',
        chip_label: 'M13 — reescrita',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Quem» é sing. ou pl.? Modo do verbo na oração?', icon: 'Focus' },
          { label: 'Tira — floresta', detail: 'Perdidos na floresta que querem achar o caminho de volta.', icon: 'Trees' },
          { label: 'Quem + subjuntivo', detail: '«Quem se perde» indeterminado → verbo no singular.', icon: 'User' },
          { label: 'Quisesse', detail: 'Subjuntivo após «imaginava que» — concordância com «quem».', icon: 'Check' },
          { label: 'Pegadinha', detail: 'Percentual ou «perdidos» puxam verbo ao plural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Quem (sing.) → quisesse.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Reescrita → letras',
        meta: slideMeta,
        steps: [
          '3° quadro da tira: perdidos na floresta e o caminho de volta.',
          'Reescrever com expressão partitiva «de quem se perde na floresta».',
          '«Quem» = sujeito indeterminado singular → verbo no singular.',
          'A «não quisesse»: pretérito + subjuntivo alinhado a «quem» — correto.',
          'B «não querem»: plural com «quem» — eliminar.',
          'C «quase nenhum… não queiram»: dupla negação confusa + plural — eliminar.',
          'D «queira» com «muitos poucos»: núcleo plural mal concordado — eliminar.',
          'E «queiram» com «quem quer que»: construção quebrada — eliminar.',
          'Gabarito A.',
          'Em similares: «quem» manda no singular; subjuntivo após verbo de opinião no pretérito.',
        ],
        footer_rule: 'A: imaginava… quisesse.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUEM + SUBJUNTIVO',
        rows: [
          { label: 'Quem', value: 'Sujeito indeterminado → 3ª pessoa do singular.' },
          { label: 'Imaginava que', value: 'Oração subordinada → subjuntivo «quisesse».' },
          { label: 'Tira', value: 'Floresta + caminho de volta — reescrita do quadro.' },
          { label: 'Nesta questão', value: 'A — não quisesse achar' },
        ],
        footer_rule: 'Quem se perde → quisesse (sing.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros de número e modo',
        items: [
          { label: 'B — querem', detail: '«Quem» singular com verbo plural.', correct: '«Não quisesse/quisesse» — singular.' },
          { label: 'C — dupla negação', detail: '«Quase nenhum… não queiram» — construção confusa.', correct: 'Evitar dupla negação + plural indevido.' },
          { label: 'D — queira', detail: '«Muitos poucos» plural mal ligado ao verbo.', correct: 'Concordância desalinhada com o núcleo.' },
          { label: 'E — queiram', detail: '«Quem quer que» exige singular na oração subordinada.', correct: '«Queira» ou «quisesse» — não «queiram».' },
          { label: 'Em outra banca…', detail: 'Trocam por «99% de quem se perde».', correct: 'Mesmo trilho: quem → singular + subjuntivo.' },
        ],
        footer_rule: 'Só A reescreve o quadro corretamente.',
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
