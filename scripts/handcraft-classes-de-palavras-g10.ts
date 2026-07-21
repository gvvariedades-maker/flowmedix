#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g10 (8 slugs · Classes de palavras · lote 10 · Conjunção + variadas).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g10.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g10 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g10 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g10';
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
    'conjunção coordenativa e subordinativa',
    'valor semântico do conectivo',
    'oposição adição conformidade classificação morfológica',
    'entretanto apesar disso mas por outro conforme',
    'artigo preposição substantivo advérbio pronome',
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
      reviewer: 'handcraft:classes-de-palavras-g10',
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
  'educa-pb-acd-classes-leia-o-texto-a-seguir-e-responda-a-q-3746576': {
    family: 'conceito',
    source_tec_id: '3746576',
    source_note: '«Entretanto» oposição cacau — EDUCA PB ACD Pref Santa Cecília 2025 tec 3746576',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Santa Cecília)',
      orgao: 'Pref Santa Cecília',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nTEXTO II — Chocolate faz bem para a saúde?\n\n[...] O Brasil já foi um dos grandes produtores mundiais de cacau. Entretanto, problemas relacionados aos custos de produção local e à falta de organização dos produtores cacaueiros contribuíram para a retração desse setor produtivo. [...] A partir do aumento do consumo, o chocolate passou a ser consumido em tabletes.\n\nEm relação à conjunção destacada no trecho («Entretanto»), a ideia por ela introduzida exprime:',
    options: [
      { id: 'A', text: 'Causalidade.', is_correct: false },
      { id: 'B', text: 'Conclusão.', is_correct: false },
      { id: 'C', text: 'Oposição.', is_correct: true },
      { id: 'D', text: 'Adição.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Entretanto no cacau',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O conectivo opõe, soma, conclui ou explica causa?', icon: 'Focus' },
          { label: 'Grande → retração', detail: 'Brasil foi grande produtor mundial; depois retração do setor cacaueiro.', icon: 'TrendingDown' },
          { label: 'Entretanto', detail: 'Conjunção adversativa — contrapõe grandeza passada × crise atual.', icon: 'GitCompare' },
          { label: '× Causal', detail: 'Causa usaria «porque», «pois» — não «entretanto».', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Confundir «mas» (início) com «entretanto» (meio do texto).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Entretanto = oposição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'TEXTO II → gabarito',
        meta: slideMeta,
        steps: [
          'TEXTO II: história do chocolate, cacaueiro, Brasil produtor mundial.',
          'Trecho positivo: Brasil entre grandes produtores mundiais de cacau.',
          '«Entretanto» introduz retração por custos de produção e desorganização dos produtores.',
          'Relação adversativa entre dois momentos — oposição.',
          'A causalidade pediria explicar motivo com «porque» — eliminar.',
          'B conclusão usaria «portanto», «logo» — eliminar.',
          'D adição usaria «e», «além disso» — eliminar.',
          'Gabarito C — oposição.',
          'Em similares: entretanto/todavia/contudo após dado positivo.',
        ],
        footer_rule: 'C — Entretanto opõe grandeza × retração.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ENTRETANTO',
        rows: [
          { label: 'Classe', value: 'Conjunção coordenativa adversativa.' },
          { label: 'Valor', value: 'Oposição / contraste entre ideias.' },
          { label: 'Sinônimos', value: 'Todavia, contudo, porém, mas.' },
          { label: 'Nesta questão', value: 'C — oposição (grande produtor × retração).' },
          { label: 'Contexto', value: 'Cacau, cacaueiro, Theobroma, pré-colombianos, produtores, tabletes.' },
        ],
        footer_rule: 'Grandeza passada × crise = oposição.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Valor semântico errado',
        items: [
          { label: 'A — causalidade', detail: 'Custos e desorganização são motivos da queda, mas «entretanto» só opõe fatos.', correct: 'Causal explicaria com «porque» — «entretanto» é adversativa.' },
          { label: 'B — conclusão', detail: 'Retração parece desfecho lógico do período anterior.', correct: 'Conclusão usaria «portanto» — «entretanto» contrasta, não infere.' },
          { label: 'D — adição', detail: 'Queda acrescentaria dado sem contraste.', correct: '«Entretanto» rompe expectativa positiva — oposição, não soma.' },
          { label: 'Em outra banca…', detail: 'Trocam «entretanto» por «todavia» no mesmo contexto.', correct: 'Mesmo valor adversativo — oposição.' },
        ],
        footer_rule: 'Só C — oposição.',
      },
    ],
  },

  'selecon-ag-f-classes-leia-o-texto-a-seguir-ses-distribui-3754251': {
    family: 'conceito',
    source_tec_id: '3754251',
    source_note: '«conforme» calendário vacinação — SELECON Ag Fisc Pref Marcelândia 2025 tec 3754251',
    meta: {
      banca: 'SELECON',
      prova: 'Ag Fisc (Pref Marcelândia)',
      orgao: 'Pref Marcelândia',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir:\n\nSES distribui 500 mil doses e incentiva campanha de multivacinação de crianças e adolescentes de até 15 anos\n\nA Secretaria de Estado de Saúde (SES) distribuiu 500 mil doses de vacina para que os 142 municípios do Estado realizem ações da Campanha Nacional de Multivacinação, entre os dias 6 e 31 de outubro. [...] «É muito importante que todos, em especial crianças e adolescentes, mantenham a caderneta atualizada. Todas as doses previstas no Calendário Nacional de Vacinação estarão à disposição da população de Mato Grosso», destacou o secretário Gilberto Figueiredo.\n\nSegundo a superintendente Alessandra Moraes, os não vacinados contra HPV, febre amarela e sarampo estão entre as prioridades. [...] De acordo com o coordenador Marx Camarão, a SES tem mantido diálogo com os municípios para ampliar a vacinação. «Trabalhamos juntos para otimizar a distribuição de doses e mobilizar as equipes de saúde [...] O objetivo é alcançar o maior número de pessoas possível, priorizando as áreas com maior vulnerabilidade e garantindo a continuidade da campanha __________ as diretrizes do Calendário Nacional de Vacinação.»\n\nAssinale a alternativa que completa corretamente a lacuna:',
    options: [
      { id: 'A', text: 'a menos que', is_correct: false },
      { id: 'B', text: 'conforme', is_correct: true },
      { id: 'C', text: 'inclusive', is_correct: false },
      { id: 'D', text: 'já que', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conforme o calendário',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Lacuna pede conformidade, causa, condição ou acréscimo?', icon: 'Focus' },
          { label: 'SES / MT', detail: 'Multivacinação, Dia D, HPV, sarampo, Calendário Nacional.', icon: 'Syringe' },
          { label: 'Conforme', detail: '«De acordo com» as diretrizes do calendário — conformativa.', icon: 'CheckCircle' },
          { label: 'Continuidade', detail: 'Campanha segue normas oficiais de imunização.', icon: 'Calendar' },
          { label: 'Pegadinha', detail: '«Já que» parece explicar objetivo — mas lacuna é regulamentação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Conforme = de acordo com.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto SES: multivacinação, Calendário Nacional, Gilberto Figueiredo, Marx Camarão, Mato Grosso.',
          'Marx Camarão: diálogo com municípios, distribuição, equipes, vulnerabilidade.',
          'Lacuna: continuidade da campanha ________ diretrizes do Calendário Nacional.',
          'Sentido: campanha segue o calendário oficial — conformidade.',
          'A «a menos que» = condição negativa — eliminar.',
          'B «conforme» = de acordo com — correto.',
          'C «inclusive» = acréscimo — eliminar.',
          'D «já que» = causa — eliminar.',
          'Gabarito B — conforme.',
          'Em similares: vacinação conforme PNI/calendário ministerial.',
        ],
        footer_rule: 'B — conforme as diretrizes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONFORME',
        rows: [
          { label: 'Valor', value: 'Conformidade — «de acordo com», «segundo».' },
          { label: '≠ já que', value: 'Causal — explica motivo, não norma.' },
          { label: '≠ a menos que', value: 'Condicional — exige hipótese.' },
          { label: 'Nesta questão', value: 'B — conforme o Calendário Nacional.' },
          { label: 'Contexto', value: 'SES, Marx Camarão, BCG, HPV, febre amarela, dTpa.' },
        ],
        footer_rule: 'Calendário = norma a seguir.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Conectivo errado na lacuna',
        items: [
          { label: 'A — a menos que', detail: 'Sugere campanha só se cumprir exceção.', correct: 'Continuidade segue diretriz fixa — não condição negativa.' },
          { label: 'C — inclusive', detail: 'Acrescentaria item à lista de ações.', correct: 'Lacuna liga campanha às diretrizes — conformativa.' },
          { label: 'D — já que', detail: '«Objetivo» anterior parece motivar causalidade.', correct: '«Já que» explicaria porquê — aqui é «segundo/conforme» norma.' },
          { label: 'Em outra banca…', detail: 'Trocam por «segundo» ou «de acordo com».', correct: 'Mesmo valor de «conforme».' },
        ],
        footer_rule: 'Só B completa a lacuna.',
      },
    ],
  },

  'instituto-ao-classes-leia-o-texto-abaixo-pesquisa-revela-3754329': {
    family: 'conceito',
    source_tec_id: '3754329',
    source_note: '«Apesar disso» transporte coletivo — Instituto AOCP Ass Cult Pref Joinville 2025 tec 3754329',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass Cult (Pref Joinville)',
      orgao: 'Pref Joinville',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto abaixo.\n\nPesquisa revela desafios do transporte público no Brasil\n\nUma pesquisa nacional sobre mobilidade urbana, realizada em 2024, apontou os principais desafios do transporte público no Brasil. Entre os motivos mais citados estão o conforto insuficiente, a falta de flexibilidade e o tempo elevado das viagens. Apesar disso, o transporte coletivo ainda é fundamental: mais da metade dos usuários depende exclusivamente do ônibus. [...] Outro dado preocupante é o aumento do transporte individual. Em contrapartida, estudos mostram que os ônibus emitem pouco em relação ao total do país.\n\nNo texto «Pesquisa revela desafios do transporte público no Brasil», em «Apesar disso, o transporte coletivo ainda é fundamental: mais da metade dos usuários depende exclusivamente do ônibus.», a expressão em destaque introduz uma ideia que se opõe',
    options: [
      {
        id: 'A',
        text: 'às críticas implícitas ao transporte coletivo no primeiro parágrafo do texto, reforçando sua relevância social mesmo diante das limitações apresentadas.',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'à constatação de que a pandemia alterou os hábitos de deslocamento, sugerindo que o transporte público não sofreu impacto algum.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'ao argumento sobre o crescimento do transporte individual, negando que isso represente um problema urbano.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'à menção às políticas de incentivo fiscal, defendendo que elas devem priorizar o transporte público.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'às informações sobre o aumento das emissões poluentes, indicando que o transporte coletivo é o principal responsável por elas.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Apesar disso',
        chip_label: 'M03 — concessiva',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Apesar disso» retoma qual ideia anterior e contrapõe o quê?', icon: 'Focus' },
          { label: '1º parágrafo', detail: 'Entrevistados deixaram o ônibus; conforto, flexibilidade, tempo — críticas.', icon: 'Bus' },
          { label: 'Apesar disso', detail: 'Concessiva — admite críticas, mas reafirma importância do coletivo.', icon: 'Shield' },
          { label: 'Ainda fundamental', detail: 'Mais da metade depende exclusivamente do ônibus.', icon: 'Users' },
          { label: 'Pegadinha', detail: 'Confundir com oposição ao transporte individual (parágrafo posterior).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Apesar disso = críticas × relevância.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pesquisa mobilidade urbana 2024: queda de uso, motivos negativos no 1º parágrafo.',
          '«Apesar disso» retoma essas limitações/críticas implícitas.',
          'Segunda oração reforça: transporte coletivo ainda é fundamental.',
          'A opõe críticas × relevância social — correto.',
          'B pandemia — não está no texto — eliminar.',
          'C nega problema do transporte individual — «apesar disso» não trata disso ainda — eliminar.',
          'D políticas fiscais — aparecem depois — eliminar.',
          'E emissões — texto diz ônibus emitem pouco — eliminar.',
          'Gabarito A.',
          'Em similares: «apesar disso» retoma objeção e salva tese principal.',
        ],
        footer_rule: 'A — opõe críticas × fundamental.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'APESAR DISSO',
        rows: [
          { label: 'Classe', value: 'Locução conjuntiva concessiva.' },
          { label: '«Disso»', value: 'Retoma críticas do parágrafo anterior.' },
          { label: 'Efeito', value: 'Contrapor limitações × importância do ônibus.' },
          { label: 'Nesta questão', value: 'A — opõe críticas implícitas × relevância.' },
          { label: 'Contexto', value: 'Mobilidade 2024, BRT, emissões, tarifas.' },
        ],
        footer_rule: 'Críticas no §1 × ônibus vital no §2.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Referente errado',
        items: [
          { label: 'B — pandemia', detail: 'Texto não menciona pandemia ou hábitos pós-covid.', correct: '«Apesar disso» retoma queda de uso e motivos negativos de 2017–2024.' },
          { label: 'C — transporte individual', detail: 'Crescimento de carros/motos vem em parágrafo posterior.', correct: '«Apesar disso» ainda responde às críticas do 1º parágrafo.' },
          { label: 'D — incentivo fiscal', detail: 'Benefícios fiscais aparecem depois, ligados a carros.', correct: 'Não é o referente de «disso» neste trecho.' },
          { label: 'E — emissões', detail: 'Ônibus emitem pouco — não são vilões da poluição.', correct: '«Apesar disso» não nega dado sobre emissões.' },
          { label: 'Em outra banca…', detail: 'Trocam «apesar disso» por «não obstante».', correct: 'Mesma concessão: críticas × importância do coletivo.' },
        ],
        footer_rule: 'Só A fecha o referente.',
      },
    ],
  },

  'educa-pb-ace-classes-considere-o-texto-a-seguir-para-resp-3820003': {
    family: 'conceito',
    source_tec_id: '3820003',
    source_note: '«Mas» conjunção placebo — EDUCA PB ACE Pref Ibiara 2025 tec 3820003',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACE (Pref Ibiara)',
      orgao: 'Pref Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nTEXTO I — O poder da mente na cura de doenças\n\n[...] Os testes clínicos utilizam placebos: um grupo recebe o medicamento e outro pílulas de farinha. Por incrível que pareça, parte dos participantes que ingerem placebos apresentam melhoria. Pesquisas comprovaram que a expectativa de se sentir melhor aumenta no cérebro a liberação de dopamina e pode reduzir o cortisol. (Líria Alves — Brasil Escola, adaptado.)\n\nNo trecho «Mas que reações são essas que provocam tantos benefícios?», a palavra destacada é classificada como:',
    options: [
      { id: 'A', text: 'Advérbio.', is_correct: false },
      { id: 'B', text: 'Preposição.', is_correct: false },
      { id: 'C', text: 'Conjunção.', is_correct: true },
      { id: 'D', text: 'Interjeição.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mas na pergunta',
        chip_label: 'M02 — classe',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Mas» liga orações, modifica verbo ou nomeia emoção?', icon: 'Focus' },
          { label: 'Placebo', detail: 'Texto I: mente, dopamina, cortisol, pílulas de farinha, testes clínicos.', icon: 'Brain' },
          { label: 'Mas que reações', detail: '«Mas» inicia pergunta retórica — conjunção adversativa.', icon: 'HelpCircle' },
          { label: '× Advérbio', detail: 'Não circunstancia verbo/adjetivo.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Mas» isolado parece interjeição de espanto — aqui liga orações.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mas = conjunção adversativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'TEXTO I: efeito placebo, testes clínicos, pílulas de farinha, dopamina, cortisol, Líria Alves.',
          'Trecho: «Mas que reações são essas que provocam tantos benefícios?»',
          '«Mas» introduz contraste/pergunta — função de conjunção.',
          'A advérbio modificaria verbo («mas correu») — eliminar.',
          'B preposição ligaria termos («casa de mas») — eliminar.',
          'D interjeição seria exclamação isolada — eliminar.',
          'C conjunção adversativa coordenando a pergunta — correto.',
          'Gabarito C.',
          'Em similares: «Mas» no início de pergunta retórica = conjunção.',
        ],
        footer_rule: 'C — Mas é conjunção.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MAS = CONJUNÇÃO',
        rows: [
          { label: 'Pergunta-teste', value: 'Liga orações ou termos? → conjunção.' },
          { label: 'Valor', value: 'Adversativa — contraste, oposição.' },
          { label: '× advérbio', value: 'Não indica modo, tempo ou negação de verbo.' },
          { label: 'Nesta questão', value: 'C — conjunção.' },
          { label: 'Contexto', value: 'Placebo, benefícios, reações corporais.' },
        ],
        footer_rule: 'Mas liga — não modifica sozinho.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe morfológica errada',
        items: [
          { label: 'A — advérbio', detail: '«Mas» parece intensificar «que» na fala.', correct: '«Mas» liga a pergunta ao contexto anterior — conjunção.' },
          { label: 'B — preposição', detail: 'Confunde com «mas» em locuções raras.', correct: 'Não estabelece regência nominal aqui.' },
          { label: 'D — interjeição', detail: 'Tom de surpresa na pergunta retórica.', correct: 'Há oração completa depois — função sintática de conjunção.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Porém que reações...»', correct: 'Mesma classe: conjunção adversativa.' },
        ],
        footer_rule: 'Só C — conjunção.',
      },
    ],
  },

  'vunesp-acs-p-classes-leia-o-texto-a-seguir-para-responder-3844984': {
    family: 'conceito',
    source_tec_id: '3844984',
    source_note: '«Por outro» oposição democracia digital — VUNESP ACS Pref Vista A do Alto 2025 tec 3844984',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Vista A do Alto)',
      orgao: 'Pref Vista A do Alto',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nDemocracia digital (Revista E, 01.09.2025 — adaptado)\n\n[...] Por um lado, abriu-se caminho para vozes historicamente silenciadas, a exemplo de jovens indígenas nas redes. Por outro, pavimentou-se uma via de disseminação de fake news, polarização ideológica e discursos de ódio. Nesse cenário, de que forma a expansão das novas tecnologias vem afetando a democracia? [...] Segundo o professor Gomes, nos encontramos diante de uma encruzilhada. «Mas há, também, os que veem na resistência institucional, nas pesquisas emergentes, na regulação pública e nos novos experimentos democráticos digitais um caminho viável para reverter o jogo.»\n\nAssinale a alternativa em que a palavra ou expressão destacada estabelece, no texto, relação de sentido de oposição.',
    options: [
      {
        id: 'A',
        text: '«Por um lado», no trecho que abre caminho para vozes historicamente silenciadas.',
        is_correct: false,
      },
      {
        id: 'B',
        text: '«Nesse cenário», na passagem que introduz a pergunta sobre democracia.',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«Segundo Gomes», na citação sobre a encruzilhada democrática.',
        is_correct: false,
      },
      {
        id: 'D',
        text: '«Mas há, também», na fala que apresenta quem vê caminho de resistência.',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«Por outro», no trecho que associa tecnologias à disseminação de fake news.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Por um lado × por outro',
        chip_label: 'M03 — oposição',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual conectivo cria contraste estrutural entre polos?', icon: 'Focus' },
          { label: 'Por um lado', detail: 'Primeiro polo: vozes indígenas, participação.', icon: 'ThumbsUp' },
          { label: 'Por outro', detail: 'Segundo polo: fake news, ódio, polarização — oposição.', icon: 'ThumbsDown' },
          { label: 'Par estrutural', detail: 'Locução clássica de antítese binária no texto.', icon: 'GitCompare' },
          { label: 'Pegadinha', detail: '«Mas há, também» também é adversativa — mas não fecha o par «por um/por outro».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Por outro = polo oposto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Revista E: democracia digital, redes sociais, fake news, polarização, professor Gomes.',
          'Estrutura binária: «Por um lado» (ganhos) × «Por outro» (riscos).',
          'A «Por um lado» abre o primeiro polo — não é o marcador de oposição pedido.',
          'B «Nesse cenário» situa o debate — não opõe ideias.',
          'C «Segundo Gomes» indica fonte — não oposição.',
          'D «Mas há, também» é adversativa interna na citação — outro nível do texto.',
          'E «Por outro» fecha o par antitético com «Por um lado» — oposição estrutural.',
          'Gabarito E.',
          'Em similares: por um lado / por outro (lado) = oposição binária.',
        ],
        footer_rule: 'E — Por outro opõe polos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POR UM LADO / POR OUTRO',
        rows: [
          { label: 'Valor', value: 'Oposição entre dois aspectos de um fenômeno.' },
          { label: 'Por outro', value: 'Segundo polo — contrapõe o primeiro.' },
          { label: '× por um lado', value: 'Abre o primeiro polo — oposição vem no «por outro».' },
          { label: 'Nesta questão', value: 'E — «Por outro» (fake news × vozes).' },
          { label: 'Contexto', value: 'Gomes, UFBa, algoritmos, regulação, resistência.' },
        ],
        footer_rule: 'Par por um/por outro = oposição.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Conectivo que não opõe',
        items: [
          { label: 'A — por um lado', detail: 'Introduz o aspecto positivo, não o contraste em si.', correct: 'Oposição estrutural se completa com «por outro» — gabarito E.' },
          { label: 'B — nesse cenário', detail: 'Retoma situação geral antes da pergunta.', correct: 'Não estabelece relação antitética entre polos.' },
          { label: 'C — segundo Gomes', detail: 'Marca autoria da citação.', correct: 'Função referencial — não oposição semântica.' },
          { label: 'D — mas há, também', detail: 'Adversativa na citação longa de Gomes.', correct: 'Oposição pedida é o par binário «por um/por outro» no 1º parágrafo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «de um lado / de outro».', correct: 'Mesma antítese — segundo termo marca oposição.' },
        ],
        footer_rule: 'Só E — por outro.',
      },
    ],
  },

  'cpcon-uepb-a-classes-leia-o-texto-i-para-responder-a-ques-3836456': {
    family: 'conceito',
    source_tec_id: '3836456',
    source_note: 'Classes já/sua/sentiu/com cansaço — CPCON UEPB ACS Pref Condado 2026 tec 3836456',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Condado (PB))',
      orgao: 'Pref Condado (PB)',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I para responder à questão.\n\nTexto I — A sociedade do cansaço é cada vez mais realidade. Como se blindar? (Wanessa Ferrari, 2021 — adaptado)\n\n«Já amanheci cansada.» O meme resume uma sensação comum: nem boas noites de sono restauram o vigor; por isso, não raramente amanhecemos cansados. De acordo com o filósofo Byung-Chul Han, vivemos na sociedade do cansaço, que naturalizou a cobrança excessiva por produtividade, alta performance e resultados sob o pano da positividade. [...]\n\nPare e reflita: quantas vezes você já se cobrou e se frustrou por não ter a produtividade que esperava? E quantas vezes você já se deparou com o perfil de um colega no LinkedIn, observou a situação profissional dele, comparou com sua situação e se sentiu deprimido ou fracassado? Questionamentos como esses decorrem da sociedade do cansaço, termo cunhado por Han no livro Sociedade do Cansaço.\n\nNo período «E quantas vezes você já se deparou [...] comparou com sua situação e se sentiu deprimido ou fracassado?», os termos destacados **já**, **sua**, **sentiu** e **com** classificam-se, respectivamente, como:',
    options: [
      { id: 'A', text: 'Conjunção subordinativa, pronome demonstrativo, verbo e preposição.', is_correct: false },
      { id: 'B', text: 'Advérbio, pronome possessivo, verbo e preposição.', is_correct: true },
      { id: 'C', text: 'Conjunção, pronome pessoal, advérbio e preposição.', is_correct: false },
      { id: 'D', text: 'Interjeição, adjetivo, advérbio e preposição.', is_correct: false },
      { id: 'E', text: 'Substantivo, pronome, verbo e interjeição.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro classes no período',
        chip_label: 'M02 — morfologia',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada palavra: que classe morfológica exerce?', icon: 'Focus' },
          { label: 'Já', detail: 'Advérbio de tempo/intensidade — «você já se deparou».', icon: 'Clock' },
          { label: 'Sua', detail: 'Pronome possessivo — «sua situação».', icon: 'User' },
          { label: 'Sentiu', detail: 'Verbo «sentir» — ação/psique.', icon: 'Zap' },
          { label: 'Com', detail: 'Preposição em «com sua situação» / «com culpa».', icon: 'Link' },
        ],
        footer_rule: 'Já · sua · sentiu · com.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto I: meme «Já amanheci cansada», Byung-Chul Han, LinkedIn, Sociedade do Cansaço.',
          'Período: comparação com colega → frustração/depressão.',
          '**Já** = advérbio (tempo/frequência) — «você já se deparou».',
          '**Sua** = pronome possessivo (situação pertence ao falante).',
          '**Sentiu** = verbo (predicado «se sentiu deprimido»).',
          '**Com** = preposição (liga «comparou» ao termo comparado).',
          'Sequência B: advérbio, possessivo, verbo, preposição.',
          'Gabarito B.',
          'Em similares: teste função — já modifica; sua indica posse; sentiu é ação; com regência.',
        ],
        footer_rule: 'B — adv · poss · verb · prep.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ROTEIRO MORFOLOGIA',
        rows: [
          { label: 'Já', value: 'Advérbio — circunstância de tempo.' },
          { label: 'Sua', value: 'Pronome possessivo — 3ª pessoa do discurso.' },
          { label: 'Sentiu', value: 'Verbo — pretérito perfeito de «sentir».' },
          { label: 'Com', value: 'Preposição — regência de «comparou».' },
          { label: 'Nesta questão', value: 'B — ordem pedida no comando.' },
        ],
        footer_rule: 'Uma classe por destaque.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Troca de classe por palavra',
        items: [
          { label: 'A — isso demonstrativo', detail: 'Não há «isso» entre os quatro destaques.', correct: '«Sua» é possessivo — não demonstrativo.' },
          { label: 'C — já como conjunção', detail: '«Já» modifica o verbo, não liga orações.', correct: 'Advérbio de tempo — não conjunção.' },
          { label: 'D — sentiu adjetivo', detail: '«Sentiu» é forma verbal flexionada.', correct: 'Verbo no pretérito — não adjetivo.' },
          { label: 'E — sua substantivo', detail: '«Sua» não nomeia ser — indica posse.', correct: 'Pronome possessivo — não substantivo.' },
          { label: 'Em outra banca…', detail: 'Trocam LinkedIn por «colega de trabalho».', correct: 'Mesmo mapa: já · sua · sentiu · com.' },
        ],
        footer_rule: 'Só B fecha as quatro classes.',
      },
    ],
  },

  'selecon-acs-classes-leia-o-texto-a-seguir-populacao-bras-1360966': {
    family: 'conceito',
    source_tec_id: '1360966',
    source_note: '«Os» artigo «entre» prep IBGE — SELECON ACS Pref LRV 2025 tec 1360966',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (Pref LRV)',
      orgao: 'Pref LRV',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir:\n\nPopulação brasileira chega a 213,4 milhões em julho de 2025\n\nA população brasileira alcançou 213,4 milhões de habitantes em julho de 2025. A estimativa foi divulgada pelo IBGE. [...] O IBGE parte do último censo realizado (2022) e faz projeção anual. Os dados também são fundamentais para indicadores econômicos e sociodemográficos nos períodos entre os censos. Na publicação, o IBGE aponta a população de estados, do Distrito Federal e municípios. Uma novidade de 2025 é a inclusão de Boa Esperança do Norte, no Mato Grosso. (Fonte: IBGE, adaptado.)\n\n«Os dados também são fundamentais para indicadores econômicos e sociodemográficos nos períodos entre os censos». Os termos em destaque classificam-se, respectivamente, como:',
    options: [
      { id: 'A', text: 'artigo e conjunção', is_correct: false },
      { id: 'B', text: 'artigo e preposição', is_correct: true },
      { id: 'C', text: 'pronome e conjunção', is_correct: false },
      { id: 'D', text: 'pronome e preposição', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Os · entre',
        chip_label: 'M02 — artigo + prep',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Os» antecede nome? «Entre» liga termos?', icon: 'Focus' },
          { label: 'Os dados', detail: 'Artigo definido plural — especifica «dados» já citados.', icon: 'Hash' },
          { label: 'Entre os censos', detail: 'Preposição — intervalo temporal entre dois censos.', icon: 'ArrowLeftRight' },
          { label: '× Conjunção', detail: '«Entre» não coordena orações.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Os» parece pronome demonstrativo — mas antecede substantivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Os = artigo · entre = preposição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto IBGE: habitantes, estimativa populacional, censo 2022, projeção, Minamiguchi.',
          'Trecho: «Os dados também são fundamentais... entre os censos».',
          '**Os** antecede «dados» → artigo definido plural.',
          '**Entre** introduz intervalo «entre os censos» → preposição.',
          'A conjunção coordenaria orações («e», «mas») — eliminar.',
          'C pronome + conjunção — eliminar.',
          'D pronome + preposição — «os» não é pronome aqui — eliminar.',
          'Gabarito B — artigo e preposição.',
          'Em similares: os + substantivo = artigo; entre + termos = preposição.',
        ],
        footer_rule: 'B — artigo e preposição.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'OS + ENTRE',
        rows: [
          { label: 'Os', value: 'Artigo definido plural — antecede «dados».' },
          { label: 'Entre', value: 'Preposição — relação de intervalo (entre censos).' },
          { label: '× pronome', value: '«Os» não substitui nome — determina-o.' },
          { label: 'Nesta questão', value: 'B — artigo e preposição.' },
          { label: 'Contexto', value: 'IBGE, estimativa, sociodemográficos, Minamiguchi, Boa Esperança.' },
        ],
        footer_rule: 'Artigo na frente · entre liga.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir artigo com pronome',
        items: [
          { label: 'A — conjunção', detail: '«Entre» liga substantivos, não orações inteiras.', correct: 'Preposição de lugar/tempo entre dois censos.' },
          { label: 'C — pronome', detail: '«Os» retoma «dados» mas com função de artigo.', correct: 'Antecede substantivo diretamente — artigo definido.' },
          { label: 'D — pronome + prep', detail: 'Mesmo erro em «os».', correct: 'Primeiro termo é artigo, não pronome demonstrativo.' },
          { label: 'Em outra banca…', detail: 'Trocam «entre os censos» por «durante os intervalos».', correct: '«Entre» continua preposição de relação.' },
        ],
        footer_rule: 'Só B — os + entre.',
      },
    ],
  },

  'selecon-fisc-classes-inteligencia-artificial-consegue-dec-3352885': {
    family: 'conceito',
    source_tec_id: '3352885',
    source_note: '«experiências» «conhecimentos» substantivos IA — SELECON Fisc Pref Sinop 2025 tec 3352885',
    meta: {
      banca: 'SELECON',
      prova: 'Fisc (Pref Sinop)',
      orgao: 'Pref Sinop',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Inteligência artificial consegue decifrar o que dizem textos de papiros históricos\n\n[...] Para que uma inteligência artificial (IA) seja usada para determinada função, ela é treinada, por meio de experiências, para que as máquinas adquiram conhecimentos e possam se adaptar às condições. [...] Com essa IA, especialistas decifram papiros de Herculano queimados na erupção do Vesúvio. Também foram decifradas tabuinhas de Creta com escrita «Linear B». A IA distingue a tinta do papiro carbonizado. Federica Nicolardi, papirologista da Universidade Federico II de Nápoles, celebrou o feito.\n\nNa passagem «ela é treinada, por meio de experiências, para que as máquinas adquiram conhecimentos», os termos destacados **experiências** e **conhecimentos** classificam-se, respectivamente, como:',
    options: [
      { id: 'A', text: 'advérbio e verbo', is_correct: false },
      { id: 'B', text: 'substantivo e verbo', is_correct: false },
      { id: 'C', text: 'adjetivo e substantivo', is_correct: false },
      { id: 'D', text: 'substantivo e substantivo', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nome × nome',
        chip_label: 'M03 — substantivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'As palavras nomeiam ou qualificam?', icon: 'Focus' },
          { label: 'Experiências', detail: 'Nomeia situações vividas no treinamento da IA.', icon: 'FlaskConical' },
          { label: 'Conhecimentos', detail: 'Nomeia saber adquirido pelas máquinas.', icon: 'BookOpen' },
          { label: 'Papiros / IA', detail: 'Texto: Herculano, Vesúvio, Linear B, papiro carbonizado, Nicolardi.', icon: 'Scroll' },
          { label: 'Treinamento', detail: '«Por meio de experiências» — máquinas adquirem conhecimentos.', icon: 'Cpu' },
          { label: 'Pegadinha', detail: '«Experiências» parece adjetivo verbal — é substantivo plural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ambos nomeiam — substantivos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: inteligência artificial, experiências, conhecimentos, máquinas, Herculano, Vesúvio, Linear B, Nicolardi.',
          'Trecho: «por meio de experiências» — meio/instrumento nomeado.',
          '«adquiram conhecimentos» — objeto nomeado adquirido.',
          'Experiências: substantivo comum plural — não advérbio.',
          'Conhecimentos: substantivo comum plural — não verbo.',
          'A advérbio + verbo — eliminar.',
          'B substantivo + verbo — eliminar.',
          'C adjetivo + substantivo — eliminar.',
          'Gabarito D — substantivo e substantivo.',
          'Em similares: «por meio de X» → X substantivo; «adquirir Y» → Y substantivo.',
        ],
        footer_rule: 'D — dois substantivos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUBSTANTIVO + SUBSTANTIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Nomeia coisa/ideia? → substantivo.' },
          { label: 'Experiências', value: 'Substantivo — meio de treinamento.' },
          { label: 'Conhecimentos', value: 'Substantivo — o que as máquinas adquirem.' },
          { label: '× verbo', value: '«Adquiram» é verbo — não «conhecimentos».' },
          { label: 'Nesta questão', value: 'D — substantivo e substantivo (papiros históricos).' },
        ],
        footer_rule: 'Nomeia × nomeia.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe errada por palavra',
        items: [
          { label: 'A — advérbio', detail: '«Experiências» não modifica verbo como «bem».', correct: 'Substantivo — instrumento do treinamento (por meio de...).' },
          { label: 'B — verbo', detail: '«Conhecimentos» é plural de nome, não ação.', correct: 'Verbo da oração é «adquiram» — conhecimentos é objeto nominal.' },
          { label: 'C — adjetivo', detail: '«Experiências» não qualifica outro nome.', correct: 'Núcleo do complemento nominal — substantivo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «dados» e «algoritmos».', correct: 'Mesmo teste morfológico — ambos substantivos.' },
        ],
        footer_rule: 'Só D — substantivo × substantivo.',
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
