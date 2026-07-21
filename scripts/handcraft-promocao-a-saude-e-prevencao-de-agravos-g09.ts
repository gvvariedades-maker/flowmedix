#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g09 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g09
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g09';
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
    'saúde bucal',
    'educação em saúde',
    'ACS',
    'acesso ao SUS',
    'doenças negligenciadas',
    'hipertensão',
    'atenção básica',
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
  sources?: (typeof MS_PROMOCAO_SOURCE)[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

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
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: pack.sources ?? [MS_PROMOCAO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\bpacientes aotratamento\b/gi, 'pacientes ao tratamento')
    .replace(/\bsobre aimportância\b/gi, 'sobre a importância')
    .replace(/\bcontrolepressórico\b/gi, 'controle pressórico')
    .replace(/\bparasitários\),sendo\b/gi, 'parasitários), sendo')
    .replace(/\bmastêm\b/gi, 'mas têm')
    .replace(/\bdesaneamento\b/gi, 'de saneamento')
    .replace(/\bdaconstrução\b/gi, 'da construção')
    .replace(/\baoprincípio\b/gi, 'ao princípio')
    .replace(/\bBrasileirae\b/gi, 'Brasileira e')
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

const SPECS: Record<string, Pack> = {
  'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-8': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Promoção em saúde bucal — educação e autocuidado (MS/SB)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Higiene bucal coletiva',
        meta: slideMeta,
        items: [
          { label: 'Promoção', detail: 'Aumentar adesão por educação — não só produto ou consulta.', icon: 'Megaphone' },
          { label: 'Educação em saúde', detail: 'Campanhas e incentivo ao autocuidado na comunidade.', icon: 'BookOpen' },
          { label: 'Autocuidado', detail: 'Escovação e hábitos incorporados no cotidiano.', icon: 'Smile' },
          { label: 'Não basta', detail: 'Distribuir escova ou substituir água sem diálogo educativo.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Tecnologia cara ou consultório em massa sem educação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Educação + autocuidado = adesão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principal estratégia para adesão à higiene bucal na comunidade.',
          'Eliminar A — escovas elétricas exclusivas: acesso e custo limitam promoção coletiva.',
          'Eliminar B — só distribuir produtos: doação sem educação não sustenta hábito.',
          'Eliminar D — consultas em grandes grupos: assistência, não estratégia principal de promoção.',
          'Eliminar E — substituir água por água com flúor: medida estrutural específica, não eixo da questão.',
          'Manter C — campanhas educativas em saúde bucal e incentivo ao autocuidado.',
          'Marcar letra C.',
          'Em similares: promoção bucal = educar e empoderar — não só entregar kit.',
        ],
        footer_rule: 'Campanha educativa + autocuidado',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SAÚDE BUCAL COLETIVA',
        rows: [
          { label: 'Eixo', value: 'Educação em saúde bucal', badge: 'hot' },
          { label: 'Meta', value: 'Autocuidado sustentado', badge: 'hot' },
          { label: 'ACS/UBS', value: 'Ações participativas no território', badge: 'ok' },
          { label: 'Evitar', value: 'Só produto ou procedimento', badge: 'warn' },
        ],
        footer_rule: 'Promover hábito — não só doar escova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIGIENE BUCAL',
        items: [
          {
            label: 'Letra A — elétrica',
            detail: 'Escovas dentais elétricas exclusivas.',
            correct: 'Custo e acesso limitam estratégia comunitária ampla.',
          },
          {
            label: 'Letra B — distribuição',
            detail: 'Produtos gratuitos sem educação.',
            correct: 'Doação isolada não garante adesão comportamental.',
          },
          {
            label: 'Letra D — consultas em massa',
            detail: 'Grupos grandes no consultório.',
            correct: 'Assistência curativa — não promoção principal pedida.',
          },
          {
            label: 'Letra E — água fluoretada',
            detail: 'Substituir água potável.',
            correct: 'Medida estrutural distinta — eliminar.',
          },
          {
            label: 'Transferência — flúor gel',
            detail: 'Aplicação profissional sem orientação.',
            correct: 'Educação e autocuidado comunitário — C.',
          },
        ],
        footer_rule: 'C = educação e autocuidado',
      },
    ],
  },

  'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde bucal — abordagem participativa (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Engajar no hábito bucal',
        meta: slideMeta,
        items: [
          { label: 'Eficácia', detail: 'Materiais educativos + diálogo individual e comunitário.', icon: 'Users' },
          { label: 'Participação', detail: 'Paciente protagonista — não receptor passivo de custo.', icon: 'Heart' },
          { label: 'Território', detail: 'Ações na UBS e na comunidade.', icon: 'MapPin' },
          { label: 'Evitar', detail: 'Só custo do tratamento ou exame sem orientação.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Produto sem orientação adequada.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Educar com interação — não só informar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: abordagem mais eficaz para engajar hábitos saudáveis bucais.',
          'Eliminar A — custos de tratamento: medo financeiro não educa hábito.',
          'Eliminar C — casos de sucesso clínico: inspiração pontual, pouco participativa.',
          'Eliminar D — exames gratuitos: rastreamento, não engajamento educativo principal.',
          'Eliminar E — produtos sem orientação: repete erro da doação passiva.',
          'Manter B — materiais educativos e interações individuais e comunitárias.',
          'Marcar letra B.',
          'Em similares: educação participativa supera folheto ou produto solto.',
        ],
        footer_rule: 'Material + diálogo = B',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO BUCAL',
        rows: [
          { label: 'Fazer', value: 'Materiais + conversa individual/comunitária', badge: 'hot' },
          { label: 'Evitar', value: 'Só custo, caso clínico ou kit sem orientação', badge: 'warn' },
          { label: 'Objetivo', value: 'Hábito sustentado de higiene', badge: 'ok' },
          { label: 'Lugar', value: 'UBS, escola, domicílio', badge: 'info' },
        ],
        footer_rule: 'Interação educa melhor que panfleto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ENGAJAMENTO',
        items: [
          {
            label: 'Letra A — custos',
            detail: 'Informar preço de tratamentos.',
            correct: 'Não engaja hábito preventivo — eliminar.',
          },
          {
            label: 'Letra C — caso clínico',
            detail: 'Sucesso em tratamento odontológico.',
            correct: 'Assistência — não abordagem educativa principal.',
          },
          {
            label: 'Letra D — exame',
            detail: 'Diagnóstico dental gratuito.',
            correct: 'Secundária — não é a mais eficaz para hábito.',
          },
          {
            label: 'Letra E — produto seco',
            detail: 'Higiene bucal sem orientação.',
            correct: 'Falta diálogo educativo — eliminar.',
          },
          {
            label: 'Transferência — palestra única',
            detail: 'Aula magistral sem troca.',
            correct: 'Interação individual e comunitária — B.',
          },
        ],
        footer_rule: 'B = materiais + interação',
      },
    ],
  },

  'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-2': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Periodontia — adesão por educação personalizada (MS/SB)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adesão periodontal',
        meta: slideMeta,
        items: [
          { label: 'Problema', detail: 'Baixa adesão à manutenção periodontal.', icon: 'AlertCircle' },
          { label: 'Educação interativa', detail: 'Sessões personalizadas durante o tratamento.', icon: 'MessageCircle' },
          { label: 'SMS/lembrete', detail: 'Auxilia comparecimento — mas não substitui educação.', icon: 'Smartphone' },
          { label: 'Recompensa financeira', detail: 'Incentivo extrínseco frágil e não estrutural.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Mais consultas gratuitas sem educar autocuidado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Educar na consulta melhora adesão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: estratégia mais eficaz para adesão à manutenção periodontal.',
          'Eliminar A — SMS de lembrete: útil, mas complementar — não a mais eficaz isolada.',
          'Eliminar B — consultas espaçadas para aderentes: premia adesão, não resolve quem abandona.',
          'Eliminar D — recompensa financeira: não é política de promoção à saúde sustentável.',
          'Eliminar E — mais procedimentos gratuitos: volume assistencial sem educação.',
          'Manter C — sessões educativas interativas e personalizadas nas consultas.',
          'Marcar letra C.',
          'Em similares: adesão crônica exige educação no vínculo clínico.',
        ],
        footer_rule: 'Educação personalizada na consulta',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MANUTENÇÃO PERIODONTAL',
        rows: [
          { label: 'Melhor aposta', value: 'Educação interativa na consulta', badge: 'hot' },
          { label: 'Complemento', value: 'Lembrete de retorno (SMS)', badge: 'ok' },
          { label: 'Frágil', value: 'Dinheiro ou só mais procedimento', badge: 'warn' },
          { label: 'Meta', value: 'Autocuidado e controle da doença', badge: 'hot' },
        ],
        footer_rule: 'Ensinar no atendimento — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PERIODONTIA',
        items: [
          {
            label: 'Letra A — SMS',
            detail: 'Lembretes automáticos de consulta.',
            correct: 'Ajuda presença — mas educação personalizada é mais eficaz.',
          },
          {
            label: 'Letra B — espaçar consulta',
            detail: 'Menos retorno para quem adere.',
            correct: 'Não resolve baixa adesão inicial.',
          },
          {
            label: 'Letra D — dinheiro',
            detail: 'Recompensa financeira.',
            correct: 'Incentivo extrínseco — eliminar como principal.',
          },
          {
            label: 'Letra E — mais gratuito',
            detail: 'Aumentar consultas e procedimentos.',
            correct: 'Assistência sem educação — não melhora adesão.',
          },
          {
            label: 'Transferência — antibiótico',
            detail: 'Só medicamento sem orientação.',
            correct: 'Educação interativa no tratamento — C.',
          },
        ],
        footer_rule: 'C = sessões educativas personalizadas',
      },
    ],
  },

  'instituto-access-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'ACS — educação em saúde participativa (PNAB/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ACS educador',
        meta: slideMeta,
        items: [
          { label: 'Papel do ACS', detail: 'Vínculo, educação e promoção no território.', icon: 'Users' },
          { label: 'Participação', detail: 'Palestras e atividades educativas com a comunidade.', icon: 'Megaphone' },
          { label: 'Diálogo', detail: 'Interação — não só entregar panfleto.', icon: 'MessageCircle' },
          { label: 'Equipe', detail: 'Educação não é exclusiva do médico.', icon: 'Network' },
          { label: 'Pegadinha', detail: 'Só tratamento curativo sem prevenção.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'ACS educa participando',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: como o ACS deve promover educação em saúde.',
          'Eliminar A — panfletos sem interação: comunicação unidirecional.',
          'Eliminar C — educação só para médicos: nega papel do ACS na ESF.',
          'Eliminar D — só tratamento sem prevenção: inverte promoção.',
          'Manter B — palestras e participação ativa em atividades educativas.',
          'Marcar letra B.',
          'Em similares: ACS é educador comunitário — presença ativa no território.',
        ],
        footer_rule: 'Atividade educativa ativa = B',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACS × EDUCAÇÃO',
        rows: [
          { label: 'Faz', value: 'Palestras e ações participativas', badge: 'hot' },
          { label: 'Não faz', value: 'Panfleto sem diálogo', badge: 'warn' },
          { label: 'Não delega', value: 'Educação só ao médico', badge: 'warn' },
          { label: 'Base', value: 'PNAB — promoção e prevenção', badge: 'ok' },
        ],
        footer_rule: 'Educação é função do ACS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACS',
        items: [
          {
            label: 'Letra A — panfleto',
            detail: 'Distribuir sem interação.',
            correct: 'Falta diálogo educativo — eliminar.',
          },
          {
            label: 'Letra C — só médico',
            detail: 'Educação exclusiva da equipe médica.',
            correct: 'ACS tem papel educativo na ESF.',
          },
          {
            label: 'Letra D — só curativo',
            detail: 'Tratamento sem prevenção.',
            correct: 'Contraria promoção — eliminar.',
          },
          {
            label: 'Transferência — visita relâmpago',
            detail: 'Passar na casa sem escuta.',
            correct: 'Participar ativamente de educação — B.',
          },
        ],
        footer_rule: 'B = palestras e atividades ativas',
      },
    ],
  },

  'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9': {
    family: 'protocolo',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Protocolo Atenção à Saúde da Mulher — prevenção câncer mama/colo (MS 2016)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saúde da mulher na APS',
        meta: slideMeta,
        items: [
          { label: 'APS', detail: 'Promoção e prevenção na atenção primária.', icon: 'Home' },
          { label: 'Educação', detail: 'Ações sobre câncer de mama e colo do útero.', icon: 'Ribbon' },
          { label: 'Técnico', detail: 'Orienta e educa — não prescreve nem solicita biópsia.', icon: 'User' },
          { label: 'Rastreamento', detail: 'Fluxo da equipe — não encaminhar todas automaticamente.', icon: 'Search' },
          { label: 'Pegadinha', detail: 'Atribuir prescrição ou biópsia ao técnico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Educação preventiva na APS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ação de rotina na APS para promoção da saúde da mulher (Protocolo MS 2016).',
          'Eliminar A — biópsia pelo técnico: ato médico — fora do escopo.',
          'Eliminar B — prescrição de contraceptivo pelo técnico: não é atribuição.',
          'Eliminar C — encaminhar todas para ginecologia: inverte lógica da APS.',
          'Manter D — ações educativas sobre prevenção de câncer de mama e colo do útero.',
          'Marcar letra D.',
          'Em similares: técnico educa e acolhe — médico/enfermeiro prescreve e solicita.',
        ],
        footer_rule: 'Educação oncológica preventiva — D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MULHER NA APS',
        rows: [
          { label: 'Técnico', value: 'Educação e orientação preventiva', badge: 'hot' },
          { label: 'Temas', value: 'Câncer de mama e colo do útero', badge: 'hot' },
          { label: 'Não faz', value: 'Biópsia, prescrição, encaminhar todas', badge: 'warn' },
          { label: 'Fonte', value: 'Protocolo MS 2016', badge: 'ok' },
        ],
        footer_rule: 'Promoção educativa na UBS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MULHER APS',
        items: [
          {
            label: 'Letra A — biópsia',
            detail: 'Técnico solicita biópsia direta.',
            correct: 'Ato médico — fora do escopo do técnico.',
          },
          {
            label: 'Letra B — contraceptivo',
            detail: 'Prescrição pelo técnico.',
            correct: 'Prescrição não é atribuição — eliminar.',
          },
          {
            label: 'Letra C — encaminhar todas',
            detail: 'Ginecologia para todas automaticamente.',
            correct: 'APS resolve e rastreia — não referir em massa.',
          },
          {
            label: 'Transferência — mamografia',
            detail: 'Técnico interpreta exame de imagem.',
            correct: 'Educação preventiva sobre câncer — D.',
          },
        ],
        footer_rule: 'D = ações educativas preventivas',
      },
    ],
  },

  'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-9': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Doenças negligenciadas — lista MS (malária, hanseníase, TB…)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Doenças negligenciadas',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'EXCETO — qual NÃO é doença negligenciada no MS.', icon: 'AlertTriangle' },
          { label: 'Agentes', detail: 'Vírus, bactérias, protozoários e helmintos em países em desenvolvimento.', icon: 'Bug' },
          { label: 'Endêmicas', detail: 'África, Ásia e Américas — regiões com pobreza e saneamento precário.', icon: 'Globe' },
          { label: 'Vetores', detail: 'Grande quantidade onde há problemas de saneamento.', icon: 'Wind' },
          { label: 'HIV/AIDS', detail: 'Programa específico — EXCETO na lista clássica de DN.', icon: 'Ban' },
        ],
        footer_rule: 'HIV/AIDS fora da lista DN MS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: doença negligenciada segundo MS — EXCETO.',
          'Enunciado: endêmicas em regiões pobres com vetores e falta de saneamento.',
          'A: malária — consta na lista de doenças negligenciadas.',
          'C: hanseníase — doença negligenciada clássica no Brasil.',
          'D: tuberculose — integra o grupo de DNT no MS.',
          'B: HIV/AIDS — programa de vigilância específico, não listada como DN no sentido da questão.',
          'Marcar letra B.',
          'Em similares: DN = endêmicas tropicais negligenciadas — HIV tem política própria.',
        ],
        footer_rule: 'EXCETO = HIV/AIDS (B)',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DN NO BRASIL (MS)',
        rows: [
          { label: 'Inclui', value: 'Malária · Hanseníase · TB', badge: 'hot' },
          { label: 'EXCETO', value: 'HIV/AIDS nesta classificação', badge: 'warn' },
          { label: 'Contexto', value: 'Pobreza e saneamento', badge: 'info' },
          { label: 'Vetores', value: 'Arboviroses e parasitoses', badge: 'ok' },
        ],
        footer_rule: 'B não é DN clássica MS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO DN',
        items: [
          {
            label: 'Letra A — malária',
            detail: 'Doença negligenciada endêmica.',
            correct: 'Está na lista — não é a EXCETO.',
          },
          {
            label: 'Letra C — hanseníase',
            detail: 'Enfermidade negligenciada clássica.',
            correct: 'Integra o grupo — eliminar.',
          },
          {
            label: 'Letra D — tuberculose',
            detail: 'TB no programa de DNT.',
            correct: 'Faz parte da lista — não marque.',
          },
          {
            label: 'Letra B — HIV/AIDS',
            detail: 'Não enquadrada como DN nesta tipologia MS.',
            correct: 'É a EXCETO — gabarito da questão.',
          },
          {
            label: 'Transferência — dengue',
            detail: 'Arbovirose urbana como DN.',
            correct: 'HIV é a exceção pedida — B.',
          },
        ],
        footer_rule: 'B = HIV/AIDS (EXCETO)',
      },
    ],
  },

  'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-4': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'HAS — estilo de vida, sal e tabagismo (MS/DG-SA)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Orientação na HAS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativa INCORRETA sobre hábitos na hipertensão.', icon: 'AlertTriangle' },
          { label: 'Frutas e hortaliças', detail: 'Pelo menos três porções diárias — correto.', icon: 'Apple' },
          { label: 'Sal', detail: 'Mínimo no preparo — até uma colher de chá ao dia.', icon: 'Utensils' },
          { label: 'Temperos naturais', detail: 'Preferir cebola, alho, limão — não tempero industrial.', icon: 'Leaf' },
          { label: 'Tabagismo', detail: 'Cigarro eleva PA — desestimular é correto.', icon: 'Ban' },
        ],
        footer_rule: 'Cigarro interfere na PA — B erra',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: orientação INCORRETA para hipertensos.',
          'A: três porções de frutas e hortaliças — correta.',
          'C: reduzir sal — correta.',
          'D: temperos naturais no lugar de industrializados — correta.',
          'B: desestimular cigarro mas dizer que não interfere na PA — INCORRETA.',
          'Tabagismo é fator de risco cardiovascular e eleva pressão arterial.',
          'Marcar letra B.',
          'Em similares: INCORRETA em HAS — testar efeito do tabaco na PA.',
        ],
        footer_rule: 'B nega efeito do cigarro na PA',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HAS — ESTILO DE VIDA',
        rows: [
          { label: 'Dieta', value: 'Frutas, hortaliças, pouco sal', badge: 'hot' },
          { label: 'Tabaco', value: 'Eleva PA — orientar cessar', badge: 'hot' },
          { label: 'Tempero', value: 'Natural em vez de industrial', badge: 'ok' },
          { label: 'Erro B', value: 'Dizer que cigarro não afeta PA', badge: 'warn' },
        ],
        footer_rule: 'Tabagismo piora controle pressórico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA HAS',
        items: [
          {
            label: 'Letra A — frutas',
            detail: 'Três porções diárias de frutas e hortaliças.',
            correct: 'Orientação correta — não é a INCORRETA.',
          },
          {
            label: 'Letra C — sal',
            detail: 'Mínimo de sal no preparo.',
            correct: 'Conduta adequada na HAS.',
          },
          {
            label: 'Letra D — temperos',
            detail: 'Cebola, alho, limão no lugar de industrial.',
            correct: 'Reduz sódio — correta.',
          },
          {
            label: 'Letra B — cigarro',
            detail: 'Cigarro não interfere na pressão arterial.',
            correct: 'INCORRETA — tabagismo eleva PA e risco cardiovascular.',
          },
          {
            label: 'Transferência — álcool',
            detail: 'Bebida não altera pressão.',
            correct: 'O erro é negar efeito do cigarro — B.',
          },
        ],
        footer_rule: 'B = item incorreto',
      },
    ],
  },

  'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-3': {
    family: 'legis',
    branch: 'promocao_principios_direitos',
    guideline: 'Acesso ao SUS e PNAB — universalidade e acolhimento (Lei 8.080)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Acesso e promoção',
        meta: slideMeta,
        items: [
          { label: 'I — Universalidade', detail: 'Promoção e ampliação do acesso sustentam atenção universal (CF + PNAB).', icon: 'Shield' },
          { label: 'II — Organização', detail: 'Horário, equipe, agenda, exames, insumos e ambiente estruturam acesso.', icon: 'Settings' },
          { label: 'III — Acolhimento', detail: 'Usuário no centro NÃO fere descentralização — qualifica o acesso.', icon: 'Heart' },
          { label: 'Pré-requisito', detail: 'Acesso é base da promoção da saúde.', icon: 'Key' },
          { label: 'Pegadinha', detail: 'Achar que acolhimento restringe acesso.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I e II corretas; III é falsa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativas I, II e III sobre acesso à saúde e promoção.',
          'I: promoção e ampliação do acesso garantem universalidade na CF e PNAB — VERDADEIRA.',
          'II: acesso depende de organização da unidade (horário, equipe, insumos, ambiente) — VERDADEIRA.',
          'III: acolher com usuário no centro fere descentralização e restringe acesso — FALSA.',
          'Acolhimento e descentralização são complementares — não opostos.',
          'Combinação correta: I e II apenas.',
          'Marcar letra C.',
          'Em similares: acesso = organização + acolhimento, não burocracia.',
        ],
        footer_rule: 'I + II = letra C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACESSO NO SUS',
        rows: [
          { label: 'I', value: 'Acesso e universalidade — V', badge: 'hot' },
          { label: 'II', value: 'Organização da UBS — V', badge: 'hot' },
          { label: 'III', value: 'Acolhimento ≠ anti-descentralização — F', badge: 'warn' },
          { label: 'Promoção', value: 'Exige acesso efetivo', badge: 'ok' },
        ],
        footer_rule: 'III é a falsa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F ACESSO',
        items: [
          {
            label: 'Letra A — I, II e III',
            detail: 'Todos os itens corretos.',
            correct: 'Inclui III, que erra ao dizer que acolhimento fere descentralização.',
          },
          {
            label: 'Letra B — só III',
            detail: 'Apenas o terceiro item.',
            correct: 'III está errada, mas I e II também são verdadeiros — combinação incompleta.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Segundo e terceiro corretos.',
            correct: 'III é falsa — não pode compor gabarito com II.',
          },
          {
            label: 'Letra C — I e II',
            detail: 'Promoção do acesso e organização da unidade.',
            correct: 'I (universalidade) e II (organização do serviço) — única combinação válida.',
          },
          {
            label: 'Transferência — fila única',
            detail: 'Acesso = só aumentar vagas.',
            correct: 'Acesso exige organização e PNAB — I e II (C).',
          },
        ],
        footer_rule: 'C = I e II apenas',
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
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:promocao-g09] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g09] total=${ok}`);
}

main();
