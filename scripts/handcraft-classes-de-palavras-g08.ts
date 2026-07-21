#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g08 (8 slugs · Classes de palavras · lote 8 · Conjunção).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g08.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g08 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g08 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g08';
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
    'comparação acréscimo conclusão proporcional adversativa',
    'bem como portanto à medida que todavia',
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
      reviewer: 'handcraft:classes-de-palavras-g08',
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
  'avancasp-esc-classes-considere-o-texto-a-seguir-para-resp-3963891': {
    family: 'conceito',
    source_tec_id: '3963891',
    source_note: '«como» comparação mundo utópico — AVANÇASP Esc Pref Nova Odessa 2026 tec 3963891',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Nova Odessa)',
      orgao: 'Pref Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nNascer, crescer e evoluir... Muita gente diz que conviver com adultos é tarefa bem difícil! Estar entre bichos e crianças é como se dar ao luxo de viver, por pouco tempo que seja, em um mundo paralelo e utópico. Os animais de estimação, como gatos e cachorros, são dependentes de seus donos, o que nos deixa em uma posição superior e confortável. Mas não tiramos vantagem disso; ao contrário, somos loucos por eles, capazes de realizar caprichos e mimos diários. [...] As responsabilidades e a complexidade da vida adulta nos distanciam da infância e da honestidade da vida animal.\n\n(CLICKIDEIA. Nascer, crescer e evoluir...)\n\n«Estar entre bichos e crianças é como se dar ao luxo de viver (...) em um mundo paralelo e utópico.»\n\nA palavra destacada no trecho acima introduz o sentido de:',
    options: [
      { id: 'A', text: 'comparação.', is_correct: true },
      { id: 'B', text: 'conformidade.', is_correct: false },
      { id: 'C', text: 'consequência.', is_correct: false },
      { id: 'D', text: 'causa.', is_correct: false },
      { id: 'E', text: 'modo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Como na comparação',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Liga ideias? Qual relação: igualdade, causa, modo?', icon: 'Focus' },
          { label: 'É como se', detail: 'Estrutura comparativa — equipara conviver com bichos/crianças a um luxo.', icon: 'Scale' },
          { label: 'Mundo utópico', detail: 'Clickideia: bichos, crianças × vida adulta complexa.', icon: 'Sparkles' },
          { label: 'Comparação', detail: '«Como» introduz paralelo entre duas situações.', icon: 'CheckCircle' },
          { label: '× Causal', detail: 'Não explica motivo — cria imagem de semelhança.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Como» também é causal («como choveu») ou modo — leia o trecho inteiro.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'É como se = comparação.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → gabarito',
        meta: slideMeta,
        steps: [
          'Texto Clickideia «Nascer, crescer e evoluir»: conviver com adultos, animais de estimação, responsabilidades e complexidade.',
          'Trecho: «é como se dar ao luxo de viver em mundo paralelo e utópico».',
          '«Como se» equipara a experiência a um luxo imaginário — comparação.',
          'B conformidade seria «conforme», «segundo» — eliminar.',
          'C consequência pediria resultado («de modo que») — eliminar.',
          'D causa usaria «porque», «já que» — eliminar.',
          'E modo puro seria «da maneira que» sem «se» comparativo — eliminar.',
          'Gabarito A — comparação.',
          'Em similares: «é como se» entre bichos, crianças e mundo utópico paralelo — comparação.',
        ],
        footer_rule: 'A — «como» compara luxo utópico.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMO — VALORES',
        rows: [
          { label: 'Comparação', value: 'É como se / assim como / tal qual.' },
          { label: 'Causal', value: 'Como = porque (motivo).' },
          { label: 'Modo', value: 'Como = da maneira que.' },
          { label: 'Nesta questão', value: 'A — comparação («é como se»).' },
          { label: 'Contexto', value: 'Clickideia, conviver, estimação, vulneráveis, companheirismo, racionalidade humana.' },
        ],
        footer_rule: 'Contexto: luxo utópico = imagem comparativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outros valores do «como»',
        items: [
          { label: 'B — conformidade', detail: 'Confunde com «conforme» norma.', correct: '«Como se» cria paralelo imaginário — comparação.' },
          { label: 'C — consequência', detail: '«Como» parece ligar efeito.', correct: 'Não há ideia de resultado — há semelhança.' },
          { label: 'D — causa', detail: '«Como» frequentemente é causal em provas.', correct: 'Aqui não explica por quê — compara a experiência a luxo.' },
          { label: 'E — modo', detail: '«Como se» parece só modo de viver.', correct: 'O núcleo é equiparação (comparação), não circunstância de modo isolada.' },
          { label: 'Em outra banca…', detail: 'Trocam por «tal qual» ou «assim como».', correct: 'Mesmo teste: paralelo entre situações → comparação.' },
        ],
        footer_rule: 'Só A — comparação.',
      },
    ],
  },

  'selecon-acs-classes-considere-o-texto-a-seguir-para-resp-3990848': {
    family: 'conceito',
    source_tec_id: '3990848',
    source_note: '«bem como» acréscimo Ipea desinformação — SELECON ACS FeSaúde 2026 tec 3990848',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (FeSaúde)',
      orgao: 'FeSaúde',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nIpea faz pesquisa para combater desinformação sobre políticas públicas. Servidores públicos que ocupam cargo em comissão ou função de confiança da administração pública federal devem participar de pesquisa inédita sobre os efeitos das campanhas de desinformação na internet contra políticas públicas. [...] De acordo com o instituto, a pesquisa Desinformação e Políticas Públicas tem os seguintes propósitos:\n\nmapear como servidores e gestores públicos percebem, vivenciam e lidam com episódios de desinformação no cotidiano institucional, bem como os impactos desse fenômeno sobre os processos de formulação, implementação e avaliação de políticas públicas;\n\nconhecer efeitos sobre a exposição a informações imprecisas ou enganosas [...]\n\nNo trecho «mapear como servidores e gestores públicos percebem, vivenciam e lidam com episódios de desinformação no cotidiano institucional, bem como os impactos desse fenômeno sobre os processos de formulação, implementação e avaliação de políticas públicas», a expressão em destaque indica a noção de:',
    options: [
      { id: 'A', text: 'causa.', is_correct: false },
      { id: 'B', text: 'acréscimo.', is_correct: true },
      { id: 'C', text: 'consequência.', is_correct: false },
      { id: 'D', text: 'comparação de igualdade.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Bem como = e também',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O conectivo soma, opõe ou compara?', icon: 'Focus' },
          { label: 'Ipea / servidores', detail: 'Pesquisa com gestores públicos federais sobre desinformação.', icon: 'Building' },
          { label: 'Bem como', detail: 'Locução coordenativa aditiva — acrescenta outro objetivo da pesquisa.', icon: 'Plus' },
          { label: 'Mapear + impactos', detail: 'Duas metas paralelas do estudo do Ipea em políticas públicas.', icon: 'List' },
          { label: '× Causa', detail: 'Não introduz motivo — soma item à lista.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Como» dentro da oração ≠ «bem como» conectivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Bem como = acréscimo (adição).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Ipea: desinformação, servidores, gestores públicos, formulação, implementação, avaliação de políticas.',
          'Primeiro propósito: mapear percepção no cotidiano institucional.',
          '«Bem como» introduz segundo propósito: impactos nos processos.',
          'A causa exigiria «porque», «pois» — eliminar.',
          'C consequência pediria efeito posterior («de modo que») — eliminar.',
          'D comparação usaria «tal qual», «assim como» entre iguais — eliminar.',
          'B acréscimo: soma ideia equivalente a «e também» — correto.',
          'Gabarito B — acréscimo.',
          'Em similares: «bem como» na pesquisa Ipea sobre desinformação e políticas públicas.',
        ],
        footer_rule: 'B — bem como acrescenta objetivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'BEM COMO',
        rows: [
          { label: 'Valor', value: 'Acréscimo / adição entre orações ou termos.' },
          { label: 'Paráfrase', value: '«E também», «assim como» (adição).' },
          { label: '≠ causa', value: 'Não explica motivo.' },
          { label: 'Nesta questão', value: 'B — acréscimo de outro objetivo.' },
          { label: 'Contexto', value: 'Ipea, fenômeno, cotidiano, institucional, comunicação, decisões federais.' },
        ],
        footer_rule: 'Lista de propósitos → bem como soma.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir adição com outro valor',
        items: [
          { label: 'A — causa', detail: '«Impactos» parece explicar o mapeamento.', correct: '«Bem como» apenas acrescenta outro eixo — não justifica o anterior.' },
          { label: 'C — consequência', detail: 'Segundo item parece resultado do primeiro.', correct: 'São objetivos coordenados da pesquisa — adição, não efeito.' },
          { label: 'D — comparação', detail: '«Como» no meio do período confunde.', correct: '«Bem como» não compara igualdade — soma finalidade.' },
          { label: 'Em outra banca…', detail: 'Trocam por «e tampouco» ou «além disso».', correct: 'Mesmo valor aditivo de «bem como».' },
        ],
        footer_rule: 'Só B — acréscimo.',
      },
    ],
  },

  'vunesp-tenf-classes-leia-o-texto-a-seguir-para-responder-3999759': {
    family: 'conceito',
    source_tec_id: '3999759',
    source_note: '«portanto» → então álcool — VUNESP TEnf Pref Sorocaba 2026 tec 3999759',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Sorocaba)',
      orgao: 'Pref Sorocaba',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nConsumo abusivo de álcool é desafio nacional. [...] Segundo a OMS, não há dose segura para o consumo. O Denatran estima que 30% dos acidentes fatais envolvem motoristas sob efeito de álcool.\n\nNa passagem «Exigem-se, portanto, estratégias atualizadas e eficazes para vencer esses e outros obstáculos.», conforme o sentido que expressa, a conjunção destacada pode ser substituída por',
    options: [
      { id: 'A', text: 'todavia.', is_correct: false },
      { id: 'B', text: 'também.', is_correct: false },
      { id: 'C', text: 'então.', is_correct: true },
      { id: 'D', text: 'inclusive.', is_correct: false },
      { id: 'E', text: 'entretanto.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Portanto = conclusão',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Conclusão, oposição ou adição?', icon: 'Focus' },
          { label: 'Portanto', detail: 'Conjunção conclusiva — retoma problemas e indica medida necessária.', icon: 'ArrowRight' },
          { label: 'Então', detail: 'Sinônimo conclusivo aceito na substituição.', icon: 'CheckCircle' },
          { label: '× Adversativa', detail: 'Todavia/entretanto opõem — não concluem.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Inclusive» adiciona; «também» soma — não fecham raciocínio.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Portanto ≈ então (conclusão).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Editorial álcool: consumo abusivo, binge drinking, acidentes de trânsito.',
          'Período anterior lista obstáculos ao combate — Denatran, abstinência.',
          '«Exigem-se estratégias atualizadas e eficazes para vencer esses obstáculos».',
          '«Portanto» introduz conclusão lógica: precisam-se estratégias novas.',
          'A todavia / E entretanto marcam oposição — eliminar.',
          'B também / D inclusive marcam adição — eliminar.',
          'C então mantém valor conclusivo — correto.',
          'Gabarito C — então.',
          'Em similares: «portanto» após obstáculos do álcool → estratégias atualizadas.',
        ],
        footer_rule: 'C — portanto ≈ então (conclusão).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONCLUSIVAS',
        rows: [
          { label: 'Portanto', value: 'Conclusão a partir do que foi dito.' },
          { label: 'Então', value: 'Substituição conclusiva direta.' },
          { label: '× Adversativas', value: 'Todavia, entretanto, mas.' },
          { label: 'Nesta questão', value: 'C — então.' },
        ],
        footer_rule: 'Problema → portanto/então → solução.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar conclusão por outro conectivo',
        items: [
          { label: 'A — todavia', detail: 'Parece contrapor ao parágrafo anterior.', correct: '«Portanto» conclui, não opõe — todavia quebraria a lógica.' },
          { label: 'B — também', detail: 'Sugere mera adição de ideia.', correct: 'Falta fechamento conclusivo — «então» encaixa.' },
          { label: 'D — inclusive', detail: 'Inclui exemplo, não conclui.', correct: 'Período exige inferência final, não acréscimo.' },
          { label: 'E — entretanto', detail: 'Sinônimo de oposição como todavia.', correct: 'Valor adversativo — incorreto para «portanto».' },
          { label: 'Em outra banca…', detail: 'Trocam por «logo» ou «por isso».', correct: 'Mesma família conclusiva que «então».' },
        ],
        footer_rule: 'Só C substitui «portanto».',
      },
    ],
  },

  'cpcon-uepb-a-classes-leia-o-texto-01-para-responder-a-que-4014454': {
    family: 'conceito',
    source_tec_id: '4014454',
    source_note: '«à medida que» proporcional céu azul — CPCON UEPB ACS Pref Itabaiana 2026 tec 4014454',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Itabaiana)',
      orgao: 'Pref Itabaiana',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto 01 para responder à questão.\n\nTexto 01 — Não foi sempre azul: como a cor do céu mudou «dramaticamente» no planeta Terra (Catherine Heathwood, BBC World Service, 2026). [...]\n\nLeia o período a seguir retirado do Texto 01.\n\n«À medida que o planeta esfriou, uma hipótese indica que a atmosfera primitiva era formada principalmente por gases liberados por erupções vulcânicas e outras atividades geológicas — como dióxido de carbono e nitrogênio, além de pequenas quantidades de metano, com pouquíssimo oxigênio presente.»\n\nA expressão à medida que, no contexto, pode ser classificada como:',
    options: [
      { id: 'A', text: 'locução conjuntiva subordinativa causal.', is_correct: false },
      { id: 'B', text: 'locução conjuntiva coordenativa explicativa.', is_correct: false },
      { id: 'C', text: 'locução conjuntiva subordinativa proporcional.', is_correct: true },
      { id: 'D', text: 'conjunção subordinativa conformativa.', is_correct: false },
      { id: 'E', text: 'conjunção subordinativa temporal.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'À medida que',
        chip_label: 'M03 — proporcional',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Graduação simultânea entre fatos?', icon: 'Focus' },
          { label: 'Heathwood / BBC', detail: 'Texto 01: cor do céu, Rayleigh, atmosfera terrestre.', icon: 'Cloud' },
          { label: 'À medida que', detail: 'Locução proporcional — esfriamento acompanha atmosfera primitiva vulcânica.', icon: 'TrendingUp' },
          { label: 'Proporcional', detail: 'Um processo avança na mesma direção do outro.', icon: 'CheckCircle' },
          { label: '× Causal pura', detail: 'Não é só «porque» — há paralelismo de evolução.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Confundir com «na medida em que» (causal) ou temporal «quando».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'À medida que = proporcionalidade.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto BBC Heathwood: dispersão Rayleigh, atmosfera, dióxido carbono, nitrogênio, metano, oxigênio.',
          'Período: enquanto o planeta esfria, discute-se atmosfera primitiva e erupções vulcânicas.',
          '«À medida que» liga dois processos em gradação — proporcional.',
          'A causal isolada ignoraria simultaneidade gradativa — eliminar.',
          'B coordenativa explicativa usaria «pois», «porque» entre orações autônomas — eliminar.',
          'D conformativa seria «conforme», «segundo» — eliminar.',
          'E temporal puro seria «quando», «enquanto» sem ideia de proporção — eliminar.',
          'C locução subordinativa proporcional — correto.',
          'Gabarito C — locução proporcional.',
          'Em similares: «à medida que o planeta esfriou» × atmosfera primitiva (Heathwood/BBC).',
        ],
        footer_rule: 'C — à medida que = proporcional.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'À MEDIDA QUE',
        rows: [
          { label: 'Classe', value: 'Locução conjuntiva subordinativa proporcional.' },
          { label: 'Sentido', value: 'Graduação simultânea (à proporção que).' },
          { label: '≠ na medida em que', value: 'Causal/explicativa — cuidado.' },
          { label: 'Nesta questão', value: 'C — proporcional (esfriamento × atmosfera).' },
          { label: 'Contexto', value: 'Texto 01, Heathwood, primitiva, geológicas, fotossíntese, cianobactérias.' },
        ],
        footer_rule: 'Proporcional = dois processos em paralelo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Proporcional × causal × temporal',
        items: [
          { label: 'A — causal', detail: 'Esfriamento parece «causa» da atmosfera.', correct: 'Há gradação simultânea — locução proporcional, não só motivo.' },
          { label: 'B — coord. explicativa', detail: 'Segunda oração parece explicar a primeira.', correct: '«À medida que» subordina com proporção — não coordena.' },
          { label: 'D — conformativa', detail: '«Como» no período confunde com «conforme».', correct: '«À medida que» ≠ «consoante» — é proporcional.' },
          { label: 'E — temporal', detail: 'Há ideia de tempo no esfriamento.', correct: 'Marca proporção gradativa, não só circunstância temporal.' },
          { label: 'Em outra banca…', detail: 'Trocam por «ao passo que».', correct: 'Mesma família proporcional.' },
        ],
        footer_rule: 'Só C classifica corretamente.',
      },
    ],
  },

  'vunesp-aux-s-classes-leia-o-texto-para-responder-a-questa-3323733': {
    family: 'conceito',
    source_tec_id: '3323733',
    source_note: '«e a continuar assim» reescrita mas/caso — VUNESP Aux Sau Buc Pref Osasco 2025 tec 3323733',
    meta: {
      banca: 'VUNESP',
      prova: 'Aux Sau Buc (Pref Osasco)',
      orgao: 'Pref Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nA Santa Casa de Misericórdia de São Paulo anunciou a venda de sete imóveis [...] Na maior parte do País, em especial nas regiões mais carentes, o sistema está ruindo aos poucos, e a continuar assim o colapso pode ser súbito e brutal. [...] (O Estado de SP, 06.11.2024. Adaptado.)\n\nO trecho «... o sistema está ruindo aos poucos, e a continuar assim o colapso pode ser súbito e brutal.» (4º parágrafo) está corretamente reescrito, preservando seu sentido, em:',
    options: [
      {
        id: 'A',
        text: '... o sistema está ruindo aos poucos, mas o colapso pode ser súbito e brutal, caso continue assim.',
        is_correct: true,
      },
      {
        id: 'B',
        text: '... o sistema está ruindo aos poucos, porque o colapso pode ser súbito e brutal, para continuar assim.',
        is_correct: false,
      },
      {
        id: 'C',
        text: '... o sistema está ruindo aos poucos, porém o colapso pode ser súbito e brutal, apesar de continuar assim.',
        is_correct: false,
      },
      {
        id: 'D',
        text: '... o sistema está ruindo aos poucos, logo o colapso possa ser súbito e brutal, ainda que continue assim.',
        is_correct: false,
      },
      {
        id: 'E',
        text: '... o sistema está ruindo aos poucos, então o colapso pode ser súbito e brutal, de modo que continue assim.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'E a continuar assim',
        chip_label: 'M03 — reescrita',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual conectivo mantém oposição + condição?', icon: 'Focus' },
          { label: 'Ruína lenta', detail: 'Sistema deteriora gradualmente — Santa Casa / SUS.', icon: 'TrendingDown' },
          { label: 'Colapso brutal', detail: 'Se a tendência persistir, ruptura súbita.', icon: 'AlertTriangle' },
          { label: 'Mas + caso', detail: 'Oposição entre processo lento e risco condicionado.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Trocar «e a continuar» por causal ou conclusiva.', icon: 'GitBranch' },
        ],
        footer_rule: 'Mas + caso = adversidade + condição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Estadão: crise das Santas Casas e subfinanciamento do SUS.',
          'Original: ruína gradual «e a continuar assim» colapso súbito.',
          '«E a continuar assim» = se essa situação persistir (condição).',
          'A: «mas» opõe lentidão × violência do colapso; «caso continue» = condição — mantém sentido.',
          'B «porque... para» inverte lógica causal/final — eliminar.',
          'C «apesar de continuar» contradiz a condição do colapso — eliminar.',
          'D «logo... ainda que» mistura conclusão e concessão — eliminar.',
          'E «então... de modo que» conclusão/consecutiva errada — eliminar.',
          'Gabarito A — mas + caso.',
          'Em similares: «e a continuar assim» na crise das Santas Casas → mas + caso continue.',
        ],
        footer_rule: 'A — mas + caso preservam sentido.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REESCRITA',
        rows: [
          { label: 'Original', value: '«e a continuar assim» = se persistir.' },
          { label: 'Oposição', value: '«mas» entre lento e súbito.' },
          { label: 'Condição', value: '«caso continue assim».' },
          { label: 'Nesta questão', value: 'A — mas + caso.' },
        ],
        footer_rule: 'Não troque condição por concessão.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Conectivos que distorcem o sentido',
        items: [
          { label: 'B — porque/para', detail: 'Colapso vira causa ou fim da ruína.', correct: 'Original condiciona colapso à continuidade — não causaliza assim.' },
          { label: 'C — apesar de', detail: '«Porém» certo, mas «apesar de continuar» nega a condição.', correct: 'Colapso depende de continuar — não apesar disso.' },
          { label: 'D — logo/ainda que', detail: 'Conclusão + concessão inadequadas.', correct: 'Falta par «mas + caso» do original.' },
          { label: 'E — então/de modo que', detail: 'Transforma em conclusão forçada.', correct: 'Sentido é advertência condicional, não inferência «então».' },
          { label: 'Em outra banca…', detail: 'Trocam «e a continuar» por «se permanecer».', correct: 'Mesmo par: oposição + condição.' },
        ],
        footer_rule: 'Só A fecha o sentido.',
      },
    ],
  },

  'vunesp-age-p-classes-leia-o-texto-para-responder-a-questa-3336089': {
    family: 'conceito',
    source_tec_id: '3336089',
    source_note: '«justamente porque» = uma vez que saneamento — VUNESP Age Pref Pres Prudente 2025 tec 3336089',
    meta: {
      banca: 'VUNESP',
      prova: 'Age (Pref Pres Prudente)',
      orgao: 'Pref Pres Prudente',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nA tragédia das crianças sem saneamento. A falta de saneamento básico afasta milhões de crianças de zero a seis anos de suas atividades [...] Sem acesso a esgoto tratado e a creches, ou às vezes sem poder frequentar a creche, quando esta existe, justamente porque falta saneamento na região em que vivem, parte significativa das crianças brasileiras cresce com herança nefasta. [...] (Estadão, 13.10.2024. Adaptado.)\n\nA expressão entre colchetes corresponde ao sentido da expressão destacada em:',
    options: [
      {
        id: 'A',
        text: '... segue sendo negligenciado na fase da vida que é, segundo múltiplas evidências nacionais e internacionais... (1º parágrafo) [tal qual]',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Sem acesso a esgoto tratado e a creches, ou às vezes sem poder frequentar a creche, quando esta existe... (2º parágrafo) [caso]',
        is_correct: false,
      },
      {
        id: 'C',
        text: '... ou às vezes sem poder frequentar a creche, quando esta existe, justamente porque falta saneamento... (2º parágrafo) [uma vez que]',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'E esse é apenas um exemplo do quanto a falta do mínimo trava a capacidade de aprendizado... (3º parágrafo) [Tanto que]',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Não é surpresa, então, que jovens de 19 anos sem acesso a saneamento tenham, em média... (3º parágrafo) [entretanto]',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Justamente porque',
        chip_label: 'M02 — causal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O conectivo explica motivo ou opõe?', icon: 'Focus' },
          { label: 'Trata Brasil', detail: 'Crianças sem saneamento — negligenciadas na primeira infância.', icon: 'Droplets' },
          { label: 'Justamente porque', detail: 'Reforça causa — falta saneamento impede frequentar a creche.', icon: 'Link' },
          { label: 'Uma vez que', detail: 'Locução causal equivalente («visto que»).', icon: 'CheckCircle' },
          { label: '× Caso', detail: 'Condicional hipotética — não explica fato dado.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Tanto que» é consecutiva; «entretanto» é oposição.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Porque = uma vez que (causa).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Trata Brasil / Estadão: saneamento, esgoto tratado, creche, primeira infância, escolaridade, renda.',
          'Trecho: criança não frequenta creche justamente porque falta saneamento na região.',
          'Valor: causa/motivo do impedimento.',
          'A [tal qual] indicaria comparação — eliminar.',
          'B [caso] marcaria condição hipotética — eliminar.',
          'C [uma vez que] para «justamente porque» — causal — correto.',
          'D [Tanto que] consecutivo — eliminar.',
          'E [entretanto] adversativo — eliminar.',
          'Gabarito C — [uma vez que].',
          'Em similares: «justamente porque falta saneamento» na creche — Trata Brasil.',
        ],
        footer_rule: 'C — porque = uma vez que.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CAUSA',
        rows: [
          { label: 'Justamente porque', value: 'Causal enfática — motivo.' },
          { label: 'Uma vez que', value: 'Paráfrase causal (visto que).' },
          { label: '≠ caso', value: 'Hipótese, não motivo dado.' },
          { label: 'Nesta questão', value: 'C — 2º parágrafo.' },
          { label: 'Contexto', value: 'Paraguai, negligenciado, atividades, grávidas, adolescentes, escolaridade.' },
        ],
        footer_rule: 'Falta saneamento = causa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Colchete errado por parágrafo',
        items: [
          { label: 'A — [tal qual]', detail: '«Segundo evidências» parece comparação.', correct: 'Trecho não compara — cita fundamentação, não [tal qual].' },
          { label: 'B — [caso]', detail: '«Quando esta existe» parece condição.', correct: '«Caso» é hipótese; «porque» explica motivo real.' },
          { label: 'D — [Tanto que]', detail: '«Trava aprendizado» parece consequência.', correct: '«Tanto que» não substitui «justamente porque» do 2º parágrafo.' },
          { label: 'E — [entretanto]', detail: '«Então» no trecho parece oposição.', correct: '«Então» é conclusiva; «entretanto» não casa com «porque».' },
          { label: 'Em outra banca…', detail: 'Trocam por «pois» ou «visto que».', correct: 'Mesmo valor causal de [uma vez que].' },
        ],
        footer_rule: 'Só C casa com «justamente porque».',
      },
    ],
  },

  'avancasp-ag-classes-leia-o-texto-a-seguir-para-responder-3376862': {
    family: 'conceito',
    source_tec_id: '3376862',
    source_note: '«mas» → porém Carlos Chagas — AVANÇASP Ag Pref Morungaba 2025 tec 3376862',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref Morungaba)',
      orgao: 'Pref Morungaba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nCarlos Chagas: há 90 anos morria o único cientista a descrever completamente uma doença. [...] Chagas não levou o Nobel, mas acabou reconhecido com diversas outras honrarias nacionais e internacionais. [...] (VEIGA, E. BBC News Brasil. Adaptado.)\n\nEm «Chagas não levou o Nobel, mas acabou reconhecido com diversas outras honrarias nacionais e internacionais», a conjunção «mas» assinala uma relação semântica adversativa entre as orações do período. Esse mesmo sentido é mantido com a reescrita apresentada em:',
    options: [
      {
        id: 'A',
        text: 'Chagas não levou o Nobel, contanto que acabou reconhecido com diversas outras honrarias nacionais e internacionais.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Chagas não levou o Nobel, porém acabou reconhecido com diversas outras honrarias nacionais e internacionais.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Chagas não levou o Nobel, porquanto acabou reconhecido com diversas outras honrarias nacionais e internacionais.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Chagas não levou o Nobel, consoante acabou reconhecido com diversas outras honrarias nacionais e internacionais.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Chagas não levou o Nobel, se bem que acabou reconhecido com diversas outras honrarias nacionais e internacionais.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mas = porém',
        chip_label: 'M02 — adversativa',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Oposição entre ideias?', icon: 'Focus' },
          { label: 'Não levou Nobel', detail: 'Frustração ou lacuna no prêmio máximo.', icon: 'Award' },
          { label: 'Mas / porém', detail: 'Contraste: reconhecimento amplo mesmo sem Nobel.', icon: 'GitCompare' },
          { label: '× Causal', detail: 'Porquanto indicaria motivo — não oposição.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Se bem que» é concessiva; «contanto que» é condicional.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mas ≈ porém (adversativa).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto BBC: biografia de Carlos Chagas e doença de Chagas.',
          'Período contrasta ausência do Nobel com outras honrarias.',
          'Relação pedida: adversativa (mas).',
          'A contanto que = condição — eliminar.',
          'B porém = adversativa direta — correto.',
          'C porquanto = causa — eliminar.',
          'D consoante = conformidade — eliminar.',
          'E se bem que = concessão (matiza, não opõe igual) — eliminar.',
          'Gabarito B — porém.',
          'Em similares: «mas» entre Nobel e honrarias de Carlos Chagas — troque por todavia/contudo.',
        ],
        footer_rule: 'B — mas ≈ porém adversativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADVERSATIVAS',
        rows: [
          { label: 'Mas / porém', value: 'Oposição entre orações.' },
          { label: 'Contanto que', value: 'Condição.' },
          { label: 'Porquanto', value: 'Causa.' },
          { label: 'Se bem que', value: 'Concessão.' },
          { label: 'Nesta questão', value: 'B — porém.' },
        ],
        footer_rule: 'Nobel × honrarias = contraste.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Parecem sinônimos de «mas»',
        items: [
          { label: 'A — contanto que', detail: 'Sugere que honrarias dependem de condição.', correct: '«Mas» opõe fatos — não subordina condicionalmente.' },
          { label: 'C — porquanto', detail: 'Honrarias parecem explicar a falta do Nobel.', correct: 'Valor causal — não adversativo.' },
          { label: 'D — consoante', detail: 'Parece «de acordo com» reconhecimento.', correct: 'Conformativa — não substitui «mas».' },
          { label: 'E — se bem que', detail: 'Concessão aceita contraste fraco.', correct: 'Adversativa plena exige «porém», não concessão.' },
          { label: 'Em outra banca…', detail: 'Trocam por «todavia» ou «contudo».', correct: 'Mesma oposição que «porém».' },
        ],
        footer_rule: 'Só B mantém adversativa.',
      },
    ],
  },

  'vunesp-ag-pr-classes-por-que-agora-a-solidao-nos-adoece-p-3419024': {
    family: 'conceito',
    source_tec_id: '3419024',
    source_note: 'Todavia + entretanto opositivas solidão — VUNESP Ag Pref Itapevi 2025 tec 3419024',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itapevi)',
      orgao: 'Pref Itapevi',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Por que agora a solidão nos adoece? (Leon Ferrari — Estadão, adaptado.) [...] Hoje, todavia, segundo os especialistas, a solidão é mais prevalente e intensa do que nunca. [...] Entretanto a redução de interações pode ser feita com um objetivo maior [...] não estando, portanto, associada a alguma repercussão negativa. Nesse caso, falamos de solitude.\n\nAssinale a alternativa em que as duas conjunções destacadas estabelecem no texto a mesma relação de sentido.',
    options: [
      {
        id: 'A',
        text: 'Se pensarmos nos primatas, humanos e não-humanos...; ... não estando, portanto, associada a alguma repercussão...',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Hoje, todavia, segundo os especialistas, a solidão...; Entretanto a redução de interações pode ser feita com um objetivo...',
        is_correct: true,
      },
      {
        id: 'C',
        text: '... não estando, portanto, associada a alguma repercussão...; Mas não falamos sobre a importância...',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Entretanto a redução de interações pode ser feita com um objetivo...; ... efetivas relações sociais e pensar que elas são sempre...',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Mas não falamos sobre a importância...; ... efetivas relações sociais e pensar que elas são sempre...',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mesma relação de sentido',
        chip_label: 'M03 — adversativa',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Os dois conectivos têm o mesmo valor?', icon: 'Focus' },
          { label: 'Todavia', detail: 'Contrasta passado evolutivo × solidão atual epidêmica.', icon: 'TrendingUp' },
          { label: 'Entretanto', detail: 'Contrasta solidão-doença × solitude escolhida.', icon: 'GitCompare' },
          { label: 'Opositivas', detail: 'Ambas adversativas — opõem ideias.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Misturar condicional (se), conclusiva (portanto) ou aditiva (e).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Todavia + entretanto = oposição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Ferrari/Murthy: solidão evolutiva × epidemia atual × solitude.',
          'Comando: par de conjunções com MESMA relação semântica.',
          'A: «Se» condicional × «portanto» conclusivo — valores distintos — eliminar.',
          'B: «Todavia» (4º par.) × «Entretanto» (6º par.) — ambas adversativas — correto.',
          'C: «Portanto» conclusivo × «Mas» opositivo — eliminar.',
          'D: «Entretanto» opositivo × «e» aditivo — eliminar.',
          'E: «Mas» opositivo × «e» aditivo — eliminar.',
          'Gabarito B.',
          'Em similares: todavia / entretanto / contudo / porém — mesma família.',
        ],
        footer_rule: 'B — duas adversativas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PARES DE VALOR',
        rows: [
          { label: 'Adversativas', value: 'Mas, porém, todavia, entretanto, contudo.' },
          { label: 'Conclusivas', value: 'Portanto, logo, então.' },
          { label: 'Condicionais', value: 'Se, caso, contanto que.' },
          { label: 'Nesta questão', value: 'B — todavia + entretanto.' },
        ],
        footer_rule: 'Classifique cada conectivo antes de comparar.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares com valores mistos',
        items: [
          { label: 'A — Se / portanto', detail: '«Se pensarmos» abre condição; «portanto» conclui.', correct: 'Valores diferentes — não é o par pedido.' },
          { label: 'C — portanto / Mas', detail: 'Conclusão × oposição.', correct: 'Relações distintas — eliminar.' },
          { label: 'D — Entretanto / e', detail: 'Segunda conjunção é aditiva entre ideias.', correct: '«E» soma — não repete adversativa de «entretanto».' },
          { label: 'E — Mas / e', detail: '«Mas» opõe; «e» coordena aditivamente.', correct: 'Par misto — incorreto.' },
          { label: 'Em outra banca…', detail: 'Trocam por «contudo» e «porém».', correct: 'Mesmo teste: duas adversativas no par.' },
        ],
        footer_rule: 'Só B iguala adversativas.',
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
