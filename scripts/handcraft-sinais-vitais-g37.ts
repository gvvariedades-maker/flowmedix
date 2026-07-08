#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g37 (8 slugs P1 vitals_fr_faixas batch 1).
 * Novo cluster após vitals_vf_faixas (g36): FR e padrão respiratório (16 slugs — g37=8, g38=8).
 *
 *   npm run handcraft:sinais-vitais-g37
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g37';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBP',
  title: 'Faixas de sinais vitais — repouso (adulto e pediátrico)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FR adulto 12–20 irpm',
    'taquipneia >20 irpm',
    'bradipneia <12 irpm',
    'FR lactente SBP 30–60 irpm',
    'oligopneia · taquipneia · bradipneia · dispneia',
    'estertor · padrão respiratório',
    'Cheyne-Stokes · anóxia · apneia',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
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
    pedagogical_branch: 'vitals_fr_faixas',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-7': {
    family: 'protocolo',
    guideline:
      'MS/SBP — FR lactente (<1 ano): 30 a 60 irpm · adulto MS 12–20 irpm · taquipneia >20 bpm · bradipneia <12',
    exam_vs_current: 'Prova cita SBP lactente 30–60 irpm — MS caderneta ~30–53; gabarito segue SBP',
    roi_error: 'faixa_pediatrica_adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FR lactente — faixa SBP',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Segundo a SBP, qual faixa normal de FR para lactentes menores de 1 ano?',
            icon: 'Target',
          },
          {
            label: 'Lactente (<1 ano)',
            detail:
              'Faixa etária com FR mais alta que o adulto — não aplicar 12–20 irpm isolado.',
            icon: 'Baby',
          },
          {
            label: 'Referência SBP',
            detail: '30 a 60 irpm — intervalo cobrado pela banca Adm&Tec.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — faixa adulta',
            detail: 'Alternativas D (18–30) e C (22–34) aproximam escolar/adulto.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — pré-escolar',
            detail: 'Alternativa B (24–40) não corresponde ao lactente <1 ano.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Lactente SBP: 30–60 irpm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR normal do lactente (<1 ano) segundo SBP.',
          'Contexto: lactente ≠ adulto — faixa respiratória mais ampla e alta.',
          'Testar A — 30 a 60 irpm: faixa SBP para <1 ano → candidata.',
          'Testar B — 24 a 40 irpm: aproxima pré-escolar → eliminar.',
          'Testar C — 22 a 34 irpm: ainda baixa para lactente → eliminar.',
          'Testar D — 18 a 30 irpm: aproxima adulto/escolar → eliminar.',
          'Confirmar: só A fecha a referência SBP lactente.',
          'Marcar A.',
        ],
        footer_rule: 'Lactente <1 ano → 30–60 irpm → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR por idade',
        meta: slideMeta,
        content: 'FR — LACTENTE × ADULTO',
        rows: [
          { label: 'FR lactente (<1 ano)', value: '30 a 60 irpm (SBP)', sv_kind: 'fr', badge: 'hot' },
          { label: 'FR adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia adulto', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'warn' },
          { label: 'Bradipneia adulto', value: 'FR < 12 irpm', sv_kind: 'fr', badge: 'warn' },
          { label: 'MS lactente', value: '~30 a 53 irpm (caderneta)', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Idade define o normal — leia o enunciado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FR LACTENTE',
        items: [
          {
            label: 'Letra B — 24 a 40 irpm',
            detail: 'Faixa intermediária entre escolar e lactente.',
            correct:
              '24–40 irpm não corresponde à referência SBP para lactente <1 ano — gabarito é 30–60 irpm.',
          },
          {
            label: 'Letra C — 22 a 34 irpm',
            detail: 'Intervalo estreito abaixo do lactente típico.',
            correct:
              '22–34 irpm subestima o teto respiratório do lactente — SBP orienta até 60 irpm.',
          },
          {
            label: 'Letra D — 18 a 30 irpm',
            detail: 'Aproxima faixa de escolar/adulto.',
            correct:
              '18–30 irpm é inadequado para <1 ano — lactente respira mais rápido que adulto em repouso.',
          },
          {
            label: 'Aplicar 12–20 irpm',
            detail: 'Aluno transcreve faixa adulta ao lactente.',
            correct:
              'FR adulta 12–20 irpm não se aplica ao lactente — SBP cobra 30–60 irpm para <1 ano.',
          },
        ],
        footer_rule: 'Só A fecha SBP lactente',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343801786-3': {
    family: 'conceito',
    guideline:
      'MS/Potter — oligopneia: FR lenta e superficial (volume reduzido) · taquipneia: FR rápida · bradipneia: FR lenta',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Padrão respiratório — oligopneia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'FR lenta e superficial — qual terminologia classifica esse padrão?',
            icon: 'Target',
          },
          {
            label: 'Lenta + superficial',
            detail:
              'Frequência baixa associada a volume reduzido — não é só bradipneia numérica.',
            icon: 'Wind',
          },
          {
            label: 'Oligopneia',
            detail:
              'Oligo- (pouco) + -pneia: respiração diminuída em frequência e amplitude.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — taquipneia',
            detail: 'Letra E: FR rápida — oposto de lenta.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — polipneia/hiperpneia',
            detail: 'Letras A e B: aumento de frequência ou volume — não lenta.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Lenta + superficial = oligopneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar FR lenta e superficial.',
          'Decodificar: lenta = baixa frequência · superficial = baixo volume.',
          'Testar A — polipneia: FR muito aumentada → eliminar.',
          'Testar B — hiperpneia: volume aumentado → eliminar.',
          'Testar D — espanopneia: termo pouco usado; não descreve lenta+superficial → eliminar.',
          'Testar E — taquipneia: FR rápida → eliminar.',
          'Testar C — oligopneia: pouca respiração em freq. e amplitude → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Lenta + superficial → oligopneia → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia FR',
        meta: slideMeta,
        content: 'PADRÃO RESPIRATÓRIO — DECORE',
        rows: [
          { label: 'Oligopneia', value: 'FR lenta e superficial', sv_kind: 'fr', badge: 'hot' },
          { label: 'Taquipneia', value: 'FR > 20 irpm (adulto)', sv_kind: 'fr', badge: 'ok' },
          { label: 'Bradipneia', value: 'FR < 12 irpm (adulto)', sv_kind: 'fr', badge: 'ok' },
          { label: 'Eupneia', value: 'FR 12–20 irpm · ritmo regular', sv_kind: 'fr', badge: 'ok' },
          { label: 'Dispneia', value: 'Dificuldade respiratória subjetiva', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Lenta + superficial ≠ só bradipneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OLIGOPNEIA',
        items: [
          {
            label: 'Letra A — polipneia',
            detail: 'Respiração muito frequente.',
            correct:
              'Polipneia indica aumento acentuado da FR — oposto de lenta e superficial.',
          },
          {
            label: 'Letra B — hiperpneia',
            detail: 'Aumento do volume respiratório.',
            correct:
              'Hiperpneia descreve volume elevado — o caso traz respiração superficial (volume baixo).',
          },
          {
            label: 'Letra D — espanopneia',
            detail: 'Termo atípico na nomenclatura de prova.',
            correct:
              'Espanopneia não classifica o par lenta+superficial cobrado — oligopneia é o termo técnico.',
          },
          {
            label: 'Letra E — taquipneia',
            detail: 'Frequência respiratória acelerada.',
            correct:
              'Taquipneia é FR rápida (>20 irpm no adulto) — enunciado descreve FR lenta.',
          },
        ],
        footer_rule: 'Só oligopneia une lenta + superficial',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-3': {
    family: 'conceito',
    guideline:
      'MS — FR adulto 12–20 irpm eupneia · taquipneia >20 · estertor: ruído adventício rouco/úmido na respiração',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois momentos — FR e ruído',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Mulher 47 anos: FR 16 mpm na poltrona; após 1 h respiração acelerada e ruidosa — duas terminologias.',
            icon: 'Target',
          },
          {
            label: 'Momento 1 — FR 16',
            detail: '16 irpm dentro de 12–20 — eupneia (frequência normal).',
            icon: 'Wind',
          },
          {
            label: 'Momento 2 — acelerada',
            detail: 'FR acima de 20 após 1 h — taquipneia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Momento 2 — ruidosa',
            detail: 'Respiração rouca e barulhenta — estertorosa (ruído adventício).',
            icon: 'Volume2',
          },
          {
            label: 'Pegadinha — apneia',
            detail: 'Não há parada respiratória no caso.',
            icon: 'Ban',
          },
        ],
        footer_rule: '1º eupneia · 2º taquipneia + estertor',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terminologias corretas para os dois momentos do caso.',
          'Momento 1: FR 16 mpm → entre 12–20 → eupneia (não taquipneia).',
          'Momento 2: respiração acelerada → FR elevada → taquipneia.',
          'Momento 2: barulho rouco → estertor (ruído adventício).',
          'Testar B — dispneica e taquipneica: mistura dispneia subjetiva no 1º momento → eliminar.',
          'Testar C/D — apneica: sem parada respiratória → eliminar.',
          'Testar E — dispneica e estertorosa: omite taquipneia do 2º momento → eliminar.',
          'Testar A — taquipneica e estertorosa: descreve aceleração + ruído → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Taquipneica + estertorosa → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR e ruídos',
        meta: slideMeta,
        content: 'FREQUÊNCIA × PADRÃO RESPIRATÓRIO',
        rows: [
          { label: 'FR adulto normal', value: '12 a 20 irpm — eupneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Estertor', value: 'Ruído adventício na expiração/inspiração', sv_kind: 'fr', badge: 'hot' },
          { label: 'Dispneia', value: 'Sensação subjetiva de falta de ar', sv_kind: 'fr', badge: 'warn' },
          { label: 'Apneia', value: 'Ausência de movimentos respiratórios', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Conte a FR antes de rotular taqui/bradi',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DOIS MOMENTOS',
        items: [
          {
            label: 'Letra B — dispneica e taquipneica',
            detail: 'Dispneia subjetiva no 1º momento com taquipneia.',
            correct:
              'FR 16 mpm é eupneia — não há taquipneia no primeiro momento; dispneia não substitui a classificação numérica.',
          },
          {
            label: 'Letra C — apneica e dispneica',
            detail: 'Parada respiratória associada a dispneia.',
            correct:
              'Paciente mantém respiração acelerada com ruído — não há apneia no quadro descrito.',
          },
          {
            label: 'Letra D — estertorosa e apneica',
            detail: 'Estertor com apneia.',
            correct:
              'Segundo momento traz taquipneia (acelerada), não apneia — estertor vem junto da taquipneia.',
          },
          {
            label: 'Letra E — dispneica e estertorosa',
            detail: 'Dispneia com estertor, sem taquipneia.',
            correct:
              'Enunciado explicita respiração acelerada — exige taquipneia, não apenas dispneia subjetiva.',
          },
        ],
        footer_rule: 'Aceleração + ruído → taquipneica + estertorosa',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343897104-5': {
    family: 'conceito',
    guideline: 'MS — taquipneia: FR rápida e superficial (>20 irpm no adulto) · bradipneia <12 · oligopneia lenta+superficial',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Taquipneia — definição',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Qual classificação corresponde a “FR rápida e superficial”?',
            icon: 'Target',
          },
          {
            label: 'Rápida + superficial',
            detail: 'Frequência elevada com amplitude reduzida — taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — bradipneia',
            detail: 'Letra A: FR lenta — oposto de rápida.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — oligopneia',
            detail: 'Letra C: lenta e superficial — não rápida.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — hipopneia',
            detail: 'Letra D: volume baixo sem necessariamente taqui.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Rápida + superficial = taquipneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificação de FR rápida e superficial.',
          'Testar A — bradipneia: FR lenta → eliminar.',
          'Testar B — espanopneia: termo atípico → eliminar.',
          'Testar C — oligopneia: lenta e superficial → eliminar.',
          'Testar D — hipopneia: volume reduzido sem taqui obrigatória → eliminar.',
          'Testar E — taquipneia: FR rápida (e pode ser superficial) → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Rápida + superficial → taquipneia → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação FR',
        meta: slideMeta,
        content: 'TERMINOLOGIA RESPIRATÓRIA',
        rows: [
          { label: 'Taquipneia', value: 'FR rápida — adulto > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Bradipneia', value: 'FR lenta — adulto < 12 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Oligopneia', value: 'FR lenta e superficial', sv_kind: 'fr', badge: 'warn' },
          { label: 'Eupneia', value: 'FR 12–20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Hipopneia', value: 'Volume respiratório diminuído', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Rápida = taqui · lenta = bradi/oligo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TAQUIPNEIA AVANÇASP',
        items: [
          {
            label: 'Letra A — bradipneia',
            detail: 'Frequência respiratória lenta.',
            correct:
              'Bradipneia é FR abaixo do normal (<12 irpm) — enunciado pede FR rápida.',
          },
          {
            label: 'Letra B — espanopneia',
            detail: 'Termo pouco usado em provas de técnico.',
            correct:
              'Espanopneia não é a classificação padrão para FR rápida e superficial — taquipneia fecha o comando.',
          },
          {
            label: 'Letra C — oligopneia',
            detail: 'Respiração lenta e superficial.',
            correct:
              'Oligopneia exige FR lenta — o comando destaca FR rápida.',
          },
          {
            label: 'Letra D — hipopneia',
            detail: 'Diminuição do volume respiratório.',
            correct:
              'Hipopneia foca amplitude baixa sem definir taquipneia — o par cobrado é rápida + superficial = taquipneia.',
          },
        ],
        footer_rule: 'Só taquipneia fecha rápida + superficial',
      },
    ],
  },

  'epl-concursos-enfermagem-verificacao-de-sinais-vitais-1779344182672-0': {
    family: 'protocolo',
    guideline:
      'MS — taquipneia >20 irpm · bradipneia <12 · apneia = ausência de respiração · dispneia = dificuldade subjetiva · ortopneia = dispneia em decúbito',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Definições de FR — EPL',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Sinais vitais hemodinâmicos — controle da frequência respiratória após a cardíaca para o paciente não perceber.',
            icon: 'Target',
          },
          {
            label: 'Técnica de aferição',
            detail:
              'Controle da FR normalmente realizado após a frequência cardíaca — evita alterações voluntárias do padrão respiratório.',
            icon: 'Stethoscope',
          },
          {
            label: 'Assistência de enfermagem',
            detail:
              'Ferramenta básica de manutenção da assistência — indicadores de saúde do paciente.',
            icon: 'Activity',
          },
          {
            label: 'Taquipneia',
            detail: 'FR acima de 20 movimentos respiratórios por minuto — adulto.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — bradipneia invertida',
            detail: 'Letra A: bradipneia acima de 25 — inverte o conceito.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — apneia normal',
            detail: 'Letra E: apneia entre 12–20 — confunde com eupneia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — dispneia numérica',
            detail: 'Letra D: dispneia abaixo de 5 mrm — mistura com bradipneia/apneia.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Taquipneia = FR > 20 irpm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: contar FR após FC para o paciente não perceber e alterar o ritmo.',
          'Comando: definição correta sobre nomenclatura respiratória.',
          'Testar A — bradipneia acima de 25: bradipneia é FR baixa, não alta → eliminar.',
          'Testar B — taquipneia acima de 20 mrm: definição correta → candidata.',
          'Testar C — ortopneia em entubado: ortopneia é dispneia ao deitar, não definição de entubação → eliminar.',
          'Testar D — dispneia abaixo de 5: dispneia é subjetiva; <5 mrm é bradipneia/apneia → eliminar.',
          'Testar E — apneia 12–20: intervalo de eupneia, não apneia → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Taquipneia >20 mrm → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — nomenclatura FR',
        meta: slideMeta,
        content: 'DEFINIÇÕES MS — ADULTO',
        rows: [
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Bradipneia', value: 'FR < 12 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Eupneia', value: 'FR 12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Apneia', value: 'Ausência de movimentos respiratórios', sv_kind: 'fr', badge: 'warn' },
          { label: 'Dispneia', value: 'Dificuldade respiratória (subjetiva)', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Não inverta taqui × bradi × apneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÕES EPL',
        items: [
          {
            label: 'Letra A — bradipneia >25',
            detail: 'Bradipneia como FR acima de 25 mrm.',
            correct:
              'Bradipneia é FR abaixo do normal (<12 irpm) — letra A inverte taquipneia e bradipneia.',
          },
          {
            label: 'Letra C — ortopneia entubado',
            detail: 'Ortopneia como dificuldade do entubado.',
            correct:
              'Ortopneia é dispneia ao deitar (ortostatismo inverso) — não define paciente entubado.',
          },
          {
            label: 'Letra D — dispneia <5',
            detail: 'Dispneia como FR abaixo de 5 mrm.',
            correct:
              'Dispneia é sensação subjetiva de falta de ar — FR <5 mrm aproxima bradipneia ou apneia.',
          },
          {
            label: 'Letra E — apneia 12–20',
            detail: 'Apneia como FR entre 12 e 20 mrm.',
            correct:
              '12–20 irpm é eupneia no adulto — apneia é ausência de respiração, não faixa normal.',
          },
        ],
        footer_rule: 'Só B define taquipneia corretamente',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1779344205200-0': {
    family: 'conceito',
    guideline:
      'MS — FC adulto 60–100 bpm · taquicardia >100 · FR adulto 12–20 irpm · taquipneia >20',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC + FR — classificação combinada',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Adulto com FC acima de 100 bpm e FR acima de 20 mrm — como classificar os dois parâmetros?',
            icon: 'Target',
          },
          {
            label: 'FC do caso',
            detail: 'Valor acima de 100 bpm — taquicardia (taquicárdico).',
            icon: 'HeartPulse',
          },
          {
            label: 'FR do caso',
            detail: 'Valor acima de 20 irpm — taquipneia (taquipneico).',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — normocardia',
            detail: 'Letras B e E: FC acima de 100 não é normocárdica.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — bradipneia',
            detail: 'Letras B e D: FR acima de 20 não é bradipneia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'FC >100 + FR >20 = taqui + taqui',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terminologia para FC e FR elevadas em adulto (caso da prova).',
          'Avaliar FC: acima de 100 bpm → taquicárdico.',
          'Avaliar FR: acima de 20 irpm → taquipneico.',
          'Testar B — normocárdico e bradpneico: contradiz ambos → eliminar.',
          'Testar C — bradicárdico e normopneico: FC alta e FR alta → eliminar.',
          'Testar D — taquicárdico e bradpneico: FR errada → eliminar.',
          'Testar E — normocárdico e normopneico: ambos alterados → eliminar.',
          'Testar A — taquicárdico e taquipneico: combinação coerente → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Taquicárdico + taquipneico → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'FC × FR — ADULTO EM REPOUSO',
        rows: [
          { label: 'FC normal', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR normal', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Caso da prova', value: 'FC >100 + FR >20 → taqui + taqui', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Conte FC e FR antes de rotular',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FGV FC+FR',
        items: [
          {
            label: 'Letra B — normocárdico e bradpneico',
            detail: 'FC e FR normais/bradicárdicas.',
            correct:
              'FC acima de 100 é taquicardia e FR acima de 20 é taquipneia — nenhum parâmetro é normal ou bradicárdico/bradpneico.',
          },
          {
            label: 'Letra C — bradicárdico e normopneico',
            detail: 'FC baixa com FR normal.',
            correct:
              'FC do caso excede 100 (taqui) e FR excede 20 (taqui) — não há bradicardia nem normopneia.',
          },
          {
            label: 'Letra D — taquicárdico e bradpneico',
            detail: 'Taquicardia com bradipneia.',
            correct:
              'FR do caso está acima de 20 irpm — taquipneia, não bradipneia.',
          },
          {
            label: 'Letra E — normocárdico e normopneico',
            detail: 'Ambos os parâmetros normais.',
            correct:
              'FC e FR do caso estão fora das faixas normais — taquicárdico e taquipneico.',
          },
        ],
        footer_rule: 'Ambos elevados → A',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779344111854-2': {
    family: 'vf',
    guideline:
      'MS/Potter — taquipneia: FR elevada (>20) · dispneia: dificuldade subjetiva · apneia: parada respiratória · anóxia: ausência de O₂ · Cheyne-Stokes: ciclos crescente/decrescente com apneia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — terminologia respiratória',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Cinco definições sobre FR e padrões respiratórios — julgar V/F e achar a sequência.',
            icon: 'Target',
          },
          {
            label: 'Item 1 — taquipneia',
            detail:
              '“Respiração dolorosa e difícil” descreve dispneia — taquipneia é FR alta.',
            icon: 'Ban',
          },
          {
            label: 'Item 2 — Cheyne-Stokes',
            detail:
              'Ciclos de hiperpneia alternando com apneia, amplitude crescente/decrescente — verdadeiro.',
            icon: 'Activity',
          },
          {
            label: 'Item 3 — anóxia',
            detail: 'Ausência total de oxigênio nos tecidos — verdadeiro.',
            icon: 'Wind',
          },
          {
            label: 'Item 4 — apneia',
            detail:
              'Apneia = parada dos movimentos respiratórios — não é só “oxigênio insuficiente”.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Item 5 — bradipneia',
            detail: 'FR lenta abaixo do parâmetro para a idade — verdadeiro.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'I=F · II=V · III=V · IV=F · V=V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: cinco assertivas sobre nomenclatura respiratória.',
          'Julgar I — taquipneia como dor/dificuldade: confunde com dispneia → FALSA.',
          'Julgar II — Cheyne-Stokes com apneia alternada e amplitude variável → VERDADEIRA.',
          'Julgar III — anóxia sem oxigênio → VERDADEIRA.',
          'Julgar IV — apneia como “oxigênio insuficiente”: apneia é parada respiratória → FALSA.',
          'Julgar V — bradipneia lenta abaixo da faixa etária → VERDADEIRA.',
          'Sequência: F, V, V, F, V.',
          'Eliminar B, C, D, E pelas combinações incorretas.',
          'Marcar A.',
        ],
        footer_rule: 'F,V,V,F,V → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — termos respiratórios',
        meta: slideMeta,
        content: 'NOMENCLATURA — NÃO CONFUNDA',
        rows: [
          { label: 'Taquipneia', value: 'FR > 20 irpm (adulto)', sv_kind: 'fr', badge: 'hot' },
          { label: 'Dispneia', value: 'Dificuldade respiratória subjetiva', sv_kind: 'fr', badge: 'warn' },
          { label: 'Apneia', value: 'Ausência de movimentos respiratórios', sv_kind: 'fr', badge: 'ok' },
          { label: 'Anóxia', value: 'Falta de oxigênio nos tecidos', sv_kind: 'fr', badge: 'ok' },
          { label: 'Cheyne-Stokes', value: 'Ciclos crescente/decrescente + apneia', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Taquipneia ≠ dispneia · apneia ≠ hipoxemia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SEQUÊNCIA V/F',
        items: [
          {
            label: 'Letra B — F,F,V,V,V',
            detail: 'Aceita item I (taquipneia=dor) como falso mas erra II.',
            correct:
              'Item II (Cheyne-Stokes) é verdadeiro — sequência B não fecha F,V,V,F,V.',
          },
          {
            label: 'Letra C — V,F,V,V,F',
            detail: 'Marca taquipneia=dor como verdadeira.',
            correct:
              'Taquipneia é FR elevada, não “respiração dolorosa” — item I é falso.',
          },
          {
            label: 'Letra D — F,V,F,F,V',
            detail: 'Nega anóxia e bradipneia corretas.',
            correct:
              'Itens III (anóxia) e V (bradipneia) são verdadeiros — sequência D não corresponde.',
          },
          {
            label: 'Letra E — V,V,F,V,F',
            detail: 'Aceita taquipneia=dor e nega bradipneia.',
            correct:
              'Item I é falso e item V é verdadeiro — combinação E inverte ambos.',
          },
        ],
        footer_rule: 'Só A fecha F,V,V,F,V',
      },
    ],
  },

  'fundep-enfermagem-verificacao-de-sinais-vitais-1779343897104-8': {
    family: 'conceito',
    guideline:
      'MS — taquipneia: FR acima da normalidade no adulto (>20 irpm) · bradipneia <12 · dispneia subjetiva · ortopneia ao deitar',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Taquipneia — adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Situação em que o adulto apresenta FR acima da normalidade — qual termo?',
            icon: 'Target',
          },
          {
            label: 'FR acima do normal',
            detail: 'Adulto: >20 irpm — taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — dispneia',
            detail: 'Letra A: sensação subjetiva — não exige FR numérica alta.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — ortopneia',
            detail: 'Letra B: dispneia em decúbito — não é definição de FR alta.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — bradipneia',
            detail: 'Letra D: FR abaixo do normal — oposto do comando.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'FR alta no adulto = taquipneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR acima da normalidade em adulto.',
          'Referência MS: adulto 12–20 irpm; acima de 20 = taquipneia.',
          'Testar A — dispneia: dificuldade subjetiva, não define FR numérica → eliminar.',
          'Testar B — ortopneia: dispneia ao deitar → eliminar.',
          'Testar D — bradipneia: FR baixa → eliminar.',
          'Testar C — taquipneia: FR acima do normal → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'FR alta → taquipneia → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR adulto',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO NUMÉRICA',
        rows: [
          { label: 'Eupneia', value: 'FR 12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Bradipneia', value: 'FR < 12 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Dispneia', value: 'Falta de ar (subjetiva)', sv_kind: 'fr', badge: 'warn' },
          { label: 'Ortopneia', value: 'Dispneia ao deitar', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Taquipneia = número alto · dispneia = sensação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FUNDEP TAQUIPNEIA',
        items: [
          {
            label: 'Letra A — dispneia',
            detail: 'Dificuldade respiratória subjetiva.',
            correct:
              'Dispneia é sensação de falta de ar — não é sinônimo de FR acima de 20 irpm.',
          },
          {
            label: 'Letra B — ortopneia',
            detail: 'Dispneia em posição deitada.',
            correct:
              'Ortopneia descreve piora ao deitar — não define FR acima da normalidade.',
          },
          {
            label: 'Letra D — bradipneia',
            detail: 'Frequência respiratória abaixo do normal.',
            correct:
              'Bradipneia é FR <12 irpm — oposto de “acima da normalidade” pedido no enunciado.',
          },
          {
            label: 'Confundir subjetivo × objetivo',
            detail: 'Marcar dispneia por “falta de ar” genérico.',
            correct:
              'Comando pede FR objetivamente elevada — taquipneia (>20 irpm no adulto).',
          },
        ],
        footer_rule: 'Só taquipneia fecha FR alta',
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
    console.log(`[handcraft:sv-g37] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g37] total=${ok}`);
}

main();
