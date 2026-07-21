#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g04 (8 slugs · Crase).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g04.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g04 --strict-v2-pedagogy
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_CRASE_CONCURSOS } from '@/lib/guidelines/linguaPortuguesa/crase';

const LOTE = 'lingua-portuguesa-g04';
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
  'vunesp-sertaozinho-crase-lacunas-armandinho-3352615': 'lacunas',
  'caderno-pt-crase-erro-acento-segunda-sexta-3374822': 'eliminacao',
  'vunesp-itapevi-crase-pronome-demonstrativo-3419180': 'eliminacao',
  'caderno-pt-crase-solidao-lacunas-3460044': 'lacunas',
  'caderno-pt-crase-pronome-demonstrativo-3554846': 'eliminacao',
  'vunesp-itatiba-crase-lacunas-demencia-3583296': 'lacunas',
  'vunesp-itatiba-crase-lacunas-obras-arte-3583413': 'lacunas',
  'vunesp-osasco-crase-lacunas-tira-3607078': 'lacunas',
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
      reviewer: 'handcraft:lingua-portuguesa-g04',
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
  'vunesp-sertaozinho-crase-lacunas-armandinho-3352615': {
    family: 'conceito',
    source_tec_id: '3323742',
    source_note:
      'Crase lacunas Armandinho — VUNESP Aux Sau Buc Pref Osasco 2025 tec 3323742 (slug legado termina em 3352615)',
    meta: {
      banca: 'VUNESP',
      prova: 'Aux Sau Buc (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tirinha a seguir para responder à questão.\n(Alexandre Beck. Armandinho.)\nAssinale a alternativa que preenche, correta e respectivamente, as lacunas da frase a seguir.\nHabituar-se ___ lavar sempre as mãos, adaptar-se ___ boa alimentação e disseminar ___ importância do SUS e da universidade pública.',
    options: [
      { id: 'A', text: 'a … à … à', is_correct: false },
      { id: 'B', text: 'a … à … a', is_correct: true },
      { id: 'C', text: 'a … a … à', is_correct: false },
      { id: 'D', text: 'à … a … a', is_correct: false },
      { id: 'E', text: 'à … à … à', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '3 reflexivos — funil M11',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Habituar-se a', detail: 'Verbo reflexivo + infinitivo — a lavar, sem crase.', icon: 'Hand' },
          { label: 'Adaptar-se à', detail: 'Adaptar-se a + boa alimentação (fem.) → à.', icon: 'Apple' },
          { label: 'Disseminar a', detail: 'Disseminar a importância — OD com a simples.', icon: 'Megaphone' },
          { label: 'SUS / universidade', detail: 'Tema da tirinha — saúde pública e educação.', icon: 'Building2' },
        ],
        footer_rule: 'Reflexivo + infinitivo nunca leva crase.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Lacuna a lacuna',
        chip_label: 'Um toque = um teste',
        meta: slideMeta,
        steps: [
          'Comando: 3 buracos em verbos reflexivos — só uma sequência passa.',
          '1ª: «habituar-se ___ lavar» — infinitivo → a. Corta D/E (à).',
          '2ª: «adaptar-se ___ boa alimentação» — a + a boa → à.',
          '3ª: «disseminar ___ importância» — disseminar a importância → a.',
          'A erra na 3ª (à importância forçada); C na 2ª; D/E crase no reflexivo.',
          'Sequência: a / à / a — gabarito B.',
          'Em similares: habituar-se a + adaptar-se à + disseminar a.',
          'Teste ao: habituar-se ao hábito — reflexivo masc. sem crase.',
        ],
        footer_rule: 'B = a … à … a.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: 'REFLEXIVO + INFINITIVO',
        rows: [
          { label: 'Reflexivo', value: 'habituar-se a lavar — verbo barra crase' },
          { label: 'OD fem.', value: 'adaptar-se à boa alimentação — a+a' },
          { label: 'Disseminar', value: 'disseminar a importância — a simples' },
          { label: 'Nesta questão', value: 'a … à … a' },
        ],
        footer_rule: 'Infinitivo após -se = sempre a.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o funil barra',
        meta: slideMeta,
        content: 'Crase em série nos reflexivos',
        items: [
          { label: 'A — à importância', detail: 'Terceira lacuna com crase «culta».', correct: 'Disseminar a importância — sem fusão a+a clara.' },
          { label: 'C — a alimentação', detail: '«Adaptar-se a boa alimentação» omite crase.', correct: 'Adaptar-se à boa alimentação — OD fem. determinado.' },
          { label: 'D — à lavar', detail: 'Crase no infinitivo após -se.', correct: 'Habituar-se a lavar — reflexivo + infinitivo.' },
          { label: 'E — tripla crase', detail: 'Simetria visual nas três lacunas.', correct: 'Só a 2ª pede crase (a + a boa alimentação).' },
          { label: 'Em outra banca…', detail: 'Trocam SUS por vacinação ou higiene.', correct: 'Mesmo funil: -se a + adaptar-se à + disseminar a.' },
        ],
        footer_rule: 'B passa: habituar-se a · adaptar-se à · disseminar a.',
      },
    ],
  },

  'caderno-pt-crase-erro-acento-segunda-sexta-3374822': {
    family: 'conceito',
    source_tec_id: '3374822',
    source_note: 'Crase erro — caderno PT segunda à sexta tec 3374822',
    meta: { banca: 'Caderno PT', prova: 'Crase — erro de acento', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction: 'Identifique a alternativa que possui erro no acento grave:',
    options: [
      { id: 'A', text: 'Hoje à noite eu irei para a praia.', is_correct: false },
      { id: 'B', text: 'O nosso encontro será às 18 horas.', is_correct: false },
      { id: 'C', text: 'O cabelo de Felipe está à moda de Neymar.', is_correct: false },
      { id: 'D', text: 'O funcionamento é de segunda à sexta.', is_correct: true },
      { id: 'E', text: 'Nossos pais foram à igreja todos os domingos de março.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ache o erro',
        meta: slideMeta,
        items: [
          { label: 'Hoje à noite', detail: '«Hoje à noite eu irei para a praia» — locução fem. correta (A).', icon: 'Moon' },
          { label: 'Às horas do encontro', detail: '«O nosso encontro será às horas marcadas» — hora pontual (B).', icon: 'Clock' },
          { label: 'Felipe / Neymar', detail: '«O cabelo de Felipe está à moda de Neymar» — locução (C).', icon: 'Sparkles' },
          { label: 'Segunda a sexta', detail: '«De segunda à sexta» — intervalo: erro em D.', icon: 'Calendar' },
          { label: 'À igreja', detail: '«Nossos pais foram à igreja todos os domingos de março» (E).', icon: 'Church' },
        ],
        footer_rule: 'Intervalo temporal = de X a Y — sem crase.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual frase tem ERRO de acento grave — elimine as corretas.',
          'A: «Hoje à noite» + praia — locução adverbial fem. → correta.',
          'B: «encontro será às horas marcadas» — hora pontual → correta.',
          'C: «cabelo de Felipe» à moda de Neymar — locução prepositiva → correta.',
          'E: «pais foram à igreja» nos domingos de março → correta.',
          'D: «funcionamento é de segunda à sexta» — intervalo pede a simples.',
          'Correto: de segunda a sexta — gabarito D (a incorreta).',
          'Em similares: de janeiro a março · das 8 às 18 (hora sim!).',
        ],
        footer_rule: 'D erra: segunda a sexta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Intervalo × hora',
        meta: slideMeta,
        content: 'DE SEGUNDA A SEXTA',
        rows: [
          { label: 'Intervalo', value: 'de segunda a sexta — sem crase (D erra)' },
          { label: 'Hora', value: 'encontro às horas marcadas — com crase (B)' },
          { label: 'Locução', value: 'à noite · à moda de Neymar — com crase (A/C)' },
          { label: 'Destino', value: 'à igreja nos domingos de março (E)' },
        ],
        footer_rule: 'Dias da semana em sequência = a simples.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase «bonita» no intervalo',
        slide_title: 'Pegadinhas',
        items: [
          { label: 'A — parece errado', detail: '«À noite» confunde quem craseia tudo.', correct: 'À noite é locução adverbial fem. — correta.' },
          { label: 'B — às horas', detail: 'Aluno acha que hora não leva crase.', correct: 'Encontro às horas marcadas — hora determinada exige crase.' },
          { label: 'C — moda', detail: '«A moda» sem crase parece oral.', correct: 'À moda de — locução prepositiva fixa.' },
          { label: 'E — igreja', detail: '«A igreja» sem crase no destino.', correct: 'Fomos à igreja — destino fem. com crase.' },
          { label: 'Em outra banca…', detail: 'Trocam por «de 2020 à 2025» (ano).', correct: 'Intervalo de tempo/dia = a simples entre os extremos.' },
        ],
        footer_rule: 'D é a única incorreta.',
      },
    ],
  },

  'vunesp-itapevi-crase-pronome-demonstrativo-3419180': {
    family: 'conceito',
    source_tec_id: '3419180',
    source_note: 'Crase pronome demonstrativo — VUNESP Pref. Itapevi 2025 tec 3419180',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itapevi)',
      orgao: 'Pref. Itapevi',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Segundo a norma gramatical, não se deve empregar o acento indicador de crase diante de qualquer pronome demonstrativo. Dentre os casos apresentados a seguir, está incorreto, portanto, o emprego do acento apenas em:',
    options: [
      { id: 'A', text: 'Não dei tanta importância àquilo, pois sabia que era mentira.', is_correct: false },
      { id: 'B', text: 'Caminharemos rumo àquele monte.', is_correct: false },
      { id: 'C', text: 'Essas comidas são semelhantes às do hotel.', is_correct: false },
      { id: 'D', text: 'A falta de respeito à essa garota o assustava.', is_correct: true },
      { id: 'E', text: 'O professor deu um castigo àqueles baderneiros.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Demonstrativo bloqueia',
        meta: slideMeta,
        items: [
          { label: 'Àquilo / mentira', detail: '«Não dei importância àquilo, pois sabia que era mentira» (A).', icon: 'MapPin' },
          { label: 'Àquele monte', detail: '«Caminharemos rumo àquele monte» — composto (B).', icon: 'Mountain' },
          { label: 'Às do hotel', detail: '«Comidas semelhantes às do hotel» — artigo plural (C).', icon: 'Utensils' },
          { label: 'À essa garota', detail: '«Respeito à essa garota» — ERRO: a essa (D).', icon: 'AlertTriangle' },
          { label: 'Àqueles baderneiros', detail: '«Castigo àqueles baderneiros» — professor (E).', icon: 'Users' },
        ],
        footer_rule: 'Nunca «à essa/à esse/à aquele» separado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Enunciado: crase proibida diante de pronome demonstrativo — ache o erro.',
          'A: «àquilo» + mentira — pronome composto, crase legítima.',
          'B: «rumo àquele monte» — mesmo caso.',
          'C: «semelhantes às do hotel» — artigo + OD, não «essa» solta.',
          'E: «castigo àqueles baderneiros» — pronome composto.',
          'D: «falta de respeito à essa garota» — crase antes de «essa».',
          'Correto: a essa garota — gabarito D.',
          'Em similares: respeito a essa decisão · rumo a esse lugar.',
        ],
        footer_rule: 'D = à essa (incorreto).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Demonstrativo × artigo',
        meta: slideMeta,
        content: 'NÃO: À ESSA',
        rows: [
          { label: 'Errado', value: 'à essa / à esse / à isto' },
          { label: 'Certo', value: 'a essa garota — sem crase' },
          { label: 'Composto OK', value: 'àquele · àquilo — crase no pronome' },
          { label: 'Comparativo', value: 'semelhantes às do hotel — artigo, não «essa»' },
        ],
        footer_rule: 'Demonstrativo simples barra crase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir composto com simples',
        slide_title: 'Por que não são D',
        items: [
          { label: 'A — àquilo', detail: 'Parece «demonstrativo com crase proibida».', correct: 'Àquilo é forma composta — crase faz parte do pronome.' },
          { label: 'B — àquele', detail: 'Mesma pegadinha de A.', correct: 'Àquele monte — pronome composto, não «a + aquele».' },
          { label: 'C — às do hotel', detail: 'Plural com crase atrai.', correct: 'Comparativo às comidas do hotel — artigo definido.' },
          { label: 'E — àqueles', detail: 'Plural composto parece errado.', correct: 'Àqueles baderneiros — crase no pronome composto.' },
          { label: 'Em outra banca…', detail: 'Pedem correção de «à isto» ou «à aquela».', correct: 'Demonstrativo simples: sempre a essa/esse/isto.' },
        ],
        footer_rule: 'D: à essa garota → a essa garota.',
      },
    ],
  },

  'caderno-pt-crase-solidao-lacunas-3460044': {
    family: 'text_fragment',
    source_tec_id: '3460044',
    source_note: 'Crase lacunas — caderno PT solidão/Vivek Murthy (Estadão) tec 3460044',
    meta: { banca: 'Caderno PT', prova: 'Crase — lacunas editorial solidão', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Considere as frases elaboradas a partir do texto.\nA solidão pode ser um estímulo para que estejamos atentos ___ uma necessidade básica: a de nos conectar.\nEm seu relatório, Vivek Murthy dá ênfase ___ situações em que a solidão está atrelada a um agravamento da saúde física e mental.\nO cirurgião adverte que a mortalidade pelo impacto de se estar socialmente desconectado é similar ___ mortalidade causada pelo fumo.\nAtendendo à norma-padrão de emprego do sinal indicativo de crase, as lacunas devem ser preenchidas, respectivamente, por:',
    text_fragment:
      '<p><strong>Por que agora a solidão nos adoece?</strong></p><p>Para <strong>Vivek Murthy</strong>, cirurgião-geral dos EUA, a solidão é estímulo para nos conectarmos em grupos sociais. Hoje ela se associa a risco cardiovascular, demência, depressão e morte prematura — impacto comparável a fumar até 15 cigarros por dia.</p><p>O Japão criou um «Ministério da Solidão»; no Reino Unido, uma secretária combate o isolamento. <em>Leon Ferrari — Estadão, adaptado</em></p>',
    options: [
      { id: 'A', text: 'a; a; à', is_correct: true },
      { id: 'B', text: 'a; à; à', is_correct: false },
      { id: 'C', text: 'à; a; a', is_correct: false },
      { id: 'D', text: 'à; à; à', is_correct: false },
      { id: 'E', text: 'à; a; à', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '3 lacunas no editorial',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Solidão / adoece', detail: '«Por que a solidão nos adoece?» — título do texto Estadão.', icon: 'HeartPulse' },
          { label: 'Murthy / cirurgião', detail: 'Vivek Murthy, cirurgião-geral: cardiovascular, demência, depressão.', icon: 'Stethoscope' },
          { label: 'Grupos sociais', detail: 'Solidão estimula conexão em grupos sociais — 1ª lacuna: a.', icon: 'Users' },
          { label: 'Ênfase a', detail: 'Murthy dá ênfase a situações de agravamento da saúde.', icon: 'Megaphone' },
          { label: 'Similar à mortalidade', detail: 'Mortalidade pelo fumo e cigarros — 3ª lacuna: à.', icon: 'Scale' },
        ],
        footer_rule: 'Ênfase a ≠ similar à (comparativo + OD fem.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto (Estadão): «Por que agora a solidão nos adoece?» — Murthy, cirurgião-geral dos EUA.',
          'Contexto: grupos sociais, risco cardiovascular, demência, depressão e cigarros por dia.',
          '1ª: «atentos ___ uma necessidade básica» — atentos a → a.',
          '2ª: «Murthy dá ênfase ___ situações» de saúde física e mental — ênfase a → a.',
          '3ª: «similar ___ mortalidade causada pelo fumo» — similar à mortalidade → à.',
          'Sequência: a / a / à — gabarito A.',
          'B erra na 2ª (à situações); C/D/E na 1ª ou 3ª.',
          'Funil: comparativo + OD fem. = crase na 3ª.',
        ],
        footer_rule: 'A = a; a; à.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '3 LACUNAS NO TEXTO',
        rows: [
          { label: 'Atentos', value: 'atentos a uma necessidade — a' },
          { label: 'Ênfase', value: 'ênfase a situações — a (sem crase)' },
          { label: 'Similar', value: 'similar à mortalidade — a+a fem.' },
          { label: 'Nesta questão', value: 'a; a; à' },
        ],
        footer_rule: 'Ênfase a — nunca «à situações».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase no comparativo ou na ênfase',
        slide_title: 'Pegadinhas',
        items: [
          { label: 'B — ênfase à', detail: '«Dá ênfase à situações» parece formal.', correct: 'Dar ênfase a situações — regência com a simples.' },
          { label: 'C — atentos à', detail: 'Crase na 1ª lacuna.', correct: 'Atentos a uma necessidade — sem artigo fem. claro.' },
          { label: 'D — tripla crase', detail: 'Simetria em todas as lacunas.', correct: 'Só a 3ª (similar à mortalidade) pede crase.' },
          { label: 'E — à na 1ª', detail: 'Mistura crase inicial com a na 2ª.', correct: '1ª e 2ª: a; 3ª: à mortalidade.' },
          { label: 'Em outra banca…', detail: 'Trocam Murthy por OMS ou pandemia.', correct: 'Mesmo funil: ênfase a + similar à.' },
        ],
        footer_rule: 'A passa: a · a · à.',
      },
    ],
  },

  'caderno-pt-crase-pronome-demonstrativo-3554846': {
    family: 'conceito',
    source_tec_id: '3554846',
    source_note: 'Crase regra pronomes — caderno PT I/II/III à todas/esta/cada tec 3554846',
    meta: { banca: 'Caderno PT', prova: 'Crase — regra geral pronomes', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'As sentenças a seguir apresentam casos de inadequação no emprego do acento indicativo de crase:\nI. Enviei cartas à todas as minhas amigas.\nII. Desejo o melhor à esta garota.\nIII. Acessou à cada um dos sites para checar as informações.\nPode-se dizer que a regra geral por trás da incorreção em todas as sentenças dadas, de acordo com a norma-padrão da língua portuguesa, é:',
    options: [
      { id: 'A', text: 'Não ocorre crase diante de verbos no infinitivo.', is_correct: false },
      { id: 'B', text: 'Não ocorre crase diante de palavras no gênero masculino.', is_correct: false },
      { id: 'C', text: 'Não ocorre crase em locuções formadas com a repetição de uma mesma palavra.', is_correct: false },
      { id: 'D', text: 'Não ocorre crase diante de pronomes que rejeitam o artigo, como certos pronomes indefinidos e demonstrativos.', is_correct: true },
      { id: 'E', text: 'Não ocorre crase diante de pronomes pessoais e artigos indefinidos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'O que I, II e III têm em comum?',
        meta: slideMeta,
        items: [
          { label: 'I — à todas', detail: '«À todas» — pronome indefinido «todas».', icon: 'Users' },
          { label: 'II — à esta', detail: '«À esta garota» — demonstrativo «esta».', icon: 'User' },
          { label: 'III — à cada', detail: '«À cada um» — pronome indefinido «cada».', icon: 'Globe' },
          { label: 'Padrão', detail: 'Crase indevida antes de pronome que não aceita artigo.', icon: 'Filter' },
        ],
        footer_rule: 'Todas: crase antes de pronome inadequado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler I, II, III: todas têm «à» + pronome (todas/esta/cada).',
          'Correções: a todas · a esta · a cada — sem crase.',
          'A: infinitivo — não explica nenhuma frase.',
          'B: masculino — «garota» é fem.; regra não cobre o trio.',
          'C: repetição de palavra — não é o caso.',
          'E: pessoais/indefinidos — «esta» é demonstrativo; regra incompleta.',
          'D: pronomes que rejeitam artigo — cobre as três.',
          'Gabarito D.',
        ],
        footer_rule: 'D unifica I, II e III.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Regra de bolso',
        meta: slideMeta,
        content: 'PRONOME BARRA CRASE',
        rows: [
          { label: 'I', value: 'a todas as amigas — não «à todas»' },
          { label: 'II', value: 'a esta garota — não «à esta»' },
          { label: 'III', value: 'a cada um — não «à cada»' },
          { label: 'Regra', value: 'demonstrativos e indefinidos rejeitam artigo' },
        ],
        footer_rule: 'D explica as três incorreções.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Regra genérica que não fecha',
        slide_title: 'Distratores',
        items: [
          { label: 'A — infinitivo', detail: 'Regra verdadeira, mas fora do tema.', correct: 'Nenhuma frase tem crase antes de infinitivo.' },
          { label: 'B — masculino', detail: 'Verdade parcial que não unifica I–III.', correct: 'II tem «garota» fem.; erro é o pronome, não o gênero.' },
          { label: 'C — repetição', detail: 'Locução com palavra repetida — outro tema.', correct: 'Não há repetição em I, II ou III.' },
          { label: 'E — pessoais', detail: 'Menciona indefinidos mas omite demonstrativos.', correct: 'II tem «esta» — D é mais completa.' },
          { label: 'Em outra banca…', detail: 'Pedem correção de «à qualquer» ou «à nenhum».', correct: 'Mesma lógica: pronome indefinido/demonstrativo sem crase.' },
        ],
        footer_rule: 'D: pronomes que rejeitam artigo.',
      },
    ],
  },

  'vunesp-itatiba-crase-lacunas-demencia-3583296': {
    family: 'conceito',
    source_tec_id: '3583296',
    source_note: 'Crase lacunas — VUNESP Pref. Itatiba 2025 demência/palestra tec 3583296',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir:\nForam encaminhados convites ___ pessoas interessadas em conhecer mais sobre demência, para comparecerem ___ palestra sobre o tema, em que serão expostas algumas descobertas da ciência, ___ os meios de comunicação vêm se referindo.\nAssinale a alternativa que preenche, correta e respectivamente, as lacunas do texto, segundo a norma-padrão de regência e crase.',
    options: [
      { id: 'A', text: 'as … na … as quais', is_correct: false },
      { id: 'B', text: 'às … à … às quais', is_correct: true },
      { id: 'C', text: 'às … a … à que', is_correct: false },
      { id: 'D', text: 'a … na … à que', is_correct: false },
      { id: 'E', text: 'à … à … a que', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '3 lacunas — convite e palestra',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Convites às', detail: 'Encaminhados convites às pessoas — a + as.', icon: 'Mail' },
          { label: 'À palestra', detail: 'Comparecer à palestra — destino fem.', icon: 'Presentation' },
          { label: 'Às quais', detail: 'Referir-se às quais (meios) — pronome relativo.', icon: 'Radio' },
          { label: 'Demência', detail: 'Tema ambiental/saúde — contexto do texto.', icon: 'Brain' },
        ],
        footer_rule: 'Convite a pessoas + comparecer à + relativo às quais.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '1ª: «convites ___ pessoas» — convites às pessoas → às.',
          '2ª: «comparecerem ___ palestra» — comparecer à palestra → à.',
          '3ª: «referindo ___ os meios» — referir-se às quais → às quais.',
          'Sequência: às / à / às quais — gabarito B.',
          'A: as sem crase; C: a palestra; D/E misturam na/à.',
          'Corte: 2ª lacuna só B e E têm «à» — E erra na 1ª.',
          'Em similares: convites às · comparecer à · às quais.',
        ],
        footer_rule: 'B = às … à … às quais.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: 'CONVITE + PALESTRA + RELATIVO',
        rows: [
          { label: 'Convites', value: 'convites às pessoas — a+as' },
          { label: 'Comparecer', value: 'comparecer à palestra — destino fem.' },
          { label: 'Relativo', value: 'referir-se às quais — a+as quais' },
          { label: 'Nesta questão', value: 'às … à … às quais' },
        ],
        footer_rule: 'Três contextos, três crases justas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: '«Na palestra» ou «as pessoas»',
        slide_title: 'Pegadinhas',
        items: [
          { label: 'A — as pessoas', detail: 'Artigo sem crase no convite.', correct: 'Convites às pessoas interessadas — a+as.' },
          { label: 'C — a palestra', detail: 'Comparecer a palestra sem crase.', correct: 'Comparecer à palestra — verbo de movimento + fem.' },
          { label: 'D — na palestra', detail: '«Na» parece indicar lugar certo.', correct: 'Comparecer à palestra — regência com a, não em/na.' },
          { label: 'E — à … a que', detail: 'Singular «a que» no relativo.', correct: 'Os meios — plural: às quais.' },
          { label: 'Em outra banca…', detail: 'Trocam demência por vacinação.', correct: 'Mesmo funil: às pessoas · à palestra · às quais.' },
        ],
        footer_rule: 'B passa nas três lacunas.',
      },
    ],
  },

  'vunesp-itatiba-crase-lacunas-obras-arte-3583413': {
    family: 'conceito',
    source_tec_id: '3583413',
    source_note: 'Crase lacunas — VUNESP Pref. Itatiba 2025 obras de arte/museus tec 3583413',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba)',
      orgao: 'Pref. Itatiba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'As obras de arte são essenciais ___ humanidade, pois nos conectam ___ essência da nossa história e cultura. Apesar de algumas delas poderem chegar ___ custar milhões, muitas estão acessíveis ___ quem desejar vê-las nos museus ou mesmo na internet.\nAs lacunas do texto podem ser preenchidas, correta e respectivamente, por',
    options: [
      { id: 'A', text: 'a … a … à … à', is_correct: false },
      { id: 'B', text: 'a … à … a … à', is_correct: false },
      { id: 'C', text: 'a … à … à … à', is_correct: false },
      { id: 'D', text: 'à … a … à … a', is_correct: false },
      { id: 'E', text: 'à … à … a … a', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '4 lacunas — arte e museus',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Essenciais à', detail: 'Essenciais à humanidade — adj. + a+a fem.', icon: 'Palette' },
          { label: 'Conectam à', detail: 'Conectar-nos à essência — regência fem.', icon: 'Link' },
          { label: 'Chegar a custar', detail: 'Chegar a custar milhões — verbo + infinitivo.', icon: 'Coins' },
          { label: 'Acessíveis a', detail: 'Acessíveis a quem — prep. a + pronome.', icon: 'Users' },
        ],
        footer_rule: 'Adj. fem. × infinitivo × pronome «quem».',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '1ª: «essenciais ___ humanidade» — essenciais à humanidade → à.',
          '2ª: «conectam ___ essência» — conectar à essência → à.',
          '3ª: «chegar ___ custar» — chegar a custar → a (infinitivo).',
          '4ª: «acessíveis ___ quem» — acessíveis a quem → a.',
          'Sequência: à / à / a / a — gabarito E.',
          'A/B/C erram na 1ª ou 3ª; D crase em «chegar à».',
          'Corte: 3ª lacuna — só E tem a (com D também, mas D erra antes).',
          'Em similares: essencial à · chegar a + inf · acessível a quem.',
        ],
        footer_rule: 'E = à … à … a … a.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '4 LACUNAS',
        rows: [
          { label: 'Adj.', value: 'essenciais à humanidade — CN fem.' },
          { label: 'Regência', value: 'conectar à essência — a+a' },
          { label: 'Infinitivo', value: 'chegar a custar — sem crase' },
          { label: 'Pronome', value: 'acessíveis a quem — a simples' },
          { label: 'Nesta questão', value: 'à … à … a … a' },
        ],
        footer_rule: 'Verbo/infinitivo e «quem» barram crase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase em «chegar à custar»',
        slide_title: 'Pegadinhas',
        items: [
          { label: 'A — a humanidade', detail: 'Primeira lacuna sem crase.', correct: 'Essenciais à humanidade — adj. + OD fem.' },
          { label: 'B — a essência', detail: 'Segunda lacuna sem crase.', correct: 'Conectam à essência da história — regência fem.' },
          { label: 'C — crase em custar', detail: '«Chegar à custar» forçado.', correct: 'Chegar a custar milhões — a + infinitivo.' },
          { label: 'D — à quem', detail: 'Crase antes de «quem».', correct: 'Acessíveis a quem desejar — pronome sem artigo.' },
          { label: 'Em outra banca…', detail: 'Trocam museus por galerias ou patrimônio.', correct: 'Mesmo funil: adj. à + chegar a + a quem.' },
        ],
        footer_rule: 'E passa: à · à · a · a.',
      },
    ],
  },

  'vunesp-osasco-crase-lacunas-tira-3607078': {
    family: 'conceito',
    source_tec_id: '3607078',
    source_note: 'Crase lacunas — VUNESP ACS Pref. Osasco 2025 tira tec 3607078',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira a seguir para responder à questão.\nAssinale a alternativa que preenche, correta e respectivamente, as lacunas da tira, de acordo com a norma-padrão.\n(Refiro-me ___ problema de saúde, compareci ___ consulta médica e aguardei ___ sala de espera.)',
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
          { label: 'Refiro-me a', detail: 'Referir-se a problema — regência verbal, sem crase.', icon: 'MessageSquare' },
          { label: 'Compareci à', detail: 'Comparecer à consulta — destino fem. com crase.', icon: 'Stethoscope' },
          { label: 'Aguardei na', detail: 'Aguardar na sala — em + a → na (lugar).', icon: 'Hourglass' },
          { label: 'Saúde / UBS', detail: 'Contexto ACS — atenção básica e espera.', icon: 'HeartPulse' },
        ],
        footer_rule: 'Regência a × destino à × lugar na.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '1ª: «refiro-me ___ problema» — referir-se a → a.',
          '2ª: «compareci ___ consulta» — comparecer à consulta → à.',
          '3ª: «aguardei ___ sala de espera» — aguardar na sala → na (em+a).',
          'Sequência: a / à / na — gabarito A.',
          'B: à problema; C: na consulta; D/E: «há» não encaixa.',
          'Funil: só A combina regência + destino + lugar.',
          'Em similares: referir-se a · ir à · esperar na.',
          'Na = em + a — não confundir com crase.',
        ],
        footer_rule: 'A = a … à … na.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: 'A · À · NA',
        rows: [
          { label: 'Regência', value: 'refiro-me a problema — a' },
          { label: 'Destino', value: 'compareci à consulta — à' },
          { label: 'Lugar', value: 'aguardei na sala — em + a' },
          { label: 'Nesta questão', value: 'a … à … na' },
        ],
        footer_rule: 'Na não é crase — é contração de em+a.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar à por na ou «há»',
        slide_title: 'Pegadinhas da tira',
        items: [
          { label: 'B — à problema', detail: 'Crase na regência «refiro-me».', correct: 'Refiro-me a problema — verbo pede a simples.' },
          { label: 'C — na consulta', detail: '«Na consulta» no movimento.', correct: 'Comparecer à consulta — destino com a/à.' },
          { label: 'D — há … à', detail: '«Há» como verbo existencial forçado.', correct: 'Construção exige refiro-me / compareci / aguardei.' },
          { label: 'E — há + a consulta', detail: 'Mistura existencial com regência.', correct: '2ª lacuna: comparecer à, não «há a».' },
          { label: 'Em outra banca…', detail: 'Trocam consulta por «farmácia» ou «posto».', correct: 'Mesmo trio: a problema · à consulta · na sala.' },
        ],
        footer_rule: 'A passa: a · à · na.',
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
