/**
 * Handcraft golden-v1 — nocoes-de-anatomia-g05 (8 slugs).
 * Uso: npx tsx scripts/handcraft-nocoes-de-anatomia-g05.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LOTE = 'nocoes-de-anatomia-g05';
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
  console.log(`[handcraft:anat-g05] wrote ${slug}`);
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

/** 2ª porção do delgado = jejuno (C) */
function handcraftJejuno() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775448491347-2';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_generico',
    snapshot:
      'Intestino delgado: duodeno (1ª) → jejuno (2ª) → íleo (3ª). Cólon = intestino grosso.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Intestino delgado — segunda porção',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'O intestino delgado absorve alimentos — a banca pede a segunda porção desse tubo.',
          icon: 'Target',
        },
        {
          label: 'Ordem clássica',
          detail: 'Duodeno → jejuno → íleo (nessa sequência proximal→distal).',
          icon: 'List',
        },
        {
          label: 'Cólon não entra',
          detail: 'Cólon ascendente e transverso pertencem ao intestino grosso.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar duodeno (1ª) ou íleo (3ª) no lugar da segunda.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: '1ª duodeno · 2ª jejuno · 3ª íleo',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar: segunda porção do intestino delgado.',
        'Eliminar B: duodeno é a primeira porção.',
        'Eliminar A: íleo é a terceira porção.',
        'Eliminar D e E: cólon ascendente e transverso são do intestino grosso.',
        'Validar C: jejuno.',
        'Em similares: se pedir a primeira → duodeno; a última do delgado → íleo.',
      ],
      footer_rule: 'Conte a ordem — não chute pelo nome mais famoso',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'DELGADO — TRÊS PORÇÕES',
      rows: [
        { label: '1ª', value: 'Duodeno' },
        { label: '2ª', value: 'Jejuno' },
        { label: '3ª', value: 'Íleo' },
        { label: 'Cólon', value: 'Intestino grosso — fora desta sequência' },
      ],
      footer_rule: 'Segunda = jejuno',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'PORÇÕES ERRADAS',
      items: [
        {
          label: 'Duodeno',
          detail: 'Primeira porção.',
          correct: 'Duodeno é a 1ª — não a segunda.',
        },
        {
          label: 'Íleo',
          detail: 'Última do delgado.',
          correct: 'Íleo é a 3ª porção.',
        },
        {
          label: 'Cólon ascendente / transverso',
          detail: 'Nomes do grosso.',
          correct: 'Cólon não é porção do intestino delgado.',
        },
        {
          label: 'Em similares',
          detail: 'Trocar jejuno por íleo.',
          correct: 'Jejuno vem antes do íleo na sequência.',
        },
      ],
      footer_rule: 'Delgado ≠ cólon; ordem fixa',
    },
  ];
  save(slug, q);
}

/** Antibráquio-manual = antebraço + punho + mão (C) */
function handcraftAntibracquio() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775448514037-5';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Gesso antibráquio-manual: antebraço + punho + mão (sem cotovelo/ombro). Nome = anti(braço)/brachio + manual.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Gesso antibráquio-manual',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca pergunta o que o gesso antibráquio-manual inclui.',
          icon: 'Target',
        },
        {
          label: 'Decodificar o nome',
          detail: 'Anti/braquio = antebraço; manual = mão — o punho fica no meio do território.',
          icon: 'Search',
        },
        {
          label: 'O que fica de fora',
          detail: 'Cotovelo, braço e ombro não entram nesse molde.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Incluir cotovelo ou ombro, ou reduzir só a punho/mão/dedos.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Antebraço + punho + mão',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler a nomenclatura: antibráquio-manual.',
        'Eliminar A: inclui cotovelo — acima do território do antebraço puro.',
        'Eliminar B: braço + cotovelo — proximal demais.',
        'Eliminar E: ombro + braço + cotovelo — outro molde.',
        'Eliminar D: só punho, mão e dedos — falta o antebraço do nome.',
        'Validar C: antebraço, punho e mão.',
        'Em similares: se o nome citar “axilar” ou “braquial”, o território sobe no membro.',
      ],
      footer_rule: 'O nome do gesso lista o território',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ANTIBRÁQUIO-MANUAL',
      rows: [
        { label: 'Inclui', value: 'Antebraço + punho + mão' },
        { label: 'Não inclui', value: 'Cotovelo, braço, ombro' },
        { label: 'Leitura do nome', value: 'Braquio → antebraço; manual → mão' },
      ],
      footer_rule: 'Nome = mapa do gesso',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TERRITÓRIOS ERRADOS',
      items: [
        {
          label: 'Incluir cotovelo',
          detail: 'Sobe demais no membro.',
          correct: 'Antibráquio-manual não inclui o cotovelo.',
        },
        {
          label: 'Incluir braço / ombro',
          detail: 'Molde proximal.',
          correct: 'Fora do nome antibráquio-manual.',
        },
        {
          label: 'Só punho e mão',
          detail: 'Falta o antebraço.',
          correct: 'O “braquio” do nome exige o antebraço.',
        },
        {
          label: 'Em similares',
          detail: 'Braquiopalmar vs antibráquio-manual.',
          correct: 'Leia cada radical: braço × antebraço × mão.',
        },
      ],
      footer_rule: 'Não acrescente articulação proximal',
    },
  ];
  save(slug, q);
}

/** Inguinopodálico ≠ pélvico-podálico: não inclui coxa contralateral (E) */
function handcraftInguinopodálico() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775448514037-6';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Pélvico-podálico cobre pélvis e desce até o pé (pode incluir coxa contralateral). Inguinopodálico parte da virilha/inguinal do lado acometido e não inclui a coxa contralateral.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Pélvico-podálico × inguinopodálico',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Diferença entre gesso pélvico-podálico e inguinopodálico — o que o segundo faz.',
          icon: 'Target',
        },
        {
          label: 'Inguinal',
          detail: 'Parte da região da virilha do lado acometido — território mais restrito que o pélvico.',
          icon: 'MapPin',
        },
        {
          label: 'Coxa contralateral',
          detail: 'O pélvico-podálico pode envolver a outra coxa; o inguinopodálico não inclui a coxa contralateral.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Achar que o inguinal “corta” o pé ou “acrescenta” pélvis/abdômen.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Inguinopodálico: sem coxa contralateral',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Comparar os nomes: pélvico-podálico vs inguinopodálico.',
        'Eliminar A e B: incluir coxa/perna contralateral é o oposto da diferença pedida.',
        'Eliminar C: o inguinopodálico ainda inclui o pé homolateral (podálico).',
        'Eliminar D: incluir pélvis e abdômen descreve mais o pélvico — não a diferença do inguinal.',
        'Validar E: não inclui a coxa contralateral.',
        'Em similares: “inguinal” restringe o início do molde; “pélvico” amplia a cintura.',
      ],
      footer_rule: 'A diferença-chave = coxa contralateral',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'DOIS GESSOS DE MI',
      rows: [
        { label: 'Pélvico-podálico', value: 'Pélvis → pé (pode incluir lado contralateral)' },
        { label: 'Inguinopodálico', value: 'Inguinal → pé; sem coxa contralateral' },
        { label: 'Podálico', value: 'Em ambos, o pé entra no nome' },
      ],
      footer_rule: 'Inguinal = mais seletivo que pélvico',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'DIFERENÇAS INVENTADAS',
      items: [
        {
          label: 'Inclui coxa contralateral',
          detail: 'Inverte a lógica.',
          correct: 'O inguinopodálico justamente não inclui a coxa contralateral.',
        },
        {
          label: 'Não inclui o pé',
          detail: 'Ignora o “podálico”.',
          correct: 'O pé homolateral permanece no molde.',
        },
        {
          label: 'Inclui pélvis e abdômen',
          detail: 'Confunde com o pélvico.',
          correct: 'Essa ampliação é do pélvico-podálico — não a diferença do inguinal.',
        },
        {
          label: 'Em similares',
          detail: 'Homolateral vs contralateral.',
          correct: 'Homolateral = mesmo lado; contralateral = lado oposto.',
        },
      ],
      footer_rule: 'Leia inguinal × pélvico antes de marcar',
    },
  ];
  save(slug, q);
}

/** Coxa = só fêmur (II) → B */
function handcraftCoxaFemur() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775448514037-7';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot: 'Segmento da coxa = fêmur. Tíbia e fíbula = perna (abaixo do joelho).',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Ossos da coxa',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Itens I–III: fíbula, fêmur e tíbia — quais pertencem ao segmento da coxa?',
          icon: 'Target',
        },
        {
          label: 'Coxa',
          detail: 'Do quadril ao joelho — osso único: fêmur.',
          icon: 'Bone',
        },
        {
          label: 'Perna',
          detail: 'Abaixo do joelho: tíbia e fíbula.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Levar tíbia/fíbula para a coxa porque também são ossos longos do MI.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Coxa = fêmur; perna = tíbia + fíbula',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'I: fíbula — osso da perna → falso para coxa.',
        'II: fêmur — osso da coxa → verdadeiro.',
        'III: tíbia — osso da perna → falso para coxa.',
        'Montar: apenas II → alternativa B.',
        'Em similares: se a banca pedir ossos da perna → tíbia e fíbula.',
      ],
      footer_rule: 'Só o fêmur passa no filtro “coxa”',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'MI — SEGMENTOS ÓSSEOS',
      rows: [
        { label: 'Coxa', value: 'Fêmur' },
        { label: 'Perna', value: 'Tíbia + fíbula' },
        { label: 'Joelho', value: 'Limite: separa coxa de perna' },
      ],
      footer_rule: 'Não misture coxa com perna',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'OSSOS FORA DA COXA',
      items: [
        {
          label: 'Fíbula na coxa',
          detail: 'Item I.',
          correct: 'Fíbula é da perna — abaixo do joelho.',
        },
        {
          label: 'Tíbia na coxa',
          detail: 'Item III.',
          correct: 'Tíbia também é da perna.',
        },
        {
          label: 'Fêmur + tíbia juntos',
          detail: 'Mistura segmentos.',
          correct: 'Só o fêmur pertence à coxa.',
        },
        {
          label: 'Em similares',
          detail: 'Braço vs antebraço.',
          correct: 'Braço = úmero; antebraço = rádio + ulna — mesma lógica de segmento.',
        },
      ],
      footer_rule: 'Joelho é a fronteira',
    },
  ];
  save(slug, q);
}

/** Fratura = perda de continuidade do osso (E) */
function handcraftFratura() {
  const slug = 'fgv-enfermagem-nocoes-de-anatomia-1775448529213-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Fratura = perda da continuidade óssea. Articulação/músculo/tendão/fáscia = outras lesões (luxação, distensão, etc.).',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Fratura — continuidade de quê?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Por definição, fratura = perda da continuidade de qual estrutura?',
          icon: 'Target',
        },
        {
          label: 'Osso',
          detail: 'Fratura é a interrupção da continuidade óssea.',
          icon: 'Bone',
        },
        {
          label: 'Outras estruturas',
          detail: 'Articulação, músculo, tendão e fáscia têm nomes próprios de lesão.',
          icon: 'List',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Chamar de fratura a lesão de articulação (luxação) ou de partes moles.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Fratura = osso',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar a definição: perda da continuidade.',
        'Eliminar A: articulação → território de luxação/entorse, não fratura.',
        'Eliminar B, C e D: músculo, tendão e fáscia são partes moles.',
        'Validar E: um osso.',
        'Em similares: perda de congruência articular → luxação; ruptura óssea → fratura.',
      ],
      footer_rule: 'Estrutura óssea decide o nome',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'NOMES POR ESTRUTURA',
      rows: [
        { label: 'Fratura', value: 'Osso — perda de continuidade' },
        { label: 'Luxação', value: 'Articulação — perda de posição' },
        { label: 'Partes moles', value: 'Músculo/tendão/fáscia — outros termos' },
      ],
      footer_rule: 'Definição curta: fratura = osso',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'ESTRUTURAS QUE NÃO DEFINEM FRATURA',
      items: [
        {
          label: 'Articulação',
          detail: 'Congruência articular.',
          correct: 'Lesão articular clássica = luxação/entorse — não fratura.',
        },
        {
          label: 'Músculo / tendão',
          detail: 'Partes moles.',
          correct: 'Não definem fratura.',
        },
        {
          label: 'Fáscia',
          detail: 'Tecido de envolvimento.',
          correct: 'Fora da definição de fratura.',
        },
        {
          label: 'Em similares',
          detail: 'Fratura vs fissura.',
          correct: 'Ambas no osso; fissura é forma incompleta — ainda é território ósseo.',
        },
      ],
      footer_rule: 'Se não for osso, não é fratura',
    },
  ];
  save(slug, q);
}

/** Escafoide — FOOSH (A) */
function handcraftEscafoideTrauma() {
  const slug = 'fundatec-enfermagem-nocoes-de-anatomia-1775331667969-7';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Queda com mão estendida (FOOSH): o escafoide é o osso do carpo mais frequentemente fraturado.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Queda com mão estendida — qual carpal?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Trauma em extensão com apoio da mão — força pelo punho; osso mais fraturado.',
          icon: 'Target',
        },
        {
          label: 'Escafoide',
          detail: 'Carpal proximal radial — o mais fraturado nesse mecanismo.',
          icon: 'Bone',
        },
        {
          label: 'Outros carpais',
          detail: 'Trapézio, capitato e pisiforme fraturam menos nesse padrão clássico.',
          icon: 'List',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar trapézio só porque também é radial.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Mão estendida + punho → escafoide',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o mecanismo: queda com apoio da mão estendida — força pelo punho.',
        'Eliminar B: trapézio é distal e menos típico nesse FOOSH clássico.',
        'Eliminar C: capitato — central, não o mais frequente nesse trauma.',
        'Eliminar D: pisiforme — medial/proximal acessório, não o clássico.',
        'Validar A: escafoide.',
        'Em similares: dor na tabaqueira após queda na mão → pense escafoide.',
      ],
      footer_rule: 'Mecanismo clássico aponta o escafoide',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ESCAFOIDE NO TRAUMA',
      rows: [
        { label: 'Mecanismo', value: 'Queda com mão estendida (extensão)' },
        { label: 'Osso', value: 'Escafoide — fratura carpal mais frequente' },
        { label: 'Marco clínico', value: 'Tabaqueira anatômica sensível' },
      ],
      footer_rule: 'FOOSH no punho → escafoide',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'OUTROS CARPAIS',
      items: [
        {
          label: 'Trapézio',
          detail: 'Também radial.',
          correct: 'Não é o mais fraturado nesse mecanismo clássico.',
        },
        {
          label: 'Capitato',
          detail: 'Osso central do carpo.',
          correct: 'Fora do padrão mais frequente da prova.',
        },
        {
          label: 'Pisiforme',
          detail: 'Pequeno medial.',
          correct: 'Não responde ao FOOSH clássico do escafoide.',
        },
        {
          label: 'Em similares',
          detail: 'Rádio distal vs escafoide.',
          correct: 'Ambos podem fraturar no FOOSH — esta lista pede o osso do punho/carpo.',
        },
      ],
      footer_rule: 'Carpo mais fraturado = escafoide',
    },
  ];
  save(slug, q);
}

/** Periósteo (D) */
function handcraftPeriosteo() {
  const slug = 'fundatec-enfermagem-nocoes-de-anatomia-1775331667969-8';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Periósteo = membrana que reveste a face externa do osso; crucial na regeneração/cicatrização de fraturas. Endósteo = face interna; epífise = extremidade; peritônio = abdome.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Membrana externa do osso',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Cicatrização de fraturas: qual membrana reveste a parte externa dos ossos?',
          icon: 'Target',
        },
        {
          label: 'Periósteo',
          detail: 'Envelope externo do osso — papel-chave na regeneração óssea.',
          icon: 'Layers',
        },
        {
          label: 'Não confundir',
          detail: 'Endósteo = interno; epífise = extremidade óssea; peritônio = cavidade abdominal.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Trocar peri- (fora) por endo- (dentro) ou cair no peritônio pelo som.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Externa do osso = periósteo',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar: membrana da parte externa dos ossos + regeneração em fratura.',
        'Eliminar A: peritônio reveste cavidade abdominal — não o osso.',
        'Eliminar B: endósteo reveste a face interna (cavidade medular).',
        'Eliminar C: epífise é extremidade do osso longo — não uma membrana de revestimento.',
        'Validar D: periósteo.',
        'Em similares: peri- = ao redor/fora; endo- = dentro.',
      ],
      footer_rule: 'Prefixo peri- + osso = periósteo',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'MEMBRANAS ÓSSEAS',
      rows: [
        { label: 'Periósteo', value: 'Face externa — regeneração em fratura' },
        { label: 'Endósteo', value: 'Face interna / medular' },
        { label: 'Epífise', value: 'Extremidade do osso longo (não é membrana)' },
      ],
      footer_rule: 'Externa = peri; interna = endo',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TERMOS QUE SÓ PARECEM',
      items: [
        {
          label: 'Peritônio',
          detail: 'Som parecido.',
          correct: 'Peritônio é abdominal — não reveste o osso.',
        },
        {
          label: 'Endósteo',
          detail: 'Também é membrana óssea.',
          correct: 'Endósteo é interno — a prova pediu a externa.',
        },
        {
          label: 'Epífise',
          detail: 'Parte do osso longo.',
          correct: 'É região óssea, não a membrana externa.',
        },
        {
          label: 'Em similares',
          detail: 'Pericôndrio.',
          correct: 'Pericôndrio envolve cartilagem; periósteo envolve osso.',
        },
      ],
      footer_rule: 'Externa do osso = periósteo',
    },
  ];
  save(slug, q);
}

/** Só ossos longos: fêmur, tíbia, fíbula (A) */
function handcraftOssosLongos() {
  const slug = 'ibade-enfermagem-nocoes-de-anatomia-1775447762008-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Ossos longos do MI: fêmur, tíbia, fíbula (e rádio/ulna no MS). Escafoide, trapézio, navicular = curtos do carpo/tarso.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Apenas ossos longos',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Assinale a alternativa que apresenta apenas ossos longos.',
          icon: 'Target',
        },
        {
          label: 'Longos do MI',
          detail: 'Fêmur, tíbia e fíbula — diáfise + epífises.',
          icon: 'Bone',
        },
        {
          label: 'Curtos no meio',
          detail: 'Escafoide, trapézio e navicular são carpais/tarsais curtos.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Misturar um longo (rádio/fêmur) com um curto (escafoide/trapézio/navicular).',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'A lista só passa se todos forem longos',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Critério: apenas ossos longos.',
        'Eliminar B: escafoide é curto (carpo).',
        'Eliminar C: trapézio é curto (carpo).',
        'Eliminar D: navicular é curto (tarso).',
        'Eliminar E: escafoide é curto.',
        'Validar A: fêmur, tíbia e fíbula — todos longos.',
        'Em similares: se aparecer carpo/tarso na lista, a alternativa cai.',
      ],
      footer_rule: 'Um curto na lista invalida a opção',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'LONGOS × CURTOS',
      rows: [
        { label: 'Longos (MI)', value: 'Fêmur, tíbia, fíbula' },
        { label: 'Longos (MS)', value: 'Úmero, rádio, ulna' },
        { label: 'Curtos', value: 'Carpo/tarso — escafoide, trapézio, navicular…' },
      ],
      footer_rule: 'Carpal/tarsal = curto',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'LISTAS CONTAMINADAS',
      items: [
        {
          label: 'Escafoide na lista',
          detail: 'Curto do carpo.',
          correct: 'Escafoide não é osso longo.',
        },
        {
          label: 'Trapézio / navicular',
          detail: 'Curtos do punho/pé.',
          correct: 'Qualquer curto invalida “apenas longos”.',
        },
        {
          label: 'Rádio + escafoide',
          detail: 'Mistura longo com curto.',
          correct: 'A prova exige lista limpa — só longos.',
        },
        {
          label: 'Em similares',
          detail: 'Patela.',
          correct: 'Patela é sesamoide — não entre na lista de longos clássicos.',
        },
      ],
      footer_rule: 'Varra a lista: zero ossos curtos',
    },
  ];
  save(slug, q);
}

function main() {
  handcraftJejuno();
  handcraftAntibracquio();
  handcraftInguinopodálico();
  handcraftCoxaFemur();
  handcraftFratura();
  handcraftEscafoideTrauma();
  handcraftPeriosteo();
  handcraftOssosLongos();
  console.log('[handcraft:anat-g05] done 8/8');
}

main();
