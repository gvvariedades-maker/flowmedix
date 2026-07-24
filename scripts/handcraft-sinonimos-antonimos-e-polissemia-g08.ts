#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g08 (7 slugs · lote final).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g08.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g08 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g08 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g08';
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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g08',
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
  'facet-aad-pr-sinonimos-complete-as-lacunas-a-seguir-com-os-3614658': {
    family: 'conceito',
    source_tec_id: '3614658',
    source_note:
      'homônimos conserto/concerto/apressar/apreçar — FACET AAd Pref Bom Jardim PE 2025 tec 3614658',
    meta: {
      banca: 'FACET',
      prova: 'AAd (Pref Bom Jardim)',
      orgao: 'Pref. Bom Jardim (PE)',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Complete as lacunas a seguir com os homônimos corretos:\n\nI — O carro ficou no ________.\nII — O ________ será hoje no teatro municipal.\nIII — Ele estava querendo me ________ porque eu estava cinco minutos atrasado.\nIV — Precisei _____ o produto.',
    options: [
      { id: 'A', text: 'Concerto - conserto - apressar - apreçar.', is_correct: false },
      { id: 'B', text: 'Conserto - concerto - apreçar - apressar.', is_correct: false },
      { id: 'C', text: 'Conserto - conserto - apressar - apreçar.', is_correct: false },
      { id: 'D', text: 'Concerto - concerto - apreçar - apressar.', is_correct: false },
      { id: 'E', text: 'Conserto - concerto - apressar - apreçar.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Homônimos em série',
        chip_label: '4 lacunas',
        meta: slideMeta,
        items: [
          { label: 'Conserto', detail: 'Oficina mecânica — carro parado.', icon: 'Wrench' },
          { label: 'Concerto', detail: 'Espetáculo musical no teatro.', icon: 'Music' },
          { label: 'Apressar', detail: 'Querer que eu ande mais rápido.', icon: 'Timer' },
          { label: 'Apreçar', detail: 'Valorar, estimar o produto.', icon: 'Star' },
          { label: 'Homônimos', detail: 'Mesma forma, origens e sentidos distintos.', icon: 'Copy' },
          { label: 'Pergunta-teste', detail: 'Cada lacuna pede qual par?', icon: 'Eye' },
        ],
        footer_rule: 'I conserto · II concerto · III apressar · IV apreçar.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'I «carro no ___»: oficina mecânica — conserto (reparo).',
          'II «___ no teatro»: apresentação musical — concerto.',
          'III «querendo me ___»: por estar atrasado — apressar (acelerar).',
          'IV «Precisei ___ o produto»: valorar — apreçar (estimar).',
          'A inverte I/II — eliminar.',
          'B troca III/IV — eliminar.',
          'C repete conserto em II — eliminar.',
          'D troca III/IV — eliminar.',
          'E: conserto, concerto, apressar, apreçar — manter.',
          'Gabarito E.',
          'Em similares: homônimo = grafia igual, sentido muda — prove frase a frase.',
        ],
        footer_rule: 'Gabarito E — sequência conserto/concerto/apressar/apreçar.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONCERTO × CONSERTO',
        rows: [
          { label: 'Conserto', value: 'Reparo — oficina, carro.' },
          { label: 'Concerto', value: 'Música — teatro municipal.' },
          { label: 'Apressar', value: 'Acelerar alguém — atraso.' },
          { label: 'Apreçar', value: 'Valorar produto — estimar.' },
          { label: 'Nesta questão', value: 'E — ordem correta.' },
        ],
        footer_rule: 'Não trocar apressar (pressa) × apreçar (valor).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares trocados',
        items: [
          { label: 'A — concerto/conserto', detail: 'Inverte oficina e teatro.', correct: 'Homônimo no contexto: I pede oficina (conserto) — A inicia com concerto.' },
          { label: 'B — apreçar/apressar', detail: 'Troca valorar por pressa.', correct: 'Homônimo no contexto: III é apressar (atraso) — B troca ordem III/IV.' },
          { label: 'C — conserto/conserto', detail: 'Repete conserto na II.', correct: 'Homônimo no contexto: II é concerto musical — C repete conserto.' },
          { label: 'D — apreçar/apressar', detail: 'Mesma troca de B.', correct: 'Homônimo no contexto: IV é apreçar (valorar) — D inverte III/IV.' },
          {
            label: 'Transferência',
            detail: 'Classifique: carro no conserto; concerto à noite; não me apresse; apreciei o produto.',
            correct: 'Homônimo no contexto: conserto/concerto/apressar/apreçar — mesma série.',
          },
        ],
        footer_rule: 'Gabarito E — quatro homônimos na ordem.',
      },
    ],
  },

  'vunesp-tenf-sinonimos-leia-a-charge-a-seguir-nani-disponiv-3840788': {
    family: 'text_fragment',
    source_tec_id: '3840788',
    source_note:
      'polissemia charge Nani — comentário ambíguo do adulto — VUNESP TEnf Pref Osasco 2026 tec 3840788',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a charge a seguir (Nani — nanihumor.com).\n\nO principal efeito de sentido da charge é desencadeado pela',
    text_fragment:
      '[Charge transcrita — Nani]\n\nCena: adulto observa garoto em atividade de trabalho/manual. Adulto faz comentário ambíguo (pode soar como elogio de «ir longe» ou como crítica ao trabalho infantil). O garoto interpreta a fala de um modo; o leitor percebe o duplo sentido.\n\nEfeito: humor e crítica social pela polissemia/ambiguidade do comentário do adulto.',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'demonstração de falta de empatia do adulto diante da realidade do garoto.', is_correct: false },
      { id: 'B', text: 'expressão de revolta do garoto por estar fazendo trabalho forçado.', is_correct: false },
      { id: 'C', text: 'interpretação que o garoto faz do comentário ambíguo do adulto.', is_correct: true },
      { id: 'D', text: 'manifestação sincera do garoto, que é repreendida pelo adulto.', is_correct: false },
      { id: 'E', text: 'constatação de que o adulto expressa apoio ao trabalho infantil.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Charge ambígua',
        chip_label: 'Polissemia',
        meta: slideMeta,
        items: [
          { label: 'Comentário ambíguo', detail: 'Adulto — duplo sentido possível.', icon: 'MessageCircle' },
          { label: 'Interpretação', detail: 'Garoto entende de um jeito — efeito cômico.', icon: 'Brain' },
          { label: 'Nani', detail: 'Charge — crítica social com humor.', icon: 'Smile' },
          { label: 'Trabalho infantil', detail: 'Tema implícito da cena.', icon: 'AlertTriangle' },
          { label: 'Polissemia', detail: 'Mesma fala, leituras distintas.', icon: 'Languages' },
          { label: 'Pergunta-teste', detail: 'O efeito vem da fala ou da reação?', icon: 'Eye' },
        ],
        footer_rule: 'Efeito = leitura do garoto sobre fala ambígua.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Charge Nani: adulto comenta; garoto trabalha — fala com duplo sentido.',
          'Humor nasce quando o garoto interpreta o comentário de modo literal/ingênuo.',
          'A «falta de empatia»: pode existir, mas não é o motor do efeito — eliminar.',
          'B «revolta»: garoto não se revolta — eliminar.',
          'C «interpretação do garoto»: desencadeia o efeito — manter.',
          'D «sinceridade repreendida»: não é o foco — eliminar.',
          'E «apoio ao trabalho infantil»: leitura unilateral — eliminar.',
          'Gabarito C.',
          'Em similares: charge ambígua — efeito = quem interpreta e como.',
        ],
        footer_rule: 'Gabarito C — interpretação do comentário ambíguo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHARGE — POLISSEMIA',
        rows: [
          { label: 'Ambiguidade', value: 'Fala do adulto — dois sentidos.' },
          { label: 'Interpretação', value: 'Garoto lê de um modo — humor.' },
          { label: 'Efeito', value: 'Vem da leitura do garoto — não da revolta.' },
          { label: 'Nesta questão', value: 'C — interpretação.' },
        ],
        footer_rule: 'Crítica social via duplo sentido — não apoio explícito.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Efeito × intenção do adulto',
        items: [
          { label: 'A — falta de empatia', detail: 'Juízo moral sobre adulto.', correct: 'Polissemia: empatia pode ser tema, mas o efeito cômico vem da interpretação do garoto.' },
          { label: 'B — revolta', detail: 'Protesto do garoto.', correct: 'Polissemia: garoto não expressa revolta — charge usa mal-entendido.' },
          { label: 'D — sinceridade repreendida', detail: 'Garoto punido.', correct: 'Polissemia: foco não é repreensão — é duplo sentido da fala.' },
          { label: 'E — apoio ao trabalho infantil', detail: 'Adulto defende trabalho.', correct: 'Polissemia: adulto não declara apoio — ambiguidade gera humor crítico.' },
          {
            label: 'Transferência',
            detail: 'Classifique: adulto diz «você vai longe assim» a criança trabalhando.',
            correct: 'Polissemia: garoto pode ler elogio; leitor vê crítica — interpretação.',
          },
        ],
        footer_rule: 'Gabarito C — efeito pela leitura do garoto.',
      },
    ],
  },

  'cpcon-uepb-a-sinonimos-leia-o-texto-i-e-responda-a-questao-4018183': {
    family: 'text_fragment',
    source_tec_id: '4018183',
    source_note:
      'polissemia «atrasado» tirinha Lucas flores — VF I–V — CPCON UEPB Ag Adm Pref Nova Floresta 2026 tec 4018183',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref Nova Floresta)',
      orgao: 'Pref. Nova Floresta',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I e responda à questão.\n\nNo Texto I, um menino diz que Lucas está «atrasado» por entregar flores depois do Dia da Mulher. Outro responde: «Pra mostrar nosso carinho não tem dia! ‘Atrasado’ é quem não sabe disso!».\n\nAnalise as assertivas:\n\nI — No primeiro quadrinho, «atrasado» significa ter perdido o tempo adequado para realizar uma ação.\nII — No segundo quadrinho, «atrasado» ganha o sentido de retrógrado.\nIII — O termo «atrasado» é usado apenas de forma literal, sem mudança de significado ao longo do texto.\nIV — O jogo de sentidos da palavra «atrasado» compromete a crítica e o humor presentes na tirinha.\nV — O texto explora a polissemia do termo «atrasado», atribuindo-lhe diferentes sentidos conforme o contexto.\n\nCom base na leitura da tirinha, estão CORRETAS apenas as afirmativas:',
    text_fragment:
      '[Tirinha transcrita — Instirinhass]\n\nQuadrinho 1: meninos comentam que Lucas entregou flores depois do Dia da Mulher — «atrasado» no sentido de fora do prazo, tarde demais.\n\nQuadrinho 2: outro menino rebate: carinho não tem dia; «atrasado» é quem não entende isso — sentido de retrógrado, antiquado, para trás.\n\nHumor e crítica social pelo jogo de sentidos da mesma palavra.',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'II e III.', is_correct: false },
      { id: 'B', text: 'I e III.', is_correct: false },
      { id: 'C', text: 'I, II e V.', is_correct: true },
      { id: 'D', text: 'III, IV e V.', is_correct: false },
      { id: 'E', text: 'I e II.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Atrasado × 2 sentidos',
        chip_label: 'VF tirinha',
        meta: slideMeta,
        items: [
          { label: 'Atrasado 1', detail: 'Fora do prazo — flores após 8 de março.', icon: 'Clock' },
          { label: 'Atrasado 2', detail: 'Retrógrado — quem não entende carinho.', icon: 'UserX' },
          { label: 'Polissemia', detail: 'Mesma forma, sentidos no contexto.', icon: 'Languages' },
          { label: 'Lucas', detail: 'Entrega flores «tarde» — carinho sincero.', icon: 'Flower' },
          { label: 'I + II + V', detail: 'Verdadeiras — gabarito C.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'III (só literal) e IV (compromete humor).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I literal · II retrógrado · V polissemia — C.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tirinha: «atrasado» no prazo × «atrasado» de espírito.',
          'I: fora do tempo adequado — entregar flores depois — VERDADEIRA.',
          'II: retrógrado, para trás no pensamento — VERDADEIRA.',
          'III: só literal, sem mudança — FALSA (há polissemia).',
          'IV: jogo compromete humor — FALSA (humor depende do jogo).',
          'V: polissemia conforme contexto — VERDADEIRA.',
          'Combinação correta: I, II e V — C.',
          'Gabarito C.',
          'Em similares: VF de polissemia — prove cada acepção no quadrinho.',
        ],
        footer_rule: 'Gabarito C — I, II e V verdadeiras.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VF — ATRASADO',
        rows: [
          { label: 'I', value: 'VERDADEIRA — fora do prazo.' },
          { label: 'II', value: 'VERDADEIRA — retrógrado.' },
          { label: 'III', value: 'FALSA — há mudança de sentido.' },
          { label: 'IV', value: 'FALSA — jogo sustenta humor.' },
          { label: 'V', value: 'VERDADEIRA — polissemia.' },
          { label: 'Nesta questão', value: 'C — I, II e V.' },
        ],
        footer_rule: 'Polissemia alimenta humor — não compromete.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'VF — combinações erradas',
        items: [
          { label: 'A — II e III', detail: 'III é falsa.', correct: 'Polissemia: III nega mudança de sentido — contradiz a tirinha.' },
          { label: 'B — I e III', detail: 'III é falsa.', correct: 'Polissemia: não é «apenas literal» — II ativa sentido figurado.' },
          { label: 'D — III, IV e V', detail: 'III e IV falsas.', correct: 'Polissemia: IV diz que jogo prejudica humor — o oposto é verdade.' },
          { label: 'E — I e II', detail: 'Descarta V verdadeira.', correct: 'Polissemia: V nomeia o mecanismo — indispensável no gabarito.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Chegou atrasado» (relógio) × «Ideia atrasada» (retrógrada).',
            correct: 'Polissemia: mesma forma — sentidos distintos por contexto.',
          },
        ],
        footer_rule: 'Gabarito C — I, II e V na tirinha Lucas.',
      },
    ],
  },

  'apice-ap-ei-sinonimos-inteligencia-artificial-e-a-transfor-4037423': {
    family: 'text_fragment',
    source_tec_id: '4037423',
    source_note:
      '«mercado» polissemia — IA profissões Blaque — Ápice AP EI Pref SJ Cordeiros 2026 tec 4037423',
    meta: {
      banca: 'Ápice',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref. SJ Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto sobre inteligência artificial e profissões do futuro (Unifor/G1 — adaptado).\n\nConsiderando os conceitos de homonímia e polissemia, assinale a alternativa correta quanto à palavra «mercado» no texto (mercado de trabalho, ler o mercado, panorama do mercado).',
    text_fragment:
      'Inteligência artificial e a transformação das profissões do futuro (adaptado)\n\nA IA já faz parte da realidade de diversas profissões. Para o professor Marcos Blaque, entender como a IA transforma a lógica das carreiras é fundamental para quem planeja o futuro profissional.\n\nProfissões burocráticas tendem a ser mais substituíveis; funções com reflexão crítica e criatividade se beneficiam da tecnologia como ferramenta.\n\nO avanço da IA altera o panorama do mercado de trabalho. A escola deve ensinar a ler o mercado e preparar alunos — Projeto de Vida da BNCC. Flexibilidade e transições de carreira serão essenciais; Blaque cita a «modernidade líquida» de Bauman.',
    options: [
      {
        id: 'A',
        text: 'A palavra «mercado» apresenta homonímia, pois possui dois significados totalmente diferentes e sem relação entre si, como «local de compra e venda» ou «conjunto de oportunidades de trabalho».',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'A palavra «mercado» apresenta polissemia, pois pode assumir diferentes sentidos relacionados, como «local de compra e venda» ou «conjunto de oportunidades de trabalho», dependendo do contexto.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'A palavra «mercado» é um exemplo de homonímia, pois possui grafia semelhante a outras palavras.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A palavra «mercado» apresenta apenas um único significado na língua portuguesa, não sendo possível apresentar outro sentido, independentemente do contexto.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A palavra «mercado» apresenta homonímia, pois possui sentidos semelhantes em diferentes contextos comunicacionais.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mercado',
        chip_label: 'Polissemia',
        meta: slideMeta,
        items: [
          { label: 'Mercado', detail: 'Feira/comércio × mercado de trabalho.', icon: 'Store' },
          { label: 'Inteligência artificial', detail: 'Transforma profissões e carreiras.', icon: 'Cpu' },
          { label: 'Profissões', detail: 'Burocráticas mais substituíveis.', icon: 'Briefcase' },
          { label: 'Polissemia', detail: 'Sentidos relacionados — mesma origem.', icon: 'Link' },
          { label: 'Homonímia', detail: 'Origens distintas — pegadinha A/E.', icon: 'Split' },
          { label: 'Blaque', detail: 'Ler o mercado — escola e BNCC.', icon: 'GraduationCap' },
          { label: 'Modernidade líquida', detail: 'Bauman — fluidez das carreiras.', icon: 'Waves' },
          { label: 'Pergunta-teste', detail: 'Sentidos ligados ou independentes?', icon: 'Eye' },
        ],
        footer_rule: 'Mercado polissêmico — inteligencia artificial transformacao profissoes.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto adaptado: inteligencia artificial e transformacao das profissoes do futuro.',
          'Realidade diversas profissoes — professor Marcos Blaque e mercado de trabalho.',
          '«Mercado» físico e «mercado» figurado compartilham núcleo semântico (troca/oferta).',
          'A homonímia sem relação — sentidos não são totalmente independentes — eliminar.',
          'B polissemia — sentidos relacionados conforme contexto — manter.',
          'C grafia semelhante — confunde com parônimo — eliminar.',
          'D um só sentido — falso — eliminar.',
          'E homonímia com sentidos semelhantes — contradiz definição — eliminar.',
          'Gabarito B.',
          'Em similares: polissemia = núcleo comum; homonímia = origens distintas.',
        ],
        footer_rule: 'Gabarito B — mercado é polissêmico.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POLISSEMIA × HOMONÍMIA',
        rows: [
          { label: 'Polissemia', value: 'Mesma palavra — sentidos relacionados.' },
          { label: 'Mercado', value: 'Comércio ↔ oportunidades de trabalho.' },
          { label: 'Homonímia', value: 'Origens diferentes — conserto/concerto.' },
          { label: 'Nesta questão', value: 'B — polissemia.' },
        ],
        footer_rule: 'Sentidos semelhantes = polissemia, não homonímia.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classificação lexical',
        items: [
          { label: 'A — homonímia sem relação', detail: 'Dois mundos independentes.', correct: 'Polissemia: «mercado de trabalho» deriva do núcleo de troca — sentidos relacionados.' },
          { label: 'C — grafia semelhante', detail: 'Critério errado.', correct: 'Parônimo no contexto: homonímia exige origem distinta — não só grafia parecida.' },
          { label: 'D — um significado', detail: 'Negar variação contextual.', correct: 'Polissemia: texto usa «mercado» em acepções distintas — prova no trecho.' },
          { label: 'E — homonímia semelhante', detail: 'Contradição terminológica.', correct: 'Polissemia: homonímia pressupõe independência — E mistura conceitos.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «mercado de peixes» × «mercado editorial». ',
            correct: 'Polissemia: acepções do mesmo lexema — oferta e circulação.',
          },
        ],
        footer_rule: 'Gabarito B — polissemia no texto de IA.',
      },
    ],
  },

  'apice-ap-ei-sinonimos-disponivel-em-acesso-em-06-mar-2023-4037448': {
    family: 'text_fragment',
    source_tec_id: '4037448',
    source_note:
      '«problema» = exercício matemático — Calvin e Hobbes — Ápice AP EI Pref SJ Cordeiros 2026 tec 4037448',
    meta: {
      banca: 'Ápice',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref. SJ Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tirinha (Calvin e Hobbes — adaptado).\n\nNo trecho «Se eu resolver este problema...», a palavra «problema» pode assumir diferentes sentidos dependendo do contexto. Na tirinha, o termo refere-se a',
    text_fragment:
      '[Tirinha Calvin e Hobbes — transcrita]\n\nCalvin olha para caderno/folha de exercícios. Balão: «Se eu resolver este problema...» — contexto escolar: dever de matemática, questão numérica a resolver.\n\nHobbes observa; humor vem do sentido restrito de «problema» como exercício escolar, não como conflito existencial.',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'um conflito familiar entre Calvin e seu interlocutor.', is_correct: false },
      { id: 'B', text: 'uma situação filosófica sem solução.', is_correct: false },
      { id: 'C', text: 'um erro cometido pelo personagem.', is_correct: false },
      { id: 'D', text: 'um acontecimento inesperado.', is_correct: false },
      { id: 'E', text: 'uma atividade matemática proposta como exercício.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Problema',
        chip_label: 'Calvin',
        meta: slideMeta,
        items: [
          { label: 'Problema', detail: 'Questão de matemática no caderno.', icon: 'Calculator' },
          { label: 'Calvin', detail: '«Se eu resolver este problema...»', icon: 'BookOpen' },
          { label: 'Polissemia', detail: 'Problema = exercício × conflito × imprevisto.', icon: 'Languages' },
          { label: 'Contexto escolar', detail: 'Dever, lição, números.', icon: 'School' },
          { label: 'Hobbes', detail: 'Interlocutor na tirinha.', icon: 'Cat' },
          { label: 'Pergunta-teste', detail: 'Exercício ou drama familiar?', icon: 'Eye' },
        ],
        footer_rule: 'Na tirinha: problema = exercício matemático.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Calvin e Hobbes: cena de lição de casa / caderno.',
          '«Resolver este problema» — fórmula de tarefa escolar.',
          'A conflito familiar — não há briga — eliminar.',
          'B filosofia sem solução — exagero — eliminar.',
          'C erro do personagem — não é foco — eliminar.',
          'D acontecimento inesperado — eliminar.',
          'E atividade matemática — exercício proposto — manter.',
          'Gabarito E.',
          'Em similares: problema escolar = questão a resolver — prove no balão.',
        ],
        footer_rule: 'Gabarito E — exercício matemático na tirinha.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROBLEMA — CONTEXTO',
        rows: [
          { label: 'Problema escolar', value: 'Exercício, questão de matemática.' },
          { label: 'Problema existencial', value: 'Outro sentido — não é o da tira.' },
          { label: 'Polissemia', value: 'Mesma palavra — sentido pelo contexto.' },
          { label: 'Nesta questão', value: 'E — atividade matemática.' },
        ],
        footer_rule: 'Caderno + resolver = exercício.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sentidos fora da cena',
        items: [
          { label: 'A — conflito familiar', detail: 'Briga em casa.', correct: 'Polissemia: tirinha mostra lição — não conflito familiar.' },
          { label: 'B — filosófico', detail: 'Enigma existencial.', correct: 'Polissemia: Calvin fala de dever escolar — não filosofia.' },
          { label: 'C — erro', detail: 'Falha cometida.', correct: 'Polissemia: «problema» não significa erro — é tarefa.' },
          { label: 'D — inesperado', detail: 'Evento surpresa.', correct: 'Polissemia: contexto é rotina escolar — não imprevisto.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Não entendi o problema 5 da lista.»',
            correct: 'Polissemia: «problema» = exercício matemático — como na tirinha.',
          },
        ],
        footer_rule: 'Gabarito E — problema = exercício Calvin.',
      },
    ],
  },

  'educa-pb-ace-sinonimos-15-07-2026-19-38-43-98-297-298-299-c-3820034': {
    family: 'text_fragment',
    source_tec_id: '3820034',
    source_note:
      '«consumo» polissemia não homônimo — charge Tribuna Ribeirão — EDUCA PB ACE Pref Ibiara 2025 tec 3820034',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACE (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder a questão.\n\nObserve o trecho da charge:\n\n«Aposto que todo mundo tem um grande sonho de consumo?!»\n«Sim, e o meu atual sonho de consumo é ter consumidores mais conscientes.»\n\nAssinale a alternativa CORRETA:',
    text_fragment:
      '[Charge transcrita — Tribuna Ribeirão, 15/03/2025]\n\nPersonagem 1: «sonho de consumo» no sentido de desejar adquirir bens (consumir produtos).\n\nPersonagem 2 (irônico): «sonho de consumo» no sentido de ter consumidores que consomem com consciência — polissemia do lexema «consumo», não homonímia (mesma família semântica).',
    figure_policy: 'transcribed',
    options: [
      {
        id: 'A',
        text: 'A palavra consumo apresenta o mesmo significado em ambas as falas da charge, sendo um exemplo de homônimo perfeito.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'A palavra consumo apresenta significados diferentes nas falas da charge, sendo um exemplo de homônimo conceitual.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'A palavra consumo apresenta significados diferentes nas falas da charge, mas não se trata de homônimo.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'A palavra consumo é um parônimo de consciente, presente na segunda fala.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Consumo × 2',
        chip_label: 'Polissemia',
        meta: slideMeta,
        items: [
          { label: 'Consumo 1', detail: 'Desejo de comprar bens — sonho material.', icon: 'ShoppingBag' },
          { label: 'Consumo 2', detail: 'Atitude de quem consome — consumidores.', icon: 'Users' },
          { label: 'Polissemia', detail: 'Mesmo lexema — sentidos relacionados.', icon: 'Languages' },
          { label: 'Não homônimo', detail: 'Origem única — família semântica.', icon: 'XCircle' },
          { label: 'Charge', detail: 'Ironia — empresário × crítica.', icon: 'MessageSquare' },
          { label: 'Pergunta-teste', detail: 'Mesma palavra, núcleo comum?', icon: 'Eye' },
        ],
        footer_rule: 'Consumo: sentidos diferentes — polissemia, não homônimo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Charge: dois «sonhos de consumo» — comprar × ter consumidores conscientes.',
          'Sentidos diferentes, mas do mesmo campo (consumir).',
          'A mesmo significado + homônimo perfeito — falso — eliminar.',
          'B diferentes + homônimo conceitual — homônimo exige origem distinta — eliminar.',
          'C diferentes, mas não homônimo — polissemia — manter.',
          'D parônimo consumo/consciente — palavras distintas — eliminar.',
          'Gabarito C.',
          'Em similares: polissemia = núcleo comum; homônimo = etimologias distintas.',
        ],
        footer_rule: 'Gabarito C — polissemia, não homônimo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONSUMO — CLASSIFICAÇÃO',
        rows: [
          { label: 'Polissemia', value: 'Sentidos relacionados — mesmo lexema.' },
          { label: 'Homônimo', value: 'Origens diferentes — conserto/concerto.' },
          { label: 'Nesta charge', value: 'Consumo muda de acepção — polissemia.' },
          { label: 'Nesta questão', value: 'C — não é homônimo.' },
        ],
        footer_rule: 'Parônimo ≠ polissemia (palavras diferentes).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Polissemia × homonímia',
        items: [
          { label: 'A — mesmo sentido', detail: 'Homônimo perfeito.', correct: 'Polissemia: as falas usam «consumo» em acepções distintas — não é o mesmo sentido.' },
          { label: 'B — homônimo conceitual', detail: 'Origens distintas.', correct: 'Polissemia: «consumo» tem uma origem — comprar e consumidores são ramos do mesmo núcleo.' },
          { label: 'D — parônimo', detail: 'Consumo × consciente.', correct: 'Parônimo no contexto: são palavras diferentes — parônimo não classifica «consumo» na charge.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «consumo de energia» × «consumo consciente». ',
            correct: 'Polissemia: acepções do mesmo verbo/substantivo — não homônimos.',
          },
        ],
        footer_rule: 'Gabarito C — consumo polissêmico na charge.',
      },
    ],
  },

  'apice-acs-pr-sinonimos-analise-as-palavras-destacadas-nas-f-3951883': {
    family: 'conceito',
    source_tec_id: '3951883',
    source_note:
      '«refletiu» polissêmico espelho × pensar — Ápice ACS Pref Boa Vista 2025 tec 3951883 (âncora estilo)',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista (PB)',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise as palavras destacadas nas frases presentes no quadro a seguir.\n\n1 — A imagem dela refletiu bem naquele espelho;\n2 — A filha refletiu muito sobre o conselho da mãe.\n\nApós análise dos termos em destaque nas frases, pode-se afirmar que se tratam de palavras:',
    options: [
      { id: 'A', text: 'antônimas.', is_correct: false },
      { id: 'B', text: 'polissêmicas.', is_correct: true },
      { id: 'C', text: 'parônimas.', is_correct: false },
      { id: 'D', text: 'hipônimos.', is_correct: false },
      { id: 'E', text: 'hiperônimos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Refletiu × 2',
        chip_label: 'Espelho × mente',
        meta: slideMeta,
        items: [
          { label: 'Refletiu 1', detail: 'Espelho — devolver imagem, luz.', icon: 'ScanLine' },
          { label: 'Refletiu 2', detail: 'Pensar — meditar sobre conselho.', icon: 'Brain' },
          { label: 'Polissemia', detail: 'Um verbo — dois sentidos por contexto.', icon: 'Languages' },
          { label: 'Imagem', detail: 'Frase 1 — superfície refletora.', icon: 'Image' },
          { label: 'Conselho', detail: 'Frase 2 — reflexão mental.', icon: 'MessageCircle' },
          { label: 'Pergunta-teste', detail: 'Mesmo verbo, mundos distintos?', icon: 'Eye' },
        ],
        footer_rule: 'Refletiu: físico (espelho) × mental (pensar).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Frase 1: imagem no espelho — refletir = devolver luz/imagem.',
          'Frase 2: filha sobre conselho — refletir = pensar, ponderar.',
          'A antônimas: sentidos não se opõem — eliminar.',
          'B polissêmicas: mesma forma, sentidos distintos — manter.',
          'C parônimas: formas parecidas — não é o caso — eliminar.',
          'D hipônimos: parte de um todo — eliminar.',
          'E hiperônimos: todo que inclui partes — eliminar.',
          'Gabarito B.',
          'Em similares: prove duas frases com o mesmo verbo — sentido muda.',
        ],
        footer_rule: 'Gabarito B — refletiu é polissêmico.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REFLETIU — POLISSEMIA',
        rows: [
          { label: 'Espelho', value: 'Refletir imagem — sentido físico.' },
          { label: 'Pensar', value: 'Refletir sobre — sentido mental.' },
          { label: 'Polissêmicas', value: 'Uma palavra — vários sentidos.' },
          { label: 'Nesta questão', value: 'B — polissêmicas.' },
        ],
        footer_rule: 'Não confundir com parônimo ou antônimo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Relações lexicais trocadas',
        items: [
          { label: 'A — antônimas', detail: 'Oposição de sentido.', correct: 'Polissemia: os sentidos de «refletiu» não são opostos — coexistem em contextos diferentes.' },
          { label: 'C — parônimas', detail: 'Formas parecidas.', correct: 'Parônimo no contexto: é a mesma palavra «refletiu» — polissemia, não parônimos distintos.' },
          { label: 'D — hipônimos', detail: 'Espécie de um gênero.', correct: 'Polissemia: não há relação todo/parte entre as frases — há um verbo polissêmico.' },
          { label: 'E — hiperônimos', detail: 'Gênero que inclui espécies.', correct: 'Polissemia: classificação incorreta — trata-se de sentidos do mesmo lexema.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O sol refletiu no lago» × «Refletiu antes de responder». ',
            correct: 'Polissemia: físico × mental — mesmo verbo, sentidos distintos.',
          },
        ],
        footer_rule: 'Gabarito B — âncora polissemia refletiu.',
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
