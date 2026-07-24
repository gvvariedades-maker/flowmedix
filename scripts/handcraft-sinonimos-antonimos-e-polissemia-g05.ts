#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g05 (8 slugs · lote 5).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g05.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g05 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g05 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g05';
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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g05',
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
  'vunesp-ag-pr-sinonimos-leia-o-texto-a-seguir-para-responder-3583390': {
    family: 'text_fragment',
    source_tec_id: '3583390',
    source_note:
      '«mesmo quando» ≈ «até no caso em que» — cuidadoras idosos Minayo — VUNESP Ag Pref Itatiba Trânsito 2025 tec 3583390',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba — Trânsito)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nEm «E, mesmo quando seu trabalho é banhado de amor e reconhecimento...» (2º parágrafo), o trecho em destaque pode ser substituído, sem prejuízo do sentido original e da correção gramatical, por:',
    text_fragment:
      'Cuidar de quem cuida de idosos dependentes — Maria Cecília de Souza Minayo (adaptado)\n\nCuidar decorre das expectativas sociais sobre o conceito cultural de família e continua a ser parte das obrigações femininas. Costuma acontecer que, nas famílias, uma mulher é escolhida como cuidadora pela pessoa de quem cuida, ou é autoescolhida, ou, ainda, exerce sua função por falta de outra opção.\n\nNo Brasil, o espectro de idade delas vai de 26 a 86 anos. São mulheres que abrem mão da vida pessoal, profissional, social e afetiva. E, mesmo quando seu trabalho é banhado de amor e reconhecimento, ela se empobrece do ponto de vista econômico e social e passa a ter, desde então, uma existência restrita e confinada, unicamente dedicada ao familiar em situação de dependência. As que são apoiadas por algum tipo de renda consideram esse aporte insuficiente. E as que vivem com pouca renda reduzem as opções de suporte frente à carga das necessidades. A maioria afirma que não recebe ajuda de ninguém e nenhuma recompensa econômica por sua dedicação.\n\nCuidar sempre afeta a vida da cuidadora. Existem evidências de que o comprometimento cognitivo e a doença mental do idoso são mais onerosos do que os problemas físicos para quem cuida deles.',
    options: [
      { id: 'A', text: 'de fato assim que', is_correct: false },
      { id: 'B', text: 'visto que', is_correct: false },
      { id: 'C', text: 'desde que', is_correct: false },
      { id: 'D', text: 'até no caso em que', is_correct: true },
      { id: 'E', text: 'na medida em que', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mesmo quando',
        chip_label: 'Conectivo',
        meta: slideMeta,
        items: [
          { label: 'Mesmo quando', detail: 'Concessão temporal — até na situação em que.', icon: 'Clock' },
          { label: 'Até no caso em que', detail: 'Equivalência — limite inclusivo da condição.', icon: 'GitBranch' },
          { label: 'Banhado de amor', detail: 'Trecho em destaque — 2º parágrafo Minayo.', icon: 'Heart' },
          { label: 'Reconhecimento', detail: 'Amor não impede empobrecimento da cuidadora.', icon: 'Award' },
          { label: 'Cuidadoras', detail: 'Texto Minayo — trabalho e dedicação feminina.', icon: 'HeartHandshake' },
          { label: 'Pergunta-teste', detail: 'A troca mantém «mesmo na hipótese de»?', icon: 'HelpCircle' },
          { label: 'Pegadinha', detail: 'Trocar por visto que (causa) ou desde que (condição).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mesmo quando ≈ até no caso em que — concessão inclusiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Minayo: cuidadoras de idosos — amor e reconhecimento não eliminam restrição.',
          'Trecho em destaque: «mesmo quando seu trabalho é banhado de amor e reconhecimento».',
          '«Mesmo quando» introduz situação em que algo ocorre apesar de outro fator.',
          'A «de fato assim que»: sequência temporal — não cobre concessão — eliminar.',
          'B «visto que»: causa — não substitui «mesmo quando» — eliminar.',
          'C «desde que»: condição exigida — sentido distinto — eliminar.',
          'D «até no caso em que»: equivalência concessiva — manter.',
          'E «na medida em que»: proporcionalidade — eliminar.',
          'Gabarito D.',
          'Em similares: mesmo quando ≈ até no caso em que — prove na frase da cuidadora.',
        ],
        footer_rule: 'D: até no caso em que.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MESMO QUANDO',
        rows: [
          { label: 'Mesmo quando', value: 'Concessão — «até na situação em que».' },
          { label: 'Até no caso em que', value: 'Sinônimo próximo — limite inclusivo.' },
          { label: 'Visto que', value: 'Causa — não substitui concessão.' },
          { label: 'Nesta questão', value: 'D — até no caso em que.' },
        ],
        footer_rule: 'Desde que = condição — ≠ mesmo quando.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Conectivos de função distinta',
        items: [
          { label: 'A — de fato assim que', detail: 'Sequência temporal.', correct: 'Sinônimo no contexto: «de fato assim que» não substitui concessão de «mesmo quando».' },
          { label: 'B — visto que', detail: 'Causalidade.', correct: 'Sinônimo no contexto: «visto que» indica causa — função distinta da concessão.' },
          { label: 'C — desde que', detail: 'Condição exigida.', correct: 'Sinônimo no contexto: «desde que» exige condição — não equivale a «mesmo quando».' },
          { label: 'E — na medida em que', detail: 'Proporcionalidade.', correct: 'Sinônimo no contexto: «na medida em que» indica grau — não cobre «mesmo quando».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Mesmo quando elogiada, a cuidadora sente sobrecarga.»',
            correct: 'Sinônimo no contexto: «até no caso em que» — concessão inclusiva.',
          },
        ],
        footer_rule: 'D: até no caso em que.',
      },
    ],
  },

  'selecon-acs-sinonimos-leia-o-texto-a-seguir-para-responder-3586810': {
    family: 'text_fragment',
    source_tec_id: '3586810',
    source_note:
      '«de acordo com» ≈ «em conformidade com» — Oscar 2026 Variety — SELECON ACS Pref Barra do Bugres 2025 tec 3586810',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (Pref Barra do Bugres)',
      orgao: 'Pref. Barra do Bugres',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nDe acordo com a revista «Variety», a Academia vai monitorar a atividade de visualização por meio de sua plataforma de streaming exclusiva para membros, a Academy Screening Room (3º parágrafo). O termo em destaque poderia ser substituído, sem alteração de sentido, por:',
    text_fragment:
      'Oscar 2026: mudança de regra exige que votantes assistam a todos os filmes indicados (adaptado)\n\nA Academia anunciou uma nova regra para o Oscar 2026. A partir de agora, para que os membros se tornem aptos a votar, será necessário assistir a todos os filmes da categoria, algo que não era obrigatório antes.\n\n«Em uma mudança de procedimento, os membros da Academia agora devem assistir a todos os filmes indicados em cada categoria para serem elegíveis para votar na rodada final do Oscar», informou a organização.\n\nDe acordo com a revista «Variety», a Academia vai monitorar a atividade de visualização por meio de sua plataforma de streaming exclusiva para membros, a Academy Screening Room. Caso os votantes assistam aos longas em festivais, exibições ou eventos privados, será necessário enviar um formulário para comprovação.\n\nNa época da premiação deste ano, fontes anônimas revelaram que não assistiram a todas as obras indicadas nas respectivas categorias que votavam. Entre os filmes mencionados estava o brasileiro «Ainda Estou Aqui».',
    options: [
      { id: 'A', text: 'Em correlação com', is_correct: false },
      { id: 'B', text: 'Em contradição com', is_correct: false },
      { id: 'C', text: 'Em comparação com', is_correct: false },
      { id: 'D', text: 'Em conformidade com', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'De acordo com',
        chip_label: 'Fonte',
        meta: slideMeta,
        items: [
          { label: 'De acordo com', detail: 'Conforme informação da revista Variety.', icon: 'Newspaper' },
          { label: 'Em conformidade com', detail: 'Alinhado ao que a fonte diz.', icon: 'CheckCircle' },
          { label: 'Variety', detail: 'Revista citada — Oscar 2026, votação.', icon: 'Film' },
          { label: 'Academy Screening', detail: 'Plataforma de streaming da Academia.', icon: 'Monitor' },
          { label: 'Monitorar visualização', detail: 'Academia exige assistir filmes indicados.', icon: 'Eye' },
          { label: 'Pergunta-teste', detail: 'A troca mantém «segundo a fonte»?', icon: 'HelpCircle' },
          { label: 'Pegadinha', detail: 'Trocar por contradição ou comparação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'De acordo com ≈ em conformidade com.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Oscar 2026: Academia monitora visualização na Academy Screening Room.',
          '«De acordo com a revista Variety» — citação de fonte jornalística.',
          '«De acordo com» = segundo, conforme a informação da fonte.',
          'A «em correlação com»: relação estatística — não cobre citação — eliminar.',
          'B «em contradição com»: oposto — eliminar.',
          'C «em comparação com»: paralelo entre coisas — eliminar.',
          'D «em conformidade com»: alinhado à fonte — equivalência — manter.',
          'Gabarito D.',
          'Em similares: de acordo com ≈ em conformidade com/segundo — prove na citação.',
        ],
        footer_rule: 'D: em conformidade com.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DE ACORDO COM',
        rows: [
          { label: 'De acordo com', value: 'Segundo, conforme fonte citada.' },
          { label: 'Em conformidade com', value: 'Sinônimo próximo — alinhamento à fonte.' },
          { label: 'Em contradição com', value: 'Antônimo de função — pegadinha.' },
          { label: 'Nesta questão', value: 'D — em conformidade com.' },
        ],
        footer_rule: 'Comparação ≠ citação de fonte.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Relações semânticas trocadas',
        items: [
          { label: 'A — correlação', detail: 'Relação entre variáveis.', correct: 'Sinônimo no contexto: «em correlação com» não substitui citação de fonte jornalística.' },
          { label: 'B — contradição', detail: 'Oposição.', correct: 'Antônimo no contexto: «em contradição com» inverte o sentido de «de acordo com».' },
          { label: 'C — comparação', detail: 'Paralelo entre elementos.', correct: 'Sinônimo no contexto: «em comparação com» indica paralelo — não citação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «De acordo com o relatório, a regra mudou.»',
            correct: 'Sinônimo no contexto: «em conformidade com» — segundo a fonte.',
          },
        ],
        footer_rule: 'D: em conformidade com.',
      },
    ],
  },

  'vunesp-acs-p-sinonimos-leia-o-texto-a-seguir-para-responder-3607115': {
    family: 'text_fragment',
    source_tec_id: '3607115',
    source_note:
      '«em potencial» ≈ possíveis — almas gêmeas Randall Munroe — VUNESP ACS Pref Osasco 2025 tec 3607115',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nEm «Dado que você tem 500 milhões de almas gêmeas em potencial…» (3º parágrafo), a expressão destacada pode ser substituída, mantendo o sentido original, por:',
    text_fragment:
      'E se? — Randall Munroe (adaptado)\n\nE se todo mundo realmente tivesse uma alma gêmea, que fosse uma pessoa aleatória em qualquer lugar do mundo?\n\nResposta: seria um pesadelo. Vamos supor que sua alma gêmea fosse determinada ao nascer. Você não sabe nada sobre a pessoa, quem é ou onde está, mas — como diz o clichê — vocês se reconhecerão num cruzar de olhares.\n\nSe fôssemos emparelhados aleatoriamente, 90% de nossas almas gêmeas estariam mortas há muito tempo. Um argumento bem simples demonstra que também temos que incluir um número incontável de seres humanos do futuro.\n\nEntão vamos supor que vocês vivam na mesma época e na mesma faixa etária. Considerando a restrição de faixa etária, a maioria da humanidade teria uma reserva de aproximadamente meio bilhão de combinações possíveis.\n\nAs chances de se deparar com seu par perfeito seriam absurdamente pequenas. O número de estranhos com os quais estabelecemos contato visual por dia varia de quase zero a muitos milhares, mas vamos supor que todo dia você troque olhares com uma média de poucas dezenas de gente que nunca viu. Se 10% deles estão próximos da sua idade, isso daria 50 mil pessoas numa vida. Dado que você tem 500 milhões de almas gêmeas em potencial, quer dizer que só encontraria o verdadeiro amor em uma vida a cada 10 mil.',
    options: [
      { id: 'A', text: 'naturais', is_correct: false },
      { id: 'B', text: 'próximas', is_correct: false },
      { id: 'C', text: 'possíveis', is_correct: true },
      { id: 'D', text: 'preponderantes', is_correct: false },
      { id: 'E', text: 'reais', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Em potencial',
        chip_label: 'Almas gêmeas',
        meta: slideMeta,
        items: [
          { label: 'Em potencial', detail: 'Que pode vir a ser — hipotético.', icon: 'Sparkles' },
          { label: 'Possíveis', detail: 'Que podem ocorrer — equivalência.', icon: 'Users' },
          { label: 'Randall Munroe', detail: '«E se?» — cálculo probabilístico.', icon: 'Calculator' },
          { label: '500 milhões', detail: 'Combinações hipotéticas de pares.', icon: 'Hash' },
          { label: 'Pergunta-teste', detail: 'A troca mantém «que podem existir»?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por reais (efetivos) ou próximas (espaço).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Em potencial ≈ possíveis — hipótese, não fato.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Munroe: almas gêmeas aleatórias — cálculo de probabilidade.',
          '«Em potencial» = que poderiam ser, hipoteticamente.',
          'A «naturais»: inerentes — não cobre hipótese — eliminar.',
          'B «próximas»: perto geograficamente — eliminar.',
          'C «possíveis»: que podem ocorrer — equivalência — manter.',
          'D «preponderantes»: predominantes — eliminar.',
          'E «reais»: efetivos, existentes — oposto de potencial — eliminar.',
          'Gabarito C.',
          'Em similares: em potencial ≈ possíveis — prove no cálculo de combinações.',
        ],
        footer_rule: 'C: possíveis.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EM POTENCIAL',
        rows: [
          { label: 'Em potencial', value: 'Hipotético — que pode vir a ser.' },
          { label: 'Possíveis', value: 'Sinônimo — combinações que podem ocorrer.' },
          { label: 'Reais', value: 'Efetivos — antônimo de potencial.' },
          { label: 'Nesta questão', value: 'C — possíveis.' },
        ],
        footer_rule: 'Reais ≠ em potencial.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Potencial × efetivo',
        items: [
          { label: 'A — naturais', detail: 'Inerentes, espontâneos.', correct: 'Sinônimo no contexto: «naturais» não substitui «em potencial» (hipotético).' },
          { label: 'B — próximas', detail: 'Perto em espaço.', correct: 'Sinônimo no contexto: «próximas» indica distância — não potencialidade.' },
          { label: 'D — preponderantes', detail: 'Predominantes.', correct: 'Sinônimo no contexto: «preponderantes» não cobre «em potencial».' },
          { label: 'E — reais', detail: 'Efetivos, existentes.', correct: 'Antônimo no contexto: «reais» opõe-se a hipotético/potencial.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Há mil candidatos em potencial para a vaga.»',
            correct: 'Sinônimo no contexto: «possíveis» — que podem vir a ser.',
          },
        ],
        footer_rule: 'C: possíveis.',
      },
    ],
  },

  'vunesp-ade-g-sinonimos-leia-o-texto-para-responder-a-questa-3607399': {
    family: 'text_fragment',
    source_tec_id: '3607399',
    source_note:
      'desolador≈desanimador; pífio≈insignificante — mobilidade social IMDS — VUNESP ADE Guararapes 2025 tec 3607399',
    meta: {
      banca: 'VUNESP',
      prova: 'ADE (Pref Guararapes)',
      orgao: 'Pref. Guararapes',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão abaixo.\n\nConsidere as passagens:\n\n• «O estudo sobre mobilidade intergeracional traça um cenário bastante desolador...» (2º parágrafo)\n• «Os indicadores de educação apontam que a qualidade do ensino brasileiro é baixa, com desempenho pífio em avaliações nacionais e internacionais.» (6º parágrafo)\n\nOs termos destacados significam, correta e respectivamente,',
    text_fragment:
      'Crianças condenadas à estagnação (Estadão — adaptado)\n\nA probabilidade de um brasileiro nascer pobre e morrer pobre é alta. Menos de 2% das crianças cujos pais estão entre os 50% mais pobres do País alcançarão a renda dos 10% mais ricos. E o mais provável é que 66% delas ainda estejam na mesma faixa dos ascendentes quando chegarem à fase adulta da vida.\n\nEssas projeções são do recém-lançado Atlas da Mobilidade Social do Brasil, do Instituto Mobilidade e Desenvolvimento Social (IMDS). O estudo sobre mobilidade intergeracional traça um cenário bastante desolador, haja vista que a imobilidade social no País parece ser a regra.\n\nDe acordo com o estudo, a mobilidade social é ainda difícil para as crianças do sexo feminino, negras e do Norte do País. Tudo isso indica que o Brasil desonrou compromissos firmados com o seu povo por meio da Constituição federal de 1988.\n\nO ideal seria o país investir na primeira infância. Apesar disso, o Brasil não alcançou nem mesmo a meta de colocar 50% das crianças de zero a 3 anos na creche.\n\nSe o País não cuida bem das crianças menores, tampouco cuida das maiores. Os indicadores de educação apontam que a qualidade do ensino brasileiro é baixa, com desempenho pífio em avaliações nacionais e internacionais. O Brasil terá de fazer escolhas para romper esse ciclo.',
    options: [
      { id: 'A', text: 'devastador; esplendoroso.', is_correct: false },
      { id: 'B', text: 'desanimador; insignificante.', is_correct: true },
      { id: 'C', text: 'desmotivador; contundente.', is_correct: false },
      { id: 'D', text: 'deslumbrante; equilibrado.', is_correct: false },
      { id: 'E', text: 'desmistificador; humilhante.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Desolador × pífio',
        chip_label: 'Par duplo',
        meta: slideMeta,
        items: [
          { label: 'Desolador', detail: 'Que desanima, deprime — cenário social.', icon: 'CloudRain' },
          { label: 'Desanimador', detail: 'Que tira ânimo — sinônimo de desolador.', icon: 'Frown' },
          { label: 'Intergeracional', detail: 'Mobilidade social — probabilidade de estagnação.', icon: 'BarChart' },
          { label: 'Mobilidade', detail: 'Atlas IMDS — brasileiro nascer pobre.', icon: 'TrendingDown' },
          { label: 'Pífio', detail: 'Fraco, insignificante — desempenho escolar.', icon: 'Minus' },
          { label: 'Insignificante', detail: 'Sem relevância — sinônimo de pífio.', icon: 'Scale' },
          { label: 'Crianças', detail: 'Texto «condenadas à estagnação» — educação.', icon: 'Baby' },
          { label: 'Pegadinha', detail: 'Trocar desolador por deslumbrante ou pífio por contundente.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Desolador ≈ desanimador; pífio ≈ insignificante.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto mobilidade social: probabilidade de brasileiro nascer pobre — crianças condenadas à estagnação.',
          '1º: «cenário desolador» = que desanima, deprime — mobilidade intergeracional.',
          '2º: «desempenho pífio» = fraco, insignificante.',
          'A «devastador/esplendoroso»: 2º par elogia — eliminar.',
          'B «desanimador/insignificante»: equivalência dupla — manter.',
          'C «desmotivador/contundente»: contundente = forte — oposto de pífio — eliminar.',
          'D «deslumbrante/equilibrado»: deslumbrante elogia — eliminar.',
          'E «desmistificador/humilhante»: campos distintos — eliminar.',
          'Gabarito B.',
          'Em similares: desolador ≈ desanimador; pífio ≈ insignificante — prove nos trechos.',
        ],
        footer_rule: 'B: desanimador + insignificante.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DESOLADOR × PÍFIO',
        rows: [
          { label: 'Desolador', value: 'Desanimador, deprimente — cenário.' },
          { label: 'Pífio', value: 'Insignificante, fraco — desempenho.' },
          { label: 'Contundente', value: 'Forte — antônimo de pífio.' },
          { label: 'Nesta questão', value: 'B — desanimador / insignificante.' },
        ],
        footer_rule: 'Pífio ≠ contundente.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par errado no 2º termo',
        items: [
          { label: 'A — esplendoroso', detail: 'Brilhante, magnífico.', correct: 'Antônimo no contexto: «esplendoroso» elogia — pífio critica desempenho fraco.' },
          { label: 'C — contundente', detail: 'Forte, decisivo.', correct: 'Antônimo no contexto: «contundente» opõe-se a «pífio» (fraco).' },
          { label: 'D — deslumbrante', detail: 'Encantador.', correct: 'Antônimo no contexto: «deslumbrante» não cobre cenário «desolador».' },
          { label: 'E — humilhante', detail: 'Que envergonha.', correct: 'Sinônimo no contexto: «humilhante» não equivale a «pífio» (insignificante).' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O relatório é desolador; o resultado foi pífio.»',
            correct: 'Sinônimo no contexto: «desanimador» e «insignificante» — par da questão.',
          },
        ],
        footer_rule: 'B: desanimador + insignificante.',
      },
    ],
  },

  'cpcon-uepb-a-sinonimos-leia-o-texto-i-para-responder-a-ques-3651720': {
    family: 'text_fragment',
    source_tec_id: '3651720',
    source_note:
      'atenuar ressaca ≈ amenizar — Lygia Telles «As formigas» — CPCON UEPB Ag Adm Pref São Bentinho 2025 tec 3651720',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref São Bentinho)',
      orgao: 'Pref. São Bentinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I para responder à questão abaixo.\n\nMarque a alternativa que apresenta um sinônimo adequado para o termo «atenuar», empregado no trecho: «Ela foi buscar uma pílula para atenuar minha ressaca» (6º parágrafo), mantendo o sentido no contexto.',
    text_fragment:
      'Texto I — As formigas, de Lygia Fagundes Telles (adaptado)\n\nFicamos olhando a trilha rapidíssima, tão apertada que nela não caberia sequer um grão de poeira. Pulei-a com o maior cuidado quando fui esquentar o chá. Uma formiguinha desgarrada sacudia a cabeça entre as mãos. Comecei a rir e tanto que se o chão não estivesse ocupado, rolaria por ali de tanto rir. Dormimos juntas na minha cama.\n\nVoltei tarde essa noite, um colega tinha se casado e teve festa. Vim animada, com vontade de cantar, passei da conta. Só na escada é que me lembrei: o anão. Minha prima arrastara a mesa para a porta e estudava com o bule fumegando no fogareiro.\n\n— Hoje não vou dormir, quero ficar de vigia — ela avisou.\n\n— Estou com medo.\n\nEla foi buscar uma pílula para atenuar minha ressaca, me fez engolir a pílula com um gole de chá e ajudou a me despir.\n\n— Fico vigiando, pode dormir sossegada.\n\nTombei na cama. No topo da escada o anão me agarrou pelos pulsos e rodopiou comigo até o quarto. Acorda, acorda! Demorei para reconhecer minha prima que me segurava pelos cotovelos.\n\n— Voltaram — ela disse. Quando acordei, a trilha já estava em plena movimentação.',
    options: [
      { id: 'A', text: '«intensificar».', is_correct: false },
      { id: 'B', text: '«agravar».', is_correct: false },
      { id: 'C', text: '«amenizar».', is_correct: true },
      { id: 'D', text: '«estimular».', is_correct: false },
      { id: 'E', text: '«substituir».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Atenuar a ressaca',
        chip_label: 'São Bentinho',
        meta: slideMeta,
        items: [
          { label: 'Atenuar', detail: 'Suavizar, tornar menos intenso.', icon: 'Droplets' },
          { label: 'Amenizar', detail: 'Aliviar, tornar mais leve.', icon: 'Heart' },
          { label: 'Ressaca', detail: 'Mal-estar pós-festa — contexto da pílula.', icon: 'Moon' },
          { label: 'Lygia Telles', detail: '«As formigas» — conto de terror doméstico.', icon: 'BookOpen' },
          { label: 'Prima vigia', detail: 'Cuida da narradora após a festa.', icon: 'Shield' },
          { label: 'Pegadinha', detail: 'Trocar por intensificar ou agravar (antônimos).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Atenuar ressaca ≈ amenizar — aliviar o mal-estar.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Conto Telles: narradora volta da festa — prima busca pílula para a ressaca.',
          '«Atenuar» = diminuir intensidade do mal-estar.',
          'A «intensificar»: aumentar — antônimo — eliminar.',
          'B «agravar»: piorar — antônimo — eliminar.',
          'C «amenizar»: aliviar, suavizar — equivalência — manter.',
          'D «estimular»: ativar — oposto — eliminar.',
          'E «substituir»: trocar por outra coisa — eliminar.',
          'Gabarito C.',
          'Em similares: atenuar ≈ amenizar/aliviar — prove na pílula da ressaca.',
        ],
        footer_rule: 'C: amenizar.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ATENUAR',
        rows: [
          { label: 'Atenuar', value: 'Suavizar, diminuir intensidade.' },
          { label: 'Amenizar', value: 'Aliviar — sinônimo no contexto.' },
          { label: 'Agravar', value: 'Piorar — antônimo.' },
          { label: 'Nesta questão', value: 'C — amenizar.' },
        ],
        footer_rule: 'Intensificar/agravar = antônimos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Antônimos onde pede sinônimo',
        items: [
          { label: 'A — intensificar', detail: 'Aumentar a intensidade.', correct: 'Antônimo no contexto: «intensificar» piora a ressaca — oposto de atenuar.' },
          { label: 'B — agravar', detail: 'Tornar mais grave.', correct: 'Antônimo no contexto: «agravar» aumenta o mal-estar — não ameniza.' },
          { label: 'D — estimular', detail: 'Ativar, provocar.', correct: 'Antônimo no contexto: «estimular» não alivia ressaca — função oposta.' },
          { label: 'E — substituir', detail: 'Trocar por outro.', correct: 'Sinônimo no contexto: «substituir» não cobre «atenuar» (suavizar).' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O remédio atenuou a dor de cabeça.»',
            correct: 'Sinônimo no contexto: «amenizou» — tornou menos intensa.',
          },
        ],
        footer_rule: 'C: amenizar.',
      },
    ],
  },

  'cpcon-uepb-a-sinonimos-leia-o-texto-i-para-responder-a-ques-3654539': {
    family: 'text_fragment',
    source_tec_id: '3654539',
    source_note:
      'atenuar ressaca ≈ amenizar — Lygia Telles «As formigas» ACS — CPCON UEPB ACS Pref R Sto Antônio 2025 tec 3654539',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref R Sto Antônio)',
      orgao: 'Pref. R Sto Antônio',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I para responder à questão abaixo.\n\nMarque a alternativa que apresenta um sinônimo adequado para o termo «atenuar», empregado no trecho: «Ela foi buscar uma pílula para atenuar minha ressaca» (6º parágrafo), mantendo o sentido no contexto.',
    text_fragment:
      'As formigas — Lygia Fagundes Telles (adaptado)\n\n(...)\n\nFicamos olhando a trilha rapidíssima, tão apertada que nela não caberia sequer um grão de poeira. Pulei-a com o maior cuidado quando fui esquentar o chá. Uma formiguinha desgarrada sacudia a cabeça entre as mãos. Dormimos juntas na minha cama. Ela dormia ainda quando saí para a primeira aula.\n\nVoltei tarde essa noite, um colega tinha se casado e teve festa. Vim animada, passei da conta. Minha prima arrastara a mesa para a porta e estudava com o bule fumegando no fogareiro. O assoalho ainda estava limpo.\n\nEla foi buscar uma pílula para atenuar minha ressaca, me fez engolir a pílula com um gole de chá e ajudou a me despir. Examinei com a lupa debaixo da porta — sabe que não consigo descobrir de onde brotam?\n\nTombei na cama. Acorda, acorda! Estava lívida. E vesga. — Voltaram — ela disse, num tom miúdo, como se uma formiguinha falasse com sua voz. Quando acordei, a trilha já estava em plena movimentação.',
    options: [
      { id: 'A', text: '«intensificar».', is_correct: false },
      { id: 'B', text: '«agravar».', is_correct: false },
      { id: 'C', text: '«amenizar».', is_correct: true },
      { id: 'D', text: '«estimular».', is_correct: false },
      { id: 'E', text: '«substituir».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pílula e ressaca',
        chip_label: 'R Sto Antônio',
        meta: slideMeta,
        items: [
          { label: 'Atenuar', detail: 'Reduzir intensidade — verbo-chave.', icon: 'MinusCircle' },
          { label: 'Amenizar', detail: 'Tornar mais suave — resposta certa.', icon: 'Feather' },
          { label: 'Formiguinha', detail: 'Trilha das formigas — vigia noturna.', icon: 'Bug' },
          { label: 'Trilha', detail: 'Movimentação no assoalho — conto Telles.', icon: 'Route' },
          { label: 'Pílula + chá', detail: 'Cuidado da prima após a festa.', icon: 'Pill' },
          { label: 'Pergunta-teste', detail: 'O verbo mantém «aliviar o mal»?', icon: 'HelpCircle' },
          { label: 'Pegadinha', detail: 'Escolher antônimo (agravar) por não ler o contexto.', icon: 'Ban' },
        ],
        footer_rule: 'No trecho da pílula: atenuar = amenizar.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Conto «As formigas»: festa, ressaca, prima vigia a trilha das formiguinhas.',
          'Trecho: prima busca pílula para «atenuar» ressaca — aliviar mal-estar.',
          'Função do verbo: diminuir sintoma — não intensificar.',
          'A «intensificar» e B «agravar»: antônimos diretos — eliminar.',
          'C «amenizar»: suavizar, aliviar — equivalência — manter.',
          'D «estimular»: ativar — fora do sentido — eliminar.',
          'E «substituir»: trocar objeto — não cobre atenuar — eliminar.',
          'Gabarito C.',
          'Em similares: atenuar dor/ressaca ≈ amenizar — prove no cuidado da prima.',
        ],
        footer_rule: 'C: amenizar.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ATENUAR × AMENIZAR',
        rows: [
          { label: 'Atenuar', value: 'Diminuir força ou intensidade.' },
          { label: 'Amenizar', value: 'Aliviar, suavizar — sinônimo.' },
          { label: 'Agravar', value: 'Antônimo — piorar o mal.' },
          { label: 'Nesta questão', value: 'C — amenizar.' },
        ],
        footer_rule: 'Pílula ameniza — não agrava.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Verbos de sentido oposto',
        items: [
          { label: 'A — intensificar', detail: 'Aumentar.', correct: 'Antônimo no contexto: intensificar a ressaca contradiz o gesto de cuidado da prima.' },
          { label: 'B — agravar', detail: 'Piorar.', correct: 'Antônimo no contexto: agravar é oposto de aliviar com a pílula.' },
          { label: 'D — estimular', detail: 'Provocar reação.', correct: 'Sinônimo no contexto: «estimular» não substitui «atenuar» no mal-estar.' },
          { label: 'E — substituir', detail: 'Trocar por outro item.', correct: 'Sinônimo no contexto: «substituir» não equivale a suavizar a ressaca.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A sombra atenuou o calor do meio-dia.»',
            correct: 'Sinônimo no contexto: «amenizou» — tornou menos intenso.',
          },
        ],
        footer_rule: 'C: amenizar.',
      },
    ],
  },

  'avancasp-fon-sinonimos-leia-o-texto-a-seguir-para-responder-3665282': {
    family: 'text_fragment',
    source_tec_id: '3665282',
    source_note:
      'exótico≈excêntrico; graça≈brincadeira — televizinho Roberto Pompeu Toledo — AVANÇASP Fono FMSRC 2025 tec 3665282',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Fono (FMSRC)',
      orgao: 'FMSRC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\n«Acha que se está aqui inventando vocábulo exótico, só para fazer graça?»\n\nAssinale a alternativa que apresenta, na mesma ordem, palavras sinônimas para os vocábulos destacados no trecho acima.',
    text_fragment:
      'Saudade do televizinho — Roberto Pompeu Toledo (Veja — adaptado)\n\nHouve tempo em que havia o televizinho. Será que sobra algum televizinho? Televizinho era a pessoa que, não tendo televisão em casa, se aproveitava da do vizinho. O jovem leitor duvida? Acha que se está aqui inventando vocábulo exótico, só para fazer graça? Pois corra aos dicionários. A palavra ali está, tanto no Aurélio como no Houaiss.\n\nOs dicionários têm isso de bom: conservam as palavras em desuso como os sedimentos conservam os fósseis. Neles repousam, em sono esplêndido, palavras como bufarinheiro e alcouceira, mandrana e parvajola.\n\nQuem viveu os primeiros anos da televisão sabe que o fenômeno da televizinhança não foi desprezível. Poucos tinham televisores em casa. O televizinho era um tipo social definido e reconhecido em seus direitos e sua individualidade. Os próprios apresentadores da TV se referiam a eles. Davam boa noite «aos televizinhos».\n\nDepois, ele desapareceu — como a figura do agregado nos romances do século XIX. As famílias livraram-se do agregado e, em seguida, do excesso de filhos. Mas iam-se multiplicando os aparelhos de TV. Ninguém mais deixava de tê-los. O televizinho de antes agora tinha seu próprio aparelho. O vocábulo que o identificava virou forma sem conteúdo.',
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
          { label: 'Exótico', detail: 'Estranho, fora do comum — vocábulo raro.', icon: 'Globe' },
          { label: 'Excêntrico', detail: 'Fora do centro, peculiar — sinônimo.', icon: 'Orbit' },
          { label: 'Graça', detail: 'Piada, brincadeira — tom irônico.', icon: 'Smile' },
          { label: 'Brincadeira', detail: 'Zombaria leve — sinônimo de graça.', icon: 'Laugh' },
          { label: 'Toledo', detail: 'Crônica «Saudade do televizinho».', icon: 'Tv' },
          { label: 'Pegadinha', detail: 'Trocar graça por inveja ou exótico por comum.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Exótico ≈ excêntrico; graça ≈ brincadeira.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica Toledo: defende «televizinho» contra leitor cético.',
          '«Vocábulo exótico» = palavra estranha, fora do comum.',
          '«Só para fazer graça» = só para brincar, zombar.',
          'A «raro/inveja»: inveja ≠ graça — eliminar.',
          'B «comum/dádiva»: comum ≠ exótico — eliminar.',
          'C «excêntrico/brincadeira»: equivalência dupla — manter.',
          'D «desnaturado/raiva»: raiva ≠ graça — eliminar.',
          'E «malfeito/favor»: campos distintos — eliminar.',
          'Gabarito C.',
          'Em similares: exótico ≈ excêntrico; graça ≈ brincadeira — prove na ironia do autor.',
        ],
        footer_rule: 'C: excêntrico + brincadeira.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXÓTICO × GRAÇA',
        rows: [
          { label: 'Exótico', value: 'Estranho, peculiar — excêntrico.' },
          { label: 'Graça', value: 'Piada, ironia — brincadeira.' },
          { label: 'Comum', value: 'Antônimo de exótico — pegadinha.' },
          { label: 'Nesta questão', value: 'C — excêntrico / brincadeira.' },
        ],
        footer_rule: 'Graça = brincadeira — não inveja.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par errado no 2º termo',
        items: [
          { label: 'A — inveja', detail: 'Ciúme, ressentimento.', correct: 'Sinônimo no contexto: «inveja» não substitui «graça» (brincadeira/piada).' },
          { label: 'B — comum', detail: 'Ordinário, usual.', correct: 'Antônimo no contexto: «comum» opõe-se a «exótico» (estranho).' },
          { label: 'D — raiva', detail: 'Ira, fúria.', correct: 'Sinônimo no contexto: «raiva» não cobre «fazer graça» (brincar).' },
          { label: 'E — favor', detail: 'Bondade, benefício.', correct: 'Sinônimo no contexto: «favor» não equivale a «graça» no sentido de piada.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Não é exótico inventar palavra — é graça do texto.»',
            correct: 'Sinônimo no contexto: «excêntrico» e «brincadeira» — par da crônica.',
          },
        ],
        footer_rule: 'C: excêntrico + brincadeira.',
      },
    ],
  },

  'selecon-ass-sinonimos-leia-o-texto-a-seguir-a-fruta-que-aj-3692804': {
    family: 'text_fragment',
    source_tec_id: '3692804',
    source_note:
      '«de acordo com» ≈ Segundo — laranjas vitamina C — SELECON Ass Adm Pref Tapurah 2025 tec 3692804',
    meta: {
      banca: 'SELECON',
      prova: 'Ass Adm (Pref Tapurah)',
      orgao: 'Pref. Tapurah',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir.\n\n«De acordo com pesquisas realizadas pela Universidade de Nottingham, a vitamina C atua como um agente antioxidante que neutraliza esses radicais livres» (3º parágrafo). O único conectivo que pode substituir a expressão em destaque, sem alteração de sentido, é:',
    text_fragment:
      'A fruta que ajuda a eliminar toxinas e reduz a inflamação nas vias aéreas (adaptado)\n\nDiante do aumento de doenças respiratórias e da crescente exposição a poluentes ambientais, especialistas em saúde recomendam dar mais atenção ao cuidado com os pulmões. Uma opção simples, acessível e com respaldo científico é o consumo de laranjas.\n\nAs laranjas estão entre as frutas mais ricas em vitamina C, um micronutriente essencial para combater o estresse oxidativo, especialmente nos pulmões. A exposição constante a poluentes atmosféricos gera radicais livres, que danificam as células pulmonares e provocam inflamação crônica.\n\nDe acordo com pesquisas realizadas pela Universidade de Nottingham, a vitamina C atua como um agente antioxidante que neutraliza esses radicais livres. Seu consumo frequente ajuda a reduzir a inflamação nas vias respiratórias.\n\nAlém disso, o European Respiratory Journal publicou um estudo que associa uma dieta rica em frutas cítricas a uma redução de 30% no risco de desenvolver doenças pulmonares obstrutivas. Cada laranja fornece mais de 90% do valor diário recomendado de vitamina C.',
    options: [
      { id: 'A', text: 'Segundo', is_correct: true },
      { id: 'B', text: 'Ademais', is_correct: false },
      { id: 'C', text: 'Outrossim', is_correct: false },
      { id: 'D', text: 'Consequentemente', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'De acordo com',
        chip_label: 'Laranjas',
        meta: slideMeta,
        items: [
          { label: 'De acordo com', detail: 'Cita pesquisas da Universidade de Nottingham.', icon: 'FileText' },
          { label: 'Segundo', detail: 'Conforme a fonte — equivalência.', icon: 'Quote' },
          { label: 'Nottingham', detail: 'Universidade citada — estudo científico.', icon: 'GraduationCap' },
          { label: 'Laranjas', detail: 'Vitamina C antioxidante — pulmões.', icon: 'Citrus' },
          { label: 'Toxinas', detail: 'Texto: eliminar toxinas, inflamacao nas vias aereas.', icon: 'Shield' },
          { label: 'Diante do aumento', detail: 'Doencas respiratorias — crescente exposicao a poluentes.', icon: 'TrendingUp' },
          { label: 'Radicais livres', detail: 'Neutralizados pela vitamina C.', icon: 'Zap' },
          { label: 'Pergunta-teste', detail: 'A troca mantém citação de estudo?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por ademais (acréscimo) ou consequentemente (efeito).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'De acordo com ≈ Segundo — citação de fonte.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto adaptado: diante do aumento de doencas respiratorias — eliminar toxinas, inflamacao nas vias aereas.',
          'Pesquisas da Universidade de Nottingham — vitamina C antioxidante.',
          '«De acordo com pesquisas…» = segundo as pesquisas — cita fonte.',
          'A «Segundo»: equivalência direta — manter.',
          'B «Ademais»: acrescenta informação — função distinta — eliminar.',
          'C «Outrossim»: além disso — adição — eliminar.',
          'D «Consequentemente»: indica consequência — eliminar.',
          'Gabarito A.',
          'Em similares: de acordo com ≈ segundo/conforme — prove na citação científica.',
        ],
        footer_rule: 'A: Segundo — citação de fonte.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DE ACORDO COM × SEGUNDO',
        rows: [
          { label: 'De acordo com', value: 'Cita fonte, estudo ou autoridade.' },
          { label: 'Segundo', value: 'Sinônimo — conforme a fonte.' },
          { label: 'Ademais', value: 'Acrescenta — não cita fonte.' },
          { label: 'Nesta questão', value: 'A — Segundo.' },
        ],
        footer_rule: 'Consequentemente = efeito — ≠ citação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Conectivos de função distinta',
        items: [
          { label: 'B — Ademais', detail: 'Além disso, acrescenta.', correct: 'Sinônimo no contexto: «ademais» adiciona informação — não substitui citação de pesquisa.' },
          { label: 'C — Outrossim', detail: 'Também, igualmente.', correct: 'Sinônimo no contexto: «outrossim» indica acréscimo — função distinta.' },
          { label: 'D — Consequentemente', detail: 'Por isso, como resultado.', correct: 'Sinônimo no contexto: «consequentemente» indica efeito — não cita fonte.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «De acordo com o médico, laranjas fortalecem a imunidade.»',
            correct: 'Sinônimo no contexto: «Segundo» — conforme a autoridade citada.',
          },
        ],
        footer_rule: 'A: Segundo — conforme Nottingham.',
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
