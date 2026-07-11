#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g23 (8 slugs mulher_mama P0).
 *
 *   npm run handcraft:saude-da-mulher-g23
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g23 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g23';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const INCA_MAMA_SOURCE = {
  id: 'inca-rastreio-mama',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes para detecção precoce do câncer de mama no Brasil',
  year: 2015,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-para-deteccao-precoce-do-cancer-de-mama-no-brasil',
  covers: ['50-69 anos', 'mamografia bienal', 'início aos 50 anos', 'autoexame complementar'],
};

const OMS_AM_SOURCE = {
  id: 'oms-am-exclusiva',
  tier: 'A' as const,
  issuer: 'OMS / MS',
  title: 'Política Nacional de Aleitamento Materno',
  year: 2015,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/politica_nacional_de_aleitamento_materno.pdf',
  covers: ['aleitamento exclusivo', 'pega correta', 'ingurgitamento mamário', 'apojadura'],
};

const MS_HIV_SOURCE = {
  id: 'ms-hiv-vertical',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo Clínico HIV/AIDS — prevenção transmissão vertical',
  year: 2022,
  url: 'https://www.gov.br/aids/',
  covers: ['puérpera HIV', 'inibição lactação', 'cabergolina', 'não amamentar'],
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto' | 'mulher_papanicolau' | 'mulher_mama';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof INCA_MAMA_SOURCE | typeof OMS_AM_SOURCE | typeof MS_HIV_SOURCE)[];
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
    sources: pack.sources ?? [INCA_MAMA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\(__\)/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRomanItems(s: string): string {
  return s
    .replace(/\nI\./g, '\nI -')
    .replace(/\nII\./g, '\nII -')
    .replace(/\nIII\./g, '\nIII -')
    .replace(/\nIV\./g, '\nIV -')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'fundatec-enfermagem-saude-da-mulher-1777104389226-5': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — lactogênese: apojadura é a descida do leite; colostro é o primeiro leite',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lactação — termos',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Termos técnicos de enfermagem — informações consistentes e compreensíveis — descida do leite na lactação.', icon: 'Target' },
          { label: 'Apojadura (D)', detail: 'Descida do leite — lactogênese II.', icon: 'Droplet' },
          { label: 'Pegadinha colostro', detail: 'Primeiro leite — não é a descida — A.', icon: 'Baby' },
          { label: 'Pegadinha mastite', detail: 'Infecção mamária — não sinonimo de descida — E.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Descida do leite = apojadura — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Terminologia — mama',
        meta: slideMeta,
        content: 'LACTAÇÃO',
        rows: [
          { label: 'Colostro', value: 'Primeiro leite — rico em imunidade', badge: 'info' },
          { label: 'Apojadura', value: 'Descida do leite — lactogênese II', badge: 'hot', emphasis: 'highlight' },
          { label: 'Pega', value: 'Técnica de amamentação no mamilo', badge: 'info' },
          { label: 'Mastite', value: 'Inflamação/infeção mamária', badge: 'warn' },
        ],
        footer_rule: 'Apojadura → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Descida do leite — termo técnico.',
          'Eliminar A — colostro (primeiro leite).',
          'Eliminar B — amamentação (ato geral).',
          'Eliminar C — pega da mama (técnica).',
          'Testar D — apojadura.',
          'Eliminar E — mastite (patologia).',
          'Marcar letra D.',
        ],
        footer_rule: 'Lactogênese II — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TERMOS',
        items: [
          { label: 'Letra A — colostro', detail: 'Secreção inicial pós-parto.', correct: 'Descida do leite — letra D.' },
          { label: 'Letra B — amamentação', detail: 'Processo global de nutrição.', correct: 'Apojadura — gabarito D.' },
          { label: 'Letra C — pega', detail: 'Posicionamento do bebê.', correct: 'Lactogênese II — marcar D.' },
          { label: 'Letra E — mastite', detail: 'Complicação inflamatória.', correct: 'Termo da descida — letra D.' },
        ],
        footer_rule: 'Vocabulário técnico da lactação',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funtef-enfermagem-semiologia-em-enfermagem-1779563517223-5': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — sinais suspeitos mama: nódulo irregular, pele em casca de laranja, secreção — mamografia urgente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso — suspeita',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Triagem — nódulo irregular mama esquerda pele casca de laranja secreção mamilar escura fétida — conduta técnico enfermagem.',
            icon: 'Target',
          },
          { label: 'Mamografia urgente (A)', detail: 'Agendar exame e comunicar médico e enfermeiro.', icon: 'Scan' },
          { label: 'Pegadinha mama', detail: 'Peau d orange — carcinoma inflamatório — não aguardar.', icon: 'AlertTriangle' },
          { label: 'Pegadinha autoexame', detail: 'Sintomática investiga — não retorno em um mês — D.', icon: 'Ban' },
        ],
        footer_rule: 'Suspeita clínica — mamografia urgente — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Conduta — APS',
        meta: slideMeta,
        content: 'SINAIS DE ALERTA',
        rows: [
          { label: 'Sinais', value: 'Nódulo irregular, peau d orange, secreção fétida', badge: 'hot', emphasis: 'highlight' },
          { label: 'TE faz', value: 'Agendar mamografia urgente e acionar equipe', badge: 'hot' },
          { label: 'Não é', value: 'Internar sem avaliação ou aguardar um mês', badge: 'warn' },
          { label: 'Sigilo', value: 'Não comunicar diagnóstico sem confirmação', badge: 'info' },
        ],
        footer_rule: 'Referência diagnóstica — A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Achados suspeitos de câncer de mama na triagem.',
          'Testar A — agendar mamografia com urgência e avisar médico e enfermeira.',
          'Eliminar B — internação imediata sem investigação organizada.',
          'Eliminar C — informar câncer à família sem diagnóstico.',
          'Eliminar D — retorno em um mês.',
          'Marcar letra A.',
        ],
        footer_rule: 'Encaminhar investigação — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SEMIOLOGIA',
        items: [
          { label: 'Letra B — internar', detail: 'Investigação ambulatorial primeiro.', correct: 'Mamografia urgente — letra A.' },
          { label: 'Letra C — família', detail: 'Viola sigilo e antecipa diagnóstico.', correct: 'Acionar equipe — gabarito A.' },
          { label: 'Letra D — um mês', detail: 'Sinais de alarme exigem prontidão.', correct: 'Agendar exame — marcar A.' },
          { label: 'Pegadinha mama', detail: 'Secreção fétida e nódulo irregular.', correct: 'Conduta técnica — letra A.' },
        ],
        footer_rule: 'INCA — investigação precoce',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'iaupe-enfermagem-saude-da-mulher-1777104288275-2': {
    family: 'vf',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — rastreio mama: 50–69 anos bienal; assintomáticas; sintomáticas → diagnóstico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mamografia — SUS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Câncer de mama morbidade mortalidade Brasil detecção precoce SUS — afirmativas I a IV rastreamento mamografia população-alvo assintomáticas.',
            icon: 'Target',
          },
          { label: 'III e IV (D)', detail: 'Bienal na população-alvo e rastreio em assintomáticas.', icon: 'CheckCircle' },
          { label: 'Pegadinha inicio 40', detail: 'Item II falso — faixa 50–69, não 25–64.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Item I falso — sintomáticas vão à investigação diagnóstica.', icon: 'Scan' },
        ],
        footer_rule: 'I e II falsas — III e IV corretas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgamento — I a IV',
        meta: slideMeta,
        content: 'RASTREIO SUS',
        rows: [
          { label: 'I', value: 'Sintomáticas — investigação diagnóstica, não rastreio universal — F', badge: 'warn' },
          { label: 'II', value: 'Faixa 25–64 — F (populacional 50–69)', badge: 'warn' },
          { label: 'III', value: 'Mamografia bienal na população-alvo — V', badge: 'hot', emphasis: 'highlight' },
          { label: 'IV', value: 'Exames sistemáticos em assintomáticas — V', badge: 'hot' },
        ],
        footer_rule: 'III + IV → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Rastreamento câncer de mama — julgar afirmativas I a IV.',
          'Julgar I — sintomáticas e rastreio universal → falso.',
          'Julgar II — faixa 25–64 prioritária → falso.',
          'Julgar III — mamografia bienal na população-alvo → verdadeiro.',
          'Julgar IV — rastreio em assintomáticas → verdadeiro.',
          'Combinação III e IV.',
          'Marcar letra D.',
        ],
        footer_rule: 'Assintomáticas 50–69 bienal — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VF SUS',
        items: [
          { label: 'Letra A — II e IV', detail: 'II é falsa.', correct: 'Bienal populacional — letra D.' },
          { label: 'Letra B — I II IV', detail: 'I e II falsas.', correct: 'III e IV — gabarito D.' },
          { label: 'Letra C — I e III', detail: 'I é falsa.', correct: 'Assintomáticas — marcar D.' },
          { label: 'Letra E — I II III', detail: 'Omite IV verdadeira.', correct: 'Combinação III+IV — letra D.' },
        ],
        footer_rule: 'Distinguir rastreio de diagnóstico',
      },
    ],
    cleanInstruction: cleanRomanItems,
  },

  'iaupe-enfermagem-saude-da-mulher-1777104424950-5': {
    family: 'vf',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — técnica de amamentação: pega adequada; sinais de má pega; aleitamento predominante',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AM — proposições',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Aleitamento materno — proposições I a III sobre técnica e tipos de AM.', icon: 'Target' },
          { label: 'II e III (C)', detail: 'Pega adequada e sinais de técnica inadequada.', icon: 'CheckCircle' },
          { label: 'Pegadinha predominante', detail: 'Item I falso — define errado aleitamento predominante.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Má pega reduz esvaziamento e produção — item II.', icon: 'Baby' },
        ],
        footer_rule: 'I falsa — II e III corretas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgamento — I a III',
        meta: slideMeta,
        content: 'AM — V / F',
        rows: [
          { label: 'I', value: 'Definição de predominante incorreta — F', badge: 'warn' },
          { label: 'II', value: 'Reconhecer técnica e má pega — V', badge: 'hot', emphasis: 'highlight' },
          { label: 'III', value: 'Bochechas encovadas, mamilo traumatizado, dor — V', badge: 'hot' },
        ],
        footer_rule: 'II + III → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Aleitamento materno — julgar proposições I a III.',
          'Julgar I — definição de aleitamento predominante → falso.',
          'Julgar II — técnica adequada e esvaziamento → verdadeiro.',
          'Julgar III — sinais de técnica inadequada → verdadeiro.',
          'Combinação II e III.',
          'Marcar letra C.',
        ],
        footer_rule: 'Pega e sinais clínicos — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AM',
        items: [
          { label: 'Letra A — I e II', detail: 'I é falsa.', correct: 'Aleitamento predominante incorreto — letra C.' },
          { label: 'Letra B — I e III', detail: 'I é falsa.', correct: 'Técnica e sinais de má pega — gabarito C.' },
          { label: 'Letra D — só I', detail: 'Proposição incorreta.', correct: 'Bochechas encovadas e dor — marcar C.' },
          { label: 'Letra E — só II', detail: 'Omite III verdadeira.', correct: 'Proposições II e III — letra C.' },
          {
            label: 'Pegadinha predominante',
            detail: 'Item I define errado o aleitamento predominante.',
            correct: 'Combinação correta II+III — escolher C.',
          },
        ],
        footer_rule: 'Tipos e técnica de AM',
      },
    ],
    cleanInstruction: cleanRomanItems,
  },

  'idecan-enfermagem-saude-da-mulher-1778712437306-4': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'MS/PN HIV — puérpera HIV: não amamentar; inibição farmacológica da lactação com cabergolina protocolo',
    sources: [MS_HIV_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HIV — puérpera',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Puérpera vivendo com HIV — não amamentar — inibição da lactação.', icon: 'Target' },
          { label: 'Cabergolina (C)', detail: 'Esquema da prova — dose única e reforço pré-alta.', icon: 'Pill' },
          { label: 'Pegadinha mama', detail: 'Amamentação contraindicada — evitar lactação.', icon: 'Ban' },
          { label: 'Pegadinha enfaixamento', detail: 'Inibidor farmacológico — não enfaixamento obrigatório — A.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Protocolo cabergolina — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Inibição — lactação',
        meta: slideMeta,
        content: 'HIV PUERPERAL',
        rows: [
          { label: 'Conduta', value: 'Não amamentar — inibir lactação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Fármaco', value: 'Cabergolina conforme protocolo MS da prova', badge: 'hot' },
          { label: 'Não é', value: 'Enfaixamento obrigatório com inibidor', badge: 'warn' },
          { label: 'Objetivo', value: 'Prevenir transmissão vertical do HIV', badge: 'info' },
        ],
        footer_rule: 'Esquema letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Puérpera HIV — inibição farmacológica da lactação.',
          'Eliminar A — enfaixamento obrigatório com inibidor.',
          'Eliminar B — esquema com dose total superior ao protocolo.',
          'Testar C — cabergolina conforme alternativa da prova.',
          'Eliminar D — dose excessiva no esquema.',
          'Marcar letra C.',
        ],
        footer_rule: 'Protocolo MS HIV — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIV',
        items: [
          { label: 'Letra A — enfaixamento', detail: 'Não é conduta obrigatória isolada.', correct: 'Cabergolina protocolo — letra C.' },
          { label: 'Letra B — dose alta', detail: 'Esquema superior ao gabarito.', correct: 'Inibição farmacológica — gabarito C.' },
          { label: 'Letra D — dose excessiva', detail: 'Posologia inadequada.', correct: 'Puérpera HIV — marcar C.' },
          { label: 'Pegadinha mama', detail: 'Lactação contraindicada no HIV.', correct: 'Esquema da prova — letra C.' },
        ],
        footer_rule: 'Prevenção vertical',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067036141-0': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — câncer de mama: apresentação clínica comum é nódulo; autoexame complementar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Autoexame — clínica',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Autoexame mensal pós-menstruação — apresentação clínica usual do câncer de mama.', icon: 'Target' },
          { label: 'Nódulo (C)', detail: 'Massa palpável — manifestação mais frequente.', icon: 'Search' },
          { label: 'Pegadinha autoexame', detail: 'Autoexame complementa — mamografia no rastreio 50–69.', icon: 'Hand' },
          { label: 'Pegadinha mama', detail: 'Ferida ou infecção isolada — não padrão típico — A e D.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Nódulo palpável — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Apresentação — mama',
        meta: slideMeta,
        content: 'MANIFESTAÇÃO',
        rows: [
          { label: 'Comum', value: 'Nódulo ou massa na mama', badge: 'hot', emphasis: 'highlight' },
          { label: 'Autoexame', value: 'Mensal — semana após menstruação', badge: 'info' },
          { label: 'Rastreio', value: 'Mamografia bienal 50–69 anos', badge: 'info' },
          { label: 'Não é', value: 'Ferida, alergia ou infecção como padrão único', badge: 'warn' },
        ],
        footer_rule: 'Nódulo palpável típico — letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Apresentação clínica usual do câncer de mama.',
          'Eliminar A — ferida.',
          'Eliminar B — alergia.',
          'Testar C — nódulo.',
          'Eliminar D — infecção.',
          'Marcar letra C.',
        ],
        footer_rule: 'Massa palpável — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLÍNICA',
        items: [
          { label: 'Letra A — ferida', detail: 'Úlcera não é forma mais comum inicial.', correct: 'Massa tumoral palpável — letra C.' },
          { label: 'Letra B — alergia', detail: 'Não é etiologia neoplásica mamária.', correct: 'Nódulo endurecido — gabarito C.' },
          { label: 'Letra D — infecção', detail: 'Mastite distinta de carcinoma.', correct: 'Apresentação clínica usual — marcar C.' },
          { label: 'Pegadinha mama', detail: 'Autoexame mensal pós-menstruação.', correct: 'Manifestação típica nódulo — letra C.' },
        ],
        footer_rule: 'Palpação e rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idesg-enfermagem-saude-da-mulher-1777104335102-0': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — mamografia rastreio: mulheres 50–69 anos, bienal; sintomáticas investigam',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'MS — mamografia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Câncer de mama — fatores de risco, sintomas e rastreamento mamográfico SUS.', icon: 'Target' },
          { label: '50-69 bienal (C)', detail: 'MS recomenda rastreio bienal em assintomáticas.', icon: 'Calendar' },
          { label: 'Pegadinha inicio 40', detail: 'Início populacional aos 50 — não 40 universal.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Nódulo nem sempre doloroso — B falsa.', icon: 'Search' },
        ],
        footer_rule: 'Rastreio 50–69 bienal — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'INCA — referência',
        meta: slideMeta,
        content: 'RASTREIO MS',
        rows: [
          { label: 'Faixa', value: '50 a 69 anos — assintomáticas', badge: 'hot', emphasis: 'highlight' },
          { label: 'Periodicidade', value: 'Bienal — a cada dois anos', badge: 'hot' },
          { label: 'Sintomas', value: 'Nódulo pode ser indolor', badge: 'info' },
          { label: 'Diagnóstico', value: 'Investiga lesão suspeita — qualquer idade', badge: 'info' },
          { label: 'Não é', value: 'Menopausa precoce como risco — A falsa', badge: 'warn' },
        ],
        footer_rule: 'Política SUS → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Câncer de mama — alternativa correta.',
          'Eliminar A — menopausa precoce como risco listado.',
          'Eliminar B — dor mamária sempre presente.',
          'Testar C — mamografia 50–69 anos bienal no rastreio.',
          'Eliminar D — mamografia diagnóstica só 50–69.',
          'Marcar letra C.',
        ],
        footer_rule: 'Programa nacional — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RASTREIO',
        items: [
          { label: 'Letra A — riscos', detail: 'Menopausa tardia é fator de risco.', correct: '50–69 bienal — letra C.' },
          { label: 'Letra B — dor', detail: 'Muitos tumores são indolores.', correct: 'Rastreio SUS — gabarito C.' },
          { label: 'Letra D — diagnóstico', detail: 'Sintomáticas investigam fora da faixa.', correct: 'Assintomáticas — marcar C.' },
          { label: 'Pegadinha mama', detail: 'Tumor com potencial de invasão.', correct: 'Mamografia bienal — letra C.' },
        ],
        footer_rule: 'INCA/MS — detecção precoce',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-saude-da-mulher-1778934944659-3': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — ingurgitamento mamário: esvaziar mamas; não suspender AM por fissura isolada',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ACS — lactação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'ACS — educação em aleitamento materno — complicações mamárias na nutriz.', icon: 'Target' },
          { label: 'Ingurgitamento (C)', detail: 'Excesso de leite e esvaziamento deficiente — orientar esvaziar.', icon: 'Droplet' },
          { label: 'Pegadinha fissura', detail: 'Fissura — corrigir pega, não suspender AM — B falsa.', icon: 'Ban' },
          { label: 'Pegadinha puerperio', detail: 'Puérpera ingurgitada pode ter febre — acompanhamento até 42º dia.', icon: 'Calendar' },
        ],
        footer_rule: 'Esvaziar mamas — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Complicações — AM',
        meta: slideMeta,
        content: 'INGURGITAMENTO',
        rows: [
          { label: 'Quadro', value: 'Excesso lácteo e/ou esvaziamento deficiente', badge: 'hot', emphasis: 'highlight' },
          { label: 'Sinais', value: 'Mamas tensas, dor, possível febre', badge: 'hot' },
          { label: 'Conduta', value: 'Esvaziar mamas e manter amamentação', badge: 'info' },
          { label: 'Fissura', value: 'Pega incorreta — não suspender de rotina', badge: 'warn' },
        ],
        footer_rule: 'Ingurgitamento → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'ACS — item correto sobre amamentação.',
          'Eliminar A — atenção continuada (correta, mas não é o gabarito).',
          'Eliminar B — suspender AM por fissura.',
          'Testar C — ingurgitamento e esvaziamento das mamas.',
          'Eliminar D — negar febre no ingurgitamento.',
          'Marcar letra C.',
        ],
        footer_rule: 'Orientação ACS — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACS',
        items: [
          { label: 'Letra A — atenção', detail: 'Conduta correta de vigilância.', correct: 'Ingurgitamento — letra C.' },
          { label: 'Letra B — fissura', detail: 'Suspender AM agrava o quadro.', correct: 'Esvaziar mamas — gabarito C.' },
          { label: 'Letra D — febre', detail: 'Pode haver febre no ingurgitamento.', correct: 'Esvaziamento mamário — letra C.' },
          {
            label: 'Pegadinha puerperio',
            detail: 'Puérpera com mamas ingurgitadas — acompanhamento materno.',
            correct: 'Orientar esvaziar mamas — gabarito C.',
          },
        ],
        footer_rule: 'Manter aleitamento',
      },
    ],
    cleanInstruction: cleanPdfNoise,
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
    console.log(`[handcraft:sm-g23] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g23] total=${ok}`);
}

main();
