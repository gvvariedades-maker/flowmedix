#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g03 (8 slugs P0 via_vf_absorcao).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g03.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g03';
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
    'insulina SC',
    'sítio IM ventroglúteo',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção lenta', 'bolus IV', 'via oral', 'sítios de punção'],
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
  'fepese-enfermagem-vias-de-administracao-1776056391403-2': {
    family: 'conceito',
    guideline: 'COFEN — IV emergência/volume · SC insulina · ID testes · VO sem esmagar comprimidos',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Panorama de vias — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinale a alternativa correta — banca mistura indicação de via, técnica e escopo profissional.',
            icon: 'Target',
          },
          {
            label: 'Trilho IV × IM',
            detail: 'Emergência e grandes volumes = endovenosa (absorção imediata), não intramuscular.',
            icon: 'Zap',
          },
          {
            label: 'Insulina — via correta',
            detail: 'Insulina domiciliar = subcutânea no tecido adiposo — não confundir com intradérmica (testes).',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha ID × SC',
            detail: 'Letra B troca ID por SC na insulina — erro ROI clássico de rota e sítio anatômico.',
            icon: 'GitCompare',
          },
          {
            label: 'VO — comprimidos',
            detail: 'Não esmagar/partir sem prescrição — altera liberação e biodisponibilidade (letra E falsa).',
            icon: 'Pill',
          },
        ],
        footer_rule: 'IV volume/emergência · insulina SC · ID para testes · VO íntegra',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler o comando: alternativa correta sobre vias de administração.',
          'Testar A — IM para emergências e grandes volumes: perfil de IV, não IM → eliminar.',
          'Testar B — ID para insulina no subcutâneo: confunde rota (ID = testes) → eliminar.',
          'Testar C — punção venosa privativa do enfermeiro: técnico atua conforme legislação local → eliminar.',
          'Testar D — IV mais rápida que IM, grandes volumes: trilho e indicação corretos → candidata.',
          'Testar E — sempre partir/macerar comprimidos VO: falso — altera ação do fármaco → eliminar.',
          'Confirmar: só D sobrevive aos cinco eixos.',
          'Marcar D.',
          'Fixação: feche IV×IM e ID×SC antes de escolher a letra.',
        ],
        footer_rule: 'Elimine A/B/E pelos eixos absorção · rota · VO',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — indicação por via',
        meta: slideMeta,
        content: 'VIAS — PERFIL E INDICAÇÃO',
        rows: [
          { label: 'Endovenosa (IV)', value: 'Imediata · grandes volumes · emergência', badge: 'hot' },
          { label: 'Intramuscular (IM)', value: 'Rápida, mas não reposição volêmica de urgência', badge: 'ok' },
          { label: 'Subcutânea (SC)', value: 'Insulina · absorção gradual — não ID', badge: 'ok' },
          { label: 'Intradérmica (ID)', value: 'Testes cutâneos/BCG — não insulina terapêutica', badge: 'warn' },
          { label: 'Oral (VO)', value: 'Comprimido íntegro salvo prescrição de partir', badge: 'info' },
        ],
        footer_rule: 'Decore trilho + rota da insulina + cuidado com VO',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PANORAMA DE VIAS',
        items: [
          {
            label: 'Letra A — IM em emergência',
            detail: 'Associa IM a grandes infusões e reposição — perfil de acesso venoso central/periférico.',
            correct: 'Emergência e volume elevado = IV, não punção intramuscular isolada.',
          },
          {
            label: 'Letra B — ID para insulina',
            detail: 'Cita tecido subcutâneo, mas nomeia intradérmica — rota errada para diabetes.',
            correct: 'Insulina = SC no abdome/coxa/deltoide; ID serve para testes, não tratamento crônico.',
          },
          {
            label: 'Letra C — punção exclusiva do enfermeiro',
            detail: 'Ignora atribuições do técnico sob supervisão conforme norma e serviço.',
            correct: 'Escopo profissional varia — não é distrator farmacocinético válido para gabarito D.',
          },
          {
            label: 'Letra E — macerar comprimidos sempre',
            detail: 'Facilita deglutição, mas pode alterar liberação (comprimidos de liberação modificada).',
            correct: 'Partir/esmagar só com prescrição — não é conduta universal.',
          },
        ],
        footer_rule: 'Cada letra erra um eixo distinto — D fecha IV>IM + volume',
      },
    ],
  },

  'ameosc-enfermagem-vias-de-administracao-1776056383154-4': {
    family: 'conceito',
    guideline: 'COFEN/Potter — sítio IM preferencial adulto: ventroglútea (menor risco nervo ciático)',
    roi_error: 'nervo_ciatico_gluteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítio IM em adulto — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Local mais seguro e eficiente para IM em adulto — foco em anatomia, não em velocidade de absorção.',
            icon: 'Target',
          },
          {
            label: 'Ventroglútea (gabarito)',
            detail: 'Glúteo médio/ventroglúteo — afasta nervo ciático, marcos ósseos palpáveis.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha dorsoglútea',
            detail: 'Maior volume muscular seduz, mas risco de lesão do nervo ciático — erro ROI desta banca.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Deltoide',
            detail: 'Útil para volumes menores — não é o “mais seguro” universal em adulto nesta questão.',
            icon: 'Syringe',
          },
          {
            label: 'Vasto lateral',
            detail: 'Alternativa em lactentes/crianças — item C restringe erroneamente só a bebês.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Adulto + segurança neurológica → ventroglútea',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: IM em adulto — escolher sítio mais seguro e eficiente.',
          'Eliminar A — deltoide: volume limitado, não resposta “mais segura” global.',
          'Eliminar B — dorsoglútea: profundidade maior, mas risco de nervo ciático.',
          'Eliminar C — vasto lateral só em lactentes: restrição falsa para adulto.',
          'Confirmar D — ventroglútea reduz risco de lesão do nervo ciático.',
          'Marcar D.',
          'Fixação: ventroglútea = sítio seguro em adultos nas referências de enfermagem.',
        ],
        footer_rule: 'Segurança neurológica > volume muscular',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios IM',
        meta: slideMeta,
        content: 'PUNÇÃO IM — SÍTIOS SEGUROS',
        rows: [
          {
            label: 'Ventroglútea',
            value: 'Preferencial em adultos — menor risco de nervo ciático',
            badge: 'hot',
            exam_hint: 'Gabarito D — justificativa anatômica.',
          },
          { label: 'Dorsoglútea', value: 'Alto volume, mas risco neurológico se técnica falha', badge: 'warn' },
          { label: 'Deltoide', value: 'Até ~2 mL — braço, acesso fácil', badge: 'ok' },
          { label: 'Vasto lateral', value: 'Crianças/lactentes — músculo vasto exposto', badge: 'info' },
          { label: 'Técnica', value: '90° · aspirar se indicado · rotação de sítios', badge: 'ok' },
        ],
        footer_rule: 'Palpar marcos ósseos antes de qualquer sítio glúteo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO IM',
        items: [
          {
            label: 'Letra B — dorsoglútea pelo volume',
            detail: 'Volume não compensa risco de punção no nervo ciático sem marcos precisos.',
            correct: 'Ventroglútea é mais segura em adultos — espelha erro nervo_ciatico_gluteo.',
          },
          {
            label: 'Letra A — deltoide pela rapidez',
            detail: 'Absorção rápida é verdade, mas não define “local preferencial” em adulto.',
            correct: 'Deltoide tem limite de volume — não é resposta de segurança máxima.',
          },
          {
            label: 'Letra C — vasto só em lactentes',
            detail: 'Restringe sítio válido em pediatria e ignora adulto da questão.',
            correct: 'Vasto lateral é opção em crianças; adulto pede ventroglútea aqui.',
          },
        ],
        footer_rule: 'Segurança anatômica antes de “absorção rápida”',
      },
    ],
  },

  'cpcon-uepb-enfermagem-vias-de-administracao-1778968687469-2': {
    family: 'conceito',
    guideline: 'COFEN — modos IV: bolus ≤1 min · intermitente · lenta · contínua',
    roi_error: 'confundir_modos_iv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Modos de infusão IV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Associar tipo de infusão endovenosa à definição correta — eixo temporal, não absorção IM/SC.',
            icon: 'Target',
          },
          {
            label: 'Bolus IV',
            detail: 'Administração rápida — até cerca de 1 minuto — pico imediato de concentração.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha bolus lento',
            detail: 'Letra A descreve bolus como infusão lenta de 2 h — inverte o modo.',
            icon: 'GitCompare',
          },
          {
            label: 'Intermitente × bolus',
            detail: 'Letra C empresta definição de bolus para infusão intermitente — troca de rótulos.',
            icon: 'Shuffle',
          },
          {
            label: 'Contínua × rápida',
            detail: 'Letra D chama contínua de infusão em 1 min — confunde fluxo prolongado com bolus.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Bolus = rápido (≤1 min) · contínua = horas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Eixo: velocidade/tempo de infusão IV.',
          'Eliminar A — bolus lento 2 h: inverte definição de bolus.',
          'Confirmar B — bolus rápido até 1 minuto: definição clássica.',
          'Eliminar C — intermitente em 1 min: rótulo errado (é bolus).',
          'Eliminar D — contínua em 1 min: contínua dura horas.',
          'Eliminar E — bolus “não indicada”: afirmativa falsa e confusa.',
          'Marcar B.',
          'Fixação: decore os quatro modos IV antes de misturar com trilho parenteral.',
        ],
        footer_rule: 'Tempo define o modo — bolus fecha em ≤1 min',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — modos IV',
        meta: slideMeta,
        content: 'INFUSÃO ENDOVENOSA — TEMPOS',
        rows: [
          { label: 'Bolus', value: 'Rápida — até ~1 minuto', badge: 'hot', exam_hint: 'Gabarito B.' },
          { label: 'Intermitente', value: 'Doses em intervalos — não é bolus', badge: 'ok' },
          { label: 'Lenta', value: 'Taxa reduzida — geralmente >30 min', badge: 'warn' },
          { label: 'Contínua', value: 'Horas — manutenção', badge: 'info' },
        ],
        footer_rule: 'Modo IV ≠ velocidade de absorção IM/SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MODOS IV',
        items: [
          {
            label: 'Letra A — bolus lento 2 h',
            detail: 'Descreve infusão lenta/contínua com rótulo “bolus”.',
            correct: 'Bolus é administração rápida — segundos a 1 minuto.',
          },
          {
            label: 'Letra C — intermitente = 1 min',
            detail: 'Copia definição de bolus para outro modo.',
            correct: 'Intermitente = doses programadas em intervalos, não pico em 1 min.',
          },
          {
            label: 'Letra D — contínua rápida',
            detail: 'Confunde manutenção prolongada com bolus.',
            correct: 'Contínua não cabe em 1 minuto de infusão.',
          },
          {
            label: 'Letra E — bolus obsoleta',
            detail: 'Inventa contraindicação e mistura bolus com infusão prolongada.',
            correct: 'Bolus é modo válido quando prescrito — definição correta está em B.',
          },
        ],
        footer_rule: 'Não troque rótulos entre bolus, intermitente e contínua',
      },
    ],
  },

  'fepese-enfermagem-vias-de-administracao-1778968787431-4': {
    family: 'conceito',
    guideline: 'COFEN — insulina SC: rotação de sítios · evitar umbigo · não massagear',
    roi_error: 'sc_absorcao_rapida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina SC — cuidados',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Via subcutânea para insulina em diabéticos — foco em técnica e trilho de absorção.',
            icon: 'Target',
          },
          {
            label: 'Cuidado correto (C)',
            detail: 'Não aplicar próximo ao umbigo e não massagear após a punção — técnica padrão.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha SC > IV',
            detail: 'Letra B diz SC mais rápida que IV — inverte o trilho de absorção.',
            icon: 'GitCompare',
          },
          {
            label: 'Sítios SC',
            detail: 'Abdome (longe do umbigo), face interna da coxa, deltoide — letra A mistura “periumbilical”.',
            icon: 'MapPin',
          },
          {
            label: 'Anticoagulante SC',
            detail: 'Letra D erra técnica: não aspirar/massagear heparina SC; insulina não é privativa exclusiva.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SC lenta < IV · insulina = técnica sem massagem',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tema: subcutânea + insulina.',
          'Eliminar A — locais periumbilicais como “mais indicados”: contradiz evitar umbigo.',
          'Eliminar B — SC mais rápida que IV: inverte trilho → falso.',
          'Confirmar C — não punção junto ao umbigo e sem massagem: verdadeiro.',
          'Eliminar D — aspirar/massagear anticoagulante + insulina privativa: duplo erro.',
          'Marcar C.',
          'Fixação: trilho SC<IV e técnica de insulina fecham a letra.',
        ],
        footer_rule: 'B cai no trilho · C cai na técnica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina SC',
        meta: slideMeta,
        content: 'INSULINA — VIA E TÉCNICA',
        rows: [
          { label: 'Via', value: 'Subcutânea — absorção gradual', badge: 'hot' },
          { label: 'Sítios', value: 'Abdome (2 dedos do umbigo) · coxa · deltoide', badge: 'ok' },
          { label: 'Não fazer', value: 'Massagear · aplicar no umbigo · reutilizar sítio', badge: 'warn' },
          { label: 'Trilho', value: 'IV > IM > SC — SC nunca mais rápida que IV', badge: 'info' },
          { label: 'Heparina SC', value: 'Não aspirar · não massagear — técnica distinta', badge: 'ok' },
        ],
        footer_rule: 'Insulina domiciliar = SC com rotação de sítios',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA SC',
        items: [
          {
            label: 'Letra B — SC mais rápida que IV',
            detail: 'Inverte completamente o trilho parenteral.',
            correct: 'IV é imediata; SC é lenta e contínua — nunca mais rápida que infusão venosa.',
          },
          {
            label: 'Letra A — periumbilical',
            detail: 'Sugere região junto ao umbigo como sítio preferencial.',
            correct: 'Evitar aplicação no umbigo e ao redor imediato — rotação no abdome lateral.',
          },
          {
            label: 'Letra D — aspirar heparina + privativo',
            detail: 'Mistura técnica de anticoagulante com escopo profissional da insulina.',
            correct: 'Heparina SC: não aspirar/não massagear; insulina pode ser autoadministrada.',
          },
        ],
        footer_rule: 'Trilho + técnica — dois filtros antes da letra',
      },
    ],
  },

  'avancasp-enfermagem-vias-de-administracao-1776056330579-8': {
    family: 'vf',
    guideline: 'COFEN — ID não é via principal · IM>SC · SC lenta · sítios adiposos',
    roi_error: 'inverter_velocidade_im_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — injetáveis superficiais',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas V/F sobre ID e SC — monte F,F,F,V antes das letras.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — ID via principal',
            detail: 'Intradérmica é para testes — não via principal de tratamento → FALSO.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha trilho — afirmativa II',
            detail: 'SC mais rápida que IM — inverte trilho de absorção → FALSO.',
            icon: 'GitCompare',
          },
          {
            label: 'Afirmativa III — SC rápida',
            detail: 'SC é lenta/contínua — não para pico imediato → FALSO.',
            icon: 'TrendingDown',
          },
          {
            label: 'Afirmativa IV — sítios SC',
            detail: 'Abdome, coxa, braço ou qualquer tecido adiposo — VERDADEIRO.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Só item 4 é V — sequência F,F,F,V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro assertivas + sequência V/F.',
          'Julgar I: ID principal? → FALSO.',
          'Julgar II: SC mais rápida que IM? → FALSO — IM > SC.',
          'Julgar III: SC para absorção rápida? → FALSO — perfil lento.',
          'Julgar IV: sítios adiposos válidos? → VERDADEIRO.',
          'Sequência: F, F, F, V.',
          'Eliminar A (V,V,V,V), B (F,F,F,F), C (F,V,F,V), E (V,F,F,V).',
          'Marcar D.',
          'Fixação: itens 1–3 testam o mesmo eixo — não inverta o trilho.',
        ],
        footer_rule: 'F,F,F,V → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ID e SC',
        meta: slideMeta,
        content: 'VIAS SUPERFICIAIS — TRILHO',
        rows: [
          { label: 'Intradérmica (ID)', value: 'Testes — não via principal terapêutica', badge: 'warn' },
          { label: 'Subcutânea (SC)', value: 'Lenta · volumes pequenos · tecido adiposo', badge: 'hot' },
          { label: 'Intramuscular (IM)', value: 'Mais rápida que SC', badge: 'ok' },
          { label: 'Sítios SC', value: 'Abdome · coxa · braço · áreas adiposas', badge: 'ok' },
        ],
        footer_rule: 'ID=teste · SC=lenta · IM>SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F SC/ID',
        items: [
          {
            label: 'Letra A — V,V,V,V',
            detail: 'Aceita os três primeiros itens falsos como verdadeiros.',
            correct: 'Itens 1–3 são F — ID não é principal e SC não é rápida nem > IM.',
          },
          {
            label: 'Letra C — F,V,F,V',
            detail: 'Marca afirmativa II como V — aceita SC mais rápida que IM.',
            correct: 'Músculo é mais vascularizado — IM absorve mais rápido que SC.',
          },
          {
            label: 'Letra E — V,F,F,V',
            detail: 'Trata ID como via principal (afirmativa I = V).',
            correct: 'ID é rota de teste cutâneo, não administração terapêutica principal.',
          },
          {
            label: 'Letra B — F,F,F,F',
            detail: 'Nega afirmativa IV verdadeira sobre sítios adiposos.',
            correct: 'Abdome, coxa e braço são sítios clássicos de SC.',
          },
        ],
        footer_rule: 'Trilho IM>SC fecha itens 2 e 3',
      },
    ],
  },

  'fau-unicentro-enfermagem-vias-de-administracao-1776056401060-6': {
    family: 'conceito',
    guideline: 'COFEN — bolus IV: ≤1 min para pico rápido de concentração',
    roi_error: 'confundir_modos_iv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Definição de bolus IV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Pergunta direta: o que é infusão em bolus?',
            icon: 'Target',
          },
          {
            label: 'Bolus IV (gabarito)',
            detail: 'Medicamento IV em ≤1 min — elevar concentração plasmática rapidamente.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — efeito adverso',
            detail: 'Letras B e C descrevem reação adversa/evento — fora do tema bolus.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Infusão prolongada',
            detail: 'Letras D e E citam tempo superior a 1 min — perfil de infusão lenta/contínua, não bolus.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Bolus = IV rápida ≤1 min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar: definição de bolus IV.',
          'Eliminar B e C — descrevem efeito adverso, não modo de administração.',
          'Eliminar D — IV prolongada contínua (fora da janela de bolus).',
          'Eliminar E — IV prolongada intermitente (fora da janela de bolus).',
          'Confirmar A — IV ≤1 min para resposta farmacológica rápida.',
          'Marcar A.',
          'Fixação: bolus ≠ infusão lenta nem reação medicamentosa.',
        ],
        footer_rule: 'Tempo ≤1 min + via IV = bolus',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — bolus',
        meta: slideMeta,
        content: 'BOLUS ENDOVENOSO',
        rows: [
          {
            label: 'Bolus',
            value: 'IV em ≤1 min — pico de concentração',
            badge: 'hot',
            exam_hint: 'Gabarito A.',
          },
          { label: 'Infusão lenta', value: 'Taxa reduzida — fora da janela de bolus (≤1 min)', badge: 'warn' },
          { label: 'Intermitente', value: 'Doses espaçadas — não bolus', badge: 'info' },
          { label: 'Efeito adverso', value: 'Conceito distinto — não confundir com modo IV', badge: 'ok' },
        ],
        footer_rule: 'Bolus é modo · adversos são farmacovigilância',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BOLUS',
        items: [
          {
            label: 'Letra B — efeito não pretendido',
            detail: 'Define reação a fármaco, não técnica de administração.',
            correct: 'Bolus é modo IV rápido — não é farmacovigilância.',
          },
          {
            label: 'Letra D — IV prolongada contínua',
            detail: 'Descreve infusão prolongada, não bolus.',
            correct: 'Bolus termina em até 1 minuto.',
          },
          {
            label: 'Letra E — IV prolongada intermitente',
            detail: 'Mistura tempo longo com intermitência.',
            correct: 'Intermitente não é sinônimo de bolus.',
          },
        ],
        footer_rule: 'Leia se a alternativa define modo ou conceito clínico',
      },
    ],
  },

  'fgv-enfermagem-vias-de-administracao-1776056366158-0': {
    family: 'vf',
    guideline: 'COFEN — Z-tracking IM recomendada · hipodermóclise contraindicada em emergência · IV lenta (faixa do enunciado)',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica parenteral',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três afirmativas V/F sobre IM, hipodermóclise e infusão IV lenta.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha Z-tracking (I)',
            detail: 'Técnica em Z reduz vazamento na IM — afirmar que “não é recomendada” inverte a conduta → item I é FALSO.',
            icon: 'Route',
          },
          {
            label: 'Hipodermóclise (II)',
            detail: 'Infusão SC de fluidos — contraindicada em emergência e desidratação severa → item II VERDADEIRO.',
            icon: 'Droplets',
          },
          {
            label: 'IV lenta (III)',
            detail: 'Infusão endovenosa lenta: faixa temporal do enunciado (30 min) → item III VERDADEIRO.',
            icon: 'Timer',
          },
        ],
        footer_rule: 'Sequência F, V, V — Z-tracking é recomendada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: três itens V/F + combinação.',
          'Julgar I: Z-tracking não recomendada na IM? → FALSO — técnica é recomendada.',
          'Julgar II: hipodermóclise contraindicada em emergência/desidratação severa? → VERDADEIRO.',
          'Julgar III: IV lenta na faixa do enunciado (30 min)? → VERDADEIRO.',
          'Sequência: F, V, V.',
          'Eliminar A (V,F,F), B (F,F,F), C (V,V,V), E (V,F,V).',
          'Marcar D.',
          'Fixação: item 1 inverte conduta segura de IM — filtro decisivo.',
        ],
        footer_rule: 'F,V,V → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica parenteral',
        meta: slideMeta,
        content: 'IM · HIPODERMÓCLISE · IV LENTA',
        rows: [
          { label: 'Z-tracking (IM)', value: 'Recomendada — reduz extravasamento/irritação', badge: 'hot' },
          { label: 'Hipodermóclise', value: 'Fluidos SC — evitar em choque/emergência', badge: 'warn' },
          { label: 'IV lenta', value: 'Taxa reduzida — enunciado cita 30 min', badge: 'ok' },
          { label: 'IV rápida', value: '1–30 min — categoria distinta', badge: 'info' },
        ],
        footer_rule: 'Z-tracking protege o músculo — não negue na prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F FGV',
        items: [
          {
            label: 'Letra A — V,F,F',
            detail: 'Aceita item 1 falso como verdadeiro — nega Z-tracking.',
            correct: 'Z-tracking é técnica recomendada na IM — item 1 é F.',
          },
          {
            label: 'Letra C — V,V,V',
            detail: 'Marca Z-tracking como não recomendada e confirma os demais.',
            correct: 'Só itens 2 e 3 são V; item 1 nega boa prática.',
          },
          {
            label: 'Letra E — V,F,V',
            detail: 'Erro duplo no item 1 e acerto parcial no 3.',
            correct: 'Sequência correta F,V,V — letra D.',
          },
          {
            label: 'Letra B — F,F,F',
            detail: 'Nega hipodermóclise e IV lenta corretamente descritas.',
            correct: 'Itens 2 e 3 são verdadeiros na referência de prova.',
          },
        ],
        footer_rule: 'Item 1 é o filtro — Z-tracking é boa prática',
      },
    ],
  },

  'avancasp-enfermagem-vias-de-administracao-1776056338955-0': {
    family: 'vf',
    guideline: 'COFEN — classificação de vias: oral, enteral (sonda), inalatória, tópica mucosa',
    roi_error: 'lista_parenteral_incompleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificação de vias',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro itens I–IV sobre rotas — julgar antes de combinar letras.',
            icon: 'Target',
          },
          {
            label: 'I — Oral',
            detail: 'Deglutição — via oral clássica → VERDADEIRO.',
            icon: 'Pill',
          },
          {
            label: 'II — Parenteral × sonda',
            detail: 'Sonda nasoenteral/nasogástrica é enteral, não parenteral — erro ROI da lista.',
            icon: 'GitCompare',
          },
          {
            label: 'III — Inalante',
            detail: 'Aerossol — via inalatória → VERDADEIRO.',
            icon: 'Wind',
          },
          {
            label: 'IV — Tópica mucosa',
            detail: 'Aplicação em mucosa — via tópica → VERDADEIRO.',
            icon: 'Layers',
          },
        ],
        footer_rule: 'II é F — enteral ≠ parenteral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I–IV + combinações.',
          'I: oral = deglutição? → VERDADEIRO.',
          'II: parenteral = sonda NG/NE? → FALSO — é enteral.',
          'III: inalante = aerossol? → VERDADEIRO.',
          'IV: tópica = mucosa? → VERDADEIRO.',
          'Conjunto: I, III e IV.',
          'Eliminar A (inclui II falsa), B (sem I), D e E (incluem II).',
          'Marcar C.',
          'Fixação: parenteral = fora do TGI (IV, IM, SC, ID…).',
        ],
        footer_rule: 'I + III + IV → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tipos de via',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO DE VIAS',
        rows: [
          { label: 'Oral', value: 'Deglutição — TGI superior', badge: 'ok' },
          { label: 'Enteral', value: 'Sonda NG/NE — ainda pelo tubo digestivo', badge: 'hot' },
          { label: 'Parenteral', value: 'IV · IM · SC · ID — bypass parcial/total do TGI', badge: 'warn' },
          { label: 'Inalatória', value: 'Aerossol · nebulização', badge: 'ok' },
          { label: 'Tópica', value: 'Pele ou mucosa conforme formulação', badge: 'ok' },
        ],
        footer_rule: 'Sonda digestiva = enteral, nunca parenteral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO',
        items: [
          {
            label: 'Letra A — I, II, III e IV',
            detail: 'Aceita II falsa — chama sonda de parenteral.',
            correct: 'Parenteral é fora do lúmen digestivo; sonda é enteral.',
          },
          {
            label: 'Letra B — II, III e IV',
            detail: 'Omite I verdadeiro e mantém II falsa.',
            correct: 'Oral por deglutição é item I verdadeiro.',
          },
          {
            label: 'Letra D — I, II e IV',
            detail: 'Inclui II falsa na combinação.',
            correct: 'II confunde enteral com parenteral — único item falso.',
          },
          {
            label: 'Confundir sonda com parenteral',
            detail: 'Aluno associa “invasivo” a parenteral.',
            correct: 'Enteral ainda usa tubo digestivo — parenteral é injeção/infusão vascular.',
          },
        ],
        footer_rule: 'II é o único F — feche enteral × parenteral',
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
    console.log(`[handcraft:vias-g03] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g03] total=${ok}`);
}

main();
