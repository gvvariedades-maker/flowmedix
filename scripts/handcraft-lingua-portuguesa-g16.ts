#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g16 (7 slugs · Colocação pronominal · lote 4 FINAL).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g16.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g16 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g16 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_COLOCACAO_PRONOMINAL } from '@/lib/guidelines/linguaPortuguesa/colocacaoPronominal';

const LOTE = 'lingua-portuguesa-g16';
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
      reviewer: 'handcraft:lingua-portuguesa-g16',
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

const SPECS: Record<string, Spec> = {
  'vunesp-osasco-colocacao-alma-gemea-3607134': {
    family: 'text_fragment',
    source_tec_id: '3607134',
    source_note: 'Colocação alma gêmea Munroe — VUNESP ACS Osasco 2025 tec 3607134',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
    },
    instruction:
      'Em «Um argumento bem simples demonstra que não devemos nos limitar aos seres humanos do passado…» (2º parágrafo), o trecho destacado pode ser substituído, em conformidade com a norma-padrão de concordância e de emprego e colocação dos pronomes, por:',
    text_fragment:
      '<p><strong>E se?</strong> — Randall Munroe (adaptado)</p><p>E se todo mundo realmente tivesse uma alma gêmea, que fosse uma pessoa aleatória em qualquer lugar do mundo? Resposta: seria um pesadelo. Você não sabe nada sobre a pessoa, quem é ou onde está, mas — como diz o clichê — vocês se reconhecerão num cruzar de olhares.</p><p>Para começar, será que sua alma gêmea ainda estaria viva? Uns 100 bilhões de humanos já existiram, mas só 7 bilhões estão vivos no momento. Se fôssemos emparelhados aleatoriamente, 90% de nossas almas gêmeas estariam mortas há muito tempo.</p><p><strong>Um argumento bem simples demonstra que não devemos nos limitar aos seres humanos do passado</strong>, pois também temos que incluir um número incontável de seres humanos do futuro. Se nossa alma gêmea pode estar no passado remoto, então também pode ser possível encontrar almas gêmeas no futuro distante.</p><p>Considerando a restrição de faixa etária, a maioria da humanidade teria uma reserva de aproximadamente meio bilhão de combinações possíveis. As chances de se deparar com seu par perfeito seriam absurdamente pequenas.</p>',
    options: [
      { id: 'A', text: 'não devemos-nos limitar', is_correct: false },
      { id: 'B', text: 'não nos devemos limitar', is_correct: true },
      { id: 'C', text: 'não devemos limitar-se', is_correct: false },
      { id: 'D', text: 'não devemos se limitar', is_correct: false },
      { id: 'E', text: 'não devemos limitá-nos', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alma gêmea: não + limitar',
        meta: slideMeta,
        items: [
          { label: 'pesadelo / alma gêmea', detail: 'Munroe (adaptado): emparelhamento aleatório.', icon: 'Heart' },
          { label: 'argumento simples', detail: 'Não limitar só ao passado — incluir futuro.', icon: 'Scale' },
          { label: 'seres humanos', detail: 'Passado e futuro — não devemos nos limitar.', icon: 'Users' },
          { label: 'não devemos nos limitar', detail: 'Reflexivo com modal + infinitivo.', icon: 'Filter' },
          { label: 'não nos devemos limitar', detail: 'Próclise do átono antes do verbo.', icon: 'Check' },
          { label: 'limitá-nos / limitar-se', detail: 'Ênclise após não — vetada.', icon: 'X' },
          { label: 'devemos-nos', detail: 'Hífen/mesóclise não cabe aqui.', icon: 'Ban' },
        ],
        footer_rule: 'B: não nos devemos limitar.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Munroe (adaptado): alma gêmea aleatória seria um pesadelo estatístico.',
          'Trecho: «não devemos nos limitar aos seres humanos do passado».',
          'Não atrai próclise; reflexivo se/limitar exige posição correta.',
          'A: «devemos-nos» — mesóclise inexistente no infinitivo composto.',
          'B: «não nos devemos limitar» — próclise conforme com não.',
          'C/E: ênclise (limitar-se / limitá-nos) após não — inadequada.',
          'D: «se limitar» separado do verbo modal — colocação frágil.',
          'Gabarito B — não nos devemos limitar.',
        ],
        footer_rule: 'B = próclise: não nos devemos limitar.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÃO + MODAL',
        rows: [
          { label: 'não atrai', value: 'próclise: não nos limitarmos / não nos devemos limitar' },
          { label: '≠ limitá-nos', value: 'ênclise vetada após não' },
          { label: '≠ devemos-nos', value: 'não há mesóclise no infinitivo' },
          { label: 'Nesta questão', value: 'B — não nos devemos limitar' },
        ],
        footer_rule: 'Com não, prefira próclise do átono.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Ênclise onde não cabe',
        items: [
          { label: 'A — devemos-nos limitar', detail: 'Mesóclise não se aplica ao infinitivo.', correct: 'não nos devemos limitar.' },
          { label: 'C — limitar-se', detail: 'Ênclise após não é inadequada.', correct: 'Próclise: não nos limitarmos.' },
          { label: 'D — se limitar', detail: 'Átono solto antes do infinitivo.', correct: 'não nos devemos limitar — pronome antes do verbo.' },
          { label: 'E — limitá-nos', detail: 'Hífen enclítico após não.', correct: 'Não atrai → não nos devemos limitar.' },
          { label: 'Em outra banca…', detail: 'Trocam «limitar» por «restringir».', correct: 'Mesmo trilho: não → próclise.' },
        ],
        footer_rule: 'B passa: não nos devemos limitar.',
      },
    ],
  },

  'facet-bom-jardim-colocacao-obliquo-3614688': {
    family: 'text_fragment',
    source_tec_id: '3614688',
    source_note: 'Colocação oblíquo Nova Escola — FACET AAd Bom Jardim PE 2025 tec 3614688',
    meta: {
      banca: 'FACET',
      prova: 'AAd (Pref Bom Jardim PE)',
      orgao: 'Pref. Bom Jardim PE',
      ano: '2025',
    },
    instruction:
      'Quando estudamos os pronomes, conhecemos um procedimento como colocação pronominal. A estrutura que está de acordo com as regras apresentadas no texto é:',
    text_fragment:
      '<p><strong>S.O.S. Português</strong> — Coluna «Na dúvida», Nova Escola, dez. 2008 (adaptado)</p><p>Por que os pronomes oblíquos têm esse nome e quais as regras para utilizá-los?</p><p>As expressões «pronome oblíquo» e «pronome reto» são oriundas do latim (<em>casus obliquus</em> e <em>casus rectus</em>). Elas eram usadas para classificar as palavras de acordo com a função sintática. Quando estavam como sujeito, pertenciam ao caso reto. Se exerciam outra função (exceto a de vocativo), eram relacionadas ao caso oblíquo, pois um dos sentidos da palavra oblíquo é «não é direito ou reto».</p><p>Os pronomes pessoais da língua portuguesa seguem o mesmo padrão: os que desempenham a função de sujeito (eu, tu, ele, nós, vós e eles) são os pessoais do caso reto; e os que normalmente têm a função de complementos verbais (me, mim, comigo, te, ti, contigo, o, os, a, as, lhe, lhes, se, si, consigo, nos, conosco, vos e convosco) são os do caso oblíquo.</p>',
    options: [
      { id: 'A', text: 'Nunca o vi assim.', is_correct: true },
      { id: 'B', text: 'Isso lembra-me algo.', is_correct: false },
      { id: 'C', text: 'Te deram a notícia quando?', is_correct: false },
      { id: 'D', text: 'O seu maior sonho é se casar.', is_correct: false },
      { id: 'E', text: 'Lhe fiz a pessoa mais feliz do mundo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Oblíquo na colocação',
        meta: slideMeta,
        items: [
          { label: 'S.O.S. Português', detail: 'Nova Escola — reto vs oblíquo.', icon: 'BookOpen' },
          { label: 'Nunca o vi', detail: 'Nunca atrai → próclise correta.', icon: 'Check' },
          { label: 'Te deram', detail: 'Início de frase → Deram-te.', icon: 'X' },
          { label: 'se casar', detail: 'Infinitivo reflexivo → casar-se.', icon: 'X' },
          { label: 'Lhe fiz', detail: 'Sem atrativo inicial → Fiz-lhe.', icon: 'X' },
        ],
        footer_rule: 'A: Nunca o vi assim.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Nova Escola: pronomes retos e oblíquos; colocação pronominal.',
          'Comando: qual frase está conforme a norma-padrão?',
          'A: «Nunca o vi assim» — nunca atrai o pronome → próclise → CERTA.',
          'B: «Isso lembra-me» — ênclise aceitável, mas não é a resposta da banca.',
          'C: «Te deram» — início de frase veta próclise → Deram-te.',
          'D: «se casar» — infinitivo reflexivo → casar-se.',
          'E: «Lhe fiz» — início sem atrativo → Fiz-lhe a pessoa…',
          'Gabarito A — Nunca o vi assim.',
        ],
        footer_rule: 'A = próclise após nunca.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ATRATIVO NUNCA',
        rows: [
          { label: 'Nunca o vi', value: 'próclise — atrativo nunca' },
          { label: 'Início de frase', value: 'Deram-te / Fiz-lhe — ênclise' },
          { label: 'Infinitivo reflexivo', value: 'casar-se — não se casar' },
          { label: 'Nesta questão', value: 'A — Nunca o vi assim' },
        ],
        footer_rule: 'Nunca atrai o pronome oblíquo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Próclise no início',
        items: [
          { label: 'B — lembra-me', detail: 'Ênclise possível, mas banca marca A.', correct: 'Nunca o vi — próclise por atrativo.' },
          { label: 'C — Te deram', detail: 'Próclise proibida no início.', correct: 'Deram-te a notícia quando?' },
          { label: 'D — se casar', detail: 'Reflexo enclítico no infinitivo.', correct: 'O sonho é casar-se.' },
          { label: 'E — Lhe fiz', detail: 'Início sem atrativo → ênclise.', correct: 'Fiz-lhe a pessoa mais feliz…' },
          { label: 'Em outra banca…', detail: 'Trocam «Nunca» por «Jamais».', correct: 'Mesmo trilho: atrativo → próclise.' },
        ],
        footer_rule: 'A passa: Nunca o vi assim.',
      },
    ],
  },

  'avancasp-cerquilho-colocacao-enclise-vetada-3661739': {
    family: 'conceito',
    source_tec_id: '3661739',
    source_note: 'Colocação ênclise vetada quem — AVANÇASP ACS Cerquilho 2025 tec 3661739',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Cerquilho)',
      orgao: 'Pref. Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'A ênclise é vetada apenas em:',
    options: [
      { id: 'A', text: 'Quem te disse que isto era para você?', is_correct: true },
      { id: 'B', text: 'Ela tinha de nos contar tudo.', is_correct: false },
      { id: 'C', text: 'O rapaz conseguiu a encontrar.', is_correct: false },
      { id: 'D', text: 'Agora é a hora de nos dizer toda a verdade.', is_correct: false },
      { id: 'E', text: 'Eu, mesmo desapontada, lhe dei a chance de mudar.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Onde ênclise é vetada',
        chip_label: 'Quem atrai',
        meta: slideMeta,
        items: [
          { label: 'Quem te disse', detail: 'Quem atrai → só próclise; ênclise vetada.', icon: 'Check' },
          { label: 'tinha de nos contar', detail: 'De + infinitivo admite contar-nos.', icon: 'ArrowRight' },
          { label: 'hora de nos dizer', detail: 'Mesmo trilho: dizer-nos possível.', icon: 'ArrowRight' },
          { label: 'lhe dei', detail: 'Próclise após vírgula — não vetam ênclise global.', icon: 'ArrowLeft' },
        ],
        footer_rule: 'Só A veta ênclise por atrativo quem.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: em qual frase a ênclise é vetada (só próclise)?',
          'A: «Quem te disse» — quem é atrativo forte → Disse-te? NÃO → Quem te disse.',
          'B: «tinha de nos contar» — infinitivo pode receber ênclise: contar-nos.',
          'C: «conseguiu a encontrar» — colocação estranha, mas não é caso de quem.',
          'D: «de nos dizer» — ênclise dizer-nos admissível após preposição.',
          'E: «lhe dei» — próclise ok; não é vetar ênclise por quem/nunca.',
          'Gabarito A — Quem te disse que isto era para você?',
        ],
        footer_rule: 'A = quem → próclise obrigatória.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUEM VETA ÊNCLISE',
        rows: [
          { label: 'Quem', value: 'Quem te disse — só próclise' },
          { label: 'De + infinitivo', value: 'contar-nos / dizer-nos — ênclise ok' },
          { label: '≠ Disse-te', value: 'ênclise vetada após quem' },
          { label: 'Nesta questão', value: 'A — Quem te disse' },
        ],
        footer_rule: 'Quem atrai → pronome antes do verbo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir vetos',
        items: [
          { label: 'B — nos contar', detail: 'Ênclise no infinitivo não é vetada.', correct: '…de contar-nos tudo.' },
          { label: 'C — a encontrar', detail: 'Regência estranha, não é quem.', correct: 'Veto de ênclise = atrativo quem.' },
          { label: 'D — nos dizer', detail: 'Após de, ênclise possível.', correct: '…de dizer-nos toda a verdade.' },
          { label: 'E — lhe dei', detail: 'Próclise por pausa, não vetar ênclise global.', correct: 'Quem/nunca/jamais vetam ênclise.' },
          { label: 'Em outra banca…', detail: 'Trocam «Quem» por «Ninguém».', correct: 'Mesmo trilho: atrativo → só próclise.' },
        ],
        footer_rule: 'A passa: Quem te disse.',
      },
    ],
  },

  'avancasp-cerquilho-colocacao-domingo-3662934': {
    family: 'text_fragment',
    source_tec_id: '3662934',
    source_note: 'Colocação Domingo Oliveira — AVANÇASP ACE Cerquilho 2025 tec 3662934',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACE (Pref Cerquilho)',
      orgao: 'Pref. Cerquilho',
      ano: '2025',
    },
    instruction:
      'Quanto à colocação pronominal, nos excertos\n\nI. «Falta-me um terremoto sem grandes consequências ali no Alasca ou mais ao norte»\nII. «Quero saber se alguma esquiva amada me chora»\nIII. «Quero saber com quantos furos na blusa me derrubaram»\n\nverifica-se:',
    text_fragment:
      '<p><strong>Domingo</strong> — José Carlos Oliveira (adaptado)</p><p>Um dia sem jornais é como um domingo chuvoso. Há tempo para tudo, mas a chuva estraga. Há tempo ao longo da rua, tempo de telefone e presença, mas falta aprofundidade de um sol. Em que mundo estamos? Não sabemos.</p><p><strong>Falta-me um terremoto sem grandes consequências ali no Alasca ou mais ao norte.</strong> Coleciono fugitivos de Berlim Oriental; mas hoje a minha coleção está desfalcada. Preciso tomar conta do mundo, preciso estar em contato. Sou amigo íntimo dos satélites artificiais.</p><p>Em São Domingos morro e não me avisam: o rádio grita informações sintéticas, mas eu quero detalhes. <strong>Quero saber com quantos furos na blusa me derrubaram.</strong> <strong>Quero saber se alguma esquiva amada me chora</strong> ou se a polícia política conhece a minha ficha.</p><p>Arre! Que fome de dados! O meu domingo é pobre, chove no mar, e os cinemas só exibem filmes que já vimos. Então é preciso ler o jornal, a informação seca.</p>',
    options: [
      { id: 'A', text: 'a ênclise em II e III.', is_correct: false },
      { id: 'B', text: 'a próclise em II e III.', is_correct: true },
      { id: 'C', text: 'a mesóclise em I.', is_correct: false },
      { id: 'D', text: 'a próclise em I.', is_correct: false },
      { id: 'E', text: 'a próclise em I e a ênclise em II e III.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Domingo: três excertos',
        meta: slideMeta,
        items: [
          { label: 'I — Falta-me', detail: 'Pronome após o verbo → ênclise.', icon: 'ArrowRight' },
          { label: 'II — me chora', detail: 'Pronome antes do verbo → próclise.', icon: 'ArrowLeft' },
          { label: 'III — me derrubaram', detail: 'Pronome antes do verbo → próclise.', icon: 'ArrowLeft' },
          { label: 'crônica / jornal', detail: 'Domingo chuvoso — fome de dados.', icon: 'Newspaper' },
        ],
        footer_rule: 'B: próclise em II e III.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Oliveira: domingo sem jornal, fome de informação.',
          'I: «Falta-me um terremoto» — me depois do verbo → ênclise.',
          'II: «me chora» — me antes do verbo → próclise.',
          'III: «me derrubaram» — me antes do verbo → próclise.',
          'A/E erram ao marcar ênclise em II e III.',
          'C/D erram ao classificar I como mesóclise ou próclise.',
          'Fixação: átono depois = ênclise (I); antes = próclise (II/III) — gabarito B.',
        ],
        footer_rule: 'B = próclise em II e III; I = ênclise.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'I · II · III',
        rows: [
          { label: 'I — Falta-me', value: 'ênclise — pronome depois' },
          { label: 'II — me chora', value: 'próclise — pronome antes' },
          { label: 'III — me derrubaram', value: 'próclise — pronome antes' },
          { label: 'Nesta questão', value: 'B — próclise em II e III' },
        ],
        footer_rule: 'Identifique posição do átono.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Inverter I com II/III',
        items: [
          { label: 'A — ênclise II e III', detail: 'II e III têm me antes do verbo.', correct: '…amada me chora; …blusa me derrubaram.' },
          { label: 'C — mesóclise em I', detail: 'Falta-me é ênclise simples.', correct: 'Não há pronome intercalado em I.' },
          { label: 'D — próclise em I', detail: 'I tem me após o verbo.', correct: 'Falta-me = ênclise.' },
          { label: 'E — próclise I + ênclise II/III', detail: 'Dupla inversão.', correct: 'I ênclise; II e III próclise.' },
          { label: 'Em outra banca…', detail: 'Trocam «Falta-me» por «Sinto-me».', correct: 'Mesmo teste: posição do átono.' },
        ],
        footer_rule: 'B passa: próclise em II e III.',
      },
    ],
  },

  'avancasp-fmsrc-colocacao-quantos-norma-3665306': {
    family: 'conceito',
    source_tec_id: '3665306',
    source_note: 'Colocação quantos conformes — AVANÇASP Fono FMSRC 2025 tec 3665306',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Fono (FMSRC)',
      orgao: 'FMSRC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Quanto à colocação pronominal, analise os enunciados:\n\nI - "Ela jamais me perdoaria uma falta."\nII - "Nunca faltou-me quem ajudasse."\nIII - "Se ligue nas ondas do rádio."\nIV - "Os convidados da festa presentearam-me."\nV - "Feliz daquele que dedica-se aos animais."\n\nEntre os enunciados acima, quantos se apresentam de acordo com a norma-padrão em relação aos elementos destacados?',
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

  'cespe-boa-vista-colocacao-memoria-3705166': {
    family: 'text_fragment',
    source_tec_id: '3705166',
    source_note: 'Colocação memória Verissimo — CEBRASPE Ass Tec Sau Boa Vista 2025 tec 3705166',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ass Tec Sau (Pref Boa Vista) Técnico em Laboratório',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considerando o texto CG2A1, julgue os itens a seguir, relativos à colocação pronominal.\n\nI O trecho «e botei a ideia num papel» (segundo período do terceiro parágrafo) poderia ser reescrito, sem prejuízo da correção gramatical, como e botei-a num papel.\n\nII No trecho «e anotei-a assim que acordei» (quarto período do terceiro parágrafo), caso se deslocasse o segmento «assim que acordei» para depois da conjunção «e», com o devido ajuste na pontuação, o pronome «a» teria, obrigatoriamente, de ser colocado em posição proclítica, da seguinte forma: e, assim que acordei, a anotei.\n\nIII O trecho «a frase me faria lembrar» (primeiro período do último parágrafo) poderia ser reescrito como a frase faria me lembrar ou como a frase faria lembrar-me, sem prejuízo da correção gramatical do texto.\n\nAssinale a opção correta.',
    text_fragment:
      '<p><strong>Memória e anotações</strong> — Luís Fernando Verissimo (Estadão, 22/9/2011 — adaptado)</p><p>Imagino que a escrita nasceu da necessidade de não esquecer. O primeiro pré-homem que pensou «preciso me lembrar disso» deve ter olhado em volta procurando alguma coisa que ele ainda não sabia o que era. Era um pedaço de papel e uma Bic.</p><p>A angústia primordial foi a de perder o pensamento fugidio ou a cena insólita. Pense em quantas ideias não desapareceram para sempre por falta de algo que as retivesse na memória e no mundo.</p><p>E mesmo com todas as formas de anotação inventadas pelo homem, a angústia persiste. Estou escrevendo isto porque acordei com uma boa ideia para um texto e <strong>botei a ideia num papel</strong>. Normalmente não faço isso, porque sempre me esqueço de ter um bloco de notas à mão.</p><p>Mas desta vez a ideia coincidiu com a proximidade de um pedaço de papel e um lápis, e <strong>anotei-a assim que acordei</strong>. Não exatamente a ideia, mas uma frase que me faria lembrar da ideia. Estou com ela aqui. «Conhece-te a ti mesmo, mas não fique íntimo».</p><p>E não consigo me lembrar de qual era a ideia de que <strong>a frase me faria lembrar</strong>. Algo sobre os perigos da autoanálise muito aprofundada? Ou o quê? Não consigo me lembrar.</p>',
    options: [
      { id: 'A', text: 'Apenas o item I está certo.', is_correct: true },
      { id: 'B', text: 'Apenas o item III está certo.', is_correct: false },
      { id: 'C', text: 'Apenas os itens I e II estão certos.', is_correct: false },
      { id: 'D', text: 'Apenas os itens II e III estão certos.', is_correct: false },
      { id: 'E', text: 'Todos os itens estão certos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Verissimo: três itens',
        meta: slideMeta,
        items: [
          { label: 'memória / anotações', detail: 'Ideia no papel — angústia de esquecer.', icon: 'FileText' },
          { label: 'I — botei-a', detail: 'Ênclise do a — reescrita ok.', icon: 'Check' },
          { label: 'II — a anotei', detail: 'Deslocar advérbio → próclise obrigatória.', icon: 'X' },
          { label: 'III — me faria lembrar', detail: 'Alternativas faria me / lembrar-me erradas.', icon: 'X' },
        ],
        footer_rule: 'Só I está certo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Verissimo: ideia ao acordar, anotação, esquecimento.',
          'I: «botei a ideia» → «botei-a num papel» — ênclise do objeto → CERTO.',
          'II: deslocar «assim que acordei» exige «a anotei» — item marcado ERRADO.',
          'III: «me faria lembrar» — não vira «faría me» nem «lembrar-me» → ERRADO.',
          'Correto: apenas I.',
          'Gabarito A — Apenas o item I está certo.',
        ],
        footer_rule: 'A = só I conforme.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'I · II · III',
        rows: [
          { label: 'I — botei-a', value: 'ênclise do OD — ok' },
          { label: 'II — anotei-a', value: 'Deslocamento muda colocação — item errado na prova' },
          { label: 'III — me faria lembrar', value: 'próclise fixa — não lembrar-me' },
          { label: 'Nesta questão', value: 'A — Apenas I' },
        ],
        footer_rule: 'Só I passa no gabarito CEBRASPE.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Salvar II ou III',
        items: [
          { label: 'B — só III', detail: 'III troca próclise por ênclise indevida.', correct: '…a frase me faria lembrar — fixo.' },
          { label: 'C — I e II', detail: 'II não está certo no gabarito.', correct: 'Só I: botei-a num papel.' },
          { label: 'D — II e III', detail: 'Ambos falham no trilho.', correct: 'Apenas I correto.' },
          { label: 'E — todos certos', detail: 'II e III têm colocação inadequada.', correct: 'Só I: ênclise botei-a.' },
          { label: 'Em outra banca…', detail: 'Trocam «botei-a» por «a botei».', correct: 'Mesmo teste: posição do átono.' },
        ],
        footer_rule: 'A passa: Apenas o item I.',
      },
    ],
  },

  'avancasp-sm-arcanjo-colocacao-afirmativas-3709831': {
    family: 'conceito',
    source_tec_id: '3709831',
    source_note: 'Colocação afirmativas ênclise — AVANÇASP Ag SM Arcanjo 2025 tec 3709831',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref SM Arcanjo) Saneamento',
      orgao: 'Pref. SM Arcanjo',
      ano: '2025',
    },
    instruction:
      'Com relação à colocação pronominal, analise as afirmativas a seguir sobre a ênclise e, em seguida, assinale a alternativa correta:\n\nI. Um exemplo de ênclise é quando há palavras negativas antes do verbo, as quais atraem o pronome, por exemplo: Não o ajudo mais!\n\nII. A ênclise ocorre quando o pronome é colocado depois do verbo, por exemplo: Cale-se agora!\n\nIII. Quando o pronome é colocado intercalado no verbo, chamamos de ênclise, por exemplo: Se puder, Michael visitar-me-á antes de partir.\n\nIV. Ocorre ênclise quando o verbo estiver no gerúndio sem que seja introduzido pela preposição «em», por exemplo: Suelen vive castigando-lhe de forma injusta.',
    options: [
      { id: 'A', text: 'Apenas II e IV estão corretas.', is_correct: true },
      { id: 'B', text: 'Apenas I, II e III estão corretas.', is_correct: false },
      { id: 'C', text: 'Apenas II e III estão corretas.', is_correct: false },
      { id: 'D', text: 'Apenas I e III estão corretas.', is_correct: false },
      { id: 'E', text: 'Apenas I e IV estão corretas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro definições de ênclise',
        meta: slideMeta,
        items: [
          { label: 'I — Não o ajudo', detail: 'Negativa atrai → PRÓCLISE, não ênclise.', icon: 'X' },
          { label: 'II — Cale-se', detail: 'Pronome depois do verbo → ênclise.', icon: 'Check' },
          { label: 'III — visitar-me-á', detail: 'Intercalado = MESÓCLISE, não ênclise.', icon: 'X' },
          { label: 'IV — castigando-lhe', detail: 'Gerúndio enclítico → ênclise.', icon: 'Check' },
        ],
        footer_rule: 'Só II e IV definem ênclise.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quais afirmativas sobre ÊNCLISE estão corretas?',
          'I: «Não o ajudo» — negativa atrai próclise → definição ERRADA.',
          'II: «Cale-se agora!» — pronome após o verbo → ênclise → CERTA.',
          'III: «visitar-me-á» — pronome intercalado → mesóclise → ERRADA.',
          'IV: «castigando-lhe» — gerúndio com pronome enclítico → ênclise → CERTA.',
          'Corretas: II e IV apenas.',
          'Gabarito A — Apenas II e IV estão corretas.',
        ],
        footer_rule: 'A = II e IV conformes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ÊNCLISE · MESÓCLISE',
        rows: [
          { label: 'Ênclise', value: 'Cale-se; castigando-lhe — depois do verbo' },
          { label: 'Próclise', value: 'Não o ajudo — negativa atrai' },
          { label: 'Mesóclise', value: 'visitar-me-á — intercalado no futuro' },
          { label: 'Nesta questão', value: 'A — Apenas II e IV' },
        ],
        footer_rule: 'Não confunda ênclise com mesóclise.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Definições trocadas',
        items: [
          { label: 'B — I, II e III', detail: 'I é próclise; III é mesóclise.', correct: 'Só II e IV são ênclise.' },
          { label: 'C — II e III', detail: 'III não define ênclise.', correct: 'visitar-me-á = mesóclise.' },
          { label: 'D — I e III', detail: 'I confunde atrativo negativo.', correct: 'Não o ajudo = próclise.' },
          { label: 'E — I e IV', detail: 'I está errada.', correct: 'Negativa não exemplifica ênclise.' },
          { label: 'Em outra banca…', detail: 'Trocam «Cale-se» por «Não se cale».', correct: 'Mesmo trilho: posição do átono.' },
        ],
        footer_rule: 'A passa: Apenas II e IV.',
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
