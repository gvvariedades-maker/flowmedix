#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g15 (8 slugs · Colocação pronominal · lote 3).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g15.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g15 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g15 --strict
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_COLOCACAO_PRONOMINAL } from '@/lib/guidelines/linguaPortuguesa/colocacaoPronominal';

const LOTE = 'lingua-portuguesa-g15';
const SUBTOPICO = 'Pronomes e colocação pronominal';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_pronomes_colocacao';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-colocacao-trilho.json';

const PT_COLOCACAO_SOURCE = {
  id: PT_COLOCACAO_PRONOMINAL.id,
  tier: 'A' as const,
  issuer: PT_COLOCACAO_PRONOMINAL.issuer,
  title: PT_COLOCACAO_PRONOMINAL.title,
  year: PT_COLOCACAO_PRONOMINAL.year,
  url: PT_COLOCACAO_PRONOMINAL.url,
  covers: ['próclise', 'ênclise', 'mesóclise', 'atrativos', 'infinitivo', 'particípio', 'imperativo'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment' | 'certo_errado';

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
      reviewer: 'handcraft:lingua-portuguesa-g15',
      guideline_snapshot: `${PT_COLOCACAO_PRONOMINAL.snapshot} · âncora trilho → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      PT_COLOCACAO_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'âncora trilho'],
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

function loadAnchorSlides(): unknown[] {
  const anchorPath = resolve(process.cwd(), GOLDEN_REFERENCE);
  const anchor = JSON.parse(readFileSync(anchorPath, 'utf8')) as {
    reverse_study_slides: unknown[];
  };
  return anchor.reverse_study_slides;
}

const SPECS: Record<string, Spec> = {
  'fgv-ebserh-colocacao-deram-me-3385122': {
    family: 'conceito',
    source_tec_id: '3385122',
    source_note: 'Colocação Deram-me conforme — FGV Tec EBSERH Citopatologia 2025 tec 3385122',
    meta: {
      banca: 'FGV',
      prova: 'Tec (EBSERH Citopatologia)',
      orgao: 'EBSERH',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a frase em que a colocação do pronome oblíquo está correta.',
    options: [
      { id: 'A', text: 'Me mostraram a prova do crime.', is_correct: false },
      { id: 'B', text: 'Deram-me três dias de prazo.', is_correct: true },
      { id: 'C', text: 'Não deu-me a menor importância.', is_correct: false },
      { id: 'D', text: 'Quem viu-me fazer isso?', is_correct: false },
      { id: 'E', text: 'Ninguém observou-me durante a corrida.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cinco frases, um trilho',
        chip_label: 'Ênclise no início',
        meta: slideMeta,
        items: [
          { label: 'Me mostraram', detail: 'Início de frase → Deram-me, não Me mostraram.', icon: 'X' },
          { label: 'Deram-me', detail: 'Início sem atrativo → ênclise correta.', icon: 'Check' },
          { label: 'Não deu-me', detail: 'Não atrai → Não me deu.', icon: 'X' },
          { label: 'Quem viu-me', detail: 'Quem atrai → Quem me viu.', icon: 'X' },
          { label: 'Ninguém observou-me', detail: 'Ninguém atrai → Ninguém me observou.', icon: 'X' },
        ],
        footer_rule: 'Só Deram-me passa no trilho.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Teste frase a frase',
        meta: slideMeta,
        steps: [
          'Comando: qual frase tem colocação pronominal correta?',
          'A: «Me mostraram» — início de frase veta próclise → Mostraram-me.',
          'B: «Deram-me três dias» — início sem atrativo → ênclise conforme.',
          'C: «Não deu-me» — não atrai → Não me deu a menor importância.',
          'D: «Quem viu-me» — quem atrai → Quem me viu fazer isso?',
          'E: «Ninguém observou-me» — ninguém atrai → Ninguém me observou.',
          'Gabarito B — Deram-me três dias de prazo.',
        ],
        footer_rule: 'B = Deram-me (ênclise no início).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Início + atrativo',
        meta: slideMeta,
        content: 'TRILHO FGV',
        rows: [
          { label: 'Início de frase', value: 'Deram-me — ênclise' },
          { label: 'Não / Ninguém / Quem', value: 'próclise: não me / quem me' },
          { label: 'Proibido no início', value: 'Me mostraram' },
          { label: 'Nesta questão', value: 'B — Deram-me' },
        ],
        footer_rule: 'Sem atrativo no início → ênclise.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Atrativos ignorados',
        meta: slideMeta,
        content: 'Cada distrator troca o trilho',
        items: [
          { label: 'A — Me mostraram', detail: 'Próclise proibida no início.', correct: 'Mostraram-me a prova do crime.' },
          { label: 'C — Não deu-me', detail: 'Negação exige próclise.', correct: 'Não me deu a menor importância.' },
          { label: 'D — Quem viu-me', detail: 'Quem atrai o pronome.', correct: 'Quem me viu fazer isso?' },
          { label: 'E — Ninguém observou-me', detail: 'Ninguém é atrativo de próclise.', correct: 'Ninguém me observou durante a corrida.' },
          { label: 'Em outra banca…', detail: 'Trocam «Deram-me» por «Ofereceram-me».', correct: 'Mesmo trilho: início → ênclise.' },
        ],
        footer_rule: 'B passa: Deram-me três dias de prazo.',
      },
    ],
  },

  'vunesp-itapevi-colocacao-solidao-3419183': {
    family: 'text_fragment',
    source_tec_id: '3419183',
    source_note: 'Colocação reescrita solidão — VUNESP Ag Itapevi 2025 tec 3419183',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itapevi) Administração Pública',
      orgao: 'Pref. Itapevi',
      ano: '2025',
    },
    instruction:
      'Considere as seguintes frases:\n\nO especialista e seu grupo realizaram a pesquisa com 8 mil pacientes, e esta surpreendentemente mostrou a eles que a atividade física é fator primordial contra a solidão.\n\nEncontros com outras pessoas amenizam a sensação de isolamento, e é a prática esportiva que proporciona esses encontros com mais frequência.\n\nDe acordo com a norma-padrão de emprego e de colocação de pronomes, os trechos destacados devem ser substituídos por:',
    text_fragment:
      '<p><strong>A solidão nos ajudou a sobreviver — por que agora nos adoece?</strong> (adaptado de Leon Ferrari, Estadão)</p><p>A pesquisa, com mais de 8 mil pacientes, coordenada por Antonelli-Salgado, identificou efeitos protetores contra a solidão. Para a surpresa dos estudiosos, o mais importante foi a <strong>atividade física</strong>. Eles acreditam que a explicação é multifatorial.</p><p>A atividade física possibilita a reunião de pessoas que têm um interesse em comum e também pode ajudar na questão inflamatória do organismo. «À medida que fazemos atividade física, ficamos mais tranquilos, há diminuição da ansiedade e uma melhora da depressão», declarou o psiquiatra.</p>',
    options: [
      { id: 'A', text: 'os mostrou; proporciona-lhes', is_correct: false },
      { id: 'B', text: 'os mostrou; lhes proporciona', is_correct: false },
      { id: 'C', text: 'mostrou-lhes; os proporciona', is_correct: false },
      { id: 'D', text: 'lhes mostrou; proporciona-lhes', is_correct: false },
      { id: 'E', text: 'lhes mostrou; os proporciona', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois trechos, dois pronomes',
        meta: slideMeta,
        items: [
          { label: 'pesquisa / solidao', detail: '8 mil pacientes — atividade fisica contra solidao.', icon: 'Heart' },
          { label: 'mostrou a eles', detail: 'OI lhes → lhes mostrou (próclise).', icon: 'ArrowLeft' },
          { label: 'proporciona encontros', detail: 'OD os → os proporciona (próclise).', icon: 'ArrowLeft' },
          { label: 'proporciona-lhes', detail: 'Troca OD por OI — objeto são encontros.', icon: 'X' },
          { label: 'mostrou-lhes', detail: 'Ênclise após sujeito longo — banca prefere próclise.', icon: 'Ban' },
        ],
        footer_rule: 'E: lhes mostrou + os proporciona.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: pesquisa com pacientes sobre solidao — atividade fisica protetora.',
          'Trecho 1: «mostrou a eles» → pronome lhes, próclise: lhes mostrou.',
          'Trecho 2: «proporciona esses encontros» → pronome os, próclise: os proporciona.',
          'A/D: «proporciona-lhes» — OI onde o original pede OD (encontros).',
          'B/C: misturam ênclise ou os/lhes trocados.',
          'E reúne: lhes mostrou; os proporciona.',
          'Gabarito E.',
        ],
        footer_rule: 'E = lhes mostrou; os proporciona.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LHEs + OS',
        rows: [
          { label: 'a eles', value: 'lhes mostrou — próclise' },
          { label: 'esses encontros', value: 'os proporciona — próclise' },
          { label: '≠ lhes (2º trecho)', value: 'encontros = os, não lhes' },
          { label: 'Nesta questão', value: 'E' },
        ],
        footer_rule: 'OI lhes + OD os, ambos enclíticos antes.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar os por lhes',
        items: [
          { label: 'A — proporciona-lhes', detail: 'Segundo trecho pede os (encontros).', correct: '…os proporciona esses encontros.' },
          { label: 'B — os mostrou; lhes proporciona', detail: 'Primeiro trecho: a eles = lhes, não os.', correct: 'lhes mostrou que a atividade…' },
          { label: 'C — mostrou-lhes; os proporciona', detail: 'Primeiro: ênclise inadequada; segundo ok.', correct: 'lhes mostrou + os proporciona.' },
          { label: 'D — lhes mostrou; proporciona-lhes', detail: 'Segundo trecho troca OD por OI.', correct: 'os proporciona, não proporciona-lhes.' },
          { label: 'Em outra banca…', detail: 'Trocam «encontros» por «benefícios».', correct: 'Mesmo trilho: lhes (a eles) + os (objeto direto).' },
        ],
        footer_rule: 'E passa: lhes mostrou; os proporciona.',
      },
    ],
  },

  'avancasp-morungaba-colocacao-tipo-i-ii-iii-3452377': {
    family: 'conceito',
    source_tec_id: '3452377',
    source_note: 'Colocação tipos I II III — AVANÇASP ACS Morungaba 2025 tec 3452377',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Morungaba)',
      orgao: 'Pref. Morungaba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Quanto à posição dos pronomes oblíquos átonos em relação ao verbo, pode ocorrer próclise se o pronome estiver antes do verbo, mesóclise se estiver intercalado com o verbo e ênclise se estiver depois do verbo.\n\nAssim, relacione cada frase à sua correta colocação pronominal:\n\nI. Adiantei-me demais, por isso tive que ficar esperando.\nII. Recusar-me-ei a tal atitude!\nIII. Quem te avisou sobre a mudança de local?\n\na) Ênclise\nb) Próclise\nc) Mesóclise\n\nIndique a alternativa que estabelece as relações corretamente.',
    options: [
      { id: 'A', text: 'I – b; II – c; III – a.', is_correct: false },
      { id: 'B', text: 'I – a; II – c; III – b.', is_correct: true },
      { id: 'C', text: 'I – c; II – a; III – b.', is_correct: false },
      { id: 'D', text: 'I – a; II – b; III – c.', is_correct: false },
      { id: 'E', text: 'I – b; II – a; III – c.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três tipos, três frases',
        meta: slideMeta,
        items: [
          { label: 'I — Adiantei-me', detail: 'Pronome após o verbo → ênclise (a).', icon: 'ArrowRight' },
          { label: 'II — Recusar-me-ei', detail: 'Pronome no meio do futuro → mesóclise (c).', icon: 'Split' },
          { label: 'III — Quem te avisou', detail: 'Quem atrai → próclise (b).', icon: 'ArrowLeft' },
          { label: 'Gabarito', detail: 'I–a; II–c; III–b.', icon: 'Link' },
        ],
        footer_rule: 'B = I–a; II–c; III–b.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Legenda: a = ênclise; b = próclise; c = mesóclise.',
          'I: «Adiantei-me» — me depois do verbo → ênclise → a.',
          'II: «Recusar-me-ei» — me intercalado no futuro → mesóclise → c.',
          'III: «Quem te avisou» — quem atrai te antes do verbo → próclise → b.',
          'Relação correta: I–a; II–c; III–b.',
          'Gabarito B.',
        ],
        footer_rule: 'B estabelece I–a; II–c; III–b.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'A · B · C',
        rows: [
          { label: 'Ênclise (a)', value: 'Adiantei-me — pronome depois' },
          { label: 'Mesóclise (c)', value: 'Recusar-me-ei — futuro' },
          { label: 'Próclise (b)', value: 'Quem te avisou — atrativo' },
          { label: 'Nesta questão', value: 'B — I–a; II–c; III–b' },
        ],
        footer_rule: 'Identifique posição do átono em cada frase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar mesóclise por ênclise',
        items: [
          { label: 'A — I–b; III–a', detail: 'Inverte I (ênclise) e III (próclise).', correct: 'I é ênclise; III é próclise.' },
          { label: 'C — II–a', detail: 'Recusar-me-ei é mesóclise, não ênclise.', correct: 'II → c (mesóclise no futuro).' },
          { label: 'D — II–b', detail: 'Futuro com mesóclise, não próclise pura.', correct: 'Recusar-me-ei = mesóclise.' },
          { label: 'E — I–b; II–a', detail: 'Dupla inversão em I e II.', correct: 'I–a; II–c; III–b.' },
          { label: 'Em outra banca…', detail: 'Trocam «Recusar-me-ei» por «Dir-me-á».', correct: 'Mesmo teste: posição do átono.' },
        ],
        footer_rule: 'B passa: I–a; II–c; III–b.',
      },
    ],
  },

  'avancasp-caconde-colocacao-vista-cansada-3457294': {
    family: 'text_fragment',
    source_tec_id: '3457294',
    source_note: 'Colocação Resende Vista cansada — AVANÇASP Ag Caconde 2025 tec 3457294',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref Caconde) Administrativo',
      orgao: 'Pref. Caconde',
      ano: '2025',
    },
    instruction:
      'As colocações pronominais em «Dava-lhe bom-dia e às vezes lhe passava um recado ou uma correspondência» correspondem, respectivamente, a:',
    text_fragment:
      '<p><strong>Vista cansada</strong> — Otto Lara Resende (Folha de S.Paulo, 1992 — adaptado)</p><p>O diabo é que, de tanto ver, a gente banaliza o olhar. Vê e não vê. O que nos cerca, o que nos é familiar, já não desperta curiosidade.</p><p>Sei de um profissional que passou 32 anos a fio pelo mesmo hall do prédio do seu escritório. Lá estava sempre, pontualíssimo, o mesmo porteiro. <strong>Dava-lhe bom-dia e às vezes lhe passava um recado ou uma correspondência.</strong> Um dia o porteiro cometeu a descortesia de falecer. Como era ele? Sua cara? Sua voz? Em 32 anos, nunca o viu.</p><p>O hábito suja os olhos. Uma criança vê o que o adulto não vê. É por aí que se instala no coração o monstro da indiferença.</p>',
    options: [
      { id: 'A', text: 'mesóclise e próclise.', is_correct: false },
      { id: 'B', text: 'próclise e mesóclise.', is_correct: false },
      { id: 'C', text: 'próclise e ênclise.', is_correct: false },
      { id: 'D', text: 'ênclise e mesóclise.', is_correct: false },
      { id: 'E', text: 'ênclise e próclise.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Porteiro: lhe duas vezes',
        meta: slideMeta,
        items: [
          { label: 'Dava-lhe', detail: 'Pronome após o verbo → ênclise.', icon: 'ArrowRight' },
          { label: 'lhe passava', detail: 'Pronome antes do verbo → próclise.', icon: 'ArrowLeft' },
          { label: 'Vista cansada', detail: 'Crônica Resende — banaliza o olhar; porteiro 32 anos.', icon: 'Eye' },
          { label: 'curiosidade', detail: 'O familiar já não desperta curiosidade.', icon: 'BookOpen' },
          { label: 'Par E', detail: 'ênclise + próclise — gabarito.', icon: 'Check' },
        ],
        footer_rule: 'E = ênclise e próclise.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Vista cansada (Resende): banaliza o olhar; porteiro 32 anos.',
          'Trecho: «Dava-lhe bom-dia e às vezes lhe passava um recado».',
          '1º: «Dava-lhe» — lhe colado ao verbo → ênclise.',
          '2º: «lhe passava» — lhe antes do verbo → próclise.',
          'Mesóclise não aparece (sem futuro/composto no trecho).',
          'Gabarito E — ênclise e próclise.',
        ],
        footer_rule: 'E = ênclise (Dava-lhe) + próclise (lhe passava).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LHE · LHE',
        rows: [
          { label: 'Dava-lhe', value: 'ênclise — pronome depois' },
          { label: 'lhe passava', value: 'próclise — pronome antes' },
          { label: '≠ mesóclise', value: 'não há pronome no meio do verbo' },
          { label: 'Nesta questão', value: 'E — ênclise e próclise' },
        ],
        footer_rule: 'Mesmo pronome, posições diferentes.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Mesóclise onde não cabe',
        items: [
          { label: 'A — mesóclise e próclise', detail: 'Dava-lhe não é mesóclise.', correct: 'Dava-lhe = ênclise simples.' },
          { label: 'B — próclise e mesóclise', detail: 'Inverte o primeiro trecho.', correct: 'Dava-lhe é ênclise, não próclise.' },
          { label: 'C — próclise e ênclise', detail: 'Inverte a ordem dos tipos.', correct: '1º ênclise; 2º próclise.' },
          { label: 'D — ênclise e mesóclise', detail: 'Segundo trecho é próclise.', correct: 'lhe passava — pronome antes.' },
          { label: 'Em outra banca…', detail: 'Trocam «Dava-lhe» por «Entregava-lhe».', correct: 'Mesmo trilho: verbo-lhe = ênclise.' },
        ],
        footer_rule: 'E passa: ênclise e próclise.',
      },
    ],
  },

  'idecan-sesap-colocacao-arroz-3531587': {
    family: 'text_fragment',
    source_tec_id: '3531587',
    source_note: 'Colocação nos deparamos se debruça — IDECAN ATAS SESAP RN 2025 tec 3531587',
    meta: {
      banca: 'IDECAN',
      prova: 'ATAS (SESAP RN) Administrativa',
      orgao: 'SESAP RN',
      ano: '2025',
    },
    instruction:
      'Levando em consideração os elementos destacados no trecho do texto: «Afinal, os arredores tiveram papel fundamental no Ciclo do Café e hoje nos deparamos com um polo tecnológico que se debruça também em pesquisas de alimentos.», podemos considerar de acordo com as regras de posicionamento dos pronomes que:',
    text_fragment:
      '<p><strong>Vale do Paraíba tem relação cultural com o arroz</strong> (CNN Viagem &amp; Gastronomia — adaptado)</p><p>Em Guaratinguetá, plantações de arroz provam que o alimento, além de elementar na mesa do brasileiro, tem diferentes variedades, sabores e usos. Na busca pelos sabores do Brasil, a viagem pelo Sudeste nos presenteia com torresmo crocante, queijos maturados e vinhos de terras antes consideradas improváveis.</p><p>O Vale do Paraíba, entre a Mantiqueira e o Mar, apoia-se na tradição alimentar como traço identitário. <strong>Afinal, os arredores tiveram papel fundamental no Ciclo do Café e hoje nos deparamos com um polo tecnológico que se debruça também em pesquisas de alimentos.</strong> Na cidade de Guaratinguetá, isso se traduz em plantações de arroz, um dos símbolos mais fortes do Brasil.</p>',
    options: [
      { id: 'A', text: 'os pronomes estão equivocadamente posicionados.', is_correct: false },
      { id: 'B', text: 'o primeiro átono «nos» está correto, mas o pronome «se» está equivocado.', is_correct: false },
      { id: 'C', text: 'o primeiro átono «nos» está equivocado, mas o pronome «se» está correto.', is_correct: false },
      { id: 'D', text: 'os dois pronomes não são átonos.', is_correct: false },
      { id: 'E', text: 'os pronomes estão corretamente posicionados.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nos + se no mesmo trecho',
        meta: slideMeta,
        items: [
          { label: 'nos deparamos', detail: 'Reflexivo/recíproco: próclise natural.', icon: 'Check' },
          { label: 'que se debruça', detail: 'Que atrai se → próclise correta.', icon: 'Check' },
          { label: 'guaratingueta / arroz', detail: 'Plantacoes de arroz — simbolo forte do Brasil.', icon: 'Wheat' },
          { label: 'polo tecnologico', detail: 'Arredores: nos deparamos; que se debruça.', icon: 'Building' },
        ],
        footer_rule: 'Ambos os pronomes conformes.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto CNN: guaratingueta, plantacoes de arroz e polo tecnologico.',
          'Trecho: «nos deparamos com um polo… que se debruça».',
          '«nos deparamos» — construção pronominal reflexiva/recíproca em próclise.',
          '«que se debruça» — que atrai o se → próclise obrigatória.',
          'Nenhum dos dois está mal posicionado.',
          'Gabarito E — pronomes corretamente posicionados.',
        ],
        footer_rule: 'E = ambos corretos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOIS ÁTONOS OK',
        rows: [
          { label: 'nos deparamos', value: 'próclise reflexiva/recíproca' },
          { label: 'que se debruça', value: 'que atrai → próclise' },
          { label: '≠ deparamo-nos', value: 'forma enclítica não exigida aqui' },
          { label: 'Nesta questão', value: 'E — ambos corretos' },
        ],
        footer_rule: 'Nos e se em próclise conforme.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Achar erro onde não há',
        items: [
          { label: 'A — equivocados', detail: 'Ambas colocações estão conformes.', correct: 'nos deparamos + que se debruça — ok.' },
          { label: 'B — se errado', detail: 'Que exige próclise do se.', correct: '…que se debruça — correto.' },
          { label: 'C — nos errado', detail: 'Nos deparamos é forma aceita.', correct: 'Próclise do nos na locução.' },
          { label: 'D — não são átonos', detail: 'nos e se são oblíquos átonos.', correct: 'São pronomes átonos sim.' },
          { label: 'Em outra banca…', detail: 'Trocam «se debruça» por «se dedica».', correct: 'Mesmo trilho: que → próclise.' },
        ],
        footer_rule: 'E passa: pronomes corretamente posicionados.',
      },
    ],
  },

  'avancasp-vinhedo-colocacao-jamais-3554847': {
    family: 'conceito',
    source_tec_id: '3554847',
    source_note: 'Colocação I II III jamais — AVANÇASP ACD Vinhedo 2025 tec 3554847',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACD (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em língua portuguesa, o pronome pode ser colocado antes do verbo, intercalado com o verbo ou depois do verbo, de acordo com regras gramaticais. Analise a colocação pronominal nas frases das assertivas a seguir.\n\nI. «Jamais nos calaremos diante de tais injustiças!»\nII. «Alegravam-se apenas aos domingos.»\nIII. «Ficou alerta ao aviso que deram-lhe.»\n\nAssinale a alternativa correta:',
    options: [
      { id: 'A', text: 'I, II e III estão corretas.', is_correct: false },
      { id: 'B', text: 'Apenas I e II estão corretas.', is_correct: true },
      { id: 'C', text: 'Apenas II e III estão corretas.', is_correct: false },
      { id: 'D', text: 'Apenas I e III estão corretas.', is_correct: false },
      { id: 'E', text: 'Apenas I está correta.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Três assertivas, duas certas',
        meta: slideMeta,
        items: [
          { label: 'I — jamais nos', detail: 'Jamais atrai → próclise correta.', icon: 'Check' },
          { label: 'II — alegravam-se', detail: 'Reflexo enclítico → conforme.', icon: 'Check' },
          { label: 'III — deram-lhe', detail: 'Que atrai → que lhe deram.', icon: 'X' },
          { label: 'Só I e II', detail: 'III troca próclise por ênclise após que.', icon: 'Filter' },
        ],
        footer_rule: 'B = Apenas I e II corretas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quais assertivas têm colocação correta?',
          'I: «Jamais nos calaremos» — jamais atrai → próclise → CERTA.',
          'II: «Alegravam-se» — reflexo enclítico → CERTA.',
          'III: «que deram-lhe» — que atrai → que lhe deram → ERRADA.',
          'Corretas: I e II apenas.',
          'Gabarito B — Apenas I e II estão corretas.',
        ],
        footer_rule: 'B = I e II conformes; III errada.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'JAMAIS · SE · QUE',
        rows: [
          { label: 'I — jamais nos', value: 'próclise — atrativo' },
          { label: 'II — alegravam-se', value: 'ênclise reflexiva ok' },
          { label: 'III — deram-lhe', value: 'que lhe deram — próclise' },
          { label: 'Nesta questão', value: 'B — só I e II' },
        ],
        footer_rule: 'Que barra deram-lhe após o relativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Salvar III como correta',
        items: [
          { label: 'A — I, II e III', detail: 'III está errada.', correct: '…que lhe deram o aviso.' },
          { label: 'C — II e III', detail: 'III troca próclise por ênclise.', correct: 'Que exige lhe antes do verbo.' },
          { label: 'D — I e III', detail: 'III não passa no trilho.', correct: 'Só I e II corretas.' },
          { label: 'E — só I', detail: 'II alegravam-se também está conforme.', correct: 'Ênclise reflexiva em II.' },
          { label: 'Em outra banca…', detail: 'Trocam «deram-lhe» por «lhe deram».', correct: 'Mesmo teste: que → próclise.' },
        ],
        footer_rule: 'B passa: Apenas I e II corretas.',
      },
    ],
  },

  'vunesp-osasco-colocacao-cerebro-3558396': {
    family: 'text_fragment',
    source_tec_id: '3558396',
    source_note: 'Colocação reescrita cérebro — VUNESP RO SAMU Osasco 2025 tec 3558396',
    meta: {
      banca: 'VUNESP',
      prova: 'RO (SAMU Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que a expressão entre colchetes substitui a destacada conforme a norma-padrão de colocação pronominal.',
    text_fragment:
      '<p><strong>Pequenas coisas que os neurologistas gostariam que você fizesse pelo seu cérebro</strong> (adaptado de Mohana Ravindranath, Estadão)</p><p>Pequenas mudanças na sua rotina diária podem <strong>contribuir muito</strong> para proteger o centro de controle do seu corpo e prevenir o declínio cognitivo. Os cientistas acreditam que até 45% dos casos de demência poderiam ser adiados com mudanças simples no comportamento.</p><p>O exercício beneficia o cérebro ao aumentar o fluxo sanguíneo. Reduzir o tempo sentado também pode <strong>oferecer</strong> vantagens, comenta Kevin Bickart (UCLA). A higiene bucal previne infecções: infecções orais podem <strong>se espalhar</strong> para os seios da face. Pesquisas ligam poluição do ar ao declínio cognitivo.</p>',
    options: [
      {
        id: 'A',
        text: 'Pequenas mudanças na sua rotina diária podem contribuir muito [mostram-se muito eficientes] para proteger o centro de controle do seu corpo…',
        is_correct: true,
      },
      {
        id: 'B',
        text: 'Reduzir o tempo que você passa sentado ou inativo também pode oferecer [oferece-lhe] algumas dessas vantagens…',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Infecções orais podem se espalhar [provavelmente espalham-se] para os seios da face…',
        is_correct: false,
      },
      {
        id: 'D',
        text: '… poluição do ar está ligada [ainda associa-se] ao declínio cognitivo.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Usar [Se valer de] uma máscara N95 ou cirúrgica e utilizar filtros de ar internos…',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Substituição no trilho',
        meta: slideMeta,
        items: [
          { label: 'pequenas coisas / cerebro', detail: 'Neurologistas — mudancas na rotina diaria.', icon: 'Brain' },
          { label: 'neurologistas / cognitivo', detail: 'Declinio cognitivo — contribuir muito.', icon: 'Activity' },
          { label: 'contribuir muito', detail: 'Substituir por mostram-se — ênclise reflexiva.', icon: 'Check' },
          { label: 'oferece-lhe', detail: 'Sem OI «lhe» no original.', icon: 'X' },
          { label: 'espalham-se', detail: 'Provavelmente atrai → provavelmente se espalham.', icon: 'X' },
          { label: 'Se valer de', detail: 'Início de oração → Valer-se de.', icon: 'X' },
        ],
        footer_rule: 'A: mostram-se muito eficientes.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: pequenas coisas que neurologistas recomendam para o cerebro.',
          'Comando: qual colchete substitui o destacado com colocação correta?',
          'A: «contribuir muito» → [mostram-se muito eficientes] — se enclítico ok.',
          'B: [oferece-lhe] — inventa OI; original não tem lhe.',
          'C: [provavelmente espalham-se] — advérbio atrai → se espalham.',
          'D/E: associa-se e Se valer de — colocação inadequada ao contexto.',
          'Gabarito A.',
        ],
        footer_rule: 'A = mostram-se muito eficientes.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SUBSTITUIÇÃO A',
        rows: [
          { label: 'A — mostram-se', value: 'ênclise reflexiva/passiva' },
          { label: 'B — oferece-lhe', value: 'lhe sem base no texto' },
          { label: 'C — espalham-se', value: 'provavelmente se espalham' },
          { label: 'Nesta questão', value: 'A' },
        ],
        footer_rule: 'Só A mantém colocação conforme.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Colchetes com atrativo ignorado',
        items: [
          { label: 'B — oferece-lhe', detail: 'Original: «oferecer vantagens» — sem lhe.', correct: 'Não há pronome indireto a encliticar.' },
          { label: 'C — espalham-se', detail: 'Provavelmente exige próclise.', correct: '…provavelmente se espalham para…' },
          { label: 'D — associa-se', detail: 'Construção ligada ≠ associa-se.', correct: 'Regência e colocação não batem.' },
          { label: 'E — Se valer de', detail: 'Próclise no início de oração.', correct: 'Valer-se de uma máscara…' },
          { label: 'Em outra banca…', detail: 'Trocam «mostram-se» por «mostram-nos».', correct: 'Teste: colocação do se/me/nos.' },
        ],
        footer_rule: 'A passa: mostram-se muito eficientes.',
      },
    ],
  },

  'vunesp-itatiba-colocacao-carnaval-3583308': {
    family: 'text_fragment',
    source_tec_id: '3583308',
    source_note: 'Colocação gerúndio Carnaval — VUNESP Ag Itatiba 2025 tec 3583308',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itatiba) Fiscal Ambiental',
      orgao: 'Pref. Itatiba',
      ano: '2025',
    },
    instruction:
      'Assinale a alternativa em que a expressão destacada pode ser substituída pela que está entre colchetes, preservando-se a norma-padrão de colocação pronominal.',
    text_fragment:
      '<p><strong>Carnaval antigo</strong> — Antônio Maria (Recife, 1968 — adaptado)</p><p>No Recife, o Carnaval começava no Natal. A 24 de dezembro, os blocos saíam às ruas, com orquestras de metais e coros de vozes sofridas. Chamavam-se «jornadas» alguns dos cantos carnavalescos, talvez por influência das jornadas dos pastoris.</p><p>Mas, na noite de 24 de dezembro, quando a gente pensava que seria uma noite silenciosa, o Vassourinhas estourava numa esquina, <strong>nos acordando</strong>, na alma, uma alegria guerreira. Nós íamos, primeiro, às janelas, depois para a rua, até que afinal nos misturávamos ao povo.</p><p>Não se pode fazer ideia do que era o povo solto nas ruas do Recife. Os meus carnavais eram revoltados — revolta e amor — porque só de amor se cometem os gestos de rebeldia.</p>',
    options: [
      {
        id: 'A',
        text: 'Chamavam-se [Se chamavam] «jornadas» alguns dos cantos carnavalescos do Recife… (2º parágrafo)',
        is_correct: false,
      },
      {
        id: 'B',
        text: '… o Vassourinhas estourava numa esquina, nos acordando [acordando-nos], na alma… (3º parágrafo)',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Nós íamos, primeiro, às janelas, depois para a rua, até que afinal nos misturávamos [misturávamo-nos] ao povo… (3º parágrafo)',
        is_correct: false,
      },
      {
        id: 'D',
        text: '«Não se pode [pode-se] fazer ideia do que era o povo solto nas ruas do Recife…» (4º parágrafo)',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Não sei de lembrança que me comova [comova-me] tão profundamente. (6º parágrafo)',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gerúndio enclítico',
        meta: slideMeta,
        items: [
          { label: 'nos acordando', detail: 'Próclise no gerúndio — alternativa enclítica.', icon: 'ArrowLeft' },
          { label: 'acordando-nos', detail: 'Ênclise no gerúndio — forma conforme.', icon: 'Check' },
          { label: 'Vassourinhas', detail: 'Bloco de Carnaval recifense na véspera de Natal.', icon: 'Music' },
          { label: 'Se chamavam', detail: 'Passiva com se — não substitui Chamavam-se.', icon: 'X' },
        ],
        footer_rule: 'B: acordando-nos = ênclise no gerúndio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Antônio Maria: Carnaval do Recife, Vassourinhas, revolta.',
          'Comando: qual colchete substitui o destacado com colocação correta?',
          'Trecho: «nos acordando» — gerúndio com pronome enclítico ou proclítico.',
          'B: [acordando-nos] — ênclise no gerúndio, equivalente normativa.',
          'A: [Se chamavam] — altera voz/passiva; C: mesóclise estranha em misturávamo-nos.',
          'D: pode-se no início; E: que atrai → me comova, não comova-me.',
          'Gabarito B.',
        ],
        footer_rule: 'B = acordando-nos (ênclise).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GERÚNDIO + NOS',
        rows: [
          { label: 'nos acordando', value: 'próclise no gerúndio' },
          { label: 'acordando-nos', value: 'ênclise no gerúndio — ok' },
          { label: 'que me comova', value: 'próclise — não comova-me' },
          { label: 'Nesta questão', value: 'B — acordando-nos' },
        ],
        footer_rule: 'Gerúndio admite ênclise: acordando-nos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras substituições inválidas',
        items: [
          { label: 'A — Se chamavam', detail: 'Muda construção de Chamavam-se.', correct: 'Passiva reflexiva ≠ se chamavam.' },
          { label: 'C — misturávamo-nos', detail: 'Mesóclise/hífen inadequado.', correct: 'nos misturávamos ou misturando-nos.' },
          { label: 'D — pode-se', detail: 'Início com se impessoal enclítico.', correct: 'Não se pode — próclise fixa.' },
          { label: 'E — comova-me', detail: 'Que atrai me antes do verbo.', correct: '…que me comova tão profundamente.' },
          { label: 'Em outra banca…', detail: 'Trocam «acordando-nos» por «acordando-me».', correct: 'Mesmo trilho: gerúndio enclítico.' },
        ],
        footer_rule: 'B passa: acordando-nos na alma.',
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
