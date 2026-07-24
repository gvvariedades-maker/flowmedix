#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — verbos-tempos-modos-e-vozes-g06 (5 slugs · Verbos · lote 6/6).
 *
 *   npx tsx scripts/handcraft-verbos-tempos-modos-e-vozes-g06.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'verbos-tempos-modos-e-vozes-g06';
const SUBTOPICO = 'Verbos — tempos, modos e vozes';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_verbos';
const REVIEWED = '2026-07-23';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-verbos-mais-que-perfeito-sjrp.json';

const VERBOS_SOURCE = {
  id: 'pt-verbos-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Verbos — tempo, modo, voz e correlação temporal',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'infinitivo',
    'forma nominal',
    'locução verbal',
    'verbo copulativo',
    'voz ativa',
    'voz passiva',
    'passiva sintética',
    'passiva analítica',
    'pergunta-teste tempo/modo/voz',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'vf' | 'text_fragment';

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
      reviewer: 'handcraft:verbos-tempos-modos-e-vozes-g06',
      guideline_snapshot: `M14 Elias TE-simples — pergunta «Qual tempo/modo/voz?» · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      VERBOS_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2025,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt_verbos'],
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
  'instituto-ao-verbos-o-texto-a-seguir-refere-se-a-questao-3841168': {
    family: 'text_fragment',
    source_tec_id: '3841168',
    source_note: 'Infinitivos participar/checar/adiantar — forma nominal · AOCP Ass UNIRIO 2026 tec 3841168',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO) Administração',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Sobre o trecho inicial “Participar de uma reunião, checar mensagens e adiantar um relatório ao mesmo tempo”, assinale a afirmativa correta:',
    text_fragment:
      'Participar de uma reunião, checar mensagens e adiantar um relatório ao mesmo tempo. Quem nunca sentiu um certo orgulho por conseguir fazer várias coisas simultaneamente?',
    options: [
      {
        id: 'A',
        text: 'A preposição “de” é empregada para indicar origem, como em “Ele saiu de São Paulo e foi para Sergipe”.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Os verbos “participar”, “checar” e “adiantar” nomeiam ações, por isso são empregados em sua forma nominal, não flexionada.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'A palavra “certo” é um adjetivo que caracteriza o substantivo “orgulho” como algo “correto”.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A palavra “simultaneamente” é um advérbio de modo porque modaliza o discurso indicando certeza.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'As expressões “ao mesmo tempo” e “simultaneamente” são classificadas como advérbios de tempo e empregadas como sinônimos no texto.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infinitivo = forma nominal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Participar / checar / adiantar: flexionados ou nominais?', icon: 'HelpCircle' },
          { label: 'Infinitivo', detail: 'Forma nominal — nomeia a ação sem pessoa/número.', icon: 'Type' },
          { label: 'Multitarefa', detail: 'Reunião, mensagens e relatório — três infinitivos em série.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Desviar para «certo», «simultaneamente» ou preposição «de».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Infinitivo = verbo sem flexão de pessoa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre participar / checar / adiantar.',
          'Três formas em -ar/-er sem sujeito flexionado = infinitivo (forma nominal).',
          'B descreve exatamente isso — nomeiam ações, não flexionadas.',
          'A «de» em «Participar de» não indica origem geográfica — eliminar.',
          'C «certo orgulho» = indeterminado («algum»), não «correto» — eliminar.',
          'D «simultaneamente» = modo (como), não certeza — eliminar.',
          'E «simultaneamente» é modo; não são ambos advérbios de tempo — eliminar.',
          'Gabarito B — infinitivos = forma nominal.',
          'Em similares: lista de -ar/-er/-ir no início = infinitivo nominal.',
        ],
        footer_rule: 'B = forma nominal (infinitivo).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FORMAS NOMINAIS DO VERBO',
        rows: [
          { label: 'Infinitivo', value: 'participar · checar · adiantar' },
          { label: 'Gerúndio', value: 'participando · checando' },
          { label: 'Particípio', value: 'participado · checado' },
          { label: 'Nesta questão', value: 'B — infinitivos nominais.' },
        ],
        footer_rule: 'Nominal = sem conjugação de pessoa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Afirmativas que desviam do núcleo verbal.',
        items: [
          {
            label: 'A — preposição «de» = origem',
            detail: '«Participar de uma reunião» = complemento, não origem.',
            correct: 'O foco correto são os infinitivos (B), não a preposição.',
          },
          {
            label: 'C — «certo» = correto',
            detail: '«Certo orgulho» = algum/um certo, não «exato».',
            correct: 'Leitura errada do adjetivo — gabarito é B.',
          },
          {
            label: 'D — simultaneamente = certeza',
            detail: 'Advérbio de modo (como), não de certeza.',
            correct: 'Não classifica os infinitivos — alvo é B.',
          },
          {
            label: 'E — ambos advérbios de tempo',
            detail: '«Simultaneamente» = modo; não sinônimos temporais estritos.',
            correct: 'Análise lateral — a correta sobre os verbos é B.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Aferir, registrar e comunicar o sinal vital.»',
            correct: 'Infinitivos — forma nominal não flexionada (mesmo valor de B).',
          },
        ],
        footer_rule: 'Gabarito B — forma nominal.',
      },
    ],
  },

  'apice-ap-ei-verbos-15-07-2026-19-33-26-88-60-61-62-63-d-4037450': {
    family: 'conceito',
    source_tec_id: '4037450',
    source_note: 'não / vou / fazer / dever — morfologia · Ápice AP EI SJ Cordeiros 2026 tec 4037450',
    meta: {
      banca: 'Ápice',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref. São José dos Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise o trecho: “Eu não vou fazer o dever de matemática.” A classificação morfológica correta das palavras destacadas é:',
    text_fragment: 'Eu não vou fazer o dever de matemática.',
    options: [
      {
        id: 'A',
        text: 'não (advérbio), vou (verbo), fazer (verbo no infinitivo), dever (substantivo).',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'não (conjunção), vou (verbo), fazer (verbo), dever (verbo).',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'não (interjeição), vou (verbo), fazer (substantivo), dever (substantivo).',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'não (advérbio), vou (verbo), fazer (verbo), dever (adjetivo).',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'não (preposição), vou (verbo), fazer (advérbio), dever (substantivo).',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro palavras — quatro classes',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'não / vou / fazer / dever — qual classe cada uma?', icon: 'HelpCircle' },
          { label: 'Vou fazer', detail: 'Locução: auxiliar «vou» + infinitivo «fazer».', icon: 'Link' },
          { label: 'Dever', detail: 'Aqui = substantivo (o dever de matemática), não verbo.', icon: 'Book' },
          { label: 'Pegadinha', detail: 'Ler «dever» como verbo ou «não» como conjunção.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Artigo «o» + dever = substantivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar não · vou · fazer · dever.',
          '«Não» = advérbio de negação · «vou» = verbo · «fazer» = infinitivo · «o dever» = substantivo.',
          'A casa com as quatro classificações.',
          'B «não» conjunção e «dever» verbo — falso — eliminar.',
          'C «não» interjeição e «fazer» substantivo — falso — eliminar.',
          'D «dever» adjetivo — falso — eliminar.',
          'E «não» preposição e «fazer» advérbio — falso — eliminar.',
          'Gabarito A — advérbio · verbo · infinitivo · substantivo.',
          'Em similares: «o dever / a tarefa» = substantivo, não verbo.',
        ],
        footer_rule: 'A = classificação completa correta.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MORFOLOGIA NO TRECHO',
        rows: [
          { label: 'não', value: 'Advérbio de negação.' },
          { label: 'vou', value: 'Verbo auxiliar (ir).' },
          { label: 'fazer', value: 'Infinitivo — forma nominal.' },
          { label: 'dever', value: 'Substantivo («o dever de matemática»).' },
        ],
        footer_rule: 'Artigo antes de «dever» = substantivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros de classe nas quatro palavras.',
        items: [
          {
            label: 'B — não=conjunção · dever=verbo',
            detail: '«Não» nega o verbo; «dever» aqui é nome.',
            correct: 'Advérbio + substantivo — como em A.',
          },
          {
            label: 'C — não=interjeição · fazer=substantivo',
            detail: '«Fazer» é infinitivo verbal na locução.',
            correct: 'Fazer = verbo no infinitivo; não = advérbio.',
          },
          {
            label: 'D — dever=adjetivo',
            detail: 'Adjetivo qualificaria nome; aqui «dever» É o nome.',
            correct: '«O dever» = substantivo.',
          },
          {
            label: 'E — não=preposição · fazer=advérbio',
            detail: 'Classes trocadas — não cabe no trecho.',
            correct: 'Não = advérbio; fazer = infinitivo.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «Não vou fazer o plantão extra.» — «plantão»',
            correct: 'Substantivo — mesmo teste do artigo («o plantão» / «o dever»).',
          },
        ],
        footer_rule: 'Gabarito A — quatro classes corretas.',
      },
    ],
  },

  'facet-acs-pr-verbos-assinale-a-alternativa-que-contem-um-3358535': {
    family: 'conceito',
    source_tec_id: '3358535',
    source_note: 'Verbo copulativo «ser» · FACET ACS Pref Pedro Velho 2025 tec 3358535',
    meta: {
      banca: 'FACET',
      prova: 'ACS (Pref Pedro Velho)',
      orgao: 'Pref. Pedro Velho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa que contém um verbo copulativo:',
    options: [
      { id: 'A', text: 'Comprar.', is_correct: false },
      { id: 'B', text: 'Correr.', is_correct: false },
      { id: 'C', text: 'Ser.', is_correct: true },
      { id: 'D', text: 'Pontuar.', is_correct: false },
      { id: 'E', text: 'Compartilhar.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Copulativo × nocional',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual alternativa contém um verbo copulativo?', icon: 'HelpCircle' },
          { label: 'Ser (copulativo)', detail: 'Liga sujeito a predicativo — «Ele é técnico».', icon: 'Link' },
          { label: 'Nocionais', detail: 'Comprar, correr, pontuar, compartilhar — ações plenas.', icon: 'Zap' },
          { label: 'Pegadinha', detail: 'Escolher Comprar/Correr por parecer verbo «básico».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Verbo copulativo = Ser (ligação).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinale a alternativa com verbo copulativo.',
          'Copulativo une sujeito a predicativo — paradigma «Ser».',
          'C «Ser» = verbo copulativo clássico.',
          'A «Comprar» = nocional (ação) — eliminar.',
          'B «Correr» = nocional — eliminar.',
          'D «Pontuar» = nocional — eliminar.',
          'E «Compartilhar» = nocional — eliminar.',
          'Gabarito C — Ser (verbo copulativo).',
          'Em similares: ser/estar/parecer × comprar/correr/pontuar.',
        ],
        footer_rule: 'C = Ser — verbo copulativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VERBO COPULATIVO',
        rows: [
          { label: 'Copulativo', value: 'Ser · estar · parecer · permanecer' },
          { label: 'Função', value: 'Ligar sujeito ao predicativo do sujeito.' },
          { label: 'Nocional (não)', value: 'Comprar · Correr · Pontuar · Compartilhar' },
          { label: 'Nesta questão', value: 'C — Ser (verbo copulativo).' },
        ],
        footer_rule: 'Copulativo ≠ ação plena.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Alternativas sem verbo copulativo.',
        items: [
          {
            label: 'A — Comprar',
            detail: 'Ação transitiva — nocional, não copulativo.',
            correct: 'Verbo copulativo = Ser (C), não Comprar.',
          },
          {
            label: 'B — Correr',
            detail: 'Ação intransitiva — nocional.',
            correct: 'Correr não é verbo copulativo.',
          },
          {
            label: 'D — Pontuar',
            detail: 'Ação — marcar pontos; não liga predicativo.',
            correct: 'Pontuar é nocional; copulativo é Ser.',
          },
          {
            label: 'E — Compartilhar',
            detail: 'Ação transitiva — nocional.',
            correct: 'Compartilhar ≠ verbo copulativo.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «O paciente está estável.» — «está»',
            correct: 'Verbo copulativo (ligação) — mesma família de Ser.',
          },
        ],
        footer_rule: 'Gabarito C — Ser (verbo copulativo).',
      },
    ],
  },

  'fgv-ag-pref-verbos-todas-as-frases-a-seguir-estao-na-vo-3430169': {
    family: 'conceito',
    source_tec_id: '3430169',
    source_note: 'EXCETO voz passiva — voz ativa «Elegeram» · FGV Ag Pref Canaã 2025 tec 3430169',
    meta: {
      banca: 'FGV',
      prova: 'Ag (Pref Canaã Carajás) Serviços de Informática',
      orgao: 'Pref. Canaã dos Carajás',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Todas as frases a seguir estão na voz passiva à exceção de uma. Assinale a única que se mostra na voz ativa.',
    options: [
      { id: 'A', text: 'Comprou-se um móvel novo para a sala.', is_correct: false },
      { id: 'B', text: 'O presidente da República foi eleito pelo povo.', is_correct: false },
      { id: 'C', text: 'Muitos alunos foram repreendidos pelo diretor.', is_correct: false },
      { id: 'D', text: 'Todos foram selecionados pelo diretor da empresa.', is_correct: false },
      { id: 'E', text: 'Elegeram os deputados em rápido processo eletivo.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ativa × passiva',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual frase NÃO está na voz passiva?', icon: 'HelpCircle' },
          { label: 'Passiva analítica', detail: 'ser + particípio (+ agente): foi eleito / foram repreendidos.', icon: 'Shield' },
          { label: 'Passiva sintética', detail: 'VTD + se: comprou-se.', icon: 'RefreshCw' },
          { label: 'Ativa', detail: 'Elegeram os deputados — sujeito indeterminado, voz ativa.', icon: 'User' },
        ],
        footer_rule: 'EXCETO = achar a voz ativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: única frase na voz ativa.',
          'E «Elegeram os deputados» — 3ª pl. sem se passivo = voz ativa (sujeito indeterminado).',
          'A «Comprou-se» = passiva sintética — eliminar (é passiva).',
          'B/C/D «foi/foram + particípio» = passiva analítica — eliminar.',
          'Gabarito E — voz ativa.',
          'Em similares: -ram sem «se» passivo e sem «ser+particípio» = ativa.',
        ],
        footer_rule: 'E = voz ativa (elegeram).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VOZES — RECONHECER',
        rows: [
          { label: 'Ativa', value: 'Sujeito pratica: Elegeram os deputados.' },
          { label: 'Passiva analítica', value: 'foi eleito / foram selecionados (+ por).' },
          { label: 'Passiva sintética', value: 'comprou-se / alugam-se casas.' },
          { label: 'Nesta questão', value: 'E — única ativa.' },
        ],
        footer_rule: 'EXCETO passiva → marque a ativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Frases passivas — por que não são o EXCETO.',
        items: [
          {
            label: 'A — Comprou-se',
            detail: 'Passiva sintética (VTD + se).',
            correct: 'É passiva — o EXCETO (ativa) é E.',
          },
          {
            label: 'B — foi eleito pelo povo',
            detail: 'Passiva analítica + agente da passiva.',
            correct: 'Passiva — não é o EXCETO.',
          },
          {
            label: 'C — foram repreendidos',
            detail: 'Ser + particípio — passiva analítica.',
            correct: 'Passiva — alvo do EXCETO é E.',
          },
          {
            label: 'D — foram selecionados',
            detail: 'Mesma estrutura passiva de C.',
            correct: 'Passiva — única ativa = E.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique a voz: «Aplicaram a vacina no posto.»',
            correct: 'Voz ativa (3ª pl.) — mesmo molde de «Elegeram os deputados».',
          },
        ],
        footer_rule: 'Gabarito E — voz ativa.',
      },
    ],
  },

  'fgv-ag-st-pr-verbos-texto-i-a-escrita-a-nossa-civilizaca-3432846': {
    family: 'text_fragment',
    source_tec_id: '3432846',
    source_note: 'Voz passiva «é influenciado» · FGV Ag ST Pref Canaã 2025 tec 3432846',
    meta: {
      banca: 'FGV',
      prova: 'Ag ST (Pref Canaã Carajás) Agropecuários',
      orgao: 'Pref. Canaã dos Carajás',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a opção que apresenta a frase que se encontra na voz passiva.',
    text_fragment:
      'Sem a linguagem escrita é praticamente impossível a existência no seio da civilização. O analfabeto é um pária que não se comunica com o mundo, não influi e pouco é influenciado.',
    options: [
      {
        id: 'A',
        text: 'O analfabeto é um pária que não se comunica com o mundo, não influi e pouco é influenciado.',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'A escrita domina a nossa vida; é uma instituição social tão forte quanto a nação e o Estado.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Nossa cultura é basicamente uma cultura de livros.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Pela escrita acumulamos conhecimentos, transmitimos ideias, fixamos nossa cultura.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Nossas religiões derivam de livros.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ser + particípio = passiva',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Onde o sujeito sofre a ação (voz passiva)?', icon: 'HelpCircle' },
          { label: 'É influenciado', detail: 'Ser + particípio — passiva analítica.', icon: 'Shield' },
          { label: 'Analfabeto / escrita', detail: 'Trecho sobre civilização e linguagem escrita.', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: 'Tomar «é» copulativo («é uma cultura») por passiva.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Passiva = ser + particípio (ação sofrida).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar a frase na voz passiva.',
          'A: «pouco é influenciado» = ser + particípio — sujeito paciente.',
          'B «domina» = voz ativa; «é uma instituição» = copulativo — eliminar.',
          'C «é uma cultura» = ser + predicativo (não particípio de ação) — eliminar.',
          'D «acumulamos / transmitimos / fixamos» = voz ativa — eliminar.',
          'E «derivam» = voz ativa — eliminar.',
          'Gabarito A — voz passiva («é influenciado»).',
          'Em similares: teste se há particípio de verbo transitivo após ser/estar.',
        ],
        footer_rule: 'A = é influenciado (passiva).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VOZ PASSIVA ANALÍTICA',
        rows: [
          { label: 'Forma', value: 'ser/estar + particípio (é influenciado).' },
          { label: 'Sujeito', value: 'Paciente — sofre a ação.' },
          { label: '≠ Copulativo', value: 'é uma cultura / é instituição — predicativo.' },
          { label: 'Nesta questão', value: 'A — pouco é influenciado.' },
        ],
        footer_rule: 'Particípio de ação ≠ predicativo nominal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Frases ativas ou só com «é» copulativo.',
        items: [
          {
            label: 'B — domina / é instituição',
            detail: '«Domina» = ativa; «é» + substantivo = ligação.',
            correct: 'Sem particípio de ação — não é passiva.',
          },
          {
            label: 'C — é uma cultura',
            detail: 'Ser + predicativo — classificação nominal.',
            correct: 'Copulativo ≠ passiva analítica.',
          },
          {
            label: 'D — acumulamos…',
            detail: '1ª pl. pratica a ação — voz ativa.',
            correct: 'Ativa — a passiva está em A.',
          },
          {
            label: 'E — derivam',
            detail: 'Voz ativa — religiões praticam «derivar».',
            correct: 'Ativa — gabarito é A.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique a voz: «O paciente é avaliado pela equipe.»',
            correct: 'Voz passiva analítica — ser + particípio (mesmo molde de A).',
          },
        ],
        footer_rule: 'Gabarito A — voz passiva.',
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
