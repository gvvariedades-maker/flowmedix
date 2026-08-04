/**
 * Handcraft golden-v1 — nocoes-de-anatomia-g04 (8 slugs).
 * Uso: npx tsx scripts/handcraft-nocoes-de-anatomia-g04.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LOTE = 'nocoes-de-anatomia-g04';
const SUB = 'Noções de Anatomia';
const REVIEWED = '2026-08-03';

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  modulo_slug?: string;
  meta?: Record<string, unknown>;
  question_data?: { instruction?: string; options?: Opt[]; text_fragment?: string };
  reverse_study_slides?: unknown[];
};

function qPath(slug: string) {
  return resolve(process.cwd(), 'data/catalog-migration', LOTE, 'questions', `${slug}.json`);
}

function load(slug: string): Q {
  const p = qPath(slug);
  if (!existsSync(p)) throw new Error(`missing ${p}`);
  return JSON.parse(readFileSync(p, 'utf8')) as Q;
}

function save(slug: string, payload: Q) {
  writeFileSync(qPath(slug), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`[handcraft:anat-g04] wrote ${slug}`);
}

function enrichMeta(
  q: Q,
  args: {
    family: string;
    branch: string;
    snapshot: string;
    examVsCurrent?: string;
    sources?: unknown[];
  },
) {
  q.meta = {
    ...(q.meta ?? {}),
    subtopico: SUB,
    content_standard: 'golden-v1',
    family: args.family,
    pedagogical_branch: args.branch,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'onda1-anatomia',
      guideline_snapshot: args.snapshot,
      exam_vs_current: args.examVsCurrent ?? 'none',
    },
    sources: args.sources ?? [
      {
        id: 'anatomia-basica',
        tier: 'B',
        issuer: 'Referência acadêmica de anatomia',
        title: 'Noções de Anatomia — TE',
        year: 2020,
        covers: [args.branch],
      },
    ],
  };
}

const META_SLIDE = { topico: 'Enfermagem', subtopico: SUB };

/** Mitral entre AE e VE (B) */
function handcraftMitral() {
  const slug = 'fauel-enfermagem-nocoes-de-anatomia-1775447834740-7';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_cardiovascular',
    snapshot: 'Valva mitral (bicúspide) entre átrio esquerdo e ventrículo esquerdo; tricúspide = direita; aórtica/pulmonar = saída',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Valva entre átrio esquerdo e ventrículo esquerdo',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail:
            'Válvulas cardíacas garantem fluxo único entre átrios e ventrículos — qual fica entre o átrio esquerdo e o ventrículo esquerdo?',
          icon: 'Target',
        },
        {
          label: 'Valva mitral',
          detail: 'Também chamada bicúspide — porta atrioventricular do lado esquerdo.',
          icon: 'Heart',
        },
        {
          label: 'Outras valvas',
          detail: 'Valva tricúspide = direita; valva aórtica e valva pulmonar = saída dos ventrículos.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar valva tricúspide por ser AV, ou valva aórtica por ser do lado esquerdo.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Átrio esquerdo ↔ ventrículo esquerdo = valva mitral',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar: valva localizada entre o átrio esquerdo e o ventrículo esquerdo.',
        'Eliminar A: valva tricúspide fica entre átrio e ventrículo direitos.',
        'Eliminar C: valva aórtica fica na saída do ventrículo esquerdo (para fora do ventrículo).',
        'Eliminar D: valva pulmonar fica na saída do ventrículo direito.',
        'Validar B: valva mitral.',
        'Em similares: fluxo único átrio→ventrículo esquerdo = mitral; direito = tricúspide.',
      ],
      footer_rule: 'AV esquerda = mitral; AV direita = tricúspide',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ANATOMIA CARDÍACA — VALVAS',
      rows: [
        { label: 'Valva mitral', value: 'Átrio esquerdo ↔ ventrículo esquerdo' },
        { label: 'Valva tricúspide', value: 'Átrio direito ↔ ventrículo direito' },
        { label: 'Valva aórtica', value: 'Saída do ventrículo esquerdo' },
        { label: 'Valva pulmonar', value: 'Saída do ventrículo direito' },
      ],
      footer_rule: 'Entre átrios e ventrículos × para fora dos ventrículos',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'VALVAS NO LUGAR ERRADO',
      items: [
        {
          label: 'Valva tricúspide',
          detail: 'Também entre átrio e ventrículo.',
          correct: 'Tricúspide é do lado direito — não entre átrio esquerdo e ventrículo esquerdo.',
        },
        {
          label: 'Valva aórtica',
          detail: 'Lado esquerdo, mas saída.',
          correct: 'Aórtica conduz para fora do ventrículo esquerdo — não entre átrio e ventrículo.',
        },
        {
          label: 'Valva pulmonar',
          detail: 'Saída do ventrículo direito.',
          correct: 'Não é a valva entre átrio esquerdo e ventrículo esquerdo.',
        },
        {
          label: 'Em similares',
          detail: 'Bicúspide = outro nome.',
          correct: 'Bicúspide e valva mitral são a mesma estrutura esquerda.',
        },
      ],
      footer_rule: 'Lado esquerdo + entre átrio e ventrículo = mitral',
    },
  ];
  save(slug, q);
}

/** Fígado no QSD (B) */
function handcraftFigadoQsd() {
  const slug = 'fenix-instituto-enfermagem-nocoes-de-anatomia-1775447762008-6';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_cavidades',
    snapshot:
      'Quadrante superior direito (QSD): fígado (maior parte), vesícula; baço = QSE; estômago = QSE/epigástrio',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Trauma abdominal — QSD',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Trauma abdominal: órgão no quadrante superior direito com risco de hemorragia.',
          icon: 'Target',
        },
        {
          label: 'Fígado',
          detail: 'Ocupa predominantemente o QSD — altamente vascularizado.',
          icon: 'MapPin',
        },
        {
          label: 'Vizinhos de outros quadrantes',
          detail: 'Baço e grande parte do estômago → QSE; intestino delgado → vários quadrantes.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar baço por também sangrar muito — mas o baço é QSE.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'QSD + hemorragia → pense fígado',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o filtro: quadrante superior direito + risco de hemorragia.',
        'Eliminar A: baço fica no quadrante superior esquerdo.',
        'Eliminar C: estômago predominante no QSE/epigástrio — não o órgão clássico do QSD.',
        'Eliminar D: intestino delgado não é o marco clássico do QSD nesta lista.',
        'Validar B: fígado.',
        'Em similares: QSE + hemorragia → baço; QSD + hemorragia → fígado.',
      ],
      footer_rule: 'Quadrante decide o órgão antes do “sangra muito”',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'QUADRANTES — ÓRGÃOS-CHAVE',
      rows: [
        { label: 'QSD', value: 'Fígado (maior parte) — risco hemorrágico' },
        { label: 'QSE', value: 'Baço — também hemorrágico, outro lado' },
        { label: 'Trauma', value: 'Localize o quadrante antes de nomear o órgão' },
      ],
      footer_rule: 'QSD = fígado; QSE = baço',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'ÓRGÃOS FORA DO QSD',
      items: [
        {
          label: 'Baço',
          detail: 'Também sangra muito.',
          correct: 'Baço está no QSE — não no superior direito.',
        },
        {
          label: 'Estômago',
          detail: 'Órgão abdominal conhecido.',
          correct: 'Predomina à esquerda/epigástrio — não o clássico do QSD.',
        },
        {
          label: 'Intestino delgado',
          detail: 'Ocupa vários quadrantes.',
          correct: 'Não é o órgão âncora do QSD nesta prova.',
        },
        {
          label: 'Em similares',
          detail: 'Vesícula biliar no QSD.',
          correct: 'Também no QSD, mas a lista e o risco hemorrágico apontam o fígado.',
        },
      ],
      footer_rule: 'Hemorragia + lado errado = resposta errada',
    },
  ];
  save(slug, q);
}

/** Anterior = ventral — reusa âncora FEPESE */
function handcraftAnteriorVentral() {
  const slug = 'fepese-enfermagem-nocoes-de-anatomia-1775447762008-7';
  const anchor = JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'examples/questao-premium-fepese-anatomia-anterior-ventral.json'),
      'utf8',
    ),
  ) as Q;
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_terminologia_planos',
    snapshot: String(
      (anchor.meta as { content_review?: { guideline_snapshot?: string } })?.content_review
        ?.guideline_snapshot ?? 'Anterior = ventral; medial ≠ lateral; proximal ≠ distal',
    ),
    sources: (anchor.meta as { sources?: unknown[] })?.sources,
  });
  q.reverse_study_slides = anchor.reverse_study_slides;
  save(slug, q);
}

/** Coração: direita→pulmões; esquerda→corpo (E) */
function handcraftCirculacaoLados() {
  const slug = 'fepese-enfermagem-nocoes-de-anatomia-1775448491347-7';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_cardiovascular',
    snapshot:
      'Lado direito do coração bombeia sangue venoso aos pulmões; lado esquerdo bombeia sangue arterial ao corpo. Não trocar traqueia↔esôfago nem delgado↔grosso.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Órgãos e lados do coração',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Afirmativas sobre traqueia, esôfago, intestinos e coração — achar a correta.',
          icon: 'Target',
        },
        {
          label: 'Coração — dois lados',
          detail: 'Direita envia sangue venoso aos pulmões; esquerda envia sangue arterial ao corpo.',
          icon: 'Heart',
        },
        {
          label: 'Trocas clássicas',
          detail: 'Traqueia ≠ esôfago; delgado ≠ grosso (funções e divisões invertidas nas pegadinhas).',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Inverter funções de vias aéreas/digestórias ou lados do coração.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Direita = pulmão; esquerda = corpo',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Eliminar A: traqueia conduz ar, não alimento até o estômago (isso é esôfago).',
        'Eliminar B: esôfago não tem anéis cartilaginosos nem conduz ar aos pulmões (isso é traqueia).',
        'Eliminar C: absorção de água/fezes e ceco-cólon-reto descrevem o intestino grosso — não o delgado.',
        'Eliminar D: duodeno-jejuno-íleo e absorção de nutrientes são do intestino delgado — não do grosso.',
        'Validar E: lado direito → pulmões (venoso); lado esquerdo → corpo (arterial).',
        'Em similares: se trocar direita/esquerda no coração, a afirmativa cai.',
      ],
      footer_rule: 'Cheque órgão certo + função certa',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'FIXADORES RÁPIDOS',
      rows: [
        { label: 'Coração direito', value: 'Sangue venoso → pulmões' },
        { label: 'Coração esquerdo', value: 'Sangue arterial → corpo' },
        { label: 'Traqueia', value: 'Ar + anéis cartilaginosos' },
        { label: 'Esôfago', value: 'Alimento → estômago' },
      ],
      footer_rule: 'Não empreste a função do vizinho',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'ÓRGÃOS COM FUNÇÃO EMPRESTADA',
      items: [
        {
          label: 'Traqueia levando alimento',
          detail: 'Função do esôfago.',
          correct: 'Traqueia conduz ar — não alimento.',
        },
        {
          label: 'Esôfago com anéis cartilaginosos',
          detail: 'Função da traqueia.',
          correct: 'Anéis cartilaginosos = traqueia.',
        },
        {
          label: 'Delgado ↔ grosso invertidos',
          detail: 'Partes e funções trocadas.',
          correct: 'Delgado = duodeno/jejuno/íleo; grosso = ceco/cólon/reto.',
        },
        {
          label: 'Em similares',
          detail: 'Inverter lados do coração.',
          correct: 'Direita = pulmão; esquerda = circulação sistêmica.',
        },
      ],
      footer_rule: 'Nome do órgão deve bater com a função',
    },
  ];
  save(slug, q);
}

/** Coração = 4 câmaras (E) */
function handcraftQuatroCamaras() {
  const slug = 'fepese-enfermagem-nocoes-de-anatomia-1775448514037-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_cardiovascular',
    snapshot:
      'Coração = músculo com 4 câmaras (2 átrios + 2 ventrículos). Átrios recebem; ventrículos bombeiam. Sístole = contração; diástole = relaxamento.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Anatomia cardíaca básica',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Aspectos básicos da anatomia cardíaca: câmaras, sístole/diástole e papéis de átrios/ventrículos.',
          icon: 'Target',
        },
        {
          label: 'Quatro câmaras',
          detail: 'O coração é um músculo composto de 4 câmaras: dois átrios e 2 ventrículos.',
          icon: 'Heart',
        },
        {
          label: 'Papéis',
          detail: 'Átrios recebem; ventrículos bombeiam. Sístole = contração; diástole = relaxamento.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Inverter sístole/diástole, papéis átrio/ventrículo ou inventar faixa de frequência cardíaca.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: '4 câmaras + papéis corretos',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Eliminar A: o bombeamento para outros locais é papel principal dos ventrículos — não dos átrios.',
        'Eliminar B: contração = sístole e relaxamento = diástole — o item inverte.',
        'Eliminar C: receber sangue de diversas partes do corpo é papel principal dos átrios — não dos ventrículos.',
        'Eliminar D: a faixa de frequência cardíaca citada (90 a 120) não é o valor esperado clássico de adulto jovem saudável em repouso.',
        'Validar E: o coração é músculo com 4 câmaras — dois átrios e 2 ventrículos.',
        'Em similares: se inverter sístole/diástole, a afirmativa cai na hora.',
      ],
      footer_rule: 'Estrutura 4 câmaras é o ímã certo',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'CORAÇÃO — BÁSICOS',
      rows: [
        { label: 'Câmaras', value: '2 átrios + 2 ventrículos' },
        { label: 'Átrios', value: 'Recebem o sangue' },
        { label: 'Ventrículos', value: 'Bombeiam o sangue' },
        { label: 'Sístole / diástole', value: 'Contração / relaxamento' },
      ],
      footer_rule: 'Não inverta estrutura nem ciclo',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'INVERSÕES CLÁSSICAS',
      items: [
        {
          label: 'Átrios bombeiam para outros locais',
          detail: 'Troca com ventrículos.',
          correct: 'Bombeamento principal = ventrículos.',
        },
        {
          label: 'Sístole = relaxamento',
          detail: 'Inverte o ciclo.',
          correct: 'Sístole = contração; diástole = relaxamento.',
        },
        {
          label: 'Frequência 90 a 120 como “esperada”',
          detail: 'Faixa inventada no distrator.',
          correct: 'Essa faixa não é o valor esperado clássico de adulto jovem saudável em repouso.',
        },
        {
          label: 'Em similares',
          detail: 'Ventrículos só recebem.',
          correct: 'Receber = átrios; ejetar = ventrículos.',
        },
      ],
      footer_rule: 'Inversão de papel = alternativa falsa',
    },
  ];
  save(slug, q);
}

/** Occipital = base posterior do crânio (C) */
function handcraftOccipital() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775447762008-4';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Occipital = osso ímpar posterior que forma a base do crânio; parietal = par lateral/superior; temporal = par lateral; etmoide/esfenoide = base mais anterior/média',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Osso ímpar da base posterior',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Osso ímpar, parte posterior, formando a base do crânio.',
          icon: 'Target',
        },
        {
          label: 'Occipital',
          detail: 'Único (ímpar) na nuca — fecha a base posterior do crânio.',
          icon: 'Bone',
        },
        {
          label: 'Pares vs ímpares',
          detail: 'Parietal e temporal são pares; etmoide/esfenoide são ímpares, mas não “posteriores da base” clássicos desta pista.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar parietal (posterior-superior) ou temporal (lateral) sem filtrar “ímpar + base”.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Ímpar + posterior + base = occipital',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Filtrar: ímpar + posterior + base do crânio.',
        'Eliminar A: parietal é par e forma a calota lateral/superior — não a base posterior clássica.',
        'Eliminar D: temporal é par e lateral.',
        'Eliminar B e E: etmoide e esfenoide são ímpares da base, mas não o marco “parte posterior” desta definição.',
        'Validar C: occipital.',
        'Em similares: se citar forame magno → occipital; se citar asas maiores → esfenoide.',
      ],
      footer_rule: 'Três filtros juntos apontam o occipital',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'OSSOS DO CRÂNIO — PISTAS',
      rows: [
        { label: 'Occipital', value: 'Ímpar — base posterior' },
        { label: 'Parietal', value: 'Par — calota lateral/superior' },
        { label: 'Temporal', value: 'Par — lateral (orelha)' },
        { label: 'Esfenoide / etmoide', value: 'Ímpares da base — território mais médio/anterior' },
      ],
      footer_rule: 'Ímpar posterior = occipital',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'OSSOS QUE NÃO FECHAM A PISTA',
      items: [
        {
          label: 'Parietal',
          detail: 'Parece “atrás”.',
          correct: 'É par e forma a calota — não a base posterior ímpar.',
        },
        {
          label: 'Temporal',
          detail: 'Lateral do crânio.',
          correct: 'É par — fora do filtro ímpar + base posterior.',
        },
        {
          label: 'Etmoide / esfenoide',
          detail: 'Também ímpares da base.',
          correct: 'Não respondem ao “parte posterior” clássico desta prova.',
        },
        {
          label: 'Em similares',
          detail: 'Frontal vs occipital.',
          correct: 'Frontal = anterior; occipital = posterior.',
        },
      ],
      footer_rule: 'Um filtro falhando elimina o osso',
    },
  ];
  save(slug, q);
}

/** Retorno da grande circulação = veias cavas (D) */
function handcraftVeiasCavas() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775448475837-7';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_cardiovascular',
    snapshot:
      'Grande circulação (sistêmica): retorno venoso ao átrio direito pelas veias cava superior e inferior. Veias pulmonares = pequena circulação (sangue arterializado → AE).',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Grande circulação — como o sangue volta?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Na grande circulação, o sangue do corpo retorna ao coração por qual(is) vaso(s)?',
          icon: 'Target',
        },
        {
          label: 'Veias cava superior e inferior',
          detail: 'Drenam o retorno venoso sistêmico para o átrio direito.',
          icon: 'GitBranch',
        },
        {
          label: 'Não são artérias nem pulmonares',
          detail: 'Carótidas saem; pulmonares e veias pulmonares pertencem a outro circuito.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar veia pulmonar (volta dos pulmões) como se fosse retorno do corpo.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Corpo → cavas → átrio direito',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar: grande circulação = retorno do corpo ao coração.',
        'Eliminar A: artérias carótidas levam sangue ao encéfalo — não retornam do corpo.',
        'Eliminar B: artérias pulmonares vão do VD aos pulmões (pequena circulação).',
        'Eliminar C e E: veias pulmonares trazem sangue dos pulmões ao átrio esquerdo — não o retorno sistêmico.',
        'Validar D: veia cava superior e inferior.',
        'Em similares: pequena circulação de volta → veias pulmonares; grande circulação de volta → cavas.',
      ],
      footer_rule: 'Grande = cavas; pequena (retorno) = pulmonares',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'RETORNOS VENOSOS',
      rows: [
        { label: 'Grande circulação', value: 'Veias cava superior + inferior → AD' },
        { label: 'Pequena circulação', value: 'Veias pulmonares → AE' },
        { label: 'Artérias', value: 'Saem do coração — não são retorno' },
      ],
      footer_rule: 'Retorno sistêmico = cavas',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'VASOS QUE NÃO SÃO O RETORNO SISTÊMICO',
      items: [
        {
          label: 'Artérias carótidas',
          detail: 'Fluxo de ida ao cérebro.',
          correct: 'Artéria = saída; não retorna o sangue do corpo.',
        },
        {
          label: 'Artérias pulmonares',
          detail: 'Ida aos pulmões.',
          correct: 'Pequena circulação de ida — não retorno do corpo.',
        },
        {
          label: 'Veias pulmonares',
          detail: 'Volta dos pulmões.',
          correct: 'Retorno pulmonar ao AE — não grande circulação.',
        },
        {
          label: 'Em similares',
          detail: 'Só cava superior.',
          correct: 'O retorno do corpo usa superior e inferior.',
        },
      ],
      footer_rule: 'Pergunte: vem do corpo ou dos pulmões?',
    },
  ];
  save(slug, q);
}

/** Veia porta (A) */
function handcraftVeiaPorta() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775448491347-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_cardiovascular',
    snapshot:
      'Veia porta: leva sangue venoso do trato digestório (estômago, intestino), baço e esôfago (tributárias) ao fígado. Esplênica/mesentérica/gástrica são tributárias; cava inferior = retorno sistêmico.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Sangue digestório → fígado',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Qual veia traz sangue venoso do estômago, esôfago, baço e intestino para o fígado?',
          icon: 'Target',
        },
        {
          label: 'Veia porta',
          detail: 'Coleta o território esplâncnico e leva ao fígado (sistema porta).',
          icon: 'GitBranch',
        },
        {
          label: 'Tributárias × tronco',
          detail: 'Esplênica, mesentérica e gástrica alimentam o sistema — a porta é o tronco que chega ao fígado.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar esplênica ou mesentérica (partes) no lugar da porta (tronco).',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Para o fígado, no sistema porta = veia porta',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o destino: fígado, a partir de estômago/esôfago/baço/intestino.',
        'Eliminar C: cava inferior leva retorno sistêmico ao coração — não ao fígado nesse papel.',
        'Eliminar B, D e E: esplênica, gástrica e mesentérica são tributárias — não o tronco final nomeado na prova.',
        'Validar A: porta.',
        'Em similares: se pedir drenagem só do baço → esplênica; se pedir tronco para o fígado → porta.',
      ],
      footer_rule: 'Destino fígado + território digestório = porta',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'SISTEMA PORTA',
      rows: [
        { label: 'Veia porta', value: 'Tronco → fígado (estômago, intestino, baço…)' },
        { label: 'Esplênica / mesentérica / gástrica', value: 'Tributárias do sistema porta' },
        { label: 'Cava inferior', value: 'Retorno sistêmico ao coração — outro caminho' },
      ],
      footer_rule: 'Tributária ≠ tronco porta',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'VASOS QUE NÃO SÃO O TRONCO',
      items: [
        {
          label: 'Esplênica',
          detail: 'Drena o baço.',
          correct: 'É tributária — o tronco que chega ao fígado é a porta.',
        },
        {
          label: 'Mesentérica / gástrica',
          detail: 'Territórios parciais.',
          correct: 'Alimentam o sistema; a resposta do tronco é a porta.',
        },
        {
          label: 'Cava inferior',
          detail: 'Grande veia do corpo.',
          correct: 'Não é a veia do sistema porta para o fígado.',
        },
        {
          label: 'Em similares',
          detail: 'Veias hepáticas.',
          correct: 'Hepáticas saem do fígado para a cava — sentido oposto à porta.',
        },
      ],
      footer_rule: 'Para o fígado = porta; do fígado = hepáticas',
    },
  ];
  save(slug, q);
}

function main() {
  handcraftMitral();
  handcraftFigadoQsd();
  handcraftAnteriorVentral();
  handcraftCirculacaoLados();
  handcraftQuatroCamaras();
  handcraftOccipital();
  handcraftVeiasCavas();
  handcraftVeiaPorta();
  console.log('[handcraft:anat-g04] done 8/8');
}

main();
