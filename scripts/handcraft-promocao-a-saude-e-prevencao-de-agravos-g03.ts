#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g03 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g03
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g03';
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
    'princípios do SUS',
    'integralidade',
    'educação em saúde',
    'PICS',
    'prevenção de agravos',
    'níveis de prevenção',
    'vigilância em saúde',
  ],
};

const LEI_8080_SOURCE = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 8.080/1990 — Lei Orgânica da Saúde',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
  covers: ['princípios doutrinários', 'integralidade', 'universalidade', 'equidade'],
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
  sources?: (typeof LEI_8080_SOURCE | typeof MS_PROMOCAO_SOURCE)[];
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
    .replace(/\bmanejocomplementar\b/gi, 'manejo complementar')
    .replace(/\bmuitosusuários\b/gi, 'muitos usuários')
    .replace(/\bessequadro\b/gi, 'esse quadro')
    .replace(/\bconvencionaissem\b/gi, 'convencionais sem')
    .replace(/\breforçando aintegralidade\b/gi, 'reforçando a integralidade')
    .replace(/\bpreferênciasindividuais\b/gi, 'preferências individuais')
    .replace(/\bsendo necessárias\b/gi, 'sendo necessárias')
    .replace(/\bqual dasalternativas\b/gi, 'qual das alternativas')
    .replace(/\bmonitoramentoconstante\b/gi, 'monitoramento constante')
    .replace(/\bEducaçãoem\b/gi, 'Educação em')
    .replace(/\bdiretrizesda\b/gi, 'diretrizes da')
    .replace(/\bparticipaçãocoletiva\b/gi, 'participação coletiva')
    .replace(/\bequipe e oserviço\b/gi, 'equipe e o serviço')
    .replace(/\bpassar peloque\b/gi, 'passar pelo que')
    .replace(/\balgumasorientações\b/gi, 'algumas orientações')
    .replace(/\bhábitossaudáveis\b/gi, 'hábitos saudáveis')
    .replace(/\bimplementaçãode\b/gi, 'implementação de')
    .replace(/\bdeserviços de saúde\b/gi, 'de serviços de saúde')
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
  'funcepe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-3': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Níveis de prevenção Leavell & Clark — primária, secundária e terciária (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Níveis de prevenção — Leavell',
        meta: slideMeta,
        items: [
          { label: 'Primária', detail: 'Evitar adoecer — vacina, preservativo, educação em saúde.', icon: 'Shield' },
          { label: 'Secundária', detail: 'Detectar cedo — rastreamento, busca de contactantes, diagnóstico precoce.', icon: 'Search' },
          { label: 'Terciária', detail: 'Limitar sequelas — reabilitação, adesão ao tratamento, prevenir complicações.', icon: 'Heart' },
          { label: 'IST — contatos', detail: 'Rastrear parceiros após caso = achar infecção assintomática — secundária.', icon: 'Users' },
          { label: 'Pegadinha primária', detail: 'Confundir rastreamento de contactantes com “evitar exposição”.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Rastrear contatos de IST = prevenção secundária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar a conduta segundo os níveis de prevenção (Leavell).',
          'Cenário: rastreamento de contactantes de IST após caso confirmado.',
          'Primária evita exposição inicial — preservativo, orientação antes do contágio.',
          'Secundária detecta precocemente — busca ativa de infecção assintomática em contatos.',
          'Terciária reduz dano após doença instalada — não é o foco do rastreamento inicial.',
          'Rastrear contactantes = diagnóstico precoce em fase assintomática → secundária.',
          'Marcar letra B.',
          'Em similares: rastreamento, Papanicolau e busca de contactantes = secundária; vacina e saneamento = primária.',
        ],
        footer_rule: 'Secundária = detectar cedo, não evitar exposição',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LEAVELL — DECORE PROVA',
        rows: [
          { label: 'Primária', value: 'Evitar surgimento — vacina, preservativo, saneamento', badge: 'hot' },
          { label: 'Secundária', value: 'Diagnóstico precoce — rastreamento e contactantes IST', badge: 'hot' },
          { label: 'Terciária', value: 'Reduzir sequelas — reabilitação e controle de complicações', badge: 'ok' },
          { label: 'IST', value: 'Rastrear parceiros = secundária', badge: 'warn' },
        ],
        footer_rule: 'Não confundir rastreamento com prevenção primária',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÍVEIS LEAVELL',
        items: [
          {
            label: 'Letra A — reabilitação',
            detail: 'Recuperar de AVC ou IAM após dano instalado.',
            correct: 'Reabilitação é prevenção terciária — não secundária.',
          },
          {
            label: 'Letra C — diabetes',
            detail: 'Controlar glicemia e examinar pés em diabético.',
            correct: 'Conduta em doença já instalada — terciária/secundária de complicação, não rastreamento de contactantes.',
          },
          {
            label: 'Letra D — úlcera de decúbito',
            detail: 'Prevenir lesão por pressão em acamado.',
            correct: 'Prevenção de complicação em incapacitado — não é rastreamento de IST.',
          },
          {
            label: 'Letra E — vacinação',
            detail: 'Vacinas e aconselhamento de alto risco.',
            correct: 'Vacinação é prevenção primária — evita adoecer.',
          },
          {
            label: 'Transferência — vacina IST',
            detail: 'Em outra banca, vacinação pode parecer resposta para qualquer questão de IST.',
            correct: 'Vacina é primária; rastrear contactantes após caso é secundária.',
          },
        ],
        footer_rule: 'B = prevenção secundária (rastreamento de contatos)',
      },
    ],
  },

  'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Vigilância em Saúde — prevenir e controlar doenças (Lei 8.080 / MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vigilância em Saúde',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Conjunto de ações para prevenir e controlar doenças e agravos.', icon: 'Eye' },
          { label: 'Epidemiológica', detail: 'Monitorar doenças transmissíveis — notificação e investigação.', icon: 'Activity' },
          { label: 'Sanitária', detail: 'Riscos ambientais, alimentos, produtos e serviços de saúde.', icon: 'Shield' },
          { label: 'Saúde do trabalhador', detail: 'Agravos relacionados ao trabalho — ambiente laboral.', icon: 'HardHat' },
          { label: 'Pegadinha “só epidemia”', detail: 'Vigilância não se limita a surtos — é sistema amplo de controle.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Objetivo central: prevenir e controlar doenças',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conceito ou finalidade da vigilância em saúde.',
          'Eliminar A — foco só em epidemias: recorte indevido do sistema.',
          'Eliminar C — apenas notificação compulsória: é instrumento, não definição completa.',
          'Eliminar D — controle hospitalar exclusivo: vigilância é transversal à rede.',
          'Manter B — ações continuadas para prevenir e controlar doenças e agravos à saúde.',
          'Marcar letra B.',
          'Em similares: vigilância = prevenir + controlar; não confundir com assistência curativa isolada.',
        ],
        footer_rule: 'Vigilância é política pública — não só fichário',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VIGILÂNCIA EM SAÚDE',
        rows: [
          { label: 'Objetivo', value: 'Prevenir e controlar doenças e agravos', badge: 'hot' },
          { label: 'Epidemiológica', value: 'Doenças transmissíveis — vigilância ativa/passiva', badge: 'ok' },
          { label: 'Sanitária', value: 'Ambiente, alimentos, produtos e serviços', badge: 'ok' },
          { label: 'Pegadinha', value: 'Não é só surto nem só hospital', badge: 'warn' },
        ],
        footer_rule: 'Lei 8.080 — vigilância como função do SUS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIGILÂNCIA',
        items: [
          {
            label: 'Letra A — só epidemias',
            detail: 'Restringe vigilância a surtos e emergências.',
            correct: 'Vigilância cobre doenças endêmicas, crônicas e determinantes — não só epidemia.',
          },
          {
            label: 'Letra C — só notificação',
            detail: 'Reduz a vigilância ao registro de casos.',
            correct: 'Notificar é etapa — vigilância inclui análise, prevenção e controle.',
          },
          {
            label: 'Letra D — só hospital',
            detail: 'Limita ao ambiente hospitalar.',
            correct: 'Vigilância atua no território, trabalho e ambiente — transversal ao SUS.',
          },
          {
            label: 'Transferência — assistência',
            detail: 'Em outra banca, tratar o doente pode parecer “controle”.',
            correct: 'Vigilância previne e controla populações — assistência cura o indivíduo.',
          },
        ],
        footer_rule: 'B = prevenir e controlar doenças e agravos',
      },
    ],
  },

  'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'PICS na comunidade — educação dialogada e saberes tradicionais (PNPIC/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PICS e educação comunitária',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Comunidade resiste a práticas integrativas por desconhecimento.', icon: 'Users' },
          { label: 'Educação dialogada', detail: 'Associar saber tradicional à evidência — não impor conduta.', icon: 'MessageCircle' },
          { label: 'Interatividade', detail: 'Atividades educativas que envolvem participantes ativamente.', icon: 'Sparkles' },
          { label: 'Pegadinha uniforme', detail: 'Protocolo rígido sem escuta ignora autonomia e cultura local.', icon: 'Ban' },
          { label: 'Integralidade SUS', detail: 'PICS complementam cuidado — educação é via de adesão na APS.', icon: 'Layers' },
        ],
        footer_rule: 'Promover PICS = educar com diálogo na comunidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: resistência a PICS na comunidade por falta de conhecimento.',
          'Objetivo: promover adesão e uso seguro de práticas integrativas.',
          'Eliminar A — diretrizes uniformes sem adaptação ao contexto cultural.',
          'Eliminar C — restringir a grupos “selecionados” — reduz equidade na APS.',
          'Eliminar D — tornar PICS terapia preferencial única — medicaliza sem educar.',
          'Manter B — atividades educativas interativas ligando saberes tradicionais à ciência.',
          'Marcar letra B.',
          'Em similares: barreira de adesão a PICS → educação participativa, não norma imposta.',
        ],
        footer_rule: 'Educação em saúde = diálogo + evidência',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PICS NA COMUNIDADE',
        rows: [
          { label: 'Escuta', value: 'Compreender crenças e resistências locais', badge: 'hot' },
          { label: 'Diálogo', value: 'Saber tradicional + fundamentação científica', badge: 'hot' },
          { label: 'Formato', value: 'Atividades interativas com a comunidade', badge: 'ok' },
          { label: 'Evitar', value: 'Imposição, uniformidade ou seleção elitizada', badge: 'warn' },
        ],
        footer_rule: 'Adesão sustentável nasce da participação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PICS COMUNITÁRIAS',
        items: [
          {
            label: 'Letra A — diretrizes uniformes',
            detail: 'Prescreve uso padronizado sem escuta do contexto.',
            correct: 'Educação em saúde exige diálogo — não protocolo rígido imposto.',
          },
          {
            label: 'Letra C — grupos selecionados',
            detail: 'Restringe intervenção a públicos “prioritários” apenas.',
            correct: 'APS deve ampliar acesso — não segmentar indevidamente.',
          },
          {
            label: 'Letra D — terapia preferencial',
            detail: 'Enfatiza PICS como única via terapêutica.',
            correct: 'Objetivo é adesão via educação — não impor prática como padrão único.',
          },
          {
            label: 'Transferência — folheto',
            detail: 'Em outra prova, distribuir material pode parecer suficiente.',
            correct: 'Resistência cultural pede método educativo interativo e dialogado.',
          },
        ],
        footer_rule: 'B = educação interativa com saberes tradicionais',
      },
    ],
  },

  'aocp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-9': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saneamento básico e prevenção de doenças diarreicas (MS / Ottawa)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saneamento e diarreia',
        meta: slideMeta,
        items: [
          { label: 'Determinação social', detail: 'Concepção ampliada de saúde — saneamento como determinante.', icon: 'Home' },
          { label: 'Processo saúde-doença', detail: 'Água e esgoto moldam ocorrência e manutenção de agravos.', icon: 'Layers' },
          { label: 'Doenças diarreicas', detail: 'Principal agravo ligado à falta de saneamento básico.', icon: 'Droplet' },
          { label: 'Oferta de serviços', detail: 'Saneamento estrutural — prevenção primária coletiva.', icon: 'Shield' },
          { label: 'Pegadinha HAS/DM', detail: 'Hipertensão e diabetes não são o foco da relação saneamento–diarreia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Saneamento → prevenção de diarreia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: agravo principalmente determinado pela oferta de serviços de saneamento.',
          'Contexto: determinação social e relação saneamento–saúde.',
          'Água contaminada e esgoto inadequado favorecem transmissão fecal-oral.',
          'Eliminar B — doenças respiratórias: vínculo principal é outro (ar, TB, etc.).',
          'Eliminar C — hipertensão: DCNT multifatorial — não é agravo clássico de saneamento.',
          'Eliminar D — diabetes e E — obesidade: mesmo raciocínio.',
          'Manter A — doenças diarreicas.',
          'Marcar letra A.',
          'Em similares: saneamento básico → diarreia; educação complementa, não substitui.',
        ],
        footer_rule: 'MS: água + esgoto são pilares da prevenção',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DIARREIA — PREVENÇÃO COLETIVA',
        rows: [
          { label: 'Estrutural', value: 'Água tratada e esgotamento sanitário', badge: 'hot' },
          { label: 'Ambiental', value: 'Higiene do domicílio e manipulação de alimentos', badge: 'ok' },
          { label: 'Educação', value: 'Orientação comunitária — complementar', badge: 'info' },
          { label: 'Pegadinha', value: '“Só palestra” ou só remédio profilático', badge: 'warn' },
        ],
        footer_rule: 'Determinantes estruturais vêm antes do comportamento isolado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANEAMENTO E DIARREIA',
        items: [
          {
            label: 'Letra B — respiratórias',
            detail: 'Doenças respiratórias não são o agravo clássico de saneamento.',
            correct: 'Transmissão fecal-oral liga saneamento às diarreias — não às vias aéreas.',
          },
          {
            label: 'Letra C — hipertensão',
            detail: 'HAS é DCNT multifatorial.',
            correct: 'Saneamento não é determinante principal de hipertensão arterial.',
          },
          {
            label: 'Letra D — diabetes',
            detail: 'Diabetes mellitus — fatores metabólicos e estilo de vida.',
            correct: 'Não é o agravo tipicamente associado à falta de esgoto.',
          },
          {
            label: 'Letra E — obesidade',
            detail: 'Obesidade — desequilíbrio energético.',
            correct: 'Relação direta com saneamento é com diarreia, não obesidade.',
          },
          {
            label: 'Transferência — TRO',
            detail: 'Em outra banca, priorizar soro oral no tratamento agudo.',
            correct: 'A questão é qual agravo o saneamento previne — diarreia.',
          },
        ],
        footer_rule: 'A = doenças diarreicas',
      },
    ],
  },

  'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'ACS — orientação sobre vacinação e adesão ao calendário (PNI/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ACS — ação educativa',
        meta: slideMeta,
        items: [
          { label: 'Educação em saúde', detail: 'Atividade central do ACS no território — extrema importância na ESF.', icon: 'GraduationCap' },
          { label: 'Ação educativa', detail: 'Orientar, esclarecer e mobilizar — sem atos técnicos privativos.', icon: 'Users' },
          { label: 'Vacinação', detail: 'Orientar sobre importância e campanhas — prevenção primária.', icon: 'Syringe' },
          { label: 'Competência', detail: 'ACS não ministra curso técnico, diagnostica, prescreve ou monitora fármacos.', icon: 'Shield' },
          { label: 'Pegadinha técnica', detail: 'Confundir educação em saúde com função de enfermeiro/médico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'ACS educa e orienta — não substitui equipe clínica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ação educativa que o ACS pode realizar.',
          'Contexto: educação em saúde é atividade de extrema importância do ACS.',
          'Eliminar A — ministrar cursos técnicos de enfermagem: formação profissional, não papel do ACS.',
          'Eliminar C — fornecer diagnósticos médicos precisos: ato privativo médico.',
          'Eliminar D — prescrever dietas específicas: conduta de nutricionista/médico.',
          'Eliminar E — monitorar consumo de medicamentos: acompanhamento clínico, não educação vacinal.',
          'Manter B — orientar sobre importância da vacinação e datas das campanhas.',
          'Marcar letra B.',
          'Em similares: ACS educa sobre vacinação — não aplica vacina nem prescreve.',
        ],
        footer_rule: 'Orientar ≠ vacinar — papel distinto na ESF',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACS × VACINAÇÃO',
        rows: [
          { label: 'Orientar', value: 'Esclarecer calendário, doses e benefícios', badge: 'hot' },
          { label: 'Articular', value: 'Encaminhar à UBS e registrar atrasos', badge: 'ok' },
          { label: 'Não faz', value: 'Aplicar vacina ou prescrever esquema', badge: 'warn' },
          { label: 'Prevenção', value: 'Vacinação = primária — ACS é educador', badge: 'info' },
        ],
        footer_rule: 'Educação em saúde na visita domiciliar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACS E VACINA',
        items: [
          {
            label: 'Letra A — curso técnico',
            detail: 'Ministrar cursos técnicos de enfermagem.',
            correct: 'Formação profissional não é competência do ACS — é educação em saúde, não ensino técnico.',
          },
          {
            label: 'Letra C — diagnóstico',
            detail: 'Fornecer diagnósticos médicos precisos para doenças graves.',
            correct: 'Diagnóstico é ato médico — ACS orienta e encaminha, não diagnostica.',
          },
          {
            label: 'Letra D — prescrever dieta',
            detail: 'Prescrever dietas específicas para tratamento de doenças.',
            correct: 'Prescrição dietética é de nutricionista/médico — fora do papel educativo do ACS.',
          },
          {
            label: 'Letra E — medicamentos',
            detail: 'Monitorar o consumo de medicamentos.',
            correct: 'Monitoramento farmacológico é conduta clínica — não é ação educativa típica do ACS.',
          },
          {
            label: 'Transferência — aplicar vacina',
            detail: 'Em outra banca, aplicar vacina no domicílio pode parecer ação do ACS.',
            correct: 'ACS orienta sobre vacinação — aplicação é da equipe de saúde na UBS.',
          },
        ],
        footer_rule: 'B = orientar famílias sobre vacinação',
      },
    ],
  },

  'educa-pb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde do ACS — visita domiciliar e ações em grupo (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Medidas educativas na comunidade',
        meta: slideMeta,
        items: [
          { label: 'Medidas educativas', detail: 'Compartilhar conhecimento na comunidade — rotina dos profissionais.', icon: 'Users' },
          { label: 'Qualidade de vida', detail: 'Ações educativas contribuem beneficamente para a sociedade.', icon: 'Heart' },
          { label: 'Visita domiciliar', detail: 'Início das ações educativas no território — porta de entrada.', icon: 'Home' },
          { label: 'Educação em grupo', detail: 'Realizada em serviços de saúde e espaços sociais da comunidade.', icon: 'MessageCircle' },
          { label: 'Pegadinha “só individual”', detail: 'Negar grupo ou divulgação limita prática educativa do ACS.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Visita domiciliar + grupo + espaços comunitários',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: medidas educativas na comunidade — assinale a CORRETA.',
          'Contexto: compartilhar conhecimento melhora qualidade de vida da sociedade.',
          'Manter A — ações começam na visita domiciliar e podem ser em grupo, nos serviços e espaços sociais.',
          'Eliminar B — trabalho em grupo não reforça educação: falso — grupo potencializa aprendizagem.',
          'Eliminar C — cartazes e divulgação não fazem parte: falso — comunicação é etapa do processo.',
          'Eliminar D — dinâmicas de integração não são importantes: falso — quebra formalidade e integra.',
          'Eliminar E — identificar crenças e valores não é necessário: falso — educação parte do saber do grupo.',
          'Marcar letra A.',
          'Em similares: CORRETA combina visita, grupo e diversos espaços comunitários.',
        ],
        footer_rule: 'Educação do ACS é territorial e participativa',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO DO ACS',
        rows: [
          { label: 'Onde', value: 'Domicílio e espaços coletivos do território', badge: 'hot' },
          { label: 'Como', value: 'Diálogo — saber popular + técnico', badge: 'hot' },
          { label: 'Formato', value: 'Individual e em grupo — complementares', badge: 'ok' },
          { label: 'Erro', value: '“Só consultório” ou “só individual”', badge: 'warn' },
        ],
        footer_rule: 'Visita + grupo = prática educativa integral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MEDIDAS EDUCATIVAS',
        items: [
          {
            label: 'Letra B — grupo não reforça',
            detail: 'O trabalho em grupo não reforça a ação educativa aos indivíduos.',
            correct: 'Educação em grupo reforça e complementa a ação individual — é prática correta.',
          },
          {
            label: 'Letra C — cartazes excluídos',
            detail: 'Cartazes criativos e divulgação nos locais frequentados não fazem parte do processo.',
            correct: 'Comunicação e divulgação são etapas legítimas da educação em saúde comunitária.',
          },
          {
            label: 'Letra D — dinâmica irrelevante',
            detail: 'Dinâmicas de apresentação e integração do grupo não são importantes.',
            correct: 'Quebrar formalidade inicial facilita participação — dinâmica é ferramenta educativa.',
          },
          {
            label: 'Letra E — ignorar crenças',
            detail: 'Identificar crenças, valores, mitos e tabus não é necessário — só informar.',
            correct: 'Educação em saúde parte do saber do grupo — reflexão sobre crenças é essencial.',
          },
          {
            label: 'Transferência — só consultório',
            detail: 'Em outra banca, restringir educação à unidade pode parecer correto.',
            correct: 'Medidas educativas ocorrem no domicílio, na UBS e nos espaços sociais.',
          },
        ],
        footer_rule: 'A = visita domiciliar + ações em grupo',
      },
    ],
  },

  'agirh-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-0': {
    family: 'conceito',
    branch: 'promocao_generico',
    guideline: 'Atividade física regular — benefícios à saúde (MS / PNPS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Benefícios da prática corporal',
        meta: slideMeta,
        items: [
          { label: 'Benefícios amplos', detail: 'Biológicos, psicológicos e sociais — atividade física e prática corporal.', icon: 'Activity' },
          { label: 'Funcionamento corporal', detail: 'Melhora desempenho e reduz perdas funcionais com o envelhecimento.', icon: 'Heart' },
          { label: 'Independência', detail: 'Preserva autonomia para atividades da vida diária.', icon: 'User' },
          { label: 'Pegadinha inversão', detail: 'Distratores negam flexibilidade, força muscular ou protegem o coração.', icon: 'AlertTriangle' },
          { label: 'Promoção à saúde', detail: 'Prática corporal regular é eixo de prevenção de agravos.', icon: 'Shield' },
        ],
        footer_rule: 'Atividade física melhora funcionamento e independência',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: benefícios biológicos, psicológicos e sociais de atividades físicas e prática corporal.',
          'Manter A — melhor funcionamento corporal, menos perdas funcionais e preservação da independência.',
          'Eliminar B — aumento do risco de morte por doenças cardiovasculares: inverte efeito protetor.',
          'Eliminar C — redução na flexibilidade das articulações: exercício regular melhora mobilidade.',
          'Eliminar D — redução da resistência muscular: atividade fortalece músculos.',
          'Marcar letra A.',
          'Em similares: benefícios incluem funcionamento, autonomia e proteção cardiovascular.',
        ],
        footer_rule: 'MS recomenda movimento regular em todas as idades',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'BENEFÍCIOS — ATIVIDADE FÍSICA',
        rows: [
          { label: 'Funcionamento', value: 'Menos perdas funcionais — mais autonomia', badge: 'hot' },
          { label: 'Independência', value: 'Preserva atividades da vida diária', badge: 'hot' },
          { label: 'Cardiovascular', value: 'Reduz risco — não aumenta mortalidade', badge: 'ok' },
          { label: 'Musculoesquelético', value: 'Flexibilidade e força muscular melhoram', badge: 'info' },
        ],
        footer_rule: 'Prática corporal regular = promoção à saúde',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ATIVIDADE FÍSICA',
        items: [
          {
            label: 'Letra B — risco cardiovascular',
            detail: 'Inverte efeito protetor do exercício regular.',
            correct: 'Atividade física moderada reduz risco cardiovascular — não aumenta.',
          },
          {
            label: 'Letra C — flexibilidade',
            detail: 'Redução na flexibilidade das juntas e articulações.',
            correct: 'Exercício regular melhora mobilidade articular — não reduz flexibilidade.',
          },
          {
            label: 'Letra D — resistência muscular',
            detail: 'Redução da resistência dos músculos.',
            correct: 'Atividade física fortalece musculatura — efeito é oposto ao afirmado.',
          },
          {
            label: 'Transferência — atleta elite',
            detail: 'Em outra banca, exigir treino intenso pode parecer necessário.',
            correct: 'Promoção cobra atividade regular moderada — não performance esportiva.',
          },
        ],
        footer_rule: 'A = benefícios amplos à saúde',
      },
    ],
  },

  'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-5': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Níveis de prevenção — quaternária incluída em provas avançadas (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Níveis de prevenção — INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assinale a alternativa INCORRETA sobre níveis de prevenção.', icon: 'AlertTriangle' },
          { label: 'Primária', detail: 'Evitar adoecer — vacina, saneamento, educação.', icon: 'Shield' },
          { label: 'Secundária', detail: 'Diagnóstico precoce — rastreamento.', icon: 'Search' },
          { label: 'Terciária', detail: 'Reduzir sequelas — reabilitação.', icon: 'Heart' },
          { label: 'Quaternária', detail: 'Evitar iatrogenia e intervenções desnecessárias — existe em provas.', icon: 'Ban' },
        ],
        footer_rule: 'Quaternária: proteger de excesso de medicalização',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa INCORRETA sobre níveis de prevenção.',
          'A: prevenção primária evita surgimento da doença — correta.',
          'B: secundária busca diagnóstico precoce — correta.',
          'C: terciária limita incapacidades e sequelas — correta.',
          'D: “não existe prevenção quaternária” — INCORRETA.',
          'Quaternária (Jamoulle) evita danos de intervenções excessivas — conceito válido.',
          'Marcar letra D.',
          'Em similares: em INCORRETA de níveis, desconfie de quem nega a quaternária.',
        ],
        footer_rule: 'Quaternária existe — negação é a armadilha',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÍVEIS + QUATERNÁRIA',
        rows: [
          { label: 'Primária', value: 'Evitar adoecer', badge: 'hot' },
          { label: 'Secundária', value: 'Detectar cedo', badge: 'hot' },
          { label: 'Terciária', value: 'Limitar sequelas', badge: 'ok' },
          { label: 'Quaternária', value: 'Evitar iatrogenia e overtreatment', badge: 'warn' },
        ],
        footer_rule: 'Negar quaternária = distrator clássico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA NÍVEIS',
        items: [
          {
            label: 'Letra A — primária',
            detail: 'Definição correta de prevenção primária.',
            correct: 'Evitar surgimento do agravo — vacina, saneamento, hábitos saudáveis.',
          },
          {
            label: 'Letra B — secundária',
            detail: 'Rastreamento e diagnóstico precoce.',
            correct: 'Secundária detecta doença em fase assintomática — conduta correta.',
          },
          {
            label: 'Letra C — terciária',
            detail: 'Reabilitação e redução de incapacidade.',
            correct: 'Terciária atua após doença instalada — limitar sequelas.',
          },
          {
            label: 'Letra D — nega quaternária',
            detail: 'Única incorreta — afirma inexistência do nível.',
            correct: 'Quaternária existe — protege de intervenções desnecessárias e iatrogenia.',
          },
          {
            label: 'Transferência — só Leavell',
            detail: 'Em outra banca, achar que só existem três níveis clássicos.',
            correct: 'Provas atuais incluem quaternária — negá-la é erro.',
          },
        ],
        footer_rule: 'D = INCORRETA (nega quaternária)',
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
    console.log(`[handcraft:promocao-g03] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g03] total=${ok}`);
}

main();
