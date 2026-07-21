#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — oracoes-coordenadas-e-subordinadas-g02 (8 slugs · Orações coordenadas e subordinadas · lote 2).
 *
 *   npx tsx scripts/handcraft-oracoes-coordenadas-e-subordinadas-g02.ts
 *   npm run audit:questao-readiness -- --lote=oracoes-coordenadas-e-subordinadas-g02 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=oracoes-coordenadas-e-subordinadas-g02 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'oracoes-coordenadas-e-subordinadas-g02';
const SUBTOPICO = 'Orações coordenadas e subordinadas';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_oracoes_subordinadas';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-apice-portugues-oracoes-adversativa-pocinhos.json';

const ORACOES_SOURCE = {
  id: 'pt-oracoes-subordinadas-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Orações coordenadas e subordinadas — dependência, conectivos e classificação',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'coordenação × subordinação',
    'oração subordinada substantiva objetiva direta',
    'oração subordinada substantiva objetiva indireta',
    'oração subordinada adjetiva restritiva × explicativa',
    'oração subordinada adverbial consecutiva',
    'locução adjetiva',
    'pergunta-teste de dependência',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment';

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
  guidelineOverride?: string;
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
      reviewer: 'handcraft:oracoes-coordenadas-e-subordinadas-g02',
      guideline_snapshot:
        spec.guidelineOverride ??
        `M07 Elias TE-simples — trilho período → dependência → conectivo · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      ORACOES_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'coordenação e subordinação'],
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
  'cpcon-uepb-a-oracoes-leia-o-texto-i-para-responder-a-ques-3912828': {
    family: 'text_fragment',
    source_tec_id: '3912828',
    source_note:
      'Cometa 3I/Atlas — subordinada substantiva objetiva direta — CPCON UEPB ACS (Pref Cuité) 2026 tec 3912828',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Cuité)',
      orgao: 'Pref Cuité',
      ano: '2026',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'Leia o Texto I para responder à questão. No período retirado do texto: «Instrumentos de observação detectaram que ele acelerou de maneira inesperada, movendo-se mais rápido do que a gravidade permitiria.», a oração destacada classifica-se como:',
    text_fragment:
      '<p>Texto sobre o cometa interestelar 3I/Atlas (adaptado). «Instrumentos de observação detectaram <strong>que ele acelerou de maneira inesperada</strong>, movendo-se mais rápido do que a gravidade permitiria».</p>',
    options: [
      { id: 'A', text: 'oração coordenada sindética explicativa.', is_correct: false },
      { id: 'B', text: 'oração subordinada adjetiva explicativa.', is_correct: false },
      { id: 'C', text: 'oração subordinada adverbial causal.', is_correct: false },
      { id: 'D', text: 'oração subordinada adverbial consecutiva.', is_correct: false },
      { id: 'E', text: 'oração subordinada substantiva objetiva direta.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trilho do período',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Dependência',
            detail: '«Detectar» é verbo transitivo direto — pede um complemento: o quê detectaram?',
            icon: 'GitBranch',
          },
          {
            label: '2. Conta os verbos',
            detail: '«Detectaram» + «acelerou» → dois núcleos verbais no período.',
            icon: 'ListOrdered',
          },
          {
            label: '3. Teste «o quê?»',
            detail: 'O que detectaram? → «que ele acelerou de maneira inesperada» = resposta = objeto direto.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: '«Movendo-se…» é gerúndio dentro da própria oração — não cria uma terceira oração independente.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Detectar + que = substantiva objetiva direta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Cometa 3I/Atlas → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre o cometa 3I/Atlas: «Instrumentos de observação detectaram que ele acelerou de maneira inesperada».',
          'A: não há duas orações independentes ligadas por explicação — há um único núcleo «detectaram» pedindo complemento.',
          'B: não existe substantivo antecedente sendo qualificado por «que» — não é adjetiva.',
          'C: falta conectivo causal (porque, já que) — não é causal.',
          'D: falta «tão…que»/«de modo que» marcando consequência — não é consecutiva.',
          '«Detectaram» exige complemento: o quê detectaram? → «que ele acelerou de maneira inesperada» é esse complemento.',
          'Gabarito E — subordinada substantiva objetiva direta.',
        ],
        footer_rule: 'Verbo transitivo direto + que = substantiva objetiva direta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Detectar + que = OD',
        meta: slideMeta,
        content: 'VERBO TRANSITIVO + QUE',
        rows: [
          { label: 'Verbo transitivo direto', value: 'Detectar, notar, perceber, dizer — pedem complemento (o quê?).' },
          { label: 'Substantiva objetiva direta', value: 'A oração «que…» funciona como esse complemento.' },
          { label: '≠ Adjetiva', value: 'Exigiria substantivo antecedente sendo qualificado por «que».' },
          { label: '≠ Causal/consecutiva', value: 'Exigem conectivo próprio (porque / tão…que).' },
          { label: 'Nesta questão', value: 'detectaram que → substantiva objetiva direta (E)' },
        ],
        footer_rule: 'Pergunte «o quê?» ao verbo antes de classificar.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar o complemento por outro tipo de oração',
        items: [
          {
            label: 'A — coordenada explicativa',
            detail: 'Duas ideias parecem só se somar.',
            correct: 'Há um único verbo principal pedindo complemento — não é coordenação entre independentes.',
          },
          {
            label: 'B — adjetiva explicativa',
            detail: '«Que» logo após «detectaram» pode parecer relativo.',
            correct: 'Não há substantivo antecedente — «que» introduz o complemento do verbo, não retoma substantivo.',
          },
          {
            label: 'C — adverbial causal',
            detail: 'A ideia de «inesperada» sugere motivo.',
            correct: 'Falta o conectivo causal (porque, já que) — a oração é objeto, não causa.',
          },
          {
            label: 'D — adverbial consecutiva',
            detail: '«De maneira inesperada» parece um efeito.',
            correct: 'Sem «tão…que»/«de modo que» marcando consequência — é só o complemento de «detectaram».',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «detectaram» por «perceberam» ou «notaram».',
            correct: 'Mesmo trilho: verbo transitivo direto + que = substantiva objetiva direta.',
          },
        ],
        footer_rule: 'E: subordinada substantiva objetiva direta.',
      },
    ],
  },

  'selecon-fisc-oracoes-inteligencia-artificial-consegue-dec-3352887': {
    family: 'text_fragment',
    source_tec_id: '3352887',
    source_note:
      'IA decifra papiros — subordinada substantiva objetiva indireta reduzida — SELECON Fisc (Pref Sinop) 2025 tec 3352887',
    meta: {
      banca: 'SELECON',
      prova: 'Fisc (Pref Sinop)',
      orgao: 'Pref Sinop',
      ano: '2025',
      cargo_header: 'FISCAL',
    },
    instruction:
      '«É assim que a inteligência artificial ajuda a decifrar essas folhas» (5º parágrafo). A oração em destaque classifica-se como subordinada substantiva:',
    text_fragment:
      '<p>Texto sobre a IA que decifra papiros históricos (adaptado). «É assim que a inteligência artificial ajuda <strong>a decifrar essas folhas</strong>».</p>',
    options: [
      { id: 'A', text: 'subjetiva', is_correct: false },
      { id: 'B', text: 'objetiva direta', is_correct: false },
      { id: 'C', text: 'objetiva indireta', is_correct: true },
      { id: 'D', text: 'completiva nominal', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ajudar A + infinitivo',
        chip_label: 'Regência decide',
        meta: slideMeta,
        items: [
          {
            label: '1. Regência do verbo',
            detail: '«Ajudar» pede complemento com preposição fixa: ajudar A alguém A fazer algo.',
            icon: 'GitBranch',
          },
          {
            label: '2. Reduzida de infinitivo',
            detail: '«A decifrar essas folhas» — preposição «a» + infinitivo, sem conectivo «que».',
            icon: 'Link',
          },
          {
            label: '3. Teste da preposição',
            detail: 'Complemento com preposição obrigatória = objetiva indireta, não direta.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: '«Decifrar» parece ação direta, mas a preposição «a» antes já marca a indireta.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Preposição «a» antes do infinitivo → objetiva indireta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Papiros decifrados por IA → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre papiros decifrados por IA: «É assim que a inteligência artificial ajuda a decifrar essas folhas» (5º parágrafo).',
          'A: «inteligência artificial» já é o sujeito de «ajuda» — a oração reduzida não exerce função de sujeito.',
          'B: objetiva direta não usaria preposição fixa; aqui há «a» obrigatório antes do infinitivo.',
          'D: completiva nominal completaria um substantivo/adjetivo — aqui completa o verbo «ajudar».',
          '«Ajudar A» exige preposição fixa antes do complemento — regência indireta.',
          '«A decifrar essas folhas» é o complemento preposicionado de «ajuda» → objetiva indireta reduzida de infinitivo.',
          'Gabarito C. Em similares: ajudar a, insistir em, gostar de + infinitivo = objetiva indireta reduzida.',
        ],
        footer_rule: 'Verbo com preposição fixa + infinitivo = objetiva indireta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Regência decide o tipo',
        meta: slideMeta,
        content: 'DIRETA × INDIRETA',
        rows: [
          { label: 'Objetiva direta', value: 'Verbo transitivo direto + que/infinitivo, sem preposição.' },
          { label: 'Objetiva indireta', value: 'Verbo exige preposição fixa (ajudar A, insistir EM, gostar DE) + complemento.' },
          { label: 'Reduzida de infinitivo', value: 'Sem conectivo «que», verbo no infinitivo.' },
          { label: '≠ Completiva nominal', value: 'Completa substantivo/adjetivo, não verbo.' },
          { label: 'Nesta questão', value: 'ajuda A decifrar → objetiva indireta (C)' },
        ],
        footer_rule: 'A preposição antes do infinitivo é a pista da regência.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir regência direta com indireta',
        items: [
          {
            label: 'B — objetiva direta',
            detail: '«Decifrar» parece ação direta do sujeito.',
            correct: 'A preposição «a» obrigatória depois de «ajudar» marca complemento indireto, não direto.',
          },
          {
            label: 'A — subjetiva',
            detail: 'Pensar que a oração é sujeito de «ajuda».',
            correct: '«Inteligência artificial» já é o sujeito — a oração reduzida é o complemento do verbo.',
          },
          {
            label: 'D — completiva nominal',
            detail: 'Confundir complemento de verbo com complemento de substantivo.',
            correct: 'Completiva nominal completa nome/adjetivo; aqui completa o verbo «ajudar».',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «ajudar a» por «insistir em» ou «gostar de».',
            correct: 'Mesmo trilho: preposição fixa do verbo + infinitivo = objetiva indireta reduzida.',
          },
        ],
        footer_rule: 'C: subordinada substantiva objetiva indireta.',
      },
    ],
  },

  'selecon-athh-oracoes-quando-eu-deixei-de-acreditar-em-mim-3416687': {
    family: 'text_fragment',
    source_tec_id: '3416687',
    source_note:
      'Crônica autoconfiança — subordinada substantiva objetiva direta (se = que) — SELECON ATHH (HEMOMINAS) 2025 tec 3416687',
    meta: {
      banca: 'SELECON',
      prova: 'ATHH (HEMOMINAS)',
      orgao: 'HEMOMINAS',
      ano: '2025',
      cargo_header: 'AUXILIAR ADMINISTRATIVO',
    },
    instruction:
      '«Não sei se foi um acúmulo de experiências negativas com o passar dos anos, ou se foi alguma situação pontual, mas sinto que algo em mim morreu; o combustível que alimentava esse fogo acabou» (9º parágrafo). A oração em destaque é classificada sintaticamente como:',
    text_fragment:
      '<p>Crônica sobre autoconfiança perdida (adaptado). «Não sei <strong>se foi um acúmulo de experiências negativas com o passar dos anos</strong>, ou se foi alguma situação pontual, mas sinto que algo em mim morreu».</p>',
    options: [
      { id: 'A', text: 'subordinada adjetiva restritiva', is_correct: false },
      { id: 'B', text: 'subordinada adverbial temporal', is_correct: false },
      { id: 'C', text: 'coordenada sindética adversativa', is_correct: false },
      { id: 'D', text: 'subordinada substantiva objetiva direta', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Se = que (substantiva)',
        chip_label: 'Verbo de dúvida',
        meta: slideMeta,
        items: [
          {
            label: '1. Verbo «saber»',
            detail: '«Não sei» é transitivo direto — pede complemento: o quê não sei?',
            icon: 'GitBranch',
          },
          {
            label: '2. Conectivo «se»',
            detail: 'Aqui equivale a «que» — introduz dúvida, não uma condição.',
            icon: 'Link',
          },
          {
            label: '3. Teste «o quê?»',
            detail: 'Não sei O QUÊ? → «se foi um acúmulo…» = resposta = objeto direto.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: '«Se» lembra condição, mas depois de saber/perguntar/duvidar ele introduz substantiva objetiva direta.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Saber + se (= que) → substantiva objetiva direta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Crônica sobre autoconfiança → cargo',
        meta: slideMeta,
        steps: [
          'Crônica sobre perda de autoconfiança: «Não sei se foi um acúmulo de experiências negativas com o passar dos anos, ou se foi alguma situação pontual».',
          'A: não há substantivo antecedente sendo restringido por «se» — não é adjetiva.',
          'B: não há noção de tempo (quando, enquanto) — «se» aqui marca dúvida, não tempo.',
          'C: o «mas» aparece depois, ligando outra oração — a oração destacada não tem conectivo adversativo.',
          '«Não sei» é verbo transitivo direto exigindo complemento: o que não sei?',
          '«Se foi um acúmulo de experiências negativas…» é esse complemento — dúvida expressa como interrogativa indireta.',
          'Gabarito D — subordinada substantiva objetiva direta.',
        ],
        footer_rule: 'Verbo de dúvida + se (=que) = substantiva objetiva direta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Se após verbos de dúvida',
        meta: slideMeta,
        content: 'SE = QUE (INTERROGATIVA INDIRETA)',
        rows: [
          { label: 'Verbos de dúvida/pergunta', value: 'Saber, perguntar, duvidar, ignorar + se.' },
          { label: '«Se» substantivo', value: 'Equivale a «que», introduz interrogativa indireta.' },
          { label: '≠ Se condicional', value: 'Exigiria hipótese (se eu soubesse, iria).' },
          { label: 'Substantiva objetiva direta', value: 'Completa o verbo transitivo direto.' },
          { label: 'Nesta questão', value: 'não sei se foi → substantiva objetiva direta (D)' },
        ],
        footer_rule: 'Verbo de dúvida decide a leitura do «se».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar dúvida por restrição, tempo ou oposição',
        items: [
          {
            label: 'A — adjetiva restritiva',
            detail: '«Se» pode parecer retomar algo já citado.',
            correct: 'Não há substantivo antecedente restringido; «se» introduz o complemento de «saber».',
          },
          {
            label: 'B — adverbial temporal',
            detail: 'A narrativa fala do passar dos anos.',
            correct: 'Não há conectivo temporal (quando/enquanto); «se» marca dúvida, não tempo.',
          },
          {
            label: 'C — coordenada adversativa',
            detail: '«Mas» aparece na frase e confunde com esta oração.',
            correct: '«Mas» liga outra oração mais adiante; a oração destacada é o complemento de «não sei».',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «não sei se» por «duvido se» ou «não sei que».',
            correct: 'Mesmo trilho: verbo de dúvida + se (=que) = substantiva objetiva direta.',
          },
        ],
        footer_rule: 'D: subordinada substantiva objetiva direta.',
      },
    ],
  },

  'educa-pb-ace-oracoes-considere-o-texto-a-seguir-para-resp-3820016': {
    family: 'text_fragment',
    source_tec_id: '3820016',
    source_note:
      'Poema Adélia Prado — principal + subordinada substantiva objetiva direta — EDUCA PB ACE (Pref Ibiara) 2025 tec 3820016',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACE (Pref Ibiara)',
      orgao: 'Pref Ibiara',
      ano: '2025',
      cargo_header: 'COMBATE ÀS ENDEMIAS',
    },
    instruction:
      'Considere o texto a seguir para responder a questão. Releia o trecho do poema: «Mas o que sinto escrevo.» É CORRETO afirmar que sua estrutura é composta por:',
    text_fragment:
      '<p><strong>TEXTO II — Com licença poética</strong> (Adélia Prado, adaptado). «Quando nasci um anjo esbelto […] anunciou: vai carregar bandeira. […] Aceito os subterfúgios que me cabem, sem precisar mentir. […] <strong>Mas o que sinto escrevo.</strong> Cumpro a sina. Inauguro linhagens, fundo reinos — dor não é amargura.»</p>',
    options: [
      { id: 'A', text: 'Duas orações coordenadas assindéticas.', is_correct: false },
      { id: 'B', text: 'Duas orações, sendo uma principal e uma subordinada.', is_correct: true },
      { id: 'C', text: 'Três orações independentes, ligadas por justaposição.', is_correct: false },
      { id: 'D', text: 'Uma oração principal e uma coordenada adverbial causal.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«O que sinto escrevo»',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Conta os verbos',
            detail: '«Sinto» e «escrevo» → duas orações no verso.',
            icon: 'GitBranch',
          },
          {
            label: '2. Dependência',
            detail: '«O que sinto» funciona como objeto direto de «escrevo» — depende dele.',
            icon: 'Link',
          },
          {
            label: '3. Classificação',
            detail: 'Subordinada substantiva objetiva direta («o que sinto») + oração principal («escrevo»).',
            icon: 'Layers',
          },
          {
            label: 'Pegadinha',
            detail: 'O «mas» inicial contrapõe este verso ao anterior — não liga as duas orações internas do próprio verso.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '«O que sinto» é objeto de «escrevo» — subordinada, não coordenada.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Com licença poética → cargo',
        meta: slideMeta,
        steps: [
          'Poema «Com licença poética» (Adélia Prado): «Quando nasci… anunciou: vai carregar bandeira». Verso-alvo: «Mas o que sinto escrevo.»',
          'A: não são duas orações independentes ligadas só por justaposição — «o que sinto» depende de «escrevo».',
          'C: há apenas dois verbos («sinto», «escrevo»), não três orações.',
          'D: não há conectivo causal (porque, já que) entre elas — a relação é de complemento (objeto), não de causa.',
          '«O que» equivale a «aquilo que» e funciona como objeto direto de «escrevo».',
          'Uma oração principal («escrevo») + uma subordinada substantiva objetiva direta («o que sinto»).',
          'Gabarito B. Em similares: «o que» no meio do verso quase sempre introduz uma substantiva-objeto.',
        ],
        footer_rule: '«O que» + verbo = subordinada substantiva objetiva direta.',
      },
      {
        type: 'golden_rule',
        slide_title: '«O que» = objeto disfarçado',
        meta: slideMeta,
        content: 'PRINCIPAL + SUBORDINADA-OBJETO',
        rows: [
          { label: '«O que»', value: 'Equivale a «aquilo que» — pronome relativo com antecedente oculto.' },
          { label: 'Função', value: 'Complementa o verbo seguinte (aqui, «escrevo») como objeto direto.' },
          { label: 'Estrutura', value: '1 principal + 1 subordinada substantiva objetiva direta.' },
          { label: '≠ Coordenação', value: 'Não há independência entre as duas orações — uma é termo da outra.' },
          { label: 'Nesta questão', value: 'o que sinto (subordinada) + escrevo (principal) (B)' },
        ],
        footer_rule: 'Verso curto pode ter estrutura de período composto por subordinação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar subordinação por coordenação ou causa',
        items: [
          {
            label: 'A — coordenadas assindéticas',
            detail: 'Duas orações juntas sem «que» explícito parecem só somadas.',
            correct: '«O que sinto» já funciona como objeto de «escrevo» — há dependência, não independência.',
          },
          {
            label: 'C — três orações independentes',
            detail: 'O verso é curto e parece ter mais de dois núcleos.',
            correct: 'Só há dois verbos («sinto», «escrevo»); não há uma terceira oração aqui.',
          },
          {
            label: 'D — coordenada causal',
            detail: 'Pode parecer que sentir «causa» escrever.',
            correct: 'Falta conectivo causal; a relação é de complemento (objeto), não de causa.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem usar «o que penso digo» ou verso semelhante.',
            correct: 'Mesmo trilho: «o que» + verbo = subordinada substantiva objetiva direta.',
          },
        ],
        footer_rule: 'B: uma principal e uma subordinada.',
      },
    ],
  },

  'selecon-acs-oracoes-considere-o-texto-a-seguir-para-resp-3990840': {
    family: 'text_fragment',
    source_tec_id: '3990840',
    source_note:
      'Pesquisa Ipea desinformação — subordinada adjetiva restritiva — SELECON ACS (FeSaúde) 2026 tec 3990840',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (FeSaúde)',
      orgao: 'FeSaúde',
      ano: '2026',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'Considere o texto a seguir para responder a questão. No período «Servidores públicos que ocupam cargo em comissão ou função de confiança da administração pública federal devem participar de pesquisa inédita sobre os efeitos das campanhas de desinformação na internet contra políticas públicas», a oração em destaque é:',
    text_fragment:
      '<p>Texto sobre pesquisa do Ipea contra desinformação (adaptado). «Servidores públicos <strong>que ocupam cargo em comissão ou função de confiança da administração pública federal</strong> devem participar de pesquisa inédita sobre os efeitos das campanhas de desinformação».</p>',
    options: [
      {
        id: 'A',
        text: 'subordinada adjetiva restritiva, pois delimita o universo de servidores referido pelo sujeito e não pode ser suprimida sem alterar o sentido',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'coordenada sindética explicativa, pois acrescenta informação acessória sobre os servidores, sem restringir o sentido do sujeito',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'subordinada adverbial causal, pois indica o motivo pelo qual os servidores foram selecionados para participar da pesquisa',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'subordinada substantiva subjetiva, pois exerce a função de sujeito do verbo "devem participar" na oração principal',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Restringe ou só explica?',
        chip_label: 'A vírgula decide',
        meta: slideMeta,
        items: [
          {
            label: '1. Sem vírgula',
            detail: '«Que ocupam cargo…» vem sem vírgula separando de «servidores públicos» — sinal de restritiva.',
            icon: 'GitBranch',
          },
          {
            label: '2. Retoma o substantivo',
            detail: '«Que» = «servidores públicos» — pronome relativo, introduz adjetiva.',
            icon: 'Link',
          },
          {
            label: '3. Teste da supressão',
            detail: 'Remover a oração muda o sentido — nem todo servidor, só os que ocupam cargo em comissão.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'A oração qualifica o sujeito, mas não substitui o sujeito — não é substantiva subjetiva.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sem vírgula + delimita o grupo = adjetiva restritiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Pesquisa do Ipea → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre pesquisa do Ipea: «Servidores públicos que ocupam cargo em comissão ou função de confiança devem participar da pesquisa».',
          'B: não há vírgula isolando a oração; se fosse explicativa, viria separada por vírgulas — aqui ela restringe.',
          'C: não há conectivo causal (porque, já que) — «que» é pronome relativo, não introduz causa.',
          'D: a oração não substitui o sujeito inteiro; «que ocupam…» qualifica «servidores públicos», já núcleo do sujeito — é adjetiva.',
          '«Que» retoma «servidores públicos» e delimita exatamente quais servidores.',
          'Sem essa oração, o sentido mudaria para incluir todos os servidores, não só esse grupo.',
          'Gabarito A — subordinada adjetiva restritiva.',
        ],
        footer_rule: 'Delimita o substantivo sem vírgula = adjetiva restritiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Restritiva × explicativa',
        meta: slideMeta,
        content: 'A VÍRGULA DECIDE',
        rows: [
          { label: 'Restritiva', value: 'Sem vírgula, delimita/especifica o grupo — não pode ser retirada sem mudar o sentido.' },
          { label: 'Explicativa', value: 'Entre vírgulas, só acrescenta informação — pode ser retirada sem prejuízo essencial.' },
          { label: 'Pronome relativo «que»', value: 'Retoma o substantivo antecedente (aqui, «servidores públicos»).' },
          { label: '≠ Substantiva subjetiva', value: 'Exigiria a oração ocupando todo o lugar do sujeito, não apenas qualificando-o.' },
          { label: 'Nesta questão', value: 'sem vírgula, delimita o grupo → adjetiva restritiva (A)' },
        ],
        footer_rule: 'Sem vírgula = restritiva; com vírgula = explicativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar restrição por explicação, causa ou sujeito',
        items: [
          {
            label: 'B — explicativa',
            detail: 'Informação extra sobre os servidores parece só um comentário.',
            correct: 'Sem vírgulas isolando — a oração restringe quem são os servidores, não apenas comenta.',
          },
          {
            label: 'C — causal',
            detail: '«Ocupar cargo» pode parecer o motivo da participação.',
            correct: 'Falta conectivo causal; «que» é pronome relativo, introduzindo qualificação, não causa.',
          },
          {
            label: 'D — substantiva subjetiva',
            detail: 'A oração parece central, quase um sujeito.',
            correct: 'O sujeito já é «servidores públicos»; a oração com «que» apenas qualifica esse sujeito — é adjetiva.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem isolar a oração com vírgulas para virar explicativa.',
            correct: 'Mesmo trilho: vírgula decide — sem vírgula = restritiva; com vírgula = explicativa.',
          },
        ],
        footer_rule: 'A: subordinada adjetiva restritiva.',
      },
    ],
  },

  'avancasp-gcm-oracoes-nao-ha-nada-na-escrita-tudo-o-que-vo-4001118': {
    family: 'conceito',
    source_tec_id: '4001118',
    source_note:
      'Hemingway «máquina de escrever» — locução adjetiva — AVANÇASP GCM (Pref Taiúva) 2026 tec 4001118',
    meta: {
      banca: 'AVANÇASP',
      prova: 'GCM (Pref Taiúva)',
      orgao: 'Pref Taiúva',
      ano: '2026',
      cargo_header: 'GUARDA CIVIL MUNICIPAL',
    },
    instruction:
      '«Não há nada na escrita. Tudo o que você precisa fazer é sentar-se diante da máquina de escrever e sangrar.» (Ernest Hemingway) A expressão destacada «de escrever», no trecho «a máquina de escrever», apresenta característica:',
    options: [
      { id: 'A', text: 'adjetiva, qualificando o pronome «você».', is_correct: false },
      { id: 'B', text: 'adjetiva, qualificando o substantivo «máquina».', is_correct: true },
      { id: 'C', text: 'adverbial, indicando circunstância de modo em relação a «sentar-se».', is_correct: false },
      { id: 'D', text: 'adverbial, indicando circunstância de modo em relação a «sangrar».', is_correct: false },
      { id: 'E', text: 'conjuntiva, introduzindo o sentido de causa em relação ao substantivo «máquina».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Locução adjetiva «de escrever»',
        chip_label: 'Substantivo mais próximo',
        meta: slideMeta,
        items: [
          {
            label: '1. Substantivo mais próximo',
            detail: '«Máquina de escrever» — «de escrever» vem colado a «máquina».',
            icon: 'GitBranch',
          },
          {
            label: '2. Teste da troca',
            detail: '«Máquina de escrever» = «máquina escritora» — adjetivo único equivalente.',
            icon: 'HelpCircle',
          },
          {
            label: '3. Função',
            detail: 'Locução adjetiva qualifica o substantivo «máquina», não um verbo.',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: 'O infinitivo dentro da locução não a torna adverbial — o alvo dela é «máquina», não «sentar-se»/«sangrar».',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Locução adjetiva qualifica substantivo, mesmo com infinitivo dentro.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Pensamento de Hemingway → cargo',
        meta: slideMeta,
        steps: [
          'Pensamento de Hemingway: «Não há nada na escrita. Tudo o que você precisa fazer é sentar-se diante da máquina de escrever e sangrar.»',
          'A: «de escrever» está ao lado de «máquina», não de «você» — não qualifica o pronome.',
          'C: «sentar-se» já tem sentido completo; «de escrever» não modifica o modo de sentar.',
          'D: «sangrar» está distante de «de escrever» e não é modificado por essa locução.',
          'E: não há sentido de causa entre «de escrever» e «máquina» — é qualificação, não motivo.',
          'Teste: troque a locução por um adjetivo único → «máquina de escrever» = «máquina escritora» — comportamento de adjetivo.',
          'Gabarito B — locução adjetiva qualificando «máquina».',
        ],
        footer_rule: 'Substitua por um adjetivo único para confirmar a função.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Troque por um adjetivo só',
        meta: slideMeta,
        content: 'LOCUÇÃO ADJETIVA',
        rows: [
          { label: 'Locução adjetiva', value: 'Duas ou mais palavras com valor de adjetivo (de escrever = escritora; de ferro = férreo).' },
          { label: 'Teste rápido', value: 'Substitua a locução por um único adjetivo — se funciona, é adjetiva.' },
          { label: 'Alvo da locução', value: 'O substantivo mais próximo (aqui, «máquina»).' },
          { label: '≠ Adverbial', value: 'Modificaria um verbo (sentar-se, sangrar), não um substantivo.' },
          { label: 'Nesta questão', value: 'máquina de escrever → locução adjetiva de «máquina» (B)' },
        ],
        footer_rule: 'A proximidade com o substantivo revela o alvo da locução.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar o alvo da locução',
        items: [
          {
            label: 'A — qualifica «você»',
            detail: '«Você» está na mesma frase e pode confundir o alvo.',
            correct: 'A locução está colada a «máquina», não a «você» — a proximidade decide o alvo.',
          },
          {
            label: 'C — modo de «sentar-se»',
            detail: 'O infinitivo «escrever» parece ligado à ação de sentar.',
            correct: '«De escrever» define o tipo de máquina, não o modo de «sentar-se».',
          },
          {
            label: 'D — modo de «sangrar»',
            detail: '«Sangrar» é o verbo mais forte da frase, mas está longe da locução.',
            correct: 'A locução qualifica «máquina»; «sangrar» nem está na mesma oração da locução.',
          },
          {
            label: 'E — conjuntiva/causa',
            detail: 'Confundir «de» com conectivo de causa.',
            correct: 'Não há relação de causa; «de escrever» é qualificação equivalente a um adjetivo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar por «máquina de lavar» ou «copo de vidro».',
            correct: 'Mesmo trilho: substantivo + de + palavra = locução adjetiva do substantivo.',
          },
        ],
        footer_rule: 'B: locução adjetiva qualificando «máquina».',
      },
    ],
  },

  'cpcon-uepb-a-oracoes-leia-o-texto-01-para-responder-a-que-4014452': {
    family: 'text_fragment',
    source_tec_id: '4014452',
    source_note:
      'Por que o céu é azul (BBC) — três «que»: consecutiva, adjetiva explicativa, adjetiva restritiva — CPCON UEPB ACS (Pref Itabaiana) 2026 tec 4014452',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Itabaiana)',
      orgao: 'Pref Itabaiana',
      ano: '2026',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'Leia o Texto 01 para responder à questão. No fragmento «A luz azul é então dispersada com tanta intensidade que é desviada para longe de nós. Restam os tons de vermelho e laranja, menos dispersados, que alcançam nossos olhos e produzem os céus que vemos», as orações introduzidas pelo termo «que» podem ser classificadas, respectivamente, como:',
    text_fragment:
      '<p>Texto sobre por que o céu é azul, BBC News Brasil (adaptado). «A luz azul é então dispersada com tanta intensidade <strong>que é desviada</strong> para longe de nós. Restam os tons de vermelho e laranja, menos dispersados, <strong>que alcançam nossos olhos</strong> e produzem os céus <strong>que vemos</strong>».</p>',
    options: [
      {
        id: 'A',
        text: 'oração subordinada adjetiva restritiva, oração subordinada substantiva subjetiva, oração subordinada substantiva objetiva direta.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'oração subordinada adjetiva restritiva, oração subordinada adjetiva explicativa, oração subordinada adjetiva restritiva.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'oração subordinada substantiva objetiva direta, oração subordinada adjetiva explicativa, oração subordinada adjetiva restritiva.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'oração subordinada adverbial consecutiva, oração subordinada adjetiva explicativa, oração subordinada adjetiva restritiva.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'oração subordinada adverbial consecutiva, oração subordinada adjetiva explicativa, oração subordinada substantiva objetiva direta.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três «que», três funções',
        chip_label: 'Vírgula + tanto…que',
        meta: slideMeta,
        items: [
          {
            label: '1. «Tanta intensidade que é desviada»',
            detail: 'Estrutura «tanto/tanta…que» = consequência → adverbial consecutiva.',
            icon: 'GitBranch',
          },
          {
            label: '2. «…menos dispersados, que alcançam…»',
            detail: 'Vírgulas isolando a oração → adjetiva explicativa (só acrescenta).',
            icon: 'Link',
          },
          {
            label: '3. «Céus que vemos»',
            detail: 'Sem vírgula, delimita quais céus → adjetiva restritiva.',
            icon: 'Layers',
          },
          {
            label: 'Pegadinha',
            detail: 'Os três «que» parecem iguais — só o teste da vírgula e do «tanto…que» revela a função de cada um.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tanto/tanta…que = consecutiva; vírgula decide explicativa × restritiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Por que o céu é azul → cargo',
        meta: slideMeta,
        steps: [
          'Texto BBC sobre a cor do céu: «A luz azul é dispersada com tanta intensidade que é desviada para longe de nós».',
          'Seguem: «Restam os tons de vermelho e laranja, que alcançam nossos olhos e produzem os céus que vemos».',
          '1º «que»: vem depois de «tanta intensidade» — correlação «tanto…que» indica consequência → adverbial consecutiva.',
          '2º «que»: «vermelho e laranja, menos dispersados, que alcançam…» vem isolada por vírgulas, só acrescenta informação → adjetiva explicativa.',
          '3º «que»: «céus que vemos» — sem vírgula, delimita quais céus (só os que vemos) → adjetiva restritiva.',
          'A/C/E: trocam a ordem ou o tipo de pelo menos uma das três orações — não seguem o padrão consecutiva → explicativa → restritiva.',
          'B: erra a primeira, classificando-a como adjetiva restritiva em vez de consecutiva.',
          'Gabarito D — adverbial consecutiva, adjetiva explicativa, adjetiva restritiva.',
        ],
        footer_rule: 'Siga a ordem dos três «que» no texto.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Três testes para três «que»',
        meta: slideMeta,
        content: 'CONSECUTIVA → EXPLICATIVA → RESTRITIVA',
        rows: [
          { label: 'Tanto/tanta…que', value: 'Sempre consecutiva — marca consequência da intensidade/quantidade.' },
          { label: 'Vírgula antes do «que»', value: 'Adjetiva explicativa — só acrescenta informação.' },
          { label: 'Sem vírgula antes do «que»', value: 'Adjetiva restritiva — delimita o substantivo.' },
          { label: 'Ordem da questão', value: 'Siga a ordem de aparição dos «que» no texto.' },
          { label: 'Nesta questão', value: 'consecutiva → explicativa → restritiva (D)' },
        ],
        footer_rule: 'Classifique cada «que» na ordem em que aparece.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar a função de um dos três «que»',
        items: [
          {
            label: 'A/E — trocar por substantivas',
            detail: 'Pensar que «que é desviada» e «que vemos» completam um verbo.',
            correct: 'Não há verbo pedindo complemento nessas posições — a 1ª é consecutiva, a 3ª é adjetiva restritiva.',
          },
          {
            label: 'B — classificar a 1ª como adjetiva',
            detail: '«Que é desviada» parece qualificar «intensidade».',
            correct: '«Tanta intensidade que» é correlação de consequência — sempre adverbial consecutiva, não adjetiva.',
          },
          {
            label: 'C — inverter a 1ª posição',
            detail: 'Trocar consecutiva por objetiva direta na 1ª oração.',
            correct: 'Não há verbo transitivo direto pedindo a 1ª oração como complemento — é consecutiva.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem usar «tão…que» no lugar de «tanta…que».',
            correct: 'Mesmo trilho: tão/tanta + substantivo + que = consecutiva.',
          },
        ],
        footer_rule: 'D: consecutiva, adjetiva explicativa, adjetiva restritiva.',
      },
    ],
  },

  'apice-ap-ei-oracoes-fonte-acesso-em-06-mar-2026-no-trech-4037436': {
    family: 'conceito',
    source_tec_id: '4037436',
    source_note:
      'Definição de «meme» — aposto explicativo + adjetiva explicativa — ÁPICE AP EI (Pref SJ Cordeiros) 2026 tec 4037436',
    meta: {
      banca: 'ÁPICE',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref SJ Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «Elemento cultural, geralmente comportamental, que é passado de um indivíduo para outro por meio da imitação ou por outras razões não genéticas», analise a organização sintática da estrutura e assinale a alternativa correta.',
    options: [
      {
        id: 'A',
        text:
          'A expressão «geralmente comportamental» exerce função de aposto explicativo, enquanto «que é passado de um indivíduo para outro...» corresponde a uma oração subordinada adjetiva explicativa.',
        is_correct: true,
      },
      {
        id: 'B',
        text:
          'A expressão «geralmente comportamental» funciona como adjunto adverbial de modo, e «que é passado de um indivíduo para outro...» constitui uma oração subordinada substantiva completiva nominal.',
        is_correct: false,
      },
      {
        id: 'C',
        text:
          'A expressão «geralmente comportamental» exerce função de predicativo do sujeito, enquanto «que é passado de um indivíduo para outro...» corresponde a uma oração subordinada adverbial causal.',
        is_correct: false,
      },
      {
        id: 'D',
        text:
          'A expressão «geralmente comportamental» funciona como adjunto adnominal restritivo, e «que é passado de um indivíduo para outro...» constitui uma oração subordinada adjetiva restritiva.',
        is_correct: false,
      },
      {
        id: 'E',
        text:
          'A expressão «geralmente comportamental» exerce função de vocativo, enquanto «que é passado de um indivíduo para outro...» corresponde a uma oração subordinada adjetiva restritiva.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Definição de «meme»',
        chip_label: 'Vírgulas isolam',
        meta: slideMeta,
        items: [
          {
            label: '1. Aposto explicativo',
            detail: '«Geralmente comportamental» vem isolado por vírgulas, explicando «elemento cultural».',
            icon: 'GitBranch',
          },
          {
            label: '2. Vírgula = pista',
            detail: 'Sem vírgula seria restritivo; com vírgula, é aposto/explicativa.',
            icon: 'HelpCircle',
          },
          {
            label: '3. Oração adjetiva explicativa',
            detail: '«Que é passado…» também vem isolada por vírgula, acrescenta informação sobre «elemento cultural».',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: '«Geralmente comportamental» parece advérbio + adjetivo, mas sua função é aposto — não modifica verbo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vírgulas isolando = aposto + adjetiva explicativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Definição de meme → cargo',
        meta: slideMeta,
        steps: [
          'Definição de «meme» (dicio.com.br): «Elemento cultural, geralmente comportamental, que é passado de um indivíduo para outro por imitação».',
          'B: «geralmente comportamental» não modifica verbo — é aposto de «elemento cultural», não adjunto adverbial.',
          'C: não há verbo de ligação exigindo predicativo nessa posição; a expressão isolada por vírgulas explica o substantivo.',
          'D/E: «que é passado…» vem isolada por vírgula (explicativa), não delimita restritivamente; também não há vocativo no trecho.',
          '«Geralmente comportamental» isolado por vírgulas = aposto explicativo de «elemento cultural».',
          '«Que é passado de um indivíduo para outro…» isolado por vírgula = oração subordinada adjetiva explicativa.',
          'Gabarito A.',
        ],
        footer_rule: 'Vírgulas isolando um trecho apontam explicação, não restrição.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Aposto + adjetiva explicativa',
        meta: slideMeta,
        content: 'VÍRGULAS ISOLAM O TRECHO',
        rows: [
          { label: 'Aposto explicativo', value: 'Expressão isolada por vírgulas que explica/detalha um substantivo.' },
          { label: 'Adjetiva explicativa', value: 'Oração isolada por vírgula que acrescenta informação sobre o antecedente.' },
          { label: 'Sinal comum', value: 'Vírgulas isolando o trecho — nunca restringem o sentido.' },
          { label: '≠ Restritiva/adjunto adnominal', value: 'Viriam sem vírgula, delimitando o substantivo.' },
          { label: 'Nesta questão', value: 'aposto + adjetiva explicativa (A)' },
        ],
        footer_rule: 'Definições de dicionário costumam usar aposto + explicativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar explicação por restrição, causa ou vocativo',
        items: [
          {
            label: 'B — adjunto adverbial + completiva nominal',
            detail: '«Comportamental» parece indicar modo de agir.',
            correct: 'Não há verbo sendo modificado; é aposto do substantivo «elemento», não adjunto adverbial.',
          },
          {
            label: 'D — adjunto adnominal restritivo + adjetiva restritiva',
            detail: 'Ignorar as vírgulas isolando os dois trechos.',
            correct: 'As vírgulas marcam explicação, não restrição — por isso é aposto e adjetiva explicativa.',
          },
          {
            label: 'C — predicativo do sujeito + causal',
            detail: 'Buscar um verbo de ligação que não está na definição.',
            correct: 'Não há verbo de ligação regendo essa posição; «que é passado» não indica causa, só explica.',
          },
          {
            label: 'E — vocativo + restritiva',
            detail: 'Confundir aposto com chamamento (vocativo).',
            correct: 'Não há chamamento de alguém no trecho; é aposto explicativo, sem valor de vocativo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem definir outra palavra do dicionário com a mesma estrutura de vírgulas.',
            correct: 'Mesmo trilho: vírgulas isolando = aposto + adjetiva explicativa.',
          },
        ],
        footer_rule: 'A: aposto explicativo + oração subordinada adjetiva explicativa.',
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
