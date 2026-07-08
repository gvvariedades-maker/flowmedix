#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g21 (8 slugs P0 vitals_pa_tecnica pos 161–168).
 *
 *   npm run handcraft:sinais-vitais-g21
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g21';
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
    'FR adulto 12–20 irpm',
    'PA normotenso',
    'SpO₂ ≥ 95%',
    'cinco sinais vitais COFEN',
    'hiato auscultatório',
    'monitoramento contínuo instabilidade',
    'classificação terminológica SV',
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
  family: 'vf' | 'conceito' | 'protocolo';
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
  'objetiva-concursos-enfermagem-verificacao-de-sinais-vitais-1779344105099-4': {
    family: 'vf',
    branch: 'vitals_interpretacao',
    guideline:
      'COFEN/MS — monitorar PA e FC a cada 5 min na anestesia · oximetria de pulso (SpO₂) como método quantitativo · avaliação circulatória contínua na anestesia geral',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'C/E — monitoramento na anestesia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Três assertivas sobre monitoramento na anestesia — marcar C ou E e achar a sequência correta.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — PA e FC 5/5 min',
            detail: 'PA e FC avaliadas pelo menos a cada 5 minutos — conduta correta → CERTO.',
            icon: 'Clock',
          },
          {
            label: 'Afirmativa II — pressão capilar e cor',
            detail:
              'Método quantitativo de oxigenação por pressão capilar e cor de unhas — inadequado → ERRADO.',
            icon: 'Wind',
          },
          {
            label: 'Afirmativa III — circulação na AG',
            detail:
              'Anestesia geral exige avaliação circulatória contínua (pulso, ausculta, oximetria) → CERTO.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — aceitar cor como oximetria',
            detail: 'Letra A marca item II como certo — observação subjetiva não substitui SpO₂.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'C - E - C → letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato C/E — julgar afirmativas I, II e III.',
          'Julgar I — PA e FC a cada 5 min na anestesia: monitoramento adequado → CERTO.',
          'Julgar II — pressão capilar e cor de unhas como oximetria quantitativa: subjetivo → ERRADO.',
          'Julgar III — avaliação circulatória contínua na anestesia geral: protocolo correto → CERTO.',
          'Sequência: C, E, C.',
          'Testar A — C-C-E: aceita oximetria subjetiva → eliminar.',
          'Testar B — E-E-C: rejeita monitoramento de PA/FC → eliminar.',
          'Testar D — E-C-C: inverte primeira assertiva → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'C-E-C na sequência I–III → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — monitoramento anestésico',
        meta: slideMeta,
        content: 'DECORE — OXIMETRIA QUANTITATIVA',
        rows: [
          { label: 'PA + FC', value: 'Avaliar pelo menos a cada 5 min na anestesia', sv_kind: 'meta', badge: 'ok' },
          { label: 'Oxigenação', value: 'Oximetria de pulso (SpO₂) — método quantitativo', sv_kind: 'meta', badge: 'hot' },
          { label: 'Circulação AG', value: 'Pulso, ausculta, PA invasiva ou oximetria contínua', sv_kind: 'meta', badge: 'ok' },
          { label: 'Não usar', value: 'Cor de unhas ou pressão capilar como único método', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'SpO₂ é o método quantitativo — não cor de extremidades',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E OBJETIVA ANESTESIA',
        items: [
          {
            label: 'Letra A — C - C - E',
            detail: 'Aceita pressão capilar e cor como oximetria adequada.',
            correct:
              'Segunda assertiva é errada — método quantitativo de oxigenação é oximetria de pulso, não avaliação subjetiva de cor.',
          },
          {
            label: 'Letra B — E - E - C',
            detail: 'Rejeita monitoramento de PA e FC a cada 5 min.',
            correct:
              'Primeira assertiva é certa — PA e FC devem ser avaliadas pelo menos a cada 5 minutos durante anestesia.',
          },
          {
            label: 'Letra D — E - C - C',
            detail: 'Marca monitoramento periódico de PA/FC como errado.',
            correct:
              'Item I é certo — a banca exige avaliação de PA e FC a cada 5 min, não pode ser marcado como errado.',
          },
        ],
        footer_rule: 'Só C combina C-E-C',
      },
    ],
  },

  'quadrix-enfermagem-verificacao-de-sinais-vitais-1779343883917-7': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'COFEN/MS — quatro sinais vitais clássicos: temperatura, pressão arterial, frequência respiratória e frequência cardíaca',
    roi_error: 'vitals_concept_generic_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro sinais vitais clássicos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Parâmetros monitorados rotineiramente pelo técnico de enfermagem em paciente hospitalizado.',
            icon: 'Target',
          },
          {
            label: 'Núcleo COFEN',
            detail: 'PA, FC, FR e temperatura corporal — alternativa C.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — exame laboratorial',
            detail: 'Letra A inclui hemoglobina e frequência urinária — não são SV clássicos.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — glicemia e SpO₂',
            detail: 'Letra B mistura glicemia capilar e saturação — complementares, não o quartetto base.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — invasivo avançado',
            detail: 'Letra E cita PVC e gasometria — monitorização crítica, não rotina do técnico.',
            icon: 'TrendingDown',
          },
        ],
        footer_rule: 'PA · FC · FR · temperatura',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinais vitais monitorados rotineiramente.',
          'Lembrar quartetto COFEN: PA, FC, FR, temperatura.',
          'Testar A — hemoglobina e frequência urinária: laboratorial/diurese → eliminar.',
          'Testar B — glicemia e SpO₂: parâmetros complementares → eliminar.',
          'Testar C — PA, FC, FR, temperatura: núcleo clássico → candidata.',
          'Testar D — saturação de potássio e reflexo pupilar: inventados → eliminar.',
          'Testar E — PVC e gasometria: invasivos de UTI → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Quatro clássicos → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — núcleo de SV',
        meta: slideMeta,
        content: 'DECORE — QUATRO CLÁSSICOS',
        rows: [
          { label: 'Pressão arterial', value: 'Sistólica e diastólica (mmHg)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Frequência cardíaca', value: 'Pulso / batimentos (bpm)', sv_kind: 'fc', badge: 'ok' },
          { label: 'Frequência respiratória', value: 'Ciclos respiratórios (irpm)', sv_kind: 'fr', badge: 'ok' },
          { label: 'Temperatura', value: 'Corporal (°C) — axilar, oral ou timpânica', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'SpO₂, glicemia e PVC são complementares — não o núcleo de 4',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÃO DE SV QUADRIX',
        items: [
          {
            label: 'Letra A — hemoglobina e diurese',
            detail: 'Inclui parâmetro laboratorial e débito urinário.',
            correct:
              'Hemoglobina é exame laboratorial e frequência urinária é balanço hídrico — não compõem os quatro sinais vitais clássicos.',
          },
          {
            label: 'Letra B — glicemia e SpO₂',
            detail: 'Substitui PA e FC por glicemia capilar.',
            correct:
              'Glicemia capilar e SpO₂ são monitorizações complementares — o núcleo clássico exige PA e FC, não glicemia.',
          },
          {
            label: 'Letra D — potássio e pupila',
            detail: 'Termos sem sentido clínico em SV.',
            correct:
              '"Saturação de potássio" não existe como sinal vital — reflexo pupilar é avaliação neurológica, não SV clássico.',
          },
          {
            label: 'Letra E — PVC e gasometria',
            detail: 'Parâmetros invasivos de terapia intensiva.',
            correct:
              'Pressão venosa central e gasometria arterial são de unidade crítica — rotina do técnico cobra PA, FC, FR e temperatura.',
          },
        ],
        footer_rule: 'Só C lista os quatro clássicos',
      },
    ],
  },

  'quadrix-enfermagem-verificacao-de-sinais-vitais-1779343919045-0': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — FR adulto 12–20 irpm · FC 60–100 bpm · PA normotenso · SpO₂ ≥ 95% · temperatura axilar ~36–37,5 °C',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso estável — qual SV alterado',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Paciente adulto estável: identificar o único sinal vital fora da normalidade entre cinco valores.',
            icon: 'Target',
          },
          {
            label: 'PA do caso',
            detail: 'Pressão dentro da faixa normotensa — parâmetro normal.',
            icon: 'Scale',
          },
          {
            label: 'FC e temperatura',
            detail: 'FC no limite inferior normal e temperatura afebril.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR elevada',
            detail: 'Acima de 20 irpm no adulto — taquipneia → gabarito E.',
            icon: 'Wind',
          },
          {
            label: 'SpO₂ adequada',
            detail: 'Saturação ≥ 95% — oxigenação preservada no caso.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'FR 25 irpm = taquipneia → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinal vital fora da normalidade no caso estável.',
          'Interpretar PA: normotensa no adulto → Testar letra A — pressão arterial → eliminar.',
          'Interpretar temperatura: afebril → Testar letra B — temperatura → eliminar.',
          'Interpretar SpO₂: ≥ 95% adequada → Testar letra C — saturação → eliminar.',
          'Interpretar FC: 60 bpm no limite inferior normal → Testar letra D — frequência cardíaca → eliminar.',
          'Interpretar FR: acima de 20 irpm → taquipneia → única alteração.',
          'Confirmar único parâmetro fora da faixa.',
          'Marcar E.',
        ],
        footer_rule: 'Taquipneia isolada → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'COMPARE CADA VALOR DO CASO',
        rows: [
          { label: 'FR adulto', value: '12–20 irpm — acima = taquipneia', sv_kind: 'fr', badge: 'hot' },
          { label: 'FC adulto', value: '60–100 bpm — limite inferior ainda normal', sv_kind: 'fc', badge: 'ok' },
          { label: 'PA adulto', value: 'Normotenso ~90–140 × 60–90 mmHg', sv_kind: 'pa', badge: 'ok' },
          { label: 'SpO₂', value: '≥ 95% em ar ambiente', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'FR > 20 irpm é a única alteração do caso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO QUADRIX FUABC',
        items: [
          {
            label: 'Letra A — pressão arterial',
            detail: 'PA aparentemente elevada à primeira vista.',
            correct:
              'Pressão dentro da faixa normotensa — não é o parâmetro fora da faixa neste caso.',
          },
          {
            label: 'Letra B — temperatura',
            detail: 'Febre é pegadinha clássica em SV.',
            correct:
              'Temperatura axilar afebril está dentro da normalidade neste caso.',
          },
          {
            label: 'Letra C — saturação',
            detail: 'SpO₂ abaixo de 95% seria alteração.',
            correct:
              'Saturação acima do corte de 95% é adequada — não é a resposta.',
          },
          {
            label: 'Letra D — frequência cardíaca',
            detail: 'FC no limite inferior pode confundir.',
            correct:
              'FC no limite inferior da faixa 60–100 bpm ainda é normocárdico.',
          },
        ],
        footer_rule: 'Só FR acima de 20 irpm está alterada',
      },
    ],
  },

  'quadrix-enfermagem-verificacao-de-sinais-vitais-1779343967847-6': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — PA < 90×60 hipotenso · FC > 100 taquicardia · FR > 20 taquipneia · SpO₂ < 95% dessaturação · glicemia normal',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Emergência DM/HAS — classificar SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Caso clínico: classificar PA, FC, FR, SpO₂ e glicemia na sequência correta.',
            icon: 'Target',
          },
          {
            label: 'PA do caso',
            detail: 'Pressão preservada — normotenso, não hipotenso.',
            icon: 'Scale',
          },
          {
            label: 'FC e FR alteradas',
            detail: 'Frequência cardíaca > 100 bpm e respiratória > 20 irpm.',
            icon: 'HeartPulse',
          },
          {
            label: 'SpO₂ baixa',
            detail: 'Saturação abaixo de 95% — dessaturação.',
            icon: 'Wind',
          },
          {
            label: 'Glicemia capilar',
            detail: 'Hemoglicoteste na faixa normal — sem hipoglicemia.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Normotenso · taqui · taqui · dessatura · glicemia ok → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar PA, FC, FR, SpO₂ e glicemia na ordem pedida.',
          'PA preservada acima do corte de hipotensão → normotenso.',
          'FC acima de 100 bpm → taquicárdico.',
          'FR acima de 20 irpm → taquipneico.',
          'SpO₂ abaixo de 95% → dessaturando.',
          'Glicemia capilar sem hipoglicemia → normal.',
          'Testar A — normocárdico e saturação normal: ignora alterações → eliminar.',
          'Testar D — hipotenso: PA não está baixa → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Sequência normotenso-taqui-taqui-dessatura-glicemia ok → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação integrada',
        meta: slideMeta,
        content: 'TRADUZA OS CINCO PARÂMETROS',
        rows: [
          { label: 'PA adulto', value: 'Normotenso ~90–140 × 60–90 mmHg', sv_kind: 'pa', badge: 'ok' },
          { label: 'FC adulto', value: 'Taquicardia > 100 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR adulto', value: 'Taquipneia > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'SpO₂ adulto', value: 'Dessaturação < 95%', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Hipotenso exige PAS < 90 mmHg',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO SES SP QUADRIX',
        items: [
          {
            label: 'Letra A — normocárdico e saturação normal',
            detail: 'Ignora FC elevada e SpO₂ baixa.',
            correct:
              'FC acima de 100 bpm é taquicardia e SpO₂ abaixo de 95% é dessaturação — não pode classificar como normocárdico nem saturação normal.',
          },
          {
            label: 'Letra B — saturação dentro da normalidade',
            detail: 'Aceita dessaturação como adequada.',
            correct:
              'Saturação abaixo de 95% caracteriza dessaturação — incompatível com "dentro da normalidade".',
          },
          {
            label: 'Letra D — hipotenso',
            detail: 'Sudorese e fraqueza sugerem choque.',
            correct:
              'Apesar dos sintomas, PAS acima de 90 mmHg não configura hipotensão na classificação da prova.',
          },
          {
            label: 'Letra E — hipoglicêmico',
            detail: 'DM descompensado com glicemia baixa.',
            correct:
              'Hemoglicoteste na faixa normal não caracteriza hipoglicemia — exigiria valor abaixo do corte de hipoglicemia.',
          },
        ],
        footer_rule: 'Só C fecha a sequência completa',
      },
    ],
  },

  'quadrix-enfermagem-verificacao-de-sinais-vitais-1779344196733-5': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'COFEN — cinco sinais vitais: temperatura, PA, FR, FC e escala de dor (5º sinal vital)',
    roi_error: 'vitals_concept_generic_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cinco sinais vitais — prescrição Tijucas',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Técnico em enfermagem conferiu prescrição do enfermeiro: mensurar sinais vitais de 3/3 h e comunicar alterações.',
            icon: 'Target',
          },
          {
            label: 'Plantão e prescrição',
            detail:
              'Unidade de saúde de Tijucas do Sul — horários 6 h, 9 h, 12 h… enfermeiro indicou os cinco sinais vitais.',
            icon: 'ClipboardList',
          },
          {
            label: 'Quinteto COFEN',
            detail:
              'Temperatura, PA, FR, FC e escore de dor — alternativa C.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — oximetria no lugar da dor',
            detail: 'Letra A troca escore de dor por oximetria como 5º sinal.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — glicemia capilar',
            detail: 'Letra B inclui glicemia — não é sinal vital clássico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — sem temperatura',
            detail: 'Letras D e E omitem temperatura do conjunto.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: '5º sinal = escore de dor, não SpO₂',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cinco sinais vitais da prescrição de enfermagem em Tijucas do Sul.',
          'Contexto: técnico conferiu prescrição do enfermeiro — mensurar de 3/3 h e comunicar alterações.',
          'Lembrar COFEN: temperatura, PA, FR, FC + escore de dor.',
          'Testar A — oximetria no 5º lugar: troca dor por SpO₂ → eliminar.',
          'Testar B — glicemia capilar: parâmetro metabólico → eliminar.',
          'Testar C — temp, PA, FR, FC, escore de dor: quinteto correto → candidata.',
          'Testar D — sem temperatura: incompleto → eliminar.',
          'Testar E — glicemia e sem temp: duplo erro → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Dor como 5º SV → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cinco SV COFEN',
        meta: slideMeta,
        content: 'DECORE — QUINTO SINAL',
        rows: [
          { label: '1º–4º', value: 'Temperatura · PA · FR · FC', sv_kind: 'meta', badge: 'ok' },
          { label: '5º sinal', value: 'Escala/escore de dor', sv_kind: 'meta', badge: 'hot' },
          { label: 'SpO₂', value: 'Complementar — não substitui dor no quinteto', sv_kind: 'meta', badge: 'warn' },
          { label: 'Glicemia', value: 'Monitorização metabólica — não SV clássico', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Prova Quadrix Tijucas: dor fecha o 5º lugar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CINCO SV TIJUCAS',
        items: [
          {
            label: 'Letra A — oximetria como 5º',
            detail: 'Substitui escore de dor por SpO₂.',
            correct:
              'Oximetria é monitorização respiratória complementar — o 5º sinal vital na COFEN é a avaliação da dor.',
          },
          {
            label: 'Letra B — glicemia capilar',
            detail: 'Inclui parâmetro glicêmico no lugar de PA.',
            correct:
              'Glicemia capilar não integra os cinco sinais vitais — faltam PA e FR do núcleo clássico.',
          },
          {
            label: 'Letra D — sem temperatura',
            detail: 'Lista oximetria, pulso, FC, FR e dor.',
            correct:
              'Temperatura corporal é um dos cinco sinais vitais — alternativa omite aferição térmica.',
          },
          {
            label: 'Letra E — glicemia e sem temp',
            detail: 'Oximetria e glicemia no lugar de temp e dor.',
            correct:
              'Faltam temperatura e escore de dor — glicemia capilar não substitui nenhum dos cinco SV.',
          },
        ],
        footer_rule: 'Só C lista os cinco corretos',
      },
    ],
  },

  'quadrix-enfermagem-verificacao-de-sinais-vitais-1780000468214-1': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — PA < 90×60 hipotenso · FC > 100 taquicardia · FR > 20 taquipneia · SpO₂ < 95% dessaturação · glicemia normal sem hipoglicemia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV na emergência — sequência correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Paciente com DM e HAS, dispneia, dor torácica e sudorese — classificar PA, FC, FR, SpO₂ e glicemia.',
            icon: 'Target',
          },
          {
            label: 'Achado pressórico',
            detail: 'Pressão arterial preservada — normotenso, não hipotensão.',
            icon: 'Scale',
          },
          {
            label: 'Ritmo e ventilação',
            detail: 'FC acima de 100 bpm e FR acima de 20 irpm — taquicardia com taquipneia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Oxigenação comprometida',
            detail: 'SpO₂ abaixo de 95% — dessaturação no caso.',
            icon: 'Wind',
          },
          {
            label: 'Glicemia capilar',
            detail: 'Hemoglicoteste na faixa normal — sem hipoglicemia.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Normotenso · taqui · taqui · dessatura · glicemia ok',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler caso: dispneia, dor torácica, sudorese — emergência com DM e HAS.',
          'PA preservada → normotenso (não hipotenso).',
          'FC > 100 bpm → taquicárdico.',
          'FR > 20 irpm → taquipneico.',
          'SpO₂ < 95% → dessaturando.',
          'Glicemia capilar normal → sem hipoglicemia.',
          'Testar A — normocárdico e saturação normal: ignora alterações → eliminar.',
          'Testar B — saturação dentro da normalidade: SpO₂ baixa → eliminar.',
          'Testar D — hipotenso: PA preservada → eliminar.',
          'Testar E — hipoglicêmico: glicemia normal → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Sequência completa → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cortes da prova',
        meta: slideMeta,
        content: 'CORTES PARA CLASSIFICAR',
        rows: [
          { label: 'PA adulto', value: 'Hipotenso: PAS < 90 mmHg', sv_kind: 'pa', badge: 'hot' },
          { label: 'FC adulto', value: 'Taquicardia > 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR adulto', value: 'Taquipneia > 20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'SpO₂ adulto', value: 'Dessaturação < 95%', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Classifique pelo número, não só pelo quadro clínico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO CLÍNICO QUADRIX',
        items: [
          {
            label: 'Letra A — normocárdico',
            detail: 'Classifica FC elevada como normal.',
            correct:
              'FC acima de 100 bpm é taquicardia — não normocardia, mesmo com PA preservada.',
          },
          {
            label: 'Letra B — SpO₂ normal',
            detail: 'Aceita dessaturação como adequada.',
            correct:
              'Saturação abaixo de 95% caracteriza dessaturação — incompatível com "dentro da normalidade".',
          },
          {
            label: 'Letra D — hipotenso',
            detail: 'Sudorese e fraqueza sugerem choque.',
            correct:
              'Apesar dos sintomas, PAS acima de 90 mmHg não configura hipotensão na classificação da prova.',
          },
          {
            label: 'Letra E — hipoglicêmico',
            detail: 'DM descompensado com glicemia baixa.',
            correct:
              'Hemoglicoteste na faixa normal não caracteriza hipoglicemia — exigiria valor abaixo do corte de hipoglicemia.',
          },
        ],
        footer_rule: 'Classifique pelo número, não só pelo quadro',
      },
    ],
  },

  'selecon-enfermagem-verificacao-de-sinais-vitais-1778969737311-7': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'COFEN — instabilidade hemodinâmica: monitoramento contínuo de SV · múltiplos parâmetros alterados exigem vigilância estreita',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Instabilidade — frequência de monitoramento',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Mulher na emergência com febre alta, dor abdominal, dificuldade respiratória e ITU — conduta de monitoramento dos sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Quadro clínico',
            detail:
              'Sonolenta, hipertensão não tratada, evolução de enfermagem com PA baixa, taquicardia, febre e dessaturação.',
            icon: 'Activity',
          },
          {
            label: 'PA hipotensa',
            detail: 'PAS abaixo de 90 mmHg — risco de choque séptico.',
            icon: 'Scale',
          },
          {
            label: 'FC · FR · temperatura',
            detail: 'Taquicardia, taquipneia e febre axilar ≥ 37,8 °C — resposta inflamatória.',
            icon: 'HeartPulse',
          },
          {
            label: 'SpO₂ baixa',
            detail: 'Saturação abaixo de 95% — hipoxemia relativa.',
            icon: 'Wind',
          },
          {
            label: 'Gabarito — monitoramento contínuo',
            detail: 'Vigilância estreita com registro frequente — alternativa A.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Instabilidade → monitoramento contínuo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta de enfermagem sobre monitoramento dos sinais vitais na emergência.',
          'Contexto: mulher com febre alta, dor abdominal, ITU e múltiplos SV alterados.',
          'Traduzir SV: hipotenso, taquicárdico, taquipneico, febril, dessaturando.',
          'Reconhecer gravidade: cinco parâmetros alterados simultaneamente.',
          'Testar B — monitoramento intermitente de rotina: intervalo longo demais → eliminar.',
          'Testar C — aferição espaçada de enfermaria estável: inadequado → eliminar.',
          'Testar D — vigilância horária sem continuidade: insuficiente → eliminar.',
          'Testar A — monitoramento contínuo com registro frequente: adequado → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Instabilidade → contínuo → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — frequência por gravidade',
        meta: slideMeta,
        content: 'MONITORAR CONFORME RISCO',
        rows: [
          { label: 'Paciente estável', value: 'SV em intervalos de rotina de enfermaria', sv_kind: 'meta', badge: 'ok' },
          { label: 'Paciente instável', value: 'Monitoramento contínuo — registro frequente', sv_kind: 'meta', badge: 'hot' },
          { label: 'Sinais de choque', value: 'PAS < 90, taquicardia, taquipneia, febre', sv_kind: 'meta', badge: 'warn' },
          { label: 'SpO₂ baixa', value: 'Dessaturação < 95% — reforça vigilância', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Quanto mais SV alterados, menor o intervalo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MONITORAMENTO SELECON',
        items: [
          {
            label: 'Letra B — monitoramento intermitente',
            detail: 'Intervalo de paciente estável em enfermaria.',
            correct:
              'Com hipotensão, taquicardia, febre e dessaturação, monitoramento intermitente de rotina subestima o risco — exige vigilância contínua.',
          },
          {
            label: 'Letra C — monitoramento não invasivo espaçado',
            detail: 'Rotina mínima de enfermaria.',
            correct:
              'Aferição espaçada é para paciente estável — cinco parâmetros alterados contraindicam intervalo longo entre mensurações.',
          },
          {
            label: 'Letra D — vigilância horária',
            detail: 'Parece frequente, mas não é contínuo.',
            correct:
              'Monitoramento de hora em hora ainda é intermitente — instabilidade hemodinâmica exige vigilância contínua com registro frequente.',
          },
        ],
        footer_rule: 'Gravidade do caso fecha A',
      },
    ],
  },

  'selecon-enfermagem-verificacao-de-sinais-vitais-1779343811344-0': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — hiato auscultatório: sons Korotkoff desaparecem e reaparecem · palpar braquial durante insuflação estima PAS e detecta o hiato',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hiato auscultatório — prevenção',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Fenômeno do hiato auscultatório — sons somem após o primeiro Korotkoff e reaparecem mais baixo.',
            icon: 'Target',
          },
          {
            label: 'Risco do hiato',
            detail: 'Subestima sistólica ou superestima diastólica se não identificado.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Conduta correta',
            detail:
              'Palpar braquial enquanto insufla para estimar PAS antes da ausculta — alternativa C.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — insuflar rápido',
            detail: 'Letra A: técnica de velocidade não previne hiato.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — manguito pequeno',
            detail: 'Letra B: manguito estreito eleva falsamente a PA.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Palpação braquial pré-ausculta → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: evitar erro do hiato auscultatório.',
          'Contexto: sons desaparecem e reaparecem — pode distorcer PAS/PAD.',
          'Testar A — insuflar rápido até 180: velocidade não detecta hiato → eliminar.',
          'Testar B — manguito menor: causa falsa hipertensão → eliminar.',
          'Testar C — palpar braquial na insuflação: estima PAS e identifica hiato → candidata.',
          'Testar D — bilateral com média: não é conduta específica do hiato → eliminar.',
          'Confirmar técnica MS.',
          'Marcar C.',
        ],
        footer_rule: 'Estimativa por palpação → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — hiato auscultatório',
        meta: slideMeta,
        content: 'DECORE — PALPAÇÃO PRÉ-AUSCULTA',
        rows: [
          { label: 'Hiato auscultatório', value: 'Sons somem após fase I e reaparecem', sv_kind: 'pa', badge: 'hot' },
          { label: 'PA — técnica', value: 'Estimar PAS por palpação braquial na insuflação', sv_kind: 'meta', badge: 'hot' },
          { label: 'PA — manguito', value: 'Tamanho inadequado eleva leitura falsamente', sv_kind: 'pa', badge: 'warn' },
          { label: 'PA — insuflação', value: 'Velocidade não substitui estimativa pré-ausculta', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Palpar antes de auscultar detecta o hiato',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIATO SELECON',
        items: [
          {
            label: 'Letra A — insuflar até 180 rapidamente',
            detail: 'Foca em velocidade e valor fixo de insuflação.',
            correct:
              'Insuflar rapidamente até 180 mmHg não identifica o hiato — a palpação da braquial durante insuflação estima a sistólica antes da ausculta.',
          },
          {
            label: 'Letra B — manguito menor',
            detail: 'Manguito estreito parece técnica de ajuste.',
            correct:
              'Manguito menor que o braço superestima a pressão — agrava erro de leitura, não previne hiato auscultatório.',
          },
          {
            label: 'Letra D — média bilateral',
            detail: 'Medida bilateral é boa prática geral.',
            correct:
              'Aferição bilateral com média é conduta de assimetria pressórica — não é a técnica específica para detectar hiato auscultatório.',
          },
        ],
        footer_rule: 'Palpação braquial na insuflação → C',
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
    console.log(`[handcraft:sv-g21] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g21] total=${ok}`);
}

main();
