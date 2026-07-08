#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g18 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npm run handcraft:sinais-vitais-g18
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g18';
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
    'fases de Korotkoff',
    'inflação/deflação manguito',
    'preparo pré-PA',
    'manguito obeso antebraço',
    'pressão convergente',
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
  'instituto-aocp-enfermagem-verificacao-de-sinais-vitais-1779343789998-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — inflação lenta do manguito → leitura diastólica falsamente baixa (gabarito AOCP) · deflação controlada',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Erro técnico — inflação do manguito',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Inflar o manguito muito lentamente — qual consequência na leitura?',
            icon: 'Target',
          },
          {
            label: 'Inflação lenta',
            detail: 'Velocidade inadequada de insuflação distorce sons de Korotkoff.',
            icon: 'Gauge',
          },
          {
            label: 'Consequência esperada',
            detail: 'Diastólica falsamente baixa — alternativa D (gabarito AOCP).',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — sistólica alta',
            detail: 'Letra A atribui erro à sistólica falsa-alta.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — diastólica alta',
            detail: 'Letra B propõe diastólica falsa-alta — direção oposta ao gabarito.',
            icon: 'TrendingUp',
          },
        ],
        footer_rule: 'Inflação lenta → diastólica subestimada (gabarito AOCP)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: consequência de inflar o manguito muito lentamente na PA.',
          'Erro técnico: velocidade de insuflação inadequada altera sons de Korotkoff.',
          'Testar A — leitura sistólica falsa-alta: não é a consequência apontada pela banca → eliminar.',
          'Testar B — diastólica falsa-alta: direção oposta ao gabarito oficial → eliminar.',
          'Testar C — sistólica falsa-baixa: parâmetro errado → eliminar.',
          'Testar D — diastólica falsa-baixa: consequência indicada pela prova AOCP → candidata.',
          'Confirmar: inflação lenta → leitura diastólica falsamente baixa.',
          'Marcar D.',
        ],
        footer_rule: 'Inflação lenta → diastólica falsa-baixa → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — velocidade do manguito',
        meta: slideMeta,
        content: 'INSUFLAÇÃO E DEFLAÇÃO',
        rows: [
          { label: 'Inflação lenta', value: 'Diastólica falsamente baixa (gabarito AOCP)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Deflação', value: 'Velocidade controlada — não rápida demais', sv_kind: 'pa', badge: 'ok' },
          { label: 'Fase I', value: 'Aparecimento dos sons = sistólica', sv_kind: 'pa', badge: 'ok' },
          { label: 'Fase V', value: 'Desaparecimento = diastólica', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Velocidade do manguito altera Korotkoff',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INFLAÇÃO LENTA AOCP',
        items: [
          {
            label: 'Letra A — sistólica falsa-alta',
            detail: 'Atribui o erro à pressão sistólica.',
            correct:
              'A banca aponta consequência na diastólica — não na leitura sistólica falsamente elevada.',
          },
          {
            label: 'Letra B — diastólica falsa-alta',
            detail: 'Propõe superestimação da diastólica.',
            correct: 'O gabarito AOCP indica diastólica falsamente baixa — não falsamente alta.',
          },
          {
            label: 'Letra C — sistólica falsa-baixa',
            detail: 'Desloca o artefato para a sistólica.',
            correct: 'A consequência descrita na prova afeta a diastólica — não a sistólica falsamente baixa.',
          },
        ],
        footer_rule: 'Diastólica falsa-baixa → D',
      },
    ],
  },

  'instituto-aocp-enfermagem-verificacao-de-sinais-vitais-1779344189558-6': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — preparo PA: abstinência café/cigarro 30 min · braço nível coração · manguito proporcional · Korotkoff I = sistólica',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica correta de PA — AOCP',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Na técnica correta de aferição da PA, o técnico considera…',
            icon: 'Target',
          },
          {
            label: 'Preparo pré-PA',
            detail: 'Evitar cigarro e cafeína antes da PA — alternativa E.',
            icon: 'Coffee',
          },
          {
            label: 'Pegadinha — insuflação +50',
            detail: 'Letra A usa valor fixo excessivo acima do pulso — padrão MS é moderado.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — braço abaixo precórdio',
            detail: 'Letra B posiciona braço abaixo do precórdio — errado.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — manguito único',
            detail: 'Letra D ignora circunferência do braço.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Preparo + posição + manguito = técnica MS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assertiva correta sobre técnica de PA.',
          'Testar A — inflar valor fixo excessivo acima do pulso: MS usa moderado acima do desaparecimento → eliminar.',
          'Testar B — braço abaixo do precórdio: deve estar na altura do coração → eliminar.',
          'Testar C — sistólica no desaparecimento: inverte Korotkoff — diastólica é fase V → eliminar.',
          'Testar D — manguito padrão para qualquer braço: ignora circunferência → eliminar.',
          'Testar E — evitar cigarro e cafeína antes da PA: preparo SBC → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Abstinência café/cigarro pré-PA → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA MS',
        meta: slideMeta,
        content: 'PREPARO · POSIÇÃO · MANGUITO',
        rows: [
          { label: 'Preparo', value: 'Sem café/cigarro/álcool antes · repouso sentado', sv_kind: 'pa', badge: 'hot' },
          { label: 'Posição', value: 'Sentado · braço apoiado na altura do coração', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pré-inflação', value: 'Inflar acima do desaparecimento do pulso radial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Manguito', value: 'Proporcional à circunferência braquial (~80% do braço)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Korotkoff I', value: 'Aparecimento dos sons = pressão sistólica', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Cada distrator erra um passo diferente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA PA AOCP',
        items: [
          {
            label: 'Letra A — pré-insuflação excessiva',
            detail: 'Exagera a pré-insuflação do manguito.',
            correct: 'MS recomenda inflar moderadamente acima do desaparecimento do pulso radial — não valor fixo excessivo.',
          },
          {
            label: 'Letra B — braço abaixo do precórdio',
            detail: 'Posicionamento incorreto do membro.',
            correct: 'O braço deve estar apoiado na altura do coração (4º EIC) — não abaixo do precórdio.',
          },
          {
            label: 'Letra C — sistólica no desaparecimento',
            detail: 'Confunde fases de Korotkoff.',
            correct: 'Sistólica = fase I (aparecimento) — desaparecimento dos sons marca a diastólica (fase V).',
          },
          {
            label: 'Letra D — manguito padrão universal',
            detail: 'Ignora biotipo do paciente.',
            correct: 'Manguito deve ser proporcional à circunferência do braço — tamanho único distorce a leitura.',
          },
        ],
        footer_rule: 'Preparo sem café/cigarro → E',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779343856589-5': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — FC 49 bpm = bradicardia · PA 110×60 normotensa · FR 18 eupneia · T 36,3 °C normotérmica',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso Antônia — painel SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Antônia 48 anos — desconforto torácico — classificar SV coletados.',
            icon: 'Target',
          },
          {
            label: 'FC abaixo de 60',
            detail: 'Bradicardia — núcleo do gabarito neste caso clínico.',
            icon: 'HeartPulse',
          },
          {
            label: 'PA normotensa',
            detail: 'Pressão dentro da faixa de repouso no adulto.',
            icon: 'Scale',
          },
          {
            label: 'FR eupneica · T normotérmica',
            detail: 'Frequência respiratória e temperatura dentro da referência.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — hipotensão',
            detail: 'Letra A e C classificam PA 110×60 como hipotensa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Traduzir cada valor antes de combinar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Caso: FC abaixo de 60 · PA normotensa · FR eupneica · T normotérmica.',
          'FC abaixo de 60 bpm → bradicardia — não normocárdica.',
          'PA dentro da faixa → normotensa — não hipotensa nem hipertensa.',
          'FR dentro de 12–20 irpm → eupneia — não taquipneia.',
          'T axilar na faixa → normotérmica — não hipotermia.',
          'Testar A — normocárdica + hipotensa: erra FC e PA → eliminar.',
          'Testar B — bradicárdica, normotensa, eupneica, normotérmica: combinação correta → candidata.',
          'Testar C — bradicárdica + hipotensa + taquipneia: erra PA e FR → eliminar.',
          'Testar D — normocárdica + hipertensa + taquipneia + hipotermia: múltiplos erros → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Bradi + normotensa + eupneia + normotermia → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação do caso',
        meta: slideMeta,
        content: 'ANTÔNIA — PARÂMETROS',
        rows: [
          { label: 'FC caso', value: 'Bradicardia (< 60 bpm)', sv_kind: 'fc', badge: 'hot' },
          { label: 'PA caso', value: 'Normotensa em repouso', sv_kind: 'pa', badge: 'ok' },
          { label: 'FR caso', value: 'Eupneia (12–20 irpm)', sv_kind: 'fr', badge: 'ok' },
          { label: 'T caso', value: 'Normotérmica axilar', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Bradicardia é o discriminador principal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO ANTÔNIA',
        items: [
          {
            label: 'Letra A — normocárdica e hipotensa',
            detail: 'Classifica FC e PA incorretamente.',
            correct: 'FC abaixo de 60 é bradicardia — não normocárdica; PA do caso é normotensa — não hipotensa.',
          },
          {
            label: 'Letra C — hipotensa e taquipneica',
            detail: 'Erra PA e frequência respiratória.',
            correct: 'PA do caso é normotensa; FR eupneica — não taquipneia (> 20 irpm).',
          },
          {
            label: 'Letra D — hipertensa, taquipneica e hipotérmica',
            detail: 'Múltiplas classificações invertidas.',
            correct: 'Nenhum parâmetro sustenta hipertensão, taquipneia ou hipotermia no caso.',
          },
        ],
        footer_rule: 'Só B classifica os quatro SV corretamente',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779343956155-1': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN/SBC — HAS: repouso 3–5 min em ambiente calmo · bexiga vazia · sem álcool/café/fumo antes · braço ao coração',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HAS — preparo para aferição PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Hipertensão Arterial Sistêmica — medição correta da PA na avaliação inicial e confirmação do diagnóstico.',
            icon: 'Target',
          },
          {
            label: 'Repouso calmo',
            detail: 'Explicar procedimento + repouso 3–5 min em ambiente calmo — alternativa D.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — bexiga cheia na HAS',
            detail: 'Letra A mantém bexiga distendida — eleva PA e confunde confirmação de hipertensão.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — álcool/café/fumo',
            detail: 'Letra B aferir logo após ingestão — artefato que mascara hipertensão real.',
            icon: 'Coffee',
          },
          {
            label: 'Pegadinha — braço no abdome',
            detail: 'Letra C posiciona braço na altura do abdome — não ao nível do coração.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Repouso 3–5 min = passo obrigatório HAS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: avaliação inicial de HAS — técnica correta de PA.',
          'Testar A — bexiga cheia: distorce leitura — bexiga deve estar vazia → eliminar.',
          'Testar B — aferir após álcool, café ou fumo: preparo inadequado → eliminar.',
          'Testar C — braço na altura do abdome: deve estar ao nível do coração → eliminar.',
          'Testar D — explicar + repouso 3–5 min em ambiente calmo: MS/SBC → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Repouso calmo 3–5 min → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo PA HAS',
        meta: slideMeta,
        content: 'PRÉ-AFERIÇÃO — ADULTO',
        rows: [
          { label: 'Repouso', value: 'Repouso sentado em ambiente calmo · explicar procedimento', sv_kind: 'pa', badge: 'hot' },
          { label: 'Bexiga', value: 'Esvaziada — bexiga cheia eleva PA', sv_kind: 'pa', badge: 'warn' },
          { label: 'Abstinência', value: 'Sem álcool · café · fumo antes da aferição', sv_kind: 'pa', badge: 'ok' },
          { label: 'Posição braço', value: 'Apoiado na altura do coração — não abdome', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'HAS exige técnica rigorosa na confirmação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO HAS CONSULPLAN',
        items: [
          {
            label: 'Letra A — bexiga cheia',
            detail: 'Mantém bexiga distendida durante a medida.',
            correct: 'Bexiga cheia eleva a PA — o paciente deve urinar antes da aferição.',
          },
          {
            label: 'Letra B — após álcool, café ou fumo',
            detail: 'Aferir imediatamente após ingestão ou tabagismo.',
            correct: 'Álcool, café e fumo alteram a PA — aguardar abstinência antes da aferição conforme SBC.',
          },
          {
            label: 'Letra C — braço na altura do abdome',
            detail: 'Posiciona membro inferior ao nível cardíaco.',
            correct: 'O braço deve estar apoiado na altura do coração — abdome distorce a leitura.',
          },
        ],
        footer_rule: 'Repouso + ambiente calmo → D',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779343956155-2': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — braço > 50 cm sem manguito adequado: PA no antebraço com ausculta do pulso radial',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Obesidade — PA no antebraço',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Braço > 50 cm sem manguito — PA no antebraço: qual pulso auscultar?',
            icon: 'Target',
          },
          {
            label: 'Manguito longo/largo',
            detail: 'Evita superestimação em braço obeso — alternativa quando disponível.',
            icon: 'Scale',
          },
          {
            label: 'Antebraço — pulso radial',
            detail: 'Quando não há manguito braquial → radial — alternativa B.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — ulnar',
            detail: 'Letra A indica pulso ulnar — não é o padrão no antebraço.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — braquial/carótida',
            detail: 'Letras C e D usam locais incompatíveis com antebraço.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sem manguito braquial → antebraço + radial',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: paciente obeso · circunferência > 50 cm · sem manguito disponível.',
          'Alternativa: medição no antebraço com manguito adequado ao membro.',
          'Testar A — pulso ulnar: local não padrão para PA antebraço → eliminar.',
          'Testar B — pulso radial: técnica MS para antebraço → candidata.',
          'Testar C — pulso braquial: braquial fica no braço, não antebraço → eliminar.',
          'Testar D — pulso carotídeo: não se usa para PA de membro → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Antebraço → auscultar radial → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — manguito e antebraço',
        meta: slideMeta,
        content: 'OBESIDADE · TAMANHO MANGUITO',
        rows: [
          { label: 'Braço > 50 cm', value: 'Manguito longo/largo — evita superestimação', sv_kind: 'pa', badge: 'hot' },
          { label: 'Sem manguito braquial', value: 'Medir no antebraço', sv_kind: 'pa', badge: 'warn' },
          { label: 'Pulso no antebraço', value: 'Radial — artéria auscultada', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito estreito', value: 'Superestima PA — erro sistemático', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Circunferência define manguito e local',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OBESO SEM MANGUITO',
        items: [
          {
            label: 'Letra A — pulso ulnar',
            detail: 'Indica artéria ulnar para ausculta.',
            correct: 'No antebraço a artéria padrão para PA é a radial — não a ulnar.',
          },
          {
            label: 'Letra C — pulso braquial',
            detail: 'Usa artéria braquial no antebraço.',
            correct: 'A braquial situa-se no braço — no antebraço ausculta-se o pulso radial.',
          },
          {
            label: 'Letra D — pulso carotídeo',
            detail: 'Propõe artéria carótida para medida de membro.',
            correct: 'Carótida é pulso central cervical — não se usa para aferir PA no antebraço.',
          },
        ],
        footer_rule: 'Radial no antebraço → B',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344089179-2': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — T 36,1 °C normotérmica · FC 108 taquicardia · PA 115×79 normotensa · FR 22 taquipneia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SSVV — internado adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Classificar T · FC · PA · FR sequencialmente no painel do internado.',
            icon: 'Target',
          },
          {
            label: 'T normotérmica',
            detail: 'Temperatura axilar dentro da faixa — não hipotermia.',
            icon: 'Thermometer',
          },
          {
            label: 'FC taquicárdica',
            detail: 'Acima de 100 bpm em repouso — taquicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR taquipneica',
            detail: 'Acima de 20 irpm — discriminador do gabarito.',
            icon: 'Wind',
          },
          {
            label: 'PA normotensa',
            detail: 'Pressão arterial dentro da referência em repouso.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'T → FC → PA → FR na ordem da alternativa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Dados do painel: T normotérmica · FC taquicárdica · PA normotensa · FR taquipneica.',
          'T axilar na faixa → normotérmico — não hipotérmico.',
          'FC acima de 100 bpm → taquicárdico.',
          'PA em repouso → normotenso.',
          'FR acima de 20 irpm → taquipneico — não eupneico.',
          'Testar A — hipotérmico + eupneico: erra T e FR → eliminar.',
          'Testar B — hipotérmico + taquipneico: erra T → eliminar.',
          'Testar C — hipotenso: PA do caso é normotensa → eliminar.',
          'Testar D — normotérmico · taquicárdico · normotenso · taquipneico: sequência correta → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Normotérmico · taqui · normotenso · taquipneico → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação sequencial',
        meta: slideMeta,
        content: 'PAINEL — ADULTO INTERNO',
        rows: [
          { label: 'T', value: 'Normotérmica axilar', sv_kind: 'temp', badge: 'ok' },
          { label: 'FC', value: 'Taquicardia (> 100 bpm)', sv_kind: 'fc', badge: 'hot' },
          { label: 'PA', value: 'Normotensa', sv_kind: 'pa', badge: 'ok' },
          { label: 'FR', value: 'Taquipneia (> 20 irpm)', sv_kind: 'fr', badge: 'hot' },
        ],
        footer_rule: 'FR 22 exclui alternativas com eupneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PAINEL SSVV CONSULPLAN',
        items: [
          {
            label: 'Letra A — hipotérmico e eupneico',
            detail: 'Classifica temperatura e FR incorretamente.',
            correct: 'T do caso é normotérmica — não hipotermia; FR taquipneica — não eupneia.',
          },
          {
            label: 'Letra B — hipotérmico',
            detail: 'Chama normotermia de hipotermia.',
            correct: '36 °C a 37,5 °C axilar enquadra normotermia — hipotermia seria bem abaixo de 36 °C.',
          },
          {
            label: 'Letra C — hipotenso',
            detail: 'Subestima pressão arterial.',
            correct: 'PA do caso é normotensa em repouso — não configura hipotensão.',
          },
        ],
        footer_rule: 'Só D acerta os quatro na ordem',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344089179-3': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — pressão convergente: sistólica se aproxima da diastólica (pulso estreito) · hipertensão = acima da média',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia PA — convergência',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Pressão convergente verificada quando…',
            icon: 'Target',
          },
          {
            label: 'Pressão convergente',
            detail: 'Sistólica se aproxima da diastólica — pulso de pressão estreito → D.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — acima da média',
            detail: 'Letra A descreve hipertensão — não convergência.',
            icon: 'TrendingUp',
          },
          {
            label: 'Pegadinha — abaixo da média',
            detail: 'Letra B descreve hipotensão.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — sistólica afasta',
            detail: 'Letra C inverte — afastamento = pulso largo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Convergente = PS ≈ PD',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: definição de pressão convergente.',
          'Convergência = sistólica e diastólica próximas — pressão de pulso estreita.',
          'Testar A — acima da média: define hipertensão → eliminar.',
          'Testar B — abaixo da média: define hipotensão → eliminar.',
          'Testar C — sistólica se afasta da diastólica: pulso largo — oposto → eliminar.',
          'Testar D — máxima se aproxima da diastólica: convergência → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'PS aproxima PD → convergente → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — termos PA',
        meta: slideMeta,
        content: 'NOMENCLATURA — PRESSÃO ARTERIAL',
        rows: [
          { label: 'Convergente', value: 'Sistólica ≈ diastólica — pulso estreito', sv_kind: 'pa', badge: 'hot' },
          { label: 'Hipertensão', value: 'PA acima dos valores de referência', sv_kind: 'pa', badge: 'ok' },
          { label: 'Hipotensão', value: 'PA abaixo dos valores de referência', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pressão de pulso', value: 'PS − PD — ampla quando valores se afastam', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Convergir ≠ subir nem descer a média',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TERMINOLOGIA PA',
        items: [
          {
            label: 'Letra A — acima da média',
            detail: 'Confunde convergência com hipertensão.',
            correct: 'Acima da média define hipertensão — convergência é proximidade entre sistólica e diastólica.',
          },
          {
            label: 'Letra B — abaixo da média',
            detail: 'Confunde convergência com hipotensão.',
            correct: 'Abaixo da média define hipotensão — não a aproximação entre máxima e mínima.',
          },
          {
            label: 'Letra C — sistólica se afasta',
            detail: 'Descreve pulso de pressão amplo.',
            correct: 'Quando sistólica se afasta da diastólica o pulso é largo — convergência é o oposto.',
          },
        ],
        footer_rule: 'Máxima ≈ diastólica → D',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344089179-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'SBC/MS — repouso: variação sistólica > 140 mmHg indica média epidemiológica elevada (hipertensão)',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pico hipertensivo — limiar sistólico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Detecção precoce de picos hipertensivos em repouso — limiar sistólico.',
            icon: 'Target',
          },
          {
            label: 'Limiar em repouso',
            detail: 'Sistólica > 140 mmHg = média elevada — alternativa D.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — 90 mmHg',
            detail: 'Letra A usa limiar de hipotensão.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — 100–110 mmHg',
            detail: 'Letras B e C subestimam o corte hipertensivo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Repouso · sistólica > 140 = alerta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: variação sistólica em repouso considerada epidemiologicamente elevada.',
          'Referência SBC: PA ≥ 140/90 mmHg define hipertensão em adultos.',
          'Testar A — superior a 90 mmHg: limiar muito baixo — inclui normotensos → eliminar.',
          'Testar B — superior a 100 mmHg: ainda abaixo do corte clássico → eliminar.',
          'Testar C — superior a 110 mmHg: insuficiente para HAS estágio 1 → eliminar.',
          'Testar D — superior a 140 mmHg: corte sistólico SBC em repouso → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Sistólica > 140 mmHg em repouso → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — limites PA adulto',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO — SBC',
        rows: [
          { label: 'Normotenso', value: '< 120×80 mmHg', sv_kind: 'pa', badge: 'ok' },
          { label: 'HAS estágio 1', value: '140–159 sistólica · PAD elevada', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pico sistólico repouso', value: '> 140 mmHg = média elevada', sv_kind: 'pa', badge: 'hot' },
          { label: 'Hipotensão', value: 'PAS < 90 mmHg — não é pico hipertensivo', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: '140 mmHg sistólica = porta de entrada HAS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LIMIAR SISTÓLICO',
        items: [
          {
            label: 'Letra A — superior a 90 mmHg',
            detail: 'Usa limiar de hipotensão como referência.',
            correct: '90 mmHg é referência de hipotensão — picos hipertensivos exigem corte bem superior.',
          },
          {
            label: 'Letra B — superior a 100 mmHg',
            detail: 'Corte abaixo do padrão epidemiológico.',
            correct: '100 mmHg sistólica ainda pode ser normotensão — HAS inicia em 140 mmHg (sistólica).',
          },
          {
            label: 'Letra C — superior a 110 mmHg',
            detail: 'Subestima o limiar de hipertensão.',
            correct: '110 mmHg não define média epidemiológica elevada — o corte clássico é 140 mmHg sistólica.',
          },
        ],
        footer_rule: 'Sistólica > 140 → D',
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
    console.log(`[handcraft:sv-g18] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g18] total=${ok}`);
}

main();
