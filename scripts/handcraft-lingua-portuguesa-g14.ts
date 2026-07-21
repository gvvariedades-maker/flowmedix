#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g14 (8 slugs · Colocação pronominal · lote 2).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g14.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g14 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g14 --strict
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_COLOCACAO_PRONOMINAL } from '@/lib/guidelines/linguaPortuguesa/colocacaoPronominal';

const LOTE = 'lingua-portuguesa-g14';
const SUBTOPICO = 'Pronomes e colocação pronominal';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_pronomes_colocacao';
const REVIEWED = '2026-07-20';
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
      reviewer: 'handcraft:lingua-portuguesa-g14',
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
  'avancasp-varginha-colocacao-quantos-norma-3727518': {
    family: 'conceito',
    source_tec_id: '3727518',
    source_note: 'Colocação quantos conformes — AVANÇASP ACre Varginha 2025 tec 3727518',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '- "Ela jamais me perdoaria uma falta."\n- "Nunca faltou-me quem ajudasse."\n- "Se ligue nas ondas do rádio."\n- "Os convidados da festa presentearam-me."\n- "Feliz daquele que dedica-se aos animais."\n\nEntre os enunciados acima, quantos se apresentam de acordo com a norma-padrão em relação aos elementos destacados?',
    options: [
      { id: 'A', text: 'Quatro', is_correct: false },
      { id: 'B', text: 'Um', is_correct: false },
      { id: 'C', text: 'Três', is_correct: false },
      { id: 'D', text: 'Cinco', is_correct: false },
      { id: 'E', text: 'Dois', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cinco frases, cinco testes',
        chip_label: 'Contagem no trilho',
        meta: slideMeta,
        items: [
          { label: '(1) Jamais me', detail: 'Jamais atrai → próclise correta.', icon: 'Check' },
          { label: '(2) Nunca faltou-me', detail: 'Nunca atrai → Nunca me faltou.', icon: 'X' },
          { label: '(3) Se ligue', detail: 'Imperativo → Ligue-se, não próclise.', icon: 'X' },
          { label: '(4) presentearam-me', detail: 'Sem atrativo → ênclise ok.', icon: 'Check' },
          { label: '(5) que dedica-se', detail: 'Que atrai → que se dedica.', icon: 'X' },
        ],
        footer_rule: 'Conte só as frases totalmente conformes.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Contagem letra a letra',
        meta: slideMeta,
        steps: [
          'Comando: quantas frases estão corretas na colocação destacada?',
          '(1) «jamais me perdoaria» — Jamais atrai → próclise → CERTA.',
          '(2) «Nunca faltou-me» — Nunca atrai → Nunca me faltou → ERRADA.',
          '(3) «Se ligue» — imperativo afirmativo → Ligue-se → ERRADA.',
          '(4) «presentearam-me» — pretérito sem atrativo → ênclise → CERTA.',
          '(5) «que dedica-se» — que atrai → que se dedica → ERRADA.',
          'Duas corretas: (1) e (4).',
          'Gabarito E — Dois.',
        ],
        footer_rule: 'Só (1) e (4) passam no trilho.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Checklist de contagem',
        meta: slideMeta,
        content: 'CONTE NO TRILHO',
        rows: [
          { label: 'Jamais / nunca', value: 'próclise: jamais me / nunca me' },
          { label: 'Imperativo', value: 'Ligue-se — não «Se ligue»' },
          { label: 'Que', value: 'que se dedica — próclise' },
          { label: 'Sem atrativo', value: 'presentearam-me — ênclise ok' },
          { label: 'Nesta questão', value: 'E — Dois conformes' },
        ],
        footer_rule: 'Duas frases certas: 1 e 4.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Erros que inflam a conta',
        meta: slideMeta,
        content: 'Não conte frase errada como certa',
        items: [
          { label: 'A — Quatro', detail: 'Aceita quase todas como corretas.', correct: 'Só (1) e (4) estão conformes.' },
          { label: 'B — Um', detail: 'Subestima as duas corretas.', correct: 'Jamais me + presentearam-me = dois.' },
          { label: 'C — Três', detail: 'Salva (2), (3) ou (5) indevidamente.', correct: '(2) nunca me; (5) que se dedica.' },
          { label: 'D — Cinco', detail: 'Ignora todos os atrativos.', correct: 'Três frases têm colocação errada.' },
          { label: 'Em outra banca…', detail: 'Trocam as cinco frases citadas.', correct: 'Mesmo trilho: atrativo? imperativo? que?' },
        ],
        footer_rule: 'E passa: Dois enunciados conformes.',
      },
    ],
  },

  'educa-pb-colocacao-versos-intimos-3746604': {
    family: 'text_fragment',
    source_tec_id: '3746604',
    source_note: 'Colocação poema Augusto dos Anjos — EDUCA PB Sta Cecília 2025 tec 3746604',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Sta Cecília)',
      orgao: 'Pref. Sta Cecília',
      ano: '2025',
    },
    instruction:
      'Leia o trecho do poema "Versos Íntimos":\n\n"Se a alguém causa inda pena a tua chaga,\nApedreja essa mão vil que te afaga,\nEscarra nessa boca que te beija!"\n\nNos trechos destacados, os pronomes oblíquos apresentam uma colocação que segue a norma culta da língua. Assinale a alternativa CORRETA quanto ao tipo de colocação de cada pronome:',
    text_fragment:
      '<p><strong>Versos íntimos</strong> — Augusto dos Anjos</p><p>Vês! Ninguém assistiu ao formidável<br/>Enterro de tua última quimera.<br/>Somente a Ingratidão – esta pantera –<br/>Foi tua companheira inseparável!</p><p>Acostuma-te à lama que te espera!<br/>O Homem, que, nesta terra miserável,<br/>Mora entre feras, sente inevitável<br/>Necessidade de também ser fera.</p><p>Toma um fósforo. Acende teu cigarro!<br/>O beijo, amigo, é a véspera do escarro,<br/>A mão que afaga é a mesma que apedreja.</p><p><strong>Se a alguém causa inda pena a tua chaga,<br/>Apedreja essa mão vil que te afaga,<br/>Escarra nessa boca que te beija!</strong></p><p><em>Fonte: culturagenial.com — adaptado</em></p>',
    options: [
      { id: 'A', text: '"te afaga" – próclise; "te beija" – próclise.', is_correct: true },
      { id: 'B', text: '"te afaga" – ênclise; "te beija" – próclise.', is_correct: false },
      { id: 'C', text: '"te afaga" – mesóclise; "te beija" – mesóclise.', is_correct: false },
      { id: 'D', text: '"te afaga" – ênclise; "te beija" – ênclise.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Que puxa o te',
        meta: slideMeta,
        items: [
          { label: 'Versos íntimos', detail: 'Poema de Augusto dos Anjos — tom pessimista.', icon: 'BookOpen' },
          { label: 'que te afaga', detail: 'Pronome relativo que → próclise.', icon: 'ArrowLeft' },
          { label: 'que te beija', detail: 'Mesmo trilho: que atrai o átono.', icon: 'ArrowLeft' },
          { label: 'Ênclise vetada', detail: 'Não se diz «afaga-te» após que.', icon: 'Ban' },
        ],
        footer_rule: 'Relativo que = próclise nos dois.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Poema: mão que afaga / boca que beija — trecho final destacado.',
          'Estrutura: «mão vil que te afaga» e «boca que te beija».',
          'Que é pronome relativo → atrativo de próclise.',
          '«te afaga» — próclise obrigatória (não afaga-te).',
          '«te beija» — mesmo caso após que.',
          'A descreve: próclise + próclise.',
          'Gabarito A.',
        ],
        footer_rule: 'A = próclise nos dois pronomes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUE ATRAI TE',
        rows: [
          { label: 'Relativo', value: 'que te afaga / que te beija' },
          { label: 'Proibido', value: 'afaga-te / beija-te após que' },
          { label: 'Mesóclise', value: 'não cabe aqui (sem futuro)' },
          { label: 'Nesta questão', value: 'A — próclise + próclise' },
        ],
        footer_rule: 'Que → te antes do verbo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Tipos trocados no poema',
        items: [
          { label: 'B — ênclise + próclise', detail: 'Acha «te afaga» enclítico.', correct: 'Que exige te afaga — próclise.' },
          { label: 'C — mesóclise', detail: 'Mesóclise exige futuro/pretérito composto.', correct: 'Versos estão no presente/indicativo.' },
          { label: 'D — ênclise nos dois', detail: 'Ignora o atrativo que.', correct: 'Dois relativos → duas próclises.' },
          { label: 'Pegadinha oral', detail: 'Na fala, «que te» soa natural.', correct: 'Na prova, identifique que antes do verbo.' },
          { label: 'Em outra banca…', detail: 'Trocam «afaga/beija» por «beija/afaga».', correct: 'Mesma regra: que → próclise.' },
        ],
        footer_rule: 'A passa: te afaga + te beija.',
      },
    ],
  },

  'vunesp-sertaozinho-colocacao-bibliifilas-3352589': {
    family: 'text_fragment',
    source_tec_id: '3352589',
    source_note: 'Colocação reescrita bibliófilas — VUNESP Ag Sertãozinho 2025 tec 3352589',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Sertãozinho) Saneamento',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em "... pessoas que acumulam itens porque simplesmente não conseguem jogá-los fora", o trecho em destaque pode ser substituído, em conformidade com a norma-padrão de emprego e colocação dos pronomes, por',
    text_fragment:
      '<p><strong>Bibliófilas, acumuladoras e tsundoku</strong> (adaptado de Alex Castro, Revista Quatro Cinco Um, jul. 2024)</p><p>Existem as pessoas <strong>bibliófilas</strong> (do grego biblíon, "livro", e philos, "amigo"): quase sempre intelectuais, adoram ter livros raros, edições únicas, várias traduções dos mesmos textos. Reúnem coleções catalogadas que podem ser utilíssimas para pesquisadores.</p><p>Existem as pessoas <strong>acumuladoras</strong>: adoram ter uma enorme quantidade de objetos, incluindo livros. Via de regra, o termo já designa uma patologia: pessoas que acumulam itens porque simplesmente <strong>não conseguem jogá-los fora</strong>. E, portanto, são também incapazes de catalogar, cuidar, organizar, até mesmo limpar seus objetos.</p><p>E existimos nós, pobres mortais que vamos comprando livros pela vida e, na semana seguinte, antes de termos lido qualquer uma das compras da anterior, já estamos comprando novos, que vão se acumulando sem serem lidos.</p><p>Para Roberto Calasso, bibliotecas deveriam ser organizadas de forma aleatória e lúdica. "Nada tira o fascínio de ter nas mãos — na hora — um livro de cuja necessidade não se sabia até um momento antes", escreve ele.</p>',
    options: [
      { id: 'A', text: 'não conseguem jogar-lhes fora.', is_correct: false },
      { id: 'B', text: 'não los conseguem jogar fora.', is_correct: false },
      { id: 'C', text: 'não conseguem-os jogar fora.', is_correct: false },
      { id: 'D', text: 'não os conseguem jogar fora.', is_correct: true },
      { id: 'E', text: 'não lhes conseguem jogar fora.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Não + os + infinitivo',
        meta: slideMeta,
        items: [
          { label: 'Bibliófilas × acumuladoras', detail: 'Texto tsundoku: bibliofilas catalogam; acumuladoras patologia.', icon: 'BookOpen' },
          { label: 'jogá-los fora', detail: 'Ênclise no infinitivo — objeto os (itens).', icon: 'ArrowRight' },
          { label: 'Não atrai', detail: 'Negação antes do verbo → próclise do os.', icon: 'ArrowLeft' },
          { label: 'Calasso / pesquisadores', detail: 'Coleções úteis a pesquisadores; Calasso e acumular livros.', icon: 'Users' },
        ],
        footer_rule: 'Não os conseguem jogar fora.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto tsundoku: bibliofilas, acumuladoras e acumular livros sem ler.',
          'Trecho: «não conseguem jogá-los fora» — reescrever com colocação padrão.',
          'Não é atrativo imediato do infinitivo, mas negação exige próclise: não os.',
          'A/E: «lhes» — objeto indireto; frase pede os (itens).',
          'B: «los» — forma inadequada; C: ênclise após não.',
          'D: «não os conseguem jogar fora» — próclise + infinitivo limpo.',
          'Gabarito D.',
        ],
        footer_rule: 'D = não os conseguem jogar fora.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÃO + PRÓCLISE',
        rows: [
          { label: 'Negação', value: 'não os conseguem — próclise' },
          { label: 'Objeto', value: 'os (itens), não lhes/los' },
          { label: 'Infinitivo', value: 'jogar fora — sem ênclise após não' },
          { label: 'Nesta questão', value: 'D' },
        ],
        footer_rule: 'Não atrai o pronome antes do verbo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'lhes, los e ênclise após não',
        items: [
          { label: 'A — jogar-lhes', detail: 'Troca OD por OI.', correct: 'Objeto são «itens» (os), não pessoas.' },
          { label: 'B — los', detail: 'Forma inexistente na norma.', correct: 'Use os: não os conseguem jogar.' },
          { label: 'C — conseguem-os', detail: 'Ênclise após negação.', correct: 'Não os conseguem — próclise.' },
          { label: 'E — lhes', detail: 'Mesmo erro de regência de A.', correct: 'os, não lhes.' },
          { label: 'Em outra banca…', detail: 'Trocam «jogar» por «descartar».', correct: 'Mesmo trilho: não os + infinitivo.' },
        ],
        footer_rule: 'D passa: não os conseguem jogar fora.',
      },
    ],
  },

  'avancasp-amparo-colocacao-enclise-levou-me-3352965': {
    family: 'conceito',
    source_tec_id: '3352965',
    source_note: 'Colocação ênclise modelo Levou-me — AVANÇASP ACS Amparo 2025 tec 3352965',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Amparo)',
      orgao: 'Pref. Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em "Levou-me para jantar no meu restaurante favorito." o pronome "me" está após o verbo (ênclise). Em qual das frases a seguir ocorre o mesmo tipo de colocação pronominal?',
    options: [
      { id: 'A', text: 'Acender-se-ão as tochas olímpicas mais uma vez.', is_correct: false },
      { id: 'B', text: 'Deitou-se porque não estava bem.', is_correct: true },
      { id: 'C', text: 'Foi a Bárbara que nos trouxe de carro.', is_correct: false },
      { id: 'D', text: 'Não se salvaram daquela terrível catástrofe.', is_correct: false },
      { id: 'E', text: 'Jamais me esquecerei deste encontro.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ênclise como Levou-me',
        meta: slideMeta,
        items: [
          { label: 'Modelo', detail: 'Levou-me — pronome após o verbo.', icon: 'ArrowRight' },
          { label: 'Deitou-se', detail: 'Reflexivo enclítico — mesma lógica.', icon: 'Check' },
          { label: 'Mesóclise', detail: 'Acender-se-ão — pronome no meio.', icon: 'Split' },
          { label: 'Próclise', detail: 'que nos / não se / jamais me — atrativos.', icon: 'ArrowLeft' },
        ],
        footer_rule: 'Ênclise = pronome colado após o verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Modelo: «Levou-me» — ênclise (pronome após o verbo).',
          'A: «Acender-se-ão» — mesóclise, não ênclise simples.',
          'C: «que nos trouxe» — que atrai → próclise.',
          'D: «Não se salvaram» — não atrai → próclise.',
          'E: «Jamais me esquecerei» — jamais atrai → próclise.',
          'B: «Deitou-se» — ênclise reflexiva como Levou-me.',
          'Gabarito B.',
        ],
        footer_rule: 'B = Deitou-se (ênclise).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ÊNCLISE PURA',
        rows: [
          { label: 'Modelo', value: 'Levou-me / Deitou-se' },
          { label: '≠ mesóclise', value: 'Acender-se-ão' },
          { label: '≠ próclise', value: 'não se / jamais me / que nos' },
          { label: 'Nesta questão', value: 'B — Deitou-se' },
        ],
        footer_rule: 'Pronome logo após o verbo = ênclise.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Mesóclise e próclise disfarçadas',
        items: [
          { label: 'A — se-ão', detail: 'Pronome no meio do futuro.', correct: 'Mesóclise ≠ ênclise de Levou-me.' },
          { label: 'C — que nos', detail: 'Relativo atrai o pronome.', correct: '…que nos trouxe → próclise.' },
          { label: 'D — Não se', detail: 'Negação atrai próclise.', correct: 'Não se salvaram — próclise.' },
          { label: 'E — Jamais me', detail: 'Advérbio atrativo.', correct: 'Jamais me esquecerei — próclise.' },
          { label: 'Em outra banca…', detail: 'Trocam «Deitou-se» por «Sentou-se».', correct: 'Mesmo gesto: verbo + se/me colados.' },
        ],
        footer_rule: 'B passa: Deitou-se.',
      },
    ],
  },

  'avancasp-amparo-colocacao-proclise-se-3353968': {
    family: 'conceito',
    source_tec_id: '3353968',
    source_note: 'Colocação próclise modelo Quando se — AVANÇASP ACEVA Amparo 2025 tec 3353968',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACEVA (Pref Amparo)',
      orgao: 'Pref. Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em "Quando se lembrou do aniversário, já era tarde demais." o pronome "se" está antes do verbo (próclise). Em qual das frases a seguir ocorre o mesmo tipo de colocação pronominal?',
    options: [
      { id: 'A', text: 'Vendem-se salgados para festa.', is_correct: false },
      { id: 'B', text: 'Um dia, vingar-se-á de todos os inimigos.', is_correct: false },
      { id: 'C', text: 'Levantaram-se para aplaudir de pé.', is_correct: false },
      { id: 'D', text: 'Não me chamaram para a formatura.', is_correct: true },
      { id: 'E', text: 'Ela nunca me avisou do evento.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Próclise como Quando se',
        meta: slideMeta,
        items: [
          { label: 'Modelo', detail: 'Quando se lembrou — atrativo + próclise.', icon: 'ArrowLeft' },
          { label: 'Não me', detail: 'Negação atrai → mesma lógica.', icon: 'Check' },
          { label: 'Ênclise', detail: 'Vendem-se / Levantaram-se — pronome após.', icon: 'ArrowRight' },
          { label: 'Mesóclise', detail: 'vingar-se-á — pronome no meio.', icon: 'Split' },
        ],
        footer_rule: 'Próclise = pronome antes do verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Modelo: «Quando se lembrou» — quando atrai → próclise.',
          'A: «Vendem-se» — ênclise (se apassivador).',
          'B: «vingar-se-á» — mesóclise no futuro.',
          'C: «Levantaram-se» — ênclise reflexiva.',
          'E: «nunca me avisou» — próclise, mas não é a letra da banca aqui.',
          'D: «Não me chamaram» — não atrai → próclise como no modelo.',
          'Gabarito D.',
        ],
        footer_rule: 'D = Não me chamaram (próclise).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRÓCLISE PURA',
        rows: [
          { label: 'Modelo', value: 'Quando se / Não me' },
          { label: 'Atrativos', value: 'quando, não, nunca, que…' },
          { label: '≠ ênclise', value: 'Vendem-se / Levantaram-se' },
          { label: 'Nesta questão', value: 'D — Não me chamaram' },
        ],
        footer_rule: 'Atrativo → pronome antes do verbo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Ênclise e mesóclise no lugar da próclise',
        items: [
          { label: 'A — Vendem-se', detail: 'Se apassivador enclítico.', correct: 'Ênclise, não próclise.' },
          { label: 'B — vingar-se-á', detail: 'Futuro com mesóclise.', correct: 'Pronome no meio ≠ antes do verbo.' },
          { label: 'C — Levantaram-se', detail: 'Reflexo enclítico.', correct: 'Pronome após o verbo.' },
          { label: 'E — nunca me', detail: 'Também é próclise, mas banca marca D.', correct: 'D é a resposta oficial desta questão.' },
          { label: 'Em outra banca…', detail: 'Trocam «Não me» por «Jamais me».', correct: 'Mesmo trilho: atrativo → próclise.' },
        ],
        footer_rule: 'D passa: Não me chamaram.',
      },
    ],
  },

  'avancasp-caieiras-colocacao-angustia-3374794': {
    family: 'text_fragment',
    source_tec_id: '3374794',
    source_note: 'Colocação ênclise vetada Lispector — AVANÇASP AEE Caieiras 2025 tec 3374794',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AEE (Pref Caieiras)',
      orgao: 'Pref. Caieiras',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise a colocação pronominal dos excertos apresentados a seguir:\n\nI. Ou não se confessar nem a si próprio.\nII. Mas angústia faz parte: o que é vivo, por ser vivo, se contrai.\nIII. Enquanto se espera que o coração entenda.\n\nDe acordo com a norma-padrão da língua portuguesa, nos casos apresentados, a ênclise não é vetada apenas em:',
    text_fragment:
      '<p><strong>O que é angústia</strong> — Clarice Lispector</p><p>Um rapaz fez-me essa pergunta difícil de ser respondida. Pois depende do angustiado. Angústia pode ser não ter esperança na esperança. Ou conformar-se sem se resignar. Ou <strong>não se confessar</strong> nem a si próprio. Ou não ser o que realmente se é, e nunca se é.</p><p>Mas angústia faz parte: o que é vivo, por ser vivo, <strong>se contrai</strong>. Esse mesmo rapaz perguntou-me: você não acha que há um vazio sinistro em tudo? Há sim. <strong>Enquanto se espera</strong> que o coração entenda.</p><p><em>LISPECTOR, C. O que é angústia. Todas as crônicas. Rio de Janeiro: Rocco, 2018, p. 535 — adaptado</em></p>',
    options: [
      { id: 'A', text: 'I.', is_correct: false },
      { id: 'B', text: 'II.', is_correct: true },
      { id: 'C', text: 'III.', is_correct: false },
      { id: 'D', text: 'I e II.', is_correct: false },
      { id: 'E', text: 'II e III.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Onde a ênclise cabe',
        meta: slideMeta,
        items: [
          { label: 'I — não se', detail: 'Negação → próclise; ênclise vetada.', icon: 'Ban' },
          { label: 'II — se contrai', detail: 'Reflexivo: se contrai ou contrai-se.', icon: 'Check' },
          { label: 'III — se espera que', detail: 'Se impessoal + que → só próclise.', icon: 'Ban' },
          { label: 'Só II', detail: 'Único trecho com ênclise alternativa.', icon: 'Filter' },
        ],
        footer_rule: 'Ênclise não vetada só no II.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Lispector: angústia, vazio, coração que entende.',
          'I: «não se confessar» — não atrai → próclise fixa; sem confessar-se.',
          'II: «se contrai» — reflexivo; admite contrai-se (ênclise).',
          'III: «Enquanto se espera que» — se impessoal + que → próclise.',
          'Pergunta: onde a ênclise NÃO é vetada? Só II.',
          'Gabarito B.',
          'Em similares: teste cada excerto separadamente.',
        ],
        footer_rule: 'B = só o excerto II.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ÊNCLISE VETADA?',
        rows: [
          { label: 'I — não se', value: 'próclise; ênclise vetada' },
          { label: 'II — se contrai', value: 'contrai-se possível' },
          { label: 'III — se espera que', value: 'próclise; ênclise vetada' },
          { label: 'Nesta questão', value: 'B — apenas II' },
        ],
        footer_rule: 'Só II admite ênclise alternativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Generalizar I ou III como flexíveis',
        items: [
          { label: 'A — só I', detail: 'Negação barra ênclise em I.', correct: 'confessar-se não cabe após não.' },
          { label: 'C — só III', detail: 'Se impessoal com que exige próclise.', correct: 'Espera-se não substitui se espera que.' },
          { label: 'D — I e II', detail: 'Inclui I indevidamente.', correct: 'I veta ênclise por causa do não.' },
          { label: 'E — II e III', detail: 'III também veta ênclise.', correct: 'Só II tem alternativa enclítica.' },
          { label: 'Em outra banca…', detail: 'Trocam Lispector por outro autor.', correct: 'Mesmo teste: não/que vs reflexivo livre.' },
        ],
        footer_rule: 'B passa: ênclise ok só em II.',
      },
    ],
  },

  'avancasp-caieiras-colocacao-enclise-norma-3375896': {
    family: 'conceito',
    source_tec_id: '3375896',
    source_note: 'Colocação ênclise conforme — AVANÇASP Aux Caieiras 2025 tec 3375896',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Aux (Pref Caieiras) Administrativo',
      orgao: 'Pref. Caieiras',
      ano: '2025',
    },
    instruction: 'A ênclise está aplicada em conformidade com a norma-padrão da língua portuguesa apenas em:',
    options: [
      { id: 'A', text: 'Despedirei-me dos alunos assim que possível.', is_correct: false },
      { id: 'B', text: 'Um dia tudo transforma-se em pó.', is_correct: false },
      { id: 'C', text: 'Sempre lembro-me daquele verão.', is_correct: false },
      { id: 'D', text: 'A companhia de teatro enviou uma carta, convidando-o para o evento.', is_correct: true },
      { id: 'E', text: 'Aquela conversa teria dado-lhe ainda mais expectativas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Uma ênclise certa',
        meta: slideMeta,
        items: [
          { label: 'A — Despedirei-me', detail: 'Futuro: mesóclise ou próclise, não assim.', icon: 'X' },
          { label: 'B — transforma-se', detail: 'Se impessoal: transforma-se ok, mas banca barra.', icon: 'AlertTriangle' },
          { label: 'C — lembro-me', detail: 'Sempre atrai → Sempre me lembro.', icon: 'X' },
          { label: 'D — convidando-o', detail: 'Gerúndio/infinito: ênclise correta.', icon: 'Check' },
        ],
        footer_rule: 'Só D passa no trilho da banca.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual frase tem ênclise conforme a norma?',
          'A: «Despedirei-me» — futuro do indicativo; forma inadequada (mesóclise/problema).',
          'B: «transforma-se» — se impessoal; banca não aceita como modelo.',
          'C: «Sempre lembro-me» — Sempre atrai → Sempre me lembro.',
          'E: «dado-lhe» — mesóclise no condicional; não ênclise simples.',
          'D: «convidando-o» — infinitivo/gerúndio sem atrativo → ênclise ok.',
          'Gabarito D.',
        ],
        footer_rule: 'D = convidando-o.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ÊNCLISE CONFORME',
        rows: [
          { label: 'Infinitivo/gerúndio', value: 'convidando-o — ênclise ok' },
          { label: 'Futuro A', value: 'Despedirei-me — reprovado' },
          { label: 'Sempre C', value: 'Sempre me lembro — próclise' },
          { label: 'Nesta questão', value: 'D' },
        ],
        footer_rule: 'Gerúndio enclítico em D.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Ênclises plausíveis que a banca barra',
        items: [
          { label: 'A — Despedirei-me', detail: 'Futuro com mesóclise questionável.', correct: 'Banca não aceita como única correta.' },
          { label: 'B — transforma-se', detail: 'Se impessoal enclítico.', correct: 'Gramatical, mas não é o gabarito.' },
          { label: 'C — lembro-me', detail: 'Advérbio «Sempre» atrai.', correct: 'Sempre me lembro daquele verão.' },
          { label: 'E — dado-lhe', detail: 'Mesóclise no condicional.', correct: 'Não é ênclise simples conforme.' },
          { label: 'Em outra banca…', detail: 'Trocam «convidando-o» por «convidá-lo».', correct: 'Mesmo trilho: infinitivo + o enclítico.' },
        ],
        footer_rule: 'D passa: convidando-o para o evento.',
      },
    ],
  },

  'avancasp-morungaba-colocacao-proclise-vetada-3376869': {
    family: 'conceito',
    source_tec_id: '3376869',
    source_note: 'Colocação próclise vetada — AVANÇASP Ag Morungaba 2025 tec 3376869',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref Morungaba) Administrativo I',
      orgao: 'Pref. Morungaba',
      ano: '2025',
    },
    instruction:
      'Em relação à colocação pronominal, de acordo com a norma-padrão da língua portuguesa, o único caso em que não se poderia aplicar a próclise é:',
    options: [
      { id: 'A', text: 'Deixei-me levar pelas aparências.', is_correct: true },
      { id: 'B', text: 'Ela pediu-lhe que fizesse as compras da semana.', is_correct: false },
      { id: 'C', text: 'A família planejar-se-ia para as férias.', is_correct: false },
      { id: 'D', text: 'Comprei este presente para agradá-lo.', is_correct: false },
      { id: 'E', text: 'Usaria esta roupa, mas decidi emprestá-la.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Onde a próclise não cabe',
        meta: slideMeta,
        items: [
          { label: 'A — Deixei-me', detail: 'Início de frase → ênclise obrigatória.', icon: 'Flag' },
          { label: 'B — pediu-lhe que', detail: 'Que atrai → que lhe fizesse (próclise possível).', icon: 'Link' },
          { label: 'C — planejar-se-ia', detail: 'Mesóclise; próclise alternativa existe.', icon: 'Split' },
          { label: 'D/E — infinitivo', detail: 'agradá-lo / emprestá-la — ênclise; próclise em outro contexto.', icon: 'ArrowRight' },
        ],
        footer_rule: 'Início de frase veta próclise.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: único caso em que NÃO se poderia aplicar próclise.',
          'A: «Deixei-me levar» — início → Me deixei levar é proibido.',
          'B: «pediu-lhe que fizesse» — que permite próclise na subordinada.',
          'C: «planejar-se-ia» — mesóclise; se a família se planejasse (próclise possível).',
          'D: «agradá-lo» — infinitivo enclítico; em outra construção cabe próclise.',
          'E: «emprestá-la» — idem D.',
          'Só A impede próclise de forma absoluta no trecho.',
          'Gabarito A.',
        ],
        footer_rule: 'A = próclise impossível no início.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INÍCIO = ÊNCLISE',
        rows: [
          { label: 'Início de frase', value: 'Deixei-me — não «Me deixei»' },
          { label: 'Que / subordinada', value: 'próclise possível (B)' },
          { label: 'Infinitivo', value: 'agradá-lo / emprestá-la — ênclise' },
          { label: 'Nesta questão', value: 'A' },
        ],
        footer_rule: 'Começo da frase barra próclise.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Achar que todas vetam próclise',
        items: [
          { label: 'B — pediu-lhe que', detail: 'Subordinada admite próclise.', correct: '…que lhe fizesse as compras.' },
          { label: 'C — planejar-se-ia', detail: 'Mesóclise não impede próclise em outra forma.', correct: 'Se a família se planejasse…' },
          { label: 'D — agradá-lo', detail: 'Infinitivo enclítico no trecho.', correct: 'Próclise cabe em outras construções.' },
          { label: 'E — emprestá-la', detail: 'Mesma lógica de D.', correct: 'Ênclise no infinitivo aqui.' },
          { label: 'Em outra banca…', detail: 'Trocam «Deixei-me» por «Vi-me».', correct: 'Mesmo trilho: início → ênclise.' },
        ],
        footer_rule: 'A passa: Deixei-me levar.',
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
