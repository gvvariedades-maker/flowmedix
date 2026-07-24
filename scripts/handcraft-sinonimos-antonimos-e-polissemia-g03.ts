#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g03 (8 slugs · lote 3).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g03.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g03 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g03 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g03';
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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g03',
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
  'avancasp-acs-sinonimos-leia-o-texto-a-seguir-para-responder-4003498': {
    family: 'text_fragment',
    source_tec_id: '4003498',
    source_note: '«desbravar» ≈ «explorar» — turismo espacial UOL/Estúdio Folha — AVANÇASP ACS Pref Taiúva 2026 tec 4003498',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nNo trecho «… a ideia de desbravar o espaço …», a palavra destacada poderia ser substituída, sem alteração significativa de sentido, por:',
    text_fragment:
      'Turismo espacial: o que esperar da próxima década (UOL/Estúdio Folha — adaptado)\n\nEmpresas privadas aceleram planos para levar turistas além da atmosfera terrestre. A ideia de desbravar o espaço deixa de ser ficção e passa a integrar roteiros de viagem de alto custo. Especialistas alertam para riscos, impacto ambiental e a necessidade de regulamentação internacional. Ainda assim, bilionários e agências já vendem assentos em voos suborbitais como experiência exclusiva.',
    options: [
      { id: 'A', text: 'dizimar.', is_correct: false },
      { id: 'B', text: 'amansar.', is_correct: false },
      { id: 'C', text: 'explorar.', is_correct: true },
      { id: 'D', text: 'aniquilar.', is_correct: false },
      { id: 'E', text: 'desconhecer.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Desbravar o espaço',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Desbravar', detail: 'Abrir caminho, ir onde poucos foram — espaço.', icon: 'Rocket' },
          { label: 'Explorar', detail: 'Percorrer, investigar território novo.', icon: 'Compass' },
          { label: 'Turismo espacial', detail: 'Texto UOL/Folha — voos suborbitais.', icon: 'Globe' },
          { label: 'Pergunta-teste', detail: 'Qual verbo mantém «ir ao espaço»?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por «aniquilar/dizimar» (destruição).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Prove a troca no trecho sobre turismo espacial.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: turismo espacial, voos suborbitais, desbravar o espaço.',
          '«Desbravar» = abrir caminho, ir explorar território inédito.',
          'A «dizimar»: destruir em massa — campo de aniquilação — eliminar.',
          'B «amansar»: domar, suavizar — não encaixa espaço — eliminar.',
          'C «explorar»: percorrer/investigar — equivalência direta — manter.',
          'D «aniquilar»: destruir totalmente — oposto do sentido — eliminar.',
          'E «desconhecer»: ignorar — contradiz a ação de ir — eliminar.',
          'Gabarito C.',
          'Em similares: desbravar território ≈ explorar — prove no contexto de viagem.',
        ],
        footer_rule: 'Desbravar ≈ explorar no trecho.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DESBRAVAR × EXPLORAR',
        rows: [
          { label: 'Desbravar', value: 'Abrir caminho; ir onde poucos foram.' },
          { label: 'Explorar', value: 'Percorrer, investigar território novo.' },
          { label: 'Pergunta-teste', value: 'A troca mantém a ideia de ir ao espaço?' },
          { label: 'Nesta questão', value: 'C — explorar.' },
        ],
        footer_rule: 'Dizimar/aniquilar = destruição — fora do texto.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Verbos de destruição ou negação',
        items: [
          { label: 'A — dizimar', detail: 'Destruir em grande número.', correct: 'Antônimo no contexto: «dizimar» implica destruição — não «ir ao espaço».' },
          { label: 'B — amansar', detail: 'Domar, suavizar — campo distinto.', correct: 'Sinônimo no contexto: «amansar» não substitui «desbravar o espaço».' },
          { label: 'D — aniquilar', detail: 'Eliminar por completo.', correct: 'Antônimo no contexto: aniquilar destrói — contradiz turismo.' },
          { label: 'E — desconhecer', detail: 'Não conhecer — inação.', correct: 'Sinônimo no contexto: «desconhecer» não encaixa em ir explorar.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Os navegadores desbravaram novas rotas marítimas.»',
            correct: 'Sinônimo no contexto: «exploraram» — abriram caminho em território novo.',
          },
        ],
        footer_rule: 'C: explorar.',
      },
    ],
  },

  'apice-ap-ei-sinonimos-inteligencia-artificial-e-a-transfor-4037426': {
    family: 'conceito',
    source_tec_id: '4037426',
    source_note: '«transformação» ≈ alteração — IA e Blaque Unifor — Ápice AP EI Pref SJ Cordeiros 2026 tec 4037426',
    meta: {
      banca: 'Ápice',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref. São João dos Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nInteligência artificial e a transformação do trabalho (Unifor — adaptado)\n\nA inteligência artificial deixa de ser promessa distante e passa a reorganizar rotinas em escritórios, fábricas e escolas. Especialistas falam em transformação profunda das relações de trabalho: tarefas repetitivas migram para algoritmos, enquanto profissões exigem novas competências. O cantor Blaque, citado no debate cultural, lembra que toda revolução tecnológica rearranja papéis — e que cabe à sociedade discutir quem ganha e quem perde nesse processo.\n\nNo contexto do texto, a palavra "transformação" poderia ser substituída, sem alteração significativa de sentido, por:',
    options: [
      { id: 'A', text: 'permanência.', is_correct: false },
      { id: 'B', text: 'paralisação.', is_correct: false },
      { id: 'C', text: 'estagnação.', is_correct: false },
      { id: 'D', text: 'conservação.', is_correct: false },
      { id: 'E', text: 'alteração.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Transformação digital',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Transformação', detail: 'Mudança profunda — IA reorganiza trabalho.', icon: 'RefreshCw' },
          { label: 'Alteração', detail: 'Modificação de estado — equivalência lexical.', icon: 'Edit' },
          { label: 'IA', detail: 'Texto Unifor — algoritmos, novas competências.', icon: 'Cpu' },
          { label: 'Blaque', detail: 'Debate cultural — revolução tecnológica.', icon: 'Mic' },
          { label: 'Pegadinha', detail: 'Trocar por «permanência/estagnação» (oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Transformação = mudança — não paralisia.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Unifor: IA reorganiza trabalho, revolução tecnológica, Blaque.',
          '«Transformação profunda» = mudança estrutural das relações de trabalho.',
          'A «permanência»: manter igual — oposto — eliminar.',
          'B «paralisação»: parar — contradiz reorganização — eliminar.',
          'C «estagnação»: sem progresso — oposto — eliminar.',
          'D «conservação»: preservar como está — oposto — eliminar.',
          'E «alteração»: modificação — equivalência direta — manter.',
          'Gabarito E.',
          'Em similares: transformação ≈ alteração/mudança — prove no contexto de IA.',
        ],
        footer_rule: 'Transformação ≈ alteração.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRANSFORMAÇÃO',
        rows: [
          { label: 'Transformação', value: 'Mudança profunda de forma/estado.' },
          { label: 'Alteração', value: 'Modificação — sinônimo próximo.' },
          { label: 'Antônimos', value: 'Permanência, estagnação, conservação.' },
          { label: 'Nesta questão', value: 'E — alteração.' },
        ],
        footer_rule: 'Estagnação ≠ transformação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Substantivos de imobilidade',
        items: [
          { label: 'A — permanência', detail: 'Manter-se igual.', correct: 'Antônimo no contexto: permanência opõe-se a transformação profunda.' },
          { label: 'B — paralisação', detail: 'Cessar movimento.', correct: 'Antônimo no contexto: paralisar contradiz reorganização pela IA.' },
          { label: 'C — estagnação', detail: 'Ausência de progresso.', correct: 'Antônimo no contexto: estagnação ≠ mudança estrutural.' },
          { label: 'D — conservação', detail: 'Preservar o existente.', correct: 'Antônimo no contexto: conservar opõe-se a transformar.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A transformação digital exige reciclagem profissional.»',
            correct: 'Sinônimo no contexto: «alteração digital» — mesma ideia de mudança.',
          },
        ],
        footer_rule: 'E: alteração.',
      },
    ],
  },

  'selecon-acs-sinonimos-leia-o-texto-a-seguir-populacao-bras-1360970': {
    family: 'text_fragment',
    source_tec_id: '1360970',
    source_note: '«De acordo com» ≈ Segundo — IBGE população — SELECON ACS Pref L do Rio Verde 2025 tec 1360970',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (Pref L do Rio Verde)',
      orgao: 'Pref. Lagoa do Rio Verde',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nNo trecho «De acordo com dados divulgados pelo IBGE…», a expressão destacada poderia ser substituída, sem alteração significativa de sentido, por:',
    text_fragment:
      'População brasileira atinge novo patamar (IBGE — adaptado)\n\nDe acordo com dados divulgados pelo IBGE, a população do país segue envelhecendo e a taxa de fecundidade permanece em queda. Especialistas apontam desafios para políticas de saúde e previdência. O levantamento mostra ainda migração interna entre regiões, com crescimento em centros urbanos de médio porte.',
    options: [
      { id: 'A', text: 'Se.', is_correct: false },
      { id: 'B', text: 'Como.', is_correct: false },
      { id: 'C', text: 'Segundo.', is_correct: true },
      { id: 'D', text: 'Consequentemente.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'De acordo com o IBGE',
        chip_label: 'Locução fonte',
        meta: slideMeta,
        items: [
          { label: 'De acordo com', detail: 'Conforme, segundo fonte citada.', icon: 'FileText' },
          { label: 'Segundo', detail: 'Indica origem da informação — gabarito C.', icon: 'Quote' },
          { label: 'IBGE', detail: 'Fonte oficial — dados de população.', icon: 'BarChart' },
          { label: 'Pergunta-teste', detail: 'Qual conector mantém citação de fonte?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por «Consequentemente» (conclusão).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'De acordo com = segundo (fonte).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto IBGE: população, envelhecimento, fecundidade.',
          '«De acordo com dados divulgados» — atribui informação à fonte.',
          'A «Se»: condição hipotética — não indica fonte — eliminar.',
          'B «Como»: modo/comparação — não substitui «de acordo com» aqui — eliminar.',
          'C «Segundo»: conforme, de acordo com — equivalência — manter.',
          'D «Consequentemente»: conclusão lógica — função distinta — eliminar.',
          'Gabarito C.',
          'Em similares: de acordo com fonte ≈ segundo — prove na atribuição.',
        ],
        footer_rule: 'Segundo = de acordo com (fonte).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DE ACORDO COM',
        rows: [
          { label: 'De acordo com', value: 'Conforme, segundo (fonte citada).' },
          { label: 'Segundo', value: 'Sinônimo — atribui informação.' },
          { label: 'Consequentemente', value: 'Conclusão — não sinônimo.' },
          { label: 'Nesta questão', value: 'C — Segundo.' },
        ],
        footer_rule: 'Se = condição; Segundo = fonte.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Conectores de função distinta',
        items: [
          { label: 'A — Se', detail: 'Introduz condição hipotética.', correct: 'Sinônimo no contexto: «Se» não substitui atribuição a fonte.' },
          { label: 'B — Como', detail: 'Modo ou comparação.', correct: 'Sinônimo no contexto: «Como» não indica «de acordo com o IBGE».' },
          { label: 'D — Consequentemente', detail: 'Marca conclusão, não fonte.', correct: 'Antônimo no contexto: conclusão ≠ citação de dados.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «De acordo com o relatório, as vendas subiram.»',
            correct: 'Sinônimo no contexto: «Segundo o relatório» — mesma atribuição de fonte.',
          },
        ],
        footer_rule: 'C: Segundo = de acordo com (fonte IBGE).',
      },
    ],
  },

  'vunesp-ag-as-sinonimos-leia-o-texto-a-seguir-para-responder-3345649': {
    family: 'text_fragment',
    source_tec_id: '3345649',
    source_note: 'possível≈plausível; divergências antônimo≈conformidades — Dia dos Mortos — VUNESP Ag AS Pref Campinas Farmácia 2025 tec 3345649',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag AS (Pref Campinas — Farmácia)',
      orgao: 'Pref. Campinas',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nNo trecho «Uma possível explicação para as divergências entre as celebrações do Dia dos Mortos no México e no Brasil…», assinale a opção que apresenta, respectivamente, um sinônimo de «possível» e um antônimo de «divergências»:',
    text_fragment:
      'Dia dos Mortos: México e Brasil (adaptado)\n\nUma possível explicação para as divergências entre as celebrações do Dia dos Mortos no México e no Brasil reside na mistura de tradições indígenas, católicas e populares em cada país. No México, altares coloridos e ofrendas marcam ruas e cemitérios; no Brasil, o dia costuma ser vivido com discreção e visitas aos túmulos. Antropólogos lembram que rituais de memória se reinventam conforme a história local.',
    options: [
      { id: 'A', text: 'real — compatibilidades.', is_correct: false },
      { id: 'B', text: 'factível — dissonâncias.', is_correct: false },
      { id: 'C', text: 'incerta — reconciliações.', is_correct: false },
      { id: 'D', text: 'plausível — conformidades.', is_correct: true },
      { id: 'E', text: 'lícita — discrepâncias.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Possível × divergências',
        chip_label: 'Par duplo',
        meta: slideMeta,
        items: [
          { label: 'Possível', detail: 'Que pode ser — explicação plausível.', icon: 'HelpCircle' },
          { label: 'Plausível', detail: 'Crendível, aceitável — sinônimo.', icon: 'CheckCircle' },
          { label: 'Divergências', detail: 'Diferenças entre celebrações MX/BR.', icon: 'GitBranch' },
          { label: 'Conformidades', detail: 'Semelhanças — antônimo de divergências.', icon: 'Equal' },
          { label: 'Dia dos Mortos', detail: 'Texto antropológico — tradições distintas.', icon: 'Skull' },
          { label: 'Pegadinha', detail: 'Trocar antônimo por outro sinônimo (dissonâncias).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Sinônimo de possível + antônimo de divergências.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: Dia dos Mortos México × Brasil — diferenças culturais.',
          '1º termo: «possível explicação» = plausível, factível, crendível.',
          '2º termo: antônimo de «divergências» = conformidades (semelhanças).',
          'A «real/compatibilidades»: real ≠ possível; compatibilidades ok mas 1º erra — eliminar.',
          'B «factível/dissonâncias»: factível ok; dissonâncias ≈ divergências (sinônimo, não antônimo) — eliminar.',
          'C «incerta/reconciliações»: incerta ≠ possível; reconciliações não é antônimo direto — eliminar.',
          'D «plausível/conformidades»: plausível ≈ possível; conformidades antônimo de divergências — manter.',
          'E «lícita/discrepâncias»: lícita = legal; discrepâncias ≈ divergências — eliminar.',
          'Gabarito D.',
          'Em similares: possível ≈ plausível; divergências ↔ conformidades.',
        ],
        footer_rule: 'D: plausível + conformidades.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PAR DUPLO',
        rows: [
          { label: 'Possível', value: 'Plausível, factível, crendível.' },
          { label: 'Divergências', value: 'Diferenças, discrepâncias.' },
          { label: 'Antônimo', value: 'Conformidades — semelhanças.' },
          { label: 'Nesta questão', value: 'D — plausível / conformidades.' },
        ],
        footer_rule: 'Dissonâncias ≈ divergências — não antônimo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par sinônimo onde pede antônimo',
        items: [
          { label: 'A — real', detail: 'Real = verdadeiro — não sinônimo de possível.', correct: 'Sinônimo no contexto: «real» não substitui «possível explicação».' },
          { label: 'B — dissonâncias', detail: 'Sinônimo de divergências.', correct: 'Antônimo no contexto: dissonâncias ≈ divergências — não é oposto.' },
          { label: 'C — incerta', detail: 'Dúvida — não equivale a possível.', correct: 'Sinônimo no contexto: «incerta» não cobre «possível explicação».' },
          { label: 'E — discrepâncias', detail: 'Outro sinônimo de divergências.', correct: 'Antônimo no contexto: discrepâncias ≈ divergências — pede oposto.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Há divergências entre os relatórios.»',
            correct: 'Antônimo no contexto: «conformidades» — semelhanças entre relatórios.',
          },
        ],
        footer_rule: 'D: plausível + conformidades.',
      },
    ],
  },

  'vunesp-ag-pr-sinonimos-leia-a-tira-para-responder-a-questao-3352583': {
    family: 'text_fragment',
    source_tec_id: '3352583',
    source_note: '«Como» ≈ Visto que (causal) — tira Malvados André Dahmer — VUNESP Ag Pref Sertãozinho 2025 tec 3352583',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira para responder à questão.\n\nNa fala «Como a vida durante o dia era dura, a noite era a única hora em que podíamos ser crianças», a conjunção destacada poderia ser substituída, sem alteração significativa de sentido, por:',
    text_fragment:
      '<p><strong>Malvados — André Dahmer (transcrição adaptada)</strong></p>' +
      '<p>Personagem 1: «Como a vida durante o dia era dura, a noite era a única hora em que podíamos ser crianças.»</p>' +
      '<p>Personagem 2: «E por isso a gente inventava brincadeiras no escuro.»</p>' +
      '<p><em>A conjunção «Como» introduz causa: porque a vida de dia era dura, a noite virava refúgio de infância.</em></p>',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'Ainda que.', is_correct: false },
      { id: 'B', text: 'Por mais que.', is_correct: false },
      { id: 'C', text: 'Visto que.', is_correct: true },
      { id: 'D', text: 'Contanto que.', is_correct: false },
      { id: 'E', text: 'De modo que.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Como = causa',
        chip_label: 'Tira Malvados',
        meta: slideMeta,
        items: [
          { label: 'Como (causal)', detail: 'Porque, visto que — dia duro → noite livre.', icon: 'Link' },
          { label: 'Visto que', detail: 'Conjunção causal — gabarito C.', icon: 'ArrowRight' },
          { label: 'Vida de dia', detail: '«Como a vida durante o dia era dura» — causa.', icon: 'Sun' },
          { label: 'Noite', detail: '«A noite era a única hora» — refúgio de infância.', icon: 'Moon' },
          { label: 'Crianças', detail: '«Podíamos ser crianças» — tom da tira.', icon: 'Baby' },
          { label: 'Tira Malvados', detail: 'Dahmer — brincadeiras no escuro.', icon: 'Image' },
          { label: 'Pergunta-teste', detail: 'Qual conector mantém a causa?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por concessão (Ainda que/Por mais que).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Como causal ≈ visto que.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Malvados: dia duro → noite era hora de ser criança.',
          '«Como» introduz causa: porque a vida de dia era dura.',
          'A «Ainda que»: concessão — apesar de — inverte relação — eliminar.',
          'B «Por mais que»: concessão — eliminar.',
          'C «Visto que»: causal — porque — equivalência — manter.',
          'D «Contanto que»: condição — se/desde que — eliminar.',
          'E «De modo que»: consequência — resultado — eliminar.',
          'Gabarito C.',
          'Em similares: como causal ≈ visto que/já que — prove na tira.',
        ],
        footer_rule: 'Visto que = porque.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMO CAUSAL',
        rows: [
          { label: 'Como (causa)', value: 'Porque, visto que, já que.' },
          { label: 'Visto que', value: 'Sinônimo causal — gabarito.' },
          { label: 'Ainda que', value: 'Concessão — oposto de função.' },
          { label: 'Nesta questão', value: 'C — Visto que.' },
        ],
        footer_rule: 'Concessão ≠ causa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Conjunções de função diferente',
        items: [
          { label: 'A — Ainda que', detail: 'Concessão — apesar de.', correct: 'Antônimo no contexto: concessão inverte a relação causal da tira.' },
          { label: 'B — Por mais que', detail: 'Concessão intensiva.', correct: 'Antônimo no contexto: «por mais que» não introduz causa.' },
          { label: 'D — Contanto que', detail: 'Condição — desde que.', correct: 'Sinônimo no contexto: «contanto que» não substitui causa em «Como a vida era dura».' },
          { label: 'E — De modo que', detail: 'Consequência — de forma que.', correct: 'Sinônimo no contexto: «de modo que» indica resultado, não causa.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Como choveu, cancelamos o piquenique.»',
            correct: 'Sinônimo no contexto: «Visto que choveu» — mesma relação causal.',
          },
        ],
        footer_rule: 'C: Visto que.',
      },
    ],
  },

  'vunesp-ag-pr-sinonimos-leia-o-texto-para-responder-a-questa-3352587': {
    family: 'text_fragment',
    source_tec_id: '3352587',
    source_note: '«aleatória e lúdica» ≈ casual e divertida — Calasso/tsundoku — VUNESP Ag Pref Sertãozinho 2025 tec 3352587',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nNo trecho «… uma leitura aleatória e lúdica …», a expressão destacada poderia ser substituída, sem alteração significativa de sentido, por:',
    text_fragment:
      'Tsundoku e a pilha de livros (Calasso — adaptado)\n\nHá quem compre livros e os acumule sem pressa de lê-los — fenômeno que o japonês chama de tsundoku. Para muitos leitores, folhear uma pilha antiga é uma leitura aleatória e lúdica: abrem-se páginas ao acaso, sem plano rígido, pelo prazer de surpreender-se. Roberto Calasso lembrava que a literatura também se saboreia fora da ordem cronológica.',
    options: [
      { id: 'A', text: 'casual e divertida.', is_correct: true },
      { id: 'B', text: 'organizada e complexa.', is_correct: false },
      { id: 'C', text: 'fortuita e misteriosa.', is_correct: false },
      { id: 'D', text: 'lógica e recreativa.', is_correct: false },
      { id: 'E', text: 'desinteressada e caótica.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Leitura lúdica',
        chip_label: 'Par adjetivo',
        meta: slideMeta,
        items: [
          { label: 'Aleatória', detail: 'Ao acaso — folhear sem plano.', icon: 'Shuffle' },
          { label: 'Lúdica', detail: 'Divertida, lúdica — prazer de surpresa.', icon: 'Gamepad2' },
          { label: 'Tsundoku', detail: 'Pilha de livros — Calasso, leitura casual.', icon: 'BookOpen' },
          { label: 'Casual', detail: 'Descontraída, sem rigor — sinônimo.', icon: 'Coffee' },
          { label: 'Divertida', detail: 'Par de lúdica — gabarito A.', icon: 'Smile' },
          { label: 'Pegadinha', detail: 'Trocar por «organizada/lógica» (oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Aleatória + lúdica ≈ casual + divertida.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Calasso/tsundoku: pilha de livros, folhear ao acaso, prazer.',
          '«Aleatória e lúdica» = sem plano + divertida.',
          'A «casual e divertida»: descontraída + prazerosa — equivalência — manter.',
          'B «organizada e complexa»: oposto de aleatória — eliminar.',
          'C «fortuita e misteriosa»: fortuita parcial; misteriosa não cobre lúdica — eliminar.',
          'D «lógica e recreativa»: lógica contradiz aleatória — eliminar.',
          'E «desinteressada e caótica»: tom negativo — eliminar.',
          'Gabarito A.',
          'Em similares: aleatória ≈ casual; lúdica ≈ divertida — prove no tsundoku.',
        ],
        footer_rule: 'A: casual + divertida.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ALEATÓRIA × LÚDICA',
        rows: [
          { label: 'Aleatória', value: 'Ao acaso, casual, sem plano.' },
          { label: 'Lúdica', value: 'Divertida, recreativa.' },
          { label: 'Pergunta-teste', value: 'O par mantém tom de prazer casual?' },
          { label: 'Nesta questão', value: 'A — casual e divertida.' },
        ],
        footer_rule: 'Organizada/lógica = antônimos de aleatória.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares que invertem o tom',
        items: [
          { label: 'B — organizada', detail: 'Oposto de leitura ao acaso.', correct: 'Antônimo no contexto: organizada contradiz «aleatória».' },
          { label: 'C — misteriosa', detail: 'Tom de enigma — não lúdico.', correct: 'Sinônimo no contexto: «misteriosa» não substitui «lúdica».' },
          { label: 'D — lógica', detail: 'Rigor metódico — oposto.', correct: 'Antônimo no contexto: lógica opõe-se a folhear ao acaso.' },
          { label: 'E — caótica', detail: 'Tom negativo — desinteresse.', correct: 'Antônimo no contexto: «desinteressada» contradiz prazer lúdico.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Fiz uma escolha aleatória e lúdica de filmes.»',
            correct: 'Sinônimo no contexto: «casual e divertida» — sem plano, com prazer.',
          },
        ],
        footer_rule: 'A: casual + divertida.',
      },
    ],
  },

  'avancasp-acs-sinonimos-leia-a-tirinha-a-seguir-para-respond-3352958': {
    family: 'text_fragment',
    source_tec_id: '3352958',
    source_note: 'caíram≈tombaram; espalhadas≈distribuídas — Calvin — AVANÇASP ACS Pref Amparo SP 2025 tec 3352958',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Amparo)',
      orgao: 'Pref. Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tirinha a seguir para responder à questão.\n\nNa fala do personagem, as palavras destacadas poderiam ser substituídas, respectivamente, sem alteração significativa de sentido, por:',
    text_fragment:
      '<p><strong>Calvin e Haroldo — Bill Watterson (transcrição adaptada)</strong></p>' +
      '<p>Calvin, olhando folhas no chão: «Todas as folhas <strong>caíram</strong> das árvores e estão <strong>espalhadas</strong> pelo quintal.»</p>' +
      '<p>Haroldo: «É outono.»</p>' +
      '<p><em>«Caíram» = desceram com o vento; «espalhadas» = espalhadas/distribuídas pelo chão.</em></p>',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'subiram — concentradas.', is_correct: false },
      { id: 'B', text: 'penduraram — amontoadas.', is_correct: false },
      { id: 'C', text: 'voaram — reunidas.', is_correct: false },
      { id: 'D', text: 'tombaram — distribuídas.', is_correct: true },
      { id: 'E', text: 'flutuaram — agrupadas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Folhas no quintal',
        chip_label: 'Tira Calvin',
        meta: slideMeta,
        items: [
          { label: 'Palavras destacadas', detail: '«Caíram» e «espalhadas» — par a substituir.', icon: 'Highlighter' },
          { label: 'Substituídas', detail: 'Respectivamente — 1º caíram, 2º espalhadas.', icon: 'Replace' },
          { label: 'Caíram', detail: 'Desceram das árvores — outono.', icon: 'Leaf' },
          { label: 'Tombaram', detail: 'Cair, desabar — sinônimo do 1º termo.', icon: 'ArrowDown' },
          { label: 'Espalhadas', detail: 'Pelo quintal — sem concentração.', icon: 'LayoutGrid' },
          { label: 'Distribuídas', detail: 'Espalhadas em vários pontos — 2º termo.', icon: 'Grid' },
          { label: 'Fala do personagem', detail: 'Calvin descreve folhas no quintal.', icon: 'MessageCircle' },
          { label: 'Pegadinha', detail: 'Trocar por «subiram/concentradas» (oposto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Caíram ≈ tombaram; espalhadas ≈ distribuídas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Calvin: na fala do personagem, palavras destacadas «caíram» e «espalhadas».',
          'Enunciado pede substituição respectiva — sem alterar sentido.',
          '1º: «caíram» = desceram — tombaram, caíram ao chão.',
          '2º: «espalhadas» = espalhadas — distribuídas pelo quintal.',
          'A «subiram/concentradas»: movimento oposto — eliminar.',
          'B «penduraram/amontoadas»: folhas nas árvores — eliminar.',
          'C «voaram/reunidas»: voar ≠ cair; reunidas ≠ espalhadas — eliminar.',
          'D «tombaram/distribuídas»: equivalência dupla — manter.',
          'E «flutuaram/agrupadas»: flutuar ≠ cair — eliminar.',
          'Gabarito D.',
          'Em similares: cair ≈ tombar; espalhadas ≈ distribuídas — prove na tira.',
        ],
        footer_rule: 'D: tombaram + distribuídas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PAR DUPLO — CALVIN',
        rows: [
          { label: 'Caíram', value: 'Tombaram, despencaram.' },
          { label: 'Espalhadas', value: 'Distribuídas, disseminadas.' },
          { label: 'Antônimos', value: 'Subiram, concentradas, reunidas.' },
          { label: 'Nesta questão', value: 'D — tombaram / distribuídas.' },
        ],
        footer_rule: 'Concentradas = antônimo de espalhadas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares que invertem movimento',
        items: [
          { label: 'A — subiram', detail: 'Movimento ascendente.', correct: 'Antônimo no contexto: «subiram» opõe-se a folhas que caíram.' },
          { label: 'B — penduraram', detail: 'Folhas ainda nas árvores.', correct: 'Antônimo no contexto: penduradas contradizem «caíram».' },
          { label: 'C — reunidas', detail: 'Oposto de espalhadas.', correct: 'Antônimo no contexto: reunidas ≠ espalhadas pelo quintal.' },
          { label: 'E — agrupadas', detail: 'Concentradas em monte.', correct: 'Antônimo no contexto: agrupadas opõem-se a espalhadas.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «As maçãs caíram e ficaram espalhadas no pomar.»',
            correct: 'Sinônimo no contexto: «tombaram» e «distribuídas» — mesmo par da tira.',
          },
        ],
        footer_rule: 'D: tombaram + distribuídas.',
      },
    ],
  },

  'vunesp-an-op-sinonimos-leia-o-texto-para-responder-a-questa-3354409': {
    family: 'text_fragment',
    source_tec_id: '3354409',
    source_note: 'distinção≈diferenciação; inócuas≈inofensivas — Bobbio preconceito — VUNESP An OP Sertãozinho 2025 tec 3354409',
    meta: {
      banca: 'VUNESP',
      prova: 'An OP (Pref Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nNo trecho «… sem distinção entre preconceitos inócuos e preconceitos perigosos …», as palavras destacadas poderiam ser substituídas, respectivamente, sem alteração significativa de sentido, por:',
    text_fragment:
      'Preconceito e tolerância (Norberto Bobbio — adaptado)\n\nA tolerância exige discernimento: não se trata de aceitar tudo indistintamente, mas de saber separar o que pode conviver do que ameaça a convivência democrática. Sem distinção entre preconceitos inócuos e preconceitos perigosos, a sociedade confunde mero desconforto com risco real. Bobbio insistia que democracia não é indiferença — é julgamento responsável.',
    options: [
      { id: 'A', text: 'constatação — nocivas.', is_correct: false },
      { id: 'B', text: 'diferenciação — inofensivas.', is_correct: true },
      { id: 'C', text: 'diferenciação — benéficas.', is_correct: false },
      { id: 'D', text: 'observação — inofensivas.', is_correct: false },
      { id: 'E', text: 'análise — nocivas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Distinção × inócuas',
        chip_label: 'Par duplo',
        meta: slideMeta,
        items: [
          { label: 'Distinção', detail: 'Separar tipos de preconceito — Bobbio.', icon: 'GitCompare' },
          { label: 'Diferenciação', detail: 'Sinônimo — discernir categorias.', icon: 'Split' },
          { label: 'Inócuas', detail: 'Inofensivas — sem dano real.', icon: 'Shield' },
          { label: 'Inofensivas', detail: 'Que não causam mal — gabarito.', icon: 'CheckCircle' },
          { label: 'Perigosos', detail: 'Contraste do texto — ameaça democrática.', icon: 'AlertTriangle' },
          { label: 'Pegadinha', detail: 'Trocar inócuas por «nocivas» (oposto).', icon: 'Ban' },
        ],
        footer_rule: 'Distinção ≈ diferenciação; inócuas ≈ inofensivas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Bobbio: tolerância, preconceitos inócuos × perigosos.',
          '1º: «distinção» = separar, diferenciar categorias.',
          '2º: «inócuas» = inofensivas, sem dano.',
          'A «constatação/nocivas»: constatação ≠ distinção; nocivas = oposto de inócuas — eliminar.',
          'B «diferenciação/inofensivas»: equivalência dupla — manter.',
          'C «diferenciação/benéficas»: 1º ok; benéficas ≠ inócuas — eliminar.',
          'D «observação/inofensivas»: observação ≠ distinção — eliminar.',
          'E «análise/nocivas»: análise parcial; nocivas invertem sentido — eliminar.',
          'Gabarito B.',
          'Em similares: distinção ≈ diferenciação; inócuo ≈ inofensivo — prove em Bobbio.',
        ],
        footer_rule: 'B: diferenciação + inofensivas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INÓCUO',
        rows: [
          { label: 'Distinção', value: 'Diferenciação, separação.' },
          { label: 'Inócuo', value: 'Inofensivo, sem efeito nocivo.' },
          { label: 'Nocivo', value: 'Antônimo de inócuo.' },
          { label: 'Nesta questão', value: 'B — diferenciação / inofensivas.' },
        ],
        footer_rule: 'Inócuas ≠ nocivas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Segundo termo invertido',
        items: [
          { label: 'A — nocivas', detail: 'Oposto de inócuas.', correct: 'Antônimo no contexto: «nocivas» contradiz preconceitos inócuos.' },
          { label: 'C — benéficas', detail: 'Positivo — não equivale a inócuo.', correct: 'Sinônimo no contexto: «benéficas» não substitui «inócuas».' },
          { label: 'D — observação', detail: 'Ato de notar — não separar.', correct: 'Sinônimo no contexto: «observação» não cobre «distinção».' },
          { label: 'E — nocivas', detail: 'Repete erro de oposição.', correct: 'Antônimo no contexto: nocivas = perigosas — oposto pedido.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O comentário foi inócuo, sem ofender ninguém.»',
            correct: 'Sinônimo no contexto: «inofensivo» — sem dano.',
          },
        ],
        footer_rule: 'B: diferenciação + inofensivas.',
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
