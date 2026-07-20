#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — termos-oracao-g04 (7 slugs · Termos da oração · lote 4/4 · card 31/31).
 *
 *   npx tsx scripts/handcraft-termos-oracao-g04.ts
 *   npm run audit:questao-readiness -- --lote=termos-oracao-g04 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=termos-oracao-g04 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'termos-oracao-g04';
const SUBTOPICO = 'Termos da oração';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_termos_oracao';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-termos-matrix-folhetos.json';

const TERMOS_SOURCE = {
  id: 'pt-termos-oracao-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Termos da oração — objetos, complementos, agente da passiva, adjuntos',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'objeto direto e indireto',
    'complemento nominal',
    'agente da passiva',
    'adjunto adnominal',
    'transitividade verbal',
    'regência de explicar',
    'pronome relativo',
    'vocativo',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment' | 'certo_errado' | 'vf';

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
      reviewer: 'handcraft:termos-oracao-g04',
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
  'educa-pb-ibiara-termos-virgula-sim-3820032': {
    family: 'text_fragment',
    source_tec_id: '3820032',
    source_note: 'Vírgula após «Sim,» — elemento intercalado — EDUCA PB Ibiara 2025 tec 3820032',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACE (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Na fala do planeta — «Sim, e o meu atual sonho de consumo é ter consumidores mais conscientes.» — a vírgula após a palavra destacada desempenha a função de:',
    text_fragment:
      '<p>Charge (Tribuna Ribeirão, 15/03/2025). Na fala do planeta: «<strong>Sim,</strong> e o meu atual sonho de consumo é ter consumidores mais conscientes.»</p>',
    options: [
      { id: 'A', text: 'Marcar a omissão de um verbo subentendido.', is_correct: false },
      { id: 'B', text: 'Separar um vocativo.', is_correct: false },
      { id: 'C', text: 'Indicar a inversão da ordem direta da oração.', is_correct: false },
      { id: 'D', text: 'Isolar um elemento intercalado que introduz a resposta.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sim, — vírgula',
        chip_label: 'Termos da oração',
        meta: slideMeta,
        items: [
          { label: 'Sim,', detail: 'Elemento intercalado — introduz resposta afirmativa do planeta.', icon: 'MessageCircle' },
          { label: 'Vírgula', detail: 'Isola o termo inserido no meio da fala — não é vocativo.', icon: 'Pause' },
          { label: '≠ Vocativo', detail: 'Vocativo chama interlocutor — «Sim» não modifica verbo nem nome.', icon: 'UserX' },
          { label: 'Termos da oração', detail: 'Função sintática da vírgula — não é adjunto adverbial nem adjunto adnominal.', icon: 'List' },
          { label: '≠ Vicária', detail: 'Não há elipse de verbo — resposta direta após «Sim,».', icon: 'XCircle' },
          { label: 'Pegadinha: vocativo', detail: '«Sim» parece chamamento — mas introduz resposta.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vírgula após «Sim,» isola elemento intercalado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Fala do planeta',
        meta: slideMeta,
        steps: [
          'Charge Tribuna Ribeirão: isolar «Sim,» na fala do planeta.',
          '«Sim» introduz a resposta — elemento intercalado, não vocativo.',
          'Vírgula isola o termo que antecede a continuação da fala.',
          'A: não há elipse de verbo marcada por vírgula vicária.',
          'B: não chama interlocutor — não é vocativo.',
          'C: não inverte ordem direta da oração.',
          'Gabarito D — isolar elemento intercalado que introduz resposta.',
          'Em similares: «Sim,» / «Não,» no início de resposta → vírgula isola intercalado.',
        ],
        footer_rule: 'Sim, + vírgula = elemento intercalado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VÍRGULA × FUNÇÃO',
        rows: [
          { label: 'Elemento intercalado', value: 'Vírgula isola termo inserido — introduz resposta.' },
          { label: 'Vocativo', value: 'Chama interlocutor — não modifica verbo nem nome.' },
          { label: 'Adjunto adverbial', value: 'Modifica verbo — circunstância; não é o caso de «Sim,».' },
          { label: 'Vírgula vicária', value: 'Marca elipse de verbo.' },
          { label: 'Nesta questão', value: 'D — isolar elemento intercalado' },
        ],
        footer_rule: 'Sim, na charge = intercalado, não vocativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função da vírgula após Sim',
        items: [
          { label: 'A — verbo subentendido', detail: '«Sim» parece completar verbo omitido.', correct: 'Não é vírgula vicária — «Sim» introduz resposta intercalada.' },
          { label: 'B — vocativo', detail: 'Fala direta parece chamamento.', correct: 'Planeta não chama ninguém — elemento intercalado, não vocativo.' },
          { label: 'C — inversão', detail: 'Ordem parece deslocada.', correct: 'Vírgula isola intercalado, não marca inversão sintática.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Bem, eu concordo.»', correct: 'Mesmo padrão: vírgula isola elemento que introduz resposta.' },
        ],
        footer_rule: 'D: elemento intercalado.',
      },
    ],
  },

  'apice-boa-vista-termos-vocativo-gente-3951799': {
    family: 'text_fragment',
    source_tec_id: '3951799',
    source_note: 'Vocativo «Gente» — Ápice Boa Vista PB 2025 tec 3951799',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Boa Vista PB)',
      orgao: 'Pref. Boa Vista PB',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Sobre o uso da vírgula no seguinte trecho: «Gente, eu só queria paz e um boleto pago. É pedir muito?», presente no 5º parágrafo do texto, identifique a afirmativa verdadeira:',
    text_fragment:
      '<p>«Adultização dos adultos» (Francisco Escorsim / Gazeta do Povo). Trecho do 5º parágrafo: «<strong>Gente,</strong> eu só queria paz e um boleto pago. É pedir muito?» O autor reclama da reação nas redes — vaidade ferida, mimimi virtual. Antes, no 3º parágrafo: «O que dizer, <strong>então,</strong> de políticos que advogam pela liberdade sexual…» — vírgula em «então» isola elemento intercalado, não vocativo.</p>',
    options: [
      { id: 'A', text: 'ocorreu para isolar um predicativo do sujeito deslocado do predicado verbo-nominal.', is_correct: false },
      { id: 'B', text: 'ocorreu pelo mesmo motivo que se utilizou para isolar o termo «então», no seguinte trecho: «O que dizer, então, de políticos que advogam pela liberdade sexual», presente no 3º parágrafo do texto.', is_correct: false },
      { id: 'C', text: 'ocorreu para isolar um sujeito simples deslocado.', is_correct: false },
      { id: 'D', text: 'ocorreu para isolar o vocativo.', is_correct: true },
      { id: 'E', text: 'ocorreu para isolar aposto.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gente, — vocativo',
        meta: slideMeta,
        items: [
          { label: 'Gente', detail: 'Chama o leitor/interlocutor — vocativo no 5º parágrafo.', icon: 'Users' },
          { label: 'Vírgula', detail: 'Isola vocativo do restante da oração.', icon: 'Pause' },
          { label: '≠ Então', detail: '«Então» no 3º parágrafo é elemento intercalado — função diferente.', icon: 'GitBranch' },
          { label: '≠ Aposto', detail: 'Aposto explica termo anterior — «Gente» chama, não modifica nome.', icon: 'XCircle' },
          { label: 'Função sintática', detail: 'Vocativo é termo acessório — não é adjunto adnominal nem adjunto adverbial.', icon: 'List' },
          { label: 'Pegadinha: então', detail: 'B compara com «então» — mas «Gente» é vocativo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vocativo + vírgula = chamamento ao interlocutor.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Escorsim adultização: trecho «Gente, eu só queria paz e um boleto pago.»',
          '«Gente» chama o leitor — vocativo isolado por vírgula.',
          'A: não há predicativo do sujeito deslocado.',
          'B: «então» é elemento intercalado — função distinta de vocativo.',
          'C: sujeito é «eu» — «Gente» não é sujeito deslocado.',
          'E: não explica termo anterior — não é aposto.',
          'Gabarito D — vírgula isola o vocativo.',
          'Em similares: nome + vírgula + eu/verbo → vocativo, não intercalado.',
        ],
        footer_rule: 'Gente, = vocativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VOCATIVO × INTERCALADO',
        rows: [
          { label: 'Vocativo', value: 'Chama interlocutor — Gente, eu… — não modifica verbo.' },
          { label: 'Adjunto adnominal', value: 'Modifica nome — não é função de «Gente».' },
          { label: 'Elemento intercalado', value: 'Insere termo no meio — então, pois, aliás.' },
          { label: 'Pontuação', value: 'Vírgula(s) isolam vocativo ou intercalado.' },
          { label: 'Nesta questão', value: 'D — isolar o vocativo' },
        ],
        footer_rule: 'Gente chama — vocativo; então insere — intercalado.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgula em Gente vs então',
        items: [
          { label: 'A — pred. sujeito', detail: '«Paz e boleto» parecem predicativo.', correct: 'Destaque é «Gente» — vocativo, não predicativo deslocado.' },
          { label: 'B — como então', detail: 'Ambos têm vírgula — parecem iguais.', correct: '«Então» é intercalado; «Gente» é vocativo — funções distintas.' },
          { label: 'C — sujeito deslocado', detail: '«Gente» parece sujeito de «queria».', correct: 'Sujeito é eu; Gente chama — vocativo.' },
          { label: 'E — aposto', detail: 'Termo parece explicar algo anterior.', correct: 'Chama interlocutor — vocativo, não aposto.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Pessoal, cadê a maturidade?»', correct: 'Mesmo padrão: vocativo + vírgula.' },
        ],
        footer_rule: 'D: isolar o vocativo.',
      },
    ],
  },

  'apice-monteiro-termos-cn-embora-tardio-4024901': {
    family: 'text_fragment',
    source_tec_id: '4024901',
    source_note: 'CN «Embora tardio» — Ápice ACS Pref Monteiro 2026 tec 4024901',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref. Monteiro',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho: «Embora tardio, o Brasil adotou relativamente cedo o modelo de universidades públicas, em princípio abertas a todos. Na prática, porém, essas instituições continuaram acessíveis a uma parcela reduzida da sociedade», o elemento destacado exerce função sintática de:',
    text_fragment:
      '<p>«As universidades e o desafio da desigualdade social» (Cesar Martins / Folha). «<strong>Embora tardio</strong>, o Brasil adotou relativamente cedo o modelo de universidades públicas, em princípio abertas a todos. Na prática, porém, essas instituições continuaram acessíveis a uma parcela reduzida da sociedade.»</p>',
    options: [
      { id: 'A', text: 'complemento nominal.', is_correct: true },
      { id: 'B', text: 'adjunto adnominal.', is_correct: false },
      { id: 'C', text: 'objeto indireto.', is_correct: false },
      { id: 'D', text: 'predicativo do sujeito.', is_correct: false },
      { id: 'E', text: 'adjunto adverbial.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'CN × adjunto adnominal',
        chip_label: 'Modifica nome',
        meta: slideMeta,
        items: [
          { label: 'Tardio', detail: 'Completa ideia nominal implícita (o atraso) — complemento nominal.', icon: 'Box' },
          { label: 'Embora', detail: 'Concessiva — liga «tardio» ao núcleo omitido no trecho do Brasil.', icon: 'Link' },
          { label: 'Universidades públicas', detail: 'Contexto Folha — Brasil adotou modelo aberto em princípio.', icon: 'GraduationCap' },
          { label: '≠ Adjunto adnominal', detail: 'AAdj modifica nome explícito; aqui completa nome subentendido.', icon: 'XCircle' },
          { label: '≠ Adv. adverbial', detail: 'Não circunstancia verbo adotou — qualifica ideia nominal.', icon: 'Ban' },
          { label: 'Pegadinha: AAdj', detail: '«Tardio» parece adjetivo de Brasil — mas estrutura é CN elíptica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'CN completa nome; adjunto adnominal modifica nome explícito.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Folha «As universidades e o desafio da desigualdade social»: isolar «Embora tardio». ',
          '«O Brasil adotou relativamente cedo o modelo de universidades públicas» — contexto do trecho.',
          'Instituições continuaram acessíveis a parcela reduzida da sociedade — desigualdade na prática.',
          '«Tardio» completa ideia nominal (o atraso da adoção) — complemento nominal.',
          'Pergunta: modifica verbo ou nome? → completa núcleo nominal implícito (CN).',
          'B: adjunto adnominal exigiria nome explícito modificado diretamente.',
          'C: não completa verbo transitivo — não é objeto indireto.',
          'D: não vem após verbo de ligação com sujeito Brasil.',
          'E: não circunstancia verbo — não é adjunto adverbial.',
          'Gabarito A — complemento nominal.',
          'Em similares: Embora + adj. elíptico → CN; adj. junto ao nome → adjunto adnominal.',
        ],
        footer_rule: 'Embora tardio = complemento nominal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CN × ADJUNTO ADNOMINAL',
        rows: [
          { label: 'Complemento nominal', value: 'Completa substantivo — de quê? (prep. + nome/adj.)' },
          { label: 'Adjunto adnominal', value: 'Modifica nome explícito — característica.' },
          { label: '× Adv. adverbial', value: 'Modifica verbo — circunstância.' },
          { label: 'Nesta questão', value: 'A — complemento nominal (elemento destacado)' },
        ],
        footer_rule: 'Matriz CN×AAdj: tardio completa ideia nominal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Embora tardio — qual cargo?',
        items: [
          { label: 'B — adjunto adnominal', detail: '«Tardio» parece qualificar «Brasil».', correct: 'Estrutura elíptica completa ideia nominal — complemento nominal.' },
          { label: 'C — objeto indireto', detail: '«Embora» induz prep. = OI.', correct: 'Não completa verbo; completa nome implícito.' },
          { label: 'D — pred. sujeito', detail: '«Tardio» parece atributo de Brasil.', correct: 'Não há verbo de ligação ligando tardio ao sujeito.' },
          { label: 'E — adv. adverbial', detail: 'Concessiva parece circunstância verbal.', correct: 'Qualifica ideia nominal, não modifica verbo adotou.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Embora difícil, a tarefa…»', correct: 'Mesma matriz: CN elíptico com Embora.' },
        ],
        footer_rule: 'A: complemento nominal.',
      },
    ],
  },

  'avancasp-sm-arcanjo-termos-comparativo-igualdade-3709824': {
    family: 'conceito',
    source_tec_id: '3709824',
    source_note: 'Comparativo igualdade «tão… quanto» — AVANÇASP SM Arcanjo 2025 tec 3709824',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref SM Arcanjo)',
      orgao: 'Pref. SM Arcanjo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o exemplo abaixo: A sala de Clarice é tão bonita quanto a sala de Ruth. Assinale a alternativa que indica a correta flexão do adjetivo em relação ao grau comparativo:',
    options: [
      { id: 'A', text: 'Grau comparativo de inferioridade.', is_correct: false },
      { id: 'B', text: 'Grau comparativo de igualdade.', is_correct: true },
      { id: 'C', text: 'Grau comparativo de superioridade analítico.', is_correct: false },
      { id: 'D', text: 'Grau comparativo de superioridade sintético.', is_correct: false },
      { id: 'E', text: 'Grau comparativo de superioridade relativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tão… quanto',
        meta: slideMeta,
        items: [
          { label: 'Sala de Clarice', detail: 'Núcleo + adjuntos adnominais «de Clarice» — modifica nome sala.', icon: 'Home' },
          { label: 'Sala de Ruth', detail: '«De Ruth» — adjunto adnominal paralelo ao de Clarice.', icon: 'Home' },
          { label: 'Tão bonita quanto', detail: 'Marcador de grau comparativo de igualdade.', icon: 'Equal' },
          { label: 'Adjunto adnominal', detail: '«De Clarice» / «de Ruth» caracterizam o substantivo sala.', icon: 'Box' },
          { label: 'Pegadinha: superioridade', detail: '«Bonita» induz mais/menos — mas estrutura é tão… quanto.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Tão + adj. + quanto = igualdade entre dois termos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Exemplo: «A sala de Clarice é tão bonita quanto a sala de Ruth.»',
          'Marcadores: tão + bonita + quanto — grau comparativo de igualdade.',
          '«De Clarice» e «de Ruth» são adjuntos adnominais — modifica nome sala.',
          'A: inferioridade = menos… do que — não é o caso.',
          'C/D/E: superioridade = mais… que / -íssimo — estrutura diferente.',
          'Gabarito B — grau comparativo de igualdade.',
          'Em similares: tão… quanto / tão… como → igualdade; mais… que → superioridade.',
        ],
        footer_rule: 'Tão bonita quanto = igualdade.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GRAUS COMPARATIVOS',
        rows: [
          { label: 'Igualdade', value: 'Tão + adj. + quanto/como' },
          { label: 'Superioridade', value: 'Mais + adj. + que / -íssimo' },
          { label: 'Inferioridade', value: 'Menos + adj. + que' },
          { label: 'Adjunto adnominal', value: 'De Clarice/de Ruth — modifica nome sala' },
          { label: 'Nesta questão', value: 'B — comparativo de igualdade' },
        ],
        footer_rule: 'Tão… quanto fixa igualdade.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Grau do comparativo',
        items: [
          { label: 'A — inferioridade', detail: '«Menos bonita» não aparece — mas confunde.', correct: 'Estrutura é tão… quanto — igualdade, não inferioridade.' },
          { label: 'C — sup. analítico', detail: '«Mais bonita» parece próximo.', correct: 'Igualdade usa tão… quanto, não mais… que.' },
          { label: 'D — sup. sintético', detail: '«Boníssima» induz superlativo.', correct: 'Comparativo de igualdade — não sintético de superioridade.' },
          { label: 'E — sup. relativo', detail: 'Termo técnico confunde com analítico.', correct: 'Marcador explícito: tão… quanto = igualdade.' },
          { label: 'Em outra banca…', detail: 'Trocam por «tão alto quanto».', correct: 'Mesmo padrão: tão + adj. + quanto.' },
        ],
        footer_rule: 'B: grau comparativo de igualdade.',
      },
    ],
  },

  'apice-pocinhos-termos-vf-pronome-relativo-3558977': {
    family: 'vf',
    source_tec_id: '3558977',
    source_note: 'VF funções pronome relativo I–IV — Ápice Pocinhos 2025 tec 3558977',
    meta: {
      banca: 'Ápice',
      prova: 'ACE (Pref Pocinhos)',
      orgao: 'Pref. Pocinhos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Quanto às funções sintáticas do pronome relativo, analise as orações a seguir e classificações correspondentes.\n\nI - Comprei um livro que fez sucesso – O pronome relativo «que» exerce função sintática de sujeito;\n\nII - Sou o homem que você vai amar - O pronome relativo «que» exerce função sintática de adjunto adnominal;\n\nIII - Assisti a um filme do qual você vai gostar - O pronome relativo «do qual» exerce função sintática de objeto indireto;\n\nIV - Retornei a um lugar ao qual tinha aversão - O pronome relativo «ao qual» exerce função sintática de complemento nominal.\n\nApós análise das afirmativas e das classificações correspondentes, conclui-se que as afirmativas corretas são:',
    options: [
      { id: 'A', text: 'II e IV.', is_correct: false },
      { id: 'B', text: 'II e III.', is_correct: false },
      { id: 'C', text: 'I e II.', is_correct: false },
      { id: 'D', text: 'I, III e IV.', is_correct: true },
      { id: 'E', text: 'I, II, III e IV.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VF — pronome relativo',
        meta: slideMeta,
        items: [
          { label: 'I — que = sujeito', detail: '«Que fez sucesso» — que é sujeito de fez → CERTO.', icon: 'Check' },
          { label: 'II — falsa', detail: '«Que você vai amar» — que é OD, não adjunto adnominal.', icon: 'XCircle' },
          { label: 'III — do qual = OI', detail: 'Gostar de filme — do qual = objeto indireto → CERTO.', icon: 'Check' },
          { label: 'IV — ao qual = CN', detail: 'Aversão a lugar — ao qual = complemento nominal → CERTO.', icon: 'Check' },
          { label: 'Sequência', detail: 'I, III e IV corretas → gabarito D.', icon: 'ListOrdered' },
        ],
        footer_rule: 'VF: julgue cada afirmativa pela função do relativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Quatro orações-modelo com pronomes relativos.',
          'I: «que fez sucesso» — que = sujeito de fez → CERTO.',
          'II: «que você vai amar» — que = objeto direto de amar → ERRADO (não adjunto adnominal).',
          'III: «do qual você vai gostar» — gostar de = OI → do qual = objeto indireto → CERTO.',
          'IV: «ao qual tinha aversão» — aversão a = CN → ao qual = complemento nominal → CERTO.',
          'Gabarito D — I, III e IV.',
          'Em similares: relativo repete função do termo retomado — sujeito, OD, OI ou CN.',
        ],
        footer_rule: 'D = I, III e IV corretas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRONOME RELATIVO — FUNÇÃO',
        rows: [
          { label: 'I — sujeito', value: 'Que fez → que é sujeito de fez' },
          { label: 'II', value: 'Falsa — que = OD de amar' },
          { label: 'III — OI', value: 'Gostar de → do qual = objeto indireto' },
          { label: 'IV — CN', value: 'Aversão a → ao qual = complemento nominal' },
          { label: 'Nesta questão', value: 'D — I, III e IV' },
        ],
        footer_rule: 'Relativo herda cargo do antecedente na oração relativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sequências VF incorretas',
        items: [
          { label: 'A — II e IV', detail: 'II erra função de «que» em amar.', correct: 'I e III são corretas junto com IV — não A.' },
          { label: 'B — II e III', detail: 'III certa, mas II erra adjunto adnominal.', correct: 'I (sujeito) falta em B — gabarito D.' },
          { label: 'C — I e II', detail: 'I certa, mas II erra função do relativo.', correct: 'III e IV corretas — combinação é D.' },
          { label: 'E — todas', detail: 'II está errada — não pode entrar.', correct: 'II confunde OD com adjunto adnominal.' },
          { label: 'Em outra banca…', detail: 'Trocam «do qual» por «cujo».', correct: 'Mesmo teste: regência do verbo define cargo do relativo.' },
        ],
        footer_rule: 'D passa: I, III e IV.',
      },
    ],
  },

  'educa-pb-santa-cecilia-termos-pronome-relativo-mao-3746601': {
    family: 'text_fragment',
    source_tec_id: '3746601',
    source_note: 'Pronome relativo «que» — Augusto dos Anjos — EDUCA PB Santa Cecília 2025 tec 3746601',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Santa Cecília)',
      orgao: 'Pref. Santa Cecília PB',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Releia: «A mão que afaga é a mesma que apedreja.» No trecho acima, os termos destacados têm a função de:',
    text_fragment:
      '<p><em>Versos íntimos</em> — Augusto dos Anjos. «A <strong>mão que afaga</strong> é a mesma <strong>que apedreja</strong>. Se a alguém causa inda pena a tua chaga, apedreja essa mão vil que te afaga…»</p>',
    options: [
      { id: 'A', text: 'Introduzir orações subordinadas adverbiais e retomar elementos mencionados.', is_correct: false },
      { id: 'B', text: 'Substituir substantivos e retomar elementos já citados, garantindo coesão textual.', is_correct: true },
      { id: 'C', text: 'Indicar oposição entre ideias e retomar elementos já citados.', is_correct: false },
      { id: 'D', text: 'Adicionar informação nova sem retomar elementos já mencionado.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Que — pronome relativo',
        meta: slideMeta,
        items: [
          { label: 'Mão que afaga', detail: '«Que» retoma «mão» — pronome relativo, coesão.', icon: 'Link' },
          { label: 'Que apedreja', detail: 'Segundo «que» retoma a mesma mão — paralelismo.', icon: 'Link' },
          { label: 'Substitui substantivo', detail: 'Relativo repete o antecedente sem repetir «mão».', icon: 'RefreshCw' },
          { label: '≠ Adv. subordinada', detail: 'Não introduz circunstância — retoma nome.', icon: 'XCircle' },
          { label: 'Pegadinha: oposição', detail: 'Afagar × apedrejar parece contraste — mas função é relativa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pronome relativo retoma antecedente — coesão.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Augusto dos Anjos: «A mão que afaga é a mesma que apedreja.»',
          'Dois «que» retomam «mão» — pronomes relativos substituem o substantivo.',
          'Função: coesão — evita repetir «mão»; liga orações relativas.',
          'A: não são orações adverbiais — são subordinadas adjetivas/relativas.',
          'C: oposição é semântica, não função sintática do «que».',
          'D: retomam «mão» já citada — não informação nova sem retomada.',
          'Gabarito B — substituir substantivos e retomar elementos, garantindo coesão.',
          'Em similares: que/cujo/o qual após substantivo → pronome relativo de coesão.',
        ],
        footer_rule: 'Que afaga / que apedreja = relativos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRONOME RELATIVO',
        rows: [
          { label: 'Função', value: 'Retoma antecedente — substitui substantivo.' },
          { label: 'Coesão', value: 'Evita repetição; liga oração relativa.' },
          { label: '× Adv. subordinada', value: 'Não circunstancia — qualifica/retoma nome.' },
          { label: 'Nesta questão', value: 'B — substituir substantivos e coesão' },
        ],
        footer_rule: 'Mão que… = relativo retomando mão.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função dos «que»',
        items: [
          { label: 'A — adv. subordinada', detail: '«Que» parece conjunção circunstancial.', correct: 'Retoma «mão» — pronome relativo, não advérbio subordinado.' },
          { label: 'C — oposição', detail: 'Afaga × apedreja sugere contraste.', correct: 'Oposição é de sentido; sintaxe = relativo de coesão.' },
          { label: 'D — informação nova', detail: 'Segundo «que» parece ideia nova.', correct: 'Retoma a mesma mão — coesão, não informação sem antecedente.' },
          { label: 'Em outra banca…', detail: 'Trocam por «O homem que ri é o que chora.»', correct: 'Mesmo padrão: que retoma substantivo.' },
        ],
        footer_rule: 'B: substituir substantivos e coesão.',
      },
    ],
  },

  'educa-pb-ibiara-termos-pronome-relativo-que-3819879': {
    family: 'text_fragment',
    source_tec_id: '3819879',
    source_note: 'Pronome relativo «que» corresponsabilidade — EDUCA PB Ibiara 2025 tec 3819879',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACS (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «Finalmente, o princípio da corresponsabilidade pela vida social, que diz respeito à formação de atitudes e ao aprender a valorizar comportamentos necessários à segurança no trânsito», o termo «que» funciona como:',
    text_fragment:
      '<p>Direção Defensiva e Convivência no Trânsito (domínio público). «Finalmente, o <strong>princípio da corresponsabilidade</strong> pela vida social, <strong>que diz respeito</strong> à formação de atitudes e ao aprender a valorizar comportamentos necessários à segurança no trânsito.»</p>',
    options: [
      { id: 'A', text: 'Pronome relativo, retomando «princípio da corresponsabilidade».', is_correct: true },
      { id: 'B', text: 'Conjunção integrante, introduzindo uma oração subordinada substantiva.', is_correct: false },
      { id: 'C', text: 'Pronome demonstrativo, indicando algo não mencionado anteriormente.', is_correct: false },
      { id: 'D', text: 'Advérbio relativo, estabelecendo ideia de tempo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Que — retoma princípio',
        meta: slideMeta,
        items: [
          { label: 'Princípio da corresponsabilidade', detail: 'Antecedente do «que» — núcleo retomado no texto Direção Defensiva.', icon: 'Target' },
          { label: 'Que diz respeito', detail: 'Oração relativa — pronome relativo retoma princípio.', icon: 'Link' },
          { label: 'Formação de atitudes', detail: 'Trecho do domínio público — convivência no trânsito.', icon: 'BookOpen' },
          { label: 'Segurança no trânsito', detail: 'Finalmente, o princípio… que valoriza comportamentos necessários.', icon: 'Shield' },
          { label: '≠ Conjunção integrante', detail: 'Não introduz oração substantiva sem antecedente.', icon: 'XCircle' },
          { label: 'Coesão', detail: 'Evita repetir «princípio» — função sintática de relativo.', icon: 'Check' },
          { label: 'Pegadinha: conjunção', detail: '«Que» após vírgula parece integrante — há antecedente explícito.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Que após substantivo com antecedente = relativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Direção Defensiva e Convivência no Trânsito: «princípio da corresponsabilidade…, que diz respeito…»',
          'Trecho cita formação de atitudes e segurança no trânsito — contexto do domínio público.',
          'Antecedente: princípio da corresponsabilidade — «que» retoma.',
          'Função: pronome relativo — oração subordinada adjetiva/relativa.',
          'B: conjunção integrante não teria antecedente nominal claro.',
          'C: demonstrativo apontaria sem retomar termo citado.',
          'D: não indica tempo — não é advérbio relativo.',
          'Gabarito A — pronome relativo retomando princípio da corresponsabilidade.',
          'Em similares: substantivo + vírgula + que + verbo → relativo retomando antecedente.',
        ],
        footer_rule: 'Que = pronome relativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRONOME RELATIVO × CONJUNÇÃO',
        rows: [
          { label: 'Relativo', value: 'Retoma antecedente — princípio que diz…' },
          { label: 'Conjunção integrante', value: 'Introduz oração substantiva — sem retomar nome.' },
          { label: 'Teste', value: 'Há substantivo antes do que? → relativo.' },
          { label: 'Nesta questão', value: 'A — pronome relativo' },
        ],
        footer_rule: 'Corresponsabilidade → que diz respeito.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe do «que»',
        items: [
          { label: 'B — conjunção integrante', detail: '«Que diz» parece oração substantiva.', correct: 'Antecedente «princípio» explícito — pronome relativo.' },
          { label: 'C — demonstrativo', detail: '«Que» parece apontar algo distante.', correct: 'Retoma princípio já mencionado — relativo, não demonstrativo.' },
          { label: 'D — advérbio relativo', detail: '«Quando» confunde com tempo.', correct: 'Não indica circunstância temporal — relativo de pessoa/coisa.' },
          { label: 'Em outra banca…', detail: 'Trocam por «o direito que assegura…»', correct: 'Mesmo teste: antecedente + que = relativo.' },
        ],
        footer_rule: 'A: pronome relativo.',
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
