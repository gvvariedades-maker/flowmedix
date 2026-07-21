#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g10 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g10
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g10';
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
    'promoção da saúde',
    'saneamento básico',
    'determinantes sociais',
    'educação permanente em saúde',
    'autocuidado',
    'prevenção primária',
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
    .replace(/\borientara\b/gi, 'orientar a')
    .replace(/\bassim,o\b/gi, 'assim, o')
    .replace(/\bamanadeterminada\b/gi, 'a uma determinada')
    .replace(/\bmantero\b/gi, 'manter o')
    .replace(/\bincidência\)está\b/gi, 'incidência) está')
    .replace(/\besistemas\b/gi, 'e sistemas')
    .replace(/\bpráticasprofissionais\b/gi, 'práticas profissionais')
    .replace(/\btemosque\b/gi, 'temos que')
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
  'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-8': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Promoção à saúde — visão holística e determinantes (MS/Ottawa)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Promoção × prevenção',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'NÃO corresponde à prevenção e promoção — achar a falsa.', icon: 'AlertTriangle' },
          { label: 'Holística', detail: 'Saúde vai além da ausência de doença.', icon: 'Heart' },
          { label: 'Trabalho', detail: 'Promoção do trabalhador com empregadores e sociedade.', icon: 'Briefcase' },
          { label: 'Epidemiologia local', detail: 'Planos baseados nas doenças da população.', icon: 'BarChart' },
          { label: 'Pegadinha', detail: 'Exigir escolaridade materna como condição de prevenção.', icon: 'Ban' },
        ],
        footer_rule: 'Promover ≠ exigir escolaridade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa que NÃO corresponde à prevenção e promoção.',
          'A: visão holística — coerente com promoção (Ottawa/MS).',
          'B: promoção do trabalhador com empregadores e sociedade — correta.',
          'C: planos baseados nas principais doenças da população — prevenção fundamentada.',
          'D: exigir aumento de escolaridade das mães atrelado ao cartão vacinal — NÃO corresponde.',
          'Promoção educa e incentiva — não impõe grau de escolaridade como exigência.',
          'Marcar letra D.',
          'Em similares: “exigência” + condicionante social punitiva → tendência a ser a falsa.',
        ],
        footer_rule: 'Exigir escolaridade ≠ promoção',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROMOÇÃO AUTÊNTICA',
        rows: [
          { label: 'Visão', value: 'Integral e holística', badge: 'hot' },
          { label: 'Trabalho', value: 'Envolver empregador e sociedade', badge: 'ok' },
          { label: 'Plano', value: 'Base epidemiológica local', badge: 'ok' },
          { label: 'Evitar', value: 'Exigir escolaridade como barreira', badge: 'warn' },
        ],
        footer_rule: 'Incentivar sim — exigir não',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÃO CORRESPONDE',
        items: [
          {
            label: 'Letra A — holística',
            detail: 'Saúde além da ausência de doença.',
            correct: 'Princípio clássico de promoção — não é a falsa.',
          },
          {
            label: 'Letra B — trabalhador',
            detail: 'Empregadores e sociedade no bem-estar.',
            correct: 'Promoção do trabalhador — afirmativa correta.',
          },
          {
            label: 'Letra C — plano local',
            detail: 'Prevenção baseada nas doenças da população.',
            correct: 'Vigilância e planejamento adequados.',
          },
          {
            label: 'Letra D — exigência',
            detail: 'Exigir escolaridade das mães ligada ao cartão vacinal.',
            correct: 'NÃO corresponde — promoção incentiva, não condiciona punitivamente.',
          },
          {
            label: 'Transferência — multa',
            detail: 'Penalizar família por escolaridade.',
            correct: 'Viola princípios de promoção — marque D.',
          },
        ],
        footer_rule: 'D = exigência de escolaridade',
      },
    ],
  },

  'instituto-iacp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563961175-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saneamento — descontinuidade de abastecimento (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Falta de água',
        meta: slideMeta,
        items: [
          { label: 'Descontinuidade', detail: 'Interrupções no abastecimento prejudicam saúde pública.', icon: 'Droplets' },
          { label: 'Rede de distribuição', detail: 'Maior parcela dos casos — falhas na tubulação e rede urbana.', icon: 'Network' },
          { label: 'Outras causas', detail: 'Captação, reservação, tratamento e vandalismo — minoritárias no MS.', icon: 'List' },
          { label: 'Saneamento', detail: 'Água contínua é determinante de saúde coletiva.', icon: 'Home' },
          { label: 'Pegadinha', detail: 'Culpar só tratamento ou captação ignorando a rede.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Maior causa: rede de distribuição',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: maior incidência de descontinuidade no abastecimento (dado MS).',
          'Eliminar A — captação: etapa anterior, não a principal falha citada.',
          'Eliminar B — reservação: menos frequente que problemas na rede.',
          'Eliminar C — vandalismo: causa pontual, não lidera estatística.',
          'Eliminar E — capacidade de tratamento: não é o maior percentual do MS.',
          'Manter D — problemas na rede de distribuição.',
          'Marcar letra D.',
          'Em similares: falta de água urbana → rede de distribuição como principal vetor.',
        ],
        footer_rule: 'Rede de distribuição = D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ABASTECIMENTO MS',
        rows: [
          { label: 'Principal', value: 'Rede de distribuição', badge: 'hot' },
          { label: 'Outros', value: 'Captação · reservação · tratamento', badge: 'info' },
          { label: 'Impacto', value: 'Saneamento e saúde coletiva', badge: 'ok' },
          { label: 'Dado MS', value: 'Maior incidência na distribuição', badge: 'warn' },
        ],
        footer_rule: 'Tubulação e rede urbana',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÁGUA',
        items: [
          {
            label: 'Letra A — captação',
            detail: 'Problemas na captação.',
            correct: 'Não lidera a estatística do MS nesta questão.',
          },
          {
            label: 'Letra B — reservação',
            detail: 'Falhas em reservatórios.',
            correct: 'Menor incidência que a rede.',
          },
          {
            label: 'Letra C — vandalismo',
            detail: 'Ação criminosa pontual.',
            correct: 'Não é a maior causa agregada.',
          },
          {
            label: 'Letra E — tratamento',
            detail: 'Capacidade da estação.',
            correct: 'Etapa distinta — eliminar.',
          },
          {
            label: 'Transferência — seca',
            detail: 'Falta de chuva como única causa.',
            correct: 'Infraestrutura de distribuição — D.',
          },
        ],
        footer_rule: 'D = rede de distribuição',
      },
    ],
  },

  'instituto-iacp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563961175-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Autocuidado — participação do usuário no tratamento (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sujeito ativo',
        meta: slideMeta,
        items: [
          { label: 'Participação', detail: 'Usuário envolvido no próprio tratamento.', icon: 'User' },
          { label: 'Autocuidado', detail: 'Gerir saúde no cotidiano com apoio da equipe.', icon: 'Heart' },
          { label: 'Não confundir', detail: 'Estratificação, gestão de caso ou só acolhimento.', icon: 'Ban' },
          { label: 'Promoção', detail: 'Empoderar para adesão e decisão compartilhada.', icon: 'Shield' },
          { label: 'Pegadinha', detail: '“Prática de saúde” genérica sem conceito técnico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Tratamento compartilhado = autocuidado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nome do processo em que o usuário é sujeito ativo do tratamento.',
          'Eliminar A — estratificação: classificar risco — outro eixo.',
          'Eliminar B — gestão de caso: coordenação assistencial — não define participação ativa.',
          'Eliminar D — prática de saúde: termo amplo demais.',
          'Eliminar E — acolhimento: porta de entrada — não é o processo de autocuidado.',
          'Manter C — autocuidado.',
          'Marcar letra C.',
          'Em similares: sucesso terapêutico exige autocuidado orientado.',
        ],
        footer_rule: 'Autocuidado = C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AUTOCUIDADO',
        rows: [
          { label: 'Definição', value: 'Usuário ativo no tratamento', badge: 'hot' },
          { label: 'Equipe', value: 'Orienta — não substitui o sujeito', badge: 'ok' },
          { label: '≠', value: 'Estratificação ou gestão de caso', badge: 'warn' },
          { label: 'Meta', value: 'Adesão e corresponsabilidade', badge: 'hot' },
        ],
        footer_rule: 'Cuidar de si com suporte',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TERMO',
        items: [
          {
            label: 'Letra A — estratificação',
            detail: 'Classificar nível de risco.',
            correct: 'Não nomeia participação ativa no tratamento.',
          },
          {
            label: 'Letra B — gestão de caso',
            detail: 'Coordenação do cuidado.',
            correct: 'Conceito administrativo-clínico — eliminar.',
          },
          {
            label: 'Letra D — prática de saúde',
            detail: 'Termo genérico.',
            correct: 'Não é o conceito técnico pedido.',
          },
          {
            label: 'Letra E — acolhimento',
            detail: 'Recepção na unidade.',
            correct: 'Primeiro contato — não autocuidado.',
          },
          {
            label: 'Transferência — adesão passiva',
            detail: 'Paciente só obedece receita.',
            correct: 'Sujeito ativo no tratamento — autocuidado (C).',
          },
        ],
        footer_rule: 'C = autocuidado',
      },
    ],
  },

  'instituto-verbena-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-4': {
    family: 'conceito',
    branch: 'promocao_principios_direitos',
    guideline: 'Determinantes sociais da saúde — OMS/CSDH',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Determinantes OMS',
        meta: slideMeta,
        items: [
          { label: 'Ciclo de vida', detail: 'Nascer, crescer, trabalhar, viver e envelhecer.', icon: 'Users' },
          { label: 'Forças estruturais', detail: 'Sistemas que moldam o cotidiano.', icon: 'Layers' },
          { label: 'DSS', detail: 'Condições sociais, econômicas e ambientais da saúde.', icon: 'Globe' },
          { label: 'Não confundir', detail: 'Iniquidade é consequência — não a definição.', icon: 'Ban' },
          { label: 'Promoção', detail: 'Atuar nos determinantes — não só na doença.', icon: 'Megaphone' },
        ],
        footer_rule: 'Definição OMS = DSS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conceito OMS sobre condições de nascimento, vida, trabalho e envelhecimento.',
          'Eliminar A — iniquidades: desigualdade resultante, não o termo definido.',
          'Eliminar B — requisitos de qualidade de vida: formulação vaga.',
          'Eliminar D — tendências econômicas: recorte parcial.',
          'Manter C — determinantes sociais da saúde.',
          'Marcar letra C.',
          'Em similares: frase clássica da Comissão CSDH/OMS → DSS.',
        ],
        footer_rule: 'C = determinantes sociais',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DSS (OMS)',
        rows: [
          { label: 'Onde', value: 'Nascer · crescer · trabalhar · envelhecer', badge: 'hot' },
          { label: 'O quê', value: 'Forças e sistemas do cotidiano', badge: 'hot' },
          { label: 'Nome', value: 'Determinantes sociais da saúde', badge: 'hot' },
          { label: '≠', value: 'Iniquidade (é efeito)', badge: 'warn' },
        ],
        footer_rule: 'Decore a definição OMS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DSS',
        items: [
          {
            label: 'Letra A — iniquidade',
            detail: 'Desigualdades em saúde.',
            correct: 'Consequência dos determinantes — não a definição.',
          },
          {
            label: 'Letra B — qualidade de vida',
            detail: 'Requisitos genéricos.',
            correct: 'Não é o termo técnico OMS.',
          },
          {
            label: 'Letra D — evolução econômica',
            detail: 'Tendências do país.',
            correct: 'Recorte incompleto — eliminar.',
          },
          {
            label: 'Transferência — estilo de vida',
            detail: 'Só hábitos individuais.',
            correct: 'Condições estruturais — determinantes sociais (C).',
          },
        ],
        footer_rule: 'C = determinantes sociais da saúde',
      },
    ],
  },

  'instituto-verbena-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-5': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação Permanente em Saúde — problemas do trabalho (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EPS no SUS',
        meta: slideMeta,
        items: [
          { label: 'EPS', detail: 'Aprendizagem no trabalho — transformar prática.', icon: 'BookOpen' },
          { label: 'Realidade', detail: 'Parte dos problemas vividos na assistência.', icon: 'MapPin' },
          { label: 'Equipe', detail: 'Conhecimentos e experiências do dia a dia.', icon: 'Users' },
          { label: 'Não é', detail: 'Curso fechado desconectado do serviço.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Só perfil assistencial ou necessidade individual.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EPS nasce do problema real',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: base da Educação Permanente em Saúde (EPS).',
          'Eliminar B — programa de curso estabelecido: formação tradicional, não EPS.',
          'Eliminar C — necessidade dos profissionais: subjetivo isolado.',
          'Eliminar D — perfil da assistência: recorte estático.',
          'Manter A — problemas enfrentados na realidade do trabalho.',
          'Marcar letra A.',
          'Em similares: EPS = problema concreto da equipe → aprendizado significativo.',
        ],
        footer_rule: 'Problema da realidade = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EPS — MS',
        rows: [
          { label: 'Base', value: 'Problemas da realidade assistencial', badge: 'hot' },
          { label: 'Método', value: 'Trabalho + troca de experiências', badge: 'hot' },
          { label: 'Evitar', value: 'Curso pronto sem vínculo com o serviço', badge: 'warn' },
          { label: 'Meta', value: 'Transformar práticas', badge: 'ok' },
        ],
        footer_rule: 'Aprender com o que a UBS vive',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EPS',
        items: [
          {
            label: 'Letra B — curso',
            detail: 'Programa de curso estabelecido.',
            correct: 'EPS não é grade fixa desligada do trabalho.',
          },
          {
            label: 'Letra C — necessidade',
            detail: 'Só demanda individual do profissional.',
            correct: 'EPS é coletiva e situada — eliminar.',
          },
          {
            label: 'Letra D — perfil',
            detail: 'Perfil da assistência prestada.',
            correct: 'Recorte estático — não base da EPS.',
          },
          {
            label: 'Transferência — palestra externa',
            detail: 'Capacitação fora da unidade sem problema local.',
            correct: 'Problemas da realidade vivida — A.',
          },
        ],
        footer_rule: 'A = problemas da realidade',
      },
    ],
  },

  'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Níveis de prevenção — visita do ACE (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Visita do ACE',
        meta: slideMeta,
        items: [
          { label: 'ACE', detail: 'Agente de combate a endemias — ação no território.', icon: 'MapPin' },
          { label: 'Visita domiciliar', detail: 'Bloquear vetores e educar — antes da doença.', icon: 'Home' },
          { label: 'Proteção específica', detail: 'Medidas contra agentes e hábitos de vetores.', icon: 'Shield' },
          { label: 'Não é', detail: 'Reabilitação, diagnóstico ou tratamento tardio.', icon: 'Ban' },
          { label: 'Processo saúde-doença', detail: 'Prevenção primária no domicílio.', icon: 'Activity' },
        ],
        footer_rule: 'ACE no domicílio = proteção específica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: visita domiciliar do ACE enquadrada no processo saúde-doença.',
          'Eliminar A — reabilitação: fase terciária.',
          'Eliminar C — tratamento precoce: secundária.',
          'Eliminar D — tratamento tardio: terciária.',
          'Eliminar E — diagnóstico patológico precoce: secundária.',
          'Manter B — proteção específica (prevenção primária contra endemias).',
          'Marcar letra B.',
          'Em similares: controle de vetores domiciliar = proteção específica.',
        ],
        footer_rule: 'Primária específica = B',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACE × PREVENÇÃO',
        rows: [
          { label: 'Ação', value: 'Visita domiciliar antivetorial', badge: 'hot' },
          { label: 'Nível', value: 'Proteção específica', badge: 'hot' },
          { label: '≠', value: 'Tratar ou reabilitar', badge: 'warn' },
          { label: 'Foco', value: 'Bloquear transmissão no território', badge: 'ok' },
        ],
        footer_rule: 'Endemias — prevenir no lar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACE',
        items: [
          {
            label: 'Letra A — reabilitação',
            detail: 'Recuperar sequelas.',
            correct: 'Terciária — não visita do ACE.',
          },
          {
            label: 'Letra C — tratamento precoce',
            detail: 'Intervir cedo na doença instalada.',
            correct: 'Corresponde à prevenção secundária — não à visita antivetorial.',
          },
          {
            label: 'Letra D — tardio',
            detail: 'Tratamento em fase avançada.',
            correct: 'Terciária por definição — visita do ACE atua antes do adoecimento.',
          },
          {
            label: 'Letra E — diagnóstico',
            detail: 'Diagnóstico patológico precoce.',
            correct: 'Rastreamento clínico — distinto da proteção específica domiciliar.',
          },
          {
            label: 'Transferência — fumacê',
            detail: 'Borrifar só na rua.',
            correct: 'Visita domiciliar educativa e antivetorial — B.',
          },
        ],
        footer_rule: 'B = proteção específica',
      },
    ],
  },

  'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-8': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saneamento básico — ETA e ETE (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Qualidade da água',
        meta: slideMeta,
        items: [
          { label: 'Saneamento', detail: 'Água tratada e esgoto coletado protegem a população.', icon: 'Droplets' },
          { label: 'ETA/ETE', detail: 'Estações de tratamento de água e esgoto.', icon: 'Factory' },
          { label: 'Política pública', detail: 'Ampliar infraestrutura de tratamento.', icon: 'TrendingUp' },
          { label: 'Não basta', detail: 'Fossa negra isolada ou aterro sem tratamento.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Despejo em vazadouro ou só fossa rural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Expandir ETA e ETE',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: medida para controle da qualidade da água e saneamento.',
          'Eliminar B — aterros energéticos: resíduos sólidos, não tratamento hídrico.',
          'Eliminar C e D — fossas negras rurais/urbanas: solução precária, não política de qualidade.',
          'Eliminar E — vazadouros rurais: disposição inadequada de resíduos.',
          'Manter A — ampliação de estações de tratamento de água e esgoto.',
          'Marcar letra A.',
          'Em similares: saneamento estrutural = ETA + ETE.',
        ],
        footer_rule: 'Ampliar estações de tratamento de água e esgoto',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SANEAMENTO BÁSICO',
        rows: [
          { label: 'Água', value: 'Estação de tratamento (ETA)', badge: 'hot' },
          { label: 'Esgoto', value: 'Estação de tratamento (ETE)', badge: 'hot' },
          { label: 'Evitar', value: 'Fossa e vazadouro como política', badge: 'warn' },
          { label: 'Saúde', value: 'Prevenção coletiva de DTAs', badge: 'ok' },
        ],
        footer_rule: 'Tratar água e esgoto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANEAMENTO',
        items: [
          {
            label: 'Letra B — aterro',
            detail: 'Aterros energéticos.',
            correct: 'Resíduos sólidos — não qualidade da água.',
          },
          {
            label: 'Letra C — fossa rural',
            detail: 'Fossas negras em área rural.',
            correct: 'Solução individual precária — eliminar.',
          },
          {
            label: 'Letra D — fossa urbana',
            detail: 'Fossas em área urbana.',
            correct: 'Inadequado como política de saneamento ampliado.',
          },
          {
            label: 'Letra E — vazadouro',
            detail: 'Despejo em vazadouro rural.',
            correct: 'Poluição ambiental — não tratamento de água.',
          },
          {
            label: 'Transferência — cloro doméstico',
            detail: 'Só hipoclorito em casa.',
            correct: 'Infraestrutura pública ETA/ETE — A.',
          },
        ],
        footer_rule: 'A = estações de tratamento',
      },
    ],
  },

  'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-9': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Políticas educacionais em saúde — EPS e promoção (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Políticas educacionais',
        meta: slideMeta,
        items: [
          { label: 'I — Educação em saúde', detail: 'Orientar hábitos e prevenção na população.', icon: 'BookOpen' },
          { label: 'II — Educação sexual', detail: 'Prevenção de IST e gravidez na adolescência.', icon: 'Heart' },
          { label: 'III — Educação social', detail: 'Participação e determinantes no território.', icon: 'Users' },
          { label: 'Conjunto', detail: 'Três eixos complementares nas políticas públicas.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Marcar só um eixo isolado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I + II + III corretas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quais políticas educacionais reduzem problemas de saúde.',
          'I: educação em saúde — VERDADEIRA (promoção e prevenção).',
          'II: educação sexual — VERDADEIRA (IST, planejamento reprodutivo).',
          'III: educação social — VERDADEIRA (determinantes e cidadania).',
          'As três integram políticas educacionais em saúde.',
          'Marcar letra A — I, II e III.',
          'Em similares: promoção combina educação em saúde, sexual e social.',
        ],
        footer_rule: 'Todas corretas = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO × SAÚDE',
        rows: [
          { label: 'I', value: 'Educação em saúde — V', badge: 'hot' },
          { label: 'II', value: 'Educação sexual — V', badge: 'hot' },
          { label: 'III', value: 'Educação social — V', badge: 'hot' },
          { label: 'Integração', value: 'Três eixos nas políticas públicas', badge: 'ok' },
        ],
        footer_rule: 'Políticas educacionais integradas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F EDUCAÇÃO',
        items: [
          {
            label: 'Letra B — I e II',
            detail: 'Exclui educação social.',
            correct: 'III também é política educacional em saúde.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Exclui educação sexual.',
            correct: 'II é essencial em IST e adolescência.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Exclui educação em saúde.',
            correct: 'I é núcleo da promoção — eliminar.',
          },
          {
            label: 'Letra E — só III',
            detail: 'Apenas educação social.',
            correct: 'Reducionista — as três se complementam.',
          },
          {
            label: 'Transferência — só escola',
            detail: 'Educação fora do SUS.',
            correct: 'I, II e III nas políticas de saúde — A.',
          },
        ],
        footer_rule: 'A = I, II e III',
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
    console.log(`[handcraft:promocao-g10] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g10] total=${ok}`);
}

main();
