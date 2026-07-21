#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — oracoes-coordenadas-e-subordinadas-g04 (8 slugs · Orações coordenadas e subordinadas · lote 4).
 *
 *   npx tsx scripts/handcraft-oracoes-coordenadas-e-subordinadas-g04.ts
 *   npm run audit:questao-readiness -- --lote=oracoes-coordenadas-e-subordinadas-g04 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=oracoes-coordenadas-e-subordinadas-g04 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'oracoes-coordenadas-e-subordinadas-g04';
const SUBTOPICO = 'Orações coordenadas e subordinadas';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_oracoes_subordinadas';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-apice-portugues-oracoes-adversativa-pocinhos.json';

const ORACOES_SOURCE = {
  id: 'pt-oracoes-subordinadas-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Orações coordenadas e subordinadas — dependência, conectivos e classificação',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'coordenação × subordinação',
    'oração subordinada adverbial final reduzida de infinitivo',
    'oração subordinada adverbial condicional',
    'oração subordinada adverbial concessiva',
    'oração subordinada adverbial consecutiva (tão…que)',
    '«ao» + infinitivo × «ao» + substantivo (contração)',
    'vírgula isolando oração adverbial deslocada',
    'pergunta-teste de dependência',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment';

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
  guidelineOverride?: string;
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
      reviewer: 'handcraft:oracoes-coordenadas-e-subordinadas-g04',
      guideline_snapshot:
        spec.guidelineOverride ??
        `M07 Elias TE-simples — trilho período → dependência → conectivo · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      ORACOES_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'coordenação e subordinação'],
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
  'avancasp-esc-oracoes-leia-o-texto-a-seguir-para-responder-3826729': {
    family: 'text_fragment',
    source_tec_id: '3826729',
    source_note:
      'A pescaria inesquecível — «para» reduzida final × a fim de/afim — AVANÇASP Esc (Pref Vinhedo) 2026 tec 3826729',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «pai e filho saíram no fim da tarde para pegar apenas peixes cuja captura estava liberada», a palavra destacada pode ser substituída corretamente por:',
    text_fragment:
      '<p>«A pescaria inesquecível» (adaptado). «Pai e filho saíram no fim da tarde <strong>para</strong> pegar apenas peixes cuja captura estava liberada».</p>',
    options: [
      { id: 'A', text: '«para que», com sentido de causa.', is_correct: false },
      { id: 'B', text: '«afim de», com sentido de afinidade.', is_correct: false },
      { id: 'C', text: '«afim de», com sentido de finalidade.', is_correct: false },
      { id: 'D', text: '«a fim de», com sentido de afinidade.', is_correct: false },
      { id: 'E', text: '«a fim de», com sentido de finalidade.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«Para» reduzida final',
        chip_label: 'Locução, não afinidade',
        meta: slideMeta,
        items: [
          {
            label: 'Oração reduzida',
            detail: '«Para pegar» = oração subordinada adverbial final reduzida de infinitivo.',
            icon: 'GitBranch',
          },
          {
            label: 'Locução equivalente',
            detail: '«A fim de» substitui «para» mantendo o sentido de finalidade.',
            icon: 'Link',
          },
          {
            label: 'Grafia',
            detail: '«A fim de» (separado) ≠ «afim de» (junto, = semelhante, afinidade).',
            icon: 'Layers',
          },
          {
            label: 'Pegadinha',
            detail: 'Trocar «a fim de» (finalidade) por «afim de» (afinidade) é a armadilha clássica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'A fim de = para; afim = semelhante.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Peixe devolvido → cargo',
        meta: slideMeta,
        steps: [
          'Trecho da pescaria: «para pegar apenas peixes cuja captura estava liberada» explica o propósito da saída.',
          'A: «para que» pede oração desenvolvida com verbo flexionado — aqui o verbo já está no infinitivo (pegar).',
          'B/C: «afim de» (junto) significa «semelhante» e não substitui a ideia de finalidade sem mudar o sentido.',
          'D: «a fim de» está certo na grafia, mas «afinidade» não é o sentido do trecho — é finalidade.',
          '«Para pegar» = «a fim de pegar»: mesma locução, mesmo sentido de propósito.',
          'Gabarito E — «a fim de» com sentido de finalidade.',
          'Em similares: teste sempre grafia (a fim de × afim) e sentido (finalidade × afinidade) juntos.',
        ],
        footer_rule: 'Para + infinitivo = a fim de, sentido de finalidade.',
      },
      {
        type: 'golden_rule',
        slide_title: 'A fim de × afim',
        meta: slideMeta,
        content: 'A FIM DE × AFIM',
        rows: [
          { label: 'A fim de', value: 'Locução prepositiva separada — introduz finalidade (= para).' },
          { label: 'Afim', value: 'Adjetivo junto — significa semelhante, relacionado (afinidade).' },
          { label: 'Para + infinitivo', value: 'Introduz oração subordinada adverbial final reduzida.' },
          { label: 'Teste', value: 'Substitua por «com o objetivo de»: se encaixar, é finalidade.' },
          { label: 'Nesta questão', value: 'para → a fim de, sentido de finalidade (E)' },
        ],
        footer_rule: 'Grafia separada + sentido de propósito = finalidade.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar grafia e sentido',
        items: [
          {
            label: 'A — para que',
            detail: 'Verbo no infinitivo parece pedir oração causal com «para que».',
            correct: '«Para que» exige verbo flexionado; aqui o verbo é infinitivo (pegar).',
          },
          {
            label: 'B — afim de + afinidade',
            detail: '«Afim» parece só uma variante de grafia de «a fim».',
            correct: '«Afim» (junto) = semelhante; não carrega o sentido de propósito do trecho.',
          },
          {
            label: 'C — afim de + finalidade',
            detail: 'O sentido está certo, mas a grafia junta muda a palavra.',
            correct: 'Grafia junta («afim de») é sempre sentido de afinidade, nunca de finalidade.',
          },
          {
            label: 'D — a fim de + afinidade',
            detail: 'Grafia separada correta engana quanto ao sentido.',
            correct: 'Grafia certa, mas o sentido do trecho é propósito (finalidade), não semelhança.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem cobrar «a fim de que» com verbo flexionado no lugar do infinitivo.',
            correct: 'Mesmo trilho: «a fim de/que» = finalidade; «afim» = semelhança.',
          },
        ],
        footer_rule: 'E: a fim de, sentido de finalidade.',
      },
    ],
  },

  'instituto-ao-oracoes-o-texto-a-seguir-refere-se-a-questao-3841113': {
    family: 'text_fragment',
    source_tec_id: '3841113',
    source_note:
      'Multitarefa e o cérebro — «ao» temporal × contração — Instituto AOCP Ass (UNIRIO) 2026 tec 3841113',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que o termo «ao» NÃO introduz um segmento textual que veicula uma circunstância de tempo.',
    text_fragment:
      '<p>Trecho sobre multitarefa e o cérebro (adaptado). Comando pede a alternativa em que «ao» não marca circunstância de tempo.</p>',
    options: [
      { id: 'A', text: '«[...] ao mudar de atividade, o cérebro precisa se reajustar [...]».', is_correct: false },
      {
        id: 'B',
        text: '«Participar de uma reunião, checar mensagens e adiantar um relatório ao mesmo tempo.»',
        is_correct: false,
      },
      { id: 'C', text: '«[...] adultos são mais propensos a cometer deslizes ao dirigir [...]».', is_correct: false },
      {
        id: 'D',
        text: '«[...] ao pular de uma tarefa para outra sem pausa, nosso cérebro não tem tempo [...]».',
        is_correct: false,
      },
      { id: 'E', text: '«Tudo isso, a médio prazo, abre caminho ao esgotamento mental [...]».', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«Ao» nem sempre é tempo',
        chip_label: 'Contração ≠ oração temporal',
        meta: slideMeta,
        items: [
          {
            label: 'Ao + infinitivo',
            detail: '«Ao mudar», «ao dirigir», «ao pular» = quando + verbo — oração adverbial temporal reduzida.',
            icon: 'GitBranch',
          },
          {
            label: 'Ao + substantivo',
            detail: '«Ao esgotamento mental» = a (preposição) + o (artigo) + substantivo — só contração, sem oração.',
            icon: 'Link',
          },
          {
            label: 'Ao mesmo tempo',
            detail: 'Locução fixa de simultaneidade — também marca tempo, mesmo sem infinitivo.',
            icon: 'ListOrdered',
          },
          {
            label: 'Pegadinha',
            detail: '«Abre caminho ao esgotamento» parece tempo, mas é objeto indireto — não há verbo depois do «ao».',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ao + verbo = tempo; ao + substantivo = só contração.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Multitarefa → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre multitasking: comando pede o «ao» que NÃO marca tempo.',
          'A: «ao mudar de atividade» — ao + infinitivo = «quando muda» — temporal.',
          'B: «ao mesmo tempo» — locução de simultaneidade — também temporal.',
          'C: «ao dirigir» — ao + infinitivo = «quando dirige» — temporal.',
          'D: «ao pular de uma tarefa» — ao + infinitivo = «quando pula» — temporal.',
          'E: «ao esgotamento mental» — «ao» + substantivo, sem verbo — é só contração (a+o), não marca tempo.',
          'Gabarito E. Em similares: se depois do «ao» vem substantivo (não infinitivo), não há oração temporal.',
        ],
        footer_rule: 'Ao + substantivo sem verbo = sem oração temporal.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ao + quê decide',
        meta: slideMeta,
        content: 'AO + QUÊ DECIDE',
        rows: [
          { label: 'Ao + infinitivo', value: 'Equivale a «quando» — introduz oração adverbial temporal reduzida.' },
          { label: 'Ao + substantivo', value: 'Contração a+o — só liga o verbo a um complemento, sem oração.' },
          { label: 'Ao mesmo tempo', value: 'Locução fixa de simultaneidade — mesmo valor temporal.' },
          { label: 'Teste', value: 'Depois do «ao» há verbo no infinitivo? Sim → tempo.' },
          { label: 'Nesta questão', value: '«ao esgotamento» → sem verbo → não é tempo (E)' },
        ],
        footer_rule: 'Sem infinitivo depois do «ao», não há oração temporal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Achar que todo «ao» marca tempo',
        items: [
          {
            label: 'A — ao mudar de atividade',
            detail: 'Tem «ao» + verbo, parece a exceção fácil de marcar.',
            correct: '«Ao mudar» = quando muda — temporal, não é a exceção.',
          },
          {
            label: 'B — ao mesmo tempo',
            detail: 'Sem infinitivo logo depois, pode parecer que não é tempo.',
            correct: 'Locução fixa «ao mesmo tempo» também marca simultaneidade — é temporal.',
          },
          {
            label: 'C — ao dirigir',
            detail: 'Verbo comum, fácil de confundir com outro valor.',
            correct: '«Ao dirigir» = quando dirige — temporal.',
          },
          {
            label: 'D — ao pular de uma tarefa',
            detail: 'Frase longa distrai da estrutura «ao + infinitivo».',
            correct: '«Ao pular» = quando pula — temporal, segue o mesmo padrão.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «esgotamento» por outro substantivo abstrato após «ao».',
            correct: 'Mesmo trilho: ao + substantivo (sem verbo) nunca é oração temporal.',
          },
        ],
        footer_rule: 'E: «ao esgotamento» não introduz tempo.',
      },
    ],
  },

  'instituto-ao-oracoes-o-texto-a-seguir-refere-se-a-questao-3841158': {
    family: 'text_fragment',
    source_tec_id: '3841158',
    source_note:
      'Multitarefa e o cérebro — vírgula isolando adverbial deslocada — Instituto AOCP Ass (UNIRIO) 2026 tec 3841158',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que o uso da(s) vírgula(s) se justifica porque ela(s) isola(m) uma oração adverbial deslocada de sua posição canônica.',
    text_fragment:
      '<p>Mesmo texto sobre multitarefa e o cérebro (adaptado). Comando pede a vírgula que isola oração adverbial fora da posição habitual.</p>',
    options: [
      {
        id: 'A',
        text: '«O multitasking também reduz a criatividade, que é estimulada quando a mente está livre de exigências complexas.»',
        is_correct: false,
      },
      {
        id: 'B',
        text: '«[...] não estamos presente de verdade, mas divididos em multitarefas no presencial e no online.»',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«Um estudo publicado no Journal of Experimental Psychology mostra que, ao mudar de atividade, o cérebro precisa se reajustar [...]»',
        is_correct: true,
      },
      {
        id: 'D',
        text: '«Um estudo dos departamentos de psicologia da Iowa State University e da California State University Northridge, publicado no mês passado na Frontiers in Psychology, mostrou que [...]»',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«Uma pesquisa de 2018, por exemplo, descobriu que adultos são mais propensos a cometer deslizes ao dirigir se estiverem realizando outras tarefas ao mesmo tempo [...]»',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgulas isolando oração deslocada',
        chip_label: 'Posição incomum pede vírgula',
        meta: slideMeta,
        items: [
          {
            label: 'Posição canônica',
            detail: 'Advérbio geralmente vem depois da oração principal — «o cérebro se reajusta ao mudar de atividade».',
            icon: 'GitBranch',
          },
          {
            label: 'Deslocamento',
            detail: 'Em C, «ao mudar de atividade» aparece antes do verbo principal, entre vírgulas.',
            icon: 'Link',
          },
          {
            label: 'Função da vírgula',
            detail: 'As duas vírgulas isolam a oração adverbial que «invadiu» o meio da frase.',
            icon: 'Layers',
          },
          {
            label: 'Pegadinha',
            detail: 'Vírgula antes de «que» explicativo ou de aposto não isola oração deslocada — é outra função.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vírgula dupla no meio = oração adverbial fora do lugar.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Vírgula fora do lugar → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre multitasking: comando pede a vírgula que isola oração adverbial deslocada.',
          'A: vírgula antes de «que é estimulada» isola oração adjetiva explicativa, não adverbial.',
          'B: vírgula está entre orações coordenadas («mas divididos») — não é deslocamento de adverbial.',
          'D: vírgulas isolam aposto/explicação sobre o estudo, não uma oração adverbial.',
          'E: «se estiverem realizando…» está na posição normal, ao final — não está deslocada.',
          'C: «que, ao mudar de atividade, o cérebro precisa» — a oração temporal está entre o «que» e o verbo, fora do lugar comum.',
          'Gabarito C. Em similares: procure a oração adverbial encravada entre vírgulas, longe do fim da frase.',
        ],
        footer_rule: 'Duas vírgulas no meio isolam o advérbio deslocado.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Vírgula e deslocamento',
        meta: slideMeta,
        content: 'VÍRGULA E DESLOCAMENTO',
        rows: [
          { label: 'Posição canônica', value: 'Oração adverbial no fim: «o cérebro se reajusta ao mudar de atividade».' },
          { label: 'Deslocada', value: 'Oração adverbial no meio/início, isolada por vírgula(s).' },
          { label: '≠ Explicativa', value: 'Vírgula antes de «que» explicativo isola adjetiva, não adverbial.' },
          { label: '≠ Aposto', value: 'Vírgulas em torno de aposto explicam um substantivo, não deslocam advérbio.' },
          { label: 'Nesta questão', value: '«que, ao mudar de atividade,» → adverbial deslocada (C)' },
        ],
        footer_rule: 'Duas vírgulas isolando um advérbio fora do fim = deslocamento.',
      },
      {
        type: 'danger_zone',
        meta: slideMeta,
        content: 'Confundir função da vírgula',
        items: [
          {
            label: 'A — que é estimulada',
            detail: 'Vírgula antes de «que» parece igual à de C.',
            correct: 'Isola oração adjetiva explicativa (explica «criatividade»), não adverbial deslocada.',
          },
          {
            label: 'B — mas divididos',
            detail: 'Vírgula entre duas ideias parece deslocamento.',
            correct: 'Separa orações coordenadas por «mas» — função de coordenação, não de deslocamento.',
          },
          {
            label: 'D — publicado no mês passado',
            detail: 'Duas vírgulas seguidas sugerem oração isolada.',
            correct: 'Isolam aposto/explicação sobre o estudo — não é oração adverbial.',
          },
          {
            label: 'E — se estiverem realizando',
            detail: 'Tem valor condicional, parece candidata.',
            correct: 'Está na posição final normal — não houve deslocamento.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar a oração temporal por uma causal ou condicional deslocada.',
            correct: 'Mesmo trilho: vírgulas isolando advérbio fora da posição final = deslocamento.',
          },
        ],
        footer_rule: 'C: vírgulas isolam a oração temporal deslocada.',
      },
    ],
  },

  'educa-pb-ag-oracoes-leia-o-texto-a-seguir-para-responder-3913759': {
    family: 'text_fragment',
    source_tec_id: '3913759',
    source_note:
      'IA e desemprego — «se» condicional × dúvida/comparação/explicação — EDUCA PB Ag Adm (Pref Cajazeiras) 2026 tec 3913759',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref. Cajazeiras',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe o trecho: «[...] e, se as alucinações forem controladas e não houver muitos novos danos, o chatGPT permanecerá sendo muito usado.» Nesse caso, o emprego do «se» introduz ideia de:',
    text_fragment:
      '<p>«A Inteligência Artificial vai desempregar muita gente» (adaptado). «[...] e, <strong>se</strong> as alucinações forem controladas e não houver muitos novos danos, o chatGPT permanecerá sendo muito usado».</p>',
    options: [
      { id: 'A', text: 'Dúvida.', is_correct: false },
      { id: 'B', text: 'Condição.', is_correct: true },
      { id: 'C', text: 'Comparação.', is_correct: false },
      { id: 'D', text: 'Explicação.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«Se» condicional',
        chip_label: 'Nem toda dúvida é «se»',
        meta: slideMeta,
        items: [
          {
            label: 'Estrutura condicional',
            detail: '«Se X e não houver Y, então Z» — hipótese que decide o resultado.',
            icon: 'GitBranch',
          },
          {
            label: 'Teste da condição',
            detail: 'Substitua por «caso»: «caso as alucinações sejam controladas» — mantém o sentido.',
            icon: 'Link',
          },
          {
            label: '≠ Dúvida',
            detail: '«Se» de dúvida aparece em interrogativa indireta («não sei se vai chover»), não é o caso aqui.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'O «se» condicional decide o futuro do chatGPT — sem ele, a frase perde a hipótese.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Se = caso → condição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'ChatGPT e as alucinações → cargo',
        meta: slideMeta,
        steps: [
          'Trecho sobre IA: «se as alucinações forem controladas e não houver muitos novos danos, o chatGPT permanecerá muito usado».',
          'A: dúvida pede verbo de incerteza (não sei se, pergunto se) — não há isso aqui.',
          'C: comparação exigiria «como» ou «tanto quanto» — não há comparação entre dois termos.',
          'D: explicação usa «pois», «já que» — o «se» aqui não justifica, apenas condiciona.',
          'Trocando «se» por «caso»: «caso as alucinações sejam controladas…» — sentido idêntico.',
          'Gabarito B — condição: o uso futuro do chatGPT depende dessa hipótese.',
          'Em similares: teste sempre a troca por «caso» — se funcionar, é condicional.',
        ],
        footer_rule: 'Se = caso → introduz condição.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Se condicional',
        meta: slideMeta,
        content: 'SE CONDICIONAL',
        rows: [
          { label: 'Condicional', value: 'Se = caso — introduz hipótese que determina a consequência.' },
          { label: 'Dúvida', value: 'Se = incerteza — só em orações interrogativas indiretas (não sei se).' },
          { label: 'Comparação', value: 'Exige «como», «tanto quanto» — nunca só «se».' },
          { label: 'Teste', value: 'Substitua «se» por «caso»: manteve o sentido? → condicional.' },
          { label: 'Nesta questão', value: 'se → condição (B)' },
        ],
        footer_rule: 'Troca por «caso» confirma a condicional.',
      },
      {
        type: 'danger_zone',
        meta: slideMeta,
        content: 'Confundir se condicional com outros valores',
        items: [
          {
            label: 'A — dúvida',
            detail: '«Se» sozinho pode lembrar incerteza.',
            correct: 'Dúvida pede verbo de incerteza (não sei se); aqui há hipótese clara, não pergunta.',
          },
          {
            label: 'C — comparação',
            detail: 'Duas orações parecem comparáveis.',
            correct: 'Comparação exige «como»/«tanto quanto»; não há esse conectivo.',
          },
          {
            label: 'D — explicação',
            detail: 'A frase parece justificar o uso do chatGPT.',
            correct: 'Explicação usa «pois/já que»; aqui «se» apenas condiciona o resultado.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «se» por «desde que» no mesmo sentido condicional.',
            correct: 'Mesmo trilho: teste a troca por «caso» — condição, não dúvida.',
          },
        ],
        footer_rule: 'B: se introduz condição.',
      },
    ],
  },

  'educa-pb-ag-oracoes-leia-o-texto-a-seguir-e-responda-a-q-3913803': {
    family: 'text_fragment',
    source_tec_id: '3913803',
    source_note:
      'Casamento, uma invenção cristã — principal + subordinada adverbial condicional — EDUCA PB Ag Adm (Pref Cajazeiras) 2026 tec 3913803',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref. Cajazeiras',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Releia o trecho: «Se uma esposa morresse, o viúvo se casaria com a irmã dela.» É CORRETO afirmar que sua estrutura é composta por:',
    text_fragment:
      '<p>«Casamento, uma invenção cristã» (adaptado). «<strong>Se</strong> uma esposa morresse, o viúvo se casaria com a irmã dela».</p>',
    options: [
      { id: 'A', text: 'Duas orações, sendo uma principal e uma subordinada adverbial condicional.', is_correct: true },
      { id: 'B', text: 'Duas orações coordenadas, unidas por conectivo adversativo.', is_correct: false },
      { id: 'C', text: 'Três orações, sendo duas principais e uma subordinada causal.', is_correct: false },
      { id: 'D', text: 'Uma oração principal e uma subordinada substantiva objetiva direta.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«Se» + duas orações',
        chip_label: 'Conta e classifica',
        meta: slideMeta,
        items: [
          {
            label: 'Conta os verbos',
            detail: '«Morresse» + «casaria» = dois verbos, duas orações.',
            icon: 'ListOrdered',
          },
          {
            label: 'Dependência',
            detail: '«Se uma esposa morresse» é hipótese — depende da principal para completar o sentido.',
            icon: 'GitBranch',
          },
          {
            label: 'Conectivo «se»',
            detail: 'Introduz condição, não causa nem objeto direto — clássico adjunto condicional.',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: '«Se» condicional é confundido com «se» causal («já que») em provas — teste a troca por «caso».',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Se + hipótese = subordinada adverbial condicional.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Viúvo e a irmã → cargo',
        meta: slideMeta,
        steps: [
          'Trecho sobre casamento medieval: «Se uma esposa morresse, o viúvo se casaria com a irmã dela».',
          'B: não há conectivo adversativo (mas, porém) — não é coordenação.',
          'C: só há dois verbos (morresse, casaria) — não há três orações nem causal.',
          'D: não há verbo que exija complemento direto introduzido por «se» — não é substantiva objetiva direta.',
          '1ª oração: «se uma esposa morresse» — hipótese, depende da principal.',
          '2ª oração: «o viúvo se casaria com a irmã dela» — oração principal, completa o sentido.',
          'Gabarito A. Em similares: «se» + subjuntivo/futuro do pretérito = condicional quase sempre.',
        ],
        footer_rule: 'Se + subjuntivo → subordinada adverbial condicional.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Principal + condicional',
        meta: slideMeta,
        content: 'PRINCIPAL + CONDICIONAL',
        rows: [
          { label: 'Estrutura', value: 'Se + hipótese (subordinada) + consequência (principal).' },
          { label: 'Verbo típico', value: 'Subjuntivo (morresse) na condicional; futuro do pretérito (casaria) na principal.' },
          { label: '≠ Causal', value: 'Causal exige «porque/já que», não «se».' },
          { label: '≠ Objetiva direta', value: 'Exigiria verbo de discurso/pensamento antes do «se».' },
          { label: 'Nesta questão', value: 'se + morresse → subordinada adverbial condicional (A)' },
        ],
        footer_rule: 'Duas orações: condicional + principal.',
      },
      {
        type: 'danger_zone',
        meta: slideMeta,
        content: 'Trocar condicional por outra classificação',
        items: [
          {
            label: 'B — coordenadas adversativas',
            detail: 'Duas orações completas parecem coordenação.',
            correct: 'Falta conectivo adversativo (mas/porém); a relação é de dependência (condição).',
          },
          {
            label: 'C — três orações, causal',
            detail: 'A frase parece mais longa do que é.',
            correct: 'Há só dois verbos — duas orações; e «se» não é causal, é condicional.',
          },
          {
            label: 'D — substantiva objetiva direta',
            detail: '«Se» pode lembrar dúvida/objeto em outras frases.',
            correct: 'Não há verbo de discurso pedindo complemento — «se» aqui é condição, não OD.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar o verbo para o presente do indicativo (se morre, casa).',
            correct: 'Mesmo trilho: se + hipótese = subordinada adverbial condicional.',
          },
        ],
        footer_rule: 'A: principal + subordinada adverbial condicional.',
      },
    ],
  },

  'cpcon-uepb-a-oracoes-leia-o-texto-03-para-responder-a-que-4014476': {
    family: 'text_fragment',
    source_tec_id: '4014476',
    source_note:
      'Corrida da IA e sobrevivência humana — I-IV concessiva/sujeito/adjunto/OD — CPCON UEPB ACS (Pref Itabaiana) 2026 tec 4014476',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Itabaiana)',
      orgao: 'Pref. Itabaiana',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Analise as assertivas sobre o período do Texto 03: «Reuniões internacionais como a cúpula de IA desta semana oferecem uma oportunidade para regulamentar a tecnologia, embora suas três edições anteriores tenham resultado apenas em acordos voluntários por parte das empresas de tecnologia.» I – O período apresenta uma oração subordinada adverbial concessiva. II – O sujeito da oração subordinada é composto. III – O termo «apenas» funciona como adjunto adverbial. IV – Na oração principal há um objeto direto. É CORRETO o que se afirma apenas em:',
    text_fragment:
      '<p>Texto 03 — corrida da IA e sobrevivência humana (adaptado). «Reuniões internacionais como a cúpula de IA desta semana oferecem uma oportunidade para regulamentar a tecnologia, <strong>embora</strong> suas três edições anteriores tenham resultado apenas em acordos voluntários por parte das empresas de tecnologia».</p>',
    options: [
      { id: 'A', text: 'I, II e IV.', is_correct: false },
      { id: 'B', text: 'I, III e IV.', is_correct: true },
      { id: 'C', text: 'I e III.', is_correct: false },
      { id: 'D', text: 'II e III.', is_correct: false },
      { id: 'E', text: 'II e IV.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro afirmativas, um período',
        chip_label: 'Concessiva + sujeito + adjunto + OD',
        meta: slideMeta,
        items: [
          {
            label: 'I — concessiva',
            detail: '«Embora» introduz oração subordinada adverbial concessiva — opõe uma ressalva ao fato principal.',
            icon: 'GitBranch',
          },
          {
            label: 'II — sujeito da subordinada',
            detail: '«Suas três edições anteriores» é um único núcleo (edições) — sujeito simples, não composto.',
            icon: 'ListOrdered',
          },
          {
            label: 'III — «apenas»',
            detail: 'Advérbio de restrição que modifica o verbo «resultado» — adjunto adverbial.',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: 'Objeto direto na principal: «oferecem uma oportunidade» — «oportunidade» é o OD.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Concessiva e adjunto certos; sujeito simples, não composto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'IA e sobrevivência humana → cargo',
        meta: slideMeta,
        steps: [
          'Texto 03: «Reuniões internacionais… oferecem uma oportunidade…, embora suas três edições anteriores tenham resultado apenas em acordos voluntários…».',
          'I: «embora» é conjunção concessiva clássica — a afirmativa está correta.',
          'II: o núcleo do sujeito da subordinada é só «edições» — sujeito simples, afirmativa incorreta.',
          'III: «apenas» modifica o verbo «resultado», restringindo a ideia — adjunto adverbial, afirmativa correta.',
          'IV: «oferecem uma oportunidade» — verbo transitivo direto + «uma oportunidade» como objeto direto — afirmativa correta.',
          'Eliminando II, restam I, III e IV corretas — gabarito B.',
          'Em similares: teste cada assertiva isolada antes de combinar — sujeito composto exige dois núcleos coordenados.',
        ],
        footer_rule: 'I, III e IV corretas; II é a armadilha.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Quatro testes, um período',
        meta: slideMeta,
        content: 'QUATRO TESTES, UM PERÍODO',
        rows: [
          { label: 'Concessiva', value: 'Embora, ainda que, mesmo que — ressalva que não impede o fato principal.' },
          { label: 'Sujeito simples', value: 'Um só núcleo, mesmo com adjuntos (três edições anteriores).' },
          { label: 'Sujeito composto', value: 'Dois ou mais núcleos ligados por «e» (ex.: Ana e Paulo saíram).' },
          { label: 'Adjunto adverbial', value: 'Advérbio que modifica o verbo — «apenas» restringe «resultado».' },
          { label: 'Nesta questão', value: 'I, III e IV corretas — sujeito da subordinada é simples (B)' },
        ],
        footer_rule: 'Sujeito simples com adjuntos ≠ sujeito composto.',
      },
      {
        type: 'danger_zone',
        meta: slideMeta,
        content: 'Marcar sujeito composto ou trocar objeto direto',
        items: [
          {
            label: 'A — inclui II',
            detail: 'Parece que «suas três edições anteriores» tem vários núcleos.',
            correct: 'Só há um núcleo (edições); sujeito simples, não composto — II é falsa.',
          },
          {
            label: 'C — só I e III',
            detail: 'Ignora a afirmativa IV sobre o objeto direto.',
            correct: '«Oferecem uma oportunidade» tem OD claro — IV também é verdadeira.',
          },
          {
            label: 'D — II e III',
            detail: 'Aceita II como verdadeira e ignora I.',
            correct: 'I (concessiva) é correta; II (sujeito composto) é falsa — combinação errada.',
          },
          {
            label: 'E — II e IV',
            detail: 'Mistura a afirmativa falsa (II) com uma verdadeira (IV), ignorando I e III.',
            correct: 'Faltam I e III, que também são verdadeiras — combinação incompleta.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem pedir a mesma análise com sujeito realmente composto (ex.: «João e Maria»).',
            correct: 'Mesmo trilho: teste cada assertiva isoladamente antes de combinar as letras.',
          },
        ],
        footer_rule: 'B: I, III e IV corretas.',
      },
    ],
  },

  'fgv-ag-st-pr-oracoes-texto-i-a-escrita-a-nossa-civilizaca-3432856': {
    family: 'text_fragment',
    source_tec_id: '3432856',
    source_note:
      'A Escrita — concessiva reduzida + final reduzida — FGV Ag ST (Pref Canaã Carajás) 2025 tec 3432856',
    meta: {
      banca: 'FGV',
      prova: 'Ag ST (Pref Canaã Carajás)',
      orgao: 'Pref. Canaã Carajás',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Releia o trecho: «Mesmo a televisão – e mais do que ela o cinema – lança mão dos recursos da linguagem escrita (legenda) para facilitar a comunicação.» As orações subordinadas do período devem ser classificadas corretamente como:',
    text_fragment:
      '<p>Texto I — A Escrita (adaptado). «<strong>Mesmo</strong> a televisão – e mais do que ela o cinema – lança mão dos recursos da linguagem escrita (legenda) <strong>para</strong> facilitar a comunicação».</p>',
    options: [
      { id: 'A', text: 'concessiva e comparativa.', is_correct: false },
      { id: 'B', text: 'comparativa e consecutiva.', is_correct: false },
      { id: 'C', text: 'consecutiva e conformativa.', is_correct: false },
      { id: 'D', text: 'concessiva e final.', is_correct: true },
      { id: 'E', text: 'final e temporal.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Duas reduzidas no mesmo período',
        chip_label: 'Mesmo = concessão, não é sujeito',
        meta: slideMeta,
        items: [
          {
            label: '«Mesmo» concessivo',
            detail: '«Mesmo a televisão… lança mão» equivale a «ainda que a televisão…» — concessiva reduzida.',
            icon: 'GitBranch',
          },
          {
            label: '«Para facilitar»',
            detail: 'Reduzida de infinitivo introduzida por «para» — indica propósito, final.',
            icon: 'Link',
          },
          {
            label: 'Aparte comparativo',
            detail: '«E mais do que ela o cinema» é comentário à parte, não é a 2ª subordinada pedida.',
            icon: 'Layers',
          },
          {
            label: 'Pegadinha',
            detail: 'Confundir o aparte comparativo com uma das duas orações classificadas no comando.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Concessiva (mesmo) + final (para facilitar) = as duas pedidas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Escrita e civilização → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre a escrita: «Mesmo a televisão – e mais do que ela o cinema – lança mão dos recursos da linguagem escrita para facilitar a comunicação».',
          'B/C: não há oração consecutiva (tão…que) nem conformativa (conforme, segundo) nesse trecho.',
          'E: não há noção de tempo (quando, enquanto) — só concessão e finalidade.',
          '«Mesmo a televisão… lança mão» = ainda que a televisão o faça — concessiva reduzida.',
          '«Para facilitar a comunicação» = com o objetivo de facilitar — final reduzida de infinitivo.',
          'A: a 2ª oração não é comparativa — «mais do que ela» é só um comentário dentro da concessiva.',
          'Gabarito D — concessiva e final. Em similares: separe o aparte comparativo da oração final que fecha a frase.',
        ],
        footer_rule: 'Mesmo = concessiva; para facilitar = final.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Mesmo + para',
        meta: slideMeta,
        content: 'MESMO + PARA',
        rows: [
          { label: 'Mesmo (concessiva)', value: 'Equivale a «ainda que» — reduzida, sem conjunção desenvolvida.' },
          { label: 'Para + infinitivo (final)', value: 'Indica propósito — «para facilitar» = a fim de facilitar.' },
          { label: 'Aparte comparativo', value: '«Mais do que ela» é comentário interno, não é uma das 2 orações pedidas.' },
          { label: 'Teste', value: 'Troque «mesmo» por «ainda que» e «para» por «a fim de» — sentido se mantém.' },
          { label: 'Nesta questão', value: 'concessiva + final (D)' },
        ],
        footer_rule: 'Duas reduzidas: concessiva + final.',
      },
      {
        type: 'danger_zone',
        meta: slideMeta,
        content: 'Confundir aparte e trocar o tipo',
        items: [
          {
            label: 'A — concessiva e comparativa',
            detail: 'O aparte «mais do que ela» parece a 2ª oração.',
            correct: 'É comentário interno à concessiva, não a oração final pedida — a 2ª é «para facilitar».',
          },
          {
            label: 'B — comparativa e consecutiva',
            detail: 'Nenhuma palavra de intensidade («tão») aparece no trecho.',
            correct: 'Falta a estrutura consecutiva (tão…que); a classificação certa é concessiva e final.',
          },
          {
            label: 'C — consecutiva e conformativa',
            detail: 'Nenhum conectivo conformativo (conforme, segundo) está presente.',
            correct: 'Sem «conforme»/«segundo», não há conformativa; o trecho traz concessão e finalidade.',
          },
          {
            label: 'E — final e temporal',
            detail: 'Acerta a final, mas troca a concessiva por temporal.',
            correct: 'Não há marcador de tempo (quando/enquanto); a 1ª oração é concessiva («mesmo»).',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «mesmo» por «ainda que» desenvolvido, mantendo o mesmo sentido.',
            correct: 'Mesmo trilho: concessão + finalidade, mesmo com conectivos diferentes.',
          },
        ],
        footer_rule: 'D: concessiva e final.',
      },
    ],
  },

  'avancasp-ana-oracoes-a-construcao-tao-que-imprime-ao-cont-3460173': {
    family: 'conceito',
    source_tec_id: '3460173',
    source_note: 'Tão…que = consecutiva — AVANÇASP Ana (FUSAM) 2025 tec 3460173',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ana (FUSAM)',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'A construção «tão... que» imprime ao contexto em que ocorre – «e a primavera é tão linda que eles esquecem» – um sentido:',
    options: [
      { id: 'A', text: 'consecutivo.', is_correct: true },
      { id: 'B', text: 'condicional.', is_correct: false },
      { id: 'C', text: 'causal.', is_correct: false },
      { id: 'D', text: 'final.', is_correct: false },
      { id: 'E', text: 'proporcional.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«Tão... que» = consequência',
        chip_label: 'Intensidade gera efeito',
        meta: slideMeta,
        items: [
          {
            label: 'Estrutura',
            detail: '«Tão + adjetivo + que» mede intensidade e anuncia uma consequência.',
            icon: 'GitBranch',
          },
          {
            label: 'Sentido consecutivo',
            detail: '«A primavera é tão linda que eles esquecem» — o efeito (esquecer) decorre da intensidade (linda).',
            icon: 'Link',
          },
          {
            label: 'Teste',
            detail: 'Substitua «que» por «de modo que»: o sentido de consequência se mantém.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'Confundir «tão...que» consecutivo com «se...então» condicional — aqui há grau + efeito, não hipótese.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tão + adjetivo + que = grau que gera consequência.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Primavera e esquecimento → cargo',
        meta: slideMeta,
        steps: [
          'Frase-base: «e a primavera é tão linda que eles esquecem».',
          'B: não há hipótese (se) — não é condicional.',
          'C: não há conectivo causal (porque, já que) — a estrutura é «tão…que», não causa.',
          'D: final pediria «para/a fim de» — aqui há grau seguido de efeito, não propósito.',
          'E: proporcional pede «à medida que/quanto mais…mais» — não é o padrão da frase.',
          '«Tão linda» mede o grau; «que eles esquecem» é o efeito desse grau — consecutiva.',
          'Gabarito A. Em similares: «tão/tal/tamanho + que» sempre indica consequência.',
        ],
        footer_rule: 'Grau seguido de «que» = oração consecutiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tão... que = consecutiva',
        meta: slideMeta,
        content: 'TÃO... QUE = CONSECUTIVA',
        rows: [
          { label: 'Estrutura', value: 'Tão/tal/tamanho + adjetivo/substantivo + que + efeito.' },
          { label: 'Teste', value: 'Troque «que» por «de modo que»: sentido de consequência se mantém.' },
          { label: '≠ Condicional', value: 'Exige hipótese com «se»; aqui não há condição, há grau.' },
          { label: '≠ Causal', value: 'Causal usa «porque/já que»; aqui o efeito vem da intensidade.' },
          { label: 'Nesta questão', value: 'tão linda que esquecem → consecutiva (A)' },
        ],
        footer_rule: 'Grau + que + efeito = consecutiva.',
      },
      {
        type: 'danger_zone',
        meta: slideMeta,
        content: 'Trocar consequência por outro sentido',
        items: [
          {
            label: 'B — condicional',
            detail: 'Duas orações seguidas podem lembrar «se…então».',
            correct: 'Não há «se»; a estrutura é grau («tão») + efeito («que»), não hipótese.',
          },
          {
            label: 'C — causal',
            detail: '«Esquecer» parece justificado pela beleza.',
            correct: 'Falta conectivo causal (porque); o efeito vem da intensidade, não de uma causa isolada.',
          },
          {
            label: 'D — final',
            detail: '«Que» pode parecer introduzir propósito.',
            correct: 'Final pediria «para/a fim de»; aqui é consequência de um grau, não objetivo.',
          },
          {
            label: 'E — proporcional',
            detail: 'Duas ideias evoluindo juntas sugerem proporção.',
            correct: 'Proporcional pede «à medida que/quanto mais…»; a frase é só grau + efeito único.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «tão linda» por «tamanha beleza» mantendo «que» consecutivo.',
            correct: 'Mesmo trilho: intensidade (tão/tal/tamanho) + que = consecutiva.',
          },
        ],
        footer_rule: 'A: sentido consecutivo.',
      },
    ],
  },
};

function main() {
  const outDir = loteQuestionsDir(LOTE);
  mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(outDir, `${slug}.json`);
    writeFileSync(path, `${JSON.stringify(build(slug, spec), null, 2)}\n`, 'utf8');
    n += 1;
    console.log(`[handcraft] OK ${slug}`);
  }
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
