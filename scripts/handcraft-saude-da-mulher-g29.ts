#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g29 (5 slugs — cauda mulher_generico).
 *
 *   npm run handcraft:saude-da-mulher-g29
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g29 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g29';
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
    'terminologia ginecológica',
    'ciclo menstrual',
    'indicadores epidemiológicos',
    'procedimentos ginecológicos',
    'cuidados pós-cesárea',
  ],
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
  family: 'conceito' | 'protocolo' | 'vf';
  branch: Branch;
  guideline: string;
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
    sources: [SM_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/chamada de ,/g, 'chamada de ________,')
    .replace(/realizar uma ,/g, 'realizar uma ________,')
    .replace(/aalternativa/g, 'a alternativa')
    .replace(/família,prescreveu/g, 'família, prescreveu')
    .replace(/pele,removendo/g, 'pele, removendo')
    .replace(/pontos daferida/g, 'pontos da ferida')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'fundatec-enfermagem-saude-da-mulher-1777104382533-7': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — histeropexia = fixação do útero; histerectomia = retirada do útero (miomas, sangramento)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Procedimentos — útero',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Caso clínico — fixação do útero após gestações; depois retirada por miomas e sangramento.', icon: 'Target' },
          { label: 'Histeropexia', detail: 'Fixação/suspensão do útero — primeira lacuna.', icon: 'Heart' },
          { label: 'Histerectomia', detail: 'Retirada do útero — segunda lacuna por miomas.', icon: 'Scissors' },
          { label: 'Pegadinha orquidopexia', detail: 'Orquidopexia é fixação testicular masculina.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Fixação × retirada uterina — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Cirurgias — glossário',
        meta: slideMeta,
        content: 'ÚTERO',
        rows: [
          { label: 'Histeropexia', value: 'Fixação do útero (prolapso)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Histerectomia', value: 'Remoção do útero', badge: 'hot' },
          { label: 'Colposcopia', value: 'Exame do colo — não preenche lacuna cirúrgica', badge: 'warn' },
          { label: 'Orquidopexia', value: 'Fixação testicular — masculino', badge: 'info' },
        ],
        footer_rule: 'Histeropexia + histerectomia — E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Lacunas — procedimento de fixação e depois retirada uterina.',
          'Eliminar A — cistopexia e salpingoplastia não combinam o caso.',
          'Eliminar B — colposcopia/histeroscopia são exames.',
          'Eliminar C — laparoscopia/perineorrafia não fecham o enunciado.',
          'Eliminar D — orquidopexia/ooforectomia são masculino/ovários.',
          'Testar E — histeropexia e histerectomia.',
          'Marcar letra E.',
        ],
        footer_rule: 'Miomas e sangramento — histerectomia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROCEDIMENTOS',
        items: [
          { label: 'Letra A — cistopexia', detail: 'Bexiga e tubas — não o par do caso.', correct: 'Histeropexia — eliminar A.' },
          { label: 'Letra B — colposcopia', detail: 'Exame diagnóstico do colo.', correct: 'Histerectomia — eliminar B.' },
          { label: 'Letra C — laparoscopia', detail: 'Via de acesso, não nome da cirurgia.', correct: 'Fixação uterina — eliminar C.' },
          { label: 'Letra D — orquidopexia', detail: 'Procedimento testicular masculino.', correct: 'Par uterino — marcar E.' },
        ],
        footer_rule: 'Útero fixado depois retirado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundatec-enfermagem-semiologia-em-enfermagem-1779563517223-7': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — hipogonadismo: perda de pelos púbicos e axilares é sinal específico; ondas de calor são inespecíficas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipogonadismo — sinal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Sinal específico do hipogonadismo — escolher a alternativa correta.', icon: 'Target' },
          { label: 'Pelos púbicos', detail: 'Perda de pelos púbicos e axilares — estrogênio/androgênio baixos.', icon: 'User' },
          { label: 'Pegadinha ondas de calor', detail: 'Ondas de calor são comuns na menopausa — menos específicas.', icon: 'AlertTriangle' },
          { label: 'Pegadinha libido', detail: 'Redução da libido é inespecífica.', icon: 'Ban' },
        ],
        footer_rule: 'Sinal específico — pelos — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Hipogonadismo — referência',
        meta: slideMeta,
        content: 'SINAIS',
        rows: [
          { label: 'Específico', value: 'Perda de pelos púbicos e axilares', badge: 'hot', emphasis: 'highlight' },
          { label: 'Inespecífico', value: 'Ondas de calor, redução da libido', badge: 'info' },
          { label: 'Mastalgia', value: 'Dor mamária — outro contexto', badge: 'warn' },
          { label: 'Infertilidade', value: 'Consequência possível — não sinal específico isolado', badge: 'info' },
        ],
        footer_rule: 'Pelos axilares e púbicos — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Hipogonadismo — sinal específico.',
          'Eliminar A — libido reduzida é inespecífica.',
          'Eliminar B — ondas de calor são vasomotoras gerais.',
          'Eliminar C — mastalgia não define hipogonadismo.',
          'Eliminar E — infertilidade é desfecho, não sinal específico.',
          'Testar D — perda de pelos púbicos e axilares.',
          'Marcar letra D.',
        ],
        footer_rule: 'Pelos secundários — letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPOGONADISMO',
        items: [
          { label: 'Letra A — libido', detail: 'Sintoma inespecífico.', correct: 'Pelos púbicos — eliminar A.' },
          { label: 'Letra B — ondas de calor', detail: 'Climatério comum.', correct: 'Sinal específico — eliminar B.' },
          { label: 'Letra C — mastalgia', detail: 'Dor mamária.', correct: 'Perda de pelos — eliminar C.' },
          { label: 'Letra E — infertilidade', detail: 'Consequência reprodutiva.', correct: 'Hipogonadismo específico — marcar D.' },
        ],
        footer_rule: 'Específico ≠ vasomotor',
      },
    ],
  },

  'idecan-enfermagem-saude-da-mulher-1780067024707-9': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — ciclo menstrual: hipermenorreia = aumento do volume; polimenorreia = ciclos frequentes; oligomenorreia = ciclos espaçados',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ciclo — terminologia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ginecologia — dor e perturbações dos ciclos menstruais — definição correta.', icon: 'Target' },
          { label: 'Hipermenorreia', detail: 'Aumento do volume sanguíneo menstrual — intensidade do fluxo.', icon: 'Droplets' },
          { label: 'Pegadinha polimenorreia', detail: 'Polimenorreia = ciclos frequentes — não “espaçados”.', icon: 'AlertTriangle' },
          { label: 'Pegadinha oligomenorreia', detail: 'Oligomenorreia = ciclos espaçados — origem da confusão da prova.', icon: 'Ban' },
        ],
        footer_rule: 'Volume aumentado — hipermenorreia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Menstruação — glossário',
        meta: slideMeta,
        content: 'CICLO MENSTRUAL',
        rows: [
          { label: 'Hipermenorreia', value: 'Aumento do volume sanguíneo menstrual', badge: 'hot', emphasis: 'highlight' },
          { label: 'Hipomenorreia', value: 'Diminuição do volume — não confundir com frequência', badge: 'info' },
          { label: 'Polimenorreia', value: 'Ciclos menstruais frequentes', badge: 'warn' },
          { label: 'Oligomenorreia', value: 'Ciclos menstruais espaçados', badge: 'warn' },
        ],
        footer_rule: 'Definição correta — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Terminologia menstrual — definições.',
          'Eliminar A — polimenorreia não é ciclo espaçado.',
          'Eliminar B — oligomenorreia não é aumento de ciclos.',
          'Testar C — hipermenorreia = volume aumentado.',
          'Eliminar D — hipomenorreia é fluxo diminuído.',
          'Marcar letra C.',
        ],
        footer_rule: 'Volume sanguíneo — hipermenorreia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CICLO',
        items: [
          { label: 'Letra A — polimenorreia', detail: 'Definição invertida (espaçados).', correct: 'Volume aumentado — eliminar A.' },
          { label: 'Letra B — oligomenorreia', detail: 'Confunde com polimenorreia.', correct: 'Hipermenorreia — eliminar B.' },
          { label: 'Letra D — hipomenorreia', detail: 'Mistura frequência e volume.', correct: 'Fluxo aumentado — eliminar D.' },
        ],
        footer_rule: 'Poli × oligo × hiper',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unifil-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-1': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — mortalidade infantil: óbitos do nascimento até o primeiro ano; neonatal e pós-neonatal são recortes parciais',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mortalidade infantil',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Indicador social — mortalidade infantil — definição correta.', icon: 'Target' },
          { label: 'Primeiro ano', detail: 'Mortalidade infantil = óbitos do nascimento até completar um ano.', icon: 'Baby' },
          { label: 'Pegadinha perinatal', detail: 'Confundir óbitos neonatais tardios com mortalidade infantil total.', icon: 'AlertTriangle' },
          { label: 'Pegadinha neonatal', detail: 'Neonatal inicia no nascimento — não após a primeira semana.', icon: 'Ban' },
        ],
        footer_rule: 'Nascimento até um ano — infantil',
      },
      {
        type: 'golden_rule',
        slide_title: 'Indicadores — MS',
        meta: slideMeta,
        content: 'MORTALIDADE',
        rows: [
          { label: 'Infantil', value: 'Óbitos do nascimento até o primeiro ano de vida', badge: 'hot', emphasis: 'highlight' },
          { label: 'Neonatal', value: 'Do nascimento até o fim do período neonatal', badge: 'info' },
          { label: 'Pós-neonatal', value: 'Após o neonatal até completar um ano', badge: 'info' },
          { label: 'Perinatal', value: 'Óbitos fetais e neonatais precoces — indicador distinto', badge: 'warn' },
        ],
        footer_rule: 'Faixa completa do 1º ano — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Mortalidade infantil — indicador epidemiológico.',
          'Eliminar A — recorte pós-neonatal é parcial.',
          'Eliminar B — neonatal começa no nascimento.',
          'Testar C — óbitos do nascimento até um ano.',
          'Eliminar D — perinatal tem outra definição.',
          'Marcar letra C.',
        ],
        footer_rule: 'Primeiro ano de vida — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXAS ETÁRIAS',
        items: [
          { label: 'Letra A — pós-neonatal', detail: 'Recorte após o período neonatal.', correct: 'Nascimento até um ano — eliminar A.' },
          { label: 'Letra B — recorte neonatal', detail: 'Neonatal começa no nascimento.', correct: 'Mortalidade infantil total — eliminar B.' },
          { label: 'Letra D — perinatal', detail: 'Óbitos neonatais tardios e fetais — indicador distinto.', correct: 'Primeiro ano completo — marcar C.' },
        ],
        footer_rule: 'Neonatal + pós-neonatal = infantil',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-curativos-e-manejo-de-feridas-1779344779828-3': {
    family: 'protocolo',
    branch: 'mulher_generico',
    guideline: 'MS/COFEN — retirada de pontos: técnica asséptica; tracionar nó e cortar fio próximo à pele na sutura contínua',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Retirada de pontos',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Puérpera pós-cesárea — retirada de sutura contínua com cicatrização normal.', icon: 'Target' },
          { label: 'Técnica', detail: 'Tracionar nó com pinça; cortar fio acima, próximo à pele.', icon: 'Scissors' },
          { label: 'Pegadinha asséptica', detail: 'Técnica asséptica é obrigatória — não dispensar.', icon: 'AlertTriangle' },
          { label: 'Pegadinha irrigação', detail: 'Irrigação com agulha grossa não é rotina de retirada.', icon: 'Ban' },
        ],
        footer_rule: 'Asséptica + tracionar nó — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pontos — referência',
        meta: slideMeta,
        content: 'RETIRADA DE PONTOS',
        rows: [
          { label: 'Asséptica', value: 'Pacote estéril e técnica asséptica obrigatórios', badge: 'hot', emphasis: 'highlight' },
          { label: 'Contínua', value: 'Tracionar nó → cortar fio próximo à pele', badge: 'hot' },
          { label: 'Cicatrização', value: 'Sem sinais de infecção — retirada autorizada', badge: 'info' },
          { label: 'Pegadinha', value: 'Não dispensar barreira asséptica', badge: 'warn' },
        ],
        footer_rule: 'Tracionar e cortar — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Puérpera — retirada de pontos de cesárea.',
          'Eliminar A — técnica asséptica é necessária.',
          'Eliminar B — irrigação com agulha grossa não é padrão aqui.',
          'Eliminar C — iodado alcoólico em ferida fechada — cautela.',
          'Testar D — tracionar nó e cortar fio próximo à pele.',
          'Eliminar E — degermante após retirada não é foco do gabarito.',
          'Marcar letra D.',
        ],
        footer_rule: 'Sutura contínua — técnica D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PONTOS',
        items: [
          { label: 'Letra A — sem asséptica', detail: 'Procedimento invasivo exige asséptica.', correct: 'Tracionar nó — eliminar A.' },
          { label: 'Letra B — irrigação', detail: 'Irrigação com agulha grossa e soro fisiológico.', correct: 'Cortar fio — eliminar B.' },
          { label: 'Letra C — iodado', detail: 'Antissepsia iodada alcoólica.', correct: 'Técnica de retirada — eliminar C.' },
          { label: 'Letra E — degermante', detail: 'Limpeza pós-retirada.', correct: 'Pinça e tesoura — marcar D.' },
        ],
        footer_rule: 'Ferida operatória cicatrizada',
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
    console.log(`[handcraft:sm-g29] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g29] total=${ok}`);
}

main();
