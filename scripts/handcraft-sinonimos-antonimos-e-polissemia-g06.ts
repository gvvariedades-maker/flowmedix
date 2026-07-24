#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g06 (8 slugs · lote 6).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g06.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g06 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g06 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g06';
const SUBTOPICO = 'Sinônimos, antônimos e polissemia';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_sinonimos_polissemia';
const REVIEWED = '2026-07-24';
const GOLDEN_REFERENCE = 'examples/questao-premium-apice-portugues-sinonimos-polissemia-refletiu.json';

const SINONIMOS_SOURCE = {
  id: 'pt-sinonimos-polissemia-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Sinônimos, antônimos e polissemia',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: ['sinonímia', 'polissemia', 'parônimos', 'antonímia', 'pergunta-teste', 'contexto'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'text_fragment' | 'vf';

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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g06',
      guideline_snapshot: `Elias TE-simples — pergunta «Mesmo sentido na frase?» · lente contexto × dicionário (sinonimosPolissemia.ts) · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      SINONIMOS_SOURCE,
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
  'cebraspe-ces-sinonimos-texto-cg1a1a-relacao-entre-sustentab-3698157': {
    family: 'text_fragment',
    source_tec_id: '3698157',
    source_note:
      '«influenciam» ≈ alteram — vetores climáticos malária/dengue — CEBRASPE Ana Sau Pref Boa Vista 2025 tec 3698157',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ana Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto CG1A1 — A relação entre sustentabilidade e saúde (FGV Portal — adaptado).\n\nNo penúltimo período do primeiro parágrafo do texto CG1A1, o sentido da forma verbal «influenciam» é o mesmo de',
    text_fragment:
      'Texto CG1A1 — Sustentabilidade e saúde (adaptado)\n\nA relação entre sustentabilidade e saúde não é nova. Desde questões ocupacionais, passando pela qualidade do ar, da água, do solo, do uso de pesticidas, resíduos perigosos e radioativos, os impactos do modo de produção e consumo sobre o meio ambiente têm sempre retornado ao ser humano na forma de danos à saúde.\n\nAs mudanças climáticas são um divisor de águas nesse processo. Eventos extremos como ondas de calor, secas e inundações modificam os habitats naturais, forçando animais a migrarem para novas áreas. Essa movimentação aumenta as chances de contato entre espécies, inclusive a humana, e facilita a transmissão de patógenos.\n\nAlém disso, as alterações climáticas influenciam a distribuição de vetores, como mosquitos e carrapatos, expandindo a área geográfica de doenças como a malária e a dengue. Doenças crônicas, cardiovasculares e respiratórias também são acentuadas por altas temperaturas e poluição do ar.\n\nO relatório Qualificando o impacto das mudanças climáticas na saúde humana (Fórum Econômico Mundial, 2024) aponta pressão imensa sobre os sistemas de saúde e impactos em condições que se desenvolvem após eventos climáticos. Desastres e ondas de calor extremas exacerbam riscos para transtornos mentais preexistentes.\n\nAs novas gerações experimentam ansiedade climática ou ecoansiedade — medo crônico da destruição ambiental, conforme a APA.',
    options: [
      { id: 'A', text: 'aumentam.', is_correct: false },
      { id: 'B', text: 'alteram.', is_correct: true },
      { id: 'C', text: 'ocasionam.', is_correct: false },
      { id: 'D', text: 'determinam.', is_correct: false },
      { id: 'E', text: 'estimulam.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Influenciam',
        chip_label: 'Clima × vetores',
        meta: slideMeta,
        items: [
          { label: 'Influenciam', detail: 'Modificam onde mosquitos e carrapatos circulam.', icon: 'Thermometer' },
          { label: 'Alteram', detail: 'Mudam a distribuição geográfica — equivalência.', icon: 'MapPin' },
          { label: 'Vetores', detail: 'Mosquitos, carrapatos — malária, dengue.', icon: 'Bug' },
          { label: 'Mudanças climáticas', detail: 'Calor, seca, inundação — habitats migratórios.', icon: 'CloudRain' },
          { label: 'Sustentabilidade', detail: 'Texto CG1A1 — saúde e meio ambiente ligados.', icon: 'Leaf' },
          { label: 'Patógenos', detail: 'Migração de animais facilita transmissão.', icon: 'Biohazard' },
          { label: 'Pergunta-teste', detail: 'O verbo indica mudança de distribuição?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por ocasionam (causar) ou determinam (fixar).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Influenciam ≈ alteram — modificam distribuição de vetores.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto CG1A1: alterações climáticas e saúde — vetores de doenças.',
          'Penúltimo período do 1º parágrafo: «influenciam a distribuição de vetores».',
          'Sentido: mudam onde mosquitos/carrapatos aparecem — expandem área de malária/dengue.',
          'A «aumentam»: intensifica quantidade — não cobre «distribuição» — eliminar.',
          'B «alteram»: modificam o padrão geográfico — equivalência — manter.',
          'C «ocasionam»: causam diretamente — sentido mais forte — eliminar.',
          'D «determinam»: fixam de modo absoluto — eliminar.',
          'E «estimulam»: incitam — nuance distinta — eliminar.',
          'Gabarito B.',
          'Em similares: influenciar ≈ alterar/modificar — prove no efeito sobre vetores.',
        ],
        footer_rule: 'Gabarito B — alteram a distribuição de vetores.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INFLUENCIAM × ALTERAM',
        rows: [
          { label: 'Influenciam', value: 'Exercem efeito — modificam distribuição.' },
          { label: 'Alteram', value: 'Sinônimo no contexto — mudam padrão.' },
          { label: 'Ocasionam', value: 'Causam — nuance mais direta.' },
          { label: 'Nesta questão', value: 'B — alteram.' },
        ],
        footer_rule: 'Distribuição de vetores = padrão alterado.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Verbo × nuance causal',
        items: [
          { label: 'A — aumentam', detail: 'Intensificam quantidade.', correct: 'Sinônimo no contexto: «aumentam» foca volume — não cobre «distribuição geográfica» de vetores.' },
          { label: 'C — ocasionam', detail: 'Provocam, causam.', correct: 'Sinônimo no contexto: «ocasionam» indica causa direta — mais forte que «influenciam» na frase.' },
          { label: 'D — determinam', detail: 'Fixam, estabelecem.', correct: 'Sinônimo no contexto: «determinam» sugere controle absoluto — exagero semântico.' },
          { label: 'E — estimulam', detail: 'Incitam, favorecem.', correct: 'Sinônimo no contexto: «estimulam» implica estímulo — não equivalência com «influenciam» aqui.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «As secas influenciam a migração de animais selvagens.»',
            correct: 'Sinônimo no contexto: «alteram» — modificam o comportamento/distribuição.',
          },
        ],
        footer_rule: 'B: alteram — mudança de distribuição.',
      },
    ],
  },

  'cebraspe-ces-sinonimos-texto-cg2a1imagino-que-a-escrita-nas-3705106': {
    family: 'text_fragment',
    source_tec_id: '3705106',
    source_note:
      '«insólita» ≈ incomum — cena Verissimo memória — CEBRASPE Ass Tec Sau Pref Boa Vista 2025 tec 3705106',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ass Tec Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto CG2A1 — Memória e anotações, Luís Fernando Verissimo (Estadão — adaptado).\n\nNo texto CG2A1, o vocábulo «insólita» (quinto período do primeiro parágrafo) está empregado no sentido de',
    text_fragment:
      'Texto CG2A1 — Memória e anotações (Verissimo — adaptado)\n\nImagino que a escrita nasceu da necessidade de não esquecer. O primeiro pré-homem que pensou «preciso me lembrar disso» deve ter olhado em volta procurando alguma coisa que ele ainda não sabia o que era. Era um pedaço de papel e uma Bic. Claro que, para chegar ao papel e à esferográfica, tivemos que passar antes pelo risco com vara no chão, o rabisco com carvão na parede da caverna, o hieróglifo no tablete de barro etc. Mas a angústia primordial foi a de perder o pensamento fugidio ou a cena insólita.\n\nPense em quantas ideias não desapareceram para sempre por falta de algo que as retivesse na memória e no mundo. A história da civilização teria sido outra se, antes de inventar a roda, o homem tivesse inventado o bloco de notas.\n\nAs espécies que não desenvolveram a escrita valem-se da memória intuitiva. O salmão sabe, não sabendo, o caminho certo para o lugar onde nasceu. Já o homem pode ser definido como o animal que precisa consultar as suas notas.\n\nE mesmo com todas as formas de anotação inventadas pelo homem, a angústia persiste. Estou escrevendo isto porque acordei com uma boa ideia e botei a ideia num papel — mas não consigo me lembrar de qual era a ideia de que a frase me faria lembrar.',
    options: [
      { id: 'A', text: 'simples.', is_correct: false },
      { id: 'B', text: 'habitual.', is_correct: false },
      { id: 'C', text: 'solitária.', is_correct: false },
      { id: 'D', text: 'incomum.', is_correct: true },
      { id: 'E', text: 'banal.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insólita',
        chip_label: 'Verissimo',
        meta: slideMeta,
        items: [
          { label: 'Insólita', detail: 'Cena fora do ordinário — digna de anotar.', icon: 'Sparkles' },
          { label: 'Incomum', detail: 'Rara, fora do habitual — equivalência.', icon: 'Star' },
          { label: 'Fugidio', detail: 'Pensamento que escapa — par na frase.', icon: 'Wind' },
          { label: 'Escrita', detail: 'Nasceu para não esquecer cenas e ideias.', icon: 'PenLine' },
          { label: 'CG2A1', detail: 'Texto CG2A1 — quinto período do 1º parágrafo.', icon: 'FileText' },
          { label: 'Verissimo', detail: 'Memória e anotações — Estadão.', icon: 'User' },
          { label: 'Quinto período', detail: '«cena insólita» — local da pergunta.', icon: 'ListOrdered' },
          { label: 'Pergunta-teste', detail: 'A cena é rara ou corriqueira?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Confundir com solitária (sozinha) ou banal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Insólita ≈ incomum — cena que merece registro no CG2A1.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Verissimo: escrita nasce para não perder pensamento fugidio ou cena insólita.',
          '«Insólita» qualifica cena digna de anotação — fora do comum.',
          'A «simples»: fácil — não cobre raridade — eliminar.',
          'B «habitual»: corriqueira — oposto — eliminar.',
          'C «solitária»: sozinha — parônimo/associação falsa — eliminar.',
          'D «incomum»: rara, extraordinária — equivalência — manter.',
          'E «banal»: trivial — antônimo — eliminar.',
          'Gabarito D.',
          'Em similares: insólito ≈ incomum/raro — prove na cena que pede anotação.',
        ],
        footer_rule: 'Gabarito D — insólita significa incomum na cena.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INSÓLITA × INCOMUM',
        rows: [
          { label: 'Insólita', value: 'Fora do comum — cena marcante.' },
          { label: 'Incomum', value: 'Sinônimo — rara, não habitual.' },
          { label: 'Banal', value: 'Antônimo — trivial.' },
          { label: 'Nesta questão', value: 'D — incomum.' },
        ],
        footer_rule: 'Habitual/banal = opostos de insólita.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Parônimo e antônimo',
        items: [
          { label: 'A — simples', detail: 'Fácil, pouco complexo.', correct: 'Sinônimo no contexto: «simples» não substitui «insólita» (fora do ordinário).' },
          { label: 'B — habitual', detail: 'Corriqueiro, usual.', correct: 'Antônimo no contexto: «habitual» opõe-se a cena insólita.' },
          { label: 'C — solitária', detail: 'Sozinha, isolada.', correct: 'Sinônimo no contexto: «solitária» indica isolamento — não raridade da cena.' },
          { label: 'E — banal', detail: 'Trivial, comum.', correct: 'Antônimo no contexto: «banal» é o oposto de insólita.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Presenciou uma cena insólita na praça.»',
            correct: 'Sinônimo no contexto: «incomum» — fora do esperado.',
          },
        ],
        footer_rule: 'Gabarito D — insólita é incomum no texto CG2A1.',
      },
    ],
  },

  'cebraspe-ces-sinonimos-texto-cg2a1imagino-que-a-escrita-nas-3705120': {
    family: 'text_fragment',
    source_tec_id: '3705120',
    source_note:
      '«do memorando» ≈ da anotação — Verissimo sociedades letradas — CEBRASPE Ass Tec Sau Pref Boa Vista 2025 tec 3705120',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ass Tec Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto CG2A1 — Memória e anotações, Luís Fernando Verissimo (Estadão — adaptado).\n\nNo final do segundo parágrafo do texto CG2A1, a expressão «do memorando» poderia ser substituída, sem prejuízo da correção gramatical e dos sentidos do texto, por',
    text_fragment:
      'Texto CG2A1 — Memória e anotações (Verissimo — adaptado)\n\nImagino que a escrita nasceu da necessidade de não esquecer. A angústia primordial foi a de perder o pensamento fugidio ou a cena insólita.\n\nAs espécies que não desenvolveram a escrita valem-se da memória intuitiva. O salmão sabe, não sabendo, o caminho certo para o lugar onde nasceu. Dizem que o elefante guarda na memória tudo que lhe acontece na vida, principalmente as desfeitas, mas vá pedir que ele bote seu ressentimento no papel. Já o homem pode ser definido como o animal que precisa consultar as suas notas.\n\nNas sociedades não letradas, as lembranças sobrevivem na recitação reiterada e no mito tribal, que é a memória ritualizada. As outras dependem do memorando.\n\nE mesmo com todas as formas de anotação inventadas pelo homem desde as primeiras cavernas, inclusive o notebook, a angústia persiste. Estou escrevendo isto porque acordei com uma boa ideia e botei a ideia num papel — mas não consigo me lembrar de qual era a ideia de que a frase me faria lembrar.',
    options: [
      { id: 'A', text: 'da opinião.', is_correct: false },
      { id: 'B', text: 'da anotação.', is_correct: true },
      { id: 'C', text: 'da verdade.', is_correct: false },
      { id: 'D', text: 'da comunicação oficial.', is_correct: false },
      { id: 'E', text: 'da justiça.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Memorando',
        chip_label: 'Notas escritas',
        meta: slideMeta,
        items: [
          { label: 'Memorando', detail: 'Registro escrito para consultar depois.', icon: 'StickyNote' },
          { label: 'Anotação', detail: 'Nota feita no papel — equivalência.', icon: 'NotebookPen' },
          { label: 'Mito tribal', detail: 'Memória oral ritualizada — contraste.', icon: 'Users' },
          { label: 'Homem', detail: 'Animal que consulta suas notas.', icon: 'User' },
          { label: 'Pergunta-teste', detail: 'Substitui «registro escrito pessoal»?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Memorando corporativo (comunicação oficial).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Memorando aqui = anotação escrita — não ofício.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '2º parágrafo: sociedades letradas vs não letradas — memória oral vs escrita.',
          '«As outras dependem do memorando» — lembranças que não são mito tribal.',
          'Contexto Verissimo: bloco de notas, papel, consultar notas — registro escrito.',
          'A «da opinião»: julgamento subjetivo — eliminar.',
          'B «da anotação»: registro escrito — equivalência — manter.',
          'C «da verdade»: fato objetivo — eliminar.',
          'D «da comunicação oficial»: memorando corporativo — sentido restrito — eliminar.',
          'E «da justiça»: equidade — eliminar.',
          'Gabarito B.',
          'Em similares: memorando ≈ anotação/nota — prove no contraste oral × escrito.',
        ],
        footer_rule: 'B: da anotação.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MEMORANDO × ANOTAÇÃO',
        rows: [
          { label: 'Memorando', value: 'Registro escrito para lembrar.' },
          { label: 'Anotação', value: 'Sinônimo no contexto de Verissimo.' },
          { label: 'Comunicação oficial', value: 'Sentido restrito — pegadinha.' },
          { label: 'Nesta questão', value: 'B — da anotação.' },
        ],
        footer_rule: 'Contexto pessoal ≠ memorando administrativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Memorando polissêmico',
        items: [
          { label: 'A — opinião', detail: 'Ponto de vista subjetivo.', correct: 'Sinônimo no contexto: «opinião» não substitui registro escrito de lembrança.' },
          { label: 'C — verdade', detail: 'Fato, realidade.', correct: 'Sinônimo no contexto: «verdade» não equivale a nota consultável.' },
          { label: 'D — comunicação oficial', detail: 'Documento administrativo.', correct: 'Polissemia: «memorando» corporativo é sentido restrito — não cabe na crônica.' },
          { label: 'E — justiça', detail: 'Equidade, direito.', correct: 'Sinônimo no contexto: «justiça» não tem relação com notas pessoais.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Deixou um memorando no bloco para não esquecer a reunião.»',
            correct: 'Sinônimo no contexto: «anotação» — registro escrito.',
          },
        ],
        footer_rule: 'B: da anotação.',
      },
    ],
  },

  'cpcon-uepb-a-sinonimos-leia-o-texto-i-para-responder-a-ques-3709442': {
    family: 'text_fragment',
    source_tec_id: '3709442',
    source_note:
      '«escapismo» ≈ evasão — leitura saúde mental Andréia Roma — CPCON UEPB Ag Adm Pref Olivedos 2025 tec 3709442',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref Olivedos)',
      orgao: 'Pref. Olivedos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I para responder à questão.\n\nPode-se substituir a palavra «escapismo», sem prejuízo de sentido, por:',
    text_fragment:
      'Texto I — «A falta do hábito da leitura pode nos levar ao desastre» (Jovem Pan — adaptado)\n\nDurante uma reunião na escola da minha filha de 11 anos, percebi a preocupação dos professores: o maior desafio de hoje é fazer com que essa geração saiba ler e interpretar textos. Com o avanço da era digital, as pessoas se distanciaram do hábito de leitura.\n\nAndréia Roma, CEO da Editora Leader, cresceu em cenário humilde recortando revistas para fazer cartilhas. Filha de pais analfabetos, trava a batalha de incentivar a leitura. Segundo o estudo «Retratos da leitura no Brasil», cerca de 52% dos brasileiros mantêm o hábito, mas o país perdeu milhões de leitores.\n\n«A leitura expande horizontes, estimula criatividade e empatia. A ausência desse hábito pode limitar conhecimento e compreensão. Além disso, a leitura desempenha papel importante na saúde mental, oferecendo uma forma de escapismo saudável e relaxamento», ressalta Andréia.\n\nO impacto na aprendizagem é devastador. Segundo o PISA, 50% dos brasileiros têm resultados nível 1 em leitura. «A compreensão média do brasileiro é literal e se restringe a frases curtas — isso é alarmante.»',
    options: [
      { id: 'A', text: 'apatia.', is_correct: false },
      { id: 'B', text: 'acomodação.', is_correct: false },
      { id: 'C', text: 'concentração.', is_correct: false },
      { id: 'D', text: 'evasão.', is_correct: true },
      { id: 'E', text: 'repressão.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escapismo',
        chip_label: 'Leitura × saúde',
        meta: slideMeta,
        items: [
          { label: 'Escapismo', detail: 'Fuga saudável da rotina — via leitura.', icon: 'BookOpen' },
          { label: 'Evasão', detail: 'Afastamento temporário — equivalência.', icon: 'DoorOpen' },
          { label: 'Relaxamento', detail: 'Par na frase — benefício mental.', icon: 'Heart' },
          { label: 'Andréia Roma', detail: 'Terapeuta — leitura e saúde mental.', icon: 'User' },
          { label: 'Hábito de leitura', detail: 'Texto I — falta pode levar ao desastre.', icon: 'BookMarked' },
          { label: 'Desastre', detail: 'Consequência da defasagem de leitura.', icon: 'AlertOctagon' },
          { label: 'PISA', detail: 'Brasileiros nível 1 — compreensão literal.', icon: 'BarChart' },
          { label: 'Pergunta-teste', detail: 'Indica «sair» da pressão cotidiana?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por concentração (foco) ou apatia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Escapismo ≈ evasão saudável — leitura e relaxamento.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto I: leitura como ferramenta de desenvolvimento e saúde mental.',
          '«Escapismo saudável e relaxamento» — leitura como fuga benigna do estresse.',
          'A «apatia»: indiferença — oposto de engajamento lúdico — eliminar.',
          'B «acomodação»: conformismo — eliminar.',
          'C «concentração»: foco atento — função distinta — eliminar.',
          'D «evasão»: afastamento temporário da realidade — equivalência — manter.',
          'E «repressão»: bloqueio de impulsos — eliminar.',
          'Gabarito D.',
          'Em similares: escapismo ≈ evasão/fuga saudável — prove no par «relaxamento».',
        ],
        footer_rule: 'Gabarito D — escapismo equivale a evasão saudável.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ESCAPISMO × EVASÃO',
        rows: [
          { label: 'Escapismo', value: 'Fuga lúdica — livro como refúgio.' },
          { label: 'Evasão', value: 'Sinônimo — afastamento temporário.' },
          { label: 'Concentração', value: 'Foco — função oposta à fuga.' },
          { label: 'Nesta questão', value: 'D — evasão.' },
        ],
        footer_rule: 'Saudável + relaxamento = evasão benigna.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Fuga × foco',
        items: [
          { label: 'A — apatia', detail: 'Indiferença, falta de interesse.', correct: 'Antônimo no contexto: «apatia» não descreve engajamento lúdico da leitura.' },
          { label: 'B — acomodação', detail: 'Conformismo passivo.', correct: 'Sinônimo no contexto: «acomodação» não cobre «escapismo» (fuga imaginativa).' },
          { label: 'C — concentração', detail: 'Foco, atenção.', correct: 'Sinônimo no contexto: «concentração» indica foco — não fuga da rotina.' },
          { label: 'E — repressão', detail: 'Bloqueio, inibição.', correct: 'Antônimo no contexto: «repressão» opõe-se a liberar-se pela leitura.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O romance oferece escapismo após o plantão.»',
            correct: 'Sinônimo no contexto: «evasão» — afastamento saudável do estresse.',
          },
        ],
        footer_rule: 'Gabarito D — evasão substitui escapismo no Texto I.',
      },
    ],
  },

  'avancasp-ag-sinonimos-leia-o-texto-a-seguir-para-responder-3709795': {
    family: 'conceito',
    source_tec_id: '3709795',
    source_note:
      'EXCETO colossal — comum não é sinônimo — Drummond abotoaduras — AVANÇASP Ag Pref SM Arcanjo 2025 tec 3709795',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref SM Arcanjo)',
      orgao: 'Pref. SM Arcanjo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAbotoaduras — Carlos Drummond de Andrade (Contos plausíveis — adaptado)\n\nO maior fabricante de abotoaduras fechou a indústria depois de convencer-se de que é infinitamente reduzido o número de camisas de manga comprida à disposição da humanidade. Concluiu que é o fim da civilização quando uma camisa esporte, estampada, saiu pelos ares. O homem resolveu persistir e aplicar sua fortuna em uma indústria colossal de camisas de manga curta.\n\nQual das alternativas a seguir NÃO é um sinônimo possível para o termo «colossal», na última linha do texto?',
    options: [
      { id: 'A', text: 'gigantesca', is_correct: false },
      { id: 'B', text: 'descomunal', is_correct: false },
      { id: 'C', text: 'comum', is_correct: true },
      { id: 'D', text: 'enorme', is_correct: false },
      { id: 'E', text: 'imensa', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Colossal — EXCETO',
        chip_label: 'Drummond',
        meta: slideMeta,
        items: [
          { label: 'Colossal', detail: 'De tamanho gigantesco — indústria enorme.', icon: 'Factory' },
          { label: 'EXCETO', detail: 'Qual opção NÃO é sinônimo.', icon: 'XCircle' },
          { label: 'Comum', detail: 'Ordinário — antônimo de colossal.', icon: 'Minus' },
          { label: 'Abotoaduras', detail: 'Crônica — requinte × manga curta.', icon: 'Shirt' },
          { label: 'Pegadinha', detail: 'Confundir «comum» com «comum no sentido de usual».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EXCETO = opção que não expressa grandeza.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Drummond: fabricante migra de abotoaduras para indústria «colossal» de camisas.',
          '«Colossal» = de proporções gigantescas — fortuna reinvestida em escala enorme.',
          'A «gigantesca»: sinônimo — descartar.',
          'B «descomunal»: sinônimo — descartar.',
          'C «comum»: ordinário, usual — NÃO é sinônimo de enorme — manter (EXCETO).',
          'D «enorme»: sinônimo — descartar.',
          'E «imensa»: sinônimo — descartar.',
          'Gabarito C.',
          'Em similares: colossal (grande) × comum (pequeno/ordinário) — EXCETO aponta antônimo.',
        ],
        footer_rule: 'C: comum — exceção.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COLOSSAL — EXCETO',
        rows: [
          { label: 'Colossal', value: 'Gigantesco, imenso, descomunal.' },
          { label: 'Comum', value: 'Ordinário — NÃO sinônimo (EXCETO).' },
          { label: 'Gigantesca/enorme/imensa', value: 'Sinônimos válidos.' },
          { label: 'Nesta questão', value: 'C — comum.' },
        ],
        footer_rule: 'EXCETO = antônimo disfarçado.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — grandeza × ordinariedade',
        items: [
          { label: 'A — gigantesca', detail: 'De tamanho muito grande.', correct: 'Sinônimo no contexto: «gigantesca» expressa grandeza — é sinônimo de colossal.' },
          { label: 'B — descomunal', detail: 'Fora do comum por tamanho.', correct: 'Sinônimo no contexto: «descomunal» indica proporção enorme — é sinônimo.' },
          { label: 'D — enorme', detail: 'Muito grande.', correct: 'Sinônimo no contexto: «enorme» equivale a colossal — é sinônimo.' },
          { label: 'E — imensa', detail: 'Vasta, ampla.', correct: 'Sinônimo no contexto: «imensa» cobre escala colossal — é sinônimo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «NÃO é sinônimo de «vasto»: estreito, amplo, imenso, exíguo.»',
            correct: 'Antônimo no contexto: «estreito» e «exíguo» — como «comum» para colossal.',
          },
        ],
        footer_rule: 'C: comum — única não-sinônima.',
      },
    ],
  },

  'avancasp-of-sinonimos-e-flutuou-no-ar-como-se-fosse-um-pas-3725102': {
    family: 'conceito',
    source_tec_id: '3725102',
    source_note:
      'flácido≈que cede facilmente; agonizou≈prestes a morrer — Chico Buarque Construção — AVANÇASP Of Adm Pref Varginha 2025 tec 3725102',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Of Adm (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«E flutuou no ar como se fosse um pássaro\nE se acabou no chão feito um pacote flácido\nAgonizou no meio do passeio público»\n\n(«Construção», de Chico Buarque)\n\nAssinale a alternativa que apresenta, na mesma ordem, palavras ou expressões sinônimas dos vocábulos destacados no texto acima.',
    options: [
      { id: 'A', text: 'firme, resistente – esteve prestes a morrer', is_correct: false },
      { id: 'B', text: 'elástico, suave – venceu o sofrimento da morte', is_correct: false },
      { id: 'C', text: 'que cede facilmente – esteve prestes a morrer', is_correct: true },
      { id: 'D', text: 'plácido, tranquilo – ressuscitou', is_correct: false },
      { id: 'E', text: 'que cede facilmente – venceu a dor', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Flácido × agonizou',
        chip_label: 'Construção',
        meta: slideMeta,
        items: [
          { label: 'Flácido', detail: 'Sem firmeza — corpo que cede no chão.', icon: 'Feather' },
          { label: 'Agonizou', detail: 'Lutou contra a morte — quase morreu.', icon: 'HeartPulse' },
          { label: 'Pacote', detail: 'Metáfora do corpo sem vida rígida.', icon: 'Package' },
          { label: 'Passeio público', detail: 'Cena urbana da letra.', icon: 'MapPin' },
          { label: 'Pergunta-teste', detail: 'Par 1: moleza? Par 2: luta final?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar agonizou por «venceu» ou «ressuscitou».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Dois pares na ordem: flácido → cede; agonizou → prestes a morrer.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Letra «Construção»: queda metafórica — pássaro → pacote no chão.',
          '«Flácido»: sem tônus — que cede, murcha, sem resistência.',
          '«Agonizou»: esteve em agonia — luta final, prestes a morrer.',
          'A «firme, resistente»: antônimo de flácido — eliminar.',
          'B «elástico» ok no 1º; «venceu o sofrimento» inverte agonia — eliminar.',
          'C «que cede facilmente» + «prestes a morrer» — par correto — manter.',
          'D «plácido» + «ressuscitou» — ambos errados — eliminar.',
          'E 1º ok; «venceu a dor» ≠ agonizou — eliminar.',
          'Gabarito C.',
          'Em similares: flácido = mole; agonizar = estar em agonia — prove nos dois termos.',
        ],
        footer_rule: 'C: que cede facilmente + prestes a morrer.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FLÁCIDO × AGONIZOU',
        rows: [
          { label: 'Flácido', value: 'Mole, sem firmeza — cede facilmente.' },
          { label: 'Agonizou', value: 'Esteve em agonia — prestes a morrer.' },
          { label: 'Firme', value: 'Antônimo de flácido.' },
          { label: 'Nesta questão', value: 'C — par duplo correto.' },
        ],
        footer_rule: 'Agonizar ≠ vencer a dor — é lutar contra a morte.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par duplo — ordem importa',
        items: [
          { label: 'A — firme', detail: 'Rígido, resistente.', correct: 'Antônimo no contexto: «firme» opõe-se a «flácido» (mole).' },
          { label: 'B — venceu sofrimento', detail: 'Superou a dor da morte.', correct: 'Sinônimo no contexto: «venceu» inverte «agonizou» — indica vitória, não luta final.' },
          { label: 'D — ressuscitou', detail: 'Voltou à vida.', correct: 'Sinônimo no contexto: «ressuscitou» contradiz agonia — morte não revertida.' },
          { label: 'E — venceu a dor', detail: 'Superou o sofrimento.', correct: 'Sinônimo no contexto: «venceu a dor» ≠ «esteve prestes a morrer».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O galho flácido cedeu; o animal agonizou na calçada.»',
            correct: 'Sinônimo no contexto: mole/cede + prestes a morrer — par da letra.',
          },
        ],
        footer_rule: 'C: ordem flácido → agonizou.',
      },
    ],
  },

  'avancasp-ag-sinonimos-disponivel-em-relacao-ao-cartaz-acim-3727038': {
    family: 'text_fragment',
    source_tec_id: '3727038',
    source_note:
      'VF pena=esforço + briga positiva — cartaz estigma saúde mental — AVANÇASP Ag Fisc Pref Varginha 2025 tec 3727038',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag Fisc (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em relação ao cartaz acima, considere as afirmações seguintes e assinale a alternativa que apresenta todas as corretas:\n\n(I) «pena» é sinônimo de «esforço», «sacrifício».\n(II) «pena» é sinônimo de «castigo», «condenação».\n(III) «briga», nesse contexto, assume um sentido positivo, desejável.\n(IV) «briga», nesse contexto, assume um sentido negativo, repudiável.',
    text_fragment:
      '[Cartaz transcrito — campanha de sensibilização sobre estigma em saúde mental]\n\nIlustração: pessoa acolhendo outra. Texto principal em destaque:\n«Dê uma pena — brigue contra o estigma da saúde mental.»\n\nRodapé: mensagem institucional de conscientização — incentiva atitude solidária e combate ao preconceito (não à pessoa, mas ao estigma).',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: '(I) e (IV)', is_correct: false },
      { id: 'B', text: '(I) e (III)', is_correct: true },
      { id: 'C', text: '(II) e (III)', is_correct: false },
      { id: 'D', text: '(II) e (IV)', is_correct: false },
      { id: 'E', text: '(I), (II) e (III)', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pena × briga',
        chip_label: 'Polissemia',
        meta: slideMeta,
        items: [
          { label: 'Pena', detail: '«Dê uma pena» = faça esforço, sacrifício.', icon: 'HandHeart' },
          { label: 'Briga', detail: 'Luta desejável contra o estigma.', icon: 'Swords' },
          { label: 'Estigma', detail: 'Preconceito — alvo da campanha.', icon: 'ShieldAlert' },
          { label: 'Castigo', detail: 'Outro sentido de «pena» — não é o do cartaz.', icon: 'Gavel' },
          { label: 'I + III', detail: 'Esforço + briga positiva — gabarito.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Ler «pena» só como punição (II).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Contexto da campanha define o sentido — polissemia.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cartaz: «Dê uma pena — brigue contra o estigma da saúde mental.»',
          'I: «pena» = esforço, sacrifício (dar uma força) → VERDADEIRA.',
          'II: «pena» = castigo, condenação — sentido jurídico — FALSA no cartaz.',
          'III: «briga» = lutar contra estigma — atitude desejável → VERDADEIRA.',
          'IV: briga negativa, repudiável — contradiz campanha → FALSA.',
          'Combinações: A inclui IV falsa; C e E incluem II falsa; D só falsas.',
          'Gabarito B — (I) e (III).',
          'Em similares: em polissemia, prove qual acepção o cartaz ativa.',
        ],
        footer_rule: 'B = I e III verdadeiras.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VF — PENA × BRIGA',
        rows: [
          { label: 'I', value: 'VERDADEIRA — pena = esforço/sacrifício.' },
          { label: 'II', value: 'FALSA — castigo é outro sentido.' },
          { label: 'III', value: 'VERDADEIRA — briga = luta desejável.' },
          { label: 'IV', value: 'FALSA — briga não é repudiável aqui.' },
          { label: 'Nesta questão', value: 'B — I e III.' },
        ],
        footer_rule: 'Polissemia: pena (esforço) ≠ pena (castigo).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sentidos de pena e briga',
        items: [
          { label: 'A — I e IV', detail: 'IV falsa — briga não é repudiável.', correct: 'Sinônimo no contexto: combinação errada — IV contradiz campanha solidária.' },
          { label: 'C — II e III', detail: 'II falsa — pena não é castigo aqui.', correct: 'Polissemia: «pena» como castigo é sentido distinto do cartaz.' },
          { label: 'D — II e IV', detail: 'Ambas falsas na campanha.', correct: 'Sinônimo no contexto: II e IV leem palavras fora do contexto de acolhimento.' },
          { label: 'E — I, II e III', detail: 'Inclui II falsa.', correct: 'Polissemia: II ativa sentido jurídico — não o do slogan «dê uma pena».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Vou dar uma pena para ajudar no mutirão.»',
            correct: 'Sinônimo no contexto: «pena» = esforço/sacrifício — como no cartaz.',
          },
        ],
        footer_rule: 'Gabarito B — pena como esforço e briga positiva.',
      },
    ],
  },

  'avancasp-acr-sinonimos-leia-o-texto-a-seguir-para-responder-3727505': {
    family: 'text_fragment',
    source_tec_id: '3727505',
    source_note:
      'exótico≈excêntrico; graça≈brincadeira — televizinho Toledo ACre — AVANÇASP ACre Pref Varginha 2025 tec 3727505',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\n«Acha que se está aqui inventando vocábulo exótico, só para fazer graça?»\n\nAssinale a alternativa que apresenta, na mesma ordem, palavras sinônimas para os vocábulos destacados no trecho acima.',
    text_fragment:
      'Saudade do televizinho — Roberto Pompeu de Toledo (Veja — adaptado)\n\nHouve tempo em que havia o televizinho — a pessoa que, não tendo televisão em casa, se aproveitava da do vizinho. O jovem leitor duvida? Acha que se está aqui inventando vocábulo exótico, só para fazer graça? Pois corra aos dicionários. A palavra ali está, tanto no Aurélio como no Houaiss.\n\nOs dicionários conservam palavras em desuso como sedimentos conservam fósseis. Repousam em sono esplêndido palavras como bufarinheiro e alcouceira.\n\nQuem viveu os primeiros anos da televisão sabe que a televizinhança não foi desprezível. Poucos tinham aparelho; o televizinho era tipo social reconhecido — os apresentadores davam boa noite «aos televizinhos». Depois desapareceu, como o agregado nos romances do século XIX.\n\nNa medida em que os lares cortavam excessos humanos, multiplicavam-se os aparelhos de TV. O televizinho de antes passou a ter o próprio — o vocábulo virou forma sem conteúdo.',
    options: [
      { id: 'A', text: 'raro – inveja', is_correct: false },
      { id: 'B', text: 'comum – dádiva', is_correct: false },
      { id: 'C', text: 'excêntrico – brincadeira', is_correct: true },
      { id: 'D', text: 'desnaturado – raiva', is_correct: false },
      { id: 'E', text: 'malfeito – favor', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Exótico × graça',
        chip_label: 'Televizinho',
        meta: slideMeta,
        items: [
          { label: 'Exótico', detail: 'Palavra estranha, fora do comum.', icon: 'Globe' },
          { label: 'Graça', detail: 'Piada, ironia — não inveja.', icon: 'Smile' },
          { label: 'Dicionários', detail: 'Aurélio e Houaiss confirmam «televizinho».', icon: 'Book' },
          { label: 'Fósseis lexicais', detail: 'Palavras em desuso preservadas.', icon: 'Layers' },
          { label: 'Pergunta-teste', detail: 'Par 1: estranho? Par 2: piada?', icon: 'Eye' },
          { label: 'Pegadinha', detail: '«Comum» antônimo; «inveja» troca graça.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Excêntrico + brincadeira — ironia defensiva de Toledo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Toledo (Pref Varginha/ACre): crônica defende «televizinho» contra leitor cético.',
          '«Vocábulo exótico» = termo estranho, peculiar — excêntrico.',
          '«Só para fazer graça» = brincar, ironizar — não é invenção jocosa vazia.',
          'A «raro/inveja»: raro parcial; inveja ≠ graça — eliminar.',
          'B «comum/dádiva»: comum antônimo de exótico — eliminar.',
          'C «excêntrico/brincadeira» — par correto — manter.',
          'D «desnaturado/raiva» — eliminar.',
          'E «malfeito/favor» — eliminar.',
          'Gabarito C.',
          'Em similares: exótico ≈ excêntrico; graça (piada) ≈ brincadeira — prove na ironia.',
        ],
        footer_rule: 'C: excêntrico + brincadeira.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXÓTICO × GRAÇA (ACre)',
        rows: [
          { label: 'Exótico', value: 'Estranho, peculiar — excêntrico.' },
          { label: 'Graça', value: 'Piada, ironia — brincadeira.' },
          { label: 'Comum', value: 'Antônimo de exótico — distrator.' },
          { label: 'Nesta questão', value: 'C — excêntrico / brincadeira.' },
        ],
        footer_rule: 'Graça = brincadeira — não inveja nem favor.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par lexical na crônica',
        items: [
          { label: 'A — inveja', detail: 'Ciúme, ressentimento.', correct: 'Sinônimo no contexto: «inveja» não substitui «graça» (sentido de piada/brincadeira).' },
          { label: 'B — comum', detail: 'Ordinário, usual.', correct: 'Antônimo no contexto: «comum» opõe-se a «exótico» (estranho, peculiar).' },
          { label: 'D — raiva', detail: 'Ira, fúria.', correct: 'Sinônimo no contexto: «raiva» não cobre «fazer graça» (brincar/ironizar).' },
          { label: 'E — favor', detail: 'Benefício, bondade.', correct: 'Sinônimo no contexto: «favor» não equivale a «graça» no sentido de piada.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Não inventei palavra exótica — é graça de cronista.»',
            correct: 'Sinônimo no contexto: excêntrico + brincadeira — tom irônico de Toledo.',
          },
        ],
        footer_rule: 'C: excêntrico + brincadeira.',
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
