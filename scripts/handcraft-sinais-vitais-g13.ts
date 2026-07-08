#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g13 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g13.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g13';
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
    'preparo pré-PA',
    'braço ao nível do coração',
    'pulso radial e apical',
    'classificação temperatura',
    'pressão diferencial',
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
  family: 'vf' | 'conceito' | 'protocolo' | 'text_fragment';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  source_covers?: string[];
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
    sources: [
      {
        ...SV_SOURCE,
        covers: [...SV_SOURCE.covers, ...(pack.source_covers ?? [])],
      },
    ],
  };
}

const SPECS: Record<string, Pack> = {
  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779344205200-5': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — quatro SV clássicos: FC · FR · PA · temperatura corpórea',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'O que é sinal vital — B do Ribeiro',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Qual alternativa NÃO é sinal vital na avaliação do paciente.',
            icon: 'Target',
          },
          {
            label: 'PA · FC · FR · T',
            detail: 'Quatro parâmetros clássicos de monitorização vital.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — antropometria',
            detail: 'Massa corporal é medida antropométrica — não entra no pacote SV.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Temperatura axilar',
            detail: 'Via comum de aferir temperatura corpórea — é SV.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'Quatro clássicos: FC · FR · PA · temperatura',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: identificar o que NÃO é sinal vital.',
          'Testar A — pressão arterial: parâmetro vital clássico → eliminar.',
          'Testar B — frequência cardíaca: parâmetro vital clássico → eliminar.',
          'Testar C — frequência respiratória: parâmetro vital clássico → eliminar.',
          'Testar E — temperatura axilar: parâmetro vital clássico → eliminar.',
          'Testar D — massa corporal: antropometria, não SV → candidata.',
          'Confirmar: única opção fora do pacote SV é D.',
          'Marcar D.',
        ],
        footer_rule: 'Massa corporal ≠ sinal vital → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SV básicos',
        meta: slideMeta,
        content: 'QUATRO SINAIS VITAIS CLÁSSICOS',
        rows: [
          { label: 'FC', value: 'Frequência cardíaca (bpm)', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR', value: 'Frequência respiratória (irpm)', sv_kind: 'fr', badge: 'hot' },
          { label: 'PA', value: 'Pressão arterial (mmHg)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Temperatura', value: 'Temperatura corpórea (°C)', sv_kind: 'temp', badge: 'hot' },
          {
            label: 'Fora do pacote',
            value: 'Massa corporal · peso · altura · IMC',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'Comando pede o que NÃO é SV.',
          },
        ],
        footer_rule: 'Antropometria não compõe os SV clássicos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANTROPOMETRIA × SV',
        items: [
          {
            label: 'Letra A — pressão arterial',
            detail: 'PA listada como se fosse antropometria.',
            correct: 'Pressão arterial é SV clássico — antropometria seria massa corporal (D).',
          },
          {
            label: 'Letra B — frequência cardíaca',
            detail: 'FC confundida com medida corporal.',
            correct: 'Frequência cardíaca é SV — pegadinha é confundir com massa corporal.',
          },
          {
            label: 'Letra C — frequência respiratória',
            detail: 'FR tratada como parâmetro não vital.',
            correct: 'FR é SV — antropometria (massa corporal) é a única exceção.',
          },
          {
            label: 'Letra E — temperatura axilar',
            detail: 'Temperatura excluída por ser axilar.',
            correct: 'Temperatura axilar é SV — massa corporal é antropometria, não SV.',
          },
        ],
        footer_rule: 'Só massa corporal fica fora → D',
      },
    ],
  },

  'fundep-enfermagem-verificacao-de-sinais-vitais-1779344253939-0': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — esfigmomanômetro afera PA · estetoscópio ausculta Korotkoff · Korotkoff = sons, não aparelho',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aparelho da PA — Lagoa Santa',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Hipertensão arterial epidemiológica — diagnosticada e controlada cedo melhora prognóstico — qual aparelho verifica o sinal.',
            icon: 'Target',
          },
          {
            label: 'Esfigmomanômetro',
            detail: 'Equipamento com manguito + manômetro para medir PA.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — Korotkoff',
            detail: 'Korotkoff nomeia os sons auscultados — não o aparelho.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — estetoscópio isolado',
            detail: 'Estetoscópio auxilia a ausculta, mas não mede PA sozinho.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Aparelho da PA = esfigmomanômetro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: hipertensão arterial — aparelho que verifica o sinal pressórico.',
          'Contexto epidemiológico: diagnóstico precoce e controle melhoram prognóstico.',
          'Testar A — Korotkoff: nome dos sons, não equipamento → eliminar.',
          'Testar B — hipertensômetro: termo inadequado/inventado → eliminar.',
          'Testar D — estetoscópio: acessório de ausculta, não mede PA → eliminar.',
          'Testar C — esfigmomanômetro: aparelho padrão de PA → candidata.',
          'Confirmar nomenclatura técnica COFEN/MS.',
          'Marcar C.',
        ],
        footer_rule: 'Esfigmomanômetro → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equipamentos PA',
        meta: slideMeta,
        content: 'MANGUITO · MANÔMETRO · AUSCULTA',
        rows: [
          {
            label: 'Esfigmomanômetro',
            value: 'Conjunto manguito + manômetro para PA',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Estetoscópio',
            value: 'Ausculta sons de Korotkoff — não mede sozinho',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Sons de Korotkoff',
            value: 'Fenômeno acústico na deflação do manguito',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Não confundir com nome do aparelho.',
          },
        ],
        footer_rule: 'Korotkoff = som · esfigmomanômetro = aparelho',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOMENCLATURA PA',
        items: [
          {
            label: 'Letra A — Korotkoff',
            detail: 'Troca fenômeno acústico por equipamento.',
            correct: 'Korotkoff são os ruídos auscultados na deflação — não é o aparelho.',
          },
          {
            label: 'Letra B — hipertensômetro',
            detail: 'Termo não padronizado em semiologia.',
            correct: 'Nomenclatura correta é esfigmomanômetro — hipertensômetro não é termo técnico.',
          },
          {
            label: 'Letra D — estetoscópio',
            detail: 'Confunde acessório com aparelho medidor.',
            correct: 'Estetoscópio auxilia a ausculta, mas a PA é aferida pelo esfigmomanômetro.',
          },
        ],
        footer_rule: 'Aparelho completo da PA → C',
      },
    ],
  },

  'furb-enfermagem-verificacao-de-sinais-vitais-1778969745165-7': {
    family: 'protocolo',
    branch: 'vitals_generico',
    guideline:
      'MS — hipotermia <35°C · afebril 36,1–37,2°C · febril 37,3–37,7°C · febre 37,8–38,9°C · hiperpirexia >40°C',
    roi_error: 'temperatura_pos_exercicio',
    exam_vs_current: 'exam_temp_gradation_furb',
    source_covers: [
      'febril 37,3–37,7°C',
      'afebril 36,1–37,2°C',
      'febre 37,8–38,9°C',
      'hiperpirexia >40°C',
      'hipotermia <35°C',
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificação da temperatura — CISAMVE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Semiologia SV — associar terminologia das alterações de temperatura (hipotermia · febril · febre · hiperpirexia · afebril) às faixas do enunciado.',
            icon: 'Target',
          },
          {
            label: 'Funções corporais',
            detail: 'Circulatória · respiratória · neural · endócrina — pulsação · respiração · pressão arterial.',
            icon: 'Activity',
          },
          {
            label: 'Febril',
            detail: '37,3°C a 37,7°C — elevação leve.',
            icon: 'Thermometer',
          },
          {
            label: 'Hiperpirexia',
            detail: 'Acima de 40°C — pico febril grave.',
            icon: 'Flame',
          },
          {
            label: 'Hipotermia',
            detail: 'Abaixo de 35°C — perda térmica crítica.',
            icon: 'Snowflake',
          },
          {
            label: 'Pegadinha — inverter faixas',
            detail: 'Banca troca febril com febre ou afebril com hipotermia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Decore faixa antes de montar a sequência',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Enunciado: semiologia — temperatura · pressão arterial · pulsação · respiração · dor.',
          'Comando: associar 5 termos de alteração térmica às 5 faixas de temperatura.',
          '37,3–37,7°C → febril (2).',
          'Acima de 40°C → hiperpirexia (4).',
          'Abaixo de 35°C → hipotermia (1).',
          '36,1–37,2°C → afebril (5).',
          '37,8–38,9°C → febre (3).',
          'Sequência: 2 – 4 – 1 – 5 – 3.',
          'Testar B — 2-1-4-3-5: troca hipotermia e hiperpirexia → eliminar.',
          'Testar C — 4-3-1-2-5: inverte febril e febre → eliminar.',
          'Testar D — 5-2-1-4-3: começa com afebril no 37,3°C → eliminar.',
          'Testar E — 3-4-1-5-2: confunde febre com febril → eliminar.',
          'Marcar A.',
        ],
        footer_rule: '2 – 4 – 1 – 5 – 3 → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas térmicas',
        meta: slideMeta,
        content: 'TERMINOLOGIA × °C',
        rows: [
          { label: 'Hipotermia', value: '< 35°C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Afebril', value: '36,1 – 37,2°C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Febril', value: '37,3 – 37,7°C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Febre', value: '37,8 – 38,9°C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Hiperpirexia', value: '> 40°C', sv_kind: 'temp', badge: 'hot' },
        ],
        footer_rule: 'Febril ≠ febre — faixas distintas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSOCIAÇÃO TÉRMICA',
        items: [
          {
            label: 'Letra B — 2-1-4-3-5',
            detail: 'Coloca hipotermia no >40°C.',
            correct: 'Hiperpirexia (>40°C) é item 4 — hipotermia (<35°C) é item 1.',
          },
          {
            label: 'Letra C — 4-3-1-2-5',
            detail: 'Inverte hiperpirexia com febril.',
            correct: '37,3–37,7°C é febril (2) — não hiperpirexia (4).',
          },
          {
            label: 'Letra D — 5-2-1-4-3',
            detail: 'Associa afebril à faixa febril.',
            correct: '37,3–37,7°C é febril — afebril fica em 36,1–37,2°C (5).',
          },
          {
            label: 'Letra E — 3-4-1-5-2',
            detail: 'Troca febre com febril no início.',
            correct: '37,3–37,7°C = febril (2) — febre (3) começa em 37,8°C.',
          },
        ],
        footer_rule: 'Sequência correta 2-4-1-5-3 → A',
      },
    ],
  },

  'furb-enfermagem-verificacao-de-sinais-vitais-1778969768866-3': {
    family: 'text_fragment',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — sons de Korotkoff: inflação interrompe fluxo · deflação produz sons auscultados',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mecanismo dos sons de Korotkoff',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Lacuna sobre sons produzidos na deflação do manguito durante PA.',
            icon: 'Target',
          },
          {
            label: 'Inflação do manguito',
            detail: 'Comprime artéria braquial e interrompe fluxo sanguíneo.',
            icon: 'Gauge',
          },
          {
            label: 'Deflação progressiva',
            detail: 'Quando PAS supera pressão do manguito, sangue turbulento gera sons.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — epônimos errados',
            detail: 'Bainbridge, Laplace e Galvani são conceitos de outras áreas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sons na deflação = Korotkoff',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler fragmento: inflação → interrupção do fluxo → deflação → sons auscultados.',
          'Completar lacuna: fenômeno acústico clássico da PA auscultatória.',
          'Testar B — Bainbridge: reflexo cardíaco — não sons de PA → eliminar.',
          'Testar C — Rochester: epônimo sem relação com PA → eliminar.',
          'Testar D — Laplace: lei física de pressão — não nome dos sons → eliminar.',
          'Testar E — Galvani: eletricidade muscular — não PA → eliminar.',
          'Testar A — Korotkoff: sons na deflação do manguito → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Sons auscultados na PA = Korotkoff → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica auscultatória',
        meta: slideMeta,
        content: 'INFLAÇÃO · DEFLAÇÃO · AUSCULTA',
        rows: [
          {
            label: 'Inflação',
            value: 'Manguito comprime braquial acima da sistólica estimada',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Deflação',
            value: 'Redução gradual até aparecerem os sons',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Sons de Korotkoff',
            value: 'Turbulência sanguínea auscultada pelo estetoscópio',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Lacuna do enunciado.',
          },
        ],
        footer_rule: 'Korotkoff = nome dos sons — não do aparelho',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EPÔNIMOS NA PA',
        items: [
          {
            label: 'Letra B — Bainbridge',
            detail: 'Reflexo cardíaco por distensão atrial.',
            correct: 'Bainbridge é reflexo fisiológico — não nomeia sons da ausculta de PA.',
          },
          {
            label: 'Letra C — Rochester',
            detail: 'Epônimo sem vínculo com semiologia de PA.',
            correct: 'Rochester não designa o fenômeno acústico da deflação do manguito.',
          },
          {
            label: 'Letra D — Laplace',
            detail: 'Lei da física sobre pressão em membranas.',
            correct: 'Laplace explica pressão em vasos — não é o nome dos sons de Korotkoff.',
          },
          {
            label: 'Letra E — Galvani',
            detail: 'Pioneiro em bioeletricidade muscular.',
            correct: 'Galvani relaciona-se a impulsos elétricos — não à ausculta de PA.',
          },
        ],
        footer_rule: 'Único epônimo dos sons de PA → A',
      },
    ],
  },

  'gama-enfermagem-verificacao-de-sinais-vitais-1778969729218-4': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — paciente crítico exige monitorização contínua de SV · PA seriada · FR nunca negligenciada',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV no paciente crítico — Cotriguaçu',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa CORRETA sobre avaliação de SV em paciente crítico.',
            icon: 'Target',
          },
          {
            label: 'Monitorização contínua FC',
            detail: 'Detecta instabilidade hemodinâmica precocemente.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — temperatura só com queixa',
            detail:
              'Aferir temperatura corporal apenas quando o paciente relata febre — monitorização passiva inadequada.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — PA única na admissão',
            detail: 'Crítico exige reavaliação seriada — não medida isolada.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — conduta sem escalonar',
            detail: 'Negligenciar FR ou aferir temperatura só com queixa — monitorização passiva errada.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Crítico = vigilância contínua dos SV',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinalar afirmativa CORRETA em paciente crítico.',
          'Testar A — PA só na admissão: insuficiente em crítico → eliminar.',
          'Testar B — FR pode ser negligenciada: conduta inaceitável → eliminar.',
          'Testar C — temperatura só com queixa: monitorização passiva errada → eliminar.',
          'Testar D — FC contínua para instabilidade hemodinâmica: conduta correta → candidata.',
          'Confirmar princípio de vigilância em terapia intensiva.',
          'Marcar D.',
        ],
        footer_rule: 'FC contínua no crítico → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vigilância SV',
        meta: slideMeta,
        content: 'PACIENTE CRÍTICO · MONITORIZAÇÃO',
        rows: [
          {
            label: 'FC',
            value: 'Monitorização contínua — detecta choque/taqui precoce',
            sv_kind: 'fc',
            badge: 'hot',
          },
          {
            label: 'PA',
            value: 'Aferição seriada — não apenas na admissão',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'FR',
            value: 'Parâmetro vital obrigatório — nunca negligenciar',
            sv_kind: 'fr',
            badge: 'ok',
          },
          {
            label: 'Temperatura',
            value: 'Aferir rotineiramente — não só com queixa febril',
            sv_kind: 'temp',
            badge: 'warn',
          },
        ],
        footer_rule: 'Crítico = todos os SV com frequência adequada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA NO CRÍTICO',
        items: [
          {
            label: 'Letra A — PA só na admissão',
            detail: 'Reduz vigilância hemodinâmica a um único momento.',
            correct: 'Paciente crítico exige PA seriada — uma medida na admissão é insuficiente.',
          },
          {
            label: 'Letra B — FR negligenciável',
            detail: 'Minimiza parâmetro respiratório.',
            correct: 'FR é sinal vital — alteração precoce de FR indica deterioração clínica.',
          },
          {
            label: 'Letra C — temperatura só com queixa',
            detail: 'Conduta reativa em vez de vigilância ativa.',
            correct: 'Temperatura deve ser monitorada rotineiramente — febre pode ser silenciosa.',
          },
        ],
        footer_rule: 'Monitorização contínua de FC → D',
      },
    ],
  },

  'gama-enfermagem-verificacao-de-sinais-vitais-1778969729218-5': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — pressão diferencial (pulso) = PAS − PAD · amplitude do pulso arterial',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pressão diferencial — Cotriguaçu',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Mecanismo fisiológico da pressão diferencial.',
            icon: 'Target',
          },
          {
            label: 'PAS − PAD',
            detail: 'Diferença entre sistólica e diastólica define amplitude do pulso.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — complacência vascular',
            detail: 'Altera curva de pressão, mas não define o conceito.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — resistência vascular',
            detail: 'Influencia PA, mas não é definição de pressão diferencial.',
            icon: 'Gauge',
          },
        ],
        footer_rule: 'Pressão diferencial = PAS − PAD',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: definir pressão diferencial.',
          'Testar B — complacência vascular: fator hemodinâmico, não definição → eliminar.',
          'Testar C — resistência vascular sistêmica: determina PA média, não diferencial → eliminar.',
          'Testar D — variação do volume cardíaco: débito cardíaco, não amplitude pressórica → eliminar.',
          'Testar A — diferença PAS e PAD: definição clássica → candidata.',
          'Confirmar: pulso pressórico = amplitude sistólico-diastólica.',
          'Marcar A.',
        ],
        footer_rule: 'PAS − PAD → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — componentes da PA',
        meta: slideMeta,
        content: 'SISTÓLICA · DIASTÓLICA · DIFERENCIAL',
        rows: [
          {
            label: 'PAS',
            value: 'Pressão na sístole ventricular',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'PAD',
            value: 'Pressão na diástole ventricular',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Pressão diferencial',
            value: 'PAS − PAD (amplitude do pulso)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Gabarito A.',
          },
        ],
        footer_rule: 'Amplitude = diferença entre picos pressóricos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONCEITOS HEMODINÂMICOS',
        items: [
          {
            label: 'Letra B — complacência vascular',
            detail: 'Rigidez arterial altera curva, mas não define o termo.',
            correct: 'Complacência influencia a forma da onda — definição é PAS menos PAD.',
          },
          {
            label: 'Letra C — resistência vascular sistêmica',
            detail: 'Determina PA média e pós-carga.',
            correct: 'Resistência vascular afeta níveis pressóricos — não é pressão diferencial.',
          },
          {
            label: 'Letra D — variação do volume cardíaco',
            detail: 'Relaciona-se a débito cardíaco.',
            correct: 'Volume ejetado por batimento é débito — diferencial é PAS − PAD.',
          },
        ],
        footer_rule: 'Definição clássica → A',
      },
    ],
  },

  'gama-enfermagem-verificacao-de-sinais-vitais-1779343811344-7': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — manguito cobre ~80% braço acima cotovelo · FR sem avisar paciente · FC 60 s se ritmo irregular',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica SV — Mauá da Serra',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro afirmativas sobre técnica de SV — identificar a correta.',
            icon: 'Target',
          },
          {
            label: 'FC — ritmo irregular',
            detail: 'Contar 60 segundos completos aumenta precisão.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — manguito abaixo do cotovelo',
            detail: 'Posição errada do manguito invalida a PA.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — avisar antes de contar FR',
            detail: 'Paciente altera padrão respiratório quando ciente.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Técnica correta fecha uma única letra',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre aferição de SV.',
          'Testar A — manguito abaixo da prega cubital: posição inadequada → eliminar.',
          'Testar B — axilar mais rápida/precisa que retal: invertido — retal é referência → eliminar.',
          'Testar C — informar paciente antes de contar FR: altera resultado → eliminar.',
          'Testar D — FC por 60 s em ritmo irregular: técnica correta → candidata.',
          'Confirmar: única assertiva tecnicamente válida é D.',
          'Marcar D.',
        ],
        footer_rule: 'Ritmo irregular → 60 s de FC → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica de aferição',
        meta: slideMeta,
        content: 'MANGUITO · FR · FC',
        rows: [
          {
            label: 'Manguito PA',
            value: 'Cobre ~80% do braço · acima da fossa cubital',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item A é falso.',
          },
          {
            label: 'FR',
            value: 'Contar sem comunicar ao paciente — evita alteração do padrão',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Item C é falso.',
          },
          {
            label: 'FC irregular',
            value: '60 segundos completos de contagem',
            sv_kind: 'fc',
            badge: 'ok',
            exam_hint: 'Item D é verdadeiro.',
          },
        ],
        footer_rule: 'Manguito errado e FR com aviso = pegadinhas A e C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA MULTI-SV',
        items: [
          {
            label: 'Letra A — manguito abaixo da prega cubital',
            detail: 'Posicionamento incorreto do manguito.',
            correct: 'Manguito deve cobrir ~80% do braço e ficar acima da fossa cubital — não abaixo.',
          },
          {
            label: 'Letra B — axilar mais precisa que retal',
            detail: 'Inverte hierarquia de precisão térmica.',
            correct: 'Temperatura retal reflete core com mais fidelidade — axilar é comum, mas não mais precisa.',
          },
          {
            label: 'Letra C — avisar antes de contar FR',
            detail: 'Paciente muda ritmo quando ciente da contagem.',
            correct: 'FR deve ser observada discretamente — comunicar altera o padrão respiratório.',
          },
        ],
        footer_rule: 'Só D respeita técnica de FC irregular',
      },
    ],
  },

  'gualimp-enfermagem-verificacao-de-sinais-vitais-1779344224014-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — fase I Korotkoff = aparecimento dos sons = PAS · fase V = desaparecimento = PAD',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Korotkoff e PAS — CL Gasparian',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Pressão sistólica determinada pela ausculta de qual fase.',
            icon: 'Target',
          },
          {
            label: 'Aparecimento dos sons',
            detail: 'Fase I de Korotkoff marca a pressão sistólica.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — desaparecimento',
            detail: 'Desaparecimento dos sons = diastólica (fase V) — não sistólica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — abafamento',
            detail: 'Fase intermediária — não define PAS nem PAD isoladamente.',
            icon: 'Activity',
          },
        ],
        footer_rule: '1º som = sistólica · último som = diastólica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: evento auscultatório que define pressão sistólica.',
          'Testar A — galope dos sons: fase inexistente na escala → eliminar.',
          'Testar C — abafamento: fase III — não marca sistólica → eliminar.',
          'Testar D — desaparecimento: fase V = diastólica → eliminar.',
          'Testar B — aparecimento dos sons: fase I = sistólica → candidata.',
          'Confirmar sequência Korotkoff clássica.',
          'Marcar B.',
        ],
        footer_rule: 'Aparecimento dos sons → PAS → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fases de Korotkoff',
        meta: slideMeta,
        content: 'FASE I · FASE V',
        rows: [
          {
            label: 'Fase I',
            value: 'Aparecimento dos sons = pressão sistólica',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Gabarito B.',
          },
          {
            label: 'Fase V',
            value: 'Desaparecimento dos sons = pressão diastólica',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Deflação',
            value: 'Velocidade lenta e gradual — não abrupta',
            sv_kind: 'pa',
            badge: 'ok',
          },
        ],
        footer_rule: 'Sistólica no 1º som — diastólica no silêncio final',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FASES KOROTKOFF',
        items: [
          {
            label: 'Letra A — galope dos sons',
            detail: 'Epíteto inexistente na classificação padrão.',
            correct: 'Não há fase "galope" em Korotkoff — sequência vai de I a V.',
          },
          {
            label: 'Letra C — abafamento dos sons',
            detail: 'Corresponde à fase III (sons abafados).',
            correct: 'Abafamento é fase intermediária — sistólica já foi marcada no aparecimento (fase I).',
          },
          {
            label: 'Letra D — desaparecimento dos sons',
            detail: 'Marca fim dos ruídos na deflação.',
            correct: 'Desaparecimento dos sons (fase V) define diastólica — não sistólica.',
          },
        ],
        footer_rule: 'PAS = 1º som audível → B',
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
    console.log(`[handcraft:sv-g13] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g13] total=${ok}`);
}

main();
