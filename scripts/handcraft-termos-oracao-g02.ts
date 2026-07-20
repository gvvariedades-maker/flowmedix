#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — termos-oracao-g02 (8 slugs · Termos da oração · lote 2/4).
 *
 *   npx tsx scripts/handcraft-termos-oracao-g02.ts
 *   npm run audit:questao-readiness -- --lote=termos-oracao-g02 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=termos-oracao-g02 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'termos-oracao-g02';
const SUBTOPICO = 'Termos da oração';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_termos_oracao';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-termos-matrix-folhetos.json';

const TERMOS_SOURCE = {
  id: 'pt-termos-oracao-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Termos da oração — adjuntos, complementos, aposto, vocativo, locuções',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'adjunto adnominal',
    'adjunto adverbial',
    'complemento nominal',
    'modifica verbo',
    'modifica nome',
    'função sintática',
    'aposto',
    'vocativo',
    'locução adverbial',
  ],
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
      reviewer: 'handcraft:termos-oracao-g02',
      guideline_snapshot: `M05/M06 Elias TE-simples — matriz de cargos · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      TERMOS_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt-term-matrix'],
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
  'quadrix-ses-sp-termos-folhetos-enquanto-3779634': {
    family: 'conceito',
    source_tec_id: '3779634',
    source_note: 'Par folhetos/Enquanto isso — QUADRIX Tec Enf SES SP 2026 tec 3779634',
    meta: {
      banca: 'QUADRIX',
      prova: 'Tec Enf (SES SP)',
      orgao: 'SES SP',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em «No grupo que só recebeu os folhetos, essa taxa foi de 74%» e «Enquanto isso, oito anos após o início do tratamento contra o câncer:», os termos «No grupo que só recebeu os folhetos» e «Enquanto isso» classificam-se, respectivamente, como',
    options: [
      { id: 'A', text: 'complemento nominal e adjunto adverbial.', is_correct: false },
      { id: 'B', text: 'adjunto adverbial e adjunto adnominal.', is_correct: false },
      { id: 'C', text: 'locução conjuntiva e adjunto adverbial deslocado.', is_correct: false },
      { id: 'D', text: 'adjunto adnominal e adjunto adverbial.', is_correct: false },
      { id: 'E', text: 'adjunto adverbial deslocado e locução adverbial de tempo.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois termos — duas células',
        chip_label: 'Matriz simples',
        meta: slideMeta,
        items: [
          { label: '1. Termo = cargo', detail: 'Cada trecho destacado tem uma função sintática — classifique um por vez.', icon: 'Boxes' },
          { label: '2. Modifica verbo?', detail: 'Circunstância de quando, onde, como → adjunto adverbial.', icon: 'CornerDownRight' },
          { label: '3. Modifica nome?', detail: 'Característica de um substantivo → adjunto adnominal.', icon: 'Box' },
          { label: '4. De quê? + prep.', detail: 'Completa um nome com preposição → complemento nominal.', icon: 'User' },
          { label: 'Pegadinha: vizinho', detail: 'Colar o rótulo do termo ao lado sem aplicar a pergunta-teste.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Dois termos destacados = duas perguntas-teste separadas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'T1 → T2 → letras',
        meta: slideMeta,
        steps: [
          'Comando: classificar «No grupo que só recebeu os folhetos» e «Enquanto isso» — par de cargos.',
          'T1 «No grupo… folhetos»: circunstância do verbo «foi» — adjunto adverbial deslocado.',
          'T2 «Enquanto isso»: marca tempo da situação — locução adverbial de tempo.',
          'A: T1 não é complemento nominal (não completa nome com de quê?) — eliminar.',
          'B/D: trocam adjunto adnominal × adjunto adverbial entre T1 e T2 — eliminar.',
          'C: T1 não é locução conjuntiva (não liga orações por conjunção) — eliminar.',
          'Gabarito E — adjunto adverbial deslocado + locução adverbial de tempo.',
          'Em similares: matriz — pergunta-teste por termo; não copie o rótulo do vizinho.',
        ],
        footer_rule: 'Classifique T1 antes de olhar T2.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Matriz de bolso',
        meta: slideMeta,
        content: 'PERGUNTA → CARGO (×2)',
        rows: [
          { label: 'Pergunta-chave', value: 'Modifica verbo? modifica nome? De quê? — uma por termo destacado.' },
          { label: 'Modifica verbo?', value: 'Circunstância → adjunto adverbial (pode ser deslocado).' },
          { label: 'Modifica nome?', value: 'Característica do substantivo → adjunto adnominal.' },
          { label: 'De quê? + prep.', value: 'Completa nome → complemento nominal.' },
          { label: 'Enquanto / quando', value: 'Tempo → locução adverbial de tempo.' },
          { label: 'Nesta questão', value: 'T1 folhetos: adv. deslocado · T2 Enquanto isso: loc. tempo (E)' },
        ],
        footer_rule: 'Par de termos = duas células na matriz.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Rótulo do vizinho — onde a matriz barra',
        items: [
          { label: 'A — CN em T1', detail: '«No grupo… folhetos» parece completar «taxa».', correct: 'T1 circunstancia «foi» — adjunto adverbial deslocado, não complemento nominal.' },
          { label: 'B — AAdj em T2', detail: '«Enquanto isso» parece caracterizar «oito anos».', correct: 'T2 marca tempo da situação — locução adverbial de tempo.' },
          { label: 'C — conjuntiva em T1', detail: 'Trecho inicial parece conjunção ligando orações.', correct: 'É circunstância posicional do verbo, não locução conjuntiva.' },
          { label: 'D — AAdj em T1', detail: '«folhetos» perto de «taxa» induz adjunto adnominal.', correct: 'Modifica a situação de «foi», não o núcleo de «taxa».' },
          { label: 'Em outra banca…', detail: 'Podem trocar folhetos por UBS ou plantão.', correct: 'Mesma matriz: T1 circunstância · T2 tempo (enquanto/quando).' },
        ],
        footer_rule: 'E sobrou: adv. deslocado + loc. adverbial de tempo.',
      },
    ],
  },

  'vunesp-sjrp-termos-parenteses-acessoria-3789304': {
    family: 'text_fragment',
    source_tec_id: '3789304',
    source_note: 'Parênteses informação acessória — VUNESP Ag Adm Pref SJRP 2026 tec 3789304',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag Adm (Pref SJRP)',
      orgao: 'Pref. São José do Rio Preto',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho do 3º parágrafo «... ultrapassava 2 mil calorias por pessoa (média que inclui crianças e idosos).», os parênteses foram empregados para apresentar',
    text_fragment:
      '<p>Claude Lévi-Strauss, <em>Somos todos canibais</em> (2022, adaptado). Texto sobre povos sem agricultura. «Calculou-se que, entre os povos que viviam da caça e da coleta de produtos selvagens, um homem supria as necessidades de quatro ou cinco pessoas… o tempo gasto com a procura de alimentos não excedia a média de três horas diárias, para uma produção alimentar bastante equilibrada e que ultrapassava 2 mil calorias por pessoa <strong>(média que inclui crianças e idosos)</strong>.»</p>',
    options: [
      { id: 'A', text: 'um comentário irônico.', is_correct: false },
      { id: 'B', text: 'uma opinião pessoal.', is_correct: false },
      { id: 'C', text: 'um dado equivocado.', is_correct: false },
      { id: 'D', text: 'uma reflexão negativa.', is_correct: false },
      { id: 'E', text: 'uma informação acessória.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parênteses — função sintática',
        meta: slideMeta,
        items: [
          { label: '2 mil calorias', detail: 'Núcleo da informação principal — produção alimentar.', icon: 'Target' },
          { label: 'Média que inclui…', detail: 'Esclarece o cálculo — informação acessória (inciso/aposto).', icon: 'GitBranch' },
          { label: 'Aposto / inciso', detail: 'Termo acessório que explica o anterior — mesma referência.', icon: 'Box' },
          { label: '≠ Adjunto adverbial', detail: 'Não modifica verbo — complementa o dado numérico.', icon: 'Ban' },
          { label: 'Pegadinha: opinião', detail: 'Tom neutro do texto antropológico — não é juízo pessoal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Parênteses = informação acessória ao núcleo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Calorias → parênteses',
        meta: slideMeta,
        steps: [
          'Texto Claude Lévi-Strauss (agricultura/calorias): isolar «(média que inclui crianças e idosos)».',
          'Função: esclarecer o que significa «média» no cálculo — informação acessória.',
          'Sintaticamente: inciso/aposto explicativo entre parênteses.',
          'A/B/D: não há ironia, opinião subjetiva nem tom negativo.',
          'C: o dado não é apresentado como equivocado — é esclarecimento.',
          'Gabarito E — informação acessória.',
          'Em similares: parênteses explicam termo anterior — aposto/inciso acessório.',
        ],
        footer_rule: 'Parênteses explicativos = informação acessória.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PARÊNTESES × TERMOS',
        rows: [
          { label: 'Informação acessória', value: 'Esclarece sem alterar o núcleo — aposto/inciso.' },
          { label: 'Aposto', value: 'Explica/identifica termo anterior — função sintática acessória.' },
          { label: '× Modifica verbo', value: 'Adjunto adverbial circunstancia ação — não é o caso.' },
          { label: '× Modifica nome', value: 'Adjunto adnominal caracteriza substantivo isolado.' },
          { label: 'Nesta questão', value: 'E — informação acessória' },
        ],
        footer_rule: 'Média que inclui… = esclarecimento acessório.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função dos parênteses',
        items: [
          { label: 'A — irônico', detail: 'Tom científico do antropólogo parece distante.', correct: 'Esclarecimento objetivo — informação acessória, não ironia.' },
          { label: 'B — opinião pessoal', detail: '«Média» parece juízo do autor.', correct: 'Dado metodológico explicativo — acessório, não opinião.' },
          { label: 'C — equivocado', detail: 'Parênteses parecem retificação.', correct: 'Não corrige erro — complementa o sentido de «média».' },
          { label: 'D — reflexão negativa', detail: 'Crianças e idosos parecem crítica social.', correct: 'Especificação neutra do cálculo — informação acessória.' },
          { label: 'Em outra banca…', detail: 'Trocam por «(dado per capita)».', correct: 'Mesmo padrão: parênteses explicam termo anterior.' },
        ],
        footer_rule: 'E: informação acessória.',
      },
    ],
  },

  'aocp-unirio-termos-travessao-brinquedos-3840834': {
    family: 'text_fragment',
    source_tec_id: '3840834',
    source_note: 'Travessão opcional brinquedos/ponte — AOCP Ass UNIRIO 2026 tec 3840834',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa que analisa corretamente o excerto «[os brinquedos] funcionam como uma ponte de volta aos momentos leves da infância — e, por isso, têm ganhado espaço em um mercado cada vez mais guiado pela nostalgia.»',
    text_fragment:
      '<p>Texto sobre kidults e nostalgia (Folha, nov/2025). «[Os brinquedos] funcionam como uma ponte de volta aos momentos leves da infância <strong>— e, por isso, têm ganhado espaço em um mercado cada vez mais guiado pela nostalgia</strong>.»</p>',
    options: [
      {
        id: 'A',
        text: 'O termo «como» é empregado com a mesma função textual que em «Filmes como Barbie e Lilo & Stitch são apenas alguns exemplos dessa tendência.».',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'A palavra «têm» é grafada com acento circunflexo porque se trata de um monossílabo tônico.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'O travessão não é de uso obrigatório, podendo ser omitido sem que isso cause prejuízo sintático ao excerto.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'O termo «pela» introduz um adjunto adverbial de causa, como em «Pela falta de dinheiro, não pôde comprar a comida dos filhos».',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A locução verbal «têm ganhado» indica que a oração está na voz passiva.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Travessão — sintaxe × pontuação',
        meta: slideMeta,
        items: [
          { label: 'Ponte / infância', detail: 'Primeira oração — brinquedos como metáfora de retorno.', icon: 'CornerDownRight' },
          { label: 'Travessão', detail: 'Separa oração explicativa/consequente — uso facultativo aqui.', icon: 'Minus' },
          { label: 'Por isso', detail: 'Consequência — adjunto adverbial de causa (locução).', icon: 'ArrowRight' },
          { label: 'Pela nostalgia', detail: '«Guiado pela nostalgia» — adjunto adverbial de causa no particípio.', icon: 'Link' },
          { label: 'Pegadinha: passiva', detail: '«Têm ganhado» é locução verbal ativa, não voz passiva.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Travessão pode ser trocado por vírgula ou ponto — não é obrigatório.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Excerto brinquedos/ponte/infância: testar cada alternativa de análise sintática.',
          'A: «como» no excerto = comparação; em «Filmes como Barbie» = exemplo — funções distintas.',
          'B: «têm» é paroxítono (aguda), não monossílabo tônico — grafia errada na afirmativa.',
          'C: travessão introduz consequência — pode ser omitido ou substituído sem quebrar sintaxe.',
          'D: «pela nostalgia» modifica «guiado» (particípio), não inicia oração como adjunto deslocado.',
          'E: «têm ganhado» = locução verbal ativa (auxiliar + particípio), não voz passiva.',
          'Gabarito C — travessão não obrigatório.',
          'Em similares: travessão explicativo/consequente — facultativo; teste omissão sem prejuízo.',
        ],
        footer_rule: 'C passa: travessão opcional.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRAVessão × TERMOS',
        rows: [
          { label: 'Travessão', value: 'Pode separar consequência — uso não obrigatório.' },
          { label: 'Adjunto adverbial', value: 'Modifica verbo — causa, tempo, modo (por isso, pela nostalgia).' },
          { label: 'Locução verbal', value: 'Auxiliar + particípio — não confundir com voz passiva.' },
          { label: 'Nesta questão', value: 'C — travessão não obrigatório' },
        ],
        footer_rule: 'Omitir travessão não quebra a oração.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises incorretas do excerto',
        items: [
          { label: 'A — «como» igual', detail: 'Ambos têm «como» — parecem mesma função.', correct: 'No excerto = comparação; em Barbie = exemplo — funções textuais distintas.' },
          { label: 'B — monossílabo tônico', detail: 'Acento em «têm» parece regra de monossílabo.', correct: '«Têm» é paroxítono; acento segue outra regra — afirmativa falsa.' },
          { label: 'D — pela = causa deslocada', detail: '«Pela nostalgia» parece adjunto inicial de causa.', correct: 'Modifica «guiado» no particípio, não oração inteira como em «Pela falta…».' },
          { label: 'E — voz passiva', detail: '«Têm ganhado» parece estrutura passiva.', correct: 'Locução verbal ativa (pretérito perfeito composto) — sujeito «brinquedos» age.' },
          { label: 'Em outra banca…', detail: 'Trocam travessão por ponto e vírgula.', correct: 'Mesmo teste: pontuação explicativa facultativa.' },
        ],
        footer_rule: 'C: travessão não obrigatório.',
      },
    ],
  },

  'avancasp-odessa-termos-so-adjetiva-3962452': {
    family: 'conceito',
    source_tec_id: '3962452',
    source_note: '«só» adjetiva/sozinho — AVANÇASP AFar Pref Nova Odessa 2026 tec 3962452',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AFar (Pref Nova Odessa)',
      orgao: 'Pref. Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Isso é parte da beleza de toda a literatura. Você descobre que seus desejos são universais, que você não está só e isolado de todo o mundo.» (F. Scott Fitzgerald) A palavra destacada no pensamento acima é de natureza:',
    options: [
      { id: 'A', text: 'adverbial, indicando circunstância de «está», sinônima de «somente».', is_correct: false },
      { id: 'B', text: 'adverbial, indicando circunstância de «está», sinônima de «sozinho».', is_correct: false },
      { id: 'C', text: 'adjetiva, qualificando «você», sinônima de «somente».', is_correct: false },
      { id: 'D', text: 'adjetiva, qualificando «você», sinônima de «sozinho».', is_correct: true },
      { id: 'E', text: 'substantiva, nomeando um ser, sinônima de «apenas».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«Só» — modifica quem?',
        meta: slideMeta,
        items: [
          { label: 'Não está só', detail: '«Só» qualifica o estado de «você» — adjetivo (sozinho).', icon: 'User' },
          { label: 'Modifica nome?', detail: 'Predicativo do sujeito «você» — função adjetiva.', icon: 'Box' },
          { label: '≠ Advérbio', detail: 'Se fosse advérbio, limitaria o verbo (somente está).', icon: 'Ban' },
          { label: 'Sinônimo', detail: 'Só = sozinho (isolado) — não «somente» (restrição).', icon: 'Sparkles' },
          { label: 'Pegadinha: somente', detail: '«Só» parece advérbio de restrição — contexto é solidão.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pergunta-teste: modifica verbo ou qualifica o sujeito?',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Citação Fitzgerald: «você não está só e isolado de todo o mundo».',
          '«Só» complementa o estado de «você» via verbo de ligação «está» — predicativo/adjetiva.',
          'Sentido: sozinho, isolado — não «somente» (restrição de ação).',
          'A/B: natureza adverbial circunstancia verbo — aqui qualifica sujeito.',
          'C: adjetiva certa, mas sinônimo errado — não é «somente».',
          'E: não nomeia ser — não é substantivo.',
          'Gabarito D — adjetiva, sinônimo de «sozinho».',
          'Em similares: não está só = predicativo adjetivo; teste sozinho × somente.',
        ],
        footer_rule: 'Só + isolado → adjetiva = sozinho.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SÓ — MATRIZ',
        rows: [
          { label: 'Adjetiva', value: 'Qualifica sujeito — sozinho, isolado.' },
          { label: 'Adverbial', value: 'Modifica verbo — somente, apenas (restrição).' },
          { label: 'Pergunta-teste', value: 'Modifica verbo? → adv. · Qualifica você? → adj.' },
          { label: 'Nesta questão', value: 'D — adjetiva, sinônimo de sozinho' },
        ],
        footer_rule: 'Contexto solidão → só = sozinho.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Só × somente × sozinho',
        items: [
          { label: 'A — adv. somente', detail: '«Só» parece restritivo do verbo «está».', correct: 'Qualifica «você» (sozinho) — natureza adjetiva, não advérbio.' },
          { label: 'B — adv. sozinho', detail: 'Sentido de solidão parece advérbio.', correct: 'Sozinho é adjetivo/predicativo; «só» aqui não circunstancia verbo.' },
          { label: 'C — adj. somente', detail: 'Adjetiva parece certa, sinônimo errado.', correct: 'Adjetiva sim, mas sinônimo é «sozinho», não «somente».' },
          { label: 'E — substantiva', detail: '«Só» parece nome de condição.', correct: 'Não nomeia ser — função adjetiva predicativa.' },
          { label: 'Em outra banca…', detail: 'Trocam por «você está apenas».', correct: '«Apenas» aí seria advérbio — contexto muda o teste.' },
        ],
        footer_rule: 'D: adjetiva, sinônimo de sozinho.',
      },
    ],
  },

  'selecon-fesaude-termos-adv-intercalados-3990813': {
    family: 'text_fragment',
    source_tec_id: '3990813',
    source_note: 'Adv. intercalados tempo/meio — SELECON ACS FeSaúde 2026 tec 3990813',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (FeSaúde)',
      orgao: 'FeSaúde',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «[...] receberam, no começo de abril, pelo aplicativo SouGov, convite para participar do estudo», as vírgulas que isolam «no começo de abril» e «pelo aplicativo SouGov» têm função sintática de:',
    text_fragment:
      '<p>Pesquisa Ipea sobre desinformação e políticas públicas (JB, abr/2026). «Os servidores que compõem o universo do estudo receberam, <strong>no começo de abril</strong>, <strong>pelo aplicativo SouGov</strong>, convite para participar do estudo.»</p>',
    options: [
      {
        id: 'A',
        text: 'marcar vocativo intercalado, pois os segmentos se dirigem diretamente ao interlocutor servidor convidado a participar',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'isolar adjuntos adverbiais intercalados de tempo e de meio, pois foram deslocados de sua posição canônica pós-verbal na oração',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'demarcar aposto explicativo referente ao sujeito «servidores», pois especificam as condições em que eles exercem suas funções',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'separar orações coordenadas assindéticas de igual valor informativo, pois os dois segmentos estabelecem relação de adição entre si',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgulas — adjuntos intercalados',
        meta: slideMeta,
        items: [
          { label: 'Receberam', detail: 'Verbo nuclear — ação dos servidores.', icon: 'CornerDownRight' },
          { label: 'No começo de abril', detail: 'Quando? — adjunto adverbial de tempo (intercalado).', icon: 'Calendar' },
          { label: 'Pelo aplicativo SouGov', detail: 'Por qual meio? — adjunto adverbial de meio (intercalado).', icon: 'Smartphone' },
          { label: 'Modifica verbo', detail: 'Circunstâncias de tempo e meio — função sintática acessória.', icon: 'Check' },
          { label: 'Pegadinha: vocativo', detail: '«Servidores» parece interlocutor chamado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adjuntos adverbiais intercalados = vírgulas de isolamento.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Ipea/SouGov: vírgulas isolam dois trechos entre verbo e objeto.',
          '«No começo de abril» — quando receberam? → adjunto adverbial de tempo.',
          '«Pelo aplicativo SouGov» — por qual meio? → adjunto adverbial de meio.',
          'Posição canônica seria pós-verbal; deslocamento gera intercalação + vírgulas.',
          'A: não há vocativo — servidores é sujeito, não chamamento.',
          'C: não é aposto — modifica verbo, não explica «servidores».',
          'D: não são orações coordenadas — são termos acessórios de uma só oração.',
          'Gabarito B — adjuntos adverbiais intercalados de tempo e de meio.',
          'Em similares: vírgulas entre verbo e OD → adjuntos adverbiais deslocados/intercalados.',
        ],
        footer_rule: 'Tempo + meio intercalados = adv. adverbiais.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO ADVERBIAL',
        rows: [
          { label: 'Modifica verbo?', value: 'Quando? onde? como? por qual meio? → adjunto adverbial.' },
          { label: 'Intercalado', value: 'Deslocado do fim — vírgulas isolam o termo.' },
          { label: '× Vocativo', value: 'Chama interlocutor — não circunstancia verbo.' },
          { label: '× Aposto', value: 'Explica termo anterior — não modifica verbo.' },
          { label: 'Nesta questão', value: 'B — tempo + meio intercalados' },
        ],
        footer_rule: 'Abril = tempo · SouGov = meio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função das vírgulas',
        items: [
          { label: 'A — vocativo', detail: 'Servidores convidados parecem interlocutores.', correct: 'Servidores é sujeito; trechos circunstanciam «receberam» — adjuntos adverbiais.' },
          { label: 'C — aposto', detail: 'Segmentos parecem explicar quem são os servidores.', correct: 'Aposto identifica nome; aqui modifica verbo (quando/por qual meio).' },
          { label: 'D — coordenadas', detail: 'Dois trechos parecem orações somadas.', correct: 'Uma oração só — termos acessórios intercalados, não coordenação.' },
          { label: 'Em outra banca…', detail: 'Trocam por «em maio, por e-mail».', correct: 'Mesma matriz: tempo + meio = adjuntos adverbiais intercalados.' },
        ],
        footer_rule: 'B: adjuntos adverbiais intercalados.',
      },
    ],
  },

  'cpcon-itabaiana-termos-conta-luz-4014460': {
    family: 'text_fragment',
    source_tec_id: '4014460',
    source_note: 'de luz (AAdj) + de novo (Adv) — CPCON UEPB ACS Pref Itabaiana 2026 tec 4014460',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Itabaiana)',
      orgao: 'Pref. Itabaiana',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Na oração «Por que a conta de luz subiu de novo?!», é CORRETO afirmar que os elementos em destaque são:',
    text_fragment:
      '<p>Charge juniao.com.br (fev/2026). Personagem indignada: «Por que a conta <strong>de luz</strong> subiu <strong>de novo</strong>?!»</p>',
    options: [
      { id: 'A', text: 'complementos nominais.', is_correct: false },
      { id: 'B', text: 'adjuntos adnominais.', is_correct: false },
      { id: 'C', text: 'adjunto adnominal e adjunto adverbial, respectivamente.', is_correct: true },
      { id: 'D', text: 'complemento nominal e adjunto adverbial, respectivamente.', is_correct: false },
      { id: 'E', text: 'adjuntos adverbiais.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois destaques — duas funções',
        chip_label: 'Matriz simples',
        meta: slideMeta,
        items: [
          { label: 'Charge juniao', detail: 'Personagem indignada — contexto da charge sobre energia.', icon: 'Zap' },
          { label: 'Conta de luz', detail: '«De luz» caracteriza «conta» — adjunto adnominal.', icon: 'Box' },
          { label: 'Subiu de novo', detail: '«De novo» circunstancia «subiu» — adjunto adverbial.', icon: 'CornerDownRight' },
          { label: 'Modifica nome?', detail: 'De luz → qual conta? — adjunto adnominal.', icon: 'Check' },
          { label: 'Modifica verbo?', detail: 'De novo → como/quando subiu? — adjunto adverbial.', icon: 'Repeat' },
          { label: 'Pegadinha: ambos adv.', detail: '«De» nos dois parece mesma função — teste o núcleo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Um modifica nome · outro modifica verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Luz → novo',
        meta: slideMeta,
        steps: [
          'Charge juniao.com.br: classificar «de luz» e «de novo» separadamente.',
          'T1 «de luz»: modifica «conta» (qual conta?) — adjunto adnominal.',
          'T2 «de novo»: modifica «subiu» (repetição/frequência) — adjunto adverbial.',
          'A: nenhum completa nome com regência obrigatória — não são complementos nominais.',
          'B: só o primeiro é adnominal; «de novo» modifica verbo.',
          'D: «de luz» não é complemento nominal — é adjunto adnominal.',
          'E: «de luz» não circunstancia verbo — não são ambos adverbiais.',
          'Gabarito C — adjunto adnominal + adjunto adverbial.',
          'Em similares: pergunta-teste por termo — modifica nome? modifica verbo?',
        ],
        footer_rule: 'De luz = nome · de novo = verbo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PERGUNTA → CARGO',
        rows: [
          { label: 'Modifica nome?', value: 'De luz → adjunto adnominal (qual conta?).' },
          { label: 'Modifica verbo?', value: 'De novo → adjunto adverbial (repetição).' },
          { label: 'De quê? + prep.', value: 'Complemento nominal — completa substantivo com regência.' },
          { label: 'Nesta questão', value: 'C — AAdj + Adv (de luz · de novo)' },
        ],
        footer_rule: 'Dois «de» — funções sintáticas distintas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par de termos — trocar cargos',
        items: [
          { label: 'A — ambos CN', detail: '«De luz» e «de novo» parecem completar nomes.', correct: 'Só «de luz» liga a «conta»; «de novo» circunstancia verbo — não CN.' },
          { label: 'B — ambos AAdj', detail: 'Dois «de + palavra» parecem iguais.', correct: '«De novo» modifica «subiu» — adjunto adverbial, não adnominal.' },
          { label: 'D — CN + Adv', detail: '«De luz» parece complemento obrigatório de «conta».', correct: '«De luz» caracteriza conta — adjunto adnominal, não complemento nominal.' },
          { label: 'E — ambos Adv', detail: '«De novo» puxa «de luz» para advérbio.', correct: '«De luz» modifica nome «conta» — adjunto adnominal.' },
          { label: 'Em outra banca…', detail: 'Trocam por «conta de água subiu outra vez».', correct: 'Mesma matriz: tipo de conta (AAdj) + repetição (Adv).' },
        ],
        footer_rule: 'C: adjunto adnominal e adjunto adverbial.',
      },
    ],
  },

  'cpcon-nova-floresta-termos-aposto-quintal-4018200': {
    family: 'text_fragment',
    source_tec_id: '4018200',
    source_note: 'Aposto «esquecido quase sempre» — CPCON UEPB Ag Adm Pref Nova Floresta 2026 tec 4018200',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref Nova Floresta)',
      orgao: 'Pref. Nova Floresta',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe o trecho: «O quintal, esquecido quase sempre, virou chão enervurado das raízes das árvores com troncos empanturrados e galhos que se emaranhavam entre si.» Nesse período, a expressão em destaque exerce a função de:',
    text_fragment:
      '<p>«O Jardim e o Quintal» (literaturabr.com). Contraste jardim × quintal. «O quintal, <strong>esquecido quase sempre</strong>, virou chão enervurado das raízes das árvores com troncos empanturrados e galhos que se emaranhavam entre si.»</p>',
    options: [
      { id: 'A', text: 'aposto.', is_correct: true },
      { id: 'B', text: 'vocativo.', is_correct: false },
      { id: 'C', text: 'adjunto adverbial.', is_correct: false },
      { id: 'D', text: 'adjunto adnominal.', is_correct: false },
      { id: 'E', text: 'conjunção integrante.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quintal — esclarecimento',
        meta: slideMeta,
        items: [
          { label: 'O quintal', detail: 'Núcleo nominal — termo a ser caracterizado.', icon: 'Box' },
          { label: 'Esquecido quase sempre', detail: 'Explica estado do quintal — aposto explicativo.', icon: 'GitBranch' },
          { label: 'Aposto', detail: 'Termo acessório entre vírgulas — mesma referência do quintal.', icon: 'Check' },
          { label: '≠ Adjunto adnominal', detail: 'Aposto explica/identifica; adjunto adnominal caracteriza de forma mais integrada.', icon: 'XCircle' },
          { label: 'Pegadinha: adv. adverbial', detail: '«Quase sempre» parece circunstância de tempo do verbo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vírgulas + explicação do termo anterior → aposto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto «O Jardim e o Quintal»: isolar «esquecido quase sempre» entre vírgulas.',
          'Termo anterior: «O quintal» — mesmo referente (o quintal é que estava esquecido).',
          'Função: aposto explicativo — esclarece o estado do quintal.',
          'B: não chama interlocutor — não é vocativo.',
          'C: não circunstancia «virou» diretamente — qualifica o quintal.',
          'D: adjunto adnominal seria mais integrado (ex.: «o quintal esquecido»); aqui é aposto intercalado.',
          'E: não há oração subordinada substantiva — não é conjunção integrante.',
          'Gabarito A — aposto.',
          'Em similares: nome, explicação entre vírgulas → aposto explicativo.',
        ],
        footer_rule: 'Quintal, esquecido quase sempre, = aposto.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'APOSTO × ADJUNTO',
        rows: [
          { label: 'Aposto', value: 'Explica/identifica termo anterior — mesma referência.' },
          { label: 'Adjunto adnominal', value: 'Modifica nome — característica (de quê?).' },
          { label: 'Adjunto adverbial', value: 'Modifica verbo — quando? como?' },
          { label: 'Vocativo', value: 'Chama interlocutor — isolado por vírgula.' },
          { label: 'Nesta questão', value: 'A — aposto' },
        ],
        footer_rule: 'Esquecido quase sempre explica o quintal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função do destaque',
        items: [
          { label: 'B — vocativo', detail: '«Quintal» parece chamamento poético.', correct: 'Quintal é sujeito da oração; destaque explica o nome — aposto.' },
          { label: 'C — adjunto adverbial', detail: '«Quase sempre» parece tempo do verbo «virou».', correct: 'Qualifica o quintal (esquecido), não circunstancia o verbo isoladamente.' },
          { label: 'D — adjunto adnominal', detail: '«Esquecido» parece caracterizar quintal como adjunto.', correct: 'Banca classifica como aposto explicativo intercalado — A.' },
          { label: 'E — conjunção integrante', detail: 'Oração longa parece subordinada.', correct: 'Não introduz oração subordinada substantiva — aposto.' },
          { label: 'Em outra banca…', detail: 'Trocam por «o sótão, abandonado há anos,».', correct: 'Mesmo padrão: aposto explicativo entre vírgulas.' },
        ],
        footer_rule: 'A: aposto explicativo do quintal.',
      },
    ],
  },

  'apice-monteiro-termos-tardiamente-4024881': {
    family: 'text_fragment',
    source_tec_id: '4024881',
    source_note: 'As (AAdj) + tardiamente (Adv) — Ápice ACS Pref Monteiro 2026 tec 4024881',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref. Monteiro',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho: «As universidades chegaram tardiamente ao país.», os segmentos destacados exercem, respectivamente, papel sintático de:',
    text_fragment:
      '<p>«As universidades e o desafio da desigualdade social» (Folha, abr/2026). «<strong>As</strong> universidades chegaram <strong>tardiamente</strong> ao país.»</p>',
    options: [
      { id: 'A', text: 'adjunto adnominal e adjunto adverbial.', is_correct: true },
      { id: 'B', text: 'predicativo do sujeito e adjunto adverbial.', is_correct: false },
      { id: 'C', text: 'adjunto adverbial e adjunto adnominal.', is_correct: false },
      { id: 'D', text: 'complemento nominal e adjunto adnominal.', is_correct: false },
      { id: 'E', text: 'adjunto adnominal e complemento verbal.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'As + tardiamente',
        chip_label: 'Matriz simples',
        meta: slideMeta,
        items: [
          { label: 'As universidades', detail: '«As» acompanha/determina «universidades» — adjunto adnominal.', icon: 'Box' },
          { label: 'Chegaram tardiamente', detail: '«Tardiamente» circunstancia «chegaram» — adjunto adverbial.', icon: 'CornerDownRight' },
          { label: 'Modifica nome?', detail: 'Artigo/determinante → adjunto adnominal.', icon: 'Check' },
          { label: 'Modifica verbo?', detail: 'Advérbio de modo/tempo → adjunto adverbial.', icon: 'Clock' },
          { label: 'Pegadinha: inverter', detail: 'Trocar ordem dos cargos entre As e tardiamente.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Determinante modifica nome · advérbio modifica verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'As → tardiamente',
        meta: slideMeta,
        steps: [
          'Texto desigualdade/universidades: classificar «As» e «tardiamente» em separado.',
          'T1 «As»: determina «universidades» — adjunto adnominal (artigo).',
          'T2 «tardiamente»: circunstancia «chegaram» (modo/tempo) — adjunto adverbial.',
          'B: «tardiamente» não é predicativo do sujeito — não vem após verbo de ligação.',
          'C: inverte os cargos — As modifica nome, não verbo.',
          'D/E: não há complemento nominal nem complemento verbal no par destacado.',
          'Gabarito A — adjunto adnominal + adjunto adverbial.',
          'Em similares: artigo/determinante = AAdj; advérbio após verbo = adjunto adverbial.',
        ],
        footer_rule: 'As = nome · tardiamente = verbo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PERGUNTA → CARGO',
        rows: [
          { label: 'Modifica nome?', value: 'As (artigo) → adjunto adnominal.' },
          { label: 'Modifica verbo?', value: 'Tardiamente → adjunto adverbial (modo/tempo).' },
          { label: '× Predicativo', value: 'Atribui estado ao sujeito via verbo de ligação.' },
          { label: '× Complemento nominal', value: 'Completa nome com prep. obrigatória — não é o caso.' },
          { label: 'Nesta questão', value: 'A — AAdj + Adv' },
        ],
        footer_rule: 'Par clássico: determinante + advérbio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar cargos do par',
        items: [
          { label: 'B — pred. + adv.', detail: '«Tardiamente» parece atributo de «universidades».', correct: 'Tardiamente modifica verbo chegaram; As modifica nome — A.' },
          { label: 'C — adv. + AAdj', detail: 'Inverte a ordem dos cargos entre os termos.', correct: 'As determina universidades (AAdj); tardiamente circunstancia verbo (Adv).' },
          { label: 'D — CN + AAdj', detail: '«As» parece complemento de «universidades».', correct: 'Artigo é adjunto adnominal, não complemento nominal.' },
          { label: 'E — AAdj + compl. verbal', detail: '«Tardiamente» parece complemento obrigatório.', correct: 'Tardiamente é circunstância acessória — adjunto adverbial.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Os hospitais surgiram lentamente».', correct: 'Mesma matriz: artigo (AAdj) + advérbio (Adv).' },
        ],
        footer_rule: 'A: adjunto adnominal e adjunto adverbial.',
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
