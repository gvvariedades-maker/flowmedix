#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g02 (8 slugs · lote 2).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g02.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g02 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g02 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g02';
const SUBTOPICO = 'Sinônimos, antônimos e polissemia';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_sinonimos_polissemia';
const REVIEWED = '2026-07-24';
const GOLDEN_REFERENCE = 'examples/questao-premium-apice-portugues-sinonimos-polissemia-refletiu.json';

const SINONIMOS_SOURCE = {
  id: 'pt-sinonimos-polissemia-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Sinônimos, antônimos e polissemia',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: ['sinonímia', 'polissemia', 'parônimos', 'antonímia', 'pergunta-teste', 'contexto'],
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
  figure_policy?: 'transcribed' | 'required';
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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g02',
      guideline_snapshot: `Elias TE-simples — pergunta «Mesmo sentido na frase?» · lente contexto × dicionário (sinonimosPolissemia.ts) · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      SINONIMOS_SOURCE,
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
  const qd: {
    instruction: string;
    options: Opt[];
    text_fragment?: string;
    figure_policy?: 'transcribed' | 'required';
  } = {
    instruction: spec.instruction,
    options: spec.options,
  };
  if (spec.text_fragment) qd.text_fragment = spec.text_fragment;
  if (spec.figure_policy) qd.figure_policy = spec.figure_policy;
  return {
    meta: metaBase(spec, slug),
    question_data: qd,
    reverse_study_slides: spec.slides,
  };
}

const SPECS: Record<string, Spec> = {
  'instituto-ao-sinonimos-o-texto-a-seguir-refere-se-a-questao-3841144': {
    family: 'text_fragment',
    source_tec_id: '3841144',
    source_note: '«a longo prazo» ≈ «em longo prazo» — Instituto AOCP Ass UNIRIO 2026 tec 3841144',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'O texto a seguir refere-se à questão.\n\nConsiderando o seguinte excerto:\n\n«Mas, a longo prazo, a vida multitarefas, ou multitasking, cobra seu preço. Chegar ao fim do dia com a cabeça a mil e não conseguir dormir é um clássico. Viver com a sensação de cansaço também.»\n\nÉ correto afirmar que:',
    text_fragment:
      'Texto 1 — ENTENDA POR QUE SER MULTITAREFA É UM MITO QUE FAZ MAL AO CÉREBRO (Folha de S.Paulo, nov/2025 — adaptado)\n\nParticipar de uma reunião, checar mensagens e adiantar um relatório ao mesmo tempo. Quem nunca sentiu um certo orgulho por conseguir fazer várias coisas simultaneamente? Mas, a longo prazo, a vida multitarefas, ou multitasking, cobra seu preço. […] Pesquisadores garantem que a mente não foi projetada para lidar com várias tarefas ao mesmo tempo. Earl Miller (MIT) acredita que só podemos ter um ou dois pensamentos de cada vez. […]',
    options: [
      { id: 'A', text: 'a expressão «um clássico» significa o mesmo que «algo de grande valor».', is_correct: false },
      { id: 'B', text: 'a palavra «multitasking» é um antônimo de «multitarefa».', is_correct: false },
      { id: 'C', text: 'o último período não pode ser omitido sem que isso prejudique a sintaxe do excerto.', is_correct: false },
      { id: 'D', text: 'o segundo e o terceiro período fornecem as causas para a vida multitarefas cobrar o seu preço.', is_correct: false },
      { id: 'E', text: 'a expressão «a longo prazo» é sinônima de «em longo prazo».', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Excerto multitarefa',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'A longo prazo', detail: 'No futuro distante — consequência do multitasking.', icon: 'Clock' },
          { label: 'Em longo prazo', detail: 'Mesma locução temporal — preposição equivalente.', icon: 'Calendar' },
          { label: 'Um clássico', detail: 'Situação típica/recorrente — não «de grande valor».', icon: 'Repeat' },
          { label: 'Multitarefa', detail: 'Texto Folha — reunião, mensagens, relatório ao mesmo tempo.', icon: 'Layers' },
          { label: 'Earl Miller', detail: 'Neurocientista MIT — mente não multitarefa.', icon: 'Brain' },
          { label: 'Pesquisadores', detail: 'Estudos sobre custo cerebral do multitasking.', icon: 'Microscope' },
          { label: 'Pergunta-teste', detail: 'Qual afirmativa mantém o sentido do excerto?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Confundir «clássico» com valioso ou multitasking × multitarefa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Prove cada letra no excerto citado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Folha: multitarefa, MIT, Earl Miller, custo cerebral do multitasking.',
          'Excerto: «a longo prazo» + preço cobrado + «um clássico» (insônia/cansaço).',
          'A «um clássico» = grande valor: FALSO — significa situação típica/recorrente.',
          'B multitasking antônimo de multitarefa: FALSO — são equivalentes (empréstimo).',
          'C omitir último período quebra sintaxe: FALSO — período autônomo.',
          'D 2º e 3º períodos = causas do preço: FALSO — são exemplos do custo, não causa lógica.',
          'E «a longo prazo» ≈ «em longo prazo»: VERDADEIRA — sinonímia de locução temporal.',
          'Gabarito E.',
          'Em similares: teste troca «a/em longo prazo» na frase inteira.',
        ],
        footer_rule: 'Só E fecha sinonímia temporal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'A × EM LONGO PRAZO',
        rows: [
          { label: 'A longo prazo', value: 'Locução temporal — no futuro distante.' },
          { label: 'Em longo prazo', value: 'Variante prepositiva equivalente.' },
          { label: 'Um clássico', value: 'Típico, recorrente — não valioso.' },
          { label: 'Nesta questão', value: 'E — sinonímia «a/em longo prazo».' },
        ],
        footer_rule: 'Clássico = exemplo típico, não obra-prima.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra o foco',
        items: [
          { label: 'A — grande valor', detail: '«Clássico» = típico (insônia), não precioso.', correct: 'Sinônimo no contexto: «de grande valor» não substitui «um clássico» no excerto.' },
          { label: 'B — antônimo', detail: 'Multitasking traduz multitarefa.', correct: 'Antônimo: exige oposição — palavras equivalentes, não contrárias.' },
          { label: 'C — sintaxe', detail: 'Último período pode ser omitido sem quebrar o trecho.', correct: 'Sintaxe: omissão possível — afirmativa falsa.' },
          { label: 'D — causas', detail: '2º/3º períodos exemplificam efeitos, não explicam «por que» cobra preço.', correct: 'Sinônimo no contexto: não são causas — são manifestações do custo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A longo prazo, o hábito prejudica a memória.»',
            correct: 'Sinônimo no contexto: «Em longo prazo» mantém o sentido temporal.',
          },
        ],
        footer_rule: 'E: a longo prazo ≈ em longo prazo.',
      },
    ],
  },

  'cpcon-uepb-a-sinonimos-leia-o-texto-i-para-responder-a-ques-3912840': {
    family: 'text_fragment',
    source_tec_id: '3912840',
    source_note: 'VF sinonímia lexical cometa 3I/Atlas — CPCON UEPB ACS Pref Cuité 2026 tec 3912840',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Cuité)',
      orgao: 'Pref. Cuité',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I para responder à questão.\n\nNo Texto I, observe as assertivas sobre o uso de sinônimos.\n\nI — O uso de sinônimos como cometa, objeto celeste e corpo contribui para a coesão lexical, evitando repetições excessivas.\nII — A sinonímia colabora com a compreensão do texto, pois permite retomar ideias já apresentadas de forma variada, sem alterar o sentido principal.\nIII — O emprego de sinônimos prejudica a objetividade de textos de divulgação científica, que deveriam repetir sempre a mesma palavra para não gerar ambiguidades.\nIV — A presença de sinônimos ocorre apenas em textos literários, sendo inadequada em textos jornalísticos e científicos.\n\nÉ CORRETO o que se afirma em:',
    text_fragment:
      'Texto I — Viajante espacial: por que cometa 3I/Atlas continua a intrigar? (R7 Internacional, 06 nov. 2025 — adaptado)\n\nDesde julho, o cometa 3I/Atlas despertou curiosidade entre astrônomos. Detectado no Chile, o corpo celeste destacou-se por características diferentes das de um cometa comum, sugerindo formação em outro sistema estelar. […] Instrumentos detectaram aceleração inesperada; o cometa mudou de cor e aumentou o brilho. Astrônomos estimam que seja bilhões de anos mais antigo que o Sistema Solar. A Nasa garantiu que não representa ameaça à Terra.',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'III e IV, apenas.', is_correct: false },
      { id: 'B', text: 'I e II, apenas.', is_correct: true },
      { id: 'C', text: 'I, apenas.', is_correct: false },
      { id: 'D', text: 'II e IV, apenas.', is_correct: false },
      { id: 'E', text: 'I, II, III e IV.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinônimos no jornalismo',
        chip_label: 'VF + texto',
        meta: slideMeta,
        items: [
          { label: 'Cometa / corpo', detail: 'Retomada lexical — cometa, objeto celeste, corpo.', icon: 'Orbit' },
          { label: 'Coesão', detail: 'Sinônimos evitam repetição sem mudar referente.', icon: 'Link' },
          { label: 'Divulgação', detail: 'Texto jornalístico-científico admite variedade lexical.', icon: 'Newspaper' },
          { label: 'I — verdadeira', detail: 'Sinônimos coesionam e evitam repetição.', icon: 'CheckCircle' },
          { label: 'II — verdadeira', detail: 'Retomada variada sem alterar sentido.', icon: 'CheckCircle' },
          { label: 'III — falsa', detail: 'Sinônimos não prejudicam objetividade aqui.', icon: 'XCircle' },
          { label: 'IV — falsa', detail: 'Jornalismo usa sinônimos normalmente.', icon: 'XCircle' },
        ],
        footer_rule: 'Julgue I–IV antes de combinar letras.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto I: cometa 3I/Atlas, jornalismo científico, retomadas lexicais.',
          'I VERDADEIRA: cometa/objeto celeste/corpo — coesão e anti-repetição.',
          'II VERDADEIRA: sinonímia ajuda compreensão sem mudar sentido.',
          'III FALSA: divulgação científica não exige repetir sempre a mesma palavra.',
          'IV FALSA: sinônimos aparecem em jornalismo, não só em literatura.',
          'Combinação correta: I e II — letra B.',
          'Gabarito B.',
          'Em similares: não generalize «só literatura» ou «sempre repetir».',
        ],
        footer_rule: 'Só B fecha I+II verdadeiras.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VF — SINONÍMIA',
        rows: [
          { label: 'I', value: 'VERDADEIRA — coesão lexical.' },
          { label: 'II', value: 'VERDADEIRA — retomada sem mudar sentido.' },
          { label: 'III', value: 'FALSA — sinônimos não impedem objetividade.' },
          { label: 'IV', value: 'FALSA — jornalismo usa sinônimos.' },
          { label: 'Nesta questão', value: 'B — I e II.' },
        ],
        footer_rule: 'Texto científico-jornalístico admite sinonímia.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Combinações que salvam item falso',
        items: [
          { label: 'A — III e IV', detail: 'Ambas falsas — sinônimos são adequados no texto.', correct: 'Sinônimo no contexto: III e IV negam prática normal do jornalismo científico.' },
          { label: 'C — só I', detail: 'Descarta II verdadeira.', correct: 'Sinônimo no contexto: II também é verdadeira — retomada variada.' },
          { label: 'D — II e IV', detail: 'IV é falsa.', correct: 'Sinônimo no contexto: sinônimos não são exclusivos de literatura.' },
          { label: 'E — todas', detail: 'III e IV são falsas.', correct: 'Sinônimo no contexto: generalização «só literatura» não se sustenta.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O asteroide… o corpo celeste… o visitante interestelar» numa notícia.',
            correct: 'Sinônimo no contexto: coesão lexical — mesma referência, palavras variadas.',
          },
        ],
        footer_rule: 'B: I + II verdadeiras.',
      },
    ],
  },

  'educa-pb-ag-sinonimos-leia-o-texto-a-seguir-e-responda-a-q-3913852': {
    family: 'text_fragment',
    source_tec_id: '3913852',
    source_note: '«descer» (noite) ≈ Cair — Bandeira Consoada — EDUCA PB Ag Adm Pref Cajazeiras 2026 tec 3913852',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref. Cajazeiras',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nReleia o verso: «O meu dia foi bom, pode a noite descer.»\n\nAssinale a opção que apresenta uma substituição correta da palavra destacada sem alterar o sentido do verso:',
    text_fragment:
      '<p><strong>Consoada</strong> — Manuel Bandeira</p><p>Quando a Indesejada das gentes chegar<br/>(Não sei se dura ou caroável),<br/>talvez eu tenha medo.<br/>Talvez sorria, ou diga:<br/>— Alô, iniludível!<br/>O meu dia foi bom, pode a noite <strong>descer</strong>.<br/>(A noite com os seus sortilégios.)<br/>Encontrará lavrado o campo, a casa limpa,<br/>A mesa posta,<br/>Com cada coisa em seu lugar.</p>',
    options: [
      { id: 'A', text: 'Amanhecer.', is_correct: false },
      { id: 'B', text: 'Despontar.', is_correct: false },
      { id: 'C', text: 'Cair.', is_correct: true },
      { id: 'D', text: 'Levantar.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Noite que desce',
        chip_label: 'Polissemia',
        meta: slideMeta,
        items: [
          { label: 'Descer', detail: 'Noite caindo — anoitecer, fim do dia.', icon: 'Moon' },
          { label: 'Polissemia', detail: '«Descer» também = ir de cima a baixo (literal).', icon: 'Layers' },
          { label: 'Consoada', detail: 'Bandeira — espera a morte com casa em ordem.', icon: 'BookOpen' },
          { label: 'Pergunta-teste', detail: 'Qual verbo mantém a noite chegando?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por «amanhecer» (sentido oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Contexto poético fixa «descer» = anoitecer.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Poema Consoada: Indesejada das gentes (morte), casa pronta, noite com sortilégios.',
          '«Pode a noite descer» — convite à chegada da noite (fim do dia).',
          'A «Amanhecer»: início do dia — oposto — eliminar.',
          'B «Despontar»: surgir/aparecer — não encaixa noite caindo — eliminar.',
          'C «Cair»: noite que cai = anoitece — equivalência poética — manter.',
          'D «Levantar»: oposto de descer — eliminar.',
          'Gabarito C.',
          'Em similares: polissemia de «descer» — prove no verso.',
        ],
        footer_rule: 'Descer (noite) ≈ cair.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DESCER × CAIR',
        rows: [
          { label: 'Descer (noite)', value: 'Anoitecer — fim do dia (sentido figurado).' },
          { label: 'Cair', value: 'Sinônimo poético — noite que se abate.' },
          { label: 'Pergunta-teste', value: 'A troca mantém chegada da noite?' },
          { label: 'Nesta questão', value: 'C — Cair.' },
        ],
        footer_rule: 'Amanhecer/levar = sentido invertido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Verbos de luz opostos',
        items: [
          { label: 'A — Amanhecer', detail: 'Início do dia — contrário de noite descendo.', correct: 'Antônimo no contexto: amanhecer inverte a chegada da noite.' },
          { label: 'B — Despontar', detail: 'Surgir/aparecer — não é queda da noite.', correct: 'Sinônimo no contexto: «despontar» não substitui anoitecer no verso.' },
          { label: 'D — Levantar', detail: 'Movimento ascendente.', correct: 'Antônimo no contexto: levantar opõe-se a «descer».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Deixe a cortina descer devagar.»',
            correct: 'Polissemia: sentido literal (movimento vertical) — não é o verso de Bandeira.',
          },
        ],
        footer_rule: 'C: Cair = noite que chega.',
      },
    ],
  },

  'educa-pb-ag-sinonimos-leia-o-texto-a-seguir-e-responda-a-q-3913867': {
    family: 'text_fragment',
    source_tec_id: '3913867',
    source_note: '«iniludível» ≈ Incontornável — Consoada Bandeira — EDUCA PB Ag Adm Pref Cajazeiras 2026 tec 3913867',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref. Cajazeiras',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nLeia o trecho do poema Consoada, de Manuel Bandeira:\n\n«Talvez sorria, ou diga: — Alô, iniludível!»\n\nAssinale o sinônimo adequado para o termo «iniludível»:',
    text_fragment:
      '<p><strong>Consoada</strong> — Manuel Bandeira (trecho)</p><p>Quando a Indesejada das gentes chegar […]<br/>Talvez sorria, ou diga:<br/>— Alô, <strong>iniludível</strong>!<br/>O meu dia foi bom, pode a noite descer.</p>',
    options: [
      { id: 'A', text: 'Enganável.', is_correct: false },
      { id: 'B', text: 'Incontornável.', is_correct: true },
      { id: 'C', text: 'Duvidoso.', is_correct: false },
      { id: 'D', text: 'Incerto.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Morte iniludível',
        chip_label: 'Prefixo in-',
        meta: slideMeta,
        items: [
          { label: 'Iniludível', detail: 'Que não se pode iludir/evitar — certa.', icon: 'Skull' },
          { label: 'Indesejada', detail: 'Eufemismo bandeiriano para a morte.', icon: 'Moon' },
          { label: 'Alô', detail: 'Saudação irônica à morte inevitável.', icon: 'MessageCircle' },
          { label: 'Incontornável', detail: 'Impossível contornar — gabarito B.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Achar que in- = «enganável» (sentido oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'In- nega «iludível» = não se escapa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Consoada: poeta espera a «Indesejada das gentes» (morte).',
          '«Alô, iniludível!» — morte que não se pode fingir que não virá.',
          'A «Enganável»: oposto — quem se deixa enganar — eliminar.',
          'B «Incontornável»: não há como evitar/contornar — manter.',
          'C «Duvidoso» e D «Incerto»: morte é certa no poema — eliminar.',
          'Gabarito B.',
          'Em similares: prefixo in- + iludir = inevitável.',
        ],
        footer_rule: 'Iniludível = inevitável/incontornável.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INILUDÍVEL',
        rows: [
          { label: 'Formação', value: 'in- (negação) + iludível.' },
          { label: 'Sentido', value: 'Que não se pode iludir/evitar.' },
          { label: 'Sinônimo', value: 'Incontornável, inevitável.' },
          { label: 'Nesta questão', value: 'B — Incontornável.' },
        ],
        footer_rule: 'Não confunda com «enganável».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Leituras invertidas do prefixo',
        items: [
          { label: 'A — Enganável', detail: 'Inverte o prefixo in-.', correct: 'Antônimo no contexto: enganável ≠ iniludível (não se ilude a morte).' },
          { label: 'C — Duvidoso', detail: 'Morte é certa no tom do poema.', correct: 'Sinônimo no contexto: «duvidoso» não cobre inevitabilidade.' },
          { label: 'D — Incerto', detail: 'Contradiz «iniludível».', correct: 'Antônimo no contexto: incerto opõe-se a inevitável.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O prazo final é iniludível.»',
            correct: 'Sinônimo no contexto: «incontornável» — não dá para ignorar.',
          },
        ],
        footer_rule: 'B: incontornável.',
      },
    ],
  },

  'avancasp-afa-sinonimos-considere-o-texto-a-seguir-para-resp-3962439': {
    family: 'text_fragment',
    source_tec_id: '3962439',
    source_note: 'dispersando ≈ dissipando/afastando — AVANÇASP AFar Pref Nova Odessa 2026 tec 3962439',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AFar (Pref Nova Odessa)',
      orgao: 'Pref. Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«A verdade é que estamos nos dispersando das pessoas.»\n\nA palavra destacada no trecho acima é sinônima de:',
    text_fragment:
      '<p>Sem tempo para tudo e com tempo para nada — Fabiano de Abreu (adaptado)</p><p>Ocupado. Atrasado. Sem tempo! […] A verdade é que estamos nos <strong>dispersando</strong> das pessoas. Nunca temos tempo para nada e milhões de coisas para resolver. […] Vivemos em uma era em que dizemos não ter tempo, mas na verdade não sabemos organizar o nosso tempo.</p>',
    options: [
      { id: 'A', text: '«concentrando», «aproximando».', is_correct: false },
      { id: 'B', text: '«elogiando», «comemorando».', is_correct: false },
      { id: 'C', text: '«ajudando», «auxiliando».', is_correct: false },
      { id: 'D', text: '«dissipando», «afastando».', is_correct: true },
      { id: 'E', text: '«estudando», «pesquisando».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dispersar-se das pessoas',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Dispersando', detail: 'Espalhar-se, afastar-se — perder vínculo.', icon: 'Users' },
          { label: 'Sem tempo', detail: 'Crônica sobre multitarefa e isolamento.', icon: 'Clock' },
          { label: 'Dissipando', detail: 'Espalhar, diluir atenção — par sinônimo.', icon: 'Wind' },
          { label: 'Afastando', detail: 'Distanciar-se de pessoas queridas.', icon: 'ArrowRight' },
          { label: 'Pegadinha', detail: 'Trocar por «concentrando/aproximando» (oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Dispersar-se = afastar-se.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Abreu: falta de tempo, atribulações, distância das pessoas.',
          '«Dispersando das pessoas» — nos afastamos, espalhamos atenção.',
          'A «concentrando/aproximando»: oposto — eliminar.',
          'B «elogiando/comemorando»: sem vínculo semântico — eliminar.',
          'C «ajudando/auxiliando»: contradiz afastamento — eliminar.',
          'D «dissipando/afastando»: equivalência direta — manter.',
          'E «estudando/pesquisando»: campo lexical distinto — eliminar.',
          'Gabarito D.',
          'Em similares: dispersar-se das pessoas ≈ afastar-se — prove no trecho.',
        ],
        footer_rule: 'Dispersar ≈ dissipar + afastar.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DISPERSAR',
        rows: [
          { label: 'Dispersar-se', value: 'Espalhar-se; afastar-se.' },
          { label: 'Dissipar', value: 'Diluir, espalhar (atenção/vínculo).' },
          { label: 'Afastar', value: 'Criar distância de pessoas.' },
          { label: 'Nesta questão', value: 'D — dissipando, afastando.' },
        ],
        footer_rule: 'Concentrar/aproximar = antônimos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares que invertem o sentido',
        items: [
          { label: 'A — concentrando', detail: 'Oposto de espalhar-se.', correct: 'Antônimo no contexto: concentrar aproxima — dispersar afasta.' },
          { label: 'B — elogiando', detail: 'Sem relação com distância social.', correct: 'Sinônimo no contexto: «elogiar» não substitui «dispersar-se».' },
          { label: 'C — ajudando', detail: 'Afastamento ≠ auxílio.', correct: 'Antônimo no contexto: ajudar implica proximidade.' },
          { label: 'E — estudando', detail: 'Campo lexical irrelevante.', correct: 'Sinônimo no contexto: «estudar» não encaixa no trecho.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A multidão dispersou-se pela praça.»',
            correct: 'Sinônimo no contexto: «espalhou-se» — mesmo campo de dispersão.',
          },
        ],
        footer_rule: 'D: dissipando + afastando.',
      },
    ],
  },

  'avancasp-esc-sinonimos-considere-o-texto-a-seguir-para-resp-3963895': {
    family: 'text_fragment',
    source_tec_id: '3963895',
    source_note: 'mimos ≈ carinhos/agrados — AVANÇASP Esc Pref Nova Odessa 2026 tec 3963895',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Nova Odessa)',
      orgao: 'Pref. Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«(...) somos loucos por eles, capazes de realizar caprichos e mimos diários.»\n\nA palavra destacada no trecho acima é sinônima de:',
    text_fragment:
      '<p>Nascer, crescer e evoluir... — Clickideia (adaptado)</p><p>Muita gente diz que conviver com adultos é tarefa bem difícil! Estar entre bichos e crianças é como viver em um mundo paralelo. […] Somos loucos por eles, capazes de realizar caprichos e <strong>mimos</strong> diários. […] As crianças nos dão sinceridade e simplicidade; os animais, companheirismo e carinho.</p>',
    options: [
      { id: 'A', text: '«ensinamentos», «teorias».', is_correct: false },
      { id: 'B', text: '«xingamentos», «gritos».', is_correct: false },
      { id: 'C', text: '«objetivos», «sonhos».', is_correct: false },
      { id: 'D', text: '«castigos», «lições».', is_correct: false },
      { id: 'E', text: '«carinhos», «agrados».', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mimos aos pets',
        chip_label: 'Campo afetivo',
        meta: slideMeta,
        items: [
          { label: 'Mimos', detail: 'Carinhos, agrado, caprichos com pets/crianças.', icon: 'Heart' },
          { label: 'Animais', detail: 'Gatos e cachorros — estimação, dependência.', icon: 'Dog' },
          { label: 'Crianças', detail: 'Sinceridade, simplicidade — par do texto.', icon: 'Baby' },
          { label: 'Companheirismo', detail: 'Animais oferecem carinho — trecho final.', icon: 'Handshake' },
          { label: 'Caprichos', detail: 'Par do trecho — gestos de afeto.', icon: 'Gift' },
          { label: 'Loucos por eles', detail: 'Tom afetivo com animais de estimação.', icon: 'Dog' },
          { label: 'Pergunta-teste', detail: 'Qual par mantém o tom de carinho?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por «castigos/lições» (oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mimo = gesto de afeto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Clickideia: adultos difíceis; bichos, crianças, mundo paralelo.',
          '«Caprichos e mimos diários» — gestos de afeto com pets.',
          'A «ensinamentos/teorias»: campo pedagógico — eliminar.',
          'B «xingamentos/gritos»: oposto de carinho — eliminar.',
          'C «objetivos/sonhos»: planejamento — eliminar.',
          'D «castigos/lições»: polaridade negativa — eliminar.',
          'E «carinhos/agrados»: equivalência direta — manter.',
          'Gabarito E.',
          'Em similares: mimo/capricho ≈ carinho — gesto de afeto com pets ou crianças.',
        ],
        footer_rule: 'Mimos ≈ carinhos + agrados.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MIMO',
        rows: [
          { label: 'Mimo', value: 'Gestos de afeto, agrado, carinho.' },
          { label: 'Capricho', value: 'Par frequente — mimar alguém.' },
          { label: 'Pergunta-teste', value: 'A troca mantém tom afetivo?' },
          { label: 'Nesta questão', value: 'E — carinhos, agrados.' },
        ],
        footer_rule: 'Castigo/xingamento = antônimos de mimo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares fora do tom afetivo',
        items: [
          { label: 'A — ensinamentos', detail: 'Pedagogia, não carinho cotidiano.', correct: 'Sinônimo no contexto: «ensinamentos» não substitui «mimos».' },
          { label: 'B — xingamentos', detail: 'Agressividade verbal.', correct: 'Antônimo no contexto: xingar ≠ mimar.' },
          { label: 'C — objetivos', detail: 'Metas — campo distinto.', correct: 'Sinônimo no contexto: «objetivos» não encaixa em caprichos diários.' },
          { label: 'D — castigos', detail: 'Punição — oposto de agrado.', correct: 'Antônimo no contexto: castigar contradiz «mimos».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Ela fez mimos ao gatinho adoentado.»',
            correct: 'Sinônimo no contexto: «carinhos» — gestos de afeto.',
          },
        ],
        footer_rule: 'E: carinhos + agrados.',
      },
    ],
  },

  'vunesp-tenf-sinonimos-leia-a-tira-a-seguir-para-responder-3999723': {
    family: 'text_fragment',
    source_tec_id: '3999723',
    source_note: '«inescrutável» ≈ incompreensível — tira Minduim Charles — VUNESP TEnf Pref Sorocaba 2026 tec 3999723',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Sorocaba)',
      orgao: 'Pref. Sorocaba',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      'Leia a tira a seguir para responder à questão.\n\n(M. Schulz, «Minduim Charles», 06.03.2026. Disponível em: https://cultura.estadao.com.br/quadrinhos)\n\nO termo «inescrutável», que aparece nos dois quadrinhos iniciais, é sinônimo de:',
    text_fragment:
      '<p><strong>Minduim Charles — M. Schulz, 06.03.2026 (transcrição adaptada)</strong></p>' +
      '<p><strong>1º quadrinho:</strong> Lucinha: «Soletra "inescrutável", Minduim!»</p>' +
      '<p><strong>2º quadrinho:</strong> Minduim: «"Inescrutável"? Isso é completamente <strong>inescrutável</strong> para mim!»</p>' +
      '<p><strong>3º quadrinho:</strong> Lucinha insiste na lista de palavras difíceis.</p>' +
      '<p><strong>4º quadrinho:</strong> Minduim tenta soletrar, confuso.</p>' +
      '<p><strong>5º quadrinho:</strong> Minduim: «Você não disse que eu teria que soletrá-las certo!»</p>' +
      '<p>Nos dois primeiros quadrinhos, <strong>inescrutável</strong> = impossível de compreender/decifrar.</p>',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'inaudível.', is_correct: false },
      { id: 'B', text: 'incompreensível.', is_correct: true },
      { id: 'C', text: 'indesculpável.', is_correct: false },
      { id: 'D', text: 'inabalável.', is_correct: false },
      { id: 'E', text: 'improvável.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tira + dicionário',
        chip_label: 'In- + escrutar',
        meta: slideMeta,
        items: [
          { label: 'Inescrutável', detail: 'Impossível de escrutar/compreender.', icon: 'HelpCircle' },
          { label: 'Tira Charles', detail: 'Soletração — palavra nos 2 primeiros quadrinhos.', icon: 'Image' },
          { label: 'Incompreensível', detail: 'Que não se entende — gabarito B.', icon: 'Brain' },
          { label: 'Parônimos falsos', detail: 'Inaudível, indesculpável, inabalável — outro campo.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Confundir com «improvável» (chance) ou «inaudível» (ouvir).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Inescrutável = não se compreende.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Minduim Charles (06.03.2026): soletração — «inescrutável» nos quadrinhos 1 e 2.',
          'Minduim não entende a palavra pedida — sentido de mistério/incompreensão.',
          'A «inaudível»: não se ouve — campo auditivo — eliminar.',
          'B «incompreensível»: não se compreende — equivalência — manter.',
          'C «indesculpável»: culpa — campo moral — eliminar.',
          'D «inabalável»: firme — campo de postura — eliminar.',
          'E «improvável»: pouco provável — campo de chance — eliminar.',
          'Gabarito B.',
          'Em similares: inescrutável ≈ impenetrável/incompreensível.',
        ],
        footer_rule: 'B = incompreensível.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INESCRUTÁVEL',
        rows: [
          { label: 'Formação', value: 'in- + escrutável (não se investiga).' },
          { label: 'Sentido', value: 'Misterioso, incompreensível, impenetrável.' },
          { label: 'Sinônimo', value: 'Incompreensível, insondável.' },
          { label: 'Nesta questão', value: 'B — incompreensível.' },
        ],
        footer_rule: 'Não confunda parônimos em in-.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Parônimos em in-',
        items: [
          { label: 'A — inaudível', detail: 'Relacionado a ouvir, não a entender.', correct: 'Sinônimo no contexto: «inaudível» não substitui «inescrutável».' },
          { label: 'C — indesculpável', detail: 'Culpa/perdão — outro domínio.', correct: 'Parônimo: forma parecida, sentido de culpa — não encaixa.' },
          { label: 'D — inabalável', detail: 'Firmeza — não mistério.', correct: 'Sinônimo no contexto: «inabalável» não cobre incompreensão.' },
          { label: 'E — improvável', detail: 'Probabilidade, não entendimento.', correct: 'Sinônimo no contexto: «improvável» ≠ «inescrutável».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O olhar dele era inescrutável.»',
            correct: 'Sinônimo no contexto: «incompreensível» — não se decifra.',
          },
        ],
        footer_rule: 'B passa: incompreensível.',
      },
    ],
  },

  'avancasp-gcm-sinonimos-leia-o-texto-a-seguir-para-responder-4001113': {
    family: 'text_fragment',
    source_tec_id: '4001113',
    source_note: 'inoportunas ≈ inconvenientes — Fendrich velhinha — AVANÇASP GCM Pref Taiúva 2026 tec 4001113',
    meta: {
      banca: 'AVANÇASP',
      prova: 'GCM (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Essa velhinha já havia batido à minha porta em horas inoportunas.»\n\nA palavra destacada no trecho acima é sinônima de:',
    text_fragment:
      '<p><strong>A velhinha e o celular</strong> — Henrique Fendrich (adaptado)</p><p>Era noite e eu costumava dormir cedo. […] De vez em quando ela vinha pedir ajuda. Essa velhinha já havia batido à minha porta em horas <strong>inoportunas</strong>. Nunca deixei de atender, mas foi ao custo de muito domínio próprio que escondi o meu incômodo. […] Ela me estendeu o celular antiquíssimo para eu ligar o aparelho.</p>',
    options: [
      { id: 'A', text: '«inconvenientes».', is_correct: true },
      { id: 'B', text: '«combinadas».', is_correct: false },
      { id: 'C', text: '«agradáveis».', is_correct: false },
      { id: 'D', text: '«noturnas».', is_correct: false },
      { id: 'E', text: '«marcadas».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hora inoportuna',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Inoportunas', detail: 'Horário inadequado, que incomoda.', icon: 'Clock' },
          { label: 'Velhinha', detail: 'Crônica Fendrich — visitas na hora de dormir.', icon: 'User' },
          { label: 'Inconvenientes', detail: 'Que causam incômodo — gabarito A.', icon: 'AlertCircle' },
          { label: 'Domínio próprio', detail: 'Narrador esconde incômodo — reforça inadequação.', icon: 'Meh' },
          { label: 'Pegadinha', detail: 'Marcar só «noturnas» (parcial) ou «agradáveis» (oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Inoportuno = inconveniente (momento).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica: narrador dorme cedo; velhinha bate à porta para ajuda com celular.',
          '«Horas inoportunas» — momento que perturba, incomoda.',
          'A «inconvenientes»: inadequadas, que causam incômodo — manter.',
          'B «combinadas»: havia acordo de horário — contradiz texto — eliminar.',
          'C «agradáveis»: oposto do incômodo — eliminar.',
          'D «noturnas»: pode ser noite, mas não é o sinônimo de inoportunas — eliminar.',
          'E «marcadas»: agendadas — eliminar.',
          'Gabarito A.',
          'Em similares: inoportuno ≠ só «noite», e sim «inadequado».',
        ],
        footer_rule: 'Inoportunas ≈ inconvenientes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INOPORTUNO',
        rows: [
          { label: 'Inoportuno', value: 'Fora de hora; inadequado; que incomoda.' },
          { label: 'Inconveniente', value: 'Que causa incômodo, desconforto.' },
          { label: 'Pergunta-teste', value: 'A troca mantém o incômodo do narrador?' },
          { label: 'Nesta questão', value: 'A — inconvenientes.' },
        ],
        footer_rule: 'Noturna descreve horário; inoportuna julga adequação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Respostas parciais ou opostas',
        items: [
          { label: 'B — combinadas', detail: 'Visitas não eram combinadas.', correct: 'Sinônimo no contexto: «combinadas» não substitui «inoportunas».' },
          { label: 'C — agradáveis', detail: 'Narrador sente incômodo.', correct: 'Antônimo no contexto: agradável opõe-se ao tom do trecho.' },
          { label: 'D — noturnas', detail: 'Pode ser à noite, mas não é sinônimo.', correct: 'Sinônimo no contexto: «noturnas» descreve horário, não inadequação.' },
          { label: 'E — marcadas', detail: 'Sem agendamento no texto.', correct: 'Sinônimo no contexto: «marcadas» implica combinação — não encaixa.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Ligou em hora inoportuna, durante a reunião.»',
            correct: 'Sinônimo no contexto: «inconveniente» — momento inadequado.',
          },
        ],
        footer_rule: 'A: inconvenientes.',
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
