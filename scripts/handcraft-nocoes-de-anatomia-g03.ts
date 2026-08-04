/**
 * Handcraft golden-v1 — nocoes-de-anatomia-g03 (8 slugs).
 * Uso: npx tsx scripts/handcraft-nocoes-de-anatomia-g03.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LOTE = 'nocoes-de-anatomia-g03';
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
  console.log(`[handcraft:anat-g03] wrote ${slug}`);
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

/** Coronárias irrigam o miocárdio — Certo (A) */
function handcraftCoronarias() {
  const slug = 'cebraspe-cespe-enfermagem-nocoes-de-anatomia-1775448311662-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'certo_errado',
    branch: 'anat_cardiovascular',
    snapshot: 'Artérias coronárias = irrigação do músculo cardíaco (miocárdio); nascem da aorta ascendente',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Coronárias — para quem o sangue vai?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Item C/E sobre artérias coronárias e irrigação do músculo cardíaco.',
          icon: 'Target',
        },
        {
          label: 'Coronárias',
          detail: 'São as artérias que nutrem o próprio coração (miocárdio).',
          icon: 'Heart',
        },
        {
          label: 'Papel no mapa vascular',
          detail: 'Estão entre as artérias principais do organismo — território específico: músculo cardíaco.',
          icon: 'GitBranch',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Achar que coronária irriga só “pericárdio” ou confundir com artérias pulmonares.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Coronária = sangue para o miocárdio',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o item: coronárias irrigam o músculo cardíaco e estão entre as principais artérias.',
        'Checar irrigação: miocárdio = papel clássico das coronárias → coerente.',
        'Checar “principais”: são artérias essenciais do organismo → coerente.',
        'Concluir: o item está certo → alternativa A.',
        'Em similares: se disser que coronária leva sangue aos pulmões, marque Errado.',
      ],
      footer_rule: 'Certo quando irrigação = miocárdio',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'CORONÁRIAS — FIXADOR',
      rows: [
        { label: 'Coronárias', value: 'Irrigam o músculo cardíaco (miocárdio)' },
        { label: 'Origem clássica', value: 'Aorta ascendente (seios de Valsalva)' },
        { label: 'Não confundir', value: 'Pulmonares = circulação pulmonar, não miocárdio' },
      ],
      footer_rule: 'Coração nutre a si mesmo pelas coronárias',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TROCAS DE TERRITÓRIO ARTERIAL',
      items: [
        {
          label: 'Confundir com pulmonares',
          detail: 'Artérias que vão aos pulmões.',
          correct: 'Pulmonares não irrigam o miocárdio — coronárias sim.',
        },
        {
          label: 'Achar que “principais” exclui coronárias',
          detail: 'Subestimar o papel vital.',
          correct: 'São artérias essenciais: sem elas, o músculo cardíaco sofre isquemia.',
        },
        {
          label: 'Em similares',
          detail: 'Veias cardíacas vs artérias coronárias.',
          correct: 'Coronárias levam sangue ao miocárdio; veias drenam o retorno.',
        },
      ],
      footer_rule: 'Miocárdio = coronária; pulmão = pulmonar',
    },
  ];
  save(slug, q);
}

/** Mitral entre AD e VD — Errado (B); mitral é esquerda */
function handcraftMitral() {
  const slug = 'cebraspe-cespe-enfermagem-nocoes-de-anatomia-1775448311662-2';
  const q = load(slug);
  enrichMeta(q, {
    family: 'certo_errado',
    branch: 'anat_cardiovascular',
    snapshot:
      'Valva mitral (bicúspide) = entre átrio e ventrículo esquerdos; direita = tricúspide',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Mitral — qual lado do coração?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Item C/E localiza a valva mitral entre câmaras do coração.',
          icon: 'Target',
        },
        {
          label: 'Lado esquerdo',
          detail: 'Mitral (bicúspide) fica entre átrio e ventrículo esquerdos.',
          icon: 'Heart',
        },
        {
          label: 'Lado direito',
          detail: 'Entre átrio e ventrículo direitos fica a tricúspide — não a mitral.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Trocar mitral ↔ tricúspide só mudando “direito/esquerdo”.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Mitral = esquerda; tricúspide = direita',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o item: mitral entre átrio e ventrículo direitos.',
        'Lembrar o mapa: mitral = lado esquerdo; tricúspide = lado direito.',
        'O item coloca mitral na direita → afirmação falsa.',
        'Concluir: Errado → alternativa B.',
        'Em similares: se disser mitral entre átrio e ventrículo esquerdos, marque Certo.',
      ],
      footer_rule: 'Lado errado = item errado',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'VALVAS AV — MAPA RÁPIDO',
      rows: [
        { label: 'Mitral (bicúspide)', value: 'Átrio esquerdo ↔ ventrículo esquerdo' },
        { label: 'Tricúspide', value: 'Átrio direito ↔ ventrículo direito' },
        { label: 'Mnemônico', value: '“L” de mitral/esquerda (Left) em inglês — reforço' },
      ],
      footer_rule: 'Direita = tri; esquerda = mi',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TROCAS DE VALVA',
      items: [
        {
          label: 'Mitral na direita',
          detail: 'Espelhar o lado.',
          correct: 'Na direita está a tricúspide — mitral é esquerda.',
        },
        {
          label: 'Confundir com aórtica/pulmonar',
          detail: 'Valvas semilunares de saída.',
          correct: 'Aórtica e pulmonar não são as AV átrio–ventrículo.',
        },
        {
          label: 'Em similares',
          detail: 'Bicúspide = outro nome da mitral.',
          correct: 'Bicúspide e mitral são a mesma valva esquerda.',
        },
      ],
      footer_rule: 'Não inverta os lados das AV',
    },
  ];
  save(slug, q);
}

/** Ulna não participa da radiocarpal — (D) */
function handcraftUlnaRadiocarpal() {
  const slug = 'cotec-fadenor-enfermagem-nocoes-de-anatomia-1775448475837-4';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Ulna: osso medial do antebraço; afila distalmente e não participa da articulação radiocarpal (punho). Cabeça do rádio é proximal (não distal).',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Esqueleto apendicular superior — ulna no punho',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail:
            'Cíngulo do membro superior (clavícula, escápula) + parte livre (úmero, ulna, rádio, ossos da mão) — achar a afirmativa correta.',
          icon: 'Target',
        },
        {
          label: 'Ulna',
          detail: 'Osso medial mais longo do antebraço: espesso proximal, afila em sentido distal.',
          icon: 'Bone',
        },
        {
          label: 'Articulação radiocarpal',
          detail: 'O rádio articula com o carpo no punho; a ulna não chega até essa articulação.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail:
            'Errar cabeça do rádio (proximal ≠ distal), escafoide/piramidal no carpo ou olécrano × processo coracoide da escápula.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Radiocarpal = rádio + carpo; ulna fica de fora',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Eliminar A: a cabeça do rádio é proximal (não distal) e articula com o úmero na flexão/extensão do cotovelo.',
        'Eliminar B: o escafoide não é cuneiforme nem articula principalmente com o terceiro metacarpal.',
        'Eliminar C: o osso piramidal não fica na face lateral do carpo nem articula com a radioulnar proximal.',
        'Eliminar E: olécrano e processo coronoides (não coracoide da escápula) formam a incisura troclear da ulna; o eixo é flexão/extensão do cotovelo.',
        'Validar D: corpo da ulna medial afila distalmente e a ulna não participa da articulação radiocarpal.',
        'Em similares: no esqueleto apendicular superior, quem articula com o carpo no punho é o rádio — não a ulna.',
      ],
      footer_rule: 'Cheque lado, proximal/distal e quem entra no punho',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ULNA × RÁDIO × CARPO',
      rows: [
        { label: 'Ulna', value: 'Medial no antebraço; fora da radiocarpal' },
        { label: 'Rádio', value: 'Lateral; articula com o carpo (radiocarpal)' },
        { label: 'Cabeça do rádio', value: 'Proximal — articula com o úmero' },
        { label: 'Escápula', value: 'Processo coracoide — não confundir com coronoides da ulna' },
      ],
      footer_rule: 'Radiocarpal = rádio + ossos do carpo',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'DETALHES QUE DERRUBAM A ALTERNATIVA',
      items: [
        {
          label: 'Cabeça do rádio “distal”',
          detail: 'Inverte proximal/distal no antebraço.',
          correct: 'A cabeça do rádio é proximal e articula com o úmero.',
        },
        {
          label: 'Escafoide / metacarpal',
          detail: 'Descrição errada do carpo e da mão.',
          correct: 'Escafoide é carpal proximal — não articula principalmente com o 3º metacarpal.',
        },
        {
          label: 'Piramidal “lateral”',
          detail: 'Lado errado no carpo.',
          correct: 'Piramidal é medial; não articula com a radioulnar proximal.',
        },
        {
          label: 'Em similares',
          detail: 'Coracoide (escápula) vs coronoides (ulna).',
          correct: 'No cotovelo é processo coronoides da ulna + olécrano.',
        },
      ],
      footer_rule: 'Um erro anatômico basta para anular a frase',
    },
  ];
  save(slug, q);
}

/** Descrição = escafoide (E) */
function handcraftEscafoideTabaqueira() {
  const slug = 'cotec-fadenor-enfermagem-nocoes-de-anatomia-1775448475837-5';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Escafoide: maior da fileira proximal do carpo; assoalho da tabaqueira anatômica; fratura mais comum do carpo (queda sobre a palma)',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Qual osso do carpo?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca descreve face radial, tabaqueira, fileira proximal e fratura por queda na palma.',
          icon: 'Target',
        },
        {
          label: 'Pistas em bloco',
          detail: 'Face radial + assoalho da tabaqueira + maior da fileira proximal + fratura frequente.',
          icon: 'Search',
        },
        {
          label: 'Outros carpais',
          detail: 'Trapézio/hamato = fileira distal; semilunar/piramidal = proximal, mas sem esse pacote de pistas.',
          icon: 'List',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar semilunar (vizinho proximal) ou trapézio (também “radial”, mas distal).',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Tabaqueira + fileira proximal + fratura = escafoide',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Juntar as pistas: face radial, tabaqueira, maior da proximal, fratura por queda na palma.',
        'Eliminar A e B: trapézio e hamato são da fileira distal.',
        'Eliminar C e D: semilunar e piramidal são proximais, mas não são o assoalho clássico da tabaqueira nem o mais fraturado.',
        'Validar E: escafoide.',
        'Em similares: dor na tabaqueira anatômica após queda → pense escafoide.',
      ],
      footer_rule: 'O pacote de pistas aponta um único carpal',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ESCAFOIDE — IDENTIDADE',
      rows: [
        { label: 'Fileira', value: 'Proximal do carpo (maior dela)' },
        { label: 'Marco clínico', value: 'Assoalho da tabaqueira anatômica' },
        { label: 'Trauma clássico', value: 'Queda sobre a palma — fratura carpal mais frequente' },
      ],
      footer_rule: 'Tabaqueira + queda na palma → escafoide',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'CARPAIS QUE SÓ PARECEM',
      items: [
        {
          label: 'Trapézio',
          detail: 'Também no lado radial.',
          correct: 'É da fileira distal — articula com o 1º metacarpo.',
        },
        {
          label: 'Semilunar',
          detail: 'Vizinho proximal.',
          correct: 'Não é o assoalho clássico da tabaqueira nem o mais fraturado.',
        },
        {
          label: 'Hamato / piramidal',
          detail: 'Outros nomes do carpo.',
          correct: 'Fora do pacote face radial + tabaqueira + maior proximal.',
        },
        {
          label: 'Em similares',
          detail: 'Navicular do pé vs escafoide do carpo.',
          correct: 'Em punho/TE, o pacote acima = escafoide do carpo.',
        },
      ],
      footer_rule: 'Fileira distal ou vizinho ≠ escafoide',
    },
  ];
  save(slug, q);
}

/** Entorse = ligamentos (E) */
function handcraftEntorse() {
  const slug = 'cpcon-uepb-enfermagem-nocoes-de-anatomia-1775448514037-3';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Entorse = lesão de ligamentos (distensão/ruptura); luxação = perda da congruência articular; fratura = osso; estiramento muscular = distensão',
    examVsCurrent:
      'A redação do gabarito mistura “ligamentos tendíneos ou musculares”; em linguagem clínica estrita entorse = ligamento. Ensinar o gabarito da banca.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Entorse × luxação × fratura',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Definir corretamente entorse, luxação e fratura — a banca troca os conceitos.',
          icon: 'Target',
        },
        {
          label: 'Entorse',
          detail: 'Lesão dos ligamentos (distensão ou ruptura) que estabilizam a articulação.',
          icon: 'Link',
        },
        {
          label: 'Luxação × fratura',
          detail: 'Luxação = osso sai da posição articular; fratura = ruptura óssea.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Chamar de entorse o que é luxação ou estiramento muscular puro.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Entorse → ligamento; luxação → posição; fratura → osso',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Eliminar A: fratura não é ruptura de ligamento — é lesão óssea.',
        'Eliminar B: deslocamento ósseo da articulação = luxação, não entorse.',
        'Eliminar C: luxação não é estiramento muscular.',
        'Eliminar D: estiramento muscular ao redor da articulação não define entorse.',
        'Validar E: entorse envolve ligamentos com distensão ou ruptura.',
        'Em similares: se o enunciado falar “osso fora do lugar” → luxação; se falar “osso quebrado” → fratura.',
      ],
      footer_rule: 'Nomeie a estrutura lesada antes de marcar',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'TRÍADE DE LESÃO ARTICULAR',
      rows: [
        { label: 'Entorse', value: 'Ligamentos — distensão/ruptura' },
        { label: 'Luxação', value: 'Perda da posição óssea na articulação' },
        { label: 'Fratura', value: 'Ruptura do osso' },
      ],
      footer_rule: 'Estrutura lesada = nome da lesão',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'DEFINIÇÕES TROCADAS',
      items: [
        {
          label: 'Fratura = ligamento',
          detail: 'Mistura osso com partes moles.',
          correct: 'Fratura é ruptura óssea — não de ligamento.',
        },
        {
          label: 'Entorse = luxação',
          detail: 'Deslocamento ósseo.',
          correct: 'Deslocamento = luxação; entorse = ligamento.',
        },
        {
          label: 'Entorse = só músculo',
          detail: 'Estiramento muscular puro.',
          correct: 'Estiramento muscular é outro conceito; entorse aponta ligamento.',
        },
        {
          label: 'Em similares',
          detail: 'Distensão muscular vs entorse.',
          correct: 'Distensão = músculo/tendão; entorse = ligamento.',
        },
      ],
      footer_rule: 'Não empreste a definição de outra lesão',
    },
  ];
  save(slug, q);
}

/** Pupila nos olhos (C) */
function handcraftPupila() {
  const slug = 'fau-unicentro-enfermagem-nocoes-de-anatomia-1775447762008-3';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_generico',
    snapshot: 'Pupila = abertura no centro da íris do olho; regula a entrada de luz',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Pupila — em qual órgão?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca pergunta: a pupila está localizada em qual das opções?',
          icon: 'Target',
        },
        {
          label: 'Olhos',
          detail: 'A pupila é a abertura central da íris — fica nos olhos.',
          icon: 'Eye',
        },
        {
          label: 'Testículos e intestinos',
          detail: 'Órgãos de outros sistemas — não abrigam a pupila.',
          icon: 'List',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar ossos ou músculos, ou confundir pupila com papila pelo som.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Pupila = olhos',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o termo do enunciado: pupila.',
        'Eliminar A: testículos — sistema reprodutor, sem pupila.',
        'Eliminar B: intestinos — tubo digestivo, sem pupila.',
        'Eliminar D e E: ossos e músculos — suporte/movimento, sem pupila.',
        'Validar C: olhos.',
        'Em similares: pupila → olhos; papila gustativa → língua; não troque pelo som.',
      ],
      footer_rule: 'Órgão do enunciado = olhos',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'PUPILA NOS OLHOS',
      rows: [
        { label: 'Pupila', value: 'Abertura da íris — localizada nos olhos' },
        { label: 'Testículos / intestinos', value: 'Outros órgãos — fora do território' },
        { label: 'Ossos / músculos', value: 'Tecidos de suporte/movimento — sem pupila' },
      ],
      footer_rule: 'Pupila ≠ papila; pupila = olhos',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'OPÇÕES QUE NÃO TÊM PUPILA',
      items: [
        {
          label: 'Testículos',
          detail: 'Sistema reprodutor.',
          correct: 'A pupila está nos olhos — não nos testículos.',
        },
        {
          label: 'Intestinos',
          detail: 'Tubo digestivo.',
          correct: 'Intestinos não localizam a pupila.',
        },
        {
          label: 'Ossos ou músculos',
          detail: 'Tecidos de suporte/movimento.',
          correct: 'Nem ossos nem músculos abrigam a pupila.',
        },
        {
          label: 'Em similares',
          detail: 'Ler pupila como papila.',
          correct: 'Pupila = olhos; papila gustativa = língua.',
        },
      ],
      footer_rule: 'Leitura atenta: pupila nos olhos',
    },
  ];
  save(slug, q);
}

/** Papilas gustativas = língua / paladar (E) */
function handcraftPapilas() {
  const slug = 'fau-unicentro-enfermagem-nocoes-de-anatomia-1775447762008-8';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_generico',
    snapshot: 'Papilas gustativas na língua — sentido do paladar',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Papilas gustativas — onde e qual sentido?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Par localização + sentido relacionado às papilas gustativas.',
          icon: 'Target',
        },
        {
          label: 'Língua + paladar',
          detail: 'Papilas gustativas ficam na língua e servem ao paladar.',
          icon: 'Utensils',
        },
        {
          label: 'Outros pares sensoriais',
          detail: 'Olho/visão, tímpano/audição, pupila/visão — sentidos diferentes.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Colar “papila” em olho/pupila ou em adenoide/olfato.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Gustativa = língua + paladar',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o pedido: localização e sentido das papilas gustativas.',
        'Eliminar A e D: olho/pupila = visão, não paladar.',
        'Eliminar B: tímpano = audição.',
        'Eliminar C: adenoide não é o órgão do olfato (e olfato ≠ paladar).',
        'Validar E: língua / paladar.',
        'Em similares: se citar cóclea → audição; retina → visão; papila gustativa → paladar.',
      ],
      footer_rule: 'O adjetivo “gustativa” já aponta o sentido',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'ÓRGÃO × SENTIDO',
      rows: [
        { label: 'Papilas gustativas', value: 'Língua → paladar' },
        { label: 'Pupila / retina', value: 'Olho → visão' },
        { label: 'Tímpano', value: 'Orelha → audição' },
      ],
      footer_rule: 'Gustativa = gosto = paladar',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'PARES SENSORIAIS ERRADOS',
      items: [
        {
          label: 'Olho / visão',
          detail: 'Sentido visual.',
          correct: 'Não é o território das papilas gustativas.',
        },
        {
          label: 'Tímpano / audição',
          detail: 'Orelha média.',
          correct: 'Audição ≠ paladar.',
        },
        {
          label: 'Adenoide / olfato',
          detail: 'Par inventado.',
          correct: 'Olfato clássico = mucosa olfatória; papila gustativa = língua.',
        },
        {
          label: 'Em similares',
          detail: 'Papila vs pupila.',
          correct: 'Papila gustativa = língua; pupila = olho.',
        },
      ],
      footer_rule: 'Não troque paladar por visão/audição',
    },
  ];
  save(slug, q);
}

/** Endométrio = reveste dentro do útero (C) */
function handcraftEndometrio() {
  const slug = 'fau-unicentro-enfermagem-nocoes-de-anatomia-1775447834740-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_generico',
    snapshot:
      'Endométrio = mucosa que reveste a cavidade interna do útero; miométrio = músculo; perimétrio = serosa externa',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Endométrio — qual órgão e qual face?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Definir o que é o endométrio entre útero, ovário e tuba.',
          icon: 'Target',
        },
        {
          label: 'Útero — por dentro',
          detail: 'Endométrio reveste a cavidade interna do útero (mucosa).',
          icon: 'Layers',
        },
        {
          label: 'Camadas do útero',
          detail: 'Dentro = endométrio; meio = miométrio; fora = perimétrio/serosa.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Levar o endométrio para o ovário ou para a face externa do útero.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Endo- = dentro; métrio = útero',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Decodificar o prefixo: endo- = interno.',
        'Eliminar A e B: ovário não é o órgão do endométrio.',
        'Eliminar D: face externa do útero = perimétrio/serosa, não endométrio.',
        'Eliminar E: tuba uterina tem outro revestimento — não é endométrio.',
        'Validar C: reveste a parte de dentro do útero.',
        'Em similares: miométrio = músculo uterino; endométrio = mucosa interna.',
      ],
      footer_rule: 'Órgão certo + face interna',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'CAMADAS DO ÚTERO',
      rows: [
        { label: 'Endométrio', value: 'Mucosa interna (cavidade uterina)' },
        { label: 'Miométrio', value: 'Camada muscular' },
        { label: 'Perimétrio', value: 'Serosa / face externa' },
      ],
      footer_rule: 'Endo = dentro do útero',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'ÓRGÃO OU FACE ERRADOS',
      items: [
        {
          label: 'Ovário (dentro ou fora)',
          detail: 'Troca de órgão.',
          correct: 'Endométrio é do útero, não do ovário.',
        },
        {
          label: 'Face externa do útero',
          detail: 'Inverte endo × peri.',
          correct: 'Externa = perimétrio; interna = endométrio.',
        },
        {
          label: 'Tuba uterina',
          detail: 'Via anexial.',
          correct: 'Não é o tecido chamado endométrio.',
        },
        {
          label: 'Em similares',
          detail: 'Endometriose.',
          correct: 'É tecido tipo endométrio fora do lugar — reforça que o original é uterino interno.',
        },
      ],
      footer_rule: 'Útero + interno = endométrio',
    },
  ];
  save(slug, q);
}

function main() {
  handcraftCoronarias();
  handcraftMitral();
  handcraftUlnaRadiocarpal();
  handcraftEscafoideTabaqueira();
  handcraftEntorse();
  handcraftPupila();
  handcraftPapilas();
  handcraftEndometrio();
  console.log('[handcraft:anat-g03] done 8/8');
}

main();
