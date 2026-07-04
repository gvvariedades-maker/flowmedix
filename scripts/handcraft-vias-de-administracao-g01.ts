#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g01 (8 slugs P0 via_vf_absorcao).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g01.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g01';
const SUBTOPICO = 'Vias de Administração';
const BRANCH = 'via_vf_absorcao';
const REVIEWED = '2026-07-03';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'absorção IM × SC',
    'via subcutânea',
    'via intradérmica',
    'volume SC',
    'indicação de via',
    'infusão IV',
    'via retal',
    'insulina SC',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção lenta', '1ª passagem hepática', 'via retal', 'via oral'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'calc';
  guideline: string;
  roi_error?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, family: string, guideline: string, slug: string, roiError?: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(roiError ? { roi_error: roiError } : {}),
    },
    sources: [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'amauc-enfermagem-vias-de-administracao-1778968768987-6': {
    family: 'vf',
    guideline: 'COFEN — absorção parenteral IM>SC · ID para testes cutâneos/BCG · técnica intradérmica',
    roi_error: 'inverter_velocidade_im_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F parenteral — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas V/F sobre vias parenterais — monte a sequência antes de olhar as letras A–E.',
            icon: 'Target',
          },
          {
            label: 'Trilho IM × SC (item 1)',
            detail:
              'Hipoderme menos vascularizada → SC absorve mais devagar que IM. Item 1 descreve corretamente o trilho.',
            icon: 'TrendingUp',
          },
          {
            label: 'ID × SC (item 2)',
            detail:
              'Testes cutâneos, dessensibilização e BCG são via intradérmica (ID), não subcutânea — pegadinha clássica.',
            icon: 'Syringe',
          },
          {
            label: 'Técnica ID (item 3)',
            detail: 'Intradérmica: ângulo 5°–15°, bisel voltado para cima — afirmativa técnica verdadeira.',
            icon: 'Gauge',
          },
          {
            label: 'Inversão IM×SC (item 4)',
            detail:
              'IM não é mais lenta que SC — músculo é mais vascularizado. Item 4 inverte o trilho de absorção.',
            icon: 'GitCompare',
          },
          {
            label: 'Padrão AMAUC neste tema',
            detail: 'Mistura trilho de absorção com confusão ID/SC — feche item 2 e item 4 antes de marcar.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Trilho: IV > IM > SC — ID é rota de teste, não depósito SC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar formato: quatro itens V/F + sequência correta de cima para baixo.',
          'Julgar item 1: SC menos vascularizada → absorção mais lenta que IM? → VERDADEIRO.',
          'Julgar item 2: SC usada para testes cutâneos, dessensibilização e BCG? → FALSO — rotina é intradérmica (ID).',
          'Julgar item 3: ID com ângulo 5°–15° e bisel para cima? → VERDADEIRO.',
          'Julgar item 4: IM mais lenta que SC por maior vascularização muscular? → FALSO — inverte o trilho.',
          'Montar sequência: V, F, V, F.',
          'Eliminar A (V,F,F,V), C (F,V,V,F), D (V,V,F,F) e E (F,V,F,V).',
          'Localizar alternativa B = V, F, V, F.',
          'Marcar B.',
          'Fixação: em V/F parenteral, teste absorção (1 e 4) e rota ID/SC (2) antes da sequência.',
        ],
        footer_rule: 'Roteiro: item 1 → 2 → 3 → 4 → sequência → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — trilho parenteral',
        meta: slideMeta,
        content: 'VIAS — VELOCIDADE DE ABSORÇÃO',
        rows: [
          { label: 'Intravenosa (IV)', value: 'Imediata — 100% biodisponível', badge: 'info' },
          {
            label: 'Intramuscular (IM)',
            value: 'Rápida — músculo vascularizado',
            badge: 'hot',
            exam_hint: 'Item 4 erra ao dizer IM mais lenta que SC.',
            fixation: 'IM > SC no trilho — nunca inverta vascularização.',
          },
          {
            label: 'Subcutânea (SC)',
            value: 'Lenta e contínua — hipoderme pouco vascularizada',
            badge: 'warn',
            exam_hint: 'Item 1 confirma SC mais lenta que IM.',
          },
          {
            label: 'Intradérmica (ID)',
            value: 'Testes cutâneos · BCG · dessensibilização — não SC',
            badge: 'ok',
            exam_hint: 'Item 2 troca ID por SC.',
          },
          {
            label: 'Técnica ID',
            value: 'Ângulo 5°–15° · bisel para cima',
            badge: 'ok',
          },
          {
            label: 'Mnemônico',
            value: 'IV imediata > IM rápida > SC lenta > VO variável',
          },
        ],
        footer_rule: 'Decore trilho + separar ID (teste) de SC (depósito)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F PARENTERAL',
        items: [
          {
            label: 'Letra A — V,F,F,V',
            detail: 'Mantém item 2 falso como V e item 4 falso como V — dupla inversão.',
            correct: 'Item 2 é F (testes/BCG = ID); item 4 é F (IM não é mais lenta que SC).',
          },
          {
            label: 'Letra C — F,V,V,F',
            detail: 'Inverte item 1 (SC mais lenta que IM é verdadeiro) e aceita item 2 como V.',
            correct: 'Item 1 é V no trilho; item 2 é F porque confunde SC com ID.',
          },
          {
            label: 'Letra D — V,V,F,F',
            detail: 'Marca item 2 como V — aceita SC para teste cutâneo e BCG.',
            correct: 'BCG e testes de hipersensibilidade são intradérmicos, não subcutâneos.',
          },
          {
            label: 'Letra E — F,V,F,V',
            detail: 'Nega item 1 verdadeiro e aceita item 4 falso como V.',
            correct: 'SC é mais lenta que IM; IM não é mais lenta que SC.',
          },
          {
            label: 'Confundir ID com SC',
            detail: 'Aluno decora “injeção pequena” e generaliza para SC.',
            correct: 'Teste cutâneo e BCG = intradérmica (derme), não hipoderme.',
          },
          {
            label: 'Inverter trilho no item 4',
            detail: 'Parece lógico citar vascularização muscular, mas a conclusão está invertida.',
            correct: 'Maior vascularização → absorção mais rápida (IM), não mais lenta.',
          },
        ],
        footer_rule: 'Feche ID×SC e IM×SC antes de montar a sequência',
      },
    ],
  },

  'adm-tec-enfermagem-vias-de-administracao-1776056401060-9': {
    family: 'vf',
    guideline: 'COFEN — via SC: absorção lenta, volume limitado, irritação em tecido adiposo',
    roi_error: 'sc_absorcao_rapida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via SC — mapa I–IV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro itens sobre via subcutânea — julgue I–IV antes de combinar letras.',
            icon: 'Target',
          },
          {
            label: 'Trilho de absorção',
            detail: 'SC = depósito no tecido adiposo → absorção lenta e gradual, não rápida.',
            icon: 'TrendingUp',
          },
          {
            label: 'Irritação crônica (I)',
            detail: 'Uso prolongado pode irritar a camada gordurosa — item verdadeiro de cuidado.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Absorção rápida (II)',
            detail: 'Pegadinha: SC não favorece grandes volumes nem absorção rápida — item falso.',
            icon: 'XCircle',
          },
          {
            label: 'Volume máximo (IV)',
            detail: '3 mL excede o limite clássico de SC (1 a 2 mL por sítio) — item falso.',
            icon: 'Droplets',
          },
          {
            label: 'Padrão Adm&Tec',
            detail: 'Combina cuidado real (I, III) com inversão de velocidade (II) e volume (IV).',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'SC = lenta + volume pequeno — II e IV são os itens que mais caem',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: itens I–IV + combinações — tabela V/F primeiro.',
          'Julgar I: irritação na camada gordurosa a longo prazo? → VERDADEIRO.',
          'Julgar II: absorção rápida + grandes volumes? → FALSO — perfil oposto da SC.',
          'Julgar III: adesão facilitada por técnica relativamente fácil? → VERDADEIRO.',
          'Julgar IV: volume máximo 3 mL? → FALSO — SC admite volumes menores.',
          'Conjunto correto: I e III apenas.',
          'Eliminar A (inclui II falsa), C (II e IV falsas), D (IV falsa).',
          'Marcar B.',
          'Fixação: II e IV testam o mesmo eixo — velocidade e volume da SC.',
        ],
        footer_rule: 'Só I e III sobrevivem ao trilho SC lenta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — via subcutânea',
        meta: slideMeta,
        content: 'VIA SC — ABSORÇÃO E VOLUME',
        rows: [
          {
            label: 'Subcutânea (SC)',
            value: 'Absorção lenta e contínua — tecido adiposo',
            badge: 'hot',
            exam_hint: 'II erra ao pedir absorção rápida e dose grande.',
          },
          {
            label: 'Intramuscular (IM)',
            value: 'Mais rápida que SC — músculo mais vascularizado',
            badge: 'ok',
          },
          {
            label: 'Volume típico SC',
            value: 'Pequeno por sítio (≈1–2 mL; banca pode usar 1,5 mL)',
            badge: 'warn',
            exam_hint: 'IV cita 3 mL — acima do limite clássico SC.',
          },
          {
            label: 'Cuidados SC',
            value: 'Rotação de sítios · evitar irritantes · técnica de pinça',
            badge: 'ok',
          },
          {
            label: 'Indicação clássica',
            value: 'Insulina · heparina · medicamentos de liberação gradual',
            badge: 'ok',
          },
          {
            label: 'Mnemônico',
            value: 'SC = lenta + volume pequeno + fácil adesão domiciliar',
          },
        ],
        footer_rule: 'Não confundir SC com IM na velocidade nem no volume',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIA SC (I–IV)',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Aceita II falsa (absorção rápida + grandes volumes) como verdadeira.',
            correct: 'SC é lenta e contínua — não admite perfil de IV/IM nem doses grandes.',
          },
          {
            label: 'Letra C — II e IV',
            detail: 'Reúne os dois itens que invertem farmacocinética e volume da SC.',
            correct: 'II e IV são falsos: SC não é rápida nem comporta 3 mL como máximo clássico.',
          },
          {
            label: 'Letra D — III e IV',
            detail: 'Acerta III, mas mantém IV falsa (volume 3 mL).',
            correct: 'Volume SC é limitado — 3 mL é distrator de prova.',
          },
          {
            label: 'Aceitar II por “facilidade”',
            detail: 'Confunde adesão ao tratamento (III) com velocidade de absorção.',
            correct: 'Técnica fácil não torna a SC uma via de absorção rápida.',
          },
          {
            label: 'Marcar sem julgar IV',
            detail: 'I e III parecem óbvios — aluno ignora volume máximo.',
            correct: 'Sempre julgar os quatro itens; IV é pegadinha numérica clássica.',
          },
        ],
        footer_rule: 'Transferência: toda questão SC → teste velocidade e volume antes das letras',
      },
    ],
  },

  'ameosc-enfermagem-vias-de-administracao-1778968997293-0': {
    family: 'conceito',
    guideline: 'COFEN — modos de administração IV: bolus, infusão rápida, lenta e contínua',
    roi_error: 'confundir_modos_iv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Modos de infusão IV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar modo IV realizado entre 1 e 30 minutos — foco em tempo, não em absorção IM/SC.',
            icon: 'Target',
          },
          {
            label: 'Bolus',
            detail: 'Administração em segundos/minuto — efeito imediato, não leva 1–30 min.',
            icon: 'Zap',
          },
          {
            label: 'Infusão rápida',
            detail: 'Janela clássica de prova: 1 a 30 minutos — gabarito da questão.',
            icon: 'Timer',
          },
          {
            label: 'Infusão lenta / contínua',
            detail: 'Horas ou fluxo contínuo — extrapola a faixa de 1–30 min.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — modos IV',
            detail:
              'Banca confunde bolus (segundos) com infusão rápida (1–30 min) e contínua (horas) — trilho temporal, não absorção IM/SC.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'IV: bolus = imediato · rápida = 1–30 min · contínua = horas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler o critério temporal: administração IV entre 1 e 30 minutos.',
          'Testar A — infusão contínua: fluxo prolongado (horas) → eliminar.',
          'Testar B — bolus: dose em poucos segundos → eliminar.',
          'Testar C — infusão rápida: faixa de minutos compatível → candidata.',
          'Testar D — infusão lenta: geralmente >30 min ou taxa reduzida → eliminar.',
          'Confirmar: só C descreve o intervalo pedido.',
          'Marcar C.',
          'Fixação: decore os quatro modos IV antes de misturar com trilho IM/SC.',
        ],
        footer_rule: 'Tempo define o modo — não confunda com velocidade de absorção parenteral',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — modos IV',
        meta: slideMeta,
        content: 'ADMINISTRAÇÃO IV — TEMPOS',
        rows: [
          { label: 'Bolus', value: 'Segundos a 1 min — efeito imediato', badge: 'info' },
          {
            label: 'Infusão rápida',
            value: '1 a 30 minutos',
            badge: 'hot',
            exam_hint: 'Única alternativa na faixa do enunciado.',
          },
          { label: 'Infusão lenta', value: 'Geralmente >30 min — taxa controlada', badge: 'warn' },
          { label: 'Infusão contínua', value: 'Horas — manutenção de efeito', badge: 'ok' },
          { label: 'Segurança IV', value: 'Compatibilidade · via exclusiva · extravasamento', badge: 'ok' },
        ],
        footer_rule: 'Modo IV ≠ trilho de absorção — são eixos diferentes na prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MODOS IV',
        items: [
          {
            label: 'Letra A — infusão contínua',
            detail: 'Seduz quem associa “grande volume” a IV — mas o tempo é de horas.',
            correct: 'Contínua não cabe na janela de 1–30 minutos.',
          },
          {
            label: 'Letra B — bolus',
            detail: 'IV imediata, mas muito rápida para a faixa pedida.',
            correct: 'Bolus é quase instantâneo — não leva até 30 min.',
          },
          {
            label: 'Letra D — infusão lenta',
            detail: 'Parece oposto de rápida, mas “lenta” costuma exceder 30 min.',
            correct: 'Infusão rápida (1–30 min) é categoria distinta de lenta/contínua.',
          },
          {
            label: 'Confundir com absorção IM/SC',
            detail: 'Transferência do trilho parenteral para modos de bomba IV.',
            correct: 'Esta questão cobra tempo de infusão, não velocidade tecidual.',
          },
        ],
        footer_rule: 'Leia o recorte temporal do enunciado antes de eliminar',
      },
    ],
  },

  'ameosc-enfermagem-vias-de-administracao-1776056348175-5': {
    family: 'vf',
    guideline: 'COFEN — SC lenta/contínua · prescrição para troca de via · avaliação clínica',
    roi_error: 'inverter_velocidade_im_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — idoso e vias',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail: 'Idoso com disfagia — VO limitada; prescrição mista VO e SC. Julgue segurança e farmacocinética.',
            icon: 'User',
          },
          {
            label: 'SC lenta/contínua (item 1)',
            detail: 'SC indicada para fármacos de absorção lenta e contínua — verdadeiro.',
            icon: 'TrendingUp',
          },
          {
            label: 'Troca de via sem prescrição (item 2)',
            detail: 'Substituir VO por IV sem nova prescrição viola segurança — falso.',
            icon: 'Shield',
          },
          {
            label: 'Trilho SC×IM (item 3)',
            detail: 'SC mais lenta que IM — hipoderme menos vascularizada. Verdadeiro no trilho.',
            icon: 'GitCompare',
          },
          {
            label: 'Avaliação clínica (item 4)',
            detail: 'Definir via mais segura exige avaliar condição clínica — verdadeiro (ética + segurança).',
            icon: 'Stethoscope',
          },
        ],
        footer_rule: 'Item 2 é falso por prescrição; item 3 confirma SC mais lenta que IM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: idoso com disfagia — atenção a via segura e prescrição.',
          'Item 1: SC adequada para absorção lenta e contínua? → VERDADEIRO.',
          'Item 2: trocar VO por IV sem nova prescrição? → FALSO — exige ordem médica.',
          'Item 3: SC mais lenta que IM? → VERDADEIRO — trilho padrão.',
          'Item 4: avaliação clínica essencial para via segura? → VERDADEIRO.',
          'Sequência: V, F, V, V.',
          'Eliminar A, B e D — só C combina corretamente.',
          'Marcar C.',
          'Fixação: segurança do paciente (item 2) e trilho (item 3) são os filtros decisivos.',
        ],
        footer_rule: 'Prescrição + trilho fecham V,F,V,V',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escolha de via',
        meta: slideMeta,
        content: 'VIAS — SEGURANÇA E ABSORÇÃO',
        rows: [
          {
            label: 'Subcutânea (SC)',
            value: 'Lenta e contínua — hipoderme',
            badge: 'hot',
          },
          {
            label: 'Intramuscular (IM)',
            value: 'Mais rápida que SC',
            badge: 'ok',
            exam_hint: 'Item 3: SC mais lenta que IM — não inverta.',
          },
          {
            label: 'Troca de via',
            value: 'Exige nova prescrição médica',
            badge: 'warn',
            exam_hint: 'Item 2 é falso sem reavaliação prescritiva.',
          },
          {
            label: 'Avaliação prévia',
            value: 'Consciência · deglutição · perfusão · risco de extravasamento',
            badge: 'ok',
          },
          {
            label: 'Disfagia',
            value: 'Pode contraindicar VO — considerar SC/IV conforme prescrição',
            badge: 'info',
          },
        ],
        footer_rule: 'Via certa + prescrição certa + paciente avaliado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IDOSO E VIAS',
        items: [
          {
            label: 'Letra A — F,F,V,V',
            detail: 'Nega item 1 verdadeiro (SC lenta/contínua).',
            correct: 'SC é exatamente a via de liberação gradual — item 1 é V.',
          },
          {
            label: 'Letra B — F,V,F,F',
            detail: 'Aceita troca VO→IV sem prescrição (item 2 como V).',
            correct: 'Mudança de via exige nova ordem médica — item 2 é F.',
          },
          {
            label: 'Letra D — V,F,F,V',
            detail: 'Inverte item 3 — trata SC como mais rápida que IM.',
            correct: 'SC é mais lenta que IM no trilho parenteral.',
          },
          {
            label: 'Ignorar cenário de disfagia',
            detail: 'Foco só no trilho e esquece segurança prescritiva.',
            correct: 'Item 2 testa ética/segurança — não é farmacocinética pura.',
          },
        ],
        footer_rule: 'Cenário clínico + prescrição antes da sequência V/F',
      },
    ],
  },

  'agirh-enfermagem-vias-de-administracao-1778968768987-7': {
    family: 'vf',
    guideline: 'COFEN/Potter — VO, TEV, SC e direito à informação na administração',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — panorama de vias',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro afirmativas sobre VO, TEV, SC e informação ao paciente — todas corretas nesta prova.',
            icon: 'Target',
          },
          {
            label: 'Via oral (I)',
            detail: 'VO exige consciência preservada e deglutição segura — afirmativa verdadeira.',
            icon: 'Pill',
          },
          {
            label: 'TEV (II)',
            detail: 'Grandes volumes, efeito rápido e fármacos degradados no TGI — vantagens clássicas da IV.',
            icon: 'Zap',
          },
          {
            label: 'Via SC (III)',
            detail: 'Fármacos isotônicos, não irritantes, pouco viscosos e solúveis em água — perfil técnico SC.',
            icon: 'Syringe',
          },
          {
            label: 'Informação (IV)',
            detail: 'Paciente deve conhecer terapêutica, via, horários e efeitos adversos — ética COFEN.',
            icon: 'HeartHandshake',
          },
          {
            label: 'Pegadinha — combinação parcial',
            detail:
              'Letras A–C omitem um item verdadeiro (I, III ou IV) — banca testa se o aluno marca “todas” sem julgar os quatro.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Nesta questão, os quatro itens são verdadeiros — cuidado com combinações parciais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I–IV + combinações — julgar cada item.',
          'I: VO para pacientes sem alteração de consciência e sem disfagia? → VERDADEIRO.',
          'II: vantagens da TEV (volume, rapidez, fármacos degradados no TGI)? → VERDADEIRO.',
          'III: SC para fármacos isotônicos, não irritantes, pouco viscosos e hidrossolúveis? → VERDADEIRO.',
          'IV: informar paciente sobre terapêutica, via, horários e efeitos? → VERDADEIRO.',
          'Conjunto: I, II, III e IV — todas corretas.',
          'Eliminar A, B e C (deixam de fora algum item verdadeiro).',
          'Marcar D — todas as afirmativas estão corretas.',
          'Fixação: quando todos os itens são plausíveis, teste se falta algum antes de descartar “todas”.',
        ],
        footer_rule: 'I=V · II=V · III=V · IV=V → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias na assistência',
        meta: slideMeta,
        content: 'VIAS — INDICAÇÃO E ÉTICA',
        rows: [
          { label: 'Oral (VO)', value: 'Consciência + deglutição preservadas', badge: 'ok' },
          {
            label: 'Endovenosa (TEV/IV)',
            value: 'Volume · rapidez · fármacos inativados no TGI',
            badge: 'hot',
          },
          {
            label: 'Subcutânea (SC)',
            value: 'Isotônico · não irritante · pouco viscoso · hidrossolúvel',
            badge: 'ok',
          },
          {
            label: 'Direito à informação',
            value: 'Via · horário · efeitos adversos · segurança',
            badge: 'ok',
          },
          { label: 'Mnemônico TEV', value: 'Rápida + volume + bypass do TGI', badge: 'info' },
        ],
        footer_rule: 'Técnica da via + direito à informação andam juntos na prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TODAS CORRETAS',
        items: [
          {
            label: 'Letra A — I, II e III',
            detail: 'Omite IV (informação ao paciente) — distrator de combinação parcial.',
            correct: 'IV é verdadeira: ética exige informar terapêutica e riscos.',
          },
          {
            label: 'Letra B — I, II e IV',
            detail: 'Exclui III (perfil técnico da SC) sem motivo farmacológico.',
            correct: 'III descreve corretamente fármacos adequados à SC.',
          },
          {
            label: 'Letra C — II, III e IV',
            detail: 'Exclui I (critério de VO) — perde requisito de consciência/deglutição.',
            correct: 'I é verdadeira: VO não serve com disfagia ou rebaixamento.',
          },
          {
            label: 'Desconfiar de “todas corretas”',
            detail: 'Banca usa letra D como gabarito legítimo quando os quatro itens são sólidos.',
            correct: 'Julgue item a item — aqui nenhum falha.',
          },
        ],
        footer_rule: 'Não elimine D por reflexo — valide os quatro itens primeiro',
      },
    ],
  },

  'avancasp-enfermagem-vias-de-administracao-1776056391403-1': {
    family: 'conceito',
    guideline: 'COFEN — volume máximo via subcutânea (≈1–2 mL; gabarito prova 1,5 mL)',
    roi_error: 'volume_sc_exagerado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Volume máximo SC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Pergunta direta: volume máximo indicado na via subcutânea — decore o número da banca.',
            icon: 'Target',
          },
          {
            label: 'Trilho SC',
            detail: 'Hipoderme admite pouco volume — acima do limite aumenta dor, extravasamento e falha de absorção.',
            icon: 'TrendingUp',
          },
          {
            label: 'Faixa de prova',
            detail: 'Referências citam 1–2 mL; AVANÇASP cobra 1,5 mL como máximo indicado.',
            icon: 'Droplets',
          },
          {
            label: 'Distratores numéricos',
            detail: '0,5 · 1,0 · 2,0 · 2,5 mL — valores próximos para testar decoreba fina.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'SC = volume pequeno — nesta prova: 1,5 mL (letra D)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar eixo: volume máximo SC (não velocidade de absorção).',
          'Eliminar volumes muito altos: A (2,0) e E (2,5) — acima do limite clássico.',
          'Eliminar B (0,5) e C (1,0) — abaixo do máximo indicado na referência da banca.',
          'Confirmar D (1,5 mL) como máximo indicado nesta questão AVANÇASP.',
          'Marcar D.',
          'Fixação: associe SC a volume pequeno antes de decorar o número exato.',
        ],
        footer_rule: 'Numérico SC: elimine extremos → confirme 1,5 mL',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — volumes por via',
        meta: slideMeta,
        content: 'VOLUMES MÁXIMOS — PROVA',
        rows: [
          {
            label: 'Subcutânea (SC)',
            value: '≈1–2 mL por sítio (AVANÇASP: 1,5 mL)',
            badge: 'hot',
            exam_hint: 'Gabarito D — máximo indicado nesta questão.',
          },
          {
            label: 'Intramuscular (IM)',
            value: 'Varia por sítio (deltoide até ~2 mL; glúteo mais)',
            badge: 'ok',
          },
          {
            label: 'Erro clássico',
            value: 'Confundir volume SC com IM ou IV',
            badge: 'warn',
          },
        ],
        footer_rule: 'Decore SC pequena · IM intermediária · IV conforme prescrição',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VOLUME SC',
        items: [
          {
            label: 'Letra A — 2,0 mL',
            detail: 'Próximo do limite, mas acima do máximo indicado (1,5 mL) nesta prova.',
            correct: 'AVANÇASP fixa 1,5 mL — não 2,0 mL.',
          },
          {
            label: 'Letra E — 2,5 mL',
            detail: 'Volume de IM em alguns sítios — transferência indevida para SC.',
            correct: 'SC não comporta volumes de punção muscular.',
          },
          {
            label: 'Letra B — 0,5 mL',
            detail: 'Parece conservador, mas não é o máximo indicado.',
            correct: 'Pergunta pede máximo, não dose usual mínima.',
          },
          {
            label: 'Letra C — 1,0 mL',
            detail: 'Valor intermediário sedutor — abaixo do teto da banca.',
            correct: 'Máximo indicado = 1,5 mL (D), não 1,0 mL.',
          },
        ],
        footer_rule: 'Leia se a banca pede máximo, usual ou dose terapêutica',
      },
    ],
  },

  'ameosc-enfermagem-vias-de-administracao-1776056366158-2': {
    family: 'conceito',
    guideline: 'Potter/Perry — via retal: absorção variável, bypass parcial da 1ª passagem, alternativa quando VO inviável',
    roi_error: 'retal_sempre_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via retal — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Via altamente vascularizada, absorção rápida, fármacos podem atingir o fígado e perder eficácia — indicada quando inconscientes ou outras vias impedidas.',
            icon: 'Target',
          },
          {
            label: 'Trilho entérico',
            detail:
              'Farmacocinética: medicamentos passam por superfícies e etapas antes da ação — VO e retal no eixo digestivo.',
            icon: 'TrendingUp',
          },
          {
            label: 'Via retal',
            detail:
              'Mucosa retal vascularizada; porção inferior com menor 1ª passagem; alternativa em inconscientes ou sem deglutição.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha oral',
            detail:
              'Enunciado cita fígado e absorção rápida — banca induz VO, mas inconsciência exige via alternativa (retal).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Retal = alternativa entérica quando VO falha · atenção à 1ª passagem',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler os critérios: vascularizada · absorção rápida · possível metabolismo hepático · inconsciência/impedimento de outras vias.',
          'Testar A — bucal: absorção oral, não cenário de inconsciência prioritário → eliminar.',
          'Testar B — retal: via entérica alternativa, mucosa vascularizada, uso quando VO inviável → candidata.',
          'Testar C — oral: exige deglutição e consciência em geral → eliminar no cenário.',
          'Testar D — sublingual: rápida, mas não perfil de inconsciência prolongada → eliminar.',
          'Confirmar B — retal.',
          'Marcar B.',
          'Fixação: cruze via entérica × consciência × 1ª passagem hepática.',
        ],
        footer_rule: 'Inconsciência + via entérica alternativa → retal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias entéricas',
        meta: slideMeta,
        content: 'ABSORÇÃO E 1ª PASSAGEM',
        rows: [
          { label: 'Oral (VO)', value: 'TGI + 1ª passagem hepática frequente', badge: 'info' },
          {
            label: 'Retal',
            value: 'Absorção variável · porção inferior com menor 1ª passagem · alternativa sem deglutição',
            badge: 'hot',
            exam_hint: 'Gabarito B — cenário de inconsciência/sem VO.',
          },
          {
            label: 'Sublingual',
            value: 'Rápida · evita TGI · não irritantes',
            badge: 'ok',
          },
          { label: 'Bucal', value: 'Mucosa oral · não é resposta deste enunciado', badge: 'warn' },
          {
            label: 'Mnemônico',
            value: 'Sem deglutição → pensar retal antes de sublingual',
          },
        ],
        footer_rule: '1ª passagem hepática diferencia VO/retal de sublingual/IV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIA RETAL',
        items: [
          {
            label: 'Pegadinha oral — fígado',
            detail: 'Marcar VO só porque o enunciado cita metabolismo hepático e absorção rápida.',
            correct: 'Retal é alternativa entérica quando VO inviável — espelha a Pegadinha oral do mapa.',
          },
          {
            label: 'Letra C — oral',
            detail: 'Idoso inconsciente não recebe VO com segurança — distrator óbvio mal aplicado.',
            correct: 'VO exige deglutição e nível de consciência adequados.',
          },
          {
            label: 'Letra D — sublingual',
            detail: 'Rápida e evita TGI, mas não é via de escolha em inconsciência prolongada.',
            correct: 'Sublingual exige cooperação e mucosa íntegra.',
          },
          {
            label: 'Letra A — bucal',
            detail: 'Confunde com sublingual — não atende o perfil do enunciado.',
            correct: 'Bucal não resolve cenário de paciente inconsciente.',
          },
          {
            label: 'Foco só no fígado',
            detail: 'Aluno marca VO porque “passa pelo fígado”, ignorando inconsciência.',
            correct: 'Enunciado combina metabolismo hepático com impossibilidade de outras vias.',
          },
        ],
        footer_rule: 'Cenário clínico (inconsciência) pesa tanto quanto farmacocinética',
      },
    ],
  },

  'amauc-enfermagem-vias-de-administracao-1778968906156-5': {
    family: 'conceito',
    guideline: 'COFEN — insulina: via subcutânea no tratamento domiciliar do diabetes',
    roi_error: 'sc_indicacao_insulina',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina — indicação da via',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Aplicação domiciliar da insulina — escolha da via pelo perfil farmacológico, não pela técnica isolada.',
            icon: 'Target',
          },
          {
            label: 'Trilho de absorção',
            detail: 'Insulina precisa de liberação gradual — SC lenta/contínua, não pico imediato de IV.',
            icon: 'TrendingUp',
          },
          {
            label: 'Via subcutânea',
            detail: 'Padrão ouro domiciliar: depósito no tecido adiposo (abdome, coxa, deltoide).',
            icon: 'Syringe',
          },
          {
            label: 'Distratores',
            detail: 'ID (testes), IM (rápida), EV (hospitalar), VO (destruída no TGI) — eliminar pelo perfil.',
            icon: 'GitCompare',
          },
          {
            label: 'Exemplo de prova',
            detail: 'Mesma lógica VUNESP: SC quando a medicação exige absorção lenta e contínua.',
            icon: 'Pill',
          },
        ],
        footer_rule: 'Insulina domiciliar = SC — destruída se VO · rápida demais se IM/IV rotina',
      },
      {
        type: 'logic_flow',
        slide_title: 'Insulina domiciliar — eliminação de vias',
        chip_label: 'INSULINA · VIAS',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pergunta: via de aplicação domiciliar da insulina no diabetes.',
          'Eliminar D (VO): proteína degradada no TGI — sem absorção útil.',
          'Eliminar C (EV): possível em hospital, não rotina domiciliar de manutenção.',
          'Eliminar B (IM): absorção mais rápida que SC — não é via clássica de insulina.',
          'Eliminar A (ID): via de teste, não depósito de insulina.',
          'Confirmar E (SC): liberação gradual no tecido adiposo.',
          'Marcar E.',
          'Fixação: insulina + domicílio → SC até virar reflexo.',
        ],
        footer_rule: 'Perfil lento/contínuo → SC',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina',
        meta: slideMeta,
        content: 'INSULINA — VIA E ABSORÇÃO',
        rows: [
          {
            label: 'Subcutânea (SC)',
            value: 'Via domiciliar padrão — absorção gradual',
            badge: 'hot',
            exam_hint: 'Gabarito E — única via coerente com o enunciado.',
          },
          { label: 'Oral (VO)', value: 'Contraindicada — degradação no TGI', badge: 'warn' },
          { label: 'Intramuscular (IM)', value: 'Absorção mais rápida — não rotina insulina', badge: 'info' },
          { label: 'Endovenosa (EV)', value: 'Uso hospitalar em urgência — não domiciliar', badge: 'info' },
          { label: 'Intradérmica (ID)', value: 'Testes — não tratamento crônico', badge: 'info' },
          { label: 'Rotação de sítios', value: 'Abdome · coxa · deltoide — prevenir lipodistrofia', badge: 'ok' },
        ],
        footer_rule: 'Decore: insulina = SC no domicílio',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA',
        items: [
          {
            label: 'Letra D — via oral',
            detail: 'Confunde diabetes oral (hipoglicemiantes) com insulina injetável.',
            correct: 'Insulina é polipeptídeo — não absorvida por VO.',
          },
          {
            label: 'Letra B — intramuscular',
            detail: 'IM é mais rápida que SC — perfil errado para insulina basal/bolus domiciliar.',
            correct: 'SC permite controle gradual da glicemia.',
          },
          {
            label: 'Letra C — endovenosa',
            detail: 'Seduz pelo “efeito rápido”, mas não é aplicação domiciliar de rotina.',
            correct: 'EV reservada a cenários hospitalares específicos.',
          },
          {
            label: 'Letra A — intradérmica',
            detail: 'Volume e via inadequados para tratamento crônico.',
            correct: 'ID serve para testes, não para insulina terapêutica.',
          },
        ],
        footer_rule: 'Domicílio + insulina = SC — elimine VO/ID primeiro',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:vias-g01] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g01] total=${ok}`);
}

main();
