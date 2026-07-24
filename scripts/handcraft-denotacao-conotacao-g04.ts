#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — denotacao-conotacao-g04 (8 slugs · Denotação/conotação · lote 4).
 *
 *   npx tsx scripts/handcraft-denotacao-conotacao-g04.ts
 *   npm run audit:questao-readiness -- --lote=denotacao-conotacao-g04 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=denotacao-conotacao-g04 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'denotacao-conotacao-g04';
const SUBTOPICO = 'Denotação, conotação e figuras de linguagem';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_denotacao_conotacao';
const REVIEWED = '2026-07-24';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-denotacao-literal-figurado.json';
const GOLDEN_TIRINHA = 'examples/questao-premium-avancasp-portugues-denotacao-tirinha-drogas.json';

const DENOTACAO_SOURCE = {
  id: 'pt-denotacao-conotacao-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Denotação, conotação e figuras de linguagem',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'denotação',
    'conotação',
    'sentido literal',
    'sentido figurado',
    'metáfora',
    'metonímia',
    'eufemismo',
    'ironia',
    'pergunta-teste',
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
      reviewer: 'handcraft:denotacao-conotacao-g04',
      guideline_snapshot: `Elias TE-simples — pergunta «Literal ou figurado?» · lente dicionário × efeito (denotacaoConotacao.ts) · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      DENOTACAO_SOURCE,
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
  'educa-pb-aga-denotacao-leia-o-texto-para-responder-a-questa-3661903': {
    family: 'text_fragment',
    source_tec_id: '3661903',
    source_note: '«furar fila» figurado no título — EDUCA PB AgA Pref Umbuzeiro 2025 tec 3661903',
    meta: {
      banca: 'EDUCA PB',
      prova: 'AgA (Pref Umbuzeiro)',
      orgao: 'Pref. Umbuzeiro',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão abaixo.\n\nSobre o emprego da expressão «furar fila» no título do texto, julgue as assertivas a seguir e assinale V para sentenças VERDADEIRAS e F para FALSAS:\n\n( ) I. A expressão apresenta sentido figurado/subjetivo.\n( ) II. O sentido da expressão depende do contexto em que é empregada.\n( ) III. A expressão é empregada em sentido denotativo.\n( ) IV. A expressão apresenta sentido conotativo.\n\nAssinale a sequência CORRETA:',
    text_fragment:
      '<p><strong>Projeto de lei quer barrar uso de bebês reborn para furar fila na PB</strong></p>' +
      '<p>Bonecos do tipo «bebê reborn» — réplicas realistas de recém-nascidos — entraram no debate político na Paraíba. Projetos na <strong>ALPB</strong> e nas câmaras de <strong>João Pessoa</strong> e <strong>Campina Grande</strong> propõem sanções a quem utilizar esses bonecos para obter prioridade em atendimentos destinados a pessoas com crianças de colo.</p>' +
      '<p>Na Câmara de João Pessoa, o vereador <strong>Guguinha Moov Jampa (PSD)</strong> apresentou o <strong>PLO 269/2025</strong>. Na ALPB, o deputado <strong>Walber Virgolino (PL)</strong> protocolou propostas semelhantes (PLO 4380/2025 e PLO 4350/2025). O objetivo: coibir fraudes e preservar a prioridade de quem está com crianças reais.</p>' +
      '<p><em>Jornal da Paraíba — adaptado</em></p>',
    options: [
      { id: 'A', text: 'F, F, V, V.', is_correct: false },
      { id: 'B', text: 'V, F, F, F.', is_correct: false },
      { id: 'C', text: 'F, V, F, F.', is_correct: false },
      { id: 'D', text: 'V, V, F, V.', is_correct: true },
      { id: 'E', text: 'V, F, V, V.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '«Furar fila» no título',
        chip_label: 'Figurado × literal',
        meta: slideMeta,
        items: [
          { label: 'Título', detail: '«Furar fila» — não perfurar objeto físico.', icon: 'Newspaper' },
          { label: 'Bebês reborn', detail: 'Bonecos usados para burlar prioridade — contexto PB.', icon: 'Baby' },
          { label: 'Figurado I', detail: 'Ultrapassar fila sem direito — sentido subjetivo.', icon: 'Users' },
          { label: 'Contexto II', detail: 'Só faz sentido no debate de prioridade em serviços.', icon: 'MapPin' },
          { label: 'Pegadinha III', detail: 'Não é «furar» no dicionário de perfuração.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'No título jornalístico, «furar fila» é imagem — não ação literal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'V/F → sequência',
        chip_label: 'Um toque = um item',
        meta: slideMeta,
        steps: [
          'Texto: bebês reborn na PB — projetos contra burlar fila de prioridade.',
          'Comando: V/F sobre «furar fila» no título.',
          'I figurado/subjetivo: ultrapassar fila indevidamente — V.',
          'II depende do contexto: expressão de jornalismo político — V.',
          'III denotativo: não é perfurar fila física — F.',
          'IV conotativo: carga de fraude e indignação — V.',
          'Sequência V,V,F,V — eliminar A, B, C e E.',
          'Gabarito D.',
          'Em similares: locução de jornal + serviço público = figurado/conotativo.',
        ],
        footer_rule: 'Tap = fechar cada assertiva antes da letra.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        chip_label: 'Tabela portátil',
        meta: slideMeta,
        content: 'FURAR FILA — LENTE',
        rows: [
          { label: 'Literal', value: 'Perfurar objeto «fila» — absurdo no título.' },
          { label: 'Figurado', value: 'Passar à frente sem direito — metáfora cotidiana.' },
          { label: 'Contexto', value: 'Bebês reborn × prioridade em atendimento.' },
          { label: 'Sequência', value: 'V,V,F,V — letra D.' },
          { label: 'Nesta questão', value: 'D — I e II V; III F; IV V.' },
        ],
        footer_rule: 'Título de notícia costuma condensar sentido figurado.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Sequências erradas',
        chip_label: 'Compare',
        meta: slideMeta,
        content: 'Cada letra troca o julgamento de I–IV',
        items: [
          { label: 'A — F,F,V,V', detail: 'Nega figurado e contexto em I e II.', correct: 'I e II são V — «furar fila» é figurado e contextual.' },
          { label: 'B — V,F,F,F', detail: 'Marca IV como falsa.', correct: 'IV é V — expressão carrega conotação de fraude.' },
          { label: 'C — F,V,F,F', detail: 'Nega figurado em I.', correct: 'I é V — não é sentido de perfuração literal.' },
          { label: 'E — V,F,V,V', detail: 'Nega contexto em II.', correct: 'II é V — sentido amarra ao debate de prioridade.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Político prometeu furar fila do atraso na obra.»',
            correct: 'Sentido figurado: «furar fila» transfere ultrapassar espera — não perfurar objeto.',
          },
        ],
        footer_rule: 'D sobrou: V,V,F,V — furar fila figurado no título.',
      },
    ],
  },

  'avancasp-fon-denotacao-uma-lata-existe-para-conter-algomas-3665290': {
    family: 'conceito',
    source_tec_id: '3665290',
    source_note: 'Gilberto Gil «Metáfora» — lata denotativa — AVANÇASP Fono FMSRC 2025 tec 3665290',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Fono (FMSRC)',
      orgao: 'FMSRC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Uma lata existe para conter algo\nMas quando o poeta diz: Lata\nPode estar querendo dizer o incontível»\n(«Metáfora», de Gilberto Gil)\n\nEm relação aos sentidos das palavras na estrofe acima, assinale a análise correta.',
    options: [
      {
        id: 'A',
        text: 'O texto afirma a ideia de que um poeta é capaz de transformar o sentido figurado das palavras em sentido próprio, real.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O texto afirma a ideia de que um poeta não sabe lidar direito com as palavras por não dominar o sentido próprio delas.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Em «Pode estar querendo dizer», o autor afirma que um poeta nunca atinge o sentido figurado das palavras.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Ao afirmar «Uma lata existe para conter algo», o autor emprega a palavra «lata» em seu sentido próprio, denotativo.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Ao afirmar «Uma lata existe para conter algo», o autor emprega a palavra «lata» em seu sentido figurado, conotativo.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gil: lata × poeta',
        chip_label: 'Denotação primeiro',
        meta: slideMeta,
        items: [
          { label: '1º verso', detail: '«Lata» recipiente — sentido de dicionário.', icon: 'Package' },
          { label: '2º verso', detail: 'Poeta eleva «Lata» ao incontível — virada metafórica.', icon: 'Sparkles' },
          { label: 'Conter', detail: 'Função literal do objeto — ancora denotativa.', icon: 'Box' },
          { label: 'Incontível', detail: 'Abstração poética — campo do figurado.', icon: 'Infinity' },
          { label: 'Pegadinha', detail: 'Generalizar «poeta nunca atinge figurado» (C).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'A banca pergunta o verso denotativo — não a metáfora inteira.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Estrofe Gilberto Gil: lata que contém × poeta que diz «Lata».',
          'Comando: análise correta dos sentidos na estrofe.',
          'A: poeta transforma figurado em próprio — inverte a lógica — eliminar.',
          'B: poeta não domina palavras — não é o eixo — eliminar.',
          'C: poeta nunca atinge figurado — contradiz o verso — eliminar.',
          'D: «Uma lata existe para conter» — recipiente real — denotativo — correto.',
          'E: mesmo verso como figurado — confunde com o 2º momento — eliminar.',
          'Gabarito D.',
          'Em similares: primeiro verso costuma ancorar o literal antes da metáfora.',
        ],
        footer_rule: 'Tap = separar verso 1 (lata real) do verso 2 (Lata poética).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LATA — DUAS CAMADAS',
        rows: [
          { label: 'Denotativo', value: 'Recipiente metálico para conter algo.' },
          { label: 'Conotativo', value: '«Lata» poética — incontível, transcendência.' },
          { label: 'Pergunta-teste', value: 'Qual verso a alternativa cita?' },
          { label: 'Nesta questão', value: 'D — «conter algo» = lata literal.' },
        ],
        footer_rule: 'Gil ensina: objeto comum vira poema — mas o 1º verso é literal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Leituras invertidas',
        items: [
          { label: 'A — figurado → próprio', detail: 'Poeta «transforma» sentido ao contrário do texto.', correct: 'Gil mostra salto do literal ao poético — não o inverso.' },
          { label: 'B — poeta incapaz', detail: 'Culpa o poeta por não dominar palavras.', correct: 'Texto celebra o poder metafórico — não incompetência.' },
          { label: 'C — nunca figurado', detail: 'Nega a metáfora do segundo verso.', correct: 'Poeta justamente atinge o incontível — afirmação oposta.' },
          { label: 'E — lata figurada no 1º', detail: 'Trata recipiente como imagem abstrata.', correct: '«Conter algo» ancora objeto real — denotação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Guardei as moedas numa lata velha.»',
            correct: 'Sentido denotativo: «lata» designa recipiente — não abstração poética.',
          },
        ],
        footer_rule: 'D: lata denotativa no 1º verso.',
      },
    ],
  },

  'facet-moto-p-denotacao-a-publicidade-contemporanea-apropria-3670228': {
    family: 'conceito',
    source_tec_id: '3670228',
    source_note: 'Barthes publicidade mito — FACET Moto Pref Congo 2025 tec 3670228',
    meta: {
      banca: 'FACET',
      prova: 'Moto (Pref Congo)',
      orgao: 'Pref. Congo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'A publicidade contemporânea apropria-se de múltiplas linguagens — visual, verbal e sonora — para associar produtos a valores culturais e subjetivos. Conforme discute Roland Barthes em Mitologias (1957), a mensagem publicitária raramente é neutra, pois funciona como mito moderno, atribuindo ao objeto significados que ultrapassam sua função prática.\n\nQual alternativa reflete esse efeito de sentido?',
    options: [
      {
        id: 'A',
        text: 'Transmitir informações técnicas precisas, sem qualquer relação emocional ou simbólica com o consumidor.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Produzir neutralidade discursiva absoluta, reduzindo o anúncio a simples catálogo objetivo de produtos.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Criar identificação simbólica e afetiva, vinculando o consumo a valores sociais e culturais compartilhados.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Assegurar equivalência científica rigorosa, transformando a publicidade em discurso referencial objetivo.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Restringir-se à função denotativa da linguagem, recusando recursos estéticos ou associações implícitas.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Publicidade como mito',
        chip_label: 'Barthes',
        meta: slideMeta,
        items: [
          { label: 'Mito moderno', detail: 'Objeto ganha sentido além da função prática.', icon: 'Layers' },
          { label: 'Linguagens', detail: 'Visual + verbal + sonora — carga simbólica.', icon: 'Palette' },
          { label: 'Identificação C', detail: 'Consumidor se vê nos valores do anúncio.', icon: 'Heart' },
          { label: 'Neutralidade B', detail: 'Publicidade raramente é catálogo frio.', icon: 'FileText' },
          { label: 'Pegadinha', detail: 'Confundir propaganda com ficha técnica (A/D).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Anúncio vende significado — não só produto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Enunciado: Barthes — publicidade como mito, valores culturais.',
          'Comando: qual alternativa reflete esse efeito de sentido?',
          'A informação técnica sem emoção: discurso referencial puro — eliminar.',
          'B neutralidade absoluta: nega o mito — eliminar.',
          'C identificação simbólica e afetiva: valores compartilhados — alinha com Barthes.',
          'D equivalência científica: transforma anúncio em laudo — eliminar.',
          'E só denotação: recusa conotação — oposto do texto — eliminar.',
          'Gabarito C.',
          'Em similares: «mito» = produto + valor social.',
        ],
        footer_rule: 'Tap = descartar catálogo, ficar com símbolo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'BARTHES — PUBLICIDADE',
        rows: [
          { label: 'Denotação', value: 'Função prática do produto — o que ele faz.' },
          { label: 'Conotação', value: 'Valores, estilo de vida, identidade.' },
          { label: 'Mito', value: 'Objeto + significado cultural compartilhado.' },
          { label: 'Nesta questão', value: 'C — identificação simbólica e afetiva.' },
        ],
        footer_rule: 'Propaganda boa cria pertencimento — não só especificação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Discurso «frio» nas letras',
        items: [
          { label: 'A — ficha técnica', detail: 'Só dados precisos, zero emoção.', correct: 'Publicidade mítica vai além da informação — conotação.' },
          { label: 'B — catálogo neutro', detail: 'Anúncio como lista objetiva.', correct: 'Barthes nega neutralidade — há construção de sentido.' },
          { label: 'D — laudo científico', detail: 'Rigor referencial absoluto.', correct: 'Propaganda não é artigo científico — é símbolo.' },
          { label: 'E — só denotação', detail: 'Recusa estética e associação.', correct: 'Opposto do mito — publicidade usa conotação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Compre este tênis e conquiste a liberdade.»',
            correct: 'Sentido conotativo: produto vinculado a valor simbólico — mito de consumo.',
          },
        ],
        footer_rule: 'C: afeto + cultura compartilhada.',
      },
    ],
  },

  'quadrix-aux-denotacao-texto-base-para-questao-abaixo-a-imu-3721172': {
    family: 'text_fragment',
    source_tec_id: '3721172',
    source_note: 'PNI vacinação × imunização denotativas — QUADRIX Aux FUABC 2025 tec 3721172',
    meta: {
      banca: 'QUADRIX',
      prova: 'Aux (FUABC)',
      orgao: 'FUABC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto base para questão abaixo.\n\nPresentes ao longo do texto, do ponto de vista científico, e não do uso popular, as palavras «vacinação» e «imunização» são, uma em relação à outra,',
    text_fragment:
      '<p>A <strong>imunização</strong> da população, além de prevenir doenças graves, contribui para reduzir a disseminação de agentes infecciosos na comunidade, protegendo aqueles que não podem ser vacinados por motivos de saúde.</p>' +
      '<p>Entre as formas de imunização, a <strong>vacinação</strong> é reconhecida como uma das mais eficazes estratégias para preservar a saúde da população e manter uma sociedade saudável e resistente.</p>' +
      '<p>A política de vacinação é de responsabilidade do <strong>Programa Nacional de Imunizações (PNI)</strong> do Ministério da Saúde. Estabelecido em 1973, o PNI disponibiliza gratuitamente, no SUS, 47 imunobiológicos — vacinas, soros e imunoglobulinas.</p>' +
      '<p>O calendário nacional contempla vacinas que protegem em todos os ciclos de vida — poliomielite, sarampo, rubéola, tétano, coqueluche e outras doenças imunopreveníveis. O PNI coordena campanhas anuais para altas coberturas vacinais.</p>' +
      '<p><em>Fonte: gov.br — adaptado</em></p>',
    options: [
      { id: 'A', text: 'sinônimas.', is_correct: false },
      { id: 'B', text: 'antônimas.', is_correct: false },
      { id: 'C', text: 'denotativas com mesmo significado.', is_correct: false },
      { id: 'D', text: 'conotativas com mesmo significado.', is_correct: false },
      { id: 'E', text: 'denotativas com significados diferentes.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vacinação × imunização',
        chip_label: 'Campo científico',
        meta: slideMeta,
        items: [
          { label: 'Imunização', detail: 'Protege população — reduz agentes infecciosos na comunidade.', icon: 'Shield' },
          { label: 'Vacinação', detail: 'Estratégia eficaz — vacinados e calendário nacional PNI.', icon: 'Syringe' },
          { label: 'PNI', detail: 'Programa federal — imunobiológicos gratuitos no SUS.', icon: 'Building' },
          { label: 'Campo técnico', detail: 'Vacinação ⊂ imunização — denotativas, significados distintos.', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: 'Marcar sinônimo por uso jornalístico (A/C).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ciência separa termo geral (imunização) de via (vacinação).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto PNI: imunização da população; prevenir doencas graves; agentes infecciosos na comunidade.',
          'Comando: relação científica entre «vacinação» e «imunização».',
          'A sinônimas: no técnico, vacinação é parte da imunização — eliminar.',
          'B antônimas: não se opõem — eliminar.',
          'C denotativas mesmo sentido: campos distintos — eliminar.',
          'D conotativas mesmo: não é carga afetiva — eliminar.',
          'E denotativas significados diferentes: hiperônimo × estratégia — correto.',
          'Gabarito E.',
          'Em similares: «do ponto de vista científico» = definição de dicionário especializado.',
        ],
        footer_rule: 'Tap = testar se um termo inclui o outro.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PNI — PAR TERMO',
        rows: [
          { label: 'Imunização', value: 'Processo geral de proteção imune.' },
          { label: 'Vacinação', value: 'Via concreta — aplicação de vacinas.' },
          { label: 'Relação', value: 'Vacinação ⊂ imunização (não sinônimo).' },
          { label: 'Nesta questão', value: 'E — denotativas, significados diferentes.' },
        ],
        footer_rule: 'Uso popular confunde — prova cobra prevenir doencas com precisão técnica.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Relações incorretas',
        items: [
          { label: 'A — sinônimas', detail: 'Trata como palavras intercambiáveis.', correct: 'Cientificamente, vacinação é modalidade de imunização — não sinônimo.' },
          { label: 'B — antônimas', detail: 'Opõe os termos.', correct: 'São complementares no mesmo campo — não antônimos.' },
          { label: 'C — mesmo denotado', detail: 'Iguala os significados objetivos.', correct: 'Um é processo amplo; outro, estratégia específica.' },
          { label: 'D — conotativas', detail: 'Fala em carga subjetiva igual.', correct: 'Texto é técnico-descritivo — denotação, não conotação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A vacinação faz parte da imunização coletiva.»',
            correct: 'Sentido denotativo: relação de inclusão — termos técnicos distintos.',
          },
        ],
        footer_rule: 'E: denotativas, campos diferentes.',
      },
    ],
  },

  'avancasp-of-denotacao-as-vezes-a-vida-bate-com-um-tijolo-n-3725107': {
    family: 'conceito',
    source_tec_id: '3725107',
    source_note: 'Steve Jobs tijolo figurado — AVANÇASP Of Adm Pref Varginha 2025 tec 3725107',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Of Adm (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: '«Às vezes a vida bate com um tijolo na sua cabeça.» (Steve Jobs)\n\nNo pensamento acima, predomina o sentido:',
    options: [
      {
        id: 'A',
        text: 'figurado através da personificação de «vida» e da representação de várias situações através de «tijolo».',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'próprio através da personificação de «vida» e da representação de várias situações através de «tijolo».',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'figurado através da personificação de «tijolo» e da representação de várias situações através de «vida»',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'próprio através da personificação de «tijolo» e da representação de várias situações através de «vida».',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'figurado através da personificação de «vida», «tijolo» e «cabeça», pois são seres inanimados praticando ações humanas.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vida e o tijolo',
        chip_label: 'Personificação',
        meta: slideMeta,
        items: [
          { label: 'Vida', detail: 'Abstração que «bate» — personificação.', icon: 'Heart' },
          { label: 'Tijolo', detail: 'Metáfora de golpe, revés, obstáculo.', icon: 'BrickWall' },
          { label: 'Cabeça', detail: 'Alvo da metáfora — não construção literal.', icon: 'User' },
          { label: 'Jobs', detail: 'Frase sobre adversidade — não acidente de obra.', icon: 'Quote' },
          { label: 'Pegadinha', detail: 'Trocar agente da personificação (C/D).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Tijolo na frase = revés — não material de construção.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Citação Steve Jobs: vida bate com tijolo na cabeça.',
          'Comando: sentido predominante na frase.',
          'Há personificação de «vida» (age como agente) e metáfora de «tijolo» (revés).',
          'A figurado + vida personificada + tijolo como situação — correto.',
          'B próprio: não há tijolo físico nem vida literal batendo — eliminar.',
          'C/D invertem quem personifica — eliminar.',
          'E personifica também «cabeça» como inanimada — exagero da banca — eliminar.',
          'Gabarito A.',
          'Em similares: abstração + objeto concreto = figura.',
        ],
        footer_rule: 'Tap = quem age? O que representa?',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TIJOLO — METÁFORA',
        rows: [
          { label: 'Literal', value: 'Bloco de argamassa batendo na cabeça.' },
          { label: 'Figurado', value: 'Revés, choque, dificuldade inesperada.' },
          { label: 'Personificação', value: '«Vida» como agente que golpeia.' },
          { label: 'Nesta questão', value: 'A — figurado (vida + tijolo).' },
        ],
        footer_rule: 'Jobs fala de obstáculo — não de canteiro de obras.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Inversões e literalismo',
        items: [
          { label: 'B — sentido próprio', detail: 'Trata a frase como acidente real.', correct: 'Não há tijolo físico — metáfora de adversidade.' },
          { label: 'C — personifica tijolo', detail: 'Inverte agente e imagem.', correct: 'Quem personifica é «vida» — tijolo representa situações.' },
          { label: 'D — próprio invertido', detail: 'Erro duplo de sentido e agente.', correct: 'Predomina figurado — vida personificada.' },
          { label: 'E — cabeça personificada', detail: 'Lista três inanimados agindo.', correct: '«Cabeça» é alvo — não agente personificado.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O destino me jogou um tijolo no caminho.»',
            correct: 'Sentido figurado: «tijolo» transfere obstáculo — não material de construção.',
          },
        ],
        footer_rule: 'A: figurado por personificação.',
      },
    ],
  },

  'avancasp-tla-denotacao-assinale-a-alternativa-cujo-trecho-s-3726045': {
    family: 'conceito',
    source_tec_id: '3726045',
    source_note: 'Sentido próprio quebrou computador — AVANÇASP TLab Pref Varginha 2025 tec 3726045',
    meta: {
      banca: 'AVANÇASP',
      prova: 'TLab (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa cujo trecho se apresenta com as palavras empregadas em seu sentido próprio, literal.',
    options: [
      { id: 'A', text: 'Invadido pela raiva que fluiu a partir da sua demissão, o funcionário quebrou o computador.', is_correct: false },
      { id: 'B', text: 'O computador sofreu com o ataque súbito do funcionário recém-demitido.', is_correct: false },
      { id: 'C', text: 'Ao ler o recado a respeito da sua demissão, o funcionário quebrou o computador.', is_correct: true },
      { id: 'D', text: 'O funcionário, tal qual uma bomba prestes a explodir, quebrou o computador.', is_correct: false },
      { id: 'E', text: 'Após as palavras sangrentas da demissão o atingirem, o funcionário quebrou o computador.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quebrou o computador',
        chip_label: 'Literal',
        meta: slideMeta,
        items: [
          { label: 'C — gabarito', detail: 'Ação física: destruir o equipamento.', icon: 'Monitor' },
          { label: 'Raiva A', detail: '«Invadido pela raiva» — metáfora de emoção.', icon: 'Flame' },
          { label: 'Ataque B', detail: 'Computador «sofre ataque» — personificação.', icon: 'Swords' },
          { label: 'Bomba D', detail: 'Comparação explosiva — figura.', icon: 'Bomb' },
          { label: 'Pegadinha', detail: 'Confundir emoção figurada com verbo literal.', icon: 'AlertTriangle' },
        ],
        footer_rule: '«Quebrou» pode ser literal — mas o contexto decide.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: trecho em sentido próprio/literal.',
          'A «invadido pela raiva»: emoção como invasor — figurado — eliminar.',
          'B «computador sofreu ataque»: personificação — figurado — eliminar.',
          'C leu demissão e quebrou computador: ação física direta — literal.',
          'D «bomba prestes a explodir»: comparação — figurado — eliminar.',
          'E «palavras sangrentas»: metáfora de violência verbal — figurado — eliminar.',
          'Gabarito C.',
          'Em similares: menos figura ao redor = mais chance de literal.',
        ],
        footer_rule: 'Tap = caçar metáfora antes do verbo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LITERAL — FILTRO',
        rows: [
          { label: 'Próprio', value: 'Quebrar = danificar fisicamente o objeto.' },
          { label: 'Figurado', value: 'Raiva que invade, bomba, palavras sangrentas.' },
          { label: 'Pergunta-teste', value: 'Dá para filmar a ação sem metáfora?' },
          { label: 'Nesta questão', value: 'C — quebrou = ação física.' },
        ],
        footer_rule: 'C é o único trecho «seco» — sem imagem extra.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Figuras nas outras letras',
        items: [
          { label: 'A — raiva invade', detail: 'Emoção como agente externo.', correct: 'Sentido figurado: personificação da raiva.' },
          { label: 'B — ataque ao PC', detail: 'Equipamento como vítima animada.', correct: 'Sentido figurado: personificação do computador.' },
          { label: 'D — bomba', detail: 'Funcionário comparado a explosivo.', correct: 'Sentido figurado: comparação/hiperbole.' },
          { label: 'E — palavras sangrentas', detail: 'Demissão como agressão física.', correct: 'Sentido figurado: metáfora de violência.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Ele leu o e-mail e quebrou o celular no chão.»',
            correct: 'Sentido literal: «quebrou» = destruição física do aparelho.',
          },
        ],
        footer_rule: 'C: sentido próprio.',
      },
    ],
  },

  'avancasp-ag-denotacao-preso-a-cancoes-entregue-a-paixoesqu-3727032': {
    family: 'conceito',
    source_tec_id: '3727032',
    source_note: 'Milton «Caçador de mim» prisão/armadilhas — AVANÇASP Ag Fisc Pref Varginha 2025 tec 3727032',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag Fisc (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Preso a canções, entregue a paixões\nQue nunca tiveram fim\nVou me encontrar longe do meu lugar\nEu, caçador de mim\nNada a temer, senão o correr da luta\nNada a fazer, senão esquecer o medo\nAbrir o peito à força, numa procura\nFugir às armadilhas da mata escura»\n(Caçador de mim, de Milton Nascimento)\n\nAssinale a alternativa cujos elementos preenchem corretamente as lacunas do enunciado seguinte, na mesma ordem, em relação à análise da letra de música acima.\n\nPredomina no texto o sentido das palavras, em que a imagem de é manifestada através de palavras como « ».',
    options: [
      { id: 'A', text: 'próprio – corrida – luta', is_correct: false },
      { id: 'B', text: 'próprio – arte – canções', is_correct: false },
      { id: 'C', text: 'figurado – amor – medo', is_correct: false },
      { id: 'D', text: 'figurado – prisão – armadilhas', is_correct: true },
      { id: 'E', text: 'figurado – liberdade – escura', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preso a canções',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Preso', detail: 'Não há grades — vínculo emocional com canções.', icon: 'Music' },
          { label: 'Armadilhas', detail: 'Mata escura — perigo simbólico, não caça literal.', icon: 'Trees' },
          { label: 'Prisão D', detail: 'Imagem central: estar preso / fugir armadilhas.', icon: 'Lock' },
          { label: 'Caçador de mim', detail: 'Busca interior — figurado existencial.', icon: 'Search' },
          { label: 'Pegadinha', detail: 'Marcar «luta» ou «medo» isolados (A/C).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Letra de Milton = campo figurado — prisão e armadilhas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Letra Milton: preso a canções, paixões, armadilhas da mata escura.',
          'Comando: sentido + imagem + palavra-manifestação.',
          'A próprio + corrida + luta: «correr da luta» é metáfora — eliminar.',
          'B próprio + arte: nega figurado global — eliminar.',
          'C figurado + amor + medo: medo aparece, mas eixo é prisão/armadilha — eliminar.',
          'D figurado + prisão + armadilhas: «preso», «fugir às armadilhas» — casa.',
          'E figurado + liberdade + escura: liberdade não é imagem central — eliminar.',
          'Gabarito D.',
          'Em similares: lacuna tripla — fechar sentido geral antes das palavras.',
        ],
        footer_rule: 'Tap = imagem dominante na letra.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MILTON — IMAGEM',
        rows: [
          { label: 'Figurado', value: 'Predomina na letra — afeto e busca interior.' },
          { label: 'Prisão', value: 'Vínculo com canções/paixões — não cela.' },
          { label: 'Armadilhas', value: 'Perigos simbólicos da «mata escura».' },
          { label: 'Nesta questão', value: 'D — figurado · prisão · armadilhas.' },
        ],
        footer_rule: 'MPB cobra leitura de metáfora — não paráfrase literal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Pares que não fecham',
        items: [
          { label: 'A — corrida/luta', detail: 'Foca «correr da luta».', correct: 'Eixo da letra é prisão e armadilhas — não corrida esportiva.' },
          { label: 'B — arte/canções', detail: 'Trata canções como arte literal.', correct: '«Preso a canções» é figurado — não sentido próprio.' },
          { label: 'C — amor/medo', detail: 'Isola «medo» como imagem central.', correct: 'Medo aparece, mas par dominante é prisão/armadilhas.' },
          { label: 'E — liberdade/escura', detail: 'Inventa imagem de liberdade.', correct: 'Texto fala em fugir armadilhas — não celebrar liberdade.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Estou preso a memórias que não me largam.»',
            correct: 'Sentido figurado: «preso» transfere cárcere — não prisão física.',
          },
        ],
        footer_rule: 'D: figurado + prisão + armadilhas.',
      },
    ],
  },

  'avancasp-acr-denotacao-uma-lata-existe-para-conter-algomas-3727506': {
    family: 'conceito',
    source_tec_id: '3727506',
    source_note: 'Gilberto Gil «Metáfora» lata — AVANÇASP ACre Pref Varginha 2025 tec 3727506 (bespoke)',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACre (Pref Varginha)',
      orgao: 'Pref. Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Uma lata existe para conter algo\nMas quando o poeta diz: Lata\nPode estar querendo dizer o incontível»\n(«Metáfora», de Gilberto Gil)\n\nEm relação aos sentidos das palavras na estrofe acima, assinale a análise correta.',
    options: [
      {
        id: 'A',
        text: 'O texto afirma a ideia de que um poeta é capaz de transformar o sentido figurado das palavras em sentido próprio, real.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O texto afirma a ideia de que um poeta não sabe lidar direito com as palavras por não dominar o sentido próprio delas.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Em «Pode estar querendo dizer», o autor afirma que um poeta nunca atinge o sentido figurado das palavras.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Ao afirmar «Uma lata existe para conter algo», o autor emprega a palavra «lata» em seu sentido próprio, denotativo.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Ao afirmar «Uma lata existe para conter algo», o autor emprega a palavra «lata» em seu sentido figurado, conotativo.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estrofe em duas camadas',
        chip_label: 'Objeto × poema',
        meta: slideMeta,
        items: [
          { label: 'Verso inicial', detail: 'Recipiente com função de guardar — léxico cotidiano.', icon: 'Archive' },
          { label: 'Nome «Lata»', detail: 'Poeta capitaliza e expande o significado.', icon: 'Type' },
          { label: 'Incontível', detail: 'Aquilo que a forma não fecha — abstração.', icon: 'Cloud' },
          { label: 'Alternativa D', detail: 'Aponta o uso objetivo no primeiro hemistíchio.', icon: 'CheckCircle' },
          { label: 'Pegadinha E', detail: 'Achar que todo o poema é só conotação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Gil monta a metáfora a partir de um objeto nomeável.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Verso 1 → análise',
        chip_label: 'Filtro por citação',
        meta: slideMeta,
        steps: [
          'Estrofe em duas etapas: objeto comum → palavra-poema.',
          'Pergunta: qual análise sobre os sentidos está correta?',
          'Alternativas A–C falam do poeta em geral — não respondem ao verso citado.',
          'D cita exatamente «Uma lata existe para conter algo» — uso objetivo.',
          'E atribui conotação ao mesmo trecho — confunde com a virada posterior.',
          'Gabarito D — denotativo no verso de abertura.',
          'Depois Gil transfere «Lata» ao incontível — mas a prova cobra o âncora literal.',
          'Em similares: leia qual trecho cada letra analisa.',
        ],
        footer_rule: 'Resposta certa = verso que ainda não virou metáfora.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Checklist rápido',
        meta: slideMeta,
        content: 'METÁFORA GIL — ANCORAGEM',
        rows: [
          { label: 'Abertura', value: 'Objeto guarda conteúdo — léxico usual.' },
          { label: 'Virada', value: '«Lata» designa o que escapa à forma.' },
          { label: 'Prova', value: 'Cobra o trecho antes da expansão poética.' },
          { label: 'Letra certa', value: 'D — palavra no sentido próprio/denotativo.' },
        ],
        footer_rule: 'Primeiro verso fixa o referente real.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Armadilhas da letra',
        meta: slideMeta,
        content: 'Cada erro desloca o foco do verso inicial',
        items: [
          { label: 'A — inversão', detail: 'Diz que o poeta «devolve» o figurado ao literal.', correct: 'Movimento é do literal ao poético — não o contrário.' },
          { label: 'B — incompetência', detail: 'Acusa o poeta de não dominar vocabulário.', correct: 'Texto elogia o salto semântico — não critica domínio.' },
          { label: 'C — negação', detail: 'Afirma impossibilidade de atingir figurado.', correct: 'Verso seguinte mostra exatamente o alcance metafórico.' },
          { label: 'E — conotação no 1º', detail: 'Trata recipiente como símbolo desde o início.', correct: '«Conter algo» descreve função real — denotação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A lata de tinta estava no armário.»',
            correct: 'Sentido próprio: «lata» nomeia o recipiente — sem carga poética.',
          },
        ],
        footer_rule: 'D permanece: denotativo na abertura.',
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
