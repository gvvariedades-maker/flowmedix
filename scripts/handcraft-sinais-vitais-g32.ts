#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g32 (SHORT LOTE: 6 slugs vitals_interpretacao final).
 * Fecha cluster SV geral / múltiplos parâmetros após g31 (8 slugs).
 *
 *   npm run handcraft:sinais-vitais-g32
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g32';
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
    'PA normotenso · hipotenso · hipertenso',
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'temperatura axilar afebril',
    'ECG 5 derivações — posição V1',
    'balanço hídrico — entradas e saídas',
    'síndrome compartimental — gesso',
    'SRPA — SV e registro',
    'Escala de Aldrete — respiração e consciência',
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
  family: 'vf' | 'conceito' | 'protocolo' | 'certo_errado';
  branch: Branch;
  guideline: string;
  exam_vs_current?: string;
  roi_error?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

/** v3: item extra que ancora erro ROI (exceto_coringa) — padrão g31. */
const PEGADINHA_ROI_EXTRA = {
  label: 'Pegadinha — conduta errada na alternativa',
  detail:
    'Alternativas incorretas invertem técnica ou omitem registro — mito de conduta errada que a banca repete.',
  icon: 'Ban',
};

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

const UNESC_SRPA: Pack = {
  family: 'protocolo',
  branch: 'vitals_interpretacao',
  guideline:
    'COFEN/MS — SRPA: verificar e registrar SV periodicamente · documentar dor e nível de consciência · medicamento só com prescrição · monitoramento contínuo, não só em intercorrência',
  roi_error: 'interpretacao_sv_errada',
  slides: [
    {
      type: 'concept_map',
      slide_title: 'SRPA — papel do técnico de enfermagem',
      meta: slideMeta,
      items: [
        {
          label: 'Comando da prova',
          detail:
            'Cuidados de enfermagem na recuperação pós-anestesia — marcar alternativa CORRETA.',
          icon: 'Target',
        },
        {
          label: 'SV + registro',
          detail:
            'Aferir sinais vitais e registrar em documento apropriado — núcleo da vigilância na SRPA.',
          icon: 'Activity',
        },
        {
          label: 'Nível de consciência',
          detail:
            'Avaliar resposta e orientação — parâmetro essencial junto aos SV na SRPA.',
          icon: 'Brain',
        },
        {
          label: 'Pegadinha — SV só na intercorrência',
          detail:
            'Letra E: verificar SV apenas se houver problema — monitoramento é rotineiro e contínuo.',
          icon: 'Ban',
        },
        {
          label: 'Pegadinha — medicação sem prescrição',
          detail:
            'Letra A: analgésico sem prescrição — técnico não prescreve nem administra sem ordem médica.',
          icon: 'AlertTriangle',
        },
        {
          label: 'Pegadinha — agir sem comunicar/registrar',
          detail:
            'Letra B omite registro no prontuário — não comunicar alteração de SV à equipe é conduta errada.',
          icon: 'Ban',
        },
        PEGADINHA_ROI_EXTRA,
      ],
      footer_rule: 'SRPA = SV registrados + vigilância contínua',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: slideMeta,
      steps: [
        'Comando: cuidados do técnico na recuperação pós-anestesia.',
        'Testar A — analgésico sem prescrição: fora da competência → eliminar.',
        'Testar B — observar dor sem registrar: omissão de documentação → eliminar.',
        'Testar D — consciência irrelevante: parâmetro central na SRPA → eliminar.',
        'Testar E — SV só em intercorrência: monitoramento deve ser rotineiro → eliminar.',
        'Testar C — verificar SV e registrar: protocolo COFEN → candidata.',
        'Marcar C.',
      ],
      footer_rule: 'Aferir · registrar · repetir → C',
    },
    {
      type: 'golden_rule',
      slide_title: 'Referência — vigilância na SRPA',
      meta: slideMeta,
      content: 'MONITORAR · REGISTRAR · COMUNICAR',
      rows: [
        { label: 'Sinais vitais', value: 'PA · FC · FR · SpO₂ · temperatura — rotina', sv_kind: 'meta', badge: 'hot' },
        { label: 'Registro', value: 'Documento apropriado — prontuário/ficha SRPA', sv_kind: 'meta', badge: 'ok' },
        { label: 'Consciência', value: 'Nível de alerta — escala ou descrição', sv_kind: 'meta', badge: 'ok' },
        { label: 'Dor', value: 'Avaliar e registrar — não tratar sem prescrição', sv_kind: 'meta', badge: 'hot' },
        { label: 'Frequência', value: 'Conforme protocolo — não só se intercorrência', sv_kind: 'meta', badge: 'hot' },
      ],
      footer_rule: 'SV periódicos + registro = base da SRPA',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: slideMeta,
      content: 'PEGADINHAS — SRPA UNESC',
      items: [
        {
          label: 'Letra A — analgésico sem prescrição',
          detail: 'Administrar medicamentos para dor sem prescrição médica.',
          correct:
            'Técnico de enfermagem não administra analgésico sem prescrição — conduta ilegal e insegura na SRPA.',
        },
        {
          label: 'Letra B — dor sem registro',
          detail: 'Observar queixas de dor sem registrar a informação.',
          correct:
            'Avaliação da dor deve ser documentada — omissão de registro impede rastreio e comunicação com a equipe.',
        },
        {
          label: 'Letra D — consciência irrelevante',
          detail: 'Nível de consciência é informação irrelevante nos cuidados pós-anestesia.',
          correct:
            'Nível de consciência é parâmetro central na SRPA — alteração precoce de depressão respiratória ou retenção.',
        },
        {
          label: 'Letra E — SV só em intercorrência',
          detail: 'Verificar sinais vitais apenas se houver intercorrências.',
          correct:
            'SRPA exige monitoramento rotineiro dos SV — esperar intercorrência atrasa detecção de instabilidade.',
        },
      ],
      footer_rule: 'Só C une aferição + registro',
    },
  ],
};

const SPECS: Record<string, Pack> = {
  'ibade-enfermagem-verificacao-de-sinais-vitais-1779344178184-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — ECG 5 derivações: V1 no 4º espaço intercostal direito parasternal · RA/LL/RL nos membros (linhas infradiafragmáticas) · LA infraclavicular esquerda',
    roi_error: 'oximetro_substitui_palpacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ECG 5 derivações — posição dos eletrodos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Disposição CORRETA dos eletrodos para monitor de 5 canais (cabos V, RA, LA, LL, RL).',
            icon: 'Target',
          },
          {
            label: 'V1 — precórdio direito',
            detail:
              '4º espaço intercostal direito, junto ao esterno — derivação precordial padrão.',
            icon: 'Activity',
          },
          {
            label: 'Membros — infradiafragmático',
            detail:
              'RA/RL direito e LA/LL esquerdo nas linhas infradiafragmáticas próximas à crista ilíaca.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — V1 no ombro',
            detail:
              'Letras A e B colocam derivação V no ombro infraclavicular — local errado para V1.',
            icon: 'Ban',
          },
        {
          label: 'Pegadinha — trocar RA e LA',
          detail:
            'Letra B usa MID (braço direito) como referência no ombro — inverte posição padrão.',
          icon: 'GitCompare',
        },
        PEGADINHA_ROI_EXTRA,
      ],
      footer_rule: 'V1 = 4º EIC direito · membros abaixo do diafragma',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: posição correta dos eletrodos em monitor 5 canais.',
          'Lembrar: V1 no 4º EIC direito parasternal — única derivação precordial no cabo V.',
          'Testar A — V no ombro esquerdo (MIE–LL): local de membro, não V1 → eliminar.',
          'Testar B — V no ombro direito (MID–REF): inverte referência → eliminar.',
          'Testar D — MSE–LA infradiafragmático: posição de membro, não de V → eliminar.',
          'Testar E — MSD–RA infradiafragmático: membro correto, mas não responde ao cabo V → eliminar.',
          'Testar C — 4º EIC direito: V – V1: posição padrão → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'V1 parasternal direito → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ECG 5 derivações',
        meta: slideMeta,
        content: 'V1 × MEMBROS',
        rows: [
          { label: 'V1', value: '4º EIC direito — parasternal', sv_kind: 'fc', badge: 'hot' },
          { label: 'RA', value: 'Membro superior direito — infradiafragmático', sv_kind: 'fc', badge: 'ok' },
          { label: 'LA', value: 'Membro superior esquerdo — infraclavicular', sv_kind: 'fc', badge: 'ok' },
          { label: 'LL / RL', value: 'Membros inferiores — linha infradiafragmática', sv_kind: 'fc', badge: 'ok' },
          { label: 'Objetivo', value: 'Traçado bipolar + V1 para ritmo no monitor', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Não confunda V1 com eletrodo de membro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ECG IBADE',
        items: [
          {
            label: 'Letra A — ombro esquerdo MIE–LL',
            detail: 'Linha infraclavicular esquerda próxima ao ombro: MIE – LL.',
            correct:
              'MIE–LL é posição de membro inferior esquerdo — cabo V exige V1 no 4º EIC direito parasternal.',
          },
          {
            label: 'Letra B — ombro direito MID–REF',
            detail: 'Linha infraclavicular direita próxima ao ombro: MID – REF.',
            correct:
              'MID no ombro não substitui V1 — derivação precordial V1 fica no tórax, não no ombro direito.',
          },
          {
            label: 'Letra D — infradiafragmático MSE–LA',
            detail: 'Linha infradiafragmática esquerda próxima à crista ilíaca: MSE – LA.',
            correct:
              'MSE–LA descreve membro superior esquerdo infradiafragmático — não é a posição do cabo V (V1).',
          },
          {
            label: 'Letra E — infradiafragmático MSD–RA',
            detail: 'Linha infradiafragmática direita próxima à crista ilíaca: MSD – RA.',
            correct:
              'MSD–RA é eletrodo de membro direito — correto para RA, mas o enunciado pede disposição do cabo V (V1).',
          },
        ],
        footer_rule: 'Só C posiciona V1 corretamente',
      },
    ],
  },

  'idesg-enfermagem-verificacao-de-sinais-vitais-1778969745165-0': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — balanço hídrico: registrar todas as entradas (oral, EV, medicamentos) e saídas (diurese, vômito, drenos, secreções) · cálculo contínuo no turno',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Balanço hídrico — registro fidedigno',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Condição necessária para balanço hídrico fidedigno — entradas e eliminações.',
            icon: 'Target',
          },
          {
            label: 'Entradas + saídas completas',
            detail:
              'Monitorar rigorosamente tudo que entra e sai — incluindo secreções drenadas.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — só eliminações',
            detail:
              'Letra B: registrar só saídas — ingestão também compõe o balanço.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — só no fim do turno',
            detail:
              'Letra C: calcular só ao final — perde eventos intermediários.',
            icon: 'Clock',
          },
        {
          label: 'Pegadinha — só EV',
          detail:
            'Letra D: considerar apenas EV — ignora oral, sonda e perdas insensíveis registráveis.',
          icon: 'AlertTriangle',
        },
        PEGADINHA_ROI_EXTRA,
      ],
      footer_rule: 'Tudo que entra e sai → balanço confiável',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: balanço hídrico fidedigno — o que é necessário?',
          'Regra: balanço = entradas − saídas (todas as vias).',
          'Testar B — só eliminações: ignora ingestão e infusões → eliminar.',
          'Testar C — cálculo só no fim do turno: perde controle horário → eliminar.',
          'Testar D — só EV: omite oral e outras entradas → eliminar.',
          'Testar A — todas entradas e saídas incluindo drenos: completo → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Registro integral → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — balanço hídrico',
        meta: slideMeta,
        content: 'ENTRADA × SAÍDA × TEMPO',
        rows: [
          { label: 'Entradas', value: 'Oral · EV · medicamentos · sondas', sv_kind: 'meta', badge: 'hot' },
          { label: 'Saídas', value: 'Diurese · vômito · drenos · secreções', sv_kind: 'meta', badge: 'ok' },
          { label: 'Frequência', value: 'Registro contínuo no turno — não só no final', sv_kind: 'meta', badge: 'hot' },
          { label: 'Objetivo', value: 'Detectar retenção ou desidratação precoce', sv_kind: 'meta', badge: 'ok' },
          { label: 'SV associados', value: 'PA · FC · T — interpretar junto ao balanço', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Omitir uma via invalida o balanço',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BALANÇO IDESG',
        items: [
          {
            label: 'Letra B — só eliminações',
            detail: 'Registrar apenas líquidos eliminados — ingestão não interfere.',
            correct:
              'Ingestão e infusões são entradas obrigatórias — balanço sem entradas superestima perda hídrica.',
          },
          {
            label: 'Letra C — cálculo no fim do turno',
            detail: 'Realizar o balanço hídrico apenas ao final do turno.',
            correct:
              'Balanço exige registro contínuo — calcular só no fim do turno omite picos de entrada ou perda.',
          },
          {
            label: 'Letra D — só via intravenosa',
            detail: 'Considerar apenas líquidos administrados por via intravenosa.',
            correct:
              'Via oral, sondas e medicamentos diluídos também entram no balanço — restringir à EV subestima volume.',
          },
        ],
        footer_rule: 'Integralidade = letra A',
      },
    ],
  },

  'idesg-enfermagem-verificacao-de-sinais-vitais-1779343801786-1': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — gesso: inchaço excessivo + dor intensa + dormência distal = alerta de síndrome compartimental · monitorar SV · comunicar médico · técnico não remove gesso sem ordem',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gesso — sinais de alerta distal',
        meta: slideMeta,
        items: [
        {
          label: 'Comando da prova',
          detail:
            'Tala gessada recente · inchaço · dor intensa · dormência distal — conduta preventiva.',
          icon: 'Target',
        },
          {
            label: 'Tríade de alerta',
            detail:
              'Edema + dor desproporcional + parestesia distal — suspeita de comprometimento vascular/nervoso.',
            icon: 'AlertTriangle',
          },
          {
            label: 'SV + comunicação',
            detail:
              'Monitorar sinais vitais e acionar médico para reavaliar imobilização — conduta segura.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — remover gesso',
            detail:
              'Letra C: técnico remove tala sozinho — procedimento médico, não do técnico.',
            icon: 'Ban',
          },
        {
          label: 'Pegadinha — só analgésico',
          detail:
            'Letra B: analgésico mascara dor de compartimento sem tratar causa.',
          icon: 'Pill',
        },
        {
          label: 'Pegadinha — agir sem comunicar médico',
          detail:
            'Letras A–C resolvem localmente sem comunicar alteração de SV à equipe — conduta errada.',
          icon: 'Ban',
        },
        PEGADINHA_ROI_EXTRA,
      ],
      footer_rule: 'Alerta distal → SV + médico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: gesso recente · inchaço · dor forte · dormência distal.',
          'Interpretar: sinais neurovascular comprometidos — risco de síndrome compartimental.',
          'Testar A — só elevar membro: medida auxiliar, insuficiente isolada → eliminar.',
          'Testar B — só analgésico: mascara alerta sem resolver compressão → eliminar.',
          'Testar C — remover gesso: técnico não executa sem ordem médica → eliminar.',
          'Testar D — monitorar SV e comunicar médico: vigilância + escalonamento → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Não remova gesso · comunique → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vigilância com gesso',
        meta: slideMeta,
        content: '6 Ps DO MEMBRO IMOBILIZADO',
        rows: [
          { label: 'Dor', value: 'Desproporcional ou progressiva — alerta', sv_kind: 'meta', badge: 'hot' },
          { label: 'Parestesia', value: 'Dormência distal — comprometimento nervoso', sv_kind: 'meta', badge: 'hot' },
          { label: 'Edema', value: 'Inchaço excessivo — avaliar circulação', sv_kind: 'meta', badge: 'hot' },
          { label: 'SV', value: 'PA · FC · FR — instabilidade sistêmica associada', sv_kind: 'pa', badge: 'ok' },
          { label: 'Conduta técnico', value: 'Monitorar · registrar · comunicar médico', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Remover gesso = decisão médica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GESSO IDESG',
        items: [
          {
            label: 'Letra A — só elevar membro',
            detail: 'Orientar elevação da região imobilizada por períodos curtos.',
            correct:
              'Elevação auxilia edema, mas inchaço + dor intensa + dormência exigem avaliação médica urgente — não basta orientar posicionamento.',
          },
          {
            label: 'Letra B — só analgésico',
            detail: 'Administrar analgésicos para controlar dor e inchaço.',
            correct:
              'Analgésico sem avaliação médica mascara dor de compartimento — técnico não trata causa compressiva isoladamente.',
          },
          {
            label: 'Letra C — remover tala',
            detail: 'Remover tala gessada para avaliar lesão e realizar curativo.',
            correct:
              'Remoção de gesso é ato médico — técnico monitora SV e comunica equipe para reavaliação da imobilização.',
          },
        ],
        footer_rule: 'Alerta neurovascular → D',
      },
    ],
  },

  'unesc-enfermagem-verificacao-de-sinais-vitais-1778969729218-1': UNESC_SRPA,

  'unesc-enfermagem-verificacao-de-sinais-vitais-1780000468214-4': UNESC_SRPA,

  'unifil-enfermagem-verificacao-de-sinais-vitais-1779343845367-7': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — Escala de Aldrete SRPA: respiração 2=profunda · 1=dispneia/respiração superficial · 0=apneia · consciência 2=desperto · 1=desperta ao chamado · 0=não responde',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aldrete — respiração e consciência',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Dispneia + desperta só ao ser chamado — pontuação de respiração e consciência na Aldrete.',
            icon: 'Target',
          },
          {
            label: 'Respiração = 1',
            detail:
              'Dispneia ou respiração superficial — não atinge 2 (respiração profunda/capaz de tossir).',
            icon: 'Wind',
          },
          {
            label: 'Consciência = 1',
            detail:
              'Desperta ao ser chamado pelo nome — não está totalmente desperto (2).',
            icon: 'Brain',
          },
          {
            label: 'Pegadinha — respiração 2',
            detail:
              'Letras A e D atribuem 2 à respiração — dispneia não pontua máximo.',
            icon: 'Ban',
          },
        {
          label: 'Pegadinha — consciência 2 ou 0',
          detail:
            'Letra B dá 2 à consciência; letra A dá 0 — paciente responde ao chamado = 1.',
          icon: 'GitCompare',
        },
        PEGADINHA_ROI_EXTRA,
      ],
      footer_rule: 'Dispneia=1 · desperta ao chamado=1 → 1 e 1',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: pontuar respiração e consciência na Escala de Aldrete.',
          'Respiração — dispneia: não respira profundamente → pontua 1 (não 2).',
          'Consciência — desperta ao chamado: não totalmente desperto → pontua 1 (não 2).',
          'Testar A — 2 e 0: superestima respiração e subestima consciência → eliminar.',
          'Testar B — 1 e 2: superestima consciência (desperto pleno) → eliminar.',
          'Testar D — 2 e 1: superestima respiração (dispneia ≠ 2) → eliminar.',
          'Testar E — 0 e 0: subestima consciência que responde ao chamado → eliminar.',
          'Testar C — 1 e 1: dispneia + desperta ao chamado → candidata.',
          'Marcar C.',
        ],
        footer_rule: '1 + 1 = letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Aldrete (trecho)',
        meta: slideMeta,
        content: 'RESPIRAÇÃO × CONSCIÊNCIA',
        rows: [
          { label: 'Respiração 2', value: 'Respira profundamente / consegue tossir', sv_kind: 'fr', badge: 'ok' },
          { label: 'Respiração 1', value: 'Dispneia ou respiração superficial', sv_kind: 'fr', badge: 'hot' },
          { label: 'Respiração 0', value: 'Apneia', sv_kind: 'fr', badge: 'hot' },
          { label: 'Consciência 2', value: 'Totalmente desperto', sv_kind: 'meta', badge: 'ok' },
          { label: 'Consciência 1', value: 'Desperta ao ser chamado', sv_kind: 'meta', badge: 'hot' },
          { label: 'Consciência 0', value: 'Não responde', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Dispneia nunca pontua 2 na respiração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ALDRETE UNIFIL',
        items: [
          {
            label: 'Letra A — 2 e 0',
            detail: 'Respiração 2 e consciência 0.',
            correct:
              'Dispneia pontua 1 na respiração, não 2 — e paciente que desperta ao chamado pontua 1 em consciência, não 0.',
          },
          {
            label: 'Letra B — 1 e 2',
            detail: 'Respiração 1 e consciência 2.',
            correct:
              'Respiração 1 está correta para dispneia, mas consciência 2 exige paciente totalmente desperto — despertar só ao chamado = 1.',
          },
          {
            label: 'Letra D — 2 e 1',
            detail: 'Respiração 2 e consciência 1.',
            correct:
              'Consciência 1 está correta, mas dispneia não permite pontuação 2 em respiração — máximo seria 1.',
          },
          {
            label: 'Letra E — 0 e 0',
            detail: 'Respiração 0 e consciência 0.',
            correct:
              'Paciente com dispneia respira (pontua 1, não apneia) e desperta ao chamado (consciência 1, não 0).',
          },
        ],
        footer_rule: 'Dispneia + desperta ao chamado = 1 e 1 (C)',
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
    console.log(`[handcraft:sv-g32] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g32] total=${ok}`);
}

main();
