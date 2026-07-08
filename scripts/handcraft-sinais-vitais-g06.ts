#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g06 (8 slugs P0 vitals_pa_tecnica + interpretação).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g06.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g06';
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
    'temperatura axilar',
    'técnica de aferição PA',
    'fases de Korotkoff',
    'manguito inadequado',
    'PA divergente',
    'momentos de verificação SV',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'vitals_pa_tecnica' | 'vitals_interpretacao' | 'vitals_generico';

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
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344178184-2': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA divergente: ampla diferença entre sistólica e diastólica (ex.: 120×40 mmHg)',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA divergente — conceito clínico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Identificar em quais casos o técnico reconhece pressão arterial divergente — padrão AVANÇASP.',
            icon: 'Target',
          },
          {
            label: 'PA divergente',
            detail:
              'Quando sistólica e diastólica se afastam demais — amplitude pressórica anormal (ex.: 120×40 mmHg).',
            icon: 'HeartPulse',
          },
          {
            label: 'Hipertensão × divergência',
            detail: 'PA acima de 150×90 é hipertensão — não define divergência sistólica-diastólica.',
            icon: 'GitCompare',
          },
          {
            label: 'Hipotensão × divergência',
            detail: 'PA abaixo de 100×60 é hipotensão — critério distinto de afastamento entre componentes.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — aproximação',
            detail:
              'Sistólica e diastólica muito próximas (ex.: 120×100) não caracterizam divergência — oposto do gabarito.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Divergente = sistólica e diastólica se afastam — não hiper/hipotensão isolada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: PA divergente em casos de:',
          'Traduzir divergente: ampla diferença entre sistólica e diastólica — não só valor alto ou baixo.',
          'Testar A — PA acima de 150×90: hipertensão, não divergência → eliminar.',
          'Testar B — PA abaixo de 100×60: hipotensão, não divergência → eliminar.',
          'Testar C — PA sem identificar sistólica: erro técnico de registro, não conceito divergente → eliminar.',
          'Testar D — sistólica e diastólica se afastam (ex.: 120×40): amplitude anormal → candidata.',
          'Testar E — sistólica e diastólica se aproximam (ex.: 120×100): oposto de divergência → eliminar.',
          'Confirmar: só D descreve PA divergente.',
          'Marcar D.',
        ],
        footer_rule: 'Afastamento sistólica-diastólica → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA divergente',
        meta: slideMeta,
        content: 'AMPLITUDE · SISTÓLICA · DIASTÓLICA',
        rows: [
          {
            label: 'PA divergente',
            value: 'Sistólica e diastólica se afastam — ex.: 120×40 mmHg',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Hipertensão',
            value: 'PA acima de ~140/90 mmHg — não confundir com divergência',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Hipotensão',
            value: 'PA abaixo de ~90/60 mmHg — critério distinto',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Pulso de pressão',
            value: 'Diferença PAS − PAD — divergência = amplitude anormal',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Registro',
            value: 'Sempre anotar sistólica e diastólica — nunca omitir componente',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore: divergente = afastamento entre sistólica e diastólica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA DIVERGENTE',
        items: [
          {
            label: 'Letra A — PA acima da média',
            detail: 'Descreve hipertensão, não divergência pressórica.',
            correct:
              'Hipertensão classifica valor elevado — divergência exige afastamento entre sistólica e diastólica.',
          },
          {
            label: 'Letra B — PA abaixo da média',
            detail: 'Descreve hipotensão.',
            correct:
              'Hipotensão é PA baixa global — não define quando sistólica e diastólica se afastam.',
          },
          {
            label: 'Letra C — sem identificar sistólica',
            detail: 'Erro de registro técnico, não conceito clínico de divergência.',
            correct:
              'Omissão de componente é falha documental — divergência exige comparar sistólica × diastólica.',
          },
          {
            label: 'Letra E — sistólica e diastólica se aproximam',
            detail: 'Pulso de pressão estreito — oposto do enunciado.',
            correct:
              'Aproximação (ex.: 120×100) não é divergência — gabarito pede afastamento entre componentes.',
          },
        ],
        footer_rule: 'Elimine hiper/hipotensão e aproximação → divergência (D)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344205200-6': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — erros comuns PA: repetição rápida · insuflação lenta · braço sem apoio',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Erros comuns na aferição de PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar três fatores que levam a erros na avaliação da PA — formato V/F I–III.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — repetição rápida',
            detail:
              'Medir PA em sequência imediata sem repouso vascular entre leituras — item I verdadeiro.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — insuflação lenta',
            detail:
              'Insuflação muito lenta distorce Korotkoff e a leitura diastólica — item II verdadeiro.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — braço pendente',
            detail:
              'Braço pendente ou sem apoio ao nível do coração altera pressão hidrostática — item III verdadeiro.',
            icon: 'User',
          },
          {
            label: 'Pegadinha — combinações parciais',
            detail: 'Banca oferece V,V,F ou V,F,F para testar se você nega braço pendente ou deflação.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Os três itens são erros reais de técnica — todos verdadeiros',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: três itens V/F sobre erros na aferição de PA.',
          'Julgar I — repetição das avaliações com muita rapidez? → VERDADEIRO.',
          'Julgar II — insuflação muito lenta? → VERDADEIRO.',
          'Julgar III — braço não apoiado? → VERDADEIRO.',
          'Sequência correta: V, V, V.',
          'Eliminar A (V,V,F), B (V,F,V), C (V,F,F), D (F,V,V).',
          'Marcar E — todos os itens são verdadeiros.',
        ],
        footer_rule: 'V, V, V → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica correta PA',
        meta: slideMeta,
        content: 'REPOUSO · APOIO · VELOCIDADE',
        rows: [
          {
            label: 'Intervalo entre medidas',
            value: 'Aguardar repouso — não repetir PA com rapidez',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item I = V.',
          },
          {
            label: 'Insuflação',
            value: 'Velocidade adequada — insuflação lenta demais é erro',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item II = V.',
          },
          {
            label: 'Posição do braço',
            value: 'Apoiado ao nível do coração — não pendente',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item III = V.',
          },
          {
            label: 'Repouso pré-PA',
            value: 'Cerca de cinco minutos sentado antes da 1ª medida',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Deflação auscultatória',
            value: 'Lenta e constante na técnica Korotkoff',
            sv_kind: 'pa',
            badge: 'ok',
          },
        ],
        footer_rule: 'Evite rapidez, insuflação lenta e braço sem apoio',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F ERROS DE PA',
        items: [
          {
            label: 'Letra A — nega braço pendente',
            detail: 'Sequência V,V,F exclui braço sem apoio ao nível do coração.',
            correct:
              'Braço pendente altera leitura pressórica — item III é verdadeiro; A erra ao marcar F no III.',
          },
          {
            label: 'Letra B — nega insuflação lenta',
            detail: 'Sequência V,F,V trata insuflação lenta como falsa.',
            correct:
              'Insuflação muito lenta distorce Korotkoff — item II é verdadeiro, não falso.',
          },
          {
            label: 'Letra C — só repetição rápida',
            detail: 'V,F,F aceita apenas item I como erro de técnica.',
            correct:
              'Braço pendente e insuflação lenta também são erros reais — sequência correta é V,V,V.',
          },
          {
            label: 'Letra D — nega repetição rápida',
            detail: 'F,V,V invalida item I (repetição com rapidez).',
            correct:
              'Repetir PA sem intervalo de repouso é erro clássico — item I é verdadeiro.',
          },
        ],
        footer_rule: 'Só E fecha V,V,V sem negar nenhum item',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344189558-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — manguito estreito para braço largo → PA falsamente elevada',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA no idoso — esfigmomanômetro aneroide',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Afirmativa correta sobre PA no braço de idoso com esfigmomanômetro aneroide — CEBRASPE.',
            icon: 'Target',
          },
          {
            label: 'Tamanho do manguito',
            detail: 'Bolsa deve cobrir ~80% do braço — estreito para membro largo eleva leitura.',
            icon: 'Ruler',
          },
          {
            label: 'Manguito estreito',
            detail: 'PA falsamente elevada — não baixa — pegadinha clássica de prova.',
            icon: 'TrendingUp',
          },
          {
            label: 'Posição do braço',
            detail: 'Membro ao nível do coração — acima do coração eleva artificialmente a PA.',
            icon: 'User',
          },
          {
            label: 'Pegadinha — deflação rápida',
            detail: 'Esvaziar manguito rápido após 1º som não é técnica para hiato auscultatório.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Manguito estreito = PA falsamente alta — memorize a direção do erro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: PA no idoso com aneroide — assinalar afirmativa correta.',
          'Testar A — esvaziar rápido após 1º som para hiato: técnica incorreta → eliminar.',
          'Testar B — manguito estreito → PA falsamente elevada: regra MS → candidata.',
          'Testar C — braço acima do coração evita elevação: posição errada eleva PA → eliminar.',
          'Testar D — manguito frouxo acima do cotovelo: técnica inadequada → eliminar.',
          'Confirmar: só B é assertiva correta.',
          'Marcar B.',
        ],
        footer_rule: 'Manguito estreito → PA falsamente elevada → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — manguito × leitura',
        meta: slideMeta,
        content: 'MANGUITO · BRAÇO · LEITURA',
        rows: [
          {
            label: 'Manguito estreito',
            value: 'PA falsamente elevada — bolsa comprime demais o braço',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Manguito largo',
            value: 'PA falsamente baixa — subestima pressão real',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Cobertura ideal',
            value: 'Bolsa ~80% da circunferência braquial',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Posição braço',
            value: 'Nível do coração — membro elevado eleva leitura',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Idoso',
            value: 'Escolher manguito conforme circunferência — não tamanho único',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Estreito = alto falso · largo = baixo falso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO CEBRASPE',
        items: [
          {
            label: 'Letra A — deflação rápida',
            detail: 'Propõe esvaziar manguito rápido após primeiro som.',
            correct:
              'Deflação deve ser lenta e constante na auscultatória — A não é técnica correta.',
          },
          {
            label: 'Letra C — braço acima do coração',
            detail: 'Inverte efeito da posição do membro.',
            correct:
              'Braço acima do coração reduz leitura — posição correta é nível cardíaco.',
          },
          {
            label: 'Letra D — manguito frouxo',
            detail: 'Manguito frouxo acima do cotovelo compromete aferição.',
            correct:
              'Manguito deve estar firme e posicionado corretamente — D descreve erro técnico.',
          },
        ],
        footer_rule: 'Direção do erro: estreito eleva — confirme B',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344122526-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — FR: contar ciclos respiratórios por 1 minuto completo, discretamente',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica SV — respiração',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Assinalar alternativa correta sobre verificação de respiração, pulso, PA e temperatura.',
            icon: 'Target',
          },
          {
            label: 'FR — padrão MS',
            detail: 'Contar cada ciclo respiratório por 1 minuto inteiro — não extrapolar de segundos.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — 15 ou 20 segundos',
            detail: 'Multiplicar por 4 ou 3 a partir de intervalos curtos é técnica incorreta na prova.',
            icon: 'Clock',
          },
          {
            label: 'Pulso — dedos',
            detail: 'Palpação com dedo médio isolado ou intervalo de 15 s × 4 não é padrão COGEPS.',
            icon: 'HeartPulse',
          },
          {
            label: 'Temperatura',
            detail: 'Termômetro de mercúrio axilar 1 min — alternativa D mistura técnica legada.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'FR = 1 minuto completo — filtre intervalos curtos antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sobre verificação de SV — assinalar alternativa correta.',
          'Testar A — pulso: dedo médio, 15 s × 4: técnica incompleta → eliminar.',
          'Testar B — FR: 20 s × 3: intervalo curto com multiplicador → eliminar.',
          'Testar C — FR: contar ciclo respiratório 1 minuto e registrar: padrão MS → candidata.',
          'Testar D — temperatura mercúrio axilar 1 min: não responde ao foco respiratório → eliminar.',
          'Confirmar: só C descreve FR corretamente.',
          'Marcar C.',
        ],
        footer_rule: 'FR 1 minuto inteiro → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — contagem de FR',
        meta: slideMeta,
        content: '1 MINUTO · DISCRETO · CICLO COMPLETO',
        rows: [
          {
            label: 'FR adulto',
            value: '12–20 irpm em repouso',
            sv_kind: 'fr',
            badge: 'ok',
          },
          {
            label: 'Técnica FR',
            value: 'Contar 1 minuto completo — inspiração + expiração = 1 ciclo',
            sv_kind: 'fr',
            badge: 'hot',
          },
          {
            label: 'Observação discreta',
            value: 'Paciente não deve perceber — conversa altera FR',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'Intervalos curtos',
            value: '15 s × 4 ou 20 s × 3 — pegadinha de prova, não padrão COGEPS',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'Relógio',
            value: 'Segundero obrigatório — não estimar visualmente',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore: FR = 1 minuto, não multiplicar segundos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA FR COGEPS',
        items: [
          {
            label: 'Letra A — pulso 15 s × 4',
            detail: 'Descreve palpação de pulso, não respiração.',
            correct:
              'Comando pede técnica correta de SV — A trata pulso com intervalo curto, não FR.',
          },
          {
            label: 'Letra B — FR 20 s × 3',
            detail: 'Extrapola FR de intervalo de 20 segundos.',
            correct:
              'FR deve ser contada por 1 minuto inteiro — multiplicar 20 s é técnica incorreta.',
          },
          {
            label: 'Letra D — temperatura axilar',
            detail: 'Alternativa sobre termômetro de mercúrio, não respiração.',
            correct:
              'Temperatura axilar não responde ao critério de FR — C isola a contagem respiratória correta.',
          },
        ],
        footer_rule: 'Elimine intervalos curtos → confirme 1 minuto (C)',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344127707-7': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — Korotkoff: 1º som = sistólica · 5ª fase = diastólica · FR 1 min discreta',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV — afirmativas CORRETAS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinalar afirmativa CORRETA sobre verificação dos sinais vitais — COGEPS.',
            icon: 'Target',
          },
          {
            label: 'Korotkoff — sequência',
            detail: '1º som na deflação = sistólica · último som = diastólica — não invertido.',
            icon: 'Stethoscope',
          },
          {
            label: 'Temperatura axilar',
            detail: 'Axila deve estar seca — termômetro em axila molhada é erro técnico.',
            icon: 'Thermometer',
          },
          {
            label: 'Palpação de pulso',
            detail: 'Indicador e médio sobre artéria — polegar + anelar distorce leitura.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR correta',
            detail: 'Observar inspiração sem paciente perceber — contar 1 minuto completo.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Três alternativas invertem técnica — só FR discreta 1 min está correta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: é CORRETO afirmar sobre verificação de SV.',
          'Testar A — 1º som = diastólica, último = sistólica: Korotkoff invertido → eliminar.',
          'Testar B — termômetro em axila seca ou molhada: axila molhada é erro → eliminar.',
          'Testar C — pulso radial com polegar e anelar: dedos incorretos → eliminar.',
          'Testar D — FR: observar inspiração sem paciente perceber, contar 1 min: técnica MS → candidata.',
          'Confirmar: A, B e C descrevem erros; só D é correta.',
          'Marcar D.',
        ],
        footer_rule: 'FR discreta 1 minuto → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Korotkoff e FR',
        meta: slideMeta,
        content: 'KOROTKOFF · PULSO · RESPIRAÇÃO',
        rows: [
          {
            label: '1º som Korotkoff',
            value: 'Pressão sistólica — aparece na deflação',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Diastólica',
            value: 'Desaparecimento do último som (5ª fase)',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Palpação pulso',
            value: 'Dedos indicador e médio — nunca polegar',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'Temperatura axilar',
            value: 'Axila seca — retirar sudorese antes de aferir',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'FR',
            value: '1 minuto, discretamente, sem paciente perceber',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Alternativa D.',
          },
        ],
        footer_rule: 'Invertido Korotkoff e polegar no pulso = pegadinhas A e C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA SV COGEPS',
        items: [
          {
            label: 'Letra A — Korotkoff invertido',
            detail: 'Troca sistólica e diastólica na ausculta.',
            correct:
              'Primeiro som marca sistólica — alternativa A inverte a sequência clássica de Korotkoff.',
          },
          {
            label: 'Letra B — axila molhada',
            detail: 'Aceita termômetro em axila molhada.',
            correct:
              'Axila deve estar seca para aferição confiável — umidade altera transferência térmica.',
          },
          {
            label: 'Letra C — polegar e anelar',
            detail: 'Palpação radial com dedos inadequados.',
            correct:
              'Polegar possui pulso próprio — palpação correta usa indicador e médio, não polegar + anelar.',
          },
        ],
        footer_rule: 'Só D combina FR discreta + 1 minuto',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344152370-2': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — pulso: indicador + médio, 1 minuto · FR: 1 min · PA: técnica auscultatória padrão',
    roi_error: 'polegar_no_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica SV — pulso e FR',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinalar alternativa CORRETA sobre técnica de verificação dos sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Pulso correto',
            detail: 'Indicador e médio sobre artéria periférica — contar 1 minuto inteiro.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — intervalos FR',
            detail: 'Alternativas A e B contam FR em 30 s ou 15 s multiplicados — incorreto.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — PA COGEPS',
            detail:
              'Alternativa C insufla valor fixo elevado sem palpação prévia e mistura técnica Korotkoff — erro de prova.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — pulso 15 s',
            detail: 'Alternativa D usa indicador+médio mas só 15 s × 4 — incompleto.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Pulso = indicador + médio + 1 minuto — não polegar nem intervalo curto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica de SV — assinalar alternativa correta.',
          'Testar A — FR 30 s × 4: intervalo curto com multiplicador errado → eliminar.',
          'Testar B — FR 15 s × 4: mesma pegadinha de intervalo → eliminar.',
          'Testar C — PA com insuflação fixa sem palpação + Korotkoff atípico: técnica COGEPS errada → eliminar.',
          'Testar D — pulso indicador+médio, 15 s × 4: dedos corretos, tempo errado → eliminar.',
          'Testar E — pulso indicador+médio, 1 minuto completo: técnica MS → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Indicador + médio + 1 min → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pulso e FR',
        meta: slideMeta,
        content: 'INDICADOR · MÉDIO · 1 MINUTO',
        rows: [
          {
            label: 'Palpação pulso',
            value: 'Dedos indicador e médio sobre artéria — nunca polegar',
            sv_kind: 'fc',
            badge: 'hot',
          },
          {
            label: 'Duração FC',
            value: 'Contar 1 minuto completo — adulto ou irregular',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Alternativa E.',
          },
          {
            label: 'FR',
            value: '1 minuto inteiro — não 15 s × 4 nem 30 s × 4',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'Insuflação PA',
            value: 'Acima da sistólica estimada na braquial — não valor fixo arbitrário',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Polegar',
            value: 'Possui pulso arterial próprio — distorce contagem',
            sv_kind: 'fc',
            badge: 'warn',
          },
        ],
        footer_rule: 'Decore: indicador + médio + relógio 1 min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA SV COGEPS',
        items: [
          {
            label: 'Letra A — FR 30 s × 4',
            detail: 'Multiplicador errado para 30 segundos.',
            correct:
              '30 segundos exigiria ×2, não ×4 — e FR padrão MS é 1 minuto, não extrapolação.',
          },
          {
            label: 'Letra B — FR 15 s × 4',
            detail: 'Contagem respiratória por intervalo curto.',
            correct:
              'FR deve ser observada por 1 minuto completo — B usa atalho incorreto.',
          },
          {
            label: 'Letra C — PA insuflação fixa',
            detail: 'Insuflação fixa elevada e técnica PA atípica COGEPS.',
            correct:
              'Insuflar valor fixo sem palpação prévia ignora técnica MS — PA correta estima sistólica antes.',
          },
          {
            label: 'Letra D — pulso 15 s × 4',
            detail: 'Dedos corretos, tempo de contagem insuficiente.',
            correct:
              'Indicador e médio estão certos, mas pulso exige 1 minuto — D para no intervalo curto.',
          },
        ],
        footer_rule: 'Quase certo em D — tempo completo fecha E',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344152370-6': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — SV: admissão · turno · alteração clínica · medicações · procedimentos · discrepância',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Momentos de verificar SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Rodrigues (2020): PA, temperatura, pulso, frequência respiratória e dor — quando verificar cada sinal vital.',
            icon: 'Target',
          },
          {
            label: 'Admissão hospitalar',
            detail:
              'Baseline na entrada + mínimo 1× por turno de 6 h + consultas ambulatoriais — alternativa A.',
            icon: 'Clipboard',
          },
          {
            label: 'Transfusão e cirurgia',
            detail: 'Antes e após transfusão sanguínea e procedimentos cirúrgicos — monitorar PA, pulso, FR e T.',
            icon: 'Activity',
          },
          {
            label: 'Medicações e discrepância',
            detail:
              'Antes/depois fármacos cardiovascular, respiratório e térmico; repetir se discrepância — alternativa D.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — não comunicar',
            detail:
              'Alternativa B: só quando médico pedir ou sobrar tempo — conduta sem escalonar monitorização.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PA · T · pulso · FR · dor — admissão, turno, eventos e medicações',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: momentos corretos para verificar SV.',
          'Ler A — admissão, turno 6 h, alteração, transfusão, cirurgia, ambulatório: protocolo completo → correta.',
          'Ler D — antes/depois medicações cardiovasculares, sensação incomum, discrepância: complementa A → correta.',
          'Testar B — só quando médico pedir ou sobrar tempo: absurdo clínico → eliminar.',
          'Testar C — apenas A e D corretas: combina as duas assertivas válidas → candidata.',
          'Confirmar: A e D são corretas; B é falsa; C sintetiza.',
          'Marcar C.',
        ],
        footer_rule: 'A + D corretas → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — quando aferir SV',
        meta: slideMeta,
        content: 'ADMIS · TURNO · EVENTO · MEDICAÇÃO',
        rows: [
          {
            label: 'Admissão',
            value: 'Baseline na entrada — registrar todos os SV',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Rotina',
            value: 'Mínimo 1× por turno (6 h) — mais se grave',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Medicações',
            value: 'Antes e após fármacos que alteram CV, FR ou T',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Procedimentos',
            value: 'Antes/depois cirurgia, transfusão, exames invasivos',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Discrepância',
            value: 'Repetir se valor divergir da medida anterior',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Nunca condicionar SV a “sobrar tempo”',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MOMENTOS SV',
        items: [
          {
            label: 'Letra A — só admissão e turno',
            detail: 'Lista momentos corretos, mas incompleta isolada.',
            correct:
              'A está correta, porém D também (medicações e discrepância) — gabarito exige A e D juntas (C).',
          },
          {
            label: 'Letra B — só se sobrar tempo',
            detail: 'Condiciona SV a disponibilidade ou ordem médica exclusiva.',
            correct:
              'SV é monitorização sistemática — não depende de sobra de tempo; comunicar alteração à equipe.',
          },
          {
            label: 'Letra D — só medicações e discrepância',
            detail: 'Afirmativa correta, mas insuficiente sozinha.',
            correct:
              'D está correta, porém A também (admissão, turno, transfusão) — resposta completa é C.',
          },
        ],
        footer_rule: 'B é eliminatória imediata — A e D fecham C',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344205200-8': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — FR 1 min · pulso indicador+médio · PA técnica padrão · temperatura conforme protocolo',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica SV — afirmativa correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Assinalar alternativa CORRETA sobre técnica de verificação dos sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'FR correta',
            detail: 'Contar ciclo respiratório por 1 minuto inteiro e registrar — padrão MS.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — FR 15 s',
            detail: 'Alternativa A multiplica 15 s × 4 — intervalo curto incorreto.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — PA COGEPS',
            detail:
              'Alternativa C: insuflação fixa elevada sem palpação + técnica Korotkoff atípica — erro de prova.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — polegar e temperatura',
            detail: 'D usa polegar no pulso; E restringe temperatura só à axilar.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'FR 1 minuto é filtro — demais alternativas misturam erros clássicos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica de SV — assinalar alternativa correta.',
          'Testar A — FR 15 s × 4: intervalo curto → eliminar.',
          'Testar B — FR 1 minuto completo e registrar: padrão MS → candidata.',
          'Testar C — PA com insuflação fixa + Korotkoff atípico: técnica COGEPS errada → eliminar.',
          'Testar D — pulso com dedo polegar, 15 s × 4: dedo e tempo errados → eliminar.',
          'Testar E — temperatura sempre axilar: absolutismo falso → eliminar.',
          'Confirmar: só B descreve FR corretamente.',
          'Marcar B.',
        ],
        footer_rule: 'FR 1 minuto → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica por SV',
        meta: slideMeta,
        content: 'FR · FC · PA · TEMP',
        rows: [
          {
            label: 'FR',
            value: '1 minuto completo — ciclo inspiração + expiração',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Alternativa B.',
          },
          {
            label: 'FC',
            value: 'Indicador + médio · 1 minuto — nunca polegar',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'PA',
            value: 'Insuflar acima da sistólica estimada — deflação lenta Korotkoff',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Temperatura',
            value: 'Axilar, oral, retal conforme protocolo — não só axilar',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'Registro',
            value: 'Documentar valor + horário + condição do paciente',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore: FR = 1 min · polegar no pulso = erro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA SV COGEPS',
        items: [
          {
            label: 'Letra A — FR 15 s × 4',
            detail: 'Extrapola respiração de intervalo curto.',
            correct:
              'FR padrão exige 1 minuto de observação — multiplicar 15 s é atalho incorreto.',
          },
          {
            label: 'Letra C — PA COGEPS errada',
            detail: 'Insuflação fixa elevada e técnica Korotkoff atípica.',
            correct:
              'PA correta palpa braquial e insufla acima da sistólica estimada — C inventa parâmetro fixo sem palpação.',
          },
          {
            label: 'Letra D — polegar no pulso',
            detail: 'Palpação com dedo polegar por 15 segundos.',
            correct:
              'Polegar tem pulso próprio — palpação usa indicador e médio por 1 minuto, não polegar × 15 s.',
          },
          {
            label: 'Letra E — temperatura só axilar',
            detail: 'Restringe aferição térmica a um único sítio.',
            correct:
              'Temperatura pode ser oral, axilar ou retal conforme indicação — “sempre axilar” é falso.',
          },
        ],
        footer_rule: 'Elimine polegar, PA fixa e FR curta → confirme B',
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
    console.log(`[handcraft:sv-g06] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g06] total=${ok}`);
}

main();
