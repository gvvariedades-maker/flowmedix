#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — seguranca-do-paciente-g02 (11 slugs — prevenção de quedas).
 * Uso: npx tsx scripts/handcraft-seguranca-do-paciente-g02.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Segurança do Paciente';
const BRANCH = 'sp_prevencao_quedas';
const REVIEWED = '2026-06-30';
const MS_SOURCE = {
  id: 'ms-pnsp-quedas',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo de Prevenção de Quedas — PNSP',
  year: 2023,
  covers: ['avaliação de risco', 'escala Morse', 'ambiente seguro', 'Meta 6'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'conceito' | 'vf' | 'protocolo' | 'certo_errado';
  slides: unknown[];
};

function metaBase(q: Q, family: string, guideline: string, covers?: string[]) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    content_standard: 'golden-v1',
    family,
    pedagogical_branch: BRANCH,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
    },
    sources: [{ ...MS_SOURCE, covers: covers ?? MS_SOURCE.covers }],
  };
}

const SPECS: Record<string, Pack> = {
  'avancasp-enfermagem-processo-de-enfermagem-1780002714111-6': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção no leito',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Calçado', detail: 'Antiderrapante ao deambular — reduz escorregão.', icon: 'Footprints' },
          { label: 'Grades', detail: 'Elevadas quando indicadas — barreira contra queda do leito.', icon: 'Shield' },
          { label: 'Leito', detail: 'Posição baixa e freios travados — não manter sempre elevado.', icon: 'Bed' },
          { label: 'Mobilidade', detail: 'Deambulação orientada — não suspender nem restringir todos.', icon: 'Activity' },
        ],
        footer_rule: 'Gabarito B — calçado + grades quando indicadas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Medidas no leito',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PREVENÇÃO DE QUEDAS',
        rows: [
          { label: 'Calçados', value: 'Antiderrapantes', badge: 'hot' },
          { label: 'Grades', value: 'Elevadas se indicado', badge: 'ok' },
          { label: 'Iluminação', value: 'Adequada — não apagar', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra B', badge: 'hot' },
        ],
        footer_rule: 'Pressa e restrição total de movimento não previnem queda',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Comando: medida importante para prevenção de quedas hospitalares.',
          'A: leito sempre elevado → eliminar (altura baixa é mais segura).',
          'B: calçado antiderrapante + grades → manter.',
          'C/D/E: suspender deambulação, apagar luz ou restringir todos → eliminar.',
          'Marcar letra B.',
        ],
        footer_rule: 'Equilíbrio entre mobilidade segura e barreiras no leito',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — QUEDAS NO LEITO',
        items: [
          {
            label: 'Letra A — leito sempre elevado',
            detail: 'Altura máxima facilita queda ao transferir.',
            correct: 'Manter leito na posição mais baixa compatível com o cuidado.',
          },
          {
            label: 'Letra C — suspender deambulação',
            detail: 'Imobilização geral aumenta fraqueza e risco.',
            correct: 'Deambulação supervisionada quando avaliação permitir.',
          },
          {
            label: 'Letra D — evitar iluminação',
            detail: 'Ambiente escuro favorece tropeço.',
            correct: 'Iluminação adequada no quarto e corredores.',
          },
          {
            label: 'Letra E — restringir movimentação',
            detail: 'Restrição universal não é política de prevenção.',
            correct: 'Medidas individualizadas conforme escala de risco.',
          },
        ],
        footer_rule: 'Prevenção ≠ imobilizar todo internado',
      },
    ],
  },

  'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-6': {
    family: 'vf',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Protocolo de quedas',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'I — grades universais', detail: 'Falsa — grades conforme avaliação individual.', icon: 'XCircle' },
          { label: 'II — avaliação de risco', detail: 'Verdadeira — admissão + reavaliação clínica.', icon: 'CheckCircle' },
          { label: 'III — contenção', detail: 'Verdadeira — restrição só prescrita e monitorada.', icon: 'CheckCircle' },
          { label: 'IV — orientação', detail: 'Verdadeira — paciente e família sobre risco.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Gabarito B — II, III e IV corretas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgamento I–IV',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: '4 ITENS',
        rows: [
          { label: 'I', value: 'F — grades não são universais', badge: 'warn' },
          { label: 'II', value: 'V — avaliar na admissão', badge: 'ok' },
          { label: 'III', value: 'V — contenção com protocolo', badge: 'ok' },
          { label: 'IV', value: 'V — educar paciente/família', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra B', badge: 'hot' },
        ],
        footer_rule: 'I é pegadinha: medida universal de grades não existe',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Afirmativa I: grades em todos os leitos → F.',
          'Afirmativa II: avaliação na admissão e reavaliação → V.',
          'Afirmativa III: restrição física com prescrição → V.',
          'Afirmativa IV: orientar paciente e família → V.',
          'Corretas: II, III e IV — letra B.',
        ],
        footer_rule: 'Prevenção de quedas é individualizada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — I–IV QUEDAS',
        items: [
          {
            label: 'Letra A — só I e II',
            detail: 'Aceita I (grades universais).',
            correct: 'I é falsa — grades dependem do risco individual.',
          },
          {
            label: 'Letra C — I, III e IV',
            detail: 'Inclui I incorreta.',
            correct: 'Sem I — sobram II, III e IV.',
          },
          {
            label: 'Letra D — todas corretas',
            detail: 'Valida grades para todos os leitos.',
            correct: 'I invalida a opção “todas”.',
          },
        ],
        footer_rule: 'Contenção é exceção ética — não rotina de prevenção',
      },
    ],
  },

  'facet-enfermagem-seguranca-do-paciente-1777102821787-6': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alto risco de queda',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Idoso', detail: 'População prioritária em unidades com geriatria.', icon: 'Users' },
          { label: 'Sinalização', detail: 'Identificação visual no leito do paciente de alto risco.', icon: 'AlertTriangle' },
          { label: 'Ambiente', detail: 'Iluminação, leito baixo, campainha ao alcance.', icon: 'Lightbulb' },
          { label: 'Gabarito', detail: 'Letra C — sinalização de risco.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Mobilidade reduzida exige conjunto de medidas — não só um item',
      },
      {
        type: 'golden_rule',
        slide_title: 'Estratégias eficazes',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'SINALIZAR ALTO RISCO',
        rows: [
          { label: 'Pulseira/sinal', value: 'Alto risco de queda visível', badge: 'hot' },
          { label: 'Leito', value: 'Baixo + grades se indicado', badge: 'ok' },
          { label: 'Calçado', value: 'Antiderrapante', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra C', badge: 'hot' },
        ],
        footer_rule: 'Autonomia não dispensa grades nem campainha',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Contexto: idosos e baixa mobilidade — prevenção de quedas.',
          'A: leitos altos para todos → eliminar.',
          'B: camas sem grades → eliminar.',
          'C: sinalização de alto risco → manter.',
          'D/E: sem campainha ou pouca luz → eliminar.',
          'Marcar letra C.',
        ],
        footer_rule: 'Sinalização comunica risco a toda a equipe',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — ESTRATÉGIAS',
        items: [
          {
            label: 'Letra A — leitos altos',
            detail: 'Facilita queda na transferência.',
            correct: 'Altura do leito individualizada — preferir posição baixa.',
          },
          {
            label: 'Letra B — sem grades',
            detail: 'Remove barreira física no leito.',
            correct: 'Grades elevadas quando avaliação indicar.',
          },
          {
            label: 'Letra D — sem campainha',
            detail: 'Paciente não chama ajuda para levantar.',
            correct: 'Campainha e objetos pessoais ao alcance.',
          },
          {
            label: 'Letra E — pouca iluminação',
            detail: 'Escuridão aumenta tropeço.',
            correct: 'Iluminação adequada 24h conforme necessidade.',
          },
        ],
        footer_rule: 'Banca testa autonomia vs segurança',
      },
    ],
  },

  'fadesp-enfermagem-seguranca-do-paciente-1777102821787-0': {
    family: 'protocolo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alto risco — MS 2023',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Maca', detail: 'Paciente em maca aguardando exame/transferência = alto risco.', icon: 'AlertTriangle' },
          { label: 'MS 2023', detail: 'Protocolo Ministério da Saúde — avaliação de risco do paciente.', icon: 'ClipboardList' },
          { label: 'Multiprofissional', detail: 'Cuidado em ambiente seguro + educação de paciente e família.', icon: 'Users' },
          { label: 'Gabarito', detail: 'Letra D — acomodado em maca.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Maca em trânsito = vigilância contínua',
      },
      {
        type: 'golden_rule',
        slide_title: 'Classificação MS',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'ALTO RISCO',
        rows: [
          { label: 'Maca', value: 'Sempre alto risco (com ou sem fatores)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Independente', value: '2+ fatores — outra categoria', badge: 'ok' },
          { label: 'Dependente', value: 'Ajuda + fator de risco', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra D', badge: 'hot' },
        ],
        footer_rule: 'Literal do protocolo MS 2023 — decore a definição de maca',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Pergunta: quem é alto risco de queda pelo protocolo MS?',
          'D: em maca aguardando exame/transferência → alto risco.',
          'A: acamado dependente — não é a definição da letra D.',
          'B: independente com 2 fatores — outra classificação.',
          'C: dependente com fator — intermediário.',
          'Marcar letra D.',
        ],
        footer_rule: 'Transporte e espera em maca = ponto crítico de queda',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — CLASSIFICAÇÃO',
        items: [
          {
            label: 'Letra A — acamado dependente',
            detail: 'Confunde imobilidade no leito com maca em trânsito.',
            correct: 'Alto risco em maca vale mesmo aguardando exame curto.',
          },
          {
            label: 'Letra B — independente + 2 fatores',
            detail: 'Categoria de risco moderado/alto por fatores.',
            correct: 'Não é a definição literal cobrada (maca).',
          },
          {
            label: 'Letra C — dependente + fator',
            detail: 'Exige fator adicional na alternativa.',
            correct: 'Maca classifica alto risco com ou sem outros fatores.',
          },
        ],
        footer_rule: 'Prova cobra texto do protocolo — não só senso clínico',
      },
    ],
  },

  'funcern-enfermagem-seguranca-do-paciente-1777102678563-5': {
    family: 'protocolo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PNSP — protocolos básicos',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'PNSP 2013', detail: 'Programa Nacional de Segurança do Paciente.', icon: 'Shield' },
          { label: 'Protocolo ID', detail: 'Identificação do paciente — meta 1.', icon: 'UserCheck' },
          { label: 'Protocolo quedas', detail: 'Prevenção de quedas — meta 6.', icon: 'Footprints' },
          { label: 'Gabarito', detail: 'Letra A — ID + quedas.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Dois protocolos básicos mais cobrados em prova',
      },
      {
        type: 'golden_rule',
        slide_title: 'Par de protocolos',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PNSP',
        rows: [
          { label: 'Par A', value: 'Identificação + prevenção de quedas', badge: 'hot' },
          { label: 'TEV', value: 'Não é protocolo básico PNSP nesta prova', badge: 'warn' },
          { label: 'Violência', value: 'Fora do par cobrado', badge: 'warn' },
          { label: 'Gabarito', value: 'Letra A', badge: 'hot' },
        ],
        footer_rule: 'TEV é perioperatório — não confundir com pacote básico PNSP',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'PNSP 2013 divulgou protocolos básicos de consenso.',
          'A: identificação + prevenção de quedas → manter.',
          'B/C/D: incluem tromboembolismo ou violência → eliminar.',
          'Marcar letra A.',
        ],
        footer_rule: 'Memorize o duo identificação + quedas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — PNSP',
        items: [
          {
            label: 'Letra B — ID + TEV',
            detail: 'TEV não integra o par básico desta questão.',
            correct: 'Segundo protocolo = prevenção de quedas.',
          },
          {
            label: 'Letra C — quedas + TEV',
            detail: 'Omite identificação do paciente.',
            correct: 'Identificação é protocolo básico paralelo a quedas.',
          },
          {
            label: 'Letra D — TEV + violência',
            detail: 'Nenhum dos dois é o par oficial cobrado.',
            correct: 'Par A: identificação e prevenção de quedas.',
          },
        ],
        footer_rule: 'Banca mistura temas perioperatórios com NSP',
      },
    ],
  },

  'funcern-enfermagem-seguranca-do-paciente-1777102678563-6': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escalas — não confundir',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Envelhecimento', detail: 'Diminuição do equilíbrio e alterações cognitivas no idoso.', icon: 'Users' },
          { label: 'Consequências', detail: 'TCE, fraturas ósseas e hematomas após queda.', icon: 'AlertTriangle' },
          { label: 'Morse', detail: 'Escala de avaliação do risco de quedas em serviços de saúde.', icon: 'TrendingDown' },
          { label: 'Barthel/Braden/GCS', detail: 'Outras escalas — não medem risco de queda.', icon: 'XCircle' },
        ],
        footer_rule: 'Gabarito D — escala de Morse',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência rápida',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'ESCALAS',
        rows: [
          { label: 'Morse', value: 'Risco de queda', badge: 'hot', emphasis: 'highlight' },
          { label: 'Barthel', value: 'Autocuidado', badge: 'ok' },
          { label: 'Braden', value: 'LPP', badge: 'ok' },
          { label: 'Glasgow', value: 'Consciência', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra D', badge: 'hot' },
        ],
        footer_rule: 'Avaliar na admissão e reavaliar se estado clínico mudar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Enunciado: idoso — envelhecimento reduz equilíbrio e pode alterar cognição.',
          'Quedas causam traumatismo cranioencefálico, fraturas e hematomas.',
          'Avaliação do risco de quedas com escala de Morse.',
          'Eliminar Barthel, Braden e Glasgow.',
          'Marcar letra D.',
        ],
        footer_rule: 'Queda → Morse; LPP → Braden',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — ESCALAS',
        items: [
          {
            label: 'Letra A — Barthel',
            detail: 'Mede independência nas AVD.',
            correct: 'Não quantifica risco de queda.',
          },
          {
            label: 'Letra B — Braden',
            detail: 'Escore de lesão por pressão.',
            correct: 'Tema LPP — não queda.',
          },
          {
            label: 'Letra C — Glasgow',
            detail: 'Avalia abertura ocular e resposta verbal/motora.',
            correct: 'Consciência ≠ risco de queda isolado.',
          },
        ],
        footer_rule: 'Decore associação escala × finalidade',
      },
    ],
  },

  'fundep-enfermagem-seguranca-do-paciente-1777102821787-1': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Medidas de NSP',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Identificação', detail: 'Meta 1 — assegurar cuidado ao paciente certo.', icon: 'UserCheck' },
          { label: 'Higiene das mãos', detail: 'Sempre — não só com sujidade visível.', icon: 'Hand' },
          { label: 'Comunicação', detail: 'Efetiva entre profissionais — não mínima.', icon: 'MessageSquare' },
          { label: 'Quedas', detail: 'Orientação universal — não só se já caiu.', icon: 'ShieldAlert' },
        ],
        footer_rule: 'Gabarito A — definição correta de identificação',
      },
      {
        type: 'golden_rule',
        slide_title: 'Qual medida vale?',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'META 1',
        rows: [
          { label: 'Identificação', value: 'Procedimento destinado ao paciente certo', badge: 'hot' },
          { label: 'Higiene', value: 'Momento certo — não só sujeira', badge: 'warn' },
          { label: 'Quedas', value: 'Avaliar todos — não só histórico', badge: 'warn' },
          { label: 'Gabarito', value: 'Letra A', badge: 'hot' },
        ],
        footer_rule: 'B, C e D são medidas incompletas ou erradas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Pedido: alternativa com medida de segurança do paciente.',
          'A: identificação correta — definição completa.',
          'B: higiene só com matéria orgânica visível → eliminar.',
          'C: comunicação mínima → eliminar.',
          'D: orientação de queda só com histórico → eliminar.',
          'Marcar letra A.',
        ],
        footer_rule: 'Demais alternativas limitam demais a conduta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — MEDIDAS',
        items: [
          {
            label: 'Letra B — higiene condicional',
            detail: 'Restringe higienização à sujidade visível.',
            correct: 'Higiene das mãos nos 5 momentos — independente de sujeira aparente.',
          },
          {
            label: 'Letra C — comunicação mínima',
            detail: 'Silêncio prejudica passagem de informação.',
            correct: 'Meta 2 exige comunicação efetiva entre profissionais.',
          },
          {
            label: 'Letra D — queda só com histórico',
            detail: 'Condiciona orientação a queda prévia.',
            correct: 'Avaliar risco de queda na admissão de todos os internados.',
          },
        ],
        footer_rule: 'Questão testa definição conceitual — A é a mais rigorosa',
      },
    ],
  },

  'instituto-verbena-enfermagem-seguranca-do-paciente-1777102918981-4': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção no idoso',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Tapetes soltos', detail: 'Risco de escorregão — evitar em escadas.', icon: 'AlertTriangle' },
          { label: 'Exercício', detail: 'Fortalece e mantém equilíbrio — não evitar.', icon: 'Dumbbell' },
          { label: 'Tecnologias', detail: 'Andador/bengala auxiliam mobilidade segura.', icon: 'Accessibility' },
          { label: 'Calçado', detail: 'Fechado e antiderrapante — não descalço.', icon: 'Footprints' },
        ],
        footer_rule: 'Gabarito C — evitar tapetes',
      },
      {
        type: 'golden_rule',
        slide_title: 'Domicílio seguro',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'EVITAR TAPETES',
        rows: [
          { label: 'Tapetes', value: 'Retirar de escadas e corredores', badge: 'hot' },
          { label: 'Exercício', value: 'Manter regularmente', badge: 'ok' },
          { label: 'Dispositivos', value: 'Usar quando prescrito', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra C', badge: 'hot' },
        ],
        footer_rule: 'Queda no idoso → fratura, TCE e mortalidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Comando: o que o idoso deve EVITAR para prevenir quedas?',
          'C: tapetes em escadas/degraus → manter (evitar uso).',
          'A: exercício → eliminar (é recomendado).',
          'B: tecnologias assistivas → eliminar.',
          'D: calçado adequado → eliminar.',
          'Marcar letra C.',
        ],
        footer_rule: 'Ambiente domiciliar = principal foco de educação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — IDOSO',
        items: [
          {
            label: 'Letra A — evitar exercício',
            detail: 'Sedentarismo piora força e equilíbrio.',
            correct: 'Atividade física regular reduz quedas.',
          },
          {
            label: 'Letra B — evitar andador',
            detail: 'Dispositivos aumentam segurança na marcha.',
            correct: 'Orientar uso correto de bengala/andador.',
          },
          {
            label: 'Letra D — evitar calçado fechado',
            detail: 'Descalço ou solado liso aumenta risco.',
            correct: 'Calçado fechado e antiderrapante protege.',
          },
        ],
        footer_rule: '“Evitar” na pergunta aponta o fator de risco ambiental',
      },
    ],
  },

  'objetiva-concursos-enfermagem-seguranca-do-paciente-1777102802022-9': {
    family: 'certo_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Protocolo — C/E',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: '1ª afirmativa', detail: 'Avaliação na admissão com escala — CERTA.', icon: 'CheckCircle' },
          { label: '2ª afirmativa', detail: 'Osteomioarticulares como intrínsecos funcionais — ERRADA.', icon: 'XCircle' },
          { label: '3ª afirmativa', detail: 'Equilíbrio como intrínseco funcional — ERRADA na classificação da banca.', icon: 'XCircle' },
        ],
        footer_rule: 'Gabarito letra C — C, E, E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fatores de risco',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'C – E – E',
        rows: [
          { label: 'Admissão + escala', value: 'Certa', badge: 'ok' },
          { label: 'Osteomioarticular', value: 'Errada como “funcional”', badge: 'warn' },
          { label: 'Equilíbrio', value: 'Errada nesta classificação', badge: 'warn' },
          { label: 'Gabarito', value: 'Letra C', badge: 'hot' },
        ],
        footer_rule: 'Separe fatores estruturais × funcionais conforme protocolo da prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          '1ª: avaliar risco na admissão com escala → C.',
          '2ª: osteomioarticulares como intrínsecos funcionais → E.',
          '3ª: distúrbios do equilíbrio como intrínsecos funcionais → E.',
          'Sequência C – E – E.',
          'Marcar letra C.',
        ],
        footer_rule: 'Indicador de queda reflete qualidade assistencial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — C/E',
        items: [
          {
            label: 'Letra A — C-C-E',
            detail: 'Aceita 2ª afirmativa.',
            correct: 'Doenças osteomioarticulares não entram como intrínsecos funcionais neste protocolo.',
          },
          {
            label: 'Letra B — E-E-C',
            detail: 'Nega avaliação na admissão.',
            correct: '1ª afirmativa é certa — escala na admissão.',
          },
          {
            label: 'Letra D — E-C-C',
            detail: 'Nega admissão e aceita as duas últimas.',
            correct: 'Só a primeira é certa — C, E, E.',
          },
        ],
        footer_rule: 'Classificação de fatores: decorar tabela do protocolo MS',
      },
    ],
  },

  'univali-enfermagem-seguranca-do-paciente-1777102821787-2': {
    family: 'protocolo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Transporte seguro',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Histórico de quedas', detail: 'Paciente de alto risco — reforçar protocolo.', icon: 'AlertTriangle' },
          { label: 'Protocolo institucional', detail: 'Equipamentos + ajuda de outro profissional.', icon: 'ClipboardCheck' },
          { label: 'Pressa', detail: 'Não justifica transporte solo ou sem cinto.', icon: 'Clock' },
          { label: 'Gabarito', detail: 'Letra A — protocolo + equipamento + ajuda.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Transporte intra-hospitalar é ponto crítico de queda',
      },
      {
        type: 'golden_rule',
        slide_title: 'Conduta de Ana',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'TRANSPORTE',
        rows: [
          { label: 'Protocolo', value: 'Seguir instituição', badge: 'hot' },
          { label: 'Equipamento', value: 'Cadeira/macas com segurança', badge: 'ok' },
          { label: 'Equipe', value: 'Segundo profissional se necessário', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra A', badge: 'hot' },
        ],
        footer_rule: 'Independência do paciente não dispensa supervisão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Caso: paciente com histórico de quedas — transporte intersetorial.',
          'A: protocolo + equipamento + ajuda → manter.',
          'B: sozinha com agilidade → eliminar.',
          'C: cadeira sem cinto — trajeto curto → eliminar.',
          'D: paciente sozinho → eliminar.',
          'Marcar letra A.',
        ],
        footer_rule: 'PSP do SUS exige cultura de segurança no deslocamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — TRANSPORTE',
        items: [
          {
            label: 'Letra B — agilidade solo',
            detail: 'Um profissional apressado aumenta risco.',
            correct: 'Solicitar ajuda para transferência de alto risco.',
          },
          {
            label: 'Letra C — sem cinto',
            detail: 'Trajeto curto não dispensa fixação.',
            correct: 'Cinto na cadeira de rodas durante todo transporte.',
          },
          {
            label: 'Letra D — deambulação solo',
            detail: 'Histórico de quedas contraindica deixar sem supervisão.',
            correct: 'Acompanhar conforme protocolo institucional.',
          },
        ],
        footer_rule: 'Cenário clínico cobra conduta — não atalho',
      },
    ],
  },

  'vunesp-enfermagem-seguranca-do-paciente-1777102821787-7': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulseira de queda',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Sinalização', detail: 'Pulseira amarela/laranja = alto risco de queda.', icon: 'BadgeAlert' },
          { label: 'Grades', detail: 'Superiores elevadas com paciente no leito.', icon: 'Shield' },
          { label: 'Leito', detail: 'Posição baixa + freios travados — não elevado destravado.', icon: 'Bed' },
          { label: 'Calçado', detail: 'Calçado antiderrapante — nunca descalço ao mobilizar.', icon: 'Footprints' },
        ],
        footer_rule: 'Gabarito B — grades elevadas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Alto risco — pulseira',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PULSEIRA QUEDA',
        rows: [
          { label: 'Grades', value: 'Elevadas no leito', badge: 'hot', emphasis: 'highlight' },
          { label: 'Leito', value: 'Baixo + freios travados', badge: 'ok' },
          { label: 'Iluminação', value: 'Adequada — não luzes 24h todas acesas', badge: 'warn' },
          { label: 'Gabarito', value: 'Letra B', badge: 'hot' },
        ],
        footer_rule: 'Âncora do lote — padrão VUNESP de quedas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Paciente com pulseira de risco de queda admitido da urgência.',
          'B: grades superiores elevadas no leito → manter.',
          'A: todos os banhos no leito — não é regra universal.',
          'C: todas as luzes sempre acesas → eliminar.',
          'D: descalço ao mobilizar → eliminar.',
          'E: cama alta e pés destravados → eliminar.',
          'Marcar letra B.',
        ],
        footer_rule: 'Pulseira aciona pacote de intervenções no leito',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — PULSEIRA',
        items: [
          {
            label: 'Letra A — banho sempre no leito',
            detail: 'Não é medida obrigatória de prevenção.',
            correct: 'Higiene conforme condição clínica e mobilidade.',
          },
          {
            label: 'Letra C — luzes sempre acesas',
            detail: 'Excesso de luz prejudica sono — iluminação adequada basta.',
            correct: 'Luz suficiente para deslocamento seguro.',
          },
          {
            label: 'Letra D — descalço',
            detail: 'Aumenta escorregão.',
            correct: 'Calçado antiderrapante ao sair do leito.',
          },
          {
            label: 'Letra E — cama alta destravada',
            detail: 'Combina dois erros (altura + freio).',
            correct: 'Leito baixo com rodízios travados.',
          },
        ],
        footer_rule: 'VUNESP cobra grades — memorize para recorrência',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir('seguranca-do-paciente-g02');
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack.family, 'MS PNSP — Protocolo de Prevenção de Quedas'),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, JSON.stringify(out, null, 2) + '\n', 'utf8');
    ok++;
    console.log(`[handcraft:g02] OK ${slug}`);
  }
  console.log(`[handcraft:g02] total=${ok}`);
}

main();
