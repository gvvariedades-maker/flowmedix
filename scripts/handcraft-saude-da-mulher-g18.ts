#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g18 (8 slugs papanicolau P0).
 *
 *   npm run handcraft:saude-da-mulher-g18
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g18 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g18';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const INCA_SOURCE = {
  id: 'inca-rastreio-colo',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes para o rastreamento do câncer do colo do útero',
  year: 2016,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-para-o-rastreamento-do-cancer-do-colo-do-utero',
  covers: ['25-64 anos', 'citologia trienal', 'dois exames anuais normais', 'coleta Papanicolau', 'HPV'],
};

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['gestação alto risco', 'ameaça de aborto', 'pré-natal'],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo de Atenção à Saúde das Mulheres — MS 2016',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_atencao_saude_mulheres.pdf',
  covers: ['métodos contraceptivos', 'preservativo', 'planejamento familiar'],
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
  sources?: (typeof INCA_SOURCE | typeof AB32_SOURCE | typeof PF_SOURCE)[];
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
    .replace(/coletade/gi, 'coleta de')
    .replace(/naendocérvice/gi, 'na endocérvice')
    .replace(/queantecedem/gi, 'que antecedem')
    .replace(/aseguintes/gi, 'as seguintes')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRomanItems(s: string): string {
  return s
    .replace(/\nI\n\./g, '\nI -')
    .replace(/\nII\n\./g, '\nII -')
    .replace(/\nIII\n\./g, '\nIII -')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-saude-da-mulher-1777104306781-2': {
    family: 'vf',
    branch: 'mulher_papanicolau',
    guideline: 'MS/INCA — métodos contraceptivos; preservativo auxilia prevenção câncer de colo (HPV)',
    sources: [PF_SOURCE, INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Contraceptivos — V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro afirmativas I a IV sobre métodos contraceptivos — ordem V/F.', icon: 'Target' },
          { label: 'Ordem (C)', detail: 'F-V-V-F — combinação da prova.', icon: 'CheckCircle' },
          { label: 'Pegadinha vacina HPV', detail: 'Preservativo reduz HPV — vacina não dispensa citologia no rastreio.', icon: 'Syringe' },
          { label: 'Pegadinha vasectomia', detail: 'Item IV: vasectomia não altera produção hormonal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Preservativo (III) e câncer de colo uterino',
      },
      {
        type: 'golden_rule',
        slide_title: 'Métodos — julgamento',
        meta: slideMeta,
        content: 'V / F — I a IV',
        rows: [
          { label: 'I DIU', value: 'Falso na ordem C', badge: 'warn' },
          { label: 'II AOC', value: 'Verdadeiro na ordem C', badge: 'info' },
          { label: 'III Preservativo', value: 'Barreira — IST e HPV/colo', badge: 'hot', emphasis: 'highlight' },
          { label: 'IV Vasectomia', value: 'Falso — não interfere hormônios', badge: 'hot' },
        ],
        footer_rule: 'I–IV: F-V-V-F → letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Métodos contraceptivos — julgar afirmativas I a IV.',
          'Julgar I — DIU reversível e profissional habilitado → falso.',
          'Julgar II — anticoncepcional oral combinado → verdadeiro.',
          'Julgar III — preservativo barreira e prevenção câncer de colo → verdadeiro.',
          'Julgar IV — vasectomia interfere hormônios → falso.',
          'Combinação F-V-V-F.',
          'Marcar letra C.',
        ],
        footer_rule: 'Itens I–IV julgados — ordem C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F',
        items: [
          { label: 'Letra A — V-F-V-F', detail: 'Primeira afirmativa como verdadeira.', correct: 'DIU como falso na ordem — letra C.' },
          { label: 'Letra B — V-F-F-V', detail: 'Vasectomia como verdadeira.', correct: 'Vasectomia não altera hormônios — gabarito C.' },
          { label: 'Letra D — F-V-F-V', detail: 'Preservativo como falso.', correct: 'Barreira previne IST e auxilia colo — marcar C.' },
          { label: 'Pegadinha preservativo', detail: 'HPV transmissão sexual — preservativo reduz risco.', correct: 'F-V-V-F — letra C.' },
        ],
        footer_rule: 'Preservativo liga contracepção e rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'amauc-enfermagem-saude-da-mulher-1777104295283-6': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'MS/COFEN — assistência de enfermagem integral; Papanicolau 25–64 anos',
    sources: [INCA_SOURCE, PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Enfermagem — saúde da mulher',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ações de promoção, prevenção e tratamento na saúde da mulher.', icon: 'Target' },
          { label: 'Pré-natal (A)', detail: 'Enfermeiro identifica riscos gestacionais e orienta cuidados.', icon: 'Heart' },
          { label: 'Pegadinha Papanicolau', detail: 'Rastreio 25–64 anos — não só idade fértil — D.', icon: 'AlertTriangle' },
          { label: 'Pegadinha anual universal', detail: 'Periodicidade trienal após esquema inicial — não só fértil.', icon: 'Clock' },
          { label: 'Pegadinha IST exclusiva', detail: 'IST é abordagem da enfermagem — não só médico — B.', icon: 'XCircle' },
        ],
        footer_rule: 'Integralidade na assistência — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Escopo — enfermagem',
        meta: slideMeta,
        content: 'SAÚDE DA MULHER',
        rows: [
          { label: 'Pré-natal', value: 'Risco gestacional e orientação — enfermagem', badge: 'hot', emphasis: 'highlight' },
          { label: 'IST', value: 'Prevenção na assistência de enfermagem', badge: 'info' },
          { label: 'Papanicolau', value: '25 a 64 anos — não encerra no climatério', badge: 'hot' },
          { label: 'PF', value: 'Educação para escolha informada', badge: 'info' },
        ],
        footer_rule: 'Pré-natal enfermeiro → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Assistência de enfermagem à saúde da mulher.',
          'Testar A — pré-natal com identificação de riscos.',
          'Eliminar B — IST exclusiva do médico.',
          'Eliminar C — climatério só farmacológico.',
          'Eliminar D — Papanicolau só idade fértil.',
          'Eliminar E — PF só prescrição.',
          'Marcar letra A.',
        ],
        footer_rule: 'Promoção e prevenção → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSISTÊNCIA',
        items: [
          { label: 'Letra B — IST médico', detail: 'Enfermagem educa e previne IST.', correct: 'Risco gestacional no pré-natal — letra A.' },
          { label: 'Letra C — climatério', detail: 'Cuidado integral físico e mental.', correct: 'Identificação de riscos — gabarito A.' },
          { label: 'Letra D — Papanicolau', detail: 'Faixa 25–64 anos inclui pré-menopausa.', correct: 'Pré-natal enfermeiro — marcar A.' },
          { label: 'Letra E — PF prescrição', detail: 'Planejamento familiar inclui educação em saúde.', correct: 'Pré-natal com riscos gestacionais — letra A.' },
          { label: 'Pegadinha trienal', detail: 'Rastreio citológico até 64 anos na APS.', correct: 'Assistência integral — marcar A.' },
        ],
        footer_rule: 'Papanicolau além da fertilidade',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562768558-3': {
    family: 'vf',
    branch: 'mulher_papanicolau',
    guideline: 'MS/INCA — coleta citológica: preparo 48h, fixação em lâmina; técnica espátula/escova',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta — Papanicolau',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Citopatologia — julgar afirmativas I a III sobre coleta.', icon: 'Target' },
          { label: 'II e III (B)', detail: 'Preparo pré-exame e fixação em lâmina — corretos.', icon: 'CheckCircle' },
          { label: 'Pegadinha técnica I', detail: 'Movimentos/giros da espátula Ayre — item I falso.', icon: 'AlertTriangle' },
          { label: 'Pegadinha ultrassom', detail: 'Evitar USG transvaginal no preparo — item II.', icon: 'Microscope' },
        ],
        footer_rule: 'I falsa — II e III corretas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Coleta — protocolo',
        meta: slideMeta,
        content: 'CITOLOGIA ONCÓTICA',
        rows: [
          { label: 'II', value: 'Evitar relações, duchas, cremes e USG transvaginal no preparo', badge: 'hot', emphasis: 'highlight' },
          { label: 'III', value: 'Espalhar na lâmina e fixar com álcool ou spray', badge: 'hot' },
          { label: 'I', value: 'Técnica Ayre/escova — item I falso na prova', badge: 'warn' },
        ],
        footer_rule: 'II + III → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Coleta de Papanicolau — julgar afirmativas I a III.',
          'Julgar I — espátula Ayre e escova endocervical → falso.',
          'Julgar II — evitar relações, duchas e USG transvaginal no preparo → verdadeiro.',
          'Julgar III — espalhar na lâmina e fixar → verdadeiro.',
          'Combinação II e III.',
          'Marcar letra B.',
        ],
        footer_rule: 'Item I falso — combinação II e III — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COLETA',
        items: [
          { label: 'Letra A — I e II', detail: 'Inclui I falsa.', correct: 'Só II e III — letra B.' },
          { label: 'Letra C — todas', detail: 'Item I é falso.', correct: 'Preparo e fixação — gabarito B.' },
          { label: 'Letra D — I e III', detail: 'I é falsa.', correct: 'II e III corretos — marcar B.' },
          { label: 'Pegadinha fixação', detail: 'Fixação imediata preserva células na lâmina.', correct: 'II e III — letra B.' },
        ],
        footer_rule: 'Técnica e preparo citológico',
      },
    ],
    cleanInstruction: (s) => cleanRomanItems(cleanPdfNoise(s)),
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779562716126-7': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'COFEN/MS — TE na coleta Papanicolau: preparo, registro e transporte — não assistir coleta inteira',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — coleta Papanicolau',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atribuições do TE na coleta de Papanicolau — assinalar o erro conceitual.', icon: 'Target' },
          { label: 'EXCETO (E)', detail: 'Apoiar durante todo o procedimento de coleta — incorreto.', icon: 'Ban' },
          { label: 'Pegadinha sala', detail: 'Organizar sala de coleta — atribuição correta — A.', icon: 'CheckCircle' },
          { label: 'Pegadinha transporte', detail: 'Conferir e enviar lâmina ao laboratório — D correta.', icon: 'Package' },
        ],
        footer_rule: 'TE não assiste coleta completa',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — atribuições',
        meta: slideMeta,
        content: 'PAPELANICOLAU — TE',
        rows: [
          { label: 'Sala', value: 'Organizar e preparar ambiente de coleta', badge: 'info' },
          { label: 'Registro', value: 'Registrar exames em impresso próprio', badge: 'info' },
          { label: 'Transporte', value: 'Acondicionar e enviar lâmina ao laboratório', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não é', value: 'Apoiar o profissional durante toda a coleta', badge: 'warn' },
        ],
        footer_rule: 'Erro conceitual → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Atribuições do TE no Papanicolau — qual contém erro.',
          'Eliminar A — organizar sala → correta.',
          'Eliminar B — registrar impresso → correta.',
          'Eliminar C — acondicionar material → correta.',
          'Eliminar D — conferir e enviar lâmina → correta.',
          'Testar E — apoiar durante todo procedimento → erro conceitual.',
          'Marcar letra E.',
        ],
        footer_rule: 'Coleta é do enfermeiro/médico — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO TE',
        items: [
          { label: 'Letra A — sala', detail: 'Preparo do ambiente é atribuição do TE.', correct: 'Afirmativa correta — não marcar.' },
          { label: 'Letra B — registro', detail: 'Documentação dos exames coletados.', correct: 'Conduta correta — eliminar.' },
          { label: 'Letra C — acondicionar', detail: 'Organização para envio ao laboratório.', correct: 'Orientação correta — não é o erro.' },
          { label: 'Letra D — enviar lâmina', detail: 'Conferência e transporte da citologia.', correct: 'Exceção: apoiar coleta inteira — letra E.' },
        ],
        footer_rule: 'Assistência indireta ao procedimento',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007238824-7': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'MS Manual Gestação Alto Risco 2022 — ameaça de aborto: sangramento, cólica, colo fechado, embrião vivo',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso Maria — aborto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Gestante com sangramento, cólica, colo fechado e BCF presente — alto risco.', icon: 'Target' },
          { label: 'Ameaça (E)', detail: 'Quadro sugestivo de ameaça de aborto — embrião vivo.', icon: 'AlertTriangle' },
          { label: 'Pegadinha folato', detail: 'Folato elevado não é fator de aborto — deficiência sim — A.', icon: 'XCircle' },
          { label: 'Pegadinha tabagismo', detail: 'Tabaco é fator de risco gestacional — não define quadro agudo atual.', icon: 'Ban' },
          { label: 'Pegadinha anual universal', detail: 'Caso de alto risco gestacional — não rastreio citológico.', icon: 'Clock' },
        ],
        footer_rule: 'Colo fechado + BCF = ameaça',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ameaça de aborto',
        meta: slideMeta,
        content: 'MANUAL ALTO RISCO',
        rows: [
          { label: 'Clínica', value: 'Sangramento e cólica com colo fechado', badge: 'hot', emphasis: 'highlight' },
          { label: 'USG', value: 'Embrião único com atividade cardíaca', badge: 'hot' },
          { label: 'Não é', value: 'Aborto inevitável nem repetição neste caso', badge: 'warn' },
          { label: 'Istmo', value: 'Insuficiência istmocervical — colo dilatado', badge: 'warn' },
        ],
        footer_rule: 'Ameaça de aborto → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Maria — sangramento, cólica, colo fechado, BCF presente.',
          'Eliminar A — folato elevado como fator de aborto.',
          'Eliminar B — nomenclatura isolada sem fechar diagnóstico.',
          'Eliminar C — aborto de repetição (critério não preenchido).',
          'Eliminar D — istmocervical com colo fechado.',
          'Testar E — ameaça de aborto pelo conjunto clínico-ultrassonográfico.',
          'Marcar letra E.',
        ],
        footer_rule: 'Gestação viável com sangramento — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO',
        items: [
          {
            label: 'Letra A — folato',
            detail: 'Deficiência de folato aumenta risco — não elevação sérica.',
            correct: 'Folato alto não explica sangramento — diagnóstico é ameaça (E).',
          },
          {
            label: 'Letra B — cronologia',
            detail: 'Classificação temporal isolada não fecha diagnóstico.',
            correct: 'Nome do trimestre não substitui avaliação clínica — letra E.',
          },
          {
            label: 'Letra C — repetição',
            detail: 'Repetição exige critérios específicos do manual.',
            correct: 'Dois abortos com gestação viável intercalada — não repetição clássica; marcar E.',
          },
          {
            label: 'Letra D — istmo',
            detail: 'Istmo cursa com dilatação cervical.',
            correct: 'Colo fechado afasta insuficiência istmocervical — gabarito E.',
          },
          {
            label: 'Pegadinha tabagismo',
            detail: 'Tabaco e álcool são fatores de risco — não definem o quadro agudo.',
            correct: 'Sangramento com BCF presente — ameaça de aborto, letra E.',
          },
        ],
        footer_rule: 'Diagnóstico sindrômico atual',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-saude-da-mulher-1777104382533-6': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — Papanicolau: anual inicial; trienal após dois exames anuais normais (25–64 anos)',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Periodicidade — MS/HPV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Prevenção câncer colo uterino — HPV, vacinação, citologia oncótica e regressão de lesões — intervalo MS.',
            icon: 'Target',
          },
          { label: 'Esquema (B)', detail: 'Início anual; após dois normais consecutivos → trienal.', icon: 'Calendar' },
          { label: 'Pegadinha trienal fixo', detail: 'Trienal desde o início sem dois anuais — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha anual universal', detail: 'Exame todo ano por tempo indeterminado — D.', icon: 'Clock' },
        ],
        footer_rule: 'Dois anuais normais → trienal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Papanicolau — intervalo',
        meta: slideMeta,
        content: 'RASTREIO COLO',
        rows: [
          { label: 'Faixa', value: '25 a 64 anos após início da vida sexual', badge: 'hot', emphasis: 'highlight' },
          { label: 'HPV', value: 'Vacinação complementa — não substitui citologia', badge: 'info' },
          { label: 'Início', value: 'Periodicidade anual no começo do rastreio', badge: 'info' },
          { label: 'Trienal', value: 'Após dois exames anuais normais consecutivos', badge: 'hot' },
          { label: 'Não é', value: 'Trienal imediato nem bienal nem quinquenal', badge: 'warn' },
        ],
        footer_rule: 'Esquema MS → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Papanicolau — intervalo recomendado pelo MS.',
          'Eliminar A — trienal desde o primeiro exame.',
          'Testar B — anual inicial; dois normais → trienal.',
          'Eliminar C — bienal após anuais.',
          'Eliminar D — anual por tempo indeterminado.',
          'Eliminar E — a cada cinco anos.',
          'Marcar letra B.',
        ],
        footer_rule: 'Dois anuais normais → trienal — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERVALO',
        items: [
          { label: 'Letra A — trienal fixo', detail: 'Primeiro rastreio exige acompanhamento mais próximo.', correct: 'Anual depois trienal — letra B.' },
          { label: 'Letra C — bienal', detail: 'MS adota trienal após dois anuais normais.', correct: 'Dois exames anuais normais — gabarito B.' },
          { label: 'Letra D — anual eterno', detail: 'Periodicidade espaça após resultados normais.', correct: 'Esquema progressivo — marcar B.' },
          { label: 'Letra E — cinco anos', detail: 'Intervalo quinquenal não é recomendação MS.', correct: 'Dois anuais normais → trienal — letra B.' },
          { label: 'Pegadinha 25-64', detail: 'Faixa etária do rastreio citológico no SUS.', correct: 'Esquema progressivo MS — marcar B.' },
        ],
        footer_rule: 'Régua anual → trienal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'facet-enfermagem-saude-da-mulher-1777104261182-5': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/OMS — rastreio primário: citologia oncótica (Papanicolau) 25–64 anos',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Rastreio — HPV/colo',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Estratégia de rastreamento do câncer de colo — lesões precursoras HPV.', icon: 'Target' },
          { label: 'Citologia (C)', detail: 'Papanicolau — displasias intraepiteliais no colo uterino.', icon: 'Microscope' },
          { label: 'Pegadinha HPV primário', detail: 'Captura híbrida não substitui citologia no SUS — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha colposcopia', detail: 'Colposcopia é investigação — não rastreio populacional — D.', icon: 'XCircle' },
        ],
        footer_rule: 'Citologia oncótica — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio — MS/OMS',
        meta: slideMeta,
        content: 'POLÍTICA BRASILEIRA',
        rows: [
          { label: 'Exame', value: 'Papanicolau — citologia oncótica', badge: 'hot', emphasis: 'highlight' },
          { label: 'Faixa', value: '25 a 64 anos', badge: 'hot' },
          { label: 'Foco', value: 'Lesões precursoras associadas ao HPV', badge: 'info' },
          { label: 'Não é', value: 'Marcadores séricos, USG ou colposcopia de rotina', badge: 'warn' },
        ],
        footer_rule: 'Papanicolau primário → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Rastreamento câncer de colo — exame mais recomendado MS/OMS.',
          'Eliminar A — captura híbrida substituindo citologia.',
          'Eliminar B — marcadores tumorais séricos.',
          'Testar C — Papanicolau citologia oncótica.',
          'Eliminar D — colposcopia de rotina primária.',
          'Eliminar E — ultrassonografia pélvica.',
          'Marcar letra C.',
        ],
        footer_rule: 'Citologia periódica → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RASTREIO',
        items: [
          { label: 'Letra A — captura HPV', detail: 'Teste molecular complementar — não política primária universal.', correct: 'Citologia oncótica — letra C.' },
          { label: 'Letra B — marcadores', detail: 'Sangue não rastreia displasia cervical.', correct: 'Papanicolau periódico — gabarito C.' },
          { label: 'Letra D — colposcopia', detail: 'Indicada após citologia alterada.', correct: 'Rastreio populacional — marcar C.' },
          { label: 'Letra E — ultrassom', detail: 'USG pélvica não rastreia displasia cervical.', correct: 'Citologia oncótica — marcar C.' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina não dispensa Papanicolau na faixa etária.', correct: 'Exame citológico periódico — letra C.' },
        ],
        footer_rule: 'HPV → citologia de rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-9': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — Papanicolau rastreia câncer de colo do útero; 25–64 anos',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lacuna — colo uterino',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Citopatológico para rastreio do câncer de ___ de útero — SUS 25–64 anos.', icon: 'Target' },
          { label: 'Colo (E)', detail: 'Câncer de colo do útero — local do rastreio citológico.', icon: 'Microscope' },
          { label: 'Pegadinha fundo', detail: 'Fundo uterino — não é alvo do Papanicolau — C.', icon: 'AlertTriangle' },
          { label: 'Pegadinha trienal', detail: 'Periodicidade trienal após esquema inicial — não anual universal.', icon: 'Clock' },
        ],
        footer_rule: 'Colo do útero → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Papanicolau — SUS',
        meta: slideMeta,
        content: 'RASTREIO COLO',
        rows: [
          { label: 'Alvo', value: 'Colo do útero (cérvice)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Faixa', value: '25 a 64 anos', badge: 'hot' },
          { label: 'Exame', value: 'Citopatologia (Papanicolau)', badge: 'info' },
          { label: 'Periodicidade', value: 'Esquema inicial depois trienal se normal', badge: 'info' },
        ],
        footer_rule: 'Lacuna: colo → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Papanicolau — preencher lacuna do órgão rastreado.',
          'Eliminar A — reto.',
          'Eliminar B — nervo.',
          'Eliminar C — fundo uterino.',
          'Eliminar D — meio.',
          'Testar E — colo do útero.',
          'Marcar letra E.',
        ],
        footer_rule: 'Câncer de colo → E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANATOMIA',
        items: [
          { label: 'Letra A — reto', detail: 'Rastreio colorretal é outro programa.', correct: 'Colo uterino — letra E.' },
          { label: 'Letra B — nervo', detail: 'Sem relação com citologia cervical.', correct: 'Cérvice — gabarito E.' },
          { label: 'Letra C — fundo', detail: 'Papanicolau coleta cérvice — não fundo uterino.', correct: 'Lacuna colo — letra E.' },
          { label: 'Letra D — meio', detail: 'Termo anatômico incorreto para rastreio.', correct: 'Colo do útero — marcar E.' },
          { label: 'Pegadinha 25-64', detail: 'Faixa etária do rastreio citológico no SUS.', correct: 'Lacuna: câncer de colo — marcar E.' },
        ],
        footer_rule: 'Citologia = colo uterino',
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
    console.log(`[handcraft:sm-g18] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g18] total=${ok}`);
}

main();
