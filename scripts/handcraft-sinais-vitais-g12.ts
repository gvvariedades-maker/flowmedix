#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g12 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g12.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g12';
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
    'classificação clínica multi-SV',
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
  'fundatec-enfermagem-verificacao-de-sinais-vitais-1778969768866-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — T axilar 36–37,5°C afebril · FC 60–100 normocárdico · FR 12–20 eupneia · PA < 120×80 normotenso',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — adulto N Alvorada',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'T 37,2°C · FC 82 · FR 18 · PA 118×76 — classificar cada parâmetro.',
            icon: 'Target',
          },
          {
            label: 'Painel — todos normais',
            detail: 'Normotenso · afebril · normocárdico · eupneico — combinação E.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha — hipertermia e hipertensão',
            detail: 'Letra A inventa hipertensão e hipertermia onde há normotensão e afebril.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — FR diminuída',
            detail: 'Letra B chama eupneia (18 irpm) de frequência respiratória diminuída.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — FC acima do normal',
            detail: 'Letra C classifica normocárdico como taquicardia — confunde faixa 60–100 bpm.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Traduza os quatro sinais antes de combinar a alternativa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: adulto com T 37,2°C · FC normocárdica · FR 18 · PA normotensa.',
          'PA 118×76 → normotenso (não hipertenso nem hipotenso).',
          'T 37,2°C → afebril (não hipertermia).',
          'FC na faixa 60–100 → normocárdico (não taquicardia).',
          'FR 18 → eupneia (não bradipneia).',
          'Testar A — hipertermia e hipertensão: inverte T e PA → eliminar.',
          'Testar B — FR diminuída: 18 está normal → eliminar.',
          'Testar C — FC acima do normal: 82 está na faixa → eliminar.',
          'Testar D — PA abaixo do normal: 118×76 é normotenso → eliminar.',
          'Todos normais → marcar E.',
        ],
        footer_rule: 'Quatro parâmetros normais → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'PA · FC · FR · TEMPERATURA',
        rows: [
          { label: 'PA 118×76', value: 'Normotenso (< 120×80)', sv_kind: 'pa', badge: 'ok' },
          { label: 'T 37,2°C', value: 'Afebril / normotérmico', sv_kind: 'temp', badge: 'ok' },
          { label: 'FC', value: 'Normocárdico (60–100 bpm)', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR 18 irpm', value: 'Eupneico (12–20)', sv_kind: 'fr', badge: 'ok' },
          {
            label: 'Síntese',
            value: 'Todos os SV dentro da normalidade',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Alternativa E.',
          },
        ],
        footer_rule: '118×76 não é hipotensão — compare com faixa normotenso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO N ALVORADA',
        items: [
          {
            label: 'Letra A — hipertermia e hipertensão',
            detail: 'Classifica T e PA elevadas sem base no caso.',
            correct: '37,2°C é afebril e 118×76 é normotenso — A inventa alterações.',
          },
          {
            label: 'Letra B — FR diminuída',
            detail: 'Chama 18 irpm de bradipneia.',
            correct: 'FR 18 está na faixa eupneica (12–20) — não está diminuída.',
          },
          {
            label: 'Letra C — FC acima do normal',
            detail: 'Eleva FC normocárdica acima do limite.',
            correct: 'FC na faixa 60–100 bpm é normocárdico — não taquicardia.',
          },
          {
            label: 'Letra D — PA abaixo do normal',
            detail: 'Rebaixa PA normotenso a hipotensão.',
            correct: '118×76 é normotenso — não está abaixo dos valores normais.',
          },
        ],
        footer_rule: 'Nenhum parâmetro alterado → confirme E',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779343811344-3': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — quatro SV clássicos: FC · FR · PA · temperatura corpórea',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro sinais vitais básicos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Exame ocupacional — quais dados compõem os SV básicos.',
            icon: 'Target',
          },
          {
            label: 'FC',
            detail: 'Frequência cardíaca — batimentos por minuto.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR',
            detail: 'Frequência respiratória — ciclos por minuto.',
            icon: 'Wind',
          },
          {
            label: 'PA',
            detail: 'Pressão arterial sistólica × diastólica.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — antropometria',
            detail: 'Peso, altura e circunferência abdominal não são SV clássicos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Quatro clássicos: FC · FR · PA · temperatura',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: dados dos sinais vitais básicos no exame ocupacional.',
          'Testar A — FC + pulso + circunferência + altura: antropometria misturada → eliminar.',
          'Testar B — frequência auditória + peso: confunde exame auditivo → eliminar.',
          'Testar C — frequência pressórica + peso/altura: termo errado + antropometria → eliminar.',
          'Testar D — auditiva + pressórica + circunferência: inventa parâmetros → eliminar.',
          'Testar E — FC + FR + PA + temperatura: quatro SV clássicos → candidata.',
          'Confirmar: única lista correta é E.',
          'Marcar E.',
        ],
        footer_rule: 'FC · FR · PA · T → letra E',
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
            value: 'Peso · altura · circunferência · audição',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'Distratores A–D.',
          },
        ],
        footer_rule: 'Peso e altura são antropometria — não SV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LISTA DE SV',
        items: [
          {
            label: 'Letra A — circunferência e altura',
            detail: 'Mistura antropometria com FC e pulso.',
            correct: 'Circunferência abdominal e altura não são sinais vitais clássicos.',
          },
          {
            label: 'Letra B — frequência auditória',
            detail: 'Troca audição por FR.',
            correct: 'Frequência auditória não compõe os SV básicos — FR sim.',
          },
          {
            label: 'Letra C — frequência pressórica',
            detail: 'Usa termo inexistente e inclui peso.',
            correct: 'O termo correto é pressão arterial — peso não é SV.',
          },
          {
            label: 'Letra D — auditiva e circunferência',
            detail: 'Combina exame auditivo com antropometria.',
            correct: 'Audição e circunferência abdominal ficam fora dos quatro SV clássicos.',
          },
        ],
        footer_rule: 'Só E lista FC · FR · PA · temperatura',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779343845367-4': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — pulso: indicador+médio (não polegar) · FR: 60 s sem avisar paciente · manguito 2–3 cm acima fossa cubital · T axilar na concavidade',
    roi_error: 'polegar_no_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica multi-SV GHC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas sobre técnica de SV — julgar V ou F.',
            icon: 'Target',
          },
          {
            label: 'Item I — temperatura axilar',
            detail: 'Parte mais côncava da axila → medida mais precisa → VERDADEIRO.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — item II',
            detail: 'Polegar fixado no punho + pressão intensa → técnica errada → FALSO.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — item III',
            detail: 'FR contada em 30 s × 2 com paciente ciente → técnica inadequada → FALSO.',
            icon: 'Wind',
          },
          {
            label: 'Item IV — manguito PA',
            detail: 'Ajustado sem folgas · 2–3 cm acima da fossa cubital → VERDADEIRO.',
            icon: 'Ruler',
          },
        ],
        footer_rule: 'Item II = polegar no pulso · item III = FR sem discrição',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro assertivas V/F sobre técnica de SV.',
          'Julgar I — concavidade axilar na T: técnica correta → VERDADEIRO.',
          'Julgar II — polegar no punho + pressão intensa: polegar tem pulso próprio → FALSO.',
          'Julgar III — FR 30 s × 2: MS prefere 60 s sem alertar paciente → FALSO.',
          'Julgar IV — manguito 2–3 cm acima fossa cubital: MS → VERDADEIRO.',
          'Sequência: V · F · F · V.',
          'Eliminar A (III=V), B, D e E.',
          'Marcar C.',
        ],
        footer_rule: 'V F F V → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica SV',
        meta: slideMeta,
        content: 'PULSO · FR · MANGUITO · TEMPERATURA',
        rows: [
          {
            label: 'Pulso',
            value: 'Indicador + médio — nunca polegar (pulso próprio)',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Item II = F.',
          },
          {
            label: 'FR',
            value: 'Contar 60 s discretamente — paciente não deve saber',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Item III = F.',
          },
          {
            label: 'Manguito',
            value: '2–3 cm acima fossa cubital · sem folgas',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Item IV = V.',
          },
          {
            label: 'T axilar',
            value: 'Parte côncava da axila — contato íntimo',
            sv_kind: 'temp',
            badge: 'ok',
            exam_hint: 'Item I = V.',
          },
        ],
        footer_rule: 'Polegar no pulso e FR 30 s são os dois F da sequência',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F TÉCNICA GHC',
        items: [
          {
            label: 'Letra A — V F V F',
            detail: 'Aceita FR 30 s × 2 como correta.',
            correct: 'Item III é falso — contagem de FR exige discrição e preferência por 60 s.',
          },
          {
            label: 'Letra B — V V F F',
            detail: 'Marca polegar no pulso como verdadeiro.',
            correct: 'Item II é falso — polegar tem pulsação própria e distorce a leitura.',
          },
          {
            label: 'Letra D — F V V F',
            detail: 'Inverte temperatura axilar e manguito.',
            correct: 'Itens I e IV são verdadeiros — D erra ao marcar F na técnica axilar.',
          },
          {
            label: 'Letra E — F F V V',
            detail: 'Único V no manguito.',
            correct: 'Itens I e IV são V — E erra ao negar temperatura axilar correta.',
          },
        ],
        footer_rule: 'Polegar (II) e FR 30 s (III) falsos → confirme C',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779343845367-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — agitação pós-op: avaliar SV + oxigenação · comunicar enfermeiro · técnico não prescreve sedação',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Agitação pós-operatória — prioridade',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Confusão mental + agitação nas primeiras horas pós-op — ação prioritária.',
            icon: 'Target',
          },
          {
            label: 'Risco imediato',
            detail: 'Hipoxemia · hipotensão · sangramento — SV revelam instabilidade.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Oxigenação',
            detail: 'SpO₂ e padrão respiratório integram avaliação inicial.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — contenção',
            detail: 'Contenção física imediata sem avaliação — conduta restritiva prematura.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — sedação',
            detail: 'Técnico não administra sedativo por conta própria — escopo ilegal.',
            icon: 'ShieldAlert',
          },
        ],
        footer_rule: 'Avaliar → comunicar → escalar — nunca agir isolado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: pós-op precoce · confusão + agitação psicomotora.',
          'Testar A — contenção física imediata: restritiva sem avaliar causa → eliminar.',
          'Testar B — sedativo por conta própria: fora do escopo do técnico → eliminar.',
          'Testar C — SV + oxigenação + notificar enfermeiro: protocolo MS → candidata.',
          'Testar D — deixar sozinho: abandono e risco de queda → eliminar.',
          'Testar E — explicar firmemente: não trata causa fisiológica → eliminar.',
          'Confirmar: prioridade é avaliação objetiva + comunicação.',
          'Marcar C.',
        ],
        footer_rule: 'SV + oxigenação + escalar → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — conduta ante agitação',
        meta: slideMeta,
        content: 'AVALIAR · COMUNICAR · ESCALAR',
        rows: [
          {
            label: '1º passo',
            value: 'Aferir SV e oxigenação (SpO₂/FR)',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Alternativa C.',
          },
          {
            label: 'Comunicação',
            value: 'Notificar enfermeiro responsável imediatamente',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Contenção',
            value: 'Último recurso — após avaliação e ordem médica',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'A erra ao priorizar.',
          },
          {
            label: 'Sedação',
            value: 'Prescrição médica — técnico não administra por conta própria',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'B erra o escopo.',
          },
        ],
        footer_rule: 'Agitação pós-op exige dados objetivos antes de intervenção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AGITAÇÃO PÓS-OP',
        items: [
          {
            label: 'Letra A — contenção imediata',
            detail: 'Restringe sem investigar causa.',
            correct: 'Contenção é último recurso — primeiro avalie SV e oxigenação.',
          },
          {
            label: 'Letra B — sedativo por conta própria',
            detail: 'Técnico prescreve e administra sedação.',
            correct: 'Medicação sedativa exige prescrição — técnico não age autonomamente.',
          },
          {
            label: 'Letra D — deixar sozinho',
            detail: 'Aguarda acalmia sem supervisão.',
            correct: 'Agitação pós-op tem risco de queda e dessaturação — nunca abandonar.',
          },
          {
            label: 'Letra E — explicar firmemente',
            detail: 'Abordagem verbal como única conduta.',
            correct: 'Orientação verbal não substitui avaliação de SV e oxigenação.',
          },
        ],
        footer_rule: 'Avaliação objetiva antes de conter ou sedar → C',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779343919045-2': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA = pressão exercida pelo sangue contra parede das artérias (sistólica × diastólica)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Definição de pressão arterial',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'O que se espera saber ao medir a PA — conceito fisiológico.',
            icon: 'Target',
          },
          {
            label: 'PA — conceito',
            detail: 'Força do sangue contra a parede arterial durante o ciclo cardíaco.',
            icon: 'Scale',
          },
          {
            label: 'Artérias',
            detail: 'PA mede pressão no leito arterial — não venoso.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — veias',
            detail: 'Pressão venosa é parâmetro distinto — banca troca artéria por veia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — fluxo sanguíneo',
            detail: 'Débito cardíaco ≠ pressão arterial — banca troca fluxo por pressão.',
            icon: 'TrendingUp',
          },
          {
            label: 'Pegadinha — temperatura corpórea',
            detail: 'Temperatura corpórea é SV distinto — não confundir com definição de PA.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'PA = pressão contra artérias — não fluxo nem veias',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o que se espera saber ao medir PA.',
          'Testar A — pressão contra artérias: definição clássica → candidata.',
          'Testar B — pressão contra veias: leito venoso → eliminar.',
          'Testar C — fluxo na circulação: débito, não PA → eliminar.',
          'Testar D — fluxo à periferia: conceito hemodinâmico distinto → eliminar.',
          'Testar E — fluxo à pequena circulação: pulmonar, não PA sistêmica → eliminar.',
          'Confirmar: definição canônica é A.',
          'Marcar A.',
        ],
        footer_rule: 'Pressão sobre artérias → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — conceito PA',
        meta: slideMeta,
        content: 'DEFINIÇÃO · NOTAÇÃO · DISTINÇÕES',
        rows: [
          {
            label: 'PA',
            value: 'Pressão do sangue contra parede das artérias',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa A.',
          },
          {
            label: 'Notação',
            value: 'Sistólica × diastólica (mmHg)',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: '≠ Pressão venosa',
            value: 'Veias têm pressão muito menor — parâmetro distinto',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'B erra o leito.',
          },
          {
            label: '≠ Débito cardíaco',
            value: 'Fluxo (L/min) ≠ pressão (mmHg)',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'C, D e E confundem.',
          },
        ],
        footer_rule: 'PA mede pressão arterial — não volume nem fluxo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONCEITO PA',
        items: [
          {
            label: 'Letra B — parede das veias',
            detail: 'Troca artérias por veias.',
            correct: 'PA aferida no braço reflete pressão arterial sistêmica — não venosa.',
          },
          {
            label: 'Letra C — fluxo na circulação',
            detail: 'Confunde débito com pressão.',
            correct: 'Fluxo sanguíneo é débito cardíaco — PA é pressão sobre a parede arterial.',
          },
          {
            label: 'Letra D — fluxo à periferia',
            detail: 'Descreve hemodinâmica periférica, não definição de PA.',
            correct: 'PA mede pressão contra artérias — não o volume enviado à periferia.',
          },
          {
            label: 'Letra E — pequena circulação',
            detail: 'Circulação pulmonar — parâmetro distinto.',
            correct: 'PA sistêmica mede artérias do corpo — não circulação pulmonar.',
          },
        ],
        footer_rule: 'Artérias, não veias nem fluxo → A',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779343919045-3': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/COFEN — pulso apical: estetoscópio sobre ápice cardíaco · criança 3 anos · FC por ausculta',
    roi_error: 'polegar_no_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso apical — equipamento',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Criança 3 anos — pulso apical: qual instrumento.',
            icon: 'Target',
          },
          {
            label: 'Pulso apical',
            detail: 'Ausculta do 5º EIC esquerdo — conta batimentos cardíacos diretos.',
            icon: 'HeartPulse',
          },
          {
            label: 'Estetoscópio',
            detail: 'Permite auscultar sons cardíacos no ápice — equipamento correto.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — esfigmomanômetro',
            detail: 'Instrumento de PA — não mede FC apical.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — oxímetro',
            detail: 'Mede SpO₂ — não substitui contagem de FC apical.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Apical = ausculta no ápice → estetoscópio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: criança 3 anos · pulso apical solicitado.',
          'Pulso apical exige ausculta no ápice cardíaco.',
          'Testar A — esfigmomanômetro: mede PA, não FC apical → eliminar.',
          'Testar B — oxímetro de pulso: SpO₂, não ausculta cardíaca → eliminar.',
          'Testar C — estetoscópio: ausculta apical → candidata.',
          'Testar D — doppler: alternativa em adultos/obesos, não padrão pediátrico apical → eliminar.',
          'Testar E — sonar doppler: idem D → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Ausculta apical → estetoscópio → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC apical',
        meta: slideMeta,
        content: 'PULSO APICAL · EQUIPAMENTOS',
        rows: [
          {
            label: 'Pulso apical',
            value: 'Ausculta no ápice (5º EIC E) — conta 60 s',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Alternativa C.',
          },
          {
            label: 'Estetoscópio',
            value: 'Instrumento padrão para ausculta cardíaca',
            sv_kind: 'fc',
            badge: 'hot',
          },
          {
            label: 'Esfigmomanômetro',
            value: 'Mede PA — não FC apical',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'A erra.',
          },
          {
            label: 'Oxímetro',
            value: 'SpO₂ — complementar, não substitui apical',
            sv_kind: 'spo2',
            badge: 'warn',
            exam_hint: 'B erra.',
          },
        ],
        footer_rule: 'Apical ≠ radial — exige estetoscópio no ápice',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PULSO APICAL',
        items: [
          {
            label: 'Letra A — esfigmomanômetro',
            detail: 'Confunde PA com FC apical.',
            correct: 'Esfigmomanômetro mede pressão arterial — não ausculta batimentos no ápice.',
          },
          {
            label: 'Letra B — oxímetro de pulso',
            detail: 'Troca saturação por FC apical.',
            correct: 'Oxímetro mede SpO₂ — pulso apical exige estetoscópio no ápice.',
          },
          {
            label: 'Letra D — aparelho doppler',
            detail: 'Equipamento alternativo, não padrão da prova.',
            correct: 'Doppler pode auxiliar em casos especiais — estetoscópio é o instrumento clássico apical.',
          },
          {
            label: 'Letra E — sonar doppler',
            detail: 'Variante do doppler — mesmo erro de equipamento.',
            correct: 'Pulso apical pede ausculta direta — estetoscópio, não doppler.',
          },
        ],
        footer_rule: 'Estetoscópio no ápice → C',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779344111854-3': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — pulso: elasticidade, FC, ritmo, amplitude, tensão · PA frequente em cirurgia/trauma · pressão divergente = sistólica e diastólica afastadas',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — pulso · FR · PA Pinhal',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Aferição de pulso (elasticidade, frequência, ritmo, amplitude, tensão, homólogo) · padrão respiratório costal/toracoabdominal · PA em cirurgia · pressão convergente.',
            icon: 'Target',
          },
          {
            label: 'Item I — palpação pulso',
            detail:
              'Durante a aferição do pulso: elasticidade, frequência, ritmo, amplitude, tensão — comparar com lado homólogo → VERDADEIRO.',
            icon: 'HeartPulse',
          },
          {
            label: 'Item II — padrão respiratório',
            detail:
              'Costal superior (feminino) · toracoabdominal (masculino e crianças) — mecanismo de troca gasosa → VERDADEIRO.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — item III (conduta)',
            detail:
              'Medidas de PA prescindíveis em ferimentos graves/cirurgias — FALSO: comunicar alteração e monitorizar.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — item IV (diastólica)',
            detail:
              'Pressão convergente quando sistólica e diastólica afastadas — FALSO: nomenclatura invertida (divergente).',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Itens III e IV invertem conduta e nomenclatura PA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro assertivas V/F sobre SV.',
          'Julgar I — características do pulso + homólogo: técnica correta → VERDADEIRO.',
          'Julgar II — padrões respiratórios por sexo/idade: fisiologia → VERDADEIRO.',
          'Julgar III — PA dispensável em cirurgia/trauma: instabilidade exige monitorização → FALSO.',
          'Julgar IV — convergente quando afastadas: termo invertido (divergente) → FALSO.',
          'Sequência: V · V · F · F.',
          'Eliminar A, C, D e E.',
          'Marcar B.',
        ],
        footer_rule: 'V V F F → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pulso e PA',
        meta: slideMeta,
        content: 'PALPAÇÃO · MONITORIZAÇÃO · NOMENCLATURA',
        rows: [
          {
            label: 'Palpação pulso',
            value: 'Elasticidade · FC · ritmo · amplitude · tensão · homólogo',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Item I = V.',
          },
          {
            label: 'Padrão respiratório',
            value: 'Costal superior (F) · toracoabdominal (M/crianças)',
            sv_kind: 'fr',
            badge: 'ok',
            exam_hint: 'Item II = V.',
          },
          {
            label: 'PA em críticos',
            value: 'Frequente em cirurgia, trauma, anestesia — nunca prescindível',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item III = F.',
          },
          {
            label: 'Pressão divergente',
            value: 'Sistólica e diastólica muito afastadas — não “convergente”',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item IV = F.',
          },
        ],
        footer_rule: 'Convergente ≠ afastadas — IV inverte nomenclatura',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F PINHAL',
        items: [
          {
            label: 'Letra A — V F V V',
            detail: 'Aceita PA prescindível em cirurgia e pressão convergente errada.',
            correct: 'Itens III e IV são falsos — PA é essencial em cirurgia e afastamento é pressão divergente.',
          },
          {
            label: 'Letra C — V V F V',
            detail: 'Marca pressão convergente quando diastólica e sistólica afastadas.',
            correct: 'Item IV é falso — afastamento é pressão divergente, não convergente.',
          },
          {
            label: 'Letra D — F F V V',
            detail: 'Nega palpação com elasticidade, ritmo, amplitude, tensão e homólogo.',
            correct: 'Item I é verdadeiro — características do pulso e comparação homóloga estão corretas.',
          },
          {
            label: 'Letra E — F V V F',
            detail: 'Inverte palpação do pulso e nomenclatura de pressão convergente.',
            correct: 'Palpação com homólogo (I) é verdadeira — E erra ao negar a técnica de pulso.',
          },
        ],
        footer_rule: 'III (prescindível) e IV (convergente) falsos → confirme B',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779344178184-7': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — pulso radial adulto · FR 60 s · PA braço ao coração · dor: múltiplas escalas · febre: hidratação',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica SV — assertiva correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinale alternativa correta sobre cuidados na aferição de SV.',
            icon: 'Target',
          },
          {
            label: 'Pulso radial',
            detail: 'Local padrão para palpação de FC em adultos — artéria radial.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — FR 15 s',
            detail: 'Contagem em 15 s subestima precisão — MS prefere 60 s.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — cabeceira 30°',
            detail: 'PA padrão: sentado · braço ao coração — inclinação fixa não é requisito único.',
            icon: 'Armchair',
          },
          {
            label: 'Pegadinha — restringir líquidos',
            detail: 'Febre pede hidratação — não restrição oral automática.',
            icon: 'Droplets',
          },
        ],
        footer_rule: 'Radial · 60 s FR · braço coração — três eixos da pegadinha',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre aferição de SV.',
          'Testar A — FR em 15 s: tempo insuficiente → eliminar.',
          'Testar B — PA com cabeceira 30°: combinação não é padrão único MS → eliminar.',
          'Testar C — restringir líquidos na febre: conduta contrária → eliminar.',
          'Testar D — pulso radial em adultos: técnica padrão → candidata.',
          'Testar E — só escala visual analógica para dor: existem outras escalas → eliminar.',
          'Confirmar: única assertiva técnica correta é D.',
          'Marcar D.',
        ],
        footer_rule: 'Artéria radial no adulto → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica por parâmetro',
        meta: slideMeta,
        content: 'FC · FR · PA · TEMPERATURA · DOR',
        rows: [
          {
            label: 'Pulso adulto',
            value: 'Artéria radial — indicador + médio, 60 s',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Alternativa D.',
          },
          {
            label: 'FR',
            value: 'Contar 60 s · amplitude · ritmo · discrição',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'A erra com 15 s.',
          },
          {
            label: 'PA',
            value: 'Braço ao nível do coração · repouso 3–5 min',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'B erra cabeceira fixa.',
          },
          {
            label: 'Febre',
            value: 'Hidratação — não restringir líquidos automaticamente',
            sv_kind: 'temp',
            badge: 'warn',
            exam_hint: 'C erra conduta.',
          },
          {
            label: 'Dor',
            value: 'EVA · faces · numérica — múltiplas escalas válidas',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'E erra “somente”.',
          },
        ],
        footer_rule: 'FR 60 s · radial · hidratação na febre — decore os três F',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA FOZ DO IGUAÇU',
        items: [
          {
            label: 'Letra A — FR 15 segundos',
            detail: 'Contagem respiratória truncada.',
            correct: 'MS recomenda 60 s completos para FR — 15 s subestima irregularidades.',
          },
          {
            label: 'Letra B — cabeceira 30° + PA',
            detail: 'Fixa inclinação como requisito único.',
            correct: 'PA exige braço ao coração e repouso — cabeceira 30° não substitui posicionamento correto.',
          },
          {
            label: 'Letra C — restringir líquidos na febre',
            detail: 'Conduta de restrição hídrica.',
            correct: 'Febre aumenta perdas — hidratação é prioridade, não restrição oral automática.',
          },
          {
            label: 'Letra E — somente escala visual analógica',
            detail: 'Limita avaliação de dor a um único instrumento.',
            correct: 'Existem escalas numérica, de faces e comportamental — não só EVA.',
          },
        ],
        footer_rule: 'Radial padrão no adulto → confirme D',
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
    console.log(`[handcraft:sv-g12] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g12] total=${ok}`);
}

main();
