#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g16 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npm run handcraft:sinais-vitais-g16
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g16';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

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
    'dupla aferição PA',
    'monitorização SV hemodiálise',
    'classificação clínica multi-SV',
    'V/F técnica SV',
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
  'idecan-enfermagem-verificacao-de-sinais-vitais-1778969752567-4': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA pode ser aferida duas vezes com intervalo entre medidas · pulso apical obrigatório em arritmia',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Protocolo SV — descontrole metabólico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre aferição de SV e glicemia no contexto clínico.',
            icon: 'Target',
          },
          {
            label: 'Dupla aferição PA',
            detail: 'Duas medidas com intervalo entre elas aumenta acurácia — alternativa C.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — FR 30 s',
            detail: 'Letra A mistura oximetria com contagem parcial de FR.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — pulso apical',
            detail: 'Letra D dispensa apical em arritmia — técnica errada.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'PA dupla + intervalo = técnica MS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: protocolo correto de aferição SV/glicemia.',
          'Testar A — FR 30 s + oximetria: contagem incompleta → eliminar.',
          'Testar B — glicemia só em jejum noturno: restringe indevidamente → eliminar.',
          'Testar C — PA duas vezes com intervalo entre medidas: técnica MS → candidata.',
          'Testar D — dispensar pulso apical em arritmia: incorreto → eliminar.',
          'Testar E — não descartar 1ª gota glicemia: técnica errada → eliminar.',
          'Confirmar: única assertiva técnica correta é C.',
          'Marcar C.',
        ],
        footer_rule: 'Dupla PA com intervalo → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA e pulso',
        meta: slideMeta,
        content: 'AFERIÇÃO PADRONIZADA',
        rows: [
          { label: 'PA dupla', value: 'Duas medidas · intervalo entre aferições', sv_kind: 'pa', badge: 'hot' },
          { label: 'FR', value: 'Contar 1 min completo — não 30 s', sv_kind: 'fr', badge: 'ok' },
          { label: 'Arritmia', value: 'Pulso apical 60 s — não dispensar', sv_kind: 'fc', badge: 'hot' },
          { label: 'Glicemia capilar', value: 'Descartar 1ª gota · repetir se muito alta', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Dupla PA com intervalo confirma leitura fidedigna',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROTOCOLO IDECAN',
        items: [
          {
            label: 'Letra A — FR em 30 segundos',
            detail: 'Reduz tempo de observação respiratória.',
            correct: 'FR exige contagem de 1 minuto completo — 30 s subestima ou superestima o valor.',
          },
          {
            label: 'Letra B — glicemia só em jejum',
            detail: 'Limita monitorização do diabético.',
            correct: 'Glicemia capilar não se restringe ao jejum — monitorização conforme protocolo.',
          },
          {
            label: 'Letra D — dispensar pulso apical',
            detail: 'Ignora avaliação em arritmia.',
            correct: 'Arritmia ou instabilidade exige pulso apical 60 s — radial isolado é insuficiente.',
          },
          {
            label: 'Letra E — não descartar 1ª gota',
            detail: 'Técnica de glicemia capilar incorreta.',
            correct: 'Primeira gota deve ser descartada — técnica padrão de hemoglicoteste.',
          },
        ],
        footer_rule: 'PA 2× com intervalo → C',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1779343856589-8': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — hemodiálise: monitorar SV antes, durante e após · hipotensão intradialítica',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IRC em hemodiálise — monitor SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Insuficiência renal crônica em hemodiálise — ação prioritária de enfermagem para evitar complicações na sessão.',
            icon: 'Target',
          },
          {
            label: 'Monitorização SV',
            detail: 'Antes · durante · após diálise — detecta hipotensão e complicações.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — só peso pré',
            detail: 'Letra B limita avaliação ao peso antes da sessão.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — trocar cateter',
            detail: 'Letra C propõe troca de cateter a cada sessão.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'SV seriados na hemodiálise = prioridade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: insuficiência renal crônica · terapia de substituição renal · hemodiálise.',
          'Equipe de enfermagem monitora complicações na sessão de diálise.',
          'Testar A — orientação nutricional: importante, mas não é ação prioritária imediata → eliminar.',
          'Testar B — só peso pré: incompleto — ignora SV intradialíticos → eliminar.',
          'Testar C — trocar cateter cada sessão: conduta incorreta → eliminar.',
          'Testar E — diuréticos rotineiros: não é prioridade na sessão → eliminar.',
          'Testar D — monitorar SV antes/durante/após: padrão MS → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Monitor SV na diálise → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cuidado na HD',
        meta: slideMeta,
        content: 'HEMODIÁLISE · SINAIS VITAIS',
        rows: [
          { label: 'Monitorização', value: 'SV antes · durante · após sessão', sv_kind: 'meta', badge: 'hot' },
          { label: 'Peso pré-HD', value: 'Ultrafiltração — complementa, não substitui SV', sv_kind: 'meta', badge: 'ok' },
          { label: 'Hipotensão', value: 'Complicação frequente intradialítica', sv_kind: 'pa', badge: 'warn' },
          { label: 'Cateter', value: 'Não trocar a cada sessão — manter assepsia', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'PA e FC caem na HD — monitorar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IRC / HEMODIÁLISE',
        items: [
          {
            label: 'Letra A — orientação nutricional',
            detail: 'Conduta educativa de médio prazo.',
            correct: 'Nutrição é relevante na IRC, mas a prioridade na sessão é monitorar SV para prevenir colapso.',
          },
          {
            label: 'Letra B — apenas peso pré-sessão',
            detail: 'Reduz avaliação ao ganho hídrico.',
            correct: 'Peso pré é necessário, mas SV durante a HD detectam hipotensão — não substituem monitorização.',
          },
          {
            label: 'Letra C — trocar cateter cada sessão',
            detail: 'Procedimento invasivo desnecessário.',
            correct: 'Cateter de HD não é trocado rotineiramente — risco de infecção e trauma vascular.',
          },
          {
            label: 'Letra E — diuréticos rotineiros',
            detail: 'Fármaco inadequado para anúrico em HD.',
            correct: 'Paciente em HD geralmente não produz urina residual — diurético não é ação prioritária na sessão.',
          },
        ],
        footer_rule: 'SV seriados → D',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1779344237445-3': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — FC normocárdico 60–100 · FR 11 eupneia · PA 120×80 normotenso · hemoglicoteste alto = hiperglicemia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — indicadores de saúde',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Sinais vitais indicam estado de saúde e comunicação universal sobre gravidade da enfermidade.',
            icon: 'Target',
          },
          {
            label: 'FC da prova',
            detail: 'Frequência cardíaca dentro de 60–100 bpm = normocárdico → alternativa C.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — glicemia elevada',
            detail: 'Letra A chama hemoglicoteste muito alto em jejum de euglicemia.',
            icon: 'Droplet',
          },
          {
            label: 'Pegadinha — FR 11 taquipneia',
            detail: 'Letra B classifica FR normal como taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — PA 120×80 hipertensão',
            detail: 'Letra D eleva PA limítrofe a hipertensão.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Julgar cada parâmetro antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa com classificação SV correta.',
          'Testar A — hemoglicoteste muito elevado chamado de euglicemia: valor alto → eliminar.',
          'Testar B — FR 11 taquipneica: 11 < 12 = bradipneia leve, não taquipneia → eliminar.',
          'Testar C — frequência cardíaca normocárdica: dentro de 60–100 bpm → candidata.',
          'Testar D — PA 120×80 hipertensa: limítrofe/normal, não hipertensão → eliminar.',
          'Confirmar: única classificação correta é C.',
          'Marcar C.',
        ],
        footer_rule: 'FC normocárdica na faixa 60–100 → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO POR PARÂMETRO',
        rows: [
          { label: 'FC normocárdica', value: '60–100 bpm — alternativa C correta', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 11 irpm', value: 'Eupneia leve (12–20) — não taquipneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA 120×80', value: 'Normal / limítrofe — não hipertensão', sv_kind: 'pa', badge: 'ok' },
          { label: 'Hemoglicoteste alto', value: 'Hiperglicemia — não euglicemia', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Cada letra erra um parâmetro diferente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MULTI-SV IDECAN',
        items: [
          {
            label: 'Letra A — hemoglicoteste euglicêmico',
            detail: 'Classifica hiperglicemia como normal.',
            correct: 'Hemoglicoteste muito elevado em jejum é hiperglicemia — não euglicemia.',
          },
          {
            label: 'Letra B — FR 11 taquipneica',
            detail: 'Eleva FR abaixo de 12 a taquipneia.',
            correct: '11 irpm está abaixo de 12 — seria bradipneia leve, não taquipneia (> 20).',
          },
          {
            label: 'Letra D — PA 120×80 hipertensa',
            detail: 'Sobreclassifica pressão limítrofe.',
            correct: '120×80 mmHg enquadra normal/limítrofe na SBC — não hipertensão estágio 1.',
          },
        ],
        footer_rule: 'Só C classifica FC corretamente',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1779344237445-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — Korotkoff I = aparecimento = PAS · Korotkoff V = desaparecimento = PAD · pulso radial pré-PA',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — Korotkoff',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Item correto sobre técnica de medida da pressão arterial.',
            icon: 'Target',
          },
          {
            label: 'Fase I — aparecimento',
            detail: 'Primeiro som audível = pressão sistólica → alternativa B.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — pulso apical',
            detail: 'Letra A usa apical para pré-inflação — padrão é radial.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — fase V sistólica',
            detail: 'Letra C atribui desaparecimento dos sons à sistólica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — membro com fístula',
            detail: 'Letra D aferir em membro com fístula — contraindicado.',
            icon: 'Ban',
          },
        ],
        footer_rule: '1º som = sistólica · desaparecimento = diastólica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica correta de medida da PA.',
          'Testar A — pulso apical pré-inflação: técnica padrão usa radial → eliminar.',
          'Testar B — fase I = aparecimento dos sons = PAS: MS → candidata.',
          'Testar C — fase V = sistólica: inverte fases → eliminar.',
          'Testar D — PA em membro com fístula: contraindicado → eliminar.',
          'Confirmar sequência Korotkoff.',
          'Marcar B.',
        ],
        footer_rule: 'Aparecimento dos sons → PAS → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Korotkoff MS',
        meta: slideMeta,
        content: 'FASES · TÉCNICA',
        rows: [
          { label: 'Fase I', value: 'Aparecimento dos sons = pressão sistólica', sv_kind: 'pa', badge: 'hot' },
          { label: 'Fase V', value: 'Desaparecimento dos sons = pressão diastólica', sv_kind: 'pa', badge: 'hot' },
          { label: 'PA — pré-inflação radial', value: 'Inflar 20–30 mmHg acima do desaparecimento do pulso', sv_kind: 'pa', badge: 'ok' },
          { label: 'PA — membro', value: 'Evitar fístula · cateter · plegia no mesmo braço', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Sistólica no 1º som — não no silêncio final',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KOROTKOFF IDECAN',
        items: [
          {
            label: 'Letra A — pulso apical pré-inflação',
            detail: 'Usa local errado para estimar sistólica.',
            correct: 'Pré-inflação padrão: palpar pulso radial e inflar 20–30 mmHg acima do desaparecimento.',
          },
          {
            label: 'Letra C — fase V = sistólica',
            detail: 'Confunde fase de desaparecimento com aparecimento.',
            correct: 'Fase V marca diastólica (desaparecimento) — sistólica é fase I (aparecimento).',
          },
          {
            label: 'Letra D — PA em membro com fístula',
            detail: 'Aferir no braço com acesso hemodinâmico.',
            correct: 'Membro com fístula AV, cateter ou plegia é contraindicado para manguito — risco de trombose.',
          },
        ],
        footer_rule: 'Fase I = PAS → B',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1780066924385-4': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — termorregulação (calor produzido × perdido) · pernas cruzadas alteram PA · ciclo menstrual altera T · FC exige 60 s completos',
    roi_error: 'pa_posicao_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica e fisiologia SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas sobre SV — marcar apenas as corretas.',
            icon: 'Target',
          },
          {
            label: 'Item I — termorregulação',
            detail: 'T corpórea = calor produzido − calor perdido → VERDADEIRO.',
            icon: 'Thermometer',
          },
          {
            label: 'Item II — pernas cruzadas',
            detail: 'Posição das pernas altera PA sentado → FALSO afirmar que não interfere.',
            icon: 'Scale',
          },
          {
            label: 'Item III — flutuação térmica',
            detail: 'Mulheres têm variações cíclicas maiores de T → VERDADEIRO.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — item IV (pulso 30 s)',
            detail: '30 s isolados não equivalem a FC/min sem duplicar → FALSO.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'I e III verdadeiros · II e IV falsos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: analisar I, II, III e IV — combinar corretas.',
          'Julgar I — T = produção − perda de calor: fisiologia correta → VERDADEIRO.',
          'Julgar II — pernas não interferem na PA sentado: pernas cruzadas elevam PA → FALSO.',
          'Julgar III — mulheres com flutuações térmicas maiores: ciclo menstrual → VERDADEIRO.',
          'Julgar IV — 30 s de pulso = FC/min: exige 60 s ou duplicar 30 s → FALSO.',
          'Sequência: V · F · V · F.',
          'Eliminar B (II e IV), C (inclui IV), D (inclui II).',
          'Marcar A — I e III.',
        ],
        footer_rule: 'V F V F → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica e fisiologia',
        meta: slideMeta,
        content: 'DECORE — T · PA · FC',
        rows: [
          { label: 'Termorregulação', value: 'Calor produzido − calor perdido = T corpórea', sv_kind: 'temp', badge: 'ok' },
          { label: 'PA sentado', value: 'Pernas cruzadas elevam leitura — pés apoiados', sv_kind: 'pa', badge: 'hot' },
          { label: 'T feminina', value: 'Flutuações cíclicas maiores que homens', sv_kind: 'temp', badge: 'ok' },
          { label: 'FC / pulso', value: 'Contar 60 s completos — não 30 s isolados', sv_kind: 'fc', badge: 'hot' },
        ],
        footer_rule: 'Posição e tempo de contagem alteram SV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F IDECAN MANHUMIRIM',
        items: [
          {
            label: 'Letra B — II e IV',
            detail: 'Aceita pernas sem interferência e contagem de 30 s.',
            correct: 'Itens II e IV são falsos — pernas cruzadas alteram PA e FC exige 60 s completos.',
          },
          {
            label: 'Letra C — I, III e IV',
            detail: 'Inclui contagem parcial de pulso como correta.',
            correct: 'Item IV é falso — 30 s isolados não substituem 1 minuto de aferição de FC.',
          },
          {
            label: 'Letra D — II, III e IV',
            detail: 'Marca posição das pernas como irrelevante.',
            correct: 'Item II é falso — posicionamento das pernas interfere nos valores de PA.',
          },
        ],
        footer_rule: 'II (pernas) e IV (30 s) falsos → A',
      },
    ],
  },

  'idib-enfermagem-verificacao-de-sinais-vitais-1778934863952-9': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — PA fornece sistólica, diastólica e pressão de pulso · T retal mais próxima do core · FR 37 = taquipneia · FC 57 = bradicardia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Assertivas SV — IDIB Jaguaribe',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa correta sobre cuidados e verificação de SV.',
            icon: 'Target',
          },
          {
            label: 'PA e pressão de pulso',
            detail: 'Aferição PA revela sistólica, diastólica e PP → alternativa A.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — T retal',
            detail: 'Letra B inverte acurácia — retal reflete temperatura central.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — FR 37',
            detail: 'Letra C chama taquipneia de eupneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — FC 57',
            detail: 'Letra D confunde bradicardia com taquicardia.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Cada distrator erra um parâmetro diferente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assertiva correta sobre SV.',
          'Testar A — PA fornece sistólica, diastólica e pressão de pulso: conceito fisiológico → candidata.',
          'Testar B — T retal menos acurada que axilar: invertido — retal é referência central → eliminar.',
          'Testar C — FR 37 eupneico: 37 > 20 = taquipneia → eliminar.',
          'Testar D — FC 57 taquicárdico: 57 < 60 = bradicardia → eliminar.',
          'Confirmar: única assertiva correta é A.',
          'Marcar A.',
        ],
        footer_rule: 'PA sistólica + diastólica + PP → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação SV',
        meta: slideMeta,
        content: 'PARÂMETROS — ADULTO',
        rows: [
          { label: 'PA', value: 'Sistólica · diastólica · pressão de pulso (PS−PD)', sv_kind: 'pa', badge: 'hot' },
          { label: 'T retal', value: 'Mais próxima do core — não menos acurada', sv_kind: 'temp', badge: 'ok' },
          { label: 'FR 37 irpm', value: 'Taquipneia (> 20 irpm)', sv_kind: 'fr', badge: 'warn' },
          { label: 'FC abaixo de 60', value: 'Bradicardia — não taquicardia', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'Compare valor com faixa antes de classificar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IDIB JAGUARIBE',
        items: [
          {
            label: 'Letra B — T retal menos acurada',
            detail: 'Subestima temperatura central.',
            correct: 'Temperatura retal reflete núcleo corporal — é mais fiel que axilar, não menos.',
          },
          {
            label: 'Letra C — FR 37 eupneico',
            detail: 'Classifica taquipneia como normal.',
            correct: '37 irpm excede 20 — configura taquipneia, não eupneia (12–20 irpm).',
          },
          {
            label: 'Letra D — FC 57 taquicárdico',
            detail: 'Inverte bradi e taqui.',
            correct: 'FC abaixo de 60 configura bradicardia leve — não taquicardia (> 100 bpm).',
          },
        ],
        footer_rule: 'B, C e D erram classificação → A',
      },
    ],
  },

  'ieses-enfermagem-verificacao-de-sinais-vitais-1779343789998-3': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/COFEN — FC adulto 60–100 bpm · FR 12–20 irpm · T ~36–37,5 °C · PA < 120×80 normotenso',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Faixas normais — adulto saudável',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Qual opção descreve valor normal de referência para adulto saudável?',
            icon: 'Target',
          },
          {
            label: 'FC normocárdica',
            detail: '60–100 bpm em repouso — alternativa C.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — FR 30–40',
            detail: 'Letra A usa faixa taquipneica como normal.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — T 35 °C',
            detail: 'Letra B apresenta hipotermia como normal.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — PA 150/90',
            detail: 'Letra D usa hipertensão estágio 1 como normal.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Compare cada parâmetro com faixa MS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor normal de referência em adulto saudável.',
          'Testar A — FR 30–40: acima de 20 = taquipneia → eliminar.',
          'Testar B — T 35 °C: hipotermia — normal ~36–37,5 °C → eliminar.',
          'Testar C — FC 60–100 bpm: faixa normocárdica MS → candidata.',
          'Testar D — PA 150/90: hipertensão estágio 1 → eliminar.',
          'Confirmar: única faixa correta é C.',
          'Marcar C.',
        ],
        footer_rule: 'FC 60–100 bpm → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto MS',
        meta: slideMeta,
        content: 'VALORES NORMAIS — REPOUSO',
        rows: [
          { label: 'FC', value: '60–100 bpm — normocárdico', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR', value: '12–20 irpm — eupneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'Temperatura', value: '~36–37,5 °C axilar', sv_kind: 'temp', badge: 'ok' },
          { label: 'PA', value: '< 120×80 mmHg — normotenso', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Decore faixa antes de julgar alternativa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXAS IESES IBHASES',
        items: [
          {
            label: 'Letra A — FR 30–40 normal',
            detail: 'Faixa taquipneica apresentada como referência.',
            correct: 'FR normal adulto = 12–20 irpm — 30–40 configura taquipneia importante.',
          },
          {
            label: 'Letra B — T 35 °C normal',
            detail: 'Hipotermia como valor de referência.',
            correct: '35 °C é hipotermia — temperatura axilar normal situa-se em torno de 36–37,5 °C.',
          },
          {
            label: 'Letra D — PA 150/90 normal',
            detail: 'Hipertensão como normotenso.',
            correct: '150/90 mmHg enquadra hipertensão estágio 1 — não é valor normal de referência.',
          },
        ],
        footer_rule: 'Só C traz faixa FC correta',
      },
    ],
  },

  'ieses-enfermagem-verificacao-de-sinais-vitais-1779344105099-6': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'MS/COFEN — SV clássicos: temperatura · FC · FR · PA — monitorização regular na prática',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quais SV monitorar',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Principais sinais vitais monitorados regularmente na prática de enfermagem.',
            icon: 'Target',
          },
          {
            label: 'Quatro clássicos',
            detail: 'PA · FC · FR · temperatura — alternativa B.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — só temperatura',
            detail: 'Letra A restringe monitorização a um único parâmetro.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — FC no exercício',
            detail: 'Letra C limita a FC durante esforço — incompleto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — dor e inflamação',
            detail: 'Letra D mistura sinais clínicos com SV clássicos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'T · FC · FR · PA = núcleo da monitorização',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principais SV para monitorização regular.',
          'Testar A — somente temperatura: incompleto — ignora FC, FR e PA → eliminar.',
          'Testar B — PA, FC, FR e temperatura: quartet clássico MS → candidata.',
          'Testar C — só FC no exercício: restringe contexto e parâmetros → eliminar.',
          'Testar D — PA, dor, inflamação e FC: dor/inflamação não são SV clássicos → eliminar.',
          'Confirmar: lista completa e correta é B.',
          'Marcar B.',
        ],
        footer_rule: 'PA + FC + FR + T → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SV clássicos',
        meta: slideMeta,
        content: 'MONITORIZAÇÃO REGULAR',
        rows: [
          { label: 'Temperatura', value: 'Termorregulação · infecção · metabolismo', sv_kind: 'temp', badge: 'ok' },
          { label: 'FC / pulso', value: 'Perfusão · débito cardíaco', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR', value: 'Oxigenação · esforço respiratório', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA', value: 'Perfusão tecidual · volemia', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'SpO₂ e dor complementam — núcleo = T FC FR PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LISTA SV IESES GASPAR',
        items: [
          {
            label: 'Letra A — somente temperatura',
            detail: 'Monitorização uniparamétrica.',
            correct: 'Temperatura isolada não substitui avaliação de FC, FR e PA na rotina de enfermagem.',
          },
          {
            label: 'Letra C — FC só no exercício',
            detail: 'Restringe momento e parâmetros.',
            correct: 'Monitorização regular inclui os quatro SV em repouso — não apenas FC durante esforço.',
          },
          {
            label: 'Letra D — dor e inflamação',
            detail: 'Mistura achados clínicos com SV.',
            correct: 'Dor e sinais inflamatórios são avaliações clínicas — não compõem a lista clássica de SV.',
          },
        ],
        footer_rule: 'Quatro clássicos → B',
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
    console.log(`[handcraft:sv-g16] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g16] total=${ok}`);
}

main();
