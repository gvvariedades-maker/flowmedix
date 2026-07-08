#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g19 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npm run handcraft:sinais-vitais-g19
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g19';
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
    'manguito proporcional',
    'membro contraindicado PA',
    'Korotkoff e deflação',
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
  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344105099-1': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — PA em membro superior; mastectomia e fístula AV contraindicam manguito no mesmo braço → usar membro oposto',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA — impedimentos no membro',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Impedimentos que obrigam aferir PA no membro oposto — não no braço afetado.',
            icon: 'Target',
          },
          {
            label: 'Mastectomia',
            detail: 'Retirada mamária com linfadenectomia — risco de linfedema com manguito.',
            icon: 'ShieldAlert',
          },
          {
            label: 'Fístula arteriovenosa',
            detail: 'Acesso hemodiálise — compressão pode trombosar o shunt.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — cateter cardíaco',
            detail: 'Letra A mistura mastectomia com cateter — cateter não é par clássico da prova.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — angioplastia',
            detail: 'Letra B inclui angioplastia — não é impedimento rotineiro de manguito.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mastectomia + fístula AV = membro oposto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: impedimentos que exigem PA no membro oposto.',
          'Testar A — mastectomia e cateter cardíaco: cateter não compõe o par clássico → eliminar.',
          'Testar B — fístula AV e angioplastia: angioplastia isolada não é critério → eliminar.',
          'Testar C — mastectomia e fístula arteriovenosa: ambos contraindicam manguito no membro → candidata.',
          'Testar D — fístula AV e cateterismo: omite mastectomia do par correto → eliminar.',
          'Confirmar par clínico clássico.',
          'Marcar C.',
        ],
        footer_rule: 'Mastectomia + fístula AV → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — contraindicações de manguito',
        meta: slideMeta,
        content: 'MEMBRO OPOSTO QUANDO',
        rows: [
          { label: 'Mastectomia', value: 'Risco linfedema — evitar manguito no lado operado', sv_kind: 'pa', badge: 'hot' },
          { label: 'Fístula AV', value: 'Não comprimir acesso de hemodiálise', sv_kind: 'pa', badge: 'hot' },
          { label: 'Plegia / amputação', value: 'Usar membro íntegro e simétrico', sv_kind: 'pa', badge: 'warn' },
          { label: 'Cateter central', value: 'Não é par típico com mastectomia nesta prova', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Proteger linfedema e fístula — braço oposto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IMPEDIMENTOS CONSULPLAN',
        items: [
          {
            label: 'Letra A — mastectomia e cateter cardíaco',
            detail: 'Troca fístula AV por cateter.',
            correct:
              'Cateter cardíaco não forma o par clássico com mastectomia — o impedimento correto é fístula arteriovenosa.',
          },
          {
            label: 'Letra B — fístula AV e angioplastia',
            detail: 'Inclui procedimento sem relação com manguito.',
            correct:
              'Angioplastia prévia não contraindica manguito rotineiramente — falta a mastectomia do par gabarito.',
          },
          {
            label: 'Letra D — fístula AV e cateterismo',
            detail: 'Omite mastectomia do conjunto.',
            correct:
              'Só fístula + cateterismo ignora mastectomia — gabarito exige mastectomia e fístula arteriovenosa juntas.',
          },
        ],
        footer_rule: 'Par mastectomia + fístula AV → C',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344105099-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — palpar PAS radial · inflar 20–30 mmHg acima da estimativa · manguito com folga · silêncio na aferição · repouso e bexiga vazia',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — inflação e preparo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Forma correta da aferição da pressão arterial em contexto de HAS.',
            icon: 'Target',
          },
          {
            label: 'Palpação radial prévia',
            detail: 'Estimar PAS e inflar 20–30 mmHg acima → alternativa B.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — manguito sem folga',
            detail: 'Letra A exige manguito sem folgas — técnica correta permite ajuste sem compressão excessiva.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — diálogo na aferição',
            detail: 'Letra C conversa durante o procedimento — silêncio e repouso são padrão.',
            icon: 'MessageCircle',
          },
          {
            label: 'Pegadinha — exercício melhora PA',
            detail: 'Letra D mistura cuidados corretos com afirmar que exercício melhora níveis pressóricos na hora.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Palpar radial → inflar +20–30 mmHg sobre PAS estimada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica correta de aferição da PA.',
          'Testar A — manguito sem folgas 4–6 cm acima da fossa: compressão excessiva → eliminar.',
          'Testar B — inflar 20–30 mmHg acima da PAS palpada no radial: MS → candidata.',
          'Testar C — dialogar durante aferição: conversa altera PA → eliminar.',
          'Testar D — bexiga/café/tabaco corretos, mas exercício melhora PA: segunda metade falsa → eliminar.',
          'Confirmar técnica de inflação.',
          'Marcar B.',
        ],
        footer_rule: 'Inflar +20–30 mmHg sobre PAS palpada → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sequência técnica PA',
        meta: slideMeta,
        content: 'DECORE — INFLAÇÃO · PREPARO',
        rows: [
          { label: 'PA — estimativa', value: 'PAS no pulso radial antes da insuflação', sv_kind: 'meta', badge: 'hot' },
          { label: 'PA — insuflação', value: '+20–30 mmHg acima da PAS estimada', sv_kind: 'pa', badge: 'hot' },
          { label: 'PA — manguito', value: '4–6 cm acima da fossa cubital com folga adequada', sv_kind: 'pa', badge: 'ok' },
          { label: 'PA — ambiente', value: 'Repouso 3–5 min · silêncio · bexiga vazia', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Silêncio e repouso — não conversar na aferição',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA CONSULPLAN',
        items: [
          {
            label: 'Letra A — manguito sem folgas',
            detail: 'Exige compressão excessiva do braço.',
            correct:
              'Manguito deve encaixar sem folgas excessivas, mas não apertado demais — “sem deixar folgas” distorce a técnica.',
          },
          {
            label: 'Letra C — dialogar na aferição',
            detail: 'Estimula conversa durante a medida.',
            correct:
              'Diálogo e estresse elevam PA — procedimento exige repouso e silêncio, não conversa ativa.',
          },
          {
            label: 'Letra D — exercício melhora PA',
            detail: 'Segunda metade da assertiva inverte fisiologia.',
            correct:
              'Preparo com bexiga vazia e sem café/tabaco está correto, mas exercício agudo eleva PA — não “melhora” a leitura.',
          },
        ],
        footer_rule: 'Inflação pós-palpação radial → B',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344152370-0': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — taquicardia = FC aumentada · apneia = ausência de respiração · normocárdico = FC normal · hipotenso = PA baixa',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — terminologia SV (I–IV)',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro definições I–IV sobre sinais vitais — marcar V ou F e achar a sequência correta.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — taquicardia',
            detail: 'FC aumentada — afirmar “diminuída” é FALSO.',
            icon: 'HeartPulse',
          },
          {
            label: 'Afirmativa II — apneia',
            detail: 'Ausência de respiração — definição correta → VERDADEIRO.',
            icon: 'Wind',
          },
          {
            label: 'Afirmativa III — normocárdico',
            detail: 'FC dentro da normalidade — definição correta → VERDADEIRO.',
            icon: 'Activity',
          },
          {
            label: 'Afirmativa IV — hipotenso',
            detail: 'PA sistêmica diminuída — definição correta → VERDADEIRO.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'I=F · II=V · III=V · IV=V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F — julgar afirmativas I, II, III e IV.',
          'Julgar I — taquicardia = FC diminuída: inverte conceito → FALSO.',
          'Julgar II — apneia = ausência de respiração: correto → VERDADEIRO.',
          'Julgar III — normocárdico = FC normal: correto → VERDADEIRO.',
          'Julgar IV — hipotenso = PA diminuída: correto → VERDADEIRO.',
          'Sequência: F, V, V, V.',
          'Eliminar B, C e D — só A combina I–IV corretamente.',
          'Marcar A.',
        ],
        footer_rule: 'F, V, V, V → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — termos clínicos',
        meta: slideMeta,
        content: 'DECORE — NOMENCLATURA SV',
        rows: [
          { label: 'Taquicardia', value: 'FC aumentada (> 100 bpm adulto)', sv_kind: 'fc', badge: 'hot' },
          { label: 'Apneia', value: 'Ausência de movimentos respiratórios', sv_kind: 'fr', badge: 'ok' },
          { label: 'Normocárdico', value: 'FC normal (60–100 bpm)', sv_kind: 'fc', badge: 'ok' },
          { label: 'Hipotenso', value: 'PA sistêmica diminuída', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Taquicardia ≠ FC baixa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F CONSULPLAN ISGH',
        items: [
          {
            label: 'Letra B — F, F, F, V',
            detail: 'Marca taquicardia e normocárdico como falsos.',
            correct:
              'Itens 2 e 3 são verdadeiros — apneia e normocárdico estão definidos corretamente.',
          },
          {
            label: 'Letra C — V, V, F, F',
            detail: 'Aceita taquicardia como FC diminuída.',
            correct:
              'Primeiro item é falso — taquicardia é frequência aumentada, não diminuída.',
          },
          {
            label: 'Letra D — V, F, V, F',
            detail: 'Inverte hipotenso e normocárdico.',
            correct:
              'Itens 3 e 4 são verdadeiros — normocárdico e hipotenso têm definições corretas no enunciado.',
          },
        ],
        footer_rule: 'Só 1ª assertiva é falsa → A',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344152370-1': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — T varia por sítio · alterações respiratórias (apneia/bradipneia/taquipneia/dispneia) · FC exige 60 s · deflação PA lenta e constante',
    exam_vs_current:
      'Item IV da prova cita deflação 2–4 mmHg/s — slides usam “deflação lenta” alinhada ao MS; gabarito II e IV',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'I–IV — técnica e fisiologia SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas sobre SV — marcar apenas as corretas.',
            icon: 'Target',
          },
          {
            label: 'Item I — temperatura',
            detail: 'T não é igual em todas as partes do corpo → FALSO.',
            icon: 'Thermometer',
          },
          {
            label: 'Item II — padrão respiratório',
            detail: 'Apneia, bradipneia, taquipneia e dispneia = alterações → VERDADEIRO.',
            icon: 'Wind',
          },
          {
            label: 'Item III — pulso 30 s',
            detail: '30 s isolados não substituem 1 min de FC → FALSO.',
            icon: 'HeartPulse',
          },
          {
            label: 'Item IV — deflação PA',
            detail: 'Abrir válvula com deflação lenta e constante do manguito → VERDADEIRO.',
            icon: 'Stethoscope',
          },
        ],
        footer_rule: 'II e IV verdadeiros',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: analisar I, II, III e IV.',
          'Julgar I — T igual em todo o corpo: varia axilar/retal/auricular → FALSO.',
          'Julgar II — apneia/bradipneia/taquipneia/dispneia são alterações respiratórias → VERDADEIRO.',
          'Julgar III — 30 s de pulso = FC normal: exige 60 s ou duplicar → FALSO.',
          'Julgar IV — deflação lenta e constante após inflar manguito: técnica MS → VERDADEIRO.',
          'Corretas: II e IV.',
          'Eliminar A (só II), B (I e III falsos), D (inclui I falso).',
          'Marcar C.',
        ],
        footer_rule: 'II e IV → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica multi-SV',
        meta: slideMeta,
        content: 'DECORE — T · FR · FC · PA',
        rows: [
          { label: 'Temperatura', value: 'Varia conforme sítio de aferição', sv_kind: 'temp', badge: 'ok' },
          { label: 'Alterações FR', value: 'Apneia · bradipneia · taquipneia · dispneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'FC / pulso', value: 'Contar 60 s completos — não 30 s isolados', sv_kind: 'fc', badge: 'hot' },
          { label: 'Deflação PA', value: 'Válvula aberta — velocidade lenta e constante', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Tempo e velocidade de deflação importam',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — I–IV CONSULPLAN HRSC',
        items: [
          {
            label: 'Letra A — apenas II',
            detail: 'Omite deflação correta da PA.',
            correct:
              'Item IV também é verdadeiro — deflação lenta e constante do manguito é técnica correta de aferição.',
          },
          {
            label: 'Letra B — I e III',
            detail: 'Inclui temperatura uniforme e contagem de 30 s.',
            correct:
              'Itens I e III são falsos — temperatura varia por sítio e FC exige um minuto completo.',
          },
          {
            label: 'Letra D — I, II e IV',
            detail: 'Aceita temperatura igual em todo o corpo.',
            correct:
              'Item I é falso — temperatura corporal não é a mesma em axila, retal e oral.',
          },
        ],
        footer_rule: 'II + IV verdadeiros → C',
      },
    ],
  },

  'instituto-evo-enfermagem-verificacao-de-sinais-vitais-1778969737311-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'SBC — PA ideal adulto < 120×80 mmHg · idosa pode ter alvo menos rígido em provas locais',
    exam_vs_current:
      'Prova cita 134×84 mmHg como ideal em idosa — acima do alvo SBC atual (< 120×80); slides seguem gabarito B',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA ideal — mulher idosa',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Valor de PA ideal aproximado para mulher idosa — comparar com hipertensão e hipotensão.',
            icon: 'Target',
          },
          {
            label: 'Gabarito da prova',
            detail: '134×84 mmHg — limítrofe/alta-normal aceita pela banca → B.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — 190/70',
            detail: 'Letra A: sistólica muito elevada — hipertensão estágio 2.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 100/50',
            detail: 'Letra C: pressão baixa — hipotensão.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — 90/50',
            detail: 'Letra D: hipotensão acentuada.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Eliminar hipertensão e hipotensão extremas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: PA ideal para mulher idosa.',
          'Testar A — 190/70 mmHg: sistólica muito alta → eliminar.',
          'Testar B — 134/84 mmHg: valores moderados, aceitos como “ideais” pela banca → candidata.',
          'Testar C — 100/50 mmHg: hipotensão → eliminar.',
          'Testar D — 90/50 mmHg: hipotensão severa → eliminar.',
          'Confirmar faixa intermediária.',
          'Marcar B.',
        ],
        footer_rule: '134×84 mmHg → B (gabarito da prova)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação PA',
        meta: slideMeta,
        content: 'COMPARE SISTÓLICA E DIASTÓLICA',
        rows: [
          { label: 'Ideal SBC', value: '< 120×80 mmHg (adulto)', sv_kind: 'pa', badge: 'ok' },
          { label: '134×84', value: 'Limítrofe/normal-alta — gabarito Evo', sv_kind: 'pa', badge: 'hot' },
          { label: '≥ 140×90', value: 'Hipertensão estágio 1', sv_kind: 'pa', badge: 'warn' },
          { label: '< 90×60', value: 'Hipotensão — eliminar em “ideal”', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Prova × SBC: registrar divergência em content_review',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA IDOSA EVO',
        items: [
          {
            label: 'Letra A — 190/70 mmHg',
            detail: 'Sistólica em nível hipertensivo.',
            correct:
              '190 mmHg é hipertensão grave — não pode ser “ideal” em nenhum contexto clínico.',
          },
          {
            label: 'Letra C — 100/50 mmHg',
            detail: 'Pressão baixa com diastólica reduzida.',
            correct:
              '100×50 configura hipotensão relativa — não é alvo pressórico ideal.',
          },
          {
            label: 'Letra D — 90/50 mmHg',
            detail: 'Hipotensão acentuada.',
            correct:
              '90×50 mmHg é hipotensão — eliminar quando o comando pede valor ideal.',
          },
        ],
        footer_rule: 'Faixa intermediária 134×84 → B',
      },
    ],
  },

  'instituto-evo-enfermagem-verificacao-de-sinais-vitais-1778969737311-6': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'MS/COFEN — SV clássicos: PA, FC, FR, temperatura · monitoramento rotineiro em pacientes',
    roi_error: 'vitals_concept_generic_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV — monitoramento rotineiro',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Qual sinal vital deve ser monitorado regularmente em pacientes.',
            icon: 'Target',
          },
          {
            label: 'Pressão arterial',
            detail: 'Parâmetro hemodinâmico básico — alternativa A.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — água do banho',
            detail: 'Letra B: temperatura da água — não é sinal vital do paciente.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — açúcar no solo',
            detail: 'Letra C: absurdo sem relação clínica.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — calorias',
            detail: 'Letra D: consumo calórico — nutrição, não SV.',
            icon: 'Utensils',
          },
        ],
        footer_rule: 'PA, FC, FR e T — não parâmetros ambientais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinal vital para monitoramento regular.',
          'Testar A — pressão arterial: SV clássico monitorado em rotina → candidata.',
          'Testar B — temperatura da água do banho: parâmetro ambiental → eliminar.',
          'Testar C — açúcar no solo: sem sentido clínico → eliminar.',
          'Testar D — consumo calórico diário: dado nutricional → eliminar.',
          'Confirmar: única opção clínica é PA.',
          'Marcar A.',
        ],
        footer_rule: 'Pressão arterial = SV monitorado → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sinais vitais clássicos',
        meta: slideMeta,
        content: 'MONITORAR EM ROTINA',
        rows: [
          { label: 'Pressão arterial', value: 'Hemodinâmica — monitoramento contínuo em internação', sv_kind: 'pa', badge: 'hot' },
          { label: 'Frequência cardíaca', value: 'Pulso e ritmo — outro SV clássico', sv_kind: 'fc', badge: 'ok' },
          { label: 'Frequência respiratória', value: 'Padrão ventilatório', sv_kind: 'fr', badge: 'ok' },
          { label: 'Temperatura', value: 'Termorregulação corporal', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'SV = função orgânica do paciente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DISTRATORES ABSURDOS EVO',
        items: [
          {
            label: 'Letra B — temperatura da água do banho',
            detail: 'Parâmetro do ambiente, não do paciente.',
            correct:
              'Temperatura da água do banho não é sinal vital — SV medem função orgânica do indivíduo.',
          },
          {
            label: 'Letra C — açúcar no solo',
            detail: 'Enunciado sem vínculo clínico.',
            correct:
              'Nível de açúcar no solo não tem relação com monitoramento de pacientes — distrator absurdo.',
          },
          {
            label: 'Letra D — consumo calórico diário',
            detail: 'Dado nutricional, não hemodinâmico.',
            correct:
              'Consumo calórico é avaliação nutricional — não integra o conjunto clássico de sinais vitais.',
          },
        ],
        footer_rule: 'PA é SV real → A',
      },
    ],
  },

  'instituto-verbena-enfermagem-verificacao-de-sinais-vitais-1779344178184-3': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — PAS = contração ventricular · normotenso = PA normal · eupneia = FR normal · manguito proporcional à circunferência braquial',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV — homeostasia e verificação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Sinais vitais refletem função orgânica básica, homeostasia e interações entre sistemas orgânicos — achar assertiva correta.',
            icon: 'Target',
          },
          {
            label: 'Pressão arterial — manguito',
            detail: 'Tamanho ideal conforme circunferência do membro → alternativa D.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — sistólica no relaxamento',
            detail: 'Letra A: pressão sistólica no relaxamento do ventrículo direito — inverte fase cardíaca.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — normotenso = FC',
            detail: 'Letra B: confunde frequência cardíaca com normotenso (pressão arterial normal).',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — dispneico normal',
            detail: 'Letra C: frequência respiratória normal é eupneia — não dispneia.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Função orgânica · PA · FC · FR — terminologia correta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: verificação dos sinais vitais e homeostasia do organismo.',
          'Testar A — pressão sistólica no relaxamento do ventrículo direito: sistólica = contração → eliminar.',
          'Testar B — normotenso = frequência cardíaca normal: normotenso é PA → eliminar.',
          'Testar C — padrão respiratório normal dispneico: eupneia é o normal → eliminar.',
          'Testar D — pressão arterial com manguito proporcional à circunferência: técnica correta → candidata.',
          'Confirmar única assertiva fisiológica.',
          'Marcar D.',
        ],
        footer_rule: 'Manguito proporcional ao braço → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — conceitos e técnica',
        meta: slideMeta,
        content: 'DECORE — PA · FC · FR',
        rows: [
          { label: 'PAS', value: 'Contração ventricular (sístole) — não relaxamento', sv_kind: 'pa', badge: 'hot' },
          { label: 'Normotenso', value: 'PA normal — não frequência cardíaca', sv_kind: 'pa', badge: 'hot' },
          { label: 'Eupneia', value: 'Padrão respiratório normal — não dispneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'Manguito', value: 'Proporcional à circunferência braquial (~80% do braço)', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Não trocar terminologia entre parâmetros',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VERBENA GYN',
        items: [
          {
            label: 'Letra A — sistólica no relaxamento',
            detail: 'Inverte fase da pressão arterial.',
            correct:
              'Pressão sistólica corresponde à contração ventricular — diastólica ao relaxamento.',
          },
          {
            label: 'Letra B — normotenso = FC normal',
            detail: 'Mistura parâmetros de PA e FC.',
            correct:
              'Normotenso descreve pressão arterial normal — normocárdico é o termo para FC normal.',
          },
          {
            label: 'Letra C — dispneico como normal',
            detail: 'Chama dispneia de padrão fisiológico.',
            correct:
              'Padrão respiratório normal é eupneia — dispneia indica dificuldade respiratória.',
          },
        ],
        footer_rule: 'Manguito calibrado → D',
      },
    ],
  },

  'intec-enfermagem-verificacao-de-sinais-vitais-1779344105099-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — não arredondar PA · manguito ≥ 2/3 da circunferência · medir ambos os braços na 1ª vez · repouso 5 min antes',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — técnica de PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Qual opção NÃO condiz com técnica correta — achar o erro.',
            icon: 'Target',
          },
          {
            label: 'Erro — arredondar PA',
            detail: 'Arredondar ímpares como 135/85 distorce registro → letra A (incorreta).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Técnica correta — manguito',
            detail: 'Letra B: cobrir ≥ 2/3 da circunferência — conduta certa.',
            icon: 'Scale',
          },
          {
            label: 'Técnica correta — dois braços',
            detail: 'Letra C: 1ª medida bilateral — usar valor mais alto se divergir.',
            icon: 'Activity',
          },
          {
            label: 'Técnica correta — repouso',
            detail: 'Letra D: 5 min de repouso após chegada — conduta certa.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Registrar valor aferido — sem arredondar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa que NÃO é técnica correta.',
          'Testar A — arredondar ímpares 135/85: não é conduta MS → é a INCORRETA → candidata.',
          'Testar B — manguito cobre 2/3 do braço: técnica correta → eliminar (não é resposta).',
          'Testar C — medir dois braços na 1ª vez: técnica correta → eliminar.',
          'Testar D — repouso 5 min: técnica correta → eliminar.',
          'Confirmar: única assertiva errada é A.',
          'Marcar A.',
        ],
        footer_rule: 'Arredondar PA é incorreto → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — registro e técnica PA',
        meta: slideMeta,
        content: 'CUIDADOS SBC/MS',
        rows: [
          { label: 'Registro', value: 'Valor aferido literal — não arredondar', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: 'Cobrir ≥ 2/3 da circunferência braquial', sv_kind: 'pa', badge: 'ok' },
          { label: '1ª medida', value: 'Ambos os braços — considerar o mais alto', sv_kind: 'pa', badge: 'ok' },
          { label: 'Repouso', value: '5 min sentado antes da aferição', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'B, C e D são condutas corretas — não marcar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA INTEC (NÃO É RESPOSTA)',
        items: [
          {
            label: 'Letra B — manguito 2/3 do braço',
            detail: 'Conduta correta — não é a alternativa pedida.',
            correct:
              'Manguito deve cobrir pelo menos dois terços da circunferência — técnica adequada, não a “incorreta”.',
          },
          {
            label: 'Letra C — medir ambos os braços',
            detail: 'Conduta correta na primeira aferição.',
            correct:
              'Primeira medida bilateral com registro do valor mais alto é recomendação — assertiva verdadeira.',
          },
          {
            label: 'Letra D — repouso 5 minutos',
            detail: 'Preparo correto antes da PA.',
            correct:
              'Aguardar cinco minutos em repouso após chegada estabiliza PA — conduta correta, não erro.',
          },
        ],
        footer_rule: 'Só A propõe arredondamento indevido',
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
    console.log(`[handcraft:sv-g19] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g19] total=${ok}`);
}

main();
