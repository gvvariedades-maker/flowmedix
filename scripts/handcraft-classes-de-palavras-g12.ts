#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g12 (5 slugs · Classes de palavras · lote 12 · final).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g12.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g12 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g12 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g12';
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
    'conjunção conclusiva e coordenativa',
    'pronome pessoal possessivo demonstrativo',
    'advérbio de negação e restrição',
    'preposição e conjunção',
    'adjetivo qualificativo',
    'polissemia do «a»',
    'pergunta-teste M02/M03',
    'classificação morfológica',
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
      reviewer: 'handcraft:classes-de-palavras-g12',
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
  'apice-ace-pr-classes-leia-o-texto-a-seguir-e-responda-da-3558963': {
    family: 'conceito',
    source_tec_id: '3558963',
    source_note: '«Assim/eu/quereria/minha/última/crônica» classes — Ápice ACE Pref Pocinhos 2025 tec 3558963',
    meta: {
      banca: 'ÁPICE',
      prova: 'ACE (Pref Pocinhos)',
      orgao: 'Pref Pocinhos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nA última crônica — Fernando Sabino\n\n[...] Ao fundo do botequim um casal de pretos celebra o aniversário da filha com um pedaço de bolo e velas. O narrador observa o ritual com ternura e conclui: «Assim eu quereria minha última crônica: que fosse pura como esse sorriso.»\n\nTexto extraído de «A Companheira de Viagem», Editora do Autor — Rio de Janeiro, 1965, p. 174.\n\nNo que tange à classificação morfológica, no trecho «Assim eu quereria minha última crônica», temos, respectivamente, as seguintes classes de palavra:',
    options: [
      { id: 'A', text: 'advérbio; pronome pessoal; verbo; conjunção; advérbio; substantivo.', is_correct: false },
      { id: 'B', text: 'preposição; pronome pessoal; verbo; pronome demonstrativo; adjetivo; substantivo.', is_correct: false },
      { id: 'C', text: 'pronome demonstrativo; pronome relativo; verbo; conjunção; adjetivo; substantivo.', is_correct: false },
      { id: 'D', text: 'conjunção conclusiva; pronome pessoal; verbo; pronome demonstrativo; advérbio; substantivo.', is_correct: false },
      {
        id: 'E',
        text: 'conjunção conclusiva; pronome pessoal; verbo; pronome possessivo; adjetivo; substantivo.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Seis palavras, seis classes',
        chip_label: 'M02 — morfologia',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Palavra a palavra: o que cada uma faz na oração?', icon: 'Focus' },
          { label: 'Assim', detail: 'Conjunção conclusiva — introduz o desejo final do narrador.', icon: 'Link' },
          { label: 'Eu / quereria', detail: 'Pronome pessoal + verbo (condicional de «querer»).', icon: 'User' },
          { label: 'Minha', detail: 'Pronome possessivo — indica a quem pertence a crônica.', icon: 'Key' },
          { label: 'Última / crônica', detail: 'Adjetivo qualifica o substantivo «crônica».', icon: 'BookOpen' },
        ],
        footer_rule: 'Assim · eu · quereria · minha · última · crônica.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → gabarito',
        meta: slideMeta,
        steps: [
          'Foco: «Assim eu quereria minha última crônica» — seis termos em ordem.',
          'Assim: liga à conclusão do texto (como aquele sorriso) → conjunção conclusiva.',
          'Eu: sujeito oculto da oração → pronome pessoal.',
          'Quereria: núcleo verbal no condicional → verbo.',
          'Minha: pertence ao eu lírico → pronome possessivo (não demonstrativo).',
          'Última: qualifica «crônica» → adjetivo (não advérbio).',
          'Crônica: nomeia o gênero textual → substantivo.',
          'Eliminar A (assim advérbio), B (preposição/minha demonstrativo), C (assim demonstrativo), D (minha demonstrativo/última advérbio).',
          'Gabarito E — conjunção conclusiva; pronome pessoal; verbo; pronome possessivo; adjetivo; substantivo.',
          'Em similares: feche com «Assim/Desse modo + eu + verbo + meu/minha + adj. + substantivo» — teste posse (minha) e qualificação (última).',
        ],
        footer_rule: 'E — seis classes na ordem do enunciado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ASSIM EU QUERERIA MINHA ÚLTIMA CRÔNICA',
        rows: [
          { label: 'Assim', value: 'Conjunção conclusiva — «dessa maneira desejaria».' },
          { label: 'Eu / quereria', value: 'Pronome pessoal + verbo (condicional).' },
          { label: 'Minha', value: 'Pronome possessivo — posse do eu lírico.' },
          { label: 'Última / crônica', value: 'Adjetivo + substantivo.' },
          { label: 'Nesta questão', value: 'E — ordem morfológica correta.' },
        ],
        footer_rule: 'Minha = possessivo · última = adjetivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar classe de «assim» ou «minha»',
        items: [
          { label: 'A — assim advérbio', detail: 'Trata «assim» só como modo, ignorando valor conclusivo.', correct: 'No fecho da crônica, «assim» conclui o desejo — conjunção conclusiva.' },
          { label: 'B — preposição / demonstrativo', detail: '«Minha» parece artigo/pronome demonstrativo.', correct: '«Minha» indica posse — pronome possessivo.' },
          { label: 'C — assim demonstrativo', detail: 'Confunde «assim» com «este/esse».', correct: '«Assim» é conectivo conclusivo, não demonstrativo.' },
          { label: 'D — última advérbio', detail: '«Última» parece circunstância temporal.', correct: 'Qualifica o substantivo «crônica» — adjetivo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Desse modo eu escreveria meu último texto».', correct: 'Mesmo mapa: conclusivo + pessoal + verbo + possessivo + adj. + subst.' },
        ],
        footer_rule: 'Só E fecha as seis classes.',
      },
    ],
  },

  'fgv-ass-ts-p-classes-observe-a-seguinte-frase-a-pessoa-a-3587458': {
    family: 'conceito',
    source_tec_id: '3587458',
    source_note: 'Cinco «a» quatro classes — FGV Ass TS Pref SJC 2025 tec 3587458',
    meta: {
      banca: 'FGV',
      prova: 'Ass TS (Pref SJC)',
      orgao: 'Pref SJC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe a seguinte frase:\n\nA pessoa a quem entregaram a medalha, foi a que a homenageou no discurso de encerramento.\n\nNessa frase há cinco ocorrências do vocábulo «a», que pertencem a quatro classes gramaticais. Assinale a única classe ausente dessa frase.',
    options: [
      { id: 'A', text: 'Pronome demonstrativo.', is_correct: false },
      { id: 'B', text: 'Pronome pessoal.', is_correct: false },
      { id: 'C', text: 'Preposição.', is_correct: false },
      { id: 'D', text: 'Substantivo.', is_correct: true },
      { id: 'E', text: 'Artigo definido.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cinco «a», quatro classes',
        chip_label: 'M02 — polissemia',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada «a»: artigo, prep., pronome… substantivo?', icon: 'Focus' },
          { label: 'A pessoa / a medalha', detail: 'Artigo definido — antecede substantivo.', icon: 'Hash' },
          { label: 'A quem', detail: 'Preposição — liga «quem» ao termo anterior.', icon: 'Link' },
          { label: 'Foi a que', detail: 'Pronome relativo — «a que» = «a qual».', icon: 'GitBranch' },
          { label: 'A homenageou', detail: 'Pronome pessoal átono (ao → a) — complemento verbal.', icon: 'User' },
        ],
        footer_rule: 'Artigo · prep. · relativo · pessoal — sem substantivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Mapa dos cinco «a»',
        meta: slideMeta,
        steps: [
          'Frase FGV: cinco «a» em quatro classes — achar a classe AUSENTE.',
          '1º «A pessoa» e 3º «a medalha» → artigo definido.',
          '2º «a quem» → preposição (regência de «entregaram»).',
          '4º «foi a que» → pronome relativo (equivalente a «a qual»).',
          '5º «a homenageou» → pronome pessoal oblíquo (proclise de «homenageou»).',
          'Classes presentes: artigo, preposição, pronome relativo, pronome pessoal.',
          '«A» nunca funciona como substantivo em português — classe ausente.',
          'Gabarito D — substantivo.',
        ],
        footer_rule: 'D — substantivo ausente.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POLISSEMIA DO «A»',
        rows: [
          { label: 'Artigo', value: 'A pessoa · a medalha.' },
          { label: 'Preposição', value: 'A quem (entregaram a quem?).' },
          { label: 'Pronome relativo', value: 'Foi a que homenageou (= a qual).' },
          { label: 'Pronome pessoal', value: 'A homenageou (complemento de «homenageou»).' },
          { label: 'Ausente', value: 'Substantivo — «a» não nomeia ser/coisa.' },
        ],
        footer_rule: 'Quatro classes sim · substantivo não.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir classe presente com ausente',
        items: [
          { label: 'A — demonstrativo', detail: '«A que» parece «aquela que».', correct: '«A que» é relativo, não demonstrativo — mas demonstrativo também não aparece; o gabarito pede a ausente: substantivo.' },
          { label: 'B — pessoal ausente', detail: 'Esquece «a homenageou».', correct: 'Há pronome pessoal em «a homenageou» — presente na frase.' },
          { label: 'C — preposição ausente', detail: 'Não vê regência em «a quem».', correct: '«A quem» traz preposição — presente.' },
          { label: 'E — artigo ausente', detail: 'Ignora «A pessoa» e «a medalha».', correct: 'Artigo definido aparece duas vezes.' },
          { label: 'Em outra banca…', detail: 'Trocam por «A mulher a quem deram o prêmio foi a que o agradeceu».', correct: 'Mesmo teste: «a» nunca é substantivo.' },
        ],
        footer_rule: 'Só D — classe que não existe para «a».',
      },
    ],
  },

  'selecon-ag-p-classes-leia-o-texto-a-seguir-ainda-estou-aq-3649272': {
    family: 'conceito',
    source_tec_id: '3649272',
    source_note: '«por/e» prep+conj filme Ainda Estou Aqui — SELECON Ag Pref Nova Mutum 2025 tec 3649272',
    meta: {
      banca: 'SELECON',
      prova: 'Ag (Pref Nova Mutum)',
      orgao: 'Pref Nova Mutum',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir:\n\n«Ainda Estou Aqui» é escolhido melhor filme do ano pela crítica internacional. O longa-metragem foi eleito o melhor filme do ano pela crítica internacional e recebeu o Grand Prix da FIPRESCI. Estrelado por Fernanda Torres, Selton Mello e Fernanda Montenegro, o filme já havia sido coroado com Oscar na categoria Melhor Filme Internacional [...]\n\nFonte: notícia sobre prêmio FIPRESCI (adaptado).\n\n«Estrelado por Fernanda Torres, Selton Mello e Fernanda Montenegro, o filme já havia sido coroado com Oscar na categoria Melhor Filme Internacional [...]» (2º parágrafo).\n\nNesse trecho, os termos destacados são classificados, respectivamente, como:',
    options: [
      { id: 'A', text: 'conjunção e conjunção', is_correct: false },
      { id: 'B', text: 'preposição e conjunção', is_correct: true },
      { id: 'C', text: 'conjunção e preposição', is_correct: false },
      { id: 'D', text: 'preposição e preposição', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Por · e',
        chip_label: 'M02 — prep. × conj.',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Liga termos (prep.) ou orações/termos (conj.)?', icon: 'Focus' },
          { label: 'Por', detail: '«Estrelado por...» — indica agente/meio → preposição.', icon: 'Link' },
          { label: 'E', detail: 'Liga «Selton Mello» e «Fernanda Montenegro» → conjunção aditiva.', icon: 'Plus' },
          { label: '× Conjunção em «por»', detail: '«Por» não coordena — introduz complemento.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Inverter a ordem prep./conj. nas alternativas.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Por = preposição · e = conjunção.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Destacados → gabarito',
        meta: slideMeta,
        steps: [
          'Trecho: «Estrelado por Fernanda Torres, Selton Mello e Fernanda Montenegro».',
          '«Por» liga o particípio «estrelado» aos nomes dos atores → preposição.',
          '«E» adiciona o último nome à enumeração → conjunção coordenativa.',
          'A duas conjunções — «por» não coordena — eliminar.',
          'C inverte prep./conj. — eliminar.',
          'D duas preposições — «e» não é prep. — eliminar.',
          'Gabarito B — preposição e conjunção.',
          'Em similares: «dirigido por X, Y e Z» — por (prep.) liga ao particípio; e (conj.) soma nomes.',
        ],
        footer_rule: 'B — por (prep.) + e (conj.).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POR + E',
        rows: [
          { label: 'Por', value: 'Preposição — agente de «estrelado por».' },
          { label: 'E', value: 'Conjunção aditiva — liga nomes na lista.' },
          { label: 'Teste rápido', value: '«Por» + substantivo = complemento; «e» = adição.' },
          { label: 'Nesta questão', value: 'B — preposição e conjunção' },
        ],
        footer_rule: 'Não inverta as duas classes.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Inverter ou duplicar classe',
        items: [
          { label: 'A — duas conjunções', detail: '«Por» parece conectivo frasal.', correct: '«Por» regencia nominal — preposição, não conjunção.' },
          { label: 'C — ordem invertida', detail: 'Troca os papéis de «por» e «e».', correct: 'Por = prep.; e = conj. — ordem do enunciado.' },
          { label: 'D — duas preposições', detail: '«E» parece preposição em outro contexto.', correct: '«E» aqui só adiciona nomes — conjunção.' },
          { label: 'Em outra banca…', detail: 'Trocam por «dirigido por X, Y e Z».', correct: 'Mesmo par: por (prep.) + e (conj.).' },
        ],
        footer_rule: 'Só B — prep. + conj.',
      },
    ],
  },

  'avancasp-ace-classes-nao-podemos-pensar-tanto-nessas-cois-3662937': {
    family: 'conceito',
    source_tec_id: '3662937',
    source_note: '«não/só» advérbios — AVANÇASP ACE Pref Cerquilho 2025 tec 3662937',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACE (Pref Cerquilho)',
      orgao: 'Pref Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Não podemos pensar tanto nessas coisas, afinal, só temos controle sobre uma parte da situação.»\n\nEm relação à sentença dada, pode-se afirmar que:',
    options: [
      { id: 'A', text: 'as palavras «não» e «só» são advérbios.', is_correct: true },
      { id: 'B', text: 'os verbos «podemos» e «temos» estão conjugados no presente do modo subjuntivo.', is_correct: false },
      { id: 'C', text: 'as palavras «tanto», «sobre» e «da» são preposições.', is_correct: false },
      { id: 'D', text: 'as palavras «coisas», «controle» e «parte» são adjetivos.', is_correct: false },
      { id: 'E', text: 'a palavra «afinal» é uma conjunção.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Não · só',
        chip_label: 'M02 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Não» e «só» modificam verbo ou nomeiam?', icon: 'Focus' },
          { label: 'Não', detail: 'Advérbio de negação — modifica «podemos pensar».', icon: 'Ban' },
          { label: 'Só', detail: 'Advérbio de restrição/intensidade — modifica «temos controle».', icon: 'Filter' },
          { label: 'Podemos / temos', detail: 'Presente do indicativo — não subjuntivo.', icon: 'Zap' },
          { label: 'Coisas / controle / parte', detail: 'Nuclei nominais — substantivos, não adjetivos.', icon: 'Box' },
        ],
        footer_rule: 'Não e só = advérbios.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Afirmativa correta',
        meta: slideMeta,
        steps: [
          'Frase sobre controle parcial da situação — achar afirmativa morfológica correta.',
          'A: «não» nega o verbo; «só» restringe «temos» → ambos advérbios — CORRETO.',
          'B: «podemos/temos» = presente do indicativo (1ª pl.), não subjuntivo — eliminar.',
          'C: «tanto» é advérbio; «sobre» é prep.; «da» é prep. + artigo — eliminar.',
          'D: «coisas», «controle», «parte» nomeiam — substantivos — eliminar.',
          'E: «afinal» é advérbio (conclusão), não conjunção — eliminar.',
          'Gabarito A.',
          'Em similares: «não» nega verbo; «só/apenas» restringe — par clássico de advérbios na mesma frase.',
        ],
        footer_rule: 'A — não e só são advérbios.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÃO · SÓ',
        rows: [
          { label: 'Não', value: 'Advérbio de negação — modifica verbo «podemos pensar».' },
          { label: 'Só', value: 'Advérbio de restrição — «apenas temos controle».' },
          { label: 'Verbos', value: 'Podemos/temos = indicativo presente (não subjuntivo).' },
          { label: 'Substantivos', value: 'Coisas, controle, parte — núcleos nominais.' },
          { label: 'Nesta questão', value: 'A — não e só = advérbios' },
        ],
        footer_rule: 'Advérbio modifica; substantivo nomeia.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada alternativa erra outra classe',
        items: [
          { label: 'B — subjuntivo', detail: '«Podemos/temos» parecem hipótese.', correct: 'Formas de indicativo presente — afirmação real.' },
          { label: 'C — tanto prep.', detail: '«Tanto» parece preposição em «tanto em».', correct: '«Tanto» modifica «pensar» — advérbio de intensidade.' },
          { label: 'D — substantivos adj.', detail: 'Palavras terminadas em -s parecem adjetivos.', correct: '«Coisas», «controle», «parte» nomeiam — substantivos.' },
          { label: 'E — afinal conjunção', detail: '«Afinal» liga ideias conclusivas.', correct: '«Afinal» é advérbio de conclusão — não conjunção.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Não devemos nos preocupar tanto; apenas controlamos parte».', correct: 'Mesmo par: não/ apenas (só) = advérbios.' },
        ],
        footer_rule: 'Só A descreve «não» e «só».',
      },
    ],
  },

  'apice-ag-adm-classes-leia-o-poema-abaixo-e-responda-a-que-3793483': {
    family: 'conceito',
    source_tec_id: '3793483',
    source_note: '«venturosas/aflita» adjetivos Mágoas Augusto dos Anjos — Ápice Ag Adm Pref R Bacamarte 2025 tec 3793483',
    meta: {
      banca: 'ÁPICE',
      prova: 'Ag Adm (Pref R Bacamarte)',
      orgao: 'Pref R Bacamarte',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o poema abaixo e responda à questão.\n\nMágoas — Augusto dos Anjos\n\nQuando nasci num mês de tantas flores\nTodas murcharam, tristes, langorosas\nTristes fanaram redolentes rosas\nMorreram todas, todas sem olores\n\nMais tarde da existência nos verdores\nDa infância nunca tive as venturosas\nAlegrias que passam bonançosas,\nOh! Minha infância nunca teve flores!\n\nVolvendo à quadra azul da mocidade\nMinha alma levo aflita à eternidade\nQuando a morte matar meus dissabores.\nCansado de chorar pelas estradas,\nExausto de pisar mágoas pisadas,\nHoje eu carrego a cruz das minhas dores!\n\nFonte: ANJOS, Augusto. Mágoas. Eu e outras poesias.\n\nConsiderando o contexto em que ocorrem, identifique a alternativa que apresenta palavras que pertençam à mesma classe gramatical.',
    options: [
      { id: 'A', text: 'cruz e minhas.', is_correct: false },
      { id: 'B', text: 'venturosas e aflita.', is_correct: true },
      { id: 'C', text: 'carrego e cruz.', is_correct: false },
      { id: 'D', text: 'minhas e dores.', is_correct: false },
      { id: 'E', text: 'tantas e carrego.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mesma classe?',
        chip_label: 'M03 — adjetivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'As duas palavras qualificam, nomeiam ou indicam ação?', icon: 'Focus' },
          { label: 'Venturosas', detail: 'Qualifica «Alegrias» — adjetivo (felizes, prósperas).', icon: 'Sun' },
          { label: 'Aflita', detail: 'Qualifica «alma» em «levo aflita» — adjetivo (predicativo).', icon: 'CloudRain' },
          { label: 'Cruz / dores', detail: 'Substantivos — nomeiam coisa/sentimento.', icon: 'Box' },
          { label: 'Carrego', detail: 'Verbo — ação do eu lírico.', icon: 'Zap' },
        ],
        footer_rule: 'Venturosas + aflita = adjetivos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Par da mesma classe',
        meta: slideMeta,
        steps: [
          'Poema «Mágoas»: achar par de palavras da MESMA classe gramatical.',
          'B «venturosas» (alegrias venturosas) + «aflita» (alma aflita) → ambos qualificam — adjetivos.',
          'A «cruz» (subst.) + «minhas» (possessivo) — classes diferentes — eliminar.',
          'C «carrego» (verbo) + «cruz» (subst.) — eliminar.',
          'D «minhas» (possessivo) + «dores» (subst.) — eliminar.',
          'E «tantas» (adj./numeral) + «carrego» (verbo) — eliminar.',
          'Gabarito B — venturosas e aflita.',
          'Em similares: dois termos que qualificam nome (venturosas alegrias / alma aflita) = adjetivos — substantivo e verbo não formam par.',
        ],
        footer_rule: 'B — dois adjetivos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJETIVO × OUTRAS CLASSES',
        rows: [
          { label: 'Venturosas', value: 'Adjetivo — qualifica «alegrias».' },
          { label: 'Aflita', value: 'Adjetivo predicativo — qualifica «alma».' },
          { label: 'Cruz / dores', value: 'Substantivos — não formam par com possessivo/verbo.' },
          { label: 'Minhas / carrego', value: 'Possessivo e verbo — classes distintas.' },
          { label: 'Nesta questão', value: 'B — venturosas e aflita (adjetivos)' },
        ],
        footer_rule: 'Qualificam = adjetivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Misturar classes no par',
        items: [
          { label: 'A — cruz + minhas', detail: '«Minhas» acompanha «dores», não «cruz» diretamente.', correct: 'Substantivo + possessivo — classes diferentes.' },
          { label: 'C — carrego + cruz', detail: 'Verbo de ação + objeto nominal.', correct: 'Verbo + substantivo — não mesma classe.' },
          { label: 'D — minhas + dores', detail: 'Possessivo precisa de substantivo — par misto.', correct: 'Pronome possessivo ≠ substantivo «dores».' },
          { label: 'E — tantas + carrego', detail: '«Tantas» qualifica «flores»; «carrego» é verbo.', correct: 'Adjetivo/numeral + verbo — classes distintas.' },
          { label: 'Em outra banca…', detail: 'Trocam por «tristes e langorosas» no 1º estrofe.', correct: 'Mesmo teste: dois adjetivos qualificando nomes.' },
        ],
        footer_rule: 'Só B — par de adjetivos.',
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
