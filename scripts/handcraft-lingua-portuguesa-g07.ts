#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g07 (8 slugs · Colocação pronominal · lote 1).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g07.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g07 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g07 --strict
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_COLOCACAO_PRONOMINAL } from '@/lib/guidelines/linguaPortuguesa/colocacaoPronominal';

const LOTE = 'lingua-portuguesa-g07';
const SUBTOPICO = 'Pronomes e colocação pronominal';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_pronomes_colocacao';
const REVIEWED = '2026-07-19';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-colocacao-trilho.json';

const PT_COLOCACAO_SOURCE = {
  id: PT_COLOCACAO_PRONOMINAL.id,
  tier: 'A' as const,
  issuer: PT_COLOCACAO_PRONOMINAL.issuer,
  title: PT_COLOCACAO_PRONOMINAL.title,
  year: PT_COLOCACAO_PRONOMINAL.year,
  url: PT_COLOCACAO_PRONOMINAL.url,
  covers: ['próclise', 'ênclise', 'mesóclise', 'atrativos', 'infinitivo', 'particípio', 'imperativo'],
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
      reviewer: 'handcraft:lingua-portuguesa-g07',
      guideline_snapshot: `${PT_COLOCACAO_PRONOMINAL.snapshot} · âncora trilho → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      PT_COLOCACAO_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'âncora trilho'],
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

function loadAnchorSlides(): unknown[] {
  const anchorPath = resolve(process.cwd(), GOLDEN_REFERENCE);
  const anchor = JSON.parse(readFileSync(anchorPath, 'utf8')) as {
    reverse_study_slides: unknown[];
  };
  return anchor.reverse_study_slides;
}

const SPECS: Record<string, Spec> = {
  'avancasp-estiva-gerbi-colocacao-faca-favor-3835994': {
    family: 'conceito',
    source_tec_id: '3835994',
    source_note: 'Colocação imperativo — AVANÇASP TEnf Estiva Gerbi 2026 tec 3835994',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Tec Enf (Pref Estiva Gerbi)',
      orgao: 'Pref. Estiva Gerbi',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '“Me faz um favor, Carlos. Quero que você me acorde assim que sair de casa pela manhã.” No enunciado acima, substituindo a expressão destacada por uma forma de acordo com a norma-padrão da Língua Portuguesa, fica correta a seguinte alternativa:',
    options: [
      { id: 'A', text: 'Me faça um favor', is_correct: false },
      { id: 'B', text: 'Faze-me um favor', is_correct: false },
      { id: 'C', text: 'Faça-me um favor', is_correct: true },
      { id: 'D', text: 'Me faze um favor', is_correct: false },
      { id: 'E', text: 'Faz-me um favor', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Imperativo no trilho',
        chip_label: 'Trilho simples',
        meta: slideMeta,
        items: [
          { label: 'Pergunte: atrativo?', detail: 'No imperativo afirmativo, sem atrativo → ênclise.', icon: 'Filter' },
          { label: 'Erro clássico', detail: '«Me faça» no início — próclise sem palavra atrativa.', icon: 'AlertTriangle' },
          { label: 'Estação certa', detail: 'Faça-me um favor — verbo + átono colado.', icon: 'ArrowRight' },
          { label: 'Subordinada', detail: '«me acorde» na outra frase: sem atrativo → acorde-me.', icon: 'GitBranch' },
        ],
        footer_rule: 'Imperativo afirmativo sem atrativo = ênclise.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Corte letra a letra',
        meta: slideMeta,
        steps: [
          'Comando: corrigir «Me faz um favor» — imperativo afirmativo.',
          'A/D: «Me faça / Me faze» — próclise no início sem atrativo → fora.',
          'B: «Faze-me» — forma verbal inadequada à norma culta.',
          'E: «Faz-me» — variante informal; banca prefere «Faça-me».',
          'C: «Faça-me um favor» — ênclise no imperativo → estação certa.',
          'Gabarito C.',
          'Em similares: não comece imperativo com me/te/se sem atrativo.',
        ],
        footer_rule: 'Faça-me = ênclise no imperativo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Trilho de bolso',
        meta: slideMeta,
        content: 'IMPERATIVO AFIRMATIVO',
        rows: [
          { label: 'Sem atrativo', value: 'ênclise: diga-me / faça-me' },
          { label: 'Com negação', value: 'próclise: não me diga' },
          { label: 'Pegadinha', value: '«Me diga» no início = erro de prova' },
          { label: 'Nesta questão', value: 'Faça-me um favor' },
        ],
        footer_rule: 'Imperativo + sem atrativo = ênclise.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o aluno cai',
        meta: slideMeta,
        content: 'Próclise no imperativo sem atrativo',
        items: [
          { label: 'A — Me faça', detail: 'Parece natural na fala.', correct: 'Norma culta: Faça-me — ênclise no imperativo.' },
          { label: 'D — Me faze', detail: 'Mistura próclise + forma errada.', correct: 'Duplo erro: posição e flexão.' },
          { label: 'B — Faze-me', detail: 'Archaísmo ou registro informal.', correct: 'Prefira Faça-me na prova.' },
          { label: 'E — Faz-me', detail: 'Pode soar aceitável, mas não é a letra da banca.', correct: 'Gabarito C: Faça-me um favor.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Diga-me» ou «Entregue-me».', correct: 'Mesmo trilho: imperativo afirmativo → ênclise.' },
        ],
        footer_rule: 'C passa: Faça-me um favor.',
      },
    ],
  },

  'avancasp-potim-colocacao-apresentar-lhe-3839370': {
    family: 'conceito',
    source_tec_id: '3839370',
    source_note: 'Colocação correta — AVANÇASP ACS Potim 2026 tec 3839370',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa que apresenta uma frase correta em relação à colocação do pronome junto ao verbo.',
    options: [
      { id: 'A', text: 'Jamais julgaria-te pelas ações que você não praticou.', is_correct: false },
      { id: 'B', text: 'Quero apresentar-lhe uma situação totalmente inovadora.', is_correct: true },
      { id: 'C', text: 'Nos dê uma ajuda em nossas tarefas, por favor.', is_correct: false },
      { id: 'D', text: 'Peço que faça-me um grande favor quando chegar ao escritório.', is_correct: false },
      { id: 'E', text: 'Eu nunca convidei-o para uma festa em minha casa.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Uma frase certa no trilho',
        meta: slideMeta,
        items: [
          { label: 'Jamais / nunca', detail: 'Atrativos → próclise: Jamais te julgaria.', icon: 'Ban' },
          { label: 'Infinitivo', detail: 'Sem atrativo antes do verbo → apresentar-lhe.', icon: 'ArrowRight' },
          { label: 'Imperativo início', detail: 'Dê-nos, não «Nos dê» no começo.', icon: 'Flag' },
          { label: 'Que + verbo', detail: 'Conjunção atrai: que me faça, não faça-me.', icon: 'Link' },
        ],
        footer_rule: 'Cada frase = teste de atrativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: só uma frase inteira está no trilho certo.',
          'A: «Jamais julgaria-te» — Jamais atrai → Jamais te julgaria.',
          'C: «Nos dê» no início — imperativo pede Dê-nos.',
          'D: «que faça-me» — que atrai → que me faça.',
          'E: «nunca convidei-o» — nunca atrai → nunca o convidei.',
          'B: «apresentar-lhe» — infinitivo sem atrativo → ênclise ok.',
          'Gabarito B — única frase inteira conforme.',
        ],
        footer_rule: 'B = única frase totalmente conforme.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ATRATIVO? → PRÓ',
        rows: [
          { label: 'Jamais / nunca', value: 'próclise obrigatória' },
          { label: 'Que / quem', value: 'próclise na oração subordinada' },
          { label: 'Infinitivo limpo', value: 'apresentar-lhe / fazer-me' },
          { label: 'Nesta questão', value: 'B — apresentar-lhe' },
        ],
        footer_rule: 'Sem atrativo no infinitivo = ênclise.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra em um ponto do trilho',
        items: [
          { label: 'A — Jamais + ênclise', detail: '«julgaria-te» ignora o atrativo.', correct: 'Jamais te julgaria — próclise.' },
          { label: 'C — Nos dê', detail: 'Imperativo no início da frase.', correct: 'Dê-nos uma ajuda — ênclise.' },
          { label: 'D — que faça-me', detail: 'Conjunção integrante atrai o átono.', correct: 'Peço que me faça um favor.' },
          { label: 'E — nunca convidei-o', detail: 'Advérbio de negação atrai.', correct: 'Eu nunca o convidei.' },
          { label: 'Em outra banca…', detail: 'Trocam verbos, mantêm atrativos.', correct: 'Sempre pergunte: há atrativo antes do verbo?' },
        ],
        footer_rule: 'B passa: Quero apresentar-lhe.',
      },
    ],
  },

  'aocp-unirio-colocacao-multitarefa-3841117': {
    family: 'text_fragment',
    source_tec_id: '3841117',
    source_note: 'Colocação reescrita — AOCP UNIRIO 2026 multitarefa tec 3841117',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
    },
    instruction:
      'Tendo em vista as regras de colocação pronominal da língua portuguesa, assinale a alternativa em que a reescrita proposta se mantém condizente com a norma-padrão.',
    text_fragment:
      '<p><strong>Entenda por que ser multitarefa é um mito que faz mal ao cérebro</strong></p><p>Participar de uma reunião, checar mensagens e adiantar um relatório ao mesmo tempo parece produtivo — mas o cérebro não foi feito para alternar tarefas sem custo. Pesquisas mostram que <strong>o multitasking nos impede</strong> de executar ações no piloto automático, <strong>o que nos poupa</strong> recursos mentais, e que é preciso estar presente <strong>para que as experiências se fixem</strong>.</p><p>Ao mudar de atividade, o cérebro precisa <strong>se reajustar</strong>. Para checar e-mails e mensagens <strong>que costumam nos distrair</strong>, especialistas recomendam horários dedicados.</p><p><em>Folha de S.Paulo, nov. 2025 — adaptado</em></p>',
    options: [
      {
        id: 'A',
        text: '“O multitasking também nos impede de executar algumas ações [...]”. Reescrita: O multitasking também impede-nos de executar algumas ações [...].',
        is_correct: false,
      },
      {
        id: 'B',
        text: '“[...] o que nos poupa alguns recursos mentais.”. Reescrita: [...] o que poupa-nos alguns recursos mentais.',
        is_correct: false,
      },
      {
        id: 'C',
        text: '“[...] já que é preciso estar presente para que as experiências se fixem.”. Reescrita: [...] já que é preciso estar presente para que as experiências fixem-se.',
        is_correct: false,
      },
      {
        id: 'D',
        text: '“[...] para checar emails, mensagens e outras atividades que costumam nos distrair.”. Reescrita: [...] para checar emails, mensagens e outras atividades que nos costumam distrair.',
        is_correct: true,
      },
      {
        id: 'E',
        text: '“[...] ao mudar de atividade, o cérebro precisa se reajustar [...]” Reescrita: [...] ao mudar de atividade, o cérebro precisa reajustar-se-ar [...].',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reescrita no texto',
        meta: slideMeta,
        items: [
          { label: 'Multitarefa / cérebro', detail: 'Texto Folha: multitarefa faz mal ao cérebro — reunião e mensagens.', icon: 'Brain' },
          { label: 'Piloto automático', detail: 'Multitasking nos impede de executar ações no piloto automático.', icon: 'Zap' },
          { label: 'Ênclise ok', detail: 'impede-nos / poupa-nos — sem atrativo direto.', icon: 'Check' },
          { label: 'Que atrai', detail: 'que nos costumam distrair — próclise com e-mails.', icon: 'ArrowLeft' },
          { label: 'Pegadinha E', detail: 'reajustar-se-ar — forma inexistente.', icon: 'X' },
        ],
        footer_rule: 'Relativo «que» = atrativo → próclise.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: multitarefa, piloto automático, distrações com e-mail.',
          'A/B: impede-nos e poupa-nos — ênclises aceitáveis; não são o gabarito da banca.',
          'C: fixem-se — ênclise reflexiva possível; banca marca D.',
          'D: «que nos costumam distrair» — que atrai o pronome antes do verbo.',
          'E: «reajustar-se-ar» — invento gráfico; elimina de cara.',
          'Gabarito D — única reescrita exigida pela norma da questão.',
        ],
        footer_rule: 'D = que nos costumam distrair.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUE / QUEM ATRAI',
        rows: [
          { label: 'Relativo', value: 'que nos distraem — próclise' },
          { label: 'Sem atrativo', value: 'impede-nos — ênclise possível' },
          { label: 'Reflexivo', value: 'fixar-se / fixem-se no infinitivo' },
          { label: 'Nesta questão', value: 'D — que nos costumam distrair' },
        ],
        footer_rule: 'Pronome relativo puxa o átono.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Reescritas plausíveis que a banca barra',
        items: [
          { label: 'A — impede-nos', detail: 'Ênclise gramatical, mas não é a letra certa.', correct: 'Banca privilegia D; A não é gabarito.' },
          { label: 'B — poupa-nos', detail: 'Mesma lógica de A.', correct: 'Ênclise ok, porém não é a resposta.' },
          { label: 'C — fixem-se', detail: 'Reflexivo enclítico aceitável.', correct: 'Gabarito oficial: D com «que».' },
          { label: 'E — se-ar', detail: 'Forma híbrida absurda.', correct: 'Elimine grafias impossíveis primeiro.' },
          { label: 'Em outra banca…', detail: 'Trocam «distrair» por «cansar».', correct: 'Mantenha a regra: que → próclise.' },
        ],
        footer_rule: 'D passa no trilho do relativo.',
      },
    ],
  },

  'avancasp-nova-odessa-colocacao-ce-3962471': {
    family: 'certo_errado',
    source_tec_id: '3962471',
    source_note: 'Colocação C/E sequência — AVANÇASP Nova Odessa 2026 tec 3962471',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AFar (Pref Nova Odessa)',
      orgao: 'Pref. Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale C ou E em cada frase abaixo conforme esteja respectivamente certa ou errada quanto à colocação do pronome destacado em relação ao verbo. A seguir, assinale a sequência correta obtida.\n\nI - Me dê uma ajuda, por favor.\nII - Quero que avise-me quando estiver pronto.\nIII - Eu jamais pedir-lhe-ia algum sacrifício.',
    options: [
      { id: 'A', text: 'C – C – C', is_correct: false },
      { id: 'B', text: 'E – E – C', is_correct: false },
      { id: 'C', text: 'E – C – E', is_correct: false },
      { id: 'D', text: 'C – E – E', is_correct: false },
      { id: 'E', text: 'E – E – E', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três frases, três testes',
        meta: slideMeta,
        items: [
          { label: 'I — Me dê', detail: 'Imperativo início → Dê-me (E).', icon: 'Flag' },
          { label: 'II — que avise-me', detail: 'Que atrai → que me avise (E).', icon: 'Link' },
          { label: 'III — pedir-lhe-ia', detail: 'Jamais atrai → jamais lhe pediria (E).', icon: 'Ban' },
          { label: 'Sequência', detail: 'Três erros → E – E – E.', icon: 'ListOrdered' },
        ],
        footer_rule: 'C/E: julgue cada frase no trilho.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: marcar C/E em cada colocação destacada.',
          'I: «Me dê» — próclise no imperativo inicial → ERRADA (E).',
          'II: «avise-me» após que — conjunção atrai → «me avise» (E).',
          'III: «pedir-lhe-ia» com jamais — atrativo barra mesóclise (E).',
          'Sequência: E – E – E — três frases erradas.',
          'Gabarito E.',
          'Em similares: não assuma que uma frase certa salva o item.',
        ],
        footer_rule: 'E – E – E = todas erradas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'C/E NO TRILHO',
        rows: [
          { label: 'I imperativo', value: 'Dê-me — não «Me dê»' },
          { label: 'II que', value: 'que me avise' },
          { label: 'III jamais', value: 'jamais lhe pediria — próclise' },
          { label: 'Sequência', value: 'E – E – E' },
        ],
        footer_rule: 'Três estações erradas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sequências que parecem lógicas',
        items: [
          { label: 'A — C-C-C', detail: 'Aceita as três como certas.', correct: 'Nenhuma frase está totalmente conforme.' },
          { label: 'B — E-E-C', detail: 'Acha III correta por mesóclise «culta».', correct: 'Jamais exige próclise, não mesóclise.' },
          { label: 'D — C-E-E', detail: 'Salva I como correta.', correct: 'I também é E: Dê-me uma ajuda.' },
          { label: 'C — E-C-E', detail: 'Considera II correta.', correct: 'II: que me avise quando estiver pronto.' },
          { label: 'Em outra banca…', detail: 'Podem usar só duas frases.', correct: 'Mesmo trilho: imperativo, que, jamais.' },
        ],
        footer_rule: 'E passa: todas erradas.',
      },
    ],
  },

  'vunesp-sorocaba-colocacao-charles-tira-3999721': {
    family: 'conceito',
    source_tec_id: '3999721',
    source_note: 'Colocação tira Charles — VUNESP TEnf Sorocaba 2026 tec 3999721',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Sorocaba)',
      orgao: 'Pref. Sorocaba',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira a seguir para responder à questão.\n\n(M. Schulz, “Minduim Charles”, 06.03.2026. Disponível em: https://cultura.estadao.com.br/quadrinhos)\n\nEm conformidade com a norma-padrão, a frase do último quadrinho admite a seguinte reescrita:',
    options: [
      { id: 'A', text: 'Você não disse que eu teria que soletrá-las certo!', is_correct: true },
      { id: 'B', text: 'Você não disse que eu teria que soletrar elas certas!', is_correct: false },
      { id: 'C', text: 'Você não disse que eu teria que soletrar-lhes certas!', is_correct: false },
      { id: 'D', text: 'Você não disse que eu teria que soletrar elas certo!', is_correct: false },
      { id: 'E', text: 'Você não disse que eu teria que soletrar-lhes certo!', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infinitivo + ló',
        meta: slideMeta,
        items: [
          { label: 'Tira Charles', detail: 'Minduim Charles — último quadrinho pede reescrita.', icon: 'Image' },
          { label: 'Infinitivo', detail: 'ter que soletrar — átono enclisa no infinitivo.', icon: 'ArrowRight' },
          { label: 'elas → las', detail: 'Após R: soletrá-las (não «elas» solto).', icon: 'Replace' },
          { label: 'Negação longe', detail: '«Você não disse» não atrai o infinitivo distante.', icon: 'Minus' },
          { label: 'lhes × las', detail: 'Objeto = palavras (elas), não pessoas.', icon: 'Users' },
        ],
        footer_rule: 'Infinitivo: ênclise + forma -lo/-la.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Minduim Charles — último quadrinho: reescrita da frase do personagem.',
          'Contexto: personagem reclama de soletrar palavras (norma-padrão).',
          'B/D: pronome tônico «elas» solto — não é colocação padrão no infinitivo.',
          'C/E: «lhes» — objeto indireto; frase pede «las» (OD).',
          'A: «soletrá-las» — ênclise no infinitivo + forma correta.',
          'Gabarito A — conformidade com a norma-padrão da tira.',
          'Em similares: verbo termina em R → -las, -los.',
        ],
        footer_rule: 'A = soletrá-las.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INFINITIVO + ÁTONO',
        rows: [
          { label: 'Posição', value: 'ênclise: soletrá-las' },
          { label: 'Forma', value: 'verbo em -r + las (elas)' },
          { label: 'Evite', value: 'soletrar elas / soletrar-lhes' },
          { label: 'Nesta questão', value: 'A — soletrá-las certo' },
        ],
        footer_rule: 'Infinitivo sem atrativo imediato → ênclise.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pronome tônico e lhes',
        items: [
          { label: 'B — soletrar elas', detail: 'Pronome solto após infinitivo.', correct: 'Norma: soletrá-las.' },
          { label: 'C — soletrar-lhes', detail: 'Troca OD por OI.', correct: 'Objeto são «elas» (palavras).' },
          { label: 'D — elas + certo', detail: 'Concordância e colocação erradas.', correct: 'Ênclise las + advérbio certo.' },
          { label: 'E — lhes certo', detail: 'Mesmo erro de regência de C.', correct: 'las, não lhes.' },
          { label: 'Em outra banca…', detail: 'Trocam «soletrar» por «ler».', correct: 'Mesma regra: ler-las / lê-las.' },
        ],
        footer_rule: 'A passa: soletrá-las.',
      },
    ],
  },

  'vunesp-sorocaba-colocacao-alcool-reescrita-3999766': {
    family: 'conceito',
    source_tec_id: '3999766',
    source_note: 'Colocação reescrita álcool — VUNESP TEnf Sorocaba 2026 tec 3999766 · âncora trilho',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Sorocaba)',
      orgao: 'Pref. Sorocaba',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que a reescrita de informações do texto está em conformidade com a norma-padrão de colocação pronominal.',
    options: [
      {
        id: 'A',
        text: 'O tempo passa e os danos do perigoso hábito começam a manifestar-se na vida adulta.',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'Já bebia-se muito cedo, na adolescência, sem qualquer problematização ou julgamento dos pais e demais responsáveis.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Quando fala-se no combate ao consumo abusivo de álcool, o depoimento das pessoas é fundamental.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Se exigem, portanto, estratégias atualizadas e eficazes para vencer esses e outros obstáculos.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A geração formada por pessoas nascidas a partir de 1997 tem dedicado-se a novos rumos para o lazer e para as celebrações.',
        is_correct: false,
      },
    ],
    slides: loadAnchorSlides(),
  },

  'cpcon-itabaiana-colocacao-se-proclise-4014453': {
    family: 'text_fragment',
    source_tec_id: '4014453',
    source_note: 'Colocação se impessoal — CPCON UEPB Itabaiana 2026 tec 4014453',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Itabaiana)',
      orgao: 'Pref. Itabaiana',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia os seguintes fragmentos do Texto 01.\n\nI - “Por isso, não se tem aquele azul forte e bonito que vemos aqui”.\nII - “O oxigênio começou a se acumular em níveis relevantes na atmosfera”.\n\nNo tocante à colocação pronominal do se, é CORRETO afirmar que:',
    text_fragment:
      '<p><strong>Não foi sempre azul: como a cor do céu mudou no planeta Terra</strong></p><p>Cientistas explicam que a luz azul dispersa mais na atmosfera. Em Júpiter, <strong>não se tem</strong> aquele azul intenso visto na Terra. Há cerca de 2,4 bilhões de anos, cianobactérias passaram a fazer fotossíntese e <strong>o oxigênio começou a se acumular</strong> na atmosfera, mudando a cor do céu.</p><p><em>BBC News Brasil, 2026 — adaptado</em></p>',
    options: [
      {
        id: 'A',
        text: 'nos dois fragmentos, é possível observar o uso da próclise, sem possibilidade de ênclise.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'nos dois fragmentos, é possível observar o uso da ênclise, com possibilidade de próclise no primeiro fragmento e sem possibilidade de próclise no segundo fragmento.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'nos dois fragmentos, é possível observar o uso da ênclise, com possibilidade de próclise.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'nos dois fragmentos, é possível observar o uso da próclise, com possibilidade de ênclise.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'nos dois fragmentos, é possível observar o uso da próclise, sem possibilidade de ênclise no primeiro fragmento e com possibilidade de ênclise no segundo fragmento.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Se impessoal no trilho',
        meta: slideMeta,
        items: [
          { label: 'I — não se tem', detail: 'Não atrai → próclise do se impessoal.', icon: 'ArrowLeft' },
          { label: 'Sem ênclise em I', detail: 'Não se admite «tem-se» após não aqui.', icon: 'Ban' },
          { label: 'II — a se acumular', detail: 'Infinitivo — pode acumular-se.', icon: 'ArrowRight' },
          { label: 'Próclise em II', detail: 'Começou a se acumular também vale.', icon: 'Check' },
        ],
        footer_rule: 'Se impessoal: negativa → próclise.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: cor do céu, Júpiter, oxigênio na atmosfera.',
          'I: «não se tem» — negação + se impessoal → próclise fixa.',
          'I: ênclise «tem-se» não cabe após «não» neste caso.',
          'II: «começou a se acumular» — próclise no infinitivo.',
          'II: alternativa «acumular-se» seria possível (ênclise).',
          'Só E descreve: próclise nos dois; ênclise só possível no II.',
          'Gabarito E.',
        ],
        footer_rule: 'E = próclise + possibilidade de ênclise só no II.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SE IMPESSOAL',
        rows: [
          { label: 'Com não', value: 'não se tem — próclise' },
          { label: 'Fragmento I', value: 'sem ênclise possível' },
          { label: 'Infinitivo II', value: 'a se acumular / acumular-se' },
          { label: 'Nesta questão', value: 'E' },
        ],
        footer_rule: 'Negativa barra ênclise do se em I.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Alternativas que generalizam demais',
        items: [
          { label: 'A — só próclise sempre', detail: 'Ignora ênclise possível no II.', correct: 'II admite acumular-se.' },
          { label: 'B — ênclise nos dois', detail: 'Contradiz «não se tem».', correct: 'I é próclise obrigatória.' },
          { label: 'C — ênclise dominante', detail: 'Mesmo problema de B.', correct: 'I não enclisa.' },
          { label: 'D — próclise + ênclise livre', detail: 'Diz que I poderia enclisar.', correct: 'I: sem possibilidade de ênclise.' },
          { label: 'Em outra banca…', detail: 'Trocam «acumular» por «fixar».', correct: 'Mesmo par: não se + infinitivo.' },
        ],
        footer_rule: 'E passa no teste do se.',
      },
    ],
  },

  'vunesp-presidente-prudente-colocacao-feira-3336128': {
    family: 'text_fragment',
    source_tec_id: '3336128',
    source_note: 'Colocação feira literária — VUNESP Age Pres. Prudente 2025 tec 3336128',
    meta: {
      banca: 'VUNESP',
      prova: 'Age (Pref Pres Prudente)',
      orgao: 'Pref. Pres. Prudente',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'A colocação pronominal está de acordo com a norma-padrão em:',
    text_fragment:
      '<p><strong>Estratégias de sobrevivência</strong> (Kalaf Epalanga — adaptado)</p><p>Hoje bateu saudade de visitar uma feira literária, conversar com leitores, assinar livros e, num abraço, <strong>agradecer-lhes</strong> por manterem viva a literatura. Vestia a camisa favorita e corria para a estação, <strong>cruzando-me</strong> com madrugadores. Na biblioteca da escola, alunos aguardavam a apresentação.</p>',
    options: [
      {
        id: 'A',
        text: 'Agora peguei-me com uma saudade danada de visitar uma feira literária, conversar com leitores, assinar-lhes os livros, tirar a selfie de praxe.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Se observava, na biblioteca da escola, duas dezenas de alunos que aguardavam-me pacientemente para a apresentação.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Vestia-me com a camisa e gravata favoritas e corria para a estação de comboio, sempre encontrando-me com outros madrugadores.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Outros madrugadores como eu integraram-se ao leque de personagens, os quais me acompanharam da Flip em Paraty ao Africa Writes em Londres.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Agradaria-me visitar escolas do ensino secundário no Portugal mais remoto, o que, tendo mudado-me para Berlim, deixei de fazer.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reflexivo e integrar-se',
        meta: slideMeta,
        items: [
          { label: 'Estratégias / sobrevivência', detail: 'Texto Kalaf: saudade de feira literária e conversar com leitores.', icon: 'BookOpen' },
          { label: 'Agradecer-lhes', detail: 'Num abraço, agradecer-lhes por manterem viva a literatura.', icon: 'Heart' },
          { label: 'Que atrai', detail: 'aguardavam-me após que → me aguardavam na biblioteca.', icon: 'ArrowLeft' },
          { label: 'Berlim / Portugal', detail: 'Contexto: mudou para Berlim; escolas em Portugal remoto.', icon: 'MapPin' },
          { label: 'integraram-se', detail: 'Ênclise reflexiva: integraram-se ao leque de personagens.', icon: 'Check' },
        ],
        footer_rule: 'Relativo + objeto: próclise.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: feira literária, Berlim, escolas em Portugal.',
          'A: «peguei-me» — construção questionável para a banca.',
          'B: «que aguardavam-me» — que atrai → que me aguardavam.',
          'C: «Vestia-me» — banca não aceita como modelo.',
          'D: «integraram-se» — ênclise reflexiva correta.',
          'E: «Agradaria-me» / «mudado-me» — colocações reprovadas.',
          'Gabarito D.',
        ],
        footer_rule: 'D = integraram-se.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REFLEXO + RELATIVO',
        rows: [
          { label: 'integrar-se', value: 'integraram-se ao leque' },
          { label: 'Que', value: 'que me aguardavam — não aguardavam-me' },
          { label: 'Evite', value: 'peguei-me / agradaria-me (itens)' },
          { label: 'Nesta questão', value: 'D' },
        ],
        footer_rule: 'Ênclise reflexiva em D.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Reflexivos e relativos trocados',
        items: [
          { label: 'A — peguei-me', detail: 'Construção não padrão na resposta.', correct: 'Banca elimina «peguei-me com saudade».' },
          { label: 'B — aguardavam-me', detail: 'Relativo «que» atrai o pronome.', correct: '…alunos que me aguardavam…' },
          { label: 'C — Vestia-me', detail: 'Registro não aceito como gabarito.', correct: 'D é a forma modelo.' },
          { label: 'E — mudado-me', detail: 'Ênclise inadequada no particípio.', correct: 'tendo me mudado / havendo-me mudado.' },
          { label: 'Em outra banca…', detail: 'Texto lusófono com «comboio».', correct: 'Mesmo teste: que → próclise.' },
        ],
        footer_rule: 'D passa: integraram-se.',
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
