/**
 * Handcraft golden-v1 — nocoes-de-anatomia-g02 (8 slugs).
 * Uso: npx tsx scripts/handcraft-nocoes-de-anatomia-g02.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LOTE = 'nocoes-de-anatomia-g02';
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
  console.log(`[handcraft:anat-g02] wrote ${slug}`);
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

/** Escafoide → ossos do carpo (E) */
function handcraftEscafoide() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775448458316-3';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot: 'Escafoide = osso do carpo (fileira proximal do punho); ≠ metatarso/rádio/ulna/fêmur',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Escafoide — em qual região?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Tala gessada para fratura de escafoide — a banca pede a localização óssea.',
          icon: 'Target',
        },
        {
          label: 'Escafoide',
          detail: 'Osso curto da fileira proximal do carpo (punho).',
          icon: 'Bone',
        },
        {
          label: 'Carpo × outros',
          detail: 'Carpo = punho; metatarso = pé; rádio/ulna = antebraço; fêmur = coxa.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Levar o escafoide para o pé (metatarso) ou para o antebraço (rádio/ulna).',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Escafoide = território do carpo (punho)',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o osso citado: escafoide.',
        'Eliminar A: metatarso é do pé, não do punho.',
        'Eliminar B e C: ulna e rádio são do antebraço — articulam com o carpo, mas não são o escafoide.',
        'Eliminar D: fêmur é da coxa.',
        'Validar E: ossos do carpo.',
        'Em similares: se citar semilunar/piramidal/pisiforme → também carpo; se citar cuboide/cuneiforme → pé.',
      ],
      footer_rule: 'Nome do osso → território (carpo × pé × antebraço)',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ESCAFOIDE NO MAPA',
      rows: [
        { label: 'Escafoide', value: 'Carpo (fileira proximal do punho)' },
        { label: 'Metatarso', value: 'Pé — não confunda com carpo' },
        { label: 'Rádio / ulna', value: 'Antebraço — vizinhos, não o escafoide' },
      ],
      footer_rule: 'Fratura de escafoide = imobilizar território do carpo',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TERRITÓRIOS ERRADOS DO ESCAFOIDE',
      items: [
        {
          label: 'Metatarso',
          detail: 'Pé, não punho.',
          correct: 'Metatarso é do pé — o escafoide é do carpo.',
        },
        {
          label: 'Rádio ou ulna',
          detail: 'Antebraço vizinho.',
          correct: 'Articulam com o carpo, mas o escafoide é osso do carpo.',
        },
        {
          label: 'Fêmur',
          detail: 'Coxa — outro segmento.',
          correct: 'Fora completamente do território do punho.',
        },
        {
          label: 'Em similares',
          detail: 'Escafoide do pé (navicular) vs escafoide do carpo.',
          correct: 'Em imobilização de punho/TE, escafoide = carpo.',
        },
      ],
      footer_rule: 'Carpo = punho; metatarso = pé',
    },
  ];
  save(slug, q);
}

/** Ligamento colateral lateral → joelho (A) */
function handcraftColateralLateral() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775448458316-4';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Em prova TE, “ligamento colateral lateral” clássico = joelho (LCL); tornozelo também tem complexo lateral, mas o gabarito desta banca é joelho',
    examVsCurrent:
      'Tornozelo também possui ligamentos laterais; a prova consagrou o grupo do joelho como resposta.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Colateral lateral — qual articulação?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca associa o ligamento colateral lateral a um grupo articular.',
          icon: 'Target',
        },
        {
          label: 'Joelho — LCL',
          detail: 'No joelho, o colateral lateral estabiliza o lado externo (fibular).',
          icon: 'Bone',
        },
        {
          label: 'Outras articulações',
          detail: 'Quadril, cotovelo, ombro e tornozelo têm ligamentos próprios — nomes e papéis diferentes.',
          icon: 'List',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Levar automaticamente para o tornozelo só porque “lateral” lembra entorse.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Nesta prova, colateral lateral = joelho',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o pedido: grupo de ligamentos do colateral lateral.',
        'Eliminar B: quadril — articulação estável por cápsula/ligamentos próprios, não o LCL clássico de prova.',
        'Eliminar C e D: cotovelo e ombro não são o território clássico do “colateral lateral” nesta lista.',
        'Eliminar E: tornozelo tem complexo lateral, mas não é o gabarito deste item.',
        'Validar A: joelho.',
        'Em similares: se a banca citar “ligamento colateral medial/tibial” → também joelho; se citar “talofibular” → tornozelo.',
      ],
      footer_rule: 'Colateral lateral clássico de TE = joelho',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'LIGAMENTOS COLATERAIS DO JOELHO',
      rows: [
        { label: 'Colateral lateral (LCL)', value: 'Lado externo do joelho (fibular)' },
        { label: 'Colateral medial (MCL)', value: 'Lado interno do joelho (tibial)' },
        { label: 'Tornozelo (armadilha)', value: 'Tem ligamentos laterais — outro nome/complexo' },
      ],
      footer_rule: 'Joelho: LCL × MCL — decore o par',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'ARTICULAÇÕES QUE NÃO SÃO O GABARITO',
      items: [
        {
          label: 'Tornozelo',
          detail: 'Entorse lateral é comum na clínica.',
          correct: 'Há ligamentos laterais no tornozelo, mas neste item a banca aponta o joelho.',
        },
        {
          label: 'Cotovelo / ombro',
          detail: 'Articulações do membro superior.',
          correct: 'Não são o território clássico do “colateral lateral” nesta prova.',
        },
        {
          label: 'Quadril',
          detail: 'Estabilidade por cápsula e ligamentos próprios.',
          correct: 'Não responde ao LCL clássico de joelho.',
        },
        {
          label: 'Em similares',
          detail: 'Trocar lateral por medial.',
          correct: 'Medial = lado tibial do joelho; lateral = lado fibular.',
        },
      ],
      footer_rule: 'Clínica do tornozelo ≠ gabarito deste enunciado',
    },
  ];
  save(slug, q);
}

/** Hutchinson → estiloide do rádio (D) */
function handcraftHutchinson() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775448458316-5';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot: 'Fratura de Hutchinson (Chauffeur) = processo estiloide do rádio distal',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Hutchinson — qual marco ósseo?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Nome próprio de fratura (Hutchinson) ligado a um ponto ósseo.',
          icon: 'Target',
        },
        {
          label: 'Hutchinson / Chauffeur',
          detail: 'Fratura do processo estiloide do rádio (punho distal).',
          icon: 'Bone',
        },
        {
          label: 'Não é do pé nem do cotovelo',
          detail: 'Patela, cuboide, cuneiforme e epicôndilo umeral são outros territórios.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Associar “estiloide” ao úmero (epicôndilo) ou a ossos do pé.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Hutchinson = estiloide do rádio',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Reconhecer o epônimo: fratura de Hutchinson.',
        'Eliminar A: patela é joelho.',
        'Eliminar B e C: cuboide e cuneiforme são do pé (tarso).',
        'Eliminar E: epicôndilo lateral do úmero é cotovelo — outro estiloide/saliência.',
        'Validar D: estiloide do rádio.',
        'Em similares: Colles/Smith = rádio distal (metáfise); Hutchinson = estiloide radial.',
      ],
      footer_rule: 'Epônimo → marco ósseo do punho distal',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'EPÔNIMOS DO RÁDIO DISTAL',
      rows: [
        { label: 'Hutchinson (Chauffeur)', value: 'Processo estiloide do rádio' },
        { label: 'Colles / Smith', value: 'Metáfise do rádio distal (outros padrões)' },
        { label: 'Não confundir', value: 'Epicôndilo umeral = cotovelo' },
      ],
      footer_rule: 'Estiloide radial ≠ epicôndilo umeral',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'MARCOS QUE NÃO SÃO HUTCHINSON',
      items: [
        {
          label: 'Patela',
          detail: 'Joelho.',
          correct: 'Fora do punho — Hutchinson é estiloide radial.',
        },
        {
          label: 'Cuboide / cuneiforme',
          detail: 'Ossos do tarso (pé).',
          correct: 'Pé ≠ estiloide do rádio.',
        },
        {
          label: 'Epicôndilo lateral do úmero',
          detail: 'Saliência do cotovelo.',
          correct: 'Nome parecido de “saliência”, território errado.',
        },
        {
          label: 'Em similares',
          detail: 'Estiloide da ulna vs rádio.',
          correct: 'Hutchinson clássico = estiloide do rádio.',
        },
      ],
      footer_rule: 'Punho distal radial — não pé, não cotovelo',
    },
  ];
  save(slug, q);
}

/** Sartório = músculo mais longo (E) */
function handcraftSartorio() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775448475837-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_muscular',
    snapshot: 'Sartório (costureiro) = músculo mais longo do corpo; cruza coxa em diagonal',
    examVsCurrent:
      'O enunciado cita “≈112 músculos” — número não é o foco; o gabarito cobra o sartório como o mais longo.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Músculo mais longo',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca pede o músculo mais longo — não o mais forte nem o mais largo.',
          icon: 'Target',
        },
        {
          label: 'Sartório',
          detail: 'Trajeto longo e diagonal na coxa (da espinha ilíaca à tíbia).',
          icon: 'Move',
        },
        {
          label: 'Vizinhos famosos',
          detail: 'Deltoide, peitoral, latíssimo e reto abdominal são potentes/largos — não os mais longos.',
          icon: 'List',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar latíssimo do dorso por ser “grande” ou peitoral por ser conhecido.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Mais longo ≠ mais largo / mais forte',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o critério: músculo mais longo.',
        'Eliminar A e B: deltoide e peitoral maior — formato largo, não o mais longo.',
        'Eliminar C: latíssimo do dorso — amplo, mas não o mais longo.',
        'Eliminar D: reto abdominal — parede anterior, não o mais longo.',
        'Validar E: sartório.',
        'Em similares: se pedir o mais largo do dorso → latíssimo; se pedir o mais longo → sartório.',
      ],
      footer_rule: 'Critério “comprimento” aponta para o sartório',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'SARTÓRIO — FIXADOR',
      rows: [
        { label: 'Sartório', value: 'Músculo mais longo (coxa em diagonal)' },
        { label: 'Latíssimo do dorso', value: 'Amplo do dorso — não o mais longo' },
        { label: 'Deltoide / peitoral', value: 'Potência e forma — outro critério' },
      ],
      footer_rule: 'Longo = sartório; largo do dorso = latíssimo',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TROCAR CRITÉRIO DE TAMANHO',
      items: [
        {
          label: 'Latíssimo do dorso',
          detail: 'Parece “o maior”.',
          correct: 'É amplo, não o mais longo — o critério da prova é comprimento.',
        },
        {
          label: 'Deltoide / peitoral',
          detail: 'Músculos famosos do tronco/ombro.',
          correct: 'Não vencem em comprimento o sartório.',
        },
        {
          label: 'Reto abdominal',
          detail: 'Parede anterior conhecida.',
          correct: 'Não é o músculo mais longo do corpo.',
        },
        {
          label: 'Em similares',
          detail: 'Confundir sartório com reto femoral.',
          correct: 'Reto femoral é do quadríceps; sartório é o “costureiro” longo.',
        },
      ],
      footer_rule: 'Leia o adjetivo: longo × largo × forte',
    },
  ];
  save(slug, q);
}

/** PTB → planalto tibial (C) — gabarito da banca */
function handcraftPtb() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775448475837-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'PTB (Patellar Tendon Bearing) = gesso com carga no tendão patelar; nesta banca o gabarito associa a fraturas de planalto tibial',
    examVsCurrent:
      '“Platô tibial” e “planalto tibial” são sinônimos clínicos; a prova marcou apenas “planalto tibial”. Ensinar o gabarito literal.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'PTB — o que a sigla amarra',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Gesso PTB (Patellar Tendon Bearing) — a banca liga a sigla a um tipo de fratura.',
          icon: 'Target',
        },
        {
          label: 'Patellar Tendon Bearing',
          detail: 'Carga de apoio passa pelo tendão patelar — território da tíbia proximal/planalto.',
          icon: 'Footprints',
        },
        {
          label: 'Fora do PTB clássico desta lista',
          detail: 'Tíbia distal e maléolo pedem outros moldes de imobilização.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar maléolo/tíbia distal ou a redação sinônima que a banca não consagrou.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'PTB = apoio no tendão patelar → planalto tibial (gabarito)',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Decodificar PTB: Patellar Tendon Bearing = carga no tendão patelar.',
        'Eliminar B: tíbia distal — longe do tendão patelar.',
        'Eliminar E: maléolo — tornozelo, outro molde.',
        'Eliminar D: “tíbia proximal” é vizinhança, mas não é a redação do gabarito.',
        'Eliminar A: “platô tibial” é sinônimo clínico, porém a banca marcou outra formulação.',
        'Validar C: planalto tibial.',
        'Em similares: se a prova disser PTB, pense tendão patelar + planalto/proximal da tíbia — e marque a letra da redação oficial.',
      ],
      footer_rule: 'Sigla → tendão patelar → planalto (letra da banca)',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'PTB EM PROVA',
      rows: [
        { label: 'PTB', value: 'Patellar Tendon Bearing — carga no tendão patelar' },
        { label: 'Território cobrado', value: 'Planalto tibial (redação da banca)' },
        { label: 'Armadilha de redação', value: '“Platô” ≈ mesmo conceito — outra formulação na lista' },
      ],
      footer_rule: 'Decore a sigla e a redação do gabarito',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'FORA DO PTB DESTA PROVA',
      items: [
        {
          label: 'Platô tibial (redação)',
          detail: 'Sinônimo clínico de planalto.',
          correct: 'Nesta prova a letra marcada é “planalto tibial”, não “platô”.',
        },
        {
          label: 'Tíbia distal / maléolo',
          detail: 'Território do tornozelo.',
          correct: 'Longe do apoio no tendão patelar do PTB.',
        },
        {
          label: 'Tíbia proximal (genérico)',
          detail: 'Vizinhança anatômica.',
          correct: 'A banca exigiu a formulação “planalto tibial”.',
        },
        {
          label: 'Em similares',
          detail: 'Gesso suropodálico vs PTB.',
          correct: 'Suropodálico envolve pé/tornozelo; PTB amarra carga no tendão patelar.',
        },
      ],
      footer_rule: 'Não troque planalto por distal/maléolo',
    },
  ];
  save(slug, q);
}

/** Epitélio = revestimento e proteção (E) */
function handcraftEpitelial() {
  const slug = 'cebraspe-cespe-enfermagem-nocoes-de-anatomia-1775447782763-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_generico',
    snapshot: 'Tecido epitelial — funções principais: revestimento e proteção (também secreção/absorção em contextos específicos)',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Epitélio — duas funções-chave',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Cebraspe pede o par de funções principais do tecido epitelial.',
          icon: 'Target',
        },
        {
          label: 'Revestimento + proteção',
          detail: 'Epitélio cobre superfícies e protege o organismo — função clássica de prova.',
          icon: 'Shield',
        },
        {
          label: 'Funções de outros tecidos',
          detail: 'Preenchimento/sustentação → conjuntivo; peristalse → músculo; circulação → sangue/vasos.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Colar no epitélio funções do conjuntivo, muscular ou vascular.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Epitélio = revestir e proteger',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o tecido: epitelial.',
        'Eliminar A: preenchimento é tipicamente conjuntivo.',
        'Eliminar B: transporte/circulação sanguínea não é o par clássico do epitélio.',
        'Eliminar C: peristalse é muscular; absorção pode ocorrer, mas o par pedido é outro.',
        'Eliminar D: sustentação é conjuntivo/ósseo; respiração não é função epitelial-chave aqui.',
        'Validar E: revestimento e proteção.',
        'Em similares: se pedir tecido de preenchimento → conjuntivo; se pedir contração → muscular.',
      ],
      footer_rule: 'Pareie o tecido à função — sem misturar famílias',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'TECIDOS — FUNÇÕES RÁPIDAS',
      rows: [
        { label: 'Epitelial', value: 'Revestimento e proteção' },
        { label: 'Conjuntivo', value: 'Preenchimento / sustentação / suporte' },
        { label: 'Muscular', value: 'Contração / movimento (ex. peristalse)' },
      ],
      footer_rule: 'Não empreste função de outro tecido',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'FUNÇÕES EMPRESTADAS',
      items: [
        {
          label: 'Preenchimento',
          detail: 'Soa “genérico de tecido”.',
          correct: 'Preenchimento é marca do conjuntivo, não o par clássico do epitélio.',
        },
        {
          label: 'Circulação / peristalse',
          detail: 'Funções de vasos/músculo.',
          correct: 'Fora do núcleo revestimento+proteção.',
        },
        {
          label: 'Sustentação',
          detail: 'Lembra suporte estrutural.',
          correct: 'Sustentação clássica = conjuntivo/osso.',
        },
        {
          label: 'Em similares',
          detail: 'Epitélio glandular (secreção).',
          correct: 'Secreção existe, mas esta prova cobrou revestimento e proteção.',
        },
      ],
      footer_rule: 'Epitélio ≠ conjuntivo ≠ músculo',
    },
  ];
  save(slug, q);
}

/** Proximal I/II/III — só III (C) */
function handcraftProximal() {
  const slug = 'cebraspe-cespe-enfermagem-nocoes-de-anatomia-1775447782763-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_terminologia_planos',
    snapshot:
      'Proximal = mais próximo da raiz/origem do membro; distal = mais longe. Não é exclusivo de nervos/vasos nem sinônimo de “membros superiores”.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Proximal — três julgamentos',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Itens I–III sobre o termo proximal; a banca pede quantos estão certos.',
          icon: 'Target',
        },
        {
          label: 'I — “só membros superiores?”',
          detail: 'Proximal/distal valem para membros (MS e MI), não só superiores.',
          icon: 'X',
        },
        {
          label: 'II — “só nervos e vasos?”',
          detail: 'Também descreve ossos, músculos e segmentos do membro.',
          icon: 'X',
        },
        {
          label: 'PEGADINHA-ÂNCORA (III)',
          detail: 'III traz a definição correta — próximo da raiz/extremidade fixa do membro.',
          icon: 'Check',
        },
      ],
      footer_rule: 'Só a definição de proximidade à raiz passa',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'I: proximal ≠ “termo dos membros superiores” → falso.',
        'II: proximal/distal não são exclusivos de nervos e vasos → falso.',
        'III: proximal = mais próximo da raiz/extremidade fixa do membro → verdadeiro.',
        'Montar: apenas III certo → alternativa C.',
        'Em similares: distal = mais longe da raiz; medial/lateral = linha média — outro eixo.',
      ],
      footer_rule: 'I e II caem; III define → C',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'PROXIMAL × DISTAL',
      rows: [
        { label: 'Proximal', value: 'Mais perto da raiz / origem do membro' },
        { label: 'Distal', value: 'Mais longe da raiz / origem do membro' },
        { label: 'Uso', value: 'Membros (MS e MI), não só nervos/vasos' },
      ],
      footer_rule: 'Raiz do membro é a referência — não o lado do corpo',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'DEFINIÇÕES QUE CAEM',
      items: [
        {
          label: 'Só membros superiores',
          detail: 'Restringe o termo sem base.',
          correct: 'Proximal também descreve o membro inferior.',
        },
        {
          label: 'Só nervos e vasos',
          detail: 'Restringe o uso anatômico.',
          correct: 'Serve para segmentos ósseos/musculares do membro também.',
        },
        {
          label: 'Trocar por medial',
          detail: 'Outro eixo de orientação.',
          correct: 'Medial = perto da linha média; proximal = perto da raiz do membro.',
        },
        {
          label: 'Em similares',
          detail: 'Cotovelo proximal ao punho?',
          correct: 'Sim: cotovelo está mais perto da raiz do MS que o punho.',
        },
      ],
      footer_rule: 'Não restrinja proximal a um lado ou a vasos',
    },
  ];
  save(slug, q);
}

/** Coração C/E — reusa âncora cardiovascular */
function handcraftCoracao() {
  const slug = 'cebraspe-cespe-enfermagem-nocoes-de-anatomia-1775448311662-0';
  const anchor = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        'examples/questao-premium-cebraspe-nocoes-de-anatomia-anat_cardiovascular.json',
      ),
      'utf8',
    ),
  ) as Q;
  const q = load(slug);
  enrichMeta(q, {
    family: 'certo_errado',
    branch: 'anat_cardiovascular',
    snapshot: String(
      (anchor.meta as { content_review?: { guideline_snapshot?: string } })?.content_review
        ?.guideline_snapshot ??
        'Coração no mediastino/cavidade torácica, posterior ao esterno, superior ao diafragma',
    ),
    sources: (anchor.meta as { sources?: unknown[] })?.sources,
  });
  q.reverse_study_slides = anchor.reverse_study_slides;
  save(slug, q);
}

function main() {
  handcraftEscafoide();
  handcraftColateralLateral();
  handcraftHutchinson();
  handcraftSartorio();
  handcraftPtb();
  handcraftEpitelial();
  handcraftProximal();
  handcraftCoracao();
  console.log('[handcraft:anat-g02] done 8/8');
}

main();
