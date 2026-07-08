#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g23 (8 slugs P0 vitals_pa_tecnica pos 177–184).
 *
 *   npm run handcraft:sinais-vitais-g23
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g23';
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
    'artéria braquial sob manguito',
    'Korotkoff fases I e V',
    'PA gestante MS',
    'PA ortostática',
    'prova do laço dengue',
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
  'vunesp-enfermagem-verificacao-de-sinais-vitais-1778969752567-8': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — manguito sobre artéria braquial centralizada · braço na altura do coração · poplítea/femoral/carótida não são sítios de PA braquial',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Artéria braquial — aferição PA no braço',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Qual artéria deve ser palpada e centralizada sob o manguito para aferir PA no braço.',
            icon: 'Target',
          },
          {
            label: 'Sítio correto',
            detail:
              'Artéria braquial na fossa antecubital — manguito cobre e comprime esse vaso.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — poplítea',
            detail: 'Letra A: artéria da fossa poplítea — membro inferior, não braço.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — carótida',
            detail: 'Letra B: pulso cervical — risco e técnica distinta da PA braquial.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — radial',
            detail:
              'Letra E: radial é para pulso/FC — ausculta Korotkoff exige braquial sob o manguito.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'PA no braço = artéria braquial',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: artéria palpada e centralizada sob o manguito no braço.',
          'Lembrar: esfigmomanômetro comprime artéria braquial na fossa antecubital.',
          'Testar A — poplítea: membro inferior → eliminar.',
          'Testar B — carótida: pescoço, não braço → eliminar.',
          'Testar C — braquial: sítio padrão de PA → candidata.',
          'Testar D — femoral: coxa, não braço → eliminar.',
          'Testar E — radial: pulso periférico, não sob manguito PA → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Braquial sob manguito → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — artérias e PA',
        meta: slideMeta,
        content: 'DECORE — ONDE MEDIR PA NO BRAÇO',
        rows: [
          { label: 'Artéria alvo', value: 'Braquial — fossa antecubital', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: 'Bexiga centralizada sobre a braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Radial', value: 'Pulso/FC — não substitui sítio do manguito', sv_kind: 'fc', badge: 'ok' },
          { label: 'Poplítea/femoral', value: 'Membros inferiores — outro contexto clínico', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Palpar braquial antes de insuflar o manguito',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ARTÉRIA VUNESP',
        items: [
          {
            label: 'Letra A — poplítea',
            detail: 'Artéria da fossa poplítea.',
            correct:
              'Poplítea fica no joelho — aferição de PA no braço exige artéria braquial centralizada sob o manguito.',
          },
          {
            label: 'Letra B — carótida',
            detail: 'Pulso cervical.',
            correct:
              'Carótida é pulso central no pescoço — não é o vaso comprimido pelo esfigmomanômetro no membro superior.',
          },
          {
            label: 'Letra D — femoral',
            detail: 'Artéria da virilha.',
            correct:
              'Femoral é pulso central da coxa — técnica de PA braquial usa braquial, não femoral.',
          },
          {
            label: 'Letra E — radial',
            detail: 'Pulso no punho.',
            correct:
              'Radial serve para palpar FC — sob o manguito a artéria correta é a braquial, onde se auscultam os sons Korotkoff.',
          },
        ],
        footer_rule: 'Só braquial fecha PA no braço',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1778969760552-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS — PA gestante: sentada · braço direito · braço elevado na altura do coração · diastólica na fase V Korotkoff (desaparecimento do som)',
    exam_vs_current:
      'Prova preenche lacunas com MS gestante — decúbito lateral e fase I para diastólica são distratores clássicos',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA na gestante — lacunas MS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Completar técnica MS para PA fidedigna em gestante: posição, braço, altura e critério diastólico.',
            icon: 'Target',
          },
          {
            label: 'Posição',
            detail: 'Sentada — não decúbito lateral nas lacunas do gabarito.',
            icon: 'Armchair',
          },
          {
            label: 'Membro e altura',
            detail: 'Braço direito elevado na altura do coração.',
            icon: 'Scale',
          },
          {
            label: 'Diastólica',
            detail: '5º ruído Korotkoff — desaparecimento do som (fase V).',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — decúbito lateral',
            detail: 'Letras A, D: decúbito lateral esquerdo — não fecha as lacunas MS desta questão.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 1º som = diastólica',
            detail: 'Letras A e E: 1º Korotkoff para diastólica — confunde fase I (sistólica).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Gestante sentada · braço direito · fase V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: completar lacunas da técnica MS para PA em gestante.',
          '1ª lacuna — posição: sentada (não decúbito) → eliminar A, B, D.',
          '2ª lacuna — braço: direito na altura do coração → candidata C.',
          '3ª lacuna — elevação: na altura do coração, não lateral do corpo.',
          '4ª lacuna — diastólica: 5º ruído = desaparecimento (fase V).',
          'Testar C — sentada · direito · altura coração · 5º desaparecimento → fecha.',
          'Testar E — braço esquerdo e 1º som para diastólica → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'MS gestante → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA gestante e Korotkoff',
        meta: slideMeta,
        content: 'DECORE — LACUNAS TÉCNICAS',
        rows: [
          { label: 'Posição', value: 'Sentada · repouso · ambiente calmo', sv_kind: 'pa', badge: 'ok' },
          { label: 'Braço', value: 'Direito · elevado na altura do coração', sv_kind: 'pa', badge: 'hot' },
          { label: 'Sistólica', value: '1º som Korotkoff (fase I)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Diastólica', value: '5º som — desaparecimento total (fase V)', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: '1º som = sistólica · desaparecimento = diastólica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GESTANTE VUNESP',
        items: [
          {
            label: 'Letra A — decúbito lateral esquerdo',
            detail: 'Decúbito · braço esquerdo · 1º som para diastólica.',
            correct:
              'Decúbito lateral e diastólica no 1º som invertem a técnica MS — gestante sentada com braço direito na altura do coração.',
          },
          {
            label: 'Letra B — decúbito lateral direito',
            detail: 'Decúbito · 4º ruído · apoiado na lateral.',
            correct:
              'Posição em decúbito e braço apoiado na lateral do corpo não correspondem ao protocolo MS cobrado nas lacunas.',
          },
          {
            label: 'Letra D — mistura decúbito e 4º ruído',
            detail: 'Decúbito esquerdo · braço direito lateral · enfraquecimento.',
            correct:
              'Combina decúbito lateral com critério diastólico por enfraquecimento (fase IV) — MS exige sentada e fase V.',
          },
          {
            label: 'Letra E — braço esquerdo e 1º som',
            detail: 'Sentada · esquerdo · acima do coração · aparecimento.',
            correct:
              'Braço esquerdo e diastólica no aparecimento do 1º som erram membro e fase Korotkoff — gabarito usa direito e desaparecimento.',
          },
        ],
        footer_rule: 'Só C fecha todas as lacunas',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1778969768866-0': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — deflação lenta e constante do manguito · deflação rápida distorce leitura: sistólica falsamente baixa e diastólica falsamente alta',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Erro técnico — deflação rápida',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Efeito de desinflar o manguito muito rapidamente na leitura da pressão arterial.',
            icon: 'Target',
          },
          {
            label: 'Deflação rápida',
            detail:
              'Sistólica falsamente baixa + diastólica falsamente alta — alternativa A.',
            icon: 'Activity',
          },
          {
            label: 'Técnica correta',
            detail: 'Deflação lenta e constante após diastólica — velocidade inadequada distorce.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — inversão',
            detail:
              'Letra B: inverte o par distorcido — banca cobra o efeito clássico da deflação rápida.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — só um componente',
            detail: 'Letras C, D e E: alteram apenas sistólica ou ambas igualmente.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Rápido = PAS baixa · PAD alta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: consequência de desinflar o manguito muito rapidamente.',
          'Contexto: deflação rápida não permite ausculta fidedigna dos Korotkoff.',
          'Efeito clássico: sistólica subestimada · diastólica superestimada.',
          'Testar A — PAS baixa e PAD alta → candidata.',
          'Testar B — inversão do efeito → eliminar.',
          'Testar C — só diastólica baixa → eliminar.',
          'Testar D e E — ambas altas ou baixas → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Deflação rápida → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — velocidade de deflação',
        meta: slideMeta,
        content: 'DEFLAÇÃO LENTA EVITA DISTORÇÃO',
        rows: [
          { label: 'Velocidade MS', value: 'Deflação lenta e constante — nunca rápida', sv_kind: 'pa', badge: 'hot' },
          { label: 'Deflação rápida', value: 'PAS falsamente baixa · PAD falsamente alta', sv_kind: 'pa', badge: 'warn' },
          { label: 'Após diastólica', value: 'Auscultar 20–30 mmHg abaixo do último som', sv_kind: 'pa', badge: 'ok' },
          { label: 'Registro', value: 'Anotar valores sem arredondar às dezenas', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Rapidez na deflação = leitura inválida',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFLAÇÃO VUNESP',
        items: [
          {
            label: 'Letra B — inversão PAS/PAD',
            detail: 'Sistólica alta e diastólica baixa.',
            correct:
              'Inverte o efeito real — deflação rápida reduz a sistólica percebida e eleva a diastólica, não o contrário.',
          },
          {
            label: 'Letra C — só diastólica baixa',
            detail: 'Altera apenas a diastólica para baixo.',
            correct:
              'Deflação rápida superestima a diastólica — não a reduz isoladamente como nesta alternativa.',
          },
          {
            label: 'Letra D — ambas altas',
            detail: 'Sistólica e diastólica falsamente elevadas.',
            correct:
              'Deflação rápida não eleva ambos os valores — o padrão cobrado é sistólica baixa com diastólica alta.',
          },
          {
            label: 'Letra E — ambas baixas',
            detail: 'Sistólica e diastólica falsamente baixas.',
            correct:
              'A diastólica fica falsamente alta na deflação rápida — não há queda simultânea dos dois componentes.',
          },
        ],
        footer_rule: 'Par distorcido clássico → A',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1778969768866-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS — 1º som Korotkoff = sistólica · abafamento (fase IV) registrado quando sons persistem até 0 mmHg · anotar valores auscultados',
    exam_vs_current:
      'Caso extremo: sons até 0 mmHg — gabarito 138/122/zero reflete leitura do enunciado, não fase V isolada',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Leitura Korotkoff — caso clínico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Anotar PA após 1º som 138 mmHg, abafamento 122 mmHg e sons até 0 mmHg.',
            icon: 'Target',
          },
          {
            label: 'Sistólica',
            detail: '1º som audível = 138 mmHg (fase I).',
            icon: 'Activity',
          },
          {
            label: 'Abafamento',
            detail: 'Marcação de 122 mmHg no abafamento (fase IV).',
            icon: 'Stethoscope',
          },
          {
            label: 'Registro MS',
            detail: 'PA braço direito = 138/122/zero mmHg — letra B.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha — arredondar',
            detail: 'Letra A: 140/120 — arredonda valores do enunciado.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — escala errada',
            detail: 'Letras C, D, E: dividem por 10 ou omitem zero diastólico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Transcrever ausculta · não arredondar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: anotar PA conforme ausculta descrita no caso.',
          '1º som em 138 mmHg → sistólica = 138.',
          'Abafamento em 122 mmHg → segundo valor = 122.',
          'Sons persistem até 0 → diastólica registrada como zero no gabarito.',
          'Testar A — 140/120/zero: arredonda → eliminar.',
          'Testar B — 138/122/zero: transcrição fiel → candidata.',
          'Testar C, D, E — escala ou formato incorreto → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Valores literais do caso → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fases Korotkoff',
        meta: slideMeta,
        content: 'REGISTRE O QUE AUSCULTAR',
        rows: [
          { label: 'Fase I', value: '1º som = pressão sistólica', sv_kind: 'pa', badge: 'ok' },
          { label: 'Fase IV', value: 'Abafamento (muffling) do som', sv_kind: 'pa', badge: 'ok' },
          { label: 'Fase V', value: 'Desaparecimento — diastólica padrão MS', sv_kind: 'pa', badge: 'hot' },
          { label: 'Sons até 0', value: 'Registrar conforme protocolo do enunciado', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Não arredondar 138 para 140 na prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KOROTKOFF IDOSO',
        items: [
          {
            label: 'Letra A — 140/120/zero',
            detail: 'Arredonda sistólica e abafamento.',
            correct:
              'Arredondar 138 para 140 e 122 para 120 altera a leitura auscultada — o prontuário deve refletir os valores exatos do manômetro.',
          },
          {
            label: 'Letra C — 14 x 12 mmHg',
            detail: 'Divide valores por 10.',
            correct:
              'Confunde escala — pressão arterial registra-se em mmHg inteiros (138/122), não em décimos.',
          },
          {
            label: 'Letra D — 13,8 x 12,2 mmHg',
            detail: 'Usa vírgula decimal indevida.',
            correct:
              'Formato decimal não corresponde à ausculta descrita — manômetro analógico marca 138 e 122 mmHg.',
          },
          {
            label: 'Letra E — 14/12/zero',
            detail: 'Reduz ambos os valores às dezenas.',
            correct:
              'Omitir dezenas e unidades distorce a PA aferida — gabarito transcreve 138/122 conforme o relato.',
          },
        ],
        footer_rule: 'Transcrição literal → B',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343856589-4': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS dengue — prova do laço: insuflar manguito até 100 mmHg · manter 5 min · quadrado 2,5 cm a 5 cm abaixo da dobra do cotovelo · contar petéquias',
    exam_vs_current:
      'PA 118×82 no caso é contexto — insuflação do laço usa 100 mmHg fixo, não valor sistólico',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prova do laço — dengue gestante',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Completar técnica da prova do laço em gestante com suspeita de dengue na UPA.',
            icon: 'Target',
          },
          {
            label: 'Insuflação',
            detail: 'Manguito insuflado até 100 mmHg — não o valor da PA aferida.',
            icon: 'Activity',
          },
          {
            label: 'Tempo',
            detail: 'Manter insuflado por 5 minutos.',
            icon: 'Clock',
          },
          {
            label: 'Marcação',
            detail: 'Quadrado 2,5 cm de lado · 5 cm abaixo da dobra do cotovelo.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha — PA como insuflação',
            detail: 'Letras A e E: usam 118 mmHg (PA do caso) em vez de 100.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — tempo curto',
            detail: 'Letras A, B e C: 90 s ou 3 min — abaixo dos 5 min exigidos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '100 mmHg · 5 min · 5 cm abaixo cotovelo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: lacunas da prova do laço em gestante com dengue.',
          'PA 118×82 é dado contextual — laço usa pressão fixa de insuflação.',
          '1ª lacuna — insuflar até 100 mmHg (não 118 nem 82).',
          '2ª lacuna — manter 5 minutos insuflado.',
          '3ª lacuna — marcar 5 cm abaixo da dobra do cotovelo.',
          'Testar D — 100 · 5 min · 5 cm → fecha todas.',
          'Testar A, B, C, E — PA como insuflação ou tempo/distância errados → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'Protocolo dengue → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — prova do laço MS',
        meta: slideMeta,
        content: 'DECORE — PROVA DO LAÇO',
        rows: [
          { label: 'Insuflação', value: '100 mmHg — valor fixo do protocolo', sv_kind: 'pa', badge: 'hot' },
          { label: 'Tempo', value: '5 minutos com manguito insuflado', sv_kind: 'meta', badge: 'ok' },
          { label: 'Área', value: 'Quadrado 2,5 cm · 5 cm abaixo do cotovelo', sv_kind: 'meta', badge: 'ok' },
          { label: 'Leitura', value: 'Contar petéquias dentro do quadrado', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Não confundir PA aferida com pressão do laço',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LAÇO DENGUE',
        items: [
          {
            label: 'Letra A — 118 mmHg e 90 segundos',
            detail: 'Usa PA sistólica e tempo insuficiente.',
            correct:
              '118 mmHg é a PA medida — prova do laço insufla até 100 mmHg fixos por 5 minutos, não 90 segundos.',
          },
          {
            label: 'Letra B — 100 mmHg mas 3 min e 10 cm',
            detail: 'Acerta insuflação mas erra tempo e distância.',
            correct:
              'Embora 100 mmHg esteja correto, 3 minutos e 10 cm abaixo do cotovelo não fecham o protocolo MS de 5 min e 5 cm.',
          },
          {
            label: 'Letra C — diastólica 82 mmHg',
            detail: 'Insufla até valor diastólico da PA.',
            correct:
              '82 mmHg é a diastólica aferida — laço usa pressão padronizada de 100 mmHg independente da PA basal.',
          },
          {
            label: 'Letra E — 118 mmHg e 5 min',
            detail: 'Mistura PA sistólica com tempo correto.',
            correct:
              'Cinco minutos está certo, mas insuflar até 118 mmHg confunde valor da aferição com pressão fixa do laço (100 mmHg).',
          },
        ],
        footer_rule: 'Só D fecha 100/5/5',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343865210-2': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'COFEN/MS — FR conta-se visualmente, por palpação do tórax ou ausculta ventilatória · SpO₂ é 5º sinal mas não substitui FR · temperatura varia com método e sítio',
    roi_error: 'oximetro_substitui_palpacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Assertivas — SV do adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Assinalar afirmativa CORRETA sobre verificação de sinais vitais no adulto.',
            icon: 'Target',
          },
          {
            label: 'FR — métodos válidos',
            detail:
              'Contagem visual, palpação do tórax ou ausculta pulmonar — letra E.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — SpO₂ substitui FR',
            detail:
              'Letra A: saturação substitui FR em doença respiratória — complementa, não substitui.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — braço 90°',
            detail:
              'Letra B: braço a 90° do tórax no acamado — deve ficar na altura do coração.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — temperatura constante',
            detail: 'Letra C: nega variação circadiana e por sítio de aferição.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — FC dispensável',
            detail: 'Letra D: dispensa FC na arritmia — continua obrigatória.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'FR tem três vias de contagem válidas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa CORRETA sobre SV no adulto.',
          'Testar A — SpO₂ substitui FR: 5º sinal complementa, não substitui → eliminar.',
          'Testar B — braço 90° no acamado: altura do coração, não ângulo fixo → eliminar.',
          'Testar C — temperatura constante: varia com horário e sítio → eliminar.',
          'Testar D — dispensar FC na arritmia: FC mantém valor clínico → eliminar.',
          'Testar E — FR visual, palpação ou ausculta: técnicas aceitas → candidata.',
          'Confirmar única assertiva verdadeira.',
          'Marcar E.',
        ],
        footer_rule: 'Métodos de FR → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnicas de SV',
        meta: slideMeta,
        content: 'DECORE — COMO AFERIR',
        rows: [
          { label: 'FR', value: 'Visual · palpação torácica · ausculta pulmonar', sv_kind: 'fr', badge: 'hot' },
          { label: 'SpO₂', value: '5º sinal vital — complementa FR, não substitui', sv_kind: 'meta', badge: 'ok' },
          { label: 'PA acamado', value: 'Braço na altura do coração — não 90° fixo', sv_kind: 'pa', badge: 'ok' },
          { label: 'Temperatura', value: 'Varia com sítio, horário e método', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'FC registra-se mesmo com arritmia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSERTIVAS VUNESP',
        items: [
          {
            label: 'Letra A — SpO₂ substitui FR',
            detail: 'Saturação substitui frequência respiratória.',
            correct:
              'SpO₂ é o quinto sinal vital e complementa a avaliação — não dispensa contagem da FR mesmo em afecções respiratórias.',
          },
          {
            label: 'Letra B — braço 90° no acamado',
            detail: 'Manguito com braço a 90° do tórax.',
            correct:
              'No paciente acamado o braço deve permanecer na altura do coração — ângulo fixo de 90° não é a orientação MS/SBC.',
          },
          {
            label: 'Letra C — temperatura constante',
            detail: 'Temperatura não varia no dia nem por termômetro.',
            correct:
              'Temperatura corporal tem ritmo circadiano e difere entre axilar, oral e timpânica — não é constante.',
          },
          {
            label: 'Letra D — dispensar FC na arritmia',
            detail: 'FC perde valor e pode ser omitida.',
            correct:
              'Arritmia exige atenção redobrada à FC — o parâmetro não perde valor clínico nem sai dos registros de SV.',
          },
        ],
        footer_rule: 'Só E descreve FR corretamente',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343865210-4': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS 2022 — PA gestante: sentada · manguito 13 cm (adulto médio) · membro superior direito · braço na altura do coração',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA gestante — MS 2022 (lacunas)',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'UPA — gestante eutrófica em observação; prescrição de enfermagem com PA a cada quatro horas (MS 2022).',
            icon: 'Target',
          },
          {
            label: 'Prescrição do caso',
            detail:
              'Aferição da pressão arterial a cada quatro horas — técnico completa lacunas de posição, manguito e membro.',
            icon: 'ClipboardList',
          },
          {
            label: 'Posição',
            detail: 'Gestante sentada — não decúbito lateral.',
            icon: 'Armchair',
          },
          {
            label: 'Manguito',
            detail: '13 cm de largura — tamanho adulto médio.',
            icon: 'Scale',
          },
          {
            label: 'Membro',
            detail: 'Braço direito na altura do coração.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — decúbito',
            detail: 'Letras A, B, C: decúbito lateral — não preenche lacuna MS 2022.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — manguito largo',
            detail: 'Letras A e E: 18–20 cm — extrapola tamanho padrão da lacuna.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sentada · 13 cm · braço direito',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: lacunas da PA em gestante eutrófica na UPA — prescrição a cada quatro horas (MS 2022).',
          '1ª lacuna — posição: sentada → eliminar A, B, C.',
          '2ª lacuna — manguito: 13 cm (adulto médio) → eliminar A, E (20 cm).',
          '3ª lacuna — membro: direito na altura do coração.',
          'Testar D — sentada · 13 cm · direito → fecha.',
          'Testar E — sentada mas 20 cm e braço esquerdo → eliminar.',
          'Confirmar única sequência MS.',
          'Marcar D.',
        ],
        footer_rule: 'MS 2022 gestante → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA gestante MS',
        meta: slideMeta,
        content: 'LACUNAS DO PROTOCOLO 2022',
        rows: [
          { label: 'Posição', value: 'Sentada · repouso · pés apoiados', sv_kind: 'pa', badge: 'ok' },
          { label: 'Manguito', value: '13 cm — circunferência braquial média', sv_kind: 'pa', badge: 'hot' },
          { label: 'Membro', value: 'Superior direito · altura do coração', sv_kind: 'pa', badge: 'ok' },
          { label: 'Frequência', value: 'A cada 4 h se prescrito — contexto UPA', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Manguito proporcional ao braço da gestante',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GESTANTE MS 2022',
        items: [
          {
            label: 'Letra A — decúbito e 20 cm',
            detail: 'Decúbito lateral esquerdo · manguito 20 cm.',
            correct:
              'MS 2022 orienta gestante sentada com manguito de 13 cm no braço direito — decúbito e manguito largo não fecham as lacunas.',
          },
          {
            label: 'Letra B — decúbito direito',
            detail: 'Decúbito lateral direito · 18 cm.',
            correct:
              'Posição em decúbito lateral e manguito de 18 cm divergem do protocolo sentado com 13 cm cobrado na prova.',
          },
          {
            label: 'Letra C — decúbito esquerdo 18 cm',
            detail: 'Decúbito lateral esquerdo · braço esquerdo.',
            correct:
              'Decúbito lateral esquerdo não é a posição das lacunas — técnica exige sentada com membro direito.',
          },
          {
            label: 'Letra E — braço esquerdo e 20 cm',
            detail: 'Sentada mas membro e manguito errados.',
            correct:
              'Acerta sentada, mas manguito de 20 cm e braço esquerdo contrariam MS 2022 — gabarito usa 13 cm e braço direito.',
          },
        ],
        footer_rule: 'Só D preenche as três lacunas',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343865210-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — PA ortostática: aferir sentado e em pé no protocolo de ortostatismo · detectar hipotensão ortostática em hipertensos e diabéticos',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA sentado e em pé — propósito',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'UBS — encontros semanais com hipertensos e diabéticos; glicemia capilar e PA sentado/em pé para educação em saúde.',
            icon: 'Target',
          },
          {
            label: 'Sequência do caso',
            detail:
              'PA sentada → em pé após um minuto → em pé imóvel pelo tempo do protocolo ortostático MS.',
            icon: 'Clock',
          },
          {
            label: 'Objetivo clínico',
            detail: 'Verificar hipotensão ortostática — letra D.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — confirmar sistólica',
            detail: 'Letra A: só confirma sistólica — medição serial tem outro fim.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — avental branco',
            detail: 'Letra C: efeito do avental branco — contexto domiciliar/grupo, não consultório.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — mascaramento',
            detail: 'Letra E: efeito de mascaramento — distinto de queda postural.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Em pé após sentado = rastrear ortostática',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: propósito da PA sentada + em pé no encontro educativo UBS.',
          'Contexto: usuários com hipertensão arterial e/ou diabete — risco de queda de PA ao levantar.',
          'Testar A — confirmar só sistólica: incompleto → eliminar.',
          'Testar B — confirmar só diastólica: incompleto → eliminar.',
          'Testar C — efeito avental branco: ansiedade no consultório → eliminar.',
          'Testar D — hipotensão ortostática: queda PA em pé → candidata.',
          'Testar E — efeito mascaramento: fenômeno distinto → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'Mudança postural → ortostática',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA ortostática',
        meta: slideMeta,
        content: 'RASTREIO EM GRUPOS DE RISCO',
        rows: [
          { label: 'Protocolo', value: 'Sentado → em pé — ortostatismo MS', sv_kind: 'pa', badge: 'hot' },
          { label: 'Hipotensão ortostática', value: 'Queda ≥ 20 mmHg PAS ou ≥ 10 PAD ao levantar', sv_kind: 'pa', badge: 'ok' },
          { label: 'População', value: 'Idosos · hipertensos · diabéticos', sv_kind: 'meta', badge: 'ok' },
          { label: 'Avental branco', value: 'PA elevada no consultório — outro fenômeno', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Grupo educativo ≠ efeito avental branco',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA ORTOSTÁTICA',
        items: [
          {
            label: 'Letra A — confirmar sistólica',
            detail: 'Só validar pressão sistólica.',
            correct:
              'Medição sentado e em pé não visa apenas confirmar sistólica — compara resposta hemodinâmica à mudança postural.',
          },
          {
            label: 'Letra B — confirmar diastólica',
            detail: 'Só validar pressão diastólica.',
            correct:
              'O método ortostático avalia queda de PA ao levantar — não se limita a confirmar valor diastólico isolado.',
          },
          {
            label: 'Letra C — efeito avental branco',
            detail: 'Investigar ansiedade no ambiente clínico.',
            correct:
              'Avental branco é PA elevada no consultório — aqui a técnica mede PA em pé após sentado em encontro educativo.',
          },
          {
            label: 'Letra E — efeito mascaramento',
            detail: 'PA normal no consultório mascarando hipertensão.',
            correct:
              'Mascaramento descreve normotensão no consultório com hipertensão fora — não explica medição serial sentado/em pé.',
          },
        ],
        footer_rule: 'Queda postural → D',
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
    console.log(`[handcraft:sv-g23] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g23] total=${ok}`);
}

main();
