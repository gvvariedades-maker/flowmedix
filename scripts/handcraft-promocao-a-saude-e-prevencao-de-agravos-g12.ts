#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g12 (13 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g12
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g12';
const SUBTOPICO = 'Promoção à Saúde e Prevenção de Agravos';
const REVIEWED = '2026-07-20';

const MS_PROMOCAO_SOURCE = {
  id: PROMOCAO_SAUDE_SUS.id,
  tier: 'A' as const,
  issuer: PROMOCAO_SAUDE_SUS.issuer,
  title: PROMOCAO_SAUDE_SUS.title,
  year: PROMOCAO_SAUDE_SUS.year,
  url: PROMOCAO_SAUDE_SUS.url,
  covers: [
    'controle de vetores',
    'anemia',
    'autocuidado diabetes',
    'PN DST/AIDS',
    'prevenção primária',
    'dengue',
    'Pacto em Defesa do SUS',
    'diarreia aguda',
    'autocuidado crônico',
    'saneamento ambiental',
    'educação em saúde',
    'rastreamento HAS',
    'planejamento familiar',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'promocao_educacao_prevencao'
  | 'promocao_principios_direitos'
  | 'promocao_generico';

type Pack = {
  family: 'legis' | 'certo_errado' | 'conceito' | 'protocolo' | 'vf';
  branch: Branch;
  guideline: string;
  examVsCurrent?: 'none' | 'catalog_gabarito_repaired';
  sources?: (typeof MS_PROMOCAO_SOURCE)[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

/** Gabarito corrigido no handcraft (erro de chave no catálogo). */
const GABARITO_FIX: Record<string, string> = {
  'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-8': 'A',
};

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    topico: String(q.meta.topico ?? 'Enfermagem'),
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
      exam_vs_current: pack.examVsCurrent ?? 'none',
      catalog_slug: slug,
    },
    sources: pack.sources ?? [MS_PROMOCAO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\bnasformas\b/gi, 'nas formas')
    .replace(/\bSãoconsideradas\b/gi, 'São consideradas')
    .replace(/\baçõeseducativas\b/gi, 'ações educativas')
    .replace(/\bdaqualidade\b/gi, 'da qualidade')
    .replace(/\bEsseconceito\b/gi, 'Esse conceito')
    .replace(/\bEssasdiretrizes\b/gi, 'Essas diretrizes')
    .replace(/\bdoHIV\b/gi, 'do HIV')
    .replace(/\bedemais\b/gi, 'e demais')
    .replace(/\bsaneamentobásico\b/gi, 'saneamento básico')
    .replace(/\bnãomedicamentoso\b/gi, 'não medicamentoso')
    .replace(/\bnoprontuário\b/gi, 'no prontuário')
    .replace(/\bsexualmentetransmissíveis\b/gi, 'sexualmente transmissíveis')
    .replace(/\bdascondutas\b/gi, 'das condutas')
    .replace(/\bdaspessoas\b/gi, 'das pessoas')
    .replace(/\behigienização\b/gi, 'e higienização')
    .replace(/\bAgência Nacional deSaúde\b/gi, 'Agência Nacional de Saúde')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfNoise(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfNoise(o.text) })),
  };
}

function applyGabaritoFix(slug: string, qd: Q['question_data']): Q['question_data'] {
  const fixed = GABARITO_FIX[slug];
  if (!fixed) return qd;
  return {
    ...qd,
    options: qd.options.map((o) => ({ ...o, is_correct: o.id === fixed })),
  };
}

const SPECS: Record<string, Pack> = {
  'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-8': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Controle focal Aedes aegypti — larvicidas (MS/SVS)',
    examVsCurrent: 'catalog_gabarito_repaired',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Larvicida Aedes',
        meta: slideMeta,
        items: [
          { label: 'Controle focal', detail: 'Tratar criadouros positivos nas formas larvárias.', icon: 'Target' },
          { label: 'Larvicida', detail: 'Produto químico/biológico para matar larvas e pupas.', icon: 'Droplets' },
          { label: 'Objetivo', detail: 'Interromper o ciclo antes do mosquito adulto.', icon: 'Ban' },
          { label: 'Não confundir', detail: 'Não estimular larvas nem “melhorar” água do criadouro.', icon: 'AlertTriangle' },
          { label: 'Promoção', detail: 'Vigilância em saúde e controle de vetores no território.', icon: 'Shield' },
        ],
        footer_rule: 'Larvicida mata larvas e pupas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: objetivo principal da aplicação de larvicidas em criadouros positivos (Aedes).',
          'Eliminar B — estimular reprodução de mosquitos contaminados: oposto do controle.',
          'Eliminar C — promover crescimento até fase adulta: larvicida impede desenvolvimento.',
          'Eliminar D — melhorar qualidade da água: não é finalidade do larvicida.',
          'Manter A — eliminar larvas e pupas presentes nos recipientes.',
          'Marcar letra A.',
          'Em similares: larvicida = morte de formas imaturas, não adulticida.',
        ],
        footer_rule: 'Eliminar formas imaturas = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LARVICIDA NO AEDES',
        rows: [
          { label: 'Alvo', value: 'Larvas e pupas no criadouro', badge: 'hot' },
          { label: 'Momento', value: 'Controle focal após visita', badge: 'hot' },
          { label: '≠', value: 'Estimular ciclo ou “tratar” água', badge: 'warn' },
          { label: 'Meta', value: 'Reduzir vetor antes do voo', badge: 'ok' },
        ],
        footer_rule: 'Matar imaturas no recipiente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LARVICIDA',
        items: [
          {
            label: 'Letra B — reprodução',
            detail: 'Estimular mosquitos contaminados.',
            correct: 'Contradiz o controle vetorial — eliminar.',
          },
          {
            label: 'Letra C — crescimento',
            detail: 'Promover larvas até adulto.',
            correct: 'Larvicida interrompe o ciclo — falsa.',
          },
          {
            label: 'Letra D — qualidade da água',
            detail: 'Melhorar água do criadouro.',
            correct: 'Não é objetivo do larvicida.',
          },
          {
            label: 'Transferência — adulticida',
            detail: 'Confundir com nebulização contra adultos.',
            correct: 'Larvicida elimina larvas e pupas — A.',
          },
        ],
        footer_rule: 'A = eliminar larvas e pupas',
      },
    ],
  },

  'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção de anemia — suplementação e educação alimentar (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anemia — promoção',
        meta: slideMeta,
        items: [
          { label: 'Anemia', detail: 'Baixa hemoglobina por carência de micronutrientes.', icon: 'HeartPulse' },
          { label: 'Grupos de risco', detail: 'Suplementação direcionada (ferro/folato).', icon: 'Users' },
          { label: 'Educação', detail: 'Conscientização sobre nutrientes e diversificação alimentar.', icon: 'Apple' },
          { label: 'Público', detail: 'Ações para população em geral — não só crianças.', icon: 'Megaphone' },
          { label: 'Pegadinha', detail: 'Fast-food, palestra só para pais ou campanha infantil exclusiva.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Suplementar risco + educar alimentação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: estratégias de promoção aliadas à prevenção da anemia.',
          'Manter A — suplementação de grupos de risco + conscientização e diversificação alimentar.',
          'Eliminar B — fast-food calórico: agrava perfil nutricional.',
          'Eliminar C — campanha só para crianças: reducionista.',
          'Eliminar D — palestras só para pais/professores delegando tudo: não integra promoção ampla.',
          'Marcar letra A.',
          'Em similares: anemia = suplementar quem precisa + educação alimentar coletiva.',
        ],
        footer_rule: 'Suplementação + educação = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREVENÇÃO DA ANEMIA',
        rows: [
          { label: 'Risco', value: 'Suplementação de grupos vulneráveis', badge: 'hot' },
          { label: 'Educação', value: 'Nutrientes e diversificação alimentar', badge: 'hot' },
          { label: 'Evitar', value: 'Fast-food e campanha restrita', badge: 'warn' },
          { label: 'Promoção', value: 'Público amplo + ações educativas', badge: 'ok' },
        ],
        footer_rule: 'Ferro/folato + alimentação variada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANEMIA',
        items: [
          {
            label: 'Letra B — fast-food',
            detail: 'Alimentos calóricos e gordurosos.',
            correct: 'Contraria alimentação saudável — eliminar.',
          },
          {
            label: 'Letra C — só crianças',
            detail: 'Campanha publicitária infantil exclusiva.',
            correct: 'Promoção deve ser mais ampla.',
          },
          {
            label: 'Letra D — delegar aos pais',
            detail: 'Palestras escolares só para adultos.',
            correct: 'Não sintetiza estratégia integrada — eliminar.',
          },
          {
            label: 'Transferência — só remédio',
            detail: 'Suplementar sem educar alimentação.',
            correct: 'Pacote A — suplementação + conscientização.',
          },
        ],
        footer_rule: 'A = promoção + prevenção integradas',
      },
    ],
  },

  'sc-treinamentos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Autocuidado no diabetes mellitus — MS/ADA',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Autocuidado DM',
        meta: slideMeta,
        items: [
          { label: 'I — Alimentação', detail: 'Seguir segmento do plano alimentar prescrito.', icon: 'Apple' },
          { label: 'II — Glicemia', detail: 'Monitorizar glicemia capilar conforme orientação.', icon: 'Activity' },
          { label: 'III — Estilo de vida', detail: 'Atividade física e higiene pessoal.', icon: 'Heart' },
          { label: 'IV — Consultas', detail: 'Consultas frequentes ≠ item de autocuidado diário.', icon: 'Ban' },
          { label: 'V — Medicação e pés', detail: 'Uso correto de fármacos e cuidados podológicos.', icon: 'Pill' },
        ],
        footer_rule: 'Autocuidado = rotina diária do paciente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: autocuidado para portadores de diabetes mellitus.',
          'I — segmento de plano alimentar: CORRETA (autocuidado).',
          'II — monitorização da glicemia capilar: CORRETA.',
          'III — atividades físicas e higiene: CORRETA.',
          'IV — consultas médicas frequentes: FORA do rol de autocuidado nesta questão.',
          'V — medicação correta e cuidados com os pés: CORRETA.',
          'Corretas: I, II, III e V.',
          'Marcar letra B.',
          'Em similares: autocuidado DM = rotina diária — consulta médica não entra no pacote.',
        ],
        footer_rule: 'I, II, III e V — letra B',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AUTOCUIDADO NO DM',
        rows: [
          { label: 'I', value: 'Plano alimentar', badge: 'hot' },
          { label: 'II', value: 'Glicemia capilar', badge: 'hot' },
          { label: 'III', value: 'Exercício e higiene', badge: 'ok' },
          { label: 'V', value: 'Medicação e pé diabético', badge: 'hot' },
          { label: 'IV', value: 'Consulta ≠ autocuidado aqui', badge: 'warn' },
        ],
        footer_rule: 'Rotina diária — não confundir com follow-up',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DM V/F',
        items: [
          {
            label: 'Letra A — I, II, III e IV',
            detail: 'Inclui consultas médicas frequentes.',
            correct: 'IV não entra no autocuidado desta banca — eliminar.',
          },
          {
            label: 'Letra C — I, II, IV e V',
            detail: 'Omite atividade física e higiene (III).',
            correct: 'III é correta — conjunto incompleto.',
          },
          {
            label: 'Letra D — I, III, IV e V',
            detail: 'Exclui monitorização capilar (II).',
            correct: 'II é autocuidado essencial.',
          },
          {
            label: 'Letra E — II, III, IV e V',
            detail: 'Omite plano alimentar (I).',
            correct: 'I integra autocuidado — gabarito B.',
          },
          {
            label: 'Transferência — só insulina',
            detail: 'Autocuidado reduzido à medicação.',
            correct: 'Alimentação, glicemia, exercício e pés — B.',
          },
        ],
        footer_rule: 'Consulta (IV) é pegadinha',
      },
    ],
  },

  'selecon-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-4': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'PN DST/AIDS — componentes (MS/SVS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PN DST/AIDS',
        meta: slideMeta,
        items: [
          { label: 'Três componentes', detail: 'Articulam diretrizes, estratégias e ações.', icon: 'Layers' },
          { label: 'Reduzir incidência', detail: 'Foco em HIV/AIDS e outras DST.', icon: 'TrendingDown' },
          { label: 'Componente buscado', detail: 'Promoção, proteção e prevenção.', icon: 'Shield' },
          { label: 'Outros eixos', detail: 'Diagnóstico e assistência — componente distinto.', icon: 'Stethoscope' },
          { label: 'Pegadinha', detail: 'Trocar “promoção” por “prevenção” isolada ou misturar com diagnóstico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Incidência ↓ = promoção, proteção e prevenção',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: componente que reduz incidência de HIV/AIDS e outras DST.',
          'Eliminar A — diagnóstico e assistência: cuidado clínico, não prevenção primária da infecção.',
          'Eliminar C — prevenção, proteção e diagnóstico: mistura componentes.',
          'Eliminar D — promoção, diagnóstico e assistência: inclui assistência clínica.',
          'Eliminar E — prevenção, diagnóstico e assistência: mesmo erro.',
          'Manter B — promoção, proteção e prevenção.',
          'Marcar letra B.',
          'Em similares: reduzir infecção nova → componente preventivo do PN.',
        ],
        footer_rule: 'B = promoção, proteção e prevenção',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PN DST/AIDS',
        rows: [
          { label: 'Prevenção', value: 'Promoção, proteção e prevenção', badge: 'hot' },
          { label: 'Clínica', value: 'Diagnóstico e assistência', badge: 'info' },
          { label: 'Meta', value: 'Reduzir incidência de HIV/DST', badge: 'hot' },
          { label: 'Erro', value: 'Trocar promoção por só diagnóstico', badge: 'warn' },
        ],
        footer_rule: 'Decore os três componentes',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PN DST',
        items: [
          {
            label: 'Letra A — diagnóstico',
            detail: 'Diagnóstico e assistência.',
            correct: 'Componente clínico — não reduz incidência sozinho.',
          },
          {
            label: 'Letra C — com diagnóstico',
            detail: 'Prevenção, proteção e diagnóstico.',
            correct: 'Diagnóstico é outro eixo — eliminar.',
          },
          {
            label: 'Letra D — promoção clínica',
            detail: 'Promoção, diagnóstico e assistência.',
            correct: 'Mistura prevenção com assistência.',
          },
          {
            label: 'Letra E — prevenção clínica',
            detail: 'Prevenção, diagnóstico e assistência.',
            correct: 'Inclui diagnóstico e assistência — não é o componente.',
          },
          {
            label: 'Transferência — só camisinha',
            detail: 'Campanha de preservativo isolada.',
            correct: 'Componente formal — promoção, proteção e prevenção (B).',
          },
        ],
        footer_rule: 'B = eixo preventivo do Programa',
      },
    ],
  },

  'ufmt-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-3': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Níveis de prevenção — Leavell & Clark / MS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção primária',
        meta: slideMeta,
        items: [
          { label: 'Primária', detail: 'Antes da doença — eliminar fatores de risco.', icon: 'Shield' },
          { label: 'Proteção específica', detail: 'Vacinas, barreiras e medidas dirigidas.', icon: 'Syringe' },
          { label: 'Secundária', detail: 'Diagnóstico e tratamento precoce.', icon: 'Search' },
          { label: 'Terciária', detail: 'Reabilitação e redução de sequelas.', icon: 'Heart' },
          { label: 'Pegadinha', detail: 'Trocar primária por reabilitação ou rastreio.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Proteção específica = primária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nível considerado prevenção primária.',
          'Eliminar A — reabilitação: terciária.',
          'Eliminar B — diagnóstico: secundária.',
          'Eliminar C — tratamento precoce: secundária.',
          'Manter D — proteção específica.',
          'Marcar letra D.',
          'Em similares: vacina e barreira entram na primária.',
        ],
        footer_rule: 'Antes da doença = D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÍVEIS DE PREVENÇÃO',
        rows: [
          { label: 'Primária', value: 'Promoção + proteção específica', badge: 'hot' },
          { label: 'Secundária', value: 'Diagnóstico precoce', badge: 'ok' },
          { label: 'Terciária', value: 'Reabilitação', badge: 'info' },
          { label: 'Gatilho', value: 'Doença ainda não instalada', badge: 'warn' },
        ],
        footer_rule: 'Proteção específica na primária',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÍVEIS',
        items: [
          {
            label: 'Letra A — reabilitação',
            detail: 'Recuperar funções após dano.',
            correct: 'Terciária — não primária.',
          },
          {
            label: 'Letra B — diagnóstico',
            detail: 'Identificar cedo a doença.',
            correct: 'Secundária — eliminar.',
          },
          {
            label: 'Letra C — tratamento precoce',
            detail: 'Intervir no início clínico.',
            correct: 'Secundária — não primária.',
          },
          {
            label: 'Transferência — rastreio',
            detail: 'Mamografia como primária.',
            correct: 'Rastreio é secundária — proteção específica é D.',
          },
        ],
        footer_rule: 'D = proteção específica',
      },
    ],
  },

  'unesc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-8': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Controle de surto de dengue — prevenção primária (MS/SVS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Surto de dengue',
        meta: slideMeta,
        items: [
          { label: 'Controle de surto', detail: 'Ações para reduzir transmissão na comunidade.', icon: 'AlertTriangle' },
          { label: 'Enfermagem', detail: 'Participação em medidas epidemiológicas eficazes.', icon: 'Users' },
          { label: 'Prevenção primária', detail: 'Evitar infecção antes do adoecimento.', icon: 'Shield' },
          { label: 'Não confundir', detail: 'Tratamento curativo, terciária ou só notificação.', icon: 'Ban' },
          { label: 'Vigilância', detail: 'Passiva ≠ conjunto de ações de controle.', icon: 'Eye' },
        ],
        footer_rule: 'Reduzir transmissão = primária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: completar lacuna — ações para reduzir transmissão no surto de dengue.',
          'Eliminar A — tratamento curativo: cuidado do doente, não prevenção coletiva.',
          'Eliminar C — vigilância passiva: notifica casos — não nomeia o conceito pedido.',
          'Eliminar D — prevenção terciária: reduz sequelas — doença já instalada.',
          'Eliminar E — notificação compulsória: dever de vigilância, não o conceito da lacuna.',
          'Manter B — prevenção primária.',
          'Marcar letra B.',
          'Em similares: controle de vetor e bloqueio de transmissão = primária.',
        ],
        footer_rule: 'Surto dengue = prevenção primária',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DENGUE NO TERRITÓRIO',
        rows: [
          { label: 'Surto', value: 'Reduzir transmissão comunitária', badge: 'hot' },
          { label: 'Conceito', value: 'Prevenção primária', badge: 'hot' },
          { label: '≠', value: 'Tratamento ou terciária', badge: 'warn' },
          { label: 'Enfermagem', value: 'Educação + controle de criadouros', badge: 'ok' },
        ],
        footer_rule: 'Bloquear infecção = primária',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SURTO',
        items: [
          {
            label: 'Letra A — curativo',
            detail: 'Tratamento do paciente dengue.',
            correct: 'Assistência clínica — não preenche a lacuna.',
          },
          {
            label: 'Letra C — vigilância passiva',
            detail: 'Receber notificações.',
            correct: 'Não é o nome do conceito de reduzir transmissão.',
          },
          {
            label: 'Letra D — terciária',
            detail: 'Reabilitar sequelas.',
            correct: 'Doença já ocorreu — eliminar.',
          },
          {
            label: 'Letra E — notificação',
            detail: 'Notificação compulsória isolada.',
            correct: 'Dever de vigilância — não nomeia prevenção primária.',
          },
          {
            label: 'Transferência — adulticida',
            detail: 'Só nebulização sem educação.',
            correct: 'Conceito amplo de bloqueio — prevenção primária (B).',
          },
        ],
        footer_rule: 'B = prevenção primária',
      },
    ],
  },

  'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-2': {
    family: 'conceito',
    branch: 'promocao_principios_direitos',
    guideline: 'Pacto em Defesa do SUS — mobilização e cidadania (MS/CNS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pacto em Defesa do SUS',
        meta: slideMeta,
        items: [
          { label: 'I — Mobilização', detail: 'Apoio à mobilização social pela saúde como direito.', icon: 'Megaphone' },
          { label: 'II — Diálogo', detail: 'Diálogo com sociedade respeitando limites — formulação discutível.', icon: 'MessageCircle' },
          { label: 'III — Movimentos', detail: 'Fortalecer relações com movimentos sociais de saúde.', icon: 'Users' },
          { label: 'IV — Regionalização', detail: 'Processo de Regionalização — outro pacto/gestão.', icon: 'Ban' },
          { label: 'Direito', detail: 'Saúde como direito social e cidadania.', icon: 'Heart' },
        ],
        footer_rule: 'I e III são corretas nesta banca',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: ações do Pacto em Defesa do SUS.',
          'I — mobilização social pela saúde como direito: CORRETA.',
          'II — diálogo respeitando limites institucionais: INCORRETA nesta questão.',
          'III — fortalecer movimentos sociais de saúde e cidadania: CORRETA.',
          'IV — elaboração do Processo de Construção da Regionalização: INCORRETA (outro eixo).',
          'Corretas: apenas I e III.',
          'Marcar letra B.',
          'Em similares: Pacto em Defesa = mobilização cidadã — regionalização é outro pacto.',
        ],
        footer_rule: 'Só I e III — letra B',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PACTO EM DEFESA DO SUS',
        rows: [
          { label: 'I', value: 'Mobilização e cidadania', badge: 'hot' },
          { label: 'III', value: 'Movimentos sociais de saúde', badge: 'hot' },
          { label: 'II', value: 'Limites institucionais — falsa aqui', badge: 'warn' },
          { label: 'IV', value: 'Regionalização — outro pacto', badge: 'warn' },
        ],
        footer_rule: 'Defesa do SUS = mobilização social',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PACTO SUS',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Inclui diálogo com limites institucionais.',
            correct: 'II é falsa nesta questão — eliminar.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Omite mobilização (I).',
            correct: 'I é correta — conjunto errado.',
          },
          {
            label: 'Letra D — II e IV',
            detail: 'Regionalização + diálogo limitado.',
            correct: 'IV não pertence ao Pacto em Defesa.',
          },
          {
            label: 'Letra E — todas',
            detail: 'Aceita regionalização como ação do Pacto.',
            correct: 'IV é falsa — só I e III.',
          },
          {
            label: 'Transferência — gestão',
            detail: 'Confundir com Pacto pela Gestão.',
            correct: 'Mobilização cidadã — I e III (B).',
          },
        ],
        footer_rule: 'Regionalização (IV) é pegadinha',
      },
    ],
  },

  'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-2': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Manejo de diarreia aguda — higiene e SRO (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diarreia aguda',
        meta: slideMeta,
        items: [
          { label: 'Caso agudo', detail: 'Orientar higiene pessoal e domiciliar.', icon: 'Droplets' },
          { label: 'Mãos e água', detail: 'Lavagem adequada e tratamento da água.', icon: 'Hand' },
          { label: 'Alimentos', detail: 'Higienização segura dos alimentos.', icon: 'Apple' },
          { label: 'Hidratação', detail: 'Aumentar ingesta hídrica e SRO.', icon: 'GlassWater' },
          { label: 'Pegadinha', detail: 'Antidiarreico em parasitose ou reidratação venosa de rotina.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Higiene + SRO no agudo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre manejo de diarreia.',
          'Eliminar A — adulto estável: buscar reidratação venosa de rotina: exagero para bom estado.',
          'Eliminar B — criança desnutrida: só reidratação oral como único enunciado simplista.',
          'Eliminar C — parasitose: antidiarreico para evitar desnutrição: contraindicado/indicado com critério.',
          'Manter D — medidas de higiene pessoal e domiciliar + hidratação e SRO no agudo.',
          'Marcar letra D.',
          'Em similares: diarreia aguda = higiene + fluidos + SRO.',
        ],
        footer_rule: 'Pacote higiene + SRO = D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DIARREIA AGUDA',
        rows: [
          { label: 'Higiene', value: 'Mãos, água e alimentos', badge: 'hot' },
          { label: 'Hidratação', value: 'Mais líquidos + SRO', badge: 'hot' },
          { label: 'Evitar', value: 'Antidiarreico indiscriminado', badge: 'warn' },
          { label: 'Grave', value: 'Sinais de alarme → serviço', badge: 'info' },
        ],
        footer_rule: 'Prevenir desidratação com SRO',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIARREIA',
        items: [
          {
            label: 'Letra A — venosa',
            detail: 'Reidratação venosa no adulto estável.',
            correct: 'Bom estado geral → oral e orientação — eliminar.',
          },
          {
            label: 'Letra B — criança',
            detail: 'Só reidratação oral na desnutrição.',
            correct: 'Manejo exige avaliação ampla — não é a correta.',
          },
          {
            label: 'Letra C — antidiarreico',
            detail: 'Parasitose com antidiarreico rotineiro.',
            correct: 'Não é conduta padrão — eliminar.',
          },
          {
            label: 'Transferência — jejum',
            detail: 'Suspender alimentação por dias.',
            correct: 'Higiene, hidratação e SRO — D.',
          },
        ],
        footer_rule: 'D = higiene domiciliar + SRO',
      },
    ],
  },

  'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-3': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Autocuidado em condições crônicas — responsabilidade compartilhada (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Autocuidado crônico',
        meta: slideMeta,
        items: [
          { label: 'I — Só indivíduo', detail: 'Autocuidado não é exclusividade do paciente/família.', icon: 'Ban' },
          { label: 'II — Uma fase', detail: 'Processo contínuo — não etapa única.', icon: 'RefreshCw' },
          { label: 'Equipe', detail: 'Profissionais apoiam, monitoram e reorientam.', icon: 'Users' },
          { label: 'Crônico', detail: 'Manejo prolongado (ex.: pé diabético).', icon: 'HeartPulse' },
          { label: 'Pegadinha', detail: 'Delegar tudo ao paciente após uma orientação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Autocuidado é processo compartilhado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: assertivas sobre autocuidado em problema crônico.',
          'I — responsabilidade exclusiva do indivíduo/família após orientação: FALSA.',
          'II — autocuidado ocorre em uma fase só, a partir do manejo clínico: FALSA.',
          'Ambas reduzem o autocuidado a culpa individual ou momento único.',
          'Nenhuma assertiva correta.',
          'Marcar letra C — todas incorretas.',
          'Em similares: equipe + paciente + continuidade.',
        ],
        footer_rule: 'I e II falsas — C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AUTOCUIDADO CRÔNICO',
        rows: [
          { label: 'I', value: 'Falsa — não é só do paciente', badge: 'warn' },
          { label: 'II', value: 'Falsa — processo contínuo', badge: 'warn' },
          { label: 'Equipe', value: 'Apoio e follow-up permanentes', badge: 'hot' },
          { label: 'Processo', value: 'Contínuo — não fase única', badge: 'info' },
        ],
        footer_rule: 'Compartilhar cuidado ao longo do tempo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AUTOCUIDADO',
        items: [
          {
            label: 'Letra A — só I',
            detail: 'Aceita responsabilidade exclusiva.',
            correct: 'I é falsa — equipe participa.',
          },
          {
            label: 'Letra B — só II',
            detail: 'Autocuidado em fase única.',
            correct: 'II é falsa — processo contínuo.',
          },
          {
            label: 'Letra D — todas corretas',
            detail: 'Valida as duas assertivas.',
            correct: 'I e II erram — gabarito C.',
          },
          {
            label: 'Transferência — culpa',
            detail: 'Paciente “descontrolado” sozinho.',
            correct: 'Responsabilidade compartilhada — C (todas incorretas).',
          },
        ],
        footer_rule: 'C = nenhuma assertiva válida',
      },
    ],
  },

  'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saneamento ambiental — conceito ONU/MS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saneamento ambiental',
        meta: slideMeta,
        items: [
          { label: 'ONU', detail: 'Tema prioritário além do saneamento básico clássico.', icon: 'Globe' },
          { label: 'Ações socioeconômicas', detail: 'Salubridade ambiental integrada.', icon: 'Layers' },
          { label: 'Infraestrutura', detail: 'Água, esgoto, resíduos, drenagem, solo.', icon: 'Droplets' },
          { label: 'Saúde pública', detail: 'Controle de transmissíveis e condições de vida.', icon: 'Shield' },
          { label: 'Pegadinha', detail: 'Confundir com vigilância sanitária de produtos ou ANS.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Salubridade ambiental ampla',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conceito correto de saneamento ambiental (ONU).',
          'Manter A — ações socioeconômicas para salubridade: água, esgoto, resíduos, drenagem, controle de transmissíveis etc.',
          'Eliminar B — controle de medicamentos/cosméticos: vigilância sanitária de produtos.',
          'Eliminar C — saúde indígena específica: política setorial distinta.',
          'Eliminar D — planos privados ANS: saúde suplementar.',
          'Eliminar E — vigilância epidemiológica genérica: não define saneamento ambiental.',
          'Marcar letra A.',
          'Em similares: saneamento ambiental = obras + serviços + salubridade.',
        ],
        footer_rule: 'Pacote integrado urbano/rural = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SANEAMENTO AMBIENTAL',
        rows: [
          { label: 'Escopo', value: 'Água, esgoto, resíduos, drenagem', badge: 'hot' },
          { label: 'Saúde', value: 'Controle de transmissíveis', badge: 'hot' },
          { label: 'Meta', value: 'Salubridade urbana e rural', badge: 'ok' },
          { label: '≠', value: 'Vigilância de produtos ou ANS', badge: 'warn' },
        ],
        footer_rule: 'Conceito amplo da ONU',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANEAMENTO',
        items: [
          {
            label: 'Letra B — Anvisa',
            detail: 'Fiscalização de medicamentos e alimentos.',
            correct: 'Vigilância sanitária — não saneamento ambiental.',
          },
          {
            label: 'Letra C — indígena',
            detail: 'Política específica para povos indígenas.',
            correct: 'Setor distinto — eliminar.',
          },
          {
            label: 'Letra D — ANS',
            detail: 'Planos de saúde privados.',
            correct: 'Suplementar — falsa.',
          },
          {
            label: 'Letra E — vigilância',
            detail: 'Vigilância epidemiológica genérica.',
            correct: 'Não define saneamento ambiental — eliminar.',
          },
          {
            label: 'Transferência — só esgoto',
            detail: 'Rede coletora isolada.',
            correct: 'Conjunto socioeconômico amplo — A.',
          },
        ],
        footer_rule: 'A = definição ONU/MS',
      },
    ],
  },

  'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-8': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde — doenças crônicas (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Educação crônicos',
        meta: slideMeta,
        items: [
          { label: 'Objetivo', detail: 'Hábitos saudáveis e adesão ao tratamento.', icon: 'Heart' },
          { label: 'Grupos educativos', detail: 'Diálogo e autonomia — não paternalismo.', icon: 'Users' },
          { label: 'Integral', detail: 'Medicamento + mudança de hábitos.', icon: 'Layers' },
          { label: 'Postura', detail: 'Sem autoritarismo nem rigidez insensível.', icon: 'MessageCircle' },
          { label: 'Pegadinha', detail: 'Apelidos/gírias, só hospital ou só remédio.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Sem paternalismo nem autoritarismo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: atuação correta do profissional em grupos educativos para crônicos.',
          'Eliminar A — renovar receita só no hospital: reducionista.',
          'Eliminar B — só medicamento, ignorar hábitos: incompleto.',
          'Eliminar D — rigidez sem sensibilidade: postura inadequada.',
          'Eliminar E — apelidos e gírias: quebra de respeito profissional.',
          'Manter C — não adotar posturas paternalistas nem autoritárias.',
          'Marcar letra C.',
          'Em similares: educação em saúde = parceria, não imposição.',
        ],
        footer_rule: 'Parceria respeitosa = C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO EM CRÔNICOS',
        rows: [
          { label: 'Fazer', value: 'Estimular hábitos e adesão', badge: 'hot' },
          { label: 'Postura', value: 'Sem paternalismo ou autoritarismo', badge: 'hot' },
          { label: 'Evitar', value: 'Apelidos, rigidez, só medicamento', badge: 'warn' },
          { label: 'Local', value: 'APS e grupos — não só hospital', badge: 'ok' },
        ],
        footer_rule: 'Respeito e autonomia do paciente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GRUPOS',
        items: [
          {
            label: 'Letra A — hospital',
            detail: 'Receita contínua só na emergência.',
            correct: 'Atenção primária pode renovar — eliminar.',
          },
          {
            label: 'Letra B — só remédio',
            detail: 'Ignorar mudança de hábitos.',
            correct: 'Educação é integral — eliminar.',
          },
          {
            label: 'Letra D — rigidez',
            detail: 'Sem sensibilidade individual.',
            correct: 'Postura autoritária — falsa.',
          },
          {
            label: 'Letra E — apelidos',
            detail: 'Apelidos e gírias no grupo.',
            correct: 'Quebra respeito profissional — eliminar.',
          },
          {
            label: 'Transferência — palestra',
            detail: 'Profissional fala e paciente obedece.',
            correct: 'Sem paternalismo — letra C.',
          },
        ],
        footer_rule: 'C = postura ética na educação',
      },
    ],
  },

  'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-2': {
    family: 'protocolo',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Rastreamento de hipertensão arterial — MS/DG-SA',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Rastreio HAS',
        meta: slideMeta,
        items: [
          { label: 'Idade', detail: 'Aferir PA a partir de 18 anos na APS.', icon: 'Calendar' },
          { label: 'Intervalo', detail: 'Registrar se não houver PA nos últimos 24 meses.', icon: 'Clock' },
          { label: 'Oportunidade', detail: 'Consulta, educação ou procedimento na UBS.', icon: 'Home' },
          { label: 'Prontuário', detail: 'Verificar registro prévio de pressão.', icon: 'FileText' },
          { label: 'Pegadinha', detail: 'Confundir com 40 anos, 6 meses ou adolescente.', icon: 'AlertTriangle' },
        ],
        footer_rule: '18 anos · intervalo 24 meses',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preencher lacunas — idade mínima e intervalo sem registro de PA.',
          'Eliminar A — 40 anos e 6 meses: parâmetro incorreto.',
          'Eliminar B — 30 anos e 12 meses: não é o protocolo MS.',
          'Eliminar C — 25 anos e 12 meses: idade errada.',
          'Eliminar E — 14 anos e 24 meses: abaixo da faixa adulta recomendada.',
          'Manter D — 18 anos e 24 meses.',
          'Marcar letra D.',
          'Em similares: adulto jovem na APS → aferir PA a cada 2 anos.',
        ],
        footer_rule: 'Decore 18 … 24',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RASTREIO HAS — MS',
        rows: [
          { label: 'Idade', value: '≥ 18 anos', badge: 'hot' },
          { label: 'Intervalo', value: '24 meses sem PA registrada', badge: 'hot' },
          { label: 'Onde', value: 'Qualquer contato na APS', badge: 'ok' },
          { label: 'Erro', value: '40 anos ou 6 meses', badge: 'warn' },
        ],
        footer_rule: '18 anos · 24 meses',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HAS',
        items: [
          {
            label: 'Letra A — 40 … 6',
            detail: 'Idade tardia e intervalo curto.',
            correct: 'Protocolo MS usa 18 e 24 — eliminar.',
          },
          {
            label: 'Letra B — 30 … 12',
            detail: 'Meio-termo inventado.',
            correct: 'Não consta na diretriz — eliminar.',
          },
          {
            label: 'Letra C — 25 … 12',
            detail: 'Idade intermediária.',
            correct: 'Gatilho é 18 anos — falsa.',
          },
          {
            label: 'Transferência — só consulta',
            detail: 'Aferir PA só com médico.',
            correct: 'Qualquer contato na APS — 18 e 24 meses (D).',
          },
        ],
        footer_rule: 'D = 18 anos e 24 meses',
      },
    ],
  },

  'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Planejamento familiar — dupla proteção e prevenção de IST (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dupla proteção',
        meta: slideMeta,
        items: [
          { label: 'Dupla proteção', detail: 'Anticoncepção + barreira contra IST.', icon: 'Shield' },
          { label: 'Grupo PF', detail: 'Técnico enfatiza métodos combinados.', icon: 'Users' },
          { label: 'Camisinha', detail: 'Barreira contra IST e gravidez.', icon: 'Heart' },
          { label: 'Segundo método', detail: 'Anticoncepcional eficaz associado.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Dois métodos só hormonais ou duas barreiras iguais.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Barreira + método anticoncepcional',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: dois métodos anticoncepcionais concomitantes para dupla proteção (PF + IST).',
          'Eliminar A — oral + vasectomia: combinação atípica e vasectomia definitiva.',
          'Eliminar B — DIU + gel espermicida: não é o par destacado pela banca.',
          'Eliminar C — diafragma + injetável: não corresponde ao gabarito.',
          'Eliminar E — camisinha feminina + masculina: dupla barreira, não anticoncepção + barreira clássica.',
          'Manter D — camisinha masculina e vasectomia.',
          'Marcar letra D.',
          'Em similares: dupla proteção = gravidez + IST — ler alternativas com critério da banca.',
        ],
        footer_rule: 'Par da questão = D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DUPLA PROTEÇÃO',
        rows: [
          { label: 'Objetivo', value: 'Evitar gestação e IST', badge: 'hot' },
          { label: 'Barreira', value: 'Preservativo masculino', badge: 'hot' },
          { label: 'Par (banca)', value: 'Camisinha + vasectomia', badge: 'ok' },
          { label: 'Educação', value: 'Grupo de planejamento familiar', badge: 'info' },
        ],
        footer_rule: 'IST + anticoncepção juntos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PF',
        items: [
          {
            label: 'Letra A — oral + vasectomia',
            detail: 'Anticoncepcional oral com vasectomia.',
            correct: 'Combinação não apontada — eliminar.',
          },
          {
            label: 'Letra B — DIU + espermicida',
            detail: 'DIU com gel espermicida.',
            correct: 'Par espermicida + DIU — não é o gabarito da banca.',
          },
          {
            label: 'Letra C — diafragma',
            detail: 'Diafragma com anticoncepcional injetável.',
            correct: 'Injetável + diafragma — alternativa eliminada.',
          },
          {
            label: 'Letra E — duas camisinhas',
            detail: 'Feminina e masculina juntas.',
            correct: 'Dupla barreira — não a resposta D.',
          },
          {
            label: 'Transferência — só pílula',
            detail: 'Anticoncepcional sem preservativo.',
            correct: 'Dupla proteção exige combinação — D.',
          },
        ],
        footer_rule: 'D = camisinha e vasectomia',
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
    const question_data = applyGabaritoFix(slug, cleanQuestionData(raw.question_data));
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:promocao-g12] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g12] total=${ok}`);
}

main();
