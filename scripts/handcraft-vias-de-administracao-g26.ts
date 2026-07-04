#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g26 (7 slugs — cauda final export vias-only).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g26.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const loteQuestionsDir = (lote: string) =>
  join(process.cwd(), 'data/catalog-migration', lote, 'questions');

const LOTE = 'vias-de-administracao-g26';
const SUBTOPICO = 'Vias de Administração';
const REVIEWED = '2026-07-04';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'via oral enteral',
    'técnica IM',
    'técnica SC',
    'volume intradérmico',
    'via retal/enema',
    'vias tópicas pediátricas',
    'benzilpenicilina benzatina IM',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção por via', 'técnica de punção', 'vias tópicas pediátricas', 'volumes ID', 'enema retal'],
};

const PNI_SOURCE = {
  id: 'pni-calendario-vip',
  tier: 'A' as const,
  issuer: 'MS / PNI',
  title: 'Calendário Nacional de Vacinação',
  year: 2024,
  url: 'https://www.gov.br/saude/',
  covers: ['BCG intradérmica', 'VOP oral Sabin', 'esquema vacinal'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito';
  branch: 'via_vf_absorcao' | 'via_tecnica_admin' | 'via_generico';
  guideline: string;
  roi_error?: string;
  cluster?: string;
  exam_vs_current?: string;
  sources?: (typeof COFEN_SOURCE)[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      cluster: pack.cluster ?? 'Perfis de via',
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'objetiva-concursos-enfermagem-vias-de-administracao-1776056374837-1': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'Enema retal — posição do paciente',
    guideline: 'Potter/COFEN — enema retal: decúbito lateral esquerdo (Sims) facilita instilação e retenção do líquido',
    roi_error: 'posicao_enema_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Enema retal — posição correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Paciente com constipação submetido a enema retal — assinalar posição CORRETA para o procedimento.',
            icon: 'Target',
          },
          {
            label: 'Via retal',
            detail: 'Instilação de solução no reto e sigmoide — evacuação ou medicamento conforme prescrição.',
            icon: 'Droplets',
          },
          {
            label: 'Sims / semilateral esquerda (gabarito)',
            detail: 'Decúbito lateral esquerdo com perna superior flexionada — expõe ânus e facilita introdução da sonda.',
            icon: 'CheckCircle',
          },
          {
            label: 'Conforto e gravidade',
            detail: 'Posição lateral permite retenção momentânea do líquido e reduz escape imediato.',
            icon: 'User',
          },
          {
            label: 'Pegadinha — Trendelenburg',
            detail: 'Cabeça mais baixa que os pés — usada em cirurgia/choque, não para enema.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — litotomia',
            detail: 'Posição ginecológica com pernas elevadas — não é padrão para enema de rotina.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Enema retal = lateral esquerda (Sims)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: posição CORRETA para enema retal em paciente com dificuldade de evacuação.',
          'Eliminar B Trendelenburg: cabeça declinada — perfil de choque/cirurgia, não instilação retal.',
          'Eliminar C genupeitoral: joelho-peito — outras indicações (ex. retossigmoidoscopia), não enema de rotina.',
          'Eliminar D litotomia: pernas em estribos — exame pélvico/ginecológico, não enema.',
          'Confirmar A Sims/semilateral esquerda: posição clássica para enema retal.',
          'Marcar A.',
          'Fixação: enema = lateral esquerda · não confunda com posições cirúrgicas.',
        ],
        footer_rule: 'Sims fecha enema retal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posições para enema',
        meta: slideMeta,
        content: 'ENEMA RETAL — POSICIONAMENTO',
        rows: [
          { label: 'Sims (lateral esq.)', value: 'Padrão para enema — acesso ao ânus e retenção', badge: 'hot' },
          { label: 'Trendelenburg', value: 'Cabeça baixa — não é posição de enema', badge: 'warn' },
          { label: 'Genupeitoral', value: 'Joelho-peito — outro contexto clínico', badge: 'info' },
          { label: 'Litotomia', value: 'Estribos — exame pélvico, não enema rotineiro', badge: 'warn' },
          { label: 'Técnica', value: 'Lubrificar ponta · introduzir sem força · manter lateral', badge: 'ok' },
        ],
        footer_rule: 'Lateral esquerda = gabarito A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS OBJETIVA — POSIÇÃO DO ENEMA',
        items: [
          {
            label: 'Letra B — Trendelenburg',
            detail: 'Paciente com cabeça mais baixa que o tronco.',
            correct: 'Trendelenburg é posição cirúrgica/de choque — não facilita enema retal.',
          },
          {
            label: 'Letra C — genupeitoral',
            detail: 'Joelhos apoiados no peito, quadril elevado.',
            correct: 'Genupeitoral serve a outros procedimentos retais — não é a posição clássica do enema.',
          },
          {
            label: 'Letra D — litotomia',
            detail: 'Decúbito dorsal com pernas elevadas em estribos.',
            correct: 'Litotomia é posição ginecológica/urológica — enema usa lateral esquerda (A).',
          },
          {
            label: 'Confundir com posição de punção IM',
            detail: 'Qualquer decúbito lateral parece “servir”.',
            correct: 'Enema retal pede Sims/semilateral esquerda especificamente — única alternativa correta.',
          },
        ],
        footer_rule: 'A integra posição padrão do enema',
      },
    ],
  },

  'objetiva-concursos-enfermagem-vias-de-administracao-1778968825263-1': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Agulha SC adulto — calibre e comprimento',
    guideline: 'COFEN/Potter — SC adulto: agulha curta 0,45×13 mm (13×4,5 mm); bisel curto; não confundir calibre IM',
    roi_error: 'agulha_sc_im_confusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Agulha subcutânea — perfil adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Tamanho tradicional da agulha para medicações subcutâneas em adultos.',
            icon: 'Target',
          },
          {
            label: 'Via SC',
            detail: 'Depósito no tecido adiposo (hipoderme) — absorção gradual; insulina, heparina, vacinas SC.',
            icon: 'Syringe',
          },
          {
            label: 'Gabarito 0,45×13 mm',
            detail: 'Agulha curta fina — equivalente a 13×4,5 mm; padrão SC adulto.',
            icon: 'CheckCircle',
          },
          {
            label: 'Calibre fino',
            detail: 'Diâmetro ~0,45 mm e comprimento ~13 mm — reduz trauma no tecido adiposo.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — 0,70×25 mm',
            detail: 'Agulha mais longa e grossa — perfil de IM, não SC de rotina.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 1,00×25 mm',
            detail: 'Agulha grossa longa — típico de IM ou coleta, não hipoderme.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'SC adulto = agulha curta fina (≈0,45×13 mm)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: agulha tradicional para SC em adultos.',
          'Eliminar A 0,70×25 mm: comprimento e calibre de perfil IM.',
          'Eliminar C 0,55×20 mm: intermediária — não é referência clássica SC.',
          'Eliminar D 1,00×25 mm: agulha grossa longa — IM/coleta, não hipoderme.',
          'Confirmar B 0,45×13 mm: agulha curta fina — padrão SC adulto.',
          'Marcar B.',
          'Fixação: SC = curta e fina · IM = mais longa.',
        ],
        footer_rule: '0,45×13 mm = SC clássica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — agulhas por via',
        meta: slideMeta,
        content: 'AGULHAS — SC × IM',
        rows: [
          { label: 'SC adulto', value: '0,45×13 mm (13×4,5 mm) — curta e fina', badge: 'hot' },
          { label: 'IM adulto', value: '0,70×25 mm ou maior conforme sítio', badge: 'ok' },
          { label: 'ID', value: 'Curta · bisel para cima · ângulo 10–15°', badge: 'info' },
          { label: 'Erro clássico', value: 'Usar agulha IM na SC', emphasis: 'alert', badge: 'warn' },
        ],
        footer_rule: 'Decore SC curta fina',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS OBJETIVA — AGULHA SC',
        items: [
          {
            label: 'Letra A — 0,70×25 mm',
            detail: 'Agulha mais longa e de calibre intermediário.',
            correct: 'Perfil típico de IM — SC adulto usa agulha mais curta (0,45×13 mm).',
          },
          {
            label: 'Letra C — 0,55×20 mm',
            detail: 'Medida intermediária entre SC e IM.',
            correct: 'Não é a referência tradicional de prova para SC — gabarito é 0,45×13 mm.',
          },
          {
            label: 'Letra D — 1,00×25 mm',
            detail: 'Agulha grossa de 25 mm.',
            correct: 'Calibre de IM/coleta venosa — incompatível com técnica SC de rotina.',
          },
          {
            label: 'Inverter SC com IM por tamanho',
            detail: 'Escolher a agulha “maior” achando que penetra melhor.',
            correct: 'SC exige agulha curta fina — B (0,45×13 mm) é o padrão cobrado.',
          },
        ],
        footer_rule: 'B fecha calibre SC adulto',
      },
    ],
  },

  'omni-enfermagem-vias-de-administracao-1778968997293-5': {
    family: 'vf',
    branch: 'via_vf_absorcao',
    cluster: 'Enema — tipos (limpeza × retenção) e mecanismo',
    guideline: 'Potter/COFEN — enema limpeza (fleet-enema comercial): evacuação rápida; retenção oleosa: horas no reto; peristaltismo e reflexo evacuatório',
    roi_error: 'enema_limpeza_retencao_invertido',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Enema — limpeza × retenção',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Julgar V/F sobre enema/lavagem intestinal — sequência correta de cima para baixo.',
            icon: 'Target',
          },
          {
            label: 'Item I — evacuação (V)',
            detail: 'Função principal: estimular evacuação via peristaltismo — afirmativa I verdadeira.',
            icon: 'CheckCircle',
          },
          {
            label: 'Item II — fleet × retenção (F)',
            detail: 'Fleet-enema comercial é laxante de LIMPEZA em frasco macio — não enema de retenção oleosa.',
            icon: 'XCircle',
          },
          {
            label: 'Item III — mecanismo (V)',
            detail: 'Líquido distende reto, rompe massa fecal e desencadeia reflexo evacuatório — III verdadeiro.',
            icon: 'CheckCircle',
          },
          {
            label: 'Item IV — limpeza × horas (F)',
            detail: 'Enema de limpeza evacua em minutos — retenção por horas é perfil de enema oleoso (IV falso).',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha — fleet × retenção oleosa',
            detail: 'Erro reproduzível: confundir fleet-enema (limpeza comercial) com enema de retenção à base de óleo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Limpeza = evacuação rápida · retenção = óleo por horas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar item I: função evacuatória via peristaltismo → VERDADEIRO.',
          'Julgar item II: fleet-enema como retenção oleosa → FALSO — fleet é laxante de limpeza comercial.',
          'Julgar item III: distensão retal + reflexo evacuatório → VERDADEIRO.',
          'Julgar item IV: enema de limpeza com retenção de horas → FALSO — limpeza evacua rápido.',
          'Montar sequência: V, F, V, F.',
          'Confirmar alternativa D.',
          'Marcar D.',
        ],
        footer_rule: 'Não misture fleet (limpeza) com óleo (retenção)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tipos de enema',
        meta: slideMeta,
        content: 'ENEMA — CLASSIFICAÇÃO',
        rows: [
          { label: 'Limpeza', value: 'Volume evacuatório · efeito em minutos', badge: 'hot' },
          { label: 'Retenção', value: 'Óleo/mineral · retido horas para amolecer fezes', badge: 'ok' },
          { label: 'Fleet-enema', value: 'Laxante osmótico comercial — perfil LIMPEZA', badge: 'warn' },
          { label: 'Mecanismo', value: 'Distensão retal → reflexo evacuatório (III)', badge: 'info' },
          { label: 'Sequência VF', value: 'I=V · II=F · III=V · IV=F', badge: 'ok' },
        ],
        footer_rule: 'Fleet ≠ enema oleoso de retenção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS OMNI — ENEMA VF',
        items: [
          {
            label: 'Letra A — V, V, F, F',
            detail: 'Aceita fleet-enema como retenção oleosa (item 2 V).',
            correct: 'Item 2 é FALSO: fleet-enema é solução de limpeza, não retenção à base de óleo.',
          },
          {
            label: 'Letra B — F, F, V, V',
            detail: 'Nega função evacuatória e aceita limpeza com retenção horária.',
            correct: 'Item 1 é VERDADEIRO (evacuação) e item 4 é FALSO (limpeza não retém horas).',
          },
          {
            label: 'Letra C — F, V, F, V',
            detail: 'Inverte julgamento de fleet e do mecanismo de distensão.',
            correct: 'Itens 1 e 3 são V; item 2 (fleet=retenção) é F — sequência correta V,F,V,F.',
          },
          {
            label: 'Confundir qualquer enema com retenção',
            detail: 'Assumir que todo enema fica horas no reto.',
            correct: 'Enema de limpeza evacua rapidamente — retenção prolongada é outro tipo (óleo).',
          },
        ],
        footer_rule: 'D — única sequência V,F,V,F',
      },
    ],
  },

  'sc-treinamentos-enfermagem-vias-de-administracao-1778968666352-5': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'Vacina Sabin (VOP) — via oral',
    guideline: 'PNI/MS — poliomielite oral (VOP/Sabin): gotas por via oral; VIP inativada é IM',
    roi_error: 'sabin_im_confusao',
    sources: [PNI_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vacina Sabin — via de administração',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar a via de administração da vacina Sabin (poliomielite oral).',
            icon: 'Target',
          },
          {
            label: 'Sabin = VOP',
            detail: 'Vacina oral poliomielite — vírus atenuado em gotas (não injetável).',
            icon: 'Pill',
          },
          {
            label: 'Via oral (gabarito)',
            detail: 'Administração por gotas na boca — imunização enteral atenuada.',
            icon: 'CheckCircle',
          },
          {
            label: 'VIP (contraste)',
            detail: 'Poliomielite INATIVADA — esquema IM aos 2-4-6 meses; não confundir com Sabin.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — IM na vacina oral',
            detail: 'Erro reproduzível: marcar intramuscular na vacina Sabin — VOP é gotas orais, não injetável.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — ID/SC',
            detail: 'Perfis de outras vacinas (BCG ID, algumas SC) — não se aplicam à VOP.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Sabin = gotas orais · VIP = IM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: via da vacina Sabin.',
          'Lembrar: Sabin = VOP = poliomielite ORAL atenuada.',
          'Eliminar A IM, B ID, C SC, E nasal: perfis injetáveis ou mucosas — não VOP.',
          'Confirmar D oral: gotas na boca — via clássica da Sabin.',
          'Marcar D.',
          'Fixação: Sabin oral · VIP inativada IM.',
        ],
        footer_rule: 'VOP = oral — não injetável',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — poliomielite no PNI',
        meta: slideMeta,
        content: 'POLIOMIELITE — VOP × VIP',
        rows: [
          { label: 'Sabin (VOP)', value: 'Via ORAL — gotas', badge: 'hot' },
          { label: 'VIP (inativada)', value: 'Via IM — 2, 4 e 6 meses', badge: 'ok' },
          { label: 'Pegadinha IM', value: 'Vacina ≠ sempre injetável', emphasis: 'alert', badge: 'warn' },
          { label: 'BCG (contraste)', value: 'Intradérmica — outra vacina', badge: 'info' },
        ],
        footer_rule: 'Decore: Sabin oral · VIP IM',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS SC TREINAMENTOS — SABIN',
        items: [
          {
            label: 'Pegadinha — intramuscular na Sabin',
            detail: 'Associar vacina Sabin a punção intramuscular.',
            correct: 'Sabin (VOP) é vacina oral em gotas — não tem via intramuscular.',
          },
          {
            label: 'Letra B — intradérmica',
            detail: 'Aplicar na derme como BCG.',
            correct: 'Intradérmica é perfil da BCG — Sabin usa via oral.',
          },
          {
            label: 'Letra C — subcutânea',
            detail: 'Depósito na hipoderme.',
            correct: 'VOP não é SC — administração é por gotas orais (D).',
          },
          {
            label: 'Letra E — nasal',
            detail: 'Via mucosa nasal.',
            correct: 'Sabin não é vacina intranasal — gabarito oral (D).',
          },
        ],
        footer_rule: 'D — única via compatível com VOP',
      },
    ],
  },

  'univida-enfermagem-vias-de-administracao-1778968646731-3': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'BCG — via intradérmica (PNI 2022)',
    guideline: 'PNI/MS IN 2022 — BCG: via intradérmica no deltoide direito ao nascer; dose fracionada na derme',
    roi_error: 'bcg_sc_im_confusao',
    sources: [PNI_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vacina BCG — via e sítio',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Segundo calendário PNI 2022: via de administração da vacina BCG.',
            icon: 'Target',
          },
          {
            label: 'BCG',
            detail: 'Bacilo Calmette-Guérin — imunizante contra formas graves de tuberculose.',
            icon: 'Shield',
          },
          {
            label: 'Intradérmica (gabarito)',
            detail: 'Injeção na derme — pápula característica; deltoide direito ao nascer.',
            icon: 'CheckCircle',
          },
          {
            label: 'Técnica ID',
            detail: 'Agulha curta, bisel para cima, ângulo 10–15°, dose fracionada na derme.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — SC',
            detail: 'Hipoderme é via de insulina/heparina — não BCG.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — IM',
            detail: 'Músculo não é sítio da BCG no PNI.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'BCG = intradérmica no deltoide direito',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: via BCG conforme PNI 2022.',
          'Eliminar A SC: hipoderme — perfil insulina/heparina, não BCG.',
          'Eliminar C percutânea: não é via padrão da BCG no calendário.',
          'Eliminar D IM: BCG não é intramuscular no esquema PNI.',
          'Confirmar B intradérmica: única via correta da BCG.',
          'Marcar B.',
          'Fixação: BCG = ID · hepatite B = IM.',
        ],
        footer_rule: 'BCG sempre intradérmica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — BCG no PNI',
        meta: slideMeta,
        content: 'BCG — VIA E SÍTIO',
        rows: [
          { label: 'Via', value: 'Intradérmica (ID)', badge: 'hot' },
          { label: 'Sítio', value: 'Inserção inferior deltoide direito', badge: 'ok' },
          { label: 'Dose', value: 'Volume fracionado ID — pápula visível', badge: 'info' },
          { label: 'SC (erro)', value: 'Insulina/heparina — não BCG', badge: 'warn' },
          { label: 'IM (erro)', value: 'Hepatite B pediátrica — não BCG', badge: 'warn' },
        ],
        footer_rule: 'Decore BCG = ID',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS UNIVIDA — BCG',
        items: [
          {
            label: 'Letra A — subcutânea',
            detail: 'Aplicar BCG na hipoderme.',
            correct: 'BCG é intradérmica — SC é via de outros imunobiológicos (ex. insulina).',
          },
          {
            label: 'Letra C — percutânea',
            detail: 'Aplicação através da pele sem punção clássica.',
            correct: 'PNI define BCG por via intradérmica — não percutânea.',
          },
          {
            label: 'Letra D — intramuscular',
            detail: 'Depósito no músculo deltoide.',
            correct: 'BCG não é IM — técnica exige intradérmica com pápula (B).',
          },
          {
            label: 'Confundir todas as vacinas com IM',
            detail: 'Generalizar “vacina = injeção no músculo”.',
            correct: 'BCG tem via específica ID — gabarito B.',
          },
        ],
        footer_rule: 'B fecha via BCG no PNI',
      },
    ],
  },

  'vunesp-enfermagem-vias-de-administracao-1776056366158-8': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Volume máximo SC em adultos',
    guideline: 'COFEN/Potter — SC: volume usual até ~1–2 mL por sítio; absorção gradual no tecido adiposo',
    exam_vs_current: 'Gabarito prova VUNESP = 1,0 mL (E); referências atuais citam até 1,5–2 mL conforme sítio',
    roi_error: 'volume_sc_exagerado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Volume máximo SC — adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Volume máximo de medicamentos/vacinas SC em adultos que não deve ultrapassar.',
            icon: 'Target',
          },
          {
            label: 'Trilho SC',
            detail: 'Hipoderme comporta pouco volume — excesso causa dor, extravasamento e má absorção.',
            icon: 'Droplets',
          },
          {
            label: 'Gabarito prova — 1,0 mL',
            detail: 'VUNESP fixa 1,0 mL como teto — decorar para esta banca.',
            icon: 'CheckCircle',
          },
          {
            label: 'Faixa de referência',
            detail: 'Literatura: ~1–2 mL por sítio; algumas bancas usam 1,5 mL.',
            icon: 'BookOpen',
          },
          {
            label: 'Distratores baixos',
            detail: '0,1–0,5 mL — abaixo do máximo perguntado.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha — confundir com IM',
            detail: 'Volumes de 2–5 mL são perfil IM, não SC.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Nesta prova: máximo SC = 1,0 mL (E)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: volume MÁXIMO SC em adultos — não confundir com dose usual.',
          'Eliminar A 0,1 mL, B 0,3 mL, C 0,4 mL, D 0,5 mL: todos abaixo do teto da banca.',
          'Confirmar E 1,0 mL: máximo indicado nesta questão VUNESP.',
          'Marcar E.',
          'Fixação: SC = volume pequeno; decorar 1,0 mL para VUNESP.',
          'Nota: outras referências podem citar 1,5 mL — gabarito literal da prova prevalece.',
        ],
        footer_rule: 'Pergunta pede máximo — não mínimo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — volumes SC',
        meta: slideMeta,
        content: 'VOLUME MÁXIMO — SC ADULTO',
        rows: [
          { label: 'Teto SC (prova)', value: '1,0 mL por sítio em adultos', badge: 'hot' },
          { label: 'Faixa COFEN', value: '≈1–2 mL por sítio', badge: 'info' },
          { label: 'IM (contraste)', value: 'Deltoide ~2 mL · glúteo mais', badge: 'ok' },
          { label: 'ID (contraste)', value: 'Dose fracionada na derme', badge: 'warn' },
          { label: 'Erro clássico', value: 'Confundir teto SC com volume IM', emphasis: 'alert', badge: 'warn' },
        ],
        footer_rule: 'SC pequena · IM intermediária',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS VUNESP — VOLUME SC',
        items: [
          {
            label: 'Letra A — 0,1 mL',
            detail: 'Volume mínimo típico de ID.',
            correct: '0,1 mL é teto da intradérmica — pergunta pede máximo SC (1,0 mL).',
          },
          {
            label: 'Letra B — 0,3 mL',
            detail: 'Dose fracionada comum em algumas SC.',
            correct: 'Ainda abaixo do máximo da banca — gabarito é 1,0 mL (E).',
          },
          {
            label: 'Letra D — 0,5 mL',
            detail: 'Valor intermediário sedutor.',
            correct: 'Metade do teto VUNESP — máximo indicado é 1,0 mL.',
          },
          {
            label: 'Transferir volume IM para SC',
            detail: 'Marcar 2–5 mL por associar injeção a volume alto.',
            correct: 'SC comporta pouco — nesta prova o teto é 1,0 mL (E).',
          },
        ],
        footer_rule: 'E — 1,0 mL fecha o teto da banca',
      },
    ],
  },

  'vunesp-enfermagem-vias-de-administracao-1778968768987-1': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'SC insulina — ângulo com agulha longa em emagrecido',
    guideline: 'COFEN/Potter — SC: agulha curta 13×4,5 mm a 90° (ou pinça); agulha longa 25×7 mm em adiposo fino → ~45° para não atingir músculo',
    roi_error: 'angulo_sc_agulha_longa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SC insulina — ângulo e agulha',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Sem agulha 13×4,5 mm, usar 25×7 mm em adulto emagrecido — insulina no abdômen: ângulo correto.',
            icon: 'Target',
          },
          {
            label: 'Agulha padrão SC',
            detail: '13×4,5 mm (4 mm) — perpendicular 90° na maioria dos sítios com caneta/seringa curta.',
            icon: 'Syringe',
          },
          {
            label: 'Agulha longa 25×7 mm',
            detail: 'Maior risco de atingir músculo em paciente magro — exige inclinação.',
            icon: 'Ruler',
          },
          {
            label: 'Gabarito 45°',
            detail: 'Inclinação reduz profundidade — depósito seguro no tecido adiposo abdominal.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha — 90°',
            detail: 'Perpendicular com agulha longa em emagrecido pode perfurar até o músculo.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 15°',
            detail: 'Ângulo de intradérmica ou punção superficial — não SC com agulha longa.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Agulha longa + magro = 45° no abdômen',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler: falta 13×4,5 mm · usar 25×7 mm · adulto emagrecido · insulina no abdômen.',
          'Eliminar A 15° e B 25°: ângulos superficiais — perfil ID, não SC com agulha longa.',
          'Eliminar D 90°: perpendicular com agulha longa em magro → risco de IM inadvertida.',
          'Eliminar E 120°: ângulo inválido para punção SC.',
          'Confirmar C 45°: inclinação clássica para agulha longa em adiposo fino.',
          'Marcar C.',
          'Fixação: curta = 90° · longa em magro = 45°.',
        ],
        footer_rule: 'Leia calibre e espessura do paciente',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ângulos SC',
        meta: slideMeta,
        content: 'SC — ÂNGULO × AGULHA × ADIPOSIDADE',
        rows: [
          { label: '13×4,5 mm (curta)', value: '90° na maioria dos sítios', badge: 'ok' },
          { label: '25×7 mm (longa)', value: '45° em adiposo fino/emagrecido', badge: 'hot' },
          { label: 'Prega espessa', value: '90° na prega pinçada (obesos)', badge: 'info' },
          { label: 'IM (contraste)', value: '90° perpendicular no músculo', badge: 'warn' },
        ],
        footer_rule: 'Agulha longa + magro → 45°',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS VUNESP — ÂNGULO SC',
        items: [
          {
            label: 'Letra A — 15°',
            detail: 'Inclinação mínima com bisel quase paralelo à pele.',
            correct: '15° é perfil intradérmica — SC com agulha longa usa ~45° (C).',
          },
          {
            label: 'Letra B — 25°',
            detail: 'Inclinação intermediária baixa.',
            correct: 'Não é referência de prova para SC com 25×7 mm — gabarito 45°.',
          },
          {
            label: 'Letra D — 90°',
            detail: 'Perpendicular à pele abdominal.',
            correct: 'Com agulha longa em emagrecido, 90° pode atingir músculo — usar 45°.',
          },
          {
            label: 'Letra E — 120°',
            detail: 'Ângulo obtuso impossível na técnica.',
            correct: 'Inválido para punção SC — única inclinação plausível é 45° (C).',
          },
        ],
        footer_rule: 'C — 45° com agulha longa em magro',
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
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:vias-g26] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g26] total=${ok}`);
}

main();
