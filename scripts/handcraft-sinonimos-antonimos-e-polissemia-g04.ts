#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g04 (8 slugs · lote 4).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g04.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g04 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g04 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g04';
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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g04',
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
  'avancasp-aux-sinonimos-ate-breve-ha-temperamentos-urbanos-p-3375891': {
    family: 'text_fragment',
    source_tec_id: '3375891',
    source_note: '«elementar» ≈ fundamental — Rachel de Queiroz «Até breve» — AVANÇASP Aux Pref Caieiras Administrativo 2025 tec 3375891',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Aux (Pref Caieiras)',
      orgao: 'Pref. Caieiras',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nUm termo sinônimo de «elementar», no excerto «lembrarei também a verdade elementar de que não há perspectiva sem distância», é:',
    text_fragment:
      'Até breve — Rachel de Queiroz (adaptado)\n\nHá temperamentos urbanos por nascimento, mas há, igualmente, os temperamentos rurais. Uns só podem viver no asfalto; o rural, ao contrário, só consegue viver na cidade como escafandrista debaixo d\'água: de vez em quando carece ir à tona, a fim de se livrar da pressão.\n\nEis por que esta semana me parto, em procura do retiro sertanejo de todos os anos. Dirá quem não gosta de mim que isso é folga, que lugar de cronista é no asfalto. E eu responderei que folgados têm muitos, mas não sou desses, minha lei e minha fé é o esforço e o sofrimento; e lembrarei também a verdade elementar de que não há perspectiva sem distância, e se há uma coisa neste país de que carecemos tanto quanto de divisas fortes, é de perspectiva. Vivemos dentro demais dos acontecimentos, somos absorvidos por eles, sugestionados por eles, exacerbados por eles.\n\nVocês aqui pensam que são os únicos seres vivos do mundo — ou pelo menos do só mundo que interessa. Deixem-me ir para lá um pouquinho, para ver se lhes mando o eco do que vocês cantam. Adeus, Guanabara, adeus!',
    options: [
      { id: 'A', text: 'indiferente.', is_correct: false },
      { id: 'B', text: 'ocasional.', is_correct: false },
      { id: 'C', text: 'transcendente.', is_correct: false },
      { id: 'D', text: 'inigualável.', is_correct: false },
      { id: 'E', text: 'fundamental.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Verdade elementar',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Elementar', detail: 'Básico, essencial — verdade simples e central.', icon: 'Layers' },
          { label: 'Fundamental', detail: 'Que forma a base — equivalência lexical.', icon: 'Anchor' },
          { label: 'Perspectiva', detail: 'Exige distância — tema da crônica.', icon: 'Eye' },
          { label: 'Rachel de Queiroz', detail: '«Até breve» — cronista rural × urbano.', icon: 'BookOpen' },
          { label: 'Pergunta-teste', detail: 'Qual adjetivo mantém «verdade básica»?', icon: 'HelpCircle' },
          { label: 'Pegadinha', detail: 'Trocar por transcendente ou inigualável.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Elementar = básico, essencial — prove no trecho.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica Rachel de Queiroz: retiro sertanejo, perspectiva, distância dos fatos.',
          '«Verdade elementar» = verdade básica, essencial, de base.',
          'A «indiferente»: sem importância — contradiz «verdade» central — eliminar.',
          'B «ocasional»: esporádica — não cobre «elementar» — eliminar.',
          'C «transcendente»: que transcende — campo distinto — eliminar.',
          'D «inigualável»: sem igual — não sinônimo de básico — eliminar.',
          'E «fundamental»: essencial, de fundamento — equivalência — manter.',
          'Gabarito E.',
          'Em similares: elementar ≈ fundamental/básico — prove na «verdade elementar».',
        ],
        footer_rule: 'Elementar ≈ fundamental.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ELEMENTAR',
        rows: [
          { label: 'Elementar', value: 'Básico, essencial, de fundamento.' },
          { label: 'Fundamental', value: 'Sinônimo próximo — verdade de base.' },
          { label: 'Pergunta-teste', value: 'A troca mantém «verdade básica»?' },
          { label: 'Nesta questão', value: 'E — fundamental.' },
        ],
        footer_rule: 'Transcendente ≠ elementar.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Adjetivos fora do campo básico',
        items: [
          { label: 'A — indiferente', detail: 'Sem relevância.', correct: 'Antônimo no contexto: «indiferente» contradiz verdade que a cronista defende como central.' },
          { label: 'B — ocasional', detail: 'Esporádica, eventual.', correct: 'Sinônimo no contexto: «ocasional» não substitui «elementar» (básica).' },
          { label: 'C — transcendente', detail: 'Que vai além do comum.', correct: 'Sinônimo no contexto: «transcendente» não cobre verdade simples de base.' },
          { label: 'D — inigualável', detail: 'Sem par, único.', correct: 'Sinônimo no contexto: «inigualável» não equivale a básico/essencial.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «É elementar que sem descanso não há clareza mental.»',
            correct: 'Sinônimo no contexto: «fundamental» — verdade básica e essencial.',
          },
        ],
        footer_rule: 'E: fundamental.',
      },
    ],
  },

  'avancasp-ag-sinonimos-tome-como-exemplo-o-seguinte-context-3457305': {
    family: 'conceito',
    source_tec_id: '3457305',
    source_note: '«obtuso» ≈ estúpido em colocação — AVANÇASP Ag Pref Caconde Administrativo 2025 tec 3457305',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref Caconde)',
      orgao: 'Pref. Caconde',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Tome como exemplo o seguinte contexto: «Por mais obtuso que tenha sido em sua colocação, todos nós entendemos o seu ponto de vista». A palavra que melhor substitui o termo «obtuso» no contexto dado é:',
    options: [
      { id: 'A', text: 'diligente.', is_correct: false },
      { id: 'B', text: 'estúpido.', is_correct: true },
      { id: 'C', text: 'solícito.', is_correct: false },
      { id: 'D', text: 'incauto.', is_correct: false },
      { id: 'E', text: 'circunspecto.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Obtuso na fala',
        chip_label: 'Contexto',
        meta: slideMeta,
        items: [
          { label: 'Obtuso', detail: 'Tolo, pouco perspicaz — colocação malfeita.', icon: 'MessageCircle' },
          { label: 'Estúpido', detail: 'Sem sagacidade — equivalência no contexto.', icon: 'Brain' },
          { label: 'Colocação', detail: 'Modo de expor o ponto de vista.', icon: 'Mic' },
          { label: 'Pergunta-teste', detail: 'Qual adjetivo mantém crítica à forma de falar?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por circunspecto (cauteloso) ou diligente.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Obtuso = tolo na colocação — não «cauteloso».',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Frase: «Por mais obtuso que tenha sido em sua colocação…» — crítica à forma de expor.',
          '«Obtuso» aqui = insensato, pouco inteligente na exposição.',
          'A «diligente»: aplicado, esforçado — elogio — eliminar.',
          'B «estúpido»: sem perspicácia — equivalência contextual — manter.',
          'C «solícito»: atencioso, prestativo — oposto — eliminar.',
          'D «incauto»: ingênuo, imprudente — campo parcial — eliminar.',
          'E «circunspecto»: cauteloso, prudente — oposto — eliminar.',
          'Gabarito B.',
          'Em similares: obtuso (pessoa/fala) ≈ estúpido/tolo — prove na colocação.',
        ],
        footer_rule: 'Obtuso ≈ estúpido no contexto.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'OBTUSO (CONTEXTO)',
        rows: [
          { label: 'Obtuso', value: 'Insensato, pouco perspicaz (fala/colocação).' },
          { label: 'Estúpido', value: 'Sinônimo contextual — sem sagacidade.' },
          { label: 'Circunspecto', value: 'Cauteloso — antônimo de função.' },
          { label: 'Nesta questão', value: 'B — estúpido.' },
        ],
        footer_rule: 'Diligente/circunspecto = elogio — fora do sentido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Adjetivos de elogio ou campo distinto',
        items: [
          { label: 'A — diligente', detail: 'Aplicado, dedicado.', correct: 'Antônimo no contexto: «diligente» elogia — obtuso critica a colocação.' },
          { label: 'C — solícito', detail: 'Atencioso, prestativo.', correct: 'Antônimo no contexto: solícito é bondade — não tolice na fala.' },
          { label: 'D — incauto', detail: 'Ingênuo, imprudente.', correct: 'Sinônimo no contexto: «incauto» não cobre «obtuso» (falta de perspicácia).' },
          { label: 'E — circunspecto', detail: 'Cauteloso, prudente.', correct: 'Antônimo no contexto: circunspecto opõe-se a colocação tola.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Foi obtuso ao responder na reunião.»',
            correct: 'Sinônimo no contexto: «estúpido» — falta de sagacidade na resposta.',
          },
        ],
        footer_rule: 'B: estúpido.',
      },
    ],
  },

  'avancasp-acd-sinonimos-leia-o-texto-a-seguir-para-responder-3554843': {
    family: 'text_fragment',
    source_tec_id: '3554843',
    source_note: 'antônimo de «danos» = ganhos — tirinha Armandinho — AVANÇASP ACD Pref Vinhedo 2025 tec 3554843',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACD (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nNo segundo quadrinho, Armandinho diz «Escolhi a que mais vicia e mais causa danos à sociedade...».\n\nO termo destacado tem como antônimo qual dos termos abaixo?',
    text_fragment:
      '<p><strong>Armandinho — Alexandre Beck (transcrição adaptada)</strong></p>' +
      '<p><em>1º quadro:</em> Armandinho observa pessoas no celular, absortas nas telas.</p>' +
      '<p><em>2º quadro:</em> Armandinho comenta: «Escolhi a que mais vicia e mais causa <strong>danos</strong> à sociedade...» — referindo-se ao vício em redes sociais.</p>' +
      '<p><em>A pergunta cobra o antônimo de «danos» no contexto da fala: prejuízo × benefício.</em></p>',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'avarias.', is_correct: false },
      { id: 'B', text: 'ganhos.', is_correct: true },
      { id: 'C', text: 'estragos.', is_correct: false },
      { id: 'D', text: 'contratempos.', is_correct: false },
      { id: 'E', text: 'desvantagens.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Danos à sociedade',
        chip_label: 'Tira Armandinho',
        meta: slideMeta,
        items: [
          { label: 'Danos', detail: 'Prejuízos causados pelo vício digital.', icon: 'AlertTriangle' },
          { label: 'Ganhos', detail: 'Benefícios — oposto de danos/prejuízo.', icon: 'TrendingUp' },
          { label: 'Vicia', detail: 'Redes sociais — tema do 2º quadro.', icon: 'Smartphone' },
          { label: 'Armandinho', detail: 'Crítica social na tirinha.', icon: 'Image' },
          { label: 'Pergunta-teste', detail: 'Qual termo é oposto de prejuízo?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por estragos ou avarias (sinônimos de dano).', icon: 'Ban' },
        ],
        footer_rule: 'Antônimo de danos = ganhos (benefício).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Armandinho: «causa danos à sociedade» — prejuízo social.',
          'Pedido: antônimo de «danos» = oposto de prejuízo.',
          'A «avarias»: sinônimo de danos — não antônimo — eliminar.',
          'B «ganhos»: benefícios — oposto de danos — manter.',
          'C «estragos»: sinônimo de danos — eliminar.',
          'D «contratempos»: obstáculos — não antônimo direto — eliminar.',
          'E «desvantagens»: sinônimo de prejuízo — eliminar.',
          'Gabarito B.',
          'Em similares: danos/prejuízo ↔ ganhos/benefícios — prove na tira.',
        ],
        footer_rule: 'Ganhos = antônimo de danos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DANOS × GANHOS',
        rows: [
          { label: 'Danos', value: 'Prejuízos, estragos, malefícios.' },
          { label: 'Ganhos', value: 'Benefícios — antônimo direto.' },
          { label: 'Estragos/avarias', value: 'Sinônimos de danos — pegadinha.' },
          { label: 'Nesta questão', value: 'B — ganhos.' },
        ],
        footer_rule: 'Estragos ≈ danos — não antônimo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sinônimos onde pede antônimo',
        items: [
          { label: 'A — avarias', detail: 'Sinônimo de danos.', correct: 'Sinônimo no contexto: «avarias» ≈ danos — não é oposto.' },
          { label: 'C — estragos', detail: 'Outro sinônimo de danos.', correct: 'Sinônimo no contexto: «estragos» ≈ danos — pede antônimo.' },
          { label: 'D — contratempos', detail: 'Obstáculos, percalços.', correct: 'Sinônimo no contexto: «contratempos» não é oposto direto de danos.' },
          { label: 'E — desvantagens', detail: 'Prejuízos, malefícios.', correct: 'Sinônimo no contexto: «desvantagens» ≈ danos — não antônimo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O projeto trouxe danos ao orçamento municipal.»',
            correct: 'Antônimo no contexto: «ganhos» — benefícios em vez de prejuízos.',
          },
        ],
        footer_rule: 'B: ganhos — antônimo de danos.',
      },
    ],
  },

  'vunesp-ro-sa-sinonimos-leia-o-texto-a-seguir-para-responder-3558409': {
    family: 'text_fragment',
    source_tec_id: '3558409',
    source_note: 'cedo/tarde; declínio/ascensão; essencial/acessório — neurologia Estadão — VUNESP RO SAMU Osasco 2025 tec 3558409',
    meta: {
      banca: 'VUNESP',
      prova: 'RO (SAMU Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão abaixo.\n\nAs palavras destacadas no trecho «Nunca é cedo ou tarde demais para começar…» são antônimas, assim como as palavras dos seguintes pares:',
    text_fragment:
      'Pequenas coisas que os neurologistas gostariam que você fizesse pelo seu cérebro (Estadão — adaptado)\n\nPequenas mudanças na sua rotina diária podem contribuir muito para proteger o centro de controle do seu corpo e prevenir o declínio cognitivo ao longo do tempo. Na verdade, os cientistas acreditam que até 45% dos casos de demência poderiam ser adiados ou evitados com a ajuda de algumas mudanças simples no comportamento.\n\nNunca é cedo ou tarde demais para começar, mas o tempo é essencial quando se trata de fortalecer as defesas do cérebro, especialmente porque geralmente é impossível reverter danos cerebrais depois que eles ocorrem, avisa Eva Feldman, professora de neurologia.\n\nOs neurologistas sabem que o exercício beneficia o cérebro ao aumentar o fluxo sanguíneo. Reduzir o tempo inativo também ajuda. Comer leguminosas, grãos integrais, frutas e verduras pode controlar o colesterol. A higiene bucal previne infecções que podem afetar o cérebro.',
    options: [
      { id: 'A', text: 'proteger e resguardar; mudanças e permanências.', is_correct: false },
      { id: 'B', text: 'beneficia e prejudica; saudável e curado.', is_correct: false },
      { id: 'C', text: 'inativo e produtivo; higiene e asseio.', is_correct: false },
      { id: 'D', text: 'declínio e ascensão; essencial e acessório.', is_correct: true },
      { id: 'E', text: 'futuros e próximos; cognitivo e mental.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cedo ou tarde',
        chip_label: 'Par antônimo',
        meta: slideMeta,
        items: [
          { label: 'Pequenas mudanças', detail: 'Rotina diária — texto sobre o cérebro.', icon: 'Sparkles' },
          { label: 'Cedo × tarde', detail: 'Opostos temporais — modelo do enunciado.', icon: 'Clock' },
          { label: 'Declínio × ascensão', detail: 'Queda × subida — par antônimo.', icon: 'TrendingDown' },
          { label: 'Essencial × acessório', detail: 'Necessário × secundário — par antônimo.', icon: 'Scale' },
          { label: 'Neurologistas', detail: 'Texto Estadão — demência e cérebro.', icon: 'Brain' },
          { label: 'Demência', detail: 'Declínio cognitivo — prevenção no texto.', icon: 'Activity' },
          { label: 'Exercício', detail: 'Fluxo sanguíneo ao cérebro.', icon: 'Dumbbell' },
          { label: 'Pergunta-teste', detail: 'Qual opção traz dois pares antônimos?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar antônimo por sinônimo (proteger/resguardar).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Modelo: cedo/tarde — busque pares opostos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto neurologia Estadão: demência, declínio cognitivo, exercício beneficia o cérebro.',
          'Pedido: outro par com a mesma relação (oposição) nos dois termos.',
          'A «proteger/resguardar»: sinônimos; «mudanças/permanências» ok mas 1º par erra — eliminar.',
          'B «beneficia/prejudica»: antônimos ok; «saudável/curado» não são opostos — eliminar.',
          'C «inativo/produtivo»: antônimos ok; «higiene/asseio» sinônimos — eliminar.',
          'D «declínio/ascensão»: antônimos; «essencial/acessório»: antônimos — manter.',
          'E «futuros/próximos»: sinônimos; «cognitivo/mental» sinônimos — eliminar.',
          'Gabarito D.',
          'Em similares: cedo/tarde — busque pares opostos em ambos os termos.',
        ],
        footer_rule: 'D: declínio/ascensão + essencial/acessório.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PAR ANTONÍMICO DUPLO',
        rows: [
          { label: 'Modelo', value: 'Cedo × tarde (opostos).' },
          { label: 'Declínio × ascensão', value: 'Queda × subida.' },
          { label: 'Essencial × acessório', value: 'Necessário × secundário.' },
          { label: 'Nesta questão', value: 'D — ambos os pares antônimos.' },
        ],
        footer_rule: 'Proteger ≈ resguardar — sinônimo, não antônimo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sinônimos onde pede antônimo',
        items: [
          { label: 'A — resguardar', detail: 'Sinônimo de proteger.', correct: 'Sinônimo no contexto: «resguardar» ≈ proteger — não antônimo.' },
          { label: 'B — curado', detail: 'Não oposto de saudável.', correct: 'Sinônimo no contexto: «curado» não antônimo de «saudável».' },
          { label: 'C — asseio', detail: 'Sinônimo de higiene.', correct: 'Sinônimo no contexto: «asseio» ≈ higiene — 2º par não antônimo.' },
          { label: 'E — mental', detail: 'Sinônimo de cognitivo.', correct: 'Sinônimo no contexto: «mental» ≈ cognitivo — ambos sinônimos.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Nunca é cedo ou tarde para cuidar do cérebro.»',
            correct: 'Antônimo no contexto: «cedo» × «tarde» — opostos temporais como no texto.',
          },
        ],
        footer_rule: 'D: declínio/ascensão + essencial/acessório.',
      },
    ],
  },

  'apice-ace-pr-sinonimos-leia-o-texto-a-seguir-e-responda-da-3558948': {
    family: 'text_fragment',
    source_tec_id: '3558948',
    source_note: 'pitoresco × irrisório = antônimos — Fernando Sabino «A última crônica» — Ápice ACE Pref Pocinhos 2025 tec 3558948',
    meta: {
      banca: 'Ápice',
      prova: 'ACE (Pref Pocinhos)',
      orgao: 'Pref. Pocinhos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nNo contexto semântico da crônica apresentada, os termos em destaque, no trecho «Gostaria de estar inspirado, de coroar com êxito mais um ano nesta busca do pitoresco ou do irrisório no cotidiano de cada um», podem ser considerados:',
    text_fragment:
      'A última crônica — Fernando Sabino (adaptado)\n\nA caminho de casa, entro num botequim da Gávea para tomar um café junto ao balcão. Na realidade estou adiando o momento de escrever.\n\nA perspectiva me assusta. Gostaria de estar inspirado, de coroar com êxito mais um ano nesta busca do pitoresco ou do irrisório no cotidiano de cada um. Eu pretendia apenas recolher da vida diária algo de seu disperso conteúdo humano, fruto da convivência, que a faz mais digna de ser vivida. Visava ao circunstancial, ao episódico.\n\nAo fundo do botequim um casal de pretos acaba de sentar-se, numa das últimas mesas de mármore. A negrinha de três anos, laço na cabeça, mal ousa balançar as perninhas. O pai aponta um pedaço de bolo sob a redoma. São três velinhas minúsculas na fatia; a menininha sopra, apaga as chamas e bate palmas cantando «parabéns pra você». A mãe limpa o farelo no colo da filha. O pai sorri, constrangido, ao me ver observando.\n\nAssim eu quereria minha última crônica: que fosse pura como esse sorriso.',
    options: [
      { id: 'A', text: 'sinônimos;', is_correct: false },
      { id: 'B', text: 'homônimos;', is_correct: false },
      { id: 'C', text: 'antônimos;', is_correct: true },
      { id: 'D', text: 'hipônimos;', is_correct: false },
      { id: 'E', text: 'polissêmicos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pitoresco ou irrisório',
        chip_label: 'Relação lexical',
        meta: slideMeta,
        items: [
          { label: 'Pitoresco', detail: 'Curioso, pintoresco — lado encantador do cotidiano.', icon: 'Palette' },
          { label: 'Irrisório', detail: 'Ridículo, desprezível — lado fútil.', icon: 'ThumbsDown' },
          { label: 'Ou', detail: 'Alternância — um ou outro, não o mesmo.', icon: 'GitBranch' },
          { label: 'Fernando Sabino', detail: '«A última crônica» — botequim da Gávea.', icon: 'BookOpen' },
          { label: 'Pergunta-teste', detail: 'São mesma coisa ou opostos?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Confundir com sinônimos ou polissemia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pitoresco × irrisório — oposição de valor.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica Sabino: cronista busca «pitoresco ou irrisório» no cotidiano.',
          '«Pitoresco» = curioso, encantador; «irrisório» = ridículo, fútil.',
          'O «ou» marca alternância entre polos opostos de valor.',
          'A «sinônimos»: significados iguais — opostos aqui — eliminar.',
          'B «homônimos»: mesma forma, sentidos diferentes — não é o caso — eliminar.',
          'C «antônimos»: opostos — encantador × ridículo — manter.',
          'D «hipônimos»: parte de um todo — eliminar.',
          'E «polissêmicos»: mesma palavra, vários sentidos — eliminar.',
          'Gabarito C.',
          'Em similares: pitoresco × irrisório — opostos de valor no cotidiano.',
        ],
        footer_rule: 'C: antônimos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PITORESCO × IRRISÓRIO',
        rows: [
          { label: 'Pitoresco', value: 'Curioso, pintoresco, encantador.' },
          { label: 'Irrisório', value: 'Ridículo, fútil, desprezível.' },
          { label: 'Relação', value: 'Antônimos — polos opostos.' },
          { label: 'Nesta questão', value: 'C — antônimos.' },
        ],
        footer_rule: 'Sinônimos = mesmo sentido — aqui há oposição.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Relações lexicais trocadas',
        items: [
          { label: 'A — sinônimos', detail: 'Mesmo significado.', correct: 'Sinônimo no contexto: pitoresco e irrisório não têm o mesmo sentido.' },
          { label: 'B — homônimos', detail: 'Mesma forma, origens distintas.', correct: 'Parônimo: palavras diferentes — não homonímia.' },
          { label: 'D — hipônimos', detail: 'Especificação de categoria.', correct: 'Sinônimo no contexto: não há relação parte-todo entre os termos.' },
          { label: 'E — polissêmicos', detail: 'Um termo, vários sentidos.', correct: 'Polissemia: são duas palavras distintas — não polissemia.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O pitoresco do interior contrasta com o irrisório do escândalo.»',
            correct: 'Antônimo no contexto: encantador × ridículo — oposição de valor.',
          },
        ],
        footer_rule: 'C: antônimos.',
      },
    ],
  },

  'educa-pb-ate-sinonimos-texto-ii-governo-federal-lanca-campa-3576912': {
    family: 'certo_errado',
    source_tec_id: '3576912',
    source_note: 'EXCETO misoginia — Filoginia oposto — EDUCA PB Aten CD Pref Pedras de Fogo 2025 tec 3576912',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Aten CD (Pref Pedras de Fogo)',
      orgao: 'Pref. Pedras de Fogo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nTexto II — Governo federal lança campanha Feminicídio Zero na Sapucaí (Agência Brasil — adaptado)\n\nO Ministério das Mulheres lançou a campanha Feminicídio Zero na Sapucaí, com a mensagem «nenhuma violência contra a mulher deve ser tolerada».\n\n«Não podemos nos calar. E no carnaval vamos marcar fortemente essa luta, que precisa ser de todos contra o machismo e misoginia na sociedade», disse Nísia Trindade.\n\nPodem ser sinônimos de «misoginia», EXCETO:',
    options: [
      { id: 'A', text: 'Filoginia.', is_correct: true },
      { id: 'B', text: 'Ginecofobia.', is_correct: false },
      { id: 'C', text: 'Aversão às mulheres.', is_correct: false },
      { id: 'D', text: 'Desprezo pelas mulheres.', is_correct: false },
      { id: 'E', text: 'Ginofobia.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Misoginia — EXCETO',
        chip_label: 'Relação lexical',
        meta: slideMeta,
        items: [
          { label: 'Misoginia', detail: 'Ódio, aversão às mulheres — tema da fala.', icon: 'Ban' },
          { label: 'Ginecofobia', detail: 'Medo/aversão às mulheres — sinônimo.', icon: 'AlertTriangle' },
          { label: 'Filoginia', detail: 'Amor às mulheres — polo oposto.', icon: 'Heart' },
          { label: 'EXCETO', detail: 'Qual NÃO é sinônimo — é o oposto.', icon: 'XCircle' },
          { label: 'Feminicídio Zero', detail: 'Campanha Sapucaí — violência contra mulher.', icon: 'Megaphone' },
          { label: 'Pegadinha', detail: 'Confundir filoginia (amor) com misoginia (ódio).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EXCETO = a opção que não é sinônimo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto campanha: luta contra machismo e misoginia (ódio às mulheres).',
          'Pedido: sinônimos de misoginia, EXCETO — achar o intruso.',
          'Misoginia = aversão, desprezo, ódio às mulheres.',
          'B «Ginecofobia»: medo/aversão às mulheres — sinônimo — descartar.',
          'C «Aversão às mulheres»: equivalência direta — sinônimo — descartar.',
          'D «Desprezo pelas mulheres»: equivalência — sinônimo — descartar.',
          'E «Ginofobia»: variante de ginecofobia — sinônimo — descartar.',
          'A «Filoginia»: amor às mulheres — oposto, não sinônimo — manter.',
          'Gabarito A.',
          'Em similares: misoginia (ódio) × filoginia (amor) — EXCETO aponta o oposto.',
        ],
        footer_rule: 'A: Filoginia — exceção.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MISOGINIA × FILOGINIA',
        rows: [
          { label: 'Misoginia', value: 'Ódio, aversão, desprezo às mulheres.' },
          { label: 'Sinônimos', value: 'Ginecofobia, ginofobia, aversão, desprezo.' },
          { label: 'Filoginia', value: 'Amor às mulheres — antônimo, não sinônimo.' },
          { label: 'Nesta questão', value: 'A — Filoginia (EXCETO).' },
        ],
        footer_rule: 'EXCETO = filoginia (oposto).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — sinônimos vs exceção',
        items: [
          { label: 'A — Filoginia', detail: 'Amor às mulheres — oposto de misoginia.', correct: 'Antônimo no contexto: filoginia é amor às mulheres — única opção que NÃO é sinônimo de misoginia.' },
          { label: 'B — Ginecofobia', detail: 'Medo/aversão às mulheres.', correct: 'Sinônimo no contexto: ginecofobia expressa aversão às mulheres — é sinônimo de misoginia.' },
          { label: 'C — Aversão às mulheres', detail: 'Definição direta.', correct: 'Sinônimo no contexto: «aversão às mulheres» é equivalência de misoginia.' },
          { label: 'D — Desprezo pelas mulheres', detail: 'Ódio, rejeição.', correct: 'Sinônimo no contexto: «desprezo» cobre o sentido de misoginia.' },
          { label: 'E — Ginofobia', detail: 'Variante de ginecofobia.', correct: 'Sinônimo no contexto: ginofobia = aversão às mulheres — sinônimo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A misoginia na sociedade exige combate público.»',
            correct: 'Antônimo no contexto: «filoginia» — amor às mulheres, oposto de misoginia.',
          },
        ],
        footer_rule: 'A: Filoginia — única exceção.',
      },
    ],
  },

  'vunesp-ag-pr-sinonimos-leia-a-tira-a-seguir-para-responder-3583294': {
    family: 'text_fragment',
    source_tec_id: '3583294',
    source_note: 'nem≈sequer; direito≈bem — Calvin tira — VUNESP Ag Pref Itatiba Fiscal Ambiental 2025 tec 3583294',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba — Fiscal Ambiental)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira a seguir para responder à questão.\n\nNo trecho «Eu não conseguia nem me virar! Meus olhos não enxergavam direito!» (1º quadro), as palavras destacadas podem ser substituídas, preservando-se o sentido e a correção gramatical, respectivamente, por',
    text_fragment:
      '<p><strong>Calvin e Haroldo — Bill Watterson (transcrição adaptada)</strong></p>' +
      '<p><em>1º quadro:</em> Calvin, imobilizado na cama: «Eu não conseguia <strong>nem</strong> me virar! Meus olhos não enxergavam <strong>direito</strong>!»</p>' +
      '<p><em>2º quadro:</em> Haroldo observa o amigo doente, comentando o mal-estar.</p>' +
      '<p><em>«Nem» reforça impossibilidade mínima; «direito» = bem, corretamente (advérbio de modo).</em></p>',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'até … correto', is_correct: false },
      { id: 'B', text: 'sequer … bem', is_correct: true },
      { id: 'C', text: 'ao menos … reto', is_correct: false },
      { id: 'D', text: 'tampouco … diretamente', is_correct: false },
      { id: 'E', text: 'realmente … certo', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nem … direito',
        chip_label: 'Tira Calvin',
        meta: slideMeta,
        items: [
          { label: 'Nem', detail: 'Reforço de negação — nem o mínimo.', icon: 'MinusCircle' },
          { label: 'Sequer', detail: 'Equivalente de «nem» — nem ao menos.', icon: 'Ban' },
          { label: 'Direito', detail: 'Advérbio: bem, corretamente (enxergar).', icon: 'Eye' },
          { label: 'Bem', detail: 'Advérbio de modo — substitui «direito».', icon: 'Check' },
          { label: 'Calvin doente', detail: 'Não conseguia nem se virar.', icon: 'Bed' },
          { label: 'Pegadinha', detail: 'Trocar «direito» por «reto» (adj.) ou «correto».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Nem ≈ sequer; direito (adv.) ≈ bem.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Calvin: «não conseguia nem me virar» — negação intensificada.',
          '1º: «nem» = sequer, nem ao menos — equivalência — manter par.',
          '2º: «enxergavam direito» = enxergavam bem — advérbio de modo.',
          'A «até/correto»: até não substitui nem; correto ≠ direito (adv.) — eliminar.',
          'B «sequer/bem»: equivalência dupla — manter.',
          'C «ao menos/reto»: ao menos ≠ nem; reto = adj. — eliminar.',
          'D «tampouco/diretamente»: tampouco parcial; diretamente ≠ bem — eliminar.',
          'E «realmente/certo»: realmente muda sentido; certo ≠ bem — eliminar.',
          'Gabarito B.',
          'Em similares: nem ≈ sequer; direito (adv.) ≈ bem — prove na tira.',
        ],
        footer_rule: 'B: sequer + bem.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NEM × DIREITO (ADV.)',
        rows: [
          { label: 'Nem', value: 'Sequer, nem ao menos.' },
          { label: 'Direito (adv.)', value: 'Bem, corretamente — modo.' },
          { label: 'Pegadinha', value: '«Reto/correto» = adjetivo — não advérbio.' },
          { label: 'Nesta questão', value: 'B — sequer / bem.' },
        ],
        footer_rule: 'Direito (adv.) ≠ reto (adj.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par errado de função ou sentido',
        items: [
          { label: 'A — correto', detail: 'Adjetivo — não advérbio de modo.', correct: 'Sinônimo no contexto: «correto» não substitui «direito» (enxergar bem).' },
          { label: 'C — reto', detail: 'Adjetivo — linha reta.', correct: 'Parônimo: «reto» não é advérbio de «enxergar direito».' },
          { label: 'D — diretamente', detail: 'Modo distinto.', correct: 'Sinônimo no contexto: «diretamente» não equivale a «bem» (com clareza).' },
          { label: 'E — realmente', detail: 'Intensificador de verdade.', correct: 'Sinônimo no contexto: «realmente» não substitui «nem» na negação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Não conseguia nem levantar; não ouvia direito.»',
            correct: 'Sinônimo no contexto: «sequer» e «bem» — mesmo par da tira.',
          },
        ],
        footer_rule: 'B: sequer + bem.',
      },
    ],
  },

  'vunesp-ag-pr-sinonimos-leia-o-texto-a-seguir-para-responder-3583379': {
    family: 'text_fragment',
    source_tec_id: '3583379',
    source_note: 'aporte≈contribuição; onerosos≈custosos — cuidadoras idosos Minayo — VUNESP Ag Pref Itatiba Trânsito 2025 tec 3583379',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba — Trânsito)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nConsidere os trechos a seguir:\n\n• «As que são apoiadas por algum tipo de renda consideram esse aporte insuficiente.» (2º parágrafo)\n• «… o comprometimento cognitivo e a doença mental do idoso são mais onerosos do que os problemas físicos…» (3º parágrafo)\n\nAs palavras destacadas têm como sinônimos, no contexto em que foram empregadas, correta e respectivamente,',
    text_fragment:
      'Cuidar de quem cuida de idosos dependentes — Maria Cecília de Souza Minayo (adaptado)\n\nCuidar decorre das expectativas sociais sobre o conceito cultural de família e continua a ser parte das obrigações femininas. No Brasil, o espectro de idade das cuidadoras vai de 26 a 86 anos. São mulheres que abrem mão da vida pessoal, profissional, social e afetiva.\n\nAs que são apoiadas por algum tipo de renda consideram esse aporte insuficiente. E as que vivem com pouca renda reduzem as opções de suporte frente à carga das necessidades. A maioria afirma que não recebe ajuda de ninguém e nenhuma recompensa econômica por sua dedicação.\n\nCuidar sempre afeta a vida da cuidadora. Existem evidências de que o comprometimento cognitivo e a doença mental do idoso são mais onerosos do que os problemas físicos para quem cuida deles. Os agravos da própria saúde mental da pessoa que acompanha o idoso frequentemente aumentam à medida do tempo gasto no cuidado.',
    options: [
      { id: 'A', text: '«contribuição» e «custosos».', is_correct: true },
      { id: 'B', text: '«suporte» e «temidos».', is_correct: false },
      { id: 'C', text: '«fardo» e «dispendiosos».', is_correct: false },
      { id: 'D', text: '«enfoque» e «raros».', is_correct: false },
      { id: 'E', text: '«controle» e «econômicos».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aporte × onerosos',
        chip_label: 'Par duplo',
        meta: slideMeta,
        items: [
          { label: 'Aporte', detail: 'Entrada de recurso/renda — apoio financeiro.', icon: 'Coins' },
          { label: 'Contribuição', detail: 'O que se acrescenta — sinônimo de aporte.', icon: 'HandCoins' },
          { label: 'Onerosos', detail: 'Que pesam, custam muito esforço.', icon: 'Weight' },
          { label: 'Custosos', detail: 'Que exigem alto custo — sinônimo.', icon: 'TrendingUp' },
          { label: 'Cuidadoras', detail: 'Texto Minayo — idosos dependentes.', icon: 'HeartHandshake' },
          { label: 'Pegadinha', detail: 'Trocar por «fardo» ou «temidos».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Aporte ≈ contribuição; onerosos ≈ custosos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Minayo: cuidadoras de idosos — renda, sobrecarga.',
          '1º: «aporte insuficiente» = contribuição/renda que não basta.',
          '2º: «mais onerosos» = mais custosos, que pesam mais.',
          'A «contribuição/custosos»: equivalência dupla — manter.',
          'B «suporte/temidos»: suporte ≠ aporte (renda); temidos ≠ onerosos — eliminar.',
          'C «fardo/dispendiosos»: fardo ≠ aporte; dispendiosos parcial mas 1º erra — eliminar.',
          'D «enfoque/raros»: campos distintos — eliminar.',
          'E «controle/econômicos»: controle ≠ aporte; econômicos ≠ onerosos — eliminar.',
          'Gabarito A.',
          'Em similares: aporte ≈ contribuição; oneroso ≈ custoso — prove nos trechos.',
        ],
        footer_rule: 'A: contribuição + custosos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'APORTE × ONEROSO',
        rows: [
          { label: 'Aporte', value: 'Contribuição, entrada de recurso.' },
          { label: 'Oneroso', value: 'Custoso, que pesa, dispendioso.' },
          { label: 'Pergunta-teste', value: 'O par mantém renda + peso do cuidado?' },
          { label: 'Nesta questão', value: 'A — contribuição / custosos.' },
        ],
        footer_rule: 'Suporte ≠ aporte (renda).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Substitutos de campo errado',
        items: [
          { label: 'B — suporte', detail: 'Amparo — não renda.', correct: 'Sinônimo no contexto: «suporte» não substitui «aporte» (entrada de renda).' },
          { label: 'B — temidos', detail: 'Medo — não custo.', correct: 'Antônimo no contexto: «temidos» não cobre «onerosos» (que pesam).' },
          { label: 'C — fardo', detail: 'Peso simbólico — não renda.', correct: 'Sinônimo no contexto: «fardo» não equivale a aporte financeiro.' },
          { label: 'D — enfoque', detail: 'Ângulo de análise.', correct: 'Sinônimo no contexto: «enfoque» não substitui «aporte».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O aporte mensal é oneroso para a família.»',
            correct: 'Sinônimo no contexto: «contribuição» custosa — aporte + oneroso.',
          },
        ],
        footer_rule: 'A: contribuição + custosos.',
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
