#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — denotacao-conotacao-g05 (1 slug · Denotação/conotação · lote final).
 *
 *   npx tsx scripts/handcraft-denotacao-conotacao-g05.ts
 *   npm run audit:questao-readiness -- --lote=denotacao-conotacao-g05 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=denotacao-conotacao-g05 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'denotacao-conotacao-g05';
const SUBTOPICO = 'Denotação, conotação e figuras de linguagem';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_denotacao_conotacao';
const REVIEWED = '2026-07-24';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-denotacao-literal-figurado.json';

const DENOTACAO_SOURCE = {
  id: 'pt-denotacao-conotacao-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Denotação, conotação e figuras de linguagem',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'denotação',
    'conotação',
    'sentido literal',
    'sentido figurado',
    'metáfora',
    'metonímia',
    'eufemismo',
    'ironia',
    'pergunta-teste',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'text_fragment';

type Spec = {
  family: Family;
  meta: {
    banca: string;
    prova: string;
    orgao: string;
    ano: string;
    cargo_header?: string;
  };
  instruction: string;
  text_fragment?: string;
  figure_policy?: 'transcribed' | 'required';
  options: Opt[];
  source_tec_id: string;
  source_note: string;
  slides: unknown[];
};

const slideMeta = { topico: TOPICO, subtopico: SUBTOPICO };

function metaBase(spec: Spec, slug: string) {
  return {
    ...spec.meta,
    topico: TOPICO,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:denotacao-conotacao-g05',
      guideline_snapshot: `Elias TE-simples — pergunta «Literal ou figurado?» · lente dicionário × efeito (denotacaoConotacao.ts) · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      DENOTACAO_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt-subject-focus'],
      },
    ],
  };
}

function build(slug: string, spec: Spec) {
  const qd: {
    instruction: string;
    options: Opt[];
    text_fragment?: string;
    figure_policy?: 'transcribed' | 'required';
  } = {
    instruction: spec.instruction,
    options: spec.options,
  };
  if (spec.text_fragment) qd.text_fragment = spec.text_fragment;
  if (spec.figure_policy) qd.figure_policy = spec.figure_policy;
  return {
    meta: metaBase(spec, slug),
    question_data: qd,
    reverse_study_slides: spec.slides,
  };
}

const SPECS: Record<string, Spec> = {
  'vunesp-acs-p-denotacao-leia-o-texto-a-seguir-para-responder-3844966': {
    family: 'text_fragment',
    source_tec_id: '3844966',
    source_note:
      'Democracia digital Revista E — «encruzilhada» figurada — VUNESP ACS Pref Vista A do Alto 2025 tec 3844966',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Vista A do Alto)',
      orgao: 'Pref. Vista A do Alto',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa correta em relação ao sentido com que as palavras foram empregadas no texto.',
    text_fragment:
      'Democracia digital\n\nNas primeiras duas décadas do século 21, o desenho da sociedade e de suas instituições sofreu grandes alterações com o uso das redes sociais, da inteligência artificial e de outras ferramentas capazes de utilizar um gigantesco volume de dados na internet para os mais diversos fins. Por um lado, abriu-se caminho para vozes historicamente silenciadas, a exemplo de jovens indígenas que passaram a compartilhar sua realidade e reivindicações sem intermediários, nas redes. Por outro, pavimentou-se uma via de disseminação de fake news, polarização ideológica e discursos de ódio.\n\nNesse cenário, de que forma a expansão das novas tecnologias vem afetando a democracia? Autor de A democracia no mundo digital: histórias, problemas e temas, o professor e pesquisador da Universidade Federal da Bahia (UFBA) Wilson Gomes chama a atenção, primeiramente, para as maneiras como as novas tecnologias vêm sendo utilizadas em diferentes contextos geopolíticos.\n\n«A chamada democracia digital depende de uma escolha: a decisão de usar os recursos digitais – plataformas, redes, dados, algoritmos, automações – para fortalecer valores, práticas e instituições democráticas. Mas essa decisão só pode ser tomada por sociedades convictas de que a democracia é a melhor forma de governo. Quando essa convicção vacila e os regimes são atacados, os mesmos recursos podem ser empregados com igual eficácia para solapar os fundamentos da vida democrática», alerta.\n\nSegundo Gomes, nos encontramos diante de uma encruzilhada.\n\n«Há os que acreditam que a guerra pelos usos sociais das tecnologias foi vencida pelos inimigos da democracia – que as plataformas, os algoritmos e os fluxos digitais estão, irremediavelmente, capturados por lógicas autoritárias, mercadológicas ou identitárias intolerantes. Mas há, também, os que veem na resistência institucional, nas pesquisas emergentes, na regulação pública e nos novos experimentos democráticos digitais um caminho viável para reverter o jogo.»\n\n(Revista E, 01.09.2025. Disponível em: https://www.sescsp.org.br/editorial/democracia-digital/. Adaptado)',
    options: [
      {
        id: 'A',
        text: 'Em «... o desenho da sociedade e de suas instituições sofreu grandes alterações...» (1º parágrafo), a palavra destacada foi empregada em sentido próprio para se referir às linhas de uma representação gráfica.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Em «Por outro, pavimentou-se uma via de disseminação de fake news...» (1º parágrafo), a palavra destacada foi empregada em sentido próprio para se referir ao ato de revestir com pavimento.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Em «... as novas tecnologias vêm sendo utilizadas em diferentes contextos geopolíticos» (2º parágrafo), a palavra destacada foi empregada em sentido figurado para se referir a um conjunto de técnicas.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Em «Segundo o professor Wilson Gomes, nos encontramos diante de uma encruzilhada» (3º parágrafo), a palavra destacada foi empregada em sentido figurado para se referir a um dilema importante.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Em «... nos novos experimentos democráticos digitais um caminho viável...» (3º parágrafo), a palavra destacada foi empregada em sentido figurado para se referir ao uso de tecnologia informática.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Democracia digital',
        chip_label: 'Metáforas do texto',
        meta: slideMeta,
        items: [
          { label: 'Desenho', detail: 'Estrutura social — não traço gráfico no papel.', icon: 'Layout' },
          { label: 'Pavimentar via', detail: 'Abrir caminho para fake news — imagem, não asfalto.', icon: 'Route' },
          { label: 'Contextos', detail: 'Geopolíticos = cenários reais de uso — léxico objetivo.', icon: 'Globe' },
          { label: 'Encruzilhada', detail: 'Momento de escolha — cruzamento simbólico.', icon: 'GitFork' },
          { label: 'Caminho viável', detail: 'Solução possível — não software em si.', icon: 'Map' },
        ],
        footer_rule: 'Cada letra testa um termo — leia o trecho citado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Revista E: redes, IA, fake news, Wilson Gomes (UFBA), democracia digital.',
          'Comando: qual análise de sentido (próprio × figurado) está correta?',
          'A «desenho» como linhas gráficas: confunde plano social com desenho visual — eliminar.',
          'B «pavimentou via» como asfalto: ignora metáfora de abrir trilha — eliminar.',
          'C «contextos» como técnicas: geopolíticos são cenários reais — uso objetivo — eliminar.',
          'D «encruzilhada» como dilema: metáfora de escolha entre rumos — casa.',
          'E «caminho viável» como TI: mistura metáfora de solução com informática — eliminar.',
          'Gabarito D.',
          'Em similares: confirme se a paráfrase da letra respeita o campo semântico do trecho.',
        ],
        footer_rule: 'Tap = testar dicionário × efeito em cada citação.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PERGUNTA-TESTE — REVISTA E',
        rows: [
          { label: 'Literal', value: 'Dicionário: pavimento, contexto geopolítico, desenho técnico.' },
          { label: 'Figurado', value: 'Encruzilhada = dilema · caminho = saída · via = meio de difusão.' },
          { label: 'Encruzilhada', value: 'Cruzamento de rumos — não rua física.' },
          { label: 'Nesta questão', value: 'D — figurado · dilema democrático diante da tecnologia.' },
        ],
        footer_rule: 'Gomes resume: sociedade escolhe fortalecer ou solapar a democracia.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Paráfrases que literalizam a metáfora',
        items: [
          {
            label: 'A — desenho gráfico',
            detail: 'Trata «desenho da sociedade» como traço em papel.',
            correct: '«Desenho» aqui é configuração/estrutura social — sentido figurado, não gráfico.',
          },
          {
            label: 'B — pavimento',
            detail: 'Lê «pavimentou-se uma via» como obra rodoviária.',
            correct: 'Expressão figurada: abriu-se um meio de circulação de fake news.',
          },
          {
            label: 'C — técnicas',
            detail: 'Classifica «contextos geopolíticos» como jargão técnico figurado.',
            correct: '«Contextos» designa cenários reais de uso — emprego objetivo/literal.',
          },
          {
            label: 'E — informática',
            detail: 'Reduz «caminho viável» a ferramenta digital.',
            correct: 'Metáfora de solução possível — não sinônimo de tecnologia informática.',
          },
          {
            label: 'Transferência',
            detail: 'Classifique: «O país está numa encruzilhada histórica.»',
            correct: 'Sentido figurado: momento decisivo — não cruzamento de ruas no mapa.',
          },
        ],
        footer_rule: 'D: encruzilhada = dilema importante.',
      },
    ],
  },
};

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const loteRoot = loteDir(LOTE);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(loteRoot, { recursive: true });

  const slugs = Object.keys(SPECS);
  let n = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(outDir, `${slug}.json`);
    writeFileSync(path, `${JSON.stringify(build(slug, spec), null, 2)}\n`, 'utf8');
    n += 1;
    console.log(`[handcraft] OK ${slug}`);
  }

  const catalog = {
    lote: LOTE,
    subtopico: SUBTOPICO,
    topico: TOPICO,
    pedagogical_branch: BRANCH,
    total: slugs.length,
    slugs,
  };
  writeFileSync(loteCatalogPath(LOTE), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] catalog.json written (${slugs.length} slugs)`);
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
