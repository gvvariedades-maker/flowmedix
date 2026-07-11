#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g24 (8 slugs mulher_mama P0).
 *
 *   npm run handcraft:saude-da-mulher-g24
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g24 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g24';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const INCA_MAMA_SOURCE = {
  id: 'inca-rastreio-mama',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes para detecção precoce do câncer de mama no Brasil',
  year: 2015,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-para-deteccao-precoce-do-cancer-de-mama-no-brasil',
  covers: ['50-69 anos', 'mamografia bienal', 'autoexame complementar', 'início aos 50 anos'],
};

const OMS_AM_SOURCE = {
  id: 'oms-am-exclusiva',
  tier: 'A' as const,
  issuer: 'OMS / MS',
  title: 'Política Nacional de Aleitamento Materno',
  year: 2015,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/politica_nacional_de_aleitamento_materno.pdf',
  covers: ['aleitamento exclusivo', 'esvaziar mama', 'ocitocina', 'mastite', 'candidíase mamilar'],
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
  sources?: (typeof INCA_MAMA_SOURCE | typeof OMS_AM_SOURCE)[];
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
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'igeduc-enfermagem-saude-da-mulher-1777104432986-4': {
    family: 'certo_errado',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — amamentação: esvaziar uma mama antes da outra mantém produção láctea',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AM — dois seios',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Certo ou errado — oferecer dois seios; esvaziar uma mama antes da outra para manter produção do leite.',
            icon: 'Target',
          },
          { label: 'Certo (A)', detail: 'Esvaziamento completo estimula prolactina e produção.', icon: 'CheckCircle' },
          { label: 'Pegadinha mama', detail: 'Leite conforme demanda — técnica de alternância correta.', icon: 'Baby' },
          { label: 'Pegadinha puerperio', detail: 'Acompanhamento materno na lactação — 42º dia.', icon: 'Calendar' },
        ],
        footer_rule: 'Esvaziar uma mama — certo — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Técnica — mamada',
        meta: slideMeta,
        content: 'ALEITAMENTO',
        rows: [
          { label: 'Dois seios', value: 'Oferecer ambos conforme necessidade do bebê', badge: 'info' },
          { label: 'Esvaziamento', value: 'Esvaziar uma mama antes de oferecer a outra', badge: 'hot', emphasis: 'highlight' },
          { label: 'Produção', value: 'Estímulo adequado mantém lactogênese', badge: 'hot' },
          { label: 'Errado', value: 'Alternar sem esvaziar — reduz produção', badge: 'warn' },
        ],
        footer_rule: 'Produção láctea — certo — A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar item — técnica de amamentação.',
          'Analisar — dois seios conforme demanda.',
          'Analisar — esvaziar uma mama antes da outra.',
          'Conclusão — medida correta para manter produção.',
          'Marcar Certo — letra A.',
        ],
        footer_rule: 'Certo — esvaziamento mamário — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AM',
        items: [
          { label: 'Letra B — errado', detail: 'Afirmativa está correta segundo OMS/MS.', correct: 'Esvaziar uma mama — certo — letra A.' },
          { label: 'Pegadinha mama', detail: 'Produção conforme demanda e esvaziamento.', correct: 'Manter lactação — gabarito A.' },
          { label: 'Pegadinha puerperio', detail: 'Orientação na ação de saúde materno-infantil.', correct: 'Técnica correta — marcar A.' },
        ],
        footer_rule: 'Alternância com esvaziamento',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-semiologia-em-enfermagem-1779563491765-5': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — sinal de alerta mama: nódulo fixo, endurecido e geralmente indolor',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais — alerta',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ação de saúde — sinal de alerta do câncer de mama que exige investigação.', icon: 'Target' },
          { label: 'Nódulo (C)', detail: 'Fixo, indolor e endurecido — investigar.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Dor menstrual cíclica — fisiológica — B.', icon: 'Ban' },
          { label: 'Pegadinha autoexame', detail: 'Assimetria leve fisiológica — não alarme isolado — D.', icon: 'Hand' },
        ],
        footer_rule: 'Nódulo suspeito — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Alerta — mama',
        meta: slideMeta,
        content: 'INVESTIGAR',
        rows: [
          { label: 'Sinal', value: 'Nódulo fixo, endurecido, indolor', badge: 'hot', emphasis: 'highlight' },
          { label: 'Secreção', value: 'Unilateral espontânea suspeita — não purulenta bilateral', badge: 'info' },
          { label: 'Fisiológico', value: 'Dor pré-menstrual e assimetria leve', badge: 'warn' },
          { label: 'Conduta', value: 'Encaminhar avaliação clínica e exames', badge: 'info' },
        ],
        footer_rule: 'Semiótica mamária — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinal de alerta para câncer de mama.',
          'Eliminar A — secreção purulenta bilateral.',
          'Eliminar B — dor menstrual cíclica.',
          'Testar C — nódulo fixo, indolor e endurecido.',
          'Eliminar D — assimetria fisiológica leve.',
          'Marcar letra C.',
        ],
        footer_rule: 'Nódulo suspeito — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SINAIS',
        items: [
          { label: 'Letra A — purulenta', detail: 'Secreção bilateral infecciosa distinta.', correct: 'Nódulo endurecido — letra C.' },
          { label: 'Letra B — dor menstrual', detail: 'Mastalgia cíclica comum.', correct: 'Fixo e indolor — gabarito C.' },
          { label: 'Letra D — assimetria', detail: 'Variação anatômica leve.', correct: 'Investigar nódulo — marcar C.' },
          { label: 'Pegadinha mama', detail: 'Educação em saúde na comunidade.', correct: 'Sinal de alerta — letra C.' },
        ],
        footer_rule: 'INCA — detecção precoce',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'inaz-do-para-geral-saude-da-mulher-1777104347186-4': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — mastite puerperal: ordenha manual, registrar e comunicar enfermeiro; não prescrever antibiótico',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mastite — TE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Puérpera com mastite — dor calor rubor edema mama febre — conduta do técnico de enfermagem.',
            icon: 'Target',
          },
          { label: 'Ordenha (A)', detail: 'Ordenha manual, registrar queixa e comunicar enfermeiro.', icon: 'ClipboardList' },
          { label: 'Pegadinha mama', detail: 'Mastite — manter esvaziamento mamário.', icon: 'Droplet' },
          { label: 'Pegadinha puerperio', detail: 'Acompanhamento até 42º dia — não repouso absoluto isolado.', icon: 'Calendar' },
        ],
        footer_rule: 'Ordenha e registro — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Mastite — APS',
        meta: slideMeta,
        content: 'CONDUTA TE',
        rows: [
          { label: 'TE faz', value: 'Ordenha manual e registro da queixa', badge: 'hot', emphasis: 'highlight' },
          { label: 'Comunicar', value: 'Enfermeiro avalia e prescreve se necessário', badge: 'hot' },
          { label: 'Não é TE', value: 'Antibioticoterapia sem prescrição', badge: 'warn' },
          { label: 'AM', value: 'Manter esvaziamento — não suspender de rotina', badge: 'info' },
        ],
        footer_rule: 'Auxílio ao cuidado — A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Mastite puerperal — atribuição do técnico.',
          'Testar A — ordenha manual e registro para avaliação do enfermeiro.',
          'Eliminar B — antibioticoterapia pelo técnico.',
          'Eliminar C — compressas sem comunicar equipe.',
          'Eliminar D — sutiã apertado sem registro.',
          'Eliminar E — repouso absoluto sem orientação.',
          'Marcar letra A.',
        ],
        footer_rule: 'Registrar e comunicar — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MASTITE',
        items: [
          { label: 'Letra B — antibiótico', detail: 'Prescrição médica/enfermeira.', correct: 'Ordenha e registro — letra A.' },
          { label: 'Letra C — compressas', detail: 'Ocultar quadro da equipe.', correct: 'Comunicar enfermeiro — gabarito A.' },
          { label: 'Letra D — sutiã', detail: 'Sem documentação assistencial.', correct: 'Auxílio puerperal — marcar A.' },
          { label: 'Letra E — repouso', detail: 'Conduta sem avaliação profissional.', correct: 'Ordenha manual — letra A.' },
          {
            label: 'Pegadinha puerperio',
            detail: 'Acompanhamento materno até o 42º dia — mastite puerperal.',
            correct: 'Registrar e comunicar enfermeiro — gabarito A.',
          },
        ],
        footer_rule: 'Escopo do técnico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104235003-2': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — rastreio mama 50–69 bienal; autoexame como conscientização complementar',
    exam_vs_current:
      'Prova (D): autoexame não provou benefício e não deve ser orientado; INCA atual: conscientização complementar — mamografia é rastreio populacional.',
    roi_error: 'mama_autoexame_substituto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção — mama',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Câncer de mama mundo países desenvolvidos Brasil população feminina incidência morbidade falhas abordagem diagnóstico tratamento sobrevida cinco anos prevenção detecção precoce.',
            icon: 'Target',
          },
          { label: 'Autoexame (D)', detail: 'Gabarito da prova — não substitui rastreio organizado.', icon: 'CheckCircle' },
          { label: 'Pegadinha anual', detail: 'Rastreio bienal 50–69 — não anual — A.', icon: 'Clock' },
          { label: 'Pegadinha inicio 40', detail: 'Faixa populacional 50–69 — não 40–69 — C.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Gabarito prova — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio — referência',
        meta: slideMeta,
        content: 'MAMA — SUS',
        rows: [
          { label: 'Prova', value: 'Autoexame sem benefício comprovado no rastreio organizado', badge: 'hot', emphasis: 'highlight' },
          { label: 'Sobrevida', value: 'Países desenvolvidos versus Brasil — detecção oportuna', badge: 'info' },
          { label: 'INCA/SUS', value: 'Mamografia bienal 50–69 anos', badge: 'info' },
          { label: 'Modificáveis', value: 'Tabagismo, inatividade, excesso de peso', badge: 'info' },
          { label: 'Não modificável', value: 'História familiar — B incorreta', badge: 'warn' },
        ],
        footer_rule: 'Marcar D na prova · INCA bienal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Prevenção e detecção precoce do câncer de mama.',
          'Eliminar A — mamografia anual 50–69.',
          'Eliminar B — história familiar como modificável.',
          'Eliminar C — mamografia bienal 40–69.',
          'Testar D — autoexame sem benefício comprovado na prova.',
          'Marcar letra D.',
        ],
        footer_rule: 'Gabarito banca — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RASTREIO',
        items: [
          { label: 'Letra A — anual', detail: 'Periodicidade bienal no SUS.', correct: 'Autoexame na prova — letra D.' },
          { label: 'Letra B — familiar', detail: 'Fator não modificável.', correct: 'Detecção precoce — gabarito D.' },
          { label: 'Letra C — 40-69', detail: 'Início aos 50 anos populacional.', correct: 'Afirmativa D — marcar D.' },
          { label: 'Pegadinha mama', detail: 'Sobrevida menor no Brasil — INCA.', correct: 'Alternativa correta — letra D.' },
        ],
        footer_rule: 'exam_vs_current documentado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'nc-ufpr-funpar-enfermagem-saude-da-mulher-1777104235003-0': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — lactação: ocitocina e vínculo afetivo estimulam ejeção do leite',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AM — ocitocina',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cuidado puerperal binômio mãe-bebê — orientação correta sobre aleitamento materno OMS MS Brasil.',
            icon: 'Target',
          },
          { label: 'Ocitocina (B)', detail: 'Confiança e tranquilidade estimulam liberação do leite.', icon: 'Heart' },
          { label: 'Pegadinha mama', detail: 'Composição do leite varia na mamada — A falsa.', icon: 'Droplet' },
          { label: 'Pegadinha puerperio', detail: 'Pega correta não é instintiva automática — D falsa.', icon: 'Baby' },
        ],
        footer_rule: 'Vínculo e ocitocina — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Lactação — fatores',
        meta: slideMeta,
        content: 'ALEITAMENTO',
        rows: [
          { label: 'Ocitocina', value: 'Tranquilidade e confiança favorecem ejeção', badge: 'hot', emphasis: 'highlight' },
          { label: 'Composição', value: 'Leite fore/mead muda na mamada', badge: 'info' },
          { label: 'Pega', value: 'Técnica deve ser ensinada — não só instinto', badge: 'warn' },
          { label: 'Não é', value: 'Só líquidos aumentam produção — C falsa', badge: 'warn' },
        ],
        footer_rule: 'Apoio emocional — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Orientação correta sobre aleitamento materno.',
          'Eliminar A — composição inalterada na mamada.',
          'Testar B — sentimentos estimulam ocitocina e liberação do leite.',
          'Eliminar C — só líquidos para baixa produção.',
          'Eliminar D — sucção instintiva suficiente.',
          'Eliminar E — mamadeira nas primeiras horas.',
          'Marcar letra B.',
        ],
        footer_rule: 'Reflexo de ejeção — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AM',
        items: [
          { label: 'Letra A — composição', detail: 'Leite inicial e final diferem.', correct: 'Ocitocina e vínculo — letra B.' },
          { label: 'Letra C — líquidos', detail: 'Não é conduta principal.', correct: 'Liberação do leite — gabarito B.' },
          { label: 'Letra D — instinto', detail: 'Pega inadequada lesiona mamilo.', correct: 'Tranquilidade materna — marcar B.' },
          { label: 'Letra E — mamadeira', detail: 'Priorizar pele a pele e seio.', correct: 'Orientação OMS — letra B.' },
          {
            label: 'Pegadinha puerperio',
            detail: 'Cuidado puerperal binômio mãe-bebê — pega deve ser ensinada.',
            correct: 'Ocitocina e tranquilidade — gabarito B.',
          },
        ],
        footer_rule: 'Saúde da mulher e criança',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-saude-da-mulher-1777104301763-6': {
    family: 'vf',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — câncer mama: ductal infiltrativo comum; Paget e inflamatório raros; QSE mais frequente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Histologia — mama',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Câncer de mama hereditário — itens I a III sobre histologia, formas raras e semiologia.',
            icon: 'Target',
          },
          { label: 'I e II (C)', detail: 'Ductal infiltrativo e formas raras corretos.', icon: 'CheckCircle' },
          { label: 'Pegadinha mama', detail: 'Item III falso — quadrante superior externo, não inferior.', icon: 'AlertTriangle' },
          { label: 'Pegadinha autoexame', detail: 'Lesões indolores fixas endurecidas — parte do item III correta.', icon: 'Search' },
        ],
        footer_rule: 'III falso — localização — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgamento — I a III',
        meta: slideMeta,
        content: 'CÂNCER DE MAMA',
        rows: [
          { label: 'I', value: 'Ductal infiltrativo — tipo mais comum — V', badge: 'hot', emphasis: 'highlight' },
          { label: 'II', value: 'Carcinoma inflamatório e Paget — raros — V', badge: 'hot' },
          { label: 'III', value: 'Quadrante inferior externo — F (é QSE)', badge: 'warn' },
        ],
        footer_rule: 'Ductal + raros — QSE — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Câncer de mama — julgar itens I a III.',
          'Julgar I — ductal infiltrativo mais comum → verdadeiro.',
          'Julgar II — Paget e inflamatório menos comuns → verdadeiro.',
          'Julgar III — quadrante inferior externo como mais frequente → falso.',
          'Combinação somente I e II.',
          'Marcar letra C.',
        ],
        footer_rule: 'QSE — não QIE — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VF',
        items: [
          { label: 'Letra A — só I', detail: 'Omite II verdadeiro.', correct: 'I e II — letra C.' },
          { label: 'Letra B — só II', detail: 'Omite I verdadeiro.', correct: 'Histologia ductal — gabarito C.' },
          { label: 'Letra D — todos', detail: 'III é falso.', correct: 'Localização QSE — marcar C.' },
          { label: 'Pegadinha mama', detail: 'Hereditário cerca de cinco a dez por cento.', correct: 'Itens I e II — letra C.' },
        ],
        footer_rule: 'Anatomia do tumor',
      },
    ],
    cleanInstruction: cleanRomanItems,
  },

  'objetiva-concursos-enfermagem-saude-da-mulher-1777104301763-8': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — candidíase mamilar puerperal: prurido, queimação e dor pós-mamada — Candida sp.',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Candidíase — mamilo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Infecção fúngica puerperal — coceira queimação dor em agulhadas nos mamilos após mamadas.',
            icon: 'Target',
          },
          { label: 'Candida (B)', detail: 'Fungo — prurido e dor persistente pós-mamada.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Mastite bacteriana — calor rubor febre — distinta.', icon: 'Thermometer' },
          { label: 'Pegadinha puerperio', detail: 'Tratar parceiro e persistência da amamentação com orientação.', icon: 'Calendar' },
        ],
        footer_rule: 'Candida sp. — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Micose — mamilar',
        meta: slideMeta,
        content: 'CANDIDÍASE',
        rows: [
          { label: 'Agente', value: 'Candida sp. — fungo', badge: 'hot', emphasis: 'highlight' },
          { label: 'Sinais', value: 'Coceira, queimação, dor em agulhadas', badge: 'hot' },
          { label: 'Momento', value: 'Persiste após as mamadas', badge: 'info' },
          { label: 'Não é', value: 'Enterococcus, Lactobacillus ou Mycoplasma', badge: 'warn' },
        ],
        footer_rule: 'Infecção fúngica — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Infecção fúngica mamilar no puerpério.',
          'Eliminar A — Enterococcus.',
          'Testar B — Candida sp.',
          'Eliminar C — Lactobacillus.',
          'Eliminar D — Mycoplasma.',
          'Marcar letra B.',
        ],
        footer_rule: 'Prurido pós-mamada — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FUNGO',
        items: [
          { label: 'Letra A — enterococcus', detail: 'Bactéria — não fungo.', correct: 'Candida sp. — letra B.' },
          { label: 'Letra C — lactobacillus', detail: 'Flora comensal distinta.', correct: 'Micose mamilar — gabarito B.' },
          { label: 'Letra D — mycoplasma', detail: 'Não causa quadro típico de mamilo.', correct: 'Queimação pós-mamada — marcar B.' },
          { label: 'Pegadinha mama', detail: 'Comum no puerpério lactante.', correct: 'Agente fúngico — letra B.' },
        ],
        footer_rule: 'Diagnóstico clínico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'quadrix-enfermagem-saude-da-mulher-1777104408379-2': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — autoexame complementar; não substitui exame clínico nem mamografia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Autoexame — papel',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Autoexame das mamas — orientação correta às mulheres.', icon: 'Target' },
          { label: 'Complementar (A)', detail: 'Não substitui exames clínicos de rotina.', icon: 'Hand' },
          { label: 'Pegadinha autoexame', detail: 'Uma semana após menstruação — não durante o período menstrual.', icon: 'Calendar' },
          { label: 'Pegadinha mama', detail: 'História familiar altera vigilância e frequência dos exames — E falsa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Não substitui clínica — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Autoexame — INCA',
        meta: slideMeta,
        content: 'PAPEL DO AUTOEXAME',
        rows: [
          { label: 'Função', value: 'Conscientização — não substitui clínica', badge: 'hot', emphasis: 'highlight' },
          { label: 'Rastreio', value: 'Mamografia bienal 50–69 anos', badge: 'hot' },
          { label: 'Momento', value: 'Preferir após menstruação — não no fluxo', badge: 'info' },
          { label: 'Família', value: 'História familiar aumenta vigilância', badge: 'warn' },
        ],
        footer_rule: 'Complementar ao rastreio — A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Autoexame das mamas — afirmativa correta.',
          'Testar A — não substitui exames clínicos de rotina.',
          'Eliminar B — simetria absoluta.',
          'Eliminar C — indicado durante menstruação.',
          'Eliminar D — dor normal no autoexame.',
          'Eliminar E — hereditariedade não interfere.',
          'Marcar letra A.',
        ],
        footer_rule: 'Papel complementar — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AUTOEXAME',
        items: [
          { label: 'Letra B — simetria', detail: 'Assimetria leve pode ser normal.', correct: 'Não substitui clínica — letra A.' },
          { label: 'Letra C — menstrual', detail: 'Melhor após o período.', correct: 'Complementar — gabarito A.' },
          { label: 'Letra D — dor', detail: 'Dor persistente é sinal de alerta.', correct: 'Exame clínico — marcar A.' },
          { label: 'Letra E — hereditariedade', detail: 'Alto risco exige mais vigilância.', correct: 'Rotina clínica — letra A.' },
          {
            label: 'Pegadinha autoexame',
            detail: 'Uma semana após menstruação — não durante o período menstrual.',
            correct: 'Não substitui exame clínico de rotina — letra A.',
          },
          {
            label: 'Pegadinha mama',
            detail: 'História familiar altera vigilância e frequência dos exames.',
            correct: 'Complementar à mamografia — gabarito A.',
          },
        ],
        footer_rule: 'Mamografia é padrão populacional',
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
    console.log(`[handcraft:sm-g24] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g24] total=${ok}`);
}

main();
