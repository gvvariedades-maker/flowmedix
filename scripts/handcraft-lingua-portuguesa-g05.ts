#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g05 (8 slugs · Crase).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g05.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g05 --strict-v2-pedagogy
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_CRASE_CONCURSOS } from '@/lib/guidelines/linguaPortuguesa/crase';

const LOTE = 'lingua-portuguesa-g05';
const SUBTOPICO = 'Crase';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_crase';
const REVIEWED = '2026-07-19';

const GOLDEN_REFERENCES = {
  eliminacao: 'examples/questao-premium-vunesp-portugues-crase-funil.json',
  lacunas: 'examples/questao-premium-vunesp-portugues-crase-lacunas-ioga.json',
} as const;

type AnchorStyle = keyof typeof GOLDEN_REFERENCES;

const SLUG_ANCHOR_STYLE: Record<string, AnchorStyle> = {
  'vunesp-guararapes-crase-lacunas-tira-3607407': 'lacunas',
  'caderno-pt-crase-constituicao-lacunas-3614637': 'lacunas',
  'caderno-pt-crase-erro-compramos-prazo-3614663': 'eliminacao',
  'caderno-pt-crase-previdencia-lacunas-3661931': 'lacunas',
  'caderno-pt-crase-semelhante-propostas-3662939': 'eliminacao',
  'consulplan-indaiatuba-crase-lacunas-pressas-3694717': 'lacunas',
  'cebraspe-radio-apaixonado-crase-aquilo-3698162': 'eliminacao',
  'cebraspe-clima-reescrita-crase-3705197': 'eliminacao',
};

const PT_CRASE_SOURCE = {
  id: PT_CRASE_CONCURSOS.id,
  tier: 'A' as const,
  issuer: PT_CRASE_CONCURSOS.issuer,
  title: PT_CRASE_CONCURSOS.title,
  year: PT_CRASE_CONCURSOS.year,
  url: PT_CRASE_CONCURSOS.url,
  covers: ['funil 3 testes', 'teste ao', 'locução adverbial feminina', 'horas', 'pronome pessoal'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment';

type Spec = {
  family: Family;
  anchor_style?: AnchorStyle;
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
  const anchorStyle = spec.anchor_style ?? SLUG_ANCHOR_STYLE[slug] ?? 'eliminacao';
  const goldenReference = GOLDEN_REFERENCES[anchorStyle];
  return {
    ...spec.meta,
    topico: TOPICO,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:lingua-portuguesa-g05',
      guideline_snapshot: `${PT_CRASE_CONCURSOS.snapshot} · âncora ${anchorStyle} → ${goldenReference}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      PT_CRASE_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', `âncora ${anchorStyle}`],
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
  'vunesp-guararapes-crase-lacunas-tira-3607407': {
    family: 'conceito',
    source_tec_id: '3607407',
    source_note: 'Crase lacunas — VUNESP ADE Pref. Guararapes 2025 tira tec 3607407',
    meta: {
      banca: 'VUNESP',
      prova: 'ADE (Pref Guararapes)',
      orgao: 'Pref. Guararapes',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira a seguir para responder à questão.\nAssinale a alternativa que preenche, correta e respectivamente, as lacunas da tira, de acordo com a norma-padrão.\n(Dediquei-me ___ cuidados preventivos, compareci ___ unidade de saúde e aguardei ___ recepção.)',
    options: [
      { id: 'A', text: 'a … à … na', is_correct: true },
      { id: 'B', text: 'à … a … a', is_correct: false },
      { id: 'C', text: 'a … na … a', is_correct: false },
      { id: 'D', text: 'há … à … à', is_correct: false },
      { id: 'E', text: 'há … a … na', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'a · à · na',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Dediquei-me a', detail: 'Dedicar-se a cuidados preventivos — regência com a.', icon: 'HeartPulse' },
          { label: 'Compareci à', detail: 'Comparecer à unidade de saúde — destino fem.', icon: 'Building2' },
          { label: 'Aguardei na', detail: 'Aguardar na recepção — em + a → na.', icon: 'Hourglass' },
          { label: 'Guararapes / ADE', detail: 'Tira VUNESP Guararapes — a · à · na.', icon: 'MapPin' },
        ],
        footer_rule: 'Regência a × destino à × lugar na.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Lacuna a lacuna',
        meta: slideMeta,
        steps: [
          '1ª: «dediquei-me ___ cuidados preventivos» — dedicar-se a → a.',
          '2ª: «compareci ___ unidade de saúde» — comparecer à unidade → à.',
          '3ª: «aguardei ___ recepção» — aguardar na recepção → na.',
          'Sequência: a / à / na — gabarito A.',
          'B: à cuidados; C: na unidade; D/E: «há» não encaixa.',
          'Na = em + a — não é crase isolada.',
          'Em similares: dedicar-se a · comparecer à · aguardar na.',
          'Guararapes ADE — distinto da tira Osasco ACS.',
        ],
        footer_rule: 'A = a … à … na.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: 'A · À · NA',
        rows: [
          { label: 'Regência', value: 'dediquei-me a cuidados — a' },
          { label: 'Destino', value: 'compareci à unidade — à' },
          { label: 'Lugar', value: 'aguardei na recepção — em+a' },
          { label: 'Nesta questão', value: 'a … à … na' },
        ],
        footer_rule: 'Na não é crase — é contração de em+a.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas da tira',
        meta: slideMeta,
        content: 'Trocar à por na ou «há»',
        items: [
          { label: 'B — à cuidados', detail: 'Crase na regência «dediquei-me».', correct: 'Dediquei-me a cuidados — verbo pede a simples.' },
          { label: 'C — na unidade', detail: '«Na unidade» no movimento.', correct: 'Comparecer à unidade de saúde — destino com à.' },
          { label: 'D — há … à', detail: '«Há» como verbo existencial forçado.', correct: 'Construção: dediquei-me / compareci / aguardei.' },
          { label: 'E — há + unidade', detail: 'Mistura existencial com regência.', correct: '2ª lacuna: comparecer à, não «há a».' },
          { label: 'Em outra banca…', detail: 'Trocam unidade por «farmácia» ou «UBS».', correct: 'Mesmo trio: a cuidados · à unidade · na recepção.' },
        ],
        footer_rule: 'A passa: a · à · na.',
      },
    ],
  },

  'caderno-pt-crase-constituicao-lacunas-3614637': {
    family: 'text_fragment',
    source_tec_id: '3614637',
    source_note: 'Crase lacunas — caderno PT Constituição/mobilidade social (Estadão) tec 3614637',
    meta: { banca: 'Caderno PT', prova: 'Crase — lacunas Constituição CF/88', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Coube ___ Constituição federal firmar compromissos com o povo, garantindo ___ todos os cidadãos a erradicação da pobreza e da marginalização. Coube ___ ela, também, firmar o compromisso de redução das desigualdades sociais e regionais. Além disso, foi garantida ___ criança prioridade absoluta.\nDe acordo com a norma-padrão, as lacunas devem ser preenchidas, respectivamente, com:',
    text_fragment:
      '<p><strong>Crianças condenadas à estagnação</strong></p><p>O Atlas da Mobilidade Social do Brasil (IMDS) mostra que menos de 2% das crianças pobres alcançarão os 10% mais ricos. A <strong>Constituição federal de 1988</strong> afirma erradicar a pobreza e a marginalização e reduzir desigualdades — e diz que a <strong>criança é prioridade absoluta</strong>.</p><p><em>Opinião Estadão, 20.06.2025 — adaptado</em></p>',
    options: [
      { id: 'A', text: 'à … à … a … a', is_correct: false },
      { id: 'B', text: 'a … à … à … a', is_correct: false },
      { id: 'C', text: 'à … à … à … à', is_correct: false },
      { id: 'D', text: 'a … a … à … à', is_correct: false },
      { id: 'E', text: 'à … a … a … à', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '4 lacunas — CF/88',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Constituição / IMDS', detail: 'Atlas da Mobilidade Social — Constituição federal de 1988.', icon: 'Landmark' },
          { label: 'À Constituição', detail: 'Coube à Constituição firmar compromissos — OD fem.', icon: 'Scale' },
          { label: 'A todos', detail: 'Garantindo a todos os cidadãos — pronome indefinido.', icon: 'Users' },
          { label: 'A ela', detail: 'Coube a ela firmar — pronome pessoal, sem crase.', icon: 'User' },
          { label: 'À criança', detail: 'Garantida à criança prioridade absoluta — a+a fem.', icon: 'Baby' },
        ],
        footer_rule: 'Pronome «ela» e «todos» barra crase.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Funil por lacuna',
        meta: slideMeta,
        steps: [
          'Texto: mobilidade social, pobreza, marginalização e Constituição de 1988.',
          '1ª: «coube ___ Constituição» — coube à Constituição → à.',
          '2ª: «garantindo ___ todos os cidadãos» — a todos → a (pronome).',
          '3ª: «coube ___ ela» — coube a ela → a (pronome pessoal).',
          '4ª: «garantida ___ criança» — à criança prioridade → à.',
          'Sequência: à / a / a / à — gabarito E.',
          'A/C crase em «todos» ou «ela»; B/D invertem 2ª e 3ª.',
          'Em similares: coube à lei · a todos · a ela · à criança.',
        ],
        footer_rule: 'E = à … a … a … à.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '4 LACUNAS NA CF',
        rows: [
          { label: 'OD fem.', value: 'coube à Constituição — a+a' },
          { label: 'Indefinido', value: 'a todos os cidadãos — sem crase' },
          { label: 'Pronome', value: 'coube a ela — sem crase' },
          { label: 'Prioridade', value: 'à criança — a+a fem.' },
          { label: 'Nesta questão', value: 'à … a … a … à' },
        ],
        footer_rule: 'Pronome pessoal/indefinido = a simples.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas do editorial',
        meta: slideMeta,
        content: 'Crase em «todos» ou «ela»',
        items: [
          { label: 'A — à todos', detail: '«Garantindo à todos os cidadãos» parece formal.', correct: 'Garantindo a todos — pronome indefinido sem artigo.' },
          { label: 'B — à ela', detail: '«Coube à ela» imita tratamento culto.', correct: 'Coube a ela — pronome pessoal bloqueia crase.' },
          { label: 'C — quatro crases', detail: 'Simetria visual em todas as lacunas.', correct: 'Só 1ª e 4ª (Constituição/criança) pedem crase.' },
          { label: 'D — a Constituição', detail: 'Primeira lacuna sem crase.', correct: 'Coube à Constituição federal — OD fem. determinado.' },
          { label: 'Em outra banca…', detail: 'Trocam criança por «juventude» ou «mulher».', correct: 'Mesmo funil: à CF · a todos · a ela · à criança.' },
        ],
        footer_rule: 'E passa nas quatro lacunas.',
      },
    ],
  },

  'caderno-pt-crase-erro-compramos-prazo-3614663': {
    family: 'conceito',
    source_tec_id: '3614663',
    source_note: 'Crase erro — caderno PT compramos à prazo tec 3614663',
    meta: { banca: 'Caderno PT', prova: 'Crase — erro acento grave', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction: 'Identifique qual das alternativas a seguir possui um erro quanto ao acento grave (`):',
    options: [
      { id: 'A', text: 'Vamos à praia amanhã?', is_correct: false },
      { id: 'B', text: 'Devo tudo àquela pessoa que me ajudou bastante.', is_correct: false },
      { id: 'C', text: 'O início do show será às horas marcadas do evento.', is_correct: false },
      { id: 'D', text: 'Compramos à prazo.', is_correct: true },
      { id: 'E', text: 'Envie o e-mail à coordenação.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ache o erro',
        meta: slideMeta,
        items: [
          { label: 'Vamos à praia', detail: 'Destino fem. — «Vamos à praia amanhã?» correta (A).', icon: 'Umbrella' },
          { label: 'Àquela pessoa', detail: 'Pronome composto — «Devo tudo àquela pessoa» (B).', icon: 'Heart' },
          { label: 'Às horas do show', detail: 'Hora do evento — início do show às horas marcadas (C).', icon: 'Clock' },
          { label: 'A prazo', detail: '«Compramos à prazo» — ERRO: a prazo (D).', icon: 'CreditCard' },
          { label: 'À coordenação', detail: '«Envie o e-mail à coordenação» — destino fem. (E).', icon: 'Mail' },
        ],
        footer_rule: 'Locução «a prazo» — sem crase.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual frase tem ERRO de acento grave?',
          'A: «à praia» — destino fem. → correta.',
          'B: «àquela pessoa» — pronome composto → correta.',
          'C: «às horas marcadas do show» — hora pontual → correta.',
          'E: «à coordenação» — destino fem. → correta.',
          'D: «Compramos à prazo» — locução fixa a prazo.',
          'Correto: compramos a prazo — gabarito D.',
          'Em similares: pagamento a prazo · venda a vista.',
        ],
        footer_rule: 'D erra: à prazo → a prazo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'A prazo × à praia',
        meta: slideMeta,
        content: 'LOCUÇÃO A PRAZO',
        rows: [
          { label: 'Errado', value: 'compramos à prazo' },
          { label: 'Certo', value: 'compramos a prazo — locução fixa' },
          { label: 'Contraste', value: 'à praia · à coordenação — destino fem.' },
          { label: 'Composto', value: 'àquela pessoa — crase no pronome' },
        ],
        footer_rule: 'A prazo / a vista — sem crase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas',
        meta: slideMeta,
        content: 'Crase onde há locução fixa',
        items: [
          { label: 'A — parece errado', detail: '«À praia» confunde quem evita crase.', correct: 'Vamos à praia — destino fem. com crase.' },
          { label: 'B — àquela', detail: 'Parece «demonstrativo proibido».', correct: 'Àquela é pronome composto — crase legítima.' },
          { label: 'C — horas do show', detail: 'Aluno acha que hora não leva crase.', correct: 'Show às horas marcadas — hora determinada.' },
          { label: 'E — a coordenação', detail: '«E-mail a coordenação» sem crase.', correct: 'Envie à coordenação — OD fem. com artigo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «pagamento à vista» (errado).', correct: 'A prazo / a vista — locuções sem crase.' },
        ],
        footer_rule: 'D é a única incorreta.',
      },
    ],
  },

  'caderno-pt-crase-previdencia-lacunas-3661931': {
    family: 'conceito',
    source_tec_id: '3661931',
    source_note: 'Crase lacunas — caderno PT Previdência/MaturiJobs tec 3661931',
    meta: { banca: 'Caderno PT', prova: 'Crase — lacunas debate/vezes/partir', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa que completa, correta e respectivamente, as lacunas do trecho seguinte:\nProibido para menores de 50 anos. Nos últimos meses, em meio ___ debate sobre as reformas da Previdência, um ponto acabou despertando a atenção. Afinal, existem empregos para quem tem mais de 50 anos? Pendurar as chuteiras nem sempre é fácil. ___ vezes, pode significar uma quebra tão grande na rotina que afeta até mesmo o emocional. Foi ___ partir de uma experiência familiar, nesta linha que o paulistano Mórris Litvak criou a startup MaturiJobs.',
    options: [
      { id: 'A', text: 'Ao – As – A.', is_correct: false },
      { id: 'B', text: 'À – Às – A.', is_correct: false },
      { id: 'C', text: 'Ao – Às – A.', is_correct: true },
      { id: 'D', text: 'A – As. À.', is_correct: false },
      { id: 'E', text: 'Ao – Às. À.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '3 lacunas — Previdência',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'MaturiJobs / 50 anos', detail: 'Startup para profissionais com mais de 50 anos — Previdência.', icon: 'Briefcase' },
          { label: 'Ao debate', detail: 'Em meio ao debate — prep. em + o debate (masc.).', icon: 'MessageCircle' },
          { label: 'Às vezes', detail: 'Locução adverbial fixa — às vezes, com crase.', icon: 'Shuffle' },
          { label: 'A partir', detail: 'A partir de experiência — locução, a simples.', icon: 'Flag' },
          { label: 'Chuteiras', detail: 'Pendurar as chuteiras — metáfora de aposentadoria.', icon: 'Timer' },
        ],
        footer_rule: 'Debate masc. × locução fem. × a partir.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '1ª: «em meio ___ debate» — em meio ao debate → Ao.',
          '2ª: «___ vezes» — locução às vezes → Às.',
          '3ª: «foi ___ partir» — a partir de → A.',
          'Sequência: Ao / Às / A — gabarito C.',
          'A erra na 2ª (As); B na 1ª (À debate); D/E na 3ª.',
          'Teste ao: em meio ao debate (masc.) — não «à debate».',
          'Em similares: às vezes · a partir de · em meio ao.',
          'Gabarito C.',
        ],
        footer_rule: 'C = Ao – Às – A.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '3 LOCUÇÕES CLÁSSICAS',
        rows: [
          { label: 'Em meio ao', value: 'em meio ao debate — masc., sem crase à' },
          { label: 'Às vezes', value: 'às vezes — locução fixa com crase' },
          { label: 'A partir', value: 'a partir de — a simples' },
          { label: 'Nesta questão', value: 'Ao – Às – A.' },
        ],
        footer_rule: 'Às vezes sempre leva crase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas',
        meta: slideMeta,
        content: 'Crase no debate ou em «a partir»',
        items: [
          { label: 'A — As vezes', detail: 'Plural sem crase na locução.', correct: 'Às vezes — locução adverbial fixa.' },
          { label: 'B — À debate', detail: 'Crase antes de substantivo masc.', correct: 'Em meio ao debate — o debate (masc.).' },
          { label: 'D — As vezes', detail: 'Mistura As + À na 3ª.', correct: '2ª: às vezes; 3ª: a partir.' },
          { label: 'E — À partir', detail: 'Crase na locução «a partir».', correct: 'A partir de — locução com a simples.' },
          { label: 'Em outra banca…', detail: 'Trocam Previdência por reforma tributária.', correct: 'Mesmo funil: ao debate · às vezes · a partir.' },
        ],
        footer_rule: 'C passa nas três lacunas.',
      },
    ],
  },

  'caderno-pt-crase-semelhante-propostas-3662939': {
    family: 'text_fragment',
    source_tec_id: '3662939',
    source_note: 'Crase semelhante às propostas — caderno PT bebês reborn PB tec 3662939',
    meta: { banca: 'Caderno PT', prova: 'Crase — semelhante às propostas estaduais', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      '«Na Câmara Municipal de João Pessoa, o vereador Guguinha Moov Jampa (PSD) apresentou, no dia 21 de maio, o PLO 269/2025, com teor semelhante às propostas estaduais.»\nQuanto ao uso do sinal indicativo da crase, assinale a alternativa CORRETA.',
    text_fragment:
      '<p><strong>Projeto de lei quer barrar uso de bebês reborn para furar fila na PB</strong></p><p>Bonecos «bebê reborn» entraram no debate na Paraíba. Na <strong>Câmara Municipal de João Pessoa</strong>, o vereador <strong>Guguinha Moov Jampa (PSD)</strong> apresentou o <strong>PLO 269/2025</strong>, com teor <strong>semelhante às propostas estaduais</strong>. Projetos na ALPB e em Campina Grande buscam coibir fraudes em atendimentos prioritários.</p><p><em>Jornal da Paraíba — adaptado</em></p>',
    options: [
      { id: 'A', text: 'Antes da palavra "propostas", não é obrigatório o uso do sinal indicativo da crase.', is_correct: false },
      { id: 'B', text: 'Antes da palavra "propostas", a crase é opcional.', is_correct: false },
      { id: 'C', text: 'Antes da palavra "propostas", deve-se usar o sinal indicativo da crase.', is_correct: true },
      { id: 'D', text: 'O sinal indicativo da crase é de uso obrigatório porque "semelhante" é uma locução adverbial e prepositiva.', is_correct: false },
      { id: 'E', text: 'Usa-se crase antes da palavra "proposta", porque está precedida do verbo "semelhante" que indica estado.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Semelhante às propostas',
        meta: slideMeta,
        items: [
          { label: 'Bebês reborn / PB', detail: 'PLO 269/2025 em João Pessoa — bonecos reborn na fila.', icon: 'Baby' },
          { label: 'Guguinha / PSD', detail: 'Vereador Guguinha Moov Jampa — Câmara Municipal.', icon: 'Landmark' },
          { label: 'Semelhante às', detail: 'Teor semelhante às propostas estaduais — regência.', icon: 'FileText' },
          { label: 'ALPB / Campina', detail: 'Propostas estaduais na Assembleia e Campina Grande.', icon: 'MapPin' },
          { label: 'Regência nominal', detail: 'Semelhante exige a — a + as propostas → às.', icon: 'Link' },
        ],
        footer_rule: 'Adj. semelhante + às propostas = crase obrigatória.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: «teor semelhante às propostas estaduais».',
          'Funil: semelhante a + as propostas → às propostas.',
          'A/B: negam obrigatoriedade — incorretas.',
          'D: locução adverbial — semelhante é adjetivo, não locução.',
          'E: «verbo semelhante» — categoria errada.',
          'C: crase obrigatória antes de «propostas» — gabarito.',
          'Em similares: equivalente às normas · análogo às leis.',
          'PLO 269/2025 — contexto bebês reborn.',
        ],
        footer_rule: 'C: deve-se usar crase.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Regência de semelhante',
        meta: slideMeta,
        content: 'SEMELHANTE ÀS PROPOSTAS',
        rows: [
          { label: 'Estrutura', value: 'semelhante (adj.) + às propostas (CN)' },
          { label: 'Funil', value: 'semelhante a + as → às' },
          { label: 'Não é locução', value: 'semelhante não é locução adverbial' },
          { label: 'Não é verbo', value: 'semelhante qualifica «teor», não é verbo' },
        ],
        footer_rule: 'C: crase obrigatória.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas',
        meta: slideMeta,
        content: 'Classificar «semelhante» errado',
        items: [
          { label: 'A — não obrigatório', detail: 'Parece que crase é facultativa.', correct: 'Semelhante às propostas — regência exige crase.' },
          { label: 'B — opcional', detail: 'Confunde com a/à facultativo.', correct: 'Aqui a+a fem. plural → às obrigatório.' },
          { label: 'D — locução adverbial', detail: 'Termo técnico que «soa» gramatical.', correct: 'Semelhante é adjetivo — complemento nominal.' },
          { label: 'E — verbo semelhante', detail: 'Inventa categoria verbal.', correct: 'Semelhante qualifica o substantivo «teor».' },
          { label: 'Em outra banca…', detail: 'Trocam propostas por «medidas» ou «normas».', correct: 'Mesma regência: semelhante às + OD fem.' },
        ],
        footer_rule: 'C: crase antes de propostas.',
      },
    ],
  },

  'consulplan-indaiatuba-crase-lacunas-pressas-3694717': {
    family: 'conceito',
    source_tec_id: '3694717',
    source_note: 'Crase lacunas — CONSULPLAN Pref. Indaiatuba 2025 pressas/porta tec 3694717',
    meta: {
      banca: 'CONSULPLAN',
      prova: 'ASA (Pref Indaiatuba)',
      orgao: 'Pref. Indaiatuba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Vestiu-se ___ pressas, foi ___ porta da sua casa e apontou ___ alguém que tinha acabado de sair correndo ___ todo vapor, provavelmente porque estava fazendo molecagem ___ hora da noite.»\nAssinale a alternativa cujos elementos preenchem corretamente os espaços em branco no enunciado acima, na mesma ordem.',
    options: [
      { id: 'A', text: 'às – à – a – a – aquela', is_correct: false },
      { id: 'B', text: 'às – à – a – a – àquela', is_correct: true },
      { id: 'C', text: 'as – à – a – a – aquela', is_correct: false },
      { id: 'D', text: 'às – a – à – à – àquela', is_correct: false },
      { id: 'E', text: 'as – a – à – à – àquela', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '5 lacunas — Indaiatuba',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Às pressas', detail: 'Vestiu-se às pressas — locução fixa plural.', icon: 'Zap' },
          { label: 'À porta', detail: 'Foi à porta da casa — destino fem.', icon: 'DoorOpen' },
          { label: 'A alguém', detail: 'Apontou a alguém — pronome indefinido.', icon: 'Pointer' },
          { label: 'A todo vapor', detail: 'Correndo a todo vapor — locução masc.', icon: 'Wind' },
          { label: 'Àquela hora', detail: 'Molecagem àquela hora da noite — pronome composto.', icon: 'Moon' },
        ],
        footer_rule: 'Locução × destino × pronome × locução masc. × àquela.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Lacuna a lacuna',
        meta: slideMeta,
        steps: [
          '1ª: «vestiu-se ___ pressas» — às pressas → às.',
          '2ª: «foi ___ porta da casa» — à porta → à.',
          '3ª: «apontou ___ alguém» — a alguém → a.',
          '4ª: «correndo ___ todo vapor» — a todo vapor → a.',
          '5ª: «molecagem ___ hora da noite» — àquela hora → àquela.',
          'Sequência: às / à / a / a / àquela — gabarito B.',
          'A erra na 5ª (aquela sem crase); C na 1ª; D/E em várias.',
          'Em similares: às pressas · à porta · a alguém · a todo vapor.',
        ],
        footer_rule: 'B = às – à – a – a – àquela.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '5 LACUNAS',
        rows: [
          { label: 'Locução pl.', value: 'às pressas — fixa' },
          { label: 'Destino', value: 'à porta da casa — a+a fem.' },
          { label: 'Indefinido', value: 'a alguém — sem crase' },
          { label: 'Locução masc.', value: 'a todo vapor — sem crase' },
          { label: 'Composto', value: 'àquela hora — pronome com crase' },
        ],
        footer_rule: 'às – à – a – a – àquela.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas',
        meta: slideMeta,
        content: 'Crase em «alguém» ou «as pressas»',
        items: [
          { label: 'A — aquela hora', detail: '«Aquela hora» sem crase integrada.', correct: 'Àquela hora da noite — pronome composto.' },
          { label: 'C — as pressas', detail: 'Artigo sem crase na locução.', correct: 'Às pressas — locução adverbial fixa.' },
          { label: 'D — a porta', detail: 'Destino sem crase.', correct: 'Foi à porta da sua casa — a+a fem.' },
          { label: 'E — as + a porta', detail: 'Duplo erro nas duas primeiras.', correct: '1ª: às pressas; 2ª: à porta.' },
          { label: 'Em outra banca…', detail: 'Trocam molecagem por «brincadeira» noturna.', correct: 'Mesmo funil: às pressas · à porta · a alguém.' },
        ],
        footer_rule: 'B passa nas cinco lacunas.',
      },
    ],
  },

  'cebraspe-radio-apaixonado-crase-aquilo-3698162': {
    family: 'text_fragment',
    source_tec_id: '3698162',
    source_note: 'Crase àquilo — CEBRASPE Boa Vista crônica Moacyr Scliar tec 3698162',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ana Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'A crônica «O rádio apaixonado» aborda o relacionamento entre o ser humano e a tecnologia. Em relação ao texto, assinale a afirmativa INCORRETA.',
    text_fragment:
      '<p><strong>O rádio apaixonado</strong> — <em>Moacyr Scliar</em></p><p>Crônica em que um <strong>rádio</strong> instalado no carro da narradora declara-se apaixonado, com ciúmes do <strong>MP4</strong> e do trânsito. Trecho-chave: «Recorri, então, <strong>àquilo</strong> que estava a meu alcance: o som.»</p><p><em>Scliar. Histórias que os jornais não contam — adaptado</em></p>',
    options: [
      { id: 'A', text: 'Em «Tinha de queimar: era ele ou eu.», o pronome «ele» retoma a expressão «MP4».', is_correct: false },
      { id: 'B', text: 'As palavras «rádio» e «silêncio» empregadas ao longo do texto são acentuadas por serem paroxítonas terminadas em ditongo.', is_correct: false },
      { id: 'C', text: 'Em «Lá pelas tantas eu tinha ciúmes até do seu MP4.», a expressão destacada significa «num momento indeterminado ou tardio».', is_correct: false },
      { id: 'D', text: '«Recorri, então, àquilo que estava a meu alcance: o som.». O acento grave se justifica, pois o pronome «àquilo» determina o sujeito da ação verbal.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Àquilo — por quê?',
        meta: slideMeta,
        items: [
          { label: 'Rádio apaixonado', detail: 'Crônica de Moacyr Scliar — rádio no carro e ciúmes.', icon: 'Radio' },
          { label: 'MP4 / som', detail: '«Tinha de queimar: era ele ou eu» — MP4 vs rádio.', icon: 'Music' },
          { label: 'Àquilo', detail: 'Recorri àquilo que estava a meu alcance — pronome composto.', icon: 'Volume2' },
          { label: 'Não é sujeito', detail: 'Àquilo é OD — não «determina sujeito» (D erra).', icon: 'XCircle' },
          { label: 'Lá pelas tantas', detail: 'Expressão temporal — momento indeterminado (C correta).', icon: 'Clock' },
        ],
        footer_rule: 'Àquilo = pronome composto, não crase+artigo separado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa INCORRETA sobre a crônica do rádio.',
          'A: «ele» retoma MP4 — correto.',
          'B: rádio/silêncio paroxítonos em ditongo — correto.',
          'C: «lá pelas tantas» = momento tardio — correto.',
          'D: «àquilo determina sujeito» — FALSO.',
          'Àquilo é pronome demonstrativo composto — crase integrada.',
          'Na frase, «àquilo» é objeto de «recorri», não sujeito.',
          'Gabarito D — justificativa gramatical errada.',
        ],
        footer_rule: 'D incorreta: àquilo não determina sujeito.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Àquilo × sujeito',
        meta: slideMeta,
        content: 'PRONOME COMPOSTO',
        rows: [
          { label: 'Forma', value: 'àquilo — crase já no pronome' },
          { label: 'Função', value: 'objeto de «recorri» — OD, não sujeito' },
          { label: 'Errado (D)', value: '«determina o sujeito da ação»' },
          { label: 'Certo', value: 'recorrer àquilo = regência + pronome composto' },
        ],
        footer_rule: 'INCORRETA = D.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Por que não são D',
        meta: slideMeta,
        content: 'Confundir análise de crase com morfologia',
        items: [
          { label: 'A — ele/MP4', detail: 'Parece pegadinha de coesão.', correct: '«Era ele ou eu» — ele retoma o MP4.' },
          { label: 'B — ditongo', detail: 'Regra de acentuação distrai.', correct: 'Rádio e silêncio — paroxítonas em ditongo.' },
          { label: 'C — lá pelas tantas', detail: 'Expressão informal parece errada.', correct: 'Significa momento indeterminado/tardio.' },
          { label: 'D — parece certa', detail: '«Àquilo» com acento «exige» explicação técnica.', correct: 'Crase integrada ao pronome; função = OD, não sujeito.' },
          { label: 'Em outra banca…', detail: 'Pedem função de «àquele» em outra frase.', correct: 'Composto ≠ a + aquilo; analisar função sintática.' },
        ],
        footer_rule: 'D é a INCORRETA.',
      },
    ],
  },

  'cebraspe-clima-reescrita-crase-3705197': {
    family: 'text_fragment',
    source_tec_id: '3705197',
    source_note: 'Crase reescrita — CEBRASPE Boa Vista mudanças climáticas FGV tec 3705197',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ass Tec Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Cada uma das próximas opções apresenta um trecho do texto CG1A1 seguido de uma proposta de reescrita. Assinale a opção na qual a proposta apresentada mantém a correção gramatical.',
    text_fragment:
      '<p>Mudanças climáticas e saúde — Fórum Econômico Mundial / FGV</p><p>Relatório sobre mudanças climáticas: ondas de calor, dengue, malária, ecoansiedade e ansiedade climática (APA). Trecho: o sofrimento de crianças e adolescentes associa-se tanto às experiências da emergência climática atual quanto à impossibilidade de imaginar futuros alternativos.</p><p>portal.fgv.br — adaptado</p>',
    options: [
      { id: 'A', text: '«os danos ambientais implicam a perda de um modo de vida»: os danos ambientais implicam à perda de um modo de vida', is_correct: false },
      { id: 'B', text: '«associa-se tanto às experiências da emergência climática atual»: associa-se tanto a experiências da emergência climática atual', is_correct: true },
      { id: 'C', text: '«quanto à impossibilidade de imaginar futuros alternativos»: quanto a impossibilidade de imaginar futuros alternativos', is_correct: false },
      { id: 'D', text: '«79% relacionam-se a condições de saúde»: 79% relacionam-se à condições de saúde', is_correct: false },
      { id: 'E', text: '«varia de estresse leve a transtornos clínicos»: varia de estresse leve à transtornos clínicos', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reescrita correta',
        meta: slideMeta,
        items: [
          { label: 'Clima / FGV', detail: 'Relatório Fórum Econômico Mundial — mudanças climáticas e saúde.', icon: 'CloudSun' },
          { label: 'Dengue / malária', detail: 'Ondas de calor expandem vetores — dengue e malária.', icon: 'Bug' },
          { label: 'Ecoansiedade', detail: 'Ansiedade climática (APA) — sofrimento de crianças e adolescentes.', icon: 'Brain' },
          { label: 'Associa-se a', detail: 'Associa-se tanto a experiências — plural indefinido (B).', icon: 'Link' },
          { label: 'Impossibilidade', detail: 'Quanto à impossibilidade de imaginar futuros — crase no original.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Relatorio FGV: mudancas climaticas — Forum Economico Mundial.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto FGV (relatorio): mudancas climaticas, ondas de calor, dengue, malária, ecoansiedade.',
          'Trecho: associa-se tanto às experiências da emergência climática atual.',
          'Comando: reescrita que MANTÉM a correção — só uma opção.',
          'A: «implicam à perda» — crase indevida; certo: implicam a perda.',
          'B: «associa-se tanto a experiências» — indefinido pl. sem artigo → correto.',
          'C: retira crase de «quanto à impossibilidade» — original exige à.',
          'D/E: crase indevida antes de condições/transtornos.',
          'Gabarito B — única reescrita gramatical.',
        ],
        footer_rule: 'B mantém a correção.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Reescrita × crase',
        meta: slideMeta,
        content: 'EXPERIÊNCIAS INDEFINIDAS',
        rows: [
          { label: 'B (certa)', value: 'associa-se tanto a experiências — sem artigo' },
          { label: 'A (errada)', value: 'implicam à perda — OD sem artigo definido' },
          { label: 'C (errada)', value: 'quanto à impossibilidade — crase necessária' },
          { label: 'D/E', value: 'à + plural indefinido — duplo erro' },
        ],
        footer_rule: 'B = a experiências (indefinido).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas CESPE',
        meta: slideMeta,
        content: 'Crase automática na reescrita',
        items: [
          { label: 'A — à perda', detail: '«Implicam à perda» parece regência culta.', correct: 'Implicam a perda de um modo de vida — sem artigo fem.' },
          { label: 'C — quanto a', detail: 'Retirar crase parece simplificar.', correct: 'Quanto à impossibilidade — artigo definido fem.' },
          { label: 'D — à condições', detail: 'Crase + plural atrai.', correct: 'Relacionam-se a condições de saúde — plural indef.' },
          { label: 'E — à transtornos', detail: '«Varia à transtornos» imita B.', correct: 'Varia de estresse leve a transtornos — sem crase.' },
          { label: 'Em outra banca…', detail: 'Trocam ecoansiedade por burnout climático.', correct: 'Indefinido plural: a experiências / a problemas.' },
        ],
        footer_rule: 'B é a única correta.',
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
