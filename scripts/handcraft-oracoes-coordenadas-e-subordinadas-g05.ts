#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — oracoes-coordenadas-e-subordinadas-g05 (6 slugs · Orações coordenadas e subordinadas · lote 5).
 *
 *   npx tsx scripts/handcraft-oracoes-coordenadas-e-subordinadas-g05.ts
 *   npm run audit:questao-readiness -- --lote=oracoes-coordenadas-e-subordinadas-g05 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=oracoes-coordenadas-e-subordinadas-g05 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'oracoes-coordenadas-e-subordinadas-g05';
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
    'oração subordinada adverbial consecutiva (tão/tal/tanto...que)',
    'oração subordinada adjetiva explicativa (quem sem antecedente)',
    'oração subordinada adverbial concessiva com inversão (adjetivo + que + subjuntivo)',
    'oração subordinada reduzida de particípio',
    'vírgula e adjunto adverbial deslocado',
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
      reviewer: 'handcraft:oracoes-coordenadas-e-subordinadas-g05',
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
  'avancasp-acs-oracoes-leia-o-texto-a-seguir-para-responder-3661687': {
    family: 'text_fragment',
    source_tec_id: '3661687',
    source_note:
      'Crônica «Um coelho» — consecutiva «tão habituados que voltamos» — AVANÇASP ACS (Pref Cerquilho) 2025 tec 3661687',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Cerquilho)',
      orgao: 'Pref. Cerquilho',
      ano: '2025',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'No trecho «Mas o lar é uma coisa a que estamos tão habituados que sempre acabamos voltando a ele», a construção em destaque apresenta, em relação à oração anterior, uma consequência. Assinale a alternativa que classifica corretamente essa oração subordinada adverbial:',
    text_fragment:
      '<p>Crônica «Um coelho» (Oliveira, J. C., adaptado). Passaram-se dois dias, na esperança de que o coelho e a cozinheira entrassem em algum acordo. «Mas o lar é uma coisa a que estamos tão habituados <strong>que sempre acabamos voltando a ele</strong>».</p>',
    options: [
      { id: 'A', text: 'causal.', is_correct: false },
      { id: 'B', text: 'condicional.', is_correct: false },
      { id: 'C', text: 'consecutiva.', is_correct: true },
      { id: 'D', text: 'temporal.', is_correct: false },
      { id: 'E', text: 'concessiva.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trilho da consecutiva',
        chip_label: 'Ache o intensificador',
        meta: slideMeta,
        items: [
          {
            label: '1. Intensificador',
            detail: '«Tão, tal, tanto, de tal forma» antes do adjetivo/verbo sinalizam consequência a caminho.',
            icon: 'GitBranch',
          },
          {
            label: '2. Conectivo «que»',
            detail: 'Depois do intensificador, «que» liga a consequência à intensidade descrita.',
            icon: 'Link',
          },
          {
            label: '3. Pergunta-teste',
            detail: '«A ponto de quê?» → a resposta é a própria oração consecutiva.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: '«A que» (habituados a algo) é pronome relativo — não confundir com o «que» consecutivo mais adiante.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tão + adjetivo + que = consecutiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Coelho/lar → cargo',
        meta: slideMeta,
        steps: [
          'Crônica «Um coelho»: «o lar é uma coisa a que estamos tão habituados que sempre acabamos voltando a ele».',
          'A: causal pediria «porque/já que» — não há justificativa aqui, há efeito.',
          'B: condicional pediria «se/caso» — não há hipótese no trecho.',
          'D: temporal pediria «quando/enquanto» — não há marcador de tempo.',
          'E: concessiva pediria «embora/mesmo que» — não há oposição concedida.',
          '«Tão habituados» + «que sempre acabamos voltando» = intensidade que gera consequência.',
          'Gabarito C. Em similares: ache o intensificador (tão/tal/tanto) antes do «que» que revela o efeito.',
        ],
        footer_rule: 'O intensificador denuncia a consecutiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tão...que = consequência',
        meta: slideMeta,
        content: 'TÃO...QUE = CONSEQUÊNCIA',
        rows: [
          { label: 'Consecutiva', value: 'tão/tal/tanto/de tal forma + que — introduz o efeito, a consequência.' },
          { label: 'Causal', value: 'porque, já que, pois — introduz a causa, não o efeito.' },
          { label: 'Temporal', value: 'quando, enquanto, assim que — marca tempo, não intensidade.' },
          { label: 'Concessiva', value: 'embora, mesmo que, ainda que — introduz uma oposição concedida.' },
          { label: 'Nesta questão', value: 'tão habituados que voltamos → consecutiva (C)' },
        ],
        footer_rule: 'Antes do «que» consecutivo, sempre há um intensificador.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar o gatilho do conectivo',
        items: [
          {
            label: 'A — causal',
            detail: '«Habituados» parece justificar um motivo.',
            correct: 'Não há porque/já que — o «que» vem do intensificador «tão», não de causa.',
          },
          {
            label: 'B — condicional',
            detail: 'Confundir a ideia de hábito com hipótese.',
            correct: 'Falta se/caso; não há condição, apenas o efeito do hábito.',
          },
          {
            label: 'D — temporal',
            detail: '«Sempre» no trecho sugere tempo.',
            correct: '«Sempre» aqui reforça o hábito, não marca um momento — falta quando/enquanto.',
          },
          {
            label: 'E — concessiva',
            detail: 'Pensar que «apesar do hábito, voltamos» é concessão.',
            correct: 'Não há embora/mesmo que; a oração só mostra o resultado do hábito.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «tão» por «tal» ou «tamanho».',
            correct: 'Mesmo trilho: intensificador + que = consecutiva.',
          },
        ],
        footer_rule: 'C: oração subordinada adverbial consecutiva.',
      },
    ],
  },

  'educa-pb-ag-oracoes-texto-1-a-inteligencia-artificial-ja-3711355': {
    family: 'text_fragment',
    source_tec_id: '3711355',
    source_note:
      'IA já é regulada — «quem» sem antecedente, adjetiva explicativa — EDUCA PB Ag Adm (Pref SJ Rio do Peixe) 2025 tec 3711355',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref SJ Rio do Peixe)',
      orgao: 'Pref. SJ Rio do Peixe',
      ano: '2025',
      cargo_header: 'AGENTE ADMINISTRATIVO',
    },
    instruction:
      'Releia o trecho extraído do último parágrafo do texto: «Ela é moldada por quem a desenha, por quem a financia e por quem define seus parâmetros técnicos, comerciais e éticos.» Como são classificadas as orações introduzidas por «quem»?',
    text_fragment:
      '<p>Texto sobre regulação da inteligência artificial (Brasil de Fato, adaptado). No último parágrafo: «Ela é moldada <strong>por quem a desenha, por quem a financia e por quem define seus parâmetros técnicos, comerciais e éticos</strong>».</p>',
    options: [
      { id: 'A', text: 'Orações coordenadas sindéticas adversativas.', is_correct: false },
      { id: 'B', text: 'Orações subordinadas adverbiais condicionais.', is_correct: false },
      { id: 'C', text: 'Orações subordinadas adjetivas explicativas.', is_correct: true },
      { id: 'D', text: 'Orações subordinadas substantivas completivas.', is_correct: false },
      { id: 'E', text: 'Orações coordenadas assindéticas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quem sem antecedente explícito',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Função do «quem»',
            detail: '«Quem» equivale a «aquele(s) que» e retoma um agente indeterminado (quem desenha, financia, define).',
            icon: 'GitBranch',
          },
          {
            label: '2. Vírgulas de explicação',
            detail: 'As três orações vêm separadas por vírgulas, acrescentando informação sobre «ela» (a IA).',
            icon: 'Link',
          },
          {
            label: '3. Pergunta-teste',
            detail: 'Quem exatamente? → a resposta explica a IA, sem restringir um substantivo expresso.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'O «e» entre as três orações parece coordenação, mas cada uma é adjetiva — só coordenadas entre si.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Quem = pronome relativo que introduz adjetiva explicativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'IA regulada → cargo',
        meta: slideMeta,
        steps: [
          'Trecho sobre regulação da IA: «Ela é moldada por quem a desenha, por quem a financia e por quem define seus parâmetros…».',
          'A: não há «mas/porém» — não é coordenada adversativa.',
          'B: falta «se/caso» — não é condicional.',
          'D: substantiva completaria um verbo (dizer que, saber que); aqui «quem» qualifica, não completa objeto direto.',
          'E: há conectivo «e» explícito ligando as três — não é assindética (sem conectivo).',
          'As três orações com «quem» explicam quem está por trás da IA, isoladas por vírgulas — adjetivas explicativas.',
          'Gabarito C. Em similares: «quem» sem antecedente expresso + vírgulas de explicação = adjetiva explicativa.',
        ],
        footer_rule: 'Quem sem antecedente também introduz adjetiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Quem = pronome relativo indefinido',
        meta: slideMeta,
        content: 'QUEM = PRONOME RELATIVO INDEFINIDO',
        rows: [
          { label: 'Quem', value: 'Equivale a "aquele que" — introduz oração adjetiva mesmo sem antecedente expresso.' },
          { label: 'Explicativa', value: 'Vírgulas isolam informação extra, não restringem quem já foi identificado.' },
          { label: '≠ Substantiva', value: 'Substantiva completa verbo (afirmar que, saber que) — sem pronome relativo.' },
          { label: '≠ Coordenada', value: '«E» aqui liga três adjetivas paralelas, não muda a classificação de cada uma.' },
          { label: 'Nesta questão', value: 'por quem…, por quem…, por quem… → adjetivas explicativas (C)' },
        ],
        footer_rule: 'Quem sem antecedente também introduz adjetiva.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir «quem» com outras funções',
        items: [
          {
            label: 'A — coordenadas adversativas',
            detail: 'Três orações parecidas parecem uma lista de contrastes.',
            correct: 'Não há mas/porém entre elas — são adjetivas somadas por «e», não opostas.',
          },
          {
            label: 'B — subordinadas condicionais',
            detail: '«Quem» pode soar como hipótese (quem quiser).',
            correct: 'Falta se/caso; aqui «quem» qualifica os agentes, não propõe condição.',
          },
          {
            label: 'D — substantivas completivas',
            detail: 'Depois de «moldada por» parece completar um sentido, como um objeto.',
            correct: 'Substantiva completaria verbo com «que» (dizer que, saber que); aqui é «quem» relativo, adjetiva.',
          },
          {
            label: 'E — coordenadas assindéticas',
            detail: 'Três orações parecidas sugerem simples enumeração.',
            correct: 'Há conectivo «e» explícito na última — não é assindética (sem conectivo).',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «quem» por «aqueles que».',
            correct: 'Mesmo trilho: pronome relativo sem antecedente expresso + vírgula = adjetiva explicativa.',
          },
        ],
        footer_rule: 'C: orações subordinadas adjetivas explicativas.',
      },
    ],
  },

  'apice-ag-adm-oracoes-leia-o-texto-abaixo-e-responda-da-qu-3793433': {
    family: 'text_fragment',
    source_tec_id: '3793433',
    source_note:
      'Sociedade do cansaço — consecutiva «tão cansados que percebemos» — ÁPICE Ag Adm (Pref R Bacamarte) 2025 tec 3793433',
    guidelineOverride: `M07c Elias TE-simples — trilho período → dependência → conectivo → tipo · âncora consecutiva · ${GOLDEN_REFERENCE}`,
    meta: {
      banca: 'ÁPICE',
      prova: 'Ag Adm (Pref R Bacamarte)',
      orgao: 'Pref. R Bacamarte',
      ano: '2025',
      cargo_header: 'AGENTE ADMINISTRATIVO',
    },
    instruction:
      'Assinale a alternativa que classifica corretamente a oração subordinada adverbial presente no seguinte período: «Estamos tão cansados que já nem percebemos que estamos nos exaurindo.»',
    text_fragment:
      '<p>Crônica «Sociedade do cansaço» (Genesson Honorato, adaptado). «Estamos <strong>tão cansados que já nem percebemos</strong> que estamos nos exaurindo».</p>',
    options: [
      { id: 'A', text: 'oração subordinada adverbial causa.', is_correct: false },
      { id: 'B', text: 'oração subordinada adverbial consecutiva.', is_correct: true },
      { id: 'C', text: 'oração subordinada adverbial temporal.', is_correct: false },
      { id: 'D', text: 'oração subordinada adverbial concessiva.', is_correct: false },
      { id: 'E', text: 'oração subordinada adverbial condicional.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Duas orações com «que»',
        chip_label: 'Separe os dois «que»',
        meta: slideMeta,
        items: [
          {
            label: '1. Primeiro «que»',
            detail: 'Depois de «tão cansados» → intensificador + que = consecutiva (o efeito do cansaço).',
            icon: 'GitBranch',
          },
          {
            label: '2. Segundo «que»',
            detail: '«Percebemos que estamos nos exaurindo» → completa o verbo perceber = substantiva objetiva direta.',
            icon: 'Link',
          },
          {
            label: '3. Comando da questão',
            detail: 'Pede só a adverbial — foco no primeiro «que», ligado ao intensificador «tão».',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'Os dois «que» sucessivos fazem parecer uma única oração — são duas, com funções diferentes.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tão cansados que = consecutiva; que percebemos = substantiva (não pedida aqui).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Cansaço/desempenho → cargo',
        meta: slideMeta,
        steps: [
          'Crônica «Sociedade do cansaço»: «Estamos tão cansados que já nem percebemos que estamos nos exaurindo.»',
          'A: causa pediria porque/já que — aqui não há justificativa, há efeito.',
          'C: temporal pediria quando/enquanto — não há marcador de tempo.',
          'D: concessiva pediria embora/mesmo que — não há oposição concedida.',
          'E: condicional pediria se/caso — não há hipótese.',
          '«Tão cansados» é o intensificador; «que já nem percebemos…» é a consequência desse grau de cansaço.',
          'Gabarito B. Em similares: separe os dois «que» — o ligado ao intensificador é sempre consecutivo.',
        ],
        footer_rule: 'O intensificador denuncia a consecutiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Dois «que» na mesma frase',
        meta: slideMeta,
        content: 'DOIS «QUE» NA MESMA FRASE',
        rows: [
          { label: 'Consecutiva', value: 'Vem colada a um intensificador (tão, tal, tanto) — mostra o efeito.' },
          { label: 'Substantiva objetiva direta', value: 'Completa o sentido de um verbo transitivo (perceber que, achar que).' },
          { label: 'Teste', value: 'Existe tão/tal/tanto antes? Sim → esse «que» é consecutivo.' },
          { label: 'Cuidado', value: 'Um período pode ter os dois tipos de «que» ao mesmo tempo, cada um com sua função.' },
          { label: 'Nesta questão', value: 'tão cansados que… → consecutiva (B)' },
        ],
        footer_rule: 'O intensificador denuncia a consecutiva.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir os dois «que» do período',
        items: [
          {
            label: 'A — causa',
            detail: 'Cansaço parece motivo/explicação.',
            correct: 'Falta porque/já que; o «que» aqui mostra o resultado da intensidade («tão»), não a causa.',
          },
          {
            label: 'C — temporal',
            detail: '«Já nem» sugere sequência no tempo.',
            correct: 'Não há quando/enquanto; «já nem» reforça o grau do cansaço, não marca tempo.',
          },
          {
            label: 'D — concessiva',
            detail: 'Cansaço extremo pode parecer uma oposição implícita.',
            correct: 'Falta embora/mesmo que; não há concessão, apenas consequência.',
          },
          {
            label: 'E — condicional',
            detail: 'Pode parecer «se estivermos cansados...».',
            correct: 'Não há se/caso; a oração já afirma o fato, não propõe hipótese.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem isolar só «que estamos nos exaurindo» e perguntar a função dela.',
            correct: 'Essa é a substantiva objetiva direta de «percebemos» — outro «que», outra função.',
          },
        ],
        footer_rule: 'B: oração subordinada adverbial consecutiva.',
      },
    ],
  },

  'vunesp-acs-p-oracoes-leia-o-texto-a-seguir-para-responder-3845002': {
    family: 'text_fragment',
    source_tec_id: '3845002',
    source_note:
      'Clarice Lispector — vírgula isola adjunto deslocado dentro de substantiva — VUNESP ACS (Pref Vista A do Alto) 2025 tec 3845002',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Vista A do Alto)',
      orgao: 'Pref. Vista A do Alto',
      ano: '2025',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'Assinale a alternativa em que o acréscimo de vírgula(s) ao trecho original segue a norma-padrão de emprego desse sinal de pontuação.',
    text_fragment:
      '<p>Crônica de Clarice Lispector, <em>Todas as crônicas</em> (2018, adaptado). «No estado de graça vê-se às vezes a profunda beleza […] Esqueci de dizer que em estado de graça se é muito feliz. Ficaríamos mais egoístas, porque as pessoas felizes o são».</p>',
    options: [
      { id: 'A', text: 'No estado de graça, vê-se às vezes, a profunda beleza...', is_correct: false },
      { id: 'B', text: 'Passa-se a sentir que, tudo o que existe – pessoa ou coisa...', is_correct: false },
      { id: 'C', text: 'Esqueci de dizer que, em estado de graça, se é muito feliz.', is_correct: true },
      { id: 'D', text: 'Ficaríamos mais egoístas, porque as pessoas felizes, o são.', is_correct: false },
      { id: 'E', text: '... tudo por termos na graça, a compensação e o resumo da vida.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula isola o que é deslocado',
        chip_label: 'Nunca separe sujeito e verbo',
        meta: slideMeta,
        items: [
          {
            label: '1. Estrutura original',
            detail: '«Esqueci de dizer que em estado de graça se é muito feliz» — o adjunto está entre o «que» e o resto da oração.',
            icon: 'GitBranch',
          },
          {
            label: '2. Adjunto deslocado',
            detail: '«Em estado de graça» é adjunto adverbial de situação, deslocado para dentro da oração substantiva.',
            icon: 'Link',
          },
          {
            label: '3. Regra da vírgula',
            detail: 'Adjunto deslocado no meio da oração pede vírgulas dos dois lados, isolando-o.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'Vírgula depois de «que» ou antes do predicativo rompe a ligação sujeito-verbo — errado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Isolar o adjunto deslocado — nunca separar sujeito, verbo e complemento diretos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Estado de graça → cargo',
        meta: slideMeta,
        steps: [
          'Crônica de Clarice Lispector: «Esqueci de dizer que em estado de graça se é muito feliz.»',
          'A: «vê-se às vezes, a profunda beleza» — vírgula corta o verbo do seu complemento sem motivo — errado.',
          'B: «que, tudo o que existe» — vírgula separa a conjunção «que» do sujeito da oração substantiva — errado.',
          'D: «as pessoas felizes, o são» — vírgula separa sujeito do predicativo — errado.',
          'E: «na graça, a compensação» — vírgula separa o verbo «termos» do seu objeto — errado.',
          'C: «em estado de graça» é adjunto deslocado dentro da oração — isolado por vírgulas, sem separar termos essenciais.',
          'Gabarito C. Em similares: vírgula isola o que foi deslocado; nunca separa sujeito-verbo-complemento em sequência direta.',
        ],
        footer_rule: 'Vírgula isola o que se pode retirar sem quebrar a frase.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Vírgula e adjunto deslocado',
        meta: slideMeta,
        content: 'VÍRGULA E ADJUNTO DESLOCADO',
        rows: [
          { label: 'Regra de ouro', value: 'Sujeito, verbo e complementos diretos não se separam por vírgula.' },
          { label: 'Adjunto deslocado', value: 'Adjunto (lugar, tempo, situação) no meio da oração isola-se com vírgulas.' },
          { label: 'Nesta questão', value: 'que, em estado de graça, se é muito feliz — adjunto isolado corretamente.' },
          { label: 'Errado (B/D/E)', value: 'Vírgula separando conjunção-sujeito, sujeito-predicativo ou verbo-objeto.' },
          { label: 'Teste', value: 'Retire o trecho entre vírgulas: a frase ainda faz sentido completo? Se sim, era adjunto deslocado.' },
        ],
        footer_rule: 'Vírgula isola o que se pode retirar sem quebrar a frase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgula no lugar errado',
        items: [
          {
            label: 'A — vê-se às vezes,',
            detail: 'Vírgula depois de um adjunto curto parece sempre correta.',
            correct: 'Aqui ela separa o verbo do complemento direto sem função — nenhum termo foi deslocado para justificar.',
          },
          {
            label: 'B — que, tudo o que existe',
            detail: 'Vírgula logo após «que» parece organizar a frase.',
            correct: 'Separa a conjunção integrante do sujeito da oração substantiva — rompe sujeito-verbo.',
          },
          {
            label: 'D — felizes, o são',
            detail: 'Pausa antes do verbo de ligação parece dar ênfase.',
            correct: 'Isola indevidamente o predicativo «o são» do seu sujeito — nunca separar sujeito de predicativo.',
          },
          {
            label: 'E — na graça, a compensação',
            detail: 'Vírgula antes do objeto parece dar respiro à frase.',
            correct: 'Separa o verbo «termos» do seu objeto direto — sem adjunto deslocado que justifique.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «em estado de graça» por outro adjunto de tempo/lugar.',
            correct: 'Mesmo trilho: vírgulas isolam apenas o que foi deslocado para o meio da oração.',
          },
        ],
        footer_rule: 'C: vírgulas isolam corretamente o adjunto deslocado.',
      },
    ],
  },

  'apice-acs-pr-oracoes-pestana-2023-p-619-aponta-que-as-ora-3951856': {
    family: 'conceito',
    source_tec_id: '3951856',
    source_note: 'Concessiva com inversão «sortudo que fosse» — ÁPICE ACS (Pref Boa Vista (PB)) 2025 tec 3951856 (âncora golden-v1)',
    guidelineOverride: `M07c Elias TE-simples — trilho período → dependência → conectivo → tipo · âncora concessiva invertida · ${GOLDEN_REFERENCE}`,
    meta: {
      banca: 'ÁPICE',
      prova: 'ACS (Pref Boa Vista (PB))',
      orgao: 'Pref. Boa Vista (PB)',
      ano: '2025',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'Pestana (2023, p. 619) aponta que "As orações subordinadas adverbiais são chamadas assim porque exercem função sintática própria de advérbio em relação à oração principal. Isto é, elas exercem a função de adjunto adverbial. São iniciadas pelas conjunções subordinativas [...]." Dentre os períodos retirados da gramática de Pestana (2023), assinale a alternativa que apresenta de forma destacada uma oração subordinada adverbial concessiva:',
    options: [
      { id: 'A', text: 'Sortudo que fosse nos relacionamentos, não se casou com uma mulher virtuosa.', is_correct: true },
      { id: 'B', text: 'Esperamos que você aprenda português.', is_correct: false },
      { id: 'C', text: 'Como todos sabemos, o Brasil já é autossuficiente em petróleo.', is_correct: false },
      { id: 'D', text: 'Não sabemos se haverá aula.', is_correct: false },
      { id: 'E', text: 'Segundo foi noticiado por nós, a reunião de sexta-feira 13 era esperada desde há muito.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Concessiva sem «embora»',
        chip_label: 'Adjetivo + que + subjuntivo',
        meta: slideMeta,
        items: [
          {
            label: '1. Estrutura da concessão',
            detail: 'Adjetivo + que + verbo no subjuntivo (fosse, seja) = concessiva, mesmo sem «embora».',
            icon: 'GitBranch',
          },
          {
            label: '2. Sentido de oposição',
            detail: '«Sortudo que fosse» equivale a «embora fosse sortudo» — a sorte não impediu o resultado.',
            icon: 'Link',
          },
          {
            label: '3. Pergunta-teste',
            detail: '«Apesar de quê?» → a resposta é a própria oração concessiva.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'A ordem invertida (adjetivo antes do «que») engana — a função ainda é concessiva.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Adjetivo + que + subjuntivo = concessiva com inversão.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Pestana (2023) → cargo',
        meta: slideMeta,
        steps: [
          'Comando: Pestana define a adverbial como adjunto adverbial da principal — buscar a concessiva entre os períodos.',
          'B: «esperamos que você aprenda» — «que» completa o verbo esperar → substantiva objetiva direta, não concessiva.',
          'C: «como todos sabemos» — «como» tem valor comparativo/conformativo, não de oposição.',
          'D: «se haverá aula» — «se» introduz substantiva objetiva indireta (dúvida), não concessão.',
          'E: «segundo foi noticiado» — «segundo» introduz conformativa, não oposição.',
          'A: «sortudo que fosse» equivale a «embora fosse sortudo» — mesmo sendo sortudo, o resultado contraria a expectativa.',
          'Gabarito A. Em similares: adjetivo/advérbio + que + subjuntivo no início do período é o sinal da concessiva invertida.',
        ],
        footer_rule: 'Sem «embora» explícito, procure adjetivo + que + subjuntivo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Concessiva com inversão',
        meta: slideMeta,
        content: 'CONCESSIVA COM INVERSÃO',
        rows: [
          { label: 'Padrão clássico', value: 'embora, ainda que, mesmo que, apesar de que + verbo.' },
          { label: 'Padrão invertido', value: 'Adjetivo/advérbio + que + subjuntivo (sortudo que fosse = embora fosse sortudo).' },
          { label: '≠ Substantiva', value: '«Que» depois de verbo de sentimento/vontade (esperar que) é objetiva direta.' },
          { label: '≠ Conformativa', value: '«Como», «segundo», «conforme» no início introduzem conformidade, não oposição.' },
          { label: 'Nesta questão', value: 'sortudo que fosse → concessiva (A)' },
        ],
        footer_rule: 'Sem «embora» explícito, procure adjetivo + que + subjuntivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada conectivo tem seu papel',
        items: [
          {
            label: 'B — esperamos que',
            detail: '«Que» logo após verbo parece sempre subordinar do mesmo jeito.',
            correct: '«Esperar que» pede complemento — é substantiva objetiva direta, sem ideia de oposição.',
          },
          {
            label: 'C — como todos sabemos',
            detail: '«Como» no início lembra concessão.',
            correct: 'Aqui «como» tem valor conformativo (do jeito que todos sabem), não de oposição.',
          },
          {
            label: 'D — se haverá aula',
            detail: '«Se» pode ser confundido com condição ou concessão.',
            correct: '«Não sabemos se» introduz substantiva objetiva indireta (dúvida), sem embora/apesar de.',
          },
          {
            label: 'E — segundo foi noticiado',
            detail: '«Segundo» parece introduzir uma ressalva.',
            correct: 'É conformativa — confirma a fonte da informação, não contraria uma expectativa.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem escrever «embora fosse sortudo» de forma direta.',
            correct: 'Mesmo trilho: reconheça a concessiva mesmo com a ordem invertida (sortudo que fosse).',
          },
        ],
        footer_rule: 'A: oração subordinada adverbial concessiva (com inversão).',
      },
    ],
  },

  'educa-pb-ag-oracoes-leia-o-texto-a-seguir-e-responda-a-q-3913806': {
    family: 'text_fragment',
    source_tec_id: '3913806',
    source_note:
      'Casamento, uma invenção cristã — reduzida de particípio explicativa — EDUCA PB Ag Adm (Pref Cajazeiras) 2026 tec 3913806',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref. Cajazeiras',
      ano: '2026',
      cargo_header: 'AGENTE ADMINISTRATIVO',
    },
    instruction:
      'Releia o trecho: «Essas uniões eram essencialmente políticas e sociais, decididas pelos pais.» Quanto ao uso da vírgula no trecho acima, é CORRETO afirmar que:',
    text_fragment:
      '<p>Texto «Casamento, uma invenção cristã» (Rainer Gonçalves Sousa, adaptado). «Essas uniões eram essencialmente políticas e sociais, <strong>decididas pelos pais</strong>».</p>',
    options: [
      { id: 'A', text: 'A vírgula separa orações coordenadas sindéticas adversativas.', is_correct: false },
      { id: 'B', text: 'A vírgula é obrigatória para separar sujeito e predicado.', is_correct: false },
      { id: 'C', text: 'A vírgula indica a presença de uma oração subordinada adverbial causal.', is_correct: false },
      { id: 'D', text: 'A vírgula isola uma oração subordinada reduzida de particípio com valor explicativo.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reduzida sem conectivo',
        chip_label: 'Particípio + vírgula',
        meta: slideMeta,
        items: [
          {
            label: '1. Sem «que»',
            detail: '«Decididas pelos pais» não tem conjunção nem verbo flexionado — é oração reduzida.',
            icon: 'GitBranch',
          },
          {
            label: '2. Particípio',
            detail: '«Decididas» está no particípio, concordando com «uniões» — equivale a «que foram decididas».',
            icon: 'Link',
          },
          {
            label: '3. Valor explicativo',
            detail: 'A vírgula isola a reduzida como informação adicional, não como restrição.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'Sem conjunção explícita, é fácil deixar de contar essa oração — mas ela existe e tem função sintática.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Verbo no particípio + vírgula = reduzida de particípio explicativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Casamento medieval → cargo',
        meta: slideMeta,
        steps: [
          'Trecho sobre o casamento medieval: «Essas uniões eram essencialmente políticas e sociais, decididas pelos pais.»',
          'A: não há «mas/porém» entre as orações — não é coordenada adversativa.',
          'B: a vírgula não separa sujeito («essas uniões») do predicado («eram...») — já estão diretamente ligados.',
          'C: falta conectivo causal (porque, já que) — não há relação de causa explícita.',
          '«Decididas pelos pais» equivale a «que eram decididas pelos pais» — verbo no particípio, sem conjunção, isolado por vírgula.',
          'Gabarito D. Em similares: particípio isolado por vírgula, sem conectivo, é sinal de reduzida.',
          'Em outra banca, o mesmo trilho vale trocando o particípio por outro verbo irregular (escrito, feito, dito).',
        ],
        footer_rule: 'Particípio + vírgula, sem conectivo, é sinal de reduzida.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Reduzida de particípio',
        meta: slideMeta,
        content: 'REDUZIDA DE PARTICÍPIO',
        rows: [
          { label: 'Sinal', value: 'Verbo no particípio (-ado, -ido, irregulares), sem conjunção, geralmente após vírgula.' },
          { label: 'Equivalência', value: 'Reescreve-se com «que» + verbo flexionado (decididas → que foram decididas).' },
          { label: 'Valor', value: 'Explicativo quando isolado por vírgula — acrescenta informação sem restringir.' },
          { label: '≠ Coordenada', value: 'Não há conectivo (e, mas, ou) ligando duas orações independentes.' },
          { label: 'Nesta questão', value: 'decididas pelos pais → reduzida de particípio explicativa (D)' },
        ],
        footer_rule: 'Particípio + vírgula, sem conectivo, é sinal de reduzida.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada opção testa uma regra de vírgula diferente',
        items: [
          {
            label: 'A — coordenada adversativa',
            detail: 'Duas ideias parecem contrastar (políticas × sociais).',
            correct: 'Não há «mas» nem oposição — «políticas e sociais» são complementares, ligadas por «e».',
          },
          {
            label: 'B — separar sujeito e predicado',
            detail: 'Pode parecer que a vírgula está isolando o sujeito.',
            correct: 'A vírgula não toca sujeito/predicado — vem depois do predicado, isolando a reduzida final.',
          },
          {
            label: 'C — causal',
            detail: '«Decididas pelos pais» pode parecer motivo da união.',
            correct: 'Falta porque/já que; é reduzida de particípio, não oração causal desenvolvida.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar o particípio por gerúndio (decidindo).',
            correct: 'Mesmo trilho: verbo reduzido sem conectivo, isolado por vírgula, é oração reduzida explicativa.',
          },
        ],
        footer_rule: 'D: reduzida de particípio com valor explicativo.',
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
