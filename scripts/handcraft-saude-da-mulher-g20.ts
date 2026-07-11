#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g20 (8 slugs papanicolau P0).
 *
 *   npm run handcraft:saude-da-mulher-g20
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g20 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g20';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const INCA_SOURCE = {
  id: 'inca-rastreio-colo',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes para o rastreamento do câncer do colo do útero',
  year: 2016,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-para-o-rastreamento-do-cancer-do-colo-do-utero',
  covers: ['25-64 anos', 'citologia', 'Papanicolau', 'HPV', 'fatores de risco'],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo de Atenção à Saúde das Mulheres — MS 2016',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_atencao_saude_mulheres.pdf',
  covers: ['atenção primária', 'educação em saúde', 'prevenção câncer'],
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
  sources?: (typeof INCA_SOURCE | typeof PF_SOURCE)[];
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
    .replace(/\(__\)/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'ibade-enfermagem-saude-da-mulher-1777104323066-4': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — citologia: coloração de Papanicolau e citoplasma azul em células intermediárias e profundas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Papanicolau — coloração',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Coloração de Papanicolau — alterações celulares do colo uterino.', icon: 'Target' },
          { label: 'Intermediárias (B)', detail: 'Células intermediárias e profundas — citoplasma azul.', icon: 'Microscope' },
          { label: 'Pegadinha superficiais', detail: 'Células superficiais — citoplasma róseo/vermelho — não azul.', icon: 'AlertTriangle' },
          { label: 'Pegadinha vacina HPV', detail: 'Laudo citológico distinto de rastreio vacinal.', icon: 'Syringe' },
        ],
        footer_rule: 'Citoplasma azul — células profundas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Coloração — laudo',
        meta: slideMeta,
        content: 'PAPANICOLAU',
        rows: [
          { label: 'Profundas', value: 'Citoplasma azul — intermediárias e profundas', badge: 'hot', emphasis: 'highlight' },
          { label: 'Superficiais', value: 'Citoplasma róseo/vermelho', badge: 'info' },
          { label: 'Núcleo', value: 'Hematoxilina — tons azul/roxo conforme camada', badge: 'info' },
          { label: 'Flora', value: 'Bacilos e cocos — coloração variável', badge: 'warn' },
        ],
        footer_rule: 'Intermediárias/profundas azul → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Coloração de Papanicolau — resultados esperados.',
          'Eliminar A — superficiais com citoplasma vermelho.',
          'Testar B — intermediárias e profundas com citoplasma azul.',
          'Eliminar C — núcleo piquinótico róseo em superficiais.',
          'Eliminar D — núcleo roxo isolado sem par citoplásmico.',
          'Eliminar E — flora anormal não define camada celular.',
          'Marcar letra B.',
        ],
        footer_rule: 'Citoplasma azul nas profundas — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COLORAÇÃO',
        items: [
          { label: 'Letra A — superficiais vermelhas', detail: 'Padrão das células superficiais.', correct: 'Citoplasma azul profundo — letra B.' },
          { label: 'Letra C — núcleo róseo', detail: 'Descritor de superficiais.', correct: 'Intermediárias e profundas — gabarito B.' },
          { label: 'Letra D — núcleo roxo', detail: 'Omite citoplasma azul característico.', correct: 'Camada profunda — marcar B.' },
          { label: 'Letra E — flora', detail: 'Achado infeccioso — não resposta da camada.', correct: 'Citoplasma azul — letra B.' },
        ],
        footer_rule: 'Leitura citológica por camada',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ibam-enfermagem-saude-da-mulher-1777104340484-5': {
    family: 'vf',
    branch: 'mulher_papanicolau',
    guideline: 'COFEN/MS — TE/auxiliar: apoio à coleta Papanicolau; não coletar nem restringir educação em saúde',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — Papanicolau APS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atribuições do técnico/auxiliar na prevenção do câncer de colo e mama na APS.', icon: 'Target' },
          { label: 'Sequência (D)', detail: 'V, F, F, V — itens I a IV.', icon: 'CheckCircle' },
          { label: 'Pegadinha coleta TE', detail: 'Item II falso — coleta é do enfermeiro/médico.', icon: 'AlertTriangle' },
          { label: 'Pegadinha autoexame', detail: 'Item III falso — TE pode educar em saúde.', icon: 'Ban' },
        ],
        footer_rule: 'Apoio sim — coleta não',
      },
      {
        type: 'golden_rule',
        slide_title: 'Atribuições — V/F',
        meta: slideMeta,
        content: 'I a IV',
        rows: [
          { label: 'I', value: 'Organizar sala, registrar e orientar retorno — V', badge: 'hot', emphasis: 'highlight' },
          { label: 'II', value: 'Coleta excepcional pelo TE — F', badge: 'warn' },
          { label: 'III', value: 'Autoexame só enfermeiro — F', badge: 'warn' },
          { label: 'IV', value: 'Estimular preventivos e periodicidade — V', badge: 'hot' },
        ],
        footer_rule: 'Sequência V-F-F-V — letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Prevenção colo e mama — julgar afirmativas I a IV.',
          'Julgar I — organizar sala e acondicionar material → verdadeiro.',
          'Julgar II — TE coletar Papanicolau excepcionalmente → falso.',
          'Julgar III — autoexame exclusivo do enfermeiro → falso.',
          'Julgar IV — estimular exames preventivos → verdadeiro.',
          'Combinação V-F-F-V.',
          'Marcar letra D.',
        ],
        footer_rule: 'Itens I–IV julgados — ordem D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ATRIBUIÇÕES',
        items: [
          { label: 'Letra A — todas V', detail: 'Aceita coleta pelo TE.', correct: 'Coleta não é do técnico — letra D.' },
          { label: 'Letra B — só I', detail: 'Omite IV verdadeira.', correct: 'Estimular preventivos — gabarito D.' },
          { label: 'Letra C — III e IV', detail: 'III é falsa.', correct: 'V-F-F-V — marcar D.' },
          { label: 'Pegadinha mama', detail: 'Educação em saúde inclui orientação na APS.', correct: 'Apoio sem coletar — letra D.' },
        ],
        footer_rule: 'TE educa — não coleta citologia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067024707-8': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — rastreio: citopatologia (não USG); HPV transmissão sexual e preservativo parcial',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Colo — INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Câncer de colo do útero — assinalar a alternativa INCORRETA.', icon: 'Target' },
          { label: 'INCORRETA (A)', detail: 'Ultrassonografia não é método principal de rastreio.', icon: 'Ban' },
          { label: 'Pegadinha vacina HPV', detail: 'Prevenção primária reduz HPV — item B correto.', icon: 'Syringe' },
          { label: 'Pegadinha trienal', detail: 'Rastreio citológico periódico — não USG de rotina.', icon: 'Clock' },
        ],
        footer_rule: 'Rastreio = citopatologia — não USG',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio × HPV',
        meta: slideMeta,
        content: 'CÂNCER DE COLO',
        rows: [
          { label: 'Rastreio', value: 'Citopatologia (Papanicolau) — não ultrassom', badge: 'hot', emphasis: 'highlight' },
          { label: 'HPV', value: 'Transmissão sexual — abrasões mucosas', badge: 'info' },
          { label: 'Preservativo', value: 'Proteção parcial — contato vulvar/perineal', badge: 'info' },
          { label: 'Prevenção', value: 'Vacina e barreira reduzem contágio', badge: 'info' },
        ],
        footer_rule: 'USG incorreta → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Câncer de colo — localizar afirmativa INCORRETA.',
          'Eliminar B — prevenção primária e HPV → correta.',
          'Eliminar C — transmissão sexual do HPV → correta.',
          'Eliminar D — preservativo parcial → correta.',
          'Testar A — ultrassonografia como rastreio principal → incorreta.',
          'Marcar letra A.',
        ],
        footer_rule: 'Citologia oncótica no SUS — não USG',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA',
        items: [
          { label: 'Letra B — prevenção HPV', detail: 'Vacina e barreira fazem prevenção primária.', correct: 'Afirmativa correta — não marcar.' },
          { label: 'Letra C — transmissão', detail: 'HPV por via sexual com microabrasões.', correct: 'Conduta correta — eliminar.' },
          { label: 'Letra D — preservativo', detail: 'Camisinha protege parcialmente.', correct: 'Orientação correta — não é a INCORRETA.' },
          { label: 'Pegadinha USG', detail: 'Ultrassom não substitui Papanicolau no rastreio.', correct: 'Método principal é citologia — letra A.' },
        ],
        footer_rule: 'Exceção: USG como rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067036141-2': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA — fatores de risco câncer de colo: HPV, tabaco, início precoce; amamentação não é fator',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fatores de risco — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Fatores de risco do câncer cérvico-uterino — assinalar o EXCETO.', icon: 'Target' },
          { label: 'EXCETO (D)', detail: 'Amamentação exclusiva não é fator de risco para câncer de colo.', icon: 'Ban' },
          { label: 'Pegadinha tabagismo', detail: 'Tabagismo associado ao risco — item A correto.', icon: 'AlertTriangle' },
          { label: 'Pegadinha início precoce', detail: 'Atividade sexual precoce — fator de risco — B.', icon: 'Clock' },
        ],
        footer_rule: 'AM exclusiva não é fator de risco',
      },
      {
        type: 'golden_rule',
        slide_title: 'Risco — colo',
        meta: slideMeta,
        content: 'FATORES HPV',
        rows: [
          { label: 'Tabaco', value: 'Fator de risco reconhecido', badge: 'hot' },
          { label: 'Início precoce', value: 'Atividade sexual precoce — risco', badge: 'hot' },
          { label: 'Nutrição', value: 'Hipovitaminose A — fator associado', badge: 'info' },
          { label: 'Não é', value: 'Aleitamento exclusivo até seis meses', badge: 'warn', emphasis: 'highlight' },
        ],
        footer_rule: 'EXCETO amamentação → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fatores de risco — qual NÃO se relaciona.',
          'Eliminar A — tabagismo → fator de risco.',
          'Eliminar B — início precoce da atividade sexual.',
          'Eliminar C — carências nutricionais.',
          'Testar D — amamentação exclusiva → não é fator de risco.',
          'Marcar letra D.',
        ],
        footer_rule: 'Amamentação não aumenta risco — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO RISCO',
        items: [
          { label: 'Letra A — tabagismo', detail: 'Tabaco eleva risco de lesões cervicais.', correct: 'Afirmativa correta — não marcar.' },
          { label: 'Letra B — início precoce', detail: 'Exposição precoce ao HPV.', correct: 'Conduta correta — eliminar.' },
          { label: 'Letra C — nutrição', detail: 'Hipovitaminose A associada.', correct: 'Fator de risco válido — não é o EXCETO.' },
          { label: 'Pegadinha amamentação', detail: 'Aleitamento protege o lactente — não fator de câncer de colo.', correct: 'Exceção da lista — letra D.' },
        ],
        footer_rule: 'HPV e comportamento — não lactação',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067036141-4': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'MS/INCA — vulvovaginites: vulva, vagina e colo; ossos fora do trato genital',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vulvovaginites — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Leucorreia e vulvovaginites — órgãos acometidos — assinalar EXCETO.', icon: 'Target' },
          { label: 'EXCETO (A)', detail: 'Ossos não são sítio de vulvovaginite.', icon: 'Ban' },
          { label: 'Pegadinha colo', detail: 'Colo uterino pode ser acometido — incluído no enunciado.', icon: 'Microscope' },
          { label: 'Pegadinha leucorreia', detail: 'Secreção fisiológica das mucosas vulvovaginais.', icon: 'Droplet' },
        ],
        footer_rule: 'Inflamação mucosa — não óssea',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sítios — IVAS',
        meta: slideMeta,
        content: 'VULVOVAGINITES',
        rows: [
          { label: 'Vulva', value: 'Mucosa vulvar — leucorreia fisiológica', badge: 'info' },
          { label: 'Vagina', value: 'Principal produtora de secreção', badge: 'hot' },
          { label: 'Colo', value: 'Ectocérvice e endocérvice', badge: 'hot' },
          { label: 'EXCETO', value: 'Ossos — estrutura não mucosa acometida', badge: 'warn', emphasis: 'highlight' },
        ],
        footer_rule: 'Ossos fora do escopo → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Vulvovaginites — qual órgão NÃO é acometido.',
          'Testar A — ossos → fora do trato genital inferior.',
          'Eliminar B — ureter (contiguidade/irradiação em prova).',
          'Eliminar C — bexiga (vizinhança anatômica).',
          'Eliminar D — face interna das coxas (contato vulvar).',
          'Marcar letra A.',
        ],
        footer_rule: 'Mucosas genitais — não osso — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANATOMIA',
        items: [
          { label: 'Letra B — ureter', detail: 'Pode ser citado em infecções adjacentes.', correct: 'Afirmativa correta — ureter na vizinhança pélvica.' },
          { label: 'Letra C — bexiga', detail: 'Vizinhança anatômica do trato genital.', correct: 'Conduta correta — bexiga pode ser envolvida contiguamente.' },
          { label: 'Letra D — coxas', detail: 'Pele adjacente à vulva.', correct: 'Afirmativa correta — face interna das coxas em contato.' },
          {
            label: 'Pegadinha colo',
            detail: 'Colo uterino pode ser acometido — incluído no enunciado.',
            correct: 'Colo no trato genital — ossos fora do escopo — gabarito A.',
          },
          {
            label: 'Letra A — ossos',
            detail: 'Estrutura óssea não é mucosa genital.',
            correct: 'Exceção — ossos não são sítio de vulvovaginite — gabarito A.',
          },
        ],
        footer_rule: 'Trato genital inferior',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067036141-5': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — detecção precoce câncer de colo: exame Papanicolau',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Detecção — colo',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Colo uterino exposto no canal vaginal — exame para detecção precoce.', icon: 'Target' },
          { label: 'Papanicolau (C)', detail: 'Citopatologia do colo — fatores predisponentes.', icon: 'Microscope' },
          { label: 'Pegadinha USG', detail: 'Ultrassonografia — não rastreio primário — D.', icon: 'AlertTriangle' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina complementa — não substitui citologia.', icon: 'Syringe' },
        ],
        footer_rule: 'Citologia de colo — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio — colo',
        meta: slideMeta,
        content: 'EXAME PREVENTIVO',
        rows: [
          { label: 'Exame', value: 'Papanicolau — citopatologia cervical', badge: 'hot', emphasis: 'highlight' },
          { label: 'Local', value: 'Colo no fundo do canal vaginal', badge: 'info' },
          { label: 'Objetivo', value: 'Lesões precursoras e HPV', badge: 'hot' },
          { label: 'Não é', value: 'Urina, sangue ou USG de rotina', badge: 'warn' },
        ],
        footer_rule: 'Papanicolau → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Detecção precoce do câncer de colo — qual exame.',
          'Eliminar A — urina.',
          'Eliminar B — sangue.',
          'Testar C — Papanicolau.',
          'Eliminar D — ultrassonografia.',
          'Marcar letra C.',
        ],
        footer_rule: 'Citopatologia cervical — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXAME',
        items: [
          { label: 'Letra A — urina', detail: 'Não rastreia displasia cervical.', correct: 'Urina não substitui citologia — escolher Papanicolau C.' },
          { label: 'Letra B — sangue', detail: 'Marcadores séricos não são rastreio de colo.', correct: 'Sangue não é exame preventivo de colo — gabarito C.' },
          { label: 'Letra D — USG', detail: 'Imagem complementar — não preventivo primário.', correct: 'Ultrassonografia não é o exame citológico — marcar C.' },
          { label: 'Pegadinha 25-64', detail: 'Faixa etária do rastreio citológico no SUS.', correct: 'Detecção precoce pelo Papanicolau — letra C.' },
        ],
        footer_rule: 'Colo = citologia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9': {
    family: 'protocolo',
    branch: 'mulher_papanicolau',
    guideline: 'MS 2016 — APS: ações educativas sobre prevenção de câncer de mama e colo',
    sources: [PF_SOURCE, INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'APS — Protocolo MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Protocolo de Atenção à Saúde das Mulheres — ação de rotina na APS.', icon: 'Target' },
          { label: 'Educação (D)', detail: 'Ações educativas sobre prevenção de câncer de mama e colo.', icon: 'Users' },
          { label: 'Pegadinha anual universal', detail: 'Educação inclui periodicidade trienal após esquema inicial.', icon: 'Clock' },
          { label: 'Pegadinha prescrição', detail: 'TE não prescreve contraceptivos — B.', icon: 'Ban' },
          { label: 'Pegadinha biópsia', detail: 'Biópsia não é solicitação direta do técnico — A.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Promoção educativa na APS — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'APS — mulher',
        meta: slideMeta,
        content: 'ROTINA MS 2016',
        rows: [
          { label: 'Educação', value: 'Prevenção câncer mama e colo do útero', badge: 'hot', emphasis: 'highlight' },
          { label: 'Rastreio', value: 'Estímulo a exames periódicos na atenção básica', badge: 'info' },
          { label: 'Não é TE', value: 'Prescrição, biópsia ou encaminhar todas', badge: 'warn' },
        ],
        footer_rule: 'Ações educativas → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Protocolo MS 2016 — ação de rotina na APS.',
          'Eliminar A — biópsia pelo técnico.',
          'Eliminar B — prescrição de contraceptivos pelo técnico.',
          'Eliminar C — encaminhar todas para especialista.',
          'Testar D — educação em prevenção de câncer mama e colo.',
          'Marcar letra D.',
        ],
        footer_rule: 'Promoção e prevenção → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — APS',
        items: [
          { label: 'Letra A — biópsia', detail: 'Procedimento invasivo com indicação médica.', correct: 'Educação em saúde — letra D.' },
          { label: 'Letra B — prescrição', detail: 'Prescrição é ato privativo.', correct: 'Prevenção mama e colo — gabarito D.' },
          { label: 'Letra C — encaminhar todas', detail: 'APS coordena — não centraliza tudo.', correct: 'Ação educativa rotineira — marcar D.' },
          { label: 'Pegadinha trienal', detail: 'Educação inclui periodicidade do Papanicolau.', correct: 'Promoção na atenção primária — letra D.' },
        ],
        footer_rule: 'Enfermagem educa na APS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104222222-5': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — ACS orienta Papanicolau: mulheres com ou que tiveram atividade sexual (25–64)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ACS — orientação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Terceiro câncer mais comum — citopatológico Papanicolau; ACS orienta mulheres com atividade sexual; óbito evitável com rastreio.',
            icon: 'Target',
          },
          { label: 'Vida sexual (B)', detail: 'Têm ou já tiveram atividade sexual.', icon: 'Users' },
          { label: 'Pegadinha início 40', detail: 'Faixa MS 25–64 — não 20–59 isolado — C e D.', icon: 'AlertTriangle' },
          { label: 'Pegadinha sem sexo', detail: 'Sem atividade sexual — não rastrear — A.', icon: 'XCircle' },
        ],
        footer_rule: 'Atividade sexual presente ou passada — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio — ACS',
        meta: slideMeta,
        content: 'PAPELANICOLAU',
        rows: [
          { label: 'Critério', value: 'Atividade sexual — atual ou prévia', badge: 'hot', emphasis: 'highlight' },
          { label: 'Faixa', value: 'Especialmente 25 a 64 anos', badge: 'hot' },
          { label: 'Exame', value: 'Citopatológico Papanicolau periódico', badge: 'info' },
          { label: 'ACS', value: 'Agente comunitário orienta rastreio', badge: 'info' },
          { label: 'Não é', value: 'Todas independente de vida sexual', badge: 'warn' },
        ],
        footer_rule: 'Com vida sexual → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'ACS — orientar submissão ao Papanicolau.',
          'Eliminar A — com ou sem atividade sexual.',
          'Testar B — têm ou já tiveram atividade sexual.',
          'Eliminar C — faixa 20 a 59 sem critério sexual.',
          'Eliminar D — 25 a 59 omitindo teto de 64 anos.',
          'Marcar letra B.',
        ],
        footer_rule: 'Vida sexual — critério base — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACS',
        items: [
          { label: 'Letra A — todas', detail: 'Sem vida sexual não entra no rastreio.', correct: 'Atividade sexual — letra B.' },
          { label: 'Letra C — 20-59', detail: 'Marco de início aos 25 anos.', correct: 'Têm ou tiveram relação — gabarito B.' },
          { label: 'Letra D — 25-59', detail: 'Rastreio até 64 anos.', correct: 'Critério sexual — marcar B.' },
          { label: 'Pegadinha HPV', detail: 'HPV transmite por via sexual.', correct: 'Orientação ACS — letra B.' },
        ],
        footer_rule: 'Citopatologia e vida sexual',
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
    console.log(`[handcraft:sm-g20] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g20] total=${ok}`);
}

main();
