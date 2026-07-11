#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g19 (8 slugs papanicolau P0).
 *
 *   npm run handcraft:saude-da-mulher-g19
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g19 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g19';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const INCA_SOURCE = {
  id: 'inca-rastreio-colo',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes para o rastreamento do câncer do colo do útero',
  year: 2016,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-para-o-rastreamento-do-cancer-do-colo-do-utero',
  covers: ['25-64 anos', 'citologia trienal', 'dois exames anuais normais', 'Papanicolau', 'HPV'],
};

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['anemia gestacional', 'pré-natal', 'saúde da mulher'],
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto' | 'mulher_papanicolau';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof INCA_SOURCE | typeof AB32_SOURCE)[];
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
    sources: pack.sources ?? [INCA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\nIl\./g, '\nII -')
    .replace(/\bl e IV\b/gi, 'I e IV')
    .replace(/\bll\b/g, 'II')
    .replace(/\bIll\b/g, 'III')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildFaixaEtariaSlides() {
  return [
    {
      type: 'concept_map',
      slide_title: 'Faixa etária — citologia',
      meta: slideMeta,
      items: [
        {
          label: 'Comando',
          detail:
            'Citopatologia do colo — triênio 2023-2025, casos novos, DNA-HPV, prevenção e faixa 25 a 64 anos.',
          icon: 'Target',
        },
        { label: '25–64 (A)', detail: 'Faixa etária recomendada pelo MS/INCA para rastreio citológico.', icon: 'Calendar' },
        { label: 'Pegadinha início 40', detail: 'Não inicia aos 18 ou 12 anos — marco aos 25 anos.', icon: 'AlertTriangle' },
        { label: 'Pegadinha vacina HPV', detail: 'Vacina não dispensa citologia na faixa de rastreio.', icon: 'Syringe' },
      ],
      footer_rule: 'Rastreio citológico 25 a 64 anos',
    },
    {
      type: 'golden_rule',
      slide_title: 'Papanicolau — faixa',
      meta: slideMeta,
      content: 'ESPECTRO ETÁRIO',
      rows: [
        { label: 'Início', value: '25 anos após início da vida sexual', badge: 'hot', emphasis: 'highlight' },
        { label: 'Término', value: '64 anos na ausência de lesão de alto grau', badge: 'hot' },
        { label: 'HPV', value: 'Teste DNA-HPV complementa — citologia segura e eficaz no SUS', badge: 'info' },
        { label: 'Epidemiologia', value: 'Câncer de colo — casos novos estimados no triênio', badge: 'info' },
        { label: 'Não é', value: '18–69 nem 12–65 nem só menores de 25', badge: 'warn' },
      ],
      footer_rule: 'Faixa canônica → A',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: slideMeta,
      steps: [
          'Citopatologia — faixa etária das diretrizes brasileiras e prevenção do câncer de colo.',
        'Eliminar B — 18 a 69 anos.',
        'Eliminar C — 16 a 60 anos.',
        'Eliminar D — 15 a 59 anos.',
        'Eliminar E — 12 a 65 anos.',
        'Testar A — 25 a 64 anos com atividade sexual.',
        'Marcar letra A.',
      ],
      footer_rule: '25–64 anos com vida sexual — A',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: slideMeta,
      content: 'PEGADINHAS — FAIXA ETÁRIA',
      items: [
        { label: 'Letra B — 18-69', detail: 'Limite superior e inferior não coincidem com INCA.', correct: 'Marco aos 25 anos — letra A.' },
        { label: 'Letra C — 16-60', detail: 'Início precoce demais para rastreio populacional.', correct: '25 a 64 anos — gabarito A.' },
        { label: 'Letra D — 15-59', detail: 'Encerra rastreio antes dos 64 anos.', correct: 'Faixa MS/INCA — marcar A.' },
        { label: 'Letra E — 12-65', detail: 'Adolescente sem critério de rastreio citológico rotineiro.', correct: 'Pessoas com útero 25–64 — letra A.' },
      ],
      footer_rule: 'Posicionar idade no espectro 25–64',
    },
  ];
}

const SPECS: Record<string, Pack> = {
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-6': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — rastreio citológico: mulheres 25–64 anos com vida sexual ativa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Perfil — rastreio',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'População para investigação precoce de lesões precursoras do câncer de colo.', icon: 'Target' },
          { label: 'Perfil (C)', detail: 'Mulheres de 25 a 64 anos com vida sexual ativa.', icon: 'Users' },
          { label: 'Pegadinha início 40', detail: 'Menores de 25 anos — não faixa de rastreio — A e B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha trienal', detail: 'Acima de 64 anos — encerrar se sem lesão — D.', icon: 'Clock' },
        ],
        footer_rule: '25–64 com vida sexual — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Papanicolau — quem',
        meta: slideMeta,
        content: 'POPULAÇÃO-ALVO',
        rows: [
          { label: 'Faixa', value: '25 a 64 anos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Critério', value: 'Vida sexual ativa ou prévia', badge: 'hot' },
          { label: 'Objetivo', value: 'Lesões precursoras, infecção e inflamação', badge: 'info' },
          { label: 'Não é', value: 'Meninas <14, homens ou >65 rotina', badge: 'warn' },
        ],
        footer_rule: 'Perfil MS → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Citopatologia — perfil populacional do rastreio.',
          'Eliminar A — menores de 14 anos.',
          'Eliminar B — 13 a 25 sem marco dos 25.',
          'Testar C — 25 a 64 anos com vida sexual.',
          'Eliminar D — acima de 65 anos.',
          'Eliminar E — homens acima de 45.',
          'Marcar letra C.',
        ],
        footer_rule: 'Mulheres 25–64 com vida sexual — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PERFIL',
        items: [
          { label: 'Letra A — menores', detail: 'Rastreio não inclui pré-adolescentes.', correct: '25 a 64 anos — letra C.' },
          { label: 'Letra B — 13-25', detail: 'Início aos 25 anos após vida sexual.', correct: 'Vida sexual ativa na faixa — gabarito C.' },
          { label: 'Letra D — >65', detail: 'Rastreio até 64 anos na política brasileira.', correct: 'Lesões precursoras — marcar C.' },
          { label: 'Letra E — homens', detail: 'Citologia de colo é para pessoas com útero.', correct: 'Mulheres 25–64 — letra C.' },
        ],
        footer_rule: 'Espectro etário do SUS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104288275-6': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — nome popular do exame preventivo de colo: Papanicolau',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nome popular — preventivo',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Nome popular do exame preventivo de colo de útero.', icon: 'Target' },
          { label: 'Papanicolau (A)', detail: 'Citopatologia cervical — exame preventivo de colo.', icon: 'Microscope' },
          { label: 'Pegadinha obstetrícia', detail: 'Braxton Hicks — contrações uterinas — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha Valsalva', detail: 'Manobra respiratória — não rastreio — C.', icon: 'XCircle' },
        ],
        footer_rule: 'Preventivo de colo = Papanicolau',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sinônimos — colo',
        meta: slideMeta,
        content: 'EXAME PREVENTIVO',
        rows: [
          { label: 'Popular', value: 'Papanicolau', badge: 'hot', emphasis: 'highlight' },
          { label: 'Técnico', value: 'Citopatologia / citologia oncótica', badge: 'info' },
          { label: 'Alvo', value: 'Colo do útero (cérvice)', badge: 'hot' },
          { label: 'Não é', value: 'Braxton Hicks, Valsalva ou hemograma (HgT)', badge: 'warn' },
        ],
        footer_rule: 'Nome popular → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Exame preventivo de colo de útero — nome popular.',
          'Testar A — Papanicolau.',
          'Eliminar B — Braxton Hicks (contrações).',
          'Eliminar C — manobra de Valsalva.',
          'Eliminar D — HgT (hemograma).',
          'Eliminar E — nega todas incorretamente.',
          'Marcar letra A.',
        ],
        footer_rule: 'Papanicolau = preventivo colo — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOMENCLATURA',
        items: [
          { label: 'Letra B — Braxton', detail: 'Contrações de treinamento na gestação.', correct: 'Citopatologia cervical — letra A.' },
          { label: 'Letra C — Valsalva', detail: 'Manobra para equalizar pressão auricular.', correct: 'Exame preventivo de colo — gabarito A.' },
          { label: 'Letra D — HgT', detail: 'Sigla de hemograma — exame laboratorial distinto.', correct: 'Papanicolau — marcar A.' },
          { label: 'Letra E — todas erradas', detail: 'Alternativa A está correta.', correct: 'Nome popular Papanicolau — letra A.' },
        ],
        footer_rule: 'Colo uterino — citologia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104329543-1': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — Papanicolau: preventivo do colo do útero; lesões pré-malignas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preventivo — local',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Papanicolau coleta células para lesões pré-malignas — preventivo de qual órgão.', icon: 'Target' },
          { label: 'Colo (B)', detail: 'Preventivo do colo do útero — cérvice.', icon: 'Microscope' },
          { label: 'Pegadinha mama', detail: 'Mamografia rastreia mama — não Papanicolau — C.', icon: 'AlertTriangle' },
          { label: 'Pegadinha próstata', detail: 'PSA/toque — rastreio masculino — A.', icon: 'Ban' },
        ],
        footer_rule: 'Preventivo cervical — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Papanicolau — alvo',
        meta: slideMeta,
        content: 'LOCAL DO EXAME',
        rows: [
          { label: 'Coleta', value: 'Células do colo do útero', badge: 'hot', emphasis: 'highlight' },
          { label: 'Detecta', value: 'Lesões pré-malignas e inflamação', badge: 'hot' },
          { label: 'HPV', value: 'Lesões associadas ao papilomavírus', badge: 'info' },
          { label: 'Não é', value: 'Próstata, mama, reto ou sínfise', badge: 'warn' },
        ],
        footer_rule: 'Colo uterino → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Papanicolau — órgão do exame preventivo.',
          'Eliminar A — próstata.',
          'Testar B — colo do útero.',
          'Eliminar C — mamas.',
          'Eliminar D — sínfise púbica.',
          'Eliminar E — reto.',
          'Marcar letra B.',
        ],
        footer_rule: 'Citologia de colo — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LOCAL',
        items: [
          { label: 'Letra A — próstata', detail: 'Rastreio prostático é outro programa.', correct: 'Colo do útero — letra B.' },
          { label: 'Letra C — mamas', detail: 'Mamografia/clínica — rastreio mamário.', correct: 'Preventivo cervical — gabarito B.' },
          { label: 'Letra D — sínfise', detail: 'Estrutura óssea pélvica — não citologia.', correct: 'Papanicolau de colo — marcar B.' },
          { label: 'Letra E — reto', detail: 'Colorretal tem rastreio próprio.', correct: 'Lesões pré-malignas do colo — letra B.' },
        ],
        footer_rule: 'Anatomia do rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fepese-enfermagem-processo-de-enfermagem-1780008232871-8': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — citopatologia 25–64 anos; DNA-HPV complementar no SUS',
    slides: buildFaixaEtariaSlides(),
    cleanInstruction: cleanPdfNoise,
  },

  'fepese-enfermagem-saude-da-mulher-1777104222222-0': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — rastreio câncer de colo: exame citopatológico (Papanicolau)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Método — rastreio colo',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Método de rastreamento do câncer de colo e lesões precursoras — MS.', icon: 'Target' },
          { label: 'Citologia (E)', detail: 'Exame citopatológico — Papanicolau.', icon: 'Microscope' },
          { label: 'Pegadinha USG', detail: 'Ultrassom transvaginal — não rastreio primário — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina não substitui citologia na faixa etária.', icon: 'Syringe' },
        ],
        footer_rule: 'Citopatologia oncótica — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio — MS',
        meta: slideMeta,
        content: 'MÉTODO PRIMÁRIO',
        rows: [
          { label: 'Exame', value: 'Citopatologia (Papanicolau)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Faixa', value: '25 a 64 anos', badge: 'hot' },
          { label: 'Não é', value: 'USG, colonoscopia, biópsia ou imunofluorescência', badge: 'warn' },
        ],
        footer_rule: 'Citopatológico → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Rastreamento câncer de colo — método MS.',
          'Eliminar A — ultrassonografia transvaginal.',
          'Eliminar B — colonoscopia.',
          'Eliminar C — biópsia (investigação, não rastreio).',
          'Eliminar D — imunofluorescência direta.',
          'Testar E — exame citopatológico.',
          'Marcar letra E.',
        ],
        footer_rule: 'Papanicolau citológico — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MÉTODO',
        items: [
          { label: 'Letra A — USG', detail: 'Ultrassom avalia estruturas — não displasia de rotina.', correct: 'Citopatologia — letra E.' },
          { label: 'Letra B — colonoscopia', detail: 'Exame colorretal distinto.', correct: 'Rastreio de colo — gabarito E.' },
          { label: 'Letra C — biópsia', detail: 'Indicada após citologia alterada.', correct: 'Exame citopatológico — marcar E.' },
          { label: 'Letra D — imunofluorescência', detail: 'Não é método populacional de rastreio cervical.', correct: 'Papanicolau — letra E.' },
        ],
        footer_rule: 'Política brasileira de rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundatec-enfermagem-saude-da-mulher-1777104408379-5': {
    family: 'vf',
    branch: 'mulher_papanicolau',
    guideline: 'INCA 2016 — citopatologia; trienal após 2 anuais normais; início aos 25 anos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCA — V/F rastreio',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Diretrizes Brasileiras INCA 2016 — assertivas I a IV sobre citopatologia e atividade sexual.', icon: 'Target' },
          { label: 'Ordem (B)', detail: 'V-V-V-F — gabarito da prova.', icon: 'CheckCircle' },
          { label: 'Pegadinha início 40', detail: 'Item IV falso — início aos 25 anos, não qualquer idade.', icon: 'AlertTriangle' },
          { label: 'Pegadinha trienal', detail: 'Item II verdadeiro — trienal após dois anuais normais.', icon: 'Clock' },
        ],
        footer_rule: 'IV falsa — início aos 25 anos',
      },
      {
        type: 'golden_rule',
        slide_title: 'INCA — julgamento',
        meta: slideMeta,
        content: 'V / F — I a IV',
        rows: [
          { label: 'I', value: 'Citopatologia periódica — estratégia principal — V', badge: 'hot', emphasis: 'highlight' },
          { label: 'II', value: 'Trienal após 2 anuais normais consecutivos — V', badge: 'hot' },
          { label: 'III', value: 'Sem história de atividade sexual — não rastrear — V', badge: 'info' },
          { label: 'IV', value: 'Qualquer idade com sexo — F (início 25 anos)', badge: 'warn' },
        ],
        footer_rule: 'I–IV: V,V,V,F → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'INCA 2016 — Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero.',
          'Julgar afirmativas I a IV — parênteses V ou F.',
          'Julgar I — citopatologia estratégia principal → verdadeiro.',
          'Julgar II — trienal após dois anuais normais → verdadeiro.',
          'Julgar III — sem atividade sexual não rastrear → verdadeiro.',
          'Julgar IV — qualquer idade com sexo → falso (início aos 25).',
          'Combinação V-V-V-F.',
          'Marcar letra B.',
        ],
        footer_rule: 'Itens I–IV julgados — ordem B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCA VF',
        items: [
          { label: 'Letra A — IV verdadeira', detail: 'Aceita início independente da idade.', correct: 'Início aos 25 anos — letra B.' },
          { label: 'Letra C — IV falsa', detail: 'Omite III verdadeira.', correct: 'V-V-V-F — gabarito B.' },
          { label: 'Letra D — I falsa', detail: 'Citopatologia continua estratégia principal.', correct: 'Trienal após anuais — marcar B.' },
          { label: 'Letra E — II falsa', detail: 'Periodicidade trienal está correta.', correct: 'Ordem V-V-V-F — letra B.' },
        ],
        footer_rule: 'Marco etário 25 anos — item IV',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundepes-copeve-ufal-enfermagem-saude-da-mulher-1777104415052-5': {
    family: 'vf',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — epidemiologia câncer colo e mama; anemia gestacional; item IV nulípara falso',
    sources: [INCA_SOURCE, AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saúde da mulher — VF',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativas I a IV — câncer cervical, mama, anemia gestacional e cuidado da mulher nulípara.', icon: 'Target' },
          { label: 'I–III (D)', detail: 'Colo quarto no Brasil, mama mundial e anemia na gestação — corretas.', icon: 'CheckCircle' },
          { label: 'Pegadinha IV nulípara', detail: 'Item IV falso — confunde nulípara com rede de cuidado gestante.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Câncer de mama — incidência mundial e no Brasil — item II.', icon: 'Heart' },
        ],
        footer_rule: 'IV falsa — I, II e III corretas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgamento — I a IV',
        meta: slideMeta,
        content: 'SAÚDE DA MULHER',
        rows: [
          { label: 'I', value: 'Câncer de colo — 4º no Brasil — V', badge: 'info' },
          { label: 'II', value: 'Mama mundial; segundo no Brasil; mortalidade em desenvolvimento — V', badge: 'hot', emphasis: 'highlight' },
          { label: 'III', value: 'Anemia gestacional — baixo peso, mortalidade perinatal — V', badge: 'hot' },
          { label: 'IV', value: 'Nulípara isolada — F na prova', badge: 'warn' },
        ],
        footer_rule: 'I + II + III → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Saúde da mulher — julgar afirmativas I a IV.',
          'Julgar I — câncer de colo quarto no Brasil → verdadeiro.',
          'Julgar II — câncer de mama incidência → verdadeiro.',
          'Julgar III — anemia gestacional, baixo peso, mortalidade perinatal e trabalho de parto prematuro → verdadeiro.',
          'Julgar IV — cuidado da nulípara como enunciado → falso.',
          'Combinação I, II e III.',
          'Marcar letra D.',
        ],
        footer_rule: 'Itens I–III verdadeiros — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — I a IV',
        items: [
          { label: 'Letra A — só II', detail: 'Omite I e III verdadeiras.', correct: 'Colo, mama e anemia — letra D.' },
          { label: 'Letra B — I e IV', detail: 'IV é falsa.', correct: 'I, II e III — gabarito D.' },
          { label: 'Letra C — II e IV', detail: 'Inclui IV falsa.', correct: 'Três primeiras corretas — marcar D.' },
          { label: 'Letra E — todas', detail: 'IV nulípara invalida combinação total.', correct: 'I, II e III apenas — letra D.' },
          {
            label: 'Pegadinha IV nulípara',
            detail: 'Item IV generaliza cuidado da nulípara — afirmativa falsa na prova.',
            correct: 'Colo, mama e anemia gestacional corretos — marcar D.',
          },
        ],
        footer_rule: 'Epidemiologia + gestação — IV falsa',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundepes-copeve-ufal-enfermagem-saude-da-mulher-1777104415052-6': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — HPV e Papanicolau; periodicidade trienal após dois exames anuais normais',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HPV — periodicidade',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Papilomavírus HPV — alterações curáveis no Papanicolau; vida sexual ativa; preventivo periódico 25–64 anos.',
            icon: 'Target',
          },
          { label: 'Trienal (A)', detail: 'Após dois exames anuais normais — a cada três anos.', icon: 'Calendar' },
          { label: 'Pegadinha anual universal', detail: 'Não permanece anual indefinidamente após normais.', icon: 'AlertTriangle' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina não dispensa citologia na faixa de rastreio.', icon: 'Syringe' },
        ],
        footer_rule: 'Dois anuais normais → trienal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Preventivo — intervalo',
        meta: slideMeta,
        content: 'PERIODICIDADE MS',
        rows: [
          { label: 'Faixa', value: '25 a 64 anos — vida sexual ativa', badge: 'hot', emphasis: 'highlight' },
          { label: 'HPV', value: 'Papilomavírus — lesões curáveis se detectadas cedo', badge: 'info' },
          { label: 'Início', value: 'Esquema anual no começo do rastreio preventivo', badge: 'info' },
          { label: 'Espaçamento', value: 'Trienal após dois exames seguidos normais', badge: 'hot' },
        ],
        footer_rule: 'Intervalo trienal → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Papanicolau — periodicidade após resultados normais.',
          'Eliminar B — quatro anos.',
          'Eliminar C — cinco anos.',
          'Eliminar D — seis anos.',
          'Eliminar E — sete anos.',
          'Testar A — três anos.',
          'Marcar letra A.',
        ],
        footer_rule: 'Trienal após dois anuais — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERVALO',
        items: [
          { label: 'Letra B — 4 anos', detail: 'Intervalo não previsto nas diretrizes MS.', correct: 'Três anos — letra A.' },
          { label: 'Letra C — 5 anos', detail: 'Espaçamento excessivo para rastreio cervical.', correct: 'Dois anuais normais → trienal — gabarito A.' },
          { label: 'Letra D — 6 anos', detail: 'Prazo longo demais após rastreio inicial.', correct: 'Periodicidade trienal — marcar A.' },
          { label: 'Letra E — 7 anos', detail: 'Não corresponde ao protocolo brasileiro.', correct: 'Após normais consecutivos — letra A.' },
        ],
        footer_rule: 'Régua anual → trienal',
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
    console.log(`[handcraft:sm-g19] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g19] total=${ok}`);
}

main();
