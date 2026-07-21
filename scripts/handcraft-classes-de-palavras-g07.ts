#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g07 (8 slugs · Classes de palavras · lote 7 · Conjunção).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g07.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g07 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g07 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g07';
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
    'causa oposição adição conclusão tempo finalidade',
    'como e por isso e visto que embora',
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
      reviewer: 'handcraft:classes-de-palavras-g07',
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
  'avancasp-tec-classes-cazo-presenca-de-animais-selvagens-b-3835993': {
    family: 'conceito',
    source_tec_id: '3835993',
    source_note: '«como» causal charge CAZO — AVANÇASP Tec Pref Estiva Gerbi 2026 tec 3835993',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Tec Enf (Pref Estiva Gerbi)',
      orgao: 'Pref Estiva Gerbi',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'CAZO. Presença de animais selvagens. Blog do AFTM.\n\nA conjunção «como», empregada na fala da charge acima, possui o sentido de:',
    options: [
      { id: 'A', text: 'consequência.', is_correct: false },
      { id: 'B', text: 'finalidade.', is_correct: false },
      { id: 'C', text: 'tempo.', is_correct: false },
      { id: 'D', text: 'causa.', is_correct: true },
      { id: 'E', text: 'modo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Como = por quê?',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Liga orações? Qual relação de sentido?', icon: 'Focus' },
          { label: 'Como causal', detail: 'Equivale a «porque» — indica motivo.', icon: 'Link' },
          { label: '× Consequência', detail: 'Seria «de modo que», «tão... que».', icon: 'XCircle' },
          { label: '× Finalidade', detail: 'Seria «para que», «a fim de que».', icon: 'Ban' },
          { label: 'Pegadinha', detail: '«Como» também é modo/comparação — contexto da charge decide.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Como + motivo = causa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Charge → gabarito',
        meta: slideMeta,
        steps: [
          'Charge CAZO: animais selvagens — «como» na fala explica o motivo do fato.',
          'Teste: dá para trocar por «porque» sem mudar o sentido? → causal.',
          'A consequência exigiria resultado, não motivo — eliminar.',
          'B finalidade pediria objetivo futuro («para que») — eliminar.',
          'C tempo marcaria «quando» — eliminar.',
          'E modo indicaria maneira («como se») — eliminar.',
          'Gabarito D — causa.',
          'Em similares: como = porque | como = da maneira que — leia a oração inteira.',
        ],
        footer_rule: 'D — como causal.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'COMO — DOIS VALORES',
        rows: [
          { label: 'Causal', value: 'Como = porque (motivo).' },
          { label: 'Modo/comp.', value: 'Como = da maneira que / tal qual.' },
          { label: 'Pergunta-teste', value: 'Substitua por «porque» — encaixa?' },
          { label: 'Nesta questão', value: 'D — causa (charge CAZO).' },
        ],
        footer_rule: 'Contexto decide o «como».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar o valor do conectivo',
        items: [
          { label: 'A — consequência', detail: 'Confunde explicação com resultado.', correct: '«Como» introduz motivo, não efeito posterior.' },
          { label: 'B — finalidade', detail: '«Como» parece introduzir objetivo.', correct: 'Finalidade = «para que» — não é o caso na charge.' },
          { label: 'C — tempo', detail: 'Homônimo «quando» confunde.', correct: 'Não marca circunstância temporal.' },
          { label: 'E — modo', detail: '«Como» frequentemente é modo em provas.', correct: 'Na fala da charge, valor é causal — não comparativo/modo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «já que» ou «pois».', correct: 'Mesmo trilho: teste causa × modo.' },
        ],
        footer_rule: 'Só D — causa.',
      },
    ],
  },

  'cpcon-uepb-a-classes-para-responder-a-questao-texto-ii-fi-3836484': {
    family: 'conceito',
    source_tec_id: '3836484',
    source_note: '«e» coordenação aditiva Filho do dono — CPCON UEPB ACS Pref Condado 2026 tec 3836484',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Condado (PB))',
      orgao: 'Pref Condado (PB)',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto II — Filho do dono (trecho da canção)\n\n«Morre a criatura e o planeta sente a dor\nO desespero no olhar de uma criança\nA humanidade fecha os olhos pra não ver.»\n\nNo verso «Morre a criatura e o planeta sente a dor», o conectivo «e» estabelece uma relação entre duas orações. Essa relação é classificada como:',
    options: [
      {
        id: 'A',
        text: 'subordinação consecutiva, pois a segunda oração expressa a consequência da primeira.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'subordinação causal, pois a segunda oração indica o motivo da primeira.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'coordenação adversativa, pois há oposição entre as ações expressas.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'coordenação aditiva, pois une duas orações independentes que expressam soma de ideias.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'coordenação explicativa, pois a segunda oração justifica a anterior.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'E aditivo na canção',
        chip_label: 'M03 — coordenação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Orações independentes? «E» soma ou opõe?', icon: 'Focus' },
          { label: 'Morre + sente', detail: 'Duas ações paralelas ligadas por «e» — adição.', icon: 'Plus' },
          { label: 'Coordenação', detail: 'Nenhuma oração é termo da outra.', icon: 'GitBranch' },
          { label: '× Subordinação', detail: 'Não há «que» nem dependência sintática.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Segunda ideia parece consequência — mas o «e» é aditivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'E entre orações autônomas = aditivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Verso: «Morre a criatura e o planeta sente a dor».',
          'Duas orações com sujeito e verbo próprios — sintaticamente independentes.',
          'A/B subordinação: falta conectivo subordinante (que, porque…) — eliminar.',
          'C adversativa exigiria oposição (mas, porém) — eliminar.',
          'E explicativa usaria «porque», «pois» — eliminar.',
          'D: «e» une ideias em sequência — coordenação aditiva.',
          'Gabarito D.',
          'Em similares: primeiro teste dependência → depois valor do «e».',
        ],
        footer_rule: 'D — coordenação aditiva.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'E COORDENATIVO',
        rows: [
          { label: 'Aditivo', value: 'e, nem — soma ideias (D).' },
          { label: 'Adversativo', value: 'mas, porém, contudo — oposição.' },
          { label: 'Explicativo', value: 'pois, porque (coord.), logo.' },
          { label: 'Subordinação', value: 'uma oração depende da outra — não aqui.' },
          { label: 'Nesta questão', value: 'D — aditiva.' },
        ],
        footer_rule: 'Morre + sente = soma paralela.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir coordenação × subordinação',
        items: [
          { label: 'A — consecutiva', detail: '«Planeta sente dor» parece efeito da morte.', correct: '«E» não é consecutivo — orações são coordenadas paralelas.' },
          { label: 'B — causal', detail: 'Segunda oração parece explicar a primeira.', correct: 'Sem «porque»/«já que» — não há subordinação causal.' },
          { label: 'C — adversativa', detail: 'Temas sombrios sugerem contraste.', correct: 'Não há oposição lexical — falta «mas».' },
          { label: 'E — explicativa', detail: '«Planeta sente» parece justificar «morre».', correct: 'Explicativa coordenada usa «pois»/«porque» — não «e» simples.' },
          { label: 'Em outra banca…', detail: 'Trocam por «morre a criatura e chora o planeta».', correct: 'Mesmo trilho: duas orações + «e» = aditiva.' },
        ],
        footer_rule: 'Só D — aditiva.',
      },
    ],
  },

  'vunesp-tenf-classes-leia-o-texto-a-seguir-para-responder-3840776': {
    family: 'conceito',
    source_tec_id: '3840776',
    source_note: 'Conectivos mas/para/quando Charlotte ioga — VUNESP TEnf Pref Osasco 2026 tec 3840776',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Osasco)',
      orgao: 'Pref Osasco',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nProfessora de ioga de 102 anos ensina sua abordagem simples para envelhecer bem. Desde 1982, Charlotte ensina ioga em Léré (França). Sobre um móvel, uma placa dizia: «A felicidade não está em ter tudo o que você quer, mas em amar o que você tem». Charlotte começou a dar aulas uma década depois, para não se entediar quando se mudou para a pequena cidade. Quando perguntei o que a ioga lhe oferecia, ela respondeu: — Serenidade. (Danielle Friedman, O Estado de S.Paulo. Adaptado)\n\nConsidere as passagens em que os conectivos estão destacados:\n• «A felicidade não está em ter tudo o que você quer, mas em amar o que você tem.»\n• «Começou a dar aulas uma década depois, para não se entediar quando se mudou para a pequena cidade.»\n• «Quando perguntei o que a ioga lhe oferecia, ela respondeu: — Serenidade.»\n\nOs conectivos destacados expressam, respectivamente, noções de:',
    options: [
      { id: 'A', text: 'modo, finalidade e lugar.', is_correct: false },
      { id: 'B', text: 'modo, finalidade e tempo.', is_correct: false },
      { id: 'C', text: 'contraste, finalidade e tempo.', is_correct: true },
      { id: 'D', text: 'contraste, meio e tempo.', is_correct: false },
      { id: 'E', text: 'contraste, meio e lugar.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mas · para · quando',
        chip_label: 'M02 — conectivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada conectivo: opõe, finaliza ou marca tempo?', icon: 'Focus' },
          { label: 'Mas', detail: 'Contraste entre «ter tudo» × «amar o que tem».', icon: 'Split' },
          { label: 'Para', detail: 'Finalidade — objetivo de dar aulas (não se entediar).', icon: 'Target' },
          { label: 'Quando', detail: 'Circunstância temporal — no momento da pergunta.', icon: 'Clock' },
          { label: 'Pegadinha', detail: 'Trocar «para» (fim) por «meio» ou «modo».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mas = contraste · para = fim · quando = tempo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Charlotte: três passagens com conectivos destacados.',
          '1ª «mas»: opõe duas ideias sobre felicidade → contraste.',
          '2ª «para»: indica propósito de dar aulas → finalidade.',
          '3ª «Quando»: marca o momento da pergunta → tempo.',
          'Eliminar A/B (1º valor não é modo) e D/E (2º não é meio).',
          'Sequência: contraste + finalidade + tempo → letra C.',
          'Gabarito C.',
          'Em similares: rotule cada conectivo isoladamente antes de montar a trinca.',
        ],
        footer_rule: 'C — contraste, finalidade, tempo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRÊS CONECTIVOS',
        rows: [
          { label: 'Mas', value: 'Contraste / oposição (adversativa).' },
          { label: 'Para', value: 'Finalidade — a fim de (subord. final).' },
          { label: 'Quando', value: 'Tempo — circunstância temporal.' },
          { label: '× modo', value: '«Como» ou «de modo que» — ausentes.' },
          { label: 'Nesta questão', value: 'C — contraste, finalidade, tempo.' },
        ],
        footer_rule: 'Leia cada trecho separado.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Errar um slot da sequência',
        items: [
          { label: 'A — modo', detail: '1º slot «modo» — «mas» não indica maneira.', correct: '«Mas» é adversativa — contraste, não modo.' },
          { label: 'B — modo', detail: '1º slot «modo» em B também erra o «mas».', correct: 'Contraste na placa de Charlotte — não modo.' },
          { label: 'D — meio', detail: '2º slot «meio» — «para» não é instrumento.', correct: '«Para não se entediar» = finalidade, não meio.' },
          { label: 'E — lugar', detail: '3º slot «lugar» — «quando» não é lugar.', correct: 'Marca tempo da pergunta — não lugar.' },
          { label: 'Em outra banca…', detail: 'Trocam «mas» por «porém».', correct: 'Mesmo valor semântico: contraste.' },
        ],
        footer_rule: 'Só C fecha a trinca.',
      },
    ],
  },

  'instituto-ao-classes-15-07-2026-19-33-55-88-130-131-leia-3840780': {
    family: 'certo_errado',
    source_tec_id: '3840780',
    source_note: 'Valor semântico INCORRETO kidults — Instituto AOCP Ass UNIRIO 2026 tec 3840780',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nTexto 1 — Bons motivos para não se levar tão a sério (Folha de S.Paulo, 2025 — adaptado). Stuart Brown defende que o déficit de brincadeiras entre adultos é crise de saúde pública. Os «kidults» compram, colecionam e se envolvem com brinquedos; brincar alivia tensão e fortalece laços sociais. Meredith Sinclair sugere reencontrar o prazer de brincar sem preocupação com o olhar alheio.\n\nAssinale a alternativa que apresenta, entre parênteses, o valor semântico INCORRETO para o termo destacado.',
    options: [
      {
        id: 'A',
        text: '«Como brincar molda o cérebro, abre a imaginação e revigora a alma» (título do livro de Stuart Brown) (Modo).',
        is_correct: false,
      },
      {
        id: 'B',
        text: '«Quando feito em grupo, o ato de brincar pode ser um antídoto contra a solidão.» (Consequência).',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«[...] o termo «kidult» é usado hoje para definir os adultos que compram, colecionam e se envolvem com brinquedos [...]» (Finalidade).',
        is_correct: true,
      },
      {
        id: 'D',
        text: '«Embora compartilhar nas redes o que tem feito você se divertir seja legal, inclusive para inspirar outras pessoas [...]» (Tempo).',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«e, por isso, têm ganhado espaço em um mercado cada vez mais guiado pela nostalgia» (Adição).',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETO no parêntese',
        chip_label: 'M03 — valor semântico',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O rótulo entre parênteses bate com o conectivo destacado?', icon: 'Focus' },
          { label: 'Stuart Brown', detail: 'Texto kidults — déficit de brincadeiras entre adultos.', icon: 'Brain' },
          { label: 'Kidults', detail: 'Adultos que colecionam brinquedos — termo definido no texto.', icon: 'ToyBrick' },
          { label: 'Como (título)', detail: 'Modo/comparação no livro «Como brincar molda o cérebro» — rótulo certo.', icon: 'BookOpen' },
          { label: 'Pegadinha C', detail: 'Definir «kidult» não é marcar finalidade.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Definição ≠ finalidade.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'EXCETO semântico → C',
        meta: slideMeta,
        steps: [
          'Comando: valor semântico INCORRETO entre parênteses.',
          'A «Como brincar...»: «como» = modo de agir — rótulo (Modo) correto.',
          'B «Quando feito em grupo...»: resultado antídoto à solidão — (Consequência) aceitável.',
          'C «kidult é usado para definir...»: define vocábulo — não expressa finalidade.',
          'Rotular (Finalidade) em C é INCORRETO — gabarito.',
          'D «Embora...»: concessão, não tempo — mas prova aponta C.',
          'E «por isso»: conclusão/causalidade — (Adição) parcial, não é a chave.',
          'Gabarito C.',
        ],
        footer_rule: 'C — finalidade errada no trecho definidor.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ROTEIRO INCORRETO',
        rows: [
          { label: 'Modo', value: 'Como + verbo (título Brown).' },
          { label: 'Consequência', value: 'Quando em grupo → efeito antídoto.' },
          { label: 'Finalidade', value: 'Para que / a fim de — objetivo.' },
          { label: 'Definição', value: '«É usado para definir» = explicar termo, não fim.' },
          { label: 'Nesta questão', value: 'C — (Finalidade) incorreto.' },
        ],
        footer_rule: 'Definir ≠ finalizar.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — cada letra certa exceto C',
        items: [
          { label: 'A — Modo', detail: '«Como» no título parece causal.', correct: 'No título de Stuart Brown, «como» = modo de brincar moldar o cérebro.' },
          { label: 'B — Consequência', detail: '«Quando» parece só tempo.', correct: 'Período liga condição a resultado — rótulo plausível.' },
          { label: 'C — Finalidade', detail: '«Kidult é usado para definir» parece finalidade.', correct: 'Trecho define vocábulo — não expressa finalidade; rótulo INCORRETO (gabarito).' },
          { label: 'D — Tempo', detail: '«Embora» também está mal rotulado.', correct: '«Embora» = concessão, não tempo — mas gabarito oficial é C.' },
          { label: 'E — Adição', detail: '«por isso» é conclusão, não adição pura.', correct: 'Não é a alternativa-gabarito — C é o erro pedido.' },
          { label: 'Em outra banca…', detail: 'Trocam kidult por outro neologismo.', correct: 'Mesmo teste: definição não é finalidade.' },
        ],
        footer_rule: 'Só C rotula mal o trecho.',
      },
    ],
  },

  'instituto-ao-classes-leia-o-texto-a-seguir-para-responder-3840898': {
    family: 'conceito',
    source_tec_id: '3840898',
    source_note: '«por isso» conclusivo HQ — Instituto AOCP Ass UNIRIO 2026 tec 3840898',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a HQ abaixo para responder à questão.\n\nAssinale a alternativa que analisa corretamente a expressão «por isso», presente no quarto quadro do texto.',
    options: [
      { id: 'A', text: 'Ela veicula o mesmo sentido que «porque».', is_correct: false },
      { id: 'B', text: 'Ela é típica do uso informal da língua, visto que, de acordo com a norma-padrão, o correto seria utilizar «por isto».', is_correct: false },
      { id: 'C', text: 'Ela estabelece entre a fala do quarto quadro e a fala do terceiro quadro uma relação de adição.', is_correct: false },
      { id: 'D', text: 'Ela pode ser substituída por «por causa disso» sem que isso modifique o sentido do texto.', is_correct: true },
      { id: 'E', text: 'Além de ligar as partes do texto, a expressão também retoma, com a palavra «isso», o vocábulo «sim», presente na fala anterior.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Por isso na HQ',
        chip_label: 'M02 — conclusão',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Por isso» conclui ou causa? Retoma o quê?', icon: 'Focus' },
          { label: 'Por isso', detail: 'Locução conclusiva — resultado do que foi dito antes.', icon: 'ArrowRight' },
          { label: 'Por causa disso', detail: 'Paráfrase equivalente — mesmo valor semântico.', icon: 'CheckCircle' },
          { label: '× Porque', detail: 'Introduz causa, não conclusão.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Crase «por isto» × informalidade — norma aceita «por isso».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Por isso ≈ por causa disso (conclusão).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'HQ: quarto quadro com «por isso» ligando à fala anterior.',
          'A «porque» inverte a direção (causa × conclusão) — eliminar.',
          'B «por isto» obrigatório — falso na norma culta atual — eliminar.',
          'C adição usaria «e», «além disso» — eliminar.',
          'D «por causa disso» mantém sentido conclusivo — correto.',
          'E retoma a «sim» — análise referencial incorreta — eliminar.',
          'Gabarito D.',
          'Em similares: por isso / logo / portanto = conclusão.',
        ],
        footer_rule: 'D — equivalência conclusiva.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POR ISSO',
        rows: [
          { label: 'Valor', value: 'Conclusão / consequência do que precede.' },
          { label: 'Paráfrase', value: 'Por causa disso, logo, portanto.' },
          { label: '≠ porque', value: 'Porque introduz motivo (causal).' },
          { label: 'Norma', value: '«Por isso» é aceito — não exige «por isto».' },
          { label: 'Nesta questão', value: 'D — substituição válida.' },
        ],
        footer_rule: 'Conclusão: por isso = por causa disso.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir conclusão com causa',
        items: [
          { label: 'A — porque', detail: '«Por isso» e «porque» parecem iguais na fala.', correct: '«Por isso» conclui; «porque» justifica (causa).' },
          { label: 'B — por isto', detail: 'Crase parece obrigatória antes de «isso».', correct: '«Por isso» é forma consagrada na norma-padrão.' },
          { label: 'C — adição', detail: 'Conecta dois quadros — parece somar.', correct: 'Relação é conclusiva, não aditiva.' },
          { label: 'E — retoma «sim»', detail: '«Isso» parece anafórico ao «sim».', correct: '«Isso» retoma a ideia anterior do quadro, não o vocábulo «sim».' },
          { label: 'Em outra banca…', detail: 'Trocam HQ por texto narrativo.', correct: 'Mesmo teste: paráfrase conclusiva.' },
        ],
        footer_rule: 'Só D analisa corretamente.',
      },
    ],
  },

  'instituto-ao-classes-o-texto-a-seguir-refere-se-a-questao-3841143': {
    family: 'certo_errado',
    source_tec_id: '3841143',
    source_note: 'Valor semântico INCORRETO multitarefa — Instituto AOCP Ass UNIRIO 2026 tec 3841143',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'O texto a seguir refere-se à questão.\n\nTexto 1 — ENTENDA POR QUE SER MULTITAREFA É UM MITO QUE FAZ MAL AO CÉREBRO (adaptado). Participar de reunião, checar mensagens e adiantar relatório ao mesmo tempo. Quem nunca sentiu orgulho por fazer várias coisas simultaneamente? A multitarefa (multitasking) cobra preço: cansaço, insônia, perda de foco e dificuldade de memorizar.\n\nAssinale a alternativa que apresenta, entre parênteses, o valor semântico INCORRETO para o termo destacado.',
    options: [
      {
        id: 'A',
        text: '«Quem nunca sentiu um certo orgulho por conseguir fazer várias coisas simultaneamente?» (Causa).',
        is_correct: true,
      },
      {
        id: 'B',
        text: '«[...] procurar um local mais silencioso ou desligar notificações.» (Adição).',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«Muitas vezes, não estamos conseguindo memorizar as coisas porque não estamos presente de verdade [...]» (Conclusão).',
        is_correct: false,
      },
      {
        id: 'D',
        text: '«[...] por exemplo, deixar o celular de lado enquanto assiste a séries.» (Comparação).',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«[...] agendar horários específicos para checar emails, mensagens e outras atividades [...]» (Tempo).',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pergunta retórica ≠ causa',
        chip_label: 'M03 — valor semântico',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O trecho tem conectivo causal ou é pergunta retórica?', icon: 'Focus' },
          { label: 'Multitarefa', detail: 'Texto sobre multitasking e custo cognitivo.', icon: 'Brain' },
          { label: 'Simultaneamente', detail: '«Várias coisas simultaneamente» — contexto da pergunta.', icon: 'Zap' },
          { label: 'Quem nunca...?', detail: 'Pergunta retórica — não introduz causa.', icon: 'HelpCircle' },
          { label: 'Pegadinha A', detail: 'Rotular (Causa) no interrogativo é o erro.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pergunta retórica não é causal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'INCORRETO → A',
        meta: slideMeta,
        steps: [
          'Texto multitarefa: comando pede valor semântico INCORRETO.',
          'A: período interrogativo retórico — não há relação causal.',
          'Rotular (Causa) em A é INCORRETO — gabarito.',
          'B: enumeração de ações (silêncio ou notificações) — (Adição) plausível.',
          'C: «porque» no trecho liga memorizar × presença — (Conclusão) aceitável.',
          'D: «por exemplo» ilustra — (Comparação) distante, mas não é o gabarito.',
          'E: agendar horários — circunstância temporal — (Tempo) plausível.',
          'Gabarito A.',
        ],
        footer_rule: 'A — (Causa) não cabe na pergunta.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PERGUNTA × CAUSA',
        rows: [
          { label: 'Causa', value: 'Porque, já que, visto que — conectivo explícito.' },
          { label: 'Pergunta', value: '«Quem nunca...?» — retórica, sem causal.' },
          { label: 'Adição', value: 'E, ou — soma alternativas (B).' },
          { label: 'Tempo', value: 'Quando, horários — agenda (E).' },
          { label: 'Nesta questão', value: 'A — (Causa) incorreto.' },
        ],
        footer_rule: 'Sem conectivo causal, não rotule Causa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO semântico — só A erra o rótulo',
        items: [
          { label: 'A — Causa', detail: 'Pergunta retórica parece introduzir motivo.', correct: '«Quem nunca sentiu orgulho...?» não é conectivo causal — rótulo INCORRETO (gabarito).' },
          { label: 'B — Adição', detail: '«Ou» entre alternativas parece oposição.', correct: 'Lista de estratégias paralelas — adição aceitável.' },
          { label: 'C — Conclusão', detail: '«Porque» no trecho é causal, não conclusivo.', correct: 'Rótulo discutível, mas gabarito oficial é A.' },
          { label: 'D — Comparação', detail: '«Por exemplo» não compara — exemplifica.', correct: 'Não é a alternativa-gabarito da prova.' },
          { label: 'E — Tempo', detail: '«Agendar horários» marca tempo organizacional.', correct: 'Rótulo plausível — não é o INCORRETO.' },
          { label: 'Em outra banca…', detail: 'Trocam pergunta por «Como não sentir orgulho...»', correct: 'Mesmo trilho: interrogativa ≠ causal.' },
        ],
        footer_rule: 'Só A — Causa incorreta.',
      },
    ],
  },

  'fcc-tec-classes-considere-o-texto-abaixo-para-respon-3908393': {
    family: 'conceito',
    source_tec_id: '3908393',
    source_note: '«visto que» causal Montaigne — FCC Tec SESAPI 2026 tec 3908393',
    meta: {
      banca: 'FCC',
      prova: 'Tec (SESAPI)',
      orgao: 'SESAPI',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto abaixo para responder à questão.\n\nTrecho sobre envelhecimento (adaptado de reflexão clínica e Montaigne): «Anos atrás, eu achava que os 80 anos me encontrariam num estado de serenidade plena. [...] Eu estava enganado. Os medos, a ansiedade, as frustrações e perdas atribuídas ao envelhecimento são universais, não importa se você tem 40 ou 70, ou 90 anos.»\n\nAssinale a alternativa em que a conjunção destacada estabelece relação de causa entre as orações, como em «Eu estava enganado, visto que os medos [...] são universais».',
    options: [
      {
        id: 'A',
        text: 'Eu estava enganado, conquanto os medos, a ansiedade, as frustrações e perdas atribuídas ao envelhecimento sejam universais.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Eu estava enganado; ora os medos, ora a ansiedade, as frustrações e perdas atribuídas ao envelhecimento são universais.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Eu estava enganado; nem os medos, a ansiedade, as frustrações e perdas atribuídas ao envelhecimento são universais.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Eu estava enganado: portanto os medos, a ansiedade, as frustrações e perdas atribuídas ao envelhecimento são universais.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Eu estava enganado, visto que os medos, a ansiedade, as frustrações e perdas atribuídas ao envelhecimento são universais.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Visto que = porque',
        chip_label: 'M02 — causal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Segunda oração justifica a primeira?', icon: 'Focus' },
          { label: 'Visto que', detail: 'Conjunção causal — equivale a «porque».', icon: 'Link' },
          { label: 'Enganado', detail: 'Autor admitiu erro porque medos são universais.', icon: 'User' },
          { label: '× Conquanto', detail: 'Concessão — embora/apesar de.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Portanto inverte: conclusão, não causa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Visto que introduz motivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto envelhecimento: modelo com «visto que» causal.',
          'A conquanto = concessão (apesar de) — eliminar.',
          'B ora...ora = alternância — eliminar.',
          'C nem = negação aditiva — eliminar.',
          'D portanto = conclusão (efeito, não motivo) — eliminar.',
          'E visto que = causal — mantém relação do modelo.',
          'Gabarito E.',
          'Em similares: visto que / já que / porque = causal.',
        ],
        footer_rule: 'E — visto que causal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONJUNÇÕES — CAUSA',
        rows: [
          { label: 'Causais', value: 'visto que, já que, porque, pois (subord.).' },
          { label: 'Concessivas', value: 'conquanto, embora, ainda que.' },
          { label: 'Conclusivas', value: 'portanto, logo, por isso.' },
          { label: 'Alternativas', value: 'ora...ora, quer...quer.' },
          { label: 'Nesta questão', value: 'E — visto que.' },
        ],
        footer_rule: 'Causa justifica «estava enganado».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar causal × conclusivo',
        items: [
          { label: 'A — conquanto', detail: 'Parece ligar as duas orações.', correct: 'Concessão — «apesar de serem universais» — sentido oposto.' },
          { label: 'B — ora...ora', detail: 'Repetição de «ora» confunde.', correct: 'Alternância entre medos — não causal.' },
          { label: 'C — nem', detail: 'Negação parece explicar o engano.', correct: 'Nega universalidade — destrói o argumento.' },
          { label: 'D — portanto', detail: 'Conclusão parece natural após «enganado».', correct: 'Portanto indica consequência, não motivo do erro.' },
          { label: 'Em outra banca…', detail: 'Trocam «visto que» por «posto que».', correct: 'Mesma família causal.' },
        ],
        footer_rule: 'Só E — causal.',
      },
    ],
  },

  'educa-pb-ag-classes-leia-o-texto-a-seguir-e-responda-a-q-3913820': {
    family: 'conceito',
    source_tec_id: '3913820',
    source_note: 'Oposição pagã × cristão casamento — EDUCA PB Ag Adm Pref Cajazeiras 2026 tec 3913820',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Ag Adm (Pref Cajazeiras)',
      orgao: 'Pref Cajazeiras',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nTEXTO II — Casamento, uma invenção cristã (Rainer Gonçalves Sousa — adaptado)\n\n«Para os pagãos [...] o amor era visto como subversivo, como destruidor da sociedade. Para os cristãos, como o bispo Jonas de Orléans, o termo caridade exprimia, com o qualificativo «conjugal», um amor privilegiado e de ternura no interior da célula conjugal.»\n\nA relação de sentido entre as ideias contrastadas no trecho (visão pagã × visão cristã do amor conjugal) é de:',
    options: [
      { id: 'A', text: 'Causalidade.', is_correct: false },
      { id: 'B', text: 'Oposição.', is_correct: true },
      { id: 'C', text: 'Adição.', is_correct: false },
      { id: 'D', text: 'Conclusão.', is_correct: false },
      { id: 'E', text: 'Comparação.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pagão × cristão',
        chip_label: 'M03 — oposição',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Ideias se somam, opõem ou concluem?', icon: 'Focus' },
          { label: 'Para os pagãos', detail: 'Amor subversivo — destruidor.', icon: 'Flame' },
          { label: 'Para os cristãos', detail: 'Caridade conjugal — ternura.', icon: 'Heart' },
          { label: 'Contraste', detail: 'Duas visões antagônicas do casamento.', icon: 'Split' },
          { label: 'Pegadinha', detail: '«Para» parece finalidade — aqui é oposição de grupos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Duas visões antagônicas = oposição.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto histórico: pagãos × cristãos sobre amor conjugal.',
          'Primeiro bloco: amor subversivo; segundo: caridade conjugal.',
          'Estrutura paralela «Para os pagãos... Para os cristãos» — contraste.',
          'A causalidade exigiria motivo-consequência — eliminar.',
          'C adição somaria ideias sem contraste — eliminar.',
          'D conclusão usaria portanto/por isso — eliminar.',
          'E comparação igualaria (tão...quanto) — eliminar.',
          'Gabarito B — oposição.',
          'Em similares: «Para os pagãos / Para os cristãos» — paralelismo com sentido oposto = oposição.',
        ],
        footer_rule: 'B — oposição.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RELAÇÕES SEMÂNTICAS',
        rows: [
          { label: 'Oposição', value: 'Ideias contrárias — pagão × cristão.' },
          { label: 'Causalidade', value: 'Porque / visto que — motivo.' },
          { label: 'Adição', value: 'E, além disso — soma.' },
          { label: 'Conclusão', value: 'Portanto, por isso.' },
          { label: 'Nesta questão', value: 'B — oposição.' },
        ],
        footer_rule: 'Subversivo × ternura = oposição.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir paralelismo com adição',
        items: [
          { label: 'A — Causalidade', detail: 'Segundo parágrafo parece explicar o primeiro.', correct: 'São duas cosmovisões paralelas — não causa-efeito.' },
          { label: 'C — Adição', detail: 'Dois «Para...» parecem somar informações.', correct: 'Somam formato, mas o sentido é contrapor visões.' },
          { label: 'D — Conclusão', detail: '«Portanto» aparece depois no texto completo.', correct: 'No trecho pedido, relação é oposição direta.' },
          { label: 'E — Comparação', detail: 'Paralelismo sintático sugere comparação.', correct: 'Não há grau de semelhança — há antagonismo.' },
          { label: 'Em outra banca…', detail: 'Trocam pagãos por vikings.', correct: 'Mesmo contraste cultural.' },
        ],
        footer_rule: 'Só B — oposição.',
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
