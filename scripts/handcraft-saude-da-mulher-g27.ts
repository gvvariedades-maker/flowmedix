#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g27 (7 slugs mulher_planejamento P2).
 *
 *   npm run handcraft:saude-da-mulher-g27
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g27 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g27';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — Planejamento familiar',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_26_planejamento_familiar.pdf',
  covers: [
    'métodos comportamentais',
    'métodos de barreira',
    'anticoncepcional oral',
    'DIU contraindicações',
    'dupla proteção',
    'laqueadura legal',
  ],
};

const LEI_PF_SOURCE = {
  id: 'lei-9263-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Planalto / MS',
  title: 'Lei nº 9.263/1996 — Planejamento familiar',
  year: 1996,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l9263.htm',
  covers: ['esterilização cirúrgica', 'laqueadura', 'vasectomia', 'notificação compulsória'],
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

type Branch = 'mulher_planejamento';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  sources?: (typeof PF_SOURCE | typeof LEI_PF_SOURCE)[];
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
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [PF_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/daprole/g, 'da prole')
    .replace(/autorizadas,fiscalizadas/g, 'autorizadas, fiscalizadas')
    .replace(/do grupo deplanejamento/g, 'do grupo de planejamento')
    .replace(/após30/g, 'após 30')
    .replace(/www\.planalto\.gov\.br[^\s]*/gi, '')
    .replace(/\(Fonte:[^)]*\)/gi, '')
    .trim();
}

function cleanRomanItems(s: string): string {
  return s
    .replace(/\nI-/g, '\nI -')
    .replace(/\nII-/g, '\nII -')
    .replace(/\nIII-/g, '\nIII -')
    .replace(/\nIV-/g, '\nIV -')
    .replace(/\nV-/g, '\nV -')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'cetrede-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-8': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS — Lei 9.263/1996 e Caderno AB 26 planejamento familiar: esterilização só laqueadura e vasectomia',
    sources: [LEI_PF_SOURCE, PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lei — PF INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Planejamento familiar — Lei 9.263 — assinalar afirmativa INCORRETA.', icon: 'Target' },
          { label: 'Pegadinha esterilização', detail: 'Histerectomia e ooforectomia não são métodos contraceptivos — só laqueadura e vasectomia.', icon: 'AlertTriangle' },
          { label: 'Conduta A', detail: 'Ações em instituições públicas e privadas — afirmativa correta.', icon: 'CheckCircle' },
          { label: 'Notificação', detail: 'Esterilização cirúrgica — notificação compulsória ao SUS.', icon: 'Shield' },
        ],
        footer_rule: 'Esterilização = laqueadura ou vasectomia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Lei 9.263 — contracepção',
        meta: slideMeta,
        content: 'PLANEJAMENTO FAMILIAR',
        rows: [
          { label: 'Permitido', value: 'Laqueadura tubária e vasectomia', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não é PF', value: 'Histerectomia ou ooforectomia como contraceptivo', badge: 'warn' },
          { label: 'Vedação', value: 'Induzir esterilização cirúrgica', badge: 'info' },
          { label: 'Notificação', value: 'Esterilização — notificação compulsória ao SUS', badge: 'info' },
        ],
        footer_rule: 'INCORRETA = letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando INCORRETA — Lei do planejamento familiar.',
          'Letra A — instituições públicas e privadas → correta.',
          'Letra B — participação estrangeira fiscalizada → correta.',
          'Letra C — inclui histerectomia/ooforectomia → falsa.',
          'Letra D — veda indução à esterilização → correta.',
          'Letra E — notificação compulsória → correta.',
          'Marcar letra C.',
        ],
        footer_rule: 'Histerectomia não é contraceptivo — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESTERILIZAÇÃO',
        items: [
          { label: 'Letra A — instituições', detail: 'PF pode ser exercido em rede pública e privada.', correct: 'Afirmativa correta — não é a INCORRETA.' },
          { label: 'Letra B — capital estrangeiro', detail: 'Permitido com autorização e fiscalização do SUS.', correct: 'Afirmativa verdadeira — conduta correta da lei.' },
          { label: 'Letra C — esterilização', detail: 'Lista histerectomia e ooforectomia como contraceptivo.', correct: 'Falsa — pegadinha: só laqueadura e vasectomia.' },
          { label: 'Letra D — indução', detail: 'Lei proíbe instigar esterilização.', correct: 'Afirmativa correta — não é o EXCETO.' },
          { label: 'Letra E — notificação', detail: 'Esterilização é de notificação compulsória.', correct: 'Verdadeira — histerectomia não entra como PF.' },
        ],
        footer_rule: 'Laqueadura × vasectomia apenas',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003654722-6': {
    family: 'protocolo',
    branch: 'mulher_planejamento',
    guideline: 'MS Caderno AB 26 — DIU de cobre: contraindicado em malformações uterinas (útero bicorno); HIV tratado e nuliparidade não são absolutas',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DIU — contraindicação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ações educativas de planejamento familiar — contraindicações do DIU de cobre.', icon: 'Target' },
          { label: 'Útero bicorno', detail: 'Malformação uterina — contraindica inserção do DIU de cobre.', icon: 'Ban' },
          { label: 'Pegadinha nuliparidade', detail: 'Nuliparidade não é contraindicação absoluta no SUS.', icon: 'AlertTriangle' },
          { label: 'Pegadinha HIV', detail: 'HIV assintomático com tratamento — não contraindica isolado.', icon: 'Shield' },
        ],
        footer_rule: 'Anomalia uterina — DIU de cobre',
      },
      {
        type: 'golden_rule',
        slide_title: 'DIU — critérios',
        meta: slideMeta,
        content: 'DIU DE COBRE',
        rows: [
          { label: 'Contraindica', value: 'Útero bicorno, gravidez, DIP ativa, sangramento inexplicado', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não contraindica', value: 'Nuliparidade, HIV assintomático, sífilis já tratada', badge: 'info' },
          { label: 'Ectopia cervical', value: 'História de ectopia cervical tratada — avaliar caso a caso', badge: 'info' },
          { label: 'Pegadinha', value: 'Nulípara elegível no protocolo SUS', badge: 'warn' },
        ],
        footer_rule: 'Malformação uterina — contraindicação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Planejamento familiar — contraindicações do DIU de cobre.',
          'Eliminar A — HIV assintomático com acompanhamento.',
          'Eliminar B — nuliparidade não é absoluta.',
          'Eliminar C — ectopia cervical tratada.',
          'Eliminar D — sífilis já tratada.',
          'Testar E — útero bicorno.',
          'Marcar letra E.',
        ],
        footer_rule: 'Útero bicorno — contraindicação — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIU DE COBRE',
        items: [
          { label: 'Letra A — HIV assintomático', detail: 'Com TARV e acompanhamento pode usar DIU.', correct: 'Nuliparidade não contraindica — eliminar A.' },
          { label: 'Letra B — nuliparidade', detail: 'DIU é opção para nulíparas elegíveis no planejamento familiar.', correct: 'HIV assintomático controlado — eliminar B.' },
          { label: 'Letra C — ectopia cervical', detail: 'Ectopia cervical tratada não contraindica de rotina.', correct: 'Sífilis tratada não impede — eliminar C.' },
          { label: 'Letra D — sífilis tratada', detail: 'Sorologia positiva para sífilis já tratada.', correct: 'Útero bicorno contraindica DIU — marcar E.' },
        ],
        footer_rule: 'Malformação uterina — útero bicorno',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-saude-da-mulher-1777104329543-5': {
    family: 'vf',
    branch: 'mulher_planejamento',
    guideline: 'MS — métodos comportamentais: tabelinha, temperatura basal, coito interrompido, muco cervical; oral é hormonal',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Comportamentais — VF',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Julgar I–V — métodos comportamentais apenas.', icon: 'Target' },
          { label: 'Pegadinha I', detail: 'Anticoncepcional oral = hormonal — não comportamental.', icon: 'AlertTriangle' },
          { label: 'Comportamentais', detail: 'Tabelinha, temperatura basal, coito interrompido, muco cervical.', icon: 'ListChecks' },
          { label: 'Pegadinha oral', detail: 'Pílula não depende só de observação do ciclo.', icon: 'Pill' },
        ],
        footer_rule: 'Julgar I antes de cruzar letras',
      },
      {
        type: 'golden_rule',
        slide_title: 'Categorias — PF',
        meta: slideMeta,
        content: 'MÉTODOS',
        rows: [
          { label: 'Comportamentais', value: 'Tabelinha · temperatura basal · coito interrompido · muco cervical', badge: 'hot', emphasis: 'highlight' },
          { label: 'Hormonais', value: 'Anticoncepcional oral combinado ou progestagênio', badge: 'info' },
          { label: 'Barreira', value: 'Preservativo · diafragma', badge: 'info' },
          { label: 'Pegadinha oral', value: 'Pílula não é método comportamental', badge: 'warn', emphasis: 'alert' },
        ],
        footer_rule: 'I falsa — II a V verdadeiras',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato I–V — métodos comportamentais apenas.',
          'Julgar I — anticoncepcional oral → falsa.',
          'Julgar II — tabelinha → verdadeira.',
          'Julgar III — temperatura basal → verdadeira.',
          'Julgar IV — coito interrompido → verdadeira.',
          'Julgar V — muco cervical → verdadeira.',
          'Conjunto II, III, IV e V.',
          'Eliminar A, B, C e D por incluir I ou omitir II.',
          'Marcar letra E.',
        ],
        footer_rule: 'Conjunto II–V verdadeiro — marcar E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ORAL × COMPORTAMENTAL',
        items: [
          { label: 'Letra A — IV e V', detail: 'Omite tabelinha e temperatura basal.', correct: 'Faltam II e III — eliminar A.' },
          { label: 'Letra B — I, II e III', detail: 'Inclui anticoncepcional oral.', correct: 'I é hormonal — eliminar B.' },
          { label: 'Letra C — III, IV e V', detail: 'Exclui tabelinha.', correct: 'II é comportamental — eliminar C.' },
          { label: 'Letra D — I, II e IV', detail: 'Mistura oral com comportamentais.', correct: 'Conjunto II–V — marcar E.' },
        ],
        footer_rule: 'Hormonal ≠ comportamental',
      },
    ],
    cleanInstruction: (s) => cleanRomanItems(cleanPdfNoise(s)),
  },

  'instituto-consulplan-geral-saude-da-mulher-1777104235003-3': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS Caderno AB 26 — métodos de barreira: preservativo e diafragma; DIU e anticoncepcional oral não são barreira',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Barreira — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Planejamento reprodutivo — regulação da fecundidade — métodos contraceptivos de barreira — EXCETO.', icon: 'Target' },
          { label: 'Pegadinha oral', detail: 'Anticoncepcional oral é hormonal — não é método de barreira.', icon: 'AlertTriangle' },
          { label: 'Barreira A', detail: 'Diafragma — barreira mecânica para adultos e adolescentes.', icon: 'CheckCircle' },
          { label: 'Barreira B', detail: 'Preservativo — barreira para vida sexual com ou sem parcerias estáveis.', icon: 'Shield' },
        ],
        footer_rule: 'Oral hormonal ≠ barreira mecânica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Classificação — PF',
        meta: slideMeta,
        content: 'MÉTODOS DE BARREIRA',
        rows: [
          { label: 'Barreira', value: 'Preservativo e diafragma — fecundidade e IST', badge: 'hot', emphasis: 'highlight' },
          { label: 'Hormonal', value: 'Anticoncepcional oral para jovens e adultos', badge: 'info' },
          { label: 'LARC', value: 'DIU de cobre — não é método de barreira', badge: 'warn' },
          { label: 'Pegadinha oral', value: 'Pílula regula fecundidade por via hormonal', badge: 'warn' },
        ],
        footer_rule: 'EXCETO anticoncepcional oral — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO — métodos contraceptivos de barreira.',
          'Letra A — diafragma → barreira correta.',
          'Letra B — preservativo → barreira correta.',
          'Letra C — DIU de cobre → não é barreira, mas gabarito é outro.',
          'Letra D — anticoncepcional oral → não é barreira.',
          'Marcar letra D.',
        ],
        footer_rule: 'Hormonal não é barreira — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BARREIRA',
        items: [
          { label: 'Letra A — diafragma', detail: 'Barreira mecânica com espermicida.', correct: 'Conduta correta como método de barreira — não é o EXCETO.' },
          { label: 'Letra B — preservativo', detail: 'Protege IST e gravidez no planejamento reprodutivo.', correct: 'Afirmativa correta — método de barreira clássico.' },
          { label: 'Letra C — DIU de cobre', detail: 'Dispositivo intrauterino — LARC, não barreira.', correct: 'Não é barreira, mas afirmativa correta no rol — gabarito é oral D.' },
          { label: 'Letra D — anticoncepcional oral', detail: 'Método hormonal sistêmico.', correct: 'Exceção — não é método contraceptivo de barreira.' },
        ],
        footer_rule: 'Barreira = mecânica ou química local',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'legalle-enfermagem-processo-de-enfermagem-1780010594524-0': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS — anticoncepcionais orais: monofásicos, bifásicos, trifásicos combinados e minipílulas (progestagênio)',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ACO — tipos',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Classificação dos métodos anticoncepcionais orais.', icon: 'Target' },
          { label: 'Esquema (B)', detail: 'Monofásicos, bifásicos, trifásicos e minipílulas.', icon: 'Pill' },
          { label: 'Pegadinha periodicidade', detail: 'Mensais/trimestrais são vias, não tipos de pílula — A.', icon: 'Clock' },
          { label: 'Pegadinha transdérmico', detail: 'Adesivo e anel são outras vias — C e D.', icon: 'Ban' },
        ],
        footer_rule: 'Tipos de comprimido oral',
      },
      {
        type: 'golden_rule',
        slide_title: 'Oral — classificação',
        meta: slideMeta,
        content: 'ANTICONCEPCIONAL ORAL',
        rows: [
          { label: 'Combinados', value: 'Monofásico · bifásico · trifásico', badge: 'hot', emphasis: 'highlight' },
          { label: 'Progestagênio', value: 'Minipílula', badge: 'hot' },
          { label: 'Outras vias', value: 'Adesivo, anel, injetável, implante', badge: 'info' },
          { label: 'Pegadinha', value: 'Periodicidade mensal ≠ classificação do comprimido', badge: 'warn' },
        ],
        footer_rule: 'B = tipos orais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Métodos hormonais orais — classificação.',
          'Eliminar A — mensais/trimestrais/implante (vias distintas).',
          'Testar B — monofásicos, bifásicos, trifásicos e minipílulas.',
          'Eliminar C — adesivo, anel, vaginal.',
          'Eliminar D — implante e injetável.',
          'Eliminar E — anel e trimestrais misturados.',
          'Marcar letra B.',
        ],
        footer_rule: 'Tipologia oral — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACO',
        items: [
          { label: 'Letra A — periodicidade', detail: 'Mensal/trimestral não classifica tipo de pílula.', correct: 'Monofásico/bifásico/trifásico — eliminar A.' },
          { label: 'Letra C — transdérmico', detail: 'Adesivo e anel não são comprimidos.', correct: 'Minipílula incluída — eliminar C.' },
          { label: 'Letra D — implante', detail: 'Implante é LARC, não oral.', correct: 'Classificação oral — eliminar D.' },
          { label: 'Letra E — anel', detail: 'Anel vaginal é via distinta.', correct: 'Esquema combinado + minipílula — marcar B.' },
        ],
        footer_rule: 'Via oral × outras vias',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-processo-de-enfermagem-1780001673873-5': {
    family: 'protocolo',
    branch: 'mulher_planejamento',
    guideline: 'MS — ACO combinado: tomada diária no mesmo horário; atenção a interações medicamentosas; não previne IST',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ACO combinado',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Uso correto do anticoncepcional oral combinado.', icon: 'Target' },
          { label: 'Adesão (B)', detail: 'Diariamente no mesmo horário; cuidado com interações.', icon: 'Clock' },
          { label: 'Pegadinha IST', detail: 'ACO não previne IST — D falso.', icon: 'Shield' },
          { label: 'Pegadinha ciclo', detail: 'Início e eficácia dependem do protocolo — A parcial.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mesmo horário + interações',
      },
      {
        type: 'golden_rule',
        slide_title: 'ACO — orientação',
        meta: slideMeta,
        content: 'COMBINADO ORAL',
        rows: [
          { label: 'Adesão', value: '1 comprimido/dia no mesmo horário', badge: 'hot', emphasis: 'highlight' },
          { label: 'Interações', value: 'Alguns fármacos reduzem eficácia', badge: 'hot' },
          { label: 'IST', value: 'Não substitui preservativo', badge: 'warn' },
          { label: 'Efeitos', value: 'Sangramento irregular pode ocorrer no início', badge: 'info' },
        ],
        footer_rule: 'Horário fixo — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Anticoncepcional oral combinado — afirmativa correta.',
          'Eliminar A — início depende do protocolo e ciclo.',
          'Testar B — horário fixo e interações medicamentosas.',
          'Eliminar C — alterações menstruais não dispensam adesão.',
          'Eliminar D — não previne IST.',
          'Eliminar E — efeitos adversos existem e exigem orientação.',
          'Marcar letra B.',
        ],
        footer_rule: 'Adesão e interações — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACO',
        items: [
          { label: 'Letra A — qualquer dia', detail: 'Início segue protocolo do ciclo.', correct: 'Mesmo horário diário — eliminar A.' },
          { label: 'Letra C — ciclo irregular', detail: 'Adesão horária continua obrigatória.', correct: 'Interações medicamentosas — eliminar C.' },
          { label: 'Letra D — IST', detail: 'Hormonal não é barreira.', correct: 'Tomada diária — eliminar D.' },
          { label: 'Letra E — sem efeitos', detail: 'Efeitos adversos podem ocorrer.', correct: 'Orientação correta — marcar B.' },
        ],
        footer_rule: 'ACO + preservativo se IST',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS — dupla proteção: preservativo (IST) + método contraceptivo eficaz; camisinha + vasectomia',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dupla proteção',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Dupla proteção — gravidez e IST no planejamento familiar.', icon: 'Target' },
          { label: 'Par (D)', detail: 'Camisinha masculina + vasectomia.', icon: 'Shield' },
          { label: 'Pegadinha oral', detail: 'Pílula não previne IST — A inadequada.', icon: 'Pill' },
          { label: 'Pegadinha DIU', detail: 'DIU + gel não cobre IST adequadamente — B.', icon: 'Ban' },
        ],
        footer_rule: 'Barreira + contraceptivo definitivo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Dupla proteção — MS',
        meta: slideMeta,
        content: 'PF + IST',
        rows: [
          { label: 'IST', value: 'Preservativo masculino ou feminino', badge: 'hot', emphasis: 'highlight' },
          { label: 'Gravidez', value: 'Método contraceptivo eficaz (ex.: vasectomia)', badge: 'hot' },
          { label: 'Dupla', value: 'Barreira + método anticoncepcional', badge: 'info' },
          { label: 'Pegadinha', value: 'Duas camisinhas masculinas — incorreto', badge: 'warn' },
        ],
        footer_rule: 'Camisinha + vasectomia — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Educação em saúde — dupla proteção.',
          'Eliminar A — oral não previne IST.',
          'Eliminar B — DIU e espermicida: IST frágil.',
          'Eliminar C — diafragma + injetável sem barreira explícita.',
          'Testar D — camisinha e vasectomia.',
          'Eliminar E — duas camisinhas feminina/masculina sem segundo método.',
          'Marcar letra D.',
        ],
        footer_rule: 'IST + anticoncepção — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DUPLA PROTEÇÃO',
        items: [
          { label: 'Letra A — oral + vasectomia', detail: 'Anticoncepcional oral não previne IST.', correct: 'Pegadinha oral — eliminar A; usar camisinha.' },
          { label: 'Letra B — DIU + gel', detail: 'DIU de cobre e gel espermicida: IST frágil.', correct: 'Pegadinha DIU — eliminar B; barreira masculina.' },
          { label: 'Letra C — diafragma + injetável', detail: 'Falta barreira contra IST na dupla proteção.', correct: 'Preservativo + vasectomia — eliminar C.' },
          { label: 'Letra D — camisinha + vasectomia', detail: 'Camisinha masculina e vasectomia.', correct: 'Dupla proteção IST + gravidez — marcar D.' },
          { label: 'Letra E — duas camisinhas', detail: 'Camisinha feminina e camisinha masculina.', correct: 'Duas barreiras sem anticoncepção adicional — eliminar E.' },
        ],
        footer_rule: 'Preservativo é eixo da IST',
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
    console.log(`[handcraft:sm-g27] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g27] total=${ok}`);
}

main();
