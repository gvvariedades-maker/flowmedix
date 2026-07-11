#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g28 (8 slugs mulher_generico).
 *
 *   npm run handcraft:saude-da-mulher-g28
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g28 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g28';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const SM_SOURCE = {
  id: 'ms-saude-mulher-aps',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — saúde da mulher e APS',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: [
    'terminologia obstétrica',
    'anatomia feminina',
    'transmissão vertical',
    'sangramento uterino',
    'esterilização cirúrgica',
  ],
};

const LEI_PF_SOURCE = {
  id: 'lei-9263-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Planalto / MS',
  title: 'Lei nº 9.263/1996 — Planejamento familiar',
  year: 1996,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l9263.htm',
  covers: ['laqueadura', 'vasectomia', 'aconselhamento', 'idade mínima'],
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

type Branch = 'mulher_generico';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof SM_SOURCE | typeof LEI_PF_SOURCE)[];
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
    },
    sources: pack.sources ?? [SM_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\bÁ\b/g, 'À')
    .replace(/no\s+7\/2023/gi, 'nº 7/2023')
    .trim();
}

function cleanRomanItems(s: string): string {
  return s
    .replace(/\nI\./g, '\nI -')
    .replace(/\nII\./g, '\nII -')
    .replace(/\nIII\./g, '\nIII -')
    .replace(/\nIV\./g, '\nIV -')
    .replace(/\nV\./g, '\nV -')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-saude-da-mulher-1777104340484-4': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — terminologia ginecológica: metrorragia = sangramento fora do ciclo, não excessivo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia — sangramento',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Dicionário de Saúde da Mulher — sangramento fora do período menstrual, não excessivo, intervalos irregulares.', icon: 'Target' },
          { label: 'Metrorragia', detail: 'Sangramento uterino fora do ciclo menstrual — volume não excessivo.', icon: 'Droplets' },
          { label: 'Pegadinha menometrorragia', detail: 'Menometrorragia = irregular + volume aumentado — não é só “não excessivo”.', icon: 'AlertTriangle' },
          { label: 'Pegadinha pubarca', detail: 'Pubarca = aparecimento de pelos pubianos — marco de maturação.', icon: 'Ban' },
        ],
        footer_rule: 'Fora do ciclo sem hipermenorreia — metrorragia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sangramento — glossário',
        meta: slideMeta,
        content: 'TERMINOLOGIA',
        rows: [
          { label: 'Metrorragia', value: 'Sangramento fora do período menstrual', badge: 'hot', emphasis: 'highlight' },
          { label: 'Menorragia', value: 'Sangramento menstrual excessivo em volume', badge: 'info' },
          { label: 'Menometrorragia', value: 'Irregular + aumento de fluxo', badge: 'warn' },
          { label: 'Dispareunia', value: 'Dor durante relação sexual', badge: 'info' },
        ],
        footer_rule: 'Irregular sem excesso — metrorragia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Terminologia — sangramento fora do ciclo, não excessivo.',
          'Eliminar B — pubarca é maturação puberal.',
          'Eliminar C — dispareunia é dor na relação.',
          'Eliminar D — menometrorragia inclui excesso de fluxo.',
          'Testar A — metrorragia.',
          'Marcar letra A.',
        ],
        footer_rule: 'Metrorragia — sangramento intermenstrual',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GLOSSÁRIO',
        items: [
          { label: 'Letra B — pubarca', detail: 'Marco de desenvolvimento puberal.', correct: 'Metrorragia é sangramento — eliminar B.' },
          { label: 'Letra C — dispareunia', detail: 'Dor durante coito.', correct: 'Fora do ciclo menstrual — eliminar C.' },
          { label: 'Letra D — menometrorragia', detail: 'Fluxo aumentado e irregular.', correct: 'Não excessivo pede metrorragia — eliminar D.' },
        ],
        footer_rule: 'Menometrorragia ≠ metrorragia simples',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fafipa-enfermagem-processo-de-enfermagem-1780009392850-3': {
    family: 'vf',
    branch: 'mulher_generico',
    guideline: 'MS Lei 9.263/1996 e Nota Técnica 7/2023 SESA-PR — laqueadura: aconselhamento + idade 21 ou 2 filhos vivos',
    sources: [LEI_PF_SOURCE, SM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Laqueadura — critérios VF',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Nota Técnica 7/2023 SESA-PR — critérios para laqueadura e vasectomia — julgar I–V.', icon: 'Target' },
          { label: 'Pegadinha I', detail: 'Maior de 18 anos sem exigir filhos — critério insuficiente na norma.', icon: 'AlertTriangle' },
          { label: 'Verdadeiras II–III', detail: 'Aconselhamento multidisciplinar + 21 anos ou dois filhos vivos.', icon: 'CheckCircle' },
          { label: 'Pegadinha IV', detail: 'Exige 21 anos E dois filhos (e) — mais restritivo que o correto (ou).', icon: 'Ban' },
        ],
        footer_rule: 'Julgar I–V antes de cruzar letras',
      },
      {
        type: 'golden_rule',
        slide_title: 'Esterilização — referência',
        meta: slideMeta,
        content: 'LAQUEADURA / VASECTOMIA',
        rows: [
          { label: 'Aconselhamento', value: 'Equipe multidisciplinar obrigatória', badge: 'hot', emphasis: 'highlight' },
          { label: 'Idade / filhos', value: '≥21 anos ou pelo menos dois filhos vivos', badge: 'hot' },
          { label: 'Prazo', value: 'Manifestação de vontade com intervalo mínimo legal', badge: 'info' },
          { label: 'Pegadinha 18 anos', value: '18 anos isolado não basta na regra da prova', badge: 'warn' },
        ],
        footer_rule: 'II e III verdadeiras na prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato I–V — critérios laqueadura/vasectomia.',
          'Julgar I — 18 anos sem filhos → falsa.',
          'Julgar II — aconselhamento multidisciplinar → verdadeira.',
          'Julgar III — 21 anos ou dois filhos → verdadeira.',
          'Julgar IV — 21 anos e dois filhos → falsa.',
          'Julgar V — prazo entre manifestação e cirurgia — não entra no conjunto da prova.',
          'Conjunto II e III — eliminar demais letras.',
          'Marcar letra B.',
        ],
        footer_rule: 'Aconselhamento + idade ou filhos — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LAQUEADURA',
        items: [
          { label: 'Letra A — I e II', detail: 'Inclui critério de 18 anos.', correct: 'Pegadinha 18 anos — eliminar A.' },
          { label: 'Letra C — I e V', detail: 'Mantém afirmativa I falsa.', correct: 'II e III verdadeiras — eliminar C.' },
          { label: 'Letra D — I, II e V', detail: 'Inclui I falsa com II correta.', correct: 'Sem I — eliminar D.' },
          { label: 'Letra E — II, IV e V', detail: 'Inclui IV com “e” restritivo.', correct: 'Conjunto II e III — marcar B.' },
        ],
        footer_rule: 'OU (21 anos ou filhos) — não E',
      },
    ],
    cleanInstruction: (s) => cleanRomanItems(cleanPdfNoise(s)),
  },

  'fau-unicentro-enfermagem-nocoes-de-anatomia-1775447762008-2': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — anatomia feminina: cérvice = colo do útero (porção inferior do útero)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anatomia — cérvice',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'A cérvice — também é conhecida como qual estrutura do útero?', icon: 'Target' },
          { label: 'Colo do útero', detail: 'Cérvice = porção inferior e estreita do útero.', icon: 'Heart' },
          { label: 'Pegadinha fundo', detail: 'Fundo do útero é o topo — oposto ao colo do útero.', icon: 'AlertTriangle' },
          { label: 'Pegadinha próstata', detail: 'Fundo da próstata é órgão masculino — distrator de prova.', icon: 'Ban' },
        ],
        footer_rule: 'Cérvice = colo uterino',
      },
      {
        type: 'golden_rule',
        slide_title: 'Útero — partes',
        meta: slideMeta,
        content: 'ANATOMIA UTERINA',
        rows: [
          { label: 'Cérvice', value: 'Colo do útero — junção com vagina', badge: 'hot', emphasis: 'highlight' },
          { label: 'Corpo', value: 'Porção central do útero', badge: 'info' },
          { label: 'Fundo', value: 'Topo uterino acima das tubas', badge: 'info' },
          { label: 'Pegadinha', value: 'Coluna vertebral não se relaciona à cérvice', badge: 'warn' },
        ],
        footer_rule: 'Colo do útero — letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cérvice — sinônimo anatômico do colo do útero.',
          'Eliminar A — fundo do útero é outra porção.',
          'Eliminar B — base da coluna vertebral não se aplica.',
          'Eliminar C — topo da coluna não é cérvice.',
          'Eliminar E — fundo da próstata é masculino.',
          'Testar D — colo do útero.',
          'Marcar letra D.',
        ],
        footer_rule: 'Porção inferior do útero — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANATOMIA',
        items: [
          { label: 'Letra A — fundo do útero', detail: 'Parte superior do útero.', correct: 'Colo uterino — eliminar A.' },
          { label: 'Letra B — base da coluna', detail: 'Estrutura óssea vertebral.', correct: 'Cérvice uterina — eliminar B.' },
          { label: 'Letra C — topo da coluna', detail: 'Não é sinônimo de cérvice.', correct: 'Colo do útero — eliminar C.' },
          { label: 'Letra E — fundo da próstata', detail: 'Órgão masculino.', correct: 'Sinônimo correto — marcar D.' },
        ],
        footer_rule: 'Útero × coluna × próstata',
      },
    ],
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002549800-6': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — istmocele: defeito miometrial na porção baixa do útero (cesárea prévia)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Istmocele — órgão',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Defeito na parede anterior do miométrio na porção mais baixa — qual órgão?', icon: 'Target' },
          { label: 'Útero', detail: 'Miométrio = camada muscular do útero.', icon: 'Heart' },
          { label: 'Pegadinha próstata', detail: 'Próstata é masculina — distrator clássico.', icon: 'AlertTriangle' },
          { label: 'Pegadinha medula', detail: 'Medula e cérebro são SNC — não miométrio.', icon: 'Ban' },
        ],
        footer_rule: 'Miométrio = útero',
      },
      {
        type: 'golden_rule',
        slide_title: 'Istmocele — referência',
        meta: slideMeta,
        content: 'DEFEITO MIOMETRIAL',
        rows: [
          { label: 'Órgão', value: 'Útero — parede anterior baixa', badge: 'hot', emphasis: 'highlight' },
          { label: 'Contexto', value: 'Associado a cicatriz de cesárea segmentar', badge: 'info' },
          { label: 'Pegadinha', value: 'Coração tem miocárdio, não miométrio', badge: 'warn' },
          { label: 'Sintoma', value: 'Sangramento pós-menstrual possível', badge: 'info' },
        ],
        footer_rule: 'Istmocele — útero — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Istmocele — defeito miometrial inferior.',
          'Eliminar A — próstata é masculina.',
          'Eliminar C — coração não tem miométrio.',
          'Eliminar D — medula é SNC.',
          'Eliminar E — cérebro é SNC.',
          'Testar B — útero.',
          'Marcar letra B.',
        ],
        footer_rule: 'Miométrio uterino — letra B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ISTMOCELE',
        items: [
          { label: 'Letra A — próstata', detail: 'Órgão masculino.', correct: 'Miométrio uterino — eliminar A.' },
          { label: 'Letra C — coração', detail: 'Miocárdio, não miométrio.', correct: 'Parede uterina — eliminar C.' },
          { label: 'Letra D — medula', detail: 'Sistema nervoso central.', correct: 'Útero afetado — eliminar D.' },
          { label: 'Letra E — cérebro', detail: 'SNC sem miométrio.', correct: 'Defeito uterino — marcar B.' },
        ],
        footer_rule: 'Miométrio só no útero',
      },
    ],
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104295283-0': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — transmissão vertical: passagem de infecção ou doença da mãe para o filho',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Transmissão vertical',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Transmissão vertical — doença ou infecção da mãe para quem?', icon: 'Target' },
          { label: 'Filho', detail: 'Vertical = mãe → concepto/filho (gestação, parto ou amamentação).', icon: 'Baby' },
          { label: 'Pegadinha pai', detail: 'Transmissão horizontal ou sexual — não é vertical clássica.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mãe', detail: 'Origem é a mãe — destino não pode ser ela mesma.', icon: 'Ban' },
        ],
        footer_rule: 'Mãe para filho — vertical',
      },
      {
        type: 'golden_rule',
        slide_title: 'Transmissão — tipos',
        meta: slideMeta,
        content: 'VERTICAL',
        rows: [
          { label: 'Vertical', value: 'Mãe → filho (gestação, parto, leite)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Horizontal', value: 'Entre pessoas do mesmo grupo etário', badge: 'info' },
          { label: 'Exemplos', value: 'HIV, sífilis, toxoplasmose na gestação', badge: 'info' },
          { label: 'Pegadinha', value: 'Pai não é destino da transmissão vertical', badge: 'warn' },
        ],
        footer_rule: 'Destino = filho — E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Transmissão vertical — mãe para destinatário.',
          'Eliminar A — mãe é a fonte, não o destino.',
          'Eliminar B — pai não define vertical materno-fetal.',
          'Eliminar C — avós não são destino típico.',
          'Eliminar D — primos não se aplicam.',
          'Testar E — filho.',
          'Marcar letra E.',
        ],
        footer_rule: 'Mãe → filho — transmissão vertical',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VERTICAL',
        items: [
          { label: 'Letra A — mãe', detail: 'Fonte, não destino.', correct: 'Filho é destino — eliminar A.' },
          { label: 'Letra B — pai', detail: 'Não é transmissão vertical clássica.', correct: 'Concepto/filho — eliminar B.' },
          { label: 'Letra C — avós', detail: 'Geração anterior não recebe vertical.', correct: 'Filho — eliminar C.' },
          { label: 'Letra D — primos', detail: 'Parentesco lateral irrelevante.', correct: 'Transmissão vertical — marcar E.' },
        ],
        footer_rule: 'Fonte materna — destino filho',
      },
    ],
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104295283-9': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — terminologia obstétrica: nulípara e primípara descrevem condição obstétrica da mulher',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nulípara × primípara',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Termos nulípara e primípara — a que se relacionam?', icon: 'Target' },
          { label: 'Obstétrica', detail: 'Paridade e histórico de partos da mulher.', icon: 'Heart' },
          { label: 'Pegadinha muscular', detail: 'Paralisia muscular não define paridade.', icon: 'AlertTriangle' },
          { label: 'Pegadinha RN', detail: 'Crescimento do recém-nascido é outro campo.', icon: 'Ban' },
        ],
        footer_rule: 'Paridade obstétrica — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Paridade — glossário',
        meta: slideMeta,
        content: 'TERMINOLOGIA OBSTÉTRICA',
        rows: [
          { label: 'Nulípara', value: 'Nunca pariu (paridade zero)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Primípara', value: 'Um parto anterior', badge: 'hot' },
          { label: 'Multípara', value: 'Dois ou mais partos', badge: 'info' },
          { label: 'Pegadinha', value: 'Não confundir com neurológico ou pediatria', badge: 'warn' },
        ],
        footer_rule: 'Condição obstétrica da mulher',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Nulípara e primípara — classificação obstétrica.',
          'Eliminar A — músculos esqueléticos não se aplicam.',
          'Testar B — condições obstétricas da mulher.',
          'Eliminar C — resposta neurológica pós-trauma.',
          'Eliminar D — crescimento do recém-nascido.',
          'Eliminar E — envelhecimento fisiológico.',
          'Marcar letra B.',
        ],
        footer_rule: 'Paridade materna — letra B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARIDADE',
        items: [
          { label: 'Letra A — músculos', detail: 'Paralisia muscular voluntária.', correct: 'Obstétrica — eliminar A.' },
          { label: 'Letra C — neurológico', detail: 'Trauma e reflexos.', correct: 'Paridade — eliminar C.' },
          { label: 'Letra D — recém-nascido', detail: 'Desenvolvimento infantil.', correct: 'Condição da mulher — eliminar D.' },
          { label: 'Letra E — envelhecimento', detail: 'Sinais fisiológicos do envelhecimento.', correct: 'Nulípara/primípara — marcar B.' },
        ],
        footer_rule: 'Histórico de partos da mulher',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104340484-2': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — terminologia: lactante = mulher que amamenta; lactente = bebê que mama',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lactante × lactente',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Mulher que fornece leite materno — qual termo?', icon: 'Target' },
          { label: 'Lactante', detail: 'Mulher que amamenta — fornece leite.', icon: 'Heart' },
          { label: 'Pegadinha lactente', detail: 'Lactente é o bebê que recebe o leite.', icon: 'AlertTriangle' },
          { label: 'Pegadinha nulípara', detail: 'Nulípara = nunca pariu — não define amamentação.', icon: 'Ban' },
        ],
        footer_rule: 'Quem produz leite — lactante',
      },
      {
        type: 'golden_rule',
        slide_title: 'Amamentação — termos',
        meta: slideMeta,
        content: 'LEITE MATERNO',
        rows: [
          { label: 'Lactante', value: 'Mulher que amamenta', badge: 'hot', emphasis: 'highlight' },
          { label: 'Lactente', value: 'Bebê em aleitamento', badge: 'info' },
          { label: 'Hipolactia', value: 'Produção insuficiente de leite', badge: 'warn' },
          { label: 'Menarca', value: 'Primeira menstruação — não amamentação', badge: 'info' },
        ],
        footer_rule: 'Fornecedora do leite — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Quem fornece leite materno?',
          'Eliminar A — lactente é o bebê.',
          'Testar B — lactante.',
          'Eliminar C — hipolactia é condição de produção.',
          'Eliminar D — nulípara é paridade.',
          'Eliminar E — menarca é primeira menstruação.',
          'Marcar letra B.',
        ],
        footer_rule: 'Lactante = mulher que amamenta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LACTANTE',
        items: [
          { label: 'Letra A — lactente', detail: 'Bebê que mama.', correct: 'Quem fornece leite — eliminar A.' },
          { label: 'Letra C — hipolactia', detail: 'Baixa produção láctea.', correct: 'Lactante — eliminar C.' },
          { label: 'Letra D — nulípara', detail: 'Nunca pariu.', correct: 'Mulher amamentando — eliminar D.' },
          { label: 'Letra E — menarca', detail: 'Primeira menstruação.', correct: 'Fornecedora do leite — marcar B.' },
        ],
        footer_rule: 'Lactente bebê × lactante mãe',
      },
    ],
  },

  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-5': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — síndrome de Couvade: parceiro gestacional com sintomas similares à gestante',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Couvade — gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Homem com sintomas da parceira grávida — enjoos, desejos, choro, ganho de peso.', icon: 'Target' },
          { label: 'Couvade', detail: 'Síndrome de Couvade — sintomas psicossomáticos do parceiro.', icon: 'Users' },
          { label: 'Pegadinha Klinefelter', detail: 'Klinefelter = cromossomo sexual masculino — não couvade.', icon: 'AlertTriangle' },
          { label: 'Pegadinha Turner', detail: 'Turner = monossomia X feminina — distrator genético.', icon: 'Ban' },
        ],
        footer_rule: 'Parceiro espelha sintomas — Couvade',
      },
      {
        type: 'golden_rule',
        slide_title: 'Síndromes — referência',
        meta: slideMeta,
        content: 'GESTAÇÃO PARCEIRA',
        rows: [
          { label: 'Couvade', value: 'Parceiro com náuseas e sintomas da gestante', badge: 'hot', emphasis: 'highlight' },
          { label: 'Klinefelter', value: '47,XXY — hipogonadismo masculino', badge: 'info' },
          { label: 'Turner', value: '45,X — mulher', badge: 'info' },
          { label: 'Morris', value: 'Insensibilidade androgênica', badge: 'info' },
        ],
        footer_rule: 'Sintomas espelhados — letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Saúde do homem — sintomas da parceira grávida.',
          'Eliminar A — Klinefelter é genética masculina.',
          'Eliminar B — Morris é androgênio.',
          'Testar C — síndrome de Couvade.',
          'Eliminar D — supermacho não é termo clínico aqui.',
          'Eliminar E — Turner é feminina.',
          'Marcar letra C.',
        ],
        footer_rule: 'Couvade — parceiro gestacional',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍNDROMES',
        items: [
          { label: 'Letra A — Klinefelter', detail: 'Cariótipo 47,XXY.', correct: 'Couvade gestacional — eliminar A.' },
          { label: 'Letra B — Morris', detail: 'Insensibilidade androgênica.', correct: 'Sintomas espelhados — eliminar B.' },
          { label: 'Letra D — supermacho', detail: 'Distrator humorístico.', correct: 'Parceiro grávida — eliminar D.' },
          { label: 'Letra E — Turner', detail: 'Síndrome 45,X feminina.', correct: 'Síndrome de Couvade — marcar C.' },
        ],
        footer_rule: 'Genética × psicossomático gestacional',
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
    console.log(`[handcraft:sm-g28] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g28] total=${ok}`);
}

main();
