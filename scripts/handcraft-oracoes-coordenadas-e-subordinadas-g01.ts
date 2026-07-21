#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — oracoes-coordenadas-e-subordinadas-g01 (8 slugs · Orações coordenadas e subordinadas · lote 1).
 *
 *   npx tsx scripts/handcraft-oracoes-coordenadas-e-subordinadas-g01.ts
 *   npm run audit:questao-readiness -- --lote=oracoes-coordenadas-e-subordinadas-g01 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=oracoes-coordenadas-e-subordinadas-g01 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'oracoes-coordenadas-e-subordinadas-g01';
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
    'oração coordenada sindética adversativa',
    'oração coordenada sindética aditiva',
    'oração coordenada assindética',
    'oração subordinada substantiva objetiva direta',
    'conectivos adversativos (mas, porém, contudo)',
    'conectivos aditivos (e, bem como, nem)',
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
      reviewer: 'handcraft:oracoes-coordenadas-e-subordinadas-g01',
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
  'apice-ap-ei-oracoes-inteligencia-artificial-e-a-transfor-4037413': {
    family: 'conceito',
    source_tec_id: '4037413',
    source_note:
      'IA e transformação do trabalho — coordenada adversativa «mas» — ÁPICE AP EI (Pref SJ Cordeiros) 2026 tec 4037413',
    meta: {
      banca: 'ÁPICE',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref. São João do Cariri Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe o trecho adaptado: «Funções que exigem reflexão crítica se beneficiam da tecnologia, mas profissões burocráticas podem ser substituídas.» Com base na estrutura do período e na relação entre as orações, assinale a alternativa correta.',
    options: [
      { id: 'A', text: 'Trata-se de um período simples, com apenas um verbo.', is_correct: false },
      {
        id: 'B',
        text: '«que exigem reflexão crítica» é uma oração subordinada adverbial.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'A conjunção «mas» introduz uma oração coordenada sindética adversativa.',
        is_correct: true,
      },
      { id: 'D', text: 'O período apresenta apenas duas orações subordinadas.', is_correct: false },
      { id: 'E', text: 'As duas orações do período são apenas coordenadas entre si, sem subordinação.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trilho do período',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Dependência',
            detail: 'Coordenada = orações independentes; subordinada = uma é termo da outra.',
            icon: 'GitBranch',
          },
          {
            label: '2. Conta as orações',
            detail: 'Três verbos: «exigem», «se beneficiam», «podem ser substituídas» → 3 orações.',
            icon: 'ListOrdered',
          },
          {
            label: '3. Conectivo «mas»',
            detail: 'Liga a 2ª à 3ª oração com oposição de ideias — coordenação adversativa.',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: '«que exigem reflexão crítica» é subordinada adjetiva (do sujeito), não adverbial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mas = coordenação; que = subordinação adjetiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'IA e o trabalho → cargo',
        meta: slideMeta,
        steps: [
          'Trecho IA/transformação do trabalho: «Funções que exigem reflexão crítica se beneficiam… mas profissões… podem ser substituídas».',
          'A: há 3 verbos (exigem, beneficiam, podem ser substituídas) → período composto, não simples.',
          'B: «que exigem reflexão crítica» qualifica «funções» — subordinada adjetiva, não adverbial.',
          'D: há subordinada adjetiva + duas coordenadas — não são «apenas duas subordinadas».',
          'E: existe subordinação adjetiva («que exigem…») além da coordenação — não é «apenas coordenadas».',
          'C: «mas» liga orações independentes com sentido de oposição → coordenada sindética adversativa.',
          'Em similares: conte os verbos, isole o «que» adjetivo, e leia o sentido do conectivo entre as independentes.',
        ],
        footer_rule: 'Mas + oposição entre independentes = coordenada adversativa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Coordenação × subordinação',
        meta: slideMeta,
        content: 'DEPENDÊNCIA → CONECTIVO',
        rows: [
          { label: 'Coordenada', value: 'Orações independentes — nenhuma é termo da outra.' },
          { label: 'Subordinada', value: 'Uma oração funciona como termo (sujeito, objeto, adjunto) da outra.' },
          { label: 'Adversativa', value: 'mas, porém, contudo, todavia — opõe ideias entre independentes.' },
          { label: 'Adjetiva', value: 'que, o qual… retomam substantivo — nunca confundir com adverbial.' },
          { label: 'Nesta questão', value: 'mas → coordenada sindética adversativa (C)' },
        ],
        footer_rule: 'Conte os verbos, depois leia o conectivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar dependência e conectivo',
        items: [
          {
            label: 'A — período simples',
            detail: 'Ler só a primeira oração e ignorar os outros verbos.',
            correct: 'Três verbos flexionados → período composto, não simples.',
          },
          {
            label: 'B — adverbial',
            detail: '«Que» sozinho parece introduzir qualquer subordinada.',
            correct: '«Que exigem reflexão crítica» qualifica «funções» — é adjetiva, não adverbial.',
          },
          {
            label: 'D — apenas subordinadas',
            detail: 'Ignorar o «mas» que liga orações independentes.',
            correct: 'Há também coordenação via «mas» — não são só subordinadas.',
          },
          {
            label: 'E — apenas coordenadas',
            detail: 'Ignorar a oração adjetiva «que exigem…».',
            correct: 'Existe subordinação adjetiva além da coordenação com «mas».',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «mas» por «porém» ou «contudo».',
            correct: 'Mesmo trilho: oposição entre independentes = coordenada adversativa.',
          },
        ],
        footer_rule: 'C: mas introduz coordenada sindética adversativa.',
      },
    ],
  },

  'apice-ap-ei-oracoes-inteligencia-artificial-e-a-transfor-4037421': {
    family: 'conceito',
    source_tec_id: '4037421',
    source_note:
      'IA e transformação do trabalho — coordenada aditiva «bem como» — ÁPICE AP EI (Pref SJ Cordeiros) 2026 tec 4037421',
    meta: {
      banca: 'ÁPICE',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref. São João do Cariri Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«O profissional deve estar pronto para desenvolver habilidades além da sua área de atuação, bem como realizar transições de carreira quando necessário.» Com base na análise sintática do período, assinale a alternativa correta.',
    options: [
      { id: 'A', text: 'Trata-se de um período simples, com apenas uma oração.', is_correct: false },
      { id: 'B', text: 'Há uma oração subordinada adjetiva ligando as duas ideias.', is_correct: false },
      { id: 'C', text: 'A segunda oração funciona como subordinada adjunto adverbial de tempo apenas.', is_correct: false },
      { id: 'D', text: 'É um período simples com um único sujeito e dois verbos auxiliares.', is_correct: false },
      {
        id: 'E',
        text: 'É um período composto por coordenação; «bem como» tem valor de adição entre as orações.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trilho do período',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Dependência',
            detail: 'Verifique se a 2ª oração é termo da 1ª (subordinada) ou independente (coordenada).',
            icon: 'GitBranch',
          },
          {
            label: '2. Conta os verbos',
            detail: '«Deve estar pronto para desenvolver…» + «bem como realizar…» → duas orações.',
            icon: 'ListOrdered',
          },
          {
            label: '3. Conectivo «bem como»',
            detail: 'Equivale a «e» — soma duas ações do mesmo sujeito, sem dependência sintática.',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: '«Quando necessário» é adjunto dentro da 2ª oração — não classifica o período todo como adverbial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Bem como = e → coordenação aditiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Profissional → cargo',
        meta: slideMeta,
        steps: [
          'Trecho IA/transformação do trabalho: «deve estar pronto para desenvolver… bem como realizar transições…».',
          'A/D: há dois núcleos verbais coordenados (desenvolver / realizar) → não é período simples.',
          'B: não há pronome relativo (que, o qual) ligando as orações — logo, não é subordinada adjetiva.',
          'C: «quando necessário» é adjunto interno à 2ª oração, não classifica a relação entre as duas orações principais.',
          '«Bem como» tem o mesmo valor de «e» — soma duas ideias sem uma depender da outra.',
          'Gabarito E — período composto por coordenação, adição via «bem como».',
          'Em similares: bem como / e / nem → sempre teste se dá para trocar por «e» sem mudar o sentido.',
        ],
        footer_rule: 'Bem como = e → coordenada sindética aditiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Conectivos de adição',
        meta: slideMeta,
        content: 'ADITIVA',
        rows: [
          { label: 'Conectivos', value: 'e, nem, bem como, tanto…quanto — somam ideias.' },
          { label: 'Teste', value: 'Substitua pelo «e»: se o sentido se mantém, é aditiva.' },
          { label: '≠ Adjetiva', value: 'Sem pronome relativo (que, o qual) não há subordinação adjetiva.' },
          { label: '≠ Adverbial de tempo', value: '«Quando necessário» é adjunto interno, não classifica o período.' },
          { label: 'Nesta questão', value: 'bem como → coordenada aditiva (E)' },
        ],
        footer_rule: 'Bem como soma ações do mesmo sujeito.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar dependência e conectivo',
        items: [
          {
            label: 'A — período simples',
            detail: 'Ignorar o segundo verbo «realizar».',
            correct: 'Dois núcleos verbais coordenados → período composto, não simples.',
          },
          {
            label: 'B — subordinada adjetiva',
            detail: '«Bem como» parece introduzir explicação, como um «que».',
            correct: 'Não há pronome relativo; «bem como» apenas soma, não subordina.',
          },
          {
            label: 'C — adverbial de tempo',
            detail: '«Quando necessário» no fim sugere classificar o período inteiro.',
            correct: '«Quando necessário» é adjunto da 2ª oração, não a relação entre as duas orações.',
          },
          {
            label: 'D — sujeito único, verbos auxiliares',
            detail: 'Mesmo sujeito («profissional») confunde com período simples.',
            correct: 'Sujeito compartilhado não impede período composto; há dois verbos principais coordenados.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «bem como» por «e também» ou «assim como».',
            correct: 'Mesmo trilho: teste a troca por «e» → coordenada aditiva.',
          },
        ],
        footer_rule: 'E: período composto por coordenação, adição.',
      },
    ],
  },

  'cpcon-uepb-a-oracoes-leia-o-texto-3-para-responder-a-ques-3483809': {
    family: 'text_fragment',
    source_tec_id: '3483809',
    source_note:
      'Avó explica sobre Jesus — coordenada adversativa «mas» — CPCON UEPB Ag Pref Nazarezinho 2025 tec 3483809',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag (Pref Nazarezinho)',
      orgao: 'Pref. Nazarezinho',
      ano: '2025',
      cargo_header: 'COMBATE ÀS ENDEMIAS',
    },
    instruction:
      'No trecho «Minha avó tentou me explicar que Jesus não era Deus, mas que também podia ser.», a oração em destaque é:',
    text_fragment:
      '<p>«O papa vai ao banheiro?» (Tiago Germano, adaptado). «Minha avó tentou me explicar que Jesus não era Deus, <strong>mas que também podia ser</strong>».</p>',
    options: [
      { id: 'A', text: 'substantiva predicativa.', is_correct: false },
      { id: 'B', text: 'coordenada sindética adversativa.', is_correct: true },
      { id: 'C', text: 'adjetiva explicativa.', is_correct: false },
      { id: 'D', text: 'adverbial temporal.', is_correct: false },
      { id: 'E', text: 'adjetiva restritiva.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Duas explicações opostas',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Dependência',
            detail: '«Que Jesus não era Deus» é OD de explicar; «mas que também podia ser» é outra coisa.',
            icon: 'GitBranch',
          },
          {
            label: '2. Conectivo «mas»',
            detail: 'Liga duas ideias opostas: «não era Deus» × «também podia ser».',
            icon: 'Link',
          },
          {
            label: '3. Nível sintático',
            detail: 'A oração destacada está no mesmo nível da primeira substantiva — coordenada a ela.',
            icon: 'Layers',
          },
          {
            label: 'Pegadinha',
            detail: 'Ter «que» no início não garante subordinação — aqui o «que» apenas repete a substantiva, mas o «mas» é que rege a relação.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mas + oposição entre orações = coordenada adversativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Papa/banheiro → cargo',
        meta: slideMeta,
        steps: [
          'Crônica «O papa vai ao banheiro?»: avó tenta explicar que Jesus não era Deus, mas que também podia ser.',
          'A/C/E: a oração destacada não retoma nem qualifica um substantivo, nem completa verbo de ligação — não é substantiva predicativa nem adjetiva.',
          'D: não há noção de tempo («quando», «enquanto») — não é adverbial temporal.',
          '«Mas» liga a oração destacada à primeira ideia («não era Deus»), opondo os dois conteúdos.',
          'A relação entre as duas ideias (não era × também podia ser) é de oposição entre orações no mesmo nível.',
          'Gabarito B — coordenada sindética adversativa.',
          'Em similares: «mas que…» repetindo o «que» → ainda é «mas» quem decide: oposição = adversativa.',
        ],
        footer_rule: 'O conectivo «mas» decide, não o «que» repetido.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Mas que também…',
        meta: slideMeta,
        content: 'ADVERSATIVA COM «QUE» REPETIDO',
        rows: [
          { label: 'Estrutura', value: 'Explicar que X, mas que Y — «mas» liga as duas ideias.' },
          { label: 'Teste', value: 'Há oposição de sentido entre as ideias? Sim → adversativa.' },
          { label: '≠ Substantiva predicativa', value: 'Completaria verbo de ligação — não é o caso.' },
          { label: '≠ Adjetiva', value: 'Não retoma nem qualifica substantivo antecedente.' },
          { label: 'Nesta questão', value: 'mas → coordenada sindética adversativa (B)' },
        ],
        footer_rule: 'Mas = sinal de oposição, mesmo com «que» repetido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir «que» repetido com subordinação',
        items: [
          {
            label: 'A — substantiva predicativa',
            detail: '«Que» no início sugere completar verbo de ligação.',
            correct: 'Não há verbo de ligação nessa posição — o «que» só retoma a estrutura anterior.',
          },
          {
            label: 'C — adjetiva explicativa',
            detail: 'Parece explicar algo sobre um substantivo.',
            correct: 'Não há substantivo antecedente sendo qualificado — a relação é entre ideias, via «mas».',
          },
          {
            label: 'D — adverbial temporal',
            detail: 'Ausência de conectivo claro pode sugerir tempo.',
            correct: 'Não há marcador temporal; «mas» marca oposição, não tempo.',
          },
          {
            label: 'E — adjetiva restritiva',
            detail: 'Confundir «que» com pronome relativo restritivo.',
            correct: 'Aqui «que» integra a oração ligada por «mas», sem restringir substantivo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem repetir a estrutura com «porém que» ou «contudo».',
            correct: 'Mesmo trilho: oposição entre ideias no mesmo nível = coordenada adversativa.',
          },
        ],
        footer_rule: 'B: coordenada sindética adversativa.',
      },
    ],
  },

  'apice-ace-pr-oracoes-sabendo-que-o-periodo-composto-por-c-3558979': {
    family: 'conceito',
    source_tec_id: '3558979',
    source_note: 'Coordenada adversativa — ÁPICE ACE (Pref Pocinhos) 2025 tec 3558979 (âncora golden-v1)',
    guidelineOverride: `M07c Elias TE-simples — trilho período → dependência → conectivo → tipo · âncora coordenada adversativa · ${GOLDEN_REFERENCE}`,
    meta: {
      banca: 'ÁPICE',
      prova: 'ACE (Pref Pocinhos)',
      orgao: 'Pref. Pocinhos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Sabendo que o período composto por coordenação apresenta orações sintaticamente independentes, assinale a alternativa que apresenta uma oração coordenada sindética adversativa.',
    options: [
      { id: 'A', text: 'Você prega lealdade, e age de modo desleal?', is_correct: true },
      { id: 'B', text: 'Tanto leciona quanto advoga.', is_correct: false },
      { id: 'C', text: 'A mulher ora o agradava, ora o ofendia.', is_correct: false },
      { id: 'D', text: 'Vocês são especiais em minha vida, por isso não vivo sem vocês.', is_correct: false },
      { id: 'E', text: 'Dezenove sem-terra morreram no local, e dois, a caminho do hospital.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trilho do período',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Dependência',
            detail: 'Coordenada = orações independentes. Subordinada = uma depende da outra.',
            icon: 'GitBranch',
          },
          {
            label: '2. Conectivo',
            detail: 'O conectivo revela o sentido: adição, oposição, conclusão, alternância…',
            icon: 'Link',
          },
          {
            label: '3. Pergunta-teste',
            detail: '«Para quê?» / «Embora?» → subordinada. «E agora?» oposição → adversativa.',
            icon: 'HelpCircle',
          },
          {
            label: 'Pegadinha',
            detail: 'Confundir «e» aditivo com adversativo — teste a oposição de ideias.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Coordenação: nenhuma oração é termo da outra.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando pede coordenada sindética adversativa — primeiro confirmar coordenação (orações independentes).',
          'B: «tanto…quanto» = adição correlata → eliminar.',
          'C: «ora…ora» = alternância → eliminar.',
          'D: «por isso» = conclusão → eliminar.',
          'E: «e» liga fatos paralelos (adição), sem oposição clara → eliminar.',
          'A: «prega lealdade» × «age desleal» + «e» com sentido oposto → adversativa.',
          'Em similares: marque dependência → leia o conectivo → só então rotule o tipo.',
        ],
        footer_rule: 'Adversativa = oposição de ideias entre orações coordenadas.',
      },
      {
        type: 'golden_rule',
        content: 'Conectivos de coordenação — decore o sentido',
        meta: slideMeta,
        rows: [
          { label: 'Aditiva', value: 'e, nem, tanto…quanto — soma ideias' },
          { label: 'Adversativa', value: 'mas, porém, contudo, todavia — opõe ideias' },
          { label: 'Alternativa', value: 'ora…ora, quer…quer, seja…seja — alternância' },
          { label: 'Conclusiva', value: 'portanto, por isso, logo, então — conclusão' },
          { label: 'Teste', value: 'Coordenada: orações autônomas; subordinada: uma funciona como termo' },
        ],
        footer_rule: 'Sindética = com conectivo explícito.',
      },
      {
        type: 'danger_zone',
        content: 'Trocar o valor do conectivo',
        meta: slideMeta,
        items: [
          { label: 'B — tanto…quanto', detail: 'Parece coordenação forte.', correct: 'É coordenada aditiva correlata — soma, não opõe.' },
          { label: 'C — ora…ora', detail: 'Tem dois verbos coordenados.', correct: 'Alternativa — alterna ações, não adversativa.' },
          { label: 'D — por isso', detail: 'Liga duas orações.', correct: 'Conclusiva — indica consequência, não oposição.' },
          {
            label: 'E — e',
            detail: '«e» sempre parece adversativo na fala.',
            correct: 'Aqui é aditivo (dois fatos paralelos) — sem contraste lealdade × deslealdade.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem usar «mas» explícito.',
            correct: 'Mesmo trilho: oposição clara entre orações independentes.',
          },
        ],
        footer_rule: 'Leia o sentido do conectivo — não rotule pelo formato.',
      },
    ],
  },

  'cpcon-uepb-a-oracoes-utilize-o-texto-01-para-responder-a-3598926': {
    family: 'text_fragment',
    source_tec_id: '3598926',
    source_note:
      'Surpresa/ciência — coordenada adversativa «mas» — CPCON UEPB Ag Pref Nova Palmeira 2025 tec 3598926',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag (Pref Nova Palmeira)',
      orgao: 'Pref. Nova Palmeira',
      ano: '2025',
      cargo_header: 'COMBATE ÀS ENDEMIAS',
    },
    instruction:
      'No período «Ela trouxe uma \'surpresa\' esse ano. Mas a ciência também tem novas armas», sobre a oração em destaque, assinale a alternativa correta.',
    text_fragment:
      '<p>Texto sobre variante de vírus e vacinação (adaptado). «Ela trouxe uma \'surpresa\' esse ano. <strong>Mas a ciência também tem novas armas</strong>».</p>',
    options: [
      { id: 'A', text: 'coordenada sindética adversativa.', is_correct: true },
      { id: 'B', text: 'coordenada assindética.', is_correct: false },
      { id: 'C', text: 'coordenada alternativa.', is_correct: false },
      { id: 'D', text: 'oração principal do período anterior.', is_correct: false },
      { id: 'E', text: 'subordinada adverbial causal.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Surpresa × novas armas',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Duas ideias',
            detail: '«Ela trouxe surpresa» (variante) × «a ciência tem novas armas» (vacinas).',
            icon: 'GitBranch',
          },
          {
            label: '2. Conectivo «mas»',
            detail: 'Presença explícita de conjunção — logo, é sindética (com conectivo).',
            icon: 'Link',
          },
          {
            label: '3. Sentido',
            detail: 'Oposição entre «surpresa negativa» e «resposta da ciência» — adversativa.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha',
            detail: 'O ponto final antes de «Mas» não anula a coordenação — ainda liga as duas ideias.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mas explícito = sindética; sentido de oposição = adversativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Variante/vacina → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre variante do vírus: «Ela trouxe uma surpresa esse ano.» seguido de «Mas a ciência também tem novas armas».',
          'B: assindética não tem conectivo — aqui há «mas» explícito, então não é assindética.',
          'C: alternativa usa ora…ora, quer…quer — não é o caso.',
          'D: «oração principal» não classifica a relação entre as duas orações — categoria incorreta.',
          'E: não há relação de causa («porque», «já que») — é oposição, não causalidade.',
          '«Mas» liga a oração destacada à anterior, opondo «surpresa» (problema) e «novas armas» (solução).',
          'Gabarito A — coordenada sindética adversativa.',
        ],
        footer_rule: 'Mas + oposição = coordenada sindética adversativa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sindética × assindética',
        meta: slideMeta,
        content: 'COM OU SEM CONECTIVO',
        rows: [
          { label: 'Sindética', value: 'Tem conectivo explícito (e, mas, porém, logo…).' },
          { label: 'Assindética', value: 'Sem conectivo — orações separadas só por vírgula/ponto.' },
          { label: 'Adversativa', value: 'mas, porém, contudo — opõe ideias entre orações independentes.' },
          { label: '≠ Causal', value: 'Precisa de porque/já que/pois — não há aqui.' },
          { label: 'Nesta questão', value: 'mas → coordenada sindética adversativa (A)' },
        ],
        footer_rule: 'Ponto final não impede a coordenação entre períodos vizinhos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar sindética por assindética ou causal',
        items: [
          {
            label: 'B — assindética',
            detail: 'O ponto final antes de «Mas» sugere ausência de conectivo.',
            correct: '«Mas» é conectivo explícito — a oração é sindética, não assindética.',
          },
          {
            label: 'C — alternativa',
            detail: 'Duas ideias diferentes parecem alternância.',
            correct: 'Não há ora…ora/quer…quer; o sentido é de oposição, não de escolha.',
          },
          {
            label: 'D — oração principal',
            detail: 'Confundir com hierarquia de período composto por subordinação.',
            correct: '«Principal» só existe em subordinação; aqui a relação é de coordenação.',
          },
          {
            label: 'E — causal',
            detail: '«A ciência tem armas» pode parecer justificativa.',
            correct: 'Falta conectivo causal (porque, já que); o sentido é de oposição/contraste.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem juntar tudo num só período com vírgula antes de «mas».',
            correct: 'Mesmo trilho: mas + oposição = coordenada sindética adversativa.',
          },
        ],
        footer_rule: 'A: coordenada sindética adversativa.',
      },
    ],
  },

  'educa-pb-acd-oracoes-leia-o-texto-a-seguir-e-responda-a-q-3746572': {
    family: 'text_fragment',
    source_tec_id: '3746572',
    source_note:
      'Colombo e o chocolate — 3 orações: principal + infinitiva + coordenada adversativa — EDUCA PB ACD Pref Santa Cecília 2025 tec 3746572',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Santa Cecília)',
      orgao: 'Pref. Santa Cecília',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Releia: «Cristóvão Colombo [...] foi o primeiro europeu a tomar conhecimento do chocolate, mas o sucesso do chocolate na Europa só veio a ocorrer em anos posteriores.» É CORRETO afirmar que sua estrutura é composta por:',
    text_fragment:
      '<p>Texto sobre a história do chocolate (adaptado). «Cristóvão Colombo […] foi o primeiro europeu a tomar conhecimento do chocolate, mas o sucesso do chocolate na Europa só veio a ocorrer em anos posteriores».</p>',
    options: [
      { id: 'A', text: 'duas orações: uma principal e uma subordinada.', is_correct: false },
      {
        id: 'B',
        text: 'três orações: uma principal, uma subordinada reduzida de infinitivo e uma coordenada adversativa.',
        is_correct: true,
      },
      { id: 'C', text: 'duas orações coordenadas aditivas.', is_correct: false },
      { id: 'D', text: 'uma principal e uma subordinada conclusiva.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três orações no mesmo período',
        chip_label: 'Conte antes de classificar',
        meta: slideMeta,
        items: [
          {
            label: '1. Principal',
            detail: '«Colombo foi o primeiro europeu» — núcleo do período.',
            icon: 'CornerDownRight',
          },
          {
            label: '2. Reduzida de infinitivo',
            detail: '«a tomar conhecimento do chocolate» — sem conectivo, verbo no infinitivo, subordinada.',
            icon: 'GitBranch',
          },
          {
            label: '3. Coordenada adversativa',
            detail: '«mas o sucesso… veio a ocorrer depois» — oposição à ideia anterior via «mas».',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: 'Orações reduzidas não têm conectivo nem verbo flexionado — fácil de não contar.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Reduzida de infinitivo também conta como oração.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Colombo/chocolate → cargo',
        meta: slideMeta,
        steps: [
          'Texto história do chocolate: «Colombo foi o primeiro europeu a tomar conhecimento do chocolate, mas o sucesso… veio a ocorrer em anos posteriores».',
          'A: contar só duas orações ignora a reduzida de infinitivo «a tomar conhecimento…».',
          'C: não há dois conectivos aditivos — há «mas», que é adversativo, não aditivo.',
          'D: não há conectivo conclusivo (portanto, logo) — «mas» marca oposição.',
          '1ª oração: «Colombo foi o primeiro europeu» — principal.',
          '2ª oração: «a tomar conhecimento do chocolate» — subordinada reduzida de infinitivo (explica «primeiro europeu»).',
          '3ª oração: «mas o sucesso… veio a ocorrer depois» — coordenada sindética adversativa à principal. Gabarito B.',
        ],
        footer_rule: 'Principal + reduzida infinitivo + coordenada adversativa = 3 orações.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Reduzidas também contam',
        meta: slideMeta,
        content: 'ORAÇÃO REDUZIDA DE INFINITIVO',
        rows: [
          { label: 'Sinal', value: 'Verbo no infinitivo, sem conectivo (a + infinitivo, de + infinitivo…).' },
          { label: 'Função', value: 'Equivale a uma subordinada desenvolvida — aqui, explica o «primeiro europeu».' },
          { label: 'Contagem', value: 'Conte verbos/núcleos verbais, não só orações com «que».' },
          { label: 'Coordenada', value: 'Mas liga a 3ª oração à 1ª, opondo ideias.' },
          { label: 'Nesta questão', value: '3 orações: principal + reduzida + coordenada adversativa (B)' },
        ],
        footer_rule: 'Não esquecer a reduzida ao contar orações.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Subcontar ou trocar o conectivo',
        items: [
          {
            label: 'A — só duas orações',
            detail: 'A reduzida de infinitivo passa despercebida por não ter conectivo.',
            correct: '«A tomar conhecimento…» é subordinada reduzida — soma-se às outras duas, total 3.',
          },
          {
            label: 'C — duas coordenadas aditivas',
            detail: '«Mas» é confundido com «e».',
            correct: '«Mas» tem valor de oposição (adversativo), não de soma (aditivo).',
          },
          {
            label: 'D — subordinada conclusiva',
            detail: 'Não há marcador de conclusão como «portanto».',
            correct: '«Mas» indica oposição; conclusiva exigiria portanto/logo/por isso.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem reduzir o texto e pedir só a contagem de orações.',
            correct: 'Mesmo trilho: contar verbos/núcleos, incluindo reduzidas.',
          },
        ],
        footer_rule: 'B: principal + reduzida infinitivo + coordenada adversativa.',
      },
    ],
  },

  'apice-ag-adm-oracoes-leia-o-texto-abaixo-e-responda-da-qu-3793451': {
    family: 'text_fragment',
    source_tec_id: '3793451',
    source_note:
      'Vírgula entre coordenadas assindéticas — ÁPICE Ag Adm 2025 tec 3793451',
    meta: {
      banca: 'ÁPICE',
      prova: 'Ag Adm',
      orgao: 'Não informado no caderno',
      ano: '2025',
      cargo_header: 'AGENTE ADMINISTRATIVO',
    },
    instruction: 'Em «Não obedecemos a um sistema, somos o próprio sistema.», a vírgula foi usada para:',
    text_fragment: '<p>Trecho reflexivo sobre autonomia e sistema (adaptado). «Não obedecemos a um sistema, somos o próprio sistema».</p>',
    options: [
      { id: 'A', text: 'isolar adjunto adverbial anteposto.', is_correct: false },
      { id: 'B', text: 'separar oração subordinada temporal.', is_correct: false },
      { id: 'C', text: 'marcar orações reduzidas de gerúndio.', is_correct: false },
      { id: 'D', text: 'separar orações coordenadas assindéticas.', is_correct: true },
      { id: 'E', text: 'isolar aposto explicativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vírgula sem conectivo',
        chip_label: 'Dependência primeiro',
        meta: slideMeta,
        items: [
          {
            label: '1. Duas orações',
            detail: '«Não obedecemos a um sistema» e «somos o próprio sistema» — dois verbos, dois sentidos completos.',
            icon: 'GitBranch',
          },
          {
            label: '2. Sem conectivo',
            detail: 'Nenhuma conjunção entre elas — só a vírgula une as duas ideias.',
            icon: 'Link',
          },
          {
            label: '3. Assindética',
            detail: 'Coordenada sem conectivo explícito = assindética.',
            icon: 'Minus',
          },
          {
            label: 'Pegadinha',
            detail: 'Vírgula não é sempre aposto ou adjunto anteposto — aqui separa duas orações independentes.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Duas orações independentes + vírgula sem conjunção = assindética.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Sistema/autonomia → cargo',
        meta: slideMeta,
        steps: [
          'Trecho: «Não obedecemos a um sistema, somos o próprio sistema».',
          'A: não há adjunto adverbial deslocado — as duas partes são orações completas com sujeito e verbo.',
          'B: falta conectivo temporal (quando, enquanto) — não é subordinada temporal.',
          'C: não há verbo no gerúndio — não é oração reduzida de gerúndio.',
          'E: aposto explica um substantivo específico; aqui há duas orações completas, não um aposto.',
          'As duas orações são independentes e a vírgula substitui o conectivo — coordenação assindética.',
          'Gabarito D. Em similares: duas orações completas separadas só por vírgula → assindética.',
        ],
        footer_rule: 'Sem «e»/«mas» explícito entre orações independentes = assindética.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Assindética em uma linha',
        meta: slideMeta,
        content: 'COORDENADA ASSINDÉTICA',
        rows: [
          { label: 'Definição', value: 'Coordenação sem conjunção — só vírgula (ou ponto e vírgula) entre orações.' },
          { label: 'Teste', value: 'As duas partes têm sentido completo e verbo próprio? Sim → orações.' },
          { label: '≠ Aposto', value: 'Aposto explica um termo (substantivo), não forma oração inteira.' },
          { label: '≠ Adjunto anteposto', value: 'Adjunto é termo da oração, não oração autônoma.' },
          { label: 'Nesta questão', value: 'Vírgula → coordenadas assindéticas (D)' },
        ],
        footer_rule: 'Vírgula pode substituir o conectivo entre coordenadas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vírgula tem muitos usos — não generalizar',
        items: [
          {
            label: 'A — adjunto anteposto',
            detail: 'Vírgula após elemento inicial sugere adjunto deslocado.',
            correct: 'Não há adjunto isolado; há duas orações completas coordenadas.',
          },
          {
            label: 'B — subordinada temporal',
            detail: 'Duas ações em sequência parecem indicar tempo.',
            correct: 'Falta conectivo temporal; a relação é de coordenação, não de tempo.',
          },
          {
            label: 'C — reduzida de gerúndio',
            detail: 'Confundir estrutura enxuta com gerúndio.',
            correct: 'Não há verbo em -ndo; ambos os verbos estão no presente do indicativo.',
          },
          {
            label: 'E — aposto explicativo',
            detail: '«O próprio sistema» parece explicar «sistema» anterior.',
            correct: 'É oração completa («somos o próprio sistema»), não aposto de um substantivo isolado.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar por ponto e vírgula no lugar da vírgula.',
            correct: 'Mesmo trilho: duas orações independentes sem conjunção = assindética.',
          },
        ],
        footer_rule: 'D: vírgula separa coordenadas assindéticas.',
      },
    ],
  },

  'instituto-ao-oracoes-leia-o-texto-a-seguir-para-responder-3840852': {
    family: 'text_fragment',
    source_tec_id: '3840852',
    source_note:
      'Kidults — subordinada substantiva objetiva direta com «que» — Instituto AOCP Ass UNIRIO 2026 tec 3840852',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass (UNIRIO)',
      orgao: 'UNIRIO',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que a função do «que» é introduzir oração subordinada substantiva objetiva direta (complemento de verbo).',
    text_fragment:
      '<p>Estudos recentes indicam que esse hábito pode trazer vários benefícios para a saúde. Texto sobre kidults — adultos que consomem brinquedos e produtos voltados ao público infantojuvenil.</p>',
    options: [
      { id: 'A', text: '«À medida que o mercado se expande, novos produtos surgem».', is_correct: false },
      { id: 'B', text: '«Mais do que passatempo, é estilo de vida».', is_correct: false },
      { id: 'C', text: '«Kidult é o adulto que se interessa por produtos infantojuvenis».', is_correct: false },
      { id: 'D', text: '«Colecionam brinquedos e quadrinhos que remetem à infância».', is_correct: false },
      {
        id: 'E',
        text: '«Estudos recentes indicam que esse hábito pode trazer bem-estar emocional».',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nem todo «que» é igual',
        chip_label: 'Função decide o tipo',
        meta: slideMeta,
        items: [
          {
            label: 'Substantiva objetiva direta',
            detail: '«Que» introduz o complemento do verbo — funciona como um substantivo (o quê?).',
            icon: 'CornerDownRight',
          },
          {
            label: 'Adjetiva (relativo)',
            detail: '«Que» retoma um substantivo antecedente — em C e D, «adulto» e «brinquedos».',
            icon: 'GitBranch',
          },
          {
            label: 'Locução adverbial',
            detail: '«À medida que» (A) e «mais do que» (B) são locuções fixas — não são «que» substantivo isolado.',
            icon: 'Link',
          },
          {
            label: 'Trecho-gabarito',
            detail: '«Estudos recentes indicam que esse hábito…» — verbo indicar pede complemento com «que».',
            icon: 'FileText',
          },
          {
            label: 'Pegadinha',
            detail: 'Toda oração com «que» parece igual — teste sempre o verbo antes: ele pede complemento?',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Verbo + que + conteúdo = substantiva objetiva direta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Kidults → cargo',
        meta: slideMeta,
        steps: [
          'Texto sobre kidults: comando pede o «que» que introduz oração-complemento de verbo (OD).',
          'A: «à medida que» é locução conjuntiva proporcional — adverbial, não substantiva.',
          'B: «mais do que» é locução comparativa — não é o «que» isolado pedido.',
          'C: «que se interessa» retoma «adulto» — é adjetiva (pronome relativo).',
          'D: «que remetem à infância» retoma «brinquedos e quadrinhos» — também adjetiva.',
          'E: «Estudos recentes indicam que esse hábito pode trazer benefícios» — «indicam» pede complemento; «que…» é o quê indicam → substantiva objetiva direta.',
          'Gabarito E. Em similares: teste se o verbo antes do «que» exige complemento direto (dizer, indicar, afirmar, achar).',
        ],
        footer_rule: 'Indicar + que = substantiva objetiva direta (OD do verbo).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Que substantivo × que relativo',
        meta: slideMeta,
        content: 'FUNÇÃO DO «QUE»',
        rows: [
          { label: 'Substantiva objetiva direta', value: 'Verbo de dizer/pensar/indicar + que + conteúdo = OD do verbo.' },
          { label: 'Adjetiva (relativo)', value: '«Que» retoma substantivo antecedente (adulto que…, brinquedos que…).' },
          { label: 'Locução conjuntiva', value: '«À medida que», «mais do que» — valor próprio, não «que» isolado.' },
          { label: 'Teste rápido', value: 'O quê ele indicou/disse/afirmou? → resposta = a própria oração com «que».' },
          { label: 'Nesta questão', value: 'indicam que… → substantiva objetiva direta (E)' },
        ],
        footer_rule: 'Pergunte «o quê?» ao verbo antes do «que».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada «que» tem uma função diferente',
        items: [
          {
            label: 'A — à medida que',
            detail: 'Tem «que», parece candidata direta.',
            correct: 'É locução conjuntiva proporcional — introduz adverbial, não substantiva objetiva.',
          },
          {
            label: 'B — mais do que',
            detail: 'Locução comparativa com «que» solto no meio.',
            correct: 'Valor comparativo fixo — não é o «que» substantivo pedido no comando.',
          },
          {
            label: 'C — adulto que se interessa',
            detail: '«Que» logo depois de substantivo parece igual ao de E.',
            correct: 'Retoma «adulto» — pronome relativo, introduz adjetiva, não substantiva.',
          },
          {
            label: 'D — brinquedos que remetem',
            detail: 'Mesma armadilha: «que» após substantivo plural.',
            correct: 'Retoma «brinquedos e quadrinhos» — adjetiva, não objetiva direta.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «indicam» por «afirmam» ou «revelam».',
            correct: 'Mesmo trilho: verbo de discurso + que + conteúdo = substantiva objetiva direta.',
          },
        ],
        footer_rule: 'E: «que» introduz substantiva objetiva direta.',
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
