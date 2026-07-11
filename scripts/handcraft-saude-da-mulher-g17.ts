#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g17 (8 slugs parto P0).
 *
 *   npm run handcraft:saude-da-mulher-g17
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g17 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g17';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['pré-natal', 'DPP', 'puerpério', 'lóquios', 'aleitamento materno'],
};

const OMS_PARTO_SOURCE = {
  id: 'oms-parto-humanizado',
  tier: 'A' as const,
  issuer: 'OMS / MS — PNH',
  title: 'Diretrizes Nacionais de Assistência ao Parto Normal — MS',
  year: 2017,
  url: 'https://www.who.int/publications/i/item/9789241550215',
  covers: ['acolhimento obstétrico', 'classificação de risco', 'pós-parto', 'atribuições enfermagem'],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo de Atenção à Saúde das Mulheres — MS 2016',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_atencao_saude_mulheres.pdf',
  covers: ['integralidade', 'atenção primária', 'climatério', 'DIU pós-parto'],
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof AB32_SOURCE | typeof OMS_PARTO_SOURCE | typeof PF_SOURCE)[];
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
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
    sources: pack.sources ?? [OMS_PARTO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/vigésima\s+semana/gi, 'segundo trimestre')
    .replace(/dez dias/gi, 'puerpério inicial')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPosPartoNoise(s: string): string {
  return s
    .replace(/cuidados imediatos/gi, 'cuidados na sala de parto')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPosPartoAtribuicoesSlides(correctLetter: 'A' | 'B') {
  const gabText =
    'Orientar sobre hemorragias e lóquios, avaliar cicatrização de cesárea com higiene local e curativo.';
  const distractors =
    correctLetter === 'A'
      ? [
          {
            letter: 'B',
            short: 'episiorrafia',
            detail: 'Sutura perineal é ato médico.',
            correct: 'Competência médica — orientar lóquios e curativo de cesárea é letra A.',
          },
          {
            letter: 'C',
            short: 'não amamentar',
            detail: 'Aleitamento deve ser estimulado no puerpério.',
            correct: 'Apoio à amamentação — gabarito A (lóquios e ferida operatória).',
          },
          {
            letter: 'D',
            short: 'consulta nutricional',
            detail: 'Consulta nutricional não é atribuição nuclear do técnico.',
            correct: 'Vigilância de hemorragia e lóquios — marcar letra A.',
          },
        ]
      : [
          {
            letter: 'A',
            short: 'episiorrafia',
            detail: 'Sutura perineal é ato médico.',
            correct: 'Competência médica — orientar lóquios e curativo de cesárea é letra B.',
          },
          {
            letter: 'C',
            short: 'não amamentar',
            detail: 'Aleitamento deve ser estimulado no puerpério.',
            correct: 'Apoio à amamentação — gabarito B (lóquios e ferida operatória).',
          },
          {
            letter: 'D',
            short: 'fisioterapia pélvica',
            detail: 'Sessão de fisioterapia não é atribuição central do técnico.',
            correct: 'Vigilância de hemorragia e lóquios — marcar letra B.',
          },
        ];

  return [
    {
      type: 'concept_map',
      slide_title: 'Pós-parto — atribuições TE',
      meta: slideMeta,
      items: [
        {
          label: 'Comando',
          detail:
            'Atribuições de enfermagem nos cuidados do pós-parto — sala de parto e orientações fisiológicas.',
          icon: 'Target',
        },
        {
          label: `Atribuição (${correctLetter})`,
          detail: gabText,
          icon: 'Heart',
        },
        {
          label: 'Pegadinha episiorrafia',
          detail: 'Sutura perineal é ato médico — não atribuição do técnico.',
          icon: 'AlertTriangle',
        },
        {
          label: 'Pegadinha puerpério curto',
          detail: 'Acompanhamento vai além da alta — orientar lóquios e sinais de alarme até o 42º dia.',
          icon: 'Clock',
        },
      ],
      footer_rule: 'Lóquios, hemorragia e ferida operatória',
    },
    {
      type: 'golden_rule',
      slide_title: 'Puerpério — enfermagem',
      meta: slideMeta,
      content: 'CUIDADOS PÓS-PARTO',
      rows: [
        { label: 'Lóquios', value: 'Diferenciar fisiológico de hemorragia', badge: 'hot', emphasis: 'highlight' },
        { label: 'Cesárea', value: 'Higiene local e curativo da incisão', badge: 'hot' },
        { label: 'Amamentação', value: 'Apoiar aleitamento — não contraindicar', badge: 'info' },
        { label: 'Não é TE', value: 'Episiorrafia, prescrição ou fisioterapia autônoma', badge: 'warn' },
      ],
      footer_rule: `Orientação e vigilância → ${correctLetter}`,
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: slideMeta,
      steps: [
        'Cuidados do pós-parto — atribuições da enfermagem.',
        'Eliminar episiorrafia — competência médica.',
        'Eliminar orientar contra amamentação.',
        'Eliminar consulta nutricional ou fisioterapia como atribuição central.',
        `Testar ${correctLetter} — lóquios, hemorragia e curativo de cesárea.`,
        `Marcar letra ${correctLetter}.`,
      ],
      footer_rule: `Vigilância clínica e orientação → ${correctLetter}`,
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: slideMeta,
      content: 'PEGADINHAS — PÓS-PARTO',
      items: [
        ...distractors.map((d) => ({
          label: `Letra ${d.letter} — ${d.short}`,
          detail: d.detail,
          correct: d.correct,
        })),
        {
          label: 'Pegadinha puerpério curto',
          detail: 'Cuidados não encerram na alta hospitalar.',
          correct: `Orientar mudanças fisiológicas e sinais de alarme — letra ${correctLetter}.`,
        },
      ],
      footer_rule: 'Enfermagem orienta e vigia',
    },
  ];
}

const SPECS: Record<string, Pack> = {
  'instituto-evo-enfermagem-saude-da-mulher-1777104306781-3': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — DPP: data da última menstruação (Naegele) e ultrassonografia obstétrica',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DPP — dois métodos',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Duas formas de calcular a data prevista do parto (DPP).', icon: 'Target' },
          { label: 'DUM + USG (C)', detail: 'Última menstruação e ultrassonografia obstétrica.', icon: 'Calendar' },
          { label: 'Pegadinha penúltima', detail: 'Usa data errada da menstruação — letra A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha ressonância', detail: 'Exame de imagem obstétrico é ultrassom — não ressonância.', icon: 'XCircle' },
        ],
        footer_rule: 'DUM e ultrassonografia → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'DPP — cálculo',
        meta: slideMeta,
        content: 'DATA PREVISTA DO PARTO',
        rows: [
          { label: 'Método 1', value: 'Data da última menstruação (DUM)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Método 2', value: 'Ultrassonografia obstétrica', badge: 'hot' },
          { label: 'Não é', value: 'Penúltima menstruação, ressonância ou toque isolado', badge: 'warn' },
        ],
        footer_rule: 'DUM + USG → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Data prevista do parto — duas formas de cálculo.',
          'Eliminar A — penúltima menstruação.',
          'Eliminar B — ressonância radiográfica.',
          'Testar C — última menstruação e ultrassonografia.',
          'Eliminar D — tabelinha e toque isolados.',
          'Marcar letra C.',
        ],
        footer_rule: 'DUM e ultrassom → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DPP',
        items: [
          { label: 'Letra A — penúltima', detail: 'Base é a última menstruação, não a penúltima.', correct: 'DUM correta + USG — letra C.' },
          { label: 'Letra B — ressonância', detail: 'Ultrassonografia é o exame de imagem padrão.', correct: 'Última menstruação e USG — gabarito C.' },
          { label: 'Letra D — toque', detail: 'Toque avalia colo — não calcula DPP sozinho.', correct: 'Dois métodos clássicos — marcar C.' },
          { label: 'Pegadinha tabelinha', detail: 'Tabelinha auxilia mas não substitui DUM/USG.', correct: 'Última menstruação e ultrassonografia — C.' },
        ],
        footer_rule: 'Estimar nascimento por DUM e USG',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-6': {
    family: 'certo_errado',
    branch: 'mulher_parto',
    guideline: 'MS — puerpério inicial: lóquios rubra (vermelho vivo) sem odor fétido são fisiológicos',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lóquios — puerpério inicial',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Puerpério inicial: lóquios sanguinolentos, vermelho vivo, moderados e sem odor fétido — achado normal.',
            icon: 'Target',
          },
          { label: 'Lóquios rubra (Certo)', detail: 'Primeiros dias pós-parto — eliminação uterina fisiológica.', icon: 'Droplet' },
          { label: 'Pegadinha odor fétido', detail: 'Odor fétido sugere infecção — não é normal.', icon: 'AlertTriangle' },
          { label: 'Pegadinha puerpério curto', detail: 'Rubra evolui para serosa e alba — acompanhamento até o 42º dia.', icon: 'Clock' },
        ],
        footer_rule: 'Lóquios rubra fisiológica — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Lóquios — fases',
        meta: slideMeta,
        content: 'ELIMINAÇÃO UTERINA',
        rows: [
          { label: 'Rubra', value: 'Vermelho vivo nos primeiros dias pós-parto', badge: 'hot', emphasis: 'highlight' },
          { label: 'Serosa', value: 'Cor rosada — transição fisiológica', badge: 'info' },
          { label: 'Alba', value: 'Amarelada — fase final', badge: 'info' },
          { label: 'Alarme', value: 'Odor fétido, febre ou sangramento excessivo', badge: 'warn' },
        ],
        footer_rule: 'Aspecto rubra sem fétido → Certo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar afirmativa sobre lóquios no puerpério inicial.',
          'Lóquios sanguinolentos vermelho vivo — fase rubra esperada.',
          'Quantidade moderada sem odor fétido — padrão fisiológico.',
          'Primeiros dias após o parto — eliminação uterina normal.',
          'Afirmativa compatível com MS.',
          'Marcar alternativa Certo — letra A.',
        ],
        footer_rule: 'Lóquios rubra fisiológicos — Certo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LÓQUIOS',
        items: [
          { label: 'Errado — ausência', detail: 'Lóquios cessam gradualmente — não somem no 1º dia.', correct: 'Rubra moderada é normal — Certo.' },
          { label: 'Errado — odor fétido', detail: 'Odor fétido indica possível infecção puerperal.', correct: 'Sem odor fétido — afirmativa correta.' },
          { label: 'Errado — hemorragia', detail: 'Hemorragia excessiva é patológica — não confundir com lóquios.', correct: 'Quantidade moderada fisiológica — Certo.' },
          { label: 'Pegadinha puerpério curto', detail: 'Evolução rubra → serosa → alba ao longo do puerpério.', correct: 'Primeiros dias rubra — gabarito Certo.' },
        ],
        footer_rule: 'Diferenciar lóquios de hemorragia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-1': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS 2016 — APS: cuidado longitudinal gravídico-puerperal e climatério com integralidade',
    sources: [PF_SOURCE, AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'APS — ciclo da mulher',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Assistência na APS ao ciclo gravídico-puerperal e climatério — vigilância, cuidado longitudinal e autonomia.',
            icon: 'Target',
          },
          { label: 'Integralidade (A)', detail: 'Acompanhamento contínuo, estratificação de risco e coordenação na rede.', icon: 'Users' },
          { label: 'Pegadinha episódica', detail: 'Demanda espontânea isolada — letra B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha só gestação', detail: 'Climatério também na APS — letra D.', icon: 'XCircle' },
        ],
        footer_rule: 'Cuidado longitudinal integral — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'APS — mulher',
        meta: slideMeta,
        content: 'CUIDADO QUALIFICADO',
        rows: [
          { label: 'Longitudinal', value: 'Seguimento contínuo com estratificação de risco', badge: 'hot', emphasis: 'highlight' },
          { label: 'Educação', value: 'Ações educativas e promoção da autonomia', badge: 'info' },
          { label: 'Rede', value: 'Coordenação do cuidado entre níveis', badge: 'info' },
          { label: 'Não é', value: 'Só queixas agudas ou só período gestacional', badge: 'warn' },
        ],
        footer_rule: 'Integralidade na APS → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cuidado qualificado no ciclo gravídico-puerperal e climatério na APS.',
          'Eliminar B — atendimento só por demanda episódica.',
          'Eliminar C — protocolos biomédicos sem longitudinalidade.',
          'Eliminar D — restringir ao período gestacional.',
          'Testar A — acompanhamento contínuo e coordenação na rede.',
          'Marcar letra A.',
        ],
        footer_rule: 'Vigilância e autonomia → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — APS MULHER',
        items: [
          { label: 'Letra B — demanda', detail: 'Cuidado longitudinal exige seguimento programado.', correct: 'Estratificação e educação — letra A.' },
          { label: 'Letra C — biomédico', detail: 'Integralidade inclui determinantes sociais.', correct: 'Coordenação na rede — gabarito A.' },
          { label: 'Letra D — gestação', detail: 'Climatério permanece na atenção primária.', correct: 'Cuidado contínuo — marcar A.' },
          { label: 'Pegadinha fragmentada', detail: 'Protocolo MS articula vigilância e autonomia.', correct: 'Acompanhamento integral — letra A.' },
        ],
        footer_rule: 'Gravídico-puerperal e climatério na APS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'itame-enfermagem-saude-da-mulher-1777104424950-2': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/PNH — Acolhimento e Classificação de Risco obstétrico: TE acolhe, classifica e encaminha',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'A&CR — obstetrícia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Acolhimento na porta de entrada de maternidades — gestante, acompanhante, classificação de risco obstétrico e vínculo no parto.',
            icon: 'Target',
          },
          { label: 'Encaminhar (B)', detail: 'Encaminhar para atendimento após classificação de risco.', icon: 'ArrowRight' },
          { label: 'Pegadinha arquivo', detail: 'Organizar ficha é rotina administrativa — não papel central do TE.', icon: 'AlertTriangle' },
          { label: 'Pegadinha só classificar', detail: 'Classificar risco sem encaminhar deixa o fluxo obstétrico incompleto.', icon: 'XCircle' },
        ],
        footer_rule: 'A&CR: classificar e encaminhar na maternidade',
      },
      {
        type: 'golden_rule',
        slide_title: 'A&CR — TE',
        meta: slideMeta,
        content: 'ACOLHIMENTO OBSTÉTRICO',
        rows: [
          { label: 'Porta de entrada', value: 'Acolhimento da gestante e acompanhante na maternidade', badge: 'hot', emphasis: 'highlight' },
          { label: 'Pré-natal', value: 'Mitos geram insegurança mesmo com acompanhamento pré-natal', badge: 'info' },
          { label: 'Classificação', value: 'Priorizar queixa conforme protocolo de risco obstétrico', badge: 'hot' },
          { label: 'Encaminhamento', value: 'Direcionar ao atendimento após classificação de risco', badge: 'info' },
          { label: 'Protagonismo', value: 'Vínculo de confiança favorece protagonismo no parto', badge: 'info' },
        ],
        footer_rule: 'Após classificar → encaminhar — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Acolhimento e Classificação de Risco (A&CR) em obstetrícia — papel do Técnico de Enfermagem.',
          'Eliminar A — só receber fichas de atendimento sem encaminhar.',
          'Testar B — encaminhar a usuária após classificação de risco.',
          'Eliminar C — organizar e arquivar ficha conforme rotina.',
          'Eliminar D — classificar risco sem completar encaminhamento.',
          'Marcar letra B.',
        ],
        footer_rule: 'Classificação + encaminhamento → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — A&CR',
        items: [
          {
            label: 'Letra A — receber ficha',
            detail: 'Avaliar prioridade sem encaminhar é fluxo incompleto na urgência obstétrica.',
            correct: 'Encaminhar após classificação de risco — letra B.',
          },
          {
            label: 'Letra C — arquivar',
            detail: 'Arquivar ficha é tarefa administrativa secundária na maternidade.',
            correct: 'Destino após classificação define o papel do TE — gabarito B.',
          },
          {
            label: 'Letra D — só classificar',
            detail: 'Rapidez na classificação exige encaminhamento subsequente.',
            correct: 'Protocolo A&CR completo — marcar letra B.',
          },
          {
            label: 'Pegadinha protagonismo',
            detail: 'Acolhimento constrói vínculo com gestante e acompanhante no parto.',
            correct: 'Após classificar o risco obstétrico, encaminhar — letra B.',
          },
        ],
        footer_rule: 'Porta de entrada da maternidade',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'legalle-enfermagem-processo-de-enfermagem-1780011887822-2': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/OMS — aleitamento materno exclusivo: somente leite humano até seis meses',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AM exclusivo — definição',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Definição de aleitamento materno exclusivo após tipos de leite.', icon: 'Target' },
          { label: 'Exclusivo (D)', detail: 'Somente leite materno ou de banco — sem outros líquidos ou sólidos.', icon: 'Baby' },
          { label: 'Pegadinha água/chá', detail: 'Água, chás ou sucos invalidam exclusividade — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha leite misto', detail: 'Fórmula ou sólidos além do leite humano — letras B e C.', icon: 'XCircle' },
          {
            label: 'Pegadinha composição',
            detail: 'Cobra aleitamento exclusivo — não confundir com posição de parto ou expulsivo.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Somente leite humano — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'AM — OMS/MS',
        meta: slideMeta,
        content: 'ALEITAMENTO EXCLUSIVO',
        rows: [
          { label: 'Definição', value: 'Apenas leite humano — exceto medicações', badge: 'hot', emphasis: 'highlight' },
          { label: 'Colostro', value: 'Primeira semana pós-parto', badge: 'info' },
          { label: 'Transição', value: 'Segunda semana — leite de transição', badge: 'info' },
          { label: 'Maduro', value: 'A partir da segunda quinzena', badge: 'info' },
          { label: 'Não é', value: 'Água, chá, fórmula ou alimentos complementares', badge: 'warn' },
        ],
        footer_rule: 'Exclusivo = só leite humano → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Aleitamento materno exclusivo — para quem se destina.',
          'Eliminar A — água, chás ou sucos além do leite.',
          'Eliminar B — leite humano com fórmula.',
          'Eliminar C — sólidos e fórmula além do leite.',
          'Testar D — somente leite materno ou banco, exceto medicações.',
          'Marcar letra D.',
        ],
        footer_rule: 'Sem outros líquidos ou sólidos → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AM EXCLUSIVO',
        items: [
          { label: 'Letra A — água/chá', detail: 'Qualquer líquido além do leite rompe exclusividade.', correct: 'Somente leite humano — letra D.' },
          { label: 'Letra B — fórmula', detail: 'Misto não é exclusivo.', correct: 'Banco de leite permitido — gabarito D.' },
          { label: 'Letra C — sólidos', detail: 'Alimentação complementar vem após período exclusivo.', correct: 'Exclusivo até medicações — marcar D.' },
          { label: 'Pegadinha colostro', detail: 'Colostro faz parte do leite humano exclusivo.', correct: 'Definição OMS/MS — letra D.' },
        ],
        footer_rule: 'Exclusivo ≠ misto ou complementado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ms-sarmento-enfermagem-saude-da-mulher-1777104222222-1': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/WHO — DIU pós-parto: inserção pós-placentária na janela pós-parto precoce',
    sources: [PF_SOURCE],
    exam_vs_current: 'diu_janela_pos_parto_prova',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DIU — pós-parto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quando inserir DIU após o parto — janela pós-placentária.', icon: 'Target' },
          { label: 'Pós-placenta (E)', detail: 'Logo após dequitação até janela pós-parto precoce.', icon: 'Clock' },
          { label: 'Pegadinha 40 dias', detail: 'Esperar apenas após puerpério tardio — A incorreta na prova.', icon: 'AlertTriangle' },
          { label: 'Pegadinha puerpério curto', detail: 'Inserção tardia também possível — mas prova cobra janela precoce.', icon: 'Clock' },
        ],
        footer_rule: 'Inserção pós-placentária precoce — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'DIU — timing',
        meta: slideMeta,
        content: 'CONTRACEPÇÃO PÓS-PARTO',
        rows: [
          { label: 'Precoce', value: 'Após saída da placenta — janela pós-parto imediata', badge: 'hot', emphasis: 'highlight' },
          { label: 'Tardia', value: 'Após involução uterina — outra janela', badge: 'info' },
          { label: 'Não é', value: 'Somente após puerpério tardio ou toque isolado', badge: 'warn' },
        ],
        footer_rule: 'Janela pós-placentária → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'DIU após o parto — momento da inserção.',
          'Eliminar A — somente após puerpério tardio completo.',
          'Eliminar B — poucos dias sem critério de janela.',
          'Eliminar C — meses depois — janela tardia distinta.',
          'Eliminar D — duas semanas — não é a resposta da prova.',
          'Testar E — após placenta na janela pós-parto precoce.',
          'Marcar letra E.',
        ],
        footer_rule: 'Pós-placenta precoce → E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIU PÓS-PARTO',
        items: [
          { label: 'Letra A — 40 dias', detail: 'Inserção precoce é opção antes do puerpério tardio.', correct: 'Após placenta na janela precoce — letra E.' },
          { label: 'Letra B — 3 dias', detail: 'Prazo arbitrário sem base na prova.', correct: 'Janela pós-placentária — gabarito E.' },
          { label: 'Letra C — 3 meses', detail: 'Corresponde à janela tardia, não à precoce.', correct: 'Inserção pós-placentária — marcar E.' },
          { label: 'Letra D — 2 semanas', detail: 'Alternativa intermediária não é o gabarito.', correct: 'Saída da placenta — letra E.' },
        ],
        footer_rule: 'LARC no puerpério',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ms-sarmento-enfermagem-saude-da-mulher-1777104222222-2': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/COFEN — puerpério: enfermagem orienta lóquios, hemorragia e curativo de cesárea',
    sources: [AB32_SOURCE, OMS_PARTO_SOURCE],
    slides: buildPosPartoAtribuicoesSlides('A'),
    cleanInstruction: cleanPosPartoNoise,
  },

  'ms-sarmento-enfermagem-saude-da-mulher-1777104235003-8': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/COFEN — puerpério: enfermagem orienta lóquios, hemorragia e curativo de cesárea',
    sources: [AB32_SOURCE, OMS_PARTO_SOURCE],
    slides: buildPosPartoAtribuicoesSlides('B'),
    cleanInstruction: cleanPosPartoNoise,
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const { text_fragment: _drop, ...questionRest } = raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...questionRest, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g17] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g17] total=${ok}`);
}

main();
