#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g17 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npm run handcraft:sinais-vitais-g17
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g17';
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
    'classificação PA SBC',
    'preparo pré-PA',
    'interpretação multi-SV',
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
  'imparh-enfermagem-verificacao-de-sinais-vitais-1779344122526-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — PA 180×120 hipertensão · FC > 100 taquicardia · T 36,5 °C normotérmico · FR > 20 taquipneia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AVC — painel de SV do caso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Sr. José, 50 anos, AVC — classificar PA, pulso, temperatura e respiração com nomenclatura científica.',
            icon: 'Target',
          },
          {
            label: 'PA 180×120 mmHg',
            detail: 'Pressão sistólica e diastólica elevadas — hipertensão.',
            icon: 'Scale',
          },
          {
            label: 'FC 110 bpm',
            detail: 'Acima de 100 bpm em repouso — taquicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — hipotenso',
            detail: 'Letra A inverte PA elevada para hipotensão.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — normocárdico',
            detail: 'Letra B classifica FC 110 como normocárdico.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Traduza cada parâmetro antes de combinar a alternativa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: AVC · PA 180×120 · P 110 · T axilar 36,5 °C · R 38 irpm.',
          'PA 180×120 = hipertenso (não hipotenso).',
          'FC 110 bpm = taquicárdico (não normocárdico nem bradicárdico).',
          'T 36,5 °C axilar = normotérmico (não hipotérmico).',
          'FR 38 irpm = taquipneico (> 20 irpm).',
          'Testar A — hipotenso + bradicárdico: inverte PA e FC → eliminar.',
          'Testar B — normocárdico: FC 110 é taquicardia → eliminar.',
          'Testar C — hipotérmico + dispneico: T normal e termo errado para FR → eliminar.',
          'Testar D — hipertenso, taquicárdico, normotérmico, taquipneico: combinação correta.',
          'Marcar D.',
        ],
        footer_rule: 'Hipertenso + taquicárdico + normotérmico + taquipneico → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação por parâmetro',
        meta: slideMeta,
        content: 'TRADUZA CADA VALOR',
        rows: [
          { label: 'PA 180×120', value: 'Hipertensão arterial', sv_kind: 'pa', badge: 'hot' },
          { label: 'FC 110 bpm', value: 'Taquicardia (> 100 bpm)', sv_kind: 'fc', badge: 'warn' },
          { label: 'T 36,5 °C axilar', value: 'Normotermia', sv_kind: 'temp', badge: 'ok' },
          { label: 'FR 38 irpm', value: 'Taquipneia (> 20 irpm)', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Combine os quatro termos antes de marcar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AVC IMPARH',
        items: [
          {
            label: 'Letra A — hipotenso e bradicárdico',
            detail: 'Inverte pressão e frequência cardíaca do caso.',
            correct:
              'PA 180×120 é hipertensão e FC 110 é taquicardia — letra A erra os dois primeiros parâmetros.',
          },
          {
            label: 'Letra B — normocárdico',
            detail: 'Classifica FC elevada como normal.',
            correct: '110 bpm excede 100 — configura taquicardia, não normocardia (60–100 bpm).',
          },
          {
            label: 'Letra C — hipotérmico e dispneico',
            detail: 'Erra temperatura e nomenclatura respiratória.',
            correct:
              '36,5 °C é normotérmico e FR 38 é taquipneia — não hipotermia nem dispneia isolada.',
          },
        ],
        footer_rule: 'Só D combina os quatro achados corretamente',
      },
    ],
  },

  'imparh-enfermagem-verificacao-de-sinais-vitais-1779344122526-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — T depende de idade/atividade/hidratação/infecção · bradicardia < 60 · taquicardia > 100 · FR em 1 min · diastólica = relaxamento',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV na UTI — assertiva correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa CORRETA sobre sinais vitais em paciente de UTI.',
            icon: 'Target',
          },
          {
            label: 'Temperatura variável',
            detail: 'Faixa térmica depende de idade, atividade, hidratação e infecção → alternativa A.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — taquicardia > 120',
            detail: 'Letra B usa corte 120 bpm — referência adulto é > 100.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — FR em tempo errado',
            detail: 'Letra C conta respiração em período duplo — padrão é um minuto.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — diastólica na sístole',
            detail: 'Letra D atribui diastólica à contração ventricular.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Cada distrator erra um conceito fisiológico diferente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assertiva correta sobre SV em UTI.',
          'Testar A — temperatura depende de idade, atividade, hidratação e infecção: fisiologia correta → candidata.',
          'Testar B — taquicardia > 120 bpm: corte errado — adulto usa > 100 → eliminar.',
          'Testar C — FR em período duplo: padrão é contar um minuto → eliminar.',
          'Testar D — diastólica na contração: inverte fases — diastólica é relaxamento → eliminar.',
          'Confirmar: única assertiva correta é A.',
          'Marcar A.',
        ],
        footer_rule: 'Temperatura variável com o contexto → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — conceitos SV',
        meta: slideMeta,
        content: 'DECORE — T · FC · FR · PA',
        rows: [
          { label: 'Temperatura', value: 'Varia com idade, atividade, hidratação, infecção', sv_kind: 'temp', badge: 'ok' },
          { label: 'Bradicardia', value: '< 60 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Taquicardia', value: '> 100 bpm (adulto)', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR', value: 'Contagem em 1 minuto completo', sv_kind: 'fr', badge: 'ok' },
          { label: 'PAD', value: 'Pressão no relaxamento cardíaco (diástole)', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Diastólica ≠ contração — é relaxamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — UTI IMPARH',
        items: [
          {
            label: 'Letra B — taquicardia > 120 bpm',
            detail: 'Eleva o limite de taquicardia.',
            correct: 'Taquicardia no adulto inicia acima de 100 bpm — não 120 bpm.',
          },
          {
            label: 'Letra C — FR em período duplo',
            detail: 'Altera o tempo de observação respiratória.',
            correct: 'Frequência respiratória é contada por um minuto — inspirações e expirações em sessenta segundos.',
          },
          {
            label: 'Letra D — diastólica na contração',
            detail: 'Confunde fase cardíaca da pressão arterial.',
            correct:
              'Pressão diastólica ocorre no relaxamento ventricular — sistólica na contração.',
          },
        ],
        footer_rule: 'B, C e D erram conceito-base → A',
      },
    ],
  },

  'imparh-enfermagem-verificacao-de-sinais-vitais-1779344196733-4': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — PA 160×120 hipertensão · FC 50 bradicardia · T 38,5 °C febre · FR 36 taquipneia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pancreatite — painel SV M.V.C.',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Paciente 65 anos, pancreatite — classificar PA, pulso, temperatura e respiração.',
            icon: 'Target',
          },
          {
            label: 'PA 160×120 mmHg',
            detail: 'Sistólica e diastólica elevadas — hipertensão.',
            icon: 'Scale',
          },
          {
            label: 'FC abaixo de 60',
            detail: 'Pulso do caso abaixo de 60 — bradicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'T 38,5 °C axilar',
            detail: 'Acima de 37,5 °C — hipertermia/febre.',
            icon: 'Thermometer',
          },
          {
            label: 'FR 36 irpm',
            detail: 'Muito acima de 20 — taquipneia.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Quatro parâmetros — quatro classificações',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: pancreatite · PA 160×120 · P 50 · T 38,5 °C · R 36 irpm.',
          'PA = hipertenso.',
          'FC abaixo de 60 bpm = bradicárdico.',
          'T 38,5 °C = hipertérmico.',
          'FR 36 irpm = taquipneico.',
          'Testar A — taquicárdico + eupneico: inverte FC e FR → eliminar.',
          'Testar B — bradicárdico + hipertérmico + taquipneico: combinação correta.',
          'Testar C — hipotenso + normotérmico + bradipneico: inverte todos → eliminar.',
          'Testar D — normocárdico: FC 50 é bradicardia → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Hipertenso + bradicárdico + hipertérmico + taquipneico → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — valores do caso',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO CLÍNICA',
        rows: [
          { label: 'PA 160×120', value: 'Hipertensão', sv_kind: 'pa', badge: 'warn' },
          { label: 'FC < 60 bpm', value: 'Bradicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'T 38,5 °C', value: 'Hipertermia / febre', sv_kind: 'temp', badge: 'hot' },
          { label: 'FR 36 irpm', value: 'Taquipneia (> 20)', sv_kind: 'fr', badge: 'hot' },
        ],
        footer_rule: 'Não confunda bradi FC com bradi FR',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PANCREATITE IMPARH',
        items: [
          {
            label: 'Letra A — taquicárdico e eupneico',
            detail: 'Inverte FC baixa e FR alta.',
            correct: 'FC 50 é bradicardia e FR 36 é taquipneia — não taquicardia nem eupneia.',
          },
          {
            label: 'Letra C — hipotenso e normotérmico',
            detail: 'Inverte PA e temperatura febril.',
            correct: '160×120 é hipertensão e 38,5 °C é febre — não hipotensão nem normotermia.',
          },
          {
            label: 'Letra D — normocárdico',
            detail: 'Classifica bradicardia como normal.',
            correct: 'Pulso no caso está abaixo de 60 bpm — é bradicardia, não normocardia.',
          },
        ],
        footer_rule: 'Combinação B fecha os quatro parâmetros',
      },
    ],
  },

  'instituto-access-enfermagem-verificacao-de-sinais-vitais-1778969768866-7': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — braço na altura do coração · manguito proporcional à circunferência · pés apoiados · não cruzar pernas',
    roi_error: 'pa_posicao_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — cuidados corretos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva CORRETA sobre cuidados técnicos na aferição de PA.',
            icon: 'Target',
          },
          {
            label: 'Posição e manguito',
            detail: 'Braço na altura do coração + manguito proporcional → alternativa C.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — pernas cruzadas',
            detail: 'Letra A pede cruzar pernas para estabilidade.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — inflar 1 minuto',
            detail: 'Letra B mantém manguito inflado por 1 minuto.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — manguito infantil',
            detail: 'Letra D usa cuff pediátrico em adulto.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Posição + manguito adequado = leitura fidedigna',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidado técnico CORRETO na aferição de PA.',
          'Testar A — cruzar pernas: eleva PA artificialmente → eliminar.',
          'Testar B — inflar até pulso forte e manter 1 min: técnica incorreta → eliminar.',
          'Testar C — braço na altura do coração + manguito proporcional: MS → candidata.',
          'Testar D — manguito infantil em adulto: subestima PA → eliminar.',
          'Confirmar técnica padrão.',
          'Marcar C.',
        ],
        footer_rule: 'Braço ao nível do coração + cuff proporcional → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA',
        meta: slideMeta,
        content: 'CUIDADOS PRÉ-AFERIÇÃO',
        rows: [
          { label: 'Posição do braço', value: 'Altura do coração — apoio adequado', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: 'Proporcional à circunferência do braço', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pernas', value: 'Pés apoiados — não cruzar', sv_kind: 'pa', badge: 'warn' },
          { label: 'Pré-inflação', value: '20–30 mmHg acima do desaparecimento do pulso radial', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Manguito inadequado distorce sistólica e diastólica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA ACCESS',
        items: [
          {
            label: 'Letra A — cruzar pernas',
            detail: 'Posição que eleva a pressão arterial.',
            correct: 'Pernas cruzadas aumentam a leitura — pés devem estar apoiados no chão.',
          },
          {
            label: 'Letra B — manter manguito inflado 1 min',
            detail: 'Procedimento que não faz parte da técnica.',
            correct: 'Infla-se 20–30 mmHg acima do desaparecimento do pulso e libera gradualmente — não manter 1 min.',
          },
          {
            label: 'Letra D — manguito infantil em adulto',
            detail: 'Cuff subdimensionado no braço.',
            correct: 'Manguito menor que o braço superestima a PA — usar tamanho proporcional à circunferência.',
          },
        ],
        footer_rule: 'Técnica correta → C',
      },
    ],
  },

  'instituto-access-enfermagem-verificacao-de-sinais-vitais-1779343789998-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — adulto padrão (circunferência 27–34 cm): manguito 12 cm × 23 cm',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manguito PA — dimensões adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Dimensões do manguito para circunferência de braço adulto padrão (27–34 cm).',
            icon: 'Target',
          },
          {
            label: 'Adulto padrão',
            detail: '12 cm largura × 23 cm comprimento → alternativa C.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — 9×18',
            detail: 'Letra A: dimensões de manguito pediátrico/pequeno.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 10×17',
            detail: 'Letra B: medidas intermediárias incorretas.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 16×32',
            detail: 'Letra D: manguito para braço obeso/grande.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Circunferência 27–34 cm → cuff 12×23 cm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: dimensões do manguito para braço adulto 27–34 cm.',
          'Testar A — 9×18 cm: cuff pequeno/pediátrico → eliminar.',
          'Testar B — 10×17 cm: medidas inadequadas → eliminar.',
          'Testar C — 12×23 cm: referência MS para adulto padrão → candidata.',
          'Testar D — 16×32 cm: cuff para obesidade → eliminar.',
          'Confirmar tabela de manguitos.',
          'Marcar C.',
        ],
        footer_rule: '12 cm × 23 cm → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tamanhos de manguito',
        meta: slideMeta,
        content: 'MANGUITO × CIRCUNFERÊNCIA',
        rows: [
          { label: 'Adulto padrão', value: '27–34 cm braço → 12 × 23 cm', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pediátrico', value: '~9 × 18 cm (braço menor)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Obeso', value: '~16 × 32 cm (braço largo)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Regra', value: 'Bolsa inflável cobre 80% do braço', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Manguito errado = PA falsa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO ACCESS',
        items: [
          {
            label: 'Letra A — 9 × 18 cm',
            detail: 'Dimensão de cuff pequeno.',
            correct: '9×18 cm serve para braço pediátrico — não para circunferência adulta 27–34 cm.',
          },
          {
            label: 'Letra B — 10 × 17 cm',
            detail: 'Medidas fora do padrão adulto.',
            correct: '10×17 cm não corresponde à referência MS para adulto padrão (12×23 cm).',
          },
          {
            label: 'Letra D — 16 × 32 cm',
            detail: 'Cuff para braço muito largo.',
            correct: '16×32 cm é para obesidade — braço 27–34 cm exige manguito 12×23 cm.',
          },
        ],
        footer_rule: 'Adulto padrão → C',
      },
    ],
  },

  'instituto-access-enfermagem-verificacao-de-sinais-vitais-1779343833455-4': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'SBC — PA 130–139 / 85–89 mmHg = pressão normal limítrofe (pré-hipertensão) · < 120/80 normal · ≥ 140/90 HAS estágio 1',
    roi_error: 'interpretacao_sv_errada',
    exam_vs_current: 'SBC 2020 usa "elevada" em vez de "normal limítrofe" — gabarito da prova mantido',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificação PA — limítrofe',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Assistência sistematizada · exame físico criterioso — avaliar PA em adulto > 18 anos.',
            icon: 'Target',
          },
          {
            label: 'Valores do caso',
            detail: 'Sistólica 130–139 mmHg e diastólica 85–89 mmHg — classificação pedida.',
            icon: 'Scale',
          },
          {
            label: 'Faixa limítrofe',
            detail: 'Pressão normal limítrofe (pré-hipertensão) na tabela SBC.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — normal',
            detail: 'Letra A trata limítrofe como PA normal.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — moderada',
            detail: 'Letra C eleva para hipertensão moderada.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Compare faixa exata com tabela SBC da prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: assistência sistematizada · exame físico · avaliação dos sinais vitais em adulto.',
          'Comando: classificar PA sistólica 130–139 mmHg e diastólica 85–89 mmHg.',
          'Testar A — normal: abaixo de 120/80 é normal — 130+ já é limítrofe → eliminar.',
          'Testar B — normal limítrofe: faixa clássica SBC 130–139/85–89 → candidata.',
          'Testar C — hipertensão moderada: estágio 2 exige valores maiores → eliminar.',
          'Testar D — hipertensão grave: muito acima da faixa → eliminar.',
          'Confirmar tabela de classificação.',
          'Marcar B.',
        ],
        footer_rule: '130–139 / 85–89 = normal limítrofe → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação PA SBC',
        meta: slideMeta,
        content: 'TABELA ADULTO — PROVA',
        rows: [
          { label: 'Normal', value: '< 120 × 80 mmHg', sv_kind: 'pa', badge: 'ok' },
          { label: 'Normal limítrofe', value: '130–139 / 85–89 mmHg', sv_kind: 'pa', badge: 'hot' },
          { label: 'HAS estágio 1', value: '140–159 / 90–99 mmHg', sv_kind: 'pa', badge: 'warn' },
          { label: 'HAS estágio 2', value: '160–179 / 100–109 mmHg', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Limítrofe ≠ normal nem hipertensão estágio 1',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO ACCESS',
        items: [
          {
            label: 'Letra A — normal',
            detail: 'Confunde limítrofe com normotenso.',
            correct: 'PA normal é < 120/80 — 130–139/85–89 já configura normal limítrofe.',
          },
          {
            label: 'Letra C — hipertensão moderada',
            detail: 'Sobreclassifica a faixa do enunciado.',
            correct: 'Hipertensão moderada/estágio 2 exige ≥ 160/100 — não 130–139/85–89.',
          },
          {
            label: 'Letra D — hipertensão grave',
            detail: 'Eleva muito a classificação.',
            correct: 'Hipertensão grave exige PA muito mais elevada — 130/85 é limítrofe, não grave.',
          },
        ],
        footer_rule: 'Limítrofe fecha B',
      },
    ],
  },

  'instituto-access-enfermagem-verificacao-de-sinais-vitais-1779343833455-5': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/SBC — PA normal de referência adulto: ~120/80 mmHg',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA normal — adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Leitura normal de PA para adulto.',
            icon: 'Target',
          },
          {
            label: 'Referência clássica',
            detail: '120/80 mmHg = valor normal de prova → alternativa B.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — 90/60',
            detail: 'Letra A: hipotensão limítrofe.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 140/90',
            detail: 'Letra C: hipertensão estágio 1.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 160/100',
            detail: 'Letra D: hipertensão estágio 2.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Decore 120/80 como referência de normalidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: PA normal em adulto.',
          'Testar A — 90/60: hipotensão — não referência normal → eliminar.',
          'Testar B — 120/80: valor clássico de normalidade → candidata.',
          'Testar C — 140/90: HAS estágio 1 → eliminar.',
          'Testar D — 160/100: HAS estágio 2 → eliminar.',
          'Confirmar referência de prova.',
          'Marcar B.',
        ],
        footer_rule: '120/80 mmHg → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA adulto',
        meta: slideMeta,
        content: 'VALORES DE REFERÊNCIA',
        rows: [
          { label: 'Normal', value: '~120/80 mmHg', sv_kind: 'pa', badge: 'hot' },
          { label: 'Hipotensão', value: '< 90/60 mmHg', sv_kind: 'pa', badge: 'warn' },
          { label: 'HAS estágio 1', value: '≥ 140/90 mmHg', sv_kind: 'pa', badge: 'warn' },
          { label: 'HAS estágio 2', value: '≥ 160/100 mmHg', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: '120/80 = decore de prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA NORMAL ACCESS',
        items: [
          {
            label: 'Letra A — 90/60 mmHg',
            detail: 'Apresenta hipotensão como normal.',
            correct: '90/60 configura hipotensão — não é leitura normal de referência em adulto.',
          },
          {
            label: 'Letra C — 140/90 mmHg',
            detail: 'Hipertensão como valor normal.',
            correct: '140/90 é hipertensão estágio 1 — acima da faixa de normalidade.',
          },
          {
            label: 'Letra D — 160/100 mmHg',
            detail: 'Hipertensão importante como normal.',
            correct: '160/100 é hipertensão estágio 2 — muito acima do valor normal de referência.',
          },
        ],
        footer_rule: 'Referência normal → B',
      },
    ],
  },

  'instituto-access-enfermagem-verificacao-de-sinais-vitais-1779344127707-1': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'SBC/MS — repouso 3–5 min · bexiga vazia · evitar exercício/álcool/café/tabaco 30 min · hipotensão ortostática: medir deitado e sentado',
    roi_error: 'conduta_sem_escalonar',
    exam_vs_current: 'Prova cita 6 h para hábitos — guideline SBC usa 30 min; gabarito B (bexiga vazia)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo pré-PA — HAS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Preparo correto do paciente para aferição de PA no contexto de diagnóstico de HAS.',
            icon: 'Target',
          },
          {
            label: 'Bexiga vazia',
            detail: 'Bexiga cheia eleva PA — verificar esvaziamento → alternativa B.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — exercício pré-PA',
            detail: 'Letra C mistura intervalo de exercício físico — aguardar repouso antes da aferição.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — sem repouso',
            detail: 'Letra A dispensa repouso de 3–5 min.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — só sentado',
            detail: 'Letra D mede PA apenas sentado na suspeita de ortostase.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — 6 horas',
            detail: 'Letra C propõe intervalo exagerado para hábitos pré-PA.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Bexiga cheia distorce a leitura pressórica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: diagnóstico HAS exige ≥ 2 aferições em ≥ 2 consultas.',
          'Comando: preparo CORRETO para técnica de PA.',
          'Testar A — dispensar repouso 3–5 min: incorreto — repouso é obrigatório → eliminar.',
          'Testar B — bexiga vazia: bexiga distendida eleva PA → candidata.',
          'Testar C — 6 h sem exercício/álcool/café/tabaco: intervalo da prova, mas assertiva incorreta no conjunto → eliminar.',
          'Testar D — PA só sentada na ortostase: deve medir deitado e sentado → eliminar.',
          'Confirmar cuidado técnico.',
          'Marcar B.',
        ],
        footer_rule: 'Bexiga vazia antes da PA → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo pré-PA',
        meta: slideMeta,
        content: 'CUIDADOS SBC/MS',
        rows: [
          { label: 'Repouso', value: '3–5 min sentado antes da 1ª medida', sv_kind: 'pa', badge: 'hot' },
          { label: 'Bexiga', value: 'Esvaziada — distensão eleva PA', sv_kind: 'pa', badge: 'hot' },
          { label: 'Hábitos', value: 'Sem exercício, álcool, café, tabaco ~30 min', sv_kind: 'pa', badge: 'ok' },
          { label: 'Ortostase', value: 'Medir deitado e sentado se suspeita', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Preparo inadequado = falso diagnóstico de HAS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO ACCESS',
        items: [
          {
            label: 'Letra A — dispensar repouso',
            detail: 'Elimina tempo de estabilização.',
            correct: 'Repouso de 3–5 minutos sentado é obrigatório antes da aferição — não pode ser dispensado.',
          },
          {
            label: 'Letra C — intervalo de 6 horas',
            detail: 'Tempo exagerado para hábitos pré-PA.',
            correct:
              'Guideline usa ~30 min sem exercício, álcool, café ou tabaco — não 6 horas como única regra.',
          },
          {
            label: 'Letra D — só posição sentada',
            detail: 'Reduz avaliação ortostática.',
            correct:
              'Hipotensão ortostática exige medidas em decúbito e sentado — não apenas sentado.',
          },
        ],
        footer_rule: 'Bexiga vazia → B',
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
    console.log(`[handcraft:sv-g17] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g17] total=${ok}`);
}

main();
