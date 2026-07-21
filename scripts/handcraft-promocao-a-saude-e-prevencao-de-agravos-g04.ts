#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g04 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g04
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g04';
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
    'saneamento básico',
    'saúde bucal',
  ],
};

const PNI_PICS_SOURCE = {
  id: 'pni-pics-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'PNPIC — Política Nacional de Práticas Integrativas e Complementares',
  year: 2006,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/politica_nacional_praticas_integrativas.pdf',
  covers: ['PICS', 'participação social', 'cultura local', 'cuidado integral'],
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
  sources?: (typeof MS_PROMOCAO_SOURCE | typeof PNI_PICS_SOURCE)[];
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
    .replace(/\busoracional\b/gi, 'uso racional')
    .replace(/\baindividualidade\b/gi, 'a individualidade')
    .replace(/\bemmodelos\b/gi, 'em modelos')
    .replace(/\bEducaçãoem\b/gi, 'Educação em')
    .replace(/\bpode levarao\b/gi, 'pode levar ao')
    .replace(/\bnão éalgo\b/gi, 'não é algo')
    .replace(/\bmotivodevem\b/gi, 'motivo devem')
    .replace(/\bSaúde\(/gi, 'Saúde (')
    .replace(/\b477\d\)\s*/g, '')
    .replace(/\b487\d\)\s*/g, '')
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
  'adm-tec-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-3': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'PICS — consolidação com participação social e respeito à cultura local (PNPIC/MS)',
    sources: [PNI_PICS_SOURCE, MS_PROMOCAO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PICS na comunidade',
        meta: slideMeta,
        items: [
          { label: 'Práticas integrativas', detail: 'Massagem, meditação e plantas medicinais em centros urbanos.', icon: 'Leaf' },
          { label: 'Consolidação', detail: 'Fator de sucesso: vínculo com cultura e participação dos usuários.', icon: 'Users' },
          { label: 'Espaço colaborativo', detail: 'Profissionais e usuários definem protocolos e avaliação juntos.', icon: 'Handshake' },
          { label: 'Pegadinha hospitalocêntrica', detail: 'Modelo hospitalar de alta complexidade não consolida PICS comunitárias.', icon: 'AlertTriangle' },
          { label: 'Cuidado integral', detail: 'PICS complementam — não substituem — tratamento convencional.', icon: 'Shield' },
        ],
        footer_rule: 'Participação + cultura local = consolidação das PICS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: fator que favorece consolidação de PICS junto à população.',
          'Contexto: massagem, meditação e uso racional de plantas em centros urbanos.',
          'Eliminar A — foco hospitalar e alta complexidade: não explica adesão comunitária.',
          'Eliminar B — abandonar tratamento médico: PICS são complementares, não exclusivas.',
          'Eliminar C — agentes externos sem crenças populares: ignora cultura local.',
          'Manter D — espaços colaborativos com protocolos e avaliação definidos em conjunto.',
          'Marcar letra D.',
          'Em similares: PICS consolidam com participação social e respeito à individualidade cultural.',
        ],
        footer_rule: 'Cocriação de protocolos com a comunidade',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PICS — FATORES DE SUCESSO',
        rows: [
          { label: 'Participação', value: 'Usuários definem protocolos e avaliação', badge: 'hot' },
          { label: 'Cultura local', value: 'Respeitar crenças e individualidade', badge: 'hot' },
          { label: 'Integração', value: 'Complementar cuidado convencional', badge: 'ok' },
          { label: 'Erro', value: 'Hospitalocentrismo ou imposição externa', badge: 'warn' },
        ],
        footer_rule: 'PNPIC: cuidado humanizado e participativo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PICS',
        items: [
          {
            label: 'Letra A — hospitalocêntrico',
            detail: 'Alta dependência de equipamentos e alta complexidade.',
            correct: 'PICS comunitárias exigem vínculo territorial — não modelo hospitalar.',
          },
          {
            label: 'Letra B — exclusivismo',
            detail: 'Abandonar tratamento médico prévio.',
            correct: 'Práticas integrativas complementam o cuidado — não substituem totalmente.',
          },
          {
            label: 'Letra C — imposição externa',
            detail: 'Excluir crenças populares e só modelos validados de fora.',
            correct: 'Consolidação passa por diálogo com cultura local — não exclusão.',
          },
          {
            label: 'Transferência — só fitoterapia',
            detail: 'Em outra banca, planta medicinal isolada pode parecer suficiente.',
            correct: 'A questão pede fator de consolidação — participação colaborativa.',
          },
        ],
        footer_rule: 'D = espaços colaborativos com a comunidade',
      },
    ],
  },

  'avancasp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde — diálogo com saberes populares; não “desmistificar” como princípio (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Educação em saúde — erro conceitual',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Destaque a afirmativa com erro conceitual sobre educação em saúde.', icon: 'AlertTriangle' },
          { label: 'Práticas pedagógicas', detail: 'Conteúdo técnico, político e científico — vivenciado na atenção.', icon: 'GraduationCap' },
          { label: 'Consciência crítica', detail: 'Formação para ação individual e coletiva sobre problemas de saúde.', icon: 'Brain' },
          { label: 'Romper transferência', detail: 'Sair do modelo bancário de transferir conhecimento.', icon: 'RefreshCw' },
          { label: 'Pegadinha “desmistificar”', detail: 'Educação não parte de anular crenças — dialoga com saberes populares.', icon: 'Ban' },
        ],
        footer_rule: 'Educação em saúde = diálogo, não imposição',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa com erro conceitual sobre educação em saúde.',
          'A: práticas pedagógicas compartilhadas na atenção — correta.',
          'B: formação de consciência crítica — correta.',
          'C: romper paradigma da transferência bancária — correta.',
          'E: capacitação para transformar a realidade — correta.',
          'D: “desmistificar crenças populares” como princípio — ERRO conceitual.',
          'Educação valoriza saberes locais e constrói sentido em diálogo.',
          'Marcar letra D.',
          'Em similares: desconfie de educação que só nega crença popular.',
        ],
        footer_rule: 'Diálogo com saberes — não desqualificação automática',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO EM SAÚDE — MS',
        rows: [
          { label: 'Natureza', value: 'Prática social e pedagógica na atenção', badge: 'hot' },
          { label: 'Método', value: 'Diálogo — técnico + saber popular', badge: 'hot' },
          { label: 'Objetivo', value: 'Consciência crítica e ação coletiva', badge: 'ok' },
          { label: 'Erro', value: '“Desmistificar” como princípio único', badge: 'warn' },
        ],
        footer_rule: 'Crenças e valores do grupo são ponto de partida',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ERRO CONCEITUAL',
        items: [
          {
            label: 'Letra A — práticas compartilhadas',
            detail: 'Educação vivenciada por trabalhadores e população.',
            correct: 'Conceito correto — não é a afirmativa com erro.',
          },
          {
            label: 'Letra B — consciência crítica',
            detail: 'Contribui para ação individual e coletiva.',
            correct: 'Alinhado à educação emancipatória — não marque.',
          },
          {
            label: 'Letra C — anti-bancária',
            detail: 'Romper transferência mecânica de conteúdo.',
            correct: 'Princípio clássico da educação em saúde — correta.',
          },
          {
            label: 'Letra E — transformação',
            detail: 'Capacitar para atuar sobre a realidade.',
            correct: 'Finalidade política da educação em saúde — correta.',
          },
          {
            label: 'Transferência — palestra técnica',
            detail: 'Em outra banca, “informar” pode parecer educação suficiente.',
            correct: 'O erro pedido é tratar desmistificação como princípio — letra D.',
          },
        ],
        footer_rule: 'D = erro (desmistificar como princípio)',
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
          { label: 'Ações educativas', detail: 'Parte do dia a dia do ACS — melhoria da qualidade de vida.', icon: 'Users' },
          { label: 'Educação em saúde', detail: 'Na comunidade — visita domiciliar e ações em grupo.', icon: 'Home' },
          { label: 'Saberes locais', detail: 'Valorizar experiência dos participantes no diálogo.', icon: 'MessageCircle' },
          { label: 'Participação', detail: 'Planejar, executar e avaliar com a comunidade.', icon: 'Handshake' },
          { label: 'Pegadinha “só individual”', detail: 'Privacidade não elimina educação coletiva do ACS.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Educação comunitária privilegia grupo e participação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: opção INCORRETA sobre educação em saúde na comunidade.',
          'A: visita domiciliar e ações em grupo — conduta correta.',
          'B: considerar conhecimento dos participantes — correto.',
          'C: técnica + comunicação + perfil do grupo — correto.',
          'D: participação no planejar, executar e avaliar — correto.',
          'E: preferir sempre educação individual por privacidade — INCORRETA.',
          'Marcar letra E.',
          'Em similares: em INCORRETA do ACS, desconfie de “só individual”.',
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
            detail: 'Ações começam no domicílio e podem ser em grupo.',
            correct: 'Conduta correta — não é a INCORRETA.',
          },
          {
            label: 'Letra B — saberes locais',
            detail: 'Troca de ideias com participantes.',
            correct: 'Educação dialogada — alternativa correta.',
          },
          {
            label: 'Letra C — competências',
            detail: 'Técnica, comunicação e conhecer o grupo.',
            correct: 'Requisitos da prática educativa — correta.',
          },
          {
            label: 'Letra D — participação',
            detail: 'Envolver no planejar, executar e avaliar.',
            correct: 'Educação participativa — correta.',
          },
          {
            label: 'Letra E — só individual',
            detail: 'Preferir sempre educação individual por privacidade.',
            correct: 'Única INCORRETA — educação coletiva é prática central do ACS.',
          },
          {
            label: 'Transferência — palestra única',
            detail: 'Visita domiciliar dispensaria ações em grupo.',
            correct: 'ACS articula individual e coletivo — E é a armadilha.',
          },
        ],
        footer_rule: 'E = INCORRETA (só educação individual)',
      },
    ],
  },

  'facet-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-5': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'ACS — levantamento de informações: observação, inquérito e mapa social (MS/ESF)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ACS — levantamento no território',
        meta: slideMeta,
        items: [
          { label: 'Planejamento', detail: 'Levantar condições de vida e saúde é central para o ACS.', icon: 'ClipboardList' },
          { label: 'Observação participante', detail: 'Visita domiciliar — vulnerabilidade ambiental e social.', icon: 'Eye' },
          { label: 'Inquérito de saúde', detail: 'Dados quantitativos — água tratada, morbidade (equipe PSF).', icon: 'BarChart' },
          { label: 'Mapa social', detail: 'Visualizar áreas de risco e priorizar visitas.', icon: 'Map' },
          { label: 'Pegadinha “só questionário”', detail: 'Observação qualitativa complementa inquéritos formais.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Técnicas qualitativas + quantitativas no território',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnicas de levantamento do ACS — I, II e III.',
          'I: observação participante na visita — identifica vulnerabilidade qualitativa — VERDADEIRA.',
          'II: inquérito pela equipe do PSF — dados quantitativos (água tratada etc.) — VERDADEIRA.',
          'III: mapa social — concentrar doenças e priorizar visitas — VERDADEIRA.',
          'Todas as afirmativas estão corretas.',
          'Marcar letra D.',
          'Em similares: ACS usa observação, inquérito e mapa — não uma técnica só.',
        ],
        footer_rule: 'I + II + III = verdadeiras',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TÉCNICAS DO ACS',
        rows: [
          { label: 'I — Observação', value: 'Visita domiciliar qualitativa', badge: 'hot' },
          { label: 'II — Inquérito', value: 'Dados quantitativos na equipe', badge: 'hot' },
          { label: 'III — Mapa social', value: 'Priorizar áreas de risco', badge: 'ok' },
          { label: 'Planejamento', value: 'Combinar técnicas no território', badge: 'info' },
        ],
        footer_rule: 'Levantamento territorial é multiferramenta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VF ACS',
        items: [
          {
            label: 'Letra A — só I e II',
            detail: 'Exclui mapa social.',
            correct: 'III também é técnica válida do ACS — eliminar.',
          },
          {
            label: 'Letra B — só II e III',
            detail: 'Exclui observação participante.',
            correct: 'I é verdadeira — observação na visita domiciliar.',
          },
          {
            label: 'Letra C — só I e III',
            detail: 'Exclui inquérito quantitativo.',
            correct: 'II é verdadeira — inquérito pelo PSF.',
          },
          {
            label: 'Letra E — só I',
            detail: 'Restringe a uma afirmativa.',
            correct: 'II e III também estão corretas.',
          },
          {
            label: 'Transferência — só fichário',
            detail: 'Registrar sem observar o território.',
            correct: 'ACS combina técnicas — todas as assertivas valem.',
          },
        ],
        footer_rule: 'D = todas corretas',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saneamento básico — água, esgoto, resíduos e controle de vetores (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estratégias de saneamento',
        meta: slideMeta,
        items: [
          { label: 'Água potável', detail: 'Abastecimento seguro — prevenção primária coletiva.', icon: 'Droplet' },
          { label: 'Águas pluviais', detail: 'Manejo de drenagem — parte do saneamento urbano.', icon: 'CloudRain' },
          { label: 'Esgoto', detail: 'Coleta e tratamento — reduz contaminação ambiental.', icon: 'Waves' },
          { label: 'Resíduos e limpeza', detail: 'Limpeza urbana e manejo de resíduos sólidos.', icon: 'Trash2' },
          { label: 'Controle de vetores', detail: 'Pragas e agentes patogênicos — vigilância ambiental.', icon: 'Bug' },
        ],
        footer_rule: 'Saneamento abrange I a VI do enunciado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: itens I a VI — estratégias de saneamento.',
          'I: abastecimento de água potável — saneamento.',
          'II: manejo de água pluvial — saneamento.',
          'III: coleta e tratamento de esgoto — saneamento.',
          'IV: limpeza urbana — saneamento.',
          'V: manejo de resíduos sólidos — saneamento.',
          'VI: controle de pragas e patógenos — saneamento.',
          'Marcar letra A — todos os itens.',
          'Em similares: saneamento básico é conjunto amplo — não só água e esgoto.',
        ],
        footer_rule: 'I + II + III + IV + V + VI = saneamento',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SANEAMENTO BÁSICO',
        rows: [
          { label: 'Água', value: 'Potável e pluvial', badge: 'hot' },
          { label: 'Esgoto', value: 'Coleta e tratamento', badge: 'hot' },
          { label: 'Urbano', value: 'Limpeza e resíduos sólidos', badge: 'ok' },
          { label: 'Vetores', value: 'Controle de pragas e patógenos', badge: 'ok' },
        ],
        footer_rule: 'Determinante social — promoção e prevenção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANEAMENTO',
        items: [
          {
            label: 'Letra B — só I II III',
            detail: 'Exclui limpeza urbana, resíduos e vetores.',
            correct: 'IV, V e VI também são estratégias de saneamento.',
          },
          {
            label: 'Letra C — V fora',
            detail: 'Resíduos sólidos não seriam saneamento.',
            correct: 'Manejo de resíduos é componente clássico do saneamento.',
          },
          {
            label: 'Letra D — VI fora',
            detail: 'Controle de pragas excluído.',
            correct: 'Controle de vetores integra saneamento ambiental.',
          },
          {
            label: 'Letra E — nenhum item',
            detail: 'Nega todos os componentes.',
            correct: 'Todos os seis itens listados são saneamento.',
          },
          {
            label: 'Transferência — só água',
            detail: 'Reduzir saneamento à água potável.',
            correct: 'Conceito amplo inclui esgoto, resíduos e vetores.',
          },
        ],
        footer_rule: 'A = todos os itens são saneamento',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'ACS — instrumentos de territorialização (mapa / delimitação de microárea)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Instrumento do ACS — mapa',
        meta: slideMeta,
        items: [
          { label: 'Territorialização', detail: 'Delimitação da microárea e espaços sociais em transformação.', icon: 'Map' },
          { label: 'Mapa inteligente', detail: 'Termo da banca — instrumento de trabalho do ACS na rotina.', icon: 'MapPin' },
          { label: 'Atualização', detail: 'Território muda — mapa deve ser revisado periodicamente.', icon: 'RefreshCw' },
          { label: 'Espaços sociais', detail: 'Escolas, associações, pontos de risco — referência para visitas.', icon: 'Home' },
          { label: 'Pegadinha nome', detail: 'Banca usa “mapa inteligente” — não confundir com mapa nutricional ou estadual.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Gabarito da prova: mapa inteligente (letra B)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nome do instrumento de trabalho do ACS mostrado na figura.',
          'Contexto: delimitação territorial e espaços sociais em constante transformação.',
          'Eliminar A — mapa multiprofissional: nomenclatura não é a da banca.',
          'Manter B — mapa inteligente — resposta esperada.',
          'Eliminar C — mapa interdisciplinar.',
          'Eliminar D — mapa nutricional.',
          'Eliminar E — mapa estadual.',
          'Marcar letra B.',
          'Em similares: siga o termo literal da banca para instrumentos do ACS.',
        ],
        footer_rule: 'Figura + territorialização → mapa inteligente',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACS — MAPA DO TERRITÓRIO',
        rows: [
          { label: 'Função', value: 'Delimitar microárea e espaços sociais', badge: 'hot' },
          { label: 'Atualização', value: 'Revisar conforme mudanças do território', badge: 'hot' },
          { label: 'Cuidado', value: 'Atualizar conforme mudanças locais', badge: 'ok' },
          { label: 'Erro', value: 'Confundir com mapa nutricional/estadual', badge: 'warn' },
        ],
        footer_rule: 'Instrumento visual da territorialização',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOME DO MAPA',
        items: [
          {
            label: 'Letra A — multiprofissional',
            detail: 'Nome alternativo inventado na alternativa.',
            correct: 'Banca pede “mapa inteligente” — não esta nomenclatura.',
          },
          {
            label: 'Letra C — interdisciplinar',
            detail: 'Termo genérico não usado no gabarito.',
            correct: 'Eliminar — figura corresponde ao mapa inteligente.',
          },
          {
            label: 'Letra D — nutricional',
            detail: 'Mapa de vigilância alimentar — outro instrumento.',
            correct: 'Não é o instrumento territorial geral do ACS nesta questão.',
          },
          {
            label: 'Letra E — estadual',
            detail: 'Escala administrativa errada para microárea.',
            correct: 'ACS trabalha microárea da ESF — mapa inteligente local.',
          },
          {
            label: 'Transferência — mapa social',
            detail: 'Em outra banca, “mapa social” é técnica de levantamento.',
            correct: 'Nesta prova o gabarito literal é mapa inteligente.',
          },
        ],
        footer_rule: 'B = mapa inteligente',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-0': {
    family: 'conceito',
    branch: 'promocao_generico',
    guideline: 'Saúde bucal — tártaro (placa calcificada) e prevenção (MS/SB Brasil)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tártaro e placa bacteriana',
        meta: slideMeta,
        items: [
          { label: 'Placa bacteriana', detail: 'Biofilme que adere aos dentes e gengivas.', icon: 'Circle' },
          { label: 'Calcificação', detail: 'Placa mineralizada forma tártaro — duro e amarelado.', icon: 'Gem' },
          { label: 'Consequências', detail: 'Manchas, cárie, gengivite e mau hálito se não tratado.', icon: 'AlertTriangle' },
          { label: 'Prevenção', detail: 'Escovação, fio dental e consulta odontológica regular.', icon: 'Smile' },
          { label: 'Pegadinha órgão', detail: 'Glaucoma, otite e afta são outros agravos — não placa dentária.', icon: 'Ban' },
        ],
        footer_rule: 'Tártaro = placa bacteriana calcificada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: calcificação da placa bacteriana — placa dura e amarelada.',
          'Se não tratada: manchas, cáries, gengivite e mau hálito.',
          'Eliminar B — glaucoma: doença ocular, não bucal.',
          'Eliminar C — otite: ouvido.',
          'Eliminar D — afta: lesão ulcerada — não é calcificação de placa.',
          'Eliminar E — saburra: revestimento lingual — não é tártaro dentário.',
          'Manter A — tártaro.',
          'Marcar letra A.',
          'Em similares: tártaro = placa mineralizada nos dentes.',
        ],
        footer_rule: 'Higiene bucal previne acúmulo de placa',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SAÚDE BUCAL — TÁRTARO',
        rows: [
          { label: 'Definição', value: 'Placa bacteriana calcificada', badge: 'hot' },
          { label: 'Aspecto', value: 'Placa dura e amarelada', badge: 'hot' },
          { label: 'Riscos', value: 'Cárie, gengivite, mau hálito', badge: 'warn' },
          { label: 'Prevenção', value: 'Escovação + fio dental + odonto', badge: 'ok' },
        ],
        footer_rule: 'Promoção bucal na atenção básica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÁRTARO',
        items: [
          {
            label: 'Letra B — glaucoma',
            detail: 'Aumento da pressão intraocular.',
            correct: 'Agravo oftalmológico — não relacionado à placa dentária.',
          },
          {
            label: 'Letra C — otite',
            detail: 'Inflamação do ouvido.',
            correct: 'Fora do contexto de cárie e gengivite.',
          },
          {
            label: 'Letra D — afta',
            detail: 'Úlcera oral superficial.',
            correct: 'Não é calcificação de placa nos dentes.',
          },
          {
            label: 'Letra E — saburra',
            detail: 'Camada na língua.',
            correct: 'Diferente do tártaro que adere ao dente/gengiva.',
          },
          {
            label: 'Transferência — pedra nos rins',
            detail: 'Em outra banca, calcificação pode remeter a litíase.',
            correct: 'Enunciado ancora placa nos dentes — tártaro.',
          },
        ],
        footer_rule: 'Tártaro = placa bacteriana calcificada nos dentes',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-1': {
    family: 'conceito',
    branch: 'promocao_generico',
    guideline: 'Prevenção de complicações bucais — alimentação, higiene e hábitos (MS/SB Brasil)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção bucal — I a VI',
        meta: slideMeta,
        items: [
          { label: 'Alimentação', detail: 'Dieta balanceada; açúcar limitado às refeições (I e II).', icon: 'Apple' },
          { label: 'Hábitos', detail: 'Não fumar, beber ou usar drogas (III).', icon: 'Ban' },
          { label: 'Higiene', detail: 'Escova fluoretada 2–3×/dia + fio dental (IV).', icon: 'Smile' },
          { label: 'Escova', detail: 'Trocar a cada 3–4 meses (V).', icon: 'RefreshCw' },
          { label: 'Infância', detail: 'Acompanhamento odontológico desde os primeiros dentes (VI).', icon: 'Baby' },
        ],
        footer_rule: 'Todos os itens são medidas preventivas corretas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: medidas de prevenção a complicações bucais — I a VI.',
          'I: alimentação saudável e horários — correto.',
          'II: limitar açúcar às refeições — correto.',
          'III: não fumar, beber ou usar drogas — correto.',
          'IV: escovação com flúor e fio dental — correto.',
          'V: trocar escova a cada 3–4 meses — correto.',
          'VI: visitas ao dentista desde os primeiros dentes — correto.',
          'Marcar letra A — todos os itens corretos.',
          'Em similares: prevenção bucal combina dieta, hábitos e higiene.',
        ],
        footer_rule: 'I a VI = verdadeiros',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREVENÇÃO BUCAL',
        rows: [
          { label: 'Dieta', value: 'Balanceada; pouco açúcar fora das refeições', badge: 'hot' },
          { label: 'Higiene', value: 'Flúor + fio dental diários', badge: 'hot' },
          { label: 'Hábitos', value: 'Evitar tabaco, álcool e drogas', badge: 'ok' },
          { label: 'Odonto', value: 'Acompanhamento desde a infância', badge: 'ok' },
        ],
        footer_rule: 'Promoção bucal na APS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VF BUCAL',
        items: [
          {
            label: 'Letra B — III–VI incorretos',
            detail: 'Nega hábitos, higiene e acompanhamento infantil.',
            correct: 'Todos esses itens são recomendações válidas de prevenção.',
          },
          {
            label: 'Letra C — IV–VI incorretos',
            detail: 'Questiona escovação, troca de escova e odonto infantil.',
            correct: 'IV, V e VI estão alinhados às diretrizes de saúde bucal.',
          },
          {
            label: 'Letra D — I, II e V incorretos',
            detail: 'Nega alimentação e troca de escova.',
            correct: 'I, II e V são medidas corretas — eliminar.',
          },
          {
            label: 'Letra E — todos incorretos',
            detail: 'Nega integralmente o pacote preventivo.',
            correct: 'Todos os seis itens são condutas adequadas.',
          },
          {
            label: 'Transferência — só escovar',
            detail: 'Higiene isolada sem dieta ou odonto.',
            correct: 'A questão valida o conjunto I–VI — todos corretos.',
          },
        ],
        footer_rule: 'A = todos os itens corretos',
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
    console.log(`[handcraft:promocao-g04] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g04] total=${ok}`);
}

main();
