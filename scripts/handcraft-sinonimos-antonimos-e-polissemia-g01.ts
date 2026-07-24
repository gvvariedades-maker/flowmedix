#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g01 (8 slugs · Sinônimos/polissemia · lote 1).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g01.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g01 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g01 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g01';
const SUBTOPICO = 'Sinônimos, antônimos e polissemia';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_sinonimos_polissemia';
const REVIEWED = '2026-07-23';
const GOLDEN_REFERENCE = 'examples/questao-premium-apice-portugues-sinonimos-polissemia-refletiu.json';

const SINONIMOS_SOURCE = {
  id: 'pt-sinonimos-polissemia-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Sinônimos, antônimos e polissemia',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'sinonímia',
    'polissemia',
    'parônimos',
    'antonímia',
    'pergunta-teste',
    'contexto',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'text_fragment';

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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g01',
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
  'vunesp-ag-ad-sinonimos-leia-o-texto-a-seguir-para-responder-3789292': {
    family: 'text_fragment',
    source_tec_id: '3789292',
    source_note: 'subsiste/ultrapassava — VUNESP Ag Adm Pref SJRP 2026 tec 3789292',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag Adm (Pref SJRP)',
      orgao: 'Pref. São José do Rio Preto',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere os trechos a seguir:\n\n«... uma pequena população branca subsiste com dificuldade...» (2º parágrafo)\n«... o tempo gasto com a procura de alimentos não excedia a média de três horas diárias, para uma produção alimentar bastante equilibrada e que ultrapassava 2 mil calorias por pessoa...» (3º parágrafo)\n\nNo contexto em que se apresentam, os termos destacados são sinônimos de:',
    text_fragment:
      'Acreditou-se por muito tempo que, deixando-se de lado a Revolução Industrial, a produção de bens de consumo nunca aumentou de forma tão rápida e robusta quanto por obra da invenção da agricultura. […] Hoje, essa reconstrução simples e grandiosa da história humana jaz em ruínas. Pesquisas entre os povos sem agricultura demonstram que a maior parte deles leva uma vida confortável. Meios geográficos que, por ignorância de seus recursos naturais, julgávamos miseráveis reservam para aqueles que ali vivem grande quantidade de espécies vegetais muito apropriadas para a alimentação. […] Calculou-se que, entre os povos que viviam da caça e da coleta de produtos selvagens, um homem supria as necessidades de quatro ou cinco pessoas. Além disso, o tempo gasto com a procura de alimentos não excedia a média de três horas diárias, para uma produção alimentar bastante equilibrada e que ultrapassava 2 mil calorias por pessoa. (Claude Lévi-Strauss. Somos todos canibais, 2022. Adaptado)',
    options: [
      { id: 'A', text: 'resiste e alcançava.', is_correct: false },
      { id: 'B', text: 'avança e ultrapassava.', is_correct: false },
      { id: 'C', text: 'produz e chegava.', is_correct: false },
      { id: 'D', text: 'sobrevive e superava.', is_correct: true },
      { id: 'E', text: 'sofre e esclarecia.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Contexto × dicionário',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Trocar pelo sinônimo mantém o sentido da frase?', icon: 'Eye' },
          { label: 'Subsiste', detail: '2º parágrafo — população branca «subsiste com dificuldade».', icon: 'Users' },
          { label: 'Ultrapassava', detail: '3º parágrafo — produção «ultrapassava 2 mil calorias».', icon: 'TrendingUp' },
          { label: 'Lévi-Strauss', detail: 'Agricultura, reconstrução, pesquisas — povos sem agricultura.', icon: 'BookOpen' },
          { label: 'Produtividade', detail: 'Caça e coleta — calorias e tempo de trabalho no 3º parágrafo.', icon: 'TrendingUp' },
          { label: 'Dois pares', detail: 'A banca cobra dois sinônimos na mesma letra.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Sinônimo de dicionário que não cabe no contexto.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Prove na oração — não só na lista de sinônimos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trecho → par → letras',
        meta: slideMeta,
        steps: [
          'Texto Lévi-Strauss: Revolução Industrial, produção de consumo, invenção da agricultura.',
          'Reconstrução da história humana «jaz em ruínas» — povos sem agricultura.',
          'Pesquisas sobre tempo de trabalho, produtividade e valor nutricional.',
          '1º destaque: «subsiste com dificuldade» — permanece vivo com esforço, mal se mantém.',
          '2º destaque: «ultrapassava 2 mil calorias» — ia além, excedia o limite.',
          'A «resiste e alcançava»: resistir ≠ subsistir com dificuldade; alcançar ≠ ultrapassar — eliminar.',
          'B «avança e ultrapassava»: avançar não substitui subsistir; repete ultrapassava no 2º par — eliminar.',
          'C «produz e chegava»: produzir não encaixa em «subsiste»; chegava é fraco para exceder — eliminar.',
          'E «sofre e esclarecia»: sofrer distorce subsistir; esclarecia não tem relação com ultrapassar — eliminar.',
          'D «sobrevive e superava»: subsiste ≈ sobrevive; ultrapassava ≈ superava — par correto.',
          'Gabarito D. Em similares: teste cada par no trecho antes de cruzar letras.',
        ],
        footer_rule: 'Dois destaques = dois sinônimos na mesma alternativa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'CONTEXTO ANTES DO DICIONÁRIO',
        rows: [
          { label: 'Sinônimo', value: 'Sentido próximo na frase — contexto decide.' },
          { label: 'Subsiste', value: 'Mantém-se com dificuldade ≈ sobrevive.' },
          { label: 'Ultrapassava', value: 'Excedia limite ≈ superava.' },
          { label: 'Pergunta-teste', value: 'A troca mantém o sentido do autor?' },
          { label: 'Nesta questão', value: 'D — sobrevive + superava.' },
          { label: 'Lévi-Strauss', value: 'Produtividade alimentar × agricultura.' },
        ],
        footer_rule: 'Sinonímia imperfeita — nuance importa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra um dos dois pares',
        items: [
          { label: 'A — resiste/alcançava', detail: 'Resistir não cobre «subsiste com dificuldade».', correct: 'Sinônimo no contexto: «resiste» não substitui «subsiste» — ideia de permanência precária.' },
          { label: 'B — avança/ultrapassava', detail: 'Avançar não encaixa em subsistir; 2º verbo repete o original.', correct: 'Sinônimo no contexto: «avança» não mantém o sentido de «subsiste com dificuldade».' },
          { label: 'C — produz/chegava', detail: 'Produzir distorce subsistir; chegava é insuficiente para exceder.', correct: 'Sinônimo no contexto: «produz» não equivale a «subsiste» no trecho.' },
          { label: 'E — sofre/esclarecia', detail: 'Sofrer e esclarecer não dialogam com os destaques.', correct: 'Sinônimo no contexto: «sofre» altera o sentido de subsistência — não é troca válida.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A pequena loja subsiste graças aos clientes fiéis.»',
            correct: 'Sinônimo no contexto: «permanece» ou «sobrevive» — mantém o sentido de continuar a existir com esforço.',
          },
        ],
        footer_rule: 'D: sobrevive + superava nos dois trechos.',
      },
    ],
  },

  'avancasp-tec-sinonimos-leia-o-texto-a-seguir-para-responder-3835988': {
    family: 'text_fragment',
    source_tec_id: '3835988',
    source_note: 'desnorteado — AVANÇASP Tec Enf Pref Estiva Gerbi 2026 tec 3835988',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Tec Enf (Pref Estiva Gerbi)',
      orgao: 'Pref. Estiva Gerbi',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      '«Estava desnorteado e ao mesmo tempo padecia de dor e desespero.»\n\nA palavra destacada no trecho acima é sinônima de:',
    text_fragment:
      '<p>Há alguns anos eu estava num bar de praia, afastado da cidade, e fui buscar algo no carro, que se encontrava num estacionamento próximo a uma mata. Quando ainda abria a porta do carro, ouvi um ruído proveniente das folhagens e notei que era um cachorro caminhando entre os arbustos. O cão pareceu perceber a minha presença, mudou de direção e rumou ao meu encontro. […] Estava desnorteado e ao mesmo tempo padecia de dor e desespero. […] (Antonio Carlos Sarmento. Vida de cão. Adaptado)</p>',
    options: [
      { id: 'A', text: '«firme», «decidido».', is_correct: false },
      { id: 'B', text: '«valente», «corajoso».', is_correct: false },
      { id: 'C', text: '«consciente», «ciente».', is_correct: false },
      { id: 'D', text: '«confuso», «desorientado».', is_correct: true },
      { id: 'E', text: '«calmo», «tranquilo».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Olhar do animal',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Desnorteado', detail: 'Perdido, sem norte — confusão diante da dor.', icon: 'Compass' },
          { label: 'Presença', detail: 'Cão percebe presença — muda rumo no estacionamento.', icon: 'Eye' },
          { label: 'Contexto', detail: 'Cão com espinhos, dor, desespero — crônica Sarmento.', icon: 'Dog' },
          { label: 'Espinhos', detail: 'Focinho cravado — cena que gera o olhar perdido.', icon: 'AlertTriangle' },
          { label: 'Padecia', detail: 'Sofria — reforça desespero e perturbação do olhar.', icon: 'Heart' },
          { label: 'Pergunta-teste', detail: 'Qual par mantém o sentido de «desnorteado»?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por «corajoso» por causa do duelo metafórico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Estacionamento proximo à mata — prove o sinônimo no trecho.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica «Vida de cão»: bar de praia afastado da cidade — buscar algo no carro.',
          'Carro no estacionamento proximo à mata — ruido proveniente das folhagens.',
          '«Desnorteado» + «dor e desespero» — perturbação, perda de orientação.',
          'A «firme/decidido»: oposto do estado confuso — eliminar.',
          'B «valente/corajoso»: duelo metafórico não torna o cão corajoso — eliminar.',
          'C «consciente/ciente»: consciência ≠ confusão diante da dor — eliminar.',
          'E «calmo/tranquilo»: contradiz desespero do trecho — eliminar.',
          'D «confuso/desorientado»: equivalência direta de desnorteado.',
          'Gabarito D. Em similares: leia o entorno emocional antes de escolher o par.',
        ],
        footer_rule: 'Desnorteado = sem norte = desorientado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINÔNIMO NO CONTEXTO',
        rows: [
          { label: 'Desnorteado', value: 'Perdido, confuso, desorientado.' },
          { label: 'Pergunta-teste', value: 'A troca mantém dor + desespero?' },
          { label: 'Crônica', value: 'Sarmento — olhar do cão ferido.' },
          { label: 'Nesta questão', value: 'D — confuso, desorientado.' },
        ],
        footer_rule: 'Contexto emocional veta sinônimo «positivo».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares que invertem o estado',
        items: [
          { label: 'A — firme/decidido', detail: 'Postura estável — oposto de perdido.', correct: 'Antônimo no contexto: firme contradiz «desnorteado» diante da dor.' },
          { label: 'B — valente/corajoso', detail: 'Confunde duelo metafórico com bravura.', correct: 'Sinônimo no contexto: «corajoso» não substitui perturbação — cão está perdido.' },
          { label: 'C — consciente/ciente', detail: 'Consciência plena ≠ desorientação.', correct: 'Sinônimo no contexto: «consciente» não cobre confusão do olhar.' },
          { label: 'E — calmo/tranquilo', detail: 'Contradiz desespero explícito.', correct: 'Antônimo no contexto: calmo opõe-se a dor e desespero do trecho.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Saiu desnorteado do labirinto de corredores.»',
            correct: 'Sinônimo no contexto: «perdido» ou «desorientado» — sem norte para se guiar.',
          },
        ],
        footer_rule: 'D: confuso + desorientado.',
      },
    ],
  },

  'avancasp-tec-sinonimos-o-livro-e-o-risco-que-voce-corre-e-e-3835990': {
    family: 'conceito',
    source_tec_id: '3835990',
    source_note: 'faz ≈ torna — Paulo Coelho — AVANÇASP Tec Enf Pref Estiva Gerbi 2026 tec 3835990',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Tec Enf (Pref Estiva Gerbi)',
      orgao: 'Pref. Estiva Gerbi',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      '«O livro é o risco que você corre. E é o risco que faz a sua vida interessante.» (Paulo Coelho)\n\nA forma verbal destacada no pensamento acima tem o mesmo sentido que:',
    options: [
      { id: 'A', text: '«risca».', is_correct: false },
      { id: 'B', text: '«torna».', is_correct: true },
      { id: 'C', text: '«detona».', is_correct: false },
      { id: 'D', text: '«destrói».', is_correct: false },
      { id: 'E', text: '«interessa».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Faz = causa efeito',
        chip_label: 'Verbo no contexto',
        meta: slideMeta,
        items: [
          { label: 'Faz', detail: '«faz a vida interessante» — produz, torna.', icon: 'Sparkles' },
          { label: 'Risco', detail: 'Livro = risco que você corre — ideia de aposta.', icon: 'BookOpen' },
          { label: 'Pergunta-teste', detail: 'Qual verbo substitui «faz» sem mudar o sentido?', icon: 'Eye' },
          { label: 'Paulo Coelho', detail: 'Citação sobre leitura e vida interessante.', icon: 'Quote' },
          { label: 'Pegadinha', detail: 'Confundir «faz» com «interessa» (efeito próximo).', icon: 'AlertTriangle' },
        ],
        footer_rule: '«Faz interessante» = verbo de transformação.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Citação: livro = risco; risco «faz» a vida interessante.',
          'Estrutura: sujeito (risco) + faz + complemento (vida interessante).',
          'A «risca»: verbo traçar linha — sentido distinto — eliminar.',
          'B «torna»: «torna a vida interessante» — equivalência direta — manter.',
          'C «detona» e D «destrói»: sentido negativo/destruição — eliminar.',
          'E «interessa»: verbo diferente — o risco não «interessa», ele «faz» interessante — eliminar.',
          'Gabarito B.',
          'Em similares: «faz + adjetivo» costuma admitir «torna» ou «deixa».',
        ],
        footer_rule: 'Faz interessante = torna interessante.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FAZ × TORNA',
        rows: [
          { label: 'Faz', value: 'Verbo de realização/transformação.' },
          { label: 'Torna', value: 'Sinônimo funcional: «torna X Y».' },
          { label: 'Pergunta-teste', value: 'Substitui sem mudar relação sujeito–predicativo?' },
          { label: 'Nesta questão', value: 'B — «torna».' },
        ],
        footer_rule: 'Não confunda «faz» com «interessa».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Verbos que mudam o sentido',
        items: [
          { label: 'A — risca', detail: 'Traçar risco/grito — outro campo lexical.', correct: 'Sinônimo no contexto: «risca» não substitui «faz» em «faz interessante».' },
          { label: 'C — detona', detail: 'Explosão — sentido agressivo.', correct: 'Antônimo no contexto: «detona» destrói — oposto de tornar interessante.' },
          { label: 'D — destrói', detail: 'Polaridade negativa.', correct: 'Antônimo no contexto: destruir ≠ tornar a vida interessante.' },
          { label: 'E — interessa', detail: 'Verbo de atração, não de transformação.', correct: 'Sinônimo no contexto: «interessa» não encaixa — estrutura exige verbo causativo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A viagem fez a experiência inesquecível.»',
            correct: 'Sinônimo no contexto: «tornou» — verbo de transformação, como «faz» na citação.',
          },
        ],
        footer_rule: 'B: torna = faz (causativo).',
      },
    ],
  },

  'cpcon-uepb-a-sinonimos-leia-o-texto-i-para-responder-a-ques-3836462': {
    family: 'text_fragment',
    source_tec_id: '3836462',
    source_note: 'isoladas/solitárias sinonímia — CPCON UEPB ACS Pref Condado 2026 tec 3836462',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Condado (PB))',
      orgao: 'Pref. Condado (PB)',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I para responder à questão.\n\nAssinale a alternativa correta acerca das relações entre palavras presentes no texto:',
    text_fragment:
      'Texto I — A sociedade do cansaço é cada vez mais realidade. Como se blindar? (Wanessa Ferrari, 2021 — adaptado)\n\n«Já amanheci cansada.» O meme resume a exaustão adulta. De acordo com Byung-Chul Han, vivemos na sociedade do cansaço, que naturalizou a cobrança excessiva por produtividade, alta performance e resultados — tudo isso sob o pano da positividade. Com tanta pressão, saúde física e mental pedem a conta. […] As pessoas vivem cercadas por outras, mas estão isoladas dentro de si. […]',
    figure_policy: 'transcribed',
    options: [
      {
        id: 'A',
        text: 'As palavras cansaço e exaustão são homônimas perfeitas, pois apresentam a mesma forma e o mesmo som, com sentidos diferentes.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Em «a vida moderna naturalizou a cobrança excessiva por produtividade e positividade», as palavras produtividade e positividade são parônimas, pois se assemelham na forma escrita e apresentam significados semelhantes.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Em «o filósofo defende que a sociedade atual valoriza o desempenho, a alta performance, o resultado, a máxima produtividade», as palavras desempenho e resultado são parônimas, pois derivam de radicais diferentes, mas compartilham a mesma origem etimológica.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Em «As pessoas vivem cercadas por outras, mas estão isoladas dentro de si», as palavras isoladas e solitárias estabelecem uma relação de sinonímia, já que possuem sentidos semelhantes neste contexto.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'As palavras positividade e otimismo são antônimas, pois expressam ideias contrárias.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Relações lexicais',
        chip_label: 'Classificar',
        meta: slideMeta,
        items: [
          { label: 'Sinônimo', detail: 'Sentido próximo no contexto — isoladas × solitárias.', icon: 'Equal' },
          { label: 'Homônimo', detail: 'Mesma forma, origens distintas — não é cansaço/exaustão.', icon: 'Copy' },
          { label: 'Parônimo', detail: 'Forma parecida, sentido diferente — não é o caso de D.', icon: 'Type' },
          { label: 'Antônimo', detail: 'Oposição — positividade ≠ antônimo de otimismo aqui.', icon: 'ArrowLeftRight' },
          { label: 'Han / cansaço', detail: 'Wanessa Ferrari — sociedade do cansaço, produtividade, positividade.', icon: 'Brain' },
          { label: 'Isoladas', detail: '«Cercadas por outras, mas isoladas dentro de si».', icon: 'Users' },
          { label: 'Solitárias', detail: 'Sinônimo contextual de isoladas — gabarito D.', icon: 'User' },
          { label: 'Pegadinha', detail: 'Confundir sinônimo com parônimo ou homônimo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Nomeie a relação antes de julgar a afirmativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto I: sociedade do cansaço, Han, produtividade, isolamento interior.',
          'A: cansaço e exaustão — mesma forma? Não — são sinônimos, não homônimos — FALSA.',
          'B: produtividade e positividade — parônimos? Formas distintas; significados não são «parecidos na forma» — FALSA.',
          'C: desempenho e resultado — parônimos? Não se assemelham ortograficamente — FALSA.',
          'D: isoladas e solitárias — sozinhas no íntimo, apesar da multidão — sinonímia contextual — VERDADEIRA.',
          'E: positividade e otimismo — antônimas? São próximas, não opostas — FALSA.',
          'Gabarito D — única afirmativa correta.',
          'Em similares: teste cada relação (sinônimo, parônimo, homônimo, antônimo) isoladamente.',
        ],
        footer_rule: 'Só D fecha sinonímia válida.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RELAÇÕES LEXICAIS',
        rows: [
          { label: 'Sinônimo', value: 'Sentido próximo — isoladas ≈ solitárias.' },
          { label: 'Homônimo', value: 'Mesma forma, sentidos diferentes — manga (fruta/camisa).' },
          { label: 'Parônimo', value: 'Forma parecida — descrição × discrição.' },
          { label: 'Antônimo', value: 'Oposição — quente/frio.' },
          { label: 'Nesta questão', value: 'D — isoladas e solitárias (sinônimos).' },
        ],
        footer_rule: 'Cansaço/exaustão = sinônimos, não homônimos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classificação errada em cada letra',
        items: [
          { label: 'A — homônimas', detail: 'Cansaço e exaustão têm formas diferentes.', correct: 'Sinônimo no contexto: são equivalentes — relação é sinonímia, não homonímia.' },
          { label: 'B — parônimas', detail: 'Produtividade e positividade não são formas parecidas.', correct: 'Parônimo: exige semelhança ortográfica — palavras distintas aqui.' },
          { label: 'C — parônimas', detail: 'Desempenho e resultado não se parecem na escrita.', correct: 'Parônimo: descrição × discrição — não desempenho × resultado.' },
          { label: 'E — antônimas', detail: 'Positividade e otimismo caminham juntas no texto.', correct: 'Antônimo: exige oposição — otimismo não é contrário de positividade.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Descrição» e «discrição» no mesmo parágrafo.',
            correct: 'Parônimo: formas parecidas, sentidos diferentes — não sinônimos.',
          },
        ],
        footer_rule: 'D: isoladas ≈ solitárias no contexto.',
      },
    ],
  },

  'avancasp-acs-sinonimos-leia-o-texto-a-seguir-para-responder-3839361': {
    family: 'text_fragment',
    source_tec_id: '3839361',
    source_note: 'monótonas/incessantes — AVANÇASP ACS Pref Potim 2026 tec 3839361',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«O mar é paciente, suas ondas vão e vêm, vêm e vão, monótonas, incessantes»\n\nAs palavras destacadas no trecho acima são sinônimas de:',
    text_fragment:
      '<p>O mar é paciente, suas ondas vão e vêm, vêm e vão, monótonas, incessantes, em ritmos diferentes, por horas, dias, anos, quase que eternamente, batendo no mesmo lugar, na mesma praia, na mesma pedra […] Forte, fraco, o movimento das ondas segue incansável, sem sono, sem pressa […] (Antonio Penteado Mendonça. Água mole em pedra dura. Adaptado)</p>',
    options: [
      { id: 'A', text: '«uniformes», «invariáveis».', is_correct: true },
      { id: 'B', text: '«dinâmicas», «atrativas».', is_correct: false },
      { id: 'C', text: '«fortes», «intolerantes».', is_correct: false },
      { id: 'D', text: '«intranquilas», «extravagantes».', is_correct: false },
      { id: 'E', text: '«barulhentas», «ensurdecedoras».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ondas repetidas',
        chip_label: 'Campo semântico',
        meta: slideMeta,
        items: [
          { label: 'Monótonas', detail: 'Sem variação — mesmo ritmo de vai e vem.', icon: 'Repeat' },
          { label: 'Incessantes', detail: 'Sem parar — horas, dias, anos.', icon: 'Clock' },
          { label: 'Mar paciente', detail: 'Crônica Mendonça — erosão lenta da pedra.', icon: 'Waves' },
          { label: 'Pergunta-teste', detail: 'Qual par cobre repetição + continuidade?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por «barulhentas» por imagem sonora.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Repetição sem mudança = uniforme.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica: ondas «vão e vêm» — ritmo repetido, quase eterno.',
          'Monótonas: falta de variedade — sempre igual.',
          'Incessantes: não cessam — continuidade no tempo.',
          'A «uniformes/invariáveis»: mesma ideia de repetição sem mudança — manter.',
          'B «dinâmicas/atrativas»: oposto de monotonia — eliminar.',
          'C «fortes/intolerantes»: força ou rigidez — não cobre repetição — eliminar.',
          'D «intranquilas/extravagantes»: agitação exagerada — eliminar.',
          'E «barulhentas/ensurdecedoras»: som, não regularidade — eliminar.',
          'Gabarito A. Em similares: dois adjetivos pedem par que cubra os dois sentidos.',
        ],
        footer_rule: 'Uniformes + invariáveis = monótonas + incessantes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REPETIÇÃO NO TEXTO',
        rows: [
          { label: 'Monótonas', value: 'Sem variedade — uniformes.' },
          { label: 'Incessantes', value: 'Contínuas — invariáveis no tempo.' },
          { label: 'Pergunta-teste', value: 'Par cobre os dois destaques?' },
          { label: 'Nesta questão', value: 'A — uniformes, invariáveis.' },
        ],
        footer_rule: 'Vai e vem eterno = sem mudança.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares que mudam o eixo',
        items: [
          { label: 'B — dinâmicas/atrativas', detail: 'Sugere variedade e charme.', correct: 'Antônimo no contexto: dinâmico opõe-se a monótono — ondas repetem-se.' },
          { label: 'C — fortes/intolerantes', detail: 'Força física ou rigidez moral.', correct: 'Sinônimo no contexto: «fortes» não substitui «monótonas» no trecho.' },
          { label: 'D — intranquilas/extravagantes', detail: 'Agitação e exagero.', correct: 'Antônimo no contexto: mar «paciente» — ondas regulares, não intranquilas.' },
          { label: 'E — barulhentas/ensurdecedoras', detail: 'Foco no ruído, não na repetição.', correct: 'Sinônimo no contexto: barulho não equivale a monotonia visual/temporal.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O relógio ticava monótono a noite inteira.»',
            correct: 'Sinônimo no contexto: «uniforme» ou «incessante» — repetição sem variação.',
          },
        ],
        footer_rule: 'A: uniformes + invariáveis.',
      },
    ],
  },

  'avancasp-aae-sinonimos-leia-o-texto-a-seguir-para-responder-3839707': {
    family: 'text_fragment',
    source_tec_id: '3839707',
    source_note: 'vetado ≈ proibido — Lima Barreto Risadinha — AVANÇASP AAE Pref Potim 2026 tec 3839707',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AAE (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Um dos seus prazeres, sendo-lhe vetado por lei castigar-nos com o bastão, era desfiar em cima do culpado uma série de insultos preciosos...»\n\nA palavra destacada no trecho acima é sinônima de:',
    text_fragment:
      '<p>Seria melhor dizer que ele não teve infância. […] Nestor, em suma, teve a meninice normal […] Certa feita, na aula de francês […] Um dos seus prazeres, sendo-lhe vetado por lei castigar-nos com o bastão, era desfiar em cima do culpado uma série de insultos preciosos, que ele ia escandindo um por um, sem pressa e com ódio. (Adaptado de Lima Barreto)</p>',
    options: [
      { id: 'A', text: 'Sancionado', is_correct: false },
      { id: 'B', text: 'Permitido', is_correct: false },
      { id: 'C', text: 'Vendado', is_correct: false },
      { id: 'D', text: 'Ventanejado', is_correct: false },
      { id: 'E', text: 'Proibido', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vetado por lei',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Vetado', detail: 'Proibido, barrado — lei impede o bastão.', icon: 'Ban' },
          { label: 'Professor', detail: 'Demóstenes — insultos no lugar da punição física.', icon: 'GraduationCap' },
          { label: 'Risadinha', detail: 'Nestor — crônica de infância (Lima Barreto).', icon: 'Smile' },
          { label: 'Pergunta-teste', detail: 'Qual palavra substitui «vetado» na frase?', icon: 'Eye' },
          { label: 'Pegadinha', detail: '«Sancionado» parece lei, mas sentido é oposto.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Veto = proibição legal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: professor não pode castigar com bastão — lei veta.',
          '«Vetado por lei» — impedido de usar o bastão.',
          'A «Sancionado»: autorizado/punido — sentido oposto ou distinto — eliminar.',
          'B «Permitido»: contradiz «vetado» diretamente — eliminar.',
          'C «Vendado» e D «Ventanejado»: sem relação semântica — eliminar.',
          'E «Proibido»: equivalência direta de vetado.',
          'Gabarito E.',
          'Em similares: «vetar projeto» = proibir — mesmo campo jurídico.',
        ],
        footer_rule: 'Vetado = proibido por norma.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VETAR × PROIBIR',
        rows: [
          { label: 'Vetado', value: 'Proibido, impedido — lei ou autoridade.' },
          { label: 'Permitido', value: 'Antônimo direto de vetado.' },
          { label: 'Sancionado', value: 'Punido ou autorizado — não substitui vetado.' },
          { label: 'Nesta questão', value: 'E — Proibido.' },
        ],
        footer_rule: 'Não confunda sancionado com proibido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Palavras da mesma esfera ou ruído',
        items: [
          { label: 'A — Sancionado', detail: 'Parece «lei», mas sentido é punir/autorizar.', correct: 'Sinônimo no contexto: «sancionado» não substitui «vetado» — ideias distintas.' },
          { label: 'B — Permitido', detail: 'Oposto claro de vetado.', correct: 'Antônimo no contexto: permitido é o contrário de proibido por lei.' },
          { label: 'C — Vendado', detail: 'Olhos cobertos — homonímia visual.', correct: 'Sinônimo no contexto: «vendado» não tem relação com proibição legal.' },
          { label: 'D — Ventanejado', detail: 'Exposto ao vento — distrator fonético.', correct: 'Sinônimo no contexto: «ventanejado» é ruído — não substitui «vetado».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O prefeito vetou o projeto de lei.»',
            correct: 'Sinônimo no contexto: «proibiu» ou «barrou» — veto = impedimento oficial.',
          },
        ],
        footer_rule: 'E: proibido por lei.',
      },
    ],
  },

  'avancasp-acr-sinonimos-leia-o-texto-a-seguir-para-responder-3839851': {
    family: 'text_fragment',
    source_tec_id: '3839851',
    source_note: 'imperiosa ≈ irresistível — Flor-de-maio — AVANÇASP ACre Pref Potim 2026 tec 3839851',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Potim)',
      orgao: 'Pref. Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Qualquer uma destas tardes é possível que me dê vontade real, imperiosa, de ir ao Jardim Botânico»\n\nA palavra destacada no trecho acima é sinônima de:',
    text_fragment:
      '<p>Entre tantas notícias do jornal — o crime do Sacopã, a angústia dos Barnabés — há uma pequenina nota de três linhas […] É assinada pelo senhor diretor do Jardim Botânico […] Meu primeiro movimento […] era deixar a mesa da redação e me dirigir ao Jardim Botânico […] Qualquer uma destas tardes é possível que me dê vontade real, imperiosa, de ir ao Jardim Botânico, mas então será tarde […] (Crônica Flor-de-maio. Adaptado)</p>',
    options: [
      { id: 'A', text: 'Implícita', is_correct: false },
      { id: 'B', text: 'Inativa', is_correct: false },
      { id: 'C', text: 'Irresistível', is_correct: true },
      { id: 'D', text: 'Imperfeita', is_correct: false },
      { id: 'E', text: 'Desconhecida', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vontade imperiosa',
        chip_label: 'Intensidade',
        meta: slideMeta,
        items: [
          { label: 'Imperiosa', detail: 'Vontade forte, que impõe — difícil de ignorar.', icon: 'Zap' },
          { label: 'Angustia', detail: 'Noticias do jornal — crime do Sacopa, angustia dos Barnabes.', icon: 'AlertTriangle' },
          { label: 'Diretor', detail: 'Nota do senhor diretor do Jardim Botanico — flor-de-maio.', icon: 'Newspaper' },
          { label: 'Redação', detail: 'Mesa da redação — pressa vs impulso de visitar o horto.', icon: 'PenLine' },
          { label: 'Flor-de-maio', detail: 'Crônica — Jardim Botânico, pressa do jornalista.', icon: 'Flower' },
          { label: 'Jardim Botânico', detail: 'Destino do impulso imperiosa — notícia do horto.', icon: 'MapPin' },
          { label: 'Vontade real', detail: 'Desejo sincero, não só impulso passageiro.', icon: 'Heart' },
          { label: 'Pergunta-teste', detail: 'Qual adjetivo mantém a força do desejo?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Confundir com «implícita» (escondida).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Noticias do jornal — impulso imperiosa ao Jardim Botanico.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica Flor-de-maio: noticias do jornal — angustia dos Barnabes, senhor diretor.',
          'Mesa da redacao — nota sobre flor-de-maio em gloriosa floracao.',
          '«Vontade real, imperiosa» — desejo intenso, quase obrigatório.',
          'A «Implícita»: escondida — oposto de «real» explícita — eliminar.',
          'B «Inativa»: sem ação — contradiz impulso de ir — eliminar.',
          'C «Irresistível»: não se resiste — alinha com imperiosa — manter.',
          'D «Imperfeita»: qualidade negativa — não é o foco — eliminar.',
          'E «Desconhecida»: estranheza — eliminar.',
          'Gabarito C. Em similares: imperioso costuma equivaler a irresistível/urgente.',
        ],
        footer_rule: 'Imperiosa ≈ irresistível no desejo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMPERIOSA',
        rows: [
          { label: 'Imperiosa', value: 'Que impõe, urgente, irresistível.' },
          { label: 'Vontade real', value: 'Desejo genuíno — não fantasia.' },
          { label: 'Pergunta-teste', value: 'Intensidade ou ocultação?' },
          { label: 'Nesta questão', value: 'C — Irresistível.' },
        ],
        footer_rule: 'Implícita ≠ imperiosa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Adjetivos que mudam o eixo',
        items: [
          { label: 'A — Implícita', detail: 'Escondida, subentendida.', correct: 'Antônimo no contexto: implícita é oculta — vontade no trecho é «real», explícita.' },
          { label: 'B — Inativa', detail: 'Parada, sem movimento.', correct: 'Antônimo no contexto: inativa contradiz impulso de ir ao Jardim.' },
          { label: 'D — Imperfeita', detail: 'Defeituosa — outro campo semântico.', correct: 'Sinônimo no contexto: «imperfeita» não substitui força de «imperiosa».' },
          { label: 'E — Desconhecida', detail: 'Estranha, não familiar.', correct: 'Sinônimo no contexto: «desconhecida» não cobre urgência do desejo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Sentiu uma fome imperiosa ao chegar em casa.»',
            correct: 'Sinônimo no contexto: «irresistível» ou «urgente» — vontade que impõe-se.',
          },
        ],
        footer_rule: 'C: irresistível = imperiosa.',
      },
    ],
  },

  'instituto-ao-sinonimos-leia-o-texto-a-seguir-para-responder-3840872': {
    family: 'text_fragment',
    source_tec_id: '3840872',
    source_note: 'refletidos ≈ manifestados — Instituto AOCP Ass UNIRIO 2026 tec 3840872',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que a palavra entre parênteses pode substituir, sem prejuízo de sentido, o termo destacado no trecho citado.',
    text_fragment:
      '<p>Bons motivos para não se levar tão a sério e fazer sua criança interior aflorar. […] Segundo o psiquiatra Stuart Brown, os altos índices de melancolia de hoje — refletidos no aumento de transtornos como depressão e ansiedade — estão ligados à supressão do instinto natural de brincar. […] (Adaptado)</p>',
    options: [
      {
        id: 'A',
        text: '«[...] os altos índices de melancolia de hoje — refletidos no aumento de transtornos como depressão e ansiedade [...]» (manifestados).',
        is_correct: true,
      },
      {
        id: 'B',
        text: '«Na infância, a gente se sente livre para explorar esse lado lúdico sem medo do julgamento.» (infantil).',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«[...] e, por isso, têm ganhado espaço em um mercado cada vez mais guiado pela nostalgia.» (alegria).',
        is_correct: false,
      },
      {
        id: 'D',
        text: '«[...] os altos índices de melancolia de hoje — refletidos no aumento de transtornos como depressão e ansiedade [...]» (preguiçosa).',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«O déficit de brincadeiras entre adultos está se tornando uma crise de saúde pública [...]» (excesso).',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Refletidos no texto',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Refletidos', detail: 'Aparecem, manifestam-se nos transtornos.', icon: 'Scan' },
          { label: 'Melancolia', detail: 'Stuart Brown — brincar × depressão/ansiedade.', icon: 'Brain' },
          { label: 'Kidults', detail: 'Texto sobre brincar na vida adulta.', icon: 'Gamepad2' },
          { label: 'Parênteses', detail: 'Substituto deve caber no trecho citado.', icon: 'Quote' },
          { label: 'Pegadinha', detail: 'Trocar por antônimo (preguiçosa, excesso).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Prove a troca na oração citada.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: brincar, melancolia, Stuart Brown, transtornos mentais.',
          'Trecho-modelo: melancolia «refletida» no aumento de depressão/ansiedade.',
          '«Refletidos» = se manifestam, aparecem nos índices — não espelho literal.',
          'A «manifestados»: «manifestados no aumento de transtornos» — equivalência — manter.',
          'B «infantil» por «lúdico»: infantil ≠ lúdico no registro — eliminar.',
          'C «alegria» por nostalgia: campo semântico distinto — eliminar.',
          'D «preguiçosa» por «refletidos»: sem sentido — eliminar.',
          'E «excesso» por «déficit»: antônimo — eliminar.',
          'Gabarito A. Em similares: leia o trecho entre aspas antes do parênteses.',
        ],
        footer_rule: 'Refletidos ≈ manifestados (aparecem nos dados).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REFLETIR × MANIFESTAR',
        rows: [
          { label: 'Refletidos', value: 'Aparecem, expressam-se — não espelho físico.' },
          { label: 'Manifestados', value: 'Tornam-se visíveis nos transtornos.' },
          { label: 'Pergunta-teste', value: 'Substituto mantém ligação melancolia → transtornos?' },
          { label: 'Nesta questão', value: 'A — manifestados.' },
        ],
        footer_rule: 'Contexto psicológico — não reflexo de luz.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Substitutos inválidos',
        items: [
          { label: 'B — infantil', detail: '«Lúdico» ≠ infantil em tom/registro.', correct: 'Sinônimo no contexto: «infantil» não substitui «lúdico» sem mudar nuance.' },
          { label: 'C — alegria', detail: 'Nostalgia não equivale a alegria.', correct: 'Sinônimo no contexto: «alegria» não encaixa em «guiado pela nostalgia».' },
          { label: 'D — preguiçosa', detail: 'Adjetivo sem vínculo com «refletidos».', correct: 'Sinônimo no contexto: «preguiçosa» não substitui verbo/particípio «refletidos».' },
          { label: 'E — excesso', detail: 'Déficit × excesso — oposição.', correct: 'Antônimo no contexto: «excesso» inverte «déficit de brincadeiras».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Os problemas refletidos no relatório alarmaram a diretoria.»',
            correct: 'Sinônimo no contexto: «manifestados» — apareceram/expressaram-se no documento.',
          },
        ],
        footer_rule: 'A: manifestados nos transtornos.',
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
