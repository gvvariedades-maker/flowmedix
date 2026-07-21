#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g08 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g08
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g08';
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
    'higiene de alimentos',
    'controle de vetores',
    'níveis de prevenção',
    'saúde bucal',
    'educação em saúde',
    'promoção comunitária',
  ],
};

const ANVISA_ALIMENTOS_SOURCE = {
  id: 'anvisa-higiene-alimentos',
  tier: 'A' as const,
  issuer: 'Anvisa',
  title: 'Boas práticas — higiene e sanitização de alimentos',
  year: 2020,
  url: 'https://www.gov.br/anvisa/pt-br/assuntos/alimentos',
  covers: ['sanitização de hortaliças', 'hipoclorito de sódio'],
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
  sources?: (typeof MS_PROMOCAO_SOURCE | typeof ANVISA_ALIMENTOS_SOURCE)[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

/** Gabarito corrigido no handcraft (erro de chave no catálogo). */
const GABARITO_FIX: Record<string, string> = {
  'ieses-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-3': 'A',
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
    .replace(/\bdepreparo\b/gi, 'de preparo')
    .replace(/\bdeve-serealizar\b/gi, 'deve realizar')
    .replace(/\banimaisdesempenham\b/gi, 'animais desempenham')
    .replace(/\broedores,pelos\b/gi, 'roedores, pelos')
    .replace(/\bsurgimentode\b/gi, 'surgimento de')
    .replace(/\bprática dosserviços\b/gi, 'prática dos serviços')
    .replace(/\bcomo, por exemplo, ouso\b/gi, 'como, por exemplo, o uso')
    .replace(/\bsuasfamílias\b/gi, 'suas famílias')
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
  'ibfc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-4': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Sanitização de hortaliças — hipoclorito de sódio (Anvisa/MS)',
    sources: [MS_PROMOCAO_SOURCE, ANVISA_ALIMENTOS_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Higiene de alimentos',
        meta: slideMeta,
        items: [
          { label: 'Sanitização', detail: 'Reduzir microrganismos em superfícies e hortaliças.', icon: 'Droplets' },
          { label: 'Cozimento', detail: 'Outra via de eliminação microbiana — não confundir com sanitizar.', icon: 'Flame' },
          { label: 'Hortaliças cruas', detail: 'Lavar e sanitizar antes do consumo in natura.', icon: 'Leaf' },
          { label: 'Hipoclorito', detail: 'Saneante à base de cloro — diluição conforme bula/MS.', icon: 'Beaker' },
          { label: 'Pegadinha', detail: 'Detergente ou sabão em pedra não substituem sanitizante de cloro.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Hortaliça crua = sanitização com cloro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: produto para sanitização de hortaliças.',
          'Eliminar A — tensoativos biodegradáveis: limpeza geral, não protocolo de sanitização de folhas.',
          'Eliminar B — detergente líquido: remove gordura, não é sanitizante de hortaliças.',
          'Eliminar C — sabão em pedra: higiene de mãos/utensílios — inadequado para sanitizar verduras.',
          'Manter D — saneante à base de hipoclorito de sódio com água (diluição adequada).',
          'Marcar letra D.',
          'Em similares: hortaliça in natura → hipoclorito diluído, enxágue e consumo seguro.',
        ],
        footer_rule: 'Cloro diluído sanitiza hortaliças',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SANITIZAÇÃO DE HORTALIÇAS',
        rows: [
          { label: 'Produto', value: 'Hipoclorito de sódio diluído', badge: 'hot' },
          { label: 'Não usar', value: 'Detergente ou sabão em pedra', badge: 'warn' },
          { label: 'Depois', value: 'Enxaguar com água potável', badge: 'ok' },
          { label: 'Objetivo', value: 'Reduzir microrganismos na superfície', badge: 'info' },
        ],
        footer_rule: 'Anvisa/MS — cloro para folhas e frutas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANITIZAÇÃO',
        items: [
          {
            label: 'Letra A — tensoativos',
            detail: 'Saneantes biodegradáveis genéricos.',
            correct: 'Não é o produto padrão para sanitizar hortaliças.',
          },
          {
            label: 'Letra B — detergente',
            detail: 'Detergente líquido de cozinha.',
            correct: 'Limpeza de louça — não sanitização de alimentos crus.',
          },
          {
            label: 'Letra C — sabão',
            detail: 'Sabão em pedra e água corrente.',
            correct: 'Higiene manual — inadequado para folhas.',
          },
          {
            label: 'Transferência — água só',
            detail: 'Lavar sob torneira dispensa sanitizante.',
            correct: 'Hortaliças exigem sanitização com hipoclorito — D.',
          },
        ],
        footer_rule: 'D = hipoclorito de sódio',
      },
    ],
  },

  'idcap-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-4': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Controle de vetores e roedores — vigilância em saúde (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Controle de roedores',
        meta: slideMeta,
        items: [
          { label: 'Roedores urbanos', detail: 'Impacto econômico e disseminação de zoonoses.', icon: 'Rat' },
          { label: 'Métodos', detail: 'Mecânicos, biológicos e químicos.', icon: 'Settings' },
          { label: 'Desratização', detail: 'Eliminação de roedores — termo técnico correto.', icon: 'Target' },
          { label: 'Não confundir', detail: 'Desinfecção, antissepsia e assepsia são outras práticas.', icon: 'Ban' },
          { label: 'Promoção', detail: 'Ambiente saudável = controle de vetores no território.', icon: 'Home' },
        ],
        footer_rule: 'Roedores → desratização',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nome da medida para eliminação de roedores (métodos mecânico, biológico e químico).',
          'Eliminar A — desinfecção: destruir microrganismos em superfícies/objetos.',
          'Eliminar C — antissepsia: reduzir microrganismos em tecidos vivos.',
          'Eliminar D — assepsia: conjunto de medidas para prevenir infecção em procedimentos.',
          'Manter B — desratização: controle específico de roedores.',
          'Marcar letra B.',
          'Em similares: deratização/desratização = roedores; desinsetização = insetos.',
        ],
        footer_rule: 'Desratização = roedores',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONTROLE DE VETORES',
        rows: [
          { label: 'Roedores', value: 'Desratização', badge: 'hot' },
          { label: 'Insetos', value: 'Desinsetização', badge: 'ok' },
          { label: 'Desinfecção', value: 'Objetos e superfícies', badge: 'info' },
          { label: 'Antissepsia', value: 'Pele e mucosas', badge: 'info' },
        ],
        footer_rule: 'Cada vetor tem nome próprio',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ROEDORES',
        items: [
          {
            label: 'Letra A — desinfecção',
            detail: 'Eliminar microrganismos em ambiente.',
            correct: 'Não é controle de roedores.',
          },
          {
            label: 'Letra C — antissepsia',
            detail: 'Redução de germes em tecido vivo.',
            correct: 'Procedimento clínico — não desratização.',
          },
          {
            label: 'Letra D — assepsia',
            detail: 'Prevenção de infecção em cuidados.',
            correct: 'Conceito de biossegurança — eliminar.',
          },
          {
            label: 'Transferência — desinsetização',
            detail: 'Controle de baratas e mosquitos.',
            correct: 'Roedores = desratização — letra B.',
          },
        ],
        footer_rule: 'B = desratização',
      },
    ],
  },

  'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Níveis de prevenção — Leavell & Clark / MS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção primária',
        meta: slideMeta,
        items: [
          { label: 'Estratégia fundamental', detail: 'Prevenção de doenças reduz morbimortalidade e promove saúde.', icon: 'Shield' },
          { label: 'Primária', detail: 'Eliminação de fatores de risco antes da manifestação da doença.', icon: 'Shield' },
          { label: 'Proteção específica', detail: 'Promoção da saúde e bloqueio do surgimento de doenças.', icon: 'Heart' },
          { label: 'Atenção primária', detail: 'Níveis de prevenção orientam práticas na APS e na rede.', icon: 'Home' },
          { label: 'Pegadinha', detail: 'Trocar primária por reabilitação, complicações ou diagnóstico precoce.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Primária = antes da manifestação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa que descreve corretamente a prevenção primária.',
          'Enunciado: níveis vão da eliminação de fatores de risco à reabilitação — identifique o primeiro nível.',
          'Eliminar A — reduzir impactos com reabilitação de indivíduos acometidos: terciária.',
          'Eliminar B — diagnóstico precoce, progressão e complicações: secundária.',
          'Eliminar D — identificação precoce de sinais clínicos: secundária.',
          'Eliminar E — evitar intervenções desnecessárias: eixo distinto da primária.',
          'Manter C — promoção da saúde e proteção específica antes da manifestação.',
          'Marcar letra C.',
          'Em similares: primária impede o surgimento — morbimortalidade cai com promoção.',
        ],
        footer_rule: 'Promoção + proteção = primária',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÍVEIS DE PREVENÇÃO',
        rows: [
          { label: 'Primária', value: 'Promoção e proteção específica', badge: 'hot' },
          { label: 'Secundária', value: 'Rastrear e tratar cedo', badge: 'ok' },
          { label: 'Terciária', value: 'Complicação e reabilitação', badge: 'info' },
          { label: 'Gatilho', value: 'Doença ainda não instalada', badge: 'warn' },
        ],
        footer_rule: 'Primária impede surgimento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÍVEIS',
        items: [
          {
            label: 'Letra A — reabilitação',
            detail: 'Reduzir impactos da doença instalada.',
            correct: 'Terciária — não primária.',
          },
          {
            label: 'Letra B — diagnóstico precoce',
            detail: 'Tratamento oportuno.',
            correct: 'Secundária — eliminar.',
          },
          {
            label: 'Letra D — sinais clínicos',
            detail: 'Identificação precoce para tratamento.',
            correct: 'Secundária — não primária.',
          },
          {
            label: 'Letra E — iatrogenia',
            detail: 'Evitar procedimentos desnecessários.',
            correct: 'Quaternária / outro conceito — não define primária.',
          },
          {
            label: 'Transferência — vacina',
            detail: 'Imunização como exemplo.',
            correct: 'Vacina é proteção específica — enquadra na primária (C).',
          },
        ],
        footer_rule: 'C = promoção e proteção específica',
      },
    ],
  },

  'idib-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778934900821-7': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saúde bucal preventiva — flúor, não cálcio do creme (MS/SB)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saúde bucal preventiva',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Marcar o item INCORRETO sobre cuidados bucais.', icon: 'AlertTriangle' },
          { label: 'Escovação', detail: 'Após refeições principais + fio dental.', icon: 'Smile' },
          { label: 'Flúor', detail: 'Creme dental e enxaguante com flúor protegem esmalte.', icon: 'Droplets' },
          { label: 'Alimentação', detail: 'Frutas, verduras; menos açúcar e refrigerante.', icon: 'Apple' },
          { label: 'Dentista', detail: 'Consultas regulares e orientação de técnica.', icon: 'Stethoscope' },
        ],
        footer_rule: 'Flúor protege — cálcio do creme não é o ativo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: item INCORRETO sobre cuidados com saúde bucal.',
          'A: escovação após refeições, fio dental e flúor — conduta correta.',
          'C: alimentação equilibrada com menos doces — correta.',
          'D: visita regular ao dentista e técnica de higiene — correta.',
          'B: preferir produtos com cálcio em cremes e enxaguantes — INCORRETA.',
          'Proteção do esmalte vem do flúor tópico — não do cálcio do dentifrício.',
          'Marcar letra B.',
          'Em similares: INCORRETA em saúde bucal — testar flúor × cálcio.',
        ],
        footer_rule: 'B erra o ativo protetor',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIGIENE BUCAL',
        rows: [
          { label: 'Escova + fio', value: 'Remover placa bacteriana', badge: 'hot' },
          { label: 'Flúor', value: 'Fortalecer esmalte', badge: 'hot' },
          { label: 'Cálcio do creme', value: 'Não substitui flúor tópico', badge: 'warn' },
          { label: 'Prevenção', value: 'Menos custosa que tratamento', badge: 'ok' },
        ],
        footer_rule: 'Flúor sim — cálcio do dentifrício não',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA BUCAL',
        items: [
          {
            label: 'Letra A — escovação',
            detail: 'Três vezes ao dia, fio dental e flúor.',
            correct: 'Conduta correta — não é a INCORRETA.',
          },
          {
            label: 'Letra C — alimentação',
            detail: 'Mais frutas e verduras, menos doces.',
            correct: 'Orientação preventiva adequada.',
          },
          {
            label: 'Letra D — dentista',
            detail: 'Consultas regulares e técnica de escovação.',
            correct: 'Cuidado preventivo correto.',
          },
          {
            label: 'Letra B — cálcio',
            detail: 'Cremes e enxaguantes com cálcio fortalecem dentes.',
            correct: 'INCORRETA — o ativo protetor é o flúor.',
          },
          {
            label: 'Transferência — clareamento',
            detail: 'Creme clareador substitui flúor.',
            correct: 'Prevenção de cárie = flúor — marque B como incorreta.',
          },
        ],
        footer_rule: 'B = item incorreto',
      },
    ],
  },

  'ieses-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-3': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde — papel do técnico de enfermagem (COFEN/APS)',
    examVsCurrent: 'catalog_gabarito_repaired',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Educação do técnico',
        meta: slideMeta,
        items: [
          { label: 'Função do técnico', detail: 'Educar pacientes e famílias no cuidado cotidiano.', icon: 'Users' },
          { label: 'Orientação prática', detail: 'Cuidados básicos e uso de medicamentos após procedimentos.', icon: 'ClipboardList' },
          { label: 'Fora do escopo', detail: 'Graduação, residência médica e pesquisa acadêmica.', icon: 'Ban' },
          { label: 'APS', detail: 'Educação em saúde no território e na unidade.', icon: 'Home' },
          { label: 'Pegadinha', detail: 'Confundir com papel de docente universitário ou médico residente.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Técnico educa no cuidado direto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: como o técnico em enfermagem contribui para educação de pacientes e famílias.',
          'Eliminar B — ministrar graduação e pós: atribuição de docente superior.',
          'Eliminar C — publicar artigos científicos: pesquisador, não função típica do técnico.',
          'Eliminar D — implementar residência médica: gestão médica — fora do escopo.',
          'Manter A — instruções sobre cuidados básicos e medicamentos após procedimentos.',
          'Marcar letra A.',
          'Em similares: técnico educa no cotidiano do cuidado — não na formação médica.',
        ],
        footer_rule: 'Orientação no cuidado = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TÉCNICO × EDUCAÇÃO',
        rows: [
          { label: 'Faz', value: 'Orientar cuidados e medicamentos', badge: 'hot' },
          { label: 'Não faz', value: 'Graduação, residência médica, artigo científico', badge: 'warn' },
          { label: 'Onde', value: 'UBS, hospital, domicílio', badge: 'ok' },
          { label: 'Foco', value: 'Autocuidado da pessoa e família', badge: 'hot' },
        ],
        footer_rule: 'Educação em saúde no cuidado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PAPEL DO TÉCNICO',
        items: [
          {
            label: 'Letra B — graduação',
            detail: 'Ministrar cursos de enfermagem.',
            correct: 'Docência superior — não é função do técnico.',
          },
          {
            label: 'Letra C — artigos',
            detail: 'Publicar pesquisa científica.',
            correct: 'Atividade de pesquisador — fora do escopo.',
          },
          {
            label: 'Letra D — residência',
            detail: 'Programas de residência médica.',
            correct: 'Gestão médica — eliminar.',
          },
          {
            label: 'Letra A — orientação',
            detail: 'Cuidados básicos e medicamentos após procedimentos.',
            correct: 'Contribuição correta na educação em saúde — gabarito.',
          },
          {
            label: 'Transferência — prescrição',
            detail: 'Prescrever tratamento médico.',
            correct: 'Técnico orienta cuidado e adesão — A.',
          },
        ],
        footer_rule: 'A = educação no cuidado cotidiano',
      },
    ],
  },

  'igeduc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-1': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Níveis de prevenção — secundária ≠ reduzir incidência (Leavell)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção secundária',
        meta: slideMeta,
        items: [
          { label: 'Afirmativa', detail: 'Secundária reduz incidência e casos novos — testar verdade.', icon: 'FileText' },
          { label: 'Primária', detail: 'Reduz incidência — evita surgimento de casos.', icon: 'Shield' },
          { label: 'Secundária', detail: 'Diagnóstico precoce e tratamento — doença já iniciada.', icon: 'Search' },
          { label: 'Incidência', detail: 'Casos novos na população — alvo da primária.', icon: 'TrendingDown' },
          { label: 'Pegadinha', detail: 'Atribuir à secundária o efeito da primária.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Incidência = primária, não secundária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: secundária diminui incidência e casos novos; consiste em diagnóstico precoce.',
          'Primeira parte errada: reduzir incidência/casos novos é prevenção primária.',
          'Segunda parte parcialmente certa: diagnóstico precoce é secundária.',
          'Afirmativa mistura conceitos — enunciado como um todo é falso.',
          'Julgar Errado — letra B.',
          'Em similares: secundária age quando a doença já começou — não impede casos novos.',
        ],
        footer_rule: 'Secundária ≠ reduzir incidência',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRIMÁRIA × SECUNDÁRIA',
        rows: [
          { label: 'Primária', value: 'Menos casos novos (incidência)', badge: 'hot' },
          { label: 'Secundária', value: 'Detectar e tratar cedo', badge: 'hot' },
          { label: 'Indicador', value: 'Doença já presente na secundária', badge: 'warn' },
          { label: 'Erro', value: 'Trocar os efeitos de cada nível', badge: 'warn' },
        ],
        footer_rule: 'Incidência → primária',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SECUNDÁRIA',
        items: [
          {
            label: 'Marcar Certo',
            detail: 'Focar só em “diagnóstico precoce”.',
            correct: 'A primeira metade erra ao falar em reduzir incidência — julgue Errado.',
          },
          {
            label: 'Confundir níveis',
            detail: 'Achar que qualquer prevenção reduz casos novos.',
            correct: 'Só primária reduz incidência — secundária reduz gravidade.',
          },
          {
            label: 'Transferência — rastreamento',
            detail: 'Mamografia como primária.',
            correct: 'Rastreamento é secundária — mas não reduz incidência como no enunciado.',
          },
        ],
        footer_rule: 'Afirmativa falsa = Errado (B)',
      },
    ],
  },

  'igeduc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-2': {
    family: 'certo_errado',
    branch: 'promocao_principios_direitos',
    guideline: 'Modelo biomédico curativo × promoção integral (MS/Ottawa)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prática ainda curativa',
        meta: slideMeta,
        items: [
          { label: 'Conceito ampliado', detail: 'Saúde ≠ apenas ausência de doença.', icon: 'Heart' },
          { label: 'Realidade assistencial', detail: 'Serviços ainda priorizam ação curativa pontual.', icon: 'Stethoscope' },
          { label: 'Queixa específica', detail: 'Foco na doença e não nos determinantes.', icon: 'AlertCircle' },
          { label: 'Promoção', detail: 'Deveria integrar prevenção e determinantes sociais.', icon: 'Layers' },
          { label: 'Afirmativa', detail: 'Prática ainda voltada sobretudo ao curativo — julgar.', icon: 'FileText' },
        ],
        footer_rule: 'SUS ideal ≠ prática ainda biomédica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: apesar do conceito ampliado, serviços ainda priorizam atuação curativa sobre doença pontual.',
          'Alinha com crítica à medicalização e ao modelo hospitalocêntrico no SUS.',
          'Promoção e integralidade estão na lei — mas a prática cotidiana ainda é majoritariamente curativa.',
          'Afirmativa descreve lacuna reconhecida na atenção à saúde.',
          'Julgar Certo — letra A.',
          'Em similares: distinguir modelo legal (integral) da prática ainda curativa.',
        ],
        footer_rule: 'Crítica realista = Certo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROMOÇÃO × CURA',
        rows: [
          { label: 'Lei / conceito', value: 'Integralidade e promoção', badge: 'ok' },
          { label: 'Prática comum', value: 'Curativo e queixa pontual', badge: 'hot' },
          { label: 'Desafio', value: 'Reorientar o modelo de cuidado', badge: 'warn' },
          { label: 'Ottawa', value: 'Reorientar serviços de saúde', badge: 'info' },
        ],
        footer_rule: 'Ainda há excesso de curativo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MODELO DE CUIDADO',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Achar que o SUS já é totalmente promotor.',
            correct: 'Afirmativa descreve realidade assistencial — Certo.',
          },
          {
            label: 'Idealizar APS',
            detail: 'Negar foco curativo em toda a rede.',
            correct: 'Banca admite lacuna entre discurso e prática — A.',
          },
          {
            label: 'Transferência — só hospital',
            detail: 'Problema restrito ao hospital.',
            correct: 'Vale à atenção em geral — prática ainda curativa (Certo).',
          },
        ],
        footer_rule: 'Certo = ainda prioriza cura',
      },
    ],
  },

  'igeduc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-4': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção de IST — preservativo para toda população (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Promoção e IST',
        meta: slideMeta,
        items: [
          { label: 'Afirmativa', detail: 'Preservativo masculino só entre parceiros do mesmo sexo.', icon: 'FileText' },
          { label: 'Prevenção ampla', detail: 'IST/HIV — proteção para qualquer relação sexual de risco.', icon: 'Shield' },
          { label: 'População geral', detail: 'Heterossexuais e homossexuais — sem exclusão.', icon: 'Users' },
          { label: 'Promoção', detail: 'Divulgar medidas preventivas para toda a comunidade.', icon: 'Megaphone' },
          { label: 'Pegadinha', detail: 'Restringir preservativo a um grupo — estigmatiza e erra.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Preservativo não é exclusivo de um grupo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: promoção divulga preservativo masculino exclusivamente entre parceiros do mesmo sexo.',
          'MS recomenda preservativo para prevenção de IST em todas as relações de risco.',
          'Restringir a um grupo exclui heterossexuais e generaliza estigma.',
          'Afirmativa é falsa e reducionista.',
          'Julgar Errado — letra B.',
          'Em similares: prevenção de IST é universal — não segmentar por orientação.',
        ],
        footer_rule: 'Prevenção IST é para todos',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREVENÇÃO DE IST',
        rows: [
          { label: 'Preservativo', value: 'Todas as relações de risco', badge: 'hot' },
          { label: 'Promoção', value: 'Sem estigmatizar grupos', badge: 'hot' },
          { label: 'Errado', value: '“Exclusivamente” um público', badge: 'warn' },
          { label: 'IST', value: 'HIV, sífilis, hepatites…', badge: 'info' },
        ],
        footer_rule: 'Universalidade na prevenção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRESERVATIVO',
        items: [
          {
            label: 'Marcar Certo',
            detail: 'Achar que restringe corretamente o público.',
            correct: 'Prevenção é ampla — afirmativa é falsa (Errado).',
          },
          {
            label: 'Estigma',
            detail: 'Associar IST só a um grupo.',
            correct: 'MS orienta proteção para qualquer relação de risco.',
          },
          {
            label: 'Transferência — só feminino',
            detail: 'Preservativo interno como única opção.',
            correct: 'Masculino também é para toda população — julgue Errado.',
          },
        ],
        footer_rule: 'Errado = restrição indevida',
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
    console.log(`[handcraft:promocao-g08] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g08] total=${ok}`);
}

main();
