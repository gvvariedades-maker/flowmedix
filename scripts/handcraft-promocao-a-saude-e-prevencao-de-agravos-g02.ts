#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g02 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g02
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g02';
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
    'PNH comunicação',
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
  'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-4': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'PICS na rede SUS — integralidade e prevenção (PNPIC/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PICS na saúde coletiva',
        meta: slideMeta,
        items: [
          { label: 'I — prevenção', detail: 'PICS podem reduzir agravos e complementar crônicos — alivia emergência.', icon: 'Shield' },
          { label: 'II — SAMU', detail: 'FALSO: excluir PICS do pré-hospitalar nega integralidade.', icon: 'XCircle' },
          { label: 'III — APS', detail: 'PICS na AB ampliam acesso a terapias validadas.', icon: 'CheckCircle' },
          { label: 'IV — uniformidade', detail: 'FALSO: aplicar a todos sem critério clínico viola individualização.', icon: 'XCircle' },
          { label: 'Integralidade', detail: 'Princípio do SUS — cuidado ampliado, não só biomedicina convencional.', icon: 'Layers' },
        ],
        footer_rule: 'Corretas: I e III — prevenção na rede + APS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar I–IV sobre PICS na saúde coletiva.',
          'I: prevenção de agravos e manejo complementar de crônicos → reduz sobrecarga da emergência — Verdadeira.',
          'II: PICS “irrelevantes” no SAMU e só protocolo biomédico → nega abordagem integrativa — Falsa.',
          'III: PICS na atenção primária ampliam acesso seguro → reforça integralidade — Verdadeira.',
          'IV: aplicar PICS uniformemente a todos, sem critério clínico → falsa — exige avaliação individual.',
          'Combinação correta: I e III apenas.',
          'Marcar letra A.',
          'Em similares: integralidade favorece PICS na APS; exclusão absoluta ou uniformidade cega = distrator.',
        ],
        footer_rule: 'PICS complementam — não substituem nem se impõem a todos',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PICS NO SUS',
        rows: [
          { label: 'Prevenção', value: 'Reduz agravos e uso desnecessário da emergência', badge: 'hot' },
          { label: 'APS', value: 'Porta de entrada — amplia terapias seguras', badge: 'ok' },
          { label: 'Individualização', value: 'Não aplicar a todos sem critério clínico', badge: 'warn' },
          { label: 'Pegadinha', value: '“Só biomedicina” no SAMU — errado', badge: 'info' },
        ],
        footer_rule: 'Integralidade ≠ exclusivismo biomédico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PICS I–IV',
        items: [
          {
            label: 'Letra B — II e IV',
            detail: 'Inclui itens falsos (II exclui PICS; IV uniformiza).',
            correct: 'II e IV estão incorretos — gabarito não pode incluí-los.',
          },
          {
            label: 'Letra C — I, II e III',
            detail: 'Inclui II falsa sobre SAMU.',
            correct: 'II nega abordagem complementar no pré-hospitalar.',
          },
          {
            label: 'Letra D — II, III e IV',
            detail: 'Mantém II e IV errados.',
            correct: 'Só I e III resistem à leitura crítica.',
          },
          {
            label: 'Transferência — só hospital',
            detail: 'Em outra banca, focar só na emergência hospitalar.',
            correct: 'PICS atuam na prevenção na rede — integralidade não se limita ao hospital.',
          },
        ],
        footer_rule: 'I + III = prevenção na rede + APS integrativa',
      },
    ],
  },

  'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-2': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde na APS — diálogo e saberes populares (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adesão à fitoterapia na AB',
        meta: slideMeta,
        items: [
          { label: 'Problema', detail: 'Usuários resistem por desconhecer benefícios da fitoterapia.', icon: 'AlertCircle' },
          { label: 'Educação dialogada', detail: 'Associar saber popular à evidência — não impor receita única.', icon: 'Users' },
          { label: 'Interatividade', detail: 'Atividades educativas que envolvem a comunidade.', icon: 'MessageCircle' },
          { label: 'Pegadinha “preferencial”', detail: 'Tornar fitoterapia única estratégia ou só grupos selecionados limita equidade.', icon: 'Ban' },
          { label: 'Prevenção de DCNT', detail: 'Projeto na APS visa agravos crônicos — educação é meio, não decreto.', icon: 'Heart' },
        ],
        footer_rule: 'Promover adesão = educar com diálogo — não impor',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: resistência à fitoterapia por desconhecimento dos benefícios.',
          'Objetivo: reverter quadro e promover adesão na prevenção de crônicas.',
          'Eliminar A — diretrizes uniformes rígidas sem escuta.',
          'Eliminar B — focar só em grupos selecionados — reduz equidade.',
          'Eliminar D — fitoterapia como “preferencial” única — medicaliza sem educação.',
          'Manter C — atividades educativas interativas ligando conhecimento popular à ciência.',
          'Marcar letra C.',
          'Em similares: barreira de adesão → educação participativa, não norma imposta.',
        ],
        footer_rule: 'Educação em saúde = diálogo + evidência',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO PARA ADESÃO',
        rows: [
          { label: 'Escuta', value: 'Compreender resistência e crenças', badge: 'hot' },
          { label: 'Diálogo', value: 'Saber popular + fundamentação científica', badge: 'hot' },
          { label: 'Formato', value: 'Atividades interativas na comunidade', badge: 'ok' },
          { label: 'Evitar', value: 'Imposição ou seleção elitizada de grupos', badge: 'warn' },
        ],
        footer_rule: 'Adesão sustentável nasce da participação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FITOTERAPIA NA APS',
        items: [
          {
            label: 'Letra A — diretrizes uniformes',
            detail: 'Prescreve uso padronizado sem adaptação ao contexto.',
            correct: 'Educação em saúde exige escuta — não só protocolo rígido.',
          },
          {
            label: 'Letra B — grupos selecionados',
            detail: 'Restringe intervenção a “prioritários” apenas.',
            correct: 'APS deve ampliar acesso — não segmentar indevidamente.',
          },
          {
            label: 'Letra D — terapia preferencial',
            detail: 'Enfatiza fitoterapia como única via terapêutica.',
            correct: 'Objetivo é adesão via educação — não impor terapia como padrão único.',
          },
          {
            label: 'Transferência — só receita',
            detail: 'Em outra prova, entregar folheto pode parecer suficiente.',
            correct: 'Resistência pede método educativo interativo e dialogado.',
          },
        ],
        footer_rule: 'C = educação participativa na comunidade',
      },
    ],
  },

  'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-6': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde — métodos participativos e contínuos (MS/Ottawa)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Métodos de educação em saúde',
        meta: slideMeta,
        items: [
          { label: 'Panfletos', detail: 'Informativo passivo — baixa mudança comportamental isolada.', icon: 'FileText' },
          { label: 'Palestra esporádica', detail: 'Evento pontual — não sustenta hábito.', icon: 'Mic' },
          { label: 'Mídia massiva', detail: 'Alcance amplo, pouca interação e suporte.', icon: 'Radio' },
          { label: 'Programa contínuo', detail: 'Interativo + participação + suporte à mudança — mais eficaz.', icon: 'Users' },
          { label: 'Ottawa', detail: 'Promoção capacita comunidade — processo, não campanha única.', icon: 'Sparkles' },
        ],
        footer_rule: 'Mudança de hábito = processo educativo contínuo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: método mais eficaz para mudança comportamental na comunidade.',
          'Eliminar A — panfletos: comunicação unidirecional.',
          'Eliminar B — palestras esporádicas: sem continuidade.',
          'Eliminar C — mídia massiva: pouco envolvimento ativo.',
          'Manter D — programas educativos contínuos, interativos e com suporte.',
          'Marcar letra D.',
          'Em similares: “contínuo + interativo + participação” vence ação pontual ou só mídia.',
        ],
        footer_rule: 'Eficácia = tempo + diálogo + suporte prático',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIERARQUIA DE MÉTODOS',
        rows: [
          { label: 'Menos eficaz isolado', value: 'Panfleto · palestra única · só TV/rádio', badge: 'info' },
          { label: 'Mais eficaz', value: 'Programa contínuo e interativo na comunidade', badge: 'hot' },
          { label: 'Suporte', value: 'Acompanhar implementação de novos hábitos', badge: 'ok' },
          { label: 'Princípio', value: 'Participação ativa — não só receber informação', badge: 'warn' },
        ],
        footer_rule: 'Educação em saúde é processo — não evento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MÉTODO EDUCATIVO',
        items: [
          {
            label: 'Letra A — panfletos',
            detail: 'Distribuição passiva de material.',
            correct: 'Informar não garante mudança de comportamento.',
          },
          {
            label: 'Letra B — palestras esporádicas',
            detail: 'Ação pontual em escola ou CRAS.',
            correct: 'Hábito exige continuidade e reforço.',
          },
          {
            label: 'Letra C — mídia massiva',
            detail: 'Campanha ampla sem vínculo com a comunidade.',
            correct: 'Alcance ≠ adesão sustentada.',
          },
          {
            label: 'Marcar o “mais fácil”',
            detail: 'Instinto de escolher ação de baixo custo logístico.',
            correct: 'Prova cobra método participativo e continuado — letra D.',
          },
          {
            label: 'Transferência — campanha de TV',
            detail: 'Em outra banca, mídia massiva pode parecer eficaz pelo alcance.',
            correct: 'Mudança comportamental exige vínculo contínuo com a comunidade — não só anúncio.',
          },
        ],
        footer_rule: 'D = contínuo + interativo + suporte',
      },
    ],
  },

  'facet-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-6': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção de úlcera por pressão — mudança de decúbito e suporte (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção de LPP',
        meta: slideMeta,
        items: [
          { label: 'Prevenção secundária', detail: 'Paciente acamado — evitar lesão por pressão antes da ferida.', icon: 'Shield' },
          { label: 'Mudança de decúbito', detail: 'Reposicionamento regular — pilar da prevenção.', icon: 'RotateCcw' },
          { label: 'Superfície de apoio', detail: 'Redistribuição de pressão (colchão/espuma).', icon: 'Bed' },
          { label: 'Pele e nutrição', detail: 'Hidratação cutânea e estado nutricional.', icon: 'Droplet' },
          { label: 'Pegadinha imobilizar', detail: 'Manter imóvel ou secar demais a pele piora o risco.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pacote completo: decúbito + superfície + pele + nutrição',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: abordagem mais completa para prevenir úlcera de pressão.',
          'Eliminar A — posição estável longa: aumenta pressão contínua.',
          'Eliminar C — contenção para evitar movimento: contraproducente.',
          'Eliminar D — secar pele com dessecantes: prejudica barreira cutânea.',
          'Eliminar E — tópicos profiláticos rotineiros em todas as áreas: não é conduta padrão universal.',
          'Manter B — mudanças de decúbito + superfície + hidratação + nutrição.',
          'Marcar letra B.',
          'Em similares: prevenção de LPP = reposicionar + redistribuir pressão + cuidado com pele.',
        ],
        footer_rule: 'Mobilidade assistida — não imobilização',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PACOTE ANTI-LPP',
        rows: [
          { label: 'Reposicionar', value: 'Mudança de decúbito em intervalos regulares', badge: 'hot' },
          { label: 'Superfície', value: 'Dispositivo de redistribuição de pressão', badge: 'hot' },
          { label: 'Pele', value: 'Monitorar hidratação — evitar excesso de umidade/secura', badge: 'ok' },
          { label: 'Nutrição', value: 'Estado nutricional adequado', badge: 'ok' },
        ],
        footer_rule: 'Prevenção multifatorial — não um truque isolado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÚLCERA DE PRESSÃO',
        items: [
          {
            label: 'Letra A — imobilizar',
            detail: 'Minimizar movimentos para “preservar pele”.',
            correct: 'Pressão contínua na mesma área causa LPP — é preciso reposicionar.',
          },
          {
            label: 'Letra C — contenção',
            detail: 'Evitar movimento com dispositivos restritivos.',
            correct: 'Contenção não é estratégia de prevenção de LPP.',
          },
          {
            label: 'Letra D — secar a pele',
            detail: 'Dessecantes e evitar hidratantes.',
            correct: 'Pele ressecada ou macerada aumenta risco — cuidado balanceado.',
          },
          {
            label: 'Letra E — tópico rotineiro',
            detail: 'Medicamento profilático em todas as proeminências.',
            correct: 'Não há rotina universal de fármaco tópico para prevenir LPP.',
          },
          {
            label: 'Transferência — curativo oclusivo',
            detail: 'Em outra banca, priorizar só curativo sem reposicionar.',
            correct: 'Prevenção de LPP exige mudança de decúbito — dispositivo isolado não basta.',
          },
        ],
        footer_rule: 'B = decúbito + superfície + pele + nutrição',
      },
    ],
  },

  'copese-ufpi-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-3': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde do ACS — grupo, participação e diálogo (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Educação do ACS na comunidade',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assinale a INCORRETA sobre educação em saúde.', icon: 'AlertTriangle' },
          { label: 'Visita e grupo', detail: 'Ações começam no domicílio, mas podem ser em grupo — equipe compartilhada.', icon: 'Home' },
          { label: 'Saberes locais', detail: 'Valorizar experiência dos participantes no diálogo.', icon: 'Users' },
          { label: 'Competências', detail: 'Técnica + comunicação + conhecer o grupo.', icon: 'GraduationCap' },
          { label: 'Participação', detail: 'Envolver no planejar, executar e avaliar — pegadinha é o “só individual”.', icon: 'MessageCircle' },
        ],
        footer_rule: 'Educação comunitária privilegia grupo e participação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: opção INCORRETA sobre educação em saúde do ACS.',
          'A: visita domiciliar e ações em grupo — conduta correta.',
          'B: considerar conhecimento dos participantes — correto.',
          'C: técnica + comunicação + perfil do grupo — correto.',
          'D: participação no planejar, executar e avaliar — correto.',
          'E: preferir sempre educação individual por privacidade — INCORRETA.',
          'Educação em saúde na ESF é, em grande parte, coletiva e participativa.',
          'Marcar letra E.',
          'Em similares: em INCORRETA do ACS, desconfie de “só individual” — educação coletiva é regra.',
        ],
        footer_rule: 'ACS educa no território — muitas vezes em grupo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO DO ACS',
        rows: [
          { label: 'Onde', value: 'Domicílio e espaços coletivos', badge: 'ok' },
          { label: 'Como', value: 'Diálogo — saber popular + técnico', badge: 'hot' },
          { label: 'Quem participa', value: 'Planejamento e avaliação com a comunidade', badge: 'hot' },
          { label: 'Erro clássico', value: '“Só individual” — limita educação coletiva', badge: 'warn' },
        ],
        footer_rule: 'Privacidade ≠ abolir educação em grupo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA ACS',
        items: [
          {
            label: 'Letra A — visita e grupo',
            detail: 'Conduta correta do ACS no território.',
            correct: 'Ações podem e devem ocorrer em grupo, não só na casa.',
          },
          {
            label: 'Letra B — saberes locais',
            detail: 'Respeito ao conhecimento da comunidade.',
            correct: 'Educação dialogada exige escuta — não é monólogo técnico.',
          },
          {
            label: 'Letra C — competências',
            detail: 'Técnica aliada à comunicação.',
            correct: 'Conhecer o grupo é requisito para educação efetiva.',
          },
          {
            label: 'Letra D — participação',
            detail: 'Planejar, executar e avaliar com os participantes.',
            correct: 'Educação participativa — princípio da atenção básica.',
          },
          {
            label: 'Letra E — só individual',
            detail: 'Única alternativa incorreta — foco da questão.',
            correct: 'Preferir sempre individual contraria prática educativa coletiva do ACS.',
          },
          {
            label: 'Transferência — palestra única',
            detail: 'Em outra banca, achar que visita domiciliar dispensa grupo.',
            correct: 'ACS articula ações individuais e coletivas no território.',
          },
        ],
        footer_rule: 'EXCETO: A–D certas · E = armadilha',
      },
    ],
  },

  'educa-pb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-3': {
    family: 'conceito',
    branch: 'promocao_principios_direitos',
    guideline: 'Princípios do SUS — Lei 8.080/1990 (integralidade, universalidade, equidade)',
    sources: [LEI_8080_SOURCE, MS_PROMOCAO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Princípios do SUS',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Conselho Municipal de Saúde — explicar princípios de acesso.', icon: 'Landmark' },
          { label: 'Universalidade', detail: 'Atendimento a todos — não só contribuintes nem só emergência.', icon: 'Globe' },
          { label: 'Integralidade', detail: 'Prevenção, promoção, tratamento e reabilitação.', icon: 'Layers' },
          { label: 'Equidade', detail: 'Tratar desigualmente os desiguais — não “tudo igual”.', icon: 'Scale' },
          { label: 'Controle social', detail: 'Participação da comunidade — não exclusividade do governo.', icon: 'Users' },
        ],
        footer_rule: 'Cada distrator distorce um princípio real',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre princípio básico do SUS.',
          'Eliminar A — só quem contribui: nega universalidade.',
          'Eliminar B — universal mas só emergência: distorce acesso integral.',
          'Eliminar C — controle social só governo: nega participação (8.142).',
          'Eliminar D — equidade como “mesmo atendimento para todos”: confunde com isonomia.',
          'Manter E — integralidade inclui prevenção, promoção, tratamento e reabilitação.',
          'Marcar letra E.',
          'Em similares: integralidade = amplitude do cuidado; equidade ≠ tratamento idêntico.',
        ],
        footer_rule: 'Lei 8.080 — princípios doutrinários e organizativos',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRINCÍPIOS — DECORE PROVA',
        rows: [
          { label: 'Universalidade', value: 'Saúde para todos — sem vínculo previdenciário', badge: 'hot' },
          { label: 'Integralidade', value: 'Prevenção · promoção · tratamento · reabilitação', badge: 'hot' },
          { label: 'Equidade', value: 'Investir mais onde a necessidade é maior', badge: 'warn' },
          { label: 'Controle social', value: 'Conselhos e conferências — comunidade participa', badge: 'ok' },
        ],
        footer_rule: 'Não confundir equidade com “tratar todos igual”',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRINCÍPIOS SUS',
        items: [
          {
            label: 'Letra A — só contribuinte',
            detail: 'Vincula acesso à previdência.',
            correct: 'Universalidade: direito de todos, financiamento solidário.',
          },
          {
            label: 'Letra B — só emergência',
            detail: 'Recorta o cuidado ao urgente.',
            correct: 'SUS cobre promoção e prevenção — não só urgência.',
          },
          {
            label: 'Letra C — governo exclusivo',
            detail: 'Elimina controle social.',
            correct: 'Participação da comunidade é princípio organizativo.',
          },
          {
            label: 'Letra D — equidade = igualdade',
            detail: '“Mesmo atendimento independente da necessidade”.',
            correct: 'Equidade corrige desigualdades — oferta diferenciada quando necessário.',
          },
          {
            label: 'Transferência — Art. 4º',
            detail: 'Em outra banca, confundir princípio com composição do SUS.',
            correct: 'Integralidade é princípio doutrinário — não é rol do Art. 4º.',
          },
        ],
        footer_rule: 'E = integralidade na redação canônica',
      },
    ],
  },

  'agirh-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-1': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'PNH — comunicação e humanização (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Comunicação e humanização',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativa INCORRETA sobre comunicação na atenção à saúde.', icon: 'AlertTriangle' },
          { label: 'PNH', detail: 'Vínculo, redes de cooperação e participação na gestão.', icon: 'Heart' },
          { label: 'Segurança', detail: 'Comunicação clara reduz risco e melhora continuidade.', icon: 'Shield' },
          { label: 'Relação terapêutica', detail: 'Comunicação base do plano de cuidado compartilhado.', icon: 'Users' },
          { label: 'Empatia', detail: 'Aproxima do outro — facilita sintonia, não dificulta.', icon: 'Sparkles' },
        ],
        footer_rule: 'Empatia facilita cuidado centrado na pessoa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: INCORRETO sobre comunicação nos serviços de saúde.',
          'A: comunicação na humanização (PNH) — correto.',
          'B: comunicação e segurança do paciente — correto.',
          'C: comunicação no vínculo e plano terapêutico — correto.',
          'D: empatia “dificulta” sintonia com necessidades — INCORRETO.',
          'Empatia é capacidade de compreender o outro — apoia acolhimento.',
          'Marcar letra D.',
          'Em similares: em INCORRETA sobre comunicação, a opção que nega empatia costuma ser a armadilha.',
        ],
        footer_rule: 'Comunicação empática = ponte, não barreira',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMUNICAÇÃO NA APS',
        rows: [
          { label: 'Humanização', value: 'Vínculo e participação — PNH', badge: 'hot' },
          { label: 'Segurança', value: 'Informação clara evita falhas no cuidado', badge: 'ok' },
          { label: 'Empatia', value: 'Compreender o outro — facilita adesão', badge: 'hot' },
          { label: 'Erro', value: 'Dizer que empatia atrapalha', badge: 'warn' },
        ],
        footer_rule: 'Relação terapêutica exige escuta empática',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA COMUNICAÇÃO',
        items: [
          {
            label: 'Letra A — PNH',
            detail: 'Comunicação na humanização e gestão participativa.',
            correct: 'Alinhada à Política Nacional de Humanização.',
          },
          {
            label: 'Letra B — segurança',
            detail: 'Comunicação clara protege o usuário.',
            correct: 'Falhas de comunicação geram eventos adversos.',
          },
          {
            label: 'Letra C — vínculo',
            detail: 'Base do relacionamento profissional-usuário.',
            correct: 'Plano terapêutico depende de diálogo.',
          },
          {
            label: 'Letra D — empatia dificulta',
            detail: 'Única incorreta — inverte conceito.',
            correct: 'Empatia aproxima e melhora sintonia — não dificulta.',
          },
          {
            label: 'Transferência — comunicação técnica',
            detail: 'Em outra banca, priorizar só linguagem técnica sem vínculo.',
            correct: 'Humanização exige comunicação empática — não só termos clínicos.',
          },
        ],
        footer_rule: 'D nega o papel da empatia',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-6': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção de acidentes por animais peçonhentos — orientação ACS (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Peçonhentos no domicílio',
        meta: slideMeta,
        items: [
          { label: 'ACS', detail: 'Educa em saúde na visita domiciliar — prevenção de acidentes.', icon: 'Home' },
          { label: 'I — EPI doméstico', detail: 'Calçado e luvas no jardim — correto.', icon: 'Footprints' },
          { label: 'II — inspecionar', detail: 'Examinar calçados e roupas antes do uso — correto.', icon: 'Search' },
          { label: 'III–VI', detail: 'Afastar cama da parede, limpeza, vedar frestas, manejo do quintal — corretos.', icon: 'CheckCircle' },
          { label: 'Escorpião/aranha', detail: 'Ambiente domiciliar é foco de campanhas de prevenção.', icon: 'Bug' },
        ],
        footer_rule: 'Todas as orientações MS são coerentes',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: ACS orienta prevenção de acidentes por animais peçonhentos (I–VI).',
          'I: calçado e luvas no jardim — adequado.',
          'II: examinar calçados e roupas — evita contato com animal escondido.',
          'III: afastar cama da parede e não pendurar roupas — reduz abrigo de artrópodes.',
          'IV: limpar móveis e cantos — remove focos.',
          'V: vedar frestas e buracos — bloqueia entrada.',
          'VI: evitar trepadeiras junto à casa e cortar grama — reduz habitat.',
          'Todas corretas — marcar letra A.',
          'Em similares: pacote de orientação domiciliar do MS tende a ser integral — não recortar itens.',
        ],
        footer_rule: 'Prevenção ambiental + hábitos pessoais',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREVENÇÃO DOMICILIAR',
        rows: [
          { label: 'Proteção pessoal', value: 'Calçado, luvas, inspecionar roupas', badge: 'hot' },
          { label: 'Ambiente interno', value: 'Cama afastada, limpeza, sem roupas no chão', badge: 'ok' },
          { label: 'Ambiente externo', value: 'Vedar frestas, gramado e vegetação controlados', badge: 'ok' },
          { label: 'Papel ACS', value: 'Educação em saúde na visita', badge: 'info' },
        ],
        footer_rule: 'Campanha = conjunto de medidas — não uma só',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — I–VI PEÇONHENTOS',
        items: [
          {
            label: 'Letra B — só II, III, IV',
            detail: 'Exclui medidas igualmente válidas (I, V, VI).',
            correct: 'Calçado no jardim e vedação de frestas também são orientações corretas.',
          },
          {
            label: 'Letra C — V e VI incorretas',
            detail: 'Vedar buracos e manejar quintal são recomendados.',
            correct: 'MS inclui controle ambiental externo.',
          },
          {
            label: 'Letra D — só VI errada',
            detail: 'Manejo de vegetação é medida preventiva.',
            correct: 'VI está correta — grama cortada reduz abrigo.',
          },
          {
            label: 'Letra E — todas incorretas',
            detail: 'Nega pacote inteiro de educação do ACS.',
            correct: 'Todas as seis orientações são condutas de prevenção válidas.',
          },
          {
            label: 'Transferência — só interno',
            detail: 'Em outra banca, focar só em limpeza interna e ignorar quintal.',
            correct: 'Prevenção de peçonhentos inclui manejo do ambiente externo (V e VI).',
          },
        ],
        footer_rule: 'A = todas corretas',
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
    console.log(`[handcraft:promocao-g02] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g02] total=${ok}`);
}

main();
