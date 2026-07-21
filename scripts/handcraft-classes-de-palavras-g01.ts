#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g01 (8 slugs · Classes de palavras · lote 1).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g01.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g01 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g01 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g01';
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
    'artigo definido e indefinido',
    'substantivo comum próprio abstrato coletivo',
    'substantivação',
    'adjetivo × substantivo',
    'pergunta-teste M02',
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
      reviewer: 'handcraft:classes-de-palavras-g01',
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
  'avancasp-ag-classes-leia-o-trecho-a-seguir-um-caquizeiro-3709821': {
    family: 'conceito',
    source_tec_id: '3709821',
    source_note: 'Artigos Um/O — VF asserções Rubem Alves — AVANÇASP Ag Pref SM Arcanjo 2025 tec 3709821',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref SM Arcanjo)',
      orgao: 'Pref SM Arcanjo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o trecho a seguir:\n\n“Um caquizeiro foi plantado na Fazenda Santa Elisa ao lado de dois gigantescos pés de lichia que há mais de cinquenta anos vivem no final de um gramado. (...) O caquizeiro vai crescer em boa companhia, aprendendo da tranquilidade e bondade das árvores já velhas que serão suas mestras.”\n\nALVES, Rubem. Do universo à jabuticaba. 4. ed. São Paulo: Planeta do Brasil, 2025. p. 12.\n\nCom relação às classes de palavras, analise os itens a seguir e assinale a alternativa correta:\n\nI. Os termos “Um” e “O”, destacados no texto acima, são classificados como artigos.\n\nII. O primeiro é o artigo definido “Um”, que generaliza o caquizeiro, e o segundo é o artigo indefinido “O”, que especifica o mesmo caquizeiro.',
    options: [
      { id: 'A', text: 'A asserção I é uma proposição falsa, e a II é uma proposição verdadeira.', is_correct: false },
      { id: 'B', text: 'A asserção I é uma proposição verdadeira, e a II é uma proposição falsa.', is_correct: true },
      { id: 'C', text: 'As asserções I e II são proposições verdadeiras, e a II é um complemento da I.', is_correct: false },
      { id: 'D', text: 'As asserções I e II são proposições verdadeiras, mas a II não é um complemento da I.', is_correct: false },
      { id: 'E', text: 'As asserções I e II são proposições falsas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Artigo na frente do nome',
        chip_label: 'M02 — artigo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O que a palavra faz? Antecede substantivo → artigo.', icon: 'Focus' },
          { label: 'Um', detail: 'Artigo indefinido — apresenta o ser de modo genérico.', icon: 'Circle' },
          { label: 'O', detail: 'Artigo definido — retoma ou especifica o ser já conhecido.', icon: 'CheckCircle' },
          { label: 'I — verdadeira', detail: '«Um» e «O» são artigos — classe morfológica correta.', icon: 'Check' },
          { label: 'Pegadinha II', detail: 'Trocar definido/indefinido e generalizar/particularizar.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Artigo = antecede substantivo; um indefinido, o definido.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'I × II → gabarito',
        meta: slideMeta,
        steps: [
          'Comando: julgar asserções I e II sobre «Um» e «O» no trecho do caquizeiro.',
          'I: «Um» e «O» antecedem «caquizeiro» — função de artigo → proposição VERDADEIRA.',
          'II: diz que «Um» é definido e generaliza, e «O» é indefinido e especifica — INVERTEU tudo.',
          '«Um caquizeiro» = indefinido (primeira menção); «O caquizeiro» = definido (retoma).',
          'Eliminar A (I falsa), C/D (II verdadeira), E (ambas falsas).',
          'Gabarito B — I verdadeira, II falsa.',
          'Em similares: nomeie a classe (I) e depois teste definido × indefinido (II).',
        ],
        footer_rule: 'Um indefinido · O definido — não inverta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'ARTIGO DEFINIDO × INDEFINIDO',
        rows: [
          { label: 'Pergunta-teste', value: 'Antecede substantivo? → artigo.' },
          { label: 'Indefinido', value: 'Um, uma — apresenta, generaliza a primeira menção.' },
          { label: 'Definido', value: 'O, a — especifica, retoma o já citado.' },
          { label: 'Nesta questão', value: 'I certa (são artigos); II errada (trocou os papéis).' },
        ],
        footer_rule: 'Um apresenta · O retoma.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'VF — cada letra erra o par I/II',
        items: [
          { label: 'A — I falsa', detail: 'Trata I como falsa, mas «Um» e «O» são artigos.', correct: 'I é verdadeira — ambos antecedem substantivo.' },
          { label: 'C — II verdadeira', detail: 'Aceita a inversão definido/indefinido da asserção II.', correct: 'II é falsa — «Um» é indefinido; «O» é definido.' },
          { label: 'D — II verdadeira', detail: 'Mesmo erro de C, sem vínculo de complemento.', correct: 'II continua falsa pela troca de papéis.' },
          { label: 'E — ambas falsas', detail: 'Nega que «Um» e «O» sejam artigos.', correct: 'I é verdadeira — classe morfológica correta.' },
          { label: 'Em outra banca…', detail: 'Podem trocar por «Uma árvore» / «A árvore».', correct: 'Mesmo trilho: indefinido apresenta, definido retoma.' },
        ],
        footer_rule: 'Só B: I sim, II não.',
      },
    ],
  },

  'avancasp-mon-classes-schulz-charles-m-snoopy-jornal-da-ta-3739268': {
    family: 'conceito',
    source_tec_id: '3739268',
    source_note: 'Artigo um→o Snoopy — AVANÇASP Mon Pref Cunha 2025 tec 3739268',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Mon (Pref Cunha)',
      orgao: 'Pref Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'SCHULZ, Charles M. Snoopy. Jornal da Tarde. São Paulo, 29 ago. 2003.\n\nNa tirinha acima, a mudança de “um” para “o” pode ser descrita corretamente como:',
    options: [
      {
        id: 'A',
        text: 'uma sequência de palavras que generaliza e desvaloriza mais a referência ao cachorro, sem nenhuma mudança gramatical.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'uma sequência de palavras que particulariza e valoriza mais a referência ao cachorro, sem nenhuma mudança gramatical.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'a mudança do pronome indefinido para o pronome definido, generalizando e desvalorizando mais a referência ao cachorro.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'a mudança do artigo definido para o artigo indefinido, particularizando e valorizando mais a referência ao cachorro.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'a mudança do artigo indefinido para o artigo definido, particularizando e valorizando mais a referência ao cachorro.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Um → O na tirinha',
        chip_label: 'M02 — artigo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«um cachorro» → «o cachorro»: que classe? que efeito?', icon: 'Focus' },
          { label: 'Classe', detail: 'Um e o são artigos — não pronomes.', icon: 'Tag' },
          { label: 'Indefinido → definido', detail: 'Passa a tratar o cachorro como referente já conhecido.', icon: 'ArrowRight' },
          { label: 'Efeito discursivo', detail: 'Particulariza e pode valorizar («o» meu, «o» especial).', icon: 'Heart' },
          { label: 'Pegadinha', detail: 'Chamar de pronome ou inverter definido/indefinido.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Artigo: um indefinido → o definido.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tirinha Snoopy: troca «um» por «o» antes de «cachorro».',
          'Classe: artigos (antecedem substantivo) — eliminar C (pronome).',
          'Direção: de indefinido (um) para definido (o) — eliminar D (inverte).',
          'A fala em «generalizar» e «sem mudança gramatical» — eliminar.',
          'B acerta particularizar/valorizar, mas nega mudança gramatical — eliminar.',
          'E: artigo indefinido → definido, particulariza e valoriza — correto.',
          'Gabarito E.',
          'Em similares: identifique classe (artigo) + direção (indef. → def.).',
        ],
        footer_rule: 'E — artigo indefinido → definido.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'UM → O',
        rows: [
          { label: 'Classe', value: 'Artigo — não pronome.' },
          { label: 'Um', value: 'Indefinido — apresenta o ser.' },
          { label: 'O', value: 'Definido — particulariza/retoma.' },
          { label: 'Efeito', value: 'Pode valorizar a referência (Snoopy «o» cachorro).' },
          { label: 'Nesta questão', value: 'E — indefinido → definido.' },
        ],
        footer_rule: 'Mudança gramatical real — não é «sem mudança».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada distrator erra classe ou direção',
        items: [
          { label: 'A — generaliza', detail: '«Um» generaliza; «o» particulariza — sentido invertido.', correct: 'Indefinido apresenta; definido especifica — não generaliza.' },
          { label: 'B — sem mudança', detail: 'Nega a mudança gramatical entre artigos.', correct: 'Há mudança: indefinido → definido.' },
          { label: 'C — pronome', detail: 'Classifica um/o como pronomes.', correct: 'São artigos — antecedem o substantivo «cachorro».' },
          { label: 'D — definido → indefinido', detail: 'Inverte a direção da mudança.', correct: 'Foi de «um» (indef.) para «o» (def.).' },
          { label: 'Em outra banca…', detail: 'Trocam «cachorro» por «gato» ou «amigo».', correct: 'Mesmo teste: artigo + indefinido → definido.' },
        ],
        footer_rule: 'Só E descreve classe e efeito.',
      },
    ],
  },

  'avancasp-acs-classes-15-07-2026-19-33-1-88-3-4-5-6-dispon-3839425': {
    family: 'conceito',
    source_tec_id: '3839425',
    source_note: '«essencial» substantivo — AVANÇASP ACS Pref Potim 2026 tec 3839425',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Potim)',
      orgao: 'Pref Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Na sentença utilizada na figura acima, a palavra “essencial” funciona como um:',
    options: [
      { id: 'A', text: 'advérbio de modo.', is_correct: false },
      { id: 'B', text: 'advérbio de tempo.', is_correct: false },
      { id: 'C', text: 'adjetivo qualificando “olhos”.', is_correct: false },
      { id: 'D', text: 'adjetivo qualificando “invisível”.', is_correct: false },
      { id: 'E', text: 'substantivo acompanhado do artigo “o”.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'O essencial — nome',
        chip_label: 'M03 — substantivo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'A palavra nomeia ou qualifica? Com artigo «o»?', icon: 'Focus' },
          { label: 'O essencial', detail: '«O» + «essencial» = núcleo nominal — substantivo abstrato.', icon: 'Box' },
          { label: '≠ Adjetivo', detail: 'Adj. qualificaria «olhos» ou «invisível» diretamente.', icon: 'XCircle' },
          { label: '≠ Advérbio', detail: 'Advérbio modificaria verbo — não é o caso.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Palavra parecida com adjetivo, mas substantivada com artigo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Artigo + palavra = forte indício de substantivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Figura: frase tipo «O essencial é invisível» — foco em «essencial».',
          '«O» antecede «essencial» → artigo + núcleo nominal → substantivo.',
          'A/B advérbio: não modifica verbo/adj/adv — eliminar.',
          'C adj. de «olhos»: «essencial» não está ao lado de «olhos» — eliminar.',
          'D adj. de «invisível»: «essencial» não qualifica «invisível» — eliminar.',
          'E substantivo com artigo «o» — encaixa «O essencial».',
          'Gabarito E.',
          'Em similares: artigo + palavra = substantivo (muitas vezes abstrato).',
        ],
        footer_rule: 'O essencial = substantivo abstrato.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUBSTANTIVO COM ARTIGO',
        rows: [
          { label: 'Pergunta-teste', value: 'Nomeia ideia/coisa? Tem artigo?' },
          { label: 'O essencial', value: 'Substantivo abstrato — o que é fundamental.' },
          { label: '× adjetivo', value: 'Adj. qualificaria outro nome sem artigo próprio.' },
          { label: '× advérbio', value: 'Adv. circunstancia verbo/adj/adv.' },
          { label: 'Nesta questão', value: 'E — substantivo com «o».' },
        ],
        footer_rule: 'Artigo na frente → substantivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir nome com modificador',
        items: [
          { label: 'A — advérbio modo', detail: '«Essencial» não modifica verbo como «bem».', correct: 'Função nominal — não advérbial de modo.' },
          { label: 'B — advérbio tempo', detail: 'Não indica tempo («ontem», «hoje»).', correct: 'Nomeia conceito — substantivo abstrato.' },
          { label: 'C — adj. olhos', detail: 'Não está em construção «olhos essenciais».', correct: '«O essencial» é sintagma nominal autônomo.' },
          { label: 'D — adj. invisível', detail: 'Não qualifica «invisível» como «essencial invisível».', correct: '«Essencial» é núcleo; «invisível» é predicativo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «O importante é invisível».', correct: 'Mesma estrutura: artigo + abstrato = substantivo.' },
        ],
        footer_rule: 'E: substantivo com artigo o.',
      },
    ],
  },

  'avancasp-acs-classes-assinale-a-alternativa-cuja-palavra-4003512': {
    family: 'conceito',
    source_tec_id: '4003512',
    source_note: 'Substantivação «cinza» — AVANÇASP ACS Pref Taiúva 2026 tec 4003512',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Taiúva)',
      orgao: 'Pref Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa cuja palavra destacada está sendo substantivada, dando nome a uma categoria.',
    options: [
      { id: 'A', text: 'Desde que a vi, o cinza dos seus olhos me encantou.', is_correct: true },
      { id: 'B', text: 'Nossos bosques são mais verdes, como já dizia o poeta.', is_correct: false },
      { id: 'C', text: 'Entre vestido vermelho e azul, prefiro a primeira opção.', is_correct: false },
      { id: 'D', text: 'Dias azuis nem sempre dependem das condições meteorológicas.', is_correct: false },
      { id: 'E', text: 'A pomba branca representa a paz, desde tempos imemoriais.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cor vira nome',
        chip_label: 'M03 — substantivação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'A palavra nomeia categoria (cor, ideia) ou só qualifica?', icon: 'Focus' },
          { label: 'O cinza', detail: 'Artigo + cor → substantivo: a tonalidade cinza.', icon: 'Palette' },
          { label: 'Verdes / azuis', detail: 'Adjetivos qualificando «bosques», «dias».', icon: 'Paintbrush' },
          { label: 'Vermelho / azul', detail: 'Adjuntos de «vestido» — cor do objeto.', icon: 'Shirt' },
          { label: 'Pegadinha', detail: 'Cor adjetiva parece substantivo — teste artigo + núcleo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Artigo + cor = substantivação.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: palavra destacada substantivada (dá nome a categoria).',
          'A «o cinza dos seus olhos»: artigo + cor = nome da tonalidade → substantivação.',
          'B «verdes» qualifica «bosques» — adjetivo — eliminar.',
          'C «vermelho e azul» qualificam «vestido» — adjetivo — eliminar.',
          'D «azuis» qualifica «dias» — adjetivo — eliminar.',
          'E «branca» qualifica «pomba» — adjetivo — eliminar.',
          'Gabarito A.',
          'Em similares: «o verde», «o azul», «um belo» — artigo denuncia substantivo.',
        ],
        footer_rule: 'O cinza = substantivo (cor como nome).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUBSTANTIVAÇÃO',
        rows: [
          { label: 'Pergunta-teste', value: 'Tem artigo? Nomeia categoria (cor, qualidade)?' },
          { label: 'Padrão', value: 'O/A + adjetivo ou cor → substantivo abstrato/concreto.' },
          { label: 'Adj. normal', value: 'Cor junto ao nome: «olhos cinzentos», «dias azuis».' },
          { label: 'Nesta questão', value: 'A — o cinza (substantivo)' },
          { label: 'Demais', value: 'B–E: cores/adjetivos qualificando substantivo.' },
        ],
        footer_rule: 'O cinza ≠ olhos cinzentos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Adjetivo de cor × substantivo',
        items: [
          { label: 'B — verdes', detail: 'Qualifica «bosques», não nomeia categoria isolada.', correct: 'Adjetivo — «bosques verdes».' },
          { label: 'C — vermelho/azul', detail: 'Especificam cor do vestido.', correct: 'Adjuntos adnominais — não substantivação.' },
          { label: 'D — azuis', detail: 'Qualifica «dias» (metáfora), mas função adjetival.', correct: '«Dias azuis» — adjetivo, não «o azul».' },
          { label: 'E — branca', detail: 'Qualifica «pomba».', correct: 'Adjetivo — «pomba branca».' },
          { label: 'Em outra banca…', detail: 'Trocam por «o verde da esperança».', correct: 'Artigo + cor = substantivo (mesmo trilho de A).' },
        ],
        footer_rule: 'Só A substantiva a cor.',
      },
    ],
  },

  'avancasp-acs-classes-sao-palavras-que-designam-os-seres-r-3352961': {
    family: 'conceito',
    source_tec_id: '3352961',
    source_note: 'Classificação substantivos Egito/rebanho — AVANÇASP ACS Pref Amparo 2025 tec 3352961',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Amparo (SP))',
      orgao: 'Pref Amparo (SP)',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Substantivos são palavras que designam os seres. Relacione cada substantivo à sua classificação.\n\nI. Ela finalmente realizou seu sonho de visitar o Egito.\n\nII. O rebanho fugiu após a tempestade ter derrubado a cerca.\n\nIII. Ela foi morar em outro país, mas sentia saudade de sua família.\n\nIV. Os meninos correram para pegar a bola.\n\nLegenda: a) substantivo comum · b) substantivo coletivo · c) substantivo abstrato · d) substantivo próprio\n\nIndique a alternativa que estabelece as relações corretamente.',
    options: [
      { id: 'A', text: 'I – d; II – b; III – a; IV – a.', is_correct: true },
      { id: 'B', text: 'I – d; II – c; III – b; IV – a.', is_correct: false },
      { id: 'C', text: 'I – a; II – b; III – d; IV – c.', is_correct: false },
      { id: 'D', text: 'I – d; II – b; III – c; IV – a.', is_correct: false },
      { id: 'E', text: 'I – d; II – c; III – b; IV – a.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tipo de substantivo',
        chip_label: 'M03 — classificação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Nome próprio? Coletivo? Abstrato? Comum?', icon: 'Focus' },
          { label: 'Egito (I)', detail: 'Topônimo — substantivo próprio (d).', icon: 'MapPin' },
          { label: 'Rebanho (II)', detail: 'Conjunto de animais — coletivo (b).', icon: 'Users' },
          { label: 'País (III)', detail: 'Ser genérico — comum (a).', icon: 'Globe' },
          { label: 'Meninos (IV)', detail: 'Seres em geral — comum (a).', icon: 'User' },
        ],
        footer_rule: 'Um substantivo por item — classifique o foco da frase.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: relacionar I–IV à legenda a/b/c/d.',
          'I «Egito»: nome de lugar → próprio (d).',
          'II «rebanho»: designa conjunto → coletivo (b).',
          'III «país»: ser genérico → comum (a) — não confundir com «saudade» (abstrato).',
          'IV «meninos»: seres da espécie → comum (a).',
          'Sequência: I-d, II-b, III-a, IV-a → letra A.',
          'Gabarito A.',
          'Em similares: um tipo por linha — não misture país (comum) com Egito (próprio).',
        ],
        footer_rule: 'I-d · II-b · III-a · IV-a.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TIPOS DE SUBSTANTIVO',
        rows: [
          { label: 'Próprio (d)', value: 'Nome próprio: Egito, Silvana, Brasil.' },
          { label: 'Coletivo (b)', value: 'Conjunto: rebanho, cardume, enxame.' },
          { label: 'Comum (a)', value: 'Ser genérico: país, meninos, bola.' },
          { label: 'Abstrato (c)', value: 'Ideia/sentimento: saudade, alegria.' },
          { label: 'Nesta questão', value: 'A — I-d; II-b; III-a; IV-a' },
        ],
        footer_rule: 'Próprio tem maiúscula; coletivo = grupo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar tipo em cada linha',
        items: [
          { label: 'B — II-c / III-b', detail: '«Rebanho» não é abstrato; «país» não é coletivo.', correct: 'II = coletivo (b); III = comum (a).' },
          { label: 'C — I-a / III-d', detail: 'Egito é próprio, não comum; país não é próprio.', correct: 'I = Egito (d); III = país (a).' },
          { label: 'D — III-c', detail: 'Foca «saudade» em vez de «país» da frase.', correct: 'Item III pede «país» → comum (a).' },
          { label: 'E — II-c', detail: 'Trata rebanho como abstrato.', correct: 'Rebanho = coletivo de animais (b).' },
          { label: 'Em outra banca…', detail: 'Trocam Egito por «Paris» ou rebanho por «cardume».', correct: 'Mesma legenda: próprio, coletivo, comum.' },
        ],
        footer_rule: 'Só A fecha o mapa inteiro.',
      },
    ],
  },

  'avancasp-ace-classes-substantivos-sao-palavras-que-design-3353964': {
    family: 'conceito',
    source_tec_id: '3353964',
    source_note: 'Classificação Indonésia/Silvana/alegria — AVANÇASP ACEVA Pref Amparo 2025 tec 3353964',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACEVA (Pref Amparo (SP))',
      orgao: 'Pref Amparo (SP)',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Substantivos são palavras que designam os seres. Relacione cada substantivo à sua classificação.\n\nI. Fizeram uma viagem internacional e visitaram o arquipélago da Indonésia.\n\nII. Ela deu à luz uma menina, Silvana.\n\nIII. Havia galos na vizinhança que cantavam às 5h da manhã.\n\nIV. Sentiu imensa alegria ao rever o amigo.\n\nLegenda: a) substantivo comum · b) substantivo coletivo · c) substantivo abstrato · d) substantivo próprio\n\nIndique a alternativa que estabelece as relações corretamente.',
    options: [
      { id: 'A', text: 'I – a; II – d; III – b; IV – c.', is_correct: false },
      { id: 'B', text: 'I – d; II – a; III – a; IV – c.', is_correct: false },
      { id: 'C', text: 'I – a; II – a; III – b; IV – d.', is_correct: false },
      { id: 'D', text: 'I – d; II – d; III – a; IV – c.', is_correct: true },
      { id: 'E', text: 'I – d; II – a; III – b; IV – c.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mapa I–IV',
        chip_label: 'M03 — classificação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Próprio, comum, coletivo ou abstrato?', icon: 'Focus' },
          { label: 'Indonésia (I)', detail: 'Topônimo — próprio (d).', icon: 'MapPin' },
          { label: 'Silvana (II)', detail: 'Nome de pessoa — próprio (d).', icon: 'User' },
          { label: 'Galos (III)', detail: 'Seres da espécie — comum (a).', icon: 'Bird' },
          { label: 'Alegria (IV)', detail: 'Sentimento — abstrato (c).', icon: 'Heart' },
        ],
        footer_rule: 'Foque o substantivo-chave de cada item.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificar substantivo de cada trecho I–IV.',
          'I «Indonésia»: país próprio → (d).',
          'II «Silvana»: antropônimo → (d).',
          'III «galos»: plural comum — não é coletivo → (a).',
          'IV «alegria»: ideia/sentimento → abstrato (c).',
          'Sequência I-d, II-d, III-a, IV-c → letra D.',
          'Gabarito D.',
          'Em similares: coletivo = um nome para o grupo (rebanho); «galos» é comum plural.',
        ],
        footer_rule: 'I-d · II-d · III-a · IV-c.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUATRO TIPOS',
        rows: [
          { label: 'Próprio (d)', value: 'Indonésia, Silvana — nomes próprios.' },
          { label: 'Comum (a)', value: 'Galos — seres genéricos (plural comum).' },
          { label: 'Abstrato (c)', value: 'Alegria — sentimento/ideia.' },
          { label: 'Coletivo (b)', value: 'Um nome para o grupo — não «galos».' },
          { label: 'Nesta questão', value: 'D — I-d; II-d; III-a; IV-c' },
        ],
        footer_rule: 'Galos ≠ coletivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erro típico por item',
        items: [
          { label: 'A — I-a', detail: 'Trata «Indonésia» como comum.', correct: 'Indonésia = topônimo próprio (d).' },
          { label: 'B — II-a', detail: '«Silvana» é nome próprio, não comum.', correct: 'Antropônimo → (d).' },
          { label: 'C — III-b', detail: '«Galos» plural comum, não coletivo.', correct: 'Coletivo seria «bando» — galos = comum (a).' },
          { label: 'E — III-b', detail: 'Repete erro de coletivo em «galos».', correct: 'III = comum (a), não coletivo.' },
          { label: 'Em outra banca…', detail: 'Trocam Silvana por «Maria» e alegria por «coragem».', correct: 'Mesmo mapa: próprio, comum, abstrato.' },
        ],
        footer_rule: 'Só D fecha I–IV.',
      },
    ],
  },

  'cpcon-uepb-a-classes-utilize-o-texto-05-para-responder-a-3599763': {
    family: 'conceito',
    source_tec_id: '3599763',
    source_note: 'Aipim/mandioca substantivos — CPCON UEPB Ag Pref Nova Palmeira 2025 tec 3599763',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag (Pref Nova Palmeira)',
      orgao: 'Pref Nova Palmeira',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Utilize o Texto 05 para responder à questão abaixo.\n\nTexto 05\nFonte: OLIVEIRA, Louise. Variação linguística: o que é e exemplos. Norma Culta, s.d. Disponível em: <normaculta.com>. Acesso em: 2 abr. 2025.\n\nDo ponto de vista morfológico, aipim, mandioca e macaxeira são exemplos de:',
    options: [
      { id: 'A', text: 'adjetivos.', is_correct: false },
      { id: 'B', text: 'substantivos.', is_correct: true },
      { id: 'C', text: 'pronomes.', is_correct: false },
      { id: 'D', text: 'verbos.', is_correct: false },
      { id: 'E', text: 'advérbios.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nome da planta',
        chip_label: 'M02 — classe',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Aipim, mandioca, macaxeira — nomeiam ou modificam?', icon: 'Focus' },
          { label: 'Texto 05', detail: 'Variação linguística regional — mesma planta, nomes diferentes.', icon: 'FileText' },
          { label: 'Aipim / mandioca', detail: 'Designam planta/alimento — substantivos comuns.', icon: 'Leaf' },
          { label: 'Macaxeira', detail: 'Outro nome regional — ainda substantivo comum.', icon: 'Map' },
          { label: 'Morfologia', detail: 'Classe gramatical: nome de coisa → substantivo.', icon: 'Tag' },
        ],
        footer_rule: 'Nome de coisa = substantivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto 05 (Oliveira / Norma Culta): variação linguística — aipim, mandioca, macaxeira.',
          'Do ponto de vista morfológico: as três palavras nomeiam a mesma planta → substantivos.',
          'A adjetivo: não caracterizam outro nome — eliminar.',
          'C pronome: não substituem nomes — eliminar.',
          'D verbo: não indicam ação — eliminar.',
          'E advérbio: não circunstanciam — eliminar.',
          'Gabarito B — substantivos.',
          'Em similares: sinônimos regionais (aipim/mandioca/macaxeira) = substantivo comum.',
        ],
        footer_rule: 'B — substantivos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NOMEIA COISA → SUBSTANTIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Aipim, mandioca, macaxeira — nomeiam coisa?' },
          { label: 'Texto 05', value: 'Variação linguística regional (Oliveira).' },
          { label: 'Morfologia', value: 'Nome de planta/alimento → substantivo comum.' },
          { label: 'Nesta questão', value: 'B — substantivos (aipim, mandioca, macaxeira)' },
        ],
        footer_rule: 'Morfologia: nome = substantivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras classes não encaixam',
        items: [
          { label: 'A — adjetivos', detail: 'Adjetivos qualificariam substantivo («batata doce»).', correct: 'São nomes da planta — substantivos comuns.' },
          { label: 'C — pronomes', detail: 'Pronomes substituem ou acompanham nome.', correct: 'Aipim/mandioca nomeiam diretamente — substantivo.' },
          { label: 'D — verbos', detail: 'Verbos indicam ação/estado/fenômeno.', correct: 'Não há ação — nomes de objeto (substantivo).' },
          { label: 'E — advérbios', detail: 'Advérbios modificam verbo/adj/adv.', correct: 'Função nominal — substantivo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «abacaxi/ananas» ou «abóbora/jerimum».', correct: 'Mesmo teste: variação lexical = substantivo.' },
        ],
        footer_rule: 'Só B — substantivos.',
      },
    ],
  },

  'avancasp-tla-classes-quando-o-verde-dos-teus-olhosse-espa-3726050': {
    family: 'conceito',
    source_tec_id: '3726050',
    source_note: '«verde» substantivo Asa Branca — AVANÇASP TLab Pref Varginha 2025 tec 3726050',
    meta: {
      banca: 'AVANÇASP',
      prova: 'TLab (Pref Varginha)',
      orgao: 'Pref Varginha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '“Quando o verde dos teus olhos\nSe espalhar na plantação\nEu te asseguro, não chore não, viu?\nQue eu voltarei, viu, meu coração?”\n(Asa Branca, de Luiz Gonzaga)\n\nEm relação às palavras empregadas na letra de música acima, é correto afirmar que:',
    options: [
      {
        id: 'A',
        text: '“verde” é de natureza adjetiva, qualificando diretamente o substantivo “olhos”.',
        is_correct: false,
      },
      {
        id: 'B',
        text: '“verde” é de natureza substantiva, dando nome à cor a que se refere.',
        is_correct: true,
      },
      {
        id: 'C',
        text: '“espalhar” é uma forma verbal que remete diretamente a “eu”, o autor do texto.',
        is_correct: false,
      },
      { id: 'D', text: '“chore” é uma forma verbal que se refere a uma ação real no tempo presente.', is_correct: false },
      {
        id: 'E',
        text: '“voltarei” é uma forma verbal cujo tempo se refere a uma ação incerta, duvidosa no futuro.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'O verde dos olhos',
        chip_label: 'M03 — substantivação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«O verde» nomeia cor ou qualifica «olhos»?', icon: 'Focus' },
          { label: 'O verde', detail: 'Artigo + cor → substantivo (nome da tonalidade).', icon: 'Palette' },
          { label: 'Dos teus olhos', detail: 'Adjunto — indica de onde é o verde.', icon: 'Eye' },
          { label: 'Espalhar / chore', detail: 'Formas verbais — outras alternativas testam verbo.', icon: 'Zap' },
          { label: 'Pegadinha', detail: 'Achar que «verde» é adjetivo de «olhos».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'O verde = substantivo (cor como nome).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Letra Asa Branca: «Quando o verde dos teus olhos se espalhar…»',
          '«O verde» — artigo + palavra de cor → substantivo (nome da cor).',
          'A diz adjetivo direto em «olhos» — estrutura é «o verde [dos olhos]» — eliminar.',
          'C «espalhar»: forma verbal com sujeito «o verde» (não «eu») — eliminar.',
          'D «chore»: imperativo/subjuntivo, não presente real — eliminar.',
          'E «voltarei»: futuro de certeza/promessa, não dúvida — eliminar.',
          'Gabarito B — verde substantivo.',
          'Em similares: artigo antes da cor = substantivação.',
        ],
        footer_rule: 'B — verde substantivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'O VERDE = SUBSTANTIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Artigo + cor → substantivo.' },
          { label: 'O verde', value: 'Nome da cor — substantivo concreto/abstrato.' },
          { label: '× adjetivo', value: 'Seria «olhos verdes» sem artigo no «verde».' },
          { label: 'Verbos na letra', value: 'espalhar, chore, voltarei — outras alternativas.' },
          { label: 'Nesta questão', value: 'B — verde substantivo' },
        ],
        footer_rule: 'O verde dos olhos ≠ olhos verdes.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra testa outra classe',
        items: [
          { label: 'A — adjetivo', detail: '«Verde» não está adjunto direto: é núcleo de «o verde».', correct: 'Substantivo — «o verde» nomeia a cor.' },
          { label: 'C — espalhar / eu', detail: 'Sujeito da oração é «o verde», não o eu lírico.', correct: '«O verde se espalhar» — sujeito substantivo.' },
          { label: 'D — chore presente', detail: '«Não chore» é imperativo/nexo subjuntivo, não presente indicativo.', correct: 'Forma verbal de comando/depuração — não presente real.' },
          { label: 'E — voltarei incerto', detail: 'Futuro «voltarei» expressa promessa/certitude na letra.', correct: 'Não é futuro duvidoso — é compromisso do eu lírico.' },
          { label: 'Em outra banca…', detail: 'Trocam por «o azul do céu» ou «o branco da neve».', correct: 'Mesma substantivação: artigo + cor.' },
        ],
        footer_rule: 'Só B descreve «verde».',
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
