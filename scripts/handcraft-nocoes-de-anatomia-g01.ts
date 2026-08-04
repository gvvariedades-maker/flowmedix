/**
 * Handcraft golden-v1 — nocoes-de-anatomia-g01 (8 slugs).
 * Uso: npx tsx scripts/handcraft-nocoes-de-anatomia-g01.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LOTE = 'nocoes-de-anatomia-g01';
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
  console.log(`[handcraft:anat-g01] wrote ${slug}`);
}

function enrichMeta(
  q: Q,
  args: {
    family: string;
    branch: string;
    snapshot: string;
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
      exam_vs_current: 'none',
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

function handcraftAgirhRadial() {
  const slug = 'agirh-enfermagem-nocoes-de-anatomia-1775448514037-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_generico',
    snapshot: 'Pulso radial: entre apófise estiloide do rádio e tendões flexores no punho',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Pulso — onde palpamos no punho',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca descreve um ponto anatômico no punho e pede o nome do pulso.',
          icon: 'Target',
        },
        {
          label: 'Marco ósseo',
          detail: 'Apófise estiloide do rádio marca a face lateral do punho distal.',
          icon: 'Bone',
        },
        {
          label: 'Marco tendíneo',
          detail: 'Tendões dos flexores passam na face volar — o pulso fica entre osso e tendões.',
          icon: 'Move',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Trocar radial por braquial (fossa antecubital) ou carotídeo (pescoço).',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Punho distal + estiloide do rádio = território do radial',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o marco: entre estiloide do rádio e tendões flexores.',
        'Eliminar A: carotídeo é no pescoço, não no punho.',
        'Eliminar B: braquial é na fossa antecubital / face medial do braço.',
        'Eliminar D: tibial posterior é no tornozelo (maléolo medial).',
        'Validar C: pulso radial no punho distal.',
        'Em similares: se o marco for punho + rádio → radial; se fossa do cotovelo → braquial.',
      ],
      footer_rule: 'Marco anatômico decide o nome do pulso',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'PULSOS — MARCOS RÁPIDOS',
      rows: [
        { label: 'Radial', value: 'Punho: estiloide do rádio × flexores' },
        { label: 'Braquial', value: 'Fossa antecubital / face medial do braço' },
        { label: 'Carotídeo', value: 'Pescoço (sulco carotídeo)' },
        { label: 'Tibial posterior', value: 'Retromaleolar medial (tornozelo)' },
      ],
      footer_rule: 'Associe o marco ao território — não chute pelo ‘mais comum’',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TROCAS DE TERRITÓRIO DE PULSO',
      items: [
        {
          label: 'Marcar carotídeo',
          detail: 'Pescoço, não punho.',
          correct: 'Carotídeo é cervical — fora do marco do enunciado.',
        },
        {
          label: 'Marcar braquial',
          detail: 'Cotovelo/braço, não estiloide radial.',
          correct: 'Braquial fica na fossa antecubital, não entre rádio e flexores.',
        },
        {
          label: 'Marcar tibial posterior',
          detail: 'Tornozelo, não punho.',
          correct: 'Tibial posterior é retromaleolar medial.',
        },
        {
          label: 'Em similares',
          detail: 'Pulso ulnar vs radial no mesmo punho.',
          correct: 'Ulnar fica no lado medial; radial no lado do rádio/estiloide.',
        },
      ],
      footer_rule: 'Errado o território = errado o nome do pulso',
    },
  ];
  save(slug, q);
}

function handcraftAmaucAcro() {
  const slug = 'amauc-enfermagem-nocoes-de-anatomia-1775448514037-4';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_terminologia_planos',
    snapshot: 'Prefixo acro- = extremidade (acrômio, acrofobia, acrocianose)',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Prefixos — extremidade no nome',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca pede o prefixo que indica extremidade em terminologia anatômica.',
          icon: 'Target',
        },
        {
          label: 'Acro-',
          detail: 'Remete a ponta/extremidade (ex.: acrômio, acrocianose).',
          icon: 'Sparkles',
        },
        {
          label: 'Outros prefixos',
          detail: 'Aco-/actino-/ade- não são o marcador clássico de ‘extremidade’ nesta lista.',
          icon: 'List',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Escolher prefixo parecido no som (Aco, Ade) sem o sentido de ponta.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Extremidade → acro-',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o pedido: prefixo de extremidades.',
        'Eliminar A–D: Aco, Actino, Ade e Adiano não carregam o sentido clássico de ponta/extremidade nesta prova.',
        'Validar E: Acro- = extremidade.',
        'Em similares: se o termo falar em ponta/ápice/extremidade distal → acro-.',
      ],
      footer_rule: 'Som parecido não substitui o significado',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ACRO- = EXTREMIDADE',
      rows: [
        { label: 'Acro-', value: 'Extremidade / ponta' },
        { label: 'Exemplo clínico', value: 'Acrocianose (cianose de extremidades)' },
        { label: 'Exemplo ósseo', value: 'Acrômio (extremidade da espinha da escápula)' },
      ],
      footer_rule: 'Decore: acro = ponta',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'PREFIXOS QUE SÓ PARECEM',
      items: [
        {
          label: 'Aco-',
          detail: 'Som próximo, sentido diferente.',
          correct: 'Não é o prefixo clássico de extremidade nesta lista.',
        },
        {
          label: 'Actino-',
          detail: 'Remete a raio/radiação em outros contextos.',
          correct: 'Não marca ‘extremidade’ anatômica aqui.',
        },
        {
          label: 'Ade- / Adiano-',
          detail: 'Distratores de morfologia.',
          correct: 'Fora do sentido de ponta/extremidade pedido.',
        },
        {
          label: 'Em similares',
          detail: 'Confundir acro- com peri- ou endo-.',
          correct: 'Peri- = ao redor; endo- = dentro; acro- = extremidade.',
        },
      ],
      footer_rule: 'Significado > semelhança fonética',
    },
  ];
  save(slug, q);
}

function handcraftAmeoscCuboide() {
  const slug = 'ameosc-enfermagem-nocoes-de-anatomia-1775447762008-5';
  const anchor = JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'examples/questao-premium-ameosc-nocoes-de-anatomia-anat_esqueleto.json'),
      'utf8',
    ),
  ) as Q;
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot: String(
      (anchor.meta as { content_review?: { guideline_snapshot?: string } })?.content_review
        ?.guideline_snapshot ?? 'Ossos curtos — cuboide',
    ),
    sources: (anchor.meta as { sources?: unknown[] })?.sources,
  });
  q.reverse_study_slides = anchor.reverse_study_slides;
  save(slug, q);
}

function handcraftAmeoscVf() {
  const slug = 'ameosc-enfermagem-nocoes-de-anatomia-1775448491347-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'vf',
    branch: 'anat_esqueleto',
    snapshot:
      'Esqueleto axial (linha mediana); osso longo = epífise+diáfise; compacta ≠ esponjosa trabecular; forames (não saliências) permitem passagem',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Esqueleto — quatro julgamentos',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Afirmativas I–IV em V/F sobre axial, osso longo, substância óssea e saliências.',
          icon: 'Target',
        },
        {
          label: 'I e II — axial e osso longo',
          detail: 'I: axial = linha mediana vital. II: longo = epífises + diáfise.',
          icon: 'Bone',
        },
        {
          label: 'III — compacta × esponjosa',
          detail: 'Trabéculas e lacunas com medula descrevem osso esponjoso — não a compacta.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA (IV)',
          detail: 'Chamar de ‘saliência’ o que na verdade é forame/orifício de passagem.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Julgue I–IV; a sequência nasce dos quatro vereditos',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'I: axial na linha mediana e vital → VERDADEIRO.',
        'II: osso longo com epífises e diáfise → VERDADEIRO.',
        'III: trabéculas/lacunas/medula descrevem esponjosa, não compacta → FALSO.',
        'IV: passagem (ex. forame magno) não é papel das saliências → FALSO.',
        'Montar sequência V, V, F, F → alternativa C.',
        'Em similares: compacta é densa; esponjosa é trabecular — não troque os nomes.',
      ],
      footer_rule: 'I e II verdadeiras; III e IV falsas → C',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ESQUELETO — FIXADORES V/F',
      rows: [
        { label: 'I — Axial', value: 'Ossos da linha mediana (crânio, coluna, tórax…)' },
        { label: 'II — Osso longo', value: 'Epífises + diáfise' },
        { label: 'III — Esponjosa', value: 'Trabéculas + espaços com medula (≠ compacta)' },
        { label: 'IV — Forame', value: 'Passagem de estruturas (≠ saliência)' },
      ],
      footer_rule: 'Saliência projeta; forame deixa passar',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'ERROS QUE INVERTEM A SEQUÊNCIA',
      items: [
        {
          label: 'Negar I (axial)',
          detail: 'Marcar F na afirmativa I.',
          correct: 'I é verdadeira: axial reúne ossos da linha mediana vitais.',
        },
        {
          label: 'Negar II (epífise/diáfise)',
          detail: 'Marcar F na afirmativa II.',
          correct: 'II é verdadeira: osso longo tem epífises e diáfise.',
        },
        {
          label: 'Aceitar III (compacta trabecular)',
          detail: 'Marcar V na afirmativa III.',
          correct: 'III é falsa: trabéculas/lacunas = esponjosa.',
        },
        {
          label: 'Aceitar IV (saliência = passagem)',
          detail: 'Marcar V na afirmativa IV.',
          correct: 'IV é falsa: passagem é forame; saliências são projeções.',
        },
        {
          label: 'Em similares',
          detail: 'Apófise vs forame.',
          correct: 'Apófise/saliência = inserção; forame = passagem.',
        },
      ],
      footer_rule: 'Um V/F invertido em I–IV muda a letra da sequência',
    },
  ];
  save(slug, q);
}

function handcraftAvancaspPele() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775331667969-6';
  const anchor = JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'examples/questao-premium-avancasp-nocoes-de-anatomia-anat_generico.json'),
      'utf8',
    ),
  ) as Q;
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_generico',
    snapshot: String(
      (anchor.meta as { content_review?: { guideline_snapshot?: string } })?.content_review
        ?.guideline_snapshot ?? 'Hipoderme',
    ),
    sources: (anchor.meta as { sources?: unknown[] })?.sources,
  });
  q.reverse_study_slides = anchor.reverse_study_slides;
  save(slug, q);
}

function handcraftAvancaspDeltoide() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775447834740-5';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_muscular',
    snapshot: 'Deltoide — abdução primária do ombro; manguito rotador (supra/infra/subscap/redondo menor) é outro grupo',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Ombro — quem abre o braço',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Pede o músculo primário da abdução do ombro, citado em lesões do manguito.',
          icon: 'Target',
        },
        {
          label: 'Deltoide',
          detail: 'Principal abdutor do ombro (após os primeiros graus do supraespinhal).',
          icon: 'Move',
        },
        {
          label: 'Manguito × deltoide',
          detail: 'Manguito estabiliza; deltoide executa grande parte da abdução visível.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Trocar por peitoral, bíceps, tríceps ou latíssimo (outros movimentos).',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Abdução do ombro → pense deltoide',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar a função: abdução primária do ombro.',
        'Eliminar A: peitoral maior faz adução/flexão/rotação interna — não é o abdutor principal.',
        'Eliminar C e D: bíceps e tríceps atuam no cotovelo (e auxiliares no ombro), não como abdutor primário.',
        'Eliminar E: latíssimo faz adução/extensão/rotação interna.',
        'Validar B: deltoide.',
        'Em similares: abdução = deltoide; adução forte = peitoral/latíssimo.',
      ],
      footer_rule: 'Função pedida > músculo ‘famoso’ do ombro',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'OMBRO — FUNÇÃO × MÚSCULO',
      rows: [
        { label: 'Abdução', value: 'Deltoide (principal)' },
        { label: 'Manguito', value: 'Estabilidade (supra, infra, subscapular, redondo menor)' },
        { label: 'Peitoral / Latíssimo', value: 'Adução (e outros vetores)' },
      ],
      footer_rule: 'Abdução ≠ adução',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'MÚSCULOS ERRADOS PARA ABDUÇÃO',
      items: [
        {
          label: 'Peitoral maior',
          detail: 'Aproxima o braço do tronco.',
          correct: 'Peitoral é adutor/flexor — não o abdutor primário.',
        },
        {
          label: 'Bíceps braquial',
          detail: 'Flexor de cotovelo.',
          correct: 'Não é o motor principal da abdução do ombro.',
        },
        {
          label: 'Tríceps braquial',
          detail: 'Extensor de cotovelo.',
          correct: 'Fora do papel de abdutor primário do ombro.',
        },
        {
          label: 'Latíssimo do dorso',
          detail: 'Adução e extensão do braço.',
          correct: 'Latíssimo aduz — oposto ao pedido.',
        },
        {
          label: 'Em similares',
          detail: 'Supraespinhal vs deltoide.',
          correct: 'Supra inicia; deltoide sustenta a maior parte da abdução.',
        },
      ],
      footer_rule: 'Se a função for abrir o braço, deltoide fecha a conta',
    },
  ];
  save(slug, q);
}

function handcraftAvancaspCotovelo() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775447834740-6';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot: 'Articulação do cotovelo: úmero + rádio + ulna (cúbito). Ombro = escápula/clavícula/úmero',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Cotovelo — três ossos',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Quais ossos formam diretamente a articulação do cotovelo.',
          icon: 'Target',
        },
        {
          label: 'Úmero',
          detail: 'Osso do braço que articula distalmente com rádio e ulna.',
          icon: 'Bone',
        },
        {
          label: 'Rádio e ulna',
          detail: 'Ossos do antebraço; juntos com o úmero fecham o cotovelo.',
          icon: 'Link',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Misturar com cintura escapular (escápula/clavícula) ou com ossos da mão.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Cotovelo = úmero + rádio + ulna',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar a articulação: cotovelo (não ombro, não punho).',
        'Eliminar B e D: escápula/clavícula pertencem ao ombro/cintura escapular.',
        'Eliminar C: escápula não entra no cotovelo (mesmo com rádio/cúbito).',
        'Eliminar E: carpos/metacarpos/falanges são da mão.',
        'Validar A: rádio, ulna e úmero.',
        'Em similares: ombro = escápula+clavícula+úmero; cotovelo = úmero+rádio+ulna.',
      ],
      footer_rule: 'Não leve ossos do ombro para o cotovelo',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'COTOVELO × OMBRO',
      rows: [
        { label: 'Cotovelo', value: 'Úmero + rádio + ulna (cúbito)' },
        { label: 'Ombro / cintura', value: 'Escápula + clavícula + úmero' },
        { label: 'Mão', value: 'Carpos, metacarpos, falanges' },
      ],
      footer_rule: 'Cúbito = ulna — mesmo osso, nome clássico de prova',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'MISTURAS DE ARTICULAÇÃO',
      items: [
        {
          label: 'Incluir escápula/clavícula',
          detail: 'Território do ombro.',
          correct: 'Escápula e clavícula não formam o cotovelo.',
        },
        {
          label: 'Rádio + cúbito + escápula',
          detail: 'Mistura antebraço com cintura.',
          correct: 'Falta o úmero e sobra a escápula.',
        },
        {
          label: 'Ossos da mão',
          detail: 'Carpos/metacarpos/falanges.',
          correct: 'Mão ≠ cotovelo.',
        },
        {
          label: 'Em similares',
          detail: 'Punho vs cotovelo.',
          correct: 'Punho articula rádio/ulna com carpo — outro conjunto.',
        },
      ],
      footer_rule: 'Nomeie a articulação antes de listar os ossos',
    },
  ];
  save(slug, q);
}

function handcraftAvancasp206() {
  const slug = 'avancasp-enfermagem-nocoes-de-anatomia-1775448458316-2';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot: 'Esqueleto adulto clássico de prova: ~206 ossos (número varia com sesamoides/critério, mas 206 é o gabarito típico)',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: '206 — número clássico',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Quantos ossos no esqueleto adulto (número cobrado em concurso).',
          icon: 'Target',
        },
        {
          label: 'Adulto × criança',
          detail: 'Recém-nascido tem mais ossos (fusões ainda não ocorreram); adulto converge para ~206.',
          icon: 'GitCompare',
        },
        {
          label: 'Variação real',
          detail: 'Sesamoides e critérios anatômicos podem variar — a prova clássica cobra 206.',
          icon: 'Info',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Oferecer vizinhos numéricos próximos do total clássico.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Em prova TE, adulto = 206',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o comando: número de ossos na fase adulta.',
        'Eliminar alternativas fora da ordem de grandeza clássica do adulto.',
        'Eliminar vizinhos numéricos que capturam quem ‘quase lembra’.',
        'Validar C: 206.',
        'Em similares: se a banca falar recém-nascido, o número sobe — adulto permanece 206.',
      ],
      footer_rule: '206 é o ímã; o resto é distração numérica',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ESQUELETO ADULTO',
      rows: [
        { label: 'Número clássico', value: '206 ossos' },
        { label: 'Axial + apendicular', value: 'Somam o total cobrado em prova' },
      ],
      footer_rule: 'Decore 206 — e descarte vizinhos',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'VIZINHOS NUMÉRICOS',
      items: [
        {
          label: 'Metade inventada',
          detail: 'Total muito abaixo do adulto clássico.',
          correct: 'Fora do total adulto clássico (206).',
        },
        {
          label: 'Soma inflada',
          detail: 'Total bem acima do padrão de prova.',
          correct: 'Não é o número padrão de adulto em prova.',
        },
        {
          label: 'Quase-acertos',
          detail: 'Números vizinhos de quem memorizou pela metade.',
          correct: 'Distratores de memória parcial — o clássico é 206.',
        },
        {
          label: 'Em similares',
          detail: 'Contar sesamoides extras.',
          correct: 'Salvo enunciado explícito, mantenha 206.',
        },
      ],
      footer_rule: 'Se for adulto e sem ressalva, marque 206',
    },
  ];
  save(slug, q);
}

function main() {
  handcraftAgirhRadial();
  handcraftAmaucAcro();
  handcraftAmeoscCuboide();
  handcraftAmeoscVf();
  handcraftAvancaspPele();
  handcraftAvancaspDeltoide();
  handcraftAvancaspCotovelo();
  handcraftAvancasp206();
  console.log('[handcraft:anat-g01] done 8/8');
}

main();
