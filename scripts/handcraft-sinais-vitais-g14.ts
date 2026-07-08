#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g14 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npm run handcraft:sinais-vitais-g14
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g14';
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
    'manguito 80% braço',
    'braço ao nível do coração',
    'classificação clínica multi-SV',
    'SBC classificação PA',
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
  'gualimp-enfermagem-verificacao-de-sinais-vitais-1779344224014-2': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — T axilar 36–37,5°C afebril · FC 60–100 normocárdico · FR 12–20 eupneia · PA < 120×80 normotenso',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — CAPS Gasparian',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'T 40°C · FR elevada · FC taquicárdica · PA baixa — traduzir cada parâmetro.',
            icon: 'Target',
          },
          {
            label: 'T 40°C',
            detail: 'Acima de 37,8°C: hipertermia (febre elevada).',
            icon: 'Thermometer',
          },
          {
            label: 'FR elevada',
            detail: 'Acima de 20 irpm: taquipneia — não bradipneia nem dispneia isolada.',
            icon: 'Wind',
          },
          {
            label: 'FC elevada',
            detail: 'Acima de 100 bpm: taquicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — PA baixa',
            detail: 'Pressão muito baixa: hipotensão — banca troca por hipertensão na letra A.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Traduza os quatro sinais antes de combinar a alternativa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: T 40°C · FR elevada · FC taquicárdica · PA hipotensa.',
          'T 40°C → hipertermia (não hipotermia nem hipopirexia).',
          'FR acima de 20 → taquipneia (não bradipneia).',
          'FC acima de 100 → taquicardia (não normocardia).',
          'PA baixa → hipotensão (não hipertensão).',
          'Testar A — hiperpirexia/dispneia/hipertensão: inverte T, FR e PA → eliminar.',
          'Testar B — hipotermia/normocardia: inverte temperatura e FC → eliminar.',
          'Testar D — hipopirexia/taquidispneia: termos errados para T e FR → eliminar.',
          'Combinação hipertermia + taquipneia + taquicardia + hipotensão → marcar C.',
        ],
        footer_rule: 'Quatro parâmetros alterados → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação por valor',
        meta: slideMeta,
        content: 'TRADUÇÃO CLÍNICA — ADULTO EM REPOUSO',
        rows: [
          { label: 'T > 37,8°C', value: 'Hipertermia', sv_kind: 'temp', badge: 'warn' },
          { label: 'FR > 20 irpm', value: 'Taquipneia', sv_kind: 'fr', badge: 'warn' },
          { label: 'FC > 100 bpm', value: 'Taquicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'PA baixa', value: 'Hipotensão', sv_kind: 'pa', badge: 'warn' },
          { label: 'Hiperpirexia', value: 'Reservada a febre extrema — acima de hipertermia comum', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Hiperpirexia exige febre extrema — 40°C é hipertermia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO GASPARIAN',
        items: [
          {
            label: 'Letra A — hiperpirexia e hipertensão',
            detail: 'Classifica T como hiperpirexia e PA como hipertensão.',
            correct: '40°C é hipertermia (não hiperpirexia) e PA baixa é hipotensão — A inverte dois parâmetros.',
          },
          {
            label: 'Letra B — hipotermia e normocardia',
            detail: 'Chama febre de hipotermia e taquicardia de normocardia.',
            correct: 'T 40°C é febre alta e FC acima de 100 é taquicardia — B nega as alterações reais.',
          },
          {
            label: 'Letra D — hipopirexia e taquidispneia',
            detail: 'Usa termos clínicos inadequados para temperatura e FR.',
            correct: 'Hipopirexia implica T baixa; taquidispneia não substitui taquipneia na combinação pedida.',
          },
        ],
        footer_rule: 'Hipertermia · taquipneia · taquicardia · hipotensão → C',
      },
    ],
  },

  'iaupe-enfermagem-verificacao-de-sinais-vitais-1779343956155-3': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — PA 170×100 mmHg hipertensão · FC 88 normocárdico · FR 16 eupneia · T 36,8°C normotérmico',
    roi_error: 'interpretacao_sv_errada',
    exam_vs_current:
      'Prova classifica 170×100 como estágio I; diretriz SBC atual pode enquadrar estágio II — slides seguem gabarito.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — enfermaria clínica médica',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'P 88 · R 16 · T 36,8 · PA 170×100 — identificar qual SV está alterado.',
            icon: 'Target',
          },
          {
            label: 'PA 170×100 mmHg',
            detail: 'Sistólica e diastólica elevadas — único parâmetro alterado.',
            icon: 'Scale',
          },
          {
            label: 'FC 88 bpm',
            detail: 'Dentro de 60–100: normocárdico — não taquisfigmia.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 16 irpm',
            detail: 'Dentro de 12–20: eupneia — não taquipneia nem bradipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — termo errado',
            detail: 'Taquisfigmia descreve pulso fraco fino — não FC elevada.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Só a PA está alterada — classifique antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: P 88 · R 16 · T 36,8 · PA 170×100 mmHg.',
          'FC 88 → normocárdico — descarta taquisfigmia (A).',
          'FR 16 → eupneia — descarta taquipneia (B) e bradipneia (E).',
          'T 36,8°C → normotérmico — nenhuma alteração térmica.',
          'PA 170×100 → hipertensão — única alteração significativa.',
          'Testar A — taquisfigmia: termo errado para FC normal → eliminar.',
          'Testar B — taquipneia: FR 16 está normal → eliminar.',
          'Testar D — estágio II: prova enquadra 170×100 como estágio I → eliminar.',
          'Testar E — bradipneia: FR normal → eliminar.',
          'Hipertensão estágio I → marcar C.',
        ],
        footer_rule: 'PA alterada · demais normais → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — painel do caso',
        meta: slideMeta,
        content: 'INTERPRETAÇÃO MULTI-SV',
        rows: [
          { label: 'PA 170×100', value: 'Hipertensão (prova: estágio I)', sv_kind: 'pa', badge: 'hot' },
          { label: 'FC 88 bpm', value: 'Normocárdico (60–100)', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR 16 irpm', value: 'Eupneia (12–20)', sv_kind: 'fr', badge: 'ok' },
          { label: 'T 36,8°C', value: 'Normotérmico', sv_kind: 'temp', badge: 'ok' },
          { label: 'Taquisfigmia', value: 'Pulso fino/fraco — não é sinônimo de taquicardia', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'Identifique qual parâmetro diverge da normalidade',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IAUPE CAMOCIM',
        items: [
          {
            label: 'Letra A — taquisfigmia',
            detail: 'Aplica termo de qualidade de pulso à FC.',
            correct: 'FC 88 é normocárdica — taquisfigmia descreve pulso filiforme, não frequência.',
          },
          {
            label: 'Letra B — taquipneia',
            detail: 'Eleva FR normal a patológica.',
            correct: 'FR 16 irpm está na faixa eupneica (12–20) — não é taquipneia.',
          },
          {
            label: 'Letra D — hipertensão estágio II',
            detail: 'Sobreclassifica a PA do enunciado.',
            correct: 'A banca enquadra 170×100 como estágio I — D excede a classificação cobrada.',
          },
          {
            label: 'Letra E — bradipneia',
            detail: 'Rebaixa FR normal.',
            correct: 'FR 16 não está abaixo de 12 irpm — não configura bradipneia.',
          },
        ],
        footer_rule: 'Única alteração = PA hipertensa → C',
      },
    ],
  },

  'iaupe-enfermagem-verificacao-de-sinais-vitais-1779344189558-3': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — T axilar em adultos · pulso radial (FC/ritmo/amplitude) · FR 23 taquipneia · PA 140×100 hipertensão',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica e interpretação SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas V/F sobre técnica e classificação de SV.',
            icon: 'Target',
          },
          {
            label: 'Item I — T axilar',
            detail: 'Via axilar não é exclusiva de crianças — adultos também → FALSO.',
            icon: 'Thermometer',
          },
          {
            label: 'Item II — pulso radial',
            detail: 'Palpação avalia FC, ritmo e amplitude → VERDADEIRO.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — item III (FR)',
            detail: 'R 23 irpm = taquipneia — banca chama de bradipneia → FALSO.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — item IV (PA)',
            detail: 'PA 140×100 = hipertensão — banca chama normotensão → FALSO.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Itens III e IV invertem classificação clínica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro assertivas V/F sobre SV.',
          'Julgar I — T axilar só crianças: adultos também usam axilar → FALSO.',
          'Julgar II — pulso radial (FC, ritmo, amplitude): técnica correta → VERDADEIRO.',
          'Julgar III — R 23 = bradipneia: 23 > 20 = taquipneia → FALSO.',
          'Julgar IV — PA 140×100 = normotensão: valores elevados → FALSO.',
          'Sequência: F · V · F · F.',
          'Eliminar A, C, D e E.',
          'Marcar B.',
        ],
        footer_rule: 'F V F F → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica e faixas',
        meta: slideMeta,
        content: 'DECORE NORMATIVO — T · FC · FR · PA',
        rows: [
          { label: 'T axilar', value: 'Indicada em adultos e pediatria', sv_kind: 'temp', badge: 'ok' },
          { label: 'Pulso radial', value: 'FC · ritmo · amplitude · 60 s', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 23 irpm', value: 'Taquipneia (> 20 irpm)', sv_kind: 'fr', badge: 'warn' },
          { label: 'PA 140×100', value: 'Hipertensão — não normotenso', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Bradipneia = FR < 12 · normotenso < 120×80',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F IAUPE BOM CONSELHO',
        items: [
          {
            label: 'Letra A — V F V F',
            detail: 'Aceita axilar exclusiva e PA normotensa.',
            correct: 'Itens I e IV são falsos — axilar não é só pediátrica e 140×100 é hipertensão.',
          },
          {
            label: 'Letra C — V V F V',
            detail: 'Marca item I verdadeiro e IV normotenso.',
            correct: 'Item I é falso — temperatura axilar também em adultos.',
          },
          {
            label: 'Letra D — F F V F',
            detail: 'Aceita R 23 como bradipneia.',
            correct: 'Item III é falso — 23 irpm é taquipneia, não bradipneia.',
          },
          {
            label: 'Letra E — V F F F',
            detail: 'Único V no pulso radial.',
            correct: 'Item II é o único V — E erra ao marcar I como verdadeiro.',
          },
        ],
        footer_rule: 'III (bradipneia) e IV (normotenso) falsos → B',
      },
    ],
  },

  'ibade-enfermagem-verificacao-de-sinais-vitais-1779343856589-1': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'SBC/MS — PA limítrofe 130–139 × 85–89 mmHg · ótima < 120×80',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificação PA — SBC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'PA limítrofe SBC — classificação solicitada.',
            icon: 'Target',
          },
          {
            label: 'PA sistólica elevada',
            detail: 'Sistólica 130–139 ou diastólica 85–89 → normal limítrofe.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — “normal”',
            detail: 'Letra A ignora limiar limítrofe — 135 já sai da faixa ótima.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — estágio 1',
            detail: 'Letra C antecipa hipertensão estágio I — valores limítrofes ainda não são HAS.',
            icon: 'TrendingUp',
          },
        ],
        footer_rule: 'Limítrofe ≠ normal simples — compare faixas SBC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: adulto · PA limítrofe SBC · classificação solicitada.',
          'Sistólica na faixa 130–139 → limítrofe.',
          'Diastólica na faixa 85–89 → limítrofe.',
          'Testar A — normal: valores acima do ótimo → eliminar.',
          'Testar C — grau I leve: ainda não atinge critério de HAS grau I → eliminar.',
          'Testar D — estágio II moderada: PA distante de 160×100 → eliminar.',
          'Testar E — estágio III grave: valores muito abaixo → eliminar.',
          'Normal limítrofe → marcar B.',
        ],
        footer_rule: 'Limítrofe SBC → normal limítrofe → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tabela SBC (adulto)',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO PA — SBC',
        rows: [
          { label: 'Normal sistólica', value: 'Faixa 120 a 129', sv_kind: 'pa', badge: 'ok' },
          { label: 'Normal diastólica', value: 'Faixa 80 a 84', sv_kind: 'pa', badge: 'ok' },
          { label: 'Limítrofe sistólica', value: 'Faixa 130 a 139', sv_kind: 'pa', badge: 'hot' },
          { label: 'Limítrofe diastólica', value: 'Faixa 85 a 89', sv_kind: 'pa', badge: 'hot' },
          { label: 'HAS grau I — sistólica', value: 'Faixa 140 a 159', sv_kind: 'pa', badge: 'warn' },
          { label: 'HAS grau I — pressão diast.', value: 'Faixa 90 a 99', sv_kind: 'pa', badge: 'warn' },
          { label: 'Caso da prova', value: 'Enquadra normal limítrofe', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Limítrofe ≠ normal ≠ grau I — compare faixas SBC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SBC RECIFE',
        items: [
          {
            label: 'Letra A — normal',
            detail: 'Trata limítrofe como normal ótimo.',
            correct: 'Valores limítrofes ultrapassam normal — enquadram normal limítrofe, não “normal” simples.',
          },
          {
            label: 'Letra C — hipertensão leve estágio 1',
            detail: 'Antecipa estágio 1 sem critério diastólico ≥ 90.',
            correct: 'Grau I exige ≥ 140/90 — limítrofe ainda não é HAS grau I.',
          },
          {
            label: 'Letra D — hipertensão moderada estágio 2',
            detail: 'Sobreclassifica valores moderados.',
            correct: 'Valores limítrofes estão longe de 160×100 — não é estágio 2.',
          },
          {
            label: 'Letra E — hipertensão grave estágio 3',
            detail: 'Classificação incompatível com os valores.',
            correct: 'PA limítrofe não configura crise hipertensiva nem estágio 3.',
          },
        ],
        footer_rule: 'Limítrofe ≠ normal ≠ grau I → B',
      },
    ],
  },

  'ibade-enfermagem-verificacao-de-sinais-vitais-1779343856589-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — braço ao nível do coração · pernas descruzadas · repouso 3–5 min · silêncio durante aferição',
    roi_error: 'braco_nivel_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo pré-PA — orientações',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Orientações ao paciente para PA fidedigna — assinalar a correta.',
            icon: 'Target',
          },
          {
            label: 'Posicionamento',
            detail: 'Braço ao nível do coração · sentado · pernas descruzadas no chão.',
            icon: 'Armchair',
          },
          {
            label: 'Pegadinha — pernas cruzadas',
            detail: 'Letra D pede pés cruzados — eleva PA artificialmente.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — conversar na aferição',
            detail: 'Letra E estimula fala — altera FR e pode elevar PA.',
            icon: 'MessageCircle',
          },
          {
            label: 'Repouso e bexiga',
            detail: 'A (5 min) e C (bexiga) são cuidados MS — mas B isola posicionamento exigido.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Posição do braço e pernas = eixo da pegadinha',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: orientações para PA fidedigna.',
          'Testar A — repouso 5 min: cuidado válido MS, mas não é a assertiva marcada → eliminar.',
          'Testar B — braço nível coração + pernas descruzadas: posicionamento MS → candidata.',
          'Testar C — esvaziar bexiga: cuidado recomendado, porém não é a assertiva correta → eliminar.',
          'Testar D — pés cruzados: técnica errada — eleva PA → eliminar.',
          'Testar E — conversar durante: altera resultado → eliminar.',
          'Confirmar: posicionamento correto é B.',
          'Marcar B.',
        ],
        footer_rule: 'Braço coração + pernas no chão → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo PA',
        meta: slideMeta,
        content: 'TÉCNICA PA — POSICIONAMENTO',
        rows: [
          { label: 'Braço', value: 'Ao nível do coração — apoiado', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pernas', value: 'Descruzadas · pés apoiados no chão', sv_kind: 'pa', badge: 'hot' },
          { label: 'Repouso', value: '3–5 min sentado antes (A é cuidado, mas B é gabarito)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Bexiga', value: 'Esvaziar reduz erro — C é cuidado MS válido', sv_kind: 'pa', badge: 'ok' },
          { label: 'Durante', value: 'Silêncio — não conversar (E errada)', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Pernas cruzadas falsificam PA — sempre descruzar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO PA IBADE',
        items: [
          {
            label: 'Letra A — repouso 5 minutos',
            detail: 'Cuidado MS válido, mas não fechou gabarito.',
            correct: 'Repouso é recomendado — porém a banca priorizou posicionamento de braço/pernas (B).',
          },
          {
            label: 'Letra C — esvaziar bexiga',
            detail: 'Conduta correta MS para reduzir erro.',
            correct: 'Bexiga cheia eleva PA — orientação válida, mas não é a alternativa exigida nesta questão.',
          },
          {
            label: 'Letra D — pés cruzados',
            detail: 'Posição que eleva pressão arterial.',
            correct: 'Pernas cruzadas comprimem vasos e falsificam PA — técnica incorreta.',
          },
          {
            label: 'Letra E — conversar durante aferição',
            detail: 'Estimula fala e altera parâmetros.',
            correct: 'Conversar eleva PA e FR — paciente deve permanecer em silêncio e repouso.',
          },
        ],
        footer_rule: 'Posicionamento B vence A/C nesta prova',
      },
    ],
  },

  'ibfc-enfermagem-verificacao-de-sinais-vitais-1778969745165-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — manguito: largura 40% circunferência braquial · comprimento 80–100% do braço',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tamanho do manguito — PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Dimensões corretas do manguito para aferição de PA.',
            icon: 'Target',
          },
          {
            label: 'Largura (bladder)',
            detail: '40% da circunferência braquial — padrão MS/IBFC.',
            icon: 'Ruler',
          },
          {
            label: 'Comprimento',
            detail: '80–100% do comprimento do braço — cobre artéria braquial.',
            icon: 'Maximize',
          },
          {
            label: 'Pegadinha — 50% largura',
            detail: 'Letra B troca 40% por 50% — manguito estreito demais.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 60% comprimento',
            detail: 'Letra C reduz comprimento mínimo a 60% — subdimensionado.',
            icon: 'Ban',
          },
        ],
        footer_rule: '40% largura · 80–100% comprimento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: tamanho adequado do manguito.',
          'Referência MS: largura 40% · comprimento 80–100%.',
          'Testar A — 40% × 80–100%: valores corretos → candidata.',
          'Testar B — 50% × 50–100%: largura errada → eliminar.',
          'Testar C — 40% × 60–100%: comprimento mínimo insuficiente → eliminar.',
          'Testar D — 45% × 80–100%: largura intermediária incorreta → eliminar.',
          'Confirmar: única combinação exata é A.',
          'Marcar A.',
        ],
        footer_rule: '40% + 80–100% → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — manguito PA',
        meta: slideMeta,
        content: 'DIMENSÕES DO MANGUITO',
        rows: [
          { label: 'Largura', value: '40% da circunferência braquial', sv_kind: 'pa', badge: 'hot' },
          { label: 'Comprimento', value: '80–100% do comprimento do braço', sv_kind: 'pa', badge: 'hot' },
          { label: 'Cobertura', value: 'Câmara inflável centrada sobre artéria braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Erro subdimensionado', value: 'PA falsamente elevada', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Manguito pequeno → PA artificialmente alta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO IBFC SES-SE',
        items: [
          {
            label: 'Letra B — 50% largura',
            detail: 'Amplia largura além do padrão 40%.',
            correct: 'Largura correta é 40% da circunferência — 50% não é o valor MS/IBFC.',
          },
          {
            label: 'Letra C — 60% comprimento mínimo',
            detail: 'Reduz cobertura do braço.',
            correct: 'Comprimento mínimo é 80% do braço — 60% subdimensiona o manguito.',
          },
          {
            label: 'Letra D — 45% largura',
            detail: 'Valor intermediário inventado.',
            correct: 'Não há faixa 45% na referência — largura padrão é 40%.',
          },
        ],
        footer_rule: 'Só A combina 40% × 80–100%',
      },
    ],
  },

  'ibfc-enfermagem-verificacao-de-sinais-vitais-1779343865210-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — manguito ≥ 2/3 circunferência · braço ao coração · pulso radial · Korotkoff I=sistólica · V=diastólica',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Condições padronizadas — PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre condições padronizadas de medida da PA.',
            icon: 'Target',
          },
          {
            label: 'Manguito',
            detail: 'Câmara inflável cobre ≥ 2/3 (≈ 80%) da circunferência → alternativa A.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — braço acima precórdio',
            detail: 'Letra B: braço deve estar ao nível do coração, não 45° acima.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — pulso poplíteo',
            detail: 'Letra C: palpação pré-inflação usa radial, não poplíteo.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — fase V sistólica',
            detail: 'Letra D: fase V = diastólica (desaparecimento), não sistólica.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Korotkoff · posição · manguito — três distratores clássicos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: condições padronizadas para medida da PA.',
          'Testar A — câmara ≥ 2/3 circunferência: MS → candidata.',
          'Testar B — braço 45° acima precórdio: posição errada → eliminar.',
          'Testar C — pulso poplíteo + 100 mmHg: técnica e valor errados → eliminar.',
          'Testar D — sistólica = fase V: inverte fases Korotkoff → eliminar.',
          'Confirmar: única assertiva técnica correta é A.',
          'Marcar A.',
        ],
        footer_rule: '2/3 circunferência → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA MS',
        meta: slideMeta,
        content: 'MANGUITO · POSIÇÃO · KOROTKOFF',
        rows: [
          { label: 'Manguito', value: 'Cobrir ≥ 2/3 (80%) da circunferência braquial', sv_kind: 'pa', badge: 'hot' },
          { label: 'Posição', value: 'Braço ao nível do coração — apoiado', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pré-insuflação', value: 'Radial · inflar 20–30 mmHg acima do desaparecimento', sv_kind: 'meta', badge: 'ok' },
          { label: 'Korotkoff I', value: 'Aparição — pressão sistólica', sv_kind: 'pa', badge: 'ok' },
          { label: 'Korotkoff V', value: 'Desaparecimento — pressão diastólica', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Sistólica = fase I · diastólica = fase V',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA IBFC CUIABÁ',
        items: [
          {
            label: 'Letra B — braço acima do precórdio',
            detail: 'Posiciona braço acima do nível cardíaco.',
            correct: 'MS exige braço ao nível do coração — elevação acima falsifica PA baixa.',
          },
          {
            label: 'Letra C — pulso poplíteo',
            detail: 'Usa artéria poplítea e inflação excessiva.',
            correct: 'Pré-inflação padrão: palpar radial e inflar 20–30 mmHg acima do desaparecimento do pulso.',
          },
          {
            label: 'Letra D — sistólica fase V',
            detail: 'Atribui fase V à pressão sistólica.',
            correct: 'Fase V marca diastólica (desaparecimento dos sons) — sistólica é fase I.',
          },
        ],
        footer_rule: 'Manguito 2/3 + Korotkoff correto → A',
      },
    ],
  },

  'ibfc-enfermagem-verificacao-de-sinais-vitais-1779343932809-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — braçadeira 2–3 cm acima da fossa cubital · esfigmomanômetro calibrado',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Posicionamento da braçadeira',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Onde posicionar a braçadeira durante aferição de PA.',
            icon: 'Target',
          },
          {
            label: 'Posição correta',
            detail: '2–3 cm acima da fossa cubital — centrada na artéria braquial.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — distância da fossa',
            detail: 'B–E aumentam a distância acima da fossa cubital — manguito fora do padrão MS.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Manguito — posição',
            detail: '2–3 cm acima da fossa cubital · cobrir ~80% do braço.',
            icon: 'Ruler',
          },
        ],
        footer_rule: '2–3 cm acima da fossa cubital — decore o intervalo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: posicionamento da braçadeira na PA.',
          'Referência MS: 2–3 cm acima da fossa cubital.',
          'Testar A — 2–3 cm: intervalo correto → candidata.',
          'Testar B — 3–5 cm: afasta demais → eliminar.',
          'Testar C — 5–6 cm: distância excessiva → eliminar.',
          'Testar D — 10 cm: completamente fora do padrão → eliminar.',
          'Testar E — 15 cm: distância incompatível → eliminar.',
          'Marcar A.',
        ],
        footer_rule: '2–3 cm fossa cubital → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posição manguito',
        meta: slideMeta,
        content: 'BRAÇADEIRA · FOSSA CUBITAL',
        rows: [
          { label: 'Posição', value: '2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'hot' },
          { label: 'Centro', value: 'Câmara inflável sobre artéria braquial', sv_kind: 'pa', badge: 'ok' },
          { label: '3–5 cm', value: 'Distância maior que MS — distrator B', sv_kind: 'pa', badge: 'warn' },
          { label: '10–15 cm', value: 'Afastamento crítico — D/E errados', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Muito acima da fossa cubital → leitura imprecisa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POSIÇÃO MANGUITO FAGIFOR',
        items: [
          {
            label: 'Letra B — 3 a 5 cm',
            detail: 'Amplia intervalo mínimo para 3 cm acima da fossa cubital.',
            correct: 'MS fixa manguito 2–3 cm acima da fossa — 3–5 cm afasta a câmara inflável do ponto correto.',
          },
          {
            label: 'Letra C — 5 a 6 cm',
            detail: 'Dobra distância mínima recomendada.',
            correct: '5–6 cm coloca a câmara inflável distante da artéria braquial.',
          },
          {
            label: 'Letra D — 10 cm',
            detail: 'Distância extrema acima da fossa.',
            correct: '10 cm invalida o posicionamento padrão sobre a artéria braquial.',
          },
          {
            label: 'Letra E — 15 cm',
            detail: 'Valor mais distante ainda.',
            correct: '15 cm é incompatível com técnica MS — manguito ficaria no terço proximal do braço.',
          },
        ],
        footer_rule: 'Intervalo MS = 2–3 cm → A',
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
    console.log(`[handcraft:sv-g14] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g14] total=${ok}`);
}

main();
