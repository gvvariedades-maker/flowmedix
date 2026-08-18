/**
 * Handcraft golden-v1 — nocoes-de-anatomia-g06 (6 slugs — último lote).
 * Uso: npx tsx scripts/handcraft-nocoes-de-anatomia-g06.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LOTE = 'nocoes-de-anatomia-g06';
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
  console.log(`[handcraft:anat-g06] wrote ${slug}`);
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

/** Luxação = perda completa da congruência articular (B) */
function handcraftLuxacao() {
  const slug = 'ibade-enfermagem-nocoes-de-anatomia-1775447762008-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Luxação = perda completa da congruência articular. Fratura = continuidade óssea; entorse = ligamentos; exposta = pele rompida.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Luxação — o que se perde?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'A banca pede a definição correta de luxação entre lesões osteoarticulares.',
          icon: 'Target',
        },
        {
          label: 'Congruência articular',
          detail: 'Na luxação, a congruência dos ossos que formam a articulação é completamente perdida.',
          icon: 'Unlink',
        },
        {
          label: 'Não é fratura',
          detail: 'Quebra óssea (fechada/exposta) e rompimento de pele por fragmento = território de fratura.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Chamar de luxação a torção forçada (entorse) ou a fratura exposta.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Luxação = articulação fora do encaixe',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o termo: luxação.',
        'Eliminar A: ruptura óssea total/parcial = fratura.',
        'Eliminar C: torção forçada da articulação ≈ entorse — não a definição de luxação.',
        'Eliminar D: rompimento da pele por fragmento = fratura exposta.',
        'Eliminar E: comprometimento de sensibilidade não define luxação.',
        'Validar B: congruência articular completamente perdida.',
        'Em similares: se o osso quebra → fratura; se sai do lugar na articulação → luxação.',
      ],
      footer_rule: 'Articulação fora do lugar = luxação',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'DEFINIÇÕES RÁPIDAS',
      rows: [
        { label: 'Luxação', value: 'Perda completa da congruência articular' },
        { label: 'Fratura', value: 'Perda da continuidade óssea' },
        { label: 'Entorse', value: 'Lesão ligamentar / torção articular' },
        { label: 'Exposta', value: 'Pele rompida — atributo de fratura' },
      ],
      footer_rule: 'Nomeie a estrutura: osso × articulação × ligamento',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'DEFINIÇÕES EMPRESTADAS',
      items: [
        {
          label: 'Quebra do osso',
          detail: 'Fratura.',
          correct: 'Ruptura óssea não é luxação.',
        },
        {
          label: 'Torção forçada',
          detail: 'Entorse.',
          correct: 'Torção/estiramento ligamentar ≠ perda completa de congruência.',
        },
        {
          label: 'Pele rompida pelo fragmento',
          detail: 'Fratura exposta.',
          correct: 'Descreve exposição óssea — não a definição de luxação.',
        },
        {
          label: 'Em similares',
          detail: 'Subluxação.',
          correct: 'Subluxação = perda parcial; luxação = perda completa da congruência.',
        },
      ],
      footer_rule: 'Não empreste a definição de fratura/entorse',
    },
  ];
  save(slug, q);
}

/** Plano sagital (B) */
function handcraftSagital() {
  const slug = 'ibade-enfermagem-nocoes-de-anatomia-1775448275334-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_terminologia_planos',
    snapshot:
      'Plano sagital: vertical, paralelo à linha média, divide direito/esquerdo. Frontal/coronal = anterior/posterior. Transverso/axial = superior/inferior.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Plano que separa direita e esquerda',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Plano vertical, paralelo à linha média, corta o corpo em lados direito e esquerdo.',
          icon: 'Target',
        },
        {
          label: 'Sagital',
          detail: 'Esse é o plano sagital (mediano se passa exatamente na linha média).',
          icon: 'MoveVertical',
        },
        {
          label: 'Outros planos',
          detail: 'Frontal/coronal = frente/trás; transverso/axial = cima/baixo.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Marcar frontal ou coronal (sinônimos entre si) no lugar do sagital.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Direita × esquerda = sagital',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler os filtros: vertical + paralelo à linha média + lados direito e esquerdo.',
        'Eliminar C e D: frontal e coronal dividem anterior/posterior — não direita/esquerda.',
        'Eliminar A e E: axial/transversal dividem superior/inferior.',
        'Validar B: sagital.',
        'Em similares: se a banca citar “frente e costas” → frontal/coronal.',
      ],
      footer_rule: 'Três filtros juntos = sagital',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'PLANOS ANATÔMICOS',
      rows: [
        { label: 'Sagital', value: 'Direita × esquerda' },
        { label: 'Frontal / coronal', value: 'Anterior × posterior' },
        { label: 'Transverso / axial', value: 'Superior × inferior' },
      ],
      footer_rule: 'Frontal = coronal; sagital ≠ frontal',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'PLANOS TROCADOS',
      items: [
        {
          label: 'Frontal / coronal',
          detail: 'Cortam frente e trás.',
          correct: 'Não separam direito e esquerdo.',
        },
        {
          label: 'Axial / transversal',
          detail: 'Cortam em fatias horizontais.',
          correct: 'Separação é superior/inferior — não sagital.',
        },
        {
          label: 'Em similares',
          detail: 'Sagital mediano vs parasagital.',
          correct: 'Mediano passa na linha média; paralelo a ele ainda é sagital.',
        },
      ],
      footer_rule: 'Pergunte: quais dois lados o plano cria?',
    },
  ];
  save(slug, q);
}

/** Manguito rotador SITS (E) */
function handcraftManguito() {
  const slug = 'ibfc-enfermagem-nocoes-de-anatomia-1775448291915-0';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_muscular',
    snapshot:
      'Manguito rotador: subescapular, supraespinhal, infraespinhal e redondo menor (SITS). Não inclui deltoide, trapézio, latíssimo nem redondo maior.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Manguito rotador — os quatro',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Quais músculos formam o manguito rotador do ombro?',
          icon: 'Target',
        },
        {
          label: 'Quarteto clássico',
          detail: 'Subscapular, supraespinhal, infraespinhal e redondo menor.',
          icon: 'Dumbbell',
        },
        {
          label: 'Fora do manguito',
          detail: 'Deltoide, trapézio, latíssimo e redondo maior estabilizam/movem o ombro — mas não são o manguito.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Colar deltoide ou redondo maior na lista por serem “do ombro”.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'SITS: Subscapular, Infra, supraespinhal, Teres minor',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Lembrar o quarteto: subscapular + supraespinhal + infraespinhal + redondo menor.',
        'Eliminar A: latíssimo e levantador da escápula não pertencem ao manguito.',
        'Eliminar B: deltoide e trapézio não pertencem ao manguito.',
        'Eliminar C: deltóide menor/trapézio/redondo maior — lista inválida.',
        'Eliminar D: redondo maior, latíssimo e deltoide — fora do manguito.',
        'Validar E: subscapular, supraespinhal, infraespinhal e redondo menor.',
        'Em similares: se aparecer redondo maior na lista, a alternativa cai.',
      ],
      footer_rule: 'Redondo menor entra; redondo maior não',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'MANGUITO ROTADOR',
      rows: [
        { label: 'Subscapular', value: 'Face anterior da escápula' },
        { label: 'Supraespinhal', value: 'Acima da espinha da escápula' },
        { label: 'Infraespinhal', value: 'Abaixo da espinha da escápula' },
        { label: 'Redondo menor', value: 'Fecha o quarteto (≠ redondo maior)' },
      ],
      footer_rule: 'Quatro músculos — sem deltoide/trapézio',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'INTRUSOS DO OMBRO',
      items: [
        {
          label: 'Deltoide / trapézio',
          detail: 'Músculos poderosos do ombro/cintura.',
          correct: 'Não formam o manguito rotador.',
        },
        {
          label: 'Latíssimo do dorso',
          detail: 'Grande do tronco.',
          correct: 'Fora do quarteto SITS.',
        },
        {
          label: 'Redondo maior',
          detail: 'Nome parecido com o menor.',
          correct: 'Redondo maior não é manguito; o menor sim.',
        },
        {
          label: 'Em similares',
          detail: 'Levantador da escápula.',
          correct: 'Move a escápula — não faz parte do manguito.',
        },
      ],
      footer_rule: 'Liste os quatro — qualquer intruso anula',
    },
  ];
  save(slug, q);
}

/** Osteotomia no joelho = transferir carga (B) */
function handcraftOsteotomia() {
  const slug = 'ibfc-enfermagem-nocoes-de-anatomia-1775448291915-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Osteotomia ao redor do joelho: objetivo principal = transferir carga de um compartimento doente para um sadio (realinhamento).',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Osteotomia ao redor do joelho',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Objetivo principal da osteotomia ao redor do joelho.',
          icon: 'Target',
        },
        {
          label: 'Transferência de carga',
          detail: 'Desviar a carga de um compartimento doente para um compartimento sadio.',
          icon: 'Scale',
        },
        {
          label: 'Não é outro sítio',
          detail: 'Subtalar, coluna ou cabeça femoral apontam outros procedimentos/objetivos.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Confundir com redução/fixação de fratura ou descompressão da cabeça femoral.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Joelho: realinhar para aliviar o compartimento doente',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Isolar o sítio: osteotomia ao redor do joelho.',
        'Eliminar A: articulação subtalar é do pé/tornozelo — outro território.',
        'Eliminar C: coluna — outro segmento.',
        'Eliminar D: redução/fixação descreve tratamento de fratura — não o objetivo clássico dessa osteotomia.',
        'Eliminar E: cabeça femoral — outro procedimento/objetivo.',
        'Validar B: transferência de carga de compartimento doente para sadio.',
        'Em similares: osteotomia tibial/femoral no joelho = redistribuir carga, não “consertar fratura”.',
      ],
      footer_rule: 'Objetivo = redistribuir carga no joelho',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'OSTEOTOMIA DO JOELHO',
      rows: [
        { label: 'Objetivo', value: 'Transferir carga doente → sadio' },
        { label: 'Ideia', value: 'Realinhamento mecânico do joelho' },
        { label: 'Não confundir', value: 'Fixação de fratura / outros sítios (quadril, coluna, pé)' },
      ],
      footer_rule: 'Carga muda de compartimento',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'OBJETIVOS DE OUTROS PROCEDIMENTOS',
      items: [
        {
          label: 'Subtalar / coluna / cabeça femoral',
          detail: 'Outros sítios anatômicos.',
          correct: 'Fora do objetivo da osteotomia ao redor do joelho.',
        },
        {
          label: 'Redução e fixação de fraturas',
          detail: 'Trauma agudo.',
          correct: 'Não é o objetivo principal dessa osteotomia de realinhamento.',
        },
        {
          label: 'Em similares',
          detail: 'Artroplastia vs osteotomia.',
          correct: 'Artroplastia substitui a articulação; osteotomia redistribui carga.',
        },
      ],
      footer_rule: 'Sítio joelho + transferência de carga',
    },
  ];
  save(slug, q);
}

/** Ossos planos: esterno, costela (A) */
function handcraftOssosPlanos() {
  const slug = 'ibfc-enfermagem-nocoes-de-anatomia-1775448291915-2';
  const q = load(slug);
  enrichMeta(q, {
    family: 'conceito',
    branch: 'anat_esqueleto',
    snapshot:
      'Ossos planos: esterno, costelas (e muitos do crânio). Vértebras = irregulares; cuboide/navicular/semilunar = curtos; fêmur/ulna = longos.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Exemplos de ossos planos',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Assinale exemplos de ossos planos.',
          icon: 'Target',
        },
        {
          label: 'Esterno e costela',
          detail: 'Ossos chatos do tórax — classificação clássica de planos.',
          icon: 'Bone',
        },
        {
          label: 'Outras classes',
          detail: 'Vértebras = irregulares; carpais/tarsais = curtos; fêmur/ulna = longos.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Colocar vértebra ou osso curto do pé/punho como “plano”.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Plano = chato (esterno, costela…)',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Critério: ossos planos.',
        'Eliminar B: vértebras são irregulares; cuneiforme é curto.',
        'Eliminar C e D: cuboide, navicular, semilunar, pisiforme = curtos.',
        'Eliminar E: fêmur e ulna = longos.',
        'Validar A: esterno, costela.',
        'Em similares: parietal/frontal também são planos — costela/esterno são o par clássico de tórax.',
      ],
      footer_rule: 'Classifique antes de marcar o par',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'CLASSIFICAÇÃO ÓSSEA RÁPIDA',
      rows: [
        { label: 'Planos', value: 'Esterno, costelas, muitos do crânio' },
        { label: 'Longos', value: 'Fêmur, ulna, tíbia…' },
        { label: 'Curtos', value: 'Carpo/tarso (navicular, semilunar…)' },
        { label: 'Irregulares', value: 'Vértebras' },
      ],
      footer_rule: 'Esterno + costela = planos',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'CLASSES ERRADAS',
      items: [
        {
          label: 'Vértebras',
          detail: 'Parecem “chatas” em desenho.',
          correct: 'Classificação clássica = irregulares.',
        },
        {
          label: 'Cuboide / navicular / semilunar',
          detail: 'Ossos do pé/punho.',
          correct: 'São curtos — não planos.',
        },
        {
          label: 'Fêmur / ulna',
          detail: 'Ossos longos.',
          correct: 'Fora da classe plana.',
        },
        {
          label: 'Em similares',
          detail: 'Escápula.',
          correct: 'Escápula também é plana — mas nesta lista o par certo é esterno/costela.',
        },
      ],
      footer_rule: 'Um osso da classe errada invalida o par',
    },
  ];
  save(slug, q);
}

/** Poplíteo no dorso do pé — Errado (B) */
function handcraftPopliteo() {
  const slug = 'idecan-enfermagem-nocoes-de-anatomia-1778712122855-1';
  const q = load(slug);
  enrichMeta(q, {
    family: 'certo_errado',
    branch: 'anat_generico',
    snapshot:
      'Pulso poplíteo = fossa poplítea (atrás do joelho). Dorso do pé = pulso pedioso (artéria dorsal do pé) — não poplíteo.',
  });
  q.reverse_study_slides = [
    {
      type: 'concept_map',
      slide_title: 'Pulso poplíteo — onde fica?',
      meta: META_SLIDE,
      items: [
        {
          label: 'Cenário da prova',
          detail: 'Item C/E: o pulso poplíteo fica no dorso do pé?',
          icon: 'Target',
        },
        {
          label: 'Poplíteo',
          detail: 'Território da fossa poplítea — face posterior do joelho.',
          icon: 'MapPin',
        },
        {
          label: 'Dorso do pé',
          detail: 'Lá se palpamos o pulso pedioso (dorsal do pé) — outro vaso.',
          icon: 'GitCompare',
        },
        {
          label: 'PEGADINHA-ÂNCORA',
          detail: 'Trocar poplíteo por pedioso só porque ambos são do membro inferior.',
          icon: 'AlertTriangle',
        },
      ],
      footer_rule: 'Poplíteo = atrás do joelho; pedioso = dorso do pé',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: META_SLIDE,
      steps: [
        'Ler o item: poplíteo no dorso do pé.',
        'Local clássico do poplíteo: fossa poplítea (atrás do joelho).',
        'Dorso do pé = território do pedioso — não do poplíteo.',
        'Concluir: o item está errado → alternativa B.',
        'Em similares: se disser poplíteo na face posterior do joelho, marque Certo.',
      ],
      footer_rule: 'Território errado = item errado',
    },
    {
      type: 'golden_rule',
      meta: META_SLIDE,
      content: 'PULSOS DO MI — MARCOS',
      rows: [
        { label: 'Poplíteo', value: 'Fossa poplítea (atrás do joelho)' },
        { label: 'Pedioso (dorsal do pé)', value: 'Dorso do pé' },
        { label: 'Tibial posterior', value: 'Retromaleolar medial' },
      ],
      footer_rule: 'Nome do pulso = marco anatômico',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: META_SLIDE,
      content: 'TROCAS DE PULSO NO PÉ/JOELHO',
      items: [
        {
          label: 'Poplíteo no dorso do pé',
          detail: 'Afirmação da prova.',
          correct: 'Poplíteo é atrás do joelho — no dorso do pé está o pedioso.',
        },
        {
          label: 'Confundir com tibial posterior',
          detail: 'Também no tornozelo/pé.',
          correct: 'Tibial posterior é retromaleolar — outro marco.',
        },
        {
          label: 'Em similares',
          detail: 'Radial no cotovelo.',
          correct: 'Mesma lógica: nome do pulso amarra o território — não chute o segmento.',
        },
      ],
      footer_rule: 'Joelho ≠ dorso do pé',
    },
  ];
  save(slug, q);
}

function main() {
  handcraftLuxacao();
  handcraftSagital();
  handcraftManguito();
  handcraftOsteotomia();
  handcraftOssosPlanos();
  handcraftPopliteo();
  console.log('[handcraft:anat-g06] done 6/6');
}

main();
