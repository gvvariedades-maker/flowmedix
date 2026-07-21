#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g11 (8 slugs · Classes de palavras · lote 11).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g11.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g11 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g11 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g11';
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
    'verbo tempo e modo',
    'conjunção adversativa e aditiva',
    'advérbio negação modo intensidade',
    'pronome possessivo',
    'locução prepositiva',
    'preposição relação nominal',
    'numeral ordinal e quantitativo',
    'substantivo adjetivo numeral',
    'pergunta-teste M02',
    'classificação morfológica',
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
      reviewer: 'handcraft:classes-de-palavras-g11',
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
  'avancasp-acs-classes-leia-a-tirinha-a-seguir-para-respond-3352957': {
    family: 'text_fragment',
    source_tec_id: '3352957',
    source_note: 'VF tirinha leu/mas/não-nem/minhas — AVANÇASP ACS Pref Amparo 2025 tec 3352957',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Amparo)',
      orgao: 'Pref Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tirinha a seguir para responder à questão.\n\nEm relação aos trechos a seguir, retirados da tirinha, analise as afirmativas e classifique-as em verdadeiro (V) ou falso (F). Em seguida, marque a alternativa correta.\n\n( ) «Você ao menos leu o capítulo do livro de história que eu mandei?» – «ler» está conjugado no pretérito perfeito do indicativo.\n\n( ) «Eu tentei, mas a editora do livro não usou um bom fixador de impressão.» – «mas» é uma conjunção adversativa.\n\n( ) «Não preciso nem dizer que quando eu peguei o livro, todas as letras caíram das páginas e ficaram espalhadas no chão.» – «Não» e «nem» são advérbios de modo.\n\n( ) «Acho que minhas desculpas precisam ser menos elaboradas» – «minhas» é uma preposição.',
    text_fragment:
      '<p>Tirinha (adaptada): diálogo sobre capítulo de história, fixador de impressão e letras que caem do livro — contexto para julgar classes morfológicas nos trechos citados.</p>',
    options: [
      { id: 'A', text: 'V – V – V – V', is_correct: false },
      { id: 'B', text: 'V – V – F – F', is_correct: true },
      { id: 'C', text: 'F – V – V – V', is_correct: false },
      { id: 'D', text: 'F – V – F – V', is_correct: false },
      { id: 'E', text: 'F – F – F – F', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro afirmativas VF',
        chip_label: 'M02 — classes',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O que a palavra faz? Teste classe por trecho.', icon: 'Focus' },
          { label: '1 — leu', detail: '«Leu o capítulo do livro de história» — pretérito perfeito → V.', icon: 'Check' },
          { label: '2 — mas', detail: '«Mas a editora» — conjunção adversativa opõe ideias → V.', icon: 'Check' },
          { label: '3 — Não/nem', detail: '«Não preciso nem dizer» — negação, não advérbio de modo → F.', icon: 'XCircle' },
          { label: '4 — minhas', detail: '«Minhas desculpas» menos elaboradas — pronome possessivo → F.', icon: 'XCircle' },
          { label: 'Fixador', detail: 'Trecho da editora e do fixador de impressão — contexto da tirinha.', icon: 'BookOpen' },
        ],
        footer_rule: 'Julgue cada afirmativa antes de montar a sequência.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → V/F → B',
        meta: slideMeta,
        steps: [
          'Comando: classificar quatro afirmativas em V ou F.',
          '1ª: «leu» no pretérito perfeito do indicativo — tempo e modo corretos → V.',
          '2ª: «mas» liga orações em oposição — adversativa → V.',
          '3ª: «Não» e «nem» negam/reforçam — não indicam modo (como «bem», «mal») → F.',
          '4ª: «minhas» antecede «desculpas» com valor possessivo — pronome, não preposição → F.',
          'Sequência: V – V – F – F.',
          'Eliminar A (3ª e 4ª V), C/D/E (1ª F ou combinações erradas).',
          'Gabarito B.',
          'Em similares: teste «leu» (tempo), «mas» (oposição), negação × modo, possessivo × preposição.',
        ],
        footer_rule: 'B — V V F F.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ROTEIRO VF',
        rows: [
          { label: 'Leu / capítulo', value: 'Pretérito perfeito do indicativo de «ler».' },
          { label: 'Mas', value: 'Conjunção adversativa (oposição).' },
          { label: 'Não / nem', value: 'Advérbio de negação / conjunção coordenativa — ≠ modo.' },
          { label: 'Minhas', value: 'Pronome possessivo — ≠ preposição.' },
          { label: 'Nesta questão', value: 'B — V V F F' },
        ],
        footer_rule: 'Modo = como (bem, mal); negação é outra função.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pegadinhas por classe vizinha',
        items: [
          { label: 'A — tudo V', detail: '«Não/nem» e «minhas» parecem inofensivos.', correct: 'Não/nem não são de modo; minhas é pronome possessivo.' },
          { label: 'C — 1ª F', detail: 'Confundir infinitivo «ler» com forma «leu».', correct: 'A afirmativa refere o verbo conjugado «leu» — pretérito perfeito.' },
          { label: 'D — 4ª V', detail: '«Minhas» antecede substantivo como «de».', correct: 'Possessivo qualifica «desculpas» — pronome, não preposição.' },
          { label: 'E — tudo F', detail: 'Desconfiar de «mas» e «leu».', correct: 'As duas primeiras afirmativas estão corretas.' },
          { label: 'Em outra banca…', detail: 'Trocam tirinha por charge escolar.', correct: 'Mesmo trilho: uma afirmativa por classe morfológica.' },
        ],
        footer_rule: 'Só B — V V F F.',
      },
    ],
  },

  'avancasp-ace-classes-leia-a-tirinha-a-seguir-para-respond-3353960': {
    family: 'text_fragment',
    source_tec_id: '3353960',
    source_note: 'VF tirinha Garfield colocar/Terra/Então/um-o — AVANÇASP ACE Pref Amparo 2025 tec 3353960',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACE (Pref Amparo)',
      orgao: 'Pref Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tirinha a seguir para responder à questão.\n\nEm relação aos trechos a seguir, retirados da tirinha, analise as afirmativas e classifique-as em verdadeiro (V) ou falso (F). Em seguida, marque a alternativa correta.\n\n( ) «Vou colocar você de dieta, Garfield.» – «colocar» é um verbo e está conjugado na primeira pessoa do plural.\n\n( ) «Se você ganhar mais peso, a Terra vai sair de órbita e vai se chocar com o Sol.» – «Terra» é um substantivo e, no contexto, é sinônimo de «planeta».\n\n( ) «Então, o que me diz disso?» – a palavra «Então» é uma preposição.\n\n( ) «Passe-me um sorvete e ligue o ar-condicionado» – no trecho destacado, «um» e «o» são artigos, o primeiro é artigo indefinido enquanto o segundo é artigo definido.',
    text_fragment:
      '<p>Tirinha Garfield (adaptada): dieta, ganho de peso, Terra e Sol, e pedido de sorvete com ar-condicionado — contexto dos quatro trechos.</p>',
    options: [
      { id: 'A', text: 'V – V – V – V', is_correct: false },
      { id: 'B', text: 'V – V – F – F', is_correct: false },
      { id: 'C', text: 'F – V – V – V', is_correct: false },
      { id: 'D', text: 'F – V – F – V', is_correct: true },
      { id: 'E', text: 'F – F – F – F', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Garfield — quatro testes',
        chip_label: 'M02 — classes',
        meta: slideMeta,
        items: [
          { label: '1 — colocar', detail: 'Infinitivo em «Vou colocar» — não 1ª pessoa do plural → F.', icon: 'XCircle' },
          { label: '2 — Terra', detail: 'Substantivo próprio; sentido de planeta → V.', icon: 'Check' },
          { label: '3 — Então', detail: 'Advérbio/conjunção — não preposição → F.', icon: 'XCircle' },
          { label: '4 — um / o', detail: 'Artigos indefinido e definido antes de substantivo → V.', icon: 'Check' },
        ],
        footer_rule: 'F – V – F – V.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Afirmativas → D',
        meta: slideMeta,
        steps: [
          '1ª: «Vou colocar» — «colocar» está no infinitivo, não conjugado em «colocamos» → F.',
          '2ª: «Terra» nomeia o astro; no contexto = planeta → substantivo, sentido aceito → V.',
          '3ª: «Então» inicia fala — advérbio de tempo/conclusão ou conjunção — não preposição → F.',
          '4ª: «um sorvete» (indefinido) e «o ar-condicionado» (definido) — artigos corretos → V.',
          'Sequência: F – V – F – V.',
          'Gabarito D.',
          'Em similares: infinitivo × 1ª pl., substantivo Terra, «então» × preposição, artigos um/o.',
        ],
        footer_rule: 'D — F V F V.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUATRO TRECHOS',
        rows: [
          { label: 'Colocar', value: 'Infinitivo — não «colocamos» (1ª pl.).' },
          { label: 'Terra', value: 'Substantivo próprio = planeta no contexto.' },
          { label: 'Então', value: 'Advérbio/conjunção — ≠ preposição.' },
          { label: 'Um / o', value: 'Artigo indefinido × definido.' },
          { label: 'Nesta questão', value: 'D — F V F V' },
        ],
        footer_rule: 'Infinitivo não conta como conjugação em 1ª pessoa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir infinitivo e artigo',
        items: [
          { label: 'A — tudo V', detail: 'Marcar V em «colocar» (1ª pl.) e «Então» (preposição).', correct: '1ª e 3ª afirmativas são F — sequência não é V V V V.' },
          { label: 'B — 1ª V', detail: '«Colocar» parece verbo conjugado por estar na frase.', correct: '«Vou colocar» = auxiliar + infinitivo — não 1ª pessoa do plural.' },
          { label: 'C — 1ª F e 3ª V', detail: 'Terra e Então ambos V na letra C.', correct: 'Terra é V, mas Então não é preposição — 3ª é F.' },
          { label: 'E — tudo F', detail: 'Negar Terra e artigos.', correct: '2ª e 4ª afirmativas estão corretas.' },
          { label: 'Em outra banca…', detail: 'Trocam Garfield por outro personagem.', correct: 'Mesmo teste: infinitivo, substantivo, classe de «então», artigos.' },
        ],
        footer_rule: 'Só D — F V F V.',
      },
    ],
  },

  'facet-acs-pr-classes-identifique-a-alternativa-em-que-a-c-3358522': {
    family: 'certo_errado',
    source_tec_id: '3358522',
    source_note: 'INCORRETA mas aditivo × adversativo — FACET ACS Pref Pedro Velho 2025 tec 3358522',
    meta: {
      banca: 'FACET',
      prova: 'ACS (Pref Pedro Velho)',
      orgao: 'Pref Pedro Velho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Identifique a alternativa em que a classe gramatical está identificada de maneira incorreta:',
    options: [
      { id: 'A', text: 'Todos ouviram falar mal de você, mas nada fizeram. (conectivo aditivo)', is_correct: true },
      { id: 'B', text: 'Eu preciso de você. (preposição)', is_correct: false },
      { id: 'C', text: 'Alguém sabe de onde ele veio? (pronome)', is_correct: false },
      { id: 'D', text: 'Ele fala de uma maneira estranha. (verbo)', is_correct: false },
      { id: 'E', text: 'Ninguém o viu sair. (pronome)', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA na classe',
        chip_label: 'M02 — conectivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O conectivo soma ou opõe?', icon: 'Focus' },
          { label: 'Mas', detail: '«Todos ouviram... mas nada fizeram» — oposição.', icon: 'GitCompare' },
          { label: '× aditivo', detail: 'Aditivo somaria (e, nem só) — «mas» é adversativo.', icon: 'XCircle' },
          { label: 'De / Alguém / fala', detail: 'B, C, D classificam preposição, pronome e verbo corretamente.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Mas = adversativa, não aditiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'EXCETO morfológico → A',
        meta: slideMeta,
        steps: [
          'Comando: classe gramatical INCORRETA.',
          'A: «mas» liga orações em contraste — adversativa, não aditiva — INCORRETA.',
          'B: «de» em «preciso de» — preposição — correta.',
          'C: «Alguém» — pronome indefinido — correta.',
          'D: «fala» — verbo — correta.',
          'E: «o» — pronome — correta.',
          'Gabarito A.',
          'Em similares: «mas/porém/todavia» = adversativa; «e/nem/bem como» = aditiva.',
        ],
        footer_rule: 'A — mas não é aditivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MAS',
        rows: [
          { label: 'Classe', value: 'Conjunção coordenativa adversativa.' },
          { label: 'Valor', value: 'Oposição, contraste entre ideias.' },
          { label: '× aditivo', value: 'Adição = e, nem, bem como.' },
          { label: 'Nesta questão', value: 'A — rótulo aditivo incorreto.' },
        ],
        footer_rule: 'Mas opõe; não acrescenta.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'INCORRETA — cada letra exceto A',
        items: [
          { label: 'A — aditivo', detail: '«Mas» parece somar as duas orações.', correct: '«Mas» opõe «ouviram» × «nada fizeram» — adversativa; rótulo INCORRETO (gabarito).' },
          { label: 'B — preposição', detail: '«De» parece parte do verbo.', correct: '«Preciso de» — «de» é preposição regulando «você».' },
          { label: 'C — pronome', detail: '«Alguém» parece substantivo.', correct: 'Indefinido que substitui/nomeia pessoa — pronome.' },
          { label: 'D — verbo', detail: '«De uma maneira» confunde com substantivo.', correct: '«Fala» é forma verbal — núcleo do predicado.' },
          { label: 'E — pronome', detail: '«O» parece artigo.', correct: '«O viu» — pronome oblíquo/objeto — classificação correta.' },
          { label: 'Em outra banca…', detail: 'Trocam «mas» por «porém» ou «todavia».', correct: 'Mesmo valor adversativo — não aditivo.' },
        ],
        footer_rule: 'Só A erra a classe.',
      },
    ],
  },

  'facet-acs-pr-classes-leia-o-trecho-a-seguir-e-macabea-com-3358539': {
    family: 'conceito',
    source_tec_id: '3358539',
    source_note: '«com medo de» locução prepositiva — Clarice Lispector FACET ACS 2025 tec 3358539',
    meta: {
      banca: 'FACET',
      prova: 'ACS (Pref Pedro Velho)',
      orgao: 'Pref Pedro Velho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o trecho a seguir:\n\nE Macabéa, com medo de que o silêncio já significasse uma ruptura, disse ao recém-namorado:\n– Eu gosto tanto de parafuso e prego, e o senhor?\n\n(CLARICE LISPECTOR, A hora da estrela, 1977)\n\nNo fragmento: «E Macabéa, com medo de», classifique «com medo de»:',
    options: [
      { id: 'A', text: 'Transitivo indireto.', is_correct: false },
      { id: 'B', text: 'Locução prepositiva.', is_correct: true },
      { id: 'C', text: 'Intransitivo.', is_correct: false },
      { id: 'D', text: 'Objeto indireto.', is_correct: false },
      { id: 'E', text: 'Objeto direto.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Com medo de',
        chip_label: 'M02 — locução',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'É termo verbal ou grupo prepositivo?', icon: 'Focus' },
          { label: 'Macabéa', detail: 'Clarice Lispector — medo do silêncio na fala.', icon: 'User' },
          { label: 'Com medo de', detail: 'Preposição + substantivo + preposição — locução prepositiva.', icon: 'Link' },
          { label: '× transitividade', detail: 'A/C/D/E são rótulos sintáticos de verbo — não do grupo.', icon: 'XCircle' },
        ],
        footer_rule: 'Locução prepositiva = função de preposição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Fragmento → B',
        meta: slideMeta,
        steps: [
          'Trecho: «com medo de que o silêncio...» — adjunto adverbial de causa/modo.',
          '«Com medo de» = grupo com valor preposicional (equivalente a «por medo de»).',
          'A transitivo indireto, C intransitivo, D OI, E OD — classificam verbo, não o grupo.',
          'B locução prepositiva — conjunto «com + medo + de» com função de preposição.',
          'Gabarito B.',
          'Em similares: «à procura de», «em vez de», «por medo de» = locuções prepositivas.',
        ],
        footer_rule: 'B — locução prepositiva.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LOCUÇÃO PREPOSITIVA',
        rows: [
          { label: 'Forma', value: 'Preposição + substantivo/adjetivo + preposição (opcional).' },
          { label: 'Com medo de', value: 'Indica causa/motivo do medo.' },
          { label: '× verbo', value: 'Não nomeia transitividade — nomeia grupo prepositivo.' },
          { label: 'Nesta questão', value: 'B — locução prepositiva.' },
        ],
        footer_rule: 'Grupo com valor de preposição.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Misturar morfologia e sintaxe',
        items: [
          { label: 'A — transitivo', detail: '«Com medo de» parece complemento verbal.', correct: 'É adjunto — locução prepositiva, não valência do verbo.' },
          { label: 'C — intransitivo', detail: '«Disse» é transitivo direto/indireto.', correct: 'Pergunta é sobre «com medo de», não sobre «disse».' },
          { label: 'D — OI', detail: 'Confunde adjunto com objeto.', correct: 'OI completa verbo; locução circunstancia com valor preposicional.' },
          { label: 'E — OD', detail: '«Medo» parece objeto direto isolado.', correct: 'O grupo inteiro «com medo de» é locução — não OD.' },
          { label: 'Em outra banca…', detail: 'Trocam por «à procura de» ou «em vez de».', correct: 'Mesmo teste: grupo preposicional fixo.' },
        ],
        footer_rule: 'Só B classifica o grupo.',
      },
    ],
  },

  'avancasp-aux-classes-ate-breve-ha-temperamentos-urbanos-p-3375895': {
    family: 'conceito',
    source_tec_id: '3375895',
    source_note: '«igualmente» advérbio — crônica Ramos Pref Caieiras 2025 tec 3375895',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Aux (Pref Caieiras)',
      orgao: 'Pref Caieiras',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAté breve\n\nHá temperamentos urbanos por nascimento, mas há, igualmente, os temperamentos rurais. Uns só podem viver no asfalto; o rural, ao contrário, só consegue viver na cidade como escafandrista debaixo d’água. [...] Eis por que esta semana me parto, em procura do retiro sertanejo de todos os anos.\n\n(Crônica adaptada)\n\nNo trecho «mas há, igualmente, os temperamentos rurais», a palavra destacada classifica-se morfologicamente como:',
    options: [
      { id: 'A', text: 'pronome.', is_correct: false },
      { id: 'B', text: 'substantivo.', is_correct: false },
      { id: 'C', text: 'advérbio.', is_correct: true },
      { id: 'D', text: 'conjunção.', is_correct: false },
      { id: 'E', text: 'preposição.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Igualmente',
        chip_label: 'M02 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Modifica verbo/adj/adv ou nomeia/liga?', icon: 'Focus' },
          { label: 'Temperamentos', detail: 'Texto urbano × rural — cronista no asfalto.', icon: 'Building' },
          { label: 'Igualmente', detail: 'Advérbio de modo/intensidade — «também assim».', icon: 'Equal' },
          { label: 'Há... rurais', detail: 'Intensifica a ideia de coexistência de temperamentos.', icon: 'Users' },
          { label: '× conjunção', detail: 'Não liga orações sozinho — modifica o predicado.', icon: 'XCircle' },
        ],
        footer_rule: 'Igualmente = advérbio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → C',
        meta: slideMeta,
        steps: [
          'Texto «Até breve»: temperamentos urbanos e rurais, retiro sertanejo.',
          '«Igualmente» em «há, igualmente, os temperamentos rurais».',
          'Função: reforça/adiciona sentido ao verbo «há» — advérbio.',
          'A pronome substitui nome — eliminar.',
          'B substantivo nomeia ser — eliminar.',
          'D conjunção ligaria orações (e, mas) — eliminar.',
          'E preposição introduziria complemento nominal — eliminar.',
          'Gabarito C — advérbio.',
          'Em similares: «igualmente/também/similarmente» circunstanciam o verbo — advérbio.',
        ],
        footer_rule: 'C — advérbio de modo/intensidade.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IGUALMENTE',
        rows: [
          { label: 'Classe', value: 'Advérbio de modo/intensidade.' },
          { label: 'Valor', value: '«Da mesma forma», «também».' },
          { label: '× conjunção', value: 'Não é «e» nem «mas».' },
          { label: 'Nesta questão', value: 'C — advérbio.' },
        ],
        footer_rule: 'Modifica o predicado — não liga termos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir com conectivo',
        items: [
          { label: 'A — pronome', detail: '«Igualmente» parece retomar «urbanos».', correct: 'Não substitui nominal — intensifica o verbo «há».' },
          { label: 'B — substantivo', detail: 'Palavra longa parece nome abstrato.', correct: 'Advérbio derivado de «igual» — circunstancia.' },
          { label: 'D — conjunção', detail: '«Mas há igualmente» parece dupla conjunção.', correct: '«Mas» é conjunção; «igualmente» é advérbio no meio da oração.' },
          { label: 'E — preposição', detail: 'Confunde com «de» ou «por» do texto.', correct: '«Igualmente» não introduz complemento — modifica.' },
          { label: 'Em outra banca…', detail: 'Trocam por «também» ou «similarmente».', correct: 'Mesmo valor advérbial de acréscimo/modo.' },
        ],
        footer_rule: 'Só C — advérbio.',
      },
    ],
  },

  'selecon-athh-classes-quando-eu-deixei-de-acreditar-em-mim-3416683': {
    family: 'conceito',
    source_tec_id: '3416683',
    source_note: '«lá» advérbio + «série» substantivo — Mayara Godoy SELECON ATHH 2025 tec 3416683',
    meta: {
      banca: 'SELECON',
      prova: 'ATHH (HEMOMINAS)',
      orgao: 'HEMOMINAS',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nQuando eu deixei de acreditar em mim\nMayara Godoy\n\n[...] Lá pela sexta série, eu já tinha uma clareza de qual carreira gostaria de seguir, e me matriculei na faculdade sem nenhuma dúvida de que aquele seria meu caminho. [...]\n\n(Crônica adaptada — cronicasdecategoria.com, 2024)\n\nNo trecho «Lá pela sexta série», as palavras destacadas classificam-se, respectivamente, como:',
    options: [
      { id: 'A', text: 'conjunção e substantivo', is_correct: false },
      { id: 'B', text: 'advérbio e substantivo', is_correct: true },
      { id: 'C', text: 'conjunção e adjetivo', is_correct: false },
      { id: 'D', text: 'advérbio e adjetivo', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lá + série',
        chip_label: 'M02 — dupla classe',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada palavra: circunstancia ou nomeia?', icon: 'Focus' },
          { label: 'Mayara Godoy', detail: 'Crônica sobre autoconfiança e dúvida profissional.', icon: 'BookOpen' },
          { label: 'Lá', detail: 'Advérbio de lugar — indica ponto no tempo/espaço escolar.', icon: 'MapPin' },
          { label: 'Série', detail: 'Substantivo — nomeia etapa do ensino fundamental.', icon: 'GraduationCap' },
          { label: 'Sexta', detail: 'Numeral ordinal adjetivo — qualifica «série».', icon: 'Hash' },
        ],
        footer_rule: 'Lá = advérbio; série = substantivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → B',
        meta: slideMeta,
        steps: [
          'Texto Mayara: trajetória escolar e escolha de carreira.',
          '«Lá pela sexta série» — indica momento da vida escolar.',
          '«Lá» = advérbio de lugar/tempo (nesse período).',
          '«Série» = substantivo comum (etapa escolar).',
          'A conjunção liga orações — «lá» não liga — eliminar.',
          'C adjetivo em «série» — «série» é núcleo nominal, não adjetivo — eliminar.',
          'D adjetivo — «série» nomeia, não qualifica — eliminar.',
          'Gabarito B — advérbio e substantivo.',
          'Em similares: «lá» (advérbio de lugar/tempo) + núcleo nominal «série» (substantivo).',
        ],
        footer_rule: 'B — advérbio + substantivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LÁ + SÉRIE',
        rows: [
          { label: 'Lá', value: 'Advérbio de lugar/tempo.' },
          { label: 'Série', value: 'Substantivo — etapa escolar.' },
          { label: 'Sexta', value: 'Numeral ordinal adjetivo (qualifica série).' },
          { label: 'Nesta questão', value: 'B — advérbio e substantivo.' },
        ],
        footer_rule: 'Não confunda «série» (nome) com «sexta» (ordinal).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar série por sexta',
        items: [
          { label: 'A — conjunção', detail: '«Lá» parece conectivo temporal «quando».', correct: '«Lá» é advérbio — não conjunção subordinativa.' },
          { label: 'C — adjetivo', detail: '«Sexta» qualifica e parece ser o foco.', correct: 'Destaque pede «série» (substantivo), não o ordinal.' },
          { label: 'D — adjetivo', detail: 'Mesma confusão com «sexta».', correct: 'Segunda palavra destacada é «série» — substantivo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «lá pelas tantas».', correct: '«Lá» mantém valor advérbial de tempo/lugar.' },
        ],
        footer_rule: 'Só B fecha o par.',
      },
    ],
  },

  'cpcon-uepb-a-classes-leia-o-texto-2-para-responder-a-ques-3483805': {
    family: 'conceito',
    source_tec_id: '3483805',
    source_note: '«de» preposição — campanha saúde homem CPCON UEPB 2025 tec 3483805',
    meta: {
      banca: 'CPCON',
      prova: 'Ag (Pref Nazarezinho)',
      orgao: 'Pref Nazarezinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto 2 para responder à questão abaixo.\n\nTEXTO 2\n\n«Cuidar da saúde também é coisa de homem!»\n\nFonte: adaptado.\n\nNo trecho «Cuidar da saúde também é coisa de homem!», a palavra «de» funciona como:',
    options: [
      { id: 'A', text: 'Um pronome que retoma um sujeito anterior.', is_correct: false },
      { id: 'B', text: 'Um advérbio que modifica o verbo.', is_correct: false },
      { id: 'C', text: 'Um artigo definido que caracteriza o substantivo.', is_correct: false },
      { id: 'D', text: 'Uma conjunção que liga ideias.', is_correct: false },
      { id: 'E', text: 'Uma preposição que indica relação entre termos.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'De em «coisa de homem»',
        chip_label: 'M02 — preposição',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Liga termos ou modifica verbo sozinho?', icon: 'Focus' },
          { label: 'Campanha', detail: 'Texto 2 — cuidar da saúde masculina.', icon: 'Heart' },
          { label: 'Coisa de homem', detail: '«De» liga «coisa» a «homem» — relação nominal.', icon: 'Link' },
          { label: 'Preposição', detail: 'Indica relação de pertencimento/especificação.', icon: 'CheckCircle' },
          { label: '× pronome', detail: '«De» não substitui antecedente.', icon: 'XCircle' },
        ],
        footer_rule: 'De = preposição entre nomes.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → E',
        meta: slideMeta,
        steps: [
          'Texto 2: «Cuidar da saúde também é coisa de homem!»',
          '«De» em «coisa de homem» une os substantivos.',
          'A pronome retomaria termo — eliminar.',
          'B advérbio modificaria verbo — eliminar.',
          'C artigo antecederia substantivo definido — eliminar.',
          'D conjunção ligaria orações — eliminar.',
          'E preposição de relação nominal — correto.',
          'Gabarito E.',
          'Em similares: «coisa de homem», «cuidado com a saúde» — «de» liga termos (preposição).',
        ],
        footer_rule: 'E — preposição.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DE NOMINAL',
        rows: [
          { label: 'Função', value: 'Preposição — relação entre termos.' },
          { label: 'Coisa de homem', value: 'Especifica a que tipo de coisa se refere.' },
          { label: '× artigo', value: 'Artigo seria «o homem» — não «de».' },
          { label: 'Nesta questão', value: 'E — preposição.' },
        ],
        footer_rule: 'De liga nomes — não retoma nem conjuga.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe vizinha em «de»',
        items: [
          { label: 'A — pronome', detail: '«De» parece «do» contrato.', correct: 'Não substitui antecedente — apenas liga «coisa» e «homem».' },
          { label: 'B — advérbio', detail: '«De» aparece perto do verbo «é».', correct: '«De» integra sintagma nominal «coisa de homem».' },
          { label: 'C — artigo', detail: 'Confunde «de» com «do» definido.', correct: 'Artigo definido seria «o» — «de» é preposição.' },
          { label: 'D — conjunção', detail: '«Também é» sugere ligação clausal.', correct: '«De» está dentro do predicativo nominal — preposição.' },
          { label: 'Em outra banca…', detail: 'Trocam por «assunto de mulher».', correct: 'Mesmo padrão: substantivo + de + substantivo.' },
        ],
        footer_rule: 'Só E — preposição.',
      },
    ],
  },

  'avancasp-acd-classes-analise-o-termo-destacado-na-frase-e-3554862': {
    family: 'conceito',
    source_tec_id: '3554862',
    source_note: 'Relação problema/incríveis/primeiro — AVANÇASP ACD Pref Vinhedo 2025 tec 3554862',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACD (Pref Vinhedo)',
      orgao: 'Pref Vinhedo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise o termo destacado em cada frase e relacione-o à sua correta classe gramatical:\n\nI. «Ele arrumou um problema com aquela atitude.» — termo destacado: problema\n\nII. «Sérgio visitou muitos países incríveis em sua viagem pelas Américas.» — termo destacado: incríveis\n\nIII. «Levi estava tão ansioso que foi o primeiro a chegar.» — termo destacado: primeiro\n\na) Numeral\nb) Substantivo\nc) Adjetivo\n\nIndique a alternativa que estabelece as relações corretamente.',
    options: [
      { id: 'A', text: 'I – b; II – c; III – a.', is_correct: true },
      { id: 'B', text: 'I – a; II – c; III – b.', is_correct: false },
      { id: 'C', text: 'I – c; II – a; III – b.', is_correct: false },
      { id: 'D', text: 'I – a; II – b; III – c.', is_correct: false },
      { id: 'E', text: 'I – b; II – a; III – c.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três destaques',
        chip_label: 'M02 — relação',
        meta: slideMeta,
        items: [
          { label: 'I — problema', detail: 'Núcleo nominal — substantivo comum.', icon: 'Box' },
          { label: 'II — incríveis', detail: 'Qualifica «países» — adjetivo.', icon: 'Sparkles' },
          { label: 'III — primeiro', detail: 'Indica ordem na chegada — numeral ordinal.', icon: 'ListOrdered' },
          { label: 'Legenda', detail: 'a numeral · b substantivo · c adjetivo.', icon: 'Key' },
        ],
        footer_rule: 'I–b; II–c; III–a.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'I II III → A',
        meta: slideMeta,
        steps: [
          'I «problema» — nomeia o objeto arrumado — substantivo (b).',
          'II «incríveis» — caracteriza «países» — adjetivo (c).',
          'III «primeiro» — ordem na sequência de chegada — numeral ordinal (a).',
          'Relação correta: I–b; II–c; III–a.',
          'B troca I com numeral — eliminar.',
          'C/D/E permutam incorretamente — eliminar.',
          'Gabarito A.',
          'Em similares: nomeia → substantivo; qualifica → adjetivo; ordem → numeral ordinal.',
        ],
        footer_rule: 'A — b, c, a.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'A · B · C',
        rows: [
          { label: 'Substantivo (b)', value: 'Problema — nomeia ser/objeto.' },
          { label: 'Adjetivo (c)', value: 'Incríveis — qualifica países.' },
          { label: 'Numeral (a)', value: 'Primeiro — ordem (ordinal).' },
          { label: 'Nesta questão', value: 'A — I–b; II–c; III–a.' },
        ],
        footer_rule: 'Pergunta-teste: nomeia, qualifica ou indica ordem?',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar numeral e substantivo',
        items: [
          { label: 'B — I–a', detail: '«Um» antes de problema parece o destaque.', correct: 'Destaque é «problema» — substantivo, não «um».' },
          { label: 'D — II–b', detail: '«Países» parece mais importante que «incríveis».', correct: 'Destaque é o adjetivo «incríveis».' },
          { label: 'E — II–a', detail: '«Muitos» confunde com destaque.', correct: '«Muitos» é numeral; destaque é «incríveis» (adj.).' },
          { label: 'C — III–b', detail: '«Primeiro» parece substantivo por ter artigo.', correct: '«Primeiro» indica ordem — numeral ordinal.' },
          { label: 'Em outra banca…', detail: 'Trocam por «segundo a falar».', correct: 'Ordinal de ordem = numeral.' },
        ],
        footer_rule: 'Só A fecha a trinca.',
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
