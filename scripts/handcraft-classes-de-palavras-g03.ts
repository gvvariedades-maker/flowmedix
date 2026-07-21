#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g03 (8 slugs · Classes de palavras · lote 3 · Adjetivo/Advérbio).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g03.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g03 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g03 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g03';
const SUBTOPICO = 'Classes de palavras';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_classes_palavras';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-formacao-palavras-siglas.json';

const CLASSES_SOURCE = {
  id: 'pt-classes-palavras-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Classes de palavras — morfologia e função na oração',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'adjetivo e advérbio',
    'substantivação e valor adjetivo',
    'advérbio de modo e intensidade',
    'pergunta-teste M02/M03',
    'classificação morfológica',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado';

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
      reviewer: 'handcraft:classes-de-palavras-g03',
      guideline_snapshot: `M02/M03 Elias TE-simples — «O que a palavra faz na oração?» · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      CLASSES_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt_classes_palavras'],
      },
    ],
  };
}

function build(slug: string, spec: Spec) {
  const qd: { instruction: string; options: Opt[]; text_fragment?: string } = {
    instruction: spec.instruction,
    options: spec.options,
  };
  if (spec.text_fragment) qd.text_fragment = spec.text_fragment;
  return {
    meta: metaBase(spec, slug),
    question_data: qd,
    reverse_study_slides: spec.slides,
  };
}

const SPECS: Record<string, Spec> = {
  'avancasp-acr-classes-era-daltonico-1-e-nao-sabia-chegou-a-3727513': {
    family: 'conceito',
    source_tec_id: '3727513',
    source_note: 'Otto Lara Resende daltônico/azul/verde — AVANÇASP ACre Pref Varginha 2025 tec 3727513',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Varginha)',
      orgao: 'Pref Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '“Era daltônico(1) e não sabia. Chegou assim à idade adulta(2), sem se queixar das cores que não via. (...) E aos seus olhos, o azul(3) não era honestamente azul(4). Era verde(5).” (Otto Lara Resende)\n\nAssinale a alternativa que apresenta uma análise correta das palavras identificadas no trecho acima.',
    options: [
      { id: 'A', text: '(1), (2) e (3) são palavras empregadas no trecho com valor substantivo.', is_correct: false },
      { id: 'B', text: '(1), (2) e (3) são palavras empregadas no trecho com valor adjetivo.', is_correct: false },
      {
        id: 'C',
        text: '(1) e (2) são palavras de natureza adjetiva que qualificam o personagem do texto (“ele”).',
        is_correct: false,
      },
      { id: 'D', text: '(3) é uma palavra de natureza adjetiva que qualifica (4) e (5).', is_correct: false },
      {
        id: 'E',
        text: '(4) e (5) são palavras de natureza adjetiva que qualificam o substantivo (3).',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Números (1)–(5)',
        chip_label: 'M02 — adj × subst',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Nomeia (substantivo) ou qualifica (adjetivo)?', icon: 'Focus' },
          { label: '(1) daltônico', detail: 'Predicativo de «ele» — adjetivo.', icon: 'User' },
          { label: '(2) adulta', detail: 'Qualifica «idade» — adjetivo.', icon: 'Calendar' },
          { label: '(3) o azul', detail: 'Artigo + cor → substantivo (nome da tonalidade).', icon: 'Palette' },
          { label: '(4)(5) azul/verde', detail: 'Predicativos ligados a «o azul» — adjetivos.', icon: 'Paintbrush' },
        ],
        footer_rule: 'O azul = substantivo; azul/verde = adjetivos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Mapa → gabarito',
        meta: slideMeta,
        steps: [
          'Trecho Otto Lara Resende: cinco palavras numeradas sobre daltonismo e cores.',
          '(1) daltônico e (2) adulta qualificam seres — adjetivos (C fala só nelas, mas ignora o núcleo).',
          '(3) «o azul» — artigo + cor = substantivo — eliminar A/B (tratam 1–3 como só adj ou só subst).',
          '(4) «azul» e (5) «verde» predicam sobre «o azul» — adjetivos.',
          'D inverte: (3) não é adjetivo de (4) e (5).',
          'E: (4) e (5) adjetivos qualificam o substantivo (3) — correto.',
          'Gabarito E.',
          'Em similares: artigo antes da cor = substantivo; repetição da cor sem artigo = adjetivo.',
        ],
        footer_rule: 'E — (4)(5) adjetivos de (3).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'O AZUL × AZUL',
        rows: [
          { label: 'Pergunta-teste', value: 'Tem artigo? Qualifica outro nome?' },
          { label: '(3) o azul', value: 'Substantivo — nome da cor.' },
          { label: '(4)(5) azul/verde', value: 'Adjetivos — predicativos do núcleo «azul».' },
          { label: '(1)(2)', value: 'Adjetivos — daltônico/adulta.' },
          { label: 'Nesta questão', value: 'E — adjetivos (4)(5) sobre substantivo (3).' },
        ],
        footer_rule: 'O azul ≠ azul predicativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra o par numerado',
        items: [
          { label: 'A — 1–3 substantivo', detail: 'Trata «daltônico» e «o azul» só como substantivos.', correct: '(1)(2) são adjetivos; (3) é substantivo — não todos substantivos.' },
          { label: 'B — 1–3 adjetivo', detail: 'Ignora substantivação de «o azul».', correct: '(3) com artigo é substantivo — B falha no item 3.' },
          { label: 'C — 1 e 2', detail: 'Acerta (1)(2), mas não responde ao foco (3)(4)(5).', correct: 'Análise incompleta — gabarito exige relação (4)(5) → (3).' },
          { label: 'D — (3) adjetivo', detail: 'Inverte: faz «o azul» qualificar (4) e (5).', correct: '(3) é núcleo substantivo; (4)(5) o qualificam.' },
          { label: 'Em outra banca…', detail: 'Trocam por «o verde dos campos» / «era verde».', correct: 'Mesmo trilho: artigo + cor = substantivo; predicativo = adjetivo.' },
        ],
        footer_rule: 'Só E fecha (3)(4)(5).',
      },
    ],
  },

  'educa-pb-acs-classes-considere-o-texto-a-seguir-para-resp-3819856': {
    family: 'conceito',
    source_tec_id: '3819856',
    source_note: '«rápida» em grana rápida — EDUCA PB ACS Pref Ibiara 2025 tec 3819856',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACS (Pref Ibiara)',
      orgao: 'Pref Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nTEXTO II\nDisponível em: https://umbrasil.com/charges/\n\nNo cartum, o termo “rápida”, presente na expressão “Destruição e grana rápida”, é classificado como:',
    options: [
      { id: 'A', text: 'Advérbio, pois modifica o verbo “destruição”.', is_correct: false },
      { id: 'B', text: 'Adjetivo, pois caracteriza o substantivo “grana”.', is_correct: true },
      { id: 'C', text: 'Pronome, pois substitui o nome “grana”.', is_correct: false },
      { id: 'D', text: 'Conjunção, pois estabelece relação entre as ideias.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Grana rápida',
        chip_label: 'M02 — adjetivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Rápida» qualifica nome ou circunstancia verbo?', icon: 'Focus' },
          { label: 'Grana rápida', detail: '«Rápida» junto a «grana» — adjunto adnominal.', icon: 'Coins' },
          { label: '≠ Advérbio', detail: '«Destruição» é substantivo, não verbo — A erra.', icon: 'XCircle' },
          { label: '≠ Pronome', detail: 'Não substitui «grana».', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Confundir «destruição» (nome) com verbo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adjunto de substantivo = adjetivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cartum: expressão «Destruição e grana rápida» — foco em «rápida».',
          '«Rápida» está ao lado de «grana» (substantivo) → caracteriza o dinheiro.',
          'A diz advérbio de «destruição» — mas «destruição» é substantivo, não verbo.',
          'C pronome e D conjunção não encaixam na posição.',
          'B: adjetivo caracterizando «grana» — correto.',
          'Gabarito B.',
          'Em similares: pergunta «a quem se liga?» — se ao substantivo, adjetivo.',
        ],
        footer_rule: 'B — adjetivo de «grana».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO ADNOMINAL',
        rows: [
          { label: 'Pergunta-teste', value: 'Qualifica substantivo adjacente?' },
          { label: 'Grana rápida', value: 'Adjetivo — modo/caráter da grana.' },
          { label: '× advérbio', value: 'Advérbio modificaria verbo/adj/adv.' },
          { label: 'Destruição', value: 'Substantivo no cartum — não recebe «rápida».' },
          { label: 'Nesta questão', value: 'B — adjetivo.' },
        ],
        footer_rule: 'Rápida qualifica grana.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe errada por vizinho',
        items: [
          { label: 'A — advérbio', detail: 'Trata «destruição» como verbo.', correct: '«Destruição» é substantivo — «rápida» não é advérbio aqui.' },
          { label: 'C — pronome', detail: '«Rápida» não substitui «grana».', correct: 'Função adjetival — qualifica o substantivo.' },
          { label: 'D — conjunção', detail: 'Não liga orações nem termos coordenados.', correct: 'É modificador de «grana» — adjetivo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «dinheiro fácil» / «lucro rápido».', correct: 'Mesmo teste: palavra ao lado do substantivo = adjetivo.' },
          { label: 'Pegadinha TE', detail: 'Aluno vê «destruição» e pensa em ação verbal.', correct: 'Leia o sintagma: núcleo «grana» + «rápida».' },
        ],
        footer_rule: 'Só B — adjetivo.',
      },
    ],
  },

  'instituto-ao-classes-leia-o-texto-a-seguir-para-responder-3840838': {
    family: 'conceito',
    source_tec_id: '3840838',
    source_note: '«bem» em exercício bem poderoso — Instituto AOCP Ass UNIRIO 2026 tec 3840838',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nTexto 1 — «Bons motivos para não se levar tão a sério…» (Folha/UOL, adaptado)\n\n[...] viver uma experiência só para si pode ser um exercício bem poderoso.\n\nA palavra destacada em «[...] viver uma experiência só para si pode ser um exercício bem poderoso.» é empregada, nesse excerto,',
    options: [
      { id: 'A', text: 'como antônimo de “mal”.', is_correct: false },
      { id: 'B', text: 'como antônimo de “mau”.', is_correct: false },
      {
        id: 'C',
        text: 'com o mesmo sentido e a mesma classificação morfológica que em “O conhecimento é o bem mais poderoso da humanidade”.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'para intensificar o adjetivo “poderoso”, sendo, portanto, um advérbio.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'para atribuir um valor positivo ao substantivo “exercício”, como o seu sinônimo “bom” em “Esse exercício é bom para a saúde”.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Bem poderoso',
        chip_label: 'M03 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Bem» modifica adjetivo ou nomeia (substantivo)?', icon: 'Focus' },
          { label: 'Bem + poderoso', detail: 'Intensifica o adjetivo — advérbio de grau/modo.', icon: 'Zap' },
          { label: '≠ Substantivo', detail: 'Em «o bem mais poderoso» — classe diferente (C).', icon: 'Box' },
          { label: '≠ Sinônimo de bom', detail: 'Não qualifica «exercício» como «bom» (E).', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Homônimo «bem/bom» e «bem» substantivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Bem + adjetivo = advérbio (intensidade).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Folha sobre brincar na vida adulta — trecho «exercício bem poderoso».',
          '«Bem» está antes de «poderoso» (adjetivo) → reforça o grau — advérbio.',
          'A/B antônimos de mal/mau — sentido e classe não batem.',
          'C compara com «o bem mais poderoso» — lá «bem» é substantivo; aqui não.',
          'E trata «bem» como sinônimo de «bom» qualificando «exercício» — função adjetival, não é o caso.',
          'D: intensifica «poderoso» → advérbio — correto.',
          'Gabarito D.',
          'Em similares: bem/ mal + adjetivo = advérbio de intensidade.',
        ],
        footer_rule: 'D — advérbio de intensidade.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'BEM × BOM × O BEM',
        rows: [
          { label: 'Pergunta-teste', value: 'Modifica adjetivo? Nomeia coisa?' },
          { label: 'Bem poderoso', value: 'Advérbio — intensifica «poderoso».' },
          { label: 'O bem', value: 'Substantivo — «o bem mais poderoso» (C).' },
          { label: 'Bom exercício', value: 'Adjetivo — qualifica substantivo (E).' },
          { label: 'Nesta questão', value: 'D — advérbio.' },
        ],
        footer_rule: 'Bem + adj. = advérbio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Homônimos e classes trocadas',
        items: [
          { label: 'A — antônimo mal', detail: '«Bem» não funciona como oposto de «mal» aqui.', correct: 'Valor intensificador de «poderoso» — advérbio.' },
          { label: 'B — antônimo mau', detail: 'Confunde «bem» com «bom/mau».', correct: 'Intensifica adjetivo — não antônimo.' },
          { label: 'C — o bem', detail: 'Copia classe do substantivo «bem» de outra frase.', correct: 'Neste trecho «bem» modifica adjetivo — advérbio.' },
          { label: 'E — sinônimo bom', detail: 'Qualificaria «exercício» como adjetivo.', correct: '«Bem» liga-se a «poderoso», não diretamente a «exercício».' },
          { label: 'Em outra banca…', detail: 'Trocam por «muito forte» / «bastante útil».', correct: 'Mesmo padrão: advérbio de intensidade + adjetivo.' },
        ],
        footer_rule: 'Só D — advérbio.',
      },
    ],
  },

  'educa-pb-ag-classes-leia-o-texto-a-seguir-e-responda-a-q-3913810': {
    family: 'conceito',
    source_tec_id: '3913810',
    source_note: '«essencialmente» advérbio — EDUCA PB Ag Adm Pref Cajazeiras 2026 tec 3913810',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref Cajazeiras',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nTEXTO II — Casamento, uma invenção cristã (Rainer Gonçalves Sousa / Historiadomundo, adaptado)\n\nQuanto à classe gramatical, assinale a opção que apresenta CORRETAMENTE a classificação da palavra sublinhada:',
    options: [
      {
        id: 'A',
        text: '“…Entre 965 e 1008 eram batizados os reis da Dinamarca, Polônia, Hungria, Rússia, Noruega e Suécia…” – substantivo.',
        is_correct: false,
      },
      {
        id: 'B',
        text: '“…para os pagãos, fossem eles germânicos, eslavos ou ainda mais recentemente vikings instalados na Normandia desde 911…” – preposição.',
        is_correct: false,
      },
      {
        id: 'C',
        text: '“…Durante o Sacro Império Romano Germânico — que sucedeu ao desaparecido Império Romano —, dirigido por Oto III de 998 a 1002, houve uma fabulosa transformação das sociedades urbanas romanas…” – verbo.',
        is_correct: false,
      },
      {
        id: 'D',
        text: '“…Essas uniões eram essencialmente políticas e sociais, decididas pelos pais…” – advérbio.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Essencialmente',
        chip_label: 'M03 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Modifica adjetivo/verbo ou nomeia?', icon: 'Focus' },
          { label: 'Essencialmente', detail: 'Circunstância de modo/intensidade de «políticas».', icon: 'Zap' },
          { label: 'Reis / pagãos', detail: 'A e B erram classe (substantivo/preposição).', icon: 'Map' },
          { label: 'Houve', detail: 'Verbo na oração de C — não é o sublinhado pedido.', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: 'Termina em -mente → advérbio derivado.', icon: 'AlertTriangle' },
        ],
        footer_rule: '-mente após adjetivo → advérbio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto histórico do casamento medieval — comando: classificar palavra sublinhada em cada opção.',
          'A «reis» — substantivo; B «para» — preposição; C «houve» — verbo — eliminar.',
          'D «essencialmente políticas»: -mente modifica «políticas e sociais» → advérbio.',
          'Gabarito D.',
          'Em similares: derivado em -mente de adjetivo = advérbio de modo.',
        ],
        footer_rule: 'D — advérbio.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUFIXO -MENTE',
        rows: [
          { label: 'Pergunta-teste', value: 'Termina em -mente? Modifica o quê?' },
          { label: 'Essencialmente', value: 'Advérbio — modo de ser «políticas/sociais».' },
          { label: 'Essencial', value: 'Adjetivo base — «união essencial».' },
          { label: 'Demais opções', value: 'A subst. · B prep. · C verbo.' },
          { label: 'Nesta questão', value: 'D — advérbio.' },
        ],
        footer_rule: 'Essencialmente = advérbio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe de outro termo',
        items: [
          { label: 'A — substantivo', detail: '«Reis» é substantivo, mas não é o foco correto da alternativa certa.', correct: 'Gabarito pede trecho com «essencialmente» — advérbio.' },
          { label: 'B — preposição', detail: '«Para» é preposição — opção incorreta.', correct: 'Não confundir com advérbio do trecho D.' },
          { label: 'C — verbo', detail: '«Houve» é verbo auxiliar/inexistente.', correct: 'Sublinhado de D é «essencialmente» — advérbio.' },
          { label: 'Em outra banca…', detail: 'Trocam por «principalmente» / «basicamente».', correct: 'Mesmo molde: -mente + adjetivo = advérbio.' },
          { label: 'Pegadinha', detail: 'Achar que «essencialmente» é adjetivo.', correct: 'Modifica «políticas» — função adverbial.' },
        ],
        footer_rule: 'Só D classifica certo.',
      },
    ],
  },

  'avancasp-afa-classes-assinale-a-alternativa-cujo-termo-de-3962475': {
    family: 'conceito',
    source_tec_id: '3962475',
    source_note: '«rápido» advérbio — AVANÇASP AFar Pref Nova Odessa 2026 tec 3962475',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AFar (Pref N Odessa)',
      orgao: 'Pref N Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa cujo termo destacado possui natureza adverbial, indicando alguma circunstância em relação à ação verbal.',
    options: [
      { id: 'A', text: 'Alan, seja rápido ao atender a porta.', is_correct: false },
      { id: 'B', text: 'Gostaria que viesse rápido à minha sala.', is_correct: true },
      { id: 'C', text: 'Você não é tão rápido quanto um atleta.', is_correct: false },
      { id: 'D', text: 'Atiradores devem ser rápidos e precisos.', is_correct: false },
      { id: 'E', text: 'Rápidos, os répteis corriam do incêndio.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Rápido × rápidos',
        chip_label: 'M03 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Circunstancia verbo ou qualifica nome?', icon: 'Focus' },
          { label: 'Viesse rápido', detail: 'Modo da ação «viesse» — advérbio.', icon: 'Zap' },
          { label: 'Seja rápido', detail: 'Predicativo do imperativo — valor adjetivo (A).', icon: 'User' },
          { label: 'É rápido / rápidos', detail: 'Atributo/predicativo de sujeito — adjetivo (C/D/E).', icon: 'Users' },
          { label: 'Pegadinha', detail: 'Mesma forma, funções diferentes na oração.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Advérbio circunstancia verbo; adjetivo qualifica nome.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: termo destacado com natureza adverbial (circunstância verbal).',
          'A «seja rápido» — predicativo do sujeito no imperativo — adjetivo.',
          'B «viesse rápido» — modo como viria — advérbio de modo — correto.',
          'C «é rápido» — característica do sujeito — adjetivo.',
          'D «rápidos e precisos» — qualificam «atiradores» — adjetivo.',
          'E «Rápidos, os répteis» — predicativo — adjetivo.',
          'Gabarito B.',
          'Em similares: teste «como?» após verbo → advérbio.',
        ],
        footer_rule: 'B — rápido advérbio.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJ × ADV — RÁPIDO',
        rows: [
          { label: 'Pergunta-teste', value: 'Liga-se a verbo (como?) ou a nome?' },
          { label: 'Viesse rápido', value: 'Advérbio de modo.' },
          { label: 'Seja rápido', value: 'Adjetivo — predicativo.' },
          { label: 'É / são rápidos', value: 'Adjetivo — atributo/predicativo.' },
          { label: 'Nesta questão', value: 'B — advérbio.' },
        ],
        footer_rule: 'Verbo + rápido = advérbio (B).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Adjetivo mascarado',
        items: [
          { label: 'A — seja rápido', detail: 'Parece circunstância, mas é predicativo.', correct: '«Rápido» qualifica «Alan» via imperativo — adjetivo.' },
          { label: 'C — tão rápido', detail: 'Comparativo adjetival do sujeito.', correct: '«Você é rápido» — adjetivo, não advérbio.' },
          { label: 'D — rápidos', detail: 'Qualifica «atiradores».', correct: 'Função adjetival — eliminar.' },
          { label: 'E — Rápidos, os répteis', detail: 'Predicativo do sujeito.', correct: 'Adjetivo — não circunstância verbal autônoma.' },
          { label: 'Em outra banca…', detail: 'Trocam por «fale baixo» / «corra devagar».', correct: 'Mesmo teste: verbo + modo = advérbio.' },
        ],
        footer_rule: 'Só B é advérbio.',
      },
    ],
  },

  'cpcon-uepb-a-classes-leia-o-texto-04-para-responder-a-que-4014478': {
    family: 'conceito',
    source_tec_id: '4014478',
    source_note: '«aqui» déitico advérbio — CPCON UEPB ACS Pref Itabaiana 2026 tec 4014478',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Itabaiana)',
      orgao: 'Pref Itabaiana',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto 04 para responder à questão.\n\nTexto 04\nDisponível em: https://www.instagram.com.br/niquel.nausea. Acesso em: 24 fev. 2026.\n\nNo que se refere ao emprego do elemento aqui, presente no quarto quadrinho, é CORRETO afirmar que:',
    options: [
      {
        id: 'A',
        text: 'é um elemento catafórico que ajuda a situar e interpretar o texto, e é classificado gramaticalmente como advérbio.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'é um elemento anafórico que ajuda a situar e interpretar o texto, e é classificado gramaticalmente como advérbio.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'é um elemento anafórico que ajuda a situar e interpretar o texto, e é classificado gramaticalmente como pronome.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'é um elemento dêitico que ajuda a situar e interpretar o texto, e é classificado gramaticalmente como pronome.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'é um elemento dêitico que ajuda a situar e interpretar o texto, e é classificado gramaticalmente como advérbio.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aqui no quarto quadrinho',
        chip_label: 'M03 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Emprego do elemento aqui no Texto 04 — que classe?', icon: 'Focus' },
          { label: 'Quarto quadrinho', detail: '«Aqui» ajuda a situar e interpretar a charge.', icon: 'Image' },
          { label: 'Dêitico', detail: 'Elemento que aponta o lugar — não anáfora nem catafora.', icon: 'MapPin' },
          { label: 'Advérbio', detail: 'Circunstância de lugar — classificação gramatical correta.', icon: 'Zap' },
          { label: '≠ Pronome', detail: 'Não substitui substantivo neste emprego.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Confundir dêixis com retomada anafórica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Elemento aqui = advérbio dêitico no quarto quadrinho.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto 04 (charge): emprego do elemento aqui no quarto quadrinho.',
          'Comando: é CORRETO afirmar sobre situar e interpretar o texto.',
          'Função textual: situa no espaço do enunciador → dêitico (não anáfora/catafora).',
          'Eliminar A/B (catafórico/anafórico) e C (anafórico).',
          'Classe: «aqui» indica lugar — advérbio (não pronome demonstrativo substituto).',
          'D junta dêitico + pronome — classe errada.',
          'E: dêitico + advérbio — correto.',
          'Gabarito E.',
          'Em similares: aqui/ali/agora = advérbios dêiticos em quadrinhos.',
        ],
        footer_rule: 'E — dêitico, advérbio (Texto 04).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AQUI — Texto 04',
        rows: [
          { label: 'Emprego', value: 'Elemento aqui no quarto quadrinho.' },
          { label: 'Função', value: 'Dêitico — situar e interpretar o texto.' },
          { label: 'Classe', value: 'Advérbio de lugar.' },
          { label: '× anáfora', value: 'Não retoma termo anterior.' },
          { label: 'Nesta questão', value: 'E — CORRETO: dêitico + advérbio.' },
        ],
        footer_rule: 'Dêitico ≠ anafórico.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função textual × morfologia',
        items: [
          { label: 'A — catafórico', detail: '«Aqui» não antecipa referente posterior.', correct: 'É dêitico — aponta o lugar do discurso.' },
          { label: 'B — anafórico', detail: 'Não retoma elemento anterior explícito.', correct: 'Dêitico de lugar — não anáfora.' },
          { label: 'C — pronome anafórico', detail: 'Erra função e classe.', correct: 'Advérbio dêitico — não pronome.' },
          { label: 'D — pronome dêitico', detail: 'Acerta dêixis, mas classe morfológica errada.', correct: '«Aqui» = advérbio de lugar.' },
          { label: 'Em outra banca…', detail: 'Trocam por «agora» / «lá» em charges.', correct: 'Mesmo par: dêitico + advérbio.' },
        ],
        footer_rule: 'Só E fecha função e classe.',
      },
    ],
  },

  'apice-acs-pr-classes-considere-o-texto-a-seguir-para-resp-4024888': {
    family: 'conceito',
    source_tec_id: '4024888',
    source_note: 'Embora/relativamente/cedo — Ápice ACS Pref Monteiro 2026 tec 4024888',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref Monteiro',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nAs universidades e o desafio da desigualdade social (Cesar Martins / Folha/UOL, adaptado)\n\n[...]\n\nObserve as palavras destacadas no trecho a seguir:\n\n“Embora tardio, o Brasil adotou relativamente cedo o modelo de universidades públicas, em princípio abertas a todos.”\n\nAssinale a alternativa que apresenta a classificação morfológica das palavras destacadas, conforme o contexto em que se encontram, e na ordem em que ocorrem.',
    options: [
      { id: 'A', text: 'Advérbio, advérbio e advérbio.', is_correct: false },
      { id: 'B', text: 'Advérbio, adjetivo e adjetivo.', is_correct: false },
      { id: 'C', text: 'Adjetivo, advérbio e advérbio.', is_correct: false },
      { id: 'D', text: 'Adjetivo, adjetivo e advérbio.', is_correct: false },
      { id: 'E', text: 'Advérbio, advérbio e adjetivo.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três destacadas',
        chip_label: 'M03 — ordem',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Ordem no trecho: que classe em cada uma?', icon: 'Focus' },
          { label: 'Embora', detail: 'Conjunção subordinativa adverbial → valor adverbial (1ª).', icon: 'Link' },
          { label: 'Relativamente', detail: 'Advérbio de modo — intensifica «cedo» (2ª).', icon: 'Zap' },
          { label: 'Cedo', detail: 'No contexto, valor adjetivo/predicativo na sequência (3ª).', icon: 'Clock' },
          { label: 'Pegadinha', detail: 'Trocar ordem ou confundir «tardio» com destaque.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Siga a ordem: Embora → relativamente → cedo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Folha sobre universidades — trecho com três palavras destacadas em ordem.',
          '1ª «Embora»: introduz concessão — classificação adverbial (conjunção advérbial).',
          '2ª «relativamente»: modifica «cedo» — advérbio de modo.',
          '3ª «cedo»: no encadeamento do trecho, valor adjetivo na análise da banca.',
          'Sequência: advérbio + advérbio + adjetivo → letra E.',
          'Eliminar A (tudo advérbio), C (começa com adjetivo), D (dois adjetivos no fim).',
          'Gabarito E.',
          'Em similares: respeite ordem textual das palavras destacadas.',
        ],
        footer_rule: 'E — adv. · adv. · adj.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ORDEM NO TRECHO',
        rows: [
          { label: '1ª Embora', value: 'Advérbio (concessão).' },
          { label: '2ª relativamente', value: 'Advérbio de modo.' },
          { label: '3ª cedo', value: 'Adjetivo (gabarito da prova).' },
          { label: 'Comando', value: 'Classificar na ordem em que aparecem.' },
          { label: 'Nesta questão', value: 'E — advérbio, advérbio e adjetivo.' },
        ],
        footer_rule: 'Não reordene as destaques.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Ordem ou classe trocada',
        items: [
          { label: 'A — tudo advérbio', detail: 'Trata «cedo» também como advérbio.', correct: 'Terceira palavra = adjetivo na chave — eliminar A.' },
          { label: 'B — adv.+adj.+adj.', detail: 'Segunda palavra não é adjetivo.', correct: '«Relativamente» é advérbio — eliminar B.' },
          { label: 'C — adj.+adv.+adv.', detail: 'Começa com adjetivo («Embora»).', correct: 'Primeira é adverbial — eliminar C.' },
          { label: 'D — adj.+adj.+adv.', detail: 'Duas primeiras como adjetivo.', correct: 'Embora e relativamente = advérbio — eliminar D.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Embora cedo, adotou relativamente tarde».', correct: 'Mesmo método: ordem + pergunta-teste por palavra.' },
        ],
        footer_rule: 'Só E na ordem certa.',
      },
    ],
  },

  'vunesp-age-p-classes-leia-o-texto-para-responder-a-questa-3336126': {
    family: 'conceito',
    source_tec_id: '3336126',
    source_note: '«muito» advérbio intensidade — VUNESP Age Pres Prudente 2025 tec 3336126',
    meta: {
      banca: 'VUNESP',
      prova: 'Age (Pres Prudente)',
      orgao: 'Pres Prudente',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nEstratégias de sobrevivência (Kalaf Epalanga, adaptado)\n\n[...]\n\nO termo destacado é um advérbio expressando circunstância de intensidade em:',
    options: [
      { id: 'A', text: 'Hoje bateu uma saudade danada de visitar uma feira literária... (1º parágrafo)', is_correct: false },
      {
        id: 'B',
        text: '... manterem viva essa coisa tão necessária para a nossa saúde mental... (1º parágrafo)',
        is_correct: false,
      },
      { id: 'C', text: 'Colhi tanto prazer nisso que não o via como sacrifício. (2º parágrafo)', is_correct: false },
      { id: 'D', text: '... personagens que pululam em muitas das minhas histórias. (2º parágrafo)', is_correct: false },
      {
        id: 'E',
        text: '... não muito longe de Fornos de Algodres e Mangualde. (2º parágrafo)',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Advérbio de intensidade',
        chip_label: 'M03 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual «muito/tão/tanto» intensifica adjetivo/adv?', icon: 'Focus' },
          { label: 'Não muito longe', detail: '«Muito» modifica «longe» — intensidade de distância.', icon: 'MapPin' },
          { label: 'Danada / tão / tanto', detail: 'Outras intensidades — mas não são o destaque pedido.', icon: 'Sparkles' },
          { label: 'Muitas histórias', detail: '«Muitas» quantifica substantivo — numeral/adj.', icon: 'Hash' },
          { label: 'Pegadinha', detail: 'Confundir «muito» advérbio com «muitas» adjetivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Muito + longe = advérbio de intensidade.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica Kalaf Epalanga — comando: advérbio de intensidade no trecho destacado.',
          'A «saudade danada» — «danada» intensifica, mas não é o par «muito» pedido.',
          'B «tão necessária» — «tão» intensifica adjetivo — outro termo.',
          'C «tanto prazer» — «tanto» quantifica/intensifica — contexto distinto.',
          'D «muitas histórias» — «muitas» é adjetivo (quantidade), não advérbio.',
          'E «não muito longe» — «muito» intensifica advérbio «longe» — correto.',
          'Gabarito E.',
          'Em similares: muito + advérbio de lugar/modo = intensidade.',
        ],
        footer_rule: 'E — muito (intensidade).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MUITO × MUITAS',
        rows: [
          { label: 'Pergunta-teste', value: 'Modifica advérbio/adjetivo ou substantivo?' },
          { label: 'Muito longe', value: 'Advérbio de intensidade + advérbio de lugar.' },
          { label: 'Muitas histórias', value: 'Adjetivo — quantifica substantivo.' },
          { label: 'Tão / tanto', value: 'Intensificadores em outras linhas.' },
          { label: 'Nesta questão', value: 'E — «muito» em «não muito longe».' },
        ],
        footer_rule: 'Muito longe ≠ muitas histórias.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Intensidade em outro termo',
        items: [
          { label: 'A — danada', detail: 'Intensifica «saudade», mas não é «muito» destacado.', correct: 'Gabarito pede trecho E com «muito».' },
          { label: 'B — tão', detail: 'Intensifica «necessária» — adjetivo.', correct: 'Outro intensificador — não é o foco da questão.' },
          { label: 'C — tanto', detail: 'Intensifica «prazer» (substantivo).', correct: '«Tanto» ≠ «muito» do enunciado.' },
          { label: 'D — muitas', detail: 'Quantificador adjetival de «histórias».', correct: 'Não é advérbio de intensidade — eliminar.' },
          { label: 'Em outra banca…', detail: 'Trocam por «bem perto» / «quase perto».', correct: 'Mesmo teste: intensificador + advérbio de lugar.' },
        ],
        footer_rule: 'Só E — muito longe.',
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
    slugs,
  };
  writeFileSync(loteCatalogPath(LOTE), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] catalog.json written (${slugs.length} slugs)`);

  const manifest = {
    lote: LOTE,
    subtopico: SUBTOPICO,
    topico: TOPICO,
    pedagogical_branch: BRANCH,
    total: slugs.length,
    slugs,
  };
  writeFileSync(loteManifestPath(LOTE), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] manifest.json written (${slugs.length} slugs)`);
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
