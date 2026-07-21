#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g12 (8 slugs · Pontuação · lote 5).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g12.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g12 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g12 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';

const LOTE = 'lingua-portuguesa-g12';
const SUBTOPICO = 'Pontuação';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_pontuacao';
const REVIEWED = '2026-07-20';

const GOLDEN_REFERENCES = {
  eliminacao: 'examples/questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json',
  vf: 'examples/questao-premium-cpcon-portugues-pontuacao-tirinha-vf.json',
} as const;

type AnchorStyle = keyof typeof GOLDEN_REFERENCES;

const PT_PONTUACAO_SOURCE = {
  id: PT_PONTUACAO.id,
  tier: 'A' as const,
  issuer: PT_PONTUACAO.issuer,
  title: PT_PONTUACAO.title,
  year: PT_PONTUACAO.year,
  url: PT_PONTUACAO.url,
  covers: [
    'pergunta-teste',
    'vocativo',
    'aposto',
    'reescrita',
    'adjunto-deslocado',
    'travessao',
    'dois-pontos',
    'coordenada-anteposta',
    'adverbial-anteposta',
    'termo-deslocado',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment' | 'vf';

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
  exam_vs_current?: string;
};

const slideMeta = { topico: TOPICO, subtopico: SUBTOPICO };

function metaBase(spec: Spec, slug: string) {
  const anchorStyle = spec.anchor_style ?? 'eliminacao';
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
      reviewer: 'handcraft:lingua-portuguesa-g12',
      guideline_snapshot: `${PT_PONTUACAO.snapshot} · âncora ${anchorStyle} → ${goldenReference}`,
      exam_vs_current: spec.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: [
      PT_PONTUACAO_SOURCE,
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

const DOMINGO_FRAGMENT =
  '<p><strong>Domingo</strong> — José Carlos Oliveira (1967, adaptado)</p>' +
  '<p>Crônica sobre domingo chuvoso sem jornais: o narrador lamenta a falta de informação detalhada ' +
  'e compara a rotina banal do Rio com a necessidade de ler o jornal «a informação seca».</p>' +
  '<p><strong>Excerto em foco:</strong> «O meu domingo é pobre, chove no mar, e os cinemas só exibem filmes que já vimos.»</p>' +
  '<p>A <strong>segunda vírgula</strong> (antes de «e os cinemas») separa orações coordenadas sindéticas — ' +
  'vírgula opcional antes de «e» entre orações de sujeitos distintos.</p>';

const REBORN_FRAGMENT =
  '<p><strong>Bebês reborn na Paraíba</strong> (notícia adaptada, 2025)</p>' +
  '<p>Projetos de lei na ALPB e câmaras municipais propõem sanções a quem usa bonecos realistas ' +
  'de recém-nascidos para obter atendimento preferencial.</p>' +
  '<p><strong>Trecho analisado:</strong> «Na última semana, o uso de bonecos do tipo "bebê reborn", ' +
  'que são réplicas realistas de recém-nascidos, entrou no debate político na Paraíba.»</p>';

const MEMORIA_FRAGMENT =
  '<p>«Com rotinas agitadas e a facilidade de acesso diário a uma infinidade de conteúdos das redes sociais e do streaming, ' +
  'é comum sentir a mente sobrecarregada.»</p>' +
  '<p>A vírgula após «streaming» separa o adjunto adverbial inicial do predicado da oração principal.</p>';

const VERISSIMO_FRAGMENT =
  '<p>«Claro que, para chegar ao papel e à esferográfica, tivemos que passar antes pelo risco com vara no chão…» (Verissimo, 1º parágrafo)</p>' +
  '<p>No 4º período, «antes» funciona como advérbio de tempo intercalado — pode ser isolado entre vírgulas.</p>';

const SCLIAR_FRAGMENT =
  '<p><strong>O rádio apaixonado</strong> — Moacyr Scliar (adaptado)</p>' +
  '<p>Crônica em primeira pessoa: um rádio de carro «apaixonado» reclama dos ciúmes da dona.</p>' +
  '<p><strong>Fragmento:</strong> «O Bentinho, do Machado de Assis, aquele que desconfiava da Capitu, não sofreu tanto.»</p>' +
  '<p>«do Machado de Assis» e «aquele que desconfiava da Capitu» são <strong>apostos explicativos</strong> de «Bentinho».</p>';

const LARANJA_FRAGMENT =
  '<p><strong>Laranjas e vitamina C</strong> (adaptado, 2025)</p>' +
  '<p>Fruta cítrica rica em vitamina C — aliada contra dano oxidativo e enfraquecimento imunológico.</p>' +
  '<p><strong>Excerto (5º parágrafo):</strong> «Cada laranja fornece mais de 90% do valor diário recomendado de vitamina C, ' +
  'o que favorece a produção de glóbulos brancos: responsáveis por combater infecções respiratórias como resfriados e gripes.»</p>' +
  '<p>Os dois-pontos após «glóbulos brancos» introduzem explicação sobre a função dessas células.</p>';

const SPECS: Record<string, Spec> = {
  'avancasp-cerquilho-pontuacao-adjunto-3661696': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3661696',
    source_note: 'Adjunto adverbial deslocado — AVANÇASP ACS Pref Cerquilho 2025 tec 3661696',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Cerquilho)',
      orgao: 'Pref. Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'A vírgula está corretamente empregada em:',
    options: [
      { id: 'A', text: 'A mãe, não tinha ideia de como resolver a situação.', is_correct: false },
      { id: 'B', text: 'Não parecia, tão preocupada, como diziam.', is_correct: false },
      { id: 'C', text: 'Mesmo insatisfeito, resolveu continuar naquele trabalho.', is_correct: true },
      { id: 'D', text: 'As ruas íngremes dificultavam, a viagem.', is_correct: false },
      { id: 'E', text: 'Respirar fundo é bom tanto para o corpo, quanto para a mente.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adjunto adverbial deslocado',
        chip_label: 'O que a vírgula isola?',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assinale a frase com vírgula correta.', icon: 'Search' },
          { label: 'C — gabarito', detail: '«Mesmo insatisfeito, resolveu…» — adjunto concessivo anteposto.', icon: 'Check' },
          { label: 'Adjunto anteposto', detail: 'Termo deslocado antes do verbo → vírgula depois dele.', icon: 'ArrowRight' },
          { label: 'Proibições', detail: 'Sujeito|verbo · verbo|OD · SN cortado.', icon: 'Ban' },
        ],
        footer_rule: 'Adjunto adverbial antes da oração principal → vírgula obrigatória.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Eliminação letra a letra',
        meta: slideMeta,
        steps: [
          'Comando: vírgula corretamente empregada em uma alternativa.',
          'A: «A mãe, não tinha» — vírgula entre sujeito e verbo. Proibido.',
          'B: «Não parecia, tão preocupada,» — adjunto mal isolado; pausa oral indevida.',
          'D: «dificultavam, a viagem» — verbo transitivo + OD separados. Proibido.',
          'E: «tanto para o corpo, quanto» — «tanto… quanto» não leva vírgula interna.',
          'C: «Mesmo insatisfeito, resolveu continuar» — adjunto adverbial concessivo anteposto.',
          'Teste: o que fica isolado? «Mesmo insatisfeito» modifica o predicado — vírgula depois.',
          'Gabarito C.',
          'Em similares: adjunto antes do verbo → vírgula; sujeito|verbo → sem vírgula.',
        ],
        footer_rule: 'C = adjunto adverbial deslocado bem pontuado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO ANTEPOSTO',
        rows: [
          { label: 'Regra', value: 'Adjunto adverbial antes da principal → vírgula depois dele' },
          { label: 'Exemplo', value: '«Mesmo insatisfeito, resolveu continuar»' },
          { label: 'Proibido', value: '«A mãe, não tinha» · «dificultavam, a viagem»' },
        ],
        footer_rule: 'Pergunta-teste: o que a vírgula isola?',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir adjunto com sujeito|verbo',
        items: [
          { label: 'A — A mãe, não tinha', detail: 'Pausa oral após sujeito simples.', correct: 'Sujeito|verbo: sem vírgula entre núcleo e verbo.' },
          { label: 'B — tão preocupada', detail: 'Vírgulas parecem destacar termo.', correct: 'Adjunto mal posicionado — pausa oral ≠ norma.' },
          { label: 'D — dificultavam, a viagem', detail: 'Parece marcar objeto longo.', correct: 'Verbo|OD: sem vírgula entre transitivo e complemento.' },
          { label: 'E — tanto… quanto', detail: 'Vírgula antes de «quanto» seduz.', correct: 'Correlata «tanto… quanto» — sem vírgula interna.' },
          { label: 'Em outra banca…', detail: 'Trocam «insatisfeito» por «cansado».', correct: 'Mesmo teste: adjunto anteposto ou trilho cortado?' },
        ],
        footer_rule: 'C passa: adjunto concessivo anteposto.',
      },
    ],
  },

  'educapb-umbuzeiro-pontuacao-vf-reborn-3661906': {
    family: 'vf',
    anchor_style: 'vf',
    source_tec_id: '3661906',
    source_note: 'VF vírgulas bebê reborn — EDUCA PB AgA Pref Umbuzeiro 2025 tec 3661906',
    meta: {
      banca: 'EDUCA PB',
      prova: 'AgA (Pref Umbuzeiro)',
      orgao: 'Pref. Umbuzeiro',
      ano: '2025',
    },
    instruction:
      'Leia o texto para responder à questão abaixo.\n\n' +
      'Sobre o emprego das vírgulas no trecho «Na última semana, o uso de bonecos do tipo "bebê reborn", ' +
      'que são réplicas realistas de recém-nascidos, entrou no debate político na Paraíba», julgue os itens a seguir e assinale V para VERDADEIRAS e F para FALSAS:\n\n' +
      'I - A primeira vírgula separa adjunto adverbial deslocado.\n' +
      'II - A primeira vírgula separa oração subordinada adverbial deslocada.\n' +
      'III - A segunda e terceira vírgulas separam oração subordinada adjetiva explicativa.\n' +
      'IV - A segunda e terceira vírgulas separam elementos com a mesma função sintática.\n\n' +
      'Assinale a sequência CORRETA:',
    options: [
      { id: 'A', text: 'F, F, V, V.', is_correct: false },
      { id: 'B', text: 'V, V, F, F.', is_correct: false },
      { id: 'C', text: 'F, V, F, V.', is_correct: false },
      { id: 'D', text: 'V, F, F, V.', is_correct: false },
      { id: 'E', text: 'V, F, V, F.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VF: duas vírgulas, duas funções',
        chip_label: 'Adjunto × adjetiva',
        meta: slideMeta,
        items: [
          { label: '1ª vírgula', detail: '«Na última semana,» — adjunto adverbial temporal anteposto. V.', icon: 'Clock' },
          { label: '2ª e 3ª vírgulas', detail: '«que são réplicas…» — oração adjetiva explicativa. V.', icon: 'BookOpen' },
          { label: 'II — falsa', detail: 'Não há oração subordinada adverbial na abertura.', icon: 'XCircle' },
          { label: 'IV — falsa', detail: 'Não enumera termos — explica «bonecos».', icon: 'XCircle' },
        ],
        footer_rule: 'Sequência V,F,V,F → gabarito E.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'I/II/III/IV no trecho',
        meta: slideMeta,
        steps: [
          'Trecho: «Na última semana, o uso de bonecos… reborn", que são réplicas…, entrou…»',
          'I: «Na última semana,» = adjunto adverbial temporal deslocado → VERDADEIRO.',
          'II: não há oração subordinada adverbial — só adjunto de tempo → FALSO.',
          'III: «que são réplicas realistas de recém-nascidos» = adjetiva explicativa → VERDADEIRO.',
          'IV: não separa elementos de mesma função (enumeração) → FALSO.',
          'Sequência: V, F, V, F.',
          'Conferir alternativas: só E traz V,F,V,F.',
          'Gabarito E.',
          'Em similares: localizar cada vírgula → nomear o que isola → V ou F.',
        ],
        footer_rule: 'E = V,F,V,F.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHECKLIST VF PONTUAÇÃO',
        rows: [
          { label: 'I — adjunto', value: '«Na última semana,» → temporal anteposto = V' },
          { label: 'II — adverbial', value: 'Não há oração subordinada adverbial = F' },
          { label: 'III — adjetiva', value: '«que são réplicas…» explicativa = V' },
          { label: 'IV — enumeração', value: 'Não enumera termos coordenados = F' },
        ],
        footer_rule: 'VF: uma assertiva por vírgula ou par de vírgulas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar adjunto por oração subordinada',
        items: [
          { label: 'A — F,F,V,V', detail: 'Marca I falsa e IV verdadeira.', correct: 'I é V (adjunto temporal); IV é F.' },
          { label: 'B — V,V,F,F', detail: 'Aceita II como verdadeira.', correct: 'II é F — não há oração adverbial subordinada.' },
          { label: 'C — F,V,F,V', detail: 'Inverte I e II.', correct: 'I é V; II é F — adjunto ≠ oração subordinada.' },
          { label: 'D — V,F,F,V', detail: 'Marca III falsa e IV verdadeira.', correct: 'III é V (adjetiva explicativa); IV é F.' },
          { label: 'Em outra banca…', detail: 'Podem trocar «Na última semana» por «Recentemente».', correct: 'Mesmo teste: adjunto anteposto ou oração subordinada?' },
        ],
        footer_rule: 'E passa: V,F,V,F.',
      },
    ],
  },

  'avancasp-cerquilho-pontuacao-virgula-domingo-3662933': {
    family: 'text_fragment',
    anchor_style: 'eliminacao',
    source_tec_id: '3662933',
    source_note: 'Vírgula opcional antes de «e» — AVANÇASP ACE Pref Cerquilho 2025 tec 3662933',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACE (Pref Cerquilho)',
      orgao: 'Pref. Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\n' +
      'A segunda vírgula empregada no excerto «O meu domingo é pobre, chove no mar, e os cinemas só exibem filmes que já vimos» ' +
      'se dá pelo mesmo motivo que em:',
    text_fragment: DOMINGO_FRAGMENT,
    options: [
      { id: 'A', text: 'Este relatório apresenta, ainda, duas seções sobre projetos futuros.', is_correct: false },
      { id: 'B', text: 'A filha foi ao parque de diversões e o filho, ao cinema.', is_correct: false },
      {
        id: 'C',
        text: 'As ruas estão muito vazias, e as lojas tentam atrair clientes de qualquer forma.',
        is_correct: true,
      },
      { id: 'D', text: 'É possível que ela, confusa e triste, tenha tomado a decisão errada.', is_correct: false },
      { id: 'E', text: 'Você, querida, nasceu para brilhar.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula antes de «e»',
        chip_label: 'Coordenadas sindéticas',
        meta: slideMeta,
        items: [
          { label: 'Excerto Oliveira', detail: '«pobre, chove no mar, e os cinemas» — 2ª vírgula antes de «e».', icon: 'BookOpen' },
          { label: 'Função', detail: 'Separa orações coordenadas com sujeitos distintos.', icon: 'GitBranch' },
          { label: 'C — paralelo', detail: '«vazias, e as lojas» — mesma vírgula opcional antes de «e».', icon: 'Check' },
          { label: 'Opcional', detail: 'Norma culta aceita vírgula antes de «e» entre orações.', icon: 'Info' },
        ],
        footer_rule: 'Vírgula + «e» entre orações = coordenação sindética.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto «Domingo»: segunda vírgula antes de «e os cinemas».',
          'Orações: «O meu domingo é pobre» + «chove no mar» + «e os cinemas só exibem…»',
          'Vírgula opcional antes de «e» ligando orações com sujeitos diferentes.',
          'A: «apresenta, ainda,» — advérbio intercalado. Motivo diferente.',
          'B: «o filho, ao cinema» — zeugma/ elipse, não vírgula antes de «e».',
          'D: «confusa e triste» — adjuntos intercalados. Motivo diferente.',
          'E: «Você, querida,» — vocativo. Motivo diferente.',
          'C: «vazias, e as lojas» — mesma vírgula opcional antes de «e» entre orações.',
          'Gabarito C.',
        ],
        footer_rule: 'C = vírgula opcional antes de «e» coordenativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COORDENADA SINDÉTICA',
        rows: [
          { label: 'Regra', value: 'Vírgula facultativa antes de «e» entre orações' },
          { label: 'Domingo', value: '«chove no mar, e os cinemas»' },
          { label: 'Paralelo C', value: '«vazias, e as lojas tentam»' },
          { label: 'Não confundir', value: 'vocativo · advérbio · aposto intercalado' },
        ],
        footer_rule: 'Mesmo motivo = mesma função da vírgula em debate.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir funções da vírgula',
        items: [
          { label: 'A — ainda', detail: 'Advérbio deslocado entre vírgulas.', correct: 'Função: intercalar advérbio — não coordenação.' },
          { label: 'B — ao cinema', detail: 'Vírgula no zeugma, não antes de «e».', correct: 'Elipse após «e o filho» — motivo distinto.' },
          { label: 'D — confusa e triste', detail: 'Adjuntos entre vírgulas no meio da oração.', correct: 'Termo deslocado intercalado — não «e» coordenativo.' },
          { label: 'E — querida', detail: 'Vocativo isolado.', correct: 'Chamamento — não vírgula antes de «e».' },
          { label: 'Em outra banca…', detail: 'Podem citar «chove, e faz frio».', correct: 'Mesmo teste: vírgula opcional antes de «e» entre orações?' },
        ],
        footer_rule: 'C passa: paralelo com Oliveira.',
      },
    ],
  },

  'avancasp-fmsrc-pontuacao-reescrita-3665295': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3665295',
    source_note: 'Reescrita travessão + vírgulas — AVANÇASP Fono FMSRC 2025 tec 3665295',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Fono (FMSRC)',
      orgao: 'FMSRC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«A vida parece cruel aos olhos de alguns homens, mas o que ela requer de todo mundo é coragem. ' +
      'Coragem para continuar e não desistir jamais de realizar grandes feitos.»\n\n' +
      'Assinale a alternativa que apresenta uma forma reescrita correta do enunciado acima, com mudanças na pontuação.',
    options: [
      {
        id: 'A',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer, de todo mundo é coragem – coragem para continuar e não desistir jamais de realizar grandes feitos.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer de todo mundo é coragem – coragem para continuar e não desistir, jamais, de realizar grandes feitos.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer de todo mundo, é coragem; coragem para continuar e não desistir jamais de realizar grandes feitos.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A vida parece cruel aos olhos de alguns homens, mas o que ela requer, de todo mundo, é coragem, coragem para continuar e não desistir jamais, de realizar grandes feitos.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A vida parece cruel, aos olhos de alguns homens, mas o que ela requer, de todo mundo é coragem; coragem, para continuar e não desistir jamais de realizar grandes feitos.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reescrita: travessão + advérbio',
        chip_label: 'Aposto × termo deslocado',
        meta: slideMeta,
        items: [
          { label: 'Original', detail: 'Dois períodos: coragem como tema central.', icon: 'FileText' },
          { label: 'B — gabarito', detail: 'Travessão introduz aposto «coragem» + «jamais» entre vírgulas.', icon: 'Check' },
          { label: 'Travessão', detail: 'Retoma/explica «coragem» — equivalente a vírgula ou dois-pontos.', icon: 'Minus' },
          { label: 'jamais', detail: 'Advérbio de tempo deslocado — «não desistir, jamais, de realizar».', icon: 'Clock' },
        ],
        footer_rule: 'Reescrita correta: travessão + advérbio intercalado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Original em dois períodos; reescrita une com mudanças de pontuação.',
          'A: «requer, de todo mundo é» — vírgula separa verbo de complemento. Erro.',
          'C: «todo mundo, é coragem» — vírgula antes de verbo de ligação desnecessária; ponto e vírgula inadequado.',
          'D: vírgulas excessivas («de todo mundo,» · «coragem, coragem» · «jamais, de»). Erro.',
          'E: «cruel, aos olhos» corta locução; «coragem, para continuar» isola prep. Erro.',
          'B: travessão retoma «coragem»; «jamais» entre vírgulas destaca o advérbio.',
          '«não desistir, jamais, de realizar» — termo deslocado bem isolado.',
          'Gabarito B.',
        ],
        footer_rule: 'B = travessão + «jamais» intercalado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REESCRITA PONTUAÇÃO',
        rows: [
          { label: 'Travessão', value: 'Retoma/explica termo anterior («coragem – coragem para…»)' },
          { label: 'Advérbio', value: '«jamais» deslocado → «não desistir, jamais, de»' },
          { label: 'Evitar', value: 'verbo|OD · sujeito|verbo · vírgula antes de «é»' },
        ],
        footer_rule: 'Reescrita: manter sentido + norma culta.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgulas a mais na reescrita',
        items: [
          { label: 'A — de todo mundo', detail: 'Vírgula entre verbo e complemento.', correct: '«requer de todo mundo» — sem vírgula interna.' },
          { label: 'C — ; coragem', detail: 'Ponto e vírgula onde basta travessão ou vírgula.', correct: 'Coordenação mal marcada; vírgula antes de «é».' },
          { label: 'D — coragem, coragem', detail: 'Duas vírgulas seguidas confundem aposto.', correct: 'Travessão ou uma vírgula basta para retomar.' },
          { label: 'E — cruel, aos olhos', detail: 'Isola locução adverbial indevidamente.', correct: '«cruel aos olhos de alguns homens» — sem corte.' },
          { label: 'Em outra banca…', detail: 'Podem trocar «jamais» por «nunca».', correct: 'Mesmo teste: advérbio intercalado ou trilho cortado?' },
        ],
        footer_rule: 'B passa: única reescrita correta.',
      },
    ],
  },

  'selecon-tapurah-pontuacao-dois-pontos-3692813': {
    family: 'text_fragment',
    anchor_style: 'eliminacao',
    source_tec_id: '3692813',
    source_note: 'Dois-pontos explicação glóbulos brancos — SELECON Ass Adm Pref Tapurah 2025 tec 3692813',
    meta: {
      banca: 'SELECON',
      prova: 'Ass Adm (Pref Tapurah)',
      orgao: 'Pref. Tapurah',
      ano: '2025',
    },
    instruction:
      'Leia o texto sobre laranjas e vitamina C.\n\n' +
      'Nesse trecho, a função dos dois-pontos é:',
    text_fragment: LARANJA_FRAGMENT,
    options: [
      { id: 'A', text: 'substituir a vírgula, funcionando como recurso de ênfase', is_correct: false },
      { id: 'B', text: 'indicar uma enumeração de elementos que vêm em seguida', is_correct: false },
      {
        id: 'C',
        text: 'introduzir uma explicação ou detalhamento sobre termo anterior',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'inserir uma conclusão que não guarda relação direta com a informação precedente',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois-pontos: explicação',
        chip_label: 'O que vem depois?',
        meta: slideMeta,
        items: [
          { label: 'Antes', detail: '«produção de glóbulos brancos» — termo anunciado.', icon: 'Circle' },
          { label: 'Depois', detail: '«responsáveis por combater infecções…» — explica a função.', icon: 'ArrowRight' },
          { label: 'C — gabarito', detail: 'Dois-pontos introduzem explicação/detalhamento.', icon: 'Check' },
          { label: '≠ enumeração', detail: 'Não lista itens — esclarece o termo anterior.', icon: 'ListX' },
        ],
        footer_rule: 'Dois-pontos explicam o termo que os precede.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: «glóbulos brancos: responsáveis por combater infecções…»',
          'Após os dois-pontos vem explicação do que são os glóbulos brancos no contexto.',
          'A: não substitui vírgula por ênfase — função explicativa.',
          'B: não enumera itens (não há lista A, B, C).',
          'D: não é conclusão desconectada — retoma «glóbulos brancos».',
          'C: introduz explicação ou detalhamento sobre «glóbulos brancos».',
          'Teste: o que vem depois dos dois-pontos? Explica ou lista?',
          'Gabarito C (4 alternativas A–D).',
        ],
        footer_rule: 'C = explicação de termo anterior.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOIS-PONTOS',
        rows: [
          { label: 'Explicação', value: '«termo: esclarecimento sobre o termo»' },
          { label: 'Enumeração', value: '«Há três etapas: A, B e C»' },
          { label: 'Neste trecho', value: 'glóbulos brancos: responsáveis por combater…' },
        ],
        footer_rule: 'Pergunta-teste: explica, enumera ou cita?',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir explicação com enumeração',
        items: [
          { label: 'A — ênfase', detail: 'Dois-pontos não são vírgula enfática.', correct: 'Função explicativa, não ênfase isolada.' },
          { label: 'B — enumeração', detail: 'Só um elemento explicativo após «:».', correct: 'Não há lista — oração explicativa única.' },
          { label: 'D — conclusão', detail: 'O trecho retoma o termo imediatamente anterior.', correct: 'Explica «glóbulos brancos» — relação direta.' },
          { label: 'Em outra banca…', detail: 'Podem usar «vitamina C: nutriente essencial».', correct: 'Mesmo teste: explica o termo ou lista itens?' },
        ],
        footer_rule: 'C passa: explicação de glóbulos brancos.',
      },
    ],
  },

  'consulplan-indaiatuba-pontuacao-adjunto-3694433': {
    family: 'text_fragment',
    anchor_style: 'eliminacao',
    source_tec_id: '3694433',
    source_note: 'Adjunto adverbial inicial + predicado — CONSULPLAN AOE Pref Indaiatuba 2025 tec 3694433',
    meta: {
      banca: 'CONSULPLAN',
      prova: 'AOE (Pref Indaiatuba)',
      orgao: 'Pref. Indaiatuba',
      ano: '2025',
    },
    instruction:
      'Leia o texto para responder à questão abaixo.\n\n' +
      'Sobre a presença da vírgula no excerto «Com rotinas agitadas e a facilidade de acesso diário a uma infinidade de conteúdos das redes sociais e do streaming, ' +
      'é comum sentir a mente sobrecarregada», assinale a afirmativa correta.',
    text_fragment: MEMORIA_FRAGMENT,
    options: [
      { id: 'A', text: 'Está correta, porque marca a elipse do sujeito.', is_correct: false },
      { id: 'B', text: 'Está incorreta, pois não se separa por vírgula adjunto adverbial e predicado.', is_correct: false },
      {
        id: 'C',
        text: 'É necessária para separar o adjunto adverbial inicial do predicado, garantindo a clareza da informação.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'É opcional, pois a oração principal poderia vir antes do adjunto adverbial sem comprometer a compreensão.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adjunto adverbial inicial',
        chip_label: 'Anteposto → vírgula',
        meta: slideMeta,
        items: [
          { label: 'Período', detail: '«Com rotinas agitadas… streaming, é comum sentir a mente sobrecarregada»', icon: 'FileText' },
          { label: 'Adjunto', detail: '«Com rotinas agitadas… streaming» — circunstancial inicial.', icon: 'ArrowRight' },
          { label: 'C — gabarito', detail: 'Vírgula separa adjunto do predicado «é comum sentir».', icon: 'Check' },
          { label: 'Necessária', detail: 'Anteposto longo → vírgula para clareza (FUNAG).', icon: 'AlertCircle' },
        ],
        footer_rule: 'Oração adverbial/anteposta → vírgula antes do predicado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Excerto: adjunto longo («Com rotinas agitadas… streaming») + predicado («é comum sentir a mente sobrecarregada»).',
          'A: não marca elipse de sujeito — sujeito impessoal «é comum».',
          'B: afirma incorreção — norma exige vírgula após adjunto anteposto.',
          'D: vírgula não é opcional quando adjunto inicial é extenso.',
          'C: vírgula necessária entre adjunto adverbial inicial e predicado.',
          'Regra FUNAG: subordinada adverbial ou adjunto anteposto → vírgula depois.',
          'Gabarito C (4 alternativas A–D).',
        ],
        footer_rule: 'C = adjunto inicial separado do predicado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO INICIAL',
        rows: [
          { label: 'Regra', value: 'Adjunto/oração adverbial anteposta → vírgula depois' },
          { label: 'Exemplo', value: '«Com rotinas agitadas… streaming, é comum sentir a mente sobrecarregada»' },
          { label: '≠ elipse', value: 'Sujeito impessoal «é comum» — não elipse' },
        ],
        footer_rule: 'Anteposto extenso → vírgula necessária.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Achar vírgula opcional ou errada',
        items: [
          { label: 'A — elipse', detail: 'Confunde sujeito impessoal com elipse.', correct: '«é comum sentir» — construção impessoal, não elipse de sujeito.' },
          { label: 'B — incorreta', detail: 'Norma exige separar adjunto do predicado.', correct: 'Vírgula correta e necessária — B nega a regra.' },
          { label: 'D — opcional', detail: 'Adjunto longo exige marcação.', correct: 'Anteposto extenso → vírgula necessária para clareza.' },
          { label: 'Em outra banca…', detail: 'Podem encurtar o adjunto inicial.', correct: 'Mesmo teste: adjunto anteposto → vírgula depois?' },
        ],
        footer_rule: 'C passa: adjunto separado do predicado.',
      },
    ],
  },

  'consulplan-indaiatuba-pontuacao-aposto-3694727': {
    family: 'conceito',
    anchor_style: 'eliminacao',
    source_tec_id: '3694727',
    source_note: 'Aposto Bentinho / Machado — CONSULPLAN ASA Pref Indaiatuba 2025 tec 3694727',
    meta: {
      banca: 'CONSULPLAN',
      prova: 'ASA (Pref Indaiatuba)',
      orgao: 'Pref. Indaiatuba',
      ano: '2025',
    },
    instruction:
      'No fragmento «O Bentinho, do Machado de Assis, aquele que desconfiava da Capitu, não sofreu tanto», ' +
      'as vírgulas foram empregadas para:',
    options: [
      { id: 'A', text: 'Separar o aposto.', is_correct: true },
      { id: 'B', text: 'Evitar ambiguidade.', is_correct: false },
      { id: 'C', text: 'Destacar o vocativo.', is_correct: false },
      { id: 'D', text: 'Indicar a elipse de um verbo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aposto explicativo',
        chip_label: 'Aposto × vocativo',
        meta: slideMeta,
        items: [
          { label: 'Bentinho', detail: 'Termo antecedente — referência literária.', icon: 'User' },
          { label: 'Apostos', detail: '«do Machado de Assis» · «aquele que desconfiava da Capitu».', icon: 'BookOpen' },
          { label: 'A — gabarito', detail: 'Vírgulas separam apostos explicativos.', icon: 'Check' },
          { label: '≠ vocativo', detail: 'Não há chamamento — Bentinho é personagem citado.', icon: 'XCircle' },
        ],
        footer_rule: 'Aposto explica o nome → vírgulas de isolamento.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fragmento Scliar: rádio compara ciúmes ao Bentinho de Dom Casmurro.',
          '«O Bentinho, do Machado de Assis, aquele que desconfiava da Capitu, não sofreu tanto.»',
          '«do Machado de Assis» explica de onde vem Bentinho — aposto.',
          '«aquele que desconfiava da Capitu» também explica Bentinho — aposto.',
          'B: ambiguidade não é a função principal nomeada pela banca.',
          'C: não há vocativo — Bentinho não é interlocutor chamado.',
          'D: não há elipse de verbo marcada pelas vírgulas.',
          'A: vírgulas separam apostos explicativos.',
          'Gabarito A.',
        ],
        footer_rule: 'A = aposto explicativo isolado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TESTE APOSTO × VOCATIVO',
        rows: [
          { label: 'Aposto', value: 'Explica o nome: «Bentinho, do Machado…»' },
          { label: 'Vocativo', value: 'Chama alguém: «Rita, venha»' },
          { label: 'Nesta frase', value: 'Dois apostos explicam «Bentinho»' },
        ],
        footer_rule: 'Aposto explica; vocativo chama.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Marcar vocativo ou elipse',
        items: [
          { label: 'B — ambiguidade', detail: 'Função genérica demais para a prova.', correct: 'Banca pede nome da função: aposto explicativo.' },
          { label: 'C — vocativo', detail: 'Bentinho é personagem citado, não chamado.', correct: 'Sem interlocução — não é vocativo.' },
          { label: 'D — elipse', detail: 'Vírgulas não marcam elipse verbal aqui.', correct: 'Função é isolamento de aposto, não elipse.' },
          { label: 'Em outra banca…', detail: 'Podem citar «Capitu, a esposa de Bentinho».', correct: 'Mesmo teste: aposto explica ou vocativo chama?' },
        ],
        footer_rule: 'A passa: apostos de Bentinho.',
      },
    ],
  },

  'cebraspe-boa-vista-pontuacao-antes-3705140': {
    family: 'text_fragment',
    anchor_style: 'eliminacao',
    source_tec_id: '3705140',
    source_note: 'Isolar «antes» entre vírgulas — CEBRASPE Ass Tec Sau Pref Boa Vista 2025 tec 3705140',
    meta: {
      banca: 'CEBRASPE',
      prova: 'Ass Tec Sau (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto CG2A1 de Luís Fernando Verissimo.\n\n' +
      'No que se refere à pontuação, é correto afirmar que a correção gramatical e os sentidos do primeiro parágrafo do texto CG2A1 seriam mantidos caso',
    text_fragment: VERISSIMO_FRAGMENT,
    options: [
      { id: 'A', text: 'o vocábulo «pré-homem» (segundo período) fosse sucedido por vírgula.', is_correct: false },
      {
        id: 'B',
        text: 'o vocábulo «antes» (quarto período) fosse isolado entre vírgulas.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'as vírgulas que isolam a oração «antes de inventar a roda» (último período) fossem suprimidas.',
        is_correct: false,
      },
      { id: 'D', text: 'o vocábulo «disso» (segundo período) fosse sucedido por vírgula.', is_correct: false },
      { id: 'E', text: 'o vocábulo «primordial» (quinto período) fosse sucedido por vírgula.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Advérbio intercalado',
        chip_label: 'Isolar «antes»',
        meta: slideMeta,
        items: [
          { label: '4º período', detail: '«tivemos que passar antes pelo risco…» — escrita e memória (Verissimo).', icon: 'FileText' },
          { label: 'B — gabarito', detail: '«passar, antes, pelo risco» — advérbio de tempo intercalado.', icon: 'Check' },
          { label: 'Termo deslocado', detail: 'Advérbio no meio da oração → vírgulas dos dois lados.', icon: 'ArrowLeftRight' },
          { label: 'CEBRASPE', detail: 'Mantém sentido e correção — única alteração válida.', icon: 'Shield' },
        ],
        footer_rule: 'Advérbio intercalado → isolamento por vírgulas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Verissimo «Memória e anotações»: escrita nasceu da necessidade de não esquecer.',
          'Comando: alteração de pontuação que mantém correção e sentido.',
          'A: «pré-homem,» após sujeito — cortaria sujeito|verbo. Incorreto.',
          'C: suprimir vírgulas de «antes de inventar a roda» — oração intercalada perde clareza.',
          'D: «disso,» após pronome — separação indevida do complemento.',
          'E: «primordial,» — adjunto mal isolado do núcleo.',
          'B: «passar, antes, pelo risco» — advérbio de tempo deslocado, intercalado.',
          'Isolar «antes» entre vírgulas mantém sentido e melhora clareza.',
          'Gabarito B.',
        ],
        footer_rule: 'B = «antes» intercalado entre vírgulas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TERMO DESLOCADO',
        rows: [
          { label: 'Regra', value: 'Advérbio/oração intercalada → vírgulas dos dois lados' },
          { label: 'Correto', value: '«passar, antes, pelo risco com vara»' },
          { label: 'Evitar', value: 'sujeito|verbo · suprimir vírgulas de inciso' },
        ],
        footer_rule: 'Intercalado = vírgula antes e depois.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Alteração que quebra o parágrafo',
        items: [
          { label: 'A — pré-homem,', detail: 'Vírgula após sujeito composto.', correct: 'Sujeito|verbo: «pré-homem que pensou» — sem vírgula.' },
          { label: 'C — inventar a roda', detail: 'Oração intercalada perde isolamento.', correct: 'Vírgulas do inciso «antes de inventar a roda» são necessárias.' },
          { label: 'D — disso,', detail: 'Separa pronome do complemento.', correct: '«lembrar disso» — sem vírgula após «disso».' },
          { label: 'E — primordial,', detail: 'Corta adjunto do núcleo.', correct: '«angústia primordial foi» — sem vírgula após adjunto.' },
          { label: 'Em outra banca…', detail: 'Podem pedir alteração em outro período.', correct: 'Mesmo teste: intercalado ou trilho cortado?' },
        ],
        footer_rule: 'B passa: «antes» bem isolado.',
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
