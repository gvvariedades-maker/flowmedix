#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g11 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g11.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g11';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-05';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'PA normotenso',
    'técnica de aferição PA',
    'fases de Korotkoff',
    'DBHA 2020',
    'comunicação de alteração SV',
    'classificação clínica multi-SV',
    'quinto sinal vital — dor',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch =
  | 'vitals_pa_tecnica'
  | 'vitals_interpretacao'
  | 'vitals_fc_faixas'
  | 'vitals_generico';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
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
    pedagogical_branch: pack.branch,
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
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344245160-8': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — PA ≥ 140/90 hipertensão · FR > 20 taquipneia · comunicar alteração à enfermeira',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — caso B Camboriú',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'PA 160×110 mmHg · FR 30 mpm — registrar e conduta do técnico.',
            icon: 'Target',
          },
          {
            label: 'PA 160×110',
            detail: 'Sistólica e diastólica elevadas — hipertensão.',
            icon: 'Scale',
          },
          {
            label: 'FR 30 mpm',
            detail: 'Acima de 20 irpm — taquipneia (não eupneia).',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — eupneico',
            detail: 'FR 30 nunca é eupneia — banca troca termo na letra B.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — taquicárdico',
            detail: 'Enunciado não traz FC — letra D inventa parâmetro.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Alteração de SV exige registro + comunicação à enfermeira',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: PA 160×110 mmHg · FR 30 mpm.',
          'PA 160×110 → hipertenso (≥ 140/90).',
          'FR 30 mpm → taquipneico (> 20 irpm).',
          'Testar A — hipertenso e taquipneico: combina os dois → candidata.',
          'Testar B — hipertenso porém eupneico: FR 30 é taquipneia → eliminar.',
          'Testar C — normotenso e taquipneico: PA elevada → eliminar.',
          'Testar D — hipertenso e taquicárdico: FC não foi aferida → eliminar.',
          'Testar E — não comunicar: SV alterados → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Hipertenso + taquipneico + comunicar → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — interpretação e conduta',
        meta: slideMeta,
        content: 'PA · FR · COMUNICAÇÃO',
        rows: [
          { label: 'PA 160×110', value: 'Hipertensa (≥ 140/90 mmHg)', sv_kind: 'pa', badge: 'hot' },
          { label: 'FR 30 mpm', value: 'Taquipneia (> 20 irpm)', sv_kind: 'fr', badge: 'hot' },
          {
            label: 'Conduta técnico',
            value: 'Registrar no prontuário e comunicar à enfermeira',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Alternativa A.',
          },
          {
            label: 'Eupneia adulto',
            value: '12–20 irpm — FR 30 está fora',
            sv_kind: 'fr',
            badge: 'warn',
            exam_hint: 'B erra ao chamar de eupneico.',
          },
        ],
        footer_rule: 'Nunca omitir comunicação quando PA e FR estão alterados',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA B CAMBORIÚ',
        items: [
          {
            label: 'Letra B — eupneico',
            detail: 'Classifica FR 30 como eupneia mantendo hipertensão.',
            correct: 'FR 30 mpm é taquipneia — eupneia seria 12–20 irpm.',
          },
          {
            label: 'Letra C — normotenso',
            detail: 'Rebaixa PA 160×110 para normotensão.',
            correct: '160×110 mmHg é hipertensão — não normotensão.',
          },
          {
            label: 'Letra D — taquicárdico',
            detail: 'Inventa taquicardia sem FC no enunciado.',
            correct: 'O caso só informa PA e FR — taquicardia não pode ser inferida aqui.',
          },
          {
            label: 'Letra E — não comunicar',
            detail: 'Considera SV estáveis e omite comunicação.',
            correct: 'PA e FR alterados exigem registro e comunicação à enfermeira.',
          },
        ],
        footer_rule: 'Só A combina classificação correta + comunicação',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1778969737311-0': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'DBHA 2020 — palpação radial estima sistólica · Korotkoff I = sistólica · fase V = diastólica · não arredondar para 0/5',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica PA DBHA 2020',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas V/F sobre aferição de PA não invasiva — FGV EBSERH.',
            icon: 'Target',
          },
          {
            label: 'I — palpação radial',
            detail: 'Estimar PA sistólica pela palpação do pulso radial — técnica válida.',
            icon: 'HeartPulse',
          },
          {
            label: 'II — fase I Korotkoff',
            detail: 'Sistólica no aparecimento dos sons (fase I).',
            icon: 'Stethoscope',
          },
          {
            label: 'III — fase V',
            detail: 'Diastólica no desaparecimento dos sons (fase V).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — arredondamento',
            detail: 'Arredondar para zero ou cinco — DBHA não indica essa prática.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Julgue cada item antes de combinar V/F',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: V/F sobre PA não invasiva (DBHA 2020).',
          'Julgar I — palpação radial estima sistólica: V (verdadeira).',
          'Julgar II — sistólica na fase I de Korotkoff: V (verdadeira).',
          'Julgar III — diastólica na fase V: V (verdadeira).',
          'Julgar IV — arredondar para 0 ou 5: F (falsa).',
          'Sequência: V – V – V – F.',
          'Testar A — F-V-F-F: erra I e III → eliminar.',
          'Testar B — V-V-F-F: erra III → eliminar.',
          'Testar C — V-F-V-V: erra II e IV → eliminar.',
          'Testar D — V-V-V-F: combinação correta → candidata.',
          'Testar E — F-F-F-F: nega itens verdadeiros → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'V – V – V – F → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Korotkoff DBHA',
        meta: slideMeta,
        content: 'KOROTKOFF · PALPAÇÃO · REGISTRO',
        rows: [
          {
            label: 'PA sistólica — pulso radial',
            value: 'Palpar pulso radial para estimar nível antes da ausculta',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'Fase I',
            value: '1º som = pressão sistólica',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Fase V',
            value: 'Desaparecimento dos sons = diastólica',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Registro',
            value: 'Valor aferido sem arredondar para 0 ou 5',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item IV é falso.',
          },
        ],
        footer_rule: 'Decore: I e II e III = V · IV = F',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F DBHA',
        items: [
          {
            label: 'Letra A — F-V-F-F',
            detail: 'Nega palpação radial e aceita arredondamento.',
            correct: 'I é verdadeira (palpação radial) e IV é falsa (sem arredondar).',
          },
          {
            label: 'Letra B — V-V-F-F',
            detail: 'Nega diastólica na fase V.',
            correct: 'III é verdadeira — diastólica = desaparecimento dos sons (fase V).',
          },
          {
            label: 'Letra C — V-F-V-V',
            detail: 'Nega fase I e aceita arredondamento.',
            correct: 'II é verdadeira (sistólica no 1º som) e IV é falsa.',
          },
          {
            label: 'Letra E — F-F-F-F',
            detail: 'Todas falsas — nega técnica padrão DBHA.',
            correct: 'Itens I, II e III são verdadeiros segundo as diretrizes de hipertensão.',
          },
        ],
        footer_rule: 'Arredondamento (IV=F) elimina A, C e E',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1778969760552-4': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — inflar manguito 20–30 mmHg acima da sistólica estimada · tibial posterior atrás do maléolo medial · bradipneia < 12 irpm',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica PA e pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três assertivas V/F — técnica auscultatória PA · pulso tibial · bradipneia.',
            icon: 'Target',
          },
          {
            label: 'I — inflação manguito',
            detail: 'Inflar 20–30 mmHg acima da sistólica estimada — técnica correta.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — tibial posterior',
            detail: 'Local descrito é dorsal do pé/hálux — não tibial posterior.',
            icon: 'Footprints',
          },
          {
            label: 'III — bradipneia',
            detail: 'FR lenta < 12 irpm em repouso — definição correta.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — local do pulso',
            detail: 'Tibial posterior fica atrás do maléolo medial — banca troca com pediosa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PA e pulso têm anatomia fixa — não confunda artérias',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: V/F técnica básica de enfermagem.',
          'Julgar I — inflar 20–30 mmHg acima da sistólica: V (verdadeira).',
          'Julgar II — tibial posterior no dorso do pé entre tendões do hálux: F (falsa).',
          'Julgar III — bradipneia < 12 irpm: V (verdadeira).',
          'Sequência: V – F – V.',
          'Testar A — F-V-F: erra I → eliminar.',
          'Testar B — V-V-V: aceita local errado do pulso → eliminar.',
          'Testar C — F-F-F: nega itens corretos → eliminar.',
          'Testar D — V-F-V: combinação correta → candidata.',
          'Testar E — F-V-V: erra I → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'V – F – V → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — inflação e pulso',
        meta: slideMeta,
        content: 'MANGUITO · PULSO TIBIAL · BRADIPNEIA',
        rows: [
          {
            label: 'Inflação PA',
            value: '20–30 mmHg acima da sistólica estimada',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Tibial posterior',
            value: 'Atrás do maléolo medial — não no dorso do pé',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Item II é falso.',
          },
          {
            label: 'Pediosa/dorsal',
            value: 'Dorso do pé, entre extensores do hálux — outro pulso',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'Bradipneia',
            value: 'FR < 12 irpm em repouso',
            sv_kind: 'fr',
            badge: 'ok',
          },
        ],
        footer_rule: 'Tibial posterior ≠ pediosa — item II é a pegadinha',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F SJC',
        items: [
          {
            label: 'Letra A — F-V-F',
            detail: 'Nega inflação correta do manguito.',
            correct: 'Inflar 20–30 mmHg acima da sistólica estimada é técnica válida (I=V).',
          },
          {
            label: 'Letra B — V-V-V',
            detail: 'Aceita tibial posterior no dorso do pé.',
            correct: 'Tibial posterior palpa-se atrás do maléolo medial — não entre tendões do hálux.',
          },
          {
            label: 'Letra C — F-F-F',
            detail: 'Nega inflação e bradipneia corretas.',
            correct: 'I e III são verdadeiros — só o local do pulso (II) é falso.',
          },
          {
            label: 'Letra E — F-V-V',
            detail: 'Nega técnica de inflação do manguito.',
            correct: 'Item I é verdadeiro — manguito deve ultrapassar 20–30 mmHg a sistólica estimada.',
          },
        ],
        footer_rule: 'Anatomia do pulso (II=F) separa D das demais',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1779344089179-5': {
    family: 'vf',
    branch: 'vitals_interpretacao',
      guideline:
      'MS/COFEN — pulso apical 5º EIC · pré-hipertensão sistólica a partir de 130 mmHg · FR > 20 taquipneia · RN usa apical',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — monitoramento multi-SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três assertivas V/F — pulso apical · pré-hipertensão · taquipneia.',
            icon: 'Target',
          },
          {
            label: 'I — pulso apical',
            detail: '5º EIC esquerdo no ápice · método preferido em recém-nascidos.',
            icon: 'Heart',
          },
          {
            label: 'II — pré-hipertensão',
            detail: 'Sistólica a partir de 130 mmHg classifica pré-hipertenso (faixa clássica de prova).',
            icon: 'Scale',
          },
          {
            label: 'III — taquipneia',
            detail: 'FR 30 irpm em adulto = taquipneia (> 20).',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — negar taquipneia',
            detail: 'FR 30 está bem acima de 20 — não é eupneia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Cada item testa um parâmetro diferente — julgue isolado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: V/F monitoramento de SV.',
          'Julgar I — apical no 5º EIC, indicado RN: V (verdadeira).',
          'Julgar II — pré-hipertensão sistólica a partir de 130 mmHg: V (verdadeira).',
          'Julgar III — FR 30 = taquipneico: V (verdadeira).',
          'Sequência: V – V – V.',
          'Testar A — V-V-V: combinação correta → candidata.',
          'Testar B — F-V-F: erra apical e taquipneia → eliminar.',
          'Testar C — V-F-V: nega pré-hipertensão → eliminar.',
          'Testar D — F-F-F: nega todos → eliminar.',
          'Testar E — F-F-V: erra apical e pré-hipertensão → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Todas verdadeiras → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — apical · PA · FR',
        meta: slideMeta,
        content: 'PULSO APICAL · PRÉ-HAS · TAQUIPNEIA',
        rows: [
          {
            label: 'Pulso apical',
            value: '5º EIC esquerdo · preferido em RN',
            sv_kind: 'fc',
            badge: 'hot',
          },
          {
            label: 'Pré-hipertensão',
            value: 'PAS 130 mmHg — limite superior da faixa de prova',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Taquipneia adulto',
            value: 'FR > 20 irpm — 30 é taquipneia',
            sv_kind: 'fr',
            badge: 'hot',
          },
          {
            label: 'Eupneia adulto',
            value: '12–20 irpm — referência para contraste',
            sv_kind: 'fr',
            badge: 'ok',
          },
        ],
        footer_rule: 'RN → apical · FR 30 → taquipneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F FHEMIG',
        items: [
          {
            label: 'Letra B — F-V-F',
            detail: 'Nega pulso apical no RN e FR 30 como taquipneia.',
            correct: 'Apical no 5º EIC é padrão em RN e FR 30 irpm é taquipneia.',
          },
          {
            label: 'Letra C — V-F-V',
            detail: 'Rejeita faixa de pré-hipertensão com PAS 130 mmHg.',
            correct: 'PAS a partir de 130 mmHg entra na classificação de pré-hipertensão nas diretrizes clássicas.',
          },
          {
            label: 'Letra D — F-F-F',
            detail: 'Todas falsas — contradiz protocolos básicos.',
            correct: 'Os três itens são afirmativas técnicas corretas segundo MS/COFEN.',
          },
          {
            label: 'Letra E — F-F-V',
            detail: 'Só aceita taquipneia — nega apical e pré-HAS.',
            correct: 'Pulso apical e pré-hipertensão (PAS ≥ 130 mmHg) também são verdadeiros.',
          },
        ],
        footer_rule: 'Única sequência totalmente V é A',
      },
    ],
  },

  'funatec-enfermagem-verificacao-de-sinais-vitais-1779343822075-7': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — PA 90×60 hipotensão · T axilar afebril · FC normocárdica · FR 12–20 eupneia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — idoso Pinheiro MA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Paciente 60 anos com fraqueza — sinais vitais anotados na unidade de saúde: qual alterado e condição?',
            icon: 'Target',
          },
          {
            label: 'PA 90×60 mmHg',
            detail: 'Pressão arterial no limite inferior — hipotensão na prova.',
            icon: 'Scale',
          },
          {
            label: 'Temperatura axilar',
            detail: 'Afebril / normotérmica — não é hipertermia.',
            icon: 'Thermometer',
          },
          {
            label: 'FC e FR',
            detail: 'Frequência cardíaca normocárdica · frequência respiratória eupneica.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — hipertermia',
            detail: 'Temperatura afebril do caso — letra A troca parâmetro.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Identifique qual parâmetro foge da faixa antes de classificar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Temperatura axilar do enunciado → normotérmica / afebril.',
          'PA 90×60 mmHg → hipotenso (limite inferior).',
          'Frequência cardíaca → normocárdica (faixa adulto).',
          'Frequência respiratória 16 mpm → eupneica (12–20).',
          'Testar A — hipertermia: T normal → eliminar.',
          'Testar B — hipotensão: único SV alterado → candidata.',
          'Testar C — bradipneia: FR 16 é normal → eliminar.',
          'Testar D — taquicardia: FC 78 é normal → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Único alterado = PA hipotensa → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — caso 60 anos',
        meta: slideMeta,
        content: 'PA · T · FC · FR',
        rows: [
          {
            label: 'PA 90×60',
            value: 'Hipotensão (limite — sistólica baixa)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa B.',
          },
          { label: 'Temperatura axilar', value: 'Afebril / normotérmica', sv_kind: 'temp', badge: 'ok' },
          { label: 'FC', value: 'Normocárdica (60–100 bpm)', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR 16 mpm', value: 'Eupneica (12–20 irpm)', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: '90×60 é hipotensão na prova — não confunda com normotenso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO PINHEIRO',
        items: [
          {
            label: 'Letra A — hipertermia',
            detail: 'Classifica temperatura afebril como febre.',
            correct: 'Temperatura axilar do caso é afebril — hipertermia exigiria valor acima do limite.',
          },
          {
            label: 'Letra C — bradipneia',
            detail: 'Chama FR 16 de bradipneia.',
            correct: 'FR 16 mpm está na faixa eupneica (12–20) — não é bradipneia.',
          },
          {
            label: 'Letra D — taquicardia',
            detail: 'Eleva FC normocárdica para taquicardia.',
            correct: 'FC do enunciado está na faixa normocárdica — não é taquicardia.',
          },
        ],
        footer_rule: 'Só PA 90×60 está alterada → confirme B',
      },
    ],
  },

  'funatec-enfermagem-verificacao-de-sinais-vitais-1779343856589-0': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — K1 = sistólica · K5 = diastólica · febre eleva FC/FR · HAS ≥ 140/90 · bradipneia < 12 irpm',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conceitos SV — Korotkoff e HAS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Medidas de funções básicas do corpo — temperatura, frequência cardíaca, frequência respiratória e pressão arterial na avaliação da saúde.',
            icon: 'Target',
          },
          {
            label: 'HAS definida',
            detail: 'Doença crônica · pressão máxima e mínima ≥ 140/90 mmHg — alternativa C.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — Korotkoff invertido',
            detail: 'Primeiro som = sistólica · último som = diastólica — letra A inverte.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — febre reduz FC',
            detail: 'Hipertermia costuma elevar FC e FR — não reduzir.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — bradipneia 15–20',
            detail: 'Bradipneia é < 12 irpm — não faixa eupneica.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Korotkoff e definição de HAS são eixos centrais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre SV.',
          'Testar A — primeiro som diastólica e último som sistólica: inverte Korotkoff → eliminar.',
          'Testar B — febre reduz FC/FR/PA: fisiologia invertida → eliminar.',
          'Testar C — HAS ≥ 140/90 mmHg: definição MS → candidata.',
          'Testar D — bradipneia 15–20 irpm: confunde com eupneia → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Definição de HAS → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Korotkoff e HAS',
        meta: slideMeta,
        content: 'KOROTKOFF · HAS · BRADIPNEIA',
        rows: [
          {
            label: 'Primeiro som (K1)',
            value: 'Pressão sistólica — não diastólica',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'A erra ao inverter.',
          },
          {
            label: 'Último som (fase V)',
            value: 'Pressão diastólica — desaparecimento dos sons',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'HAS',
            value: 'PAS/PAD ≥ 140/90 mmHg (crônica)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa C.',
          },
          {
            label: 'Bradipneia',
            value: 'FR < 12 irpm — não 15–20',
            sv_kind: 'fr',
            badge: 'warn',
            exam_hint: 'D erra a faixa.',
          },
        ],
        footer_rule: 'Não inverta K1 e K5 — decore antes da prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONCEITOS FUNATEC',
        items: [
          {
            label: 'Letra A — Korotkoff invertido',
            detail: 'Primeiro som como diastólica e último som como sistólica.',
            correct: 'O primeiro som audível marca sistólica; o desaparecimento marca diastólica.',
          },
          {
            label: 'Letra B — febre reduz sinais',
            detail: 'Hipertermia com queda de FC, FR e PA.',
            correct: 'Febre tende a elevar FC e FR — não reduzir os parâmetros vitais.',
          },
          {
            label: 'Letra D — bradipneia 15–20',
            detail: 'Bradipneia entre 15 e 20 irpm.',
            correct: 'Bradipneia é FR < 12 irpm — 15–20 é faixa eupneica.',
          },
        ],
        footer_rule: 'Korotkoff invertido elimina A → confirme C',
      },
    ],
  },

  'funatec-enfermagem-verificacao-de-sinais-vitais-1779344097180-3': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS — triagem HAS: avaliar peso/altura (IMC) · técnico não prescreve · PA 160/100 = hipertensão estágio 2',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conduta PA — triagem Sr. Silva',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Triagem na unidade de saúde — Sr. Silva 55 anos · PA 160/100 mmHg — diretrizes do Ministério da Saúde.',
            icon: 'Target',
          },
          {
            label: 'PA 160×100',
            detail: 'Hipertensão estágio 2 — requer avaliação ampliada.',
            icon: 'Scale',
          },
          {
            label: 'Avaliação antropométrica',
            detail: 'Peso e altura (IMC) antes de conduta — MS triagem.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — prescrever',
            detail: 'Técnico não inicia anti-hipertensivo — papel do médico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — retorno 6 meses',
            detail: 'PA elevada não pode aguardar sem avaliação.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Técnico avalia e encaminha — não prescreve nem adia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: atendimento de triagem — Sr. Silva 55 anos · valores pressóricos 160/100 mmHg.',
          'Classificar: hipertensão estágio 2.',
          'Testar A — retorno em 6 meses: adia conduta → eliminar.',
          'Testar B — iniciar anti-hipertensivo: técnico não prescreve → eliminar.',
          'Testar C — avaliar peso e altura antes de medidas: MS → candidata.',
          'Testar D — cardiologista imediato: escalonamento excessivo → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Antropometria na triagem HAS → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — triagem hipertensão',
        meta: slideMeta,
        content: 'PA ELEVADA · PAPEL DO TÉCNICO',
        rows: [
          {
            label: 'PA 160×100',
            value: 'Hipertensão estágio 2',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Triagem MS',
            value: 'Avaliar peso e altura (IMC) na abordagem',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Alternativa C.',
          },
          {
            label: 'Técnico',
            value: 'Não prescreve medicamento anti-hipertensivo',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'B excede competência.',
          },
          {
            label: 'Seguimento',
            value: 'Não adiar 6 meses com PA elevada',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'A adia indevidamente.',
          },
        ],
        footer_rule: 'Avaliar IMC faz parte da abordagem inicial de HAS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA SES-DF',
        items: [
          {
            label: 'Letra A — retorno 6 meses',
            detail: 'Orienta retorno distante sem reavaliação.',
            correct: 'PA 160/100 exige conduta na triagem — não adiar seis meses.',
          },
          {
            label: 'Letra B — anti-hipertensivo',
            detail: 'Inicia fármaco na hora pelo técnico.',
            correct: 'Prescrição de anti-hipertensivo é ato médico — técnico não prescreve.',
          },
          {
            label: 'Letra D — cardiologista imediato',
            detail: 'Encaminhamento especializado urgente sem escalonamento.',
            correct: 'Primeiro passo na triagem é avaliação antropométrica — não consulta cardiológica imediata.',
          },
        ],
        footer_rule: 'Competência do técnico elimina B → confirme C',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1778969729218-9': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'COFEN/MS — sinais vitais clássicos: T · FC · FR · PA · 5º sinal = dor (escala)',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quinto sinal vital — dor',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar o quinto sinal vital — Fundatec Tangará.',
            icon: 'Target',
          },
          {
            label: 'Quatro clássicos',
            detail: 'Temperatura · FC (pulso) · FR · PA — base da avaliação.',
            icon: 'Activity',
          },
          {
            label: '5º sinal vital',
            detail: 'Dor — avaliada por escala (ex.: EVA) desde os anos 1990.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — pulso isolado',
            detail: 'Pulso integra a FC — não é 5º sinal separado.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — PA ou T',
            detail: 'PA e temperatura já estão nos quatro clássicos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Decore: T · FC · FR · PA + dor = 5 sinais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual é o quinto sinal vital?',
          'Revisar os quatro clássicos: T, FC, FR e PA.',
          'Testar A — pulso: componente da FC, não 5º sinal → eliminar.',
          'Testar B — PA: já é um dos quatro → eliminar.',
          'Testar C — temperatura: já é um dos quatro → eliminar.',
          'Testar D — dor: 5º sinal vital reconhecido → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Dor = 5º sinal vital → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 5 sinais vitais',
        meta: slideMeta,
        content: 'T · FC · FR · PA · DOR',
        rows: [
          { label: '1º–4º clássicos', value: 'Temperatura · FC · FR · PA', sv_kind: 'meta', badge: 'ok' },
          {
            label: '5º sinal',
            value: 'Dor (avaliação subjetiva por escala)',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Alternativa D.',
          },
          {
            label: 'Pulso',
            value: 'Manifestação da FC — não sinal vital autônomo',
            sv_kind: 'fc',
            badge: 'warn',
            exam_hint: 'A confunde com 5º.',
          },
        ],
        footer_rule: 'Dor entrou como 5º sinal vital na enfermagem moderna',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 5º SINAL VITAL',
        items: [
          {
            label: 'Letra A — pulso',
            detail: 'Lista pulso como quinto sinal.',
            correct: 'Pulso expressa a FC — já está entre os quatro sinais clássicos.',
          },
          {
            label: 'Letra B — pressão arterial',
            detail: 'Repete um dos quatro sinais básicos.',
            correct: 'PA é um dos quatro clássicos — o quinto é a dor.',
          },
          {
            label: 'Letra C — temperatura',
            detail: 'Repete temperatura como se fosse o quinto.',
            correct: 'Temperatura já compõe os quatro sinais vitais tradicionais.',
          },
        ],
        footer_rule: 'Só dor não está nos quatro clássicos → letra D',
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
    console.log(`[handcraft:sv-g11] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g11] total=${ok}`);
}

main();
