#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g25 (SHORT LOTE: 4 slugs P0 vitals_pa_tecnica pos 193–196).
 * Fecha cluster vitals_pa_tecnica após g01–g24.
 *
 *   npm run handcraft:sinais-vitais-g25
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g25';
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
    'técnica de aferição PA',
    'repouso pré-PA 5 min',
    'artéria braquial sob manguito',
    'PA ortostática',
    'palpação pré-ausculta PA',
    'manguito por tamanho de braço',
    'fases de Korotkoff',
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
  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344127707-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — estimar PAS por palpação do pulso radial · aguardar 1 min · reinflar 10 mmHg até ultrapassar 20–30 mmHg da estimativa · manguito sobre braquial (não radial)',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — palpação pré-ausculta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'PA em doenças cerebrovasculares exige técnica adequada — assinalar alternativa correta sobre aferição.',
            icon: 'Target',
          },
          {
            label: 'Palpação radial',
            detail:
              'Inflar até desaparecer pulso radial → estimar sistólica · aguardar 1 min · reinflar de 10 em 10 mmHg — letra D.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — manguito na radial',
            detail:
              'Letra A: centraliza bolsa sobre artéria radial — sítio correto é braquial.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — Korotkoff invertido',
            detail:
              'Letra C: diastólica na fase I e sistólica na fase V — inverte fases MS.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — pós-exercício',
            detail:
              'Letra B: medir logo após atividade física — eleva PA transitória.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Palpação radial + reinflação gradual → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre técnica de aferição de PA.',
          'Contexto: medida fidedigna em paciente cerebrovascular exige protocolo MS.',
          'Testar A — manguito sobre radial com proporções erradas: artéria errada (braquial) → eliminar.',
          'Testar B — PA logo após exercício: valores não basais → eliminar.',
          'Testar C — diastólica fase I / sistólica fase V: Korotkoff invertido → eliminar.',
          'Testar E — braço abaixo do coração: posição incorreta → eliminar.',
          'Testar D — palpar radial, estimar PAS, aguardar 1 min, reinflar 10 mmHg: protocolo MS → candidata.',
          'Confirmar sequência de palpação pré-ausculta.',
          'Marcar D.',
        ],
        footer_rule: 'Estimativa palpatória → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — palpação e Korotkoff',
        meta: slideMeta,
        content: 'DECORE — ANTES DA AUSCULTA',
        rows: [
          { label: 'PA — estimativa sistólica', value: 'Inflar até sumir pulso radial · desinflar rápido', sv_kind: 'meta', badge: 'hot' },
          { label: 'PA — reinflação', value: 'Aguardar 1 min · +20–30 mmHg acima da estimativa', sv_kind: 'pa', badge: 'hot' },
          { label: 'Artéria alvo', value: 'Braquial sob manguito — radial só na estimativa', sv_kind: 'meta', badge: 'ok' },
          { label: 'Fase I Korotkoff', value: 'Primeiro som = pressão sistólica', sv_kind: 'pa', badge: 'ok' },
          { label: 'Fase V Korotkoff', value: 'Desaparecimento do som = pressão diastólica', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Não inverter fases I e V',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA PA VUNESP',
        items: [
          {
            label: 'Letra A — manguito sobre artéria radial',
            detail: 'Bolsa centralizada na radial — artéria errada para ausculta.',
            correct:
              'A bolsa de borracha deve comprimir a artéria braquial — centralizar na radial gera leitura incorreta mesmo quando as dimensões do manguito parecem adequadas.',
          },
          {
            label: 'Letra B — PA após atividade física',
            detail: 'Aferir logo após exercício para valores basais.',
            correct:
              'Atividade física recente eleva PA e FC — a medida basal exige repouso prévio, não aferição imediata pós-esforço.',
          },
          {
            label: 'Letra C — Korotkoff invertido',
            detail: 'Diastólica na fase I e sistólica na fase V com deflação rápida.',
            correct:
              'Fase I marca a sistólica e fase V a diastólica — inverter as fases e deflacionar rápido distorce a técnica auscultatória MS.',
          },
          {
            label: 'Letra E — braço abaixo do coração',
            detail: 'Membro inferior ao nível cardíaco com mão fechada.',
            correct:
              'Braço abaixo do coração eleva artificialmente a PA — posição correta é na altura do coração com antebraço apoiado.',
          },
        ],
        footer_rule: 'Palpação + reinflação gradual → D',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344158323-0': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — bexiga vazia antes da PA · repouso ≥5 min pós-atividade · manguito 2–3 cm acima fossa antecubital · rastrear ortostatismo em idoso/diabético',
    exam_vs_current:
      'Guideline atual prioriza bexiga vazia e repouso — banca marca PA em pé após 3 min em diabéticos/idosos como cuidado correto (rastreio ortostático)',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados na aferição de PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'É cuidado de enfermagem para a aferição da Pressão Arterial (PA):',
            icon: 'Target',
          },
          {
            label: 'PA ortostática',
            detail:
              'Medir PA em pé após 3 minutos em diabéticos e idosos — letra C.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — bexiga cheia',
            detail:
              'Letra A: bexiga cheia — distensão vesical eleva PA.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — pós-exercício',
            detail:
              'Letra B: aferir 5 min após atividade — intervalo curto demais.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — manguito alto',
            detail:
              'Letra D: 10 cm acima da fossa com folga — posicionamento incorreto.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Rastreio postural idoso/DM → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidado de enfermagem na aferição de PA.',
          'Lembrar: MS exige preparo e posição adequados.',
          'Testar A — bexiga cheia: distensão vesical altera PA → eliminar.',
          'Testar B — PA 5 min após exercício: repouso insuficiente → eliminar.',
          'Testar D — manguito 10 cm acima com folga: técnica inadequada → eliminar.',
          'Testar C — PA em pé após 3 min em diabético/idoso: rastreio ortostático → candidata.',
          'Confirmar cuidado específico para população de risco.',
          'Marcar C.',
        ],
        footer_rule: 'Ortostatismo em idoso/DM → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo e ortostatismo',
        meta: slideMeta,
        content: 'DECORE — CUIDADOS PRÉ-PA',
        rows: [
          { label: 'Bexiga', value: 'Vazia — distensão eleva PA', sv_kind: 'pa', badge: 'hot' },
          { label: 'Repouso', value: '≥5 min sentado · sem falar', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pós-exercício', value: 'Evitar aferir imediatamente', sv_kind: 'pa', badge: 'warn' },
          { label: 'Ortostatismo', value: 'PA sentado → em pé em idoso/diabético', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: '2–3 cm acima fossa antecubital · sem folga excessiva', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Bexiga cheia e folga no manguito = erros clássicos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CUIDADOS PA VUNESP',
        items: [
          {
            label: 'Letra A — bexiga cheia',
            detail: 'Certificar-se de que o paciente esteja com bexiga cheia.',
            correct:
              'Bexiga distendida eleva a pressão arterial — o cuidado correto é bexiga vazia, não cheia, antes da aferição.',
          },
          {
            label: 'Letra B — PA 5 min após exercício',
            detail: 'Iniciar aferição cinco minutos após atividade física.',
            correct:
              'Cinco minutos após exercício ainda não garante valores basais — MS recomenda repouso prolongado, não aferição precoce pós-esforço.',
          },
          {
            label: 'Letra D — manguito 10 cm com folga',
            detail: 'Colocar manguito 10 cm acima da fossa cubital deixando folga.',
            correct:
              'Manguito deve ficar 2–3 cm acima da fossa antecubital, justo sem folga — 10 cm com folga compromete a compressão arterial.',
          },
        ],
        footer_rule: 'Só C fecha rastreio ortostático',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344158323-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — manguito adequado: largura ~40% circunferência braquial · comprimento ~80% · medir circunferência do braço para escolher tamanho',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manguito — tamanho do braço',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Técnico novo pergunta sobre adequação do tamanho do braço ao esfigmomanômetro — afirmativa correta.',
            icon: 'Target',
          },
          {
            label: 'Manguitos variados',
            detail:
              'Existem manguitos para diferentes tamanhos de braço — medida verificável — letra D.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — obsoleto',
            detail:
              'Letra A: tamanho de braço não importa mais — conduta atual exige manguito proporcional.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — estetoscópio',
            detail:
              'Letra B: campânula do estetoscópio define precisão — quem varia é o manguito.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — medida total',
            detail:
              'Letra C: medir braço inteiro — usa-se circunferência braquial média.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Manguito proporcional ao braço → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: adequação do braço ao esfigmomanômetro.',
          'Regra MS: manguito pequeno/grande distorce PA — medir circunferência braquial.',
          'Testar A — tamanho obsoleto: incorreto, ainda é obrigatório → eliminar.',
          'Testar B — campânula do estetoscópio: equipamento errado para tamanho de braço → eliminar.',
          'Testar C — medir braço inteiro: método inadequado → eliminar.',
          'Testar E — aneroide sem critério: todos os manguitos exigem tamanho adequado → eliminar.',
          'Testar D — manguitos diferentes conforme braço: técnica correta → candidata.',
          'Confirmar escolha do garrote.',
          'Marcar D.',
        ],
        footer_rule: 'Circunferência braquial → manguito certo → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dimensionamento manguito',
        meta: slideMeta,
        content: 'DECORE — TAMANHO DO MANGUITO',
        rows: [
          { label: 'Medida', value: 'Circunferência do braço na altura do manguito', sv_kind: 'pa', badge: 'hot' },
          { label: 'Largura bolsa', value: '~40% da circunferência braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Comprimento', value: '~80% da circunferência — envolver braço', sv_kind: 'pa', badge: 'ok' },
          { label: 'Consequência', value: 'Manguito pequeno → PA falsamente alta', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Manguito errado = leitura errada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO VUNESP',
        items: [
          {
            label: 'Letra A — tamanho obsoleto',
            detail: 'Não se considera mais tamanho de braço na escolha.',
            correct:
              'Guidelines atuais reforçam manguito proporcional — ignorar tamanho do braço gera PA falsamente elevada ou baixa.',
          },
          {
            label: 'Letra B — campânula do estetoscópio',
            detail: 'Campânula maior ou menor define precisão conforme braço.',
            correct:
              'O estetoscópio ausculta Korotkoff — quem deve corresponder ao braço é o manguito/garrote, não a campânula.',
          },
          {
            label: 'Letra C — medir braço inteiro',
            detail: 'Medir braço em toda extensão para escolher garrote.',
            correct:
              'A referência é a circunferência braquial na altura do manguito — não o comprimento total do membro.',
          },
          {
            label: 'Letra E — aneroide sem critério',
            detail: 'Manguitos aneroides dispensam tamanho de braço.',
            correct:
              'Aneroides também exigem manguito adequado à circunferência — o tipo de manômetro não dispensa dimensionamento.',
          },
        ],
        footer_rule: 'Manguito certo para cada braço → D',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344196733-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — PA no braço: palpar e centralizar artéria braquial sob manguito · poplítea/femoral/carótida são outros sítios',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Artéria braquial — PA no braço',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Para aferir PA no braço: qual artéria palpar e centralizar sob o manguito?',
            icon: 'Target',
          },
          {
            label: 'Sítio correto',
            detail: 'Artéria braquial na fossa antecubital — letra C.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — poplítea',
            detail: 'Letra A: artéria do joelho — membro inferior.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — carótida',
            detail: 'Letra B: pulso cervical — não é PA braquial.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — pulmonar',
            detail: 'Letra E: vaso intratorácico — não palpável no braço.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'PA no braço = braquial → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: artéria a palpar e centralizar sob manguito no braço.',
          'Lembrar: esfigmomanômetro comprime artéria braquial na fossa antecubital.',
          'Testar A — poplítea: joelho, membro inferior → eliminar.',
          'Testar B — carótida: pescoço → eliminar.',
          'Testar D — femoral: virilha → eliminar.',
          'Testar E — pulmonar: intratorácica, não palpável no braço → eliminar.',
          'Testar C — braquial: sítio padrão de PA auscultatória → candidata.',
          'Confirmar anatomia do membro superior.',
          'Marcar C.',
        ],
        footer_rule: 'Braquial centralizada → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — artérias e PA',
        meta: slideMeta,
        content: 'DECORE — ONDE MEDIR PA NO BRAÇO',
        rows: [
          { label: 'Artéria alvo', value: 'Braquial — fossa antecubital', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: 'Bolsa centralizada sobre a braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Poplítea/femoral', value: 'Membros inferiores — outro contexto', sv_kind: 'meta', badge: 'warn' },
          { label: 'Carótida', value: 'Pulso central cervical — não PA braquial', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Palpar braquial antes de insuflar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ARTÉRIA VUNESP',
        items: [
          {
            label: 'Letra A — poplítea',
            detail: 'Artéria poplítea.',
            correct:
              'Poplítea fica na fossa poplítea do joelho — aferição de PA no braço exige artéria braquial centralizada sob o manguito.',
          },
          {
            label: 'Letra B — carótida',
            detail: 'Artéria carótida.',
            correct:
              'Carótida é pulso central no pescoço — não é o vaso comprimido pelo esfigmomanômetro no membro superior.',
          },
          {
            label: 'Letra D — femoral',
            detail: 'Artéria femoral.',
            correct:
              'Femoral é pulso da virilha em membro inferior — técnica de PA no braço usa braquial, não femoral.',
          },
          {
            label: 'Letra E — pulmonar',
            detail: 'Artéria pulmonar.',
            correct:
              'Artéria pulmonar circula no tórax entre coração e pulmões — não é palpável no braço para aferição de PA.',
          },
        ],
        footer_rule: 'Só braquial fecha PA no braço',
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
    console.log(`[handcraft:sv-g25] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g25] total=${ok}`);
}

main();
