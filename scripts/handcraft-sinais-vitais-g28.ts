#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g28 (8 slugs P1 vitals_fc_faixas batch 3).
 *
 *   npm run handcraft:sinais-vitais-g28
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g28';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBC',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'pulso radial — indicador e médio',
    'polegar não palpa pulso',
    'pulso filiforme = fino',
    'pulso carotídeo — PCR',
    'bradicardia <60',
    'taquicardia >100',
    'pulso dicrótico',
    'locais de palpação — pedioso/radial/apical',
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

type Branch =
  | 'vitals_pa_tecnica'
  | 'vitals_interpretacao'
  | 'vitals_fc_faixas'
  | 'vitals_generico';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'certo_errado';
  branch: Branch;
  guideline: string;
  exam_vs_current?: string;
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
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779343897104-1': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pulso filiforme: amplitude fina/débil · difícil de sentir · desaparece com pressão leve · distinto de ausente ou bounding',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso filiforme — palpação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Registro de pulso filiforme no prontuário — qual o significado clínico à palpação?',
            icon: 'Target',
          },
          {
            label: 'Filiforme',
            detail:
              'Dificuldade de sentir o pulso; pressão leve já o faz desaparecer — amplitude fina/débil.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — ausente',
            detail: 'Letra B: pulso impalpável mesmo com maior pressão = ausente, não filiforme.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — bounding',
            detail: 'Letra D: pulso forte que não some com pressão moderada = amplitude aumentada.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — Doppler',
            detail: 'Letra A: Doppler complementa exame de pulsos fracos — não é inútil.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — amplitude × FC',
            detail:
              'Filiforme é qualidade do pulso — após palpar, compare com 60–100 bpm; não confunda amplitude fina com bradicardia numérica.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'Filiforme = fino + some com leve pressão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: significado de pulso filiforme registrado no prontuário.',
          'Fixar: filiforme = qualidade do pulso (amplitude), não frequência.',
          'Testar A — Doppler inútil: método complementar é útil em pulsos fracos → eliminar.',
          'Testar B — impalpável com maior pressão: ausência total, não filiforme → eliminar.',
          'Testar C — facilmente sentido, some com pressão moderada: descreve outro padrão → eliminar.',
          'Testar D — forte, não desaparece: pulso bounding/hipercinético → eliminar.',
          'Testar E — difícil de sentir + pressão leve some: definição clássica de filiforme → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Filiforme = fino à palpação → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — qualidade do pulso',
        meta: slideMeta,
        content: 'AMPLITUDE × PALPAÇÃO',
        rows: [
          { label: 'Pulso filiforme', value: 'Fino — some com pressão leve', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pulso ausente', value: 'Impalpável mesmo com maior pressão', sv_kind: 'fc', badge: 'warn' },
          { label: 'Pulso bounding', value: 'Forte — não desaparece com pressão moderada', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Filiforme ≠ ausente nem bounding',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FILIFORME CPCON',
        items: [
          {
            label: 'Letra A — Doppler inútil',
            detail: 'Doppler de ultrassom como complemento ao exame dos pulsos.',
            correct:
              'Doppler auxilia quando o pulso é difícil de palpar — não é método inútil em filiforme.',
          },
          {
            label: 'Letra B — impalpável com maior pressão',
            detail: 'Não é possível sentir o pulso mesmo com maior pressão.',
            correct:
              'Pulso ausente é impalpável com qualquer pressão — filiforme ainda se sente com técnica suave.',
          },
          {
            label: 'Letra C — facilmente sentido',
            detail: 'Pulso facilmente sentido, desaparece com pressão moderada.',
            correct:
              'Filiforme já é difícil de sentir desde o início — não é facilmente palpável.',
          },
          {
            label: 'Letra D — pulso forte',
            detail: 'Pulso forte que não desaparece com pressão moderada.',
            correct:
              'Amplitude aumentada e resistente à compressão é pulso bounding — oposto de filiforme.',
          },
        ],
        footer_rule: 'Só E = fino + some com leve pressão',
      },
    ],
  },

  'facape-enfermagem-verificacao-de-sinais-vitais-1778969752567-2': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — suspeita de PCR: verificar pulso carotídeo no pescoço (lateral à traqueia) · não contraindicado · periférico não substitui central em parada',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR — verificação de pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Suspeita de parada cardiorrespiratória — qual afirmativa sobre verificação de pulso é correta?',
            icon: 'Target',
          },
          {
            label: 'Carótida na PCR',
            detail:
              'Pulso central no pescoço — lateral à traqueia; sítio de escolha para checar circulação em PCR.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — contraindicar carótida',
            detail: 'Letra A: carótida não causa taquicardia — é o sítio indicado.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — punho = central',
            detail: 'Letra B: punho interno é radial (periférico), não pulso central.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — poplítea/pé',
            detail: 'Letra C: poplítea e dorso do pé são periféricos — inadequados como único sítio em PCR.',
            icon: 'MapPin',
          },
        ],
        footer_rule: 'PCR = carótida no pescoço',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: verificação de pulso na suspeita de parada cardiorrespiratória.',
          'Fixar: PCR exige pulso central confiável — carótida.',
          'Testar A — contraindicar carótida: sem base; carótida é indicada → eliminar.',
          'Testar B — central no punho: radial é periférico → eliminar.',
          'Testar C — periférico poplítea/pé: sítios distais inadequados em PCR → eliminar.',
          'Testar D — evitar periférico por cateter: generalização indevida → eliminar.',
          'Testar E — carótida lateral do pescoço: pulso central correto → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Carótida na PCR → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pulso na PCR',
        meta: slideMeta,
        content: 'CENTRAL × PERIFÉRICO',
        rows: [
          { label: 'PCR — sítio', value: 'Carótida — pescoço lateral', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pulso central', value: 'Carótida · femoral', sv_kind: 'fc', badge: 'ok' },
          { label: 'Pulso periférico', value: 'Radial · pedioso · poplítea', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Sem pulso', value: 'Iniciar compressões — RCP', sv_kind: 'fc', badge: 'hot' },
        ],
        footer_rule: 'PCR: carótida antes de periférico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PULSO NA PCR',
        items: [
          {
            label: 'Letra A — contraindicar carótida',
            detail: 'Carótida contraindicada por promover taquicardia.',
            correct:
              'Verificação carotídea é padrão na PCR — palpação breve não induz taquicardia no paciente.',
          },
          {
            label: 'Letra B — central no punho',
            detail: 'Pulso central na parte interna do punho.',
            correct:
              'Punho interno corresponde à artéria radial — pulso periférico, não central.',
          },
          {
            label: 'Letra C — poplítea e dorso do pé',
            detail: 'Obrigatório periférico na poplítea e face anterior dos pés.',
            correct:
              'Poplítea e pedioso são periféricos distais — insuficientes como única checagem em suspeita de PCR.',
          },
          {
            label: 'Letra D — evitar periférico',
            detail: 'Não verificar periférico por cateter de hemodiálise.',
            correct:
              'Cateter não proíbe universalmente palpação periférica — mas em PCR o sítio correto é carótida.',
          },
        ],
        footer_rule: 'Só E fecha PCR',
      },
    ],
  },

  'fenix-instituto-enfermagem-verificacao-de-sinais-vitais-1780000468214-0': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — FC adulto 60–100 bpm · bradicardia <60 · taquicardia >100 · FC varia com esforço, dor e emoção',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC — conceitos e variação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Avaliação da frequência cardíaca na prática de enfermagem — afirmativa correta.',
            icon: 'Target',
          },
          {
            label: 'Variação fisiológica',
            detail:
              'FC muda com esforço físico, dor e alterações emocionais — resposta normal do sistema cardiovascular.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — taqui invertida',
            detail: 'Letra A: taquicardia = FC aumentada, não redução de batimentos.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — bradi invertida',
            detail: 'Letra B: bradicardia = FC abaixo do esperado, não acima.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — constante',
            detail: 'Letra D: FC não é fixa — adapta-se ao estado do paciente.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'FC varia com estímulos → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre frequência cardíaca.',
          'Revisar definições: taqui = alta · bradi = baixa · adulto 60–100 bpm.',
          'Testar A — taqui = redução: inverte conceito → eliminar.',
          'Testar B — bradi = aumento: inverte conceito → eliminar.',
          'Testar D — FC constante: fisiologicamente falso → eliminar.',
          'Testar C — variações com esforço/dor/emoção: resposta cardiovascular normal → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'Definições corretas + variação → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC adulto',
        meta: slideMeta,
        content: 'FAIXAS E TERMINOLOGIA',
        rows: [
          { label: 'FC normal adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Fatores de variação', value: 'Esforço · dor · emoção · febre', sv_kind: 'fc', badge: 'ok' },
          { label: 'Aferição', value: 'Pulso radial — 60 s', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'Não inverta bradi e taqui',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÕES FC',
        items: [
          {
            label: 'Letra A — taquicardia = redução',
            detail: 'Taquicardia como redução de batimentos.',
            correct:
              'Taquicardia é frequência cardíaca elevada (>100 bpm) — não redução de batimentos.',
          },
          {
            label: 'Letra B — bradicardia = aumento',
            detail: 'Bradicardia como aumento da FC.',
            correct:
              'Bradicardia é FC abaixo do normal (<60 bpm em adulto) — não aumento.',
          },
          {
            label: 'Letra D — FC constante',
            detail: 'FC permanece constante independente das condições.',
            correct:
              'FC é dinâmica — esforço, dor, ansiedade e febre alteram a frequência cardíaca.',
          },
        ],
        footer_rule: 'Só C fecha fisiologia',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779343919045-4': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — FC manual periférica: indicador + médio sobre artéria superficial · leve compressão · contagem 60 s (1 minuto) · nunca polegar · artéria, não veia',
    roi_error: 'polegar_palpa_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC manual periférica — técnica',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Técnica segura de mensuração manual periférica da frequência cardíaca.',
            icon: 'Target',
          },
          {
            label: 'Técnica FEPESE',
            detail:
              'Indicador + médio sobre artéria superficial · compressão leve · contar 60 s (um minuto).',
            icon: 'Hand',
          },
          {
            label: 'Pegadinha — polegar',
            detail: 'Letra A: polegar tem pulso próprio — não serve para palpar.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — veia',
            detail: 'Letra B: pulso arterial é em artéria, não veia superficial.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 15 s × 4',
            detail: 'Letras C e E: contagem por 15 ou 30 s com multiplicador — prova exige 1 minuto.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Indicador + médio · artéria · 60 s',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica segura de FC manual periférica.',
          'Checklist: artéria · indicador+médio · sem polegar · tempo de contagem.',
          'Testar A — polegar 1 min: dedo errado → eliminar.',
          'Testar B — indicador em veia 15 s×4: veia + tempo errado → eliminar.',
          'Testar C — indicador+médio 15 s×4: dedos certos, tempo inadequado → eliminar.',
          'Testar E — indicador+médio 30 s×4: multiplicador incorreto para técnica segura → eliminar.',
          'Testar D — indicador+médio em artéria 1 min: técnica completa → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'D = dedos + artéria + 60 s',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — palpação periférica',
        meta: slideMeta,
        content: 'DECORE — TÉCNICA FC MANUAL',
        rows: [
          { label: 'Dedos', value: 'Indicador + médio — nunca polegar', sv_kind: 'fc', badge: 'hot' },
          { label: 'Vaso', value: 'Artéria superficial — não veia', sv_kind: 'fc', badge: 'hot' },
          { label: 'Tempo FEPESE', value: '60 segundos (1 minuto)', sv_kind: 'fc', badge: 'ok' },
          { label: 'Site de rotina', value: 'Artéria radial', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Polegar e veia = eliminar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA FEPESE',
        items: [
          {
            label: 'Letra A — polegar',
            detail: 'Polegar sobre artéria por um minuto.',
            correct:
              'Polegar capta o pulso do próprio examinador — técnica exige indicador e médio.',
          },
          {
            label: 'Letra B — veia + 15 s',
            detail: 'Indicador em veia, 15 segundos multiplicado por 4.',
            correct:
              'Pulso é palpado em artéria arterial — veia não transmite batimento cardíaco palpável.',
          },
          {
            label: 'Letra C — 15 s × 4',
            detail: 'Indicador e médio corretos, mas 15 segundos × 4.',
            correct:
              'FEPESE gabarita contagem integral de 60 segundos — não amostragem de 15 s.',
          },
          {
            label: 'Letra E — 30 s × 4',
            detail: 'Indicador e médio, 30 segundos multiplicado por 4.',
            correct:
              'Multiplicador por 4 após 30 s não corresponde à técnica segura pedida (1 minuto completo).',
          },
        ],
        footer_rule: 'Só D fecha técnica MS',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1779343919045-8': {
    family: 'vf',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pedioso: dorso do pé · radial: punho (face anterior) · apical/ictus: 4º–5º EIC esquerdo linha clavicular média',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Locais de pulso — V/F',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Três afirmativas V/F sobre locais de verificação do pulso periférico e apical.',
            icon: 'Target',
          },
          {
            label: 'I — pedioso (V)',
            detail:
              'Dorso do pé, lateral ao tendão do extensor longo do hálux — localização correta.',
            icon: 'Footprints',
          },
          {
            label: 'II — radial (F)',
            detail:
              'Radial fica no punho — não na fossa antecubital entre bíceps e tríceps (descrição braquial).',
            icon: 'Ban',
          },
          {
            label: 'III — apical (V)',
            detail:
              'Ictus entre 4º e 5º EIC esquerdo na linha clavicular média — aceito pela banca.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Sequência V – F – V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar V/F sobre pedioso, radial e apical.',
          'Item I — pedioso no dorso do pé: correto → V.',
          'Item II — radial no cotovelo/braço: descreve braquial → F.',
          'Item III — apical 4º–5º EIC esquerdo: correto → V.',
          'Sequência: V – F – V.',
          'Testar A — V-F-F: erra apical → eliminar.',
          'Testar B — F-F-F: nega pedioso e apical → eliminar.',
          'Testar C — V-V-V: aceita radial errado → eliminar.',
          'Testar D — F-V-F: inverte pedioso → eliminar.',
          'Testar E — V-F-V: sequência correta → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'V – F – V → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios de pulso',
        meta: slideMeta,
        content: 'ONDE PALPAR CADA PULSO',
        rows: [
          { label: 'Pedioso', value: 'Dorso do pé — lateral ao extensor do hálux', sv_kind: 'fc', badge: 'ok' },
          { label: 'Radial', value: 'Punho — face anterior', sv_kind: 'fc', badge: 'hot' },
          { label: 'Braquial', value: 'Fossa antecubital — sulco bíceps/tríceps', sv_kind: 'fc', badge: 'warn' },
          { label: 'Apical (ictus)', value: '4º–5º EIC esquerdo — linha clavicular média', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Radial ≠ braquial em prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LOCAIS FGV',
        items: [
          {
            label: 'Letra A — V – F – F',
            detail: 'Aceita pedioso e radial, nega apical.',
            correct:
              'Apical no 4º–5º EIC esquerdo é verdadeiro — terceiro item não pode ser F.',
          },
          {
            label: 'Letra B — F – F – F',
            detail: 'Nega os três locais descritos.',
            correct:
              'Pedioso no dorso do pé e ictus no hemitórax esquerdo são localizações corretas.',
          },
          {
            label: 'Letra C — V – V – V',
            detail: 'Aceita radial no cotovelo/braço.',
            correct:
              'Item II descreve fossa antecubital — sítio da braquial, não da radial no punho.',
          },
          {
            label: 'Letra D — F – V – F',
            detail: 'Nega pedioso e apical, aceita radial errado.',
            correct:
              'Inverte I e III — pedioso e apical são V; radial no braço é F.',
          },
        ],
        footer_rule: 'Só E = V – F – V',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1779344117207-0': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pulso dicrótico: dupla onda por batimento · primeira onda mais intensa · segunda menor (onda dicrótica)',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso dicrótico — padrão',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Dupla onda em cada pulsação — primeira mais intensa e nítida, segunda de menor intensidade.',
            icon: 'User',
          },
          {
            label: 'Dicrótico',
            detail:
              'Duas ondas por batimento cardíaco — característica da curva de pulso dicrótico.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — filiforme',
            detail: 'Letra B: filiforme = amplitude fina, não dupla onda.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — alternante',
            detail: 'Letra C: alternante = batimentos fortes e fracos alternados — arritmia.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — paradoxal',
            detail: 'Letra E: paradoxal = variação com respiração, não dupla onda.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — confundir padrões',
            detail:
              'Dicrótico descreve morfologia da onda — após identificar, compare FC com 60–100 bpm; não confunda com taquicardia ou bradicardia isoladas.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'Dupla onda = dicrótico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nomear pulso com dupla onda (primeira intensa, segunda menor).',
          'Associar: duas ondas por batimento → dicrótico.',
          'Testar A — nomal: erro ortográfico de normal → eliminar.',
          'Testar B — filiforme: amplitude reduzida, sem dupla onda → eliminar.',
          'Testar C — alternante: batimentos alternados fortes/fracos → eliminar.',
          'Testar E — paradoxal: enfraquece na inspiração → eliminar.',
          'Testar D — dicrótico: dupla onda clássica → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Dupla onda → dicrótico → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — padrões de pulso',
        meta: slideMeta,
        content: 'QUALIDADE DO PULSO — NOMES',
        rows: [
          { label: 'Pulso dicrótico', value: 'Dupla onda por batimento', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pulso filiforme', value: 'Amplitude fina / débil', sv_kind: 'fc', badge: 'warn' },
          { label: 'Pulso alternante', value: 'Forte e fraco alternados', sv_kind: 'fc', badge: 'warn' },
          { label: 'Pulso paradoxal', value: 'Mais fraco na inspiração', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Dicrótico = morfologia da onda',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DICRÓTICO',
        items: [
          {
            label: 'Letra A — nomal',
            detail: 'Pulso "nomal" (erro de grafia).',
            correct:
              'Pulso normal não apresenta dupla onda descrita — achado é padrão dicrótico específico.',
          },
          {
            label: 'Letra B — filiforme',
            detail: 'Pulso filiforme.',
            correct:
              'Filiforme descreve amplitude reduzida à palpação — não dupla onda em cada batimento.',
          },
          {
            label: 'Letra C — alternante',
            detail: 'Pulso alternante.',
            correct:
              'Alternante alterna batimentos fortes e fracos sucessivos — distinto de duas ondas no mesmo batimento.',
          },
          {
            label: 'Letra E — paradoxal',
            detail: 'Pulso paradoxal.',
            correct:
              'Paradoxal varia com ciclo respiratório (fraco na inspiração) — não dupla onda por batimento.',
          },
        ],
        footer_rule: 'Dupla onda → só D',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1779344117207-7': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — bradicardia adulto: FC < 60 bpm · taquicardia > 100 bpm · normocárdico 60–100',
    exam_vs_current:
      'FGV gabarita bradicardia sinusal < 50 bpm; referência MS contemporânea define bradicardia como FC < 60 bpm em adulto',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Bradicardia sinusal — corte FGV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Adulto com bradicardia sinusal — frequência cardíaca menor que qual valor?',
            icon: 'Target',
          },
          {
            label: 'Gabarito FGV',
            detail: 'Bradicardia sinusal nesta prova: FC < 50 bpm → letra B.',
            icon: 'HeartPulse',
          },
          {
            label: 'Referência MS',
            detail: 'Bradicardia geral em adulto: FC < 60 bpm — registrar divergência.',
            icon: 'BookOpen',
          },
          {
            label: 'Pegadinha — 60 bpm',
            detail: 'Letra C: 60 é limite inferior da normocárdia MS, não corte desta questão.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — taqui',
            detail: 'Letras D e E (70/80): valores dentro ou acima da faixa normal.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'Prova FGV: < 50 bpm → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: bradicardia sinusal — FC menor que…',
          'Contexto prova: FGV usa corte de 50 bpm para bradicardia sinusal.',
          'Testar A — 40 bpm: também < 50, mas não é a alternativa gabarito → eliminar.',
          'Testar C — 60 bpm: limite normocárdico MS — não é o corte FGV → eliminar.',
          'Testar D — 70 bpm: normocárdico → eliminar.',
          'Testar E — 80 bpm: normocárdico → eliminar.',
          'Testar B — 50 bpm: corte indicado pela banca → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'FGV: menor que 50 → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas FC',
        meta: slideMeta,
        content: 'PROVA × GUIDELINE',
        rows: [
          { label: 'FGV — bradi sinusal', value: 'FC < 50 bpm (gabarito prova)', sv_kind: 'fc', badge: 'hot' },
          { label: 'MS — bradicardia', value: 'FC < 60 bpm (adulto)', sv_kind: 'fc', badge: 'warn' },
          { label: 'Normocárdico', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Aferição', value: 'Pulso radial — 60 s', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'Na prova: marque 50 · saiba que MS usa 60',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BRADI FGV',
        items: [
          {
            label: 'Letra A — 40 bpm',
            detail: 'Frequência menor que 40 bpm.',
            correct:
              '40 também é bradicárdico, mas a questão pede o limite oferecido pela banca — 50 bpm.',
          },
          {
            label: 'Letra C — 60 bpm',
            detail: 'Frequência menor que 60 bpm.',
            correct:
              '60 bpm é o limite inferior MS para normocárdia — FGV gabarita corte em 50 nesta questão.',
          },
          {
            label: 'Letra D — 70 bpm',
            detail: 'Frequência menor que 70 bpm.',
            correct:
              '70 bpm está na faixa normocárdica (60–100) — não define bradicardia sinusal.',
          },
          {
            label: 'Letra E — 80 bpm',
            detail: 'Frequência menor que 80 bpm.',
            correct:
              '80 bpm é normocárdico em repouso — incluiria FC normal, não só bradicardia.',
          },
        ],
        footer_rule: 'Gabarito prova = B (50)',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779343811344-2': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pulso filiforme: tátil fino · baixa amplitude · débil à palpação · distinto de dicrótico ou normocárdico',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso filiforme — caso clínico',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Trabalhador com mal-estar — pulso radial tátil, fino e com baixa amplitude.',
            icon: 'User',
          },
          {
            label: 'Filiforme',
            detail:
              'Pulso fino, de baixa amplitude à palpação — terminologia clássica: filiforme.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — dicrótico',
            detail: 'Letra A: dicrótico = dupla onda, não amplitude fina.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — normocárdico',
            detail: 'Letra C: normocárdico refere-se à FC, não à qualidade do pulso.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — termos inventados',
            detail: 'Letras B e E: filocárdio/discárdio não são classificações de amplitude.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Fino + baixa amplitude = filiforme',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terminologia do pulso tátil, fino e de baixa amplitude no radial.',
          'Fixar: qualidade do pulso (amplitude), não frequência cardíaca.',
          'Testar A — dicrótico: dupla onda por batimento → eliminar.',
          'Testar B — filocárdio: termo sem relação com amplitude → eliminar.',
          'Testar C — normocárdio: FC normal, não descreve pulso fino → eliminar.',
          'Testar E — discárdio: termo distrator sem base → eliminar.',
          'Testar D — filiforme: pulso fino de baixa amplitude → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Fino no radial → filiforme → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — qualidade do pulso',
        meta: slideMeta,
        content: 'AMPLITUDE × FREQUÊNCIA',
        rows: [
          { label: 'Pulso filiforme', value: 'Fino · baixa amplitude · débil', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pulso dicrótico', value: 'Dupla onda por batimento', sv_kind: 'fc', badge: 'warn' },
          { label: 'Normocárdico', value: 'FC 60–100 bpm — frequência', sv_kind: 'fc', badge: 'ok' },
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Filiforme = amplitude, não FC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FILIFORME FUNDATEC',
        items: [
          {
            label: 'Letra A — dicrótico',
            detail: 'Pulso dicrótico.',
            correct:
              'Dicrótico apresenta duas ondas por batimento — não pulso fino de baixa amplitude.',
          },
          {
            label: 'Letra B — filocárdio',
            detail: 'Pulso filocárdio.',
            correct:
              'Filocárdio não é termo padrão para pulso fino à palpação — gabarito é filiforme.',
          },
          {
            label: 'Letra C — normocárdio',
            detail: 'Pulso normocárdio.',
            correct:
              'Normocárdico classifica frequência cardíaca (60–100 bpm) — enunciado descreve amplitude reduzida.',
          },
          {
            label: 'Letra E — discárdio',
            detail: 'Pulso discárdio.',
            correct:
              'Discárdio é distrator ortográfico — achado clínico (fino, baixa amplitude) = filiforme.',
          },
        ],
        footer_rule: 'Só D = amplitude fina',
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
    console.log(`[handcraft:sv-g28] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g28] total=${ok}`);
}

main();
