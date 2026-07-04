#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g11 (8 slugs P0 via_vf_absorcao / técnica).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g11.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g11';
const SUBTOPICO = 'Vias de Administração';
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
    'insulina SC',
    'via retal/enema',
    'classificação enteral/parenteral',
    'sítio IM ventroglúteo',
    'via sublingual',
    'vias tópicas mucosas',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção lenta', 'técnica de punção', 'classificação de vias', 'sublingual'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'calc';
  branch?: string;
  guideline: string;
  roi_error?: string;
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
    pedagogical_branch: pack.branch ?? 'via_vf_absorcao',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'instituto-jk-enfermagem-vias-de-administracao-1776056418941-2': {
    family: 'conceito',
    guideline: 'COFEN — insulina: via subcutânea para absorção gradual e contínua',
    roi_error: 'sc_indicacao_insulina',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina — indicação da via',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Absorção ideal da insulina — escolha a via pelo perfil farmacocinético (lenta/contínua), não pela rapidez.',
            icon: 'Target',
          },
          {
            label: 'Trilho parenteral',
            detail: 'IV imediata > IM rápida > SC lenta — insulina exige depósito gradual no tecido adiposo.',
            icon: 'TrendingUp',
          },
          {
            label: 'Tecido subcutâneo (SC)',
            detail: 'Via padrão da insulina: hipoderme/adiposo com absorção lenta e previsível.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha IM',
            detail: 'Músculo absorve mais rápido que SC — perfil inadequado para controle glicêmico domiciliar.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha ID/derme',
            detail: 'Intradérmica é rota de teste (BCG, PPD) — não depósito terapêutico de insulina.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Padrão Instituto JK',
            detail: 'Lista sítios anatômicos como distratores — feche trilho SC antes da letra.',
            icon: 'Pill',
          },
        ],
        footer_rule: 'Insulina = SC — IM rápida demais · ID = teste · adiposo = sinônimo de SC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: absorção ideal da insulina — perfil lento e contínuo.',
          'Eliminar A (músculo/IM): absorção mais rápida que SC — não é via clássica de insulina.',
          'Eliminar C (derme/ID): rota de testes cutâneos, não tratamento crônico.',
          'Eliminar D (tecido adiposo isolado): descreve o sítio, mas a via técnica é subcutânea (B).',
          'Confirmar B (tecido subcutâneo): depósito na hipoderme com liberação gradual.',
          'Marcar B.',
          'Fixação: insulina → SC até virar reflexo de prova.',
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
            value: 'Via padrão — absorção gradual no tecido adiposo',
            badge: 'hot',
            exam_hint: 'Gabarito B — absorção ideal = lenta e previsível.',
          },
          { label: 'Intramuscular (IM)', value: 'Absorção mais rápida — não rotina insulina', badge: 'warn' },
          { label: 'Intradérmica (ID)', value: 'Testes cutâneos/BCG — não insulina terapêutica', badge: 'info' },
          { label: 'Sítios SC', value: 'Abdome · coxa · deltoide — rotação de aplicação', badge: 'ok' },
          { label: 'Mnemônico', value: 'IV > IM > SC no trilho — insulina fica no SC' },
        ],
        footer_rule: 'Decore: insulina = SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA',
        items: [
          {
            label: 'Letra A — no músculo',
            detail: 'IM é mais vascularizada — absorção rápida demais para insulina de rotina.',
            correct: 'SC permite liberação gradual; IM gera pico imprevisível.',
          },
          {
            label: 'Letra C — na derme',
            detail: 'Confunde camada da pele com via terapêutica de insulina.',
            correct: 'ID (derme) serve para testes, não para depósito de insulina.',
          },
          {
            label: 'Letra D — tecido adiposo',
            detail: 'Descreve o sítio correto, mas a alternativa técnica da prova é “subcutâneo”.',
            correct: 'Adiposo está na hipoderme — gabarito formal = via subcutânea (B).',
          },
          {
            label: 'Confundir rapidez com ideal',
            detail: 'Aluno escolhe IM pensando em “melhor absorção = mais rápida”.',
            correct: 'Ideal para insulina = lenta e contínua → SC.',
          },
        ],
        footer_rule: 'Trilho SC < IM — insulina pede depósito lento',
      },
    ],
  },

  'instituto-verbena-enfermagem-vias-de-administracao-1776056427936-1': {
    family: 'conceito',
    guideline: 'COFEN/Potter — não parenteral = sem punção (oral, sublingual, retal, tópica)',
    roi_error: 'lista_parenteral_incompleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificação — parenteral × não parenteral',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Farmacologia e terapêutica: lacuna “via não parenteral” — administração de medicamentos sem injeção nos tecidos.',
            icon: 'Target',
          },
          {
            label: 'Não parenteral',
            detail: 'Oral, sublingual, retal, tópica, inalatória — medicamento pelo lúmen ou mucosa sem punção.',
            icon: 'Pill',
          },
          {
            label: 'Parenteral',
            detail: 'IV, IM, SC, ID — bypass do TGI por injeção/infusão nos tecidos.',
            icon: 'Syringe',
          },
          {
            label: 'Sublingual',
            detail: 'Absorção pela mucosa oral — evita deglutição e parte da 1ª passagem hepática.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha parenteral × não parenteral',
            detail: 'Intravenosa, subcutânea e intramuscular são parenterais — banca troca com sublingual.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Não parenteral = sem agulha · sublingual é mucosa oral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: identificar via NÃO parenteral (sem injeção nos tecidos).',
          'Eliminar A (intravenosa): parenteral — acesso venoso direto.',
          'Eliminar B (subcutânea): parenteral — punção na hipoderme.',
          'Eliminar D (intramuscular): parenteral — punção no músculo.',
          'Confirmar C (sublingual): mucosa oral, sem agulha — não parenteral.',
          'Marcar C.',
          'Fixação: parenteral = par + enter (ao lado do intestino) = fora do TGI por injeção.',
        ],
        footer_rule: 'Sem punção → sublingual',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação de vias',
        meta: slideMeta,
        content: 'VIAS — PARENTERAL × NÃO PARENTERAL',
        rows: [
          { label: 'Parenteral', value: 'IV · IM · SC · ID — injeção/infusão', badge: 'warn' },
          { label: 'Não parenteral', value: 'Oral · sublingual · retal · tópica · inalatória', badge: 'hot' },
          { label: 'Sublingual', value: 'Mucosa oral — absorção rápida, sem agulha', badge: 'ok', exam_hint: 'Gabarito C.' },
          { label: 'Oral (VO)', value: 'Deglutição — passa pelo TGI', badge: 'info' },
          { label: 'Mnemônico', value: 'Parenteral = punção · resto = não parenteral' },
        ],
        footer_rule: 'Injeção = parenteral — mucosa sem agulha = não parenteral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO',
        items: [
          {
            label: 'Letra A — intravenosa',
            detail: 'Via de acesso venoso direto — máximo de parenteral.',
            correct: 'IV é parenteral por definição — elimine antes de marcar.',
          },
          {
            label: 'Letra B — subcutânea',
            detail: 'Punção na hipoderme — ainda é injeção nos tecidos.',
            correct: 'SC é parenteral; não preenche “não parenteral”.',
          },
          {
            label: 'Letra D — intramuscular',
            detail: 'Punção no músculo — rota parenteral clássica.',
            correct: 'IM ≠ não parenteral.',
          },
          {
            label: 'Confundir sublingual com parenteral',
            detail: 'Aluno associa “rápida” a injeção.',
            correct: 'Sublingual usa mucosa oral — sem agulha.',
          },
          {
            label: 'Pegadinha parenteral × não parenteral',
            detail: 'Marcar via injetável quando o enunciado pede não parenteral.',
            correct: 'Parenteral = IV/IM/SC; sublingual não exige punção — gabarito C.',
          },
        ],
        footer_rule: 'Três distratores são parenterais — só C fecha',
      },
    ],
  },

  'instituto-verbena-enfermagem-vias-de-administracao-1778968609115-9': {
    family: 'conceito',
    guideline: 'Potter/COFEN — enteral = vias que usam o trato gastrointestinal',
    roi_error: 'lista_parenteral_incompleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Enteral × parenteral — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Vias que envolvem o trato gastrointestinal — classificação farmacológica básica.',
            icon: 'Target',
          },
          {
            label: 'Via enteral',
            detail: 'Medicamento pelo lúmen digestivo: oral, sublingual (parcial), retal, sonda NG/NE.',
            icon: 'Pill',
          },
          {
            label: 'Via parenteral',
            detail: 'Fora do TGI: IV, IM, SC, ID — injeção ou infusão nos tecidos.',
            icon: 'Syringe',
          },
          {
            label: 'Epidural/pleural',
            detail: 'Rotas especiais (anestesia/pleura) — não são classificação enteral de prova básica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha enteral × parenteral',
            detail: 'Cabral: velocidade de absorção — banca troca enteral (TGI) com parenteral na letra B.',
            icon: 'BookOpen',
          },
        ],
        footer_rule: 'TGI = enteral · injeção = parenteral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: vias que envolvem o trato gastrointestinal.',
          'Eliminar B (parenteral): fora do lúmen digestivo — IV/IM/SC/ID.',
          'Eliminar C (epidural): espaço peridural — não é via enteral.',
          'Eliminar D (pleural): cavidade torácica — não é TGI.',
          'Confirmar A (enteral): medicamentos pelo trato gastrointestinal.',
          'Marcar A.',
          'Fixação: enteral = pelo tubo digestivo; parenteral = par + enter.',
        ],
        footer_rule: 'TGI → enteral',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação enteral',
        meta: slideMeta,
        content: 'VIAS — ENTERAL × PARENTERAL',
        rows: [
          { label: 'Enteral', value: 'Oral · sublingual · retal · sonda digestiva', badge: 'hot', exam_hint: 'Gabarito A.' },
          { label: 'Parenteral', value: 'IV · IM · SC · ID — bypass do TGI', badge: 'warn' },
          { label: 'Oral (VO)', value: 'Deglutição — estômago e intestino', badge: 'ok' },
          { label: 'Retal', value: 'Absorção pelo reto — ainda enteral', badge: 'info' },
          { label: 'Epidural/pleural', value: 'Rotas especiais — fora da classificação básica', badge: 'info' },
        ],
        footer_rule: 'Pergunta sobre TGI → enteral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ENTERAL',
        items: [
          {
            label: 'Letra B — parenteral',
            detail: 'Oposto direto da pergunta — fora do trato gastrointestinal.',
            correct: 'Parenteral = injeção; enteral = lúmen digestivo.',
          },
          {
            label: 'Letra C — epidural',
            detail: 'Rota anestésica na coluna — não passa pelo TGI, mas também não é “enteral”.',
            correct: 'Epidural é via especial — elimine pela definição do enunciado.',
          },
          {
            label: 'Letra D — pleural',
            detail: 'Instilação na pleura — confunde cavidade torácica com digestório.',
            correct: 'Pleural ≠ gastrointestinal.',
          },
          {
            label: 'Trocar enteral com parenteral',
            detail: 'Erro ROI clássico — aluno decora “parenteral” sem fixar o TGI.',
            correct: 'Enteral = pelo tubo digestivo.',
          },
          {
            label: 'Pegadinha enteral × parenteral',
            detail: 'Letra B lista parenteral quando o enunciado pede vias do trato gastrointestinal.',
            correct: 'Trato gastrointestinal = enteral (A), não parenteral.',
          },
        ],
        footer_rule: 'TGI no enunciado → só enteral fecha',
      },
    ],
  },

  'ms-sarmento-enfermagem-vias-de-administracao-1776056391403-6': {
    family: 'conceito',
    guideline: 'COFEN/MS — enema: introdução de solução via retal para eliminação ou medicamento',
    roi_error: 'retal_sempre_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via retal — enema',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Introdução de solução via retal para eliminação de toxinas/resíduos — identificar a técnica.',
            icon: 'Target',
          },
          {
            label: 'Enema',
            detail: 'Instilação de solução no reto — evacuação, desimpactação ou medicamento (prescrição médica).',
            icon: 'Droplets',
          },
          {
            label: 'Via retal',
            detail: 'Absorção variável — porção inferior pode atingir circulação sistêmica com menor 1ª passagem.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha endoscopia',
            detail: 'Endoscopia/colonoscopia = visualização — não instilação de solução evacuatória.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha acesso venoso',
            detail: 'Periférico/central = IV — outro eixo (vascular), não retal.',
            icon: 'Syringe',
          },
        ],
        footer_rule: 'Solução no reto + eliminação = enema',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica de introdução de solução via retal para eliminar toxinas/resíduos.',
          'Eliminar B (endoscopia): exame visual — não instilação evacuatória.',
          'Eliminar C (acesso periférico): via venosa periférica — IV.',
          'Eliminar D (acesso central): via IV de alto fluxo — não retal.',
          'Eliminar E (colonoscopia): exame do cólon — não enema.',
          'Confirmar A (enema): instilação retal prescrita.',
          'Marcar A.',
          'Fixação: enema = solução no reto; endoscopia = olhar, não lavar.',
        ],
        footer_rule: 'Retal + solução + eliminação → enema',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — via retal',
        meta: slideMeta,
        content: 'VIA RETAL — ENEMA',
        rows: [
          { label: 'Enema', value: 'Solução no reto — evacuação ou medicamento', badge: 'hot', exam_hint: 'Gabarito A.' },
          { label: 'Indicações', value: 'Constipação · desimpactação · alguns medicamentos', badge: 'ok' },
          { label: 'Absorção', value: 'Reto inferior → sistêmica com menor 1ª passagem', badge: 'info' },
          { label: 'Colonoscopia', value: 'Exame diagnóstico — não instilação evacuatória', badge: 'warn' },
          { label: 'Acesso venoso', value: 'IV — eixo vascular, não retal', badge: 'warn' },
        ],
        footer_rule: 'Enema ≠ endoscopia ≠ IV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIA RETAL',
        items: [
          {
            label: 'Letra B — endoscopia',
            detail: 'Procedimento de visualização do TGI — não introdução de solução evacuatória.',
            correct: 'Enema instila; endoscopia observa.',
          },
          {
            label: 'Letra E — colonoscopia',
            detail: 'Exame do cólon com endoscópio — distrator semântico próximo.',
            correct: 'Colonoscopia é diagnóstica, não técnica de enema.',
          },
          {
            label: 'Letra C/D — acesso venoso',
            detail: 'Confunde via retal com acesso IV.',
            correct: 'Periférico/central = infusão venosa — outro universo de prova.',
          },
          {
            label: 'Generalizar “procedimento intestinal”',
            detail: 'Qualquer técnica do abdome parece plausível.',
            correct: 'Enunciado cita solução via retal + eliminação — feche enema.',
          },
        ],
        footer_rule: 'Instilar solução no reto = enema',
      },
    ],
  },

  'ms-sarmento-enfermagem-vias-de-administracao-1776056409987-3': {
    family: 'conceito',
    guideline: 'COFEN — parenteral: IV, IM, SC, ID (+ rotas especiais como intratecal)',
    roi_error: 'lista_parenteral_incompleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vias parenterais — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Listar vias parenterais — todas fora do lúmen digestivo por injeção/infusão.',
            icon: 'Target',
          },
          {
            label: 'Parenteral clássica',
            detail: 'IV, IM, SC, ID — núcleo de toda prova de técnico.',
            icon: 'Syringe',
          },
          {
            label: 'Rotas especiais',
            detail: 'Intratecal, intraóssea, intraperitoneal — parenterais, mas fora da lista mínima.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha via oral',
            detail: 'Oral, gastrostomia, jejunostomia são enterais — nunca parenterais.',
            icon: 'GitCompare',
          },
          {
            label: 'Gabarito Sarmento',
            detail: 'Letra A reúne IV + SC + IM + intratecal — sem misturar VO.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Parenteral = sem deglutição · oral = enteral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quais vias são parenterais.',
          'Eliminar B: inclui via oral — enteral, não parenteral.',
          'Eliminar C: mistura IV/intratecal com via oral.',
          'Eliminar D: oral + ocular + ID — oral invalida a lista.',
          'Eliminar E: oral, gastrostomia, jejunostomia — todas enterais.',
          'Confirmar A: IV, SC, IM e intratecal — sem via oral.',
          'Marcar A.',
          'Fixação: se aparecer “oral” na lista parenteral → elimine a letra.',
        ],
        footer_rule: 'Oral na lista = letra falsa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — parenteral',
        meta: slideMeta,
        content: 'VIAS PARENTERAIS',
        rows: [
          { label: 'Intravenosa (IV)', value: 'Acesso venoso direto', badge: 'hot' },
          { label: 'Intramuscular (IM)', value: 'Músculo — absorção rápida', badge: 'ok' },
          { label: 'Subcutânea (SC)', value: 'Hipoderme — absorção lenta', badge: 'ok' },
          { label: 'Intratecal', value: 'Espaço subaracnóideo — parenteral especial', badge: 'info', exam_hint: 'Presente na letra A.' },
          { label: 'Enteral (excluir)', value: 'Oral · sonda · gastrostomia — NÃO parenteral', badge: 'warn' },
        ],
        footer_rule: 'Parenteral ≠ oral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LISTA PARENTERAL',
        items: [
          {
            label: 'Letra B — via oral na lista',
            detail: 'Inclui enteral entre parenterais.',
            correct: 'Oral é via enteral — invalida toda a alternativa.',
          },
          {
            label: 'Letra C — IV + oral',
            detail: 'Mistura correta (IV) com incorreta (oral).',
            correct: 'Um item enteral contamina a lista inteira.',
          },
          {
            label: 'Letra E — gastrostomia/jejunostomia',
            detail: 'Sondas digestivas são enterais.',
            correct: 'Gastrostomia e jejunostomia = enteral, não parenteral.',
          },
          {
            label: 'Letra D — via ocular',
            detail: 'Ocular é tópica/local — não classificação parenteral desta questão.',
            correct: 'Foco da prova: injeção/infusão — oral é o distrator principal.',
          },
        ],
        footer_rule: 'Qualquer VO na lista → eliminar',
      },
    ],
  },

  'objetiva-concursos-enfermagem-vias-de-administracao-1778968609115-7': {
    family: 'vf',
    guideline: 'COFEN — vias não parenterais: tópica/cutânea, ocular, otológica são rotas sem punção',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vias não parenterais — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três itens sobre vias não parenterais (sem injeção) — julgar I, II e III antes das letras.',
            icon: 'Target',
          },
          {
            label: 'I — Tópica/cutânea',
            detail: 'Aplicação na pele — pomadas, cremes, adesivos transdérmicos. VERDADEIRA.',
            icon: 'Droplets',
          },
          {
            label: 'II — Via ocular',
            detail: 'Colírios e pomadas oftálmicas — mucosa ocular, sem punção. VERDADEIRA.',
            icon: 'Eye',
          },
          {
            label: 'III — Otológica',
            detail: 'Gotas otológicas no conduto auditivo — via local. VERDADEIRA.',
            icon: 'Ear',
          },
          {
            label: 'Pegadinha “só um item”',
            detail: 'Banca testa se o aluno elimina rotas locais válidas — os três são não parenterais.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tópica + ocular + otológica = todas não parenterais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I, II, III + combinações — julgar cada item.',
          'Julgar I (tópica/cutânea): aplicação na pele sem injeção → VERDADEIRO.',
          'Julgar II (via ocular): colírio/pomada ocular → VERDADEIRO.',
          'Julgar III (otológica): gotas no ouvido → VERDADEIRO.',
          'Conjunto: I + II + III verdadeiros → todos os itens.',
          'Eliminar A (só I), B (só III), C (II e III).',
          'Confirmar D — todos os itens.',
          'Marcar D.',
          'Fixação: não parenteral = sem agulha — inclui mucosas e pele.',
        ],
        footer_rule: 'I, II, III = V → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias não parenterais',
        meta: slideMeta,
        content: 'VIAS NÃO PARENTERAIS — LOCAIS',
        rows: [
          { label: 'Tópica/cutânea', value: 'Pele — pomadas, cremes, gel', badge: 'ok' },
          { label: 'Via ocular', value: 'Colírio, pomada oftálmica', badge: 'ok' },
          { label: 'Otológica', value: 'Conduto auditivo — gotas auriculares', badge: 'ok' },
          { label: 'Transdérmica', value: 'Adesivo — absorção sistêmica pela pele', badge: 'info' },
          { label: 'Parenteral (contraste)', value: 'IV · IM · SC · ID — com punção', badge: 'warn' },
        ],
        footer_rule: 'Sem injeção = não parenteral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F NÃO PARENTERAL',
        items: [
          {
            label: 'Letra A — somente I',
            detail: 'Descarta ocular e otológica — rotas locais válidas.',
            correct: 'II e III também são não parenterais.',
          },
          {
            label: 'Letra B — somente III',
            detail: 'Ignora tópica e ocular.',
            correct: 'I (cutânea) e II (ocular) são verdadeiras.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Exclui a tópica/cutânea.',
            correct: 'Item I é verdadeiro — pele é via não parenteral clássica.',
          },
          {
            label: 'Marcar sem julgar os três',
            detail: 'Pular item a item leva a combinação parcial.',
            correct: 'Julgue I, II, III → todos V → D.',
          },
        ],
        footer_rule: 'Três itens verdadeiros → D',
      },
    ],
  },

  'objetiva-concursos-enfermagem-vias-de-administracao-1778968666352-9': {
    family: 'vf',
    guideline: 'COFEN/Potter — sublingual: urgência, comprimido sublingual, sem técnica estéril de punção',
    roi_error: 'sublingual_irritante',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via sublingual — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três afirmativas sobre sublingual — julgar técnica, indicação e procedimento.',
            icon: 'Target',
          },
          {
            label: 'I — Urgência e comprimido',
            detail: 'Nitratos e outras drogas de ação rápida em comprimido de dissolução — não deglutir. VERDADEIRO.',
            icon: 'Zap',
          },
          {
            label: 'II — Técnica estéril',
            detail: 'Sublingual não exige campo estéril como punção — é mucosa oral limpa. FALSO.',
            icon: 'GitCompare',
          },
          {
            label: 'III — Procedimento × oral',
            detail: 'Semelhante à VO nos cuidados gerais, mas sem água — coloca sob a língua. VERDADEIRO.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha estéril',
            detail: 'Aluno transfere técnica asséptica de IM/IV para sublingual — item II é a armadilha.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'I e III = V · II = F (não é punção estéril)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I, II, III + combinações.',
          'Julgar I: urgência + comprimido sublingual não deglutido → VERDADEIRO.',
          'Julgar II: exige técnica estéril na preparação → FALSO — não é via invasiva.',
          'Julgar III: etapas parecidas com VO, sem água, sob a língua → VERDADEIRO.',
          'Conjunto: I e III verdadeiros, II falso.',
          'Eliminar A (só I), B (só II), D (todos).',
          'Confirmar C — somente I e III.',
          'Marcar C.',
          'Fixação: sublingual = mucosa oral, não campo operatório.',
        ],
        footer_rule: 'V, F, V → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sublingual',
        meta: slideMeta,
        content: 'VIA SUBLINGUAL',
        rows: [
          { label: 'Absorção', value: 'Mucosa oral vascularizada — rápida', badge: 'hot' },
          { label: 'Indicação', value: 'Urgência (ex.: nitratos) — comprimido sublingual', badge: 'ok' },
          { label: 'Técnica', value: 'Higiene oral · não deglutir · sem água obrigatória', badge: 'ok' },
          { label: 'Estéril?', value: 'Não exige técnica estéril de punção', badge: 'warn', exam_hint: 'Item II é falso.' },
          { label: 'Irritantes', value: 'Não indicar substâncias que lesam mucosa oral', badge: 'info' },
        ],
        footer_rule: 'Sublingual ≠ punção estéril',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SUBLINGUAL',
        items: [
          {
            label: 'Letra B — somente II',
            detail: 'Aceita só o item falso (técnica estéril).',
            correct: 'II é F — sublingual não requer esterilização de punção.',
          },
          {
            label: 'Letra D — todos os itens',
            detail: 'Inclui II falso como verdadeiro.',
            correct: 'Técnica estéril na preparação não é requisito clássico da sublingual.',
          },
          {
            label: 'Letra A — somente I',
            detail: 'Descarta III verdadeiro sobre procedimento.',
            correct: 'III descreve corretamente a administração sem água.',
          },
          {
            label: 'Transferir assépsia de IM/IV',
            detail: 'Erro ROI — misturar cuidados de punção com mucosa oral.',
            correct: 'Sublingual: limpeza oral, não campo estéril.',
          },
        ],
        footer_rule: 'II falso → eliminar B e D',
      },
    ],
  },

  'selecon-enfermagem-vias-de-administracao-1776056383154-2': {
    family: 'conceito',
    guideline: 'COFEN — sítio IM preferencial adulto: ventroglútea (volume, absorção, menor risco)',
    roi_error: 'nervo_ciatico_gluteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Punção IM — sítio preferencial',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'IM em adulto — região com maior volume, boa absorção e menor risco de complicações.',
            icon: 'Target',
          },
          {
            label: 'Ventroglúteo',
            detail: 'Glúteo médio — afasta nervo ciático, marcos ósseos palpáveis, aceita volumes maiores.',
            icon: 'Shield',
          },
          {
            label: 'Deltoide',
            detail: 'Volume limitado (~2 mL) — útil, mas não “preferencial” para critérios do enunciado.',
            icon: 'Syringe',
          },
          {
            label: 'Vasto lateral',
            detail: 'Opção em crianças/lactentes — adulto pede ventroglútea nesta lógica.',
            icon: 'Baby',
          },
          {
            label: 'Bíceps braquial',
            detail: 'Não é sítio clássico de IM — distrator anatômico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Adulto + volume + segurança → ventroglúteo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: IM em adulto — técnica asséptica, prescrição médica.',
          'Critérios: maior volume + boa absorção + menor risco.',
          'Eliminar A (deltoide): volume restrito — não fecha “maior volume”.',
          'Eliminar C (bíceps): não é sítio IM padrão.',
          'Eliminar D (vasto lateral): mais usado em pediatria.',
          'Confirmar B (ventroglúteo): músculo profundo, seguro, grande volume.',
          'Marcar B.',
          'Fixação: ventroglútea = sítio seguro em adultos — palpar marcos.',
        ],
        footer_rule: 'Volume + segurança → ventroglúteo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios IM',
        meta: slideMeta,
        content: 'PUNÇÃO IM — SÍTIOS',
        rows: [
          {
            label: 'Ventroglúteo',
            value: 'Preferencial adulto — menor risco de nervo ciático',
            badge: 'hot',
            exam_hint: 'Gabarito B.',
          },
          { label: 'Deltoide', value: 'Até ~2 mL — braço', badge: 'warn' },
          { label: 'Vasto lateral', value: 'Coxa — pediatria frequente', badge: 'info' },
          { label: 'Dorsoglútea', value: 'Alto volume, risco de ciático se técnica falha', badge: 'warn' },
          { label: 'Técnica', value: '90° · palpar marcos · rotação de sítios', badge: 'ok' },
        ],
        footer_rule: 'Palpar ilíaco + trocanter antes da punção glútea',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO IM',
        items: [
          {
            label: 'Letra A — deltoide',
            detail: 'Absorção boa, mas volume máximo pequeno.',
            correct: 'Enunciado pede maior volume — deltoide não fecha.',
          },
          {
            label: 'Letra D — vasto lateral',
            detail: 'Sítio válido em crianças, mas questão especifica adulto.',
            correct: 'Vasto é opção pediátrica; adulto → ventroglútea.',
          },
          {
            label: 'Letra C — bíceps braquial',
            detail: 'Músculo superficial do braço — não sítio IM clássico.',
            correct: 'IM usa deltoide (braço), não bíceps.',
          },
          {
            label: 'Escolher dorsoglútea pelo volume',
            detail: 'Volume seduz, mas risco de nervo ciático sem marcos precisos.',
            correct: 'Ventroglútea equilibra volume e segurança neurológica.',
          },
        ],
        footer_rule: 'Segurança anatômica + volume → B',
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
    console.log(`[handcraft:vias-g11] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g11] total=${ok}`);
}

main();
